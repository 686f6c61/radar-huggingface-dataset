# PierreGtch/eeg-fm-masking_mae_r12cm_L2

## Resumen

eeg-fm-masking_mae_r12cm_L2 es un codificador (encoder) preentrenado para senales de electroencefalografia (EEG), desarrollado por PierreGtch dentro de un estudio controlado sobre geometrias de enmascaramiento en modelos fundacionales de EEG. Forma parte de una familia de 58 codificadores entrenados con una receta identica en la que solo varia la geometria de masking: 5 radios espaciales x 6 longitudes temporales x 2 marcos (MAE y JEPA). Este modelo concreto corresponde a un enmascaramiento con radio espacial r = 12 cm y longitud temporal L = 2 parches dentro del marco MAE.

El modelo tiene 12.692.096 parametros (unos 12,69 M) y se distribuye como pesos safetensors de solo encoder (tokenizador de parches mas transformer), que son exactamente los tensores cargados en la evaluacion downstream del paper. Es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D. Su proposito es servir como extractor de caracteristicas congeladas para tareas de clasificacion y regresion sobre EEG mediante sondas ligeras.

Es relevante ahora porque forma parte de un esfuerzo por caracterizar de forma sistematica que geometria de enmascaramiento produce mejores representaciones EEG, un campo hasta hace poco dominado por recetas ad hoc. No obstante, los propios autores recomiendan la variante r = 9 cm, L = 2, por lo que este checkpoint r = 12 cm debe considerarse una pieza de un barrido comparativo mas que el modelo recomendado de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches, entrenado como masked autoencoder (MAE) |
| Parametros totales | 12.692.096 (~12,69 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; entrada segmentada en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 0,1 GB) |
| Idiomas soportados | no disponible (entrada de senales EEG, no texto) |
| Licencia | CC-BY-4.0 para los pesos; codigo bajo MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un masked autoencoder: el encoder procesa unicamente los parches no enmascarados y un decoder ligero reconstruye la senal cruda de los parches enmascarados durante el preentrenamiento. En este repo solo se publica el encoder (tensores `feature_encoder.*` y `model.*`), no el decoder MAE. La entrada se corta en parches de 1 s (200 muestras a una frecuencia de muestreo fija de 200 Hz) con un solapamiento de 20 muestras. La geometria de masking de este checkpoint usa radio espacial r = 12 cm, longitud temporal L = 2 parches y un parametro de masker `pct_unmasked` = 0.45. El wrapper multiplica la senal por factor 1e+06 y aplica un escalado por ventana `median_std_clip` (clip en sigma = 15), por lo que los datos no deben estandarizarse previamente. Las posiciones de canal se expresan en metros.

Los datos de preentrenamiento corresponden al subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El entrenamiento se hizo en 10 epocas sobre 2 x H100, con tamano de batch de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos y valor final 1e-06) y weight decay de 0,01. El checkpoint publicado es el de la epoca 10 de 10 (v9), el evaluado en el paper. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no se trata de un modelo generativo de lenguaje.

## Capacidades

- Extraccion de caracteristicas (feature extraction) sobre senales EEG: genera representaciones contextuales por parche que pueden alimentar clasificadores o regresores posteriores.
- Independencia de montaje: funciona con cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros (`info["chs"][i]["loc"][:3]`).
- Preentrenamiento auto-supervisado orientado a representaciones transferibles: en la evaluacion con encoder congelado y sonda ridge alcanza resultados competitivos en varias tareas EEG.
- Soporte de fine-tuning: el wrapper `ContextualEncoderBenchmarkWrapper` esta preparado para cargarse tanto en modo congelado como para ajuste con OpenEEGBench.
- Salida de caracteristicas contextuales apta para sonda plana (flattened contextual features).
- No dispone de generacion de texto, razonamiento verbal, codigo, matematicas, vision ni tool calling: es un modelo especializado en senales biologicas, no en lenguaje natural.
- No se documenta soporte de agentes ni de razonamiento multi-paso.

## Casos de uso

- Clasificacion de etapas de sueno: el modelo alcanza una balanced accuracy de 0,682 +/- 0,003 en isruc-sleep, lo que lo hace util como extractor congelado para pipelines de puntuacion de sueno sin necesidad de reentrenar el encoder.
- Deteccion de eventos epilepticos: en chbmit logra 0,841 +/- 0,032 y en tuev 0,899 +/- 0,029, resultados adecuados para sistemas de cribado de crisis o de deteccion de anomalias en monitorizacion prolongada.
- Cribado de depresion a partir de EEG: en mdd_mumtaz2016 consigue 0,834 +/- 0,028, aprovechable en estudios de biomarcadores electrofisiologicos.
- Deteccion de anormalidades generales en EEG: en tuab obtiene 0,806 +/- 0,003, util para triaje automatico de registros clinicos.
- Analisis de carga cognitiva y tareas aritmeticas: en arithmetic_zyma2019 alcanza 0,728 +/- 0,024, aplicable a interfaces neuroadaptativas o estudios de carga mental.
- Investigacion comparativa de modelos fundacionales de EEG: por formar parte de un barrido controlado de 58 encoders, sirve para aislar el efecto de la geometria de masking (aqui r = 12 cm, L = 2 parches) manteniendo el resto de la receta constante.
- Base para fine-tuning en montajes propios: al ser agnostico al montaje y admitir canales arbitrarios con posicion 3D, puede reutilizarse en cohortes con configuraciones de electrodos distintas a las del preentrenamiento.

## Benchmarks y rendimiento

Resultados con encoder congelado y sonda ridge sobre las caracteristicas contextuales aplanadas (12 conjuntos de datos x 5 semillas; balanced accuracy para clasificacion y R2 para seed-vig):

| Dataset | Metrica | Resultado (media +/- sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,728 +/- 0,024 | 5 |
| bcic2020-3 | balanced acc. | 0,261 +/- 0,018 | 5 |
| bcic2a | balanced acc. | 0,475 +/- 0,004 | 5 |
| chbmit | balanced acc. | 0,841 +/- 0,032 | 5 |
| faced | balanced acc. | 0,332 +/- 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,682 +/- 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,834 +/- 0,028 | 5 |
| physionet | balanced acc. | 0,569 +/- 0,003 | 5 |
| seed-v | balanced acc. | 0,286 +/- 0,002 | 5 |
| seed-vig | R2 | -0,118 +/- 0,006 | 5 |
| tuab | balanced acc. | 0,806 +/- 0,003 | 5 |
| tuev | balanced acc. | 0,899 +/- 0,029 | 5 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos externos mas alla de los de la propia familia del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 12,69 M de parametros, los pesos ocupan aproximadamente 51 MB en fp32 y unos 25 MB en fp16. Las activaciones dependen del numero de canales y de la duracion de la ventana, pero son del orden de decenas de MB, por lo que la huella total es muy reducida.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; el modelo se entreno en 2 x H100, pero para inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: la via oficial es PyTorch junto con el paquete `eeg-fm-masking` (via `pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y el wrapper `ContextualEncoderBenchmarkWrapper`; tambien es cargable mediante `open_eeg_bench.backbone.PretrainedBackbone`. No aplican servidores orientados a LLM como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la informacion proporcionada. La comparacion mas directa posible es con los modelos hermanos del mismo estudio, entrenados con receta identica y distinta geometria de masking.

| Modelo | Marco | Geometria de masking | Parametros del encoder | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r12cm_L2 (este) | MAE | r = 12 cm, L = 2 | 12,69 M | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 (recomendado en el paper) | no disponible | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 (recomendado en el paper) | no disponible | CC-BY-4.0 | HuggingFace |

Los autores recomiendan explicitamente la configuracion r = 9 cm, L = 2 (tanto en MAE como en JEPA) por encima de este checkpoint. No se dispone de informacion en la busqueda para comparar con otras familias de modelos fundacionales de EEG.

## Limitaciones y advertencias

- Frecuencia de muestreo fija: la entrada debe estar a 200 Hz y cortarse en parches de 1 s (200 muestras) con 20 muestras de solapamiento.
- Unidades y escalado obligatorios: la senal debe estar en voltios y no debe estandarizarse antes; el wrapper aplica el factor 1e+06 y el escalado `median_std_clip` por si mismo.
- Dependencia de posiciones 3D: cada canal debe aportar una posicion en metros, con lo que montajes sin informacion de localizacion no pueden usarse directamente.
- Datos de preentrenamiento limitados: solo 323 grabaciones del subconjunto abierto de REVE, lo que puede reducir la generalizacion a dominios muy distintos.
- Rendimiento cercano al azar en varias tareas: bcic2020-3 (0,261), seed-v (0,286) y faced (0,332) indican una capacidad discriminativa muy baja en esos conjuntos, y seed-vig presenta un R2 negativo (-0,118), es decir, peor que predecir la media. No deberia desplegarse en produccion clinica para estas tareas sin un ajuste especifico.
- No es el checkpoint recomendado: el propio paper recomienda la variante r = 9 cm; este modelo r = 12 cm debe tratarse como parte de un barrido comparativo.
- Ausencia del decoder: el repo contiene solo el encoder, por lo que no sirve para reconstruccion de senal con el decoder MAE original.
- Riesgo de sesgo de dominio: al entrenarse en un corpus concreto, las representaciones pueden no transferir bien a poblaciones, equipos o protocolos diferentes.
- Licencia: los pesos son CC-BY-4.0, lo que permite uso comercial pero exige atribucion; el codigo asociado es MIT.
- Caveat de produccion: al evaluarse con encoder congelado y sonda ridge, los resultados no reflejan necesariamente el rendimiento tras fine-tuning completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r12cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Codigo (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Web del paper: https://pierregtch.github.io/eeg-fm-masking
- Run de entrenamiento (WandB): https://wandb.ai/pierregtch/chan-inv-clf/runs/eeidax1z
- Modelo recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
