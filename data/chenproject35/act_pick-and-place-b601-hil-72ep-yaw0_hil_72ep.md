# chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_72ep

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este checkpoint concreto, publicado por el usuario chenproject35, es una política entrenada con LeRobot sobre un robot `rebot_b601_follower` equipado con dos cámaras (frontal y de muñeca), para la tarea concreta de recoger un objeto y colocarlo en un soporte (jig).

El modelo es una política de control visuomotor, no un modelo de lenguaje: consume el estado del robot (7 dimensiones) y dos imágenes RGB de 480x640, y produce un vector de acción de 7 dimensiones. Cuenta con 51.670.663 parámetros y un repositorio de 5.0 GB, con pesos en formato safetensors. Está pensado para ejecutarse en el propio robot mediante el stack de LeRobot.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (grabación de datos teleoperados, entrenamiento con ACT y despliegue en hardware real), y como punto de partida para quien quiera adaptar la receta a su propio robot o tarea. La licencia Apache 2.0 facilita su reutilización comercial, aunque el rendimiento real no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada visual y de estado, sin lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras a partir de observaciones visuales y de estado, en lugar de predecir una sola acción por paso. Esto mitiga el problema de compounding error típico de las políticas paso a paso y permite un control más suave. El modelo combina un codificador de imágenes (las dos cámaras, `cam_front` y `cam_wrist`, a 480x640) con el estado del robot (7 dimensiones) y un decodificador que emite acciones de 7 dimensiones.

El entrenamiento se realizó sobre el dataset `chenproject35/pick-and-place-b601-hil-72ep-yaw0`, con 72 episodios, 74.932 frames a 30 FPS, para la tarea "Pick up inreach2 and place it in the jig.". La configuración reportada incluye 46.832 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF/DPO ni de técnicas adicionales de refinamiento; se trata de aprendizaje supervisado por imitación a partir de datos teleoperados.

## Capacidades

- Control visuomotor de manipulación robótica: genera acciones de 7 dimensiones a partir de estado y dos vistas de cámara.
- Predicción de chunks de acción, lo que aporta suavidad y reduce la acumulación de error.
- Ejecución de una tarea concreta de pick-and-place: recoger un objeto ("inreach2") y colocarlo en un jig.
- Aprendizaje por imitación a partir de datos teleoperados (72 episodios).
- Integración con el ecosistema LeRobot: entrenamiento, rollout e inferencia mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia de recogida y colocación en el jig sobre el robot `rebot_b601_follower`, adecuada para tareas repetitivas de alimentación de piezas.
- Base para fine-tuning en tareas similares: sirve como inicialización para entrenar variantes de pick-and-place con nuevos objetos o posiciones, reutilizando la receta de LeRobot.
- Prototipado rápido de políticas de imitación: permite validar el pipeline completo (grabación, entrenamiento, despliegue) en hardware de bajo coste antes de escalar.
- Investigación en aprendizaje por imitación: útil como referencia reproducible para comparar ACT con otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset.
- Demostración educativa de robótica con LeRobot: ejemplo didáctico de entrenamiento y rollout con dos cámaras y estado de 7 dimensiones.
- Pruebas de integración de sensórica: permite verificar la calibración de cámaras y la correspondencia de claves de observación en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos imágenes de 480x640, la huella es reducida y cabe en GPUs consumer, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible; para entrenamiento se usó `--policy.device=cuda`, sin especificar el modelo de GPU.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo, pero no confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51.670.663 | no aplica | sin evaluacion publicada | apache-2.0 | Hugging Face (lerobot) |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento en la información proporcionada; la comparación se limita a la categoría (políticas de imitación para robótica) y no a métricas verificadas.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: se desconoce la tasa de éxito de la política.
- Entrenada para una tarea y un robot concretos (`rebot_b601_follower`); no es generalizable sin reentrenamiento.
- Depende de la correspondencia exacta de las claves de observación (`cam_front`, `cam_wrist`) y de la calibración de cámaras y robot.
- Dataset pequeño (72 episodios): riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Riesgo de fallo silencioso en producción: al ser una política de control, los errores se manifiestan como acciones incorrectas, no como texto.
- Sesgos: no documentados; podrían aparecer sesgos derivados de las condiciones de grabación del dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No aplica a tareas de lenguaje, tool calling ni agentes; su uso fuera de robótica de manipulación no es viable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-hil-72ep-yaw0_hil_72ep
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-hil-72ep-yaw0
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-hil-72ep-yaw0
