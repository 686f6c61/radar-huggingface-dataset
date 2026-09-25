# ilsp/Llama-Krikri-8B-Instruct-4bit-mlx

## Resumen

Llama-Krikri-8B-Instruct es un modelo de lenguaje de 8.202 millones de parámetros desarrollado por el ILSP (Institute for Language and Speech Processing, Atenas), orientado a dotar al ecosistema Llama 3.1 de capacidades nativas en griego moderno. Se construye mediante preentrenamiento continuado sobre Llama-3.1-8B con un corpus de 91.000 millones de tokens posteriormente ampliado por sobremuestreo hasta 110.000 millones, y una extensión del vocabulario del tokenizador con tokens griegos. El modelo resultante mantiene el contexto de 128.000 tokens de la base (aproximadamente 80.000 palabras griegas) y añade competencia bilingüe griego-inglés sin sacrificar el rendimiento original.

La variante aquí descrita, `ilsp/Llama-Krikri-8B-Instruct-4bit-mlx`, es la cuantización oficial a 4 bits en formato MLX publicada por el propio autor, pensada para inferencia eficiente en hardware Apple Silicon con memoria unificada. El repositorio ocupa 4,6 GB, lo que permite ejecutar el modelo en equipos de consumo con 8-16 GB de RAM unificada sin recurrir a servicios en la nube. Es relevante ahora porque cubre un nicho poco atendido (LLM de calidad para griego con licencia Llama 3.1, es decir, utilizable comercialmente bajo condiciones) y porque forma parte de la familia de modelos abiertos griegos del ILSP junto a Meltemi-7B.

El modelo se distribuye con licencia Llama 3.1 Community License y etiqueta regional `region:eu`, lo que lo sitúa como una opción soberana para despliegues europeos que requieran procesamiento de griego e inglés con pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), densa, con vocabulario extendido para griego |
| Parametros totales | 8.202.227.712 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (aprox. 80.000 palabras griegas) |
| Tipos de cuantizacion | 4-bit MLX (esta version); GGUF disponible en repositorio oficial aparte |
| Idiomas soportados | Griego (el) e ingles (en) segun metadatos; la model card declara ademas traduccion de documentos entre griego e ingles, frances, aleman, italiano, portugues y espanol |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors en formato MLX cuantizado a 4 bits |
| Tamano del repositorio | 4,6 GB |
| Modelo base | ilsp/Llama-Krikri-8B-Base |
| Libreria | transformers |
| Tarea | text-generation (conversacional) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso heredado de Llama-3.1-8B, con la particularidad de que el tokenizador se ha extendido con tokens griegos específicos para reducir la fragmentacion de texto en ese idioma y mejorar la eficiencia de codificacion. El preentrenamiento continuado utilizo un corpus de 91.000 millones de tokens distribuido en cuatro subcorpus: 56,7 B de griego monollingue (62,3 %), 21,0 B de ingles monollingue (23,1 %), 5,5 B de datos paralelos griego-ingles (6,0 %) y 7,8 B de matematicas y codigo (8,6 %). El ingles y los datos paralelos se incluyeron explícitamente para mitigar el olvido catastrofico y preservar la competencia bilingüe de la base. Mediante sobremuestreo de subconjuntos seleccionados, el corpus efectivo ascendio a 110.000 millones de tokens, con procesado, filtrado y deduplicacion previos.

El post-entrenamiento sigue un esquema en tres etapas. Primero, un ajuste supervisado (SFT) en dos fases: la fase 1 con 856.946 pares instruccion-respuesta (371.379 en griego y 485.567 en ingles) y la fase 2 con 638.408 pares (279.948 griegos y 358.460 ingleses), incluyendo conversaciones multi-turno. Despues, una alineacion mediante DPO con normalizacion por longitud sobre 92.394 tripletas de preferencia (47.132 griegas y 45.262 inglesas) con formato instruccion-respuesta elegida-respuesta rechazada. La construccion de datos combino la agregacion de conjuntos publicos (Tulu 3, SmolTalk, MAGPIE Ultra, Orca Agent Instruct, IFEval Like Data, UltraFeedback, NVIDIA HelpSteer2, Intel Orca, UltraMedical), traduccion automatica interna al griego, regeneracion de respuestas traducidas para generar tripletas de preferencia, destilacion con metodologia MAGPIE desde Gemma 2 27B IT, puntuacion con el reward model Skywork-Reward-Gemma-2-27B-v0.2 y filtros basados en reglas. Los corpus paralelos para tareas de traduccion proceden principalmente de ELRC-SHARE.

