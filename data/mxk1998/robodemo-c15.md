# mxk1998/RoboDemo-c15

## Resumen

RoboDemo-c15 es un checkpoint de política robótica (policy) desarrollado por el usuario mxk1998, publicado bajo el identificador `mxk1998/RoboDemo-c15` en Hugging Face. Se enmarca en el proyecto RoboDemo, asociado al artículo arXiv 2611.32256 titulado "Reconciling Demonstration Intent and Execution Progress for Long-Horizon Manipulation". No se trata de un modelo de lenguaje generativo al uso, sino de un modelo de imitación condicionado por vídeo orientado a manipulación robótica de horizonte largo: aprende a ejecutar tareas a partir de demostraciones humanas grabadas en vídeo.

El checkpoint corresponde a la actualización 90.000 (90,000-update) y está evaluado sobre el benchmark "Imitator Game", condicionado a una demostración humana. La release v0.1-evaluation (20 de noviembre de 2026) incluye el diccionario de estado completo de la política, la configuración de inferencia y la normalización. El repositorio ocupa aproximadamente 16,5 GB y el fichero de pesos es de ese mismo orden.

Su relevancia radica en el enfoque "video-conditioned" para el control robótico: en lugar de depender exclusivamente de estados y acciones, el modelo reconcilia la intención de la demostración con el progreso real de la ejecución. Es un artefacto de investigación (0 descargas, 0 likes en el momento de la ficha) y su evaluación muestra una brecha crítica entre entornos vistos y no vistos (89,5 % frente a 0,0 % de éxito), lo que lo convierte en material de estudio más que en una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación condicionada por vídeo; detalles en arXiv 2611.32256) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de evaluación de 500 pasos de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.pt`, state dict completo) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de describirla como una política de imitación condicionada por vídeo ("video-conditioned imitation learning") para manipulación de horizonte largo. El modelo integra un codificador temporal ("temporal encoder") cuyo checkpoint se descarga por separado, y el repositorio incluye el diccionario de estado completo de la política, la configuración de inferencia y la normalización. El entrenamiento se realizó hasta las 90.000 actualizaciones, aunque el código de entrenamiento no se publica en esta release (está previsto para la siguiente).

El planteamiento técnico central, según el título del paper, es reconciliar la intención de la demostración con el progreso de ejecución: el modelo usa vídeo de demostración humana como condicionamiento y debe alinear lo que la demostración pretende con el estado real de la ejecución en el entorno. No se dispone de datos sobre número de tokens, composición del dataset de entrenamiento ni sobre si se empleó RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no directamente aplicables a este tipo de política).

## Capacidades

- Control robótico de manipulación de horizonte largo condicionado por demostraciones humanas en vídeo.
- Inferencia de acciones a partir de vídeo humano, estado y arrays de acción (ejemplo `predict_actions.py`).
- Recuperación de referencias a partir de medios crudos ("raw-media reference retrieval"), con soporte de CPU.
- Ejecución de episodios completos en simulador con horizonte de 500 pasos de control.
- Evaluación sobre el benchmark Imitator Game en cuatro niveles de escena y diez ensayos por nivel.
- Interfaz de evaluación reproducible con Docker y ejecución paralela por GPU (`--workers-per-gpu`).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling ni agentes conversacionales.

## Casos de uso

- Investigación en imitación desde vídeo: reproducir los experimentos del paper con el checkpoint c15 para estudiar cómo el condicionamiento por vídeo afecta a la ejecución de tareas de manipulación de horizonte largo.
- Evaluación comparativa de checkpoints: el proyecto publica cinco checkpoints (colección `robodemo-6afc7693656d0965ce5466bc`), lo que permite comparar c15 con los demás bajo el mismo protocolo de 400 episodios (200 Seen, 200 Unseen).
- Análisis de generalización: el contraste entre 89,5 % en Seen y 0,0 % en Unseen lo convierte en un caso de estudio útil para investigar sobreajuste a escenas y fallos de generalización en políticas robóticas.
- Tareas de plegado de toallas en simulación: el ejemplo smoke usa `L0_TwoRobotFoldTowel-v1`, útil para validar pipelines de evaluación de manipulación bimanual.
- Integración en pipelines de evaluación CI: los tests de integración registrados cubren los cinco checkpoints y permiten automatizar comprobaciones de regresión del entorno de inferencia.
- Reproducción de resultados: los ficheros CSV y JSONL por tarea y por episodio permiten auditar métricas y comparar contra las cifras publicadas.
- Prototipado de control condicionado por demostración: sirve como referencia para construir sistemas que traduzcan vídeo humano en secuencias de acción en entornos simulados.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (benchmark Imitator Game, condicionado a demostración humana, 500 pasos de control por episodio, cuatro niveles de escena y diez ensayos por nivel):

| Split | Episodios exitosos | Episodios | SR (%) |
|---|---:|---:|---:|
| Seen | 179 | 200 | 89,5 |
| Unseen | 0 | 200 | 0,0 |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo), ni comparativas numéricas con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos es de aproximadamente 16,5 GB, por lo que en precisión completa (FP32) requeriría del orden de 16,5 GB solo para los pesos, más el codificador temporal y los assets del simulador.
- GPU: se requiere una GPU NVIDIA; el entorno registrado usa PyTorch 2.6.0 / CUDA 12.4. No se especifican modelos concretos (A100, H100, RTX 4090).
- GPU de consumo: no confirmado; por tamaño de pesos, cabría en GPUs con 24 GB o más en FP16/BF16, pero el dato no está publicado.
- Despliegue: evaluación vía repositorio RoboDemo (scripts `evaluate.py`, `c15-single.sh`), entorno Docker Linux amd64 (`RoboDemo-Docker`) y ejecución paralela con `--workers-per-gpu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.
- Sistema: Linux, Python 3.10, `flash-attn==2.7.4.post1`, simulador con Vulkan y OptiX.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otras políticas robóticas comparables (parámetros, contexto, rendimiento o licencia). El propio proyecto publica otros cuatro checkpoints de la misma familia en la colección de Hugging Face, pero sus especificaciones no se detallan en la información disponible.

