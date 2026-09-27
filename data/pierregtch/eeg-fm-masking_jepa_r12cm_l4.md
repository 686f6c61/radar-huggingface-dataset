# PierreGtch/eeg-fm-masking_jepa_r12cm_L4

## Resumen

eeg-fm-masking_jepa_r12cm_L4 es un encoder de electroencefalograma (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo pertenece a una familia de 58 encoders entrenados con una receta identica en la que solo varia la geometria de enmascaramiento: 5 radios espaciales, 6 longitudes temporales y 2 marcos de trabajo (MAE y JEPA). Esta variante concreta usa JEPA con radio espacial de 12 cm y longitud temporal de 4 parches.

La arquitectura es una JEPA (joint-embedding predictive architecture): un predictor proyecta las representaciones del contexto del encoder hacia las representaciones que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. El encoder tiene 12,69 millones de parametros (12.692.096 exactos) y el repositorio distribuye unicamente el encoder, no el predictor ni el profesor. El modelo es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada electrodo tenga una posicion 3D en metros.

Su relevancia practica es doble. Por un lado, sirve como extractor de caracteristicas congelado para 12 tareas de OpenEEGBench, donde alcanza desde 0,926 de exactitud balanceada en tuev hasta valores cercanos al azar (0,274 en bcic2020-3) o un R² negativo de -0,165 en seed-vig. Por otro, es una pieza de un estudio controlado: el propio autor recomienda la configuracion r = 9 cm y L = 2, no la de esta ficha, lo que convierte a este checkpoint en un punto de comparacion del barrido mas que en la variante recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (joint-embedding predictive architecture) sobre un encoder transformer con patch tokeniser; el predictor y el profesor EMA solo existen durante el preentrenamiento |
| Parametros totales | 12.692.096 (12,69 M), solo encoder |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplicable en el sentido de contexto de lenguaje; la entrada se corta en parches de 1 s (200 muestras a 200 Hz, con solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica `model.safetensors` en la precision original, sin variantes GGUF, AWQ, GPTQ ni cuantizaciones documentadas |
| Idiomas soportados | no aplicable; la entrada son senales EEG, no texto, y el autor no declara idiomas |
| Licencia | CC-BY-4.0 para los pesos; el codigo del repositorio GitHub asociado es MIT |
| Formato de pesos | safetensors (`model.safetensors`) mas `config.json` y `metadata.json` |
| Framework de enmascaramiento | JEPA |
| Radio espacial de mascara (r) | 12 cm |
| Longitud temporal de mascara (L) | 4 parches |
| Parametro del masker (`pct_unmasked`) | 0,45 |
| Checkpoint publicado | epoca 10 de 10 (`v9`, el evaluado en el articulo) |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica factor 1e6 y escalado `median_std_clip` con recorte en sigma = 15) |
| Corpus de preentrenamiento | subconjunto con licencia abierta del corpus REVE (323 grabaciones) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una arquitectura de prediccion conjunta de embeddings (JEPA) aplicada a senales EEG. El encoder combina un patch tokeniser (`feature_encoder.*`) y un transformer (`model.*`); los tensores publicados en `model.safetensors` son exactamente los que se cargan en la evaluacion downstream del articulo. Durante el preentrenamiento, un predictor mapea las representaciones del contexto hacia las representaciones que produce un profesor EMA para los parches enmascarados, sin emplear regularizadores de varianza y covarianza. El checkpoint distribuido corresponde al encoder estudiante. Los detalles concretos de profundidad, numero de cabezas y dimension del modelo no se detallan en la informacion disponible.

El preentrenamiento uso el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos pudieran redistribuirse. El calendario fue de 10 epocas sobre 2 GPU H100, con tamano de lote de 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3080 pasos hasta 1e-06 final) y decaimiento de peso 0,01. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por instrucciones, algo coherente con un modelo de extraccion de caracteristicas y no generativo.

La innovacion metodologica del trabajo es el barrido controlado de geometrias de enmascaramiento: 5 radios espaciales por 6 longitudes temporales por 2 marcos, todos con receta identica. Este checkpoint ocupa la celda r = 12 cm, L = 4 parches, con un 45 % de parches sin enmascarar. El articulo recomienda sin embargo r = 9 cm y L = 2, disponibles en los checkpoints `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`.

## Capacidades

- Extraccion de caracteristicas EEG: genera representaciones contextuales a partir de senales en bruto de 200 Hz, aptas para sondas lineales congeladas o ajuste fino.
- Clasificacion de tareas EEG variadas: el autor evalua 12 conjuntos de OpenEEGBench que cubren crisis epilepticas, anomalias clinicas, estadios de sueno, decodificacion motora, cargas aritmeticas, reconocimiento facial y estados de reposo.
- Independencia de montaje: acepta cualquier numero y disposicion de canales, siempre que cada canal tenga una posicion 3D en metros; no esta atado a un sistema 10-20 concreto.
- Adaptacion al dominio mediante ajuste fino: la carga con `strict=False` deja fuera el buffer de posiciones de canal dependiente del conjunto de datos y la cabeza de clasificacion, que se pueden reentrenar.
- Analisis continuo y de ventana: al segmentar en parches de 1 s con solapamiento de 20 muestras, permite procesar grabaciones largas de forma deslizante.
- Integracion con OpenEEGBench: expone la clase `ContextualEncoderBenchmarkWrapper` y la interfaz `PretrainedBackbone` para evaluacion estandarizada.
- No dispone de generacion de texto, razonamiento simbolico, codigo, vision, audio, tool calling ni capacidades de agente; es un encoder de senales, no un modelo de lenguaje.

## Casos de uso

- Deteccion de crisis epilepticas: con 0,895 de exactitud balanceada en chbmit y 0,926 en tuev, el encoder congelado mas una sonda ridge puede servir como primera etapa de cribado en monitorizacion prolongada de unidades de cuidados intensivos neurologicos.
- Deteccion de anomalias en EEG clinico: los 0,811 de exactitud balanceada en tuab lo hacen util para prefiltrar registros sospechosos antes de la revision por un neurofisiologo, reduciendo el volumen de lectura manual.
- Clasificacion de estadios de sueno: 0,699 en isruc-sleep permite construir un pipeline de puntuacion automatica de sueno a partir de polisomnografia, con margen para mejorar mediante ajuste fino del encoder completo.
- Apoyo al diagnostico de depresion: 0,856 en mdd_mumtaz2016 lo hace candidato para estudios de biomarcadores electrofisiologicos de trastorno depresivo mayor, siempre como herramienta de investigacion y no de diagnostico autonomo.
- Decodificacion de carga cognitiva: 0,738 en arithmetic_zyma2019 permite usos en interfaces neuroadaptativas que estimen esfuerzo mental en tareas de calculo o formacion.
- Interfaces cerebro-computador: con 0,393 en bcic2a, es adecuado como base para experimentacion en decodificacion motora, asumiendo que requiere ajuste fino para superar el rendimiento de referencia.
- Extraccion de caracteristicas para neurociencia: al ser un extractor congelado, permite generar embeddings para analisis estadisticos posteriores, agrupamiento de sujetos o busqueda de similitud entre registros sin entrenar nada.
- Comparacion metodologica reproducible: dado que existen 58 checkpoints con receta identica, este modelo sirve para evaluar el efecto de la geometria de enmascaramiento sobre el rendimiento downstream, aislando esa variable.

## Benchmarks y rendimiento

Resultados publicados por el autor con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas, 12 conjuntos de datos y 5 semillas. Se reporta exactitud balanceada salvo en `seed-vig`, donde se reporta R².

| Conjunto de datos | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,738 ± 0,032 | 5 |
| bcic2020-3 | exactitud balanceada | 0,274 ± 0,009 | 5 |
| bcic2a | exactitud balanceada | 0,393 ± 0,003 | 5 |
| chbmit | exactitud balanceada | 0,895 ± 0,009 | 5 |
| faced | exactitud balanceada | 0,285 ± 0,006 | 5 |
| isruc-sleep | exactitud balanceada | 0,699 ± 0,002 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,856 ± 0,007 | 5 |
| physionet | exactitud balanceada | 0,500 ± 0,009 | 5 |
| seed-v | exactitud balanceada | 0,300 ± 0,004 | 5 |
| seed-vig | R² | -0,165 ± 0,014 | 5 |
| tuab | exactitud balanceada | 0,811 ± 0,004 | 5 |
| tuev | exactitud balanceada | 0,926 ± 0,035 | 5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, porque el modelo no procesa texto. Tampoco se proporcionan en esta ficha las puntuaciones de los otros 57 checkpoints de la coleccion, ni comparaciones numericas contra MAE con la misma geometria r = 12 cm y L = 4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51 MB en FP32 (12,69 M de parametros a 4 bytes), unos 25 MB en FP16/BF16 y unos 13 MB en int8. El coste dominante en produccion sera el lote de senales y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; H100 o A100 estan sobredimensionadas para inferencia y solo se justifican para reentrenamiento o ajuste fino a gran escala. Una RTX 4090, una RTX 3090 o incluso una GTX 1660 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, e incluso en CPU o en dispositivos embebidos. El entrenamiento original uso 2 x H100 con lotes de 600 por GPU.
- Opciones de despliegue: PyTorch con el wrapper `ContextualEncoderBenchmarkWrapper` del repositorio `eeg-fm-masking`, y la interfaz `PretrainedBackbone` de OpenEEGBench para evaluacion. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto; los pesos se cargan con `safetensors.torch.load_file`.
- Requisitos de preprocesado: instalacion de MNE para disponer de `info["chs"]` con posiciones en metros, remuestreo a 200 Hz y datos sin estandarizar previamente (el wrapper aplica el factor 1e6 y el escalado `median_std_clip`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Geometria de mascara | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r12cm_L4 (este) | 12,69 M (encoder) | JEPA, r = 12 cm, L = 4, pct_unmasked 0,45 | parches de 1 s a 200 Hz | CC-BY-4.0 | HuggingFace, 0 descargas |
| eeg-fm-masking_jepa_r9cm_L2 | 12,69 M (encoder) | JEPA, r = 9 cm, L = 2 | parches de 1 s a 200 Hz | CC-BY-4.0 | HuggingFace, configuracion recomendada por el articulo |
| eeg-fm-masking_mae_r9cm_L2 | 12,69 M (encoder) | MAE, r = 9 cm, L = 2 | parches de 1 s a 200 Hz | CC-BY-4.0 | HuggingFace, configuracion recomendada por el articulo |
| Otros modelos fundacionales de EEG de la literatura (por ejemplo LaBraM, BIOT, EEGPT o CBraMod) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con los dos checkpoints hermanos es limpia porque comparten arquitectura, receta de entrenamiento y presupuesto de parametros: la unica diferencia es la geometria de enmascaramiento y el marco (MAE frente a JEPA). Los resultados numericos de esos dos checkpoints no se incluyen en la informacion disponible, por lo que no se puede cuantificar aqui la ventaja de la configuracion recomendada.

## Limitaciones y advertencias

- No es un modelo generativo ni de lenguaje: no produce texto, no razona, no escribe codigo y no soporta tool calling, agentes ni multimodalidad. Cualquier uso en esos ambitos seria un error de aplicacion.
- El repositorio publica solo el encoder. El predictor JEPA y el profesor EMA no se distribuyen, de modo que no es posible reproducir el preentrenamiento a partir de estos pesos.
- La carga requiere `strict=False`, porque el buffer de posiciones de canal y la cabeza de clasificacion dependen del conjunto de datos y hay que reconstruirlos.
- Rendimiento muy desigual segun la tarea: 0,274 en bcic2020-3, 0,285 en faced, 0,300 en seed-v y 0,500 en physionet estan en el entorno del azar, y seed-vig presenta un R² negativo de -0,165, lo que indica que las caracteristicas congeladas no capturan la variable objetivo en ese conjunto.
- El encoder se entreno sobre solo 323 grabaciones, un corpus reducido para un modelo fundacional, lo que limita la generalizacion a montajes, equipos y poblaciones no representados.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios, posiciones de canal en metros y datos sin estandarizar previamente. Saltarse cualquiera de estas condiciones invalida las representaciones.
- No es la configuracion recomendada por sus propios autores; el articulo propone r = 9 cm y L = 2. Usar esta variante en produccion sin justificarlo es una decision suboptima segun la evidencia del trabajo.
- Las metricas publicadas corresponden a encoder congelado mas sonda ridge sobre caracteristicas aplanadas; el ajuste fino completo podria dar resultados distintos, mejores o peores, y no se documenta.
- El modelo tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero exige citar el articulo. El codigo asociado se distribuye bajo MIT, una licencia distinta de la de los pesos, lo que conviene tener presente en auditorias de cumplimiento.
- Las fechas de creacion y actualizacion del repositorio (2026-09-27) son posteriores a la fecha actual, lo que apunta a un error de metadatos; conviene verificar la version real del checkpoint antes de fijar una dependencia.
- Riesgo de sesgo: el corpus de preentrenamiento no se detalla por poblacion, edad, sexo ni procedencia, por lo que no se puede evaluar su sesgo demografico ni su equidad entre subgrupos clinicos.
- No apto para uso clinico autonomo: se trata de un modelo de investigacion y sus predicciones deben validarse con supervision medica cualificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r12cm_L4
- Coleccion completa con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo fuente (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/fw933z81
- Checkpoint con la configuracion recomendada (MAE): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint con la configuracion recomendada (JEPA): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo ni sobre modelos fundacionales de EEG; los resultados obtenidos correspondian a sitios de contenido para adultos sin relacion alguna con el tema, por lo que se han descartado.
