# PierreGtch/eeg-fm-masking_jepa_rall_L2

## Resumen

eeg-fm-masking_jepa_rall_L2 es un codificador de electroencefalograma (EEG) preentrenado con arquitectura JEPA (joint-embedding predictive architecture), desarrollado por PierreGtch y publicado como parte de una colección de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de enmascaramiento. El modelo forma parte del trabajo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA* y se distribuye como pesos de extracción de características (feature-extraction) bajo licencia CC-BY-4.0.

El problema que aborda es la falta de representaciones EEG genéricas y reutilizables: en lugar de entrenar un clasificador específico por tarea, se entrena un codificador auto-supervisado que produce embeddings de señal EEG que después se evalúan con una sonda congelada (ridge regression/classification) sobre 12 conjuntos de datos de OpenEEGBench. La variante concreta `rall_L2` usa un radio espacial de enmascaramiento de todos los canales (r = all) y una longitud temporal de 2 parches, con una fracción de parches no enmascarados de 0,45.

El modelo tiene 12,69 millones de parámetros en el codificador y trabaja sobre señales muestreadas a 200 Hz, cortadas en parches de 1 segundo (200 muestras, solapamiento de 20 muestras). Es agnóstico respecto al montaje: acepta cualquier número y conjunto de canales siempre que cada canal tenga una posición 3D en metros. Se trata de un modelo de tamaño reducido, orientado a investigación en interfaces cerebro-ordenador, decodificación neuronal y pipelines de análisis EEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador con tokenizador de parches (patch tokeniser) y preentrenamiento JEPA (joint-embedding predictive architecture) |
| Parametros totales | 12.692.096 (codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor numerico; procesa ventanas EEG segmentadas en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos safetensors en precision completa) |
| Idiomas soportados | no aplica (modelo de senal EEG, no de texto); idiomas no disponibles |
| Licencia | cc-by-4.0 (codigo bajo MIT) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |

## Arquitectura y entrenamiento

El modelo es un codificador transformer con tokenizador de parches (`feature_encoder.*`) que transforma segmentos de EEG en representaciones contextualizadas (`model.*`). El preentrenamiento sigue el marco JEPA: un predictor proyecta el contexto del codificador hacia los embeddings que un profesor EMA (exponential moving average) genera para los parches enmascarados, sin regularizador de varianza/covarianza. El repositorio publicado contiene unicamente el codificador estudiante evaluado en el articulo; el predictor JEPA y el profesor EMA no se incluyen. El tensor de pesos corresponde exactamente al cargado para la evaluacion downstream del paper.

Los datos de preentrenamiento proceden del subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El entrenamiento consta de 10 epocas sobre 2 GPU H100, con batch de 600 por GPU, learning rate de 0,00024 con warm-up de 3080 pasos y decaimiento hasta 1e-06, y weight decay de 0,01. El checkpoint publicado es la epoca 10 de 10 (etiquetado `v9`, el evaluado en el articulo), correspondiente al run `a8gdctp4`. La entrada requiere muestreo a 200 Hz, unidades en voltios (el wrapper aplica un factor de 1e+06 y escalado `median_std_clip` con recorte en sigma = 15, por lo que no debe estandarizarse previamente) y posiciones de canal en metros.

## Capacidades

- Extraccion de caracteristicas de senal EEG: produce embeddings contextuales de ventanas de EEG de cualquier montaje, aptos para sondas congeladas.
- Modelado auto-supervisado de representaciones: el codificador se entrena sin etiquetas, lo que permite reutilizarlo en tareas con pocos datos etiquetados.
- Independencia de montaje: acepta cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros.
- Clasificacion y regresion downstream mediante sonda ridge sobre caracteristicas congeladas (evaluado en 12 datasets de OpenEEGBench).
- Compatibilidad con fine-tuning: el modelo se puede ajustar, aunque la evaluacion publicada es de codificador congelado.
- Integracion con el ecosistema OpenEEGBench mediante `PretrainedBackbone`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No tiene capacidades de vision, audio ni thinking mode.

## Casos de uso

- Decodificacion de imagenes motoras: usar los embeddings del codificador congelado como entrada a un clasificador para tareas tipo bcic2a o bcic2020-3, aprovechando que el modelo no exige un montaje fijo y funciona con los electrodos disponibles en cada sesion.
- Deteccion de crisis epilepticas: aplicar el codificador sobre registros continuos y alimentar una sonda de clasificacion, escenario en el que este checkpoint obtiene 0,804 de balanced accuracy en chbmit.
- Monitorizacion de sueno: extraer caracteristicas de senales del dataset isruc-sleep para segmentar y clasificar fases del sueno con pocos datos etiquetados (0,497 de balanced accuracy con sonda ridge congelada).
- Deteccion de anomalias en EEG clinico: usar tuab (0,706) y tuev (0,815) como referencia para pipelines de cribado de actividad anormal en registros hospitalarios.
- Investigacion en biomarcadores psiquiatricos: emplear la representacion congelada en estudios de depresion mayor (mdd_mumtaz2016, 0,698) y de estados de reposo ocular abierto/cerrado (physionet, 0,326).
- Estudio comparativo de geometrias de enmascaramiento: usar este checkpoint como una de las 58 variantes para aislar el efecto del radio espacial y la longitud temporal del enmascaramiento en el rendimiento downstream.
- Aprendizaje por transferencia con datos escasos: conectar el backbone a OpenEEGBench y ajustar una sonda ligera en lugar de entrenar un modelo EEG desde cero, reduciendo coste computacional y necesidad de etiquetas.
- Extraccion de caracteristicas para agrupamiento o visualizacion: generar embeddings de ventanas EEG para analisis exploratorio, clustering de sujetos o busqueda de patrones en grandes cohortes.

