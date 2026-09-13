# scottlowry/Qwen3-VL-Embedding-8B-omlx

## Resumen

Qwen3-VL-Embedding-8B-omlx es una redistribución reparada del checkpoint Qwen/Qwen3-VL-Embedding-8B de Alibaba Qwen, publicada por el usuario scottlowry para hacerlo cargable en runtimes basados en MLX (oMLX, mlx-vlm, mlx-embeddings). Se trata de un modelo multimodal de representaciones (embeddings) de 8.144.793.840 parámetros (~8,14 B) con arquitectura Qwen3-VL, orientado a similitud semántica entre pares texto-texto e imagen-texto (pipeline sentence-similarity).

El problema que resuelve es puramente de compatibilidad de carga, no de calidad. El checkpoint original se distribuye sin la clave `lm_head` y mlx-vlm aborta con el error `missing 1 parameters language_model.lm_head.weight`, porque su árbol de modelo declara ese parámetro al tener `tie_word_embeddings: false` en el `config.json`. Este repositorio añade un único tensor `lm_head.weight` de forma [151936, 4096] en bfloat16, copia byte a byte de `embed_tokens.weight`, más un quinto shard y el `model.safetensors.index.json` actualizado; los cuatro shards originales quedan intactos.

Su relevancia es específica y acotada: no incorpora entrenamiento adicional ni mejoras de rendimiento, sino que desbloquea la ejecución del modelo de embeddings multimodal de Qwen en Apple Silicon. Los pesos siguen siendo obra de Qwen, bajo licencia Apache-2.0, y el repositorio tiene un uso residual (10 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (vision-language), variante de embeddings; número de capas y cabezas no disponible |
| Parámetros totales | 8.144.793.840 (~8,14 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | BF16 sin cuantizar (este repositorio). Build companion cuantizada descrita por el autor como oQe "enhanced" 4-bit, group size 64, affine, bfloat16, calibrada con imatrix (128 muestras, seq len 512, perfil `oqe_code_multilingual`); el nombre del repositorio companion es `oQ6e`, lo que sugiere 6 bits, dato no confirmado |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), 5 shards + `model.safetensors.index.json` |
| Dimensión oculta | 4096 (deducida de la forma de `lm_head.weight`: 151936 × 4096) |
| Tamaño de vocabulario | 151936 |
| Número de tensores | 750 (749 en el checkpoint original) |
| Tamaño del repositorio | 17,5 GB |
| Tensor añadido | `lm_head.weight`, forma [151936, 4096], bfloat16, 1.244.659.712 bytes |
| Modelo base | Qwen/Qwen3-VL-Embedding-8B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de la familia Qwen3-VL: un transformer multimodal con torre de visión y modelo de lenguaje, aquí configurado en su variante de embeddings. El checkpoint original contiene 749 tensores y ninguna clave `lm_head.*`; la única copia de la matriz de embeddings es `model.language_model.embed_tokens.weight`, y la normalización final `model.language_model.norm.weight` alimenta directamente la salida de embeddings. Esto es coherente con un modelo que nunca calcula logits: la representación se obtiene del `last_hidden_state` o de un pooling posterior, cuyo método exacto no se documenta en la información disponible.

No hay entrenamiento nuevo en este repositorio. La modificación consiste en añadir un tensor `lm_head.weight` idéntico a `embed_tokens.weight` (convención de embeddings atados), empaquetado como `model-00005-of-00005.safetensors`, y actualizar el `weight_map` y el `metadata.total_size` del índice. El nombre sin prefijo es deliberado: la función `sanitize()` de mlx-vlm reescribe cualquier clave que contenga `model.` hacia `language_model.model.*`, de modo que un nombre prefijado `model.language_model.lm_head.weight` no coincidiría con ningún parámetro del árbol y provocaría `Received 1 parameters not in model`. Con el nombre `lm_head.weight` se activa la rama que lo mapea a `language_model.lm_head.weight`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO para el modelo base.

## Capacidades

- Generación de embeddings multimodales: representaciones vectoriales de texto e imágenes en un espacio compartido, con pipeline declarado `sentence-similarity`.
- Recuperación cruzada texto-imagen e imagen-texto (cross-modal retrieval), gracias a la torre de visión integrada.
- Similitud semántica y ranking entre pares de textos, entre pares de imágenes y entre texto e imagen.
- Uso como encoder en pipelines de RAG multimodal, con indexación y búsqueda por vecino más cercano.
- Extracción de representaciones del `last_hidden_state` para tareas posteriores (clustering, clasificación lineal, deduplicación).
- Compatibilidad de carga con MLX (mlx-vlm, mlx-embeddings, oMLX) como objetivo explícito de este repositorio.
- Capacidad de generación de texto: no aplicable en la práctica. El modelo no computa logits y el `lm_head` añadido solo satisface la comprobación estructural del cargador.
- Tool calling / function calling: no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Búsqueda visual en catálogos de producto: indexar las imágenes de un catálogo con el modelo y recuperar por consulta en lenguaje natural, aprovechando el espacio de embeddings compartido entre texto e imagen.
- RAG multimodal sobre documentación técnica: almacenar embeddings de capturas, diagramas y texto de manuales en una base vectorial para que un asistente recupere la evidencia correcta antes de responder.
- Deduplicación de datasets imagen-texto: calcular similitud coseno entre pares y descartar duplicados o casi duplicados antes de entrenar otros modelos, con umbral calibrado sobre la distribución real.
- Moderación y agrupación de contenido: agrupar publicaciones con imágenes y descripciones similares para revisión humana por lotes, en lugar de revisar elemento a elemento.
- Recomendación de contenido visual: construir un espacio de usuario-ítem a partir de embeddings de imágenes y descripciones para recuperar candidatos por similitud.
- Evaluación de calidad de anotaciones: detectar pares imagen-texto poco alineados comparando la similitud del embedding conjunto frente a un umbral, como filtro previo a la revisión manual.
- Prototipado local en Apple Silicon: ejecutar el modelo en un Mac con MLX para validar una arquitectura de recuperación multimodal sin depender de GPU dedicada, que es precisamente el escenario para el que se publicó esta reparación.
- Clasificación zero-shot de imágenes: comparar el embedding de cada imagen con los embeddings de descripciones textuales de cada clase y asignar la más cercana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna tabla de evaluación (MMLU, MTEB, MME, retrieval@k ni equivalentes), y la model card se limita a documentar el proceso de reparación y su verificación de carga. No se dispone tampoco de comparaciones numéricas con el checkpoint original de Qwen.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 16,3 GB (8.144.793.840 parámetros × 2 bytes) y el repositorio completo pesa 17,5 GB, incluyendo el `lm_head` redundante de ~1,24 GB. Con activaciones, torre de visión y caché, se recomienda reservar 20-24 GB de memoria unificada o VRAM.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, A6000, RTX 4090 (24 GB) al límite. En GPUs de 16 GB no cabe sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 / RTX 3090 de 24 GB en BF16. En configuraciones cuantizadas a 4-6 bits, el peso teórico baja a unos 4-6 GB, por lo que podría ejecutarse en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) y en Macs con memoria unificada de 16 GB o superior, aunque la cifra exacta depende del runtime y no está documentada.
- Apple Silicon: es el objetivo principal del repositorio. Compatible con mlx-vlm, mlx-embeddings y oMLX.
- Opciones de despliegue: transformers (carga estándar, sin necesidad del `lm_head`), mlx-vlm / mlx-embeddings / oMLX. El soporte en vLLM, TGI, TEI, Ollama o llama.cpp depende de que el runtime reconozca la arquitectura `qwen3_vl` y no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.
- Nota de eficiencia: el tensor añadido duplica la matriz de embeddings en disco y en memoria; si el runtime no lo exige, puede eliminarse para ahorrar ~1,24 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | `lm_head` | Formato | Licencia |
|---|---|---|---|---|---|---|
| scottlowry/Qwen3-VL-Embedding-8B-omlx | 8,14 B | No disponible | Texto + imagen | Añadido (atado a `embed_tokens`) | safetensors BF16, 5 shards | Apache-2.0 |
| Qwen/Qwen3-VL-Embedding-8B (base) | 8,14 B | No disponible | Texto + imagen | Ausente por diseño | safetensors BF16, 4 shards | Apache-2.0 |
| scottlowry/Qwen3-VL-Embedding-8B-omlx-oQ6e | 8,14 B | No disponible | Texto + imagen | Heredado del checkpoint reparado | safetensors cuantizado (oQe) | Apache-2.0 |

