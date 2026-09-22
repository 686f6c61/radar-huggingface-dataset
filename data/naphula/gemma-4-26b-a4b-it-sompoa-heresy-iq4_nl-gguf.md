# Naphula/gemma-4-26B-A4B-it-SOMPOA-heresy-IQ4_NL-GGUF

## Resumen

SOMPOA 26B-A4B es un modelo de lenguaje de tipo mezcla de expertos (MoE) con aproximadamente 25.233 millones de parametros totales y una designacion "A4B" que indica en torno a 4.000 millones de parametros activos por token. La publicacion analizada, a cargo del usuario Naphula, es una cuantizacion en formato GGUF con el esquema IQ4_NL, derivada de un modelo base cuya denominacion comercial apunta a la familia Gemma (el identificador incluye "gemma-4-26B-A4B-it" y el sufijo "SOMPOA-heresy", este ultimo sin definir en la informacion disponible).

El modelo esta orientado a tareas conversacionales y, de forma destacada, a traduccion. Segun la propia model card del autor, esta cuantizacion IQ4_NL conserva la fidelidad del modelo en BF16 (93% de precision declarada) y supera a IQ4_XS en prompts de traduccion, manteniendo un tamano menor que Q4_K_M (13,5 GB frente a 15,6 GB segun el autor; el repositorio ocupa 14,6 GB). El modelo se publica sin descargas ni valoraciones y sin licencia, idiomas ni longitud de contexto declarados.

