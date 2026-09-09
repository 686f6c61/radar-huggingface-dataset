# mysterium99/smolvla-newtasks-100pct

## Resumen

El modelo `mysterium99/smolvla-newtasks-100pct` es una política de robótica basada en SmolVLA, un modelo vision-language-action (VLA) compacto desarrollado por Hugging Face. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `new_task`, que contiene 420 episodios con 424.832 fotogramas a 30 FPS. Con solo 450 millones de parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo hace adecuado para robots de bajo coste y entornos de investigación. El modelo se ha entrenado con el framework LeRobot y está orientado a tareas de manipulación de objetos, como empujar bloques, apretar una pelota de estrés o clasificar objetos por color. Se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) transformer |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publica en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto de 450 millones de parámetros. La arquitectura procesa las observaciones del robot - tres imágenes de cámara de 256x256 píxeles y un vector de estado de 6 dimensiones - y produce directamente una acción de 6 dimensiones, que se corresponden con los grados de libertad del efector final de un robot tipo Follower. El modelo fue entrenado con LeRobot, realizándose un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `new_task`. La configuración de entrenamiento comprende 20.000 pasos con batch size de 8, optimizador AdamW, learning rate de 0.0001 y semilla 0. El dataset de entrenamiento contiene 420 episodios y 424.832 fotogramas a 30 FPS, con seis tareas de manipulación: empujar un bloque de izquierda a derecha o de derecha a izquierda, apretar una pelota de estrés, girar un bloque 90 grados y volver a colocarlo, clasificar bloques amarillos en un contenedor y otros en otro, y cambiar un bloque de posición horizontal a vertical. No se ha aplicado RLHF ni DPO en este entrenamiento.

## Capacidades

- Genera acciones de 6 grados de libertad a partir de imágenes de cámara y del estado del robot.
- Controla un robot tipo Follower con tres cámaras (cámara superior y cámaras laterales).
- Aprende por imitación a partir de demostraciones capturadas en el dataset `new_task`.
- Está integrado en el ecosistema LeRobot, permitiendo ejecutar roll-outs con el comando `lerobot-rollout`.
- Puede desplegarse en hardware de consumo, según la documentación del modelo.
- No es un modelo de lenguaje general: no soporta herramientas, tool calling ni generación de texto libre.

## Casos de uso

- Automatización de tareas repetitivas en líneas de ensamblaje de pequeño volumen: el modelo puede empujar bloques de un lado a otro o recolocar piezas en posiciones concretas, integrado en un brazo robótico con LeRobot.
- Robótica educativa en laboratorios universitarios: gracias a su bajo coste computacional, permite entrenar y evaluar políticas de manipulación en robots de sobremesa, facilitando la enseñanza de aprendizaje por imitación.
- Investigación comparativa en VLA: sirve como modelo de referencia ligero para comparar arquitecturas de visión-lenguaje-acción en tareas de manipulación, frente a modelos de mayor tamaño como OpenVLA.
- Prototipado rápido de tareas robóticas en entornos controlados: el modelo es adecuado para demostrar tareas como recoger un bloque, girarlo 90 grados y volver a colocarlo, sin necesidad de infraestructura de alto rendimiento.
- Clasificación y ordenación de objetos en logística: puede ejecutar la tarea de mover bloques amarillos a un contenedor izquierdo y el resto al derecho, útil en sistemas de clasificación básicos con robots de bajo coste.
- Aprendizaje de secuencias de manipulación para robótica asistencial: el modelo puede apretar una pelota de estrés o manipular objetos blandos, sirviendo como punto de partida para tareas de interacción física en entornos domésticos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parámetros y un checkpoint de 0.9 GB en safetensors, los pesos en FP16 o BF16 ocupan aproximadamente 0.9-1 GB. La VRAM necesaria para inferencia se estima en 2-4 GB, incluyendo overhead de runtime y buffers de imagen.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como una NVIDIA RTX 3060 12GB o RTX 4060 8GB.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para ejecutarse en hardware de consumo.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`), integración con Hugging Face Hub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla-newtasks-100pct | 450M | new_task (100%) | No disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | Preentrenamiento general | No disponible | Apache 2.0 | HuggingFace |
| mysterium99/smolvla-new-task-pre-10pct | 450M | new_task (10%) | No disponible | Apache 2.0 | HuggingFace |

El modelo base no está fine-tuneado en `new_task`; `smolvla-new-task-pre-10pct` es un fine-tuning parcial con el 10% del dataset, mientras que el modelo analizado utiliza el 100% de los datos.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que el rendimiento real en robots físicos es desconocido.
- El modelo está limitado a las seis tareas concretas del dataset de entrenamiento y a un robot específico tipo Follower.
- Las entradas son fijas: tres cámaras de 256x256 píxeles y un estado de 6 dimensiones. Cualquier cambio en el hardware o en la configuración de las cámaras requiere un reentrenamiento.
- Al ser un modelo de aprendizaje por imitación, hereda los sesgos del dataset de entrenamiento. Puede fallar en entornos con iluminación, oclusiones o posiciones de objetos distintas a las vistas durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantías de soporte ni mantenimiento.
- No soporta tool calling, razonamiento simbólico ni generación de texto; solo genera acciones motoras.

## Enlaces

- https://huggingface.co/mysterium99/smolvla-newtasks-100pct
- https://huggingface.co/lerobot/smolvla_base
- https://huggingface.co/papers/2506.01844
- https://smolvla.net/index_en
- https://huggingface.co/datasets/new_task
- https://huggingface.co/docs/lerobot/index
- https://github.com/huggingface/lerobot
- https://huggingface.co/spaces/lerobot/visualize_dataset?path=new_task
