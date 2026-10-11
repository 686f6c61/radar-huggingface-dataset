# prabanta-dev/Qwen3-Embedding-0.6B-JNS

## Resumen

Qwen3-Embedding-0.6B-JNS es una conversión de formato del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, publicada por el usuario prabanta-dev para el motor de inferencia Janas. No es un modelo nuevo ni reentrenado: el autor ha tomado el fichero GGUF cuantizado Q8_0 de Qwen3-Embedding-0.6B y lo ha reescrito en JNS, el formato propio de Janas, un motor de inferencia escrito en C pensado para ordenadores convencionales, con o sin GPU.

El modelo subyacente es un transformer denso de 0,6 mil millones de parámetros y 28 capas, derivado de Qwen3-0.6B-Base, con 32.768 tokens de contexto, embeddings instruction-aware de hasta 1024 dimensiones y soporte de más de 100 idiomas. Lo relevante de esta ficha es la vía de despliegue: permite ejecutar un modelo de embeddings multilingüe de contexto largo en CPU sobre Linux x86-64, sin PyTorch ni tarjeta gráfica.

La licencia es Apache 2.0, heredada del modelo original, y el repositorio ocupa 0,6 GB. El binario de Janas se distribuye bajo GPL-3.0-or-later, licencia que no se aplica a los ficheros de pesos alojados en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, 28 capas (base Qwen3-0.6B-Base) |
| Parametros totales | 0,6 mil millones (600 millones aprox.) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `qwen3-embedding-0.6b-q8.jns`, 0,64 GB) |
| Idiomas soportados | Más de 100 idiomas según el modelo base; la model card de esta conversión no los detalla |
| Licencia | Apache 2.0 |
| Formato de pesos | JNS (formato propio del motor Janas), derivado de GGUF Q8_0 |
| Dimension de embeddings | Configurable hasta 1024 dimensiones, con soporte de instrucciones de tarea |
| Tarea | Feature-extraction (generacion de embeddings de texto) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

Esta publicación no implica entrenamiento alguno. Según la propia model card, nada se ha reentrenado ni podado: cada fichero es un GGUF cuantizado por terceros, reescrito por la herramienta `gguf2jns` de Janas en el orden en que el motor lo lee, conservando los metadatos. La conversión parte de `Qwen3-Embedding-0.6B-Q8_0.gguf`, publicado en Qwen/Qwen3-Embedding-0.6B-GGUF, y produce un único fichero JNS de 0,64 GB con SHA-256 `1e8eb8cbeba7a1a657354d259c5730bb79f6087160a9ca8da901bd08bdbe943f`.

El modelo original, desarrollado por el equipo Qwen de Alibaba Cloud, es un transformer denso construido sobre Qwen3-0.6B-Base y diseñado específicamente para tareas de representación de texto y ranking. Sus rasgos técnicos destacables son los embeddings instruction-aware (permite prefijar una instrucción que describe la tarea de recuperación), la ventana de 32K tokens para documentos largos y las dimensiones de salida ajustables hasta 1024. El número de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada para esta conversión.

## Capacidades

- Generación de embeddings de texto densos para búsqueda semántica, similitud y recuperación, con salida de hasta 1024 dimensiones.
- Embeddings instruction-aware: se puede anteponer una instrucción de tarea a la consulta para orientar la representación.
- Procesamiento de documentos largos gracias a la ventana de 32.768 tokens, útil para fragmentos extensos sin troceado agresivo.
- Cobertura multilingüe de más de 100 idiomas según la documentación del modelo base.
- Ejecución en CPU sobre Linux x86-64 mediante Janas, sin necesidad de GPU, gracias a la conversión a JNS.
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling ni razonamiento multi-paso, y no implementa modo thinking.
- No incluye capacidades de visión ni de audio.

## Casos de uso

- Búsqueda semántica local sin GPU: indexar un corpus documental y consultarlo por similitud vectorial usando `janas-server --embedding-model`, aprovechando que el fichero Q8_0 ocupa 0,64 GB y cabe en memoria de un portátil.
- RAG sobre documentación técnica: generar los embeddings de los fragmentos y de las consultas del usuario para alimentar una base vectorial, con la ventaja del contexto de 32K que reduce la fragmentación de documentos largos.
- Deduplicación y detección de near-duplicates: calcular la similitud coseno entre pares de documentos para eliminar contenido repetido en corpus de entrenamiento o bases de conocimiento internas.
- Clasificación y clustering de textos: agrupar tickets de soporte, reseñas o noticias por cercanía en el espacio de embeddings y asignar etiquetas con un clasificador ligero entrenado sobre los vectores.
- Recuperación multilingüe: consultar en un idioma y recuperar documentos en otro, apoyándose en la cobertura de más de 100 idiomas del modelo base.
- Memoria semántica para agentes: almacenar interacciones previas como vectores y recuperar las más relevantes en cada turno, ejecutando el modelo de embeddings en la misma máquina que el agente.
- Moderación y filtrado de contenido: comparar textos entrantes contra un conjunto de referencia de casos problemáticos mediante similitud para priorizar revisiones humanas.
- Sistemas de recomendación por contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para generar recomendaciones sin depender de servicios externos de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de la conversión a JNS no incluye métricas, y la información proporcionada sobre el modelo base (Qwen3-Embedding-0.6B) no contiene cifras de MTEB, MMLU, HumanEval ni de ninguna otra evaluación. Tampoco se documentan latencia ni throughput de Janas con este fichero.

