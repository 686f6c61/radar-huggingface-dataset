# mysterium99/smolvla_stage2b_newtasks_to_fs

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Esta ficha concreta, `mysterium99/smolvla_stage2b_newtasks_to_fs`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `fs`, orientado a una única tarea de manipulación robótica: "Pick up the bolt and put it in the bucket". El modelo consume el estado del robot (vector de 6 dimensiones) y tres cámaras RGB de 256x256, y produce un vector de acción de 6 dimensiones.

El problema que resuelve es el de la política de imitación para robots de bajo coste: SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y aficionados que no disponen de clústeres de GPU. Con 450 millones de parámetros y un repositorio de 0,9 GB en formato safetensors, el modelo es ligero tanto en almacenamiento como en requisitos de inferencia.

Este checkpoint es un ejemplo de fine-tuning de etapa 2b sobre tareas nuevas, entrenado con LeRobot 0.6.1 durante 20.000 pasos con batch size 8. Su relevancia es limitada fuera de su tarea concreta: es una política especializada, no un modelo generalista, y no se han publicado resultados de evaluación. Resulta útil como referencia de flujo de trabajo (grabación de datos, entrenamiento y despliegue con LeRobot) más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | follower |
| Cámaras | gripper, newtop, newside |
| Entrada de estado | observation.state, shape (6,) |
| Entradas visuales | 3 cámaras, shape (3, 256, 256) cada una |
| Salida de acción | action, shape (6,) |
| Tamaño del repositorio | 0,9 GB |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos motores a partir de observaciones multimodales. La arquitectura exacta (número de capas, dimensión oculta, mecanismo de atención) no se detalla en la información proporcionada; el paper de referencia es arXiv:2506.01844. El modelo consume tres cámaras RGB a 256x256 y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones, lo que corresponde típicamente a un brazo robótico de 6 grados de libertad con pinza.

El entrenamiento se realizó por fine-tuning desde `lerobot/smolvla_base` sobre el dataset `fs`, que contiene 26 episodios y 38.356 frames a 30 FPS de la tarea "Pick up the bolt and put it in the bucket". La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 0 y LeRobot 0.6.1. No se especifica si hubo RLHF, DPO ni el número de tokens de entrenamiento del modelo base. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Generación de acciones motoras para un robot follower de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción visual multimodal mediante tres cámaras simultáneas (gripper, newtop, newside) a resolución 256x256.
- Ejecución de una tarea concreta de manipulación: recoger un perno y depositarlo en un cubo.
- Integración con el ecosistema LeRobot para rollout y entrenamiento mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling ni function calling: es una política de imitación, no un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingües no aplicables: no procesa ni genera texto libre.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la percepción visual para control motor.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta la secuencia de recoger un perno y depositarlo en un cubo, adecuado para prototipos de línea de montaje de bajo coste gracias a sus 450 M de parámetros y su despliegue en hardware de consumo.
- Investigación en imitación robótica: sirve como punto de partida para experimentar con fine-tuning de SmolVLA sobre nuevos datasets, ya que el flujo con LeRobot está documentado y el checkpoint es ligero (0,9 GB).
- Validación de pipelines de grabación de datos: el dataset `fs` (26 episodios, 38.356 frames a 30 FPS) y la configuración de entrenamiento publicada permiten reproducir el proceso completo de captura y entrenamiento.
- Docencia y formación: el modelo y su configuración permiten ilustrar el ciclo completo de un sistema VLA (percepción, estado, acción) en cursos de robótica con hardware asequible.
- Benchmarking de políticas compactas: útil para comparar el rendimiento de SmolVLA frente a otras políticas de imitación en la misma tarea y robot, aunque no se hayan publicado métricas de éxito.
- Despliegue en robots follower de bajo coste: al ejecutarse en GPU de consumo, puede integrarse en plataformas tipo SO-100/SO-101 u otras compatibles con LeRobot para tareas repetitivas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en fp32 el peso ronda 1,8 GB, y en fp16 aproximadamente 0,9 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: no especificadas en la información proporcionada. SmolVLA está diseñado para hardware de consumo según la model card.
- Compatibilidad con GPU de consumo: sí, según la descripción del modelo base ("can be deployed on consumer-grade hardware"), aunque no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2b_newtasks_to_fs | 450 M | no aplica | Pick-and-place (perno en cubo) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no aplica | VLA generalista base para fine-tuning | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | no aplica | Imitación robótica | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para la tarea "Pick up the bolt and put it in the bucket" y no generaliza a otras tareas sin fine-tuning.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que no puede recomendarse para producción sin validación propia.
- Dependencia del hardware: las cámaras y el robot deben coincidir con los nombres y la configuración de observación del entrenamiento (gripper, newtop, newside; estado de 6 dimensiones).
- Dataset muy reducido: 26 episodios y 38.356 frames, lo que limita la diversidad de posiciones, iluminación y distractores vistos durante el entrenamiento.
- Riesgo de sobreajuste al entorno de captura: cambios en la iluminación, la posición de los objetos o el robot pueden degradar el rendimiento.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural más allá de la tarea fijada en el entrenamiento.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas no aplicables: al no ser un modelo de texto, no hay soporte lingüístico que evaluar.
- Sin datos de sesgos: no se han documentado sesgos específicos, aunque al ser una política visual puede heredar sesgos de los datos de captura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2b_newtasks_to_fs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset fs: https://huggingface.co/datasets/fs
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fs
