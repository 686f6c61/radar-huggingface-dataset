# PierreGtch/eeg-fm-masking_jepa_rone_L2

## Resumen

eeg-fm-masking_jepa_rone_L2 es un codificador de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de uno de los 58 codificadores entrenados con una receta idéntica en la que únicamente varía la geometría de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo). Este checkpoint concreto corresponde a la configuración JEPA con radio espacial de un canal y longitud temporal de 2 parches.

El modelo tiene 12.692.096 parámetros y adopta una arquitectura de tipo JEPA (joint-embedding predictive architecture): un predictor proyecta las representaciones del contexto producidas por el codificador hacia las representaciones que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. La entrada es señal EEG a 200 Hz, troceada en parches de 1 s, con posiciones de canal en metros. El modelo es agnóstico al montaje: funciona con cualquier número y conjunto de canales siempre que cada uno tenga una posición 3D.

Su relevancia radica en que forma parte de una evaluación controlada y reproducible del efecto de la geometría de enmascaramiento sobre el rendimiento en tareas downstream, evaluada con OpenEEGBench sobre 12 conjuntos de datos. Los pesos se distribuyen bajo licencia CC-BY-4.0, entrenados sobre un subconjunto de licencia abierta del corpus REVE para poder redistribuirlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (`feature_encoder.*`) y codificador transformer (`model.*`); marco JEPA con predictor y profesor EMA (no incluidos en el repo) |
| Parametros totales | 12.692.096 (12,69 M) |
| Longitud de contexto | no disponible en tokens; ventana de senal EEG a 200 Hz con parches de 1 s (200 muestras, solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (modelo de senal EEG, no de lenguaje) |
| Licencia | CC-BY-4.0 (pesos); MIT (codigo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un tokenizador de parches (`feature_encoder.*`) con un codificador transformer (`model.*`). En el marco JEPA, un predictor transforma las representaciones del contexto del codificador en las representaciones que un profesor EMA produce para los parches enmascarados, sin emplear regularizador de varianza/covarianza. Esta configuración usa un radio espacial de enmascaramiento `r` de un canal, una longitud temporal `L` de 2 parches y un `pct_unmasked` de 0,45. El checkpoint publicado corresponde a la época 10 de 10 (identificador `v9`, el evaluado en el artículo). En el repo solo se incluyen el codificador y el tokenizador, es decir, exactamente los tensores cargados para la evaluación downstream; el predictor JEPA y el profesor EMA no se distribuyen.

El preentrenamiento utilizó el subconjunto de licencia abierta del corpus REVE (323 grabaciones), lo que permite redistribuir los pesos. El calendario fue de 10 épocas sobre 2 GPU H100, con tamaño de lote de 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3080 pasos, valor final 1e-06) y decaimiento de peso de 0,01. La entrada exige una frecuencia de muestreo de 200 Hz; la senal se corta en parches de 1 s (200 muestras con solapamiento de 20 muestras) y el wrapper multiplica por un factor de 1e+06 aplicando después un escalado por ventana `median_std_clip` (recorte en σ = 15), por lo que no debe estandarizarse la senal previamente.

## Capacidades

- Extraccion de caracteristicas: genera representaciones contextuales de senal EEG (pipeline `feature-extraction`).
- Agnosticismo de montaje: admite cualquier numero y conjunto de canales, siempre que cada canal tenga posicion 3D en metros (MNE `info["chs"][i]["loc"][:3]`).
- Aprendizaje autosupervisado: representaciones preentrenadas sin etiquetas, pensadas para transferencia a tareas downstream.
- Evaluacion y ajuste fino: integrable con OpenEEGBench mediante `PretrainedBackbone` como backbone congelado o para fine-tuning.
- Clasificacion y regresion downstream: resultados publicados con sonda ridge sobre caracteristicas contextuales aplanadas (precisión balanceada para clasificacion, R² para regresion).
- No dispone de generacion de texto, razonamiento, codigo, vision, tool calling, agentes, capacidades multilingues ni modo de pensamiento: es un codificador de senal biomedica.

## Casos de uso

- Deteccion de anomalias en EEG clinico: el modelo puede actuar como extractor de caracteristicas congeladas para clasificar fragmentos de senal (por ejemplo, en `tuev` alcanza 0,928 ± 0,024 de precision balanceada), integrándose en pipelines de cribado donde la anotacion experta es escasa.
- Monitorizacion de sueno: con una puntuacion de 0,662 ± 0,003 en `isruc-sleep`, sirve para estadificar fases del sueno a partir de registros polisomnograficos usando una sonda ligera sobre las caracteristicas congeladas.
- Deteccion de crisis epilepticas: los 0,884 ± 0,051 de precision balanceada en `chbmit` lo hacen util como base para sistemas de alerta en monitorizacion prolongada de pacientes.
- Investigacion en interfaces cerebro-computador: en tareas de imaginacion motora (`bcic2a`, 0,406 ± 0,013; `bcic2020-3`, 0,277 ± 0,010) puede emplearse como inicializacion para fine-tuning especifico del sujeto, reduciendo los datos etiquetados necesarios.
- Deteccion de depresion a partir de EEG: con 0,842 ± 0,008 en `mdd_mumtaz2016`, es adecuado como extractor de caracteristicas en estudios de biomarcadores psiquiatricos.
- Pretraining y transferencia en neurociencia computacional: al entrenarse sobre el subconjunto de licencia abierta de REVE (323 grabaciones), permite reproducir experimentos y redistribuir derivados sin restricciones adicionales de datos.
- Comparacion metodologica de geometrias de enmascaramiento: al formar parte de un conjunto de 58 codificadores con receta identica, permite aislar el efecto de `r` y `L` en el rendimiento downstream, util para disenar futuros esquemas de preentrenamiento en EEG.

## Benchmarks y rendimiento

Resultados publicados en la model card (OpenEEGBench, codificador congelado + sonda ridge sobre caracteristicas contextuales aplanadas; 12 conjuntos de datos × 5 semillas; precision balanceada para clasificacion, R² para `seed-vig`):

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,695 ± 0,010 | 5 |
| bcic2020-3 | balanced acc. | 0,277 ± 0,010 | 5 |
| bcic2a | balanced acc. | 0,406 ± 0,013 | 5 |
| chbmit | balanced acc. | 0,884 ± 0,051 | 5 |
| faced | balanced acc. | 0,261 ± 0,009 | 5 |
| isruc-sleep | balanced acc. | 0,662 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,842 ± 0,008 | 5 |
| physionet | balanced acc. | 0,534 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,318 ± 0,003 | 5 |
| seed-vig | R² | -0,358 ± 0,009 | 5 |
| tuab | balanced acc. | 0,796 ± 0,015 | 5 |
| tuev | balanced acc. | 0,928 ± 0,024 | 5 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no son aplicables a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51 MB en fp32, 26 MB en fp16 y 13 MB en int8, dado el tamano de 12,69 M de parametros.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se realizo sobre 2 × H100, pero la inferencia del codificador es trivial para hardware mucho menor (por ejemplo, RTX 3090, RTX 4090, A100 o incluso GPUs de gama de entrada).
- Cabe sin problema en GPU de consumo e incluso en CPU. El cuello de botella real suele ser el preprocesado de senal (carga de registros EEG, calculo de posiciones de canal), no el modelo.
- Opciones de despliegue: PyTorch nativo mediante `ContextualEncoderBenchmarkWrapper` (paquete `eeg-fm-masking`, instalable con `pip install git+https://github.com/PierreGtch/eeg-fm-masking`), carga de pesos con `safetensors`, e integracion con OpenEEGBench a traves de `PretrainedBackbone`. No se documentan despliegues via vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Este modelo forma parte de una familia de 58 codificadores entrenados bajo receta identica, variando solo la geometria de enmascaramiento. El articulo recomienda `r = 9 cm` y `L = 2`, lo que corresponde a las variantes `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`. El modelo descrito aqui usa `r = one channel`, por lo que no coincide con la configuracion recomendada.

| Modelo | Marco | Radio `r` | Longitud `L` | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rone_L2 (este) | JEPA | un canal | 2 parches | 12,69 M | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | 12,69 M (receta identica) | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | 12,69 M (receta identica) | CC-BY-4.0 | HuggingFace |
| Otros codificadores EEG de la familia | MAE / JEPA | 5 radios distintos | 6 longitudes distintas | 12,69 M (receta identica) | CC-BY-4.0 | Coleccion HuggingFace de 58 modelos |

No se dispone en la informacion proporcionada de las puntuaciones downstream de las variantes `r9cm`, por lo que la comparativa de rendimiento entre configuraciones queda como "no disponible" en esta ficha.

## Limitaciones y advertencias

- Modelo de extraccion de caracteristicas, no generativo: no produce texto, no soporta tool calling ni agentes, y no debe tratarse como un LLM.
- Requisito estricto de entrada: frecuencia de muestreo de 200 Hz, unidades en voltios y posiciones de canal en metros. No debe estandarizarse la senal antes de pasarla al wrapper, ya que este aplica su propio escalado (`median_std_clip`, recorte en σ = 15). Omitir estos requisitos degrada las representaciones.
- Sesgos y variabilidad entre sujetos: los resultados downstream varian mucho entre conjuntos de datos (desde 0,261 en `faced` hasta 0,928 en `tuev`), lo que indica sensibilidad al dominio y a la tarea. Un rendimiento bajo en una tarea concreta no implica fallo general del modelo, pero exige validacion previa.
- Rendimiento negativo en regresion: `seed-vig` obtiene un R² de -0,358 ± 0,009, lo que sugiere que el codificador con sonda ridge no captura bien esta senal objetivo en su forma actual.
- Configuracion no recomendada por los autores: este checkpoint usa `r = one channel`, mientras que el articulo recomienda `r = 9 cm`. Para uso en produccion conviene evaluar la variante recomendada.
- Riesgo de sobreajuste al corpus: el preentrenamiento usa 323 grabaciones del subconjunto de licencia abierta de REVE, un volumen relativamente pequeno que puede limitar la generalizacion a otros equipos, montajes o poblaciones.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion y el cumplimiento de las condiciones de cita del articulo y del repositorio.
- El repo no incluye el predictor JEPA ni el profesor EMA; solo el codificador evaluado. Reentrenar o reutilizar el marco completo requiere consultar el codigo del proyecto.
- Alucinacion: no aplica en el sentido de modelos generativos, pero las representaciones pueden producir predicciones incorrectas en tareas fuera de la distribucion de preentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rone_L2
- Coleccion de los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Codigo: https://github.com/PierreGtch/eeg-fm-masking
- Web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Run de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/fb8blr82
- Variante recomendada MAE r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
