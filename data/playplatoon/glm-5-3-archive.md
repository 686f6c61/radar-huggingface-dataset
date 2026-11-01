# playplatoon/GLM-5.3-Archive

## Resumen

GLM-5.3 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Z.ai (zai-org), publicado en HuggingFace bajo el identificador `playplatoon/GLM-5.3-Archive`. Con 753.329.940.480 parámetros totales (aproximadamente 753 mil millones), es un modelo de gran escala orientado a generación de texto, razonamiento y, de forma destacada, tareas de codificación compleja y agentes autónomos de largo horizonte. La arquitectura declarada es `glm_moe_dsa`, lo que indica un transformer MoE con atención dispersa (DeepSeek Sparse Attention o similar), y el repositorio ocupa 755,7 GB en formato safetensors con cuantización fp8.

El modelo reutiliza la misma base que GLM-5.2 y todas sus mejoras provienen exclusivamente del post-entrenamiento, según la model card. Sus avances más notables son en codificación (mejora del 50 % sobre GLM-5.2 en el benchmark interno Z.ai Code Bench) y en capacidades emergentes de ciberseguridad, donde alcanza SOTA en CyberGym para descubrimiento de vulnerabilidades y duplica a GLM-5.2 en benchmarks de explotación. También obtiene resultados de referencia entre modelos de pesos abiertos en Terminal Bench 3.0 y Agents' Last Exam.

Es relevante ahora porque compite directamente con modelos propietarios de frontera (Opus 4.8, GPT-5.6 Sol, Fable 5) en tareas agénticas y de ingeniería de software, manteniendo pesos abiertos y soporte para despliegue local en SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth. Su licencia es propia (`glm-5.3`), no estándar, lo que exige revisión legal antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (`glm_moe_dsa`) |
| Parametros totales | 753.329.940.480 (~753 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como valor nominal; en evaluación se usó hasta 1M tokens (NL2Repo) y 300.000 tokens con gestión de contexto (HLE w/ tools) |
| Tipos de cuantizacion | fp8 (pesos publicados); otras cuantizaciones vía Unsloth/llama.cpp no confirmadas |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other, licencia propia de Z.ai) |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture of Experts con atención dispersa, identificada en los tags como `glm_moe_dsa`. El modelo comparte la base con GLM-5.2, por lo que la arquitectura y el preentrenamiento son idénticos; todas las ganancias de GLM-5.3 provienen de la fase de post-entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO, aunque la model card menciona que el escalado del post-entrenamiento produjo capacidades emergentes de ciberseguridad.

