# PierreGtch/eeg-fm-masking_jepa_r9cm_L1

## Resumen

eeg-fm-masking_jepa_r9cm_L1 es un codificador de EEG preentrenado publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de uno de los 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos de preentrenamiento); en concreto, esta variante usa el marco JEPA (joint-embedding predictive architecture) con radio espacial de máscara de 9 cm y longitud temporal de 1 parche.

El modelo resuelve el problema de obtener representaciones transferibles de señales electroencefalográficas sin etiquetas, de forma agnóstica al montaje de electrodos. Con 12,69 millones de parámetros y pesos en safetensors, el repositorio contiene únicamente el codificador (tokenizador de parches `feature_encoder.*` y transformer `model.*`), que es exactamente lo evaluado en el artículo; el predictor JEPA y el profesor EMA no se distribuyen.

Es relevante ahora porque forma parte de una evaluación controlada y reproducible sobre OpenEEGBench, con resultados publicados por dataset y semilla, y porque sus pesos se liberan bajo CC-BY-4.0 al haberse entrenado solo sobre el subconjunto de licencia abierta del corpus REVE (323 registros), lo que permite redistribuirlos. No es un modelo generativo ni de lenguaje: su pipeline es `feature-extraction`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador contextual sobre parches temporales (tokenizador de parches + transformer); preentrenamiento JEPA con predictor y profesor EMA |
| Parámetros totales | 12.692.096 (12,69 M), solo codificador |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explícita; entrada troceada en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) y ventana completa determinada por `n_times` en tiempo de inferencia |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados ni versiones GGUF) |
| Idiomas soportados | no disponible / no aplica (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 para los pesos; código bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`), acompañado de `config.json` y `metadata.json` |

## Arquitectura y entrenamiento

La arquitectura es un codificador transformer que opera sobre parches de 1 segundo de señal EEG muestreada a 200 Hz. El preentrenamiento sigue el marco JEPA: un predictor proyecta las representaciones del contexto hacia las embeddings que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. La geometría de enmascaramiento de esta variante concreta es radio espacial `r = 9 cm`, longitud temporal `L = 1 parche` y `pct_unmasked = 0.45`. El checkpoint distribuido corresponde a la época 10 de 10 (etiqueta `v9`, la evaluada en el artículo). La combinación `r = all, L = 33` no existe porque enmascararía la ventana completa.

Los datos de preentrenamiento son el subconjunto de licencia abierta del corpus REVE (323 registros), elegido precisamente para poder redistribuir los pesos. El calendario de entrenamiento fue de 10 épocas sobre 2 × H100, con batch size de 600 por GPU, learning rate 0.00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0.01, en la ejecución `biy1de7c` de Weights & Biases. Los autores recomiendan para uso general la configuración `r = 9 cm, L = 2`, disponible en las variantes MAE y JEPA enlazadas más abajo.

El modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada canal tenga una posición 3D. La entrada debe estar en voltios (el wrapper multiplica por `factor = 1e+06` y aplica un escalado `median_std_clip` por ventana con recorte en σ = 15), por lo que no debe estandarizarse previamente. Las posiciones de canal se expresan en metros (`info["chs"][i]["loc"][:3]` de MNE).

## Capacidades

- Extracción de características (feature extraction) de señales EEG a 200 Hz mediante el pipeline `feature-extraction`.
- Codificación contextual de parches temporales de 1 segundo, apta como backbone congelado para sondas lineales (ridge) o para fine-tuning.
- Independencia del montaje: funciona con cualquier número y disposición de electrodos, siempre que se proporcionen posiciones 3D en metros.
- Aprendizaje autosupervisado (self-supervised learning) con objetivos JEPA, sin necesidad de etiquetas para el preentrenamiento.
- Soporte de clasificación y regresión aguas abajo a través de OpenEEGBench (`PretrainedBackbone`), con 12 conjuntos de datos evaluados.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- No dispone de modo "thinking" ni de capacidades multilingües en el sentido habitual, al no procesar lenguaje.

## Casos de uso

- Detección de anomalías en EEG clínico: con el codificador congelado y una sonda ridge se alcanza una precisión balanceada de 0,804 ± 0,004 en el conjunto tuab, suficiente para un sistema de triaje que priorice revisiones.
- Detección de eventos y artefactos (tuev): 0,902 ± 0,029 de precisión balanceada, útil como etapa de limpieza automática previa a análisis posteriores en pipelines de investigación.
- Detección de crisis epilépticas (chbmit): 0,891 ± 0,013, aprovechable en monitorización continua con alertas tempranas sobre registros de larga duración.
- Estadificación del sueño (isruc-sleep): 0,682 ± 0,003, para hipnogramas automáticos en estudios de sueño o dispositivos domésticos.
- Cribado de depresión a partir de EEG (mdd_mumtaz2016): 0,816 ± 0,046, como apoyo en estudios de biomarcadores, nunca como diagnóstico autónomo.
- Clasificación de tareas cognitivas y carga mental (arithmetic_zyma2019): 0,752 ± 0,008, en interfaces cerebro-computador de investigación.
- Extracción de embeddings para búsqueda y agrupamiento de registros: al ser un modelo de 12,69 M de parámetros, permite indexar grandes volúmenes de EEG en CPU o en una única GPU consumer.
- Aprendizaje por transferencia en datasets pequeños: la combinación de encoder congelado más sonda ridge reduce el coste de adaptación a un nuevo paradigma experimental sin reentrenar el backbone.
- Evaluación comparativa de geometrías de enmascaramiento: sirve como punto de referencia reproducible frente a las otras 57 variantes de la misma receta.

## Benchmarks y rendimiento

Resultados publicados en la model card para OpenEEGBench con encoder congelado y sonda ridge sobre las características contextuales aplanadas (12 conjuntos de datos × 5 semillas; precisión balanceada en clasificación y R² en `seed-vig`):

| Dataset | Métrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | precisión balanceada | 0,752 ± 0,008 | 5 |
| bcic2020-3 | precisión balanceada | 0,287 ± 0,006 | 5 |
| bcic2a | precisión balanceada | 0,439 ± 0,008 | 5 |
| chbmit | precisión balanceada | 0,891 ± 0,013 | 5 |
| faced | precisión balanceada | 0,288 ± 0,002 | 5 |
| isruc-sleep | precisión balanceada | 0,682 ± 0,003 | 5 |
| mdd_mumtaz2016 | precisión balanceada | 0,816 ± 0,046 | 5 |
| physionet | precisión balanceada | 0,536 ± 0,003 | 5 |
| seed-v | precisión balanceada | 0,309 ± 0,002 | 5 |
| seed-vig | R² | -0,307 ± 0,006 | 5 |
| tuab | precisión balanceada | 0,804 ± 0,004 | 5 |
| tuev | precisión balanceada | 0,902 ± 0,029 | 5 |

No se han proporcionado comparaciones numéricas directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 51 MB en fp32 (12,69 M de parámetros × 4 bytes) y unos 25 MB en fp16; el consumo real está dominado por las activaciones de la ventana de entrada y el batch.
- GPU recomendadas: cualquiera con suficiente memoria para el batch; el entrenamiento original se realizó sobre 2 × H100, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer sin problema: RTX 3060, RTX 4070, RTX 4090 o incluso GPUs integradas, y también puede ejecutarse en CPU para extracción de características.
- Opciones de despliegue: PyTorch con la librería `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y OpenEEGBench mediante `PretrainedBackbone`; no hay soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni publicarse pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparación con las variantes hermanas de la misma receta, cuyos datos sí aparecen en la información proporcionada. No se dispone de datos de otros modelos de fundación de EEG en la información consultada.

| Modelo | Framework | Geometría de máscara | Parámetros | Contexto | Licencia | Resultados |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r9cm_L1 (este modelo) | JEPA | r = 9 cm, L = 1 parche, pct_unmasked = 0.45 | 12,69 M | parches de 1 s a 200 Hz | CC-BY-4.0 | 12 datasets de OpenEEGBench, 5 semillas (tabla superior) |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 parches | no disponible | parches de 1 s a 200 Hz | CC-BY-4.0 | no disponible en la información proporcionada |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 parches | no disponible | parches de 1 s a 200 Hz | CC-BY-4.0 | no disponible en la información proporcionada |
| Otros modelos de fundación de EEG (LaBraM, BIOT, BENDR, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

Las variantes `r = 9 cm, L = 2` son las recomendadas por los autores del artículo.

## Limitaciones y advertencias

- No es un modelo generativo ni de propósito general: solo produce características para señales EEG; no genera texto, código ni respuestas.
- Rendimiento muy bajo en varios conjuntos de OpenEEGBench: bcic2020-3 (0,287), faced (0,288), seed-v (0,309) y bcic2a (0,439) están en torno al azar o ligeramente por encima, y seed-vig presenta un R² negativo (-0,307), lo que indica ausencia de capacidad predictiva útil en esa tarea.
- El preentrenamiento usa solo 323 registros del subconjunto abierto de REVE, un volumen reducido que limita la generalidad de las representaciones.
- Requisitos de entrada estrictos: muestreo a 200 Hz, señal en voltios, posiciones de canal en metros y ausencia de estandarización previa; desviarse de estas condiciones invalida los resultados publicados.
- El repositorio contiene únicamente el codificador; el predictor JEPA y el profesor EMA no están incluidos, por lo que no se puede reproducir el preentrenamiento a partir de estos pesos.
- La carga con `strict=False` deja fuera el buffer de posiciones de canal (dependiente del dataset) y la cabeza de clasificación; es necesario aportar `chs_info` correctamente.
- Sesgos conocidos: no disponibles explícitamente; los conjuntos de evaluación son en su mayoría de poblaciones y protocolos específicos, por lo que el rendimiento puede no transferirse a otras cohortes, edades o equipos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreinterpretar las características en tareas para las que el modelo no muestra capacidad (por ejemplo, seed-vig).
- No hay validación clínica: los resultados son de investigación y no deben usarse para diagnóstico médico autónomo.
- Licencia CC-BY-4.0: permite uso comercial y redistribución siempre que se atribuya correctamente y se cite el artículo; el código asociado está bajo MIT.
- El modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, sin validación independiente por parte de la comunidad.
- No se publican cuantizaciones, por lo que cualquier optimización de tamaño o latencia debe realizarse por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L1
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del artículo: https://pierregtch.github.io/eeg-fm-masking
- Código fuente: https://github.com/PierreGtch/eeg-fm-masking
- Variante recomendada MAE r = 9 cm, L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA r = 9 cm, L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/biy1de7c
