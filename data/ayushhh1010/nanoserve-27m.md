# ayushhh1010/nanoserve-27m

## Resumen

Nanoserve 27M es un modelo de lenguaje de 26.747.392 parametros desarrollado por el usuario ayushhh1010 como fase 1 del proyecto Nanoserve. Se trata de un transformer decoder-only entrenado desde cero sobre el corpus TinyStories V2, con arquitectura, tokenizador y bucle de entrenamiento escritos a mano (sin `AutoModel` ni la libreria `tokenizers`). Su unico proposito es generar cuentos infantiles cortos en ingles; no es un asistente de proposito general y no responde preguntas, no sigue instrucciones ni razona.

La relevancia del modelo es fundamentalmente educativa y de ingenieria: demuestra que es posible entrenar un LM coherente en su dominio con 536.174.127 tokens en una unica GPU de portatil (RTX 3050 de 4 GB) en 3,27 horas, alcanzando una perdida de validacion de 1,1485 nats/token (perplejidad 3,153). Emplea atencion con query agrupada (GQA, 2 cabezas KV), RMSNorm pre-norm, RoPE, activacion SwiGLU y embeddings atados, con un vocabulario BPE propio de 8.192 tokens y una ventana de contexto de 1.024 tokens.

Su interes practico reside en servir como banco de pruebas de bajo coste para pipelines de inferencia, tokenizadores a medida, tecnicas de muestreo y sistemas de servicio distribuido (que es precisamente la fase 2 del proyecto Nanoserve). Esta publicado bajo licencia MIT en formato safetensors y, a fecha de la informacion disponible, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (pre-norm RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 26.747.392 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el checkpoint se distribuye sin cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| d_model / capas / cabezas | 512 / 8 / 8 |
| Cabezas KV (GQA) | 2 |
| d_ff | 1.408 (SwiGLU) |
| Vocabulario | 8.192 tokens (BPE byte-level propio) |
| Embeddings | atados (tied) |
| Tokens de entrenamiento | 536.174.127 |
| Dataset | roneneldan/TinyStories (V2) |
| Fecha de publicacion (segun metadatos) | 11 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con d_model de 512 y 8 cabezas de atencion, de las cuales solo 2 son cabezas KV gracias al uso de grouped-query attention, una eleccion que reduce el coste de memoria del cache KV en inferencia. Usa RMSNorm en configuracion pre-norm, codificacion posicional rotatoria (RoPE), capa feed-forward de 1.408 dimensiones con activacion SwiGLU y embeddings de entrada y salida atados. Los nombres de los parametros replican la convencion de Llama de HuggingFace, de modo que los pesos pueden cargarse en un `LlamaForCausalLM` con la forma correspondiente. El tokenizador es un BPE byte-level de 8.192 tokens construido especificamente para el corpus, que comprime TinyStories V2 a 3,965 bytes por token y codifica el 98,1 % de las palabras en un unico token.

El entrenamiento se realizo integramente desde cero sobre TinyStories V2 (corpus generado con GPT-4), con 536.174.127 tokens procesados, un volumen elegido para situarse en la ratio Chinchilla-optima de aproximadamente 20 tokens por parametro. Se ejecuto en una unica RTX 3050 de portatil con 4 GB de VRAM durante 3,27 horas. No se aplico ajuste por instrucciones, alineamiento ni filtrado de seguridad de ningun tipo. Los resultados declarados son una perdida de validacion de 1,1485 nats/token y una perplejidad de 3,153.

## Capacidades

- Generacion de texto narrativo corto en ingles con estructura de cuento infantil (fase de apertura tipo "Once upon a time", personajes simples, trama elemental y cierre).
- Continuacion de un prompt narrativo dado, con muestreo configurable (`temperature`, `max_new_tokens` y un objeto `SamplingParams` en el codigo de referencia).
- Modelado de lenguaje a nivel de token con un vocabulario especializado en el registro linguistico de TinyStories.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, planificacion ni razonamiento multi-paso.
- No es multilingue: solo ingles, y limitado al ingles sencillo del corpus.
- No incorpora modo de razonamiento explicito, vision, audio ni ninguna modalidad adicional a texto.
- No sigue instrucciones ni mantiene dialogos: no es un modelo conversacional.

## Casos de uso

- Generacion de datos sinteticos de preentrenamiento: producir grandes volumenes de cuentos infantiles coherentes para aumentar corpus destinados a entrenar modelos mayores, aprovechando su coste de inferencia minimo y su perplejidad de 3,153 en el dominio.
- Banco de pruebas de pipelines de servicio: al caber en cualquier GPU y ejecutarse en milisegundos, sirve para validar en CI/CD un servidor de inferencia (batching, gestion de cache KV, streaming de tokens) antes de desplegar modelos de mayor tamano.
- Desarrollo y validacion de tokenizadores BPE: el proyecto incluye un `BPETokenizer` propio; el modelo permite comprobar de extremo a extremo el efecto del vocabulario sobre la compresion (3,965 bytes/token) y la calidad generativa.
- Educacion y experimentacion en entrenamiento desde cero: reproducir el ciclo completo (dataset, tokenizador, bucle de entrenamiento, evaluacion) en hardware de consumo, con un coste de 3,27 horas en una RTX 3050 de 4 GB.
- Investigacion sobre decodificacion especulativa: un modelo de 27M tokens puede actuar como modelo borrador en experimentos de speculative decoding frente a modelos mayores, aunque su vocabulario BPE propio exige reentrenar o alinear la cabeza de salida para compartir vocabulario.
- Evaluacion comparativa de tecnicas de muestreo y decodificacion: con una ventana de 1.024 tokens y una latencia muy baja, es adecuado para barridos sistematicos de temperatura, top-k, top-p y penalizaciones de repeticion.
- Despliegue en entornos con recursos restringidos (edge, Raspberry Pi, contenedores sin GPU) para generar narrativa infantil corta en aplicaciones educativas o demostraciones offline.
- Pruebas de conversion y cuantizacion de formatos: sirve como caso minimo para validar conversiones a GGUF u otros formatos y para medir el impacto de la cuantizacion sobre la perplejidad en un modelo cuyo peso completo ocupa pocos cientos de megabytes.
- Prototipado de fine-tuning ligero sobre dominios muy simples (por ejemplo, otro tipo de relatos breves) con coste de computo despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de evaluacion declarados por el autor son los siguientes:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,1485 nats/token |
| Perplejidad | 3,153 |
| Tokens de entrenamiento | 536.174.127 |
| Ratio tokens/parametro | ~20 (Chinchilla-optimo, segun el autor) |
| Hardware de entrenamiento | 1x RTX 3050 Laptop (4 GB) |
| Tiempo de entrenamiento | 3,27 horas |

No se especifica la particion de validacion empleada ni se ofrecen comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 107 MB en fp32 (26.747.392 parametros x 4 bytes), unos 53 MB en fp16/bf16 y unos 27 MB en int8.
- Cache KV adicional: con 2 cabezas KV, head_dim de 64 y 8 capas, el cache para los 1.024 tokens de contexto ocupa del orden de 4 MB en fp16, por lo que el consumo total se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU, incluida una RTX 3050 de portatil con 4 GB, GTX 1650, integradas modernas o placas como Jetson. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en CPU; el entrenamiento completo cupo en 4 GB de VRAM.
- Opciones de despliegue: el repositorio de Nanoserve incluye cargador y bucle de generacion propios (`model.generate.load_model`, `generate`, `SamplingParams`); tambien puede cargarse en `transformers` mediante `LlamaForCausalLM` con la forma compatible, o convertirse a GGUF para llama.cpp/Ollama. vLLM o TGI son tecnicamente posibles pero estan sobredimensionados para este tamano.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos que figuran a continuacion no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus fichas oficiales antes de usarse.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nanoserve 27M | 26.747.392 | 1.024 | MIT | HuggingFace (safetensors) | Transformer propio estilo Llama, entrenado desde cero sobre TinyStories V2 |
| TinyStories-33M (Eldan y Li) | ~33 M | no verificado en esta busqueda | no verificado | HuggingFace | Modelo de referencia del corpus TinyStories, categoria equivalente |
| TinyStories-28M (familia TinyStories) | ~28 M | no verificado | no verificado | HuggingFace | Variante de menor tamano de la misma familia de datos |
| GPT-2 small | 124 M | 1.024 | no verificado | HuggingFace | Referencia de escala superior; proposito general y no comparable en dominio |

La diferencia principal de Nanoserve 27M frente a las alternativas de la familia TinyStories es que su arquitectura, tokenizador (BPE propio de 8.192 tokens) y bucle de entrenamiento estan implementados a mano, sin depender de las librerias estandar, y que los pesos siguen la nomenclatura de Llama. El autor no publica comparaciones de rendimiento frente a estos modelos.

## Limitaciones y advertencias

- Vocabulario y modelo del mundo limitados al ingles sencillo de TinyStories; no generaliza a otros dominios ni idiomas.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o dialogos extensos.
- Sin ajuste por instrucciones, sin alineamiento y sin ningun tipo de filtrado de seguridad: puede generar contenido inapropiado y no obedece ordenes.
- Alto riesgo de afirmaciones factualmente incorrectas: modela texto con forma de cuento, no hechos. No debe usarse como fuente de informacion.
- No es un asistente conversacional ni un modelo de razonamiento; no debe evaluarse con benchmarks de ese tipo ni desplegarse en tareas de pregunta-respuesta.
- Sin datos publicados de sesgos; al derivar de un corpus generado por GPT-4, puede heredar sesgos del corpus sintetico original.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de copyright; no se documentan restricciones adicionales.
- Advertencia de produccion: con 0 descargas y 0 likes y sin evaluaciones independientes, la validacion externa del modelo es nula; para produccion seria necesario evaluar calidad y seguridad por cuenta propia.
- El pipeline de generacion documentado depende de codigo propio del repositorio (`model.tokenizer`, `model.generate`), no de la API estandar de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayushhh1010/nanoserve-27m
- Repositorio del proyecto Nanoserve: https://github.com/ayushhh1010/nanoserve
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Referencia externa del corpus (no incluida en la informacion proporcionada): paper "TinyStories: How Small Can Language Models Be and Still Speak Coherent English?", arXiv:2305.07759
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a sitios de examenes de conducir sin relacion alguna). No se han encontrado papers, blogs, demos ni evaluaciones de terceros.
