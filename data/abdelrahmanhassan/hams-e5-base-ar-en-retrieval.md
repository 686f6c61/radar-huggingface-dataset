# AbdelrahmanHassan/hams-e5-base-ar-en-retrieval

## Resumen

hams-e5-base-ar-en-retrieval es un modelo de embeddings de frases obtenido por fine-tuning de intfloat/multilingual-e5-base, especializado en recuperación de información (retrieval) bilingüe árabe-inglés, incluyendo consultas mixtas y cross-lingual. Lo desarrolla AbdelrahmanHassan en el contexto de una evaluación de arquitectura RAG autoalojada para Hams.AI, y está pensado para indexar y consultar bases de conocimiento empresariales donde conviven documentos en árabe estándar moderno (MSA) e inglés.

El modelo conserva la arquitectura XLM-RoBERTa del modelo base, con 278.043.648 parámetros (aproximadamente 278 M), y produce embeddings densos normalizados de 768 dimensiones. Se distribuye en formato safetensors y es compatible con sentence-transformers, text-embeddings-inference y endpoints de Hugging Face, lo que facilita su despliegue en pipelines de búsqueda semántica y RAG.

Su relevancia radica en la mejora medida sobre el modelo base en un conjunto de test retenido: Recall@5 pasa de 0,725 a 0,927 y Recall@5 cross-lingual de 0,434 a 0,906. No obstante, el ajuste se realizó sobre un corpus sintético pequeño (475 pares consulta-pasaje), por lo que las ganancias deben validarse en dominios distintos antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base_model intfloat/multilingual-e5-base) |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base multilingual-e5-base admite 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar (arabe estandar moderno), en (ingles); consultas mixtas y cross-lingual ar-en |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers; tamano del repo 1,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de intfloat/multilingual-e5-base, un encoder transformer de tipo XLM-RoBERTa con 278 M de parametros que genera embeddings de frases mediante pooling sobre las representaciones del encoder. El fine-tuning se realizo con aprendizaje contrastivo usando CachedMultipleNegativesRankingLoss, con batch de 64, 4 epocas y learning rate 2e-5, sobre 475 filas de pares consulta-pasaje con negativos duros minados. La matriz de embeddings de palabras se mantuvo congelada durante el entrenamiento.

El corpus de entrenamiento es sintetico y pequeno, orientado a una base de conocimiento empresarial bilingue. El modelo mantiene la convencion de prefijos de la familia e5: las consultas deben prefijarse con `query: ` y los pasajes con `passage: `. La evaluacion se realizo sobre 10 documentos no vistos y 138 preguntas, en una RTX 3050 Laptop, midiendo recuperacion densa unicamente (sin re-ranking hibrido).

## Capacidades

- Generacion de embeddings densos de frases para busqueda semantica y recuperacion de pasajes.
- Recuperacion bilingue arabe-ingles, incluyendo consultas en un idioma contra documentos en el otro (cross-lingual).
- Manejo de consultas mixtas que combinan arabe e ingles en la misma cadena.
- Integracion directa con sentence-transformers mediante `SentenceTransformer.encode` con `normalize_embeddings=True`.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face para servir el modelo como API.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-step: es exclusivamente un modelo de representacion (feature-extraction).
- No dispone de capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en bases de conocimiento empresariales bilingues: indexar documentos en arabe e ingles y recuperar los pasajes mas relevantes para una consulta en cualquiera de los dos idiomas, aprovechando la mejora en Recall@5 cross-lingual (0,906 frente a 0,434 del base).
- Pipeline RAG para atencion al cliente: usar el modelo como recuperador denso que alimenta un LLM generador con los pasajes recuperados, manteniendo los prefijos `query: ` y `passage: ` en cada extremo del pipeline.
- Busqueda cross-lingual en documentacion tecnica: un usuario formula la consulta en arabe y recupera fragmentos de manuales escritos en ingles, o viceversa, sin traduccion intermedia.
- Deduplicacion y agrupacion de documentos: generar embeddings normalizados de pasajes y calcular similitud coseno para detectar contenido duplicado o casi duplicado entre corpus en ambos idiomas.
- Clasificacion y enrutado por similitud: comparar la consulta del usuario contra embeddings de intenciones predefinidas para dirigirla al departamento o flujo adecuado.
- Evaluacion de calidad de recuperacion en entornos con recursos limitados: al ocupar 1,1 GB en safetensors y 278 M de parametros, puede ejecutarse en GPU de consumo (la model card reporta evaluacion en una RTX 3050 Laptop) para pruebas y prototipos.
- Filtrado previo en motores de busqueda hibridos: combinar la recuperacion densa del modelo con BM25 para re-ranking en dominios donde el ajuste sintetico no generalice bien.

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido reportado por el autor (10 documentos no vistos, 138 preguntas, recuperacion densa unicamente, RTX 3050 Laptop):

