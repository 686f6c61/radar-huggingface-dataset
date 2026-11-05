# Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged

## Resumen

X-VLA es un framework de Vision-Language-Action (VLA) basado en flow matching y soft prompts, desarrollado en el ecosistema LeRobot de Hugging Face. La idea central es tratar cada configuracion de robot o hardware como una "tarea" codificada mediante un pequeno conjunto de embeddings de Soft Prompt aprendibles, de modo que un unico modelo puede reconciliar morfologias, sensores y espacios de accion diversos. Este repositorio concreto es un fine-tuning del checkpoint base `lerobot/xvla-base` sobre un dataset propio de 150 episodios.

El modelo resultante es una politica de imitacion para un robot UR5e con pinza Schunk, entrenada para una unica tarea: coger un bloque naranja y depositarlo en una caja azul. Consume dos flujos visuales principales a 256x256, dos flujos auxiliares a 224x224 y un vector de estado de 8 dimensiones, y produce una accion de 7 dimensiones. Con 879.687.256 parametros y pesos en safetensors, es un modelo de escala media pensado para inferencia en tiempo real sobre hardware robotico.

Su relevancia es practica: demuestra el flujo completo de LeRobot para llevar un VLA preentrenado a una celula robotica concreta mediante fine-tuning supervisado, con un repositorio de 1,8 GB y licencia Apache 2.0. No obstante, al ser un fine-tuning de una sola tarea y sin resultados de evaluacion publicados, su utilidad queda acotada al escenario exacto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robotico, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con decodificacion por flow matching: en lugar de predecir acciones de forma autoregresiva o con regresion directa, modela la distribucion de acciones mediante un campo de flujo condicionado por las observaciones visuales y el estado. La innovacion principal son los Soft Prompts: cada configuracion de robot o hardware se representa como un conjunto reducido de embeddings aprendibles que se inyectan en el modelo, permitiendo que un mismo backbone atienda morfologias y espacios de accion heterogeneos sin duplicar parametros. El repositorio parte del checkpoint preentrenado `lerobot/xvla-base` y se especializa por fine-tuning.

El entrenamiento se realizo sobre el dataset `Dataset_UR5e_Schunk_Gripper_150_episodes_merged`, con 150 episodios, 44.494 frames a 15 FPS y una unica instruccion de tarea ("Grip the orange block and drop them into the blue box"). La configuracion reportada es de 20.000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. No se documenta el numero de tokens de preentrenamiento del modelo base, la composicion del dataset original ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas de 7 dimensiones (probablemente 6 DOF mas pinza) condicionadas por vision y estado.
- Percepcion visual multi-camara: dos vistas principales a 256x256 y dos vistas auxiliares a 224x224.
- Fusion de estado propioceptivo de 8 dimensiones con las observaciones visuales.
- Ejecucion de una tarea de manipulacion pick-and-place: coger un bloque naranja y depositarlo en una caja azul.
- Adaptacion a morfologias mediante Soft Prompts (capacidad heredada del framework X-VLA, no verificada en este checkpoint).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es una politica de control motor, no un modelo de lenguaje conversacional.
- Capacidades multilingues no aplicables.

## Casos de uso

- Pick-and-place industrial de una sola pieza: el modelo ejecuta la secuencia de coger un objeto y depositarlo en un contenedor, adecuado para demostraciones de celula robotica con UR5e y pinza Schunk.
- Prototipado rapido de politicas de imitacion: sirve como referencia para validar el pipeline `lerobot-train` y `lerobot-rollout` antes de invertir en datasets mayores.
- Benchmark interno de VLA: al ser un fine-tuning reproducible (semilla y configuracion documentadas), permite comparar variantes de datos o hiperparametros sobre la misma tarea.
- Investigacion en adaptacion de morfologias: el uso de Soft Prompts permite estudiar como un backbone unico se especializa en un robot concreto con pocos episodios.
- Docencia y formacion en robotica: el repositorio incluye comandos de ejecucion y entrenamiento listos para usar, util para cursos de aprendizaje por imitacion.
- Base para fine-tuning con datos propios: al estar liberado en Apache 2.0 y con safetensors, se puede reentrenar sobre nuevos datasets de manipulacion sin restricciones de licencia.
- Automatizacion de tareas de clasificacion simple en linea de produccion, siempre que el entorno coincida con las condiciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,5 GB solo para pesos (879,7 M parametros), mas overhead de activaciones y buffers visuales; en fp16/bf16 se reduce a unos 1,8 GB de pesos.
- GPU recomendadas: RTX 4090, A100 o H100 para entrenamiento; para inferencia es suficiente una GPU consumer de gama media-alta.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, dado el tamano de pesos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a politicas roboticas.
- Latencia y throughput: no disponibles; dependen del robot, las camaras y la frecuencia de control (dataset a 15 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA (este fine-tuning) | 879,7 M | no disponible | Pick-and-place UR5e + Schunk | Apache 2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no disponible | VLA generalista multi-robot | Apache 2.0 | Hugging Face |
| Otros VLA de LeRobot (p. ej. pi0, ACT) | no disponible en la informacion | no disponible | Politicas de imitacion | variable | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; no se han publicado metricas de exito ni comparaciones directas.

## Limitaciones y advertencias

- Entrenado para una unica tarea y un unico entorno: "Grip the orange block and drop them into the blue box"; no generaliza a otros objetos, posiciones o instrucciones sin reentrenamiento.
- Sin resultados de evaluacion publicados: no hay tasa de exito medida en robot real, por lo que el rendimiento en produccion es desconocido.
- Dependencia estricta de la configuracion de camaras: los nombres e indices de camara deben coincidir con las claves de observacion del entrenamiento (`observation.images.image`, `image2`, `image3`, `empty_camera_0`).
- Dataset pequeno (150 episodios, 44.494 frames): riesgo alto de sobreajuste y baja robustez ante cambios de iluminacion, distractores o posiciones iniciales.
- No es un modelo de lenguaje: no admite prompts textuales arbitrarios, tool calling ni razonamiento; la unica entrada semantica es la instruccion de tarea fija.
- Sesgos conocidos: no documentados; en robótica, los sesgos provienen del dataset (posiciones, colores, condiciones de laboratorio).
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar seguridad en un robot real recae en el integrador.
- El repositorio mezcla dataset y politica bajo el mismo identificador, lo que puede generar confusion en el pipeline de descarga y despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged
- Guia LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged
