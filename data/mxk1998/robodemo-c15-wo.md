# mxk1998/RoboDemo-c15-wo

## Resumen

RoboDemo-c15-wo es una política de manipulación robótica desarrollada por el autor mxk1998, publicada bajo el identificador mxk1998/RoboDemo-c15-wo. Se trata de un modelo de aprendizaje por imitación (imitation learning) condicionado por vídeo, diseñado para resolver tareas de manipulación de horizonte largo en las que el agente debe reconciliar la intención demostrada en una referencia visual con el progreso real de ejecución. El modelo se enmarca en el proyecto RoboDemo, cuyo artículo asociado es arXiv:2611.32256, titulado "Reconciling Demonstration Intent and Execution Progress for Long-Horizon Manipulation".

El checkpoint publicado corresponde a la versión v0.1-evaluation, con fecha de 20 de noviembre de 2026, y representa el estado tras 100.000 actualizaciones de entrenamiento. Se distribuye como un state dictionary completo de PyTorch de aproximadamente 16,5 GB, junto con configuración de inferencia y normalización. La evaluación se realiza sobre el benchmark Imitator Game, condicionando la política a un vídeo de robot recuperado como referencia.

La relevancia del modelo radica en su enfoque de condicionamiento por vídeo para tareas de manipulación de largo horizonte, un área donde los enfoques clásicos de imitación suelen fallar al desalinearse la intención de la demostración con el estado real del entorno. No obstante, los resultados publicados muestran una brecha crítica entre el split Seen (90,0 % de éxito) y el split Unseen (0,0 %), lo que lo convierte en un artefacto de evaluación más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por imitación condicionada por vídeo (detalles de arquitectura no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de evaluación de 500 pasos de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dictionary (pytorch_model.pt, ~16,5 GB) |

## Arquitectura y entrenamiento

La información disponible indica que RoboDemo-c15-wo es una política de manipulación robótica basada en aprendizaje por imitación y condicionada por vídeo. El modelo consume una referencia de vídeo de robot recuperada (retrieved robot video) junto con el estado del entorno para producir acciones de control. El checkpoint publicado corresponde a 100.000 actualizaciones de entrenamiento y se distribuye con el state dictionary completo, la configuración de inferencia y los parámetros de normalización.

El artículo asociado (arXiv:2611.32256) se titula "Reconciling Demonstration Intent and Execution Progress for Long-Horizon Manipulation", lo que sugiere que la innovación técnica central es un mecanismo para alinear la intención de la demostración (codificada en el vídeo de referencia) con el progreso real de ejecución de la política. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El código de entrenamiento no está incluido en esta release; el autor indica que se publicará en la próxima versión. La evaluación se realiza sobre el benchmark Imitator Game, con referencias de robot emparejadas por tarea provenientes del banco de entrenamiento del benchmark.

## Capacidades

- Generación de acciones de control robótico para tareas de manipulación de horizonte largo, condicionadas por un vídeo de referencia de robot.
- Aprendizaje por imitación a partir de demostraciones visuales (video-conditioned imitation learning).
- Reconciliación de la intención de la demostración con el progreso de ejecución en tareas de manipulación extendidas.
- Ejecución de episodios de hasta 500 pasos de control.
- Evaluación en cuatro niveles de escena por tarea, con diez ensayos por nivel.
- Soporte de inferencia sobre referencias de vídeo recuperadas del banco de entrenamiento del benchmark.
- Inspección de arrays de vídeo, estado y acción sin GPU mediante el script `predict_actions.py --inspect-only`.
- No se indica soporte de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de investigación en manipulación de horizonte largo: el modelo sirve como checkpoint de referencia para reproducir los resultados del benchmark Imitator Game en el split Seen, donde alcanza un 90,0 % de éxito en 200 episodios, permitiendo comparar futuras políticas contra una línea base publicada.
- Estudio de la brecha Seen/Unseen: dado que el modelo obtiene 0,0 % en el split Unseen, es adecuado para analizar fallos de generalización en políticas condicionadas por vídeo y para diseñar experimentos que aíslen la causa de la falta de transferencia.
- Reproducción de episodios concretos: el script `evaluate/c15-wo-single.sh` permite ejecutar un episodio de 500 pasos sobre la tarea L0_TwoRobotFoldTowel-v1, útil para depurar pipelines de simulación y validar la integración del entorno antes de lanzar evaluaciones completas.
- Inspección de datos sin GPU: mediante `python examples/predict_actions.py --inspect-only` se pueden examinar los arrays de vídeo, estado y acción incluidos, lo que facilita la comprensión de las interfaces de entrada y salida del modelo en máquinas sin acelerador.
- Integración en pipelines de evaluación paralela: la release incluye un entorno Docker compartido y soporte de evaluación paralela con `--workers-per-gpu`, lo que permite distribuir los 400 episodios de la evaluación completa entre varias GPU.
- Docencia y formación en robótica basada en aprendizaje: el par de ejemplos mínimos incluidos cubre la inferencia de vídeo humano a acción (pesos Full50) y la recuperación de referencias desde medios crudos, lo que lo hace útil como material didáctico sobre políticas condicionadas por vídeo.
- Validación de infraestructura de simulación: el script `environments/check_environment.py --assets` verifica la instalación de Vulkan, OptiX y la revisión del simulador, lo que resulta práctico para poner a punto estaciones de trabajo antes de entrenar o evaluar políticas propias.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el benchmark Imitator Game, con horizonte de 500 pasos de control, cuatro niveles de escena por tarea y diez ensayos por nivel:

| Split | Episodios exitosos | Episodios | Tasa de éxito (%) |
|---|---:|---:|---:|
| Seen | 180 | 200 | 90,0 |
| Unseen | 0 | 200 | 0,0 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje o código (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa aproximadamente 16,5 GB en el state dictionary completo, por lo que se requiere al menos una GPU con memoria suficiente para cargar los pesos y el codificador temporal, que se descarga por separado.
- GPU recomendadas: no se especifican modelos concretos; el entorno registrado utiliza una GPU NVIDIA con PyTorch 2.6.0 y CUDA 12.4.
- Cabe en GPU de consumo: no disponible; no se indica qué GPU consumer son suficientes.
- Opciones de despliegue: el proyecto proporciona scripts propios de evaluación (`scripts/evaluate/c15-wo-single.sh` y `evaluation/evaluate.py`), un entorno Docker compartido y evaluación paralela con `--workers-per-gpu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.
- Requisitos de software: Linux, Python 3.10, PyTorch 2.6.0, torchvision 0.21.0, CUDA 12.4, Transformers 4.57.6 y flash-attn 2.7.4.post1. El simulador requiere configuración de Vulkan y OptiX.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (políticas de manipulación condicionadas por vídeo) que permitan una comparación de parámetros, contexto, rendimiento o licencia. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboDemo-c15-wo | no disponible | no disponible | 90,0 % Seen / 0,0 % Unseen (Imitator Game) | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Brecha de generalización severa: el modelo obtiene un 0,0 % de éxito en el split Unseen frente al 90,0 % en Seen, lo que indica que no generaliza a tareas o escenas no vistas durante el entrenamiento.
- Estado de la release: se trata de un checkpoint de evaluación (v0.1-evaluation) y no de un modelo listo para producción; el código de entrenamiento no está incluido y se anuncia para una release futura.
- Dependencia de referencias de vídeo: el modelo requiere un vídeo de robot recuperado y emparejado por tarea desde el banco de entrenamiento del benchmark, lo que limita su uso fuera de ese ecosistema.
- Dependencia del simulador: la evaluación está ligada al benchmark Imitator Game y a su simulador, con requisitos específicos de Vulkan y OptiX, lo que complica la reproducción fuera del entorno documentado.
- Idiomas: solo se declara inglés (en); no hay evidencia de soporte multilingüe.
- Sesgos conocidos: no se documentan en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo análogo es la ejecución de acciones incorrectas o desalineadas con la intención de la demostración, especialmente fuera de distribución.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero la ausencia de garantías de rendimiento fuera del split Seen desaconseja su uso en entornos reales sin validación adicional.
- Sin métricas de latencia ni throughput publicadas, lo que impide estimar costes de despliegue en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mxk1998/RoboDemo-c15-wo
- Artículo (arXiv): https://arxiv.org/abs/2611.32256
- Código: https://github.com/robodemo-2027/RoboDemo
- Página del proyecto: https://robodemo-2027.github.io/
- Notas de la release: https://github.com/robodemo-2027/RoboDemo/releases/tag/v0.1-evaluation
- Archivos versionados: https://huggingface.co/mxk1998/RoboDemo-c15-wo/tree/v0.1-evaluation
- Resultados numéricos completos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15-wo/README.md
- CSV por tarea: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15-wo/task_level.csv
- CSV de episodios: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15-wo/episodes.csv
- JSONL de episodios: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15-wo/episodes.jsonl
- Ejemplos mínimos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/examples/README.md
- Guía de reproducción: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/reproduce.md
- Guía de entorno: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/environments/README.md
- Preparación de datos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/data-preparation.md
- Tests de integración registrados: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/smoke-evaluation.md
- Guía de uso completa: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/quickstart.md
- Entorno Docker: https://github.com/robodemo-2027/RoboDemo/tree/v0.1-evaluation
- Benchmark Imitator Game: https://imitator-game.github.io/
- Colección de checkpoints: https://huggingface.co/collections/mxk1998/robodemo-6afc7693656d0965ce5466bc
