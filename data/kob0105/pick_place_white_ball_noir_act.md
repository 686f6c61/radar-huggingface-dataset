# kob0105/pick_place_white_ball_noir_act

## Resumen

El modelo `kob0105/pick_place_white_ball_noir_act` es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por el usuario kob0105 y entrenada con el framework LeRobot de Hugging Face. Se trata de un modelo de aprendizaje por imitación que, a partir de observaciones visuales (dos cámaras) y del estado del robot, genera secuencias de acciones para realizar una tarea de manipulación. Concretamente, ha sido entrenado para la tarea "Grab the apple" sobre un robot tipo `so_follower`, aunque el nombre del repositorio sugiere una tarea de pick-and-place de una bola blanca sobre fondo negro. El modelo tiene 51.668.614 parámetros (unos 51,7 millones), lo que lo convierte en una política ligera, y utiliza una arquitectura de transformador que predice "chunks" de acciones en lugar de pasos individuales. Su relevancia radica en que es un ejemplo práctico de cómo LeRobot permite entrenar y desplegar políticas de imitación en robots reales de forma sencilla y reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT propuesta en el paper "Action Chunking with Transformers" (arXiv:2304.13705). En lugar de predecir una única acción por paso de tiempo, ACT utiliza un transformador para predecir un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la coordinación del movimiento. Las entradas son el estado del robot (6 dimensiones) e imágenes de dos cámaras (global y palma) de 480x640 píxeles; la salida es una acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.1 sobre un dataset de 30 episodios, con 18.259 fotogramas a 30 FPS, recogidos mediante teleoperación. La configuración de entrenamiento fue: 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona el uso de RLHF o DPO, ya que es un método de aprendizaje por imitación supervisado.

## Capacidades

- Ejecuta tareas de manipulación robótica aprendidas por imitación, como coger una manzana o hacer pick-and-place de objetos.
- Procesa entradas multimodales: estado del robot (6 valores) e imágenes de dos cámaras (global y palma) a 480x640 píxeles.
- Genera acciones de 6 dimensiones para el control del robot.
- No soporta tool calling ni function calling, ya que no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking" ni de procesamiento de audio; su única modalidad es la visión de las cámaras configuradas.

## Casos de uso

- Pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para coger objetos específicos (por ejemplo, una manzana o una bola blanca) y depositarlos en una ubicación determinada, gracias a la predicción por chunks que reduce el error de trayectoria.
- Automatización de tareas repetitivas en laboratorios: en un laboratorio, puede manipular muestras, tubos o recipientes, ya que la política está entrenada para seguir una secuencia de acciones a partir de demostraciones teleoperadas.
- Robótica doméstica: puede servir para que un robot doméstico recoja objetos de una mesa o los coloque en un contenedor, siempre que la configuración de cámaras y robot sea similar a la del entrenamiento.
- Ensamblaje en producción: en líneas de montaje, la política puede ejecutar secuencias de ensamblado sencillas que requieren coordinación visomotora, aprovechando el chunking de acciones para movimientos fluidos.
- Investigación en aprendizaje por imitación: es un modelo de referencia para estudiar cómo LeRobot entrena políticas ACT, ya que el repositorio incluye toda la configuración de entrenamiento y el dataset asociado.
- Educación y demostraciones técnicas: sirve como ejemplo de despliegue de una política robótica en un robot real, usando el comando `lerobot-rollout` y la documentación de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio model card indica: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de éxito (success rate) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de 51,7 millones de parámetros, la memoria necesaria es baja, pero no hay mediciones oficiales.
- GPU recomendadas: no disponible. Al ser una política pequeña, debería ejecutarse en GPUs de gama media, pero no hay datos concretos.
- Capacidad en GPU de consumo: probablemente sí, debido al reducido número de parámetros, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot (`lerobot-rollout`), en GPU (por ejemplo, con `--policy.device=cuda`). No se mencionan otros frameworks como vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con datos de rendimiento. El autor ha publicado otro modelo similar, `kob0105/act_pusht`, también basado en ACT y con 51,7 millones de parámetros, pero no se han publicado resultados de evaluación para ninguno de los dos.

| Modelo | Parámetros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kob0105/pick_place_white_ball_noir_act | 51.668.614 | ACT | "Grab the apple" / pick-and-place | Apache-2.0 | Hugging Face |
| kob0105/act_pusht | 51,7M | ACT | no disponible | no disponible | Hugging Face |

Nota: los datos de `act_pusht` se basan únicamente en la información visible en el perfil del autor; no se han verificado detalles de licencia ni de tarea.

## Limitaciones y advertencias

- No se ha evaluado formalmente en un robot real; no hay métricas de éxito publicadas.
- El dataset de entrenamiento es pequeño (30 episodios), lo que puede limitar la generalización a nuevas posiciones de objetos, iluminación o variaciones del entorno.
- Es una política específica para el robot tipo `so_follower` y la configuración de cámaras (global y palma); cambios en el hardware o en las calibraciones pueden degradar el rendimiento.
- La tarea está descrita como "Grab the apple", pero el nombre del repositorio sugiere otra tarea; esto puede indicar una discrepancia entre el etiquetado y el contenido real.
- La licencia Apache-2.0 permite el uso comercial, pero se debe citar el método ACT y LeRobot según el model card.
- Riesgo de fallo silencioso: si las condiciones cambian, la política puede ejecutar acciones incorrectas sin ningún mecanismo de supervisión.

## Enlaces

- Modelo: https://huggingface.co/kob0105/pick_place_white_ball_noir_act
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/record-test_20260904_120022
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/record-test_20260904_120022
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/kob0105
