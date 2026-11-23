# litert-community/MediaPipe-FaceDetector-BlazeFace-Short-Range

## Resumen

MediaPipe BlazeFace (Short-Range) es un detector facial ligero de un solo paso (single-shot) desarrollado originalmente por Google para el framework MediaPipe y empaquetado por la comunidad `litert-community` para su uso con LiteRT y la tarea `FaceDetector` de MediaPipe. El modelo resuelve la deteccion de rostros en imagenes de camara frontal o webcam a corta distancia (aproximadamente 2 metros), devolviendo cajas delimitadoras, seis puntos clave faciales aproximados y una puntuacion de confianza. Su relevancia radica en su tamano extremadamente reducido (229,7 KB con pesos en FP16) y su optimizacion para ejecucion en dispositivo (Android, iOS, web, Python, Flutter) mediante XNNPACK y GPU movil.

La arquitectura es una SSD (Single Shot MultiBox Detector) con un extractor de caracteristicas ligero inspirado en MobileNetV1/V2, disenada para inferencia de baja latencia en CPU y GPU de dispositivos moviles. El modelo no es un modelo de lenguaje ni un transformer generativo: es un detector de objetos especializado en rostros, con una unica entrada de imagen de 128x128x3 y dos salidas tensoriales (regresores y clasificadores) que la tarea MediaPipe decodifica aplicando supresion de no maximos (NMS).

El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para integrarse en pipelines de vision por computador en el borde (edge computing), no para generacion de texto ni razonamiento. Es relevante ahora por la creciente demanda de soluciones de vision en dispositivo con privacidad preservada y sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot MultiBox Detector) con extractor ligero inspirado en MobileNetV1/V2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP16 (pesos en float16); entrada/salida en float32 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), 229,7 KB (229.746 bytes) |

## Arquitectura y entrenamiento

BlazeFace (short-range) emplea una arquitectura SSD de un solo paso con un extractor de caracteristicas ultraligero inspirado en MobileNetV1/V2, optimizado para ejecucion en GPU movil y CPU mediante XNNPACK. La entrada es una imagen de `[1, 128, 128, 3]` en float32 con normalizacion `mean=[127.5]`, `std=[127.5]`. Las salidas son `regressors` de forma `[1, 896, 16]` (cajas y puntos clave sin decodificar) y `classificators` de forma `[1, 896, 1]` (puntuaciones). La tarea MediaPipe `FaceDetector` decodifica las predicciones de anclas y aplica NMS para producir detecciones finales.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada. El modelo card referencia el paper arXiv:1907.05047 (BlazeFace: Sub-millisecond Neural Face Detection on Mobile GPUs), que describe la arquitectura y el entrenamiento originales. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o attention linear, al no tratarse de un modelo generativo.

## Capacidades

- Deteccion de rostros en imagenes de camara frontal o webcam a corta distancia (aproximadamente 2 metros).
- Devolucion de caja delimitadora alineada a ejes (`origin_x`, `origin_y`, `width`, `height` en pixeles).
- Devolucion de 6 puntos clave faciales 2D aproximados normalizados a `[0.0, 1.0]`: `left_eye`, `right_eye`, `nose_tip`, `mouth`, `left_eye_tragion`, `right_eye_tragion` (desde la perspectiva del observador).
- Puntuacion de confianza de deteccion en `[0.0, 1.0]`.
- Ejecucion en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks y LiteRT.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No soporta vision generativa, audio ni modos de pensamiento (thinking mode).

## Casos de uso

- Desbloqueo facial en aplicaciones moviles: el modelo detecta el rostro y sus puntos clave en tiempo real con 229,7 KB de pesos, adecuado para autenticacion en dispositivo sin enviar imagenes a la nube.
- Preprocesamiento para pipelines de reconocimiento facial: las cajas y los 6 puntos clave sirven para alinear y recortar rostros antes de pasarlos a un modelo de embeddings faciales.
- Filtros y efectos en tiempo real en apps de camara: la deteccion de puntos clave (ojos, nariz, boca) permite anclar efectos de realidad aumentada sobre el rostro en webcam o camara frontal.
- Videoconferencia y seguimiento de atencion: deteccion de presencia y posicion del rostro para encuadre automatico o analisis de atencion en reuniones, ejecutandose localmente en el navegador o en el dispositivo.
- Analitica de audiencia en kioscos y pantallas interactivas: conteo y localizacion de rostros en tiempo real sin infraestructura de servidor, gracias a la ejecucion en CPU/GPU de dispositivos de bajo consumo.
- Aplicaciones de accesibilidad: deteccion de la posicion de la cabeza y los ojos para control por gestos o seguimiento de mirada en herramientas de asistencia.
- Prototipado rapido en Python/Colab: el modelo se descarga con `huggingface_hub` y se integra en pocas lineas con MediaPipe Tasks para validar ideas de vision antes de portar a movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 50 MB; el modelo pesa 229,7 KB en FP16 y la entrada es de 128x128x3, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU movil mediante XNNPACK y en GPU movil. En escritorio puede ejecutarse en cualquier GPU (RTX 4090, A100, H100) sin aprovechar su capacidad, ya que el modelo es极小.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada (moviles, Raspberry Pi, navegadores).
- Opciones de despliegue: MediaPipe Tasks (`FaceDetector`) en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript/TypeScript) y Flutter (Dart); LiteRT para ejecucion del `.tflite`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el paper original (arXiv:1907.05047) describe deteccion sub-milisegundo en GPU moviles, pero no se confirman cifras para este empaquetado concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe BlazeFace (Short-Range) | no disponible (229,7 KB) | no aplica | Deteccion facial + 6 keypoints | Apache 2.0 | Hugging Face, MediaPipe, LiteRT |
| MediaPipe BlazeFace (Full-Range) | no disponible | no aplica | Deteccion facial a mayor distancia | Apache 2.0 | MediaPipe, LiteRT |
| RetinaFace (MobileNet) | no disponible | no aplica | Deteccion facial + 5 keypoints | MIT (segun implementacion) | Repositorios de investigacion |
| MTCNN | no disponible | no aplica | Deteccion facial + 5 keypoints | MIT | Repositorios de investigacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- Disenado exclusivamente para corta distancia (aproximadamente 2 metros); el rendimiento degrada en rostros lejanos o pequenos en la imagen.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion adversa, oclusiones parciales, angulos extremos o rostros no frontales.
- Los 6 puntos clave son aproximados y normalizados; no sustituyen a un modelo de landmarks faciales de alta precision (p. ej., Face Mesh).
- No se documentan sesgos especificos en la informacion proporcionada, pero como detector facial puede presentar sesgos de rendimiento segun demografia, iluminacion y tipo de camara.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de MediaPipe y LiteRT para el despliegue en plataformas concretas.
- El modelo card no detalla el dataset de entrenamiento ni metricas de evaluacion, lo que limita la evaluacion de su robustez en produccion.
- No apto para autenticacion de alta seguridad por si solo; debe combinarse con un modelo de reconocimiento facial y pruebas de vida (liveness detection).

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Short-Range
- Paper BlazeFace (arXiv:1907.05047): https://arxiv.org/abs/1907.05047
- Documentacion MediaPipe Face Detector: https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
- Documentacion LiteRT: https://developers.google.com/edge/litert
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/ios
- Ejemplo Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/face_detector/python/face_detector.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/face-detector.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/face_detector
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_detector
- Guia de instalacion Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guia de instalacion Web: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guia de instalacion Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guia de instalacion iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guia de instalacion Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
