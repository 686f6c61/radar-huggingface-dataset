# HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el artículo "SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robot Manipulation" (arXiv:2506.01844). Este fine-tune concreto, `HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_2000_10fps`, ha sido entrenado por HyeonseokE sobre la base `lerobot/smolvla_base` para ejecutar la tarea de clasificar bloques de colores en platos del mismo color, utilizando un robot SO-101 follower con dos cámaras (superior y muñeca izquierda). El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors, con licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede ser fine-tuneado para tareas robóticas específicas con un coste computacional bajo, siendo desplegable en hardware de consumo. Frente a los VLA masivos (como OpenVLA con 7B parámetros), SmolVLA reduce drásticamente los requisitos de memoria y latencia, manteniendo capacidades de percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones. Este checkpoint en particular está orientado a la manipulación robótica en entornos controlados, con un dataset de 100 episodios y 74.827 frames a 10 FPS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con VLM compacto y experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y visión (VLM) preentrenado y compacto con un "experto de acciones" entrenado mediante flow matching. El VLM procesa múltiples imágenes (en este caso, tres vistas: dos cámaras y una adicional) junto con una instrucción en lenguaje natural, y el experto de acciones genera un chunk de acciones de 6 dimensiones (posiciones y orientaciones del efector). Esta arquitectura permite que el modelo aproveche el conocimiento visual y lingüístico del VLM preentrenado, mientras que el experto de acciones se especializa en el control motor.

El fine-tune se realizó con LeRobot (versión 0.6.0) sobre el dataset `HyeonseokE/phase1_sort_by_color_A2_10fps_via4cm`, que contiene 100 episodios y 74.827 frames a 10 FPS, con la tarea "Sort the blocks onto the matching colored dishes". La configuración de entrenamiento incluyó 58.450 pasos, batch size de 64, optimizador AdamW y learning rate de 0.0001. No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitación supervisada con flow matching.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación) para un brazo robótico SO-101.
- Percepción visual multi-cámara: procesa tres imágenes de 256x256 píxeles (cámara superior, muñeca izquierda y una tercera) para entender la escena.
- Comprensión de instrucciones en lenguaje natural: interpreta comandos como "Sort the blocks onto the matching colored dishes" y los traduce en secuencias de acciones.
- Generación de acciones en chunk: produce bloques de acciones (action chunking) para ejecución fluida y sin paradas.
- Fine-tune específico de tarea: está especializado en la clasificación de objetos por color, no es un modelo generalista.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo despliegue en robots reales.

## Casos de uso

- Automatización de clasificación en almacenes: el modelo puede ordenar piezas o productos por color en cintas transportadoras, reduciendo la intervención humana en tareas repetitivas.
- Robótica educativa e investigación: sirve como punto de partida para estudiar VLA compactos y fine-tuning de políticas robóticas con datasets pequeños.
- Prototipado rápido de tareas de manipulación: permite validar una tarea de pick-and-place o sorting en un robot SO-101 antes de escalar a modelos más grandes.
- Demostración de VLA en hardware de bajo coste: al tener solo 450M de parámetros, puede ejecutarse en GPUs de consumo, lo que facilita su uso en laboratorios con recursos limitados.
- Benchmark de imitación learning: el checkpoint puede usarse como referencia para comparar técnicas de entrenamiento (flow matching, action chunking) en tareas de clasificación.
- Base para fine-tuning adicional: al ser un modelo abierto, se puede re-entrenar sobre nuevos datasets para adaptarlo a otras tareas de manipulación (apilar, insertar, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras.

## Requisitos de hardware

- VRAM estimada: al tener 450M de parámetros, el modelo en fp32 ocupa aproximadamente 1,8 GB; en fp16/bf16, alrededor de 0,9 GB. Cabe en GPUs con 4 GB de VRAM o más, aunque no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente para inferencia. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos de SmolVLA: ejecutarse en hardware de consumo.
- Opciones de despliegue: LeRobot (con `lerobot-rollout`), y potencialmente vLLM o TGI si se adapta, aunque el flujo principal es LeRobot.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450M | no disponible | Clasificacion por color | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | 8K | Manipulacion general | MIT | HuggingFace |
| RT-2 (Google) | 55B | 8K | Manipulacion general | Propietaria | No publico |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que permite su despliegue en hardware de consumo. Sin embargo, no se dispone de comparativas de rendimiento en tareas equivalentes. OpenVLA tiene una licencia más permisiva (MIT) y un contexto mayor, pero requiere más recursos. RT-2 no está disponible públicamente.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea de clasificar bloques por color; no es generalista y fallará en tareas fuera de su distribución.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de los 100 episodios de entrenamiento; puede no generalizar a nuevas posiciones, iluminación o tipos de objetos.
- Sin evaluación en robot real: no hay resultados de éxito reportados, por lo que su fiabilidad en producción no está validada.
- Riesgo de alucinación en instrucciones: como VLM, puede malinterpretar instrucciones ambiguas o generar acciones incorrectas si la escena difiere del entrenamiento.
- Requiere hardware robótico específico: está diseñado para el robot SO-101 follower y cámaras concretas; adaptarlo a otros robots requiere reentrenamiento.
- Idiomas: las instrucciones están en inglés; no se ha probado con otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales (verificar el dataset).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A2_via4cm_2000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A2_10fps_via4cm
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
