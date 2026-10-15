# podolinsky/groot-libero-10-probe-lstm-onset-mode-clip

## Resumen

El modelo `podolinsky/groot-libero-10-probe-lstm-onset-mode-clip` no es un modelo de lenguaje generativo, sino una **sonda de detección de fallos** para políticas robóticas de tipo VLA (vision-language-action). Lo publica el usuario `podolinsky` y está diseñado para operar sobre las características internas del backbone GR00T-N1.7 de NVIDIA evaluado en las tareas de manipulación del benchmark LIBERO-10 (con variantes ocluidas). Con 6.609.867 parámetros, su función es lanzar una alarma cuando la política está a punto de fallar, no generar texto ni acciones.

La sonda recibe un vector de 6.144 dimensiones por cada paso de política —media de los 64 tokens de imagen base, media de los 64 tokens de imagen de muñeca y media enmascarada de los tokens de lenguaje real, cada bloque de 2.048 dimensiones— y lo procesa de forma causal con una LSTM de 256 unidades. Sobre esa representación añade tres cabezas: una de puntuación de fallo, otra de clasificación del modo de fallo en 10 clases y una tercera de alineación semántica (64 dimensiones) entrenada con InfoNCE contra el embedding CLIP PCA-64 de la frase que describe la línea temporal.

