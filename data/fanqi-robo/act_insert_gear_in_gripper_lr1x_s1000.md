# fanqi-robo/act_insert_gear_in_gripper_lr1x_s1000

## Resumen

El modelo `fanqi-robo/act_insert_gear_in_gripper_lr1x_s1000` es una política robótica entrenada con el algoritmo ACT (Action Chunking Transformer) para la tarea concreta de insertar una pieza dentada (engranaje) en la pinza de un robot bimanual YAM. Lo publica el usuario fanqi-robo dentro del ecosistema LeRobot de Hugging Face y forma parte de una familia de checkpoints de un mismo benchmark de manipulación, en el que cada variante cambia la tasa de aprendizaje y la semilla. El repositorio contiene el checkpoint final (actualización 20.000) y una rama `best` con la pérdida de validación más baja, y está pensado como punto de comparación reproducible del benchmark.

Técnicamente no es un modelo de lenguaje: es una política visomotora de 51,6 millones de parámetros que consume tres cámaras de 720x1280 y un estado articular de 14 dimensiones, y emite trozos de 30 acciones (action chunk) de 14 dimensiones cada una. La inicialización es desde cero salvo el backbone de imagen ResNet18 preentrenado en ImageNet, sin ningún preentrenamiento robótico previo. Su relevancia está en la reproducibilidad: el autor publica la configuración exacta, las curvas, el coste de entrenamiento (6,5 horas de una H100) y una evaluación offline con episodios reservados.

El modelo es de nicho y muy especializado: no generaliza a otras tareas ni a otros robots, y su licencia no está declarada en la información disponible. Aun así, resulta útil como referencia metodológica para quien entrene políticas ACT con LeRobot o quiera comparar contra la línea base física `hold` (mantener la pose actual).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) con VAE condicional, encoder de visión ResNet18 y transformer encoder-decoder |
| Parametros totales | 51.613.326 (pesos en safetensors); 51.577.742 entrenables segun la model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 3 imagenes 720x1280 mas estado articular de 14 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato de LeRobot) |
| Biblioteca | lerobot 0.5.1 |
| Tarea | `insert_gear_in_gripper`, robot bimanual YAM |
| Dimensions de estado/accion | 14-D estado, 14-D accion |
| Action chunk | 30 acciones predichas, 30 ejecutadas |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es ACT: un transformer encoder-decoder que mapea observaciones (tres imágenes de 720x1280 procesadas por un backbone ResNet18 preentrenado en ImageNet, más el estado articular de 14 dimensiones) a un chunk de 30 acciones futuras, ejecutadas todas antes de volver a inferir. El modelo incorpora un componente variacional (VAE condicional): en entrenamiento muestrea la latente posterior y suma una penalización KL con peso 10x, mientras que en despliegue usa la latente prior de forma determinista. Solo el backbone de imagen parte de pesos preentrenados; el resto se inicializa desde cero y se entrena por completo, sin preentrenamiento robótico ni de otras tareas.

Los datos de entrenamiento son el dataset `fanqi-robo/insert_gear_in_gripper` (revisión `acdc9ac8`), con 50 episodios y 27.228 fotogramas. La validación usa `villekuosmanen/insert_gear_in_gripper_val` (revisión `7c4d62f3`), con 5 episodios reservados y 2.245 fotogramas. El entrenamiento emplea AdamW con tasa constante (sin scheduler), `optimizer_lr=1e-05` y `optimizer_lr_backbone=1e-05`, durante 20.000 actualizaciones con batch efectivo 32 (16 x 2 en una sola GPU), semilla 1000 y sin aumento de imágenes. La normalización usa media y desviación típica del conjunto de entrenamiento para estado y acción, y media/desviación de ImageNet para las imágenes. El coste fue de 6,5 horas en una NVIDIA H100 80 GB HBM3, con un pico de VRAM de 57,1 GB.

## Capacidades

