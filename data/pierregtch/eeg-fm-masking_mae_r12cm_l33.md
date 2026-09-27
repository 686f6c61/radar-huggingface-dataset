# PierreGtch/eeg-fm-masking_mae_r12cm_L33

## Resumen

eeg-fm-masking_mae_r12cm_L33 es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (masked autoencoder, MAE), publicado por el usuario PierreGtch en Hugging Face. Forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento (MAE y JEPA). Este checkpoint concreto corresponde a la celda de radio espacial r = 12 cm y longitud temporal L = 33 parches, con un 45 % de parches sin enmascarar (pct_unmasked = 0.45). El modelo procede del artículo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*.

El problema que resuelve es la falta de representaciones EEG genéricas y reutilizables: en lugar de entrenar un clasificador desde cero para cada tarea y cada montaje de electrodos, se extraen características contextuales de un codificador congelado y se ajusta una regresión ridge sobre ellas. El modelo es agnóstico al montaje, es decir, funciona con cualquier número y conjunto de canales siempre que cada canal tenga una posición 3D en metros, lo que facilita su uso en cohortes y equipos heterogéneos.

Técnicamente es un modelo pequeño: 12.692.096 parámetros en el codificador (el decoder del MAE no se publica). La señal de entrada debe muestrearse a 200 Hz y se segmenta en parches de 1 s (200 muestras, con 20 muestras de solape). Los pesos se distribuyen en safetensors bajo licencia CC-BY-4.0, mientras que el código es MIT, de modo que los pesos son redistribuibles y utilizables comercialmente con atribución. Es relevante ahora porque permite evaluar de forma controlada qué geometría de enmascaramiento produce mejores representaciones EEG, un aspecto poco estudiado frente a la práctica habitual de ajustar hiperparámetros de forma no sistemática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder enmascarado (MAE): tokenizador de parches (`feature_encoder.*`) + transformer (`model.*`). Solo se publica el codificador |
| Parametros totales | 12.692.096 (12,69 M), únicamente el codificador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada se segmenta en parches de 1 s (200 muestras a 200 Hz) con 20 muestras de solape |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas ni GGUF) |
| Idiomas soportados | no aplica / no disponible: el modelo procesa señales EEG, no texto ni lenguaje natural |
| Licencia | CC-BY-4.0 para los pesos; MIT para el código |
| Formato de pesos | safetensors (`model.safetensors`) |

Parámetros adicionales de entrada y enmascaramiento:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica factor = 1e+06 y escalado `median_std_clip` con recorte en σ = 15) |
| Posiciones de canales | metros (MNE `info["chs"][i]["loc"][:3]`) |
| Radio espacial de enmascaramiento (r) | 12 cm |
| Longitud temporal de enmascaramiento (L) | 33 parches |
| pct_unmasked | 0.45 |
| Checkpoint | época 10 de 10 (v9, el evaluado en el artículo) |
| Ejecución de entrenamiento | `7aipvvk5` (WandB) |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder enmascarado aplicado a señal EEG. El codificador consta de un tokenizador de parches que convierte la señal en representaciones por parche y un transformer que las procesa de forma contextual; el codificador ve únicamente los parches no enmascarados y un decoder ligero reconstruye la señal cruda de los parches enmascarados. El decoder no se incluye en el repositorio: los tensores publicados corresponden exactamente a los cargados en la evaluación downstream del artículo. En las variantes JEPA, los pesos publicados son los del codificador estudiante tal como se evaluaron.

Los datos de preentrenamiento son el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos puedan redistribuirse. El calendario de entrenamiento comprende 10 épocas con 2 GPU H100, tamaño de lote de 600 por GPU, tasa de aprendizaje de 0,00024 (calentamiento de 3080 pasos y valor final 1e-06) y decaimiento de peso de 0,01. La innovación metodológica del trabajo no está en la arquitectura sino en el diseño experimental: los 58 codificadores comparten receta y solo difieren en la geometría del enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos), aunque la celda r = all, L = 33 no existe porque enmascararía la ventana completa. El artículo recomienda la configuración r = 9 cm, L = 2, disponible en los repositorios `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`.

## Capacidades

