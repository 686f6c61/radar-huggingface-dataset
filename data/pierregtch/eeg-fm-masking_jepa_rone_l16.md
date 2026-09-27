# PierreGtch/eeg-fm-masking_jepa_rone_L16

## Resumen

El modelo `eeg-fm-masking_jepa_rone_L16` es un codificador de electroencefalografía (EEG) preentrenado con aprendizaje autosupervisado por PierreGtch, publicado dentro del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de enmascaramiento: 5 radios espaciales por 6 longitudes temporales por 2 marcos de entrenamiento (MAE y JEPA). Este checkpoint concreto usa el marco JEPA, un radio espacial de un canal y una longitud temporal de 16 parches.

La arquitectura es un transformer codificador con tokenizador de parches orientado a extracción de características, no a generación de texto. El encoder tiene 12.692.096 parámetros y trabaja sobre señales a 200 Hz cortadas en parches de 1 segundo (200 muestras con un solapamiento de 20 muestras). La señal debe entregarse en voltios y con las posiciones 3D de los electrodos en metros, lo que permite que el modelo sea agnóstico al montaje: admite cualquier número y conjunto de canales siempre que cada uno tenga coordenadas espaciales.

Su relevancia es metodológica: al aislar la variable de la geometría de enmascaramiento sobre una receta constante y publicar los pesos de los 58 modelos, permite estudiar qué estrategia de enmascaramiento transfiere mejor a tareas downstream de EEG. El propio paper recomienda la configuración `r = 9 cm, L = 2` frente a esta variante, de modo que este checkpoint debe entenderse como una pieza del barrido experimental y no como el modelo de referencia de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador con tokenizador de parches (patch tokeniser `feature_encoder.*` + transformer `model.*`), preentrenado con JEPA (joint-embedding predictive architecture) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de contexto textual. Ventana de entrada en parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras; longitud total dependiente del registro de EEG |
| Tipos de cuantizacion | No disponible (repo en safetensors de precision completa; el autor no documenta cuantizaciones) |
| Idiomas soportados | No aplica (modelo de senales EEG, no de lenguaje); no disponible |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |

Parametros de enmascaramiento de este checkpoint: radio espacial `r` = un canal, longitud temporal `L` = 16 parches, `pct_unmasked` = 0,45. Checkpoint de la epoca 10 de 10 (version `v9`, la evaluada en el paper).

## Arquitectura y entrenamiento

El modelo es un encoder transformer que primero tokeniza la senal EEG en parches y despues los procesa de forma contextual; la cabeza de salida publicada es la del codificador, sin capa de clasificacion. El preentrenamiento usa JEPA: un predictor mapea el contexto codificado a los embeddings que un profesor EMA (exponential moving average) produce para los parches enmascarados. A diferencia de otras variantes JEPA, esta receta no emplea regularizador de varianza ni de covarianza, y los pesos publicados corresponden al encoder estudiante tal como se evaluo en el paper. El predictor JEPA y el profesor EMA no se incluyen en el repositorio, que contiene exclusivamente el tokenizador de parches y el transformer del encoder.

El entrenamiento se hizo sobre el subconjunto de licencia abierta del corpus de preentrenamiento REVE (323 grabaciones), elegido precisamente para que los pesos pudieran redistribuirse. El calendario fue de 10 epocas sobre 2 GPU H100, con tamano de lote de 600 por GPU, tasa de aprendizaje 0,00024 con calentamiento de 3080 pasos y valor final de 1e-06, y decaimiento de pesos de 0,01. La innovacion tecnica del trabajo no esta en la arquitectura sino en el diseno experimental: los 58 modelos comparten receta y solo varian en la geometria de enmascaramiento, lo que permite atribuir las diferencias de rendimiento a esa variable.

Los requisitos de entrada son estrictos y forman parte de la receta de evaluacion: frecuencia de muestreo de 200 Hz, unidades en voltios y posiciones de canal en metros. El wrapper multiplica por un factor de 1e+06 y aplica su propio escalado `median_std_clip` por ventana (recorte en sigma = 15). La model card advierte explicitamente de que los datos no deben estandarizarse antes de pasarlos al modelo.

## Capacidades

