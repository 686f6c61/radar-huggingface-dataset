# el1jah184/retriever-sparse-splade

## Resumen

El modelo `el1jah184/retriever-sparse-splade` es un codificador disperso (sparse encoder) basado en la arquitectura SPLADE, ajustado a partir del modelo `opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1`. Está diseñado para tareas de búsqueda semántica y recuperación de información, transformando texto en vectores dispersos de alta dimensionalidad (105 879 dimensiones) donde solo se activan unas pocas dimensiones por entrada. Esto permite una indexación eficiente y búsqueda por producto punto en motores de búsqueda compatibles con representaciones dispersas, como OpenSearch o Elasticsearch.

El modelo fue desarrollado por el usuario `el1jah184` y publicado en Hugging Face. Utiliza la librería `sentence-transformers` y se entrenó con un conjunto de datos JSON de 415 ejemplos, empleando funciones de pérdida combinadas como `CachedSpladeLoss`, `SparseMultipleNegativesRankingLoss` y `FlopsLoss`. Con 167,4 millones de parámetros y una longitud de contexto máxima de 512 tokens, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en ofrecer una alternativa de código abierto y ajustada para recuperación dispersa multilingüe, aunque la información pública sobre licencia e idiomas es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPLADE (Sparse Lexical and Expansion Model) sobre BERT (BertForMaskedLM) con pooling max |
| Parametros totales | 167 463 831 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para este ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags y tamaño del repositorio) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SPLADE, que combina un transformer BERT con una capa de pooling por máximo (max pooling) sobre las representaciones de los tokens para producir un vector disperso. La salida es un espacio de 105 879 dimensiones, donde cada dimensión corresponde a un término del vocabulario; el valor de cada dimensión indica la relevancia del término para la entrada. Esta representación dispersa permite utilizar índices invertidos y algoritmos de búsqueda por producto punto, logrando una eficiencia alta en corpus grandes.

El entrenamiento se realizó sobre un conjunto de datos JSON de 415 ejemplos (según el tag `dataset_size:415`), partiendo del modelo base `opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1`. Se emplearon tres funciones de pérdida combinadas: `CachedSpladeLoss` para optimizar el solapamiento léxico, `SparseMultipleNegativesRankingLoss` para aprendizaje contrastivo con negativos, y `FlopsLoss` para regularizar la escasez de las representaciones. No se ha publicado información sobre la composición del dataset, el número total de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de representaciones dispersas para búsqueda semántica y recuperación de información.
- Búsqueda por producto punto (dot product) en espacios de alta dimensionalidad (105 879 dimensiones).
- Alta escasez: las consultas activan en promedio 215 dimensiones (ratio de escasez del 99,80 %) y los documentos 361 dimensiones (ratio del 99,66 %), lo que facilita la indexación eficiente.
- Soporte para texto, con una longitud máxima de 512 tokens.
- Integración con la librería `sentence-transformers` y compatibilidad con `text-embeddings-inference` (TEI) para despliegue en producción.
- No incluye capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso; es exclusivamente un modelo de embeddings dispersos.

## Casos de uso

- Búsqueda semántica en corpus técnicos o legales: el modelo convierte consultas y documentos en vectores dispersos que pueden indexarse en OpenSearch o Elasticsearch, permitiendo búsquedas por similitud léxica y semántica en dominios especializados.
- Recuperación de pasajes para sistemas de preguntas y respuestas: sirve como componente de recuperación en pipelines RAG, seleccionando pasajes relevantes de un corpus antes de pasarlos a un modelo generativo.
- Deduplicación de documentos: al comparar representaciones dispersas de documentos, se pueden identificar duplicados o versiones similares en grandes colecciones.
- Clasificación de texto por similitud: agrupación de textos en categorías según su representación dispersa, útil para organizar documentos internos.
- Indexación de contenido multilingüe: aunque no se especifican los idiomas, el modelo base es multilingüe, por lo que puede aplicarse a corpus con varios idiomas, siempre que se valide el rendimiento.
- Filtrado de contenido en motores de búsqueda: uso como reranker o filtro inicial para reducir el espacio de búsqueda antes de aplicar modelos más pesados.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card, obtenidos con el evaluador `irs_evaluator` (no verificados de forma independiente). Se reportan métricas de precisión, recall, NDCG, MRR y MAP para la tarea de recuperación dispersa.

