# sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_3k

## Resumen

El modelo `sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_3k` es un fine-tuning de `lerobot/pi05_base`, un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence. π₀.₅ (Pi05) evoluciona el modelo π₀ para generalizar a entornos y situaciones no vistas durante el entrenamiento, y esta versión concreta ha sido ajustada para tareas de manipulación robótica sobre una pila de objetos con poses aleatorias. El modelo está implementado con la librería LeRobot y adaptado del repositorio OpenPI.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y el repositorio ocupa 9,4 GB, lo que sugiere pesos en fp16 o bf16. Se trata de un modelo de acción robótica que consume observaciones de estado y tres cámaras (224x224) y produce acciones de 7 dimensiones para un robot Panda. La licencia es Apache 2.0, lo que permite uso comercial, y no se han publicado resultados de evaluación para este fine-tuning específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en transformer, fine-tuning de pi05_base |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA de la familia π₀.₅, diseñado para open-world generalization. La implementación de LeRobot se adapta del repositorio OpenPI de Physical Intelligence. En esta variante, el modelo se ha fine-tuned sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__no_mask`, que contiene 198 episodios y 35.267 frames a 20 FPS, grabados con un robot Panda. Las tareas incluyen manipulación de objetos domésticos como dispensadores de jabón, tarros, cereales, teteras, frutas y verduras, entre otros 20 objetos.

El entrenamiento se realizó durante 3.000 pasos con batch size 16, optimizador AdamW y learning rate 5e-05, con semilla 0 y LeRobot 0.6.0. El modelo consume observaciones de estado (9 valores) y tres imágenes RGB de 224x224 (agentview, robot0_eye_in_hand y robot0_eye_in_hand_2), y genera acciones de 7 dimensiones. No se han publicado detalles sobre la arquitectura interna específica ni sobre datos de preentrenamiento del modelo base.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones (posición, orientación, etc.) para manipulación de objetos.
- Entrada multimodal: estado del robot y tres vistas de cámara simultáneas.
- Fine-tuning para tareas de apilado y manipulación de objetos con poses aleatorias.
- Generalización a entornos nuevos, según las características del modelo base π₀.₅.
- Soporte para 20 tareas de manipulación concretas definidas en el dataset de entrenamiento.
- Integración con LeRobot para rollout en robots Panda.
- No se han documentado capacidades de tool calling, generación de texto, razonamiento multilingüe o visión independiente de la robótica.

## Casos de uso

- Manipulación robótica de objetos en entornos no estructurados: el modelo puede ejecutar tareas de recogida y colocación sobre una pila de objetos con poses aleatorias, útil en almacenes o laboratorios de robótica.
- Tareas domésticas automatizadas: por ejemplo, coger un tarro, una tetera o una lata de conservas con un robot Panda, gracias a la entrada de tres cámaras que aportan redundancia visual.
- Interacción con dispensadores de jabón: el modelo está entrenado específicamente en la tarea "soap dispenser", lo que permite aplicar presión y activar el dispensador de forma controlada.
- Investigación en aprendizaje por imitación: el modelo sirve como baseline reproducible para comparar políticas de manipulación entrenadas con LeRobot sobre datasets de demostración.
- Fine-tuning para nuevas tareas robóticas: al estar basado en pi05_base, se puede ajustar con pocos episodios para nuevos objetos o configuraciones de cámara, aprovechando las capacidades de generalización del modelo base.
- Evaluación de políticas en simulación y real: la integración con LeRobot permite ejecutar rollouts en robots reales o en entornos simulados (si se configuran las cámaras y el robot), facilitando la validación de políticas de control.
- Robótica de servicio en entornos cambiantes: el modelo está diseñado para generalizar a situaciones no vistas, lo que lo hace adecuado para aplicaciones donde los objetos aparecen en posiciones arbitrarias y con iluminación variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de datos de éxito, tasas de acierto ni comparativas de rendimiento para este fine-tuning concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en fp16 se requieren aproximadamente 8,3 GB solo para los pesos, más el overhead de activaciones y optimizador, por lo que se recomienda al menos 16 GB de VRAM para inferencia con batch pequeño. Con cuantización 4-bit (no incluida en el repo) podría reducirse a unos 6-8 GB.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100 o Jetson AGX Orin para despliegue embebido en robots.
- Compatibilidad con GPU de consumo: una RTX 3090 o 4090 puede ejecutar inferencia en fp16, aunque la latencia dependerá del número de cámaras y de la frecuencia de control.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch directo, o integración en pipelines de control robótico. No se menciona soporte para vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_3k | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace |
| lerobot/pi05_base | 4.143.404.816 (estimado por ser el base) | No disponible | Apache 2.0 | HuggingFace |
| sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0 | No disponible | No disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos. El modelo analizado es un fine-tuning específico del base, mientras que el segundo de la lista es otra variante de pi05 con configuración de simulación y overlay, también de sam-guided-vlas.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: no hay datos de tasa de éxito ni comparativas con otras políticas, lo que impide validar su rendimiento real.
- Entrenamiento con solo 198 episodios: la cantidad limitada de datos puede restringir la generalización a objetos o configuraciones distintas de las 20 tareas del dataset.
- Especificidad del robot y las cámaras: el modelo espera exactamente tres cámaras con nombres concretos (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un robot Panda; cambiar el hardware o la disposición de cámaras puede degradar el rendimiento.
- Riesgo de acciones incorrectas (alucinación motora): al no existir evaluación, el modelo puede ejecutar acciones erróneas en situaciones fuera de la distribución de entrenamiento, con riesgo físico en robots reales.
- Sesgos del dataset: las tareas se centran en objetos domésticos específicos; el modelo puede fallar con objetos de formas, tamaños o materiales no presentes en el entrenamiento.
- Sin soporte de lenguaje documentado: aunque el modelo base es VLA, esta variante no expone capacidades de comprensión o generación de texto más allá de la entrada de estado y visión.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantías de seguridad ni soporte oficial por parte de Physical Intelligence para este fine-tuning de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_3k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__no_mask
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
