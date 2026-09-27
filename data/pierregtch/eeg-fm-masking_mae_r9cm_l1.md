# PierreGtch/eeg-fm-masking_mae_r9cm_L1

## Resumen

`eeg-fm-masking_mae_r9cm_L1` es un encoder de electroencefalografía (EEG) preentrenado mediante autoaprendizaje supervisado, publicado en HuggingFace por el autor PierreGtch (usuario `PierreGtch`). Forma parte de la colección de 58 encoders presentados en el artículo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*, en el que todos los modelos se entrenan con una receta idéntica y la única variable que cambia es la geometría del enmascaramiento: 5 radios espaciales, 6 longitudes temporales y 2 marcos de preentrenamiento (MAE y JEPA). Este checkpoint concreto corresponde al marco MAE con radio espacial `r = 9 cm` y longitud temporal `L = 1` parche.

El modelo resuelve un problema recurrente en el ámbito de los foundation models para EEG: no existía una evaluación controlada que aislase qué configuración de enmascaramiento produce mejores representaciones transferibles. En lugar de proponer una arquitectura nueva, el trabajo fija el resto de variables y publica los 58 puntos del espacio de búsqueda, lo que permite comparar directamente el efecto de cada geometría. Con 12.692.096 parámetros en el encoder y un repositorio de 0,1 GB, es un modelo pequeño orientado a extracción de características y a evaluación con encoder congelado más sonda ridge sobre el benchmark OpenEEGBench.

Es relevante ahora porque ofrece un punto de partida reproducible y ligero para tareas de decodificación EEG con pocas etiquetas, y porque el propio artículo recomienda una configuración distinta a la de este checkpoint (`r = 9 cm`, `L = 2`), lo que convierte a este modelo en una pieza de una comparativa más amplia más que en el resultado final. El encoder es agnóstico al montaje (funciona con cualquier número y conjunto de canales siempre que cada canal tenga posición 3D) y opera a una frecuencia de muestreo fija de 200 Hz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches (*patch tokeniser*), preentrenado como masked autoencoder (MAE); incluye un decodificador ligero durante el preentrenamiento que no se distribuye |
| Parámetros totales | 12.692.096 (solo encoder) |
| Longitud de contexto | no disponible de forma explícita; la señal se corta en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) y el wrapper acepta `n_times` configurable |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; los pesos van en safetensors sin dtype especificado) |
| Idiomas soportados | no aplicable: modelo de señales EEG, no de texto |
| Licencia | CC-BY-4.0 (pesos); el código del repositorio asociado es MIT |
| Formato de pesos | safetensors (`model.safetensors`, encoder únicamente) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder sobre parches temporales, acompañado de un tokenizador (`feature_encoder.*`) y de un decodificador ligero (`model.*`) que se emplea solo durante el preentrenamiento. El objetivo es de autoencoder enmascarado: el encoder ve los parches no enmascarados y el decodificador reconstruye la señal cruda de los parches enmascarados. Para este checkpoint, la geometría de enmascaramiento es un radio espacial de 9 cm, una longitud temporal de 1 parche y un `pct_unmasked` de 0,45 (es decir, el 45 % de los parches quedan visibles). El repositorio distribuye únicamente los tensores del encoder (tokenizador más transformer), que son exactamente los que se cargan en la evaluación downstream del artículo; el decodificador MAE no está incluido, por lo que no se puede reanudar el preentrenamiento desde este checkpoint sin reconstruirlo.

El preentrenamiento utilizó el subconjunto con licencia abierta del corpus REVE (323 grabaciones), seleccionado precisamente para que los pesos puedan redistribuirse. El calendario fue de 10 épocas sobre 2 GPU H100, con tamaño de lote de 600 por GPU, tasa de aprendizaje 0,00024 con 3080 pasos de calentamiento y valor final 1e-06, y decaimiento de peso 0,01. El checkpoint publicado corresponde a la época 10 de 10 (etiquetado `v9`, el evaluado en el artículo). La innovación metodológica del trabajo no está en la arquitectura, sino en el diseño experimental: 58 encoders con receta idéntica en los que solo varía la geometría del enmascaramiento, lo que permite atribuir las diferencias de rendimiento a esa variable. La celda correspondiente a `r = all`, `L = 33` no existe porque enmascararía la ventana completa.

En cuanto a la entrada, el wrapper multiplica la señal por un factor de 1e+06 y aplica un escalado propio `median_std_clip` con recorte en σ = 15; por tanto, los datos no deben estandarizarse previamente. Las unidades esperadas son voltios y las posiciones de canal deben expresarse en metros (MNE `info["chs"][i]["loc"][:3]`).

