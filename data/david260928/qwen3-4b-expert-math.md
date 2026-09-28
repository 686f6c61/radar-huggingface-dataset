# David260928/Qwen3-4B-expert-Math

## Resumen

Qwen3-4B-expert-Math es un ajuste fino supervisado (SFT) del modelo denso Qwen/Qwen3-4B-Base, publicado por el usuario David260928 en HuggingFace. Se distribuye como pesos completos en BF16 junto con la configuración y el tokenizador, y suma 4.022.468.096 parámetros (unos 4,02 B) en un repositorio de 8,1 GB. La model card lo describe de forma escueta como "experto en razonamiento matemático" y no aporta información sobre el dataset, el número de tokens de entrenamiento ni evaluaciones.

El interés del modelo es doble. Por un lado, es un ejemplo de especialización por dominio sobre una base pequeña y moderna: al partir de Qwen3-4B-Base hereda una arquitectura transformer decoder-only con atención de consultas agrupadas (GQA) y RoPE, con una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN, lo que permite trabajar con enunciados, desarrollos y documentos técnicos largos en una GPU de consumo. Por otro, su tamaño lo hace desplegable en hardware modesto, algo relevante para investigación en razonamiento matemático sin acceso a clústeres.

Ahora bien, la ficha del autor no incluye ningún resultado de evaluación, ni la composición del dataset, ni detalles del procedimiento de ajuste más allá de "supervised fine-tuned". Con 86 descargas y 0 likes en el momento de la consulta, debe considerarse un artefacto experimental sin validación externa: cualquier uso en producción exige una evaluación propia y una comparación contra el modelo base y contra alternativas matemáticas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B-Base); no es MoE ni SSM |
| Parametros totales | 4.022.468.096 (4,02 B), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos y 131.072 con YaRN |
| Tipos de cuantizacion | Solo se publican pesos BF16; no hay GGUF, AWQ, GPTQ ni FP8 oficiales. La cuantizacion es posible por conversion propia |
| Idiomas soportados | No disponible en la ficha del autor; el modelo base declara soporte multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en BF16, mas ficheros de configuracion y tokenizador (repositorio de 8,1 GB) |
| Modelo base | Qwen/Qwen3-4B-Base (relacion: fine-tune) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso con normalizacion RMSNorm, embeddings rotatorios (RoPE), atencion con consultas agrupadas (GQA) y pesos en BF16. Al ser un fine-tune y no un modelo nuevo, no se han introducido cambios en el numero de capas, la dimensionalidad ni el vocabulario; el tokenizador del repositorio corresponde al de Qwen3-4B-Base. La unica innovacion declarada respecto al modelo base es el ajuste supervisado orientado a matematicas.

El autor no documenta el conjunto de datos, el volumen de tokens, la mezcla de dominios, la longitud de secuencia empleada ni si hubo fases posteriores de DPO, RLHF o RLVR. La model card se limita a indicar que se trata de pesos Qwen3 ajustados de forma supervisada, lo que impide reproducir el entrenamiento o auditar la procedencia de los datos. Tampoco se confirma si se ha conservado la plantilla de chat del modelo base, un detalle critico cuando se parte de una variante "Base" y no de una variante Instruct.

## Capacidades

- Generacion de texto y razonamiento matematico, segun la declaracion del autor; no hay evaluaciones publicadas que lo cuantifiquen.
- Resolucion de problemas en varios pasos y desarrollo de derivaciones, presumiblemente en el estilo aprendido durante el ajuste supervisado.
- Generacion de codigo, incluyendo codigo numerico y de manipulacion simbolica, en la medida en que lo herede del modelo base; no verificado.
- Capacidades generales de lenguaje, conocimiento y conversacion heredadas de Qwen3-4B-Base, potencialmente degradadas por el ajuste especializado.
- Multilingueismo heredado del modelo base; el grado de conservacion tras el ajuste no esta documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible en la informacion proporcionada.
- Modo "thinking" explicito, vision o audio: no disponible; el modelo no declara ninguna de estas capacidades.

