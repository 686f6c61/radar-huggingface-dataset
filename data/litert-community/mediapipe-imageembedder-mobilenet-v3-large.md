# litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Large

## Resumen

MediaPipe-ImageEmbedder-MobileNet-V3-Large es un extractor de características visuales empaquetado como `mobilenet_v3_large.tflite`, un binario TensorFlow Lite de 10,89 MB con pesos en FP32 y un multiplicador de profundidad de canales de 0,75. Lo publica la comunidad `litert-community` como réplica byte a byte del artefacto oficial que Google sirve desde `storage.googleapis.com/mediapipe-models`, pensado para su uso dentro de la tarea `ImageEmbedder` de MediaPipe. No es un modelo generativo: transforma una imagen RGB normalizada de 224×224 píxeles en un vector denso de 1280 dimensiones que sirve para comparar imágenes por similitud coseno.

El problema que resuelve es concreto: búsqueda visual, agrupamiento y deduplicación de imágenes en el propio dispositivo (Android, iOS, web, Python, Flutter) sin depender de la nube. Al estar basado en MobileNet-V3 Large con profundidad reducida, prioriza la latencia en hardware de gama media-baja: la documentación de MediaPipe reporta 9,75 ms en CPU y 9,08 ms en GPU sobre un Pixel 6 para el pipeline completo de la tarea.

Su relevancia actual es la de un componente de infraestructura más que la de un modelo de frontera: la licencia Apache 2.0, el tamaño de 10,89 MB y la paridad exacta con el binario upstream lo convierten en una pieza estable para pipelines de visión en producción. No hay información sobre idiomas, datos de entrenamiento más allá de ImageNet-1K ni benchmarks de precisión en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNet-V3 Large (CNN con bloques depthwise separable y squeeze-and-excitation), multiplicador de profundidad 0,75 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224×3) |
| Tipos de cuantizacion | FP32 (unico artefacto publicado); MediaPipe permite cuantizacion escalar opcional en la salida (`quantize=True`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`mobilenet_v3_large.tflite`, 10.889.458 bytes) |

## Arquitectura y entrenamiento

La red es una MobileNet-V3 Large (referencia arXiv:1905.02244) con multiplicador de profundidad de canales de 0,75, entrenada sobre ImageNet-1K con fotografías naturales. La entrada es un tensor `serving_default_inputs:0` de forma `[-1, 224, 224, 3]` en `float32` con normalización declarada `mean=[0.0], std=[255.0]` (píxeles en rango [0,1]). La salida es `StatefulPartitionedCall:0`, un vector `[-1, 1280]` en `float32`. El binario incluye metadatos TFLITE embebidos (nombre `MobileNetV3 image classifier`, versión 1, autor `MediaPipe`) y un archivo asociado `labels.txt`.

No se detalla en la información disponible el número de tokens (no aplica), la composición exacta del dataset más allá de ImageNet-1K, ni si hubo fases de ajuste fino, RLHF o DPO (no aplica a este tipo de modelo). La innovación técnica relevante es el empaquetado para MediaPipe Tasks: la tarea `ImageEmbedder` ofrece normalización L2 opcional (`l2_normalize=True`) y cuantización escalar opcional (`quantize=True`) de la salida, lo que permite ajustar el coste de almacenamiento y la métrica de similitud sin reentrenar.

## Capacidades

- Extracción de embeddings de imagen: genera un vector denso de 1280 dimensiones por imagen de entrada.
- Similitud visual: comparación mediante similitud coseno entre embeddings (helper `ImageEmbedder.cosine_similarity`).
- Normalización L2 opcional de los embeddings para simplificar el cálculo de distancias.
- Cuantización escalar opcional de la salida para reducir el tamaño de los vectores almacenados.
- Ejecución en el dispositivo en Android (Kotlin/Java), iOS (Swift), web (JavaScript), Python y Flutter (Dart).
- Ejecución en modo imagen suelta (`VisionRunningMode.IMAGE`); no se documentan en la información disponible modos de vídeo o streaming para esta tarea.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni modo thinking: es exclusivamente un extractor de características.

## Casos de uso

