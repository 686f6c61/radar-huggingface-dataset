# Rology/rad-decider

## Resumen

rad-decider es un adaptador LoRA (r = 32) publicado por Rology sobre el modelo base `Qwen/Qwen3.5-0.8B`. No es un modelo generativo de texto: recibe un caso de radiologia (orden medica, campos de cabecera DICOM, historia clinica y secciones del informe) junto con una pregunta tipada —respuesta si/no, eleccion unica o escala ordenada— y devuelve una probabilidad calibrada para cada opcion permitida. Para ello lee los logits de las letras de las opciones en una posicion de respuesta fija, de modo que solo puede contestar con una de las alternativas habilitadas.

El problema que aborda es la acumulacion de decisiones operativas pequenas pero criticas en un flujo de radiologia: si el estudio solicitado encaja con la pregunta clinica, si el lado o el contraste son correctos, si la historia clinica es suficiente, si el informe describe un lado o un contraste que no se administro, o a que equipo corresponde revisar un informe rechazado. Segun el autor, cada una de estas omisiones se paga con una repeticion de exploracion, una llamada al paciente, una reasignacion o un addendum.

Su relevancia actual es la de un artefacto de investigacion que demuestra que un modelo muy pequeno (0,8 B de parametros) puede resolver tareas de decision acotadas con probabilidades calibradas y sin generar texto libre, lo que simplifica la integracion en un PACS o un RIS. La model card lo declara explicitamente como artefacto de investigacion y no como producto sanitario, con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r = 32) sobre un transformer decoder-only (`Qwen/Qwen3.5-0.8B`) |
| Parametros totales | 0,8 mil millones en el modelo base mas el adaptador LoRA; el repositorio ocupa 0,1 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como adaptador PEFT en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 acoplado a `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parametros. La innovacion tecnica no esta en la arquitectura, sino en la interfaz de salida: el adaptador lee los logits de las letras que identifican las opciones en una posicion de respuesta fija, lo que restringe el espacio de respuestas a las alternativas permitidas y permite obtener una probabilidad por opcion en una sola pasada hacia delante. El modelo no escribe texto.

En cuanto a los datos de entrenamiento, la informacion disponible indica que la evaluacion principal se realiza sobre conjuntos de test sinteticos reservados de aproximadamente 1.200 casos por pregunta, y que en un caso (comprobacion de lado del informe frente a la exploracion solicitada) se evaluo tambien sobre 694 informes reales con 48 marcados. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Respuestas tipadas restringidas: si/no, eleccion unica y escalas ordenadas (por ejemplo, `routine < urgent < stat < critical_suspected`).
- Salida de probabilidad calibrada por cada opcion permitida, leyendo los logits de las letras de las opciones en una posicion fija.
- Ausencia de generacion de texto libre, lo que impide respuestas fuera del conjunto de opciones definido.
- Decisiones de triaje de lista de trabajo urgente, incluida la priorizacion de estudios criticos como un TC de craneo por sospecha de ictus.
- Comprobaciones de coherencia entre la lateralidad ordenada, la lateralidad DICOM y la descrita en el informe.
- Verificacion de integridad del informe: contraste descrito frente a contraste administrado, lado descrito y coherencia interna del conjunto de datos.
- Clasificacion del motivo de rechazo de un informe por parte del cliente y enrutado del rechequeo al equipo correspondiente.
- Comprobaciones de seguridad previas a la exploracion: funcion renal, embarazo, alergia al contraste e implantes en resonancia magnetica.
- Decisiones de admision y asignacion: region corporal, contraste realmente usado, urgencia de lectura, subespecialidad, complejidad, credenciales del lector y necesidad de segunda lectura.
- Capacidades multilingues: no disponibles; el modelo declara unicamente el ingles.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje de lista de trabajo de urgencias: ante una orden de TC de craneo con `patient_class: Emergency` y `order_priority: STAT` por clinica de ictus, el modelo devuelve la categoria de urgencia de lectura (`critical_suspected`, 0,87 en el ejemplo de la model card) y permite colocar el estudio al principio de la cola en lugar de en orden de llegada. Segun el autor, en el test sintetico reservado de 1.200 casos obtiene 0,90 de exactitud frente a 0,67 del modelo base sin ajustar.
- Verificacion de lado antes de firmar el informe: con una exploracion de rodilla izquierda y un informe que menciona la rodilla derecha solo como comparacion normal, el modelo responde `no` a la pregunta de conflicto de lado (1,00), evitando un addendum innecesario y una llamada al paciente. En 694 informes reales con 48 marcados, alcanza un AUROC de 0,98 frente a 0,55 del modelo base.
- Deteccion de contraste no administrado: durante el dictado, el modelo comprueba si el informe describe la administracion de contraste cuando la orden indica que no se administro, lo que permite corregir antes de la firma en lugar de emitir un addendum posterior.
- Enrutado de informes rechazados: a partir del mensaje del cliente («el estudio de comparacion no se recupero»), el modelo clasifica el motivo del rechazo (`missing_comparison`, 1,00) y asigna el rechequeo al equipo correcto (`operations`, 1,00). En el test sintetico reservado de 1.196 casos, la exactitud del motivo es 0,99 frente a 0,13 del base, y la del enrutado 0,94 frente a 0,53.
- Comprobacion de adecuacion de la prueba solicitada: antes de la exploracion, el modelo evalua si la modalidad, el protocolo y el contraste encajan con la pregunta clinica, lo que ayuda a evitar exploraciones equivocadas, estudios duplicados y contraste en pacientes con funcion renal comprometida (categoria de ordenacion y seguridad previa: 0,95 frente a 0,69 del base).
- Admision y asignacion de lectores: en la llegada del estudio, el modelo determina region corporal, contraste realmente usado, urgencia de lectura, subespecialidad, clase de SLA y necesidad de segunda lectura, permitiendo enrutar cada estudio al radiologo adecuado (categoria de admision y triaje: 0,96 frente a 0,56 del base).
- Control de calidad retrospectivo de una lista de trabajo: al ejecutarse sobre el flujo completo, el modelo permite ordenar la lista de trabajo por riesgo en el momento de la llegada y marcar problemas antes de la firma, en lugar de corregirlos a posteriori. El autor indica que 22 de las preguntas del modelo corresponden a decisiones previas a la redaccion del informe.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Las comparaciones se realizan siempre contra el modelo base sin ajustar (`Qwen/Qwen3.5-0.8B`), con el mismo prompt y la misma lectura de letras.

| Evaluacion | Conjunto de datos | rad-decider | Qwen3.5-0.8B (base) |
|---|---|---|---|
| Triaje urgente de lista de trabajo (exactitud) | Test sintetico reservado, 1.200 casos | 0,90 | 0,67 |
| Conflicto de lado frente a exploracion, sobre informes reales (AUROC) | 694 informes, 48 marcados, pregunta nunca vista en entrenamiento | 0,98 | 0,55 |
| Motivo de rechazo del informe (exactitud) | Test sintetico reservado, 1.196 casos | 0,99 | 0,13 |
| Enrutado del rechequeo (exactitud) | Test sintetico reservado, 1.196 casos | 0,94 | 0,53 |
| Ordenacion, protocolo y seguridad previa a la exploracion (exactitud media por categoria) | Test sintetico reservado, ~1.200 casos por pregunta | 0,95 | 0,69 |
| Admision, triaje y asignacion (exactitud media por categoria) | Test sintetico reservado, ~1.200 casos por pregunta | 0,96 | 0,56 |
| Integridad, consistencia y comparacion del informe (exactitud media por categoria) | Test sintetico reservado | no disponible (la model card aparece truncada en este punto) | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones con modelos de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (0,8 mil millones de parametros) y no figuran de forma explicita en la informacion proporcionada.

- VRAM estimada para inferencia: en torno a 1,6-2 GB en fp16 (pesos mas activaciones y cache), aproximadamente 0,9-1,2 GB en int8 y 0,6-0,9 GB en 4 bits. El adaptador LoRA anade un incremento marginal sobre estas cifras.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien es viable en GPU de datacenter como A100 o H100, aunque sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: al ser un adaptador PEFT, su ruta natural es `transformers` con `peft`; tambien podria servirse con vLLM (que soporta adaptadores LoRA) o convertirse a GGUF para llama.cpp u Ollama. La informacion proporcionada no confirma ninguna de estas opciones de forma explicita.
- Latencia y throughput: no disponibles. La model card solo indica que la respuesta se obtiene en una unica pasada hacia delante por pregunta, lo que sugiere latencias bajas, pero no se aportan mediciones.

## Comparativa con modelos similares

La informacion disponible solo documenta una comparacion, contra el propio modelo base sin ajustar. No se identifican en la informacion modelos comparables de terceros para esta tarea concreta.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rology/rad-decider | 0,8 B base + LoRA r = 32 | no disponible | 0,90-0,99 en las tareas evaluadas; AUROC 0,98 en conflicto de lado sobre informes reales | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-0.8B (sin ajustar) | 0,8 B | no disponible | 0,13-0,69 en las mismas tareas; AUROC 0,55 en conflicto de lado | apache-2.0 (segun la model card del adaptador) | HuggingFace |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion: la model card declara expresamente que no es un producto sanitario y que no debe utilizarse para informar la atencion al paciente. Cualquier uso clinico requeriria validacion regulatoria y clinica adicional.
- Solo ingles: el modelo declara unicamente el idioma `en`, lo que limita su uso en entornos con documentacion clinica en otros idiomas.
- No genera texto: solo devuelve probabilidades sobre un conjunto cerrado de opciones tipadas. No puede redactar informes, explicaciones ni justificaciones.
- Dependencia de la interfaz de respuesta: el mecanismo de lectura de logits en una posicion de respuesta fija exige un formato de prompt y de opciones muy controlado; cambios en el formato pueden degradar o invalidar las respuestas.
- Validacion mayoritariamente sintetica: la mayoria de las cifras proceden de conjuntos de test sinteticos reservados de unos 1.200 casos por pregunta. Solo una tarea (conflicto de lado frente a exploracion) se evaluo sobre informes reales (694 informes, 48 marcados), por lo que la generalizacion al entorno clinico real es limitada.
- Riesgo de error en decisiones criticas: un falso negativo en el triaje de urgencia o en las comprobaciones de seguridad previas (funcion renal, embarazo, alergia al contraste, implantes en resonancia) puede tener consecuencias graves; el modelo esta pensado como ayuda a la priorizacion, no como sustituto del criterio clinico ni de las verificaciones obligatorias.
- Calibracion no verificada de forma independiente: aunque el autor describe las probabilidades como calibradas, la informacion disponible no incluye metricas de calibracion (por ejemplo, Brier score o curvas de fiabilidad) ni una validacion externa.
- Sesgos: no disponible. La informacion proporcionada no detalla la composicion demografica, geografica ni institucional de los datos de entrenamiento ni de evaluacion, por lo que no puede evaluarse el sesgo.
- Licencia: Apache-2.0, heredada del modelo base, lo que permite uso comercial segun los terminos de dicha licencia. Esto no exime del cumplimiento de la normativa de productos sanitarios aplicable a software con finalidad clinica.
- Adopcion muy temprana: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion ni mantenimiento documentado.
- Trazabilidad de la evaluacion limitada: la model card aparece truncada en la seccion de integridad del informe, por lo que no se dispone de todas las cifras declaradas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rology/rad-decider
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
