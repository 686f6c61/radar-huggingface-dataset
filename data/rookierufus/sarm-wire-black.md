# rookierufus/sarm-wire-black

## Resumen

SARM wire black es un modelo de recompensa (reward model) de doble cabeza publicado por el usuario rookierufus en HuggingFace bajo el identificador `rookierufus/sarm-wire-black`. Se trata de un modelo entrenado con la implementacion SARM de LeRobot en modo de anotacion dual (`annotation_mode=dual`), disenado para puntuar el exito de una tarea y el progreso por etapas en demostraciones de manipulacion robotica bimanual realizadas con el brazo SO-101. Su funcion no es generar texto, sino producir senales de recompensa escalares a partir de observaciones del robot.

El modelo opera exclusivamente sobre la camara cenital o aerea izquierda, identificada en la observacion como `observation.images.left_top`, y fue entrenado sobre demostraciones bimanuales del SO-101. El checkpoint final corresponde al paso 2500 con un tamano de lote de 128. Cuenta con 119.180.551 parametros reales (segun los ficheros safetensors del repositorio), lo que lo situa en la gama de modelos compactos que pueden ejecutarse en hardware de consumo.

Su relevancia actual radica en el auge del aprendizaje por refuerzo aplicado a robotica de bajo coste: los brazos SO-101 son plataformas asequibles y LeRobot se ha consolidado como stack de referencia para entrenar y evaluar politicas. Un modelo de recompensa capaz de distinguir etapas y progreso reduce la necesidad de anotacion manual de recompensas densas, que es uno de los cuellos de botella mas costosos en este tipo de pipelines. No obstante, el modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de recompensa de doble cabeza entrenado con LeRobot SARM; no se especifica el backbone subyacente) |
| Parametros totales | 119.180.551 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; consume observaciones visuales y de estado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de recompensa de doble cabeza ("dual-head"), entrenado con la implementacion SARM de LeRobot bajo el modo de anotacion `dual`. El termino que emplea la model card es "stage-and-progress reward model", es decir, un modelo que combina una senal de etapa (en que fase de la tarea se encuentra el episodio) con una senal de progreso (cuanto se ha avanzado dentro de esa etapa). Esta separacion en dos cabezas es habitual en modelos de recompensa para tareas de horizonte largo, donde una unica puntuacion escalar resulta demasiado dispersa para guiar el aprendizaje.

El entrenamiento se realizo sobre demostraciones bimanuales del robot SO-101, y el modelo consume unicamente la vista de camara `observation.images.left_top`, lo que implica que la entrada visual esta restringida a una unica perspectiva. El checkpoint final documentado es el paso 2500 con lote de 128. No se especifican en la informacion proporcionada el numero total de tokens o fotogramas de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Puntuacion de recompensa por etapas: produce senales separadas de etapa y de progreso para episodios de manipulacion.
- Evaluacion de demostraciones bimanuales del SO-101 a partir de una vista de camara aerea.
- Asignacion de recompensa densa, util para aprendizaje por refuerzo en tareas de horizonte largo.
- Integracion con el ecosistema LeRobot mediante la libreria `lerobot` declarada en la model card.
- Consumo de observaciones visuales (`observation.images.left_top`) y, presumiblemente, del estado del robot, segun el esquema de SARM.
- No dispone de generacion de texto, codigo, matematicas ni vision generalista.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues (no procesa lenguaje natural).
- Capacidad especial: doble cabeza de recompensa con modo de anotacion dual.

## Casos de uso

