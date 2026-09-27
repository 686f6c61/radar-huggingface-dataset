# MikeRoz/MiMo-V2.6-Pro-RL-4.04bpw-h8-exl3

## Resumen

MiMo-V2.6-Pro-RL es el checkpoint insignia de la serie MiMo-V2.6 de Xiaomi, y esta ficha describe concretamente la cuantizacion publicada por el usuario MikeRoz bajo el identificador `MikeRoz/MiMo-V2.6-Pro-RL-4.04bpw-h8-exl3`. Se trata de una conversion a EXL3 de 4,04 bits por peso (variante h8) del modelo original `XiaomiMiMo/MiMo-V2.6-Pro-RL`, pensada para ejecucion con la pila ExLlamaV3 en lugar de los pesos en precision completa. El modelo base es un transformer disperso de tipo Mixture of Experts (MoE) con backbone hibrido de atencion de ventana deslizante, 1M tokens de contexto y cuatro modalidades nativas: texto, imagen, video y audio.

La propuesta tecnica de la serie MiMo-V2.6 es escalar el aprendizaje por refuerzo hacia la automejora: un unico ciclo mixto de RL que cubre codigo, agentes generales, tareas visuales y ciberseguridad, con GRPO asincrono sobre lotes muy grandes (1.568 prompts x 16 rollouts por paso) y un sistema de calificacion agentica por grupos (GRS y GAR) que ordena las trayectorias que aprueban en lugar de limitarse a un binario aprobado/suspendido. La model card declara 1,02 T de parametros totales con 42 B activos, 1M de contexto y un decodificador especulativo MTP de 5 capas.

La relevancia practica de esta ficha concreta es doble. Por un lado, permite evaluar si una cuantizacion de 4 bits es viable para desplegar un modelo MoE de escala frontera en hardware propio; por otro, obliga a senalar una discrepancia importante: los metadatos de safetensors del repo declaran 260.208.587.136 parametros, mientras que el tamano del repositorio (520,6 GB) es coherente con ~1,02 T de parametros a 4,04 bpw. Ese desajuste, junto con la ausencia de descargas y validacion comunitaria, condiciona cualquier decision de adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso MoE (Mixture of Experts) con backbone hibrido SWA; pesos almacenados en EXL3 |
| Parametros totales | 260.208.587.136 (~260,2 B) segun los metadatos de safetensors del repo; la model card del modelo base declara 1,02 T totales. Discrepancia no aclarada (ver limitaciones) |
| Parametros activos | 42 B (segun la model card del modelo base) |
| Longitud de contexto | 1.000.000 tokens (1 M) |
| Tipos de cuantizacion | EXL3 a 4,04 bits por peso con variante h8; el modelo base se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors con cuantizacion EXL3 y `custom_code` (requiere ExLlamaV3); el repo no incluye GGUF |
| Modalidades | Texto, imagen, video y audio |
| Codificador de vision | MiMo ViT de 681 M de parametros (28 capas: 24 SWA + 4 full) |
| Codificador de audio | AudioTokenizer de 308 M + codificador de parches de audio de 127 M |
| Decodificacion especulativa | Multi-Token Prediction (MTP) con decodificador de 5 capas |
| Tamano del repositorio | 520,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

El modelo base combina un backbone transformer con atencion de ventana deslizante en la mayor parte de las capas y un numero reducido de capas de atencion completa, sobre el que se monta una capa MoE dispersa: 1,02 T de parametros totales con 42 B activos por token. Los codificadores multimodales son especificos y separados: un ViT de 681 M de parametros para vision (28 capas, 24 de ventana deslizante y 4 completas) y un frontal de audio compuesto por un AudioTokenizer de 308 M mas un codificador de parches de 127 M. La generacion se acelera con un decodificador especulativo MTP de 5 capas. Esta ficha describe la version cuantizada en EXL3, de modo que los pesos se almacenan a 4,04 bits con la variante h8 y requieren el runtime ExLlamaV3 para descomprimirse en tiempo de inferencia.

