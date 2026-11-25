# cyjin-yl/ScarletKc-2.0-W8A16-FP8

## Resumen

ScarletKc-2.0-W8A16-FP8 es un checkpoint cuantizado del modelo multimodal ScarletKc-2.0, publicado por el usuario cyjin-yl. Se trata de una cuantizacion post-entrenamiento en formato compressed-tensors que convierte 256 matrices de proyeccion del modelo original en BF16 a FP8 (E4M3FN), manteniendo las activaciones sin cuantizar (esquema W8A16). El resultado es un artefacto de 36,8 GB que conserva intactos el tower de vision, las normas, el cabezal MTP y las proyecciones de atencion lineal del modelo base.

El modelo subyacente, ScarletKc-2.0, es un transformer multimodal de tipo Qwen3.5 con 27.781 millones de parametros, disenado para tareas de imagen-a-texto y conversacion multilingue en ingles, chino y japones. Esta version cuantizada anade una fase acotada de destilacion consciente de cuantizacion (QAD) sobre las escalas de la ultima capa del decodificador, con el objetivo de reducir la perdida de calidad respecto al checkpoint BF16 original.

La relevancia de esta ficha radica en que documenta un caso practico de cuantizacion FP8 por canal con destilacion de escalas, un patron cada vez mas habitual para desplegar modelos multimodales de ~28B en hardware con memoria limitada. El autor publica evidencia de validacion, manifiestos SHA-256 y scripts de reproduccion, lo que permite auditar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen3.5 (atencion completa + atencion lineal, tower de vision, cabezal MTP) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 262.144 tokens (ventana nativa del modelo base) |
| Tipos de cuantizacion | W8A16 con pesos FP8 E4M3FN y escalas FP32 simetricas por fila de salida; activaciones sin cuantizar |
| Idiomas soportados | en, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, esquema `float-quantized`) |

## Arquitectura y entrenamiento

El modelo base ScarletKc-2.0 es un transformer multimodal con 64 capas que combina atencion completa en 16 capas y atencion lineal en el resto, ademas de un tower de vision de 333 tensores y un cabezal MTP (multi-token prediction) de 15 tensores. Esta version cuantizada cuantiza exclusivamente las proyecciones `gate_proj`, `up_proj` y `down_proj` de las 64 capas MLP y las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 16 capas de atencion completa, sumando 256 matrices. Quedan sin tocar los embeddings, la proyeccion de vocabulario, las normas, la atencion lineal, el tower de vision y el cabezal MTP.

El proceso de cuantizacion parte de `amax / 448` como escala inicial y evalua nueve fracciones entre 0,8 y 1,0, eligiendo la que minimiza el error cuadratico medio de reconstruccion en FP32. Posteriormente se aplica una destilacion consciente de cuantizacion sobre las escalas de las siete proyecciones FP8 de la ultima capa del decodificador: se congela el resto del modelo y se optimizan solo las escalas mediante gradiente straight-through, con una funcion de perdida que combina KL de vocabulario completo a temperatura 1 y 0,075 veces la entropia cruzada sobre tokens de asistente. El conjunto de datos fue sintetico y pequeno (50 ejemplos de entrenamiento, 20 de validacion y 15 de holdout), y se selecciono el paso 30 como punto final. La validacion reporta una KL de 0,00333 nats por token frente a 0,00351 de la inicializacion, y una NLL de 0,63119 frente a 0,63436.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y japones.
- Razonamiento multimodal imagen-a-texto: el pipeline declarado es `image-text-to-text` y el tower de vision se conserva intacto.
- Procesamiento de video corto segun las pruebas de validacion del autor (fixtures de imagen y video corto).
- Soporte de tool calling y function calling heredado del modelo base Qwen3.5 (no verificado de forma independiente en esta version cuantizada).
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base (no verificadas en esta version).
- Cabezal MTP (multi-token prediction) retenido para decodificacion especulativa en runtimes compatibles.
- Ventana de contexto nativa de 262.144 tokens.
- Capacidad de thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con imagenes adjuntas (capturas de pantalla, fotos de producto) gracias a su ventana de 262.144 tokens y al tower de vision conservado, lo que permite mantener historiales largos sin truncar.
- Analisis de documentos escaneados: al combinar entrada de imagen y contexto largo, resulta adecuado para extraer y razonar sobre contratos, facturas o formularios en ingles, chino o japones.
- Despliegue en infraestructura con memoria limitada: la cuantizacion W8A16 reduce el payload a 36,8 GB, permitiendo servir el modelo en dos GPUs de 32 GB (por ejemplo, V100 o A100 de 40 GB en configuracion tensor-parallel) en lugar de requerir el checkpoint BF16 completo.
- Asistente de codigo y documentacion tecnica: hereda las capacidades de generacion de codigo del modelo base Qwen3.5; puede integrarse en pipelines de CI/CD mediante tool calling para automatizar revisiones o generar documentacion.
- Procesamiento de video corto: los fixtures de validacion del autor incluyen video corto, por lo que puede emplearse en tareas de descripcion o clasificacion de clips breves.
- Backend compatible con OpenAI y Anthropic: el autor valido el despliegue en vLLM con peticiones JSON estilo OpenAI y streams de texto e imagen estilo Anthropic, lo que facilita la integracion en aplicaciones existentes.
- Investigacion en cuantizacion: el repositorio incluye el exportador, las escalas seleccionadas y el manifiesto SHA-256, lo que lo convierte en un caso de estudio reproducible para tecnicas de QAD sobre escalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que "benchmark, full-context, long-video, and broad multimodal quality are unmeasured". La unica evidencia cuantitativa publicada es la tabla de destilacion de escalas:

| Evaluacion | Tokens de asistente | KL inicial | KL seleccionada | NLL inicial | NLL seleccionada |
|---|---:|---:|---:|---:|---:|
| Validacion | 255 | 0,00351253 | 0,00333032 | 0,63436457 | 0,63119111 |
| Holdout independiente | 708 | 0,00190396 | 0,00184335 | 0,33723949 | 0,33587344 |

Las metricas estan en nats por token de asistente.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de pesos es de 36,78 GB; con overhead de activaciones, cache KV y contexto, se recomienda un minimo de 48 GB de VRAM agregada para contexto moderado.
- El autor valido el despliegue en dos Tesla V100 con vLLM (1Cat-vLLM 1.5.4), usando W8A16 estatico por canal, computo FP16, cache KV E4M3 y 572.644 tokens de KV, con especulacion MTP desactivada.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, no cabe en una unica RTX 4090 (24 GB) sin cuantizacion adicional o offload.
- Opciones de despliegue: vLLM con soporte de compressed-tensors W8A16 estatico por canal; llama.cpp, Ollama y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no midio el rendimiento a la ventana maxima de 262.144 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ScarletKc-2.0-W8A16-FP8 | ~27,8B | 262.144 | Apache 2.0 | safetensors FP8 W8A16 | Hugging Face |
| ScarletKc-2.0 (BF16) | ~27,8B | 262.144 | Apache 2.0 | safetensors BF16 | Hugging Face |
| Qwen3.5-27B (referencia de familia) | ~27B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Hugging Face |
| Qwen3.8-27B-W8A16-FP8 (referencia de formato) | ~27B | no disponible en esta ficha | no disponible en esta ficha | safetensors FP8 W8A16 | Hugging Face |

La comparativa con alternativas de la misma categoria no puede completarse con datos de rendimiento porque no se han publicado benchmarks de esta version cuantizada.

## Limitaciones y advertencias

- La destilacion de escalas se realizo sobre un conjunto sintetico muy pequeno (50 ejemplos de entrenamiento, 20 de validacion, 15 de holdout); la generalizacion a dominios reales no esta demostrada.
- No hay benchmarks publicados: se desconoce la degradacion real frente al BF16 en MMLU, HumanEval, GSM8K o tareas multimodales.
- La calidad a contexto completo (262.144 tokens) y en video largo no se ha medido.
- Riesgo de alucinacion inherente a los modelos generativos; no se ha caracterizado en esta version.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados limitados a en, zh, ja; el castellano no figura entre los idiomas declarados.
- El backend de serving debe soportar compressed-tensors W8A16 estatico por canal para el acelerador elegido; otros runtimes pueden no cargar el checkpoint.
- El cabezal MTP esta retenido pero la especulacion se desactivo en la validacion del autor; su comportamiento en produccion no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los terminos heredados del modelo base recogidos en `LICENSE` y `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyjin-yl/ScarletKc-2.0-W8A16-FP8
- Modelo base ScarletKc-2.0: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Checkpoint BF16 original (revision fijada): https://huggingface.co/ScarletKc/ScarletKc-2.0/tree/ddebd3b2d5f6a91e1d9491c3dc2982551ffb3340
- Referencia de formato W8A16 y clipping: https://huggingface.co/hoborific/Qwen3.8-27B-W8A16-FP8/tree/e3e1f20932cc02e7892de7a5181037b15a08df5e
- Evidencia de cuantizacion y validacion: `quantization/method.json` (dentro del repositorio)
- Manifiesto SHA-256 de la release: `MANIFEST.sha256` (dentro del repositorio)
- Exportador reproducible: `quantization/export_w8a16.py` (dentro del repositorio)
- Escalas seleccionadas: `quantization/selected-row-scales.bin` (dentro del repositorio)
