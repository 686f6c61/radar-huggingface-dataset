# Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 es un checkpoint cuantizado a 2,45 bits por peso del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Grawnch. Se trata de una compilación autocontenida orientada exclusivamente a GPUs NVIDIA Blackwell con arquitectura `sm_120`, que empaqueta el modelo base de 180.000 millones de parámetros junto con un runtime SASS precompilado (`qfn_sm120_unified` v22.4.0) y un drafter de decodificación especulativa DFlash2.

El modelo base es un transformer híbrido con 48 capas que combina 36 capas Gated DeltaNet (GDN) con 12 capas de Qwen Sparse Attention (QSA), estructura MoE con 512 expertos enrutados más 1 compartido y Hyper-Connections mHC de 4 flujos. La cuantización emplea una técnica denominada wave-quant que combina un indexer QSA disperso de 128K de contexto con una tabla de embeddings N-Gram por capa en Q4_0 almacenada en RAM del host.

Su relevancia es doble: por un lado demuestra que un MoE de 180B puede ejecutarse en una única GPU Blackwell de 96 GB con un consumo de VRAM residente de 54,43 GiB; por otro, el runtime incluido expone endpoints compatibles con OpenAI, Anthropic Messages y OpenAI Responses, lo que facilita su integración en herramientas agénticas como Claude Code o Codex CLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), Hyper-Connections mHC de 4 flujos |
| Parametros totales | 180 000 millones (modelo base) |
| Parametros activos | 512 expertos enrutados + 1 compartido (número de parámetros activos no disponible) |
| Longitud de contexto | 128K (indexer QSA disperso Top-2048) |
| Tipos de cuantizacion | 2,45 bpw (wave-quant); tabla PLE en Q4_0; indexer QSA a 128K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards `globals.safetensors`, `layers_00_03` a `layers_44_47`, `ple_q4_0.safetensors`, `qsa_indexer.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atención lineal y sparse attention en un esquema híbrido: 36 de las 48 capas usan Gated DeltaNet, un mecanismo de atención lineal con compuertas, mientras que las 12 restantes emplean Qwen Sparse Attention con un indexer que selecciona los Top-2048 tokens relevantes sobre una ventana de 128K. La capa MoE cuenta con 512 expertos enrutados y uno compartido, y las Hyper-Connections mHC de 4 flujos conectan las representaciones entre capas. El checkpoint incorpora además un drafter DFlash2 calibrado para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base. La model card del checkpoint cuantizado no documenta el proceso de calibración de la cuantización wave-quant más allá de indicar que el indexer QSA y la tabla PLE en Q4_0 están calibrados. La innovación técnica destacable es el empaquetado de un runtime SASS exclusivo para `sm_120` que evita la compilación JIT en GPUs Blackwell, junto con la decodificación especulativa DFlash2 integrada.

## Capacidades

- Generación de texto conversacional con streaming SSE y contenido de razonamiento separado (`reasoning_content`).
- Razonamiento matemático avanzado, evidenciado por un 80,0% de Pass@1 en AIME 2025.
- Generación de código con soporte de FIM (`<|fim_prefix|>`) y un 76,0% de Pass@1 en LiveCodeBench v6.
- Tool calling y function calling con streaming incremental de argumentos JSON token a token.
- Soporte de agentes multi-paso mediante endpoints compatibles con OpenAI Chat Completions, Anthropic Messages (Claude Code) y OpenAI Responses (Codex CLI).
- Modo thinking con presupuesto configurable por petición (`thinking_token_budget`, `thinking.budget_tokens`).
- Salidas estructuradas con `response_format` (`json_object` / `json_schema`) y FSM en GPU (100% de JSON válido observado).
- Decodificación especulativa con el drafter DFlash2 integrado.
- Caché de prefijo asíncrona anclada para compartir prefijos de sistema y esquemas de herramientas entre peticiones.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia de código en producción: el modelo puede integrarse en pipelines de CI/CD mediante el endpoint `/v1/completions` con FIM para autocompletado en editores, y su Pass@1 del 76,0% en LiveCodeBench v6 lo hace adecuado para revisión y generación de parches.
- Agentes autónomos de línea de comandos: los endpoints nativos de Anthropic Messages y OpenAI Responses permiten conectarlo directamente a Claude Code o Codex CLI sin adaptadores intermedios, con tool calling en streaming.
- Atención al cliente multi-turno: la ventana de 128K y la caché de prefijo anclada permiten mantener conversaciones largas reutilizando el prefijo de sistema entre peticiones, reduciendo el coste de prefill.
- Razonamiento matemático asistido: con un 80,0% de Pass@1 en AIME 2025, es viable para tutoría, verificación de demostraciones y generación de problemas con solución.
- Extracción de datos estructurados: el modo `json_schema` con FSM en GPU garantiza salidas JSON válidas, útil para pipelines de ETL y parsing de documentos.
- Servicio multi-tenant con aislamiento: el parámetro `cache_salt` permite aislar la caché de prefijo por inquilino, adecuado para despliegues SaaS sobre una única GPU RTX PRO 6000.
- Investigación sobre cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de 2,45 bpw en un MoE de 180B con atención híbrida.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado |
|---|---|
| AIME 2025 (`MathArena/aime_2025`, 30 problemas, Pass@1) | 24/30 (80,0%), 265,3 tok/s, `mean_tau` = 4,26 |
| LiveCodeBench v6 completo (175 problemas, presupuesto 96K, Pass@1) | 133/175 (76,0%), 386,6 tok/s |
| LiveCodeBench v6 Easy | 97,67% (42/43) |
| LiveCodeBench v6 Medium | 92,31% (48/52) |
| LiveCodeBench v6 Hard-Top30 | 70,0% (21/30) |
| Perplejidad 8K QSA (`All_8192`) | 3,1068 |
| Perplejidad 8K QSA (`Mid_2048_4096`) | 2,7302 |
| Perplejidad 8K QSA (`Late_4096_8192`) | 3,2251 |
| Throughput especulativo B=1 | 183,70 tok/s (`mean_tau` = 3,491) |
| Throughput especulativo B=2 (16K Sparse-QSA) | 306,00 tok/s (`mean_tau` = 4,667) |
| Throughput especulativo B=4 | 349,76 tok/s (`mean_tau` = 3,917) |
| Throughput especulativo B=8 | 477,13 tok/s (`mean_tau` = 3,559) |
| Throughput especulativo B=16 | 665,65 tok/s (`mean_tau` = 3,568) |
| JSON FSM en GPU (B=4) | 248,76 tok/s, 100% JSON válido, `mean_tau` = 3,538 |

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM residente en modo `all_vram`: 54,43 GiB en GPU, más 26,82 GiB de tabla PLE en RAM anclada del host.
- Modo híbrido en RTX 5090 de 32 GiB: menos de 28,0 GiB residentes en GPU (`fits_32gib_rtx5090 = true`), con tiering hacia RAM del host y un mínimo de 64 GB de RAM del sistema.
- GPU soportadas: exclusivamente NVIDIA Blackwell `sm_120`, es decir, RTX PRO 6000 (96 GB) o RTX 5090 (32 GB).
- No es compatible con GPUs Ampere, Ada Lovelace ni Hopper, ya que el runtime es SASS precompilado para `sm_120`.
- Entorno de software: Linux x86_64, Python 3.13, `torch==2.14.1+cu130` (CUDA 13.0) y `transformers>=5.22.1`.
- Despliegue: servidor propio incluido en la wheel `qfn_sm120_unified` (`python -m qfn_sm120_unified.serve`), con soporte de batching continuo, endpoints OpenAI, Anthropic y Responses, métricas Prometheus en `/metrics` y gestión de slots en `/slots`.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput observado: de 183,70 tok/s con lote 1 a 665,65 tok/s con lote 16 en RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 (este) | 180B (MoE) | 128K | Apache 2.0 | safetensors cuantizado 2,45 bpw | Solo Blackwell `sm_120`; runtime propio |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (MoE) | 128K | Apache 2.0 | safetensors sin cuantizar | Requiere hardware de mayor capacidad; datos de despliegue no disponibles |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Dependencia total de hardware Blackwell `sm_120`: el runtime es SASS precompilado y no funciona en arquitecturas anteriores ni en otras marcas de aceleradores.
- El modo de 32 GiB en RTX 5090 requiere tiering hacia RAM del host y al menos 64 GB de memoria del sistema, lo que degrada la latencia frente al modo `all_vram`.
- La cuantización a 2,45 bpw puede introducir degradación en tareas sensibles a la precisión numérica; no se han publicado comparativas frente al modelo base sin cuantizar.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de seguridad.
- No se especifican los idiomas soportados, por lo que el rendimiento fuera del inglés y el chino es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el autor del checkpoint no ofrece garantías sobre la calidad del proceso de cuantización.
- El repositorio tiene 0 likes y fue creado en noviembre de 2026, con un ciclo de actualización de tres días; conviene verificar la integridad de los shards antes de desplegar en producción.
- El servidor incluido expone endpoints sin autenticación por defecto; debe configurarse `--api-key` o `QFN_API_KEY` en entornos accesibles.
- La tabla PLE en Q4_0 reside en RAM del host, lo que añade un punto de fallo y requiere memoria anclada suficiente.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Benchmark AIME 2025: https://huggingface.co/datasets/MathArena/aime_2025