- Extracción de características EEG: el pipeline declarado es `feature-extraction`; el modelo devuelve características contextuales por parche utilizables como entrada de sondas downstream.
- Clasificación y regresión con codificador congelado: evaluado con sonda ridge sobre las características contextuales aplanadas, con 12 conjuntos de datos y 5 semillas.
- Independencia de montaje: admite cualquier número y conjunto de canales, siempre que cada canal tenga una posición 3D en metros, lo que permite reutilizarlo entre equipos y protocolos distintos.
- Adaptación mediante ajuste fino: el código de OpenEEGBench permite usar el modelo como `PretrainedBackbone` para evaluación o ajuste fino.
- Robustez de entrada mediante preprocesado integrado: el wrapper gestiona la conversión de unidades y el escalado por ventana, por lo que no debe estandarizarse la señal previamente.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni modo de razonamiento (thinking).
- Capacidades multilingües: no aplica; la entrada no es lingüística.
- Capacidad especial: pertenece a una familia diseñada para ablaciones controladas de geometría de enmascaramiento, lo que permite comparaciones internas estrictas entre checkpoints.

## Casos de uso

- Clasificación de crisis epilépticas: con características congeladas y una sonda ridge, el modelo alcanza 0,806 ± 0,042 de exactitud balanceada en chbmit y 0,924 ± 0,027 en tuev, por lo que resulta adecuado como extractor base en pipelines de detección de eventos epilépticos donde no se dispone de grandes volúmenes etiquetados.
- Clasificación de etapas de sueño: 0,704 ± 0,002 de exactitud balanceada en isruc-sleep, útil para montar un clasificador de hipnograma sobre registros polysomnográficos sin entrenar una red desde cero.
- Detección de depresión a partir de EEG: 0,842 ± 0,015 en mdd_mumtaz2016, un escenario típico de cohortes pequeñas donde el preentrenamiento aporta regularización.
- Decodificación de carga cognitiva y aritmética mental: 0,733 ± 0,003 en arithmetic_zyma2019, aplicable a interfaces cerebro-ordenador pasivas que estiman esfuerzo mental en entornos de monitorización.
- Investigación en interfaces cerebro-ordenador motoras: 0,441 ± 0,009 en bcic2a y 0,283 ± 0,019 en bcic2020-3, como punto de partida para comparar arquitecturas o geometrías de enmascaramiento antes de invertir en entrenamiento completo.
- Ablación metodológica de enmascaramiento: dado que los 58 checkpoints de la colección comparten receta, este modelo sirve para aislar el efecto de r = 12 cm frente a otros radios y longitudes temporales en una misma tarea downstream.
- Integración en plataformas de evaluación: el modelo se carga como `PretrainedBackbone` de OpenEEGBench, de modo que puede incorporarse a comparativas reproducibles entre modelos fundacionales EEG con un único cambio de repositorio.
- Extracción de características para modelos posteriores: las características contextuales por parche pueden alimentar clasificadores ligeros, agrupamiento no supervisado o análisis exploratorio de representaciones en neurociencia computacional.

## Benchmarks y rendimiento

Resultados con codificador congelado y sonda ridge sobre características contextuales aplanadas (OpenEEGBench, 12 conjuntos de datos × 5 semillas; exactitud balanceada para clasificación y R² para `seed-vig`):

| Conjunto de datos | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,733 ± 0,003 | 5 |
| bcic2020-3 | exactitud balanceada | 0,283 ± 0,019 | 5 |
| bcic2a | exactitud balanceada | 0,441 ± 0,009 | 5 |
| chbmit | exactitud balanceada | 0,806 ± 0,042 | 5 |
| faced | exactitud balanceada | 0,321 ± 0,004 | 5 |
| isruc-sleep | exactitud balanceada | 0,704 ± 0,002 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,842 ± 0,015 | 5 |
| physionet | exactitud balanceada | 0,581 ± 0,004 | 5 |
| seed-v | exactitud balanceada | 0,288 ± 0,002 | 5 |
| seed-vig | R² | −0,196 ± 0,027 | 5 |
| tuab | exactitud balanceada | 0,806 ± 0,016 | 5 |
| tuev | exactitud balanceada | 0,924 ± 0,027 | 5 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos fundacionales EEG (por ejemplo, frente a los checkpoints recomendados de la propia familia con r = 9 cm y L = 2).

## Requisitos de hardware

