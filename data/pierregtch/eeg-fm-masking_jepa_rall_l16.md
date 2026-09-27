# PierreGtch/eeg-fm-masking_jepa_rall_L16

## Resumen

eeg-fm-masking_jepa_rall_L16 es un codificador de electroencefalograma (EEG) preentrenado de 12.692.096 parámetros, publicado por PierreGtch como parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento. El modelo emplea el marco JEPA (joint-embedding predictive architecture): un predictor proyecta el contexto del codificador hacia los embeddings que produce un profesor EMA para los parches enmascarados, sin regularizador de varianza/covarianza. Se trata de un modelo de extracción de características (feature-extraction), no de un modelo generativo, y su propósito es servir como backbone congelado para tareas downstream de EEG.

El modelo resuelve un problema concreto de la investigación en foundation models de EEG: determinar empíricamente qué geometría de enmascaramiento (radio espacial y longitud temporal) funciona mejor. En esta variante concreta el enmascaramiento abarca todos los canales (r = all) y 16 parches temporales (L = 16), con una fracción de parches desenmascarados de 0,45. Sus autores recomiendan, sin embargo, la configuración r = 9 cm y L = 2, disponible en los checkpoints hermanos, por lo que esta variante es interesante sobre todo como punto de comparación dentro del estudio controlado.

Es relevante ahora porque el estudio publica los pesos de forma abierta bajo CC-BY-4.0 y porque el corpus de preentrenamiento se restringió al subconjunto con licencia abierta del corpus REVE (323 grabaciones), lo que permite redistribuir los pesos. El modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada canal tenga una posición 3D en metros, y opera a una frecuencia de muestreo fija de 200 Hz con parches de 1 s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches para EEG; preentrenamiento auto-supervisado con marco JEPA (predictor + profesor EMA) |
| Parametros totales | 12.692.096 (12,69 M) en el checkpoint publicado (solo codificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en terminos de tokens de texto; la entrada se corta en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) y la ventana total `n_times` es configurable por el usuario |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en precision completa; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica (modelo de senales EEG, no procesa texto) |
| Licencia | CC-BY-4.0 para los pesos; el codigo del repositorio GitHub es MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |
| Framework | PyTorch (paquete `eeg_fm_masking`); compatible con OpenEEGBench |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | Voltios (el wrapper multiplica por 1e+06 y aplica escalado `median_std_clip` con recorte en sigma = 15) |
| Posiciones de canales | Metros (`info["chs"][i]["loc"][:3]` de MNE) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El checkpoint publicado contiene exclusivamente el codificador: el tokenizador de parches (`feature_encoder.*`) y el transformer (`model.*`), que son exactamente los tensores cargados en la evaluacion downstream del articulo. El predictor JEPA y el profesor EMA no se incluyen; en el caso de JEPA los pesos publicados son los del codificador estudiante, tal y como se evaluo en el articulo. El codificador recibe la senal a 200 Hz troceada en parches de 1 s (200 muestras con un solapamiento de 20 muestras) y es agnostico al montaje: funciona con cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D en metros, lo que lo hace independiente del sistema internacional 10-20.

El preentrenamiento uso el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El calendario fue de 10 epocas sobre 2 GPU H100, con tamano de lote de 600 por GPU, tasa de aprendizaje de 0,00024 (calentamiento de 3080 pasos, valor final 1e-06) y decaimiento de pesos de 0,01. El checkpoint publicado corresponde a la epoca 10 de 10 (version `v9`, la evaluada en el articulo), con identificador de ejecucion `em0csd3m` en Weights & Biases. La innovacion del trabajo no es un componente arquitectonico nuevo, sino el diseno experimental: 58 codificadores entrenados con receta identica en los que solo cambian 5 radios espaciales de enmascaramiento, 6 longitudes temporales y 2 marcos (MAE y JEPA).

## Capacidades

- Extraccion de caracteristicas de senales EEG: genera embeddings contextuales por parche a partir de ventanas multicanales.
- Aprendizaje auto-supervisado sin etiquetas: util como backbone congelado en tareas downstream.
- Clasificacion mediante sonda lineal: los articulos evaluan el codificador congelado y una regresion ridge sobre las caracteristicas contextuales aplanadas.
- Regresion sobre senales EEG: la tarea `seed-vig` se evalua con R², lo que indica soporte para objetivos continuos.
- Independencia de montaje: admite cualquier numero y disposicion de canales con posicion 3D, sin reentrenamiento por cambio de montaje.
- Procesamiento de ventanas de duracion variable: `n_times` se define en el wrapper, por lo que la ventana temporal no esta fijada por el modelo.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Vision, audio o modo "thinking": no disponible; el modelo solo procesa EEG.

## Casos de uso

- Deteccion de crisis epilepticas: es el escenario donde el modelo obtiene su mejor resultado publicado (0,889 ± 0,012 de exactitud balanceada en `chbmit`), por lo que puede usarse como extractor de caracteristicas congelado para un clasificador de crisis en monitorizacion de larga duracion.
- Clasificacion de estados de sueno: con 0,594 ± 0,002 en `isruc-sleep`, sirve como base para estadiaje automatico del sueno, aunque requiere fine-tuning o sondas mas potentes para uso clinico.
- Deteccion de depresion a partir de EEG en reposo: 0,771 ± 0,002 en `mdd_mumtaz2016` lo hace util como primer extractor en estudios de biomarcadores de trastorno depresivo mayor.
- Deteccion de anomalias en EEG clinico (`tuev`, 0,925 ± 0,007): adecuado para triaje de registros y senalizacion de segmentos anormales antes de la revision por un neurofisiologo.
- Investigacion en geometria de enmascaramiento: al formar parte de una coleccion de 58 checkpoints con receta identica, permite aislar el efecto del radio espacial y la longitud temporal del enmascaramiento en el rendimiento downstream, sin confundir variables.
- Extraccion de caracteristicas para clasificadores ligeros en dispositivos con pocos recursos: con 12,69 M de parametros el modelo cabe en CPU y en cualquier GPU consumer, lo que facilita su uso como front-end fijo en un pipeline con una sonda ridge entrenada aparte.
- Evaluacion comparativa con OpenEEGBench: se integra directamente mediante `PretrainedBackbone` y el wrapper `ContextualEncoderBenchmarkWrapper`, lo que permite reproducir las 12 tareas del banco (5 semillas) con pocas lineas de codigo.
- Preentrenamiento inicial para fine-tuning en dominios EEG especificos: al ser agnostico al montaje y aceptar 200 Hz, sirve como inicializacion para BCI, neurofeedback o interfaces de decodificacion motora cuando hay pocas etiquetas.

## Benchmarks y rendimiento

Resultados downstream publicados en la model card: codificador congelado, sonda ridge sobre caracteristicas contextuales aplanadas, 12 conjuntos de datos y 5 semillas. Exactitud balanceada para clasificacion y R² para `seed-vig`.

| Conjunto de datos | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,696 ± 0,011 | 5 |
| bcic2020-3 | exactitud balanceada | 0,287 ± 0,005 | 5 |
| bcic2a | exactitud balanceada | 0,295 ± 0,010 | 5 |
| chbmit | exactitud balanceada | 0,889 ± 0,012 | 5 |
| faced | exactitud balanceada | 0,163 ± 0,004 | 5 |
| isruc-sleep | exactitud balanceada | 0,594 ± 0,002 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,771 ± 0,002 | 5 |
| physionet | exactitud balanceada | 0,338 ± 0,014 | 5 |
| seed-v | exactitud balanceada | 0,283 ± 0,000 | 5 |
| seed-vig | R² | -0,764 ± 0,007 | 5 |
| tuab | exactitud balanceada | 0,745 ± 0,017 | 5 |
| tuev | exactitud balanceada | 0,925 ± 0,007 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K), ya que el modelo no es un modelo de lenguaje. Tampoco se incluyen comparaciones numericas con otros backbones de EEG dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 51 MB en FP32 y unos 25 MB en FP16; con activaciones y lotes grandes conviene reservar entre 1 y 2 GB de VRAM, dependiendo de `n_chans` y `n_times`.
- GPU recomendadas: no se especifica un minimo. Cualquier GPU con mas de 2 GB de memoria es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para inferencia por lotes pequenos o extraccion de caracteristicas offline.
- Hardware usado en entrenamiento: 2 × H100, con tamano de lote de 600 por GPU durante 10 epocas.
- Opciones de despliegue: PyTorch con el paquete `eeg_fm_masking` (clone desde GitHub mediante `pip install git+https://github.com/PierreGtch/eeg-fm-masking`), carga de pesos con `safetensors`, y evaluacion o fine-tuning a traves de OpenEEGBench (`PretrainedBackbone` + `ContextualEncoderBenchmarkWrapper`). No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un codificador de EEG.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota de integracion: `strict=False` al cargar el `state_dict` deja fuera las partes dependientes del conjunto de datos (buffer de posiciones de canales y cabeza de clasificacion), que deben construirse para cada tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Marco | Enmascaramiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rall_L16 (este) | 12,69 M | JEPA | r = all, L = 16, pct_unmasked = 0,45 | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | No disponible (misma receta, mismos parametros de codificador segun la coleccion) | JEPA | r = 9 cm, L = 2 | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | No disponible (misma receta) | MAE | r = 9 cm, L = 2 | CC-BY-4.0 | HuggingFace |
| Otros backbones de EEG (tipo LaBraM, BIOT, EEGPT) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

Los dos checkpoints recomendados explicitamente por los autores del articulo son `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`; el modelo de esta ficha (r = all, L = 16) es la variante que enmascara todos los canales, un regimen mas agresivo dentro del mismo estudio controlado. La coleccion completa incluye 58 codificadores.

## Limitaciones y advertencias

- Rendimiento cercano al azar en varias tareas: `faced` (0,163), `seed-v` (0,283), `bcic2020-3` (0,287), `bcic2a` (0,295) y `physionet` (0,338) se situan en niveles que deben interpretarse con cautela segun el numero de clases de cada conjunto.
- R² negativo en `seed-vig` (-0,764): el modelo predice peor que la media del objetivo, por lo que no es adecuado para esa tarea sin fine-tuning.
- No es la configuracion recomendada por los autores: el articulo recomienda r = 9 cm y L = 2, no r = all con L = 16; usar esta variante como opcion por defecto contradice la conclusion del estudio.
- Solo contiene el codificador: no incluye el predictor JEPA ni el profesor EMA, por lo que no se puede reproducir el preentrenamiento ni la fase auto-supervisada con este repositorio.
- Frecuencia de muestreo fija: los datos deben remuestrearse a 200 Hz; otras frecuencias requieren preprocesado externo.
- Requisitos de entrada estrictos: unidades en voltios, sin estandarizacion previa (el wrapper aplica el factor 1e+06 y `median_std_clip`), y todos los canales deben tener posicion 3D en metros.
- No es un modelo generativo ni de lenguaje: no admite prompting, tool calling, agentes ni tareas multimodales fuera del EEG.
- Riesgo de sesgo por corpus: el preentrenamiento usa 323 grabaciones del subconjunto abierto de REVE, lo que limita la diversidad de poblaciones, dispositivos y patologias representadas.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion y el cumplimiento de las condiciones de cita del articulo; el codigo se rige por MIT, una licencia distinta de la de los pesos.
- Zero adopcion publica en el momento de los datos: 0 descargas y 0 "likes", sin validacion externa por parte de la comunidad.
- La sonda ridge congelada no refleja el techo del modelo: los resultados tabulados proceden de una sonda lineal, y el fine-tuning completo podria cambiar el orden relativo entre tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rall_L16
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Codigo del proyecto: https://github.com/PierreGtch/eeg-fm-masking
- Sitio web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Checkpoint recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/em0csd3m
