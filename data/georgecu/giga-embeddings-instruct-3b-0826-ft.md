# GeorgeCU/Giga-Embeddings-instruct-3B-0826-ft

## Resumen

Giga-Embeddings-instruct-3B-0826-ft es un modelo de embeddings textuales bilingüe (ruso e inglés) desarrollado por GeorgeCU (Georgiy Tebelev) como la siguiente iteración de la serie Giga-Embeddings. Está basado en una arquitectura Qwen3 modificada: el self-attention se ha convertido en bidireccional (estilo encoder) para producir representaciones densas de frases y párrafos. El modelo genera embeddings de 2048 dimensiones mediante mean pooling y L2-normalización, y ha sido entrenado con pérdida contrastiva InfoNCE en un estilo instructivo, lo que permite adaptar la representación a tareas específicas mediante instrucciones en el prompt.

El modelo resuelve problemas de retrieval, similitud semántica, clasificación y clustering, con un rendimiento notable en benchmarks MTEB: 74.57 en ruso, 71.93 en inglés, 76.93 en código y 63.9 en multilingüe. Su relevancia actual radica en que supera claramente a la versión anterior de 3B en tareas de código (+14.56 puntos) y multilingües (+8.39 puntos), acercándose al modelo de 10B con parámetros activos de 1.8B, pero con un coste computacional menor. Los pesos se distribuyen en formato bfloat16 con licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 modificada (bidireccional, encoder-style) |
| Parametros totales | 3.150.605.312 (~3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo anterior de la serie soportaba 4096 tokens) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de un LLM preentrenado propio con arquitectura Qwen3: 36 capas, dimensión oculta de 2048, 16 cabezas de atención con 8 cabezas KV y head_dim de 128. La innovación principal es que el self-attention se ha convertido en bidireccional (estilo encoder), eliminando el masking causal típico de los decoders para permitir que cada token atienda a todo el contexto. Esto lo convierte en un modelo de embeddings puro, no generativo.

El entrenamiento se realizó con una función de pérdida contrastiva InfoNCE, combinada con mean pooling sobre los tokens no padding y L2-normalización de los vectores resultantes. El modelo se entrenó en estilo instructivo: para tareas asimétricas (como retrieval) se debe anteponer una instrucción al query, mientras que los documentos se codifican sin instrucción. Esta técnica permite adaptar la representación a la tarea específica sin necesidad de fine-tuning adicional. No se han publicado detalles sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de embeddings densos de 2048 dimensiones para texto en ruso e ingles.
- Retrieval y busqueda semantica: soporta tareas asimetricas con instrucciones en el query.
- Similitud semantica (STS) y deduplicacion de documentos.
- Clasificacion de texto y clustering basado en representaciones vectoriales.
- Codigo: rendimiento destacado en MTEB code (76.93), lo que sugiere buena capacidad para representar fragmentos de codigo.
- Multilingue: aunque solo cubre ru/en, obtiene 63.9 en MTEB multilingual, lo que indica transferencia a otros idiomas.
- No soporta generacion de texto, tool calling ni funciones de agente; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en corpus rusos e ingleses: se pueden indexar documentos con el modelo y realizar consultas con instrucciones especificas (p. ej., "Instruct: dado un query de busqueda, recupera pasajes relevantes"). Adecuado por su alto rendimiento en MTEB retrieval y su capacidad bilingue.
- Sistemas RAG en produccion: el modelo puede integrarse en pipelines de retrieval aumentado por generacion, codificando tanto documentos como queries. Su velocidad de inferencia (87-91k tokens/s con vLLM) permite servir en tiempo real.
- Deduplicacion de documentos y limpieza de datos: comparando embeddings de pares de textos con similitud coseno, se pueden identificar duplicados en grandes colecciones. El modelo es adecuado por su robustez en tareas simetricas sin necesidad de instrucciones.
- Clasificacion de tickets de soporte o textos cortos: convirtiendo cada texto en un vector de 2048 dimensiones y usando un clasificador lineal sobre los embeddings. Su rendimiento en MTEB classification lo hace viable para entornos bilingues.
- Clustering de articulos cientificos o noticias: agrupando embeddings con algoritmos como k-means o HDBSCAN. La dimension de 2048 y la normalizacion L2 facilitan la separacion de topicos.
- Analisis de similitud entre fragmentos de codigo: gracias a su alto score en MTEB code (76.93), puede usarse para buscar codigo similar, detectar patrones o recomendar ejemplos en repositorios.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en MTEB (Media de tareas, valores agregados):

