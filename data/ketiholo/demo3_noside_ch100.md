# ketiholo/demo3_noside_ch100

## Resumen

`ketiholo/demo3_noside_ch100` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso de control, el modelo predice fragmentos cortos de acciones (action chunks), lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación aprendidas a partir de demostraciones teleoperadas. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de referencia de Hugging Face para aprendizaje por imitación en robótica.

Se trata de un modelo compacto, con 51.670.663 parámetros en formato safetensors y un repositorio de aproximadamente 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en hardware de consumo. La política está asociada al dataset `ketiholo/demo3` y parece orientada a un robot tipo SO-100 (el ejemplo de evaluación de la model card usa `robot.type=so100_follower`), aunque la model card no detalla la tarea concreta ni la configuración física del robot.

Su relevancia actual radica en que ejemplifica el flujo completo de LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y publicación del checkpoint en el Hub. Es un artefacto útil para desarrolladores que quieran reproducir o adaptar una política ACT a un brazo robótico de bajo coste, más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; LeRobot no documenta cuantizaciones en esta model card) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación supervisado que combina un backbone transformer con un esquema de predicción por chunks: el modelo observa imágenes de la cámara y el estado de las articulaciones, y emite un bloque de acciones futuras en lugar de una sola acción. Esta formulación reduce el error de compounding y suaviza la política, lo que se traduce en tasas de éxito más altas en tareas de manipulación con datos teleoperados. El paper original (Zhao et al., 2023) introduce además una técnica de temporal ensembling para agregar predicciones solapadas entre chunks.

La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset `ketiholo/demo3`, ni si se aplicaron fases de RLHF o DPO (poco habituales en políticas de imitación robótica). Tampoco se detalla la resolución de las cámaras de entrada, el número de episodios de demostración ni la configuración del robot. El sufijo `ch100` del identificador sugiere un tamaño de chunk de 100 pasos, pero este dato no está confirmado en la documentación proporcionada.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y del estado del robot.
- Predicción por chunks de acciones, orientada a tareas de manipulación de corta duración.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación/ejecución con `lerobot-record`.
- Compatible con el robot `so100_follower` según el ejemplo de la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, visión general, audio ni modo de razonamiento.
- No se documentan capacidades de generalización a objetos o entornos no vistos.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para validar el pipeline de LeRobot con ACT sobre el dataset `demo3`, comparando tasas de éxito antes y después de reentrenar.
- Manipulación de precisión con brazo SO-100: la política puede desplegarse en un `so100_follower` para ejecutar la tarea teleoperada original, aprovechando la predicción por chunks para suavizar el control.
- Base para fine-tuning en tareas nuevas: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es viable reentrenarlo con un dataset propio de pocas horas de demostraciones.
- Prototipado rápido en laboratorio: el tamaño del repositorio (0,2 GB) permite clonarlo y ejecutarlo en estaciones de trabajo con una sola GPU consumer, sin infraestructura dedicada.
- Docencia y formación en robótica de imitación: el par modelo+dataset constituye un ejemplo completo y reproducible del ciclo entrenamiento-evaluación de ACT.
- Evaluación comparativa de políticas: puede usarse como línea base frente a otras políticas de LeRobot (Diffusion Policy, VQ-BeT, etc.) en el mismo entorno y dataset.
- Integración en pipelines de investigación: exportable como checkpoint para experimentos de ensembling temporal o de chunking alternativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas sobre el dataset `ketiholo/demo3`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros, más el coste de las activaciones y del codificador visual; en la práctica, cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM; también es viable en CPU para pruebas no realtime.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. Dependen del robot, de la frecuencia de control y del hardware; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ketiholo/demo3_noside_ch100` (ACT) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | MIT (implementación LeRobot) | Hugging Face / GitHub |
| VQ-BeT (LeRobot) | no disponible | no disponible | no disponible | MIT (implementación LeRobot) | Hugging Face / GitHub |
| ACT original (paper) | no disponible | no disponible | tasas de éxito reportadas en el paper, no comparables directamente | código de referencia público | GitHub |

No se dispone de datos de rendimiento del modelo evaluado ni de comparaciones controladas con las alternativas en el mismo dataset, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de tarea: entrenado sobre el dataset `ketiholo/demo3`; no se documenta su generalización a otros objetos, posiciones o entornos.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones reproducibles en la model card, lo que impide estimar su fiabilidad en producción.
- Dependencia del hardware: el comportamiento está ligado a la configuración del robot y de las cámaras usadas durante la teleoperación; cambios en la cinemática o en la calibración pueden degradar el rendimiento.
- Riesgo de sobreajuste a las demostraciones: al ser un modelo pequeño entrenado con un dataset concreto, es probable que falle ante variaciones no presentes en los datos.
- Idiomas y texto: no aplica; no es un modelo lingüístico y no debe usarse para tareas de NLP.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset `ketiholo/demo3` por separado.
- Fecha de creación futura en los metadatos (2026-10-30): conviene verificar la integridad y procedencia del repositorio antes de usarlo en entornos críticos.
- Sin información sobre sesgos: al ser un modelo robótico, los sesgos relevantes serían los del dataset de demostración (posiciones, objetos, iluminación), no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo3_noside_ch100
- Dataset asociado: https://huggingface.co/datasets/ketiholo/demo3
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
