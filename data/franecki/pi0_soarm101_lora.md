# franecki/pi0_soarm101_lora

## Resumen

`franecki/pi0_soarm101_lora` es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario franecki para controlar el brazo robótico SO-ARM101 Pro en una tarea específica de agarre y colocación: introducir un cilindro blanco dentro de un círculo negro. El modelo parte de `lerobot/pi0_base`, la implementación de LeRobot del modelo π0 de Physical Intelligence (OpenPI), y se ajusta mediante LoRA con rango 16 durante 10.000 pasos sobre un conjunto de 100 episodios de demostración. El resultado son pesos completos en bf16 de aproximadamente 3.500 millones de parámetros, con el adaptador LoRA fusionado en la base.

La relevancia de este modelo radica en que demuestra un flujo práctico de fine-tuning eficiente para robótica: congelando todos los parámetros del modelo base y entrenando únicamente adaptadores de bajo rango, se obtiene una política funcional para una tarea de manipulación concreta. Además, documenta modificaciones necesarias sobre el código de LeRobot 0.4.4 (fork Seeed) para cargar correctamente los pesos de OpenPI, incluyendo la localización del tokenizer de PaliGemma y un parche para el mapeo de pesos atados `lm_head`/`embed_tokens`. El modelo está pensado para ser desplegado en entornos con GPU NVIDIA de al menos 8 GB de VRAM, incluyendo Jetson AGX Orin.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en π0 (PaliGemma + action expert de flujo) |
| Parametros totales | 3.501.372.176 (~3,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos exportados en bf16) |
| Idiomas soportados | No disponibles (el prompt de entrenamiento es en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16, 7 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π0 de OpenPI, un VLA de flujo (flow matching) que combina un modelo de lenguaje y visión PaliGemma de 3B parámetros con un "action expert" que genera acciones continuas de robot. En este caso, la implementación proviene de LeRobot 0.4.4 (fork Seeed) y el checkpoint base es `lerobot/pi0_base`. El fine-tuning se realizó con LoRA (r=16) congelando todos los parámetros del modelo base, durante 10.000 pasos con batch de 16, lo que equivale a aproximadamente 4 épocas sobre 40.923 frames de 95 episodios de entrenamiento (más 5 de evaluación). El dataset `franecki/pick_place_100_train` contiene demostraciones de una única tarea con dos cámaras (superior y de muñeca) y 6 dimensiones de articulaciones, grabadas a 30 fps con codificación AV1.

Se documentan tres modificaciones clave respecto al base: la localización del tokenizer de PaliGemma en `/root/data/paligemma_tokenizer` (el repositorio original es gated), la eliminación de los procesadores `relative_actions_processor` y `absolute_actions_processor` para compatibilidad con LeRobot 0.4.4, y un parche en `modeling_pi0.py` que copia `paligemma.lm_head.weight` a `paligemma.model.language_model.embed_tokens.weight` para resolver el problema de pesos atados en el checkpoint de OpenPI. El adaptador LoRA (5,4 MB) se fusionó con la base mediante `PeftModel.merge_and_unload()` y se exportó como pesos completos en bf16.

## Capacidades

- Ejecución de tareas de manipulación robótica pick-and-place: el modelo genera un chunk de 50 acciones de 6 dimensiones (articulaciones) a partir de observaciones visuales y de estado.
- Entrada multimodal: dos flujos de imagen (cámara superior y cámara de muñeca, ambas 640x480, redimensionadas internamente a 224x224) más un vector de estado de 6 dimensiones.
- Aprendizaje por demostración: la política se entrena mediante imitación sobre episodios reales de teleoperación.
- Salida de acciones en formato de chunk (action chunking), lo que permite ejecución en bucle de control a baja frecuencia.
- Compatibilidad con LeRobot: el modelo se carga mediante `PI0Policy.from_pretrained()` y se integra con el ecosistema de LeRobot para despliegue en robots.
- Inferencia en Jetson: funciona en hardware embebido como AGX Orin 64GB con tiempos de inferencia de 0,5 a 2 segundos por paso.

## Casos de uso

- Automatización de tareas de recogida y colocación en líneas de producción: el modelo puede controlar un brazo SO-ARM101 Pro para mover piezas de una posición a otra, siempre que la configuración visual y de iluminación sea similar a la del entrenamiento.
- Prototipado de políticas robóticas con fine-tuning LoRA: investigadores pueden adaptar el modelo base π0 a nuevas tareas con pocos datos y recursos limitados, siguiendo el flujo documentado.
- Despliegue en robótica de laboratorio: el modelo sirve como punto de partida para experimentos de manipulación con el SO-ARM101, permitiendo reproducir la tarea de cilindro en círculo en entornos controlados.
- Evaluación de VLA en hardware embebido: gracias a su compatibilidad con Jetson AGX Orin, es útil para probar políticas de manipulación en robots móviles o de bajo consumo.
- Investigación en aprendizaje por imitación: el modelo y su dataset asociado (`franecki/pick_place_100_train`) pueden utilizarse para estudiar el efecto de LoRA en VLA, la transferencia entre tareas o la robustez frente a variaciones de iluminación.
- Comparación de estrategias de entrenamiento: el autor también publica `franecki/pi0_soarm101_expert_only` (entrenado con `train_expert_only` durante 8.000 pasos), lo que permite comparar el rendimiento de LoRA frente a fine-tuning completo en el mismo hardware y tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la pérdida de entrenamiento convergió a aproximadamente 0,15 en 10.000 pasos, sin divergencia, y que la inferencia en Jetson AGX Orin 64GB tarda entre 0,5 y 2 segundos por paso. No hay métricas formales de éxito en la tarea, ni comparaciones con otros modelos en términos de precisión o robustez.

## Requisitos de hardware

- GPU NVIDIA con al menos 8 GB de VRAM (según la model card).
- Jetson AGX Orin 64GB compatible; inferencia de 0,5 a 2 segundos por paso, permitiendo control a 0,5-1 Hz.
- Python 3.10, PyTorch >= 2.2 y < 2.8 (compatible con JetPack 6.x).
- LeRobot 0.4.4 (fork Seeed): `git clone https://github.com/Seeed-Projects/lerobot` e instalación con `pip install -e ".[pi]"` y `pip install peft`.
- Despliegue mediante el cargador de políticas de LeRobot (`PI0Policy.from_pretrained()`), no se mencionan alternativas como vLLM u Ollama, que no aplican a este tipo de modelo.
- El tokenizer debe estar disponible en la ruta `/root/data/paligemma_tokenizer` (o ajustar `policy_preprocessor.json`); no se incluye en el repositorio.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Tarea | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| franecki/pi0_soarm101_lora (este) | pi0_base | ~3,5B | Pick-place cilindro | LoRA 10k pasos | No disponible |
| franecki/pi0_soarm101_expert_only | pi0_base | ~3,5B | Pick-place cilindro | Fine-tuning completo 8k pasos | No disponible |
| pi0_base (OpenPI) | - | ~3,5B | Generalista | Pre-entrenamiento 10k+ horas | Apache 2.0 (según OpenPI) |
| pi0-FAST | pi0 | ~3,5B | Generalista | Autoregresivo con tokenizador FAST | Apache 2.0 (según OpenPI) |

No se dispone de datos cuantitativos de rendimiento para comparar estos modelos en la tarea concreta. La recomendación del repositorio `soarm101-isaac` es usar pi0-FAST por su menor latencia y uso de VRAM, pero no hay métricas publicadas para este caso.

## Limitaciones y advertencias

- El prompt de entrada debe coincidir exactamente con el usado en entrenamiento: `Place the white cylinder into the black circle`. Cualquier variación, incluso de mayúsculas o espacios, puede provocar comportamientos erráticos.
- La política es específica de la tarea y del robot; cambios en iluminación, posición de cámara, textura del objeto o fondo pueden degradar la tasa de éxito.
- El tokenizer no se incluye en el repositorio; es necesario descargarlo de `google/paligemma-3b-pt-224` (repositorio gated) o copiarlo desde el servidor de entrenamiento. Sin él, la carga del modelo falla.
- Se requiere el parche de `modeling_pi0.py` si se quiere reentrenar o cargar adaptadores LoRA; para inferencia con pesos fusionados no es necesario, pero sí para reproducir el entrenamiento.
- La licencia del modelo no está especificada, lo que introduce incertidumbre legal para uso comercial o redistribución.
- El autor menciona una posible vibración del gripper debido a la baja desviación estándar en la normalización de las acciones del gripper; debe verificarse si afecta a la tarea.
- El modelo no es un asistente de lenguaje ni un sistema multimodal general; su única función es generar comandos de control para el robot en la tarea entrenada.
- Los datos de entrenamiento son limitados (95 episodios de una sola tarea), por lo que la generalización a otras configuraciones es muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/franecki/pi0_soarm101_lora
- Datasets asociados: https://huggingface.co/franecki/pick_place_100_train y https://huggingface.co/franecki/pick_place_100 (referenciados en la model card)
- Modelo alternativo con fine-tuning completo: https://huggingface.co/franecki/pi0_soarm101_expert_only
- Repositorio OpenPI de Physical Intelligence: https://www.openpi.net/english.html
- Proyecto soarm101_openpi (rebuild de OpenPI para SO-ARM101): https://github.com/sustechxzd/soarm101_openpi
- Documentación de entrenamiento en Isaac (recomienda pi0-FAST): https://github.com/Jbruslind/soarm101-isaac/blob/main/docs/OPENPI_TRAINING.md
- Ejemplo de fine-tuning π0 con LoRA en AWS: https://deepwiki.com/aws-samples/sample-physical-ai-scaffolding-kit/3-openpi-(p0)-sample
