# moganai/MoganBERT-Embed

## Resumen

MoganBERT-Embed es un modelo de embeddings de frases en turco desarrollado por MoganAI. Consta de 148.768.512 parámetros (aproximadamente 149M) y se construye sobre el encoder base MoganBERT-TR, también del mismo autor. Su función es proyectar texto a vectores densos de 768 dimensiones mediante mean pooling y normalización L2, lo que lo hace apto para búsqueda semántica, clustering, clasificación y evaluación de similitud textual (STS). No requiere prefijos ni instrucciones de tarea, lo que simplifica su integración en pipelines existentes.

La relevancia del modelo radica en dos factores. Primero, el ecosistema de embeddings de alta calidad para turco es comparativamente escaso frente a lenguas como el inglés, y MoganBERT-Embed se presenta como una alternativa nativa entrenada específicamente para ese idioma. Segundo, el proceso de entrenamiento documentado aborda un problema técnico concreto: las representaciones crudas del encoder base son fuertemente anisótropas (`cos_raw` = 0.9841), lo que las hace inservibles para similitud coseno, y se corrigen mediante destilación desde un profesor de mayor tamaño más un ajuste contrastivo posterior.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la librería sentence-transformers, además de soporte para text-embeddings-inference. Cuenta con 327 descargas y 4 likes en Hugging Face en el momento de la consulta, y fue publicado el 27 de agosto de 2026 con última actualización el 24 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, según tag `modernbert`) |
| Parámetros totales | 148.768.512 (aproximadamente 149M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo usado en evaluación MTEB; el modelo base no especifica un valor distinto en la información disponible) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | Turco (`tr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería sentence-transformers) |
| Dimensión de embedding | 768 |
| Pooling | Mean pooling con normalización L2 |
| Modelo base | moganai/MoganBERT-TR |
| Tamaño del repositorio | 0.6 GB |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT con 149M de parámetros, heredado de MoganBERT-TR, un encoder foundational para turco entrenado desde cero con un currículo CLM-MLM según el artículo citado (Yilmaz, Tasdemir y Gozay, arXiv:2608.25768). Sobre ese encoder se aplica una cabeza de embedding que produce vectores de 768 dimensiones mediante mean pooling y normalización L2. El modelo no emplea prompt ni instrucción de tarea: la misma representación sirve para retrieval, clustering, clasificación y STS.

El entrenamiento se estructura en dos fases. La primera es una destilación desde el profesor Qwen3-Embedding-8B, en la que el estudiante se proyecta hacia el espacio de 3072 dimensiones del profesor y se añade un término de regularización de anisotropía GOR a la función de pérdida. Esta fase por sí sola reduce `cos_raw` de 0.9841 a 0.0851 y eleva el rendimiento de retrieval zero-shot de 0.2361 a 0.5927. La segunda fase es un ajuste fino contrastivo con InfoNCE y negativos duros, que incorpora señales de NLI, STS graduado (CoSENT), etiquetas de clasificación, pares de pregunta-respuesta y textos paralelos junto a los pares de retrieval. El checkpoint publicado es una media ponderada de la fase 1 y de dos ejecuciones de la fase 2.

## Capacidades

- Generación de embeddings de frases en turco con dimensión fija de 768 y normalización L2, listos para similitud coseno.
- Búsqueda semántica y recuperación de información densa (dense retrieval) sobre corpus en turco.
- Clustering y agrupamiento semántico de documentos o consultas.
- Clasificación de texto por similitud con prototipos o etiquetas representadas como embeddings.
- Evaluación de similitud textual semántica (STS), incluida la variante graduada empleada en el entrenamiento (CoSENT).
- Extracción de características (`feature-extraction`) para uso como encoder en pipelines posteriores.
- No requiere prefijos ni instrucciones de tarea, lo que reduce la complejidad de integración.
- Capacidades multilingües: no documentadas; el modelo declara únicamente turco.
- Tool calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponibles; el modelo es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en productos turcos: indexar un catálogo o base documental en turco con los vectores de 768 dimensiones y recuperar por similitud coseno, aprovechando que el modelo no necesita instrucciones de tarea y puede desplegarse directamente con sentence-transformers o text-embeddings-inference.
- Motor de preguntas frecuentes y atención al cliente: comparar la consulta del usuario con una base de respuestas canónicas mediante similitud de embeddings, con contexto de hasta 2048 tokens por fragmento para cubrir respuestas extensas.
- Deduplicación y clustering de tickets de soporte: agrupar incidencias semánticamente equivalentes en turco para enrutarlas al equipo adecuado, usando los embeddings normalizados y un algoritmo de clustering sobre distancias coseno.
- Moderación y clasificación de contenido: representar textos y compararlos contra prototipos de categorías, aprovechando las señales de clasificación incorporadas en la fase 2 del entrenamiento.
- Filtrado y reordenación en pipelines de RAG: usar el modelo como recuperador denso de primera etapa o como reranker ligero en un sistema de generación aumentada, con la advertencia de que el propio autor señala el retrieval como punto débil relativo y recomienda Mogan-ColBERT-TR para cargas centradas en recuperación.
- Análisis de similitud en investigación lingüística: medir proximidad semántica entre pares de frases turcas para estudios de paráfrasis o evaluación de traducciones, dado el entrenamiento explícito con señales de STS graduado y textos paralelos.
- Enriquecimiento de datasets: generar representaciones vectoriales de corpus turcos para entrenar clasificadores ligeros o sistemas de recomendación basados en contenido.

## Benchmarks y rendimiento

La model card indica que el modelo se evaluó en MTEB(Turkish) sobre 26 tareas, en fp16, con similitud coseno y un máximo de 2048 tokens, y remite a una imagen y al artículo para las cifras por tarea. En la información proporcionada no se incluyen los valores numéricos de MMLU, HumanEval, GSM8K ni de las tareas individuales de MTEB, por lo que no se presentan en tabla.

Datos de rendimiento sí disponibles en la información:

| Métrica | Antes del entrenamiento | Tras fase 1 (destilación) |
|---|---|---|
| `cos_raw` (anisotropía) | 0.9841 | 0.0851 |
| Retrieval IR zero-shot | 0.2361 | 0.5927 |

No se han publicado en la información disponible resultados numéricos desglosados de MTEB(Turkish) ni comparaciones cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149M parámetros, en fp16 el modelo ocupa aproximadamente 0.3 GB de pesos; en fp32, alrededor de 0.6 GB. A ello hay que sumar memoria para activaciones y lote, típicamente menos de 1-2 GB en total para lotes moderados.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, así como en GPUs de portátil con 6 GB o más.
- GPU recomendadas para producción de alto throughput: A100, H100, L40S o T4 para despliegues de menor volumen.
- Es viable la inferencia en CPU para cargas moderadas, dado el reducido tamaño del modelo.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (soportado según los tags del repositorio), y cualquier framework compatible con safetensors y arquitectura ModernBERT. No se documentan variantes GGUF ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoganBERT-Embed | 149M | 2048 tokens (evaluación) | Embedding single-vector | Apache 2.0 | Hugging Face |
| MoganBERT-TR | 149.4M | No disponible | Encoder base (sin cabeza de embedding) | No disponible en la información | Hugging Face |
| Mogan-ColBERT-TR | 148.9M | No disponible | Retrieval multi-vector | No disponible en la información | Hugging Face |
| Qwen3-Embedding-8B | No disponible en la información | No disponible | Embedding (profesor de destilación) | No disponible en la información | Usado como profesor, no como alternativa equivalente en tamaño |

No se dispone en la información proporcionada de datos de rendimiento de estos modelos comparables ni de otras alternativas de embeddings en turco, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en turco; no se documenta soporte multilingüe y su uso con otros idiomas no está validado.
- El propio autor señala el retrieval como el punto débil relativo del modelo y recomienda Mogan-ColBERT-TR para cargas centradas en recuperación, lo que desaconseja su uso como recuperador principal en sistemas RAG exigentes.
- Al ser un modelo de embeddings y no generativo, no puede producir texto, razonar de forma multi-paso ni invocar herramientas; cualquier expectativa en ese sentido es incorrecta.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de similitudes espurias cuando los textos son cortos, ambiguos o fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre corpus en turco, puede heredar sesgos presentes en esos datos.
- Límite de contexto: la evaluación se realizó con un máximo de 2048 tokens; fragmentos más largos requieren truncado o división, con posible pérdida de información.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento y del modelo profesor (Qwen3-Embedding-8B) si se redistribuye o se usa en productos regulados.
- El checkpoint publicado es una media ponderada de varios entrenamientos, lo que puede dificultar la reproducibilidad exacta de los resultados reportados.
- No se documentan cuantizaciones oficiales ni variantes GGUF, lo que limita el despliegue en entornos sin soporte de safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moganai/MoganBERT-Embed
- Modelo base MoganBERT-TR: https://huggingface.co/moganai/MoganBERT-TR
- Modelo multi-vector Mogan-ColBERT-TR: https://huggingface.co/moganai/Mogan-ColBERT-TR
- Colección MoganBERT: https://huggingface.co/collections/moganai/moganbert
- Artículo (arXiv:2608.25768): https://huggingface.co/papers/2608.25768
- Blog de MoganAI: https://moganai.github.io/
- Apoyo al proyecto: https://buymeacoffee.com/moganai
