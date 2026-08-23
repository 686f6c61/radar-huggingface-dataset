# kerasformers/tipsv2-b14

## Resumen

TIPSv2 es una familia de modelos de visión-lenguaje de tipo contrastivo desarrollada por Google DeepMind, que produce características de imagen ricas espacialmente y alineadas con embeddings de texto. Este repositorio, `kerasformers/tipsv2-b14`, es una conversión pura en Keras 3 del checkpoint original `google/tipsv2-b14`, manteniendo la misma arquitectura dual-encoder (torre visual estilo ViT con register tokens y torre de texto bidireccional) y el mismo objetivo contrastivo con escala por temperatura. El modelo está pensado para tareas de clasificación de imágenes sin entrenamiento previo (zero-shot) y para cualquier aplicación que requiera alinear imagen y texto en un espacio semántico común.

La conversión a Keras 3 permite ejecutar el modelo sin cambios en tres backends (TensorFlow, PyTorch y JAX), lo que facilita su integración en pipelines existentes y reduce la fricción de portabilidad. El checkpoint base es el de Google DeepMind, publicado con licencia Apache-2.0, y esta versión hereda esa licencia. Con 196 millones de parámetros en total (86M de visión y 110M de texto), es un modelo relativamente ligero para tareas de visión-lenguaje, con una resolución de entrada de 448 píxeles.