- VRAM estimada para inferencia: el codificador tiene 12,69 M parámetros, lo que supone aproximadamente 50,8 MB en precisión fp32 y 25,4 MB en fp16, sin contar activaciones. El consumo real depende del número de canales, la duración de la ventana y el tamaño de lote, y no se especifica en la documentación.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para la inferencia del codificador; el entrenamiento original se realizó con 2 × H100 y tamaño de lote de 600 por GPU.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU para ventanas cortas.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La carga se realiza con `safetensors.torch.load_file` y la clase `ContextualEncoderBenchmarkWrapper` del paquete `eeg_fm_masking` (instalable con `pip install git+https://github.com/PierreGtch/eeg-fm-masking`), o con `open_eeg_bench.backbone.PretrainedBackbone`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo permite comparar con otros miembros de la misma familia de 58 codificadores, que comparten arquitectura, datos y receta de entrenamiento:

| Modelo | Marco | Radio r | Longitud L | pct_unmasked | Parametros codificador | Licencia | Resultados downstream |
|---|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r12cm_L33 (este) | MAE | 12 cm | 33 parches | 0,45 | 12,69 M | CC-BY-4.0 | Tabla de la sección anterior (12 conjuntos) |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible | no disponible | CC-BY-4.0 | no disponible |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible | no disponible | CC-BY-4.0 | no disponible |

El artículo recomienda las configuraciones con r = 9 cm y L = 2 por delante de la configuración r = 12 cm y L = 33 que representa este checkpoint. No se dispone de datos de benchmarks de modelos fundacionales EEG externos a esta familia en la información proporcionada, por lo que no se incluye una comparativa frente a ellos.

## Limitaciones y advertencias

- Solo se publica el codificador; el decoder del MAE no está incluido, por lo que el modelo no puede utilizarse para reconstrucción de señal con los tensores del repositorio.
- Rendimiento desigual entre tareas: en seed-vig el R² es negativo (−0,196 ± 0,027), lo que indica un rendimiento peor que el de un predictor trivial basado en la media, y en bcic2020-3 la exactitud balanceada es de 0,283 ± 0,019 y en seed-v de 0,288 ± 0,002, valores bajos que desaconsejan su uso directo en esas tareas sin ajuste fino o sin validación previa.
- No es la configuración recomendada por los autores: el artículo propone r = 9 cm y L = 2, de modo que este checkpoint es útil sobre todo para estudios de ablación.
- Requisitos de entrada estrictos: 200 Hz de frecuencia de muestreo, unidades en voltios y posiciones de canal en metros. La señal no debe estandarizarse antes de pasarla al wrapper, porque este aplica su propio escalado `median_std_clip` con recorte en σ = 15.
- Dependencia de metadatos de montaje: aunque el modelo es agnóstico al montaje, cada canal necesita una posición 3D; los registros sin `info["chs"]` completo no pueden procesarse tal cual.
- La carga con `strict=False` omite deliberadamente las partes dependientes del conjunto de datos (búfer de posiciones de canales y cabeza de clasificación), lo que hay que tener en cuenta al reproducir resultados.
- Riesgo de sesgo por los datos: el preentrenamiento usa 323 grabaciones del subconjunto abierto de REVE, una muestra reducida y con composición demográfica, clínica y de equipamiento no detallada en la información disponible; no hay evaluación de sesgos por edad, sexo, patología o fabricante de dispositivo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de extrapolación incorrecta al aplicar las características a poblaciones o paradigmas alejados de los 12 conjuntos evaluados.
- Licencia: los pesos están bajo CC-BY-4.0, que permite uso comercial siempre que se atribuya la autoría y se indique la licencia; el incumplimiento de la atribución invalida el uso. El código del repositorio GitHub es MIT.
- Ausencia de resultados publicados de cuantización, latencia o throughput, lo que obliga a medirlos en cada entorno de producción.
- Los resultados presentados corresponden a un codificador congelado con sonda ridge; no garantizan el comportamiento con ajuste fino completo ni con cabezas más complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r12cm_L33
- Sitio web del artículo: https://pierregtch.github.io/eeg-fm-masking
- Código (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Configuración recomendada por el artículo (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Configuración recomendada por el artículo (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Ejecución de entrenamiento en WandB: https://wandb.ai/pierregtch/chan-inv-clf/runs/7aipvvk5
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos fueron páginas de ayuda de YouTube y contenidos de Zhihu sin relación).