- Generacion de acciones motoras: predice chunks de 30 acciones de 14 dimensiones para un robot bimanual YAM a partir de observaciones visuales y de estado.
- Manipulacion visomotora de precision: la tarea objetivo es insertar una pieza dentada en la pinza, lo que requiere alineacion fina de muneca y control de agarre.
- Percepcion multi-camara: consume tres camaras simultaneas a 720x1280, lo que permite razonar sobre geometria desde varios puntos de vista.
- Control bimanual coordinado: el espacio de estado y accion de 14 dimensiones cubre los dos brazos.
- Ejecucion determinista en despliegue: usa la latente prior y no muestrea, lo que da comportamiento repetible en produccion.
- Inferencia de baja latencia: 22,8 ms por chunk segun la model card.
- Tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica).
- Capacidad especial: modo "thinking" o vision-lenguaje: no disponible (no aplica).

## Casos de uso

- Insercion de engranajes en linea de montaje: es el uso literal del modelo; se desplegaria sobre un YAM bimanual con tres camaras a 720x1280, emitiendo chunks de 30 acciones con una latencia de 22,8 ms por inferencia para tareas de ajuste fino.
- Punto de referencia para benchmarking interno: al publicar configuracion, semilla y curvas, sirve como baseline contra el que medir variantes propias con distinta tasa de aprendizaje o distinta semilla en la misma tarea.
- Validacion de infraestructura LeRobot: es un buen punto de partida para verificar que un pipeline con `lerobot 0.5.1`, safetensors y tres camaras funciona de extremo a extremo antes de invertir en entrenamientos largos.
- Aprendizaje por imitacion de demostraciones cortas: el dataset de 50 episodios y 27.228 fotogramas demuestra que ACT puede aprender una tarea de insercion con pocas demostraciones, util para planificar la recoleccion de datos en tareas nuevas.
- Investigacion en chunking de acciones: permite estudiar el efecto del tamano de chunk (30 acciones predichas y ejecutadas) sobre la estabilidad del control y sobre el error a largo plazo.
- Estudio de sesgos de politica visomotora: la tabla de evaluacion por actualizaciones permite analizar como evolucionan el error de posicion y la tasa de deteccion de agarre a lo largo del entrenamiento.
- Docencia en robotica de manipulacion: como ejemplo abierto de politica condicionada por vision con evaluacion offline cuantitativa y comparacion contra una linea base fisica trivial.

## Benchmarks y rendimiento

