# mysterium99/smolvla_stage2c_complexity_3_to_ds2

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Resuelve el problema de controlar robots manipuladores directamente a partir de observaciones visuales y del estado de las articulaciones, emitiendo acciones motoras de baja dimensionalidad. Su relevancia radica en que reduce el coste computacional frente a VLA de gran tamano, permitiendo entrenamiento y despliegue en hardware de consumo.

La ficha corresponde a un fine-tuning concreto del modelo base `lerobot/smolvla_base`, publicado por el usuario `mysterium99` bajo el identificador `smolvla_stage2c_complexity_3_to_ds2`. Se ha entrenado sobre el dataset `ds2` para la tarea de manipulacion "put nuts in red cup and bolts in blue bucket", con 50 episodios y 110.961 fotogramas a 30 FPS. El checkpoint tiene 450.046.176 parametros (aproximadamente 450 M) y un peso de repositorio de 0,9 GB en safetensors.

El modelo no es un LLM de proposito general: es una politica de imitacion para un robot de tipo `follow` con tres camaras (`gripper`, `newtop`, `newside`), que consume un vector de estado de 6 dimensiones y tres imagenes de 256x256, y produce un vector de accion de 6 dimensiones. Se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, segun el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural libre; recibe una instruccion de tarea fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina percepcion visual y una representacion del estado del robot para predecir acciones. El modelo base `lerobot/smolvla_base` se describe en el paper arXiv:2506.01844 como una alternativa compacta y eficiente a los VLA de mayor tamano, disenada para ejecutarse en hardware de consumo. La informacion proporcionada no detalla el numero de capas, el tipo de encoder visual ni el mecanismo de fusion entre modalidades.

Este checkpoint concreto se ha obtenido por fine-tuning del modelo base sobre el dataset `ds2`. La configuracion de entrenamiento registrada es: 20.000 pasos, batch size de 8, optimizador AdamW, learning rate 1e-4, semilla 0 y LeRobot 0.6.1. El dataset contiene 50 episodios y 110.961 fotogramas a 30 FPS para una unica tarea de manipulacion. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Control de robot manipulador de tipo `follow` mediante prediccion de acciones de 6 dimensiones a partir de observaciones.
- Percepcion visual multi-camara: tres flujos de imagen de 256x256 (`observation.images.camera1`, `camera2`, `camera3`, correspondientes a `gripper`, `newtop` y `newside`).
- Integracion del estado propioceptivo del robot mediante un vector `observation.state` de 6 dimensiones.
- Ejecucion de una tarea de manipulacion concreta especificada por instruccion textual: "put nuts in red cup and bolts in blue bucket".
- Despliegue en hardware de consumo segun la descripcion del modelo base.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision general, audio ni modo de pensamiento; el modelo es una politica robotica especializada, no un asistente conversacional.

## Casos de uso

- Manipulacion de laboratorio con robot de bajo coste: el modelo permite ejecutar una tarea de clasificacion de piezas (tuercas a un vaso rojo, tornillos a un cubo azul) en un robot `follow` con tres camaras, usando `lerobot-rollout` con `--strategy.type=base` y una duracion de ejecucion configurable.
- Prototipado rapido de politicas de imitacion: al estar fine-tuneado desde `lerobot/smolvla_base`, sirve como referencia de partida para comparar configuraciones de entrenamiento (pasos, batch, learning rate) en tareas de pick-and-place.
- Investigacion en VLA de bajo coste: con 450 M de parametros y 0,9 GB de pesos, permite iterar experimentos de vision-lenguaje-accion en una sola GPU de consumo sin infraestructura de clúster.
- Educacion y docencia en robotica: el flujo completo con LeRobot (grabacion de datos, entrenamiento con `lerobot-train`, evaluacion con `lerobot-rollout`) es reproducible con 50 episodios y 110.961 fotogramas, un volumen asequible para practicas.
- Benchmarking de generalizacion en manipulacion: al no incluir resultados de evaluacion, sirve como caso de estudio para medir tasas de exito en posiciones de objeto, iluminacion y distractores distintos a los del dataset.
- Base para fine-tuning sobre nuevos datasets: la receta `lerobot-train --policy.path=lerobot/smolvla_base` permite adaptar el modelo a otras tareas de manipulacion con menos de 200.000 fotogramas de datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica y deja la tabla de tasas de exito vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros y pesos en safetensors de 0,9 GB, la inferencia en precision nativa requiere del orden de 1-2 GB de VRAM, y menos con cuantizacion, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo base se describe como desplegable en hardware de consumo.
- Cabe en GPU de consumo: si, segun la descripcion del modelo base de SmolVLA; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La captura de datos se realiza a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage2c_complexity_3_to_ds2` | 450.046.176 | no disponible | Manipulacion robotica (tarea unica) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada | no disponible | VLA base para fine-tuning | no disponible en la informacion proporcionada | Hugging Face (modelo base citado) |
| Otros VLA de gran tamano | no disponible | no disponible | Manipulacion robotica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Especializacion extrema: entrenado para una unica tarea ("put nuts in red cup and bolts in blue bucket") y un unico tipo de robot (`follow`); no generaliza a otras tareas sin fine-tuning.
- Dependencia de la configuracion de camaras: las claves de observacion (`camera1`, `camera2`, `camera3`) y sus nombres deben coincidir exactamente con los usados en el entrenamiento; un montaje distinto invalida la politica.
- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que el rendimiento real en el robot es desconocido.
- Dataset pequeno: 50 episodios y 110.961 fotogramas son un volumen limitado; es probable un sobreajuste a posiciones, iluminacion y objetos del dataset, aunque no se documenta explicitamente.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si en forma de acciones incorrectas o inseguras ante estados no vistos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de idioma: la instruccion de tarea es fija y en ingles; no se documenta soporte multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica con 0 descargas y 0 likes, sin validacion de la comunidad.
- Advertencia de seguridad: es una politica de control fisico; debe probarse en entornos controlados antes de cualquier uso con personas o equipos de valor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_3_to_ds2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/ds2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds2
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
