# sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a50__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo `sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a50__sim__all_cameras__live__pi05__seed_0` es un fine-tuning de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para generalización en mundo abierto. Este fine-tuning ha sido entrenado por el usuario `sam-guided-vlas` sobre un dataset robótico específico, utilizando el framework LeRobot y partiendo del modelo base `lerobot/pi05_base`. El modelo resuelve tareas de manipulación de objetos mediante aprendizaje por imitación, generando acciones de control para un brazo robótico Panda a partir de observaciones visuales y de estado.

Arquitectónicamente, se trata de un transformer VLA con aproximadamente 4.143 millones de parámetros (4,14 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio para robótica. El contexto de entrada no está especificado en la información disponible. La relevancia de este modelo radica en su capacidad para controlar robots en entornos con objetos en poses aleatorias, un escenario habitual en tareas de manipulación con oclusión, y en su integración con el ecosistema LeRobot para facilitar el despliegue y la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) transformer (π₀.₅ / Pi05) |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un modelo VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones nunca vistos durante el entrenamiento. La implementación utilizada es la adaptación de LeRobot, derivada del repositorio OpenPI. Este fine-tuning concreto ha sido entrenado sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a50__sim__all_cameras__live`, que contiene 198 episodios y 35.267 frames a 20 FPS, con tareas de manipulación de objetos cotidianos como "soap dispenser", "jam", "jar", "cereal", "kettle", "potato", entre otras.

La configuración de entrenamiento incluye 45.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 0, con LeRobot versión 0.6.0. No se detallan innovaciones técnicas específicas adicionales en la información disponible, más allá de la arquitectura VLA y la estrategia de fine-tuning sobre el modelo base.

## Capacidades

- Generación de acciones de control robótico: el modelo produce un vector de acción de 7 dimensiones a partir de observaciones de estado de 9 dimensiones y tres imágenes de 224x224 píxeles (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2).
- Manipulación de objetos con poses aleatorias: entrenado específicamente en tareas de apilado y manipulación de objetos con máscaras y superposiciones (overlay), lo que lo hace adecuado para escenarios con oclusión.
- Generalización en mundo abierto: como parte de la familia π₀.₅, el modelo pretende transferir a entornos nuevos no vistos durante el entrenamiento.
- Integración con LeRobot: compatible con el framework LeRobot para entrenamiento, despliegue y evaluación mediante comandos como `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, generación de texto ni razonamiento simbólico: es un modelo de acción robótica, no un modelo de lenguaje general.

## Casos de uso

- Manipulación de objetos en entornos simulados: el modelo puede controlar un brazo Panda para recoger objetos de una pila con poses aleatorias, aprovechando su entrenamiento en tareas de apilado y oclusión.
- Automatización de pick-and-place en laboratorios: se puede integrar con LeRobot para ejecutar tareas concretas como "soap dispenser" o "jar", reduciendo la necesidad de programar rutinas manuales.
- Investigación en aprendizaje por imitación: sirve como política de referencia para estudiar cómo los modelos VLA generalizan a nuevas configuraciones de objetos, ya que fue fine-tuneado sobre un dataset con variabilidad de poses.
- Desarrollo de robots de servicio: el modelo puede adaptarse a tareas de manipulación de objetos cotidianos en entornos domésticos, partiendo del preentrenamiento de π₀.₅ y del fine-tuning específico.
- Evaluación de políticas en simulación: permite probar el comportamiento del robot en simulación antes de desplegar en hardware real, gracias a la compatibilidad con el framework LeRobot y sus herramientas de rollout.
- Fine-tuning para nuevas tareas: se puede utilizar como punto de partida para entrenar políticas sobre nuevos datasets, usando el comando `lerobot-train` con el modelo base `lerobot/pi05_base`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como estimación, con 4.143.404.816 parámetros en FP32 se necesitan aproximadamente 16,6 GB solo para los pesos; en FP16, unos 8,3 GB. El repositorio ocupa 28,1 GB en total.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible oficialmente; por tamaño, podría caber en GPUs de 12-24 GB con cuantización o en FP16, pero no hay datos confirmados.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`). No se mencionan otros motores como vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a50__sim__all_cameras__live__pi05__seed_0 | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace |
| sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0 | No disponible | No disponible | Apache 2.0 | HuggingFace |
| lerobot/pi05_base | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación; el rendimiento real del modelo en un robot físico no está verificado.
- Es un fine-tuning específico para un dataset de tareas de objetos en pila con poses aleatorias; puede no generalizar a otras tareas, entornos o configuraciones de robot.
- Requiere un robot Panda con tres cámaras concretas (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) y observaciones de estado de 9 dimensiones; cualquier cambio en la configuración puede invalidar la política.
- El modelo es un VLA de acción robótica, no un modelo de lenguaje; no es adecuado para tareas de texto, chat o razonamiento simbólico.
- El dataset de entrenamiento contiene un conjunto limitado de objetos y tareas, lo que puede introducir sesgos hacia esos ítems específicos.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar las atribuciones del modelo base y del dataset para asegurar el cumplimiento completo.
- En robótica, las acciones incorrectas pueden causar daños físicos; se recomienda validar el modelo en simulación antes de desplegarlo en un robot real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a50__sim__all_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a50__sim__all_cameras__live
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Perfil de sam-guided-vlas en HuggingFace: https://huggingface.co/sam-guided-vlas
- Modelo similar de sam-guided-vlas: https://huggingface.co/sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0
