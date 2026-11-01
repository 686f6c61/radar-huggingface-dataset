# psub/news-headline-distilbert-8cat

## Resumen

`psub/news-headline-distilbert-8cat` es un modelo de clasificación de texto en inglés obtenido por ajuste fino (fine-tuning) de `distilbert-base-uncased` sobre titulares de noticias. Clasifica cada titular en una de ocho categorías cerradas: BUSINESS, ENTERTAINMENT, FOOD & DRINK, POLITICS, SCIENCE, SPORTS, TECH y TRAVEL. Lo publica el usuario `psub` en HuggingFace con licencia Apache 2.0 y un tamaño de repositorio de 0,3 GB.

El modelo resuelve un problema acotado y bien definido: el enrutado temático de titulares periodísticos en pipelines de agregación, monitorización de medios o sistemas de recomendación. Con 66,96 millones de parámetros, es un modelo encoder-only compacto que puede ejecutarse en CPU con latencia baja, lo que lo hace apto para procesamiento por lotes de volúmenes moderados sin infraestructura GPU.

Su relevancia es práctica más que investigadora: es un ejemplo de modelo de nicho, con métricas declaradas por el autor (accuracy 0,828 y macro-F1 0,827 sobre 1.200 titulares de test) y con advertencias explícitas sobre el conjunto cerrado de etiquetas y la fiabilidad de las predicciones de baja confianza. La fecha de creación del repositorio (31 de octubre de 2026) y el número de descargas (6) indican que se trata de una publicación reciente y de adopción muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.959.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la arquitectura base DistilBERT admite hasta 512 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder-only de 6 capas obtenido por destilación de conocimiento de BERT-base. La cabeza de clasificación se sustituye por una capa lineal con 8 salidas, una por categoría. No hay innovaciones arquitectónicas propias: el valor está en el ajuste de la cabeza y del encoder al dominio de titulares periodísticos.

El entrenamiento se realizó sobre 9.600 titulares (1.200 por categoría) extraídos del News Category Dataset de Kaggle (titulares de HuffPost), durante 3 épocas, con learning rate 3e-5 y batch size 32, en CPU. La selección del mejor checkpoint se hizo por macro-F1 de validación. No se documenta el uso de RLHF, DPO ni aumentación de datos; tampoco se especifica la composición exacta del split de validación ni el número de tokens de entrenamiento.

## Capacidades

- Clasificación de texto en inglés en un conjunto cerrado de 8 categorías (BUSINESS, ENTERTAINMENT, FOOD & DRINK, POLITICS, SCIENCE, SPORTS, TECH, TRAVEL).
- Salida de probabilidades por clase mediante la pipeline `text-classification` de HuggingFace, lo que permite aplicar umbrales de confianza.
- Procesamiento de titulares cortos, el formato para el que fue entrenado.
- Ejecución en CPU con requisitos de memoria reducidos (modelo de 0,3 GB en safetensors).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo etiquetas.

## Casos de uso

- Enrutado de titulares en agregadores de noticias: el modelo asigna cada titular a una de las 8 secciones antes de la publicación, con un umbral de confianza de 0,70 para derivar los casos dudosos a revisión humana.
- Monitorización de medios y clipping de prensa: clasificación por lotes de titulares recopilados de fuentes RSS para construir informes temáticos diarios o semanales.
- Filtrado temático en sistemas de recomendación: etiquetado de titulares para alimentar un motor de personalización que selecciona contenido por interés del usuario (por ejemplo, solo TECH y SCIENCE).
- Análisis de tendencias editoriales: agregación de volúmenes de titulares por categoría y por medio para detectar cambios en la cobertura (proporción de POLITICS frente a SPORTS en un periodo).
- Preetiquetado para anotación humana: generación de etiquetas iniciales en un corpus de titulares que luego se revisa y corrige, reduciendo el coste de anotación manual.
- Moderación o curaduría de secciones en un CMS: verificación de que un titular publicado en la sección de TECH no corresponde en realidad a BUSINESS o SCIENCE, marcando discrepancias.
- Prototipado rápido en CPU: al ejecutarse sin GPU, sirve para validar pipelines de clasificación en entornos de desarrollo o en dispositivos sin acelerador antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 0,828 | 1.200 titulares de test (150 por categoría) |
| Macro-F1 | 0,827 | 1.200 titulares de test (150 por categoría) |
| Precision en predicciones con confianza < 0,70 | ~38 % de acierto | Muestra de test |

