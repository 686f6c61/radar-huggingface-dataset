# Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Grawnch en Hugging Face. Se trata de una compilación de pesos en formato safetensors que aplica la técnica propietaria Wave-Quant v6 (2,45 bits por peso) sobre el modelo base de 180.000 millones de parámetros, con el objetivo de reducir drásticamente el espacio en disco y la VRAM necesaria para inferencia. El paquete incluye además un wheel binario de runtime SASS-only para GPUs NVIDIA Blackwell (sm_120) y un drafter especulativo DFlash2 calibrado.

El modelo base es un transformer híbrido con arquitectura MoE que combina 36 capas Gated DeltaNet (GDN) y 12 capas Qwen Sparse Attention (QSA), con 512 expertos enrutados más 1 compartido y hyper-conexiones mHC de 4 flujos. El checkpoint cuantizado está pensado para ejecutarse en hardware Blackwell de consumo y profesional, incluyendo RTX 5090 de 32 GB mediante un modo híbrido CPU-GPU, y en RTX PRO 6000 de 96 GB en modo totalmente residente en VRAM.

La relevancia de esta ficha radica en que demuestra una vía práctica para servir un modelo de 180B en una sola GPU Blackwell con decodificación especulativa, alcanzando velocidades de 183 a 665 tok/s según el tamaño de lote, y con soporte de tool calling, razonamiento y APIs compatibles con OpenAI, Anthropic y Responses. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el runtime binario propietario y la dependencia de sm_120 limitan la portabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 48 capas (36 Gated DeltaNet + 12 Qwen Sparse Attention), 512 expertos enrutados + 1 compartido, hyper-conexiones mHC de 4 flujos |
| Parámetros totales | 180B (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 128K (indexador Sparse QSA de 128K); benchmarks verificados a 8K y 96K |
| Tipos de cuantización | Wave-Quant v6 a 2,45 bpw (FWHT-128 + Wave-LUT de 16 bancos + indexador QSA disperso de 128K + Q4_0 N-Gram PLE en capa 1 + SWZ4/BF16 en drafter DFlash2) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado), más wheel de runtime `qfn_sm120_unified-22.4.0` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que alterna 36 capas Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con 12 capas de Qwen Sparse Attention (QSA), un esquema de atención dispersa con indexador de 128K. La componente MoE utiliza 512 expertos enrutados más un experto compartido, y las hyper-conexiones mHC de 4 flujos conectan las representaciones entre capas. El checkpoint cuantizado conserva esta topología y añade un indexador QSA disperso de 128K, un PLE N-Gram en Q4_0 en la capa 1 y un drafter especulativo DFlash2 calibrado con SWZ4 y BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La innovación técnica destacable de este checkpoint es la cuantización Wave-Quant v6 a 2,45 bpw, que combina transformada FWHT-128 con una Wave-LUT de 16 bancos, y el runtime SASS-only para sm_120 que implementa prefill GDN in-place en una sola pasada, commit paralelo del indexador QSA, prefill por lotes con Copy-on-Write coalescido en 8 vías y decodificación especulativa con árbol híbrido y MTP sin sincronización de CPU.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con modo de pensamiento (`<think>...</think>`) y presupuesto de tokens de razonamiento por petición.
- Razonamiento matemático: 24/30 en AIME 2025 (Pass@1) según la model card.
- Generación de código: 133/175 en LiveCodeBench v6 (Pass@1) con presupuesto de 96K, incluyendo FIM (`<|fim_prefix|>`) para completado en el editor.
- Tool calling y function calling con streaming incremental de argumentos JSON y recuperación implícita de `</think>`.
- Soporte de agentes: endpoints compatibles con OpenAI Chat Completions, Anthropic Messages API (para Claude Code) y OpenAI Responses API (para Codex CLI).
- Salida estructurada: `response_format` con `json_object` y `json_schema`, y FSM en GPU para JSON válido al 100% a 248,76 tok/s con B=4.
- Decodificación especulativa DFlash2 con árbol híbrido y MTP, con tasas de aceptación (mean_tau) entre 3,49 y 4,67 según lote.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible.

## Casos de uso

- Servicio de chat compatible con OpenAI en una sola GPU Blackwell: el runtime `qfn_sm120_unified.serve` expone `/v1/chat/completions` con SSE, batching continuo y `reasoning_content`, lo que permite sustituir una API externa por un despliegue local en RTX PRO 6000 o RTX 5090.
- Asistente de código en terminal o IDE: los endpoints `/v1/messages` (Anthropic) y `/v1/responses` (OpenAI) permiten conectar Claude Code o Codex CLI directamente al modelo, con FIM para autocompletado y tool calling para ejecutar comandos y editar ficheros.
- Generación de JSON estructurado en pipelines de datos: con `response_format: json_schema` y FSM en GPU el modelo produce JSON válido al 100% a 248,76 tok/s con B=4, adecuado para extracción de entidades o enriquecimiento de registros.
- Agentes multi-paso con herramientas: el streaming incremental de argumentos de tool calling y el presupuesto de razonamiento permiten orquestar flujos de varias llamadas sin cortar la respuesta, útil en automatización de soporte técnico o investigación.
- Evaluación de razonamiento matemático y algorítmico: con 80% en AIME 2025 y 76% en LiveCodeBench v6, el modelo sirve para prototipar tutores o verificadores de soluciones en entornos educativos y de I+D.
- Inferencia de bajo coste en hardware de consumo: el modo `--force-32gb` mantiene menos de 28 GiB residentes en una RTX 5090 con 64 GB de RAM de sistema, lo que permite desplegar un modelo de 180B en una estación de trabajo.
- Servicio multiinquilino con caché de prefijos: el `PrefixCache` asíncrono en pinned host comparte prefijos de sistema y esquemas de herramientas entre peticiones, reduciendo el coste de prefill en despliegues con muchos usuarios y prompts repetidos.

