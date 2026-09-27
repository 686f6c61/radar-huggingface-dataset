# PierreGtch/eeg-fm-masking_jepa_r6cm_L2

## Resumen

eeg-fm-masking_jepa_r6cm_L2 es un codificador de senales EEG preentrenado por Pierre Gtch (PierreGtch) con una arquitectura de prediccion de embeddings conjuntos (JEPA, joint-embedding predictive architecture). Forma parte de un estudio controlado de 58 codificadores entrenados con una receta identica en la que solo varia la geometria de enmascaramiento: 5 radios espaciales por 6 longitudes temporales por 2 marcos de trabajo (MAE y JEPA). Este checkpoint concreto corresponde a un radio espacial de 6 cm y una longitud temporal de 2 parches.

El modelo resuelve el problema de obtener representaciones genericas y transferibles de senales EEG sin necesidad de etiquetas masivas, actuando como extractor de caracteristicas congeladas que despues se evalua mediante sondas lineales (ridge) sobre 12 conjuntos de datos de OpenEEGBench. Su encodificador tiene 12,69 millones de parametros, muy por debajo de los grandes modelos de lenguaje, lo que lo situa en la categoria de modelos fundacionales ligeros para senales biomedicas.

Es relevante ahora porque el articulo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA* aisla el efecto de la geometria de enmascaramiento sobre el rendimiento downstream, algo poco habitual en la literatura de modelos fundacionales de EEG. El propio autor recomienda las variantes r = 9 cm y L = 2, por lo que este checkpoint (r = 6 cm) sirve como punto de comparacion dentro del barrido sistematico, con los pesos distribuidos en abierto bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de parches con JEPA (joint-embedding predictive architecture); tokenizador de parches mas codificador transformer |
| Parametros totales | 12.692.096 (12,69 M), solo el codificador |
| Longitud de contexto | Parches de 1 s (200 muestras a 200 Hz con solapamiento de 20 muestras); sin ventana de contexto tipo lenguaje |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (procesa senales EEG, no texto); no disponible cualquier detalle adicional |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (model.safetensors), mas config.json y metadata.json |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica factor 1e+06 y escalado median_std_clip con recorte en sigma = 15) |
| Posiciones de canales | metros (MNE info["chs"][i]["loc"][:3]) |
| Radio espacial de mascara (r) | 6 cm |
| Longitud temporal de mascara (L) | 2 parches |
| pct_unmasked | 0.45 |
| Checkpoint | epoca 10 de 10 (v9) |

## Arquitectura y entrenamiento

El modelo es un JEPA (joint-embedding predictive architecture) aplicado a EEG. Un tokenizador de parches (feature_encoder.*) segmenta la senal en parches de 1 s (200 muestras a 200 Hz con solapamiento de 20) y un transformer (model.*) produce embeddings contextuales. En el marco JEPA, un predictor proyecta el contexto del codificador hacia los embeddings que un profesor EMA genera para los parches enmascarados, sin emplear regularizador de varianza/covarianza. El repositorio publica unicamente el codificador estudiante (tokenizador mas transformer), que es exactamente el conjunto de tensores cargado en la evaluacion downstream del articulo; el predictor JEPA y el profesor EMA no se incluyen. Los pesos publicados corresponden al codificador estudiante tal y como se evaluo.

El preentrenamiento se realizo sobre el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos pudieran redistribuirse. El calendario fue de 10 epocas sobre 2 GPU H100, con tamano de lote de 600 por GPU y tasa de aprendizaje 0.00024 (calentamiento de 3080 pasos, valor final 1e-06) y decaimiento de peso 0.01. La innovacion central no es arquitectonica sino metodologica: 58 codificadores comparten receta identica y solo cambia la geometria de enmascaramiento, lo que permite atribuir diferencias de rendimiento al patron de mascara y no a otros hiperparametros.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de senales EEG: genera representaciones contextuales sobre las que se ajusta una sonda lineal.
- Modelo agnostico a la montura: admite cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros.
- Procesamiento de multiples conjuntos de datos EEG con distinta morfologia (tareas aritmeticas, BCI, deteccion de crisis, sueño, EEG en reposo, etc.).
- Clasificacion y regresion downstream con codificador congelado (balanced accuracy para clasificacion, R2 para seed-vig).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso (multi-step reasoning): es un codificador de senales.
- Capacidades multilingues: no aplicable.
- Capacidad especial: marco JEPA con predictor y profesor EMA en entrenamiento (no distribuidos en el checkpoint); la inferencia downstream usa solo el codificador.

## Casos de uso

