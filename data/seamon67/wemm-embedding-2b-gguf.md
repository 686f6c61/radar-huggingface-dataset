# seamon67/WeMM-Embedding-2B-GGUF

## Resumen

WeMM-Embedding-2B-GGUF es la conversión a formato GGUF del modelo de embeddings multimodales tencent/WeMM-Embedding-2B, publicada por el usuario seamon67. El modelo original lo desarrolla Tencent y está construido sobre Qwen3.5; acepta texto, imágenes, vídeos, documentos visuales y entradas multimodales intercaladas, y devuelve un vector de 2048 dimensiones normalizado en L2. No es un modelo generativo: su pipeline es `feature-extraction`, es decir, produce representaciones vectoriales para búsqueda, recuperación y clasificación, no texto.

La relevancia de esta conversión concreta es que traslada un modelo de embeddings multimodal de 2B parámetros al ecosistema llama.cpp (release b10269 modificada), lo que permite ejecutarlo en CPU o GPU de gama media sin depender del stack de Transformers. El repositorio ocupa 2,7 GB, admite embeddings Matryoshka (MRL) y declara soporte de chino e inglés, con licencia apache-2.0 según los metadatos de HuggingFace (la model card declara `license: other` con `license_name: apache-2.0`).

En la evaluación MMEB-v2 sobre 78 conjuntos de datos, la variante de 2B alcanza un promedio de 77,9 (79,6 en imagen, 70,8 en vídeo y 80,7 en documentos visuales), por delante de alternativas del mismo tamaño como Qwen3-VL-Embedding 2B (73,2) o DME-Small 2B (74,8). El repositorio GGUF no tiene descargas ni valoraciones en el momento de la consulta y no se detallan los niveles de cuantización incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de embeddings construido sobre Qwen3.5; detalle de capas y mecanismo de atención no disponible |
| Parámetros totales | 2B (aproximadamente 2.000 millones) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada (el repositorio GGUF ocupa 2,7 GB en total) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | apache-2.0 en los metadatos; la model card declara `license: other` con `license_name: apache-2.0` |
| Formato de pesos | GGUF (llama.cpp, release b10269 modificada); el modelo original usa safetensors |
| Dimensión de embedding | 2048, normalizado en L2 |
| Dimensiones Matryoshka | Definidas en `model.config.matryoshka_dimensions`; 256 dimensiones documentadas como caso de truncado |
| Modalidades de entrada | Texto, imagen, vídeo, documentos visuales y combinaciones intercaladas |
| Modalidades no soportadas | Audio |
| Pipeline | feature-extraction |
| Modelo base | tencent/WeMM-Embedding-2B |

## Arquitectura y entrenamiento

El modelo original se presenta como un modelo universal de embeddings multimodales construido sobre Qwen3.5. Procesa entradas visuales mediante `qwen-vl-utils` con `image_patch_size=16` y decodificación de vídeo con decord, y expone un método `model.embedding(**inputs)` que devuelve el vector normalizado. La integración con Sentence Transformers se realiza mediante `trust_remote_code=True` y ofrece plantillas separadas para consulta y documento (`encode_query` / `encode_document`), lo que indica un entrenamiento asimétrico orientado a recuperación. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable es el uso de embeddings Matryoshka (MRL): el vector de 2048 dimensiones puede truncarse y renormalizarse a dimensiones menores, de modo que con Sentence Transformers basta pasar `truncate_dim`. Según la model card, en MMEB-v2 los embeddings de 256 dimensiones conservan el 98,7 % del rendimiento de la dimensión completa en tareas de imagen y vídeo, lo que permite reducir el coste de indexación y almacenamiento en bases de datos vectoriales. La conversión a GGUF se realizó con una versión modificada de llama.cpp (b10269); no se documentan diferencias de calidad respecto al modelo original.

## Capacidades

- Generación de embeddings multimodales: convierte texto, imágenes, vídeos y documentos visuales en vectores de 2048 dimensiones normalizados en L2.
- Entradas intercaladas: acepta mensajes en formato chat con varias imágenes, vídeos y fragmentos de texto combinados en una sola entrada.
- Recuperación asimétrica: plantillas diferenciadas para consulta y documento, adecuadas para tareas de text-to-image, text-to-video y visual document retrieval.
- Truncado Matryoshka: permite usar 256 dimensiones (o cualquier valor de `matryoshka_dimensions`) reduciendo el coste de almacenamiento con una pérdida de rendimiento documentada del 1,3 % en imagen y vídeo sobre MMEB-v2.
- Multilingüismo limitado: soporte declarado de chino e inglés; no se documentan otros idiomas.
- No es un modelo generativo: no produce texto, no tiene modo de razonamiento (thinking), no soporta tool calling ni function calling y no ejecuta razonamiento multi-paso.
- No soporta audio.
- No se documentan capacidades de agentes; su uso en pipelines agénticos sería exclusivamente como componente de recuperación.

