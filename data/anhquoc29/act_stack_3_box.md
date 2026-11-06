# anhquoc29/act_stack_3_box

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, `anhquoc29/act_stack_3_box`, es una política entrenada con LeRobot sobre el robot `so_follower` para la tarea específica de apilar tres bloques (blanco, verde y azul) en un orden determinado.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Consume dos flujos de imagen de 480x640 píxeles (cámaras `top` y `left`) más un vector de estado de 6 dimensiones, y produce un vector de acción también de 6 dimensiones. El entrenamiento se realizó sobre 199 episodios (224.044 fotogramas a 30 FPS) de un dataset de simulación.

Es relevante como ejemplo práctico del flujo completo de LeRobot para robótica de imitación: desde la captura de datos teleoperados hasta el despliegue de una política en hardware real. No es un modelo de lenguaje ni un modelo fundacional generalista; es una política especializada y de dominio muy restringido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `top`, `left` |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.top` y `observation.images.left`, shape `(3, 480, 640)` |
| Salida de acción | `action`, shape `(6,)` |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer que aprende una política de imitación a partir de demostraciones teleoperadas. En lugar de predecir una única acción por paso, el modelo predice un chunk de acciones futuras, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La política combina un codificador visual (para los dos flujos de cámara) con un transformer que fusiona las observaciones visuales y el estado propioceptivo del robot para generar el chunk de acciones.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, con batch size 16, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset de entrenamiento (`anhquoc29/stack_3_box_white_green_blue_simulation`) contiene 199 episodios y 224.044 fotogramas a 30 FPS, correspondientes a la tarea de apilar tres bloques en orden blanco, verde y azul. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en una política de imitación.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (vista superior y vista lateral) a 480x640.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos individuales, reduciendo el error acumulado.
- Ejecución de una tarea específica: apilar tres bloques en el orden blanco, verde y azul, colocando el blanco en el objetivo y apilando encima el verde y luego el azul.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible del pipeline ACT de LeRobot, desde la grabación de datos teleoperados hasta el despliegue, útil para comparar variantes de arquitectura o hiperparámetros.
- Automatización de tareas de apilado en laboratorio: el modelo ejecuta la secuencia de apilado de tres bloques sobre el robot `so_follower`, adecuado para entornos controlados de simulación o bancos de pruebas.
- Base para fine-tuning en tareas de manipulación similares: al ser una política ACT entrenada, puede reentrenarse con `lerobot-train` sobre nuevos datasets de apilado o tareas relacionadas.
- Docencia y formación en robótica: ejemplo didáctico completo de un flujo de trabajo de robótica de imitación con hardware de bajo coste (SO-100/SO-101).
- Validación de infraestructura de despliegue: útil para probar la integración de LeRobot con cámaras OpenCV, puertos serie y políticas en la nube antes de escalar a tareas más complejas.
- Benchmark interno de políticas de manipulación: sirve como línea base para comparar nuevas políticas de apilado sobre el mismo robot y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente. También puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 20xx en adelante) e incluso en hardware embebido con suficiente memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para PyTorch en CUDA o CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware y de la frecuencia de control del robot (el dataset se grabó a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anhquoc29/act_stack_3_box` | 51,7 M | ACT | Apilado de 3 bloques (simulación) | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | ACT | Manipulación diversa | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | variable | Diffusion | Manipulación diversa | variable | Hugging Face / LeRobot |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | VLA | Manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo concreto, por lo que la comparativa se limita a características estructurales.

## Limitaciones y advertencias

- Dominio extremadamente restringido: la política solo ha sido entrenada para la tarea de apilar tres bloques en un orden concreto; no generaliza a otras tareas sin reentrenamiento.
- Entrenada en simulación: el dataset de entrenamiento es de simulación (`stack_3_box_white_green_blue_simulation`), por lo que el rendimiento en el mundo real puede degradarse por la brecha sim-to-real (iluminación, texturas, dinámica).
- Sin resultados de evaluación: no se han publicado tasas de éxito ni pruebas en robot real, lo que impide valorar su fiabilidad en producción.
- Dependencia de hardware específico: requiere un robot `so_follower` y dos cámaras con los nombres y resoluciones exactos del entrenamiento (`top` y `left`, 480x640).
- Sin capacidades de lenguaje: no procesa texto ni instrucciones en lenguaje natural más allá de la etiqueta de tarea fija.
- Riesgo de sobreajuste al dataset: con 199 episodios y 100.000 pasos de entrenamiento, es probable que la política esté ajustada a las condiciones concretas de la simulación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de distribución en los datos de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anhquoc29/act_stack_3_box
- Dataset de entrenamiento: https://huggingface.co/datasets/anhquoc29/stack_3_box_white_green_blue_simulation
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=anhquoc29/stack_3_box_white_green_blue_simulation
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
