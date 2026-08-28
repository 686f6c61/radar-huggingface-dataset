# servantofares/GLM-5.3

## Resumen

GLM-5.3 es el modelo insignia de Z.ai, lanzado en agosto de 2026, que utiliza la misma base que GLM-5.2 y concentra todas sus mejoras en el post-entrenamiento. Según sus desarrolladores, es el modelo open-weights más capaz para codificación, con una mejora del 50 % respecto a GLM-5.2 en su benchmark interno Z.ai Code Bench, y alcanza resultados de estado del arte en Terminal Bench 3.0 y Agents' Last Exam. Además, presenta capacidades emergentes en ciberseguridad ofensiva, duplicando el rendimiento de GLM-5.2 en benchmarks de explotación de vulnerabilidades.

Con 753 329 940 480 parámetros totales (~753B) en arquitectura MoE con atención dual sparse (DSA), soporta una ventana de contexto de hasta 1 millón de tokens y está disponible en pesos FP8. El modelo se distribuye bajo una licencia personalizada (glm-5.3) y se puede desplegar localmente con SGLang, vLLM, Transformers, KTransformers, Unsloth y otros frameworks. Su relevancia actual radica en que combina razonamiento explícito controlable (parámetro `reasoning_effort`) con capacidades de agente de largo alcance, lo que lo posiciona como una alternativa viable a modelos propietarios de frontera en tareas de ingeniería de software compleja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención dual sparse (glm_moe_dsa) |
| Parametros totales | 753 329 940 480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1 000 000 tokens (1M) |
| Tipos de cuantizacion | FP8 (checkpoint oficial); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | glm-5.3 (licencia personalizada, no OSI) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura MoE (mixture of experts) con atención dual sparse (DSA, por sus siglas en inglés), un diseño que combina atención densa y dispersa para gestionar ventanas de contexto muy largas (hasta 1M tokens) de forma eficiente. El modelo comparte la base preentrenada de GLM-5.2; todas las ganancias de rendimiento provienen de la fase de post-entrenamiento, que incluye ajuste fino supervisado y optimización por preferencias (RLHF/DPO), aunque no se han publicado detalles específicos sobre la composición del dataset ni el número de tokens de entrenamiento.

El post-entrenamiento se ha escalado hasta el punto de generar capacidades emergentes en ciberseguridad ofensiva, un resultado que los propios autores reconocen como inesperado. El modelo soporta un modo de razonamiento explícito controlable mediante el parámetro `reasoning_effort` (niveles `low`, `high` y `max`), y en el chat template se puede activar `clear_thinking` para limpiar el razonamiento interno en escenarios conversacionales. No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento explícito (thinking mode) controlable por el usuario.
- Codificación avanzada: estado del arte open-weights en benchmarks de terminal (Terminal Bench 3.0) y resolución de issues reales (DeepSWE, FrontierSWE, SWE-Marathon).
- Capacidades de agente de largo alcance: ejecución de tareas multi-paso con herramientas, verificación y corrección autónoma (AutomationBench, Toolathlon).
- Soporte de tool calling / function calling, validado en benchmarks como Toolathlon Verified.
- Capacidades emergentes de ciberseguridad ofensiva: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitGym, ExploitBench).
- Multilingüe limitado a inglés y chino; no se documentan otros idiomas.
- Control de presupuesto de razonamiento mediante `reasoning_effort` para ajustar latencia y consumo de tokens.

## Casos de uso

