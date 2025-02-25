import log from 'electron-log';
import * as admin from "firebase-admin";
import { itemIsTimestamp } from "firestore-serializers";

export const prettifyPath = (path: string): string => {
  // A Good path is: Start with `/` and end without `/`
  let prettiedPath = path;
  if (prettiedPath.endsWith("/")) {
    prettiedPath.slice(0, -1);
  }

  if (!prettiedPath.startsWith("/")) {
    prettiedPath = "/" + prettiedPath;
  }

  return prettiedPath;
};

export const getPathEntities = (path: string): string[] => {
  const entities = prettifyPath(path).split("/");
  return entities.filter((entity) => entity !== "");
};

export const getParentPath = (url: string) => {
  const entities = prettifyPath(url).split("/");
  entities.pop();

  return prettifyPath(entities.join("/"));
};

export const isRangeFilter = (operator: string) => {
  return ["<", "<=", ">", ">="].includes(operator)
}

export const parseEmulatorConnection = (connectionString: string) => {
  const [connection, projectId] = connectionString.split("_connect_");
  const [host, port] = connection.split(':');
  if (!host || !port) {
    throw new Error('The right connection format is host:port. Eg: 127.0.0.1:8080')
  }
  return { host, port, projectId }
}

export const convertFirebaseType = (input: any): any => {
  if (Array.isArray(input)) {
    return input.map(row => convertFirebaseType(row));
  }

  if (input.seconds && input.nanoseconds && !Number.isNaN(input.seconds) && !Number.isNaN(input.nanoseconds)) {
    return new admin.firestore.Timestamp(input.seconds, input.nanoseconds)
  }

  return input;
}