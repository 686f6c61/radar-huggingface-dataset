# aiden-jeon/minipfn-tabpfn-v2-5-classifier

## Resumen

minipfn TabPFN-2.5 classifier es una reimplementación desde cero del clasificador TabPFN-2.5, un modelo fundacional para datos tabulares presentado en el artículo "TabPFN-2.5: Advancing the State of the Art in Tabular Foundation Models" (2025). Lo desarrolla el usuario independiente aiden-jeon y no debe confundirse con el checkpoint oficial de TabPFN-2.5: no utiliza ni el código ni los pesos oficiales, sino que aplica los cambios de arquitectura descritos en el informe sobre su propia reimplementación de TabPFN v2 y entrena con el prior abierto de TabICL.

El modelo resuelve clasificación tabular en contexto (in-context learning): recibe las filas de entrenamiento y las de test en una sola pasada y predice sin ajuste de parámetros por tarea. Con 14.335.306 parámetros, 24 capas y capacidad para hasta 10 clases, cualquier número de features (hasta 500 vistas en entrenamiento) y hasta 8.192 filas de entrenamiento, se posiciona como una alternativa ligera y de licencia Apache-2.0 frente a los pesos oficiales de TabPFN-2.5, que están sujetos a la TABPFN-2.5 License.

Es relevante ahora porque reproduce, con recursos modestos (unas 810 horas de H100), resultados al nivel del TabPFN v2 publicado en el benchmark de 29 datasets AMLB, y supera ligeramente la referencia del artículo (0,9343 frente a 0,9323 de ROC AUC medio) gracias a una segunda etapa de entrenamiento sobre tablas largas. El repositorio ocupa 0,3 GB y los pesos están en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cell_transformer (TabPFN v2 con los cuatro cambios de TabPFN-2.5): 24 capas, atención cruzada por features y luego por filas, post-LayerNorm sin parámetros afines |
| Parametros totales | 14.335.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; límites operativos: hasta 10 clases, hasta 500 features y hasta 8.192 filas de entrenamiento (menos de 400.000 celdas en la etapa de tablas largas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo tabular, no lingüístico); no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer tipo cell_transformer que procesa cada celda de la tabla como un token, con atención alternada: primero entre features dentro de cada fila y después entre filas. Incorpora los cuatro cambios de TabPFN-2.5 respecto a v2: 24 capas en lugar de 12, tres features por token en lugar de dos, 64 filas "thinking" aprendidas situadas antes de las filas de entrenamiento a las que atiende cada fila (la colocación exacta es elección del autor, ya que el informe no la detalla), y emsize 192 con 6 cabezas y MLP de 4× emsize. El entrenamiento consta de dos etapas con batch de 64 tablas, bf16 y gradient clipping 1.0: una primera de prior-fitting de 500.000 pasos sobre tamaños de tabla del artículo de v2 (1–2.048 filas de entrenamiento más 128 de validación, 1–160 features, menos de 75.000 celdas, valores ausentes en el 30% de las tablas) con Adam a lr 2e-4 y warmup de 10.000 pasos, y una segunda de 20.000 pasos sobre tablas largas (filas log-uniformes entre 512 y 8.192, hasta 500 features, menos de 400.000 celdas) con lr 5e-5.

El prior de datos es el grafo SCM de TabICL con las reglas de tamaño de tabla de TabPFN v2. Una innovación técnica destacable es el QK-clip: cada 50 pasos, cualquier cabeza de atención por filas cuyo límite teórico de logits (σ_max(W_qᵀW_k)·E/√d) supere τ = 3000 ve escalados a la baja sus W_q y W_k, evitando attention sinks; empezó a actuar hacia el paso 230.000. Además, el entrenamiento sufrió 13 colapsos de pérdida, cada uno resuelto por un guard que rebobinaba a un estado sano de 2.000–4.000 pasos antes y, desde el paso 300.000, reducía a la mitad el lr base hasta el suelo de 2,5e-5. En inferencia usa un ensamble de 4 miembros con barajado de features y clases, columna identificadora de fila aleatoria, alternancia entre features por cuantiles más componentes SVD y escalado robusto con soft clipping estilo RealMLP, one-hot para categóricas de hasta 20 categorías y temperatura softmax de 0,9.

## Capacidades

- Clasificación tabular en contexto (in-context learning) sin ajuste de parámetros por tarea: las filas de entrenamiento y de test se pasan juntas al modelo.
- Hasta 10 clases, cualquier número de features (hasta 500 en entrenamiento) y hasta 8.192 filas de entrenamiento.
- Manejo de valores ausentes, presente en el 30% de las tablas del prior de entrenamiento.
- Soporte de variables categóricas mediante one-hot encoding para columnas de hasta 20 categorías.
- Capacidad de trabajar con tablas de hasta 400.000 celdas en la etapa de tablas largas.
- Ensamble interno configurable de 4 miembros con dos estrategias de preprocesado (cuantiles + SVD y escalado robusto con soft clipping).
- No soporta tool calling, function calling, agentes, generación de texto, visión ni audio: es un modelo exclusivamente tabular.
- Capacidades multilingües: no aplica.

## Casos de uso

