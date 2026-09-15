# ohmyhong/robot_dataset

## Resumen

`ohmyhong/robot_dataset` es una política de robótica entrenada con LeRobot, no un modelo de lenguaje. Implementa el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, y que se entrena a partir de datos de teleoperación. El repositorio, publicado por el usuario ohmyhong, contiene los pesos de una política destinada a un brazo robótico `so_follower` (familia SO-ARM101) con una única cámara frontal, y ocupa 0,2 GB con 51.668.614 parámetros almacenados en safetensors.

El modelo resuelve una tarea concreta de manipulación: dado el estado articular del robot (vector de 6 dimensiones) y una imagen RGB de 3x480x640 tomada por la cámara frontal a 30 FPS, produce un vector de acción de 6 dimensiones. Se entrenó sobre un dataset propio de 20 episodios y 8614 fotogramas capturados en teleoperación, con 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate 1e-5, usando LeRobot 0.6.1.

Su relevancia es acotada pero clara: es un ejemplo reproducible y de licencia Apache-2.0 de un flujo completo de aprendizaje por imitación en robótica de bajo coste, útil para quien quiera replicar el pipeline de LeRobot, inspeccionar un checkpoint ACT real o servir de punto de partida para reentrenar con datos propios. No se han publicado resultados de evaluación en el repositorio (0 descargas y 0 likes en el momento de la consulta), por lo que su rendimiento real en robot no está verificado de forma pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE para aprendizaje por imitacion (metodo ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de imitacion con ventana de observacion fija; el valor de chunk no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision original; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje; consume estado articular e imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo alojado con la libreria lerobot) |
| Tipo de robot | so_follower (brazo SO-ARM101) |
| Camaras | 1 camara frontal (`front`) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, arXiv 2304.13705) es un metodo de aprendizaje por imitacion que combina un transformer con un autoencoder variacional condicional (CVAE). En lugar de predecir una sola accion por paso, la politica genera un bloque o chunk de acciones futuras, lo que reduce el error de acumulacion y mitiga el problema de las paradas o el comportamiento errante tipico de las politicas que actuan paso a paso. Segun el paper del metodo, la formulacion CVAE permite modelar la multimodalidad de las demostraciones humanas, y en inferencia suele combinarse con ensamblado temporal (temporal ensembling) para suavizar la ejecucion. La model card de esta politica no detalla el tamano del chunk, el numero de capas ni la dimension del modelo, por lo que esos hiperparametros concretos no estan disponibles.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `ohmyhong/robot_dataset`: 20 episodios, 8614 fotogramas a 30 FPS, tarea etiquetada como "20260915-lerobot-soarm101-teleop". La configuracion declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Los datos provienen de teleoperacion real con un brazo SO-ARM101 y una sola camara frontal, por lo que la politica esta especializada en esa configuracion de hardware, esa iluminacion y esa disposicion de objetos. No se menciona uso de RLHF ni de DPO, algo esperable en un modelo de robotica: el paradigma es puramente de imitacion supervisada.

## Capacidades

- Generacion de acciones de manipulacion: dado un estado articular de 6 grados de libertad y una imagen RGB de 480x640, predice un vector de accion de 6 dimensiones para el brazo `so_follower`.
- Ejecucion por chunks: al predecir secuencias cortas de acciones en lugar de pasos aislados, permite movimientos mas coherentes y menos entrecortados que una politica reactiva simple.
- Control visuomotor de una sola vista: integra una unica camara frontal, suficiente para tareas de pick and place sencillas en un espacio de trabajo acotado.
- Aprendizaje por imitacion reproducible: puede reentrenarse con el mismo pipeline (`lerobot-train --policy.type=act`) sobre un dataset propio.
- Despliegue mediante CLI: soporta ejecucion directa en robot con `lerobot-rollout --strategy.type=base`.
- Reproduccion de una unica tarea: la politica esta asociada a la tarea "20260915-lerobot-soarm101-teleop"; no es un modelo generalista ni multitarea.
- Sin capacidades de lenguaje, vision general, codigo, tool calling, agentes ni razonamiento multi-paso: son funciones fuera del alcance de este tipo de modelo.

## Casos de uso

