# HyeonseokE/smolvla_pull_cube_ours_1000_10fps

## Resumen

`smolvla_pull_cube_ours_1000_10fps` es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por HyeonseokE a partir del modelo base `lerobot/smolvla_base`. SmolVLA es una familia de VLA presentada en el paper arXiv:2506.01844, diseñada para lograr rendimiento competitivo con costes computacionales reducidos y apta para desplegarse en hardware de consumo. Este fine-tuning concreto se ha entrenado para una tarea de manipulación robótica: tirar de un cubo hasta un marcador objetivo, sobre un robot `so101_follower` de 6 grados de libertad. El modelo tiene 450.046.176 parámetros totales, un tamaño de repositorio de 0,9 GB y se distribuye en formato `safetensors`. Las observaciones de entrada incluyen el estado del robot (6 dimensiones) y tres imágenes de 256×256 píxeles; la salida es una acción de 6 dimensiones. No se especifica una longitud de contexto de texto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) compacto, basado en transformer, fine-tuned sobre `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | No procede (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se describe como un modelo de visión-lenguaje-acción compacto y eficiente. En este caso, se parte del modelo base `lerobot/smolvla_base` y se realiza un fine-tuning supervisado sobre un dataset de demostraciones de la tarea "Pull the cube to the target marker". El dataset contiene 100 episodios y 32.039 frames, grabados a 10 FPS. La configuración de entrenamiento incluye 25.000 pasos, batch size 64, optimizador AdamW con learning rate 0,0001, semilla 1000 y la versión 0.6.0 de LeRobot. La arquitectura interna no se detalla en la información disponible, pero el modelo consume como entradas el estado del robot (6 dimensiones) y tres imágenes RGB de 256×256 píxeles, y devuelve acciones de 6 dimensiones. No se mencionan técnicas específicas de alineación (RLHF, DPO) ni innovaciones adicionales de entrenamiento en los datos proporcionados.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad para el robot `so101_follower` a partir de observaciones visuales y de estado.
- Percepción visual: procesa tres imágenes de 256×256 píxeles (presumiblemente una vista superior y dos de muñeca, según las cámaras `top` y `left_wrist` listadas en la model card) para localizar el cubo y el marcador objetivo.
- Ejecución de la tarea específica: está afinado para la tarea "tirar del cubo hasta el marcador".
- Integración con LeRobot: se puede ejecutar en un robot real mediante el comando `lerobot-rollout` con la configuración de política adecuada.
- No se han identificado capacidades de generación de texto libre, tool calling, razonamiento complejo o soporte multilingüe en la información disponible.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo se emplea para ejecutar la tarea de tirar de un cubo hasta un marcador, demostrando una política de control guiada por visión en un brazo robótico concreto.
- Aprendizaje por imitación en investigación: sirve como referencia para estudiar el fine-tuning de SmolVLA con un número reducido de demostraciones (100 episodios), comparando configuraciones de entrenamiento.
- Despliegue en robots de consumo: gracias a su tamaño compacto (450M parámetros y 0,9 GB de pesos), puede integrarse en plataformas robóticas con hardware limitado, como el robot `so101_follower`.
- Recogida de datos para nuevos entrenamientos: puede utilizarse para generar demostraciones adicionales y ampliar el dataset, siguiendo el flujo de trabajo de LeRobot y el comando `lerobot-rollout`.
- Evaluación de políticas VLA en entornos controlados: es un banco de pruebas para comparar estrategias de entrenamiento, como el número de pasos, el learning rate o el tamaño de batch, en un dominio de manipulación concreto.
- Transferencia a tareas afines: aunque está afinado para tirar de un cubo, puede usarse como punto de partida para fine-tuning adicional en tareas de empujar, alinear o mover objetos similares sobre una mesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: no hay especificación oficial. A partir de los 450.046.176 parámetros y el tamaño de los pesos en `safetensors` (0,9 GB), se estima aproximadamente 1–2 GB de VRAM para inferencia en fp16/bf16, más el overhead de activaciones. Es una estimación orientativa.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, una GPU con al menos 4 GB de VRAM debería ser suficiente, por ejemplo una NVIDIA RTX 3060 o RTX 4060. En entornos de laboratorio, una A10G o una A100 proporcionarían margen adicional.
- Despliegue en hardware de consumo: la descripción general de SmolVLA indica que puede desplegarse en hardware de consumo, aunque no hay datos específicos para este fine-tuning.
- Opciones de despliegue: mediante LeRobot en PyTorch, a través de los comandos `lerobot-rollout` y `lerobot-train`. No se han encontrado implementaciones para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Tamano repo | Licencia |
|---|---|---|---|---|
| HyeonseokE/smolvla_pull_cube_ours_1000_10fps | 450.046.176 | Pull the cube to the target marker | 0,9 GB | Apache-2.0 |
| HyeonseokE/smolvla_pull_cube_cap_1000_10fps | No disponible | Pull the cube (variante) | No disponible | Apache-2.0 |
| HyeonseokE/smolvla_pull_cube_cap_3000_10fps | No disponible | Pull the cube (variante) | No disponible | Apache-2.0 |
| lerobot/smolvla_base | No disponible | Preentrenado genérico | No disponible | Apache-2.0 |

No se dispone de resultados de benchmarks públicos que permitan comparar el rendimiento entre estos modelos. Las diferencias entre los fine-tunes listados parecen estar en el subconjunto de datos o en la semilla de entrenamiento, según los nombres, pero no hay documentación detallada al respecto.

## Limitaciones y advertencias

- Entrenado para una tarea concreta y un robot específico: no se espera que generalice a otras tareas, objetos o configuraciones de cámara sin un re-entrenamiento.
- El dataset de entrenamiento es pequeño (100 episodios, 32.039 frames), lo que puede limitar la robustez y la capacidad de generalización del modelo.
- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot o en entornos no vistos.
- Las cámaras y el robot deben coincidir con las especificaciones de entrenamiento; usar cámaras distintas o un robot distinto puede degradar el rendimiento.
- La información no reporta sesgos específicos, pero cualquier política de imitación puede heredar sesgos de los datos de demostración.
- La licencia Apache-2.0 permite uso comercial y modificación, pero la licencia del dataset de entrenamiento no se especifica en la información disponible.
- No se han identificado riesgos de alucinación textual, ya que no es un modelo generativo de texto; sin embargo, puede fallar en la planificación de acciones en estados no cubiertos por los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_pull_cube_ours_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/pull_cube_ours_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Fine-tune similar `cap_1000`: https://huggingface.co/HyeonseokE/smolvla_pull_cube_cap_1000_10fps
- Fine-tune similar `cap_3000`: https://huggingface.co/HyeonseokE/smolvla_pull_cube_cap_3000_10fps