## Requisitos de hardware

- Memoria: los pesos en Q8_0 ocupan 0,64 GB, por lo que se necesita aproximadamente 1 GB de RAM libre para cargar el modelo con margen para el runtime.
- GPU: no es necesaria. Janas se presenta como motor para ordenadores convencionales, con o sin GPU; no se especifican GPU soportadas ni requisitos de VRAM.
- CPU: el binario distribuido es para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores).
- Cabe en hardware de consumo: por tamaño de fichero, es apto para portátiles y equipos de escritorio sin GPU dedicada; no se publican requisitos mínimos oficiales de CPU.
- Despliegue: `janas-server <chat-model.jns> --embedding-model ~/.local/share/janas/models/qwen3-embedding-0.6b-q8.jns`, con descarga mediante `janas-get qwen3-embedding-0.6b` o el catálogo de `janas-chat`.
- Otros runners: el formato JNS solo lo lee Janas. Para usar vLLM, llama.cpp, Ollama o TGI hay que recurrir al modelo base en safetensors o al GGUF original de Qwen.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B-JNS | 0,6B | 32K | JNS | Apache 2.0 | prabanta-dev; requiere Janas |
| Qwen3-Embedding-0.6B | 0,6B | 32K | safetensors | Apache 2.0 | Qwen; compatible con transformers |
| Qwen3-Embedding-0.6B-GGUF | 0,6B | 32K | GGUF | Apache 2.0 | Qwen; compatible con llama.cpp y Ollama |
| Qwen3-Embedding-4B | 4B (nominal) | 32K | safetensors | Apache 2.0 | Qwen; mayor coste de memoria |
| Qwen3-Embedding-8B | 8B (nominal) | 32K | safetensors | Apache 2.0 | Qwen; el más exigente de la serie |

Las versiones de 4B y 8B pertenecen a la misma serie de embeddings y reranking de Qwen3, según la documentación pública del proyecto. No se dispone de comparativas de rendimiento entre ellas dentro de la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un único motor: el formato JNS solo lo interpretan las herramientas de Janas, lo que ata el despliegue a ese proyecto y a su cadencia de mantenimiento.
- Plataforma restringida: el binario publicado es únicamente para Linux x86-64; no se ofrecen builds para macOS, Windows, ARM ni otras arquitecturas.
- Licencia del motor: Janas se distribuye bajo GPL-3.0-or-later. La model card aclara que esa licencia no se aplica a los ficheros de pesos, pero conviene revisarlo antes de integrarlo en un producto propietario.
- Una sola cuantización: solo se publica Q8_0 (0,64 GB). No hay variantes Q4 o Q5 para entornos con menos memoria, a diferencia del GGUF original.
- No es un modelo generativo: no sirve para chat, resumen, traducción directa ni tool calling; cualquier caso de uso exige un modelo generativo aparte que consuma los embeddings.
- Idiomas no declarados en esta conversión: la model card no especifica la lista de idiomas soportados, aunque el modelo base anuncia más de 100.
- Sesgos: no documentados en la información disponible. Al heredar los pesos del modelo base, reproduce los sesgos presentes en sus datos de entrenamiento.
- Riesgo de recuperación irrelevante: en dominios muy especializados, un modelo de 0,6B puede producir embeddings poco discriminativos; conviene validar con datos propios antes de producción.
- Madurez del repositorio: 0 descargas y 0 likes, con fecha de creación 2026-10-11 según los metadatos de HuggingFace; no hay evidencia de uso en producción ni de mantenimiento posterior.
- El repositorio del modelo original no incluye fichero LICENSE; su model card declara Apache 2.0, y el repositorio de esta conversión incluye el texto de dicha licencia.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/prabanta-dev/Qwen3-Embedding-0.6B-JNS
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- GGUF de origen: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF
- Motor Janas: https://github.com/prabanta-dev/janas
- Repositorio oficial de la serie Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Demo en DeepInfra: https://deepinfra.com/Qwen/Qwen3-Embedding-0.6B
- Documentación de la API en DeepInfra: https://deepinfra.com/Qwen/Qwen3-Embedding-0.6B/api
- Ficha en la biblioteca de Modal: https://modal.com/library/qwen/qwen3-embedding-0-6b
- Descarga del binario de Janas: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz
