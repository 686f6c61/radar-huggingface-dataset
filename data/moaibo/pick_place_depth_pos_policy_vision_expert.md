# MoAIBo/pick_place_depth_pos_policy_vision_expert

## Resumen

El modelo `MoAIBo/pick_place_depth_pos_policy_vision_expert` es una política robótica de visión-lenguaje-acción (VLA) desarrollada por MoAIBo, fine-tuneada a partir del modelo base `lerobot/smolvla_base`. SmolVLA es una arquitectura compacta y eficiente diseñada para control robótico, que combina un codificador de visión con un modelo de lenguaje pequeño para producir acciones de control a partir de observaciones visuales y de estado. Este modelo concreto se ha entrenado para una tarea de *pick-and-place* en un robot `so101_tb4` (probablemente un robot móvil con brazo), usando cinco cámaras, incluida una cámara de profundidad, y un estado de 9 dimensiones.

El modelo resuelve el problema de la manipulación robótica guiada por visión en entornos de laboratorio, ofreciendo una alternativa ligera a los grandes VLA como OpenVLA, con un coste computacional reducido y apto para hardware de consumo. Su relevancia radica en la creciente demanda de modelos de control robótico eficientes que puedan ejecutarse en tiempo real en robots de bajo coste. El modelo tiene 450 millones de parámetros, lo que lo sitúa en la gama compacta de VLA, y está licenciado bajo Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en SmolVLA (codificador de visión + modelo de lenguaje pequeño) |
| Parámetros totales | 450 046 176 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (modelo robótico, no multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA presentada en el paper [arxiv:2506.01844](https://arxiv.org/abs/2506.01844). SmolVLA combina un codificador de visión (posiblemente un ViT) con un modelo de lenguaje pequeño (tipo SmolLM) y un cabezal de regresión para generar acciones continuas. En este caso, el modelo consume cinco flujos visuales: `camera_left`, `camera_right`, `camera_wrist`, `camera_d455` y `depth`, todos de dimensiones (3, 360, 640), más un vector de estado de 9 dimensiones. La salida es un vector de acción de 8 dimensiones, probablemente correspondiente a la posición/orientación del efector final y la velocidad.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `MoAIBo/so101_tb4_pick_place_depth_pos`, que contiene 68 episodios y 90 743 frames a 30 FPS. Las tareas específicas son "Undock, pick up the blue object from the brown box, place it on the white plate, and return to the dock." y la variante con el objeto amarillo. Se usaron 50 000 pasos de entrenamiento con batch size 13, optimizador AdamW y learning rate 0.0001. No se menciona el uso de RLHF o DPO; es un fine-tune de imitación.

## Capacidades

- **Control robótico de manipulación**: genera acciones de 8 dimensiones para tareas de pick-and-place sobre un robot móvil con brazo.
- **Visión multicámara**: procesa simultáneamente cuatro cámaras RGB (izquierda, derecha, muñeca y D455) y una cámara de profundidad.
- **Aprendizaje por imitación**: entrenado con demostraciones humanas o teleoperadas para ejecutar la tarea de forma autónoma.
- **Soporte de estado de robot**: usa el estado de 9 dimensiones del robot (posiblemente posición, orientación y velocidades) como entrada adicional.
- **Tarea específica**: solo está entrenado para las dos tareas descritas (recoger objeto azul o amarillo de una caja marrón, colocarlo en un plato blanco y volver al dock).
- **No es un modelo de lenguaje general**: no genera texto ni responde a preguntas; su salida es únicamente el vector de acción.

## Casos de uso

- **Automatización de líneas de montaje**: el modelo puede integrarse en un robot móvil para recoger y colocar componentes específicos (como piezas de color) en ubicaciones designadas, reduciendo la intervención humana.
- **Logística de almacén**: tareas de recogida y colocación de objetos en almacenes, por ejemplo, mover paquetes de una estación a otra siguiendo instrucciones visuales.
- **Investigación en robótica**: como modelo de referencia para estudiar técnicas de aprendizaje por imitación, transferencia de dominio y generalización en VLA.
- **Prototipado rápido de políticas**: gracias a su tamaño compacto y licencia Apache-2.0, puede integrarse en laboratorios de investigación sin grandes recursos de cómputo.
- **Educación en robótica**: para enseñar a estudiantes cómo entrenar y desplegar políticas de manipulación en robots de bajo coste.
- **Sistemas de recogida y clasificación**: en plantas de reciclaje o clasificación de objetos, puede adaptarse para separar artículos por color o forma, aunque requiere fine-tuning adicional para nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 450 M de parámetros, los pesos en FP16 ocupan aproximadamente 0,9 GB. Sin embargo, el procesamiento simultáneo de cinco imágenes de (3, 360, 640) exige memoria adicional para las activaciones. Se estima que se necesita al menos 8 GB de VRAM para una inferencia fluida con batch 1.
- **GPU recomendadas**: una RTX 3090 o RTX 4090 (24 GB) es más que suficiente; incluso una RTX 3060 de 12 GB podría ser viable si se reduce la resolución de imagen.
- **Compatibilidad con GPU de consumo**: sí, es un modelo compacto pensado para hardware de consumo, como se indica en el paper SmolVLA.
- **Opciones de despliegue**: se puede ejecutar con el framework LeRobot mediante el comando `lerobot-rollout` (como se muestra en la model card). También es probable que sea compatible con herramientas como vLLM o TGI, aunque no se especifica en la documentación.
- **Latencia y throughput**: no se proporcionan datos concretos. Dado el tamaño, se espera una latencia de inferencia de pocas decenas de milisegundos en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MoAIBo/pick_place_depth_pos_policy_vision_expert` | 450 M | no disponible | VLA | Apache-2.0 | Fine-tune de SmolVLA |
| OpenVLA | 7 B | 2048 tokens | VLA | Apache-2.0 | Base pública |
| RT-2 | 55 B | no disponible | VLA | No pública | No disponible |
| Octo | 93 M | no disponible | VLA | Apache-2.0 | Base pública |

Nota: los datos de OpenVLA y RT-2 son aproximados y pueden no ser exactos. No se dispone de comparaciones de rendimiento directas.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo está entrenado únicamente para dos tareas de pick-and-place con objetos azul y amarillo en una configuración específica. No generaliza a otras tareas ni a objetos de otros colores o posiciones.
- **Riesgo de alucinación de acciones**: al ser una política de imitación, puede generar acciones no seguras si se le presentan observaciones fuera de la distribución de entrenamiento.
- **Sensibilidad a la configuración de cámaras**: el modelo espera exactamente cinco cámaras con nombres específicos (`camera_left`, `camera_right`, `camera_wrist`, `camera_d455`, `depth`). Cualquier cambio en la disposición o calibración de las cámaras puede degradar el rendimiento.
- **Sin evaluación publicada**: no hay resultados de éxito en robot real, por lo que el rendimiento real es desconocido.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe incluir el aviso de copyright y las condiciones de la licencia en la redistribución.
- **Falta de soporte multilingüe**: no es un modelo de lenguaje; su uso es exclusivamente robótico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MoAIBo/pick_place_depth_pos_policy_vision_expert)
- [Dataset de entrenamiento](https://huggingface.co/datasets/MoAIBo/so101_tb4_pick_place_depth_pos)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
