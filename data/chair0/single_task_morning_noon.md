# chair0/single_task_morning_noon

## Resumen

El modelo `chair0/single_task_morning_noon` es una política robótica de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), desarrollada por chair0 (Jason Lee) dentro del ecosistema LeRobot de HuggingFace. ACT es un método que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado en la ejecución de tareas de manipulación. Este modelo concreto está entrenado para controlar un robot de tipo `so_follower` y resolver dos tareas de recogida de objetos: "Pick up the masking tape" y "Pick up the yellow print".

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con un tamaño de repo de 0,2 GB. Está diseñado para consumir como entrada el estado del robot (6 dimensiones) y dos imágenes de cámara (muñeca y superior) a resolución 480x640, y produce acciones de 6 dimensiones como salida. Al estar publicado bajo licencia Apache-2.0 y ser compatible con LeRobot, resulta útil para investigadores y desarrolladores que trabajan en manipulación robótica y desean reproducir o comparar políticas ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con codificadores de vision |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la ventana de observacion y el chunk de acciones no se especifican) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se especifican cuantizaciones) |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer encoder-decoder que aprende a predecir secuencias de acciones a partir de observaciones. En este modelo, las entradas visuales (imagenes de las camaras `wrist` y `top`) se procesan mediante codificadores de vision y se combinan con el estado del robot (`observation.state`, dimension 6) para generar una prediccion de accion de 6 dimensiones. La innovacion clave de ACT es el "action chunking": en lugar de predecir un unico paso de accion, el modelo predice un fragmento de acciones, lo que mejora la estabilidad y reduce el error de composicion en tareas de manipulacion.

El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre el dataset `chair0/single_task_morning_noon`, que contiene 59 episodios y 8.667 frames a 30 FPS, correspondientes a dos tareas de recogida. La configuracion de entrenamiento incluye 60.000 pasos, batch size de 64, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitacion a partir de datos teleoperados.

## Capacidades

- Generacion de acciones de robot: predice acciones de 6 dimensiones (posicion y orientacion) a partir del estado del robot y de dos camaras.
- Percepcion visual: procesa imagenes de 480x640 de las camaras `wrist` y `top` para localizar objetos y guiar la manipulacion.
- Aprendizaje por imitacion: reproduce tareas de pick-and-place aprendidas de demostraciones teleoperadas.
- Action chunking: genera secuencias de acciones en lugar de pasos individuales, lo que mejora la precision en la ejecucion.
- Soporte de tool calling / function calling: no aplica (modelo de robotica).
- Soporte de agentes y multi-step reasoning: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: integracion nativa con LeRobot para entrenamiento, rollout y evaluacion en robots reales.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede ejecutar la tarea "Pick up the masking tape" en un robot SO-Follower, utilizando las camaras `wrist` y `top` para localizar la cinta y el estado del robot para controlar el movimiento. Es adecuado porque ACT predice chunks de acciones que reducen el error de ejecucion en movimientos continuos.

- Recogida de objetos en lineas de produccion: con una camara superior y una de muneca, el modelo puede identificar y recoger objetos de una cinta transportadora. Su arquitectura transformer permite modelar secuencias de acciones complejas, lo que facilita la adaptacion a tareas repetitivas.

- Investigacion en aprendizaje por imitacion: el modelo sirve como baseline para comparar politicas ACT con otros metodos dentro del ecosistema LeRobot. Su tamano reducido (51,7M parametros) y su configuracion de entrenamiento documentada permiten reproducir experimentos y analizar el comportamiento del action chunking.

- Teleoperacion semi-autonoma: el modelo puede asistir a un operador humano en tareas repetitivas, prediciendo acciones a partir de la demostracion. Se puede integrar en sistemas de teleoperacion mediante `lerobot-rollout`, reduciendo la carga del operador en tareas de larga duracion.

- Robotica educativa: al estar publicado bajo licencia Apache-2.0 y ser compatible con LeRobot, es util para cursos de robotica que ensenen aprendizaje por imitacion. Los estudiantes pueden cargar el modelo con `lerobot-rollout` y experimentar con tareas de manipulacion en un robot real.

- Benchmarking de politicas en hardware robotico: el modelo puede desplegarse en robots SO-Follower para evaluar la robustez de ACT bajo diferentes condiciones de iluminacion y posicion de objetos. Su configuracion de entrenamiento y su dataset estan disponibles, lo que facilita la comparacion de resultados entre laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7M parametros, el modelo es ligero; en FP32 el checkpoint ocupa aproximadamente 207 MB, y en FP16 unos 103 MB. Se estima que cabe en GPUs con 4 GB o mas, aunque no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA RTX 3060, RTX 4060 o superior, es suficiente para la inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o mas.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer de gama media con 4 GB o mas.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` o el framework LeRobot en Python. No aplica vLLM, llama.cpp, TGI ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se mencionan modelos comparables de la misma categoria, ni se aportan datos de rendimiento que permitan establecer una comparativa con otras politicas ACT o de aprendizaje por imitacion.

## Limitaciones y advertencias

- El modelo se entreno con un dataset muy reducido (59 episodios y 8.667 frames), lo que limita su generalizacion a nuevas posiciones de objetos, condiciones de iluminacion o distracciones.
- No se han publicado resultados de evaluacion, por lo que su rendimiento en el mundo real no esta verificado.
- Las tareas son muy especificas ("Pick up the masking tape" y "Pick up the yellow print") y el modelo no esta disenado para tareas de lenguaje, razonamiento ni vision general.
- Depende de la configuracion exacta del robot y de las camaras; cambios en la calibracion, la posicion de la camara o el tipo de robot pueden degradar el rendimiento.
- Al ser un modelo de aprendizaje por imitacion, puede fallar ante situaciones no vistas durante el entrenamiento, como obstaculos o variaciones en la forma del objeto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chair0/single_task_morning_noon
- Dataset de entrenamiento: https://huggingface.co/datasets/chair0/single_task_morning_noon
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
