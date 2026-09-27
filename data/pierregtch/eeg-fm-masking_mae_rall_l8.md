# PierreGtch/eeg-fm-masking_mae_rall_L8

## Resumen

eeg-fm-masking_mae_rall_L8 es un codificador de electroencefalografía (EEG) preentrenado, desarrollado por PierreGtch, que forma parte de una colección de 58 encoders entrenados bajo una receta idéntica en la que solo varía la geometría de enmascaramiento. Concretamente, este modelo emplea un esquema de autoencoder enmascarado (MAE, *masked autoencoder*) con un radio espacial de enmascaramiento que abarca todos los canales (`r = all`) y una longitud temporal de 8 parches (`L = 8`). Tiene 12,69 millones de parámetros en el encoder y se distribuye únicamente como extractor de características congeladas, orientado a la evaluación y el ajuste en tareas downstream de EEG.

El modelo resuelve el problema de obtener representaciones transferibles de señales electrofisiológicas sin necesidad de etiquetas, de modo que sirva como *backbone* para clasificación y regresión sobre múltiples datasets neurológicos (sueño, epilepsia, interfaces cerebro-computador, potenciales evocados, etc.). Es relevante ahora porque forma parte de un estudio controlado —publicado en el artículo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*— que aísla el efecto de la geometría de enmascaramiento sobre el rendimiento downstream, un aspecto poco explorado en los modelos fundacionales de EEG.

La arquitectura es un transformer tipo ViT sobre parches de 1 segundo de señal (200 muestras a 200 Hz, con solapamiento de 20 muestras), montage-agnóstico (admite cualquier número y disposición de canales siempre que tengan coordenadas 3D). El modelo se entrenó sobre el subconjunto de licencia abierta del corpus REVE (323 grabaciones) durante 10 épocas en 2 GPU H100. Este *checkpoint* concreto (`r = all`, `L = 8`) no es el recomendado por el artículo: los autores sugieren `r = 9 cm`, `L = 2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ViT sobre parches de EEG, entrenado como masked autoencoder (MAE); el repo publica solo el encoder |
| Parametros totales | 12.692.096 (encoder; el decoder MAE no se incluye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en tokens; la entrada son parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras). Ventana total no disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ indicadas) |
| Idiomas soportados | No aplica (modelo de senales EEG, no linguistico) |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue un paradigma de autoencoder enmascarado. La señal EEG se tokeniza en parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento entre parches consecutivos) y un encoder tipo transformer procesa los parches no enmascarados. Durante el preentrenamiento, un decoder ligero reconstruye la señal cruda de los parches enmascarados; en la versión publicada se conserva únicamente el encoder (tokenizador de parches `feature_encoder.*` más el transformer `model.*`), que es exactamente el conjunto de tensores cargado en la evaluación downstream del artículo. El modelo es montage-agnóstico: funciona con cualquier número y disposición de canales siempre que cada electrodo disponga de una posición 3D (en metros, formato MNE `info["chs"][i]["loc"][:3]`).

La geometría de enmascaramiento define este *checkpoint*: radio espacial `r = all` (todos los canales) y longitud temporal `L = 8` parches, con un parámetro `pct_unmasked = 0.45`. El preentrenamiento empleó el subconjunto de licencia abierta del corpus REVE (323 grabaciones), eligido para que los pesos puedan redistribuirse. El calendario de entrenamiento fue de 10 épocas en 2 GPU H100, con tamaño de lote 600 por GPU, *learning rate* 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y *weight decay* 0,01. El *checkpoint* publicado corresponde a la época 10 de 10 (identificador `v9`, el evaluado en el artículo). No se mencionan en la información disponible fases de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Extracción de características de señales EEG: produce representaciones contextuales a partir de ventanas de señal, aptas para clasificación y regresión mediante una sonda (ridge probe) congelada.
- Clasificación de tareas neurofisiológicas: interfaces cerebro-computador (bcic2a, bcic2020-3), detección de crisis epilépticas (chbmit), estadios de sueño (isruc-sleep), potenciales evocados (faced), detección de anomalías EEG (tuab, tuev), entre otras.
- Regresión sobre señales EEG: el artículo evalúa la tarea `seed-vig` con métrica R².
- Independencia del montaje: admite cualquier conjunto y número de canales, incluidas configuraciones no vistas durante el preentrenamiento, ya que solo requiere coordenadas 3D por canal.
- No es un modelo de lenguaje ni de visión; no dispone de *tool calling*, *function calling*, capacidades de agente ni *thinking mode*.
- No soporta generación de texto, código ni matemáticas; su salida es un vector de características.

## Casos de uso

- Clasificación de estadios de sueño: el encoder puede alimentar un clasificador ligero para segmentar registro polisomnográficos en fases de sueño, aprovechando que ha sido preentrenado con ventanas de 1 s y evaluado en `isruc-sleep`.
- Detección de crisis epilépticas: integrado como extractor congelado seguido de una sonda, permite monitorizar señales EEG continuas en entornos clínicos (dataset `chbmit`), sin necesidad de reentrenar el backbone.
- Interfaces cerebro-computador: la representación contextual sirve como entrada para decodificar intención motora en tareas tipo `bcic2a` o `bcic2020-3`, útil en investigación de neurorrehabilitación.
- Investigación en biomarcadores psiquiátricos: con el dataset `mdd_mumtaz2016` (depresión mayor), el modelo puede servir de base para pipelines de extracción de biomarcadores electrofisiológicos.
- Evaluación comparativa de modelos fundacionales de EEG: al ser uno de los 58 encoders de la colección con receta idéntica, es útil para estudiar el efecto de la geometría de enmascaramiento en experimentos controlados.
- Preentrenamiento por transferencia a nuevos datasets: dado su carácter montage-agnóstico, se puede usar para inicializar modelos en datasets propios con distinta disposición de electrodos, ajustando solo la cabeza de clasificación.
- Prototipado rápido en investigación: su reducido tamaño (12,69 M de parámetros) permite iterar en CPU o GPU de gama media durante el desarrollo de pipelines de neurociencia computacional.

## Benchmarks y rendimiento

Resultados downstream reportados en la model card: encoder congelado y sonda ridge sobre las características contextuales aplanadas, 12 datasets y 5 semillas. Balanced accuracy para clasificación y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,667 ± 0,010 | 5 |
| bcic2020-3 | balanced acc. | 0,282 ± 0,009 | 5 |
| bcic2a | balanced acc. | 0,380 ± 0,008 | 5 |
| chbmit | balanced acc. | 0,866 ± 0,023 | 5 |
| faced | balanced acc. | 0,285 ± 0,005 | 5 |
| isruc-sleep | balanced acc. | 0,616 ± 0,002 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,822 ± 0,013 | 5 |
| physionet | balanced acc. | 0,529 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,270 ± 0,003 | 5 |
| seed-vig | R² | -0,341 ± 0,013 | 5 |
| tuab | balanced acc. | 0,754 ± 0,013 | 5 |
| tuev | balanced acc. | 0,897 ± 0,044 | 5 |

No se han publicado en la información disponible comparaciones numéricas frente a modelos externos al estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. El encoder tiene 12,69 M de parámetros, lo que equivale a aproximadamente 51 MB en fp32 y unos 25 MB en fp16. La memoria adicional depende principalmente del tamaño del lote y del número de parches de entrada.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4-6 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso es viable ejecutarlo en CPU para ventanas cortas.
- GPUs de centro de datos (A100, H100) solo serían necesarias para reentrenamiento, no para inferencia. El preentrenamiento original usó 2 × H100 con tamaño de lote 600 por GPU.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de texto. El uso previsto es mediante la librería `eeg_fm_masking` (instalable con `pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y la clase `ContextualEncoderBenchmarkWrapper`, o a través de `open_eeg_bench.backbone.PretrainedBackbone`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos externos comparables en la información proporcionada. La comparación más directa es con los propios modelos hermanos de la colección del mismo estudio, que comparten receta y solo difieren en la geometría de enmascaramiento:

