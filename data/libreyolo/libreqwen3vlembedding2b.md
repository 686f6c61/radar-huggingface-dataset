# LibreYOLO/LibreQwen3VLEmbedding2b

## Resumen

LibreQwen3VLEmbedding2b es un espejo de pesos del modelo Qwen/Qwen3-VL-Embedding-2B, publicado por el proyecto LibreYOLO para su uso dentro de la tarea de embeddings de LibreVLM. No se trata de un modelo nuevo ni de un fine-tuning: el autor declara explícitamente que no se ha modificado ningún parámetro aprendido y que el repositorio se limita a preservar los ficheros de la instantánea de Hugging Face necesarios para el wrapper VLM de LibreYOLO, sustituyendo la model card original por notas de carga propias.

El modelo subyacente es un embedding multimodal de Qwen (Tongyi Lab, Alibaba Group) con 2.127.532.032 parámetros en formato safetensors y un tamaño de repositorio de 4,3 GB. Su pipeline declarado es `sentence-similarity` con la etiqueta `image-text-to-text`, lo que indica que produce representaciones vectoriales conjuntas para imágenes y texto, con salida de 2048 dimensiones según el ejemplo de uso de la model card.

Su relevancia es operativa: permite a los usuarios de LibreYOLO disponer de un encoder imagen-texto empaquetado y cargable mediante `libreyolo.LibreVLM`, con licencia Apache 2.0 y trazabilidad al commit original de Qwen. No hay métricas de rendimiento, idiomas ni detalles de entrenamiento publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-VL; familia transformer multimodal, sin detalle en la información proporcionada) |
| Parámetros totales | 2.127.532.032 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo base Qwen3-VL-Embedding-2B más allá de su pertenencia a la familia Qwen3-VL y de su función como modelo de embeddings multimodal con pipeline `sentence-similarity`. La model card del espejo no describe capas, mecanismos de atención, tipo de pooling ni dimensionalidad del espacio de embedding, aunque el ejemplo de código sugiere vectores de 2048 dimensiones por imagen.

Respecto al entrenamiento, la información disponible no incluye número de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO o entrenamiento contrastivo. Lo único verificable es que este repositorio no introduce cambios en los pesos: es una copia del commit `9f2f7e710d6d81056aa5c0a4f04764fec6bb7bda` del repositorio original de Qwen, con la model card reemplazada por notas de carga de LibreYOLO.

## Capacidades

- Generación de embeddings multimodales: produce representaciones vectoriales de imágenes (una fila unitaria por imagen, según el ejemplo) y de texto.
- Búsqueda y recuperación imagen-texto: el ejemplo de la model card calcula similitudes mediante producto escalar entre embeddings de consulta textual y embeddings de páginas.
- Embeddings de texto con prompt: la API `embed_text` acepta un prompt de instrucción ("Retrieve images or text relevant to the user's query"), lo que sugiere soporte de instrucciones para orientar la recuperación.
- Integración con el ecosistema LibreYOLO mediante la clase `LibreVLM`.
- Capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda documental multimodal: indexar un directorio de páginas escaneadas con `model.embed("pages/")` y recuperar las páginas relevantes ante una consulta textual como "total due on the invoice", usando la similitud entre el vector de consulta y la matriz de embeddings de páginas.
- Clasificación y deduplicación de imágenes: calcular embeddings de un lote de imágenes y agrupar por similitud coseno para detectar duplicados o agrupar visualmente contenido similar en un archivo digital.
- Recuperación aumentada (RAG) sobre documentos con figuras: combinar los embeddings de imagen con un índice de texto para que un pipeline RAG recupere tanto fragmentos textuales como páginas o figuras relevantes.
- Filtrado de contenido en pipelines de visión: usar la similitud entre una descripción textual y los embeddings de imágenes para descartar o etiquetar imágenes que no cumplen un criterio definido en lenguaje natural.
- Enrutamiento de consultas en asistentes: dado un mensaje de usuario, comparar su embedding con un conjunto de descripciones de tareas o intenciones para dirigir la petición al módulo adecuado.
- Prototipado de motores de búsqueda visual internos: al estar bajo Apache 2.0 y con pesos safetensors, permite desplegar un servicio de búsqueda imagen-texto sin dependencias de licencias restrictivas, integrándolo en el stack de LibreYOLO ya existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (2,13 mil millones de parámetros), los pesos en fp16 ocuparían aproximadamente 4,3 GB, en fp32 unos 8,5 GB y en int8 unos 2,1 GB; estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; por tamaño de pesos, cabría en GPUs consumer con al menos 8 GB de VRAM en fp16, pero no hay validación publicada.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` con la clase `LibreVLM` y el identificador `qwen3-vl-embedding-2b`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LibreQwen3VLEmbedding2b | 2.127.532.032 | no disponible | Apache 2.0 | Hugging Face (espejo) | Espejo sin cambios de pesos de Qwen3-VL-Embedding-2B |
| Qwen/Qwen3-VL-Embedding-2B | no disponible en la información | no disponible | Apache 2.0 | Hugging Face (original) | Modelo fuente, mantenido por Tongyi Lab (Alibaba) |
| Otros modelos de embedding imagen-texto de tamaño ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparativa se limita al modelo original y a su espejo; no se han proporcionado alternativas de la misma categoría con datos verificables.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación del modelo base Qwen3-VL-Embedding-2B se hereda sin cambios, ya que no se ha modificado ningún parámetro.
- Ausencia de documentación técnica: la model card del espejo no detalla contexto máximo, idiomas, cuantizaciones ni comportamiento esperado, lo que dificulta planificar su uso en producción.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; al tratarse de un modelo de embeddings, el riesgo se traslada a recuperaciones irrelevantes o sesgadas más que a texto generado.
- Idiomas: no se especifica qué lenguas cubre el encoder; no se puede asumir cobertura multilingüe sin verificación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene conservar el fichero `NOTICE` y la atribución a Tongyi Lab, Alibaba Group, tal como indica la model card.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Dependencia de la librería `libreyolo`: la vía de carga documentada requiere esa librería, lo que añade una dependencia específica del ecosistema frente a usar directamente el modelo original.

## Enlaces

- Repositorio del espejo: https://huggingface.co/LibreYOLO/LibreQwen3VLEmbedding2b
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Commit de origen: `9f2f7e710d6d81056aa5c0a4f04764fec6bb7bda` (repositorio Qwen/Qwen3-VL-Embedding-2B)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
