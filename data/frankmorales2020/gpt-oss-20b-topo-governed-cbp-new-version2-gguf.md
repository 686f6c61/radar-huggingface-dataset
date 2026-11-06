# frankmorales2020/gpt-oss-20b-topo-governed-cbp-new-version2-gguf

## Resumen

`gpt-oss-20b-topo-governed-cbp-new-version2-gguf` es una cuantización GGUF (Q4_K_M) publicada por el usuario frankmorales2020 sobre el modelo base `openai/gpt-oss-20b`, un transformer de mezcla de expertos (MoE) de OpenAI con 20.914.757.184 parámetros totales. El autor declara haber aplicado una técnica propia denominada Topological Continual Backpropagation (Topo-CBP) para adaptación continua sin olvido catastrófico, y distribuye el resultado como binario autónomo para `llama.cpp`.

El interés práctico del artefacto es acotado: se trata de una conversión a GGUF de un modelo de 20,9 mil millones de parámetros con aproximadamente 2,4 mil millones activos por token (4 de 32 expertos), ventana de contexto nominal de 131.072 tokens y tokenizador GPT-4o BPE (`o200k_harmony`, 201.088 tokens). El repositorio ocupa 15,8 GB y el contenedor Q4_K_M pesa 14,71 GiB.

La relevancia es limitada y debe enmarcarse con cautela: el repositorio acumula 20 descargas y 0 likes, la model card mezcla afirmaciones verificables (arquitectura del base, formato de cuantización) con otras no contrastables (invariantes topológicos, "zero catastrophic forgetting"), y no se aportan resultados de benchmarks estándar. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base `openai/gpt-oss-20b`); 24 capas, dimensión de embedding 2.880, 64 cabezas de atención (8 KV heads, GQA), sliding window attention de 128 |
| Parametros totales | 20.914.757.184 (20,91 B) |
| Parametros activos | ~2,4 B por token (4 de 32 expertos) |
| Longitud de contexto | 131.072 tokens nominales (entrenado); en los ejemplos de la model card se usa `n_ctx=1024` |
| Tipos de cuantizacion | GGUF Q4_K_M (6,04 BPW); requantizado desde mxfp4 del base pasando por tensores intermedios sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF V3 (`gpt-oss-20b-topo-governed-Q4_K_M.gguf`), 14,71 GiB en disco |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `openai/gpt-oss-20b`: un transformer con mezcla de expertos, 24 capas, dimensión de embedding de 2.880, 64 cabezas de atención con 8 cabezas KV bajo grouped-query attention y sliding window attention de 128 tokens. El tokenizador es el BPE de GPT-4o (`o200k_harmony`, 201.088 tokens). El modelo activa 4 de 32 expertos por token, lo que resulta en ~2,4 B parámetros activos sobre 20,91 B totales.

Sobre el entrenamiento del modelo base no se aporta información en el repositorio (número de tokens, composición del dataset, fases de RLHF/DPO: no disponible). El autor describe una capa de post-procesado propia, Topo-CBP, que afirma anclar "primitivas lingüísticas y estructurales" en coordenadas primas y reasignar capacidad de forma dinámica en las compuertas de routing del MoE, sin buffers de replay. Estas afirmaciones no vienen acompañadas de métricas reproducibles, código de entrenamiento verificable ni comparaciones controladas contra el base sin modificar. La conversión a GGUF se realizó requantizando desde mxfp4 a tensores intermedios sin cuantizar y empaquetando después en Q4_K_M.

## Capacidades

- Generación de texto conversacional y continuaciones de prompt, según el pipeline declarado (`text-generation`, tag `conversational`).
- Razonamiento y conocimiento general heredados del modelo base `openai/gpt-oss-20b`; el repositorio no documenta evaluaciones propias.
- Ejecución en CPU pura mediante `llama.cpp` y `llama-cpp-python`, con offload opcional a CUDA/Metal vía `n_gpu_layers`.
- Contexto largo nominal de 131.072 tokens en el base; en la práctica la model card solo demuestra ejecuciones con `n_ctx=1024`.
- Soporte de tool calling, function calling, modo thinking, visión o audio: no disponible en la información del repositorio (no se documenta ni se descarta).
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Inferencia local en CPU sin GPU: el binario Q4_K_M de 14,71 GiB se ejecuta con `llama.cpp` en un host estándar, con un working set medido de ~14,9 GiB para el buffer de modelo y ~432 MiB de buffer de cómputo. Adecuado para entornos sin acelerador dedicado.
- Despliegue en contenedores con memoria virtual restringida: la model card recomienda `use_mmap=False` para evitar picos de memoria virtual en contenedores virtualizados, lo que encaja en pipelines de CI o entornos efímeros.
- Pruebas de concepto de adaptación continua: útil para quien quiera inspeccionar el efecto declarado de Topo-CBP sobre las compuertas de routing del MoE, siempre con validación independiente.
- Generación de texto de baja concurrencia: con 6,71 tok/s de generación en CPU, encaja en tareas por lotes o asíncronas (resúmenes, clasificación con plantilla, borradores) donde la latencia no es crítica.
- Experimentación educativa sobre cuantización GGUF: sirve como ejemplo de conversión de un MoE de 20,9 B a Q4_K_M con 6,04 BPW y de ejecución con `llama-cpp-python`.
- Evaluación comparativa de calidad tras cuantización: permite contrastar salidas del binario frente al base `openai/gpt-oss-20b` en tareas concretas del propio dominio, midiendo degradación real.

