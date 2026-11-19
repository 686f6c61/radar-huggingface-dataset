# litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Small

## Resumen

MediaPipe-ImageEmbedder-MobileNet-V3-Small es un extractor de características visuales en formato TensorFlow Lite (`.tflite`) publicado por la comunidad `litert-community` para su uso con la tarea `ImageEmbedder` de MediaPipe. Se trata de una MobileNet-V3 Small con multiplicador de profundidad de canales 0,75, entrenada sobre ImageNet-1K, que transforma una imagen RGB normalizada de 224 x 224 píxeles en un vector de embedding denso de 1024 dimensiones. El binario pesa 4,12 MB (4.117.670 bytes) en precisión FP32.

El modelo no es un generador de texto ni un modelo de lenguaje: es un componente de visión por computador pensado para ejecución en dispositivo (on-device) en Android, iOS, web, Python y Flutter. Su función principal es habilitar búsqueda por similitud visual, agrupamiento (clustering) y detección de duplicados cercanos mediante similitud coseno entre embeddings, sin necesidad de enviar imágenes a un servidor.

La relevancia actual radica en su tamaño reducido y su latencia: la documentación de MediaPipe reporta 3,94 ms de latencia media en CPU y 7,83 ms en GPU sobre un Pixel 6 para el pipeline completo de la tarea. Los pesos son byte a byte idénticos al artefacto oficial servido por Google desde `storage.googleapis.com/mediapipe-models`, lo que lo convierte en una réplica verificable del modelo upstream distribuida a través de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNet-V3 Small (CNN con bloques depthwise separable y squeeze-and-excitation), multiplicador de profundidad 0,75 |
| Parametros totales | no disponible (el binario pesa 4,12 MB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 (float32) en el artefacto publicado; MediaPipe `ImageEmbedder` permite cuantización escalar opcional en la salida (`quantize=True`) y normalización L2 (`l2_normalize=True`) |
| Idiomas soportados | no aplica (modelo de imagen); no se declaran idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorFlow Lite (`.tflite`), con metadatos `TFLITE_METADATA` embebidos (nombre `MobileNetV3 image classifier`, versión 1, autor `MediaPipe`, archivo asociado `labels.txt`) |

Especificaciones de entrada y salida:

| Dirección | Tensor | Forma | Tipo | Notas |
|---|---|---|---|---|
| Entrada | `serving_default_inputs:0` | `[-1, 224, 224, 3]` | float32 | Imagen RGB de 224 x 224; normalización `mean=[0.0]`, `std=[255.0]`, valores por canal en [0.0, 1.0] |
| Salida | `StatefulPartitionedCall:0` | `[-1, 1024]` | float32 | Vector de características de 1024 dimensiones |

## Arquitectura y entrenamiento

La arquitectura es una MobileNet-V3 Small, una red neuronal convolucional diseñada para eficiencia en dispositivos móviles. Emplea convoluciones depthwise separables, bloques con mecanismos de squeeze-and-excitation y funciones de activación hard-swish, según el paper de referencia arXiv:1905.02244. En esta variante se aplica un multiplicador de profundidad de canales de 0,75, que reduce el coste computacional a cambio de una ligera pérdida de precisión, equilibrando exactitud y latencia en el borde.

El entrenamiento se realizó sobre el dataset ImageNet-1K, orientado a fotografías naturales. No se documenta en la información disponible el número exacto de tokens o épocas, la composición detallada del dataset más allá de ImageNet-1K, ni si hubo etapas de ajuste fino adicionales. El modelo se distribuye como extractor de características (no como clasificador), aunque los metadatos embebidos conservan la etiqueta de clasificador y el archivo `labels.txt` asociado. No se mencionan innovaciones como decodificación especulativa ni atención lineal, por no tratarse de un transformer.

## Capacidades

- Extracción de embeddings de imagen: genera vectores densos de 1024 dimensiones a partir de imágenes RGB de 224 x 224.
- Comparación por similitud: permite calcular similitud coseno entre embeddings mediante `ImageEmbedder.cosine_similarity`.
- Búsqueda visual y recuperación: adecuado para indexar y recuperar imágenes visualmente parecidas.
- Detección de duplicados cercanos: útil para deduplicación de colecciones de imágenes.
- Agrupamiento (clustering) de imágenes por similitud visual.
- Ejecución on-device multiplataforma: Android (Kotlin/Java), iOS (Swift), web (JavaScript), Python y Flutter (Dart).
- Normalización L2 opcional de la salida y cuantización escalar opcional, configurables a través de las opciones de la tarea `ImageEmbedder`.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Búsqueda visual en aplicaciones móviles: indexar un catálogo de imágenes en el dispositivo y recuperar las más similares a una consulta, con latencias de milisegundos (3,94 ms en CPU de Pixel 6) y sin conexión a red.
- Deduplicación de fototecas: calcular embeddings de todas las imágenes de un dispositivo y agrupar las que superan un umbral de similitud coseno para eliminar duplicados cercanos.
- Moderación y filtrado de contenido: comparar imágenes entrantes contra una base de referencia de contenido no deseado mediante similitud de embeddings en el propio terminal.
- Organización automática de galerías: agrupar imágenes por similitud visual para generar álbumes o clusters temáticos sin etiquetado manual.
- Verificación de integridad de catálogos: detectar imágenes repetidas o casi idénticas en pipelines de comercio electrónico antes de publicarlas.
- Aplicaciones web de demostración: usar el Web Demo de MediaPipe para probar la extracción de embeddings directamente en el navegador sin backend.
- Prototipado rápido en Python: integrar el modelo en notebooks de Colab para experimentar con similitud visual antes de portar la lógica a móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (por ejemplo, top-1 en ImageNet) en la información disponible. Sí se documentan benchmarks de latencia del pipeline completo de MediaPipe `ImageEmbedder`:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| MobileNet-V3 (small) | Pixel 6 | 3,94 ms | 7,83 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el binario ocupa 4,12 MB en FP32 y el modelo está diseñado para ejecutarse en CPU/GPU móviles o en el navegador.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de dispositivos móviles y en GPU integradas de móvil. En escritorio puede ejecutarse en CPU sin problema.
- ¿Cabe en GPU de consumo? Sí, con enorme holgura; cualquier GPU de consumo moderna puede ejecutarlo, aunque su destino natural son dispositivos móviles y navegadores.
- Opciones de despliegue: MediaPipe Tasks (`ImageEmbedder`) en Python, web/JavaScript, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart); el artefacto es un `.tflite` compatible con el runtime LiteRT/TensorFlow Lite.
- Latencia y throughput estimados: 3,94 ms de latencia media en CPU y 7,83 ms en GPU sobre Pixel 6 para el pipeline completo de la tarea, según la documentación de MediaPipe.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros extractores de embeddings de imagen comparables (por ejemplo, variantes MobileNet-V3 Large, EfficientNet-Lite u otros modelos de la familia MediaPipe Image Embedder) con los que establecer una comparación cuantitativa de parámetros, contexto o rendimiento. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-ImageEmbedder-MobileNet-V3-Small | no disponible (binario 4,12 MB FP32) | no aplica | latencia 3,94 ms CPU / 7,83 ms GPU en Pixel 6 | Apache 2.0 | Hugging Face y `storage.googleapis.com/mediapipe-models` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre ImageNet-1K de fotografías naturales; dominios de grano fino como escáneres médicos, OCR o piezas industriales especializadas quedan fuera de su distribución de entrenamiento.
- No es adecuado para coincidencia biométrica (reconocimiento facial u otras modalidades biométricas).
- No se publica un informe de equidad (fairness) independiente de Google para este modelo en la página de documentación de MediaPipe.
- Al ser un extractor de características y no un clasificador calibrado, los embeddings pueden no separar bien clases visualmente muy próximas; conviene validar umbrales de similitud coseno en el dominio concreto de uso.
- Requiere preprocesado específico (redimensionado a 224 x 224, normalización con media 0,0 y desviación 255,0); un preprocesado incorrecto degrada la calidad del embedding.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso de licencia; no se documentan restricciones adicionales.
- El repositorio de Hugging Face no declara idiomas ni datos de benchmarks de precisión; la información de rendimiento se limita a latencias del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Small
- Archivo del modelo: https://huggingface.co/litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Small/blob/main/mobilenet_v3_small.tflite
- Documentación de la tarea Image Embedder: https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder#task_benchmarks
- Guía de instalación en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación en web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_embedder
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/ios
- Notebook de Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_embedder/python/image_embedder.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_embedder
- Paper de MobileNet-V3: https://arxiv.org/abs/1905.02244
