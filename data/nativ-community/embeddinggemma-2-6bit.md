# nativ-community/embeddinggemma-2-6bit

## Resumen

nativ-community/embeddinggemma-2-6bit es una conversión al formato MLX del modelo de embeddings multimodal google/embeddinggemma-2, publicada por el usuario comunitario nativ-community. El modelo conserva los codificadores de texto, imagen, audio y vídeo del checkpoint original y produce embeddings normalizados de 768 dimensiones, con soporte de truncado Matryoshka a 128, 256 o 512 dimensiones. La conversión aplica cuantización affine de 6 bits con tamaño de grupo 64 sobre el codificador de texto y la proyección de audio, mientras que las torres de visión y audio y la proyección de visión permanecen en BF16.

El interés principal de esta ficha es práctico: se trata de un artefacto pensado para ejecutar búsqueda semántica y recuperación multimodal en hardware Apple Silicon mediante MLX, sin depender de CUDA. El repositorio ocupa 1,2 GB y los pesos ocupan 1,166 GB en decimal, con 744.371.512 parámetros declarados en los safetensors del repositorio. La licencia es Apache 2.0, heredada del modelo base.

Se trata de un modelo sin tracción verificable por el momento: cero descargas y cero "likes" en el momento de la consulta, publicado el 6 de octubre de 2026. Las comprobaciones incluidas por el autor son verificaciones numéricas de conversión frente al checkpoint original en PyTorch FP32, no evaluaciones de calidad de recuperación tipo MTEB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; se describe como modelo de embeddings multimodal (texto, imagen, audio y vídeo) derivado de google/embeddinggemma-2 |
| Parámetros totales | 744.371.512 (pesos safetensors del repositorio) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 6 bits affine, group size 64 (codificador de texto y proyección de audio); torres de visión y audio y proyección de visión en BF16 |
| Idiomas soportados | Multilingüe (sin lista detallada de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para MLX (librería mlx, integración mlx-vlm) |
| Dimensión del embedding | 768, normalizado; truncado Matryoshka a 128, 256, 512 o 768 |
| Tamaño de los pesos | 1,166 GB (decimal); repositorio de 1,2 GB |
| Modalidades | Texto, imagen, audio, vídeo y combinaciones texto+imagen |
| Pipeline declarado | feature-extraction |
| Revisión del modelo base | 914f7f89142e33e77833254d9c9b90c3cef7303b |
| Herramientas de conversión | MLX-VLM revisión 3d87e884 (rama pc/embeddinggemma-2), MLX 0.32.3 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna ni los datos de entrenamiento del modelo base; remite explícitamente a la model card original de google/embeddinggemma-2 para información sobre uso previsto, entrenamiento, evaluación y limitaciones. Lo que sí se documenta es la estructura de la conversión: un codificador de texto cuantizado en 6 bits junto con la proyección de audio, y torres de visión y audio más la proyección de visión mantenidas en BF16. El modelo incorpora codificadores de cuatro modalidades (texto, imagen, audio y vídeo) que proyectan a un espacio común de 768 dimensiones.

El proceso de conversión es reproducible con el comando documentado por el autor: `python -m mlx_vlm convert --hf-path google/embeddinggemma-2 --revision 914f7f89142e33e77833254d9c9b90c3cef7303b --mlx-path embeddinggemma-2-6bit --dtype bfloat16 -q --q-mode affine --q-bits 6 --q-group-size 64`. El autor advierte que las ponderaciones y activaciones no cuantizadas deben permanecer en BF16 y que el modelo no debe convertirse a float16. No se documentan detalles sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO en la información disponible.

Las verificaciones de conversión reportadas consisten en comparaciones numéricas (coseno mínimo y error absoluto máximo) frente al checkpoint original ejecutado en PyTorch FP32, además de una prueba de recuperación de texto que ordena un pasaje sobre Marte por encima de uno sobre Venus. Estas comprobaciones son de tipo smoke test, no un benchmark de calidad de recuperación.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones para similitud semántica y recuperación.
- Embeddings de imagen, audio y vídeo (incluido vídeo de dos fotogramas en las pruebas del autor) en el mismo espacio vectorial que el texto.
- Embeddings conjuntos de texto e imagen (entrada text_image).
- Truncado Matryoshka a 128, 256, 512 o 768 dimensiones, con renormalización posterior mediante norma L2.
- Soporte multilingüe declarado, con seis entradas de texto multilingües verificadas durante la conversión.
- Uso con prefijos de tarea definidos en `config_sentence_transformers.json` (por ejemplo `task: search result | query:` y `title: none | text:`).
- No es un modelo generativo: no produce texto, razonamiento, código ni respuestas; su salida son vectores.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documentan modos especiales como thinking mode ni decodificación especulativa.

## Casos de uso

- Búsqueda semántica y RAG sobre documentación técnica: indexar fragmentos con el prefijo de documento correspondiente y consultar con `task: search result | query:`, aprovechando los 768 dimensiones para alimentar una base vectorial.
- Recuperación multimodal en bases de conocimiento: indexar imágenes, audio y vídeo junto con texto en un único índice vectorial, de forma que una consulta textual recupere elementos de cualquier modalidad.
- Deduplicación y clustering de contenido a gran escala: el truncado Matryoshka a 128 o 256 dimensiones reduce el coste de almacenamiento y acelera la similitud coseno en colecciones grandes, a cambio de perder granularidad.
- Clasificación zero-shot de documentos: comparar el embedding de un texto contra embeddings de etiquetas descriptivas escritas con el prefijo de tarea adecuado.
- Sistemas de recomendación por similitud de contenido: representar ítems y perfiles de usuario como vectores de 768 dimensiones y ordenar candidatos por producto escalar.
- Inferencia local con privacidad en Mac: al ejecutarse sobre MLX en Apple Silicon, permite indexar corpus sensibles sin enviar datos a servicios externos.
- Moderación o filtrado de contenido mediante similitud: comparar entradas contra un conjunto de vectores de referencia de contenido no deseado.
- Búsqueda dentro de aplicaciones de escritorio en macOS: el tamaño de pesos de 1,166 GB permite incrustar el modelo en una app local con un consumo de memoria moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MTEB u otros) en la información disponible. El autor indica expresamente que las comprobaciones realizadas son verificaciones numéricas de conversión, no evaluaciones de recuperación.

