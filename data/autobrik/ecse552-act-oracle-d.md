# Autobrik/ecse552-act-oracle-D

## Resumen

Autobrik/ecse552-act-oracle-D es un checkpoint de robótica basado en ACT (Action Chunking with Transformers), el algoritmo de imitación desarrollado por Tony Zhao y colaboradores. Lo publica el usuario Autobrik como artefacto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. El modelo aprende políticas de manipulación a partir de demostraciones sobre el conjunto de datos Autobrik/ecse552-ocbench-block, en la variante denominada "oracle D".

Se trata de un modelo de investigación, no de un modelo de lenguaje: es un transformer de imitación que mapea observaciones visuales a acciones motoras absolutas de 7 dimensiones, con episodios de longitud variable y chunks de 20 acciones a 10 Hz (2 segundos por chunk). La implementación es ACT original sin modificar, con la particularidad de que solo consume imágenes (el estado del robot se pone a cero) y de que las acciones se rellenan con ceros hasta 14 dimensiones para encajar en la interfaz upstream.

Su relevancia es acotada y experimental: sirve como referencia "oracle" dentro de un estudio comparativo sobre aprendizaje de manipulación a partir de vídeos sin acciones, y permite reproducir los resultados del proyecto cargando los checkpoints con el código publicado. No hay métricas de benchmarks publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación original de tonyzhaozh/act sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación por chunks de 20 acciones a 10 Hz) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en formato .ckpt) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (.ckpt): policy_best.ckpt, policy_last.ckpt, selected.ckpt, más dataset_stats.pkl, act_run.json, history.json y provenance.json |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con decodificación por chunks: el modelo observa imágenes de la escena y predice una secuencia de 20 acciones futuras (chunk) en lugar de una acción por paso, lo que reduce el error de compounding y suaviza la política. En esta variante concreta se alimenta únicamente con imágenes, ya que el estado del robot se pone a cero, y las 7 dimensiones de acción del proyecto se rellenan con ceros hasta las 14 de la implementación upstream. Las acciones son objetivos articulares absolutos.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión f7396350f5d70d2d48361fda552028e5a2590774, con episodios de longitud variable muestreados a 10 Hz. El repositorio contiene múltiples ejecuciones organizadas como n<demos>/seed<k>/, cada una con el checkpoint de menor pérdida de validación (policy_best.ckpt), el último checkpoint (policy_last.ckpt) y el seleccionado para evaluación en test (selected.ckpt). La variante "oracle D" usa colecciones oracle; las variantes (b) y (c) emplean objetivos pseudo-etiquetados, según se detalla en data.collections de act_run.json. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicó RLHF o DPO.

## Capacidades

- Predicción de acciones motoras de 7 dimensiones como objetivos articulares absolutos a partir de observaciones visuales.
- Decodificación por chunks de 20 acciones a 10 Hz (2 segundos de trayectoria por inferencia).
- Política de imitación entrenada sobre demostraciones del dataset ecse552-ocbench-block.
- Soporte de episodios de longitud variable.
- Múltiples ejecuciones por número de demostraciones y semilla, con selección de checkpoint por validación.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Reproducción de resultados académicos: cargar selected.ckpt con action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device) para replicar las evaluaciones del proyecto ECSE 552 sobre la tarea de manipulación de ocbench-block.
- Línea base "oracle" en estudios de aprendizaje desde vídeo sin acciones: comparar políticas entrenadas con objetivos pseudo-etiquetados (variantes b y c) contra esta referencia con objetivos oracle.
- Análisis de curvas de aprendizaje: usar history.json y los directorios n<demos>/seed<k>/ para estudiar el efecto del número de demostraciones y de la semilla en la pérdida de validación.
- Investigación en imitación visual pura: al poner a cero el estado del robot, el checkpoint permite aislar la contribución de la entrada visual frente a la propriocepción.
- Evaluación de robustez de políticas ACT en entornos de bloque: ejecutar rollouts sobre el simulador o banco de pruebas del proyecto para medir tasas de éxito con distintas configuraciones.
- Docencia y experimentación con ACT: servir de ejemplo funcional de entrenamiento y selección de checkpoints en un pipeline de imitation learning con chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; depende del tamaño del encoder visual y del número de parámetros, no declarado.
- GPU recomendadas: no disponible; el proyecto original de ACT se ejecuta habitualmente en GPU NVIDIA, pero no se especifican modelos concretos para este checkpoint.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: carga mediante la API del código del proyecto (action_free.act_original.ActPolicy), sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-oracle-D | ACT, imitación visual | no disponible | no aplica (chunks de 20 acciones) | MIT | Hugging Face, 0 descargas |
| ACT original (tonyzhaozh/act) | ACT, imitación | no disponible | no aplica | MIT | Repositorio GitHub |
| Variantes (b)/(c) del mismo proyecto | ACT con objetivos pseudo-etiquetados | no disponible | no aplica | MIT | Incluidas en el mismo repositorio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación académica: sin benchmarks publicados, sin descargas ni validación externa; no apto para producción sin evaluación propia.
- Entrenado exclusivamente sobre el dataset ecse552-ocbench-block; no generaliza a otras tareas, objetos o entornos sin reentrenamiento.
- El estado del robot se ignora (se pone a cero), lo que puede degradar el rendimiento en tareas donde la propriocepción es informativa.
- Las acciones se rellenan con ceros de 7 a 14 dimensiones; cualquier integración debe respetar ese contrato de dimensiones.
- Riesgo de sobreajuste a las demostraciones y a la configuración de recogida de datos del proyecto; la selección de checkpoint depende de rollouts de validación sobre la fuente.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No es un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural; no procede evaluar sesgos lingüísticos ni alucinación textual.
- Fechas de creación y actualización (2026-11-11) posteriores a la fecha habitual de consulta; verificar la vigencia del repositorio antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-oracle-D
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
