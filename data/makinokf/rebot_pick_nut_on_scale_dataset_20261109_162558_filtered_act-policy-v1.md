# MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_filtered_act-policy-v1

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política de control robótico entrenada mediante imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. La ha generado el usuario MakinoKF con LeRobot 0.6.0, la librería de Hugging Face para aprendizaje por imitación en robots reales, y resuelve una tarea muy concreta: recoger una tuerca situada sobre una báscula con un brazo robótico `rebot_b601_follower` equipado con dos cámaras (vista superior e izquierda).

El modelo tiene 51.670.663 parámetros y ocupa 0,2 GB en el repositorio, con pesos en safetensors y licencia Apache 2.0. No es un modelo generativo de propósito general: es un policy que mapea observaciones (estado articular de 7 dimensiones más dos imágenes RGB de 480x640) a acciones de 7 dimensiones, prediciendo trozos de acción (action chunks) en lugar de pasos individuales para mejorar la estabilidad y la tasa de éxito en manipulación fina.

Es relevante como ejemplo canónico del flujo de trabajo de LeRobot para investigación en robótica: entrenamiento desde cero sobre un dataset teleoperado pequeño (36 episodios, 5520 fotogramas a 30 FPS), despliegue con el comando `lerobot-rollout` y publicación directa en el Hub. Su utilidad práctica está acotada al hardware y a la tarea descritos; no se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo consume observaciones de un solo paso y predice chunks de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica con la cadena `pick the nut on the scale`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes) con un transformer que predice secuencias cortas de acciones, los llamados action chunks. En lugar de regresar una única acción por fotograma, el modelo emite un bloque de acciones futuras, lo que reduce el error de acumulación y suaviza el control. La política consume `observation.state` (vector de 7 dimensiones), `observation.images.top` y `observation.images.left` (ambas de 3x480x640), y produce `action` de 7 dimensiones. El robot objetivo es `rebot_b601_follower`.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_filtered`: 36 episodios, 5520 fotogramas a 30 FPS, tarea "pick the nut on the scale". La configuración fue de 10.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni aumentos de datos; se trata de imitación supervisada pura sobre teleoperación.

## Capacidades

- Control robótico de manipulación: genera comandos de 7 dimensiones para un brazo `rebot_b601_follower` a partir de estado articular y dos cámaras.
- Predicción de action chunks: emite secuencias de acciones en lugar de pasos aislados, lo que mejora la suavidad y la robustez del control.
- Percepción visual multi-cámara: integra simultáneamente las vistas `top` y `left` a 480x640.
- Ejecución de una tarea específica de pick-and-place: "pick the nut on the scale".
- Despliegue mediante `lerobot-rollout` con estrategia base y duración configurable.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Recogida automatizada de piezas pequeñas en línea de montaje: el policy puede ejecutar la tarea "pick the nut on the scale" sobre un `rebot_b601_follower` calibrado, usando las dos cámaras para localizar la tuerca y el estado articular para el control fino.
- Banco de pruebas para investigación en imitación: sirve como referencia reproducible del pipeline LeRobot (grabación, entrenamiento ACT, rollout) para comparar hiperparámetros o datasets.
- Prototipado rápido de células robotizadas: al ser un repo de 0,2 GB y 51,7 M de parámetros, se puede desplegar en un PC con GPU de gama media conectado al robot sin infraestructura pesada.
- Docencia y formación en robótica: permite mostrar de extremo a extremo cómo se pasa de teleoperación a política autónoma con comandos `lerobot-train` y `lerobot-rollout`.
- Base para fine-tuning en tareas similares: al estar en licencia Apache 2.0 y formato safetensors, se puede reentrenar con nuevos datasets de recogida de objetos pequeños sobre báscula o superficies similares.
- Validación de hardware y calibración: útil para verificar que cámaras, puerto del robot y cinemática del `rebot_b601_follower` están correctamente configurados antes de escalar a tareas más complejas.
- Generación de datos sintéticos de evaluación: el policy puede ejecutar rollouts automáticos para recolectar trayectorias adicionales que alimenten futuros entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM necesaria es muy baja y está dominada por los buffers de las dos imágenes de 480x640.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o superior permite ejecutar el policy con holgura. Para entrenamiento se recomienda una RTX 3090/4090 o una A100 si se aumenta el batch o el número de cámaras.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo con soporte CUDA; también es viable en CPU para inferencia a baja frecuencia, aunque no se documenta latencia.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path` apuntando al repo; el entrenamiento se realiza con `lerobot-train --policy.type=act`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la frecuencia del dataset, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MakinoKF/...act-policy-v1 | 51,7 M | no aplica | Pick nut on scale (rebot_b601_follower) | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación genérica | habitualmente Apache 2.0 | Hub de Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | Manipulación visomotora | Apache 2.0 (implementación) | Hub de Hugging Face |
| SmolVLA (Hugging Face) | ~450 M | limitado | Manipulación con instrucciones en lenguaje | Apache 2.0 | Hub de Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con solo 36 episodios de una única tarea y un único robot, el policy está fuertemente sesgado hacia posiciones, iluminación y disposición de cámara del dataset original; generalizará mal a cambios de escena.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento, con posible colisión con objetos o con la báscula.
- Limitaciones de contexto e idioma: no procesa lenguaje natural; la tarea se fija en el prompt `pick the nut on the scale` y no hay soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; el despliegue en producción exige validación propia y cumplimiento de la normativa de seguridad robótica aplicable.
- Caveats para producción: no hay resultados de evaluación publicados, el repo tiene 0 descargas y 0 likes, y la fecha de creación (2026-11-10) indica que es un artefacto reciente y sin validación comunitaria. Requiere calibración específica del robot y de las cámaras, y los nombres de cámara deben coincidir exactamente con las claves de observación del entrenamiento.
- El modelo no incluye cuantizaciones ni formatos alternativos; solo se distribuyen pesos safetensors para la librería `lerobot`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_filtered_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_filtered
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_nut_on_scale_dataset_20261109_162558_filtered
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
