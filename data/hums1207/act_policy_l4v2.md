# hums1207/act_policy_L4v2

## Resumen

`hums1207/act_policy_L4v2` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. El modelo ha sido entrenado y publicado con la librería LeRobot de Hugging Face y está diseñado para controlar un robot seguidor del tipo `so102_follower` equipado con una única cámara de muñeca (`cam_wrist`). En lugar de predecir una acción por paso, ACT predice secuencias cortas de acciones (chunks), lo que reduce el error acumulado y mejora la estabilidad del control en tareas de manipulación.

El modelo tiene 51.670.663 parámetros y consume como entrada el estado del robot (vector de 7 dimensiones) y una imagen RGB de 480x640 píxeles, produciendo como salida un vector de acción de 7 dimensiones. Está entrenado sobre un dataset propio de 45 episodios y 50.933 fotogramas a 30 FPS para la tarea `rerobot_picking`, lo que lo convierte en una política muy especializada en un único entorno y tarea.

Su relevancia es la de un ejemplo práctico y reproducible de entrenamiento de políticas de imitación con LeRobot: licencia Apache 2.0, formato safetensors, repo ligero (0,2 GB) y comandos de despliegue documentados. No obstante, al ser un modelo de autor individual, sin métricas de evaluación publicadas y con muy pocas descargas, debe tratarse como una política experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa la imagen de la cámara de muñeca), un codificador del estado propioceptivo del robot y un decoder transformer que genera chunks de acciones. La predicción por chunks, en lugar de paso a paso, mitiga el problema de acumulación de errores típico de las políticas reactivas y permite un control más suave. La entrada visual es de 3x480x640 y el estado es un vector de 7 dimensiones; la salida es una acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 durante 30.000 pasos, con batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset de entrenamiento (`hums1207/phsyical_AI_20261121_162707`) contiene 45 episodios y 50.933 fotogramas a 30 FPS para la tarea `rerobot_picking`. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado por imitación a partir de demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación mediante imitación: predice chunks de acciones de 7 dimensiones a partir del estado del robot y de una imagen de muñeca.
- Percepción visual monocámara: procesa imágenes RGB de 480x640 a 30 FPS.
- Ejecución de la tarea específica `rerobot_picking` sobre el robot `so102_follower`.
- Integración nativa con LeRobot: carga y despliegue mediante `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de generación de texto ni de audio.

## Casos de uso

- Replicación de experimentos de imitación: sirve como referencia reproducible para validar el pipeline de entrenamiento de ACT con LeRobot en un robot `so102_follower`, ya que incluye configuración completa de entrenamiento y comandos de despliegue.
- Recogida de objetos en laboratorio: la política está entrenada para `rerobot_picking`, por lo que puede emplearse en un entorno controlado para tareas de picking con la misma configuración de cámara y robot.
- Base para fine-tuning: al estar en formato safetensors y con licencia Apache 2.0, puede reutilizarse como punto de partida para reentrenar con datasets propios mediante `lerobot-train --policy.type=act`.
- Docencia y formación: útil para demostrar el flujo completo de aprendizaje por imitación (grabación de datos, entrenamiento, rollout) en cursos de robótica.
- Evaluación de hardware de bajo coste: al ser un modelo pequeño (51,7 M de parámetros, 0,2 GB), permite probar la latencia de inferencia en GPUs de consumo y en sistemas embebidos con GPU.
- Benchmark interno de políticas ACT: puede servir como línea base para comparar variantes de ACT entrenadas con distintos datasets o hiperparámetros en el mismo robot y tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión FP32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM libre, incluyendo el cómputo visual.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060 o superior es más que suficiente. Para entrenamiento, una RTX 4090 o A100 acelera los 30.000 pasos, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch/CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según la configuración de captura del dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hums1207/act_policy_L4v2 | 51,7 M | Estado (7) + imagen 3x480x640 | `rerobot_picking` en `so102_follower` | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | Configurable | Tareas diversas | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | Configurable | Manipulación | Apache 2.0 | Hugging Face / LeRobot |
| Políticas VQ-BeT (LeRobot) | no disponible | Configurable | Manipulación | Apache 2.0 | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenada únicamente para la tarea `rerobot_picking` con un robot `so102_follower` y una cámara `cam_wrist`; no generaliza a otras tareas, robots ni configuraciones de cámara sin reentrenamiento.
- Dataset muy reducido: 45 episodios y 50.933 fotogramas, lo que aumenta el riesgo de sobreajuste al entorno de grabación (posiciones de objetos, iluminación, fondo).
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Sin métricas de sesgo ni de robustez: no se documentan sesgos conocidos, pero al ser un modelo visual puede verse afectado por cambios de iluminación, oclusiones o distracciones.
- Riesgo de fallo silencioso: como toda política de imitación, puede ejecutar acciones incorrectas sin señal de error explícita; requiere supervisión y paradas de seguridad en el robot.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Reputación mínima: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hums1207/act_policy_L4v2
- Dataset de entrenamiento: https://huggingface.co/datasets/hums1207/phsyical_AI_20261121_162707
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hums1207/phsyical_AI_20261121_162707
