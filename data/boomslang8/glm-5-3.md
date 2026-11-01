# Boomslang8/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala con arquitectura MoE (etiquetado como `glm_moe_dsa`) publicado en Hugging Face por el usuario Boomslang8, con licencia propia "glm-5.3". Según la model card, comparte el modelo base con GLM-5.2, de modo que todas las mejoras provienen del post-entrenamiento, con foco especial en tareas de programación complejas y agentes de horizonte largo. El repositorio pesa 755,7 GB y contiene 753.329.940.480 parámetros en safetensors con cuantización FP8, lo que lo sitúa en la categoría de modelos frontera de pesos abiertos.

Su relevancia actual radica en tres puntos destacados por el autor: es el modelo de pesos abiertos más capaz en programación según sus benchmarks internos (Z.ai Code Bench, con una mejora del 50 % sobre GLM-5.2), alcanza SOTA abierto en Terminal Bench 3.0 y Agents' Last Exam, y muestra capacidades emergentes de ciberseguridad ofensiva, siendo estado del arte en CyberGym para descubrimiento de vulnerabilidades. Soporta inglés y chino, y ofrece control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa), transformer autorregresivo |
| Parametros totales | 753.329.940.480 (753,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las evaluaciones citan contextos de hasta 300.000 y 1M de tokens según benchmark) |
| Tipos de cuantizacion | FP8 |
| Idiomas soportados | inglés, chino |
| Licencia | other (license_name: glm-5.3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE identificada en Hugging Face como `glm_moe_dsa`, una variante de la familia GLM basada en transformer autorregresivo con enrutado de expertos. La documentación de Transformers para `glm_moe_dsa` sugiere la presencia de mecanismos de atención dispersa, aunque la model card no detalla el número de expertos ni los parámetros activos por token. Con 753,3 B de parámetros totales y pesos en FP8, se trata de un modelo de clase frontera que requiere infraestructura multi-GPU para su despliegue.

No se han publicado detalles sobre el preentrenamiento (número de tokens, composición del dataset) ni sobre los métodos de post-entrenamiento (RLHF, DPO). La model card indica únicamente que GLM-5.3 usa el mismo modelo base que GLM-5.2 y que todas las ganancias provienen del post-entrenamiento, escalado especialmente en tareas de código, agentes y capacidades de ciberseguridad. El modelo expone un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) para controlar el presupuesto de razonamiento, además de una opción `clear_thinking` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Programación avanzada: según el autor, es el modelo de pesos abiertos más capaz en código, con mejoras sustanciales sobre GLM-5.2 en Z.ai Code Bench, Terminal Bench 3.0, DeepSWE, FrontierSWE y NL2Repo.
- Razonamiento con presupuesto ajustable mediante `reasoning_effort` (`low`, `high`, `max`), con modo de razonamiento activado por defecto a `max`.
- Capacidades de ciberseguridad ofensiva: estado del arte en CyberGym para descubrimiento de vulnerabilidades y grandes mejoras en benchmarks de explotación (ExploitGym, ExploitBench).
- Uso de herramientas y agentes: buenos resultados en Toolathlon Verified, AutomationBench y Agents' Last Exam (ALE-CLI), orientados a flujos multi-paso y automatización.
- Gestión de contextos muy largos: las evaluaciones oficiales emplean contextos de hasta 300.000 tokens (HLE) y 1M de tokens (NL2Repo).
- Soporte de despliegue en CPU/NPU alternativas, incluyendo la plataforma Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.

## Casos de uso

- Generacion de codigo en producción: con resultados de 88,2 en Terminal Bench 2.1 y 66,9 en DeepSWE, puede integrarse en pipelines de CI/CD para resolver issues reales de repositorios, generar parches y ejecutar flujos de trabajo agénticos sobre terminales.
- Refactorización de repositorios completos: el benchmark NL2Repo (58,0) evalúa la generación de proyectos completos a partir de descripciones en lenguaje natural bajo contexto de 1M de tokens, adecuado para bootstrapping de código.
- Auditoría y descubrimiento de vulnerabilidades: su SOTA en CyberGym (84,5) lo hace apto para equipos de seguridad que automatizan el análisis de vulnerabilidades en código propio, siempre en entornos controlados y con autorización explícita.
- Automatización de tareas multi-paso con herramientas: los resultados en AutomationBench (48,2) y Toolathlon Verified (73,0) lo indican para orquestación de agentes que combinan llamadas a APIs, navegación de sistemas de archivos y ejecución de comandos.
- Resolución de problemas científicos de alto nivel: 62,5 en HLE con herramientas y 1769 en GDPval-AA v2 sugieren utilidad como asistente de investigación con acceso a herramientas externas y contextos extensos.
- Asistencia conversacional bilingüe: soporte nativo de inglés y chino con plantilla de chat configurable (`clear_thinking`) para chatbots técnicos que requieran respuestas razonadas.
- Evaluación y post-entrenamiento de modelos: el resultado en PostTrainBench (39,8) indica utilidad como modelo base o juez en flujos de generación de datos sintéticos y destilación.