- Extraccion de caracteristicas de senales EEG: produce representaciones contextuales por parche y agregadas que se usan como entrada a sondas downstream (regresion ridge sobre caracteristicas aplanadas en la evaluacion publicada).
- Representaciones agnosticas al montaje: admite cualquier numero y conjunto de canales siempre que cada electrodo tenga una posicion 3D en metros.
- Transferencia a tareas variadas de EEG: clasificacion (aritmetica mental, interfaces cerebro-computador, deteccion de crisis, reconocimiento facial, sueno, depresion, EOG, patologia) y regresion continua (`seed-vig`).
- Aprendizaje autosupervisado sin etiquetas: el encoder se preentrena sin anotaciones y despues se evalua con encoder congelado o se ajusta finamente.
- Uso como backbone en OpenEEGBench: se integra mediante `PretrainedBackbone` de la libreria `open_eeg_bench`.
- No dispone de generacion de texto, tool calling, razonamiento multi-paso, capacidades multilingues ni modalidades de vision o audio: es un modelo unimodal de senales EEG.

## Casos de uso

- Investigacion comparativa sobre enmascaramiento en EEG: este checkpoint sirve como una de las celdas del barrido JEPA con `r` = un canal y `L` = 16, de modo que un grupo de investigacion puede reproducir la comparacion frente a las otras 57 configuraciones de la familia para estudiar el efecto de la geometria de enmascaramiento.
- Base para clasificacion de patologias neurologicas con encoder congelado: entrenando unicamente una sonda ridge sobre las caracteristicas contextuales, se obtienen los resultados publicados en `tuab` (0,802 de exactitud balanceada) y `tuev` (0,938), un flujo de bajo coste computacional util para prototipado rapido en entornos clinicos de investigacion.
- Deteccion de crisis epilepticas: el modelo alcanza 0,841 de exactitud balanceada en `chbmit` con sonda ridge, por lo que es un candidato razonable para experimentos de monitorizacion de crisis a partir de registros multicanal.
- Analisis de sueno: con 0,676 de exactitud balanceada en `isruc-sleep`, puede emplearse como extractor de caracteristicas para pipelines de estadiaje del sueno, combinado con un clasificador ligero por epoca.
- Clasificacion de estados mentales en interfaces cerebro-computador: en `arithmetic_zyma2019` obtiene 0,752 de exactitud balanceada, lo que lo hace util como encoder de partida en protocolos de carga cognitiva o imagineria motora, siempre que se valide el ajuste fino por sujeto.
- Estudio de depresion a partir de EEG en reposo: la puntuacion de 0,841 en `mdd_mumtaz2016` con sonda congelada permite usarlo como linea base en experimentos de biormarcadores de depresion.
- Extraccion de caracteristicas para modelos aguas abajo mas grandes: al devolver embeddings contextuales con contexto espacial y temporal, las representaciones pueden alimentar clasificadores, modelos multimodales o sistemas de deteccion de artefactos.
- Evaluacion de transferencia entre corpus: dado que el preentrenamiento usa solo 323 grabaciones de licencia abierta de REVE, es un banco de pruebas adecuado para medir cuanto de la transferencia depende de la cantidad y diversidad del corpus de preentrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en OpenEEGBench con el encoder congelado y una sonda ridge sobre las caracteristicas contextuales aplanadas, sobre 12 conjuntos de datos y 5 semillas (exactitud balanceada para clasificacion, R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,752 ± 0,012 | 5 |
| bcic2020-3 | exactitud balanceada | 0,272 ± 0,011 | 5 |
| bcic2a | exactitud balanceada | 0,381 ± 0,017 | 5 |
| chbmit | exactitud balanceada | 0,841 ± 0,067 | 5 |
| faced | exactitud balanceada | 0,254 ± 0,004 | 5 |
| isruc-sleep | exactitud balanceada | 0,676 ± 0,004 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,841 ± 0,005 | 5 |
| physionet | exactitud balanceada | 0,474 ± 0,006 | 5 |
| seed-v | exactitud balanceada | 0,306 ± 0,002 | 5 |
| seed-vig | R² | -0,310 ± 0,011 | 5 |
| tuab | exactitud balanceada | 0,802 ± 0,011 | 5 |
| tuev | exactitud balanceada | 0,938 ± 0,022 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numericas directas con otros modelos de EEG de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder tiene 12,69 M de parametros, aproximadamente 51 MB en FP32 y 25 MB en FP16. Sumando activaciones y el tokenizador de parches, la inferencia cabe holgadamente en menos de 1 GB de VRAM para ventanas individuales.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia y ajuste fino, incluidas RTX 3060, RTX 4090, A100 y H100. El autor uso 2 x H100 unicamente para el preentrenamiento desde cero con lotes de 600 por GPU, no para inferencia.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo con al menos 4 GB de VRAM e incluso puede ejecutarse en CPU para inferencia y extraccion de caracteristicas a pequena escala.
- Opciones de despliegue: PyTorch mediante el paquete `eeg_fm_masking` (instalacion con `pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y la clase `ContextualEncoderBenchmarkWrapper`; integracion con OpenEEGBench a traves de `PretrainedBackbone`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. Dependen del numero de canales, de la duracion del registro y del hardware, y el autor no publica medidas.

## Comparativa con modelos similares

La comparacion natural es con los otros checkpoints de la misma familia, entrenados con receta identica y distinta geometria de enmascaramiento. La model card recomienda explicitamente la configuracion `r = 9 cm, L = 2` frente al checkpoint descrito aqui.

| Modelo | Marco | Geometria de mascara | Parametros | Resultados downstream | Licencia |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rone_L16 (este) | JEPA | r = un canal, L = 16 | 12,69 M | Tabla de 12 datasets (arriba) | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 (recomendado) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 (recomendado) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | CC-BY-4.0 |
| Otros 55 encoders de la familia eeg-fm-masking | MAE o JEPA | 5 radios x 6 longitudes | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | CC-BY-4.0 |

Comparacion con modelos de EEG de terceros (LaBraM, EEGPT, BIOT u otros): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Geometria de enmascaramiento no optima: el propio paper recomienda `r = 9 cm, L = 2`; esta variante usa `r` = un canal y `L` = 16, por lo que no es el mejor checkpoint de la familia segun sus autores.
- Rendimiento bajo en varias tareas: `faced` (0,254), `bcic2020-3` (0,272), `seed-v` (0,306) y `bcic2a` (0,381) son valores proximos a un clasificador trivial en tareas de pocas clases, lo que indica transferencia limitada en esos dominios.
- Regresion continua deficiente: en `seed-vig` el R² es negativo (-0,310 ± 0,011), es decir, peor que predecir la media; este checkpoint no deberia usarse para regresion de vigilancia sin reentrenamiento.
- Alta varianza en `chbmit`: 0,841 ± 0,067, con una desviacion estandar notablemente superior al resto, senal de inestabilidad entre semillas en esa tarea.
- Corpus de preentrenamiento reducido: solo 323 grabaciones del subconjunto de licencia abierta de REVE. La eleccion se hizo por motivos de redistribucion, con el coste previsible de menor cobertura de dominios y montajes.
- Requisitos de entrada rigidos: 200 Hz, voltios y posiciones de canal en metros. Omitir el escalado interno, estandarizar los datos previamente o usar otra frecuencia de muestreo degrada o invalida los resultados.
- No es un modelo generativo: no produce texto ni senales, solo representaciones; cualquier tarea downstream requiere una sonda o un ajuste fino.
- Pesos incompletos para JEPA: solo se publica el encoder estudiante, sin el predictor ni el profesor EMA, por lo que no es posible reanudar el preentrenamiento JEPA tal cual.
- Sesgos: la model card no documenta analisis de sesgos por poblacion, equipo de registro o patologia; no hay informacion al respecto.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de representaciones espurias que produzcan predicciones sobreconfiadas en dominios alejados del corpus de preentrenamiento.
- Uso comercial: los pesos estan bajo CC-BY-4.0 (permiten uso comercial con atribucion) y el codigo bajo MIT. La licencia CC-BY-4.0 exige citar adecuadamente el paper y a los autores.
- Uso clinico: no hay validacion regulatoria ni estudio clinico; cualquier aplicacion diagnostica requiere validacion independiente.
- Adopcion practica limitada: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe un ecosistema de terceros ni soporte comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rone_L16
- Sitio del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo: https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/e76drwsj
