# cszhzleo/GLM5.3-fp8-channel-wise-v1

## Resumen

GLM-5.3 es un modelo de lenguaje de tipo transformer con arquitectura MoE (Mixture of Experts) y atención dispersa (DSA, DeepSeek Sparse Attention, segun el tag `glm_moe_dsa`), desarrollado por Z.ai (zai-org). Esta ficha concreta, `cszhzleo/GLM5.3-fp8-channel-wise-v1`, es una cuantizacion en FP8 con escalado channel-wise publicada por un tercero (cszhzleo) a partir de los pesos BF16 originales de GLM-5.3. El modelo base mantiene el mismo backbone que GLM-5.2; todas las mejoras de la version 5.3 provienen de post-entrenamiento, orientado a codificacion compleja, tareas de horizonte largo y capacidades emergentes de ciberseguridad.

Con 753.329.940.480 parametros totales (segun los safetensors del repo) y un tamano de repositorio de 756,3 GB, es un modelo de escala frontier que no cabe en hardware de consumo y requiere despliegue multi-GPU o en nodos de alta memoria. Su relevancia actual radica en que el autor reclama SOTA open-weights en benchmarks de agentes y codificacion como Terminal Bench 3.0, Agents' Last Exam y CyberGym, ademas de mejoras superiores al 50% frente a GLM-5.2 en el benchmark interno Z.ai Code Bench.

La licencia es `glm-5.3` (marcada como `other` en Hugging Face), por lo que las condiciones de uso comercial deben consultarse en el texto de la licencia del modelo base. Los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa (tag `glm_moe_dsa`) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion de HLE w/ tools usa 300.000 tokens con gestion de contexto; NL2Repo se evalua bajo contexto de 1M) |
| Tipos de cuantizacion | FP8 channel-wise (esta version); pesos originales en BF16 |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura transformer con mezcla de expertos (MoE) y atencion dispersa, identificada en Hugging Face con el tag de arquitectura `glm_moe_dsa`. El modelo base es identico al de GLM-5.2: el incremento de capacidad de la version 5.3 se atribuye integramente a la fase de post-entrenamiento, que el autor describe como escalada de post-training con foco en codificacion, tareas de horizonte largo y descubrimiento de vulnerabilidades. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

