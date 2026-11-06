# kigimues/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (zai-org), distribuido en Hugging Face a traves del repositorio `kigimues/GLM-5.3`. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con atencion dispersa (DSA, DeepSeek Sparse Attention segun el tag `glm_moe_dsa`), construido sobre la misma base que GLM-5.2: todas las mejoras de esta version provienen exclusivamente de la fase de post-entrenamiento, no de cambios en el modelo base.

El modelo esta orientado a tareas de codigo complejo, razonamiento de largo horizonte y uso agentico, con capacidades emergentes destacadas en ciberseguridad (descubrimiento de vulnerabilidades y explotacion). Segun la model card, alcanza estado del arte open-source en benchmarks como Terminal Bench 3.0, Agents' Last Exam y CyberGym.

Con 753.329.940.480 parametros totales (segun los pesos en safetensors) y un repositorio de 755,7 GB en precision FP8, es un modelo pensado para despliegue en infraestructura de datacenter, no para hardware de consumo. Soporta control del presupuesto de razonamiento mediante el parametro `reasoning_effort` con tres niveles: `low`, `high` y `max`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion dispersa (glm_moe_dsa) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado con hasta 1M de contexto en NL2Repo y 300.000 tokens en HLE w/ tools) |
| Tipos de cuantizacion | FP8 (pesos publicados en fp8); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura transformer con mezcla de expertos (MoE) y atencion dispersa, identificada en los tags del repositorio como `glm_moe_dsa`. Comparte el modelo base con GLM-5.2; la model card indica explicitamente que todas las ganancias de rendimiento respecto a la version anterior provienen del post-entrenamiento, sin modificaciones en la arquitectura ni en el preentrenamiento. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO.

La innovacion mas destacable documentada es el control del esfuerzo de razonamiento mediante el parametro `reasoning_effort`, que acepta los valores `low`, `high` y `max` (por defecto `max`). Ademas, la plantilla de chat incluye el parametro `clear_thinking`, que por defecto es `false` y que en escenarios conversacionales conviene establecer explicitamente a `true`. El modelo se distribuye en FP8 y es compatible con los principales frameworks de inferencia (SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth) y con la plataforma Ascend NPU (vLLM-Ascend, xLLM, SGLang).

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Codigo de alta complejidad: la model card lo describe como el modelo open-weights mas capaz para programacion, con una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench.
- Razonamiento de largo horizonte y tareas agenticas de multiples pasos (Terminal Bench, Agents' Last Exam, SWE-Marathon).
- Tool calling y function calling: resultados en Toolathlon Verified (73,0) y AutomationBench (48,2) evidencian soporte de uso de herramientas.
- Capacidades emergentes de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym 84,5) y explotacion (ExploitGym, ExploitBench).
- Razonamiento con herramientas externas (HLE w/ Tools: 62,5).
- Control del presupuesto de razonamiento mediante `reasoning_effort` (`low`, `high`, `max`).
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Agentes de codigo autonomos en terminal: el modelo puede ejecutar tareas de ingenieria de software de multiples pasos en entornos CLI, respaldado por sus resultados en Terminal Bench 3.0 (28,3) y Agents' Last Exam (28,5), superando a la mayoria de alternativas open-weights.
- Resolucion de issues en repositorios reales: con 78,1 en FrontierSWE y 58,0 en NL2Repo, es adecuado para pipelines que reciben una descripcion en lenguaje natural y generan o modifican un repositorio completo.
- Automatizacion de tareas de larga duracion (SWE-Marathon): su puntuacion de 42,5 en tareas de maraton de ingenieria de software lo hace apto para agentes que mantienen contexto y coherencia durante horas.
- Auditoria de seguridad y descubrimiento de vulnerabilidades: el modelo lidera CyberGym (84,5) y duplica a GLM-5.2 en benchmarks de explotacion, por lo que puede integrarse en flujos de pentesting asistido y analisis de superficies de ataque.
- Orquestacion de herramientas empresariales: con 73,0 en Toolathlon Verified y 48,2 en AutomationBench, puede gestionar flujos que combinan APIs, bases de datos y servicios externos.
- Asistencia a investigacion con busqueda y herramientas: su 62,5 en HLE w/ Tools permite usarlo como motor de razonamiento en sistemas RAG o de investigacion asistida que requieran encadenar consultas y sintesis.
- Generacion y refactorizacion de codigo en produccion: la mejora del 50% en Z.ai Code Bench respecto a GLM-5.2 y su soporte en vLLM/SGLang facilitan su integracion en pipelines de CI/CD y revision automatizada de codigo.

