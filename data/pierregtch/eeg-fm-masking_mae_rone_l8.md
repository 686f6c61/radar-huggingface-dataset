# PierreGtch/eeg-fm-masking_mae_rone_L8

## Resumen
eeg-fm-masking_mae_rone_L8 es un codificador (encoder) de senales EEG preentrenado mediante un autoencoder enmascarado (MAE, masked autoencoder). Lo publica PierreGtch como parte de un estudio controlado titulado "What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA". El modelo forma parte de una familia de 58 encoders entrenados con una receta identica en la que solo cambia la geometria del enmascaramiento: 5 radios espaciales x 6 longitudes temporales x 2 frameworks (MAE y JEPA). En esta variante concreta el radio espacial de mascara `r` cubre un unico canal y la longitud temporal `L` es de 8 parches.

El objetivo es servir como extractor de caracteristicas (feature extraction) sobre senales EEG: el encoder ve los parches no enmascarados y un decoder ligero reconstruye la senal cruda de los parches ocultos durante el preentrenamiento. El encoder resultante se congela despues y se evalua con una sonda ridge sobre las caracteristicas contextuales, dentro del banco de pruebas OpenEEGBench. El modelo tiene 12,69 millones de parametros en el encoder y un peso de repo de 0,1 GB, por lo que es muy ligero.

Es relevante ahora porque aporta evidencia empirica sobre que geometrias de enmascaramiento funcionan mejor en modelos fundacionales de EEG, un campo con menos modelos abiertos que el procesamiento de lenguaje o vision. La model card indica que la configuracion recomendada por el paper es r = 9 cm y L = 2, no la de este checkpoint concreto, que sirve como uno de los puntos de la rejilla experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches (patch tokeniser) y decoder ligero de reconstruccion (MAE); solo se distribuye el encoder |
| Parametros totales | 12.692.096 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa ventanas de EEG a 200 Hz cortadas en parches de 1 s, 200 muestras con solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors; no se documentan cuantizaciones GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (modelo de senales EEG, no textual) |
| Licencia | CC-BY-4.0 (pesos); codigo MIT |
| Formato de pesos | safetensors |
| Framework | MAE (masked autoencoder) |
| Radio espacial de mascara (`r`) | un canal |
| Longitud temporal de mascara (`L`) | 8 parches |
| Parametro del masker (`pct_unmasked`) | 0,45 |
| Checkpoint | epoca 10 de 10 (v9, el evaluado en el paper) |
| Tarea (pipeline) | feature-extraction |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | voltios (el wrapper multiplica por factor 1e+06 y aplica median_std_clip con sigma = 15) |
| Posiciones de canales | metros (MNE `info["chs"][i]["loc"][:3]`) |

## Arquitectura y entrenamiento
La arquitectura es un autoencoder enmascarado sobre parches de EEG. Un tokenizador de parches (`feature_encoder.*`) convierte la senal en tokens y un transformer (`model.*`) los procesa; durante el preentrenamiento un decoder ligero reconstruye la senal cruda de los parches enmascarados. El repo publica unicamente el encoder, que corresponde exactamente a los tensores cargados en la evaluacion downstream del paper. En el caso de la familia JEPA los pesos publicados serian el encoder estudiante, pero este checkpoint concreto es MAE.

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), seleccionado para que los pesos puedan redistribuirse. El calendario es de 10 epocas sobre 2 x H100, con batch size 600 por GPU, learning rate 0,00024 (warm-up de 3080 pasos y valor final 1e-06) y weight decay 0,01. La innovacion principal del trabajo no es arquitectonica sino experimental: 58 encoders se entrenan bajo receta identica variando solo la geometria de enmascaramiento, lo que permite aislar el efecto del radio espacial y la longitud temporal de la mascara. La model card indica que el paper recomienda r = 9 cm y L = 2, en lugar de la configuracion de este checkpoint (r = un canal, L = 8).

## Capacidades
- Extraccion de caracteristicas (feature extraction) sobre senales EEG: genera representaciones contextuales a partir de ventanas de senal.
- Aprendizaje autosupervisado: preentrenado con reconstruccion de parches enmascarados, sin necesidad de etiquetas.
- Independencia de montaje (montage-agnostic): funciona con cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros.
- Procesamiento a frecuencia de muestreo fija de 200 Hz, con segmentacion en parches de 1 s (200 muestras) y solapamiento de 20 muestras.
- Uso como backbone congelado para tareas downstream de clasificacion y regresion mediante sonda ridge (frozen encoder + ridge probe) en OpenEEGBench.
- Ajuste fino posterior sobre tareas especificas (la integracion con OpenEEGBench permite evaluacion y fine-tuning).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo especifico de dominio para EEG.

