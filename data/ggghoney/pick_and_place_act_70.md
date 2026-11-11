# Ggghoney/pick_and_place_act_70

## Resumen

`Ggghoney/pick_and_place_act_70` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario Ggghoney y se ha entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular y dos cámaras y emite comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación: coger un bolígrafo rojo y colocarlo en el estuche. Se ha entrenado sobre el dataset `Ggghoney/pick_and_place_80`, con 80 episodios y 64.152 fotogramas a 30 FPS, en un robot de tipo `omx_follower` con cámaras frontal y superior. Su relevancia es la de un ejemplo reproducible de pipeline completo de imitación con LeRobot, no la de un modelo de propósito general.

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que cabe en cualquier GPU consumer. La información pública es escasa: no hay licencia declarada, no hay resultados de evaluación en robot real y no se especifican idiomas ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `omx_follower` |
| Cámaras de entrada | `front` y `top`, imágenes de 3×480×640 |
| Entrada de estado | `observation.state`, vector de 6 dimensiones |
| Salida de acción | `action`, vector de 6 dimensiones |
| Dataset de entrenamiento | `Ggghoney/pick_and_place_80` (80 episodios, 64.152 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 40.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suele mejorar la tasa de éxito en manipulación. La arquitectura combina un encoder visual que procesa las dos cámaras (`front` y `top` a 480×640) con un transformer que, a partir de las observaciones y del estado articular de 6 dimensiones, genera secuencias de acciones de 6 dimensiones. El modelo se entrena con datos de teleoperación.

El entrenamiento se realizó con LeRobot 0.6.2 durante 40.000 pasos, con batch size 8, AdamW y learning rate 1e-05, sobre 80 episodios (64.152 fotogramas a 30 FPS) de la tarea "Pick up the red pen and place it in the pencil case". La model card no detalla la composición del dataset, aumentos de datos, ni si hubo fases de refinamiento posteriores. Tampoco se documentan innovaciones adicionales más allá del propio action chunking del método ACT.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de dos vistas de cámara y del estado articular.
- Ejecución de una tarea única y específica: coger un bolígrafo rojo y depositarlo en un estuche.
- Predicción de chunks de acción, que aporta suavidad y coherencia temporal en la ejecución.
- Integración con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de la tarea de pick-and-place: ejecutar la política en un robot `omx_follower` con cámaras frontal y superior para reproducir el agarre del bolígrafo y su depósito en el estuche, usando el comando `lerobot-rollout` documentado en la model card.
- Punto de partida para fine-tuning: reentrenar la política con `lerobot-train` sobre un dataset propio de otra tarea de manipulación, aprovechando la receta de hiperparámetros publicada (40.000 pasos, batch 8, lr 1e-05).
- Docencia y formación en aprendizaje por imitación: usar el repositorio como ejemplo completo de pipeline LeRobot, desde la grabación de teleoperación hasta el despliegue en robot.
- Validación de hardware: probar la cadena de calibración de robot y cámaras con una política ya entrenada antes de grabar datos propios.
- Investigación en action chunking: comparar el comportamiento de ACT frente a políticas paso a paso en una tarea de manipulación acotada.
- Prototipado de automatización de laboratorio o escritorio: adaptar la tarea a la recogida y colocación de objetos pequeños en un entorno controlado con iluminación estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 51,7 M de parámetros; en la práctica el cuello de botella es el procesamiento de las dos imágenes de 480×640.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; también es viable en CPU para pruebas de baja frecuencia.
- Cabe holgadamente en GPU consumer: sí, en cualquier modelo con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot con `lerobot-rollout` y `--policy.path=Ggghoney/pick_and_place_act_70`; el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`.
- Latencia y throughput: no disponibles. La model card no reporta tiempos de inferencia ni frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ggghoney/pick_and_place_act_70 | 51,7 M | no aplica | Pick-and-place de un bolígrafo | no disponible | Hugging Face, LeRobot |
| Políticas ACT de LeRobot (referencia del método) | variable | no aplica | Manipulación genérica por imitación | según repositorio | Hugging Face, LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación por imitación | según repositorio | literatura y repositorios públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada para una única tarea y un único tipo de robot (`omx_follower`); no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Sin resultados de evaluación en robot real: se desconoce la tasa de éxito y la robustez ante cambios de posición, iluminación o distractores.
- Depende de la configuración exacta de cámaras (`front` y `top`) y de sus nombres; un cambio de montaje o de resolución puede degradar el comportamiento.
- Dataset pequeño (80 episodios) y sin documentación sobre diversidad de posiciones u objetos; riesgo alto de sobreajuste al entorno de grabación.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Riesgo de alucinación en el sentido de acciones erróneas o inseguras fuera de la distribución de entrenamiento; se recomienda supervisión humana y límites de par o velocidad en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ggghoney/pick_and_place_act_70
- Dataset de entrenamiento: https://huggingface.co/datasets/Ggghoney/pick_and_place_80
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ggghoney/pick_and_place_80
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
