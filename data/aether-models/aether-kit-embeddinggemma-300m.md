# aether-models/aether-kit-embeddinggemma-300m

## Resumen

aether-kit-embeddinggemma-300m es un modelo de embeddings de texto publicado por aether-models como un fine-tuning del modelo google/embeddinggemma-300m de Google DeepMind. Está etiquetado como parte del kit "aether-kit / core-ai" y su pipeline declarado en Hugging Face es sentence-similarity, por lo que su función prevista es generar representaciones vectoriales densas de frases y documentos para tareas de similitud semántica, búsqueda y recuperación. El repositorio ocupa 0,7 GB y el acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargarlo.

El modelo hereda la arquitectura y el tamaño del modelo base, un transformer de aproximadamente 300 millones de parámetros orientado a embeddings. No se dispone de información publicada en la ficha de Hugging Face sobre el proceso de fine-tuning, los datos empleados ni los idiomas soportados, más allá de las etiquetas del repositorio y del modelo base declarado.

Su relevancia es limitada pero concreta: se trata de un derivado comunitario de un modelo de embeddings de Google, con licencia Gemma, útil para quien necesite una variante ajustada del modelo base para similitud semántica. Al tener cero descargas y cero likes en el momento de la consulta, no existe validación pública de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/embeddinggemma-300m; detalles no disponibles) |
| Parametros totales | Aproximadamente 300 millones (según el nombre del modelo base; cifra exacta no disponible) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | no disponible (el tamaño del repo, 0,7 GB, es compatible con safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es un fine-tuning de google/embeddinggemma-300m, un modelo de embeddings de Google DeepMind, y que su pipeline es sentence-similarity. No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del ajuste realizado por aether-models.

El modelo base, EmbeddingGemma, está orientado a la generación de embeddings de alta calidad para tareas de recuperación y similitud semántica según la página de Google DeepMind. Cualquier detalle adicional sobre la arquitectura (número de capas, dimensión de los embeddings, mecanismo de atención, tokenizador) debe consultarse en la ficha del modelo base.

## Capacidades

- Generación de embeddings de texto para similitud semántica entre frases y documentos.
- Recuperación de información y búsqueda semántica (pipeline sentence-similarity).
- Agrupamiento (clustering) y deduplicación de textos mediante representaciones vectoriales.
- Base para sistemas RAG (retrieval-augmented generation) como codificador de documentos y consultas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es la función de un modelo de embeddings).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Búsqueda semántica en bases de conocimiento internas: indexar documentos con los embeddings del modelo y recuperar los fragmentos más relevantes para una consulta mediante similitud de coseno.
- Sistemas RAG para asistentes corporativos: usar el modelo como codificador de pasajes y preguntas, alimentando un LLM generador con el contexto recuperado.
- Deduplicación de catálogos de texto: calcular embeddings de registros y agrupar los que superen un umbral de similitud para eliminar duplicados.
- Clasificación y etiquetado zero-shot: representar textos y prototipos de cada categoría y asignar la clase más cercana en el espacio de embeddings.
- Motor de recomendación de contenido textual: comparar embeddings de artículos, noticias o productos para sugerir elementos relacionados.
- Detección de paráfrasis y similitud entre preguntas: agrupar consultas equivalentes en un sistema de soporte o FAQ.
- Filtrado de contenido y moderación asistida: comparar textos entrantes con embeddings de referencia de contenido no deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; con aproximadamente 300 millones de parámetros, la inferencia en FP16 requiere en torno a 0,6 GB de pesos, y en cuantización de 8 bits alrededor de 0,3 GB (estimación orientativa a partir del tamaño, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutar el modelo.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo base (no confirmado por el autor).
- Opciones de despliegue: no disponible; al ser un modelo de sentence-transformers, cabría esperar compatibilidad con sentence-transformers, pero no se confirma en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aether-kit-embeddinggemma-300m | ~300 M (heredado) | no disponible | Gemma | Gated en Hugging Face |
| google/embeddinggemma-300m | ~300 M | no disponible | Gemma | Hugging Face (modelo base) |
| EmbeddingGemma 2 (Google DeepMind) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar las condiciones en Hugging Face antes de la descarga.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que imponen restricciones y obligaciones específicas; debe revisarse antes de un despliegue en producción.
- Sin validación pública: cero descargas y cero likes en el momento de la consulta; no hay evidencia de calidad ni de mantenimiento por parte de la comunidad.
- Falta de documentación: no se detallan datos de entrenamiento, idiomas, contexto ni formato de pesos, lo que dificulta evaluar su idoneidad frente al modelo base.
- Riesgo de sesgos y alucinaciones: no evaluado en la información disponible; al ser un derivado de un modelo base, hereda los sesgos de este, pero no se han documentado.
- Limitaciones de idioma y contexto: no disponibles; deben verificarse experimentalmente antes de usarlo en producción.
- Al ser un fine-tuning comunitario sin benchmarks publicados, no hay garantía de que supere al modelo base google/embeddinggemma-300m en ninguna tarea.

## Enlaces

- [aether-models/aether-kit-embeddinggemma-300m en Hugging Face](https://huggingface.co/aether-models/aether-kit-embeddinggemma-300m)
- [google/embeddinggemma-300m en Hugging Face](https://huggingface.co/google/embeddinggemma-300m)
- [EmbeddingGemma en Google DeepMind](https://deepmind.google/models/gemma/embeddinggemma/)
