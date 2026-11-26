# infil00p/all-MiniLM-L6-v2-GGUF

## Resumen

`infil00p/all-MiniLM-L6-v2-GGUF` es una conversión al formato GGUF del modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2`, pensada para su uso con llama.cpp. El modelo original fue entrenado por el equipo de sentence-transformers y es un transformer BERT de tipo MiniLM con 22.565.376 parámetros que proyecta texto a un vector denso de 384 dimensiones mediante mean pooling y normalización L2, orientado a búsqueda semántica y similitud entre frases.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de embeddings ligero dentro del ecosistema llama.cpp, con `llama-server` exponiendo un endpoint compatible con `/v1/embeddings`, sin necesidad de dependencias de PyTorch ni de sentence-transformers. El repositorio ofrece dos precisiones, F16 (46,2 MB) y Q8_0 (25,3 MB), lo que facilita el despliegue en entornos con recursos muy limitados.

El autor documenta de forma explícita las diferencias respecto al modelo original, en particular la longitud de entrada efectiva (512 tokens en el GGUF frente a los 256 de truncado de sentence-transformers) y una limitación conocida del tokenizador WordPiece de llama.cpp en texto coreano e índico. La licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT tipo MiniLM (encoder), con mean pooling y normalización L2 |
| Parametros totales | 22.565.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (el modelo original trunca a 256 en sentence-transformers) |
| Tipos de cuantizacion | F16 y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Dimension del embedding | 384 |
| Tamano de los ficheros | F16: 46,2 MB; Q8_0: 25,3 MB |
| Tamano del repo | 0,1 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer BERT de la familia MiniLM, con 22,5 millones de parámetros, que genera embeddings de 384 dimensiones. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp (revisión `7adf160c4`, sin modificaciones) a partir del modelo `sentence-transformers/all-MiniLM-L6-v2` en la revisión `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`, con fecha de conversión 2026-11-19. La información sobre el dataset de entrenamiento original, número de tokens y si hubo RLHF o DPO no está disponible en la documentación proporcionada; se remite a la model card del modelo base.

La innovación técnica de esta conversión es la inclusión de la configuración de mean pooling en los metadatos del GGUF, de modo que `--pooling mean` resulta opcional en versiones recientes de llama.cpp. Además, llama.cpp normaliza L2 el embedding agrupado por defecto, por lo que la similitud coseno equivale a un producto escalar. El autor documenta una diferencia funcional relevante: el GGUF permite usar los 512 tokens de contexto del modelo, mientras que sentence-transformers trunca a 256; para reproducir exactamente los embeddings originales hay que truncar la entrada a 256 tokens antes de la inferencia.

## Capacidades

- Generación de embeddings de texto de 384 dimensiones con mean pooling y normalización L2.
- Búsqueda semántica y cálculo de similitud entre frases mediante producto escalar (coseno).
- Extracción de características (feature-extraction) para pipelines de recuperación.
- Servido mediante API compatible con `/v1/embeddings` en `llama-server`.
- Uso por línea de comandos con `llama-embedding`.
- Soporte de contexto de hasta 512 tokens en el GGUF (frente a 256 en sentence-transformers).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de documentación y recuperar los más relevantes para una consulta mediante similitud coseno, aprovechando el endpoint `/v1/embeddings` de `llama-server` y el reducido tamaño del modelo (25-46 MB).
- Motor de recuperación en RAG ligero: generar embeddings de chunks y de la pregunta del usuario en el mismo proceso llama.cpp, sin dependencias de PyTorch, adecuado para despliegues en contenedores pequeños o dispositivos de borde.
- Deduplicación y agrupación de textos: calcular similitud entre pares de frases para detectar duplicados o agrupar documentos similares en pipelines de limpieza de datos.
- Búsqueda en el historial del navegador: el autor evalúa el modelo sobre el dataset `Mozilla/history-search-retrieval` (2.537 consultas sobre 88.905 documentos), lo que respalda su uso en recuperación de historial de navegación.
- Clasificación y clustering de tickets de soporte: usar los embeddings como entrada a un clasificador ligero o a un algoritmo de clustering para enrutar incidencias por temática.
- Filtrado de candidatos en motores de recomendación: precalcular embeddings de ítems y consultas para una primera fase de recuperación de bajo coste antes de un reordenador más pesado.
- Evaluación de similitud en tests automatizados: comparar respuestas generadas con referencias mediante similitud coseno en pipelines de CI, gracias a la paridad casi exacta con el modelo fp32 (coseno medio de 0,999998 en F16).

## Benchmarks y rendimiento

El autor publica una evaluación frente a la exportación fp32 ONNX del modelo original (`Xenova/all-MiniLM-L6-v2`, mean pooling, L2) sobre el split `base` de `Mozilla/history-search-retrieval`: 2.537 consultas sobre 88.905 documentos, entradas truncadas a 100 tokens.

| Fichero | Coseno vs fp32 (media / peor documento) | nDCG@15 (referencia fp32: 0,9340) | Solapamiento top-15 con fp32 |
|---|---|---|---|
| F16 | 0,999998 / 0,999993 | 0,9338 | 99,8% |
| Q8_0 | 0,999853 / 0,999649 | 0,9331 | 98,6% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de un modelo de embeddings y no de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en F16 (46,2 MB de pesos) y en torno a 25,3 MB en Q8_0, más el espacio de trabajo del contexto (hasta 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo es viable incluso en CPU. No requiere A100 ni H100.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en dispositivos de borde y en ejecución puramente en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` (con `--embedding --pooling mean -ub 512 -b 512`) o `llama-embedding`; también es compatible con el modelo base vía sentence-transformers y con la exportación ONNX de Xenova.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Formato | Licencia |
|---|---|---|---|---|---|
| infil00p/all-MiniLM-L6-v2-GGUF | 22,5 M | 512 tokens (GGUF) | 384 | GGUF (F16, Q8_0) | Apache-2.0 |
| sentence-transformers/all-MiniLM-L6-v2 | 22,5 M | 256 tokens (truncado) | 384 | safetensors / PyTorch | Apache-2.0 |
| Xenova/all-MiniLM-L6-v2 | 22,5 M | 256 tokens | 384 | ONNX | Apache-2.0 |

