# abhiprd2000/nlp-sentiment-model

## Resumen

`abhiprd2000/nlp-sentiment-model` es un modelo de clasificación de sentimiento en tres clases (positivo, negativo, neutro) obtenido mediante fine-tuning de `google-bert/bert-base-uncased`. Lo desarrolla Abhimanyu Prasad (usuario `abhiprd2000` en Hugging Face) y se publica bajo licencia Apache 2.0. Emplea la arquitectura BERT base (transformer encoder bidireccional, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con una cabeza de clasificación de secuencias de tres etiquetas. El checkpoint contiene 109.484.547 parámetros y el repositorio ocupa 0,9 GB en formato safetensors.

El modelo resuelve una tarea acotada y bien delimitada: asignar a un texto en inglés una de tres polaridades. Su relevancia práctica es limitada pero clara: ofrece una alternativa ligera y desplegable en CPU o GPU de gama baja para tareas de análisis de opinión a pequeña escala, con un consumo de recursos muy inferior al de los modelos generativos actuales.

Es importante contextualizar su alcance. El propio autor advierte en la model card que se trata de un proyecto antiguo (marzo de 2026) entrenado y evaluado sobre datos parcialmente traducidos automáticamente y balanceados por clase, y que las métricas declaradas provienen de particiones de test de ese mismo corpus, por lo que no reflejan el rendimiento sobre texto natural. La longitud máxima de secuencia durante el entrenamiento fue de 128 tokens, lo que restringe su uso a fragmentos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base) con cabeza de clasificación de secuencias |
| Parametros totales | 109.484.547 (aproximadamente 0,1 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico de BERT base); entrenado con `max_length=128` |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; al ser un modelo de 0,1 B es viable cuantizarlo a int8 o int4 con herramientas estándar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch vía `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas con 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 M de parámetros. Sobre la representación del token `[CLS]` se añade una capa lineal de proyección a tres logits, correspondientes a las etiquetas `negative` (0), `neutral` (1) y `positive` (2). El vocabulario es el estándar de BERT uncased (WordPiece, 30.522 tokens) y el tokenizador no distingue mayúsculas de minúsculas.

El entrenamiento consistió en tres épocas con batch size 16, longitud máxima de secuencia 128, optimizador AdamW con hiperparámetros por defecto y una única NVIDIA T4 en Google Colab. El corpus declarado es el subconjunto de análisis de sentimiento del dataset `abhiprd2000/nlp-benchmark-suite`, con aproximadamente 4.796 muestras de entrenamiento y 1.199 de test, agregando datos de Amazon Polarity (reseñas de producto), TweetEval (publicaciones sociales) e IMDB (críticas de cine), en torno a 2.000 muestras por fuente. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales; es un fine-tuning supervisado convencional. Tampoco se especifican el número total de tokens vistos ni la composición exacta tras el filtrado y el balanceo de clases.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, negativo, neutro) sobre texto en inglés.
- Procesamiento de fragmentos cortos: reseñas, tuits, titulares y comentarios de hasta 128 tokens efectivos según el entrenamiento (el encoder admite hasta 512).
- Inferencia rápida y económica en CPU, adecuada para lotes grandes.
- Exposición como pipeline `text-classification` de `transformers` y compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- No es un modelo generativo: no produce texto, solo etiquetas y puntuaciones de probabilidad.

## Casos de uso

- Monitorización de opiniones en redes sociales: clasificar en lote tuits o comentarios en inglés en positivo, negativo y neutro para construir paneles de sentimiento de marca; el coste por inferencia es muy bajo y el modelo cabe en CPU.
- Triaje de reseñas de producto en comercio electrónico: etiquetar automáticamente reseñas de Amazon u otras plataformas para enrutar las negativas a atención al cliente y agregar métricas de satisfacción por producto.
- Filtrado previo en pipelines de moderación: usar la etiqueta negativa como señal de priorización para revisión humana de comentarios, reduciendo el volumen que llega a los moderadores.
- Análisis de opinión sobre estrenos cinematográficos: procesar críticas de IMDB en inglés para estimar la recepción de un título antes de su lanzamiento.
- Enriquecimiento de datasets de investigación: etiquetar corpus no anotados con polaridad para experimentos de análisis de opinión o para generar características auxiliares en modelos mayores.
- Clasificación por lotes en entornos con recursos limitados: al tratarse de un modelo de 0,1 B en safetensors, puede ejecutarse en una instancia pequeña o incluso en un portátil con `transformers` y PyTorch en CPU, sin necesidad de GPU dedicada.
- Prototipado rápido de productos de análisis de texto: servir como línea base antes de invertir en modelos mayores o en anotación humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Valor | Dataset |
|---|---|---|
| Accuracy | 0,8458 (84,58 %) | NLP Benchmark Suite (`abhiprd2000/nlp-benchmark-suite`) |
| F1 (macro) | 0,7928 | NLP Benchmark Suite (`abhiprd2000/nlp-benchmark-suite`) |

No se han publicado resultados en otros benchmarks estándar (SST-2, GLUE, TweetEval oficial) en la información disponible. El autor advierte que estas cifras proceden de particiones de test de datos parcialmente traducidos automáticamente y balanceados por clase, por lo que no deben interpretarse como rendimiento esperable sobre texto natural.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB (109 M de parámetros × 4 bytes), más el overhead de activaciones, que es despreciable para lotes moderados.
- En fp16: aproximadamente 0,22 GB de pesos.
- En int8: aproximadamente 0,11 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una NVIDIA T4 basta sobradamente; también funciona en RTX 3060, RTX 4090, A100 o H100, aunque estas últimas están enormemente sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo, e incluso en CPU: la inferencia en CPU es viable para lotes de cientos o miles de textos.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (tag oficial), servidores de inferencia compatibles con endpoints de Hugging Face, y exportación a ONNX para optimización. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama, que están orientadas a modelos generativos.
- Latencia y throughput: no se publican mediciones. Por el tamaño del modelo, en una T4 se espera un throughput del orden de miles de secuencias cortas por segundo con batching, pero este dato es una estimación y no una cifra oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abhiprd2000/nlp-sentiment-model` | 109,5 M | 512 (entrenado a 128) | Clasificación de sentimiento 3 clases, inglés | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 | Clasificación de sentimiento binaria, inglés | Apache 2.0 | Hugging Face |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 | Clasificación de sentimiento 3 clases, inglés (dominio Twitter) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (modelo base, sin fine-tuning) | 110 M | 512 | Enmascarado de tokens; requiere fine-tuning para clasificación | Apache 2.0 | Hugging Face |

