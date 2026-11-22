# omegabaer/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (zai-org), publicado en Hugging Face bajo el identificador `omegabaer/GLM-5.3`. Se trata de la iteración 5.3 de la familia GLM-5 y comparte el mismo modelo base que GLM-5.2, de modo que todas las mejoras provienen exclusivamente de la fase de post-entrenamiento. Con 753.329.940.480 parámetros totales (aproximadamente 753 mil millones) y un repositorio de 755,7 GB en formato safetensors, es un modelo denso de gran tamaño orientado a generación de texto, razonamiento y, de forma destacada, tareas de código y agentes autónomos.

El modelo se posiciona como el más capaz de pesos abiertos para programación según su model card, con una mejora del 50 % sobre GLM-5.2 en el benchmark interno Z.ai Code Bench y resultados SOTA en benchmarks públicos como Terminal Bench 3.0 y Agents' Last Exam. Además, introduce una capacidad emergente en ciberseguridad: destaca en CyberGym para descubrimiento de vulnerabilidades y más que duplica a GLM-5.2 en benchmarks de explotación.

La relevancia actual de GLM-5.3 radica en su enfoque en tareas de horizonte largo (long-horizon), uso de herramientas y razonamiento multi-paso, con soporte para presupuesto de razonamiento configurable mediante el parámetro `reasoning_effort` (`low`, `high`, `max`). Está disponible en inglés y chino, con licencia propia `glm-5.3` y compatibilidad con los principales frameworks de inferencia (SGLang, vLLM, Transformers, KTransformers, Unsloth y TokenSpeed).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `glm_moe_dsa`; detalles completos no disponibles) |
| Parametros totales | 753.329.940.480 (~753 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion de HLE w/ tools usa hasta 300.000 tokens con gestion de contexto; NL2Repo se evalua bajo contexto de 1M) |
| Tipos de cuantizacion | FP8 (tag `fp8`); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | `glm-5.3` (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que GLM-5.3 emplea una arquitectura de tipo transformer con el tag `glm_moe_dsa`, lo que sugiere un diseño con mezcla de expertos (MoE) y algún mecanismo de atención con compresión o dispersión (DSA). Sin embargo, la model card no detalla el número de parámetros activos, el número de expertos, la composición del dataset ni el volumen de tokens de entrenamiento, por lo que estos datos deben considerarse no disponibles.

El aspecto diferencial de GLM-5.3 es que reutiliza el mismo modelo base que GLM-5.2 y concentra todas las mejoras en el post-entrenamiento. Según el autor, el escalado de esta fase produjo una capacidad cibernética emergente más rápida de lo esperado, con mejoras especialmente grandes en la parte alta de la cadena de explotación. El modelo admite control del presupuesto de razonamiento mediante `reasoning_effort` con tres niveles (`low`, `high`, `max`, siendo `max` el valor por defecto), y su plantilla de chat incluye el parámetro `clear_thinking`, que por defecto es `false` y que en escenarios conversacionales conviene fijar explícitamente a `true`.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento complejo con presupuesto de pensamiento configurable (`reasoning_effort`: `low`, `high`, `max`).
- Programación avanzada: generación, reparación y finalización de código en repositorios y entornos de terminal.
- Tareas de horizonte largo (long-horizon) y razonamiento multi-paso.
- Uso de herramientas (tool calling / function calling), evaluado en Toolathlon Verified y AutomationBench.
- Capacidades de agente autónomo en CLI y entornos de terminal (Terminal Bench, Agents' Last Exam ALE-CLI).
- Descubrimiento de vulnerabilidades y tareas de ciberseguridad ofensiva (CyberGym, ExploitGym, ExploitBench).
- Razonamiento asistido por herramientas externas (HLE w/ Tools).
- Capacidad de trabajar con contextos muy extensos (hasta 300.000 tokens en evaluación, 1M en NL2Repo).

## Casos de uso

- **Automatización de ingeniería de software en terminal**: el modelo puede operar en entornos CLI para resolver tareas de reparación y construcción de repositorios, como demuestra su rendimiento en Terminal Bench 3.0 (28,3) y SWE-Marathon (42,5), lo que lo hace adecuado para pipelines de CI/CD asistidos por agentes.
- **Generación y refactorización de código en producción**: con resultados de 66,9 en DeepSWE v1.1 y 58,0 en NL2Repo, puede integrarse en asistentes de código que traduzcan especificaciones en lenguaje natural a repositorios funcionales.
- **Agentes autónomos multi-paso**: su puntuación en Agents' Last Exam (28,5) y AutomationBench (48,2) lo posiciona para orquestar flujos de trabajo con múltiples herramientas y pasos de razonamiento.
- **Auditoría de seguridad y descubrimiento de vulnerabilidades**: con 84,5 en CyberGym y 54,4 en ExploitBench, es adecuado para equipos de seguridad que necesiten análisis automatizado de superficies de ataque y validación de exploits en entornos controlados.
- **Atención al cliente y asistentes conversacionales**: el soporte de conversación multi-turno y su ventana de contexto extensa permiten gestionar diálogos largos con historial amplio, fijando `clear_thinking=true` en escenarios de chat.
- **Razonamiento asistido por herramientas en investigación**: con 62,5 en HLE w/ Tools, puede emplearse en flujos de investigación que combinen búsqueda, cálculo y verificación con herramientas externas.
- **Evaluación de modelos y reproducción de benchmarks**: la posibilidad de ajustar `reasoning_effort` y la compatibilidad con SGLang, vLLM y Transformers facilitan su uso como referencia en laboratorios de evaluación.

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

Notas de evaluación: HLE w/ tools se evalúa con `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con gestión de contexto y GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M. DeepSWE se ejecuta con mini-swe-agent.

## Requisitos de hardware

- **VRAM estimada**: con 753 mil millones de parámetros, en FP8 (formato nativo según el tag) se requieren aproximadamente 750 GB de VRAM solo para los pesos, sin contar caché KV ni overhead. En cuantizaciones de menor precisión (no documentadas en la información disponible) el requisito se reduciría, pero no se dispone de cifras oficiales.
- **GPU recomendadas**: no cabe en GPUs de consumo. Requiere clústeres multi-GPU con H100, H200 o A100 de 80 GB; por ejemplo, se necesitarían al menos 10 H100 de 80 GB en FP8 solo para pesos, con margen adicional para caché KV y activaciones.
- **Consumer GPU**: no es viable en RTX 4090 ni en ninguna GPU de consumo actual.
- **Plataformas de despliegue**: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y, en plataforma Ascend NPU, vLLM-Ascend, xLLM y SGLang.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | ~753 mil millones | no disponible (evaluado hasta 300K-1M) | `glm-5.3` (other) | Pesos abiertos en HF | CyberGym 84,5; AutomationBench 48,2; GDPval-AA v2 1769 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Toolathlon 76,5; Terminal Bench 2.1 88,3 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | NL2Repo 61,1; CyberGym 83,3 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | GDPval-AA v2 1739 |
| Opus 4.8 (propietario) | no disponible | no disponible | propietaria | API | NL2Repo 69,7; SWE-Marathon 48,8 |
| GPT-5.6 Sol (propietario) | no disponible | no disponible | propietaria | API | Terminal Bench 3.0 34,6; ExploitGym 216/293 |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; la comparativa se limita a los resultados de benchmarks publicados en la model card.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información disponible; al entrenarse principalmente en inglés y chino, el rendimiento en otros idiomas puede degradarse.
- **Alucinación**: no se proporcionan tasas de alucinación; como modelo de gran escala orientado a agentes, existe riesgo en tareas de razonamiento abierto y uso de herramientas.
- **Limitaciones de idioma**: solo se declaran inglés y chino; no hay soporte oficial para castellano ni otros idiomas.
- **Restricciones de licencia**: la licencia `glm-5.3` es de tipo "other"; deben revisarse los términos completos antes de cualquier uso comercial, ya que no es una licencia OSI estándar.
- **Capacidad cibernética dual**: el modelo muestra un rendimiento SOTA en descubrimiento de vulnerabilidades y explotación (CyberGym 84,5; ExploitBench 54,4), lo que exige controles de uso y políticas de acceso en producción.
- **Requisitos de hardware extremos**: ~753 mil millones de parámetros y ~750 GB en FP8 hacen inviable el despliegue en infraestructura de consumo; requiere clústeres multi-GPU.
- **Configuración de chat**: en escenarios conversacionales debe pasarse `clear_thinking=true` explícitamente, ya que por defecto es `false`.
- **Reproducibilidad de benchmarks**: para reproducir resultados y leaderboards debe mantenerse `reasoning_effort=max` (valor por defecto).
- **Madurez del repositorio**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no permite inferir validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/omegabaer/GLM-5.3
- Repositorio GitHub de la familia GLM-5: https://github.com/zai-org/GLM-5
- Paper (arXiv): https://arxiv.org/abs/2602.15763
- SGLang: https://github.com/sgl-project/sglang
- Cookbook SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recipes vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recetas TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Transformers (documentación glm_moe_dsa): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers (tutorial GLM-5.2): https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth (guía GLM-5.3): https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Imagen de benchmarks: https://raw.githubusercontent.com/zai-org/GLM-5/refs/heads/main/resources/bench_53_2.png
