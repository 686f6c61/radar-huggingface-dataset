# seriintan/act_frazier

## Resumen

El modelo `seriintan/act_frazier` es una política de control robótico (policy) entrenada con el framework LeRobot de Hugging Face. Desarrollada por el usuario `seriintan`, esta política aborda la tarea concreta de "Pick and place Frazier to blue basket" (recoger y colocar un objeto Frazier en una cesta azul). Se trata de un modelo de aprendizaje por imitación que, a partir de observaciones del estado del robot y de imágenes de dos cámaras (frontal y de pinza), genera acciones de control de 6 dimensiones para un robot de tipo `so_follower`.

La arquitectura corresponde a `act_kyc`, que en LeRobot se basa en ACT (Action Chunking with Transformers), un enfoque que predice secuencias de acciones en lugar de pasos individuales, lo que reduce la acumulación de errores durante el despliegue. El modelo tiene 55.863.046 parámetros y un tamaño de repositorio de 0.2 GB. Está entrenado en un dataset con 100 episodios y 52.442 fotogramas a 30 FPS. Su relevancia radica en ser un ejemplo práctico de política de manipulación robótica de código abierto bajo licencia Apache 2.0, con un enfoque sencillo y aplicable en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 55.863.046 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de control robotico) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La politica esta implementada como `act_kyc` dentro de LeRobot, lo que corresponde a una arquitectura ACT (Action Chunking with Transformers). ACT es un modelo de aprendizaje por imitacion que condiciona la prediccion de secuencias de acciones a las observaciones actuales del estado del robot y a imagenes de camara. En esta configuracion concreta, las entradas son el estado del robot (6 dimensiones) y dos imagenes RGB de 480x640 provenientes de las camaras `front` y `gripper`. La salida es un vector de accion de 6 dimensiones.

El entrenamiento se realizo con el dataset `seriintan/frazier_dataset_20260901_151518`, que contiene 100 episodios y 52.442 fotogramas a 30 FPS, todos orientados a la tarea "Pick and place Frazier to blue basket". La configuracion de entrenamiento fue la siguiente:

| Parametro | Valor |
|---|---|
| Training steps | 50000 |
| Batch size | 16 |
| Optimizer | adamw |
| Learning rate | 1e-05 |
| Seed | 1000 |
| LeRobot version | 0.6.2 |

No se indica el uso de tecnicas de refinamiento como RLHF o DPO, ya que el modelo no es un modelo de lenguaje, sino una politica de control. La innovacion tecnica principal es el action chunking, que permite predecir multiples pasos de accion a la vez, lo que favorece la estabilidad del control en tareas de manipulacion.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 dimensiones para ejecutar tareas de pick and place.
- Entrada multimodal: procesa el estado del robot y dos camaras RGB simultaneamente.
- Especializado en la tarea "Pick and place Frazier to blue basket".
- Compatible con el ecosistema LeRobot: puede cargarse para rollout con `lerobot-rollout` y reutilizarse como punto de partida para fine-tuning.
- No genera texto, no soporta tool calling, no es un modelo de lenguaje ni de vision general.
- No ofrece capacidades multilingues, de agentes ni de razonamiento de alto nivel.

## Casos de uso

- Automatizacion de pick and place en lineas de produccion: la politica puede controlar un robot brazo tipo `so_follower` para recoger objetos de un punto fijo y colocarlos en un contenedor azul, utilizando las camaras y el estado del robot como entradas en tiempo real.
- Investigacion en manipulacion robotica: sirve como base para experimentos comparativos entre arquitecturas de aprendizaje por imitacion, permitiendo medir la diferencia entre ACT y otras politicas como DiT.
- Robotica educativa y laboratorios: dado su tamano reducido y su licencia permisiva, es adecuado para demostrar el flujo completo de LeRobot, desde la carga de un dataset hasta el despliegue de una politica.
- Transferencia de aprendizaje: el checkpoint pretrenado puede servir como inicializacion para adaptar la politica a tareas similares con menos datos, mediante fine-tuning en nuevos datasets.
- Entornos simulados: puede probarse en simuladores como Mujoco o Isaac para validar robustez ante variaciones de iluminacion o posicion del objeto, sin necesidad de robot fisico.
- Logistica interna en almacenes pequenos: automatizacion de la clasificacion de objetos en contenedores, siempre que la tarea y el entorno coincidan con las condiciones de entrenamiento.
- Demostraciones de control por imitacion en ferias o eventos cientificos: al ser un modelo ligero y con una unica tarea definida, facilita demostraciones sencillas de robotica manipulativa en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos sobre tasa de exito, latencia ni throughput en robot real.

## Requisitos de hardware

- Tamano de los pesos: 0.2 GB en disco, lo que implica un modelo ligero en terminos de almacenamiento.
- VRAM estimada para inferencia: no especificada por el autor; al procesar dos imagenes de 480x640, se requiere una GPU NVIDIA con suficiente memoria para el batch de inferencia. Una tarjeta de consumo como la RTX 3060 de 12 GB es mas que suficiente para este modelo, pero no hay datos oficiales.
- GPU recomendadas: no disponible; el ecosistema LeRobot suele emplear GPUs NVIDIA con CUDA para entrenamiento e inferencia.
- Opciones de despliegue: LeRobot (Python/PyTorch) mediante comandos como `lerobot-rollout` y `lerobot-train`. No es compatible con vLLM, llama.cpp ni Ollama por tratarse de un modelo de control robotico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seriintan/act_frazier | ACT | 55.863.046 | No aplica | Apache 2.0 | HuggingFace |
| seriintan/multi_task_dit_frazier | DiT (Diffusion Transformer) | No disponible | No aplica | No disponible | HuggingFace |
| Otras politicas ACT de LeRobot | ACT | Variable (tipicamente decenas de millones) | No aplica | Variable | HuggingFace |

El modelo se compara principalmente con otras politicas de manipulacion entrenadas con LeRobot. La diferencia clave frente a `seriintan/multi_task_dit_frazier` es la arquitectura: ACT frente a un Transformer basado en difusion, y la especializacion en una unica tarea frente a un planteamiento multitarea. No se dispone de benchmarks comparativos publicados entre ambos.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados, por lo que no se puede confirmar un rendimiento fiable en robot real.
- El modelo esta entrenado exclusivamente en 100 episodios y una unica tarea ("Pick and place Frazier to blue basket"), lo que limita su generalizacion a otros objetos, posiciones o entornos.
- Requiere la configuracion de hardware especifica del robot `so_follower` y las camaras `front` y `gripper`; cualquier cambio en el robot o en la calibracion de las camaras puede degradar el rendimiento.
- No incluye razonamiento de alto nivel ni planificacion; es una politica reactiva que depende de las observaciones actuales.
- Existe riesgo de sobreajuste al entorno y al objeto de entrenamiento, especialmente al contar con un dataset reducido.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de evaluacion formal implica asumir el riesgo de rendimiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seriintan/act_frazier
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_20260901_151518
- Perfil del autor: https://huggingface.co/seriintan
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Configuracion de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de entrenamiento por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout (inferencia): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/frazier_dataset_20260901_151518
- Otro modelo del autor: https://huggingface.co/seriintan/multi_task_dit_frazier
