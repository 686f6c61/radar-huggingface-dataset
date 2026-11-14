# Muhammad241198/act_dsub_240

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo `act_dsub_240`, publicado por el usuario Muhammad241198 en Hugging Face, es una política entrenada con LeRobot sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023` y empaquetada en formato safetensors con 51.828.359 parámetros.

El modelo resuelve el problema del control robótico fino a partir de datos de teleoperación: en lugar de reaccionar paso a paso, genera secuencias de acciones coherentes, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación. Es relevante para desarrolladores que trabajan con brazos robóticos tipo SO-100/SO-101 y quieren desplegar políticas de imitación sin entrenar desde cero.

La ficha se basa exclusivamente en la información pública disponible en el repositorio: la model card, los tags de Hugging Face y el recuento real de parámetros en safetensors. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para aprendizaje por imitación (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.828.359 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que, a partir de observaciones (típicamente imágenes de cámaras y estado de las articulaciones), predice un chunk de acciones futuras en lugar de una sola acción. Esta estrategia de predicción por bloques reduce el error de compounding y permite un control más suave en tareas de manipulación. El modelo se entrena mediante aprendizaje por imitación supervisado sobre episodios de teleoperación, sin que la información disponible indique el uso de RLHF o DPO.

El entrenamiento se ha realizado con LeRobot, la librería de Hugging Face para robótica, sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`. No se dispone de datos sobre el número de tokens, la composición del dataset, el número de episodios ni la configuración exacta de entrenamiento (learning rate, batch size, aumentos de datos). El repositorio ocupa 0,4 GB y los pesos están en safetensors.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado.
- Aprendizaje a partir de datos de teleoperación: entrenado con el pipeline de LeRobot.
- Integración con robots tipo SO-100/SO-101 mediante `lerobot-record` y `so100_follower`.
- Inferencia y evaluación reproducibles con los comandos documentados en la model card.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni agentes multi-step.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio).

## Casos de uso

- Manipulación robótica de precisión: el modelo predice chunks de acciones que permiten movimientos suaves en tareas de ensamblaje o inserción, adecuado por su entrenamiento específico sobre el dataset DSUB.
- Automatización de tareas repetitivas en laboratorio: se puede desplegar sobre un brazo SO-100 para ejecutar secuencias teleoperadas previamente grabadas, reduciendo la necesidad de programación manual.
- Evaluación de políticas de imitación: sirve como checkpoint de referencia para comparar variantes de ACT entrenadas con LeRobot sobre el mismo dataset.
- Prototipado rápido en robótica de investigación: al estar en formato safetensors y con licencia Apache 2.0, se integra fácilmente en pipelines de experimentación con LeRobot.
- Despliegue en entornos educativos: el modelo permite demostrar el ciclo completo de entrenamiento, evaluación e inferencia con `lerobot-train` y `lerobot-record`.
- Reentrenamiento y fine-tuning: al ser un checkpoint ACT estándar, puede servir de base para ajuste sobre nuevos datasets de teleoperación con la misma morfología de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 207 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| act_dsub_240 (este) | 51,8 M | no disponible | apache-2.0 | safetensors | Hugging Face |
| Otros checkpoints ACT en LeRobot | no disponible | no disponible | variable | safetensors | Hugging Face |
| Políticas de imitación alternativas (p. ej., Diffusion Policy) | no disponible | no disponible | variable | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje y no debe evaluarse con benchmarks de texto.
- Entrenado sobre un único dataset (`rbtrprjkt/DSUB-installnew2026_20261026_033023`); su generalización a otras tareas, morfologías o entornos no está documentada.
- Riesgo de sobreajuste al entorno de teleoperación original; el rendimiento fuera de ese dominio puede degradarse.
- No se documentan sesgos, pero al derivar de datos de teleoperación humanos puede heredar sesgos de las demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en tareas.
- Repositorio con muy pocas descargas (4) y sin likes, lo que sugiere ausencia de validación por la comunidad.
- No se especifican requisitos de hardware ni latencias, por lo que el despliegue en producción requiere validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/Muhammad241198/act_dsub_240
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/DSUB-installnew2026_20261026_033023
