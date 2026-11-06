# fecasado/giava-kitchen-lettuce-multi

## Resumen

Giava-kitchen-lettuce-multi es una política robótica (policy) entrenada para controlar un brazo robótico en una tarea concreta de manipulación: trasladar lechuga a un plato en un entorno de cocina. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un modelo de imitación (imitation learning) para robótica, desarrollado por el usuario fecasado y publicado en Hugging Face bajo la librería LeRobot de Hugging Face. La arquitectura declarada es `gaze_flow_matching`, una variante de flow matching aplicada a la generación de acciones condicionada por observaciones visuales y posiblemente por la mirada (gaze) del operador.

El modelo tiene 235.899.950 parámetros (aproximadamente 236 millones) y un tamaño de repositorio de 0,9 GB en formato safetensors. Está entrenado sobre el dataset `fecasado/lettuce-to-plate-320x240`, que sugiere observaciones visuales de resolución 320x240 píxeles, y está pensado para ejecutarse con el stack LeRobot, que proporciona utilidades de entrenamiento, evaluación y despliegue en robots como el SO-100 follower.

Su relevancia actual radica en que ejemplifica el flujo de trabajo moderno de robótica de imitación de código abierto: un dataset pequeño, una política entrenada con LeRobot, licencia Apache 2.0 y pesos publicados en safetensors, lo que facilita la reproducibilidad y la experimentación por parte de desarrolladores e investigadores sin necesidad de infraestructura propietaria. No obstante, la información pública disponible es muy limitada: la model card es una plantilla sin rellenar y no se han publicado benchmarks ni detalles de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (flow matching para políticas robóticas, según el campo `model_name` de la model card) |
| Parámetros totales | 235.899.950 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea es de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura declarada es `gaze_flow_matching`, una política de imitación basada en flow matching. Este tipo de modelos genera trayectorias de acciones muestreando un campo de flujo aprendido que transforma una distribución simple (por ejemplo, ruido gaussiano) en la distribución de acciones expertas condicionada por las observaciones. El término "gaze" sugiere que la política puede incorporar información de la mirada del operador humano como señal adicional de condicionamiento, aunque la model card no detalla cómo se integra esta señal ni qué codificadores visuales se emplean.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en políticas robóticas de imitación). El dataset asociado, `fecasado/lettuce-to-plate-320x240`, indica observaciones de 320x240 píxeles, pero se desconoce el número de episodios, la frecuencia de control, el tipo de robot exacto y las dimensiones del espacio de acciones. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia elección de flow matching frente a alternativas como ACT o diffusion policy.

## Capacidades

- Control robótico de manipulación: genera acciones motrices para un brazo robótico orientadas a la tarea de trasladar lechuga a un plato.
- Imitación de demostraciones humanas: entrenado a partir de un dataset de episodios de teleoperación (formato LeRobot).
- Condicionamiento visual: procesa observaciones de imágenes de 320x240 píxeles según el nombre del dataset.
- Posible condicionamiento por mirada (gaze): el nombre de la arquitectura sugiere el uso de información de gaze, aunque no está documentado.
- Integración con LeRobot: compatible con las herramientas `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Despliegue en robots tipo SO-100 follower: la model card menciona este robot en el ejemplo de evaluación.
- No soporta tool calling, agentes multi-paso, generación de texto, código, matemáticas ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Investigación en robótica de imitación: servir como punto de partida reproducible para estudiar flow matching aplicado a políticas visuomotoras, comparando con ACT o diffusion policy sobre el mismo dataset.
- Reproducción de experimentos: al estar publicados los pesos en safetensors y la licencia ser Apache 2.0, un laboratorio puede descargar el modelo, evaluarlo con `lerobot-record` y verificar los resultados del autor.
- Automatización de tareas de cocina en laboratorio: el modelo puede controlar un brazo SO-100 para recoger lechuga y depositarla en un plato, como demostración de manipulación pick-and-place en entornos controlados.
- Base para fine-tuning en tareas similares: al tener 236 millones de parámetros, es viable reentrenarlo o ajustarlo con un dataset propio de manipulación de alimentos u objetos pequeños en cocina.
- Benchmark interno de políticas robóticas: usar este modelo como referencia en evaluaciones comparativas de políticas de imitación dentro de un equipo de investigación.
- Docencia y formación: ejemplo práctico de extremo a extremo (dataset, entrenamiento con LeRobot, evaluación en robot real) para cursos de robótica o aprendizaje por imitación.
- Prototipado rápido en robótica de bajo coste: el tamaño del repositorio (0,9 GB) y el ecosistema LeRobot permiten desplegarlo en estaciones de trabajo con una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en la tarea, tasas de acierto, comparaciones con otras políticas ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 235,9 millones de parámetros en safetensors (probablemente fp32 o fp16), los pesos ocupan aproximadamente entre 0,5 y 0,9 GB; la VRAM real dependerá de los codificadores visuales y del tamaño del batch, pero debería ser inferior a 4-8 GB en la mayoría de configuraciones.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo, una GPU consumer moderna (RTX 3060, RTX 4070, RTX 4090) debería ser suficiente para inferencia; para entrenamiento se recomienda al menos una GPU con 8-16 GB de VRAM.
- Cabe en GPU consumer: sí, previsiblemente, dado el reducido número de parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependerán de la frecuencia de control del robot y del hardware; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| giava-kitchen-lettuce-multi | 235,9 M | no disponible | Manipulación robótica (lechuga a plato) | Apache 2.0 | Hugging Face, LeRobot |
| ACT (Action Chunking Transformer) | no disponible | no disponible | Políticas de imitación visuomotoras | MIT (implementación LeRobot) | LeRobot, código abierto |
| Diffusion Policy | no disponible | no disponible | Políticas de imitación basadas en difusión | MIT (implementación original) | Repositorios académicos |
| OpenVLA | ~7 B | no disponible | Manipulación generalista con VLA | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad. Las cifras de ACT, Diffusion Policy y OpenVLA no proceden de la información proporcionada y deben verificarse en sus respectivas fuentes.

## Limitaciones y advertencias

- Información muy escasa: la model card es una plantilla sin rellenar ("Model type not recognized"), por lo que no hay documentación sobre entrenamiento, datos, métricas ni uso previsto.
- Especialización extrema: el modelo está entrenado para una única tarea (lechuga a plato) en un entorno concreto; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno: al desconocerse la variabilidad del dataset (iluminación, posiciones, distractores), no se puede garantizar robustez fuera de las condiciones de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito ni comparaciones con alternativas.
- Sesgos: no documentados; en robótica, los sesgos pueden manifestarse como preferencias por posiciones, objetos o condiciones presentes en las demostraciones.
- Alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Requiere el ecosistema LeRobot y un robot compatible (por ejemplo, SO-100 follower) para su despliegue; no es un modelo autónomo fuera de ese stack.
- Sin soporte multilingüe ni de texto: no debe evaluarse como modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/giava-kitchen-lettuce-multi
- Dataset asociado: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
