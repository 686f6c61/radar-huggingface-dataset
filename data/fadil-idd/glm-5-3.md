# Fadil-idd/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (zai-org), publicado en Hugging Face bajo el identificador Fadil-idd/GLM-5.3. Se trata de la iteración 5.3 de la familia GLM, construida sobre exactamente el mismo modelo base que GLM-5.2: todas las mejoras respecto a la versión anterior provienen exclusivamente de la fase de post-entrenamiento. El modelo está orientado a tareas de programación compleja, razonamiento de largo horizonte y automatización de agentes, y declara ser el modelo de pesos abiertos más capaz para código según sus propios benchmarks internos.

Con 753.329.940.480 parámetros totales según los pesos en safetensors, GLM-5.3 se sitúa en la categoría de modelos masivos tipo MoE (la arquitectura declarada es `glm_moe_dsa`). El repositorio ocupa 755,7 GB, lo que confirma que se distribuye en precisión nativa FP8. Soporta únicamente inglés y chino, y su licencia es propietaria (`glm-5.3`, catalogada como `other`), lo que condiciona su uso comercial.

La relevancia actual del modelo radica en dos frentes: por un lado, el salto en tareas de codificación agéntica y terminal (mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench y estado del arte open-source en Terminal Bench 3.0 y Agents' Last Exam); por otro, la aparición de capacidades emergentes de ciberseguridad ofensiva, con resultados destacados en CyberGym y ExploitBench, un aspecto que conviene evaluar con cautela desde el punto de vista de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con atención dispersa, según el identificador de arquitectura de transformers) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma explícita; las evaluaciones citadas emplean hasta 1M de tokens de contexto (NL2Repo) y 300.000 tokens con gestión de contexto (HLE w/ tools) |
| Tipos de cuantizacion | pesos nativos en FP8; no se detallan otros formatos cuantizados en la información disponible |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (etiquetada como `other` / propietaria) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura de tipo Mixture of Experts identificada como `glm_moe_dsa`, con pesos distribuidos en safetensors y precisión nativa FP8. El dato clave del entrenamiento es que el modelo base es idéntico al de GLM-5.2: la totalidad de las ganancias declaradas proviene del post-entrenamiento, no de un reentrenamiento del modelo base. La model card no detalla el número de tokens de preentrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO; esa información no está disponible.

La innovación técnica más destacada es el desarrollo de capacidades de ciberseguridad emergentes a medida que se escalaba el post-entrenamiento: según el autor, la capacidad cyber creció más rápido de lo esperado y las mejoras son mayores en los eslabones altos de la cadena de explotación, donde más que duplica a GLM-5.2 en los benchmarks de explotación. El modelo expone además un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) para controlar el presupuesto de razonamiento, con `max` como valor por defecto.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Codificación avanzada: estado del arte open-weights declarado en Terminal Bench 3.0 y Agents' Last Exam, con una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench.
- Razonamiento de largo horizonte y tareas agénticas de múltiples pasos (Terminal Bench, SWE-Marathon, AutomationBench, Toolathlon).
- Uso de herramientas y function calling en entornos agénticos verificados (Toolathlon Verified, HLE con herramientas).
- Control del presupuesto de razonamiento mediante el parámetro `reasoning_effort` (`low`, `high`, `max`).
- Capacidades emergentes de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitGym, ExploitBench).
- Gestión de contexto largo: las evaluaciones citadas operan con ventanas de hasta 1M de tokens y estrategias de gestión de contexto a 300.000 tokens.
- No se declaran capacidades de visión, audio ni otros modalidades en la información disponible.

## Casos de uso

