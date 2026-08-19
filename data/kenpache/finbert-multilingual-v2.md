# Kenpache/finbert-multilingual-v2

## Resumen

Kenpache/finbert-multilingual-v2 es un modelo de análisis de sentimiento financiero entrenado sobre el backbone `jhu-clsp/mmBERT-base`, una variante de ModernBERT. Desarrollado por Kenpache, resuelve el problema de clasificar noticias y titulares financieros en tres clases (negativo, neutral, positivo) en siete idiomas distintos (inglés, chino, japonés, español, alemán, francés y árabe) con un único checkpoint, sin necesidad de traducción previa ni identificación de idioma.

Con 307 millones de parámetros y una ventana de contexto de 192 tokens en la evaluación, el modelo alcanza una precisión global del 87,24% sobre un conjunto de prueba de 4.993 oraciones financieras multilingüe. Su relevancia actual radica en que la mayoría de los modelos de sentimiento financiero son monolingües en inglés o colapsan en escrituras CJK y RTL; este modelo mantiene un rendimiento consistente entre alfabetos latinos, chinos, japoneses y árabes, con una diferencia máxima de 6 puntos entre el mejor y el peor idioma. Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (backbone `jhu-clsp/mmBERT-base`) con cabecera de clasificación de secuencias |
| Parametros totales | 307.532.547 (307M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 192 tokens en la evaluación (máximo del tokenizador no especificado; se asume el de mmBERT-base, no disponible) |
| Tipos de cuantizacion | no disponible (repo en fp32, 1,2 GB; no se documentan cuantizaciones) |
| Idiomas soportados | en, zh, ja, es, de, fr, ar (7 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `jhu-clsp/mmBERT-base`, una versión multilingüe de ModernBERT, que a su vez es una evolución del BERT clásico con mejoras en eficiencia: atención con máscara de relleno, capas de normalización revisadas y una tokenización más robusta para múltiples escrituras. Sobre este backbone se añade una cabeza de clasificación de secuencias con tres salidas (negativo, neutral, positivo). El fine-tuning se realizó para la tarea de sentimiento financiero, aunque la model card no detalla el corpus de entrenamiento ni el número de tokens utilizados; sí se documenta el conjunto de evaluación público `Kenpache/financial-sentiment-eval-7lang` con 4.993 oraciones. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado. El protocolo de evaluación especifica `max_length=192`, fp32 y texto sin normalización, con argmax sobre las tres clases.

## Capacidades

- Clasificación de sentimiento financiero en tres clases: negativo, neutral y positivo.
- Soporte multilingüe real en siete idiomas: inglés, chino, japonés, español, alemán, francés y árabe, incluyendo escrituras CJK y RTL sin colapso de rendimiento.
- Funciona en pipelines mixtos sin necesidad de detector de idioma ni paso de traducción.
- Manejo de titulares y oraciones cortas de noticias financieras, con buena separación entre clases (los F1 por clase están dentro de 1,6 puntos entre sí).
- Baja tasa de errores de polaridad: solo un 1,0% del conjunto de prueba invierte la polaridad (negativo llamado positivo o viceversa).
- Integración directa con la API de `transformers` mediante `pipeline("text-classification")`.
- Compatible con Text Embeddings Inference y endpoints de HuggingFace (según etiquetas del repo).

## Casos de uso

- Monitorización automatizada de noticias financieras: un sistema puede ingerir titulares en varios idiomas (por ejemplo, un equipo de trading en Madrid y Tokio) y clasificarlos en tiempo real para alertar de movimientos negativos o positivos en sectores concretos, gracias a que un único modelo cubre ambos idiomas sin infraestructura adicional.
- Análisis de sentimiento en redes sociales y foros de inversión: el modelo procesa mensajes cortos en inglés, español, alemán o francés para medir el ánimo del mercado antes de que se refleje en los precios, con una ventana de contexto suficiente para frases habituales en estos entornos.
- Filtrado y priorización de alertas en plataformas de noticias: un agregador de prensa económica puede etiquetar automáticamente cada titular como negativo, neutral o positivo y ordenar la cola de lectura de un analista según la intensidad del sentimiento, reduciendo el ruido de noticias neutrales.
- Evaluación de comunicados de empresa en mercados multilingües: una compañía cotizada en varias bolsas puede analizar la recepción de sus resultados trimestrales publicados en distintos idiomas (japonés, chino, inglés) con un único pipeline, evitando la inconsistencia de usar modelos separados por idioma.
- Backtesting de estrategias cuantitativas basadas en sentimiento: un fondo puede aplicar el modelo sobre series históricas de titulares en los siete idiomas para construir señales de trading y validar su poder predictivo, aprovechando que el conjunto de evaluación es público y reproducible.
- Chatbots de atención al cliente en banca y fintech: el modelo puede clasificar la polaridad de las consultas de los usuarios en varios idiomas para enrutarlas a los equipos adecuados (reclamaciones negativas vs. consultas neutrales), con una latencia baja gracias a su tamaño contenido de 307M parámetros.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de prueba `Kenpache/financial-sentiment-eval-7lang` (4.993 oraciones, `max_length=192`, fp32, sin normalización):

| Metrica | Valor |
|---|---|
| Accuracy global | 0.8724 |
| F1 (ponderado) | 0.8724 |

Precisión por idioma:

| Idioma | Items | Accuracy |
|---|---:|---:|
| Español | 905 | 0.8950 |
| Chino | 1.023 | 0.8935 |
| Alemán | 650 | 0.8785 |
| Árabe | 73 | 0.8767 |
| Japonés | 1.063 | 0.8702 |
| Inglés | 780 | 0.8410 |
| Francés | 499 | 0.8337 |

Rendimiento por clase (F1):

| Clase | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| negative | 0.8658 | 0.8913 | 0.8784 | 1.260 |
| neutral | 0.8683 | 0.8587 | 0.8635 | 2.158 |
| positive | 0.8835 | 0.8762 | 0.8798 | 1.575 |

Comparación en el subconjunto inglés (780 items, mismo protocolo):

| Modelo | Accuracy | F1 (ponderado) |
|---|---:|---:|
| Kenpache/finbert-multilingual-v2 | 0.8410 | 0.8410 |
| ProsusAI/finbert | 0.7218 | 0.7224 |

Nota del autor: la comparación con `ProsusAI/finbert` se limita al inglés (idioma más débil de este modelo) y parte de la diferencia puede deberse a convenciones de etiquetado distintas.

## Requisitos de hardware

- Inferencia en fp32: ~1,2 GB de VRAM (307M parámetros), cabe en cualquier GPU moderna con al menos 2 GB, incluyendo tarjetas de consumo antiguas (GTX 1050 Ti, etc.).
- En fp16: ~0,6 GB de VRAM; en cuantización de 8 bits: ~0,3 GB (no se proporcionan cuantizaciones oficiales, pero el modelo es convertible con herramientas estándar).
- GPU recomendada: cualquier GPU con 4 GB o más para ejecución cómoda con batch. Una RTX 3060 o superior permite inferencia en lote sin problemas.
- Despliegue: compatible con la API de `transformers` (pipeline), `text-embeddings-inference` y endpoints de HuggingFace. No se documenta soporte nativo para vLLM, llama.cpp u Ollama, aunque al ser un modelo BERT estándar puede servirse con `TEI` o `FastAPI` + `transformers`.
- Latencia estimada: no disponible en la documentación; para un modelo de 307M parámetros en GPU moderna se espera latencia de milisegundos por oración, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Accuracy (evaluacion) | Licencia | Formato |
|---|---|---|---|---|---|
| Kenpache/finbert-multilingual-v2 | 307M | 7 (en, zh, ja, es, de, fr, ar) | 0.8724 global; 0.8410 en inglés | Apache 2.0 | safetensors |
| ProsusAI/finbert | 110M (BERT-base) | Solo inglés | 0.7218 en el subconjunto inglés de este dataset | Apache 2.0 | safetensors |
| Kenpache/finbert-multilingual-v2-large | 560M | 7 (mismo conjunto) | 0.889 en el mismo conjunto de evaluación | Apache 2.0 | safetensors |

No se dispone de comparación con otros modelos multilingües de sentimiento financiero (p. ej., FinBERT multilingüe de otras fuentes) en la información proporcionada. La comparación con `ProsusAI/finbert` es directa solo en inglés y con la salvedad de convenciones de etiquetado. El hermano mayor (`-large`) ofrece mayor precisión a costa de más parámetros.

## Limitaciones y advertencias

- El rendimiento en árabe se mide sobre solo 73 items, por lo que la cifra (0.8767) debe considerarse indicativa y no estadísticamente sólida.
- El inglés es el idioma más débil del modelo (0.8410), lo que puede sorprender a usuarios acostumbrados a modelos monolingües; para uso exclusivo en inglés, `ProsusAI/finbert` u otros modelos específicos podrían ser más adecuados a pesar de su menor precisión en este conjunto.
- La ventana de contexto de 192 tokens limita el análisis a frases u oraciones cortas; no es adecuado para documentos largos sin truncamiento.
- No se documenta el corpus de entrenamiento, por lo que se desconocen posibles sesgos en la distribución de temas financieros (p. ej., sobre-representación de ciertos sectores o regiones).
- El riesgo de alucinación es bajo al ser una tarea de clasificación, pero los errores de polaridad, aunque raros (1,0% del conjunto), pueden tener impacto en decisiones de trading si no se valida con otras fuentes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para producción financiera; es recomendable validar el modelo con datos propios antes de desplegarlo.
- No hay información sobre versiones cuantizadas, por lo que el despliegue en CPU o edge requiere conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kenpache/finbert-multilingual-v2
- Conjunto de evaluación: https://huggingface.co/datasets/Kenpache/financial-sentiment-eval-7lang
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Versión large (hermano mayor): https://huggingface.co/Kenpache/finbert-multilingual-v2-large
