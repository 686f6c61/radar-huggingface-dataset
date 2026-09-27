# PierreGtch/eeg-fm-masking_jepa_r12cm_L16

## Resumen

El modelo eeg-fm-masking_jepa_r12cm_L16 es un encoder de EEG preentrenado mediante aprendizaje autosupervisado, desarrollado por PierreGtch como parte del estudio "What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA". Se trata de uno de los 58 encoders entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos: MAE y JEPA). Este modelo concreto emplea el marco JEPA (joint-embedding predictive architecture) con un radio espacial de 12 cm y una longitud temporal de 16 parches. Con 12,69 millones de parámetros, está diseñado para extraer representaciones de señales EEG de cualquier montaje, siempre que los canales tengan posiciones 3D en metros. Es relevante porque aborda la falta de modelos fundacionales específicos para EEG y permite evaluar sistemáticamente cómo afecta la geometría del enmascaramiento al rendimiento downstream. El paper recomienda la configuración r=9cm, L=2, disponible en otros checkpoints de la misma colección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches, preentrenado con JEPA |
| Parámetros totales | 12.692.096 (12,69 M) |
| Longitud de contexto | no disponible (parches de 1 s a 200 Hz, solapamiento de 20 muestras; número máximo de parches no especificado) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica (modelo de EEG) |
| Licencia | CC-BY-4.0 (pesos); MIT (código) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica factor 1e+06 y escalado median_std_clip con clip σ=15) |
| Canales | cualquier número y conjunto, siempre que cada canal tenga posición 3D en metros |

## Arquitectura y entrenamiento

El modelo es un encoder transformer con tokenizador de parches, preentrenado mediante JEPA (joint-embedding predictive architecture). En JEPA, un predictor mapea el contexto del encoder a los embeddings que un profesor EMA produce para los parches enmascarados, sin regularizador de varianza/covarianza. Este checkpoint concreto forma parte de un estudio controlado de 58 encoders con receta idéntica, donde solo cambia la geometría de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos. Para este modelo, el radio espacial es de 12 cm, la longitud temporal de 16 parches y el parámetro pct_unmasked es 0,45. El checkpoint corresponde al epoch 10 de 10 (v9). Los pesos publicados incluyen únicamente el encoder (tokenizador de parches feature_encoder.* + transformer model.*), no el predictor JEPA ni el profesor EMA.

El entrenamiento se realizó sobre el subconjunto con licencia abierta del corpus de preentrenamiento REVE (323 grabaciones), con 10 epochs, 2× H100, batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos, final 1e-06) y weight decay de 0,01. No se emplearon RLHF ni DPO. La innovación principal es la evaluación controlada de la geometría de enmascaramiento; el paper recomienda la configuración r=9cm, L=2, que ofrece mejores resultados que este checkpoint.

## Capacidades

- Extracción de características de señales EEG: genera representaciones contextuales a partir de ventanas de EEG de 1 s a 200 Hz, con cualquier número de canales y montaje, siempre que cada canal tenga una posición 3D en metros.
- Aprendizaje autosupervisado: preentrenado con JEPA, lo que permite su uso como encoder congelado para tareas downstream mediante una sonda ridge o fine-tuning.
- Clasificación de estados fisiológicos y patológicos: tal como se evalúa en OpenEEGBench, puede clasificar sueño, epilepsia, atención, depresión, etc., con rendimiento variable según el dataset.
- Montaje agnóstico: soporta cualquier conjunto de electrodos, lo que facilita su aplicación a distintos sistemas de adquisición.
- No soporta generación de texto, tool calling, agentes, ni capacidades multilingües, ya que no es un modelo de lenguaje.
- No incluye predictor JEPA ni profesor EMA en los pesos publicados; solo el encoder.

## Casos de uso

