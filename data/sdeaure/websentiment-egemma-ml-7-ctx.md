# SDeaure/websentiment-egemma-ml-7-ctx

## Resumen

WebSentiment EmbeddingGemma ML-7 con contexto es una cabeza de clasificación de sentimiento de 7 niveles (-3 a +3) para texto web en inglés, francés, español, alemán, italiano y portugués. La desarrolla Sylvain Deauré (SDeaure) y se apoya en el encoder congelado `google/embeddinggemma-300m`. Su particularidad es que clasifica cada segmento leyendo también el documento completo del que procede, de modo que puede resolver referencias anafóricas, ironías o configuraciones contextuales que un clasificador limitado al segmento no puede recuperar.

Técnicamente no es un modelo generativo ni un transformer entrenado de nuevo: es una regresión logística multinomial (scikit-learn, `C=1`) sobre dos vectores de 768 dimensiones concatenados (segmento y documento, 1.536 dimensiones totales), ambos L2-normalizados y centrados. La cabeza ocupa un único fichero JSON de 240 KB. El contexto máximo del encoder es de 2.048 tokens para el documento y 256 para el segmento.

Es relevante para pipelines de análisis de contenido web y SEO que ya dispongan de la página completa y necesiten puntuar frases o párrafos con matices de polaridad. Su naturaleza experimental y el hecho de que las etiquetas de evaluación provengan del mismo LLM que generó el entrenamiento limitan las conclusiones sobre su validez frente a anotación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial sobre embeddings concatenados de EmbeddingGemma-300m (encoder congelado) |
| Parametros totales | Cabeza: 240 KB en JSON (coeficientes); encoder base: 300 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Segmento: 256 tokens; documento: 2.048 tokens (limite del encoder) |
| Tipos de cuantizacion | No disponible (la cabeza es un JSON de coeficientes; el encoder admite las cuantizaciones de EmbeddingGemma) |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues |
| Licencia | CC BY 4.0 |
| Formato de pesos | `head-ctx.json` y `head-ctx.npz` (coeficientes), script `websentiment_ctx.py`; encoder en safetensors via Hugging Face |

## Arquitectura y entrenamiento

El sistema consta de un encoder congelado y una cabeza lineal. Para cada segmento se generan dos embeddings con `google/embeddinggemma-300m` usando el prefijo `task: classification | query: `: uno del segmento (hasta 256 tokens) y otro del documento completo (hasta 2.048 tokens). Ambos vectores son de 768 dimensiones, se L2-normalizan y se centran cada uno con su propia media (`mean_segment` y `mean_document`, almacenadas en `head-ctx.json`). Se concatenan en 1.536 dimensiones y sobre ellos se aplica una regresión logística multinomial de scikit-learn con `C=1`, sin ponderación de clases, que produce la etiqueta de -3 a +3.

El entrenamiento usa la parte web del split `train` del dataset `SDeaure/websentiment-ml-7`: 367.667 segmentos procedentes de FineWeb y FineWeb-2, etiquetados de -3 a +3 por Claude Sonnet 5.5 con el documento completo a la vista. No hay RLHF ni DPO; la innovación está en el diseño de la entrada (doble vector segmento-documento) y en el control experimental que demuestra que la mejora proviene del contexto y no de las dimensiones extra: una cabeza entrenada igual pero con el documento de otra página del mismo idioma no obtiene ganancia (0,534 frente a 0,539 de la cabeza sin contexto). El documento se codifica una sola vez por llamada y se reutiliza para todos los segmentos.

## Capacidades