| Entrada | Coseno mínimo frente a FP32 | Error absoluto máximo |
|---|---:|---:|
| audio | 0,998277 | 0,007221 |
| image | 0,999374 | 0,004241 |
| text | 0,997741 | 0,007285 |
| text_image | 0,998703 | 0,007021 |
| video | 0,998988 | 0,005243 |

Todas las salidas verificadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. Las mediciones completas, incluidas las comparaciones con vectores truncados, están en el archivo `validation.json` del repositorio.

## Requisitos de hardware

- El almacenamiento de pesos es de 1,166 GB en decimal (repositorio de 1,2 GB) en formato 6 bits. La memoria en tiempo de ejecución será superior a esa cifra por el estado de activaciones y el tokenizador; no se publica un valor medido, por lo que cualquier cifra adicional es estimación, no dato del autor.
- El modelo está orientado a Apple Silicon mediante MLX: requiere macOS con chip M-series y memoria unificada. No se documenta soporte CUDA para esta conversión.
- Entorno de ejecución: `mlx>=0.32.3`, `transformers>=5.18.0` y la implementación `mlx-vlm` en la revisión `3d87e884`.
- El texto funciona con `AutoTokenizer` y no requiere el procesador multimodal. La imagen, el audio y el vídeo requieren una build de Transformers que exponga `EmbeddingGemma2Processor`; la validación se hizo con una build `5.18.0.dev0` y la versión estándar de PyPI `5.18.0` no expone ese procesador.
- Opciones de despliegue documentadas: `mlx_vlm.embedding_loader.load_embedding_model` para texto y `mlx_vlm.load` para uso multimodal. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables en el material proporcionado. La única referencia directa es el checkpoint original del que deriva esta conversión, que se compara a continuación en los aspectos sí documentados.

| Modelo | Parámetros | Contexto | Formato y precisión | Licencia |
|---|---|---|---|---|
| nativ-community/embeddinggemma-2-6bit | 744.371.512 | No disponible | safetensors MLX, 6 bits affine + BF16 | Apache 2.0 |
| google/embeddinggemma-2 (modelo base) | No disponible | No disponible | safetensors para PyTorch, FP32/BF16 en la validación | Apache 2.0 |
| Otras alternativas de embeddings multimodales | No disponible en la información proporcionada | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo comunitario de conversión, no una publicación oficial de Google; el autor no publica evaluación de calidad de recuperación.
- Sin tracción verificable: cero descargas y cero "likes" en el momento de la consulta, con fecha de publicación del 6 de octubre de 2026.
- Las únicas métricas reportadas miden fidelidad numérica frente al checkpoint FP32 (coseno mínimo de 0,997741 en texto), no utilidad semántica ni rendimiento en tareas reales.
- No debe convertirse a float16: el autor indica que las ponderaciones y activaciones no cuantizadas deben mantenerse en BF16.
- El uso multimodal requiere una build de Transformers que exponga `EmbeddingGemma2Processor`; con la versión estable de PyPI el procesador no está disponible.
- Al tratarse de una conversión MLX, la portabilidad fuera del ecosistema Apple Silicon no está documentada.
- Longitud de contexto no disponible: los documentos largos tendrán que fragmentarse sin conocer el límite real del modelo.
- No es un modelo generativo, por lo que no cabe atribuirle alucinación de texto; el riesgo asociado es de recuperación incorrecta o similitud espuria en el espacio vectorial.
- Sesgos: heredados del entrenamiento del modelo base de Google y no reevaluados en esta conversión.
- Al truncar a 128, 256 o 512 dimensiones hay que renormalizar los vectores, y consultas y documentos deben compartir la misma dimensión.
- Licencia Apache 2.0, que permite uso comercial, siempre que se conserve la atribución a Google tal como indica el autor.
- Conviene revisar la model card original de google/embeddinggemma-2 para uso previsto, evaluación y limitaciones, ya que esta conversión no las reproduce.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-6bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revisión concreta del modelo base usada en la conversión: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Implementación MLX-VLM (revisión usada): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Nota: las búsquedas web realizadas no devolvieron resultados relacionados con este modelo; los enlaces encontrados corresponden a entidades homónimas sin relación (aprendizaje de idiomas, agencias de viaje, moda y un tutor de PDF), por lo que se omiten.
