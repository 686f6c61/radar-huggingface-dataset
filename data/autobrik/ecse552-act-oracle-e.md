# Autobrik/ecse552-act-oracle-E

## Resumen

Autobrik/ecse552-act-oracle-E es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers) entrenado por el autor Autobrik para el proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No se trata de un modelo de lenguaje: es un modelo de imitación (imitation learning) que predice acciones de control de un brazo robótico a partir de observaciones visuales, en el contexto del dataset `Autobrik/ecse552-ocbench-block`.

El modelo emplea la implementación original de ACT de Tony Zhao sin modificaciones arquitectónicas, aunque con adaptaciones de interfaz: entrada exclusivamente de imágenes (el estado del robot se pone a cero), 7 dimensiones de acción rellenadas con ceros hasta las 14 del modelo upstream, episodios de longitud variable y chunk de 20 pasos a 10 Hz (equivalente a 2 segundos, frente a los 100 pasos a 50 Hz del ACT original). Las acciones son objetivos absolutos de articulaciones (joint targets).

Es relevante en el ámbito de la investigación en manipulación robótica porque forma parte de un estudio sobre aprendizaje de tareas a partir de vídeos sin acciones (action-free videos), y publica los checkpoints de múltiples ejecuciones con distintos números de demostraciones y semillas, lo que facilita la reproducibilidad y el análisis comparativo. Es un artefacto de investigación académica, no un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación original de tonyzhaozh/act sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación basada en observaciones, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo robótico, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para imitación robótica que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. En este checkpoint concreto se usa la implementación original sin cambios de arquitectura, pero con adaptaciones en la interfaz de datos: solo imágenes como entrada (estado del robot a cero), acciones de 7 dimensiones rellenadas con ceros hasta 14, y chunk de 20 pasos a 10 Hz (2 segundos de horizonte).

El entrenamiento se realizó sobre el dataset `Autobrik/ecse552-ocbench-block` en la revisión `b50de4d816dfb6bd6487b10ab278042ce3805a91`, con episodios de longitud variable. El modelo se entrenó en varias configuraciones (colecciones), incluyendo una condición "oracle" (etiquetas de acción reales) y condiciones con pseudo-etiquetas para los escenarios (b)/(c), detalladas en `act_run.json` (`data.collections`). Cada directorio `n<demos>/seed<k>/` contiene un run completo con checkpoints de mejor y última validación, estadísticas del dataset, historial de pérdidas por época y metadatos de procedencia. No se especifica en la información disponible el número de tokens ni la composición detallada del dataset.

## Capacidades

- Predicción de acciones de control para un brazo robótico a partir de observaciones visuales (imágenes).
- Generación de chunks de acción de 20 pasos a 10 Hz (2 segundos de horizonte de planificación).
- Salida de objetivos absolutos de articulaciones (joint targets) en 7 dimensiones.
- Ejecución de políticas de imitación entrenadas con demostraciones (behavior cloning).
- Múltiples variantes entrenadas con distintos volúmenes de demostraciones y semillas, para análisis de robustez.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modalidades de texto, audio o vídeo.

## Casos de uso

- Investigación en imitation learning: servir como checkpoint de referencia para comparar el efecto del número de demostraciones y la semilla en el rendimiento de ACT sobre una tarea de manipulación concreta.
- Reproducción de experimentos académicos: cargar `selected.ckpt` con `action_free.act_original.ActPolicy` para replicar los resultados del proyecto ECSE 552 sobre el dataset `ocbench-block`.
- Estudio de aprendizaje desde vídeos sin acciones: usar las variantes con pseudo-etiquetas (condiciones (b)/(c)) para analizar la brecha de rendimiento frente a la condición oracle.
- Evaluación de políticas en simulación o laboratorio: desplegar la política sobre el entorno de bloques para medir tasas de éxito en tareas de manipulación.
- Análisis de estabilidad de entrenamiento: utilizar `history.json` y los checkpoints `policy_best`/`policy_last` para estudiar la evolución de la pérdida y la selección de modelos.
- Docencia y formación: emplear el pipeline completo (dataset, código, checkpoints) como ejemplo didáctico de entrenamiento de ACT con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño de la política ACT y del batch; no se especifica en la información).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la API `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` del repositorio de código del proyecto; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo robótico).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-oracle-E | ACT original | Imágenes | 7 dims (padding a 14) | MIT | Hugging Face |
| tonyzhaozh/act (upstream) | ACT original | Imágenes + estado | 14 dims | MIT | GitHub |
| Otros checkpoints del mismo proyecto (variantes (b)/(c)) | ACT original | Imágenes | 7 dims (padding a 14) | MIT | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación académica: no está pensado para producción ni para uso fuera del entorno y la tarea para los que fue entrenado.
- Entrenado exclusivamente sobre el dataset `Autobrik/ecse552-ocbench-block`; no generaliza a otras tareas, objetos o morfologías de robot sin reentrenamiento.
- El estado del robot se pone a cero en la entrada, por lo que la política depende únicamente de la información visual; esto puede degradar el rendimiento en oclusiones o condiciones de iluminación distintas.
- Acciones de 7 dimensiones rellenadas con ceros hasta 14: la interfaz no es directamente compatible con políticas ACT estándar de 14 dimensiones sin adaptación.
- Riesgo de sobreajuste a las condiciones de recogida de datos; no se documentan evaluaciones fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin datos publicados de benchmarks, sesgos o métricas de robustez; la evaluación debe realizarse de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Autobrik/ecse552-act-oracle-E
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
