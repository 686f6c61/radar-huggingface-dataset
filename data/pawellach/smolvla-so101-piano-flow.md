# PawelLach/smolvla-so101-piano-flow

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `PawelLach/smolvla-so101-piano-flow`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 300 episodios en el que un brazo robótico SO-101 (variante `so_follower`) pulsa teclas de un piano. El modelo recibe el estado articular y tres cámaras de 256x256 y emite directamente las seis acciones de control del brazo, sin necesidad de planificación explícita.

Con 450 millones de parámetros y licencia Apache 2.0, el modelo está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios pequeños y proyectos de robótica de bajo coste. La relevancia de esta ficha es acotada: es una política especializada en una tarea muy concreta (pulsar seis teclas de piano), no un modelo de propósito general. Se publica como ejemplo reproducible del flujo de entrenamiento de LeRobot y del modelo SmolVLA descrito en el paper arXiv:2506.01844.

El modelo no dispone de resultados de evaluación publicados ni de métricas de éxito en robot real, por lo que su utilidad práctica debe validarse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, transformer con encoder visual y política de difusión/flow matching) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las tareas se especifican en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Cámaras | front, ears (3 entradas visuales de 3x256x256) |
| Entrada de estado | observation.state (6,) |
| Salida de acción | action (6,) |
| Tamaño del repo | 12,5 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un encoder visual (procesa tres cámaras de 256x256), un encoder de lenguaje para la instrucción de tarea y un cabezal de política que genera acciones continuas de 6 dimensiones. El modelo base `lerobot/smolvla_base` se describe en el paper arXiv:2506.01844 como un VLA compacto y eficiente capaz de ejecutarse en hardware de consumo manteniendo rendimiento competitivo frente a modelos más grandes. Esta ficha concreta es un fine-tuning de ese modelo base, no un entrenamiento desde cero.

El fine-tuning se realizó con LeRobot 0.7.1 sobre el dataset `PawelLach/so101_keys_flow_300ep`: 300 episodios, 25.308 frames a 30 FPS, con seis tareas de pulsación de teclas ("play do, the first key", "play re, the second key", "play mi, the third key", "play fa, the fourth key", "play sol, the fifth key", "play la, the sixth key"). La configuración de entrenamiento fue de 10.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta si hubo RLHF, DPO ni otras fases de alineamiento posteriores al entrenamiento por imitación.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para un brazo SO-101 a partir de estado articular y tres cámaras.
- Seguimiento de instrucciones de tarea en lenguaje natural (las seis instrucciones de pulsación de teclas del dataset).
- Percepción visual multi-cámara: procesa tres flujos de imagen de 256x256 simultáneamente.
- Ejecución de políticas de flujo (flow matching) para generación de acciones continuas.
- No soporta tool calling, function calling ni razonamiento multi-paso: es una política de control, no un LLM conversacional.
- Capacidades multilingües: no disponibles; las instrucciones del dataset están en inglés.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Demostración reproducible de SmolVLA: sirve como ejemplo completo del flujo `lerobot-train` + `lerobot-rollout` para quien quiera aprender a entrenar políticas VLA con LeRobot, usando un dataset pequeño y una tarea acotada.
- Pulsación automatizada de teclas en un piano físico: el caso de uso directo del modelo, con un brazo SO-101 equipado con tres cámaras, ejecutando instrucciones como "play do, the first key" durante sesiones de hasta 60 segundos.
- Base para fine-tuning en tareas de manipulación similares: al partir de `lerobot/smolvla_base` y Apache 2.0, se puede reentrenar con un dataset propio de otra tarea de manipulación con SO-101.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del número de episodios (300), la resolución de cámara (256x256) y la configuración de entrenamiento en el éxito de una política VLA.
- Benchmark interno de hardware de consumo: al tener 450M de parámetros, sirve para medir latencia y throughput de SmolVLA en GPUs de gama media en un escenario realista.
- Prototipado de interfaces humano-robot con instrucciones en lenguaje natural: el modelo acepta una instrucción textual por episodio, lo que permite probar variantes de prompt de tarea en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 450M de parámetros en fp32, el peso ronda 1,8 GB; en fp16, unos 0,9 GB, pero el repo ocupa 12,5 GB por los checkpoints y el optimizador, no por el peso de inferencia.
- GPU recomendadas: no especificadas. El paper de SmolVLA indica que está pensado para hardware de consumo, pero esta ficha no documenta modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño (450M parámetros), pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se documenta la latencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PawelLach/smolvla-so101-piano-flow | 450M | no disponible | Apache 2.0 | Hugging Face | Fine-tuning especializado en piano SO-101 |
| lerobot/smolvla_base | no disponible en la información | no disponible | Apache 2.0 | Hugging Face | Modelo base del que deriva esta ficha |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | no disponible | no disponible | No se aportan datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para pulsar seis teclas de piano con un SO-101; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad.
- Dependencia de hardware concreto: requiere un robot `so_follower`, tres cámaras con nombres `front` y `ears` y calibración específica; no funciona con otras configuraciones sin ajustes.
- Sesgos: no documentados, pero el dataset de 300 episodios y 25.308 frames es pequeño y puede reflejar condiciones de iluminación, posiciones y operador concretos.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de control, puede generar movimientos erróneos o inseguros fuera de la distribución de entrenamiento.
- Limitaciones de idioma: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y no hay evaluación que respalde un despliegue en producción.
- Fecha de creación futura en los metadatos (2026-11-17): conviene verificar la vigencia y el estado del repo antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawelLach/smolvla-so101-piano-flow
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/PawelLach/so101_keys_flow_300ep
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=PawelLach/so101_keys_flow_300ep
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
