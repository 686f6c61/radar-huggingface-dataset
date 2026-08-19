# Hungdd88/smolvla_ur3_multitasks

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para robótica moderna con un coste computacional reducido que permite su despliegue en hardware de consumo. Este repositorio concreto, `Hungdd88/smolvla_ur3_multitasks`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un conjunto de datos de tareas de handover (entrega de objetos) con un brazo robótico UR3, recopilado por el autor Hungdd88.

El modelo cuenta con aproximadamente 450 millones de parámetros y está entrenado para ejecutar 20 tareas distintas relacionadas con la manipulación de objetos: recoger cubos, levantarlos y entregarlos a una mano humana. El dataset de entrenamiento contiene 198 episodios y 15.102 fotogramas a 20 FPS, capturados con tres cámaras. Su relevancia radica en que demuestra la viabilidad de entrenar políticas robóticas multi-tarea con un modelo compacto, de código abierto y con licencia Apache 2.0, accesible para la comunidad investigadora y de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, BF16 (según archivos safetensors del repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje para generar acciones robóticas directamente. La arquitectura está diseñada para ser compacta y eficiente, con 450 millones de parámetros, lo que permite su ejecución en GPUs de consumo. El modelo base fue preentrenado por Hugging Face y este repositorio es un fine-tuning realizado con la librería LeRobot.

El entrenamiento de este fine-tuning se realizó con 8.000 pasos, un batch size de 32, optimizador AdamW y una tasa de aprendizaje de 0,0001. El dataset de entrenamiento, `Hungdd88/smolvla_handover_multitasks`, contiene 198 episodios con 20 tareas diferentes de manipulación y entrega de objetos, capturados a 20 FPS con tres cámaras. El modelo consume como entrada el estado del robot (6 dimensiones) y tres imágenes de 256x256 píxeles, y produce acciones de 7 dimensiones.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones para control de brazo robótico UR3.
- Percepción visual multimodal: procesa simultáneamente tres cámaras RGB de 256x256 píxeles.
- Multi-tarea: entrenado en 20 tareas distintas de recogida, elevación y entrega de objetos.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea adecuada.
- Aprendizaje por imitación: política entrenada mediante demostraciones humanas.
- Ejecución en tiempo real: capacidad de inferencia asíncrona para control robótico reactivo.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo puede recoger piezas de una superficie y entregarlas a un operario o a otra estación de trabajo, reduciendo la intervención manual en tareas repetitivas.
- Robótica asistencial: un brazo robótico equipado con este modelo puede ayudar a personas con movilidad reducida a recoger y entregar objetos cotidianos, como vasos o herramientas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para investigar técnicas de fine-tuning multi-tarea en VLA, ya que su entrenamiento está documentado y reproducible con LeRobot.
- Demostraciones educativas de robótica: su tamaño compacto permite desplegarlo en GPUs de gama media, lo que facilita su uso en laboratorios universitarios con recursos limitados.
- Prototipado rápido de aplicaciones de manipulación: los desarrolladores pueden partir de este modelo y fine-tunearlo con sus propios datos para nuevas tareas de pick-and-place.
- Evaluación de políticas robóticas generalistas: permite comparar el rendimiento de un modelo compacto frente a alternativas más grandes en tareas de handover, útil para decidir el equilibrio entre coste y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye una sección de evaluación con tasas de éxito en pruebas reales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 450 millones de parámetros, requiere aproximadamente 1,8 GB en FP32 y menos de 1 GB en BF16 para la inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060 o superiores funcionan adecuadamente. También puede ejecutarse en GPUs profesionales como A100 o H100 si se requiere mayor throughput.
- Compatibilidad con hardware de consumo: sí, es uno de los puntos fuertes de SmolVLA. Puede ejecutarse en GPUs de gama media de escritorio.
- Opciones de despliegue: el modelo está integrado en la librería LeRobot. Se puede ejecutar con los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. También es compatible con el ecosistema de Hugging Face.
- Latencia y throughput: no se han publicado datos específicos de latencia para este modelo, pero la arquitectura SmolVLA está diseñada para inferencia asíncrona y tiempos de recuperación rápidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| SmolVLA (este repo) | 450M | No disponible | Apache 2.0 | Robótica VLA multi-tarea |
| OpenVLA | 7B | No disponible | MIT | Robótica VLA generalista |
| RT-2 (Google) | 55B | No disponible | Propietaria | Robótica VLA generalista |

SmolVLA se diferencia de OpenVLA y RT-2 por su tamaño reducido (450M frente a 7B y 55B), lo que permite su despliegue en hardware de consumo. Aunque estos modelos más grandes pueden tener mayor capacidad de generalización, SmolVLA ofrece un equilibrio entre rendimiento y coste computacional que lo hace accesible para la mayoría de los laboratorios y desarrolladores.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado específicamente para tareas de handover con un UR3. Su rendimiento en otras tareas o con otros robots no está garantizado.
- Sesgos del dataset: el dataset de entrenamiento contiene 20 tareas concretas con un vocabulario específico ("pick up the cube", "handover the cube", etc.). El modelo puede no entender variaciones lingüísticas fuera de este conjunto.
- Riesgo de alucinación de acciones: como cualquier modelo generativo, puede producir acciones incorrectas o inconsistentes si la entrada visual o textual es ambigua.
- Sin evaluación publicada: no hay datos de tasas de éxito en el mundo real, por lo que el rendimiento real es desconocido.
- Dependencia de LeRobot: el modelo requiere la librería LeRobot para su ejecución, lo que añade una dependencia de software.
- Sin soporte de tool calling ni capacidades de razonamiento complejo: es un modelo de acción robótica, no un asistente conversacional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Hungdd88/smolvla_ur3_multitasks
- Dataset de entrenamiento: https://huggingface.co/datasets/Hungdd88/smolvla_handover_multitasks
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Blog de SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
