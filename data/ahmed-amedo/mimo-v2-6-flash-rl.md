# ahmed-amedo/MiMo-V2.6-Flash-RL

## Resumen

MiMo-V2.6-Flash-RL es un modelo multimodal de tipo sparse MoE (mezcla de expertos dispersa) desarrollado por Xiaomi, publicado originalmente en el repositorio oficial XiaomiMiMo/MiMo-V2.6-Flash-RL y re-subido a HuggingFace por el usuario ahmed-amedo. Es el checkpoint "equilibrado en eficiencia" de la serie MiMo-V2.6, disenado para escalar el aprendizaje por refuerzo (RL) hacia la auto-mejora: escalado de computo de RL, diversidad de entornos y computo de evaluadores en paralelo. Cuenta con 309B parametros totales y 15B activos por token, con una ventana de contexto de 1M tokens y capacidad nativa para texto, imagen, video y audio.

El modelo resuelve tareas de agente de horizonte largo: ejecucion de codigo en repositorios completos, uso de herramientas en multiples pasos, interaccion con interfaces graficas, analisis visual y tareas de ciberseguridad. Su relevancia actual reside en dos innovaciones concretas: un unico run mixto de RL ("You Only RL Once") que entrena a la vez dominios de codigo, agentes generales, vision y ciberseguridad, y un bucle de auto-mejora mediante evaluacion agentica por grupos (GRS y GAR) que permite rankear trayectorias correctas en lugar de limitarse a una senal binaria de exito o fracaso.

La arquitectura combina un backbone hibrido con atencion de ventana deslizante (SWA) y atencion completa, encoders omni-modales (vision y audio) y un decodificador especulativo de prediccion multi-token (MTP) de 5 capas. El repositorio pesa 177,8 GB y, en el momento de la consulta, registra 0 descargas y 0 "likes", lo que indica que se trata de una copia no oficial y practicamente sin traccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (mezcla de expertos dispersa) con backbone hibrido SWA + atencion completa, encoders omni-modales y decodificador MTP |
| Parametros totales | 309B (segun model card); 310.756.322.688 (310,76B) segun safetensors |
| Parametros activos | 15B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | fp8 y 8-bit (etiquetas del repositorio); no se listan GGUF ni AWQ/GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `custom_code`, requiere transformers y posiblemente `trust_remote_code=True`) |
| Modalidades | Texto, imagen, video y audio |
| Encoder de vision | MiMo ViT de 681M parametros (28 capas: 24 SWA + 4 full) |
| Encoder de audio | AudioTokenizer de 308M + patch encoder de audio de 127M |
| Prediccion multi-token | Decodificador especulativo de 5 capas |
| Tamano del repositorio | 177,8 GB |
| Pipeline declarado | text-generation |
| Autor del repositorio | ahmed-amedo (re-subida de un modelo de Xiaomi) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura sparse MoE con 309B parametros totales y 15B activos por token, lo que mantiene el coste de computo por token en el rango de un modelo denso de ~15B mientras la capacidad de almacenamiento de conocimiento corresponde a 309B. El backbone combina capas de atencion de ventana deslizante (SWA) con capas de atencion completa, una estrategia habitual para sostener contextos de 1M tokens sin que el coste cuadratico de la atencion se dispare. Sobre el backbone se anaden un encoder de vision MiMo ViT de 681M parametros (28 capas, 24 de ellas SWA y 4 completas), un encoder de audio compuesto por un AudioTokenizer de 308M y un patch encoder de 127M, y un decodificador especulativo de prediccion multi-token (MTP) de 5 capas que acelera la generacion.

El entrenamiento se articula en varias fases descritas en la model card. Primero, un unico run mixto de RL que mezcla tareas de codigo, agentes generales, vision y ciberseguridad en el mismo lote, con distintos arneses de evaluacion, de modo que las estrategias aprendidas se transfieren a arneses nunca vistos en entrenamiento. El algoritmo es GRPO (Group Relative Policy Optimization) totalmente asincrono sobre lotes muy grandes: 1.568 prompts x 16 rollouts por paso, con miles de millones de tokens por actualizacion. La senal de recompensa se escala mediante evaluacion agentica por grupos: GRS (Groupwise Reward Synthesis) construye rubricas especificas de tarea a partir de rollouts contrastados y las fusiona con los resultados de tests, mientras que GAR (Groupwise Advantage Redistribution) rankea trayectorias correctas en linea y desplaza la ventaja hacia las soluciones de mayor calidad, lo que empuja al modelo hacia caminos mas cortos y menos tokens por tarea. Adicionalmente, hay un arranque en frio desde autocorreccion (el modelo reescribe sus propios turnos desalineados) con endurecimiento de entorno, cribado adversarial y verificacion cruzada para evitar el reward hacking. La fase final es MOPD2 (Multi-Prefix Multi-Teacher On-Policy Distillation), que combina rollouts autonoms del estudiante con rollouts de un solo turno condicionados por prefijo (Teacher-Prefix y SFT-Prefix) para extender capacidades a tareas dificiles de verificar.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento de horizonte largo sobre repositorios completos, trazas de herramientas y sesiones de agente multiples.
- Ejecucion y generacion de codigo en entornos de agente (code agent), con resultados reportados en DeepSWE v1.1, ProgramBench y MiMo Code Bench.
- Agentica general: uso de herramientas, automatizacion de flujos y control de terminal (AutomationBench, Toolathlon-Verified, Terminal Bench).
- Interaccion con interfaces graficas de escritorio y sistemas operativos (OSWorld-Verified, JobBench).
- Vision: comprension de imagenes mediante el encoder MiMo ViT de 681M parametros.
- Video: comprension de video (etiqueta `video-understanding`).
- Audio: entrada de audio mediante AudioTokenizer y patch encoder dedicados.
- Capacidades de ciberseguridad, evaluadas en una seccion especifica de la tabla de benchmarks (datos no incluidos en la informacion disponible).
- Modo de agente multi-paso con soporte para multiples arneses de ejecucion.
- Decodificacion especulativa nativa mediante MTP de 5 capas.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos declarados.

