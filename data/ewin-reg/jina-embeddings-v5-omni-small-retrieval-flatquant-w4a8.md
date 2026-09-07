# ewin-reg/jina-embeddings-v5-omni-small-retrieval-FlatQuant-W4A8

## Resumen

jina-embeddings-v5-omni-small-retrieval-FlatQuant-W4A8 es una versión cuantizada del modelo de embeddings multimodales de Jina AI, publicada por la comunidad (ewin-reg). Se trata de un modelo de recuperación (retrieval) que genera representaciones vectoriales de 1024 dimensiones a partir de texto, imagen y audio, lo que permite búsqueda semántica multimodal. La cuantización FlatQuant-W4A8 reduce el peso del modelo a aproximadamente 1 GB (68% menos que el original en BF16) manteniendo una degradación inferior al 1% respecto al modelo base.

La arquitectura combina un modelo de lenguaje Qwen3 con atención de consultas agrupadas (GQA), un codificador de audio basado en Conformer y un codificador visual basado en ViT, unidos mediante proyecciones lineales. El modelo está pensado para despliegue en servidores y entornos con recursos limitados, donde la eficiencia de almacenamiento y el coste de inferencia son críticos. No es un modelo generativo: su función es producir embeddings para tareas de recuperación, clasificación y búsqueda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 28 bloques Qwen3 GQA (lenguaje) + 32 bloques Conformer (audio) + 24 bloques ViT (visión) + proyecciones lineales |
| Parámetros totales | 1.580.835.840 (según safetensors; la model card declara 1.559.368.704) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FlatQuant-W4A8: pesos lineales INT4 con grupo de 64, puentes cross-modales en FP8 (float8_e4m3fn), normas y embeddings en BF16 |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carga con trust_remote_code en transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es híbrida y combina tres codificadores: un modelo de lenguaje Qwen3 con atención de consultas agrupadas (GQA) compuesto por 28 bloques (595,78 millones de parámetros), un codificador de audio con 32 bloques Conformer (635,06 millones) y un codificador visual con 24 bloques ViT (327,22 millones). Los tres se fusionan mediante proyecciones lineales: un merger visual que reduce de 4096 a 1024 dimensiones (20,97 millones de parámetros) y un proyector de audio que reduce de 1280 a 1024 dimensiones (1,31 millones). El modelo genera embeddings de 1024 dimensiones con pooling del último token.

Respecto al entrenamiento, la información disponible no incluye detalles sobre el dataset, el número de tokens ni procesos de alineación como RLHF o DPO. La innovación principal es la cuantización FlatQuant-W4A8 aplicada por ewin-reg, que asigna precisión mixta: los pesos de las proyecciones lineales se cuantizan a INT4 con grupos de 64, los puentes cross-modales se mantienen en FP8 y las normas y embeddings en BF16. Según la model card, esta estrategia consigue una reducción del 68,02% del tamaño de almacenamiento con una degradación media del 0,62% respecto a BF16, manteniendo la alineación multimodal intacta (fidelidad de reconstrucción del 99,38%).

## Capacidades

- Generación de embeddings multimodales: produce vectores de 1024 dimensiones a partir de texto, imágenes y audio, con normalización L2.
- Recuperación de información (retrieval): optimizado para tareas de búsqueda semántica y recuperación de documentos en entornos multimodales.
- Soporte multilingüe: entrenado para inglés, chino y otros idiomas según la etiqueta "multilingual".
- No es un modelo generativo: no genera texto, imágenes ni audio; su salida son representaciones vectoriales.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- Carga mediante transformers con trust_remote_code y sentence-transformers; el código de la model card muestra dequantización manual de los pesos INT4.

## Casos de uso

