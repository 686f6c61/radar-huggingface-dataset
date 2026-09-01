# i1j/retriever-sparse-splade

## Resumen

El modelo `i1j/retriever-sparse-splade` es un encoder disperso basado en la arquitectura SPLADE, desarrollado por el usuario i1j mediante fine-tuning del modelo `opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1` de OpenSearch. Está diseñado para tareas de búsqueda semántica y recuperación de información dispersa, generando representaciones vectoriales de alta dimensionalidad (105.879 dimensiones) a partir de texto, que pueden indexarse eficientemente en un índice invertido.

El modelo emplea una arquitectura BERT con una cabeza MLM y un pooling de tipo max, entrenado con funciones de pérdida específicas para sparse encoding (CachedSpladeLoss, SparseMultipleNegativesRankingLoss y FlopsLoss). Con 167 millones de parámetros y una ventana de contexto de 512 tokens, ofrece un equilibrio entre eficiencia y capacidad para tareas de retrieval. Su relevancia actual radica en la creciente adopción de modelos dispersos para sistemas de búsqueda híbrida y RAG, donde combinan la interpretabilidad del matching léxico con la semántica aprendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SparseEncoder (BERT + SpladePooling) |
| Parametros totales | 167.463.831 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SPLADE (Sparse Lexical and Expansion Model), que combina un transformer BERT con una cabeza de modelado de lenguaje enmascarado (MLM) y una capa de pooling de tipo max. La salida se proyecta a un espacio disperso de 105.879 dimensiones, donde cada dimensión representa un token del vocabulario y su peso indica la relevancia del término en el documento o consulta. Esta representación permite utilizar índices invertidos tradicionales, manteniendo la eficiencia de la búsqueda léxica clásica con la capacidad semántica de los modelos neuronales.

El entrenamiento se realizó sobre un dataset JSON de 415 ejemplos, utilizando tres funciones de pérdida combinadas: CachedSpladeLoss para la regularización dispersa, SparseMultipleNegativesRankingLoss para el aprendizaje contrastivo con negativos, y FlopsLoss para controlar el coste computacional. El modelo base es el encoder disperso multilingüe de OpenSearch, que ya había sido preentrenado en múltiples idiomas, por lo que el fine-tuning se centra en adaptar las representaciones al dominio específico del dataset de entrenamiento.

## Capacidades

- Generación de representaciones dispersas de texto para búsqueda semántica y recuperación de información.
- Sparse retrieval: permite indexar documentos en un índice invertido y realizar consultas eficientes mediante producto escalar.
- Soporte multilingüe heredado del modelo base de OpenSearch, aunque no se especifican los idiomas exactos.
- Compatible con la librería sentence-transformers y con Text Embeddings Inference (TEI) para despliegue en producción.
- No es un modelo generativo: no produce texto, solo embeddings.
- No soporta tool calling ni razonamiento multi-paso; su función es exclusivamente de codificación.

## Casos de uso

- Búsqueda semántica en corpus técnicos: el modelo puede indexar manuales, normativas o documentación técnica y recuperar pasajes relevantes mediante consultas en lenguaje natural. Su representación dispersa permite un matching léxico explícito, útil en dominios con terminología específica.
- Sistemas RAG (Retrieval-Augmented Generation): como componente de recuperación, puede alimentar a un LLM generativo con los fragmentos más relevantes de una base de conocimiento, reduciendo la latencia frente a encoders densos gracias al uso de índices invertidos.
- Filtrado de documentos por relevancia: en pipelines de procesamiento de documentos, puede clasificar o priorizar documentos según su similitud con una consulta, usando el producto escalar como métrica.
- Búsqueda en bases de conocimiento ferroviarias: los ejemplos del widget muestran consultas sobre normativa de circulación de trenes, indicando su aplicación en dominios regulados con vocabulario especializado.
- Recuperación de pasajes en entornos multilingües: al estar basado en un modelo multilingüe, puede utilizarse en sistemas que manejan documentos en varios idiomas, aunque no se detallan los idiomas concretos.
- Indexación de documentos legales o normativos: la capacidad de expansión de términos de SPLADE ayuda a encontrar documentos que usan sinónimos o paráfrasis, mejorando la recuperación frente a búsquedas por palabras clave exactas.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card, evaluados con el evaluador `irs_evaluator`, son los siguientes:

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
| Dot Ndcg@10 | 0,88557 |
| Dot Mrr@10 | 0,85284 |
| Dot Map@20 | 0,85314 |
| Query Active Dims | 215,25 |
| Query Sparsity Ratio | 0,99797 |
| Corpus Active Dims | 361,40 |
| Corpus Sparsity Ratio | 0,99659 |
| Avg Flops | 53,01 |

Estos valores indican una alta precisión en los primeros resultados (Accuracy@1 de 0,78) y una buena capacidad de recuperación global, con una esparsidad muy elevada (más del 99% de dimensiones inactivas), lo que confirma la eficiencia del modelo para indexación invertida.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo BERT de 167M parámetros, el uso de memoria en FP32 es de aproximadamente 670 MB. Con cuantización a int8 o float16, se reduce a unos 335 MB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- Compatible con consumer GPU: sí, incluso en CPU se puede ejecutar con razonable velocidad para lotes pequeños.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), o mediante frameworks como FastAPI con ONNX. También se puede exportar a formato ONNX para optimización.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo disperso, la inferencia es más rápida que un encoder denso equivalente porque solo se activan unas pocas dimensiones (alrededor de 215 para consultas y 361 para documentos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Notas |
|---|---|---|---|---|---|
| i1j/retriever-sparse-splade | 167M | 512 | 105.879 | no disponible | Fine-tuning sobre OpenSearch multilingue |
| opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1 | no disponible | 512 | no disponible | Apache 2.0 (según repo) | Modelo base multilingue de OpenSearch |
| naver/splade-v3 | no disponible | 512 | no disponible | CC-BY-SA | Última versión de SPLADE, entrenado con MS MARCO |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. El modelo de i1j se diferencia por su fine-tuning en un dominio específico (dataset de 415 ejemplos), mientras que SPLADE-v3 está entrenado en colecciones generales como MS MARCO.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (415 ejemplos), lo que puede provocar overfitting y limitar la generalización a dominios distintos del entrenado.
- No se especifica la licencia del modelo, por lo que su uso comercial requiere verificación con el autor.
- La ventana de contexto está limitada a 512 tokens, lo que impide procesar documentos largos de una sola vez; se requiere truncamiento o división en fragmentos.
- No se detallan los idiomas soportados, aunque el modelo base es multilingüe; el fine-tuning podría haber reducido el rendimiento en idiomas no representados en el dataset.
- Al ser un modelo de retrieval, no genera texto; no es adecuado para tareas de generación o diálogo.
- Los benchmarks declarados son proporcionados por el autor y no han sido verificados de forma independiente.
- La esparsidad de las representaciones puede variar según el dominio; en dominios muy diferentes al entrenado, la calidad de la recuperación podría degradarse.

## Enlaces

- [HuggingFace - i1j/retriever-sparse-splade](https://huggingface.co/i1j/retriever-sparse-splade)
- [Modelo base - opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1](https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1)
- [Documentación de Sparse Encoder en sentence-transformers](https://www.sbert.net/docs/sparse_encoder/usage/usage.html)
- [Repositorio SPLADE en GitHub](https://github.com/naver/splade)
- [Paper SPLADE v2 (arXiv)](https://arxiv.org/abs/2109.10086)
- [Paper original SPLADE (arXiv)](https://arxiv.org/abs/2107.05720)
