# nomic-ai/nomic-embed-text-v1.5

## Resumen

Nomic Embed Text v1.5 es un modelo de embeddings de texto desarrollado por Nomic AI y publicado en HuggingFace bajo la licencia Apache-2.0. Está diseñado para resolver tareas de similitud semántica, recuperación de información y clasificación de textos, generando representaciones vectoriales de documentos en inglés. Su arquitectura se basa en NomicBERT, una variante de BERT modificada por el equipo de Nomic, y cuenta con 136.731.648 parámetros. El modelo ha sido validado en el benchmark MTEB, donde presenta resultados sólidos en tareas de clasificación, agrupación y recuperación. Su relevancia actual radica en que es una opción ligera y permissiva para integrar embeddings en sistemas de búsqueda semántica y pipelines de RAG, con soporte para inferencia en múltiples formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NomicBERT (variante de BERT) |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en BERT, específicamente la variante NomicBERT, diseñada por Nomic AI para mejorar la representación semántica de textos. No se dispone en la información proporcionada de detalles sobre los datos de entrenamiento (tamaño del corpus, composición del dataset) ni sobre la aplicación de técnicas de ajuste como RLHF o DPO. El modelo está orientado a tareas de extracción de características (feature-extraction) y similitud de frases (sentence-similarity), tal y como se refleja en su configuración de pipeline en HuggingFace.

## Capacidades

- Genera embeddings de texto para calcular similitud semántica entre frases, párrafos o documentos.
- Suele utilizarse en tareas de recuperación de información (retrieval), incluyendo búsqueda semántica y ranking de documentos.
- Permite clasificación de texto mediante fine-tuning o usando los vectores generados como entrada a un clasificador.
- Es apto para tareas de agrupación (clustering) y reranking, como demuestran los resultados en el benchmark MTEB.
- Compatible con las librerías sentence-transformers, Transformers.js y text-embeddings-inference.
- Soporta pesos en safetensors y formato ONNX para despliegue en entornos JavaScript y inferencia optimizada.
- No es un modelo generativo: no produce texto libre, ni soportan tool calling, visión o audio.

## Casos de uso

1. Búsqueda semántica interna: para indexar manuales, documentación técnica o bases de conocimiento corporativas en inglés y recuperar los fragmentos más relevantes a partir de una consulta en lenguaje natural, usando la similitud coseno entre embeddings.
2. Sistemas RAG (Retrieval Augmented Generation): como componente de recuperación para seleccionar contexto relevante que alimente a un LLM generativo. El modelo es adecuado por su licencia Apache-2.0 y su coste computacional reducido.
3. Atención al cliente automatizada: clasificar tickets de soporte o preguntas frecuentes en categorías mediante embeddings pre-procesados y un clasificador simple. Permite gestionar grandes volúmenes de conversaciones en inglés.
4. Detección de duplicados y contenidos similares: comparar artículos, anuncios o respuestas para identificar variantes casi idénticas. Los embeddings de 136M parámetros ofrecen un equilibrio razonable entre calidad y velocidad.
5. Reranking de resultados de búsqueda: combinar un recuperador basado en palabras clave con este modelo para reordenar los resultados obtenidos y mejorar la precisión en motores de búsqueda documental.
6. Análisis de sentimiento o categorización de textos en inglés: generar representaciones vectoriales de reseñas, encuestas o comentarios y entrenar un clasificador lineal sobre dichas representaciones. Su tamaño permite un fine-tuning ágil incluso en hardware modesto.

## Benchmarks y rendimiento

Se han publicado resultados del modelo en el benchmark MTEB, tal y como aparecen en la model card. Los valores siguientes son los declarados por el autor para el punto de control `epoch_0_model`:

| Dataset (MTEB) | Tarea | Metrica | Valor |
|---|---|---|---|
| AmazonCounterfactualClassification (en) | Clasificacion | Accuracy | 75.21 |
| AmazonCounterfactualClassification (en) | Clasificacion | F1 | 69.36 |
| AmazonPolarityClassification | Clasificacion | Accuracy | 91.81 |
| AmazonReviewsClassification (en) | Clasificacion | Accuracy | 47.16 |
| ArguAna | Recuperacion | NDCG@10 | 48.01 |
| ArxivClusteringP2P | Clustering | V-measure | 45.69 |
| ArxivClusteringS2S | Clustering | V-measure | 36.35 |
| Bank77Classification | Clasificacion | Accuracy | 84.25 |
| BIOSSES | Similaridad textual (STS) | cos_sim_spearman | 84.25 |
| CQADupstackAndroidRetrieval | Recuperacion | MRR@10 | 48.63 |

No se han encontrado resultados en benchmarks como MMLU, HumanEval o GSM8K en la información disponible, ya que el modelo no está orientado a tareas de razonamiento generativo.

## Requisitos de hardware

- VRAM estimada: no se han publicado requisitos oficiales. Dado el número de parámetros (136,7M), en FP32 la matriz de pesos ocuparía aproximadamente 547 MB, por lo que es probable que el modelo funcione en GPUs con menos de 1 GB de memoria dedicada.
- GPU recomendadas: no disponible. Por su tamaño, es esperable que funcione correctamente en GPUs de consumo como una RTX 3060 o inferiores, e incluso en CPU.
- Compatibilidad con hardware de consumo: presumiblemente sí, al tratarse de un modelo ligero; no hay datos oficiales que lo confirmen.
- Opciones de despliegue: sentence-transformers, ONNX Runtime, Transformers.js y text-embeddings-inference.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con otros modelos de embeddings de la misma categoría. Por tanto, no es posible presentar una comparativa con parámetros, contexto, rendimiento o licencia verificados.

## Limitaciones y advertencias

- Modelo entrenado únicamente para inglés, tal y como se recoge en los idiomas soportados. No se recomienda su uso directo en texto en español u otros idiomas.
- No es un modelo generativo: no puede usarse para completar texto, responder preguntas de forma libre ni generar contenido.
- La longitud de contexto no está especificada en la información disponible, por lo que se desconocen los límites de entrada seguros en producción.
- No se proporciona documentación sobre sesgos ni evaluación de sesgos. Como todo modelo de embeddings, puede heredar sesgos presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero la calidad y adecuación a casos de uso concretos debe validarse con datos propios.
- Al ser un modelo de embeddings, su rendimiento depende en gran medida de la distribución del dominio de aplicación; los resultados en MTEB no garantizan el comportamiento en dominios especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Paper 1: https://arxiv.org/abs/2402.01613
- Paper 2: https://arxiv.org/abs/2205.13147
