# AutomatosX/AX-Nemotron-3-Embed-8B-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-Nemotron-3-Embed-8B-CUDA-AXQ-NVFP4-W4A4 es un checkpoint de embeddings de recuperacion (retrieval) publicado por AutomatosX, cuantizado a precision NVFP4 W4A4 mediante el pipeline propio AXQuant. Parte del modelo base nvidia/Nemotron-3-Embed-8B-BF16 y conserva su funcion original: generar representaciones vectoriales de consultas y pasajes para busqueda semantica y sistemas RAG. Se distribuye como development preview, sin certificacion de calidad ni de rendimiento.

El modelo tiene 7.952.683.008 parametros (aproximadamente 7,95 mil millones) y una dimension de embedding de 4096, con atencion bidireccional de tipo encoder-only y pooling por media seguido de normalizacion L2. La cuantizacion afecta a 238 matrices elegibles (atencion y MLP) en formato E2M1 FP4 con escalas por cada 16 elementos en E4M3FN y escalas globales en FP32; embeddings y capas de normalizacion se mantienen en BF16. El repositorio ocupa 5,3 GB y los pesos de salida suman 5.245.652.992 bytes.

Su relevancia actual es doble: por un lado, demuestra la viabilidad de ejecutar inferencia nativa FP4 en vLLM sobre hardware Blackwell (RTX 5090 y Jetson Thor) sin recurrir a emulacion ni a kernels Marlin; por otro, es un ejemplo de cuantizacion de modelos de embedding, un caso menos habitual que el de los modelos generativos. Al estar marcado como development preview y con el manifiesto del conversor en `runtime_verified=false` y `quality_certified=false`, debe tratarse como material experimental, no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia Ministral 3), atencion bidireccional con `is_causal=false` |
| Parametros totales | 7.952.683.008 |
| Parametros activos | no aplica (no es MoE; sin tablas MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y entradas E2M1 FP4), escalas por-16 en E4M3FN y escalas globales FP32; embeddings y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (campo `license: other`) |
| Formato de pesos | safetensors (compressed-tensors), libreria vLLM |

## Arquitectura y entrenamiento

Se trata de un modelo de embeddings derivado de nvidia/Nemotron-3-Embed-8B-BF16, cuya arquitectura pertenece a la familia Ministral 3 en configuracion encoder-only. Cada capa de atencion esta verificada como encoder-only (`is_causal=false`), con un total de 34 capas de atencion de este tipo y sin tablas de expertos (no es MoE). El modelo no incorpora tensores n-gram ni cabezas generativas: es un checkpoint de retrieval puro, sin capacidad de generacion de texto ni de prediccion multi-token (MTP). El uso previsto incluye prefijos guardados `query:` y `passage:`, pooling por media y normalizacion L2 sobre vectores de 4096 dimensiones.

No se ha entrenado un modelo nuevo: el proceso es una conversion de cuantizacion. La fuente original es la revision inmutable `d1f2f25730bbd775b99b29185134bc86653bf2d1` de nvidia/Nemotron-3-Embed-8B-BF16, y la conversion emplea el encoder RTN de referencia en NumPy de AXQuant, verificado de forma independiente contra los tensores BF16 conservados. No se uso AWQ. Se cuantizaron 238 matrices y se protegieron 70 tensores (embeddings y normalizaciones quedan en BF16). La ejecucion se ha probado con vLLM 0.25.1, Torch 2.11.0+cu130 y CUDA 13.0, con 136 modulos `CutlassNvFp4LinearKernel` y sin kernels Marlin ni emulacion. El commit de reproduccion revisado es `3e22743a126a2ecf1c673ab6441041ac37407db8`. No se publican datos sobre el dataset de entrenamiento del modelo original, numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto para similitud semantica (pipeline `sentence-similarity`).
- Recuperacion de informacion (retrieval) sobre corpus documentales: codificacion diferenciada de consultas y pasajes mediante los prefijos `query:` y `passage:`.
- Pooling por media con normalizacion L2, apto para busqueda por similitud coseno y para indexacion vectorial.
- Atencion bidireccional encoder-only, adecuada para codificacion completa de secuencia y no para decodificacion autoregresiva.
- Inferencia nativa en FP4 sobre hardware NVIDIA Blackwell, con pesos e inputs en E2M1 FP4.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni otras capacidades multimodales.
- Capacidades multilingues: no disponible (el modelo original no se documenta en la informacion proporcionada).

## Casos de uso

- Motor de busqueda semantica interna: indexar documentacion corporativa con el prefijo `passage:` y consultar con `query:`, usando la similitud coseno entre vectores normalizados de 4096 dimensiones. El checkpoint esta pensado exactamente para este flujo.
- Recuperacion aumentada por generacion (RAG): servir como recuperador de pasajes en un pipeline cuyo generador sea otro modelo; el embedding cuantizado reduce el coste de memoria del componente de recuperacion.
- Deduplicacion y agrupamiento de documentos: calcular similitud entre vectores para detectar contenido duplicado o casi duplicado en repositorios grandes.
- Clasificacion por similitud cero-shot: comparar embeddings de texto contra embeddings de etiquetas predefinidas para tareas de categorizacion sin entrenamiento adicional.
- Despliegue en edge con NVIDIA Jetson Thor: el modelo esta probado en esta plataforma con `--memory-fraction .085`, lo que permite ejecutar recuperacion local en dispositivos embebidos con aceleracion FP4 nativa.
- Recomendacion de contenido por similitud: representar items y consultas en el mismo espacio vectorial para sugerir elementos afines.
- Moderacion o filtrado semantico: comparar entradas contra vectores de referencia de politicas para marcar contenido proximo a categorias definidas.
- Evaluacion de similitud de pares (pipeline `sentence-similarity`): puntuar la cercania entre dos textos, por ejemplo para emparejamiento de preguntas frecuentes o verificacion de parafrasis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MTEB, RTEB, MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar. El autor indica explicitamente que las mediciones incluidas no constituyen un benchmark independiente ni una certificacion de calidad de retrieval, contexto largo, recorte Matryoshka, concurrencia o velocidad.

La unica evaluacion disponible es una comprobacion de desarrollo sobre ocho vectores procedentes de cuatro pares consulta/documento, con corpus disjunto de calibracion:

| GPU | Similitud coseno media vs BF16 | Coseno minimo | Top-1 emparejado |
|---|---|---|---|
| RTX 5090 | 0.983442 | 0.978928 | 4/4 |
| Jetson Thor | 0.983408 | 0.978994 | 4/4 |

Estas cifras miden la fidelidad de la salida cuantizada respecto al modelo BF16 original en una muestra minima, no la calidad absoluta de recuperacion. El ejemplo de reproduccion exige coseno medio >= 0.95 y coseno minimo >= 0.90 sobre ese corpus reducido.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de salida ocupan 5.245.652.992 bytes (aproximadamente 5,25 GB). Con activaciones y overhead, la fraccion de memoria configurada en pruebas es de 0.30 en RTX 5090 y 0.085 en Jetson Thor, lo que situa el consumo practico en el entorno de 9-11 GB.
- GPU recomendadas: NVIDIA RTX 5090 y Jetson Thor son las plataformas validadas. Ambas son de arquitectura Blackwell, necesaria para ejecutar NVFP4 de forma nativa.
- Compatibilidad con GPU de consumo: cabe en GPU de consumo con suficiente memoria (RTX 5090 de 32 GB), pero la ejecucion nativa FP4 requiere soporte Blackwell. En GPU anteriores se rechazan explicitamente los caminos Marlin y de emulacion.
- Opciones de despliegue: vLLM 0.25.1 como runtime validado, con Torch 2.11.0+cu130 y CUDA 13.0. El repositorio incluye un ejemplo de smoke test (`examples/embedding_smoke.py`) que no requiere codigo remoto del modelo ni instalacion de AXQuant. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Configuracion probada: prefill de secuencia completa, modo eager, maximo 512 tokens y una sola secuencia. No se han publicado cifras de latencia ni de throughput; el autor advierte que las advertencias de configuracion de RoPE y los modos eager/JIT o autotune no establecen rendimiento.
- Requisito critico: los indices de recuperacion deben reconstruirse con este checkpoint exacto, ya que los vectores BF16 y los cuantizados no son intercambiables. Prompts, tokenizacion, pooling y normalizacion deben coincidir entre consultas y documentos indexados.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo de origen, ya que no se aportan datos de alternativas.

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Nemotron-3-Embed-8B-CUDA-AXQ-NVFP4-W4A4 | 7.952.683.008 | no disponible | NVFP4 W4A4, embeddings y normas en BF16 | openmdw-1.1 | HuggingFace, development preview, 20 descargas |
| nvidia/Nemotron-3-Embed-8B-BF16 | no disponible de forma explicita (mismo modelo base) | no disponible | BF16 | no disponible (retenida en el derivado) | HuggingFace (revision d1f2f257...) |
| Otras alternativas de embedding de ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

El derivado cuantizado mantiene la arquitectura, la dimension de embedding y el esquema de pooling del original BF16, y solo se diferencia en el formato numerico de las matrices de atencion y MLP.

## Limitaciones y advertencias

- Es un development preview: el manifiesto del conversor declara `runtime_verified=false` y `quality_certified=false`, y el autor no reclama certificacion de calidad, exactitud MTP, velocidad ni ningun otro aval.
- La sensibilidad de los pesos a la cuantizacion permanece explicitamente sin medir.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Solo genera embeddings.
- Los vectores BF16 y los cuantizados no son intercambiables; hay que reconstruir los indices y mantener coherencia estricta de prompts, tokenizacion, pooling y normalizacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de recuperar pasajes irrelevantes si la calidad del embedding se degrada fuera del dominio de calibracion.
- La validacion publicada se limita a ocho vectores de cuatro pares sobre un corpus de desarrollo; no cubre contexto largo, recorte Matryoshka, concurrencia, velocidad ni documentos reales del usuario.
- Idiomas soportados y longitud de contexto: no disponibles en la informacion proporcionada.
- Restricciones de licencia: la licencia es openmdw-1.1 (`license: other`), con enlace a openmdw.ai. Debe revisarse el texto completo antes de un uso comercial; en este documento no se confirma si permite uso comercial.
- Sesgos conocidos: no disponible (no se documenta analisis de sesgos).
- El soporte nativo depende de hardware Blackwell y de vLLM 0.25.1; se rechazan los caminos Marlin y de emulacion, lo que reduce la portabilidad a GPU anteriores.
- No se documentan opciones de despliegue alternativas (llama.cpp, Ollama, TGI) ni formatos GGUF.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-8B-CUDA-AXQ-NVFP4-W4A4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16
- Revision inmutable del modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16/tree/d1f2f25730bbd775b99b29185134bc86653bf2d1
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Documentacion de vLLM: https://docs.vllm.ai/
- No se han encontrado otros enlaces relevantes (papers, blogs o repos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
