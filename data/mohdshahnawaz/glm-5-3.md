# mohdShahnawaz/GLM-5.3

## Resumen

GLM-5.3 es el modelo insignia de Z.ai (Zhipu AI) dentro de la serie GLM-5, orientado a programación compleja y tareas agénticas de horizonte largo. Se trata de un transformer con mezcla de expertos (MoE) de 753.329.940.480 parámetros totales y aproximadamente 40.000 millones de parámetros activos por token, con una ventana de contexto de un millón de tokens. La model card oficial indica que reutiliza exactamente el mismo modelo base que GLM-5.2 y que todas las mejoras provienen de la fase de post-entrenamiento.

El modelo resuelve el problema del trabajo autónomo prolongado: sesiones de ingeniería de software que requieren decenas o cientos de pasos, uso intensivo de herramientas, ejecución en terminal y razonamiento sostenido sobre repositorios grandes. Z.ai declara una mejora del 50% respecto a GLM-5.2 en su banco interno Z.ai Code Bench y estado del arte en pesos abiertos en Terminal Bench 3.0 y Agents' Last Exam. Además, el escalado del post-entrenamiento produjo lo que el autor describe como capacidad cibernética emergente: GLM-5.3 lidera CyberGym para descubrimiento de vulnerabilidades y más que duplica a GLM-5.2 en pruebas de explotación.

