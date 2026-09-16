# castanetnicolas/ACT_UR5e_BS_16_Act_Chunk_50_Exec_50

## Resumen

ACT_UR5e_BS_16_Act_Chunk_50_Exec_50 es una politica de aprendizaje por imitacion (imitation learning) para robotica, entrenada con LeRobot y publicada en HuggingFace Hub por el usuario castanetnicolas. Se trata de una implementacion del metodo Action Chunking with Transformers (ACT), descrito en el paper arXiv:2304.13705, que en lugar de predecir una accion aislada por paso de control predice fragmentos (chunks) de acciones futuras, lo que reduce el error de acumulacion y mejora la estabilidad de las politicas visomotoras entrenadas a partir de teleoperacion.

El modelo esta especializado en una unica tarea de manipulacion sobre un robot Universal Robots UR5e: recoger una lata y depositarla en el contenedor correcto ("Pick up the can and place it in the correct bin"). Consume dos flujos de imagen de 256x256 píxeles procedentes de dos camaras y un vector de estado de 9 dimensiones, y produce un vector de accion de 7 dimensiones. Cuenta con 51.621.511 parametros (~51,6 M) y ocupa 0,2 GB en el repositorio, con pesos en formato safetensors.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: dataset de 100 episodios y 15.042 fotogramas grabados a 20 FPS, entrenamiento de 100.000 pasos con AdamW y publicacion del checkpoint junto con las instrucciones de despliegue. No es un modelo de lenguaje ni un modelo fundacional generalista: es un checkpoint de politica especifico de robot y de tarea, sin resultados de evaluacion publicados y con cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitacion; no se detalla en la model card la composicion interna de capas |
| Parametros totales | 51.621.511 (~51,6 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de lenguaje; la politica opera sobre la observacion actual y horizones de prediccion de acciones) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplicable (politica visomotora; no procesa lenguaje natural, solo se le pasa una cadena de tarea a nivel de CLI) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot (LeRobot 0.6.1) |
| Tipo de robot | ur5e (Universal Robots UR5e) |
| Camaras de entrada | camera1, camera2 |
| Entrada: observation.state | STATE, shape (9,) |
| Entrada: observation.images.camera1 | VISUAL, shape (3, 256, 256) |
| Entrada: observation.images.camera2 | VISUAL, shape (3, 256, 256) |
| Salida: action | ACTION, shape (7,) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que aprende a partir de demostraciones teleoperadas y predice chunks de acciones cortas en lugar de pasos individuales, lo que segun el propio paper asociado (arXiv:2304.13705) suele traducirse en tasas de exito elevadas en tareas de manipulacion. La model card no especifica la composicion exacta de la red (tipo de codificador visual, numero de capas, dimension del transformer ni el tamano del chunk), por lo que esos detalles quedan como no disponibles en esta ficha. El nombre del repositorio incluye las cadenas "Act_Chunk_50" y "Exec_50", que sugieren un tamano de chunk de acciones y un horizonte de ejecucion de 50 pasos, pero se trata de una inferencia a partir del identificador, no de un dato confirmado en la documentacion.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset castanetnicolas/UR5e_pick_and_place_CAN_100_delta_joint, compuesto por 100 episodios, 15.042 fotogramas a 20 FPS (aproximadamente 12,5 minutos de demostracion en total, en torno a 7,5 segundos por episodio) y una unica tarea. La configuracion declarada es de 100.000 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta si hubo etapas de RLHF, DPO ni refinamiento posterior: al tratarse de imitation learning supervisado, el paradigma es de clonacion de comportamiento sobre las trayectorias demostradas, con el delta de articulaciones (delta_joint) como espacio de acciones segun el nombre del dataset.

## Capacidades

- Control visomotor de manipulacion: genera comandos de accion de 7 dimensiones (tipicamente 6 grados de libertad mas pinza) a partir de dos vistas de camara y del estado del robot.
- Prediccion por chunks de acciones: en lugar de una accion por inferencia, produce secuencias cortas de acciones, lo que mejora la coherencia temporal del movimiento.
- Ejecucion de una tarea concreta: recoger una lata y colocarla en el contenedor correcto.
- Aprendizaje por imitacion a partir de teleoperacion: no requiere recompensas ni simulador, solo demostraciones humanas.
- Integracion con el ecosistema LeRobot: carga directa mediante `--policy.path` en las herramientas `lerobot-rollout` y `lerobot-train`.
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplicable en el sentido de agentes basados en lenguaje; el equivalente funcional es la ejecucion de un chunk de acciones encadenado a lo largo del tiempo.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (vision, audio, thinking mode): dispone de entrada visual por dos camaras; no hay entrada de audio ni modo de razonamiento explicito.
- Condicionamiento por tarea: la instruccion textual se pasa como parametro de la CLI (`--task`), no como entrada aprendida del modelo.

## Casos de uso

