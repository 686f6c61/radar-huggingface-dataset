# NostraEmpire/mirror-mxbai-embed-large-v1

## Resumen

`NostraEmpire/mirror-mxbai-embed-large-v1` es un espejo (mirror) del modelo `mxbai-embed-large-v1` desarrollado originalmente por Mixedbread AI. Se trata de un modelo de embeddings de texto en inglés basado en arquitectura BERT, con 335 millones de parámetros, diseñado para convertir frases y párrafos en vectores densos de alta calidad. Su principal valor es ofrecer un rendimiento competitivo en tareas de recuperación semántica, similitud y clasificación, superando según sus autores a modelos propietarios como `text-embedding-v3` de OpenAI en varios benchmarks MTEB.

Este mirror, publicado por NostraEmpire, no introduce cambios sobre el modelo original, pero facilita su distribución y uso en entornos que requieren formatos adicionales (ONNX, OpenVINO, GGUF, Transformers.js). La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para proyectos de producción que necesitan embeddings locales sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 335.141.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors, GGUF, ONNX, OpenVINO) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF, ONNX, OpenVINO, Transformers.js |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT (encoder transformer) con 335 millones de parámetros, optimizado para generar representaciones vectoriales de texto. El entrenamiento original, realizado por Mixedbread AI, se basó en técnicas de aprendizaje contrastivo sobre pares de frases, aunque los detalles exactos del dataset y el número de tokens no se han especificado en la información disponible. El modelo está pensado para ser usado con la librería `sentence-transformers`, que simplifica la generación de embeddings y el cálculo de similitud coseno.

Al ser un mirror, no incorpora innovaciones técnicas adicionales sobre el modelo original. La referencia al paper `arxiv:2309.12871` en las etiquetas sugiere que el modelo se basa en investigaciones previas sobre embeddings, pero no se ha confirmado qué documento concreto es.

## Capacidades

- Generacion de embeddings de texto en ingles para frases, parrafos y documentos cortos.
- Similitud semantica mediante similitud coseno o distancia euclidiana.
- Recuperacion de informacion (retrieval) y busqueda semantica.
- Clasificacion de texto (por ejemplo, analisis de sentimiento, deteccion de intencion).
- Clustering y agrupacion de documentos por similitud.
- Reranking de resultados de busqueda.
- Compatible con pipelines de `sentence-transformers`, `transformers.js` y `text-embeddings-inference`.
- No soporta tool calling, agentes ni generacion de texto; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en bases de conocimiento: indexar documentos y consultas con el modelo, y recuperar los mas relevantes por similitud coseno. Adecuado por su alta precision en retrieval (p. ej., NDCG@10 de 66.02 en ArguAna).
- Sistemas RAG (generacion aumentada por recuperacion): generar embeddings de fragmentos de documentos para alimentar un pipeline de recuperacion antes de la generacion con un LLM. Su tamano moderado permite ejecutarlo en CPU.
- Clasificacion de tickets de soporte: asignar automaticamente categorias a mensajes de clientes usando embeddings y un clasificador simple. El modelo alcanza un 87.8% de exactitud en Banking77.
- Deduplicacion de documentos: detectar duplicados o casi duplicados en grandes corpus mediante comparacion de vectores.
- Moderacion de contenido: clasificar comentarios o publicaciones en categorias predefinidas (p. ej., toxicidad) usando embeddings como caracteristicas.
- Reranking de resultados: combinar con un primer filtro basado en palabras clave y luego rerankear con el modelo para mejorar la precision final.
- Analisis de sentimiento en resenas de productos: el modelo muestra buena exactitud en Amazon Polarity (93.84%), util para monitorizar opiniones.

## Benchmarks y rendimiento

