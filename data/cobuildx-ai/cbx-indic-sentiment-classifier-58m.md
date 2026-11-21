# CobuildX-AI/cbx-indic-sentiment-classifier-58M

## Resumen

cbx-indic-sentiment-classifier-58M es un clasificador de sentimiento (positivo, negativo, neutro) desarrollado por CobuildX-AI para 12 lenguas indias y el ingles, incluyendo texto en escritura nativa, romanizado y code-mixed. Se construye a partir de jhu-clsp/mmBERT-small mediante un proceso de destilacion desde un mmBERT-base afinado, con el vocabulario recortado a los 40.000 tokens relevantes para estas lenguas. El resultado es un modelo encoder compacto de 57,6 millones de parametros, publicado bajo licencia Apache 2.0 y pensado para inferencia de bajo coste.

El modelo aborda un problema concreto: la mayoria de clasificadores de sentimiento multilingues estan dominados por ingles o por lenguas de altos recursos, y rinden mal en texto informal indio, especialmente cuando aparece romanizado (transliteracion latina) o mezclado con ingles. Esta ficha documenta un modelo que trata explicitamente esos registros y que se evalua contra un conjunto de prueba de texto real con etiquetas generadas por LLM, ademas del benchmark IndicSentiment de AI4Bharat.

Su relevancia practica esta en el coste: con 57,6M de parametros y latencias de 13 ms por texto corto en CPU (8 hilos, fp32), es viable para moderacion de comentarios, analisis de resenas o monitorizacion de redes sociales a gran escala sin GPU dedicada. La model card reconoce de forma explicita que las etiquetas de su test de texto real no fueron revisadas por personas y contienen errores, lo que debe tenerse en cuenta al interpretar sus cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) |
| Parametros totales | 57.550.851 (57,6M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (texto mas largo se trunca) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors; se cita inferencia en fp32 en CPU) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT orientado a multilingue, y se afina para clasificacion de sentimiento en tres clases. Segun la model card, se trata de un proceso de destilacion desde un mmBERT-base ya afinado, con el vocabulario reducido a 40.000 tokens que cubren las lenguas objetivo. El resultado es un clasificador de 57,6M de parametros con cabecera de clasificacion de tres etiquetas (`positive`, `negative`, `neutral`), con un modelo hermano de 36M de parametros de la misma familia.

La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de indicar que se usaron datos de Sangraha, FineWeb-2, comentarios de redes sociales, tuits y resenas, y que se dispone de una guia escrita que define las etiquetas. La evaluacion se realiza sobre tres conjuntos: un test de texto real de 2.575 textos (unas 200 por lengua) etiquetado por dos LLM (Gemma 4 31B y Claude Sonnet 5.5) con desempate de gpt-5.4-mini, un test de texto web de 1.252 textos y el benchmark IndicSentiment (12.946 resenas de producto). La model card advierte que las etiquetas del test de texto real no fueron revisadas por personas.

## Capacidades

- Clasificacion de sentimiento en tres clases (`positive`, `negative`, `neutral`) con probabilidad por etiqueta.
- Cobertura de 12 lenguas indias mas ingles, en escritura nativa, romanizada y code-mixed.
- Procesamiento por lotes: acepta una lista de textos y devuelve una lista de resultados.
- Definicion de sentimiento centrada en la postura del autor, no en el evento: noticias sobre crimenes o desastres se etiquetan como `neutral`.
- Manejo de sarcasmo con su significado intencionado y de opiniones suaves ("decent phone for the price" se considera `positive`).
- Textos con ambas polaridades se resuelven por la dominante o la conclusion del autor; en caso contrario, `neutral`.
- Truncado controlado a 256 tokens con indicador `"truncated": True`.
- No soporta tool calling, agentes, vision ni audio: es un clasificador de texto puro.

## Casos de uso

- Moderacion de comentarios en plataformas indias: el modelo clasifica comentarios en hindi, bengali, tamil o texto romanizado con latencias de 13 ms por texto corto en CPU, lo que permite procesar colas de moderacion sin GPU y filtrar negatividad antes de la revision humana.
- Analisis de resenas de producto en e-commerce: con 0,849 de accuracy en IndicSentiment (resenas de producto de AI4Bharat), es adecuado para agregar sentimiento por producto o vendedor en catalogos multilingues, comparando solo las puntuaciones `positive` y `negative` cuando todas las resenas llevan opinion.
- Monitorizacion de redes sociales y tuits: el soporte de texto romanizado y code-mixed (por ejemplo, "yaar kya bakwaas movie thi") cubre el registro informal dominante en Twitter/X y foros indios, donde los modelos entrenados solo en escritura nativa fallan.
- Atencion al cliente y triaje de tickets: clasificar mensajes entrantes en 13 lenguas para enrutar quejas (`negative`) a soporte prioritario y consultas factuales (`neutral`) a autoservicio, con un coste de inferencia minimo al ser un encoder de 58M.
- Analisis de sentimiento de noticias y medios: la guia de etiquetado distingue la postura del autor del evento reportado, lo que permite medir el tono editorial de un medio en lugar del tono de la noticia, util para estudios de sesgo mediatico.
- Procesamiento por lotes en pipelines de datos: al ser un modelo pequeno con formato safetensors y compatible con transformers, se puede integrar en jobs de Spark o flujos de etiquetado masivo de corpus en CPU, sin necesidad de infraestructura GPU.
- Investigacion en linguistica computacional para lenguas indias: sirve como linea base reproducible (Apache 2.0) para comparar tecnicas de normalizacion de romanizado o de manejo de code-mixing en tareas de sentimiento.

