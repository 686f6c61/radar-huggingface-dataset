# litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range-Sparse

## Resumen

MediaPipe BlazeFace Full-Range Sparse es un detector facial de una sola etapa (single-shot) empaquetado como modelo LiteRT/TFLite para la tarea `FaceDetector` de MediaPipe. Lo publica la comunidad `litert-community` a partir del modelo original de Google (referenciado en el paper arXiv:1907.05047, "BlazeFace: Sub-millisecond Neural Face Detection on Mobile GPUs") y esta pensado para inferencia on-device en Android, iOS, web, Python y Flutter. El artefacto principal, `blaze_face_full_range_sparse.tflite`, ocupa 676,7 KB con pesos en FP16.

La variante "full-range" cubre imagenes de camaras traseras de smartphone a distancias de hasta aproximadamente 5 metros, a diferencia de las variantes de corto alcance orientadas a selfies. La innovacion respecto al BlazeFace denso es la aplicacion de poda estructural: aproximadamente el 70 % de ceros en la mayoria de convoluciones `1x1`, lo que reduce el tamano binario en torno al 60 % manteniendo el soporte de rango completo.

Es relevante ahora porque encaja en el ecosistema LiteRT (sucesor de TensorFlow Lite) y en la API unificada de MediaPipe Tasks, lo que permite desplegar deteccion facial con keypoints en movil y navegador sin dependencias de servidor ni frameworks de inferencia adicionales. El modelo no es un LLM: es un detector de objetos especializado en rostros, por lo que las secciones de esta ficha se adaptan a esa naturaleza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BlazeFace (detector single-shot tipo CenterNet con anchors), poda estructural en convoluciones `1x1` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija `[1, 192, 192, 3]`) |
| Tipos de cuantizacion | pesos en `float16`; entrada `float32` normalizada con `mean=[127.5]`, `std=[127.5]` |
| Idiomas soportados | no aplica (modelo de vision, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con metadatos `TFLITE_METADATA` embebidos (nombre `Full Range Face Detection`) |
| Tamano del artefacto | 676.746 bytes (676,7 KB) |
| Entrada | `input_1`: `[1, 192, 192, 3]`, `float32` |
| Salidas | `Identity`: `[1, 2304, 16]` (cajas y keypoints sin decodificar); `Identity_1`: `[1, 2304, 1]` (puntuaciones) |
| Anchors | 2304 |
| Keypoints por rostro | 6 (left_eye, right_eye, nose_tip, mouth, left_eye_tragion, right_eye_tragion) |
| Postprocesado | decodificacion de anchors y NMS a cargo de la tarea `FaceDetector` de MediaPipe |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

BlazeFace es un detector de rostros single-shot disenado para GPUs moviles, con una cabeza de deteccion tipo CenterNet sobre un conjunto de anchors. El modelo produce, para cada uno de los 2304 anchors, 16 valores (caja delimitadora y keypoints) y una puntuacion de confianza; la tarea `FaceDetector` de MediaPipe se encarga de decodificar esas predicciones crudas y aplicar Non-Maximum Suppression para devolver detecciones finales con caja alineada a ejes, seis keypoints 2D normalizados en `[0.0, 1.0]` y una puntuacion en `[0.0, 1.0]`.

La variante publicada aplica poda estructural sobre el BlazeFace full-range original: aproximadamente el 70 % de ceros en la mayoria de convoluciones `1x1`, con una reduccion de tamano binario cercana al 60 %. Los pesos se almacenan en FP16. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable a un detector) ni el procedimiento exacto de poda y reentrenamiento posterior.

## Capacidades

