# skblv/lemonfm-linear-probes-surgical-video

## Resumen

Este repositorio contiene los pesos de las sondas lineales (linear probes) entrenadas por el autor `skblv` sobre las características congeladas del modelo LemonFM, un modelo fundacional de visión para cirugía desarrollado por Visurg AI y descrito en el artículo "LEMON: A Large Endoscopic MONocular Dataset and Foundation Model for Perception in Surgical Settings" (CVPR 2026). Las sondas sirven como baselines de evaluación para el leaderboard de comprensión de vídeo quirúrgico de SDSC × Chicago Booth. El objetivo es medir el rendimiento del encoder LemonFM en tareas concretas de clasificación de imágenes quirúrgicas, como identificación de instrumentos, anatomía, fases de procedimiento, siguiente acción y gestos de sutura.

El modelo no es un sistema completo de inferencia, sino un conjunto de pesos de una única capa lineal que se aplican sobre las características extraídas por el encoder LemonFM (ConvNeXt-Large). Cada subcarpeta del repositorio corresponde a un benchmark distinto e incluye el peso de la sonda (`probe_weights.pt`), las métricas obtenidas (`metrics.json`) y la curva de entrenamiento. El encoder LemonFM no está incluido; debe obtenerse por separado bajo los términos de sus autores. La licencia del repositorio es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (una capa fully-connected) sobre características congeladas de LemonFM (ConvNeXt-Large) |
| Parametros totales | no disponible (pesos de una capa lineal, típicamente miles de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (entrada de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

Las sondas lineales consisten en una única capa fully-connected que toma como entrada las características extraídas de un encoder congelado LemonFM (ConvNeXt-Large). Se entrenan con pérdida BCE (binary cross-entropy) sobre el conjunto de entrenamiento de cada benchmark, con semilla fija 42. Las reglas de decisión varían según la tarea: para clasificación multi-etiqueta (instrumentos y anatomía) se aplica un umbral por clase; para PitVQA (fase y paso) se usa un argmax agrupado; para tareas de etiqueta única (acción, gesto) se usa argmax simple. El protocolo completo se describe en los scripts `s56_lemonfm_probe.py` y `s62_lemonfm_probe_new.py`.

No se proporciona información sobre el entrenamiento del encoder LemonFM en este repositorio, pero según el paper asociado, LemonFM es un modelo ConvNeXt-Large preentrenado en el dataset LEMON, que contiene más de 4,000 vídeos quirúrgicos de alta resolución (938 horas) de 35 tipos de procedimientos. El modelo base está entrenado con aprendizaje autosupervisado y no se incluye aquí.

## Capacidades

- Clasificación multi-etiqueta de instrumentos quirúrgicos en vídeo (por ejemplo, CholecT50 con 6 instrumentos, PITVIS con 18, SurgVU con 17).
- Clasificación de estructuras anatómicas (DSAD con 12 estructuras).
- Reconocimiento de fase y paso en procedimientos quirúrgicos (PitVQA).
- Predicción de la siguiente acción (SapBench, 5 categorías).
- Reconocimiento de gestos de sutura (SARRARP50, 8 gestos).
- Funciona como un módulo de evaluación para modelos de vídeo quirúrgico, no como un modelo generativo.
- No incluye capacidades de procesamiento de lenguaje natural ni de generación de texto.

## Casos de uso

- **Evaluación de modelos fundacionales para cirugía**: permite comparar objetivamente el rendimiento de LemonFM frente a otros modelos en tareas específicas de video quirúrgico, sirviendo como baseline reproducible.
- **Desarrollo de sistemas de asistencia quirúrgica**: los resultados de las sondas pueden orientar la selección de un modelo base para aplicaciones de detección de instrumentos en tiempo real.
- **Investigación en análisis de imagen médica**: los pesos y métricas son útiles para estudiar la transferibilidad de características de un modelo preentrenado a dominios quirúrgicos concretos.
- **Validación de pipelines de preprocesado**: el protocolo de extracción de características y entrenamiento de sondas puede adaptarse para validar la calidad de características de otros encoders.
- **Formación de nuevos investigadores**: el repositorio incluye curvas de entrenamiento y scripts, lo que permite reproducir el proceso y aprender sobre el ajuste de sondas lineales.
- **Comparación de arquitecturas**: permite comparar el rendimiento de LemonFM con otras arquitecturas de video (p. ej., TimeSformer, ViT) sobre los mismos benchmarks, aunque las sondas solo se han entrenado sobre LemonFM.

## Benchmarks y rendimiento

Resultados sobre los conjuntos de validación completos (intervalos de confianza bootstrap del 95%):

| Benchmark | Tarea | Exact match | Micro-F1 |
|---|---|---|---|
| `cholect50/` | 6-instrumento multi-etiqueta | 67.7% (64.7–70.7) | 85.62% (84.16–87.13) |
| `pitvis/` | 18-instrumento multi-etiqueta | 63.6% (60.3–66.7) | 68.75% (65.65–71.63) |
| `surgvu/` | 17-instrumento multi-etiqueta | 40.0% (37.0–43.1) | 68.8% (66.79–70.77) |
| `dsad/` | 12-estructura multi-etiqueta | 17.3% (15.7–19.1) | 57.6% (56.2–59.1) |
| `pitvqa/` | fase + paso | 63.3% (62.7–63.8) | 76.1% (75.7–76.5) |
| `sapbench/` | siguiente acción (5 clases) | 46.2% (41.4–51.6) | = exact match |
| `sarrarp50/` | gesto de sutura (8 clases) | 42.9% (39.3–47.0) | = exact match |

Para las tareas de una sola etiqueta, el micro-F1 coincide con la exactitud. No se proporcionan comparaciones con otros modelos en este repositorio; el leaderboard completo está disponible en el enlace de GitHub.

## Requisitos de hardware

- **Inferencia**: para ejecutar las sondas se requiere cargar el encoder LemonFM (ConvNeXt-Large) y extraer las características de las imágenes. El tamaño del encoder no se especifica en el repositorio, pero ConvNeXt-Large típicamente tiene alrededor de 200 millones de parámetros; en fp16 puede necesitar ~400 MB de VRAM, aunque se recomienda al menos 8 GB para manejar lotes de imágenes.
- **GPU recomendada**: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM (por ejemplo, RTX 2080 Ti, RTX 3060, A100). Para entrenar nuevas sondas se requiere más memoria, pero el entrenamiento es ligero (una sola capa).
- **Compatibilidad con GPUs de consumo**: sí, siempre que se disponga del encoder base y se trabaje con lotes pequeños.
- **Opciones de despliegue**: no se incluyen scripts de despliegue; se puede usar directamente con PyTorch. No es compatible con vLLM ni Ollama, ya que no es un modelo generativo.
- **Latencia**: no se proporcionan datos de latencia; la extracción de características del encoder dominará el tiempo de procesamiento.

## Comparativa con modelos similares

No se dispone de información sobre otros conjuntos de sondas lineales específicos para estos benchmarks en el repositorio. La comparación se debe realizar a través del leaderboard de video quirúrgico mencionado, que incluye resultados de otros modelos de video (por ejemplo, TimeSformer, ViT, modelos específicos de cirugía). Sin embargo, no hay datos numéricos comparativos en este repositorio, por lo que se indica "no disponible".

## Limitaciones y advertencias

- **Solo para investigación**: los autores declaran explícitamente que son "research baselines only" y no constituyen un dispositivo médico.
- **Dependencia del encoder**: las sondas solo son válidas sobre las características exactas del modelo LemonFM y con el preprocesado utilizado en el script de entrenamiento; no funcionan con otros encoders ni con variaciones del mismo.
- **Riesgo de sobreajuste**: las sondas se entrenan sobre conjuntos específicos de benchmarks; su rendimiento puede no generalizar a otros dominios quirúrgicos.
- **Sesgos de los datos**: el dataset LEMON proviene de vídeos de YouTube, lo que puede introducir sesgos en la distribución de procedimientos, calidad de imagen y variaciones de equipos.
- **Licencia**: aunque el repositorio es Apache 2.0, el encoder LemonFM tiene sus propios términos de uso que deben respetarse al utilizarlo.
- **Ausencia de garantías**: no se ofrecen garantías de precisión clínica ni de funcionamiento en entornos de producción reales.

## Enlaces

- [Repositorio de Hugging Face: skblv/lemonfm-linear-probes-surgical-video](https://huggingface.co/skblv/lemonfm-linear-probes-surgical-video)
- [GitHub del leaderboard de video quirúrgico](https://github.com/skblv/neurosurgery-video-eval-website)
- [Paper LEMON (arXiv)](https://arxiv.org/abs/2503.19740)
- [Repositorio oficial LEMON en GitHub](https://github.com/visurg-ai/LEMON)
- [Modelo LemonFM en Hugging Face](https://huggingface.co/visurg/LemonFM)
- [Paper LEMON en CVPR 2026 (Open Access)](https://openaccess.thecvf.com/content/CVPR2026/html/Che_LEMON_A_Large_Endoscopic_MONocular_Dataset_and_Foundation_Model_for_CVPR_2026_paper.html)