| Metrica | Valor |
|---|---|
| Dot Accuracy@1 | 0,78125 |
| Dot Accuracy@3 | 0,92411 |
| Dot Accuracy@5 | 0,95536 |
| Dot Accuracy@10 | 0,98661 |
| Dot Precision@1 | 0,78125 |
| Dot Precision@3 | 0,30804 |
| Dot Precision@5 | 0,19107 |
| Dot Precision@10 | 0,09866 |
| Dot Recall@1 | 0,78125 |
| Dot Recall@3 | 0,92411 |
| Dot Recall@5 | 0,95536 |
| Dot Recall@10 | 0,98661 |
| Dot NDCG@10 | 0,88557 |
| Dot MRR@10 | 0,85284 |
| Dot MAP@20 | 0,85314 |
| Query Active Dims | 215,25 |
| Query Sparsity Ratio | 0,99797 |
| Corpus Active Dims | 361,40 |
| Corpus Sparsity Ratio | 0,99659 |
| Avg FLOPs | 53,01 |

No se dispone de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 167,4 millones de parámetros, lo que en FP32 ocupa aproximadamente 670 MB. Con cuantización a 8 bits o 4 bits, el uso de VRAM se reduce a unos 170-340 MB, aunque no se han publicado pesos cuantizados oficiales.
- Para inferencia en CPU, es viable con 4-8 GB de RAM, aunque la latencia dependerá del tamaño del lote y del hardware.
- En GPU, cabe en tarjetas consumer como RTX 3060 (12 GB), RTX 4090 o superiores, pero también puede ejecutarse en GPUs con menos memoria si se usa un lote pequeño.
- Opciones de despliegue: `sentence-transformers` para integración en Python, `text-embeddings-inference` (TEI) para servir el modelo como API, y motores de búsqueda como OpenSearch que soportan modelos de embeddings dispersos.
- No se han publicado datos de latencia o throughput; se recomienda realizar pruebas de carga según el caso de uso.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros modelos SPLADE o codificadores dispersos en la documentación del modelo. Como referencia cualitativa, se puede comparar con el modelo base `opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1`, del cual hereda la arquitectura y el vocabulario, pero este ajuste ha sido entrenado con un conjunto de datos pequeño (415 ejemplos) y específico, lo que puede mejorar el rendimiento en el dominio de entrenamiento a costa de una posible pérdida de generalización. Otros modelos SPLADE públicos (por ejemplo, `naver/splade-cocw` o `naver/splade-v2`) tienen tamaños similares, pero no se han evaluado en este contexto. Por tanto, no se puede establecer una comparación cuantitativa fiable con los datos disponibles.

## Limitaciones y advertencias

- No se especifica la licencia del modelo; el uso comercial puede estar restringido. Se recomienda contactar al autor antes de utilizarlo en producción.
- Los idiomas soportados no están documentados; aunque el modelo base es multilingüe, el ajuste con un dataset pequeño podría degradar el rendimiento en idiomas no representados en el entrenamiento.
- El conjunto de entrenamiento es muy reducido (415 ejemplos), lo que puede provocar sobreajuste a dominios específicos y una generalización limitada.
- La longitud de contexto está limitada a 512 tokens; documentos más largos deben truncarse, lo que puede afectar a la calidad de la representación.
- Al ser un modelo disperso, puede producir términos irrelevantes o ruidosos en la representación, especialmente si el texto de entrada contiene vocabulario poco común.
- No se han publicado resultados de benchmarks en tareas estándar como MMLU o GLUE; las métricas declaradas provienen de un evaluador propio y no están verificadas de forma independiente.
- El modelo no es adecuado para tareas generativas, tool calling o razonamiento multi-paso; su único propósito es la recuperación de información.

## Enlaces

- Repositorio del modelo: https://huggingface.co/el1jah184/retriever-sparse-splade
- Modelo base: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1
- Documentación de Sentence Transformers sobre sparse encoders: https://www.sbert.net/docs/sparse_encoder/usage/usage.html
- Repositorio SPLADE (NAVER): https://github.com/naver/splade
- Colección de modelos sparse retriever en Hugging Face: https://huggingface.co/collections/prithivida/sparse-retriever-models
- Repositorio splade-easy (implementación simple): https://github.com/dleemiller/splade-easy/tree/main/
- Paper SPLADE v2: https://arxiv.org/abs/2109.10086
