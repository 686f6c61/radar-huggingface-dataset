# ElytronSystems/Nemotron-3.5-Embed-pulsar-k4

## Resumen

Nemotron-3.5-Embed-pulsar-k4 es un contenedor de inferencia listo para servir publicado por ElytronSystems que empaqueta el tronco de texto del modelo de embeddings nvidia/Nemotron-3.5-Embed-8B-BF16, cuantizado a EXL3 de 4.0 bits por peso (bpw) y repackado byte a byte en el formato del motor propio pulsar. El resultado es un modelo de extraccion de caracteristicas (feature-extraction) orientado a recuperacion densa y generacion aumentada por recuperacion (RAG), con 7.950 millones de parametros efectivos en el contenedor (frente a los 8.380 millones del modelo original, ya que se excluyen el torre de vision y el proyector multimodal) y vectores de salida de 4096 dimensiones normalizados a longitud unitaria.

La relevancia de esta publicacion es practica: permite ejecutar un embedder de 8B en GPUs de gama profesional antigua, concretamente arquitecturas Turing (sm_75) como la Quadro RTX 5000, donde el modelo original en BF16 no cabria con holgura. El contenedor ocupa 4.5 GB en disco y consume unos 5.7 GB de memoria de GPU, y el autor lo ejecuta junto a otros dos contenedores (Rerank-8B y Parse) dentro de un unico proceso pulsar que suma 12.6 GB de los 16 GB de la tarjeta.

El modelo base es propiedad de NVIDIA, presentado publicamente el 21 de octubre de 2026 dentro de la coleccion Nemotron Retriever, y deriva a su vez de Ministral-3-8B-Instruct-2512 (Apache-2.0). La ventana de contexto declarada para cada entrada es de 16.384 tokens. La licencia del contenedor es OpenMDW-1.1, la misma que aplica NVIDIA a su modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral3) adaptado a embeddings; tronco de texto, sin torre de vision |
| Parametros totales | 7.950 millones en el contenedor (8.380 millones en el modelo NVIDIA original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens por entrada |
| Tipos de cuantizacion | EXL3 4.0 bpw en los lineales del decoder; embeddings de tokens y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (modelo base Apache-2.0, Ministral-3-8B-Instruct-2512) |
| Formato de pesos | safetensors dentro del contenedor pulsar (EXL3 repackado); tamano de repo 4.8 GB |
| Dimension del embedding | 4096 floats, longitud unitaria (L2) |
| Pooling | media sobre los tokens de entrada, seguida de normalizacion L2 |
| Prefijos de rol | `query` para preguntas, `passage` para documentos (gestionados por el servidor) |
| Motor de inferencia | pulsar (rama `dev`, commit `5139ba62` o posterior) |
| Hardware validado | Turing (sm_75), Quadro RTX 5000 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder de la familia Mistral3 (segun el tag de Hugging Face) reconvertido por NVIDIA en un encoder de embeddings: el contenedor conserva los lineales de atencion (q/k/v/o) y de MLP (gate/up/down) cuantizados a EXL3 4.0 bpw, mientras que el embedding de tokens y las normas se mantienen en BF16 tal como los distribuye NVIDIA. La cabeza de salida no es generativa: se aplica pooling por media sobre los tokens de entrada y despues normalizacion L2, produciendo un vector de 4096 dimensiones. El autor elimina explicitamente la torre de vision y el proyector multimodal, de modo que esta variante es solo de texto.

La cuantizacion se realizo con exllamav3 1.6.4 usando 250 filas de calibracion de 2048 tokens y codebook `mul1`; los pesos resultantes se repackaron byte a byte en el contenedor de pulsar y se acompanan de un fichero `SHA256SUMS` que cubre todos los ficheros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si NVIDIA aplico RLHF o DPO en la construccion del modelo base; la model card del contenedor no los detalla. La innovacion tecnica destacable no esta en el entrenamiento sino en el despliegue: un embedder de 8B servido en Turing con perdida de calidad medida de 0.9926 de coseno frente al BF16 original.

## Capacidades

- Generacion de embeddings densos de texto para recuperacion semantica y busqueda neuronal.
- Soporte de roles asimetricos `query` / `passage` mediante el campo `input_type` de la API, con el prefijo de rol escrito automaticamente por el servidor.
- Entradas de hasta 16.384 tokens; la opcion `"truncate": "END"` conserva los primeros 16.384 tokens en lugar de rechazar la peticion.
- Salida en dos formatos: array de floats o `base64` con floats f32 little-endian.
- API compatible con la forma de OpenAI (`POST /v1/embeddings`) mas la extension `input_type` de NVIDIA NIM.
- Capacidad multimodal (texto e imagen) en el modelo NVIDIA original, no incluida en este contenedor.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (es un modelo de embeddings, no generativo).
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).

