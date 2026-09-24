# pt810/Ovis-Omni-Embedding-3B-gptq-mixed-w4-w4-w8

## Resumen

Ovis-Omni-Embedding-3B-gptq-mixed-w4-w4-w8 es un checkpoint experimental de embeddings multimodales publicado por el usuario pt810 en HuggingFace. Se trata de una cuantizacion GPTQ weight-only de precision mixta sobre ATH-MaaS/Ovis-Omni-Embedding-3B, un modelo de aproximadamente 2.935 millones de parametros construido sobre la arquitectura Qwen2.5-Omni (componentes Thinker, Talker, vision, audio y token2wav). El objetivo del artefacto es reducir el coste de memoria del encoder para poder servirlo como endpoint de embeddings en GPUs de gama consumer.

La particularidad tecnica es la mezcla de precisiones: las capas 0 a 26 del transformer Thinker se cuantizan a 4 bits y la capa 27 se mantiene a 8 bits, mientras que el resto de componentes (audio, vision, talker, token2wav, embeddings y normalizaciones) conservan la precision original. La calibracion se realizo con solo ocho muestras cortas de texto usando LLM Compressor 0.14.0 y compressed-tensors 0.19.0, y el autor advierte explicitamente de que es un checkpoint derivado experimental que debe evaluarse en retrieval antes de llevarlo a produccion.

Su relevancia practica es limitada pero concreta: demuestra que un modelo de embeddings multimodal de 3B puede arrancar y servir peticiones en una GPU de 8 GiB mediante vLLM 0.30.0 en modo pooling. El repositorio tiene cero descargas y cero likes, no declara licencia ni idiomas soportados, y la model card documenta una reparacion de empaquetado (recalculo de escalas de grupo) que introduce incertidumbre adicional sobre la fidelidad numerica respecto al modelo base en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen2.5-Omni (Thinker, Talker, vision, audio, token2wav) |
| Parametros totales | 2.935 millones (dato declarado en safetensors) |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | 32.768 tokens declarados; no verificada en la GPU de prueba de 8 GiB |
| Tipos de cuantizacion | GPTQ weight-only mixta: W4 en capas 0-26 del Thinker, W8 en la capa 27; resto de componentes en precision original (BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato compressed-tensors / GPTQ) |
| Dimension de embedding | 2.048 dimensiones normalizadas en la salida; el Docker del artefacto solicita 1.024 por defecto |
| Tamano del repositorio | 8,0 GB |
| Autor | pt810 |
| Modelo base | ATH-MaaS/Ovis-Omni-Embedding-3B |
| Fecha de creacion (HuggingFace) | 2026-09-24 |
| Pipeline declarado | text-to-audio (etiqueta heredada; el uso verificado es de embeddings) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen2.5-Omni, organizada en torno a un modulo Thinker que actua como encoder y generador principal, junto con torres de vision y audio, un modulo Talker, un decodificador token2wav y las capas de embedding y normalizacion. En este checkpoint concreto, solo el transformer Thinker esta cuantizado: las 27 primeras capas (0 a 26) usan pesos de 4 bits y la ultima capa (27) se deja en 8 bits, presumiblemente para preservar algo mas de fidelidad en la salida final. El resto de la pila permanece en la precision original, lo que explica que el repositorio ocupe 8,0 GB pese a la cuantizacion agresiva del Thinker.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, porque el checkpoint no se reentrena: es una conversion post-entrenamiento. El proceso de cuantizacion se hizo con LLM Compressor 0.14.0 y compressed-tensors 0.19.0, usando unicamente ocho muestras de texto corto como conjunto de calibracion. El autor documenta ademas una reparacion de empaquetado: el exportador genero escalas de grupo invalidas, por lo que estas se recalcularon desde los pesos BF16 originales grupo a grupo antes de la prueba en vLLM. Este detalle es relevante porque la calibracion basada solo en texto corto puede no representar bien la distribucion de activaciones de las rutas de audio y vision.

