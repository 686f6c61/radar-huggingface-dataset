# smdesai/LFM2.5-ColBERT-350M

## Resumen

LFM2.5-ColBERT-350M (Core ML) es una conversion del modelo LiquidAI/LFM2.5-ColBERT-350M, un recuperador multilingue de interaccion tardia (late interaction) tipo ColBERT. No es un modelo generativo: produce un vector de 128 dimensiones normalizado en L2 por cada token de entrada y puntua la relevancia consulta-documento mediante MaxSim, es decir, la suma sobre los tokens de la consulta del maximo producto escalar contra los tokens del documento. Este repositorio, publicado por el usuario smdesai, contiene unicamente los artefactos `.mlmodelc` compilados para ejecutarse en el Apple Neural Engine, la GPU o la CPU de iPhone, iPad y Mac, sin Python ni PyTorch en tiempo de inferencia.

El modelo base tiene aproximadamente 353 millones de parametros y emplea una arquitectura hibrida de 17 capas: 10 capas convolucionales cortas, 6 capas de atencion con GQA y una capa densa final que proyecta de 1024 a 128 dimensiones. La longitud de secuencia esta fijada en 32 tokens para la consulta y 512 para el documento, de modo que el encoder se ha dividido en dos paquetes Core ML independientes con formas estaticas, tal como prefiere el Neural Engine. La conversion usa cuantizacion paletizada de 6 bits con k-means agrupado y mantiene las embeddings en fp16.

Su relevancia actual es practica: permite construir recuperacion semantica multilingue (11 idiomas) completamente en el dispositivo, con los documentos sin salir del terminal, algo que encaja con aplicaciones de busqueda local, asistentes con RAG offline y despliegues con requisitos estrictos de privacidad. El autor reporta coincidencia exacta en el ranking MaxSim respecto a la referencia en PyTorch fp32, con una similitud coseno minima por token de 0,9983 (consulta) y 0,9973 (documento) en la version de 6 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido bidireccional (10 capas convolucionales cortas + 6 capas de atencion GQA + 1 capa densa), con cabecera ColBERT de interaccion tardia |
| Parametros totales | ~353 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Consulta: 32 tokens. Documento: 512 tokens (formas estaticas separadas) |
| Tipos de cuantizacion | Paletizada de 6 bits (LUT agrupada, k-means, `per_grouped_channel`, `group_size=16`); embeddings en fp16. La conversion tambien dispone de variante fp16 segun la tabla de precision del autor |
| Idiomas soportados | 11: ingles, espanol, aleman, frances, italiano, portugues, arabe, sueco, noruego, japones, coreano |
| Licencia | LFM Open License v1.0 (`lfm1.0`), heredada del modelo base |
| Formato de pesos | `.mlmodelc` compilado (Core ML / MLProgram), no safetensors ni GGUF |
| Modelo base | LiquidAI/LFM2.5-ColBERT-350M (relacion: quantized) |
| Dimension de embedding | 128 por token, normalizada en L2 |
| Dimensión oculta del backbone | 1024 |
| Entradas del grafo | `input_ids (1, seq) int32`, `attention_mask (1, seq) int32` |
| Salida del grafo | `token_embeddings (1, seq, 128)` |
| Ficheros del repositorio | `LFM25-ColBERT-query-6bit.mlmodelc` (32 tokens, 350 MB) y `LFM25-ColBERT-doc-6bit.mlmodelc` (512 tokens, 350 MB) |
| Tamano del repositorio | 1,4 GB |
| Unidad de computo | Apple Neural Engine, GPU o CPU (Core ML) |
| Objetivo minimo de despliegue | iOS 18 (segun las notas de conversion) |

## Arquitectura y entrenamiento

El backbone es LFM2.5-350M-Base en configuracion bidireccional. En lugar de un stack de atencion pura, combina capas convolucionales cortas con capas de atencion con consultas agrupadas (GQA), un patron habitual en los modelos Liquid para reducir coste de inferencia manteniendo capacidad de modelado de secuencia. Sobre la representacion oculta de 1024 dimensiones se anade una proyeccion densa (1024 a 128, sin sesgo) y una normalizacion L2 por token. La puntuacion final se calcula con MaxSim: `suma sobre q de max sobre d de (q · d)`, lo que proporciona mayor precision y mejor generalizacion que un embedding unico por documento a cambio de un indice mucho mayor (512 vectores de 128 dimensiones por documento en lugar de uno solo).

