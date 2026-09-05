# Odog16/pi05-lora-ob15-keys

## Resumen

Odog16/pi05-lora-ob15-keys es una adaptación LoRA (Low-Rank Adaptation) del modelo Pi0.5 (π₀.₅) de Physical Intelligence, desarrollada por Odog16 e integrada en el ecosistema LeRobot. Pi0.5 es un modelo Vision-Language-Action (VLA) diseñado para generalizar a entornos y tareas nunca vistos durante el entrenamiento, evolucionando la arquitectura de Pi0. Este fine-tuning concreto especializa el modelo base en la tarea de recoger llaves y depositarlas en un cuenco azul, utilizando un robot de tipo OB15 con tres cámaras (base, muñeca izquierda y muñeca derecha) y un vector de estado de 32 dimensiones.

La relevancia de este modelo radica en que muestra cómo adaptar un VLA de propósito general a una tarea robótica específica mediante LoRA, lo que reduce drásticamente el coste computacional del fine-tuning en comparación con entrenar el modelo completo. El enfoque es útil para desarrolladores e investigadores que trabajan en manipulación robótica, imitación learning y despliegue rápido de políticas en robots reales con LeRobot. Los parámetros totales, la longitud de contexto y los benchmarks de rendimiento no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) transformer, basado en Pi0.5 (implementación LeRobot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (adaptación LoRA, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base [lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base), que a su vez está basado en Pi0.5 de Physical Intelligence. La implementación de LeRobot se adapta del repositorio open-source OpenPI de Physical Intelligence. Al tratarse de un LoRA, no se entrenan todos los parámetros del modelo, sino un subconjunto de matrices de bajo rango, lo que permite un fine-tuning eficiente partiendo de un VLA ya preentrenado con capacidades de generalización open-world.

El entrenamiento se realizó sobre el dataset Odog16/keys_into_bowl_ob15_depth_rgb, compuesto por 70 episodios y 30 325 frames a 30 FPS. La configuración de entrenamiento documentada incluye 30 000 pasos, batch size de 4, optimizador AdamW, tasa de aprendizaje de 2,5e-05 y semilla 42, usando la versión 0.6.1 de LeRobot. La política consume tres imágenes RGB de 224x224 (base, muñeca izquierda, muñeca derecha) y un estado de 32 dimensiones como entrada, y produce un vector de acción de 18 dimensiones como salida. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Ejecución de tareas de manipulación robótica a partir de observaciones multimodales: imágenes RGB y estado del robot.
- Integración con el entorno LeRobot para inferencia con el comando `lerobot-rollout` y entrenamiento con `lerobot-train`.
- Adaptación LoRA sobre Pi0.5, lo que permite retener la capacidad del modelo base para generalizar a entornos nuevos, aunque el fine-tuning la especializa en la tarea concreta.
- Soporte de entrada de tres cámaras (base, muñecas) con resolución 224x224, habitual en robots bimanuales con visión.
- Salida de comandos de acción de alta dimensión (18 dimensiones), adecuada para controlar articulaciones o efector del robot OB15.
- No soporta tool calling, function calling ni agentes conversacionales; es un modelo de política de acción para robótica.
- No se documentan capacidades multilingües; la tarea del dataset está definida en inglés ("pick up the keys and put them in the blue bowl").

## Casos de uso

- Manipulación de objetos en entornos domésticos: la política puede desplegarse en un robot OB15 para recoger llaves de una mesa y dejarlas en un cuenco azul, usando las tres cámaras como entrada visual. El control se ejecuta de forma continua con `lerobot-rollout`.
- Automatización de tareas de pick-and-place en laboratorios o almacenes: se puede adaptar la política a otros objetos y contenedores reentrenando con pocos episodios nuevos, gracias al enfoque LoRA.
- Prototipado rápido de tareas robóticas en LeRobot: los desarrolladores pueden usar este modelo como punto de partida para probar la integración de Pi0.5 en sus propios robots, aprovechando que la implementación ya está en LeRobot.
- Investigación en imitación learning: sirve como ejemplo de fine-tuning eficiente de un VLA con LoRA para una tarea concreta, permitiendo estudiar cómo afecta el tamaño del dataset a la robustez de la política.
- Evaluación de generalización en robótica: se puede probar la política en entornos con distinta iluminación, posiciones de objetos o distracciones para medir la capacidad de transferencia del modelo base Pi0.5.
- Desarrollo de robots bimanuales con visión en muñecas: el modelo consume imágenes de ambas muñecas y la cámara base, lo que lo hace adecuado para tareas que requieren coordinación bimanual y control fino.
- Despliegue en sistemas de control de robots con feedback de estado: la entrada de estado de 32 dimensiones permite integrar propiocepción del robot, útil para tareas que requieren conocer la configuración articular antes de generar acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye resultados de evaluación y el autor indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no se dispone de métricas como tasas de éxito, porcentaje de tareas completadas ni comparativas con otros modelos en la tarea concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una adaptación LoRA sobre el modelo base Pi0.5, se requiere cargar el modelo base completo más los pesos LoRA, pero no se documentan los requisitos de VRAM específicos.
- GPU recomendadas: no disponible. La configuración de entrenamiento mostrada en la documentación de LeRobot utiliza `--policy.device=cuda`, lo que implica que se necesita una GPU NVIDIA compatible con CUDA.
- Si cabe en consumer GPU: no confirmado. El modelo base VLA es grande, pero la inferencia podría ejecutarse en GPUs de gama alta, aunque sin datos oficiales no se puede afirmar.
- Opciones de despliegue: se puede ejecutar con LeRobot (`lerobot-rollout`), también es compatible con la librería LeRobot para cargar el modelo. No se mencionan otras opciones como vLLM, llama.cpp u Ollama, ya que es un modelo de política robótica y no un modelo de lenguaje general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Formato |
|---|---|---|---|---|
| Odog16/pi05-lora-ob15-keys | LoRA sobre Pi0.5 | Recoger llaves y ponerlas en un cuenco azul (OB15) | Apache 2.0 | safetensors |
| lerobot/pi05_base | Modelo base VLA | Tareas generales de manipulación | Apache 2.0 | safetensors |
| lerobot/pi05_libero_base | Fine-tuning sobre Pi0.5 | Tareas del benchmark LIBERO | Apache 2.0 | safetensors |

Los parámetros, contexto y rendimiento de estos modelos no están documentados en la información disponible, por lo que no se pueden comparar numéricamente. La diferencia principal es que este modelo está especializado en una tarea específica mediante LoRA, mientras que los otros dos son más generales o están afinados para otro benchmark.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento y la robustez de la política están sin verificar.
- El dataset de entrenamiento es pequeño (70 episodios), lo que puede provocar sobreajuste a las condiciones específicas del dataset (iluminación, posiciones de objetos, colores) y reducir la generalización.
- La política está adaptada al robot OB15 y a las observaciones configuradas (base, muñecas). Cualquier cambio en el robot o en las cámaras requerirá modificar los nombres de las observaciones o reentrenar la política.
- Al ser una adaptación LoRA, es necesario cargar el modelo base `lerobot/pi05_base` junto con los pesos LoRA para llevar a cabo la inferencia, lo que incrementa los requisitos de memoria frente a un modelo compacto.
- No hay información sobre sesgos, pero el modelo puede heredar sesgos del dataset de entrenamiento, como preferencias por orientaciones o condiciones de luz concretas.
- No se documentan los idiomas soportados. La instrucción de la tarea está en inglés, por lo que el uso con prompts en otros idiomas es arriesgado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no garantiza la seguridad ni la idoneidad para entornos de producción.

## Enlaces

- [Odog16/pi05-lora-ob15-keys en Hugging Face](https://huggingface.co/Odog16/pi05-lora-ob15-keys)
- [Blog de Pi0.5 de Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Guía de LeRobot para Pi05](https://huggingface.co/docs/lerobot/pi05)
- [Repositorio OpenPI de Physical Intelligence](https://github.com/Physical-Intelligence/openpi)
- [Dataset Odog16/keys_into_bowl_ob15_depth_rgb](https://huggingface.co/datasets/Odog16/keys_into_bowl_ob15_depth_rgb)
- [Repositorio LeRobot de Hugging Face](https://github.com/huggingface/lerobot)