## Casos de uso
- Clasificacion de sueno: usar las caracteristicas del encoder congelado para tareas de estadificacion de sueno. En el dataset isruc-sleep la sonda ridge alcanza 0,644 de balanced accuracy, lo que lo hace util como extractor previo a un clasificador ligero.
- Deteccion de crisis epilepticas: en chbmit obtiene 0,891 de balanced accuracy, adecuado para pipelines de monitorizacion que necesiten distinguir segmentos ictales de interictales.
- Deteccion de anomalias en EEG clinico: en tuab logra 0,798 de balanced accuracy, util como etapa de cribado en revision de registros largos.
- Deteccion de eventos y artefactos: en tuev consigue 0,903 de balanced accuracy, apropiado para clasificar tipos de eventos en registros continuos.
- Clasificacion de carga cognitiva o tareas aritmeticas: en arithmetic_zyma2019 alcanza 0,720 de balanced accuracy, util en interfaces cerebro-computador experimentales.
- Apoyo al diagnostico de depresion a partir de EEG: en mdd_mumtaz2016 obtiene 0,863 de balanced accuracy, como componente de investigacion en biomarcadores.
- Investigacion comparativa de metodos de enmascaramiento: sirve como uno de los 58 puntos de la rejilla para estudiar el efecto de la geometria de mascara en el rendimiento downstream.
- Base para fine-tuning con pocas etiquetas: al ser un encoder ligero (12,69 M de parametros), permite adaptacion rapida a nuevas tareas EEG con coste computacional bajo.

## Benchmarks y rendimiento
Resultados downstream con encoder congelado y sonda ridge (regresion/clasificacion sobre caracteristicas contextuales aplanadas), 12 datasets x 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,720 ± 0,017 | 5 |
| bcic2020-3 | balanced acc. | 0,271 ± 0,015 | 5 |
| bcic2a | balanced acc. | 0,439 ± 0,007 | 5 |
| chbmit | balanced acc. | 0,891 ± 0,028 | 5 |
| faced | balanced acc. | 0,301 ± 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,644 ± 0,002 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,863 ± 0,005 | 5 |
| physionet | balanced acc. | 0,563 ± 0,010 | 5 |
| seed-v | balanced acc. | 0,287 ± 0,002 | 5 |
| seed-vig | R² | -0,112 ± 0,006 | 5 |
| tuab | balanced acc. | 0,798 ± 0,004 | 5 |
| tuev | balanced acc. | 0,903 ± 0,028 | 5 |

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja por el tamano del encoder (12,69 M de parametros). En fp32 ronda los 50 MB de pesos; en fp16 aproximadamente 25 MB. La memoria real dependera del tamano del lote y de la longitud de la senal procesada.
- GPU recomendadas: cualquier GPU moderna es suficiente; el preentrenamiento uso 2 x H100, pero la inferencia o la extraccion de caracteristicas no requieren ese hardware.
- Caben en GPU de consumo: si, con margen amplio en cualquier GPU consumer (por ejemplo RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el wrapper `ContextualEncoderBenchmarkWrapper`; integracion con `open_eeg_bench.backbone.PretrainedBackbone` para evaluacion y fine-tuning. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de datos de rendimiento, parametros o contexto de otros modelos comparables. La model card menciona que este checkpoint forma parte de un conjunto de 58 encoders de la misma familia: la variante recomendada por el paper es `eeg-fm-masking_mae_r9cm_L2` (MAE, r = 9 cm, L = 2) y su equivalente JEPA `eeg-fm-masking_jepa_r9cm_L2`. La comparacion con alternativas externas de modelos fundacionales de EEG: no disponible.

## Limitaciones y advertencias
- Modelo especifico de dominio EEG: no procesa texto, imagen ni audio, y no soporta tool calling ni razonamiento multi-paso.
- Requiere cumplir estrictamente el preprocesado: muestreo a 200 Hz, unidades en voltios, segmentacion en parches de 1 s con 20 muestras de solapamiento y escalado interno (factor 1e+06 y median_std_clip con sigma = 15). No se debe estandarizar la senal antes de introducirla.
- Necesita posiciones 3D de los canales en metros; sin ellas el modelo no puede construir las caracteristicas espaciales.
- Riesgo de rendimiento bajo en algunas tareas: los resultados downstream muestran balanced accuracy cercanos al azar en varios datasets (bcic2020-3 0,271; seed-v 0,287; faced 0,301) y un R² negativo en seed-vig (-0,112), lo que indica que la transferencia no es uniforme.
- Este checkpoint no es la configuracion recomendada por el paper, que sugiere r = 9 cm y L = 2. Usar este modelo si el objetivo es reproducir la rejilla experimental, no para obtener el mejor rendimiento de la familia.
- El decoder del MAE no se incluye en el repo; solo se publican los pesos del encoder.
- Licencia CC-BY-4.0 para los pesos: permite uso comercial con atribucion, pero obliga a citar la obra. El codigo es MIT. Conviene revisar los terminos de atribucion exigidos por el paper antes de un despliegue en produccion.
- Se trata de un modelo de investigacion: no se documentan validaciones clinicas ni recomendaciones de uso diagnostico.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rone_L8
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Checkpoint recomendado por el paper (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint recomendado por el paper (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Run de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/h4ckwdd0