El interés de este modelo radica en su capacidad de producir características espacialmente densas (por ejemplo, para segmentación zero-shot) y en su diseño inspirado en DINOv2 con register tokens, que mejora la calidad de los mapas de atención y la representación de objetos en imágenes. Es una alternativa a CLIP y SigLIP que ofrece una mejor resolución espacial sin aumentar drásticamente el coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder: ViT (visión) + Transformer (texto) bidireccional, con register tokens en la torre de visión. Objetivo contrastivo con escala por temperatura. |
| Parametros totales | 196 millones (86M visión + 110M texto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplicable (modelo de visión-lenguaje, entrada de imagen de 448×448 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repositorio de 0.8 GB, probablemente safetensors o pesos de Keras) |

## Arquitectura y entrenamiento

TIPSv2 sigue la arquitectura de doble codificador de CLIP/SigLIP, pero con dos innovaciones principales: la torre de visión es un ViT estilo DINOv2 con register tokens, que produce características espacialmente densas y mejoran la localización de objetos, y la torre de texto es un Transformer bidireccional (en lugar de un modelo causal como en CLIP). Ambas torres se alinean mediante un objetivo contrastivo con escala por temperatura, similar al de SigLIP. El checkpoint base `google/tipsv2-b14` tiene 12 capas en cada torre y una dimensión de embedding de 768.

No se han proporcionado detalles sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre el procedimiento exacto de pretraining. La conversión a Keras 3 es una reimplementación de los pesos originales sin modificar la arquitectura ni los pesos. La resolución de entrada es de 448 píxeles, y el preprocesado solo reescala la imagen a [0,1] sin normalización por media o desviación estándar.

## Capacidades

- Clasificación de imágenes zero-shot: el modelo puede clasificar imágenes en categorías definidas por texto sin ningún entrenamiento previo sobre esas categorías (pipeline_tag: zero-shot-image-classification).
- Alineación multimodal: produce embeddings de imagen y de texto en un mismo espacio, permitiendo búsqueda por similitud, recuperación y comparación.
- Características espaciales densas: la torre de visión con register tokens genera mapas de características que conservan información de localización, lo que habilita tareas como segmentación zero-shot (según el repositorio oficial de Google DeepMind).
- Soporte de múltiples backends: al ser una conversión Keras 3, se puede ejecutar con TensorFlow, PyTorch o JAX sin cambios en el código.
- Extracción de características: las torres por separado pueden usarse como extractores de características para visión o texto.
- Sin capacidades de generación de texto ni tool calling: no se trata de un modelo generativo, sino de un encoder contrastivo.

## Casos de uso

- **Clasificación de imágenes sin etiquetas**: dado un conjunto de imágenes y una lista de descripciones textuales (p. ej., "un gato", "un perro", "un coche"), el modelo devuelve la probabilidad de que cada imagen corresponda a cada texto. Se usa en sistemas de etiquetado automático de imágenes, moderación de contenido o filtrado de imágenes en plataformas.
- **Búsqueda multimodal**: indexar imágenes y textos con el modelo y usar la similitud coseno para encontrar imágenes a partir de consultas en lenguaje natural, o viceversa. Adecuado para motores de búsqueda en fototecas o bases de datos de productos.
- **Segmentación zero-shot**: gracias a las características espaciales densas, el modelo puede generar máscaras de segmentación para objetos descritos en texto sin entrenamiento específico. Útil en aplicaciones de edición de imágenes, análisis de escenas o inspección industrial.
- **Recomendación visual**: combinar el embedding de imagen con el de texto para recomendar productos, moda o contenido visual basado en descripciones de usuario.
- **Moderación de contenido**: clasificar imágenes en categorías de contenido inapropiado (violencia, desnudez, etc.) mediante descripciones textuales, sin necesidad de entrenar un clasificador específico.
- **Análisis de imágenes médicas**: aunque no hay evidencia específica, el modelo podría usarse para tareas de clasificación de patologías a partir de descripciones de texto, aprovechando su capacidad zero-shot. Se recomienda validar antes en cada dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de visión-lenguaje específicas (p. ej., COCO Caption, ImageNet zero-shot) en la documentación de esta conversión ni en la información de HuggingFace. El modelo original de Google podría tener resultados publicados en el paper, pero no se han incluido en la documentación de este repositorio.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni de GPU para este modelo.
- El tamaño del repositorio es de 0,8 GB, lo que sugiere que el checkpoint completo puede cargarse en GPUs con al menos 2 GB de VRAM (en fp32), pero no se ha verificado.
- Al ser un modelo de ~196M de parámetros, es probable que pueda ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o similares, y también en CPU con cierta latencia.
- No se han proporcionado datos de latencia ni throughput.
- Opciones de despliegue: al ser una implementación Keras 3, se puede usar con el backend de JAX o TensorFlow en servidores de inferencia (p. ej., Vertex AI, Sagemaker), o mediante el pipeline de HuggingFace Transformers si se convierte a PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama (típicos de modelos de lenguaje, no de visión).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Disponibilidad | Contexto de imagen |
|---|---|---|---|---|---|
| **TIPSv2-b14** (este) | 196M | ViT + Transformer bidireccional, contrastive | Apache-2.0 | Hugging Face, Keras 3 | 448 px |
| CLIP ViT-B/14 (OpenAI) | ~150M | ViT + Transformer causal, contrastive | MIT (uso comercial) | Hugging Face | 224 px |
| SigLIP ViT-B/16 (Google) | ~150M | ViT + Transformer, contrastive con sigmoid | Apache-2.0 | Hugging Face | 224 px |
| DINOv2 ViT-B/14 (Meta) | ~86M | ViT (self-supervised, no contrastive con texto) | Apache-2.0 | Hugging Face | 224 px |

Nota: los datos de parámetros y arquitectura de CLIP, SigLIP y DINOv2 son aproximados y basados en información pública, pero no se han verificado en este análisis. No se dispone de comparativas de rendimiento en benchmarks para este modelo frente a los mencionados.

## Limitaciones y advertencias

- No se han evaluado sesgos específicos del modelo en la documentación de la conversión. Como es un modelo de visión-lenguaje entrenado con datos de internet, puede heredar sesgos de género, raza o cultura de los datos de entrenamiento.
- La torre de texto es bidireccional, pero no es un modelo generativo: no puede producir descripciones o respuestas en lenguaje natural.
- La resolución de entrada es fija a 448×448; imágenes de mayor resolución deben redimensionarse, lo que puede degradar la precisión en objetos pequeños.
- No se proporcionan detalles sobre el proceso de entrenamiento (datos, número de tokens, técnicas de alineación), por lo que no se puede evaluar la robustez del modelo en dominios específicos.
- Licencia Apache-2.0 permite uso comercial y modificación, pero debe citarse la fuente original (Google DeepMind) y esta conversión.
- El modelo no ha sido evaluado en tareas de razonamiento o generación de texto, no aplicable.
- No se garantiza la compatibilidad con versiones antiguas de Keras; requiere Keras 3 y los backends correspondientes.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/kerasformers/tipsv2-b14
- Modelo original de Google: https://huggingface.co/google/tipsv2-b14
- Paper TIPSv2 (arXiv:2604.12012): https://huggingface.co/papers/2604.12012
- Repositorio oficial de Google DeepMind (TIPS y TIPSv2): https://github.com/google-deepmind/tips
- Repositorio de KerasFormers: https://github.com/IMvision12/KerasFormers
- Colección de variantes TIPSv2 en HuggingFace: https://huggingface.co/collections/kerasformers/tipsv2-6a8a2cc3d2752994aa85ddb2
