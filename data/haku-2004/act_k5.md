# Haku-2004/act_k5

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo `Haku-2004/act_k5` es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`, presumiblemente recopilado mediante teleoperación. Con 51.668.614 parámetros y un peso de repositorio de 0,2 GB, es un modelo compacto orientado a control robótico de bajo nivel, no a generación de texto.

El modelo se publica bajo licencia Apache 2.0 y formato safetensors, integrado en el ecosistema LeRobot de Hugging Face. Su relevancia radica en que permite reproducir el pipeline completo de entrenamiento e inferencia con comandos `lerobot-train` y `lerobot-record`, lo que facilita la experimentación con políticas de imitación en robots de bajo coste como el SO-100.

No se dispone de información sobre idiomas, benchmarks publicados ni detalles del dataset de entrenamiento más allá de su identificador. La model card es la plantilla estándar generada por LeRobot y no incluye métricas de éxito ni composición de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de visión y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de una única acción por paso, lo que reduce el error de composición acumulado en tareas de manipulación. La arquitectura combina un encoder visual (típicamente ResNet) con un transformer encoder-decoder que genera los chunks de acción. El paper original es "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k5_20261110_143202`, del cual no se dispone de información sobre número de episodios, tareas, frecuencia de muestreo ni composición. No se indica si hubo aumento de datos, variaciones de cámara o técnicas adicionales. El modelo se entrenó desde cero según el flujo estándar de LeRobot (`--policy.type=act`).

## Capacidades

- Control robótico mediante predicción de chunks de acción a partir de observaciones visuales.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Ejecución de políticas en robots tipo SO-100 (`so100_follower`) mediante `lerobot-record`.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multilingües.
- No soporta tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Manipulación robótica de bajo coste: la política puede ejecutar tareas de pick-and-place en un SO-100 entrenado con demostraciones teleoperadas, aprovechando la predicción de chunks para suavizar la trayectoria.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, número de episodios o configuraciones de cámara.
- Prototipado rápido de políticas: el flujo `lerobot-train` + `lerobot-record` permite iterar en horas sobre un dataset propio.
- Evaluación de datasets de teleoperación: permite validar la calidad de un dataset midiendo la tasa de éxito de la política entrenada sobre él.
- Educación y docencia en robótica: modelo pequeño (0,2 GB) que cabe en GPUs de consumo y permite demostrar el ciclo completo de imitación.
- Automatización de tareas repetitivas en laboratorio: tareas de recogida y colocación de objetos con un brazo robótico de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 51,7 M de parámetros; en la práctica depende del encoder visual y del tamaño de las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de gama media o superior.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch en CUDA o CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Haku-2004/act_k5 | 51,7 M | no aplica | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | ~50 M | no aplica | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy | no disponible | no aplica | MIT (implementación) | Repos académicos |
| VQ-BeT | no disponible | no aplica | MIT | Repos académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La política está entrenada sobre un dataset concreto (`k5_20261110_143202`); su generalización a otras tareas, entornos o robots no está garantizada.
- No hay información sobre la tasa de éxito, número de episodios ni diversidad de demostraciones, por lo que no se puede evaluar su robustez.
- Riesgo de sobreajuste al entorno de entrenamiento (iluminación, posición de cámara, objetos).
- No es un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se especifican los tipos de robot compatibles más allá del ejemplo `so100_follower` en la model card.

## Enlaces

- [Hugging Face: Haku-2004/act_k5](https://huggingface.co/Haku-2004/act_k5)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Haku-2004/k5_20261110_143202)