## Benchmarks y rendimiento

Resultados publicados por el autor de la model card (no verificados de forma independiente):

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

Condiciones de evaluación declaradas: HLE con `temperature=1.0`, `top_p=0.95`, generación máxima de 163.840 tokens, contexto máximo de 300.000 tokens y GPT-5.6-luna (medium) como juez; NL2Repo con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` bajo contexto de 1M de tokens; DeepSWE ejecutado con mini-swe-agent (la model card se corta en este punto).

## Requisitos de hardware

- VRAM estimada para inferencia: con 753,3 B de parámetros en FP8, se requieren aproximadamente 755 GB solo para los pesos, lo que implica un mínimo de 8-10 GPUs de 80 GB (A100/H100) en FP8; no disponible un cálculo oficial exacto.
- GPUs recomendadas: nodos multi-GPU con A100 u H100 de 80 GB; también se documenta soporte para la plataforma Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Consumer GPUs: no es viable su ejecución íntegra en GPUs de consumo (una RTX 4090 con 24 GB es insuficiente incluso con cuantización agresiva, dado el tamaño del repo de 755,7 GB y la ausencia de variantes GGUF publicadas).
- Opciones de despliegue: SGLang (con cookbook oficial), vLLM (con recetas oficiales), TokenSpeed, Transformers (con documentación de `glm_moe_dsa`), KTransformers y Unsloth.
- Latencia y throughput: no disponible; al ser MoE, los parámetros activos por token (dato no publicado) determinarán el rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.3 | 753,3 B (MoE) | no disponible (evaluado hasta 1M) | glm-5.3 (other) | Pesos abiertos en Hugging Face |
| GLM-5.2 | no disponible | no disponible | no disponible | Pesos abiertos (mismo modelo base) |
| Kimi K3 | no disponible | no disponible | no disponible | Pesos abiertos |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | Pesos abiertos |

En los benchmarks publicados por el autor, GLM-5.3 supera a GLM-5.2 en todas las tareas evaluadas (por ejemplo, 66,9 frente a 46,2 en DeepSWE) y compite de tú a tú con modelos cerrados como Opus 4.8 y GPT-5.6 Sol en tareas de código y agentes, aunque queda por detrás de Fable 5 y GPT-5.6 Sol en los benchmarks de explotación y en Terminal Bench 3.0. No se han publicado especificaciones comparables (parámetros, contexto) de los modelos alternativos en la información disponible.

## Limitaciones y advertencias

- Capacidades ofensivas de ciberseguridad: el modelo muestra capacidades emergentes de explotación de vulnerabilidades (más del doble que GLM-5.2 en benchmarks de explotación). Su uso debe restringirse a contextos autorizados (bug bounty, auditoría propia) y requiere salvaguardas adicionales en producción.
- Riesgo de alucinación: no disponible; no se han publicado evaluaciones de veracidad o alucinación.
- Sesgos: no disponible; no se han publicado estudios de sesgo.
- Idiomas: soporte oficial limitado a inglés y chino; el rendimiento en castellano no está documentado.
- Contexto: la longitud de contexto oficial no está especificada en la model card; solo se conocen los contextos usados en evaluaciones (300.000 y 1M de tokens según benchmark).
- Licencia: se trata de una licencia personalizada ("glm-5.3"), no de una licencia estándar permisiva; debe revisarse el texto completo antes de cualquier uso comercial.
- Configuración por defecto: `reasoning_effort` por defecto es `max`, lo que puede aumentar significativamente el coste de inferencia en escenarios conversacionales; en chat se recomienda pasar explícitamente `clear_thinking=true`.
- Los benchmarks son publicados por el propio autor y no están verificados de forma independiente.
- El repositorio procede de una cuenta de usuario individual (Boomslang8) y no del organizador oficial zai-org, lo que aconseja verificar la autenticidad e integridad de los pesos antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Boomslang8/GLM-5.3
- Paper (arXiv): https://arxiv.org/abs/2602.15763
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recetas de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación de Transformers para glm_moe_dsa: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial de KTransformers para GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guía de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Imagen de benchmarks: https://raw.githubusercontent.com/zai-org/GLM-5/refs/heads/main/resources/bench_53_2.png
