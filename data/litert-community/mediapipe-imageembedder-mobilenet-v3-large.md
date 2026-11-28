# litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Large

## Resumen

MediaPipe-ImageEmbedder-MobileNet-V3-Large es un extractor de características visuales empaquetado como modelo TensorFlow Lite para la tarea `ImageEmbedder` de MediaPipe. Lo publica la comunidad `litert-community` y deriva del clasificador MobileNetV3-Large original (paper arXiv:1905.02244), reutilizando su tronco convolucional para producir un vector de embedding de 1280 dimensiones a partir de imágenes RGB normalizadas de 224 x 224 píxeles. El artefacto es un único fichero `mobilenet_v3_large.tflite` de 10,89 MB con pesos en FP32 y un multiplicador de profundidad de canales de 0,75, pensado para equilibrar precisión y latencia en dispositivos de borde.

El problema que resuelve es concreto: dotar a aplicaciones Android, iOS, web, Python y Flutter de un pipeline de similitud visual y deduplicación de imágenes que se ejecuta íntegramente en el dispositivo, sin llamadas a servicios remotos. MediaPipe envuelve el modelo con utilidades listas para producción como normalización L2 opcional (`l2_normalize=True`), cuantización escalar opcional (`quantize=True`) y una función de similitud coseno integrada, lo que reduce el trabajo de integración a unas pocas líneas de código.

Es relevante ahora porque encaja en la estrategia de Google AI Edge en torno a LiteRT y MediaPipe Tasks: modelos pequeños, licencia Apache 2.0 y soporte multiplataforma de primera clase. No es un modelo generativo ni un LLM, sino un componente de visión por computador especializado; conviene evaluarlo como tal, midiendo calidad de recuperación y latencia, no con benchmarks de razonamiento o generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3-Large (bloques con SE, activaciones h-swish), exportada a TensorFlow Lite |
| Parámetros totales | no disponible (multiplicador de profundidad 0,75; fichero de 10,89 MB en FP32) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224 x 224 x 3) |
| Tipos de cuantización | pesos FP32 en el artefacto publicado; MediaPipe permite cuantización escalar de salida (`quantize=True`) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorFlow Lite (`.tflite`), un único fichero de 10.889.458 bytes, SHA-256 `11af3c560dfeed7737cb4c03c23bf52a8403020784192d4dea0b74862a12828d` |

## Arquitectura y entrenamiento

El modelo es una MobileNetV3-Large con multiplicador de profundidad 0,75, una red neuronal convolucional diseñada para eficiencia en dispositivos móviles. MobileNetV3 combina convoluciones separables en profundidad, bloques con atención tipo Squeeze-and-Excitation y activaciones h-swish, y en su variante Large incorpora además bloques de cuello de botella con conexiones residuales. En este artefacto se ha recortado la cabeza de clasificación y se expone la salida del tronco como vector de 1280 elementos (`StatefulPartitionedCall:0`), de modo que el modelo actúa como extractor de características y no como clasificador.

El entrenamiento original se realizó sobre ImageNet-1k, según declara la model card, y el artefacto conserva metadatos TFLite con el nombre `MobileNetV3 image classifier`, versión 1, autor MediaPipe y el fichero `labels.txt` empaquetado. La entrada esperada es `serving_default_inputs:0` con forma `[-1, 224, 224, 3]` en `float32`, con normalización media 0,0 y desviación 255,0, es decir, píxeles escalados al rango [0,1]. No se documentan en la información disponible detalles sobre fine-tuning específico para la tarea de embedding, funciones de pérdida de metric learning ni datos de entrenamiento adicionales más allá de ImageNet-1k.

## Capacidades

- Extracción de embeddings visuales de 1280 dimensiones a partir de imágenes RGB de 224 x 224, con salida `float32`.
- Similitud visual y búsqueda por similitud mediante distancia coseno, con normalización L2 opcional integrada en MediaPipe.
- Deduplicación de imágenes y detección de near-duplicates en colecciones locales.
- Ejecución on-device en Android, iOS, web (JavaScript/TypeScript), Python y Flutter a través de MediaPipe Tasks.
- Cuantización escalar opcional de los embeddings (`quantize=True`) para reducir el espacio de almacenamiento del índice vectorial.
- Procesamiento por lotes con dimensión de batch dinámica (`-1` en la forma de entrada).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente perceptivo.
- No tiene capacidades multilingües ni de audio; su dominio es exclusivamente la visión por computador.

## Casos de uso

- Deduplicación de fototecas en aplicaciones móviles: el modelo genera un embedding de 1280 dimensiones por imagen y permite agrupar duplicados o imágenes casi idénticas comparando distancias coseno, todo sin salir del dispositivo y con un artefacto de menos de 11 MB.
- Búsqueda visual inversa en catálogos de producto: se indexan los embeddings de las imágenes del catálogo y se consulta con una foto del usuario; la normalización L2 integrada facilita usar índice vectorial con producto interno como equivalente a similitud coseno.
- Moderación y agrupación de contenido en el borde: agrupar imágenes visualmente similares para detectar spam de imágenes repetidas o contenido duplicado en feeds, reduciendo el coste de subir cada imagen a un servicio central.
- Organización automática de álbumes y recuerdos: agrupar por similitud visual para construir colecciones temáticas o "mejores tomas" de una ráfaga, aprovechando el procesamiento por lotes con batch dinámico.
- Prefiltrado en pipelines de visión más pesados: usar el embedding barato como primera etapa para descartar candidatos antes de invocar un modelo mayor en servidor, reduciendo latencia y coste de inferencia en la nube.
- Detección de cambios y control de calidad industrial: comparar embeddings de imágenes de referencia frente a capturas de cámara para señalar desviaciones visuales en líneas de producción, con despliegue en dispositivos Android o embebidos.
- Aplicaciones web offline-first: el mismo modelo se ejecuta en el navegador mediante la integración web de MediaPipe, útil para herramientas de edición o clasificación de imágenes que deben funcionar sin conexión.

## Benchmarks y rendimiento

La model card incluye una sección de benchmarks de latencia de extremo a extremo del pipeline MediaPipe `ImageEmbedder`, pero en la información proporcionada la tabla aparece truncada y solo se muestra la cabecera (`Model Variant | Dev...`). No se dispone, por tanto, de cifras de latencia por dispositivo ni de métricas de calidad de recuperación (recall@k, mAP) para este artefacto concreto.

No se han publicado resultados de benchmarks de precisión o recuperación en la información disponible. Tampoco se dispone de comparaciones numéricas con otros extractores de embeddings en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo está pensado para ejecución en CPU/NPU de dispositivos móviles. En GPU de escritorio, el peso del fichero (10,89 MB) más activaciones de una imagen de 224 x 224 supone un consumo de memoria del orden de decenas de MB, aunque no se dispone de cifra oficial.
- GPU recomendadas: no se especifican en la información disponible; el modelo está optimizado para aceleradores móviles (GPU delegados de Android/iOS, NNAPI, Core ML) y CPU.
- ¿Cabe en GPU consumer? Sí, con enorme holgura por tamaño, aunque su destino natural no es una GPU de escritorio sino el borde; no se dispone de cifras de rendimiento en RTX 4090, A100 o H100.
- Opciones de despliegue: MediaPipe Tasks (Python, Android/Kotlin-Java, iOS/Swift, web/JavaScript, Flutter/Dart), intérprete TensorFlow Lite / LiteRT, y descarga vía `huggingface_hub` con `hf download`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card remite a la tabla de benchmarks de la documentación oficial de MediaPipe, que aparece truncada en los datos recibidos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada para establecer una comparación cuantitativa rigurosa. A continuación se indica únicamente lo que puede afirmarse con los datos disponibles:

| Modelo | Tipo | Salida | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-ImageEmbedder-MobileNet-V3-Large (este modelo) | CNN MobileNetV3-Large, 0,75 depth multiplier | Embedding 1280-d | 10,89 MB FP32 | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| Otras variantes de ImageEmbedder de MediaPipe | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de embeddings visuales de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la información proporcionada modelos comparables con parámetros, contexto, rendimiento y licencia verificables para una comparativa numérica.

## Limitaciones y advertencias

- El modelo se entrenó originalmente para clasificación en ImageNet-1k; los embeddings derivados del tronco no están necesariamente optimizados para metric learning, por lo que la calidad de recuperación puede ser inferior a la de extractores entrenados específicamente con pérdidas de similitud.
- La resolución de entrada está fijada en 224 x 224; detalles finos en imágenes de alta resolución pueden perderse tras el redimensionado.
- No procesa texto ni audio, y no dispone de modo de razonamiento, tool calling ni capacidades de agente.
- El multiplicador de profundidad 0,75 reduce el coste computacional a cambio de menor capacidad representacional que la variante completa de MobileNetV3-Large.
- No se documentan en la información disponible sesgos específicos del dataset más allá de los inherentes a ImageNet-1k; conviene auditar el comportamiento en dominios alejados de las categorías de ImageNet (imágenes médicas, industriales, satelitales).
- Riesgo de falsos positivos en deduplicación cuando imágenes distintas comparten composición o paleta similar; se recomienda calibrar el umbral de similitud coseno con datos propios.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto conserva metadatos y etiquetas de ImageNet cuyo uso debe verificarse por separado si se redistribuye.
- El repositorio tiene un tamaño declarado de 0,0 GB y muy pocas descargas (187 en el momento de la consulta), lo que sugiere poca validación comunitaria; conviene verificar el SHA-256 del fichero tras la descarga.
- La información de benchmarks de latencia está truncada en la model card recibida; no debe asumirse ningún rendimiento concreto sin medirlo en el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Large
- Fichero de pesos: https://huggingface.co/litert-community/MediaPipe-ImageEmbedder-MobileNet-V3-Large/blob/main/mobilenet_v3_large.tflite
- Documentación de MediaPipe Image Embedder: https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder
- Benchmarks de Image Embedder: https://developers.google.com/edge/mediapipe/solutions/vision/image_embedder#benchmarks
- Paper de MobileNetV3: https://arxiv.org/abs/1905.02244
- Guía de instalación en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación en Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_embedder/ios
- Notebook de Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_embedder/python/image_embedder.ipynb
- Ejemplo Web (TypeScript): https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-embedder.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_embedder
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_embedder
