# ajrayman/psychopathy_continuous

## Resumen

`ajrayman/psychopathy_continuous` es un modelo de clasificación de texto entrenado para predecir un valor continuo de psicopatía a partir de un texto de entrada. Se trata de un ajuste fino (fine-tuning) de `roberta-base`, el conocido modelo transformer encoder de Facebook AI, sobre un conjunto de datos no especificado en la model card. El modelo fue publicado en agosto de 2024 por el usuario ajrayman y está pensado para tareas de análisis de rasgos psicológicos a partir de lenguaje natural.

El modelo resuelve un problema de regresión: en lugar de etiquetas binarias (psicópata / no psicópata), produce una puntuación continua que intenta capturar la intensidad del rasgo. Esto lo diferencia de otros modelos del mismo autor, como `psychopathy_binary`, que realiza clasificación binaria. La arquitectura base es un encoder transformer de 125 millones de parámetros, con una ventana de contexto típica de RoBERTa (512 tokens). Su relevancia radica en su aplicación en investigación psicológica y análisis de texto, aunque la falta de información sobre los datos de entrenamiento y la ausencia de benchmarks externos limitan su uso en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa) con cabeza de regresión |
| Parametros totales | 124.646.401 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredada de roberta-base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder de 12 capas, 12 cabezas de atención y 125 millones de parámetros. Sobre esta base se añade una cabeza de regresión lineal que produce una salida continua. El entrenamiento se realizó con un objetivo de regresión, minimizando el error cuadrático medio (MSE) entre la puntuación predicha y la etiqueta objetivo.

Los hiperparámetros de entrenamiento documentados son: learning rate de 2e-05, tamaño de lote de 32, 8 épocas, optimizador Adam con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con warmup del 6% de los pasos. El entrenamiento se ejecutó durante 1.165 pasos (233 por época). No se especifica la composición del dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El proceso de ajuste fino es estándar para modelos de clasificación de texto con Transformers.

## Capacidades

- Predicción de una puntuación continua de psicopatía a partir de un texto de entrada.
- Regresión sobre rasgos psicológicos, a diferencia de un clasificador binario.
- Procesamiento de textos de hasta 512 tokens gracias a la arquitectura RoBERTa.
- Capacidad multilingüe limitada: el modelo base roberta-base está entrenado principalmente en inglés, aunque no se ha documentado la cobertura idiomática específica del ajuste.
- No se ha reportado soporte para tool calling, agentes, visión, audio ni modos de razonamiento explícitos.
- La salida es un valor numérico, no una etiqueta categórica, lo que permite análisis de intensidad.

## Casos de uso

- Investigación en psicología computacional: el modelo puede utilizarse para estimar la presencia de rasgos de psicopatía en corpus de texto (p. ej., entrevistas, narrativas personales) y correlacionar esas puntuaciones con otras variables de estudio.
- Análisis de contenido en redes sociales: se puede aplicar a publicaciones de foros o redes para estudiar la prevalencia de discursos asociados a rasgos psicopáticos, siempre con fines académicos y bajo revisión ética.
- Detección temprana en entornos clínicos (con cautela): aunque no es un instrumento diagnóstico validado, podría servir como herramienta de cribado complementaria en investigaciones sobre salud mental, combinada con evaluaciones clínicas profesionales.
- Desarrollo de sistemas de moderación de contenido: puntuaciones continuas pueden ayudar a priorizar la revisión humana de mensajes que presenten indicios de manipulación o falta de empatía.
- Estudios lingüísticos sobre estilo de escritura: el modelo puede identificar patrones léxicos y sintácticos asociados a rasgos de personalidad, aportando datos a la lingüística forense.
- Evaluación de chatbots y asistentes conversacionales: se podría usar para medir la "toxicidad" o la presencia de rasgos manipuladores en las respuestas generadas por IA, comparando distintos sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente métricas de evaluación sobre su propio conjunto de validación, declaradas por el autor:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0.0642 |
| RMSE | 0.2534 |
| MAE | 0.1962 |
| Correlacion (Corr) | 0.4402 |

Estos valores indican un error cuadrático medio relativamente bajo en la escala de la variable objetivo, pero sin conocer el rango de las etiquetas no se puede interpretar su magnitud. La correlación de 0.44 sugiere una capacidad predictiva moderada. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 124,6 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 500 MB de memoria. Con cuantización a int8, el uso de VRAM se reduce a unos 250 MB.
- Se puede ejecutar en GPUs de consumo como una RTX 3060 (12 GB) o incluso en CPU con suficiente RAM (se recomienda al menos 8 GB de RAM para inferencia).
- Para despliegue en producción, es compatible con bibliotecas estándar: Transformers de Hugging Face, vLLM (aunque al ser un encoder, puede usarse con su API de clasificación), y también con ONNX Runtime para optimización en CPU.
- No se requiere GPU de datacenter; el modelo es ligero y apto para entornos con recursos limitados.
- Latencia estimada: en una GPU moderna, una inferencia sobre un texto de 512 tokens debería completarse en menos de 50 ms. En CPU puede tardar entre 200 y 500 ms.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de regresión de psicopatía en la información proporcionada. El propio autor ha publicado otros modelos relacionados:

| Modelo | Arquitectura | Tarea | Metricas reportadas |
|---|---|---|---|
| `ajrayman/psychopathy_continuous` | roberta-base (125M) | Regresión continua | RMSE 0.2534, Corr 0.4402 |
| `ajrayman/psychopathy_binary` | roberta-large (355M) | Clasificación binaria | Accuracy 0.7284, F1 0.6549 |
| `ajrayman/machiavellianism_continuous` | No disponible | Regresión continua | No disponible |

La comparativa no es exhaustiva y se basa únicamente en los modelos del mismo autor. No hay información sobre otros modelos de la misma categoría (p. ej., basados en BERT o en otros encoders) con los que contrastar.

## Limitaciones y advertencias

- Los datos de entrenamiento no están documentados: no se sabe qué corpus se utilizó, ni el idioma, ni el método de anotación de las etiquetas. Esto limita la reproducibilidad y la confianza en las predicciones.
- La correlación de 0.44 en validación indica una capacidad predictiva limitada; el modelo no debe usarse para diagnóstico clínico ni para tomar decisiones sobre personas reales.
- Riesgo de sesgo: al desconocer la composición del dataset, puede haber sesgos demográficos, culturales o lingüísticos que afecten a las puntuaciones.
- Alucinación y sobreinterpretación: como cualquier modelo de lenguaje, puede producir puntuaciones inconsistentes ante entradas ambiguas o fuera de distribución.
- El modelo está entrenado para regresión, no para explicar sus decisiones; no ofrece interpretabilidad intrínseca.
- La licencia MIT permite uso comercial, pero la falta de documentación sobre los datos de entrenamiento puede plantear problemas legales o éticos si se utiliza en aplicaciones de alto riesgo.
- No se recomienda su uso en entornos de producción sin una validación externa rigurosa y sin un análisis de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/psychopathy_continuous
- Modelo relacionado `psychopathy_binary`: https://huggingface.co/ajrayman/psychopathy_binary
- Modelo relacionado `machiavellianism_continuous`: https://huggingface.co/ajrayman/machiavellianism_continuous
- Documentación de `roberta-base` (modelo base): https://huggingface.co/FacebookAI/roberta-base
