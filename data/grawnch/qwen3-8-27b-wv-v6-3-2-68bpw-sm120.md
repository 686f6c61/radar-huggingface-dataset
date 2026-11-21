# Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120

## Resumen

Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-27B, publicado por el usuario Grawnch en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresión agresiva del modelo base mediante la técnica propietaria Wave-Quant v6.3, que combina transformada FWHT-128, Wave-LUT no lineal, MTP calibrado por capa y decodificación especulativa con árbol híbrido (SAM-128K). El resultado es un checkpoint de 8,63 GiB en disco con un presupuesto medio de 2,6789 bits por peso, lo que permite ejecutar un modelo de 27B en GPUs Blackwell de consumo.

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que alterna Gated DeltaNet con Full-Attention, e incluye módulos MTP (Multi-Token Prediction) para decodificación especulativa. El checkpoint está empaquetado específicamente para GPUs NVIDIA Blackwell con capacidad de cómputo sm_120 (RTX 5090, RTX PRO 6000 y otras consumer Blackwell de 12 GB o más), e incluye una wheel precompilada SASS-only del runtime qfn_sm120_unified v22.4.0 que expone servidores compatibles con OpenAI, Anthropic Messages API y OpenAI Responses API.

Su relevancia actual radica en que demuestra que es viable servir un modelo de 27B con contexto de 8K en GPUs de 12 GB manteniendo una paridad de perplejidad razonable frente a BF16 (ΔPPL de +0,0356 en la ventana tardía 4096-8192, con 95,018% de acuerdo top-1). No obstante, el modelo está fuertemente atado a hardware Blackwell y a un runtime binario propietario, lo que limita su portabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas Gated DeltaNet + Full-Attention, con módulos MTP |
| Parámetros totales | 27B (modelo base Qwen/Qwen3.8-27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8K verificado en benchmarks (SAM-128K en el nombre sugiere soporte hasta 128K, no confirmado) |
| Tipos de cuantización | Wave-Quant v6.3, 2,6789 bpw (FWHT-128 + Wave-LUT no lineal + MTP calibrado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards por capas: globals, layers_00_03 a layers_60_63, mtp) + wheel binaria sm_120 |

## Arquitectura y entrenamiento

El checkpoint no ha sido reentrenado: es una cuantización del modelo Qwen/Qwen3.8-27B. La arquitectura del modelo base es un transformer híbrido de 64 capas que combina capas Gated DeltaNet (atención lineal con estado recurrente) con capas de Full-Attention, e incorpora módulos MTP (Multi-Token Prediction) que permiten decodificación especulativa. El checkpoint incluye un shard mtp.safetensors separado y un manifiesto sm120_manifest.json que describe el layout.

La innovación técnica principal es el esquema de cuantización Wave-Quant v6.3: transformada rápida de Walsh-Hadamard de 128 puntos (FWHT-128) para rotar los pesos antes de cuantizar, una tabla de búsqueda no lineal (Wave-LUT) para los niveles de cuantización, y calibración específica por capa del módulo MTP. El runtime incluye decodificación especulativa con árbol híbrido (SAM-128K) y prefill causal por chunks (K=256), que según el autor alcanza 1282,5 tok/s de prefill (1,82x sobre K=16) y 176,9 tok/s de generación con batch B=4. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo thinking (`<think>...</think>`) que puede emitirse en `delta.reasoning_content` o inline en `content`.
- Generación de código, incluyendo modo FIM (fill-in-the-middle) mediante el endpoint `/v1/completions` con `<|fim_prefix|>`.
- Tool calling / function calling completo: definiciones `tools`, respuestas multi-turno con `role: "tool"` y streaming tipado de `tool_calls` con `finish_reason: "tool_calls"`.
- Soporte de agentes multi-paso mediante endpoints nativos de Anthropic Messages API (para Claude Code) y OpenAI Responses API (para Codex CLI).
- Salida estructurada con `response_format` (`json_object` / `json_schema`).
- Decodificación especulativa con MTP y árbol híbrido, con control de presupuesto de razonamiento (`thinking_token_budget`) y guardas anti-repetición.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Asistente de código en local para GPUs Blackwell de consumo: con 8,63 GiB en disco y un perfil de 12 GB (`--force-12gb`, menos de 11 GiB residentes con MTP y KV de 8K), se puede servir un modelo de 27B en una RTX 5090 o en una consumer Blackwell de 12 GB, integrándolo en el IDE mediante el endpoint compatible con OpenAI.
- Agentes autónomos con tool calling: el servidor expone `tools`/`tool_calls` con streaming incremental de argumentos JSON, lo que permite construir agentes que invocan APIs externas y encadenan pasos multi-turno con `role: "tool"`.
- Integración con Claude Code y Codex CLI: los endpoints `/v1/messages` y `/v1/responses` permiten apuntar estas herramientas de CLI al servidor local sin adaptadores adicionales.
- Generación de código con FIM en pipelines de CI/CD: el endpoint `/v1/completions` con `<|fim_prefix|>` habilita tareas de autocompletado de código en herramientas de edición y revisión automatizada.
- Servicio multi-tenant con batching continuo: el runtime soporta batching continuo con Copy-on-Write (`n > 1`, `fork_slot_cow`) y PrefixCache asíncrono con `cache_salt` opcional para aislar prefijos por inquilino, adecuado para desplegar un endpoint compartido con varias aplicaciones.
- Extracción de datos estructurados: con `response_format` (`json_schema`) y modo thinking desactivable (`enable_thinking: false`), se puede usar para convertir texto libre en JSON tipado con baja latencia.
- Prototipado de razonamiento con presupuesto controlado: `thinking_token_budget` inyecta `</think>` en GPU sin abortar la respuesta, útil para acotar coste y latencia en tareas de razonamiento de varios pasos.

## Benchmarks y rendimiento

Paridad de perplejidad y KLD frente a BF16 en contexto de 8K (benchmarks/gate1_8k_longctx_kld.json):

| Ventana | PPL BF16 | PPL WV-v6.3 (2,68 bpw) | ΔPPL | KLD media | Acuerdo top-1 |
|---|---|---|---|---|---|
| All_8192 (0..8192) | 1,98016 | 2,08364 | +0,10348 | 0,160315 | 91,674% |
| Early_0_2048 | 2,81770 | 3,21119 | +0,39348 | 0,196031 | 88,086% |
| Late_4096_8192 | 1,46009 | 1,49567 | +0,03558 | 0,077584 | 95,018% |

Rendimiento del runtime declarado por el autor:

| Métrica | Valor |
|---|---|
| Prefill (27B, K=256, chunked causal) | 1282,5 tok/s (1,82x sobre K=16) |
| Generación (B=4, árbol híbrido + MTP) | 176,9 tok/s |
| Huella en disco | 8,63 GiB |
| Presupuesto de pesos | 2,6789 bpw |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 11 GiB residentes en el perfil de 12 GB (con MTP y KV de 8K); el checkpoint ocupa 8,63 GiB en disco.
- GPU soportadas: NVIDIA Blackwell sm_120, concretamente RTX PRO 6000 (96 GB), RTX 5090 (32 GB) y GPUs consumer Blackwell de 12 GB o más.
- No es compatible con GPUs Ampere, Ada ni Hopper: el runtime es SASS-only para sm_120.
- Sistema operativo: Linux x86_64. Python 3.13, torch 2.14.1+cu130 (CUDA 13.0), transformers >= 5.22.1, safetensors.
- Despliegue: runtime propietario `qfn_sm120_unified` v22.4.0 (wheel incluida en `wheels/`), lanzado con `python -m qfn_sm120_unified.serve`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Perfiles de arranque: `--force-32gb` para RTX 5090 y `--force-12gb` para GPUs de 12 GB.
- Latencia y throughput: 1282,5 tok/s de prefill y 176,9 tok/s de generación a B=4 según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 | 27B | 8K verificado | 2,68 bpw Wave-Quant | Apache 2.0 | Solo Blackwell sm_120 |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | BF16 | Apache 2.0 | Ampere, Ada, Hopper, Blackwell |
| Cuantizaciones GGUF/AWQ típicas de 27B | 27B | según modelo base | 4-8 bpw | según modelo base | Amplia compatibilidad |

La comparativa con alternativas de cuantización estándar (GGUF Q4, AWQ, GPTQ) no está disponible en la información proporcionada. La diferencia clave frente al modelo base es la portabilidad: el base corre en cualquier GPU moderna, mientras que este checkpoint requiere Blackwell sm_120 y un runtime binario específico.

## Limitaciones y advertencias

- Dependencia total de hardware Blackwell sm_120: no funciona en Ampere, Ada ni Hopper, lo que excluye la mayoría de GPUs de datacenter actuales (A100, H100).
- Runtime binario propietario SASS-only: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, lo que dificulta la integración en infraestructuras existentes y la auditoría del código.
- Degradación de calidad medible: ΔPPL de +0,39348 y acuerdo top-1 del 88,086% en la ventana temprana (0-2048), frente a +0,03558 y 95,018% en la tardía. El impacto es mayor en contextos cortos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de sesgos; al ser una cuantización agresiva a 2,68 bpw, la degradación puede amplificarse en tareas de razonamiento y matemáticas.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe del checkpoint.
- Contexto verificado limitado a 8K: aunque el nombre menciona SAM-128K, no hay benchmarks publicados más allá de 8192 tokens.
- Licencia Apache 2.0 heredada del modelo base, pero el runtime incluido (`qfn_sm120_unified`) es un binario de terceros cuya licencia no se detalla en la información disponible; conviene verificarla antes de uso comercial.
- Repositorio con 1 like y 1697 descargas: ecosistema muy pequeño, sin validación independiente de los benchmarks declarados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
