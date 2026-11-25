# PierreGtch/eeg-fm-masking_jepa_rall_L1

## Resumen

`eeg-fm-masking_jepa_rall_L1` es un codificador de electroencefalografía (EEG) preentrenado por Pierre Guetschel (PierreGtch) como parte de un estudio sistemático sobre geometrías de enmascaramiento en modelos fundacionales de EEG. El modelo forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de la máscara: 5 radios espaciales por 6 longitudes temporales por 2 marcos de preentrenamiento (MAE y JEPA). Este checkpoint concreto corresponde al marco JEPA con radio espacial "all" (todos los canales) y longitud temporal de 1 parche.

La arquitectura es un transformer codificador de 12,69 millones de parámetros que opera sobre parches de 1 segundo a 200 Hz, con posiciones de canal en metros, lo que lo hace agnóstico al montaje. Se entrena de forma autosupervisada sobre el subconjunto de licencia abierta del corpus REVE (323 registros), lo que permite redistribuir los pesos bajo CC-BY-4.0. El modelo está pensado como extractor de características congeladas para evaluación downstream mediante OpenEEGBench.

Su relevancia es metodológica: el paper asociado (arXiv:2609.33487) concluye que la geometría de enmascaramiento óptima es r = 9 cm y L = 2, por lo que este checkpoint (r = all, L = 1) sirve como punto de comparación dentro del barrido, no como la configuración recomendada. Es útil para investigadores que quieran reproducir el estudio o analizar el efecto de la geometría de la máscara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador sobre parches EEG (JEPA, joint-embedding predictive architecture) |
| Parámetros totales | 12.692.096 (codificador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de entrada variable; parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de señales EEG, no lingüístico) |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors (`model.safetensors`, más subcarpetas `epoch_01/` a `epoch_09/`) |

## Arquitectura y entrenamiento

El modelo es un codificador transformer que tokeniza la señal EEG en parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento) y añade información posicional de los canales en metros, de modo que admite cualquier número y conjunto de electrodos siempre que cada uno tenga coordenadas 3D. El preentrenamiento sigue el marco JEPA: un predictor mapea el contexto del codificador a los embeddings que un profesor EMA produce para los parches enmascarados, sin regularizador de varianza/covarianza. En este checkpoint la máscara cubre todos los canales (r = all) durante 1 parche temporal (L = 1), con `pct_unmasked = 0.45`.

El entrenamiento usa el subconjunto de licencia abierta del corpus REVE (323 registros), 10 épocas, 2 GPU H100, batch de 600 por GPU, learning rate 0.00024 con warm-up de 3080 pasos y decaimiento hasta 1e-06, y weight decay de 0.01. El repo incluye los checkpoints intermedios de las épocas 1 a 9 además del final (época 10). El wrapper de evaluación aplica escalado por ventana `median_std_clip` con clip en σ = 15 y multiplica la entrada por 1e+06, asumiendo datos en voltios sin estandarizar previamente.

## Capacidades

- Extracción de características de señales EEG: produce embeddings contextuales por parche a partir de ventanas multicanal.
- Agnóstico al montaje: funciona con cualquier número y disposición de canales, siempre que cada canal tenga posición 3D en metros.
- Evaluación con codificador congelado: diseñado para usarse con una sonda ridge sobre las características aplanadas (OpenEEGBench).
- Clasificación downstream de múltiples tareas EEG: aritmética mental, BCI (bcic2a, bcic2020-3), detección de crisis (chbmit), reconocimiento facial (faced), sueño (isruc-sleep), depresión (mdd_mumtaz2016), edad (tuab), eventos (tuev), entre otras.
- Regresión sobre señales EEG: tarea `seed-vig` con métrica R².
- Checkpoints intermedios para análisis de dinámica de entrenamiento (épocas 1 a 9).
- No soporta tool calling, agentes, generación de texto, visión ni audio; no es un modelo lingüístico.

## Casos de uso

