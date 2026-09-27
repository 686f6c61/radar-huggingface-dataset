# PierreGtch/eeg-fm-masking_jepa_r9cm_L2

## Resumen
El modelo `eeg-fm-masking_jepa_r9cm_L2` es un codificador de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado. Lo publica PierreGtch como parte de una colección de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de enmascaramiento: 5 radios espaciales, 6 longitudes temporales y 2 marcos de trabajo (MAE y JEPA). Este checkpoint concreto usa JEPA, un radio espacial de 9 cm y una longitud temporal de 2 parches, la geometría recomendada por el artículo asociado.

El modelo no es un modelo de lenguaje ni un sistema generativo: es un extractor de características para señales EEG. Su encoder tiene 12.692.096 parámetros (12,69 M) y se distribuye en formato safetensors, con licencia CC-BY-4.0 para los pesos y MIT para el código. La entrada debe estar muestreada a 200 Hz, en voltios y con posiciones 3D de los canales en metros; el propio wrapper aplica el escalado `median_std_clip` con recorte en σ = 15.

Su relevancia actual radica en que permite evaluar de forma controlada cómo afecta la geometría de enmascaramiento al rendimiento de un modelo fundacional EEG. El repositorio incluye únicamente el encoder estudiante; el predictor JEPA y el profesor EMA no se publican. Los resultados downstream se obtienen con el encoder congelado y una sonda ridge, lo que facilita reproducir la evaluación sin reentrenar el backbone.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (joint-embedding predictive architecture); encoder contextual con tokenizador de parches y transformer; el predictor y el profesor EMA no se incluyen en el repositorio |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto de lenguaje; la entrada EEG se divide en parches de 1 s a 200 Hz (200 muestras, 20 de solapamiento), con numero de canales y duracion configurables |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors sin cuantizacion declarada |
| Idiomas soportados | No aplica (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el codigo en GitHub |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es un encoder contextual tipo transformer con un tokenizador de parches (`feature_encoder.*`) y un cuerpo transformer (`model.*`). En el marco JEPA, un predictor transforma el contexto codificado por el encoder en los embeddings que un profesor EMA genera para los parches enmascarados. No se emplea un regularizador de varianza/covarianza. La geometría de enmascaramiento de este checkpoint es radio espacial `r = 9 cm`, longitud temporal `L = 2` parches y `pct_unmasked = 0.45`. Corresponde al checkpoint de la epoca 10 de 10 (`v9`), el evaluado en el articulo.

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), lo que permite redistribuir los pesos. La receta de entrenamiento consta de 10 epocas, 2 GPU H100, tamaño de lote de 600 por GPU, tasa de aprendizaje 0,00024 con calentamiento de 3080 pasos y valor final 1e-06, y decaimiento de peso 0,01. El modelo es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D.

## Capacidades
- Extraccion de caracteristicas EEG autosupervisada: genera embeddings contextuales a partir de señales en voltios muestreadas a 200 Hz.
- Evaluacion downstream con encoder congelado y sonda ridge: clasificacion y regresion sobre caracteristicas aplanadas en 12 conjuntos de datos de OpenEEGBench.
- Clasificacion de tareas EEG: aritmetica mental, interfaces cerebro-computadora, deteccion de crisis, deteccion de anomalias, clasificacion de eventos, sueño y depresion.
- Regresion de vigilancia (`seed-vig`) mediante sonda ridge, aunque con R² negativo en la evaluacion publicada.
- Funcionamiento agnostico al montaje: cualquier numero y disposicion de canales, siempre que existan posiciones 3D en metros.
- Preprocesado integrado en el wrapper: multiplicacion por `factor = 1e+06` y escalado `median_std_clip` con recorte en σ = 15; no se debe estandarizar antes.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision, audio ni capacidades multilingues.
- No incluye cabeza de clasificacion ni los pesos del predictor JEPA o del profesor EMA; solo el encoder estudiante.

## Casos de uso
- Deteccion de crisis epilepticas: el modelo alcanza una precision balanceada de 0,908 en `chbmit`, por lo que puede usarse como extractor de caracteristicas para un clasificador de crisis a partir de registros EEG multicanal.
- Deteccion de anomalias EEG: con 0,805 de precision balanceada en `tuab`, es adecuado para prefiltrar segmentos anormales en pipelines de revision clinica asistida.
- Clasificacion de eventos EEG: obtiene 0,929 de precision balanceada en `tuev`, lo que lo hace util para etiquetar eventos especificos en registros largos.
- Monitorizacion del sueño: con 0,682 de precision balanceada en `isruc-sleep`, puede emplearse para estadiaje automatico de fases del sueño como caracteristica de entrada a un modelo especifico.
- Apoyo al diagnostico de depresion: alcanza 0,858 de precision balanceada en `mdd_mumtaz2016`, por lo que sirve como base para experimentos de clasificacion de trastorno depresivo mayor.
- Evaluacion de carga mental: con 0,737 de precision balanceada en `arithmetic_zyma2019`, permite estudiar estados cognitivos en tareas aritmeticas.
- Extraccion de embeddings para busqueda y agrupacion de registros EEG: los vectores contextuales pueden indexarse para recuperar segmentos similares o agrupar sujetos por patrones de señal.
- Inicializacion para fine-tuning en datasets propios: al ser un encoder preentrenado pequeno (12,69 M), se puede adaptar con pocos recursos a tareas EEG especificas, siempre que se respete el preprocesado de 200 Hz, voltios y posiciones 3D.

