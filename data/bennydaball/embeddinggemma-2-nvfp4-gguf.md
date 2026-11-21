# BennyDaBall/EmbeddingGemma-2-NVFP4-GGUF

## Resumen

EmbeddingGemma-2-NVFP4-GGUF es una cuantización en formato NVFP4 del modelo de embeddings google/embeddinggemma-2, desarrollado originalmente por Google DeepMind y redistribuido por BennyDaBall. Se trata de un modelo de extracción de características (feature-extraction) de 271.002.794 parámetros totales que proyecta texto, imágenes, vídeo y audio en un espacio vectorial común de 768 dimensiones, lo que lo hace apto para búsqueda semántica, recuperación de información y similitud de frases en entornos multilingües.

La relevancia de esta versión concreta reside en la compresión: el autor aplica una mezcla por tensor de NVFP4 y Q8_0 en lugar de un 4-bit uniforme, reduciendo el archivo principal a 184 MiB frente a los 532 MiB del BF16 original, con una pérdida de calidad mínima según las métricas reportadas. Los codificadores de visión y audio se mantienen intactos en BF16 en un archivo mmproj separado de 937 MiB.

El modelo está pensado para ejecutarse en llama.cpp (versión b11658 o superior) y LM Studio, con soporte específico para GPUs Blackwell mediante NVFP4, aunque el autor indica que otras GPUs deberían funcionar a través de los kernels de respaldo de llama.cpp. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (modelo base google/embeddinggemma-2); codificadores de visión y audio en mmproj separado |
| Parametros totales | 271.002.794 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona un valor por defecto de 262.144 en LM Studio y recomienda cargar con 2048 u 8192) |
| Tipos de cuantizacion | NVFP4 mixto con Q8_0 por tensor; codificadores multimodal en BF16 |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos: embeddinggemma-2-NVFP4.gguf, embeddinggemma-2-NVFP4-compact.gguf, mmproj-embeddinggemma-2-BF16.gguf) |
| Dimension del embedding | 768 |
| Tamano del repo | 1.4 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo base es google/embeddinggemma-2, desarrollado por Google DeepMind. Esta ficha describe únicamente la cuantización: el autor declara explícitamente que no se ha entrenado ni ajustado nada, y que la arquitectura, el entrenamiento, el espacio de embeddings multimodal y los prompts de tarea son obra de Google. Por tanto, los detalles de composición del dataset, número de tokens de entrenamiento y técnicas de alineación (RLHF/DPO) no están disponibles en la información proporcionada y deben consultarse en la model card del modelo original.

La innovación técnica de esta versión es el esquema de cuantización. En lugar de aplicar 4 bits de forma uniforme, el autor inspecciona cada tensor del modelo de texto y decide su precisión: los tensores que toleran bien NVFP4 se cuantizan a 4 bits, mientras que la proyección de salida final, las proyecciones de valor de atención, las compuertas y proyecciones de entrada por capa y las FFN de los extremos de la red se mantienen en Q8_0. El escalado NVFP4 es de dos niveles (una escala FP32 por tensor sobre una escala FP8 por cada 16 pesos), con la escala de cada bloque elegida para minimizar el error. Las activaciones se fijan a 8 bits mediante un flag en el propio archivo, que llama.cpp lee sin necesidad de variables de entorno.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información.
- Embeddings multimodales: texto, imágenes, vídeo y audio se proyectan en el mismo espacio de 768 dimensiones.
- Búsqueda de imágenes a partir de texto (text-to-image) y viceversa.
- Recuperación multilingüe, con evaluación reportada en alemán, bengalí y persa, además de pares de idiomas en STS17.
- Recuperación de código (evaluada con CosQA).
- Soporte de prompts de tarea de Google (por ejemplo, `task: search result | query: ` para consultas y `title: none | text: ` para documentos), necesarios para obtener el rendimiento esperado.
- Compatible con endpoints estilo OpenAI (`/v1/embeddings`) mediante llama-server.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y artículos con los prompts de tarea de Google y consultar mediante similitud vectorial; el modelo cabe en 184 MiB, por lo que puede desplegarse en el mismo nodo que la base de datos vectorial.
- Motor de recuperación para RAG: generar embeddings de fragmentos de documentos y de consultas de usuario en pipelines de generación aumentada, con calidad de recuperación (nDCG@10 de 75,51) muy próxima al BF16 original (76,06).
- Búsqueda de imágenes en catálogos: usar el archivo mmproj en BF16 junto con los flags `--image-min-tokens 280 --image-max-tokens 280` para indexar imágenes y recuperarlas por descripción textual, con un R@1 de 86,2 en Flickr-1k.
- Deduplicación y clustering de contenido multilingüe: calcular embeddings de artículos o tickets en varios idiomas y agrupar por similitud; el modelo mantiene un rendimiento de STS multilingüe de 82,49, ligeramente superior al BF16 reportado (82,46).
- Búsqueda sobre código fuente: indexar repositorios y recuperar fragmentos relevantes a partir de descripciones en lenguaje natural, aprovechando la evaluación incluida sobre CosQA.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar 184 MiB en el archivo principal, el modelo deja VRAM libre para el modelo generativo en arquitecturas RAG locales; el autor reporta entre 85.000 y 90.000 tokens por segundo en una RTX 5090.
- Filtrado y moderación semántica por similitud: comparar embeddings de mensajes entrantes contra un conjunto de referencia de contenido permitido o problemático, sin necesidad de un modelo generativo.