- Clasificación de sentimiento en 7 niveles (-3 a +3) de segmentos de texto web, con etiqueta agregada de 3 clases por pliegue de masa.
- Resolución de contexto intra-documento: referencias pronominales, ironía preparada en frases anteriores y matices que dependen del resto de la página.
- Procesamiento multilingüe en seis idiomas (en, fr, es, de, it, pt) con una única cabeza.
- Salida por segmento reutilizando una codificación única del documento, lo que reduce coste en páginas con muchos párrafos.
- Soporte para centrado sobre corpus propio mediante `means=(mean_segment, mean_document)` y para embeddings precalculados (`segment_embeddings=`, `document_embedding=`).
- No soporta tool calling, function calling, agentes ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Análisis de sentimiento de reseñas y páginas de producto: se puntúa cada párrafo de la ficha o de las opiniones usando la página completa como contexto, lo que permite interpretar correctamente comparaciones del tipo "mejor que el anterior" o negaciones que abarcan varias frases.
- Monitorización de reputación de marca en medios: se procesan artículos completos y se obtiene la polaridad de cada párrafo que menciona la marca, con el artículo como documento de referencia para desambiguar ironías editoriales.
- Auditoría de contenido SEO: se evalúa el tono de secciones de una página (introducción, FAQ, conclusiones) para detectar desalineaciones con la intención de búsqueda, aprovechando que el documento se codifica una sola vez por llamada.
- Moderación de comentarios y foros: se clasifican mensajes individuales con el hilo o la página como contexto, útil para distinguir críticas legítimas de hostilidad cuando el tono depende de mensajes previos.
- Investigación de mercado multilingüe: se aplica la misma cabeza a corpus en inglés, francés, español, alemán, italiano y portugués, con macro-F1 de 7 niveles entre 0,510 (alemán) y 0,603 (portugués) en el split `eval_natural` con centrado de corpus.
- Enriquecimiento de datasets de entrenamiento: se etiquetan grandes volúmenes de texto web con polaridad fina de 7 niveles para alimentar clasificadores posteriores o sistemas de ranking, reutilizando los embeddings del encoder para evitar recodificar el documento en cada segmento.
- Análisis de opiniones de clientes en encuestas abiertas: se puntúan respuestas de texto libre con el cuestionario completo como documento, lo que ayuda a interpretar respuestas breves cuyo sentido depende de la pregunta.

## Benchmarks y rendimiento

Evaluación sobre el split `eval_natural` de WebSentiment ML-7 (segmentos web aleatorios de FineWeb y FineWeb-2, seis idiomas, documentos no vistos en entrenamiento, etiquetas del mismo LLM que el entrenamiento):

| Cabeza | Centrado | Macro-F1, 7 niveles | Exacto dentro de ±1 | Macro-F1, 3 clases |
|---|---|---|---|---|
| Modelo principal (solo segmento) | corpus | 0,539 | 0,947 | 0,770 |
| **Este modelo (segmento + documento)** | corpus | **0,565** | **0,955** | **0,780** |
| Segmento + documento aleatorio (control) | corpus | 0,534 | 0,946 | 0,767 |
| Modelo principal (solo segmento) | referencia | 0,532 | 0,952 | 0,775 |
| **Este modelo (segmento + documento)** | referencia | **0,544** | **0,960** | **0,781** |

Resultados por idioma (Macro-F1, 7 niveles):

| Idioma | Centrado de corpus | Centrado de referencia |
|---|---|---|
| EN | 0,582 | 0,541 |
| FR | 0,575 | 0,559 |
| ES | 0,572 | 0,547 |
| DE | 0,510 | 0,496 |
| IT | 0,548 | 0,549 |
| PT | 0,603 | 0,573 |

Sin contexto (segmento como su propio documento), la cabeza obtiene 0,676 con centrado de corpus y 0,649 con centrado de referencia en los 9 benchmarks humanos del modelo principal, frente a 0,673 y 0,641 del modelo principal. La ganancia del contexto se concentra en los niveles extremos: F1 de -3 pasa de 0,343 a 0,396 y de +3 de 0,510 a 0,545.

## Requisitos de hardware

