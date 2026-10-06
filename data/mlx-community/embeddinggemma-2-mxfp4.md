# mlx-community/embeddinggemma-2-mxfp4

## Resumen

mlx-community/embeddinggemma-2-mxfp4 es una conversión al runtime MLX del modelo de embeddings google/embeddinggemma-2, publicada por el equipo mlx-community. Se trata de una cuantización de 4 bits en formato MXFP4 (group size 32) que conserva los cuatro codificadores del modelo original: texto, imagen, audio y vídeo. El modelo produce embeddings normalizados de 768 dimensiones y está etiquetado para tareas de feature-extraction, sentence-similarity y extracción de características multimodales.

El checkpoint contiene 744.371.512 parámetros (recuento real de safetensors) y ocupa 1.090 GB en disco (medida decimal) en su formato cuantizado. La política estándar de MLX-VLM cuantiza el codificador de texto y la proyección de audio, mientras que las torres de visión y audio y la proyección de visión permanecen en BF16. La ventana de contexto y la composición del dataset de entrenamiento del modelo base no se detallan en la información disponible.

Su relevancia práctica radica en que permite ejecutar localmente un modelo de embeddings multimodal de ~744M parámetros sobre silicio de Apple mediante MLX, con un peso muy reducido y licencia Apache-2.0, lo que facilita su integración en pipelines de recuperación y búsqueda semántica sin depender de GPUs NVIDIA. El autor advierte de una deriva medible en los embeddings por el bajo número de bits, por lo que recomienda comparar contra BF16 u 8 bits con datos de recuperación propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo de embeddings basado en google/embeddinggemma-2 con codificadores de texto, imagen, audio y vídeo |
| Parametros totales | 744.371.512 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4, 4 bits, group size 32; texto y proyección de audio cuantizados, torres de visión/audio y proyección de visión en BF16 |
| Idiomas soportados | Multilingüe (lista concreta de idiomas no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors); dimensión de embedding de 768, con truncado Matryoshka opcional a 128, 256 o 512 |
| Tamano del repositorio | 1.1 GB; almacenamiento de pesos 1.090 GB (decimal) |
| Pipeline | feature-extraction |
| Modelo base | google/embeddinggemma-2 (revisión 914f7f89142e33e77833254d9c9b90c3cef7303b) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base google/embeddinggemma-2 más allá de que se trata de un modelo de embeddings con codificadores separados para texto, imagen, audio y vídeo, y de que genera representaciones normalizadas de 768 dimensiones. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se especifica el mecanismo de atención ni si incorpora innovaciones tipo atención lineal o decodificación especulativa.

La innovación de esta ficha concreta es la conversión a MLX con cuantización MXFP4 de 4 bits y group size 32, realizada con MLX 0.32.3 y MLX-VLM (revisión 3d87e884, rama pc/embeddinggemma-2). La cuantización afecta al codificador de texto y a la proyección de audio; las torres de visión y audio y la proyección de visión se mantienen en BF16. El modelo soporta truncado Matryoshka a 128, 256, 512 o 768 dimensiones, y el autor indica explícitamente que no debe convertirse a float16: los pesos y activaciones no cuantizados deben permanecer en BF16.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones para búsqueda semántica y similitud de frases.
- Embeddings multimodales: incluye codificadores y pesos de procesamiento para imagen, audio y vídeo, además del texto.
- Soporte de entradas combinadas texto+imagen (la validación cubre el caso text_image).
- Truncado Matryoshka para reducir la dimensionalidad del embedding a 128, 256 o 512 sin reentrenar.
- Multilingüe: la model card declara soporte multilingüe y las comprobaciones cubren seis entradas de texto en varios idiomas.
- Prefijos de tarea: se aplican las plantillas definidas en config_sentence_transformers.json, con formatos como "task: search result | query: ..." y "title: none | text: ...".
- Compatible con flujos de sentence-similarity y feature-extraction mediante MLX-VLM.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica y RAG multilingüe: indexar documentos con el prefijo de documento adecuado y consultar con el prefijo de query, usando los 768 (o menos con Matryoshka) para recuperar pasajes relevantes en varias lenguas. Adecuado por su carácter multilingüe y su bajo coste de cómputo.
- Recuperación multimodal texto-imagen: generar embeddings de imágenes y de consultas textuales en el mismo espacio para construir buscadores visuales o motores de búsqueda interna sobre catálogos. La validación cubre entradas de imagen y texto+imagen.
- Indexación y búsqueda sobre audio: vectorizar pistas o segmentos de audio y permitir consultas de similitud, aprovechando que el codificador de audio permanece en BF16 y mantiene mayor fidelidad.
- Búsqueda sobre vídeo: la validación con fotogramas sintéticos de vídeo indica que el modelo genera embeddings de vídeo, útil para localizar momentos o clips similares dentro de un archivo.
- Deduplicación y agrupamiento (clustering) de contenidos: calcular embeddings y agrupar o eliminar duplicados por distancia coseno en corpus de texto, imágenes o mezclas.
- Sistemas de recomendación por similitud: representar ítems y consultas de usuario en el mismo espacio vectorial para sugerir contenidos relacionados sin un motor de recomendación dedicado.
- Clasificación y filtrado zero-shot: usar la similitud con descripciones de categoría como clasificador ligero para moderación o etiquetado de contenido sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MTEB, etc.) en la información disponible. La model card solo incluye comprobaciones numéricas de deriva de la cuantización frente al checkpoint original en PyTorch FP32, que no constituyen una evaluación de calidad de recuperación.

