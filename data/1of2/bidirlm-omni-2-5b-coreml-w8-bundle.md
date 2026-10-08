# 1of2/bidirlm-omni-2.5b-coreml-w8-bundle

## Resumen

BidirLM Omni 2.5B Core ML W8 es una conversion a Core ML del modelo de embeddings omnimodal BidirLM-Omni-2.5B-Embedding, publicada por el usuario 1of2. No es un modelo generativo: es un encoder bidireccional que convierte texto, imagenes y audio (o mensajes mixtos con varios tipos de contenido) en un unico tipo de vector de 2.048 dimensiones, normalizado L2 mediante masked mean pooling. El modelo base lo desarrolla BidirLM (vinculado a Diabolocom) y esta disenado para tareas de representacion y recuperacion de informacion, no para generar texto.

El paquete incluye programas Core ML compilados para tres familias (lenguaje, vision y audio), con soporte para el Neural Engine del Mac y para su GPU, ambos sobre un mismo juego de pesos INT8. La ventana de contexto es de 8.192 tokens por mensaje, incluyendo la plantilla de chat y los marcadores de medios expandidos. Las imagenes se procesan entre 65.536 y 1.048.576 pixeles, divididas en parches de 16 pixeles fusionados 2 a 2, lo que genera entre 64 y 1.024 tokens por imagen.

Es relevante porque permite ejecutar localmente, en Apple Silicon y sin CPU, un encoder omnimodal de 2,5B con cuantizacion INT8 (2,8 GB en disco) y vectores compatibles entre los modos Neural Engine y GPU, lo que facilita construir indices unicos de recuperacion multimodal en el propio Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional multimodal tipo transformer (familias de lenguaje, vision y audio) |
| Parametros totales | 2,5B (segun el nombre del modelo base BidirLM-Omni-2.5B-Embedding) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por mensaje (plantilla de chat y medios expandidos incluidos) |
| Tipos de cuantizacion | INT8 por canal en pesos de proyeccion con activaciones FP16 (W8A16); tabla de embeddings de tokens en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (.mlmodelc) mas manifest.json y Resources/ (INT8/FP16) |

## Arquitectura y entrenamiento

El modelo base BidirLM-Omni-2.5B-Embedding es un encoder bidireccional omnimodal que cubre texto, imagen y audio. La model card del paquete Core ML describe un encoder de lenguaje completo, un encoder de vision con front end, patch merger final y dos "DeepStack mergers", y un encoder de audio con front end mel, cabecera, limites de capas y fusiones de resumenes. El proceso de entrenamiento del modelo base se describe en el paper de BidirLM (arXiv 2604.02045), que presenta una familia de cinco encoders bidireccionales que incluye esta variante omnimodal; los detalles concretos de datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La contribucion de esta ficha concreta es la conversion a Core ML: los pesos de proyeccion usan INT8 por canal con activaciones FP16, y la tabla de embeddings de tokens se mantiene en FP16. El paquete ofrece 97 funciones por etapas para el Neural Engine (auditadas y con traza de ejecucion real) y un encoder completo por familia para la GPU, con trabajo matricial en FP16 y flujo residual en FP32. Ambos modos generan vectores en el mismo espacio (identificador `...:w8a16:ane-8k-v1`), de modo que un mismo indice puede mezclar vectores de cualquiera de los modos. No hay prompt de consulta ni de documento: consultas y documentos se codifican de forma identica.

## Capacidades

- Generacion de embeddings de texto con pooling de media enmascarada sobre todos los tokens del mensaje (incluida la plantilla de chat).
- Generacion de embeddings de imagen a partir de entradas de 65.536 a 1.048.576 pixeles (64 a 1.024 tokens por imagen).
- Generacion de embeddings de audio mediante un front end mel y encoder dedicado.
- Embeddings de mensajes mixtos que combinan texto, imagen y audio en un unico vector.
- Vectores de 2.048 dimensiones, normalizados L2, listos para busqueda por similitud coseno o producto interno.
- Codificacion simetrica (sin prompts diferenciados de consulta y documento).
- Ejecucion en Neural Engine y en GPU de Apple Silicon, con vectores compatibles entre ambos modos.
- No dispone de generacion de texto, razonamiento generativo, tool calling, soporte de agentes ni modo de pensamiento: es un modelo de extraccion de caracteristicas.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda semantica multimodal local: indexar documentos de texto, imagenes y clips de audio en un unico espacio de 2.048 dimensiones y recuperar por similitud sin salir del Mac, aprovechando que el modelo es solo encoder y no requiere generacion.
- RAG multimodal sobre Apple Silicon: usar los embeddings como capa de recuperacion para alimentar a un modelo generativo aparte, mezclando en un mismo indice vectores de texto e imagen generados por los modos Neural Engine y GPU.
- Clasificacion y enrutado de tickets de soporte: combinar el audio de una llamada y el texto asociado en un solo embedding para agrupar, priorizar o derivar incidencias por similitud con casos historicos.
- Recuperacion de imagenes por descripcion textual: codificar consultas en lenguaje natural y fotos en el mismo espacio para construir un buscador visual dentro de una aplicacion de escritorio.
- Deduplicacion y agrupamiento de contenido: calcular embeddings de un corpus heterogeneo y aplicar clustering o deteccion de casi duplicados a partir de distancias coseno.
- Buscador de archivos de audio: indexar audio mediante el encoder dedicado y permitir busquedas por contenido o por similitud entre fragmentos, con la ventana de 8.192 tokens para mensajes largos.
- Moderacion y similitud semantica: comparar contenido entrante contra un conjunto de referencia de casos conocidos usando los vectores normalizados.
- Recomendacion de contenido: representar items multimodales como vectores para calcular afinidad con el perfil de cada usuario en un sistema de recomendacion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El paper de BidirLM y la nota de Diabolocom afirman, de forma cualitativa, que BidirLM-Omni-2.5B supera a sus equivalentes omnimodales y que se situa en primera posicion en el benchmark MIEB y en tercera en MAEB, pero no se aportan cifras concretas en la informacion recogida, por lo que no se incluye tabla de resultados.