## Casos de uso

- Recuperacion densa en RAG corporativo: el autor reporta hit@1 de 0.909 y MRR de 0.955 sobre 22 preguntas y 744 fragmentos de sus propios documentos, por delante del modelo original en fp16 (0.864 y 0.932), lo que lo hace adecuado como primer recuperador en pipelines de pregunta-respuesta sobre documentacion interna.
- Despliegue en hardware Turing heredado: con 5.7 GB de VRAM cabe en una Quadro RTX 5000 y permite montar un stack completo de recuperacion (embedder, reranker y parser) en 12.6 GB de los 16 GB de la tarjeta, sin renovar GPU.
- Busqueda semantica sobre documentos largos: la ventana de 16.384 tokens permite indexar fragmentos extensos sin troceado agresivo, con truncado controlado mediante `"truncate": "END"`.
- Servicio de embeddings autohospedado: la API compatible con OpenAI permite sustituir proveedores externos en aplicaciones existentes cambiando unicamente la URL base y el nombre del modelo.
- Reranking en dos etapas: combinado con Nemotron-3.5-Rerank-pulsar-k4 en el mismo proceso pulsar, se puede construir un pipeline recuperar-y-reordenar con un solo servidor y una sola carga de modelo en memoria.
- Indexacion por lotes a gran escala: con aproximadamente 1.100 tokens/s en batching sobre una RTX 5000 limitada a 125 W, es viable reindexar corpus de decenas de millones de tokens en horas, no en dias.
- Filtrado y deduplicacion de corpus: los vectores unitarios de 4096 dimensiones permiten calcular similitud coseno directamente y detectar documentos casi duplicados antes de entrenar o publicar.

## Benchmarks y rendimiento

Calidad medida por el autor sobre 31 entradas fijas (consultas y pasajes de 5 a 5.100 tokens):

| Comparacion | Peor coseno | Top-1 retrieval |
|---|---|---|
| Mismos pesos EXL3 en f32 sobre CPU | 0.99996 | 6 / 6 |
| Modelo BF16 original en f32 | 0.9926 | 6 / 6 |

Recuperacion densa sobre documentos propios (22 preguntas, 744 fragmentos):

| Embedder | hit@1 | hit@3 | MRR |
|---|---|---|---|
| Nemotron Embed-8B original fp16 | 0.864 | 1.000 | 0.932 |
| Nemotron Embed-8B EXL3 4.0 bpw (este contenedor) | 0.909 | 1.000 | 0.955 |

