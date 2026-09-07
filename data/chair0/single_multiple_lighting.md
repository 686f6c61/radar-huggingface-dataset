# chair0/single_multiple_lighting

## Resumen

`chair0/single_multiple_lighting` es una politica de robotica entrenada con el framework LeRobot y basada en el metodo **Action Chunking with Transformers (ACT)**. El modelo ha sido desarrollado por el usuario `chair0` y esta publicado en Hugging Face bajo licencia Apache 2.0. Su proposito es aprender por imitacion a partir de datos teleoperados, prediciendo secuencias de acciones cortas (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el exito en tareas de manipulacion robotica.

El modelo tiene un total de 51.668.614 parametros y se distribuye en formato `safetensors`. Esta entrenado para una tarea concreta: **recoger cinta adhesiva** (`Pick up the masking tape`), utilizando un robot tipo `so_follower` con dos camaras (muñeca y superior). No se trata de un modelo de lenguaje, por lo que no se dispone de informacion sobre longitud de contexto, idiomas o cuantizaciones.

Es relevante porque representa un ejemplo practico y accesible de politica de robotica de codigo abierto, entrenada con un dataset propio y desplegable mediante LeRobot, lo que facilita su reproduccion y adaptacion en entornos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa **Action Chunking with Transformers (ACT)**, un metodo de aprendizaje por imitacion que utiliza un transformer para predecir bloques de acciones completos en lugar de una sola accion por paso. Esto reduce el error acumulativo tipico de las politicas autoregresivas y permite ejecutar movimientos mas suaves y coherentes. La politica consume como entradas el estado del robot (`observation.state`, dimension 6) y dos imagenes RGB de 480x640 (`observation.images.wrist` y `observation.images.top`), y produce como salida un vector de accion de 6 dimensiones.

El entrenamiento se realizo sobre el dataset `chair0/single_print_better_cam_merged`, compuesto por 89 episodios y 12.433 fotogramas a 30 FPS, todos ellos relacionados con la tarea de recoger cinta adhesiva. La configuracion de entrenamiento incluye 60.000 pasos, tamaño de batch 64, optimizador AdamW con learning rate de 1e-05, semilla 1000 y la version 0.6.1 de LeRobot. No se ha aplicado RLHF ni DPO, ya que es una politica de imitacion pura.

## Capacidades

- **Control robotico por imitacion**: ejecuta acciones de 6 dimensiones a partir de observaciones de estado y vision.
- **Prediccion de chunks de accion**: genera secuencias de acciones cortas, lo que mejora la suavidad y el rendimiento en manipulacion.
- **Entrada multimodal**: combina señales de estado (posicion articular) e imagenes de dos camaras (muñeca y vista superior).
- **Tarea especifica**: esta entrenado para recoger cinta adhesiva, pero el metodo ACT permite reentrenamiento para nuevas tareas con datos propios.
- **Integracion con LeRobot**: se puede ejecutar directamente con los comandos `lerobot-rollout` y `lerobot-train`.
- **No soporta**: generacion de texto, tool calling, agentes conversacionales ni procesamiento de lenguaje.

## Casos de uso

- **Manipulacion de objetos en laboratorio**: el modelo puede controlar un robot `so_follower` para recoger objetos pequenos como cinta adhesiva, utilizando las camaras de muñeca y superiores para localizar el objetivo.
- **Investigacion en aprendizaje por imitacion**: sirve como referencia para comparar politicas ACT frente a otros metodos, gracias a su dataset publico y configuracion reproducible.
- **Automatizacion de tareas repetitivas en pequenas cadenas de montaje**: se puede adaptar la politica para recoger componentes especificos en un puesto de trabajo fijo, siempre que se disponga de un robot compatible.
- **Desarrollo de robots colaborativos en entornos domesticos**: el modelo demuestra la viabilidad de entrenar politicas de manipulacion con pocos episodios, lo que puede inspirar aplicaciones en asistencia domestica.
- **Teleoperacion y despliegue rapido**: al estar publicado en Hugging Face y usar LeRobot, un investigador puede cargar la politica y ejecutarla en un robot compatible en pocos minutos.
- **Validacion de configuraciones de camaras y sensores**: el modelo sirve para probar como la disposicion de camaras (muñeca y top) afecta al rendimiento de una politica de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la informacion proporcionada.
- **GPU recomendadas**: no disponible. Dado el tamaño del modelo (51,6 millones de parametros), se espera que una GPU de gama media sea suficiente, pero no hay datos confirmados.
- **Compatibilidad con GPU de consumo**: no disponible. No se han publicado mediciones de rendimiento.
- **Opciones de despliegue**: el modelo se ejecuta mediante LeRobot, usando `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento. No esta diseñado para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otras politicas de robotica de la misma categoria.

## Limitaciones y advertencias

- **Tarea muy especifica**: el modelo solo ha sido entrenado para recoger cinta adhesiva; no se espera que generalice a otros objetos o entornos sin reentrenamiento.
- **Dataset pequeno**: con solo 89 episodios y 12.433 fotogramas, la capacidad de generalizacion es limitada y puede fallar ante variaciones de iluminacion, posicion o distracciones.
- **Sin evaluacion publicada**: no se han reportado tasas de exito ni pruebas en robot real, por lo que el rendimiento real es desconocido.
- **Hardware requerido**: necesita un robot `so_follower` y las dos camaras exactas (muñeca y top) en las que fue entrenado, con las mismas dimensiones de imagen (480x640).
- **Dependencia de LeRobot**: la ejecucion requiere la version 0.6.1 o compatible; cambios en la libreria pueden romper el despliegue.
- **Licencia Apache 2.0**: permite uso comercial, pero no se incluyen garantias de rendimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chair0/single_multiple_lighting
- Dataset de entrenamiento: https://huggingface.co/datasets/chair0/single_print_better_cam_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