- Scoring de riesgo crediticio: el modelo puede clasificar solicitudes a partir de tablas de features financieras de hasta 8.192 filas de entrenamiento sin reentrenar, útil para prototipado rápido de modelos de concesión donde los datos etiquetados son escasos.
- Predicción de abandono de clientes (churn): con tablas de cientos de features y valores ausentes frecuentes, el modelo clasifica clientes en contexto y permite comparar escenarios sin ajuste de hiperparámetros.
- Detección de fraude en transacciones: su capacidad para tablas largas (hasta 400.000 celdas) y 10 clases lo hace adecuado para clasificar transacciones con múltiples categorías de riesgo en pipelines por lotes.
- Triaje clínico sobre datos tabulares: clasificación de pacientes a partir de variables demográficas y analíticas con valores faltantes, aprovechando el entrenamiento con datos ausentes.
- Clasificación de calidad industrial o mantenimiento predictivo: con sensores tabulados y hasta 500 features, el modelo puede etiquetar estados de maquinaria en contexto sobre lotes de datos históricos.
- Baseline rápido en competiciones y experimentación: al no requerir entrenamiento por tarea y caber en 0,3 GB, sirve como referencia inmediata frente a gradient boosting en conjuntos de datos pequeños y medianos.
- Enriquecimiento de pipelines de datos: integración como paso de clasificación en procesos ETL donde se necesita etiquetar tablas heterogéneas con pocas filas de referencia.

## Benchmarks y rendimiento

Resultados del autor en los 29 datasets de clasificación AMLB del artículo de TabPFN v2 (media de ROC AUC sobre los 10 folds de OpenML):

| Checkpoint | ROC AUC medio | minipfn v2, mismo paso |
|---|---|---|
| 100k pasos | 0,9191 | 0,9175 |
| 200k pasos | 0,9279 | 0,9225 |
| 300k pasos | 0,9291 | 0,9208 |
| 400k pasos | 0,9322 | 0,9197 |
| 500k pasos | 0,9325 | 0,9238 |
| 500k + tablas largas 10k | 0,9336 | no disponible |
| **500k + tablas largas 20k (este modelo)** | **0,9343** | no disponible |
| TabPFN v2 (artículo) | 0,9323 | no disponible |

El modelo iguala o supera la referencia del artículo en 18 de 29 datasets; las mayores brechas restantes son philippine (5.832 filas × 308 features, −0,015) y credit-g (−0,005), y ningún otro dataset queda más de 0,0025 por debajo. Pérdida de validación final: 0,705 en tablas de tamaño del artículo (64 tablas fijas) y 0,499 en tablas largas (32 tablas), valores no comparables entre sí por usar conjuntos distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (14,3 M de parámetros, unos 57 MB en fp32 y unos 29 MB en bf16); el consumo real lo domina el tamaño de la tabla de entrada y el ensamble de 4 miembros, no los pesos. No se publican cifras exactas de VRAM.
- GPU recomendadas: cualquier GPU con soporte bf16; el autor entrenó con H100 (8 a 32 GPU según la fase), pero la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX con suficiente memoria para la tabla de entrada; no se especifican modelos concretos ni mínimos.
- Opciones de despliegue: PyTorch con el código del repositorio Aiden-Jeon/minipfn (modelo `src/minipfn/models/cell_transformer.py`, receta `src/minipfn/recipes/tabpfn_v2.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular.
- Latencia y throughput: no disponibles; el entrenamiento completo requirió unas 46 horas de reloj y aproximadamente 810 horas de H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límites | ROC AUC AMLB (29 datasets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn TabPFN-2.5 classifier (este) | 14,3 M | 10 clases, 500 features, 8.192 filas | 0,9343 | Apache-2.0 | Hugging Face (aiden-jeon) |
| minipfn TabPFN v2 classifier | no disponible en la información | límites de v2 (1–2.048 filas, 1–160 features en entrenamiento) | 0,9238 (500k pasos) | Apache-2.0 (según repositorio del autor) | Hugging Face (aiden-jeon) |
| TabPFN v2 (oficial) | no disponible en la información | límites de v2 | 0,9323 (artículo) | no disponible en la información | PriorLabs/TabPFN |
| TabPFN-2.5 (oficial) | no disponible en la información | no disponible en la información | no disponible (el informe no publica tabla por dataset de esta suite) | TABPFN-2.5 License | PriorLabs/TabPFN |

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN-2.5: es una reimplementación independiente sin código ni pesos oficiales; los resultados pueden diferir del modelo oficial.
- El informe de TabPFN-2.5 no publica el ancho del modelo, los detalles del prior ni la receta de entrenamiento; varios aspectos (colocación de las filas thinking, escalado robusto, tamaños de la etapa de tablas largas) son elecciones propias del autor.
- El entrenamiento sufrió 13 colapsos de pérdida resueltos con rebobinados y reducción del lr; aunque el checkpoint final es estable, refleja un proceso de entrenamiento delicado.
- Límites operativos: 10 clases como máximo, 500 features y 8.192 filas de entrenamiento; tablas mayores quedan fuera del régimen entrenado.
- Riesgo de sobreajuste al prior de TabICL y a las distribuciones sintéticas de entrenamiento; el rendimiento en dominios muy alejados del prior no está caracterizado.
- Sesgos conocidos: no documentados; al ser un modelo tabular, puede heredar sesgos presentes en los datos de la tarea concreta.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones sobreconfiadas en tablas fuera de distribución.
- Licencia Apache-2.0: permite uso comercial, pero al derivar conceptualmente de TabPFN conviene revisar las condiciones de la TABPFN-2.5 License si se compara o combina con pesos oficiales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-5-classifier
- Modelo v2 del mismo autor: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-classifier
- Modelo regresor del mismo autor: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-regressor
- Código: https://github.com/Aiden-Jeon/minipfn
- Artículo TabPFN-2.5: https://arxiv.org/abs/2511.08667
- Repositorio oficial de TabPFN: https://github.com/PriorLabs/TabPFN
- Prior TabICL: https://github.com/soda-inria/tabicl
