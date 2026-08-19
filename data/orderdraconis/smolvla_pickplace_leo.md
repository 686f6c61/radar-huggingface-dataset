# OrderDraconis/smolvla_pickplace_leo

## Resumen

SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para tareas de robótica manipulativa con un coste computacional reducido y despliegue en hardware de consumo. Este repositorio concreto, `OrderDraconis/smolvla_pickplace_leo`, es un fine-tuning del modelo base `lerobot/smolvla_base` (450 millones de parámetros) sobre el dataset `Pink-Viking/pick_and_place_combined`, que contiene 122 episodios de una tarea de pick and place de tela con un robot bi-manual. El modelo fue entrenado con LeRobot (v0.6.0) durante 20.000 pasos y está orientado a controlar un robot `bi_so_follower` con tres cámaras. Su relevancia radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en una tarea robótica concreta mediante fine-tuning, manteniendo la licencia Apache 2.0 y siendo reproducible con herramientas open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción que combina codificadores visuales y de lenguaje con un "action expert" que genera comandos de control para el robot. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face sobre datos de robótica y luego fine-tuneado aquí mediante aprendizaje por imitación (imitation learning) con el framework LeRobot. El entrenamiento se realizó sobre el dataset `Pink-Viking/pick_and_place_combined`, que contiene 96.339 frames a 30 FPS de una tarea de recoger una pieza de tela y colocarla en un cuadrado objetivo. Se usó el optimizador AdamW con learning rate 0.0001, batch size 64, seed 1000 y 20.000 pasos de entrenamiento. No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de alineación, ni sobre la composición exacta del dataset de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 12 dimensiones (posición, orientación, fuerza, etc.) a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa tres vistas de cámara (izquierda, derecha y superior) a resolución 256x256.
- Integración de estado del robot: recibe el estado del efector (6 dimensiones) como entrada adicional.
- Ejecución de tareas específicas: entrenado para la tarea "pick up the upper piece of fabric and place it in the target square".
- Compatibilidad con LeRobot: puede ejecutarse y fine-tunearse con el ecosistema LeRobot (rollout, entrenamiento, evaluación).
- Inferencia en tiempo real: diseñado para operar a 30 FPS en hardware de consumo.

## Casos de uso

- Automatización de pick and place en entornos industriales: el modelo puede controlar un robot bi-manual para recoger piezas de tela y colocarlas en posiciones definidas, reduciendo la intervención humana en líneas de producción.
- Investigación en robótica de manipulación: sirve como punto de partida para experimentos de aprendizaje por imitación, comparación de arquitecturas VLA o estudio de generalización a nuevas tareas.
- Prototipado rápido de políticas robóticas: gracias a su pequeño tamaño y a la integración con LeRobot, permite iterar rápidamente sobre nuevas tareas con datasets reducidos.
- Educación en robótica y aprendizaje por refuerzo: puede usarse en laboratorios docentes para demostrar el ciclo completo de recogida de datos, entrenamiento y despliegue de un VLA.
- Control de robots de bajo coste: al ser ligero, puede ejecutarse en GPUs de gama media, habilitando aplicaciones en robótica de bajo presupuesto.
- Benchmarking de modelos VLA: su licencia Apache 2.0 y su tamaño compacto lo convierten en un candidato para comparar rendimiento frente a modelos más grandes en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no hay datos de éxito en tareas reales ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 450M de parámetros en FP16 el peso del modelo ocupa ~900 MB; considerando las tres imágenes de entrada (3x256x256) y el overhead de inferencia, se estima que puede ejecutarse en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: RTX 3060/4060 (12 GB), RTX 4070, RTX 4090, A100, H100. No se han publicado requisitos oficiales.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos de SmolVLA según la documentación oficial.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También puede integrarse con frameworks como vLLM o TGI, aunque no se documenta específicamente para este modelo.
- Latencia y throughput: no disponible. El modelo está diseñado para operar a 30 FPS, pero no se han publicado mediciones reales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo para este fine-tuning concreto. A nivel de arquitectura base, SmolVLA (450M) es significativamente más pequeño que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que lo hace más adecuado para despliegue en hardware limitado, pero probablemente con menor capacidad de generalización. No hay benchmarks públicos que comparen estos modelos en la misma tarea, por lo que no se puede ofrecer una comparación cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | MIT (modelo) | HuggingFace |
| RT-2 | 55B | no disponible | Propietaria | no abierto |

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real en tareas fuera del dataset de entrenamiento es desconocido.
- El dataset de entrenamiento es reducido (122 episodios, una única tarea), lo que limita la generalización a otras tareas o variaciones del entorno.
- Las cámaras y el robot son específicos (`bi_so_follower` con tres cámaras concretas); el modelo no funcionará directamente con otras configuraciones sin reentrenamiento.
- La tarea está definida en inglés; no se ha verificado el comportamiento con instrucciones en otros idiomas.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir acciones incoherentes ante observaciones fuera de distribución.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en entornos con distractores o iluminación variable.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue en producción requiere validación exhaustiva de seguridad robótica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OrderDraconis/smolvla_pickplace_leo
- Paper SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Dataset de entrenamiento: https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined
