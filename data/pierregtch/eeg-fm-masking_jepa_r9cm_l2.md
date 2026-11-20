# PierreGtch/eeg-fm-masking_jepa_r9cm_L2

## Resumen

`eeg-fm-masking_jepa_r9cm_L2` es un codificador de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado, desarrollado por Pierre Guetschel (usuario `PierreGtch`) en el marco del trabajo *What masking geometry works best for EEG foundation models?* (arXiv:2609.33487). No es un modelo generativo de lenguaje: es un extractor de características (`feature-extraction`) que transforma ventanas de señal EEG en representaciones vectoriales reutilizables para tareas posteriores de clasificación o regresión.

El modelo forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento (máscara espacial de radio `r` y longitud temporal `L`). Esta variante concreta emplea un radio espacial de 9 cm y una longitud temporal de 2 parches, configuración que el artículo identifica como la recomendada. La arquitectura es un transformer con tokenizador de parches y un marco JEPA (joint-embedding predictive architecture), con 12,69 millones de parámetros en el codificador.

Su relevancia radica en que aborda un problema práctico de los modelos fundacionales de EEG: qué estrategia de enmascaramiento produce representaciones más transferibles. Al liberar los pesos bajo CC-BY-4.0 y ofrecer checkpoints intermedios por época, permite reproducir y comparar el efecto de la geometría de máscara en doce conjuntos de datos de referencia del ecosistema OpenEEGBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (patch tokeniser + transformer); preentrenamiento JEPA con predictor y profesor EMA |
| Parametros totales | 12.692.096 (codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada segmentada en parches de 1 s con solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senal EEG, no linguistico) |
| Licencia | CC-BY-4.0 (pesos); codigo MIT |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | voltios (escalado interno `factor = 1e+06` y `median_std_clip` con sigma = 15) |
| Posiciones de canales | metros (MNE `info["chs"][i]["loc"][:3]`) |
| Agnostico al montaje | si, cualquier numero y conjunto de canales con posicion 3D |
| Parametros de mascara | `r` = 9 cm, `L` = 2 parches, `pct_unmasked` = 0.45 |
| Checkpoint publicado | fin de epoca 10 de 10 (epocas 1-9 en subcarpetas) |
| Tamano del repo | 0.5 GB |

## Arquitectura y entrenamiento

El codificador combina un tokenizador de parches que segmenta la senal EEG en ventanas de 1 segundo (200 muestras a 200 Hz) con un solapamiento de 20 muestras, y un transformer que procesa la secuencia de parches. El preentrenamiento sigue el paradigma JEPA: un predictor transforma las representaciones del contexto (parches no enmascarados) en los embeddings que un profesor EMA genera para los parches enmascarados. A diferencia de otros marcos autosupervisados, JEPA no emplea regularizador de varianza ni de covarianza. El repositorio publica unicamente el codificador estudiante, que es exactamente el conjunto de tensores evaluado en el articulo; el predictor y el profesor EMA no se incluyen.

El entrenamiento utilizo el subconjunto de licencia abierta del corpus de preentrenamiento REVE (323 grabaciones), seleccionado para permitir la redistribucion de los pesos. La receta consta de 10 epocas sobre 2 GPU H100, tamano de lote de 600 por GPU, tasa de aprendizaje de 0,00024 con calentamiento de 3080 pasos y valor final de 1e-06, y decaimiento de peso de 0,01. La innovacion principal del trabajo no reside en la arquitectura sino en el barrido sistematico de la geometria de mascara: 5 radios espaciales por 6 longitudes temporales por 2 marcos de entrenamiento, dando lugar a los 58 codificadores de la coleccion.

## Capacidades

- Extraccion de caracteristicas a partir de senal EEG cruda en voltios, con escalado interno y sin necesidad de estandarizacion previa.
- Procesamiento agnostico al montaje: admite cualquier numero y disposicion de canales siempre que cada uno tenga coordenadas 3D en metros.
- Generacion de representaciones contextuales sobre ventanas segmentadas en parches de 1 s, adecuadas para sondas lineales (ridge) o ajuste fino supervisado.
- Soporte de evaluacion y ajuste fino mediante la libreria OpenEEGBench (`PretrainedBackbone`).
- Checkpoints intermedios por epoca (1 a 9) para estudiar la dinamica de entrenamiento y seleccionar el punto optimo por tarea.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: su dominio es exclusivamente la senal electrofisiologica.

## Casos de uso

