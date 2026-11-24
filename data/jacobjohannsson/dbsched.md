# JacobJohannsson/dbsched

## Resumen

dbsched es un conjunto de pesos de modelos de aprendizaje automático que forman parte de la herramienta de código abierto dbsched, un sistema de planificación de consultas a nivel de pipeline para DuckDB. No se trata de un modelo de lenguaje, sino de un conjunto de componentes de inferencia especializados en la optimización de consultas de bases de datos: un predictor de coste (PQueryFormer) y un simulador de progreso de ejecución. El autor es JacobJohannsson y los pesos se distribuyen a través de Hugging Face con un tamaño de repositorio de 0,1 GB.

El componente principal, PQueryFormer, es un modelo basado en PyTorch que predice el tiempo de CPU de cada pipeline de un plan de consulta. El segundo componente es un simulador que predice, cada milisegundo, cuántos fragmentos completa cada pipeline en ejecución y cómo progresa su fase de finalización, en función de qué pipelines comparten la máquina y cuántos hilos tiene cada uno. Ambos componentes se entrenaron sobre datos derivados de la base de datos IMDB a escala 32 y de los conjuntos de consultas JOB, CEB y MSCN, entre otros.

La relevancia de este repositorio es acotada y específica: proporciona los artefactos de inferencia del proyecto dbsched para quien quiera reproducir o integrar la planificación de consultas en DuckDB. No es un modelo generativo ni un modelo de propósito general, y su uso está ligado al ecosistema de dbsched.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal en PyTorch (predictor de coste PQueryFormer y simulador de progreso); arquitectura interna no detallada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (serialización `torch.save`; requiere `torch.load(..., weights_only=False)`); carpetas de modelo con `model.pt` e `inference.json` |

## Arquitectura y entrenamiento

PQueryFormer es un modelo de predicción de coste entrenado para estimar el tiempo de CPU de cada pipeline de un plan de consulta. El checkpoint incluye el `state_dict`, los hiperparámetros (`args`), la codificación con la que se entrenó (`encoding`) y los límites del normalizador de etiquetas (`pipe_norm`). El segundo checkpoint (`20261113-223818.pt`) se entrenó con los conjuntos JOB, JOB-light, JOB-ext, JOB-D, CEB, JOB-light-scaled, JOB-ext-scaled y MSCN sobre la base de datos IMDB a escala 32, y consigue un q-error de tiempo de CPU por pipeline en sus particiones de test (14.924 consultas) con mediana 1,19 y percentil 90 de 2,03. Este checkpoint actúa como codificador congelado del modelo simulador `20261123-061146`.

El simulador es un modelo que predice correcciones sobre el perfil en solitario de cada pipeline (la tasa que tendría ejecutándose solo con los mismos hilos). Se entrenó con trazas del pool mscn-5000 sobre IMDB a escala 32 con 16 hilos, usando los fragmentos 0 y 1 de las ejecuciones equal-c8 y random-c4, c8 y c16 (1.176 consultas de entrenamiento y 207 reservadas para validación), en la época 3, la mejor sobre las consultas reservadas. Las correcciones están acotadas a ±5 en escala logarítmica y los pipelines sin fragmentos fuente quedan fuera de la pérdida. El q-error en las consultas reservadas es: mediana y percentil 90 de 1,13 y 1,95 para el tiempo de ejecución restante, 1,15 y 2,00 para toda la fase de ejecución, y 1,20 y 1,76 para la finalización. El simulador lee el embedding de cada pipeline de un PQueryFormer congelado, por lo que depende de un checkpoint concreto de este repositorio.

## Capacidades

