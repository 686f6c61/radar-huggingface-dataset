# SamerAyyad/VLA_Samer_26.11.2026_100eps_policy_XVLA

## Resumen

XVLA_Samer_26.11.2026_100eps_policy_XVLA es un modelo Vision-Language-Action (VLA) de robótica, resultado del ajuste fino del modelo base lerobot/xvla-base sobre un conjunto de datos propio de 100 episodios. Lo publica el usuario SamerAyyad en el Hub de Hugging Face, entrenado y empaquetado con la librería LeRobot (versión 0.6.2). El modelo está especializado en una única tarea de manipulación con un brazo UR5: recoger una CPU con una ventosa y depositarla en una caja.

La arquitectura subyacente, X-VLA, se describe como un framework de flow-matching con soft prompts: cada configuración de robot o hardware se trata como una "tarea" codificada mediante un pequeño conjunto de embeddings de soft prompt aprendibles, lo que permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos. El modelo ajustado cuenta con 879.687.256 parámetros (unos 880 millones) y un repositorio de 1,8 GB en formato safetensors.

Es relevante como ejemplo práctico de ajuste fino de políticas robóticas de código abierto con licencia Apache 2.0, útil para quienes trabajan en imitation learning con LeRobot y quieren evaluar el flujo completo de entrenamiento, despliegue y rollout sobre hardware real. No obstante, es un modelo de nicho, sin métricas de evaluación publicadas y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (Vision-Language-Action con soft prompts y flow-matching) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en X-VLA, un framework VLA de flow-matching con soft prompts. La idea central es que cada robot o configuración de hardware se representa como una "tarea" mediante un conjunto reducido de embeddings de soft prompt aprendibles, lo que permite que un único modelo maneje morfologías, sensores y espacios de acción heterogéneos. El modelo parte del checkpoint preentrenado lerobot/xvla-base y se ajusta de forma supervisada (imitation learning) sobre el dataset SamerAyyad/VLA_Samer_26.11.2026_100eps.

El entrenamiento empleó 20.000 pasos con un tamaño de lote de 8, optimizador xvla-adamw, tasa de aprendizaje 0,0001 y semilla 1000, todo gestionado con LeRobot 0.6.2. El dataset consta de 100 episodios y 67.696 fotogramas a 30 FPS para una sola tarea: "Pick up the CPU with the suction gripper and place it in the box". El robot es un UR5 con tres cámaras de entrada. No se documentan detalles sobre el número de tokens de entrenamiento en lenguaje, la composición del corpus de preentrenamiento de la base ni el uso de RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica: produce un vector de acción de dimensión 7 a partir de observaciones multimodales.
- Percepción visual multimodal: consume tres flujos de imagen (dos de 3×256×256 y uno de 3×224×224) además de un estado proprioceptivo de 8 dimensiones.
- Control de brazo robótico UR5 con ventosa para tareas de pick-and-place.
- Aprendizaje por imitación: reproduce la política aprendida de demostraciones humanas.
- Soporte de rollout en robot real mediante la CLI de LeRobot (`lerobot-rollout`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o lenguaje natural general.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la secuencia de recoger una CPU con ventosa y colocarla en una caja, replicando la tarea demostrada en los 100 episodios de entrenamiento.
- Prototipado rápido de políticas robóticas: sirve como plantilla para equipos que quieran validar el pipeline completo de LeRobot (grabación, entrenamiento y rollout) antes de escalar a tareas propias.
- Investigación en imitation learning: permite estudiar el comportamiento de X-VLA ajustado sobre un dataset pequeño y comparar con otras políticas base.
- Benchmark interno de hardware UR5: útil para medir latencia y fiabilidad de un brazo UR5 con cámaras en un entorno controlado antes de invertir en datasets mayores.
- Educación y formación en robótica: ejemplo reproducible de ajuste fino de un VLA con licencia permisiva para cursos y talleres.
- Base para ajuste adicional: al estar bajo Apache 2.0, puede servir como punto de partida para fine-tuning sobre tareas relacionadas de manipulación con ventosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 879,7 millones de parámetros en precisión completa (FP32) se requieren aproximadamente 3,5 GB solo para pesos, y en FP16/BF16 alrededor de 1,8 GB, más memoria para activaciones y los tres flujos de imagen.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con al menos 8-16 GB de VRAM debería ser suficiente para inferencia en precisión reducida.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas como RTX 3060/4060 (12-16 GB) o superiores, aunque el autor no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), que a su vez depende de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_26.11.2026_100eps_policy_XVLA | 879,7 M | no disponible | Pick-and-place UR5 | apache-2.0 | Hub HF |
| lerobot/xvla-base | no disponible | no disponible | VLA base multi-robot | no disponible en la informacion | Hub HF |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la informacion | no disponible | Imitation learning | no disponible en la informacion | Hub HF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una única tarea ("Pick up the CPU with the suction gripper and place it in the box") y un único robot (UR5), por lo que su generalización fuera de ese escenario es muy limitada.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, lo que impide valorar su fiabilidad en producción.
- Dataset pequeño: 100 episodios y 67.696 fotogramas son una base reducida para imitation learning, lo que aumenta el riesgo de sobreajuste y de fallos ante variaciones de posición, iluminación o distracciones.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar secuencias de acción no válidas ante observaciones fuera de distribución.
- Dependencia de hardware específico: requiere un UR5 con ventosa y tres cámaras configuradas con los nombres y resoluciones exactos del entrenamiento.
- Idiomas y sesgos: no se documentan sesgos conocidos ni cobertura idiomática; el modelo no procesa lenguaje natural general.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_26.11.2026_100eps_policy_XVLA
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_26.11.2026_100eps
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Guía LeRobot XVLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_26.11.2026_100eps