No se dispone de comparaciones de rendimiento entre estos modelos en la información proporcionada. Las alternativas citadas son referencias habituales de la misma categoría (encoders pequeños para análisis de sentimiento en inglés), pero sus métricas no se han contrastado aquí con las del modelo descrito.

## Limitaciones y advertencias

- El autor reconoce explícitamente que los datos de entrenamiento y test están parcialmente traducidos automáticamente y balanceados por clase, por lo que las métricas declaradas no reflejan el rendimiento sobre texto natural.
- Longitud efectiva de 128 tokens durante el entrenamiento: textos más largos se truncan y pueden perder información relevante para la clasificación.
- Solo inglés: no soporta castellano ni otros idiomas; su uso en textos multilingües producirá resultados poco fiables.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de clasificaciones erróneas con alta confianza en dominios alejados de los datos de entrenamiento (reseñas, tuits y críticas de cine).
- Sesgos potenciales derivados de las fuentes: Amazon Polarity, TweetEval e IMDB sobrerrepresentan ciertos registros y temas; el balanceo artificial de clases puede introducir sesgos adicionales en la frontera entre neutro y las otras dos clases.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre el cumplimiento normativo en aplicaciones sensibles.
- Modelo con 18 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa de sus resultados.
- No se publican variantes cuantizadas oficiales ni artefactos ONNX; cualquier optimización de despliegue corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhiprd2000/nlp-sentiment-model
- Perfil del autor: https://huggingface.co/abhiprd2000
- Dataset de entrenamiento: https://huggingface.co/datasets/abhiprd2000/nlp-benchmark-suite
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Proyecto actual del autor (PURVA, trabajo sobre bhojpuri): https://github.com/shodhx/purva
