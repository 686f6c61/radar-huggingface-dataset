# blearyhope/MiMo-V2.6-Pro-RL

## Resumen

MiMo-V2.6-Pro-RL es el checkpoint insignia de la serie MiMo-V2.6, desarrollada por Xiaomi (grupo XiaomiMiMo). Se trata de un modelo de lenguaje multimodal nativo de tipo sparse MoE con 1,02 billones de parametros totales y 42.000 millones activados por token, disenado para escalar el aprendizaje por refuerzo hacia la auto-mejora. El modelo integra texto, imagen, video y audio en una unica arquitectura, con una ventana de contexto de 1 millon de tokens orientada a repositorios largos, trazas de herramientas y ejecuciones de agentes multi-sesion.

Su relevancia actual radica en su enfoque de entrenamiento: una unica ejecucion de RL mixta ("You Only RL Once") que combina tareas de codigo, agentes generales, vision y ciberseguridad en el mismo lote, junto con un sistema de calificacion agentica por grupos (GRS/GAR) que genera senales de recompensa mas ricas que el simple aprobado/fallido binario. Esto permite ordenar soluciones correctas por calidad y acortar trayectorias, reduciendo tokens por tarea.

La ficha corresponde a la publicacion `blearyhope/MiMo-V2.6-Pro-RL` en Hugging Face, un espejo del repositorio oficial de Xiaomi. El modelo se distribuye bajo licencia MIT, con pesos en safetensors y codigo personalizado (`custom_code`) que requiere `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (Mixture of Experts) con backbone hibrido SWA, encoders multimodales y decodificador especulativo MTP |
| Parametros totales | 1.024.216.603.392 (1,02 B) |
| Parametros activos | 42.000 millones (42 B) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit, fp8 (segun tags del repositorio); no se detallan otras variantes |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 573,5 GB) |
| Encoder de vision | MiMo ViT de 681 M parametros (28 capas: 24 SWA + 4 Full) |
| Encoder de audio | AudioTokenizer de 308 M + patch encoder de audio de 127 M |
| Decodificador especulativo | MTP de 5 capas |
| Libreria | transformers (requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura sparse MoE con 1,02 B de parametros totales y 42 B activos por token, sobre un backbone con atencion de ventana deslizante hibrida (SWA) combinada con capas de atencion completa. A esto se anaden tres componentes multimodales: un encoder de vision MiMo ViT de 681 M parametros (28 capas, 24 de ventana deslizante y 4 completas), un frontend de audio compuesto por un AudioTokenizer de 308 M y un patch encoder de 127 M, y un decodificador especulativo Multi-Token Prediction (MTP) de 5 capas para acelerar la generacion.

El entrenamiento se articula en torno al escalado del RL. La fase principal es una unica ejecucion de RL mixta sobre codigo, agentes generales, vision y ciberseguridad, usando GRPO totalmente asincrono con lotes muy grandes (1.568 prompts x 16 rollouts por paso, miles de millones de tokens por actualizacion). El sistema de recompensa se escala mediante calificacion agentica por grupos: Groupwise Reward Synthesis (GRS) construye rubricas especificas por tarea a partir de rollouts contrastados y fusiona su calidad con los resultados de tests, mientras que Groupwise Advantage Redistribution (GAR) ordena en linea las trayectorias correctas y desplaza la ventaja hacia las de mayor calidad. Tras el RL mixto se aplica Multi-Prefix Multi-Teacher On-Policy Distillation (MOPD2), que combina rollouts autonomos del estudiante con rollouts condicionados por prefijo de profesores y de datos SFT para extender capacidades a tareas dificiles de verificar. El alineamiento se refuerza con un arranque en frio de autocorreccion, endurecimiento de entornos, cribado adversarial y verificacion cruzada contra reward hacking.

## Capacidades

- Generacion de texto y razonamiento de proposito general en ingles y chino.
- Comprension de imagen (vision-language) mediante el encoder MiMo ViT.
- Comprension de video y audio de forma nativa en el mismo modelo.
- Ejecucion de codigo y tareas de agente de codigo (parcheo de repositorios, resolucion de issues, terminal).
- Razonamiento agentico multi-paso y uso de herramientas (tool calling / function calling) en entornos como Terminal Bench, OSWorld y Toolathlon.
- Capacidades de ciberseguridad evaluadas en CyberGym.
- Contexto largo de 1M tokens para repositorios, trazas de herramientas y sesiones de agente prolongadas.
- Decodificacion especulativa MTP para reducir latencia de generacion.
- Modo de auto-mejora y autocorreccion derivado del entrenamiento con RL alineado.

## Casos de uso

- Agente de codigo en produccion: el modelo puede clonar un repositorio, localizar el fallo y proponer un parche, apoyandose en sus 1M tokens de contexto para mantener el arbol de ficheros y las trazas de terminal en una sola ventana.
- Automatizacion de operaciones en terminal: con resultados como 89,9 en Terminal Bench 2.1 y 34,9 en Terminal Bench 4.0, es adecuado para pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Agentes de escritorio y automatizacion de GUI: su 82,0 en OSWorld-Verified lo hace apto para tareas de control de interfaz grafica y flujos de trabajo ofimaticos automatizados.
- Analisis de documentos y video de larga duracion: la combinacion de contexto de 1M tokens con encoders de vision y video permite resumir reuniones grabadas, auditar transcripciones o extraer datos de repositorios documentales extensos.
- Asistencia multimodal en atencion al cliente: al procesar texto, imagen y audio en un unico modelo, puede gestionar conversaciones multi-turno con capturas de pantalla o notas de voz sin orquestar modelos separados.
- Auditoria de seguridad y ciberseguridad defensiva: las evaluaciones en CyberGym y su entrenamiento mixto con tareas de seguridad lo orientan a analisis de vulnerabilidades y revision de configuraciones en entornos controlados.
- Investigacion en RL y auto-mejora: el checkpoint y el informe tecnico sirven como base para estudiar calificacion agentica, redistribucion de ventajas y destilacion on-policy multi-profesor.

## Benchmarks y rendimiento

Resultados publicados en la model card (MiMo-V2.6 Pro frente a alternativas):

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

La model card corta la tabla en la seccion de ciberseguridad (CyberGym), por lo que no se dispone del resto de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,02 B de parametros totales, los pesos en fp8 ocupan aproximadamente 1 TB, por lo que la inferencia requiere agregacion de memoria en multiples nodos. No cabe en una sola GPU comercial.
- GPU recomendadas: despliegue multi-nodo con H100, H200 o B200; no es viable en A100 individuales ni en RTX 4090.
- Consumer GPU: no cabe en ninguna GPU de consumo, ni siquiera con cuantizacion agresiva, dado el tamano del checkpoint (573,5 GB en safetensors) y los 42 B de parametros activos.
- Opciones de despliegue: transformers con `trust_remote_code`; para servicio de alto rendimiento se requieren frameworks con soporte de paralelismo tensor y de expertos (vLLM, SGLang o TGI con backend MoE). No se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La presencia del decodificador especulativo MTP de 5 capas sugiere una mejora de latencia respecto a decodificacion autoregresiva pura, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-RL | 1,02 B totales / 42 B activos | 1M | MIT | Hugging Face, ModelScope | DeepSWE 71,9; Terminal Bench 2.1 89,9 |
| MiMo-V2.6-Flash-RL | no disponible | no disponible | no disponible | Hugging Face, ModelScope | DeepSWE 67,9; Terminal Bench 2.1 87,6 |
| MiMo-V2.5-Pro | no disponible | no disponible | no disponible | Hugging Face | DeepSWE 19,0; Terminal Bench 2.1 65,2 |
| Claude Opus 5 | no disponible (propietario) | no disponible | propietaria | API | DeepSWE 74,0; Terminal Bench 2.1 89,1 |
| GPT-5.6 Sol | no disponible (propietario) | no disponible | propietaria | API | DeepSWE 73,0; Terminal Bench 2.1 88,8 |

La comparativa se limita a los datos publicados en la model card; no se dispone de informacion sobre parametros, contexto ni licencia de los modelos propietarios ni de las variantes Flash y V2.5.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad fuera del ambito de ciberseguridad; el entrenamiento con RL sobre entornos de agente puede heredar sesgos de las rubricas y de los profesores.
- Alucinacion: no se publican tasas de alucinacion; en tareas de agente con herramientas el riesgo se mitiga parcialmente con verificadores, pero persiste en generacion abierta.
- Contexto: la ventana de 1M tokens es amplia, pero el coste computacional y de memoria crece con la longitud; no se documenta la degradacion efectiva a contextos maximos.
- Licencia: MIT permite uso comercial, pero el modelo requiere `custom_code` y `trust_remote_code`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegarlo.
- Despliegue: el tamano (573,5 GB) y los 1,02 B de parametros hacen inviable el uso en hardware de consumo; la inferencia exige infraestructura multi-GPU o multi-nodo.
- Repositorio espejo: la publicacion `blearyhope/MiMo-V2.6-Pro-RL` tiene 0 descargas y 0 likes y no es el repositorio oficial de Xiaomi; se recomienda usar `XiaomiMiMo/MiMo-V2.6-Pro-RL` para produccion.
- Datos incompletos: la model card corta la tabla de benchmarks y no ofrece detalles de cuantizacion, latencia ni composicion exacta del dataset de entrenamiento.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/blearyhope/MiMo-V2.6-Pro-RL
- Hugging Face (oficial): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Blog: https://mimo.xiaomi.com/mimo-v2-6
- Informe tecnico: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Plataforma API: https://platform.xiaomimimo.com
- Studio: https://aistudio.xiaomimimo.com
- Desktop: https://mimo.xiaomimimo.com/desktop/
- Repositorio GitHub: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