Es relevante ahora porque combina pesos abiertos, contexto de 1M de tokens y pesos nativos en FP8, lo que lo sitúa en la categoría de modelos frontera desplegables en infraestructura propia, algo que hasta hace poco quedaba reservado a APIs cerradas. La licencia declarada en el repositorio es específica ("glm-5.3", etiquetada como `other`), aunque otras fuentes web la describen como MIT, una discrepancia que conviene verificar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), clase de arquitectura `glm_moe_dsa` en transformers |
| Parámetros totales | 753.329.940.480 (unos 753,3 mil millones) |
| Parámetros activos | Aproximadamente 40.000 millones por token (según Modal Model Library; no consta en la model card) |
| Longitud de contexto | 1.000.000 de tokens (1M). En la evaluación de HLE w/ Tools se empleó una ventana máxima de 300.000 tokens con estrategia de gestión de contexto |
| Tipos de cuantización | FP8 nativo (etiqueta `fp8`). No se detallan otros formatos en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh), según la model card |
| Licencia | `glm-5.3` (etiquetada como `license: other` en HuggingFace). OpenLM.ai la describe como MIT: existe contradicción entre fuentes |
| Formato de pesos | safetensors (tamaño de repositorio: 755,7 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de la etiqueta `glm_moe_dsa` registrada en transformers, que corresponde a una arquitectura transformer con mezcla de expertos y atención dispersa (sparse attention). El dato más relevante es que GLM-5.3 no introduce un modelo base nuevo: comparte base con GLM-5.2 y el 100% de la ganancia declarada proviene del post-entrenamiento. No se publican en la información disponible ni el número de tokens de preentrenamiento, ni la composición del dataset, ni si se emplearon técnicas concretas de RLHF o DPO; solo se indica que el escalado del post-entrenamiento fue el motor de las mejoras.

La innovación destacable es el control explícito del presupuesto de razonamiento mediante el parámetro `reasoning_effort`, con tres niveles: `low`, `high` y `max`. El valor por defecto es `max` (y también se aplica `max` si se pasa cualquier otro valor), lo que implica que cualquier uso en producción debe fijar el nivel de forma explícita si se busca reducir coste o latencia. En la plantilla de chat, `clear_thinking` tiene valor por defecto `false`, y la documentación recomienda pasar `clear_thinking=true` en escenarios conversacionales. Otra consecuencia del post-entrenamiento es la capacidad cibernética emergente: el autor reporta que las ganancias son mayores cuanto más arriba se sitúa la tarea en la cadena de explotación, con más del doble de rendimiento que GLM-5.2 en benchmarks de explotación.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento controlable mediante `reasoning_effort` (`low`, `high`, `max`).
- Programación avanzada: resolución de tareas de ingeniería de software en repositorios, con estado del arte en pesos abiertos declarado en Terminal Bench 3.0 y Agents' Last Exam.
- Capacidad agéntica de horizonte largo: ejecución de tareas multi-paso con uso sostenido de herramientas, medida en DeepSWE, SWE-Marathon y NL2Repo.
- Uso de herramientas y function calling: evaluado en Toolathlon Verified (73,0) y AutomationBench v1.0.6 (48,2).
- Automatización de terminal y CLI, con resultados de 88,2 en Terminal Bench 2.1.
- Capacidad cibernética orientada a descubrimiento de vulnerabilidades (CyberGym 84,5) y explotación (ExploitGym, ExploitBench).
- Razonamiento asistido por herramientas en tareas de conocimiento exigente (HLE w/ Tools: 62,5).
- Soporte multilingüe limitado a inglés y chino según la model card; no se declara soporte oficial de castellano.

## Casos de uso

- Agente de ingeniería de software autónomo: el modelo puede recibir un issue o una especificación y trabajar sobre un repositorio durante cientos de pasos, ejecutando comandos, editando ficheros y validando resultados. Sus 1M de tokens de contexto permiten mantener a la vista un volumen amplio de código sin fragmentar la tarea en exceso.
- Migración y refactorización de código heredado: con NL2Repo (58,0) y ProgramBench (19,0, categoría "almost solved") como referencia, es adecuado para traducir descripciones en lenguaje natural a repositorios ejecutables y para reestructurar módulos grandes.
- Automatización de CI/CD y mantenimiento de dependencias: integrado mediante tool calling, puede leer fallos de pipeline, proponer parches y abrir pull requests, con el nivel `low` o `high` de `reasoning_effort` para contener el coste en tareas rutinarias.
- Auditoría de seguridad y triaje de vulnerabilidades: con CyberGym en 84,5, encaja en flujos de análisis estático y dinámico para localizar y priorizar fallos. Requiere supervisión humana estricta dado el riesgo dual de la capacidad de explotación.
- Agente de operaciones sobre terminal: Terminal Bench 2.1 (88,2) y AutomationBench (48,2) lo sitúan como candidato para tareas de administración de sistemas, despliegue y diagnóstico guiado por comandos.
- Asistente de análisis con recuperación de documentación extensa: la ventana de 1M tokens permite ingerir manuales técnicos, normativa o contratos completos y responder consultas sobre ellos sin troceado, útil en entornos legales o de compliance.
- Investigación asistida con herramientas externas: HLE w/ Tools (62,5) lo hace válido para pipelines que combinan búsqueda, ejecución de código y verificación de resultados en dominios científicos.
- Generación de tests y cobertura: dentro de un agente de codificación, puede inspeccionar un módulo, inferir casos límite y escribir suites de pruebas, aprovechando el soporte de ejecución de herramientas para validarlas.

## Benchmarks y rendimiento

Resultados publicados en la model card de Z.ai:

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (con fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | 88,8 |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | 34,6 |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | 72,7 |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | 69,7 | – | – |
| ProgramBench (almost solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | 33,0 | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | 88,2 | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | 48,8 | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | 41,8 | 36,2 |
| CyberGym | 84,5 | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2 h / 6 h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | 216 / 293 |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | 78,0 | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | 76,5 | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | 48,2 | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | 28,6 |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | 64,5 |
| GDPval-AA v2 | 1769 | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Notas de reproducción publicadas: en HLE w/ Tools se usaron `temperature=1.0` y `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con gestión de contexto y GPT-5.6-luna (medium) como modelo juez. En NL2Repo se usaron `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` con contexto de 1M, con filtros basados en reglas y en un LLM para impedir comportamientos maliciosos. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Peso de los parámetros en FP8: aproximadamente 753 GB de VRAM solo para los pesos, coherente con un repositorio de 755,7 GB. En BF16 serían unos 1,5 TB.
- Estimación de despliegue en FP8: se necesitan al menos 800-900 GB de memoria agregada contando caché KV y overhead, es decir, 8 GPU H200 (141 GB cada una, 1128 GB) o 16 GPU H100 de 80 GB (1280 GB). Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el fabricante.
- Cuantización agresiva (4 bits, ~0,5 bytes por parámetro): unos 377 GB de pesos, todavía fuera del alcance de GPU de consumo y de estaciones con 4×RTX 5090.
- GPU de consumo: no cabe. Ni en una RTX 4090 (24 GB) ni en configuraciones multi-GPU domésticas razonables. Se requiere clúster o instancia cloud con nodos de 8 GPU.
- Caché KV con contexto de 1M: muy voluminosa; el propio autor aplica gestión de contexto y limita a 300.000 tokens en algunas evaluaciones, lo que sugiere que el contexto completo exige técnicas explícitas de recorte o compresión.
- Opciones de despliegue documentadas: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y, en plataforma Ascend NPU, vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Referencia de rendimiento |
|---|---|---|---|---|---|
| GLM-5.3 | 753,3 mil millones (MoE, ~40 mil millones activos) | 1M tokens | glm-5.3 (`other`); MIT según OpenLM.ai | Abiertos en HuggingFace | Terminal Bench 3.0: 28,3; CyberGym: 84,5 |
| GLM-5.2 | No disponible (misma base que GLM-5.3) | No disponible | No disponible | Abiertos | Terminal Bench 3.0: 4,6; CyberGym: 77,2 |
| Kimi K3 | No disponible | No disponible | No disponible | No disponible | Terminal Bench 3.0: 17,4; DeepSWE: 67,5 |
| DeepSeek-V4 Pro-0813 | No disponible | No disponible | No disponible | No disponible | NL2Repo: 61,1; CyberGym: 83,3 |
| Qwen3.8-Max | No disponible | No disponible | No disponible | No disponible | Terminal Bench 2.1: 86,6; GDPval-AA v2: 1739 |
| Opus 4.8 | No disponible | No disponible | Propietaria | Solo API | NL2Repo: 69,7; SWE-Marathon: 48,8 |
| GPT-5.6 Sol | No disponible | No disponible | Propietaria | Solo API | Terminal Bench 3.0: 34,6; ExploitGym (6 h): 293 |

La comparación relevante para pesos abiertos es frente a GLM-5.2: con la misma base, GLM-5.3 multiplica por más de seis el resultado en Terminal Bench 3.0 (4,6 a 28,3) y más que duplica ExploitBench (24,4 a 54,4). Frente a los modelos propietarios de la tabla, GLM-5.3 lidera CyberGym y GDPval-AA v2, pero queda por detrás de Fable 5 y GPT-5.6 Sol en tareas de explotación y en Terminal Bench 3.0.

## Limitaciones y advertencias

- Contradicción de licencia: el repositorio de HuggingFace declara `license: other` con nombre `glm-5.3`, mientras que una fuente secundaria (OpenLM.ai) afirma licencia MIT. Es imprescindible verificar los términos reales antes de uso comercial.
- El repositorio consultado no pertenece a la organización oficial de Z.ai: el identificador `mohdShahnawaz/GLM-5.3` corresponde a un tercero, con 0 descargas y 0 likes. Para producción debe usarse el repositorio oficial `zai-org/GLM-5.3`.
- Idioma: la model card solo declara inglés y chino. El rendimiento en castellano no está documentado y no debería asumirse paridad con esos dos idiomas.
- Riesgo de alucinación: no se publican tasas de fidelidad ni evaluaciones de veracidad. En un modelo optimizado para agentes y ejecución de comandos, una alucinación puede traducirse en acciones reales sobre el sistema, con impacto operativo.
- Capacidad cibernética dual: el modelo es estado del arte declarado en descubrimiento de vulnerabilidades y explotación. Su uso para pruebas de intrusión debe contar con autorización explícita y controles de acceso; las capacidades de explotación superan ampliamente a su predecesor.
- Coste de inferencia muy alto: 753 mil millones de parámetros exigen clústeres multi-GPU. El valor por defecto `reasoning_effort=max` incrementa el gasto en tokens generados; en producción conviene fijar `low` o `high` explícitamente.
- Configuración del chat template: `clear_thinking` es `false` por defecto, lo que puede arrastrar razonamiento previo entre turnos. Hay que pasar `clear_thinking=true` en conversaciones.
- Contexto efectivo frente a contexto nominal: aunque se anuncia 1M de tokens, las evaluaciones publicadas usan 300.000 tokens con gestión de contexto y 64k de generación máxima en NL2Repo, lo que sugiere degradación o límites prácticos antes del millón.
- Sesgos conocidos: no disponible. No se publica ninguna evaluación de sesgo, toxicidad o equidad.
- Ausencia de benchmarks clásicos: no hay datos de MMLU, GSM8K, HumanEval ni similares, lo que dificulta comparar con modelos fuera de la familia agéntica.

## Enlaces

- HuggingFace (repositorio consultado, no oficial): https://huggingface.co/mohdShahnawaz/GLM-5.3
- Repositorio oficial en GitHub: https://github.com/zai-org/GLM-5
- Documentación oficial de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Ficha en OpenLM.ai: https://openlm.ai/glm-5.3/
- Modal Model Library: https://modal.com/library/zai/glm-5-3
- NVIDIA NIM (model card): https://build.nvidia.com/z-ai/glm-5-3/modelcard
- NVIDIA NIM (variante flash): https://build.nvidia.com/z-ai/glm-5-3-flash
- SGLang, receta de despliegue: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM, recetas: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación de transformers para `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- KTransformers, tutorial: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Unsloth, guía del modelo: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- arXiv referenciado en las etiquetas del repositorio: arXiv:2602.15763 (título no disponible en la información proporcionada)
