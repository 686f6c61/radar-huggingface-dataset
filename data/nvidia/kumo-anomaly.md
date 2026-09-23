# nvidia/Kumo-Anomaly

## Resumen

Kumo-Anomaly es un modelo de deteccion de anomalias en series temporales desarrollado por NVIDIA. A diferencia de las aproximaciones basadas unicamente en transformers, introduce modelado por difusion estabilizado mediante aprendizaje por curriculo (curriculum learning) y lo combina con metodos de umbralizacion adaptativa, en un diseno construido especificamente para el problema de la deteccion de anomalias. El objetivo es abordar senales ruidosas de alta dimension que derivan con el tiempo y que contienen eventos raros e irregulares, un escenario habitual en entornos industriales, de red o de sensores.

El modelo se publica bajo la version interna NV-Tesseract-AD y tiene un tamano muy reducido: 8 millones de parametros, sobre una arquitectura de transformer de difusion con red ResNet34. La entrada es tabular numerica (un DataFrame de Pandas o ficheros CSV/JSON con columna de marca temporal y una o mas columnas de valores) y la salida es tambien tabular, con marca temporal, valor y etiqueta de anomalia. Está pensado para datos de series temporales multivariantes, no para generacion de texto.

Es relevante ahora porque ataca uno de los puntos debiles clasicos del area: la no estacionariedad. Los metodos habituales asumen distribuciones estables y fallan cuando la senal deriva; aqui la combinacion de difusion, curriculo y umbrales adaptativos busca mantener la tasa de falsos positivos bajo control a lo largo del tiempo. La model card lo declara explicitamente como modelo para investigacion y desarrollo, no para produccion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (diffusion-based transformer), red ResNet34 |
| Parametros totales | 8 millones |
| Parametros activos | no disponible (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de serie temporal definidas por el usuario) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (la entrada es numerica; el etiquetado de idioma del repositorio es informativo) |
| Licencia | Apache License 2.0 |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB; runtime declarado PyTorch) |
| Nombre / version | NV-Tesseract-AD |
| Tarea | Deteccion de anomalias en series temporales (punto y secuencia) e imputacion de series temporales |
| Tipo de entrada | Tabular numerica, 2D (DataFrame de Pandas o CSV/JSON), con columna de timestamp y una o mas columnas de valores |
| Tipo de salida | Tabular numerica, 2D (DataFrame de Pandas) con timestamp, valor y etiqueta de anomalia |
| Preprocesado | Requerido en entrada; postprocesado requerido en salida |
| Runtime | PyTorch |
| Libreria asociada | Kumo-TS |
| Hardware compatible | NVIDIA Ampere, NVIDIA Hopper |
| Sistema operativo | Linux |
| Distribucion geografica | Global |
| Fecha de publicacion declarada | 29 de junio de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion con una red ResNet34 como componente de red. El proceso de difusion se emplea para la imputacion y reconstruccion de la serie temporal: el modelo aprende a reconstruir la senal y la discrepancia entre reconstruccion y valor observado alimenta la deteccion de anomalias. La model card cita explicitamente el trabajo ImDiffusion (arXiv:2307.00754) como referencia metodologica del enfoque de difusion, y el articulo "Segmented Confidence Sequences and Multi-Scale Adaptive Confidence Segments for Anomaly Detection in Nonstationary Time Series" (ACM) como referencia para la parte de umbralizacion adaptativa.

Segun la informacion disponible, el entrenamiento utiliza 3 millones de puntos de datos con un reparto 80/20 por conjunto de datos. La fuente principal de entrenamiento es TSB-AD-M, un benchmark con 17 conjuntos de datos publicos multivariantes que suman 198 series temporales curadas, con anomalias de tipo punto y de tipo secuencia, y con variacion en dimensionalidad, ratio de anomalias, longitud de anomalias y longitud de serie. La recoleccion y el etiquetado de esos datos son de tipo hibrido: automatico/sensores, humano y sintetico.

