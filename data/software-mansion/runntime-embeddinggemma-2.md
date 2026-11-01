# software-mansion/runntime-embeddinggemma-2

## Resumen

runntime-embeddinggemma-2 es un repositorio de pesos en formato safetensors derivado de google/embeddinggemma-2, publicado por Software Mansion el 29 de octubre de 2026. No se trata de un modelo nuevo ni de un ajuste fino: es un reempaquetado del checkpoint original de Google, dividido en tres componentes (modelo de texto, torre de visión y torre de audio) y convertido de bf16 a f16 y f32 para que pueda cargarse con el runtime propio de Software Mansion, denominado runntime.

El interés del artefacto es de infraestructura más que de investigación: facilita el despliegue de un modelo de embeddings multimodal (texto, imagen y audio) en el ecosistema runntime sin necesidad de convertir pesos manualmente. El repositorio ocupa 4,5 GB, lo que es coherente con un modelo de embeddings de tamaño medio almacenado en varias precisiones y particionado por modalidad.

La licencia es Apache 2.0, heredada del modelo base. No se han publicado parámetros, longitud de contexto ni idiomas en la información disponible, por lo que las secciones siguientes reflejan únicamente lo que consta en la model card y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings multimodal con torres de texto, visión y audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y f32 (no se incluyen pesos de 8 o 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, organizados como `<part>/<precision>/model.safetensors` con `tokenizer.json` en la raíz |

## Arquitectura y entrenamiento

El modelo subyacente es google/embeddinggemma-2, un modelo de embeddings de la familia Gemma orientado a la generación de representaciones vectoriales. El repositorio de Software Mansion conserva la arquitectura original y separa el checkpoint en tres partes: `text` (modelo de texto), `vision` (torre de visión) y `audio` (torre de audio), cada una disponible en f16 y f32. El tokenizador es compartido por todas las partes y se sitúa en la raíz del repositorio.

No se ha realizado ningún reentrenamiento ni ajuste fino: la model card indica explícitamente que no se han modificado los valores de los pesos, solo la precisión (de bf16 a f16/f32) y la disposición de los archivos para el cargador de runntime. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original dentro de la información proporcionada.

## Capacidades

- Generación de embeddings multimodales: el repositorio incluye torres separadas para texto, visión y audio, lo que permite obtener representaciones vectoriales de las tres modalidades.
- Búsqueda semántica y recuperación de información (RAG) sobre texto, imágenes y audio, al poder indexar y comparar vectores de distintas modalidades.
- Tokenización compartida entre partes, lo que simplifica el preprocesado en pipelines que combinan texto e imagen o audio.
- Carga directa en el runtime runntime de Software Mansion, con selección de precisión (f16 o f32) por componente.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; se trata de un modelo de embeddings, no de un modelo generativo conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión generativa o audio generativo: no aplica; las torres producen embeddings, no salidas generativas.

## Casos de uso

- Búsqueda semántica multimodal en bases de datos vectoriales: usar la torre de texto para indexar documentos y la de visión para indexar imágenes asociadas, comparando embeddings en un mismo espacio para recuperar resultados conjuntos.
- Sistemas RAG sobre documentación técnica con capturas de pantalla: el modelo permite vectorizar tanto el texto de los manuales como las imágenes de interfaz, de modo que una consulta textual recupere también diagramas relevantes.
- Deduplicación y clustering de catálogos multimedia: calcular embeddings de audio y de imagen para agrupar contenido similar en plataformas de música, pódcast o vídeo, usando la parte `audio` en f16 para reducir memoria.
- Moderación de contenido asistida por similitud: comparar embeddings de texto e imagen de publicaciones entrantes contra un conjunto de referencia de contenido no permitido, con umbrales de distancia coseno calibrados por modalidad.
- Recomendación de contenido cruzado: representar artículos, imágenes de portada y clips de audio en el mismo espacio vectorial para sugerir elementos relacionados entre formatos dentro de una aplicación editorial.
- Despliegue en el runtime runntime: integrar el repositorio directamente en aplicaciones que ya usan runntime, eligiendo f16 para inferencia en producción y f32 para validación o depuración de embeddings.
- Búsqueda por voz en archivos de audio: vectorizar fragmentos de audio con la torre correspondiente y permitir consultas por similitud sobre grabaciones, útil en archivística y atención al cliente telefónica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta al no conocerse el número de parámetros. El repositorio completo ocupa 4,5 GB, pero incluye las tres partes en dos precisiones; una carga en f16 de una sola parte requerirá una fracción de ese tamaño.
- GPU recomendadas: no disponibles en la información proporcionada. Al tratarse de un modelo de embeddings de tamaño medio, es probable que quepa en GPUs de consumo, pero no se confirma en la documentación.
- Cabe en GPU de consumo: no confirmado; depende del número de parámetros del modelo base, que no consta.
- Opciones de despliegue: el formato está pensado para el runtime runntime (https://github.com/software-mansion/runntime). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| runntime-embeddinggemma-2 | no disponible | no disponible | texto, visión, audio | Apache 2.0 | safetensors (f16/f32) para runntime |
| google/embeddinggemma-2 (upstream) | no disponible | no disponible | texto, visión, audio | Apache 2.0 | safetensors en bf16 |
| Otras alternativas de embeddings multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el checkpoint upstream de Google, del que este repositorio difiere únicamente en la precisión y en la disposición de los archivos. No se dispone de datos de rendimiento ni de especificaciones de modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos a google/embeddinggemma-2, solo reempaquetados. Cualquier limitación del modelo original se hereda íntegramente.
- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base; esa información debe consultarse en la ficha de google/embeddinggemma-2.
- El repositorio no incluye pesos cuantizados a 8 o 4 bits, lo que limita el ahorro de memoria en despliegues con VRAM ajustada.
- La compatibilidad está atada al runtime runntime; no se garantiza que los archivos carguen en otras librerías sin conversión previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- Aunque la licencia es Apache 2.0, conviene verificar los términos del modelo base de Google antes de un uso comercial, ya que la model card remite a la licencia heredada.
- No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano sin una evaluación propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/software-mansion/runntime-embeddinggemma-2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Runtime runntime: https://github.com/software-mansion/runntime
