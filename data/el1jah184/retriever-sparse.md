# el1jah184/retriever-sparse

## Resumen

El modelo `el1jah184/retriever-sparse` es un **CSR Sparse Encoder** (encoder disperso basado en CSR, *Compressed Sparse Row*) desarrollado por el usuario el1jah184 sobre la base de `deepvk/USER-bge-m3`, un modelo XLM-RoBERTa de gran tamaño. Se trata de un modelo de embeddings de texto diseñado específicamente para **recuperación de información dispersa** (*sparse retrieval*), una técnica que representa cada documento o consulta como un vector de alta dimensionalidad (4096 dimensiones) con un número limitado de componentes no nulos (máximo 1024 activos). A diferencia de los embeddings densos tradicionales, esta representación permite utilizar índices invertidos y algoritmos de búsqueda por producto punto muy eficientes, similares a los usados en BM25 pero con semántica aprendida.

El modelo fue fine-tuneado con un dataset JSON de tan solo 415 ejemplos, utilizando una combinación de pérdidas `CachedSpladeLoss`, `SparseMultipleNegativesRankingLoss` y `FlopsLoss`, lo que indica que se entrenó para producir representaciones dispersas con control de coste computacional. Su relevancia radica en que combina la capacidad semántica de un transformer multilingüe (XLM-RoBERTa) con la eficiencia de la búsqueda dispersa, siendo útil para sistemas de recuperación en dominios específicos donde se necesita alta precisión con latencia baja. El modelo soporta secuencias de hasta 8192 tokens, lo que lo hace adecuado para documentos largos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SparseEncoder (XLMRobertaModel + pooling CLS + normalización + SparseAutoEncoder) |
| Parametros totales | 359.026.688 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible (los ejemplos del widget son en ruso, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura **CSR Sparse Encoder** definida en la librería `sentence-transformers`. Internamente está compuesto por un transformer base `XLMRobertaModel` (el mismo que usa `deepvk/USER-bge-m3`) que produce embeddings de token de 1024 dimensiones. Tras una capa de pooling tipo CLS y una normalización, un **SparseAutoEncoder** mapea estos vectores densos a un espacio disperso de 4096 dimensiones, activando únicamente 256 dimensiones por token (con 5 auxiliares), lo que resulta en un máximo de 1024 dimensiones activas por secuencia. La función de similitud es el producto punto.

El entrenamiento se realizó sobre un dataset JSON de 415 ejemplos (probablemente específico del dominio ferroviario ruso, según los ejemplos del widget). Se utilizaron tres funciones de pérdida combinadas: `CachedSpladeLoss` (basada en el enfoque SPLADE, que aprende pesos por token), `SparseMultipleNegativesRankingLoss` (para aprendizaje contrastivo con negativos) y `FlopsLoss` (para penalizar el coste computacional y fomentar la esparsidad). Esta combinación busca maximizar la precisión de recuperación manteniendo un bajo coste de inferencia. El modelo base `deepvk/USER-bge-m3` es un XLM-RoBERTa de 568M parámetros (aunque el modelo final reporta 359M, probablemente por la poda del SparseAutoEncoder), con capacidad multilingüe.

## Capacidades

- Generación de embeddings dispersos de 4096 dimensiones con un máximo de 1024 componentes activos por secuencia.
- Recuperación de información semántica mediante producto punto, compatible con índices invertidos (como Lucene o Elasticsearch) gracias a la representación dispersa.
- Búsqueda de pasajes y documentos en corpus grandes con latencia reducida, al explotar la esparsidad (ratio de esparsidad declarado de 0,75, es decir, solo el 25% de las dimensiones están activas).
- Procesamiento de secuencias largas de hasta 8192 tokens, adecuado para documentos técnicos o normativas extensas.
- Capacidad multilingüe heredada de XLM-RoBERTa, aunque no se declara oficialmente el conjunto de idiomas soportados.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales. Tampoco soporta tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- **Búsqueda semántica en corpus técnicos especializados**: por ejemplo, en normativas ferroviarias rusas (como sugieren los ejemplos del widget), donde se necesita recuperar pasajes exactos sobre procedimientos de cierre de vías. El modelo puede indexar documentos con su representación dispersa y responder consultas con alta precisión top-k.
- **Sistema de preguntas y respuestas sobre documentación legal**: dado que soporta contextos largos (8192 tokens), puede procesar artículos completos de reglamentos y encontrar los fragmentos relevantes para una consulta, funcionando como extractor en un pipeline RAG.
- **Indexación de grandes volúmenes de documentos en motores de búsqueda**: al generar vectores dispersos, se pueden almacenar en índices invertidos estándar (por ejemplo, con la librería `ir_datasets` o Elasticsearch), reduciendo el coste de almacenamiento y acelerando la búsqueda frente a vectores densos.
- **Filtrado de candidatos en pipelines de recuperación**: como primera etapa de un sistema de respuesta a preguntas, se puede usar para preseleccionar los 10-20 documentos más relevantes de un corpus, que luego se pasan a un modelo generativo (LLM) para extraer la respuesta final.
- **Búsqueda en bases de conocimiento empresarial**: empresas con manuales técnicos, procedimientos internos o documentación de mantenimiento pueden usar este modelo para implementar un buscador interno que entienda consultas en lenguaje natural y devuelva las secciones exactas relevantes.
- **Monitorización de cambios normativos**: al indexar versiones de documentos legales, el modelo puede identificar pasajes nuevos o modificados mediante similitud dispersa, facilitando la detección de actualizaciones en regulaciones.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la tarea de recuperación de información dispersa (evaluados con `irs_evaluator` sobre un dataset no especificado). Los valores no están verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Dot Accuracy@1 | 0,7143 |
| Dot Accuracy@3 | 0,8661 |
| Dot Accuracy@5 | 0,9063 |
| Dot Accuracy@10 | 0,9598 |
| Dot Precision@1 | 0,7143 |
| Dot Precision@3 | 0,2887 |
| Dot Precision@5 | 0,1813 |
| Dot Precision@10 | 0,0960 |
| Dot Recall@1 | 0,7143 |
| Dot Recall@3 | 0,8661 |
| Dot Recall@5 | 0,9063 |
| Dot Recall@10 | 0,9598 |
| Dot NDCG@10 | 0,8382 |
| Dot MRR@10 | 0,7991 |
| Dot MAP@20 | 0,8011 |
| Query active dims | 1024,0 |
| Query sparsity ratio | 0,75 |
| Corpus active dims | 1024,0 |
| Corpus sparsity ratio | 0,75 |
| Avg Flops | 508,55 |

Estos resultados indican un buen comportamiento en recuperación top-k, aunque la precisión baja rápidamente al aumentar k, lo que sugiere que el modelo es más adecuado para recuperar un número reducido de resultados muy relevantes.

## Requisitos de hardware

- **Tamaño del modelo**: 359M parámetros. En precisión fp32 ocupa aproximadamente 1,4 GB (el repo es de 1,5 GB). En fp16 se reduce a ~700 MB; en int8 a ~350 MB (aunque no se proporcionan pesos cuantizados oficialmente).
- **VRAM estimada para inferencia**: con fp16, se necesitan al menos 1-2 GB de VRAM para procesar secuencias de hasta 8192 tokens. En CPU, el modelo puede ejecutarse con ~3-4 GB de RAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, T4, V100) es suficiente para inferencia en lotes pequeños. Para producción con alto throughput se recomienda una A10 o A100.
- **Compatibilidad con hardware de consumo**: sí, cabe en GPUs de consumo como RTX 3060/3070/3080, e incluso en CPU para cargas moderadas.
- **Opciones de despliegue**: se puede usar con la librería `sentence-transformers` (Python), con `text-embeddings-inference` (mencionado en los tags, compatible con endpoints de Hugging Face), o mediante `Ollama`/`llama.cpp` si se convierte a GGUF (aunque no se proporcionan archivos GGUF). También es posible integrarlo en Elasticsearch mediante el plugin de sparse vectors.
- **Latencia y throughput**: no se dispone de datos medidos. Como referencia, un modelo de ~359M parámetros en una GPU T4 puede procesar unas 100-200 secuencias de longitud media por segundo en fp16, pero depende de la longitud y del hardware.

