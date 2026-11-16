# DebuggingByte/act_cube_basket

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `DebuggingByte/act_cube_basket`, es una política entrenada con LeRobot sobre un robot `so_follower` (tipo SO-100/SO-101) para la tarea "Pick up the black cube and put it in the red basket".

La política consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (`top` y `wrist`), y produce acciones de 6 dimensiones a 30 FPS. El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Fue entrenado durante 100.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre un dataset de 45 episodios y 26.636 frames teleoperados.

Es relevante como ejemplo reproducible de un pipeline completo de imitación en robótica de bajo coste: dataset público, configuración de entrenamiento documentada y comandos de despliegue con `lerobot-rollout`. No obstante, se trata de una política específica de tarea y robot, sin resultados de evaluación publicados, por lo que su utilidad práctica queda limitada a reproducción y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, presentada en el paper arXiv:2304.13705. Se compone de un backbone visual (ResNet) que procesa las dos cámaras (`observation.images.top` y `observation.images.wrist`, 3x480x640), un encoder del estado articular de 6 dimensiones y un transformer que fusiona ambas modalidades para predecir un chunk de acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, mitiga el compounding error típico de las políticas de imitación.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset `DebuggingByte/cube_basket` contiene 45 episodios y 26.636 frames a 30 FPS de teleoperación sobre un robot `so_follower`. No se documenta en la información disponible el uso de RLHF, DPO ni aumentos de datos; tampoco se detalla la composición exacta del dataset más allá de la tarea única.

## Capacidades

- Generación de acciones de control para un robot `so_follower` con 6 grados de libertad a partir de estado articular y dos vistas RGB.
- Ejecución de una tarea de manipulación concreta: coger un cubo negro y depositarlo en una cesta roja.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere recompensa explícita).
- Predicción de chunks de acciones, lo que aporta suavidad y robustez frente a errores acumulados.
- Integración con el ecosistema LeRobot: entrenamiento (`lerobot-train`) y despliegue (`lerobot-rollout`).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modos de razonamiento; es una política robótica especializada.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como referencia para validar un pipeline completo (grabación, entrenamiento, despliegue) con LeRobot sobre un SO-100/SO-101.
- Docencia y formación: permite ilustrar el funcionamiento de ACT y el flujo de trabajo de LeRobot con un caso acotado y un dataset pequeño (45 episodios).
- Punto de partida para fine-tuning: se puede reentrenar con `lerobot-train` sobre un dataset propio para adaptar la política a otra tarea o a variaciones de la misma (posiciones, iluminación, objetos).
- Pruebas de integración hardware-software: útil para verificar la calibración de cámaras, puertos y cinemática del robot antes de abordar tareas más complejas.
- Benchmark interno de políticas de imitación: como baseline de referencia para comparar con otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo robot y dataset.
- Demostraciones en entornos controlados: ejecución de la tarea cubo-cesta en laboratorio o feria para mostrar robótica de manipulación con aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros y dos flujos de imagen de 480x640, la huella es modesta y cabe holgadamente en GPUs de consumo, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que se asume compatibilidad con GPUs NVIDIA, sin modelo concreto especificado.
- ¿Cabe en GPU de consumo? Muy probablemente sí por tamaño de parámetros, pero no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DebuggingByte/act_cube_basket (ACT) | 51,7 M | no aplica | Manipulación cubo-cesta en `so_follower` | Apache 2.0 | Hugging Face |
| Diffusion Policy | no disponible | no aplica | Políticas de imitación visual-motora | no disponible | Repositorios de investigación |
| VQ-BeT | no disponible | no aplica | Políticas de imitación con cuantización de acciones | no disponible | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada. La comparación se limita a categoría (políticas de imitación para robótica) y disponibilidad.

## Limitaciones y advertencias

- Política específica de tarea: entrenada únicamente para "Pick up the black cube and put it in the red basket" sobre un robot `so_follower`; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su robustez real en robot físico.
- Dataset pequeño: 45 episodios y 26.636 frames; propenso a sobreajuste y a fallos ante variaciones de iluminación, posición de objetos o distractores.
- Dependencia de hardware concreto: requiere robot `so_follower`, dos cámaras con nombres `top` y `wrist`, y calibración correcta; el cambio de cámara o de montaje invalida la política.
- Riesgo de alucinación en sentido figurado: como política de imitación, puede generar acciones plausibles pero incorrectas fuera de la distribución de entrenamiento, sin señal de incertidumbre.
- Sesgos: no evaluados; el dataset refleja una única configuración física y un único operador humano.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea desaconsejan su uso en producción sin validación previa.
- Sin soporte de lenguaje, tool calling ni agentes: no debe confundirse con un modelo conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DebuggingByte/act_cube_basket
- Dataset: https://huggingface.co/datasets/DebuggingByte/cube_basket
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=DebuggingByte/cube_basket
