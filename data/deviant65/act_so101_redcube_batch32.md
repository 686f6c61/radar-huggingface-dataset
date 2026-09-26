# Deviant65/act_so101_redcube_batch32

## Resumen

`Deviant65/act_so101_redcube_batch32` es una política de imitación (imitation learning) para robótica entrenada con el método ACT (Action Chunking with Transformers) sobre el framework LeRobot de Hugging Face. El modelo consume el estado articular del robot y dos flujos de vídeo (cámaras frontal y superior a 640x480) y produce comandos de acción de 6 grados de libertad. Está pensado para ejecutarse sobre un brazo SO-101 en su variante `so_follower`.

El modelo tiene 51.668.614 parámetros, un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional, sino que genera "chunks" de acciones a partir de observaciones visuales y propioceptivas por fotograma (30 FPS).

Su relevancia es acotada pero clara: es un ejemplo reproducible de cómo el ecosistema LeRobot permite entrenar, publicar y desplegar políticas robóticas end-to-end. La tarea concreta aprendida es "coger el bloque rojo y depositarlo en la caja marrón", a partir de un dataset de 63 episodios y 53.428 fotogramas teleoperados. No dispone de resultados de evaluación en robots reales ni de métricas de benchmarks publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador CVAE y extractores visuales convolucionales |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones por fotograma) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no aplica: modelo robótico sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | política de imitación (visuomotora, no generativa de texto) |
| Robot objetivo | `so_follower` (brazo SO-101) |
| Cámaras | `front`, `top` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | Deviant65/so101_redcube_20260925_154203 (63 episodios, 53.428 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el método ACT (Action Chunking with Transformers), descrito en el artículo arXiv:2304.13705. ACT es un esquema de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de acumulación y estabiliza la ejecución. La arquitectura combina un codificador variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas, extractores visuales de tipo ResNet para las dos cámaras y un transformer encoder-decoder que fusiona imagen y estado propioceptivo para emitir el chunk de acciones. La política aprende de datos teleoperados, no de recompensas ni de RL.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, con batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset consta de 63 episodios y 53.428 fotogramas capturados a 30 FPS, todos ellos correspondientes a una única tarea: "Pick up the red block and place it in the brown box". No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste posterior; se trata de aprendizaje por imitación supervisado puro. Tampoco se especifica la composición exacta de las demostraciones (variabilidad de posiciones, iluminación o distractores) ni el tamaño del chunk de acciones.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad a partir de observación visual y de estado articular.
- Percepción visual dual con dos cámaras sincronizadas a 480x640 y 30 FPS (vistas frontal y superior).
- Ejecución de una tarea concreta de picking y placing: coger un bloque rojo y depositarlo en una caja marrón.
- Predicción de chunks de acción, lo que permite movimientos más suaves y coherentes que el control paso a paso.
- Aprendizaje por imitación a partir de teleoperación, sin necesidad de definir recompensas ni un simulador.
- Integración nativa con el ecosistema LeRobot para rollout, entrenamiento y publicación en el Hub.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan modos especiales como thinking, visión general o procesamiento de audio.

## Casos de uso

- Automatización de picking y placing en línea de montaje: la política ejecuta la secuencia completa de coger un objeto y depositarlo en un contenedor, adecuada para tareas repetitivas de baja variabilidad sobre un brazo SO-101.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, tamaños de dataset o configuraciones de entrenamiento dentro de LeRobot.
- Fine-tuning sobre tareas similares: al estar entrenada con dos cámaras y estado de 6 dimensiones, puede servir de punto de partida para reentrenar tareas de manipulación con geometría parecida.
- Recolección de datos asistida: integrada en un pipeline de teleoperación para validar la calidad de las demostraciones antes de reentrenar la política.
- Clasificación y manipulación guiada por color: la tarea original implica distinguir un bloque rojo, por lo que es aplicable a escenarios de selección de objetos por atributo visual.
- Docencia y formación en robótica: permite mostrar de forma completa el ciclo registrar datos, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` en un caso real.
- Prototipado de celdas de laboratorio: escenarios controlados donde se quiere validar una celda robotizada antes de invertir en políticas más grandes o multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni evaluaciones en robot real en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, número de ensayos ni métricas comparables con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el peso de 51,7 M de parámetros ocupa unos 207 MB; en fp16/bf16, unos 103 MB. Con activaciones de dos flujos de vídeo a 480x640 cabe holgadamente en menos de 2 GB de VRAM, aunque la cifra exacta no está documentada.
- GPU recomendadas: cualquier GPU con soporte CUDA; para entrenamiento se usó `--policy.device=cuda`. Para inferencia son suficientes una RTX 3060, RTX 4060 o superiores; para reentrenar con batch 32 conviene una GPU de 12 GB o más (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, sin problema, dado el reducido número de parámetros y el tamaño de repositorio de 0,2 GB.
- Opciones de despliegue: PyTorch junto con las herramientas de LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay mediciones publicadas. La restricción de diseño es sostener 30 FPS (unos 33 ms por paso) porque el dataset se capturó a esa frecuencia; el cumplimiento real depende de la GPU y de la latencia de las cámaras y del bus del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Deviant65/act_so101_redcube_batch32 | ACT (imitación) | 51.668.614 | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | imitación generativa (difusión) | no disponible | no aplica | no disponible | no disponible | paper y repositorio académico |
| SmolVLA | VLA (visión-lenguaje-acción) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | ACT (imitación) | no disponible | no aplica | tasas de éxito reportadas en el paper sobre sus propios entornos | no disponible | paper |

La comparación cuantitativa no es posible con los datos disponibles: la model card no incluye métricas de éxito ni detalles de configuración de los modelos alternativos. La diferencia principal es de categoría: ACT es una política de imitación específica de tarea y sin entrada de lenguaje, mientras que SmolVLA incorpora instrucciones en lenguaje natural y Diffusion Policy modela la acción mediante difusión.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay evidencia documentada de tasa de éxito en robot real, por lo que no debe asumirse un rendimiento concreto.
- Especialización extrema: la política está entrenada para una única tarea y un único brazo (`so_follower`); no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Dependencia de la configuración de cámara: los nombres y la disposición de las cámaras deben coincidir con las claves de observación del entrenamiento (`front` y `top`), o la inferencia fallará o degradará.
- Sensibilidad al entorno: iluminación, posición del objeto, distractores o cambios físicos respecto a las demostraciones pueden degradar el comportamiento, aunque esto no se cuantifica en la model card.
- Sesgos y alucinación: al no ser un modelo de lenguaje no hay riesgo de alucinación textual, pero sí de comportamientos erróneos o inseguros ante situaciones fuera de distribución, un riesgo relevante en robótica física.
- Ausencia de información sobre seguridad: no se documentan paradas de emergencia, límites de par ni protocolos de operación segura; cualquier despliegue debe añadirlos externamente.
- Idiomas: no aplica, pero conviene señalar que no acepta instrucciones en lenguaje natural.
- Licencia: Apache 2.0, permisiva para uso comercial, aunque el usuario debe cumplir las condiciones de atribución y citar LeRobot y el método ACT.
- Repositorio con 0 descargas y 0 likes: no hay señales de uso ni de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/act_so101_redcube_batch32
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/so101_redcube_20260925_154203
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/so101_redcube_20260925_154203
- Artículo de ACT: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
