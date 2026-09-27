# PierreGtch/eeg-fm-masking_jepa_rone_L33

## Resumen

Este modelo es un encoder de electroencefalografía (EEG) preentrenado por Pierre Gtch mediante aprendizaje autosupervisado. Forma parte de un estudio controlado titulado "What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA", en el que se entrenaron 58 encoders con una receta idéntica variando únicamente la geometría de enmascaramiento: 5 radios espaciales, 6 longitudes temporales y 2 frameworks. Este checkpoint concreto corresponde a la celda JEPA con radio espacial de un solo canal (r = one) y longitud temporal de 33 parches, un caso extremo que enmascara la práctica totalidad de la ventana temporal.

El modelo se encuadra en la familia JEPA (joint-embedding predictive architecture): un predictor transforma el contexto codificado por el encoder en los embeddings que un profesor EMA genera para los parches enmascarados, sin emplear regularizadores de varianza ni covarianza. El repositorio distribuye únicamente el encoder (tokenizador de parches y transformer), con 12.692.096 parámetros y un tamaño de repositorio de 0,1 GB, suficiente para ejecutarse en hardware muy modesto.

Su relevancia es metodológica más que de producto: permite aislar el efecto de la geometría de enmascaramiento sobre el rendimiento downstream, ya que todos los checkpoints comparten datos, optimizador y presupuesto de cómputo. Los resultados publicados con encoder congelado y sonda ridge sobre 12 conjuntos de OpenEEGBench sitúan a esta variante en un rango desigual, desde 0,916 de exactitud balanceada en TUEV hasta 0,247 en FACED, con un R² negativo en seed-vig. Los autores recomiendan para uso general las variantes con r = 9 cm y L = 2, no esta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder de parches) con preentrenamiento JEPA sobre profesor EMA; se publica solo el encoder |
| Parámetros totales | 12.692.096 (12,69 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como valor fijo; la ventana se compone de parches de 1 s (200 muestras a 200 Hz, solape de 20 muestras) y es configurable mediante `n_times` en `config.json` |
| Tipos de cuantización | no se documentan cuantizaciones específicas; los pesos se distribuyen en safetensors |
| Idiomas soportados | no aplica (modelo de señales EEG, no textual); no se declaran idiomas en la model card |
| Licencia | CC-BY-4.0 para los pesos; el código del repositorio de entrenamiento es MIT |
| Formato de pesos | safetensors (`model.safetensors`), acompañado de `config.json` y `metadata.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer que opera sobre parches temporales de señal EEG. La tokenización divide la señal en parches de 1 s (200 muestras a 200 Hz) con un solape de 20 muestras, y cada parche se procesa junto con la posición tridimensional de su canal, lo que hace al modelo agnóstico al montaje: funciona con cualquier número y conjunto de canales siempre que cada uno tenga coordenadas 3D. En el marco JEPA, un predictor proyecta las representaciones del contexto hacia los embeddings que un profesor EMA produce para los parches enmascarados, sin regularizador de varianza/covarianza. El repositorio contiene exclusivamente el encoder entrenado (tensores `feature_encoder.*` y `model.*`); ni el predictor ni el profesor EMA se distribuyen, ya que los pesos publicados son los del estudiante encoder evaluado en el artículo.

El preentrenamiento usó el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para poder redistribuir los pesos, durante 10 épocas sobre 2 GPU H100 con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3.080 pasos y valor final de 1e-06) y weight decay de 0,01. El checkpoint publicado es la época 10 de 10 (etiquetado `v9`, el evaluado en el artículo) de la ejecución `x51ltw3v`. Esta configuración concreta usa enmascaramiento espacial de un único canal (r = one) y temporal de 33 parches (L = 33), con `pct_unmasked = 0.45`. El propio artículo señala que esta celda es un caso límite, ya que L = 33 enmascararía la ventana completa en otros contextos.

## Capacidades

- Extracción de características (feature extraction) de señales EEG: el encoder genera representaciones contextuales por parche a partir de ventanas multicanal.
- Evaluación con encoder congelado: los resultados del artículo se obtienen con sonda ridge sobre las características contextuales aplanadas, sin ajuste de los pesos.
- Ajuste fino downstream: la integración con OpenEEGBench permite reentrenar el backbone mediante `PretrainedBackbone`.
- Independencia de montaje: acepta cualquier número y disposición de canales, siempre que cada canal tenga posición 3D en metros.
- Preentrenamiento autosupervisado tipo JEPA, apto para transferencia a tareas de clasificación y regresión sobre EEG.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode): no procesa lenguaje natural.
- No incluye audio ni otros dominios distintos de la señal EEG.

## Casos de uso

- Clasificación de fases del sueño: sobre ISRUC-Sleep el modelo alcanza 0,682 de exactitud balanceada con encoder congelado y sonda ridge, de modo que puede usarse como extractor de características en pipelines de polisomnografía sin reentrenar el backbone.
- Detección de crisis epilépticas: en CHB-MIT obtiene 0,899 y en TUEV 0,916 de exactitud balanceada, lo que lo hace adecuado para etapas de cribado y clasificación de eventos anómalos sobre registros continuos.
- Monitorización de anomalías cerebrales en UCI o neurología: con 0,782 en TUAB, puede integrarse como extractor en sistemas que priorizan segmentos para revisión por especialistas.
- Decodificación de carga cognitiva: en arithmetic_zyma2019 logra 0,674 de exactitud balanceada, útil en experimentos de carga mental o neuroergonomía.
- Investigación en depresión: en mdd_mumtaz2016 obtiene 0,846 de exactitud balanceada, lo que permite usarlo como base para estudios comparativos de biomarcadores electrofisiológicos.
- Interfaces cerebro-computador: en bcic2a y bcic2020-3 los resultados son 0,392 y 0,246 respectivamente, por lo que solo resulta apropiado como punto de partida para ajuste fino o para análisis exploratorio, no para un clasificador final.
- Estudio metodológico del enmascaramiento: al compartir receta con otros 57 encoders, sirve para comparar de forma controlada el impacto de la geometría de enmascaramiento en tareas downstream.
- Extracción de embeddings para agrupamiento y visualización: las representaciones contextuales pueden alimentar análisis de similitud entre sujetos o ventanas sin necesidad de etiquetas.

## Benchmarks y rendimiento

Resultados publicados en la model card: encoder congelado con regresión/clasificación ridge sobre las características contextuales aplanadas, 12 conjuntos de OpenEEGBench y 5 semillas. Exactitud balanceada para clasificación y R² para `seed-vig`.

| Conjunto de datos | Métrica | Puntuación (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,674 ± 0,016 | 5 |
| bcic2020-3 | exactitud balanceada | 0,246 ± 0,014 | 5 |
| bcic2a | exactitud balanceada | 0,392 ± 0,015 | 5 |
| chbmit | exactitud balanceada | 0,899 ± 0,040 | 5 |
| faced | exactitud balanceada | 0,247 ± 0,006 | 5 |
| isruc-sleep | exactitud balanceada | 0,682 ± 0,003 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,846 ± 0,005 | 5 |
| physionet | exactitud balanceada | 0,508 ± 0,014 | 5 |
| seed-v | exactitud balanceada | 0,306 ± 0,003 | 5 |
| seed-vig | R² | -0,330 ± 0,015 | 5 |
| tuab | exactitud balanceada | 0,782 ± 0,002 | 5 |
| tuev | exactitud balanceada | 0,916 ± 0,021 | 5 |

No se han proporcionado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje, ya que no es un modelo lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,69 M de parámetros, los pesos en fp32 ocupan aproximadamente 51 MB y en fp16 unos 25 MB; las activaciones dependen del número de canales y de la ventana temporal, pero el consumo agregado es de órdenes de magnitud de cientos de MB.
- GPU recomendadas: cualquier GPU con soporte CUDA puede ejecutar la inferencia; no se requiere hardware de centro de datos. El entrenamiento de este checkpoint se realizó sobre 2 GPU H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de gama de entrada y media (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch con `safetensors` y el paquete `eeg_fm_masking` (instalable con `pip install git+https://github.com/PierreGtch/eeg-fm-masking`); integración con OpenEEGBench mediante `PretrainedBackbone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisitos de entrada estrictos: frecuencia de muestreo de 200 Hz, señal en voltios (el wrapper multiplica por 1e+06 y aplica escalado `median_std_clip` con recorte en σ = 15), y posiciones de canal en metros (MNE `info["chs"][i]["loc"][:3]`). No debe estandarizarse la señal antes de pasarla al modelo.

## Comparativa con modelos similares

El artículo entrena 58 encoders con la misma receta, de los cuales se distribuyen públicamente las variantes. La comparación más directa es con las dos configuraciones recomendadas por los autores, ambas con r = 9 cm y L = 2.

| Modelo | Framework | Geometría de máscara | Parámetros | Licencia | Observaciones |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rone_L33 (este) | JEPA | r = un canal, L = 33, pct_unmasked 0,45 | 12,69 M | CC-BY-4.0 | Caso límite de enmascaramiento casi total de la ventana |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 | no disponible | CC-BY-4.0 | Recomendado por los autores |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 | no disponible | CC-BY-4.0 | Recomendado por los autores |

No se dispone de datos comparativos frente a otras familias de modelos fundacionales de EEG (por ejemplo, LaBraM, EEGPT o BIOT) en la información proporcionada, por lo que la comparación con ellas queda como no disponible.

## Limitaciones y advertencias

- El rendimiento es muy desigual según la tarea: 0,246 en bcic2020-3, 0,247 en faced y 0,306 en seed-v y un R² de -0,330 en seed-vig, lo que indica una transferencia deficiente en esos dominios.
- Los propios autores recomiendan las variantes con r = 9 cm y L = 2; esta configuración con L = 33 es una celda de estudio y no la opción por defecto para producción.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código y no admite tool calling ni flujos de agentes.
- Los resultados publicados corresponden a encoder congelado con sonda ridge; no hay garantía de que el ajuste fino completo alcance cifras equivalentes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existen falsos positivos y falsos negativos en la clasificación de eventos clínicos, con impacto potencial en contextos médicos.
- Sesgos conocidos: no se documentan análisis de sesgo por sujeto, edad, sexo ni centro; el preentrenamiento se limita a las 323 grabaciones del subconjunto abierto de REVE.
- Requisitos de entrada rígidos (200 Hz, voltios, posiciones 3D de canal); un preprocesado distinto o la estandarización previa degradan los resultados.
- La ventana está formada por parches de 1 s; el modelo puede no capturar dependencias más largas que la ventana configurada en `n_times`.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial, pero exige atribución y el cumplimiento de las condiciones de la licencia.
- El código de entrenamiento es MIT, licencia distinta de la de los pesos; conviene revisar ambas por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad de validación independiente.
- El checkpoint es la época final (10 de 10, `v9`); no se publican curvas de validación que permitan juzgar sobreajuste en esta celda concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rone_L33
- Sitio del artículo: https://pierregtch.github.io/eeg-fm-masking
- Código de entrenamiento (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada JEPA (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante recomendada MAE (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/x51ltw3v