## Benchmarks y rendimiento

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

Notas de evaluacion segun la model card: HLE w/ tools se evalua con `temperature=1.0`, `top_p=0.95`, longitud maxima de generacion de 163.840 tokens, contexto maximo de 300.000 tokens con estrategia de gestion de contexto y GPT-5.6-luna (medium) como juez. NL2Repo se evalua con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` y contexto de 1M. DeepSWE se ejecuta con mini-swe-agent.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753.329.940.480 parametros en FP8, los pesos ocupan aproximadamente 755 GB; se requiere un nodo multi-GPU con al menos 8x H100 80GB (640 GB) en configuracion tensor-parallel, o 8x H200 141GB para mayor holgura de KV cache.
- GPU recomendadas: H100, H200, B200 y clusters equivalentes; tambien soportado en Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Cabe en GPU de consumo: no. El tamano del modelo excede con creces la VRAM de cualquier GPU consumer (RTX 4090 24GB, RTX 5090, etc.).
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth (este ultimo orientado a cuantizacion y ajuste fino). Para Ascend NPU: vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | 753,3B (MoE) | no disponible | glm-5.3 (other) | Pesos abiertos en HF | CyberGym 84,5; AutomationBench 48,2; GDPval-AA v2 1769 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Toolathlon 76,5; Terminal Bench 2.1 88,3 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | NL2Repo 61,1; CyberGym 83,3 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | GDPval-AA v2 1739; Terminal Bench 2.1 86,6 |

La comparativa se limita a los datos de benchmarks publicados en la model card; no se dispone de informacion sobre parametros, contexto ni licencia de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: no se documenta en la model card; como modelo generativo de gran escala, persiste el riesgo habitual, especialmente en tareas de codigo y ciberseguridad donde una salida incorrecta puede tener consecuencias graves.
- Capacidades de ciberseguridad duales: el modelo muestra un rendimiento estado del arte en descubrimiento y explotacion de vulnerabilidades (CyberGym 84,5, ExploitBench 54,4). Su uso debe restringirse a entornos autorizados y con supervision, dado el potencial de uso malicioso.
- Licencia: `license: other` con `license_name: glm-5.3`; no se detallan en la informacion disponible las condiciones exactas para uso comercial. Es imprescindible revisar el texto completo de la licencia antes de desplegarlo en produccion.
- Contexto: no se especifica la longitud maxima de contexto soportada, aunque las evaluaciones usan hasta 1M de tokens con estrategias de gestion de contexto; el comportamiento mas alla de ese limite no esta documentado.
- Parametros activos: no se publica el numero de parametros activos por token, lo que dificulta estimar costes de inferencia con precision.
- Configuracion de chat: es necesario pasar explicitamente `clear_thinking=true` en escenarios conversacionales, ya que por defecto es `false`; ignorarlo puede degradar la calidad de las respuestas.
- Presupuesto de razonamiento: el valor por defecto de `reasoning_effort` es `max`, lo que incrementa latencia y coste; para produccion conviene evaluar `low` o `high`.
- Requisitos de hardware: inasumible en hardware de consumo; requiere infraestructura de datacenter multi-GPU.

## Enlaces

- Hugging Face: https://huggingface.co/kigimues/GLM-5.3
- Paper (referencia arXiv): arxiv:2602.15763
- Repositorio GitHub de la organizacion: https://github.com/zai-org/GLM-5
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentacion de Transformers (glm_moe_dsa): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guia de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
