# isilicon/mango-mimo26-flash-mopd-uncensored-q3km

## Resumen

MiMo V2.6 Flash MOPD es un modelo de lenguaje de gran escala (309.766.601.088 parametros totales segun los safetensors del repositorio) publicado por el usuario spiritfather y preservado en este repositorio por isilicon bajo la etiqueta Mango. Se distribuye unicamente en formato GGUF cuantizado a Q3_K_M, con un payload de 151,61 GB (141,20 GiB) en un unico archivo, y esta pensado para inferencia local o en servidores con suficiente memoria, no para entrenamiento. La model card lo describe como una variante "uncensored" del modelo base, es decir, con los filtros de rechazo relajados o eliminados por el autor original.

El modelo se presenta como una "configuracion medida": el repositorio no solo aloja los pesos, sino que documenta una evaluacion propia con puntuacion ponderada de 79,39 sobre 100, una carga de trabajo de 220,28 minutos sobre 202 preguntas mas 12 casos de agente, y una tasa de exito mecanico de 12/12 en dichos casos. Es relevante ahora porque ejemplifica una practica creciente en el ecosistema open source: la preservacion de artefactos cuantizados con procedencia verificable (revision `f1adc2e15d07b84bc35b7e0ba6e2b7df5094ff3f` del publicador original) y evaluacion reproducible, algo util cuando los repositorios upstream desaparecen o cambian.

