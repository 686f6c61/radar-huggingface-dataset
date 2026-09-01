# adrfm/sort_b601_simple_filtered_smolvla_finetune_w_peft_v1

## Resumen

Este modelo es un fine-tune de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para ejecutarse en hardware de consumo. El autor, adrfm, ha adaptado el modelo base `lerobot/smolvla_base` mediante PEFT (adaptadores LoRA) para una tarea específica de robótica: clasificar discos de colores en un robot manipulador Seeed B601. El modelo fue entrenado con el framework LeRobot sobre un dataset propio de 35 episodios (34.012 frames a 30 FPS) que captura la tarea de recoger discos de un plato gris y colocarlos en platos rojo y azul según su color.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, este modelo representa un ejemplo práctico de cómo adaptar un VLA generalista a una tarea de manipulación concreta mediante aprendizaje por imitación. Su relevancia radica en demostrar el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, aunque carece de resultados de evaluación publicados y su aplicabilidad se limita al escenario específico para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA (no se especifican detalles internos) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, optimizado para reducir coste computacional y poder desplegarse en hardware de consumo. Este fine-tune parte del checkpoint preentrenado `lerobot/smolvla_base` y se adapta mediante PEFT (Parameter-Efficient Fine-Tuning), lo que implica que solo se entrenan un pequeño número de parámetros adicionales (adaptadores) sobre el modelo base congelado.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `adrfm/sort_b601_simple_filtered`, que contiene 35 episodios de teleoperación de la tarea de clasificación de discos. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW, learning rate de 0,0001 y semilla 1000. El modelo consume observaciones de estado (6 dimensiones) e imágenes de tres cámaras (256x256 píxeles cada una) y produce acciones de 7 dimensiones para el robot. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento supervisado de imitación.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 7 grados de libertad a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (cámaras laterales y de muñeca) junto con el estado del robot.
- Aprendizaje por imitación: reproduce la política demostrada en el dataset de entrenamiento para la tarea específica de clasificación de discos.
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS, compatible con el robot Seeed B601.
- No incluye capacidades de lenguaje natural, tool calling, razonamiento multi-paso ni generación de texto, al ser un modelo puramente motor.

## Casos de uso

- Automatización de clasificación de piezas en entornos industriales: el modelo puede integrarse en una celda robótica para separar objetos por color o forma, replicando la tarea de colocar discos negros y blancos en platos designados. Su ventana de observación de tres cámaras permite adaptarse a variaciones de posición dentro del espacio de trabajo.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a tareas nuevas mediante fine-tuning con pocos episodios, gracias a su tamaño compacto y al uso de PEFT.
- Prototipado rápido de políticas robóticas: al estar integrado con LeRobot, permite iterar sobre el dataset y la configuración de entrenamiento sin necesidad de infraestructura de alto rendimiento, ya que el modelo cabe en GPUs de consumo.
- Demostraciones educativas de robótica con IA: puede utilizarse en laboratorios docentes para ilustrar el ciclo completo de recogida de datos, entrenamiento y despliegue de un modelo VLA en un robot real.
- Benchmarking de eficiencia de VLA: al ser un modelo de 450M, es útil para comparar el rendimiento de arquitecturas compactas frente a modelos más grandes en tareas de manipulación, midiendo latencia y precisión.
- Desarrollo de sistemas de control adaptativo: el modelo puede servir como base para experimentar con técnicas de aumento de datos, regularización o ajuste de hiperparámetros en el contexto de políticas de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño de 450M de parámetros y el peso del repositorio (0,9 GB), es plausible que quepa en GPUs de consumo con al menos 6-8 GB de VRAM, pero no se confirma.
- GPU recomendadas: no se especifican. El modelo se entrena y ejecuta con LeRobot, que soporta CUDA; una GPU como RTX 3060 o superior sería suficiente para inferencia, aunque no hay datos oficiales.
- Compatibilidad con hardware de consumo: el propio SmolVLA está diseñado para hardware de consumo, por lo que este fine-tune hereda esa característica, pero no se documenta un requisito mínimo.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) para ejecutar la política en el robot. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Se asume que opera a 30 FPS según la tasa de frames del dataset, pero no se mide en la documentación.

## Comparativa con modelos similares

No disponible. No se proporcionan en la información modelos comparables de la misma categoría (VLA para robótica) con los que contrastar parámetros, contexto o rendimiento. El modelo base `lerobot/smolvla_base` es el punto de referencia natural, pero no se ofrecen datos comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al entrenarse con un único dataset de 35 episodios, la política puede estar sesgada hacia las condiciones específicas de captura (iluminación, posición de la cámara, variaciones del robot).
- Riesgo de alucinación: al ser un modelo de acción, no genera texto, pero puede producir acciones incorrectas si las observaciones difieren del dominio de entrenamiento; no hay evaluación que garantice robustez.
- Limitaciones de contexto y generalización: la tarea es muy específica (clasificar discos en dos colores) y el dataset es pequeño; el modelo no generalizará a otras tareas u objetos sin reentrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo depende de SmolVLA y LeRobot, cuyas licencias deben verificarse por separado.
- Advertencia para producción: sin resultados de evaluación en el robot real, no se recomienda su uso en entornos de producción sin una validación exhaustiva. Además, la fecha de creación (2026) sugiere que es un modelo reciente y no probado.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/adrfm/sort_b601_simple_filtered_smolvla_finetune_w_peft_v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/adrfm/sort_b601_simple_filtered)
- [Dataset filtrado alternativo](https://huggingface.co/datasets/adrfm/sort_b601_filtered)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentación de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