- Deteccion de crisis epilepticas: el codificador congelado alcanza 0,908 de exactitud balanceada en `chbmit`, por lo que puede integrarse como extractor en un pipeline de monitorizacion continua que alimente un clasificador ligero.
- Monitorizacion del sueno: con 0,682 de exactitud balanceada en `isruc-sleep`, sirve como base para estadiaje automatico en dispositivos domesticos o polisomnografos.
- Deteccion de anomalias en EEG clinico: los 0,929 de exactitud balanceada en `tuev` y 0,805 en `tuab` lo hacen util para triaje de registros con posibles eventos adversos antes de la revision neurologica.
- Investigacion en biomarcadores psiquiatricos: los 0,858 en `mdd_mumtaz2016` permiten usarlo como extractor en estudios de depresion mayor, comparando representaciones entre cohortes.
- Carga cognitiva y tareas aritmeticas: los 0,737 en `arithmetic_zyma2019` facilitan prototipos de interfaces cerebro-computador para entornos educativos o de evaluacion cognitiva.
- Reproduccion metodologica: al ser uno de 58 modelos con receta identica, sirve para experimentos controlados sobre el efecto de la geometria de mascara en la transferibilidad, usando los checkpoints intermedios para analisis de convergencia.
- Ajuste fino en dominios con pocos datos: al ser agnostico al montaje y tener solo 12,69 M de parametros, es viable reentrenar la cabeza de clasificacion con conjuntos pequenos y hardware modesto.

## Benchmarks y rendimiento

Resultados publicados en la model card con codificador congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 conjuntos de datos, 5 semillas). Exactitud balanceada para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0.737 ± 0.015 | 5 |
| bcic2020-3 | exactitud balanceada | 0.277 ± 0.008 | 5 |
| bcic2a | exactitud balanceada | 0.460 ± 0.004 | 5 |
| chbmit | exactitud balanceada | 0.908 ± 0.017 | 5 |
| faced | exactitud balanceada | 0.280 ± 0.006 | 5 |
| isruc-sleep | exactitud balanceada | 0.682 ± 0.008 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0.858 ± 0.009 | 5 |
| physionet | exactitud balanceada | 0.533 ± 0.007 | 5 |
| seed-v | exactitud balanceada | 0.307 ± 0.001 | 5 |
| seed-vig | R² | -0.258 ± 0.011 | 5 |
| tuab | exactitud balanceada | 0.805 ± 0.001 | 5 |
| tuev | exactitud balanceada | 0.929 ± 0.032 | 5 |

No se han publicado en la informacion disponible tablas comparativas directas frente a otros modelos de la coleccion ni frente a alternativas externas; el articulo de referencia contiene el analisis comparativo completo de las 58 geometrias.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para los 12,69 M de parametros del codificador; el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento original uso 2 x H100, pero la inferencia y el ajuste fino de una sonda no requieren ese hardware.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch mediante `ContextualEncoderBenchmarkWrapper`; integracion con OpenEEGBench para evaluacion; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r9cm_L2 | 12,69 M | no disponible | JEPA, mascara r=9 cm / L=2 | CC-BY-4.0 | Hugging Face |
| Resto de la coleccion eeg-fm-masking (57 variantes) | 12,69 M | no disponible | JEPA y otro marco, distintas geometrias de mascara | CC-BY-4.0 | Hugging Face (coleccion del autor) |
| Alternativas externas de modelos fundacionales EEG | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa disponible es interna a la coleccion de 58 codificadores, que comparten receta y solo difieren en la geometria de mascara; la model card no incluye cifras de las otras variantes. No se dispone de datos de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el codificador estudiante; el predictor JEPA y el profesor EMA no se distribuyen, por lo que no es posible reanudar el preentrenamiento tal cual desde estos pesos.
- El modelo no genera texto ni admite instrucciones: es exclusivamente un extractor de caracteristicas de senal EEG.
- Requiere entrada estrictamente a 200 Hz y en voltios; aplicar estandarizacion previa o remuestrear de forma distinta invalida el escalado interno.
- Todos los canales deben disponer de posicion 3D en metros; canales sin coordenadas no pueden procesarse.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero las representaciones pueden producir clasificaciones erroneas en dominios alejados de la distribucion de preentrenamiento (REVE, 323 grabaciones).
- El rendimiento es muy desigual entre tareas: 0,277 en `bcic2020-3` y 0,280 en `faced` frente a 0,929 en `tuev`, lo que desaconseja su uso directo sin validacion en el dominio objetivo.
- El R² negativo en `seed-vig` (-0,258) indica que, con sonda ridge congelada, el modelo no supera a una linea base trivial en esa tarea de regresion.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero exige citar el articulo y conservar la atribucion; el codigo asociado esta bajo MIT.
- No se documentan sesgos demograficos ni de adquisicion; la composicion del corpus de preentrenamiento (323 grabaciones) limita la generalizacion a poblaciones y equipos no representados.
- No hay datos publicados sobre cuantizacion, latencia ni throughput, lo que dificulta estimar costes de produccion a priori.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Articulo: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo: https://github.com/PierreGtch/eeg-fm-masking
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/tl2ef402
