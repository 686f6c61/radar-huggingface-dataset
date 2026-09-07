# HyeonseokE/smolvla_push_cube_ours_1000_10fps

## Resumen

HyeonseokE/smolvla_push_cube_ours_1000_10fps es un modelo de política robótica de la familia SmolVLA, fine-tuneado a partir del modelo base lerobot/smolvla_base. Desarrollado por HyeonseokE, está entrenado para controlar un robot SO101 en la tarea de empujar un cubo hasta un marcador objetivo. Su relevancia radica en que SmolVLA está diseñado para ofrecer un rendimiento competitivo con un coste computacional reducido, permitiendo el despliegue en hardware de consumo. El modelo tiene 450.046.176 parámetros y se distribuye en formato safetensors. La longitud de contexto no está especificada en la información disponible.

El fine-tuning se realizó con el dataset HyeonseokE/push_cube_ours_10fps, compuesto por 100 episodios y 21.629 fotogramas a 10 FPS, utilizando la librería LeRobot. El modelo consume observaciones de estado y hasta tres imágenes de cámaras, y genera acciones de control de 6 dimensiones. No se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción (VLA) que combina un modelo de lenguaje multimodal compacto con una cabeza de acciones para generar comandos de control directamente a partir de observaciones visuales y de estado. Este modelo concreto es un fine-tune del modelo base lerobot/smolvla_base, entrenado mediante aprendizaje por imitación (behavior cloning) con el framework LeRobot. El entrenamiento se realizó con 16.850 pasos, un batch de 64, optimizador AdamW y una tasa de aprendizaje de 0.0001. No se indica el uso de RLHF, DPO ni otras técnicas de alineación. La model card menciona dos cámaras (top y left_wrist), aunque la tabla de observaciones lista tres entradas visuales (camera1, camera2, camera3), lo que supone una inconsistencia a tener en cuenta.

## Capacidades

- Generación de acciones de control en 6 dimensiones (acción continua) a partir de observaciones de estado y de imágenes.
- Percepción visual con hasta tres cámaras de 256x256 píxeles, según la tabla de observaciones.
- Entrada de estado del robot (6 valores) para integrar información de la posición actual.
- Ejecución en bucle para rollouts continuos en robots reales mediante `lerobot-rollout`.
- No soporta tool calling ni function calling: es un modelo de política, no un agente conversacional.
- No soporta generación de texto libre ni capacidades multilingües.
- No es un modelo multimodal en el sentido de razonamiento visual: su salida es una acción de control, no descripciones.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede controlar un robot SO101 para empujar objetos hasta una posición objetivo. Es adecuado porque genera acciones directas a partir de la visión y el estado, sin necesidad de un pipeline de planificación externo.
- Investigación en aprendizaje por imitación: permite estudiar cómo un modelo VLA compacto se comporta con datasets pequeños (100 episodios). Adecuado para comparar políticas y analizar el sobreajuste.
- Prototipado de robots de bajo coste: al tener 450 millones de parámetros y un peso de 0.9 GB, es un candidato para GPUs de consumo, lo que facilita iterar en entornos de investigación.
- Automatización de tareas repetitivas de empuje en líneas de montaje controladas: el modelo puede ejecutarse en bucle con `lerobot-rollout` y supervisión humana.
- Benchmark de políticas VLA en tareas de manipulación: puede usarse como baseline en comparaciones con otros modelos de la misma familia (SmolVLA) o con políticas más grandes.
- Educación y demostraciones en robótica: la integración con LeRobot y la documentación permiten a estudiantes ejecutar una política preentrenada en robots reales sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.9 GB en safetensors, lo que sugiere que el modelo es ligero, pero no se proporcionan cifras oficiales de VRAM.
- GPU recomendada: no disponible. No se ha publicado una recomendación específica.
- Compatibilidad con GPU de consumo: no confirmado. Por su tamaño, podría ejecutarse en GPUs de gama media, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`). No se especifican integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa detallada. Los modelos más cercanos son el modelo base `lerobot/smolvla_base` y otros fine-tunes del mismo autor: `HyeonseokE/smolvla_push_cube_cap_1000_10fps` y `HyeonseokE/smolvla_push_cube_cap_2000_10fps`. A continuación se muestra una tabla con los datos disponibles:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_push_cube_ours_1000_10fps | 450.046.176 | no disponible | no disponible | Apache-2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| HyeonseokE/smolvla_push_cube_cap_1000_10fps | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| HyeonseokE/smolvla_push_cube_cap_2000_10fps | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- No se han publicado resultados de evaluación; el rendimiento real en robots no está verificado.
- La model card indica dos cámaras (top y left_wrist), pero la tabla de observaciones especifica tres entradas visuales (camera1, camera2, camera3). Esta discrepancia puede provocar errores de ejecución si no se configuran las cámaras correctamente.
- El modelo está entrenado específicamente para la tarea "empujar el cubo hasta el marcador objetivo". No generaliza a otras tareas sin reentrenamiento.
- El dataset de entrenamiento es pequeño (100 episodios, 21.629 fotogramas), lo que puede producir sobreajuste y baja robustez ante variaciones del entorno.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado por imitación, hereda los comportamientos de las demostraciones.
- En un contexto robótico, la "alucinación" se manifiesta como generación de acciones incorrectas; es necesario supervisar el robot durante la ejecución.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir y respetar los avisos de la licencia, además de citar el paper y LeRobot.

## Enlaces

- Modelo: https://huggingface.co/HyeonseokE/smolvla_push_cube_ours_1000_10fps
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/push_cube_ours_10fps
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Espacio de visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/push_cube_ours_10fps