## Benchmarks y rendimiento

La model card solo publica métricas de rendimiento de inferencia en CPU, no benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor declarado |
|---|---|
| Prompt processing (CPU) | 8,76 tok/s (114,12 ms/token) |
| Generación autoregresiva (CPU) | 6,71 tok/s (149,02 ms/token) |
| Buffer de modelo | 14.908,67 MiB |
| Buffer de cómputo | 432,51 MiB |
| KV cache (SWA + no SWA) | 24,00 MiB con contexto de 512 |
| Reutilización de subgrafos | 62 de 63 sin recompilación |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: ~14,9 GiB de buffer de modelo más ~0,43 GiB de cómputo y KV cache reducida (24 MiB a contexto 512). Presupuesto realista: 16 GB de memoria disponible como mínimo.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría en A100 40/80 GB, H100, L40S y RTX 4090 (24 GB) con offload parcial o total de capas.
- Consumer GPU: sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) con `n_gpu_layers` ajustado; en GPUs de 16 GB requeriría offload parcial y contexto corto.
- Despliegue: `llama.cpp` (CLI y `llama-cpp-python`) es el runtime documentado. vLLM, TGI u Ollama no se mencionan; Ollama podría importar el GGUF, pero no está verificado en el repositorio.
- Latencia y throughput: 6,71 tok/s de generación y 8,76 tok/s de prompt processing en CPU pura, medidos por el autor. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este repositorio (Q4_K_M) | 20,91 B | ~2,4 B | 131.072 (nominal) | Apache 2.0 | GGUF |
| `openai/gpt-oss-20b` (base) | 20,91 B | ~2,4 B | 131.072 | Apache 2.0 | safetensors / mxfp4 |
| `openai/gpt-oss-120b` | 120 B (aprox.) | no disponible | no disponible | Apache 2.0 | safetensors |
| Mistral Small 3 (24B) | 24 B | denso | 32.768 | Apache 2.0 | safetensors / GGUF |

La comparación de rendimiento frente a alternativas no está disponible: el autor no publica evaluaciones de calidad y no hay datos que permitan situar este binario frente al base sin modificar ni frente a otros modelos de su categoría.

## Limitaciones y advertencias

- Las afirmaciones sobre Topo-CBP ("zero catastrophic forgetting", "bitwise stability", "invariantes en coordenadas primas") no están respaldadas por benchmarks ni por una evaluación independiente en el repositorio.
- No se documenta el proceso de adaptación con suficiente detalle reproducible: no hay dataset, hiperparámetros ni comparación controlada contra el base.
- El contexto demostrado en los ejemplos es de 1.024 tokens, muy por debajo de los 131.072 nominales; el comportamiento en contextos largos tras la cuantización no está verificado.
- La cuantización Q4_K_M introduce degradación respecto a los pesos originales; no se aportan métricas de esa pérdida.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en este artefacto.
- Sesgos: no documentados; se heredan los del base `openai/gpt-oss-20b` sin análisis adicional.
- Idiomas soportados: no declarados; no se garantiza cobertura multilingüe más allá de la del base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI y de cualquier componente derivado.
- Repositorio con 20 descargas y 0 likes: sin validación comunitaria; tratar como artefacto experimental, no como binario listo para producción.
- El campo `inference: false` en la model card indica que no se sirve mediante la Inference API de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/gpt-oss-20b-topo-governed-cbp-new-version2-gguf
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Código de conversión (GPT_TO_GGUF): https://github.com/frank-morales2020/AST/blob/main/GPT_TO_GGUF.ipynb
- Código de benchmark (BENCH_GPT_TO_GGUF): https://github.com/frank-morales2020/AST/blob/main/BENCH_GPT_TO_GGUF.ipynb
- Artículo del autor en Medium: https://medium.com/ai-simplified-in-plain-english/breaking-the-cloud-tollbooth-orchestrating-meta-nvidia-openai-and-qwen-on-edge-silicon-with-38411c5a007c
- llama.cpp: https://github.com/ggerganov/llama.cpp