- Aprendizaje por refuerzo sobre SO-101: el modelo actua como funcion de recompensa en un bucle de RL, permitiendo entrenar politicas de manipulacion bimanual sin definir manualmente una recompensa densa para cada etapa de la tarea.
- Anotacion automatica de demostraciones: dado un conjunto de episodios teleoperados, el modelo puntua etapa y progreso de cada fotograma, lo que permite filtrar datos de baja calidad antes de entrenar una politica por imitacion.
- Evaluacion de politicas sin recompensa manual: en lugar de disenar una funcion de recompensa especifica por tarea, se usa el modelo como evaluador para comparar checkpoints de una politica.
- Recompensa por etapas en tareas de horizonte largo: tareas como recoger, transportar y colocar un objeto se benefician de una senal intermedia que indique en que fase se encuentra el episodio y si hay avance real.
- Deteccion temprana de fallos: si la cabeza de progreso deja de aumentar durante un numero de pasos, el episodio puede abortarse y reiniciarse, ahorrando tiempo de entrenamiento.
- Investigacion reproducible en robotica de bajo coste: al apoyarse en LeRobot y en el SO-101, el modelo sirve como punto de partida reproducible para experimentos academicos con hardware asequible.
- Aprendizaje por preferencias en robotica: las puntuaciones del modelo pueden utilizarse para construir pares de episodios preferidos y no preferidos, alimentando metodos tipo DPO o ranking.

Conviene subir nota de que estos casos se derivan de la funcion declarada del modelo y del stack en el que se integra; la model card no documenta ningun caso de uso validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card facilitada unicamente indica el checkpoint final (paso 2500, lote 128) y no incluye metricas de exito, tasas de acierto de clasificacion de etapa ni comparaciones con otros modelos de recompensa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,48 GB en fp32 (119,18 M de parametros x 4 bytes), unos 0,24 GB en fp16/bf16 y unos 0,12 GB en int8. El repositorio ocupa 0,5 GB, coherente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes; el cuello de botella sera el resto del pipeline de robotica, no el modelo.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo de los ultimos diez anos, e incluso en GPUs integradas con memoria compartida.
- CPU: es viable ejecutar la inferencia en CPU dado el tamano, aunque la latencia sera mayor que en GPU.
- Opciones de despliegue: LeRobot y PyTorch, segun la libreria declarada. No consta soporte para vLLM ni llama.cpp, que estan orientados a modelos de lenguaje generativo y no aplican a este caso. Otras vias razonables serian exportacion a ONNX o TensorRT para reducir latencia, aunque no estan documentadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables en la informacion proporcionada. La busqueda web realizada no devolvio material tecnico relevante sobre SARM ni sobre modelos de recompensa para SO-101: los resultados obtenidos no guardan relacion con el modelo. Por tanto, no es posible construir una comparativa con cifras verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rookierufus/sarm-wire-black | 119.180.551 | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entreno sobre demostraciones bimanuales del SO-101 con una unica vista de camara (`observation.images.left_top`). Cambiar la camara, la disposicion de la escena o el robot invalida practicamente la senal de recompensa.
- Sesgo de tarea: no se documenta la variedad de tareas cubiertas; un modelo de recompensa por etapas tiende a degradarse fuera de la distribucion de tareas vistas durante el entrenamiento.
- Riesgo de reward hacking: como cualquier reward model, puede ser explotado por la politica, que aprendera a maximizar la puntuacion en lugar de completar la tarea si la cabeza de recompensa es imperfecta.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de puntuaciones espurias, es decir, recompensas altas asignadas a episodios fallidos o viceversa.
- Validacion inexistente: el repositorio registra 0 descargas y 0 likes, sin resultados de benchmarks publicados ni evaluacion por terceros.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial y se aplica el regimen de copyright por defecto. Cualquier uso en produccion requiere contactar con el autor.
- Idiomas: no aplica, el modelo no procesa lenguaje natural.
- Restricciones de contexto: se desconoce la ventana temporal o el numero de fotogramas que el modelo puede procesar por episodio.
- Metadatos: la fecha de creacion registrada (25 de septiembre de 2026) es posterior a la fecha habitual de consulta, lo que sugiere un posible error en los metadatos del repositorio.
- Caveat de produccion: al ser un modelo de recompensa, no debe exponerse directamente a usuarios finales; su uso esta limitado a pipelines de entrenamiento y evaluacion.

## Enlaces

- HuggingFace: https://huggingface.co/rookierufus/sarm-wire-black
- Paper: no disponible
- Blog o documentacion del autor: no disponible
- Repositorio de codigo: no disponible (la model card unicamente declara la libreria `lerobot`)
- Demo: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, SARM, LeRobot, el robot SO-101 ni modelos de recompensa para robotica.
