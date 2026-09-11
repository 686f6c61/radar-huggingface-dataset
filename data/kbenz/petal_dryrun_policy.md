# kbenz/petal_dryrun_policy

## Resumen

Petal_dryrun_policy es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. La ha subido el usuario kbenz a Hugging Face usando la librería LeRobot de Hugging Face, y su función es controlar un brazo robótico de tipo `so101_follower` equipado con dos cámaras (`handeye` y `front`) para ejecutar una tarea concreta de manipulación: coger un pétalo y dejarlo en un contenedor alto.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, por lo que es muy ligero en comparación con los grandes modelos de lenguaje o los modelos visión-lenguaje-acción (VLA) actuales. Consume como entrada un vector de estado de 6 dimensiones y dos imágenes RGB de 480x640, y produce como salida un vector de acción de 6 dimensiones. Se distribuye bajo licencia Apache 2.0 y en formato safetensors.

Su relevancia es la de un ejemplo práctico y reproducible de política visuomotora de bajo coste computacional para investigación en manipulación robótica con LeRobot. No es un modelo de propósito general ni un modelo de lenguaje: es un controlador entrenado para una única tarea, con un conjunto de datos muy reducido (5 episodios y 1803 fotogramas), por lo que debe tratarse como un artefacto experimental y no como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con componente generativo tipo CVAE para prediccion de fragmentos de accion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica visuomotora; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so101_follower` |
| Camaras | `handeye`, `front` |
| Entrada (`observation.state`) | STATE, forma `(6,)` |
| Entradas visuales | `observation.images.handeye` y `observation.images.front`, VISUAL, forma `(3, 480, 640)` |
| Salida (`action`) | ACTION, forma `(6,)` |
| Libreria | lerobot (version usada en entrenamiento: 0.6.2) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de un unico paso de control. La arquitectura combina un codificador visual (que procesa las dos camaras de 480x640), un codificador de estado y un transformer condicionado por una variable latente de estilo CVAE, de forma que el modelo aprende la multimodalidad de las demostraciones humanas. La prediccion por fragmentos ayuda a reducir el error compuesto que aparece cuando se encadenan predicciones paso a paso.

El entrenamiento se realizo con LeRobot sobre el conjunto de datos `kbenz/petal_pickup_dryrun`, compuesto por 5 episodios, 1803 fotogramas a 30 FPS y una unica tarea: "Pick a petal and drop it in the tall container". La configuracion de entrenamiento fue de 2000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningun proceso de alineacion por preferencias, ya que se trata de una politica de imitacion supervisada a partir de datos de teleoperacion.

## Capacidades

- Control visuomotor de un brazo `so101_follower` a partir de observaciones visuales y de estado, generando comandos de accion de 6 dimensiones.
- Fusion de dos flujos de camara (`handeye` y `front`) para percibir la escena y la posicion del efector final.
- Generacion de fragmentos de accion (action chunking), lo que aporta movimientos mas coherentes que la prediccion paso a paso.
- Ejecucion de la tarea de recogida y colocacion de un petalo en un contenedor alto, para la que fue entrenado.
- Inferencia en tiempo real a 30 FPS, coherente con la frecuencia de captura del conjunto de datos.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso simbolico.
- No dispone de capacidades multilingues (no procesa lenguaje natural, mas alla de una etiqueta de tarea como condicionamiento textual).
- No dispone de modo de razonamiento (thinking mode), vision-lenguaje general ni procesamiento de audio.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible para estudiar como se comporta ACT con muy pocos datos (5 episodios) y detectar sobreajuste frente a generalizacion.
- Replicacion de experimentos en brazos SO-101: permite a otros laboratorios ejecutar la misma tarea con un hardware de bajo coste y comparar resultados con sus propios entrenamientos.
- Base para fine-tuning en tareas de pick-and-place: el modelo puede reentrenarse con nuevos conjuntos de datos de LeRobot para tareas similares de recogida y colocacion de objetos pequenos.
- Generacion de datos sinteticos de evaluacion: al poder desplegarse con `lerobot-rollout`, permite grabar trayectorias de politica para analizar fallos y planificar mejoras del dataset.
- Prototipado de pipelines de robotica con LeRobot: sirve como ejemplo minimo de entrenamiento, publicacion en el Hub y despliegue en un robot real dentro del flujo de trabajo de LeRobot.
- Docencia y formacion en robotica: al ser pequeno (51,7 M de parametros) y con licencia permisiva, es adecuado para cursos practicos de manipulacion y aprendizaje por imitacion.
- Evaluacion comparativa de metodos: puede usarse como linea base ACT frente a otros metodos (por ejemplo, Diffusion Policy) en la misma tarea y el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la indicacion explicita de que no se han proporcionado resultados de evaluacion para esta politica, por lo que no hay tasas de exito ni tablas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parametros, los pesos en FP32 ocupan aproximadamente 207 MB y en FP16 unos 103 MB; sumando el coste de activaciones y buffers de las dos camaras a 480x640, el modelo cabe con holgura en cualquier GPU con mas de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA es suficiente. Se puede ejecutar en RTX 3060, RTX 4090, A100, H100, etc., sin que el modelo suponga un cuello de botella; el limite practico lo marca el bucle de control y la captura de camaras, no la red.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso es viable probar inferencia en CPU o en Apple Silicon (MPS), aunque la latencia en CPU puede no sostener los 30 FPS requeridos.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--strategy.type=base`, y entrenamiento con `lerobot-train`. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponible de forma publicada; el objetivo de diseno es operar a 30 FPS, en linea con la frecuencia del conjunto de datos (30 FPS).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kbenz/petal_dryrun_policy | Politica ACT (imitacion) | 51.668.614 | Estado (6,) + 2 imagenes 480x640; salida (6,) | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Diffusion Policy (Chi et al.) | Politica de difusion (imitacion) | no disponible | Observaciones visuales y de estado | no disponible | Metodo de referencia, no es este artefacto |
| SmolVLA (LeRobot) | Vision-lenguaje-accion (VLA) | no disponible | Imagenes + instruccion en lenguaje | no disponible | Disponible en el ecosistema LeRobot |

