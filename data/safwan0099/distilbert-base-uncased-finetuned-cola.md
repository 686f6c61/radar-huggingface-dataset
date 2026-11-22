# Safwan0099/distilbert-base-uncased-finetuned-cola

## Resumen

`Safwan0099/distilbert-base-uncased-finetuned-cola` es un modelo de clasificación de texto obtenido mediante fine-tuning del checkpoint base `distilbert-base-uncased` sobre la tarea CoLA (Corpus of Linguistic Acceptability), que consiste en determinar si una oración en inglés es gramaticalmente aceptable. Lo publica el usuario Safwan0099 en Hugging Face y se generó automáticamente con la librería `Trainer` de Transformers, por lo que la model card es un esqueleto sin documentación sustantiva.

El modelo emplea la arquitectura DistilBERT, un transformer encoder destilado de BERT-base con 66.955.010 parámetros (6 capas, representaciones de 768 dimensiones). Al ser un modelo encoder-only, no es un modelo generativo: su única salida es una clasificación binaria (aceptable / no aceptable) sobre la secuencia de entrada. La longitud de contexto efectiva está limitada por el tokenizador de DistilBERT, fijada en 512 tokens.

Su relevancia es limitada y de nicho: se trata de un artefacto de fine-tuning educativo o experimental, con cero descargas y cero likes en el momento de la consulta, sin benchmarks declarados en el `model-index` y sin información sobre el dataset exacto de entrenamiento. Resulta útil únicamente como ejemplo de pipeline de ajuste fino de DistilBERT para clasificación de secuencias o como punto de partida para tareas de aceptabilidad lingüística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite del tokenizador DistilBERT; no declarado explícitamente en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (modelo base entrenado en inglés; la model card no lo declara) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas con 768 dimensiones ocultas, 12 cabezas de atención y 66,9 M de parámetros, obtenido por destilación de conocimiento de BERT-base. Sobre esta base se ha añadido una cabeza de clasificación de secuencias para la tarea CoLA, que produce una predicción binaria de aceptabilidad gramatical.

El fine-tuning se realizó con los hiperparámetros documentados en la model card: learning rate 2e-05, batch size de 16 (entrenamiento y evaluación), 5 épocas, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. El dataset de entrenamiento aparece como "unknown dataset" en la model card; por el nombre del checkpoint y la métrica reportada (correlación de Matthews) se infiere CoLA, pero el autor no lo confirma. No se documenta el número de tokens de entrenamiento, la composición del corpus ni si hubo técnicas de alineación (RLHF/DPO), algo esperable en un modelo encoder-only de clasificación.

## Capacidades