La innovacion destacable es el control del presupuesto de razonamiento mediante el parametro `reasoning_effort`, con tres niveles (`low`, `high`, `max`; por defecto `max`). La plantilla de chat incorpora ademas el parametro `clear_thinking` (por defecto `false`), que en escenarios conversacionales conviene fijar explicitamente a `true`. Esta version FP8 channel-wise reduce el peso en memoria respecto a los pesos BF16 originales, manteniendo el esquema de cuantizacion por canal.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Codificacion avanzada: el autor lo describe como el modelo open-weights mas capaz para programacion, con mejoras superiores al 50% en su benchmark interno Z.ai Code Bench frente a GLM-5.2.
- Tareas de agentes y razonamiento multi-paso de horizonte largo (Terminal Bench, Agents' Last Exam, SWE-Marathon).
- Uso de herramientas (tool calling / function calling) con evaluacion en Toolathlon Verified y HLE con herramientas.
- Capacidades de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y tareas de explotacion (ExploitGym, ExploitBench).
- Modo de razonamiento con presupuesto configurable via `reasoning_effort` (`low`, `high`, `max`).
- Razonamiento asistido por herramientas con contextos de hasta 300.000 tokens en evaluacion y gestion de contexto.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Agentes de codificacion autonoma en terminal: el modelo lidera Terminal Bench 3.0 entre modelos open-weights (28,3 frente a 17,4 de Kimi K3), por lo que es adecuado para agentes que ejecutan comandos, depuran y resuelven tareas de ingenieria en entornos CLI.
- Migracion y generacion de repositorios completos: con NL2Repo (58,0) y contexto de hasta 1M en evaluacion, puede emplearse para transformar especificaciones en lenguaje natural en estructuras de repositorio funcionales.
- Resolucion de incidencias en produccion (SWE): con 78,1 en FrontierSWE y 66,9 en DeepSWE, encaja en pipelines que reciben un issue, localizan el fallo en el codigo y proponen un parche verificable.
- Auditoria de seguridad y bug bounty: su rendimiento SOTA en CyberGym (84,5) y ExploitBench (54,4) lo hace util para analisis de vulnerabilidades y validacion de cadenas de explotacion en entornos controlados.
- Automatizacion de flujos con herramientas: con 73,0 en Toolathlon Verified y 62,5 en HLE con herramientas, sirve para orquestar APIs, navegacion y tareas administrativas multi-paso.
- Asistentes de razonamiento con presupuesto ajustable: el parametro `reasoning_effort` permite desplegar el mismo modelo en modos de baja latencia (`low`) para chat y de maximo razonamiento (`max`) para tareas analiticas.
- Evaluacion de tareas profesionales de conocimiento: con 1769 en GDPval-AA v2, es aplicable a la generacion y revision de entregables en dominios economicos y profesionales.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo base en la model card:

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | **88,8** |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | **34,6** |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | **72,7** |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | **69,7** | – | – |
| ProgramBench (Almost Solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | **33,0** | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | **88,2** | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | **48,8** | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | **41,8** | 36,2 |
| CyberGym | **84,5** | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | **78,0** | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | **76,5** | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | **48,2** | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | **28,6** |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | **64,5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Condiciones de evaluacion declaradas por el autor: HLE con herramientas usa `temperature=1.0`, `top_p=0.95`, longitud maxima de generacion de 163.840 tokens, contexto maximo de 300.000 tokens con gestion de contexto y GPT-5.6-luna (medium) como juez. NL2Repo se evalua con `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M, con juicio basado en reglas y LLM para evitar comportamientos maliciosos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, 753.329.940.480 parametros en FP8 suponen aproximadamente 753 GB solo de pesos, a los que se suma el estado de activaciones, cache KV y overhead del runtime; el repo ocupa 756,3 GB.
- GPU recomendadas: no se especifican en la informacion disponible; por el tamano, requiere nodos multi-GPU de clase datacenter (varios aceleradores con memoria agregada superior al terabyte).
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, etc.) ni en configuraciones multi-GPU de consumo tipicas.
- Opciones de despliegue documentadas por el autor: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth. En plataforma Ascend NPU se soportan vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (modelos frontier open-weights), segun los datos de benchmark del autor:

| Modelo | Parametros | Contexto | Terminal Bench 3.0 | CyberGym | Toolathlon Verified | Licencia |
|---|---|---|---|---|---|---|
| GLM-5.3 | 753,3 B (total) | no disponible | 28,3 | **84,5** | 73,0 | glm-5.3 (other) |
| Kimi K3 | no disponible | no disponible | 17,4 | 80,0 | **76,5** | no disponible |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | – | 83,3 | 74,1 | no disponible |
| Qwen3.8-Max | no disponible | no disponible | – | 78,5 | 72,5 | no disponible |

Frente a modelos propietarios de referencia, GLM-5.3 queda por debajo de GPT-5.6 Sol en Terminal Bench 3.0 (28,3 frente a 34,6) y HLE con herramientas (62,5 frente a 64,5), pero supera a Opus 4.8 en CyberGym (84,5 frente a 78,1) y GDPval-AA v2 (1769 frente a 1588). Los datos de parametros, contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse principalmente en ingles y chino, el rendimiento en otros idiomas puede degradarse.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran escala, requiere verificacion en tareas factuales.
- Limitaciones de contexto e idioma: solo se declaran en y zh; la longitud de contexto oficial no se especifica, aunque las evaluaciones emplean hasta 300.000 tokens con gestion de contexto y 1M en NL2Repo.
- Licencia: `glm-5.3` con `license: other`; es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- Esta ficha corresponde a una cuantizacion FP8 channel-wise de terceros (`cszhzleo`), no a los pesos oficiales; puede haber diferencias de calidad respecto al BF16 original y no cuenta con validacion del autor del modelo base.
- Capacidades de ciberseguridad emergentes: el propio autor advierte de un desarrollo mas rapido de lo esperado en explotacion; su uso en entornos reales debe limitarse a pruebas autorizadas.
- En escenarios de chat conviene pasar `clear_thinking=true` explicitamente; de lo contrario se mantiene el valor por defecto `false`.
- El presupuesto de razonamiento por defecto es `max`, lo que incrementa coste y latencia si no se ajusta.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/cszhzleo/GLM5.3-fp8-channel-wise-v1
- Repositorio del modelo base: https://github.com/zai-org/GLM-5
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recipes de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recipes de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Transformers: https://github.com/huggingface/transformers
- Documentacion de Transformers para glm_moe_dsa: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial de KTransformers para GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guia de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Paper referenciado (arXiv): arxiv:2602.15763