## Capacidades

- Extracción de características contextuales de señales EEG: es la función principal del modelo (`pipeline_tag: feature-extraction`), pensada para alimentar una sonda ridge o un clasificador ligero.
- Representaciones agnósticas al montaje: admite cualquier número y conjunto de canales, siempre que cada canal tenga una posición 3D asociada en metros.
- Evaluación y ajuste fino mediante OpenEEGBench, cargando el modelo como `PretrainedBackbone` con `model_kwargs` tomados del `config.json` del repositorio.
- Transferencia a tareas de clasificación EEG diversas: se han publicado resultados para aritmética mental, imaginación motora, detección de crisis epilépticas, estadios de sueño, reconocimiento facial, detección de depresión, clasificación de señal normal/anormal y predicción de edad.
- Carga directa de pesos con `safetensors` y `huggingface_hub`, más `strict=False` para omitir las partes dependientes del dataset (buffer de posiciones de canal y cabeza de clasificación).
- No dispone de generación de texto, tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- Detección de crisis epilépticas en monitorización continua: el modelo obtiene 0,876 ± 0,050 de exactitud balanceada en `chbmit` y 0,906 ± 0,026 en `tuev` con encoder congelado, lo que permite usarlo como extractor de características en un sistema de alerta temprana sobre registros largos, especialmente si se dispone de pocas anotaciones propias.
- Clasificación de señal EEG normal frente a anómala: con 0,805 ± 0,003 de exactitud balanceada en `tuab`, es adecuado como primera etapa de un pipeline de cribado que derive los casos dudosos a revisión neurológica.
- Cribado de depresión a partir de EEG en reposo: el resultado de 0,816 ± 0,012 en `mdd_mumtaz2016` lo hace utilizable como componente de investigación en estudios de marcadores electrofisiológicos, siempre con validación externa antes de cualquier uso clínico.
- Interfaz cerebro-ordenador para imaginación motora: con 0,453 ± 0,005 en `bcic2a` el rendimiento es limitado, por lo que su uso realista es como inicialización para ajuste fino con datos del sujeto, no como clasificador directo.
- Investigación sobre geometría de enmascaramiento: al ser uno de los 58 encoders de la cuadrícula, sirve como baseline reproducible para ablaciones y para comparar el efecto de `r` y `L` manteniendo constante todo lo demás.
- Monitorización de carga cognitiva en entornos de investigación: 0,699 ± 0,011 de exactitud balanceada en `arithmetic_zyma2019` sugiere cierta capacidad para discriminar estados de esfuerzo mental, aprovechable en experimentos de neuroergonomía.
- Extracción por lotes de características para datasets propios: gracias a su tamaño reducido (12,69 M de parámetros) y a su naturaleza agnóstica al montaje, se puede preprocesar corpus completos de EEG en una GPU de gama media o incluso en CPU para volúmenes pequeños.
- Clasificación de estadios de sueño: 0,662 ± 0,004 en `isruc-sleep`, útil como bloque de características dentro de un pipeline de polisomnografía con post-procesado temporal posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card, con encoder congelado y sonda ridge sobre características contextuales aplanadas (12 datasets × 5 semillas). La métrica es exactitud balanceada para clasificación y R² para `seed-vig`.

| Dataset | Métrica | Resultado (media ± desv.) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,699 ± 0,011 | 5 |
| bcic2020-3 | exactitud balanceada | 0,267 ± 0,029 | 5 |
| bcic2a | exactitud balanceada | 0,453 ± 0,005 | 5 |
| chbmit | exactitud balanceada | 0,876 ± 0,050 | 5 |
| faced | exactitud balanceada | 0,312 ± 0,007 | 5 |
| isruc-sleep | exactitud balanceada | 0,662 ± 0,004 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,816 ± 0,012 | 5 |
| physionet | exactitud balanceada | 0,579 ± 0,004 | 5 |
| seed-v | exactitud balanceada | 0,283 ± 0,001 | 5 |
| seed-vig | R² | -0,163 ± 0,093 | 5 |
| tuab | exactitud balanceada | 0,805 ± 0,003 | 5 |
| tuev | exactitud balanceada | 0,906 ± 0,026 | 5 |

