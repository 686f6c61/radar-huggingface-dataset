# PierreGtch/eeg-fm-masking_mae_r12cm_L4

## Resumen

eeg-fm-masking_mae_r12cm_L4 es un encoder de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) por PierreGtch, publicado como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo forma parte de una familia de 58 encoders entrenados con una receta idéntica en la que solo varía la geometría del enmascaramiento: 5 radios espaciales, 6 longitudes temporales y 2 marcos de entrenamiento (MAE y JEPA). En concreto, esta variante usa un radio espacial de 12 cm, una longitud temporal de 4 parches y un 45 % de parches sin enmascarar.

El modelo es un transformer encoder de 12,69 millones de parámetros que convierte ventanas de EEG en representaciones contextuales reutilizables para tareas downstream. La entrada se muestrea a 200 Hz y se segmenta en parches de 1 s con 20 muestras de solapamiento, y el modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada uno tenga una posición 3D en metros. Los pesos publicados incluyen únicamente el encoder, no el decodificador ligero del MAE.

Su relevancia radica en que permite evaluar de forma controlada el efecto de la geometría de enmascaramiento en modelos fundacionales de EEG, con resultados publicados sobre 12 conjuntos de datos de OpenEEGBench usando el encoder congelado y una sonda ridge. El repositorio contiene solo el encoder (0,1 GB) en safetensors, con licencia CC-BY-4.0 para los pesos y MIT para el código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con patch tokeniser, dentro de un marco de autoencoder enmascarado (MAE) |
| Parametros totales | 12.692.096 (~12,69 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la señal se divide en parches de 1 s a 200 Hz y `n_times` es configurable) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponible (modelo de senales EEG, no de texto) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el codigo |
| Formato de pesos | safetensors (`model.safetensors`, solo encoder) |

## Arquitectura y entrenamiento

La arquitectura combina un tokenizador de parches (`feature_encoder.*`) y un transformer (`model.*`). El régimen de preentrenamiento es MAE: el encoder procesa únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. En esta variante, el enmascaramiento espacial tiene un radio de 12 cm, el enmascaramiento temporal abarca 4 parches y la proporción de parches sin enmascarar es 0,45. El checkpoint publicado corresponde a la época 10 de 10 (`v9`), que es el evaluado en el artículo. El decodificador MAE no se distribuye.

El preentrenamiento usó el subconjunto con licencia abierta del corpus REVE (323 grabaciones), lo que permite redistribuir los pesos. El calendario de entrenamiento fue de 10 épocas sobre 2 GPU H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos y valor final de 1e-06) y weight decay de 0,01. El autor recomienda, según el artículo, la configuración r = 9 cm y L = 2, disponible en los modelos `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`.

## Capacidades

- Extracción de características (feature extraction) de señales EEG: genera representaciones contextuales a partir de ventanas multicanal.
- Funcionamiento agnóstico al montaje: admite cualquier número y conjunto de canales, siempre que cada canal tenga una posición 3D.
- Base para clasificación y regresión downstream mediante sondas lineales o ridge sobre las características congeladas.
- Evaluación estandarizada en OpenEEGBench: clasificación (balanced accuracy) y regresión (R²) en 12 conjuntos de datos.
- Ajuste fino opcional a través de OpenEEGBench (`PretrainedBackbone`).
- No es un modelo generativo de texto: no soporta generación de lenguaje, tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.

## Casos de uso

- Detección de anomalías en EEG clínico: las características congeladas alcanzan un balanced accuracy de 0,807 en TUAB y 0,930 en TUEV, por lo que sirven como extractor para sistemas de triaje o cribado de trazados patológicos.
- Monitorización de crisis epilépticas: con 0,868 de balanced accuracy en CHB-MIT, el encoder puede alimentar clasificadores de crisis en unidades de cuidados intensivos o dispositivos ambulatorios.
- Clasificación de etapas de sueño: 0,676 de balanced accuracy en ISRUC-Sleep permite integrarlo en pipelines de análisis de polisomnografía para segmentar automáticamente el sueño.
- Apoyo al diagnóstico de depresión: 0,830 de balanced accuracy en MDD Mumtaz 2016 lo hace utilizable como extractor de biomarcadores en estudios de trastorno depresivo mayor.
- Interfaces cerebro-computador (BCI): en BCIC IV 2a obtiene 0,468 y en BCIC 2020-3 0,260, de modo que puede servir como encoder base para decodificación motora en prototipos de BCI, con la cautela de que el rendimiento es limitado.
- Decodificación de carga cognitiva: 0,684 de balanced accuracy en arithmetic Zyma 2019 permite estimar carga mental en entornos de neuroergonomía o evaluación cognitiva.
- Investigación en percepción visual: 0,323 de balanced accuracy en FACED lo hace apto para experimentos exploratorios de reconocimiento de caras a partir de EEG, no para producción de alta precisión.
- Preentrenamiento y transferencia en neurotecnología: el encoder puede inicializar modelos para nuevos datasets de EEG, reutilizando representaciones aprendidas sobre REVE y reduciendo la necesidad de datos etiquetados.

