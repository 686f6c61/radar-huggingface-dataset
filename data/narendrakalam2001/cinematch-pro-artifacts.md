# narendrakalam2001/cinematch-pro-artifacts

## Resumen

CineMatch Pro — trained artifacts es un repositorio de artefactos entrenados (no un modelo único) que da soporte a CineMatch Pro, una plataforma de recomendación de películas y análisis de reseñas. Lo publica Narendra Kalam (usuario `narendrakalam2001`) como parte de un proyecto de portfolio no comercial. El repositorio empaqueta un filtro colaborativo SVD, un filtro de contenido TF-IDF, un índice FAISS de embeddings visuales de pósters, un modelo RoBERTa de análisis de sentimiento afinado y un índice ChromaDB de tramas de películas.

El problema que resuelve es la orquestación de un sistema de recomendación híbrido con búsqueda visual y análisis de opiniones: en lugar de un transformer generativo, ofrece piezas de recuperación (retrieval) y clasificación listas para cargar desde el código del proyecto. Su relevancia es acotada: sirve como referencia reproducible para construir un recomendador multimodal con datos de MovieLens y TMDB, no como modelo de lenguaje de propósito general.

El repositorio pesa 1,2 GB y contiene pesos en safetensors, pickles de scikit-learn y scikit-surprise, índices FAISS y un almacén ChromaDB. No se declaran idiomas soportados ni pipeline de Hugging Face, y la licencia es «other», sujeta a las condiciones de la licencia de investigación de MovieLens (uso no comercial).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: SVD (filtrado colaborativo), TF-IDF (contenido), FAISS IndexFlatIP sobre CLIP ViT-B/32, RoBERTa base (sentimiento), ChromaDB sobre all-MiniLM-L6-v2 |
| Parametros totales | No disponible (el componente mayor es RoBERTa base, ~125 M; CLIP ViT-B/32, ~88 M; all-MiniLM-L6-v2, ~22 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (RoBERTa base: 512 tokens; all-MiniLM-L6-v2: 256 tokens) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible (los datos de entrenamiento son reseñas y metadatos en inglés) |
| Licencia | other (uso no comercial, derivada de la licencia de investigación de MovieLens 25M) |
| Formato de pesos | safetensors, pickle (.pkl), índices FAISS (.index), almacén ChromaDB |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena un transformer único, sino que agrupa cinco componentes con arquitecturas distintas. El filtro colaborativo es un SVD de 100 factores de scikit-surprise, entrenado sobre 5.000.000 de valoraciones de MovieLens-25M, con un RMSE de 0,8005. El filtro de contenido usa una matriz TF-IDF y su vectorizador sobre 62.423 películas. La búsqueda visual se apoya en un índice FAISS `IndexFlatIP` de 56.029 embeddings de pósters CLIP ViT-B/32 de 512 dimensiones. El análisis de sentimiento parte de `cardiffnlp/twitter-roberta-base-sentiment`, afinado sobre 50.000 reseñas de IMDB, con accuracy del 94,26 % y F1 de 94,29 %. Por último, ChromaDB indexa 52.703 tramas de películas mediante embeddings de `all-MiniLM-L6-v2`.

Los datos provienen de MovieLens 25M (GroupLens Research, Universidad de Minnesota), metadatos y créditos de TMDB, el conjunto IMDB 50K de reseñas y un dataset de pósters de Kaggle. No se documenta el uso de RLHF ni DPO, ni innovaciones como decodificación especulativa o atención lineal; el interés técnico está en la combinación de recuperación densa (FAISS, ChromaDB) con filtrado colaborativo clásico. Las versiones de las librerías de entrenamiento son numpy 2.1.3, scikit-learn 1.6.1, scikit-surprise 1.1.5, transformers 5.16.1 y chromadb 1.5.9, y deben respetarse para cargar los pickles y el almacén Chroma.

## Capacidades

- Recomendación híbrida de películas: combina filtrado colaborativo SVD con similitud de contenido TF-IDF sobre 62.423 títulos.
- Búsqueda visual por póster: recuperación de vecinos más próximos sobre 56.029 embeddings CLIP ViT-B/32 de 512 dimensiones mediante FAISS.
- Análisis de sentimiento de reseñas: clasificación binaria/polar con RoBERTa afinado (accuracy 94,26 % sobre IMDB).
- Recuperación semántica de tramas: búsqueda por similitud sobre 52.703 sinopsis indexadas en ChromaDB con all-MiniLM-L6-v2.
- Catálogo procesado: parquet con identificadores, títulos y géneros de MovieLens fusionados con metadatos de TMDB.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto libre, visión de propósito general ni modo thinking.
- Capacidades multilingües: no disponibles; el material de entrenamiento está en inglés.

## Casos de uso

- Motor de recomendación de películas en producción: el SVD de 100 factores y el TF-IDF permiten generar listas personalizadas combinando señales de usuario y similitud de contenido, con un RMSE de referencia de 0,8005.
- Búsqueda visual «encuentra películas parecidas a este póster»: el índice FAISS sobre embeddings CLIP ViT-B/32 devuelve vecinos por similitud de coseno en milisegundos para una consulta de imagen.
- Análisis de opiniones a escala: el RoBERTa afinado clasifica reseñas de usuarios para alimentar paneles de satisfacción o alertas de recepción negativa.
- Asistente conversacional de descubrimiento (CineBot): la recuperación semántica sobre tramas en ChromaDB permite responder «películas sobre X» sin depender de coincidencia exacta de palabras.
- Enriquecimiento de catálogo: el parquet procesado sirve para cruzar géneros, títulos y metadatos TMDB en pipelines de datos analíticos.
- Prototipado académico de sistemas de recomendación: el repositorio es una base reproducible para comparar filtrado colaborativo, contenido y recuperación densa sobre MovieLens-25M.
- Demo de portfolio o docencia: permite montar una aplicación completa de recomendación multimodal sin entrenar desde cero, cargando los artefactos con `ensure_artifacts`.

## Benchmarks y rendimiento

| Componente | Metrica | Valor |
|---|---|---|
| SVD (scikit-surprise) | RMSE sobre MovieLens-25M (5 M de valoraciones) | 0,8005 |
| RoBERTa de sentimiento | Accuracy sobre IMDB 50K | 94,26 % |
| RoBERTa de sentimiento | F1 sobre IMDB 50K | 94,29 % |
| FAISS / CLIP / ChromaDB | Metricas de recuperación publicadas | No disponibles |

No se han publicado resultados de benchmarks de recuperación (recall@k, nDCG, mAP) ni comparativas con otros sistemas de recomendación en la información disponible.

## Requisitos de hardware

- VRAM estimada: los componentes de deep learning son ligeros; RoBERTa base (~125 M) y CLIP ViT-B/32 (~88 M) caben en GPUs de 4-6 GB en fp16, y all-MiniLM-L6-v2 (~22 M) en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; A100 o H100 solo aportan ventaja en indexación masiva o batch.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 6 GB o más; también puede ejecutarse en CPU para los componentes no neuronales (SVD, TF-IDF, FAISS).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el proyecto carga los artefactos mediante su propio módulo `src/artifact_store.py` y requiere las versiones exactas de numpy, scikit-learn, scikit-surprise, transformers y chromadb.
- Latencia y throughput: no disponibles. El índice FAISS `IndexFlatIP` sobre 56.029 vectores de 512 dimensiones es una búsqueda exacta, adecuada para volúmenes moderados pero no para búsqueda aproximada a gran escala.
- Almacenamiento: 1,2 GB de repositorio, más el espacio de la caché de Hugging Face y de las dependencias.

## Comparativa con modelos similares

| Sistema | Enfoque | Datos | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CineMatch Pro artifacts | Híbrido SVD + TF-IDF + FAISS/CLIP + RoBERTa + ChromaDB | MovieLens-25M, TMDB, IMDB 50K, pósters | RMSE 0,8005; accuracy 94,26 % | other (no comercial) | Hugging Face, 0 descargas |
| CineMatch AI (nersu-abhinav) | Vecinos próximos de alta dimensión sobre 29 M de valoraciones | 29 M de valoraciones | No disponibles | No disponible | Demo web en GitHub Pages |
| Recomendadores MovieLens con Surprise (referencia) | SVD, KNN, Slope One sobre MovieLens | MovieLens 100K/1M/25M | RMSE variable según configuración | BSD (biblioteca) | PyPI, código abierto |
| Sistemas de recuperación con CLIP + FAISS (genéricos) | Búsqueda visual densa | Depende del corpus | No aplica | MIT/BSD según implementación | Código abierto |

La comparativa directa es limitada: no hay benchmarks de recuperación publicados y las alternativas de la misma categoría (sistemas de recomendación multimodales) no ofrecen métricas homogéneas. Los modelos de lenguaje generativos no son comparables porque este repositorio no genera texto.

## Limitaciones y advertencias

- Sesgo de popularidad: el filtrado colaborativo sobre MovieLens-25M favorece títulos muy valorados y penaliza el catálogo de nicho, como reconoce el propio autor.
- Sentimiento binario: el clasificador RoBERTa se limita a polaridad y no captura emociones matizadas ni análisis por aspectos pese a la etiqueta «aspect-based».
- Búsqueda visual cualitativa: el autor la describe como cualitativa; los embeddings CLIP de pósters no garantizan precisión semántica fina.
- Licencia restrictiva: derivada de la licencia de investigación de MovieLens, uso no comercial, con obligación de citar a Harper y Konstan (2015) y sin aval implícito de la Universidad de Minnesota ni de GroupLens.
- Uso de TMDB: el producto no está avalado ni certificado por TMDB; deben respetarse sus términos de atribución.
- Dependencia de versiones exactas: los pickles y el almacén Chroma requieren numpy 2.1.3, scikit-learn 1.6.1, scikit-surprise 1.1.5, transformers 5.16.1 y chromadb 1.5.9; otras versiones pueden romper la carga.
- Idiomas: no se declaran; el material de entrenamiento está en inglés, por lo que el rendimiento en castellano no está validado.
- Sin mantenimiento ni tracción: 0 descargas y 0 likes, creado en octubre de 2026 y actualizado en noviembre de 2026; no es un artefacto con soporte de producción.
- Riesgo de alucinación: no aplica a generación de texto, pero la recuperación puede devolver vecinos irrelevantes sin umbral de confianza documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/narendrakalam2001/cinematch-pro-artifacts
- Perfil del autor: https://huggingface.co/narendrakalam2001/models
- Proyecto CineMatch Pro (GitHub): https://github.com/narendrakalam2001/cinematch-pro
- Limitaciones y uso responsable del proyecto: https://github.com/narendrakalam2001/cinematch-pro#️-limitations--responsible-use
- CineMatch AI (proyecto relacionado): https://nersu-abhinav.github.io/CineMatch-AI/
- MovieLens 25M (GroupLens): https://grouplens.org/datasets/movielens/25m/
- Paper de MovieLens: Harper, F. M. y Konstan, J. A. (2015), «The MovieLens Datasets: History and Context», ACM TiiS 5(4)
- Modelo base de sentimiento: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment
- Modelo de embeddings de tramas: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- CLIP ViT-B/32 (OpenAI): https://huggingface.co/openai/clip-vit-base-patch32
- FAISS: https://github.com/facebookresearch/faiss
- ChromaDB: https://www.trychroma.com/