- Investigación sobre geometría de enmascaramiento: usar este checkpoint junto a los otros 57 de la colección para reproducir el barrido del paper y comparar el efecto de r y L sobre el rendimiento downstream.
- Detección de crisis epilépticas: con el codificador congelado y una sonda ridge se obtiene 0,838 de balanced accuracy en chbmit, útil como línea base en pipelines de monitorización EEG.
- Clasificación de estados de sueño: 0,575 de balanced accuracy en isruc-sleep permite integrar el extractor en sistemas de estadificación con poco etiquetado.
- Detección de eventos en EEG clínico: 0,874 en tuev lo hace adecuado como extractor previo a clasificadores de eventos en registros continuos.
- Detección de depresión a partir de EEG: 0,773 en mdd_mumtaz2016 sirve como base para estudios de biomarcadores con conjuntos pequeños.
- Estimación de edad cerebral: 0,734 en tuab permite usar los embeddings como representación para modelos de envejecimiento o anomalías.
- Análisis de dinámica de preentrenamiento: los checkpoints de las épocas 1 a 9 permiten estudiar cómo evolucionan las representaciones y elegir un punto de congelación alternativo.
- Extracción de características para BCI: los embeddings contextuales pueden alimentar clasificadores ligeros en tiempo casi real, dado el reducido tamaño del modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card: codificador congelado, sonda ridge sobre características contextuales aplanadas, 12 conjuntos de datos, 5 semillas. Balanced accuracy para clasificación y R² para `seed-vig`.

| Dataset | Métrica | Puntuación (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,675 ± 0,005 | 5 |
| bcic2020-3 | balanced acc. | 0,260 ± 0,008 | 5 |
| bcic2a | balanced acc. | 0,301 ± 0,006 | 5 |
| chbmit | balanced acc. | 0,838 ± 0,027 | 5 |
| faced | balanced acc. | 0,199 ± 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,575 ± 0,001 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,773 ± 0,013 | 5 |
| physionet | balanced acc. | 0,387 ± 0,008 | 5 |
| seed-v | balanced acc. | 0,279 ± 0,001 | 5 |
| seed-vig | R² | -0,848 ± 0,009 | 5 |
| tuab | balanced acc. | 0,734 ± 0,003 | 5 |
| tuev | balanced acc. | 0,874 ± 0,028 | 5 |

No se han publicado en la información disponible resultados comparativos frente a los otros checkpoints de la colección ni frente a modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 12,69 M de parámetros; el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se hizo en 2 × H100 pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el wrapper `ContextualEncoderBenchmarkWrapper` del paquete `eeg-fm-masking`; integración con OpenEEGBench mediante `PretrainedBackbone`. No se publican variantes GGUF ni soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rall_L1 (este) | 12,69 M | parches de 1 s, ventana variable | JEPA, máscara r = all, L = 1 | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_jepa_r9cm_L2 | no disponible en la información | parches de 1 s, ventana variable | JEPA, máscara r = 9 cm, L = 2 (recomendado en el paper) | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | no disponible en la información | parches de 1 s, ventana variable | MAE, máscara r = 9 cm, L = 2 (recomendado en el paper) | CC-BY-4.0 | Hugging Face |
| Resto de la colección (55 checkpoints) | 12,69 M (misma receta) | parches de 1 s, ventana variable | MAE o JEPA con distintas geometrías | CC-BY-4.0 | Hugging Face |

Los tres primeros comparten receta de entrenamiento y corpus; solo cambia la geometría de la máscara y, en su caso, el marco. No se dispone de datos de rendimiento de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint no es la configuración recomendada por el paper: los autores aconsejan r = 9 cm y L = 2. Usarlo en producción sin comparar con `eeg-fm-masking_jepa_r9cm_L2` puede implicar peor rendimiento downstream.
- El rendimiento es muy desigual entre tareas: valores cercanos al azar en bcic2a (0,301), bcic2020-3 (0,260), faced (0,199) y seed-v (0,279), y R² negativo en seed-vig (-0,848), lo que indica que las características no capturan bien esas tareas.
- Requiere preprocesado específico: 200 Hz, unidades en voltios, sin estandarización previa, posiciones de canal en metros. Un error en estas condiciones degrada silenciosamente los resultados.
- Solo se distribuye el codificador; el predictor JEPA y el profesor EMA no están incluidos, por lo que no se puede reanudar el preentrenamiento tal cual desde estos pesos.
- Sesgos: al entrenarse sobre 323 registros del corpus REVE, puede heredar sesgos de población, equipamiento y protocolos de esos registros; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de extrapolación incorrecta fuera de la distribución de montajes, frecuencias de muestreo o patologías no representadas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el código es MIT. Verificar la cadena de atribución del corpus REVE subyacente.
- No hay garantías de robustez clínica: no debe usarse como dispositivo médico ni para diagnóstico sin validación específica.

## Enlaces

- Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rall_L1
- Paper: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Checkpoint recomendado JEPA: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Checkpoint recomendado MAE: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Run de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/l29shjdg