## Capacidades

- Generacion de embeddings multimodales: el checkpoint se sirve como modelo de pooling y devuelve vectores normalizados, segun la prueba publicada por el autor.
- Procesamiento multimodal: la pila incluye torres de vision y audio, ademas del Thinker de texto, por lo que el modelo base esta disenado para representar entradas de texto, imagen y audio en un espacio comun.
- Endpoint compatible con OpenAI: la prueba se realizo con `/v1/embeddings` sobre vLLM, lo que permite integracion directa en aplicaciones que ya consumen la API de embeddings de OpenAI.
- Dimension de salida configurable: el comando de prueba usa un pooler con `dimensions: 1024`, aunque la respuesta observada fue de 2.048 dimensiones normalizadas; el Docker del artefacto solicita 1.024 por defecto.
- Retrieval y similitud semantica: al ser un modelo de embeddings, las capacidades derivadas son busqueda semantica, clustering, deduplicacion y clasificacion por vecinos mas cercanos.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el artefacto esta orientado a pooling, no a generacion.
- Modo thinking, vision o audio como capacidades generativas: no documentado en este checkpoint.
- Soporte multilingue: no disponible.

## Casos de uso

- Busqueda semantica multimodal en RAG: indexar documentos, imagenes y fragmentos de audio en un unico espacio vectorial y recuperar por similitud coseno. El modelo es adecuado porque unifica modalidades en un solo encoder de 3B con 32.768 tokens de contexto declarados.
- Deduplicacion de catalogos multimedia: generar embeddings de imagenes de producto o clips de audio y agrupar los vectores con umbrales de similitud para detectar duplicados. El coste por item es bajo gracias a los pesos de 4 bits del Thinker.
- Recomendacion por similitud de contenido: calcular el embedding de los items consumidos por un usuario y recuperar los vecinos mas cercanos del indice como candidatos. La salida normalizada facilita usar producto escalar directamente.
- Recuperacion cross-modal: buscar imagenes o audio a partir de una consulta de texto, aprovechando que las torres de vision y audio comparten espacio de representacion con el texto en el modelo base.
- Clasificacion zero-shot mediante kNN: construir un indice etiquetado y clasificar nuevos elementos por voto de vecinos, util en moderacion de contenido o etiquetado de transparencias.
- Prototipado en GPU de gama consumer: levantar un servidor de embeddings en una RTX 3080 Laptop de 8 GiB con vLLM para validar pipelines antes de invertir en hardware mayor; el autor confirma que el servidor alcanza estado listo con `--max-model-len 256`.
- Evaluacion comparativa de cuantizaciones: usar este checkpoint como referencia de un esquema W4/W4/W8 mixto frente al base en BF16 para medir la degradacion de calidad de recuperacion en un corpus propio.
- Indexacion de audio para podcasts o grabaciones: generar embeddings de clips y permitir busqueda por temario o por fragmento, apoyandose en la torre de audio que permanece sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de rendimiento es funcional: con vLLM 0.30.0, `--runner pooling --convert embed`, `--max-model-len 256`, `--gpu-memory-utilization 0.75` y `--enforce-eager` sobre una RTX 3080 Laptop de 8 GiB, el servidor alcanzo el estado de listo y `/v1/embeddings` devolvio vectores finitos y normalizados de 2.048 dimensiones. No hay datos de MMLU, MTEB, retrieval ni de similitud coseno frente al modelo base.

## Requisitos de hardware