La innovacion principal no es arquitectonica sino de adaptacion lingüística: extension de vocabulario y preentrenamiento continuado masivo en griego con preservacion deliberada del ingles, algo poco frecuente en modelos de este tamano.

## Capacidades

- Generacion de texto y conversacion multi-turno en griego e ingles con seguimiento de instrucciones mejorado.
- Traduccion de documentos entre griego e ingles, frances, aleman, italiano, portugues y espanol en ambos sentidos (segun la model card; los metadatos oficiales solo declaran el y en).
- Tareas de generacion, comprension y edicion de texto: resumen, creacion de contenido creativo, modificacion de texto, reconocimiento de entidades y analisis de sentimiento.
- Especializacion de dominio declarada para aplicaciones legales, financieras, medicas y cientificas.
- Generacion de codigo y capacidades agenticas mejoradas, con formateo correcto y uso de herramientas (tool use).
- Extraccion estructurada y conversion de formato en escenarios data-to-text y text-to-data (por ejemplo XML, JSON).
- Razonamiento analitico y cadena de pensamiento (Chain-of-Thought) para resolucion de problemas.
- Recuperacion aumentada (RAG) sobre multiples documentos gracias a la ventana de 128.000 tokens.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito separado.

## Casos de uso

- Atencion al cliente en griego: despliegue de un asistente conversacional multi-turno que mantiene contexto de hasta 128.000 tokens, suficiente para arrastrar el historial completo de una incidencia larga o el catalogo de productos relevante sin truncar.
- Traduccion profesional griego-ingles e ingles-griego: el modelo se entreno con corpus paralelos de ELRC-SHARE y soporta traduccion a nivel de frase y de documento, lo que permite integrarlo en flujos de localizacion editorial o administrativa.
- Procesamiento de documentacion legal griega: con contexto largo y especializacion declarada en dominio legal, puede resumir contratos, extraer clausulas y responder consultas sobre expedientes completos sin fragmentacion.
- RAG sobre bases documentales publicas: indexacion de corpus como EUR-LEX o Wikipedia griega y generacion de respuestas fundamentadas, aprovechando la ventana extendida para inyectar muchos fragmentos recuperados.
- Extraccion estructurada de datos: conversion de informes o correos en griego a JSON o XML para alimentar pipelines de datos, gracias a las capacidades de text-to-data y al entrenamiento en formateo correcto.
- Asistentes de codigo en equipos grecoparlantes: generacion y explicacion de codigo con instrucciones en griego, util para documentacion tecnica interna o formacion de desarrolladores junior.
- Analisis de opinion y moderacion de contenido: clasificacion de sentimiento y deteccion de entidades en resenas o redes sociales en griego, tarea cubierta explicitamente en el entrenamiento.
- Agentes con tool calling: integracion en flujos automatizados que requieran llamadas a funciones o APIs, con formato de salida estructurado y razonamiento multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `ilsp/Llama-Krikri-8B-Instruct` no incluye tablas de MMLU, GSM8K, HumanEval ni metricas equivalentes, y los resultados de la busqueda web no aportan datos de evaluacion del modelo (el contenido recuperado es irrelevante respecto a la consulta). Se referencian dos articulos en arXiv (`2502.01534` y `2505.13772`) que probablemente contienen la evaluacion, pero sus cifras no forman parte de la informacion proporcionada y no se reproducen aqui.

## Requisitos de hardware

- Esta variante concreta (4-bit MLX) ocupa 4,6 GB en disco y en memoria, por lo que cabe en equipos Apple Silicon con 8 GB de memoria unificada, aunque 16 GB ofrecen mayor margen para contexto largo.
- Para la ventana completa de 128.000 tokens, la cache KV crece de forma notable: en un modelo de 8B con 32 capas y atencion completa, se recomienda un minimo de 16 GB y preferiblemente 24-32 GB de memoria unificada para contextos extensos.
- Ejecucion en GPU NVIDIA/AMD requiere convertir a otro formato, ya que MLX es especifico de Apple Silicon; la ruta natural es usar el repositorio GGUF oficial con llama.cpp u Ollama.
- VRAM estimada si se sirve en bf16 sin cuantizar: aproximadamente 16,5 GB solo para pesos, mas cache KV, lo que exige una A100 40 GB, H100 o una RTX 4090 de 24 GB para contextos moderados.
- GPU recomendadas para versiones no cuantizadas o semiprecisas en produccion: NVIDIA A100, H100, L40S o RTX 4090; en consumer, RTX 3090/4090 de 24 GB.
- Opciones de despliegue: MLX/MLX-LM en macOS, llama.cpp y Ollama con el GGUF oficial, vLLM o TGI con la version completa en safetensors (la etiqueta `text-generation-inference` y `endpoints_compatible` indica compatibilidad declarada con TGI y endpoints gestionados).
- No se dispone de datos de latencia ni throughput medidos para este modelo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Krikri-8B-Instruct | 8,20 B | 128.000 tokens | Griego e ingles (traduccion declarada a 6 idiomas mas) | Llama 3.1 Community License | Pesos abiertos en HF, versiones GGUF y MLX oficiales |
| Llama-3.1-8B-Instruct | ~8,03 B | 128.000 tokens | Multilingue (8 idiomas oficiales, sin griego especializado) | Llama 3.1 Community License | Pesos abiertos en HF y en multiples cuantizaciones |
| Meltemi-7B-v1 (ILSP) | 7 B | no disponible | Griego e ingles | no disponible | Pesos abiertos en HF |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 tokens | Multilingue (29 idiomas, sin griego nativo) | Apache 2.0 | Pesos abiertos en HF |

