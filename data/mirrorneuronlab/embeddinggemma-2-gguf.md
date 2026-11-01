# MirrorNeuronLab/embeddinggemma-2-GGUF

## Resumen

EmbeddingGemma 2 es un modelo de embeddings desarrollado originalmente por Google DeepMind que proyecta texto, imagenes y audio en un espacio vectorial compartido de 768 dimensiones. MirrorNeuronLab publica en este repositorio una conversion a GGUF para llama.cpp, cuantizada sin entrenamiento adicional a partir de los pesos originales en BF16. El modelo base cuenta con 271.002.648 parametros y una arquitectura no causal con pooling por media y una proyeccion de 512 a 768 dimensiones.

La particularidad de esta release es su empaquetado en dos ficheros: un backbone de texto en cuantizacion Q4_K_M (173,278 MiB) y un companion multimodal en Q8_0 (529,119 MiB) que contiene los codificadores de vision y audio junto con sus proyecciones. Para obtener embeddings de imagen o audio es necesario cargar ambos ficheros; el Q8_0 no es una alternativa al modelo de texto, sino un complemento obligatorio para las modalidades no textuales.

El modelo esta pensado exclusivamente para recuperacion y similitud: devuelve vectores, no genera respuestas conversacionales ni transcripciones. Su licencia Apache 2.0 y su reducido tamano lo hacen adecuado para busqueda semantica multimodal en entornos con recursos limitados, incluyendo despliegues en GPU de consumo y en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no causal con pooling por media y proyeccion de embedding de 512 a 768 dimensiones |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (configuracion recomendada en Docker Model Runner) |
| Tipos de cuantizacion | Q4_K_M (texto), Q8_0 (companion vision/audio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer no causal orientado a embeddings, con pooling por media sobre las representaciones de tokens y una proyeccion final que mapea de 512 a 768 dimensiones. El tokenizer maneja un vocabulario de 262.144 tokens, verificado contra el `tokenizer.json` original durante la conversion. El modelo base fue desarrollado por Google DeepMind; esta release es una conversion y cuantizacion de MirrorNeuronLab sin entrenamiento adicional, realizada con llama.cpp (build b12032, commit `dde879bc4f954b809892fd0d660515f42536394a`) desde un intermedio BF16 sin importance matrix.

El backbone de texto se cuantizo con el preset estandar Q4_K_M de llama.cpp, que mezcla tipos de tensor segun la definicion upstream y mantiene los tensores pequenos y la proyeccion de embedding en mayor precision donde el preset lo exige. El companion multimodal se cuantizo en Q8_0 e incluye ambos codificadores (vision y audio) con sus proyecciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La auditoria GGUF confirma la preservacion de metadatos del tokenizer, la arquitectura no causal, el pooling por media y la coincidencia de formas de tensor entre BF16 y Q4_K_M.

## Capacidades

- Generacion de embeddings de texto en un espacio vectorial de 768 dimensiones.
- Generacion de embeddings de imagen mediante el codificador de vision del companion Q8_0.
- Generacion de embeddings de audio mediante el codificador de audio del companion Q8_0.
- Espacio vectorial compartido entre las tres modalidades, lo que permite similitud y recuperacion cruzada entre texto, imagen y audio.
- Soporte de prefijos de tarea en las entradas de texto (por ejemplo `task: search result | query: ...` y `title: none | text: ...`), orientados a recuperacion.
- Compatibilidad con la API de embeddings de Docker Model Runner y con motores llama.cpp que soporten la arquitectura `gemma-embedding2` y vision/audio de Gemma4.
- No soporta generacion de texto, respuestas conversacionales ni transcripciones.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica de documentacion tecnica: indexar fragmentos de texto con el backbone Q4_K_M y recuperar por similitud coseno en 768 dimensiones; el tamano reducido del modelo permite mantener el indice y el encoder en la misma maquina.
- Recuperacion aumentada por generacion (RAG) en produccion: usar el modelo como encoder del pipeline, con contexto de 2048 tokens por fragmento y pooling por media, integrable via la API de embeddings de llama.cpp o Docker Model Runner.
- Busqueda multimodal de imagenes por descripcion textual: cargar el companion Q8_0 y proyectar imagenes y consultas al mismo espacio vectorial para recuperar imagenes relevantes a partir de texto.
- Deduplicacion y clustering de contenido audiovisual: generar embeddings de audio y agrupar por similitud para detectar segmentos repetidos o clasificar material sonoro sin transcripcion.
- Moderacion y filtrado de contenido: comparar embeddings de entradas de usuario contra vectores de referencia de contenido no deseado en texto e imagen.
- Sistemas de recomendacion basados en contenido: calcular similitud entre items descritos en texto, imagen o audio y el perfil del usuario en un unico espacio de 768 dimensiones.
- Despliegue en el borde: el backbone de texto ocupa 173,278 MiB en Q4_K_M, lo que permite ejecutarlo en equipos con poca VRAM o en CPU para tareas de indexacion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta release no incluye resultados de benchmark y que no se etiqueta como `AD-Q4_K_M` ni incorpora pesos, importance matrix ni layout dinamico de AtomicChat.

## Requisitos de hardware

- VRAM estimada para texto: aproximadamente 0,17 GiB de pesos en Q4_K_M, mas overhead de contexto y batch; viable en CPU y en cualquier GPU con 2 GB o mas.
- VRAM estimada para multimodal: anadir aproximadamente 0,52 GiB del companion Q8_0, con un total en torno a 0,7 GiB de pesos.
- GPU validadas: NVIDIA DGX Spark, donde se verificaron las peticiones de embeddings de imagen y audio a traves de Docker Model Runner.
- GPU de consumo: el tamano permite ejecucion en RTX 3060, RTX 4060, RTX 4090 y similares; no se documentan pruebas fisicas en estas tarjetas.
- Apple Silicon: los ficheros son portables a Macs con Apple Silicon, aunque la model card indica que estas plataformas no se probaron fisicamente en esta ejecucion.
- Despliegue: llama.cpp con soporte de `gemma-embedding2` y vision/audio de Gemma4, y Docker Model Runner con el comando `docker model pull hf.co/MirrorNeuronLab/embeddinggemma-2-GGUF:Q4_K_M`, que descarga automaticamente el companion multimodal.
- Configuracion recomendada: `--mode embedding --context-size 2048 --batch-size 2048 --ubatch-size 2048 --pooling mean`.
- Latencia y throughput: no disponibles; la model card referencia un fichero `TIMINGS.json` con mediciones, pero no se incluyen cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| MirrorNeuronLab/embeddinggemma-2-GGUF (esta release) | 271 M | 2048 tokens | Texto, imagen, audio | Apache 2.0 | GGUF |
| google/embeddinggemma-2 (modelo base) | 271 M | no disponible | Texto, imagen, audio (segun model card del autor) | Apache 2.0 | safetensors |
| AtomicChat/embeddinggemma-2-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF (AD-Q4_K_M) |

La comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo produce embeddings; no genera texto, respuestas ni transcripciones, por lo que no debe usarse como modelo conversacional.
- Para entradas de imagen o audio es obligatorio cargar el companion Q8_0; el backbone de texto por si solo no cubre esas modalidades.
- El contexto esta limitado a 2048 tokens en la configuracion recomendada; fragmentos mas largos deben dividirse.
- La cuantizacion Q4_K_M del backbone de texto puede introducir una perdida de precision en la similitud respecto al modelo original en BF16; no se han publicado mediciones de esa degradacion.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica del modelo base.
- Los motores llama.cpp antiguos reportan una arquitectura desconocida; es necesario un motor actualizado con soporte de `gemma-embedding2` y vision/audio de Gemma4.
- La version del controlador de Docker Model Runner por si sola no garantiza la compatibilidad del motor.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el fichero `LICENSE` al empaquetar los GGUF.
- La release tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MirrorNeuronLab/embeddinggemma-2-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Checkpoint original (commit `f9972ac22e696a105c482202646979e33e4b5a1e`): https://huggingface.co/google/embeddinggemma-2/tree/f9972ac22e696a105c482202646979e33e4b5a1e
- llama.cpp (commit `dde879bc4f954b809892fd0d660515f42536394a`): https://github.com/ggml-org/llama.cpp/tree/dde879bc4f954b809892fd0d660515f42536394a
- Model card de referencia de AtomicChat: https://huggingface.co/AtomicChat/embeddinggemma-2-GGUF
