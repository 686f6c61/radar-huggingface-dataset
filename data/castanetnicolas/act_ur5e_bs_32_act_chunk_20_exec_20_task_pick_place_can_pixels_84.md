# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_20_Exec_20_TASK_pick_place_can_PIXELS_84

# ACT para UR5e: politica de pick and place de latas (LeRobot)

## Resumen

Este repositorio contiene una politica de aprendizaje por imitacion entrenada con el metodo ACT (Action Chunking with Transformers) sobre un brazo robotico Universal Robots UR5e. El modelo ha sido entrenado y publicado con LeRobot, la libreria de robotica de Hugging Face, por el usuario castanetnicolas. Su funcion es resolver una unica tarea manipulativa: coger una lata y depositarla en el contenedor correcto, a partir de dos camaras RGB y del estado del robot.

El modelo tiene 51.590.791 parametros (unos 51,6 millones) y un peso de repositorio de 0,2 GB, por lo que es un modelo pequeno en terminos de IA actual: cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU. La entrada combina un vector de estado de 9 dimensiones con dos imagenes de 84x84 pixeles, y la salida es un vector de accion de 7 dimensiones que se ejecuta sobre el robot a 20 FPS.

Su relevancia es practica mas que de escala: sirve como ejemplo reproducible de un pipeline completo de imitacion (grabacion de datos con teleoperacion, entrenamiento con ACT y despliegue en robot real) dentro del ecosistema LeRobot, y como punto de partida para hacer fine-tuning sobre tareas propias de pick and place con brazos UR5e.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con CVAE y backbone visual convolucional |
| Parametros totales | 51.590.791 (~51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume una observacion por paso (estado de 9 dims + 2 imagenes de 3x84x84) |
| Tipos de cuantizacion | no disponible (el repositorio se publica en safetensors; no se documentan recetas de cuantizacion) |
| Idiomas soportados | no aplica (no procesa lenguaje natural; la tarea se fija en el prompt de despliegue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Datos adicionales de entrada y salida declarados en la model card:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (9,) |
| `observation.images.camera1` | VISUAL | (3, 84, 84) |
| `observation.images.camera2` | VISUAL | (3, 84, 84) |
| `action` | ACTION | (7,) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de un unico paso, lo que reduce el error de composicion y permite un control mas suave. La implementacion de LeRobot sigue el paper de referencia (arXiv:2304.13705) y combina un backbone convolucional para codificar las dos vistas de camara con un transformer encoder-decoder condicionado tambien por el estado del robot. El nombre del repositorio indica ademas un tamano de chunk de accion de 20 y un horizonte de ejecucion de 20, y un lote de entrenamiento de 32; estos valores no se detallan en la model card y se deducen del identificador del modelo.

El entrenamiento se realizo sobre el dataset `castanetnicolas/UR5e_CAN_100_absolute_OSC_POS_SIZE_84`: 100 episodios y 13.120 fotogramas grabados a 20 FPS mediante teleoperacion, con la unica tarea "Pick up the can and place it in the correct bin." La configuracion declarada es de 100.000 pasos, lote de 32, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, con LeRobot 0.6.1. La model card no documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores; en esta familia de modelos el aprendizaje es puramente supervisado a partir de demostraciones.

## Capacidades

- Manipulacion robotica de pick and place: predice acciones de 7 dimensiones para un UR5e en la tarea concreta de coger una lata y colocarla en el contenedor correcto.
- Politica visomotora: fusiona estado propioceptivo de 9 dimensiones con dos flujos de imagen RGB de 84x84 a 20 FPS.
- Prediccion por chunks de acciones: genera secuencias cortas de acciones (chunk 20 / ejecucion 20 segun el identificador), lo que aporta continuidad al movimiento.
- Aprendizaje por imitacion de un unico operador humano: replica el estilo de las demostraciones registradas, no razona ni planifica de forma simbolica.
- Despliegue integrado en LeRobot: se ejecuta con el comando `lerobot-rollout` indicando tipo de robot, puerto y camaras.
- Reentrenamiento y fine-tuning: la misma receta (`lerobot-train --policy.type=act`) permite adaptarlo a otros datasets y tareas.
- No soporta tool calling, function calling, agentes, dialogo multilingue, vision general ni modos de razonamiento tipo thinking; no es un modelo de lenguaje.

## Casos de uso

- Pick and place industrial sencillo: el modelo se despliega en una celda con un UR5e y dos camaras para retirar latas u objetos cilindricos de una cinta y depositarlos en el contenedor correcto. Es adecuado porque esta entrenado exactamente para esa tarea y se ejecuta a la frecuencia de control del dataset (20 FPS).
- Automatizacion de laboratorios y almacenes ligeros: transferencia repetitiva de piezas entre dos posiciones fijas donde no se requiere generalizacion a objetos nuevos, sino fiabilidad en una tarea acotada.
- Baseline reproducible para investigacion en imitacion: sirve como referencia ACT ya entrenada para comparar contra Diffusion Policy u otras politicas de LeRobot bajo el mismo dataset y hardware.
- Fine-tuning con datos propios: partiendo de estos pesos, un equipo puede grabar sus propios episodios con el mismo UR5e y reentrenar con `lerobot-train` para adaptar la politica a otra tarea de pick and place.
- Validacion de pipelines de robotica en produccion: permite probar extremo a extremo la cadena de adquisicion de datos, entrenamiento, versionado en el Hub y despliegue con `lerobot-rollout` antes de invertir en datasets mayores.
- Docencia y formacion en robotica: ejemplo completo y ligero (51,6 M de parametros, 0,2 GB) para explicar aprendizaje por imitacion, action chunking y evaluacion en robot real.
- Generacion de datos sinteticos o de aumento: al ser una politica determinista y rapida de ejecutar, puede usarse para generar trayectorias de referencia en un gemelo digital del UR5e para posterior filtrado.

## Benchmarks y rendimiento

La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Tampoco se han encontrado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| Evaluacion en robot real (exito por tarea) | no disponible |
| MMLU / HumanEval / GSM8K u otros | no aplica (no es un modelo de lenguaje) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 51,6 M de parametros ocupan aproximadamente 206 MB; en fp16 unos 103 MB; en int8 unos 52 MB. Con activaciones y buffers de imagen, el consumo real se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna es suficiente. No se requiere A100 ni H100; una RTX 3060, RTX 4090 o incluso una GPU integrada reciente pueden ejecutar la politica.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo con mas de 1-2 GB de VRAM. Tambien es viable en CPU, aunque la latencia puede comprometer el bucle de control a 20 FPS.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path` apuntando al repositorio (documentado en la model card); el resto de backends de inferencia (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de politica robotica.
- Hardware robotico necesario: brazo UR5e, dos camaras configuradas como `camera1` y `camera2` (en el ejemplo se capturan a 640x480 y 30 FPS, aunque el modelo consume 84x84), y el puerto de comunicacion del robot.
- Latencia y throughput: no disponibles. Como referencia, los datos de entrenamiento se registraron a 20 FPS, por lo que el bucle de control debe sostener esa frecuencia.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de los modelos comparables mas alla de su identificador, por lo que los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT UR5e chunk 20 / exec 20 (este modelo) | 51.590.791 | estado (9,) + 2 imagenes 3x84x84 | pick and place de lata en UR5e | apache-2.0 | Hugging Face, lerobot |
| castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_10_Exec_10 | no disponible | no disponible | pick and place en UR5e | no disponible | Hugging Face |
| castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50_Exec_50 | no disponible | no disponible | pick and place en UR5e | no disponible | Hugging Face |
| Diffusion Policy (LeRobot) | no disponible | no disponible | aprendizaje por imitacion robotico | no disponible | GitHub de LeRobot |

## Limitaciones y advertencias

- Especializacion extrema: la politica solo ha sido entrenada para la tarea "Pick up the can and place it in the correct bin." No generaliza a otros objetos, posiciones o instrucciones sin reentrenamiento.
- Dependencia del montaje: asume dos camaras con los nombres `camera1` y `camera2` y una configuracion fisica concreta del UR5e. Cambios de iluminacion, fondo, posicion de camara u objeto degradan el comportamiento.
- Datos limitados: 100 episodios y 13.120 fotogramas de un unico operador implican un sesgo claro hacia el estilo de demostracion y poca cobertura de situaciones de recuperacion ante errores.
- Sin evaluacion publicada: no existen tasas de exito medidas en robot real, por lo que no puede afirmarse ningun nivel de rendimiento.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje; el equivalente es la ejecucion de acciones incorrectas o inseguras cuando la observacion se sale de la distribucion de entrenamiento.
- Resolucion visual baja: las entradas de 84x84 limitan la percepcion de detalles finos, lo que puede afectar a objetos pequenos o poco contrastados.
- Sin soporte de lenguaje ni de instrucciones variables: la tarea se pasa como cadena fija en el comando de despliegue, no se interpreta.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero no exime de cumplir la normativa de seguridad de maquinaria ni de validar el comportamiento en el entorno real.
- Advertencia de seguridad en produccion: al controlar un brazo fisico, cualquier despliegue debe hacerse con limites de fuerza, paradas de emergencia y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_20_Exec_20_TASK_pick_place_can_PIXELS_84
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_CAN_100_absolute_OSC_POS_SIZE_84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/UR5e_CAN_100_absolute_OSC_POS_SIZE_84
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint hermano ACT UR5e chunk 10 / exec 10: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_10_Exec_10
- Checkpoint hermano ACT UR5e chunk 50 / exec 50: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50_Exec_50
