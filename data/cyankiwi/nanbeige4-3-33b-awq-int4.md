# cyankiwi/Nanbeige4.3-33B-AWQ-INT4

## Resumen

Nanbeige4.3-33B-AWQ-INT4 es la versión cuantizada a 4 bits del modelo Nanbeige4.3-33B, un LLM denso de aproximadamente 33 000 millones de parámetros publicado por Nanbeige (laboratorio vinculado a la plataforma de reclutamiento BOSS Zhipin) el 24 de octubre de 2026 bajo licencia Apache 2.0. La cuantización la firma cyankiwi, un proyecto de despliegue de modelos abiertos como endpoints compatibles con la API de OpenAI, y emplea Activation-aware Weight Quantization (AWQ) en precisión INT4 con calibración orientada a dominios STEM y agénticos.

El modelo base está diseñado específicamente para tareas de *agentic coding* y de "cowork" de oficina: ejecución de comandos en terminal, resolución de issues sobre repositorios reales, automatización de flujos administrativos y uso intensivo de herramientas. Nanbeige lo posiciona como el modelo profesor de la familia Nanbeige4.3, cuya destilación alimentará versiones pequeñas posteriores (por ejemplo, Nanbeige4.3-3B), y publica una variante Base para post-entrenamiento propio.

Su relevancia actual reside en la combinación de ventana de contexto de 524 288 tokens, licencia permisiva y resultados agénticos que, según la model card, superan a modelos frontera de la misma clase (~30B) en la mayoría de benchmarks de terminal y automatización. Esta ficha cubre la versión AWQ INT4 de 23,29 GB, pensada para servir el modelo en GPUs de 24 GB o en nodos con memoria más holgada cuando se explotan contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin mezcla de expertos), familia Llama segun el tag `llama` del repo |
| Parametros totales | 33 000 M nominales (33B); los metadatos de safetensors del repo declaran 7 749 060 296 (ver advertencias) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524 288 tokens (512K) |
| Tipos de cuantizacion | AWQ INT4 (pesos a 4 bits, activaciones en 16 bits), formato `compressed-tensors` |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (AWQ); no se incluyen GGUF en este repo |

## Arquitectura y entrenamiento

La model card confirma que Nanbeige4.3-33B es un modelo denso de la clase 30B, no una arquitectura MoE ni híbrida, y que se distribuye junto a una variante Base destinada a post-entrenamiento personalizado. El modelo se ha optimizado para razonamiento agéntico de varios pasos: la evaluación se realiza "al máximo esfuerzo de thinking", lo que implica un modo de razonamiento extendido antes de emitir la respuesta o la llamada a herramienta. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o RL con verificación de ejecución.

El dato técnico más relevante del artefacto es la cuantización: cyankiwi aplica AWQ INT4 con un conjunto de calibración específico de dominios STEM y agénticos, lo que busca preservar el rendimiento en código, matemáticas y uso de herramientas en lugar de optimizar solo perplejidad genérica en texto conversacional. El resultado son 23,29 GB de pesos que reducen aproximadamente a la mitad el espacio frente a BF16, a costa de una pérdida de precisión no cuantificada públicamente en esta model card (no se publican métricas comparativas BF16 vs. INT4).

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de *thinking* de esfuerzo configurable.
- Codificación agéntica: edición de repositorios, ejecución de comandos de shell, interpretación de salida de terminal y corrección iterativa de errores (evaluado en Terminal-Bench, SWE-Bench Pro, DeepSWE y NL2Repo).
- Uso de herramientas y *function calling*: Toolathlon-Verified (70,4) y Claw-Eval pass^3 (78,3) apuntan a encadenamiento fiable de llamadas a herramientas en tareas largas.
- Automatización de tareas de oficina y "cowork" profesional: suites Automation Bench, JobBench y GDPval, orientadas a flujos ofimáticos y entregables de consultoría.
- Planificación de tareas extensas: DeepPlanning y SkillsBench miden descomposición y ejecución de planes con múltiples habilidades.
- Comprensión de código científico y numérico: Sci-code (52,6) y calibración STEM sugieren buen desempeño en cálculo técnico.
- Capacidades multilingües limitadas a ingles y chino; no se declara soporte de castellano.
- Visión y audio: no disponible (el pipeline declarado es únicamente `text-generation`).

