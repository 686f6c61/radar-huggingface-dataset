# ewin-reg/WeMM-Embedding-2B-GGUF

## Resumen

WeMM-Embedding-2B-GGUF es una versión cuantizada en formato GGUF del modelo de embedding `tencent/WeMM-Embedding-2B`, desarrollado por el equipo WeChat Vision de Tencent. Se trata de un modelo de extracción de características (feature extraction) diseñado para generar representaciones densas de texto, código y contenido multimodal, con especial énfasis en la recuperación semántica de código fuente y la indexación en bases de datos vectoriales. Esta variante GGUF ha sido cuantizada por el usuario `ewin-reg` (también identificado como `ewinregirgojr`) y está pensada para su despliegue con frameworks como llama.cpp, Ollama, LM Studio, Unsloth, vLLM o sentence-transformers.

La arquitectura del modelo es híbrida: combina 18 capas de Mamba SSM (atención lineal) con 6 capas de atención softmax completa, sumando aproximadamente 2.389 millones de parámetros. El modelo genera vectores de embedding de 2048 dimensiones, normalizados con L2, y soporta tanto texto como imágenes, vídeos y documentos visuales. La licencia es Apache-2.0, lo que permite su uso comercial con atribución. Esta cuantización ofrece varios niveles de compresión (de Q4_K_M a Q8_0) que mantienen una alta fidelidad respecto al modelo original en FP16, con retenciones de similitud coseno superiores al 99,5 % según los datos declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas Mamba SSM (atención lineal) + 6 capas de atención softmax completa |
| Parametros totales | 2.389.393.216 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q6_K, Q8_0; versiones de investigación: SchurScale Q4, Research Q4; también INT4 e INT8 en otros formatos |
| Idiomas soportados | Inglés, chino, multilingüe y lenguajes de programación: Python, TypeScript, JavaScript, C++, Rust, Go, SQL, Shell |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también disponible en safetensors en el repositorio base y en la versión nativa cuantizada) |

## Arquitectura y entrenamiento

WeMM-Embedding-2B es un modelo de embedding desarrollado por Tencent (WeChat Vision team) que utiliza una arquitectura híbrida de atención lineal y atención softmax. Concretamente, combina 18 capas de Mamba SSM (State Space Model) para el procesamiento eficiente de secuencias largas con 6 capas de atención completa, lo que permite un equilibrio entre velocidad de inferencia y calidad de las representaciones. El modelo genera vectores densos de 2048 dimensiones normalizados con L2, y es capaz de procesar entradas multimodales: texto, imágenes, vídeos, documentos visuales y contenido intercalado.

La versión GGUF aquí documentada es una cuantización no oficial realizada por `ewin-reg`, que aplica técnicas de compresión como FlatQuant, Global g=32, H-Scale y SchurOpt (en la variante de investigación) para reducir el tamaño del modelo manteniendo una alta fidelidad respecto al original en FP16. No se han publicado detalles específicos sobre el corpus de entrenamiento, el número de tokens o procesos de alineación (RLHF/DPO) en la información disponible, ya que se trata de un modelo de embedding y no de un modelo generativo.

## Capacidades

- Generación de embeddings densos de 2048 dimensiones para texto y código fuente, normalizados con L2.
- Recuperación semántica de código: busca funciones, clases, fragmentos y documentación por similitud coseno.
- Soporte multimodal: representaciones unificadas para texto, imágenes, vídeos y documentos visuales (según el repositorio oficial de Tencent).
- Integración directa con bases de datos vectoriales: Milvus, Qdrant, Chroma, pgvector, FAISS y Weaviate.
- Detección de código duplicado y plagio mediante coincidencia de vecinos cercanos.
- Compatible con frameworks de inferencia como llama.cpp, Ollama, LM Studio, Unsloth, vLLM y sentence-transformers.
- No es un modelo generativo: no produce texto ni respuestas de chat.

## Casos de uso