Su relevancia es acotada pero específica: es una pieza de infraestructura para investigación en seguridad y monitorización de políticas robóticas, con calibración conformal del umbral para fijar una tasa de falsa alarma objetivo. El repositorio no registra descargas ni likes, y solo se han publicado resultados para una única semilla (seed 0) sobre el split de artículo de LIBERO-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM causal de 256 unidades con tres cabezas (puntuacion de fallo, modo de fallo de 10 clases, semantica CLIP de 64 dimensiones) |
| Parametros totales | 6.609.867 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no hay ventana fija; la LSTM procesa de forma causal una secuencia variable de pasos de politica (un paso = 8 pasos de control = 0,4 s) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors`; no hay versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (consume la media enmascarada de tokens de lenguaje del backbone, pero el autor no especifica idiomas) |
| Licencia | other (etiquetada como `license:other`; no se detallan los terminos) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Entrada | Un vector de 6.144 dimensiones por paso de politica (2048 base + 2048 muneca + 2048 lenguaje) |
| Salida | Puntuacion de fallo, etiqueta de modo de fallo (10 clases) y embedding semantico de 64 dimensiones |
| Artefactos adicionales | `config.json`, `normalization.npz`, `thresholds.json`, `eval_task_split.json`, `EVAL.md`, `models.py`, `probe.py` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente ligera: una LSTM causal de 256 unidades que consume una proyeccion de 6.144 dimensiones y se ejecuta paso a paso sobre la secuencia de la politica. El grueso del parametraje corresponde a la matriz de entrada de la LSTM (4 x 256 x (6.144 + 256 + 1) = 6.554.624 pesos, aproximadamente el 99 % del total), mientras que las tres cabezas y los sesgos explican el resto. Las tres cabezas son: (1) una cabeza de puntuacion que produce el valor comparado contra el umbral, (2) una cabeza de modo de fallo con 10 clases, y (3) una cabeza semantica de 64 dimensiones alineada mediante InfoNCE con el embedding CLIP PCA-64 de la frase de la linea temporal. Este tercer objetivo actua como regularizacion representacional: fuerza a la sonda a retener informacion semantica sobre lo que esta ocurriendo, no solo una senal binaria de fallo.

El entrenamiento usa etiquetas de tipo `onset`: la etiqueta vale 1 durante los 2,4 s previos al inicio del fallo detectado por Gemini y el rollout se corta en ese instante. Por tanto, la sonda aprende a anticipar, no solo a diagnosticar a posteriori. Los datos de entrenamiento proceden del split de articulo de LIBERO-10 con variantes ocluidas, semilla 0. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este tipo de sonda). La calibracion del umbral se realiza con un procedimiento conformal de maximizacion para fijar una tasa de falsa alarma objetivo `alpha`, cuyos valores se guardan en `thresholds.json`.

## Capacidades

- Deteccion causal de fallos en politicas VLA: emite una alarma en el primer paso cuya puntuacion supera el umbral calibrado.
- Clasificacion del modo de fallo en 10 clases, lo que permite agrupar los fallos por tipo y no solo detectarlos.
- Alineacion semantica con la descripcion textual de la linea temporal mediante un embedding de 64 dimensiones (objetivo InfoNCE contra CLIP PCA-64).
- Procesamiento causal paso a paso: no utiliza informacion futura, por lo que es apto para monitorizacion en linea.
- Calibracion conformal con tasa de falsa alarma configurable por el parametro `alpha` (por ejemplo, 0,10).
- Estandarizacion reproducible mediante `normalization.npz` con media y desviacion tipica calculadas sobre el split de entrenamiento.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso en el sentido de los LLM, ni capacidades multimodales propias: depende enteramente de las caracteristicas que le entrega el backbone GR00T-N1.7.

## Casos de uso

- **Parada de seguridad durante rollouts de manipulacion**: la sonda se ejecuta sobre las caracteristicas del backbone a cada paso (0,4 s) y activa una senal de aborto cuando la puntuacion supera el umbral, con una ventana de anticipacion de 2,4 s respecto al inicio del fallo tal y como se define en el entrenamiento.
- **Curacion automatica de datasets de robotica**: antes de reentrenar una politica, se filtran los episodios fallidos usando la alarma de la sonda, reduciendo el coste de inspeccion manual de videos y mejorando la calidad del conjunto de imitacion.
- **Evaluacion automatica en simulacion (LIBERO)**: sustituir la revision manual de rollouts por una metrica objetiva de deteccion temprana, agregando TPR, FPR y tasa de deteccion a tiempo sobre cientos de episodios.
- **Monitorizacion en despliegue sim-to-real**: al ser una red de 6,6 M de parametros, puede correr en paralelo a la politica sin competir de forma significativa por recursos de computo, algo critico en bucles de control en tiempo real.
- **Disparador de recuperacion o replanificacion**: cuando la sonda detecta el inicio de un fallo, un orquestador puede lanzar una politica de recuperacion, una reobservacion o una peticion de intervencion humana, en lugar de esperar al fallo completo.
- **Investigacion en representaciones del backbone GR00T-N1.7**: las cabezas actuan como sondas lineales/no lineales que permiten estudiar que informacion sobre estados de fallo esta presente en las caracteristicas internas del VLM (Cosmos-Reason2-2B) que sirve de backbone.
- **Analisis agregado de modos de fallo**: la cabeza de 10 clases permite construir histogramas de tipos de fallo por tarea, util para priorizar mejoras en la politica o en el entorno.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de articulo de LIBERO-10 (semilla 0). Los valores son el promedio sobre `alpha` en el rango 0,01–0,30 y, entre parentesis, el valor con `alpha` = 0,10.

| Condicion | TPR | TPR early | on-time TPR | LDR | FPR |
|---|---|---|---|---|---|
| Tareas vistas retenidas | 76,2 (86,7) | 56,2 (53,3) | 21,9 (26,7) | 50,0 (55,6) | 18,4 (19,0) |
| Tareas no vistas | 63,3 (83,3) | 36,2 (43,3) | 10,0 (16,7) | 51,1 (60,0) | 27,5 (24,2) |

La model card no define las siglas LDR ni los criterios exactos de "temprano" y "a tiempo", por lo que no se reproducen definiciones que no constan en la informacion disponible. El autor remite a `EVAL.md` para la tabla completa por valor de `alpha`. No se han publicado en la informacion disponible comparaciones con otros detectores de fallo ni resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no son aplicables a este modelo.

## Requisitos de hardware

- **Peso de la sonda**: con 6,6 M de parametros, ocupa aproximadamente 26,4 MB en FP32 y 13,2 MB en FP16. La inferencia cabe holgadamente en CPU y en cualquier GPU consumer.
- **Dependencia critica**: la sonda no procesa imagenes ni lenguaje directamente; necesita las caracteristicas del backbone GR00T-N1.7 (familia Cosmos-Reason2-2B VLM, segun la ficha del dataset asociado). El coste real de computo esta en ese backbone, no en la sonda.
- **GPU recomendadas**: para la sonda, cualquiera (o directamente CPU). Para extraer caracteristicas del backbone, se requiere una GPU con VRAM suficiente para un modelo de la familia 2B en precision completa o media; no se publica una cifra oficial de VRAM en la informacion disponible.
- **Consumer GPU**: si, la sonda cabe en cualquier GPU de consumo e incluso en equipos sin GPU. El backbone asociado tambien es de escala reducida (2B), por lo que en principio cabe en GPU de consumo de gama alta, aunque no se documenta la huella de memoria concreta.
- **Opciones de despliegue**: el autor proporciona un script propio (`probe.py`) que depende de `torch`, `safetensors` y `numpy`, invocado como `python probe.py features.npy --alpha 0.10`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo con formato de pesos de LLM.
- **Latencia y throughput**: no se publican mediciones de latencia de la sonda. La resolucion temporal del sistema es de un paso por cada 8 pasos de control, es decir, 0,4 s.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con detectores de fallo de terceros. Si existen dos variantes hermanas del mismo autor, orientadas a otro conjunto de tareas (LIBERO-X nivel 123, split por tarea):

| Modelo | Conjunto de datos | Variante de arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| `groot-libero-10-probe-lstm-onset-mode-clip` | LIBERO-10 + oclusiones, split de articulo, seed 0 | LSTM con cabezas de modo + CLIP | 6.609.867 | secuencia causal de pasos de politica | other |
| `groot-libero-x-probe-lstm-onset-post-mode` | LIBERO-X nivel 123, split por tarea | LSTM variante "post" con cabeza de modo | no disponible | no disponible | other |
| `groot-libero-x-probe-lstm-onset-mha` | LIBERO-X nivel 123, split por tarea | LSTM variante con atencion multi-cabeza (MHA) | no disponible | no disponible | other |

Las diferencias de rendimiento entre estas tres variantes no se pueden establecer con la informacion disponible, ya que solo se ha detallado la tabla de resultados del modelo descrito en esta ficha.

## Limitaciones y advertencias

- **No es un modelo generativo**: no produce texto, codigo ni acciones; solo puntuaciones y etiquetas de fallo. Cualquier uso como modelo de lenguaje seria un error de interpretacion.
- **Dependencia total del backbone**: sin las caracteristicas del backbone GR00T-N1.7, la sonda no funciona. Un cambio de version del backbone, de la politica o del pipeline de extraccion invalida los pesos y la normalizacion.
- **Tasa de falsa alarma elevada**: el FPR reportado es del 18–19 % en tareas vistas y del 24–27 % en tareas no vistas, lo que limita su uso directo como mecanismo de seguridad sin una capa de confirmacion adicional.
- **Deteccion a tiempo baja**: el `on-time TPR` es del 21,9 % (26,7 % con `alpha` = 0,10) en tareas vistas y del 10,0 % (16,7 %) en no vistas; muchas alarmas llegan antes de la ventana objetivo, lo que puede generar intervenciones prematuras.
- **Validacion limitada a una unica semilla**: los resultados corresponden a seed 0 y a un unico split; no se documenta varianza entre semillas ni validacion cruzada.
- **Dominio restringido**: entrenado y evaluado en tareas de manipulacion de LIBERO-10 con oclusiones. No hay evidencia de transferencia a otros robots, morfologias, tareas o dominios visuales.
- **Riesgo de falso negativo**: en tareas no vistas el TPR baja al 63,3 % de media, es decir, una fraccion relevante de fallos no se detecta.
- **Restricciones de licencia**: la licencia es `other` y no se detallan los terminos en la model card; antes de un uso comercial hay que aclarar las condiciones con el autor.
- **Sin validacion independiente**: el repositorio registra 0 descargas y 0 likes, por lo que no existen replicaciones ni auditorias externas publicadas.
- **Reproducibilidad**: el uso correcto exige respetar `normalization.npz` y `thresholds.json`; aplicar la estandarizacion con estadisticos distintos a los del split de entrenamiento degrada la calibracion del umbral.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-10-probe-lstm-onset-mode-clip
- Variante hermana (LIBERO-X, "post-mode"): https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-post-mode
- Variante hermana (LIBERO-X, atencion multi-cabeza): https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-mha
- Dataset de caracteristicas del backbone GR00T-N1.7 LIBERO-10: https://claru.ai/datasets/podolinsky-groot-libero-10-features-v3
- Ficha del autor en SAVRN: https://savrn.com/model-publishers/podolinsky
