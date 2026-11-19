# litert-community/MediaPipe-FaceDetector-BlazeFace-Short-Range

## Resumen

MediaPipe BlazeFace (Short-Range) es un detector facial de un solo paso (single-shot) desarrollado originalmente por Google para su framework MediaPipe y empaquetado ahora por la comunidad LiteRT para su uso con el runtime LiteRT (antes TensorFlow Lite). El modelo resuelve la deteccion de rostros y la localizacion de seis puntos clave faciales en imagenes de camara frontal o webcam a corta distancia (aproximadamente 2 metros), con un diseno orientado a dispositivos moviles y entornos con recursos limitados.

Arquitectura basada en SSD (Single Shot MultiBox Detector) con un extractor de caracteristicas ligero inspirado en MobileNetV1/V2, optimizado para ejecucion en GPU movil y CPU mediante XNNPACK. El fichero `blaze_face_short_range.tflite` ocupa 229,7 KB con pesos en FP16, lo que lo convierte en uno de los detectores faciales mas compactos disponibles para despliegue on-device.

Su relevancia actual radica en la combinacion de tamano minimo, latencia muy baja (2,94 ms en CPU de Pixel 6) y soporte multiplataforma (Android, iOS, Web, Python, Flutter) a traves de la API `FaceDetector` de MediaPipe. Es una pieza de infraestructura para pipelines de vision en tiempo real, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot MultiBox Detector) con extractor ligero inspirado en MobileNetV1/V2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija `[1, 128, 128, 3]`) |
| Tipos de cuantizacion | FP16 (pesos del fichero distribuido); el modelo acepta entrada `float32` |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), 229.746 bytes, SHA-256 `b4578f35940bf5a1a655214a1cce5cab13eba73c1297cd78e1a04c2380b0152f` |

## Arquitectura y entrenamiento

BlazeFace emplea una arquitectura SSD con un backbone convolucional ligero derivado de MobileNetV1/V2, disenado especificamente para inferencia en GPU movil y CPU con XNNPACK. La entrada es una imagen RGB de 128x128 píxeles normalizada con `mean=127.5` y `std=127.5`. La red produce dos tensores de salida: `regressors` de forma `[1, 896, 16]` (cajas y keypoints sin decodificar sobre 896 anchors) y `classificators` de forma `[1, 896, 1]` (puntuaciones por anchor). La tarea `FaceDetector` de MediaPipe se encarga de decodificar las predicciones crudas y aplicar Non-Maximum Suppression (NMS) para devolver cajas delimitadoras alineadas a los ejes, seis keypoints faciales normalizados y una puntuacion de confianza.

El modelo esta especializado en rango corto (hasta aproximadamente 2 metros), optimizado para selfies y camaras frontales. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de tecnicas de alineacion como RLHF o DPO, dado que se trata de un detector supervisado de vision. El paper de referencia es arXiv:1907.05047 (BlazeFace: Sub-millisecond Neural Face Detection on Mobile GPUs).

## Capacidades

- Deteccion de rostros en imagenes individuales y en flujo de video en tiempo real.
- Localizacion de seis keypoints faciales por rostro: ojo izquierdo, ojo derecho, punta de la nariz, boca, tragion del ojo izquierdo y tragion del ojo derecho (desde la perspectiva del observador), normalizados en `[0.0, 1.0]`.
- Devolucion de caja delimitadora alineada a los ejes en pixeles (`origin_x`, `origin_y`, `width`, `height`).
- Puntuacion de confianza por deteccion en `[0.0, 1.0]`, con umbral configurable (`min_detection_confidence`).
- Ejecucion on-device en Android, iOS, Web (JavaScript), Python y Flutter mediante la API `FaceDetector` de MediaPipe.
- Soporte de modos de ejecucion `IMAGE` y otros modos de `VisionRunningMode` ofrecidos por MediaPipe.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo.

## Casos de uso

- Desbloqueo facial en aplicaciones moviles: el detector sirve como primera etapa del pipeline para localizar el rostro antes de pasarlo a un modelo de reconocimiento facial, con latencia de 2,94 ms en CPU de Pixel 6 y 229 KB de peso, lo que permite incluirlo en apps Android e iOS sin impacto apreciable en el tamano del APK/IPA.
- Filtros y efectos de realidad aumentada en camara frontal: los seis keypoints faciales permiten anclar gafas, sombreros o maquillaje virtual en tiempo real en apps Flutter o Web, aprovechando la deteccion a corta distancia para selfies.
- Videollamadas con seguimiento y encuadre automatico: integrado en un pipeline de videoconferencia Web o movil, el modelo detecta el rostro en cada frame y permite recentrar o recortar el encuadre dinamicamente con un coste computacional minimo.
- Preprocesado en pipelines de analisis de emociones o atencion: como etapa de deteccion, alimenta a modelos posteriores de clasificacion de expresiones o estimacion de mirada, reduciendo el area de imagen a procesar y ahorrando computo en dispositivos de gama baja.
- Control de presencia y deteccion de distraccion en conduccion: en apps de seguridad vial o teletrabajo, el modelo detecta si hay un rostro frente a la camara y su posicion, permitiendo alertas cuando el conductor o el usuario desvia la atencion.
- Aplicaciones de fotografia con deteccion de caras para enfoque y exposicion: en apps de camara moviles, el detector permite seleccionar la region del rostro para el autofoco o la medicion de luz, con un coste de inferencia despreciable frente al pipeline de captura.
- Prototipado rapido en Web: mediante el Web Demo oficial y la API de MediaPipe para JavaScript, se puede validar la deteccion facial en el navegador sin infraestructura de servidor, util para demos y pruebas de concepto.

