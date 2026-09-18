# robothwang/ACT_demo_take_02

## Resumen

ACT_demo_take_02 es una politica de aprendizaje por imitacion basada en el metodo ACT (Action Chunking with Transformers), publicada por el usuario robothwang a traves de la libreria LeRobot de HuggingFace. No es un modelo de lenguaje: es un controlador visuomotor entrenado para ejecutar una unica tarea de manipulacion robotica, concretamente "Hold the servo motor box and put it in the transparent basket" (coger la caja del servomotor y colocarla en la cesta transparente).

El modelo tiene 51.668.614 parametros (unos 51,7 M) y consume dos flujos de imagen de 3x480x640 (camaras `front` y `wrist`) junto con un vector de estado de 6 dimensiones, produciendo como salida una accion de 6 dimensiones. Se distribuye bajo licencia apache-2.0 en formato safetensors, con un repositorio de aproximadamente 0,2 GB. El robot objetivo declarado es `so_follower`, es decir, un brazo seguidor de la familia SO (SO-100/SO-101) de bajo coste.

Su relevancia es practica: sirve como referencia reproducible de un pipeline completo de imitacion (grabacion con teleoperacion, entrenamiento con LeRobot 0.6.2 y ejecucion en robot real) y como punto de partida para fine-tuning con datos propios. No cuenta con resultados de evaluacion publicados ni con descargas o valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer de aprendizaje por imitacion que predice bloques de acciones |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; control reactivo paso a paso a 30 Hz) |
| Tipos de cuantizacion | no disponible (no documentado en la model card) |
| Idiomas soportados | no disponible (no procesa texto ni lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `front`, `wrist` (3x480x640 cada una) |
| Dimension de observacion | `observation.state`: (6,) |
| Dimension de accion | `action`: (6,) |
| Frecuencia de control | 30 FPS |
| Tarea entrenada | "Hold the servo motor box and put it in the transparent basket." |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Version de LeRobot | 0.6.2 |
| Fecha de publicacion | 2026-09-17 (ultima actualizacion 2026-09-17) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir una accion individual por paso, predice un bloque corto de acciones futuras (action chunking), lo que reduce el error de composicion y suele aumentar la tasa de exito en tareas de manipulacion. El paper de referencia es arXiv:2304.13705, enlazado tanto en los tags del repositorio como en la model card. La model card no detalla los hiperparametros internos de la arquitectura (por ejemplo, tamano del bloque de acciones, backbone visual o dimension del espacio latente), por lo que esos datos quedan como no disponibles y deben consultarse en el paper citado.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `data/servobox_50_20260917_160905`, compuesto por 50 episodios y 28.622 fotogramas grabados a 30 FPS mediante teleoperacion, con una unica instruccion de tarea. La configuracion declarada es de 50.000 pasos, batch de 32, optimizador AdamW, learning rate de 1e-05 y semilla 1000. En terminos derivados, eso supone 1.600.000 muestras procesadas, equivalentes a unas 56 pasadas sobre el dataset completo. El dataset implica una media de aproximadamente 572 fotogramas por episodio, es decir, episodios de unos 19 segundos a 30 FPS. No se menciona uso de RLHF, DPO ni ningun esquema de refuerzo: se trata de clonacion de comportamiento pura a partir de demostraciones.

## Capacidades

- Control visuomotor de manipulacion: genera acciones de 6 grados de libertad a partir de dos vistas de camara y del estado del robot.
- Prediccion de bloques de acciones (action chunking), segun el metodo ACT citado.
- Ejecucion de una tarea concreta de pick-and-place: coger una caja de servomotor y depositarla en una cesta transparente.
- Control en bucle cerrado a 30 Hz, con realimentacion visual de las camaras `front` y `wrist`.
- Integracion directa con el ecosistema LeRobot para rollout en robot real mediante el comando `lerobot-rollout`.
- Capacidad de servir como base para fine-tuning con `lerobot-train` sobre datasets propios con la misma configuracion de observaciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico, generacion de texto, codigo ni matematicas: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de condicionamiento por instrucciones de texto en lenguaje natural: la tarea esta fijada en el entrenamiento.

## Casos de uso

- Pick-and-place en linea de montaje: el modelo puede recoger cajas de componentes y depositarlas en un contenedor, replicando exactamente la tarea de entrenamiento, siempre que la celula use un brazo `so_follower` y la disposicion de camaras coincida.
- Clasificacion de piezas en bandeja: con un fine-tuning sobre datos propios, la misma receta ACT puede aprender a mover objetos pequenos a una cesta, aprovechando las dos camaras para resolver oclusiones.
- Base de comparacion (baseline) en investigacion en imitacion: al ser un checkpoint ACT reproducible con configuracion documentada (50.000 pasos, batch 32, lr 1e-05), sirve para medir mejoras de nuevos metodos sobre el mismo dataset.
- Fine-tuning con datos propios de bajo coste: el modelo se puede reentrenar con `lerobot-train` sobre un dataset nuevo de 50 a 100 episodios, lo que resulta adecuado para laboratorios con pocos recursos y brazos SO-100/SO-101.
- Validacion de la pila de software LeRobot: sirve para verificar la instalacion, la calibracion de camaras y el pipeline de rollout antes de invertir tiempo en entrenamientos largos.
- Docencia y formacion en robotica: permite mostrar de extremo a extremo el flujo teleoperacion -> dataset -> entrenamiento -> despliegue en un robot real de bajo coste.
- Automatizacion de tareas repetitivas de laboratorio: recogida y reubicacion de componentes electronicos en un entorno controlado con iluminacion y posiciones estables.
- Recoleccion de datos aumentada: ejecutando la politica junto a teleoperacion correctiva se pueden generar nuevos episodios para reentrenar el modelo de forma iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y la tabla de evaluacion (tarea, ensayos, exitos, tasa de exito) aparece vacia. Tampoco se proporcionan metricas de perdida durante el entrenamiento ni cifras de latencia o throughput en robot real. No se deben asumir tasas de exito concretas sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB y en fp16/bf16 unos 103 MB. Sumando activaciones de dos imagenes de 3x480x640 y el estado, el consumo total se mantiene muy por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 funciona con holgura. No se requiere A100 ni H100. Tambien es viable en placas embebidas tipo Jetson Orin NX/AGX.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo de los ultimos anos, e incluso es candidato a ejecucion en CPU para pruebas de baja frecuencia.
- Opciones de despliegue: la documentada es `lerobot-rollout` con `--policy.path=robothwang/ACT_demo_take_02` y `--robot.type=so_follower`. No se documentan exportaciones a ONNX, TorchScript ni TensorRT. Soluciones tipo vLLM, TGI o llama.cpp no aplican a este tipo de politica.
- Latencia y throughput: no disponibles como cifras medidas. Como requisito funcional, el bucle de control debe sostener 30 FPS (unos 33 ms por paso) para reproducir la frecuencia de entrenamiento; conviene medirlo en el hardware objetivo antes de un despliegue en produccion.
- Almacenamiento: el repositorio ocupa aproximadamente 0,2 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robothwang/ACT_demo_take_02 | ACT, politica visuomotora de tarea unica | 51,7 M | dos camaras 3x480x640, estado (6,), accion (6,) | apache-2.0 | HuggingFace, 0 descargas |
| Otros checkpoints ACT publicados en el Hub de LeRobot | ACT | no disponible | depende del dataset de entrenamiento | variable | HuggingFace |
| Diffusion Policy | politica por difusion para imitacion | no disponible | implementada en LeRobot | no disponible | HuggingFace / LeRobot |
| Politicas VLA (por ejemplo pi0, SmolVLA) | vision-language-action | no disponible | condicionadas por instrucciones de texto | no disponible | HuggingFace / LeRobot |

No se han publicado comparaciones cuantitativas de este checkpoint frente a las alternativas anteriores en la informacion disponible, por lo que cualquier eleccion deberia basarse en una evaluacion propia sobre la misma tarea y el mismo hardware.

## Limitaciones y advertencias

- Tarea unica: solo ha sido entrenado para "Hold the servo motor box and put it in the transparent basket"; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que el rendimiento real en robot es desconocido.
- Dataset muy reducido: 50 episodios y 28.622 fotogramas de una sola tarea, lo que favorece el sobreajuste al entorno, la iluminacion y las posiciones concretas de la grabacion.
- Dependencia de la configuracion de sensores: la politica espera exactamente las claves `observation.images.front`, `observation.images.wrist` y `observation.state` de 6 dimensiones; cambios de camara, resolucion o calibracion degradan el comportamiento.
- Dependencia del hardware: entrenada para un robot `so_follower`; usarla con otra cinematica o con otro brazo del mismo tipo pero distinta calibracion puede fallar.
- Sensibilidad a distractores y cambios de posicion: la model card advierte de que la dificultad cambia con nuevas posiciones de objetos, iluminacion o elementos distractores, pero no cuantifica el impacto.
- Riesgo de alucinacion en el sentido de acciones incorrectas: como toda politica de clonacion de comportamiento, puede ejecutar trayectorias plausibles pero erroneas ante situaciones fuera de distribucion, sin mecanismo de deteccion de fallo.
- Sin condicionamiento por lenguaje: no acepta instrucciones de texto, por lo que no se puede reorientar la tarea en tiempo de ejecucion.
- Licencia del modelo: apache-2.0, lo que permite uso comercial del checkpoint. Sin embargo, la licencia del dataset `data/servobox_50_20260917_160905` no se especifica en la informacion disponible, lo que conviene verificar si se reutilizan los datos o se redistribuye un modelo derivado.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Despliegue en produccion: requiere robot accesible, puerto serie y camaras correctamente indexadas; el comando de la model card incluye marcadores `<...>` que hay que sustituir, y sin `--duration` la politica se ejecuta indefinidamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robothwang/ACT_demo_take_02
- Dataset de entrenamiento: https://huggingface.co/datasets/data/servobox_50_20260917_160905
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=data/servobox_50_20260917_160905
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT: https://huggingface.co/docs/lerobot/main/en/act
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