## Requisitos de hardware

- Plataforma: exclusivamente Mac con Apple Silicon y macOS 15 o superior (programas Core ML multifuncion). Validado en un Apple M4 Max con macOS 27.0.1; otras combinaciones no estan cualificadas.
- No existe modo CPU. La inferencia se ejecuta en el Neural Engine o en la GPU del chip Apple.
- No hay soporte CUDA ni de GPU NVIDIA; no es desplegable en A100, H100 ni RTX.
- Espacio en disco: aproximadamente 2,8 GB para el paquete descargado, mas el espacio de la cache de modelos compilados de Core ML.
- Memoria: no se especifica un requisito de memoria unificado en la informacion proporcionada; el paquete pesa 2,8 GB y el token embedding table se mantiene en FP16.
- Latencia de carga medida en el host de validacion: la primera carga de una funcion de Neural Engine ronda 1 s y una posterior unos 0,14 s; los cuatro encoders de GPU tardan entre 5 y 9 s en su primera carga conjunta y alrededor de 1 s (hasta 4 s) en cargas posteriores.
- Despliegue: Core ML mediante el runtime de referencia en Python (`encoder.py`) u otro host que implemente el contrato de ejecucion. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Throughput de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Modo de ejecucion | Licencia |
|---|---|---|---|---|---|
| 1of2/bidirlm-omni-2.5b-coreml-w8-bundle (este) | 2,5B | 8.192 tokens | Texto, imagen, audio | Neural Engine y GPU (Apple) | Apache 2.0 |
| 1of2/bidirlm-omni-2.5b-coreml-w8 | 2,5B | 8.192 tokens | Texto, imagen, audio | Neural Engine y GPU, un programa por funcion | Apache 2.0 |
| 1of2/bidirlm-omni-2.5b-coreml-w8-ane | 2,5B | 8.192 tokens | Texto, imagen, audio | Solo Neural Engine | Apache 2.0 |
| 1of2/bidirlm-omni-2.5b-coreml-w8-gpu | 2,5B | 8.192 tokens | Texto, imagen, audio | Solo GPU | Apache 2.0 |
| BidirLM/BidirLM-Omni-2.5B-Embedding (origen) | 2,5B | no disponible | Texto, imagen, audio | PyTorch (referencia) | Apache 2.0 |

El bundle se diferencia del resto de variantes Core ML en que agrupa los programas por familia (un programa por familia), lo que reduce el tiempo de carga porque Core ML lee el programa completo de una funcion cada vez que la carga. La comparacion con modelos de embeddings omnimodales de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma autoregresiva y no admite tool calling ni flujos de agentes.
- Solo funciona en Mac con Apple Silicon y macOS 15 o superior; no hay modo CPU ni soporte para hardware NVIDIA o AMD.
- Los idiomas soportados no se especifican en la informacion disponible; conviene validar el idioma objetivo antes de usarlo en produccion.
- El modelo base esta sujeto a los sesgos de sus datos de entrenamiento; la informacion proporcionada no detalla analisis de sesgo.
- Riesgo de representaciones erroneas en dominios poco representados en el entrenamiento del modelo base, que afectaria a la calidad de la recuperacion.
- La entrada superior a 8.192 tokens produce un error, nunca truncamiento; hay que controlar la expansion de medios y de la plantilla de chat para no exceder el limite.
- Los vectores de la revision retirada (r4, 32.768 tokens) del repositorio `bidirlm-omni-2.5b-coreml-w8` no son identicos bit a bit a los de este paquete; no se deben mezclar en un mismo indice.
- Core ML indexa la cache de modelos compilados por la ruta del programa, por lo que mover la descarga obliga a recompilar.
- El Neural Engine es compartido por todos los procesos del Mac y mantiene un numero limitado de programas cargados; conviene cargar las funciones de medios solo cuando se necesiten.
- No se debe habilitar `allowLowPrecisionAccumulationOnGPU`: los encoders de GPU estan cualificados con la acumulacion FP32 por defecto de Core ML.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue depende del modelo base y del autor de la conversion; conviene fijar una revision del Hub en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-bundle
- Modelo base: https://huggingface.co/BidirLM/BidirLM-Omni-2.5B-Embedding
- Variante Neural Engine y GPU (un programa por funcion): https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8
- Variante solo Neural Engine: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-ane
- Variante solo GPU: https://huggingface.co/1of2/bidirlm-omni-2.5b-coreml-w8-gpu
- Paper BidirLM (arXiv): https://arxiv.org/pdf/2604.02045
- Articulo de Diabolocom: https://www.diabolocom.com/research/bidirlm-omni-one-model-that-understands-text-images-and-audio/
- Coleccion BidirLM-Embedding: https://huggingface.co/collections/BidirLM/bidirlm-embedding
- Repositorio GitHub relacionado: https://github.com/Damacol/bidirlm-bidirlm-omni-2-5b-embedding/tree/main
