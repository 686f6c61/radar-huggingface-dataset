# llm-semantic-router/Vela-1.0-Omni-Mini

## Resumen

Vela-1.0-Omni-Mini es un modelo de extraccion de caracteristicas (feature extraction) desarrollado por el equipo de vLLM Semantic Router (organizacion llm-semantic-router). Su funcion no es generar texto, sino proyectar texto, imagenes y audio a un espacio de embeddings compartido de 768 dimensiones, con vectores L2-normalizados y comparables mediante producto escalar. Resuelve el problema de disponer de un unico codificador multimodal para busqueda, enrutado semantico y agrupamiento (clustering) de contenido heterogeneo.

El modelo cuenta con 1.044.152.640 parametros (aproximadamente 1.044M) y se distribuye en safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 7,2 GB. Esta pensado para integrarse en el enrutador semantico del proyecto vLLM Semantic Router, donde cada destino (modelo, herramienta o categoria) se representa con un embedding y la peticion entrante se dirige al vector mas cercano.

Es relevante ahora porque cubre las tres modalidades (texto, imagen y audio) en un unico espacio, algo que sus propios modelos comparables no hacen: frente a multi-modal-embed-large, mejora el recall en recuperacion imagen-texto y, de forma muy marcada, en recuperacion audio-texto (por ejemplo, R@1 de audio a texto pasa de 56,99 a 90,23). El modelo se publico el 17 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador multimodal (texto, imagen y audio) que proyecta a un espacio de embeddings compartido de 768 dimensiones; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 1.044.152.640 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para el modelo; la evaluacion publicada usa un limite comun de 128 tokens de texto y clips de audio de hasta 30 segundos |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors; la evaluacion usa embeddings en FP32) |
| Idiomas soportados | No disponible (las evaluaciones de texto usan conjuntos en ingles: Banking77, MASSIVE English y LibriSpeech) |
| Licencia | Apache 2.0 (con atribucion de componentes en NOTICE) |
| Formato de pesos | Safetensors (libreria PyTorch; incluye codigo nativo del modelo, configuraciones de componentes, tokenizer y ficheros de procesador) |
| Dimension del embedding | 768 (L2-normalizado) |
| Tamano del repositorio | 7,2 GB |
| Pipeline declarado | feature-extraction |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo multimodal que mapea texto, imagenes y voz a un espacio de embeddings comun, con salidas de 768 dimensiones normalizadas L2. El repositorio incluye el codigo nativo del modelo y las configuraciones de sus componentes, lo que sugiere una arquitectura modular con codificadores especificos por modalidad y una proyeccion a un espacio compartido, pero el detalle de la arquitectura interna (tipo de transformer, atencion, etc.) no se especifica en la model card.

En cuanto al entrenamiento, la model card indica que la alineacion entre modalidades se realiza con pares imagen-caption de COCO (subconjunto de imagenes CC-BY 2.0) y pares voz-transcripcion de LibriSpeech (CC-BY 4.0). Ademas, el modelo se adapta usando ejemplos de entrenamiento y etiquetas de intencion de Banking77 y MASSIVE (ambos CC-BY 4.0), lo que significa que las puntuaciones de texto miden adaptacion supervisada con clasificacion por prototipo mas cercano, no transferencia zero-shot ni el protocolo MTEB. No se detalla el numero de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de embeddings).

## Capacidades

- Extraccion de caracteristicas: genera embeddings de 768 dimensiones L2-normalizados para texto (`encode_text`), imagenes (Pillow, `encode_image`) y audio (ondas mono NumPy, `encode_audio` a 16 kHz).
- Recuperacion imagen-texto (image-text retrieval) y texto-imagen.
- Recuperacion audio-texto (audio-text retrieval) y texto-audio.
- Clasificacion por prototipos: asignacion de clases comparando el embedding de la consulta con prototipos fijos (usado en Banking77 y MASSIVE).
- Enrutado semantico: seleccion del destino mas cercano a partir de los embeddings del nombre y la descripcion de cada destino.
- Clustering y descubrimiento de categorias: agrupamiento de embeddings multimedia para inspeccionar grupos.
- Similitud por producto escalar entre vectores normalizados.
- No aplica generacion de texto, razonamiento, codigo ni matematicas: es un modelo de embeddings, no un LLM generativo.
- No se documenta soporte de tool calling / function calling ni de flujos de agentes o razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidad especial: cobertura de tres modalidades (texto, imagen y audio) en un unico espacio vectorial.

## Casos de uso

