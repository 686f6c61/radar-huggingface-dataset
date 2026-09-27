# PierreGtch/eeg-fm-masking_mae_r12cm_L1

## Resumen

eeg-fm-masking_mae_r12cm_L1 es un codificador de senales EEG preentrenado mediante un autoencoder enmascarado (MAE, masked autoencoder). Lo publica PierreGtch como parte de un estudio controlado titulado *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. No es un modelo de lenguaje: es un modelo fundacional de dominio (EEG) disenado para extraccion de caracteristicas, no para generar texto. Su encoder tiene 12.692.096 parametros y se distribuye como pesos safetensors, con foco en servir de backbone congelado para tareas downstream (clasificacion y regresion sobre senales cerebrales).

El problema que resuelve es la falta de codificadores EEG comparables entre si: el repositorio entrena 58 encoders con una receta identica en la que solo cambia la geometria de enmascaramiento (5 radios espaciales x 6 longitudes temporales x 2 frameworks, MAE y JEPA). Este checkpoint concreto corresponde a un radio espacial r = 12 cm, una longitud temporal L = 1 parche y un parametro de masker pct_unmasked = 0.45. La ventaja de este diseno es que permite aislar el efecto de la geometria de enmascaramiento sobre el rendimiento downstream, algo poco habitual en modelos fundacionales de EEG.

Es relevante ahora porque los modelos fundacionales de senales fisiologicas estan ganando traccion para decodificacion neuronal, monitorizacion clinica y BCI, y este trabajo aporta una evaluacion reproducible (OpenEEGBench, encoder congelado + sonda ridge) sobre 12 datasets. La entrada no es texto: el modelo opera sobre series temporales EEG muestreadas a 200 Hz, cortadas en parches de 1 segundo, y es agnostico al montaje (funciona con cualquier numero y conjunto de canales siempre que tengan posicion 3D). Los autores recomiendan, no obstante, la configuracion r = 9 cm, L = 2 frente a esta variante r = 12 cm, L = 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con patch tokeniser (masked autoencoder, MAE) |
| Parametros totales | 12.692.096 (encoder; el decoder MAE no se incluye en el repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de senales EEG); entrada en parches de 1 s a 200 Hz, solapamiento de 20 muestras |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (no procesa texto; dominio: senales EEG) |
| Licencia | CC-BY-4.0 (pesos); codigo MIT |
| Formato de pesos | safetensors (model.safetensors); config.json + metadata.json |

## Arquitectura y entrenamiento

El modelo sigue el esquema de masked autoencoder: el encoder recibe los parches no enmascarados y un decoder ligero reconstruye la senal cruda de los parches enmascarados. Los tensores publicados incluyen solo el encoder (el tokeniser de parches `feature_encoder.*` y el transformer `model.*`), que son exactamente los que se cargan en la evaluacion downstream del paper; el decoder MAE no se distribuye. Para el framework JEPA, los pesos publicados corresponden al encoder del estudiante, tal como se evalua en el paper. La geometria de enmascaramiento de este checkpoint es r = 12 cm, L = 1 parche, con pct_unmasked = 0.45.

Los datos de preentrenamiento son el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido de forma que los pesos resultantes puedan redistribuirse bajo CC-BY-4.0. El entrenamiento consistio en 10 epocas sobre 2 x H100, con batch size 600 por GPU, learning rate 0.00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0.01. El checkpoint publicado es el de la epoca 10 de 10 (v9), el evaluado en el paper. La entrada requiere muestreo a 200 Hz y unidades en voltios: el wrapper interno multiplica por 1e+06 y aplica un escalado por ventana `median_std_clip` con recorte en sigma = 15, por lo que no debe estandarizarse la senal antes.

## Capacidades

- Extraccion de caracteristicas (feature extraction) sobre senales EEG crudas para alimentar clasificadores/regresores aguas abajo.
- Clasificacion de senales EEG mediante sonda ridge sobre las caracteristicas contextuales aplanadas (encoder congelado).
- Regresion de senales EEG (por ejemplo, la tarea `seed-vig` con metrica R²).
- Soporte agnostico al montaje: acepta cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros (MNE `info["chs"][i]["loc"][:3]`).
- Procesamiento de entradas a 200 Hz divididas en parches de 1 segundo con solapamiento de 20 muestras.
- Adaptacion a tareas nuevas mediante fine-tuning o extraccion congelada con el paquete `eeg_fm_masking` y OpenEEGBench.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Clasificacion de suenos (sleep staging): con el encoder congelado y una sonda ridge alcanza una exactitud balanceada de 0.659 ± 0.009 en el dataset isruc-sleep, lo que permite etiquetar fases del sueno a partir de EEG polisomnografico sin entrenar un modelo desde cero.
- Deteccion de crisis epilepticas: obtiene 0.863 ± 0.011 (exactitud balanceada) en chbmit, util para integrar como extractor de caracteristicas en sistemas de alerta clinica o monitorizacion continua.
- Deteccion de anomalias en EEG clinico (tuab): con 0.808 ± 0.002 en tuab, sirve como backbone para cribado de registros anormales antes de revision medica especializada.
- Clasificacion de eventos en EEG (tuev): 0.919 ± 0.031 en tuev, adecuado para pipelines que segmentan y clasifican eventos transitorios (por ejemplo, picos y artefactos) en registros largos.
- Apoyo al diagnostico de depresion a partir de EEG: alcanza 0.844 ± 0.016 (mdd_mumtaz2016), util como componente de investigacion en biomarcadores electrofisiologicos del trastorno depresivo mayor.
- Interfaces cerebro-computador (BCI) motoras: con 0.463 ± 0.012 en bcic2a, puede usarse como extractor de caracteristicas para decodificar imagenes motoras en prototipos de BCI, siendo consciente de que su rendimiento en esta tarea es moderado.
- Carga cognitiva y tareas aritmeticas: 0.654 ± 0.014 en arithmetic_zyma2019, aplicable a estudios de neuroergonomia que estimen carga mental a partir de EEG.
- Investigacion comparativa de metodos de preentrenamiento: al formar parte de 58 encoders con receta identica, es un punto de referencia controlado para estudiar el efecto de la geometria de enmascaramiento en el rendimiento downstream.

## Benchmarks y rendimiento

Resultados en OpenEEGBench con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas, 12 datasets x 5 semillas. Exactitud balanceada para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0.654 ± 0.014 | 5 |
| bcic2020-3 | exactitud balanceada | 0.258 ± 0.013 | 5 |
| bcic2a | exactitud balanceada | 0.463 ± 0.012 | 5 |
| chbmit | exactitud balanceada | 0.863 ± 0.011 | 5 |
| faced | exactitud balanceada | 0.317 ± 0.002 | 5 |
| isruc-sleep | exactitud balanceada | 0.659 ± 0.009 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0.844 ± 0.016 | 5 |
| physionet | exactitud balanceada | 0.580 ± 0.004 | 5 |
| seed-v | exactitud balanceada | 0.283 ± 0.002 | 5 |
| seed-vig | R² | -0.082 ± 0.004 | 5 |
| tuab | exactitud balanceada | 0.808 ± 0.002 | 5 |
| tuev | exactitud balanceada | 0.919 ± 0.031 | 5 |

No se han publicado en la informacion disponible comparaciones numericas con modelos de terceros (por ejemplo, contra otros modelos fundacionales de EEG) distintas a estos resultados absolutos.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder tiene 12,69 M de parametros; en fp32 ocupa aproximadamente 51 MB de pesos y en fp16 unos 25 MB, por lo que el uso de memoria es muy reducido y dominado por el tamano de las activaciones y del lote de senales.
- GPU recomendadas: el modelo cabe holgadamente en cualquier GPU moderna; el entrenamiento de referencia se hizo con 2 x H100 (batch 600 por GPU) por requisitos de throughput, no de memoria.
- GPU de consumo: si, cabe en tarjetas consumer (RTX 3060, RTX 4090, etc.) e incluso puede ejecutarse en CPU para lotes pequenos, dado el bajo numero de parametros.
- Opciones de despliegue: no se soportan servidores genericos tipo vLLM, llama.cpp, Ollama o TGI (no es un LLM ni usa GGUF). El despliegue se realiza via el paquete `eeg_fm_masking` (`ContextualEncoderBenchmarkWrapper`) y OpenEEGBench (`PretrainedBackbone`) sobre PyTorch.
- Latencia y throughput estimados: no disponible (no se publican mediciones de latencia o throughput en la informacion proporcionada).

## Comparativa con modelos similares

Comparativa con las variantes recomendadas del mismo estudio, entrenadas con receta identica y unica diferencia en la geometria de enmascaramiento:

| Modelo | Framework | Geometria de mascara | Parametros encoder | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r12cm_L1 | MAE | r = 12 cm, L = 1 | 12,69 M | EEG 200 Hz, parches de 1 s | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 (recomendado por el paper) | no disponible (misma receta) | EEG 200 Hz, parches de 1 s | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 (recomendado por el paper) | no disponible (misma receta) | EEG 200 Hz, parches de 1 s | CC-BY-4.0 | HuggingFace |

No disponible comparacion con modelos fundacionales de EEG de otros autores (por ejemplo, otros backbones publicados en OpenEEGBench), ya que la informacion proporcionada no incluye sus cifras.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y las categorias de idiomas o cuantizacion no aplican.
- El repo contiene solo el encoder; el decoder MAE no se distribuye, por lo que no puede reproducirse la tarea de reconstruccion directamente con estos pesos.
- Rendimiento desigual segun la tarea: los resultados son bajos en bcic2020-3 (0.258), seed-v (0.283) y faced (0.317), y la regresion `seed-vig` presenta un R² negativo (-0.082), lo que indica un ajuste peor que la media del objetivo en esa tarea.
- La entrada debe respetar el formato exacto: 200 Hz, unidades en voltios y canales con posiciones 3D en metros. Cargar con `strict=False` deja fuera el buffer de posiciones de canal y la cabeza de clasificacion, que dependen del dataset.
- No debe aplicarse estandarizacion previa a la senal: el wrapper aplica su propio escalado `median_std_clip`.
- Sesgos conocidos: no disponible (no se documenta analisis de sesgos en la informacion proporcionada).
- Riesgo de alucinacion: no aplica en el sentido generativo; al ser un extractor de caracteristicas, el riesgo relevante es de generalizacion limitada a montajes, poblaciones o equipos distintos de los del corpus REVE (323 grabaciones).
- Licencia de uso comercial: los pesos se publican bajo CC-BY-4.0, que permite uso comercial con atribucion; el codigo es MIT. Debe citarse el paper al usar los modelos.
- Caveat de produccion: al depender de codigo propio (`eeg_fm_masking`) y no de stacks de inferencia estandar, la integracion en produccion exige mantener el wrapper y el preprocesado asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r12cm_L1
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub, licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Run de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/0e8r79dk
- OpenEEGBench (framework de evaluacion): no disponible como enlace directo en la informacion proporcionada