- Búsqueda visual inversa en aplicaciones móviles: el modelo embebe la imagen de consulta y las candidatas en el dispositivo y se ordenan por similitud coseno, evitando enviar fotos a un servidor y reduciendo la latencia a la decena de milisegundos reportada.
- Deduplicación de bibliotecas de fotos: agrupar imágenes casi idénticas calculando la similitud entre embeddings de 1280 dimensiones con normalización L2, adecuado para apps de galería que deben procesar miles de imágenes localmente.
- Clustering no supervisado de catálogos de producto: agrupar imágenes por similitud visual para organizar inventarios o detectar duplicados en marketplaces, aprovechando el tamaño de 10,89 MB para ejecutarlo en servidores modestos o en el propio cliente.
- Moderación y triaje visual en el borde: prefiltrar imágenes sospechosas o duplicadas en el dispositivo antes de enviar solo los casos relevantes a un modelo mayor en la nube, reduciendo ancho de banda y coste.
- Detección de near-duplicates en pipelines de datos de entrenamiento: identificar imágenes repetidas o casi idénticas en un dataset antes de entrenar otros modelos, con la ventaja de que el binario es idéntico al artefacto oficial de Google y su comportamiento es reproducible.
- Funciones de "imágenes similares" en apps de comercio o contenido: integrar el embedder en Flutter o web para mostrar recomendaciones visuales en el cliente sin backend dedicado, gracias a la paridad de API entre plataformas de MediaPipe.
- Indexación offline en dispositivos sin conectividad: aplicaciones de campo (inspección, catalogación) que necesitan comparar imágenes contra una base local sin acceso a red.

## Benchmarks y rendimiento

La información proporcionada solo incluye benchmarks de latencia del pipeline completo de la tarea `ImageEmbedder`, no métricas de precisión (exactitud, recall, mAP) ni comparaciones con otros modelos.

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| MobileNet-V3 (large) | Pixel 6 | 9,75 ms | 9,08 ms |

No se han publicado resultados de benchmarks de precisión (ImageNet top-1, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo pesa 10,89 MB en FP32 y opera sobre CPU/GPU móvil o de escritorio con huella mínima.
- GPU recomendadas: no se especifican; el benchmark de referencia usa un Pixel 6 (GPU móvil). En escritorio puede ejecutarse en CPU sin GPU dedicada.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos móviles de gama media; no requiere aceleradores de datacenter (A100, H100).
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter) sobre el runtime LiteRT/TFLite; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 9,75 ms en CPU y 9,08 ms en GPU por inferencia en Pixel 6 según la documentación de MediaPipe; el throughput no se reporta explícitamente.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (por ejemplo, otras variantes de MobileNet-V3, EfficientNet-Lite o extractores de embeddings de imagen de MediaPipe) con sus parámetros, contexto, rendimiento y licencia. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-ImageEmbedder-MobileNet-V3-Large | no disponible | no aplica | latencia 9,75 ms CPU / 9,08 ms GPU en Pixel 6 | Apache 2.0 | Hugging Face + GCS oficial de Google |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre ImageNet-1K con fotografías naturales: dominios de grano fino (escáneres médicos, OCR, piezas industriales especializadas) o coincidencia biométrica quedan fuera de su distribución de entrenamiento, según la propia model card.
- No se publica un informe de equidad (fairness) específico de Google para este modelo en la página de documentación de MediaPipe.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o negativos en la similitud: embeddings de imágenes visualmente distintas pueden quedar próximos, y viceversa, especialmente fuera del dominio de entrenamiento.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos de los artefactos upstream de Google y de MediaPipe para el caso de uso concreto.
- El repositorio reporta 0 descargas y 0 likes en el momento de la ficha; la paridad byte a byte con el binario oficial de Google es la garantía de procedencia, pero la disponibilidad a largo plazo del repo de la comunidad no está garantizada por el autor original.
- El modelo se distribuye únicamente en FP32; no hay variantes cuantizadas publicadas en el repositorio, lo que puede limitar el ahorro de memoria en algunos despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Large
- Archivo del modelo: https://huggingface.co/litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Large/blob/main/mobilenet_v3_large.tflite
- Documentación de la tarea Image Embedder: https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_embedder
- Guía de instalación en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación en web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/ios
- Notebook de Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_embedder/python/image_embedder.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_embedder
- Paper de MobileNet-V3: https://arxiv.org/abs/1905.02244
- Artefacto upstream de Google: https://storage.googleapis.com/mediapipe-models
