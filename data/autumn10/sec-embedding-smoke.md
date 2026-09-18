# autumn10/sec-embedding-smoke

## Resumen

autumn10/sec-embedding-smoke es un modelo de embeddings de frases publicado en Hugging Face por el usuario autumn10, obtenido mediante ajuste fino del modelo unsloth/bge-m3. No es un modelo generativo: su salida es un vector denso que representa el significado de una frase, y su tarea declarada es la similitud semántica y la extracción de características (pipeline `sentence-similarity`). La arquitectura subyacente es la del modelo base, un transformer encoder de la familia XLM-RoBERTa, empaquetado con la librería `sentence-transformers` y pesos en formato safetensors.

El propio identificador del repositorio ("smoke") y sus metadatos apuntan a que se trata de una prueba de humo más que de un modelo destinado a producción: el entrenamiento se realizó sobre un conjunto declarado de 50 ejemplos (`dataset_size:50`), el repositorio acumula 0 descargas y 0 "likes", y las fechas de creación y actualización están separadas por apenas tres segundos. Las funciones de pérdida empleadas son `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`, habituales en el ajuste fino de recuperación densa.

Su interés práctico es doble. Por un lado, sirve como plantilla reproducible para verificar que una canalización de fine-tuning de BGE-M3 funciona de extremo a extremo antes de lanzar un entrenamiento a gran escala. Por otro, los ejemplos del widget de la model card muestran consultas en vietnamita enfrentadas a descripciones de vulnerabilidades CVE en inglés, lo que sugiere una especialización incipiente en recuperación de información de seguridad. En cualquier caso, el volumen de datos de entrenamiento y la ausencia de licencia declarada impiden considerarlo un modelo listo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa, empaquetado como SentenceTransformer (modelo denso de embeddings) |
| Parámetros totales | No disponible en la información proporcionada (el modelo base, BGE-M3, ronda los 568 M de parámetros según su documentación pública) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha del modelo (el modelo base BGE-M3 admite hasta 8192 tokens según su documentación pública) |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible como metadato. Los ejemplos de la model card combinan consultas en vietnamita con documentos en inglés |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base BAAI/bge-m3 se publica bajo licencia MIT según su model card pública) |
| Formato de pesos | safetensors |
| Modelo base | unsloth/bge-m3 (ajuste fino, `base_model:finetune:unsloth/bge-m3`) |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity, feature-extraction |
| Dimensión de embeddings | No disponible |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-17T23:34:41Z |
| Última actualización | 2026-09-17T23:34:44Z |

## Arquitectura y entrenamiento

El modelo es un codificador transformer bidireccional de tipo XLM-RoBERTa, la arquitectura sobre la que se construye BGE-M3, adaptado a la interfaz de `sentence-transformers` para producir embeddings de frase mediante pooling. No incorpora mecanismos de mezcla de expertos, atención lineal ni decodificación especulativa: es un encoder denso estándar orientado a recuperación. El repositorio ocupa 0,2 GB y la única información sobre pesos es el tag `safetensors`; no se documenta la dimensión del vector de salida ni la longitud máxima de secuencia configurada.

El entrenamiento se realizó con dos funciones de pérdida de tipo contrastivo: `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`, ambas variantes de negativos en lote que optimizan similitud coseno entre pares consulta-documento. El conjunto de datos declarado tiene 50 ejemplos (tag `dataset_size:50`), una cifra compatible con una prueba de humo y no con un ajuste fino orientado a producción. La model card no detalla la composición del dataset ni si hubo etapas de RLHF, DPO u otro tipo de alineación, algo que tampoco aplica estrictamente a un modelo de embeddings. Tampoco se especifica el número total de tokens vistos ni la estrategia de muestreo de negativos duros.

## Capacidades

