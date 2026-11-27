# ronke21/HEntailment-alephbert-base

## Resumen

HEntailment-alephbert-base es un modelo de clasificación de texto para inferencia de lenguaje natural (NLI) en hebreo, desarrollado por Ron Keinan (usuario `ronke21`) y publicado en Hugging Face. Se trata de un fine-tuning completo de AlephBERT-base, el modelo BERT base preentrenado en hebreo por el laboratorio ONLP de la Universidad de Tel Aviv, adaptado para resolver la tarea de NLI de tres clases: implicación (entailment), contradicción (contradiction) y neutralidad (neutral).

El modelo se entrena sobre el corpus HEntailment, un conjunto de 15.000 pares equilibrados entre clases que agrega cinco fuentes distintas de datos en hebreo. El checkpoint publicado corresponde a la semilla 42 de un estudio más amplio presentado en el artículo "Lost in Translation, Found in Other Benchmarks: Cross-Task Transfer for Natural Language Inference" (Keinan y Tsarfaty, EACL 2027), que analiza la transferencia cruzada entre tareas de NLI en hebreo.

Su relevancia radica en que cubre una laguna importante: la escasez de modelos NLI específicos para hebreo con evaluación rigurosa en múltiples dominios. Con 125,9 millones de parámetros y una licencia Apache 2.0, es un modelo ligero, desplegable en hardware modesto y utilizable como componente en pipelines de verificación factual, filtrado semántico o detección de contradicciones en textos hebreos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), con cabeza de clasificación de 3 clases |
| Parametros totales | 125.978.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de AlephBERT-base; típicamente 512 tokens, no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 (se aplica también la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `onlplab/alephbert-base`, un BERT base preentrenado específicamente en hebreo, y se somete a un fine-tuning completo con una cabeza de clasificación para tres etiquetas (0 = entailment, 1 = contradiction, 2 = neutral). La entrada es un par de oraciones (premisa, hipótesis) codificado como sentence pair.

El entrenamiento utiliza el dataset `ronke21/HEntailment` con las cinco fuentes agrupadas y equilibradas entre clases (15.000 filas en total). Los hiperparámetros reportados son: learning rate 2e-5, batch size 32, hasta 20 épocas, selección del mejor checkpoint por macro-F1 en el conjunto de desarrollo y semilla 42. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; es un fine-tuning supervisado estándar de clasificación.

## Capacidades

- Clasificación de pares de oraciones en hebreo en tres categorías: implicación, contradicción y neutralidad.
- Detección de contradicciones entre afirmaciones, útil para verificación factual.
- Evaluación de relación semántica entre textos (paráfrasis, resumen frente a fuente, pregunta frente a respuesta).
- Procesamiento de texto exclusivamente en hebreo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al hebreo (el modelo base AlephBERT está entrenado en hebreo).

## Casos de uso

- Verificación factual en hebreo: dado un par (afirmación, evidencia recuperada), el modelo clasifica si la evidencia implica, contradice o es neutral respecto a la afirmación, integrándose en pipelines RAG para descartar respuestas no respaldadas.
- Filtrado de alucinaciones en asistentes conversacionales en hebreo: comparar la respuesta generada con el contexto de origen y marcar como contradictorias aquellas que no se sostienen, antes de mostrarlas al usuario.
- Evaluación de resúmenes automáticos: usar la fuente original como premisa y cada frase del resumen como hipótesis para detectar frases no soportadas o contradictorias (consistencia factual).
- Deduplicación semántica y detección de paráfrasis: clasificar pares de titulares o frases como implicación para agrupar noticias o entradas duplicadas en hebreo.
- Moderación de contenido y control de calidad de traducciones: comprobar si una traducción al hebreo mantiene la relación semántica con el original, marcando pares contradictorios como posibles errores.
- Enrutamiento de consultas en sistemas de atención al cliente: clasificar si la pregunta del usuario está cubierta por una respuesta de la base de conocimiento (entailment) o la contradice, derivando a un humano cuando corresponde.
- Anotación asistida y curación de datasets NLI en hebreo: pre-etiquetar pares para revisión humana, aprovechando su rendimiento alto en dominios como HeQ (macro-F1 0,911).

## Benchmarks y rendimiento

Resultados de macro-F1 en test reportados en la model card. La columna "este modelo" corresponde al checkpoint con semilla 42; la columna "paper" es la media ± desviación estándar sobre las semillas 42/43/44 de la misma configuración.

| Conjunto de test | Este modelo (semilla 42) | Paper (media ± SD) |
|---|---:|---:|
| HeQ | 0,911 | 0,912 ± 0,006 |
| QASem | 0,834 | 0,835 ± 0,022 |
| HeSum | 0,756 | 0,777 ± 0,005 |
| HebSummaries | 0,753 | 0,767 ± 0,002 |
| Hebrew-Paraphrase | 0,859 | 0,868 ± 0,005 |
| HebNLI (traducido) | 0,341 | 0,356 ± 0,006 |
| LCHAIM (traducido) | 0,302 | 0,328 ± 0,015 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos NLI en hebreo (MMLU, HumanEval, GSM8K u otros no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB (125,9 M de parámetros × 4 bytes); en fp16 alrededor de 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para cargas moderadas. Cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) es más que suficiente.
- Despliegue: compatible con Hugging Face Transformers (`AutoModelForSequenceClassification`), y desplegable con Text Generation Inference no aplica (es encoder); opciones habituales son `transformers` con `pipeline("text-classification")`, ONNX Runtime, TorchScript o servicios de inferencia para encoders (p. ej. TEI de Hugging Face).
- Latencia y throughput: no disponibles en la información proporcionada. Por su tamaño, se espera un throughput alto en GPU y adecuado en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos NLI alternativos en hebreo para una comparación cuantitativa. Se ofrece una comparación estructural con alternativas plausibles de la misma categoría.

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ronke21/HEntailment-alephbert-base | 125,9 M | no disponible | hebreo | Apache 2.0 | Hugging Face |
| onlplab/alephbert-base | ~110 M (BERT base) | no disponible | hebreo | no disponible en esta ficha | Hugging Face |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | multilingüe (incluye hebreo) | Apache 2.0 | Hugging Face |

La comparación de rendimiento frente a estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en conjuntos traducidos: macro-F1 de 0,341 en HebNLI y 0,302 en LCHAIM, lo que indica poca robustez ante datos traducidos automáticamente o dominios distintos a los de entrenamiento.
- Caída notable en tareas de resumen (HeSum 0,756; HebSummaries 0,753) frente a dominios como HeQ (0,911).
- Modelo exclusivamente en hebreo: no debe esperarse un comportamiento correcto con entradas en otros idiomas.
- Riesgo de sesgos heredados del corpus de preentrenamiento de AlephBERT y de las cinco fuentes de HEntailment; no se documentan análisis de sesgo en la información disponible.
- Es un clasificador, no un generador: no produce texto ni razona; cualquier uso generativo requiere combinarlo con otro modelo.
- Licencia Apache 2.0, pero la model card indica que también se aplica la licencia del modelo base; conviene verificar los términos de `onlplab/alephbert-base` antes de uso comercial.
- Sin métricas de calibración ni umbrales recomendados publicados; en producción conviene calibrar las probabilidades de salida.
- El checkpoint publicado corresponde a una única semilla (42); la variabilidad entre semillas observada en el paper (hasta ±0,022 en QASem) debe tenerse en cuenta al fijar expectativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/HEntailment-alephbert-base
- Modelo base AlephBERT: https://huggingface.co/onlplab/alephbert-base
- Dataset HEntailment: https://huggingface.co/datasets/ronke21/HEntailment
- Artículo de referencia: Keinan, R. y Tsarfaty, R., "Lost in Translation, Found in Other Benchmarks: Cross-Task Transfer for Natural Language Inference", EACL 2027 (sin URL disponible en la información proporcionada).
