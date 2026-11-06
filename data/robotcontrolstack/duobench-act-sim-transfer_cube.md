# RobotControlStack/duobench-act-sim-transfer_cube

## Resumen

DuoBench ACT (sim) es una política de imitación basada en la arquitectura ACT (Action Chunking Transformer) publicada por RobotControlStack para el entorno bimanual FR3 Duo del benchmark DuoBench. El modelo resuelve una única tarea de manipulación, `transfer_cube`, entrenada exclusivamente con datos de simulación. Se distribuye como un checkpoint de LeRobot de 51.689.104 parámetros (0,2 GB) y está pensado como referencia reproducible para comparar políticas de manipulación bimanual en simulación frente a sus equivalentes en el mundo real.

Su relevancia es metodológica más que de rendimiento: forma parte de un conjunto de políticas de referencia publicadas junto al benchmark, todas entrenadas bajo la misma configuración (50 demostraciones por tarea, 150.000 pasos, batch 64, learning rate 1e-5, action chunk 100) para que los resultados sean comparables entre sí. El modelo no está destinado a operar un robot real, sino a servir como línea base en experimentos de simulación.

La ficha se basa únicamente en la model card y los metadatos del repositorio; no hay información pública sobre composición del dataset más allá del número de demostraciones, ni sobre sesgos o comportamiento fuera de la tarea entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint LeRobot) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice secuencias de acciones (action chunks) a partir de observaciones visuales y de estado propioceptivo. En esta configuración, las entradas son tres cámaras (`head`, `left_wrist`, `right_wrist`) a resolución 224x224 más un vector de estado de 16 dimensiones (2 x 7 articulaciones + 2 pinzas); la salida es un vector de acción conjunto de 16 dimensiones (articulaciones y pinzas). El tamaño de chunk de acción es 100.

El entrenamiento se realizó desde cero con LeRobot en el commit `c8ce413d`, usando 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset `RobotControlStack/duobench`. La configuración completa está en `train_config.json`: 150.000 pasos, batch size 64, learning rate 1e-5, semilla 1000. No se documenta en la información disponible si hubo fases de RLHF, DPO ni ningún otro ajuste posterior al entrenamiento por imitación.

## Capacidades

- Manipulación bimanual en simulación: control de dos brazos FR3 con pinzas sobre la tarea `transfer_cube`.
- Política de imitación de una sola tarea: no generaliza a otras tareas del benchmark sin reentrenamiento.
- Entrada multimodal: tres vistas de cámara (cabeza y muñecas izquierda y derecha) más estado propioceptivo de 16 dimensiones.
- Salida de acciones de 16 dimensiones (articulaciones y pinzas) en forma de chunks de 100 pasos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto, visión general o audio.
- No dispone de modo de razonamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Línea base en el benchmark DuoBench: sirve para comparar nuevas políticas bimanuales contra un resultado de referencia medido con 300 rollouts y semillas 0-299 en la tarea `transfer_cube`.
- Reproducción de experimentos: al fijar el commit de LeRobot y publicar `train_config.json`, permite replicar el entrenamiento y verificar la tasa de éxito reportada.
- Estudio de sim-to-real: el checkpoint sirve como punto de partida para analizar la brecha entre políticas entrenadas solo en simulación y sus equivalentes reales del mismo benchmark.
- Docencia e investigación en imitación: ejemplo mínimo (50 demostraciones) de pipeline completo LeRobot para manipulación bimanual.
- Evaluación de infraestructura de simulación: útil para validar entornos de simulación, scripts de evaluación y protocolos de semillas antes de escalar a políticas más costosas.
- Pruebas de integración con LeRobot: valida la carga de checkpoints ACT y la compatibilidad de versiones en pipelines de investigación.

## Benchmarks y rendimiento

Resultados en simulación DuoBench sobre 300 rollouts por tarea (semillas 0-299) con intervalo de confianza Wilson del 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| transfer_cube | 10,0 | [7,1; 13,9] |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros en fp32 el peso de los pesos ronda los 0,2 GB, por lo que la memoria dominante será la de las tres cámaras a 224x224 y los buffers de inferencia.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte CUDA suficiente para LeRobot debería poder ejecutar la política.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, aunque el requisito exacto no está documentado.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` mediante `ACTPolicy.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de DuoBench ni políticas comparables con parámetros, contexto o licencia detallados.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación: el autor indica explícitamente que no está pensado para el robot real.
- Política de una sola tarea: no cubre otras tareas de DuoBench sin reentrenamiento.
- Tasa de éxito baja (10,0 % en `transfer_cube`): no es adecuada como solución de producción, sino como línea base.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; versiones distintas pueden fallar al cargar el checkpoint.
- No hay información sobre sesgos, alucinación (no aplica a generación de texto) ni comportamiento fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo solo es válido en el contexto del benchmark y la simulación.
- Solo 50 demostraciones por tarea: la cobertura del espacio de estados es limitada y puede explicar el bajo rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotControlStack/duobench-act-sim-transfer_cube
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench: https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de referencia): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