## Casos de uso

- Tutoria matematica con contexto largo: la ventana heredada de 32.768 tokens permite adjuntar el enunciado, los apuntes de teoria y varios intentos de resolucion en un mismo prompt, de modo que el modelo corrija el desarrollo paso a paso en lugar de responder a un fragmento aislado.
- Generacion de datos sinteticos para entrenamiento: uso como generador de problemas y soluciones que alimenten el ajuste de modelos mayores, siempre con filtrado posterior mediante un verificador simbolico (SymPy, Lean) para descartar soluciones incorrectas.
- Verificacion de derivaciones en un pipeline de evaluacion: integrado como componente de puntuacion dentro de un sistema de recompensa o de un corrector automatico, comparando la solucion candidata con la de referencia y senalando el paso erroneo.
- Asistente de estudio en local: al ocupar unos 8 GB en BF16 y encajar en una RTX 4090 o incluso en GPUs de 12-16 GB cuantizado, permite desplegar un asistente matematico sin enviar datos de estudiantes a servicios externos.
- Generacion de codigo numerico para cursos y cuadernos: producir funciones en Python con NumPy o SciPy que implementen un metodo descrito en un enunciado, y acompanarlas de pruebas unitarias sencillas.
- Investigacion sobre ajuste por dominio: servir como punto de partida reproducible para estudiar como afecta un SFT matematico a las capacidades generales del modelo base (olvido catastrofico, regresion en tareas de lenguaje).
- Preprocesado de documentacion tecnica: extraccion y reescritura de formulas y pasos intermedios en articulos o informes antes de indexarlos en un sistema de busqueda, aprovechando el contexto largo para procesar secciones completas.
- Prototipado rapido en notebooks: experimentacion con tecnicas de decodificacion, prompts de cadena de pensamiento o autoevaluacion sin necesidad de GPU de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion, ni resultados de MMLU, GSM8K, MATH, AIME, HumanEval ni de ninguna otra suite, y tampoco ofrece comparaciones con el modelo base. Los resultados publicos de Qwen3-4B-Base corresponden a ese modelo y no son extrapolables a este fine-tune sin una evaluacion independiente.

## Requisitos de hardware

- Pesos en BF16 (formato publicado): 4,02 B x 2 bytes = 8,05 GB solo de pesos. Con overhead de runtime y cache de atencion, se recomienda un minimo de 10-12 GB de VRAM para contexto corto.
- Cache KV (estimacion a partir de la configuracion tipica de Qwen3-4B, 36 capas y 8 cabezas KV en FP16): aproximadamente 144 KB por token, es decir unos 4,7 GB adicionales con la ventana completa de 32.768 tokens. Este dato es una estimacion, no una medicion publicada.
- Cuantizaciones orientativas: FP8/INT8 en torno a 4,1-4,5 GB; Q8_0 alrededor de 4,3 GB; Q4_K_M alrededor de 2,5 GB.
- GPU de centro de datos: A100 40 GB, A100 80 GB y H100 80 GB ejecutan el modelo en BF16 con contexto largo sin problemas.
- GPU profesional: L40S 48 GB y A10G/L4 24 GB con cuantizacion INT8 o FP8 para servicio concurrente.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) admiten BF16 con contexto amplio; RTX 4080 y RTX 4070 Ti Super (16 GB) lo admiten en BF16 con contexto moderado; RTX 3060 12 GB y RTX 4060 Ti 16 GB funcionan mejor con cuantizacion; tarjetas de 8 GB solo con Q4 y contexto reducido.
- CPU: viable con llama.cpp, Ollama o LM Studio tras convertir los pesos a GGUF, con velocidades de decodificacion muy dependientes del ancho de banda de memoria.
- Opciones de despliegue: vLLM, SGLang, Hugging Face TGI (el repositorio esta etiquetado como text-generation-inference y endpoints_compatible), transformers, y llama.cpp/Ollama/llamafile mediante conversion a GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tok/s, TTFT ni consumo de VRAM para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Benchmarks publicos | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-4B-expert-Math | 4,02 B | No especificado (base: 32.768, 131.072 con YaRN) | Fine-tune SFT en matematicas | Apache 2.0 | No publicados | Pesos BF16 en HuggingFace, 86 descargas |
| Qwen/Qwen3-4B-Base | 4,02 B | 32.768 nativos, 131.072 con YaRN | Modelo base generalista | Apache 2.0 | Documentados por el autor del base | Ampliamente distribuido |
| Qwen/Qwen2.5-Math-7B | ~7 B | 4.096 nativos, ampliable | Especializado en matematicas con mayor inversion de entrenamiento | Apache 2.0 (segun publicacion del modelo) | Documentados por el autor | Modelo consolidado con comunidad amplia |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 131.072 | Destilado de razonamiento | MIT (segun publicacion del modelo) | Documentados por el autor | Muy extendido en entornos locales |