- Ingeniería de software autónoma: el modelo puede resolver issues reales de repositorios (DeepSWE 66.9, FrontierSWE 78.1) generando parches completos, ejecutando tests y corrigiendo fallos, lo que lo hace adecuado para integrarse en pipelines de CI/CD como asistente de resolución de bugs.
- Agentes de terminal y operaciones de sistemas: con un 28.3 en Terminal Bench 3.0 (frente al 4.6 de GLM-5.2), puede ejecutar comandos, navegar por el sistema de archivos y completar tareas administrativas de larga duración.
- Generación y refactorización de código en producción: su mejora del 50 % en Z.ai Code Bench y su soporte de tool calling permiten usarlo en asistentes de programación integrados en IDEs o en servicios de autocompletado de alto nivel.
- Auditoría de seguridad ofensiva (red teaming): sus capacidades en CyberGym (84.5) y ExploitBench (54.4) lo convierten en una herramienta para identificar y explotar vulnerabilidades en entornos controlados, acelerando el trabajo de equipos de seguridad.
- Automatización de tareas empresariales de largo alcance: con AutomationBench (48.2) puede gestionar flujos de trabajo complejos que requieren planificación, uso de APIs y verificación de resultados, como la generación de informes o la gestión de incidencias.
- Investigación y análisis con contexto muy largo: su ventana de 1M tokens permite procesar repositorios completos, documentación extensa o logs de sistemas en una sola pasada, facilitando el análisis de código legacy o la revisión de arquitecturas.
- Chat conversacional bilingüe (inglés/chino) con razonamiento opcional: útil para asistentes virtuales que requieran respuestas razonadas en tareas de soporte técnico o educación.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card oficial de Z.ai. Se comparan con modelos propietarios y open-weights de referencia. Valores más altos son mejores salvo indicación contraria.

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88.2 | 81.0 | 88.3 | 87.9 | 86.6 | 85.0 | 88.0 | **88.8** |
| Terminal Bench 3.0 | 28.3 | 4.6 | 17.4 | – | – | 21.1 | 33.7 | **34.6** |
| DeepSWE (v1.1) | 66.9 | 46.2 | 67.5 | 62.7 | 56.6 | 58.0 | 69.7 | **72.7** |
| NL2Repo | 58.0 | 48.9 | 58.0 | 61.1 | 55.9 | **69.7** | – | – |
| ProgramBench (Almost Solved) | 19.0 | 9.5 | 17.5 | – | 10.5 | 15.5 | **33.0** | 23.0 |
| FrontierSWE | 78.1 | 67.5 | – | – | – | 66.5 | **88.2** | – |
| SWE-Marathon (v1.1) | 42.5 | 19.4 | 48.1 | – | – | **48.8** | 33.1 | 42.5 |
| PostTrainBench | 39.8 | 31.7 | 32.0 | – | – | 32.9 | **41.8** | 36.2 |
| CyberGym | **84.5** | 77.2 | 80.0 | 83.3 | 78.5 | 78.1 | 83.8 | 83.6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54.4 | 24.4 | 32.2 | – | 28.8 | 40.0 | **78.0** | 76.5 |
| Toolathlon Verified | 73.0 | 59.9 | **76.5** | 74.1 | 72.5 | 76.2 | 74.7 | 74.9 |
| AutomationBench (v1.0.6) | **48.2** | 26.2 | 46.7 | 43.2 | 39.8 | 41.0 | 46.2 | 45.8 |
| Agents' Last Exam (ALE-CLI) | 28.5 | 23.8 | 27.6 | 25.7 | 27.0 | 25.7 | 23.8 | **28.6** |
| HLE w/ Tools | 62.5 | 54.7 | 59.8 | 60.0 | 56.2 | 57.9 | 63.9 | **64.5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Notas metodológicas del autor: HLE w/ Tools se evalúa con `temperature=1.0`, `top_p=0.95`, generación máxima de 163 840 tokens y contexto de 300 000 tokens con estrategia de gestión de contexto. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` y contexto de 1M. El resto de benchmarks no especifica hiperparámetros en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 de 753B parámetros requiere aproximadamente 753 GB solo para los pesos, más overhead de activaciones y KV cache. Con contexto de 1M tokens, la memoria necesaria supera ampliamente el 1 TB.
- GPU recomendadas: no se han publicado requisitos oficiales. Para inferencia en FP8 se necesitarían al menos 8 GPU H100 de 80 GB (640 GB totales) o 10 GPU H100 para margen de contexto; alternativas con H200 (141 GB) o B200 reducirían el número de nodos.
- No es viable en GPU de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo individuales; requiere clústeres multi-GPU o servicios cloud.
- Opciones de despliegue: SGLang (con cookbook oficial), vLLM (con recipes), TokenSpeed, Transformers (soporte nativo `glm_moe_dsa`), KTransformers, Unsloth y frameworks para Ascend NPU (vLLM-Ascend, xLLM, SGLang).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño y el modo de razonamiento explícito, se espera una latencia alta en tareas complejas; el parámetro `reasoning_effort` permite reducir el presupuesto de razonamiento para mejorar la velocidad.

## Comparativa con modelos similares

La comparación se limita a modelos de la misma familia y a alternativas open-weights de tamaño comparable, según los datos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|
| GLM-5.3 | ~753B (MoE) | 1M | glm-5.3 (personalizada) | Terminal Bench 3.0: 28.3; CyberGym: 84.5; AutomationBench: 48.2 |
| GLM-5.2 | ~753B (MoE, misma base) | 1M (presumible) | glm-5.2 (personalizada) | Terminal Bench 3.0: 4.6; CyberGym: 77.2; AutomationBench: 26.2 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible (probablemente propietaria) | Terminal Bench 2.1: 87.9; Toolathlon: 74.1; CyberGym: 83.3 |
| Kimi K3 | no disponible | no disponible | propietaria | Terminal Bench 2.1: 88.3; DeepSWE: 67.5; Toolathlon: 76.5 |

GLM-5.3 supera claramente a su predecesor GLM-5.2 en todas las tareas de agente y codificación, con mejoras especialmente marcadas en Terminal Bench 3.0 (28.3 vs 4.6) y ExploitBench (54.4 vs 24.4). Frente a modelos propietarios como Kimi K3 o DeepSeek-V4 Pro, GLM-5.3 ofrece un rendimiento competitivo en la mayoría de benchmarks y lo supera en ciberseguridad ofensiva y automatización, con la ventaja de ser open-weights. No se dispone de datos de parámetros ni contexto para los modelos propietarios, por lo que la comparación directa de especificaciones no es posible.

## Limitaciones y advertencias

- Licencia personalizada (glm-5.3): no es una licencia open source estándar (OSI). Antes de uso comercial, es imprescindible revisar los términos exactos de la licencia, que pueden restringir ciertos usos, especialmente en el ámbito de la ciberseguridad ofensiva.
- Capacidades de explotación de vulnerabilidades: el modelo destaca en ciberataques (ExploitGym, ExploitBench). Esto plantea riesgos de uso dual y puede requerir medidas de mitigación en entornos de producción para evitar su uso malintencionado.
- Idiomas limitados: solo inglés y chino. No hay evidencia de rendimiento fiable en español, francés, alemán u otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni de tasa de alucinación. Dado su tamaño y modo de razonamiento, puede generar razonamientos plausibles pero incorrectos en tareas de código o seguridad; se recomienda verificación humana en entornos críticos.
- Coste computacional elevado: con 753B parámetros y contexto de 1M, la inferencia requiere infraestructura de alto coste. El modo `reasoning_effort` por defecto (`max`) incrementa la latencia y el consumo de tokens; para escenarios conversacionales se recomienda `low` o `high`.
- Contexto de 1M: aunque el modelo soporta 1M tokens, los benchmarks de HLE se ejecutan con un máximo de 300 000 tokens, lo que sugiere que el rendimiento puede degradarse en contextos extremadamente largos. La gestión de contexto es crítica.
- Datos de entrenamiento no publicados: no se ha revelado la composición del dataset de post-entrenamiento, el número de tokens ni el proceso exacto de alineación, lo que dificulta evaluar su robustez y posibles sesgos.
- Repo de HuggingFace no oficial: el modelo está publicado bajo el usuario `servantofares`, no bajo la organización Z.ai. Aunque los pesos coinciden con los anunciados, se recomienda verificar la integridad de los archivos y descargar desde fuentes oficiales si están disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/servantofares/GLM-5.3
- Blog oficial de Z.ai: https://z.ai/blog/glm-5.3
- Documentación de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- BenchLM (benchmarks y velocidad): https://benchlm.ai/models/glm-5-3
- AI Release Tracker: https://aireleasetracker.com/model/zai/glm-5.3
- Repositorio GitHub de GLM-5 (referenciado en la model card): https://github.com/zai-org/GLM-5
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recipes de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- Documentación de Transformers para `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
