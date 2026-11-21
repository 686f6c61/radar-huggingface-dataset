# brouthen/act_so101_pick_rb_mixed_b32_38k

## Resumen

`brouthen/act_so101_pick_rb_mixed_b32_38k` es una política de robótica basada en ACT (Action Chunking Transformer) entrenada desde cero con LeRobot 0.7.0 sobre el conjunto de datos `molnrb/so101_pick_rb_mixed`. El modelo resuelve una tarea de manipulación muy concreta: recoger una pelota rayada de un cuenco lleno de pelotas rojas y azules con un brazo robótico SO-101. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un controlador de imitación que mapea observaciones visuales (dos cámaras, `top` y `wrist`) a secuencias de acciones del robot.

El entrenamiento se realizó con un batch de 32, learning rate de 2e-5, precisión bf16 y una planificación de 38.000 pasos, con un 5% de los episodios reservados para validación (4 episodios, semilla 1000). El repositorio contiene checkpoints independientes en carpetas (`005000/`, `010000/`, `015000/`, `020000/`), cada una de las cuales es un directorio `pretrained_model` completo listo para usarse con `lerobot-rollout`.

Su relevancia es acotada pero clara para la comunidad de robótica open source: sirve como referencia reproducible de un pipeline LeRobot de extremo a extremo sobre el robot SO-101, con datos, hiperparámetros y curvas de pérdida publicados. El modelo está en estado de entrenamiento activo según la model card, y las descargas y likes son prácticamente nulos, por lo que debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de contexto textual) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato LeRobot `pretrained_model`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice *chunks* de acciones futuras a partir de observaciones visuales y del estado del robot, en lugar de una única acción por paso. El modelo consume dos flujos de cámara (`top` y `wrist`) a resolución 640x480 y 30 fps, y produce comandos para el brazo SO-101. No se dispone de detalles adicionales sobre el número de capas, dimensión oculta, número de cabezas ni tamaño del chunk de acciones en la información proporcionada.

El entrenamiento se realizó con LeRobot 0.7.0 sobre 80 episodios del dataset `molnrb/so101_pick_rb_mixed`, con batch 32, learning rate 2e-5, precisión bf16 y 38.000 pasos planificados, de los cuales se han completado al menos 20.000 según la tabla de checkpoints. Se reservó un 5% de episodios (4 episodios, semilla 1000) para validación. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado. La pérdida de validación oscila entre 0,3292 (checkpoint 10.000) y 0,3434 (checkpoint 5.000), con el autor advirtiendo explícitamente que con tan pocos episodios las diferencias de pocos puntos porcentuales son ruido.

## Capacidades

- Control de manipulación robótica para la tarea específica de recoger una pelota rayada de un cuenco con pelotas rojas y azules.
- Predicción de chunks de acciones (Action Chunking) para el brazo SO-101.
- Procesamiento de dos cámaras simultáneas (`top` y `wrist`) a 640x480 y 30 fps.
- Ejecución mediante `lerobot-rollout` con el mismo robot, nombres de cámara y resolución usados en la grabación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modos de pensamiento. Es una política de imitación de dominio único.

## Casos de uso

- Reproducción de experimentos LeRobot: el repositorio permite descargar checkpoints concretos y ejecutar `lerobot-rollout` para replicar el pipeline completo de entrenamiento e inferencia sobre SO-101, útil para validar versiones de la librería y configuraciones.
- Benchmark interno de manipulación pick-and-place: sirve como línea base para comparar nuevas políticas (ACT, Diffusion Policy, VLA) sobre la misma tarea y el mismo dataset de 80 episodios.
- Docencia y formación en robótica de imitación: al estar entrenado desde cero con hiperparámetros y pérdidas publicadas, es un ejemplo didáctico de cómo se comporta ACT con pocos datos y qué nivel de pérdida de validación es esperable.
- Pruebas de integración de hardware SO-101: el checkpoint `010000` (mejor pérdida de validación, 0,3292) puede usarse para verificar que el montaje físico de cámaras y brazo coincide con el de la grabación antes de entrenar políticas propias.
- Estudio de la variabilidad en validación con datasets pequeños: la tabla de pérdidas entre checkpoints permite analizar la estabilidad del entrenamiento con solo 4 episodios de validación.
- Punto de partida para fine-tuning: aunque la model card no lo documenta, el formato `pretrained_model` de LeRobot permite reutilizar los pesos como inicialización para tareas relacionadas de recogida sobre SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de validación (held-out loss) sobre 4 episodios no vistos:

| Checkpoint | Held-out loss |
|---|---|
| `005000/` | 0,3434 |
| `010000/` | 0,3292 |
| `015000/` | 0,3339 |
| `020000/` | 0,3356 |
| `025000/` | n/a |

No hay datos de tasa de éxito en la tarea, número de episodios evaluados en entorno real ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 1,0 GB e incluye varios checkpoints; un único checkpoint ocuparía una fracción de ese total, pero no se especifica el número de parámetros.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento usó bf16, lo que sugiere GPU con soporte para esa precisión (Ampere o posterior), pero no se confirma el modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño reducido del repositorio, es plausible que un checkpoint individual quepa en GPUs de consumo, pero no hay dato que lo respalde.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path` apuntando al directorio del checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, Diffusion Policy ni modelos VLA sobre el mismo dataset o robot.

## Limitaciones y advertencias

- Entrenamiento en curso: la model card indica explícitamente "Training status: running", por lo que los checkpoints publicados pueden quedar obsoletos y el `025000/` aún no tiene pérdida reportada.
- Dataset muy pequeño: 80 episodios en total y solo 4 para validación; el propio autor advierte que diferencias de pocos puntos porcentuales en la pérdida son ruido estadístico.
- Dominio extremadamente estrecho: la política está entrenada para una única tarea (pelota rayada en un cuenco de pelotas rojas y azules) y no generaliza a otras tareas, objetos ni entornos.
- Dependencia del montaje físico: requiere el mismo robot SO-101, los mismos nombres de cámara (`top`, `wrist`) y la misma resolución (640x480) que en la grabación; cualquier cambio invalida la política.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste y de fallo silencioso: sin métricas de tasa de éxito en entorno real, no hay evidencia publicada de robustez ante iluminación, posiciones iniciales o variaciones de los objetos.
- Sesgos: no aplica en el sentido habitual de sesgos lingüísticos, pero sí existe un sesgo hacia las condiciones visuales y de iluminación presentes en los 80 episodios de entrenamiento.
- Sin garantías de soporte: 0 descargas y 1 like en el momento de la consulta; el proyecto parece individual y experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brouthen/act_so101_pick_rb_mixed_b32_38k
- Dataset de entrenamiento: https://huggingface.co/datasets/molnrb/so101_pick_rb_mixed
- LeRobot (librería): https://github.com/huggingface/lerobot
