# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k

## Resumen

Este repositorio contiene una política robótica de tipo Vision-Language-Action (VLA) denominada pi05, publicada por el usuario sam-guided-vlas y entrenada con la librería LeRobot de Hugging Face. Se trata de un fine-tuning del modelo base lerobot/pi05_base, que a su vez es la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, adaptada desde su repositorio OpenPI. El modelo resuelve el problema de generar acciones de manipulación robótica directamente a partir de observaciones visuales y de estado, sin necesidad de definir controladores específicos por tarea.

El checkpoint concreto que se documenta aquí corresponde a un entrenamiento de tan solo 1000 pasos sobre un dataset de 200 episodios y 69.392 fotogramas a 20 FPS, con el robot Panda y tres cámaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`). El modelo consume un vector de estado de 9 dimensiones y tres imágenes RGB de 224x224, y produce un vector de acción de 7 dimensiones. El repositorio ocupa 9,4 GB y los pesos suman 4.143.404.816 parámetros (aproximadamente 4,14 mil millones).

Es relevante ahora porque forma parte del ecosistema emergente de modelos VLA abiertos que permiten a investigadores reproducir y comparar políticas de imitación sobre hardware asequible, y porque pi05 representa la línea de trabajo de Physical Intelligence orientada a la generalización en entornos abiertos. No obstante, este checkpoint concreto es un artefacto de experimento (1000 pasos, sin resultados de evaluación publicados) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi05; implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (sin cuantizaciones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (modelo orientado a percepción visual y control motor, no a generación de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | Panda |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entradas | observation.state (9,); observation.images.* (3, 224, 224) por cámara |
| Salidas | action (7,) |
| Libreria | LeRobot |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, descrita por el autor como un modelo Vision-Language-Action diseñado para generalización en entornos abiertos, que evoluciona π₀ para generalizar a situaciones y entornos no vistos durante el entrenamiento. La implementación concreta de este repositorio es la adaptación a LeRobot del repositorio OpenPI de Physical Intelligence. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento del modelo base, la composición exacta del dataset de preentrenamiento, ni si se emplearon técnicas de RLHF o DPO; esos datos deben consultarse en la documentación de π₀.₅ y de OpenPI.

El entrenamiento del checkpoint documentado es un fine-tuning de imitación sobre el dataset `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live`, compuesto por 200 episodios y 69.392 fotogramas capturados a 20 FPS. Las tareas cubiertas son manipulación de objetos de supermercado y cocina: basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato y scone. La configuración de entrenamiento registrada es: 1000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.0. No se documentan innovaciones técnicas adicionales específicas de este checkpoint más allá de las heredadas del modelo base.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 7 grados de libertad (posición y orientación del efector, más pinza) a partir de observaciones visuales y de estado.
- Percepción multi-cámara: integra simultáneamente tres flujos de imagen de 224x224 (`agentview` como vista externa y dos cámaras de muñeca `robot0_eye_in_hand` y `robot0_eye_in_hand_2`).
- Fusión visión-lenguaje-acción: arquitectura VLA que condiciona la acción sobre representaciones visuales y de lenguaje heredadas del modelo base pi05.
- Ejecución condicionada por tarea: acepta un identificador de tarea (por ejemplo `--task="basket"`) que orienta el comportamiento de la política.
- Manipulación de objetos del hogar y alimentación: entrenado sobre las 20 categorías de objetos listadas en el dataset.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (thinking); se trata de una política de control, no de un modelo conversacional.

## Casos de uso

- Recogida y colocación de comestibles en laboratorio: el modelo puede ejecutar tareas de picking sobre las categorías vistas en el dataset (frutas, envases, utensilios) usando las tres cámaras para localizar el objeto y el vector de estado para planificar la acción.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo varía el rendimiento de pi05 en función del número de pasos de fine-tuning, dado que existe una familia de checkpoints con el mismo prefijo y distintos presupuestos de entrenamiento.
- Baseline para comparación de políticas VLA: al estar integrado en LeRobot, permite comparar de forma estandarizada contra otros checkpoints de `pi05_base` u otras políticas sobre el mismo dataset y robot.
- Fine-tuning específico de dominio: partiendo de este checkpoint se puede continuar el entrenamiento sobre un dataset propio con las mismas claves de observación (tres cámaras 224x224 y estado de 9 dimensiones) para adaptar la política a una tarea nueva.
- Automatización de manipulación en simulación: el nombre del repositorio y del dataset incluye la etiqueta `sim`, lo que sugiere su uso en entornos simulados para evaluar generalización antes de trasladar la política a hardware real.
- Docencia y formación en robótica: el flujo `lerobot-rollout` y `lerobot-train` documentado permite montar prácticas de extremo a extremo (captura de datos, entrenamiento, despliegue) con el robot Panda.
- Validación de pipelines de datos: la política se puede usar para verificar que un pipeline de captura (cámaras, FPS, nombres de claves) coincide con el esperado por el modelo antes de lanzar entrenamientos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, comparativas numéricas ni métricas de control (por ejemplo, error de posición o tasa de agarre) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, los pesos en bfloat16 ocupan aproximadamente 8,3 GB; en float32, alrededor de 16,6 GB. Hay que sumar la memoria de activaciones de tres cámaras a 224x224 y del estado, por lo que un presupuesto práctico de 12-16 GB de VRAM es razonable para inferencia en bf16.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100 para despliegues con mayor paralelismo o lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080/4090, RTX 3090, y previsiblemente en 12 GB con cuantización, aunque no se publican cuantizaciones oficiales).
- Opciones de despliegue: el flujo oficial es LeRobot mediante el comando `lerobot-rollout` con `--policy.path=<repo_id>`, y el reentrenamiento mediante `lerobot-train`. No se documenta soporte específico para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. El dataset de entrenamiento se capturó a 20 FPS, lo que da una referencia de la frecuencia de control objetivo, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05, seed 0, 1000 pasos) | 4,14 mil millones | no disponible | VLA (fine-tuning) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | VLA (base) | no disponible en la información proporcionada | Hugging Face (modelo base citado) |
| Otras políticas VLA (OpenVLA, π₀, etc.) | no disponible en la información proporcionada | no disponible | VLA | no disponible | no disponible |

La información proporcionada solo permite comparar contra el modelo base `lerobot/pi05_base`, del que se sabe que es el origen del fine-tuning, pero no se detallan sus parámetros, licencia ni métricas en esta ficha. Para alternativas de la misma categoría (políticas VLA para manipulación) no se dispone de datos verificables en la información recibida.

## Limitaciones y advertencias

- Entrenamiento muy corto: 1000 pasos con batch 16 sobre 200 episodios es un presupuesto reducido; cabe esperar un rendimiento limitado y poco robusto fuera de la distribución del dataset.
- Sin evaluación publicada: no existe ninguna tasa de éxito ni validación en robot real documentada para este checkpoint, por lo que no se puede afirmar que la política funcione en producción.
- Sesgos de dominio: el modelo está entrenado sobre un conjunto específico de 20 categorías de objetos, un tipo de robot concreto (Panda) y tres cámaras con nombres y posiciones fijas. Cambiar cualquiera de esas condiciones invalida el uso directo.
- Dependencia de la configuración de sensores: las claves de observación (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), las resoluciones (224x224) y la dimensionalidad del estado (9) deben coincidir exactamente con las del entrenamiento.
- Riesgo de sobreajuste y alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución o intentos de agarre fallidos ante objetos no vistos, iluminación distinta o posiciones nuevas.
- Idiomas: no se documentan capacidades lingüísticas; el condicionamiento por tarea se limita a etiquetas como `basket`, no a instrucciones en lenguaje natural libre.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero conviene verificar las condiciones del modelo base `lerobot/pi05_base` y del modelo original π₀.₅ de Physical Intelligence, ya que la información sobre estas no está incluida en la ficha.
- Trazabilidad: 0 descargas y 0 likes, sin documentación adicional ni resultados, lo que dificulta validar su calidad frente a otros checkpoints del mismo autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
