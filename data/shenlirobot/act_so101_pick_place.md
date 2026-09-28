# shenlirobot/act_so101_pick_place

## Resumen

`shenlirobot/act_so101_pick_place` es una politica de manipulacion robotica entrenada con el metodo ACT (Action Chunking with Transformers) sobre el brazo SO101. No es un modelo de lenguaje ni un modelo de vision-lenguaje: es una politica de aprendizaje por imitacion que, a partir del estado articular y de una imagen de la camara de muñeca, genera comandos de accion para ejecutar la tarea "Pick up the block and place it in the box" (coger un bloque y depositarlo en una caja).

El modelo lo publica el usuario `shenlirobot` en Hugging Face y se ha entrenado y subido con la libreria LeRobot de Hugging Face. Cuenta con 51.668.614 parametros reales almacenados en safetensors y un repositorio de 0,2 GB. La entrada consta de `observation.state` de forma (6,) y `observation.images.wrist` de forma (3, 480, 640); la salida es `action` de forma (6,), es decir, seis grados de libertad de accion.

Es relevante en el contexto de la robotica de bajo coste y del ecosistema LeRobot, ya que ilustra el flujo completo de teleoperacion, grabacion de datos, entrenamiento de una politica ACT y despliegue en hardware real. Ahora bien, se trata de un artefacto muy acotado (10 episodios, una sola tarea, un solo robot) y sin validacion publicada, por lo que debe tratarse como una demostracion reproducible mas que como una politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), con componente CVAE segun el metodo referenciado (arXiv:2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible / no aplica (politica robotica; no es un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | no aplica (politica robotica; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la model card: robot de tipo `so_follower`, camara `wrist`, libreria `lerobot`, pipeline `robotics`, tamano del repositorio 0,2 GB.

## Arquitectura y entrenamiento

El modelo sigue el metodo ACT (Action Chunking with Transformers), descrito en el articulo arXiv:2304.13705 y referenciado en la propia model card. ACT es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composicion acumulado en horizontes largos y contribuye a tasas de exito elevadas en tareas de manipulacion. En esta implementacion concreta de LeRobot, la politica consume el estado articular (6,) y una imagen de muñeca (3, 480, 640) y produce un vector de accion (6,).

El entrenamiento se realizo con LeRobot 0.6.0 sobre el dataset `shenlirobot/so101_pick_place_test`, compuesto por 10 episodios y 5713 fotogramas a 30 FPS de la tarea "Pick up the block and place it in the box". La configuracion reportada es de 10.000 pasos de entrenamiento, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. En la informacion disponible no se detalla la composicion exacta del dataset mas alla de esos recuentos, ni se indica el uso de RLHF o DPO (tecnicas que, por otra parte, no forman parte del metodo ACT clasico). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de comandos de accion de 6 grados de libertad: produce `action` (6,) a partir de `observation.state` (6,) y de la imagen de muñeca.
- Control visomotor de manipulacion: utiliza una unica camara de muñeca como entrada visual para cerrar el bucle de agarre y colocacion.
- Ejecucion de la tarea concreta de pick-and-place: recoger un bloque y depositarlo en una caja, segun la tarea declarada en el dataset de entrenamiento.
- Aprendizaje por imitacion con prediccion de chunks de acciones: hereda de ACT la capacidad de predecir secuencias cortas de acciones en lugar de pasos aislados.
- Integracion con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y entrenable mediante `lerobot-train`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingues: no disponibles (no procesa texto).
- Modos especiales (thinking mode, audio, vision-lenguaje): no disponibles; la unica modalidad visual es la imagen de muñeca como entrada de politica.

## Casos de uso

- Automatizacion de pick-and-place en prototipos con SO101: el modelo ejecuta directamente la tarea de coger un bloque y dejarlo en una caja usando solo la camara de muñeca y el estado articular, lo que permite montar una celda de demostracion sin desarrollar una politica desde cero.
- Punto de partida para fine-tuning de tareas de recogida y colocacion: al ser una politica ACT ya entrenada sobre SO101, puede servir como inicializacion para reentrenar con un dataset propio y adaptar la tarea (por ejemplo, cambiar objeto, posicion o destino) reduciendo el coste de entrenamiento.
- Docencia en aprendizaje por imitacion: permite ilustrar el ciclo completo de teleoperacion, grabacion de episodios, entrenamiento y despliegue en hardware real de bajo coste con la libreria LeRobot.
- Comparacion de variantes ACT en SO101: existen otras politicas equivalentes en el Hub (por ejemplo, `ShiangYu/act_so101_pick_place_v2`, `nota-gmbh/so101_pick_place_act`, `ViVi-AI/ACT_so101_pick_place`), de modo que este modelo puede usarse como una de las lineas base en una comparativa de configuraciones e hiperparametros.
- Integracion en pipelines ROS 2 para SO101: proyectos comunitarios como `XinMing0212/so101-ros-ai-humble` cubren teleoperacion, conversion de datos a LeRobot, entrenamiento e inferencia, de modo que la politica puede encajarse en un flujo ROS 2 Humble sobre el mismo brazo.
- Validacion de hardware y calibracion: una ejecucion corta mediante `lerobot-rollout` con `--duration` limitado sirve para comprobar puertos, camaras, indices y calibracion del robot antes de acometer tareas de mayor duracion.
- Recoleccion de datos y aprendizaje activo: desplegar la politica y registrar los fallos permite identificar zonas de la tarea poco cubiertas por los 10 episodios originales y ampliar el dataset de forma dirigida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que todavia no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), y la plantilla de tabla de exito por tarea aparece vacia. Por tanto, no es posible reportar tasas de exito, ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51.668.614 parametros, lo que equivale a unos 197 MiB en precision de 32 bits (coincide con el tamano de repositorio de 0,2 GB) y a unos 99 MiB en 16 bits. La huella de memoria del modelo es, por tanto, inferior a 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, incluidas tarjetas de gama de entrada; el cuello de botella real es el procesamiento de imagen a 480x640 y 30 FPS, no el tamano del modelo. No se publican requisitos oficiales.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090). Tambien es viable ejecutarlo en CPU, aunque con mayor latencia en la inferencia por fotograma.
- Opciones de despliegue: el despliegue soportado es LeRobot, mediante `lerobot-rollout` con `--policy.path=shenlirobot/act_so101_pick_place` y `--robot.type=so_follower`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Configuracion de camaras: se requiere una camara `wrist` a 640x480 y 30 FPS, y los nombres de camara deben coincidir con las claves de observacion del entrenamiento.
- Latencia y throughput estimados: no disponibles (no se publican mediciones de latencia ni de frecuencia de control alcanzada en hardware real).

## Comparativa con modelos similares

| Modelo | Arquitectura / metodo | Robot / tarea | Parametros | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| shenlirobot/act_so101_pick_place | ACT (LeRobot) | SO101, pick and place | 51.668.614 | apache-2.0 | no disponibles |
| ShiangYu/act_so101_pick_place_v2 | ACT (LeRobot) | SO101, pick and place | no disponible | apache-2.0 | no disponibles |
| nota-gmbh/so101_pick_place_act | ACT (LeRobot) | SO101, pick and place | no disponible | apache-2.0 | no disponibles |
| ViVi-AI/ACT_so101_pick_place | ACT (LeRobot) | SO101, pick and place | no disponible | apache-2.0 | no disponibles |

Las alternativas encontradas comparten metodo (ACT), familia de robot (SO101) y licencia (apache-2.0), pero en la informacion disponible no se detallan sus recuentos de parametros, tamanos de contexto ni metricas de rendimiento, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Volumen de datos muy reducido: el entrenamiento se realizo con solo 10 episodios y 5713 fotogramas, lo que limita la cobertura de posiciones, iluminacion y variaciones de la tarea y aumenta el riesgo de sobreajuste.
- Ausencia de evaluacion: no hay resultados de exito publicados, por lo que se desconoce la tasa real de acierto en el robot.
- Tarea y hardware unicos: la politica esta especializada en "Pick up the block and place it in the box" sobre `so_follower` con una unica camara `wrist`; no se espera que generalice a otras tareas, objetos, robots ni configuraciones de camara.
- Sensibilidad al dominio: cambios en la posicion inicial de los objetos, en la iluminacion, en la camara o en la calibracion del brazo pueden degradar el comportamiento.
- Sin capacidades de lenguaje ni de razonamiento simbolico: no procesa instrucciones en texto, no soporta tool calling y no debe presentarse como un modelo conversacional o multimodal general.
- Sin garantias de seguridad: no se documentan mecanismos de parada segura, limites de par ni validacion de colisiones; su uso en entornos con personas requiere salvaguardas externas.
- Validacion comunitaria nula: en el momento de la ficha el modelo acumula 0 descargas y 0 "likes", por lo que no existe corroboracion externa de su funcionamiento.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero no exime de citar el metodo ACT y LeRobot ni de cumplir las condiciones de los datasets y hardware utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shenlirobot/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/shenlirobot/so101_pick_place_test
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shenlirobot/so101_pick_place_test
- Articulo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Modelo similar: https://huggingface.co/ShiangYu/act_so101_pick_place_v2
- Modelo similar: https://huggingface.co/nota-gmbh/so101_pick_place_act
- Modelo similar: https://huggingface.co/ViVi-AI/ACT_so101_pick_place
- Proyecto ROS 2 Humble para SO101: https://github.com/XinMing0212/so101-ros-ai-humble
