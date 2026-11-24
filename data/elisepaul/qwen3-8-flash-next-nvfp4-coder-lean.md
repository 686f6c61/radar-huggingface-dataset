# elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean

## Resumen

Qwen3.8-Flash-Next-NVFP4-Coder-Lean es una derivación del checkpoint `nvidia/Qwen3.8-Flash-Next-NVFP4`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 131.744 millones de parámetros totales, adaptado por el usuario elisepaul para ejecución en un único nodo NVIDIA DGX Spark (GB10, 128 GiB de memoria unificada LPDDR5x). El modelo original es multimodal y de propósito general; esta variante elimina las proyecciones de visión y el shard auxiliar de embeddings N-gram (PLE) para quedarse en un alcance estrictamente texto y código, reduciendo el peso cargado en memoria de 123,5 GiB a 74,91 GiB.

La motivación es puramente de ingeniería de despliegue: el checkpoint completo no cabe en la memoria unificada de un DGX Spark sin provocar paginación del sistema operativo y degradar la generación. Coder-Lean conserva el enrutamiento MoE completo (10 expertos enrutados más 1 compartido por token), restaura las capas densas en MXFP8 nativo e incorpora un proponente MTP (Multi-Token Prediction) residente en memoria para decodificación especulativa, con velocidades medidas de 50,8 a 66,9 tok/s en un solo stream.

El resultado es una receta de serving para vLLM sobre Blackwell (sm_121), orientada a generación de código y flujos de agentes de desarrollo, con licencia NVIDIA Open Model License y soporte de inglés, chino y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (512 micro-expertos enrutados + 1 compartido, 10 enrutados por token) con atención lineal híbrida GDN y capas densas en MXFP8 |
| Parametros totales | 131.744.657.299 (131,7B) |
| Parametros activos | 10 expertos enrutados + 1 compartido por token (el número exacto de parámetros activos no está disponible) |
| Longitud de contexto | Hasta 262k–1M tokens según KV cache disponible (híbrido GDN); valor nominal no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16_NVFP4) en capas MoE; MXFP8 (`float8_e4m3fn`) en capas densas; MTP en NVFP4 |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (11 shards, 74,91 GiB), biblioteca vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 512 micro-expertos enrutados y 1 experto compartido, activando 10 expertos enrutados por token. Incorpora atención lineal híbrida GDN (Gated Delta Net) que permite ventanas de contexto muy largas con estado recurrente, y un proponente MTP (Multi-Token Prediction) de 4.637 tensores (1,60 GB en NVFP4) que actúa como cabezal de decodificación especulativa. Las 744 capas lineales densas (`linear_attn`, `self_attn`, `shared_expert`) se restauran en MXFP8 nativo, lo que reduce las lecturas del bus de memoria de 7,5 GB/token a aproximadamente 2,6 GB/token.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. El checkpoint base es `nvidia/Qwen3.8-Flash-Next-NVFP4`, y esta variante no reentrena pesos: poda capas multimodales y el shard PLE, y recuantiza capas densas. El dataset asociado en la model card es `princeton-nlp/SWE-bench_Lite`, lo que sugiere evaluación orientada a tareas de ingeniería de software.

## Capacidades

