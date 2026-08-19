# leeroy-jankins/bobo

## Resumen

Bobo es un modelo de embeddings textuales derivado de `mixedbread-ai/mxbai-embed-large-v1`, desarrollado por el usuario `leeroy-jankins` y publicado bajo licencia MIT. Su propósito principal es generar representaciones vectoriales densas para tareas de búsqueda semántica, recuperación aumentada por generación (RAG), agrupamiento (clustering), deduplicación y clasificación zero-shot, con un enfoque específico en el dominio financiero y regulatorio de los Estados Unidos.

El modelo se distribuye como un encoder transformer compatible con la librería `sentence-transformers` y está empaquetado en formato GGUF, lo que facilita su integración en stacks de indexación vectorial como FAISS, Milvus, pgvector o Qdrant. Con 334 millones de parámetros, Bobo mantiene la arquitectura probada de su modelo base, pero ha sido ajustado con datasets especializados en legislación presupuestaria federal, regulaciones del CFR y datos contables del Tesoro de EE. UU., lo que lo hace especialmente relevante para aplicaciones de análisis financiero gubernamental y cumplimiento normativo.

La relevancia actual de Bobo radica en su especialización vertical: mientras que los modelos de embeddings genéricos funcionan bien en dominios amplios, Bobo ofrece una alternativa de código abierto y con licencia permisiva (MIT) para equipos que necesitan recuperar información precisa de documentos regulatorios complejos, sin depender de APIs propietarias ni de modelos de pago.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (compatible con Sentence-Transformers) |
| Parametros totales | 334.092.288 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de la configuracion del modelo base; se recomienda trocear documentos en fragmentos de 256-512 tokens) |
| Tipos de cuantizacion | GGUF (derivado de `ChristianAzinn/mxbai-embed-large-v1-gguf`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF, safetensors (repositorio de 1.6 GB) |

## Arquitectura y entrenamiento

Bobo es un modelo encoder transformer, basado en la arquitectura de `mixedbread-ai/mxbai-embed-large-v1`. Utiliza mean pooling para agregar las representaciones de los tokens y permite la normalizacion L2 opcional para flujos de trabajo basados en similitud coseno. El modelo no es un LLM generativo, sino un encoder puro diseñado para producir vectores densos de alta calidad.

El entrenamiento se realizo mediante fine-tuning sobre el modelo base, utilizando una combinacion de datasets generales y especializados. Entre los datasets de ajuste se incluyen `mlabonne/FineTome-100k` (conversaciones y razonamiento general) y una serie de datasets propios del autor centrados en finanzas publicas de EE. UU., como `leeroy-jankins/Regulations`, `leeroy-jankins/Appropriations`, `leeroy-jankins/OMB-Circular-A-11`, `leeroy-jankins/RedBook`, `leeroy-jankins/SF133`, `leeroy-jankins/US-General-Ledger` y `leeroy-jankins/Title-31-CFR-Money-and-Finance`. Tambien se mencionan datasets adicionales como la Ley de Control Presupuestario de 2011, la Ley DATA de 2014, el FASTBook, la Regulacion Federal de Adquisiciones (FAR) y los estandares de control interno federal. No se especifica si se utilizaron tecnicas de RLHF o DPO; la informacion disponible solo indica fine-tuning supervisado sobre estos corpus.

## Capacidades

- Generacion de embeddings densos para busqueda semantica y recuperacion de informacion.
- Soporte nativo para flujos de RAG (Retrieval-Augmented Generation) mediante integracion con indices ANN como FAISS, ScaNN, Milvus, pgvector, Qdrant, Chroma y Weaviate.
- Agrupamiento (clustering) de documentos por similitud semantica.
- Deduplicacion de registros o documentos repetidos en grandes volumenes de datos.
- Clasificacion zero-shot: permite asignar categorias a textos sin necesidad de entrenamiento adicional, usando la similitud entre el texto y las etiquetas.
- Especializacion en dominio financiero y regulatorio de EE. UU., incluyendo legislacion presupuestaria, contabilidad federal, adquisiciones y control interno.
- Requiere un prompt especifico para consultas en tareas de recuperacion: `Represent this sentence for searching relevant passages: `.
- No soporta tool calling, generacion de texto, vision ni audio, al ser exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en regulaciones federales: Bobo puede indexar documentos como el Título 31 del CFR o la Circular A-11 de la OMB, permitiendo a analistas localizar rapidamente clausulas especificas sobre presupuesto o deficit mediante consultas en lenguaje natural.
- Asistentes de RAG para analisis presupuestario: integrado en un pipeline de RAG, el modelo recupera los fragmentos relevantes de leyes como la Ley de Control Presupuestario de 2011 para que un LLM generativo elabore resumenes o responda preguntas complejas sobre limites de gasto.
- Deduplicacion de registros contables: en bases de datos del Libro Mayor General de EE. UU. o informes SF133, Bobo puede identificar entradas duplicadas o casi duplicadas comparando embeddings, reduciendo errores en auditorias.
- Clasificacion zero-shot de partidas presupuestarias: dado un texto descriptivo de una apropiacion, el modelo puede asignarlo a categorias predefinidas (por ejemplo, defensa, sanidad, infraestructura) sin necesidad de un clasificador entrenado.
- Indexacion de contratos de adquisicion: la Regulacion Federal de Adquisiciones (FAR) es extensa y compleja; Bobo permite buscar clausulas contractuales por similitud semantica, agilizando la revision de contratos en agencias gubernamentales.
- Auditoria de cumplimiento normativo: los equipos de compliance pueden usar Bobo para comparar documentos internos de agencias con los estandares de control interno federal (FMFIA) y detectar desviaciones o lagunas en los controles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, MTEB o similares para este modelo. Se recomienda a los usuarios evaluar el rendimiento en sus propios conjuntos de datos de recuperacion, especialmente en el dominio financiero, para validar su eficacia frente a alternativas genericas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 334 millones de parametros, la huella de memoria es reducida. En cuantizacion GGUF de 4 bits, el modelo ocupa aproximadamente 0,2-0,3 GB, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU con suficiente RAM.
- GPU recomendadas: no se requiere hardware de alta gama; una GPU con 4 GB de VRAM es suficiente para inferencia en batch. Para despliegues de alto rendimiento con muchos requests concurrentes, se recomienda una A10G o A100.
- Compatibilidad con consumer GPU: si, el modelo es ligero y puede ejecutarse en GPUs de gama media e incluso en CPU (aunque con mayor latencia).
- Opciones de despliegue: al ser compatible con `sentence-transformers`, puede desplegarse con FastAPI o servicios como Hugging Face Inference Endpoints. Al estar en formato GGUF, tambien es compatible con `llama.cpp` y `Ollama` para inferencia local. Para indexacion vectorial, se integra con FAISS, Milvus, pgvector, Qdrant, Chroma y Weaviate.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU consumer, la generacion de embeddings para un texto de 256 tokens suele completarse en milisegundos, permitiendo cientos de peticiones por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto maximo | Licencia | Especializacion | Formato |
|---|---|---|---|---|---|
| Bobo (leeroy-jankins) | 334 M | No disponible (recomendado 256-512 tokens) | MIT | Finanzas y regulacion federal de EE. UU. | GGUF, safetensors |
| mixedbread-ai/mxbai-embed-large-v1 | 334 M | 512 tokens | MIT | Generico (multilingue limitado) | safetensors |
| BAAI/bge-large-en-v1.5 | 326 M | 512 tokens | MIT | Generico (ingles) | safetensors |
| intfloat/e5-large-v2 | 326 M | 512 tokens | MIT | Generico (multilingue) | safetensors |

Bobo se diferencia de sus alternativas principalmente por su fine-tuning especifico en datos regulatorios y financieros de EE. UU., lo que puede ofrecer una ventaja en tareas de recuperacion dentro de ese dominio, aunque a costa de una menor generalizacion a otros sectores. Su licencia MIT y su disponibilidad en GGUF lo hacen tan accesible como sus competidores.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo ha sido entrenado predominantemente con documentos regulatorios y financieros de EE. UU., por lo que puede presentar un sesgo hacia el vocabulario y las estructuras legales de ese pais, y un rendimiento suboptimo en dominios no relacionados.
- Riesgo de alucinacion: al ser un modelo de embeddings, no genera texto, por lo que no existe riesgo de alucinacion en el sentido clasico. Sin embargo, la calidad de la recuperacion depende de la calidad del corpus indexado; si los documentos fuente contienen errores, estos se propagaran en los resultados.
- Limitaciones de contexto: la longitud maxima de entrada no esta documentada explicitamente, pero se hereda del modelo base (probablemente 512 tokens). Los documentos largos deben trocearse, lo que puede perder coherencia contextual si no se gestiona adecuadamente.
- Limitaciones de idioma: solo soporta ingles. No es adecuado para busqueda semantica en espanol, frances u otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la exactitud de los resultados en aplicaciones criticas de cumplimiento normativo o auditoria.
- Caveat para produccion: el modelo requiere el prompt especifico `Represent this sentence for searching relevant passages: ` para consultas en tareas de recuperacion; omitirlo degrada significativamente el rendimiento. Ademas, se recomienda detectar la dimension de los embeddings en tiempo de ejecucion y configurar el indice vectorial en consecuencia, ya que la dimension puede variar segun la configuracion del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leeroy-jankins/bobo
- Modelo base: https://huggingface.co/ChristianAzinn/mxbai-embed-large-v1-gguf
- Modelo base original: https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1
- Dataset de fine-tuning general: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Datasets de fine-tuning especializado (seleccion):
  - https://huggingface.co/datasets/leeroy-jankins/Regulations
  - https://huggingface.co/datasets/leeroy-jankins/Appropriations
  - https://huggingface.co/datasets/leeroy-jankins/OMB-Circular-A-11
  - https://huggingface.co/datasets/leeroy-jankins/RedBook
  - https://huggingface.co/datasets/leeroy-jankins/SF133
  - https://huggingface.co/datasets/leeroy-jankins/US-General-Ledger
  - https://huggingface.co/datasets/leeroy-jankins/Title-31-CFR-Money-and-Finance
  - https://huggingface.co/datasets/leeroy-jankins/The-Balanced-Budget-And-Emergency-Deficit-Control-Act-of-1985
  - https://huggingface.co/datasets/leeroy-jankins/The-Budget-Control-Act-2011
  - https://huggingface.co/datasets/leeroy-jankins/Data-Act-2014
  - https://huggingface.co/datasets/leeroy-jankins/FastBook
  - https://huggingface.co/datasets/leeroy-jankins/Federal-Acquisition-Regulation
  - https://huggingface.co/datasets/leeroy-jankins/Federal-Government-Standards-For-Internal-Controls
  - https://huggingface.co/datasets/leeroy-jankins/FMFIA-1982
  - https://huggingface.co/datasets/leeroy-jankins/Federal-Trust-Fund-Accounting-Guide
  - https://huggingface.co/datasets/leeroy-jankins/DOD-7000-14-Financial-Management-Regulation
