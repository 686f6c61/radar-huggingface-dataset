# PierreGtch/eeg-fm-masking_jepa_r9cm_L33

## Resumen

`eeg-fm-masking_jepa_r9cm_L33` es un encoder de electroencefalografía (EEG) preentrenado por PierreGtch, publicado como parte de un estudio controlado sobre geometría de enmascaramiento en modelos fundacionales de EEG. Se trata de uno de los 58 encoders entrenados con una receta idéntica en la que solo cambia la geometría de la máscara (5 radios espaciales × 6 longitudes temporales × 2 marcos de preentrenamiento). En concreto, este checkpoint corresponde al marco JEPA con radio espacial de 9 cm y longitud temporal de máscara de 33 parches.

El modelo no es un modelo de lenguaje: es un extractor de características (`pipeline_tag: feature-extraction`) que convierte ventanas de señal EEG en representaciones vectoriales. Su tamaño es de 12.692.096 parámetros y el repositorio ocupa 0,1 GB, por lo que se distribuye únicamente el encoder. La relevancia actual radica en que forma parte del benchmark OpenEEGBench, con resultados publicados sobre 12 conjuntos de datos y 5 semillas por conjunto, lo que permite comparar de forma reproducible distintas estrategias de preentrenamiento auto-supervisado en EEG.

El interés práctico del modelo está en su uso como backbone congelado para tareas downstream (clasificación con sonda ridge sobre las características contextuales) o como punto de partida para ajuste fino. El propio autor recomienda, sin embargo, la configuración r = 9 cm, L = 2 frente a la variante L = 33 que documenta esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer de parches sobre señal EEG, preentrenado con JEPA (joint-embedding predictive architecture): un predictor mapea el contexto del encoder a los embeddings que produce un profesor EMA para los parches enmascarados, sin regularizador de varianza/covarianza |
| Parámetros totales | 12.692.096 (encoder) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como contexto de tokens. La entrada es una ventana de señal a 200 Hz troceada en parches de 1 s (200 muestras, solapamiento de 20 muestras); `n_times` lo define el usuario. La máscara de preentrenamiento de este checkpoint cubre 33 parches |
| Tipos de cuantización | No disponible: solo se publican pesos en `safetensors`, sin versiones cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No aplica: modelo de señales EEG, sin entrada ni salida de texto |
| Licencia | CC-BY-4.0 para los pesos; el código del repositorio asociado es MIT |
| Formato de pesos | `safetensors` (`model.safetensors`, solo encoder) |

Metadatos adicionales del checkpoint: marco JEPA, radio espacial de máscara r = 9 cm, longitud temporal de máscara L = 33 parches, `pct_unmasked` = 0,45, checkpoint de la época 10 de 10 (etiquetado `v9`, el evaluado en el artículo), ejecución de entrenamiento `6pryn4us`.

## Arquitectura y entrenamiento

El modelo es un encoder transformer que opera sobre parches de señal EEG. El repositorio contiene el tokenizador de parches (`feature_encoder.*`) junto con el transformer (`model.*`), es decir, exactamente los tensores que se cargan en la evaluación downstream del artículo. El predictor JEPA y el profesor EMA no se distribuyen: para JEPA, los pesos publicados son los del encoder estudiante, tal y como se evaluaron. El enmascaramiento es agnóstico al montaje, de modo que admite cualquier número y conjunto de canales siempre que cada canal tenga una posición 3D en metros.

Los datos de preentrenamiento son el subconjunto con licencia abierta del corpus REVE (323 registros), elegido precisamente para que los pesos puedan redistribuirse bajo CC-BY-4.0. El entrenamiento consta de 10 épocas sobre 2 × H100 con tamaño de lote de 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3080 pasos, valor final 1e-06) y decaimiento de peso 0,01. La innovación metodológica del trabajo no está en una capa concreta, sino en el barrido controlado de la geometría de enmascaramiento manteniendo fija toda la demás receta, lo que permite aislar el efecto de r y L sobre el rendimiento downstream. No se documenta en la información disponible el uso de RLHF ni DPO (tampoco tendría sentido en un modelo sin salida de texto).

