# IKOBO/act_so101_red_cube_test003_policy

## Resumen

El modelo `IKOBO/act_so101_red_cube_test003_policy` es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por IKOBO y entrenada con la librería LeRobot de Hugging Face. Está diseñada para un brazo robótico SO-101 (modelo SO-Follower) y resuelve una tarea concreta de manipulación: recoger un cubo rojo y colocarlo dentro de una zona objetivo amarilla. Se trata de un modelo de aprendizaje por imitación que aprende a partir de demostraciones teleoperadas, no de un modelo de lenguaje.

El modelo tiene 51,67 millones de parámetros y consume como entrada el estado articular del robot (6 dimensiones) junto con imágenes de dos cámaras (una cenital y otra en la muñeca), ambas a 480x640 píxeles. Produce como salida un chunk de acciones de 6 dimensiones, lo que permite ejecutar varios pasos de control de forma anticipada. Fue entrenado durante 100.000 pasos con un dataset propio de 54 episodios y 32.346 frames a 30 FPS. Su relevancia radica en ser un ejemplo práctico y reproducible de entrenamiento de políticas ACT con LeRobot sobre hardware real, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, politica de robotica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un transformer con un mecanismo de "action chunking": en lugar de predecir una sola accion por paso, el modelo predice una secuencia de acciones (un chunk) que se ejecuta de forma autoregresiva. La arquitectura se basa en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705) (Zhao et al., 2023) e incluye un codificador de imagenes (tipicamente un ResNet) para procesar las observaciones visuales de las dos camaras, junto con el estado del robot. El entrenamiento se realizo con el framework LeRobot (version 0.6.2) sobre un dataset teleoperado de 54 episodios, con 32.346 frames a 30 FPS. Se utilizo el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 8 y semilla 1000. No se aplicaron tecnicas de RLHF ni DPO; el aprendizaje es puramente por imitacion supervisada sobre las demostraciones.

## Capacidades

- Control de un brazo robotico SO-101 para tareas de manipulacion pick-and-place.
- Prediccion de chunks de acciones (varias acciones a la vez) que permiten un control mas suave y robusto que la prediccion paso a paso.
- Entrada multimodal: fusiona estado articular (6 dimensiones) con imagenes de dos camaras (cenital y muneca) a 480x640.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de ingenieria de recompensas.
- Integracion nativa con el ecosistema LeRobot: permite entrenar, evaluar y desplegar la politica mediante comandos CLI (`lerobot-rollout`, `lerobot-train`).
- No genera texto, no soporta tool calling ni razonamiento simbolico; es exclusivamente una politica de control motor.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio o fabrica: el modelo puede ejecutar la tarea de recoger un objeto y depositarlo en una zona designada de forma repetitiva, con una ventana de contexto visual fija.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para comparar ACT con otras politicas (Diffusion Policy, VQ-BeT) sobre el mismo robot y tarea, como se hace en repositorios de evaluacion publicos.
- Prototipado rapido de politicas roboticas con LeRobot: el flujo de entrenamiento y despliegue esta documentado y es reproducible, lo que permite a desarrolladores adaptar el modelo a nuevas tareas con pocos cambios.
- Benchmarking de hardware robotico: al ser un modelo pequeno (51,7M parametros), es util para validar el rendimiento de GPUs de bajo consumo o sistemas embebidos en inferencia en tiempo real.
- Educacion y formacion en robotica: el dataset y el modelo son publicos y con licencia permisiva, lo que facilita su uso en cursos y talleres sobre aprendizaje por imitacion.
- Desarrollo de sistemas de manipulacion asistida: puede integrarse en un sistema mayor que combine vision, planificacion y control, donde la politica ACT actua como modulo de bajo nivel para ejecutar la manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real. No se dispone de datos de tasa de exito, numero de ensayos ni comparaciones con otras politicas en la misma tarea.

## Requisitos de hardware

- Inferencia: al tener solo 51,7M de parametros, la politica puede ejecutarse en tiempo real en cualquier GPU moderna con al menos 4 GB de VRAM, incluyendo GPUs de consumo como la RTX 3060 o superiores. Tambien es posible ejecutarla en CPU para pruebas no criticas en tiempo real.
- Entrenamiento: el entrenamiento de 100.000 pasos con batch size 8 requiere una GPU con al menos 8-12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070 o superior). Con una A100 o H100 el tiempo de entrenamiento se reduce considerablemente.
- Despliegue: se utiliza el framework LeRobot, que gestiona la carga del modelo y la comunicacion con el robot. No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no se dispone de mediciones publicas de latencia o throughput. Dado el tamano del modelo, se espera una inferencia en el orden de milisegundos por chunk de acciones en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicos de este modelo frente a otras politicas en la misma tarea. Como referencia cualitativa, se puede comparar con:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7M | no aplica | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable (tipicamente 10-100M) | no aplica | Manipulacion general | Apache 2.0 | Hugging Face |
| VQ-BeT (LeRobot) | variable | no aplica | Manipulacion general | Apache 2.0 | Hugging Face |

No hay resultados de rendimiento publicados que permitan una comparacion cuantitativa. La eleccion entre estas politicas suele depender de la tarea concreta y del hardware disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para una tarea especifica (recoger un cubo rojo y colocarlo en una zona amarilla) y con una configuracion fija de camaras y robot. No generaliza a otras tareas ni a cambios significativos en el entorno sin reentrenamiento.
- El dataset de entrenamiento es pequeno (54 episodios), lo que puede limitar la robustez frente a variaciones en la posicion de los objetos, iluminacion o presencia de distractores.
- No se han reportado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real del modelo en condiciones de produccion.
- Depende de la calibracion del robot y de las camaras; cualquier cambio en la disposicion fisica puede degradar el rendimiento.
- No es un modelo de lenguaje ni de proposito general; no puede utilizarse para tareas de NLP, generacion de texto o razonamiento simbolico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte oficial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/IKOBO/act_so101_red_cube_test003_policy)
- [Dataset de entrenamiento](https://huggingface.co/datasets/IKOBO/so101_red_cube_test003)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guia de instalacion de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guia de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Referencia de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
