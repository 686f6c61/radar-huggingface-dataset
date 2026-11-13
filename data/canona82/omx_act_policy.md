# canona82/omx_act_policy

## Resumen

`omx_act_policy` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario canona82 en Hugging Face. El modelo no es un LLM ni un modelo generativo de texto: es un controlador visomotor entrenado para predecir secuencias cortas de acciones (action chunks) a partir de observaciones visuales y del estado del robot. ACT se presentó en el artículo arXiv 2304.13705 y se ha convertido en uno de los métodos de referencia para aprendizaje por imitación en manipulación robótica de bajo coste.

El repositorio contiene 51.668.614 parámetros en formato safetensors (unos 0,2 GB) y está empaquetado con la librería LeRobot de Hugging Face, lo que permite entrenarlo y evaluarlo con los comandos `lerobot-train` y `lerobot-record`. Se ha entrenado sobre el dataset `canona82/pick_and_place`, presumiblemente con un robot tipo SO-100/SO-101 segun la configuración de evaluación de la model card.

Su relevancia es práctica: ofrece un punto de partida reproducible para tareas de pick-and-place con hardware asequible, licencia Apache 2.0 y un pipeline estándar de LeRobot. Al tener 0 descargas y 0 likes en el momento de la consulta, debe considerarse un artefacto experimental de un autor individual, no un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice un chunk de k acciones futuras en lugar de una sola acción por paso. La arquitectura combina un codificador de imágenes (típicamente ResNet) con un transformer que fusiona las características visuales, el estado de las articulaciones y una consulta latente, y un decodificador que emite la secuencia de acciones. La predicción por chunks reduce el error de composición acumulado típico de las políticas paso a paso y suaviza la ejecución.

El entrenamiento es de imitación supervisada sobre episodios de teleoperación. En este caso, el dataset declarado es `canona82/pick_and_place`; no se especifican en la información disponible el número de episodios, el número de tokens, la composición exacta del dataset ni si hubo aumento de datos o regularización temporal. Tampoco se documenta el uso de RLHF o DPO, algo que no aplica a este tipo de política. La innovación principal es el propio action chunking, junto con el uso de una consulta latente para modelar la variabilidad temporal dentro del chunk.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de articulaciones a partir de imágenes de cámara y estado del robot.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas de movimiento con mayor coherencia que políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere un simulador para el entrenamiento inicial.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación y grabación con `lerobot-record`.
- Compatible con robots de la familia SO-100/SO-101 según la configuración de evaluación de la model card (`so100_follower`).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Pick-and-place en laboratorio: el modelo se usa para recoger un objeto y colocarlo en una posición objetivo, aprovechando el chunk de acciones para suavizar la trayectoria y reducir correcciones a mitad de movimiento.
- Reproducción de tareas de manipulación con SO-100: al estar entrenado con LeRobot y configurado para `so100_follower`, sirve como política de referencia para validar un montaje físico de bajo coste antes de entrenar políticas propias.
- Base para fine-tuning con datos propios: el checkpoint se puede reentrenar con `lerobot-train` sobre un dataset nuevo si la morfología del robot y el espacio de acciones coinciden, acortando el tiempo hasta una primera política funcional.
- Evaluación comparativa de métodos de imitación: al ser un ACT canónico con licencia permisiva, es útil como línea base frente a Diffusion Policy o VQ-BeT en experimentos académicos.
- Docencia y prototipado rápido: el pipeline de LeRobot y el tamaño reducido (0,2 GB) permiten ejecutar entrenamiento e inferencia en una estación de trabajo con una sola GPU consumer.
- Automatización de tareas repetitivas de recogida en entornos controlados: con la política desplegada en el robot, se pueden ejecutar ciclos de recogida y depósito siempre que la distribución visual se mantenga similar a la del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para los 51,7 M de parámetros; en la práctica, el consumo lo dominan las activaciones del codificador visual y el buffer de imágenes, por lo que se recomienda al menos 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con CUDA y 6 GB o más, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para entrenamiento, se recomienda 8 GB o más y, preferiblemente, una RTX 4090 o superior si se aumenta el tamaño del dataset.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del robot, de la frecuencia de control y del hardware de inferencia; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_policy (este) | 51,7 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (referencia LeRobot) | del orden de decenas de millones, según configuración | no aplica | tasas de éxito reportadas en el paper 2304.13705, no comparables directamente con este checkpoint | MIT/Apache según implementación | paper y repositorio LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible en la información proporcionada | no disponible | implementaciones públicas en investigación |
| VQ-BeT | no disponible | no aplica | no disponible en la información proporcionada | no disponible | implementaciones públicas en investigación |

La comparación cuantitativa con alternativas no está disponible porque este checkpoint no publica métricas propias y las cifras del paper de ACT corresponden a otros datasets y configuraciones.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, con 0 descargas y 0 likes: no hay evidencia de validación por terceros ni de robustez en producción.
- Sin benchmarks publicados: no se puede afirmar una tasa de éxito concreta ni comparar de forma rigurosa con otras políticas.
- Fuerte dependencia de la distribución de entrenamiento: cambios de iluminación, fondo, objetos o posición de cámara pueden degradar el rendimiento de forma severa.
- Entrenado sobre un único dataset (`canona82/pick_and_place`) y presumiblemente para una morfología concreta (SO-100); no es transferible sin reentrenamiento a otros robots o espacios de acción.
- Riesgo de sobreajuste a las demostraciones teleoperadas y de acumulación de error fuera de la distribución.
- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural ni tiene capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- No se documentan sesgos, pero en robótica los sesgos aparecen como preferencias de trayectoria y sesgos visuales heredados de las demostraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canona82/omx_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/canona82/pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