- Clasificación de etapas de sueño: utilizando el encoder congelado y una sonda ridge, se pueden clasificar las fases del sueño a partir de registros de EEG (isruc-sleep). El modelo alcanzó una precisión balanceada de 0,605 ± 0,003, lo que lo hace adecuado para investigación en medicina del sueño.
- Detección de crisis epilépticas: en el dataset chbmit, el modelo logró 0,887 ± 0,045 de precisión balanceada. Se puede integrar en sistemas de monitorización continua para alertar de actividad ictal.
- Interfaces cerebro-computadora (BCI): para decodificación motora o de intención, como en bcic2a (0,321 ± 0,011) y bcic2020-3 (0,293 ± 0,017). Aunque el rendimiento es moderado, el encoder puede fine-tunearse con datos específicos del usuario.
- Diagnóstico de depresión: en mdd_mumtaz2016 alcanzó 0,771 ± 0,017 de precisión balanceada, lo que sugiere su utilidad como herramienta de apoyo al diagnóstico psiquiátrico.
- Monitorización de atención y carga cognitiva: en tuab (0,769 ± 0,003) y tuev (0,921 ± 0,002) el modelo muestra buen rendimiento en la detección de anomalías y eventos, útil para neuroergonomía.
- Investigación en neurociencia cognitiva: extracción de embeddings para estudiar correlatos neuronales de tareas aritméticas (arithmetic_zyma2019, 0,668 ± 0,016) o reconocimiento facial (faced, aunque con bajo rendimiento 0,168 ± 0,005).
- Análisis de emociones y estados mentales: en seed-v (0,294 ± 0,001) y seed-vig (R² de -0,841 ± 0,012, indicando mal rendimiento en regresión de vigilancia), por lo que se recomienda precaución en estas aplicaciones.
- Preentrenamiento para dominios específicos: al ser un encoder genérico, puede servir como inicialización para modelos más grandes o para transferencia a tareas con pocos datos.

## Benchmarks y rendimiento

Resultados con encoder congelado y sonda ridge sobre las características contextuales aplanadas, 12 datasets × 5 semillas. Balanced accuracy para clasificación, R² para seed-vig.

| Dataset | Métrica | Puntuación (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0.668 ± 0.016 | 5 |
| bcic2020-3 | balanced acc. | 0.293 ± 0.017 | 5 |
| bcic2a | balanced acc. | 0.321 ± 0.011 | 5 |
| chbmit | balanced acc. | 0.887 ± 0.045 | 5 |
| faced | balanced acc. | 0.168 ± 0.005 | 5 |
| isruc-sleep | balanced acc. | 0.605 ± 0.003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0.771 ± 0.017 | 5 |
| physionet | balanced acc. | 0.362 ± 0.011 | 5 |
| seed-v | balanced acc. | 0.294 ± 0.001 | 5 |
| seed-vig | R² | -0.841 ± 0.012 | 5 |
| tuab | balanced acc. | 0.769 ± 0.003 | 5 |
| tuev | balanced acc. | 0.921 ± 0.002 | 5 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en fp32 y menos de 50 MB en fp16, dado que el encoder tiene 12,69 M de parámetros.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizó con 2× H100, pero la inferencia es muy ligera.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch con safetensors; el repositorio de GitHub proporciona un wrapper (ContextualEncoderBenchmarkWrapper) y soporte para OpenEEGBench. No hay soporte nativo en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Dentro de la misma colección, el paper recomienda la configuración r=9cm, L=2 tanto para MAE como para JEPA.

| Modelo | Framework | Radio espacial | Longitud temporal | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r12cm_L16 (este) | JEPA | 12 cm | 16 parches | 12,69 M | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible | CC-BY-4.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero el modelo se entrena con un subconjunto de REVE, que puede no representar toda la diversidad de poblaciones y condiciones.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto.
- Limitaciones de contexto: procesa parches de 1 s a 200 Hz con solapamiento de 20 muestras; no se especifica un número máximo de parches, pero el rendimiento puede degradarse con ventanas muy largas.
- Limitaciones de idioma: no aplica.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; el código es MIT.
- Caveats para producción: requiere que los canales tengan posiciones 3D en metros; la señal debe estar en voltios y no debe estandarizarse previamente (el wrapper lo hace). El checkpoint es el epoch 10 de 10 (v9). El paper recomienda la configuración r=9cm, L=2, que ofrece mejores resultados. El rendimiento es muy variable según el dataset (p. ej., faced 0,168; seed-vig R² negativo), por lo que se debe validar en la tarea concreta. Los pesos publicados solo incluyen el encoder, no el predictor JEPA ni el profesor EMA.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r12cm_L16
- Website del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Colección completa de 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Run de entrenamiento en W&B: https://wandb.ai/pierregtch/chan-inv-clf/runs/ximmpkge
- Modelo recomendado (MAE, r=9cm, L=2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado (JEPA, r=9cm, L=2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Paper: "What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA" (referencia en la página de GitHub)
