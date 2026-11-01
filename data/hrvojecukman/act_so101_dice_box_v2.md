# hrvojecukman/act_so101_dice_box_v2

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto (`hrvojecukman/act_so101_dice_box_v2`) contiene una política entrenada con LeRobot sobre el robot SO-101 para la tarea "Pick up the dice and put it in the box", usando dos cámaras (frontal y de muñeca) y un vector de estado de 6 dimensiones.

El modelo es un transformer de ~51,7 millones de parámetros (pesos en safetensors, 0,2 GB de repositorio) entrenado durante 60.000 pasos con batch de 8 y optimizador AdamW a una tasa de aprendizaje de 1e-5. El dataset de entrenamiento consta de 50 episodios teleoperados y 19.683 frames a 30 FPS, lo que lo convierte en un ejemplo típico de política de imitación de baja escala, adecuada para prototipado en robótica de escritorio más que para producción general.

Es relevante ahora porque LeRobot se ha consolidado como el stack de referencia para robótica open source en PyTorch, y este tipo de políticas ACT publicadas en el Hub permiten reproducir y adaptar flujos completos de captura de datos, entrenamiento y despliegue en hardware asequible como el SO-101. La licencia Apache 2.0 facilita su reutilización comercial y su integración en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según LeRobot) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` |
| Dataset de entrenamiento | `hrvojecukman/so101_dice_box_v2_20261030_214125` (50 episodios, 19.683 frames, 30 FPS) |
| Tarea | "Pick up the dice and put it in the box" |
| Pasos de entrenamiento | 60.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente ResNet preentrenado) para procesar las imágenes de las cámaras frontal y de muñeca, un codificador de estado para el vector de 6 dimensiones de la articulación, y un decodificador transformer que genera chunks de acciones de longitud fija. Predecir varios pasos de acción a la vez, en lugar de uno solo, reduce el error compuesto característico de las políticas reactivas y permite un control más suave. La arquitectura incorpora además una técnica de "temporal ensembling" durante la inferencia para promediar predicciones solapadas de chunks consecutivos.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 50 episodios teleoperados (19.683 frames a 30 FPS), con 60.000 pasos, batch de 8, AdamW y learning rate de 1e-5. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos adicionales; se trata de un entrenamiento supervisado puro sobre demostraciones. No se especifica el número de tokens ni la composición detallada del dataset más allá de la tarea y las cámaras empleadas.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea concreta "Pick up the dice and put it in the box" sobre un robot SO-101 (`so_follower`).
- Política visomotora: consume dos flujos de imagen (frontal y de muñeca) a 480x640 y un vector de estado de 6 dimensiones.
- Generación de chunks de acciones: predice secuencias cortas de acciones de 6 dimensiones en lugar de pasos individuales.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Prototipado de manipulación pick-and-place: usar la política como base para una tarea de recogida de objetos y colocación en contenedor sobre el SO-101, sirviendo como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout).
- Investigación en aprendizaje por imitación: comparar el rendimiento de ACT frente a otros métodos (Diffusion Policy, VQ-BeT) sobre el mismo dataset y robot, aprovechando que el repositorio incluye la configuración exacta de entrenamiento.
- Docencia y formación en robótica: demostrar de extremo a extremo cómo se entrena una política visomotora con 50 episodios y 60.000 pasos en hardware asequible, usando el comando `lerobot-train` documentado.
- Reentrenamiento con datos propios: partir de esta política como inicialización o referencia y adaptarla a nuevas tareas del mismo robot cambiando el dataset, ya que la licencia Apache 2.0 lo permite.
- Benchmarking de infraestructura de inferencia robótica: medir latencia y throughput de `lerobot-rollout` con dos cámaras a 30 FPS y un modelo de 51,7 M de parámetros, útil para dimensionar GPUs de escritorio.
- Integración en laboratorios de robótica de bajo coste: desplegar la política en un SO-101 físico con dos cámaras USB y una GPU consumer, como ejemplo reproducible de manipulación aprendida sin necesidad de modelos fundacionales grandes.
- Generación de datos sintéticos o aumento de dataset: usar los rollouts de la política para analizar fallos y guiar la recolección de nuevos episodios correctivos, cerrando el ciclo de mejora iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en fp32 ocupa aproximadamente 0,21 GB de pesos, y en fp16 unos 0,10 GB. Sumando activaciones y los dos flujos de imagen a 480x640, la inferencia cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar la política a 30 FPS sin problemas. Para entrenamiento, una RTX 3090, RTX 4090, A100 o H100 acelera los 60.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El sistema opera a 30 FPS según el dataset, pero no se publican medidas de latencia por chunk ni throughput real en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | no aplica | sin evaluación publicada | apache-2.0 | HuggingFace Hub, LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | referenciado en literatura; no se dispone de ficha concreta en la información proporcionada |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | no disponible |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | variable, sin datos en esta ficha | variable | HuggingFace Hub |

No se dispone de datos numéricos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Sobreajuste al entorno de entrenamiento: al entrenarse con 50 episodios y una única tarea, es probable que la política sea sensible a cambios de iluminación, posición de objetos, fondo o cámara.
- Especificidad de hardware: está entrenada para el robot `so_follower` (SO-101) con cámaras `front` y `wrist`; usar otra configuración de cámaras o robot requerirá reentrenamiento.
- Sin capacidades de lenguaje ni razonamiento general: no debe emplearse como modelo conversacional, de código o de razonamiento.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede generalizar mal y ejecutar movimientos erráticos ante distribuciones de entrada no vistas.
- Sesgos: no se documentan sesgos específicos, pero el dataset reducido puede reflejar sesgos de las demostraciones (posiciones, velocidades, estilo del teleoperador).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del dataset asociado antes de redistribuir derivados.
- Caveat de producción: no se recomienda su uso en entornos de producción sin una validación exhaustiva en el robot objetivo, con métricas de éxito por tarea y pruebas de robustez ante perturbaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hrvojecukman/act_so101_dice_box_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/hrvojecukman/so101_dice_box_v2_20261030_214125
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hrvojecukman/so101_dice_box_v2_20261030_214125
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
