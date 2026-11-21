# furiosa-ai/Qwen3-Embedding-0.6B

## Resumen

Qwen3-Embedding-0.6B es un modelo de embeddings de texto de aproximadamente 0,6 mil millones de parametros, construido sobre la arquitectura transformer densa de la familia Qwen3. Convierte texto en representaciones vectoriales densas para busqueda semantica, recuperacion de informacion (retrieval) y comparacion de similitud. El modelo original lo desarrolla Qwen (Alibaba), y esta ficha concreta corresponde a una redistribucion empaquetada por FuriosaAI para su ejecucion en hardware propietario.

Este repositorio de FuriosaAI incluye los pesos del modelo junto con un Furiosa Executable Bundle (FXB) que permite ejecutarlo en aceleradores RNGD mediante la libreria Furiosa-LLM. El modelo base es identico al upstream Qwen/Qwen3-Embedding-0.6B; lo que anade esta version es el binario precompilado para el hardware de FuriosaAI, con una estrategia de paralelismo de tensor de 8 PEs que ocupa una unica tarjeta RNGD.

Su relevancia radica en que permite desplegar un modelo de embeddings de calidad reconocida sobre aceleradores NPU alternativos a las GPU tradicionales, manteniendo compatibilidad con el endpoint OpenAI `/v1/embeddings`. El modelo soporta Matryoshka Representation Learning (MRL), lo que permite solicitar embeddings de dimensionalidad reducida, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sin cuantizacion; ejecucion en BF16 nativo |
| Idiomas soportados | en (segun metadatos del repo); cobertura multilingue segun model card upstream |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; Furiosa Executable Bundle (FXB) |
| Entrada / salida | texto / embeddings (vector) |
| Motor de inferencia | Furiosa-LLM |
| Hardware soportado | FuriosaAI RNGD |
| Estrategia de paralelismo | tensor-parallel size 8 PEs (una tarjeta RNGD) |
| Tamano del repo | 1,7 GB |
| Dimension reducida | si, via parametro `dimensions` (MRL) |

## Arquitectura y entrenamiento

El modelo se basa en el backbone transformer denso de Qwen3, orientado a la generacion de embeddings de texto en lugar de a la generacion autoregresiva. Al tratarse de un modelo de embedding, su salida es un vector denso que representa semanticamente la entrada, en lugar de tokens generados. La model card de esta redistribucion no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde al modelo upstream y no se reproduce aqui.

La innovacion tecnica destacable es el soporte de Matryoshka Representation Learning (MRL), que permite truncar la dimensionalidad del embedding resultante mediante el parametro `dimensions` sin reentrenar el modelo, manteniendo la utilidad semantica del vector. En esta version de FuriosaAI, el modelo se ejecuta en precision BF16 nativa (sin cuantizacion) sobre el acelerador RNGD, con un FXB precompilado que se descubre automaticamente al cargar el modelo con la clase `LLM` de Furiosa-LLM.

## Capacidades

- Generacion de embeddings densos de texto para similitud semantica y recuperacion.
- Busqueda semantica y comparacion de similitud entre pares de textos.
- Embeddings de dimensionalidad reducida mediante el parametro `dimensions` (MRL).
- Cobertura multilingue segun la model card upstream (los metadatos de este repo declaran `en`).
- Servicio online mediante endpoint OpenAI-compatible `/v1/embeddings`.
- Uso offline mediante la API Python de Furiosa-LLM (`LLM.embed`).
- No soporta generacion de texto, tool calling, agentes ni vision (es un modelo de embeddings).

## Casos de uso

- Busqueda semantica en bases de conocimiento: se indexan documentos como vectores y se recuperan los mas proximos a la consulta del usuario, aprovechando la representacion densa del modelo.
- Sistemas RAG (retrieval-augmented generation): el modelo genera los embeddings de los fragmentos de contexto que alimentan a un LLM generador, integrándose como etapa de recuperacion en el pipeline.
- Deduplicacion y clustering de documentos: se calculan embeddings de grandes volumenes de textos y se agrupan por similitud coseno para detectar duplicados o tematicas.
- Recomendacion de contenido: se comparan embeddings de articulos, productos o perfiles para sugerir elementos relacionados semanticamente.
- Moderacion y clasificacion por similitud: se comparan embeddings de mensajes entrantes contra embeddings de referencia de categorias conocidas.
- Despliegue sobre NPU FuriosaAI RNGD: organizaciones con aceleradores RNGD pueden servir embeddings mediante `furiosa-llm serve` con endpoint compatible con OpenAI, sin depender de GPU.
- Reduccion de coste de almacenamiento vectorial: mediante MRL se generan embeddings de menor dimension para indices mas ligeros manteniendo calidad semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo de esta redistribucion: FuriosaAI RNGD (una tarjeta, con 8 PEs en paralelo de tensor).
- Precision de ejecucion: BF16 nativo, sin cuantizacion.
- Inferencia en GPU: no se detalla en esta model card; el modelo upstream puede ejecutarse con Sentence Transformers, vLLM y Transformers, pero esta version esta empaquetada para RNGD.
- VRAM estimada para GPU: no disponible en la informacion proporcionada.
- Despliegue: `furiosa-llm serve` (servidor OpenAI-compatible) o API Python `LLM.embed` de Furiosa-LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| furiosa-ai/Qwen3-Embedding-0.6B (esta ficha) | 595.776.512 | no disponible | Apache 2.0 | Hugging Face, hardware RNGD |
| Qwen/Qwen3-Embedding-0.6B (upstream) | 0,6B (aprox.) | no disponible | Apache 2.0 | Hugging Face, GPU/CPU |
| Otros modelos de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible |

La diferencia principal entre esta version y el modelo upstream es el empaquetado FXB y el soporte de hardware RNGD; los pesos son los mismos.

## Limitaciones y advertencias

- Modelo de embeddings: no genera texto, no soporta tool calling, agentes ni vision.
- Los metadatos de este repositorio declaran solo `en` como idioma, aunque la model card upstream menciona cobertura multilingue; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- No se dispone de datos de benchmarks ni de longitud de contexto en la informacion proporcionada; deben consultarse en la model card upstream.
- Esta version esta empaquetada especificamente para hardware FuriosaAI RNGD; para GPU/CPU debe usarse el modelo upstream.
- Riesgo de sesgos y alucinaciones semantica: los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento; la similitud no garantiza correccion factual.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo upstream y del software Furiosa-LLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-Embedding-0.6B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Documentacion Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