## Casos de uso

- RAG multimodal sobre documentación técnica: las consultas textuales se enfrentan a un índice que mezcla capturas de pantalla, diagramas y fragmentos de texto. El modelo unifica ambas modalidades en el mismo espacio de 2048 dimensiones, lo que evita mantener dos índices separados y aprovecha el rendimiento de 79,6 en tareas de imagen de MMEB-v2.
- Búsqueda semántica de vídeo: con la puntuación de 70,8 en tareas de vídeo de MMEB-v2, el modelo permite localizar el fragmento relevante de un archivo de vídeo a partir de una consulta en lenguaje natural, procesando los fotogramas con decord y `qwen-vl-utils`.
- Recuperación en documentos visuales: con 80,7 de NDCG@5 en la categoría VisDoc, es adecuado para indexar PDF escaneados, facturas, informes y presentaciones donde el texto no es extraíble directamente.
- Deduplicación y curaduría de datasets: generar embeddings de imágenes y vídeos y agrupar por similitud coseno para eliminar duplicados o near-duplicates antes de entrenar otros modelos. El truncado a 256 dimensiones reduce el coste de comparación manteniendo el 98,7 % del rendimiento en imagen y vídeo.
- Clasificación y enrutado zero-shot: usar los embeddings como características para un clasificador ligero (regresión logística o k-NN) que etiquete tickets, imágenes o vídeos sin reentrenar el modelo subyacente.
- Memoria a largo plazo en agentes: actuar como recuperador de contexto dentro de un agente, almacenando interacciones previas multimodales en una base vectorial y recuperando las más relevantes para el turno actual. El modelo no razona ni llama herramientas; solo aporta la fase de recuperación.
- Recomendación de contenido visual: calcular la similitud entre el historial de un usuario (imágenes y vídeos vistos) y un catálogo nuevo para ordenar candidatos, aprovechando la normalización L2 para usar producto escalar directamente.
- Moderación y búsqueda de contenido sensible: indexar material audiovisual y recuperar coincidencias contra un conjunto de referencia, con el vector de 256 dimensiones como índice rápido y la dimensión completa para la verificación final.
- Catálogos de comercio electrónico: enfrentar descripciones de producto en texto con sus fotografías para enriquecer fichas, detectar productos mal etiquetados o sugerir variantes visualmente similares.

## Benchmarks y rendimiento

Resultados en MMEB-v2 (78 conjuntos de datos, tabla 1 del informe técnico). Las tareas de imagen y vídeo usan Hit@1; las de documento visual, NDCG@5.

| Modelo | Tamaño | AVG | Imagen | Vídeo | VisDoc |
|---|---:|---:|---:|---:|---:|
| VLM2Vec | 2B | 47,8 | 59,7 | 29,0 | 44,0 |
| GME | 2B | 55,4 | 51,9 | 33,9 | 76,8 |
| VLM2Vec-V2 | 2B | 59,3 | 64,9 | 34,9 | 69,2 |
| Qwen3-VL-Embedding | 2B | 73,2 | 75,0 | 61,9 | 79,2 |
| DME-Small† | 2B | 74,8 | 75,9 | 65,6 | 79,9 |
| **WeMM-Embedding** | **2B** | **77,9** | **79,6** | **70,8** | **80,7** |
| **WeMM-Embedding** | **4B** | **79,2** | **80,8** | **72,1** | **82,0** |
| VLM2Vec | 8B | 53,2 | 65,5 | 34,0 | 49,1 |
| GME | 8B | 59,2 | 56,0 | 38,6 | 79,3 |
| Qwen3-VL-Embedding | 8B | 77,8 | 80,1 | 67,1 | 82,4 |
| DME-Medium† | 9B | 78,4 | 79,8 | 70,8 | 82,0 |
| **WeMM-Embedding** | **9B** | **80,6** | no disponible | no disponible | no disponible |