## Benchmarks y rendimiento

Resultados downstream publicados en la model card: codificador congelado, sonda ridge sobre caracteristicas contextuales aplanadas, 12 datasets y 5 semillas. Balanced accuracy para clasificacion y R2 para `seed-vig`.

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,595 ± 0,008 | 5 |
| bcic2020-3 | balanced acc. | 0,231 ± 0,010 | 5 |
| bcic2a | balanced acc. | 0,263 ± 0,007 | 5 |
| chbmit | balanced acc. | 0,804 ± 0,046 | 5 |
| faced | balanced acc. | 0,158 ± 0,003 | 5 |
| isruc-sleep | balanced acc. | 0,497 ± 0,005 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,698 ± 0,002 | 5 |
| physionet | balanced acc. | 0,326 ± 0,006 | 5 |
| seed-v | balanced acc. | 0,278 ± 0,001 | 5 |
| seed-vig | R2 | -0,848 ± 0,008 | 5 |
| tuab | balanced acc. | 0,706 ± 0,002 | 5 |
| tuev | balanced acc. | 0,815 ± 0,046 | 5 |

La model card indica que el articulo recomienda las variantes con r = 9 cm y L = 2 (`eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`) como configuracion preferida. No se han publicado en la informacion disponible los resultados comparativos completos de los 58 codificadores ni tablas de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 51 MB en fp32 y 25 MB en fp16 solo para los pesos del codificador; el consumo real depende del numero de canales, de la longitud de las ventanas y del tamano de lote.
- GPU recomendadas: cualquier GPU moderna sirve. El modelo se entreno en 2 × H100, pero la inferencia no requiere hardware de ese nivel; una RTX 4090, una RTX 3060 o incluso una GPU integrada son suficientes para extraccion de caracteristicas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU para lotes pequenos, dado el tamano de 12,69 M de parametros.
- Opciones de despliegue: PyTorch con `safetensors` y el paquete `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`); tambien se puede cargar via `open_eeg_bench.backbone.PretrainedBackbone`. vLLM, llama.cpp, Ollama y TGI no son aplicables porque el modelo no es generativo de texto.
- Latencia y throughput estimados: no disponibles. El coste dominante es el preprocesado de la senal EEG (remuestreo a 200 Hz, segmentacion en parches, extraccion de posiciones de canal) y no la inferencia del transformer.

## Comparativa con modelos similares

| Modelo | Marco | Radio espacial de mascara | Longitud temporal de mascara | Parametros del codificador | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rall_L2 (este) | JEPA | todos los canales | 2 parches | 12,69 M | cc-by-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible en la informacion proporcionada | cc-by-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible en la informacion proporcionada | cc-by-4.0 | HuggingFace |
| Otros codificadores EEG de la familia eeg-fm-masking | MAE o JEPA | 5 radios posibles | 6 longitudes posibles | no disponible | cc-by-4.0 | Coleccion de 58 modelos en HuggingFace |

Los dos ultimos modelos de la tabla (r = 9 cm, L = 2) son los que el articulo recomienda. No se dispone en la informacion proporcionada de cifras comparativas frente a otros modelos de fundacion EEG de la literatura (por ejemplo, alternativas tipo LaBraM, EEGPT o BIOT): no disponibles.

## Limitaciones y advertencias

- Rendimiento desigual por tarea: los resultados con sonda congelada son altos en tuev (0,815) y chbmit (0,804), pero cercanos al azar o peores en faced (0,158), bcic2020-3 (0,231), bcic2a (0,263) y seed-v (0,278).
- Regresion con rendimiento negativo: en `seed-vig` el R2 es -0,848, lo que indica que las caracteristicas congeladas no capturan la variable objetivo mejor que una prediccion trivial.
- Este checkpoint concreto no es la configuracion recomendada por los autores: usa r = all en lugar de r = 9 cm, lo que puede penalizar el rendimiento en algunas tareas.
- El repositorio solo contiene el codificador: el predictor JEPA y el profesor EMA no estan incluidos, por lo que no se puede reanudar el preentrenamiento ni replicar el objetivo JEPA completo con estos pesos.
- Requisitos de entrada estrictos: muestreo a 200 Hz, unidades en voltios, posiciones de canal en metros y ausencia de estandarizacion previa (el wrapper aplica su propio escalado). Omitir estos requisitos degrada las representaciones.
- Todos los canales deben tener una posicion 3D valida; los canales sin metadatos de localizacion no pueden procesarse.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero obliga a citar la obra y conservar la atribucion; el codigo asociado esta bajo MIT.
- Dependencia del paquete `eeg_fm_masking` y de la interfaz `ContextualEncoderBenchmarkWrapper` para cargar los pesos correctamente; `strict=False` deja fuera el buffer de posiciones de canal y la cabeza de clasificacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado y sin soporte de terceros.
- Es un modelo de senal EEG: no genera texto, no soporta tool calling y no debe evaluarse con benchmarks de lenguaje o codigo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de sobreinterpretar embeddings ruidosos como evidencia clinica; no debe usarse para diagnostico medico sin validacion especifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rall_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo: https://github.com/PierreGtch/eeg-fm-masking
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/a8gdctp4
