# openeurollm/Prelude-SFT-Excellent-v0.2

## Resumen
Prelude-SFT-Excellent-v0.2 es un ajuste fino supervisado (SFT) del modelo base openeurollm/prelude-anneal300b-256k-rope20m-cont, desarrollado por el proyecto OpenEuroLLM. El modelo parte de una arquitectura de tipo Qwen3 (etiqueta `qwen3` en el repositorio) con 9.093.567.488 parametros totales y un tokenizador propio de 256k entradas (openeurollm/tokenizer-256k). Se ha entrenado sobre el dataset openeurollm/Propella-Excellent-SFT durante dos epocas con un total de 58.365.718.851 tokens de entrada procesados y 54.730.454.404 tokens objetivo supervisados.

La innovacion principal del checkpoint es el condicionamiento explicito del modo de razonamiento: los ejemplos de razonamiento reciben `/think` o ninguna instruccion al 50 % (`thinking_instruction_probability: 0.5`), mientras que los ejemplos de respuesta directa reciben `/no_think`. Esto permite controlar en inferencia si el modelo debe generar cadena de pensamiento o responder directamente, mediante los argumentos `enable_thinking` y `thinking_instruction`.

Es relevante ahora porque forma parte del esfuerzo europeo OpenEuroLLM por construir modelos abiertos con infraestructura de entrenamiento reproducible (MareNostrum 5, DeepSpeed ZeRO-2, FlashAttention 3) y porque publica todos los detalles de reproduccion (revisiones de dataset, tokenizador y modelo base, PR de codigo y contadores de tokens), algo poco habitual en checkpoints SFT pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (etiqueta `qwen3`), con atencion FlashAttention 3 en entrenamiento; detalles completos de capas no disponibles |
| Parametros totales | 9.093.567.488 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento (empaquetado); contexto nativo del modelo base no disponible (el nombre del base sugiere 256k) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card |
| Licencia | no disponible; la model card remite a las licencias del modelo base y del dataset, sin licencia propia asignada al checkpoint |
| Formato de pesos | safetensors (libreria transformers); repo de 18,2 GB |

## Arquitectura y entrenamiento
El modelo es un ajuste fino supervisado sobre el checkpoint openeurollm/prelude-anneal300b-256k-rope20m-cont (revision `47a42eb598c0417691b8054e03dac172241bca6b`). La arquitectura subyacente se etiqueta como `qwen3`, es decir, un transformer decoder-only con tokenizador de 256k entradas. El entrenamiento uso BF16, FlashAttention 3 y kernels Liger, con DeepSpeed ZeRO-2 sobre 32 GPU NVIDIA H100 distribuidas en 8 nodos de MareNostrum 5, con checkpointing de gradientes no reentrante y sin solapamiento de comunicacion.

