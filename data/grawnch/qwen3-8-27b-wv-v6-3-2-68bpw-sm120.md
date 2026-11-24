# Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120

## Resumen

Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-27B, publicado por el usuario Grawnch. Se trata de un empaquetado nativo para GPUs NVIDIA Blackwell (arquitectura `sm_120`) que comprime los pesos del modelo base a un presupuesto medio de 2,6789 bits por peso (2,68 bpw), resultando en 8,63 GiB en disco y un repositorio de 9,3 GB. El modelo base conserva sus 64 capas híbridas y se distribuye junto con un wheel de runtime precompilado (`qfn_sm120_unified` v22.4.0) que implementa un servidor compatible con la API de OpenAI.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 27B de parámetros en GPUs de consumo Blackwell con tan solo 12 GB de VRAM, gracias a la cuantización extrema combinada con decodificación especulativa Multi-Token Prediction (MTP) calibrada en la capa 64. El autor reporta 10,94 GiB residentes con MTP y 8K de KV cache en el perfil `--force-12gb`, manteniendo paridad greedy exacta (96/96) frente al modelo de referencia.

El checkpoint incluye shards safetensors aplanados en la raíz del repositorio, manifiesto `sm120_manifest.json`, tokenizer y plantilla de chat Jinja. La licencia es Apache 2.0. No se dispone de información sobre los idiomas soportados ni de la composición del dataset de entrenamiento del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 64 capas (modelo base Qwen3.8-27B) con decodificación especulativa MTP en capa 64 |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8K verificado en benchmarks; contexto máximo nativo del modelo base no disponible |
| Tipos de cuantizacion | Cuantización nativa `wave-quant` a 2,68 bpw (2,6789 bpw efectivos); no se listan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards `layers_00_03` a `layers_60_63`, `globals.safetensors`, `mtp.safetensors`), más wheel binario `qfn_sm120_unified-22.4.0` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer híbrida de 64 capas. Sobre él, este checkpoint aplica una cuantización propietaria denominada `wave-quant` que reduce los pesos a un presupuesto de 2,68 bpw, con shards organizados en bloques de cuatro capas. El autor añade un módulo de Multi-Token Prediction (MTP) calibrado en la capa 64 que actúa como cabezal de decodificación especulativa, lo que permite generar varios tokens por paso de decodificación y multiplicar el throughput frente a la decodificación autoregresiva clásica.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. La innovación técnica destacable es el empaquetado nativo para `sm_120` (Blackwell): el runtime `qfn_sm120_unified` compila kernels SASS específicos para esa arquitectura y expone endpoints multi-protocolo (OpenAI, Anthropic Messages, OpenAI Responses, FIM). El autor reporta paridad de logits y perplejidad frente a BF16 en ventanas de 8K (ΔPPL de +0,03558 en la ventana tardía 4096-8192, con 95,018% de acuerdo top-1).

## Capacidades

