# sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__agentview_camera__static__pi05__seed_0

## Resumen

Este modelo es un fine-tuning de π₀.₅ (Pi05), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence, adaptado e implementado por Hugging Face LeRobot. El modelo original π₀.₅ evoluciona el π₀ para lograr generalización a entornos y situaciones no vistas durante el entrenamiento, y esta versión concreta ha sido ajustada para tareas de manipulación robótica con un robot Panda en un entorno simulado. El fine-tuning se ha realizado sobre el modelo base `lerobot/pi05_base` utilizando el dataset `sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__agentview_camera__static`, que contiene 200 episodios y 69 392 frames a 20 FPS, cubriendo 20 tareas de manipulación de objetos cotidianos (basket, cake, can, jar, etc.).

El modelo tiene 4 143 404 816 parámetros (aproximadamente 4,1 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 28,1 GB. Está diseñado para ser ejecutado mediante el framework LeRobot, que permite tanto el rollout en robots reales como el entrenamiento de nuevas políticas. Su relevancia radica en que demuestra cómo un VLA preentrenado puede adaptarse a tareas específicas de manipulación con un número reducido de episodios, lo que lo convierte en una opción interesante para la investigación en robótica y aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅ de Physical Intelligence, implementado con LeRobot |
| Parametros totales | 4 143 404 816 (≈4,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence. π₀.₅ es un VLA que combina visión, lenguaje y acción para control robótico, diseñado para generalizar a entornos nuevos. La arquitectura interna exacta (número de capas, tipo de atención, etc.) no se detalla en la información proporcionada, pero se sabe que el modelo base fue preentrenado por Physical Intelligence y que esta versión ha sido ajustada mediante aprendizaje por imitación supervisado.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__agentview_camera__static`, que contiene 200 episodios y 69 392 frames a 20 FPS. Las tareas incluyen manipulación de objetos como basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato y scone. La configuración de entrenamiento fue: 45 000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 0. No se menciona el uso de RLHF, DPO ni otras técnicas de refuerzo; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Control de un robot Panda (7 grados de libertad) mediante acciones de 7 dimensiones.
- Procesamiento de observaciones multimodales: estado del robot (vector de 9 dimensiones) y tres cámaras (agentview, robot0_eye_in_hand y robot0_eye_in_hand_2), cada una con imágenes de 224×224 píxeles en RGB.
- Ejecución de tareas de manipulación específicas del dataset de entrenamiento, como recoger y colocar objetos (basket, cake, can, etc.).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No soporta tool calling, agentes conversacionales ni razonamiento multi-paso fuera del ámbito robótico.
- Capacidades multilingües: no aplica, al ser un modelo de control robótico.

## Casos de uso

- Automatización de tareas de picking and placing en entornos simulados: el modelo puede ejecutar tareas de recoger y colocar objetos (basket, cake, can, etc.) en un robot Panda simulado, lo que permite validar algoritmos de control antes de pasar a hardware real.
- Investigación en aprendizaje por imitación: al ser un fine-tuning de un VLA preentrenado, sirve como punto de partida para estudiar cómo adaptar modelos generalistas a tareas específicas con pocos datos (200 episodios).
- Desarrollo de políticas robóticas para manipulación de objetos domésticos: las tareas del dataset (jar, cereal, spray, etc.) son representativas de entornos domésticos, por lo que el modelo puede usarse para prototipar asistentes robóticos en cocinas o almacenes.
- Benchmarking de frameworks de robótica: al estar integrado con LeRobot, permite comparar el rendimiento de diferentes configuraciones de entrenamiento (pasos, batch, LR) sobre una tarea fija.
- Entrenamiento de nuevas políticas mediante fine-tuning: los usuarios pueden partir de este modelo y ajustarlo a sus propios datasets con el comando `lerobot-train`, acelerando el desarrollo de soluciones personalizadas.
- Evaluación de generalización en robótica: dado que π₀.₅ está diseñado para generalizar a entornos nuevos, este fine-tuning puede usarse para medir hasta qué punto la adaptación a tareas concretas mantiene esa capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Con 4,1 mil millones de parámetros y un tamaño de pesos de 28,1 GB en safetensors, se estima que la inferencia en precisión fp32 requeriría al menos 16 GB de VRAM, y en fp16 unos 8 GB. Sin embargo, estos valores son estimaciones no confirmadas.
- Dado el tamaño, es probable que quepa en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) en fp16, pero no hay datos oficiales.
- Para despliegue, el modelo está diseñado para usarse con LeRobot, que soporta ejecución en GPU (CUDA) mediante `lerobot-rollout`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos VLA como OpenVLA o RT-2, ya que no se han publicado resultados de benchmarks ni especificaciones detalladas de arquitectura. Se puede indicar que π₀.₅ es un desarrollo de Physical Intelligence, mientras que OpenVLA es un VLA open source de la comunidad, pero sin datos numéricos no es posible una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para las 20 tareas del dataset y para el robot Panda con las tres cámaras especificadas; no se garantiza su funcionamiento en otros robots o configuraciones de cámara.
- No hay resultados de evaluación publicados, por lo que se desconoce su tasa de éxito real en las tareas.
- Al ser un fine-tuning de un modelo preentrenado, puede heredar sesgos o limitaciones del modelo base, aunque no se documentan sesgos específicos.
- Riesgo de alucinación: no aplica directamente, pero en robótica puede manifestarse como acciones incorrectas o inestables en situaciones no vistas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `lerobot/pi05_base` y del dataset utilizado.
- El tamaño del repositorio (28,1 GB) puede suponer una barrera para entornos con recursos limitados.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__agentview_camera__static__pi05__seed_0)
- [Modelo base: lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__agentview_camera__static)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
