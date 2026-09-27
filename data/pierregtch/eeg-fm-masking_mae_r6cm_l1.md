# PierreGtch/eeg-fm-masking_mae_r6cm_L1

## Resumen

`eeg-fm-masking_mae_r6cm_L1` es un codificador de electroencefalografía (EEG) preentrenado mediante autoencoder enmascarado (MAE) por Pierre Gtch, publicado como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascarado: 5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo (MAE y JEPA). Esta variante concreta emplea un radio espacial `r = 6 cm` y una longitud temporal `L = 1` parche.

El problema que aborda es la falta de criterios empíricos para diseñar tareas pretexto en modelos fundacionales de EEG: en lugar de proponer una arquitectura nueva, el trabajo aísla la variable del enmascarado y mide su efecto sobre 12 tareas downstream. El modelo resultante es un extractor de características congelables de 12,69 millones de parámetros, agnóstico al montaje de electrodos (funciona con cualquier número y disposición de canales, siempre que cada uno tenga una posición 3D en metros).

Es relevante ahora porque los modelos fundacionales de EEG están pasando de prototipos académicos a componentes reutilizables en pipelines clínicos y de neurotecnología, y este release aporta pesos redistribuibles (CC-BY-4.0) entrenados sobre un subconjunto de licencia abierta del corpus REVE, junto con resultados de referencia reproducibles bajo OpenEEGBench. Los autores recomiendan, no obstante, las variantes `r = 9 cm, L = 2` como configuración de mejor rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches; autoencoder enmascarado (MAE), solo se distribuye el codificador |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como valor fijo; la señal se segmenta en parches de 1 s (200 muestras a 200 Hz, solape de 20 muestras) y la ventana la define el usuario mediante `n_times` |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas ni GGUF) |
| Idiomas soportados | No aplica / no disponible (entrada de señales EEG, no texto) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el código |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `metadata.json` |
| Parametros de enmascarado | Radio espacial `r = 6 cm`, longitud temporal `L = 1` parche, `pct_unmasked = 0,45` |
| Checkpoint | Epoca 10 de 10 (version `v9`, la evaluada en el paper) |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | Voltios (el wrapper aplica `factor = 1e+06` y escalado `median_std_clip` con recorte a σ = 15) |
| Posiciones de canales | Metros (`info["chs"][i]["loc"][:3]` de MNE); montaje-agnóstico |
| Pipeline declarado | feature-extraction |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un autoencoder enmascarado: un tokenizador de parches (`feature_encoder.*`) convierte la señal en representaciones de parche y un transformer (`model.*`) procesa únicamente los parches no enmascarados; un decodificador ligero reconstruye la señal cruda de los parches enmascarados durante el preentrenamiento. El repositorio publicado contiene **solo el codificador** (tokenizador más transformer), que es exactamente el conjunto de tensores cargado en la evaluación downstream del artículo; el decodificador MAE no se distribuye. El enmascarado se define de forma conjunta en el espacio y el tiempo: un radio espacial de 6 cm alrededor de los electrodos y una longitud temporal de un parche, dejando sin enmascarar el 45 % de los parches.

El preentrenamiento se realizó sobre el subconjunto de licencia abierta del corpus REVE, compuesto por 323 registros, precisamente para que los pesos pudieran redistribuirse. El calendario fue de 10 épocas en 2 × H100, con tamaño de lote de 600 por GPU, tasa de aprendizaje de 0,00024 (calentamiento de 3080 pasos hasta 1e-06 final) y decaimiento de peso de 0,01. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna otra etapa de alineación, algo esperable en un modelo que no genera lenguaje. La innovación metodológica del trabajo no es arquitectónica sino experimental: 58 codificadores entrenados con receta idéntica donde solo cambia la geometría de enmascarado, lo que permite atribuir diferencias de rendimiento a esa variable.

## Capacidades

