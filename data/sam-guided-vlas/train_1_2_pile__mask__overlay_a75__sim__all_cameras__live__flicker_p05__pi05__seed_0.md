# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__flicker_p05__pi05__seed_0

## Resumen

El modelo `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__flicker_p05__pi05__seed_0` es un fine-tune de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para control robótico en entornos abiertos. Se basa en el modelo preentrenado `lerobot/pi05_base` y ha sido adaptado a la biblioteca LeRobot de Hugging Face. El modelo está pensado para tareas de manipulación de objetos en un brazo robótico Panda, consumiendo imágenes de tres cámaras y el estado del robot, y generando acciones de 7 dimensiones.

El repositorio incluye 4.143.404.816 parámetros (dato de safetensors), lo que lo sitúa en la categoría de modelos de tamaño medio para robótica. Se ha entrenado durante 45.000 pasos con un dataset de 200 episodios y 69.392 frames a 20 FPS, compuesto por tareas como colocar objetos en una cesta, manipular alimentos envasados o interactuar con utensilios de cocina. Su principal aportación es la capacidad de generalización a nuevos entornos y situaciones, heredada de π₀.₅, aunque este fine-tune concreto no incluye resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basado en π₀.₅ |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: El tamaño del repositorio es de 28.1 GB, lo que incluye el modelo y probablemente checkpoints adicionales.

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi05_base`, que a su vez es la implementación en LeRobot de π₀.₅, un VLA de Physical Intelligence diseñado para generalización open-world. La arquitectura interna no se detalla en la información disponible; el modelo se presenta como un policy que mapea observaciones multimodal (estado del robot de 9 dimensiones y tres imágenes RGB de 224×224) a acciones de 7 dimensiones.

El entrenamiento se realizó con la biblioteca LeRobot (versión 0.6.0), usando un optimizador AdamW con tasa de aprendizaje 5e-05, batch size 16 y 45.000 pasos de entrenamiento. El dataset empleado contiene 200 episodios y 69.392 frames a 20 FPS, con 20 tareas de manipulación de objetos (basket, cake, can, hamburger, lemon, orange, jar, kettle, etc.). No se indica si hubo RLHF, DPO u otras etapas de alineación posteriores al preentrenamiento del modelo base.

## Capacidades

- Control robótico: genera acciones de 7 dimensiones a partir de observaciones visuales y de estado, apto para un brazo robótico Panda.
- Percepción multimodal: procesa tres cámaras simultáneamente (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2), lo que permite una visión del entorno y de la mano del robot.
- Tareas de manipulación: el fine-tune está entrenado para tareas concretas como colocar objetos en una cesta, manipular alimentos envasados, abrir recipientes, etc.
- Generalización open-world: hereda de π₀.₅ la capacidad de adaptarse a nuevos entornos y situaciones no vistas durante el entrenamiento, aunque este fine-tune específico no ha sido evaluado.
- Integración con LeRobot: se puede ejecutar con `lerobot-rollout` y entrenar con `lerobot-train`, facilitando su uso en pipelines de imitación.
- No incluye capacidades documentadas de generación de texto, chat, tool calling, agentes de razonamiento ni soporte de audio.

## Casos de uso

- Investigación en manipulación robótica: el modelo sirve como policy de referencia para estudiar la generalización en tareas de pick-and-place con un brazo Panda.
- Benchmarking de políticas VLA: permite comparar el rendimiento de fine-tunes sobre pi05_base en tareas de simulación con objetos cotidianos.
- Entrenamiento de políticas de imitación: puede usarse como punto de partida para fine-tunes adicionales en nuevos datasets de demostración.
- Simulación de robots para aprendizaje por refuerzo: dado que el dataset es simulado, el modelo puede integrarse en entornos de simulación para iterar rápidamente en el diseño de tareas.
- Automatización de manipulación de alimentos envasados: el dataset incluye objetos como cake, can, jar o cereal, lo que sugiere aplicaciones en entornos de preparación de alimentos.
- Control de robots colaborativos en entornos de laboratorio: las tres cámaras y la salida de acciones de 7 dimensiones permiten tareas de precisión con retroalimentación visual en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no se han proporcionado resultados de evaluación para este policy.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- Estimación basada en el número de parámetros (4.143.404.816): en precisión FP16/BF16, los pesos ocupan aproximadamente 8.3 GB de VRAM, más el espacio para activaciones y el optimizador durante el entrenamiento.
- El tamaño del repositorio (28.1 GB) sugiere que incluye checkpoints adicionales o el modelo en una precisión mayor.
- Para inferencia, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 4080 o superior) si se usa FP16/BF16. No obstante, estos valores son orientativos y no están confirmados por el autor.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot (`lerobot-rollout`, `lerobot-train`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de robótica, no un LLM de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam-guided-vlas/...pi05__seed_0 (este modelo) | 4.143.404.816 | no disponible | Manipulación robótica (Panda) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | Modelo base VLA | Apache 2.0 | Hugging Face |
| sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0 | no disponible | no disponible | Manipulación robótica (Panda) | Apache 2.0 | Hugging Face |

La comparativa se limita a la información disponible en los repositorios de Hugging Face. No se dispone de datos técnicos detallados (contexto, arquitectura) para los modelos comparados.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que el rendimiento real en tareas nuevas o en el mundo real es desconocido.
- El dataset de entrenamiento es simulado (según el nombre del repo, `sim__all_cameras`) y contiene solo 200 episodios, lo que puede limitar la robustez ante variaciones de iluminación, posición o apariencia de los objetos.
- Las tareas están limitadas a una lista de 20 objetos (alimentos envasados, utensilios, etc.) y a un robot Panda; la transferencia a otros brazos robóticos o entornos no está verificada.
- No se documenta el soporte de idiomas; aunque es un VLA, no se especifica qué idiomas puede procesar en las instrucciones de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un modelo experimental sin soporte oficial, el uso en producción requiere una validación propia.
- El modelo consume tres cámaras simultáneamente, lo que puede incrementar la carga computacional y de ancho de banda en tiempo real.
- No se indica si el modelo puede manejar contextos de lenguaje largos ni si soporta razonamiento de alto nivel; sus capacidades se limitan a la generación de acciones robóticas.

## Enlaces

- Modelo: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__flicker_p05__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__flicker_p05
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