- Automatización de tareas de terminal y CLI: el modelo alcanza 28,3 en Terminal Bench 3.0 y 88,2 en Terminal Bench 2.1, lo que lo hace adecuado para agentes que operan shells, ejecutan comandos y resuelven tareas de sistema de extremo a extremo.
- Ingeniería de software agéntica: con 66,9 en DeepSWE y 78,1 en FrontierSWE, puede integrarse en pipelines que resuelven issues reales de repositorios, ejecutan tests y proponen parches dentro de flujos de CI/CD.
- Migración y generación de repositorios completos: su resultado en NL2Repo (58,0 con 64k tokens de generación y contexto de 1M) lo habilita para traducir especificaciones en lenguaje natural a estructuras de proyecto completas.
- Auditoría de seguridad y descubrimiento de vulnerabilidades: con 84,5 en CyberGym, es adecuado para análisis estático y dinámico asistido, triaje de fallos y generación de pruebas de concepto en entornos controlados.
- Automatización de flujos de trabajo empresariales: 48,2 en AutomationBench y 73,0 en Toolathlon Verified respaldan su uso como orquestador de herramientas y APIs en procesos multi-paso.
- Asistentes de razonamiento con herramientas: 62,5 en HLE con herramientas y 1769 en GDPval-AA v2 lo sitúan como opción para tareas de conocimiento económico y razonamiento asistido por búsqueda o cálculo.
- Evaluación de exploits en laboratorios de seguridad: sus resultados en ExploitGym (105/130 en ventanas de 2h/6h) permiten usarlo en ejercicios de red team simulado y formación, siempre bajo supervisión y con las salvaguardas adecuadas.

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

Notas metodológicas de la model card: HLE w/ tools se evalúa con `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens y contexto máximo de 300.000 tokens con gestión de contexto, usando GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M, con juicio basado en reglas y LLM para evitar comportamientos maliciosos. DeepSWE se ejecuta con mini-swe-agent.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753,3 mil millones de parámetros en FP8 nativo, los pesos ocupan aproximadamente 755 GB, por lo que la inferencia requiere un nodo multi-GPU de alta gama. No se dispone de estimaciones oficiales para cuantizaciones de 4 bits u 8 bits alternativas.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, se requiere un clúster con GPUs de 80 GB o superiores (H100, H200, A100 80GB) en configuración multi-nodo.
- No cabe en GPUs de consumo: el tamaño del repositorio (755,7 GB) descarta RTX 4090, RTX 3090 o similares para inferencia completa.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth. También se soporta despliegue en Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Terminal Bench 3.0 | DeepSWE | CyberGym |
|---|---|---|---|---|---|---|
| GLM-5.3 | 753,3 B (MoE) | hasta 1M en evaluaciones | propietaria (`glm-5.3`) | 28,3 | 66,9 | 84,5 |
| Kimi K3 | no disponible | no disponible | no disponible | 17,4 | 67,5 | 80,0 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | – | 62,7 | 83,3 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | – | 56,6 | 78,5 |
| Opus 4.8 | no disponible | no disponible | propietaria | 21,1 | 58,0 | 78,1 |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada. En términos de rendimiento, GLM-5.3 lidera CyberGym (84,5), AutomationBench (48,2) y GDPval-AA v2 (1769) entre los modelos de pesos abiertos comparados, mientras que Fable 5 y GPT-5.6 Sol lo superan en varios benchmarks de codificación y explotación.

## Limitaciones y advertencias

- Licencia propietaria (`glm-5.3`, etiquetada como `other`): es imprescindible revisar los términos completos antes de cualquier uso comercial; no es una licencia open source estándar.
- Solo soporta inglés y chino; no se declara soporte para castellano ni otros idiomas, lo que limita su uso en productos multilingües.
- Capacidades emergentes de ciberseguridad ofensiva: el propio autor advierte que la capacidad cyber creció más rápido de lo esperado, con resultados destacados en descubrimiento y explotación de vulnerabilidades. Esto exige salvaguardas, supervisión humana y evaluación de riesgo antes de desplegarlo en producción.
- Riesgo de alucinación: no se documentan tasas específicas ni mitigaciones en la información disponible.
- Sesgos conocidos: no documentados en la model card.
- El modelo base es idéntico a GLM-5.2; las mejoras se concentran en post-entrenamiento, por lo que las limitaciones estructurales del base persisten.
- El parámetro `reasoning_effort` usa `max` por defecto, lo que incrementa coste y latencia si no se ajusta explícitamente.
- En el chat template, `clear_thinking` es `false` por defecto; en escenarios conversacionales debe pasarse `clear_thinking=true` para evitar arrastrar razonamiento previo.
- El tamaño de 755,7 GB y los 753,3 mil millones de parámetros implican un coste de infraestructura muy elevado y descartan el despliegue en hardware de consumo.
- No se han publicado datos de latencia, throughput ni requisitos mínimos de GPU en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Fadil-idd/GLM-5.3
- Paper (arXiv): https://arxiv.org/abs/2602.15763
- Repositorio del proyecto: https://github.com/zai-org/GLM-5
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación de Transformers (glm_moe_dsa): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
