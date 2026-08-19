# BravoRobots/nvidialab_act_recogida

## Resumen

El modelo `BravoRobots/nvidialab_act_recogida` es una politica de robotica entrenada con el metodo ACT (Action Chunking with Transformers), una tecnica de aprendizaje por imitacion que predice secuencias cortas de acciones en lugar de pasos individuales. Fue desarrollado por el usuario BravoRobots utilizando la libreria LeRobot de Hugging Face y esta pensado para controlar el brazo robotico Sony SO-ARM en su configuracion de seguidor (follower). El modelo tiene aproximadamente 51,6 millones de parametros y se entrena a partir de demostraciones teleoperadas, lo que le permite aprender tareas de manipulacion sin necesidad de programacion explicita de cada movimiento.

La relevancia de este modelo radica en que ACT es uno de los metodos de aprendizaje por imitacion mas utilizados en robotica de bajo coste, con resultados de exito elevados en tareas de manipulacion fina. Este modelo concreto fue entrenado sobre un dataset de 91 episodios y 36.971 fotogramas a 30 FPS, con dos camaras RGB (superior y gripper) y el estado articular del robot como entradas. Aunque la descripcion de la tarea es un placeholder ("My task description"), el nombre del dataset y los modelos relacionados del mismo autor sugieren una tarea de recogida de objetos en un entorno de laboratorio NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone Transformer y CVAE |
| Parametros totales | 51.596.934 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la politica procesa observaciones de imagen y estado, no texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32) |
| Idiomas soportados | No aplica (modelo de robotica, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion presentado en el articulo arXiv:2304.13705. La arquitectura combina un Transformer con un CVAE (Conditional Variational Autoencoder): el codificador variaonal condiciona la generacion de acciones en las observaciones actuales, mientras que el decodificador Transformer predice un "chunk" de acciones futuras en lugar de una sola accion. Este enfoque reduce el error de compounding que sufren los metodos que predicen paso a paso.

El entrenamiento se realizo con LeRobot version 0.6.0, utilizando el dataset `BravoRobots/nvidialab_recogida` que contiene 91 episodios y 36.971 fotogramas capturados a 30 FPS. La configuracion de entrenamiento incluye 40.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-05 y semilla 1000. El modelo recibe como entrada el estado articular del robot (6 dimensiones) y dos imagenes RGB de 480x640 píxeles (camara superior y camara del gripper), y produce acciones de 6 dimensiones correspondientes a los joints del brazo.

## Capacidades

- Control de manipulacion robotica mediante aprendizaje por imitacion: el modelo reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Prediccion de chunks de acciones: en lugar de predecir una sola accion, genera secuencias de acciones, lo que mejora la estabilidad del control.
- Percepcion visual multimodal: procesa simultaneamente dos camaras RGB (vista superior y vista del gripper) para contextualizar la tarea.
- Control articular de 6 grados de libertad: emite comandos de posicion para los 6 joints del robot SO-ARM follower.
- Integracion con el ecosistema LeRobot: compatible con las herramientas de entrenamiento, evaluacion y despliegue de LeRobot.
- Aprendizaje de tareas de manipulacion fina: el metodo ACT esta disenado para tareas que requieren precision, como recogida y colocacion de objetos.

## Casos de uso

- Recogida de objetos en entornos de laboratorio: el modelo puede ejecutar tareas de recogida de elementos en superficies de trabajo, utilizando la camara superior para localizar el objeto y la camara del gripper para ajustar la pinza. Es adecuado porque ACT destaca en tareas de manipulacion que requieren precision sub-centimetrica.
- Clasificacion y separacion de residuos: el nombre del dataset ("recogida") y el modelo relacionado `act_recoger_basura` sugieren una tarea de recogida de basura. El modelo podria usarse para separar objetos en contenedores distintos basandose en su posicion visual.
- Automatizacion de tareas repetitivas de pick-and-place: en entornos de produccion o investigacion, el modelo puede sustituir la teleoperacion manual por ejecucion autonoma de tareas repetitivas, reduciendo el esfuerzo del operador.
- Investigacion en aprendizaje por imitacion: este modelo sirve como punto de partida para estudiar el comportamiento de ACT con datos de demostracion limitados (solo 91 episodios) y para comparar con otros metodos como Diffusion Policy.
- Desarrollo de sistemas de teleoperacion asistida: el modelo puede integrarse en configuraciones lider-seguidor (leader-follower) donde el brazo seguidor ejecuta de forma autonoma lo que el lider demuestra, permitiendo amplificar las capacidades del operador.
- Educacion y formacion en robotica: al ser un modelo pequeno (51,6 M de parametros) con licencia Apache-2.0, es adecuado para cursos y talleres donde los estudiantes puedan entrenar, evaluar y modificar politicas de manipulacion con hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion ("No evaluation results have been provided for this policy yet"), por lo que no es posible comparar su tasa de exito en tareas reales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 206 MB en FP32 (51,6 M parametros x 4 bytes). En FP16 se reduce a unos 103 MB. El modelo cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM es suficiente. Una RTX 3060 o superior ofrece margen comodo. Tambien es viable la inferencia en CPU para este tamano de modelo, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: si, el modelo es compatible con todas las GPUs de consumo actuales (serie RTX 30, 40 y 50) e incluso con GPUs integradas de gama media.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en el robot, y `lerobot-train` para reentrenar. No aplican herramientas de inferencia de LLMs como vLLM, TGI u Ollama, ya que se trata de una politica de robotica y no de un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos especificos de latencia. Dado el tamano del modelo y la resolucion de las imagenes de entrada (2 x 480x640 RGB), se espera que la inferencia se ejecute en tiempo real (30 FPS) en una GPU de gama media, aunque este dato no esta confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dataset | Robot | Licencia |
|---|---|---|---|---|---|
| BravoRobots/nvidialab_act_recogida | ACT (Transformer + CVAE) | 51,6 M | BravoRobots/nvidialab_recogida (91 episodios) | SO-ARM follower | Apache-2.0 |
| BravoRobots/act_recoger_basura | ACT | No disponible | BravoRobots/nvidialab_recogida | No disponible | No disponible |
| Politicas ACT oficiales de LeRobot | ACT | Variable segun configuracion | Diversos datasets de demostracion | SO-ARM, Aloha, etc. | Apache-2.0 |
| Diffusion Policy (soportado por LeRobot) | Diffusion model sobre acciones | Variable | Diversos | Diversos | Apache-2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que ninguno ha publicado resultados de evaluacion en la informacion disponible. La comparativa se limita a aspectos arquitectonicos y de configuracion.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion: el autor indica explicitamente que no hay resultados de evaluacion para esta politica, por lo que se desconoce su tasa de exito real en el robot.
- Descripcion de tarea placeholder: la tarea esta definida como "My task description", lo que impide conocer con precision que comportamiento se espera del modelo.
- Dataset limitado: con solo 91 episodios de demostracion, el modelo puede no generalizar bien a posiciones de objetos, condiciones de iluminacion o configuraciones distintas a las del entrenamiento.
- Riesgo de sobreajuste: el entrenamiento con un dataset pequeno y 40.000 pasos puede provocar sobreajuste a las demostraciones concretas, reduciendo la robustez ante variaciones del entorno.
- Dependencia de la configuracion del robot: el modelo esta entrenado para el robot SO-ARM follower con dos camaras especificas. Cambios en la posicion de las camaras, el calibrado o el propio robot pueden degradar significativamente el rendimiento.
- Sin soporte de lenguaje: al ser una politica de robotica, no procesa instrucciones textuales ni dialogos. No es util para tareas que requieran comprension del lenguaje.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero es recomendable revisar los terminos completos de la licencia antes de un despliegue en produccion.
- Fecha de creacion futura: el modelo fue creado el 2026-08-17, lo que sugiere que es muy reciente y puede carecer de validacion comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BravoRobots/nvidialab_act_recogida
- Dataset de entrenamiento: https://huggingface.co/datasets/BravoRobots/nvidialab_recogida
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=BravoRobots/nvidialab_recogida
- Modelo relacionado (act_recoger_basura): https://huggingface.co/BravoRobots/act_recoger_basura
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de despliegue (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Proyectos de investigacion de NVIDIA Labs: https://github.com/NVlabs
