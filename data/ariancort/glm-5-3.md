# ariancort/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala orientado a generación de texto, agentes autónomos y codificación compleja, publicado por el equipo zai-org (Z.ai) y distribuido en el repositorio de HuggingFace `ariancort/GLM-5.3` (una réplica de terceros del repositorio oficial). Se trata de un modelo de arquitectura MoE (Mixture of Experts) con atención dispersa, identificada en los tags como `glm_moe_dsa`, con 753.329.940.480 parámetros totales (unos 753,3 mil millones) según el recuento real de los archivos safetensors, y un tamaño de repositorio de 755,7 GB.

La propuesta diferencial de GLM-5.3 no está en el preentrenamiento, sino en el post-entrenamiento: la model card indica explícitamente que utiliza el mismo modelo base que GLM-5.2 y que todas las mejoras provienen de trabajo posterior al preentrenamiento. Los avances declarados se concentran en dos ejes: codificación compleja y tareas de horizonte largo (con una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, y estado del arte open source en Terminal Bench 3.0 y Agents' Last Exam), y una capacidad emergente de ciberseguridad que el propio autor describe como inesperadamente acelerada, con resultados estado del arte en CyberGym para descubrimiento de vulnerabilidades.

Es relevante ahora porque compite directamente, según sus propios números, con modelos frontera cerrados (Opus 4.8, GPT-5.6 Sol, Fable 5) y con otros abiertos de gran tamaño (Kimi K3, DeepSeek-V4 Pro-0813, Qwen3.8-Max) en tareas de agente reales sobre terminal y repositorios, un terreno donde hasta hace poco los pesos abiertos iban por detrás. El coste de esa capacidad es un despliegue muy exigente en hardware y una licencia propia no estándar que hay que revisar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención dispersa; identificada en los tags como `glm_moe_dsa` |
| Parametros totales | 753.329.940.480 (753,3 mil millones), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma explícita en la model card; las evaluaciones citadas se ejecutan bajo contexto de hasta 1.000.000 de tokens (NL2Repo) y 300.000 tokens (HLE con herramientas, con gestión de contexto) |
| Tipos de cuantizacion | FP8 (etiqueta `fp8` en el repositorio); no se detallan otros formatos cuantizados oficiales |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | `other` con `license_name: glm-5.3` (licencia propia de Z.ai, no una licencia estándar tipo Apache/MIT) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 755,7 GB |
| Libreria | transformers (tag `glm_moe_dsa` en la documentacion de Transformers) |
| Pipeline | text-generation |
| Compatibilidad | `endpoints_compatible` (HuggingFace Inference Endpoints) |
| Fecha de creacion en HF | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture of Experts con atención dispersa (`glm_moe_dsa`), lo que implica que solo una fracción de los 753,3 mil millones de parámetros totales se activa por token, aunque la model card no publica el número de parámetros activos ni el número de expertos, el ratio de activación ni la dimensión oculta. El tag DSA apunta a un mecanismo de atención dispersa que reduce el coste del contexto largo, coherente con las evaluaciones citadas a 300.000 y 1.000.000 de tokens. El checkpoint distribuido está en FP8, lo que explica que 753,3 mil millones de parámetros ocupen 755,7 GB en disco en lugar de los aproximadamente 1,5 TB que requeriría BF16.

En cuanto al entrenamiento, no hay datos publicados sobre número de tokens de preentrenamiento, composición del dataset ni uso de RLHF o DPO. Lo único documentado es que GLM-5.3 reutiliza el modelo base de GLM-5.2 y que la totalidad de la mejora proviene de la fase de post-entrenamiento, presumiblemente con RL sobre entornos ejecutables (terminales, repositorios, tareas de explotación) dado el perfil de los benchmarks reportados. La innovación operativa destacable es el control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`, con tres niveles (`low`, `high`, `max`) y valor por defecto `max`; para reproducir benchmarks o leaderboards el autor recomienda mantener `max`. En plantillas de chat, `clear_thinking` es `false` por defecto, y en escenarios conversacionales se recomienda pasar `clear_thinking=true` explícitamente.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Codificación compleja: mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, con resultados destacados en DeepSWE (66,9), NL2Repo (58,0), FrontierSWE (78,1) y ProgramBench (19,0).
- Tareas de horizonte largo: Terminal Bench 3.0 (28,3 frente a 4,6 de GLM-5.2), SWE-Marathon v1.1 (42,5) y PostTrainBench (39,8).
- Tool calling y function calling: Toolathlon Verified (73,0), con uso de herramientas externas en evaluación.
- Comportamiento agéntico en terminal y CLI: Agents' Last Exam (ALE-CLI) 28,5, AutomationBench 1.0.6 48,2 y GDPval-AA v2 con 1769 puntos.
- Razonamiento con herramientas: HLE con herramientas 62,5, con contexto máximo de 300.000 tokens y gestión de contexto.
- Capacidad de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym 84,5) y explotación (ExploitGym 105/130 en 2h/6h; ExploitBench 54,4), con ganancias mayores según se avanza en la cadena de explotación.
- Control de presupuesto de razonamiento mediante `reasoning_effort` (`low`, `high`, `max`).
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agentes de codificación autónomos sobre repositorios reales: con 78,1 en FrontierSWE y 66,9 en DeepSWE, el modelo puede resolver issues completos, ejecutar planes multi-paso y validar sus propios cambios, integrándose en un bucle tipo mini-swe-agent que el propio autor cita para las evaluaciones.
- Automatización de terminal y operaciones CLI: los 28,3 puntos en Terminal Bench 3.0 y los 48,2 en AutomationBench lo sitúan como candidato para agentes que operan shell, gestionan ficheros y encadenan comandos en entornos controlados, con validación previa en sandbox.
- Auditoría de seguridad y pentesting autorizado: con 84,5 en CyberGym y 54,4 en ExploitBench, encaja en pipelines de descubrimiento de vulnerabilidades y validación de exploits dentro de programas de bug bounty o red team con autorización explícita por escrito.
- Refactorización y migración de repositorios grandes: los 58,0 en NL2Repo y el contexto evaluado a 1.000.000 de tokens permiten procesar monorepos completos para traducir entre lenguajes o frameworks manteniendo coherencia entre módulos.
- Generación de tests, documentación y revisión de código en CI/CD: el soporte de tool calling permite invocarlo desde un runner que lea el diff, ejecute la suite de pruebas y proponga parches, con `reasoning_effort=low` para reducir latencia en tareas triviales.
- Investigación asistida con herramientas: los 62,5 en HLE con herramientas lo hacen utilizable en flujos de búsqueda, consulta de documentación y síntesis con verificación, usando contexto largo y presupuesto de razonamiento alto.
- Post-entrenamiento y destilación: los 39,8 en PostTrainBench sugieren utilidad como modelo generador de datos de entrenamiento o como profesor en pipelines de destilación hacia modelos más pequeños.
- Agentes de automatización de procesos empresariales: los 1769 puntos en GDPval-AA v2 apuntan a tareas de ofimática y flujos administrativos estructurados, siempre con verificación humana en los pasos con efectos irreversibles.

## Benchmarks y rendimiento

Resultados reportados por el autor del modelo (no verificados de forma independiente). Todos los valores proceden de la model card de GLM-5.3.

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

Notas metodológicas de la model card: HLE con herramientas usa `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens, contexto máximo de 300.000 tokens con estrategia de gestión de contexto, y GPT-5.6-luna (medium) como juez. NL2Repo se evalúa con `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M, con juicio basado en reglas y en LLM para evitar comportamientos maliciosos.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del recuento real de 753,3 mil millones de parámetros, no datos publicados por el autor.

- Pesos en FP8 (formato nativo del repositorio): aproximadamente 755 GB, coincidiendo con el tamaño de repo de 755,7 GB.
- Pesos en BF16/FP16 (si se reconvierte): aproximadamente 1,5 TB.
- Cuantización a 4 bits (estimación): aproximadamente 380-400 GB, más overhead de caché KV y activaciones.
- GPU recomendadas: para FP8 nativo se necesita un nodo de 8×H200 (141 GB, 1.128 GB de HBM) o dos nodos de 8×H100 80 GB (1.280 GB de HBM en total). Un solo nodo de 8×H100 80 GB (640 GB) no es suficiente solo para los pesos en FP8.
- GPU consumer: no cabe. Ni siquiera una RTX 4090 de 24 GB ni una RTX 5090 podrían alojar el modelo, ya que incluso en 4 bits se requieren varios cientos de GB. No hay escenario práctico de inferencia en GPU consumer con este modelo.
- Offloading a CPU/RAM: KTransformers aparece en la documentación oficial como opción de despliegue, lo que permite descargar parte de los expertos a memoria del sistema; esto exige del orden de 750 GB de RAM para el checkpoint FP8 completo, o menos si se cuantiza.
- Plataforma Ascend NPU: soportada mediante vLLM-Ascend, xLLM y SGLang, según la model card.
- Frameworks de despliegue documentados: SGLang (con cookbook específico), vLLM (recipes), TokenSpeed (LightSeek), Transformers, KTransformers, Unsloth y Ascend NPU. No se documentan llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los parámetros, la longitud de contexto y las licencias de los modelos alternativos no se detallan en la información proporcionada; la comparación se limita a los resultados de benchmark reportados por el autor de GLM-5.3 y a su disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Terminal Bench 3.0 | CyberGym | DeepSWE |
|---|---|---|---|---|---|---|---|
| GLM-5.3 | 753,3 mil millones (MoE) | 1M en evaluacion (no confirmado en specs) | glm-5.3 (propia) | Pesos abiertos en HF | 28,3 | **84,5** | 66,9 |
| GLM-5.2 | no disponible | no disponible | no disponible | Pesos abiertos | 4,6 | 77,2 | 46,2 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | 17,4 | 80,0 | 67,5 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | – | 83,3 | 62,7 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | – | 78,5 | 56,6 |
| Opus 4.8 | no disponible | no disponible | Propietaria | API cerrada | 21,1 | 78,1 | 58,0 |
| GPT-5.6 Sol | no disponible | no disponible | Propietaria | API cerrada | **34,6** | 83,6 | **72,7** |

Frente a GLM-5.2, su predecesor directo con el mismo modelo base, la mejora es sustancial en tareas agénticas de horizonte largo (Terminal Bench 3.0 pasa de 4,6 a 28,3; ExploitGym de 29/39 a 105/130) sin cambios en el preentrenamiento. Frente a los modelos frontera cerrados, GLM-5.3 mantiene ventaja en ciberseguridad y automatización, pero queda por detrás de GPT-5.6 Sol y Fable 5 en explotación avanzada, y de Fable 5 en ProgramBench y FrontierSWE.

## Limitaciones y advertencias

- Licencia no estándar: `license: other` con `license_name: glm-5.3`. Es una licencia propia de Z.ai, no Apache 2.0 ni MIT, por lo que hay que revisar los términos completos antes de cualquier uso comercial, redistribución o servicio alojado.
- Idiomas soportados únicamente inglés y chino. No hay garantía de rendimiento en castellano ni en otras lenguas, y no se reportan benchmarks multilingües.
- Capacidad ofensiva emergente documentada por el propio autor: el modelo es estado del arte en CyberGym y más que duplica a GLM-5.2 en benchmarks de explotación (ExploitGym 105/130 frente a 29/39). Esto implica un riesgo real de uso indebido y obliga a controles de acceso, registro de actividad y autorización explícita en cualquier despliegue con capacidades de red.
- Riesgo de alucinación: no se publican tasas de alucinación ni evaluaciones de veracidad. En tareas de codificación y seguridad, una alucinación puede traducirse en parches incorrectos o falsos positivos de vulnerabilidad.
- Todos los benchmarks son autoinformados por el autor. No hay verificación independiente, y varias columnas de comparación provienen de resultados declarados por terceros sin condiciones de evaluación homogéneas.
- La información sobre composición del dataset, parámetros activos, número de expertos y detalles de alineación no está disponible, lo que dificulta evaluar sesgos conocidos. No se documentan sesgos específicos.
- El repositorio `ariancort/GLM-5.3` es una réplica de terceros (0 descargas, 0 likes en el momento de la consulta) mientras que la model card referencia recursos de `zai-org/GLM-5`. Para producción conviene usar el repositorio oficial y verificar la integridad de los pesos.
- Requisitos de hardware extremos: no es desplegable en GPU consumer y exige nodos multi-GPU de gama alta o esquemas de offloading con cientos de GB de RAM.
- Contexto largo con matices: las evaluaciones con 1M de tokens usan gestión de contexto y longitudes máximas de generación limitadas (64k en NL2Repo, 163.840 tokens en HLE), por lo que el rendimiento real con contexto muy largo puede degradarse.
- El valor por defecto de `reasoning_effort` es `max`, lo que incrementa coste y latencia si no se ajusta explícitamente; en chat hay que pasar `clear_thinking=true` para evitar arrastrar el razonamiento entre turnos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ariancort/GLM-5.3
- Repositorio oficial de referencia: https://github.com/zai-org/GLM-5
- Documentación del modelo en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recipes de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed (LightSeek): https://github.com/lightseekorg/tokenspeed y https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- KTransformers, tutorial de despliegue: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Referencia arXiv citada en los tags: arxiv:2602.15763 (no se ha verificado el contenido del paper en la información disponible)
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los únicos resultados obtenidos corresponden a dominios sin relación con GLM-5.3.