## Casos de uso

- Agente de codigo sobre repositorios completos: con 1M tokens de contexto y 15B parametros activos, el modelo puede cargar un repositorio entero y sus trazas de herramientas, ejecutar refactorizaciones multi-archivo y verificar cambios con tests. Los 67,9 puntos en DeepSWE v1.1 lo situan en un rango util para este escenario.
- Automatizacion de terminal y operaciones de sistema: los 87,6 puntos en Terminal Bench 2.1 y 80,8 en OSWorld-Verified indican que puede controlar sesiones de shell e interfaces graficas para tareas de administracion, despliegue o configuracion.
- Agente general con tool calling: los 73,6 puntos en Toolathlon-Verified y 52,3 en AutomationBench v1.0.6 lo hacen adecuado para orquestar APIs, CRMs y flujos internos mediante llamadas a herramientas encadenadas.
- Asistente multimodal de atencion al cliente: al aceptar imagen, video y audio ademas de texto, puede gestionar incidencias con capturas de pantalla, grabaciones o videos de producto dentro de una misma conversacion.
- Analisis de video y audio a escala: catalogacion automatica de contenido audiovisual, transcripcion y resumen de reuniones o generacion de subtitulos, usando los encoders dedicados de audio y vision.
- Auditoria y analisis de seguridad: la seccion de ciberseguridad de la evaluacion sugiere uso en revision de codigo, analisis de vulnerabilidades y triaje de alertas, aunque los datos concretos de esa seccion no estan disponibles.
- Investigacion en RL y agentes: el modelo es un checkpoint RL publicado, util como referencia para estudiar tecnicas de GRPO asincrono, evaluacion agentica por grupos y destilacion on-policy con multiples profesores.
- Prototipado de asistentes con ventana de contexto extrema: resumen y consulta sobre documentacion tecnica, expedientes o bases de conocimiento de mas de un millon de tokens.

## Benchmarks y rendimiento

Resultados declarados en la model card del autor del modelo. El checkpoint objeto de esta ficha es la columna "MiMo-V2.6 Flash".

| Benchmark | MiMo-V2.6 Pro | MiMo-V2.6 Flash | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| DeepSWE v1.1 | 71,9 | 67,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,5 | 26,0 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 63,2 | 61,2 | 40,4 | 68,6 | 59,3 | no disponible |
| AutomationBench v1.0.6 | 53,1 | 52,3 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 76,9 | 73,6 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | 1673 | no disponible | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 31,6 | 27,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 34,9 | 28,8 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 89,9 | 87,6 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 82,0 | 80,8 | no disponible | 83,4 | 83,0 | 86,0 |
| JobBench | 62,0 | 61,2 | 25,0 | 65,7 | 45,4 | 57,4 |

