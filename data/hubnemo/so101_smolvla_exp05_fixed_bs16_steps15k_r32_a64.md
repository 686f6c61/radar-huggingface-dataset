# hubnemo/so101_smolvla_exp05_fixed_bs16_steps15k_r32_a64

## Resumen

`hubnemo/so101_smolvla_exp05_fixed_bs16_steps15k_r32_a64` es un adaptador de política viso-lenguaje-acción (VLA) para robótica, obtenido mediante ajuste fino del modelo base `lerobot/smolvla_base` con la librería LeRobot. Lo desarrolla el usuario `hubnemo` y está especializado en una única tarea de manipulación sobre el robot `so101_follower`: coger un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos. El modelo es un adaptador (relación `adapter` respecto al base) publicado en formato safetensors bajo licencia Apache 2.0.

SmolVLA, la arquitectura subyacente, es un modelo VLA compacto y eficiente que combina percepción visual, instrucciones en lenguaje natural y generación de acciones motrices, y está diseñado para ejecutarse en hardware de consumo. Este checkpoint concreto no aporta innovaciones de arquitectura: es un ajuste fino con hiperparámetros documentados (15 000 pasos, batch de 16, learning rate 1e-4, semilla 1000) sobre un dataset de 77 episodios y 54 777 fotogramas a 30 FPS.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline de imitación extremo a extremo con LeRobot sobre un robot de bajo coste, y como punto de partida para quien quiera replicar o comparar ajustes finos de SmolVLA en tareas de pick-and-place. No es un modelo de propósito general ni un modelo de lenguaje: no genera texto libre ni razona en lenguaje natural, sino que mapea observaciones (estado articular de 6 dimensiones e imagen frontal de 480x640) a acciones de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), ajuste fino tipo adaptador sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so101_follower` |
| Camaras | `front` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.front` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `Orellius/so101_sort_cubes_no_top` (77 episodios, 54 777 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 15 000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un VLA compacto descrito en el paper arXiv:2506.01844. La arquitectura combina un codificador visual, un codificador de lenguaje para la instrucción de tarea y un decodificador de acciones que produce vectores de 6 dimensiones a partir del estado articular y de la imagen frontal. La model card no detalla la composición interna (número de capas, dimensión oculta, número de parámetros del backbone) ni el número total de tokens vistos durante el preentrenamiento del modelo base.

El entrenamiento de este checkpoint es de imitación supervisada sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54 777 fotogramas capturados a 30 FPS con una única cámara frontal. La tarea es "Grab the purple cube and put it into the cardboard box, ignore the other objects". Se ejecutaron 15 000 pasos con batch de 16, AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.7.1. El nombre del repositorio sugiere configuración LoRA con r=32 y alpha=64, aunque la model card no documenta explícitamente esos hiperparámetros ni confirma la técnica de adaptación de bajo rango. No se indica el uso de RLHF, DPO ni de refuerzo; es puramente aprendizaje por imitación.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para el robot `so101_follower` a partir de una observación de estado y una imagen frontal.
- Ejecución de una única tarea de manipulación condicionada por instrucción en lenguaje natural: coger el cubo morado e introducirlo en la caja de cartón.
- Percepción visual básica a resolución 480x640 mediante la cámara `front`.
- Condicionamiento por prompt de tarea: el texto de la instrucción se pasa en tiempo de inferencia con `--task`.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, ni capacidades de audio o visión general más allá de la observación de la cámara del robot.
- Capacidades multilingües: no documentadas; la instrucción de tarea se proporciona en inglés.

## Casos de uso

- Replicación de experimentos de imitación: sirve como checkpoint de referencia para comparar configuraciones de ajuste fino de SmolVLA (pasos, batch, learning rate) sobre el mismo dataset y robot.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger el cubo morado y depositarlo en la caja, adecuado para pruebas controladas de manipulación con el SO-101.
- Docencia y prototipado en robótica de bajo coste: al estar pensado para hardware de consumo y publicarse en Apache 2.0, permite montar un pipeline completo de captura, entrenamiento y despliegue sin infraestructura dedicada.
- Base para ajuste fino en tareas derivadas: al ser un adaptador sobre `lerobot/smolvla_base`, se puede reentrenar con nuevos datasets de manipulación manteniendo el mismo formato de observaciones y acciones.
- Validación de pipelines de datos: el dataset asociado (77 episodios, 54 777 fotogramas) y la configuración documentada permiten auditar la calidad de la captura y el efecto de los hiperparámetros en el resultado.
- Pruebas de despliegue con `lerobot-rollout`: útil para verificar la integración de cámaras OpenCV, puertos serie y calibración del `so101_follower` antes de pasar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. SmolVLA se describe como desplegable en hardware de consumo, pero no se publican cifras de memoria para este checkpoint.
- GPU recomendadas: no disponible de forma específica; el modelo base está pensado para hardware de consumo.
- Compatibilidad con GPU de consumo: probable según la descripción de SmolVLA, pero no confirmada con mediciones para este adaptador.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robótica.
- Latencia y throughput: no disponibles. La captura se realiza a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable.
- Requisitos adicionales: puerto serie del robot `so101_follower` y al menos una cámara OpenCV a 640x480 y 30 FPS.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Dataset | Pasos | Licencia | Evaluacion |
|---|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_exp05_fixed_bs16_steps15k_r32_a64` | `lerobot/smolvla_base` | Cubo morado a caja | `Orellius/so101_sort_cubes_no_top` (77 ep.) | 15 000 | Apache 2.0 | No publicada |
| `hubnemo/so101_smolvla_exp10_bs16_steps20k_r32_warmup_ema-ema` | `lerobot/smolvla_base` | No disponible en la informacion | No disponible | 20 000 | No disponible en la informacion | No disponible |
| `Askel1419/smolvla_so101_100EP` | `lerobot/smolvla_base` | No disponible en la informacion | 100 episodios (segun nombre) | No disponible | No disponible en la informacion | No disponible |

Los tres checkpoints comparten la misma arquitectura base y el mismo robot objetivo, por lo que la comparación relevante es de configuración de entrenamiento y dataset, no de capacidades. No hay datos de rendimiento que permitan ordenarlos por calidad.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única instrucción y un único entorno; no generaliza a otras tareas, objetos o disposiciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad práctica.
- Dependencia del prompt exacto: la instrucción de tarea debe coincidir con la usada en entrenamiento ("Grab the purple cube and put it into the cardboard box, ignore the other objects") para un comportamiento esperado.
- Dependencia de la cámara y del robot: las claves de observación deben coincidir (`observation.images.front`, `observation.state`) y el robot debe ser `so101_follower` calibrado.
- Dataset pequeño: 77 episodios y 54 777 fotogramas son una base limitada; es probable que el modelo sea sensible a cambios de iluminación, posición de objetos y distractores.
- Riesgo de sobreajuste al entorno de captura: no se documentan variaciones de posiciones, iluminación ni presencia de objetos adicionales durante el entrenamiento.
- Idiomas: no se documenta soporte multilingüe; la instrucción se proporciona en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Nombre del repositorio con posible configuración LoRA (r=32, alpha=64) no confirmada en la model card; conviene verificar los ficheros antes de asumir la técnica de adaptación.
- Tamaño del repo reportado como 0.0 GB: puede indicar que los pesos no están completamente subidos o que el cálculo de metadatos no se ha actualizado; verificar la disponibilidad real de los ficheros antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp05_fixed_bs16_steps15k_r32_a64
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint comparable del mismo autor: https://huggingface.co/hubnemo/so101_smolvla_exp10_bs16_steps20k_r32_warmup_ema-ema
- Checkpoint comparable de otro autor: https://huggingface.co/Askel1419/smolvla_so101_100EP
