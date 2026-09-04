# sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_15k

## Resumen

El modelo `train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_15k` es un modelo Vision-Language-Action (VLA) de 4.143 millones de parámetros desarrollado por `sam-guided-vlas` como fine-tuning del modelo base `lerobot/pi05_base`. Pertenece a la familia π₀.₅ (Pi05) de Physical Intelligence, un modelo diseñado para generalizar en entornos de robótica del mundo real mediante la combinación de percepción visual, instrucciones en lenguaje y generación de acciones.

Este fine-tuning se ha entrenado sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__no_mask`, que contiene 198 episodios y 35.267 frames a 20 FPS, con tareas de manipulación de objetos cotidianos (botes, tarros, hortalizas, recipientes, etc.) usando un robot Panda. El modelo consume observaciones del estado del robot y de tres cámaras (vista agente y dos cámaras ojo en mano) y produce acciones de 7 dimensiones para el control del brazo.

La relevancia del modelo radica en su aplicación práctica en robótica de imitación, ya que permite probar políticas de manipulación visuales en entornos reales y sintéticos. Al estar publicado bajo licencia Apache-2.0 y soportado por la librería LeRobot, facilita la replicabilidad de experimentos y el fine-tuning sobre nuevos datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅, implementado con LeRobot |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision-Language-Action (VLA) diseñado para robótica de manipulación. Su arquitectura parte del modelo base `lerobot/pi05_base` y sigue la implementación de π₀.₅ de Physical Intelligence, que fue adaptada al ecosistema LeRobot desde el repositorio OpenPI. No se proporcionan detalles sobre la arquitectura interna (número de capas, tipo de atención, mecanismos de decodificación) en la información disponible.

El entrenamiento se realizó con 15.000 pasos, tamaño de lote 16, optimizador AdamW y tasa de aprendizaje 5e-05, con semilla 0. El dataset de fine-tuning contiene 198 episodios y 35.267 frames a 20 FPS. Las tareas incluyen manipulación de objetos como dispensador de jabón, tarros, cereales, bloque de cuchillos, hervidor, peras, patatas, batatas, panecillos, cestas, cajas de comida, pasteles, latas, hamburguesas, limones, naranjas, especias, calabacines y sprays. No se indica si se aplicó RLHF o DPO; el proceso es un fine-tuning supervisado de imitación.

## Capacidades

- Generación de acciones de 7 dimensiones para el control de un robot Panda a partir de observaciones visuales y de estado.
- Entrada multimodal: estado del robot (9 valores) y tres imágenes RGB de 224×224 (vista agente y dos cámaras ojo en mano).
- Especialización en tareas de manipulación de objetos cotidianos (agarre, colocación, apilado) basándose en el dataset de fine-tuning.
- Al ser un modelo π₀.₅, hereda capacidades de generalización a nuevos entornos del modelo base.
- No soporta tool calling, agentes conversacionales ni generación de texto; su salida exclusiva es una acción robótica.

## Casos de uso

- Investigación en robótica de imitación: permite reproducir y evaluar políticas de control visual para un brazo Panda, gracias a la integración con LeRobot y al dataset público asociado.
- Manipulación de objetos en cocina: puede ejecutar tareas como abrir tarros, coger un hervidor o colocar verduras (p. ej., patatas, calabacines) en recipientes.
- Automatización de picking en almacenes: la capacidad de generalización del π₀.₅ base, combinada con este fine-tuning, permite probar la recogida de objetos de distintos tipos sobre una pila.
- Benchmark de visión-acción para robots: sirve como referencia para comparar políticas de manipulación con múltiples cámaras (agentview y ojo en mano) en entornos de simulación o reales.
- Base para transferencia de aprendizaje: al estar publicado como checkpoint de LeRobot, facilita el fine-tuning adicional sobre nuevos conjuntos de datos de manipulación.
- Desarrollo de aplicaciones domésticas de asistencia: la realización de tareas del hogar, como manipular envases de alimentos o dispensadores, puede entrenarse o probarse con esta política.
- Educación y demostraciones: puede usarse en laboratorios para mostrar el flujo completo de entrenamiento y despliegue de un VLA en hardware real (Panda).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tabla de evaluación ni tasas de éxito; únicamente indica que no se han proporcionado resultados de evaluación.

## Requisitos de hardware

- Estimación de VRAM: el modelo tiene 4.143 millones de parámetros. En precisión FP32, los pesos ocupan aproximadamente 16,6 GB; en FP16, alrededor de 8,3 GB. No se incluyen cuantizaciones en el repositorio.
- Se recomienda una GPU CUDA con al menos 12-16 GB de VRAM para inferencia en FP16.
- GPU adecuadas: RTX 4090, A100 40 GB o superior, H100.
- El despliegue está orientado a la librería LeRobot, usando `lerobot-rollout` para ejecutar la política y `lerobot-train` para entrenamiento. También puede integrarse en pipelines con vLLM u otros servidores, aunque no es el caso habitual para este tipo de modelo.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|
| este fine-tuning | 4.143 M | Apache-2.0 | No disponible | HuggingFace |
| `lerobot/pi05_base` | 4.143 M (estimado) | Apache-2.0 | No disponible | HuggingFace |
| `sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0` | 4.143 M (estimado) | Apache-2.0 | No disponible | HuggingFace |
| `sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k` | 4.143 M (estimado) | Apache-2.0 | No disponible | HuggingFace |

No se conocen datos de rendimiento comparativo entre estas variantes, ya que ninguna ha publicado resultados de evaluación.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que se desconoce la tasa de éxito en las tareas.
- El modelo está ajustado a un conjunto de tareas específico (20 categorías de objetos) y puede no generalizar a objetos o entornos no vistos.
- Requiere que las cámaras y el estado del robot coincidan con la configuración de entrenamiento (3 cámaras, estado de 9 dimensiones).
- No se han documentado sesgos; al entrenarse con datos limitados de una configuración concreta, pueden aparecer sesgos hacia las condiciones de iluminación, posiciones de cámara o tipos de robot de la recogida.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe incluir el aviso de licencia y atribución si se redistribuye.
- Riesgo de comportamiento impredecible si el robot o el entorno difieren del usado durante el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__no_mask
- Guía LeRobot para π₀.₅: https://huggingface.co/docs/lerobot/main/en/pi05
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado: https://huggingface.co/sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0
- Modelo relacionado: https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k