- Deteccion de crisis epilepticas: con un codificador congelado y una sonda ridge se alcanza 0,891 de balanced accuracy en chbmit, lo que permite construir un clasificador de crisis sobre caracteristicas preentrenadas sin entrenar el codificador desde cero.
- Clasificacion de estados de sueño: en isruc-sleep obtiene 0,690 de balanced accuracy, suficiente para tareas de segmentacion de sueño apoyadas en caracteristicas contextuales.
- Interfaz cerebro-computador (BCI): en bcic2a logra 0,475 de balanced accuracy, util como punto de partida para decodificacion motora con ajuste fino.
- Analisis de carga cognitiva: en arithmetic_zyma2019 alcanza 0,647 de balanced accuracy, aplicable a estudios de carga mental a partir de EEG.
- Deteccion de anomalias en EEG clinico: en tuev obtiene 0,904 de balanced accuracy, adecuado para tareas de cribado de patrones anormales.
- Investigacion en depresion: en mdd_mumtaz2016 llega a 0,864 de balanced accuracy, lo que permite explorar biomarcadores de trastorno depresivo mayor.
- Estudio metodologico de geometria de enmascaramiento: como uno de los 58 codificadores, sirve para analizar experimentalmente que radio y longitud de mascara maximizan la transferencia a tareas downstream.
- Extraccion de caracteristicas para pipelines de aprendizaje supervisado: al ser agnostico a la montura y funcionar con codificador congelado, se integra como extractor en cualquier flujo que necesite representaciones EEG reutilizables.

## Benchmarks y rendimiento

Resultados downstream con codificador congelado y sonda ridge sobre caracteristicas contextuales aplanadas, 12 conjuntos de datos x 5 semillas. Balanced accuracy para clasificacion, R2 para seed-vig:

| Conjunto de datos | Metrica | Puntuacion (media +- sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,647 +- 0,048 | 5 |
| bcic2020-3 | balanced acc. | 0,271 +- 0,014 | 5 |
| bcic2a | balanced acc. | 0,475 +- 0,010 | 5 |
| chbmit | balanced acc. | 0,891 +- 0,015 | 5 |
| faced | balanced acc. | 0,281 +- 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,690 +- 0,002 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,864 +- 0,009 | 5 |
| physionet | balanced acc. | 0,539 +- 0,010 | 5 |
| seed-v | balanced acc. | 0,300 +- 0,003 | 5 |
| seed-vig | R2 | -0,267 +- 0,018 | 5 |
| tuab | balanced acc. | 0,806 +- 0,019 | 5 |
| tuev | balanced acc. | 0,904 +- 0,002 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) porque no son aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51 MB en FP32 y 26 MB en FP16 para los 12,69 M de parametros, mas el consumo de activaciones, que es reducido dado el tamano de los parches.
- GPU recomendadas: el modelo cabe en practicamente cualquier GPU moderna; no requiere A100 ni H100 salvo por volumen de lote o por reproducir el entorno de entrenamiento. Se puede ejecutar en GTX 1060 o superiores sin dificultad.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos 1-2 GB de VRAM, incluidas RTX 3050, RTX 4060, RTX 4090, etc.
- Opciones de despliegue: PyTorch con la libreria eeg-fm-masking, y evaluacion o ajuste fino mediante OpenEEGBench (PretrainedBackbone). No aplican servidores de inferencia de lenguaje como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con las variantes recomendadas por el autor dentro del mismo estudio (misma receta, distinta geometria de mascara):

| Modelo | Marco | Radio espacial r | Longitud temporal L | Parametros | Licencia |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r6cm_L2 (este) | JEPA | 6 cm | 2 parches | 12,69 M (codificador) | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible (misma receta, 12,69 M segun el estudio) | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible (misma receta, 12,69 M segun el estudio) | CC-BY-4.0 |

El propio articulo recomienda r = 9 cm y L = 2, tanto en JEPA como en MAE, por lo que este checkpoint (r = 6 cm) es una variante de comparacion dentro del barrido. No se dispone de tablas comparativas de rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el corpus de preentrenamiento es el subconjunto de licencia abierta de REVE (323 grabaciones), por lo que la diversidad de poblaciones y monturas esta limitada por esa seleccion.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje generativo, pero las representaciones extraidas pueden ser poco informativas en tareas muy alejadas del preentrenamiento; por ejemplo, seed-vig presenta un R2 negativo (-0,267), lo que indica un rendimiento peor que la prediccion de la media.
- Limitaciones de contexto o de idioma: no hay contexto linguistico; la senal debe muestrearse a 200 Hz, expresarse en voltios y acompanarse de posiciones de canal en metros. El modelo no estandariza los datos por si mismo, y hacerlo previamente alteraria el resultado porque el wrapper ya aplica factor 1e+06 y median_std_clip.
- Restricciones de licencia: los pesos se distribuyen bajo CC-BY-4.0, que permite uso comercial con atribucion; el codigo esta bajo MIT. Es necesario citar el articulo al reutilizar los pesos.
- Caveats para produccion: el repositorio solo contiene el codificador (no el predictor JEPA ni el profesor EMA), por lo que no es posible reanudar el preentrenamiento JEPA con estos pesos. Dado que no se incluye la cabeza de clasificacion ni el buffer de posiciones de canal, la carga debe hacerse con strict=False. El numero de descargas y likes registrados en el momento de redactar la ficha es 0, lo que limita la validacion por parte de la comunidad. No se han publicado datos de cuantizacion, latencia ni throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r6cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Pagina del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo en GitHub (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Registro de entrenamiento en Weights & Biases (ejecucion 6ikegvah): https://wandb.ai/pierregtch/chan-inv-clf/runs/6ikegvah
- Variante JEPA recomendada: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante MAE recomendada: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
