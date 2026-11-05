# Muhammad241198/act_M12_toolrem_60

## Resumen

`act_M12_toolrem_60` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario Muhammad241198 en Hugging Face y entrenada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación: desenroscar o retirar una herramienta o tuerca (identificada en el dataset como `m12-nut-tool_unfasten_nodepth`), a partir de observaciones visuales sin profundidad y de datos de teleoperación. No es un modelo de lenguaje: es un controlador visuomotor que mapea imágenes de cámara a secuencias cortas de acciones articulares.

El modelo tiene 51.644.039 parámetros y un repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware de consumo. Su relevancia es acotada pero práctica: sirve como referencia reproducible de un pipeline completo de LeRobot (entrenamiento, checkpoint y evaluación) para una tarea industrial de ensamblaje, y como base para comparar variantes del mismo autor (por ejemplo, la variante con profundidad frente a esta sin profundidad).

La ficha se basa exclusivamente en los metadatos y la model card disponibles; el autor no ha publicado detalles sobre composición del dataset, número de episodios, hiperparámetros ni resultados de evaluación, por lo que esos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parámetros totales | 51.644.039 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación y horizontes de acción definidos por la configuración de entrenamiento) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo visuomotor, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos ("chunks") de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. La arquitectura combina un codificador visual (procesa las imágenes de las cámaras del robot) con un transformer que modela la secuencia de estados y acciones, y un decodificador que emite el chunk de acciones. En esta variante concreta, las observaciones no incluyen mapa de profundidad (`nodepth`), de modo que la política depende únicamente de RGB.

El entrenamiento se realizó con LeRobot sobre el dataset `rbtrprjkt/m12-nut-tool_unfasten_nodepth`, compuesto por demostraciones teleoperadas de la tarea de desenroscado o retirada de una tuerca/herramienta M12. No se especifican en la información disponible el número de episodios, la composición exacta del dataset, el número de tokens o pasos de entrenamiento, ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se documentan innovaciones más allá del propio mecanismo de action chunking del paper original (arXiv:2304.13705).

## Capacidades

- Control visuomotor de manipulación robótica: genera secuencias de acciones articulares a partir de imágenes RGB, sin entrada de profundidad.
- Ejecución de una tarea específica de ensamblaje: desenroscar o retirar una tuerca/herramienta M12 en un entorno de laboratorio o banco de pruebas.
- Aprendizaje por imitación a partir de teleoperación: reproduce comportamientos demostrados, no requiere recompensa explícita.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record` sobre robots compatibles (la model card cita `so100_follower`).
- Predicción por chunks de acciones: emite varias acciones por inferencia, lo que favorece la suavidad y la frecuencia de control.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo "thinking": es una política robótica especializada, no un modelo generativo de propósito general.

## Casos de uso

- Automatización de ensamblaje en banco de pruebas: el modelo ejecuta la secuencia de desenroscado de una tuerca M12 sobre un robot tipo SO-100, sustituyendo la teleoperación manual en ciclos repetitivos y permitiendo medir tasas de éxito por episodio con `lerobot-record`.
- Base para comparativas de ablación: al existir una variante con profundidad del mismo autor y tarea, este checkpoint sirve para cuantificar la contribución de la modalidad de profundidad en el éxito de la política, manteniendo el resto del pipeline constante.
- Prototipado rápido de políticas de imitación: con 51,6 M de parámetros y 0,2 GB de pesos, el modelo se entrena y evalúa en horas en una GPU de consumo, lo que lo hace útil como plantilla para nuevos datasets de tareas similares.
- Investigación en manipulación sin profundidad: permite estudiar hasta qué punto la información RGB es suficiente para tareas de precisión con roscas, un caso relevante cuando no se dispone de cámaras de profundidad calibradas.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos reproducibles de entrenamiento y evaluación, lo que facilita montar prácticas sobre LeRobot con una tarea industrial realista.
- Validación de pipelines de datos teleoperados: sirve para comprobar la calidad de un dataset (episodios, sincronización de cámaras, acciones) antes de escalar a políticas mayores o a tareas más complejas.
- Integración en celdas de fabricación flexibles: como política ligera, puede desplegarse en el propio robot o en un PC cercano con GPU modesta, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, comparaciones con la variante con profundidad ni métricas de error de seguimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión de entrenamiento (51,6 M de parámetros en safetensors, repositorio de 0,2 GB); el consumo real dependerá del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; para entrenamiento se recomienda al menos una RTX 3060/4060 o superior, y para evaluación basta una GPU de gama baja o incluso CPU con latencia mayor.
- Cabe en GPU de consumo: sí, en toda la gama RTX y en muchas GPUs integradas para inferencia por lotes pequeños.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y safetensors; no se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el tamaño del chunk de acciones configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modalidad | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Muhammad241198/act_M12_toolrem_60` | 51,6 M | RGB sin profundidad | Desenroscado de tuerca M12 | Apache 2.0 | Hugging Face (LeRobot) |
| Variante con profundidad del mismo autor y tarea | no disponible | RGB + profundidad | Misma tarea | Apache 2.0 (presumible por el ecosistema) | no confirmada en la información disponible |
| Políticas ACT genéricas de LeRobot (p. ej. Aloha, pusht) | del orden de decenas de millones | RGB (y estado) | Manipulación diversa | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia de imitación) | variable, mayor en general | RGB (+ profundidad opcional) | Manipulación diversa | MIT/Apache según implementación | Repositorios públicos |

La comparación cuantitativa de rendimiento no está disponible: no hay métricas publicadas para este checkpoint ni para la variante con profundidad en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único montaje; no generaliza a otras tuercas, orientaciones o entornos sin reentrenamiento.
- Dependencia del dataset: al no documentarse el número de episodios ni la variabilidad de las demostraciones, se desconoce su robustez ante cambios de iluminación, posición de cámara o fondo.
- Ausencia de profundidad: la falta de mapa de profundidad puede degradar la precisión en tareas de roscado donde la estimación de distancia es crítica; la comparación con la variante con profundidad no está publicada.
- Riesgo de sobreajuste a la configuración de hardware: el comportamiento depende del robot, las cámaras y la calibración usados en la teleoperación; cambios en la cinemática o en la cámara pueden invalidar la política.
- Sin datos de evaluación: no hay tasas de éxito publicadas, por lo que no puede afirmarse su fiabilidad en producción sin una evaluación propia.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en entornos reales recae en el integrador.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no debe presentarse como un modelo de propósito general ni usarse para tareas fuera del control robótico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_M12_toolrem_60
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/m12-nut-tool_unfasten_nodepth
