# NyayaLabs98/nyaya-reranker-mini-v1

## Resumen

Nyaya-Reranker-Mini-v1 es un cross-encoder de 118 millones de parámetros desarrollado por NyayaLabs98 (NyayaAI) para reordenar secciones de estatutos del derecho indio. El modelo parte de `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` y ha sido ajustado para puntuar la relevancia entre una pregunta formulada por un ciudadano y una sección concreta de la legislación vigente de la India. Resuelve el problema de la recuperación legal de precisión: cuando un sistema de retrieval genera una lista de candidatos mediante BM25, este modelo reordena el top-20 para acercar las secciones relevantes a las primeras posiciones.

Con 117,6 millones de parámetros y un tamaño de 0,5 GB, es una alternativa ligera frente a otros rerankers como `BAAI/bge-reranker-v2-m3` (568M), aunque el propio autor reconoce que es más débil en recall@1. Soporta inglés e hindi (incluido hinglish) y está pensado para integrarse en el proyecto Nyaya, un sistema de retrieval legal. Su relevancia actual radica en la necesidad de asistentes jurídicos accesibles para la ciudadanía india, que puedan responder preguntas en hindi sobre leyes como el Bharatiya Nyaya Sanhita (BNS), el Bharatiya Nagarik Suraksha Sanhita (BNSS) o el Bharatiya Sakshya Adhiniyam (BSA).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder Transformer (MiniLM de 12 capas, 384 dimensiones de embedding) |
| Parametros totales | 117.641.089 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length en el uso recomendado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | Ingles, hindi (incluye mezcla hinglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, un Transformer MiniLM de 12 capas y 384 dimensiones de embedding preentrenado en datos multilingues de recuperacion. A diferencia de un bi-encoder, el cross-encoder concatena pregunta y pasaje en una unica entrada y produce una puntuacion de relevancia directa, lo que proporciona mayor precision a costa de mayor coste computacional por consulta.

El ajuste fino se realizo sobre 21.668 tripletas (pregunta, texto de seccion, etiqueta) derivadas de 4.412 preguntas de entrenamiento. Cada pregunta aporta su seccion dorada como ejemplo positivo y cuatro de los veinte negativos duros generados por BM25 como ejemplos negativos. El entrenamiento uso `CrossEncoder.fit` con relevancia binaria, batch de 32, una sola epoca, 200 pasos de warm-up y precision mixta, completandose en 272 segundos en una GPU T4 de Kaggle. La perdida final de entrenamiento fue de 0.30. El texto del pasaje se construye como la concatenacion del nombre de la ley, el titulo de la seccion y los primeros 1.600 caracteres de la seccion.

## Capacidades

- Reranking de secciones de estatutos legales indios: dado un par pregunta-candidato, devuelve una puntuacion de relevancia.
- Reordenamiento del top-20 de BM25 en un pipeline de retrieval, mejorando el recall en las primeras posiciones.
- Soporte de entrada en ingles, hindi y mezclas hinglish, tanto en pregunta como en pasaje.
- Integracion con el repositorio Nyaya mediante el script `scripts/15_retrieval_recall.py --rerank`.
- Uso directo como objeto `CrossEncoder` de sentence-transformers para inferencia en Python.
- Compatibilidad con HuggingFace Text Embeddings Inference para despliegue como endpoint de ranking.
- No es un modelo generativo: no produce texto, solo puntuaciones de relevancia. No soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Asistente juridico para ciudadanos: el modelo puede integrarse en un chatbot que reciba preguntas en hindi sobre leyes indias y devuelva las secciones mas relevantes, reordenando los resultados de una busqueda inicial por BM25.
- RAG legal en organizaciones: en un sistema de generacion aumentada por recuperacion sobre legislacion india, el reranker selecciona las secciones correctas antes de pasarlas a un modelo de lenguaje, reduciendo la probabilidad de respuestas basadas en textos irrelevantes.
- Busqueda semantica en bases de datos legales: portales que indexan leyes como BNS, BNSS o BSA pueden usar el cross-encoder para mejorar la precision de sus resultados de busqueda, especialmente en consultas redactadas en lenguaje coloquial.
- Apoyo a investigacion juridica automatizada: investigadores que necesitan localizar articulos concretos entre decenas de miles de secciones pueden emplear el modelo para filtrar rapidamente los candidatos mas plausibles.
- Mejora de motores de busqueda en portales gubernamentales: instituciones que ofrecen acceso a legislacion pueden desplegar el reranker como capa de ordenacion para que los usuarios encuentren antes la norma exacta.
- Clasificacion de relevancia en sistemas de citacion legal: el modelo puede puntuar la relacion entre una consulta y multiples secciones para construir listas de referencias recomendadas en documentos juridicos o informes.

## Benchmarks y rendimiento

Los datos proceden de la model card y del README del autor. Los resultados se obtuvieron sobre el subconjunto "never-audited" de Nyaya-Eval-v1 (n=118), reordenando el top-20 de BM25. No estan verificados de forma independiente.

| Ranker sobre BM25 top-20 | Recall@1 | Recall@3 | Recall@5 | Recall@8 | Tamano | Latencia CPU (depth 20) |
|---|---:|---:|---:|---:|---:|---:|
| Sin reranker (orden BM25) | 45,8% | 61,0% | 74,6% | 81,4% | – | – |
| nyaya-reranker-mini-v1 | 51,7% | 70,3% | 76,3% | 82,2% | 118M | 3,2 s (Kaggle CPU) |
| bge-reranker-v2-m3 | 58,5% | 69,5% | 74,6% | 83,9% | 568M | mas lento |

El autor declara que el modelo mejora el recall@1 en 5,9 puntos sobre el orden original de BM25, pero queda 6,8 puntos por debajo de `bge-reranker-v2-m3` en recall@1. La latencia de 3,2 s en CPU es la razon por la que la demo web del proyecto sigue usando solo BM25.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 470 MB en FP32 y 235 MB en FP16. Cabe en cualquier GPU con mas de 1 GB de VRAM.
- GPUs recomendadas: T4 de Kaggle (usada en entrenamiento), RTX 3060 o superiores. En CPU es viable para lotes pequenos, con una latencia de 3,2 s para 20 candidatos.
- Despliegue en consumer GPU: si, es un modelo pequeno que se ejecuta sin problemas en GPUs de gama media o incluso en CPU para aplicaciones con baja concurrencia.
- Opciones de despliegue: sentence-transformers (inferencia directa), HuggingFace Text Embeddings Inference (endpoints_compatible) para servir como API de ranking, o un contenedor FastAPI propio. No es compatible con llama.cpp ni vLLM al no ser un modelo generativo.
- Latencia: en CPU con 20 candidatos, 3,2 s por consulta. En GPU T4, la latencia se reduce de forma significativa, aunque no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall@1 (n=118) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| nyaya-reranker-mini-v1 | 118M | 512 tokens | 51,7% | Apache-2.0 | HuggingFace |
| bge-reranker-v2-m3 | 568M | no disponible | 58,5% | no disponible (no se indica en la informacion) | HuggingFace |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 (base) | 118M | 512 tokens | no disponible (sin fine-tuning) | Apache-2.0 | HuggingFace |

El modelo base sin ajuste no tiene benchmarks publicados para esta tarea. `bge-reranker-v2-m3` es la alternativa mas potente citada por el autor, pero es cuatro veces mayor y mas lenta. No se dispone de datos de licencia para `bge-reranker-v2-m3` en la informacion proporcionada.

## Limitaciones y advertencias

- No es asesoramiento legal: el modelo solo ordena secciones; la interpretacion y aplicacion de la ley corresponde a un abogado colegiado.
- Dependencia de los candidatos iniciales: no puede recuperar secciones que no esten dentro del top-20 de BM25, por lo que su rendimiento esta limitado por la calidad de la busqueda previa.
- Rendimiento inferior a `bge-reranker-v2-m3` en recall@1 (6,8 puntos menos). El autor recomienda usar bge cuando el presupuesto computacional lo permita.
- Cobertura legal limitada: fue entrenado solo sobre 27 leyes y la Constitucion india. Puede fallar en consultas sobre legislacion no incluida en el dataset de entrenamiento.
- Benchmarks no verificados: los resultados proceden de un subconjunto pequeno (n=118) marcado como "never-audited" y no han sido validados por terceros.
- Latencia alta en CPU: 3,2 s por consulta con 20 candidatos en una CPU de Kaggle, lo que dificulta su uso en aplicaciones interactivas sin aceleracion por GPU.
- Idiomas restringidos: solo soporta ingles e hindi. No cubre otras lenguas de la India ni otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NyayaLabs98/nyaya-reranker-mini-v1
- Dataset de estatutos: https://huggingface.co/datasets/NyayaLabs98/nyaya-statute-db
- Repositorio del proyecto Nyaya: https://github.com/JitendraJha98/nyaya-model
