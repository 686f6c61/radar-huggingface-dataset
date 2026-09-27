# PierreGtch/eeg-fm-masking_jepa_rone_L8

## Resumen

eeg-fm-masking_jepa_rone_L8 es un codificador (*encoder*) preentrenado para senales de electroencefalografia (EEG), desarrollado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Es uno de los 58 codificadores entrenados con una receta identica en la que solo cambia la geometria de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos (MAE y JEPA). Este modelo concreto usa el marco JEPA con radio espacial de un canal y longitud temporal de 8 parches.

El modelo cuenta con 12.692.096 parametros (12,69 M) y su proposito es la extraccion de caracteristicas (*feature-extraction*) de EEG para su uso como *backbone* congelado en tareas posteriores, evaluado mediante regresion ridge sobre las caracteristicas contextuales. No es un modelo de lenguaje: procesa senales EEG muestreadas a 200 Hz, cortadas en parches de 1 s, y es agnostico al montaje, por lo que admite cualquier numero y conjunto de canales siempre que cada uno tenga una posicion 3D.

Es relevante ahora por su contribucion metodologica: al aislar la geometria de enmascaramiento como unica variable, permite comparar de forma controlada el efecto del diseno del enmascaramiento en modelos fundacionales de EEG, un campo con recetas heterogeneas y dificil de comparar. Su licencia CC-BY-4.0 sobre los pesos facilita la redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer con tokenizador de parches (`feature_encoder.*` + `model.*`) dentro de un marco JEPA (joint-embedding predictive architecture); no es MoE |
| Parametros totales | 12.692.096 (~12,69 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplicable en el sentido de LLM; la senal se segmenta en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de senales EEG, no de lenguaje) |
| Licencia | cc-by-4.0 (pesos); codigo MIT |
| Formato de pesos | safetensors |

Parametros de enmascaramiento: radio espacial `r` = un canal, longitud temporal `L` = 8 parches, `pct_unmasked` = 0.45. Checkpoint: epoca 10 de 10 (v9, el evaluado en el paper).

## Arquitectura y entrenamiento

La arquitectura es un JEPA: un predictor proyecta el contexto del codificador hacia los *embeddings* que un profesor EMA (*exponential moving average*) produce para los parches enmascarados, sin regularizador de varianza/covarianza. El repositorio publica unicamente el codificador (tokenizador de parches mas transformer), es decir, exactamente los tensores cargados para la evaluacion posterior del paper; el predictor JEPA y el profesor EMA no se incluyen. Para JEPA, los pesos publicados son los del codificador estudiante tal como se evaluo.

El preentrenamiento uso el subconjunto con licencia abierta del corpus REVE (323 grabaciones), de modo que los pesos puedan redistribuirse. El calendario fue de 10 epocas en 2 × H100, tamano de lote 600 por GPU, tasa de aprendizaje 0.00024 (calentamiento de 3080 pasos, valor final 1e-06) y decaimiento de peso 0.01. La entrada debe estar a 200 Hz y en voltios; el *wrapper* multiplica por 1e+06 y aplica un escalado `median_std_clip` por ventana (recorte en σ = 15), por lo que no debe estandarizarse la senal previamente. Las posiciones de canal se expresan en metros (`info["chs"][i]["loc"][:3]` de MNE).

## Capacidades

- Extraccion de caracteristicas de EEG: genera representaciones contextuales a partir de ventanas de senal EEG.
- Funciona como *backbone* congelado para sondeo lineal (ridge) o para *fine-tuning* a traves de OpenEEGBench.
- Agnosticismo al montaje: admite cualquier numero y conjunto de canales, siempre que cada canal tenga posicion 3D en metros.
- Procesamiento a 200 Hz con parches de 1 s (solapamiento de 20 muestras).
- Soporte de cuantizacion: no disponible.
- *Tool calling* / *function calling*: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicables.
- Capacidad especial: enmascaramiento con geometria controlada (r = un canal, L = 8), disenada para el estudio comparativo de geometrias.

## Casos de uso

- Deteccion de anomalias en EEG clinico: el modelo alcanza 0.809 de exactitud balanceada en el conjunto tuab, por lo que puede servir como extractor de caracteristicas para cribado de EEG anormal.
- Clasificacion de eventos epilepticos: con 0.893 de exactitud balanceada en chbmit, es adecuado para detectar crisis convulsivas a partir de caracteristicas congeladas.
- Deteccion de eventos en EEG (tuev): con 0.915 de exactitud balanceada, resulta util para tareas de clasificacion de eventos sobre senal continua.
- Clasificacion de fases del sueno (isruc-sleep): con 0.673 de exactitud balanceada, sirve de base para *pipelines* de estadificacion del sueno.
- Analisis de estados mentales y depresion (mdd_mumtaz2016): con 0.847 de exactitud balanceada, es aplicable a estudios de clasificacion de depresion mayor.
- Investigacion en interfaces cerebro-computador (bcic2a, bcic2020-3): util como extractor de caracteristicas, aunque su rendimiento en estas tareas es limitado (0.390 y 0.269).
- Comparacion metodologica de geometrias de enmascaramiento: permite reproducir y comparar de forma controlada el efecto de distintas geometrias junto a los otros 57 codificadores de la coleccion.