## Benchmarks y rendimiento

Resultados publicados en la model card para OpenEEGBench con encoder congelado y sonda ridge sobre las características contextuales aplanadas (12 conjuntos de datos × 5 semillas). La métrica es balanced accuracy para clasificación y R² para `seed-vig`.

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,684 ± 0,015 | 5 |
| bcic2020-3 | balanced acc. | 0,260 ± 0,011 | 5 |
| bcic2a | balanced acc. | 0,468 ± 0,021 | 5 |
| chbmit | balanced acc. | 0,868 ± 0,048 | 5 |
| faced | balanced acc. | 0,323 ± 0,003 | 5 |
| isruc-sleep | balanced acc. | 0,676 ± 0,002 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,830 ± 0,040 | 5 |
| physionet | balanced acc. | 0,571 ± 0,008 | 5 |
| seed-v | balanced acc. | 0,284 ± 0,003 | 5 |
| seed-vig | R² | -0,182 ± 0,003 | 5 |
| tuab | balanced acc. | 0,807 ± 0,004 | 5 |
| tuev | balanced acc. | 0,930 ± 0,032 | 5 |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 12,69 M de parámetros, unos 51 MB en fp32 y unos 25 MB en fp16 para los pesos; el consumo real depende de `n_times`, `n_chans` y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; el entrenamiento publicado usó 2 × H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, serie RTX 20/30/40 o equivalentes), e incluso puede ejecutarse en CPU para inferencia con lotes pequeños.
- Opciones de despliegue: PyTorch mediante el wrapper `eeg_fm_masking.oeb.wrapper.ContextualEncoderBenchmarkWrapper`, o a través de OpenEEGBench con `PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto o rendimiento de otros modelos fundacionales de EEG fuera de la colección del autor. Dentro de la misma colección, la comparación relevante es entre variantes de la misma receta:

| Modelo | Framework | Enmascaramiento (r, L) | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r12cm_L4 (este) | MAE | r = 12 cm, L = 4 | 12,69 M | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 | No disponible en la informacion (misma receta) | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 | No disponible en la informacion (misma receta) | CC-BY-4.0 | HuggingFace |

El artículo recomienda la configuración r = 9 cm y L = 2, por lo que las variantes `r9cm_L2` son las de referencia para comparar frente a esta variante de 12 cm y L = 4.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe evaluarse con benchmarks de NLP.
- Riesgo de bajo rendimiento en varias tareas: balanced accuracy de 0,260 en BCIC 2020-3, 0,284 en SEED-V y 0,323 en FACED, y R² negativo (-0,182) en `seed-vig`, lo que indica que las características congeladas no capturan la variabilidad relevante en esos casos.
- Requisitos de entrada estrictos: muestreo a 200 Hz, unidades en voltios, posiciones de canal en metros y escalado interno con `median_std_clip` (clip en σ = 15); no se deben estandarizar los datos previamente.
- Dependencia de posiciones 3D: aunque es agnóstico al montaje, cada canal debe tener una posición tridimensional; sin ella el modelo no puede procesarse correctamente.
- Sesgo de preentrenamiento: entrenado sobre el subconjunto abierto de REVE (323 grabaciones), por lo que su comportamiento en poblaciones, equipos o protocolos distintos no está caracterizado.
- Solo se distribuye el encoder: el decodificador MAE no está incluido, de modo que no se puede reproducir la fase de reconstrucción sin entrenar uno nuevo.
- Licencia CC-BY-4.0 para los pesos: permite uso comercial con atribución; el código asociado es MIT. Es necesario citar el artículo correspondiente.
- No hay cuantizaciones publicadas (GGUF, GPTQ, AWQ, etc.), lo que limita despliegues fuera de PyTorch sin conversión propia.
- Sin datos de latencia, throughput ni consumo energético en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r12cm_L4
- Colección completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del artículo: https://pierregtch.github.io/eeg-fm-masking
- Código en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/4stxb7s2
- Modelo recomendado por el artículo (MAE): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado por el artículo (JEPA): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