Entre las innovaciones destacables está el control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`, que acepta tres niveles (`low`, `high`, `max`, con `max` por defecto). La plantilla de chat incluye el parámetro `clear_thinking`, que por defecto es `false` y debe establecerse explícitamente a `true` en escenarios conversacionales. El modelo está diseñado para tareas de largo horizonte, con soporte de contexto de hasta 1M tokens en evaluaciones y estrategias de gestión de contexto para ventanas de 300.000 tokens.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento complejo con modo de pensamiento configurable (`reasoning_effort`: low, high, max).
- Codificación avanzada: SOTA open-source en Terminal Bench 3.0, Agents' Last Exam y mejoras del 50 % en Z.ai Code Bench sobre GLM-5.2.
- Ingeniería de software agéntica: resolución de issues, generación de repositorios (NL2Repo), tareas SWE de largo horizonte (SWE-Marathon, FrontierSWE).
- Uso de herramientas y function calling: evaluado en Toolathlon Verified y AutomationBench.
- Razonamiento multi-paso con herramientas externas (HLE w/ Tools).
- Capacidades de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitGym, ExploitBench).
- Automatización de tareas CLI y agentes de terminal (Terminal Bench 2.1/3.0, ALE-CLI).
- Despliegue local en SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth; soporte para Ascend NPU.

## Casos de uso

- **Ingeniería de software agéntica en producción**: el modelo puede resolver issues de repositorios reales y ejecutar tareas de terminal de múltiples pasos, integrándose en pipelines CI/CD para corrección automática de bugs y generación de parches, gracias a sus resultados en SWE-Marathon y Terminal Bench 3.0.
- **Generación de repositorios completos a partir de lenguaje natural**: con NL2Repo (58,0) puede transformar especificaciones en código estructurado, útil para prototipado rápido y scaffolding de proyectos.
- **Auditoría de seguridad y descubrimiento de vulnerabilidades**: su SOTA en CyberGym (84,5) lo hace adecuado para análisis estático y dinámico de código en busca de fallos de seguridad, así como para pruebas de penetración automatizadas en entornos controlados.
- **Automatización de operaciones en terminal**: con Terminal Bench 2.1 (88,2) y ALE-CLI (28,5) puede gestionar sesiones de shell, administración de sistemas y tareas de DevOps de largo horizonte.
- **Atención al cliente técnica multi-turno**: su ventana de contexto extensa (hasta 300.000 tokens en evaluación) permite mantener conversaciones con historiales largos y documentación técnica adjunta, en inglés y chino.
- **Agentes de automatización de flujos de trabajo**: evaluado en AutomationBench (48,2, el mejor de la tabla), puede orquestar herramientas y APIs en procesos empresariales multi-paso.
- **Asistencia en investigación con herramientas**: HLE w/ Tools (62,5) indica capacidad para razonamiento científico asistido por búsqueda y cálculo externos.
- **Evaluación de riesgos de explotación**: ExploitGym y ExploitBench permiten su uso en investigación de seguridad ofensiva y defensiva en entornos aislados.

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

Notas de evaluación: HLE w/ tools usó `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens y contexto máximo de 300.000 tokens con gestión de contexto, con GPT-5.6-luna (medium) como juez. NL2Repo se evaluó con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` y contexto de 1M, con filtros anti-hacking basados en reglas y LLM. DeepSWE se ejecutó con mini-swe-agent.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753 mil millones de parámetros en fp8, los pesos ocupan aproximadamente 753 GB, por lo que se requiere un nodo multi-GPU de alta gama. No se dispone de estimaciones oficiales para cuantizaciones de 4 bits u 8 bits adicionales.
- GPU recomendadas: nodos con múltiples H100 (80 GB), H200 o A100 (80 GB); se requieren al menos 10 GPU de 80 GB solo para alojar los pesos en fp8, más espacio para KV cache y activaciones.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU profesional.
- Opciones de despliegue: SGLang (cookbook oficial), vLLM (recipes oficiales), TokenSpeed, Transformers, KTransformers (con tutorial para GLM-5.2 aplicable), Unsloth, y en plataforma Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| GLM-5.3 | ~753B (MoE) | hasta 1M en evaluación | `glm-5.3` (propia) | Pesos abiertos en HF | SOTA open-source en Terminal Bench 3.0, CyberGym, AutomationBench, GDPval-AA v2 |
| GLM-5.2 | ~753B (MoE, misma base) | no disponible | `glm-5.2` (propia) | Pesos abiertos | Peor en todas las métricas de post-entrenamiento; misma arquitectura |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Mejor en Toolathlon (76,5); competitivo en DeepSWE y Terminal Bench 2.1 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Mejor en NL2Repo (61,1); cercano en CyberGym (83,3) |
| Opus 4.8 (propietario) | no disponible | no disponible | propietaria | API | Mejor en NL2Repo (69,7) y SWE-Marathon (48,8) |
| GPT-5.6 Sol (propietario) | no disponible | no disponible | propietaria | API | Mejor en Terminal Bench 3.0, DeepSWE, ExploitGym, HLE w/ Tools |

GLM-5.3 se posiciona como el modelo de pesos abiertos más fuerte en tareas agénticas de terminal y ciberseguridad, superando a alternativas propietarias en CyberGym, AutomationBench y GDPval-AA v2, aunque por detrás de GPT-5.6 Sol y Fable 5 en explotación y en algunos benchmarks de SWE.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se declara soporte multilingüe amplio.
- Licencia propia `glm-5.3` (license: other): es imprescindible revisar los términos legales antes de cualquier uso comercial, ya que no es una licencia OSI estándar.
- Riesgo de alucinación inherente a modelos de gran escala; no se documentan tasas específicas en la información disponible.
- Capacidades emergentes de ciberseguridad ofensiva (ExploitGym, ExploitBench): su uso para pruebas de penetración o explotación debe restringirse a entornos autorizados y aislados, dado el potencial de uso dual.
- El tamaño del repositorio (755,7 GB) y los requisitos de VRAM (más de 750 GB en fp8) limitan el despliegue a infraestructura de datacenter; no es viable en hardware de consumo.
- El parámetro `clear_thinking` por defecto es `false`; en producción conversacional debe pasarse explícitamente `true` para evitar fugas del razonamiento interno.
- El parámetro `reasoning_effort` por defecto es `max`; valores no reconocidos también caen en `max`, lo que puede incrementar latencia y coste si no se configura explícitamente.
- No se publican detalles sobre sesgos, composición del dataset de entrenamiento ni pipeline de alineación, lo que dificulta la evaluación de riesgos.
- El identificador del repositorio (`playplatoon/GLM-5.3-Archive`) sugiere una réplica o archivo de un modelo original de Z.ai; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.

## Enlaces

- HuggingFace: https://huggingface.co/playplatoon/GLM-5.3-Archive
- Repositorio oficial de Z.ai GLM-5: https://github.com/zai-org/GLM-5
- SGLang: https://github.com/sgl-project/sglang
- Cookbook SGLang GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recipes vLLM GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recipes TokenSpeed GLM-5.3: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Transformers: https://github.com/huggingface/transformers
- Documentación Transformers glm_moe_dsa: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial KTransformers GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guía Unsloth GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Paper de referencia (arXiv): arXiv:2602.15763
