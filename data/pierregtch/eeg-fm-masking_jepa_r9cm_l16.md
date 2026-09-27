# PierreGtch/eeg-fm-masking_jepa_r9cm_L16

## Resumen

eeg-fm-masking_jepa_r9cm_L16 es un codificador (encoder) de EEG preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del trabajo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de uno de los 58 encoders entrenados con una receta identica en la que solo varia la geometria del enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento. Este checkpoint concreto emplea el marco JEPA (joint-embedding predictive architecture) con un radio espacial de mascara de 9 cm y una longitud temporal de 16 patches.

El modelo es un transformer de 12,69 millones de parametros (12.692.096 segun el fichero safetensors) que actua como extractor de caracteristicas sobre senales EEG. Trabaja a una frecuencia de muestreo fija de 200 Hz, trocea la senal en patches de 1 segundo (200 muestras con solapamiento de 20 muestras) y es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D asociada. El repositorio publica unicamente el encoder (tokenizador de patches mas transformer), no el predictor JEPA ni el teacher EMA.

Su relevancia es metodologica y practica: forma parte de un estudio controlado sobre como afecta la geometria de enmascaramiento al rendimiento de los foundation models de EEG, y se distribuye con pesos redistribuibles (entrenado sobre el subconjunto con licencia abierta del corpus REVE) bajo licencia CC-BY-4.0, lo que facilita su uso como backbone congelado en pipelines de investigacion. El propio articulo recomienda la configuracion r = 9 cm, L = 2 por encima de esta variante L = 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tokenizador de patches + transformer) entrenado con marco JEPA (student encoder, EMA teacher y predictor durante el preentrenamiento; solo se publica el encoder student) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor unico; la senal se trocea en patches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) y la ventana se define con `n_times` en el wrapper |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no aplica (modelo de senales EEG, no de lenguaje) |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`, encoder unicamente) |

Parametros de enmascaramiento de este checkpoint: radio espacial `r` = 9 cm, longitud temporal `L` = 16 patches, `pct_unmasked` = 0,45. Checkpoint de la epoca 10 de 10 (version `v9`, la evaluada en el articulo). Run de entrenamiento: `8e9ucmvt`.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo ViT adaptado a EEG: un tokenizador de patches (`feature_encoder.*`) convierte la senal en representaciones por patch y un transformer (`model.*`) las procesa de forma contextual. El preentrenamiento sigue el marco JEPA: un predictor proyecta el contexto codificado por el student encoder hacia los embeddings que un teacher EMA produce para los patches enmascarados, sin regularizador de varianza/covarianza. Durante la inferencia y la evaluacion aguas abajo solo se emplea el encoder student, que es exactamente el contenido publicado en el repositorio.

Los datos de preentrenamiento son el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El calendario de entrenamiento fue de 10 epocas en 2 × H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay de 0,01. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

La innovacion central no es la arquitectura en si, sino la evaluacion controlada de la geometria de enmascaramiento (radio espacial y longitud temporal) manteniendo identica el resto de la receta, lo que permite aislar el efecto de cada parametro de mascara sobre el rendimiento en tareas aguas abajo.

## Capacidades

- Extraccion de caracteristicas (feature extraction) sobre senales EEG a 200 Hz: es la tarea declarada del modelo (`feature-extraction`).
- Codificacion contextual de patches de 1 segundo con solapamiento de 20 muestras.
- Funcionamiento agnostico al montaje: admite cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros (formato MNE `info["chs"][i]["loc"][:3]`).
- Preprocesado integrado en el wrapper: multiplica por `factor = 1e+06` y aplica escalado por ventana `median_std_clip` con recorte en σ = 15; no requiere estandarizacion previa de los datos.
- Uso como backbone congelado evaluable con OpenEEGBench (regresion/clasificacion ridge sobre las caracteristicas contextuales aplanadas).
- Fine-tuning aguas abajo mediante `PretrainedBackbone` de OpenEEGBench.
- Generacion de texto, codigo, matematicas, vision, audio, tool calling y razonamiento multi-paso: no disponibles (el modelo no cubre esas capacidades).

## Casos de uso

- Clasificacion de patologias cerebrales a partir de EEG en contexto clinico de investigacion: el encoder puede congelarse y servir de base para un clasificador ridge, como demuestra su rendimiento en `tuab` (balanced accuracy 0,800 ± 0,005) y `tuev` (0,906 ± 0,027).
- Deteccion de crisis epilepticas: con balanced accuracy de 0,919 ± 0,016 en `chbmit`, es adecuado como extractor de caracteristicas para sistemas de alerta sobre registros EEG continuos.
- Monitorizacion del sueno: clasificacion de fases del sueno en `isruc-sleep` (0,646 ± 0,002) como parte de un pipeline de puntuacion automatica de polisomnografias.
- Estudio de la depresion mediante EEG: en `mdd_mumtaz2016` alcanza 0,806 ± 0,018, util para protocolos de investigacion que buscan biomarcadores electrofisiologicos.
- Carga cognitiva y tareas aritmeticas: en `arithmetic_zyma2019` obtiene 0,697 ± 0,028, aplicable a interfaces cerebro-computador experimentales.
- Evaluacion comparativa de metodos de enmascaramiento: sirve directamente como uno de los 58 encoders del estudio controlado, permitiendo reproducir comparaciones entre geometrias de mascara y marcos MAE/JEPA.
- Investigacion sobre foundation models de bioseriales: al ser un backbone pequeno (12,69 M) y con licencia CC-BY-4.0, es util para experimentar con representaciones preentrenadas en dominios distintos al lenguaje.
- Analisis de interfaces cerebro-computador (BCI): es aplicable a tareas motoras aunque con rendimiento limitado, como refleja `bcic2a` (0,391 ± 0,006) y `bcic2020-3` (0,294 ± 0,010).

## Benchmarks y rendimiento

Resultados aguas abajo con encoder congelado (frozen encoder + sonda ridge) sobre OpenEEGBench, 12 conjuntos de datos × 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,697 ± 0,028 | 5 |
| bcic2020-3 | balanced acc. | 0,294 ± 0,010 | 5 |
| bcic2a | balanced acc. | 0,391 ± 0,006 | 5 |
| chbmit | balanced acc. | 0,919 ± 0,016 | 5 |
| faced | balanced acc. | 0,249 ± 0,009 | 5 |
| isruc-sleep | balanced acc. | 0,646 ± 0,002 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,806 ± 0,018 | 5 |
| physionet | balanced acc. | 0,487 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,300 ± 0,001 | 5 |
| seed-vig | R² | -0,399 ± 0,161 | 5 |
| tuab | balanced acc. | 0,800 ± 0,005 | 5 |
| tuev | balanced acc. | 0,906 ± 0,027 | 5 |

No se han publicado en la informacion disponible tablas comparativas directas de este checkpoint frente a modelos externos; el articulo compara internamente las 58 variantes de la coleccion.

## Requisitos de hardware

- VRAM para inferencia: muy baja. Con 12,69 M de parametros, los pesos ocupan aproximadamente 50 MB en fp32 (unos 25 MB en fp16/bf16) y cabe sobradamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento original uso 2 × H100, pero la inferencia y el ajuste de una sonda ridge se pueden ejecutar en GPU de consumo (RTX 3060, RTX 4090, etc.) o incluso en CPU para lotes pequenos.
- Compatibilidad con GPU de consumo: si, en toda la gama consumer actual y tambien en CPU, dado el reducido tamano del encoder.
- Opciones de despliegue: el modelo no sigue el ecosistema de LLM; se despliega con PyTorch cargando el wrapper `ContextualEncoderBenchmarkWrapper` y `safetensors`, o integrado en OpenEEGBench mediante `PretrainedBackbone`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion mas directa es dentro de la propia coleccion de 58 encoders (misma receta, distinta geometria de mascara). No se dispone de datos comparativos con modelos externos en la informacion facilitada.

| Modelo | Marco | Radio `r` | Longitud `L` | Parametros | Licencia |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r9cm_L16 (este) | JEPA | 9 cm | 16 | 12,69 M | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 | 12,69 M (misma receta) | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 | 12,69 M (misma receta) | CC-BY-4.0 |

El articulo recomienda la configuracion r = 9 cm, L = 2 por encima de la variante L = 16 que representa este checkpoint, tanto en su version MAE como JEPA. Comparativas con modelos de EEG de terceros: no disponibles.

## Limitaciones y advertencias

- El repositorio contiene unicamente el encoder; el predictor JEPA y el teacher EMA no se publican, por lo que no puede reproducirse el pipeline completo de preentrenamiento desde estos pesos.
- Rendimiento muy bajo en varias tareas: balanced accuracy proxima al azar en `faced` (0,249), `bcic2020-3` (0,294) y `seed-v` (0,300), y R² negativo en `seed-vig` (-0,399 ± 0,161). No es adecuado para esas tareas sin un ajuste adicional.
- Los resultados publicados corresponden a evaluacion con encoder congelado y sonda ridge; no reflejan el rendimiento con fine-tuning completo.
- Requisitos de entrada estrictos: frecuencia de muestreo de 200 Hz, canales con posicion 3D en metros y unidades en voltios con el escalado del wrapper. Pasar datos mal acondicionados degrada el resultado.
- Sesgos conocidos: no disponibles. Al proceder del subconjunto abierto de REVE (323 grabaciones), la cobertura de poblaciones, montajes y dispositivos puede ser limitada.
- Riesgo de alucinacion: no aplica en el sentido generativo; el modelo es un extractor de caracteristicas, pero sus predicciones pueden ser erroneas y no deben usarse con fines diagnosticos sin validacion clinica.
- Restricciones de licencia: los pesos son CC-BY-4.0 (requieren atribucion) y el codigo es MIT; es necesario citar el articulo segun las indicaciones del repositorio de GitHub.
- Uso en produccion: no se documentan garantias de latencia, throughput ni robustez fuera de los conjuntos de evaluacion de OpenEEGBench.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L16
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Run de entrenamiento (WandB): https://wandb.ai/pierregtch/chan-inv-clf/runs/8e9ucmvt
- Checkpoints relacionados: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2 y https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
