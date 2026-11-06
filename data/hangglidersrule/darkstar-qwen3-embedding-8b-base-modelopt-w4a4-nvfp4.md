# HangGlidersRule/Darkstar-Qwen3-Embedding-8B-Base-ModelOpt-W4A4-NVFP4

## Resumen

Darkstar-Qwen3-Embedding-8B-Base-ModelOpt-W4A4-NVFP4 es una cuantizacion NVFP4 del modelo de embeddings Qwen/Qwen3-Embedding-8B, publicada por el usuario HangGlidersRule dentro del proyecto Darkstar. El modelo base lo desarrolla el equipo Qwen de Alibaba, y esta version aplica cuantizacion de pesos y activaciones a 4 bits (W4A4) mediante NVIDIA ModelOpt 0.48.0rc1, sin ninguna modificacion de comportamiento respecto al checkpoint original. El resultado es un modelo de extraccion de caracteristicas (feature-extraction) que genera embeddings de 4096 dimensiones a partir del estado oculto del ultimo token, normalizado en L2.

La relevancia de esta ficha esta en el ahorro de memoria y el aumento de throughput: los pesos se cargan en vLLM ocupando 4,81 GiB frente a los 14,11 GiB del BF16, y el rendimiento en entradas largas (~3,7k tokens) alcanza 44.856 tok/s a concurrencia 1, entre 2,45 y 2,69 veces el BF16. La calidad de recuperacion se mantiene en el 98,81% del nDCG@10 del BF16 en los seis conjuntos de retrieval de MTEB Nano evaluados.

