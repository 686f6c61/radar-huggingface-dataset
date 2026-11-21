# SoAIHQ/gemma-4-E2B-it-GGUF

## Resumen

`SoAIHQ/gemma-4-E2B-it-GGUF` es la distribucion en formato GGUF del modelo `google/gemma-4-E2B-it` de Google, el miembro mas pequeno de la familia Gemma 4. Lo publica SoAI, un tercero que realiza la conversion y cuantizacion para su uso con llama.cpp y su propia infraestructura. El modelo base es multimodal de tipo any-to-any: acepta texto, imagenes y audio como entrada, y genera texto como salida.

La arquitectura es un transformer denso con embeddings por capa (per-layer embeddings), con 2.300 millones de parametros efectivos y 5.100 millones contando los embeddings. La ventana de contexto alcanza los 131.072 tokens (128K), lo que lo situa en un rango poco habitual para un modelo de este tamano. Incorpora razonamiento configurable por peticion (thinking mode) y soporte de tool calling, lo que lo hace util para flujos agenticos ligeros.

La relevancia de esta publicacion concreta esta en la cuantizacion: SoAI emplea una importance matrix (imatrix) calibrada con un corpus propio de chat multi-turno en 21 idiomas, edicion de codigo en 22 lenguajes de programacion, llamadas a herramientas y matematicas paso a paso, en lugar de texto web generico. Se ofrecen dos variantes, Q4_K_M (3,4 GB) y Q8_0 (5,0 GB), mas un proyector multimodal F16 (985,7 MB) necesario para entrada de imagen y audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con embeddings por capa (per-layer embeddings) |
| Parametros totales | 4.647.450.147 (dato de safetensors); la model card indica 2,3B efectivos y 5,1B con embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q4_K_M (imatrix) y Q8_0; no se publican cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 35+ idiomas (preentrenado en 140+); la ficha de HF no detalla la lista |
| Licencia | Apache 2.0 (con enlace a la licencia especifica de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal mmproj en F16 |
| Pipeline | any-to-any (texto, imagen y audio de entrada; texto de salida) |
| Tamanos de archivo | Q4_K_M: 3,4 GB; Q8_0: 5,0 GB; mmproj F16: 985,7 MB |
| Version de llama.cpp indicada | v0.5.0 |
| Modelo base | google/gemma-4-E2B-it |
| Cuantizado por | SoAI |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con una innovacion estructural relevante: embeddings por capa, un esquema en el que cada capa dispone de su propia representacion de embedding en lugar de compartir una unica tabla de entrada. Esto explica la diferencia entre los 2,3B de parametros efectivos y los 5,1B que se alcanzan contando los embeddings. El dato de safetensors del repositorio (4.647.450.147 parametros) es coherente con esa cifra ampliada, aunque no coincide exactamente con ninguna de las dos cifras de la model card.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; la model card de esta publicacion se centra en el proceso de cuantizacion, no en el entrenamiento. Si se documenta el proceso de cuantizacion: Q4_K_M se genera con una importance matrix calculada por SoAI sobre un corpus propio que incluye conversaciones multi-turno en 21 idiomas, edicion de codigo en 22 lenguajes, llamadas a herramientas con sus resultados, matematicas paso a paso y prosa web, todo formateado con la plantilla de chat nativa del modelo, incluida su sintaxis de tool calling. Q8_0 se cuantiza sin imatrix porque el formato de llama.cpp no la utiliza. Antes de publicar, el pipeline verifica que los marcadores de chat, thinking y tool calling se almacenen como tokens especiales y que la plantilla embebida coincida con la original, abortando la conversion si no es asi.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 131.072 tokens.
- Entrada multimodal: imagenes y audio, siempre que se cargue el proyector `mmproj-gemma-4-E2B-it-f16.gguf` con `--mmproj`.
- Razonamiento configurable por peticion mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Tool calling / function calling con sintaxis nativa incluida en la plantilla de chat.
- Capacidades multilingues: 35+ idiomas soportados, con preentrenamiento en mas de 140.
- Razonamiento matematico paso a paso, segun el corpus de calibracion empleado.
- Generacion y edicion de codigo en multiples lenguajes, segun el corpus de calibracion (22 lenguajes).
- Compatibilidad con endpoints de tipo OpenAI a traves de `llama-server`.
- Ejecucion en GPU, CPU o con reparto de capas entre ambos.

## Casos de uso

- **Asistente local con entrada de voz e imagen**: cargando el mmproj F16 junto al GGUF, el modelo puede recibir una foto de un documento o un clip de audio y responder en texto, todo en local sin salida a la nube. Adecuado por su naturaleza any-to-any y su tamano reducido.
- **Atencion al cliente automatizada**: la ventana de 128K permite mantener conversaciones largas con historial extenso y documentacion de producto inyectada en el contexto, sin truncar turnos previos.
- **Agente con tool calling en local**: la plantilla nativa de llamadas a herramientas y el modo thinking configurable permiten construir agentes de varios pasos sobre `llama-server` con API compatible con OpenAI, integrables en orquestadores existentes.
- **Asistencia de codigo en estaciones de trabajo sin GPU dedicada**: la variante Q4_K_M (3,4 GB) se ejecuta en CPU o en GPU consumer, lo que permite autocompletado y edicion de codigo en 22 lenguajes segun el corpus de calibracion, sin depender de servicios externos.
- **Procesamiento de documentos escaneados**: combinando la entrada de imagen y el contexto largo, se pueden pasar varias paginas de un PDF rasterizado y pedir extraccion estructurada o resumen en una sola peticion.
- **Prototipado rapido de pipelines multimodales**: al ser un GGUF de 3,4-5,0 GB con despliegue en un solo comando (`llama-server -hf`), sirve para validar arquitecturas de producto antes de migrar a infraestructura mayor.
- **Analisis de reuniones o notas de voz**: la entrada de audio permite transcribir y resumir contenido hablado, con el razonamiento activable para tareas de sintesis estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: Q4_K_M parte de 3,4 GB de pesos; Q8_0, de 5,0 GB. A esto hay que sumar la memoria de la cache KV, que crece con la longitud de contexto configurada. Para uso multimodal hay que anadir 985,7 MB del proyector F16.
- **GPU recomendadas**: no se especifican en la informacion disponible. Por tamano, cualquier GPU con 6-8 GB de VRAM deberia alojar Q4_K_M con contexto moderado; Q8_0 requiere algo mas de margen.
- **GPU consumer**: si, el modelo esta disenado para caber en equipos de consumo. La model card indica explicitamente que Q4_K_M "suits most machines" y que llama.cpp puede repartir capas entre GPU y CPU.
- **Opciones de despliegue**: llama.cpp (version de referencia v0.5.0), `llama-server` con interfaz de chat integrada y API compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- **Latencia y throughput**: no disponibles. Dependeran del hardware, del reparto de capas y de la longitud de contexto.
- **Descarga directa**: `llama-server -hf SoAIHQ/gemma-4-E2B-it-GGUF:Q4_K_M` descarga automaticamente el mmproj cuando es necesario.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable. A continuacion se recogen los datos estructurales conocidos frente al propio modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Licencia | Multimodal |
|---|---|---|---|---|---|
| SoAIHQ/gemma-4-E2B-it-GGUF (Q4_K_M) | 2,3B efectivos / 5,1B con embeddings | 128K | GGUF | Apache 2.0 | Si (texto, imagen, audio) |
| google/gemma-4-E2B-it (original) | 2,3B efectivos / 5,1B con embeddings | 128K | Safetensors (16-bit) | Apache 2.0 | Si (texto, imagen, audio) |

Para el resto de alternativas de la misma categoria (modelos multimodales ligeros con contexto largo): no disponible.

## Limitaciones y advertencias

- **Sesgos**: no documentados en la informacion disponible. Al derivar de un modelo preentrenado en mas de 140 idiomas, es esperable heredar los sesgos del corpus original, pero no hay analisis publicado en esta ficha.
- **Alucinacion**: no se han publicado evaluaciones especificas de tasa de alucinacion para este modelo ni para su base.
- **Cuantizacion**: Q4_K_M introduce perdida de calidad respecto a los pesos de 16 bits, aunque la model card la califica de "high quality for its size". SoAI no publica variantes por debajo de 4 bits.
- **Dependencia del proyector multimodal**: sin cargar `mmproj-gemma-4-E2B-it-f16.gguf` con `--mmproj`, el modelo no procesa imagenes ni audio; solo texto.
- **Compatibilidad de llama.cpp**: la model card referencia la version v0.5.0. Versiones anteriores pueden no interpretar correctamente los tokens especiales de thinking o tool calling.
- **Idiomas**: aunque se indican 35+ idiomas soportados, no se detalla la lista ni la calidad por idioma. El castellano no aparece verificado explicitamente en la informacion disponible.
- **Licencia**: Apache 2.0, pero con enlace a la licencia especifica de Gemma 4 de Google. Conviene revisar los terminos de uso de Gemma antes de un despliegue comercial, ya que pueden imponer condiciones adicionales a las de Apache 2.0 puro.
- **Contexto largo**: la memoria necesaria para la cache KV crece con la longitud de contexto; usar los 128K completos exige planificacion de memoria aunque los pesos quepan holgadamente.
- **Reputacion del publicador**: se trata de una cuantizacion de terceros (SoAI), no oficial de Google. La trazabilidad esta documentada con la revision del modelo base y el commit de llama.cpp, pero la validacion de calidad corre a cargo del publicador.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio del publicador: https://soai.to
- Archivo Q4_K_M: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q8_0.gguf
- Proyector multimodal F16: https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF/resolve/main/mmproj-gemma-4-E2B-it-f16.gguf