El entrenamiento se articula en torno a un unico ciclo mixto de RL que mezcla en el mismo lote tareas de codigo, agentes generales, vision y ciberseguridad, con distintos arneses de evaluacion, en lugar de ejecutar ciclos separados por dominio. El algoritmo es GRPO totalmente asincrono con lotes de 1.568 prompts x 16 rollouts por paso y miles de millones de tokens por actualizacion. La senal de recompensa se escala mediante calificacion agentica por grupos: GRS construye rubricas especificas de tarea fuera de linea a partir de rollouts contrastados y las fusiona con los resultados de los tests, mientras que GAR ordena en linea las trayectorias que aprueban y desplaza la ventaja hacia las soluciones de mayor calidad. El ciclo se completa con un arranque en frio basado en autocorreccion (el modelo reescribe sus propios turnos desalineados), endurecimiento de entornos y verificacion cruzada contra el reward hacking, y una fase final de destilacion on-policy multi-profesor (MOPD2). No se detalla en la informacion disponible la composicion exacta del dataset de preentrenamiento ni el numero de tokens de esa fase.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento agentico de largo horizonte, con soporte explicito para ejecuciones de multiples sesiones dentro de la ventana de 1M tokens.
- Agentes de codigo y de software: la familia se evalua en DeepSWE v1.1, ProgramBench y MiMo Code Bench.
- Uso de herramientas y function calling, evidenciado por su evaluacion en Toolathlon-Verified y AutomationBench.
- Automatizacion de escritorio y terminal: evaluada en OSWorld-Verified, Terminal Bench 2.1/4.0 y JobBench.
- Vision: comprension de imagen mediante el ViT MiMo de 681 M de parametros.
- Comprension de video: la etiqueta `video-understanding` figura entre las capacidades declaradas.
- Audio: frontal dedicado con AudioTokenizer de 308 M y codificador de parches de 127 M.
- Ciberseguridad: la model card incluye un bloque de evaluacion CyberGym (datos truncados en el material proporcionado).
- Inferencia acelerada mediante decodificacion especulativa MTP de 5 capas frente a la decodificacion autoregresiva clasica.
- Autocorreccion: el entrenamiento incluye un arranque en frio en el que el modelo reflexiona y reescribe sus propios turnos.
- No se especifica explicitamente la existencia de un modo de razonamiento (thinking mode) ni de salida de audio; no disponible.

## Casos de uso

- Agentes de reparacion de codigo en produccion: con 1M de tokens de contexto el modelo puede cargar un repositorio completo, trazas de herramientas y el historial de varias sesiones, y proponer parches evaluables con los arneses tipo DeepSWE o ProgramBench.
- Orquestacion de pipelines de CI/CD con tool calling: su entrenamiento en Toolathlon-Verified y AutomationBench lo hace apto para encadenar llamadas a herramientas (tests, linters, despliegues) dentro de un bucle de varios pasos.
- Automatizacion de tareas de escritorio: con 82,0 en OSWorld-Verified, es adecuado para agentes que controlan interfaces graficas en tareas repetitivas de back office.
- Atencion al cliente multilingue (ingles y chino) con contexto largo: puede mantener hilos de conversacion prolongados y recuperar informacion de sesiones anteriores dentro de la misma ventana.
- Analisis de documentacion tecnica multimodal: al combinar vision y texto, permite procesar manuales con diagramas, capturas de pantalla y esquemas junto al texto asociado.
- Revision de seguridad de codigo y analisis defensivo: el bloque de entrenamiento mixto incluye ciberseguridad, por lo que puede emplearse en triaje de vulnerabilidades y explicacion de hallazgos.
- Resumen y extraccion de informacion en video y audio: la presencia de codificadores dedicados permite transcribir y estructurar contenido audiovisual sin modelos auxiliares.
- Investigacion sobre RL a escala: el checkpoint es util como referencia para reproducir o comparar tecnicas de calificacion agentica (GRS/GAR) y destilacion MOPD2.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del modelo base `MiMo-V2.6-Pro-RL` y corresponden al modelo sin cuantizar, no a esta conversion EXL3. La tabla del material disponible se corta en el bloque de ciberseguridad (CyberGym), por lo que esa fila no tiene valores.

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
| CyberGym | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks medidos especificamente sobre la cuantizacion EXL3 de 4,04 bpw, ni cifras de MMLU, HumanEval o GSM8K para esta variante.

## Requisitos de hardware

- VRAM segun el recuento de parametros: si el modelo tiene realmente 1,02 T de parametros, los pesos a 4,04 bpw ocupan aproximadamente 515 GB, coherente con los 520,6 GB del repositorio. Si el dato de safetensors (260,2 B) fuese el correcto, los pesos ocuparian unos 131 GB. La discrepancia no esta resuelta en la informacion disponible.
- Escenario de 1,02 T de parametros: se necesitan al menos 7-8 GPU de 80 GB (H100, H200 o A100 80 GB) solo para los pesos, mas el margen para cache KV y activaciones. No cabe en un nodo de 8 GPU consumer.
- Escenario de 260,2 B de parametros: un minimo de 2 GPU de 80 GB (H100 o A100 80 GB) para los pesos, con margen adicional para cache.
- GPU consumer: no cabe en una RTX 4090 (24 GB), ni en una RTX 5090, ni siquiera repartiendo entre varias, dado el tamano del repositorio y el soporte requerido de EXL3.
- Cache KV: con 1M tokens de contexto la cache puede crecer de forma muy significativa. No se dispone de cifras concretas de capas, cabezas KV ni tipos de dato de cache para esta variante; no disponible.
- Despliegue: el formato EXL3 exige ExLlamaV3 (por ejemplo mediante TabbyAPI) para cargar los pesos. vLLM, llama.cpp, Ollama y TGI no soportan EXL3 de forma nativa; usarlos requeriria reconvertir los pesos, lo que no esta cubierto en la informacion disponible.
- El repositorio incluye `custom_code`, por lo que la carga requiere `trust_remote_code` habilitado.
- Latencia y throughput estimados: no disponible. La decodificacion especulativa MTP de 5 capas del modelo base deberia reducir el coste por token, pero no se publican mediciones para esta cuantizacion.

## Comparativa con modelos similares

La comparacion mas directa es dentro de la propia familia MiMo y con los modelos frontera citados en la tabla de evaluacion. Los datos de parametros y contexto de los modelos de terceros no se detallan en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Resultado destacado |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-RL (4,04 bpw EXL3) | 1,02 T totales / 42 B activos segun model card; 260,2 B segun safetensors del repo | 1 M | MIT | HuggingFace (repo de MikeRoz, 0 descargas) | Sin benchmarks propios de la cuantizacion |
| MiMo-V2.6-Pro-RL (original) | 1,02 T / 42 B activos | 1 M | MIT | HuggingFace y ModelScope (XiaomiMiMo) | DeepSWE v1.1 71,9; Toolathlon-Verified 76,9; OSWorld-Verified 82,0 |
| MiMo-V2.6-Flash-RL | no disponible | no disponible | MIT (segun repositorio de la familia) | HuggingFace y ModelScope | DeepSWE v1.1 67,9; Terminal Bench 2.1 87,6; Terminal Bench 4.0 28,8 |
| MiMo-V2.5-Pro | no disponible | no disponible | no disponible | HuggingFace | DeepSWE v1.1 19,0; AutomationBench 16,0; Terminal Bench 4.0 1,5 |
| Claude Opus 5 | no disponible | no disponible | propietaria | API comercial | DeepSWE v1.1 74,0; ProgramBench 37,0; GDPval-AA 2.1 1708 |
| GPT-5.6 Sol | no disponible | no disponible | propietaria | API comercial | DeepSWE v1.1 73,0; GDPval-AA 2.1 1588; OSWorld-Verified 83,0 |

## Limitaciones y advertencias

- Discrepancia de tamano sin resolver: los metadatos de safetensors indican 260.208.587.136 parametros, mientras que la model card del modelo base declara 1,02 T y el tamano del repositorio (520,6 GB) encaja con ~1,02 T a 4,04 bpw. Hay que verificar el recuento real antes de dimensionar hardware.
- Sin validacion comunitaria: el repositorio acumula 0 descargas y 0 likes, y no hay resultados de benchmarks publicados para esta cuantizacion concreta. Se desconoce la degradacion introducida por los 4,04 bpw frente al modelo original.
- Alcance limitado de idiomas: solo ingles y chino. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: es un modelo de lenguaje generativo; las tareas agenticas con ejecucion de herramientas amplifican el impacto de un error, por lo que conviene mantener verificacion y limites de accion.
- Licencia: el repositorio declara MIT, pero se trata de una cuantizacion de terceros sobre un modelo de Xiaomi. Conviene confirmar los terminos del modelo base y las obligaciones de atribucion antes de un uso comercial.
- Dependencia de software: EXL3 obliga a ExLlamaV3 o TabbyAPI; no hay ruta directa a vLLM, llama.cpp, Ollama ni TGI sin reconversion.
- Requisitos de `custom_code`: la carga implica ejecutar codigo remoto, lo que exige revisar el repositorio antes de desplegarlo en entornos sensibles.
- Coste de contexto: aunque la ventana es de 1M tokens, la cache KV a esa longitud puede ser prohibitiva en memoria y encarecer mucho la inferencia; no se publican cifras.
- Datos de evaluacion incompletos: la tabla de benchmarks disponible se corta en el bloque de ciberseguridad y no incluye referencias clasicas como MMLU, GSM8K o HumanEval.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad alineada mas alla de las menciones cualitativas al endurecimiento de entornos durante el RL.
- Comparaciones con modelos propietarios: los valores de Claude Opus 5, GPT-5.6 Sol y Claude Fable 5 provienen de la model card del autor del modelo base y no se han verificado de forma independiente.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/MikeRoz/MiMo-V2.6-Pro-RL-4.04bpw-h8-exl3
- Modelo base en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Modelo base en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Variante Flash en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Variante Flash en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Blog de la serie: https://mimo.xiaomi.com/mimo-v2-6
- Informe tecnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Repositorio GitHub del proyecto MiMo: https://github.com/XiaomiMiMo/MiMo
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Estudio web de Xiaomi MiMo: https://aistudio.xiaomimimo.com
- Aplicacion de escritorio: https://mimo.xiaomimimo.com/desktop/
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Grupo de WeChat: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro/blob/main/assets/wechat.jpg

Nota sobre la busqueda web: los resultados proporcionados corresponden a medios generalistas (Le Figaro) y no aportan informacion tecnica relevante sobre el modelo, por lo que no se han utilizado como fuente.
