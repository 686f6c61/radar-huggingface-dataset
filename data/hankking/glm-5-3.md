# hankking/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (zai-org), publicado en HuggingFace bajo el identificador `hankking/GLM-5.3`. Se trata de la iteración 5.3 de la familia GLM-5, y su rasgo definitorio es que reutiliza exactamente el mismo modelo base que GLM-5.2: todas las mejoras provienen de la fase de post-entrenamiento. Con 753.329.940.480 parámetros totales (aproximadamente 753 mil millones) y un repositorio de 755,7 GB en safetensors, es un modelo de escala frontier que compite directamente con las grandes familias propietarias y abiertas del momento.

El modelo está orientado a tareas de codificación compleja, razonamiento de largo horizonte y uso agéntico con herramientas. Según la model card, supera a GLM-5.2 en un 50 % en el benchmark interno Z.ai Code Bench y alcanza estado del arte open-source en Terminal Bench 3.0 y Agents' Last Exam. Además, el escalado del post-entrenamiento ha hecho emerger capacidades de ciberseguridad ofensiva que el autor destaca explícitamente, con resultados SOTA en CyberGym para descubrimiento de vulnerabilidades.

La arquitectura declarada en los tags es `glm_moe_dsa`, esto es, un transformer con mezcla de expertos (MoE) y atención dispersa (DSA, DeepSeek Sparse Attention, presumiblemente). Soporta únicamente inglés y chino, se distribuye en formato safetensors con cuantización fp8 y emplea una licencia propia denominada `glm-5.3` (etiquetada como `other`), lo que obliga a revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (`glm_moe_dsa`) |
| Parametros totales | 753.329.940.480 (~753 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; las evaluaciones se ejecutan con hasta 1M de contexto (NL2Repo) y 300.000 tokens con gestión de contexto (HLE w/ tools) |
| Tipos de cuantizacion | fp8 (tag del repo); no se detallan otras variantes |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license_name), etiquetada como `other` |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer con mezcla de expertos (MoE) y atención dispersa, identificada en los tags como `glm_moe_dsa`. Con 753 mil millones de parámetros totales, el diseño MoE implica que solo una fracción de los expertos se activa por token, aunque la model card no desglosa el número de parámetros activos ni el número de expertos. La atención dispersa (DSA) está pensada para reducir el coste computacional en contextos muy largos, lo que encaja con los escenarios de evaluación que manejan ventanas de hasta 1M de tokens.

El dato más relevante del entrenamiento es que GLM-5.3 no introduce cambios en el modelo base respecto a GLM-5.2: todas las ganancias proceden del post-entrenamiento. La model card no detalla el volumen de tokens, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación, más allá de mencionar que el escalado del post-entrenamiento produjo capacidades emergentes de ciberseguridad. Tampoco se especifican innovaciones como decodificación especulativa. Sí se documenta un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) para controlar el presupuesto de razonamiento, y un flag `clear_thinking` en la plantilla de chat que por defecto vale `false`.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento controlable mediante `reasoning_effort` (`low`, `high`, `max`; por defecto `max`).
- Codificación avanzada: la model card lo describe como el modelo open-weights más capaz para programación, con mejoras del 50 % sobre GLM-5.2 en el benchmark interno Z.ai Code Bench.
- Tareas de largo horizonte y agentes de terminal (Terminal Bench 2.1 y 3.0, SWE-Marathon).
- Uso de herramientas y function calling, evaluado en Toolathlon Verified y AutomationBench.
- Razonamiento agéntico multi-paso con herramientas externas (HLE w/ Tools, Agents' Last Exam).
- Capacidades de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitGym, ExploitBench).
- Conversión de lenguaje natural a repositorios de código (NL2Repo).
- Soporte de despliegue en SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y plataformas Ascend NPU.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- **Agentes de codificación autónomos en terminal**: el modelo puede operar entornos CLI y resolver tareas de ingeniería de software de varios pasos, como demuestran sus resultados en Terminal Bench 3.0 (28,3) y SWE-Marathon (42,5). Encaja en pipelines donde un agente ejecuta comandos, lee errores y aplica parches de forma iterativa.
- **Reparación de incidencias en producción (SWE)**: con 78,1 en FrontierSWE y 66,9 en DeepSWE, es adecuado para integrarse en flujos tipo issue-to-PR, recibiendo un repositorio y una descripción de fallo y generando un parche verificable.
- **Generación de repositorios completos a partir de especificaciones**: NL2Repo (58,0) mide la capacidad de construir un repositorio funcional desde una descripción en lenguaje natural, útil para prototipado rápido de servicios y librerías.
- **Automatización de flujos de trabajo con herramientas**: con 73,0 en Toolathlon Verified y 48,2 en AutomationBench, puede orquestar llamadas a APIs, hojas de cálculo y sistemas internos en tareas de automatización de oficina o back-office.
- **Auditoría de seguridad y bug bounty**: sus resultados en CyberGym (84,5) y ExploitGym (105 en 2 h, 130 en 6 h) lo sitúan como candidato para análisis de vulnerabilidades en entornos controlados y con supervisión humana.
- **Asistencia a investigación con razonamiento profundo**: HLE w/ Tools alcanza 62,5 con gestión de contexto de 300.000 tokens, lo que permite encadenar búsquedas, lectura de documentos largos y síntesis con verificación.
- **Atención al cliente técnica multi-turno**: la ventana de contexto larga y el control de `reasoning_effort` permiten ajustar latencia frente a profundidad según el tipo de consulta, aunque el soporte lingüístico se limita a inglés y chino.