| Metrica | Modelo base | Fine-tuned |
|---|---|---|
| Recall@5 | 0,725 | 0,927 |
| nDCG@10 | 0,651 | 0,818 |
| Recall@5 cross-lingual | 0,434 | 0,906 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 278 M de parametros y pesa 1,1 GB en safetensors; en fp32 requiere aproximadamente 1,1 GB de pesos mas overhead de activaciones, y en fp16 alrededor de 0,6 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para lotes pequenos; la model card documenta su evaluacion en una RTX 3050 Laptop. Para alto throughput, A100 o H100 permiten lotes grandes, aunque el modelo es pequeno y no las requiere.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores; tambien puede ejecutarse en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (tag text-embeddings-inference), endpoints de Hugging Face (tag endpoints_compatible) y servidores de embeddings compatibles con la API de sentence-transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; no se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hams-e5-base-ar-en-retrieval | 278 M | no disponible | ar, en | MIT | Fine-tune especializado en retrieval ar-en; Recall@5 0,927 y cross-lingual 0,906 en su test interno |
| intfloat/multilingual-e5-base | 278 M | no disponible | multilingue | MIT | Modelo base; en el mismo test interno obtiene Recall@5 0,725 y cross-lingual 0,434 |
| Otros modelos de embeddings multilingues de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion con alternativas fuera de la familia e5 no esta disponible en la informacion proporcionada; los unicos datos numericos son los del modelo base frente al fine-tune en el test interno del autor.

## Limitaciones y advertencias

- El fine-tuning se realizo sobre un corpus sintetico de solo 475 pares consulta-pasaje; el propio autor advierte que las ganancias pueden ser menores en dominios muy distintos.
- Los resultados de evaluacion proceden de un test interno pequeno (10 documentos, 138 preguntas) y no de un benchmark estandar, por lo que no son directamente comparables con cifras publicas de MTEB u otros conjuntos.
- Riesgo de sobreajuste al formato y vocabulario de la base de conocimiento empresarial usada en el entrenamiento; conviene validar en el dominio objetivo antes de desplegar.
- Es obligatorio mantener los prefijos `query: ` y `passage: `; omitirlos degrada la calidad de la recuperacion.
- Solo cubre arabe estandar moderno e ingles; no se ha evaluado su comportamiento en dialectos arabes ni en otros idiomas.
- No genera texto ni soporta tool calling; no debe usarse como sustituto de un LLM en tareas generativas.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar el modelo base, puede arrastrar sesgos de sus datos de entrenamiento.
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantia de rendimiento ni de exactitud de los embeddings en produccion.
- El modelo tiene pocas descargas (17) y ningun like en el momento de la consulta, lo que indica una validacion externa muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbdelrahmanHassan/hams-e5-base-ar-en-retrieval
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Repositorio del proyecto con `model_card.md` (detalles de entrenamiento y errores corregidos): no disponible como enlace en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