No se dispone de datos cuantitativos publicados para esta politica que permitan una comparacion de rendimiento directa con alternativas. La comparacion anterior es, por tanto, de tipo cualitativo y de categoria (familia de metodo, licencia y disponibilidad), no de rendimiento frente a tareas.

## Limitaciones y advertencias

- Conjunto de datos muy reducido (5 episodios, 1803 fotogramas): riesgo alto de sobreajuste y de generalizacion pobre a posiciones de objeto, iluminacion o fondos distintos.
- Sin resultados de evaluacion publicados: no hay evidencia documentada de tasa de exito en el robot real.
- Entrenado para una unica tarea ("Pick a petal and drop it in the tall container"): no ejecutara otras tareas de forma fiable.
- Dependencia del hardware: esta entrenado para el robot `so101_follower` y para las camaras `handeye` y `front`; usar otro robot o cambiar la disposicion, los nombres o los indices de camara invalida la politica.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de acciones incorrectas o inseguras cuando la escena difiere de la distribucion de entrenamiento.
- No procesa lenguaje natural ni tiene capacidades multilingues; la etiqueta de tarea solo actua como condicionamiento.
- Limitaciones de contexto: no aplica una ventana de contexto textual; el horizonte temporal depende de la longitud de los fragmentos de accion aprendidos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene citar el metodo ACT y LeRobot segun indica la model card.
- Advertencia para produccion: no debe desplegarse en entornos reales sin una capa de seguridad externa (paradas de emergencia, limites de par, validacion de la escena) y sin una evaluacion propia de la tasa de exito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kbenz/petal_dryrun_policy
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/kbenz/petal_pickup_dryrun
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kbenz/petal_pickup_dryrun
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
