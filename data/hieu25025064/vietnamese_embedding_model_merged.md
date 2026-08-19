# Hieu25025064/vietnamese_embedding_model_merged

## Resumen

Vietnamese_Embedding es un modelo de embeddings de frases (sentence embeddings) especializado en vietnamita, desarrollado por el equipo AITeamVN y publicado en HuggingFace bajo el identificador Hieu25025064/vietnamese_embedding_model_merged. Se trata de un fine-tuning del modelo multilingüe BAAI/bge-m3, diseñado para mejorar la recuperación semántica de documentos en vietnamita. El modelo fue entrenado con aproximadamente 300.000 tripletas de consulta, documento positivo y documento negativo, con una longitud máxima de secuencia de 2048 tokens y genera vectores de 1024 dimensiones.

La relevancia de este modelo radica en que aborda un hueco específico: los modelos multilingües generalistas como BGE-M3 suelen tener un rendimiento inferior en tareas de recuperación para idiomas con pocos recursos como el vietnamita. Al ajustar el modelo base con datos específicos del dominio, se consigue una mejora significativa en métricas de recuperación (Accuracy@1, MRR) frente al modelo original. La licencia Apache 2.0 permite su uso comercial sin restricciones, lo que lo convierte en una opción práctica para sistemas de producción que necesiten búsqueda semántica en vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en BGE-M3, XLM-RoBERTa) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con ONNX) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, tambien disponible en ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de BGE-M3, un encoder transformer multilingüe de la familia XLM-RoBERTa. BGE-M3 originalmente soporta múltiples idiomas y produce embeddings densos de 1024 dimensiones. El fine-tuning se realizó con tripletas de entrenamiento (consulta, documento positivo, documento negativo) específicamente en vietnamita, usando una función de pérdida de contraste típica en modelos de recuperación. La similitud se calcula mediante producto punto (dot product). El entrenamiento se limitó a una longitud máxima de secuencia de 2048 tokens, lo que permite procesar documentos relativamente largos sin truncamiento agresivo.

No se especifican detalles sobre el número exacto de pasos de entrenamiento, el tamaño del lote o si se aplicaron técnicas adicionales como hard negative mining. El modelo se distribuye a través de sentence-transformers, lo que facilita su integración en pipelines de embeddings estándar.

## Capacidades

- Generacion de embeddings de frases y documentos en vietnamita con 1024 dimensiones.
- Similitud semantica entre textos mediante producto punto (dot product).
- Recuperacion de documentos (retrieval) en tareas de busqueda semantica y RAG.
- Clasificacion de textos mediante embeddings (como caracteristica para clasificadores externos).
- Agrupacion (clustering) de documentos por similitud semantica.
- Deduplicacion de textos y deteccion de parafrasis.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en vietnamita para motores de busqueda internos: el modelo permite indexar documentos y recuperar los mas relevantes mediante similitud coseno, mejorando la precision frente a busquedas por palabras clave.
- Sistemas RAG (Retrieval-Augmented Generation) para asistentes virtuales en vietnamita: se puede usar como componente de recuperacion para alimentar un LLM generativo con contexto relevante.
- Clasificacion automatica de tickets de soporte: al generar embeddings de las consultas de clientes, se pueden entrenar clasificadores ligeros (por ejemplo, regresion logistica) sobre los vectores.
- Deduplicacion de articulos o noticias: comparando embeddings de textos se pueden identificar duplicados o versiones similares en grandes corpus.
- Moderacion de contenido: embeddings de textos para detectar similitud con contenido previamente marcado como inapropiado.
- Sistema de recomendacion basado en contenido: representar items textuales (descripciones de productos, articulos) como vectores y calcular similitudes para sugerencias.

## Benchmarks y rendimiento

La model card proporciona una evaluacion sobre el conjunto de datos Legal Zalo 2021 (dataset de entrenamiento completo, no usado en el entrenamiento del modelo). Los resultados comparan varios modelos de embeddings vietnamitas.

