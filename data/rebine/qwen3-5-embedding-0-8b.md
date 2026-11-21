# Rebine/Qwen3.5-Embedding-0.8B

## Resumen
Etsu-Embedding-0.8B (publicado en Hugging Face como `Rebine/Qwen3.5-Embedding-0.8B`) es un modelo de embeddings de texto afinado a partir de `Qwen/Qwen3.5-0.8B-Base` por el usuario Rebine. Su propósito declarado es la recuperación semántica de memoria de agentes y dominios específicos, con soporte para consultas cortas tipo palabra clave y preguntas en lenguaje natural. Con 752.393.024 parámetros, 24 capas y una dimensión de embedding de 1024, se posiciona como una alternativa ligera y de licencia Apache-2.0 frente a modelos de embedding de tamaño similar.

El modelo emplea la arquitectura híbrida de texto de Qwen3.5, con 18 capas de atención lineal y 6 de atención completa, lo que reduce el coste computacional en contextos largos. La longitud de contexto es de 2048 tokens y la salida es un vector de 1024 dimensiones con pooling de último token y normalización L2. Soporta truncamiento Matryoshka (MRL) a 128, 256, 512 y 768 dimensiones, lo que permite ajustar el coste de almacenamiento y búsqueda a cambio de calidad.

Es relevante ahora porque aborda un caso de uso concreto y creciente: la recuperación de memoria en agentes conversacionales y bases de conocimiento personales, donde los modelos de embedding generalistas no siempre rinden bien. El autor publica comparativas frente a `Qwen/Qwen3-Embedding-0.6B` en tres conjuntos de evaluación, con resultados mixtos: mejor en el conjunto de validación convencional a partir de 512 dimensiones, pero peor en el conjunto de memoria no vista a dimensiones bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid text model (18 capas de atención lineal + 6 de atención completa) |
| Parametros totales | 752.393.024 (752M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado en BF16; el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | Chino e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos técnicos: hidden size 1024, intermediate size 3584, vocabulario de 248.320 tokens, dimensión de embedding 1024 con MRL a 128/256/512/768, pooling de último token, normalización L2, similitud coseno o producto escalar normalizado, precisión de entrenamiento BF16, tamaño del repositorio 1,5 GB.

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen3.5-0.8B-Base`, un transformer híbrido de 24 capas en el que 18 capas usan atención lineal y 6 usan atención completa. Esta combinación busca reducir el coste de atención en secuencias largas manteniendo la capacidad de modelado global de las capas de atención completa. El modelo se ha convertido en un encoder de embeddings mediante fine-tuning con pooling de último token y normalización L2, y no incluye un wrapper de pooling de `sentence-transformers`, por lo que el protocolo de codificación debe implementarse manualmente.

El entrenamiento se realizó sobre datos de recuperación en chino construidos a partir de dos conjuntos públicos combinados, deduplicados y mezclados: `sentence-transformers/t2ranking` (600.000 filas de train con campos query/positive/negative) y `sentence-transformers/dureader` (180.000 filas de train, según la información disponible, que aparece truncada). No se documenta el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo de embeddings, el objetivo es probablemente una pérdida contrastiva, pero el autor no lo especifica. La innovación técnica destacable es el soporte de dimensiones Matryoshka (MRL) con truncamiento antes de la normalización L2 final, y un protocolo de consulta con prefijo de instrucción (`Instruct: Given a query, retrieve relevant passages that answer the query` / `Query: {query}`) mientras que los pasajes y memorias se codifican sin prefijo.

## Capacidades
- Generación de embeddings de texto para similitud semántica y recuperación de información (pipeline `feature-extraction`).
- Recuperación de memoria de agentes: codificación de fragmentos de memoria y consultas en un espacio vectorial compartido.
- Búsqueda en bases de conocimiento personales, archivos de conversaciones y documentación técnica.
- Soporte de consultas cortas tipo palabra clave y preguntas en lenguaje natural.
- Multilingüe limitado a chino e inglés.
- Embeddings de dimensión variable mediante MRL (128, 256, 512, 768, 1024) para compromisos entre almacenamiento y calidad.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento: es un modelo exclusivamente de embeddings.
- No incluye wrapper de pooling integrado; requiere implementar el pooling de último token y el prefijo de consulta.

## Casos de uso
- Memoria de agentes conversacionales: el modelo codifica fragmentos de memoria y la consulta del usuario, y el agente recupera los k fragmentos más similares por similitud coseno. El autor recomienda Recall@10 como métrica principal porque la búsqueda de memoria por defecto de OpenClaw devuelve hasta 10 resultados.
- Base de conocimiento personal: indexación de notas, correos o documentos en chino o inglés y búsqueda semántica con consultas naturales; el contexto de 2048 tokens es suficiente para fragmentos de documentación típicos.
- Archivo de conversaciones: recuperación de turnos previos relevantes en un historial largo, usando MRL a 768 dimensiones para reducir el almacenamiento de vectores aproximadamente un 25 % respecto a 1024.
- Documentación técnica: búsqueda de pasajes relevantes en manuales y referencias de API, con el prefijo de instrucción en la consulta para mejorar la recuperación.
- Deduplicación y agrupamiento semántico: cálculo de similitud entre pares de textos para eliminar duplicados o agrupar contenido relacionado en pipelines de datos.
- Filtrado previo en sistemas RAG: recuperación de candidatos con un modelo de 752M parámetros antes de un reranking más costoso, reduciendo la latencia total del pipeline.
- Búsqueda en aplicaciones con requisitos de licencia permisiva: al ser Apache-2.0, puede integrarse en productos comerciales sin las restricciones de licencias no comerciales.

## Benchmarks y rendimiento
El autor publica comparativas frente a `Qwen/Qwen3-Embedding-0.6B` (etiquetado como "Official") en tres conjuntos, usando el mismo protocolo de tokenizador, instrucción de consulta, pooling, normalización, corpus y conjunto de consultas por fila. Los valores son Recall@K o MRR.

OpenClaw fine-tuning validation:

| Dim | S2 R@1 | Official R@1 | S2 R@3 | Official R@3 | S2 R@5 | Official R@5 | S2 R@10 | Official R@10 | S2 MRR | Official MRR |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 128 | 8,96 % | 17,19 % | 19,57 % | 31,84 % | 25,82 % | 37,98 % | 35,32 % | 46,49 % | 17,57 % | 27,38 % |
| 256 | 15,04 % | 20,12 % | 30,74 % | 35,99 % | 38,58 % | 43,67 % | 50,14 % | 52,35 % | 26,46 % | 31,25 % |
| 512 | 21,67 % | 22,33 % | 40,57 % | 39,19 % | 49,75 % | 47,21 % | 62,02 % | 57,16 % | 34,84 % | 34,11 % |
| 768 | 23,88 % | 22,94 % | 44,67 % | 40,57 % | 53,45 % | 48,31 % | 65,06 % | 58,71 % | 37,60 % | 34,97 % |
| 1024 | 25,21 % | 23,66 % | 45,55 % | 41,46 % | 54,62 % | 49,36 % | 66,56 % | 59,92 % | 38,86 % | 35,66 % |

Unseen memory (corpus de 382 fragmentos de memoria posteriores a 2026-08-08; 1.048 consultas generadas con Gemini y qrels multi-positivo cuando aplica):

| Dim | S2 R@1 | Official R@1 | S2 R@3 | Official R@3 | S2 R@5 | Official R@5 | S2 R@10 | Official R@10 | S2 MRR | Official MRR |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 128 | 12,02 % | 18,80 % | 26,15 % | 40,55 % | 35,50 % | 49,43 % | 47,81 % | 59,73 % | 23,76 % | 33,14 % |
| 256 | 17,08 % | 20,32 % | 35,40 % | 43,89 % | 45,99 % | 51,91 % | 61,83 % | 62,02 % | 31,00 % | 35,07 % |
| 512 | 20,42 % | 23,09 % | 43,23 % | 45,32 % | 54,87 % | 54,10 % | 68,61 % | 63,93 % | 36,48 % | 37,40 % |
| 768 | 21,56 % | 22,04 % | 45,80 % | 45,80 % | 59,06 % | 54,39 % | 72,23 % | 63,84 % | 38,22 % | 36,91 % |
| 1024 | 22,33 % | 21,09 % | 46,47 % | 45,52 % | 58,59 % | 53,91 % | 72,04 % | 64,31 % | 38,80 % | 36,25 % |

Conventional content validation sample (muestra estratificada de 382 consultas del split de validación de preentrenamiento, con 761 pasajes positivos/negativos únicos):

| Dim | S2 R@1 | Official R@1 | S2 R@3 | Official R@3 | S2 R@5 | Official R@5 | S2 R@10 | Official R@10 | S2 MRR | Official MRR |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 128 | 80,37 % | 81,41 % | 93,46 % | 93,19 % | 96,60 % | 96,34 % | 98,43 % | 97,91 % | 87,45 % | 87,93 % |
| 256 | 87,70 % | 85,86 % | 96,60 % | 93,98 % | 98,43 % | 96,34 % | 99,74 % | 97,64 % | 92,42 % | 90,43 % |
| 512 | 89,53 % | 85,34 % | 97,91 % | 93,72 % | 99,21 % | 96,34 % | 99,74 % | 98,43 % | 93,71 % | 90,22 % |
| 768 | 91,10 % | 84,82 % | 97,64 % | 95,03 % | 99,21 % | 97,38 % | 99,74 % | 98,69 % | 94,58 % | 90,34 % |
| 1024 | 91,36 % | 84,29 % | 97,64 % | 95,29 % | 98,95 % | 97,12 % | 99,74 % | 98,69 % | 94,74 % | 90,13 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 752M parámetros; en BF16 requiere aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y tokenizador. En FP32, unos 3 GB. En cuantizaciones de 8 bits o 4 bits, el peso se reduce a menos de 1 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para indexación por lotes a gran escala, se recomienda A100 o H100 por throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y superiores; también en GPUs de 8 GB con margen amplio.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con endpoints de Hugging Face (`endpoints_compatible`), y frameworks de inferencia que carguen safetensors. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI; al ser un modelo de embeddings, la integración típica es mediante transformers con pooling manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El contexto máximo de 2048 tokens limita el coste por secuencia y las 18 capas de atención lineal reducen el coste frente a un transformer de atención completa equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión de embedding | Idiomas | Licencia | Rendimiento comparado |
|---|---:|---:|---:|---|---|---|
| Etsu-Embedding-0.8B (este modelo) | 752M | 2048 | 1024 (MRL 128-1024) | Chino, inglés | Apache-2.0 | Mejor R@10 y MRR en validación convencional a partir de 512 dim; peor en memoria no vista a 128 y 256 dim |
| Qwen/Qwen3-Embedding-0.6B | no disponible en la información | no disponible | no disponible | no disponible | no disponible | Mejor en OpenClaw a 128 y 256 dim; mejor en memoria no vista a 128 y 256 dim; peor en validación convencional a partir de 512 dim |
| Otros modelos de embedding de ~0,5-1B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparativa con datos publicados es frente a `Qwen/Qwen3-Embedding-0.6B`. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- Idiomas limitados a chino e inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Contexto máximo de 2048 tokens: los documentos o fragmentos de memoria más largos deben dividirse, lo que puede perder coherencia entre fragmentos.
- Los resultados frente a `Qwen/Qwen3-Embedding-0.6B` son mixtos: este modelo pierde claramente en dimensiones bajas (128 y 256) en los conjuntos de memoria, por lo que el truncamiento MRL agresivo degrada la recuperación.
- El conjunto de evaluación "Unseen memory" usa consultas generadas con Gemini y un corpus de 382 fragmentos; es una evaluación interna del autor, no un benchmark estándar como MTEB, y no es directamente comparable con resultados publicados de otros modelos.
- No es un paquete `sentence-transformers` con wrapper de pooling: una integración incorrecta (pooling o prefijo de consulta mal aplicados) degrada la calidad de forma significativa.
- Riesgo de alucinación: no aplica directamente porque el modelo no genera texto, pero los sistemas de recuperación que lo usan pueden devolver pasajes irrelevantes si el corpus es ruidoso o si la consulta está fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados por el autor; al entrenarse con datos de recuperación en chino de dos conjuntos públicos, puede heredar sesgos de esos corpus.
- La información de entrenamiento está parcialmente truncada en la model card (la fila de `dureader` aparece incompleta), por lo que no se puede verificar la composición total del dataset.
- Licencia Apache-2.0: permite uso comercial, pero el autor enlaza la licencia del modelo base de Qwen, que conviene revisar por si impone condiciones adicionales.
- El modelo tiene 992 descargas y 1 like en el momento de la consulta, con creación en 2026-08-20 y última actualización en 2026-10-17; es un modelo reciente y con poca validación externa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Rebine/Qwen3.5-Embedding-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Dataset t2ranking: https://huggingface.co/datasets/sentence-transformers/t2ranking
- Dataset dureader: https://huggingface.co/datasets/sentence-transformers/dureader
- Modelo de comparación: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