## Benchmarks y rendimiento

Resultados publicados en la model card. Macro F1 en los tests de texto real y texto web; accuracy de dos vias (positivo/negativo) en IndicSentiment.

| Modelo | Texto real (macro F1) | Texto web (macro F1) | IndicSentiment (accuracy) |
|---|---:|---:|---:|
| cbx-indic-sentiment-classifier-58M | 0,721 | 0,680 | 0,849 |
| 36M (misma familia) | 0,713 | 0,650 | 0,818 |
| TF-IDF + regresion logistica | 0,685 | 0,623 | 0,726 |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | 0,601 | no disponible | 0,847 |
| cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual | 0,606 | no disponible | 0,758 |
| tabularisai/multilingual-sentiment-analysis | 0,524 | no disponible | 0,779 |

F1 por etiqueta en el test de texto real: `positive` 0,74, `negative` 0,61, `neutral` 0,82. El modelo tiene dificultades con la clase negativa, la menos representada (20% del test).

Macro F1 por lengua en el test de texto real (58M frente a 36M):

| Lengua | 58M | 36M | Textos |
|---|---:|---:|---:|
| Hindi (hi) | 0,67 | 0,68 | 199 |
| Bengali (bn) | 0,87 | 0,86 | 200 |
| Marathi (mr) | 0,73 | 0,70 | 199 |
| Tamil (ta) | 0,78 | 0,75 | 197 |
| Telugu (te) | 0,57 | 0,59 | 199 |
| Kannada (kn) | 0,80 | 0,77 | 195 |
| Malayalam (ml) | 0,73 | 0,72 | 196 |
| Gujarati (gu) | 0,71 | 0,70 | 196 |
| Punjabi (pa) | 0,57 | 0,56 | 200 |
| Odia (or) | 0,46 | 0,53 | 199 |
| Assamese (as) | 0,82 | 0,81 | 200 |

La model card advierte que los tres modelos publicos de comparacion se usaron tal cual, con sus etiquetas mapeadas a las del modelo, y que parte de su desventaja en los tests de texto real se debe a diferencias en la definicion de `neutral`.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 0,2 GB en safetensors (fp32); en fp16 o cuantizado ocupa bastante menos, aunque la model card no documenta cuantizaciones oficiales.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 3060, RTX 4090) lo ejecuta con holgura. Para lotes grandes en produccion, una T4 o L4 es mas que suficiente.
- Cabe en CPU: si, es su caso de uso documentado. Un texto de 17 tokens tarda unos 13 ms en CPU de 8 hilos en fp32; un texto completo de 256 tokens, unos 52 ms.
- Opciones de despliegue: transformers (libreria declarada), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp u Ollama, que no son el objetivo de un encoder de clasificacion.
- Latencia y throughput: los datos de CPU implican del orden de 75 textos cortos por segundo por nucleo efectivo en 8 hilos; en GPU el throughput escala con el tamano de lote. No se publican cifras de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Texto real (F1) | IndicSentiment | Licencia |
|---|---|---:|---:|---:|---|
| cbx-indic-sentiment-classifier-58M | 57,6M | 256 | 0,721 | 0,849 | Apache 2.0 |
| cbx (familia, 36M) | 36M | 256 (no confirmado) | 0,713 | 0,818 | Apache 2.0 (no confirmado) |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | no disponible | no disponible | 0,601 | 0,847 | no disponible |
| cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual | no disponible | no disponible | 0,606 | 0,758 | no disponible |
| tabularisai/multilingual-sentiment-analysis | no disponible | no disponible | 0,524 | 0,779 | solo uso no comercial (segun la model card) |

La ventaja principal frente a los modelos de cardiffnlp es la cobertura explicita de romanizado y code-mixed indio y una definicion de `neutral` documentada; en IndicSentiment el modelo de cardiffnlp base queda practicamente empatado (0,847 frente a 0,849). Frente al 36M de la misma familia, el 58M mejora en macro F1 global (0,721 frente a 0,713) pero empeora en hindi, telugu y odia.

## Limitaciones y advertencias

- Las etiquetas de los tests de texto real y texto web fueron generadas por LLM sin revision humana; la propia model card indica que contienen errores, por lo que las cifras deben tomarse como orientativas.
- El modelo solo ve el texto: no dispone de contexto conversacional, del producto resenado ni del post al que responde un comentario, lo que puede invertir el sentimiento en respuestas o ironias dependientes de contexto.
- La clase `negative` es la mas debil (F1 0,61) y esta infrarrepresentada en el test (20%).
- Rendimiento bajo en odia (0,46 de macro F1), telugu y punjabi (0,57); no es recomendable como unico clasificador en esas lenguas sin validacion propia.
- Truncado a 256 tokens: resenas o posts largos pierden informacion y la prediccion puede basarse solo en el inicio del texto.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si hay riesgo de clasificaciones erroneas confiadas (probabilidades cercanas a 1,00 en los ejemplos de la model card) en textos ambiguos o sarcasticos.
- Sesgos no documentados: la model card no detalla analisis de sesgo por dominio, dialecto o registro; el entrenamiento con datos web y de redes sociales puede heredar sus sesgos.
- Licencia Apache 2.0 permite uso comercial, pero debe leerse la seccion "Intended use and disclaimer" de la model card antes de desplegarlo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopcion ni de validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indic-sentiment-classifier-58M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Paper de ModernBERT (referenciado en los tags, arXiv:2407.19528): https://arxiv.org/abs/2407.19528
- IndicSentiment (AI4Bharat): no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