Los hiperparametros documentados son: AdamW con beta1=0.9, beta2=0.95, epsilon=1e-8 y weight decay 0; tasa de aprendizaje 8e-5 con decaimiento lineal y 3 % de warmup; tamano de lote efectivo de 32 secuencias empaquetadas (lote por dispositivo 1); recorte de gradiente 1.0; semillas 42 para entrenamiento y datos. Se realizaron 55.892 pasos en 2 epocas con longitud maxima de secuencia de 32.768 tokens y empaquetado activado. La perdida se aplica solo sobre los turnos del asistente y las respuestas supervisadas truncadas parcialmente se descartan (`truncated_span_action: drop`). La innovacion tecnica destacable es el condicionamiento del objetivo de entrenamiento segun el modo de pensamiento (PR #68 de OpenEuroLLM/post-training), que ensena al modelo a alternar entre razonamiento explicito y respuesta directa segun la instruccion.

## Capacidades
- Generacion de texto conversacional e instrucciones, con ajuste SFT sobre un dataset de instrucciones de alta calidad (Propella-Excellent-SFT).
- Razonamiento con modo de pensamiento controlable: el prefijo de generacion se selecciona con `enable_thinking`, y `thinking_instruction` acepta `"think"`, `"no_think"` o `None`.
- Respuesta directa sin cadena de pensamiento cuando se indica `/no_think`.
- Soporte de plantilla de chat estilo Qwen condicionada por modo de pensamiento, incluida en el checkpoint.
- Compatibilidad con text-generation-inference y endpoints compatibles (tags del repositorio).
- Capacidades multilingues: no documentadas en la model card.
- Tool calling / function calling: no documentado.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso
- Asistente conversacional con control de latencia: en produccion se puede invocar con `thinking_instruction="no_think"` para respuestas rapidas de un solo paso y con `"think"` cuando se requiera razonamiento explicito, usando la misma plantilla de chat incluida en el checkpoint.
- Razonamiento paso a paso auditable: el modo `/think` permite generar cadenas de razonamiento visibles para tareas de analisis, verificacion o depuracion, apropiado porque el modelo fue entrenado especificamente para alternar entre ambos regimenes.
- Procesamiento de documentos largos: con 32.768 tokens de contexto en entrenamiento y empaquetado activado, es adecuado para resumir o extraer informacion de contratos, informes o expedientes de longitud media en una sola pasada.
- Generacion de respuestas en pipelines de atencion al cliente: su formato instructivo y la plantilla de chat permiten integrarlo en servicios multi-turno; conviene validar el comportamiento multilingue antes de desplegarlo en idiomas distintos del entrenado.
- Evaluacion comparativa de tecnicas de condicionamiento de razonamiento: al publicar PR, dataset y contadores de tokens, sirve como referencia reproducible para experimentos de SFT con modos de pensamiento.
- Despliegue en infraestructura de inferencia estandar: al ser compatible con transformers y text-generation-inference, puede servirse con TGI o vLLM en GPUs de datacenter, y con llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas).
- Fine-tuning posterior o destilacion: al estar en safetensors y con licencia pendiente de definir, puede usarse como punto de partida interno, siempre que se resuelva la licencia del modelo base y del dataset.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 18,2 GB solo para pesos (9,09 mil millones de parametros a 2 bytes), mas KV cache y activaciones; en la practica se recomiendan 24 GB o mas para contexto largo.
- Cuantizacion: no se publican pesos cuantizados; una cuantizacion a 8 bits reduciria los pesos a unos 9 GB y a 4 bits a unos 4,5-5 GB, pero requeriria generar las conversiones.
- GPU recomendadas: H100 o A100 para servicio en BF16 con contexto largo; RTX 4090 (24 GB) puede alojar los pesos en BF16 con margen limitado y contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 o GPUs con 24 GB o mas en BF16 con contexto moderado; en GPUs de 16 GB solo tras cuantizacion (no publicada).
- Opciones de despliegue: transformers, text-generation-inference (soportado por tags), vLLM; llama.cpp y Ollama requeririan conversion a GGUF no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Prelude-SFT-Excellent-v0.2 | 9,09 B | 32.768 en entrenamiento | no disponible | Hugging Face (safetensors) |
| Qwen3-8B (referencia de familia) | ~8 B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Modelos de ~9 B de otras familias | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias
- Licencia sin asignar: la model card indica explicitamente que no se ha asignado licencia propia al checkpoint y remite a las del modelo base y el dataset; el uso comercial queda condicionado a esas licencias, que no se detallan.
- Idiomas no documentados: no se especifica que idiomas cubre el entrenamiento, lo que supone un riesgo para despliegues en castellano u otras lenguas sin evaluacion previa.
- Riesgo de alucinacion: como todo modelo generativo ajustado por SFT, puede producir contenido plausible pero incorrecto, especialmente en modo `/no_think` sin verificacion.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Contexto: el entrenamiento se limita a 32.768 tokens; aunque el nombre del modelo base sugiere ventanas mayores, no se garantiza un comportamiento correcto mas alla de la longitud entrenada.
- Capacidades no verificadas: no hay evidencia publicada de tool calling, agentes multi-paso ni capacidades multimodales.
- Madurez: checkpoint con 390 descargas y 0 likes, sin benchmarks publicados; no recomendable para produccion critica sin evaluacion propia.
- Reproducibilidad: requiere usar el tokenizador y la plantilla de chat incluidos; usar otra plantilla puede degradar el comportamiento del modo de pensamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/openeurollm/Prelude-SFT-Excellent-v0.2
- Modelo base: https://huggingface.co/openeurollm/prelude-anneal300b-256k-rope20m-cont
- Dataset de entrenamiento: https://huggingface.co/datasets/openeurollm/Propella-Excellent-SFT
- Tokenizador: https://huggingface.co/openeurollm/tokenizer-256k
- Repositorio de post-entrenamiento: https://github.com/OpenEuroLLM/post-training
- PR de implementacion del condicionamiento de pensamiento: https://github.com/OpenEuroLLM/post-training/pull/68
- Discusion de experimento y evaluacion: https://github.com/OpenEuroLLM/Taskboard/issues/442
