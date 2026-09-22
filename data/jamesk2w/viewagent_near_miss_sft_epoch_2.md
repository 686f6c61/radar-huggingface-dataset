# JamesK2W/viewagent_near_miss_sft_epoch_2

## Resumen

viewagent_near_miss_sft_epoch_2 es un checkpoint de ajuste supervisado (SFT) publicado por el usuario JamesK2W sobre el modelo multimodal Qwen3-VL-8B-Instruct. No se trata de un modelo de proposito general, sino de un artefacto de investigacion perteneciente a un pipeline denominado ViewAgent GraphRL, orientado a la planificacion interactiva de vistas (interactive view planning) sobre escenas 3D del dataset ScanNet. El checkpoint se construye a partir de las rollouts de RL de la epoca 2, de las que se extraen demostraciones "near_miss" para un SFT posterior, continuando desde los pesos de RL de esa misma epoca (lo que la model card denomina pipeline B).

El modelo cuenta con 8.767.123.696 parametros (~8,77 mil millones) segun los pesos en safetensors, y se distribuye bajo licencia Apache 2.0. La model card reporta un unico resultado de evaluacion: pass@8 del 10,5 % en la tarea objetivo del pipeline. Se carga con `AutoModelForImageTextToText.from_pretrained` y esta pensado para servirse directamente con SGLang o vLLM.

Su relevancia es limitada y muy especifica: se trata de un checkpoint intermedio de un experimento de investigacion (0 descargas y 0 likes en el momento de la consulta), sin model card extensa ni datos de benchmarks generales. Resulta de interes para quienes trabajan en agentes visuales, navegacion activa, razonamiento espacial multi-vista o reproduccion de pipelines GraphRL, no como sustituto de un VLM de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivado de Qwen3-VL-8B-Instruct; no se detallan en la informacion proporcionada los componentes internos (vision encoder, atencion, etc.) |
| Parametros totales | 8.767.123.696 (~8,77 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica / no disponible: la informacion proporcionada no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors a precision completa (no se incluyen GGUF, AWQ, GPTQ ni variantes INT8/INT4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 17,5 GB) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (finetune) |
| Autor | JamesK2W |
| Pipeline de HuggingFace | No disponible |
| Fecha de creacion / actualizacion | 22 de septiembre de 2026 / 22 de septiembre de 2026 |
| Tarea objetivo | Planificacion interactiva de vistas (ViewAgent) sobre ScanNet |
| Etiquetas | safetensors, qwen3_vl, viewagent, graphrl, region:us |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct, un transformer multimodal texto-imagen del que este checkpoint hereda todos los pesos tras un proceso de ajuste. La model card no describe modificaciones estructurales, capas adicionales ni cambios de tokenizador: se trata de un finetune completo del modelo base, no de un adaptador. Los detalles concretos de la arquitectura (numero de capas, dimension oculta, mecanismo de atencion, resolucion de vision, ventana de contexto) no se proporcionan en la informacion disponible y deberian consultarse en la model card del modelo base.

El entrenamiento sigue un esquema de dos etapas dentro del pipeline ViewAgent GraphRL. En la primera se aplica RL sobre tareas de planificacion interactiva de vistas en entornos ScanNet, generando rollouts. En la segunda (epoca 2, pipeline B), se construyen demostraciones "near_miss" a partir de esas rollouts de RL y se ejecuta un SFT que continua desde los pesos de RL de la epoca 2. El resultado es el checkpoint aqui descrito, cuya evaluacion reportada es pass@8 = 10,5 %. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset mas alla de ScanNet, ni si se emplearon tecnicas adicionales como DPO, decodificacion especulativa o atencion lineal.

## Capacidades

- Comprension de imagenes y texto: al derivar de Qwen3-VL-8B-Instruct, conserva la capacidad multimodal base de procesar entradas de imagen y texto, aunque no se documentan evaluaciones especificas de estas capacidades en el checkpoint.
- Planificacion interactiva de vistas: capacidad central del pipeline ViewAgent, consistente en decidir movimientos o vistas sucesivas para explorar y razonar sobre una escena 3D.
- Razonamiento espacial multi-vista sobre escenas interiores: entrenado sobre ScanNet, un dataset de interiores con reconstrucciones 3D y anotaciones semanticas.
- Ejecucion de la tarea objetivo con pass@8 del 10,5 %, segun la evaluacion reportada por el autor.
- Carga y despliegue como modelo de imagen-a-texto mediante `AutoModelForImageTextToText` y servido con SGLang o vLLM.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso general: no documentado; el enfasis agentico del pipeline se limita a la planificacion de vistas.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, audio, video): no documentadas en la informacion disponible.

## Casos de uso