Las tres variantes comparten pesos y arquitectura; las diferencias están en el formato de despliegue y en la longitud de entrada efectiva. No se dispone en la información proporcionada de datos comparativos con otros modelos de embeddings de distinto tamaño o familia.

## Limitaciones y advertencias

- El modelo está etiquetado únicamente para inglés; el rendimiento en otros idiomas no está garantizado.
- El tokenizador WordPiece de versiones antiguas de llama.cpp divide incorrectamente sílabas coreanas, elimina signos vocálicos de separación en escrituras índicas y del sur/sureste asiático, y no convierte palabras de más de 100 caracteres en `[UNK]` como el tokenizador de Hugging Face. El texto inglés y latino con acentos no se ve afectado. Hay una corrección propuesta en `ggml-org/llama.cpp#32693` (issue `#32684`); hasta que esté en la build usada, los embeddings de coreano e índico diferirán del modelo original.
- Diferencia de longitud de entrada: el GGUF admite 512 tokens y `llama-server` rechaza entradas mayores que el tamaño de batch en lugar de truncarlas; para reproducir exactamente los embeddings de sentence-transformers hay que truncar a 256 tokens.
- Riesgo de alucinación no aplicable en el sentido generativo: el modelo no genera texto, solo produce vectores; el riesgo es de recuperación irrelevante si los embeddings no discriminan bien en el dominio de uso.
- Conversiones hechas con otras revisiones de llama.cpp pueden diferir en metadatos y, por tanto, en checksum, aunque los pesos sean idénticos.
- Licencia Apache-2.0, que permite uso comercial; se recomienda revisar la model card del modelo base para condiciones de atribución y datos de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional más allá de la evaluación publicada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infil00p/all-MiniLM-L6-v2-GGUF
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Exportación ONNX de referencia: https://huggingface.co/Xenova/all-MiniLM-L6-v2
- Dataset de evaluación: https://huggingface.co/datasets/Mozilla/history-search-retrieval
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request de corrección del tokenizador: https://github.com/ggml-org/llama.cpp/pull/32693
- Issue del tokenizador: https://github.com/ggml-org/llama.cpp/issues/32684
- Documentación de sentence-transformers: https://www.sbert.net/