La innovacion declarada es doble: por un lado, la estabilizacion del entrenamiento por difusion mediante aprendizaje por curriculo, que permite manejar senales ruidosas y de alta dimension; por otro, la umbralizacion adaptativa, orientada a series no estacionarias donde la frontera entre normal y anomalo se desplaza con el tiempo. No se detalla en la informacion disponible si hubo fases de RLHF, DPO u optimizacion por preferencias, ni el numero exacto de tokens o pasos de entrenamiento mas alla del volumen de puntos de datos indicado.

## Capacidades

- Deteccion de anomalias en series temporales multivariantes, tanto anomalias puntuales como anomalias de secuencia.
- Deteccion de anomalias en datos tabulares de alta dimension (el conjunto de evaluacion de fabricacion de obleas incluye 1.558 caracteristicas de proceso anonimizadas).
- Imputacion de series temporales: el mismo mecanismo de difusion que reconstruye la senal permite rellenar valores ausentes.
- Manejo de no estacionariedad mediante umbralizacion adaptativa, pensada para senales que derivan con el tiempo.
- Procesamiento de datos de sensores con frecuencia regular (por ejemplo, una observacion cada 30 minutos).
- Salida etiquetada lista para postprocesado, con marca temporal, valor y etiqueta de anomalia.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; la entrada es numerica.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio. El modelo es especificamente de analisis de series temporales.

## Casos de uso

- Monitorizacion de sensores industriales: el modelo recibe una serie temporal multivariante de una linea de produccion y marca como anomalos los intervalos que se desvian del comportamiento reconstruido, aprovechando la umbralizacion adaptativa para no disparar falsos positivos cuando la linea cambia de regimen.
- Control de calidad en fabricacion de semiconductores: con datos tabulares de alta dimension por oblea (1.558 caracteristicas de proceso), el modelo puede etiquetar obleas anomalas y apoyar la inspeccion posterior, tal y como plantea el conjunto de evaluacion de wafer manufacturing.
- Deteccion de intrusiones en red: sobre registros de trafico de red con multiples caracteristicas, el modelo distingue trafico normal de trafico malicioso y genera etiquetas de anomalia por registro o por ventana temporal.
- Analitica de ocupacion de edificios: con conteos de personas registrados por sensores cada 30 minutos, permite detectar patrones anomalos de afluencia (picos, ausencias, cambios de horario) utiles para seguridad y planificacion de recursos.
- Mantenimiento predictivo en celulas robotizadas: sobre series multivariantes de un demostrador industrial tipo pick-and-place, detecta desviaciones de comportamiento que preceden a fallos mecanicos o a degradacion del proceso.
- Limpieza y preparacion de datos: al soportar imputacion de series temporales, se puede usar como paso previo para rellenar huecos en registros de sensores antes de alimentar otros modelos analiticos.
- Investigacion en deteccion de anomalias no estacionaria: sirve como linea base reproducible sobre TSB-AD-M para comparar metodos de difusion frente a alternativas clasicas en escenarios con deriva de distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card identifica los conjuntos de entrenamiento (TSB-AD-M) y de evaluacion (Wafer Manufacturing, CalIt2 Building People Counts, Network Traffic, Genesis Demonstrator), pero no incluye cifras de F1, precision, recall, AUC ni ninguna otra metrica, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8 millones de parametros, los pesos ocupan aproximadamente 32 MB en fp32 y unos 16 MB en fp16 (calculo derivado del numero de parametros, no publicado por el autor). El consumo real dependera del tamano de lote y de la longitud de la ventana temporal, pero es un modelo de escala muy reducida.
- GPU recomendadas: NVIDIA Ampere y NVIDIA Hopper son las microarquitecturas declaradas como compatibles. Dado el tamano del modelo, practicamente cualquier GPU NVIDIA moderna es suficiente.
- Cabe en GPU de consumo: si. Con 8 millones de parametros cabe holgadamente en cualquier GPU consumer (por ejemplo, gama RTX), e incluso podria ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: runtime PyTorch sobre Linux. La model card no menciona vLLM, llama.cpp, Ollama ni TGI; esos servidores estan orientados a modelos de lenguaje y no aplican aqui. El ecosistema de referencia es la libreria Kumo-TS.
- Latencia y throughput estimados: no disponible. No se publican cifras de latencia ni de rendimiento por segundo.