- Generación de embeddings de frase densos para tareas de similitud semántica y recuperación de información.
- Búsqueda semántica consulta-documento: los ejemplos de la model card devuelven descripciones de CVE ordenadas por similitud con la consulta.
- Extracción de características (`feature-extraction`): el modelo expone representaciones intermedias utilizables como entrada de otros clasificadores.
- Capacidad multilingüe potencial, heredada del modelo base: la model card enfrenta consultas en vietnamita a documentos en inglés, lo que indica entrenamiento o evaluación con pares cross-lingüe.
- Uso con Text Embeddings Inference (TEI) e integración declarada como compatible con Inference Endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No dispone de modo "thinking", visión, audio ni salida de texto.

## Casos de uso

- Recuperación de vulnerabilidades CVE: indexar descripciones de CVE en una base vectorial y recuperar las entradas relevantes a partir de una consulta en lenguaje natural, tal como ilustra el widget de la model card con consultas en vietnamita sobre descripciones en inglés.
- Búsqueda semántica multilingüe sobre documentación de seguridad: permitir consultas en un idioma distinto al del corpus indexado, aprovechando la base multilingüe de BGE-M3 sin traducir previamente los documentos.
- Deduplicación y agrupamiento de avisos de seguridad: calcular similitud coseno entre avisos para detectar entradas duplicadas o casi duplicadas en una base de conocimiento de vulnerabilidades.
- Enrutado de tickets en un SOC: convertir el texto de una alerta en un embedding y asignarlo al equipo o playbook correspondiente mediante comparación contra un conjunto de ejemplos etiquetados.
- Recuperación aumentada (RAG) sobre documentación interna técnica: usar los embeddings como recuperador denso en una canalización que alimente a un modelo generativo, siempre que se sustituya por una versión validada del modelo base.
- Filtrado de logs y alertas por similitud: descartar o agrupar alertas repetitivas comparando sus representaciones vectoriales contra un catálogo de patrones conocidos.
- Verificación de canalizaciones de fine-tuning: servir como prueba de humo en integración continua para comprobar que el pipeline de entrenamiento, serialización y carga de un BGE-M3 ajustado funciona correctamente antes de un entrenamiento con datos reales.
- Clasificación por vecino más cercano con pocos ejemplos: dado el tamaño reducido del ajuste, el modelo puede emplearse como extractor de características congelado y combinarse con un clasificador lineal entrenado aparte.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el `model-index`, todos ellos marcados como no verificados (`verified: false`) y evaluados sobre un conjunto denominado genéricamente "validation", cuya composición no se documenta.

| Métrica | Valor | Verificada |
|---|---|---|
| Cosine Accuracy@1 | 0,80 | No |
| Cosine Accuracy@5 | 0,95 | No |
| Cosine Accuracy@10 | 1,00 | No |
| Cosine Precision@1 | 0,80 | No |
| Cosine Precision@5 | 0,19 | No |
| Cosine Precision@10 | 0,10 | No |
| Cosine Recall@1 | 0,80 | No |
| Cosine Recall@5 | 0,95 | No |
| Cosine Recall@10 | 1,00 | No |
| Cosine NDCG@10 | 0,8803 | No |
| Cosine MRR@10 | 0,8442 | No |
| Cosine MAP@100 | 0,8442 | No |

