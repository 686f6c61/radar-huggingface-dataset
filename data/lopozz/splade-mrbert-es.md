# lopozz/splade-MrBERT-es

## Resumen

`lopozz/splade-MrBERT-es` es un codificador disperso (sparse encoder) del tipo SPLADE asimétrico e "inference-free", ajustado a partir de `BSC-LT/MrBERT-es` mediante la librería `sentence-transformers`. Lo desarrolla el usuario `lopozz` y su función es mapear frases y párrafos a vectores dispersos de 51.200 dimensiones para búsqueda semántica y recuperación léxica-dispersa (retrieval), usando producto escalar como función de similitud.

La relevancia de esta arquitectura radica en que los codificadores SPLADE producen representaciones dispersas compatibles con índices invertidos, lo que permite combinar el comportamiento de un motor de búsqueda léxico tradicional (BM25) con las ventajas de un modelo neuronal de recuperación. La variante "inference-free" separa la codificación de consultas de la de documentos: la consulta se representa con un `SparseStaticEmbedding` congelable de 51.200 dimensiones, mientras que los documentos pasan por el transformer completo y un `SpladePooling` con activación ReLU y estrategia de max-pooling.

El modelo declara entrenamiento sobre tuplas de pregunta-respuesta del dataset `unicamp-dl/mmarco` (528.161 ejemplos) y está etiquetado con el idioma italiano (`it`), aunque su modelo base es de la familia MrBERT-es (español) y el nombre del repositorio contiene el sufijo `-es`. Esta discrepancia entre el identificador, el modelo base y la etiqueta de idioma debe tenerse en cuenta antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SparseEncoder asimétrico e inference-free: Router con sub-módulos `query` (SparseStaticEmbedding, 51200 dims) y `document` (Transformer ModernBertForMaskedLM + SpladePooling max/ReLU) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (máxima longitud de secuencia declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | `it` (italiano) según la model card; modelo base de familia española (MrBERT-es) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensionalidad de salida | 51200 dimensiones (vectores dispersos) |
| Funcion de similitud | Producto escalar (dot product) |
| Pipeline | feature-extraction |
| Libreria | sentence-transformers |
| Tamano del repo | 0.6 GB |
| Dataset de entrenamiento | unicamp-dl/mmarco (528.161 ejemplos) |
| Funciones de perdida | SpladeLoss, SparseMultipleNegativesRankingLoss, FlopsLoss |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura SPLADE en su variante asimétrica "inference-free". La estructura concreta es un `SparseEncoder` con un `Router` que despacha a dos sub-módulos según el rol del texto: para consultas, un `SparseStaticEmbedding` de 51.200 dimensiones con parámetro `frozen: False`; para documentos, un transformer `ModernBertForMaskedLM` que produce `token_embeddings` seguido de un `SpladePooling` con estrategia `max`, activación `relu` y dimensión de embedding de 51.200. El modelo base es `BSC-LT/MrBERT-es` (revisión 34a7cc86e0d0a2b77e802d07a189db1c0ef2e7d4), un modelo de la familia BERT entrenado para español por el Barcelona Supercomputing Center.

El entrenamiento se realizó sobre el dataset `unicamp-dl/mmarco` con 528.161 ejemplos, presumiblemente tuplas de pregunta-respuesta, y emplea tres funciones de pérdida combinadas: `SpladeLoss`, `SparseMultipleNegativesRankingLoss` y `FlopsLoss`. Esta última es característica de SPLADE y penaliza el número de dimensiones activas para controlar la eficiencia computacional de los vectores dispersos resultantes. La combinación de pérdidas busca equilibrar la calidad de recuperación con la dispersión de las representaciones.

La innovación principal es la separación de la codificación de consultas: al usar un embedding estático para las queries, se elimina la necesidad de ejecutar el transformer en tiempo de consulta, reduciendo la latencia de búsqueda a una simple operación de lookup y producto escalar. Los documentos, en cambio, sí requieren una pasada completa por el transformer, pero se codifican una sola vez y se indexan de forma persistente.

## Capacidades

- Generación de representaciones dispersas para recuperación de información (retrieval) mediante producto escalar.
- Búsqueda semántica y recuperación léxica-dispersa sobre corpus documentales.
- Codificación asimétrica: consultas mediante embedding estático e inference-free; documentos mediante transformer completo.
- Representaciones de alta dimensionalidad (51.200 dims) con fuerte dispersión: 8,56 dimensiones activas de media en consultas y 218,22 en documentos.
- Soporte de secuencias largas de hasta 8.192 tokens, adecuado para documentos extensos.
- Integración con la librería `sentence-transformers` mediante la clase `SparseEncoder`.
- No soporta tool calling ni function calling (es un modelo de embeddings, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas: la model card declara únicamente italiano.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Motor de búsqueda documental en italiano: el modelo indexa documentos como vectores dispersos de 51.200 dimensiones y resuelve consultas con un embedding estático, lo que permite latencias de búsqueda muy bajas al evitar ejecutar el transformer en tiempo de query.
- Recuperación en pipelines RAG: se puede usar como retriever de primera etapa para alimentar un LLM generativo, aprovechando los 8.192 tokens de contexto para indexar fragmentos largos sin truncamiento agresivo.
- Búsqueda semántica sobre bases de conocimiento extensas: la dispersión de los vectores (ratio de 0,9957 en documentos) permite almacenar los índices en estructuras invertidas convencionales, reduciendo el coste de memoria frente a embeddings densos.
- Filtrado y deduplicación de corpus: la representación dispersa permite comparar documentos entre sí mediante producto escalar para detectar duplicados o near-duplicates en grandes colecciones textuales.
- Sistemas de preguntas y respuestas sobre documentación técnica: el entrenamiento sobre tuplas de QA del dataset mMARCO está orientado específicamente a emparejar preguntas con pasajes relevantes.
- Recuperación aumentada en asistentes conversacionales en italiano: se integra en la fase de recuperación de contexto antes de la generación, con la ventaja de que las consultas de usuario se codifican sin coste de transformer.
- Indexación de documentación legal o administrativa en italiano: la ventana de 8.192 tokens permite procesar artículos o secciones completas sin fragmentación excesiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index, evaluados sobre el dataset `mmarco` en la tarea de recuperación dispersa. No están verificados (`verified: false`).

| Metrica | Valor |
|---|---|
| Dot Accuracy@10 | 0,9215 |
| Dot Precision@10 | 0,0975 |
| Dot Recall@10 | 0,9168 |
| Dot NDCG@10 | 0,8199 |
| Dot MRR@10 | 0,7921 |
| Dot MAP@10 | 0,7861 |
| Query Active Dims | 8,5613 |
| Query Sparsity Ratio | 0,99983 |
| Corpus Active Dims | 218,2212 |
| Corpus Sparsity Ratio | 0,99574 |
| Avg FLOPs | 1,0567 |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,6 GB en safetensors; en fp32 la inferencia del transformer documental requiere aproximadamente 1-2 GB de VRAM, dependiendo del batch size y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para codificación documental por lotes; para throughput alto se recomiendan A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, incluso con batches moderados y secuencias largas.
- Opciones de despliegue: `sentence-transformers` con la clase `SparseEncoder`; el pipeline `feature-extraction` de Hugging Face; integración con motores de búsqueda dispersa compatibles con índices invertidos. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos.
- Latencia y throughput: no disponibles de forma explícita. La naturaleza inference-free de las consultas reduce la latencia de query a un lookup estático y un producto escalar, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Dimensiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lopozz/splade-MrBERT-es | SPLADE asimétrico inference-free | 8192 | 51200 (disperso) | apache-2.0 | Hugging Face |
| SPLADE estándar (p. ej. naver/splade-cocondenser-ensembledistil) | SPLADE simétrico | 512 típicamente | 30522 (disperso) | apache-2.0 | Hugging Face |
| BM25 | Recuperación léxica | no aplica | vocabulario | dominio público | ubicuo |

No se dispone en la información proporcionada de comparativas de rendimiento verificadas frente a estos u otros modelos de la misma categoría. La comparación se limita a características estructurales.

## Limitaciones y advertencias

- La model card declara el idioma `it` (italiano), pero el nombre del repositorio termina en `-es` y el modelo base es `BSC-LT/MrBERT-es`, de familia española. Existe una discrepancia clara entre identificador, base y etiqueta de idioma que debe verificarse empíricamente antes de usar el modelo en producción.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden exclusivamente del autor; no han sido replicados de forma independiente.
- Riesgo de alucinación no aplica directamente al ser un modelo de recuperación, pero sí existe riesgo de recuperar pasajes irrelevantes; el Precision@10 de 0,0975 es bajo en términos absolutos, lo que sugiere que una fracción importante de los resultados top-10 no es relevante.
- La dispersión de los vectores (ratio 0,99983 en consultas y 0,99574 en documentos) implica que el índice invertido resultante puede ser grande pese a la dispersión, especialmente en corpus masivos.
- El modelo no es generativo: no puede producir texto, responder preguntas directamente ni ejecutar tool calling; solo genera representaciones para recuperación.
- Licencia apache-2.0: permite uso comercial con atribución, pero el modelo base `BSC-LT/MrBERT-es` puede tener condiciones adicionales que conviene revisar.
- No se documentan sesgos específicos, pero al derivar de un modelo BERT entrenado sobre corpus web, puede heredar sesgos de género, origen o ideología presentes en los datos de preentrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación (2026-11-19) es posterior a la fecha actual, lo que puede indicar un artefacto de metadatos o un modelo de publicación programada; conviene verificar la integridad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lopozz/splade-MrBERT-es
- Modelo base: https://huggingface.co/BSC-LT/MrBERT-es
- Dataset de entrenamiento: https://huggingface.co/datasets/unicamp-dl/mmarco
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Sparse Encoder: https://www.sbert.net/docs/sparse_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Sparse Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=sparse-encoder
- Paper SPLADE (arXiv:2108.13897): https://arxiv.org/abs/2108.13897
- Paper BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper sobre eficiencia en SPLADE (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper SimCSE / representaciones contrastivas (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Paper sobre pérdidas contrastivas (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
