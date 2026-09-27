# PierreGtch/eeg-fm-masking_jepa_r12cm_L1

## Resumen

`eeg-fm-masking_jepa_r12cm_L1` es un codificador de electroencefalografía (EEG) preentrenado, publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de uno de los 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento: 5 radios espaciales, 6 longitudes temporales y 2 marcos de preentrenamiento. Este checkpoint concreto corresponde a un marco JEPA con radio espacial de 12 cm y longitud temporal de 1 parche, y su objetivo es servir como extractor de características congelado para tareas downstream sobre señales EEG.

El modelo resuelve un problema recurrente en el dominio de las interfaces cerebro-ordenador y la neurofisiología clínica: la escasez de datos etiquetados. En lugar de entrenar un clasificador desde cero para cada tarea, el codificador produce representaciones contextuales que se pueden evaluar con una sonda lineal (regresión ridge) sobre 12 conjuntos de datos de OpenEEGBench. Con 12.692.096 parámetros, es un modelo extremadamente compacto, apto para ejecutarse incluso en CPU, lo que facilita su uso en investigación y prototipado.

La relevancia del modelo es metodológica: forma parte de una comparativa controlada que aísla el efecto de la geometría de enmascaramiento, algo poco habitual en la literatura de foundation models de EEG. Conviene señalar que el propio autor recomienda la configuración r = 9 cm, L = 2 como la mejor del estudio, por lo que este checkpoint debe entenderse como una pieza de un análisis comparativo más amplio, no como el modelo de referencia de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches (tensores `feature_encoder.*` + `model.*`), preentrenado con JEPA (joint-embedding predictive architecture) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana fija de tokens. La señal se corta en parches de 1 s (200 muestras a 200 Hz) con solape de 20 muestras; el modelo es agnóstico al montaje (cualquier numero y conjunto de canales) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica `model.safetensors` en precision de entrenamiento) |
| Idiomas soportados | No aplica: la entrada es senal EEG, no texto |
| Licencia | CC-BY-4.0 (pesos); MIT (codigo en GitHub) |
| Formato de pesos | safetensors (`model.safetensors`), acompanado de `config.json` y `metadata.json` |

Parametros de enmascaramiento declarados: framework JEPA, radio espacial r = 12 cm, longitud temporal L = 1 parche, `pct_unmasked` = 0,45, checkpoint de la epoca 10 de 10 (version `v9`, la evaluada en el paper).

## Arquitectura y entrenamiento

El modelo sigue un esquema JEPA: un predictor transforma las representaciones del contexto (parches visibles del encoder) en los embeddings que un profesor EMA genera para los parches enmascarados. A diferencia de otras variantes auto-supervisadas, el autor indica que no se emplea regularizador de varianza/covarianza. El repositorio contiene unicamente el encoder (tokenizador de parches y transformer), que es exactamente el conjunto de tensores cargado en la evaluacion downstream del paper; el predictor JEPA y el profesor EMA no se distribuyen. Los pesos publicados corresponden al encoder estudiante.

El preentrenamiento utilizo el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos pudieran redistribuirse. El regimen de entrenamiento fue de 10 epocas sobre 2 GPU H100, con batch size de 600 por GPU, learning rate de 0,00024 con warm-up de 3080 pasos y valor final de 1e-06, y weight decay de 0,01. El identificador del run de entrenamiento es `khnj6and` en Weights & Biases.

En cuanto al preprocesado, el wrapper de `eeg_fm_masking` aplica internamente un factor de escala de 1e+06 (los datos deben estar en voltios) y un escalado por ventana `median_std_clip` con recorte en sigma = 15. Las posiciones de los canales deben expresarse en metros, siguiendo el formato `info["chs"][i]["loc"][:3]` de MNE. Es importante no estandarizar los datos antes de pasarlos al modelo.

## Capacidades

- Extraccion de caracteristicas contextuales a partir de senales EEG multicanal, con pipeline declarado `feature-extraction`.
- Aprendizaje auto-supervisado sobre representaciones enmascaradas: el encoder produce embeddings utiles sin necesidad de etiquetas durante el preentrenamiento.
- Independencia del montaje: acepta cualquier numero y disposicion de electrodos, siempre que cada canal disponga de una posicion 3D.
- Clasificacion downstream mediante sonda congelada: en el paper se evalua con regresion ridge sobre las caracteristicas contextuales aplanadas, con 12 conjuntos de datos y 5 semillas.
- Regresion continua: aplicado a la tarea `seed-vig` con metrica R², ademas de clasificacion con balanced accuracy.
- Compatibilidad con OpenEEGBench a traves de `PretrainedBackbone`.
- No dispone de tool calling, function calling, capacidades de agente, multimodalidad texto-vision, modo de razonamiento explicito ni generacion de lenguaje: es un extractor de caracteristicas de senal, no un modelo generativo.

## Casos de uso

- Monitorizacion de crisis epilepticas: el modelo obtiene 0,886 ± 0,037 de balanced accuracy en `chbmit` con encoder congelado, lo que permite usarlo como extractor de caracteristicas en sistemas de deteccion de crisis sin reentrenar el backbone.
- Interfaces cerebro-ordenador para imaginacion motora: en `bcic2a` y `bcic2020-3` alcanza 0,378 y 0,272 respectivamente, valores que lo situan como punto de partida razonable para investigacion en decodificacion motora, aunque insuficientes para un producto final en esas tareas.
- Estadificacion automatica del sueno: con 0,661 ± 0,003 en `isruc-sleep`, el encoder sirve como base para pipelines de analisis nocturno de EEG donde interesa reducir el coste de etiquetado manual de hipnogramas.
- Analisis de EEG en trastornos del animo: 0,847 ± 0,002 en `mdd_mumtaz2016`, util como componente de estudios de biomarcadores de depresion a partir de senales de reposo.
- Deteccion de anomalias y artefactos en EEG clinico: 0,798 ± 0,003 en `tuab` y 0,865 ± 0,005 en `tuev` permiten usarlo en fases de control de calidad y cribado previo de registros largos.
- Experimental design en neurociencia cognitiva: 0,706 ± 0,028 en `arithmetic_zyma2019` y 0,260 ± 0,006 en `faced` permiten comparar rapidamente si las representaciones preentrenadas capturan la variable experimental de interes antes de invertir en un entrenamiento supervisado completo.
- Extraccion de caracteristicas para pipelines de investigacion reproducible: gracias al soporte de OpenEEGBench, se puede sustituir el backbone por este checkpoint y comparar contra el resto de la coleccion de 58 modelos con la misma receta de sonda.
- Prototipado en hardware modesto: al tener 12,69 M de parametros, cabe en cualquier GPU de consumo e incluso en CPU, lo que facilita demos y validaciones en entornos sin acelerador dedicado.
- Investigacion metodologica sobre preentrenamiento auto-supervisado: el checkpoint es una pieza del barrido controlado de geometrias de enmascaramiento y permite reproducir los analisis comparativos del paper.

## Benchmarks y rendimiento

Resultados downstream publicados en la model card: encoder congelado, sonda ridge sobre caracteristicas contextuales aplanadas, 12 conjuntos de datos y 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,706 ± 0,028 | 5 |
| bcic2020-3 | balanced acc. | 0,272 ± 0,007 | 5 |
| bcic2a | balanced acc. | 0,378 ± 0,013 | 5 |
| chbmit | balanced acc. | 0,886 ± 0,037 | 5 |
| faced | balanced acc. | 0,260 ± 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,661 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,847 ± 0,002 | 5 |
| physionet | balanced acc. | 0,474 ± 0,006 | 5 |
| seed-v | balanced acc. | 0,305 ± 0,001 | 5 |
| seed-vig | R² | -0,397 ± 0,191 | 5 |
| tuab | balanced acc. | 0,798 ± 0,003 | 5 |
| tuev | balanced acc. | 0,865 ± 0,005 | 5 |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51 MB en fp32 y unos 25 MB en fp16/bf16, solo para los pesos del encoder. Con activaciones, el consumo total se mantiene muy por debajo de 1 GB para lotes pequenos.
- GPU recomendadas: cualquier GPU moderna es suficiente. El modelo se entreno en 2 × H100, pero eso corresponde al preentrenamiento, no a la inferencia. Para extraccion de caracteristicas basta una GTX 1650, una RTX 3060 o incluso una iGPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en sistemas embebidos, dado su tamano de 12,69 M de parametros.
- Ejecucion en CPU: viable para tareas de inferencia por lotes, con un coste dominado por el preprocesado y la sonda downstream mas que por el propio encoder.
- Opciones de despliegue: PyTorch con `safetensors` y el paquete `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`); integracion con OpenEEGBench mediante `PretrainedBackbone`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje autorregresivo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.
- Nota de carga: el autor indica usar `strict=False` al cargar el `state_dict`, lo que deja fuera las partes dependientes del conjunto de datos (buffer de posiciones de canales y cabeza de clasificacion).

## Comparativa con modelos similares

La comparacion natural es dentro de la propia coleccion de 58 encoders del estudio, ya que comparten receta de entrenamiento y solo difieren en la geometria de enmascaramiento.

| Modelo | Framework | Geometria de mascara | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r12cm_L1 (este) | JEPA | r = 12 cm, L = 1 parche | 12,69 M | Parches de 1 s a 200 Hz, agnostico al montaje | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 parches | No disponible | Parches de 1 s a 200 Hz, agnostico al montaje | CC-BY-4.0 | HuggingFace (recomendado por el paper) |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 parches | No disponible | Parches de 1 s a 200 Hz, agnostico al montaje | CC-BY-4.0 | HuggingFace (recomendado por el paper) |

Otros foundation models de EEG existentes en la literatura (por ejemplo LaBraM, BIOT o EEGPT) no aparecen descritos en la informacion proporcionada, por lo que sus parametros, contexto y resultados no estan disponibles para una comparacion directa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, function calling ni flujos de agente. Cualquier expectativa en ese sentido es incorrecta.
- Rendimiento muy desigual segun la tarea. En `faced` (0,260) y `bcic2020-3` (0,272) el balanced accuracy es practicamente equivalente o inferior al azar, y en `seed-vig` el R² es negativo (-0,397 ± 0,191), lo que indica que las caracteristicas no capturan la variable objetivo en ese conjunto.
- Este checkpoint concreto no es la configuracion recomendada por el paper: el autor recomienda r = 9 cm, L = 2. Su uso como modelo de referencia de la familia no estaria justificado.
- Requisitos de entrada estrictos: muestreo a 200 Hz, unidades en voltios, posiciones de canales en metros y ninguna estandarizacion previa por parte del usuario. Omitir cualquiera de estos pasos degrada silenciosamente los resultados.
- Requiere que todos los canales tengan posicion 3D; no funciona con montajes sin informacion espacial.
- El repositorio contiene solo el encoder. No se distribuyen el predictor JEPA ni el profesor EMA, de modo que no se puede reproducir el preentrenamiento completo a partir de estos pesos.
- El preentrenamiento usa el subconjunto abierto del corpus REVE (323 grabaciones). Es un volumen reducido y de composicion no detallada en la model card, por lo que pueden existir sesgos de dominio (sobrerrepresentacion de determinadas patologias, edades, montajes o equipos de registro).
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y el cumplimiento de las condiciones de la licencia. El codigo se distribuye aparte bajo MIT.
- No se ha validado clinicamente. Los resultados son medidas de balanced accuracy en conjuntos de investigacion y no deben interpretarse como evidencia de aptitud diagnostica.
- Riesgo de sobreajuste al banco de evaluacion: todas las cifras proceden de una unica familia de tareas (OpenEEGBench) con la misma sonda ridge; el comportamiento en dominios nuevos o con montajes atipicos no esta documentado.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Propiedad intelectual en el dominio del EEG: aunque el modelo extraiga caracteristicas de senales cerebrales, el tratamiento de datos neuronales esta sujeto a normativas especificas (por ejemplo, proteccion de datos de categoria especial en el RGPD) que el desarrollador debe gestionar por su cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r12cm_L1
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado por el paper (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado por el paper (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/khnj6and
- Referencia bibliografica del paper: disponible en la pagina de GitHub del proyecto