Notas: la información extraída de la model card se trunca en la fila de 9B, por lo que solo se dispone del valor promedio de esa variante. El símbolo † corresponde a la notación empleada en el informe original. No se dispone de resultados de esta conversión GGUF concreta: los datos anteriores corresponden a los pesos originales en `tencent/WeMM-Embedding-2B`. No hay resultados publicados en la información disponible para MMLU, HumanEval, GSM8K ni otros benchmarks de generación, y no serían aplicables a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de 2B parámetros, no confirmado por el autor): en bf16/fp16, en torno a 4-5 GB de pesos, más memoria de activaciones para vision tokens y fotogramas de vídeo; en cuantizaciones GGUF de 8 bits, alrededor de 2,2 GB; en 4 bits, alrededor de 1,2-1,5 GB. Los niveles de cuantización realmente incluidos en el repositorio no están disponibles.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM para texto e imagen; para vídeo con muchos fotogramas conviene disponer de 12-16 GB por el coste de las activaciones. Para servicio con lotes grandes, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en equipos Apple Silicon con memoria unificada suficiente. El repositorio completo en GGUF ocupa 2,7 GB, por lo que la variante más pequeña debería residir holgadamente en memoria.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio, con `llama-server` en modo embeddings); vLLM 0.27.0 con `--runner pooling` y la plantilla `embedding_chat_template.jinja`; SGLang 0.5.9 con `--is-embedding` y el parche `patch_sglang_video.py`; Sentence Transformers (>=5.7.0) y Transformers 5.2.0 sobre los pesos originales. La compatibilidad con Ollama no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles. No se publican cifras de tokens por segundo ni de embeddings por segundo para esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMEB-v2 (AVG) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| WeMM-Embedding (este modelo, vía GGUF) | 2B | No disponible | 77,9 (pesos originales) | apache-2.0 según metadatos; `other` con `license_name: apache-2.0` en la model card | GGUF en HuggingFace, 0 descargas |
| Qwen3-VL-Embedding | 2B | No disponible | 73,2 | No disponible | Pesos originales en HuggingFace |
| DME-Small† | 2B | No disponible | 74,8 | No disponible | Pesos originales en HuggingFace |
| VLM2Vec-V2 | 2B | No disponible | 59,3 | No disponible | Pesos originales en HuggingFace |

La ventaja de WeMM-Embedding-2B en este benchmark es de 4,7 puntos sobre Qwen3-VL-Embedding 2B y de 3,1 puntos sobre DME-Small†, con una diferencia especialmente marcada en vídeo (70,8 frente a 61,9 y 65,6 respectivamente). No se dispone de datos de contexto, licencia detallada ni disponibilidad en GGUF para los modelos comparados.

## Limitaciones y advertencias

- No genera texto: cualquier expectativa de uso conversacional, tool calling o razonamiento multi-paso es inaplicable. Solo produce vectores.
- Idiomas: únicamente chino e inglés están declarados. No se documenta el comportamiento en castellano ni en otras lenguas, por lo que su uso en producción en español requeriría validación propia.
- Ambigüedad de licencia: los metadatos de HuggingFace indican apache-2.0, pero la model card declara `license: other` con `license_name: apache-2.0`. Conviene verificar los términos en el repositorio original de Tencent antes de un uso comercial.
- Conversión de terceros: el GGUF lo ha generado el usuario seamon67 con una versión modificada de llama.cpp (b10269). No hay garantía de equivalencia numérica exacta con los pesos originales ni de que los resultados de MMEB-v2 se reproduzcan en esta cuantización.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento con vídeos largos, documentos extensos o entradas intercaladas de gran tamaño.
- Rendimiento truncado: el truncado Matryoshka a 256 dimensiones conserva el 98,7 % del rendimiento en imagen y vídeo según la model card, pero no se documenta la pérdida en tareas de documento visual ni en recuperación textual.
- Validación comunitaria nula: 0 descargas y 0 valoraciones. No hay informes independientes de calidad ni de estabilidad en producción.
- Alucinación: el concepto no aplica directamente al no haber generación, pero sí existe riesgo de falsos positivos en recuperación, especialmente con consultas ambiguas o fuera de dominio.
- Dependencias específicas: el procesado de vídeo requiere decord y `qwen-vl-utils[decord]==0.0.14`; el despliegue en SGLang exige aplicar un parche adicional para el vídeo.
- Ausencia de audio: los archivos con pista de audio no se procesan en esa modalidad.
- Los resultados de benchmark proceden de los pesos originales, no de este GGUF; la información disponible además se trunca en la fila de 9B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/seamon67/WeMM-Embedding-2B-GGUF
- Modelo original: https://huggingface.co/tencent/WeMM-Embedding-2B
- Colección de Tencent: https://huggingface.co/collections/tencent/wemm-embedding
- Informe técnico (arXiv): https://arxiv.org/abs/2608.24053
- Informe técnico (PDF en GitHub): https://github.com/Tencent/WeMM-Embedding/blob/main/assets/WeMM_Embedding_tech_report.pdf
- Repositorio de código: https://github.com/Tencent/WeMM-Embedding
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a documentación de GitHub Copilot, foros de ChatGPT y repositorios de prompts sin relación con WeMM-Embedding.