- Generación de texto y código en inglés, chino y lenguajes de programación.
- Razonamiento multi-paso y flujos de agente para desarrollo de software.
- Decodificación especulativa mediante MTP con aceleración de 2,6× a 3,9× frente a decodificación autorregresiva.
- Soporte de contexto largo (hasta 262k–1M tokens según KV cache) gracias a atención lineal híbrida GDN.
- Serving concurrente multi-stream (hasta 8 streams con `max-num-seqs: 8`).
- Capacidades multimodales (visión) eliminadas deliberadamente en esta variante.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Generación de código en producción: el modelo conserva el enrutamiento MoE completo y puede integrarse en pipelines de CI/CD para autocompletado, revisión y generación de parches, con 50,8–66,9 tok/s en un solo stream sobre DGX Spark.
- Agentes de ingeniería de software: el dataset SWE-bench_Lite asociado y el contexto largo permiten resolver issues multi-archivo con razonamiento multi-paso.
- Asistente de desarrollo en estación de trabajo local: cabe en 74,91 GiB de memoria unificada de un único DGX Spark, dejando 22–32 GiB para KV cache, lo que permite desplegarlo en hardware de sobremesa Blackwell.
- Serving multi-usuario en un solo nodo: con 8 streams concurrentes alcanza 165,47 tok/s agregados (20,68 tok/s por stream), adecuado para equipos pequeños.
- Procesamiento de repositorios completos: la ventana de hasta 262k–1M tokens permite analizar bases de código extensas en una sola pasada.
- RAG sobre documentación técnica: la caché de prefijo con 92,5% de hit rate en appends reduce la latencia en consultas repetidas sobre el mismo contexto.
- Generación bilingüe (inglés/chino) de documentación técnica y código comentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento publicados son de sistema, medidos en DGX Spark (GB10):

| Metrica | Valor |
|---|---|
| Decodificación single-stream (120 tokens) | 66,90 tok/s (TTFT 0,175 s, decodificación 1,79 s) |
| Decodificación single-stream (600 tokens) | 60,47 tok/s (TTFT 0,171 s, decodificación 9,92 s) |
| Rango single-stream | 50,80–66,90 tok/s (2,55–2,75× vs autorregresivo) |
| 2 streams agregados | 80,33 tok/s (40,17 tok/s/stream) |
| 4 streams agregados | 118,30 tok/s (29,58 tok/s/stream) |
| 8 streams agregados | 165,47 tok/s (20,68 tok/s/stream) |
| Hit rate de prefix cache | 92,5% (`--max-num-batched-tokens 1024`) |

## Requisitos de hardware

- Memoria: 74,91 GiB residentes para los pesos; se recomiendan al menos 96–128 GiB de memoria unificada para dejar 22–32 GiB a KV cache.
- GPU objetivo: NVIDIA DGX Spark (GB10, sm_121, 128 GiB LPDDR5x unificada). Requiere arquitectura Blackwell para las instrucciones NVFP4 y MXFP8.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamaño del checkpoint.
- Despliegue: vLLM con kernels FlashInfer CUTLASS para NVFP4; el modelo está empaquetado como receta de serving para un solo nodo.
- Latencia: TTFT de ~0,17 s; decodificación de 1,79 s para 120 tokens y 9,92 s para 600 tokens en single-stream.
- Throughput: hasta 165,47 tok/s agregados con 8 streams concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-Coder-Lean | 131,7B (MoE, 10+1 activos) | hasta 262k–1M (según KV) | nvidia-open-model-license | Hugging Face, vLLM |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (base) | 119,6B MoE | no disponible | nvidia-open-model-license | Hugging Face |
| Alternativas de código abierto de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo podado: no soporta visión ni el shard PLE original; no debe usarse para tareas multimodales.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Idiomas limitados a inglés, chino y código; el rendimiento en castellano no está documentado.
- Licencia NVIDIA Open Model License: revisar condiciones para uso comercial y redistribución antes de producción.
- Requiere hardware Blackwell (sm_121); no es desplegable en GPUs Ampere, Ada o anteriores sin recuantización adicional.
- Dependencia de vLLM y kernels FlashInfer CUTLASS específicos; la portabilidad a otros runtimes (llama.cpp, Ollama, TGI) no está documentada.
- El modelo es una derivación de terceros (elisepaul), no una release oficial de NVIDIA ni de Qwen; la validación de calidad recae en el usuario.
- El contexto máximo efectivo depende de la KV cache disponible tras cargar los 74,91 GiB de pesos.

## Enlaces

- Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Dataset de evaluación: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Paper de referencia (arXiv): https://arxiv.org/abs/2501.12948
- Perfil del colaborador: https://huggingface.co/hfsameh
- vLLM: https://github.com/vllm-project/vllm
- FlashInfer: https://github.com/flashinfer-ai/flashinfer
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