La comparacion con Llama-3.1-8B-Instruct es la mas directa por herencia: Krikri anade vocabulario griego y preentrenamiento continuado masivo en ese idioma, manteniendo tamano y contexto practicamente identicos. Frente a Qwen2.5-7B-Instruct, la ventaja de Krikri es la especializacion en griego, mientras que Qwen ofrece una licencia mas permisiva (Apache 2.0) y mayor cobertura multilingue general. Meltemi-7B-v1 es el predecesor de la misma familia y sigue la estela de modelos griegos del ILSP. No se dispone de comparativas de rendimiento cuantitativas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo hereda los sesgos de Llama-3.1-8B y de los corpus de preentrenamiento y ajuste, que incluyen datos traducidos automaticamente al griego; pueden aparecer sesgos de genero, nacionalidad o registro linguistico no auditados publicamente.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de veracidad ni tasas de hallucination para esta version.
- Aunque la model card menciona capacidades de traduccion a frances, aleman, italiano, portugues y espanol, los metadatos oficiales del repositorio solo declaran griego e ingles; conviene validar la calidad en esos idiomas antes de usarlos en produccion.
- El entrenamiento esta fuertemente sesgado hacia griego (62,3 % del corpus), por lo que el rendimiento en otros idiomas sera inferior al de Llama-3.1-8B original.
- La licencia Llama 3.1 Community License no es una licencia de codigo abierto plena: impone condiciones de uso, restricciones para empresas con mas de 700 millones de usuarios mensuales y obligaciones de atribucion y nomenclatura. Es imprescindible revisarla antes de un uso comercial.
- Esta variante concreta es una cuantizacion a 4 bits, con la perdida de precision asociada; para tareas que requieran maxima fidelidad (matematicas, codigo complejo) conviene evaluar la version sin cuantizar.
- El formato MLX limita el despliegue a hardware Apple Silicon; en servidores x86 con GPU hay que usar el GGUF oficial u otra conversion.
- El autor advierte explicitamente de que las cuantizaciones de terceros pueden no corresponder a las ultimas versiones de los pesos, ya que estos se resubieron.
- No se documentan politicas de seguridad, filtros de contenido ni evaluaciones de red teaming en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-4bit-mlx
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Base
- Version GGUF oficial: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-GGUF
- Version MLX oficial: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-4bit-mlx
- Modelo sin cuantizar (referencia de la model card): https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct
- Predecesor de la familia: https://huggingface.co/ilsp/Meltemi-7B-v1
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Articulo arXiv 2502.01534: https://arxiv.org/abs/2502.01534
- Articulo arXiv 2505.13772: https://arxiv.org/abs/2505.13772
- Corpus paralelos ELRC-SHARE: https://elrc-share.eu/
- Dataset Tulu 3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset MAGPIE Ultra: https://huggingface.co/datasets/argilla/magpie-ultra-v1.0
- Dataset Orca Agent Instruct: https://huggingface.co/datasets/microsoft/orca-agentinstruct-1M-v1
- Dataset IFEval Like Data: https://huggingface.co/datasets/argilla/ifeval-like-data
- Dataset UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset NVIDIA HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset Intel Orca: https://huggingface.co/datasets/argilla/distilabel-intel-orca-dpo-pairs
- Dataset UltraMedical: https://huggingface.co/datasets/TsinghuaC3I/UltraMedical-Preference
- Reward model Skywork: https://huggingface.co/Skywork/Skywork-Reward-Gemma-2-27B-v0.2
- Modelo de destilacion Gemma 2 27B IT: https://huggingface.co/google/gemma-2-27b-it
