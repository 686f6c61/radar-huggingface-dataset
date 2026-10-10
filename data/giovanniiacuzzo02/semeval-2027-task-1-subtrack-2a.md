# GiovanniIacuzzo02/SemEval-2027-Task-1-subtrack-2a

## Resumen

SemEval-2027-Task-1-subtrack-2a es un adaptador PEFT/LoRA publicado por el usuario GiovanniIacuzzo02 que convierte el modelo base BAAI/bge-base-en-v1.5 en un codificador denso (bi-encoder) especializado en recuperación conversacional. Resuelve el problema de recuperar pasajes de soporte a partir de conversaciones multiturno, donde el turno objetivo puede contener elipsis, anáforas o referencias implícitas cuyo significado depende del historial de diálogo previo.

El modelo se enmarca en RETECO / RECOR, Track 2, Sub-track 2a (Conversational Retrieval) de SemEval-2027, y se entrenó con un objetivo contrastivo de recuperación usando negativos duros minados con BM25 y negativos en lote. Parte de una arquitectura transformer tipo BERT (bi-encoder), con pooling y normalización L2, y genera embeddings de 768 dimensiones heredados del modelo base, que cuenta con aproximadamente 109 millones de parámetros y una longitud máxima de secuencia de 512 tokens.

Es relevante porque aborda una limitación clave de los recuperadores de un solo turno en pipelines RAG conversacionales: la necesidad de representar la necesidad informativa actual preservando el contexto relevante del diálogo. El repositorio publica únicamente el componente codificador denso, no un servicio de búsqueda completo. En el momento de la consulta el modelo registra 0 descargas y 0 likes, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder denso (BERT) basado en BAAI/bge-base-en-v1.5, con adaptador PEFT/LoRA |
| Parametros totales | Modelo base: aproximadamente 109 M. Adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en el modelo base (configurable en el pipeline; el ejemplo de la model card usa max_length=256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA: adapter_config.json + adapter_model.safetensors) |
| Dimension del embedding | 768 (heredada del modelo base BGE-base-en-v1.5) |
| Funcion de similitud | Producto escalar equivalente a similitud coseno tras normalizacion L2 |
| Pipeline | feature-extraction |
| Dataset de entrenamiento | DataScience-UIBK/RETECO-SemEval2027 |

## Arquitectura y entrenamiento

La arquitectura es un bi-encoder denso derivado de BAAI/bge-base-en-v1.5, un transformer tipo BERT de aproximadamente 109 millones de parametros. La model card describe pooling configurable y embeddings normalizados L2; cuando la normalizacion se aplica, el producto escalar entre embeddings equivale a similitud coseno. El ejemplo de carga utiliza CLS pooling, pero advierte que debe usarse solo si coincide con la configuracion de entrenamiento del checkpoint. Sobre el modelo base se aplica un adaptador PEFT/LoRA, por lo que los pesos publicados son un adaptador, no el codificador completo.

El entrenamiento emplea un objetivo contrastivo de tipo cross-entropy / InfoNCE que optimiza la compatibilidad entre consulta y pasaje positivo. Los negativos incluyen negativos en lote e negativos duros minados con BM25 sobre la porcion de entrenamiento, evitando usar las conversaciones de validacion interna como ejemplos de entrenamiento. El formateador de consulta es configurable: puede usar solo el turno actual o combinarlo con el historial de dialogo sujeto a un presupuesto de tokens. La model card insiste en que para reproducir fielmente el comportamiento hay que codificar las consultas con la misma estrategia de formateo y la misma longitud maxima de secuencia usadas en el entrenamiento, y no asumir que una frase de seguimiento cruda es una consulta autonoma.

El flujo completo descrito incluye recuperacion densa con el bi-encoder, recuperacion dispersa con BM25 en paralelo y fusion de rangos mediante Reciprocal Rank Fusion (RRF). Este repositorio cubre unicamente el componente de codificacion densa: la codificacion del corpus, la busqueda por vecinos mas proximos, la recuperacion BM25 opcional, la fusion de rangos y el formateo de salidas de benchmark pertenecen al pipeline circundante.

## Capacidades

- Generacion de embeddings de texto para recuperacion densa (feature-extraction), no generacion de texto.
- Recuperacion conversacional: codifica un turno objetivo junto con el historial de dialogo para representar la necesidad informativa dependiente del contexto.
- Recuperacion de pasajes en dominios especificos sobre una coleccion documental dada.
- Integracion en esquemas hibridos: combinable con BM25 y fusion de rangos (RRF) segun la arquitectura de referencia de la model card.
- Negativos duros BM25 y negativos en lote durante el entrenamiento, orientados a discriminar candidatos lexicamente plausibles.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de embeddings).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es un componente de recuperacion, no un agente).
- Capacidades multilingues: no; solo ingles (en).
- Capacidades especiales: normalizacion L2 y pooling configurables; no se documenta modo de razonamiento, vision ni audio.

