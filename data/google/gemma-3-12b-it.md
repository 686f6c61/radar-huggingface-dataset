# google/gemma-3-12b-it

## Resumen

Gemma 3 12B IT es un modelo multimodal de tipo imagen-texto desarrollado por Google DeepMind, publicado el 1 de marzo de 2025 como parte de la familia Gemma 3. Se trata de la version ajustada por instrucciones (instruction-tuned) del checkpoint base google/gemma-3-12b-pt, con 12.187.325.040 parametros reales confirmados en los metadatos de safetensors. Su arquitectura es un transformer decoder-only con atencion de ventana deslizante intercalada, encoder de vision SigLIP y una ventana de contexto de 128.000 tokens, lo que lo situa en la gama media-alta de los modelos abiertos actuales.

El problema que resuelve es el de disponer de un modelo abierto, desplegable en infraestructura propia, que combine comprension de imagenes y texto en una sola pasada, soporte de tool calling y un contexto muy largo, sin la dependencia de APIs propietarias. Frente a alternativas de tamano similar, su principal diferencial es la combinacion de multimodalidad nativa, contexto de 128K y un catalogo de cuantizaciones oficiales entrenadas con quantization-aware training (QAT), que reducen los requisitos de VRAM.

Es relevante ahora porque cubre el hueco de los modelos de 10-15B parametros que antes eran exclusivamente de texto: permite construir asistentes que leen documentos escaneados, tablas, graficos e interfaces de usuario, manteniendo la conversacion en castellano y otros idiomas. El acceso en HuggingFace esta restringido (gated): es necesario aceptar las condiciones de la licencia Gemma antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, multimodal (texto + imagen) con encoder de vision SigLIP |
| Parametros totales | 12.187.325.040 (12,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | bfloat16 y float16 en safetensors; checkpoints oficiales QAT int4 (Q4_0 GGUF); cuantizaciones de la comunidad: GGUF (Q2_K a Q8_0), AWQ, GPTQ, MLX 4-bit/8-bit, bitsandbytes 8-bit |
| Idiomas soportados | Mas de 140 idiomas segun la documentacion de Google; el campo de idiomas no esta especificado en los metadatos de HuggingFace |
| Licencia | Gemma Terms of Use (licencia propia de Google, con politica de uso prohibido) |
| Formato de pesos | safetensors (transformers), GGUF, MLX |
| Modalidad de entrada | Texto e imagen (image-text-to-text) |
| Encoder de vision | SigLIP de 400M de parametros, resolucion de 896x896, con metodo Pan and Scan para distintas relaciones de aspecto |
| Vocabulario | 262.144 tokens |
| Fecha de publicacion | 1 de marzo de 2025 (actualizado el 21 de marzo de 2025) |
| Modelo base | google/gemma-3-12b-pt |
| Acceso | Restringido (gated) en HuggingFace |
| Libreria minima | transformers 4.50.0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 12,19B parametros con atencion por ventana deslizante: la mayoria de las capas emplea atencion local con una ventana de 1.024 tokens y solo una de cada cinco capas usa atencion global, un patron 5:1 que reduce el coste computacional y de memoria del contexto largo. Incorpora Grouped-Query Attention (GQA), RMSNorm y activaciones GeGLU, junto con embeddings posicionales rotatorios (RoPE). La torre de vision es un SigLIP de 400M de parametros con resolucion de 896x896 y Pan and Scan, que divide imagenes de relaciones de aspecto no cuadradas en recortes para preservar detalle en imagenes alargadas o documentos.

La rama de vision se integra mediante proyeccion de los embeddings visuales al espacio de tokens del modelo, de modo que la imagen se consume como una secuencia de tokens junto al texto. El entrenamiento consta de una fase de preentrenamiento del checkpoint base y una fase posterior de instruction tuning para obtener la version IT; la documentacion de Google indica que en el post-entrenamiento se emplean tecnicas de destilacion desde modelos mayores y metodos de alineacion, ademas de un proceso de quantization-aware training que produce los checkpoints int4 oficiales con perdida minima de calidad. El informe tecnico de Gemma 3 detalla la composicion del dataset y el volumen de tokens, pero esas cifras concretas no se han facilitado en la informacion disponible en esta ficha.

## Capacidades

- Generacion de texto conversacional multi-turno con instrucciones complejas y contexto de hasta 128.000 tokens.
- Comprension de imagenes: descripcion de escenas, lectura de texto en imagenes (OCR), interpretacion de tablas, graficos, diagramas, capturas de pantalla y documentos escaneados.
- Razonamiento y matematicas de nivel moderado, orientado a problemas de varios pasos expresados en lenguaje natural.
- Generacion de codigo en distintos lenguajes, con soporte de explicaciones y refactorizacion (la model card reporta evaluaciones en HumanEval y otros benchmarks de codigo).
- Tool calling / function calling: el modelo puede emitir llamadas estructuradas a funciones definidas por el desarrollador para integrarse en agentes.
- Flujos de agente y razonamiento multi-paso mediante encadenamiento de llamadas a herramientas y reintentos.
- Capacidades multilingues amplias: mas de 140 idiomas segun la documentacion de Google, con especial atencion a idiomas de bajos recursos.
- Cuantizacion oficial QAT int4 para despliegue con menor huella de memoria sin reentrenamiento.
- No dispone de modo de razonamiento explicito ("thinking mode") ni de entrada de audio o video nativa; el video solo puede procesarse como secuencia de fotogramas.

## Casos de uso

- Atencion al cliente automatizada multilingue: con 128K tokens de contexto, el modelo puede mantener el historial completo de una conversacion larga, incluyendo correos previos y documentacion adjunta, y responder en el idioma del cliente con una sola instancia.
- Procesamiento inteligente de documentos (IDP): lectura de facturas, contratos y formularios escaneados combinando la torre de vision con el contexto largo para extraer campos estructurados; su resolucion de 896x896 con Pan and Scan ayuda con documentos alargados y tablas densas.
- Asistentes de codigo sobre repositorios: al caber en GPUs de 24 GB en cuantizacion int4 y soportar tool calling, puede indexar y consultar fragmentos de codigo, generar parches y llamar a herramientas de compilacion o tests dentro de un pipeline de CI/CD.
- RAG sobre corpus extensos en el sector legal o administrativo: la ventana de 128K permite inyectar decenas de documentos completos sin troceado agresivo, reduciendo la perdida de contexto entre fragmentos.
- Generacion de texto alternativo y audiodescripcion: descripcion automatica de imagenes para accesibilidad web, catalogos de producto o moderacion de contenido visual, integrable mediante la pipeline image-text-to-text de transformers.
- Control de calidad visual en industria: analisis de fotografias de producto o linea de montaje para detectar defectos evidentes, con despliegue on-premise para evitar enviar imagenes a servicios externos.
- Asistentes de soporte tecnico con acceso a herramientas: el modelo puede decidir cuando consultar una API interna (estado de un pedido, disponibilidad de stock) mediante function calling y continuar la conversacion con el resultado.
- Traduccion y adaptacion de contenido: traduccion de textos e imagenes con texto incrustado (carteles, menus, capturas) hacia y desde castellano, aprovechando el soporte multilingue.
- Resumen de reuniones o clases grabadas: procesando fotogramas clave junto con la transcripcion para generar actas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta ficha: los resultados de busqueda facilitados no incluyen cifras concretas y la model card de HuggingFace publica una seccion de resultados de evaluacion que no se ha podido consultar. La tabla siguiente refleja los benchmarks que la documentacion oficial de Gemma 3 suele reportar, pero sus valores no estan disponibles aqui y no deben inferirse.

| Benchmark | Gemma 3 12B IT | Alternativas comparables |
|---|---|---|
| MMLU | no disponible | no disponible |
| MMLU-Pro | no disponible | no disponible |
| GPQA Diamond | no disponible | no disponible |
| MATH | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| Global MMLU (multilingue) | no disponible | no disponible |

## Requisitos de hardware

- Inferencia en bfloat16: los pesos ocupan aproximadamente 24,4 GB (12,19B x 2 bytes). Con cache KV y overhead del runtime, el consumo se situa en torno a 28-32 GB, por lo que requiere GPUs de 40 GB o mas (A100 40 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB) o dos GPU consumer de 24 GB.
- Inferencia en int8: alrededor de 13 GB de pesos; cabe en una RTX 4090 (24 GB) o RTX 4080 (16 GB) con margen para contexto moderado.
- Inferencia en int4 / Q4_0 (QAT oficial): aproximadamente 7 GB de pesos; cabe en GPUs consumer de 8-12 GB, aunque el contexto largo eleva el consumo por la cache KV.
- La cache KV crece con la longitud de contexto; su tamano exacto depende de la configuracion de GQA y del backend: no disponible.
- Opciones de despliegue: transformers >= 4.50.0, vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, LM Studio, SGLang, MLX (Apple Silicon) y ejecucion gestionada en Amazon Bedrock y Google Vertex AI.
- Latencia y throughput estimados: no disponible (dependen fuertemente de la GPU, la cuantizacion y la longitud de contexto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 3 12B IT | 12,19B | 128K | Si (imagen + texto) | Gemma Terms of Use | Pesos abiertos con acceso restringido (gated); tambien en Vertex AI y Amazon Bedrock |
| Gemma 3 4B IT | 4B (aprox.) | 128K | Si (imagen + texto) | Gemma Terms of Use | Pesos abiertos con acceso restringido |
| Gemma 3 27B IT | 27B (aprox.) | 128K | Si (imagen + texto) | Gemma Terms of Use | Pesos abiertos con acceso restringido |
| Llama 3.1 8B Instruct | 8B | 128K | No (solo texto) | Llama 3.1 Community License | Pesos abiertos con acceso restringido |
| Qwen2.5-VL-7B-Instruct | 7B (aprox.) | 128K | Si (imagen y video) | Apache 2.0 | Pesos abiertos sin restriccion |

Los datos de los modelos de la competencia provienen de su documentacion publica y deben verificarse antes de tomar decisiones de produccion. La ventaja principal de Gemma 3 12B IT en esta comparativa es la combinacion de multimodalidad, contexto de 128K y cuantizaciones oficiales QAT; su principal desventaja relativa es la licencia Gemma, mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo generativo, puede producir afirmaciones plausibles pero incorrectas, especialmente en tareas de matematicas, citas y datos factuales recientes.
- Fecha de corte de conocimiento: no especificada en la informacion disponible; no debe asumirse conocimiento de eventos posteriores al entrenamiento.
- Sesgos: los modelos entrenados con datos web heredan sesgos sociales, culturales y de representacion; la model card de Google incluye una seccion de uso etico y limitaciones que conviene revisar.
- Cobertura idiomatica desigual: aunque se anuncian mas de 140 idiomas, el rendimiento en lenguas de bajos recursos es inferior al de ingles y otros idiomas mayoritarios.
- Limites multimodales: solo se admiten imagenes; no hay entrada de audio ni de video nativa, y el rendimiento cae con imagenes de muy baja resolucion o con texto manuscrito complejo.
- Contexto largo: a 128K tokens la calidad puede degradarse y el coste de memoria y latencia crece de forma notable; se recomienda medir en el caso de uso concreto.
- Licencia: la Gemma Terms of Use permite uso comercial, pero impone obligaciones de redistribucion (incluir los terminos y avisos), una politica de uso prohibido y la posibilidad de que Google restrinja el acceso remoto ante usos que violen los terminos. No es una licencia Apache o MIT.
- Acceso restringido: la descarga requiere aceptar los terminos en HuggingFace, lo que puede complicar la automatizacion de pipelines de CI/CD y el despliegue en entornos aislados.
- Uso en produccion: conviene aplicar filtros de salida, validacion de tool calls y supervision humana en dominios sensibles (sanitario, legal, financiero).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google/gemma-3-12b-it
- Modelo base: https://huggingface.co/google/gemma-3-12b-pt
- Documentacion oficial de Gemma: https://ai.google.dev/gemma/docs
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido: https://ai.google.dev/gemma/prohibited_use_policy
- Ficha del modelo en Amazon Bedrock: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-google-gemma-3-12b-it.html
- Ficha en LLMIndex: https://llmindex.net/models/gemma-3-12b-it-free
