# occams/Xiaomi-TabLDM

## Resumen

Xiaomi-TabLDM es un modelo fundacional para datos tabulares desarrollado por Xiaomi (publicado en el repositorio de Hugging Face bajo el usuario `occams`). Resuelve el problema de la predicción tabular (clasificación y regresión) mediante aprendizaje en contexto (*in-context learning*): dado un conjunto de muestras etiquetadas como contexto, el modelo produce predicciones en un único pase hacia delante sin necesidad de entrenamiento específico para la tarea. Esto elimina el ajuste fino por *dataset*, un cuello de botella habitual en flujos de trabajo con datos estructurados.

El modelo se preentrena exclusivamente con datos sintéticos generados a partir de modelos causales estructurales (SCM), lo que permite ampliar la cobertura y diversidad de los datos de preentrenamiento y escalar la capacidad del modelo de forma más eficiente. Su diseño incorpora agrupación de características en doble flujo (*dual-stream feature grouping*), *Attention Residual* ligero y una mezcla de expertos (*Mixture-of-Experts*) dispersa, junto con una estrategia de entrenamiento en tres etapas.

Es relevante ahora porque establece un nuevo estándar de rendimiento en regresión tabular: ocupa el primer puesto en OpenML-CTR23 y el segundo en regresión en TALENT, TabArena y BCCO, con un coste computacional notablemente inferior al de los principales competidores. Además, ofrece una interfaz compatible con scikit-learn y *test-time scaling*, lo que lo hace práctico tanto para investigación como para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa, agrupación de características en doble flujo y *Attention Residual* ligero |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el contexto lo forman las muestras etiquetadas de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo para datos tabulares, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints `.ckpt` (PyTorch); tamaño del repositorio 2,8 GB |

## Arquitectura y entrenamiento

Xiaomi-TabLDM es un transformer con una mezcla de expertos (MoE) dispersa. Incorpora dos innovaciones arquitectónicas destacadas: la agrupación de características en doble flujo (*dual-stream feature grouping*), que organiza las columnas tabulares en dos flujos de procesamiento, y un *Attention Residual* ligero que reduce el coste del mecanismo de atención. El modelo se entrena en tres etapas y el preentrenamiento se realiza exclusivamente sobre datos sintéticos generados a partir de modelos causales estructurales (SCM), lo que amplía la cobertura y diversidad de los datos tabulares sintéticos y permite un escalado de capacidad más eficiente.

El modelo no se ajusta con datos reales etiquetados: la adaptación a una tarea concreta se produce en el momento de la inferencia mediante aprendizaje en contexto. La función `fit` de la interfaz no actualiza los pesos; solo preprocesa el contexto etiquetado y carga el modelo preentrenado. Las predicciones se generan en un único pase hacia delante, con soporte de caché KV para reutilizar las proyecciones del contexto en llamadas repetidas a `predict`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación tabular mediante aprendizaje en contexto, con salida de probabilidades por clase (`predict_proba`).
- Regresión tabular mediante aprendizaje en contexto.
- Predicción sin ajuste fino específico de tarea: un único modelo preentrenado sirve para múltiples *datasets*.
- *Test-time scaling*: la asignación de cómputo adicional en inferencia mejora de forma consistente el rendimiento predictivo respecto al modelo base.
- Caché KV para acelerar la inferencia repetida sobre el mismo contexto de entrenamiento.
- Interfaz compatible con scikit-learn (`fit`, `predict`, `predict_proba`).
- Soporte de *offloading* a CPU y disco para escalar a tamaños de datos mayores.
- No dispone de capacidades de generación de texto, código, visión, audio ni *tool calling*: es un modelo especializado en datos tabulares.

## Casos de uso

- Predicción de riesgo crediticio: el modelo recibe un histórico etiquetado de clientes (impagos y no impagos) como contexto y clasifica solicitudes nuevas en un solo pase, sin reentrenar por entidad financiera ni por producto.
- Estimación de precios y demanda: para regresión de precios de inmuebles, ventas o consumo energético, se carga el histórico etiquetado como contexto y se predicen valores continuos con el modelo preentrenado, evitando pipelines de *feature engineering* específicos.
- Detección de fraude en transacciones: clasificación binaria con contexto de transacciones etiquetadas; la caché KV permite reutilizar el mismo contexto para puntuar lotes sucesivos de transacciones con baja latencia.
- Mantenimiento predictivo industrial: regresión sobre lecturas de sensores y variables de proceso para estimar vida útil restante o probabilidad de fallo, aprovechando el *offloading* a CPU/disco cuando el histórico es grande.
- Analítica clínica y epidemiología: clasificación de pacientes y regresión de variables de salud a partir de cohortes etiquetadas, con la ventaja de no requerir entrenamiento por estudio y de mantener los pesos del modelo fijos.
- Evaluación rápida de *datasets* en ciencia de datos: al ser compatible con scikit-learn, se puede usar como *baseline* inmediato en competiciones y proyectos de análisis exploratorio sin invertir tiempo en ajuste de hiperparámetros.
- Segmentación de clientes y *scoring* de marketing: clasificación multoclase de propensión de compra o abandono usando el histórico etiquetado como contexto, con predicciones probabilísticas directamente utilizables en campañas.

