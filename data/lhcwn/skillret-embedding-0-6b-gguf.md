# lhcwn/SKILLRET-Embedding-0.6B-GGUF

## Resumen

SKILLRET-Embedding-0.6B-GGUF es una conversion al formato GGUF del modelo de embeddings ThakiCloud/SKILLRET-Embedding-0.6B, un Qwen3-Embedding-0.6B afinado especificamente para la recuperacion de habilidades (skill retrieval) en sistemas de seleccion de herramientas. El repositorio lo publica el usuario lhcwn como artefacto de distribucion del servicio magpie-picker, que descarga el fichero por su hash SHA-256. No se ha entrenado ni modificado ningun peso: se trata unicamente de una conversion a GGUF y una cuantizacion Q4_K_M de los pesos originales.

El modelo resuelve el problema de emparejar peticiones en lenguaje natural con descripciones de habilidades o herramientas disponibles, un paso habitual en arquitecturas de agentes y enrutadores de herramientas. Con 595.776.512 parametros (aproximadamente 0,6 mil millones), produce vectores de 1024 dimensiones y emplea pooling por ultimo token. Su relevancia practica radica en que permite ejecutar la recuperacion semantica en CPU con llama.cpp, sin necesidad de GPU ni de infraestructura de inferencia pesada.

La ficha se centra en el artefacto GGUF publicado; los datos sobre el entrenamiento del modelo base no aparecen en la informacion disponible y se marcan como tales. La licencia Apache-2.0 se hereda del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-Embedding-0.6B); detalles internos del modelo base no disponibles |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de referencia de llama-server (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (publicada); el autor menciona comparacion con Q8_0 y conversion intermedia a f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`skillret-0.6b-q4_k_m-magpie.gguf`, 396.474.176 bytes / 378 MiB) |
| Dimension del vector | 1024 |
| Pooling | ultimo token (`--pooling last`) |
| SHA-256 del fichero | `bc5c0366ef31d305f99b36048c470816d162b93e1c4bced13d964af6d2e3baf9` |
| Revision del modelo fuente | `67f1594c46c40e13a5eb2f4092cc85c98c9ed32d` |
| Herramienta de conversion | llama.cpp `b12237` (`convert_hf_to_gguf.py --outtype f16` + `llama-quantize ... Q4_K_M`) |

## Arquitectura y entrenamiento

El artefacto es una conversion directa de ThakiCloud/SKILLRET-Embedding-0.6B, descrito por el autor como un Qwen3-Embedding-0.6B ajustado para skill retrieval. La arquitectura subyacente es, por tanto, la de un transformer denso de codificacion con 595.776.512 parametros que genera representaciones de 1024 dimensiones mediante pooling del ultimo token. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF, DPO o entrenamiento contrastivo supervisado; estos datos no estan disponibles en la informacion proporcionada.

La innovacion practica del repositorio no esta en el modelo sino en el proceso de empaquetado: conversion a f16 con el script oficial de llama.cpp en la build `b12237` y posterior cuantizacion a Q4_K_M. El autor verifico que los vectores generados por llama.cpp (tambien en f16) alcanzan una similitud coseno de 0,96 a 0,98 respecto a la ejecucion del modelo fuente con transformers sobre los mismos tokens, es decir, son equivalentes en la practica pero no identicos. Ademas, Q4_K_M igualo la calidad de recuperacion de Q8_0 en el benchmark empleado para la eleccion, con aproximadamente 1,7 veces mas velocidad en CPU. El modelo incorpora una instruccion de consulta especifica para las busquedas: `Instruct: Given a skill search query, retrieve relevant skills that match the query\nQuery: <request>`, mientras que las descripciones de habilidades o herramientas se embeben sin instruccion.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica (feature-extraction), con vectores de 1024 dimensiones.
- Recuperacion de habilidades y herramientas (skill retrieval): empareja peticiones en lenguaje natural con descripciones de skills o tools.
- Asimetria consulta/documento: aplica una instruccion prefijada a las consultas y embebe las descripciones tal cual, un patron propio de los modelos de recuperacion entrenados para ese formato.
- Integracion con llama.cpp mediante el endpoint de embeddings (`llama-server --embeddings`), compatible con clientes que consumen la API de embeddings de llama.cpp.
- Ejecucion en CPU: el tamano de 378 MiB y la cuantizacion Q4_K_M permiten inferencia sin GPU.
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas, vision, audio, tool calling generativo ni modo de pensamiento: es exclusivamente un modelo de representaciones.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutador de herramientas en agentes: dado un turno del usuario, embeber la peticion con la instruccion de consulta y recuperar por similitud coseno las descripciones de herramientas candidatas antes de pasarlas al LLM planificador. El modelo esta afinado exactamente para esta tarea y cabe en CPU.
- Servicio de seleccion de skills (magpie-picker): el caso de uso original del artefacto, que descarga el fichero por SHA-256 y lo sirve con llama-server para resolver peticiones contra un catalogo de habilidades.
- Busqueda semantica sobre documentacion tecnica interna: indexar fragmentos de manuales o runbooks como documentos y consultar en lenguaje natural, aprovechando el contexto de 8192 tokens para fragmentos largos.
- Deduplicacion y clustering de descripciones de herramientas: embeber un catalogo de skills y agrupar por similitud para detectar herramientas solapadas o mal descritas antes de publicarlas en un registro.
- Filtrado previo en pipelines RAG de bajo coste: usar este modelo como primera etapa de recuperacion en CPU y reservar un reordenador o un modelo mayor para la segunda etapa, reduciendo coste de GPU.
- Despliegue en entornos sin GPU o edge: servicios embebidos, CI o maquinas de desarrollo donde un contenedor con llama.cpp y 378 MiB de pesos es viable, con la misma API de embeddings que en produccion.
- Evaluacion offline de catalogos de agentes: medir la calidad de recuperacion de un conjunto de skills frente a un banco de consultas etiquetadas antes de desplegar el enrutador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor unicamente reporta dos comprobaciones cualitativas y relativas:

| Comprobacion | Resultado reportado |
|---|---|
| Similitud coseno frente al modelo fuente con transformers (mismos tokens) | 0,96 a 0,98 |
| Calidad de recuperacion Q4_K_M frente a Q8_0 | igual en el benchmark de seleccion |
| Velocidad Q4_K_M frente a Q8_0 en CPU | aproximadamente 1,7x |

No se especifica el benchmark concreto, el tamano del conjunto de evaluacion ni las metricas de recuperacion (Recall@k, nDCG, MRR), por lo que estos datos no estan disponibles.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. En CPU, el fichero Q4_K_M ocupa 378 MiB; el consumo de RAM anade el contexto (hasta 8192 tokens) y las estructuras de llama.cpp, por lo que un presupuesto de 1 a 2 GB de RAM es suficiente en la practica.
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU con unos pocos GB de VRAM puede alojarlo, pero el autor solo valido la ejecucion en CPU.
- GPU de consumo: cabe en cualquier GPU de consumo actual por tamano, aunque no se han publicado mediciones en GPU.
- Despliegue: llama.cpp `b12237` o superior, con `llama-server -m skillret-0.6b-q4_k_m-magpie.gguf --embeddings --pooling last -c 8192 -b 8192 -ub 8192`. No se documenta soporte en vLLM, TGI ni Ollama en la informacion disponible.
- Sistemas validados: Linux x86-64 unicamente, con llama.cpp `b12237`.
- Latencia y throughput: no se publican valores absolutos; solo la comparacion relativa de 1,7x de Q4_K_M frente a Q8_0 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension del vector | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SKILLRET-Embedding-0.6B-GGUF (este) | 595.776.512 | 8192 (config. de referencia) | 1024 | Apache-2.0 | GGUF Q4_K_M | Afinado para skill retrieval; pooling por ultimo token |
| ThakiCloud/SKILLRET-Embedding-0.6B | 595.776.512 | no disponible | 1024 | Apache-2.0 | safetensors (presumible, no confirmado) | Modelo fuente sin cuantizar; requiere transformers |
| Qwen3-Embedding-0.6B | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | Modelo base declarado por el autor del modelo fuente |
| Otras alternativas de embeddings de ~0,6B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa de rendimiento frente a alternativas no esta disponible. La diferencia operativa mas relevante frente al modelo fuente es el formato: el GGUF permite ejecucion en CPU con llama.cpp, a costa de una equivalencia no exacta (coseno 0,96 a 0,98) y de una calidad de recuperacion no verificada fuera del benchmark interno del autor.

## Limitaciones y advertencias

- Es un modelo exclusivamente de embeddings: no genera texto ni admite instrucciones generativas; usarlo como LLM produce resultados invalidos.
- Solo se ha validado en Linux x86-64 con llama.cpp `b12237`; no hay garantias en otras plataformas, builds antiguas o backends alternativos.
- Los vectores no son identicos a los del modelo fuente (coseno 0,96 a 0,98): sistemas que comparen embeddings precalculados con transformers y embeddings nuevos con este GGUF pueden sufrir deriva; hay que reindexar el corpus si se cambia de backend.
- El pooling debe configurarse como `last`; usar otro pooling degrada la calidad sin aviso.
- Las consultas deben llevar la instruccion exacta indicada por el autor; omitirla altera la distribucion de embeddings respecto al entrenamiento.
- La cuantizacion Q4_K_M solo se valido contra Q8_0 en un benchmark no especificado; no hay datos sobre su efecto en dominios distintos al de skill retrieval.
- No hay informacion sobre sesgos, tasas de alucinacion (no aplica a generacion, pero si a recuperaciones irrelevantes), cobertura idiomatica ni robustez multilingue.
- Riesgo de recuperacion espuria: al devolver siempre los vecinos mas cercanos, un catalogo sin umbral de similitud puede seleccionar habilidades irrelevantes; conviene fijar un umbral y un fallback.
- Licencia Apache-2.0 heredada del modelo fuente: permite uso comercial, pero conviene conservar los avisos de atribucion y verificar las condiciones del modelo base ThakiCloud/SKILLRET-Embedding-0.6B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- El autor no documenta el proceso de entrenamiento del modelo fuente, por lo que no se puede evaluar la procedencia ni las licencias de los datos de ajuste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lhcwn/SKILLRET-Embedding-0.6B-GGUF
- Modelo fuente: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Revision del modelo fuente: `67f1594c46c40e13a5eb2f4092cc85c98c9ed32d`
- llama.cpp (herramienta de conversion y servidor): https://github.com/ggml-org/llama.cpp
- Documentacion de embeddings en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/examples/server/README.md
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
