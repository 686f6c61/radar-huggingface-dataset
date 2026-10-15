# podolinsky/groot-libero-10-probe-lstm-onset-pretrain-ft

## Resumen

El modelo `groot-libero-10-probe-lstm-onset-pretrain-ft` es una sonda (probe) neuronal de deteccion de fallos en politicas roboticas, publicada por el usuario podolinsky en HuggingFace. No es un modelo de lenguaje ni un modelo de vision-lenguaje-accion (VLA) completo: es un clasificador ligero que consume caracteristicas ya extraidas por el backbone del VLA NVIDIA GR00T-N1.7 y emite una puntuacion de fallo por cada paso de politica. Su tamano es de 6.609.867 parametros (un LSTM de 256 unidades con varias cabezas), lo que lo situa en el rango de unos pocos megabytes.

El problema que resuelve es la deteccion temprana de fallos en la ejecucion de tareas de manipulacion robotica sobre el benchmark LIBERO-10 (con variantes ocluidas), de modo que un sistema pueda abortar, reintentar o pedir ayuda antes de completar una trayectoria condenada al fracaso. La entrada es un vector de 6144 dimensiones por paso de politica, resultado de concatenar las medias de los tokens de imagen base, imagen de muneca y tokens de lenguaje, todas ellas de 2048 dimensiones procedentes del backbone GR00T-N1.7.

Es relevante ahora porque la comunidad de robotica esta adoptando modelos fundacionales tipo GR00T (NVIDIA) y necesita mecanismos de seguridad y supervision baratos que no requieran reentrenar el modelo base. Esta sonda se entrena en dos etapas (preentrenamiento sobre trayectorias completas y ajuste fino sobre la ventana alrededor del onset de fallo anotado por Gemini) y produce alarmas calibradas mediante conformal prediction para controlar la tasa de falsas alarmas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de 256 unidades con cabeza de puntuacion (score), cabeza de modo de fallo y cabeza CLIP, sobre caracteristicas congeladas del backbone GR00T-N1.7 |
| Parametros totales | 6.609.867 |
| Longitud de contexto | No aplica en tokens de texto; procesa secuencialmente pasos de politica (1 paso = 8 pasos de control = 0.4 s), ventana causal sobre la trayectoria completa |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no genera lenguaje; consume tokens de lenguaje del backbone GR00T-N1.7) |
| Licencia | other (la model card indica `license: other`; no se detallan los terminos) |
| Formato de pesos | safetensors (`model.safetensors`), acompanado de `config.json`, `normalization.npz`, `thresholds.json`, `eval_task_split.json`, `EVAL.md`, `models.py` y `probe.py` |

## Arquitectura y entrenamiento

La arquitectura es un LSTM de 256 unidades que opera de forma causal sobre la secuencia de pasos de politica. La model card indica que comparte arquitectura con `lstm_onset_mode_clip`: incluye una cabeza de puntuacion (score), una cabeza de modo de fallo y una cabeza CLIP alineada semanticamente. La entrada por paso es un unico vector de 6144 dimensiones formado por la concatenacion de tres medias de 2048 dimensiones cada una: media de los 64 tokens de imagen base, media de los 64 tokens de imagen de muneca y media enmascarada de los tokens reales de lenguaje. Todas estas caracteristicas provienen del backbone GR00T-N1.7, que permanece congelado; la sonda solo aprende sobre representaciones ya extraidas.

El entrenamiento se realiza en dos etapas. Primero, un preentrenamiento sobre trayectorias completas, en el que cada paso de una rollout fallida se etiqueta como 1 y los exitos como 0. Despues, un ajuste fino sobre la ventana de mas menos 2,4 segundos alrededor del onset anotado por Gemini, recortando los fotogramas posteriores al onset (`onset_pm_cut`), con una tasa de aprendizaje de 1e-4. En tiempo de inferencia, las caracteristicas se estandarizan con la media y desviacion del split de entrenamiento (`normalization.npz`) y se lanza una alarma en el primer paso cuya puntuacion alcanza el umbral de `thresholds.json`, calibrado con conformal prediction de maximo (tasa de falsa alarma objetivo alpha). Un paso de politica equivale a 8 pasos de control, es decir, 0,4 segundos.