No se han publicado en la información disponible resultados de benchmarks de este modelo en tareas distintas a OpenEEGBench (por ejemplo, comparaciones numéricas directas con otros foundation models de EEG).

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder tiene 12.692.096 parámetros, lo que supone aproximadamente 50,8 MB en FP32 y 25,4 MB en FP16/BF16. El consumo dominante son las activaciones, que dependen de `n_chans`, `n_times` y del tamaño de lote de inferencia.
- GPU recomendadas: cualquier GPU moderna es suficiente. Con 2 × H100 se entrenó, pero para inferencia basta una GPU de gama de entrada o media.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con varios GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para lotes pequeños también es viable la ejecución en CPU.
- Opciones de despliegue: PyTorch con la librería `eeg_fm_masking` (instalación vía `pip install git+https://github.com/PierreGtch/eeg-fm-masking`), `safetensors` para la carga de pesos, `huggingface_hub` para la descarga y OpenEEGBench (`open_eeg_bench.backbone.PretrainedBackbone`) para evaluación y ajuste. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje ni distribuirse en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Restricciones de entrada a respetar en despliegue: frecuencia de muestreo de 200 Hz, unidades en voltios, sin estandarización previa de los datos y posiciones de canal en metros.

## Comparativa con modelos similares

La información disponible no incluye datos de rendimiento de otros foundation models de EEG ajenos a esta familia, por lo que la comparación numérica con alternativas externas no está disponible. Dentro del mismo estudio sí existen alternativas directamente comparables, ya que comparten receta de entrenamiento y solo difieren en la geometría de enmascaramiento o en el marco de preentrenamiento:

| Modelo | Marco | Radio espacial `r` | Longitud temporal `L` | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `eeg-fm-masking_mae_r9cm_L1` | MAE | 9 cm | 1 parche | 12,69 M (encoder) | CC-BY-4.0 | HuggingFace |
| `eeg-fm-masking_mae_r9cm_L2` | MAE | 9 cm | 2 parches | no disponible en la información | CC-BY-4.0 | HuggingFace |
| `eeg-fm-masking_jepa_r9cm_L2` | JEPA | 9 cm | 2 parches | no disponible en la información | CC-BY-4.0 | HuggingFace |

Los dos últimos son los que el artículo recomienda (`r = 9 cm`, `L = 2`), por lo que este checkpoint concreto (`L = 1`) no es la configuración óptima señalada por los autores. Para el resto de modelos comparables de la misma categoría (otros foundation models de EEG), no hay datos en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint no es la mejor configuración del estudio: el propio artículo recomienda `r = 9 cm`, `L = 2`, por lo que su uso como modelo de referencia debe justificarse frente a `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`.
- Rendimiento cercano o por debajo del azar en varias tareas: 0,267 ± 0,029 en `bcic2020-3`, 0,283 ± 0,001 en `seed-v`, 0,312 ± 0,007 en `faced` y 0,453 ± 0,005 en `bcic2a` (esta última por debajo del 0,5 esperable en una tarea binaria balanceada). No es adecuado como clasificador directo en esos dominios.
- La regresión de edad (`seed-vig`) obtiene un R² negativo de -0,163 ± 0,093, lo que indica un rendimiento peor que predecir la media; no debe usarse para esa tarea.
- Alta varianza en algunos resultados: `chbmit` presenta una desviación estándar de 0,050 y `tuev` de 0,026, lo que obliga a validar con múltiples semillas antes de sacar conclusiones en producción.
- Todos los resultados publicados corresponden a encoder congelado más sonda ridge; no se documentan resultados de ajuste fino completo, por lo que el techo de rendimiento con fine-tuning es desconocido.
- Preentrenamiento corto y corpus reducido: 10 épocas sobre 323 grabaciones del subconjunto abierto de REVE. La cobertura de montajes, dispositivos y poblaciones es limitada, con riesgo de sesgo de dominio hacia los datasets clínicos empleados.
- Dependencia estricta del preprocesado: la señal debe estar a 200 Hz y en voltios, y todos los canales deben tener posición 3D en metros. Canales sin posición o frecuencias distintas rompen el funcionamiento esperado.
- El decodificador MAE no se distribuye, de modo que no se puede reanudar el preentrenamiento con enmascaramiento directamente desde estos pesos.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución; el código asociado es MIT, con condiciones distintas a las de los pesos. Se debe citar el artículo si se utilizan los modelos.
- Adopción muy baja en el momento de redactar esta ficha: 0 descargas y 0 likes, sin ecosistema de terceros consolidado ni versiones cuantizadas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de sobreinterpretar las características extraídas; las salidas deben tratarse siempre como representaciones latentes y no como diagnósticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L1
- Página del artículo: https://pierregtch.github.io/eeg-fm-masking
- Código fuente (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Checkpoint recomendado con la misma geometría espacial y `L = 2`: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint recomendado con marco JEPA: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/yncl6get

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a contenidos no relacionados con EEG ni con aprendizaje automático, por lo que se han descartado.