Los siguientes resultados provienen del model-index declarado por el autor del modelo original (Mixedbread AI) y se reproducen tal cual. No se han verificado de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificacion | AmazonCounterfactual (en) | accuracy | 75.04 |
| Clasificacion | AmazonCounterfactual (en) | f1 | 68.93 |
| Clasificacion | AmazonPolarity | accuracy | 93.84 |
| Clasificacion | AmazonPolarity | f1 | 93.83 |
| Clasificacion | AmazonReviews (en) | accuracy | 49.18 |
| Clasificacion | AmazonReviews (en) | f1 | 48.74 |
| Recuperacion | ArguAna | ndcg_at_10 | 66.02 |
| Recuperacion | ArguAna | recall_at_10 | 91.89 |
| Clustering | ArxivClusteringP2P | v_measure | 48.97 |
| Clustering | ArxivClusteringS2S | v_measure | 42.98 |
| Reranking | AskUbuntuDupQuestions | map | 65.16 |
| Reranking | AskUbuntuDupQuestions | mrr | 78.24 |
| STS | BIOSSES | cos_sim_spearman | 88.41 |
| Clasificacion | Banking77 | accuracy | 87.82 |
| Clasificacion | Banking77 | f1 | 87.80 |
| Clustering | BiorxivClusteringP2P | v_measure | 39.92 |
| Clustering | BiorxivClusteringS2S | v_measure | 36.73 |
| Recuperacion | CQADupstackAndroid | ndcg_at_10 | 50.06 (valor parcial, no completo) |

No se dispone de una puntuacion agregada de MTEB en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 335M parametros, en precision FP32 ocupa aproximadamente 1.34 GB. Con cuantizacion a 8 bits (int8) se reduce a unos 0.67 GB, y en 4 bits a unos 0.34 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060 o superiores funcionan sin problemas. Tambien puede ejecutarse en CPU con razonable latencia.
- Cabe en GPUs de consumo: si, incluso en tarjetas integradas o en CPU pura.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` (TGI), `llama.cpp` (via GGUF), `Ollama` (si se convierte), `ONNX Runtime`, `OpenVINO` y `Transformers.js` para navegador.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, se pueden procesar cientos de frases por segundo; en CPU, decenas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mxbai-embed-large-v1 (este mirror) | 335M | no disponible | en | Apache 2.0 | Alto rendimiento en MTEB, supera a OpenAI text-embedding-v3 segun sus autores |
| BAAI/bge-large-en-v1.5 | 335M | 512 | en | MIT | Modelo de referencia en retrieval, similar en tamano |
| sentence-transformers/all-MiniLM-L6-v2 | 22.7M | 256 | multi | Apache 2.0 | Mucho mas pequeno, menor precision pero muy rapido |
| intfloat/e5-large-v2 | 335M | 512 | en | MIT | Competidor directo, bueno en retrieval y STS |

No se dispone de comparativas numericas directas en la informacion proporcionada, pero el modelo original se posiciona como uno de los mejores en su categoria de tamano.

## Limitaciones y advertencias

- Solo soporta ingles; no es util para textos en otros idiomas.
- Longitud de contexto limitada (no especificada, pero tipicamente 512 tokens en modelos BERT de este tamano). Documentos mas largos deben truncarse o dividirse.
- Puede presentar sesgos presentes en los datos de entrenamiento, especialmente en tareas de clasificacion de contenido sensible.
- Riesgo de alucinacion no aplica (no genera texto), pero los embeddings pueden producir falsos positivos en busquedas de similitud si los textos son muy diferentes en superficie pero similares en significado.
- Al ser un mirror, no hay garantia de mantenimiento o soporte por parte de NostraEmpire; se recomienda usar el repositorio original para actualizaciones.
- No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineacion, lo que dificulta evaluar su robustez en dominios especializados.

## Enlaces

- Repositorio mirror: https://huggingface.co/NostraEmpire/mirror-mxbai-embed-large-v1
- Repositorio original: https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1
- Blog de Mixedbread AI sobre el modelo: https://www.mixedbread.com/blog/mxbai-embed-large-v1
- Articulo de Makia AI con instrucciones de instalacion: https://makiai.com/en/what-it-is-and-how-to-install-and-run-locally-the-llm-ai-mxbai-embed-large/
- Ficha en local-llm.net: https://www.local-llm.net/models/mxbai-embed-large/