## Capacidades

- Extracción de características (embeddings) a partir de ventanas de EEG a 200 Hz, con entrada en voltios y escalado interno `median_std_clip` (recorte en σ = 15) aplicado por el wrapper.
- Independencia de montaje: funciona con cualquier número y disposición de canales, siempre que cada canal tenga coordenadas 3D en metros (`info["chs"][i]["loc"][:3]` de MNE).
- Preentrenamiento auto-supervisado tipo JEPA, útil como inicialización para ajuste fino supervisado o como backbone congelado.
- Evaluación directa con OpenEEGBench mediante `PretrainedBackbone` y sonda ridge sobre las características contextuales aplanadas.
- Clasificación de señales EEG en tareas muy diversas: aritmética mental, interfaces cerebro-computador, detección de crisis epilépticas, reconocimiento facial, estadificación del sueño, depresión, detección de anomalías y eventos.
- Regresión sobre señales fisiológicas continuas (por ejemplo, la tarea `seed-vig`).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponibles.

## Casos de uso

- Detección de crisis epilépticas: sobre CHB-MIT el encoder congelado alcanza una exactitud balanceada de 0,841 ± 0,085, de modo que puede emplearse como extractor en un sistema de monitorización continua que marque segmentos sospechosos para revisión clínica.
- Estadificación automática del sueño: con 0,720 ± 0,002 en ISRUC-Sleep y una dispersión entre semillas muy baja, es adecuado para pipelines que segmentan noches completas en fases de sueño de forma estable.
- Detección de anomalías y eventos en EEG clínico: TUAB (0,788 ± 0,011) y TUEV (0,936 ± 0,027) lo sitúan como backbone razonable para cribado de EEG anormal y clasificación de eventos paroxísticos.
- Apoyo al diagnóstico de depresión: en MDD Mumtaz 2016 obtiene 0,821 ± 0,037, lo que permite prototipar herramientas de apoyo a la decisión que prioricen registros para evaluación psiquiátrica.
- Interfaces cerebro-computador: en BCIC-2a logra 0,430 ± 0,018, suficiente como representación inicial en experimentos de decodificación motora, aunque por debajo de lo deseable para producto.
- Investigación comparativa en modelos fundacionales de EEG: al formar parte de una familia de 58 encoders con receta idéntica, sirve como punto de comparación controlado para estudiar el efecto de la geometría de enmascaramiento en transferencia.
- Preentrenamiento de partida para ajuste fino en dominios con pocos datos etiquetados, aprovechando que el modelo es agnóstico al montaje y admite configuraciones de canales heterogéneas.
- Extracción de características para modelos aguas abajo más ligeros (regresión logística, SVM o MLP sobre los embeddings) en entornos con presupuesto computacional mínimo.

## Benchmarks y rendimiento

Resultados publicados en la model card para OpenEEGBench con encoder congelado y sonda ridge sobre las características contextuales aplanadas (12 conjuntos de datos × 5 semillas; exactitud balanceada para clasificación y R² para `seed-vig`):

| Conjunto de datos | Métrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,662 ± 0,048 | 5 |
| bcic2020-3 | exactitud balanceada | 0,257 ± 0,018 | 5 |
| bcic2a | exactitud balanceada | 0,430 ± 0,018 | 5 |
| chbmit | exactitud balanceada | 0,841 ± 0,085 | 5 |
| faced | exactitud balanceada | 0,264 ± 0,004 | 5 |
| isruc-sleep | exactitud balanceada | 0,720 ± 0,002 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,821 ± 0,037 | 5 |
| physionet | exactitud balanceada | 0,531 ± 0,018 | 5 |
| seed-v | exactitud balanceada | 0,303 ± 0,001 | 5 |
| seed-vig | R² | -0,280 ± 0,050 | 5 |
| tuab | exactitud balanceada | 0,788 ± 0,011 | 5 |
| tuev | exactitud balanceada | 0,936 ± 0,027 | 5 |

