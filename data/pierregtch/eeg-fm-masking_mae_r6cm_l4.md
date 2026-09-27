# PierreGtch/eeg-fm-masking_mae_r6cm_L4

## Resumen

eeg-fm-masking_mae_r6cm_L4 es un codificador (encoder) de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (masked autoencoder, MAE). Lo desarrolla Pierre Gtch (usuario de HuggingFace `PierreGtch`) en el marco del artículo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de un modelo fundacional para señales EEG: aprende representaciones transferibles que después se congelan y se evalúan con una sonda lineal (ridge) sobre 12 conjuntos de datos de OpenEEGBench. El problema que aborda es la falta de representaciones generalistas y reutilizables para EEG, una modalidad con montajes de electrodos, frecuencias de muestreo y tareas muy heterogéneas.

El modelo forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría del enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos (MAE y JEPA). Esta variante concreta usa un radio espacial de máscara r = 6 cm, una longitud temporal L = 4 parches y una fracción de parches sin enmascarar del 45 % (`pct_unmasked = 0.45`). El codificador tiene 12,69 millones de parámetros, es agnóstico al montaje (acepta cualquier número y disposición de canales siempre que tengan posición 3D) y opera a una frecuencia de muestreo fija de 200 Hz.

Su relevancia actual reside en que el artículo no propone un modelo aislado, sino un estudio controlado sobre qué geometría de enmascaramiento conviene para EEG. Los autores recomiendan r = 9 cm y L = 2 como la configuración óptima, por lo que este checkpoint (r = 6 cm, L = 4) es una de las piezas del barrido experimental más que la configuración final recomendada. Aun así, el repositorio publica únicamente el encoder, no el decoder del MAE, y ofrece resultados de evaluación congelada listos para reproducir.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches (`feature_encoder.*` + `model.*`), enmarcado en un masked autoencoder (MAE) |
| Parámetros totales | 12.692.096 (encoder) |
| Longitud de contexto | Parches de 1 s a 200 Hz (200 muestras, con solapamiento de 20 muestras); la ventana total depende de `n_times` configurado por el usuario |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de señales EEG, no de lenguaje) |
| Licencia | cc-by-4.0 (pesos); código bajo MIT en GitHub |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `metadata.json` |
| Framework de entrenamiento | MAE (autoencoder enmascarado) |
| Radio espacial de máscara (r) | 6 cm |
| Longitud temporal de máscara (L) | 4 parches |
| Fracción sin enmascarar | 0,45 |
| Checkpoint | epoch 10 de 10 (v9) |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica `factor = 1e+06` y `median_std_clip` con clip en σ = 15) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de un masked autoencoder. Un tokenizador de parches convierte la señal EEG en tokens (parches de 1 s con solapamiento de 20 muestras), después el transformer codifica únicamente los parches no enmascarados y un decoder ligero reconstruye la señal cruda de los parches enmascarados. En este repositorio solo se publican los tensores del encoder (`feature_encoder.*` y `model.*`), que son exactamente los que se cargan en la evaluación downstream del artículo; el decoder del MAE no se incluye. El modelo es agnóstico al montaje: transforma cualquier conjunto de canales siempre que cada uno tenga una posición 3D (coordenadas en metros, tomadas de `info["chs"][i]["loc"][:3]` en MNE).

El preentrenamiento usa el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El cronograma de entrenamiento fue de 10 épocas sobre 2 × H100, con batch size 600 por GPU, learning rate 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0,01. La innovación metodológica principal no está en la arquitectura, sino en el diseño experimental: los 58 modelos comparten receta y solo varían la geometría de enmascaramiento, lo que permite aislar el efecto de r y L sobre el rendimiento downstream. La evaluación de referencia se hace con el encoder congelado y una sonda ridge sobre las características contextuales aplanadas, en 12 conjuntos de datos y 5 semillas por dataset.

## Capacidades

- Extracción de características (feature extraction) de señales EEG: el modelo devuelve representaciones contextuales por parche, no predicciones de clase ni texto.
- Transferencia a clasificación EEG con encoder congelado: se ha evaluado con sonda ridge en 12 datasets (aritmética mental, BCI, epilepsia, sueño, emoción, depresión, cara/ERP, alerta).
- Regresión sobre señales EEG: en `seed-vig` la tarea downstream es de regresión (métrica R²).
- Independencia de montaje: admite cualquier número y disposición de electrodos con posición 3D, lo que facilita su uso en cohortes con montajes heterogéneos.
- Adaptación por fine-tuning: el paquete `eeg-fm-masking` y la clase `ContextualEncoderBenchmarkWrapper` permiten integrarlo como backbone de OpenEEGBench.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.
- No ofrece modo "thinking" ni salidas en lenguaje natural.

## Casos de uso

- Clasificación de fases del sueño: sobre `isruc-sleep` el encoder congelado alcanza 0,659 ± 0,011 de balanced accuracy. Se usaría como extractor de características seguido de una sonda ligera para segmentar y clasificar etapas del sueño en registros polysomnográficos.
- Detección de anomalías epilépticas: en `chbmit` obtiene 0,889 ± 0,012 y en `tuab` 0,804 ± 0,005, lo que lo hace adecuado como base para sistemas de cribado de actividad epiléptica en EEG clínico.
- Interfaces cerebro-computador (BCI): en `bcic2a` alcanza 0,457 ± 0,014 y en `bcic2020-3` 0,272 ± 0,019. Sirve como encoder previo para decodificar intención motora en paradigmas de imaginación motora, aunque con rendimiento moderado.
- Detección de depresión a partir de EEG: en `mdd_mumtaz2016` logra 0,808 ± 0,016, lo que lo convierte en una base razonable para pipelines de investigación en biomarcadores de trastorno depresivo mayor.
- Carga cognitiva y aritmética mental: en `arithmetic_zyma2019` obtiene 0,774 ± 0,012; útil para monitorizar esfuerzo cognitivo en entornos de investigación o de formación.
- Investigación en emociones y respuesta afectiva: en `seed-v` consigue 0,285 ± 0,001 (cerca del azar), por lo que su uso en este dominio requeriría fine-tuning o datos adicionales.
- Detección de eventos relacionados con estímulos (ERP): en `faced` obtiene 0,320 ± 0,004, un rendimiento bajo que limita su uso directo para reconocimiento de caras.
- Estandarización de pipelines de investigación EEG: al ser agnóstico al montaje y aceptar cualquier canal con posición 3D, puede emplearse como extractor común en estudios multicéntricos con configuraciones de electrodos distintas.
- Evaluación comparativa de geometrías de enmascaramiento: al formar parte de un barrido controlado de 58 modelos, es útil como referencia reproducible en estudios metodológicos sobre self-supervised learning aplicado a EEG.

## Benchmarks y rendimiento

Resultados downstream publicados en la model card: encoder congelado con sonda ridge sobre características contextuales aplanadas, 12 datasets × 5 semillas. Balanced accuracy para clasificación y R² para `seed-vig`.