- Automatizacion de pick-and-place en lineas de montaje: el modelo esta entrenado especificamente para recoger un objeto y depositarlo en el contenedor correcto sobre un UR5e, por lo que se puede desplegar como politica de referencia en una celda de clasificacion de piezas ligeras.
- Banco de pruebas para evaluar el stack LeRobot: sirve como ejemplo completo y reproducible (dataset, configuracion de entrenamiento y comando de rollout) para validar instalaciones de LeRobot, drivers de camaras y calibracion del UR5e antes de abordar proyectos propios.
- Punto de partida para fine-tuning con datos propios: al ser un checkpoint ACT con licencia apache-2.0, se puede reentrenar con un dataset propio de otra tarea de manipulacion usando `lerobot-train` con `--policy.type=act`.
- Investigacion en imitation learning y action chunking: permite reproducir y comparar el comportamiento de ACT frente a alternativas como Diffusion Policy sobre una tarea de dificultad moderada y con datos publicos.
- Docencia y formacion en robotica: el flujo de grabacion, entrenamiento y despliegue esta documentado paso a paso, lo que lo hace util para cursos practicos de aprendizaje por imitacion.
- Validacion de infraestructura de inferencia en tiempo real: al requerir el bucle de control aproximadamente 50 ms por paso (20 FPS), permite medir latencias reales de percepcion mas inferencia en GPUs de gama media.
- Pruebas de robustez y analisis de fallos: al no existir resultados de evaluacion publicados, el checkpoint es util para ejecutar barridos sistematicos de condiciones (posicion del objeto, iluminacion, distractores) y cuantificar la degradacion de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni comparaciones cuantitativas con otras politicas. Tampoco se han encontrado resultados relevantes en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 51,6 M de parametros. Solo los pesos ocupan aproximadamente 206 MB en fp32 y 103 MB en fp16; sumando activaciones de dos codificadores visuales a 256x256 y el buffer del chunk de acciones, un presupuesto de 1-2 GB de VRAM es suficiente. Se trata de una estimacion a partir del numero de parametros, no de una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM. Para robot real, una RTX 3060/4060 o superior es mas que suficiente; en entornos de laboratorio se puede usar tambien A100 o H100, aunque estan sobredimensionadas para este tamano de modelo. La model card solo indica `--policy.device=cuda` como opcion.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPUs de consumo, incluidas gamas de entrada con 4-6 GB. El cuello de botella previsible es la captura y preprocesado de dos camaras a 256x256, no los pesos.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--strategy.type=base` y `--policy.path=castanetnicolas/ACT_UR5e_BS_16_Act_Chunk_50_Exec_50`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: el dataset de entrenamiento se grabo a 20 FPS, lo que implica un objetivo de control de aproximadamente 50 ms por paso. No se proporcionan mediciones reales de latencia ni de throughput de inferencia.
- Requisitos adicionales: robot UR5e fisico, dos camaras configuradas con los mismos nombres de clave de observacion (`camera1`, `camera2`) con los que se entreno la politica, y un puerto de comunicacion con el robot para el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_UR5e_BS_16_Act_Chunk_50_Exec_50 (este modelo) | 51,6 M | no disponible; chunk y ejecucion de 50 pasos segun el nombre del repo (no confirmado) | ACT, imitation learning con action chunking | apache-2.0 | HuggingFace Hub, 0 descargas |
| ACT original (referencia del paper arXiv:2304.13705) | no disponible en la informacion proporcionada | no disponible | ACT, imitation learning con action chunking | no disponible en la informacion proporcionada | Implementacion de referencia asociada al paper |
| Diffusion Policy | no disponible en la informacion proporcionada | no disponible | Politica generativa basada en difusion de acciones | no disponible en la informacion proporcionada | Implementacion publica del metodo |
| SmolVLA (HuggingFace) | no disponible en la informacion proporcionada | no disponible | Vision-language-action con condicionamiento por lenguaje | no disponible en la informacion proporcionada | Ecosistema LeRobot |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea, un unico tipo de robot (UR5e) y una unica configuracion de camaras. No es transferible sin reentrenamiento.
- Sin resultados de evaluacion: la model card declara explicitamente que no se han aportado resultados, por lo que la tasa de exito real es desconocida y no puede asumirse que el modelo funcione en produccion.
- Dataset reducido: 100 episodios y 15.042 fotogramas de una sola escena. El riesgo de sobreajuste al entorno de grabacion y de degradacion ante cambios de iluminacion, posicion del objeto, color de la lata o presencia de distractores es alto.
- Sesgo de las demostraciones: la politica replica los sesgos y las estrategias del operador que teleopero los datos, incluidas posibles trayectorias suboptimas o dependientes del objeto concreto empleado durante la recogida.
- Ausencia de condicionamiento por lenguaje: el campo `--task` es informativo en la CLI; el modelo no comprende instrucciones nuevas, lo que limita su uso a la tarea entrenada.
- Dependencia de las claves de observacion: los nombres de las camaras deben coincidir exactamente con `camera1` y `camera2`, y las dimensiones con 3x256x256; cualquier desviacion en el pipeline de captura puede degradar o invalidar la inferencia.
- Riesgo de fallo fisico: al tratarse de una politica que controla un robot real, sus fallos pueden provocar colisiones, caidas de objetos o danos materiales. Es imprescindible operar con limites de seguridad, parada de emergencia y, preferiblemente, validacion en simulacion o en espacio restringido.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero la licencia del dataset de entrenamiento y de posibles dependencias de terceros no se detalla en la informacion proporcionada y debe verificarse por separado.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; es un checkpoint sin validacion externa por parte de la comunidad.
- Reproducibilidad: se declaran semilla 1000, lr 1e-05 y batch 16, pero no se documenta la duracion del entrenamiento en horas ni el hardware utilizado, lo que dificulta reproducir el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_16_Act_Chunk_50_Exec_50
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_pick_and_place_CAN_100_delta_joint
- Visualizacion del dataset en el Space de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/UR5e_pick_and_place_CAN_100_delta_joint
- Paper de ACT (referencia del modelo): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados (soporte de Microsoft y numeracion telefonica).
