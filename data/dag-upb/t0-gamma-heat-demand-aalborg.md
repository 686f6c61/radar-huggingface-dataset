# DAG-UPB/t0-gamma-heat-demand-aalborg

## Resumen

t0-gamma-heat-demand-aalborg es un adaptador LoRA para el modelo fundacional de series temporales t0-gamma (de The Forecasting Company), ajustado por el grupo DAG-UPB de la Universidad de Paderborn para la previsión de demanda de calor horaria en edificios residenciales conectados a la red de calefacción de distrito de Aalborg (Dinamarca). El adaptador resuelve un problema concreto: la predicción de demanda térmica a 24 horas vista, tanto a nivel de contador individual como agregada (pseudo-distritos y suma de toda la red), incorporando temperatura exterior y un indicador de día laborable como covariables futuras conocidas.

El repositorio contiene únicamente el adaptador LoRA (11 MB, 2.752.512 parámetros entrenables); los pesos de t0-gamma permanecen congelados y deben descargarse por separado para cargar el modelo. El adaptador corresponde al modelo denominado t0-gamma-FT† en el artículo *Does Fine-Tuning Time Series Foundation Models on Smart Heat Meters Pay Off for Heat Demand Forecasting?* (Meyer, Albers, Müller; Universidad de Paderborn), donde la daga indica resultados preliminares.

