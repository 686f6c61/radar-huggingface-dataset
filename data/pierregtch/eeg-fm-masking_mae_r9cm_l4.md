# PierreGtch/eeg-fm-masking_mae_r9cm_L4

## Resumen

`eeg-fm-masking_mae_r9cm_L4` es un codificador (*encoder*) de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (*masked autoencoder*, MAE). Lo desarrolla Pierre Guetschel (cuenta `PierreGtch`) como parte del estudio *What masking geometry works best for EEG foundation models?* (arXiv:2609.33487), cuyo objetivo es aislar el efecto de la geometría de enmascaramiento en el preentrenamiento autosupervisado de modelos fundacionales de EEG. Pertenece a una familia de 58 codificadores entrenados con una receta idéntica en la que solo varían el radio espacial de la máscara (5 valores) y la longitud temporal (6 valores) sobre dos marcos de trabajo (MAE y JEPA).

El modelo resuelve un problema concreto: proporcionar representaciones genéricas de señales EEG que puedan reutilizarse como extractor de características congelado en múltiples tareas downstream (clasificación de estados mentales, detección de anomalías, sueño, etc.) sin reentrenar desde cero. Con 12,69 M de parámetros en el codificador, es un modelo compacto orientado a *feature extraction*, no a generación de texto: no es un LLM y no procesa lenguaje natural.

Es relevante ahora porque los modelos fundacionales de EEG están en fase exploratoria y este trabajo aporta evidencia sistemática sobre qué configuración de enmascaramiento conviene, además de publicar los pesos de forma abierta (CC-BY-4.0) y con checkpoints intermedios por época, lo que facilita la reproducibilidad y el análisis de la dinámica de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (*patch tokeniser*) y codificador contextual; preentrenamiento MAE (autoencoder enmascarado) |
| Parametros totales | 12.692.096 (codificador únicamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de entrada segmentada en parches de 1 s (200 muestras, solapamiento de 20 muestras); longitud de contexto en tokens no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de señales EEG, no de lenguaje); idiomas no disponibles |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors (`model.safetensors` más subcarpetas `epoch_01/` a `epoch_09/`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer aplicado sobre parches temporales de la señal EEG. La entrada se remuestrea a 200 Hz y se corta en parches de 1 s (200 muestras) con un solapamiento de 20 muestras; un tokenizador de parches (`feature_encoder.*`) proyecta cada parche a un embedding y el transformer (`model.*`) genera representaciones contextuales. El preentrenamiento es de tipo MAE: el codificador ve solo los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. En este checkpoint concreto, el radio espacial de la máscara es r = 9 cm, la longitud temporal es L = 4 parches y la proporción de parches no enmascarados es `pct_unmasked = 0.45`.

El entrenamiento usa el subconjunto con licencia abierta del corpus de preentrenamiento REVE (323 grabaciones), lo que permite redistribuir los pesos. La programación es de 10 épocas en 2 × H100, con tamaño de lote de 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3080 pasos, valor final 1e-06) y decaimiento de pesos 0,01. El checkpoint publicado corresponde al final de la época 10; las épocas 1 a 9 se incluyen como subcarpetas. El modelo es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada canal tenga una posición 3D en metros. La normalización (factor 1e+06 y escalado por ventana `median_std_clip` con recorte en σ = 15) la aplica el propio wrapper, por lo que no debe estandarizarse la señal antes.

## Capacidades

- Extracción de características (*feature extraction*) de señales EEG multicanal con montaje arbitrario.
- Representaciones contextuales por parche temporal, utilizables con sondas lineales (ridge) o fine-tuning.
- Preentrenamiento autosupervisado que no requiere etiquetas para aprender representaciones.
- Adaptación a tareas de clasificación y regresión sobre EEG (12 conjuntos evaluados en OpenEEGBench).
- Robustez a distintos números de canales y posiciones, gracias al uso de coordenadas 3D.
- Checkpoints intermedios por época para estudiar la evolución del aprendizaje.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo específico de EEG.

## Casos de uso

