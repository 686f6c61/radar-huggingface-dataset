# Goekdeniz-Guelmez/Qwen3.5-2B-gabliterated

## Resumen

Qwen3.5-2B-gabliterated es un derivado del modelo multimodal Qwen/Qwen3.5-2B publicado por Goekdeniz-Guelmez, en el que se ha aplicado la tecnica Gabliteration para reducir el comportamiento de rechazo (refusal) del modelo original. No se trata de un fine-tuning ni de un reentrenamiento: la modificacion consiste en una edicion directa de pesos sobre 30 matrices en 15 de las 24 capas del transformer, dejando intactos el codificador de vision y la cabeza MTP. El resultado sigue siendo un modelo completo de image-text-to-text con 2.274.069.824 parametros totales (1,88B correspondientes al modelo de lenguaje) y una ventana de contexto de 262.144 tokens.

La arquitectura es hibrida: 18 capas Gated DeltaNet combinadas con 6 capas de atencion completa con compuertas, un diseno que busca eficiencia en contextos largos reduciendo el coste cuadratico de la atencion. El modelo base pertenece a la familia Qwen3.5 de Alibaba y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial. La relevancia de esta variante radica en que demuestra una tecnica de modificacion conductual selectiva que preserva casi por completo las capacidades del modelo original, con una divergencia KL de primer token de solo 0,0319 sobre prompts inofensivos.

Es importante senalar que el modelo solo declara soporte para ingles y que no se han publicado resultados en benchmarks estandar sobre este checkpoint. La reduccion de rechazos medida por palabras clave cae del 98% al 11%, pero una evaluacion con juez LLM (Qwen3.5-9B) sobre las mismas completaciones indica que el modelo sigue declinando la mayoria de los prompts daninos (79% de rechazo segun el juez), lo que matiza la magnitud real del efecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas Gated DeltaNet + 6 capas de atencion completa con compuertas (gated full attention) |
| Parametros totales | 2.274.069.824 (2,27B); 1,88B en el modelo de lenguaje |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el repo distribuye pesos safetensors; el autor menciona soporte MLX para Apple Silicon) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; compatible con transformers y MLX |

Otros datos tecnicos: 24 capas en total, hidden size 2.048, MLP size 6.144, 8 cabezas de atencion (2 KV), vocabulario de 248.320 tokens con embeddings atados (tied embeddings). El codificador de vision tiene 24 capas con hidden size 1.024 y permanece sin cambios respecto al original. Tamano del repositorio: 4,6 GB.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una pila hibrida de 24 capas en la que 18 son Gated DeltaNet (una variante de atencion lineal con estado recurrente) y 6 son capas de atencion completa con compuertas. Esta combinacion busca mantener la calidad de la atencion densa en tareas que requieren recuperacion exacta de informacion, mientras reduce el coste computacional y de memoria en secuencias largas. El vocabulario es amplio (248.320 tokens) con embeddings atados, y el modelo incorpora un codificador de vision de 24 capas para la modalidad image-text-to-text.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del corpus, uso de RLHF o DPO): no disponible. Lo que si esta documentado es el proceso de Gabliteration aplicado por Gülmez. El metodo extrae estados residuales del ultimo token para prompts daninos (mlabonne/harmful_behaviors) e inofensivos (mlabonne/harmless_alpaca), calcula una puntuacion de separabilidad por capa y selecciona la capa 21 (separabilidad 16,73) para construir el subespacio de rechazo R a partir de los k=1 vectores singulares derechos principales de las diferencias danino-menos-inofensivo. Despues elimina una proyeccion ridge P = R(RᵀR + λI)⁻¹Rᵀ, con λ = 0,05, escalada por un α adaptativo por posicion, de todas las proyecciones que escriben en el flujo residual de las capas seleccionadas: `linear_attn.out_proj`, `self_attn.o_proj` y `mlp.down_proj`. Los hiperparametros α_base/β = 0,6/0,5 producen un α por capa entre 0,60 y 0,90, y las capas modificadas son de la 7 a la 21. El proceso se ejecuto en un Apple M4 (GPU de 10 nucleos, 32 GB) en 6 minutos y 43 segundos con MLX.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat compatible con transformers (`apply_chat_template`).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text), incluyendo preguntas sobre el contenido visual.
- Razonamiento multi-turno dentro de una ventana de contexto de hasta 262.144 tokens.
- Procesamiento de documentos e imagenes largas gracias al contexto extendido y a la atencion hibrida.
- Comportamiento de rechazo reducido: acepta peticiones que el modelo original declinaba, segun la metrica de palabras clave (11% de rechazo frente al 98%).
- Soporte de ejecucion en Apple Silicon mediante MLX (`mlx_vlm.generate` y `mlx_lm.generate`).
- No se documenta soporte explicito de tool calling, function calling ni modos de pensamiento (thinking) en la informacion disponible.

## Casos de uso