Es relevante porque ilustra el uso de cuantizaciones de bajo bit (IQ4_NL, aproximadamente 4,5 bits por peso) para desplegar un MoE de ~25 B en hardware de consumo, reduciendo el peso a unos 14-15 GB con una perdida de calidad declarada nula frente a BF16. No obstante, la ausencia de licencia, de ficha tecnica completa y de resultados verificables de forma independiente limita su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con designacion A4B |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B (segun la designacion A4B del nombre; no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF IQ4_NL (esta publicacion). El autor referencia ademas BF16, Q4_K_M, i1-Q4_K_M, i1-Q6_K, Q8_0 e i1-IQ4_XS para el mismo modelo base |
| Idiomas soportados | no disponible (el modelo esta orientado a traduccion y a contenido cultural/folclorico, lo que sugiere soporte multilingue, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un transformer de mezcla de expertos (MoE) con unos 25.233 millones de parametros totales y una designacion A4B que implica aproximadamente 4.000 millones de parametros activos por token. Esta estructura permite un coste de inferencia mas cercano al de un modelo denso de ~4 B que al de un denso de ~25 B, a cambio de un mayor consumo de memoria para almacenar todos los expertos.

No se dispone de detalles sobre el numero de expertos, la estrategia de enrutamiento, la composicion del dataset de entrenamiento, el numero de tokens, ni sobre si hubo fases de RLHF, DPO o ajuste por instrucciones (pese al sufijo "-it"). El sufijo "SOMPOA" y el termino "heresy" del identificador no se explican en la model card, por lo que no es posible determinar si se trata de un merge, un fine-tune o una tecnica de modificacion de pesos concreta. La model card tampoco documenta innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta "conversational", lo que indica ajuste para dialogos multi-turno.
- Traduccion: capacidad central declarada por el autor, evaluada con una bateria de 12 modelos y con enfasis en matices idiomaticos y culturales.
- Razonamiento y conocimiento cultural/folclorico: la model card menciona memoria "folclorica" y puntuaciones de cultural score, aunque sin detallar el metodo de evaluacion.
- Codigo, matematicas y otras capacidades tecnicas: no disponible (no documentadas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: probablemente si, dado el enfoque en traduccion, pero no se enumeran idiomas.
- Modo "thinking", vision o audio: no disponible.
- Contexto largo: no disponible (longitud de contexto sin declarar).

## Casos de uso

- Traduccion automatica de textos con carga idiomatica: el modelo declara un 93% de precision y una tasa de alucinacion del 7% en la prueba del autor, con especial rendimiento en expresiones idiomaticas donde IQ4_XS falla (por ejemplo, el "Item 15" mencionado). Adecuado para localizacion de prosa que requiera naturalidad.
- Traduccion de contenido cultural o folclorico: la model card destaca su comportamiento en referencias culturales, lo que lo hace util para editoriales, medios o proyectos de patrimonio que manejen ese tipo de material.
- Asistentes conversacionales multilingues: al ser un modelo "-it" y con etiqueta conversacional, encaja en chatbots de atencion en varios idiomas, aunque la falta de datos de contexto impide garantizar conversaciones de muchos turnos.
- Despliegue en hardware de consumo: con un peso de ~14,6 GB en IQ4_NL, puede ejecutarse en una GPU de 24 GB o incluso en configuraciones hibridas CPU+GPU mediante llama.cpp, lo que permite prototipado local de traduccion.
- Generacion aumentada por recuperacion (RAG) para soporte documental: puede integrarse en pipelines que recuperen fragmentos y generen respuestas en el idioma del usuario, siempre que el contexto resultante quepa en la ventana (no declarada).
- Evaluacion comparativa de cuantizaciones: util como referencia practica para medir la degradacion entre IQ4_NL, Q4_K_M, Q6_K y Q8_0 en tareas de traduccion, tal como hace el propio autor.
- Experimentacion academica con MoE de bajo coste: su relacion entre parametros totales (~25 B) y activos (~4 B) lo hace interesante para estudiar calidad/coste en inferencia.
- Procesamiento por lotes de traduccion de documentos: la ventaja de velocidad del MoE (4 B activos) frente a un denso de 25 B lo hace apto para traducir volumenes grandes, si la licencia lo permite (no declarada).

## Benchmarks y rendimiento

El autor publica una tabla de clasificacion de traduccion sobre 12 modelos, con medidas de precision y tasa de alucinacion. Son datos autodeclarados, sin metodologia detallada ni verificacion independiente:

| Rank | Modelo y cuantizacion | Arquitectura | Precision | Tasa de alucinacion |
| :---: | :--- | :---: | :---: | :---: |
| 1 | Gemma 3 27B (IQ4_XS) | Densa | 96% | ~4% |
| 2 | SOMPOA 26B-A4B (IQ4_NL) | MoE (A4B) | 93% | ~7% |
| 3 | SOMPOA 26B-A4B (i1-Q4_K_M) | MoE (A4B) | 93% | ~7% |
| 4 | SOMPOA 26B-A4B (BF16) | MoE (A4B) | 93% | ~7% |
| 5 | SOMPOA 26B-A4B (i1-Q6_K) | MoE (A4B) | 93% | ~7% |
| 6 | SOMPOA 26B-A4B (Q8_0) | MoE (A4B) | 93% | ~7% |
| 7 | Gemma 4 31B (Q4_K_M) | Densa | 89% | ~11% |
| 8 | GLM Air 4.5 (FQ3_K_XL) | Densa/Mixta | 86% | ~14% |
| 9 | SOMPOA 26B-A4B (i1-IQ4_XS) | MoE (A4B) | 86% | ~14% |
| 10 | Goetia 26B v1.6 (Q8_0) | Merge MoE | 82% | ~18% |
| 11 | Goetia 26B v1.3 ARA (Q8_0) | Merge MoE | 75% | ~25% |
| 12 | Gemma 2 9B (IQ3_S) | Densa | 39% | ~61% |

Conclusion declarada por el autor: la cuantizacion IQ4_NL iguala la precision de BF16, Q4_K_M, Q6_K y Q8_0 (93%) y supera a IQ4_XS (86%) en esta tarea concreta. No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF IQ4_NL ocupa 14,6 GB, por lo que los pesos requieren en torno a 15 GB. Sumando cache KV, cabe en GPUs de 16-24 GB con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090, RX 7900 XTX) con holgura. En GPUs de 16 GB (RTX 4060 Ti, RTX 4080) es ajustado y puede requerir offload parcial a CPU.
- GPU profesionales recomendadas: para lotes grandes o contextos largos, A100 40/80 GB, H100 o L40S; para un solo usuario, una RTX 4090 es suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores GGUF compatibles con la API de OpenAI. vLLM ofrece soporte GGUF limitado; TGI no esta confirmado para este formato.
- Aceleracion por MoE: al tener ~4 B de parametros activos, el rendimiento por token se aproxima al de un denso de ~4 B, aunque limitado por el ancho de banda de memoria al cargar expertos.
- Latencia y throughput estimados: no disponibles (no se publican mediciones). El autor menciona una penalizacion de velocidad de streaming de ~40% para i1-Q6_K frente a Q4_K_M e IQ4_NL, pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Precision traduccion (autor) | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| SOMPOA 26B-A4B (esta ficha) | ~25,2 B (activos ~4 B) | MoE A4B | 93% | GGUF IQ4_NL | no disponible |
| Gemma 3 27B | ~27 B | Densa | 96% | IQ4_XS | no disponible |
| Gemma 4 31B | ~31 B | Densa | 89% | Q4_K_M | no disponible |
| GLM Air 4.5 | no disponible | Densa/Mixta | 86% | FQ3_K_XL | no disponible |
| Goetia 26B v1.6 | no disponible | Merge MoE | 82% | Q8_0 | no disponible |

Segun los datos del autor, SOMPOA 26B-A4B en IQ4_NL es el mejor equilibrio entre tamano y calidad de traduccion, solo superado por Gemma 3 27B en IQ4_XS, pero ocupando menos memoria. La comparativa con alternativas de la misma categoria (MoE densos de ~25-30 B) queda limitada por la ausencia de datos publicos de arquitectura, licencia y parametros de los competidores citados.

## Limitaciones y advertencias

- Tasa de alucinacion declarada de ~7% en la tarea de traduccion del propio autor; segun su analisis, se trata de una limitacion del modelo base y no de la cuantizacion.
- Licencia no declarada: no puede determinarse si se permite uso comercial, por lo que no es apto para produccion sin aclaracion previa.
- Modelo muy reciente y sin traccion: 0 descargas y 0 valoraciones en el momento de la consulta, lo que impide validar su comportamiento en condiciones reales.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-09-22) son incongruentes respecto a la fecha actual, lo que resta fiabilidad a la ficha.
- Procedencia opaca: los terminos "SOMPOA" y "heresy" no se explican; podria tratarse de un merge o fine-tune cuya cadena de derivacion no esta documentada.
- Sin datos de contexto, idiomas ni ficha tecnica completa: no es posible garantizar ventanas de contexto largas ni cobertura idiomatica amplia.
- Benchmarks autodeclarados y no reproducibles: la tabla de traduccion carece de metodologia detallada, tamano de muestra y criterios de puntuacion, y no incluye metricas estandar.
- Discrepancia de tamano: el autor indica 13,5 GB y el repositorio ocupa 14,6 GB, posiblemente por incluir metadatos o el fichero completo; conviene verificar antes de asignar VRAM.
- Riesgo de sesgo y errores factuales en traduccion cultural: el propio autor senala alucinaciones idiomaticas en cuantizaciones vecinas, lo que exige revision humana en textos sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/Naphula/gemma-4-26B-A4B-it-SOMPOA-heresy-IQ4_NL-GGUF
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a contenidos no relacionados sobre Microsoft Teams). No hay paper, blog, repositorio ni demo asociados en la informacion disponible.
