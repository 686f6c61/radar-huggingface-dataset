# hrvojecukman/act_so101_dice_box_v3

## Resumen

`act_so101_dice_box_v3` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicada por el usuario hrvojecukman en Hugging Face y empaquetada con la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (frontal y de muñeca) y del estado de las articulaciones, predice directamente comandos de acción para un brazo robótico de tipo `so_follower` (SO-101). Resuelve una única tarea concreta: coger un dado y colocarlo dentro de una caja.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. La entrada combina un vector de estado de 6 dimensiones con dos imágenes RGB de 480x640 píxeles, y la salida es un vector de acción de 6 dimensiones. Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabación de datos de teleoperación, entrenamiento supervisado y despliegue en robot real.

Se trata de un artefacto de investigación y prototipado, no de un producto. No incluye resultados de evaluación en robot real, no declara idiomas (no procesa lenguaje natural) y su utilidad está acotada al entorno, la cámara y el robot exactos con los que se recogieron los datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación basada en el historial de acciones y el chunk predicho, no declarada) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica con la cadena "Pick up the dice and put it in the box") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política consume `observation.state` con forma `(6,)` y dos flujos visuales `observation.images.front` y `observation.images.wrist`, ambos de `(3, 480, 640)`, y produce `action` con forma `(6,)`. El robot objetivo es `so_follower`, con cámaras `front` y `wrist`.

El entrenamiento se realizó sobre el dataset `hrvojecukman/so101_dice_box_v2_20261030_214125`: 100 episodios, 42.567 fotogramas a 30 FPS, con la tarea "Pick up the dice and put it in the box". La configuración declarada es de 80.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. No se documenta composición adicional del dataset, aumento de datos, ni fases de RLHF o DPO (no aplicables a este tipo de política). Tampoco se detalla ninguna innovación técnica más allá del propio mecanismo de chunking de ACT.

## Capacidades

- Control visomotor de un brazo robótico SO-101 (`so_follower`) a partir de dos cámaras y del estado articular.
- Predicción de acciones en chunks de 6 dimensiones, orientada a ejecución continua a 30 FPS.
- Aprendizaje por imitación a partir de teleoperación; no requiere definición explícita de recompensas.
- Ejecución de una tarea concreta de manipulación: coger un dado y depositarlo en una caja.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general, audio o modo thinking. Es una política de robot, no un modelo generativo de propósito general.

## Casos de uso

- Reproducción de un pipeline de imitación de extremo a extremo: sirve como referencia para validar la instalación de LeRobot, la calibración del SO-101 y el flujo `lerobot-rollout` antes de entrenar políticas propias.
- Pick-and-place de objetos pequeños en laboratorio: la política ejecuta la secuencia de coger un dado y soltarlo en una caja, útil como banco de pruebas de manipulación diestra con dos cámaras.
- Base para fine-tuning con nuevos datos: al ser una política ACT de 51,7 M de parámetros y licencia Apache 2.0, puede reentrenarse con `lerobot-train --policy.type=act` sobre datasets propios del mismo robot y formato.
- Docencia y formación en robótica de imitación: el par dataset-política permite mostrar el ciclo completo de recogida de datos, entrenamiento y despliegue sin infraestructura pesada.
- Evaluación de robustez visomotora: permite medir cómo afectan cambios de iluminación, posición del objeto o distractores a una política entrenada con 100 episodios y 42.567 fotogramas.
- Prototipado de automatización de bajo coste: al caber en GPU de consumo y ejecutarse en tiempo real, es adecuado para demostraciones en ferias, laboratorios o entornos educativos con un SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito declarada para la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, los pesos en precisión nativa ocupan del orden de 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo con 4 GB o más, incluyendo el procesamiento de dos flujos de imagen de 480x640.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento de la model card usa `--policy.device=cuda`; para entrenamiento se recomienda una GPU dedicada (por ejemplo, RTX 3090/4090 o superiores), mientras que la inferencia puede ejecutarse en GPUs de gama media.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM; no se han publicado mediciones oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=hrvojecukman/act_so101_dice_box_v3`), con soporte de PyTorch y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La política está pensada para operar a 30 FPS, la frecuencia de grabación del dataset, pero no se han publicado cifras de latencia por chunk ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_so101_dice_box_v3 | ACT (LeRobot) | 51,7 M | Estado (6,) + 2 imágenes 480x640 | Sin evaluación publicada | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | ACT | Variable según entrenamiento | Estado + imágenes | Depende de cada política | Habitualmente Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | Variable | Estado + imágenes | Depende de cada política | Habitualmente Apache 2.0 | Hugging Face |
| Políticas π0 / π0.5 (Physical Intelligence) | VLA | No disponible en la información | Estado + imágenes + lenguaje | No disponible en la información | No disponible en la información | No disponible en la información |

No se dispone de datos de benchmarks ni de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada en robot real, por lo que no puede afirmarse que la política funcione de forma fiable fuera del entorno de entrenamiento.
- Sobreajuste al entorno: entrenada con 100 episodios y 42.567 fotogramas de una única tarea, es probable que sea sensible a cambios de iluminación, posición del dado, fondo o configuración de cámaras.
- Dependencia estricta del hardware: requiere un SO-101 (`so_follower`) y cámaras con los nombres `front` y `wrist`; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Sin capacidades de lenguaje: no interpreta instrucciones en lenguaje natural; la tarea se pasa como cadena fija y no hay comprensión semántica.
- Sesgos: no documentados por el autor; al derivarse de teleoperación humana, puede heredar sesgos de los operadores y de la distribución de posiciones del dataset.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Sin datos de cuantización ni de despliegue en hardware de bajo consumo más allá de LeRobot.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrvojecukman/act_so101_dice_box_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/hrvojecukman/so101_dice_box_v2_20261030_214125
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hrvojecukman/so101_dice_box_v2_20261030_214125
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