## Benchmarks y rendimiento

Resultados posteriores con codificador congelado y sonda ridge sobre las caracteristicas contextuales aplanadas, en 12 conjuntos × 5 semillas. Exactitud balanceada para clasificacion y R² para `seed-vig`.

| Conjunto | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0.687 ± 0.011 | 5 |
| bcic2020-3 | balanced acc. | 0.269 ± 0.028 | 5 |
| bcic2a | balanced acc. | 0.390 ± 0.004 | 5 |
| chbmit | balanced acc. | 0.893 ± 0.012 | 5 |
| faced | balanced acc. | 0.245 ± 0.006 | 5 |
| isruc-sleep | balanced acc. | 0.673 ± 0.004 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0.847 ± 0.004 | 5 |
| physionet | balanced acc. | 0.485 ± 0.003 | 5 |
| seed-v | balanced acc. | 0.308 ± 0.002 | 5 |
| seed-vig | R² | -0.261 ± 0.008 | 5 |
| tuab | balanced acc. | 0.809 ± 0.002 | 5 |
| tuev | balanced acc. | 0.915 ± 0.002 | 5 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 12,69 M de parametros): ~51 MB en fp32, ~25 MB en fp16/bf16, ~13 MB en int8. Cualquier GPU moderna, e incluso CPU, es suficiente.
- GPU recomendadas para inferencia: cualquier GPU consumer (p. ej. RTX 3060, RTX 4090) o integrada; el cuello de botella es el preprocesado de la senal EEG, no el modelo.
- GPU recomendada para reentrenamiento: la receta original uso 2 × H100 con lote de 600 por GPU.
- Cabe en GPU consumer: si, con holgura; el modelo es muy pequeno.
- Opciones de despliegue: PyTorch + safetensors a traves del *wrapper* `ContextualEncoderBenchmarkWrapper` (paquete `eeg-fm-masking`) o como `PretrainedBackbone` de OpenEEGBench. No aplican vLLM, llama.cpp, Ollama ni TGI por tratarse de un modelo de senales, no de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada describe la coleccion de 58 codificadores con receta identica y recomienda dos variantes concretas. No se ofrecen parametros ni puntuaciones de esos modelos en la informacion disponible, por lo que parte de la comparacion queda como no disponible.

| Modelo | Marco | Radio espacial r | Longitud L | Parametros | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rone_L8 (este) | JEPA | un canal | 8 | 12,69 M | ver tabla de benchmarks | cc-by-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 | no disponible | no disponible | cc-by-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 | no disponible | no disponible | cc-by-4.0 |

El paper recomienda la configuracion r = 9 cm, L = 2 por delante de la configuracion de este modelo (r = un canal, L = 8). No se dispone de comparaciones con otros modelos fundacionales de EEG en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en varias tareas: bcic2a (0.390), seed-v (0.308), bcic2020-3 (0.269) y faced (0.245) quedan cerca o por debajo del azar segun el numero de clases, lo que limita su utilidad directa en esos casos.
- Regresion de vigor (`seed-vig`): R² de -0.261, peor que predecir la media; el modelo no es adecuado para esta tarea tal cual.
- No es el modelo recomendado por el propio paper: la configuracion recomendada es r = 9 cm, L = 2, no r = un canal, L = 8.
- Solo se publican los pesos del codificador: el predictor JEPA y el profesor EMA no se incluyen, por lo que no es posible reproducir el preentrenamiento JEPA completo a partir de este repositorio.
- Requisitos estrictos de entrada: 200 Hz, unidades en voltios, sin estandarizacion previa (el *wrapper* aplica `median_std_clip` con recorte en σ = 15) y posiciones de canal en metros. Omitir estos requisitos invalida los resultados.
- Limitacion de dominio: procesa exclusivamente senales EEG; no genera texto ni soporta *tool calling*.
- Resultados medidos con codificador congelado y sonda ridge; no se documentan resultados de *fine-tuning* completo.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; el codigo es MIT.
- Sin validacion de la comunidad: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia independiente de su comportamiento fuera del paper.
- Riesgo de sesgo: no disponible (no se documenta analisis de sesgos ni composicion demografica del corpus REVE).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rone_L8
- Sitio del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado (MAE, r9cm_L2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado (JEPA, r9cm_L2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/394mrb8x