La tabla original incluye una seccion de ciberseguridad que aparece truncada en la informacion proporcionada, por lo que sus valores no se recogen aqui. No hay datos publicados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 621 GB solo para pesos; en fp8/8-bit, unos 311 GB; en una hipotetica cuantizacion de 4 bits, alrededor de 155 GB. A estas cifras hay que sumar memoria para el KV cache, que con 1M tokens de contexto puede crecer de forma muy significativa.
- GPU recomendadas: 8x H100 80GB o 8x A100 80GB para bf16; 4x H100 80GB para fp8; 2x H100 o 2x A100 80GB para 4 bits. Alternativas con mas memoria por dispositivo (MI300X de 192 GB) reducen el numero de nodos necesarios en fp8.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. El modelo mas cercano, una RTX 4090 de 24 GB, necesitaria mas de una docena de tarjetas incluso en 4 bits, sin contar el KV cache, por lo que el despliegue en consumer no es viable.
- Equipos con memoria unificada: un Mac Studio o similar con 512 GB de memoria unificada podria albergar una cuantizacion de 8 bits o inferior, con rendimiento muy limitado y sin soporte confirmado de decodificacion especulativa.
- Opciones de despliegue: al ser un modelo con `custom_code` y pesos safetensors, el despliegue esperado es mediante transformers. Para servidores de alto rendimiento serian necesarios vLLM o SGLang, aunque no se confirma compatibilidad en la documentacion disponible. llama.cpp y Ollama quedan descartados salvo que se generen pesos GGUF, que no se ofrecen. TGI es otra opcion potencial, tambien sin confirmar.
- Latencia y throughput: no disponibles. El modelo incorpora prediccion multi-token (MTP) con un decodificador especulativo de 5 capas, lo que en teoria incrementa el throughput por paso de decodificacion, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL (este repositorio) | 309B totales / 15B activos | 1M tokens | MIT (metadatos HF) | HuggingFace, re-subida de terceros | 67,9 en DeepSWE v1.1; 87,6 en Terminal Bench 2.1 |
| MiMo-V2.6-Flash-RL (oficial de Xiaomi) | 309B totales / 15B activos | 1M tokens | MIT | HuggingFace y ModelScope, repositorio oficial | Identico al anterior, con procedencia verificada |
| MiMo-V2.6-Pro-RL | no disponible (superior a Flash) | 1M tokens | MIT | HuggingFace y ModelScope | 71,9 en DeepSWE v1.1; 76,9 en Toolathlon-Verified; 1673 en GDPval-AA 2.1 |
| MiMo-V2.5-Pro | no disponible | no disponible | no disponible | HuggingFace | 19,0 en DeepSWE v1.1; 40,4 en MiMo Code Bench |

La model card incluye tambien comparaciones con modelos cerrados de referencia (Claude Opus 5, GPT-5.6 Sol y Claude Fable 5), que se recogen en la tabla de benchmarks. La informacion disponible no permite comparar parametros ni contexto de esos modelos.

## Limitaciones y advertencias

- Procedencia no oficial: el repositorio pertenece a ahmed-amedo, no a Xiaomi. Con 0 descargas y 0 "likes" en el momento de la consulta, no hay evidencia de verificacion por parte de la comunidad. Para uso en produccion es preferible el repositorio oficial XiaomiMiMo/MiMo-V2.6-Flash-RL.
- Requiere codigo remoto: la etiqueta `custom_code` implica que la carga del modelo puede ejecutar codigo Python del repositorio. Cargarlo con `trust_remote_code=True` supone un riesgo de seguridad si el repositorio no es de confianza.
- Idiomas: solo se declaran ingles y chino. No hay datos sobre rendimiento en castellano ni en otras lenguas, por lo que su uso en espanol es incierto.
- Contexto de 1M tokens: aunque se declara esa ventana, no se publican resultados de evaluacion especificos de recuperacion en contexto largo (por ejemplo, RULER o Needle-in-a-Haystack), y el rendimiento suele degradarse en los extremos de la ventana.
- Riesgo de alucinacion: es un modelo generativo sin mecanismo de abstención documentado. En tareas de agente con ejecucion real (terminal, OSWorld) los errores pueden tener consecuencias sobre el sistema.
- Alineacion y seguridad: el entrenamiento incluye cribado adversarial y verificacion cruzada, pero la model card no publica resultados de evaluaciones de seguridad, sesgo o toxicidad.
- Benchmarks autodeclarados: todos los numeros proceden de la model card del autor del modelo. No hay verificacion independiente ni datos de MMLU, HumanEval o GSM8K.
- Seccion de ciberseguridad incompleta: la tabla de resultados aparece truncada en la informacion disponible, por lo que no se puede evaluar esa capacidad.
- Licencia: los metadatos de HuggingFace y la model card indican licencia MIT, lo que en principio permite uso comercial. No obstante, al tratarse de una re-subida de terceros, conviene confirmar la licencia en el repositorio oficial de Xiaomi antes de un uso comercial.
- Coste de despliegue: con 310,76B parametros totales y un repositorio de 177,8 GB, la inferencia requiere infraestructura multi-GPU. No es viable en hardware de consumo.

## Enlaces

- Repositorio en HuggingFace (objeto de esta ficha): https://huggingface.co/ahmed-amedo/MiMo-V2.6-Flash-RL
- Repositorio oficial de Xiaomi: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio oficial de MiMo-V2.6-Pro-RL: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope de MiMo-V2.6-Flash-RL: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL
- ModelScope de MiMo-V2.6-Pro-RL: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Blog del modelo: https://mimo.xiaomi.com/mimo-v2-6
- Informe tecnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Repositorio de codigo en GitHub: https://github.com/XiaomiMiMo/MiMo
- Plataforma de API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/

Nota: la busqueda web realizada no ha devuelto informacion tecnica relevante sobre el modelo; los resultados obtenidos se refieren al nombre propio "Ahmed" y no guardan relacion con MiMo-V2.6.
