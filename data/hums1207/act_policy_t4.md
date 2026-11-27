# hums1207/act_policy_T4

## Resumen

`hums1207/act_policy_T4` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), el método presentado en el artículo arXiv 2304.13705 y empaquetado mediante la librería LeRobot de Hugging Face. El modelo predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele lograr tasas de éxito altas en tareas de manipulación aprendidas a partir de datos de teleoperación.

Se trata de un checkpoint pequeño (51.670.663 parámetros, repo de 0,2 GB) entrenado para un robot concreto, el `so102_follower`, con una única cámara de muñeca (`cam_wrist`) a resolución 640x480. Consume un vector de estado de 7 dimensiones y produce un vector de acción de 7 dimensiones, lo que lo ata a una morfología y configuración de hardware específicas.

Es relevante ahora porque ejemplifica el flujo actual de robótica open source: entrenamiento reproducible con LeRobot 0.6.0, publicación del dataset junto al policy y licencia Apache-2.0. No obstante, es un artefacto experimental de un autor individual, sin resultados de evaluación publicados ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica mediante la etiqueta `rerobot_picking`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo LeRobot) |

## Arquitectura y entrenamiento

ACT combina un codificador de imágenes (procesa `observation.images.cam_wrist`, tensor de 3x480x640) con un codificador del estado proprioceptivo (`observation.state`, vector de 7 dimensiones) y un transformer que decodifica secuencias de acciones. La innovación central del método es predecir chunks de acciones con un horizonte temporal corto, lo que estabiliza el control frente al ruido de las demostraciones humanas y mitiga el problema de la varianza en la composición de políticas. La salida es un vector `action` de 7 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.6.0 durante 30.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000. El dataset `hums1207/phsyical_AI_20261121_162707` contiene 45 episodios, 50.933 frames a 30 FPS, y una única tarea etiquetada como "rerobot_picking". No se documenta el número de tokens ni composición de datos adicional, ni si hubo fases de RLHF o DPO (no aplicables a este tipo de política de imitación). No se especifica si se empleó decodificación especulativa ni técnicas de atención lineal.

## Capacidades

- Generación de comandos de control robótico: predice acciones de 7 dimensiones a partir de estado y una imagen de muñeca.
- Aprendizaje por imitación a partir de teleoperación: reproduce la tarea "rerobot_picking" sobre un robot `so102_follower`.
- Control en bucle cerrado a 30 FPS, coherente con la frecuencia del dataset de entrenamiento.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; su "razonamiento" es la predicción de chunks de acción.
- Capacidades multilingües no aplicables.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la imagen de muñeca de entrada.

## Casos de uso

- Automatización de picking en laboratorio: el modelo ejecuta la tarea "rerobot_picking" sobre el robot `so102_follower` con la cámara `cam_wrist`, adecuado para reproducir demostraciones grabadas en el mismo entorno y con el mismo hardware.
- Reproducción de experimentos de investigación: sirve como checkpoint de referencia para comparar variantes de ACT, ajustes de hiperparámetros o cambios en el dataset, dado que se publican dataset, configuración y semilla.
- Base para fine-tuning con nuevos datos: al estar en formato LeRobot y licencia Apache-2.0, puede reentrenarse con `lerobot-train` sobre datasets propios del mismo robot y tarea.
- Docencia y formación en robótica de imitación: permite ilustrar el flujo completo grabar datos, entrenar con ACT, desplegar con `lerobot-rollout` y evaluar.
- Benchmark interno de pipelines de control: útil para medir latencia de inferencia y throughput en el hardware objetivo antes de escalar a tareas más complejas.
- Prototipado de habilidades de manipulación en un solo brazo: la salida de 7 dimensiones encaja con configuraciones tipo brazo de 6 GDL más pinza, útil para validar la viabilidad de una tarea antes de invertir en más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM efectiva vendrá dominada por el codificador visual y los buffers de activación, no por los pesos.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con CUDA capaz de ejecutar LeRobot debería bastar; una RTX 4090 o superior ofrece margen amplio, y una GPU de gama media tipo RTX 3060/4060 es probablemente suficiente para inferencia en tiempo real a 30 FPS.
- Cabe en GPU consumer: sí, por tamaño de parámetros; la latencia real a 30 FPS no está documentada y debe medirse en el hardware objetivo.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (documentado en la model card); entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hums1207/act_policy_T4` | 51,67 M | no aplica | Manipulación robótica (ACT, tarea única) | Apache-2.0 | Hugging Face, 0 descargas |
| ACT (implementación de referencia LeRobot) | no disponible | no aplica | Manipulación robótica genérica | Apache-2.0 | Hugging Face / GitHub |
| Diffusion Policy (referencia) | no disponible | no aplica | Manipulación robótica (difusión de acciones) | no disponible en la información | Repos de investigación |
| VQ-BeT / otras políticas de imitación | no disponible | no aplica | Manipulación robótica | no disponible en la información | Repos de investigación |

No se dispone de métricas comparativas de éxito ni de parámetros de los modelos alternativos en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: se desconoce la tasa de éxito de la tarea "rerobot_picking".
- Sesgos conocidos: no documentados; en políticas de imitación es habitual el sobreajuste a posiciones, iluminación y objetos vistos en las 45 demostraciones.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitación de contexto e idioma: no procesa lenguaje; la tarea se fija con la etiqueta "rerobot_picking" y el modelo está atado al robot `so102_follower` y a la cámara `cam_wrist`.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción requiere validación propia.
- Caveats para producción: 45 episodios y 50.933 frames es un dataset pequeño; el modelo no debe usarse en entornos con personas sin medidas de seguridad; la reproducibilidad depende de la versión de LeRobot (0.6.0) y de la configuración exacta de hardware.
- Repo con 0 descargas y 0 likes: sin validación comunitaria; tratar como artefacto experimental.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/hums1207/act_policy_T4
- Dataset de entrenamiento: https://huggingface.co/datasets/hums1207/phsyical_AI_20261121_162707
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hums1207/phsyical_AI_20261121_162707
- Artículo ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