## Capacidades

- Deteccion de fallos en politicas roboticas: emite una puntuacion por paso y dispara alarma cuando supera un umbral calibrado.
- Clasificacion del modo de fallo: la cabeza de modo de fallo (segun la arquitectura de referencia `lstm_onset_mode_clip`, 10 clases) permite categorizar el tipo de fallo detectado.
- Alineacion semantica via CLIP: la cabeza CLIP alineada con la frase de la linea temporal permite representaciones semanticas comparables.
- Prediccion temprana: los resultados incluyen metricas de deteccion temprana (`TPR early`) antes del fallo efectivo.
- Procesamiento causal en linea: puede ejecutarse de forma causal sobre los pasos de politica conforme llegan, sin necesidad de la trayectoria completa.
- Integracion con GR00T-N1.7: consume directamente las caracteristicas del backbone del VLA, sin reentrenarlo.
- No soporta tool calling, agentes, generacion de texto, codigo, matematicas, vision directa, audio ni razonamiento multi-paso como modelo autonomo.

## Casos de uso

- Supervision en tiempo real de politicas robotizadas: la sonda recibe las caracteristicas congeladas de GR00T-N1.7 en cada paso (0,4 s) y dispara una alarma cuando la puntuacion supera el umbral, permitiendo abortar la trayectoria antes de completar una tarea condenada al fracaso.
- Reintento o replanificacion automatica: al detectar el fallo antes de su manifestacion fisica, el sistema de control puede reiniciar la tarea o pedir una nueva planificacion, reduciendo danos en el entorno y el objeto manipulado.
- Investigacion en representaciones de VLA: al ser una sonda sobre caracteristicas pooldeadas del backbone, sirve para estudiar que informacion de fallo esta presente en las representaciones de GR00T-N1.7 y en que capa o token.
- Deteccion en entornos con oclusion: el dataset asociado incluye variantes ocluidas de las tareas LIBERO, por lo que la sonda es util para evaluar robustez de la supervision bajo vision degradada.
- Control de calidad en pipelines de evaluacion robotica: se puede ejecutar en lote sobre rollouts para etiquetar automaticamente trayectorias fallidas y medir la tasa de deteccion frente a un presupuesto de falsas alarmas (alpha).
- Aprendizaje por refuerzo con filtrado de datos: la senal de fallo por paso permite descartar o ponderar trayectorias de baja calidad antes de reutilizarlas para entrenar politicas, reduciendo el coste de anotacion manual.
- Seguridad en humanoides y brazos colaborativos: como capa de seguridad independiente del modelo de politica, activa paradas o modos degradados si detecta patrones de fallo conocidos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de articulos de LIBERO-10 (seed 0; metricas promediadas sobre alpha de 0,01 a 0,30, con el valor para alpha = 0,10 entre parentesis).

| Split | TPR | TPR early | on-time TPR | LDR | FPR |
|---|---|---|---|---|---|
| Tareas vistas (held-out) | 91,4 (80,0) | 48,6 (26,7) | 11,4 (13,3) | 55,0 (80,0) | 23,8 (14,3) |
| Tareas no vistas | 73,3 (46,7) | 39,5 (3,3) | 11,0 (3,3) | 62,4 (100,0) | 30,2 (4,2) |

