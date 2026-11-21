# finvector/qwen_qlora_finmodern_tri_merged

## Resumen

`finvector/qwen_qlora_finmodern_tri_merged` es un modelo de embedding de texto derivado de Qwen3-Embedding-0.6B, a su vez construido sobre la base densa Qwen/Qwen3-0.6B-Base. Lo publica el usuario finvector y esta etiquetado como modelo de sentence-transformers para tareas de feature-extraction y sentence-similarity. El nombre sugiere un ajuste fino con QLoRA sobre un corpus financiero ("finmodern") y una posterior fusion de pesos ("tri_merged"), aunque la model card no documenta ni el proceso de entrenamiento ni los datos empleados.

El modelo resuelve el problema de generar representaciones vectoriales densas de texto para busqueda semantica, recuperacion, clasificacion y clustering. Su interes practico esta en el tamano: 595,7 millones de parametros en safetensors (0,6B nominales), lo que permite desplegarlo en GPU de consumo y en CPUs razonablemente potentes, con una ventana de contexto de 32.000 tokens heredada de la familia Qwen3 y soporte declarado de mas de 100 idiomas.

La relevancia actual viene de que la familia Qwen3-Embedding se posiciono como referencia en el leaderboard MTEB multilingue (la variante de 8B alcanzo 70,58 puntos a junio de 2025), y este checkpoint concreto anade un ajuste especifico de dominio que puede mejorar el rendimiento en vocabulario financiero, a costa de perder generalidad si el ajuste fue agresivo. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only de Qwen3 adaptado a embedding) |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | no disponible (no se documentan en la model card; el repo solo contiene safetensors) |
| Idiomas soportados | mas de 100 idiomas, incluidos lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | hasta 1024, configurable entre 32 y 1024 (MRL) |
| Capas | 28 |
| Libreria | sentence-transformers (requiere transformers >= 4.51.0) |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso decoder-only de Qwen3 con 28 capas, adaptado a la extraccion de embeddings mediante pooling sobre las representaciones ocultas. Incorpora Matryoshka Representation Learning (MRL), lo que permite truncar el vector de salida a dimensiones intermedias entre 32 y 1024 sin reentrenar, y es "instruction aware": acepta una instruccion de tarea en el prompt de entrada que, segun la documentacion de Qwen, aporta tipicamente entre un 1 % y un 5 % de mejora frente a no usarla. La atencion soporta FlashAttention 2 y se recomienda padding por la izquierda.

El proceso de entrenamiento especifico de este checkpoint no esta documentado en la model card. El nombre del repositorio indica un ajuste con QLoRA sobre datos financieros y una fusion posterior de tres variantes de pesos, pero no se publican ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de preferencia (RLHF/DPO). Tampoco se detalla la receta de fusion (por ejemplo, si fue SLERP, TIES o linear). Todo lo relativo a datos y metodo debe considerarse no disponible.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion (retrieval denso).
- Recuperacion de codigo: la familia Qwen3-Embedding declara capacidades de code retrieval.
- Clasificacion de texto y clustering semantico sobre representaciones densas.
- Bitext mining y alineacion entre idiomas.
- Soporte multilingue y cross-lingual en mas de 100 idiomas.
- Comprension de textos largos: ventana de 32.000 tokens, adecuada para documentos completos o conversaciones extensas.
- Dimension de salida configurable (MRL) para equilibrar coste de almacenamiento y calidad.
- Instruction aware: acepta instrucciones de tarea para especializar el embedding.
- No es un modelo generativo: no soporta tool calling, function calling ni razonamiento multi-paso por si mismo; su salida son vectores.
- Capacidad de dominio financiero potencialmente mejorada por el ajuste QLoRA, aunque no cuantificada.

## Casos de uso

