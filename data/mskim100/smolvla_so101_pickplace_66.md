# msKim100/smolvla_so101_pickplace_66

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico por imitación con un coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este repositorio concreto, `msKim100/smolvla_so101_pickplace_66`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 66 episodios para la tarea de recoger un bloque y colocarlo en un objetivo, utilizando un brazo robótico SO-101 (SO-ARM100). El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en una tarea de manipulación concreta mediante fine-tuning eficiente, congelando el encoder visual (SigLIP) y el modelo de lenguaje (SmolLM2) y entrenando únicamente el "action expert" y las proyecciones, lo que reduce drásticamente el coste de entrenamiento. Está integrado en el ecosistema LeRobot, lo que facilita su despliegue en robots reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA: encoder visual SigLIP + modelo de lenguaje SmolLM2 + action expert |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa imágenes y estado, no texto largo) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | No disponible (el modelo no genera texto; la instrucción es una frase fija en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un encoder visual SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que predice acciones de 6 grados de libertad a partir de las observaciones. En este fine-tuning, el encoder visual y el modelo de lenguaje permanecen congelados, y solo se entrenan el action expert y las proyecciones, lo que supone aproximadamente 50 millones de parámetros entrenables. El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset de 66 episodios (55.138 frames a 30 FPS) grabados con tres cámaras (muñeca, cuerpo y superior) y el estado del robot (posición de 6 articulaciones). Se usaron 80.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate 0,0001. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento de imitación supervisada.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 grados de libertad (posición de articulaciones) a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural: la tarea se define mediante la frase "Pick up the block and place it on the target.", y el modelo asocia la instrucción con la acción correcta.
- Procesamiento multimodal: integra tres flujos de imagen (256x256 píxeles) y un vector de estado de 6 dimensiones.
- Especialización en pick-and-place: el modelo está optimizado para la tarea concreta de recoger un bloque y colocarlo en un objetivo, no para tareas generales.
- Despliegue en tiempo real: al ser compacto, puede ejecutarse en hardware de consumo con latencia baja, aunque no se proporcionan métricas específicas.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio o producción: el modelo puede controlar un brazo SO-101 para recoger y colocar objetos en posiciones definidas, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevas tareas o entornos, dado su tamaño reducido y facilidad de fine-tuning.
- Prototipado rápido de robots manipuladores: gracias a su integración con LeRobot, se puede desplegar en un robot real en minutos, permitiendo validar conceptos de automatización sin grandes inversiones.
- Educación en robótica y VLA: el modelo es un ejemplo didáctico de cómo fine-tunear un VLA con un dataset pequeño, útil para cursos y talleres.
- Benchmarking de eficiencia: permite comparar el rendimiento de un VLA compacto frente a modelos más grandes en tareas de manipulación, evaluando trade-offs entre precisión y coste computacional.
- Sistemas de control adaptativo: al ser Apache 2.0, puede integrarse en productos comerciales de robótica de servicio o automatización industrial, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas de éxito, precisión ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 450 millones de parámetros, en FP16 ocuparía aproximadamente 0,9 GB, pero al procesar tres imágenes de 256x256 y el modelo de lenguaje, se estima un consumo de 4-6 GB de VRAM en inferencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) debería ser suficiente. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4070, A10).
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para hardware de consumo, como se indica en la descripción de SmolVLA.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), que soporta inferencia en tiempo real. También puede exportarse a otros formatos si se convierte, aunque no se documenta.
- Latencia y throughput: no disponibles. Se espera que sea adecuado para control en tiempo real a 30 FPS, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| msKim100/smolvla_so101_pickplace_66 | 450M | No disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7B | 2048 tokens | Manipulación general | MIT | Hugging Face |
| RT-2 (55B) | 55B | 2048 tokens | Manipulación general | No abierto | No disponible |

SmolVLA es significativamente más pequeño que OpenVLA y RT-2, lo que permite ejecutarlo en hardware de consumo, pero su rendimiento en tareas generales es inferior. No hay comparativas directas publicadas para esta tarea específica.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea de pick-and-place con un bloque y un objetivo concretos; no generaliza a otras tareas u objetos sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de los 66 episodios de entrenamiento; puede haber sobreajuste a las condiciones específicas de grabación (iluminación, posición de cámaras, etc.).
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede producir acciones incorrectas o inestables en situaciones no vistas, especialmente si el estado del robot difiere del entrenamiento.
- Sin evaluación en robot real: no se han publicado resultados de éxito en el robot físico, por lo que el rendimiento real no está verificado.
- Idiomas: la instrucción está fijada en inglés; no soporta otros idiomas ni instrucciones variables.
- Requisitos de calibración: el despliegue requiere que las cámaras y el robot estén calibrados de forma consistente con el dataset de entrenamiento; cambios en la configuración pueden degradar el rendimiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/msKim100/smolvla_so101_pickplace_66
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/msKim100/so101_smolvla_merged_h264_66
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Blog sobre fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio GitHub relacionado: https://github.com/zwaneiz/so101-vla-pickplace
