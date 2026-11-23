# chrullis/relweave-1.7b-base

## Resumen

relweave-1.7b-base es un modelo especializado en extraccion de entidades y relaciones tipadas a partir de texto en ingles para construir grafos de conocimiento. Lo desarrolla el autor chrullis y se distribuye bajo licencia Apache 2.0. No es un modelo de chat generalista: es un componente de un pipeline de extraccion de informacion que devuelve entidades (con todas sus menciones, incluidos pronombres y descripciones como "the company") y relaciones tipadas entre ellas, siguiendo un esquema de negocio fijo de 6 tipos de entidad y 21 tipos de relacion (empresas, personas, lugares, propiedad, filiales, ejecutivos, consejeros, adquisiciones, entre otros).

Tecnicamente es la variante pequena de relweave-4b-base, entrenada con los mismos datos y receta: dos adaptadores LoRA sobre Qwen3-1.7B en cuantizacion de 4 bits. El primero, `generator`, escribe las entidades y relaciones como texto bajo decodificacion restringida; el segundo, `head`, es una cabeza de clasificacion por pares que puntua cada par de entidades y corrige al generador eliminando relaciones inventadas y anadiendo las omitidas. Ademas incluye un `tagger` que etiqueta todos los nombres en una pasada sobre los estados ocultos de la cabeza de pares.

El modelo tiene 1.720.574.976 parametros y un repositorio de 3,9 GB. Su relevancia actual reside en que ofrece extraccion de grafos de conocimiento de calidad cercana a la variante de 4B (F1 estricto de 0,716 en test frente a 0,783) con un coste de inferencia mucho menor: unos 96 chunks por minuto en vLLM sobre una RTX 3070 Ti de 8 GB, frente a 42 del modelo de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con dos adaptadores LoRA (generator + pair head) y un tagger BERT-style |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (`--max-model-len 4096` en vLLM); 3072 en configuracion de 8 GB |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); pesos del generador en bf16 para vLLM; fp8 disponible en la variante 4B |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/qwen3-1.7b-unsloth-bnb-4bit |
| Libreria | relweave |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-1.7B cuantizado en 4 bits y se especializa mediante dos adaptadores LoRA que trabajan de forma conjunta. El `generator` produce entidades y relaciones en un formato de lineas fijo bajo decodificacion restringida por una gramatica por chunk que la libreria relweave envia con cada peticion. El `head` es una cabeza de clasificacion por pares que puntua cada par de entidades; sus puntuaciones eliminan relaciones que el generador invento y anaden las que omitio. El `tagger` etiqueta todos los nombres en una sola pasada sobre los estados ocultos de la cabeza de pares (estilo BERT, sin lista de terminacion anticipada), de modo que los nombres que el generador deja fuera en listas largas y celdas de tabla llegan igualmente a la cabeza de pares. El tagger se ejecuta junto con la cabeza, por lo que funciona aunque el generador se sirva con vLLM.

El entrenamiento utiliza el dataset `chrullis/relweave-business-data`. La cabeza de pares fue reentrenada el 2026-10-18 con la receta completa de la cabeza del modelo de 4B: su LoRA crece a partir de este generador, una pasada sobre el pool de verificacion y despues el pool completo; la cabeza anterior se habia saltado dos de esas pasadas. La evaluacion se realizo sobre pasajes de Wikipedia en ingles sobre empresas nordicas y europeas, con conjuntos que no comparten documentos con el entrenamiento y filtrados por personas, empresas y hechos compartidos, aunque persiste cierto solapamiento (el 14% de los nombres de persona y empresa del test tambien aparecen en las etiquetas de entrenamiento). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion completa del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Extraccion de entidades tipadas en ingles, con todas sus menciones, incluidos pronombres y descripciones definidas como "the company".
- Extraccion de relaciones tipadas y dirigidas segun un esquema fijo de negocio de 6 tipos de entidad y 21 tipos de relacion (propiedad, filiales, ejecutivos, consejeros, adquisiciones, entre otras).
- Etiquetado de nombres en una sola pasada (tagger) que recupera nombres omitidos por el generador en listas largas y celdas de tabla.
- Correccion de relaciones mediante una cabeza de clasificacion por pares que elimina falsos positivos del generador y recupera falsos negativos.
- Salida en JSON Graph Format v2 con nodos, aristas, spans de mencion y evidencia.
- Procesamiento de documentos largos mediante chunking y fusion de entidades entre chunks a traves de la libreria relweave.
- Servicio del generador mediante vLLM con API compatible con OpenAI, sin necesidad de `--enable-lora` (los LoRA del generador estan fusionados en los pesos de la raiz del repositorio).
- No soporta tool calling, function calling, agentes multi-step, vision, audio ni modo thinking: es un componente de extraccion, no un modelo conversacional.

