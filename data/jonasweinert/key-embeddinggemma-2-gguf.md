# JonasWeinert/key-embeddinggemma-2-gguf

## Resumen

EmbeddingGemma 2 es un modelo de embeddings de Google, disenado para convertir fragmentos de texto en vectores densos que permiten busqueda semantica y recuperacion de informacion. Este repositorio concreto, publicado por JonasWeinert, no es un modelo nuevo: es la redistribucion en formato GGUF (cuantizacion Q8_0) del modelo original, empaquetada especificamente para la aplicacion Key, un espacio de trabajo de investigacion que ejecuta la busqueda en el propio dispositivo del usuario.

El modelo cuenta con 271.002.648 parametros (aproximadamente 271 millones) y produce embeddings de 768 dimensiones mediante mean pooling. Su reducido tamano lo hace apto para inferencia local en hardware de consumo, lo que encaja con el objetivo de Key: descargar el modelo una sola vez, verificar su integridad mediante SHA-256 y mantenerlo en el dispositivo para busquedas por similitud semantica sin depender de servicios en la nube.

La relevancia de esta ficha radica en que documenta un caso de redistribucion de un modelo de embeddings con licencia Apache 2.0, con trazabilidad clara de la conversion GGUF (procedente de ggml-org) y con un proposito de producto definido. Es un ejemplo de como un modelo base de Google se adapta a un formato de inferencia local (llama.cpp) para integrarse en una aplicacion de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings; el repositorio no detalla la arquitectura interna) |
| Parametros totales | 271.002.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no proporciona informacion sobre la arquitectura interna del modelo base (google/embeddinggemma-2). Se trata de un modelo de la familia EmbeddingGemma orientado a extraccion de caracteristicas (feature-extraction) y generacion de embeddings, pero no se detallan en la informacion disponible ni el tipo de transformer, ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. El unico dato tecnico concreto sobre el proceso es que la conversion a GGUF se realizo con la herramienta del proyecto ggml-org (https://github.com/ggml-org/convert) y que el fichero se redistribuye sin modificaciones respecto al original de ggml-org/embeddinggemma-2-GGUF, en la revision 6ea3e3a309d12a4779cfda98b8c19800d2d5da71. El pooling utilizado es mean pooling y la dimension de salida es 768.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones mediante mean pooling, orientados a busqueda semantica y recuperacion de pasajes.
- Extraccion de caracteristicas (pipeline feature-extraction) para indexar documentos y consultas en un espacio vectorial comun.
- Busqueda por significado (semantic search) sobre bibliotecas o colecciones de texto del usuario.
- Inferencia local en el dispositivo mediante llama.cpp (llama-server), con soporte de Metal, CUDA, Vulkan y CPU.
- Integracion en la aplicacion Key: descarga del modelo bajo demanda, verificacion de integridad por SHA-256 y almacenamiento local.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking; el modelo esta especializado en embeddings.

## Casos de uso

- Busqueda semantica en una biblioteca personal: el modelo vectoriza los pasajes de la biblioteca del usuario y las consultas, permitiendo recuperar documentos por significado y no solo por coincidencia exacta de palabras. Es adecuado por su tamano reducido y su ejecucion local.
- Indexacion de documentacion tecnica en herramientas de escritorio: se pueden generar embeddings de manuales, notas o articulos para ofrecer busqueda dentro de una aplicacion sin enviar datos a servidores externos.
- Motor de recuperacion en asistentes locales de investigacion: el modelo actua como capa de retrieval que alimenta a un LLM generativo con los fragmentos mas relevantes, todo en el mismo dispositivo.
- Clasificacion y agrupamiento de textos por similitud: los vectores de 768 dimensiones permiten clustering, deduplicacion y deteccion de temas afines en corpus pequenos o medianos.
- Sistemas de recomendacion de contenido textual: comparar la similitud entre articulos, notas o documentos para sugerir lecturas relacionadas.
- Filtrado y organizacion de correo o notas: embeddings para agrupar mensajes por tematica o detectar duplicados semanticos en un cliente de correo local.
- Prototipado de RAG (retrieval-augmented generation) en entornos sin GPU dedicada: al ser un modelo de 271 millones de parametros en Q8_0, puede ejecutarse en CPU con llama.cpp para pruebas y despliegues ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 309.855.456 bytes (aproximadamente 0,3 GB), por lo que la huella de memoria es muy reducida; no se dispone de cifras oficiales de VRAM adicional para el contexto y buffers de llama.cpp.
- GPU recomendadas: no se especifican en la informacion disponible. El modelo esta pensado para ejecutarse con llama.cpp en Metal (Apple), CUDA (NVIDIA), Vulkan o CPU.
- Cabe en GPU de consumo: si, dado el tamano del fichero (unos 0,3 GB); cualquier GPU con al menos ese espacio de memoria disponible deberia poder alojarlo, aunque no se documentan requisitos minimos oficiales.
- Opciones de despliegue: llama.cpp mediante llama-server, con backend Metal, CUDA, Vulkan o CPU. No se mencionan vLLM, TGI, Ollama ni otros motores en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, este modelo se situa en la categoria de embeddings ligeros (271 millones de parametros, 768 dimensiones) redistribuidos en GGUF para inferencia local; no obstante, no se han publicado cifras que permitan compararlo con alternativas concretas.

## Limitaciones y advertencias

- El repositorio no documenta sesgos conocidos del modelo base; al tratarse de un modelo de embeddings, puede heredar sesgos presentes en sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinacion: no aplica de forma directa, ya que el modelo no genera texto, sino vectores; el riesgo se traslada a la calidad de la recuperacion (falsos positivos o pasajes irrelevantes).
- Limitaciones de contexto e idioma: no se especifican la longitud maxima de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la titularidad del modelo corresponde a Google; conviene revisar la model card original para condiciones adicionales y citacion.
- El fichero se redistribuye sin modificaciones desde ggml-org; cualquier problema de calidad en la conversion GGUF es atribuible a ese origen, no a este repositorio.
- Solo se publica la cuantizacion Q8_0; no hay variantes Q4, Q5 u otras que reduzcan aun mas el tamano.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de noviembre de 2026, por lo que su adopcion y validacion por la comunidad son practicamente nulas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JonasWeinert/key-embeddinggemma-2-gguf
- Modelo original: https://huggingface.co/google/embeddinggemma-2
- Conversion GGUF de origen: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Revision concreta del GGUF: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF/blob/6ea3e3a309d12a4779cfda98b8c19800d2d5da71/embeddinggemma-2-Q8_0.gguf
- Herramienta de conversion: https://github.com/ggml-org/convert