Rendimiento: aproximadamente 1.100 tokens/s en batching sobre una RTX 5000 limitada a 125 W. El autor advierte que el conjunto de 22 preguntas es pequeno y que la diferencia entre ambas filas equivale a una sola pregunta. No se han publicado resultados de benchmarks estandar (MMLU, MTEB u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 5.7 GB de memoria de GPU para el contenedor completo.
- Espacio en disco: 4.5 GB el contenedor, 4.8 GB el repositorio.
- GPU validadas: Quadro RTX 5000 (Turing, sm_75); el autor indica que solo lo ha servido en Turing.
- Compilacion: `make pulsar-server CUDA_ARCH=sm_75` para Turing; otras arquitecturas requieren el valor `CUDA_ARCH` correspondiente, no verificadas por el autor.
- Cabe en GPU de consumo: no confirmado; por VRAM (5.7 GB) cabria en tarjetas de 8 GB o mas, pero no hay validacion publicada en esas arquitecturas.
- Despliegue: motor pulsar (rama `dev`, commit `5139ba62` o posterior) con `pulsar-server -m /ruta/al/repo --host 0.0.0.0 --port 8400`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: aproximadamente 1.100 tokens/s en batching sobre RTX 5000 a 125 W; latencia por peticion no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-pulsar-k4 (este) | 7,95B en contenedor | 16.384 | pulsar / EXL3 4.0 bpw | OpenMDW-1.1 | Hugging Face, 34 descargas |
| nvidia/Nemotron-3.5-Embed-8B-BF16 | 8,38B | no disponible | safetensors BF16 | OpenMDW-1.1 | Hugging Face (modelo base) |
| Nemotron-3.5-Embed-1B (BF16 y NVFP4) | 1B | no disponible | BF16 / NVFP4 | no disponible en la informacion | NVIDIA NIM y Hugging Face |
| Nemotron-3.5-Rerank-pulsar-k4 | no disponible | no disponible | pulsar | no disponible en la informacion | Hugging Face (mismo autor) |

El modelo de 1B de NVIDIA comparte espacio de embeddings entre sus variantes BF16 y NVFP4 y esta pensado para recuperacion multimodal (texto e imagen), mientras que este contenedor es solo de texto y de mayor tamano. No se dispone de datos de benchmarks comparativos entre el 1B y el 8B en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de vision y el proyector multimodal del modelo NVIDIA se han eliminado, por lo que no puede generar embeddings de imagenes.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La validacion de calidad se apoya en 22 preguntas de un unico conjunto interno; el propio autor advierte que es una muestra pequena y que la ventaja sobre el modelo original equivale a una pregunta.
- Solo se ha servido en Turing (sm_75); el comportamiento en Ampere, Ada o Hopper no esta verificado por el autor.
- Requiere compilar pulsar desde la rama `dev`, lo que implica una dependencia de una version concreta del motor y de su cadencia de cambios.
- La cuantizacion a 4 bits introduce una perdida medible: 0.9926 de coseno en el peor caso frente al BF16 original, aceptable para recuperacion pero no despreciable en tareas de similitud fina.
- Sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada; al ser un modelo de embeddings, el riesgo se traslada a recuperar pasajes irrelevantes, no a generar afirmaciones falsas.
- Idiomas soportados no declarados; no se puede asumir buen rendimiento multilingue sin evaluacion propia.
- Licencia OpenMDW-1.1: es necesario revisar sus terminos para uso comercial; el modelo base Ministral-3-8B-Instruct-2512 es Apache-2.0 y el fichero `NOTICE` del repositorio detalla los cambios realizados.
- El conteo de parametros autodetectado por Hugging Face es inferior al real porque interpreta los bytes empaquetados de EXL3 como parametros; conviene usar la cifra de la model card (7,95B).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ElytronSystems/Nemotron-3.5-Embed-pulsar-k4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Contenedor reranker del mismo autor: https://huggingface.co/ElytronSystems/Nemotron-3.5-Rerank-pulsar-k4
- Contenedor parser del mismo autor: https://huggingface.co/ElytronSystems/Nemotron-3.5-Parse-pulsar-f16
- Motor pulsar: https://github.com/tylerwagler/pulsar
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo base de Ministral: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Anuncio de NVIDIA Nemotron 3.5 (Unite.AI): https://www.unite.ai/nvidia-debuts-open-nemotron-3-5-models-for-embedding-reranking-parsing/
- Model card de Nemotron-3.5-Embed-1B en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3_5-embed-1b/modelcard