## Benchmarks y rendimiento

Los resultados publicados en la model card se presentan como rankings y puntuaciones Elo en figuras, sin tablas numéricas de métricas por *dataset*. Los datos textuales disponibles son los siguientes:

| Benchmark | Resultado |
|---|---|
| OpenML-CTR23 (33 datasets de regresión) | 1.º puesto en ranking medio |
| TALENT (regresión) | 2.º puesto en ranking medio |
| TabArena (regresión) | 2.º Elo más alto; 82 % menos tiempo de entrenamiento y 68 % menos tiempo de predicción que TabFM (1.º) |
| BCCO (clasificación y regresión) | 2.º puesto en regresión; ranking combinado disponible en figura |

No se han publicado resultados numéricos detallados (MMLU, HumanEval, GSM8K u otras métricas) en la información disponible, ya que no son aplicables a un modelo tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,8 GB, por lo que los pesos en precisión original caben en GPUs de consumo con al menos 8-12 GB de VRAM, aunque el consumo real depende del tamaño del contexto tabular y de la implementación MoE.
- GPU recomendadas: se recomienda GPU para *datasets* grandes; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: probablemente viable en RTX 3090/4090 y similares por el tamaño de los pesos, aunque no confirmado en la documentación.
- Opciones de despliegue: paquete Python propio (`pip install .`) con interfaz scikit-learn; soporte de *offloading* a CPU y disco. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se indica que la caché KV acelera llamadas repetidas a `predict` y que el coste de predicción es un 68 % menor que el de TabFM en TabArena.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento en regresión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-TabLDM | Transformer MoE, aprendizaje en contexto | Contexto = muestras etiquetadas | 1.º en OpenML-CTR23; 2.º en TALENT, TabArena y BCCO | Apache 2.0 | Hugging Face (`occams/Xiaomi-TabLDM`) |
| TabFM | Modelo fundacional tabular | no disponible | 1.º en TabArena (Elo), pero 82 % más tiempo de entrenamiento y 68 % más de predicción | no disponible | no disponible |
| TabPFN (referencia habitual en la categoría) | Transformer, aprendizaje en contexto | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para una comparación numérica más detallada con alternativas concretas.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en datos tabulares; no admite texto, código, visión ni otras modalidades.
- El preentrenamiento se basa únicamente en datos sintéticos generados por SCM; el comportamiento sobre distribuciones reales muy alejadas de las sintéticas puede degradarse y no se documenta en la información disponible.
- No se han publicado datos sobre sesgos, tasas de alucinación o calibración de las probabilidades.
- El rendimiento depende críticamente del tamaño y la calidad del contexto etiquetado; contextos pequeños o mal muestreados pueden reducir la precisión.
- La longitud máxima de contexto tabular no está documentada, lo que limita la planificación de despliegues con *datasets* muy grandes.
- Aunque la licencia es Apache 2.0 (permite uso comercial), no se detallan restricciones adicionales de uso por parte de Xiaomi; conviene revisar los términos del repositorio antes de un despliegue en producción.
- El formato de pesos es `.ckpt` de PyTorch y la librería es `custom`; no hay integración documentada con ecosistemas estándar de serving como vLLM u Ollama.
- La documentación no especifica requisitos de VRAM ni latencias, por lo que el dimensionamiento de infraestructura debe hacerse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/occams/Xiaomi-TabLDM
- Informe técnico (arXiv): https://arxiv.org/abs/2609.03880
- README en chino: https://huggingface.co/occams/Xiaomi-TabLDM/blob/main/README_CN.md
- Figura del marco del modelo: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_Framework.png
- Figura de rendimiento en TALENT: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_TALENT.png
- Figura de rendimiento en TabArena: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_TabArena.png
- Figura de rendimiento en BCCO: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_BCCO.png
- Figura de rendimiento en OpenML-CTR23: https://huggingface.co/occams/Xiaomi-TabLDM/resolve/main/assets/Xiaomi-TabLDM_OpenML-CTR23.png
