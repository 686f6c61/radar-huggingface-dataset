# Nanbeige/Nanbeige4.3-33B

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.118.977.024 parámetros (aproximadamente 33,1 mil millones) desarrollado por Nanbeige como modelo «profesor» insignia de la familia Nanbeige4.3. Está afinado a partir de Nanbeige/Nanbeige4.3-33B-Base y se distribuye con licencia Apache 2.0 en formato safetensors, con etiquetas que lo identifican como un transformer de tipo Llama para generación de texto conversacional en inglés y chino. El repositorio ocupa 66,3 GB y el modelo se publicó el 24 de octubre de 2026, con una actualización el 25 de octubre de 2026.

El objetivo declarado por el autor no es solo el despliegue directo, sino servir de base para destilar capacidades agénticas avanzadas en modelos más pequeños de la misma serie (por ejemplo, Nanbeige4.3-3B). El modelo está orientado a tareas de codificación agéntica y de «cowork» profesional: ejecución de comandos en terminal, resolución de incidencias en repositorios, uso de herramientas y planificación multi-paso. Según la model card, lidera la mayoría de los benchmarks publicados frente a Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B en la franja de ~30B parámetros,Evaluados todos con su máximo esfuerzo de razonamiento.

La información pública disponible no detalla la longitud de contexto, el volumen de tokens de entrenamiento ni el pipeline de alineamiento (RLHF/DPO), por lo que esos apartados se marcan como no disponibles. La relevancia actual del modelo radica en su perfil: un modelo abierto de ~33B con licencia permisiva que compite en tareas agénticas de terminal e ingeniería de software, un nicho tradicionalmente dominado por modelos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en el repositorio); detalles de capas y atención no disponibles |
| Parámetros totales | 33.118.977.024 (~33,1 B) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican cuantizaciones oficiales ni GGUF en la información disponible) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | Nanbeige/Nanbeige4.3-33B-Base |
| Tamaño del repositorio | 66,3 GB |
| Fecha de publicación | 24 de octubre de 2026 (actualizado el 25 de octubre de 2026) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo con la etiqueta `llama`, lo que sitúa la arquitectura en la familia de transformers decoder-only con atención causal, sin que la model card proporcione detalles sobre número de capas, dimensión oculta, configuración de atención (GQA/MQA), función de activación ni tipo de positional encoding. Tampoco se indica que se trate de una arquitectura MoE, SSM o híbrida, por lo que a efectos prácticos debe asumirse un transformer denso de ~33B parámetros hasta que el autor publique la configuración completa.

Respecto al entrenamiento, la model card no documenta el número de tokens, la composición del corpus, ni si se aplicaron fases de SFT, RLHF o DPO. Lo que sí se explicita es la existencia de un modo de razonamiento configurable: la plantilla de chat del tokenizer expone el parámetro `enable_thinking` para controlar si el modelo emite trazas de razonamiento, y las evaluaciones publicadas se realizaron con `preserve_thinking=true`. El diseño de la serie Nanbeige4.3 plantea un modelo profesor de alta capacidad (este 33B) del que se destilarán capacidades agénticas hacia modelos pequeños, lo que constituye la innovación metodológica principal declarada por el autor.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito con modo «thinking» activable y preservable mediante los parámetros `enable_thinking` y `preserve_thinking` de la plantilla de chat.
- Codificación agéntica: resolución de tareas en terminal, edición de repositorios y generación de parches (evaluado con harnesses tipo Terminus 2, mini-swe-agent v2.4.6 y Claude Code).
- Uso de herramientas y function calling: la plantilla de chat está diseñada explícitamente para escenarios de razonamiento y tool use; evaluado en Toolathlon-Verified y Tau3-Bench.
- Planificación multi-paso y descomposición de tareas largas (DeepPlanning, EnterpriseOps-Gym).
- Tareas profesionales de «cowork»: automatización de flujos ofimáticos y operativas en 35 ocupaciones según JobBench.
- Razonamiento científico y matemático de nivel competición (GPQA Diamond, AIME 2026, AA-LCR).
- Capacidad de actuar como modelo profesor para generar trayectorias de destilación hacia modelos de ~3B.
- No se documenta soporte de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Agente de codificación en terminal: el modelo puede recibir un objetivo en lenguaje natural y ejecutar comandos, inspeccionar el sistema de archivos y editar código de forma iterativa; su resultado de 80,9 en Terminal-Bench 2.1 y 23,8 en Terminal-Bench 4.0 lo sitúa como opción para agentes CLI (por ejemplo, integrados con mini-swe-agent).
- Resolución automática de incidencias en repositorios: con 60,3 en SWE-Bench Pro y 50,8 en SWE-Atlas-QnA, es adecuado para pipelines que reciben un issue, localizan los ficheros relevantes y proponen un parche verificable por tests.
- Generación de repositorios completos a partir de especificaciones: su 53,0 en NL2Repo (evaluado con Claude Code) permite usarlo en prototipado rápido de proyectos, generando estructura, módulos y pruebas iniciales.
- Orquestación de herramientas en flujos empresariales: con 70,4 en Toolathlon-Verified y 48,8 en Tau3-Bench, encaja en asistentes que encadenan APIs, consultas a bases de datos y acciones sobre sistemas internos con verificación de resultados.
- Automatización de tareas de oficina y operaciones: los resultados en Automation Bench (54,2) y JobBench (44,8, con mejora en la mayoría de las 35 ocupaciones evaluadas) lo hacen apto para asistentes de back-office (gestión documental, reporting, triaje de correo) donde se requiere seguir procedimientos multi-paso.
- Planificación de proyectos y descomposición de objetivos: 63,3 en DeepPlanning permite emplearlo como planificador de alto nivel que divide un objetivo en subtareas asignables a agentes especializados o a humanos.
- Asistencia en operaciones empresariales simuladas: con 41,0 en EnterpriseOps-Gym y 78,3 en Claw-Eval (pass^3), es utilizable en entornos de atención al cliente o soporte interno con interacciones de un solo turno y criterios estrictos de consistencia.
- Modelo profesor para destilación: generar trayectorias de razonamiento y tool use de alta calidad para entrenar modelos más pequeños de la serie (Nanbeige4.3-3B) es el caso de uso explícitamente previsto por el autor.
- Razonamiento técnico-científico: 89,5 en GPQA Diamond y 95,2 en AIME 2026 lo hacen válido para asistentes de análisis cuantitativo o resolución de problemas matemáticos, siempre con verificación posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos los modelos se evaluaron con sus hiperparámetros de inferencia y harness comunes, con el máximo esfuerzo de razonamiento. Nanbeige4.3-33B se evaluó con `preserve_thinking=true`.