- VRAM para inferencia: no medida de forma desglosada. El checkpoint ocupa 8,0 GB en disco y la prueba funcional se ejecuto en una GPU de 8 GiB con `--gpu-memory-utilization 0.75`, es decir, con un presupuesto de unos 6 GiB. Los pesos del Thinker en 4 bits deberian ocupar en torno a 1,5-2 GB, pero los componentes en BF16 (audio, vision, talker, token2wav) elevan el total; esta cifra es una estimacion, no un dato medido.
- GPU verificada: RTX 3080 Laptop GPU de 8 GiB, con vLLM 0.30.0 y modo eager.
- Cabe en GPU consumer: si, siempre que se mantenga una ventana de contexto corta. La prueba solo valido 256 tokens; el contexto completo de 32.768 tokens no se ha demostrado en 8 GiB, por lo que para esa longitud se necesita mas VRAM (A100, H100, L40S o similares, sin cifra concreta disponible).
- Opciones de despliegue: vLLM 0.30.0 con `--runner pooling --convert embed` es la unica verificada. La libreria declarada es transformers, y el formato compressed-tensors/GPTQ es compatible con el stack de LLM Compressor. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ovis-Omni-Embedding-3B GPTQ W4/W4/W8 (este checkpoint) | 2.935 M | 32.768 tokens declarados | GPTQ mixta W4/W8 en el Thinker | no disponible | 0 descargas, 0 likes |
| ATH-MaaS/Ovis-Omni-Embedding-3B (base) | 2.935 M | no disponible en la informacion proporcionada | BF16 sin cuantizar | no disponible | referenciado como modelo base |
| Alternativas de embeddings multimodales (BGE-M3, GME, jina-embeddings-v3, etc.) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No hay datos de benchmarks ni especificaciones de terceros en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento con alternativas. La unica comparacion defendible es cualitativa: frente al modelo base en BF16, este checkpoint reduce el peso del Thinker a 4 bits en 27 de sus 28 capas a cambio de un proceso de calibracion minimo (ocho muestras de texto) y de un recalculo de escalas que el propio autor califica de reparacion.

## Limitaciones y advertencias

- Caracter experimental declarado por el autor: la model card pide explicitamente evaluar la calidad de retrieval antes de usar el checkpoint en produccion.
- Calibracion muy pobre: solo ocho muestras de texto corto. Las rutas de audio y vision, que permanecen en BF16, no participaron en la calibracion, pero las activaciones que las atraviesan si pueden verse afectadas por la cuantizacion del Thinker.
- Reparacion de empaquetado: las escalas de grupo invalidas se recalcularon desde los pesos BF16 originales, lo que anade una fuente de desviacion respecto a una conversion GPTQ estandar.
- Contexto no verificado: los 32.768 tokens declarados no se han demostrado; la prueba real se hizo con `--max-model-len 256`, es decir, 256 tokens.
- Inconsistencia de dimensiones: la peticion usa `dimensions: 1024` pero la respuesta observada fue de 2.048 dimensiones. Hay que fijar la dimension esperada en el cliente antes de indexar.
- Licencia no disponible: sin licencia declarada no se puede asumir uso comercial libre. Ademas, al derivar de Qwen2.5-Omni, podrian aplicar condiciones del modelo original que no se detallan en este repositorio.
- Idiomas no declarados: no hay garantia documentada de cobertura multilingue.
- Sin validacion comunitaria: cero descargas y cero likes, y fechas de creacion y actualizacion separadas por menos de diez minutos, lo que sugiere una publicacion de prueba.
- Riesgo de similitudes poco fiables: en un modelo de embeddings el fallo tipico no es la alucinacion de texto, sino devolver vecinos semanticamente incorrectos de forma consistente; conviene medir recall@k contra el modelo base en BF16.
- Etiqueta de pipeline incorrecta: HuggingFace lo clasifica como `text-to-audio`, lo que puede confundir a herramientas automaticas que infieran el uso a partir de ese campo.
- Compatibilidad limitada de runtime: no hay evidencia de funcionamiento en llama.cpp, Ollama o TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pt810/Ovis-Omni-Embedding-3B-gptq-mixed-w4-w4-w8
- Modelo base: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Herramientas citadas en la model card, sin URL incluida en la informacion proporcionada: LLM Compressor 0.14.0, compressed-tensors 0.19.0 y vLLM 0.30.0.