## Benchmarks y rendimiento

Resultados publicados en la model card para 1× NVIDIA RTX PRO 6000 Blackwell:

| Métrica / Carga | Valor observado |
|---|---:|
| VRAM GPU residente estática (modo `all_vram`) | 54,43 GiB (+ 26,82 GiB de `ple_q4_0.safetensors` en host-pinned) |
| Pool híbrido RTX 5090 32 GiB (modo `cpu_cold`) | < 28,0 GiB residentes (`fits_32gib_rtx5090 = true`) |
| Decodificación especulativa DFlash2, B=1 | 183,70 tok/s (mean_tau = 3,491) |
| Decodificación especulativa DFlash2, B=2 (QSA disperso 16K) | 306,00 tok/s (mean_tau = 4,667) |
| Decodificación especulativa DFlash2, B=4 | 349,76 tok/s (mean_tau = 3,917) |
| Decodificación especulativa DFlash2, B=8 | 477,13 tok/s (mean_tau = 3,559) |
| Decodificación especulativa DFlash2, B=16 | 665,65 tok/s (mean_tau = 3,568) |
| JSON FSM con esquema en GPU, B=4 | 248,76 tok/s (100% JSON válido, mean_tau = 3,538) |
| PPL 8K QSA (All_8192 / Mid_2048_4096 / Late_4096_8192) | 3,1068 / 2,7302 / 3,2251 |
| AIME 2025 (30 problemas, Pass@1) | 24/30 (80,0%), 0 bucles de cola (265,3 tok/s, mean_tau = 4,26) |
| LiveCodeBench v6 completo (175, presupuesto 96K, Pass@1) | 133/175 (76,0%); Easy 97,67% (42/43), Medium 92,31% (48/52), Hard-Top30 70,0% (21/30), 386,6 tok/s |

Además, para el modelo de 27B se reporta prefill causal chunked con K=256 a 1282,5 tok/s (1,82× sobre K=16) y decodificación híbrida con árbol en GPU a 176,9 tok/s con B=4.

## Requisitos de hardware

- VRAM estimada: 54,43 GiB en modo `all_vram` en RTX PRO 6000 de 96 GB, más 26,82 GiB de PLE en memoria host-pinned; menos de 28 GiB residentes en RTX 5090 de 32 GB con modo `--force-32gb` y al menos 64 GB de RAM de sistema.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) para modo totalmente en VRAM; NVIDIA RTX 5090 (32 GB) para modo híbrido CPU-GPU. Solo arquitectura sm_120 (Blackwell).
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB mediante el modo híbrido `cpu_cold`; no se documenta compatibilidad con GPUs anteriores a Blackwell.
- Opciones de despliegue: runtime propietario `qfn_sm120_unified` (wheel SASS-only para Python 3.13, torch 2.14.1+cu130, CUDA 13.0, transformers >= 5.22.1, safetensors). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 183,70 tok/s a B=1 y 665,65 tok/s a B=16 en RTX PRO 6000; prefill de 1282,5 tok/s con K=256 en el modelo de 27B; 176,9 tok/s con B=4 en decodificación híbrida de árbol.
- Requisitos de sistema: Linux x86_64, Python 3.13, CUDA 13.0, al menos 64 GB de RAM host para el modo de 32 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 | 180B (MoE) | 128K | Apache 2.0 | safetensors cuantizado + wheel sm_120 | Requiere GPU Blackwell; runtime propietario |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (MoE) | 128K | Apache 2.0 | safetensors BF16 | Referencia sin cuantizar; requiere mucho más VRAM |
| Checkpoint de 27B del mismo runtime | 27B | no disponible | Apache 2.0 | safetensors cuantizado | Soportado por el mismo wheel; menor huella |
| Alternativas de 180B en otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Dependencia de hardware: el runtime es SASS-only para sm_120 (Blackwell); no funciona en GPUs Ampere, Ada ni Hopper sin recompilación, que no se documenta.
- Runtime propietario: el wheel `qfn_sm120_unified` es binario y no se especifica su licencia ni el código fuente, lo que puede condicionar auditorías y despliegues en producción.
- Cuantización agresiva a 2,45 bpw: aunque se reportan PPL de 2,73 a 3,23 en 8K, no se comparan con el modelo base en BF16, por lo que la degradación real no está cuantificada.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento multilingüe ni la cobertura fuera del inglés.
- Riesgo de alucinación y bucles: la model card menciona guardas de `repetition_detection` y `thinking_token_budget`, lo que sugiere que el modelo puede entrar en bucles de razonamiento si no se limita.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Restricciones de licencia: los pesos son Apache 2.0, pero el uso comercial del runtime binario y del drafter DFlash2 debe verificarse por separado.
- Requisitos de memoria host: el modo de 32 GB necesita al menos 64 GB de RAM y almacenamiento para 79,5 GB de repositorio.
- Contexto: aunque se anuncia 128K, los benchmarks verificados se limitan a 8K y 96K; el comportamiento más allá de 96K no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