## Benchmarks y rendimiento

Resultados publicados en la model card (el mejor valor de cada fila en negrita según el autor):

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

Condiciones de evaluación declaradas: HLE w/ Tools con `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con gestión de contexto y GPT-5.6-luna (medium) como juez. NL2Repo con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` y contexto de 1M. No se detallan las condiciones del resto de benchmarks.

## Requisitos de hardware

- **VRAM estimada**: con 753 mil millones de parámetros y pesos en fp8 (1 byte por parámetro), el peso del modelo ocupa aproximadamente 750 GB. En bf16 serían unos 1,5 TB. A esto hay que sumar la caché KV, que en contextos de cientos de miles de tokens es significativa.
- **GPU recomendadas**: no es desplegable en una sola GPU convencional. Requiere clústeres multi-nodo con aceleradores de memoria alta (H100/H200, B200 o equivalentes) o plataformas Ascend NPU, soportadas explícitamente.
- **Consumer GPU**: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) en su forma publicada. Sería necesaria una cuantización agresiva no oficial y, aun así, el tamaño lo hace inviable en una sola tarjeta.
- **Opciones de despliegue**: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y, en Ascend NPU, vLLM-Ascend, xLLM y SGLang. KTransformers está orientado a despliegues con offloading en CPU/DRAM.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | ~753 B (MoE) | hasta 1M en evaluación (no confirmado como máximo) | `glm-5.3` (other) | Pesos abiertos en HF | SOTA en CyberGym (84,5) y AutomationBench (48,2) |
| GLM-5.2 | no disponible | no disponible | `glm-5.3` (misma familia) | Pesos abiertos | Peor en todos los benchmarks reportados; base idéntica |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Mejor en Toolathlon (76,5) y SWE-Marathon (48,1) |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Competitivo en NL2Repo (61,1) y Toolathlon (74,1) |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | Inferior en la mayoría de filas reportadas |
| Opus 4.8 | no disponible | no disponible | Propietaria | API | Mejor en NL2Repo (69,7) y SWE-Marathon (48,8) |
| GPT-5.6 Sol | no disponible | no disponible | Propietaria | API | Mejor en Terminal Bench, DeepSWE, ExploitGym y HLE w/ Tools |

La model card no aporta parámetros, contexto ni licencia de los competidores; los datos de la columna de rendimiento proceden exclusivamente de la tabla publicada por el autor.

## Limitaciones y advertencias

- **Sesgos**: no se documenta ninguna evaluación de sesgos ni de seguridad en la model card.
- **Alucinación**: no se reportan métricas de factualidad ni de tasa de alucinación; en tareas de generación de código y agentes el riesgo de parches incorrectos o comandos erróneos es real y requiere verificación.
- **Idiomas**: solo inglés y chino. El rendimiento en castellano no está evaluado ni garantizado.
- **Licencia**: licencia propia `glm-5.3` etiquetada como `other`; es imprescindible leer los términos completos antes de uso comercial. No es una licencia OSI estándar.
- **Contexto**: la model card no declara la longitud máxima de contexto soportada; los valores de 300.000 y 1M aparecen solo como configuraciones de evaluación, no como especificación del modelo.
- **Capacidades de ciberseguridad**: el autor reconoce explícitamente que las capacidades ofensivas emergieron más rápido de lo esperado. Su uso en entornos reales sin autorización puede tener implicaciones legales y éticas; debe restringirse a auditorías autorizadas.
- **Reproducibilidad**: el repositorio tiene 65 descargas y 0 likes en el momento de la consulta, y el identificador `hankking/GLM-5.3` no coincide con la organización oficial `zai-org` citada en los enlaces de la model card; conviene verificar la procedencia de los pesos antes de desplegarlos.
- **Hardware**: el tamaño de 755,7 GB en safetensors hace inviable el despliegue fuera de infraestructura de clúster; no hay variantes cuantizadas oficiales más allá de fp8.
- **Parámetros de inferencia**: para reproducir benchmarks debe usarse `reasoning_effort=max` (por defecto), y en chat debe pasarse `clear_thinking=true` explícitamente, ya que por defecto es `false`.

## Enlaces

- HuggingFace: https://huggingface.co/hankking/GLM-5.3
- Repositorio oficial de la familia GLM-5: https://github.com/zai-org/GLM-5
- Paper referenciado (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación de Transformers (`glm_moe_dsa`): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