## Benchmarks y rendimiento
Resultados publicados en OpenEEGBench con encoder congelado y sonda ridge (regresion/clasificacion sobre caracteristicas contextuales aplanadas), 12 conjuntos de datos y 5 semillas. La metrica es precision balanceada para clasificacion y R² para `seed-vig`.

| Conjunto de datos | Metrica | Resultado (media ± desviacion tipica) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | precision balanceada | 0,737 ± 0,015 | 5 |
| bcic2020-3 | precision balanceada | 0,277 ± 0,008 | 5 |
| bcic2a | precision balanceada | 0,460 ± 0,004 | 5 |
| chbmit | precision balanceada | 0,908 ± 0,017 | 5 |
| faced | precision balanceada | 0,280 ± 0,006 | 5 |
| isruc-sleep | precision balanceada | 0,682 ± 0,008 | 5 |
| mdd_mumtaz2016 | precision balanceada | 0,858 ± 0,009 | 5 |
| physionet | precision balanceada | 0,533 ± 0,007 | 5 |
| seed-v | precision balanceada | 0,307 ± 0,001 | 5 |
| seed-vig | R² | -0,258 ± 0,011 | 5 |
| tuab | precision balanceada | 0,805 ± 0,001 | 5 |
| tuev | precision balanceada | 0,929 ± 0,032 | 5 |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 51 MB en fp32, 25 MB en fp16 y 13 MB en int8, calculado a partir de los 12,69 M de parametros. No hay cifras oficiales de VRAM publicadas por el autor.
- GPU recomendadas: el entrenamiento se realizo con 2 x H100 y tamaño de lote de 600 por GPU. Para inferencia, los pesos caben en cualquier GPU consumer con al menos 2 GB de VRAM, como una GTX 1650, RTX 3050 o RTX 4090, si bien el rendimiento dependera de la longitud de la señal y del lote.
- Cabe en GPU consumer: si, gracias al reducido tamaño del encoder. La memoria adicional necesaria depende del numero de canales, de la duracion de la ventana y del tamaño de lote.
- Opciones de despliegue: PyTorch con safetensors, HuggingFace Hub, OpenEEGBench y MNE para la informacion de canales. No aplican vLLM, llama.cpp, Ollama o TGI por no ser un modelo de lenguaje; no se documenta exportacion a ONNX o TorchScript.
- Latencia y throughput: no disponible. Dependen del numero de canales, la duracion de la entrada, el hardware y el tamaño de lote.

## Comparativa con modelos similares
| Modelo | Framework | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`jepa_r9cm_L2`) | JEPA | 12,69 M | Parches EEG de 1 s a 200 Hz | Ver tabla de benchmarks | CC-BY-4.0 | HuggingFace |
| Encoders MAE de la misma coleccion | MAE | No disponible | Misma entrada EEG | No disponible en la informacion | No disponible | Coleccion de HuggingFace |
| Encoders JEPA con otras geometrias de enmascaramiento | JEPA | No disponible | Misma entrada EEG | No disponible en la informacion | No disponible | Coleccion de HuggingFace |
| Otros modelos fundacionales EEG | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La coleccion incluye 58 encoders con receta identica, pero no se proporcionan los resultados individuales de los demas, por lo que no es posible establecer una comparativa numerica directa con ellos ni con otros modelos fundacionales EEG.

## Limitaciones y advertencias
- Rendimiento desigual: en `bcic2020-3` (0,277), `faced` (0,280) y `seed-v` (0,307) la precision balanceada es baja, y en `seed-vig` el R² es negativo (-0,258), lo que indica un ajuste peor que la media.
- No es un modelo generativo ni de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso, texto, vision ni audio.
- Dependencia estricta del preprocesado: requiere 200 Hz, unidades en voltios, posiciones de canal en metros y no debe estandarizarse antes de la inferencia. El wrapper aplica `median_std_clip` con recorte en σ = 15.
- Sesgo del corpus: el preentrenamiento usa el subconjunto abierto de REVE (323 grabaciones). No se detalla la composicion demografica ni clinica, por lo que puede haber sesgos no cuantificados.
- Generalizacion limitada: los resultados provienen de 12 conjuntos de datos concretos y de una sonda ridge lineal; no garantizan un rendimiento similar en otras tareas, montajes o poblaciones.
- Riesgo de falsos positivos y falsos negativos en aplicaciones clinicas: el modelo no esta validado para diagnostico medico y su uso en produccion sanitaria exige supervision profesional.
- Restricciones de licencia: los pesos son CC-BY-4.0, lo que permite uso comercial con atribucion; el codigo es MIT. Es necesario citar el articulo correspondiente.
- El repositorio solo contiene el encoder estudiante; no incluye el predictor JEPA ni el profesor EMA. La carga con `strict=False` omite las partes dependientes del conjunto de datos (buffer de posiciones de canal y cabeza de clasificacion).
- No se han publicado datos de latencia, throughput ni cuantizacion oficial.

## Enlaces
- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Ejecucion de entrenamiento en W&B: https://wandb.ai/pierregtch/chan-inv-clf/runs/tl2ef402
- Referencia del articulo: *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA* (cita disponible en la pagina de GitHub)
