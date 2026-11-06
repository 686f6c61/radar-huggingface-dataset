# cszhzleo/GLM5.3-fp8-channel-wise

## Resumen

GLM-5.3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Z.ai (Zhipu AI), distribuido en abierto bajo la licencia `glm-5.3`. Esta ficha concreta, `cszhzleo/GLM5.3-fp8-channel-wise`, es una conversión comunitaria de los pesos originales a formato FP8 con cuantización *channel-wise*, empaquetada para `transformers` y con arquitectura declarada `glm_moe_dsa`. El repositorio ocupa 756,3 GB y declara 753.329.940.480 parámetros totales en los safetensors.

La propuesta del modelo es el razonamiento de largo horizonte y la ingeniería de software agéntica: según la model card, GLM-5.3 reutiliza la misma base que GLM-5.2 y todas las mejoras provienen del post-entrenamiento, con un incremento del 50 % en el benchmark interno Z.ai Code Bench y resultados SOTA en abierto en Terminal Bench 3.0 y Agents' Last Exam. También destaca una capacidad emergente en ciberseguridad ofensiva y de descubrimiento de vulnerabilidades (CyberGym).

Es relevante ahora porque compite frontalmente con modelos propietarios de frontera (Opus 4.8, GPT-5.6 Sol, Fable 5) en tareas de agentes, uso de herramientas y explotación, manteniendo pesos abiertos y soporte en los principales frameworks de inferencia (SGLang, vLLM, TokenSpeed, KTransformers, Unsloth). Su tamaño, sin embargo, lo sitúa fuera del alcance de hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture-of-Experts con atención DSA, según tag de Hugging Face y doc de transformers) |
| Parametros totales | 753.329.940.480 (≈753,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como spec oficial; en evaluación se cita contexto de hasta 300.000 tokens y 1M de contexto en NL2Repo |
| Tipos de cuantizacion | FP8 channel-wise (esta conversión); los pesos originales se distribuyen en otros formatos |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other) |
| Formato de pesos | safetensors (FP8 channel-wise) |

## Arquitectura y entrenamiento

La arquitectura declarada es `glm_moe_dsa`: un transformer disperso de tipo Mixture-of-Experts con atención DSA (Deep Sparse Attention), documentado en `transformers` bajo `glm_moe_dsa`. El recuento de parámetros (753,3 B) confirma un modelo de escala frontera; el número de parámetros activos por token no se especifica en la información disponible. Esta variante concreta aplica cuantización FP8 *channel-wise*, es decir, escalas de cuantización por canal, lo que reduce el peso en disco y memoria respecto a BF16 a costa de una pequeña pérdida de precisión.

