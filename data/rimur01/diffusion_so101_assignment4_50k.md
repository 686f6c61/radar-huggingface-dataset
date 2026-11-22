# rimur01/diffusion_so101_assignment4_50k

## Resumen

`rimur01/diffusion_so101_assignment4_50k` es una política de control visuomotor entrenada con el método Diffusion Policy, publicada en Hugging Face Hub por el usuario rimur01 mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política de imitación para robótica que trata el control visuomotor como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multimodales que funcionan bien en tareas de manipulación con contacto físico rico.

El modelo está especializado en una única tarea sobre un robot SO-101 (tipo `so_follower`): "Pick up an object and place it in a target area". Consume el estado articular del robot (vector de 6 dimensiones) y dos cámaras RGB de 480x640, y emite un vector de acción de 6 dimensiones. Con 29.450.574 parámetros y un repositorio de 0,1 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de consumo.

Es relevante ahora porque forma parte del ecosistema LeRobot, que está estandarizando el entrenamiento, despliegue y publicación de políticas de imitación en robots de bajo coste como el SO-101. Sin embargo, se trata de un artefacto de aprendizaje o experimentación (nombre "assignment4"), con 0 descargas y 0 likes, sin resultados de evaluación publicados y entrenado con un dataset muy reducido de 50 episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor), implementada en LeRobot 0.6.0 |
| Parametros totales | 29.450.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso de control) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (Chi et al., arXiv:2303.04137), que formula el control visuomotor como un proceso de difusión generativo: en lugar de predecir directamente una acción, el modelo aprende a denoizar trayectorias de acción multimodales, lo que produce movimientos suaves y coherentes y mejora el rendimiento en manipulación con contacto. La implementación concreta es la de LeRobot, con entrada de estado de 6 dimensiones y dos imágenes de 3x480x640, y salida de acción de 6 dimensiones. El número total de parámetros (29,45 M) es coherente con una red de difusión de tamaño moderado para robótica.

El entrenamiento se realizó sobre el dataset `rimur01/so101-assignment1-50-new`: 50 episodios, 15.000 fotogramas a 15 FPS, una única tarea ("Pick up an object and place it in a target area"). La configuración documentada es de 50.000 pasos, batch size 1, optimizador Adam, learning rate 0,0001 y semilla 1000. No se documenta composición del dataset más allá de los episodios, ni uso de RLHF/DPO (no aplica en este dominio), ni innovaciones técnicas adicionales más allá del propio método de difusión.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para el robot SO-101 (`so_follower`).
- Control visuomotor a partir de dos cámaras RGB (`cam0`, `cam1`) y del estado articular (`observation.state`, 6 dimensiones).
- Ejecución de una tarea concreta de manipulación: recoger un objeto y colocarlo en una zona objetivo.
- Producción de acciones multimodales y suaves gracias a la formulación de difusión, adecuada para manipulación con contacto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Recogida y colocación de objetos en un SO-101: caso de uso directo para el que fue entrenado; se ejecuta con `lerobot-rollout` indicando el puerto del robot, las dos cámaras y la tarea.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia de extremo a extremo (grabación de datos, entrenamiento, publicación y despliegue) para equipos que adopten el framework.
- Experimentos docentes o de laboratorio sobre Diffusion Policy: permite reproducir el flujo de entrenamiento con `lerobot-train --policy.type=diffusion` y comparar configuraciones.
- Base para fine-tuning en tareas similares: al ser un modelo pequeño (29,45 M de parámetros) y con licencia Apache 2.0, puede reentrenarse con datasets propios de recogida y colocación.
- Evaluación de infraestructura de inferencia en tiempo real: útil para medir latencia y throughput de una política de difusión en GPU de consumo antes de escalar a modelos mayores.
- Demostraciones de robótica de bajo coste: el SO-101 y una política compacta permiten montar demos reproducibles en hardware asequible.
- No es adecuado para tareas distintas a la entrenada ni para robots con otra morfología o número de articulaciones sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 29,45 M de parámetros y pesos en safetensors (repo de 0,1 GB), la huella de pesos es del orden de decenas de MB, por lo que la VRAM necesaria es modesta y dominada por las dos cámaras de 480x640 y los buffers de inferencia.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU con soporte CUDA es suficiente; una RTX 4090 o A100 no son necesarias para este modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con CUDA; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento), con `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El dataset se grabó a 15 FPS y las cámaras se configuran a 30 FPS en el ejemplo de rollout, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada (parámetros, contexto, rendimiento y licencia de alternativas). Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rimur01/diffusion_so101_assignment4_50k | 29,45 M | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face Hub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado para una única tarea ("Pick up an object and place it in a target area") y un único robot (`so_follower`); no generaliza a otras tareas o morfologías sin reentrenamiento.
- Dataset muy reducido (50 episodios, 15.000 fotogramas), lo que limita la robustez frente a variaciones de posición, iluminación, objetos o distracciones.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Repositorio con 0 descargas y 0 likes y nombre de asignación ("assignment4"): artefacto de aprendizaje, no validado por la comunidad.
- Riesgo de sobreajuste al entorno de grabación y a las cámaras concretas; la model card exige que los nombres de cámara coincidan con las claves de observación del entrenamiento.
- No es un modelo de lenguaje: no aplican sesgos lingüísticos, alucinación textual ni capacidades multilingües; el riesgo equivalente es la ejecución de acciones incorrectas en el robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Para producción, requiere validación exhaustiva en el robot objetivo y monitorización de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimur01/diffusion_so101_assignment4_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/rimur01/so101-assignment1-50-new
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rimur01/so101-assignment1-50-new
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