- Generación de texto y conversación multi-turno con modo thinking (``) y presupuesto de tokens de razonamiento por petición.
- Razonamiento matemático en modo `xhigh` (validado en AIME 2025 según el benchmark Gate 3, aunque los resultados completos no están incluidos en la información disponible).
- Generación de código, incluyendo FIM (fill-in-the-middle) mediante el endpoint `/v1/completions` con tokens `<|fim_prefix|>`.
- Tool calling / function calling completo: definiciones `tools`, respuestas multi-turno `role: "tool"` y streaming de argumentos JSON tipados con `finish_reason: "tool_calls"`.
- Soporte de agentes multi-paso mediante endpoints nativos para Claude Code (Anthropic Messages API) y Codex CLI (OpenAI Responses API).
- Decodificación especulativa MTP con streaming incremental de tokens aceptados y decodificación UTF-8 sin glitches.
- Batching continuo con reparto dinámico de GPU entre peticiones concurrentes.
- Caché de prefijo asíncrona fijada en memoria (system prompt y esquemas de herramientas compartidos, con `cache_salt` para aislamiento por tenant).
- Salidas estructuradas mediante `response_format` (`json_object` / `json_schema`) y ramificación con `n > 1`.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo Blackwell de 12 GB: el perfil `--force-12gb` mantiene el modelo, MTP y 8K de KV cache en 10,94 GiB, lo que permite servir un modelo de 27B en tarjetas como la RTX 5090 o GPUs Blackwell de gama media sin degradar la paridad greedy.
- Asistente de código integrado en IDE o CLI: los endpoints nativos para Claude Code y Codex CLI, junto con FIM y tool calling, permiten conectar el modelo a asistentes de programación existentes sin adaptadores adicionales.
- Automatización de agentes con herramientas: el streaming incremental de argumentos JSON y la recuperación implícita de `` facilitan pipelines agénticos donde el modelo decide y ejecuta llamadas a funciones de forma fiable.
- Atención al cliente multi-turno: la caché de prefijo asíncrona reutiliza el system prompt entre peticiones y el batching continuo sostiene concurrencia, lo que reduce coste por consulta en cargas conversacionales.
- Razonamiento matemático y analítico por lotes: el modo thinking con presupuesto de tokens configurable (`thinking_token_budget`) y las guardas anti-bucle permiten procesar problemas de AIME-style con control de coste y latencia.
- Generación de código en CI/CD: la API compatible con OpenAI (`/v1/chat/completions` con SSE y JSON) y las salidas estructuradas `json_schema` permiten integrar el modelo en pipelines de revisión, generación de tests o parcheo automático.
- Servicio multi-tenant con aislamiento: el parámetro `cache_salt` y la opción `--api-key` / `QFN_API_KEY` permiten separar cachés y autenticar clientes en un despliegue compartido.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado |
|---|---|
| PPL BF16, ventana All_8192 | 1,98016 |
| PPL 2,68 bpw, ventana All_8192 | 2,08364 (ΔPPL +0,10348) |
| PPL BF16, ventana Early_0_2048 | 2,81770 |
| PPL 2,68 bpw, ventana Early_0_2048 | 3,21119 (ΔPPL +0,39348) |
| PPL BF16, ventana Late_4096_8192 | 1,46009 |
| PPL 2,68 bpw, ventana Late_4096_8192 | 1,49567 (ΔPPL +0,03558) |
| KLD media, All_8192 | 0,160315 |
| KLD media, Late_4096_8192 | 0,077584 |
| Acuerdo top-1, All_8192 | 91,674% |
| Acuerdo top-1, Late_4096_8192 | 95,018% |
| Memoria residente (`--force-12gb`, MTP + 8K KV) | 10,94 GiB (paridad greedy 96/96) |
| Decodificación especulativa B=1 (`--force-12gb`, K=8) | 143,0 tok/s (τ = 3,00; frente a 56,8 tok/s con M=1) |
| Decodificación especulativa B=1 (96 GB, K=12) | 155,5 tok/s (τ = 3,45; paridad greedy 96/96) |
| Prefill | 1282,5 tok/s |
| Decodificación especulativa batched B=4 | 176,9 tok/s |
| AIME 2025 (contexto 128K, modo `xhigh`, pp=0,0) | resultados no incluidos en la información disponible |

## Requisitos de hardware

- GPU NVIDIA Blackwell con arquitectura `sm_120` obligatoria: RTX PRO 6000 96 GB, RTX 5090 32 GB o cualquier GPU Blackwell de consumo con al menos 12 GB.
- VRAM estimada: 10,94 GiB en el perfil `--force-12gb` (modelo + MTP + 8K KV); perfil `--force-32gb` para RTX 5090; perfil completo para RTX PRO 6000 de 96 GB.
- Sistema operativo Linux x86_64, Python 3.13, `torch==2.14.1+cu130` (CUDA 13.0), `transformers>=5.22.1` y `safetensors`.
- No es compatible con GPUs Ampere, Ada ni Hopper: el wheel es SASS-only para `sm_120`.
- Despliegue mediante el runtime propietario `qfn_sm120_unified` (`python -m qfn_sm120_unified.serve`); no se listan opciones como vLLM, llama.cpp, Ollama o TGI.
- Throughput reportado: 1282,5 tok/s de prefill y 176,9 tok/s de decodificación especulativa con batch B=4; 143-155,5 tok/s en B=1 según perfil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 | 27B | 8K verificado | 2,68 bpw nativa `sm_120` | Apache 2.0 | Hugging Face, runtime propietario |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia total de hardware Blackwell `sm_120`: el wheel es SASS-only y no funciona en Ampere, Ada, Hopper ni en GPUs no NVIDIA.
- La cuantización a 2,68 bpw degrada la perplejidad en ventanas tempranas (ΔPPL +0,39348 en Early_0_2048 y 88,086% de acuerdo top-1), aunque la ventana tardía mantiene mejor paridad.
- El contexto verificado es de 8K; no se confirma la longitud máxima nativa del modelo base ni su comportamiento más allá de esa ventana.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico del checkpoint ni idiomas soportados.
- El runtime es un wheel binario propietario del autor (`qfn_sm120_unified`), no un stack estándar como vLLM o llama.cpp, lo que limita la portabilidad y la auditabilidad del código de inferencia.
- Aunque la licencia del checkpoint es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B para uso comercial en producción.
- El repositorio tiene pocas descargas (1784) y un solo like en el momento de la consulta, lo que indica validación comunitaria limitada.
- Los resultados de AIME 2025 (Gate 3) no están completos en la información disponible y no deben citarse como cifras cerradas.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