No se han publicado resultados de MMLU, GSM8K, HumanEval ni de otros benchmarks estándar, algo esperable en un modelo de embeddings. A partir de las propias métricas puede inferirse el tamaño del conjunto de evaluación: un Recall@5 de 0,95 y una Precision@5 de 0,19 son consistentes con aproximadamente 20 consultas con un único documento relevante cada una, lo que sitúa la evaluación en un orden de magnitud demasiado pequeño para extraer conclusiones robustas. Los resultados deben interpretarse, por tanto, como una comprobación de funcionamiento y no como una medida de calidad comparativa.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. El repositorio declara 0,2 GB, una cifra que no cuadra con el tamaño esperado de un modelo basado en XLM-RoBERTa grande (en torno a 1,1 GB en fp16 y 2,2 GB en fp32), por lo que probablemente el tamaño declarado no refleje el conjunto completo de pesos.
- GPU recomendadas: para un encoder de este tipo basta cualquier GPU moderna con 8 GB o más. Una RTX 3060, RTX 4070 o RTX 4090 son más que suficientes; en entornos de servidor, una T4, L4, A10 o A100 ofrecen margen de sobra para lotes grandes.
- Cabe en GPU de consumo: sí, con holgura, en cualquier tarjeta con 6-8 GB de VRAM. También es viable la inferencia en CPU para volúmenes moderados, dado el reducido tamaño del modelo.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (tag `text-embeddings-inference`), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y servidores de embeddings compatibles con la API de sentence-transformers. No hay pesos GGUF publicados, por lo que Ollama y llama.cpp requerirían una conversión previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de su documentación pública y no se han verificado en esta búsqueda; deben tomarse como referencia orientativa.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| autumn10/sec-embedding-smoke | Encoder denso (fine-tune) | No disponible | No disponible | No disponible | Experimental, 0 descargas |
| BAAI/bge-m3 | Encoder denso + sparse + multi-vector | ~568 M | 8192 tokens | MIT | Modelo de referencia, ampliamente utilizado |
| intfloat/multilingual-e5-large | Encoder denso | ~560 M | 512 tokens | MIT | Modelo de referencia multilingüe |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | Encoder denso | ~278 M | 128 tokens | Apache 2.0 | Modelo ligero y consolidado |

No se dispone de una comparación cuantitativa directa: el modelo evaluado solo publica métricas sobre un conjunto de validación interno de aproximadamente 20 consultas, mientras que los modelos alternativos cuentan con resultados en MTEB y otros benchmarks públicos. Cualquier comparación de rendimiento sería, con los datos actuales, engañosa.

## Limitaciones y advertencias

- Volumen de entrenamiento mínimo: 50 ejemplos declarados. Un ajuste de este tamaño apenas modifica el comportamiento del modelo base y no permite esperar una especialización real en ningún dominio.
- Evaluación no verificada y de tamaño reducido: las doce métricas declaradas están marcadas como `verified: false` y proceden, según la inferencia anterior, de unas 20 consultas, sin comparación contra una línea base.
- Naturaleza de prueba: el nombre del repositorio y las fechas de creación y actualización (separadas por tres segundos) indican que es un artefacto de prueba técnica, no un modelo destinado a producción.
- Ausencia total de validación externa: 0 descargas y 0 likes implican que ningún tercero lo ha evaluado ni reportado problemas.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base BAAI/bge-m3 se publica bajo MIT según su model card, la ausencia de licencia explícita en este derivado impide asumir condiciones de uso comercial y exige verificar el origen de los datos de entrenamiento antes de cualquier despliegue.
- Idiomas no documentados: no hay metadato de idiomas. Los únicos indicios (consultas en vietnamita, documentos en inglés) no permiten afirmar cobertura multilingüe general.
- Riesgo de recuperación irrelevante: al ser un modelo de similitud y no generativo, no alucina texto, pero sí puede devolver vecinos poco pertinentes con puntuaciones de similitud altas, especialmente fuera del dominio de CVE.
- Sin cuantizaciones publicadas: no existen variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de inferencia en CPU o en hardware muy restringido sin conversión manual.
- Sesgos: no documentados. No hay información sobre la composición del corpus, por lo que no puede evaluarse el sesgo lingüístico, geográfico o temático heredado.
- Repositorio de 0,2 GB: el tamaño declarado es anómalamente pequeño para la arquitectura esperada, lo que sugiere que la subida puede estar incompleta. Conviene verificar la integridad de los pesos antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autumn10/sec-embedding-smoke
- Modelo base en Hugging Face: https://huggingface.co/unsloth/bge-m3
- Modelo original BGE-M3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Referencia bibliográfica citada en los tags, arXiv:1908.10084 (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Referencia bibliográfica citada en los tags, arXiv:2101.06983: https://arxiv.org/abs/2101.06983
- Referencia bibliográfica citada en los tags, arXiv:1807.03748: https://arxiv.org/abs/1807.03748
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a páginas corporativas de Microsoft sin relación con el contenido de la ficha.
