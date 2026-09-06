# DeepanBabu/gte-Qwen2-1.5B-instruct

## Resumen

DeepanBabu/gte-Qwen2-1.5B-instruct es un modelo de embeddings textuales basado en la arquitectura Qwen2-1.5B, desarrollado originalmente por Alibaba-NLP y publicado en HuggingFace bajo el usuario DeepanBabu. Se trata de un modelo encoder que genera vectores densos de 1536 dimensiones a partir de texto, pensado para tareas de búsqueda semántica, recuperación de documentos, clustering y similitud entre oraciones. Su ventana de contexto alcanza los 32.000 tokens, lo que lo hace especialmente útil para indexar documentos largos en sistemas de recuperación aumentada (RAG). El modelo es multilingüe, aunque la model card no especifica la lista completa de idiomas. Es relevante porque ofrece un equilibrio entre tamaño y rendimiento: al basarse en un modelo de 1.500 millones de parámetros, puede ejecutarse en hardware de consumo con un coste computacional moderado, manteniendo una calidad de embeddings competitiva dentro de la familia gte-Qwen2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) con atención bidireccional |
| Parametros totales | 1.776.197.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (idiomas específicos no disponibles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de embeddings construido sobre la base del LLM Qwen2-1.5B. A diferencia de un modelo autogenerativo causal, aplica atención bidireccional para codificar el contexto completo de la entrada, lo que permite obtener representaciones densas de 1536 dimensiones. Esta adaptación de un LLM a encoder es una técnica habitual para crear modelos de embeddings de alta calidad reutilizando pesos preentrenados. En la información disponible no se detalla el corpus de entrenamiento, el número de tokens procesados ni la composición del dataset. Tampoco se mencionan procesos de RLHF o DPO, que no aplican a un modelo de este tipo. La innovación técnica destacable es el uso de la arquitectura Qwen2 como base y su conversión a modelo de similitud semántica con soporte de contexto largo.

## Capacidades

- Generación de embeddings densos de 1536 dimensiones para representar texto.
- Búsqueda semántica y recuperación de documentos en colecciones grandes.
- Clasificación de oraciones y textos mediante la extracción de vectores.
- Agrupación (clustering) de documentos por similitud temática.
- Cálculo de similitud entre pares de textos (similitud coseno, euclidiana).
- Reranking de resultados en pipelines de búsqueda.
- Soporte multilingüe, según fuentes externas.
- No soporta tool calling, function calling ni generación de texto: es un modelo puramente encoder.

## Casos de uso

- Recuperación aumentada por generación (RAG): el modelo indexa documentos y recupera fragmentos relevantes para alimentar a un LLM generativo, gracias a su ventana de contexto de 32.000 tokens.
- Búsqueda semántica en bases de conocimiento: permite encontrar artículos, registros o FAQs por significado en lugar de coincidencia exacta de palabras clave.
- Clustering de documentos en repositorios corporativos: agrupa textos similares para organizar bibliotecas, detectar temas recurrentes o clasificar tickets de soporte.
- Clasificación de sentimiento en reseñas: los embeddings se alimentan a un clasificador lineal o a un modelo ligero para predecir la polaridad de opiniones.
- Detección de duplicados en foros y sistemas de atención al cliente: identifica preguntas o artículos casi idénticos mediante la distancia entre vectores.
- Reranking de resultados de búsqueda: combina un recuperador léxico inicial con este modelo para reordenar los primeros resultados y mejorar la precisión.

## Benchmarks y rendimiento

El model-index incluido en la model card de HuggingFace está etiquetado como "gte-qwen2-7B-instruct", lo que indica que los resultados declarados corresponden a la variante de 7.000 millones de parámetros, no a la variante 1.5B. A continuación se muestran algunos de los resultados declarados por el autor para la variante 7B. Para la variante 1.5B, una fuente externa menciona una puntuación MTEB de 67,16 en recuperación en inglés, pero no se dispone de un desglose por tarea.

| Dataset | Métrica | Valor (variante 7B) |
|---|---|---|
| MTEB AmazonCounterfactualClassification (en) | Accuracy | 83,99 |
| MTEB AmazonPolarityClassification | Accuracy | 96,61 |
| MTEB ArguAna | ndcg_at_10 | 69,72 |
| MTEB BIOSSES | cos_sim_spearman | 82,11 |
| MTEB Banking77Classification | Accuracy | 87,31 |

No se han publicado resultados de benchmarks específicos para la variante 1.5B en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo requiere aproximadamente 6 GB; en FP16, unos 3 GB, más la memoria para activaciones y el tamaño del batch.
- GPU recomendadas: RTX 3060 12GB o superior; también puede ejecutarse en GPU de datacenter como A10G o T4.
- Sí cabe en GPU de consumo: con FP16 y batches pequeños, es viable en tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: sentence-transformers, HuggingFace Transformers, text-embeddings-inference (TEI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la información proporcionada solo se menciona una alternativa comparable, la variante más grande de la misma familia. No se disponen de datos comparativos con otros modelos de embeddings en la información disponible.

| Modelo | Parametros | Contexto | Dimensiones | Licencia |
|---|---|---|---|---|
| DeepanBabu/gte-Qwen2-1.5B-instruct | 1.5B | 32.000 tokens | 1536 | Apache-2.0 |
| gte-qwen2-7B-instruct | 7B | 32.000 tokens | No disponible | Apache-2.0 |

## Limitaciones y advertencias

- La model card incluye un model-index etiquetado como "gte-qwen2-7B-instruct", por lo que los benchmarks publicados no corresponden a esta variante 1.5B y pueden inducir a error.
- No se dispone de información sobre sesgos conocidos ni sobre la cobertura real de idiomas, a pesar de que se indica que es multilingüe.
- El modelo no genera texto, por lo que el riesgo de alucinación no aplica, pero la calidad de los embeddings puede degradarse en textos extremadamente largos o con jerga muy específica.
- La licencia Apache-2.0 permite uso comercial sin restricciones, aunque se recomienda revisar la atribución y los términos de la base Qwen2.
- No hay datos oficiales de rendimiento para la variante 1.5B, lo que dificulta una evaluación comparativa rigurosa.

## Enlaces

- HuggingFace: https://huggingface.co/DeepanBabu/gte-Qwen2-1.5B-instruct
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gte-qwen2-15b-instruct-alibaba-nlp
