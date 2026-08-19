# majentik/nomic-embed-text-v2-moe-GGUF-Q8_0

## Resumen

El modelo `majentik/nomic-embed-text-v2-moe-GGUF-Q8_0` es una cuantización en formato GGUF con precisión Q8_0 del modelo de embeddings `nomic-ai/nomic-embed-text-v2-moe`, desarrollado originalmente por Nomic AI. Se trata del primer modelo de embeddings de texto de propósito general basado en una arquitectura de mezcla de expertos (MoE), diseñado para ofrecer un equilibrio óptimo entre rendimiento multilingüe y eficiencia computacional. Con 475 millones de parámetros totales y solo 305 millones activos durante la inferencia, consigue resultados competitivos con modelos del doble de tamaño, lo que lo hace especialmente atractivo para despliegues en entornos con recursos limitados.

La versión cuantizada Q8_0, generada por el usuario majentik, mantiene una fidelidad de embeddings muy alta (similitud coseno mínima de 0,999537 frente al baseline F16), lo que la convierte en una opción práctica para producción. El modelo soporta aproximadamente 100 idiomas y ha sido entrenado con más de 1.600 millones de pares de frases, empleando además embeddings Matryoshka para permitir reducciones flexibles de dimensionalidad. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 8 expertos y routing top-2 |
| Parametros totales | 475.288.320 (475M) |
| Parametros activos | 305M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este archivo) |
| Idiomas soportados | Aproximadamente 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `nomic-embed-text-v2-moe` emplea una arquitectura Transformer con mezcla de expertos (MoE) en la que cada token se procesa mediante 8 expertos, activando únicamente los 2 más relevantes (routing top-2). Esta configuración reduce el coste computacional efectivo a 305M parámetros activos, manteniendo la capacidad de un modelo mucho mayor. El entrenamiento se realizó con más de 1.600 millones de pares de frases multilingües, cubriendo alrededor de 100 idiomas, y se incorporaron embeddings Matryoshka para permitir dimensiones de salida flexibles (por ejemplo, 768, 512 o 256) sin degradación significativa del rendimiento. No se dispone de información detallada sobre técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de embeddings, no generativo.

La cuantización Q8_0 se realizó a partir del checkpoint FP32 mediante `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp, obteniendo un archivo de 488 MB. Se verificó la fidelidad de los embeddings con un conjunto multilingüe de 8 frases, superando el umbral mínimo de similitud coseno de 0,99.

## Capacidades

- Generacion de embeddings de texto para frases, párrafos y documentos completos.
- Similitud semántica entre textos, tanto en el mismo idioma como entre idiomas distintos (búsqueda multilingüe).
- Recuperación de información (retrieval) en sistemas de búsqueda semántica y RAG (Retrieval-Augmented Generation).
- Clasificación de texto mediante la comparación de embeddings con representaciones de clases.
- Agrupamiento (clustering) de documentos por similitud temática.
- Reducción de dimensionalidad mediante embeddings Matryoshka (dimensiones de salida configurables, p. ej. 768, 512, 256).
- Soporte para tool calling y agentes no aplica, al ser un modelo de embeddings puro.

## Casos de uso

- **Búsqueda semántica en bases de conocimiento**: el modelo puede indexar documentos y consultas en múltiples idiomas, permitiendo recuperar información relevante incluso cuando la consulta y el documento están en idiomas distintos. Su tamaño reducido permite indexar grandes volúmenes con costes de almacenamiento moderados.
- **Sistemas RAG (Retrieval-Augmented Generation)**: al integrarse como componente de recuperación, proporciona representaciones densas de alta calidad que mejoran la precisión de las respuestas generadas por un LLM, especialmente en entornos multilingües.
- **Clasificación de textos empresariales**: se puede usar para categorizar tickets de soporte, correos electrónicos o documentos legales calculando la similitud con embeddings de clases predefinidas. La baja latencia de inferencia permite procesar flujos en tiempo real.
- **Deduplicación de documentos**: comparando embeddings de pares de documentos se pueden identificar duplicados o versiones casi idénticas, útil en gestión documental y limpieza de datos.
- **Sistemas de recomendación basados en contenido**: representando artículos, productos o noticias como embeddings, se pueden sugerir elementos similares a los usuarios según sus interacciones previas.
- **Análisis de sentimiento y opiniones**: al disponer de embeddings multilingües, se pueden analizar opiniones de clientes en distintos idiomas sin necesidad de modelos separados por lengua, agrupando comentarios por polaridad o tema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (como MMLU, HumanEval o MTEB) en la informacion disponible. La documentación del modelo base indica que alcanza un rendimiento "state-of-the-art" en recuperación multilingüe comparado con modelos de ~300M parámetros y es competitivo con modelos del doble de tamaño, pero no se aportan cifras concretas.

## Requisitos de hardware

- **VRAM estimada**: el archivo Q8_0 ocupa 488 MB, por lo que puede ejecutarse en GPU con 1 GB de VRAM o incluso en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej. GTX 1050 Ti, RTX 2060, RTX 4090) es suficiente. También funciona en CPU con instrucciones AVX2.
- **Compatibilidad con consumer GPU**: sí, es ampliamente compatible.
- **Opciones de despliegue**: llama.cpp (comando `llama-embedding`), Ollama (biblioteca oficial), servidores de embeddings como text-embeddings-inference (con conversión previa), o cualquier framework que soporte GGUF.
- **Latencia y throughput**: al ser un modelo MoE con solo 305M parámetros activos, la inferencia es rápida; en CPU se pueden procesar cientos de frases por segundo, y en GPU miles. No se dispone de cifras exactas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nomic-embed-text-v2-moe (Q8_0) | 475M total / 305M activos | no disponible | ~100 | Apache 2.0 | GGUF |
| e5-base-v2 | 110M | 512 | 1 (inglés) | MIT | Safetensors |
| bge-base-en-v1.5 | 110M | 512 | 1 (inglés) | MIT | Safetensors |
| multilingual-e5-base | 110M | 512 | 100+ | MIT | Safetensors |

La comparativa se basa en tamaños y características generales; no se dispone de resultados de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de embeddings, no genera texto; solo produce representaciones vectoriales. No es adecuado para tareas generativas.
- La longitud de contexto no está documentada en la información disponible; se recomienda verificar la documentación oficial del modelo base antes de usarlo con textos largos.
- Puede presentar sesgos en idiomas o dominios poco representados en los datos de entrenamiento, a pesar del soporte multilingüe.
- La cuantización Q8_0 introduce una pérdida mínima de precisión (similitud coseno 0,9995 frente a F16), pero en aplicaciones que requieran máxima exactitud se recomienda usar el checkpoint FP32.
- Licencia Apache 2.0 permite uso comercial, pero se debe atribuir la autoría original según los términos de la licencia.
- No se han publicado resultados de benchmarks oficiales en la información revisada; se recomienda evaluar el modelo en el dominio específico antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/majentik/nomic-embed-text-v2-moe-GGUF-Q8_0
- Modelo base original: https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe
- Garden hub de majentik: https://huggingface.co/majentik/garden
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Página de ollama para el modelo: https://ollama.com/library/nomic-embed-text-v2-moe
