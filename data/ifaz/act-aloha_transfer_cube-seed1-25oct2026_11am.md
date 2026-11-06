# iFaz/act-aloha_transfer_cube-seed1-25oct2026_11am

## Resumen

ACT Policy es una política de imitación (imitation learning) entrenada con LeRobot, la librería de Hugging Face para robótica basada en aprendizaje. No se trata de un modelo de lenguaje, sino de un modelo de control robótico que mapea observaciones visuales y de estado (imágenes de cámaras y posiciones de las articulaciones) a acciones motoras, siguiendo el paradigma de transformer de acción continua (ACT, Action Chunking with Transformers). Lo publica el usuario iFaz y está especializado en una única tarea de manipulación simulada: transferir un cubo en el entorno MuJoCo `AlohaTransferCube-v0`.

El modelo cuenta con 51.685.006 parámetros y se ha entrenado durante 70.000 pasos sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, con un tamaño de lote de 8 y semilla 1. Su relevancia es acotada: sirve como referencia reproducible de un entrenamiento ACT con la configuración por defecto de LeRobot y como punto de partida para experimentos de imitación en simulación robótica.

Los resultados de evaluación reportados por el autor indican una tasa de éxito del 72,0 % sobre 100 episodios en el entorno Aloha, con una recompensa media acumulada de 209,85. Es, por tanto, un artefacto de investigación y experimentación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con encoder visual y decoder de acciones |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica con horizonte de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta del repositorio; no aplica a un modelo de control) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot, `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que predice "chunks" de acciones (secuencias de comandos motores) en lugar de una sola acción por paso, lo que reduce el error de compounding y suaviza el control. El modelo consume observaciones multimodales (imágenes de las cámaras del robot y estado de las articulaciones) y produce acciones continuas para el manipulador bimanual Aloha en simulación MuJoCo. La model card indica explícitamente que se usaron los valores por defecto de LeRobot sin overrides en la arquitectura de la política.

El entrenamiento se realizó con LeRobot sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, con 70.000 pasos, batch de 8, 4 workers de carga de datos y semilla 1. No se documenta el número de tokens ni composición del dataset, ni si hubo RLHF/DPO (no aplica en imitación supervisada). La configuración de evaluación usó el entorno `aloha` con la tarea `AlohaTransferCube-v0`, 100 episodios y batch de 1.

## Capacidades

- Control robótico de manipulación: genera acciones continuas para el robot Aloha en la tarea de transferencia de cubo.
- Imitación supervisada a partir de demostraciones humanas (dataset `aloha_sim_transfer_cube_human`).
- Predicción de chunks de acciones (Action Chunking), lo que permite ejecutar secuencias motoras coherentes.
- Procesamiento multimodal de entrada: imágenes de cámaras y estado de articulaciones.
- Integración con el ecosistema LeRobot (`pytorch_model_hub_mixin`) para carga y evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de control, no de lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación: cargar la política con LeRobot y evaluarla en `AlohaTransferCube-v0` para replicar la tasa de éxito del 72 % reportada, sirviendo como línea base en estudios de imitation learning.
- Comparación de variantes de entrenamiento: usar esta política (semilla 1, 70.000 pasos) como referencia frente a otros checkpoints con distintas semillas o hiperparámetros para analizar la varianza del entrenamiento ACT.
- Docencia y formación en robótica: ejemplo didáctico de un pipeline completo de LeRobot (dataset, entrenamiento, evaluación en MuJoCo) con una tarea sencilla y bien acotada.
- Desarrollo de pipelines de evaluación: integrar el modelo en scripts automatizados que midan tasa de éxito y recompensa media sobre 100 episodios, como los reportados por el autor.
- Punto de partida para fine-tuning: reentrenar o adaptar la política a tareas de manipulación similares en simulación, aprovechando los pesos preentrenados como inicialización.
- Investigación en simulación a realidad: usar el modelo como banco de pruebas en MuJoCo antes de trasladar la arquitectura ACT a un robot físico, dado su bajo coste computacional (51,7 M de parámetros, repo de 0,2 GB).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entorno | AlohaTransferCube-v0 (MuJoCo) |
| Episodios de evaluacion | 100 |
| Tasa de exito | 72,0 % |
| Recompensa media acumulada | 209,85 |
| Recompensa maxima media | 3,33 |
| Tiempo de evaluacion | 7800,4 s |
| Pasos de entrenamiento | 70.000 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (el autor entrenó y evaluó en `cuda`); una RTX 3060 o superior es más que suficiente. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en prácticamente todas las NVIDIA modernas; también podría ejecutarse en CPU para inferencia, aunque el entorno MuJoCo y el renderizado pueden ser el cuello de botella.
- Opciones de despliegue: LeRobot (carga nativa vía `pytorch_model_hub_mixin`), PyTorch, y el simulador MuJoCo para la evaluación.
- Latencia y throughput: no disponibles de forma desagregada; el tiempo total de evaluación de 100 episodios fue de 7800,4 s (aproximadamente 78 s por episodio, incluyendo simulación).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints ACT comparables ni datos de modelos alternativos de la misma tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea `AlohaTransferCube-v0`; no generaliza a otras tareas sin reentrenamiento.
- Entrenada en simulación (MuJoCo): el rendimiento en un robot físico no está validado y puede degradarse por la brecha sim-to-real.
- Tasa de éxito del 72 %: implica que aproximadamente 3 de cada 10 episodios fallan; no es adecuada para aplicaciones que requieran fiabilidad alta sin mejora adicional.
- Evaluación con un único checkpoint y una sola semilla: no se reporta varianza entre semillas, por lo que la robustez estadística es limitada.
- Sesgos: no documentados; en imitación, el modelo hereda los sesgos y limitaciones de las demostraciones humanas del dataset.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar los términos del dataset de origen (`lerobot/aloha_sim_transfer_cube_human`).
- Idioma: la etiqueta `en` es informativa; el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/iFaz/act-aloha_transfer_cube-seed1-25oct2026_11am
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
