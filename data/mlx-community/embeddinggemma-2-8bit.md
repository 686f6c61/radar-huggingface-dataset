# mlx-community/embeddinggemma-2-8bit

## Resumen

mlx-community/embeddinggemma-2-8bit es una conversión al formato MLX del modelo de embeddings multimodal google/embeddinggemma-2, publicada por la comunidad mlx-community. Se distribuye cuantizada en 8 bits (modo affine, tamano de grupo 64) y conserva los cuatro codificadores del modelo original: texto, imagen, audio y vídeo. Genera embeddings normalizados de 768 dimensiones, con soporte de truncado Matryoshka a 128, 256 o 512 dimensiones.

El modelo resuelve tareas de recuperación semántica y búsqueda multimodal (texto-texto, texto-imagen, texto-audio, texto-vídeo) sobre hardware Apple Silicon mediante MLX, evitando la dependencia de CUDA. Su relevancia actual radica en que permite ejecutar localmente un modelo de embeddings multimodal sin GPU dedicada, algo poco habitual en esta categoría.

El checkpoint contiene 744.371.512 parámetros reales (según safetensors) y un almacenamiento de pesos de 1,234 GB en decimal. La conversión no entrena pesos nuevos: reproduce numéricamente el checkpoint original de Google (revisión `914f7f89142e33e77833254d9c9b90c3cef7303b`) y conserva la licencia Apache-2.0 del modelo fuente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de embeddings (codificadores de texto, imagen, audio y vídeo con proyecciones); detalle interno no disponible |
| Parametros totales | 744.371.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits affine, tamaño de grupo 64 (codificador de texto y proyección de audio); torres de visión y audio y proyección de visión en BF16 |
| Idiomas soportados | multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); almacenamiento de 1,234 GB en decimal |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal. El checkpoint convertido integra explícitamente codificadores de texto, imagen, audio y vídeo, junto con sus proyecciones hacia un espacio común de embeddings. La política de cuantización aplicada es la estándar de MLX-VLM: se cuantizan a 8 bits el codificador de texto y la proyección de audio, mientras que las torres de visión y audio, y la proyección de visión, permanecen en BF16. Se recomienda mantener pesos y activaciones no cuantizados en BF16 y no convertir el modelo a float16.

No se ha realizado entrenamiento ni ajuste alguno por parte de mlx-community: se trata de una conversión de pesos. La conversión se generó con la revisión `3d87e884` de MLX-VLM (rama `pc/embeddinggemma-2`) y MLX 0.32.3, mediante `mlx_vlm convert` con `--dtype bfloat16 -q --q-mode affine --q-bits 8 --q-group-size 64`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones, orientados a similitud semántica y recuperación.
- Extracción de características de imagen, audio y vídeo (tags `image-feature-extraction`, `audio-feature-extraction`, `video-feature-extraction`), con soporte de entradas combinadas texto+imagen.
- Truncado Matryoshka: los embeddings pueden recortarse a 128, 256, 512 o 768 dimensiones manteniendo la normalización.
- Multilingüe, según los metadatos y las comprobaciones de conversión sobre seis entradas de texto en varios idiomas.
- Prefijos de tarea configurables a través de `config_sentence_transformers.json` (por ejemplo, `task: search result | query:` o `title: none | text:`).
- No se documenta en la información disponible soporte de tool calling, function calling ni razonamiento multi-paso, ya que se trata de un modelo de embeddings y no generativo en el sentido conversacional.

## Casos de uso

- Búsqueda semántica multilingüe sobre corpus documentales: indexar pasajes con el prefijo de documento y consultar con el prefijo de query, aprovechando las 768 dimensiones normalizadas para similitud por producto escalar.
- Recuperación aumentada (RAG) en local: usar el modelo como recuperador denso en Apple Silicon sin GPU dedicada, reduciendo coste de infraestructura.
- Búsqueda multimodal texto-imagen: indexar imágenes mediante el codificador de visión y recuperarlas a partir de consultas textuales, útil en catálogos de producto o archivos fotográficos.
- Búsqueda texto-audio y texto-vídeo: localizar fragmentos de audio o fotogramas relevantes a partir de descripciones en lenguaje natural, por ejemplo en archivos de medios.
- Deduplicación y clustering de documentos: agrupar textos, imágenes o vídeos por similitud de embeddings para limpiar datasets.
- Sistemas de recomendación por similitud de contenido: calcular afinidad entre elementos y preferencias expresadas en texto.
- Clasificación por vecindad (k-NN sobre embeddings) en pipelines de moderación o etiquetado, al no requerir un cabezal entrenado adicional.
- Indexado eficiente con vectores truncados a 256 o 512 dimensiones para reducir memoria y latencia en bases vectoriales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la información disponible. El autor indica explícitamente que las comprobaciones incluidas son verificación numérica de la conversión, no una evaluación de calidad de recuperación.

