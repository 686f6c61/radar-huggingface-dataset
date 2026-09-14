# NONHUMAN-RESEARCH/pi05-hanoi-1309

## Resumen

El modelo NONHUMAN-RESEARCH/pi05-hanoi-1309 es un ajuste fino del modelo base lerobot/pi05_base, que a su vez es la implementación en LeRobot de π₀.₅ (Pi05), el modelo vision-lenguaje-acción (VLA) de Physical Intelligence disenado para generalización en entornos abiertos. En lugar de generar texto, el modelo consume observaciones multimodales de un robot (estado de las articulaciones y tres camaras) y produce directamente un vector de accion de 14 dimensiones, lo que lo convierte en una politica de control extremo a extremo para manipulacion robotica.

El ajuste se ha realizado sobre el conjunto de datos NONHUMAN-RESEARCH/hanoi-teleop-foundry, compuesto por 237 episodios y 431.535 fotogramas grabados a 30 FPS, correspondientes a una tarea de manipulacion tipo torre de Hanoi teleoperada sobre un robot de tipo piper. El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) almacenados en formato safetensors, y el repositorio ocupa 84,2 GB.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo actual de la robotica de imitacion, que consiste en partir de un VLA preentrenado y especializarlo en un robot y una tarea concretos; por otro, ejemplifica la integracion de la familia π₀ de Physical Intelligence en el ecosistema LeRobot, lo que abarata el despliegue y el reentrenamiento para grupos de investigacion con recursos limitados. La licencia Apache 2.0 facilita su reutilizacion, aunque el modelo registra cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA); implementacion LeRobot de π₀.₅ (Pi05), adaptada del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar en safetensors) |
| Idiomas soportados | no disponible; las tareas se especifican como cadenas de texto ("1" a "221") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | piper |
| Camaras | left, top, right |
| Pipeline | robotics |
| Tamano del repositorio | 84,2 GB |
| Modelo base | lerobot/pi05_base |

Entradas y salidas documentadas:

| Feature | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (14,) |
| observation.images.left | VISUAL | (3, 480, 640) |
| observation.images.top | VISUAL | (3, 376, 672) |
| observation.images.right | VISUAL | (3, 480, 640) |
| action | ACTION | (14,) |

## Arquitectura y entrenamiento

π₀.₅ (Pi05) es un modelo vision-lenguaje-accion de Physical Intelligence concebido para generalizar a entornos y situaciones no vistos durante el entrenamiento, evolucionando el π₀ original. La implementacion incluida en este repositorio procede de LeRobot y esta adaptada del repositorio OpenPI de codigo abierto del propio laboratorio. El modelo consume estado proprioceptivo de 14 dimensiones junto con tres flujos de imagen de camaras con resoluciones de 480x640 y 376x672, y emite un vector de accion de 14 dimensiones. La model card no detalla la composicion interna de la red (backbone de vision-lenguaje, modulo de generacion de acciones, mecanismo de decodificacion), por lo que esos detalles se consideran no disponibles.

El ajuste fino se realizo sobre NONHUMAN-RESEARCH/hanoi-teleop-foundry: 237 episodios, 431.535 fotogramas a 30 FPS, con 221 identificadores de tarea distintos etiquetados como cadenas numericas ("1" a "221"). La configuracion de entrenamiento registrada es la siguiente: 30.000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 4e-05, semilla 1000 y LeRobot version 0.6.2. No se documentan tecnicas de RLHF, DPO ni procesos de alineacion adicionales, lo cual es coherente con un pipeline de aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones de control robotico: emite un vector de accion de 14 dimensiones a partir de observaciones de estado y vision.
- Percepcion multimodal: procesa de forma conjunta un vector de estado de 14 dimensiones y tres imagenes de camara (vistas izquierda, superior y derecha).
- Control visomotor de manipulacion: aprende politicas de imitacion para la tarea de torre de Hanoi teleoperada sobre un robot piper.
- Condicionamiento por tarea: acepta un identificador de tarea textual (valores "1" a "221") para seleccionar el comportamiento.
- Inferencia en bucle cerrado: integrado en LeRobot, permite ejecucion continua con `lerobot-rollout` durante un tiempo determinado o de forma indefinida.
- Modelo base reutilizable: al estar ajustado desde lerobot/pi05_base, se puede seguir ajustando con nuevos conjuntos de datos mediante `lerobot-train`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de texto; el bucle de control es de tipo reactivo por paso de tiempo.
- Capacidades multilingues: no disponible; la entrada de lenguaje se limita al identificador de tarea.
- Capacidades especiales (modo thinking, vision, audio): vision como entrada obligatoria; no se documentan modos de razonamiento explicito ni audio.

## Casos de uso