| Dataset | Métrica | Puntuación (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,774 ± 0,012 | 5 |
| bcic2020-3 | balanced acc. | 0,272 ± 0,019 | 5 |
| bcic2a | balanced acc. | 0,457 ± 0,014 | 5 |
| chbmit | balanced acc. | 0,889 ± 0,012 | 5 |
| faced | balanced acc. | 0,320 ± 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,659 ± 0,011 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,808 ± 0,016 | 5 |
| physionet | balanced acc. | 0,579 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,285 ± 0,001 | 5 |
| seed-vig | R² | −0,172 ± 0,010 | 5 |
| tuab | balanced acc. | 0,804 ± 0,005 | 5 |
| tuev | balanced acc. | 0,921 ± 0,030 | 5 |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros codificadores EEG en esta ficha; los autores remiten a la comparativa completa del artículo.

## Requisitos de hardware

- Peso del encoder: 12,69 M de parámetros. En precisión fp32 son aproximadamente 51 MB de pesos; en fp16, unos 25 MB (cálculo a partir del recuento real de parámetros, no dato publicado).
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4090 o incluso GPUs integradas, así como en CPU para inferencia puntual. La memoria dominante no son los pesos, sino las activaciones, que dependen de `n_chans` y `n_times` de la ventana de entrada.
- Entrenamiento: el artículo usó 2 × H100 con batch size 600 por GPU, pero solo para el preentrenamiento sobre el corpus REVE.
- Formatos de despliegue: el repositorio no ofrece integración nativa con vLLM, llama.cpp, Ollama o TGI (no son aplicables a un encoder EEG). La carga se hace con `safetensors` y la clase `ContextualEncoderBenchmarkWrapper` del paquete `eeg_fm_masking`, instalable con `pip install git+https://github.com/PierreGtch/eeg-fm-masking`. La integración con OpenEEGBench se realiza mediante `open_eeg_bench.backbone.PretrainedBackbone`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación dentro de la misma familia publicada por los autores (58 encoders con receta idéntica). Los dos modelos recomendados por el artículo son las alternativas más directas.

| Modelo | Marco | r | L | Parámetros encoder | Licencia | Notas |
|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r6cm_L4 | MAE | 6 cm | 4 parches | 12,69 M | cc-by-4.0 | Variante de esta ficha |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible en esta búsqueda | cc-by-4.0 | Configuración recomendada por el artículo |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible en esta búsqueda | cc-by-4.0 | Configuración recomendada bajo marco JEPA; se publica el encoder estudiante |

No se dispone en la información proporcionada de comparativas frente a codificadores EEG externos (por ejemplo, otras familias de modelos fundacionales EEG).

## Limitaciones y advertencias

- Rendimiento cercano al azar en varias tareas: `bcic2020-3` (0,272), `seed-v` (0,285) y `faced` (0,320) están en el entorno del clasificador trivial para sus respectivos números de clase, lo que limita su uso directo sin fine-tuning.
- R² negativo en `seed-vig` (−0,172 ± 0,010): la sonda ridge sobre características congeladas no supera a predecir la media, lo que indica que estas representaciones no capturan bien la señal objetivo en esa tarea.
- Solo se publica el encoder: el decoder del MAE no está incluido, por lo que no se puede reproducir el objetivo de reconstrucción ni usarlo para tareas generativas sobre señal.
- Preprocesado obligatorio y específico: frecuencia de muestreo fija de 200 Hz, unidades en voltios, `factor = 1e+06` y `median_std_clip` con clip en σ = 15 aplicados por el wrapper. Estandarizar los datos por adelantado rompe las suposiciones del modelo.
- Requiere posiciones 3D de los canales en metros: si el registro no incluye localizaciones de electrodos, el modelo no puede procesarse correctamente.
- Preentrenado sobre el subconjunto de licencia abierta de REVE (323 grabaciones): la cobertura de montajes, poblaciones y patologías es limitada y puede sesgar el rendimiento en cohortes no representadas.
- Licencia CC-BY-4.0: permite uso comercial y redistribución con atribución. El código del paquete es MIT. Es necesario citar el artículo si se usan los pesos.
- No se han documentado sesgos demográficos ni análisis de equidad específicos para este checkpoint en la información disponible.
- Este modelo no es un LLM: no genera texto, no soporta tool calling ni razonamiento multi-paso. Cualquier expectativa en ese sentido es incorrecta.
- Fecha de creación y actualización del repositorio: 2026-09-27. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L4
- Colección completa de los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Configuración recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Configuración recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Sitio web del artículo: https://pierregtch.github.io/eeg-fm-masking
- Código en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/d2k3me28