- Deteccion de rostros en imagenes: devuelve caja delimitadora alineada a ejes (`origin_x`, `origin_y`, `width`, `height` en pixeles) y puntuacion de confianza.
- Deteccion de 6 keypoints faciales aproximados por rostro: ojos izquierdo y derecho, punta de la nariz, boca y tragiones oculares izquierdo y derecho, normalizados en `[0.0, 1.0]`.
- Soporte de rango completo: optimizado para imagenes de camara trasera de smartphone a distancias de hasta aproximadamente 5 metros.
- Ejecucion on-device en Android, iOS, web (JavaScript), Python y Flutter mediante MediaPipe Tasks.
- Modos de ejecucion de la tarea: imagen individual (`IMAGE`), video (`VIDEO`) y streaming en directo (`LIVE_STREAM`), segun la API `VisionRunningMode` de MediaPipe.
- Umbral de confianza de deteccion configurable (`min_detection_confidence`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues: es un modelo puramente perceptivo de vision.

## Casos de uso

- Desbloqueo facial y autenticacion en apps moviles: el detector localiza el rostro y sus keypoints antes de pasar a un modelo de reconocimiento o verificacion; sus 676,7 KB y su ejecucion on-device permiten integrarlo en el arranque de la app sin latencia de red.
- Preprocesado para pipelines de analitica facial: las seis keypoints permiten alinear y recortar el rostro antes de tareas posteriores (estimacion de pose, reconocimiento de emociones, deteccion de mirada) en Android, iOS o web.
- Videollamadas y filtros en tiempo real: el modo `LIVE_STREAM` de MediaPipe y el bajo coste computacional del modelo permiten seguir rostros fotograma a fotograma para aplicar efectos o desenfoque de fondo en el navegador.
- Fotografia computacional en camara trasera: al cubrir distancias de hasta aproximadamente 5 metros, sirve para enfocar y encuadrar grupos de personas en la escena, no solo selfies.
- Control de presencia o aforo en kioscos y paneles: deteccion de rostros en imagenes capturadas por camaras fijas para contar personas sin enviar video a un servidor, lo que reduce requisitos de privacidad y ancho de banda.
- Automatizacion de catalogos y moderacion de imagenes en backend Python: la tarea `FaceDetector` puede ejecutarse en lotes sobre imagenes para detectar y recortar rostros antes de anonimizarlos o clasificarlos.
- Aplicaciones Flutter multiplataforma: el paquete `flutter-mediapipe` incluye una muestra del detector facial que permite reutilizar el mismo modelo en Android e iOS desde una unica base de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minimos, dado el tamano del modelo (676,7 KB de pesos). Cabe holgadamente en cualquier GPU consumer, e incluso en CPU movil.
- GPU recomendadas: no requiere GPU dedicada; esta disenado para GPUs moviles y aceleradores on-device (NNAPI en Android, Core ML/Metal en iOS, WebGL/WebGPU en navegador). En escritorio puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en telefonos de gama baja; el cuello de botella es el preprocesado de imagen, no el modelo.
- Opciones de despliegue: MediaPipe Tasks (`FaceDetector`) en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript) y Flutter (Dart); LiteRT/TFLite como runtime subyacente. El modelo no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de LLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El paper original de BlazeFace reporta deteccion sub-milisegundo en GPUs moviles, pero no se aportan cifras especificas para esta variante podada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Rango | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe BlazeFace Full-Range Sparse (este) | Detector facial single-shot podado, TFLite | 676,7 KB (FP16) | Hasta aprox. 5 m | Apache 2.0 | Hugging Face, LiteRT/MediaPipe |
| MediaPipe BlazeFace short-range (variante de selfie) | Detector facial single-shot, TFLite | no disponible en la informacion proporcionada | Corto (selfie) | Apache 2.0 | MediaPipe |
| BlazeFace original (paper arXiv:1907.05047) | Detector facial single-shot denso | no disponible en la informacion proporcionada | No especificado | no disponible | Referencia academica |

No se dispone de datos de rendimiento comparativo (precision, mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado en deteccion facial: no genera texto, no razona y no soporta tool calling ni agentes; no debe evaluarse como un LLM.
- No se han publicado en la informacion disponible datos de sesgo, cobertura demografica ni tasas de falsos positivos/negativos; conviene validar el modelo con el dominio concreto antes de produccion.
- Las seis keypoints son aproximadas y normalizadas; no son landmarks densos de alta precision, por lo que no sirven para tareas que requieran malla facial detallada.
- El rango de deteccion esta optimizado para hasta aproximadamente 5 metros; rostros muy lejanos o muy pequenos en la imagen pueden no detectarse.
- La entrada es fija a 192x192 píxeles y RGB normalizado a `[-1.0, 1.0]`; el redimensionado y la normalizacion los gestiona MediaPipe `FaceDetector`, por lo que un uso directo del `.tflite` requiere replicar ese preprocesado.
- La decodificacion de anchors y el NMS no estan incluidos en el grafo del modelo: es necesario usar la tarea `FaceDetector` de MediaPipe o reimplementar ese postprocesado.
- Licencia Apache 2.0: permite uso comercial con atribucion y sin garantias; revisar los terminos completos antes de redistribuir.
- No hay garantia de mantenimiento ni soporte oficial de Google para este repositorio de la comunidad; el modelo upstream se distribuye a traves de MediaPipe.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range-Sparse
- Artefacto: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range-Sparse/blob/main/blaze_face_full_range_sparse.tflite
- Documentacion de MediaPipe Face Detector: https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
- LiteRT: https://developers.google.com/edge/litert
- Paper BlazeFace (arXiv:1907.05047): https://arxiv.org/abs/1907.05047
- Muestra Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/android
- Muestra iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/ios
- Colab Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/face_detector/python/face_detector.ipynb
- Muestra web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/face-detector.ts
- Muestra Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/face_detector
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_detector
- Guias de instalacion: https://developers.google.com/edge/mediapipe/solutions/setup_python · https://developers.google.com/edge/mediapipe/solutions/setup_web · https://developers.google.com/edge/mediapipe/solutions/setup_android · https://developers.google.com/edge/mediapipe/solutions/setup_ios · https://developers.google.com/edge/mediapipe/solutions/setup_flutter
