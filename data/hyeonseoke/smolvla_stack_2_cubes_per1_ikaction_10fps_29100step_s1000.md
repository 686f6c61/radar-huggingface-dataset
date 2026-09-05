# HyeonseokE/smolvla_stack_2_cubes_per1_ikaction_10fps_29100step_s1000

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado para ejecutarse en hardware de consumo. Esta entrada concreta es un fine-tuning realizado por HyeonseokE a partir del modelo base `lerobot/smolvla_base`, entrenado con el framework LeRobot. El modelo resuelve una tarea específica de manipulación robótica: apilar un bloque verde sobre un bloque rojo, utilizando un robot SO-101 follower con cámaras top y left_wrist. Con 450 millones de parámetros, ofrece un punto de partida ligero para investigar políticas de imitación en robótica de bajo coste. La arquitectura combina un codificador visual, un modelo de lenguaje y una cabeza de acciones; no se especifica la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action), transformer compacto |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones. Se ha entrenado con el framework LeRobot sobre un dataset de 10 episodios y 3.291 fotogramas a 10 FPS, con la tarea "apilar el bloque verde sobre el bloque rojo". La configuración de entrenamiento incluye 29.100 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 1000. No se detalla la composición del dataset ni si se aplicaron técnicas como RLHF o DPO; la innovación principal es la eficiencia computacional del modelo base, que permite su despliegue en hardware de consumo.

## Capacidades

- Genera acciones de control (6 dimensiones) a partir del estado del robot y observaciones visuales.
- Ejecuta la tarea de apilado de cubos aprendida en el dataset de entrenamiento.
- Integra el framework LeRobot para entrenamiento, evaluación y despliegue.
- Acepta tres imágenes de 256x256 como entrada, además del estado del robot.
- No se documenta soporte de tool calling, generación de texto libre ni razonamiento simbólico.
- No se especifican capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación: usar como modelo de referencia para estudiar políticas VLA compactas y su transferencia a nuevas tareas.
- Despliegue en robots SO-101 follower: ejecutar la política en un brazo real para tareas de apilado en entornos controlados.
- Fine-tuning en nuevas tareas: partir de este modelo y ajustarlo con datasets propios para adaptarlo a otras manipulaciones.
- Educación en robótica: demostrar políticas de visión-lenguaje-acción en aulas con GPU de consumo.
- Benchmarking de modelos VLA: comparar el rendimiento con SmolVLA base en la misma tarea, midiendo éxito y robustez.
- Generación de datos para entrenamiento: usar el modelo para recopilar demostraciones y expandir datasets de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio README indica que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- No disponible. Al tratarse de un modelo de 450 millones de parámetros, se espera que pueda ejecutarse en GPU de consumo, pero no se especifican requisitos de VRAM ni latencia.
- El despliegue se realiza a través de LeRobot, que admite ejecución en GPU y CPU, aunque no se indican opciones como vLLM u Ollama.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de rendimiento comparado con otros modelos de la misma categoría. El único modelo base conocido es `lerobot/smolvla_base`, del cual deriva este fine-tuning.

## Limitaciones y advertencias

- Dataset de solo 10 episodios, lo que puede provocar sobreajuste y limitar la generalización a nuevas posiciones, iluminación o distracciones.
- Tarea específica de apilado de dos cubos; no es un modelo generalista.
- Sin resultados de evaluación publicados: el éxito de la política en entornos reales no está verificado.
- La model card presenta una discrepancia en el número de cámaras (dos en los detalles, tres en las entradas), lo que puede causar errores de configuración.
- Licencia Apache-2.0, que permite uso comercial y modificación, siempre que se mantengan los avisos de licencia.
- Riesgo de alucinación de acciones si las observaciones difieren significativamente del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_per1_ikaction_10fps_29100step_s1000
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/redundancy_stack_2_cubes_per1_ikaction_10fps
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