## Benchmarks y rendimiento

Latencia media del pipeline completo de la tarea MediaPipe `FaceDetector`, segun la documentacion oficial:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| BlazeFace (short-range) | Pixel 6 | 2,94 ms | 7,41 ms |

No se han publicado en la informacion disponible resultados de benchmarks de precision (mAP, recall, F1) ni comparaciones cuantitativas con otros detectores faciales.

## Requisitos de hardware

- VRAM/RAM estimada: inferior a 50 MB en runtime, dado que el fichero de pesos ocupa 229,7 KB y la entrada es de 128x128x3. Cabe holgadamente en cualquier dispositivo movil actual.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU movil (ARM) con XNNPACK y en GPU movil integrada. En escritorio puede ejecutarse en cualquier CPU moderna.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en dispositivos moviles de gama baja; no es un modelo que requiera aceleradores de datacenter como A100 o H100.
- Opciones de despliegue: runtime LiteRT (TFLite), API `FaceDetector` de MediaPipe en Python, Android (Kotlin/Java), iOS (Swift), Web (JavaScript) y Flutter (Dart).
- Latencia y throughput: 2,94 ms por frame en CPU de Pixel 6 y 7,41 ms en GPU de Pixel 6 para el pipeline completo de la tarea, lo que permite procesar video a mas de 100 FPS en CPU en dicho dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Entrada | Keypoints | Licencia | Despliegue |
|---|---|---:|---|---:|---|---|
| BlazeFace Short-Range (este) | SSD + MobileNet-like | 229,7 KB | 128x128 | 6 | Apache 2.0 | LiteRT / MediaPipe |
| BlazeFace Full-Range (MediaPipe) | SSD + MobileNet-like | no disponible en la informacion | no disponible | 6 | Apache 2.0 | LiteRT / MediaPipe |
| MediaPipe Face Mesh | Mallado facial denso | no disponible en la informacion | no disponible | 468 vertices | Apache 2.0 | LiteRT / MediaPipe |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo (mAP, latencia) frente a alternativas como RetinaFace, MTCNN o SCRFD, por lo que la comparacion cuantitativa se limita a tamano, formato y licencia.

## Limitaciones y advertencias

- El modelo esta especializado en rango corto (hasta aproximadamente 2 metros); su precision cae para rostros lejanos o de tamano reducido en la imagen. Para rango completo existe una variante separada (BlazeFace Full-Range).
- No se han publicado en la informacion disponible datos sobre sesgos demograficos, de genero o de tono de piel; se recomienda evaluar la equidad en el dominio de despliegue antes de produccion.
- Riesgo de falsos positivos y falsos negativos en condiciones de baja iluminacion, oclusiones parciales, angulos extremos o rostros muy pequenos; el umbral `min_detection_confidence` debe ajustarse segun el caso de uso.
- El modelo solo detecta y localiza rostros y keypoints; no identifica personas ni realiza reconocimiento facial. Cualquier uso de identificacion biometrica requiere modelos adicionales y cumple normativa especifica (RGPD, AI Act).
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se han identificado restricciones adicionales en la informacion disponible.
- El modelo es un artefacto de vision sin capacidades de texto, razonamiento ni generacion; no debe evaluarse con benchmarks de LLM.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-18; se trata de un empaquetado comunitario, no de un lanzamiento oficial de Google, aunque el modelo subyacente es de Google.
- La fecha de creacion del repo (2026-11-18) es posterior a la fecha actual de referencia; conviene verificar la integridad del fichero mediante el SHA-256 indicado.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Short-Range
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Short-Range/blob/main/blaze_face_short_range.tflite
- Model card original (PDF): https://huggingface.co/litert-community/MediaPipe-FaceDetector-BlazeFace-Short-Range/blob/main/MediaPipe%20BlazeFace%20Model%20Card%20%28Short%20Range%29.pdf
- Paper BlazeFace (arXiv:1907.05047): https://arxiv.org/abs/1907.05047
- Documentacion Face Detector: https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/vision/face_detector#task_benchmarks
- LiteRT: https://developers.google.com/edge/litert
- Web Demo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/face_detector
- Setup Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Setup Web: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Setup Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Setup iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Setup Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/face_detector/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/face_detector/python/face_detector.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/face_detector