- Busqueda multimodal unificada: indexar un corpus mixto de textos, imagenes y audios y recuperar elementos por consulta en cualquier modalidad, gracias a que los tres tipos comparten un mismo espacio de 768 dimensiones.
- Enrutado semantico de peticiones hacia backends o modelos: embeber el nombre y la descripcion de cada destino y elegir el vector mas cercano a la consulta, que es el caso de uso principal del proyecto vLLM Semantic Router.
- Clasificacion de intenciones en atencion al cliente: usar prototipos de intencion (como en Banking77) para etiquetar consultas entrantes con un clasificador de prototipo mas cercano, sin reentrenar el codificador.
- Recuperacion sobre archivos de audio: buscar el fragmento o la transcripcion asociada a un clip de hasta 30 segundos mediante recuperacion texto-audio y audio-texto (LibriSpeech).
- Clustering y taxonomia de contenido: agrupar un catalogo de imagenes, audios y textos para descubrir categorias emergentes e inspeccionar cada grupo antes de definir etiquetas.
- Sistemas RAG multimodales: servir como recuperador sobre una base documental que combine texto, imagenes y notas de voz, entregando los fragmentos mas similares a un LLM generativo externo.
- Deduplicacion de contenido multimedia: detectar elementos casi identicos en una biblioteca de medios comparando la similitud coseno entre embeddings normalizados.
- Moderacion y organizacion de bibliotecas de medios: ordenar y filtrar activos por similitud respecto a un vector de referencia (por ejemplo, una imagen o una descripcion textual de politica).

## Benchmarks y rendimiento

Resultados publicados en la model card (escala 0-100, mayor es mejor; N/A indica modalidad no soportada por el modelo solo-texto):

| Metrica | Vela-1.0-Encoder-307M-Embedding | multi-modal-embed-small | multi-modal-embed-large | Vela-1.0-Omni-Mini |
|---|---:|---:|---:|---:|
| Banking77 · Accuracy | 80,00 | 70,42 | 75,78 | 77,99 |
| MASSIVE English · Accuracy | 75,64 | 65,95 | 72,31 | 73,35 |
| COCO · Image → text · R@1 | N/A | 40,83 | 42,53 | 54,92 |
| COCO · Image → text · R@5 | N/A | 67,19 | 75,21 | 83,72 |
| COCO · Image → text · R@10 | N/A | 78,49 | 87,61 | 93,80 |
| COCO · Text → image · R@1 | N/A | 30,18 | 35,04 | 45,76 |
| COCO · Text → image · R@5 | N/A | 59,42 | 70,09 | 79,56 |
| COCO · Text → image · R@10 | N/A | 74,29 | 83,91 | 90,69 |
| LibriSpeech · Audio → text · R@1 | N/A | 4,21 | 56,99 | 90,23 |
| LibriSpeech · Audio → text · R@5 | N/A | 11,99 | 81,85 | 97,09 |
| LibriSpeech · Audio → text · R@10 | N/A | 19,03 | 87,94 | 98,12 |
| LibriSpeech · Text → audio · R@1 | N/A | 9,58 | 78,58 | 92,22 |
| LibriSpeech · Text → audio · R@5 | N/A | 22,53 | 94,02 | 98,16 |
| LibriSpeech · Text → audio · R@10 | N/A | 30,69 | 97,01 | 99,12 |

Protocolo segun la model card: la evaluacion de texto usa prototipos de clase fijos (3.080 consultas de Banking77 y 2.972 de MASSIVE English) y el modelo se adapta con ejemplos de entrenamiento y etiquetas de esos dos conjuntos, mientras que los modelos de comparacion se evaluan tal cual se publicaron. La recuperacion de imagen usa el subconjunto COCO Karpathy CC-BY 2.0 (823 imagenes y 4.115 captions) y la de voz usa 2.611 clips de LibriSpeech test-clean y 2.610 transcripciones unicas, con clips limitados a 30 segundos. El recall se mide contra el pool completo de candidatos, aceptando todos los positivos coincidentes. Los embeddings son FP32, con similitud coseno y un limite comun de 128 tokens de texto. Las puntuaciones completas y el protocolo detallado estan en `scores.json` dentro del repositorio.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 4,2 GB solo para parametros (1.044M × 4 bytes), mas activaciones y buffers; estimacion propia, no publicada en la model card.
- Pesos en FP16/BF16: aproximadamente 2,1 GB solo para parametros; estimacion propia.
- Tamano del repositorio completo descargado: 7,2 GB, ya que incluye codigo, configuraciones y ficheros de tokenizer/procesador ademas de los pesos.
- Cabe en GPU de consumo: si, con los pesos en FP32 basta una GPU de 12 GB (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080/4090); con FP16 el margen es amplio incluso en GPUs de 8 GB.
- La model card muestra inferencia en CPU (`VelaOmni.from_pretrained(path, device="cpu")`), por lo que es viable sin GPU para cargas moderadas.
- GPUs de centro de datos (A100, H100) no son necesarias para este tamano, si bien pueden usarse para servir por lotes a gran volumen.
- Opciones de despliegue documentadas: PyTorch con Transformers 4.57.6, huggingface_hub, safetensors, NumPy y Pillow, cargando el modulo nativo `vela_omni` incluido en el repositorio.
- No se documentan en la informacion disponible formatos GGUF, soporte para llama.cpp, Ollama, TGI o vLLM, ni latencias o throughput medidos.

