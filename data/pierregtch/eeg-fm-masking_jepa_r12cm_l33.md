# PierreGtch/eeg-fm-masking_jepa_r12cm_L33

## Resumen

eeg-fm-masking_jepa_r12cm_L33 es un codificador de senales EEG preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch dentro del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo forma parte de una familia de 58 codificadores entrenados con una receta identica en la que solo varia la geometria de enmascaramiento (5 radios espaciales x 6 longitudes temporales x 2 marcos de trabajo); esta variante concreta usa el marco JEPA con radio espacial de 12 cm y longitud temporal de 33 parches.

La arquitectura es un transformer encoder de 12,69 millones de parametros que tokeniza la senal EEG en parches de 1 segundo. JEPA (joint-embedding predictive architecture) entrena un predictor que mapea las representaciones del contexto a los embeddings que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. El modelo esta disenado para extraccion de caracteristicas (feature-extraction) sobre senales EEG crudas y es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que cada uno tenga una posicion 3D.

Su relevancia radica en que se libera con licencia CC-BY-4.0 y pesos redistribuibles (entrenado sobre el subconjunto de licencia abierta del corpus REVE, 323 registros), lo que permite reproducir y comparar de forma controlada el efecto de la geometria de enmascaramiento en modelos fundacionales de EEG. Los resultados publicados en OpenEEGBench con el encoder congelado y una sonda ridge cubren 12 tareas de clasificacion y regresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches; preentrenamiento JEPA (predictor + profesor EMA) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No es contexto de texto: ventanas EEG divididas en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras); esta variante enmascara 33 parches temporales con radio espacial de 12 cm y `pct_unmasked` 0,45 |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | No aplica (modelo de senales EEG; no procesa lenguaje) |
| Licencia | CC-BY-4.0 (codigo bajo MIT) |
| Formato de pesos | safetensors (encoder unicamente: tokenizador `feature_encoder.*` + transformer `model.*`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma JEPA: un encoder procesa los parches visibles del contexto y un predictor transforma sus embeddings para aproximarlos a los que produce un profesor EMA sobre los parches enmascarados. A diferencia de MAE, no se reconstruye la senal en el espacio de entrada, sino que se predicen representaciones latentes, y no se emplea regularizador de varianza/covarianza. El repositorio contiene solo el encoder estudiantil evaluado en el paper; el predictor y el profesor EMA no se distribuyen. El tokenizador divide la senal en parches de 1 s (200 muestras a 200 Hz con 20 muestras de solapamiento) y el wrapper aplica escalado por ventana `median_std_clip` (clip en sigma = 15) tras multiplicar por un factor de 1e+06, por lo que los datos deben entregarse en voltios y sin estandarizar previamente.

El preentrenamiento uso el subconjunto de licencia abierta del corpus REVE (323 registros) para permitir la redistribucion de los pesos. La receta fue identica para los 58 modelos de la familia: 10 epocas, 2 x H100, tamano de lote 600 por GPU, tasa de aprendizaje 0,00024 con warm-up de 3080 pasos y decaimiento final hasta 1e-06, y weight decay 0,01. Esta variante corresponde al checkpoint de la epoca 10 de 10 (version `v9`, la evaluada en el paper) y la ejecucion de entrenamiento queda identificada como `m9jztpss` en Weights & Biases.

## Capacidades

- Extraccion de caracteristicas (feature-extraction) de senales EEG crudas como backbone congelado o para ajuste fino.
- Clasificacion y regresion downstream mediante sonda ridge sobre las caracteristicas contextuales aplanadas.
- Modelo agnostico al montaje: funciona con cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D en metros (`info["chs"][i]["loc"][:3]`).
- Entrada especifica: senales a 200 Hz, en voltios, cortadas en parches de 1 s (200 muestras, 20 de solapamiento).
- No soporta generacion de texto, codigo, matematicas, vision, tool calling ni razonamiento multi-paso: es un encoder de senales, no un modelo de lenguaje.
- No dispone de modo thinking, capacidades de audio ni de agentes.

## Casos de uso

- Deteccion de crisis epilepticas: sobre el dataset chbmit obtiene 0,866 de balanced accuracy con el encoder congelado, lo que permite usarlo como extractor de caracteristicas en sistemas de alerta clinica.
- Monitorizacion de anomalias EEG: en tuev alcanza 0,933 de balanced accuracy, adecuado como base para cribado automatizado de eventos anormales.
- Deteccion de depresion: en mdd_mumtaz2016 logra 0,813, util como caracteristica previa a un clasificador ligero en estudios neuropsiquiatricos.
- Clasificacion de sueno: en isruc-sleep obtiene 0,720, aplicable a pipelines de estadificacion del sueno a partir de registros EEG.
- Deteccion de anormalidad general: en tuab consigue 0,812, integrable en herramientas de triaje de registros clinicos.
- Investigacion sobre aprendizaje autosupervisado en EEG: al formar parte de una familia de 58 modelos con receta controlada, permite aislar el efecto de la geometria de enmascaramiento en tareas downstream.
- Ajuste fino como backbone: puede inicializar clasificadores especificos con pocos datos etiquetados, dado su bajo coste computacional (12,69 M de parametros).

## Benchmarks y rendimiento

Resultados publicados en OpenEEGBench con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 datasets x 5 semillas; balanced accuracy para clasificacion y R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,661 ± 0,064 | 5 |
| bcic2020-3 | balanced acc. | 0,259 ± 0,015 | 5 |
| bcic2a | balanced acc. | 0,450 ± 0,008 | 5 |
| chbmit | balanced acc. | 0,866 ± 0,035 | 5 |
| faced | balanced acc. | 0,289 ± 0,007 | 5 |
| isruc-sleep | balanced acc. | 0,720 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,813 ± 0,024 | 5 |
| physionet | balanced acc. | 0,552 ± 0,008 | 5 |
| seed-v | balanced acc. | 0,298 ± 0,001 | 5 |
| seed-vig | R² | -0,159 ± 0,012 | 5 |
| tuab | balanced acc. | 0,812 ± 0,001 | 5 |
| tuev | balanced acc. | 0,933 ± 0,030 | 5 |

## Requisitos de hardware

- Inferencia muy ligera: 12,69 M de parametros; el repositorio completo ocupa 0,1 GB, por lo que los pesos en safetensors son del orden de decenas de MB.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para extraccion de caracteristicas a pequena escala.
- VRAM estimada para inferencia: por debajo de 1 GB en fp32 para el encoder (no disponible una cifra oficial; calculo a partir del numero de parametros).
- Entrenamiento de referencia: 2 x H100 con lote de 600 por GPU durante 10 epocas.
- Opciones de despliegue: PyTorch mediante la libreria `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y el wrapper `ContextualEncoderBenchmarkWrapper`; integracion con OpenEEGBench a traves de `PretrainedBackbone`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

El paper recomienda como configuracion optima r = 9 cm y L = 2, correspondiente a las variantes `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`. La comparacion directa con las mismas metricas no esta disponible en la informacion proporcionada.

| Modelo | Marco | Radio r | Longitud L | Parametros | Licencia | Benchmarks |
|---|---|---|---|---|---|---|
| este modelo (jepa_r12cm_L33) | JEPA | 12 cm | 33 | 12,69 M | CC-BY-4.0 | Ver tabla anterior |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 | no disponible | CC-BY-4.0 | no disponible |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 | no disponible | CC-BY-4.0 | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni realiza razonamiento, tool calling o tareas de agentes.
- Rendimiento desigual entre tareas: varios datasets quedan cerca del azar o por debajo (bcic2020-3 0,259; faced 0,289; seed-v 0,298), y `seed-vig` presenta un R² negativo (-0,159), lo que indica un ajuste peor que la media.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al depender de la composicion del corpus REVE (323 registros), el rendimiento puede no generalizar a otras poblaciones o montajes.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero las caracteristicas extraidas pueden inducir clasificaciones erroneas en tareas fuera de distribucion.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios y posiciones de canal en metros; el wrapper aplica su propio escalado, por lo que estandarizar los datos antes del modelo produce resultados incorrectos.
- Solo se distribuye el encoder; el predictor y el profesor EMA de JEPA no estan incluidos, lo que impide reanudar el preentrenamiento tal cual.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero exige citar el paper y respetar la licencia MIT del codigo asociado.
- No se han publicado cuantizaciones oficiales; el uso en produccion requiere convertir los pesos manualmente si se necesita menor precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r12cm_L33
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo fuente (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Ejecucion de entrenamiento en W&B: https://wandb.ai/pierregtch/chan-inv-clf/runs/m9jztpss
