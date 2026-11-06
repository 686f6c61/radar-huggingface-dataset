# Gserts/openpi-pi05-base-cube-charger-expert-lora32-20k

## Resumen

El modelo `Gserts/openpi-pi05-base-cube-charger-expert-lora32-20k` es un ajuste fino del checkpoint oficial `pi05_base` de OpenPI, orientado a control robótico. Lo desarrolla el usuario Gserts y resuelve una tarea concreta de manipulación: empujar un cubo hacia un cargador con un brazo SO101. Se trata de un modelo de política visomotora (VLA, vision-language-action) que parte de un backbone VLM congelado y añade un experto de acción entrenado mediante LoRA de rango 32.

El modelo no es un LLM de propósito general: es un artefacto de robótica entrenado durante 20.000 actualizaciones sobre el dataset `Gserts/push_cube_charger_20261102_205242`. La relevancia actual radica en que demuestra el patrón de bajo coste que OpenPI y pi05 proponen: congelar el VLM y adaptar solo el experto de acción con LoRA para tareas específicas, reduciendo el coste de entrenamiento y manteniendo el formato nativo de OpenPI en JAX/Orbax.

El repositorio ocupa 5,3 GB y se distribuye con licencia Apache 2.0. La arquitectura subyacente es pi05 (VLM + experto de acción con predicción de chunks), aunque el autor no detalla el número de parámetros totales ni la longitud de contexto del backbone VLM en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi05 (backbone VLM congelado + experto de acción con LoRA rank 32) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint nativo BF16 en JAX/Orbax) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint nativo OpenPI JAX Orbax (no es adaptador LeRobot PEFT) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint oficial `pi05_base`. La arquitectura combina un codificador visual y un backbone lingüístico VLM que permanecen completamente congelados durante el ajuste fino; no se instala LoRA en el VLM. Solo se optimiza el experto de acción: su base está congelada y se entrenan las capas LoRA de atención y FFN (rango 32, alpha 32) junto con `action_in_proj`, `action_out_proj`, `time_mlp_in` y `time_mlp_out`.

El entrenamiento se realizó con batch 32, semilla 42, precisión BF16, learning rate pico de 2,5e-5, warmup de 1000 pasos, decaimiento coseno con `decay_steps` 30000 y LR final de 2,5e-6, AdamW con `weight_decay` 1e-10, `gradient clip` 1.0 y sin EMA. Se ejecutaron 20.000 actualizaciones del optimizador, con checkpoints cada 10.000 pasos y al finalizar; el directorio final se etiqueta como 19999 por el esquema de guardado basado en cero del bucle oficial. Las estadísticas de normalización se calcularon con `compute_norm_stats.py` sobre el dataset y se empaquetaron en `assets/Gserts/push_cube_charger_20261102_205242/norm_stats.json`.

La configuración sensorial y de acción usa dos cámaras RGB: la frontal se mapea a `base_0_rgb` y la de muñeca a `left_wrist_0_rgb`; la cámara de muñeca derecha no usada se enmascara. El modelo predice seis acciones absolutas de articulaciones SO101 en chunks de 50, con dimensión interna de acción rellenada hasta 32.

## Capacidades

- Generación de acciones robóticas para un brazo SO101: seis acciones absolutas de articulaciones por paso.
- Predicción de acciones en chunks de 50 pasos, con dimensión interna de acción de 32.
- Percepción visomotora con dos cámaras RGB (frontal y de muñeca izquierda).
- Ejecución de una tarea concreta de manipulación: empujar un cubo hacia un cargador.
- Integración con el ecosistema OpenPI en JAX/Orbax.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modos de pensamiento; el modelo está especializado en control robótico.

## Casos de uso

- Manipulación de un cubo hacia un cargador con SO101: el modelo recibe imágenes de las cámaras frontal y de muñeca y emite chunks de 50 acciones articulares para completar la tarea de empuje.
- Investigación en ajuste fino eficiente de políticas VLA: sirve como referencia de un pipeline que congela el VLM y adapta solo el experto de acción con LoRA rank 32.
- Reproducción de experimentos de OpenPI: el checkpoint, las estadísticas de normalización y el manifiesto de entrenamiento permiten replicar el setup con el bucle oficial.
- Evaluación de políticas visomotoras en entornos de laboratorio con SO101: útil para comparar estrategias de congelación y LoRA en tareas de contacto.
- Base para adaptaciones a tareas similares de pick-and-place o empuje: al mantener el VLM congelado, se puede reentrenar el experto de acción sobre nuevos datasets con coste reducido.
- Docencia y demostraciones de robótica con hardware asequible: el uso de SO101 y dos cámaras RGB facilita montajes de bajo coste.
- Integración en pipelines de investigación con JAX: el formato Orbax nativo encaja en flujos de entrenamiento y evaluación de OpenPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 5,3 GB y el checkpoint se distribuye en BF16, por lo que se requiere al menos espacio equivalente para pesos y activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: checkpoint nativo OpenPI en JAX/Orbax; no es un adaptador LeRobot PEFT y no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gserts/openpi-pi05-base-cube-charger-expert-lora32-20k | no disponible | no disponible | Empuje de cubo a cargador con SO101 | Apache 2.0 | Hugging Face (0 descargas) |
| pi05_base (OpenPI) | no disponible | no disponible | Política VLA base | no disponible | Checkpoint oficial OpenPI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para empujar un cubo hacia un cargador con SO101; no es un modelo de propósito general.
- Sin datos de benchmarks ni métricas de éxito publicadas; el rendimiento real en la tarea no está verificado en la información disponible.
- Dependencia del dataset y de las estadísticas de normalización empaquetadas; cambios en la configuración de cámaras o en el robot pueden degradar el comportamiento.
- La cámara de muñeca derecha está enmascarada; el modelo asume una configuración sensorial concreta (frontal y muñeca izquierda).
- Riesgo de sobreajuste al entorno de entrenamiento y de fallo ante variaciones de iluminación, posición de objetos o dinámica del robot.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos, riesgos de alucinación ni garantías de seguridad física en entornos reales.
- No es un adaptador LeRobot PEFT; requiere el stack OpenPI en JAX/Orbax para su uso.
- Sin información sobre idiomas, contexto o cuantizaciones; no apto para tareas de texto general.

## Enlaces

- Hugging Face: https://huggingface.co/Gserts/openpi-pi05-base-cube-charger-expert-lora32-20k
- Dataset: https://huggingface.co/datasets/Gserts/push_cube_charger_20261102_205242
- OpenPI (repositorio oficial): no disponible en la información proporcionada
- Paper de pi05: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
