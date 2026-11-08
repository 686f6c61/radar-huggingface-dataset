# meetara-lab/meetara-embeddinggemma-2-gguf

## Resumen

MeeTARA EmbeddingGemma 2 GGUF es una redistribución en formato GGUF del modelo de embeddings Google EmbeddingGemma 2, publicada por el usuario meetara-lab. No se trata de un modelo entrenado desde cero ni de una variante afinada: los pesos son conversiones Q8_0 sin modificar procedentes del repositorio ggml-org, empaquetadas de nuevo porque el checkout de MeeTARA todavía no soporta la arquitectura `gemma-embedding2` en su conversor y cuantizador.

El modelo resuelve tareas de recuperación semántica (retrieval) y extracción de características, no generación de texto conversacional. Con 271.002.648 parámetros y un repositorio de 0,9 GB, está pensado para ejecución local en pipelines de búsqueda documental y de conversaciones, donde el formato GGUF permite desplegarlo con herramientas basadas en ggml sin necesidad de una GPU de gran capacidad.

Su relevancia es doble: por un lado, ofrece acceso local a los embeddings de EmbeddingGemma 2 bajo licencia Apache-2.0; por otro, documenta explícitamente los prefijos de tarea de SentenceTransformers (`SearchQuery` y `Document`) que deben usarse al codificar consultas y documentos del corpus, un detalle crítico para obtener una calidad de recuperación correcta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma-embedding2` (modelo de embeddings, no generativo) |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto y proyector multimodal separados) |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma-embedding2`, la familia de modelos de embeddings de Google DeepMind. Este repositorio no incluye información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas), ya que se limita a redistribuir los pesos originales de `google/embeddinggemma-2`.

La innovación técnica relevante aquí no está en el modelo sino en el empaquetado: se ofrecen dos ficheros GGUF, uno para texto y otro para el proyector multimodal. El proyector solo es necesario si se requiere soporte de embeddings multimodales; para recuperación de documentos y conversaciones basta con el GGUF de texto. Las conversiones son Q8_0 de ggml-org, sin modificaciones por parte de meetara-lab.

## Capacidades

- Generación de embeddings de texto para recuperación semántica (feature-extraction).
- Codificación de consultas y documentos mediante prefijos de tarea de SentenceTransformers (`SearchQuery` para consultas, `Document` para el corpus).
- Soporte de embeddings multimodales a través del fichero de proyector separado.
- Según la página de Google DeepMind, EmbeddingGemma 2 proporciona embeddings de alta calidad para tareas de código, visión y audio; este repositorio no detalla qué modalidades cubre exactamente el proyector incluido.
- No es un modelo de chat ni de generación de texto: no soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar el corpus con el prefijo `Document` y codificar las consultas de los usuarios con `SearchQuery`, almacenando los vectores en una base de datos vectorial para recuperación por similitud.
- Recuperación en conversaciones: generar embeddings de turnos de diálogo para localizar intercambios previos relevantes en un historial largo, útil en asistentes con memoria.
- Pipeline RAG local: usar el GGUF de texto con llama.cpp u otra implementación ggml para construir un sistema de recuperación aumentada sin depender de servicios en la nube.
- Deduplicación y agrupamiento de documentos: calcular embeddings de un lote de textos y agrupar por similitud para detectar contenido duplicado o casi duplicado.
- Clasificación y filtrado por similitud: comparar embeddings de consultas contra un conjunto de etiquetas o plantillas predefinidas para enrutar peticiones.
- Recuperación multimodal: si se carga también el fichero de proyector, generar embeddings que combinen texto con otras modalidades para búsqueda cruzada, sujeto a verificar qué modalidades soporta el proyector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 271 millones de parámetros en Q8_0, el fichero de pesos ronda los 0,3 GB; la VRAM necesaria es de aproximadamente 0,5-1 GB incluyendo overhead de contexto y buffers.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4090, así como en CPU.
- Opciones de despliegue: llama.cpp y herramientas basadas en ggml compatibles con GGUF; el repositorio no confirma compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MeeTARA EmbeddingGemma 2 GGUF | 271 M | no disponible | GGUF Q8_0 | Apache-2.0 | Redistribucion de pesos de Google; conversion de ggml-org |
| google/embeddinggemma-2 | 271 M (segun dato del repo base) | no disponible | safetensors (presumiblemente) | Apache-2.0 | Modelo upstream original |
| meetara-lab/meetara-gemma4-e2b-it-gguf | no disponible | no disponible | GGUF | no disponible | Otro modelo de meetara-lab; generativo, no comparable en tarea |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para chat, tool calling ni razonamiento; su única función es producir embeddings.
- La calidad de recuperación depende de usar correctamente los prefijos `SearchQuery` y `Document`; omitirlos degrada los resultados.
- El repositorio no documenta idiomas soportados, longitud de contexto ni composición del entrenamiento.
- Al ser una redistribución de pesos de terceros, la trazabilidad y el mantenimiento dependen de meetara-lab; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de sesgos y alucinación: no documentado en la información disponible; al no generar texto, el riesgo de alucinación se limita a recuperaciones semánticamente erróneas.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream `google/embeddinggemma-2`.
- El fichero de proyector multimodal es opcional y su necesidad debe evaluarse según el caso de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meetara-lab/meetara-embeddinggemma-2-gguf
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Página de Google DeepMind sobre EmbeddingGemma: https://deepmind.google/models/gemma/embeddinggemma/
- Otro modelo del mismo autor: https://huggingface.co/meetara-lab/meetara-gemma4-e2b-it-gguf