## Casos de uso

- Agentes de codificación en terminal: el modelo puede recibir un objetivo en lenguaje natural, inspeccionar un repositorio, ejecutar tests y aplicar parches iterativos; sus 80,9 puntos en Terminal-Bench 2.1 lo sitúan como opción para automatizar tareas de mantenimiento dentro de un contenedor con acceso a shell.
- Resolución de issues en producción: integrado en un pipeline tipo CI (por ejemplo, un bot que abre PRs), su rendimiento en SWE-Bench Pro (60,3) y DeepSWE (65,5) permite delegar correcciones de bugs acotados y revisables por un humano.
- Automatización de back-office: con Automation Bench (54,2) y JobBench (44,8), encaja en flujos de extracción, cumplimentación y validación de documentos administrativos donde el modelo orquesta herramientas en lugar de generar texto libre.
- Análisis de repositorios y documentación extensa: la ventana de 524 288 tokens permite cargar árboles de código completos o expedientes largos en una sola pasada, útil para auditorías de seguridad interna o generación de documentación técnica.
- Generación de datos sintéticos para destilación: Nanbeige concibe este modelo como profesor de la familia; un equipo puede usarlo para producir trazas agénticas y pares de instrucción que alimenten modelos pequeños propios.
- Asistente de ingeniería self-hosted: al publicarse en Apache 2.0 y en formato AWQ, puede desplegarse en infraestructura propia con requisitos de privacidad estrictos, sin enviar código propietario a APIs externas.
- Automatización de tareas de oficina asistidas por herramientas ofimáticas: su evaluacion en GDPval (84,8) sugiere calidad cercana a modelos frontera en entregables profesionales de formato largo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo base, con el mismo arnés e hiperparámetros para todos los modelos y al máximo esfuerzo de razonamiento:

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Coding agéntico | Terminal-Bench 2.1 | 80,9 | 73,0 | 61,8 | 47,2 |
| Coding agéntico | Terminal-Bench 4.0 | 23,8 | 6,3 | 1,6 | 0,0 |
| Coding agéntico | DeepSWE | 65,5 | 42,5 | 4,4 | 2,7 |
| Coding agéntico | SWE-Bench Pro | 60,3 | 61,7 | 36,9 | 51,2 |
| Coding agéntico | SWE-Atlas-QnA | 50,8 | 41,9 | 17,7 | 3,3 |
| Coding agéntico | NL2Repo | 53,0 | 48,3 | 27,4 | 33,8 |
| Coding agéntico | Scicode | 52,6 | 46,7 | 44,9 | 45,5 |
| Coding agéntico | SkillsBench | 61,1 | 56,4 | 39,7 | 28,9 |
| Cowork agéntico | Automation Bench | 54,2 | 38,3 | 15,2 | 9,7 |
| Cowork agéntico | JobBench | 44,8 | 34,5 | 16,6 | 9,0 |
| Cowork agéntico | GDPval | 84,8 | 86,4 | 75,8 | 71,4 |
| Cowork agéntico | Claw-Eval pass^3 | 78,3 | 75,2 | 57,3 | 44,2 |
| Cowork agéntico | Toolathlon-Verified | 70,4 | 68,5 | 47,2 | 27,8 |
| Cowork agéntico | DeepPlanning | 63,3 | no disponible (tabla truncada en la informacion disponible) | — | — |

