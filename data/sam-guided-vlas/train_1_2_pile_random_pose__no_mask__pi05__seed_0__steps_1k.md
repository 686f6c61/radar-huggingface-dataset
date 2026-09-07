# sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_1k

## Resumen

Este modelo es un fine-tuning de π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence para la generalización en robótica. La implementación está adaptada al ecosistema LeRobot de Hugging Face, y el checkpoint ha sido entrenado por el usuario `sam-guided-vlas` sobre un dataset de manipulación de objetos en un entorno de tipo "pile" (montón). El modelo parte del base `lerobot/pi05_base` y ha sido ajustado con 1.000 pasos de entrenamiento sobre 198 episodios que incluyen tareas como dispensar jabón, abrir tarros o manipular cereales.

Con 4.143.404.816 parámetros y un peso total de 9,4 GB en formato safetensors, el modelo está diseñado para consumir observaciones de estado del robot (9 valores) y tres imágenes de 224x224 píxeles, y producir acciones de 7 dimensiones para el brazo robótico Panda. La licencia Apache 2.0 permite su uso comercial, y el repositorio está publicado en Hugging Face con el pipeline de robótica. La relevancia actual radica en que ofrece una implementación práctica de π₀.₅ dentro de LeRobot, facilitando la experimentación con políticas de aprendizaje por imitación en tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en el modelo pi05_base de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision-Language-Action (VLA) que integra percepción visual, estado del robot y generación de acciones. Hereda la arquitectura del modelo base `lerobot/pi05_base`, que a su vez proviene del OpenPI de Physical Intelligence. No se proporcionan detalles adicionales sobre la arquitectura interna en la información disponible, pero se trata de un modelo de política robótica que consume observaciones multimodales y produce comandos de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.0, con una configuración de 1.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 0. El dataset utilizado es `sam-guided-vlas/train_1_2_pile_random_pose__no_mask`, que contiene 198 episodios y 35.267 frames a 20 FPS. Las tareas incluyen manipulación de objetos como "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", entre otros. No se menciona ningún proceso de RLHF ni DPO; el ajuste es puramente supervisado mediante aprendizaje por imitación.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones de estado y de tres cámaras (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2).
- Entrada multimodal: estado del robot de 9 dimensiones y tres imágenes RGB de 224x224 píxeles.
- Salida de acciones de 7 dimensiones, compatibles con el brazo robótico Panda.
- Fine-tuning específico para tareas de manipulación de objetos en un entorno de montón ("pile"), con objetos como tarros, botellas, cereales y utensilios de cocina.
- Generalización a nuevos entornos según la filosofía de π₀.₅, aunque no se aportan resultados de evaluación que lo confirmen en este checkpoint.
- Integración nativa con LeRobot, lo que permite cargar el modelo y ejecutar rollouts mediante la CLI `lerobot-rollout`.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de política robótica.

## Casos de uso

- Manipulación de objetos en entornos domésticos: el modelo puede aprender a recoger objetos de un montón y colocarlos en posiciones concretas, gracias a las 35.267 frames de demostraciones recogidas en el dataset. Es adecuado para tareas de recogida y colocación con el brazo Panda.
- Automatización de tareas de cocina: tareas como dispensar jabón, abrir un tarro o manipular un hervidor son parte del entrenamiento. El modelo podría integrarse en un robot de cocina para asistir en la preparación de alimentos.
- Robótica de laboratorio: la manipulación de frascos, botes y muestras es directamente comparable con las tareas del dataset. El modelo puede utilizarse para automatizar la preparación de muestras en entornos controlados.
- Picking en almacenes: la capacidad de trabajar con un montón de objetos heterogéneos (cajas, latas, botellas) permite plantear su uso en tareas de picking y ordenación en almacenes automatizados.
- Investigación en aprendizaje por imitación: el modelo sirve como baseline reproducible dentro de LeRobot para comparar políticas de VLA en tareas de manipulación. Su configuración de entrenamiento está documentada y es fácilmente replicable.
- Fine-tuning para nuevas tareas: al ser un checkpoint intermedio (1.000 pasos), puede utilizarse como punto de partida para ajustes posteriores sobre datasets propios, aprovechando la arquitectura de π₀.₅ y la infraestructura de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de datos de éxito en tareas robóticas ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143.404.816 parámetros, en precisión FP16 se requieren aproximadamente 8,3 GB de VRAM solo para los pesos. Añadiendo activaciones y buffers, se estima un mínimo de 10-12 GB para ejecutar el modelo en modo de inferencia.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) son opciones adecuadas para inferencia. Para entrenamiento o fine-tuning, se recomienda al menos una A100 o una GPU con 40 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en una RTX 3090 o RTX 4090 en FP16, siempre que se disponga de suficiente memoria.
- Opciones de despliegue: el modelo está pensado para utilizarse con LeRobot, mediante `lerobot-rollout` para inferencia en el robot, o `lerobot-train` para reentrenamiento. No se documenta soporte para vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje general.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de velocidad de inferencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_1k` | 4.143.404.816 | no disponible | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | 4.143.404.816 | no disponible | Apache 2.0 | Hugging Face |
| Otros fine-tunings de pi05 de `sam-guided-vlas` | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma familia π₀.₅, ya que no se dispone de datos de rendimiento para realizar una comparación cuantitativa. El modelo es un fine-tuning del base `pi05_base`, por lo que comparte arquitectura y número de parámetros. No se han encontrado modelos comparables con métricas publicadas en la información disponible.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación, por lo que el rendimiento real sobre el robot no está validado. Cualquier uso en producción requiere una validación exhaustiva previa.
- El modelo está entrenado en un dataset reducido de 198 episodios, lo que puede limitar su capacidad de generalización a objetos, posiciones o entornos no vistos.
- Las tareas de entrenamiento son específicas (dispensador de jabón, tarros, cereales, etc.). El modelo puede fallar en objetos o escenas diferentes a las del dataset.
- La configuración de cámaras y del robot Panda es fija en el entrenamiento. Cambios en la disposición de las cámaras, la iluminación o el tipo de robot pueden degradar significativamente el rendimiento.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo base `lerobot/pi05_base` y el dataset asociado pueden tener condiciones adicionales no documentadas en esta ficha.
- No se ha evaluado el modelo frente a sesgos ni riesgos de seguridad. Al tratarse de una política robótica, es necesario implementar supervisión y mecanismos de parada de emergencia en cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_1k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__no_mask
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__no_mask
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