## Casos de uso

- Construccion de grafos de conocimiento corporativos: el modelo lee informes anuales, notas de prensa y comunicados y devuelve las entidades (empresas, personas, lugares) y las relaciones tipadas entre ellas, listas para cargar en una base de datos de grafos gracias a la salida en JSON Graph Format v2.
- Enriquecimiento de bases de datos de clientes B2B: a partir de descripciones libres de empresas, extrae relaciones de propiedad, filiales y cargos ejecutivos para completar fichas CRM con evidencia y spans de mencion.
- Analisis de documentos legales y judiciales: procesa opiniones judiciales y contratos en ingles para identificar partes, relaciones de propiedad y adquisiciones, con la ventaja de que el chunking y la fusion de entidades de relweave permiten manejar documentos de longitud arbitraria.
- Monitorizacion de noticias financieras: ejecutado en vLLM a unos 96 chunks por minuto en una RTX 3070 Ti, permite procesar flujos continuos de noticias y detectar cambios de propiedad, nombramientos de ejecutivos y adquisiciones casi en tiempo real.
- Extraccion de tablas y listas largas: el tagger recupera nombres que el generador omite en listas extensas y celdas de tabla, lo que lo hace adecuado para digitalizar tablas de participadas o consejos de administracion.
- Deduplicacion y resolucion de entidades entre documentos: la fusion de entidades entre chunks de relweave y las menciones con pronombres y descripciones permiten consolidar referencias a la misma entidad a lo largo de un corpus.
- Investigacion en extraccion de informacion: sirve como linea base reproducible (generador + cabeza de pares + tagger) para experimentos de relation extraction y coreference sobre dominios de negocio.

## Benchmarks y rendimiento

Resultados publicados por el autor. F1 estricto de relacion tipada (una relacion cuenta solo con el tipo, la direccion y ambas entidades correctas) sobre pasajes retenidos de Wikipedia en ingles sobre empresas nordicas y europeas.

| Sistema | Validacion | Test |
|---|---|---|
| relweave-1.7b-base (generador + cabeza de pares, union) | 0,733 | 0,716 |
| Generador solo | 0,622 | 0,626 |
| relweave-4b-base (comparacion) | 0,781 | 0,783 |

En test, precision 0,781 y recall 0,661; el 1.7B queda 0,067 por debajo del 4B (intervalo de confianza del 95%: 0,030 a 0,108).

Documentos largos no vistos (26 documentos de noticias, notas de prensa y opiniones judiciales, juzgados por dos jueces de lenguaje, hechos contados una vez):

| Sistema | F1 agrupado |
|---|---|
| relweave-1.7b-base con cabeza nueva y tagger | 0,574 |
| relweave-1.7b-base con cabeza anterior | 0,515 |
| relweave-4b-base | 0,597 |

La mejora de la cabeza nueva frente a la anterior es de +0,059 (IC 95%: -0,002 a +0,124). En los chunks retenidos ambas cabezas no difieren (0,716 frente a 0,722). El recall agrupado cuenta solo hechos encontrados por algun sistema del pool, por lo que estos F1 son inferiores a los de chunk y deben compararse entre si, no con la tabla anterior.

Rendimiento de inferencia en una RTX 3070 Ti (8 GB), 64 chunks de test de unas 200 palabras:

| Modelo | Generador en vLLM | Generador con transformers | Pesos en memoria (vLLM) |
|---|---|---|---|
| relweave-4b-base | unos 42 chunks/min (fp8) | unos 4,5 chunks/min | 4,2 GB (fp8) |
| relweave-1.7b-base | unos 96 chunks/min (bf16) | unos 6 chunks/min | 3,3 GB (bf16) |

## Requisitos de hardware

- Se requiere una GPU CUDA; el modelo base esta en 4 bits.
- La cabeza de pares se ejecuta siempre en local dentro de relweave (necesita los estados ocultos del modelo, que vLLM no devuelve) y requiere unos 3 GB libres de VRAM.
- En una tarjeta de 8 GB caben juntos el servidor del 1.7B y la cabeza de pares con `--gpu-memory-utilization 0.52 --max-model-len 3072 --max-num-batched-tokens 1024 --enforce-eager`.
- Pesos del generador en vLLM: 3,3 GB en bf16.
- Despliegue recomendado: vLLM 0.31 o superior (`vllm serve chrullis/relweave-1.7b-base --max-model-len 4096`) o el contenedor oficial `vllm/vllm-openai`. Sin CUDA toolkit instalado, arrancar con `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Backend alternativo: transformers (unas 6 chunks/min en la RTX 3070 Ti, frente a 96 con vLLM).
- Throughput estimado: unos 96 chunks/min en vLLM sobre RTX 3070 Ti con chunks de unas 200 palabras. No se han publicado datos de latencia por peticion ni de GPU de datacenter (A100, H100).
- No se documenta soporte para llama.cpp, Ollama ni TGI; la libreria relweave esta disenada en torno a vLLM y transformers.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 test (estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| relweave-1.7b-base | 1,72 B | 4096 | 0,716 | Apache 2.0 | Hugging Face, via relweave |
| relweave-4b-base | no disponible en la informacion | no disponible | 0,783 | no disponible en la informacion | Hugging Face, via relweave |
| Modelos genericos de extraccion (p. ej. LLM grandes con prompting) | variable | variable | no disponible | variable | no disponible |

La unica comparacion directa publicada es con relweave-4b-base, entrenado con los mismos datos y receta. El 1.7B sacrifica 0,067 de F1 en test y 0,023 en documentos largos no vistos a cambio de mas del doble de throughput en vLLM y menor huella de memoria. No se dispone de datos de benchmarks frente a otros sistemas de extraccion de relaciones en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- El esquema es fijo: 6 tipos de entidad y 21 tipos de relacion de negocio. No es configurable ni extensible sin reentrenamiento.
- No es un modelo de chat: solo responde en el formato de lineas de relweave cuando se le pide como fue entrenado y se decodifica bajo la gramatica por chunk que envia la libreria. Llamarlo directamente sin relweave produce salidas no utilizables.
- Riesgo de alucinacion en relaciones: el generador solo alcanza F1 0,626 sin la cabeza de pares; la correccion depende de que la cabeza se ejecute en local con acceso a los estados ocultos.
- El conjunto de test presenta solapamiento residual con el entrenamiento (14% de nombres de persona y empresa), lo que puede inflar ligeramente las metricas.
- En documentos largos no vistos el F1 agrupado baja a 0,574, con un intervalo de confianza que incluye el cero en la mejora de la cabeza nueva (-0,002 a +0,124): la ventaja no es concluyente estadisticamente.
- Requiere GPU CUDA; no hay soporte documentado para CPU, llama.cpp u Ollama.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3 y el dataset deben verificarse por separado; no se detalla en la informacion disponible la licencia de relweave-4b-base ni del dataset `chrullis/relweave-business-data`.
- La version de PyPI de la libreria relweave aun no esta publicada; la instalacion es via `pip install git+https://github.com/memlocator/relweave`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chrullis/relweave-1.7b-base
- Variante mayor: https://huggingface.co/chrullis/relweave-4b-base
- Repositorio de la libreria: https://github.com/memlocator/relweave
- Dataset de entrenamiento: https://huggingface.co/datasets/chrullis/relweave-business-data
- Modelo base: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
- Contenedor oficial de vLLM: `vllm/vllm-openai` (Docker Hub)