- Busqueda semantica en documentacion financiera: indexar informes anuales, notas de prensa y filings con embeddings de 1024 dimensiones y consultar por lenguaje natural; la ventana de 32k permite embeber secciones completas sin trocear en exceso.
- Motor de RAG para asistentes de analisis bursatil: usar el modelo como retriever en un pipeline que recupere fragmentos relevantes antes de pasarlos a un LLM generativo, aprovechando el ajuste de dominio en vocabulario contable y regulatorio.
- Deduplicacion y clustering de noticias economicas: agrupar articulos por similitud coseno para detectar eventos repetidos o construir topicos, con la ventaja de que el modelo cabe en una sola GPU de consumo.
- Clasificacion de tickets o consultas de clientes en banca: entrenar un clasificador ligero sobre los embeddings congelados para enrutar consultas a departamentos, con coste de inferencia bajo.
- Busqueda cross-lingual en entornos corporativos: consultar en castellano sobre documentos en ingles o aleman gracias al soporte de mas de 100 idiomas.
- Recuperacion de codigo en repositorios internos: indexar fragmentos de codigo y docstrings para un buscador de snippets orientado a desarrolladores.
- Filtrado y ranking previo en pipelines de compliance: reducir candidatos con similitud vectorial antes de aplicar un reranker mas costoso, usando la dimension truncada a 256 o 512 para acelerar la primera fase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card heredada de Qwen3-Embedding menciona que la variante de 8B alcanzo la posicion 1 en el leaderboard MTEB multilingue con 70,58 puntos a fecha de 5 de junio de 2025, pero no se aportan cifras especificas para la variante de 0,6B ni para este ajuste financiero.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1,2 GB para los pesos, mas overhead de activaciones; con contexto de 32k y batch pequeno, el consumo realista se situa entre 2 y 4 GB.
- En cuantizacion de 8 bits o 4 bits (si se generan pesos GGUF o se usa bitsandbytes), el modelo puede ocupar por debajo de 1 GB, aunque no se distribuyen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con batches moderados (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para alto throughput, A100 o H100 permiten batches grandes y FlashAttention 2.
- Cabe holgadamente en GPU de consumo; tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: sentence-transformers, Hugging Face Text Embeddings Inference (TEI), vLLM con soporte de embedding, y conversion a GGUF para llama.cpp si se generan los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del hardware, la longitud de secuencia y el tamano de batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| finvector/qwen_qlora_finmodern_tri_merged | 0,6B | 32k | hasta 1024 (MRL) | Apache 2.0 | Ajuste financiero no documentado |
| Qwen/Qwen3-Embedding-0.6B | 0,6B | 32k | hasta 1024 (MRL) | Apache 2.0 | Modelo original de referencia, multilingue, instruction aware |
| Qwen/Qwen3-Embedding-4B | 4B | 32k | hasta 2560 (MRL) | Apache 2.0 | Mayor calidad a costa de mas VRAM |
| Qwen/Qwen3-Embedding-8B | 8B | 32k | hasta 4096 (MRL) | Apache 2.0 | Top del leaderboard MTEB multilingue (70,58) a junio de 2025 |

La comparacion con alternativas de otros fabricantes (E5, BGE, GTE, EmbeddingGemma) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de entrenamiento y los datos del ajuste QLoRA no estan documentados; no es posible evaluar el riesgo de sobreajuste al dominio financiero ni la degradacion en tareas generales.
- Al ser un ajuste de dominio, puede rendir peor que el modelo base en textos no financieros; conviene validar con un conjunto de evaluacion propio antes de sustituir el original.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos en recuperacion: embeddings de dominio pueden producir similitudes altas entre terminos superficialmente parecidos.
- No se dispone de resultados de benchmarks para este checkpoint; las cifras de la familia no son extrapolables directamente.
- La cobertura de idiomas se hereda de Qwen3, pero la calidad del ajuste financiero en idiomas distintos del usado en el corpus de entrenamiento es desconocida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- No se distribuyen cuantizaciones oficiales; cualquier GGUF o cuantizacion debera generarse y validarse por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/qwen_qlora_finmodern_tri_merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Qwen3-Reranker-0.6B: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Blog de Qwen3-Embedding: https://qwenlm.github.io/blog/qwen3-embedding/
- Repositorio GitHub de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Paper referenciado en los tags (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
