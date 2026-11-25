# mxk1998/RoboDemo-full50

## Resumen

RoboDemo-full50 es una política de imitación para manipulación robótica de horizonte largo, desarrollada por el autor mxk1998 y publicada bajo el identificador `mxk1998/RoboDemo-full50`. El modelo resuelve el problema de reconciliar la intención de una demostración humana con el progreso real de ejecución en tareas de manipulación, y se presenta como el checkpoint de 240.000 actualizaciones evaluado en el benchmark Imitator Game, condicionado a una demostración humana de vídeo.

La relevancia del modelo radica en su enfoque video-condicionado: la política toma como entrada una demostración humana en vídeo junto con el estado del robot para generar acciones de control, lo que permite transferir intención de tareas sin necesidad de teleoperación. El checkpoint incluye el diccionario de estado completo de la política, la configuración de inferencia y la normalización, con un tamaño de repositorio de 16,5 GB.

Se trata de una versión de evaluación (v0.1-evaluation, noviembre de 2026) que reporta una tasa de éxito del 84,6 % en el split Seen de 50 tareas, con 1.692 episodios exitosos de 2.000. El código de entrenamiento no está incluido en esta release; solo se distribuyen arquitectura, inferencia y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación video-condicionada; detalles en el paper arXiv:2611.32256) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de evaluación de 500 pasos de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dictionary (`pytorch_model.pt`, ~16,5 GB) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una política de imitación condicionada por vídeo (tag `video-conditioned`) orientada a manipulación de horizonte largo. El modelo reconcilia la intención de la demostración con el progreso de ejecución, según el título del paper asociado (arXiv:2611.32256). El checkpoint corresponde a 240.000 actualizaciones de entrenamiento y se distribuye con su configuración de inferencia y normalización completas.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas de atención o decodificación. El autor indica que el código de entrenamiento se publicará en una release posterior; en esta versión solo están disponibles la arquitectura y la evaluación. La evaluación se realiza sobre el benchmark Imitator Game, con cuatro niveles de escena por tarea, diez ensayos por nivel y un horizonte de 500 pasos de control.

## Capacidades

- Generación de acciones de control robótico a partir de una demostración humana en vídeo y del estado del robot.
- Manipulación de horizonte largo: evaluación sobre tareas que requieren hasta 500 pasos de control.
- Condicionamiento por vídeo: la política interpreta la intención de la demostración humana para guiar la ejecución.
- Generalización a cuatro niveles de escena por tarea en el benchmark Imitator Game.
- Inferencia sobre 50 tareas distintas del split Seen.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso en texto ni procesamiento de audio.
- Capacidades multilingües: no aplica; el modelo opera sobre vídeo y estado, con idioma declarado `en`.

## Casos de uso

- Manipulación robótica de horizonte largo en laboratorio: el modelo ejecuta tareas como doblar toallas (tarea de referencia `L0_TwoRobotFoldTowel-v1`) durante hasta 500 pasos de control, adecuado para experimentos de imitación con demostraciones humanas.
- Transferencia de intención desde vídeo: un operador graba una demostración humana de la tarea y la política la usa como condición para generar acciones, lo que reduce la necesidad de teleoperación especializada.
- Evaluación comparativa de políticas de imitación: el checkpoint sirve como referencia reproducible en el benchmark Imitator Game con 2.000 episodios y métricas por tarea y nivel de escena.
- Investigación en reconciliación intención-ejecución: útil para estudiar cómo una política alinea el objetivo de la demostración con el progreso real del robot en entornos con variaciones de escena.
- Despliegue en simulación con Docker: el entorno compartido RoboDemo-Docker permite ejecutar evaluaciones paralelas con dependencias fijadas, adecuado para pipelines de validación automatizada.
- Reproducción de resultados académicos: los CSV y JSONL de episodios permiten auditar el rendimiento por tarea y comparar con futuras releases del mismo proyecto.

## Benchmarks y rendimiento

| Split | Episodios exitosos | Episodios | SR (%) |
|---|---:|---:|---:|
| Seen (50 tareas) | 1692 | 2000 | 84.6 |

Cada tarea se evalúa en cuatro niveles de escena, con diez ensayos por nivel y un horizonte de 500 pasos de control. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa ~16,5 GB, por lo que se requiere al menos una GPU con memoria suficiente para cargar el state dictionary completo y el codificador temporal.
- GPU recomendadas: NVIDIA GPU con CUDA 12.4; el entorno registrado usa PyTorch 2.6.0 y `flash-attn` 2.7.4.post1.
- Cabe en GPU de consumo: no confirmado; el tamaño del checkpoint (16,5 GB) sugiere GPUs de 24 GB o superiores, pero no se especifica.
- Opciones de despliegue: scripts de evaluación del repositorio (`scripts/evaluate/full50-single.sh`, `evaluation/evaluate.py`), imagen Docker Linux amd64 (RoboDemo-Docker) y entorno Python 3.10 con dependencias fijadas.
- Latencia y throughput: no disponibles; la evaluación completa cubre 2.000 episodios con soporte para evaluación paralela por GPU (`--workers-per-gpu`).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la misma categoría (políticas de imitación video-condicionadas para manipulación) con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Versión de evaluación (v0.1-evaluation): no es una release estable de producción; el código de entrenamiento no está incluido.
- Solo se reportan resultados en el split Seen (50 tareas); no hay datos de generalización a tareas no vistas en la información disponible.
- El modelo está condicionado a demostraciones humanas en vídeo; su rendimiento fuera de la distribución de demostraciones del benchmark no está caracterizado.
- Idioma declarado `en`; no se documentan capacidades multilingües.
- Riesgo de alucinación no aplica en el sentido de texto, pero la política puede ejecutar acciones incorrectas en escenas fuera de los cuatro niveles evaluados.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de evaluación conviene validar el rendimiento en el dominio propio antes de desplegarlo.
- Requiere simulación compatible con Imitator Game y assets específicos; la reproducibilidad depende de las versiones fijadas del entorno.

## Enlaces

- Hugging Face: https://huggingface.co/mxk1998/RoboDemo-full50
- Paper: https://arxiv.org/abs/2611.32256
- Código: https://github.com/robodemo-2027/RoboDemo
- Página del proyecto: https://robodemo-2027.github.io/
- Release notes: https://github.com/robodemo-2027/RoboDemo/releases/tag/v0.1-evaluation
- Archivos versionados: https://huggingface.co/mxk1998/RoboDemo-full50/tree/v0.1-evaluation
- Colección de checkpoints: https://huggingface.co/collections/mxk1998/robodemo-6afc7693656d0965ce5466bc
- Resultados numéricos completos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/full50/README.md
- CSV por tarea: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/full50/task_level.csv
- CSV de episodios: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/full50/episodes.csv
- JSONL de episodios: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/full50/episodes.jsonl
- Ejemplos mínimos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/examples/README.md
- Guía de reproducción: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/reproduce.md
- Guía de entorno: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/environments/README.md
- Preparación de assets: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/data-preparation.md
- Tests de integración: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/smoke-evaluation.md
- Guía de uso completa: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/quickstart.md
- Entorno Docker: https://github.com/robodemo-2027/RoboDemo/tree/v0.1-evaluation/environments
- Imagen Docker: https://huggingface.co/mxk1998/RoboDemo-Dock
- Benchmark Imitator Game: https://imitator-game.github.io/
