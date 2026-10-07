# AutomatosX/AX-Qwen3-Embedding-8B-CUDA-AXQ-NVFP4-W4A4

## Resumen

AX-Qwen3-Embedding-8B-CUDA-AXQ-NVFP4-W4A4 es un checkpoint de embeddings para recuperación (retrieval), publicado por AutomatosX como cuantización del modelo Qwen/Qwen3-Embedding-8B de Alibaba. No es un modelo generativo: es un encoder de frases que produce un vector de dimensión completa 4096 por secuencia, con pooling de último token, instrucción de consulta predefinida y normalización L2. El paquete se distribuye en formato NVFP4 W4A4 (pesos y activaciones en FP4 E2M1) con escalas por bloque de 16 en E4M3FN y escalas globales en FP32, empaquetado con compressed-tensors y pensado para ejecutarse en vLLM sobre CUDA.

Su relevancia es acotada pero clara: permite servir un encoder de 7.567.295.488 parámetros ocupando unos 8,19 GB de pesos, en lugar del espacio que exigiría el BF16 original, manteniendo según el autor una similitud coseno media de 0,986226 respecto a BF16 en un corpus de desarrollo minúsculo. La propia model card lo etiqueta como "development preview" y declara explícitamente que el manifiesto del conversor permanece con runtime_verified=false y quality_certified=false, por lo que no debe tratarse como una versión certificada ni como un resultado publicado de MTEB/RTEB.

La atención y los dos primeros y dos últimos bloques MLP mantienen BF16, mientras que el resto de matrices MLP usan NVFP4 W4A4: 96 matrices cuantizadas y 302 tensores protegidos. El repositorio tiene 8,2 GB, licencia Apache 2.0 y se ha probado únicamente en vLLM 0.25.1 con Torch 2.11.0+cu130 y CUDA 13.0 sobre RTX 5090 y Jetson Thor, con emulación y Marlin rechazados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (encoder de embeddings derivado de Qwen3-Embedding-8B); 36 capas de atención decoder segun el runtime audit |
| Parametros totales | 7.567.295.488 |
| Parametros activos | No aplica (no es MoE; no hay tablas MoE en el checkpoint) |
| Longitud de contexto | No disponible en la informacion proporcionada (probado con prefill de secuencia completa, maximo 512 tokens y una sola secuencia) |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones E2M1, escalas por 16 en E4M3FN, escalas globales FP32); atencion y primeros/ultimos dos bloques MLP en BF16; no se incluyen variantes GGUF ni AWQ |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (96 matrices cuantizadas, 302 tensores protegidos; 8.188.897.592 bytes de pesos) |

Otros datos: dimension de embedding completa 4096; libreria declarada vllm; pipeline sentence-similarity; revision fuente inmutable 1d8ad4ca9b3dd8059ad90a75d4983776a23d44af; commit de reproduccion revisado 3e22743a126a2ecf1c673ab6441041ac37407db8; 24 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El checkpoint no se ha entrenado desde cero: es una conversion del Qwen/Qwen3-Embedding-8B en BF16 mediante el encoder RTN de referencia en NumPy de AXQuant, sin AWQ, verificado de forma independiente contra los tensores BF16 de origen. No hay por tanto datos de entrenamiento propios, ni numero de tokens, ni composicion de dataset, ni fases de RLHF/DPO atribuibles a este repositorio; toda la informacion disponible describe el proceso de cuantizacion y verificacion, no el preentrenamiento. Los pesos cuantizados usan FP4 nativo E2M1 tanto en pesos como en entradas, con escalas por cada 16 elementos en E4M3FN y escalas globales en FP32.

La innovacion tecnica reseñable es la politica de precision mixta: todas las proyecciones de atencion y los dos primeros y dos ultimos bloques MLP conservan BF16, mientras que las matrices MLP restantes pasan a NVFP4 W4A4. El pipeline de embeddings preserva la instruccion de consulta guardada, aplica pooling de ultimo token, inserta exactamente un token <|endoftext|> (151643) y aplica normalizacion L2, sin anexar el token de chat <|im_end|> (151645). El runtime audit del 6 de octubre de 2026 indica que no fue necesaria correccion del contenedor de cuantizacion, que la familia no tiene tensores n-gram y que este paquete CUDA queda fuera del alcance de exportacion MLX/oMLX/MTPLX. No hay ninguna afirmacion de MTP ni generativa.

## Capacidades

- Generacion de embeddings de frases y documentos con dimension completa de 4096, orientados a similitud semantica y recuperacion (retrieval).
- Busqueda semantica y recuperacion densa: el checkpoint está diseñado explicitamente como embedding de retrieval.
- Uso como encoder de consultas con instruccion predefinida guardada y pooling de ultimo token.
- Normalizacion L2 integrada, lo que permite usar similitud coseno o producto escalar de forma directa.
- Ejecucion nativa FP4 en vLLM con kernels CutlassNvFp4LinearKernel (64 modulos) sobre CUDA 13.0.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo de embeddings, no un modelo de chat.
- No hay capacidades de vision ni audio declaradas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No hay afirmacion de soporte Matryoshka (slicing de dimensiones) ni de exactitud MTP.

## Casos de uso

- Busqueda semantica interna sobre documentacion tecnica: indexar el corpus con este checkpoint y recuperar fragmentos por similitud coseno sobre vectores de 4096 dimensiones, aprovechando que los pesos ocupan unos 8,19 GB en lugar del BF16 equivalente.
- RAG (generacion aumentada por recuperacion) en produccion: usar el modelo como recuperador denso delante de un LLM generativo, siempre que se reconstruya el indice completo con este checkpoint concreto, ya que los vectores BF16 y cuantizados no son intercambiables.
- Deduplicacion y agrupacion de documentos: calcular embeddings de un corpus y aplicar clustering o umbrales de similitud coseno para detectar duplicados casi identicos.
- Moderacion o clasificacion por similitud: comparar embeddings de entradas de usuario contra prototipos de referencia (por ejemplo, plantillas de abuso o de consultas fuera de alcance) mediante umbral de coseno.
- Sistemas de recomendacion por contenido: representar items y consultas en el mismo espacio de 4096 dimensiones y ordenar por cercania semantica.
- Recuperacion en despliegues de borde: el autor documenta ejecucion en Jetson Thor con `--memory-fraction .12`, lo que abre la puerta a inferencia de embeddings en dispositivos embebidos con soporte FP4 nativo.
- Evaluacion comparativa de cuantizacion: servir como punto de partida para medir la degradacion real de un pipeline de retrieval propio frente al BF16 original antes de decidir un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB, RTEB u otros) en la informacion disponible. El autor lo indica de forma explicita: la comprobacion incluida no es un benchmark independiente de calidad de retrieval, ni cubre contexto largo, ni slicing Matryoshka, ni concurrencia, ni velocidad. Lo unico medible disponible es esta verificacion de desarrollo sobre ocho vectores procedentes de cuatro pares consulta/documento simples, de un corpus disjunto de calibracion:

| Plataforma | Coseno medio vs BF16 | Coseno minimo | Top-1 emparejado |
|---|---|---|---|
| RTX 5090 | 0.986226 | 0.982638 | 4/4 |
| Jetson Thor | 0.986426 | 0.983609 | 4/4 |

Umbrales exigidos por el script de comprobacion: coseno medio >= 0,95 y coseno minimo >= 0,90. El manifiesto del conversor mantiene runtime_verified=false y quality_certified=false, y la sensibilidad de los pesos queda explicitamente sin medir. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: los pesos suman 8.188.897.592 bytes (unos 8,19 GB), por lo que se necesita al menos ese espacio mas activaciones, cache y overhead del runtime; no se publica una cifra oficial de VRAM total.
- GPU validadas por el autor: RTX 5090 (con `--memory-fraction .45`) y Jetson Thor (con `--memory-fraction .12`).
- Requisito de precision: se exige FP4 nativo; la model card indica que Marlin y la emulacion se rechazan y que el ejemplo de runtime usa `--require-native-fp4`. Por tanto, GPUs sin soporte NVFP4 nativo no estan contempladas en las pruebas publicadas.
- Cabe en GPU de consumo: si, en las plataformas probadas (RTX 5090 y Jetson Thor); no hay confirmacion para otras GPU de consumo.
- Opciones de despliegue: vLLM 0.25.1 con Torch 2.11.0+cu130 y CUDA 13.0. No se mencionan llama.cpp, Ollama, TGI ni otros runtimes, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. Las pruebas se hicieron en modo eager, con prefill de secuencia completa, maximo 512 tokens y una sola secuencia; el autor advierte que las advertencias de eager/JIT, autotune y configuracion RoPE upstream no establecen rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-8B-CUDA-AXQ-NVFP4-W4A4 | 7.567.295.488 | No disponible | NVFP4 W4A4 con atencion y bloques MLP extremos en BF16 | Apache 2.0 | HuggingFace, preview de desarrollo |
| Qwen/Qwen3-Embedding-8B (modelo base) | No disponible en la informacion proporcionada | No disponible | BF16 | Apache 2.0 | HuggingFace (revision 1d8ad4ca9b3dd8059ad90a75d4983776a23d44af) |
| Otros modelos de embeddings comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su modelo base ni alternativas de embeddings; los resultados obtenidos correspondian a contenido sin relacion (guias y foros de videojuegos), por lo que no se han usado como fuente.

## Limitaciones y advertencias

- Es una "development preview": el manifiesto del conversor mantiene runtime_verified=false y quality_certified=false, y el autor senala que las comprobaciones de desarrollo no constituyen una certificacion.
- La sensibilidad de los pesos a la cuantizacion queda explicitamente sin medir.
- Los vectores BF16 y cuantizados no son intercambiables: hay que reconstruir los indices de retrieval con este checkpoint exacto.
- Prompts, tokenizacion, pooling y normalizacion deben coincidir entre la indexacion de documentos y la codificacion de consultas; en concreto, un unico <|endoftext|> (151643) y nada de <|im_end|> (151645).
- La evidencia de calidad se limita a 8 vectores de 4 pares consulta/documento, de un corpus tambien usado en la seleccion de candidatos: no es una prueba de calidad amplia de retrieval.
- No hay datos publicados de contexto largo, slicing Matryoshka, concurrencia, velocidad, latencia o throughput.
- No hay informacion sobre idiomas soportados ni sobre sesgos; al ser un derivado de Qwen3-Embedding-8B, los sesgos del modelo base no se han auditado en este repositorio.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es recuperar documentos irrelevantes y que un sistema RAG posterior los use sin verificacion.
- Restricciones de licencia: Apache 2.0, con licencia y avisos originales retenidos; permite uso comercial segun los terminos de dicha licencia, pero se deben conservar los avisos.
- Requisitos de ejecucion estrictos: vLLM 0.25.1, Torch 2.11.0+cu130, CUDA 13.0 y FP4 nativo, con Marlin y emulacion rechazados.
- La revision probada y el commit de reproduccion estan fijados; cualquier reexportacion posterior queda ligada a su propia evidencia.
- Los ficheros de ejemplo de evaluacion (RTX 5090 y Thor) deben permanecer juntos para poder reproducir la comprobacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-8B-CUDA-AXQ-NVFP4-W4A4
- Modelo base Qwen/Qwen3-Embedding-8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Revision fuente inmutable del modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B/tree/1d8ad4ca9b3dd8059ad90a75d4983776a23d44af
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