## Limitaciones y advertencias

- Generalización nula en el split Unseen (0/200 episodios exitosos): el modelo no transfiere a escenas no vistas, lo que lo inhabilita para uso en entornos reales fuera de la distribución de entrenamiento.
- Artefacto de investigación con 0 descargas y 0 likes; sin validación externa independiente.
- El código de entrenamiento no está incluido en esta release (previsto para la siguiente), lo que limita la reproducibilidad completa del pipeline de entrenamiento.
- Requiere assets externos: codificador temporal descargado por separado, simulador, assets de simulación y vídeos de referencia del benchmark Imitator Game.
- Riesgo de sobreajuste a las condiciones de evaluación (cuatro niveles de escena, diez ensayos por nivel); las cifras de Seen deben interpretarse con cautela.
- Idioma y documentación únicamente en inglés.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un modelo de investigación sin garantías de robustez, su uso en producción conlleva riesgo operativo.
- No se documentan sesgos, pero al tratarse de una política entrenada con demostraciones humanas, hereda las limitaciones y sesgos de esas demostraciones.
- La fecha de creación del repositorio (2026-11-17) y la referencia arXiv 2611.32256 deben verificarse antes de citar el trabajo.

## Enlaces

- Hugging Face: https://huggingface.co/mxk1998/RoboDemo-c15
- Paper (arXiv 2611.32256): https://arxiv.org/abs/2611.32256
- Código: https://github.com/robodemo-2027/RoboDemo
- Release v0.1-evaluation: https://github.com/robodemo-2027/RoboDemo/releases/tag/v0.1-evaluation
- Ficheros versionados: https://huggingface.co/mxk1998/RoboDemo-c15/tree/v0.1-evaluation
- Página del proyecto: https://robodemo-2027.github.io/
- Colección de checkpoints: https://huggingface.co/collections/mxk1998/robodemo-6afc7693656d0965ce5466bc
- Resultados numéricos completos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15/README.md
- CSV por tarea: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15/task_level.csv
- CSV por episodio: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15/episodes.csv
- JSONL por episodio: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/results/c15/episodes.jsonl
- Ejemplos mínimos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/examples/README.md
- Guía de reproducción: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/reproduce.md
- Guía de entorno: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/environments/README.md
- Preparación de datos: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/data-preparation.md
- Tests de integración: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/smoke-evaluation.md
- Guía de uso completa: https://github.com/robodemo-2027/RoboDemo/blob/v0.1-evaluation/docs/quickstart.md
- Entorno Docker: https://github.com/robodemo-2027/RoboDemo/tree/v0.1-evaluation/environments
- Imagen Docker (RoboDemo-Docker): https://huggi (enlace truncado en la información disponible)
- Benchmark Imitator Game: https://imitator-game.github.io/