- Manipulacion robotica de laboratorio en tareas repetitivas: el modelo ejecuta la politica de torre de Hanoi sobre un robot piper, permitiendo automatizar una tarea de ensamblaje o apilado documentada con 237 episodios y 431.535 fotogramas.
- Investicion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el efecto del numero de episodios, la tasa de aprendizaje o el tamano de lote en el rendimiento de una politica VLA.
- Ajuste fino para nuevas tareas con pocos datos: partiendo de lerobot/pi05_base y usando `lerobot-train`, un equipo puede reentrenar la politica para una tarea distinta con su propio conjunto teleoperado.
- Reproduccion de experimentos en robotica abierta: al estar integrado en LeRobot 0.6.2 y licenciado bajo Apache 2.0, permite replicar y auditar resultados de forma independiente.
- Evaluacion de generalizacion en entornos abiertos: al heredar de π₀.₅, es util para medir hasta que punto un ajuste especifico conserva la capacidad de generalizar a variaciones de iluminacion o colocacion de objetos.
- Banco de pruebas de despliegue robotico: con `lerobot-rollout` se puede validar la integracion de camaras, puertos y calibracion antes de llevar una politica a produccion.
- Docencia y formacion: como ejemplo completo de un pipeline de aprendizaje por imitacion de principio a fin, desde la grabacion de datos hasta el rollout en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (4,14 mil millones) y del tamano del repositorio; la model card no publica requisitos oficiales.

- VRAM estimada para los pesos: aproximadamente 8,3 GB en bf16/fp16 y 16,6 GB en fp32.
- VRAM estimada para inferencia completa: del orden de 10 a 16 GB, ya que hay que sumar las activaciones de los tres flujos de imagen (480x640, 376x672, 480x640) y los buffers del bucle de control.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o L40S para despliegue en servidor; una RTX 4090 o RTX 3090 (24 GB) es suficiente para inferencia en bf16.
- GPU de consumo: si, cabe en tarjetas con 16 GB o mas (RTX 4080, RTX 4090, RTX 3090); por debajo de 16 GB no hay margen documentado.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) para ejecucion sobre robot, integracion con OpenPI y ejecucion directa en PyTorch. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, que estan orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput: no disponible.
- Nota sobre el almacenamiento: el repositorio ocupa 84,2 GB, muy por encima de lo que ocupan los pesos en una sola precision, lo que sugiere la presencia de multiples puntos de control u otros artefactos de entrenamiento. Conviene verificar el contenido antes de descargarlo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NONHUMAN-RESEARCH/pi05-hanoi-1309 | 4.143.404.816 | no disponible | VLA (π₀.₅) ajustado para robot piper y tarea Hanoi | apache-2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA (π₀.₅) preentrenado, modelo base | no disponible | HuggingFace (modelo base) |
| π₀ (OpenPI, Physical Intelligence) | no disponible | no disponible | VLA predecesor de π₀.₅ | no disponible | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. Otros VLA de la misma categoria (por ejemplo, alternativas de tamano similar) no se han podido contrastar por falta de datos verificables en la busqueda realizada.

## Limitaciones y advertencias

- Especificidad de hardware: la politica esta entrenada para un robot de tipo piper con exactamente tres camaras denominadas left, top y right. Los nombres de las camaras deben coincidir con las claves de observacion usadas en el entrenamiento; cualquier cambio de montaje, resolucion o numero de camaras puede degradar o invalidar la politica.
- Especificidad de tarea: el modelo esta ajustado para una unica tarea (torre de Hanoi), con 221 identificadores de tarea, y no se documenta su comportamiento fuera de ese dominio.
- Riesgo de alucinacion: en un VLA el equivalente es la generacion de acciones plausibles pero fisicamente incorrectas, especialmente ante distribuciones de entrada distintas de las vistas en entrenamiento. No se publican metricas de tasa de exito que permitan cuantificar este riesgo.
- Sesgos conocidos: el conjunto de datos procede de teleoperacion humana, por lo que hereda los sesgos de quien teleopero, las condiciones de iluminacion y la disposicion concreta del entorno de grabacion. No se documentan analisis de sesgo.
- Limitaciones de contexto e idioma: no se especifica ventana de contexto ni soporte multilingue; la unica entrada textual es un identificador de tarea numerico.
- Restricciones de licencia: la licencia es Apache 2.0, lo que en principio permite uso comercial. Sin embargo, conviene revisar la licencia del modelo base lerobot/pi05_base y de π₀.₅, asi como las condiciones del conjunto de datos, antes de un despliegue comercial.
- Madurez: el repositorio registra cero descargas y cero valoraciones, y no se han publicado benchmarks. Se trata de un modelo reciente sin validacion externa conocida.
- Ausencia de datos operativos: no se publican requisitos de hardware oficiales, latencia ni tasa de exito en el robot, por lo que cualquier estimacion de produccion debe validarse empiricamente.
- Fechas del repositorio: la model card indica creacion y actualizacion en septiembre de 2026; conviene verificar la vigencia de la informacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NONHUMAN-RESEARCH/pi05-hanoi-1309
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/NONHUMAN-RESEARCH/hanoi-teleop-foundry
- Visualizacion del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=NONHUMAN-RESEARCH/hanoi-teleop-foundry
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
