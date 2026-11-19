# litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range

## Resumen

MediaPipe BlazeFace Full-Range es un detector facial de una sola etapa (single-shot) desarrollado originalmente por Google para la plataforma MediaPipe y empaquetado por la comunidad litert-community para su uso con LiteRT (anteriormente TensorFlow Lite). El modelo resuelve la deteccion de rostros en imagenes de camaras traseras de smartphone, donde las caras aparecen pequenas o lejanas (hasta aproximadamente 5 metros), un escenario que los detectores de corto alcance no cubren bien. Se distribuye como un unico fichero `blaze_face_full_range.tflite` de 1,08 MB con pesos en FP16.

Arquitectonicamente es una red convolucional de tipo CenterNet con un encoder personalizado, disenada para predecir cajas delimitadoras, seis puntos clave faciales aproximados y una puntuacion de confianza por cada rostro. A diferencia de los modelos generativos, no tiene parametros en el sentido habitual de un transformer ni una ventana de contexto textual: es un modelo puramente visual, de inferencia en dispositivo (on-device), pensado para movil, web y sistemas embebidos.

Su relevancia actual radica en que ofrece deteccion facial de rango completo con un coste computacional minimo (del orden de milisegundos por fotograma en GPU movil) y una licencia Apache 2.0 permisiva, lo que lo hace apto para integrarse en pipelines de vision por computador en produccion sin dependencias de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo CenterNet con encoder personalizado (BlazeFace full-range) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 192x192x3) |
| Tipos de cuantizacion | pesos en float16; no se documentan otras variantes en el repo |
| Idiomas soportados | no aplica (modelo de vision, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), con metadatos TFLITE_METADATA embebidos |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura convolucional de una sola etapa inspirada en CenterNet, con un encoder disenado especificamente para detectar rostros de menor tamano o mas lejanos que los que captura la variante de corto alcance. La entrada es un tensor `[1, 192, 192, 3]` en `float32` RGB normalizado con `mean=[127.5]` y `std=[127.5]`, lo que produce un rango de `[-1.0, 1.0]`. La red genera dos salidas crudas: `reshaped_regressor_face_4` de forma `[1, 2304, 16]` (cajas y puntos clave sin decodificar) y `reshaped_classifier_face_4` de forma `[1, 2304, 1]` (puntuaciones por ancla). La tarea `FaceDetector` de MediaPipe se encarga de decodificar las predicciones de anclas y aplicar supresion de no maximos (NMS) para devolver las detecciones finales.

No se dispone de informacion sobre el volumen de tokens, la composicion del dataset de entrenamiento ni sobre si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. El modelo se distribuye con pesos en FP16, lo que reduce el tamano del fichero a 1,08 MB (1.083.786 bytes) y facilita su despliegue en dispositivos con recursos limitados. La model card referencia el paper arXiv:1907.05047 como origen de la familia BlazeFace.

## Capacidades

- Deteccion de rostros en imagenes de rango completo, incluyendo caras pequenas o lejanas capturadas por camaras traseras de smartphone (hasta aproximadamente 5 metros).
- Prediccion de caja delimitadora alineada a los ejes (`origin_x`, `origin_y`, `width`, `height`) en pixeles.
- Prediccion de seis puntos clave faciales 2D aproximados, normalizados a `[0.0, 1.0]`: `left_eye`, `right_eye`, `nose_tip`, `mouth`, `left_eye_tragion`, `right_eye_tragion` (desde la perspectiva del observador).
- Puntuacion de confianza por deteccion en el rango `[0.0, 1.0]`.
- Ejecucion en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante la tarea `FaceDetector` de MediaPipe y LiteRT.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision especializado y no generativo.

## Casos de uso

- **Desbloqueo facial y autenticacion en movil**: el modelo detecta el rostro y devuelve caja y puntos clave en milisegundos, lo que permite alimentar una etapa posterior de reconocimiento facial o verificacion de vivacidad dentro de la propia aplicacion, sin enviar imagenes al servidor.
- **Fotografia computacional y autoenfoque**: en aplicaciones de camara, la deteccion de rostros lejanos (hasta unos 5 metros) permite al pipeline de captura ajustar el enfoque, la exposicion o el encuadre antes de disparar, algo que la variante de corto alcance no cubre bien.
- **Videoconferencia y efectos en tiempo real**: con latencias del orden de milisegundos en GPU movil, el modelo puede rastrear rostros fotograma a fotograma para aplicar desenfoque de fondo, filtros o encuadre automatico en llamadas de video.
- **Analitica de aforo y presencia**: en aplicaciones de conteo de personas en espacios controlados, el detector identifica y localiza rostros en imagenes de camara trasera, permitiendo estimar ocupacion sin infraestructura de servidor.
- **Preprocesado para reconocimiento facial**: los seis puntos clave y la caja delimitadora sirven para alinear y recortar el rostro antes de pasarlo a un modelo de embeddings faciales, mejorando la precision del reconocimiento aguas abajo.
- **Accesibilidad y control por gestos faciales**: los puntos clave (ojos, nariz, boca) permiten construir interfaces que respondan a movimientos faciales basicos en aplicaciones de accesibilidad ejecutadas en el dispositivo.
- **Procesamiento por lotes en Python**: mediante la API de MediaPipe Tasks se puede integrar en scripts de Python para etiquetar o filtrar grandes colecciones de imagenes en local, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de vision y no de un modelo de lenguaje. La model card incluye unicamente datos de latencia:

| Plataforma | Modo | Rendimiento reportado |
|---|---|---|
| Pixel 3 | GPU | ≈90 FPS |
| Pixel 4 | GPU | ≈165 FPS |
| Pixel 3 | CPU mononucleo con XNNPACK | ≈50 FPS |
| Pixel 4 | CPU con XNNPACK | ≈145 FPS |

La documentacion de MediaPipe Face Detector solo reporta latencia para la variante de corto alcance (`BlazeFace short-range`: 2,94 ms en CPU y 7,41 ms en GPU en Pixel 6); no se ofrecen cifras equivalentes para esta variante de rango completo en ese dispositivo.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 1,08 MB en FP16, la huella de memoria es minima; cabe holgadamente en cualquier GPU consumer e incluso en memoria compartida de dispositivos moviles.
- **GPU recomendadas**: no requiere GPU dedicada. Funciona en GPU integradas de movil (Pixel 3, Pixel 4 y superiores) y en cualquier GPU de escritorio (RTX 4090, A100, H100) sin aprovechar su capacidad, ya que el modelo es muy pequeno.
- **Cabe en GPU consumer**: si, en cualquier GPU consumer; tambien en CPU y en aceleradores moviles.
- **Opciones de despliegue**: LiteRT (TFLite) con la tarea `FaceDetector` de MediaPipe en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript) y Flutter (Dart); el runtime incluye soporte para XNNPACK en CPU y delegados de GPU.
- **Latencia y throughput estimados**: segun la model card, aproximadamente 90 FPS en GPU de Pixel 3, 165 FPS en GPU de Pixel 4, 50 FPS en CPU mononucleo de Pixel 3 con XNNPACK y 145 FPS en CPU de Pixel 4 con XNNPACK.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe BlazeFace Full-Range (este modelo) | CNN single-shot tipo CenterNet | 192x192x3 | Caja, 6 keypoints, score | Apache 2.0 | Hugging Face, LiteRT/MediaPipe |
| MediaPipe BlazeFace Short-Range | CNN single-shot | no disponible en la informacion | Caja, keypoints, score | Apache 2.0 | MediaPipe |
| Otros detectores faciales de la familia MediaPipe | CNN | no disponible | Caja, keypoints | Apache 2.0 | MediaPipe |

No se dispone de datos de precision comparativa entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a aspectos de arquitectura, licencia y disponibilidad. La diferencia principal documentada es el rango de distancia: la variante full-range esta optimizada para caras lejanas (hasta aproximadamente 5 metros), mientras que la short-range se orienta a caras cercanas.

## Limitaciones y advertencias

- **Alcance de distancia**: el modelo esta optimizado para caras dentro de aproximadamente 5 metros; su comportamiento fuera de ese rango no esta documentado.
- **Puntos clave aproximados**: los seis keypoints son estimaciones 2D normalizadas, no landmarks densos ni precisos, por lo que no son adecuados para tareas que requieran malla facial detallada.
- **Sesgos y equidad**: la model card original incluye una seccion de "Fairness" que no se ha podido consultar en detalle; no se dispone de datos sobre sesgos por demografia, iluminacion o etnia en la informacion proporcionada.
- **Riesgo de falsos positivos y negativos**: como todo detector single-shot, puede producir detecciones espurias en escenas con patrones similares a rostros o fallar en condiciones de oclusion, angulos extremos o baja iluminacion; no se documentan metricas de precision en la informacion disponible.
- **Dependencia del runtime**: el modelo esta empaquetado para la tarea `FaceDetector` de MediaPipe y LiteRT; su uso fuera de ese ecosistema requiere implementar manualmente la decodificacion de anclas y el NMS.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar las condiciones de los componentes upstream de Google y del paper referenciado.
- **Sin capacidades generativas**: no genera texto, no razona y no soporta tool calling; no debe evaluarse con los criterios habituales de modelos de lenguaje.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range)
- [Fichero blaze_face_full_range.tflite](https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Full-Range/blob/main/blaze_face_full_range.tflite)
- [Documentacion de MediaPipe Face Detector](https://developers.google.com/edge/mediapipe/solutions/vision/face_detector)
- [LiteRT](https://developers.google.com/edge/litert)
- [Demo web](https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_detector)
- [Guia de instalacion en Python](https://developers.google.com/edge/mediapipe/solutions/setup_python)
- [Guia de instalacion en web/JavaScript](https://developers.google.com/edge/mediapipe/solutions/setup_web)
- [Guia de instalacion en Android](https://developers.google.com/edge/mediapipe/solutions/setup_android)
- [Guia de instalacion en iOS](https://developers.google.com/edge/mediapipe/solutions/setup_ios)
- [Guia de instalacion en Flutter](https://developers.google.com/edge/mediapipe/solutions/setup_flutter)
- [Ejemplo Android](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/android)
- [Ejemplo iOS](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/ios)
- [Notebook de Python en Colab](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/face_detector/python/face_detector.ipynb)
- [Ejemplo Flutter](https://github.com/google/flutter-mediapipe/tree/main/samples/vision/face_detector)
- [Paper BlazeFace (arXiv:1907.05047)](https://arxiv.org/abs/1907.05047)
