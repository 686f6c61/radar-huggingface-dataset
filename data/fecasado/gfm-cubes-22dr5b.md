# fecasado/gfm-cubes-22dR5b

## Resumen

GFM-cubes-22dR5b es una política robótica (policy) entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El autor es `fecasado` y el modelo se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política visuomotora que mapea observaciones (imágenes de cámara y estado del robot) a acciones de control, orientada a tareas de manipulación con cubos y cestas.

La arquitectura se etiqueta como `gaze_flow_matching`, un enfoque de flow matching aplicado a la generación de acciones, presumiblemente condicionado por información de mirada (gaze) además de las observaciones visuales. El modelo tiene 75.248.330 parámetros (dato real extraído de los pesos en safetensors) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en GPU de consumo.

Es relevante ahora porque forma parte del ecosistema LeRobot, que está estandarizando el entrenamiento y la evaluación de políticas robóticas con datasets abiertos y formatos reproducibles. El dataset asociado, `fecasado/Ncubes-to-Nbaskets-320x240`, sugiere una tarea de trasvase de cubos a cestas con resolución de 320x240. La model card es una plantilla sin completar, por lo que la mayoría de detalles técnicos no están documentados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (política robótica; flow matching condicionado por mirada) |
| Parámetros totales | 75.248.330 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política robótica, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura declarada es `gaze_flow_matching`, una política de flow matching para generación de acciones. El nombre sugiere que el modelo aprende un campo de velocidades que transforma una distribución simple (por ejemplo, ruido gaussiano) en la distribución de acciones expertas, condicionado por observaciones visuales y, presumiblemente, por señales de mirada. No se dispone de la configuración exacta del backbone visual, del número de capas ni del esquema de atención en la información proporcionada.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que parece contener episodios de demostración a resolución 320x240 para una tarea de manipulación de cubos hacia cestas. No se documentan el número de episodios, el número de tokens o frames de entrenamiento, la composición del dataset, ni si hubo etapas de refinamiento tipo RLHF o DPO (poco habituales en políticas robóticas de imitación). La model card no describe innovaciones técnicas adicionales más allá del propio esquema de flow matching.

## Capacidades

- Control visuomotor: genera acciones de robot a partir de observaciones de cámara y estado del robot.
- Flow matching para acciones: produce trayectorias de acción mediante integración de un campo de velocidades, en lugar de regresión directa o difusión clásica.
- Condicionamiento por mirada: la etiqueta `gaze_flow_matching` indica uso de información de mirada como señal de condicionamiento, aunque el mecanismo exacto no está documentado.
- Aprendizaje por imitación: entrenado sobre demostraciones humanas o teleoperadas del dataset asociado.
- Integración con LeRobot: compatible con `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Tarea específica: trasvase de cubos a cestas (`Ncubes-to-Nbaskets`), presumiblemente con el robot SO-100 u otro follower compatible con LeRobot.
- No soporta tool calling, agentes multi-paso, capacidades multilingües ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Manipulación de cubos en laboratorio: el modelo ejecuta la política aprendida para recoger cubos y depositarlos en cestas, adecuado para experimentos de imitación con LeRobot y un robot de bajo coste como SO-100.
- Reproducción de experimentos de investigación: sirve como referencia para comparar variantes de flow matching condicionado por mirada frente a políticas ACT o diffusion policy en la misma tarea.
- Base para fine-tuning en tareas similares: al ser una política ligera (75 M de parámetros) y con licencia Apache 2.0, puede reentrenarse sobre datasets propios de pick-and-place con `lerobot-train`.
- Evaluación de pipelines de LeRobot: útil para validar el flujo completo de entrenamiento, checkpoints y `lerobot-record` con `--policy.path` apuntando a este repositorio.
- Despliegue en hardware de consumo: sus 0,3 GB de pesos permiten inferencia en GPU de gama media o incluso en CPU para pruebas de latencia, sin necesidad de infraestructura de datacenter.
- Estudio de señales de mirada en robótica: permite analizar si el condicionamiento por gaze mejora la precisión en tareas de alcance y agarre respecto a políticas puramente visuales.
- Docencia y prototipado rápido: ejemplo compacto de política robótica entrenada de extremo a extremo con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas sobre el dataset `Ncubes-to-Nbaskets-320x240`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 75 M de parámetros; en la práctica, el consumo depende del backbone visual y del tamaño de las imágenes de entrada (320x240), pero debería mantenerse por debajo de 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en gran medida sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para pruebas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch en CUDA o CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-cubes-22dR5b | 75,2 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot | no disponible | no aplica | no disponible | Apache 2.0 (típicamente) | Hugging Face / LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparables publicados para este modelo ni para alternativas en la misma tarea concreta, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Model card incompleta: es una plantilla sin rellenar ("Model type not recognized"), lo que impide conocer detalles de entrenamiento, configuración y evaluación.
- Sin métricas de éxito publicadas: no hay evidencia documentada de que la política funcione de forma fiable en el robot real.
- Especialización estrecha: entrenada para una tarea y un dataset concretos (`Ncubes-to-Nbaskets-320x240`); no se espera generalización a otras tareas, objetos o entornos sin reentrenamiento.
- Dependencia del hardware: el rendimiento depende del robot, la calibración de cámaras y la correspondencia entre el entorno de entrenamiento y el de despliegue.
- Riesgo de sobreajuste al dataset: con un único dataset asociado y sin datos de validación publicados, el riesgo de sobreajuste y de fallo ante variaciones de iluminación o posición es alto.
- Sesgos: no documentados; en robótica los sesgos provienen de las demostraciones (posiciones, objetos y condiciones limitadas).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin información sobre cuantización ni formatos alternativos: el despliegue fuera de LeRobot requeriría conversión manual de los pesos safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dR5b
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