Definiciones: TPR = tasa de verdaderos positivos; TPR early = deteccion antes del onset; on-time TPR = deteccion en el instante correcto; LDR = tasa de deteccion tardia; FPR = tasa de falsos positivos. La tabla completa por cada valor de alpha esta en `EVAL.md`. No se dispone de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: aproximadamente 26 MB en fp32 (6,6 M de parametros) y unos 13 MB en fp16/bf16; el espacio adicional depende del tamano de las caracteristicas de entrada, no del modelo.
- GPU recomendadas: cualquiera; el modelo cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090) e incluso en GPU integradas o en CPU.
- Inferencia en CPU: perfectamente viable, ya que solo se ejecuta un LSTM de 256 unidades sobre vectores de 6144 dimensiones. No requiere acelerador dedicado.
- Memoria adicional: las caracteristicas de entrada del backbone GR00T-N1.7 (6144 dimensiones por paso de politica) son el principal consumidor de memoria; el backbone que las genera es el que exige recursos relevantes, no la sonda.
- Opciones de despliegue: el repositorio incluye `probe.py` para ejecucion directa (`pip install torch safetensors numpy; python probe.py features.npy --alpha 0.10`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles como cifras publicadas; por la naturaleza del modelo (LSTM pequeno, ejecucion causal por paso de 0,4 s) la latencia es despreciable frente al coste del backbone VLA.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| groot-libero-10-probe-lstm-onset-pretrain-ft (este) | Sonda LSTM de deteccion de fallos | 6,6 M | 6144 d por paso (GR00T-N1.7, LIBERO-10) | Preentrenamiento + ajuste fino sobre ventana de onset (`onset_pm_cut`) | other |
| podolinsky/groot-libero-x-probe-lstm-onset-post-mode | Sonda LSTM de deteccion de fallos | no disponible | Caracteristicas GR00T-N1.7, LIBERO-X level123 | Etiquetas `onset_post`: todos los pasos, etiqueta 1 desde 2,4 s antes del onset hasta el final de la rollout fallida | other |
| NVIDIA GR00T-N1.7 (backbone) | VLA fundacional para humanoides | no disponible | Entrada multimodal (imagen, estado, lenguaje); genera acciones | Entrenamiento a gran escala sobre datos diversos de robotica | NVIDIA (terminos propios) |

La comparacion directa solo es posible con el modelo hermano de la misma familia (`lstm_onset_post_mode`), ya que este tipo de sondas de deteccion de fallos no cuenta con una categoria estandarizada de alternativas publicas. No se dispone de datos de rendimiento del modelo hermano en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni un VLA: no produce texto, codigo, imagenes ni acciones; solo puntua el riesgo de fallo a partir de caracteristicas externas.
- Dependencia total del backbone: requiere que las caracteristicas de GR00T-N1.7 esten disponibles y en el mismo formato (6144 d por paso); un cambio de backbone invalida la sonda.
- Sensibilidad al umbral: el rendimiento depende fuertemente de alpha. Con alpha = 0,10 la TPR en tareas no vistas baja al 46,7 % y la deteccion temprana cae al 3,3 %, lo que limita su utilidad en escenarios que exijan bajo riesgo de falsa alarma.
- Falsos positivos no triviales: la FPR promedio en tareas vistas alcanza el 23,8 %, con 30,2 % en tareas no vistas, lo que puede provocar abortos innecesarios.
- Degradacion fuera de distribucion: el rendimiento cae notablemente al pasar de tareas vistas a no vistas, indicando escasa generalizacion a entornos nuevos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsa alarma o de clasificacion erronea del modo de fallo.
- Idiomas: no disponible; el modelo no genera lenguaje y solo consume los tokens de lenguaje del backbone, por lo que no cabe hablar de soporte multilingue.
- Licencia: `license: other`, sin terminos detallados en la model card; es imprescindible revisar las condiciones de uso comercial antes de integrarlo en produccion, y tener en cuenta los terminos de NVIDIA para el backbone GR00T-N1.7 subyacente.
- Cifras de adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de terceros.
- Repositorio con tamano declarado de 0,0 GB: verificar la integridad de los ficheros antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-10-probe-lstm-onset-pretrain-ft
- Modelo hermano (sonda `lstm_onset_post_mode`): https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-post-mode
- Dataset de caracteristicas: https://huggingface.co/datasets/podolinsky/groot-libero-10-features-v3
- Ficha del dataset en claru.ai: https://claru.ai/datasets/podolinsky-groot-libero-10-features-v3
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Articulo GR00T N1 (arXiv): https://arxiv.org/abs/2503.14734