- Extracción de características de señales EEG: genera representaciones contextuales por parche sobre ventanas de señal a 200 Hz.
- Funciona como backbone congelado para sondas lineales (regresión ridge) en clasificación y regresión sobre 12 conjuntos de datos de OpenEEGBench.
- Admite ajuste fino posterior, aunque los resultados publicados corresponden a encoder congelado.
- Agnóstico al montaje: acepta cualquier número y conjunto de canales, siempre que cada canal tenga una posición 3D en metros.
- Maneja múltiples tareas fisiológicas y clínicas: aritmética mental, imaginación motora, detección de crisis epilépticas, sueño, emoción, atención sostenida, vigilancia, depresión y anormalidades en EEG clínico.
- Entrada multimodal en el sentido de distintas configuraciones de canales, pero no procesa texto, imagen ni audio: no hay tool calling, ni function calling, ni capacidades de agente.
- No dispone de modo de razonamiento extendido ("thinking"), ni de decodificación especulativa documentada.

## Casos de uso

- Monitorización de crisis epilépticas: congelar el encoder y entrenar una sonda sobre las características contextuales permite clasificar segmentos de EEG de pacientes con epilepsia; en OpenEEGBench el modelo alcanza 0,771 de exactitud balanceada en `chbmit` con solo una regresión ridge, un punto de partida razonable para un detector de crisis.
- Detección de anormalidades en EEG clínico: la puntuación de 0,809 en `tuab` lo hace utilizable como extractor previo a un clasificador binario normal/anormal en herramientas de triaje de lecturas EEG.
- Clasificación de sueño: con 0,658 en `isruc-sleep`, sirve como base para estadificación automática de fases del sueño a partir de registros polisomnográficos.
- Investigación en interfaces cerebro-computador: 0,464 en `bcic2a` permite evaluar la transferibilidad del encoder a paradigmas de imaginación motora antes de invertir en entrenamiento específico por sujeto.
- Evaluación de biomarcadores psiquiátricos: 0,815 en `mdd_mumtaz2016` (depresión) lo sitúa como candidato para pipelines de investigación que buscan correlatos electrofisiológicos de trastornos del estado de ánimo.
- Detección de artefactos y eventos transitorios: la puntuación de 0,921 en `tuev` es la más alta de esta variante y respalda su uso en la identificación de eventos anómalos en registros largos.
- Extracción de características para estudios comparativos: dado que forma parte de una matriz controlada de 58 modelos, es útil como referencia en experimentos de ablación sobre geometría de enmascarado, aislándose la variable espacial o temporal.
- Prototipado rápido en CPU: con 12,69 M de parámetros, cualquier investigador puede cargar el encoder en un portátil y obtener embeddings de EEG sin acceso a GPU, lo que facilita la replicación de resultados.

## Benchmarks y rendimiento

Los resultados publicados corresponden a OpenEEGBench con encoder congelado y sonda ridge sobre las características contextuales aplanadas, 12 conjuntos de datos × 5 semillas. Exactitud balanceada para clasificación y R² para `seed-vig`.

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,685 ± 0,018 | 5 |
| bcic2020-3 | exactitud balanceada | 0,273 ± 0,016 | 5 |
| bcic2a | exactitud balanceada | 0,464 ± 0,004 | 5 |
| chbmit | exactitud balanceada | 0,771 ± 0,089 | 5 |
| faced | exactitud balanceada | 0,320 ± 0,005 | 5 |
| isruc-sleep | exactitud balanceada | 0,658 ± 0,002 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,815 ± 0,016 | 5 |
| physionet | exactitud balanceada | 0,585 ± 0,004 | 5 |
| seed-v | exactitud balanceada | 0,286 ± 0,002 | 5 |
| seed-vig | R² | -0,098 ± 0,009 | 5 |
| tuab | exactitud balanceada | 0,809 ± 0,004 | 5 |
| tuev | exactitud balanceada | 0,921 ± 0,031 | 5 |

