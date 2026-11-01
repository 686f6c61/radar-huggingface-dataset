# omegazurich/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala publicado por Z.ai (organización zai-org) bajo el identificador `omegazurich/GLM-5.3` en HuggingFace. Se trata de un transformer de tipo Mixture of Experts (MoE) con 753.329.940.480 parámetros totales según los pesos en safetensors, y reutiliza exactamente el mismo modelo base que GLM-5.2: todas las mejoras respecto a la versión anterior provienen exclusivamente de la fase de post-entrenamiento. El modelo está orientado a generación de texto, conversación, razonamiento de largo horizonte y, de forma muy destacada, a tareas de programación y ciberseguridad.

La relevancia de GLM-5.3 radica en dos ejes. Por un lado, el autor lo posiciona como el modelo de pesos abiertos más capaz para coding, con una mejora del 50% sobre GLM-5.2 en su benchmark interno Z.ai Code Bench y resultados de estado del arte open source en Terminal Bench 3.0 y Agents' Last Exam. Por otro, documenta una capacidad emergente en ciberseguridad: lidera CyberGym para descubrimiento de vulnerabilidades y más que duplica a GLM-5.2 en benchmarks de explotación.

El modelo soporta únicamente inglés y chino según los metadatos, se distribuye con licencia propia `glm-5.3` (categorizada como `other`), y su repositorio ocupa 755,7 GB en formato safetensors con cuantización fp8. Está diseñado para desplegarse con frameworks de inferencia de alto rendimiento como SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth, además de plataformas Ascend NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); tipo `glm_moe_dsa` en Transformers |
| Parametros totales | 753.329.940.480 (753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como valor nominal; en evaluación se cita contexto de hasta 300.000 tokens (HLE con herramientas) y 1M de contexto en NL2Repo |
| Tipos de cuantizacion | fp8 (pesos publicados); otras cuantizaciones vía Unsloth/KTransformers no detalladas |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 755,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-01 |

## Arquitectura y entrenamiento

GLM-5.3 es un modelo Mixture of Experts identificado en Transformers con la arquitectura `glm_moe_dsa`. Reutiliza el mismo checkpoint base que GLM-5.2, de modo que la arquitectura, el número de parámetros y los datos de pre-entrenamiento son idénticos a los de la versión previa. La información disponible no detalla el número de expertos, la proporción de parámetros activos por token, el número de tokens de pre-entrenamiento ni la composición del dataset.

La innovación diferencial de esta versión reside en el post-entrenamiento. Según el autor, el escalado de esta fase produjo dos efectos: una mejora sustancial en coding y tareas de largo horizonte (50% sobre GLM-5.2 en Z.ai Code Bench, con estado del arte open source en Terminal Bench 3.0 y Agents' Last Exam) y una capacidad cibernética emergente que superó las expectativas, con mejoras que se amplifican a medida que se avanza en la cadena de explotación. No se especifica en la información proporcionada si se emplearon RLHF, DPO u otras técnicas concretas de alineamiento, ni detalles de decodificación especulativa o atención lineal más allá de la etiqueta `dsa` de la arquitectura.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento complejo y tareas de largo horizonte (long-horizon tasks), con soporte de contexto muy extenso en evaluación (hasta 300.000 tokens y 1M en pruebas específicas).
- Programación avanzada: generación y edición de código, resolución de repositorios (NL2Repo), tareas de ingeniería de software (SWE-Marathon, FrontierSWE, DeepSWE).
- Uso de terminal y agentes CLI: Terminal Bench 2.1 y 3.0, Agents' Last Exam (ALE-CLI), AutomationBench.
- Tool calling / function calling: evaluado en Toolathlon Verified y HLE con herramientas.
- Razonamiento agéntico multi-paso con gestión de contexto.
- Control del presupuesto de razonamiento mediante el parámetro `reasoning_effort` con tres niveles: `low`, `high` y `max` (por defecto `max`).
- Capacidad emergente en ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitGym, ExploitBench).
- Modo thinking controlable mediante plantilla de chat, con parámetro `clear_thinking` (por defecto `false`; se recomienda `true` en escenarios de chat).
- No se documentan capacidades de visión, audio ni otros modalidades.

## Casos de uso

- Agente de ingeniería de software autónomo: el modelo puede operar sobre repositorios completos y resolver tareas de modificación de código en entornos reales, respaldado por sus resultados en DeepSWE (66,9), SWE-Marathon (42,5) y FrontierSWE (78,1), lo que lo hace adecuado para pipelines de resolución automática de issues y pull requests.
- Automatización de terminal y CLI: con 28,3 en Terminal Bench 3.0 y 28,5 en Agents' Last Exam (ALE-CLI), puede emplearse como agente que ejecuta comandos, interpreta salidas y encadena acciones en entornos de shell para tareas de DevOps y administración de sistemas.
- Generación de código en producción: soporta tool calling (73,0 en Toolathlon Verified) e integración en pipelines de CI/CD para generación de tests, refactorización y revisión automatizada de código.
- Auditoría de seguridad y descubrimiento de vulnerabilidades: con 84,5 en CyberGym, es adecuado para análisis estático y dinámico asistido, triaje de hallazgos y priorización de parches en programas de bug bounty o equipos de AppSec.
- Investigación en explotación controlada: sus resultados en ExploitGym (105/130 en ventanas de 2h/6h) y ExploitBench (54,4) lo sitúan como herramienta para laboratorios de seguridad que desarrollen pruebas de penetración en entornos aislados y con autorización.
- Asistente de razonamiento con herramientas externas: con 62,5 en HLE con herramientas y contexto de hasta 300.000 tokens, puede orquestar búsquedas, cálculo y APIs para responder consultas complejas de investigación.
- Automatización de flujos de trabajo empresariales: 48,2 en AutomationBench v1.0.6 lo hace apto para agentes que ejecutan procesos multi-paso sobre sistemas corporativos.
- Evaluación comparativa de modelos: útil como referencia open weights para benchmarking de agentes de coding y ciberseguridad frente a modelos propietarios.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

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

Notas de evaluación publicadas: HLE con herramientas usa `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con gestión de contexto y GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` bajo 1M de contexto, con juicio basado en reglas y LLM para evitar comportamientos maliciosos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 753,3 mil millones de parámetros y pesos fp8, el modelo completo requiere del orden de 750 GB de memoria, por lo que no cabe en GPU de consumo.
- GPU recomendadas: el autor no publica una lista de GPU concretas; por el tamaño y el soporte de frameworks, el despliegue se orienta a clústeres con GPUs de centro de datos (A100, H100, H200 y equivalentes) o a plataformas Ascend NPU.
- GPU de consumo: no es viable en RTX 4090 ni en GPUs consumer de 24-48 GB con los pesos completos; solo mediante esquemas de offload o cuantización agresiva no detallados.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth, y en Ascend NPU vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | 753,3 mil M (MoE) | no disponible (evaluado hasta 300k y 1M) | glm-5.3 (other) | Pesos abiertos en HuggingFace | CyberGym 84,5; AutomationBench 48,2; GDPval-AA v2 1769 |
| GLM-5.2 | mismo base que GLM-5.3 | no disponible | glm (other) | Pesos abiertos | Predecesor directo; CyberGym 77,2; Terminal Bench 3.0 4,6 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 2.1 88,3; Toolathlon 76,5 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Terminal Bench 2.1 87,9; CyberGym 83,3 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | GDPval-AA v2 1739; Terminal Bench 2.1 86,6 |
| Opus 4.8 | no disponible | no disponible | propietaria | API | NL2Repo 69,7; SWE-Marathon 48,8 |
| GPT-5.6 Sol | no disponible | no disponible | propietaria | API | Terminal Bench 3.0 34,6; ExploitGym 216/293 |

Los datos de parámetros, contexto y licencia de los modelos comparados no se detallan en la información disponible; la comparación se limita a los resultados de benchmarks publicados por el autor de GLM-5.3.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o fairness en la información disponible.
- Alucinación: no se publican métricas específicas de factualidad ni de tasa de alucinación.
- Licencia: licencia propia `glm-5.3` (categorizada como `other`); es imprescindible revisar los términos exactos antes de cualquier uso comercial, ya que no es una licencia OSI estándar.
- Capacidad cibernética dual: el modelo es estado del arte en descubrimiento y explotación de vulnerabilidades (CyberGym 84,5, ExploitGym 105/130), lo que exige controles de uso, aislamiento y autorización explícita para evitar uso malicioso.
- Requisitos de hardware: 753,3 mil millones de parámetros y 755,7 GB de repositorio implican infraestructura de centro de datos; no es desplegable en entornos de consumo.
- Configuración de razonamiento: `reasoning_effort` por defecto es `max`, lo que incrementa coste y latencia; para producción conviene ajustar a `low` o `high` según la tarea.
- Plantilla de chat: `clear_thinking` por defecto es `false`; en escenarios de chat debe pasarse `clear_thinking=true` para evitar arrastrar razonamiento previo.
- Contexto: la longitud nominal de contexto no se especifica; los valores de 300.000 y 1M corresponden a configuraciones de evaluación, no necesariamente al máximo soportado en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/omegazurich/GLM-5.3
- Repositorio GitHub del proyecto: https://github.com/zai-org/GLM-5
- Paper (arXiv): https://arxiv.org/abs/2602.15763
- SGLang: https://github.com/sgl-project/sglang
- Cookbook SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recetas vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recetas TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Transformers: https://github.com/huggingface/transformers
- Documentación Transformers `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial KTransformers GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guía Unsloth GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