| Entrada | Coseno minimo vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0.955243 | 0.031123 |
| image | 0.984482 | 0.028382 |
| text | 0.971975 | 0.030078 |
| text_image | 0.981411 | 0.022458 |
| video | 0.979497 | 0.032354 |

Todas las salidas comprobadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. En la prueba de recuperación de texto, el pasaje sobre Marte se clasificó por encima del pasaje sobre Venus. El autor indica que las mediciones completas, incluidas las comparaciones con vectores truncados, están en validation.json.

## Requisitos de hardware

- Los pesos ocupan 1.090 GB (decimal) en MXFP4; con las torres en BF16 y las activaciones, la huella en memoria estimada se sitúa en el orden de 2-3 GB, aunque no se publica una cifra oficial de VRAM.
- El formato es MLX, por lo que la inferencia nativa requiere Apple Silicon (M1/M2/M3/M4) con Metal. No está orientado a CUDA ni a GPUs NVIDIA de forma directa.
- Cabe en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada; el requisito de memoria es mínimo para su tamaño.
- Para desplegarlo en GPUs consumer o servidores x86 habría que reconvertir los pesos a otro runtime; no se proporciona una conversión equivalente en la información disponible.
- Opciones de despliegue documentadas: MLX-VLM (revisión 3d87e884), mlx>=0.32.3 y transformers>=5.18.0. Para instrucciones de tarea basta con AutoTokenizer; el procesamiento de imagen, audio y vídeo requiere una build de Transformers que exponga EmbeddingGemma2Processor (la validación usó una build 5.18.0.dev0).
- No hay datos publicados de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mlx-community/embeddinggemma-2-mxfp4 | 744.371.512 | No disponible | MLX MXFP4 4 bits | Apache-2.0 | Conversión de 4 bits con deriva medible; peso 1.090 GB |
| google/embeddinggemma-2 (referencia original) | Mismo recuento de parámetros que la conversión | No disponible | Safetensors (BF16/FP32) | Apache-2.0 | Referencia de fidelidad usada en las comprobaciones de deriva |
| Variante de 8 bits del mismo modelo base | No disponible | No disponible | No disponible en la información proporcionada | Apache-2.0 | El autor la menciona como alternativa con menor deriva, pero no se especifica su identificador |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otros modelos de embeddings multilingües comparables en la información proporcionada, por lo que no se incluye una comparación adicional.

## Limitaciones y advertencias

- Deriva de embeddings por la cuantización de 4 bits: la similitud coseno mínima frente a FP32 cae hasta 0.955 en audio y 0.972 en texto. No es un modelo con pérdida despreciable.
- El autor recomienda comparar contra BF16 u 8 bits con datos de recuperación propios cuando la fidelidad del embedding sea crítica.
- No debe convertirse a float16: los pesos y activaciones no cuantizados deben mantenerse en BF16.
- Las comprobaciones incluidas son de tipo numérico (smoke test), no una evaluación de calidad de recuperación tipo MTEB; no deben interpretarse como rendimiento de búsqueda.
- El procesamiento de imagen, audio y vídeo depende de una build de Transformers que exponga EmbeddingGemma2Processor; la versión estándar de PyPI 5.18.0 no lo incluye todavía, lo que puede dificultar su uso multimodal en producción.
- La lista concreta de idiomas soportados no está disponible; solo se declara "multilingüe" de forma genérica.
- Limitaciones de sesgo, alucinación y contexto heredadas del modelo base google/embeddinggemma-2: la model card de esta conversión remite a la del original y no las detalla.
- Al ser un modelo de embeddings, no genera texto ni admite tool calling; no debe usarse para tareas generativas.
- Licencia Apache-2.0: permite uso comercial conservando la atribución a Google. El autor indica que esta conversión preserva la licencia del modelo fuente.
- Aplicar prefijos de tarea coherentes entre query y documento es obligatorio; mezclar dimensiones de embedding entre consultas y documentos invalida la recuperación.

## Enlaces

- HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-mxfp4
- Modelo base (Google EmbeddingGemma 2): https://huggingface.co/google/embeddinggemma-2
- Revisión del modelo fuente: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM (revisión de conversión): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Fichero de validación de la conversión: validation.json (incluido en el repositorio del modelo)