- Clasificación de estados cognitivos: usar el codificador congelado y una sonda ridge sobre las características aplanadas para tareas como `arithmetic_zyma2019` (0,736 de exactitud balanceada), sin reentrenar el backbone.
- Detección de crisis epilépticas: integrar el extractor en un pipeline de monitorización con `chbmit` (0,857 de exactitud balanceada) y `tuev` (0,920), aprovechando que el modelo acepta montajes variables de canales.
- Análisis de sueño: clasificación de fases con `isruc-sleep` (0,662) y regresión de la edad de vigilia con `seed-vig`, útil para estudios de sueño a gran escala.
- Detección de depresión: emplear las representaciones en `mdd_mumtaz2016` (0,827) como base para cribados con EEG en investigación clínica.
- Investigación en interfaces cerebro-computador: usar `bcic2a` (0,463) y `bcic2020-3` (0,274) como línea base para comparar estrategias de preentrenamiento y ajustar la geometría de la máscara.
- Reproducibilidad y ablación: comparar este checkpoint (r = 9 cm, L = 4) con los otros 57 de la colección para aislar el efecto de la geometría de enmascaramiento en una misma receta.
- Prototipado rápido en entornos con pocos recursos: con 12,69 M de parámetros, el codificador cabe holgadamente en una GPU de consumo y permite iterar sobre pipelines de EEG sin infraestructura pesada.

## Benchmarks y rendimiento

Resultados downstream en OpenEEGBench con el codificador congelado y sonda ridge sobre las características contextuales aplanadas, 12 conjuntos × 5 semillas. Exactitud balanceada para clasificación y R² para `seed-vig`.

| Conjunto | Métrica | Puntuación (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,736 ± 0,008 | 5 |
| bcic2020-3 | exactitud balanceada | 0,274 ± 0,011 | 5 |
| bcic2a | exactitud balanceada | 0,463 ± 0,019 | 5 |
| chbmit | exactitud balanceada | 0,857 ± 0,078 | 5 |
| faced | exactitud balanceada | 0,319 ± 0,003 | 5 |
| isruc-sleep | exactitud balanceada | 0,662 ± 0,005 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,827 ± 0,011 | 5 |
| physionet | exactitud balanceada | 0,571 ± 0,007 | 5 |
| seed-v | exactitud balanceada | 0,289 ± 0,001 | 5 |
| seed-vig | R² | -0,168 ± 0,009 | 5 |
| tuab | exactitud balanceada | 0,805 ± 0,004 | 5 |
| tuev | exactitud balanceada | 0,920 ± 0,031 | 5 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el codificador de 12,69 M de parámetros; el tamaño del repositorio es de 0,5 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se realizó en 2 × H100, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier RTX o equivalente con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: carga directa con PyTorch y `safetensors` a través del wrapper `ContextualEncoderBenchmarkWrapper`; integración con `open_eeg_bench.backbone.PretrainedBackbone` para evaluación y fine-tuning. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a este modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L4 (este) | 12,69 M | parches de 1 s a 200 Hz, montaje arbitrario | MAE, r = 9 cm, L = 4 | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | no disponible | parches de 1 s a 200 Hz, montaje arbitrario | MAE, r = 9 cm, L = 2 (recomendado en el paper) | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_jepa_r9cm_L2 | no disponible | parches de 1 s a 200 Hz, montaje arbitrario | JEPA, r = 9 cm, L = 2 (recomendado en el paper) | CC-BY-4.0 | Hugging Face |

Los tres modelos comparten receta de entrenamiento y corpus (subconjunto abierto de REVE), por lo que la comparación aísla el efecto de la geometría de enmascaramiento y del marco (MAE frente a JEPA). No se dispone de datos de benchmarks de los dos modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de EEG: no procesa texto, imágenes ni audio, y no admite tool calling ni razonamiento multi-paso.
- Requiere que cada canal tenga una posición 3D en metros; sin metadatos de montaje no puede usarse correctamente.
- Exige muestreo a 200 Hz y unidades en voltios; el wrapper aplica su propio escalado, por lo que estandarizar previamente la señal introduce errores.
- El rendimiento es muy desigual entre conjuntos: `bcic2020-3` (0,274) y `seed-v` (0,289) quedan cerca del azar, y `seed-vig` presenta R² negativo (-0,168), lo que indica que la sonda ridge no captura la variable objetivo en ese caso.
- El checkpoint publicado corresponde a la época 10 de 10; no se documenta una selección por validación, por lo que puede no ser el óptimo para todas las tareas.
- El decodificador MAE no se incluye: el repositorio contiene solo el codificador, de modo que no es posible reentrenar el objetivo de reconstrucción tal cual con estos pesos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el código es MIT. Es necesario citar el paper de acuerdo con las condiciones de la licencia.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de extrapolación indebida a montajes, poblaciones o tareas no representadas en el corpus REVE.
- Sesgos conocidos: no documentados en la información disponible; el corpus de preentrenamiento (323 grabaciones) puede no representar toda la diversidad clínica y demográfica.

## Enlaces

- Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L4
- Paper: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/v78z6b50