## Benchmarks y rendimiento

Datos reportados por el autor de la cuantización en la model card:

| Metrica | Original BF16 (532 MiB) | NVFP4 (184 MiB) | NVFP4-compact (169 MiB) |
|---|---:|---:|---:|
| Retrieval (nDCG@10) | 76,06 | 75,51 | 75,62 |
| Multilingual STS | 82,46 | 82,49 | 82,48 |
| Image search (R@1, Flickr-1k) | 86,7 | 86,2 | 86,2 |

La métrica de retrieval es la media sobre SciFact, NFCorpus, ArguAna, CosQA y recuperación en Wikipedia en alemán, bengalí y persa. La métrica de STS corresponde a STS17 sobre 11 pares de idiomas. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada: el archivo principal ocupa 184 MiB (169 MiB en la variante compact); con el mmproj multimodal en BF16 se añaden 937 MiB. En total, menos de 1,2 GiB para el modo multimodal completo.
- GPU recomendadas: el autor construyó y probó el modelo en una RTX 5090 (Blackwell), la arquitectura que soporta NVFP4 de forma nativa. Otras GPUs pueden ejecutarlo mediante los kernels de respaldo de llama.cpp, aunque el autor no lo ha verificado.
- Cabe holgadamente en cualquier GPU de consumo con suficiente VRAM para el runtime de llama.cpp; el cuello de botella es el modelo generativo que lo acompañe, no el embedding.
- Opciones de despliegue: llama.cpp (versión b11658 o superior) mediante `llama-server` con `--embedding --pooling mean`, y LM Studio. El endpoint expuesto es compatible con la API de embeddings de OpenAI (`/v1/embeddings`).
- Rendimiento: aproximadamente 85.000 a 90.000 tokens por segundo en una RTX 5090, tanto en el original como en la versión NVFP4; el autor señala que a este tamaño la cuantización no aporta velocidad, solo reducción de espacio en disco y descarga.
- Notas de configuración: usar `-ub 2048 -b 2048` (o valores que cubran la entrada más larga, ya que el modelo lee cada entrada en una sola pasada); en LM Studio, fijar la longitud de contexto a 2048 u 8192, porque el valor por defecto de 262.144 impide cargar cualquier GGUF de EmbeddingGemma 2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EmbeddingGemma-2-NVFP4 (esta ficha) | 271 M | no disponible | GGUF NVFP4/Q8_0 | Apache 2.0 | 184 MiB; multimodal con mmproj; requiere llama.cpp b11658+ |
| google/embeddinggemma-2 (BF16) | 271 M | no disponible | safetensors | Apache 2.0 | 532 MiB; referencia de calidad; sin dependencia de kernels NVFP4 |
| embeddinggemma-2-NVFP4-compact | 271 M | no disponible | GGUF NVFP4/Q8_0 | Apache 2.0 | 169 MiB; misma familia, ligeramente menor calidad en retrieval |

No se dispone en la información proporcionada de datos sobre otros modelos de embeddings comparables (por ejemplo, de otras familias) para ampliar la comparativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta tool calling; su uso se limita a la producción de vectores.
- El rendimiento depende de usar los prompts de tarea de Google; omitirlos degrada la calidad de recuperación.
- El modo multimodal requiere pasar los flags `--image-min-tokens 280 --image-max-tokens 280` en llama.cpp; sin ellos, las imágenes pequeñas se procesan a resolución nativa y la búsqueda de imágenes empeora. El autor advierte que esto afecta a todos los GGUF de este modelo.
- En LM Studio es obligatorio reducir la longitud de contexto al cargar; el valor por defecto provoca fallo de carga en cualquier GGUF de la familia.
- NVFP4 es un formato de Blackwell: en GPUs anteriores funciona mediante kernels de respaldo no verificados por el autor, con posible degradación de rendimiento.
- La cuantización no aporta ganancia de velocidad a este tamaño; solo reduce el espacio en disco y la descarga.
- Riesgo de sesgos y alucinaciones: no se documentan en la información disponible para esta cuantización; deben evaluarse en la model card del modelo base de Google.
- Licencia Apache 2.0, que permite uso comercial; se recomienda conservar la atribución a Google DeepMind como autor del modelo original y a BennyDaBall como autor de la cuantización.
- El repositorio tiene 0 likes y 783 descargas en el momento de la consulta, por lo que la validación comunitaria es limitada.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/BennyDaBall/EmbeddingGemma-2-NVFP4-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Apoyo al autor: https://ko-fi.com/bennydaball