No se proporcionan en la información disponible resultados comparativos frente a otros modelos fundacionales de EEG en forma de tabla, más allá de la comparación interna entre las 58 variantes del estudio. El artículo recomienda la configuración r = 9 cm, L = 2 en lugar de la variante L = 33 aquí documentada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 50 MB en fp32 y 25 MB en fp16 para los 12,69 M de parámetros del encoder; el coste dominante es el de las activaciones, que depende de `n_chans` y `n_times`.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas tarjetas integradas y de gama baja. El entrenamiento original usó 2 × H100 con lote de 600 por GPU, pero eso corresponde al preentrenamiento, no a la inferencia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso inferencia en CPU sin problema de memoria.
- Opciones de despliegue: el camino previsto es PyTorch con el paquete `eeg_fm_masking` (instalable con `pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y OpenEEGBench para evaluación. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de señal.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparación más informativa disponible es con las variantes hermanas del mismo estudio, que comparten arquitectura, datos y presupuesto de entrenamiento, y solo difieren en la geometría de la máscara:

| Modelo | Marco | r (cm) | L (parches) | Parámetros | Licencia | Nota |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r9cm_L33 | JEPA | 9 | 33 | 12.692.096 | CC-BY-4.0 | Este checkpoint |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 | 2 | No disponible | CC-BY-4.0 | Recomendado por el artículo |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 | 2 | No disponible | CC-BY-4.0 | Variante MAE también recomendada |

Frente a otros modelos fundacionales de EEG de la literatura (por ejemplo, enfoques basados en transformers sobre señales como LaBraM o BIOT), no se dispone en la información proporcionada de cifras de parámetros, contexto ni benchmarks comparables, por lo que la comparación cuantitativa con ellos queda como no disponible.

## Limitaciones y advertencias

- El propio artículo no recomienda esta configuración: la elección de L = 33 parches es peor que L = 2, y la model card remite explícitamente a las variantes `_r9cm_L2` (MAE y JEPA) como opción preferida.
- Rendimiento muy desigual por tarea: bcic2020-3 (0,257 ± 0,018), faced (0,264 ± 0,004) y seed-v (0,303 ± 0,001) están cerca o por debajo del nivel de azar en sus respectivos regímenes, y `seed-vig` presenta un R² negativo (-0,280 ± 0,050), lo que indica que las representaciones no capturan bien esa variable.
- Solo se publica el encoder. No están incluidos el predictor JEPA ni el profesor EMA, de modo que el checkpoint no permite reproducir el objetivo de preentrenamiento ni reanudar el entrenamiento auto-supervisado tal cual.
- Requisitos de entrada estrictos: muestreo a exactamente 200 Hz, señal en voltios sin estandarizar previamente (el wrapper aplica el escalado) y posiciones de canal obligatorias en metros. Omitir cualquiera de estas condiciones invalida las representaciones.
- Riesgo de generalización limitado por los datos: el preentrenamiento usa únicamente el subconjunto abierto de REVE (323 registros), no el corpus completo.
- Licencia CC-BY-4.0 en los pesos, que permite uso comercial con atribución; el código asociado es MIT. Cualquier uso derivado debe citar el artículo correspondiente.
- Al ser un modelo de extracción de características, no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe presentarse como un asistente conversacional.
- No hay datos publicados sobre sesgos demográficos, clínicos o de adquisición, ni sobre robustez frente a artefactos (movimiento ocular, muscular, deriva de electrodos) en la información disponible.
- Advertencia de uso clínico: los resultados son de investigación y no constituyen validación regulatoria para diagnóstico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L33
- Colección con los 58 modelos del estudio: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada JEPA r = 9 cm, L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante recomendada MAE r = 9 cm, L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Sitio web del artículo: https://pierregtch.github.io/eeg-fm-masking
- Código del proyecto: https://github.com/PierreGtch/eeg-fm-masking
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/6pryn4us
