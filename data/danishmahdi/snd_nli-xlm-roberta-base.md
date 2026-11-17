# DanishMahdi/SND_NLI-XLM-RoBERTa-base

## Resumen

SND_NLI-XLM-RoBERTa-base es un modelo de clasificación de texto especializado en inferencia de lenguaje natural (NLI) para sindhi en escritura perso-árabe. Lo desarrolla DanishMahdi mediante ajuste fino supervisado de FacebookAI/xlm-roberta-base sobre el conjunto de datos DanishMahdi/SND_NLI, con una tarea de clasificación de tres etiquetas: implicación (entailment), neutral y contradicción. El modelo resuelve la falta de recursos NLI de calidad para una lengua de bajos recursos como el sindhi, y lo hace sobre una arquitectura transformer encoder estándar de 278 millones de parámetros.

La relevancia del modelo es doble. Por un lado, ofrece un punto de referencia reproducible para NLI en sindhi, con métricas declaradas sobre un test de 10 000 ejemplos y una comparación explícita frente a mDeBERTa-v3-base e IndicBERT-v2. Por otro lado, su licencia Apache 2.0 y su formato safetensors estándar de transformers permiten integrarlo sin fricción en pipelines de Hugging Face, text-embeddings-inference y endpoints compatibles.

No es un modelo generativo ni un LLM: es un encoder discriminativo de 278 M de parámetros que recibe un par premisa-hipótesis y devuelve una de tres clases. Su ventana de entrenamiento es de 256 tokens, suficiente para pares NLI típicos, pero no está pensado para documentos largos ni para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion via herramientas externas) |
| Idiomas soportados | sindhi (sd, perso-arabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-base, un transformer encoder de tipo RoBERTa multilingüe preentrenado con enmascaramiento de tokens sobre corpus multilingües. Sobre esa base se añade una cabeza de clasificación de secuencias con tres salidas (entailment, neutral, contradiction). El ajuste fino se realizó sobre el dataset DanishMahdi/SND_NLI con los siguientes hiperparámetros: learning rate 2e-5, batch efectivo de 32 (16 × acumulación 2), longitud máxima de 256 tokens, hasta 5 épocas y semilla 42, sobre una única RTX 3090.

El autor reporta también un experimento de sonda congelada (frozen probe) sobre la misma base, con macro-F1 de 0.6765 frente a 0.8573 del ajuste fino completo, lo que confirma que el ajuste fino aporta la mayor parte de la capacidad discriminativa. Se documenta una evaluación multi-semilla (42/43/44) con macro-F1 de 0.8601 ± 0.0024, y una prueba de McNemar frente a IndicBERT-v2 con p ≈ 0.30, es decir, sin diferencia estadísticamente significativa entre ambos. No se documentan innovaciones arquitectónicas adicionales ni técnicas de decodificación especulativa; es un ajuste fino convencional de clasificación.

## Capacidades

- Clasificación de pares premisa-hipótesis en sindhi en tres clases: entailment, neutral y contradiction.
- Inferencia de lenguaje natural (NLI) como tarea principal, con salida de logits por clase.
- Estimación de confianza calibrada: el autor reporta ECE de 0.0569 y Brier de 0.1888 sobre el test.
- Soporte de tokenización multilingüe heredada de XLM-RoBERTa (el modelo está ajustado solo para sindhi).
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes, generación de texto, visión ni audio.
- No dispone de modo thinking ni de razonamiento multi-paso.

## Casos de uso

- Verificación de hechos en sindhi: dado un par (premisa, hipótesis) extraído de una noticia o de una base de conocimiento, el modelo clasifica si la hipótesis se sigue de la premisa, lo que permite filtrar afirmaciones no respaldadas en pipelines de fact-checking.
- Detección de contradicciones en corpus sindhi: en la construcción de bases de datos o en la consolidación de fuentes, el modelo marca pares contradictorios para revisión humana, con una tasa de error reportada del 14,09 % sobre el test.
- Evaluación de resúmenes y traducciones: se puede usar la clase entailment para medir si un resumen o una traducción al sindhi está respaldada por el texto fuente, aprovechando la calibración reportada (ECE 0.0569).
- Filtrado de datos para entrenamiento de LLM en sindhi: el modelo actúa como clasificador de calidad y consistencia en pares de frases, descartando ejemplos contradictorios antes de incluirlos en corpus de preentrenamiento o ajuste.
- Búsqueda semántica y recuperación aumentada: combinado con un recuperador, el modelo reordena candidatos verificando la implicación entre la consulta y el pasaje recuperado, útil en asistentes de dominio sindhi.
- Anotación asistida en investigación lingüística: preetiqueta pares NLI en sindhi para acelerar la creación de nuevos corpus, con revisión humana de los casos de baja confianza.
- Moderación de contenido y coherencia en foros: detección de respuestas que contradicen la premisa de un hilo, con umbral ajustable a partir de los logits.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de DanishMahdi/SND_NLI (10 000 ejemplos, semilla 42). No verificados de forma independiente.

| Metrica | Fine-tune | Frozen probe |
|---|---:|---:|
| Accuracy | 0.8591 | 0.6777 |
| Macro-F1 | 0.8573 | 0.6765 |
| Weighted-F1 | 0.8573 | 0.6773 |
| MCC | 0.7930 | 0.5164 |
| F1 entailment | 0.9085 | 0.6627 |
| F1 neutral | 0.8178 | 0.7273 |
| F1 contradiction | 0.8457 | 0.6394 |
| ECE | 0.0569 | no disponible |
| Brier | 0.1888 | no disponible |
| Error rate | 14.09 % | no disponible |

Comparativa declarada por el autor (fine-tune):

| Modelo | Accuracy | Macro-F1 | MCC |
|---|---:|---:|---:|
| mDeBERTa-v3-base | 0.8693 | 0.8686 | 0.8044 |
| IndicBERT-v2 | 0.8625 | 0.8620 | 0.7939 |
| XLM-RoBERTa-base (este) | 0.8591 | 0.8573 | 0.7930 |

Multi-semilla (42/43/44): macro-F1 0.8601 ± 0.0024. McNemar frente a IndicBERT-v2: p ≈ 0.30 (no significativo).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos más activaciones; con batch pequeño cabe holgadamente en 2-4 GB.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB de pesos, más overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3090 (usada en el entrenamiento), RTX 4090, A100 y H100 son sobredimensionadas para inferencia.
- Cabe en GPU de consumo: sí, en GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060 y superiores.
- Despliegue: transformers (AutoModelForSequenceClassification), text-embeddings-inference, endpoints de Hugging Face compatibles. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI, aunque al ser un encoder estándar de transformers es compatible con TGI y con ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (SND_NLI test) | Macro-F1 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| SND_NLI-XLM-RoBERTa-base (este) | 278 M | 256 | 0.8591 | 0.8573 | Apache 2.0 | Hugging Face |
| SND_NLI (mDeBERTa-v3-base) | no disponible | no disponible | 0.8693 | 0.8686 | no disponible | Hugging Face |
| IndicBERT-v2 (fine-tune NLI sindhi) | no disponible | no disponible | 0.8625 | 0.8620 | no disponible | Hugging Face |

El autor identifica mDeBERTa-v3-base como el mejor modelo global del benchmark SND_NLI, con una ventaja de aproximadamente un punto de accuracy y macro-F1 sobre este XLM-RoBERTa. La diferencia frente a IndicBERT-v2 no es estadísticamente significativa según la prueba de McNemar reportada (p ≈ 0.30). Los datos de parámetros, contexto y licencia de los dos modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en sindhi (perso-árabe); no está ajustado para otros idiomas ni para texto en escritura latina.
- Ventana de 256 tokens: los pares premisa-hipótesis que superen esa longitud se truncan, lo que puede degradar la clasificación.
- Tasa de error del 14,09 % en el test: no es adecuado para decisiones automatizadas de alto riesgo sin revisión humana.
- Las métricas están declaradas por el autor y no han sido verificadas de forma independiente (campo verified: false en el model-index).
- Riesgo de sesgo heredado del preentrenamiento multilingüe de XLM-RoBERTa y del corpus SND_NLI, cuya composición y dominio no se detallan en la información disponible.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de falsos positivos y falsos negativos en las tres clases.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset SND_NLI y del modelo base antes de un despliegue en producción.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- No dispone de soporte documentado para cuantización GGUF ni para despliegue en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanishMahdi/SND_NLI-XLM-RoBERTa-base
- Dataset SND_NLI: https://huggingface.co/datasets/DanishMahdi/SND_NLI
- Modelo de referencia del benchmark (mDeBERTa-v3-base): https://huggingface.co/DanishMahdi/SND_NLI
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