El autor señala BUSINESS y TECH como las categorías más débiles, con errores frecuentes en etiquetas solapadas o discutibles. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,96 M de parámetros, ~268 MB de pesos); en fp16, ~134 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo no requiere GPU y el autor lo entrenó en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX antiguas) y en GPUs integradas con suficiente memoria compartida.
- Despliegue: pipeline `text-classification` de Transformers, TorchScript/ONNX si se exporta manualmente, o inferencia directa con PyTorch en CPU. No se han publicado pesos GGUF para llama.cpp ni Ollama, y vLLM/TGI no son la vía habitual para un encoder de este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera procesamiento por lotes de miles de titulares por minuto en CPU moderna, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `psub/news-headline-distilbert-8cat` | 66,96 M | No disponible | Clasificación de titulares en 8 categorías | Apache 2.0 | HuggingFace (6 descargas) |
| `distilbert-base-uncased` | 66,96 M | 512 tokens | Modelo base sin cabeza de clasificación | Apache 2.0 | HuggingFace (ampliamente usado) |
| `facebook/bart-large-mnli` | ~406 M | 1.024 tokens | Clasificación zero-shot por NLI | MIT | HuggingFace |
| `cardiffnlp/twitter-roberta-base-sentiment` | ~125 M | 512 tokens | Análisis de sentimiento en 3 clases | No disponible | HuggingFace |

La comparación directa con alternativas de la misma tarea es limitada: no se han publicado en la información disponible otros clasificadores de titulares con este esquema de 8 categorías ni métricas comparables. Frente al modelo base, la diferencia es la cabeza de clasificación y el ajuste al dominio; frente a modelos zero-shot como BART-MNLI, este modelo es mucho más pequeño y rápido, pero está restringido a su conjunto cerrado de etiquetas.

## Limitaciones y advertencias

- Conjunto cerrado de etiquetas: el modelo siempre devuelve una de las 8 categorías, incluso ante texto fuera de dominio (por ejemplo, titulares deportivos o científicos mal etiquetados por la fuente).
- Las etiquetas siguen las convenciones de clasificación de HuffPost, no una taxonomía temática estricta; esto puede generar discrepancias con otros esquemas editoriales.
- Las predicciones con confianza inferior a 0,70 acertaron solo en torno al 38 % de los casos en la muestra de test; el autor recomienda derivarlas a revisión humana.
- Categorías débiles documentadas: BUSINESS y TECH, con errores frecuentes por solapamiento de etiquetas.
- Entrenado únicamente en inglés; no se ha evaluado su comportamiento en otros idiomas.
- El dataset de origen (News Category Dataset de Kaggle, titulares de HuffPost) tiene sus propios términos de uso; el autor advierte de que deben comprobarse antes de un uso comercial, aunque la licencia del modelo sea Apache 2.0.
- Riesgo de sesgo: al derivar de titulares de un único medio (HuffPost), la distribución temática y el estilo pueden no representar a otros medios o registros.
- No es un modelo generativo ni un clasificador zero-shot; no admite etiquetas nuevas sin reentrenamiento.
- Adopción muy baja (6 descargas, 0 likes) y publicación reciente: no hay evidencia de uso en producción ni validación independiente de las métricas declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psub/news-headline-distilbert-8cat
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de origen (News Category Dataset, Kaggle): https://www.kaggle.com/datasets/rmisra/news-category-dataset
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