- Clasificación binaria de secuencias: determina si una oración en inglés es gramaticalmente aceptable (tarea CoLA).
- Inferencia de aceptabilidad lingüística sobre entradas de hasta 512 tokens.
- Salida de logits y probabilidades por clase mediante `TextClassificationPipeline` de Transformers.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles de Hugging Face (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo base es monolingüe en inglés y la model card no declara idiomas.

## Casos de uso

- Filtrado de calidad en corpus de texto: aplicar el modelo a oraciones candidatas de un pipeline de recopilación de datos para descartar fragmentos gramaticalmente inválidos antes de entrenar modelos mayores, aprovechando su bajo coste computacional (66,9 M de parámetros).
- Preprocesado en sistemas de corrección gramatical: usar la probabilidad de aceptabilidad como señal auxiliar para priorizar sugerencias de corrección o para validar la salida de un corrector antes de mostrarla al usuario.
- Evaluación de generación de texto: medir la tasa de oraciones aceptables producidas por un modelo generativo como métrica complementaria a BLEU o ROUGE en experimentos de investigación.
- Detección de texto corrupto o ruido en ingesta de datos: marcar registros de bases de datos o logs con sintaxis rota antes de procesos de indexación o análisis.
- Docencia y experimentación con fine-tuning: servir como ejemplo reproducible de ajuste fino de DistilBERT con `Trainer` para cursos o tutoriales de NLP, dado que la model card incluye hiperparámetros y curvas de entrenamiento.
- Baseline en investigación sobre aceptabilidad lingüística: punto de comparación barato frente a modelos mayores (BERT, RoBERTa) en estudios sobre juicios de gramaticalidad.
- Clasificación por lotes en CPU: al ser un modelo pequeño, puede ejecutarse en entornos sin GPU para etiquetar grandes volúmenes de oraciones en tareas de anotación automática.

## Benchmarks y rendimiento

El `model-index` de la model card no contiene resultados (`results: []`). Los únicos datos disponibles son las métricas de validación reportadas por el autor durante el entrenamiento:

| Época | Paso | Validation loss | Matthews correlation |
|---|---|---|---|
| 1.0 | 535 | 0.4660 | 0.4594 |
| 2.0 | 1070 | 0.4756 | 0.5280 |
| 3.0 | 1605 | 0.6261 | 0.5285 |
| 4.0 | 2140 | 0.7745 | 0.5361 |
| 5.0 | 2675 | 0.8269 | 0.5286 |

El mejor valor de correlación de Matthews es 0.5361 en la época 4, con una loss de validación de 0.7745. No se han publicado resultados de benchmarks estándar (MMLU, GLUE completo, etc.) en la información disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB en total.
- VRAM estimada en fp16: alrededor de 135 MB para los pesos, con overhead adicional mínimo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda enormemente sobredimensionada para este modelo.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con `TextClassificationPipeline`, Text Embeddings Inference (tag oficial), endpoints compatibles de Hugging Face, y exportación a ONNX para optimización.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safwan0099/distilbert-base-uncased-finetuned-cola | 66,9 M | 512 tokens | Clasificación binaria CoLA | apache-2.0 | Hugging Face (0 descargas) |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face (ampliamente usado) |
| textattack/bert-base-uncased-CoLA | ~110 M | 512 tokens | Clasificación CoLA | apache-2.0 | Hugging Face (referencia habitual en CoLA) |
| google/bert-base-uncased | ~110 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face |

La comparación con `textattack/bert-base-uncased-CoLA` es la más directa por tarea, pero no se dispone de métricas de ese checkpoint en la información proporcionada para establecer una comparación cuantitativa. Frente a `distilbert-base-uncased`, este modelo añade la cabeza de clasificación y el ajuste específico, a costa de perder las capacidades de enmascarado del modelo base.

## Limitaciones y advertencias

- Model card generada automáticamente y sin completar: no documenta dataset de entrenamiento, composición de datos, idiomas ni usos previstos.
- El `model-index` está vacío: no hay benchmarks oficiales que respalden el rendimiento más allá de las métricas de validación del autor.
- Riesgo de sobreajuste: la loss de validación aumenta a partir de la época 2 (0.4660 → 0.8269) mientras la de entrenamiento cae (0.5255 → 0.1286), lo que indica sobreajuste claro en las épocas 3-5.
- Correlación de Matthews de 0.5361: moderada; no es un modelo de referencia para producción en tareas de gramaticalidad exigentes.
- Modelo monolingüe en inglés por herencia del base; no se declaran idiomas soportados y no debe asumirse multilingüismo.
- Contexto limitado a 512 tokens; oraciones o documentos más largos requieren truncamiento.
- Es un modelo encoder-only de clasificación: no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Sesgos: no documentados; el modelo base DistilBERT puede heredar sesgos de su corpus de preentrenamiento (Wikipedia y BookCorpus), no evaluados aquí.
- Licencia apache-2.0 permite uso comercial, pero la falta de documentación sobre el dataset de fine-tuning impide verificar la procedencia de los datos de entrenamiento.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por la comunidad.
- El tamaño del repositorio (9,4 GB) es desproporcionado para 66,9 M de parámetros, lo que sugiere artefactos de entrenamiento adicionales (checkpoints intermedios, optimizer states) que no aportan valor al usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Safwan0099/distilbert-base-uncased-finetuned-cola
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Dataset CoLA (Corpus of Linguistic Acceptability): https://nyu-mll.github.io/CoLA/
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
