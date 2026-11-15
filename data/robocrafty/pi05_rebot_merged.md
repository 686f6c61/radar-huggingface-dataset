# RoboCrafty/pi05_rebot_merged

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence para generalización en entornos abiertos, es decir, para operar en situaciones y entornos no vistos durante el entrenamiento. Esta ficha concreta, `RoboCrafty/pi05_rebot_merged`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado por el usuario RoboCrafty mediante la librería LeRobot, especializado en tareas de manipulación robótica de tipo pick-and-place sobre un robot `rebot_b601_follower`.

El modelo consume observaciones multimodales (estado de las articulaciones y tres cámaras: `front_wide`, `gripper` y `high_oblique`) y produce acciones de 7 dimensiones. Con 4.143.404.816 parámetros totales (aproximadamente 4,1 mil millones), se distribuye en formato safetensors con un tamaño de repositorio de 9,4 GB. La licencia es Apache 2.0, lo que facilita su uso comercial y su modificación.

Su relevancia radica en que ejemplifica el flujo actual de fine-tuning de políticas VLA preentrenadas para tareas robóticas concretas: partir de un modelo base con capacidades generales de percepción y razonamiento visual, y adaptarlo con un dataset pequeño (127 episodios, 77.631 frames) para una tarea específica. No obstante, al tratarse de un ajuste fino muy especializado y sin resultados de evaluación publicados, debe considerarse un artefacto experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (≈4,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅, un modelo VLA que combina un backbone de visión-lenguaje con un cabezal de acciones para control robótico. La implementación incluida en este repositorio procede de LeRobot, que a su vez adapta el código de OpenPI de Physical Intelligence. El modelo recibe como entrada el estado del robot (`observation.state`, vector de 7 dimensiones) y tres flujos de imagen RGB de resolución 360×640 (`front_wide`, `gripper`, `high_oblique`), y emite un vector de acción de 7 dimensiones. No se detalla en la información disponible la composición interna de capas, el mecanismo de atención ni el número de tokens de contexto.

El ajuste fino se realizó sobre el dataset `RoboCrafty/rebot_sort_merged`, compuesto por 127 episodios y 77.631 frames a 30 FPS, con tres tareas de recogida y depósito en un contenedor designado (botella, toalla y llave). La configuración de entrenamiento indica 8.000 pasos, batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. No se especifica si hubo RLHF, DPO ni otras fases de alineamiento posteriores; tampoco se detalla la composición del dataset de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un robot `rebot_b601_follower` a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente tres cámaras (vista frontal amplia, pinza y vista oblicua elevada) a 360×640.
- Ejecución de tareas pick-and-place: entrenado específicamente para "pick up the bottle and put it in the designated bin", "pick up the towel and put it in the designated bin" y "pick up the key and put it in the designated bin".
- Generalización a entornos abiertos (según la descripción de π₀.₅): el modelo base está diseñado para generalizar a situaciones no vistas, aunque no hay evidencia publicada de que este ajuste fino conserve esa propiedad.
- Integración con LeRobot: soporta los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto general, matemáticas ni audio para esta variante.

## Casos de uso

- Clasificación automatizada de objetos en líneas de montaje: el modelo puede recoger botellas, toallas o llaves y depositarlas en un contenedor designado, usando las tres cámaras para localizar el objeto y la pinza. Es adecuado porque fue entrenado exactamente para esas tres tareas con 127 episodios reales.
- Prototipado de políticas VLA en investigación: sirve como punto de partida para estudiar cómo un modelo base de 4,1 B parámetros se adapta con datasets pequeños; útil para comparar estrategias de fine-tuning en laboratorios con robots `rebot_b601_follower`.
- Demostraciones de manipulación en ferias o entornos educativos: con `lerobot-rollout` y `--strategy.type=base` se puede ejecutar la política en tiempo real durante 60 segundos o de forma indefinida, lo que facilita demos reproducibles.
- Generación de datos sintéticos o aumento de dataset: al ejecutar la política sobre el robot se pueden grabar episodios adicionales que alimenten futuros entrenamientos, ya que el flujo de LeRobot permite registrar episodios si se omite `--strategy.type=base`.
- Benchmark interno de infraestructura robótica: permite medir latencia, throughput y estabilidad de un pipeline VLA de 4,1 B parámetros sobre hardware concreto antes de invertir en modelos mayores.
- Base para ajustes finos en tareas similares: equipos con un robot de la misma familia pueden reutilizar este checkpoint como inicialización en lugar de partir de `lerobot/pi05_base`, reduciendo pasos de entrenamiento si la tarea es de clasificación de objetos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas de robótica (success rate, throughput, latencia) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,1 B parámetros en fp16 requiere aproximadamente 8,3 GB solo para pesos, más memoria para activaciones y buffers de imagen; en fp32 ascendería a unos 16,6 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de 16-24 GB (RTX 4090, A5000, L4) en fp16, y en A100/H100 para entrenamiento o mayor throughput, pero no hay confirmación oficial.
- ¿Cabe en consumer GPU? Probablemente sí en GPUs de 24 GB (RTX 3090/4090) en fp16, según el cálculo de pesos; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.path` y `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboCrafty/pi05_rebot_merged` | ≈4,1 B | no disponible | VLA pick-and-place sobre `rebot_b601_follower` | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/pi05_base` | no disponible en la información | no disponible | VLA base π₀.₅ para fine-tuning | no disponible en la información | Hugging Face |
| Políticas LeRobot tipo ACT/Diffusion | no disponible | no disponible | Imitación robótica | según checkpoint | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Dataset muy pequeño y específico: 127 episodios y tres tareas concretas limitan la generalización; es probable que falle ante objetos, posiciones o iluminaciones distintas a las del dataset.
- Dependencia de hardware concreto: entrenado para el robot `rebot_b601_follower` y cámaras con nombres y resoluciones específicas (`front_wide`, `gripper`, `high_oblique` a 360×640); no es portable directamente a otros robots sin reentrenamiento.
- Riesgo de sobreajuste: 8.000 pasos sobre 127 episodios puede producir sobreajuste al entorno de recogida de datos.
- Idiomas: no aplica como modelo de texto; no se documentan capacidades lingüísticas generales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base `lerobot/pi05_base` y del código OpenPI subyacente.
- Sesgos: no documentados; en robótica los sesgos se manifiestan como preferencias por posiciones, colores u objetos presentes en el dataset.
- Alucinación: en un modelo de acción se traduce en movimientos erráticos o intentos de agarre sobre objetos inexistentes; no hay métricas para cuantificarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/pi05_rebot_merged
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/rebot_sort_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/rebot_sort_merged
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