## Comparativa con modelos similares

No se dispone de datos numericos comparativos en la informacion proporcionada. La comparacion siguiente es cualitativa y limitada a lo declarado por los autores.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kumo-Anomaly (NV-Tesseract-AD) | Transformer de difusion + umbralizacion adaptativa | 8 millones | no aplica (ventana de serie temporal) | Apache 2.0 | HuggingFace (nvidia/Kumo-Anomaly) |
| ImDiffusion | Difusion para imputacion y deteccion en series temporales | no disponible | no aplica | no disponible | Referencia academica (arXiv:2307.00754) |
| Metodos clasicos de deteccion de anomalias (autoencoders, Isolation Forest, etc.) | Reconstruccion o particion estadistica | no disponible | no aplica | variable | Multiples implementaciones |
| Otros modelos de la familia TSB-AD evaluados en el benchmark | Diversos (estadisticos, deep learning) | no disponible | no aplica | no disponible | Repositorio del benchmark TSB-AD |

## Limitaciones y advertencias

- Modelo declarado por el autor exclusivamente para investigacion y desarrollo; la model card indica que no esta destinado a produccion directa sin validacion adicional con datos del caso de uso.
- Requiere preprocesado de entrada y postprocesado de salida; no es un modelo listo para consumir datos crudos sin una tuberia de preparacion.
- Entrada restringida a datos tabulares numericos con marca temporal; no procesa texto, imagen ni audio.
- El repositorio figura con 0.0 GB y 0 descargas en el momento de la consulta, y no se indica el formato de pesos; conviene verificar la disponibilidad real de los artefactos antes de planificar una integracion.
- No se publican metricas de rendimiento, tasas de falsos positivos ni curvas de evaluacion, por lo que el rendimiento real sobre datos propios es desconocido.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la etiquetacion de anomalias, especialmente en regimenes no vistos durante el entrenamiento.
- La umbralizacion adaptativa puede requerir ajuste o periodo de calibracion sobre la senal objetivo; un umbral mal calibrado degrada directamente la precision.
- Sesgos conocidos: no se documentan analisis de sesgo. Los datos de entrenamiento son de dominios concretos (sensores, industria, red) y la transferencia a otros dominios no esta garantizada.
- Idiomas: la entrada es numerica, por lo que no hay soporte multilingue ni relevancia directa del campo de idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la propia model card limita el uso declarado a investigacion y desarrollo, lo que conviene contrastar con el equipo legal antes de un despliegue comercial.
- Dependencia de hardware y software NVIDIA: el modelo esta optimizado para GPU NVIDIA y Linux; no se declara soporte para otras plataformas.
- Las fechas de publicacion y actualizacion del repositorio (2026) son posteriores a la fecha de esta ficha; verificar la vigencia de los artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Kumo-Anomaly
- Articulo ACM (Segmented Confidence Sequences and Multi-Scale Adaptive Confidence Segments for Anomaly Detection in Nonstationary Time Series): https://dl.acm.org/doi/full/10.1145/3787120.3787130
- ImDiffusion (arXiv:2307.00754): https://arxiv.org/abs/2307.00754
- Benchmark TSB-AD (TSB-AD-M): https://thedatumorg.github.io/TSB-AD/
- Conjunto de evaluacion Detecting Anomalies in Wafer Manufacturing: https://www.kaggle.com/datasets/arbazkhan971/anomaly-detection
- Conjunto de evaluacion CalIt2 Building People Counts (UCI): https://archive.ics.uci.edu/dataset/156/calit2+building+people+counts
- Conjunto de evaluacion Network Traffic Anomaly Detection: https://www.kaggle.com/datasets/ziya07/network-traffic-anomaly-detection-dataset
- Conjunto de evaluacion Genesis Demonstrator Data for Machine Learning: https://www.kaggle.com/datasets/inIT-OWL/genesis-demonstrator-data-for-machine-learning
- Sitio corporativo de NVIDIA: https://www.nvidia.com/