| Modelo | Accuracy@1 | Accuracy@3 | Accuracy@5 | Accuracy@10 | MRR@10 |
|---|---|---|---|---|---|
| Vietnamese_Reranker (AITeamVN) | 0.7944 | 0.9324 | 0.9537 | 0.9740 | 0.8672 |
| Vietnamese_Embedding_v2 (AITeamVN) | 0.7262 | 0.8927 | 0.9268 | 0.9578 | 0.8149 |
| Vietnamese_Embedding (public, este modelo) | 0.7274 | 0.8992 | 0.9305 | 0.9568 | 0.8181 |
| Vietnamese-bi-encoder (BKAI) | 0.7109 | 0.8680 | 0.9014 | 0.9299 | 0.7951 |
| BGE-M3 (base) | 0.5682 | 0.7728 | 0.8382 | 0.8921 | 0.6822 |

El modelo supera claramente a BGE-M3 original y a BKAI, aunque queda por detras del reranker y de la version v2 (entrenada con mas datos). No se han publicado resultados en benchmarks estandar multilingües como MMLU o MTEB para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 568M parametros, en precision FP32 ocupa aproximadamente 2,3 GB (tamano del repo). En FP16 se reduce a ~1,2 GB y en INT8 a ~0,6 GB.
- GPU recomendadas: cabe en GPUs consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1660, RTX 3050) en FP16 o INT8. Para inferencia en lote grande o con contexto largo, se recomienda una GPU con 8 GB o mas (RTX 3060, RTX 4070, etc.).
- Despliegue: compatible con sentence-transformers, que a su vez se integra con frameworks como FAISS, Milvus o Qdrant para indexacion vectorial. Tambien se puede servir con Text Embeddings Inference (TEI) o con ONNX Runtime.
- Latencia: no se dispone de mediciones oficiales. En una GPU moderna, la codificacion de una frase corta suele tardar unos pocos milisegundos, pero depende del hardware y del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hieu25025064/vietnamese_embedding_model_merged | 568M | 2048 | vi | Apache 2.0 | Fine-tune de BGE-M3 para vietnamita |
| BAAI/bge-m3 | 568M | 8192 | multilingue (100+) | MIT | Modelo base, menor rendimiento en vietnamita |
| dangvantuan/vietnamese-embedding | ~135M (PhoBERT) | 256 | vi | MIT | Basado en PhoBERT, contexto corto, dimensiones 768 |
| AITeamVN/Vietnamese_Embedding_v2 | 568M | 2048 | vi | Apache 2.0 | Entrenado con 1,1M tripletas, mejor rendimiento general |

El modelo aqui descrito es una version "merged" (posiblemente una fusion de pesos) del modelo publico de AITeamVN. La comparativa muestra que supera a BGE-M3 base y a la alternativa basada en PhoBERT, pero es superado por la version v2 del mismo equipo.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en vietnamita; no soporta otros idiomas de forma fiable.
- El rendimiento en dominios fuera del legal (donde se evaluo) puede variar; la model card menciona que la version v2, con mas datos, es mejor para otros dominios.
- Riesgo de sesgos presentes en los datos de entrenamiento (no se documentan medidas de mitigacion).
- Alucinacion no aplica directamente, pero los embeddings pueden producir falsos positivos en busquedas si los textos son muy similares superficialmente.
- La longitud maxima de contexto es 2048 tokens; textos mas largos deberan truncarse o dividirse.
- No se proporcionan datos de rendimiento en benchmarks estandar como MTEB, por lo que la comparabilidad con otros modelos es limitada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base BGE-M3 (MIT) para evitar conflictos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hieu25025064/vietnamese_embedding_model_merged
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Modelo original AITeamVN/Vietnamese_Embedding: https://huggingface.co/AITeamVN/Vietnamese_Embedding
- Modelo alternativo dangvantuan/vietnamese-embedding: https://huggingface.co/dangvantuan/vietnamese-embedding
- Registro en modelindex.dev: https://modelindex.dev/models/AITeamVN/Vietnamese_Embedding
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/vietnamese-embedding-aiteamvn
