# ronke21/HEntailment-multilingual-e5-large

## Resumen

HEntailment-multilingual-e5-large es un modelo de clasificación de texto para inferencia de lenguaje natural (NLI) en hebreo, desarrollado por Ron Keinan (usuario ronke21) en el marco de un trabajo académico con Reut Tsarfaty, publicado en EACL 2027. Se trata de un fine-tuning completo de intfloat/multilingual-e5-large, un encoder XLM-RoBERTa de 559,9 millones de parámetros, al que se le ha añadido una cabeza de clasificación de tres clases: implicación (entailment), contradicción y neutral.

El modelo resuelve la tarea de determinar la relación lógica entre un par (premisa, hipótesis) en hebreo. Se entrenó sobre el dataset HEntailment, que agrupa cinco fuentes y 15.000 filas balanceadas por clase. Es relevante porque el hebreo es un idioma con recursos limitados en NLI y porque el modelo demuestra que un encoder multilingüe grande puede alcanzar un rendimiento muy alto (macro-F1 de 0,969 en HeQ) en dominios nativos, aunque sufre una caída notable en conjuntos traducidos.

El checkpoint tiene 559.893.507 parámetros, un repositorio de 2,3 GB en formato safetensors y licencia Apache 2.0, heredada del modelo base. Su pipeline es text-classification y está etiquetado exclusivamente para hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) con cabeza de clasificación de 3 clases |
| Parametros totales | 559.893.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base multilingual-e5-large admite 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he); el modelo base es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de intfloat/multilingual-e5-large, un encoder basado en XLM-RoBERTa de 24 capas y 1.024 dimensiones ocultas, y le añade una cabeza de clasificación lineal sobre la representación del token [CLS] para producir tres logits (0 = entailment, 1 = contradiction, 2 = neutral). El fine-tuning es completo (no se congelan capas), con una tasa de aprendizaje de 2e-5, tamaño de lote 32, hasta 20 épocas y selección del mejor checkpoint según macro-F1 en el conjunto de desarrollo. La semilla empleada es la 42.

Los datos de entrenamiento provienen de HEntailment, un conjunto que agrupa las cinco fuentes del benchmark (HeQ, QASem, HeSum, HebSummaries y Hebrew-Paraphrase) con 15.000 filas balanceadas por clase. La entrada es un par de frases (premisa, hipótesis) procesado como sentence pair. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumentación de datos; tampoco se especifica el número total de tokens de entrenamiento.

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) en hebreo con tres etiquetas: implicación, contradicción y neutral.
- Procesamiento de pares de frases (premisa, hipótesis) como entrada de tipo sentence pair.
- Detección de relaciones semánticas entre oraciones, útil para verificación de hechos y consistencia textual.
- Rendimiento alto en dominios nativos hebreos: macro-F1 de 0,969 en HeQ, 0,905 en QASem, 0,929 en Hebrew-Paraphrase.
- Capacidad multilingüe heredada del modelo base, aunque el fine-tuning está orientado exclusivamente a hebreo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Verificación de hechos en hebreo: dado un par (afirmación, evidencia), el modelo clasifica si la evidencia implica, contradice o es neutral respecto a la afirmación, lo que permite construir pipelines de fact-checking automatizado sobre corpus hebreos.
- Detección de contradicciones en resúmenes automáticos: comparar cada frase del resumen con el documento fuente para señalar inconsistencias, aprovechando el macro-F1 de 0,792 en HebSummaries.
- Filtrado de pares de preguntas y respuestas: en sistemas de QA en hebreo, validar que una respuesta candidata es implicada por la pregunta o el contexto recuperado, usando el rendimiento de 0,905 en QASem.
- Deduplicación semántica y detección de paráfrasis: clasificar pares de oraciones como implicación para identificar duplicados o reformulaciones, con base en el 0,929 en Hebrew-Paraphrase.
- Evaluación de consistencia en generación de texto: comprobar si las frases generadas por un LLM en hebreo se contradicen entre sí o con el contexto de entrada, integrando el modelo como verificador en un pipeline de control de calidad.
- Anotación asistida de corpus NLI: pre-etiquetar pares de oraciones en hebreo para acelerar la creación de datasets de entrenamiento, con revisión humana posterior en los casos de baja confianza.
- Búsqueda semántica con reordenación: usar la señal de implicación para reordenar resultados de recuperación en hebreo, priorizando documentos que implican la consulta.

## Benchmarks y rendimiento

Resultados de macro-F1 en el conjunto de test, comparando el checkpoint de la semilla 42 con la media ± desviación estándar sobre las semillas 42/43/44 reportada en el paper:

| Conjunto de test | Este modelo (semilla 42) | Paper: media ± SD (42/43/44) |
|---|---:|---:|
| HeQ | 0,969 | 0,974 ± 0,002 |
| QASem | 0,905 | 0,901 ± 0,008 |
| HeSum | 0,823 | 0,843 ± 0,002 |
| HebSummaries | 0,792 | 0,803 ± 0,005 |
| Hebrew-Paraphrase | 0,929 | 0,934 ± 0,002 |
| HebNLI (traducido) | 0,388 | 0,437 ± 0,022 |
| LCHAIM (traducido) | 0,360 | 0,330 ± 0,009 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos, con un total práctico de 2 a 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo es sobradamente pequeño para hardware de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), vLLM no aplica de forma nativa a clasificación, TGI, ONNX Runtime y torch.compile. Para CPU, es viable con cuantización dinámica.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un encoder de 559 M de parámetros, se espera un throughput alto en lote sobre GPU moderna, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ronke21/HEntailment-multilingual-e5-large | 559,9 M | no disponible (base: 512) | NLI hebreo (3 clases) | apache-2.0 | Hugging Face |
| intfloat/multilingual-e5-large (base) | 559,9 M | 512 | Embeddings multilingües | MIT | Hugging Face |
| Modelos NLI hebreos del paper HEntailment | no disponible | no disponible | NLI hebreo | no disponible | no disponible |

No se dispone de información sobre otros modelos NLI específicos para hebreo con los que comparar parámetros, contexto y rendimiento de forma directa. El modelo base multilingual-e5-large no es un clasificador NLI, por lo que la comparación es estructural (mismo encoder) pero no funcional.

## Limitaciones y advertencias

- Rendimiento muy bajo en conjuntos traducidos: macro-F1 de 0,388 en HebNLI y 0,360 en LCHAIM, lo que indica poca robustez ante texto traducido automáticamente al hebreo.
- El modelo está entrenado exclusivamente para hebreo; su uso en otros idiomas, aunque el encoder base sea multilingüe, no está validado y probablemente degrade mucho.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de falsos positivos y negativos en la clasificación de relaciones lógicas.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre cinco fuentes concretas, puede heredar sesgos de dominio de esas fuentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se indica que la licencia del modelo base también aplica; conviene verificar la licencia de intfloat/multilingual-e5-large (MIT) antes de producción.
- El checkpoint corresponde a una única semilla (42); la variabilidad entre semillas reportada en el paper (hasta ±0,022 en HebNLI) sugiere que el rendimiento puede fluctuar según el entrenamiento.
- No se documentan limitaciones de contexto específicas más allá de las del modelo base (512 tokens); pares de frases más largas requerirán truncamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/HEntailment-multilingual-e5-large
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Dataset HEntailment: https://huggingface.co/datasets/ronke21/HEntailment
- Paper citado: Keinan, R. y Tsarfaty, R. (2027). "Lost in Translation, Found in Other Benchmarks: Cross-Task Transfer for Natural Language Inference". EACL 2027.
