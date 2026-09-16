# Jeonminjun/act_test_doll11_clean

## Resumen

`Jeonminjun/act_test_doll11_clean` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705 y empaquetado con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de observaciones del estado del robot y de tres cámaras, predice directamente comandos de acción de 6 dimensiones para un brazo robótico de tipo `omx_follower`.

El modelo tiene 51.668.614 parámetros (pesos en safetensors, repositorio de 0,2 GB) y está especializado en una única tarea: "Pick up Doll". Se entrenó con 59 episodios y 26.504 fotogramas grabados a 30 FPS sobre el conjunto de datos `Jeonminjun/test_doll11_clean`, durante 100.000 pasos con AdamW, batch de 8 y tasa de aprendizaje de 1e-05.

Su relevancia es la de un ejemplo reproducible y ligero del flujo completo de LeRobot: grabar datos teleoperados, entrenar una política ACT y desplegarla en hardware real con `lerobot-rollout`. Es, por tanto, material de referencia para investigación en manipulación robótica y para validar cadenas de inferencia en tiempo real, más que un modelo de propósito general. No se han publicado resultados de evaluación ni de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con codificador visual y decodificador de acciones; política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; ACT trabaja con observación actual y predicción de fragmentos de acción) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (política robótica; la tarea se fija con la cadena de texto "Pick up Doll") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | omx_follower |
| Entradas | observation.state (6,), observation.images.front (3, 480, 640), observation.images.front_depth (1, 480, 640), observation.images.wrist (3, 480, 640) |
| Salidas | action (6,) |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice fragmentos cortos de acciones (action chunks). El modelo combina un codificador de imágenes para las tres cámaras (`front`, `front_depth` y `wrist`), un codificador del estado propioceptivo de 6 dimensiones y un transformer que genera la secuencia de acciones de 6 dimensiones. Este esquema reduce el error de composición de la imitación y suele lograr tasas de éxito altas en tareas de manipulación aprendidas de datos teleoperados.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el conjunto `Jeonminjun/test_doll11_clean` (59 episodios, 26.504 fotogramas a 30 FPS, tarea "Pick up Doll"), durante 100.000 pasos, con batch de 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni fases de ajuste adicionales; tampoco se detalla la composición exacta del dataset más allá de sus métricas. El modelo se distribuye como un artefacto de prueba ("act_test"), lo que sugiere un uso experimental más que un despliegue en producción.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad a partir de observaciones multimodales (estado propioceptivo y tres cámaras).
- Percepción visual combinada RGB y profundidad: la cámara `front_depth` aporta un canal de profundidad de 480x640, además de las cámaras `front` y `wrist` en RGB.
- Predicción de fragmentos de acción (action chunking), orientada a movimientos suaves y coherentes en lugar de control paso a paso.
- Ejecución de una tarea concreta de recogida de objetos ("Pick up Doll") sobre un robot `omx_follower`.
- Control reactivo en bucle cerrado a 30 FPS, alineado con la frecuencia de grabación de los datos de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es una política de control, no un modelo generativo de texto.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural; la instrucción de tarea es una etiqueta fija asociada al dataset.
- No incluye modo de razonamiento ni salidas de audio o vídeo.

## Casos de uso