La licencia declarada es MIT, lo que en principio permite uso comercial, pero conviene senalar que el modelo base es una modificacion de un modelo del que no se documenta el origen en la informacion disponible, y que la naturaleza "uncensored" implica que las salvaguardas habituales han sido alteradas por el autor upstream. El contexto maximo, los idiomas soportados y los detalles de arquitectura no aparecen en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni hibrida) |
| Parametros totales | 309.766.601.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (unico artefacto publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tamano del payload | 151,61 GB (141,20 GiB), 1 archivo principal |
| Modelo base | spiritfather/MiMo-V2.6-Flash-MOPD-Yamz-Uncensored-GGUF |
| Revision del origen | f1adc2e15d07b84bc35b7e0ba6e2b7df5094ff3f |
| Libreria | gguf |
| Pipeline | text-generation |
| Descargas | 57 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo: no se especifica si es un transformer denso, un mixture-of-experts, un modelo hibrido con capas de atencion lineal o cualquier otra variante. El nombre "Flash" y el sufijo "MOPD" sugieren una variante optimizada para eficiencia y un proceso de post-entrenamiento o destilacion, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado en la model card. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similar.

Lo que si esta documentado es el proceso de cuantizacion: el repositorio preserva un unico artefacto Q3_K_M generado por spiritfather a partir de su release original, sin modificacion de los bytes de origen. La model card de isilicon indica explicitamente que "the original model, modification and quantization remain the upstream creators' work" y que este repositorio solo anade preservacion atribuida y evaluacion de la configuracion exacta. No se mencionan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de pensamiento extendido.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Razonamiento y conocimiento general: la evaluacion local reporta 100,00 sobre 100 en el subconjunto MMLU-Pro de 14 preguntas y 80,00 en MATH-500 niveles 4-5 (5 preguntas).
- Generacion de codigo: 90,00 sobre 100 en los tests locales HumanEval+ (20 preguntas, 18/20 superadas).
- Ciberseguridad: 85,00 sobre 100 en el dominio agregado, con 100,00 en CyberMetric (20 preguntas), 75,00 en CTI multiple choice y 80,00 en CTI root-cause/CWE.
- Tool calling / function calling: evaluado con 40 llamadas estilo BFCL, con un 65,00 de acierto.
- Comportamiento agentico: 12/12 casos mecanicos superados, cubriendo finalizacion, evidencia, permisos y totales de precios aplicables.
- Seguimiento de instrucciones: 90,00 sobre 100 en IFEval estricto (20 prompts).
- Comprension social y emocional: 65,47 sobre 100 en el dominio agregado, con 80,95 en EQ-Bench v2 y 50,00 en etiquetas OpenToM.
- Capacidades multimodales (vision, audio): no disponible; no se mencionan en la informacion.
- Modo de pensamiento explicito: no disponible.
- Idiomas: no disponible.

## Casos de uso

- Asistencia en ciberseguridad defensiva: el modelo obtiene 100,00 en CyberMetric y 80,00 en identificacion de causa raiz/CWE, por lo que puede emplearse para triaje de alertas, clasificacion de incidentes y redaccion de resumenes tecnicos a partir de trazas y logs, con revision humana obligatoria dado el caracter uncensored del modelo.
- Generacion de codigo en pipelines internos: con 18/20 tests HumanEval+ superados, es adecuado para autocompletar funciones, generar tests unitarios y proponer parches en repositorios donde el equipo controle la revision; no se recomienda como unico generador en produccion sin tests automatizados que validen la salida.
- Automatizacion de agentes con tool calling: los 12/12 casos mecanicos y las 40 llamadas BFCL evaluadas permiten integrarlo en flujos de agente que consulten APIs, calculen presupuestos o verifiquen permisos, siempre con validacion de esquema y limites de accion.
- Analisis de documentos largos y conversaciones multi-turno: aunque el contexto no esta documentado, el formato conversacional y la evaluacion multi-pregunta sugieren uso en asistentes internos de soporte tecnico; conviene medir el contexto real antes de desplegar.
- Razonamiento matematico asistido: con 80,00 en MATH-500 niveles 4-5 sobre una muestra pequena, puede servir como apoyo en tutoria o generacion de problemas, pero la muestra de 5 preguntas es demasiado reducida para garantizar robustez.
- Investigacion sobre alineacion y modelos sin censura: al ser una variante "uncensored" con evaluacion documentada, es util como objeto de estudio comparativo para medir como cambia el rendimiento en dominios sensibles al retirar salvaguardas.
- Despliegue local en estaciones de trabajo de gama alta: el unico artefacto Q3_K_M de 141,20 GiB encaja en servidores con suficiente RAM o en configuraciones multi-GPU; ver la seccion de hardware.

## Benchmarks y rendimiento

Los datos proceden de la evaluacion propia de isilicon (Mango), con subconjuntos pequenos y graders locales. No son los pipelines oficiales completos de cada benchmark.

| Tarea / grader local | n | Resultado | Intervalo 95% | Metodo |
|---|---|---|---|---|
| EQ-Bench v2 | 30 | 80,95 | 73,52–87,44 | media bootstrap |
| OpenToM labels | 18 | 50,00 | 29,03–70,97 | Wilson |
| CTI multiple choice | 20 | 75,00 | 53,13–88,81 | Wilson |
| CTI root-cause / CWE | 15 | 80,00 | 54,81–92,95 | Wilson |
| CyberMetric | 20 | 100,00 | 83,89–100,00 | Wilson |
| Llamadas locales estilo BFCL | 40 | 65,00 | 49,51–77,87 | Wilson |
| Tests locales HumanEval+ | 20 | 90,00 | 69,90–97,21 | Wilson |
| IFEval estricto (pass por prompt) | 20 | 90,00 | 69,90–97,21 | Wilson |
| Subconjunto MMLU-Pro | 14 | 100,00 | 78,47–100,00 | Wilson |
| MATH-500 niveles 4-5 | 5 | 80,00 | 37,55–96,38 | Wilson |
| Heuristica de bucle de agente | 12 | 100,00 | 75,75–100,00 | Wilson |

Puntuacion ponderada por dominio: 79,39 sobre 100, con pesos de 30% en social/emocional (65,47), 20% en ciberseguridad (85,00), 10% en codigo (90,00), 30% en comprobaciones agenticas (82,50), 5% en seguimiento de instrucciones (90,00) y 5% en conocimiento general/matematicas (90,00).

Rendimiento registrado:

| Medicion | Valor |
|---|---|
| Carga de trabajo completa | 220,28 min |
| Tiempo de peticiones de la suite | 208,59 min |
| Tiempo de los 12 casos de agente | 11,69 min |
| Tareas por minuto | 0,97 |
| Latencia p50 / p95 de peticiones | 13,62 s / 147,27 s |
| TTFT p50 / p95 | 3,65 s / 6,41 s (202/202 registradas) |
| Tasa mediana de tokens de salida por segundo de peticion | 19,28 |
| Tokens de finalizacion reportados | 270.256 (202/202 peticiones) |
| Finalizaciones por longitud | 2 |
| Casos de agente mecanicos superados | 12/12 |

Advertencia de la propia model card: la tasa de tokens divide contadores del motor entre el tiempo de peticion, no es throughput nativo de decodificacion, y no implica resultados en servicio concurrente.

## Requisitos de hardware

- VRAM/RAM estimada: el payload Q3_K_M ocupa 141,20 GiB en disco. Para inferencia hay que sumar cache KV y memoria de trabajo; la model card advierte explicitamente que el tamano del payload no implica que el modelo quepa en la misma cantidad de VRAM.
- GPU recomendadas: no disponible en la informacion. Por el tamano, un unico acelerador de 80 GB (A100, H100) no es suficiente para alojar los pesos completos; se requeriria reparto entre varias GPU o inferencia en CPU con RAM abundante.
- Cabe en GPU consumer: no, con el unico cuantizado Q3_K_M publicado (141,20 GiB) no cabe en ninguna GPU consumer actual (24 GB en RTX 4090, 32 GB en RTX 5090). Se necesitarian configuraciones multi-GPU o sistemas con 192 GB o mas de RAM.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son los entornos naturales para GGUF. vLLM y TGI no estan confirmados para este artefacto en la informacion disponible.
- Latencia y throughput: en la configuracion medida, p50 de 13,62 s y p95 de 147,27 s por peticion, TTFT p50 de 3,65 s, y 0,97 tareas por minuto. Son cifras de un unico host sin concurrencia; no deben extrapolarse.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables de la misma categoria ni el contexto o los idiomas del modelo, por lo que no es posible construir una comparativa fiable de parametros, contexto y rendimiento frente a alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiMo V2.6 Flash MOPD Q3_K_M (este) | 309.766.601.088 | no disponible | MIT | GGUF en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

La model card menciona una comparacion con "Qwen27" en tiempo de carga de trabajo (9,19 veces mas lento), pero no aporta especificaciones de ese modelo ni resultados de calidad pareados, por lo que no se incluye como comparativa formal.

## Limitaciones y advertencias

- Modelo "uncensored": el autor upstream ha relajado o eliminado las salvaguardas de rechazo. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion; los benchmarks incluidos miden tareas acotadas con graders locales, no veracidad general.
- Muestras de evaluacion muy pequenas: MATH-500 con n=5, MMLU-Pro con n=14 y OpenToM con n=18 producen intervalos de confianza amplios (por ejemplo, 37,55–96,38 en MATH-500). Los resultados no son concluyentes.
- Benchmarks no oficiales: HumanEval+ y BFCL se evaluaron con subconjuntos y graders locales, no con los pipelines oficiales completos.
- Rendimiento social/emocional debil en relacion con el resto: 65,47 ponderado, con OpenToM en 50,00, lo que limita su uso en tareas de comprension de teoria de la mente.
- Tool calling moderado: 65,00 en llamadas BFCL locales; requiere validacion de esquema y manejo de errores en produccion.
- Contexto e idiomas no documentados: no se puede garantizar el comportamiento en ventanas largas ni en castellano sin pruebas propias.
- Licencia MIT declarada, pero el modelo base es una modificacion de origen no documentado en la informacion; conviene revisar la cadena de licencias upstream antes de un uso comercial.
- Un unico cuantizado Q3_K_M: no hay opciones Q4, Q5, Q8 ni FP16 en este repositorio, lo que limita el ajuste de calidad frente a memoria.
- Rendimiento lento en la configuracion medida: 0,97 tareas por minuto y p95 de 147,27 s por peticion; no apto para interaccion en tiempo real sin hardware muy superior.
- Repositorio de preservacion: 57 descargas y 0 likes; no hay evidencia de adopcion amplia ni de mantenimiento a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/isilicon/mango-mimo26-flash-mopd-uncensored-q3km
- Modelo base: https://huggingface.co/spiritfather/MiMo-V2.6-Flash-MOPD-Yamz-Uncensored-GGUF
- Coleccion Mango de modelos probados y espejos de preservacion: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluacion Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (referenciado en la model card): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad en Discord: https://discord.gg/5n5YDbQCMy