- Predicción del tiempo de CPU por pipeline de un plan de consulta (PQueryFormer).
- Estimación del q-error de tiempos de CPU con mediana 1,19 y percentil 90 de 2,03 sobre 14.924 consultas de test.
- Simulación del progreso de ejecución a intervalos de 1 ms: fragmentos completados por pipeline y avance de la fase de finalización.
- Modelado de la contención entre pipelines que comparten máquina y del número de hilos asignados a cada uno.
- Predicción de correcciones sobre el perfil en solitario de cada pipeline, acotadas a ±5 en log.
- Integración con DuckDB mediante la herramienta dbsched (planificación de consultas a nivel de pipeline).
- No soporta tool calling, agentes, generación de texto, visión ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Planificación de consultas en DuckDB: el sistema dbsched usa PQueryFormer para estimar el coste de CPU de cada pipeline y decidir la programación de las consultas, lo que permite optimizar la asignación de recursos en cargas analíticas.
- Evaluación de políticas de scheduling: el simulador permite probar políticas como FIFO sobre trazas reales (`--policy fifo`) sin ejecutar la consulta en la base de datos, lo que acelera la experimentación con distintas configuraciones de hilos y concurrencia.
- Investigación en optimización de consultas: los pesos permiten reproducir los resultados del proyecto dbsched y comparar nuevas propuestas de estimación de coste contra el q-error publicado (mediana 1,19 en test).
- Predicción de contención en entornos multiinquilino: el simulador modela cómo afecta a cada pipeline compartir la máquina con otros y cuántos hilos tiene cada uno, útil para estudiar el rendimiento bajo concurrencia.
- Análisis de la fase de finalización: el modelo predice el avance del finalize de cada pipeline, lo que permite estudiar cuellos de botella que no aparecen en la fase de ejecución.
- Reproducción de experimentos académicos: al incluir los checkpoints exactos y las particiones de entrenamiento y test documentadas, sirve para replicar los números del proyecto en trabajos de investigación sobre scheduling de bases de datos.
- Integración en pipelines de CI de motores de bases de datos: los modelos pueden incorporarse a pruebas automatizadas que detecten regresiones en la estimación de costes de planes de consulta.

## Benchmarks y rendimiento

| Componente | Métrica | Mediana | Percentil 90 | Conjunto de evaluación |
|---|---|---|---|---|
| PQueryFormer (`20261113-223818.pt`) | q-error de tiempo de CPU por pipeline | 1,19 | 2,03 | 14.924 consultas de test (JOB, JOB-light, JOB-ext, JOB-D, CEB, JOB-light-scaled, JOB-ext-scaled, MSCN) |
| Simulador (`20261123-061146`) | q-error de tiempo de ejecución restante | 1,13 | 1,95 | 207 consultas reservadas (mscn-5000, IMDB escala 32, 16 hilos) |
| Simulador (`20261123-061146`) | q-error de toda la fase de ejecución | 1,15 | 2,00 | 207 consultas reservadas |
| Simulador (`20261123-061146`) | q-error de finalize | 1,20 | 1,76 | 207 consultas reservadas |

No se han publicado en la información disponible resultados comparativos con otros modelos de estimación de coste.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere que los pesos son pequeños y caben en cualquier GPU consumer, pero no se documenta el consumo exacto.
- GPU recomendadas: no disponible; al ser modelos PyTorch de pequeño tamaño, es probable que funcionen en CPU y en GPUs consumer, pero no se especifica.
- Compatibilidad con GPU consumer: no confirmada explícitamente; el tamaño del repositorio (0,1 GB) es compatible con cualquier GPU moderna.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(path, weights_only=False)`) desde un checkout de dbsched; ejecución mediante los módulos `python -m pqueryformer eval` y `python -m simulator run`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de estimación de coste de pipelines para DuckDB ni alternativas equivalentes del ecosistema dbsched.

## Limitaciones y advertencias

- Los pesos son serializaciones pickle (`torch.save`); deben cargarse con `torch.load(path, weights_only=False)` y solo si se confía en la fuente, por el riesgo de ejecución de código arbitrario.
- El simulador no puede predecir el trabajo real de un hash join que desborda a disco bajo presión de memoria en un pipeline que no tiene trabajo en los perfiles en solitario; esto supone aproximadamente el 20 % del tiempo de ejecución con 16 conexiones.
- En el simulador, los pipelines nuevos reciben sus primeros hilos antes que en DuckDB, por lo que las consultas cortas terminan demasiado rápido.
- El simulador depende de un checkpoint concreto de PQueryFormer (`20261113-223818.pt`); no es intercambiable con otros checkpoints sin recalcular los embeddings.
- Los modelos están entrenados sobre IMDB a escala 32 y sobre los conjuntos de consultas indicados; su generalización a otros esquemas, escalas o motores no está documentada.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no es un modelo lingüístico; las advertencias relevantes son las de precisión del modelo y las de seguridad en la carga de pesos.
- El repositorio tiene 0 descargas y 0 likes, y los pesos se suben manualmente desde las ejecuciones de entrenamiento, sin un pipeline de publicación automatizado documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JacobJohannsson/dbsched
- Repositorio del proyecto dbsched: https://github.com/JacobJohannsson/dbsched