| Categoría | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Codificación agéntica | Terminal-Bench 2.1 | **80,9** | 73,0 | 61,8 | 47,2 |
| Codificación agéntica | Terminal-Bench 4.0 | **23,8** | 6,3 | 1,6 | 0,0 |
| Codificación agéntica | DeepSWE | **65,5** | 42,5 | 4,4 | 2,7 |
| Codificación agéntica | SWE-Bench Pro | 60,3 | **61,7** | 36,9 | 51,2 |
| Codificación agéntica | SWE-Atlas-QnA | **50,8** | 41,9 | 17,7 | 3,3 |
| Codificación agéntica | NL2Repo | **53,0** | 48,3 | 27,4 | 33,8 |
| Codificación agéntica | Scicode | **52,6** | 46,7 | 44,9 | 45,5 |
| Codificación agéntica | SkillsBench | **61,1** | 56,4 | 39,7 | 28,9 |
| Cowork agéntico | Automation Bench | **54,2** | 38,3 | 15,2 | 9,7 |
| Cowork agéntico | JobBench | **44,8** | 34,5 | 16,6 | 9,0 |
| Cowork agéntico | GDPval | 84,8 | **86,4** | 75,8 | 71,4 |
| Cowork agéntico | Claw-Eval (pass^3) | **78,3** | 75,2 | 57,3 | 44,2 |
| Cowork agéntico | Toolathlon-Verified | **70,4** | 68,5 | 47,2 | 27,8 |
| Cowork agéntico | DeepPlanning | **63,3** | 49,2 | 21,4 | 19,4 |
| Cowork agéntico | EnterpriseOps-Gym | **41,0** | 40,2 | 30,5 | 27,3 |
| Cowork agéntico | YC-bench | **1.025.437 $** | 641.290 $ | 513.978 $ | 265.152 $ |
| Cowork agéntico | Tau3-Bench | **48,8** | 48,5 | 33,7 | 18,6 |
| Razonamiento | GPQA Diamond | 89,5 | 89,2 | 83,5 | **91,3** |
| Razonamiento | AIME 2026 | **95,2** | 94,5 | 94,7 | 89,2 |
| Razonamiento | AA-LCR | **84,0** | 82,0 | 83,3 | 72,0 |

