# Rwang30/act_push

## Resumen

El modelo `Rwang30/act_push` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. El modelo fue desarrollado por el usuario Rwang30 y está diseñado para controlar un brazo robótico SO101 en la tarea de empujar un cubo hacia una zona objetivo. ACT predice secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en manipulaciones robóticas teleoperadas.

El modelo tiene 51,6 millones de parámetros, un tamaño modesto para una política de control robótico, y se entrenó sobre un conjunto de datos de 10 episodios y 4.471 fotogramas a 30 FPS. La relevancia de este modelo radica en que ejemplifica el flujo de trabajo de LeRobot para entrenar y desplegar políticas de imitación en robots reales, y puede servir como punto de partida para experimentos en manipulación robótica. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de control robótico) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer codificador-decodificador para predecir un "chunk" de acciones futuras (por ejemplo, 10 pasos) en lugar de una sola acción. El modelo procesa observaciones visuales de una cámara frontal (imágenes de 480x640) junto con el estado del robot (6 dimensiones) y genera acciones de 6 dimensiones. La arquitectura incorpora un mecanismo de atención temporal que permite al modelo planificar secuencias de movimiento coherentes.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `Rwang30/so101-push-task`, que contiene 10 episodios teleoperados de la tarea "Push the cube into the target zone". Se usaron 20.000 pasos de entrenamiento con batch size 8, optimizador AdamW y una tasa de aprendizaje de 1e-5. No se menciona el uso de RLHF, DPO ni técnicas de refuerzo adicionales; el método es puramente de imitación supervisada.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un brazo robótico SO101.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Procesamiento multimodal: combina entrada visual (imagen frontal) y estado del robot (posición/velocidad).
- Predicción por chunks: emite secuencias de acciones en lugar de pasos individuales, lo que reduce la acumulación de errores.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Sin capacidades de lenguaje, visión general o razonamiento simbólico; es un modelo especializado en control motor.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar la tarea de empujar un cubo a una zona objetivo en un robot SO101, útil para validar pipelines de imitación.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar variantes de ACT o hiperparámetros en tareas de empuje.
- Desarrollo de políticas para robots de bajo coste: al tener solo 51,6 millones de parámetros, puede ejecutarse en hardware modesto, facilitando experimentos en entornos académicos.
- Automatización de tareas repetitivas en entornos controlados: por ejemplo, ordenar piezas en una mesa siguiendo una zona marcada, siempre que la variabilidad sea baja.
- Benchmark de LeRobot: el modelo y su dataset asociado pueden usarse para probar nuevas funcionalidades del framework (rollout, entrenamiento distribuido, etc.).
- Transferencia a tareas similares: el checkpoint puede servir como inicialización para fine-tuning en tareas de empuje con diferentes objetos o posiciones, reduciendo el tiempo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de 51,6 millones de parámetros, la inferencia en tiempo real debería caber en GPUs con al menos 2-4 GB de VRAM (dependiendo del tamaño de lote y resolución de imagen).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100). El entrenamiento se realizó con `--policy.device=cuda`, por lo que se asume GPU.
- Compatibilidad con GPU de consumo: sí, el tamaño del modelo permite ejecutarse en GPUs de gama media.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible exportar a otros formatos, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles. Dependerá de la GPU y de la resolución de entrada (480x640).

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rwang30/act_push | 51,7 M | Empujar cubo (SO101) | LeRobot | Apache 2.0 | Hugging Face |
| KoukiHagiwara/act_slide_push_pull_v3 | no disponible | Deslizar/empujar/tirar | LeRobot | no disponible | Hugging Face |
| Kimz1/act-pusht-policy-0825 | no disponible | PushT (simulación) | LeRobot | no disponible | Hugging Face |

No hay datos de rendimiento comparativos publicados para estos modelos. La comparación se limita a características generales y al hecho de que todos usan ACT con LeRobot.

## Limitaciones y advertencias

- Sesgos conocidos: no aplicables, al ser un modelo de control robótico sin procesamiento de lenguaje.
- Riesgo de alucinación: no relevante en este contexto; el riesgo principal es que la política genere acciones incorrectas o inseguras si se enfrenta a situaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto: el modelo solo acepta una cámara frontal y un estado de 6 dimensiones; no soporta otras configuraciones de sensores.
- Limitaciones de idioma: no aplica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright y se indiquen los cambios.
- Advertencias para producción: el dataset de entrenamiento es muy pequeño (10 episodios) y la tarea es específica; la generalización a otras posiciones, objetos o condiciones de iluminación puede ser pobre. No se han realizado evaluaciones en robot real, por lo que el rendimiento real es desconocido.
- Seguridad: al controlar un robot físico, se deben implementar mecanismos de parada de emergencia y supervisión humana durante el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rwang30/act_push
- Dataset de entrenamiento: https://huggingface.co/datasets/Rwang30/so101-push-task
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot (guía ACT): https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rwang30/so101-push-task
