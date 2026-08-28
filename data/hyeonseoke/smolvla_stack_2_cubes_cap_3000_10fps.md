# HyeonseokE/smolvla_stack_2_cubes_cap_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para tareas de robótica de manipulación. Este repositorio concreto, `HyeonseokE/smolvla_stack_2_cubes_cap_3000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica: apilar un cubo verde sobre un cubo rojo. El modelo ha sido entrenado con el framework LeRobot sobre un dataset propio de 100 episodios grabados a 10 FPS, y está pensado para ejecutarse en hardware de consumo, como una GPU doméstica o incluso CPU.

La arquitectura combina un modelo de lenguaje y visión (VLM) compacto preentrenado con un "experto de acciones" entrenado mediante flow matching. Con 450 millones de parámetros, el modelo es significativamente más ligero que otros VLA como OpenVLA (7B), lo que permite su despliegue en entornos con recursos limitados. Su relevancia radica en democratizar el aprendizaje por imitación en robótica, permitiendo a investigadores y desarrolladores entrenar y ejecutar políticas robóticas sin necesidad de infraestructura de alto coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + action expert con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica con entrada visual, no texto largo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en inglés, pero no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un modelo de lenguaje y visión (VLM) compacto preentrenado, combinado con un "action expert" entrenado mediante flow matching. Dada una o varias imágenes y una instrucción en lenguaje natural, el modelo genera un chunk de acciones de control para el robot. La arquitectura está optimizada para eficiencia: el paper original (arXiv:2506.01844) describe un stack de inferencia asíncrona que desacopla la percepción y la predicción de acciones de la ejecución, permitiendo mayores tasas de control con generación de acciones por chunks.

Este modelo concreto es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `HyeonseokE/stack_2_cubes_cap_10fps`, que contiene 100 episodios y 37.245 frames a 10 FPS. La configuración de entrenamiento incluye 29.050 pasos, batch size de 64, optimizador AdamW, learning rate de 0.0001 y semilla 3000. No se menciona el uso de RLHF o DPO; el entrenamiento es puramente de aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones de control para un robot manipulador de 6 grados de libertad (posición y orientación del efector final).
- Percepción visual multi-cámara: acepta tres imágenes de 256x256 píxeles (cámaras `top`, `left_wrist` y una tercera no especificada).
- Comprensión de instrucciones en lenguaje natural, limitada a la tarea entrenada ("Stack the green block on the red block").
- Fine-tuning eficiente: el modelo base puede adaptarse a nuevas tareas con una sola GPU, según el paper original.
- Inferencia en hardware de consumo: el paper reporta despliegue en GPUs domésticas e incluso CPU.
- Integración con el ecosistema LeRobot: permite entrenamiento, evaluación y despliegue mediante comandos CLI estándar.

## Casos de uso

- Automatización de tareas de apilado en líneas de montaje: el modelo puede controlar un brazo robótico para apilar piezas de forma precisa, reduciendo la intervención humana en entornos industriales repetitivos.
- Manipulación de objetos en laboratorios de investigación: sirve como punto de partida para experimentos de aprendizaje por imitación, permitiendo a los investigadores probar variaciones de la tarea sin entrenar desde cero.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y compatibilidad con LeRobot, se puede entrenar y desplegar una política funcional en horas, acelerando el ciclo de iteración en desarrollo de robótica.
- Educación y formación en robótica: al ejecutarse en GPUs de consumo, es adecuado para cursos universitarios o talleres donde los estudiantes pueden experimentar con VLA sin necesidad de clústeres de GPU.
- Investigación en generalización de tareas: al ser un fine-tuning de un modelo base, puede utilizarse para estudiar cómo se transfieren habilidades entre tareas similares (por ejemplo, apilar diferentes objetos).
- Evaluación de hardware robótico de bajo coste: el modelo está diseñado para el robot `so101_follower`, un brazo de bajo coste, lo que permite validar el rendimiento de plataformas asequibles en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. El paper original de SmolVLA reporta rendimiento competitivo frente a modelos más grandes, pero no se proporcionan números específicos para este fine-tuning concreto.

## Requisitos de hardware

- El tamaño del modelo (450M parámetros, ~0.9 GB en safetensors) sugiere que puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, aunque no se proporcionan datos oficiales de VRAM.
- Según el paper original, SmolVLA puede entrenarse en una sola GPU y desplegarse en GPUs de consumo o incluso CPU.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090) o hardware de gama media. Para CPU, se requiere suficiente RAM (probablemente >8 GB).
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece comandos como `lerobot-rollout` para ejecutar la política en un robot real. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que es un modelo de robótica, no de texto.
- Latencia y throughput: no disponibles. El paper menciona inferencia asíncrona para mejorar la capacidad de respuesta, pero no se dan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la información proporcionada. Sin embargo, se puede contextualizar frente a alternativas conocidas:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | No disponible | No publicado | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | No disponible | No disponible | No disponible |
| RT-2 | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: los datos de OpenVLA y RT-2 no están disponibles en la información proporcionada; se mencionan como referencias del estado del arte, pero no se pueden comparar cuantitativamente sin fuentes adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de apilar un cubo verde sobre uno rojo. No generaliza a otras tareas sin un fine-tuning adicional.
- No se han publicado resultados de evaluación, por lo que el rendimiento real en el robot no está verificado.
- Depende de una configuración específica de cámaras (tres cámaras, incluyendo `top` y `left_wrist`) y del robot `so101_follower`. Cambios en la disposición de cámaras o en el robot pueden degradar el rendimiento.
- El dataset de entrenamiento es limitado (100 episodios), lo que puede introducir sesgos en la política, como sensibilidad a la posición inicial de los objetos o a las condiciones de iluminación.
- Riesgo de alucinación en las acciones si la entrada visual difiere significativamente de los datos de entrenamiento, lo que podría provocar movimientos erráticos o inseguros.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar el trabajo original y cumplir con los términos de la licencia.
- Para uso en producción, se recomienda una validación exhaustiva en el entorno real y la implementación de mecanismos de seguridad (por ejemplo, parada de emergencia).

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_cap_3000_10fps
- Paper original de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/stack_2_cubes_cap_10fps
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
