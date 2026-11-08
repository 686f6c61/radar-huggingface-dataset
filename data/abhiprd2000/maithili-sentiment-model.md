# abhiprd2000/maithili-sentiment-model

## Resumen

Maithili Sentiment Model es un clasificador de sentimiento de tres clases (positivo, negativo, neutro) para maithili (मैथिली), una lengua bihari hablada por unos 34 millones de personas en la región de Mithila (Bihar, India) y el Terai nepalí. Lo desarrolla Abhimanyu Prasad (usuario `abhiprd2000` en Hugging Face) mediante fine-tuning de `cardiffnlp/twitter-xlm-roberta-base-sentiment`, un XLM-RoBERTa base preentrenado sobre tuits multilingües, sobre el dataset `abhiprd2000/Maithili_Sentiment_8K`.

El modelo aborda un problema clásico de NLP de bajos recursos: la práctica ausencia de herramientas de análisis de sentimiento para maithili, pese a ser una de las 22 lenguas programadas de la Constitución india. El autor lo enmarca en un estudio de transferencia cross-lingual que compara BERT en inglés, XLM-RoBERTa zero-shot, mBERT ajustado y este modelo, y documenta una caída de 51,25 puntos porcentuales al aplicar BERT inglés directamente sobre maithili.

Es relevante ahora porque demuestra que el ajuste fino de un encoder multilingüe de 278 millones de parámetros con solo 3.561 muestras de entrenamiento recupera un rendimiento razonable (82,44% de accuracy) en una lengua de bajos recursos. Conviene leerlo con cautela: el propio autor advierte que los datos de entrenamiento y evaluación son en parte traducción automática y están balanceados por clase, por lo que las métricas no reflejan el rendimiento sobre texto natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) para clasificación de secuencias |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max sequence length usada en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mai (maithili), en (inglés), bh (bihari) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Etiquetas de salida | 3: negative (0), neutral (1), positive (2) |
| Modelo base | cardiffnlp/twitter-xlm-roberta-base-sentiment |
| Dataset de entrenamiento | abhiprd2000/Maithili_Sentiment_8K |
| Tamano del repositorio | 1.1 GB |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa base (transformer encoder de 12 capas, 278 millones de parámetros) con una cabeza de clasificación de secuencias de tres etiquetas, inicializado desde el checkpoint `cardiffnlp/twitter-xlm-roberta-base-sentiment`. El ajuste fino se realizó durante 3 épocas con batch size 16, longitud máxima de secuencia 128, optimizador AdamW por defecto y una GPU NVIDIA T4 en Google Colab, usando la librería Transformers de Hugging Face.

El conjunto de entrenamiento consta de 3.561 muestras (1.187 por clase) y el de test de 501 muestras (167 por clase), extraídas del dataset Maithili Sentiment 8K. El autor indica explícitamente que los datos son en parte traducción automática y están balanceados por clase. No se documentan fases de RLHF, DPO ni técnicas de decodificación especulativa; se trata de un ajuste fino supervisado estándar de clasificación.

## Capacidades

- Clasificación de sentimiento en maithili en tres categorías: positivo, negativo y neutro.
- Etiquetado con puntuación de confianza por clase (softmax sobre los logits).
- Transferencia cross-lingual: el modelo base está preentrenado en multitud de lenguas, y las etiquetas del modelo incluyen inglés y bihari, aunque el ajuste fino se hizo sobre maithili.
- Integración directa con el pipeline `text-classification` de Transformers y con `AutoTokenizer` / `AutoModelForSequenceClassification`.
- Entrada en escritura devanagari (ejemplos de la model card en maithili).
- No soporta generación de texto, tool calling, agentes, visión, audio ni modos de razonamiento extendido: es un encoder de clasificación, no un modelo generativo.

## Casos de uso

- Monitorización de opinión en redes sociales y prensa digital en maithili: clasificar menciones y comentarios en positivo, negativo o neutro para agregar tendencias por tema o región; el modelo está pensado para frases cortas de estilo tuits, que es el dominio del checkpoint base.
- Análisis de reseñas de productos y servicios locales: procesar opiniones de usuarios en maithili sobre comercios, restaurantes o servicios públicos y derivar métricas de satisfacción por establecimiento.
- Investigación en NLP de bajos recursos: servir de línea base reproducible para estudios de transferencia cross-lingual entre lenguas bihari (maithili, bhojpuri, magahi), tal como lo plantea el autor.
- Moderación de comunidades y foros: priorizar mensajes con sentimiento negativo para revisión humana en plataformas que operan en la región de Mithila.
- Enriquecimiento de corpus lingüísticos: etiquetar automáticamente grandes volúmenes de texto en maithili con polaridad para construir datasets anotados posteriores, siempre con revisión humana dada la procedencia parcialmente sintética de los datos de entrenamiento.
- Análisis de encuestas y formularios abiertos: clasificar respuestas de texto libre en maithili recogidas en consultas ciudadanas o estudios de campo, con la limitación de 128 tokens por muestra.
- Señal auxiliar en pipelines multilingües: usar el modelo como clasificador específico de maithili dentro de un sistema mayor que enrute textos por idioma antes de aplicar modelos más grandes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Valor |
|---|---|
| Accuracy (in-distribution) | 82,44% |
| Macro F1 (in-distribution) | 0,8246 |
| Accuracy (OOD, 50 frases reservadas) | 82,00% |
| Macro F1 (OOD) | 0,8197 |
| Muestras de entrenamiento | 3.561 |
| Muestras de test | 501 |