## Comparativa con modelos similares

Todos los modelos comparables pertenecen al mismo autor (llm-semantic-router) y forman parte de la coleccion Vela 1.0.

| Modelo | Parametros | Modalidades | Banking77 (accuracy) | COCO Image → text R@1 | LibriSpeech Audio → text R@1 | Licencia |
|---|---|---|---|---|---|---|
| Vela-1.0-Omni-Mini | 1.044.152.640 | Texto, imagen y audio | 77,99 | 54,92 | 90,23 | Apache 2.0 |
| Vela-1.0-Encoder-307M-Embedding | 307M (segun el nombre) | Solo texto | 80,00 | N/A | N/A | No disponible |
| multi-modal-embed-large | No disponible | Texto, imagen y audio | 75,78 | 42,53 | 56,99 | No disponible |
| multi-modal-embed-small | No disponible | Texto, imagen y audio | 70,42 | 40,83 | 4,21 | No disponible |

Observaciones: Vela-1.0-Encoder-307M-Embedding supera a Vela-1.0-Omni-Mini en las dos tareas de clasificacion de texto (80,00 frente a 77,99 en Banking77; 75,64 frente a 73,35 en MASSIVE English), pero no cubre imagen ni audio. Frente a multi-modal-embed-large, Vela-1.0-Omni-Mini mejora en todas las metricas multimodales publicadas, con una ventaja especialmente grande en recuperacion de voz. No se dispone de datos de parametros, contexto ni licencia de los modelos multi-modal-embed-small y multi-modal-embed-large.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni razonamiento; solo genera embeddings para recuperacion, clasificacion y clustering.
- Las puntuaciones de similitud son rankings, no probabilidades calibradas; no deben interpretarse como niveles de confianza.
- Las metricas de texto miden adaptacion supervisada con clasificacion por prototipo mas cercano, no transferencia zero-shot ni el protocolo MTEB, por lo que no son comparables directamente con puntuaciones MTEB de otros modelos.
- El modelo se adapta con ejemplos de entrenamiento y etiquetas de Banking77 y MASSIVE, mientras que los modelos de comparacion se evaluan sin esa adaptacion; existe riesgo de sobreajuste a esos conjuntos y de sesgo en la comparativa publicada.
- Los clips de audio deben ser de 30 segundos como maximo; no se documenta comportamiento para audios mas largos.
- La evaluacion de texto usa un limite de 128 tokens; la longitud de contexto real del modelo no esta documentada.
- Idiomas soportados no disponibles: toda la evaluacion publicada es en ingles, por lo que el comportamiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperaciones espurias cuando los embeddings de modalidades distintas quedan proximos sin correspondencia semantica real.
- Licencia Apache 2.0 para el modelo, pero el repositorio incluye un fichero NOTICE con la atribucion y las condiciones de licencia de componentes de terceros; conviene revisarlo antes de un uso comercial.
- Modelo muy reciente y con adopcion nula (0 descargas, 1 like en el momento de la consulta): no hay validacion independiente ni ecosistema de terceros.
- No se documentan tecnicas de cuantizacion, formatos GGUF ni soporte en frameworks de servido habituales, lo que puede complicar el despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Omni-Mini
- Demo Vela Studio: https://huggingface.co/spaces/llm-semantic-router/vela-studio
- Coleccion Vela 1.0: https://huggingface.co/collections/llm-semantic-router/vela-10-6aa555ba70cc6997d6d67798
- Modelo comparable Vela-1.0-Encoder-307M-Embedding: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Embedding
- Modelo comparable multi-modal-embed-small: https://huggingface.co/llm-semantic-router/multi-modal-embed-small
- Modelo comparable multi-modal-embed-large: https://huggingface.co/llm-semantic-router/multi-modal-embed-large
- Repositorio GitHub del proyecto: https://github.com/vllm-project/semantic-router
- Documentacion: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Slack del proyecto: https://vllm-dev.slack.com/archives/C09CTGF8KCN
- Dataset LibriSpeech: https://www.openslr.org/12/
- Puntuaciones completas y protocolo de evaluacion: `scores.json` (dentro del repositorio del modelo)
- Atribucion y licencias de componentes: `NOTICE` y `LICENSE` (dentro del repositorio del modelo)