No se dispone en la información proporcionada de datos verificables de modelos alternativos de terceros (por ejemplo, otros modelos de embeddings multimodales de tamaño similar) para establecer una comparación de parámetros, contexto o rendimiento. Cualquier comparación numérica adicional requeriría consultar las fichas y evaluaciones oficiales de esos modelos.

## Limitaciones y advertencias

- No es un modelo generativo: el checkpoint original no incluye `lm_head` y no está pensado para producir texto. El tensor añadido solo satisface la comprobación estructural del cargador de mlx-vlm.
- Repositorio de terceros sin validación independiente: 10 descargas y 0 likes, sin evaluaciones publicadas. La única verificación reportada es que los cinco shards parsean con `safetensors.safe_open` (750 claves) y que `mlx_vlm.utils.load()` no devuelve error de parámetros faltantes.
- Modificación generada automáticamente: el propio README indica que fue redactado por un agente (Hermes Agent, Nous Research) apoyado en un modelo local, y que el propietario del repositorio no lo escribió. Conviene tratar la documentación como no revisada por Qwen.
- Impacto en el almacenamiento y la memoria: el tensor añadido pesa 1.244.659.712 bytes y duplica la matriz de embeddings, elevando el repositorio de 4 a 5 shards.
- Método de pooling no documentado: al obtenerse el embedding del `last_hidden_state`, la forma exacta de agregación (último token, media, pooling con instrucción) no se especifica. Usar un pooling distinto del esperado por el modelo base puede degradar la calidad de la similitud.
- Idiomas soportados: sin declarar. No se puede asumir cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto: no documentada en la información disponible, factor crítico si se piensa usar para indexar documentos largos o imágenes de alta resolución.
- Licencia: Apache-2.0, igual que el modelo base. Permite uso comercial, pero exige conservar los avisos de licencia y atribución; los pesos originales son obra de Qwen, no del autor del fork.
- Riesgo de alucinación: no aplica a la generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos en la similitud semántica. Cualquier umbral de decisión debe calibrarse con datos propios.
- Sesgos: no evaluados ni documentados en la información disponible. Se heredan los del modelo base y su dataset de entrenamiento.
- Compatibilidad de runtimes: fuera del ecosistema MLX y transformers, el soporte no está garantizado. Verificar la arquitectura `qwen3_vl` antes de integrarlo en un servidor de inferencia en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/scottlowry/Qwen3-VL-Embedding-8B-omlx
- Build cuantizada companion (oQ6e): https://huggingface.co/scottlowry/Qwen3-VL-Embedding-8B-omlx-oQ6e
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Paper, blog o repositorio adicional: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces obtenidos correspondían a páginas comerciales de moda sin relación con el contenido de esta ficha.