## Casos de uso

- Recuperacion en pipelines RAG conversacionales: el codificador permite recuperar pasajes de soporte a partir de un turno de usuario que depende del historial, resolviendo elipsis y anáforas antes de la generacion.
- Atencion al cliente automatizada: en conversaciones multiturno con seguimiento de contexto, el modelo recupera la documentacion o articulo de ayuda relevante para el turno actual en lugar de tratar cada mensaje como una consulta aislada.
- Busqueda en documentacion tecnica con dialogo de seguimiento: un desarrollador pregunta primero por una funcion y luego pide "y sus parametros opcionales"; el modelo codifica historial y turno para recuperar la seccion correcta.
- Sistemas de question answering sobre un corpus de dominio: sirve como primera etapa de recuperacion que alimenta un lector o un LLM generador, aprovechando su especializacion en el dataset RETECO.
- Recuperacion hibrida dispersa-densa: combinado con BM25 y RRF dentro del mismo pipeline, como describe la arquitectura de la model card, para mejorar la robustez del ranking.
- Extraccion de caracteristicas para clasificacion, clustering o deduplicacion de pasajes: el modelo expone embeddings normalizados L2 reutilizables en tareas auxiliares de NLP.
- Evaluacion replicable de la Sub-track 2a: dado que la model card define la metrica oficial (nDCG@10 macro-promediado), el adaptador puede usarse como baseline reproducible dentro del benchmark RETECO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define la metrica oficial (nDCG@10 macro-promediado) y metricas de diagnostico (Recall@K, MRR, desglose por dominio y por profundidad de turno), pero no incluye valores numericos de rendimiento para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene alrededor de 109 M de parametros. En FP32 ocuparia aproximadamente 440 MB de pesos; en FP16, alrededor de 220 MB; en INT8, alrededor de 110 MB. El adaptador LoRA anade un coste marginal pequeno. Estas cifras son estimaciones derivadas del tamano del modelo base; no se proporcionan medidas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia del codificador. Una RTX 4090, A100 o H100 ofrecen amplio margen para lotes grandes.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: transformers combinado con PEFT (ruta mostrada en la model card), sentence-transformers para pipelines de embeddings, y servidores de inferencia compatibles con modelos de embeddings como TGI o vLLM. La conversion a GGUF para llama.cpp u Ollama no se documenta en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemEval-2027-Task-1-subtrack-2a (este) | Adaptador sobre base de ~109 M | 512 tokens (base) | Bi-encoder denso + LoRA, recuperacion conversacional | no disponible | HuggingFace (0 descargas) |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | Bi-encoder denso de proposito general | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| Otros sistemas de la Sub-track 2a de RETECO | no disponible | no disponible | Recuperacion conversacional | no disponible | no disponible |

La comparativa se limita a la relacion con el modelo base documentada en la propia model card (BAAI/bge-base-en-v1.5). No se dispone de datos de rendimiento ni de especificaciones de alternativas directas dentro de la Sub-track 2a en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere cargar BAAI/bge-base-en-v1.5 como base, salvo que el repositorio contenga pesos completos, lo cual debe verificarse en la lista de archivos.
- No es un servicio de busqueda: la codificacion del corpus, la busqueda de vecinos, BM25 y la fusion de rangos quedan fuera del alcance del repositorio.
- Sensibilidad a la configuracion: pooling, normalizacion L2, formateo de consulta y longitud maxima de secuencia deben coincidir con los del entrenamiento; usar una frase de seguimiento cruda como consulta autonoma degrada la recuperacion.
- Solo ingles: el modelo declara exclusivamente el idioma en, por lo que no cubre consultas en otros idiomas.
- Licencia no declarada: no se especifica licencia en la informacion disponible, lo que supone un riesgo para uso comercial y para la redistribucion hasta que se aclare.
- Inconsistencia en la model card: el ejemplo de carga referencia el ID de repositorio de la Sub-track 2b (...-subtrack-2b) mientras que este repositorio es 2a; hay que sustituir el ID por el correcto, tal como advierte el propio texto.
- Sin benchmarks publicados: no hay evidencia numerica de rendimiento frente a baselines.
- Riesgo de alucinacion: no aplica directamente a un modelo de embeddings, pero un recuperador imperfecto puede devolver pasajes irrelevantes que induzcan errores en el generador que consuma sus resultados.
- Sesgos: no se documenta analisis de sesgos en la informacion proporcionada.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GiovanniIacuzzo02/SemEval-2027-Task-1-subtrack-2a
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/DataScience-UIBK/RETECO-SemEval2027
- Pagina del proyecto RETECO: https://datascienceuibk.github.io/RETECO/
- Definicion de la tarea: https://datascienceuibk.github.io/RETECO/task.html
- Protocolo de evaluacion: https://datascienceuibk.github.io/RETECO/evaluation.html