El repositorio de smdesai no entrena ni ajusta nada: es una conversion de los pesos oficiales mediante `coremltools` en formato `mlprogram` a fp16, con compresion posterior mediante paletizacion LUT agrupada por k-means. Los datos de entrenamiento, la composicion del dataset, el numero de tokens vistos y el uso de RLHF o DPO corresponden al modelo base y no se detallan en la informacion proporcionada; la model card remite expresamente a la ficha de LiquidAI/LFM2.5-ColBERT-350M para esa informacion. La innovacion tecnica destacable de esta publicacion es la ingenieria de despliegue: division en dos grafos de forma estatica (32 y 512 tokens), residencia casi total en el Neural Engine (96 % en el modelo de documento con `ComputeUnit.ALL`, aproximadamente 100 % con `CPU_AND_NE`) y un coste de precision minimo respecto a la referencia fp32.

## Capacidades

- Recuperacion semantica multilingue mediante representaciones multi-vector y puntuacion MaxSim.
- Generacion de embeddings a nivel de token (128 dimensiones, normalizadas en L2), adecuadas para indexacion y busqueda sobre grandes colecciones.
- Busqueda cross-lingual dentro de los 11 idiomas soportados, sin necesidad de traduccion previa.
- Reordenacion (reranking) precisa de candidatos recuperados previamente por un retriever denso de un solo vector.
- Ejecucion completa en el dispositivo sobre Apple Neural Engine, GPU o CPU, sin dependencias de Python ni PyTorch.
- Integracion nativa en aplicaciones Swift (Core ML) y en scripts de Python mediante `coremltools` con `CompiledMLModel`.
- Prefijos de tarea integrados en el preprocesado: `"[Q] "` para consultas y `"[D] "` para documentos.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente, vision ni audio. No es un modelo conversacional.

## Casos de uso

- Busqueda semantica local en aplicaciones iOS y macOS: la app indexa documentos del usuario y consulta el encoder de consulta en el Neural Engine, de modo que ni el texto ni las representaciones salen del dispositivo. Es adecuado por el tamano reducido (350 MB por encoder) y por la residencia casi total en ANE.
- RAG completamente offline: se recuperan pasajes con MaxSim y se pasan como contexto a un modelo generativo local, evitando enviar informacion confidencial a servicios en la nube.
- Reranking dentro de un pipeline de recuperacion en dos etapas: un retriever denso barato obtiene los 100 mejores candidatos y LFM2.5-ColBERT los reordena con MaxSim, aprovechando la mayor precision de la interaccion tardia.
- Asistentes personales con privacidad estricta (notas, correo, historial): el encoder de documento indexa 512 tokens por fragmento, lo que permite trocear documentos largos y mantener una busqueda precisa sobre ellos sin conexion.
- Busqueda multilingue en catalogos de producto o bases de conocimiento: una consulta en espanol puede recuperar documentos en japones o arabe dentro de los idiomas soportados, sin infraestructura de traduccion.
- Cumplimiento normativo en entornos regulados (sanidad, legal, banca): el procesamiento en el terminal elimina la transferencia de datos a terceros, un requisito habitual en estos sectores.
- Clasificacion y agrupacion de documentos por similitud: la puntuacion MaxSim entre pares de documentos permite detectar duplicados cercanos o agrupar textos tematicamente, reutilizando el mismo encoder de documento.
- Funciones de busqueda dentro de aplicaciones de nota o correo sin backend: el coste marginal por consulta es el de una inferencia de 32 tokens en el Neural Engine, con lo que se evita mantener un servidor de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, BEIR, MTEB) en la informacion disponible; el modelo no es generativo y la model card solo reporta fidelidad de la conversion frente a la referencia en PyTorch fp32.

| Precision | Coseno minimo (consulta) | Coseno minimo (documento) | Ranking MaxSim |
|---|---|---|---|
| fp16 | 1,0000 | 0,9975 | coincidencia exacta |
| 6 bits (publicada) | 0,9983 | 0,9973 | coincidencia exacta |

Residencia en el Neural Engine declarada por el autor:

| Modelo | `ComputeUnit.ALL` | `CPU_AND_NE` |
|---|---|---|
| Documento (512 tokens) | 96 % ANE | ~100 % ANE |
| Consulta (32 tokens) | Preferencia por GPU segun el planificador | ~99 % ANE |

El autor no publica cifras de latencia ni de throughput y recomienda medirlas con Xcode Instruments en el dispositivo objetivo. No hay datos de evaluacion downstream sobre tareas de recuperacion (por ejemplo, nDCG o recall) ni comparacion con otros retrievers.

## Requisitos de hardware

- Inferencia en dispositivo: los dos ficheros `.mlmodelc` ocupan 350 MB cada uno, aproximadamente 700 MB en disco. La carga de un unico encoder requiere del orden de 350 MB de memoria residente para los pesos, mas las activaciones del grafo.
- Dispositivos recomendados: cualquier iPhone, iPad o Mac con Neural Engine y soporte de iOS 18 o superior. El autor no especifica modelos de chip concretos; en Mac conviene verificar el objetivo de despliegue, ya que solo se declara iOS 18.
- Para fijar el encoder de consulta al Neural Engine es necesario configurar `computeUnits = .cpuAndNeuralEngine`; con la configuracion por defecto el planificador tiende a asignarlo a la GPU.
- No requiere GPU de servidor. No hay version para CUDA.
- Para ejecutar el modelo base en PyTorch fuera de Core ML se necesitarian del orden de 0,7 GB solo en pesos en fp16, mas activaciones; una estimacion prudente de VRAM para lotes moderados estaria en el rango de 2 a 3 GB, aunque este dato no lo proporciona el autor y debe considerarse una estimacion.
- Opciones de despliegue: Core ML en Swift, `coremltools` en Python con `CompiledMLModel`, y Xcode Instruments para perfilado. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smdesai/LFM2.5-ColBERT-350M (Core ML) | ~353 M | 32 (consulta) / 512 (documento) | `.mlmodelc` compilado, 6 bits, ANE/GPU/CPU | LFM Open License v1.0 | Repositorio HuggingFace con 0 descargas y 0 likes |
| LiquidAI/LFM2.5-ColBERT-350M (base) | ~353 M | 32 (consulta) / 512 (documento) | Pesos PyTorch, precision completa | LFM Open License v1.0 | Repositorio oficial de Liquid AI |
| Otros retrievers de interaccion tardia multilingues (por ejemplo, variantes de ColBERTv2 o jina-colbert-v2) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion significativa que puede establecerse con los datos aportados es entre la conversion Core ML y el modelo base: mismos parametros, mismos limites de secuencia y misma licencia, con una perdida de similitud coseno minima (0,9983 / 0,9973) y coincidencia exacta en el orden MaxSim, a cambio de ejecucion sin Python y con aceleracion por Neural Engine. No se dispone de datos de rendimiento de otros retrievers en la informacion proporcionada, por lo que cualquier comparacion cuantitativa adicional seria especulativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Solo genera embeddings para recuperacion.
- El indice es mucho mayor que el de un retriever de vector unico: 512 vectores de 128 dimensiones por documento, lo que multiplica el almacenamiento y el coste de la puntuacion MaxSim.
- Limites estrictos de secuencia: 32 tokens para la consulta y 512 para el documento. Las consultas mas largas se truncan y los documentos largos deben trocearse, con la perdida de contexto que ello implica.
- Las formas estaticas obligan a rellenar la consulta hasta 32 tokens; el autor recomienda conservar los 32 vectores de consulta y descartar las posiciones de relleno del documento (`attention_mask == 0`) antes de puntuar. Omitir este paso degrada los resultados.
- El preprocesado (prefijos `"[Q] "` y `"[D] "`, expansion de la consulta, filtrado de relleno) no esta incluido en el grafo y debe implementarse en la aplicacion anfitriona; es una fuente habitual de errores de integracion.
- El encoder de consulta no se asigna al Neural Engine con la configuracion por defecto; es necesario forzar `cpuAndNeuralEngine` para obtener la residencia declarada.
- El objetivo minimo declarado es iOS 18; no se detalla compatibilidad con versiones anteriores de macOS ni con chips sin Neural Engine.
- Repositorio de terceros, no oficial: 0 descargas y 0 likes en el momento de la consulta, sin proceso de validacion independiente conocido. La fidelidad reportada procede del propio autor.
- Licencia LFM Open License v1.0, distinta de las licencias open source estandar. No se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que conviene revisar el texto completo de la licencia antes de un despliegue en produccion.
- No hay resultados publicados de recuperacion (nDCG, recall, MTEB) ni de sesgos por idioma. El rendimiento real en los 11 idiomas declarados no puede verificarse con los datos aportados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la puntuacion MaxSim no esta calibrada como probabilidad y puede devolver resultados poco relevantes con puntuaciones altas.
- No se han publicado mediciones de latencia, consumo energetico ni throughput; deben medirse en el dispositivo objetivo.
- Los metadatos del repositorio indican fechas de creacion y actualizacion en septiembre de 2026, posteriores a la fecha habitual de consulta, lo que sugiere una posible inconsistencia en los metadatos de la plataforma.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/smdesai/LFM2.5-ColBERT-350M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-ColBERT-350M/blob/main/LICENSE
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2511.23404 (el contenido de este articulo no se ha verificado en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces obtenidos correspondian a paginas de soporte de Microsoft y a un hilo sobre imagenes ISO de Windows 8.1, sin relacion alguna con LFM2.5-ColBERT. No se dispone por tanto de papers, blogs, repositorios o demos adicionales que enlazar.