La comparacion de rendimiento no puede establecerse: no hay ninguna cifra publicada de Qwen3-4B-expert-Math, por lo que la unica conclusion defendible es que la especializacion matematica es una declaracion del autor y no un resultado medido. En la practica, la eleccion entre este modelo y un Qwen2.5-Math o un destilado de razonamiento deberia decidirse con una evaluacion propia sobre el dominio objetivo.

## Limitaciones y advertencias

- Documentacion minima: la model card ocupa cinco lineas y no detalla dataset, hiperparametros, numero de tokens, epocas ni criterios de seleccion de checkpoints.
- Sin evaluaciones: no hay ningun benchmark que respalde la etiqueta "expert-Math". No debe asumirse una mejora sobre Qwen3-4B-Base sin medirla.
- Origen Base, no Instruct: al derivar de Qwen3-4B-Base, es probable que el modelo no siga formatos de chat ni instrucciones conversacionales si no se ha ajustado con una plantilla especifica. Conviene revisar tokenizer_config.json y probar con prompts de continuacion antes de integrarlo en un pipeline conversacional.
- Ausencia de alineamiento de seguridad documentado: no se menciona red-teaming, filtros ni fases de RLHF. En produccion abierta al usuario final esto implica riesgo de respuestas inapropiadas o no filtradas.
- Riesgo de olvido catastrofico: un SFT intensivo en un solo dominio suele degradar capacidades generales del modelo base (lenguaje, conocimiento factual, codigo no matematico) no cuantificadas aqui.
- Alucinacion matematica: incluso en modelos especializados, los errores aparecen en pasos intermedios plausibles, cambios de signo, unidades o problemas de varios pasos. Se recomienda verificacion externa con herramientas simbolicas antes de usar las salidas como correctas.
- Idioma: no se declara el conjunto de idiomas. La especializacion matematica probablemente se entreno mayoritariamente en ingles; el rendimiento en castellano no esta verificado.
- Contexto: aunque el modelo base soporta 131.072 tokens con YaRN, no hay confirmacion de que este fine-tune conserve ese comportamiento ni de como se comporta la atencion mas alla de la ventana nativa.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero obliga a conservar los ficheros LICENSE y NOTICE del repositorio y a mantener los avisos de atribucion; conviene revisar tambien las condiciones del modelo base.
- Validacion comunitaria nula: 86 descargas y 0 likes, sin issues ni discusiones publicas. Se trata de un artefacto sin contraste externo.
- Actividad del repositorio: creado y actualizado el mismo dia (28-09-2026, con unos 22 minutos de diferencia), sin senales de mantenimiento posterior ni versionado.
- Tamano de descarga: 8,1 GB de repositorio, lo que condiciona el almacenamiento y la distribucion en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/David260928/Qwen3-4B-expert-Math
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Coleccion Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de Qwen en GitHub: https://github.com/QwenLM/Qwen3
- vLLM (servido de alto rendimiento): https://github.com/vllm-project/vllm
- llama.cpp (conversion a GGUF e inferencia en CPU/GPU): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Hugging Face Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Documentacion de Qwen sobre escalado de contexto con YaRN: https://qwen.readthedocs.io/en/latest/
