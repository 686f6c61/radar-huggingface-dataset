# mradermacher/UniMath-35B-A3B-GGUF

## Resumen

UniMath-35B-A3B es un modelo de lenguaje de gran escala desarrollado por UnipatAI, especializado en matematicas y razonamiento, del que mradermacher publica una coleccion de cuantizaciones GGUF estaticas para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 35.505.251.456 parametros totales, lo que lo situa en la categoria de 35B, y su nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible.

Esta ficha documenta la version cuantizada publicada por mradermacher, que incluye 12 variantes GGUF de tipo estatico (desde Q2_K hasta Q8_0) mas dos suplementos multimodales (mmproj), lo que indica que el modelo base incorpora capacidades de vision. El repositorio ocupa 244,4 GB en total y esta liberado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo en hardware de consumo: la cuantizacion Q4_K_M ocupa 21,8 GB, lo que permite ejecutarlo en GPUs con 24 GB de VRAM como la RTX 4090. La model card enlaza la licencia al repositorio de Qwen3.6-35B-A3B, lo que sugiere que el modelo base podria derivar de la familia Qwen, aunque esta relacion no se confirma de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida de la nomenclatura A3B; no confirmada en la informacion disponible |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de "A3B"); no confirmado |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base UnipatAI/UniMath-35B-A3B. La nomenclatura "35B-A3B" sigue el patron habitual de los modelos de mezcla de expertos, donde el primer numero indica los parametros totales (35B) y el segundo los parametros activos por token (3B). El recuento real de parametros en safetensors (35.505.251.456) es coherente con esta interpretacion. La presencia de archivos mmproj en las cuantizaciones confirma que el modelo incorpora un codificador multimodal para procesamiento de imagenes.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. La model card del repositorio cuantizado no incluye estos detalles, y la del modelo base no se ha proporcionado. El nombre "UniMath" sugiere una especializacion en matematicas, pero no se confirma el alcance de dicho ajuste ni los datos utilizados. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" en el repositorio indica que el modelo esta ajustado para dialogos multi-turno.
- Razonamiento matematico: el nombre del modelo sugiere especializacion en matematicas, aunque no se aportan benchmarks que lo confirmen.
- Procesamiento multimodal: la presencia de archivos mmproj (Q8_0 y f16) indica soporte de entrada de imagenes junto con texto.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integracion con APIs de inferencia tipo OpenAI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia matematica interactiva: el modelo puede resolver problemas paso a paso en conversaciones multi-turno, aprovechando su especializacion declarada en matematicas y su formato conversacional para explicar procedimientos.
- Analisis de documentos tecnicos con imagenes: gracias al codificador multimodal (mmproj), puede procesar capturas de formulas, graficos o diagramas junto con texto explicativo, util en entornos educativos o de ingenieria.
- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (21,8 GB) cabe en una RTX 4090, lo que permite ejecutar el modelo en local sin depender de servicios en la nube, con la consiguiente privacidad de datos.
- Prototipado de asistentes conversacionales: la compatibilidad con endpoints y el formato GGUF facilitan integrarlo en aplicaciones de chat mediante llama.cpp u Ollama, con tiempos de puesta en marcha reducidos.
- Generacion de codigo asistida por razonamiento matematico: el modelo puede emplearse para traducir especificaciones matematicas a implementaciones en lenguajes de programacion, aunque no se confirma un entrenamiento especifico en codigo.
- Investigacion en cuantizacion: el repositorio ofrece 12 variantes de cuantizacion estatica que permiten estudiar el impacto de la compresion en un modelo de 35B, util para trabajos academicos sobre eficiencia de inferencia.
- Procesamiento por lotes en servidores con multiples GPUs: las variantes Q5_K_M y Q6_K (25,4 y 29,3 GB) permiten mayor calidad en entornos con 2x24 GB o 1x48 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K requiere unos 13,3 GB; Q4_K_M unos 21,8 GB; Q6_K unos 29,3 GB; Q8_0 unos 37,9 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M o inferiores; A100 40 GB o H100 80 GB para Q6_K y Q8_0 con contexto amplio.
- Compatibilidad con GPU de consumo: si, la RTX 4090 (24 GB) puede ejecutar Q4_K_M y Q4_K_S; la RTX 3090 (24 GB) tambien. Para Q5_K_M (25,4 GB) se necesita una GPU de 32 GB o repartir entre dos GPUs.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI. No se menciona soporte explicito de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un MoE con aproximadamente 3B parametros activos, se espera un throughput superior al de un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UniMath-35B-A3B (este) | 35,5B totales / ~3B activos | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en matematicas, multimodal |
| Qwen3.6-35B-A3B | 35B / ~3B activos | No disponible | Apache 2.0 (segun enlace de licencia) | safetensors, GGUF | Posible modelo de referencia; la model card enlaza su licencia |
| Modelos densos de 30-35B | ~30-35B | Variable | Variable | Variable | Mayor coste de inferencia al activar todos los parametros |

La comparativa se limita a lo que puede inferirse de la informacion disponible. No se dispone de datos de rendimiento comparativo entre UniMath-35B-A3B y alternativas, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas puede degradar la calidad de forma significativa.
- Sesgos: no se documentan los sesgos del modelo base; al ser un ajuste especializado en matematicas, puede tener un rendimiento inferior en tareas generales de conocimiento.
- Alucinacion: no se aportan evaluaciones de fiabilidad; como todo modelo generativo, existe riesgo de producir razonamientos matematicos incorrectos con apariencia de correccion.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide garantizar su comportamiento en conversaciones o documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza la licencia al repositorio de Qwen3.6-35B-A3B; conviene verificar los terminos del modelo base antes de un despliegue comercial.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M se marcan como de menor calidad en la propia model card; para produccion se recomienda Q4_K_M o superior.
- Ausencia de benchmarks: no hay datos publicados de MMLU, GSM8K, HumanEval ni similares, lo que dificulta evaluar su calidad real frente a alternativas.
- Repositorio cuantizado: esta ficha describe la version de mradermacher, no el modelo original de UnipatAI; para acceso a pesos sin cuantizar debe consultarse el repositorio base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UniMath-35B-A3B-GGUF
- Modelo base: https://huggingface.co/UnipatAI/UniMath-35B-A3B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/UniMath-35B-A3B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#UniMath-35B-A3B-GGUF
- Licencia de referencia (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
