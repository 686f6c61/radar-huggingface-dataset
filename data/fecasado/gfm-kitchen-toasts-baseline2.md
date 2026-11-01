# fecasado/gfm-kitchen-toasts-baseline2

## Resumen

`gfm-kitchen-toasts-baseline2` es una política robótica (policy) entrenada con LeRobot y publicada en HuggingFace por el usuario `fecasado`. No es un modelo de lenguaje: es un modelo de control visuomotor que mapea observaciones (imágenes de cámara y estado del robot) a acciones de un brazo robótico, en este caso para la tarea concreta de manipular tostadas en una cocina. Su nombre interno de arquitectura es `gaze_flow_matching`, según los metadatos de la model card.

El modelo tiene 75.216.858 parámetros (unos 75,2 M) almacenados en safetensors, con un repositorio de 0,3 GB, y se distribuye bajo licencia Apache 2.0. Está entrenado sobre el dataset `fecasado/toasts-to-plate-320x240`, que sugiere observaciones de 320x240 píxeles. Es relevante como ejemplo de política de imitación ligera y reproducible dentro del ecosistema LeRobot, útil para quien quiera evaluar pipelines de aprendizaje por imitación en robots de bajo coste.

La información pública disponible es muy limitada: la model card es prácticamente la plantilla por defecto de LeRobot, sin detalle de arquitectura, datos de entrenamiento ni resultados. Esta ficha se limita a lo que se puede inferir de los metadatos y del contexto del ecosistema LeRobot, marcando explícitamente como no disponible todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gaze_flow_matching` (política visuomotora para robótica; detalles internos no disponibles) |
| Parámetros totales | 75.216.858 (~75,2 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La etiqueta `gaze_flow_matching` indica una política basada en *flow matching* aplicada a la predicción de acciones, probablemente condicionada por observaciones visuales ("gaze" sugiere atención sobre regiones de la imagen). No se dispone de documentación del autor sobre la arquitectura exacta: número de capas, tipo de encoder visual, dimensión del estado de acción ni mecanismo de atención. El tamaño de 75,2 M de parámetros es coherente con políticas de imitación ligeras del ecosistema LeRobot, que suelen combinar un backbone visual compacto con un cabezal de acciones.

El entrenamiento se realizó con `lerobot-train` sobre el dataset `fecasado/toasts-to-plate-320x240`, que por su nombre corresponde a episodios de demostración de una tarea de trasvase de tostadas a un plato con imágenes de 320x240. La model card no especifica número de episodios, número de tokens/pasos, composición del dataset, ni si hubo aumento de datos. Tampoco se documenta ningún proceso de RLHF, DPO o refinamiento posterior: se trata de aprendizaje por imitación supervisado a partir de demostraciones. El sufijo `baseline2` sugiere que es la segunda iteración de una línea base de experimentación.

## Capacidades

- Control visuomotor: genera acciones de robot (típicamente posición articular o del efector final) a partir de observaciones de imagen y estado del robot.
- Aprendizaje por imitación: reproduce la tarea demostrada en el dataset de entrenamiento (manipulación de tostadas hacia un plato).
- Integración con LeRobot: compatible con `lerobot-record` para evaluación y con los formatos de checkpoint del ecosistema.
- Inferencia en tiempo real sobre GPU CUDA (el ejemplo de la model card usa `--policy.device=cuda`).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- Generalización limitada a la distribución del dataset de entrenamiento; no se documenta capacidad de transferencia a otras tareas.

## Casos de uso

- Evaluación de pipelines de imitación en LeRobot: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (`baseline2`) sobre la misma tarea y dataset, midiendo tasa de éxito en `lerobot-record`.
- Reproducción de experimentos académicos: al estar en safetensors y con licencia Apache 2.0, se puede cargar y evaluar sin restricciones para replicar resultados de flow matching en robótica.
- Prototipado de manipulación de alimentos en laboratorio: la política está entrenada específicamente para mover tostadas a un plato, un caso representativo de pick-and-place con objetos deformables o ligeros.
- Base para *fine-tuning* en tareas similares: sus ~75 M de parámetros permiten reentrenar o adaptar la política a nuevos datasets de manipulación con recursos modestos.
- Benchmark interno de infraestructura: útil para medir latencia y throughput de inferencia de políticas LeRobot en distintas GPUs antes de escalar a modelos mayores.
- Docencia y divulgación: ejemplo compacto y descargable (0,3 GB) para explicar el flujo completo de entrenamiento y evaluación de una política robótica con LeRobot.
- Integración en robots de bajo coste tipo SO-100/SO-101: el ejemplo de evaluación de la model card usa `so100_follower`, lo que sugiere compatibilidad con esa plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~75,2 M de parámetros en FP32 los pesos ocupan aproximadamente 0,3 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más (RTX 3050, GTX 1650, etc.).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; para entrenamiento se recomienda al menos 8-12 GB (RTX 3060/4070 o superior) por el coste de procesar lotes de imágenes.
- Cabe en GPU consumer: sí, sin problema, incluidas GPUs de portátil de gama media.
- Opciones de despliegue: `lerobot-record` con `--policy.path` apuntando al checkpoint; también es posible cargar los safetensors con PyTorch directamente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependerá del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gfm-kitchen-toasts-baseline2` | ~75,2 M | no aplica | Manipulación de tostadas (LeRobot) | Apache 2.0 | HuggingFace |
| Políticas ACT de LeRobot (referencia del ecosistema) | variable, típicamente decenas de M | no aplica | Imitación visuomotora genérica | Apache 2.0 (LeRobot) | HuggingFace / GitHub |
| Políticas Diffusion Policy (referencia del ecosistema) | variable | no aplica | Imitación visuomotora genérica | según implementación | Repos académicos |

No se dispone de datos de rendimiento de este modelo ni de comparaciones directas publicadas por el autor, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación mínima: la model card es la plantilla por defecto de LeRobot y no describe arquitectura, datos ni evaluación; cualquier uso en producción exige validación propia.
- Sesgo de dominio: entrenado exclusivamente con el dataset `toasts-to-plate-320x240`; probablemente falla fuera de esa distribución (iluminación, posición de cámara, objetos distintos).
- Riesgo de sobreajuste a las demostraciones: al ser una línea base (`baseline2`) con pocos datos documentados, la generalización es incierta.
- Sin métricas de seguridad: no hay información sobre comportamiento ante fallos, colisiones o recuperación de errores.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar las dependencias de LeRobot y del dataset.
- No apto para tareas de lenguaje, razonamiento o visión general: es un modelo de control específico.
- Fecha de creación en el Hub (2026-10-26) y solo 29 descargas: ecosistema de validación muy reducido, sin evidencia de uso en terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-kitchen-toasts-baseline2
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/toasts-to-plate-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