- Investigacion en navegacion activa y agentes visuales: el checkpoint puede servir como punto de partida o referencia para reproducir y comparar variantes de planificacion de vistas, dado que el pipeline (GraphRL mas SFT sobre near_miss) esta identificado y el modelo se carga con APIs estandar de transformers.
- Razonamiento espacial sobre reconstrucciones de interiores: uso en experimentos que requieran decidir que vista tomar a continuacion en una escena ScanNet para responder una pregunta o localizar un objeto.
- Evaluacion de pipelines de RL con SFT posterior: permite analizar si el SFT sobre demostraciones near_miss mejora o degrada el comportamiento respecto a los pesos de RL de la epoca 2, al ser un artefacto intermedio claramente etiquetado.
- Servicio de inferencia multimodal a baja escala: al ser un modelo de ~8,77 mil millones de parametros, se puede desplegar con vLLM o SGLang en una GPU de 24 GB o en varias GPU para prototipos internos de vision-lenguaje.
- Generacion de datos sinteticos de trayectorias de vista: las salidas del modelo pueden emplearse para producir demostraciones adicionales que alimenten nuevas rondas de SFT o RL, siempre con filtrado y validacion humana.
- Base para ablaciones sobre curacion de datos: el uso de demostraciones "near_miss" (casos cercanos al exito) es una decision de diseno concreta que puede compararse frente a alternativas basadas solo en rollouts exitosos.
- Docencia y experimentacion academica: util para ilustrar en cursos o laboratorios como se encadena RL y SFT en un mismo pipeline multimodal, con un coste de computo contenido por el tamano del modelo.

## Benchmarks y rendimiento

El unico dato de evaluacion presente en la informacion proporcionada es el siguiente:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Tarea ViewAgent (planificacion interactiva de vistas, ScanNet) | pass@8 | 10,5 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de cualquier otro benchmark estandar de modelos de lenguaje o vision-lenguaje. Tampoco se proporcionan comparaciones con el modelo base ni con otros checkpoints del mismo pipeline. Cualquier cifra adicional que se atribuya a este modelo seria especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 17,5 GB en el repositorio. En bf16/fp16 se necesitan aproximadamente 17,5 GB solo para pesos, mas la cache KV, el buffer de activaciones y el procesamiento de imagenes; en la practica conviene reservar 20-24 GB como minimo para una sola peticion con contexto moderado.
- Cuantizacion: no se publican pesos cuantizados. Si se cuantiza por cuenta propia, cabria esperar del orden de 9 GB en INT8 y 5-6 GB en INT4 para los pesos, aunque el impacto en la tarea especifica no esta documentado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o similares para servicio en bf16 con margen; una RTX 4090 o RTX 3090 de 24 GB puede bastar para inferencia en bf16 con lotes pequenos y contexto corto, pero sin margen para lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 5090) con precision bf16 y configuracion conservadora; en GPUs de 12-16 GB solo tras cuantizacion.
- Opciones de despliegue: SGLang y vLLM estan explicitamente mencionados por el autor; tambien es posible cargarlo con `transformers` mediante `AutoModelForImageTextToText.from_pretrained`. No se menciona soporte de llama.cpp u Ollama, coherente con la ausencia de GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para este checkpoint mas alla del pass@8 = 10,5 % en su tarea especifica. La unica comparacion que puede establecerse con rigor es con su modelo base, y solo en terminos de identidad y licencia, no de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato | Tarea / notas |
|---|---|---|---|---|---|
| viewagent_near_miss_sft_epoch_2 | 8,77 mil millones | No disponible | Apache 2.0 | safetensors | Checkpoint de investigacion para planificacion de vistas en ScanNet; pass@8 10,5 % |
| Qwen/Qwen3-VL-8B-Instruct | ~8 mil millones (no confirmado en la informacion proporcionada) | No disponible | No disponible en la informacion proporcionada | safetensors | Modelo base multimodal de proposito general; sin datos de benchmark en esta busqueda |
| Otros VLM de ~7-9 mil millones (por ejemplo, alternativas de la misma categoria) | No disponible | No disponible | No disponible | No disponible | No se dispone de resultados comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Rendimiento bajo y acotado: el propio autor reporta pass@8 = 10,5 %, lo que indica un exito limitado incluso con ocho intentos; no es adecuado para producción sin verificacion humana.
- Dominio muy restringido: el entrenamiento se basa en ScanNet (escenas de interior escaneadas) y en la tarea de planificacion de vistas; el comportamiento fuera de ese dominio no esta caracterizado y probablemente degrade.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad, y los modelos multimodales de esta escala pueden describir objetos o geometria inexistentes en la imagen.
- Artefacto intermedio de investigacion: es el checkpoint de la epoca 2 de un pipeline, con 0 descargas y 0 likes en el momento de la consulta; carece de validacion por parte de la comunidad.
- Idiomas no declarados: no se especifica lista de idiomas soportados; no debe asumirse buen rendimiento en castellano ni en ningun otro idioma concreto.
- Longitud de contexto no especificada: no se puede planificar el uso con documentos o secuencias largas sin consultar la model card del modelo base.
- Ausencia de cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en hardware de gama baja.
- Trazabilidad limitada: la model card es muy breve y no detalla hiperparametros, volumen de datos, composicion del dataset ni metodologia de evaluacion, lo que dificulta reproducir el resultado reportado.
- Licencia: aunque el repositorio declara Apache 2.0, conviene verificar las condiciones de la licencia del modelo base Qwen3-VL-8B-Instruct antes de un uso comercial, ya que pueden existir condiciones adicionales no reflejadas en esta ficha.
- Datos de terceros: el uso de ScanNet puede estar sujeto a sus propios terminos de uso, independientes de la licencia del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamesK2W/viewagent_near_miss_sft_epoch_2
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset ScanNet (sitio oficial): http://www.scan-net.org/
- Paper, repositorio de codigo del pipeline GraphRL, blog o demo: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (corresponden a portales de identificacion del Gobierno de Chipre), por lo que no se ha podido extraer de ellos informacion tecnica util.