- VRAM para el encoder: EmbeddingGemma-300m en fp16 ocupa aproximadamente 0,6 GB de pesos; en fp32, alrededor de 1,2 GB. La cabeza es un JSON de 240 KB y se ejecuta en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el encoder en fp16 (RTX 3050, RTX 4060, T4). Para lotes grandes de documentos de 2.048 tokens conviene una A10, L4 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también puede ejecutarse en CPU con latencia mayor, ya que la cabeza es una regresión logística.
- Opciones de despliegue: `sentence-transformers>=5` y `transformers>=4.56` con el script `websentiment_ctx.py`; el encoder puede servirse con TGI o vLLM si se separa la codificación de la clasificación. No hay soporte de llama.cpp ni Ollama para la cabeza.
- Latencia y throughput: no disponibles en la información proporcionada. El coste dominante es la codificación del documento (2.048 tokens) una vez por llamada, más la del segmento (256 tokens) por cada segmento.
- Requisito de acceso: EmbeddingGemma está restringido en Hugging Face; hay que aceptar sus términos y ejecutar `hf auth login`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| WebSentiment EmbeddingGemma ML-7 ctx | Cabeza lineal sobre encoder congelado | 300 M (encoder) + 240 KB (cabeza) | 2.048 tokens documento / 256 segmento | 6 | CC BY 4.0 | Sentimiento 7 niveles con contexto de documento |
| WebSentiment EmbeddingGemma ML-7 (modelo principal) | Cabeza lineal sobre encoder congelado | 300 M (encoder) + cabeza | 256 tokens | 6 | CC BY 4.0 | Sentimiento 7 niveles solo con el segmento |
| google/embeddinggemma-300m | Encoder de embeddings | 300 M | 2.048 tokens | Multilingüe | Gemma terms | Embeddings generales, sin cabeza de sentimiento |
| Clasificadores de sentimiento tipo RoBERTa/XLM-R fine-tuned | Transformer encoder fine-tuned | 125 M - 560 M | 512 tokens | Variable | Variable | Sentimiento de 2-5 clases, sin contexto de documento |

La comparación directa con clasificadores fine-tuned de la familia RoBERTa no está respaldada por datos en la información disponible; los benchmarks publicados solo comparan esta cabeza con su variante sin contexto y con el control de documento aleatorio.

## Limitaciones y advertencias

- Modelo experimental: solo se ha medido contra etiquetas generadas por un LLM (Claude Sonnet 5.5), no contra anotación humana. No existe un benchmark humano con segmentos y sus documentos, por lo que la ganancia de contexto no está validada por personas.
- Los documentos de entrenamiento tienen una mediana de 391 tokens y un máximo de 1.502; el comportamiento en páginas mucho más largas (truncadas a 2.048 tokens) o muy cortas no está medido. Para páginas largas puede funcionar mejor una ventana de sección o párrafo alrededor del segmento que la página completa.
- Una sola cabeza, entrenada con el prefijo de clasificación. No hay variante sin prefijo ni snippet de transformers.js.
- Ironía y frases mixtas siguen siendo difíciles; los niveles extremos se atraen hacia sus vecinos (F1 de -3 de 0,396 y de +3 de 0,545 en el mejor caso).
- El rendimiento varía por idioma: el alemán es el más débil (0,510 de macro-F1 con centrado de corpus) y el portugués el más fuerte (0,603).
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución. Si se comparte la cabeza o una versión modificada, hay que acreditar, por ejemplo: "Sentiment by WebSentiment EmbeddingGemma ML-7 with context by Sylvain Deauré (https://sylvain-deaure.fr/en/websentiment/), CC BY 4.0". Si solo se usa en un producto o herramienta alojada sin compartirla, se pide la misma atribución en la página de ayuda o "acerca de".
- El encoder base `google/embeddinggemma-300m` está sujeto a los términos de Gemma y requiere aceptar la licencia y autenticarse en Hugging Face; sus restricciones de uso se aplican además de la CC BY 4.0 de la cabeza.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de calibración: la salida es una etiqueta discreta de -3 a +3 sin intervalos de confianza documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SDeaure/websentiment-egemma-ml-7-ctx
- Modelo principal (solo segmento): https://huggingface.co/SDeaure/websentiment-egemma-ml-7
- Dataset WebSentiment ML-7: https://huggingface.co/datasets/SDeaure/websentiment-ml-7
- Encoder base EmbeddingGemma-300m: https://huggingface.co/google/embeddinggemma-300m
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Página del autor: https://sylvain-deaure.fr/en/websentiment/
