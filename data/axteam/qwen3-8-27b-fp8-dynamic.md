# axteam/Qwen3.8-27B-FP8-dynamic

## Resumen

Qwen3.8-27B-FP8-dynamic es una cuantización en FP8 (dinámica) del modelo multimodal Qwen3.8-27B de Qwen, realizada por axteam y orientada específicamente al despliegue eficiente con vLLM. El modelo base es un LLM denso con arquitectura híbrida (atención lineal más atención completa), capacidades de visión (image-text-to-text) y una cabecera de predicción multi-token (MTP). La cuantización emplea el esquema W8A8: pesos en FP8 E4M3 con escala por canal de salida y activaciones FP8 dinámicas por token, sin necesidad de calibración.

Su relevancia radica en que reduce el tamaño en disco de unos 54 GB (estimado en BF16 para 27,78 mil millones de parámetros) a unos 29,1 GB, manteniendo una fidelidad muy alta respecto al original: la perplexidad solo empeora un 0,5 % y el acuerdo top-1 del siguiente token se sitúa en el 97,3 %. Esto permite servir un modelo de 27B en una sola GPU de gama alta con buen throughput, conservando el modo de razonamiento (thinking), la entrada de imágenes y el tokenizador original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), densa, multimodal (vision), con cabecera MTP |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | no disponible (modelo denso: todos los parametros activos) |
| Longitud de contexto | no disponible en la ficha (los ejemplos de vLLM usan `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 dinamico (W8A8, FP8 E4M3 por canal de salida, activaciones FP8 por token); vision tower, MTP, normas, embeddings y LM head en BF16 |
| Idiomas soportados | no disponible (el conjunto de evaluacion interno incluye ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base, Qwen/Qwen3.8-27B, combina capas de atencion lineal con capas de atencion completa en una arquitectura hibrida, lo que reduce el coste de la KV-cache en secuencias largas. Es un modelo denso (no MoE) con capacidades multimodales: incorpora un vision tower y un proyector para entrada de imagen-texto, y una cabecera de prediccion multi-token (MTP) que puede acelerar la decodificacion. El chat template incluye por defecto el modo thinking (razonamiento explicito), desactivable mediante `chat_template_kwargs={"enable_thinking": False}`.

Esta version es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento, por lo que el comportamiento es fiel al original. El esquema es FP8 dinamico sin calibracion: los pesos usan FP8 E4M3 con una escala estatica por canal de salida (data-free), y las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Se mantienen en BF16 el vision tower y el proyector, la cabecera MTP, todas las RMSNorm, los embeddings de tokens, el LM head y las partes no lineales del modulo de atencion lineal (`conv1d`, `A_log`, `dt_bias`) para preservar la calidad. No hay informacion sobre datos de entrenamiento, numero de tokens ni RLHF/DPO en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional con chat template identico al original.
- Razonamiento con modo thinking activado por defecto (desactivable via `enable_thinking`).
- Comprension de imagenes: entrada multimodal image-text-to-text mediante mensajes `image_url` (URL o data URI).
- Prediccion multi-token (MTP) para acelerar la generacion.
- Arquitectura hibrida con atencion lineal, beneficiosa para contextos largos.
- Servible como API compatible con OpenAI mediante vLLM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades agenticas: no disponible en la informacion proporcionada.

## Casos de uso

- Servidor de inferencia autoalojado compatible con OpenAI: `vllm serve` levanta un endpoint en el puerto 8000 que cualquier cliente estandar puede consumir, ideal para sustituir APIs de pago en entornos privados.
- Analisis y descripcion de imagenes en aplicaciones: el pipeline image-text-to-text permite enviar imagenes por URL o data URI para generar descripciones, extraer informacion visual o responder preguntas sobre documentos escaneados.
- Chatbots con razonamiento: el modo thinking por defecto permite desplegar asistentes que razonan paso a paso en tareas complejas, con la opcion de desactivarlo para respuestas rapidas.
- Inferencia por lotes offline en Python: la API `llm.chat()` de vLLM permite procesar grandes volumenes de prompts (clasificacion, resumen, extraccion) sin exponer un servicio.
- Despliegue en una sola GPU de gama alta: con ~29,1 GB de pesos en FP8, el modelo cabe en una GPU con 40-48 GB de VRAM, reduciendo el coste de servir un 27B multimodal.
- Servido solo-texto con ahorro de memoria: anadiendo `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se libera el presupuesto de memoria del encoder de vision en cargas de trabajo puramente textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye medidas de fidelidad respecto al original BF16 (conjunto interno mixto ingles/coreano, 100 prompts, respuestas greedy):

| Metrica | Este modelo (FP8) | Original BF16 |
|---|---|---|
| Perplexity (menor = mas cercano) | 1,3651 | 1,3586 (+0,5 %) |
| Acuerdo top-1 siguiente token | 97,3 % | 99,4 % |

Estas metricas miden fidelidad al modelo base, no rendimiento en tareas absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~29,1 GB solo de pesos en FP8; con KV-cache BF16 y contexto moderado, se recomienda una GPU con 40-48 GB de VRAM. Con `--kv-cache-dtype fp8` la KV-cache se reduce aproximadamente a la mitad, facilitando contextos largos o batches grandes.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, H200 o RTX 6000 Ada/Blackwell de 48 GB. En consumer: una RTX 4090 (24 GB) no basta para los pesos completos; seria necesario offload o no es viable segun la informacion disponible.
- Consumer GPU: no cabe completo en GPUs de 24 GB; viable en GPUs de 32 GB solo si se gestiona cuidadosamente la KV-cache (por ejemplo, FP8 y contexto reducido), aunque no esta documentado oficialmente.
- Despliegue: vLLM (recomendado y objetivo de la cuantizacion, formato compressed-tensors `FP8_DYNAMIC`); llama.cpp y Ollama no son compatibles con este formato segun la informacion disponible. Requiere transformers con soporte de `qwen3_5` y compressed-tensors.
- Latencia y throughput: no disponibles; la cabecera MTP sugiere aceleracion de decodificacion, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Multimodal | Contexto | Licencia |
|---|---|---|---|---|---|
| axteam/Qwen3.8-27B-FP8-dynamic | 27,78 B (denso) | FP8 dinamico W8A8 | Si (vision) | no disponible (ejemplos con 32K) | Apache-2.0 |
| Qwen/Qwen3.8-27B (original) | 27,78 B (denso) | BF16 | Si (vision) | no disponible | Apache-2.0 |
| Qwen3-32B | 32,8 B (denso) | BF16 y cuantizaciones comunitarias | No (solo texto) | 32K (documentado para Qwen3) | Apache-2.0 |
| Qwen3-30B-A3B | 30,5 B (MoE, 3,3 B activos) | BF16 y cuantizaciones comunitarias | No (solo texto) | 32K (documentado para Qwen3) | Apache-2.0 |

Frente al original BF16, esta version ofrece el mismo comportamiento con ~29,1 GB en disco y fidelidad del 97,3 % top-1. Frente a Qwen3-30B-A3B (MoE), este modelo denso tiene mayor coste por token pero mayor ancho de computo por paso; los datos de contexto y benchmarks de los alternativos se indican segun documentacion publica de la familia Qwen3 y pueden no coincidir exactamente con la generacion Qwen3.8.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; hereda los del modelo base Qwen3.8-27B, cuya documentacion de sesgos no esta incluida en la informacion proporcionada.
- Riesgo de alucinacion: inherente a todo LLM; la cuantizacion FP8 introduce una desviacion minima (acuerdo top-1 del 97,3 % frente al original), pero no la elimina.
- Limitaciones de idioma: no hay lista oficial de idiomas soportados; el conjunto de evaluacion interno cubre ingles y coreano.
- La cuantizacion es PTQ sin calibracion con datos; en tareas muy sensibles a precision conviene validar contra el original BF16.
- El formato compressed-tensors `FP8_DYNAMIC` esta pensado para vLLM en hardware con soporte FP8 (Hopper/Ada o superior); la compatibilidad con otros runtimes no esta documentada.
- El modo thinking esta activado por defecto, lo que aumenta la longitud de las respuestas y el consumo de tokens; hay que desactivarlo explicitamente si no se desea.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, respetando los terminos de la licencia original de Qwen.
- Descargas muy bajas (39) y sin validacion comunitaria amplia: es una cuantizacion de terceros (axteam), no oficial de Qwen.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.8-27B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Paper, blog oficial o demos: no disponibles en la informacion proporcionada.
