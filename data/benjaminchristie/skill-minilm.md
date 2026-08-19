# benjaminchristie/skill-minilm

## Resumen

`benjaminchristie/skill-minilm` es un modelo de embeddings de frases (sentence embeddings) basado en `sentence-transformers/all-MiniLM-L6-v2`, fine-tuneado específicamente para medir similitud semántica entre términos de un vocabulario de habilidades (skill vocab). El autor, benjaminchristie, lo ha entrenado con un conjunto de datos reducido de 266 pares de frases cortas, probablemente orientado a dominios como robótica o automatización de tareas, donde se necesitan emparejar acciones como "grasp", "open gripper" o "seal". El modelo mapea frases a un espacio vectorial denso de 384 dimensiones y utiliza similitud coseno para comparar.

Con 22,7 millones de parámetros y una longitud máxima de contexto de 256 tokens, es un modelo ligero y eficiente, adecuado para entornos con recursos limitados. Su relevancia actual radica en su especialización: en lugar de ser un modelo genérico de embeddings, está ajustado para un vocabulario técnico concreto, lo que puede mejorar la precisión en tareas de retrieval y matching dentro de ese dominio. Sin embargo, su utilidad fuera de ese ámbito es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6-v2) con pooling mean y normalizacion L2 |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniLM-L6-v2, una variante de BERT con 6 capas de transformer, diseñada para producir embeddings de frases eficientes. La estructura completa incluye un transformer BERT para extracción de características, una capa de pooling por media (mean pooling) y una capa de normalización. El entrenamiento se realizó con la función de pérdida `CosineSimilarityLoss` sobre un dataset de 266 pares de frases, donde cada par tiene una etiqueta de similitud entre 0 y 1. No se han publicado detalles sobre el proceso de entrenamiento (épocas, optimizador, etc.) ni sobre la composición exacta del dataset, más allá de que las frases son cortas (entre 3 y 6 tokens de media).

## Capacidades

- Generación de embeddings de frases de 384 dimensiones para tareas de similitud semántica y retrieval.
- Similitud coseno entre frases, optimizada para vocabulario de habilidades técnicas (ej. "grasp", "open gripper", "seal").
- Fine-tuneado para dominios específicos como robótica o automatización, donde las frases son cortas y descriptivas.
- Compatible con la librería `sentence-transformers` para integración sencilla en pipelines de NLP.
- No soporta generación de texto, tool calling, agentes, visión ni audio. Es exclusivamente un modelo de embeddings de texto.

## Casos de uso

- Matching de descripciones de habilidades en robótica: el modelo puede emparejar comandos como "grasp" con acciones equivalentes como "open gripper" o "retrieve", facilitando la traducción entre vocabularios de diferentes sistemas.
- Búsqueda semántica en catálogos de habilidades: permite indexar y recuperar habilidades o tareas a partir de consultas en lenguaje natural, mejorando la precisión frente a búsquedas por palabras clave.
- Clasificación de frases cortas en dominios técnicos: útil para etiquetar o categorizar acciones en entornos industriales o de automatización.
- Preprocesamiento para pipelines de NLP: los embeddings generados pueden alimentar modelos de clasificación o clustering en sistemas de gestión de tareas.
- Sistemas de recomendación de tareas: basándose en la similitud entre descripciones, se pueden sugerir acciones o procedimientos relacionados.
- Evaluación de consistencia de vocabulario: ayuda a detectar sinónimos o variaciones en la terminología usada en documentación técnica.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el dataset de validación `skill-vocab-val`, evaluado con `EmbeddingSimilarityEvaluator`:

| Metrica | Valor |
|---|---|
| Pearson Cosine | 0.5522 |
| Spearman Cosine | 0.5246 |

No se han publicado comparaciones con otros modelos en el mismo dataset, ni resultados en benchmarks estándar como MTEB o STS.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en GPU (el modelo tiene 22,7M de parámetros, aproximadamente 90 MB en FP32).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (ej. GTX 1050 Ti, RTX 2060) o incluso CPU.
- Cabe en GPUs consumer de gama baja y en entornos sin GPU (inferencia en CPU con latencia de milisegundos).
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TEI) según los tags del modelo, y compatible con frameworks como Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por el tamaño del modelo se espera una latencia inferior a 10 ms por frase en GPU y alrededor de 50-100 ms en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Notas |
|---|---|---|---|---|---|
| benjaminchristie/skill-minilm | 22,7M | 256 | 384 | no disponible | Fine-tuneado para vocabulario de habilidades |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7M | 256 | 384 | Apache 2.0 | Modelo base, no especializado |
| sentence-transformers/all-mpnet-base-v2 | 109M | 384 | 768 | Apache 2.0 | Más grande, mejor rendimiento general en STS |

No se dispone de comparativas de rendimiento en el dataset `skill-vocab-val` para estos modelos alternativos, por lo que no es posible cuantificar la mejora relativa del fine-tuning.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (266 muestras), lo que puede provocar sobreajuste y limitar la generalización a frases fuera del vocabulario visto.
- Sesgos inherentes al modelo base MiniLM y al dataset específico de habilidades; no se ha evaluado su comportamiento en otros dominios.
- No es un modelo generativo, por lo que no presenta riesgo de alucinación, pero sí puede producir embeddings poco discriminativos para frases no relacionadas con el dominio.
- Licencia no especificada: no se puede garantizar su uso comercial sin consultar al autor.
- Contexto limitado a 256 tokens, insuficiente para documentos largos.
- Sin soporte multilingüe declarado; probablemente entrenado solo con datos en inglés (aunque no se confirma).

## Enlaces

- [HuggingFace - benjaminchristie/skill-minilm](https://huggingface.co/benjaminchristie/skill-minilm)
- [Modelo base: sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Paper de MiniLM (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Documentación de Sentence Transformers](https://sbert.net)
- [Repositorio de Sentence Transformers en GitHub](https://github.com/huggingface/sentence-transformers)
