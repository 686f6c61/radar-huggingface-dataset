# HyeonseokE/smolvla_push_cube_cap_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para tareas de robótica y control de manipuladores. Este repositorio concreto, `HyeonseokE/smolvla_push_cube_cap_1000_10fps`, es un fine-tune del modelo base `lerobot/smolvla_base` entrenado para la tarea específica de empujar un cubo hasta un marcador objetivo, utilizando un robot tipo `so101_follower` con dos cámaras (superior y muñeca izquierda). El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y modificación.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en una tarea robótica concreta mediante fine-tuning, manteniendo la posibilidad de ejecutarse en hardware de consumo. Está entrenado con el framework LeRobot y el dataset `HyeonseokE/push_cube_cap_10fps`, que contiene 100 episodios y 21.210 frames a 10 FPS. Aunque no se han publicado resultados de evaluación en la información disponible, el modelo representa un ejemplo práctico de aplicación de SmolVLA en un escenario de manipulación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, fine-tune de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea robótica, no procesamiento de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos motores a partir de observaciones de cámaras y estado del robot. La arquitectura exacta no se detalla en la información proporcionada, pero se sabe que es un modelo compacto optimizado para reducir coste computacional y permitir despliegue en hardware de consumo, según el paper asociado (arXiv:2506.01844). Este repositorio concreto es un fine-tune del modelo base `lerobot/smolvla_base`, entrenado con el framework LeRobot (versión 0.5.1) sobre el dataset `HyeonseokE/push_cube_cap_10fps`.

El entrenamiento se realizó con 16.571 pasos, un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001, con semilla 1000. El dataset contiene 100 episodios y 21.210 frames a 10 FPS, con la tarea definida como "Push the cube to the target marker". El modelo consume como entradas el estado del robot (6 dimensiones) y tres imágenes de cámaras (256×256 píxeles cada una), y produce acciones de 6 dimensiones. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es de imitación supervisada mediante LeRobot.

## Capacidades

- Generación de acciones de control para robots manipuladores (6 grados de libertad) a partir de observaciones visuales y de estado.
- Procesamiento de imágenes de múltiples cámaras (superior y muñeca izquierda) para la percepción del entorno.
- Ejecución de tareas de manipulación específicas, como empujar un cubo hacia un objetivo.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Inferencia en tiempo real a 10 FPS (frecuencia de los datos de entrenamiento).
- No tiene capacidades de tool calling, generación de texto general ni razonamiento conversacional; es un modelo puramente orientado a control robótico.

## Casos de uso

- Automatización de tareas de empuje en líneas de montaje: el modelo puede controlar un brazo robótico para posicionar piezas empujándolas hasta una ubicación determinada, reduciendo la intervención humana en procesos repetitivos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo un VLA compacto se especializa en una tarea con pocos datos (100 episodios), permitiendo comparar estrategias de fine-tuning y generalización.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, el modelo puede cargarse y ejecutarse en un robot real con pocos comandos, facilitando pruebas de concepto en laboratorios.
- Robótica educativa: al ser de tamaño reducido y licencia Apache-2.0, es adecuado para cursos y proyectos donde se necesite un ejemplo funcional de control basado en VLA sin requerir hardware de gama alta.
- Benchmarking de modelos VLA en tareas de manipulación: puede utilizarse como referencia para comparar el rendimiento de modelos más grandes o de otras arquitecturas en la misma tarea.
- Desarrollo de asistentes robóticos en entornos domésticos: aunque la tarea es específica, el enfoque demuestra la viabilidad de desplegar políticas de control en hardware asequible, lo que podría extenderse a tareas como ordenar objetos o limpiar superficies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas de éxito en la tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM en la información disponible.
- Dado el tamaño del modelo (450 millones de parámetros, 0,9 GB en safetensors), es razonable estimar que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM en precisión completa, y menos con cuantización, aunque no se confirma.
- El paper de SmolVLA indica que el modelo está diseñado para hardware de consumo, pero no se especifican GPUs concretas en esta ficha.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que puede ejecutarse mediante los comandos `lerobot-rollout` y `lerobot-train`. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo sino de control robótico.
- Latencia y throughput: no disponibles; se espera que sea adecuado para control en tiempo real a 10 FPS, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos VLA en la documentación proporcionada. SmolVLA se posiciona como una alternativa compacta a modelos como OpenVLA o RT-2, pero no hay datos concretos de rendimiento relativo. La comparativa queda pendiente de publicaciones o evaluaciones adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de empujar un cubo hacia un marcador; no generaliza a otras tareas sin fine-tuning adicional.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede provocar overfitting y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- No se han realizado evaluaciones formales en robot real, por lo que el rendimiento en condiciones reales es desconocido.
- La frecuencia de control está limitada a 10 FPS, lo que puede ser insuficiente para tareas que requieran respuestas más rápidas.
- Al ser un modelo de control robótico, no es adecuado para tareas de procesamiento de lenguaje natural, generación de texto o razonamiento simbólico.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el robot y el entorno de despliegue cumplen con las normativas de seguridad aplicables.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un entorno controlado, podría comportarse de forma impredecible en entornos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_push_cube_cap_1000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/push_cube_cap_10fps
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
