# CobuildX-AI/cbx-indic-sentiment-classifier-36M

## Resumen

cbx-indic-sentiment-classifier-36M es un clasificador de sentimiento (positivo, negativo, neutro) desarrollado por CobuildX-AI para 12 lenguas indias y el inglés. Se presenta como la variante compacta de una familia mayor basada en `jhu-clsp/mmBERT-small`: concretamente, se obtiene eliminando una capa de cada dos (11 de 22) del modelo de 58M afinado, y destilándolo de nuevo a partir de la versión base afinada sobre unos 160.000 textos reales sin etiquetar puntuados por ese modelo mayor.

El modelo resuelve un problema práctico muy específico: la clasificación de sentimiento en textos reales de usuario (comentarios, reseñas, tuits, publicaciones) escritos en escritura nativa, romanizados o con mezcla de código (*code-mixed*), algo frecuente en redes sociales del subcontinente. Frente a aproximaciones multilingües genéricas, el autor reporta mejoras notables en macro-F1 sobre textos reales (0,713 frente a 0,601–0,606 de variantes de XLM-R y 0,524 de un clasificador multilingüe genérico).

Con 36,5 millones de parámetros y un tamaño de repositorio de 0,1 GB, está pensado para despliegues de bajo coste: el autor indica unos 7 ms por texto corto y 27 ms para 256 tokens en CPU de 8 hilos en fp32. La licencia es Apache 2.0 y el modelo se distribuye en safetensors bajo la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small, 11 de 22 capas) |
| Parametros totales | 36.456.195 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (texto más largo se trunca) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en (escritura nativa, romanizada y code-mixed) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (`mmBERT-small`) reducido a la mitad de profundidad: conserva 11 de las 22 capas del modelo base afinado de 58M. Sobre esa estructura se aplica una segunda destilación a partir de la versión de 58M ya afinada, usando aproximadamente 160.000 textos reales sin etiquetar puntuados por ese modelo mayor. La tarea es de clasificación de secuencia con tres etiquetas (`positive`, `negative`, `neutral`), aunque la model card también lista la etiqueta `fill-mask` entre los tags de Hugging Face.

Las etiquetas siguen una guía escrita explícita: el sentimiento se refiere a la postura del autor, no al evento descrito (una noticia sobre un crimen es `neutral`), el sarcasmo se interpreta según su significado intencionado, las opiniones suaves cuentan y los textos con ambas polaridades se asignan a la dominante o a la conclusión del autor. No se detalla en la información disponible la composición exacta del corpus de entrenamiento ni si hubo ajuste por RLHF/DPO; se indica únicamente que la destilación se realizó sobre textos reales sin etiquetar.

## Capacidades

