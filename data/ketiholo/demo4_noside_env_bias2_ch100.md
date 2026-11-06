# ketiholo/demo4_noside_env_bias2_ch100

## Resumen

`demo4_noside_env_bias2_ch100` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos de acciones en lugar de pasos individuales. El modelo lo publica el usuario `ketiholo` en Hugging Face mediante la librería LeRobot de Hugging Face, que es el marco de referencia para entrenar y desplegar políticas robóticas con datasets teleoperados. El modelo tiene 51.676.295 parámetros y un tamaño de repositorio de 0,2 GB.

El problema que resuelve es el control de un robot manipulador a partir de demostraciones humanas: en lugar de programar trayectorias a mano, la política aprende a mapear observaciones visuales y de estado a comandos motores. ACT es relevante porque consigue tasas de éxito altas con datasets relativamente pequeños, lo que lo convierte en una opción práctica para laboratorios y prototipos de robótica de bajo coste, como las plataformas SO-100/SO-101 que aparecen en los comandos de ejemplo de la model card.

La ficha se basa únicamente en los metadatos y la model card disponibles. No hay información publicada sobre benchmarks, composición del dataset ni detalles de entrenamiento más allá de lo que indica la propia card, por lo que varios apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parámetros totales | 51.676.295 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT procesa observaciones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone visual (típicamente ResNet) que procesa las imágenes de las cámaras del robot con un transformer encoder-decoder que genera chunks de acciones: en lugar de predecir una sola acción por paso, el modelo emite una secuencia corta de acciones futuras, lo que reduce el error de acumulación y suaviza el control. Además, ACT incorpora una técnica de condicionamiento con latentes estilo CVAE para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realiza sobre el dataset `ketiholo/demo4`, compuesto por episodios teleoperados, pero no se dispone de información pública sobre el número de episodios, el número de tokens o pasos, la composición exacta del dataset ni si se aplicaron fases de RLHF o ajuste posterior. El nombre del repositorio (`noside_env_bias2_ch100`) sugiere una configuración con chunk size de 100, aunque este dato no está confirmado en la documentación.

## Capacidades

- Control de robot manipulador mediante predicción de chunks de acción a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas explícitas.
- Generación de secuencias de acciones de varios pasos (action chunking), lo que mejora la estabilidad frente a políticas paso a paso.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Compatible con robots tipo `so100_follower` según los ejemplos de la model card.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni agentes conversacionales.

## Casos de uso

- Manipulación robótica de laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, usando el chunking de acciones para suavizar el movimiento y reducir la acumulación de errores.
- Prototipado con plataformas de bajo coste: los ejemplos de la model card apuntan a robots SO-100, por lo que encaja en montajes de robótica educativa o de investigación con presupuesto limitado.
- Evaluación de pipelines de imitación: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (por ejemplo, variantes con y sin `ch100`) dentro del mismo dataset `demo4`.
- Automatización de tareas repetitivas en entornos controlados: con un dataset teleoperado específico, la política puede replicar rutinas de ensamblaje o clasificación de objetos.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del tamaño de chunk, el sesgo del entorno o la variabilidad de las demostraciones en la tasa de éxito.
- Despliegue en inferencia local: con 51,7 M de parámetros y 0,2 GB de pesos, puede ejecutarse en una GPU de consumo o incluso en CPU para pruebas de baja frecuencia, integrado mediante LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el consumo depende del backbone visual y del tamaño de las imágenes de entrada, pero es holgadamente inferior a 4 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; para entrenamiento se recomienda al menos una GPU con 8-16 GB para manejar lotes de imágenes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM; también es viable en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y safetensors; no se documentan exportaciones a GGUF, ONNX o TensorRT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ketiholo/demo4_noside_env_bias2_ch100` | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (21 descargas) |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | tasas de éxito altas reportadas en el paper | no disponible | paper y código de referencia |
| Políticas LeRobot del Hub (p. ej. `lerobot/act_*`) | variable | no aplica | variable según dataset | normalmente Apache 2.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento entre este checkpoint y otras políticas ACT del ecosistema LeRobot, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado sobre un dataset concreto (`ketiholo/demo4`) y un entorno concreto; su generalización a otras tareas, objetos o configuraciones de cámara es limitada.
- El nombre del repositorio incluye `noside_env_bias2`, lo que sugiere posibles sesgos del entorno de entrenamiento; no hay documentación que los cuantifique.
- Riesgo de sobreajuste a las demostraciones teleoperadas: la política puede fallar ante variaciones de iluminación, posición de objetos o ruido en las observaciones.
- No hay información publicada sobre benchmarks, número de episodios de entrenamiento ni métricas de éxito, lo que dificulta evaluar su calidad antes de desplegarlo.
- No es un modelo de lenguaje: no soporta texto, código, tool calling ni agentes conversacionales; cualquier uso fuera de robótica de imitación no es aplicable.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en el entorno real antes de producción.
- El número de descargas (21) y de likes (0) es muy bajo, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo4_noside_env_bias2_ch100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo4
