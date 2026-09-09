# seriintan/act_frazier_kyc

## Resumen

`act_frazier_kyc` es una politica de robotica entrenada con [LeRobot](https://github.com/huggingface/lerobot) por el usuario `seriintan`. El modelo recibe el nombre interno `act_kyc` y esta concebido para controlar un robot de tipo `so_follower` en la tarea "Pick and place Frazier to blue basket", es decir, tomar un objeto denominado "Frazier" y depositarlo en una cesta azul.

La politica pertenece al pipeline de `robotics` y se publica bajo licencia Apache-2.0. Segun los datos de los pesos en safetensors, el modelo tiene 55.863.046 parametros, con un tamano de repositorio de 0.2 GB. Se trata de un modelo de aprendizaje por imitacion basado en la arquitectura ACT (Action Chunking with Transformers), no de un modelo de lenguaje, por lo que no tiene ventana de contexto ni soporte de idiomas.

Es relevante porque representa un ejemplo completo de entrenamiento y publicacion de una politica de robotica con LeRobot, un framework en aumento para robotica de open source. Incluye el dataset asociado, la configuracion de entrenamiento y las instrucciones de `rollout`, lo que permite reproducir el flujo de trabajo de imitation learning de principio a fin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo ACT (Action Chunking with Transformers), politica de robotica |
| Parametros totales | 55.863.046 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; es una politica de control robotico y vision) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, sin cuantizacion) |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La politica `act_kyc` se entrena con LeRobot y utiliza una arquitectura de tipo ACT, un metodo de aprendizaje por imitacion que predice secuencias de acciones en lugar de acciones puntuales. Esto permite generar chunks de accion mas suaves y coherentes para el control robotico.

Las observaciones de entrada son las siguientes:

- `observation.state`: vector de estado del robot de dimension 6.
- `observation.images.front`: imagen de la camara frontal, formato `(3, 480, 640)`.
- `observation.images.gripper`: imagen de la camara de la pinza, formato `(3, 480, 640)`.

La salida es una accion de 6 dimensiones (`action`).

La configuracion de entrenamiento declarada en la model card es la siguiente:

| Setting | Value |
|---|---|
| Training steps | 50000 |
| Batch size | 16 |
| Optimizer | adamw |
| Learning rate | 1e-05 |
| Seed | 1000 |
| LeRobot version | 0.6.2 |

El dataset utilizado es `seriintan/frazier_dataset_20260901_151518`, con 100 episodios y 52.442 frames a 30 FPS, todos dedicados a la tarea "Pick and place Frazier to blue basket". No se menciona ningun ajuste posterior del tipo RLHF, DPO ni tecnicas similares.

## Capacidades

- Control robotico de manipulacion mediante aprendizaje por imitacion.
- Entrada multimodal que combina estado del robot (6 dimensiones) e imagenes de dos camaras: frontal y pinza.
- Salida de acciones de 6 dimensiones, apta para el control de un robot `so_follower`.
- Entrenado sobre un dataset especifico de 100 episodios y 52.442 frames, lo que permite replicar la tarea de pick and place.
- Integracion nativa con el ecosistema LeRobot, tanto para entrenamiento como para ejecucion en robot mediante `lerobot-rollout`.
- No es un modelo de lenguaje, no soporta generacion de texto, tool calling ni razonamiento multilingue.

## Casos de uso

- Automatizacion de pick and place en entornos de produccion: la politica puede controlar un robot `so_follower` para coger el objeto "Frazier" y depositarlo en una cesta azul. Es adecuada para tareas repetitivas en un entorno controlado con posiciones de camara fijas.

- Investigacion en aprendizaje por imitacion: el repositorio incluye un dataset completo de 100 episodios y una configuracion de entrenamiento documentada. Sirve como referencia para estudiar politicas ACT con LeRobot y comparar variaciones de hiperparametros.

- Prototipado de manipulacion con camaras de bajo coste: las entradas de vision son imagenes de 480x640, que pueden obtenerse con camaras consumer. Esto facilita montar un sistema de pruebas en laboratorios o aulas con hardware asequible.

- Reentrenamiento y transferencia: con `lerobot-train` se puede reutilizar el dataset original o ampliarlo con nuevos episodios para adaptar la tarea, por ejemplo cambiando la posicion de la cesta o el objeto. El pipeline esta pensado para iterar sobre politicas de forma rapida.

- Integracion en sistemas de control de brazos roboticos: la salida de acciones de 6 dimensiones puede conectarse al controlador de un robot compatible con LeRobot para ejecutar movimientos continuos en bucle cerrado. El comando `lerobot-rollout` permite lanzar la politica directamente sobre el robot.

- Educacion en robotica y demostraciones: la model card incluye un ejemplo de ejecucion paso a paso, con instrucciones para instalar LeRobot, configurar las camaras y lanzar la politica. Resulta util como material docente para introducir el aprendizaje por imitacion y el despliegue de politicas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica textualmente:

"No evaluation results have been provided for this policy yet."

Por tanto, no existe evidencia publica de tasa de exito, numero de ensayos ni comparativa con otras politicas en la tarea de pick and place.

## Requisitos de hardware

- VRAM estimada: no disponible. No se han publicado requisitos oficiales de memoria para inferencia con este modelo.
- GPU recomendada: no disponible. El modelo tiene 55.863.046 parametros, con un tamano en disco de 0.2 GB, lo que sugiere que puede ejecutarse en GPUs de consumo, pero no hay datos oficiales que lo confirmen.
- Composicion de los pesos: safetensors, en precision FP32 presumiblemente. El calculo teorico de memoria para los parametros seria de aproximadamente 223 MB, sin contar el coste de las imagenes de entrada ni la memoria intermedia del modelo.
- Se despliega mediante LeRobot, usando los comandos `lerobot-rollout` y `lerobot-train`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. Por tanto, la comparativa no esta disponible.

El ecosistema LeRobot contiene otras politicas ACT similares, pero no se aportan metricas ni enlaces a modelos equivalentes que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no incluye ningun resultado de evaluacion en robot. La tasa de exito real de la tarea es desconocida.
- El modelo esta entrenado para una unica tarea especifica: "Pick and place Frazier to blue basket". No se garantiza generalizacion a otros objetos, posiciones, iluminacion ni robots.
- Las camaras declaradas son `front` y `gripper`. Cambiar el angulo, la resolucion o la ubicacion de las camaras puede degradar gravemente el rendimiento.
- El robot de referencia es `so_follower`. La portabilidad a otros brazos roboticos no esta validada.
- No se mencionan sesgos del dataset ni evaluacion de robustez frente a distractores, cambios de iluminacion o variaciones en el entorno.
- La alucinacion en el sentido linguistico no aplica, pero la politica puede emitir acciones incorrectas o imprevistas en condiciones no vistas. Cualquier despliegue en produccion debe incluir mecanismos de supervision y parada de emergencia.
- La licencia Apache-2.0 es permisiva y permite uso comercial, pero no exime de responsabilidad sobre la seguridad del sistema robotico ni de las decisiones de diseno del operador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/act_frazier_kyc
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor en Hugging Face: https://huggingface.co/seriintan
- Dataset adicional `frazier_sim_v2`: https://huggingface.co/datasets/seriintan/frazier_sim_v2