| Modelo | Framework | Radio espacial r | Longitud temporal L | Parametros | Licencia |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_rall_L8 (este) | MAE | all (todos los canales) | 8 parches | 12,69 M | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | 12,69 M (misma receta) | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | 12,69 M (misma receta) | CC-BY-4.0 |

El artículo recomienda la configuración `r = 9 cm, L = 2` frente a la de este *checkpoint*, tanto en versión MAE como JEPA. Para otros modelos fundacionales de EEG (por ejemplo, LaBraM, EEGPT u otros), los datos comparativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El *checkpoint* publicado no es la configuración recomendada por los autores: el artículo sugiere `r = 9 cm, L = 2` por mejor rendimiento, por lo que este modelo debe considerarse una variante de estudio controlado más que una opción óptima por defecto.
- Sesgos conocidos: al entrenarse sobre el subconjunto abierto del corpus REVE (323 grabaciones), las representaciones pueden estar sesgadas hacia la distribución de esos registros (población, equipos, protocolos), lo que puede degradar el rendimiento en cohortes distintas.
- Riesgo de sobreajuste en tareas concretas: en varios datasets downstream el balanced accuracy es bajo (por ejemplo, 0,270 en `seed-v`, 0,282 en `bcic2020-3`), lo que indica una capacidad de transferencia limitada para ciertas tareas.
- La métrica R² es negativa en `seed-vig` (-0,341), lo que sugiere que las características congeladas no capturan adecuadamente esa tarea de regresión.
- Restricciones de licencia: los pesos se distribuyen bajo CC-BY-4.0, lo que permite uso comercial siempre que se atribuya la autoría; el código es MIT. Es imprescindible citar el artículo correspondiente.
- Requisitos de entrada estrictos: la señal debe muestrearse a 200 Hz y estar en voltios; el wrapper aplica internamente un factor de 1e+06 y un escalado `median_std_clip` con recorte en σ = 15, por lo que no debe estandarizarse previamente.
- Los canales deben tener posición 3D en metros; sin coordenadas válidas el modelo no puede explotar la información espacial.
- No se documentan tasas de alucinación ni sesgos de contenido porque el modelo no genera texto: solo produce representaciones numéricas.
- No se incluye el decoder MAE en el repositorio, por lo que no se puede reproducir la fase de reconstrucción de parches sin entrenar uno propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rall_L8
- Colección completa de los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código fuente (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/c9pyckaw
