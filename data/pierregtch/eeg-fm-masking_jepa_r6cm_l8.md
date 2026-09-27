# PierreGtch/eeg-fm-masking_jepa_r6cm_L8

## Resumen

eeg-fm-masking_jepa_r6cm_L8 es un codificador de EEG preentrenado mediante autoaprendizaje supervisado, publicado por PierreGtch como parte de un estudio controlado sobre geometrías de enmascaramiento en modelos fundacionales de EEG. El modelo pertenece a una familia de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de la máscara: 5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento (MAE y JEPA). Este checkpoint concreto corresponde al marco JEPA con radio espacial de 6 cm y longitud temporal de 8 parches.

La arquitectura es un transformer con tokenizador de parches (patch tokeniser) que procesa señal EEG muestreada a 200 Hz, dividida en parches de 1 segundo con solapamiento de 20 muestras. El modelo tiene 12.692.096 parámetros en el codificador (aproximadamente 12,69 M), lo que lo sitúa en la gama muy ligera. En el marco JEPA, un predictor proyecta el contexto del codificador hacia los embeddings que produce un profesor EMA para los parches enmascarados; el repositorio publica únicamente el codificador estudiante, que es el que se evalúa en el paper.

Su relevancia actual radica en dos factores. Primero, ofrece pesos redistribuibles (CC-BY-4.0) porque se entrenó solo sobre el subconjunto de licencia abierta del corpus REVE, algo poco habitual en modelos fundacionales de EEG. Segundo, está integrado con OpenEEGBench y expone una evaluación homogénea sobre 12 datasets con protocolo de encoder congelado y sonda ridge, lo que facilita comparaciones reproducibles. El propio paper recomienda, no obstante, la configuración r = 9 cm y L = 2 por encima de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches, enmarcado en JEPA (joint-embedding predictive architecture) con predictor y profesor EMA |
| Parametros totales | 12.692.096 (12,69 M), solo el codificador |
| Longitud de contexto | No especificada explicitamente. La ventana de enmascaramiento abarca 33 parches de 1 s; con parches de 200 muestras y solapamiento de 20 muestras (paso de 0,9 s) equivale a unos 30 s de senal a 200 Hz |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en precision completa; no hay variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No aplica: modelo de senales EEG, no linguistico |
| Licencia | CC-BY-4.0 para los pesos; MIT para el codigo |
| Formato de pesos | safetensors (model.safetensors), mas config.json y metadata.json; requiere PyTorch |

Datos adicionales del checkpoint: parametro de enmascaramiento `pct_unmasked` = 0,45; checkpoint del epoch 10 de 10 (version `v9`); ejecucion de entrenamiento `vla22qxd` en Weights & Biases. El repositorio ocupa 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer sobre parches temporales. La senal EEG se muestrea a 200 Hz y se corta en parches de 1 segundo (200 muestras) con un solapamiento de 20 muestras. El wrapper de inferencia espera la senal en voltios, multiplica por un factor de 1e+06 y aplica internamente un escalado por ventana `median_std_clip` con recorte en sigma = 15; la documentacion insiste en que no se debe estandarizar la senal de antemano. Las posiciones de los canales se expresan en metros (campo `loc[:3]` del objeto `info["chs"]` de MNE) y el modelo es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que cada uno tenga una posicion 3D.

El preentrenamiento sigue el marco JEPA: un predictor mapea el contexto codificado hacia los embeddings que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. Los tensores publicados incluyen solo el tokenizador de parches (`feature_encoder.*`) y el transformer (`model.*`); el predictor JEPA y el profesor EMA no se distribuyen. En cuanto a datos, se utilizo el subconjunto de licencia abierta del corpus de preentrenamiento REVE (323 grabaciones), elegido precisamente para poder redistribuir los pesos. El entrenamiento consta de 10 epochs sobre 2 GPU H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos y valor final de 1e-06) y weight decay de 0,01.

## Capacidades

