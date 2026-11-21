# nberezny/smolvla_lite6_stack_dense

## Resumen

SmolVLA Lite6 Stack Dense es un ajuste fino del modelo visión-lenguaje-acción (VLA) SmolVLA, desarrollado por el usuario nberezny y publicado en Hugging Face. Se trata de una política de imitación entrenada para controlar un robot UFactory Lite6 en simulación híbrida, con la tarea concreta de apilar tres bloques (rojo abajo, amarillo en medio, azul arriba). El modelo parte de `lerobot/smolvla_base` y ha sido entrenado con el framework LeRobot de Hugging Face sobre un conjunto de datos propio de 4.924 episodios y 143.843 fotogramas a 20 FPS.

SmolVLA es una arquitectura compacta de tipo VLA que combina un codificador visual, un modelo de lenguaje pequeño y un cabezal de acciones para producir comandos motores directamente a partir de observaciones visuales y del estado del robot. Su relevancia radica en que demuestra que es posible desplegar políticas robóticas de manipulación en hardware de consumo, sin necesidad de clústeres de GPU, manteniendo un rendimiento competitivo frente a modelos VLA mucho más grandes.

Este checkpoint concreto es un artefacto de investigación reproducido con LeRobot 0.7.0, con 450 millones de parámetros y licencia Apache 2.0. No incluye resultados de evaluación publicados, por lo que debe tratarse como una política experimental lista para ser validada en el robot objetivo antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, transformer compacto con codificador visual y cabezal de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural libre; recibe una instrucción de tarea fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que integra percepción visual y generación de acciones en una única red. La política consume tres cámaras (`overhead` y dos cámaras de muñeca, con entradas de 3×256×256 píxeles cada una) junto con el estado del robot de 6 dimensiones, y produce un vector de acción de 10 dimensiones. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y este checkpoint lo ajusta mediante aprendizaje por imitación supervisado sobre demostraciones de la tarea de apilado.

El entrenamiento se realizó con LeRobot 0.7.0 durante 30.000 pasos, con tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El conjunto de datos `nberezny/lite6_stack_dense` contiene 4.924 episodios y 143.843 fotogramas a 20 FPS, todos ellos de la misma tarea ("stack the blocks: red at the bottom, yellow, blue on top") sobre el tipo de robot `ufactory_lite6_sim_hybrid_dense_rel`. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento por preferencias; se trata de imitación pura supervisada.

## Capacidades

- Generación de acciones motoras de 10 dimensiones para un robot UFactory Lite6 a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos de imagen simultáneos (vista cenital y dos vistas de muñeca) a 256×256.
- Ejecución de una tarea de manipulación concreta: apilado de tres bloques en un orden especificado por instrucción.
- Control reactivo en bucle cerrado: la política se ejecuta a la frecuencia de control del robot (datos de entrenamiento a 20 FPS).
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües; es una política robótica, no un modelo de lenguaje de propósito general.

## Casos de uso

- Apilado de bloques en simulación: el escenario exacto para el que fue entrenado; se ejecuta con `lerobot-rollout` sobre el robot `ufactory_lite6_sim_hybrid_dense_rel` y la instrucción de tarea correspondiente.
- Base para ajuste fino en tareas de manipulación similares: al partir de `lerobot/smolvla_base` y estar entrenado con LeRobot, sirve como punto de partida para reentrenar con un dataset propio de apilado o ensamblaje.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline completo (grabación de datos, entrenamiento, evaluación) con hiperparámetros documentados (30.000 pasos, lote 32, lr 1e-4).
- Validación de políticas VLA en hardware de consumo: con 450 millones de parámetros, es viable ejecutarlo en una GPU de gama media para experimentar con despliegue robótico de bajo coste.
- Benchmark interno de referencia: útil como línea base de imitación para comparar variantes de SmolVLA o de otros modelos VLA en la misma tarea de apilado.
- Docencia y demostraciones de robótica: la tarea es visualmente clara y el modelo es lo bastante pequeño para ejecutarse en laboratorios con recursos limitados.
- Pruebas de robustez visual: al usar tres cámaras, permite estudiar el efecto de oclusiones, cambios de iluminación o posiciones de cámara sobre el éxito de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors y precisión de 16 bits, el peso de los parámetros ronda 0,9 GB, por lo que la inferencia completa (parámetros más activaciones de tres cámaras a 256×256) debería caber holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior debería ser suficiente. Para entrenamiento con lote 32 se recomienda una GPU con 16-24 GB (RTX 4090, A5000, A100).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, de la frecuencia de control y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_lite6_stack_dense (este) | 450 M | no disponible | Apilado de bloques con Lite6 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para ajuste fino | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación robótica general | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | no disponible | Imitación robótica general | Apache 2.0 | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un único dataset y una única tarea, la política probablemente sobreajusta a las condiciones visuales y posiciones de objeto del conjunto de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la escena difiere de la de entrenamiento.
- Limitaciones de contexto e idioma: la instrucción de tarea es fija ("stack the blocks: red at the bottom, yellow, blue on top"); el modelo no comprende lenguaje natural libre ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento deben verificarse por separado.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real; es imprescindible validar antes de cualquier despliegue.
- Dependencia de hardware específico: el tipo de robot `ufactory_lite6_sim_hybrid_dense_rel` y los nombres de cámara deben coincidir exactamente con los del entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.
- Fecha de creación futura (2026-11-21) en los metadatos: conviene tratar el artefacto con cautela y verificar su procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/smolvla_lite6_stack_dense
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/lite6_stack_dense
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/lite6_stack_dense
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