Según la model card, GLM-5.3 comparte base con GLM-5.2 y todas las ganancias proceden del post-entrenamiento, sin cambios en el modelo base. No se detallan en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación; tampoco se describen innovaciones como decodificación especulativa. Sí se documenta un control explícito del presupuesto de razonamiento mediante el parámetro `reasoning_effort` (`low`, `high`, `max`, por defecto `max`) y un flag `clear_thinking` en la plantilla de chat (por defecto `false`).

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento de largo horizonte y tareas agénticas multi-paso (Terminal Bench 3.0, Agents' Last Exam, AutomationBench).
- Codificación de software a gran escala: parches, resolución de repositorios y tareas SWE (DeepSWE, SWE-Marathon, NL2Repo, FrontierSWE).
- Uso de herramientas y *function calling* (Toolathlon Verified, HLE con herramientas).
- Control del presupuesto de razonamiento mediante `reasoning_effort` (`low`/`high`/`max`).
- Capacidad emergente en ciberseguridad: descubrimiento de vulnerabilidades y explotación (CyberGym, ExploitGym, ExploitBench).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- No se declaran capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- **Agentes de ingeniería de software autónomos**: el modelo puede operar sobre terminales y repositorios resolviendo tareas de varios pasos; sus resultados en Terminal Bench 3.0 (28,3) y DeepSWE (66,9) lo sitúan como candidato para pipelines de resolución automática de incidencias y generación de parches.
- **Migración y generación de repositorios completos**: con NL2Repo (58,0) y contexto de hasta 1M en evaluación, es adecuado para transformar especificaciones en esqueletos de proyecto y para tareas de refactorización de gran alcance.
- **Automatización de operaciones (AIOps)**: su rendimiento en AutomationBench (48,2) y Toolathlon (73,0) permite encadenar llamadas a herramientas, APIs y sistemas de ficheros para orquestar tareas de administración.
- **Auditoría de seguridad y *red teaming***: con CyberGym (84,5) y ExploitBench (54,4), puede emplearse en programas de divulgación de vulnerabilidades y pruebas de penetración autorizadas, siempre bajo supervisión humana y marcos legales estrictos.
- **Investigación asistida con herramientas**: en HLE con herramientas alcanza 62,5, lo que lo hace útil para flujos de investigación que combinan búsqueda, cálculo y verificación con fuentes externas.
- **Evaluación de conocimiento profesional**: con GDPval-AA v2 (1769) puede apoyar tareas de dominio experto (análisis, redacción técnica, resolución de problemas) cuando se dispone de infraestructura de inferencia a gran escala.
- **Asistentes bilingües en/zh**: para productos dirigidos a mercados anglófonos y sinófonos, aprovechando su soporte nativo de ambos idiomas.

## Benchmarks y rendimiento

Resultados publicados en la model card (los valores son los reportados por el autor; el modelo de referencia es GLM-5.3):

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

Notas de evaluación recogidas en la model card: HLE con herramientas usa `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con gestión de contexto y GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M, con filtros basados en reglas y LLM para evitar comportamientos maliciosos.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial; a partir del tamaño del repo (756,3 GB en FP8 channel-wise) se requiere en torno a 750–800 GB de memoria agregada solo para los pesos, más caché KV y overhead del runtime.
- **GPU recomendadas**: despliegue multi-GPU obligatorio. Por el volumen de pesos, se necesitan nodos con GPUs de 80 GB (A100/H100/H200) o superiores; no cabe en una sola GPU comercial de consumo.
- **Consumer GPU**: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU domésticas razonables.
- **Opciones de despliegue**: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth; también vLLM-Ascend, xLLM y SGLang sobre Ascend NPU.
- **Latencia y throughput**: no disponibles en la información proporcionada. La cuantización FP8 channel-wise reduce el ancho de banda de memoria frente a BF16 y suele mejorar el throughput, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 (esta ficha, FP8) | 753,3 B (MoE) | hasta 300k–1M en evaluación | `glm-5.3` (other) | Pesos abiertos en HF | SOTA abierto en Terminal Bench 3.0, CyberGym, AutomationBench |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Mejor en Toolathlon (76,5), SWE-Marathon (48,1) |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Mejor en NL2Repo (61,1) entre los abiertos |
| Opus 4.8 | no disponible (propietario) | no disponible | propietaria | API | Mejor en NL2Repo (69,7) y SWE-Marathon (48,8) |
| GPT-5.6 Sol | no disponible (propietario) | no disponible | propietaria | API | Mejor global en Terminal Bench 3.0, DeepSWE, ExploitGym |

## Limitaciones y advertencias

- **Escala prohibitiva**: 753,3 B de parámetros y 756,3 GB en FP8 hacen inviable el despliegue fuera de clústeres multi-GPU; no es un modelo para entornos de consumo ni de una sola GPU.
- **Idiomas**: solo inglés y chino declarados; el rendimiento en castellano y otras lenguas no está garantizado ni evaluado.
- **Riesgo de alucinación**: no se documentan tasas específicas; como todo LLM de gran escala, requiere verificación en dominios factuales.
- **Capacidad de ciberseguridad ofensiva**: la model card reconoce capacidades emergentes de explotación (ExploitGym, ExploitBench) que superan a modelos anteriores; su uso debe limitarse a pruebas autorizadas y bajo marcos legales, dado el riesgo de doble uso.
- **Licencia `glm-5.3` (other)**: no es una licencia OSI estándar; es imprescindible revisar los términos exactos antes de cualquier uso comercial.
- **Sesgos**: no se publica información sobre evaluación de sesgos en la documentación disponible.
- **Conversión comunitaria**: esta variante FP8 channel-wise la mantiene un tercero (`cszhzleo`), no Z.ai; puede diferir de los pesos oficiales en precisión y comportamiento, y no cuenta con validación oficial.
- **Configuración de chat**: `clear_thinking` por defecto es `false`; en escenarios de chat conviene pasarlo explícitamente a `true`, y `reasoning_effort` por defecto es `max`, lo que incrementa coste y latencia si no se ajusta.
- **Caveat de evaluación**: muchos resultados se obtuvieron con contexto de 300k y gestión de contexto, además de un juez LLM propietario; la reproducibilidad exacta no está garantizada.

## Enlaces

- Hugging Face (esta conversión FP8): https://huggingface.co/cszhzleo/GLM5.3-fp8-channel-wise
- Repositorio oficial GLM-5 (recursos y benchmarks): https://github.com/zai-org/GLM-5
- Documentación de `glm_moe_dsa` en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recetas de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recetas de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- KTransformers (tutorial GLM-5.2): https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Paper referenciado (arXiv 2602.15763): https://arxiv.org/abs/2602.15763