No se han publicado resultados de benchmarks para esta cuantización AWQ INT4 en concreto: las cifras corresponden al modelo base en su precisión original. No hay datos de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para pesos: el repo ocupa 23,29 GB; en la práctica se necesita un dispositivo con al menos 24 GB para cargar los pesos AWQ INT4 completos (incluyendo embeddings y cabeza de salida en mayor precisión).
- GPU consumer: cabe en RTX 4090 / RTX 5090 (24-32 GB) y en RTX 3090/A6000 (24-48 GB) siempre que se limite la longitud de contexto.
- Contexto largo: los 524 288 tokens exigen una caché KV muy superior al tamaño de los pesos; para explotar ventanas de cientos de miles de tokens conviene A100 80 GB, H100 80 GB o despliegue multi-GPU con atención paginada.
- Opciones de despliegue: vLLM y SGLang admiten pesos AWQ/`compressed-tensors` y son la vía recomendada para producción; TGI es compatible con el pipeline declarado. llama.cpp u Ollama requerirían convertir a GGUF, conversión que no se distribuye en este repo.
- Latencia y throughput: no disponible. Al ser un denso de 33B, el coste por token es sustancialmente mayor que el de un MoE con parámetros activos reducidos; conviene medir `tokens/s` con el arnés propio antes de dimensionar.
- El despliegue gestionado está disponible vía cyan.kiwi como endpoint compatible con OpenAI, según los enlaces de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Terminal-Bench 2.1 | SWE-Bench Pro | GDPval |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (AWQ INT4, este repo) | 33B denso | 524 288 | Apache 2.0 | 80,9 | 60,3 | 84,8 |
| Qwen3.8-27B | 27B (nominal) | no disponible | no disponible | 73,0 | 61,7 | 86,4 |
| Muse-Glimmer-30B | 30B (nominal) | no disponible | no disponible | 61,8 | 36,9 | 75,8 |
| Gemma4-31B | 31B (nominal) | no disponible | no disponible | 47,2 | 51,2 | 71,4 |

Nanbeige lidera en 12 de los 14 benchmarks reportados, con ventaja especialmente amplia en tareas de terminal y edición de repositorios; Qwen3.8-27B le supera marginalmente en SWE-Bench Pro (61,7 frente a 60,3) y en GDPval (86,4 frente a 84,8). La comparación no cubre latencia, coste por token ni calidad de la cuantización.

## Limitaciones y advertencias

- Discrepancia de parámetros: el nombre y la model card indican 33B, pero los metadatos de safetensors del repo cuantizado declaran 7 749 060 296 parámetros. Es muy probable que sea un artefacto de cómo `compressed-tensors` reporta los tensores empaquetados a 4 bits, pero debe verificarse antes de dimensionar hardware a partir de ese dato.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no está garantizado ni evaluado; no se debe asumir calidad multilingüe europea.
- Cuantización: no se publican métricas de degradación AWQ INT4 frente a BF16. En tareas agénticas de código, pequeñas pérdidas de precisión pueden traducirse en fallos de sintaxis o de llamada a herramientas; conviene validar con la suite propia.
- Sesgos y alineación: no se documentan en la información disponible los datos de alineación, filtrado de seguridad ni evaluaciones de sesgo del modelo base.
- Riesgo de alucinación: inherente a un modelo generativo; en modo agéntico se amplifica si el modelo inventa rutas de fichero, comandos o APIs en lugar de verificar su existencia.
- Contexto largo: 512K tokens no implican recuperación perfecta; en la práctica el rendimiento decae con la distancia y el coste de memoria crece de forma no lineal.
- Benchmarks autodeclarados: las cifras provienen de la model card del autor del modelo base y no han sido replicadas de forma independiente; además, varios nombres de benchmark y modelos comparados no son verificables fuera de esa fuente.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el usuario debe cumplir las obligaciones de atribución y conservar el aviso de licencia; la cuantización hereda la licencia del modelo base.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, publicado el 27 de octubre de 2026; es un artefacto reciente sin validación comunitaria.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/cyankiwi/Nanbeige4.3-33B-AWQ-INT4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Perfil del autor de la cuantización: https://huggingface.co/cyankiwi
- Dataset de calibración (STEM y agentico): https://huggingface.co/datasets/cyankiwi/calibration
- Plataforma de despliegue cyan.kiwi: https://cyan.kiwi/
- Despliegue directo del modelo: https://cyan.kiwi/workspace?prompt=Deploy%20cyankiwi/Nanbeige4.3-33B-AWQ-INT4
- Cobertura de prensa (MarkTechPost): https://www.marktechpost.com/2026/10/25/nanbeige-releases-nanbeige4-3-33b-open-agentic-coding-model/
- Ficha resumen (AI/TLDR): https://ai-tldr.dev/models/nanbeige-4-3-33b/
- Guia y analisis (ExplainX): https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- ModelScope del autor: https://www.modelscope.ai/organization/cyankiwi
