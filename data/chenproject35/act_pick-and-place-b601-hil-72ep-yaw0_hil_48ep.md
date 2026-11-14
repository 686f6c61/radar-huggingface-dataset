# chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_48ep

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación robótica. Este repositorio concreto, publicado por el usuario `chenproject35`, contiene una política entrenada con LeRobot sobre un robot `rebot_b601_follower` equipado con dos cámaras (`cam_front` y `cam_wrist`) para la tarea "Pick up inreach2 and place it in the jig".

El modelo no es un LLM ni un modelo de lenguaje: es una política visomotora de 51,67 millones de parámetros que consume el estado articular de 7 dimensiones y dos imágenes RGB de 480x640, y produce un vector de acción de 7 dimensiones. Se entrenó con 72 episodios teleoperados (74.932 fotogramas a 30 FPS) durante 31.160 pasos con AdamW y una tasa de aprendizaje de 1e-5.

Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de imitación en LeRobot 0.6.2, con licencia Apache 2.0 y pesos en safetensors, lo que permite desplegarlo directamente con el comando `lerobot-rollout` sobre el mismo tipo de robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por fotograma) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT sigue el diseño del paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La política combina un backbone visual que codifica las dos cámaras (`cam_front` y `cam_wrist`, ambas a 480x640 y 3 canales) con un transformer que predice un chunk de acciones futuras en lugar de una sola acción, mitigando el problema de composición de errores típico de las políticas paso a paso. La entrada de estado es un vector de 7 dimensiones (`observation.state`) y la salida es un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `chenproject35/pick-and-place-b601-hil-72ep-yaw0`: 72 episodios, 74.932 fotogramas a 30 FPS, una única tarea ("Pick up inreach2 and place it in the jig"). Se usaron 31.160 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado puro sobre demostraciones teleoperadas.

## Capacidades

- Manipulación robótica visomotora: predice acciones de 7 dimensiones a partir de estado articular e imágenes de dos cámaras.
- Ejecución de una tarea concreta de pick-and-place: "Pick up inreach2 and place it in the jig".
- Aprendizaje por imitación con chunking de acciones, que reduce el error acumulado en secuencias largas.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no procesa texto libre).
- Modo thinking, visión general, audio: no disponible; solo visión específica de las dos cámaras de entrenamiento.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la tarea de recoger `inreach2` y colocarlo en el jig sobre un `rebot_b601_follower`, adecuada para ciclos repetitivos con posiciones de objeto relativamente estables.
- Base para fine-tuning con datos propios: al estar en formato LeRobot y licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio del mismo robot y tarea para adaptar la política a nuevas posiciones o útiles.
- Evaluación de pipelines de imitación: sirve como referencia reproducible (semilla 1000, hiperparámetros documentados) para comparar variantes de ACT o de recogida de datos teleoperados.
- Prototipado rápido en laboratorio: con 51,67 M de parámetros y pesos safetensors, se puede cargar y ejecutar en una estación de trabajo con GPU consumer para validar hardware y calibración de cámaras antes de invertir en entrenamientos mayores.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos completos de rollout y entrenamiento, lo que facilita reproducir el flujo extremo a extremo con estudiantes.
- Investigación en chunking de acciones: permite experimentar con la longitud de chunk y el número de cámaras manteniendo el resto del pipeline fijo, ya que la configuración de entrenamiento está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, pero el consumo real depende del backbone visual y de los buffers de las dos imágenes de 480x640.
- GPU recomendadas: no disponible en la documentación; el comando de entrenamiento de LeRobot usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA.
- ¿Cabe en GPU consumer? Muy probablemente sí, dado el tamaño del modelo, aunque no se documenta una VRAM mínima verificada.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (documentado en la model card); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se publica latencia medida por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy, VQ-BeT u otras alternativas de imitación sobre el mismo robot o tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 72 episodios de un único operador y entorno, la política puede sobreajustarse a posiciones, iluminación y disposición concretas del montaje.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas fuera de distribución cuando el objeto o las cámaras se salen de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; la política no procesa lenguaje, solo la cadena de tarea fija "Pick up inreach2 and place it in the jig".
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del dataset asociado antes de redistribuir datos.
- Caveats para producción: no hay evaluación en robot real publicada, por lo que la tasa de éxito es desconocida; el modelo está atado al robot `rebot_b601_follower` y a los nombres de cámara `cam_front` y `cam_wrist`; cambios de hardware o calibración requieren reentrenamiento o al menos revalidación.
- El repositorio tiene 31 descargas y 0 likes, con lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_48ep
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-hil-72ep-yaw0
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-hil-72ep-yaw0
