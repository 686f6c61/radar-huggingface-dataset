# Shaurya2020/allpanel-api-minilm

## Resumen

Este modelo es un fine-tuning de `sentence-transformers/all-MiniLM-L6-v2`, desarrollado por Shaurya2020, especializado en la recuperación semántica de rutas API del dominio allpanelexch9.co. Mapea consultas en lenguaje natural a endpoints concretos de esa API, generando embeddings densos de 384 dimensiones. Con 22,7 millones de parámetros y una ventana de contexto de 256 tokens, está diseñado para tareas de búsqueda semántica y similitud textual en un dominio muy específico.

El entrenamiento se realizó sobre un conjunto de datos JSON de solo 138 muestras, utilizando la función de pérdida MultipleNegativesRankingLoss, típica en sistemas de recuperación con pares consulta-documento. El resultado es un modelo que asocia expresiones como "auth 2fa authon" con el endpoint correcto (`POST https://allpanelexch9.co/api/front/authon`), lo que facilita la construcción de asistentes, documentación interactiva y sistemas de enrutamiento para esa API concreta.

Su relevancia radica en la especialización: en lugar de usar un modelo genérico de embeddings, este fine-tuning consigue una precisión top-1 del 85,7 % en el conjunto de validación declarado, algo que un modelo base no especializado difícilmente alcanzaría en este dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6-v2, 6 capas) |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MiniLM-L6-v2, un transformer BERT de 6 capas con 384 dimensiones de embedding, destilado por Microsoft mediante destilación de auto-atención profunda. La arquitectura completa, tal como se describe en la model card, incluye un transformer BERT para extracción de características, una capa de pooling por media (mean pooling) y una capa de normalización L2. La salida es un vector denso de 384 dimensiones normalizado, listo para comparación por similitud coseno.

El entrenamiento consistió en un fine-tuning del modelo base sobre un conjunto de datos JSON de 138 muestras, compuesto por rutas de la API de allpanelexch9.co. Se utilizó la función de pérdida MultipleNegativesRankingLoss, que optimiza el ranking de documentos relevantes frente a negativos dentro de un lote. No se dispone de información sobre el número de épocas, la tasa de aprendizaje, el tamaño de lote ni otros hiperparámetros del entrenamiento.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para texto.
- Búsqueda semántica de rutas API: asocia consultas en lenguaje natural con endpoints concretos.
- Similitud textual semántica mediante similitud coseno.
- Extracción de características (feature extraction) para tareas de clasificación y clustering.
- Soporte de los métodos `encode_query` y `encode_document` de sentence-transformers, optimizados para recuperación asimétrica.
- Capacidad multilingüe limitada: solo inglés (etiqueta "en").
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica de endpoints: un desarrollador puede consultar "auth 2fa authon" y obtener el endpoint correcto `POST https://allpanelexch9.co/api/front/authon`, gracias a los embeddings entrenados con la pérdida de ranking múltiple.
- Asistente virtual para soporte técnico de la API: el modelo clasifica la intención de una consulta de usuario y la enruta al endpoint correspondiente, reduciendo el tiempo de resolución de incidencias.
- Documentación interactiva de API: integrar el modelo en un buscador de documentación para que los usuarios encuentren rutas relevantes mediante lenguaje natural, en lugar de navegar por menús.
- Enrutamiento de consultas en chatbots: un bot puede usar los embeddings para decidir qué endpoint invocar según la petición del usuario, con una precisión top-1 declarada del 85,7 % en el conjunto de validación.
- Detección de duplicados en logs de API: al comparar embeddings de peticiones, se pueden identificar consultas redundantes o repetidas, útil para depuración y optimización.
- Automatización de pruebas de API: generar casos de prueba asociando descripciones funcionales a endpoints concretos mediante similitud coseno, facilitando la cobertura de rutas.
- Sistema de recomendación de endpoints: sugerir rutas relacionadas a partir de una consulta inicial, aprovechando la métrica NDCG@10 de 0,857 declarada por el autor.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de datos "allpanel api" (tarea de recuperación de información). Estos valores no están verificados de forma independiente y corresponden a un conjunto de datos muy reducido (138 muestras), por lo que deben interpretarse con cautela.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,857 |
| Cosine Accuracy@5 | 0,857 |
| Cosine Accuracy@10 | 0,857 |
| Cosine Precision@1 | 0,857 |
| Cosine Precision@3 | 0,857 |
| Cosine Precision@5 | 0,857 |
| Cosine Precision@10 | 0,857 |
| Cosine Recall@1 | 0,047 |
| Cosine Recall@3 | 0,140 |
| Cosine Recall@5 | 0,233 |
| Cosine Recall@10 | 0,466 |
| Cosine NDCG@10 | 0,857 |
| Cosine MRR@10 | 0,857 |
| Cosine MAP@100 | 0,847 |

## Requisitos de hardware

- VRAM estimada: menos de 200 MB en FP32 (22,7 millones de parámetros × 4 bytes ≈ 91 MB).
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM; también funciona correctamente en CPU.
- Compatible con GPU de consumo: sí, incluyendo RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: sentence-transformers, Hugging Face Text Embeddings Inference (TEI), endpoints compatibles con la infraestructura de Hugging Face.
- Latencia: muy baja, del orden de milisegundos en CPU moderna para frases cortas; no se dispone de cifras exactas.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Shaurya2020/allpanel-api-minilm | 22,7 M | 384 | 256 | Apache 2.0 | Fine-tuning específico para API de allpanelexch9.co |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 | Apache 2.0 | Modelo base genérico, sin especialización de dominio |

No se dispone de datos comparativos con otros modelos de embeddings como all-mpnet-base-v2 o bge-small-en-v1.5 en la información proporcionada.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (138 muestras), lo que limita la generalización a consultas fuera del dominio de la API de allpanelexch9.co.
- Modelo especializado exclusivamente en las rutas de allpanelexch9.co; no es adecuado para búsqueda semántica general ni para otros dominios.
- Solo soporta inglés; no hay capacidades multilingües.
- Ventana de contexto limitada a 256 tokens, insuficiente para documentos largos.
- Los benchmarks declarados no están verificados de forma independiente y se basan en un conjunto de datos muy pequeño, por lo que las métricas pueden no ser representativas.
- El dominio allpanelexch9.co corresponde a una plataforma de intercambio de apuestas; el uso del modelo debe cumplir con la normativa local aplicable.
- No es un modelo generativo: no produce texto, solo embeddings. No admite tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaurya2020/allpanel-api-minilm
- Modelo base all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentación de sentence-transformers: https://sbert.net
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Paper de MiniLM (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Sentence-BERT (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
