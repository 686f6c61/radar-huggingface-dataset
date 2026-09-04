# alanoob/panda-sort-three-stack-cup-mixed-30hz

## Resumen

El modelo `alanoob/panda-sort-three-stack-cup-mixed-30hz` es un modelo de política de robot de la familia Pi0 (π0), desarrollado por el usuario `alanoob` para controlar un brazo robótico Franka Panda en una tarea de apilar tazas. La información disponible se limita a una configuración de entrenamiento (`TrainConfig`) publicada en la model card, sin descripciones adicionales ni resultados de evaluación. El modelo parece orientado a la predicción de acciones a partir de entradas visuales y proprioceptivas, con un horizonte de acción de 20 pasos y una frecuencia de control de 30 Hz. No se dispone de datos sobre arquitectura detallada, número de parámetros, licencia o idiomas soportados, por lo que cualquier uso en producción requeriría una verificación exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0 (Vision-Language-Action), con `pi05=True` en la configuración |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La configuración publicada indica que el modelo utiliza `pi0_config.Pi0Config` con `pi05=True`, `action_horizon=20` y `discrete_state_input=False`. Esta es la arquitectura de la familia Pi0, un modelo de política de visión-lenguaje-acción (VLA) diseñado para generar comandos de actuación en robots a partir de observaciones multimodales. El `TrainConfig` incluye un `FrankaDataConfig` que apunta a un dataset con `repo_id="kitalr/panda_sort_three_stack_two_cup_mixed_30hz"`, lo que sugiere una tarea de apilado de tazas con un brazo Franka. El entrenamiento usa `use_ee_control=True`, `include_gripper_proprio=True` e `include_third_cam=True`, es decir, incorpora control del efector final, propriocepción de la pinza y una tercera cámara como entradas. Los parámetros de entrenamiento indican `batch_size=16`, `num_train_steps=20_001`, un scheduler de coseno con `warmup_steps=1_000`, optimizador AdamW y `ema_decay=0.999`. No se especifica la composición del dataset ni el número de tokens de entrenamiento.

## Capacidades

- Generación de acciones de manipulación robótica a partir de entradas visuales y proprioceptivas.
- Control de un brazo Franka Panda en una tarea concreta de apilado de tazas (`sort_three_stack_cup`).
- Uso de control del efector final (`use_ee_control=True`) y retroalimentación de la pinza.
- Procesamiento de vídeo con tres cámaras (incluida una tercera cámara) a 30 Hz.
- Predicción de un horizonte de acciones de 20 pasos (`action_horizon=20`).
- No hay información sobre soporte de tool calling, agentes, razonamiento o capacidades multilingües.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede emplearse para controlar un brazo Franka en tareas repetitivas de apilado de tazas, siempre que el entorno y el dataset de referencia coincidan.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar políticas VLA en tareas de manipulación de objetos con entrada de vídeo y propriocepción.
- Desarrollo de habilidades de manipulación en robótica de 7 DoF: permite experimentar con el control del efector final y la retroalimentación de la pinza en brazos tipo Franka.
- Benchmarking de políticas de acción para tareas de apilado: puede utilizarse como base para evaluar el rendimiento de otros modelos de la familia Pi0 o similares.
- Entornos educativos de robótica: podría integrarse en cursos o demostraciones de control robótico basado en aprendizaje, aunque requiere verificación previa.
- Investigación en control de frecuencia de 30 Hz: permite estudiar el efecto de la frecuencia de actuación en tareas de manipulación con horizonte de 20 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. Al tratarse de un modelo de la familia Pi0, se espera que requiera una GPU con suficiente VRAM para cargar los pesos (el repositorio tiene un tamaño de 12.4 GB), pero este dato no está confirmado. Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este modelo.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos con otros modelos de la misma categoría en la información disponible. Existen otros repositorios de la familia Pi0 y modelos LoRA relacionados, como `alanoob/panda-sort-three-no-red-left-lora`, pero no se dispone de métricas comparables.

## Limitaciones y advertencias

- La información disponible es extremadamente limitada: no se especifica licencia, idiomas, arquitectura de red ni detalles de cuantización.
- No se han publicado resultados de evaluación ni benchmarks, por lo que el rendimiento real del modelo es desconocido.
- El modelo está entrenado para una tarea muy específica (apilado de tazas con un brazo Franka) y puede no generalizar a otros entornos o tareas sin reentrenamiento.
- Al no conocer la licencia, no se puede garantizar el uso comercial o la redistribución.
- El repositorio no presenta descargas ni "likes", lo que sugiere que es un modelo de investigación no validado por la comunidad.
- Cualquier despliegue en producción requeriría una validación exhaustiva con datos propios y una revisión de la documentación original.

## Enlaces

- HuggingFace: [https://huggingface.co/alanoob/panda-sort-three-stack-cup-mixed-30hz](https://huggingface.co/alanoob/panda-sort-three-stack-cup-mixed-30hz)
- Modelo relacionado: [https://huggingface.co/alanoob/panda-sort-three-no-red-left-lora](https://huggingface.co/alanoob/panda-sort-three-no-red-left-lora)