| Benchmark | Giga-Embeddings-instruct-3B (anterior) | Giga-Embeddings-instruct-3B-0826 | Giga-Embeddings-instruct-10B-A1.8B-0826 |
|---|---|---|---|
| MTEB (ruso) | 74.16 | 74.57 | 74.99 |
| MTEB (ingles) | 71.07 | 71.93 | 72.23 |
| MTEB (codigo) | 62.37 | 76.93 | 78.40 |
| MTEB (multilingue) | 55.51 | 63.90 | 65.60 |

El modelo de 3B-0826 supera a la version anterior en todas las categorias, especialmente en codigo (+14.56) y multilingue (+8.39). Se queda a menos de 2 puntos del modelo de 10B con parametros activos de 1.8B, lo que indica una relacion rendimiento/coste muy favorable.

En cuanto a throughput con backend vLLM, se reportan los siguientes valores:

| Backend | 512 tokens | 1024 tokens | 2048 tokens | Throughput relativo vs 10B-A1.8B |
|---|---|---|---|---|
| Giga-Embeddings-instruct-3B-0826 / vLLM | 87.9k/s | 91.5k/s | 90.4k/s | 0.8x |
| Giga-Embeddings-instruct-10B-A1.8B-0826 / vLLM | 112.6k/s | 114.5k/s | 102.3k/s | 1.0x |

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 6.3 GB (3.15B parametros × 2 bytes). Con overhead de inferencia, se recomienda al menos 8-10 GB de VRAM para cargar el modelo completo.
- GPU compatibles: cabe en GPUs de consumo como RTX 3090 (24 GB), RTX 4090 (24 GB) o RTX 4080 (16 GB). Tambien en GPUs profesionales como A10G o L4 (24 GB).
- Opciones de despliegue: sentence-transformers (inferencia sencilla), vLLM (alto throughput, como se muestra en la tabla), y posiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no esta confirmado.
- Latencia y throughput: con vLLM se alcanzan entre 87.9k y 91.5k tokens por segundo para secuencias de hasta 2048 tokens en hardware no especificado. La latencia por consulta sera inferior a 50 ms en GPU moderna.
- Para tareas de batch (indexado de corpus) se recomienda GPU con al menos 24 GB para procesar multiples secuencias simultaneamente.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto maximo | Idiomas | MTEB (multilingue) | Licencia |
|---|---|---|---|---|---|---|
| Giga-Embeddings-instruct-3B-0826 | ~3B | 2048 | No disponible | ru, en | 63.90 | MIT |
| Giga-Embeddings-instruct (ai-sage, anterior) | 3.2B | 2048 | 4096 | ru, en | 55.51 | MIT |
| Giga-Embeddings-instruct-10B-A1.8B-0826 | 10B total / 1.8B activos | 2048 | No disponible | ru, en | 65.60 | MIT |

La comparativa se limita a la propia serie Giga-Embeddings, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada. El modelo de 3B-0826 mejora sustancialmente a la version anterior y se acerca al rendimiento del modelo de 10B con un coste de parametros mucho menor.

## Limitaciones y advertencias

- Solo cubre ruso e ingles; no hay soporte oficial para otros idiomas, aunque el rendimiento en MTEB multilingual sugiere cierta transferencia.
- La longitud de contexto no esta documentada en la model card; se recomienda verificar antes de usar con secuencias largas. El modelo anterior soportaba 4096 tokens, pero no se confirma para esta version.
- El uso de pooling incorrecto (CLS o last-token) produce resultados erroneos; es obligatorio usar mean pooling + L2-normalizacion.
- Para tareas asimetricas es imprescindible seguir el formato de instrucciones; omitirlas degrada significativamente el rendimiento en retrieval.
- No es un modelo generativo: no puede producir texto, solo representaciones vectoriales.
- Al ser un modelo de embeddings, no aplican riesgos de alucinacion textual, pero si puede haber sesgos en las representaciones derivados de los datos de entrenamiento (no documentados).
- La licencia MIT permite uso comercial sin restricciones, pero se debe atribuir correctamente la autoría.
- El tag arxiv:2608.23806 sugiere un paper asociado, pero no se ha encontrado el enlace directo; se recomienda consultar la publicacion para detalles tecnicos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GeorgeCU/Giga-Embeddings-instruct-3B-0826-ft
- Perfil del autor: https://huggingface.co/GeorgeCU
- Datasets del autor: https://huggingface.co/GeorgeCU/datasets
- Modelo anterior de la serie (ai-sage): https://huggingface.co/ai-sage/Giga-Embeddings-instruct
- Ficha en MTEB Leaderboard del modelo anterior: https://leaderboard.mteb.org/models/ai-sage/Giga-Embeddings-instruct
- Paper asociado (referencia arxiv:2608.23806, enlace directo no verificado): https://arxiv.org/abs/2608.23806