- Recogida automatizada de objetos: la política está entrenada específicamente para la tarea "Pick up Doll" sobre un brazo `omx_follower`, por lo que puede usarse directamente como controlador de esa tarea en el mismo montaje de robot y cámaras.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible del método ACT con LeRobot 0.6.2, permitiendo comparar hiperparámetros (pasos, batch, tasa de aprendizaje) frente a otros entrenamientos propios.
- Punto de partida para fine-tuning: al ser un artefacto de 51,7 millones de parámetros y 0,2 GB, se puede reentrenar o ajustar con datos propios de otra tarea de manipulación sin requerir infraestructura de gran escala.
- Validación de cadenas de teleoperación y despliegue: el comando `lerobot-rollout` con `--strategy.type=base` permite verificar que el robot, el puerto y las cámaras están correctamente configurados antes de grabar datos nuevos.
- Pruebas de percepción RGB-D en robótica: el uso simultáneo de cámaras frontal, frontal con profundidad y de muñeca permite evaluar cómo afecta cada fuente visual al éxito de la tarea.
- Evaluación comparativa de políticas en LeRobot: puede usarse como baseline ACT frente a otras políticas de la misma librería (por ejemplo, Diffusion Policy) sobre el mismo robot `omx_follower` y el mismo dataset.
- Docencia y demostraciones: al ser un modelo pequeño y de licencia permisiva, es adecuado para prácticas de robótica en las que se muestre el ciclo completo de grabación, entrenamiento y despliegue.
- Automatización de tareas repetitivas de pick-and-place en laboratorio, siempre que el objeto y las condiciones de iluminación y posición se mantengan dentro de la distribución de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"), y no incluye tabla de tareas, número de ensayos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: los 51.668.614 parámetros ocupan aproximadamente 0,2 GB en precisión de 32 bits, por lo que el modelo es muy ligero; la mayor parte del consumo proviene del procesamiento de las tres cámaras a 480x640 (dos RGB y un canal de profundidad).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; para entrenamiento e inferencia cómodos se recomiendan RTX 3060/4060 o superiores, y RTX 4090, A100 o H100 para entrenamientos más largos o varias réplicas.
- Cabe en GPU de consumo: sí, con margen amplio. Una GPU de gama media permite ejecutar la política en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento) sobre PyTorch; el repositorio usa el formato safetensors y la librería `lerobot`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a una política de control robótico.
- Latencia y throughput estimados: no disponibles. El sistema debe sostener el bucle de control a 30 FPS para coincidir con la frecuencia de los datos de entrenamiento, pero no se publican mediciones de latencia ni de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeonminjun/act_test_doll11_clean | ACT (imitación, robot omx_follower) | 51.668.614 | no aplica | apache-2.0 | Hugging Face, via LeRobot |
| Diffusion Policy | Política de imitación basada en modelos de difusión | no disponible | no aplica | no disponible | soportada por LeRobot |
| SmolVLA | Política visión-lenguaje-acción | no disponible | no disponible | no disponible | soportada por LeRobot |
| pi0 | Política visión-lenguaje-acción | no disponible | no disponible | no disponible | soportada por LeRobot |

Los tres modelos alternativos pertenecen a la misma categoría funcional (políticas de control robótico entrenadas con datos teleoperados y ejecutables desde LeRobot), pero no se dispone en la información proporcionada de sus cifras de parámetros, licencias ni resultados de evaluación, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Pick up Doll" sobre un robot `omx_follower`; fuera de ese objeto, ese brazo y esa disposición de cámaras, no se puede esperar un comportamiento válido.
- Sensibilidad al dominio: no se documenta la variabilidad de posiciones, iluminación o distractores presente en el dataset, de modo que cambios en el entorno de despliegue pueden degradar el éxito de la tarea.
- Ausencia de evaluación: no hay tasas de éxito publicadas, por lo que no existe evidencia medida de su rendimiento en el robot real.
- Riesgo de fallo silencioso: al ser una política de imitación sin componente de razonamiento, puede ejecutar acciones plausibles pero incorrectas ante entradas fuera de distribución, sin señal de error explícita.
- Dependencia del hardware exacto: las claves de observación esperadas (`observation.images.front`, `observation.images.front_depth`, `observation.images.wrist`, `observation.state`) deben coincidir con las cámaras y el orden configurados; un desajuste invalida la inferencia.
- Datos de entrenamiento limitados: 59 episodios y 26.504 fotogramas constituyen un conjunto pequeño, lo que reduce la generalización frente a variaciones no vistas.
- Licencia: apache-2.0, permisiva y compatible con uso comercial, pero se recomienda citar el método ACT (arXiv:2304.13705) y LeRobot según indica el propio autor.
- Artefacto de prueba: el nombre del repositorio ("act_test") y la ausencia de descargas y likes sugieren que se trata de un experimento personal, no de un modelo validado para producción.
- Idiomas: no aplica; no hay interfaz de lenguaje natural más allá de la etiqueta de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeonminjun/act_test_doll11_clean
- Dataset de entrenamiento: https://huggingface.co/datasets/Jeonminjun/test_doll11_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jeonminjun/test_doll11_clean
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los únicos enlaces verificables proceden de la model card y de la documentación de LeRobot.