- Búsqueda semántica de código en repositorios grandes: el modelo puede indexar funciones y archivos de un repositorio y permitir consultas en lenguaje natural, facilitando la localización de implementaciones relevantes.
- RAG para asistentes de código: sirve como backend de recuperación en sistemas de generación aumentada por recuperación, donde se combina con un modelo generativo para responder preguntas técnicas sobre bases de código.
- Indexación de documentación técnica en bases de datos vectoriales: permite buscar en manuales, guías y documentación de APIs mediante similitud semántica, incluso en varios idiomas.
- Detección de duplicados y plagio en sistemas de revisión de código: compara fragmentos de código entre sí para identificar copias o refactorizaciones no declaradas.
- Clasificación de documentos técnicos por similitud: agrupa artículos, issues o commits relacionados según su contenido semántico, útil para triaje automatizado.
- Búsqueda multimodal en gestores de contenido: al soportar texto, imágenes y vídeos, puede indexar y recuperar contenido visual a partir de descripciones textuales o viceversa.
- Recomendación de código o documentación relacionada: sugiere archivos, módulos o fragmentos similares a un contexto dado, mejorando la productividad en entornos de desarrollo.

## Benchmarks y rendimiento

El único benchmark publicado en la model card es la retención de similitud coseno frente al modelo base en FP16, evaluado sobre un corpus de programación multilenguaje de 100 scripts. Este dato fue declarado por el autor y no está verificado de forma independiente.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Code and Text Embedding | Multi-Language Programming Corpus (100 Scripts) | Cosine Similarity Retention (vs FP16 Baseline) | 99,59 % | No |

Además, la model card proporciona retención de similitud coseno para cada cuantización GGUF:

| Cuantización | Tamaño | Retención coseno (vs FP16) |
|---|---|---|
| Q4_K_M | 1,45 GB | No especificada |
| Q5_K_M | 1,64 GB | No especificada |
| Q6_K | 1,84 GB | 99,72 % |
| Q8_0 | 2,38 GB | 99,82 % |
| SchurScale Q4 (investigación) | 1,45 GB | 99,59 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q4_K_M y SchurScale Q4: ~2,1 GB de RAM total.
  - Q5_K_M: ~2,4 GB de RAM total.
  - Q6_K: ~2,6 GB de RAM total.
  - Q8_0: ~3,2 GB de RAM total.
- GPU recomendadas: no se especifican en la documentación. Dado el tamaño reducido, es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en CPUs modernas con soporte AVX2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Unsloth, vLLM y sentence-transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos de embedding en la información disponible. La comparación más relevante es con el modelo base en FP16, que es la referencia de calidad. La versión cuantizada GGUF mantiene una retención de similitud coseno superior al 99,5 % en los checkpoints de investigación, lo que la sitúa muy cerca del rendimiento original. Otras alternativas de embedding de código como bge-m3 o jina-embeddings-v2 no aparecen en los datos proporcionados, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo es exclusivamente de embedding: no genera texto ni respuestas de chat. Intentar usarlo como modelo generativo producirá resultados vacíos o incorrectos.
- El benchmark de retención de similitud coseno fue declarado por el autor y no está verificado de forma independiente.
- El soporte multimodal completo (vídeo, visión) puede requerir la versión nativa en safetensors, ya que la versión GGUF puede necesitar forks de llama.cpp o configuraciones específicas.
- Los idiomas principales son inglés y chino; aunque se indica soporte multilingüe, no se detalla la cobertura exacta ni la calidad para otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente con datos de programación y textos técnicos, su rendimiento puede degradarse en dominios no técnicos.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar el aviso de licencia y atribución.

## Enlaces

- Repositorio HuggingFace de la versión GGUF: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/tencent/WeMM-Embedding-2B
- Versión nativa cuantizada en safetensors: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized
- Repositorio oficial de Tencent en GitHub: https://github.com/Tencent/WeMM-Embedding
- Framework llama.cpp: https://github.com/ggerganov/llama.cpp