- Búsqueda semántica multimodal en bases de datos: permite indexar imágenes, audio y texto en un mismo espacio vectorial. Un usuario puede buscar por texto y obtener resultados visuales o sonoros, gracias a que los embeddings de las tres modalidades comparten el mismo espacio de 1024 dimensiones.
- Sistemas de recomendación de contenido: se pueden vectorizar canciones, vídeos y artículos para recomendar elementos similares. El componente de audio Conformer captura características acústicas, mientras que el ViT procesa portadas o fotogramas.
- Moderación de contenido en plataformas: al generar embeddings de texto e imágenes, se pueden detectar contenidos duplicados o similares, y clasificar material no deseado mediante comparación de vectores.
- Búsqueda en archivos de audio y vídeo: el codificador de audio permite indexar clips de audio o transcripciones, habilitando consultas por texto sobre grandes volúmenes de contenido multimedia.
- Recuperación de documentos corporativos: ideal para motores de búsqueda internos que indexan documentos con tablas, figuras y texto, ya que combina información visual y textual en un único embedding.
- Clasificación de imágenes y texto de forma conjunta: se pueden entrenar clasificadores lineales sobre los embeddings para tareas como etiquetado automático de productos, análisis de sentimiento multimodal o detección de spam.
- Reducción de costes de despliegue: la versión cuantizada permite ejecutar el modelo en GPUs con menos VRAM o en CPUs, manteniendo un rendimiento cercano al original. Es adecuada para entornos de producción con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara las siguientes métricas en el model-index, sin verificación externa:

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Recuperación multimodal | MTEB / Multimodal Benchmark Suite | Fidelidad de reconstrucción de pesos (cosine similarity) | 99,38% | No |
| Recuperación multimodal | MTEB / Multimodal Benchmark Suite | Degradación respecto a BF16 | 0,62% | No |
| Recuperación multimodal | MTEB / Multimodal Benchmark Suite | Reducción de almacenamiento | 68,02% | No |

Además, la model card incluye una comparativa empírica entre esquemas de cuantización sobre el mismo modelo base:

| Esquema | Precisión de pesos | Precisión de activaciones | Precisión de puentes | Tamaño (GB) | Reducción | Degradación vs BF16 |
|---|---|---|---|---|---|---|
| BF16 | BF16 | BF16 | BF16 | 3,12 | 0% | 0% |
| FP8 estándar | FP8 | FP8 | FP8 | 1,56 | 50% | 0,18% |
| GGUF Q8_0 | INT8 | FP16/BF16 | INT8 | 1,62 | 48,1% | 0,22% |
| GGUF Q4_K_M | INT4 | FP16/BF16 | INT4 | 0,98 | 68,6% | 3,84% |
| GPTQ/AWQ | INT4 | FP16 | INT4 | 0,99 | 68,3% | 1,72% |
| 2-bit extremo | INT2 | FP16 | INT2 | 0,42 | 86,5% | 11,09% |
| FlatQuant-W4A8 (este modelo) | INT4 (grupo 64) | INT8/BF16 | FP8 | 0,998 | 68,02% | 0,62% |

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del modelo es de 0,998 GB. Con un margen para activaciones y el framework, se estima que se puede ejecutar en GPUs con 4 GB de VRAM o menos, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, A10, etc.). Para procesamiento por lotes, se recomienda más VRAM.
- Cabe en GPUs de consumo: sí, gracias a la cuantización W4A8. El tamaño del repositorio es de 1,1 GB.
- Opciones de despliegue: transformers (con trust_remote_code), sentence-transformers. No se documenta soporte para vLLM, llama.cpp ni TGI en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión embeddings | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jina-embeddings-v5-omni-small-retrieval (base) | 1,56 B (según model card) | 1024 | 3,12 GB (BF16) | Apache-2.0 | HuggingFace |
| jina-embeddings-v5-omni-small-retrieval-FlatQuant-W4A8 (este) | 1,58 B (safetensors) | 1024 | 0,998 GB | Apache-2.0 | HuggingFace |
| jina-embeddings-v5-omni-nano | No disponible | 768 | No disponible | Apache-2.0 | HuggingFace |

No se dispone de benchmarks comparativos con otros modelos de embeddings multimodales en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos. Al estar entrenado con datos multilingües, puede presentar sesgos no descritos.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto ni contenido; solo produce embeddings.
- Limitaciones de contexto o idioma: la información no especifica la longitud máxima de entrada ni los idiomas exactos soportados más allá de inglés, chino y "multilingual".
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y distribución, siempre que se mantengan los avisos de licencia.
- Caveat importante para producción: las métricas del model-index no están verificadas. La discrepancia entre los parámetros declarados en la model card (1.559.368.704) y el recuento real de safetensors (1.580.835.840) debería investigarse antes de un despliegue crítico.
- El modelo requiere trust_remote_code al cargarse con transformers, lo que implica ejecutar código remoto; conviene auditar el repositorio.
- La cuantización puede afectar ligeramente la calidad de los embeddings en tareas muy sensibles; se recomienda validar con el conjunto de datos propio.

## Enlaces

- HuggingFace: https://huggingface.co/ewin-reg/jina-embeddings-v5-omni-small-retrieval-FlatQuant-W4A8
- Página del modelo base en Jina AI: https://jina.ai/en-US/models/jina-embeddings-v5-omni-small/
- Modelo base en HuggingFace: https://huggingface.co/jinaai/jina-embeddings-v5-omni-small-retrieval