## Comparativa con modelos similares

El modelo se inscribe en la categoría de *sparse encoders* (también llamados *learned sparse retrieval*). Los competidores más directos son SPLADE (y sus variantes) y otros modelos dispersos basados en transformers. Dado que el modelo deriva de BGE-M3, también se puede comparar con su versión densa.

| Modelo | Arquitectura | Parametros | Contexto maximo | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| el1jah184/retriever-sparse | SparseEncoder (XLMRoBERTa + SparseAutoEncoder) | 359M | 8192 | 4096 dims dispersas (1024 activas) | no disponible | HuggingFace |
| SPLADE-v3 | BERT-base + MLM head | 110M | 512 | 30522 dims dispersas | CC-BY-SA | HuggingFace |
| BGE-M3 (dense) | XLM-RoBERTa | 568M | 8192 | 1024 dims densas | MIT | HuggingFace |
| SPAR (dense + lexical) | BERT-base + dense | ~110M | 512 | 768 dims densas + lexical | Apache 2.0 | GitHub |

Nota: los datos de SPLADE-v3 y BGE-M3 son de conocimiento público, pero no se han verificado para esta ficha. La comparación es orientativa.

## Limitaciones y advertencias

- **Licencia no disponible**: no se especifica ninguna licencia, lo que impide su uso comercial o redistribución sin autorización explícita del autor. Hay que contactar con él antes de utilizarlo en producción.
- **Dataset de entrenamiento muy pequeño**: solo 415 ejemplos, aparentemente centrados en un dominio específico (ferroviario ruso). Esto puede provocar un rendimiento deficiente en dominios generales o en otros idiomas distintos del ruso.
- **Sesgos y alucinaciones**: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación. Sin embargo, los embeddings pueden reflejar sesgos presentes en el modelo base XLM-RoBERTa y en los datos de entrenamiento (posiblemente muy específicos y con vocabulario técnico limitado).
- **Idiomas no declarados**: aunque el modelo base es multilingüe, no se indica qué idiomas soporta realmente el fine-tuning. Los ejemplos del widget son exclusivamente en ruso, lo que sugiere que su rendimiento en otros idiomas puede ser pobre.
- **Limitaciones de contexto**: aunque acepta 8192 tokens, la representación dispersa con solo 1024 dimensiones activas puede perder información en documentos muy largos o con muchos términos relevantes.
- **Riesgo de sobreajuste**: el entrenamiento con un dataset tan pequeño y con pérdidas combinadas puede provocar que el modelo se ajuste demasiado a los patrones del corpus de entrenamiento, reduciendo su capacidad de generalización.
- **Sin cuantización oficial**: no se ofrecen versiones cuantizadas, por lo que el despliegue en entornos con restricciones de memoria requiere conversión manual (por ejemplo, a ONNX o GGUF), lo que puede degradar ligeramente el rendimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/el1jah184/retriever-sparse)
- [Documentación de CSR Sparse Encoder en sentence-transformers](https://www.sbert.net/docs/sparse_encoder/usage/usage.html)
- [Modelo base deepvk/USER-bge-m3](https://huggingface.co/deepvk/USER-bge-m3)
- [Repositorio de sentence-transformers](https://github.com/huggingface/sentence-transformers)
- [Papers de referencia citados en los tags](https://arxiv.org/abs/1908.10084) (SPLADE), [2101.06983](https://arxiv.org/abs/2101.06983), [2205.04733](https://arxiv.org/abs/2205.04733), [1807.03748](https://arxiv.org/abs/1807.03748) (XLM-R), [2004.05665](https://arxiv.org/abs/2004.05665) (FLOPs loss)

Nota: los resultados de búsqueda web proporcionados (papers sobre SPAR) no son directamente aplicables a este modelo, ya que SPAR es un enfoque diferente de recuperación densa con componente léxico. No se encontró documentación adicional específica sobre `retriever-sparse` más allá de la model card.