Estudio de transferencia cross-lingual recogido en la model card:

| Modelo | Accuracy | F1 |
|---|---|---|
| BERT inglés sobre inglés (línea base) | 84,58% | 0,7928 |
| BERT inglés → maithili (zero-shot) | 33,33% | 0,1667 |
| XLM-RoBERTa → maithili (zero-shot) | 68,66% | 0,6787 |
| mBERT ajustado en maithili | 70,86% | 0,7100 |
| XLM-RoBERTa ajustado en maithili (este modelo) | 82,44% | 0,8246 |

El autor subraya que la accuracy OOD (82,00%) es casi idéntica a la in-distribution, lo que sugiere generalización y no memorización, aunque la muestra OOD es de solo 50 frases.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,1 GB de pesos más overhead de activaciones; en fp16 aproximadamente 0,6 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32 (GTX 1650, RTX 3050, RTX 4090, T4, A100, H100). El entrenamiento original se hizo en una T4 de Google Colab.
- Cabe en CPU para inferencia por lotes pequeños, con latencia mayor pero aceptable para clasificación de frases cortas.
- Opciones de despliegue: pipeline de Transformers, `AutoModelForSequenceClassification` con PyTorch, exportación a ONNX Runtime, TorchScript o integración en servicios con FastAPI/Triton. No se documentan pesos GGUF ni integración con llama.cpp u Ollama (son herramientas orientadas a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (278M parámetros) y la longitud máxima de 128 tokens, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en maithili | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maithili-sentiment-model (este) | 278M | 128 tokens | 82,44% (in-distribution), 82,00% (OOD, 50 frases) | Apache 2.0 | Hugging Face |
| mBERT ajustado en maithili | no disponible en la información | no disponible | 70,86% | no disponible | no disponible como checkpoint publicado en la información |
| XLM-RoBERTa zero-shot sobre maithili | 278M (modelo base) | no disponible | 68,66% | no disponible | vía checkpoint base |
| BERT inglés zero-shot sobre maithili | no disponible en la información | no disponible | 33,33% | no disponible | vía checkpoint base |

No se dispone de información sobre otros clasificadores de sentimiento publicados específicamente para maithili con los que comparar parámetros, contexto y licencia.

## Limitaciones y advertencias

- El propio autor advierte que es un proyecto antiguo (marzo de 2026) entrenado y evaluado sobre datos parcialmente traducción automática y balanceados por clase; las métricas no reflejan el rendimiento sobre texto natural.
- La evaluación OOD se basa en solo 50 frases reservadas, una muestra demasiado pequeña para extraer conclusiones robustas.
- Riesgo de degradación fuera del dominio: el modelo base se preentrenó sobre tuits, y el ajuste fino usó frases cortas; textos largos, formales o de otros registros pueden clasificarse peor.
- Longitud de contexto limitada a 128 tokens: los documentos largos se truncan y pueden perder la parte del texto que determina el sentimiento.
- Riesgo de sesgo por el proceso de generación de datos: si la traducción automática introdujo artefactos o el balanceo por clase no refleja la distribución real del maithili, el modelo puede sobreajustarse a patrones artificiales.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas con alta confianza.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `cardiffnlp/twitter-xlm-roberta-base-sentiment` y del dataset antes de desplegar en producción.
- El autor redirige su trabajo actual a PURVA (Bhojpuri), lo que sugiere que este modelo no recibirá mantenimiento activo.
- Uso recomendado en producción solo con validación sobre datos propios y revisión humana en decisiones sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhiprd2000/maithili-sentiment-model
- Perfil del autor: https://huggingface.co/abhiprd2000
- Dataset de entrenamiento: https://huggingface.co/datasets/abhiprd2000/Maithili_Sentiment_8K
- Modelo base: https://huggingface.co/cardiffnlp/twitter-xlm-roberta-base-sentiment
- Proyecto actual del autor (PURVA, Bhojpuri): https://github.com/shodhx/purva
