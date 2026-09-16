# HyeonseokE/smolvla_rq2_extract_cube_ours_repeat_1000_10fps

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) orientado a robótica, desarrollado en el ecosistema LeRobot de Hugging Face. El repositorio analizado, `HyeonseokE/smolvla_rq2_extract_cube_ours_repeat_1000_10fps`, no es el modelo base sino un ajuste fino de `lerobot/smolvla_base` sobre un único conjunto de demostraciones de teleoperación: 100 episodios y 31.733 fotogramas grabados a 10 FPS para la tarea "Extract the cube from the pocket and place it on the target marker".

El modelo resuelve un problema muy concreto de imitación robótica: dada una observación compuesta por el estado de las articulaciones (vector de 6 dimensiones) y tres imágenes RGB de 256x256 píxeles, predice un vector de acción de 6 dimensiones para un robot `so101_follower`. Con 450.046.176 parámetros y un repositorio de 0,9 GB, el interés principal reside en que SmolVLA está diseñado para ejecutarse en hardware de consumo, algo poco habitual en políticas VLA de manipulación.

Es relevante ahora porque demuestra el flujo completo de LeRobot 0.6.0: desde la grabación de datos con un brazo de bajo coste (SO-101) hasta el ajuste fino y el despliegue de una política VLA en el propio robot. La licencia Apache 2.0 facilita su reutilización, aunque se trata de un artefacto de investigación sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone vision-lenguaje con cabeza de acciones (detalle completo no disponible) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; ventana de observacion por paso de control. No disponible en detalle |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el tamano de repo de 0,9 GB sugiere precision de 16 bits) |
| Idiomas soportados | No disponible (modelo de robotica; la entrada principal son imagenes y estado articular) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | `observation.state` (6,); 3 imagenes visuales (3, 256, 256) |
| Salidas | `action` (6,); `action.radian_urdf0` (6,) |
| Robot objetivo | `so101_follower` |
| Camaras declaradas | `top`, `left_wrist` en la ficha; `camera1`, `camera2`, `camera3` en la tabla de entradas |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Dataset de entrenamiento | `HyeonseokE/rq2_extract_cube_ours_repeat_100_10fps` (100 episodios, 31.733 fotogramas, 10 FPS) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos vision-language-action: recibe observaciones multimodales (imagenes de camaras y estado proprioceptivo) y emite directamente comandos de accion de bajo nivel, sin un planificador simbolico intermedio. En este ajuste fino concreto, la politica consume tres vistas de 256x256 y un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones, con una segunda salida etiquetada como `action.radian_urdf0` tambien de 6 dimensiones, presumiblemente una representacion alternativa de la accion en radianes para el URDF del robot. La informacion disponible no detalla la composicion interna (numero de capas, dimension del backbone de lenguaje, mecanismo de atencion ni si emplea decodificacion especulativa).