Tabla de comprobaciones de conversión (coseno mínimo y error absoluto máximo frente al checkpoint original en PyTorch FP32):

| Entrada | Coseno minimo vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,999804 | 0,002476 |
| image | 0,999890 | 0,001937 |
| text | 0,999814 | 0,002299 |
| text_image | 0,999823 | 0,002105 |
| video | 0,999836 | 0,002130 |

Todas las salidas comprobadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. La prueba de recuperación de texto situó el pasaje sobre Marte por encima del de Venus.

## Requisitos de hardware

- Almacenamiento de pesos: 1,234 GB en decimal, según el autor del repositorio.
- VRAM/unified memory estimada: no disponible de forma oficial; partiendo de los 744 millones de parámetros y de la mezcla de pesos en 8 bits y BF16, una estimación razonable es de 2 a 3 GB incluyendo activaciones y overhead del runtime (valor estimado, no confirmado por el autor).
- Tipo de acelerador: el modelo está en formato MLX, por lo que está pensado para memoria unificada de Apple Silicon (familias M1, M2, M3, M4). No se documenta compatibilidad con CUDA.
- GPU recomendadas (A100, H100, RTX 4090): no aplica al formato MLX; no disponible.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada (estimación derivada del tamaño de pesos, no confirmada oficialmente).
- Opciones de despliegue: MLX y MLX-VLM (versión `3d87e884` o superior), con MLX >= 0.32.3. La preprocesación multimodal requiere una build de Transformers que exponga `EmbeddingGemma2Processor` (validado con 5.18.0.dev0; la 5.18.0 de PyPI no lo expone todavía).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| mlx-community/embeddinggemma-2-8bit | 744.371.512 | no disponible | texto, imagen, audio, vídeo | apache-2.0 | safetensors (MLX, 8-bit affine) |
| google/embeddinggemma-2 | no disponible | no disponible | texto, imagen, audio, vídeo | apache-2.0 | safetensors (PyTorch, precisión original) |
| Otros modelos de embeddings comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento que permitan comparar este modelo con alternativas de la misma categoría (por ejemplo, otros modelos de embeddings multilingües abiertos). La única comparación documentada es numérica contra el checkpoint original en FP32, recogida en la sección anterior.

## Limitaciones y advertencias

- No es un modelo generativo conversacional: su salida son embeddings, no texto.
- No se han publicado evaluaciones de calidad de recuperación (MTEB u otras), únicamente comprobaciones numéricas de conversión.
- Es una conversión comunitaria; la responsabilidad sobre el comportamiento del modelo base recae en el checkpoint original de Google.
- Debe mantenerse en BF16: el autor indica explícitamente que no se convierta el modelo a float16.
- Queries y documentos deben usar la misma dimensión de embedding; mezclar dimensiones truncadas y completas invalida las comparaciones.
- La preprocesación de imagen, audio y vídeo requiere una build de Transformers no estándar que exponga `EmbeddingGemma2Processor`; con versiones estables actuales puede no estar disponible.
- Sesgos conocidos: no disponibles en la información proporcionada, aunque al derivar de un modelo entrenado con datos web y multilingües es plausible la presencia de sesgos propios de ese tipo de corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir recuperaciones irrelevantes si los embeddings son de baja calidad para un dominio concreto.
- Lista de idiomas exacta y cobertura real por idioma: no disponibles; los metadatos solo indican `multilingual`.
- Longitud de contexto: no disponible, lo que impide planificar troceado de documentos con precisión.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar la atribución a Google y el aviso de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-8bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revisión del modelo fuente: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM (revisión usada para la conversión): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
