# Cookieman12/grab_fish_eflesh_act_v1_50k

## Resumen

Cookieman12/grab_fish_eflesh_act_v1_50k es una politica de aprendizaje por imitacion desarrollada con LeRobot, basada en el metodo Action Chunking with Transformers (ACT). El modelo esta disenado para controlar un robot manipulador de tipo so101_follower y ejecutar la tarea de agarrar un pez de forma suave. Aprende de 50 episodios teleoperados que contienen 35.458 fotogramas, con observaciones de estado de 36 dimensiones y dos imagenes de camara (side y workspace) a 480x640 pixeles. La arquitectura ACT predice fragmentos de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control en tareas que requieren coordinacion. Con 51.699.334 parametros y un tamano de repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en equipos de consumo. No se especifica la longitud de contexto ni se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.699.334 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitacion que predice fragmentos cortos de acciones en lugar de un unico paso. A diferencia de los metodos autoregresivos paso a paso, ACT genera una secuencia de acciones (chunk) que se ejecuta en el robot, lo que reduce el efecto de los errores acumulados y mejora la consistencia del movimiento. En este caso, el modelo recibe como entrada el estado del robot (36 valores) y dos vistas de camara (side y workspace) de 480x640 pixeles, y produce como salida una accion de 6 dimensiones.

El entrenamiento se realizo con el framework LeRobot sobre el dataset Cookieman12/grab_fish_eflesh_act_v1, que contiene 50 episodios teleoperados, 35.458 fotogramas a 30 FPS y una unica tarea anotada: "Grab the fish smoothly". La configuracion de entrenamiento incluye 50.000 pasos, batch size 8, optimizador AdamW y tasa de aprendizaje 1e-05 con semilla 1000. Se utilizo la version 0.6.1 de LeRobot. No se indica la composicion exacta del dataset ni si se aplico RLHF, DPO o alguna tecnica de ajuste adicional.

## Capacidades

- Generacion de acciones continuas (6 dimensiones) para el control del robot.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas.
- Entrada multimodal: estado del robot (36 valores) y dos camaras RGB (side y workspace) a 480x640.
- Prediccion por chunks de accion, lo que mejora la suavidad y precision en movimientos continuos.
- Limitado a la tarea para la que fue entrenado; no ofrece capacidades de lenguaje, tool calling ni agentes autonomos.

## Casos de uso

- Grasp robotico de objetos delicados: el modelo esta entrenado para agarrar un pez de forma suave, por lo que puede utilizarse en entornos de laboratorio donde se requiere un contacto cuidadoso con objetos fragiles o deformables.
- Teleoperacion y recoleccion de datos: al ser una politica de imitacion entrenada con 50 episodios teleoperados, es util para demostrar como generar un dataset de demostraciones y entrenar una politica con LeRobot.
- Investigacion en aprendizaje por imitacion: el modelo sirve como referencia para comparar el rendimiento de ACT frente a otros algoritmos de policy learning sobre un robot so101_follower.
- Control de manipulador en entorno controlado: con las camaras side y workspace calibradas, la politica puede ejecutar la tarea de agarre de forma reproducible en un entorno de laboratorio.
- Evaluacion de politicas en robotica: el sistema LeRobot permite reproducir el rollout con el comando lerobot-rollout, lo que facilita pruebas rapidas en robot real o en simulacion.
- Educacion y formacion en robotica: es un modelo pequeno (51,7 M de parametros) que puede ejecutarse en GPUs de consumo, lo que permite a estudiantes e investigadores experimentar con control por imitacion sin infraestructura costosa.
- Desarrollo de sistemas de manipulacion con dual-camera: integra dos camaras y estado del robot, sirviendo como base para ampliar la tarea a otros objetos si se reentrena con nuevos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumo: no existe informacion oficial sobre el consumo de VRAM. Dado el tamano de 51,7 M de parametros y un peso de 0,2 GB, es previsible que se ejecute en GPUs de gama media, pero no hay mediciones que lo confirmen.
- Opciones de despliegue: la model card facilita su ejecucion mediante LeRobot (comando lerobot-rollout) y su entrenamiento con lerobot-train. No se mencionan vLLM, llama.cpp ni TGI, al tratarse de un modelo de robotica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Existen otros modelos ACT publicados por el mismo autor, como Cookieman12/grab_fish_act_v8_RETRAIN_50k, pero no se dispone de sus especificaciones ni resultados en la informacion disponible. En el repositorio de LeRobot se pueden encontrar numerosas politicas ACT para otras tareas, pero no se incluyen datos comparativos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Cookieman12/grab_fish_eflesh_act_v1_50k | 51.699.334 | no disponible | no disponible | Apache-2.0 |
| Cookieman12/grab_fish_act_v8_RETRAIN_50k | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No existen resultados de evaluacion publicados: el rendimiento real en robot es desconocido.
- El modelo se ha entrenado especificamente para "Grab the fish smoothly"; puede no generalizar a otros objetos, posiciones o condiciones de iluminacion.
- Depende de las observaciones exactas: requiere el mismo formato de estado (36 valores) y las camaras side y workspace; cambios en la calibracion o en el hardware pueden degradar el comportamiento.
- No se dispone de informacion sobre la diversidad del dataset, su composicion o posibles sesgos en las demostraciones.
- Al tratarse de una politica de imitacion, puede heredar sesgos del comportamiento teleoperado original, como trayectorias suboptimas si el demostrador ejecuta movimientos poco eficientes.
- La licencia Apache-2.0 permite el uso comercial, pero no incluye garantias de rendimiento ni soporte oficial.

## Enlaces

- https://huggingface.co/Cookieman12/grab_fish_eflesh_act_v1_50k
- https://huggingface.co/papers/2304.13705
- https://github.com/huggingface/lerobot
- https://huggingface.co/docs/lerobot/main/en/act
- https://huggingface.co/datasets/Cookieman12/grab_fish_eflesh_act_v1
- https://huggingface.co/spaces/lerobot/visualize_dataset?path=Cookieman12/grab_fish_eflesh_act_v1
- https://huggingface.co/Cookieman12/grab_fish_act_v8_RETRAIN_50k