Notas metodológicas de la model card: Terminal-Bench 2.1 evaluado con Terminus 2; Terminal-Bench 4.0 y DeepSWE con mini-swe-agent v2.4.6; SWE-Atlas-QnA con mini-swe-agent v2.4.6 y corrección mediante 1.304 rúbricas específicas usando GPT-6 Sol como juez (esfuerzo de razonamiento medio); NL2Repo con Claude Code; Automation Bench v1.0.6 con 600 tareas públicas; JobBench con harness de Claude Code y herramienta de búsqueda; GDPval con rúbricas revisadas; Claw-Eval solo sobre el subconjunto General (157 tareas de un solo turno); Toolathlon-Verified sin límite de `max_tokens` por petición; YC-bench conservando solo los 10 turnos más recientes de diálogo; DeepPlanning, EnterpriseOps-Gym y Tau3-Bench con sus repositorios oficiales.

No se publican resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

Estimaciones calculadas a partir del número de parámetros (33,1 B); el autor no publica requisitos oficiales.

- VRAM para pesos en bf16/fp16: ~66,2 GB solo para los pesos, más caché KV (no cuantificable al no publicarse la longitud de contexto). Requiere GPU de 80 GB (H100 80 GB, A100 80 GB) o sharding multi-GPU (2× A100 40 GB, 2× L40S 48 GB).
- VRAM en fp8/int8: ~33 GB de pesos; encaja en A100 40 GB (con contexto limitado), L40S 48 GB o RTX A6000 48 GB.
- VRAM en cuantización de 4 bits: ~17-18 GB de pesos; podría ejecutarse en una RTX 4090 o RTX 3090 de 24 GB con contexto corto, aunque sin GGUF oficial publicado en la información disponible debe realizarse la cuantización por cuenta propia.
- GPU de consumo: una sola GPU de 24 GB solo es viable con cuantización de 4 bits y ventana de contexto reducida; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Inference Endpoints de Hugging Face). llama.cpp/Ollama requerirían una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles. El modo thinking (`enable_thinking`/`preserve_thinking`) incrementa el número de tokens generados y, por tanto, el coste por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntos fuertes (según benchmarks publicados) | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B | ~33,1 B | No disponible | Apache 2.0 | Terminal-Bench, DeepSWE, SWE-Atlas-QnA, Automation Bench, JobBench, DeepPlanning, Toolathlon-Verified, AIME 2026, AA-LCR | Hugging Face (safetensors, transformers) |
| Qwen3.8-27B | ~27 B (según denominación) | No disponible | No disponible en la información proporcionada | SWE-Bench Pro (61,7) y GDPval (86,4) por delante; muy competitivo en razonamiento | No disponible en la información proporcionada |
| Muse-Glimmer-30B | ~30 B (según denominación) | No disponible | No disponible en la información proporcionada | Rendimiento inferior en la mayoría de benchmarks agénticos; cercano en AIME 2026 (94,7) | No disponible en la información proporcionada |
| Gemma4-31B | ~31 B (según denominación) | No disponible | No disponible en la información proporcionada | Mejor GPQA Diamond (91,3); claramente por debajo en tareas agénticas de terminal | No disponible en la información proporcionada |

La ventaja más marcada de Nanbeige4.3-33B se concentra en tareas agénticas de terminal e ingeniería de software (Terminal-Bench 4.0: 23,8 frente a 6,3 del siguiente mejor) y en planificación (DeepPlanning: 63,3 frente a 49,2). Las diferencias se estrechan en razonamiento puro y en SWE-Bench Pro, donde Qwen3.8-27B queda por delante.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; no hay evidencia publicada de rendimiento en castellano ni en otras lenguas, por lo que su uso en producción en español requiere evaluación propia.
- Longitud de contexto no documentada: impide dimensionar caché KV, planificar despliegues y validar casos de uso con documentos largos.
- Riesgo de alucinación: no se publican tasas de veracidad ni evaluaciones de factualidad; los benchmarks presentados son de tareas agénticas y razonamiento, no de fidelidad factual.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni robustez frente a prompts adversarios.
- Dependencia del harness: buena parte de los resultados (SWE-Atlas-QnA, NL2Repo, JobBench) se obtuvieron con harnesses de terceros (mini-swe-agent, Claude Code) y, en un caso, con GPT-6 Sol como juez y rúbricas propietarias, lo que dificulta la reproducibilidad exacta.
- Modo thinking: `preserve_thinking=true` aumenta el consumo de tokens y el coste; en despliegues de alto QPS conviene desactivarlo o limitar `max_tokens`.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo se distribuye sin garantías; conviene revisar las obligaciones de atribución en productos derivados y en la destilación hacia modelos pequeños.
- Madurez: el repositorio registra 0 descargas en el momento de la consulta y una fecha de publicación muy reciente, por lo que existe poca validación independiente al margen de la model card del autor.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que traslada al usuario el trabajo de optimización para hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- No se han encontrado en la información disponible enlaces a paper, blog técnico, repositorio de código o demo adicionales.