Es relevante ahora porque cuantifica empíricamente cuánto aporta el ajuste fino de un modelo fundacional de series temporales en un dominio concreto (contadores de calor inteligentes): una reducción del MASE del 2,7 % en contadores individuales, del 11,5 % en la suma de todos los contadores y del 8,6 % en los pseudo-distritos frente a t0-gamma en modo zero-shot con la misma entrada meteorológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre t0-gamma (modelo fundacional de series temporales); LoRA en capas de atención (`wQKV`, `wO`) y feed-forward (`mlp.0`, `mlp.2`) |
| Parametros totales | Adaptador: 2.752.512 parámetros entrenables (96 módulos); total del modelo base no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 horas de contexto; horizonte de 24 horas |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; cuantizaciones del modelo base no especificadas) |
| Idiomas soportados | No aplica (modelo de series temporales, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base t0-gamma |

## Arquitectura y entrenamiento

El adaptador se aplica sobre t0-gamma, un modelo fundacional de previsión de series temporales de The Forecasting Company. El ajuste fino emplea LoRA con rango 8, alpha 16 y dropout 0,05 sobre las capas de atención (`wQKV`, `wO`) y feed-forward (`mlp.0`, `mlp.2`), lo que da 96 módulos y 2.752.512 parámetros entrenables, con los pesos del modelo base congelados. El entrenamiento se implementó con un bucle propio en PyTorch, ya que el paquete `tfc-t0` no incluye entrenador.

Los datos provienen de 3.021 contadores de calor inteligentes de Aalborg con resolución horaria (dataset de Schaffer et al. 2022, CC BY 4.0). Se construyeron 4.033 series de entrenamiento: los 3.021 contadores, 11 pseudo-distritos más la suma de todos los contadores, y 1.000 sumas de contadores elegidos aleatoriamente (de 10 contadores al total, con distribución log-uniforme). El periodo de entrenamiento es 2018-2019 (series cortadas el 2020-01-01) y 2020 es el año de test. Las covariables son `t_ambient_c` (temperatura exterior ERA5, en °C) e `is_working_day` (0/1), conocidas para las horas de previsión. La pérdida es pinball sobre nueve cuantiles (0,1 a 0,9) dividida por la escala estacional de cada ventana (scaled quantile loss, SQL). El entrenamiento consistió en 4.000 pasos de 64 ventanas (acumulación de gradiente en 4 partes), AdamW sin weight decay, tasa de aprendizaje 1e-3 con decaimiento lineal a 0, sin warm-up, clipping de gradiente a 1,0, fp32 y semilla 20261022. Se ejecutó en una NVIDIA TITAN RTX durante 2,6 horas (9.342 s) con un pico de 7,7 GB de memoria GPU. La tasa de aprendizaje (1e-4 o 1e-3) y el número de pasos (250 a 4.000) se seleccionaron sobre 2019 (validación con 300 contadores, SQL medio).

## Capacidades

- Previsión probabilística de demanda de calor horaria a 24 horas con nueve cuantiles (0,1 a 0,9).
- Previsión tanto de contadores individuales como de agregados (pseudo-distritos y suma de toda la red), ya que las sumas se incluyeron explícitamente en el entrenamiento.
- Uso de covariables futuras conocidas: temperatura exterior (`t_ambient_c`) e indicador de día laborable (`is_working_day`).
- Soporte de las utilidades del modelo base t0: promediado simétrico (`symmetric_averaging=True`) y recorte a no negativos (`clip_nonnegative=True`) en la predicción.
- Inferencia en CPU con reproducción de las previsiones de test del artículo dentro de 1e-5 kWh.
- No dispone de capacidades de texto, código, visión, tool calling ni agentes; su ámbito es exclusivamente la previsión de series temporales.

## Casos de uso

- Previsión operativa de demanda en una red de calefacción de distrito: el modelo genera la curva horaria a 24 horas con intervalos cuantílicos para planificar la producción de calor y el despacho de plantas, usando temperatura exterior prevista y calendario laboral.
- Programación de la carga de acumuladores térmicos y calderas: con la previsión por contador o por distrito se puede desplazar la producción a horas de menor coste o menor factor de emisión, aprovechando el horizonte de 24 horas y los nueve cuantiles para dimensionar márgenes.
- Detección de anomalías y comparación contador a contador: la previsión individual por contador permite comparar la demanda observada con la esperada y detectar consumos anómalos, fugas o fallos de medición en edificios concretos.
- Planificación de compras de energía y cobertura: los cuantiles 0,1 y 0,9 de la suma de la red sirven para fijar escenarios de compra y cobertura con una banda de incertidumbre, siempre que se calibren previamente (véanse limitaciones).
- Investigación sobre ajuste fino de modelos fundacionales de series temporales: el adaptador sirve como referencia reproducible para estudiar la transferencia de t0-gamma a dominios de energía con covariables exógenas.
- Prototipado de servicios de previsión para agregadores de edificios: al admitir lotes de series (`n_series`) y sumas arbitrarias, se puede desplegar un servicio que prediga carteras de edificios de una misma red con un único modelo.
- Evaluación de estrategias de calibración de intervalos: dado el comportamiento sobreconfiado en agregados, el adaptador es útil como caso de estudio para aplicar y validar recalibración de intervalos antes de usar las bandas en decisiones operativas.

## Benchmarks y rendimiento

Los resultados del artículo se resumen en la reducción del MASE frente a t0-gamma en modo zero-shot con la misma entrada meteorológica, sobre el año de test 2020:

| Ambito de evaluacion | Reduccion de MASE vs. t0-gamma zero-shot |
|---|---|
| Contadores individuales | 2,7 % |
| Suma de todos los contadores | 11,5 % |
| Pseudo-distritos | 8,6 % |

Cobertura de los intervalos del 80 %:

| Ambito de evaluacion | Cobertura observada |
|---|---|
| Contadores individuales | 81 % |
| Suma de todos los contadores | 65 % |
| Pseudo-distritos | 71 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 11 MB; el consumo depende del modelo base t0-gamma, cuyo tamaño no se detalla en la información disponible. El entrenamiento del adaptador usó un pico de 7,7 GB en una TITAN RTX, lo que da una referencia del orden de magnitud para el modelo base en fp32 con lotes de 64 ventanas.
- GPU recomendadas: NVIDIA TITAN RTX (usada en el entrenamiento); cualquier GPU con al menos ~8 GB para inferencia con lotes moderados, a falta de datos específicos del modelo base.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más, aunque no se dispone de mediciones publicadas para inferencia.
- Opciones de despliegue: PyTorch con `peft` y el paquete `tfc-t0` (versión 0.6.0 en el entrenamiento); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El artículo confirma que la inferencia en CPU reproduce las previsiones de test hechas en GPU dentro de 1e-5 kWh, pero sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t0-gamma-heat-demand-aalborg (este) | Adaptador LoRA de 2,75 M sobre t0-gamma | 2.048 h contexto / 24 h horizonte | Demanda de calor, Aalborg | Apache-2.0 | Hugging Face |
| t0-gamma (base, zero-shot) | No disponible | No disponible en la informacion | Series temporales generales | Apache-2.0 | Hugging Face |
| Ajuste fino local sobre datos propios | Depende del esquema | Depende | Red o edificios locales | Segun datos | Requiere entrenamiento |

La comparación relevante del artículo es contra t0-gamma zero-shot: el ajuste fino mejora el MASE un 2,7 % en contadores individuales, un 11,5 % en la suma total y un 8,6 % en pseudo-distritos. En redes distintas (Flensburg, Helsinki) la ganancia no se transfiere, por lo que la alternativa práctica es usar t0-gamma zero-shot o ajustar sobre datos locales.

## Limitaciones y advertencias

- Resultados preliminares: los datos de preentrenamiento de t0-gamma no son públicos y no se puede descartar fuga de información con datos de Aalborg o de 2020; el artículo marca todos los resultados de t0-gamma con daga (†).
- Intervalos demasiado estrechos en agregados: la cobertura del 80 % cae al 65 % en la suma de todos los contadores y al 71 % en pseudo-distritos, pese a estar calibrada en contadores individuales (81 %). Es necesario recalibrar los intervalos antes de usarlos en decisiones.
- Sin transferencia: la mejora no se mantiene en otras redes y edificios (Flensburg, Helsinki); en esos casos hay que usar t0-gamma zero-shot o ajustar con datos locales.
- Dominio muy acotado: entrenado con edificios residenciales de una sola ciudad danesa y tres años de datos (2018-2019), con test en 2020.
- Covariables "oráculo": en el artículo las covariables de las horas de previsión son observaciones meteorológicas, no previsiones; en producción la precisión dependerá de la calidad de la predicción meteorológica.
- Dependencia del modelo base: el repositorio solo contiene el adaptador; sin t0-gamma no se puede cargar, y los términos de la licencia Apache-2.0 aplican conjuntamente según `LICENSE` y `NOTICE`.
- Sin capacidades de texto ni multilingües: no es un modelo de lenguaje y no admite prompts en lenguaje natural.
- No se han identificado sesgos sociales específicos en la información disponible, pero el rendimiento puede degradarse en edificios con patrones de consumo distintos a los residenciales de Aalborg.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DAG-UPB/t0-gamma-heat-demand-aalborg
- Modelo base t0-gamma: https://huggingface.co/theforecastingcompany/t0-gamma
- Dataset de contadores de calor de Aalborg (Schaffer et al. 2022): https://zenodo.org/records/6563114
- Artículo del dataset: https://doi.org/10.1038/s41597-022-01502-3
- Artículo de referencia (Meyer, Albers, Müller; Universidad de Paderborn): preprint, enlace no disponible en la información proporcionada