- Clasificación de sentimiento en tres clases (`positive`, `negative`, `neutral`) con probabilidades por etiqueta.
- Procesamiento de escritura nativa en 12 lenguas indias más inglés.
- Soporte de texto romanizado (por ejemplo, hindi en caracteres latinos).
- Soporte de texto *code-mixed* (mezcla de lenguas y alfabetos en un mismo enunciado).
- Clasificación por lotes: acepta una lista de textos y devuelve una lista de resultados.
- Indicación de truncamiento cuando el texto supera los 256 tokens (`"truncated": True`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación y análisis de opinión en redes sociales: el modelo clasifica comentarios y tuits en hindi, bengalí, tamil o texto romanizado, lo que permite monitorizar la percepción de una marca o evento en comunidades donde el texto rara vez está en escritura estándar.
- Análisis de reseñas de productos en marketplaces indios: con 256 tokens de contexto cubre la mayoría de reseñas cortas y devuelve probabilidades por etiqueta, útiles para agregar puntuaciones de satisfacción por producto y por lengua.
- Enrutamiento de tickets de soporte: al detectar sentimiento negativo en un mensaje de entrada, el sistema puede priorizar o escalar la conversación a un agente humano antes de que se agrave.
- Procesamiento por lotes a gran escala en CPU: con latencias del orden de milisegundos por texto en CPU de 8 hilos, es viable puntuar millones de documentos sin GPU, por ejemplo para paneles de opinión pública sobre corpus web (Sangraha, FineWeb-2).
- Investigación en lingüística computacional de lenguas indias: sirve como línea base ligera y reproducible para estudiar sentimiento en lenguas de bajos recursos, incluida la comparación entre escritura nativa y romanizada.
- Filtrado previo en pipelines de datos: clasificar y separar textos con opinión frente a textos neutros (noticias, anuncios, preguntas) antes de alimentar otros modelos o de construir datasets anotados.
- Análisis de comentarios en plataformas de vídeo y streaming: el ejemplo de la model card con comentarios en kannada y tamil sugiere su uso para medir reacción de audiencia en contenido regional.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Modelo | Real text test (macro F1) | Web text test (macro F1) | IndicSentiment (accuracy) |
|---|---:|---:|---:|
| 58M (misma familia) | 0,721 | 0,680 | 0,849 |
| **este modelo (36M)** | 0,713 | 0,650 | 0,818 |
| TF-IDF + regresión logística | 0,685 | 0,623 | 0,726 |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | 0,601 | – | 0,847 |
| cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual | 0,606 | – | 0,758 |
| tabularisai/multilingual-sentiment-analysis | 0,524 | – | 0,779 |

F1 por etiqueta en el test de texto real: `positive` 0,73, `negative` 0,58, `neutral` 0,83.

Desglose por lengua (macro F1, Real text test):

| Lengua | 58M | 36M (este modelo) | Textos |
|---|---:|---:|---:|
| Hindi (`hi`) | 0,67 | 0,68 | 199 |
| Bengalí (`bn`) | 0,87 | 0,86 | 200 |
| Marathi (`mr`) | 0,73 | 0,70 | 199 |
| Tamil (`ta`) | 0,78 | 0,75 | 197 |
| Telugu (`te`) | 0,57 | 0,59 | 199 |
| Kannada (`kn`) | 0,80 | 0,77 | 195 |
| Malayalam (`ml`) | 0,73 | 0,72 | 196 |
| Gujarati (`gu`) | 0,71 | 0,70 | 196 |
| Punjabi (`pa`) | 0,57 | 0,56 | 200 |
| Odia (`or`) | 0,46 | 0,53 | 199 |

El conjunto Real text test contiene 2.575 textos reales (unos 200 por lengua) etiquetados por dos LLM (Gemma 4 31B y Claude Sonnet 5.5) con desempate de gpt-5.4-mini, sin revisión humana. El conjunto IndicSentiment son 12.946 reseñas de producto de AI4Bharat (13 lenguas) evaluadas como accuracy de dos vías ignorando `neutral`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 36,5M de parámetros en fp32 los pesos ocupan aproximadamente 146 MB, y en fp16 unos 73 MB, por lo que la huella de memoria es mínima.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (e incluso en iGPU y en CPU).
- Despliegue: `transformers` (safetensors), con compatibilidad declarada para Text Embeddings Inference y endpoints; el autor distribuye además un wrapper propio `cbx_sentiment` (`SentimentClassifier`) que funciona en CPU o GPU.
- Latencia reportada: unos 7 ms por texto corto (17 tokens) y unos 27 ms para un texto completo de 256 tokens en CPU de 8 hilos en fp32. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento (Real text test) |
|---|---|---|---|---|---|
| **cbx-indic-sentiment-classifier-36M** | 36,5M | 256 tokens | Apache 2.0 | Sentimiento en 12 lenguas indias + inglés, romanizado y code-mixed | 0,713 macro F1 |
| cbx-indic-sentiment-classifier-58M (misma familia) | 58M | no disponible | Apache 2.0 (según familia) | Igual, mayor capacidad | 0,721 macro F1 |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | no disponible | no disponible | no disponible | Sentimiento multilingüe en tuits | 0,601 macro F1 |
| tabularisai/multilingual-sentiment-analysis | no disponible | no disponible | Solo uso no comercial | Sentimiento multilingüe | 0,524 macro F1 |

El modelo de 36M sacrifica aproximadamente 0,008 de macro-F1 en el test de texto real respecto al de 58M a cambio de reducir parámetros y coste de inferencia; frente a los modelos multilingües públicos comparados mantiene una ventaja de entre 0,1 y 0,19 puntos de macro-F1 en ese conjunto, aunque parte de la diferencia se atribuye en la model card a discrepancias en la definición de la clase `neutral`.

## Limitaciones y advertencias

- El modelo solo juzga el texto aislado: no ve la conversación, el producto ni la publicación a la que responde un comentario, lo que puede alterar la interpretación del sarcasmo o de las respuestas contextuales.
- El límite de 256 tokens trunca textos largos; en esos casos la clasificación se basa solo en el fragmento inicial.
- Las etiquetas de los conjuntos de evaluación fueron generadas por LLM sin revisión humana, por lo que los benchmarks contienen errores de anotación.
- F1 bajo en `negative` (0,58) y en lenguas como Odia (0,53) y Punjabi (0,56): el rendimiento es claramente desigual entre lenguas y clases.
- Riesgo de alucinación de etiqueta en textos ambiguos, irónicos o con mezcla de polaridades; la guía del autor resuelve estos casos con reglas, pero el modelo puede no aplicarlas de forma consistente.
- Sesgos: no se documentan análisis de sesgo demográfico, político o de dominio; al entrenarse con textos web y de redes sociales puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero la model card remite a la sección "Intended use and disclaimer" antes de usar el modelo; conviene revisarla.
- El modelo `tabularisai/multilingual-sentiment-analysis` usado como comparación es solo para uso no comercial, lo que limita su uso como alternativa en producción.
- No hay evidencia de validación en dominios especializados (legal, sanitario, financiero); su uso en esos contextos requiere evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indic-sentiment-classifier-36M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Paper de referencia (arXiv:2407.19528): https://arxiv.org/abs/2407.19528
- Dataset IndicSentiment (AI4Bharat): no disponible en la información proporcionada
- Corpus Sangraha: no disponible en la información proporcionada
- Corpus FineWeb-2: no disponible en la información proporcionada
- Repositorio del wrapper `cbx_sentiment`: no disponible en la información proporcionada