- Procesamiento de documentos escaneados con contexto largo: el modelo puede recibir imagenes de paginas junto con instrucciones textuales y mantener coherencia en conversaciones de hasta 262.144 tokens, util para extraccion y resumen de expedientes extensos.
- Asistentes conversacionales sobre capturas de pantalla o diagramas: al ser image-text-to-text, permite construir interfaces donde el usuario sube una imagen y pregunta por ella, con respuestas multi-turno.
- Analisis de imagenes tecnicas en flujos de trabajo internos: por ejemplo, interpretar graficos o tablas en imagenes y generar descripciones textuales, aprovechando el codificador de vision intacto.
- Investigacion sobre alineacion y seguridad: el checkpoint sirve como caso de estudio reproducible de modificacion conductual selectiva, con scripts y configuracion publicados (`gabliterate.py`, `gabliteration.json`) para replicar el experimento.
- Evaluacion comparativa de tecnicas de abliteration: al conservar bit a bit todos los tensores no editados, permite aislar el efecto de la edicion de pesos frente al modelo original en experimentos controlados.
- Despliegue en hardware de consumo Apple: con 2,27B parametros y soporte MLX, cabe en equipos con 32 GB de memoria unificada, lo que facilita prototipado local sin GPU dedicada.
- Generacion de contenido creativo sin filtros restrictivos en entornos controlados: util para escritura de ficcion o guiones donde el modelo original rechazaria escenarios conflictivos, siempre con supervision humana.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las metricas del proceso de Gabliteration, no benchmarks estandar de capacidad:

| Metrica | Qwen3.5-2B | Qwen3.5-2B-gabliterated |
|---|---:|---:|
| Tasa de rechazo (palabras clave), 100 prompts daninos retenidos | 98% | 11% |
| KL de primer token frente al original, 100 prompts inofensivos | 0 | 0,0319 |
| Tasa de rechazo segun juez Qwen3.5-9B (mismas completaciones, pesos bf16) | 98% | 79% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor indica que "standard benchmarks have not been run on this checkpoint yet".

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contexto moderado.
- En cuantizacion de 8 bits, el peso baja a unos 2,3 GB; en 4 bits, a unos 1,2 GB, aunque el autor no documenta cuantizaciones GGUF oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion con contexto largo; RTX 4090 (24 GB) para experimentacion con contexto extendido.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB) y RTX 4090 en bf16 con contexto moderado; en cuantizacion 4 bits cabria en GPUs de 8 GB.
- Despliegue: transformers (`AutoModelForImageTextToText`), MLX en Apple Silicon (`mlx_vlm` y `mlx_lm`). El autor no documenta integracion con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de creacion del checkpoint (6 min 43 s en un M4), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---:|---|---|---|---|
| Qwen3.5-2B-gabliterated | 2,27B | 262.144 | Image-text-to-text | Apache 2.0 | Rechazo reducido; sin benchmarks publicados |
| Qwen/Qwen3.5-2B (base) | 2,27B | 262.144 | Image-text-to-text | Apache 2.0 | Modelo original con rechazo del 98% |
| Modelos abliterated de la familia Llama o Qwen2.5 | Variable | Variable | Texto (mayoria) | Depende del base | Alternativas de la misma tecnica; no se dispone de datos comparativos verificados en esta ficha |

La comparacion directa con otras variantes abliterated de modelos de 2B no esta disponible en la informacion proporcionada. La referencia mas solida es el propio modelo base, cuyas capacidades deberian ser practicamente identicas salvo en el comportamiento de rechazo.

## Limitaciones y advertencias

- La metrica de rechazo por palabras clave es aproximada: no detecta rechazos suaves (por ejemplo, "no es posible...", sermones o redirecciones a tareas mas seguras) y puede marcar como rechazo respuestas que citan frases de rechazo.
- Segun el juez LLM Qwen3.5-9B, el modelo sigue rechazando el 79% de los prompts daninos evaluados, muy por encima del 11% que sugiere la metrica de palabras clave. La reduccion real del comportamiento de rechazo es, por tanto, moderada.
- La KL de 0,0319 mide solo la divergencia en el primer token sobre 100 prompts inofensivos; no es una medida de capacidad general ni de calidad en tareas largas.
- No se han ejecutado benchmarks estandar sobre este checkpoint, por lo que se desconoce si la edicion de pesos degrada razonamiento, codigo o matematicas.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- El modelo cumplira peticiones que el original rechazaba; el autor declara explicitamente que la responsabilidad de uso y despliegue recae en el usuario.
- Licencia Apache 2.0 permite uso comercial, pero deben tenerse en cuenta las obligaciones de atribucion y las politicas de la plataforma de despliegue.
- Riesgo de alucinacion no cuantificado en la informacion disponible; se aplican las limitaciones habituales de un modelo de 2B.
- No se documentan sesgos especificos ni evaluaciones de seguridad mas alla de la tasa de rechazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Goekdeniz-Guelmez/Qwen3.5-2B-gabliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper de Gabliteration: https://arxiv.org/abs/2512.18901
- Dataset de prompts daninos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inofensivos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
