# fecasado/gfm-kitchen-toasts-fpv

## Resumen

`gfm-kitchen-toasts-fpv` es una política robótica de manipulación entrenada con LeRobot y publicada en HuggingFace por el usuario `fecasado`. No es un modelo de lenguaje: se trata de un modelo de imitación (imitation learning) que aprende a ejecutar una tarea concreta de manipulación a partir de demostraciones teleoperadas. El nombre del repositorio y la etiqueta `gaze_flow_matching` indican que emplea un esquema de flow matching condicionado por la mirada (gaze) sobre observaciones de cámara en primera persona (FPV, first-person view). La tarea, según el dataset asociado `fecasado/toasts-to-plate-320x240`, consiste en trasladar tostadas a un plato en un entorno de cocina.

El modelo cuenta con 75.248.330 parámetros (dato real extraído de los pesos en safetensors) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en el rango de las políticas de imitación ligeras que pueden ejecutarse en una GPU de consumo. Está empaquetado en formato safetensors y distribuido bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) para una tarea de pick-and-place en cocina, y resulta útil para investigadores que quieran partir de un checkpoint funcional en lugar de entrenar desde cero. No obstante, la model card es prácticamente una plantilla sin rellenar, por lo que la mayoría de los metadatos técnicos no están documentados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación con flow matching condicionado por gaze (etiqueta `gaze_flow_matching`); el autor no detalla la arquitectura interna |
| Parametros totales | 75.248.330 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | fecasado/toasts-to-plate-320x240 |
| Resolución de observación | 320x240 (según nombre del dataset) |
| Tamaño del repositorio | 0,3 GB |
| Descargas | 25 |
| Fecha de publicación | 2026-10-27 |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura con detalle. La etiqueta `gaze_flow_matching` sugiere una política generativa basada en flow matching (una familia de modelos de difusión continuos que aprenden un campo de velocidad entre una distribución de ruido y la distribución de acciones) y condicionada por señales de mirada además de las observaciones visuales. El número de parámetros (75,2 M) es coherente con una red de tamaño medio que procesa imágenes de 320x240 y produce secuencias de acciones de control, no con un transformer de lenguaje.

Respecto al entrenamiento, la model card solo indica que la política se ha entrenado y subido al Hub mediante LeRobot, y remite a la guía de entrenamiento de imitación de LeRobot. No se especifican el número de episodios de demostración, el número de tokens o pasos de entrenamiento, la composición del dataset, ni si hubo etapas de refinamiento tipo RLHF o DPO (poco habituales en este tipo de políticas). El dataset asociado, `fecasado/toasts-to-plate-320x240`, es la única referencia a los datos, y su nombre indica capturas a 320x240 píxeles de la tarea de pasar tostadas a un plato. Tampoco se documentan innovaciones técnicas adicionales más allá del propio esquema de gaze flow matching.

## Capacidades

- Control robótico de manipulación: genera acciones motrices para ejecutar una tarea de pick-and-place (tostada a plato) a partir de observaciones visuales.
- Imitación de demostraciones teleoperadas: aprende la política directamente del dataset de episodios grabados, sin recompensa explícita.
- Condicionamiento por mirada: la etiqueta del modelo indica que la señal de gaze forma parte de la entrada o del objetivo de entrenamiento, lo que puede mejorar la precisión en tareas de alcance y agarre.
- Percepción visual en primera persona: procesa imágenes de 320x240 procedentes de una cámara FPV.
- Integración con LeRobot: compatible con las herramientas `lerobot-train` y `lerobot-record` para reentrenamiento y evaluación.
- Ejecución sobre robot SO-100: la model card muestra el ejemplo de evaluación con `so100_follower`, lo que indica compatibilidad con esa plataforma.
- Sin capacidades de lenguaje, razonamiento simbólico, tool calling ni agentes multi-paso: no es un modelo generativo de texto.

## Casos de uso

- Reproducción de un pipeline de imitación completo: usar el checkpoint como referencia para validar la instalación de LeRobot, ejecutando `lerobot-record` con `--policy.path=fecasado/gfm-kitchen-toasts-fpv` y comprobando que el robot SO-100 reproduce la tarea de trasladar tostadas.
- Punto de partida para fine-tuning en tareas de cocina: reentrenar la política con un dataset propio de manipulación de alimentos usando `lerobot-train` y `--policy.path` apuntando a este checkpoint, aprovechando los 75 M de parámetros para iterar rápido en una sola GPU.
- Investigación en condicionamiento por gaze: servir como línea base para comparar si la señal de mirada mejora la tasa de éxito frente a políticas puramente visuales en tareas de alcance sobre mesa.
- Evaluación de robustez visual en entornos de cocina: probar la política bajo cambios de iluminación, posición de la tostada o del plato para medir la degradación de una política entrenada con un único dataset de 320x240.
- Docencia y demostraciones de robótica de imitación: el tamaño reducido (0,3 GB) y la licencia Apache 2.0 permiten distribuirlo en cursos y talleres sin restricciones legales ni requisitos de hardware elevados.
- Benchmark interno de políticas ligeras: usar sus resultados en la tarea toasts-to-plate como referencia cuantitativa al comparar nuevas arquitecturas de flow matching sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 75,2 M de parámetros en safetensors (aproximadamente 300 MB en fp32), la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, incluyendo GPUs integradas recientes.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Para entrenamiento desde cero o fine-tuning, se recomienda una RTX 3090, RTX 4090, A100 o H100 según el tamaño del dataset y el batch.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. Dependen del robot, de la frecuencia de control y del hardware de inferencia; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-toasts-fpv | 75,2 M | Flow matching con gaze (LeRobot) | Imágenes 320x240 | Apache 2.0 | HuggingFace, 25 descargas |
| Políticas ACT de LeRobot (p. ej. entrenadas con `--policy.type=act`) | Variable, típicamente decenas de millones | Transformer de imitación (ACT) | Imágenes según dataset | Apache 2.0 (LeRobot) | Referencia en la documentación de LeRobot |
| Políticas de difusión para manipulación (p. ej. Diffusion Policy) | Variable | Difusión para acciones | Imágenes según dataset | Según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, tipo de arquitectura y licencia.

## Limitaciones y advertencias

- Model card incompleta: el propio autor deja la plantilla sin rellenar ("Model type not recognized — please update this template"), por lo que faltan detalles de arquitectura, datos y evaluación.
- Especialización extrema: la política está entrenada para una única tarea (tostadas a plato) en un entorno concreto; no generaliza a otras tareas sin reentrenamiento.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de robustez ni de tasa de éxito en evaluación.
- Dependencia del entorno: cambios en la cámara, la iluminación, la posición de los objetos o el robot pueden degradar el comportamiento de forma significativa.
- Sesgos: no documentados; en robótica de imitación, los sesgos provienen de la distribución de demostraciones (posiciones, velocidades y condiciones repetidas durante la teleoperación).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o fuera de distribución ante observaciones no vistas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Uso en producción: requiere validación exhaustiva en el entorno real antes de cualquier despliegue, dado que no hay datos de seguridad ni de fiabilidad publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-kitchen-toasts-fpv
- Dataset asociado: https://huggingface.co/datasets/fecasado/toasts-to-plate-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