- Replicacion del pipeline de LeRobot: sirve como checkpoint de referencia para validar una instalacion de LeRobot 0.6.1 de principio a fin, desde la calibracion del SO-ARM101 y las camaras hasta el rollout con `lerobot-rollout`.
- Reentrenamiento con datos propios: partiendo de esta configuracion (`policy.type=act`, AdamW, lr 1e-5, batch 8) se puede ajustar la politica a una tarea distinta grabando nuevos episodios de teleoperacion.
- Docencia y formacion en robotica: 20 episodios y 8614 fotogramas constituyen un ejemplo manejable para explicar en clase el ciclo completo de recogida de datos, entrenamiento y evaluacion de una politica visuomotora.
- Investigacion en aprendizaje por imitacion: permite experimentar con variaciones de chunk size, ensamblado temporal o aumento de datos comparando contra este checkpoint base.
- Pruebas de integracion de hardware de bajo coste: util para verificar que un brazo de la familia SO-ARM101, su puerto serie y su camara funcionan correctamente antes de invertir tiempo en un entrenamiento largo.
- Punto de partida para comparativas de metodos: al ser un ACT entrenado con LeRobot, resulta un baseline natural frente a otras politicas del mismo framework (por ejemplo Diffusion Policy) evaluadas en el mismo banco de tareas.
- Tareas de pick and place simples en espacio acotado: si el entrenamiento se ha realizado sobre una tarea de manipulacion concreta, puede emplearse para automatizar esa operacion en un entorno controlado y con objetos en posiciones similares a las de las demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la linea explicita "_No evaluation results have been provided for this policy yet_", por lo que no hay tasas de exito por tarea, numero de ensayos ni condiciones de evaluacion. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: los 51,67 millones de parametros ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16/BF16. Sumando el codificador visual y las activaciones de una imagen de 3x480x640, la inferencia deberia caber holgadamente por debajo de 1 GB de VRAM; esta cifra es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; el entrenamiento se realizo en `--policy.device=cuda`. Para inferencia, una GTX 1060 o superior es mas que suficiente; GPU de datacenter como A100 o H100 no aportan ventaja relevante para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU o en dispositivos tipo Raspberry Pi, dado que el modelo ronda las decenas de millones de parametros.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` y `lerobot-train`; el backend es PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una politica de robotica.
- Latencia y throughput: no disponibles. El unico dato temporal conocido es la frecuencia de captura del dataset, 30 FPS, 8614 fotogramas en 20 episodios, lo que da una media de unos 431 fotogramas por episodio (aproximadamente 14 segundos por episodio).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohmyhong/robot_dataset (ACT) | Politica de imitacion ACT, LeRobot | 51.668.614 | no disponible (chunk no especificado) | Apache-2.0 | HuggingFace, 0 descargas |
| ACT original (paper 2304.13705) | Politica de imitacion ACT | no disponible | no disponible | no disponible en la informacion | Publicacion cientifica |
| Diffusion Policy | Politica de imitacion basada en difusion | no disponible | no disponible | no disponible | Disponible como tipo de politica en LeRobot |
| Otras politicas LeRobot (por ejemplo `lerobot/act_aloha_sim_transfer_cube_human`) | ACT sobre datasets de referencia | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento (tasas de exito, latencia) para este checkpoint ni para las alternativas citadas dentro de la informacion proporcionada, por lo que la comparacion se limita a tipo de metodo, licencia y via de distribucion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay ninguna tasa de exito publicada, ni numero de ensayos, ni condiciones de prueba. No se puede afirmar que la politica funcione correctamente en robot real.
- Dataset muy pequeno: 20 episodios y 8614 fotogramas es un volumen reducido, lo que limita la generalizacion y hace probable un sobreajuste al entorno, la iluminacion y las posiciones de objeto de la grabacion.
- Especializacion estrecha: esta atada a una tarea ("20260915-lerobot-soarm101-teleop"), a un tipo de robot (`so_follower`), a una unica camara frontal y a una resolucion concreta de 480x640. Cambiar cualquiera de estas condiciones invalida la politica.
- Sensibilidad al hardware: los nombres de las camaras deben coincidir exactamente con las claves de observacion usadas en el entrenamiento; montar la camara en otra posicion o con otro campo de vision degrada el comportamiento.
- Riesgo de comportamiento inseguro: una politica de imitacion puede generar acciones fuera de rango ante observaciones fuera de distribucion. Es imprescindible limitar velocidades, definir paradas de emergencia y supervisar la ejecucion.
- Sin capacidades de lenguaje ni de razonamiento: no admite instrucciones en lenguaje natural, no soporta tool calling ni planificacion multi-paso.
- Nombre del repositorio confuso: el identificador `ohmyhong/robot_dataset` sugiere un dataset, pero contiene una politica; el dataset asociado se aloja en el mismo identificador bajo el espacio de datasets. Es facil equivocarse al referenciarlo.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia cubre el artefacto publicado, no los datos de teleoperacion subyacentes ni posibles derechos de terceros sobre el hardware.
- Repositorio sin traccion: 0 descargas y 0 likes, lo que implica que no ha pasado por revision de la comunidad ni por validacion independiente.
- Resultados de busqueda web no relevantes: las busquedas devolvieron unicamente paginas de videojuegos sin relacion con el modelo, por lo que no hay informacion externa adicional que corrobore o matice la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ohmyhong/robot_dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/ohmyhong/robot_dataset
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ohmyhong/robot_dataset
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
