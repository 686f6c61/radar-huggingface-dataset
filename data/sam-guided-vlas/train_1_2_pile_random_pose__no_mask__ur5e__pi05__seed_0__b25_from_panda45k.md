# sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e__pi05__seed_0__b25_from_panda45k

## Resumen

El modelo `sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e__pi05__seed_0__b25_from_panda45k` es un fine-tuning de `lerobot/pi05_base`, un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence. El modelo base π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones nunca vistos durante el entrenamiento, y su implementación en LeRobot está adaptada del repositorio OpenPI. Este fine-tuning concreto se ha entrenado para un robot UR5e y está especializado en tareas de manipulación sobre una pila de objetos.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y los pesos se almacenan en formato safetensors, con un tamaño de repositorio de 9,4 GB. La licencia es Apache 2.0. El modelo consume observaciones de estado (9 dimensiones) y tres imágenes de 224×224 píxeles, y produce acciones de robot de 7 dimensiones. Se ha entrenado sobre un dataset de 162 episodios y 28.490 frames a 20 FPS, con 20 tareas diferentes que incluyen objetos como "soap dispenser", "jar", "cereal", "kettle", "lemon", "orange", entre otros. No se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), implementado con LeRobot |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (modelo de acciones robóticas, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, que a su vez es la implementación del modelo π₀.₅ de Physical Intelligence. π₀.₅ es un modelo Vision-Language-Action diseñado para generalización en mundo abierto, es decir, para actuar en entornos y situaciones que no aparecieron durante el entrenamiento. La implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence.

El proceso de fine-tuning se realizó sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e`, compuesto por 162 episodios y 28.490 frames a 20 FPS. Las tareas incluyen 20 categorías de objetos, como "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato", "sweet potato", "scone", "basket", "boxed food", "cake", "can", "hamburger", "lemon", "orange", "spice", "squash" y "spray". La configuración de entrenamiento utilizó 5.000 pasos, un batch size de 16, el optimizador AdamW con una tasa de aprendizaje de 5e-05 y una semilla de 0. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Genera acciones de robot de 7 dimensiones a partir de observaciones de estado (9 dimensiones) y tres imágenes de 224×224 píxeles.
- Ejecuta tareas de manipulación sobre una pila de objetos, incluyendo recoger, mover y colocar objetos de 20 categorías distintas.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- No tiene capacidades de lenguaje general, ni soporte de tool calling o function calling.
- No soporta razonamiento multi-paso simbólico ni agentes conversacionales.
- Requiere el entorno específico del robot UR5e con las cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo puede recoger objetos de una pila desordenada usando un robot UR5e, gracias a su entrenamiento sobre 20 categorías de objetos.
- Automatización de tareas de pick-and-place en almacenes: con un UR5e y las tres cámaras configuradas, puede seleccionar y colocar objetos de una lista predefinida, lo que resulta útil para tareas repetitivas de clasificación.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar fine-tunings de π₀.₅ sobre datasets específicos, ya que la implementación en LeRobot facilita la reproducibilidad.
- Despliegue rápido en robótica mediante LeRobot: usando el comando `lerobot-rollout` con `--strategy.type=base` se puede ejecutar la política directamente en el robot, sin necesidad de infraestructura adicional.
- Entrenamiento de políticas personalizadas: se puede partir de este fine-tuning y adaptarlo a nuevas tareas con el mismo robot y las mismas cámaras, aprovechando el conocimiento previo sobre la pila de objetos.
- Evaluación de generalización en mundo abierto: al estar basado en π₀.₅, se puede probar su capacidad para operar en entornos no vistos, aunque la evaluación formal no se ha publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos de MMLU, HumanEval, GSM8K ni de tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 9,4 GB, lo que sugiere almacenamiento en bf16 (4.143.404.816 parámetros × 2 bytes ≈ 8,3 GB), más buffers de activación. Se recomienda una GPU con al menos 12 GB de VRAM para inferencia sin cuantización. Para entrenamiento o fine-tuning adicional, se necesitaría más memoria (24 GB o superior).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 de 24 GB es suficiente para inferencia sin cuantización; una RTX 3090 de 24 GB también sería adecuada.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e__pi05__seed_0__b25_from_panda45k` | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace |
| `sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0` | No disponible | No disponible | Apache 2.0 | HuggingFace |

No se dispone de benchmarks comparativos entre estos modelos. El modelo analizado es un fine-tuning específico para UR5e sobre el dataset de pila de objetos, mientras que `lerobot/pi05_base` es el modelo base sin ajuste fino. El tercer modelo de la tabla es otro fine-tuning de π₀.₅ encontrado en HuggingFace, pero no se han proporcionado detalles técnicos ni de rendimiento en la información disponible.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; la model card indica que no hay resultados de evaluación para esta política.
- El dataset de entrenamiento es pequeño (162 episodios) y está limitado a 20 tareas sobre una pila de objetos, lo que puede provocar sobreajuste y una baja generalización a otros entornos u objetos.
- El modelo depende de la configuración específica del robot UR5e y de las cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`. Cualquier cambio en la disposición de las cámaras o en el tipo de robot puede degradar significativamente el rendimiento.
- No es un modelo de lenguaje: no soporta tool calling, razonamiento simbólico ni generación de texto.
- Riesgo de alucinación de acciones en entornos no vistos, un comportamiento típico de las políticas de aprendizaje por imitación cuando se enfrentan a situaciones fuera de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento en producción no está validado y requiere pruebas exhaustivas en el robot objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e__pi05__seed_0__b25_from_panda45k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
