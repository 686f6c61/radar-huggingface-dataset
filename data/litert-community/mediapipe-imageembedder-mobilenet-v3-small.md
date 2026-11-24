# litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Small

## Resumen

MediaPipe-ImageEmbedder-MobileNet-V3-Small es un extractor de características visuales empaquetado como modelo TensorFlow Lite (`.tflite`) y distribuido por la comunidad litert-community para su uso con la tarea `ImageEmbedder` de MediaPipe. Se basa en la arquitectura MobileNet-V3 Small, un modelo convolucional ligero publicado originalmente en el artículo arXiv:1905.02244, y ha sido entrenado sobre ImageNet-1k con un multiplicador de profundidad de canal de 0,75 para equilibrar precision y latencia en dispositivos de borde.

El modelo no es un generador de texto ni un LLM: es un extractor de embeddings de imagen que transforma una imagen RGB normalizada de 224x224 píxeles en un vector de 1024 dimensiones. Su función principal es habilitar búsqueda por similitud visual, deduplicación de imágenes y clasificación mediante vecinos cercanos en aplicaciones móviles, web y de escritorio, sin necesidad de enviar datos a un servidor.

Es relevante ahora porque el ecosistema LiteRT (antiguo TensorFlow Lite) y MediaPipe permiten desplegar este tipo de modelos en Android, iOS, web y Python con una API unificada, y el peso del artefacto es de apenas 4,12 MB en FP32. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNet-V3 Small (CNN con bloques depthwise separable y squeeze-and-excitation) |
| Parametros totales | no disponible (multiplicador de profundidad 0,75; artefacto de 4.117.670 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 224x224x3) |
| Tipos de cuantizacion | FP32 (único artefacto publicado); MediaPipe permite cuantización escalar opcional en la salida (`quantize=True`) |
| Idiomas soportados | no aplica (modelo de visión sin componente lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorFlow Lite (`.tflite`) con metadatos `TFLITE_METADATA` embebidos |

## Arquitectura y entrenamiento

La red es una MobileNet-V3 Small, una CNN diseñada para inferencia en dispositivos con recursos limitados. Combina convoluciones depthwise separables, bloques residuales invertidos con linear bottleneck y módulos de atención squeeze-and-excitation, tal como se describe en el artículo arXiv:1905.02244. El artefacto publicado aplica un multiplicador de profundidad de canal de 0,75, lo que reduce el coste computacional respecto a la variante de ancho completo.

Según la model card, el modelo fue entrenado sobre ImageNet-1k. No se especifican en la información disponible el número de épocas, la composición exacta del dataset más allá de ImageNet-1k, ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO (no aplicables a un modelo de visión). La entrada esperada es un tensor `float32` de forma `[-1, 224, 224, 3]` con normalización `mean=0.0` y `std=255.0`, y la salida es un tensor `float32` de forma `[-1, 1024]`. MediaPipe `ImageEmbedder` puede aplicar normalización L2 (`l2_normalize=True`) y cuantización escalar (`quantize=True`) sobre el vector resultante.

## Capacidades

- Extracción de embeddings de imagen: genera un vector de 1024 dimensiones por imagen de entrada.
- Búsqueda por similitud visual: permite calcular similitud coseno entre embeddings mediante `ImageEmbedder.cosine_similarity`.
- Deduplicación de imágenes: útil para detectar imágenes duplicadas o casi duplicadas en colecciones.
- Clasificación por vecinos cercanos: los embeddings pueden alimentar clasificadores k-NN o lineales sobre ellos.
- Ejecución on-device: soportado en Android, iOS, web, Python y Flutter a través de MediaPipe Tasks.
- Normalización L2 opcional de la salida para simplificar el cálculo de similitud coseno.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Búsqueda visual en aplicaciones móviles: indexar embeddings de 1024 dimensiones de un catálogo de productos y recuperar los más similares a una foto tomada por el usuario, ejecutando la inferencia en el propio dispositivo con un artefacto de 4,12 MB.
- Deduplicación de bibliotecas de imágenes: calcular embeddings de un repositorio fotográfico y agrupar imágenes con similitud coseno superior a un umbral para eliminar duplicados o variantes.
- Moderación y agrupación de contenido: agrupar imágenes visualmente parecidas para revisión humana en pipelines de moderación, aprovechando la inferencia local sin enviar imágenes a servidores.
- Organización automática de galerías: clasificar fotos por similitud visual en álbumes o clusters en apps de gestión de fotos en Android e iOS.
- Filtrado previo en pipelines de visión: usar los embeddings como representación compacta para alimentar clasificadores ligeros o sistemas de recomendación visual en el borde.
- Prototipado rápido en web: desplegar la demo web de MediaPipe para validar casos de similitud visual antes de integrar el modelo en producción mediante la API JavaScript.
- Aplicaciones de accesibilidad: identificar objetos o escenas visualmente similares a referencias conocidas en tiempo real en dispositivos de gama baja.

## Benchmarks y rendimiento

La model card menciona una sección de "Latency Benchmarks" con latencias medias de extremo a extremo del pipeline MediaPipe `ImageEmbedder`, pero la información proporcionada se interrumpe y no incluye los valores numéricos por dispositivo. No se han publicado en la información disponible resultados de benchmarks de precisión (por ejemplo, top-1 en ImageNet) ni comparaciones numéricas con otros modelos.

| Benchmark | Resultado |
|---|---|
| Precisión top-1 en ImageNet | no disponible |
| Latencia por dispositivo | no disponible (la model card remite a la documentación de MediaPipe) |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en sentido estricto; el modelo está pensado para ejecución en CPU y aceleradores móviles. El artefacto FP32 ocupa 4,12 MB, por lo que la memoria necesaria es mínima.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de móviles, navegadores y sistemas embebidos. En servidores puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer: sí, incluso en iGPU y dispositivos móviles de gama baja, dado su tamaño reducido.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web/JavaScript, Flutter), LiteRT/TensorFlow Lite runtime. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a los benchmarks de la documentación oficial de MediaPipe.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-ImageEmbedder-MobileNet-V3-Small (este) | no disponible (0,75 depth multiplier) | 224x224x3 | 1024 dims | Apache 2.0 | Hugging Face, MediaPipe |
| MobileNet-V3 Large | no disponible en la información | 224x224x3 | no disponible | Apache 2.0 (original) | TensorFlow/Keras, LiteRT |
| Otros extractores de embeddings visuales (p. ej. CLIP) | no disponible | variable | variable | variable | Hugging Face |

