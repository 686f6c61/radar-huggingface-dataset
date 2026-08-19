# eslab1234/smolvla_red_125ep_unfrozen_b8_lr1e4_50k_v1

## Resumen

Este modelo es un fine-tuning de **SmolVLA**, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico en tiempo real sobre hardware de consumo. El autor, `eslab1234`, ha ajustado el modelo base `lerobot/smolvla_base` para una tarea específica de manipulación: recoger bloques de colores (rojo, azul, verde, amarillo y madera) y colocarlos en una zona objetivo. El entrenamiento se realizó con el framework LeRobot sobre un dataset propio de 125 episodios, con 155 763 frames a 30 FPS, y una configuración de 50 000 pasos, batch size 8 y learning rate 1e-4.

El modelo resultante tiene 450 millones de parámetros y está especializado en la tarea de *pick and place* con tres cámaras (superior, muñeca y lateral). Aunque no se han publicado resultados de evaluación, su tamaño compacto lo hace adecuado para despliegue en GPUs de gama media o incluso en sistemas embebidos, lo que lo convierte en una opción interesante para prototipado y aplicaciones robóticas de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM y decoder de acciones |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes de 480x640 y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizable con herramientas estándar) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (a través de LeRobot) |

## Arquitectura y entrenamiento

SmolVLA combina un encoder de visión (basado en SmolVLM) con un modelo de lenguaje y un head de acciones. Procesa observaciones multimodales: tres imágenes RGB de 480x640 y un vector de estado del robot de 6 dimensiones, y genera un vector de acción de 6 dimensiones (posiblemente posición y orientación del efector). El modelo base fue preentrenado en tareas de manipulación generales y este fine-tuning lo adapta a la tarea específica de *pick and place* de bloques.

El entrenamiento se realizó con LeRobot 0.5.2, usando el optimizador AdamW, batch size 8, learning rate 1e-4 y 50 000 pasos. Se empleó el dataset `eslab1234/task1_pick_place_5blocks_125ep_merged_v1` con 125 episodios. No se menciona el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje por imitación supervisado (behavior cloning). El modelo se entrenó con los pesos del encoder "descongelados" (unfrozen), lo que permite una adaptación más profunda a la tarea.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad a partir de observaciones visuales y estado del robot.
- Percepción visual multimodal: procesa tres cámaras simultáneamente (superior, muñeca, lateral) para estimar la posición de objetos y planificar movimientos.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento, como recoger y colocar bloques de colores.
- Inferencia en tiempo real: al ser un modelo compacto (450M), puede ejecutarse a velocidades suficientes para control en bucle cerrado en hardware de consumo.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de rollout y entrenamiento.

## Casos de uso

- Automatización de tareas de *pick and place* en líneas de montaje: el modelo puede controlar un brazo robótico para recoger piezas de una cinta y colocarlas en posiciones definidas, gracias a su capacidad de procesar múltiples cámaras y generar acciones precisas.
- Prototipado rápido de políticas robóticas: investigadores y desarrolladores pueden usar este fine-tuning como punto de partida para nuevas tareas, ajustándolo con datasets propios mediante LeRobot, reduciendo el tiempo de desarrollo.
- Educación en robótica: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para laboratorios universitarios que necesitan un sistema de control de bajo coste y fácil de desplegar.
- Manipulación de objetos en entornos domésticos: puede adaptarse a tareas como recoger cubiertos o apilar platos, siempre que se entrene con datos específicos del entorno.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como baseline para comparar nuevas técnicas de behavior cloning o refuerzo en tareas de manipulación.
- Robótica asistencial: con un dataset ampliado, podría emplearse en asistentes robóticos para ayudar a personas con movilidad reducida en tareas de recoger y colocar objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación del policy en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M de parámetros, en FP16 se requieren aproximadamente 900 MB solo para los pesos, más el overhead de las activaciones y el procesamiento de imágenes. Con cuantización a 8 bits, la VRAM necesaria podría reducirse a unos 500 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como una NVIDIA GTX 1650, RTX 3050 o superior. Para entrenamiento, se recomienda una RTX 3090 o A100 si se usan batch sizes grandes.
- Cabe en GPUs de consumo: sí, es uno de los puntos fuertes de SmolVLA. Se puede ejecutar en una RTX 4060 o incluso en una Jetson Orin para aplicaciones embebidas.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo conectan al robot. También es posible exportar los pesos a formato ONNX o TensorRT para optimización, aunque no está documentado en la model card.
- Latencia y throughput: no se proporcionan datos, pero por el tamaño del modelo y la arquitectura, se espera una inferencia en el orden de 10-30 ms por paso en una GPU moderna, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **SmolVLA (este fine-tuning)** | 450M | Imágenes + estado | Pick and place de bloques | Apache 2.0 | Hugging Face |
| **OpenVLA** | 7B | Imágenes + instrucciones | Manipulación general | MIT | Hugging Face |
| **RT-2** | 55B | Imágenes + texto | Manipulación general | No abierta | No disponible |
| **Octo** | 93M | Imágenes + instrucciones | Manipulación general | Apache 2.0 | Hugging Face |

SmolVLA destaca por su tamaño reducido frente a OpenVLA (450M vs 7B), lo que permite desplegarlo en hardware mucho más modesto. A diferencia de RT-2, que no es de código abierto, este modelo es totalmente accesible. Comparado con Octo, SmolVLA incorpora un componente de lenguaje más potente y un entrenamiento específico para la tarea de *pick and place*, aunque Octo es más genérico.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado únicamente para la tarea de recoger y colocar bloques de colores en una zona objetivo. No generaliza a otras tareas ni a variaciones significativas del entorno (iluminación, posiciones de objetos, etc.) sin reentrenamiento.
- Dataset pequeño: 125 episodios pueden provocar sobreajuste, lo que se traduce en baja robustez ante perturbaciones no vistas durante el entrenamiento.
- Sin evaluación publicada: no hay métricas de éxito en el robot real, por lo que se desconoce su rendimiento real en condiciones operativas.
- Dependencia del hardware: el modelo espera tres cámaras específicas (top, wrist, side) con resoluciones de 480x640 y un robot tipo `so_follower`. Cambiar la configuración requiere reentrenar o adaptar el modelo.
- Riesgo de alucinación en acciones: como cualquier modelo de aprendizaje por imitación, puede generar acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- Sin soporte multilingüe ni de lenguaje natural: no procesa instrucciones de texto; es un modelo puramente reactivo a las imágenes y al estado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/eslab1234/smolvla_red_125ep_unfrozen_b8_lr1e4_50k_v1)
- [Paper SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/eslab1234/task1_pick_place_5blocks_125ep_merged_v1)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Guía de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