- Extraccion de caracteristicas (feature extraction) para senales EEG: es la tarea declarada en el pipeline tag del repositorio.
- Representaciones contextuales agnosticas al montaje: funciona con cualquier numero y disposicion de electrodos si se aportan posiciones 3D.
- Clasificacion y regresion downstream mediante sonda ridge sobre las caracteristicas aplanadas del encoder congelado.
- Clasificacion de tareas EEG diversas: aritmetica mental, imagineria motora, deteccion de crisis epilepticas, reconocimiento facial, estadificacion del sueno, depresion, patologia neurologica y edad/vigilia.
- Regresion continua sobre senal EEG (evaluada en la tarea `seed-vig` de OpenEEGBench).
- Integracion con OpenEEGBench mediante la clase `PretrainedBackbone` para evaluacion y ajuste fino.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto, vision ni audio: no es un modelo de lenguaje ni multimodal.
- No tiene modo de razonamiento explicito (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Extraccion de embeddings para clasificacion de EEG en investigacion: se carga el encoder con `ContextualEncoderBenchmarkWrapper` y se entrena una sonda ridge sobre las caracteristicas aplanadas, tal como hace OpenEEGBench con encoder congelado.
- Deteccion de crisis epilepticas: en el dataset chbmit el modelo alcanza 0,922 de balanced accuracy con encoder congelado, lo que lo hace util como extractor de caracteristicas en sistemas de alerta temprana.
- Estadificacion automatica del sueno: en isruc-sleep obtiene 0,686 de balanced accuracy, suficiente como base para pipelines de clasificacion de fases del sueno a partir de senal cruda a 200 Hz.
- Deteccion de anomalias en EEG clinico: en tuev logra 0,925 y en tuab 0,816 de balanced accuracy, adecuado para cribado de trazados anormales en entornos de neurofisiologia.
- Investigacion sobre enmascaramiento y autoaprendizaje: al formar parte de una cuadricula controlada de 58 encoders, permite aislar el efecto de la geometria de la mascara sobre el rendimiento downstream con una receta identica.
- Transfer learning a montajes nuevos: al ser agnostico al montaje y usar posiciones de canal en metros, se puede adaptar a equipos con diferente numero de electrodos sin reentrenar el tokenizador.
- Punto de partida para ajuste fino en tareas con pocas etiquetas: con 12,69 M de parametros el coste de fine-tuning completo es bajo comparado con modelos fundacionales de EEG de mayor tamano.
- Analisis de carga cognitiva y aritmetica mental: en arithmetic_zyma2019 alcanza 0,670 de balanced accuracy, util en estudios de carga de trabajo.

## Benchmarks y rendimiento

Resultados publicados en la model card para OpenEEGBench con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas, 12 datasets × 5 semillas. Metrica: balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,670 ± 0,018 | 5 |
| bcic2020-3 | balanced acc. | 0,254 ± 0,005 | 5 |
| bcic2a | balanced acc. | 0,406 ± 0,022 | 5 |
| chbmit | balanced acc. | 0,922 ± 0,025 | 5 |
| faced | balanced acc. | 0,249 ± 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,686 ± 0,002 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,862 ± 0,006 | 5 |
| physionet | balanced acc. | 0,502 ± 0,010 | 5 |
| seed-v | balanced acc. | 0,314 ± 0,001 | 5 |
| seed-vig | R² | -0,285 ± 0,011 | 5 |
| tuab | balanced acc. | 0,816 ± 0,012 | 5 |
| tuev | balanced acc. | 0,925 ± 0,018 | 5 |

No se han proporcionado resultados comparativos frente a otros modelos fundacionales de EEG en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: el codificador tiene 12,69 M de parametros. En FP32 ocupa del orden de 51 MB de pesos; en FP16, unos 25 MB. El consumo real depende del tamano de lote, del numero de canales y de la longitud de la ventana, pero se mantiene muy por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente. Entrenamiento original con 2 × H100 y batch de 600 por GPU; inferencia viable en RTX 3060, RTX 4090, A100, H100 o incluso en CPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM, e incluso en GPUs mas antiguas.
- Opciones de despliegue: PyTorch junto con el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y OpenEEGBench mediante `PretrainedBackbone`. vLLM, llama.cpp, Ollama y TGI no son aplicables porque el modelo no es generativo de texto y no publica pesos en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Marco | Radio r | Longitud L | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r6cm_L8 (este) | JEPA | 6 cm | 8 parches | 12,69 M | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | No disponible (receta identica) | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | No disponible (receta identica) | CC-BY-4.0 | HuggingFace |

Los dos modelos de la tabla son los que el paper recomienda de forma explicita (r = 9 cm, L = 2) y se entrenaron con la misma receta, cambiando solo la geometria de la mascara y el marco, por lo que la comparacion es directa en arquitectura. No se dispone de cifras de rendimiento de estos dos checkpoints en la informacion proporcionada. Tampoco hay datos comparativos frente a otros modelos fundacionales de EEG (LaBraM, BIOT, EEGPT u otros): no disponible.

## Limitaciones y advertencias

- Es un extractor de caracteristicas, no un modelo generativo: no produce texto, codigo ni respuestas, y requiere una sonda o cabecera downstream entrenada aparte.
- El repositorio contiene solo el codificador. El predictor JEPA y el profesor EMA no se distribuyen, de modo que no es posible reproducir el preentrenamiento completo a partir de estos pesos.
- La carga con `strict=False` deja fuera el buffer de posiciones de canal y la cabecera de clasificacion, que dependen del dataset; es un comportamiento esperado pero exige aportar `chs_info` correctamente.
- El rendimiento es muy desigual segun el dataset: 0,922 en chbmit o 0,925 en tuev frente a 0,249 en faced o 0,254 en bcic2020-3, lo que sugiere sensibilidad al tipo de tarea y al montaje.
- La tarea de regresion `seed-vig` obtiene un R² negativo (-0,285), es decir, peor que predecir la media; no es adecuado para esa tarea sin ajuste fino.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios, sin estandarizacion previa (el wrapper ya aplica `median_std_clip` con recorte en sigma = 15) y posiciones de canal en metros. Ignorar estos requisitos degrada las representaciones.
- No se documentan sesgos especificos ni riesgos de alucinacion. En un modelo de EEG el riesgo analogo es la generalizacion indebida entre poblaciones, montajes o equipos de registro distintos de los vistos en REVE.
- El paper no recomienda este checkpoint como configuracion optima: la recomendacion es r = 9 cm y L = 2.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el codigo se rige por MIT; conviene citar el paper al reutilizar los pesos.
- En aplicaciones clinicas es imprescindible validacion prospectiva: los resultados de OpenEEGBench son de investigacion y usan encoder congelado con sondas simples.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r6cm_L8
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo: https://github.com/PierreGtch/eeg-fm-masking
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/vla22qxd
- Checkpoint recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