No se dispone en la información proporcionada de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparativa anterior es cualitativa y basada en la categoría del modelo.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Entrada fija de 224x224: imágenes de otras resoluciones deben redimensionarse y normalizarse según `mean=0.0`, `std=255.0`.
- Entrenado sobre ImageNet-1k: los embeddings pueden estar sesgados hacia las categorías y distribución de ese dataset y generalizar peor en dominios muy distintos (imágenes médicas, satelitales, etc.).
- Riesgo de falsos positivos en similitud: la similitud coseno sobre embeddings de MobileNet-V3 Small puede confundir imágenes visualmente parecidas pero semánticamente distintas; conviene calibrar umbrales.
- Sesgos: no se documentan en la información disponible análisis de sesgos demográficos o culturales; al ser un modelo entrenado en ImageNet, es probable que herede sesgos de representación de ese dataset.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los metadatos y del dataset ImageNet-1k subyacente para usos concretos.
- No se publican métricas de precisión ni latencia en la información disponible; es necesario medir en el dispositivo objetivo antes de producción.
- El repositorio tiene 0 likes y 426 descargas en el momento de la consulta, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Small
- Documentación de MediaPipe Image Embedder: https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder
- Artículo MobileNet-V3: https://arxiv.org/abs/1905.02244
- Muestras Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/android
- Muestras iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_embedder/python/image_embedder.ipynb
- Muestras web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-embedder.ts
- Muestras Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_embedder
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_embedder
- Guía de configuración Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de configuración web: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de configuración Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de configuración iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de configuración Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
