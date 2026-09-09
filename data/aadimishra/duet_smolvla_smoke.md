# aadimishra/duet_smolvla_smoke

## Resumen

`duet_smolvla_smoke` es un fine-tuning del modelo SmolVLA, realizado por el usuario `aadimishra`, que implementa una política de visión-lenguaje-acción (VLA) para el robot Duet en el simulador MuJoCo. Se parte del checkpoint base `lerobot/smolvla_base` y se entrena sobre el dataset `aadimishra/duet_multitask_language_v1_clean` para tareas concretas de manipulación, como posicionar una pinza sobre una taza amarilla o levantar un bloque rojo. El modelo cuenta con 450.046.176 parámetros, un tamaño muy reducido para un VLA, y se publica bajo licencia Apache 2.0.

La relevancia de este checkpoint radica en que permite estudiar cómo adaptar un modelo VLA compacto a un robot concreto con muy pocos datos de demostración. Además, al estar integrado en el ecosistema LeRobot, puede ejecutarse con herramientas ya existentes y servir como punto de partida para investigar el rendimiento de políticas de bajo coste computacional en robótica. No se dispone de la longitud de contexto ni de otros detalles técnicos en la documentación del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (arXiv:2506.01844); fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA, tal como se describe en el paper arXiv:2506.01844, es un modelo compacto de visión-lenguaje-acción desarrollado por Hugging Face, diseñado para reducir costes computacionales y permitir el despliegue en hardware de consumo. Este checkpoint hereda la arquitectura del modelo base `lerobot/smolvla_base` y añade una cabeza de política adaptada al robot Duet del entorno MuJoCo. Las observaciones de entrada son el estado del robot (6 valores) y cuatro imágenes: tres cámaras RGB de 256x256 píxeles y una imagen adicional de 480x640 píxeles. La salida es una acción continua de 8 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2. Se utilizó el dataset `aadimishra/duet_multitask_language_v1_clean`, que contiene 60 episodios y 2519 frames a 20 FPS. Las tareas incluyen instrucciones en lenguaje natural como "position the left gripper over the yellow mug", "grasp and lift the red block" y variantes similares. La configuración de entrenamiento consta de 500 pasos, batch size 1, optimizador AdamW con tasa de aprendizaje 0.0001 y seed 1000. No se indica el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones robóticas de 8 dimensiones a partir de observaciones de estado y múltiples imágenes, condicionadas por instrucciones de lenguaje natural.
- Manipulación de objetos en el entorno simulado `duet_mujoco`: tareas de posicionamiento de pinza, alcance, agarre y elevación.
- Entrada multimodal: combina estado del robot, tres cámaras RGB y una cámara adicional de mayor resolución.
- Capacidad para entrenarse con un conjunto de demostraciones muy pequeño (60 episodios, 2519 frames).
- No soporta tool calling ni function calling, ya que no es un modelo de lenguaje conversacional.
- Las instrucciones del dataset están en inglés; no se documenta soporte multilingüe.

## Casos de uso

- Investigación en aprendizaje por imitación con VLA compactos: permite analizar el comportamiento de políticas entrenadas con pocos datos en simulación, sin necesidad de infraestructura costosa.
- Prototipado de control robótico en MuJoCo: se puede cargar el modelo con `lerobot-rollout` y ejecutar tareas de manipulación en el robot simulado Duet para validar ideas rápidamente.
- Validación de la calidad de un dataset: al estar entrenado con solo 60 episodios, sirve para verificar si las demostraciones capturan correctamente las habilidades deseadas y ajustar hiperparámetros como el número de pasos.
- Educación en robótica: ofrece un ejemplo práctico y reproducible de cómo una política VLA se integra en LeRobot, con comandos simples para entrenar y ejecutar.
- Desarrollo de tareas de pick-and-place en entornos simulados: puede usarse como base para tareas donde se necesita posicionar, agarrar y levantar objetos siguiendo instrucciones textuales.
- Transferencia de aprendizaje: los usuarios pueden continuar el fine-tuning desde este checkpoint para adaptarlo a nuevas tareas con características similares al robot Duet.
- Evaluación de procedimientos de entrenamiento: permite comparar el efecto de 500 pasos frente a otras configuraciones en la misma arquitectura base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El repositorio pesa 0,9 GB, lo que da una orientación sobre el tamaño de los pesos en safetensors.
- GPU recomendadas: no disponibles en la documentación. El paper de SmolVLA indica que el modelo base está diseñado para hardware de consumo, pero no hay requisitos específicos para este checkpoint.
- ¿Cabe en GPU de consumo? No se especifica, aunque el diseño general de SmolVLA apunta a ello.
- Opciones de despliegue: a través de LeRobot, usando el comando `lerobot-rollout` con `--policy.path=aadimishra/duet_smolvla_smoke`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos suficientes para una comparativa fiable. Este checkpoint es un fine-tuning específico de SmolVLA, y no se han publicado resultados de evaluación que permitan contrastarlo con otras políticas de la misma categoría. El único punto de referencia claro es el modelo base `lerobot/smolvla_base`, del que hereda la arquitectura y el tamaño de parámetros.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (60 episodios, 2519 frames), lo que aumenta el riesgo de sobreajuste y reduce la generalización a situaciones nuevas.
- Solo se ha entrenado para tareas concretas del entorno `duet_mujoco`; no hay evidencia de que se comporte correctamente en otros robots, entornos o configuraciones de cámara.
- No se ha publicado ninguna evaluación, por lo que se desconocen las tasas de éxito y el comportamiento real en condiciones fuera del entrenamiento.
- Los idiomas soportados no están documentados; las instrucciones del dataset están en inglés.
- No se han caracterizado sesgos, aunque el modelo puede heredar las preferencias presentes en las demostraciones (posiciones, objetos y condiciones de iluminación específicas).
- Riesgo de acciones impredecibles si las observaciones difieren significativamente de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo sigue limitado por la naturaleza de sus datos de entrenamiento y el ámbito de tareas cubiertas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aadimishra/duet_smolvla_smoke
- Paper de SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Web de SmolVLA: https://smolvla.net/index_en
- Dataset de entrenamiento: https://huggingface.co/datasets/aadimishra/duet_multitask_language_v1_clean
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