El checkpoint cuenta con 4.094.411.776 parametros en safetensors, un repositorio de 5,2 GB y licencia Apache 2.0. Esta pensado para despliegues de recuperacion semantica y RAG en GPU Blackwell con soporte de FP4, donde la reduccion de VRAM permite servir el modelo en hardware mas modesto o con mayor paralelismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Qwen3 (36 capas), cuantizado W4A4 NVFP4 en todas las lineales del decoder |
| Parametros totales | 4.094.411.776 (4,09B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 en pesos y activaciones, grupo 16, escalas de bloque FP8 E4M3); embed_tokens, normas y KV cache en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato ModelOpt para vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Embedding-8B es un transformer decoder de 36 capas orientado a generacion de embeddings. Esta version cuantiza las 252 lineales del decoder: las proyecciones MLP `gate_proj`, `up_proj` y `down_proj`, y las de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`, en las 36 capas. Esto cubre el 100% de los parametros lineales del decoder (6,95B segun la model card). Los embeddings de tokens (`embed_tokens`), todas las normas y la KV cache permanecen en BF16. El checkpoint no incluye `lm_head`, igual que el original.

La cuantizacion se realizo con ModelOpt 0.48.0rc1 y la receta de operadores `nvfp4_attn_mlp_act_headroom-kv_bf16`. Las escalas de pesos se obtuvieron con un barrido MSE de escalas FP8, y las de activacion con calibracion `nvfp4_act_headroom` (percentil ancla 1, percentil superior 99,99, rho 16384). El conjunto de calibracion fueron 512 textos de `microsoft/ms_marco` v1.1 (256 consultas con la instruccion de query del modelo y 256 pasajes en texto plano, semilla 1234). El tokenizer, los ficheros de pooling y prompts de sentence-transformers y la licencia son identicos byte a byte a los del modelo original. No se aplico ninguna edicion de comportamiento ni RLHF adicional sobre esta version.

## Capacidades

- Generacion de embeddings de texto de 4096 dimensiones, con truncamiento Matryoshka (evaluado a 768 dimensiones).
- Recuperacion semantica densa (dense retrieval) con busqueda por similitud coseno exacta.
- Soporte de instrucciones de query: las consultas pueden llevar la instruccion de busqueda web por defecto del modelo, mientras que los documentos no la llevan.
- Embeddings normalizados en L2 a partir del estado oculto del ultimo token.
- Compatible con sentence-transformers para pooling y prompts.
- Despliegue en vLLM con soporte de FP4 (verificado con vLLM v0.32.0 en GPU Blackwell SM120).
- No genera texto: es un modelo de extraccion de caracteristicas, sin `lm_head`.
- No dispone de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo generativo.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo indexa corpus documentales y genera vectores de consulta para recuperar pasajes relevantes. Su calidad de retrieval en MTEB Nano (nDCG@10 medio de 0,6487) y su bajo consumo de VRAM (4,81 GiB) lo hacen adecuado para pipelines RAG en produccion.
- Busqueda semantica a gran escala: con 44.856 tok/s en entradas largas a concurrencia 1 y 47.828 tok/s a concurrencia 32, permite indexar corpus de millones de documentos en menos tiempo que la version BF16.
- Servicio de embeddings de baja latencia: con p50 de 12,3 ms en entradas cortas y 82,5 ms en entradas largas a concurrencia 1, es apto para APIs de embeddings con requisitos de latencia estrictos.
- Deduplicacion y clustering de documentos: los embeddings normalizados permiten agrupar documentos similares por similitud coseno; el truncamiento Matryoshka a 768 dimensiones reduce el coste de almacenamiento y de busqueda.
- Filtrado y moderacion de contenido por similitud: comparar embeddings de textos contra vectores de referencia para detectar contenido proximo a categorias definidas.
- Despliegue en GPU de consumo con FP4: al reducir los pesos a 4,81 GiB, permite servir el modelo en GPUs con soporte nativo de FP4 y menor VRAM que la requerida por el BF16 (14,11 GiB), liberando memoria para el motor de generacion en el mismo nodo.
- Evaluacion de calidad de retrieval en dominios cientificos y de soporte: los resultados por conjunto (SciFact 0,8094, Touche2020 0,6517, FiQA2018 0,6940) indican un comportamiento solido en recuperacion de evidencia cientifica y financiera.

## Benchmarks y rendimiento

Evaluacion realizada en una RTX PRO 6000 Blackwell (SM120) con vLLM v0.32.0, frente al checkpoint BF16 servido de la misma forma. Retrieval sobre seis conjuntos MTEB Nano (NFCorpus, FiQA2018, Touche2020, ArguAna, SciFact, MSMARCO): 299 consultas sobre 24.893 documentos, busqueda coseno exacta, intervalos de confianza del 95% por bootstrap pareado con 10.000 remuestreos.

| Metrica | NVFP4 | BF16 | Ratio |
|---|---|---|---|
| nDCG@10 medio, todo NVFP4 (4096 dims) | 0,6487 | 0,6565 | 98,81% |
| nDCG@10 medio, corpus BF16 x queries NVFP4 | 0,6551 | — | 99,79% (delta -0,0014; IC 95% -0,0102 a +0,0077) |
| nDCG@10 medio a 768 dims (Matryoshka) | — | — | 99,04% (todo NVFP4) / 100,57% (corpus BF16 x queries NVFP4) |
| Coseno de vectores de documento vs BF16 | media 0,9688; p1 0,9497; p5 0,9582 | 0,99993 (replica BF16) | — |
| Throughput entradas largas (~3,7k tokens) | 44.856 tok/s (c=1); 47.828 tok/s (c=32) | 18.322 / 17.831 tok/s | 2,45-2,69x |
| Throughput entradas cortas (~100 tokens) | 5.456 tok/s (c=1); 37.108 tok/s (c=64) | 5.014 / 19.691 tok/s | 1,09-1,88x |
| Latencia p50, peticion unica | 12,3 ms corta; 82,5 ms larga | 18,0 / 201,7 ms | — |

nDCG@10 por conjunto (BF16 → NVFP4, todo NVFP4, 4096 dims): NFCorpus 0,3787 → 0,3788; FiQA2018 0,7074 → 0,6940; Touche2020 0,6487 → 0,6517; ArguAna 0,6841 → 0,6611; SciFact 0,8042 → 0,8094; MSMARCO 0,7158 → 0,6972.

Comparativa de las dos variantes construidas por el autor:

| Candidato | Cobertura | nDCG@10 publico vs BF16 (corpus BF16 x query NVFP4 / todo NVFP4) | tok/s entradas largas vs BF16 |
|---|---|---|---|
| A | solo MLP del decoder (78% del trabajo lineal) | 99,56% / 99,94% | 1,90-2,03x |
| B (este checkpoint) | todas las lineales del decoder | 99,79% / 98,81% | 2,45-2,69x |

GPQA Diamond no se midio por no ser aplicable a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,81 GiB de pesos en vLLM con NVFP4, frente a 14,11 GiB en BF16. Hay que sumar la memoria de la KV cache en BF16 y el overhead del motor.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120) es la plataforma verificada. Se requiere hardware con soporte nativo de FP4 (arquitectura Blackwell) para ejecutar la cuantizacion NVFP4.
- GPU de consumo: no hay datos que confirmen compatibilidad con GPUs consumer sin soporte FP4; en GPUs Ampere o Ada la cuantizacion NVFP4 no es ejecutable de forma nativa.
- Opciones de despliegue: vLLM v0.32.0 (verificado). No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: p50 de 12,3 ms en entradas cortas y 82,5 ms en largas a concurrencia 1; 44.856 tok/s en entradas largas a c=1 y 47.828 tok/s a c=32; 5.456 tok/s en cortas a c=1 y 37.108 tok/s a c=64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darkstar-Qwen3-Embedding-8B-Base-ModelOpt-W4A4-NVFP4 | 4,09B (safetensors) | no disponible | safetensors NVFP4 W4A4 | Apache 2.0 | Hugging Face, 28 descargas |
| Qwen/Qwen3-Embedding-8B (BF16) | 8B (nominal) | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face (modelo base) |
| Darkstar variante A (MLP only) | no disponible | no disponible | NVFP4 parcial (78% lineales) | Apache 2.0 | Referenciada en la model card, no publicada como checkpoint independiente en la informacion disponible |

No se dispone de datos de benchmarks de otros modelos de embeddings comparables en la informacion proporcionada, por lo que la comparativa de rendimiento se limita a las variantes del propio autor y al BF16 de referencia.

## Limitaciones y advertencias

- Los vectores no son identicos a los BF16: el coseno medio de los vectores de documento es 0,9688 (p1 0,9497, p5 0,9582). Mezclar queries de este checkpoint con un corpus BF16 existente mantiene la calidad publica dentro de tolerancia, pero no se garantiza equivalencia exacta.
- La cuantizacion NVFP4 requiere hardware con soporte FP4 (Blackwell); no es portable a GPUs Ampere o Ada sin conversion previa.
- El modelo no genera texto ni soporta tool calling, agentes ni razonamiento; su unico uso es la extraccion de caracteristicas.
- No se han medido sesgos ni riesgos de alucinacion especificos en la informacion disponible; al producir vectores y no texto, el riesgo de alucinacion textual no aplica, pero los sesgos del corpus de entrenamiento del modelo base pueden reflejarse en los embeddings.
- La calibracion se realizo solo con 512 textos de MS MARCO (consultas y pasajes en ingles); el comportamiento en otros dominios o idiomas no esta evaluado en la informacion disponible.
- El rendimiento medido se obtuvo con una GPU compartida con un motor co-residente sin peticiones en ejecucion; los numeros pueden variar en entornos con carga concurrente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base Qwen3-Embedding-8B y de los datos de calibracion de MS MARCO.
- El repositorio tiene solo 28 descargas y 0 likes, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3-Embedding-8B-Base-ModelOpt-W4A4-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3-embedding-8b/model-card/base-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3-embedding-8b/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/qwen3-embedding-8b/darkstar-qwen3-embedding-8b-base-modelopt-w4a4-nvfp4.yaml
- Gate results: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3-embedding-8b/results/embedding-gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/18
- Dataset de calibracion: https://huggingface.co/datasets/microsoft/ms_marco
