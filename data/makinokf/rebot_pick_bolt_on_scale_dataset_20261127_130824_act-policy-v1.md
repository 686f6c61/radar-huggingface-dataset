# MakinoKF/rebot_pick_bolt_on_scale_dataset_20261127_130824_act-policy-v1

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política de control robótico entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La política forma parte del ecosistema LeRobot de Hugging Face y ha sido entrenada por el usuario MakinoKF para una tarea concreta de manipulación: recoger un tornillo ("pick the bolt") con un robot de tipo `rebot_b601_follower` equipado con dos cámaras (`top` y `left`).

El modelo aprende por imitación a partir de 80 episodios de teleoperación (18.329 fotogramas a 30 FPS) y predice trozos de acción (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Con 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que cabe en GPUs de consumo y está pensado para ejecutarse en el robot real mediante la CLI `lerobot-rollout`.

Es relevante ahora porque ilustra el flujo completo de LeRobot 0.6.0: grabación de datos, entrenamiento de una política ACT y despliegue en hardware real, con licencia Apache 2.0 y pesos en safetensors. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación multimodal, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder visual (procesa las dos cámaras, `top` y `left`, a resolución 480x640) y un decodificador que emite chunks de acciones de dimensión 7. La entrada incluye el estado de las articulaciones (`observation.state`, shape `(7,)`) y las dos imágenes; la salida es un vector de acción `(7,)`. El entrenamiento se realizó durante 30.000 pasos con batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.0.

El dataset de entrenamiento contiene 80 episodios y 18.329 fotogramas a 30 FPS para la única tarea "pick the bolt". No se documenta el número de tokens (no aplica), la composición del dataset más allá de la tarea ni si hubo etapas de RLHF/DPO (no aplica en imitación supervisada). La innovación principal del método es la predicción de chunks de acción, que reduce el error de compounding y suaviza el control.

## Capacidades

- Control robótico de manipulación: predice acciones de 7 dimensiones a partir de estado de articulaciones e imágenes.
- Percepción visual multimodal con dos cámaras sincronizadas (`top` y `left`) a 480x640.
- Ejecución de una tarea específica de picking ("pick the bolt") sobre el robot `rebot_b601_follower`.
- Aprendizaje por imitación a partir de teleoperación; no requiere ingeniería de recompensas.
- Despliegue mediante `lerobot-rollout` con estrategia base (sin grabación de episodios).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de una celda de picking de tornillos: la política se ejecuta en bucle sobre el robot `rebot_b601_follower` con las cámaras `top` y `left`, recogiendo el tornillo de forma repetible en entornos controlados con la misma disposición de cámara y robot.
- Prototipado rápido de tareas de manipulación: sirve como plantilla para grabar un dataset propio con LeRobot, reentrenar con `lerobot-train --policy.type=act` y validar el ciclo completo antes de escalar a producción.
- Investigación en aprendizaje por imitación: permite reproducir el método ACT con un caso real y medir el efecto del número de episodios (80) y pasos (30.000) en la tasa de éxito.
- Benchmark interno de hardware robótico: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se puede ejecutar en GPUs de consumo para comparar latencias de inferencia entre estaciones de trabajo.
- Educación y demos: útil para talleres de robótica que quieran mostrar el flujo LeRobot de extremo a extremo sin infraestructura pesada.
- Base para fine-tuning en tareas análogas: al estar bajo Apache 2.0, se puede adaptar a otras tareas de picking con datos propios y redistribuir la política resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria es muy baja (del orden de 1-2 GB incluyendo buffers de imagen).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo; no se especifican modelos concretos.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles; dependen del robot, las cámaras y la GPU, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este repositorio) | 51,7 M | no disponible | sin evaluación publicada | Apache 2.0 | Hugging Face (LeRobot) |
| ACT (implementación de referencia LeRobot) | no disponible | no disponible | reportado en el paper original | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy | no disponible | no disponible | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real; la tasa de éxito de la tarea "pick the bolt" es desconocida.
- Entrenada con solo 80 episodios y una única tarea, lo que limita su generalización a posiciones, iluminación o distracciones distintas.
- Depende de la configuración exacta de cámaras (`top`, `left`) y del robot `rebot_b601_follower`; cambios de montaje o calibración pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset de teleoperación y de fallos ante objetos o escenas no vistas.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no soporta tool calling ni agentes.
- Sesgos conocidos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones (posiciones, velocidades, operador).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción requiere validación propia.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_bolt_on_scale_dataset_20261127_130824_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_bolt_on_scale_dataset_20261127_130824
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_bolt_on_scale_dataset_20261127_130824
