# mxk1998/RoboDemo-c45

## Resumen

RoboDemo-c45 es un checkpoint de política robótica desarrollado por el usuario mxk1998, publicado bajo el identificador `mxk1998/RoboDemo-c45`. Se trata de un modelo de imitación condicionado por vídeo, orientado a manipulación robótica de horizonte largo, que aprende a ejecutar tareas a partir de demostraciones humanas grabadas. El modelo se enmarca en el trabajo "Reconciling Demonstration Intent and Execution Progress for Long-Horizon Manipulation" (arXiv:2611.32256) y corresponde al checkpoint de 260.000 actualizaciones evaluado sobre el benchmark Imitator Game.

El modelo resuelve el problema de reconciliar la intención contenida en una demostración humana con el progreso real de ejecución del robot a lo largo de tareas prolongadas, un reto clásico en aprendizaje por imitación donde la política debe seguir el objetivo de la demo sin quedar anclada a la trayectoria exacta. La release v0.1-evaluation (20 de noviembre de 2026) incluye el diccionario de estado completo de la política, la configuración de inferencia y la normalización, aunque el código de entrenamiento queda pendiente para una release futura.

El repositorio ocupa 16,5 GB y los pesos se distribuyen en formato PyTorch (`pytorch_model.pt`). La licencia es Apache 2.0 y el único idioma declarado es inglés. No se publican en la información disponible datos sobre arquitectura interna, número de parámetros ni longitud de contexto en el sentido de modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación condicionada por vídeo; detalles no publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de 500 pasos de control por episodio en evaluación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`pytorch_model.pt`, state dictionary completo) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se describe como una política de imitación condicionada por vídeo ("video-conditioned") para manipulación de horizonte largo, entrenada mediante aprendizaje por imitación a partir de demostraciones humanas. El checkpoint corresponde a 260.000 actualizaciones de entrenamiento y se evaluó sobre el benchmark Imitator Game, condicionado a una demostración humana.

El release incluye el diccionario de estado completo de la política, la configuración de inferencia y la normalización. El checkpoint del codificador temporal se descarga por separado y el código fuente temporal necesario viene incluido en el repositorio. El código de entrenamiento no está incluido en esta release y se anuncia para la siguiente versión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas a partir de demostraciones humanas en vídeo (inferencia vídeo-a-acción).
- Manipulación de horizonte largo con horizonte de 500 pasos de control por episodio.
- Reconciliación entre la intención de la demostración y el progreso de ejecución.
- Generalización limitada a escenas no vistas (11,5 % de éxito en el split Unseen).
- Recuperación de referencias a partir de medios crudos (raw-media reference retrieval), con soporte de CPU.
- Inspección de arrays de vídeo, estado y acción sin GPU (`predict_actions.py --inspect-only`).
- Evaluación paralela en contenedor Docker con dependencias fijadas.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento tipo thinking.

## Casos de uso

- Investigación en aprendizaje por imitación: permite reproducir los experimentos del paper evaluando el checkpoint sobre Imitator Game con 400 episodios (200 Seen y 200 Unseen), sirviendo como línea base para comparar nuevas políticas de manipulación.
- Manipulación robótica de horizonte largo: el modelo ejecuta tareas como doblar toallas (`L0_TwoRobotFoldTowel-v1`) a lo largo de 500 pasos de control, adecuado para tareas que requieren coherencia temporal prolongada.
- Condicionamiento por demostración humana: en escenarios donde el operario graba una demo y el robot debe reproducir la intención, el modelo traduce el vídeo en una secuencia de acciones ejecutables.
- Validación de pipelines de evaluación: los scripts de smoke test y evaluación completa permiten verificar entornos CUDA/PyTorch antes de lanzar experimentos costosos, con comprobaciones de assets y drivers.
- Desarrollo de sistemas de referencia para robótica: la recuperación de referencias desde medios crudos en CPU facilita la construcción de índices de demostraciones sin depender de GPU.
- Integración en simuladores: los assets de simulación de Imitator Game y el soporte Vulkan/OptiX permiten desplegar el modelo en entornos simulados para pruebas de generalización antes de transferir a hardware real.
- Reproducibilidad de resultados: la release versionada con CSVs por tarea y episodio, JSONL y vídeos de rollout facilita auditorías y comparaciones entre checkpoints de la colección.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el benchmark Imitator Game (cada tarea evaluada en cuatro niveles de escena, diez ensayos por nivel, horizonte de 500 pasos de control):

