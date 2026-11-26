# litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range

## Resumen

MediaPipe FaceDetector BlazeFace Full-Range es un detector facial de una sola etapa (single-shot) empaquetado como modelo LiteRT/TFLite para la tarea `FaceDetector` de MediaPipe. Lo publica la organizacion `litert-community` en Hugging Face, aunque el modelo subyacente es de Google (MediaPipe) y se distribuye bajo licencia Apache 2.0. Resuelve la deteccion de rostros en imagenes de camara de smartphone de rango completo (hasta aproximadamente 5 metros), incluyendo rostros pequenos o lejanos tipicos de camaras traseras.

La arquitectura es una CNN tipo CenterNet con encoder personalizado (BlazeFace), con pesos en FP16 y un tamano de fichero de 1,08 MB. La entrada es un tensor `[1, 192, 192, 3]` float32 RGB normalizado a `[-1.0, 1.0]`; la salida son predicciones crudas de anclas que la tarea MediaPipe decodifica y filtra con NMS para devolver cajas, 6 keypoints faciales y una puntuacion de confianza.

Es relevante porque ofrece deteccion facial on-device (Android, iOS, web, Python, Flutter) con un coste computacional minimo y sin dependencia de servidor, lo que encaja en pipelines de vision en tiempo real y en aplicaciones con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo CenterNet con encoder personalizado (BlazeFace) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | pesos en float16 (FP16); no se documentan otras variantes |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`blaze_face_full_range.tflite`) |
| Entrada | `[1, 192, 192, 3]` float32 RGB, normalizacion mean=127.5, std=127.5 |
| Salidas | `reshaped_regressor_face_4` `[1, 2304, 16]` y `reshaped_classifier_face_4` `[1, 2304, 1]` |
| Tamano del fichero | 1,08 MB (1.083.786 bytes) |
| SHA-256 | `3698b18f063835bc609069ef052228fbe86d9c9a6dc8dcb7c7c2d69aed2b181b` |
| Pipeline | object-detection |
| Libreria | litert |

## Arquitectura y entrenamiento

BlazeFace Full-Range emplea una arquitectura convolucional tipo CenterNet con un encoder disenado especificamente para detectar rostros pequenos o lejanos, en contraste con las variantes de corto alcance pensadas para selfies. El modelo produce predicciones sobre 2304 anclas: un regresor que estima cajas y keypoints (16 valores por ancla) y un clasificador que asigna una puntuacion a cada ancla. La tarea `FaceDetector` de MediaPipe se encarga de decodificar esas predicciones y aplicar Non-Maximum Suppression.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a un detector de objetos). Tampoco se especifica el numero de parametros del modelo. La innovacion tecnica destacable es el diseno orientado a rango completo (hasta aproximadamente 5 metros) y el empaquetado como modelo LiteRT/TFLite con pesos FP16 para inferencia on-device en movil y web, con metadatos TFLITE embebidos (nombre `Full Range Face Detection`).

## Capacidades

- Deteccion de rostros en imagenes con un unico forward pass (single-shot).
- Devolucion de caja delimitadora alineada con los ejes en pixeles (`origin_x`, `origin_y`, `width`, `height`).
- Prediccion de 6 keypoints faciales aproximados normalizados a `[0.0, 1.0]`: `left_eye`, `right_eye`, `nose_tip`, `mouth`, `left_eye_tragion`, `right_eye_tragion` (desde la perspectiva del observador).
- Puntuacion de confianza de deteccion en `[0.0, 1.0]`.
- Umbral de confianza minima configurable (`min_detection_confidence`).
- Modos de ejecucion de MediaPipe (`IMAGE`, y los que exponga la tarea `VisionRunningMode`).
- Ejecucion on-device en Android, iOS, web (JavaScript/TypeScript), Python y Flutter.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Desbloqueo y autenticacion facial en movil: el modelo detecta el rostro y sus keypoints para alinear y recortar la region antes de pasarla a un verificador biometrico, con inferencia local sin enviar imagenes a servidores.
- Fotografia computacional en camara trasera: deteccion de rostros a hasta aproximadamente 5 metros para enfoque automatico, exposicion o encuadre en apps de camara Android/iOS.
- Preprocesado en pipelines de vision: localizar rostros antes de tareas posteriores (reconocimiento de emociones, estimacion de pose, seguimiento) gracias a las cajas y keypoints devueltos.
- Moderacion y analitica de contenido en el dispositivo: contar o localizar rostros en imagenes capturadas por el usuario sin subirlas a la nube, reduciendo riesgos de privacidad.
- Aplicaciones web en tiempo real: integracion via JavaScript/TypeScript en el navegador (demo web de MediaPipe) para deteccion facial en streaming de webcam.
- Apps Flutter multiplataforma: deteccion facial en Android, iOS y web con un unico modelo de 1,08 MB, adecuado para apps con presupuesto de almacenamiento y memoria muy ajustado.
- Investigacion y prototipado rapido: uso en notebooks Python (Colab) para experimentar con deteccion facial sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 1,08 MB en FP16 y opera sobre entradas de 192x192x3; el consumo de memoria es minimo y no requiere GPU dedicada.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU y aceleradores moviles (NPU/DSP via LiteRT, GPU movil opcional).
- Cabe en cualquier GPU consumer e incluso en dispositivos moviles de gama baja; no se documentan requisitos especificos.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter) sobre LiteRT/TFLite; el fichero `.tflite` puede cargarse directamente con el runtime LiteRT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe BlazeFace Full-Range (este) | no disponible (1,08 MB FP16) | 192x192x3 | rango completo (~5 m) | Apache 2.0 | Hugging Face, LiteRT/MediaPipe |
| MediaPipe BlazeFace short-range | no disponible | no disponible | rostros cercanos (selfie) | Apache 2.0 | MediaPipe |
| Otras alternativas (p. ej. detectores faciales genericos) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas de las alternativas como para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de vision sin capacidades de lenguaje, razonamiento ni tool calling; no debe evaluarse como un LLM.
- Los keypoints son aproximados (6 puntos) y no sustituyen a un modelo de malla facial completa.
- El rango de diseno es hasta aproximadamente 5 metros; el rendimiento fuera de ese rango o con rostros muy pequenos no esta documentado.
- No se documentan sesgos demograficos, de iluminacion ni de oclusion; conviene validar en el dominio de despliegue.
- Riesgo de falsos positivos y negativos segun el umbral `min_detection_confidence`; requiere calibracion.
- No se especifican limitaciones de idioma (no aplica) ni de contexto.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de MediaPipe/LiteRT y de los datasets de entrenamiento originales (no documentados aqui).
- No se detallan los datos de entrenamiento, lo que limita la evaluacion de riesgos de sesgo y generalizacion.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range/blob/main/blaze_face_full_range.tflite
- Documentacion MediaPipe Face Detector: https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
- LiteRT: https://developers.google.com/edge/litert
- Paper BlazeFace (arXiv:1907.05047): https://arxiv.org/abs/1907.05047
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/ios
- Ejemplo Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/face_detector/python/face_detector.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/face-detector.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/face_detector
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_detector
- Guias de setup: Python https://developers.google.com/edge/mediapipe/solutions/setup_python · Web https://developers.google.com/edge/mediapipe/solutions/setup_web · Android https://developers.google.com/edge/mediapipe/solutions/setup_android · iOS https://developers.google.com/edge/mediapipe/solutions/setup_ios · Flutter https://developers.google.com/edge/mediapipe/solutions/setup_flutter
