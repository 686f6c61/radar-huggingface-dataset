# HyeonseokE/smolvla_phase1_push_button_A2_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face en colaboración con otros investigadores, que busca democratizar la robótica de aprendizaje por imitación al permitir su ejecución en hardware de consumo. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` realizado por HyeonseokE para la tarea específica de pulsar un botón rojo con un robot SO-101, utilizando el framework LeRobot.

El modelo combina un modelo de lenguaje y visión (VLM) preentrenado con un experto de acciones entrenado mediante flow matching, lo que le permite generar secuencias de acciones de control a partir de observaciones visuales y una instrucción en lenguaje natural. Con 450 millones de parámetros, es significativamente más pequeño que otros modelos VLA como OpenVLA (7 mil millones), lo que lo hace apto para GPUs comerciales. Su relevancia radica en que demuestra que es posible lograr un rendimiento competitivo en manipulación robótica con una fracción del coste computacional de los modelos grandes, y este repositorio en particular ofrece un ejemplo de fine-tuning para una tarea concreta con un dataset reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con VLM compacto y experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un modelo de lenguaje y visión (VLM) preentrenado compacto y un experto de acciones entrenado mediante flow matching. El VLM procesa las imágenes de las cámaras (en este caso tres cámaras, aunque la card indica `top` y `left_wrist`) junto con una instrucción en lenguaje natural, y el experto de acciones genera un chunk de acciones de control del robot. El modelo base `lerobot/smolvla_base` ya incorpora el preentrenamiento sobre datos multimodales y robóticos, y este repositorio es un fine-tuning supervisado sobre un dataset de 100 episodios (11.359 frames a 10 FPS) de la tarea "Press the red button".

El entrenamiento se realizó con LeRobot 0.6.0, con 8.850 pasos, batch size de 64, optimizador AdamW con learning rate 0,0001 y seed 2000. El dataset de entrenamiento se grabó con un robot SO-101 (Solo 6) y cámaras top y left_wrist, con observaciones de estado de 6 dimensiones y acciones de 6 dimensiones. No se ha aplicado RLHF ni DPO; el método es aprendizaje por imitación supervisado con flow matching.

## Capacidades

- Control de robot mediante aprendizaje por imitación: dado un estado de 6 dimensiones, imágenes de 3 cámaras y una instrucción de texto, genera acciones de 6 dimensiones para el robot SO-101.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica con texto ("Press the red button") y el modelo asocia esa instrucción con la secuencia de acciones correspondiente.
- Percepción multimodal: procesa imágenes de múltiples cámaras (top y left_wrist) para entender la escena.
- Generación de acciones con flow matching: produce chunks de acciones suaves y coherentes temporalmente.
- Capacidades multilingües: no disponible; el modelo base SmolVLA soporta instrucciones en inglés, pero no se especifica para este fine-tuning.

## Casos de uso

- Automatización de tareas de pulsación en entornos industriales: el modelo puede controlar un robot SO-101 para pulsar botones de forma autónoma, útil en líneas de ensamblaje o pruebas de calidad. La ventana de contexto y el flow matching permiten acciones precisas y repetibles.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentar con fine-tuning de SmolVLA en tareas similares, gracias a su licencia Apache 2.0 y su integración con LeRobot.
- Prototipado rápido de políticas robóticas: con solo 100 episodios de datos, se obtiene una política funcional, lo que permite validar conceptos de automatización sin grandes recursos de datos ni computación.
- Despliegue en hardware asequible: al ser un modelo de 450 millones de parámetros, puede ejecutarse en GPUs comerciales como una RTX 4090, lo que facilita la experimentación en laboratorios pequeños o universidades.
- Evaluación de robustez en tareas repetitivas: el modelo puede usarse para probar la consistencia de la política en múltiples intentos de pulsación, midiendo tasas de éxito en condiciones controladas.
- Integración en pipelines de robótica con LeRobot: se puede cargar directamente con el comando `lerobot-rollout` y desplegar en el robot, lo que lo convierte en un componente plug-and-play para sistemas de automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no ha incluido una tabla de evaluación en la model card (la sección "Evaluation" está vacía). No hay datos de éxito en tareas, latencia ni throughput en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado que el modelo tiene 450 millones de parámetros, se puede inferir que requiere menos de 2 GB de VRAM en FP16 (aprox. 0,9 GB de pesos). Con cuantización adicional podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una GTX 1660, RTX 3050 o superior. El paper de SmolVLA indica que se puede ejecutar en hardware de consumo.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), que usa PyTorch; también puede exportarse a ONNX o cuantizarse para despliegue en borde.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | sin datos | Apache 2.0 | Hub |
| OpenVLA | 7B | no disponible | en paper | MIT | Hub |
| RT-2 (Google) | 55B | no disponible | en paper | propietaria | No abierto |

No se dispone de datos de rendimiento comparables para este fine-tuning. El paper de SmolVLA (arxiv 2506.01844) reporta que su rendimiento es competitivo con modelos más grandes, pero no se han publicado cifras concretas para esta variante específica.

## Limitaciones y advertencias

- El modelo está entrenado solo para la tarea de pulsar un botón rojo con un robot SO-101; no generaliza a otras tareas o configuraciones de robot sin reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que su rendimiento en entornos fuera de los datos de entrenamiento es incierto.
- El dataset de entrenamiento es pequeño (100 episodios) y puede contener sesgos de posición, iluminación o variaciones del entorno del laboratorio.
- Riesgo de alucinación en la interpretación de instrucciones: si se le da una instrucción fuera del dominio, puede producir acciones incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable verificar los términos del dataset base y del modelo base.
- No hay soporte para idiomas distintos al inglés en las instrucciones (aunque no se ha confirmado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_phase1_push_button_A2_2000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_push_button_A2_10fps
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación de LeRobot (SmolVLA guide): https://huggingface.co/docs/lerobot/main/en/smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
