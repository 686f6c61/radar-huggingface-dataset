# J0nasW/sciembed-ctx-2048

## Resumen

SciEmbed-CTX-2048 es un modelo de embeddings para documentos científicos desarrollado por J0nasW, basado en el encoder ModernBERT-base de AnswerDotAI. Con 149 millones de parámetros, está diseñado para generar representaciones vectoriales de oraciones y párrafos científicos utilizando el contexto de citas como señal de entrenamiento contrastiva. Forma parte de la familia SciEmbed, presentada en Findings of EMNLP 2026, y esta variante concreta corresponde al punto intermedio de un barrido de longitudes de contexto (512 → 2K → 8K), fijando la ventana en 2048 tokens.

El modelo resuelve el problema de la recuperación semántica en literatura científica, donde las citas proporcionan una supervisión natural y abundante. Su relevancia actual radica en combinar una arquitectura eficiente (ModernBERT) con un método de entrenamiento basado en contexto de citas, ofreciendo una alternativa abierta y ligera para tareas de búsqueda, agrupación y recomendación en el dominio académico. Se distribuye bajo licencia MIT, lo que facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-base, un transformer encoder bidireccional optimizado para eficiencia en CPU y GPU, con atención tradicional y una longitud de contexto ampliada respecto a BERT original. La capa de pooling es la media (mean pooling) y la dimensión de salida es 768, con soporte de truncamiento Matryoshka a 512, 256 o 128 dimensiones, lo que permite ajustar el equilibrio entre calidad y coste de almacenamiento.

El entrenamiento utiliza oraciones de contexto de citas como señal contrastiva primaria: para cada documento científico, se emparejan las oraciones que rodean una cita con el texto citado, generando pares positivos y negativos para el aprendizaje de similitud. El autor mantiene un data lake público con 293 millones de artículos científicos de 8 fuentes, que probablemente sirvió como base de datos. No se han publicado detalles sobre el número total de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO; el enfoque es puramente contrastivo.

## Capacidades

- Generacion de embeddings de oraciones, parrafos y documentos cientificos de hasta 2048 tokens.
- Similitud semantica entre textos cientificos, util para busqueda y recuperacion.
- Soporte de truncamiento Matryoshka: permite reducir la dimension de salida a 512, 256 o 128 sin reentrenar.
- Integracion nativa con sentence-transformers, facilitando su uso en pipelines de embeddings.
- Compatible con text-embeddings-inference y endpoints de Hugging Face para despliegue en produccion.
- Especializado en dominio cientifico, con vocabulario y estructuras propias de papers academicos.
- No incluye capacidades de generacion de texto, tool calling ni agentes; es exclusivamente un modelo de representacion.

## Casos de uso

- Busqueda semantica en repositorios de articulos cientificos: indexar abstracts y secciones completas con el modelo y consultar mediante similitud coseno, aprovechando la ventana de 2048 tokens para capturar contextos extensos.
- Recomendacion de citas: dado un borrador de manuscrito, generar embeddings de las oraciones y buscar las referencias mas relevantes en una base de datos de papers previamente indexada.
- Agrupacion de documentos por tematica: aplicar clustering sobre los embeddings para organizar colecciones de preprints o actas de congresos, facilitando la revision de literatura.
- Deteccion de plagio o similitud textual: comparar embeddings de parrafos para identificar solapamientos entre documentos, incluso cuando la redaccion difiere.
- Sistemas de respuesta a preguntas con recuperacion aumentada (RAG): usar el modelo como retriever en pipelines que combinan busqueda semantica con generacion, para responder consultas sobre literatura cientifica.
- Analisis de tendencias de investigacion: proyectar embeddings de articulos en espacios de baja dimension para visualizar la evolucion de topicos y detectar areas emergentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona el paper "SciEmbed: Citation-Context Supervision for Scientific Document Embeddings" (Findings of EMNLP 2026), pero no se incluyen metricas como MTEB, LoCo u otros conjuntos de evaluacion en la model card ni en los resultados de busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149M parametros, en precision fp16/bf16 el modelo ocupa aproximadamente 300 MB; en int8 alrededor de 150 MB. Cabe comodamente en GPUs consumer con 4 GB o mas.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, por ejemplo RTX 3060, RTX 4060, o incluso CPUs con suficiente RAM para inferencia en lotes pequenos.
- Despliegue: compatible con sentence-transformers, text-embeddings-inference (TEI) y endpoints de Hugging Face. Tambien puede servirse con vLLM si se adapta, aunque TEI es la via mas directa.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por oracion en GPU moderna, y un throughput de cientos de oraciones por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension salida | Licencia | Dominio |
|---|---|---|---|---|---|
| SciEmbed-CTX-2048 | 149M | 2048 | 768 (truncable) | MIT | Cientifico |
| nomic-embed-text-v1 | 137M | 8192 | 768 | Apache 2.0 | General |
| bge-large-en-v1.5 | 326M | 512 | 1024 | MIT | General |
| ModernBERT-base (base) | 149M | 8192 | 768 | Apache 2.0 | General |

La comparativa se basa en especificaciones publicas; no hay datos de rendimiento comparativo disponibles. SciEmbed-CTX-2048 se distingue por su entrenamiento especifico en dominio cientifico, aunque su contexto (2048) es inferior al de nomic-embed-text-v1 (8192) y al del propio ModernBERT-base (8192). Su ventaja principal es la especializacion y la licencia permisiva.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; no soporta otros idiomas.
- La ventana de contexto de 2048 tokens es limitada frente a otros embedders modernos que alcanzan 8192 o mas; documentos muy largos deberan truncarse o dividirse.
- No se han publicado evaluaciones de sesgos; al entrenarse con literatura cientifica, puede reflejar sesgos presentes en los datos (por ejemplo, infrarrepresentacion de ciertas disciplinas o regiones).
- Al ser un modelo de embeddings, no genera texto; no es adecuado para tareas generativas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es muy reciente y aun no ha sido validado por la comunidad.
- No se dispone de informacion sobre el dataset exacto de entrenamiento ni sobre el proceso de curado de datos, mas alla de la mencion al data lake de 293M papers.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/J0nasW/sciembed-ctx-2048
- Repositorio del autor (data lake): https://github.com/J0nasW/science-datalake
- Paper: "SciEmbed: Citation-Context Supervision for Scientific Document Embeddings", Findings of EMNLP 2026 (enlace no disponible en la informacion proporcionada)
- Variantes relacionadas: anon-nlp/sciembed-full y anon-nlp/sciembed-ctx (misma familia, publicadas bajo otro nombre de usuario)
