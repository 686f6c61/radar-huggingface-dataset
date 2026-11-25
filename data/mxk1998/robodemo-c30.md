# mxk1998/RoboDemo-c30

## Resumen

RoboDemo-c30 es un modelo de política robótica (policy) entrenado mediante aprendizaje por imitación y condicionado por vídeo de demostración humana, desarrollado por el usuario mxk1998 y publicado bajo el paraguas del proyecto RoboDemo (arXiv:2611.32256). El modelo aborda el problema de reconciliar la intención de una demostración con el progreso real de ejecución en tareas de manipulación de horizonte largo, es decir, traducir una secuencia de vídeo humano en acciones de control robustas a lo largo de cientos de pasos. Se distribuye como checkpoint de 160.000 actualizaciones evaluado en el banco Imitator Game.

El artefacto publicado es un fichero de pesos completo de aproximadamente 16,5 GB en formato PyTorch (`pytorch_model.pt`), acompañado del código de evaluación, configuración de inferencia y normalización. No se publica el código de entrenamiento en esta versión (v0.1-evaluation), aunque el autor lo anuncia para la siguiente release. La licencia es Apache 2.0 y el idioma declarado es inglés.

Su relevancia actual radica en que ejemplifica el paradigma de políticas video-condicionadas para manipulación robótica, con resultados muy dispares entre entornos vistos (94,0 % de éxito) y no vistos (0,5 %), lo que lo convierte en un caso de estudio útil sobre generalización y sobreajuste en imitación a partir de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica video-condicionada (detalles de arquitectura no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de evaluación de 500 pasos de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.pt`), state dictionary completo; codificador temporal descargado por separado |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una política de imitación condicionada por vídeo de demostración humana, orientada a manipulación de horizonte largo. El checkpoint corresponde a 160.000 actualizaciones de entrenamiento y se evalúa en el banco Imitator Game, con tareas como `L0_TwoRobotFoldTowel-v1` (plegado de toalla con dos robots). El pipeline incluye un codificador temporal descargado aparte y ficheros de normalización y configuración de inferencia; el estado de la política se distribuye como state dictionary completo de PyTorch.

No se especifican en la información proporcionada el número de tokens o frames de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. El entrenamiento se basa en aprendizaje por imitación (tag `imitation-learning`), y el código de entrenamiento no está incluido en esta release. La evaluación se realiza sobre cuatro niveles de escena por tarea, diez ensayos por nivel y un horizonte de 500 pasos de control.

## Capacidades

- Generación de acciones de control robótico a partir de vídeo de demostración humana (inferencia vídeo-a-acción).
- Manipulación de horizonte largo: episodios de hasta 500 pasos de control.
- Ejecución de tareas de manipulación bimanual (p. ej. plegado de toalla con dos robots).
- Condicionamiento por demostración: la política reconcilia la intención de la demo con el progreso de ejecución.
- Recuperación de referencias de medios crudos (raw-media reference retrieval), con soporte de CPU según los ejemplos del repositorio.
- Inspección sin GPU de los arrays de vídeo, estado y acción incluidos (`predict_actions.py --inspect-only`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Plegado de toallas bimanual en simulación: el modelo se usa como política en el banco Imitator Game para ejecutar la tarea `L0_TwoRobotFoldTowel-v1` durante 500 pasos de control, aprovechando el condicionamiento por vídeo para alinear la secuencia de acciones con la demostración.
- Investigación en aprendizaje por imitación desde vídeo humano: sirve como checkpoint de referencia (160.000 actualizaciones) para estudiar la brecha entre entornos vistos y no vistos en políticas video-condicionadas.
- Reproducción de experimentos de manipulación de horizonte largo: el repositorio incluye scripts de evaluación completa (400 episodios: 200 Seen, 200 Unseen) con salidas `summary.json`, `trajectory.npz` y `rollout.mp4`, útiles para replicar resultados.
- Evaluación comparativa de checkpoints: al formar parte de una colección de cinco modelos RoboDemo, permite comparar políticas bajo el mismo protocolo de cuatro niveles de escena y diez ensayos por nivel.
- Desarrollo de pipelines de inferencia vídeo-a-acción: los dos ejemplos mínimos del repositorio (Full50 weights y recuperación de referencias en CPU) sirven para integrar el modelo en prototipos de control robótico.
- Docencia y formación en robótica basada en aprendizaje: la posibilidad de inspeccionar arrays sin GPU y de lanzar un episodio de humo con un solo comando facilita entornos de laboratorio con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados por el autor en el banco Imitator Game (cuatro niveles de escena por tarea, diez ensayos por nivel, horizonte de 500 pasos de control):

| Split | Episodios exitosos | Episodios | Tasa de éxito (%) |
|---|---:|---:|---:|
| Seen | 188 | 200 | 94,0 |
| Unseen | 1 | 200 | 0,5 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero de pesos es de aproximadamente 16,5 GB, por lo que la inferencia en precisión completa requiere al menos esa cantidad más overhead del codificador temporal y del simulador.
- GPU recomendadas: no se especifican modelos concretos; el entorno registrado usa una GPU NVIDIA con PyTorch 2.6.0 / CUDA 12.4 y FlashAttention 2.7.4.post1.
- GPU de consumo: no confirmado; por tamaño del checkpoint, cabría en GPUs con 24 GB o más solo si la carga real lo permite, dato no verificado en la información disponible.
- Opciones de despliegue: scripts de evaluación del repositorio RoboDemo (rama `v0.1-evaluation`), imagen Docker Linux amd64 publicada como RoboDemo-Docker, y ejecución en CPU limitada a inspección de arrays y recuperación de referencias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboDemo-c30 | no disponible | horizonte de 500 pasos de control | 94,0 % Seen / 0,5 % Unseen (Imitator Game) | Apache 2.0 | Pesos en Hugging Face, código de evaluación en GitHub |
| Otros checkpoints RoboDemo (Full50 y resto de la colección) | no disponible | no disponible | resultados por checkpoint en el repositorio | Apache 2.0 (presumible, no confirmado para todos) | Colección `mxk1998/robodemo` en Hugging Face |
| Políticas de imitación video-condicionadas alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para comparar con modelos de terceros de la misma categoría.

## Limitaciones y advertencias

- Brecha severa de generalización: 94,0 % de éxito en Seen frente a 0,5 % en Unseen, lo que indica un sobreajuste fuerte a los entornos de entrenamiento y desaconseja su uso directo en entornos no vistos.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- El código de entrenamiento no está incluido en esta release (v0.1-evaluation), lo que limita la reproducibilidad completa del entrenamiento.
- El checkpoint es una instantánea de evaluación (160.000 actualizaciones) y no necesariamente la versión final o más capable del proyecto.
- La evaluación se realiza en simulación (Imitator Game); no se documenta validación en robots físicos ni transferencia sim-a-real.
- Riesgo de alucinación no aplicable en el sentido de lenguaje, pero sí de ejecución de acciones incorrectas o incoherentes con la demostración en escenarios fuera de distribución.
- No se documentan sesgos conocidos ni restricciones adicionales de la licencia Apache 2.0 para uso comercial más allá de las condiciones estándar de dicha licencia.
- El tamaño del repositorio (16,5 GB) y la dependencia de FlashAttention y de un simulador con Vulkan/OptiX complican el despliegue en entornos sin GPU NVIDIA.

## Enlaces

- Hugging Face: https://huggingface.co/mxk1998/RoboDemo-c30
- Paper (arXiv): https://arxiv.org/abs/2611.32256
- Código: https://github.com/robodemo-2027/RoboDemo
- Página del proyecto: https://robodemo-2027.github.io/
- Colección de checkpoints: https://huggingface.co/collections/mxk1998/robodemo-6afc7693656d0965ce5466bc
- Release notes: https://github.com/robodemo-2027/RoboDemo/releases/tag/v0.1-evaluation
- Ficheros versionados: https://huggingface.co/mxk1998/RoboDemo-c30/tree/v0.1-evaluation
- Resultados numéricos completos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c30/README.md
- CSV por tarea: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c30/task_level.csv
- CSV de episodios: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c30/episodes.csv
- JSONL de episodios: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c30/episodes.jsonl
- Ejemplos mínimos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/examples/README.md
- Guía de reproducción: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/reproduce.md
- Guía de entorno: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/environments/README.md
- Preparación de datos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/data-preparation.md
- Guía de evaluación de humo: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/smoke-evaluation.md
- Guía de uso completa: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/quickstart.md
- Entornos Docker: https://github.com/robodemo-2027/RoboDemo/tree/v0.1-evaluation/environments
- Imagen Docker: https://huggingface.co/RoboDemo-Docker (referencia truncada en la información disponible)
- Imitator Game: https://imitator-game.github.io/