No se han publicado en la información disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,69 M de parámetros equivalen a unos 51 MB en fp32 y unos 25 MB en fp16/bf16 para los pesos; sumando activaciones y un lote pequeno, la inferencia completa cabe holgadamente por debajo de 1 GB de VRAM (calculo derivado del numero de parametros, no un dato publicado).
- GPU recomendadas: cualquier GPU moderna sirve; durante el preentrenamiento se usaron 2 × H100 con lote de 600 por GPU, pero esas necesidades corresponden al entrenamiento, no a la inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 2 GB o mas (por ejemplo GTX 1050 Ti, RTX 3060, RTX 4090) e incluso en CPU para extraccion de caracteristicas.
- Opciones de despliegue: PyTorch con `safetensors` a traves de `ContextualEncoderBenchmarkWrapper` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) o como `PretrainedBackbone` de OpenEEGBench. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa aproximadamente 0,1 GB.

## Comparativa con modelos similares

| Modelo | Framework | Parametros | Geometria de enmascarado | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mae_r6cm_L1` (este modelo) | MAE | 12,69 M | r = 6 cm, L = 1 parche, pct_unmasked = 0,45 | EEG a 200 Hz, parches de 1 s | CC-BY-4.0 | HuggingFace |
| `mae_r9cm_L2` | MAE | No disponible | r = 9 cm, L = 2 parches | EEG a 200 Hz, parches de 1 s | CC-BY-4.0 | HuggingFace; recomendado por los autores |
| `jepa_r9cm_L2` | JEPA | No disponible | r = 9 cm, L = 2 parches | EEG a 200 Hz, parches de 1 s | CC-BY-4.0 | HuggingFace; recomendado por los autores |
| Otros modelos fundacionales de EEG (LaBraM, BIOT, EEGPT) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye comparaciones numericas contra modelos fundacionales de EEG ajenos a esta familia; la unica comparacion controlada disponible es interna, entre las 58 variantes de geometria de enmascarado del mismo estudio.

## Limitaciones y advertencias

- Es un codificador, no un modelo generativo: no produce texto, codigo ni respuestas; su uso requiere anadir una cabeza o sonda downstream.
- Solo se distribuye el encoder. El decodificador MAE, necesario para reproducir la tarea pretexto, no esta incluido en el repositorio.
- Esta variante no es la recomendada por los autores: el paper sugiere `r = 9 cm, L = 2`, por lo que su uso en produccion deberia justificarse frente a esas alternativas.
- Riesgo de sobreajuste a la distribucion de preentrenamiento: el corpus es un subconjunto abierto de REVE con solo 323 registros, lo que limita la diversidad de montajes, patologias y poblaciones.
- Rendimiento desigual: en `seed-vig` el R² es negativo (-0,098), lo que indica que el encoder congelado no captura la variabilidad de vigilancia mejor que un modelo trivial; en `bcic2020-3` (0,273), `seed-v` (0,286) y `faced` (0,320) los resultados estan cerca o por debajo del azar en tareas de tres o mas clases.
- Requisitos de entrada estrictos: muestreo a 200 Hz, unidades en voltios y posiciones de canal en metros. Omitir el escalado `median_std_clip` del wrapper o estandarizar previamente los datos degrada los resultados.
- Dependencia de metadatos de MNE: sin `chs_info` con posiciones 3D por canal, el modelo no puede construir el tokenizador de parches espacial.
- Sesgos conocidos: no se documentan analisis de sesgo por edad, sexo, etnia o centro clinico en la informacion disponible; al tratarse de datos de EEG, las diferencias de montaje y de calidad de senal entre centros pueden inducir sesgos sistematicos.
- Restricciones de licencia: los pesos son CC-BY-4.0, lo que permite uso comercial siempre que se atribuya la autoria y se cite el paper; el codigo es MIT. No se declara ninguna restriccion adicional de uso clinico, pero tampoco certificacion medica alguna.
- Advertencia para produccion: resultados obtenidos con encoder congelado y sonda ridge; cualquier uso clinico real requeriria ajuste fino, validacion externa y cumplimiento normativo especifico.
- Fecha de publicacion registrada en HuggingFace: 2026-09-27 (dato tal cual figura en el repositorio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L1
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/du0xq3k8
