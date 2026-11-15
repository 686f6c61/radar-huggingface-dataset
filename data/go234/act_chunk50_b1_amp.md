# go234/act_chunk50_b1_amp

## Resumen

`go234/act_chunk50_b1_amp` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de control robótico que consume observaciones multimodales (estado articular y dos cámaras) y produce acciones de 6 dimensiones para un robot manipulador de tipo `so_follower`. Lo desarrolla el usuario `go234` utilizando LeRobot 0.6.0, la librería de Hugging Face para aprendizaje automático en robótica real, y se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: "Pick up the cube and put it in the box" (coger el cubo y meterlo en la caja). Se entrenó sobre un dataset propio de 50 episodios y 24.423 fotogramas grabados a 30 FPS con teleoperación. Su relevancia es acotada pero instructiva: es un ejemplo real y reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento de ACT, publicación en el Hub y despliegue con `lerobot-rollout`), útil para quien quiera replicar o adaptar el flujo a su propio robot.

Arquitectónicamente es un transformer con codificador visual y decodificador de acciones que predice *chunks* de acciones (secuencias cortas) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso. El checkpoint tiene 51.617.414 parámetros (unos 51,6 M) y el repositorio ocupa 0,2 GB. No se dispone de información sobre longitud de contexto en el sentido de LLM, idiomas soportados ni resultados de evaluación en el robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.617.414 (≈51,6 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto fija en el prompt de rollout) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que combina un backbone transformer con un mecanismo de *action chunking*: en lugar de predecir una única acción por paso, el modelo predice un chunk de acciones futuras, lo que mitiga el problema de *compounding error* en el control secuencial. La política recibe como entrada `observation.state` con forma `(6,)` y dos imágenes de cámara `cam1` y `cam2` con forma `(3, 480, 640)` cada una, y produce una acción de forma `(6,)`. El nombre del repositorio sugiere un chunk de 50 acciones (`chunk50`) y batch size 1 (`b1`), aunque estos detalles no se confirman explícitamente en la model card.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `go234/cube-box_20261013_041703`: 50 episodios, 24.423 fotogramas a 30 FPS, con la tarea "Pick up the cube and put it in the box". La configuración reportada incluye 100.000 pasos de entrenamiento, batch size 1, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es imitation learning puro a partir de datos teleoperados. Tampoco se detalla la composición del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de estado articular y dos cámaras.
- Predicción de chunks de acciones (action chunking), que reduce la acumulación de errores frente a políticas paso a paso.
- Percepción visual multimodal: procesa dos flujos de imagen RGB de 480×640 a 30 FPS.
- Ejecución de una tarea concreta de pick-and-place ("Pick up the cube and put it in the box").
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Replicación de un pipeline completo de imitation learning: sirve como referencia reproducible para grabar un dataset con LeRobot, entrenar ACT y desplegar la política, gracias a que la model card incluye los comandos exactos de entrenamiento y rollout.
- Automatización de una tarea de pick-and-place en laboratorio: el modelo ejecuta la secuencia "coger el cubo y meterlo en la caja" sobre un `so_follower` con dos cámaras, adecuado para validar hardware y calibración antes de escalar a tareas más complejas.
- Benchmark interno de políticas ACT: al tener configuración de entrenamiento documentada (100k pasos, lr 1e-5, batch 1, semilla 1000), permite comparar variantes (otros chunks, otras tasas de aprendizaje) sobre el mismo dataset de 50 episodios.
- Docencia y formación en robótica: ejemplo mínimo (51,6 M de parámetros, repo de 0,2 GB) para explicar action chunking, codificadores visuales y el ciclo teleoperación-entrenamiento-despliegue.
- Base para fine-tuning en tareas similares: al ser Apache 2.0, se puede reentrenar sobre nuevos datasets de pick-and-place con el mismo robot y cámaras, partiendo de estos pesos o de la receta.
- Pruebas de integración con `lerobot-rollout`: valida el flujo de despliegue con `--strategy.type=base`, duración configurable y mapeo de cámaras, útil para equipos que preparan su propia infraestructura de inferencia robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,6 M de parámetros, el peso en FP32 ronda los 206 MB, pero no se documenta el consumo real incluyendo codificadores visuales y buffers.
- GPU recomendadas: no disponible. La model card solo indica `--policy.device=cuda` como opción de entrenamiento.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de parámetros es plausible, pero no hay dato oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) y entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `go234/act_chunk50_b1_amp` | ACT (imitation learning) | 51,6 M | no aplica | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | ACT | variable | no aplica | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | variable | no aplica | variable | Hugging Face Hub |
| Políticas VLA (p. ej. OpenVLA) | Vision-Language-Action | varios miles de millones | contexto de lenguaje | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Dataset muy pequeño: 50 episodios y 24.423 fotogramas para una única tarea; alta probabilidad de sobreajuste y baja generalización a posiciones de objetos, iluminación o distractores distintos.
- Específico de hardware: entrenado para `so_follower` con cámaras `cam1` y `cam2` a 480×640 y 30 FPS; cambiar robot, cámaras o resolución invalida la política.
- Tarea única: solo ejecuta "Pick up the cube and put it in the box"; no es un modelo generalista ni un modelo de lenguaje.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser imitation learning, puede producir trayectorias fuera de distribución ante estados no vistos.
- Sesgos: no documentados, pero inherentes a los datos teleoperados de un único operador y entorno.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin información sobre cuantizaciones ni despliegue fuera de LeRobot: no se recomienda asumir compatibilidad con runtimes de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/act_chunk50_b1_amp
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/cube-box_20261013_041703
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