El ajuste fino se realizo con LeRobot 0.6.0 durante 24.750 pasos, con tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El entrenamiento es de imitacion supervisada sobre 100 episodios de teleoperacion (31.733 fotogramas a 10 FPS) de una unica tarea: extraer un cubo de un bolsillo y depositarlo sobre un marcador. La informacion proporcionada no indica si hubo RLHF, DPO ni ninguna etapa de refinamiento posterior, ni detalla el dataset de preentrenamiento del modelo base `lerobot/smolvla_base`.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Ejecucion de una tarea de pick-and-place especifica: extraer un cubo de un receptaculo y colocarlo en un marcador objetivo.
- Percepcion multimodal: procesa simultaneamente tres flujos de imagen (3x256x256) y el estado del robot.
- Politica de imitacion entrenada de extremo a extremo, sin necesidad de planificacion explicita ni modelado del entorno.
- Inferencia en bucle cerrado a la frecuencia de control del robot (los datos se grabaron a 10 FPS).
- Integracion con el ecosistema LeRobot para despliegue (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No se ha documentado soporte de tool calling, function calling, capacidades de agente multi-paso, modo de razonamiento explicito, vision general de proposito abierto, audio ni capacidades multilingues.

## Casos de uso

- Manipulacion pick-and-place en linea de montaje: la politica extrae una pieza de un contenedor y la deposita en una posicion marcada, replicando exactamente la tarea sobre la que fue entrenada. Es adecuado porque el ajuste fino esta especializado en esa secuencia concreta y el robot objetivo (`so101_follower`) es de bajo coste.
- Reproduccion de experimentos de imitacion learning: sirve como punto de partida reproducible para comparar variantes de SmolVLA, ya que la model card documenta semilla, pasos, lote y tasa de aprendizaje.
- Ajuste fino sobre tareas de recogida y colocacion similares: al derivar de `lerobot/smolvla_base` con el flujo estandar de `lerobot-train`, se puede reentrenar con nuevos datasets manteniendo la misma configuracion de camaras y estado.
- Automatizacion de laboratorio o clasificacion de muestras: en escenarios donde un operario coloca piezas en un soporte y hay que trasladarlas a una posicion fija, la politica puede sustituir la tarea manual repetitiva.
- Docencia e investigacion con hardware asequible: el modelo cabe en GPU de consumo, lo que permite montar practicas de robotica con un SO-101 y LeRobot sin infraestructura de centro de datos.
- Validacion de pipelines de datos en robotica: el repositorio del dataset asociado (100 episodios, 31.733 fotogramas) permite probar herramientas de visualizacion, curado y conversion de datos sin necesidad de grabar nuevos episodios.
- Prototipado rapido de control visual para brazos de 6 GDL: al consumir directamente imagenes y estado, evita desarrollar un pipeline de vision clasico con deteccion, estimacion de pose y planificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de evaluacion con la anotacion explicita de que no se han proporcionado resultados para esta politica. No se dispone de tasas de exito en robot real, metricas MMLU, HumanEval, GSM8K ni equivalentes de manipulacion (por ejemplo, tasa de exito por tarea). Tampoco se documentan latencia, frecuencia de inferencia efectiva ni throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8 GB en FP32, 0,9 GB en FP16/BF16 y 0,45 GB en INT8, calculado a partir de los 450.046.176 parametros. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- El repositorio completo ocupa 0,9 GB, coherente con pesos en precision de 16 bits.
- La carga adicional de activaciones es reducida: tres imagenes de 256x256 y un vector de estado de 6 dimensiones.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, asi como en GPUs de portatil con 6-8 GB de VRAM.
- GPU recomendadas para produccion o entrenamiento: cualquiera con 8 GB o mas de VRAM; el ajuste fino documentado uso lote 64 y 24.750 pasos, por lo que una A100 o una L40S reducirian notablemente el tiempo.
- Opciones de despliegue: LeRobot con `lerobot-rollout` (flujo oficial), PyTorch con pesos safetensors. vLLM, TGI, Ollama y llama.cpp no son aplicables a este tipo de politica robotica, ya que no es un modelo de generacion de texto.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset se grabo a 10 FPS y el bucle de control del robot exige que la inferencia complete dentro del periodo correspondiente.
- El bucle de rollout requiere acceso directo al puerto serie del robot y a las camaras configuradas en el ordenador de control.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_rq2_extract_cube_ours_repeat_1000_10fps` | 450.046.176 | VLA ajustada para una tarea | apache-2.0 | Hugging Face, 0 descargas, 0 likes | Sin resultados de evaluacion |
| `lerobot/smolvla_base` | No disponible en la informacion (modelo base del ajuste) | VLA generalista de robotica | No disponible | Hugging Face, referenciado como base | No disponible |
| ACT (Action Chunking Transformer) | No disponible | Politica de imitacion por imitacion supervisada | No disponible | Ecosistema LeRobot | No disponible |
| Diffusion Policy | No disponible | Politica de imitacion basada en difusion | No disponible | Ecosistema LeRobot | No disponible |

La comparacion cuantitativa con alternativas no puede completarse con la informacion proporcionada. La diferencia principal frente al modelo base es que este repositorio esta especializado en una unica tarea y robot, mientras que `lerobot/smolvla_base` es un modelo de partida. No se dispone de datos de parametros, contexto ni rendimiento de las alternativas.

## Limitaciones y advertencias

- Politica de tarea unica: entrenada exclusivamente para "Extract the cube from the pocket and place it on the target marker". Fuera de esa tarea y de ese entorno, el comportamiento no esta garantizado.
- Ausencia total de evaluacion: la model card indica explicitamente que no se han proporcionado resultados de evaluacion, por lo que no existe una tasa de exito conocida.
- Dataset muy reducido y presumiblemente poco diverso: 100 episodios y 31.733 fotogramas, probablemente grabados por un solo operador, con un unico robot y condiciones de iluminacion y fondo concretas. Es esperable un sobreajuste a la posicion de objetos, al fondo y a las condiciones de la escena.
- Discrepancia en los nombres de las camaras: la ficha declara `top` y `left_wrist`, mientras que la tabla de entradas usa `camera1`, `camera2` y `camera3`. Replicar el despliegue exige mapear correctamente los indices, y un mapeo erroneo degradara la politica sin aviso.
- Discrepancia en el identificador del dataset: el nombre del modelo contiene `repeat_1000` mientras que el dataset enlazado se llama `repeat_100`, lo que puede indicar una version distinta de los datos o un error de nomenclatura.
- Desajuste entre la resolucion de entrenamiento y la del ejemplo de rollout: las entradas se definen a 256x256, pero el comando de ejemplo configura camaras a 640x480. Hay que verificar que el pipeline de LeRobot reescala correctamente.
- Riesgo fisico en produccion: aunque no aplica el concepto clasico de alucinacion de texto, la politica puede emitir acciones incorrectas o poco suaves de forma silenciosa. Es obligatorio implementar paradas de emergencia, limites de par y limites articulares antes de operar con personas cerca.
- Sensibilidad a cambios de calibracion del robot y de la camara: cualquier modificacion del montaje invalida las observaciones aprendidas.
- Idiomas: no disponible. No es un modelo de lenguaje conversacional, por lo que no debe evaluarse con criterios de multilingue.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia. Al derivar de `lerobot/smolvla_base`, conviene verificar tambien las condiciones del modelo base y del dataset de entrenamiento.
- Fiabilidad de mantenimiento baja: el repositorio tiene 0 descargas y 0 likes, sin senales de uso por terceros ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_rq2_extract_cube_ours_repeat_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_extract_cube_ours_repeat_100_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_extract_cube_ours_repeat_100_10fps
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
