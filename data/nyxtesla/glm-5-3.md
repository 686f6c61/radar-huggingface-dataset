# nyxtesla/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala con arquitectura MoE (mixture of experts) desarrollado por Z.ai y distribuido con pesos abiertos. Se trata de una versión centrada en post-entrenamiento: utiliza exactamente el mismo modelo base que GLM-5.2, de modo que todas las mejoras provienen del ajuste fino posterior, con especial énfasis en tareas de código complejas y tareas agénticas de largo horizonte. El repositorio analizado corresponde a una subida de terceros (usuario nyxtesla) en Hugging Face, con los pesos en safetensors y un tamaño total de unos 753 mil millones de parámetros.

Su relevancia actual radica en tres frentes: es según sus autores el modelo abierto más capaz en programación (con una mejora del 50 % respecto a GLM-5.2 en su Z.ai Code Bench y SOTA open-source en Terminal Bench 3.0 y Agents' Last Exam), muestra capacidades emergentes destacadas en ciberseguridad ofensiva (SOTA en CyberGym para descubrimiento de vulnerabilidades), y ofrece control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`. Soporta inglés y chino, se distribuye en formato FP8 y emplea una arquitectura etiquetada como `glm_moe_dsa` (MoE con mecanismo de atención dispersa propia de la familia GLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención dispersa (glm_moe_dsa) |
| Parametros totales | 753.329.940.480 (≈753 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las evaluaciones usan hasta 300.000 tokens, y NL2Repo bajo 1M de contexto) |
| Tipos de cuantizacion | FP8 (formato nativo del repo); otras no disponibles |
| Idiomas soportados | inglés, chino |
| Licencia | GLM-5.3 (licencia propia, "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura transformer de tipo mixture-of-experts, identificada en los metadatos como `glm_moe_dsa`, que combina el enfoque MoE con un mecanismo de atención dispersa característico de las generaciones recientes de la familia GLM. Con 753 mil millones de parámetros totales, el uso de MoE permite activar solo una fracción de los parámetros por token, aunque el número exacto de parámetros activos no está publicado en la información disponible.

El dato más notable del entrenamiento es que GLM-5.3 comparte modelo base con GLM-5.2: la totalidad de las mejoras proviene del post-entrenamiento (los autores no detallan en la model card la composición exacta de datos ni las técnicas concretas, como RLHF o DPO). Este escalado del post-entrenamiento produjo, según Z.ai, el desarrollo emergente de capacidades de ciberseguridad ofensiva más rápido de lo esperado, especialmente en la parte alta de la cadena de explotación de vulnerabilidades. El modelo soporta además control del presupuesto de razonamiento (`reasoning_effort` con niveles `low`, `high` y `max`, siendo `max` el valor por defecto) y un parámetro `clear_thinking` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Programación avanzada: SOTA open-source en Terminal Bench 3.0 y Agents' Last Exam, y mejora del 50 % sobre GLM-5.2 en Z.ai Code Bench.
- Razonamiento configurable: control del presupuesto de "thinking" mediante `reasoning_effort` (`low`/`high`/`max`).
- Tareas agénticas de largo horizonte: resultados destacados en SWE-Marathon, AutomationBench, Toolathlon Verified y PostTrainBench.
- Ciberseguridad ofensiva: descubrimiento de vulnerabilidades (SOTA en CyberGym) y explotación (ExploitGym, ExploitBench).
- Uso de herramientas en entornos de terminal y CLI (Terminal Bench, ALE-CLI).
- Contexto muy largo: evaluaciones oficiales con hasta 300.000 tokens de contexto y 163.840 tokens de generación máxima; NL2Repo evaluado bajo 1M de contexto.
- Bilingüe: inglés y chino.

## Casos de uso

- Generación y refactorización de código en producción: su liderazgo en Terminal Bench 3.0 y DeepSWE lo hace adecuado para agentes que operan en repositorios reales, ejecutan tests y corrigen fallos de forma autónoma.
- Agentes de ingeniería de software de largo horizonte: benchmarks como SWE-Marathon (42.5) y FrontierSWE (78.1) indican idoneidad para tareas que requieren muchas iteraciones consecutivas sin intervención humana.
- Auditoría y descubrimiento de vulnerabilidades: su SOTA en CyberGym permite integrarlo en pipelines de seguridad para detectar fallos en código antes del despliegue.
- Automatización de flujos de trabajo: su puntuación en AutomationBench (48.2) lo sitúa bien para orquestación de tareas multi-paso con herramientas externas.
- Asistentes de programación en terminal: rendimiento destacado en ALE-CLI y Toolathlon Verified, útil para CLI agents que manipulan sistemas reales.
- Resolución de problemas científicos y de conocimiento con herramientas: HLE w/ Tools de 62.5 lo hace apto para razonamiento profundo asistido con búsqueda y ejecución de código.
- Tareas de contexto muy largo: análisis de repositorios completos o documentación extensa, dado el uso de contexto de 300k tokens (y hasta 1M en NL2Repo) en evaluaciones oficiales.

## Benchmarks y rendimiento

Resultados publicados por Z.ai en la model card (no verificados de forma independiente):

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

Condiciones de evaluación relevantes: HLE w/ Tools usa `temperature=1.0`, `top_p=0.95`, generación máxima de 163.840 tokens y contexto máximo de 300.000 tokens con estrategia de gestión de contexto, con GPT-5.6-luna (medium) como juez. NL2Repo se evaluó con `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k` bajo 1M de contexto, con juicios basados en reglas y en un LLM para prevenir comportamientos maliciosos.

## Requisitos de hardware

- VRAM estimada: con 753 mil millones de parámetros en FP8, el repo ocupa 755,7 GB, por lo que se necesita al menos ese orden de VRAM (o memoria unificada) para carga completa; con cuantizaciones adicionales el requisito bajaría, pero no hay cifras oficiales publicadas.
- GPU recomendadas: clústeres multi-GPU de gama datacenter (H100/H200 o equivalentes con soporte FP8); no hay una configuración oficial publicada.
- Consumer GPU: no es viable en GPUs de consumo (RTX 4090, RTX 5090, etc.) en su formato original; solo cabría con cuantizaciones agresivas no publicadas oficialmente.
- Despliegue soportado oficialmente: SGLang (con cookbook), vLLM (con recipes), TokenSpeed, Transformers (documentación de `glm_moe_dsa`), KTransformers y Unsloth. También hay soporte para Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 | ≈753 B | MoE + atención dispersa (glm_moe_dsa) | no disponible (evaluado hasta 300k/1M) | GLM-5.3 (propia) | Pesos abiertos en Hugging Face |
| GLM-5.2 | no disponible (mismo base) | MoE + atención dispersa | no disponible | GLM (propia) | Pesos abiertos |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Pesos abiertos (según la model card) |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Pesos abiertos (según la model card) |

En los benchmarks publicados por Z.ai, GLM-5.3 supera a GLM-5.2 de forma consistente (por ejemplo, 84.5 frente a 77.2 en CyberGym) y compite de tú a tú con modelos cerrados de frontera como Opus 4.8 y GPT-5.6 Sol en tareas de código y agentes, aunque por detrás de Fable 5 y GPT-5.6 Sol en explotación de vulnerabilidades.

## Limitaciones y advertencias

- Riesgo de uso dual en ciberseguridad: el propio Z.ai reconoce capacidades emergentes de explotación de vulnerabilidades que "más que duplican" a GLM-5.2; su despliegue requiere salvaguardas y revisiones de seguridad estrictas.
- Sesgos: no documentados en la model card; no disponible.
- Alucinaciones: no se publican mediciones específicas; al tratarse de un LLM generativo, el riesgo estándar aplica.
- Idiomas: soporte oficial limitado a inglés y chino; no hay garantía de rendimiento en castellano.
- Contexto: la longitud máxima de contexto no está especificada formalmente; las cifras de 300k y 1M provienen de condiciones de evaluación, no de la ficha técnica.
- Licencia: es una licencia propia ("glm-5.3", etiquetada como "other"); hay que revisar sus términos antes de cualquier uso comercial. Además, este repo concreto es una subida de terceros (nyxtesla), no del canal oficial de Z.ai, por lo que conviene verificar la integridad y procedencia de los pesos.
- Parámetros activos y requisitos de despliegue no publicados: planificar la infraestructura requiere pruebas propias.
- Reproducción de benchmarks: Z.ai indica que hay que usar `reasoning_effort=max` (por defecto) y, en escenarios de chat, pasar `clear_thinking=true` explícitamente; usar otros valores degrada los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nyxtesla/GLM-5.3
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM: https://github.com/vllm-project/vllm
- Recipes de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Transformers (doc de glm_moe_dsa): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Paper (arXiv referenciado en tags): arxiv:2602.15763
