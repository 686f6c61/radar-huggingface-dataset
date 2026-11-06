# gatilin/muse-spark-open-vision-encoder

## Resumen

Muse Spark Open vision encoder es un componente extraído de forma comunitaria del modelo multimodal Muse Spark Open 816B-A42B de Meta. No se trata de un modelo completo, sino únicamente del bloque de percepción visual: la torre de visión (vision tower), el adaptador de visión (vision adapter) y la proyección de visión (vision projection). El modelo de lenguaje y la torre de audio del modelo original no están incluidos. Lo publica el usuario gatilin en Hugging Face bajo la licencia Muse Spark Open.

El componente está pensado para extracción de características de imagen y vídeo (pipeline `image-feature-extraction`) y para su uso como codificador visual dentro de arquitecturas image-text-to-text. Con 1.928.137.216 parámetros (aproximadamente 1,93 mil millones) y un repositorio de 3,9 GB en formato safetensors, es un bloque de tamaño medio que puede ejecutarse en GPU de consumo. Su relevancia radica en que permite reutilizar la percepción visual del modelo insignia de Meta de forma aislada, sin necesidad de desplegar los 816B de parámetros del modelo completo.

La extracción se realizó a partir de la revisión oficial `0fb02478b02565b2ce7fc57e6051c91172774ac9`, con los bytes fuente obtenidos del espejo comunitario de ModelScope. El autor documenta en `extraction.json` y `tensor_mapping.json` los identificadores de commit de los shards de origen, los rangos de tensores, las comprobaciones de bytes y el SHA-256 del componente, preservando claves, dtypes y formas originales. Se trata, por tanto, de una extracción verificable pero no de un modelo entrenado de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Torre de visión + adaptador + proyección (componente de un modelo multimodal tipo transformer) |
| Parámetros totales | 1.928.137.216 (~1,93B) |
| Parámetros activos | no disponible (no es un componente MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; pesos publicados en safetensors con dtypes originales preservados |
| Idiomas soportados | no disponible |
| Licencia | muse-spark-open (Muse Model License + Usage Policy) |
| Formato de pesos | safetensors |
| Pipeline | image-feature-extraction |
| Modelo base | meta-models/Muse-Spark-Open-816B-A42B |
| Revisión de origen | 0fb02478b02565b2ce7fc57e6051c91172774ac9 |
| Tamaño del repositorio | 3,9 GB |
| Librería | transformers (requiere Transformers 5.21.1) |
| Dependencias | PyTorch, torchvision, Transformers 5.21.1, accelerate, safetensors, Pillow |

## Arquitectura y entrenamiento

El componente reproduce la ruta visual del modelo Muse Spark Open 816B-A42B: una torre de visión que procesa los píxeles de entrada (`pixel_values`) junto con la información de rejilla (`image_grid_thw`) y devuelve un `last_hidden_state`; a continuación, un adaptador de visión y una proyección que transforman esas características visuales en el espacio que consumiría el modelo de lenguaje. El código de carga se distribuye dentro del propio repositorio (`component.py`, con las funciones `load_model` y `load_processor`), y el procesador genera las entradas a partir de imágenes RGB.

No se ha realizado ningún entrenamiento adicional: los pesos son una extracción byte a byte de los shards oficiales, con los tensores correspondientes al bloque visual. El autor conserva claves, dtypes y formas originales y documenta la procedencia en `extraction.json` y `tensor_mapping.json`, incluyendo tamaños de shard y SHA-256 que coinciden con los metadatos de la revisión oficial. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que esos detalles pertenecen al modelo base y no se recogen en la model card de esta extracción.

## Capacidades

- Extracción de características visuales de imágenes: genera un `last_hidden_state` a partir de `pixel_values` y `image_grid_thw`.
- Extracción de características visuales de vídeo: la model card indica que el componente maneja características visuales de imagen y vídeo.
- Proyección al espacio del modelo de lenguaje: el adaptador y la proyección permiten obtener representaciones visuales listas para ser consumidas por un LLM en arquitecturas image-text-to-text.
- Uso como codificador visual independiente en pipelines de `image-feature-extraction`.
- Integración con Transformers 5.21.1 y con el procesador incluido en el repositorio.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades de audio: esas funciones residen en el modelo de lenguaje y la torre de audio del modelo base, que no forman parte de esta extracción.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: usar las características proyectadas como embeddings para indexar un catálogo de imágenes y recuperar por similitud vectorial, aprovechando que el componente aísla la percepción visual sin cargar el LLM.
- Clasificación y etiquetado de imágenes a gran escala: extraer embeddings y entrenar una cabeza ligera de clasificación encima, útil cuando se quiere reutilizar la percepción de un modelo de referencia sin reentrenar la torre de visión.
- Preprocesamiento para pipelines image-text-to-text propios: conectar la salida del adaptador y la proyección a un LLM propio para construir un sistema multimodal a medida, en lugar de desplegar el modelo completo de 816B.
- Análisis de vídeo: extracción de características por fotograma o por clip para tareas de detección de cambios, segmentación o resumen visual, dado que la model card indica soporte de vídeo.
- Moderación y análisis de contenido visual: generar representaciones de imágenes para alimentar clasificadores de contenido en un pipeline de revisión, manteniendo el componente visual separado del resto del sistema.
- Investigación en alineación visión-lenguaje: estudiar cómo se proyectan las características visuales al espacio del LLM utilizando exactamente los pesos oficiales de Muse Spark Open, con trazabilidad documentada mediante hashes.
- Sistemas de recomendación visual: calcular embeddings de imágenes de producto o de contenido para similitud y ranking en motores de recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia un smoke-test en CPU descrito en `validation.json`, que no establece equivalencia con la inferencia completa de Muse Spark ni con los kernels de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,93B parámetros, en BF16 los pesos ocupan aproximadamente 3,9 GB; en FP32, unos 7,7 GB. A ello hay que sumar la memoria de activaciones, que depende de la resolución y del número de parches de imagen o fotogramas procesados.
- GPU recomendadas: A100 o H100 para procesamiento por lotes de imágenes o vídeo a alta resolución; RTX 4090 o RTX 3090 para uso individual con lotes pequeños.
- GPU de consumo: cabe en GPUs con 8-12 GB de VRAM o más en BF16/FP16 para imágenes sueltas; para vídeo o lotes grandes conviene 16 GB o más.
- Opciones de despliegue: la model card solo documenta la carga mediante el script `component.py` del repositorio con Transformers 5.21.1, PyTorch, torchvision, accelerate, safetensors y Pillow. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparación rigurosa con otros codificadores visuales (por ejemplo, CLIP, SigLIP o los towers de visión de otros modelos multimodales). La tabla siguiente recoge únicamente los datos confirmados de este componente frente a lo que se conoce del modelo base del que procede.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse Spark Open vision encoder (este) | ~1,93B | no disponible | muse-spark-open | Hugging Face (gatilin) |
| Muse Spark Open 816B-A42B (modelo base completo) | 816B totales, 42B activos (según el nombre del modelo) | no disponible | muse-spark-open | Hugging Face (meta-models) y ModelScope |

## Limitaciones y advertencias

- No es un modelo completo: no genera texto ni responde a instrucciones; solo produce características visuales. No debe evaluarse como un sistema multimodal autónomo.
- La licencia Muse Spark Open contiene condiciones de atribución y ciertas condiciones para servicios comerciales; es necesario revisar `LICENSE.md` y `USE_POLICY.md` antes de un uso en producción.
- La validación publicada se limita a un smoke-test en CPU; no hay evidencia publicada de equivalencia con la inferencia completa del modelo original ni con kernels de GPU.
- Al ser una extracción comunitaria y no una publicación oficial de Meta, la trazabilidad depende de los ficheros `extraction.json` y `tensor_mapping.json` aportados por el autor; conviene verificar los hashes antes de desplegar.
- No hay información sobre sesgos, riesgo de alucinación (no aplica directamente a un codificador visual), idiomas soportados ni limitaciones de contexto.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia de alto rendimiento, lo que limita las opciones de optimización.
- El rendimiento con vídeo o imágenes de alta resolución puede requerir más memoria de la estimada solo por el tamaño de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/muse-spark-open-vision-encoder
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Espejo comunitario en ModelScope: https://modelscope.cn/models/meta-models/Muse-Spark-Open-816B-A42B
- Página de Meta sobre Muse Spark Open: https://dev.meta.ai/models/muse-spark-open
- Documentación de la API de Meta: https://dev.meta.ai/docs/muse-spark-open