| Split | Episodios exitosos | Episodios | SR (%) |
|---|---:|---:|---:|
| Seen | 177 | 200 | 88,5 |
| Unseen | 23 | 200 | 11,5 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), dado que se trata de un modelo de robótica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint pesa aproximadamente 16,5 GB, por lo que se requiere al menos esa cantidad de memoria más el codificador temporal y los assets de simulación.
- GPU: se exige una GPU NVIDIA; el entorno registrado usa PyTorch 2.6.0 / CUDA 12.4 y `flash-attn==2.7.4.post1`.
- Cabe en GPU de consumo: no confirmado; el tamaño del checkpoint (16,5 GB) supera la VRAM de muchas GPUs de consumo, aunque podría caber en modelos de 24 GB o más junto con el codificador, sin datos oficiales.
- Despliegue: entorno Python 3.10 en Linux con venv, Docker (imagen Linux amd64 disponible en RoboDemo-Docker), simulador con Vulkan y OptiX.
- Latencia y throughput: no disponibles; la evaluación se ejecuta con `--workers-per-gpu 1` y episodios de 500 pasos de control.
- Evaluación sin GPU: posible en modo inspección (`--inspect-only`) y en recuperación de referencias desde medios crudos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de imitación condicionadas por vídeo para manipulación de horizonte largo) ni sus especificaciones.

## Limitaciones y advertencias

- Brecha de generalización muy acusada: 88,5 % de éxito en escenas vistas frente a 11,5 % en no vistas, lo que limita su uso fuera de distribuciones de entrenamiento.
- Estado de release: v0.1-evaluation; el código de entrenamiento no está incluido y se anuncia para una versión posterior, lo que dificulta la reproducción completa del entrenamiento.
- Dependencia de assets externos: requiere descargar el codificador temporal por separado, así como assets de simulación y medios de referencia de Imitator Game.
- Entorno frágil: exige versiones fijadas de PyTorch, CUDA, Transformers y flash-attn, además de configuración de Vulkan y OptiX.
- Idioma: solo se declara inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la ejecución de acciones incorrectas o fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los assets de simulación y medios de terceros (Imitator Game) antes de producción.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mxk1998/RoboDemo-c45
- Paper (arXiv:2611.32256): https://arxiv.org/abs/2611.32256
- Release notes v0.1-evaluation: https://github.com/robodemo-2027/RoboDemo/releases/tag/v0.1-evaluation
- Archivos versionados: https://huggingface.co/mxk1998/RoboDemo-c45/tree/v0.1-evaluation
- Código: https://github.com/robodemo-2027/RoboDemo
- Página del proyecto: https://robodemo-2027.github.io/
- Colección de checkpoints: https://huggingface.co/collections/mxk1998/robodemo-6afc7693656d0965ce5466bc
- Resultados numéricos completos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c45/README.md
- CSV por tarea: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c45/task_level.csv
- CSV por episodio: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c45/episodes.csv
- JSONL por episodio: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c45/episodes.jsonl
- Ejemplos mínimos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/examples/README.md
- Guía de reproducción: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/reproduce.md
- Guía de entorno: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/environments/README.md
- Preparación de datos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/data-preparation.md
- Tests de integración: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/smoke-evaluation.md
- Guía de uso completa: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/quickstart.md
- Entornos Docker: https://github.com/robodemo-2027/RoboDemo/tree/v0.1-evaluation/environments
- Imitator Game: https://imitator-game.github.io/