Evaluacion offline en los episodios reservados de `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, un fotograma de cada 5), en unidades articulares del dataset. La linea base `hold` (mantener la pose actual) obtiene MAE@30 = 2,60, por lo que un modelo con MAE@30 superior a esa cifra es peor que no moverse.

| Actualizacion | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| 851 | 4,53 | 5,10 +/- 0,81 | 4,51 | 6,21 | 0,98 | 0,22 | 6,5 |
| 4000 | 3,45 | 3,90 +/- 0,84 | 3,51 | 4,93 | 0,99 | 0,16 | 3,8 |
| 8000 | 3,33 | 3,60 +/- 0,88 | 3,32 | 4,26 | 0,99 | 0,29 | 4,1 |
| 12000 | 2,87 | 3,48 +/- 0,79 | 2,77 | 4,44 | 0,99 | 0,48 | 5,1 |
| 16000 | 2,54 | 3,25 +/- 0,80 | 2,41 | 4,37 | 0,99 | 0,56 | 4,9 |
| 18722 | 2,66 | 3,35 +/- 0,72 | 2,51 | 4,46 | 0,99 | 0,54 | 5,2 |
| 20000 | 2,58 | 3,31 +/- 0,79 | 2,43 | 4,51 | 0,99 | 0,57 | 5,0 |

Perdida de validacion: 0,172567 en la actualizacion final; mejor valor 0,171351 en la actualizacion 18722. Perdida de entrenamiento (ultima ventana): 0,0522056. La metrica de validacion es una L1 enmascarada entre el chunk de acciones y la prediccion en modo evaluacion con latente prior, determinista; no es comparable entre politicas distintas, solo ordena checkpoints de esta misma ejecucion.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible.

## Requisitos de hardware

- Pesos: 51,6 millones de parametros, aproximadamente 206 MB en fp32 y 103 MB en fp16/bf16; el repositorio completo ocupa 0,4 GB.
- VRAM de entrenamiento: 57,1 GB de pico con batch efectivo 32 (16 x 2) y tres camaras a 720x1280, medido en una H100 80 GB HBM3.
- GPU de entrenamiento usada: 1 x NVIDIA H100 80 GB HBM3, 6,5 horas de GPU para 20.000 actualizaciones.
- VRAM de inferencia: no disponible de forma explicita; depende sobre todo de la resolucion y el numero de camaras, no del numero de parametros (las activaciones del backbone de imagen a 720x1280 dominan el consumo).
- GPU de consumo: no confirmado. Por tamano de pesos cabria en cualquier GPU con 4 GB o mas, pero el procesamiento de tres imagenes de 720x1280 por paso exige comprobar el consumo real de activaciones antes de asumirlo.
- Latencia medida: 22,8 ms por inferencia (valor declarado en la model card, hardware no especificado para esa medicion).
- Throughput: no disponible.
- Opciones de despliegue: LeRobot 0.5.1 con pesos safetensors. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, que ademas no son herramientas orientadas a politicas roboticas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / observacion | Error (MAE@30) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_insert_gear_in_gripper_lr1x_s1000 | 51,6 M | Insertar engranaje en pinza, YAM bimanual | 3 camaras 720x1280 + estado 14-D, chunk de 30 acciones | 3,31 | no disponible | Hugging Face, 0 descargas |
| molmoact2_insert_gear_in_gripper_base_expert | no disponible | Misma tarea, mismo autor | no disponible | no disponible | no disponible | Hugging Face |
| Linea base `hold` (mantener pose) | no aplica | Misma tarea | no aplica | 2,60 | no aplica | Metrica de referencia en la model card |

La familia de checkpoints del mismo benchmark (variaciones de tasa de aprendizaje y semilla) no esta cuantificada en la informacion disponible, por lo que no se puede comparar su rendimiento numerico. Tampoco hay datos publicados del modelo basado en MolmoAct2 mas alla de su existencia.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo esta entrenado para `insert_gear_in_gripper` con un robot YAM bimanual. No es reutilizable en otras tareas, otros robots ni otras configuraciones de camaras.
- Licencia no declarada: al no figurar licencia en la informacion disponible, no puede asumirse permiso para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin preentrenamiento roboto: al inicializarse desde cero (salvo el backbone ResNet18), el modelo no aporta conocimiento transferible de manipulacion; su utilidad esta limitada a esta tarea.
- Rendimiento por encima de la linea base trivial pero con margen: el MAE@30 final (3,31) es peor que el de la politica `hold` (2,60), lo que indica errores de posicion considerables en la evaluacion offline. El propio autor advierte que estas metricas solo ordenan checkpoints dentro de la misma ejecucion y no son comparables entre politicas.
- Tasa de deteccion de agarre imperfecta: `grip rec` se queda en 0,57 en el checkpoint final, es decir, el modelo no captura correctamente el estado de agarre en aproximadamente el 43% de los casos evaluados.
- Alucinacion y sesgos: no disponible como tal en la informacion proporcionada; en el contexto de una politica visomotora, el equivalente seria la deriva acumulada del chunk de acciones, visible en el crecimiento del error entre MAE@10 (2,58) y MAE@30 (3,31).
- Limitaciones de idioma: no aplica; es un modelo no linguistico.
- Riesgo de sobreajuste al entorno de recogida de datos: el entrenamiento usa 50 episodios de un unico setup con tres camaras fijas, sin aumento de imagenes ni preentrenamiento de robot, por lo que la robustez ante cambios de iluminacion, posicion de camara u objetos distintos no esta caracterizada.
- Sin informacion de despliegue real: la model card solo reporta evaluacion offline en bucle abierto (423 consultas, un fotograma de cada 5); no hay resultados de ejecucion en el robot fisico.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el checkpoint de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fanqi-robo/act_insert_gear_in_gripper_lr1x_s1000
- Dataset de entrenamiento: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Dataset de validacion (referenciado en la model card): https://huggingface.co/datasets/villekuosmanen/insert_gear_in_gripper_val
- Modelo relacionado del mismo autor: https://huggingface.co/fanqi-robo/molmoact2_insert_gear_in_gripper_base_expert
- Ejecucion de Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/qzin7il7
- Noticia sobre el dataset (en chino): https://www.5radar.com/dataopensource/news/468174/
- Ficha del dataset de evaluacion MolmoAct2: https://www.selectdataset.com/dataset/c4e7803930afcfbf4576954599506cd2/eval-molmoact2-insert-gear-in-gripper-yam-fft-step8000-13h20m-07-oct-2026
- Plataforma de datos roboticos relacionada: https://www.genrobot.ai/
