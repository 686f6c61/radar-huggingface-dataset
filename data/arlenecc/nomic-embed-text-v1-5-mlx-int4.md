# arlenecc/nomic-embed-text-v1.5-mlx-int4

## Resumen

`arlenecc/nomic-embed-text-v1.5-mlx-int4` es una conversión comunitaria del modelo de embeddings de texto `nomic-embed-text-v1.5` de Nomic AI, adaptada al formato MLX y cuantizada a 4 bits (int4). Lo publica el usuario `arlenecc` en Hugging Face bajo licencia MIT. No es un modelo generativo, sino un encoder de frases diseñado para producir representaciones vectoriales densas de texto, útil para búsqueda semántica, recuperación de información (RAG) y clustering de documentos.

El modelo original emplea una arquitectura `nomic_bert` (variante de BERT con atención de contexto largo) y cuenta con 136.731.648 parámetros según los pesos publicados. Esta versión concreta está pensada para ejecutarse en el ecosistema MLX, el framework de Apple para cómputo en silicio de la compañía, lo que la hace relevante para desarrolladores que despliegan pipelines de embeddings en Macs con chips M-series.

La ficha se basa únicamente en los metadatos disponibles en el repositorio. La model card del autor es prácticamente inexistente (solo declara la licencia MIT), por lo que muchos datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nomic_bert (encoder transformer, requiere custom_code) |
| Parametros totales | 136.731.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo original soporta 8192 tokens, pero no se confirma en este repo) |
| Tipos de cuantizacion | int4 (cuantizacion MLX a 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión del encoder `nomic-bert` original de Nomic AI, que emplea atención bidireccional tipo BERT con soporte para secuencias largas. Esta variante ha sido cuantizada a 4 bits y empaquetada para MLX, lo que reduce el peso del repositorio a aproximadamente 0,1 GB. El tag `custom_code` indica que la carga requiere código específico del autor o del ecosistema MLX, no una clase estándar de `transformers`.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de ajuste fino o alineación. Tampoco se documentan innovaciones técnicas más allá de la propia cuantización int4 para MLX. El modelo original de Nomic AI se entrenó con técnicas de destilación y ajuste contrastivo, pero esos detalles no se reproducen en este repositorio derivado.

## Capacidades

- Generación de embeddings de texto densos para similitud semántica y recuperación.
- Soporte de búsqueda semántica y recuperación aumentada por generación (RAG).
- Clustering y deduplicación de documentos mediante vectores.
- Clasificación de texto mediante embeddings como features.
- Ejecución en hardware Apple Silicon a través de MLX.
- Cuantización int4 para reducir huella de memoria en inferencia.
- No es un modelo generativo: no produce texto, código ni razonamiento.
- No se documenta soporte de tool calling, agentes ni multimodalidad.

## Casos de uso

- Búsqueda semántica local en Mac: indexar documentos y consultar por similitud coseno usando MLX en un chip M-series, aprovechando la cuantización int4 para reducir el consumo de memoria unificada.
- RAG en aplicaciones de escritorio: integrar el encoder en un pipeline de recuperación que alimente a un LLM local (por ejemplo, vía Ollama o MLX) para asistentes sobre documentación interna.
- Deduplicación de corpus: calcular embeddings de grandes lotes de textos y agrupar por distancia para eliminar duplicados antes de entrenar o indexar.
- Clasificación de tickets de soporte: usar los vectores como entrada a un clasificador ligero (regresión logística o kNN) para enrutar incidencias por temática.
- Moderación y filtrado de contenido: comparar embeddings de mensajes entrantes contra un conjunto de referencia de textos prohibidos para detectar similitud semántica.
- Prototipado rápido en entornos Apple: validar pipelines de embeddings en un portátil antes de migrar a infraestructura con GPU, gracias al formato MLX y al bajo peso del repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un encoder de ~137 M de parámetros cuantizado a int4, la huella ronda unas pocas decenas de MB de pesos; el consumo real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: no aplica GPU CUDA; el formato MLX está orientado a Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Cabe en cualquier Mac con Apple Silicon; también en Macs con memoria unificada de 8 GB o superior.
- Opciones de despliegue: MLX (mlx-lm / mlx-embeddings según el custom_code del autor); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arlenecc/nomic-embed-text-v1.5-mlx-int4 | 136,7 M | no disponible | safetensors MLX int4 | MIT | Hugging Face (22 descargas) |
| nomic-ai/nomic-embed-text-v1.5 (original) | ~137 M | 8192 tokens (según model card original) | safetensors (PyTorch) | Apache 2.0 | Hugging Face |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | safetensors, GGUF | MIT | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | safetensors | Apache 2.0 | Hugging Face |

La comparativa con el original de Nomic AI es la más directa: esta versión cambia el runtime (MLX) y la precisión (int4), pero no se documentan diferencias de calidad. Frente a `bge-small` y `MiniLM`, este modelo es notablemente mayor en parámetros y está pensado para contextos más largos, aunque la información del repo no confirma el límite exacto.

## Limitaciones y advertencias

- La model card es prácticamente vacía: no hay documentación de uso, prompts recomendados ni métricas de calidad tras la cuantización int4.
- La cuantización a 4 bits puede degradar ligeramente la calidad de los embeddings frente al modelo original en fp32/fp16; no se aportan evaluaciones que lo cuantifiquen.
- El tag `custom_code` implica que la carga requiere código específico; no es un modelo plug-and-play con `AutoModel` estándar.
- Solo es compatible con el ecosistema MLX (Apple Silicon); no sirve para despliegues en GPU NVIDIA o CPU convencional sin conversión adicional.
- No se documentan sesgos conocidos, pero al derivar de un encoder entrenado con datos web, es probable que herede sesgos del corpus original.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir similitudes engañosas en dominios muy especializados.
- El repositorio tiene muy poca tracción (22 descargas, 0 likes) y fue creado en una fecha futura respecto a la información habitual; conviene verificar su procedencia antes de usarlo en producción.
- Licencia MIT declarada, lo que permite uso comercial, pero la licencia del modelo original de Nomic AI es Apache 2.0; conviene revisar la compatibilidad de la derivación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arlenecc/nomic-embed-text-v1.5-mlx-int4
- Modelo original (referencia): https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Framework MLX: https://github.com/ml-explore/mlx
