# aynaval2003/echo-sbert-domain

## Resumen

`echo-sbert-domain` es un modelo de embeddings de frases (sentence embeddings) desarrollado por aynaval2003 para el proyecto Echo, cuyo objetivo es transformar 100.000 reseñas de Google Play de la aplicación Swiggy en temas rastreables. Se trata de un modelo de 82 millones de parámetros basado en `distilroberta-base`, entrenado en dos etapas: primero una reproducción manual de Sentence-BERT sobre 300.000 pares de SNLI y MultiNLI, y después una adaptación de dominio con `MultipleNegativesRankingLoss` sobre 53.061 pares minados de las propias reseñas, más pares auto-generados por SimCSE.

El modelo está pensado para trabajar con texto corto, informal y ruidoso típico de reseñas de tiendas de aplicaciones, un dominio donde los modelos genéricos suelen perder precisión. Su relevancia radica en que demuestra que la adaptación de dominio puede mejorar el rendimiento en STS genérico sin degradarlo, y que es posible construir un sistema de análisis de feedback de usuarios con recursos moderados. Publicado bajo licencia Apache-2.0 y con pesos en formato safetensors, está disponible para uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilRoBERTa (transformer encoder) con mean pooling |
| Parametros totales | 82.118.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso usa truncación a 128 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Sentence-BERT original de Reimers y Gurevych (2019): un encoder transformer siamés con mean pooling sobre los tokens de salida y una función de clasificación sobre la concatenación `(u, v, |u-v|)`. El encoder base es `distilroberta-base`, una versión destilada de RoBERTa con 6 capas y 82M parámetros. El entrenamiento se realizó en dos etapas: la primera reproduce el entrenamiento clásico de SBERT con 300.000 pares de SNLI y MultiNLI, implementado a mano en PyTorch; la segunda adapta el modelo al dominio de reseñas de apps mediante `MultipleNegativesRankingLoss` sobre 53.061 pares minados de las reseñas reales, donde TF-IDF y el encoder de la etapa 1 coinciden independientemente, más pares auto-generados por SimCSE con dropout. Esta segunda etapa mejora el STS promedio en +2.37 puntos sin sacrificar el rendimiento genérico, un resultado que el autor destaca como no trivial.

## Capacidades

- Generación de embeddings de frases para similitud semántica, con mean pooling obligatorio (CLS pooling degrada 5.1 puntos).
- Especializado en texto corto, informal y ruidoso de reseñas de aplicaciones (abreviaturas, errores tipográficos, coloquialismos).
- Retrieval semántico de reseñas, con mejora significativa al combinarlo con un cross-encoder reranker.
- Asignación de temas a reseñas mediante similitud con embeddings de temas predefinidos.
- No soporta tool calling, ni agentes, ni visión, ni audio.
- Multilingüe: solo inglés; no maneja Hinglish (mezcla de hindi e inglés romanizado).

## Casos de uso

- Análisis de feedback de usuarios: el modelo permite agrupar reseñas de una app en temas recurrentes (por ejemplo, "problemas con el pago", "envío lento", "calidad de la comida") calculando la similitud entre cada reseña y un conjunto de temas predefinidos.
- Monitorización de cambios en la satisfacción: al procesar reseñas nuevas diariamente, se pueden detectar picos en temas negativos tras una actualización de la app.
- Búsqueda semántica en bases de reseñas históricas: un equipo de producto puede consultar reseñas similares a un problema reportado sin usar palabras clave exactas.
- Clustering de reseñas para priorización: agrupar reseñas similares permite estimar el volumen de quejas sobre un mismo aspecto.
- Sistemas de recomendación de respuestas: dado un conjunto de respuestas tipo, el modelo puede sugerir la respuesta más adecuada a una reseña concreta.
- Enriquecimiento de datasets de entrenamiento: los embeddings generados pueden usarse como características para clasificadores de sentimiento o detección de intención en dominios específicos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| STS average (7 datasets) tras etapa 1 | 72.17 |
| STS average (7 datasets) tras etapa 2 | 74.54 |
| Review retrieval, Precision@10 | 61.15 |
| Review retrieval, + cross-encoder rerank | 75.77 |
| Theme assignment, blind hand-audit | 82.4% |

El autor advierte que el valor de 74.54 no debe compararse directamente con el 74.21 reportado en el paper original de SBERT, ya que este modelo incorpora una segunda etapa de entrenamiento. Además, los resultados de retrieval se basan en 26 consultas juzgadas manualmente por una sola persona, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- Inferencia en CPU es viable: el modelo ocupa ~0.3 GB en FP32 y la latencia por frase es del orden de milisegundos en hardware moderno.
- VRAM estimada: ~330 MB en FP32, ~165 MB en FP16, ~82 MB en INT8 (si se cuantiza). Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; para producción con alto throughput, una A10 o T4 es adecuada.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `sentence-transformers`, y `text-embeddings-inference` (mencionado en los tags del modelo). También se puede servir con vLLM o endpoints compatibles con Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; dado el tamaño del modelo, se espera un throughput alto en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | STS (7 datasets) | Licencia |
|---|---|---|---|---|
| echo-sbert-domain | 82M | no disponible | 74.54 (tras 2 etapas) | Apache-2.0 |
| all-MiniLM-L6-v2 (sentence-transformers) | 22.7M | 256 | ~68.5 | Apache-2.0 |
| bge-small-en-v1.5 (BAAI) | 33.4M | 512 | ~68.5 | MIT |
| distilroberta-base (sin entrenamiento SBERT) | 82M | 512 | no aplica | Apache-2.0 |

La comparación directa es limitada porque los benchmarks de los modelos alternativos provienen de evaluaciones genéricas de STS, mientras que echo-sbert-domain añade una etapa de adaptación de dominio. En tareas de retrieval de reseñas específicas, el modelo supera a TF-IDF solo cuando se combina con un cross-encoder reranker (75.77 vs 65.00 de TF-IDF).

## Limitaciones y advertencias

- No maneja Hinglish: las reseñas romanizadas en hindi se agrupan por idioma en lugar de por tema, lo que limita su uso en mercados multilingües como India.
- Pierde contra TF-IDF en retrieval de reseñas si no se usa un cross-encoder reranker; no es un modelo autónomo para búsqueda.
- Posible circularidad en el entrenamiento: los pares minados requirieron acuerdo de TF-IDF, por lo que el modelo puede haber aprendido parcialmente a imitar a TF-IDF en lugar de capturar semántica real.
- Evaluaciones con base estadística débil: 26 consultas juzgadas por una sola persona; los resultados de retrieval deben considerarse preliminares.
- Solo inglés; no hay soporte para otros idiomas.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.
- Para producción, se recomienda validar el rendimiento en el dominio específico antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aynaval2003/echo-sbert-domain
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084
- Repositorio del proyecto Echo: https://github.com/ayn-aval/Echo
