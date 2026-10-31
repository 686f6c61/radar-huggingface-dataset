# axteam/Qwen3.6-35B-A3B-FP8-dynamic

## Resumen

Qwen3.6-35B-A3B-FP8-dynamic es una versión cuantizada en FP8 (dynamic) del modelo Qwen3.6-35B-A3B de Qwen, producida por axteam específicamente para servir con vLLM de forma eficiente. El modelo base es un LLM multimodal (imagen-texto a texto) con arquitectura híbrida que combina atención lineal y atención completa, junto con un diseño de mezcla de expertos (MoE) de 256 expertos más un experto compartido, activando unos 3B de parámetros de los 35B totales en cada paso. Incluye además una cabeza de predicción multi-token (MTP) para acelerar la generación.

La relevancia de esta cuantización radica en que reduce el tamaño en disco de unos 71 GB (estimado en BF16) a unos 35,7 GB, permitiendo desplegar el modelo en una sola GPU de gama alta sin pérdida apreciable de calidad: la evaluación interna del autor muestra una perplexity de 1,3065 frente a 1,2934 del original BF16 (+1,0 %) y un 95,7 % de acuerdo top-1 en la predicción del siguiente token. Al tratarse de una cuantización post-entrenamiento sin recalibración (data-free), el comportamiento es fiel al modelo original y hereda su licencia Apache-2.0, lo que lo hace apto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), MoE (256 expertos + experto compartido), multimodal (vision), cabeza MTP |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | ~3B por token (de 35B totales, MoE) |
| Longitud de contexto | No disponible (el README sugiere servir con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 dynamic (W8A8: pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinamicas por token), formato compressed-tensors `FP8_DYNAMIC`; KV-cache en BF16 u FP8 opcional en runtime |
| Idiomas soportados | No disponibles (la evaluacion interna del autor uso un conjunto mixto ingles/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), tamano en disco ~35,7 GB (repo 38,4 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura hibrida que alterna capas de atencion lineal (con componentes no lineales conv1d, A_log y dt_bias tipicos de modelos tipo SSM/attention lineal) con capas de atencion completa, lo que reduce el coste de memoria y computo en contextos largos. El bloque feed-forward es un MoE con 256 expertos mas un experto compartido, activando aproximadamente 3B de parametros por token de los 35B totales, lo que permite alta capacidad con baja latencia. Incluye una cabeza de prediccion multi-token (MTP) y un tower de vision para entrada multimodal de imagen y texto.

Esta version es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento: pesos en FP8 E4M3 con escala estatica por canal de salida y activaciones FP8 dinamicas por token (sin calibracion, data-free). Se mantienen en BF16, para preservar calidad, la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head, el router MoE (`mlp.gate`), la gate del experto compartido y las partes no lineales de la atencion lineal. Tokenizer, chat template y generation config son identicos al original; solo se anade el bloque `quantization_config` al `config.json`.

## Capacidades

- Generacion de texto conversacional con modo thinking activado por defecto en el chat template (desactivable con `chat_template_kwargs={"enable_thinking": False}`).
- Comprension multimodal imagen-texto: acepta imagenes por URL o data URI mediante mensajes `image_url` en el formato de chat.
- Razonamiento multi-paso gracias al modo thinking y a la cabeza MTP (prediccion multi-token) que acelera la decodificacion.
- Generacion y comprension de codigo y matematicas: hereda las capacidades del modelo base Qwen3.6-35B-A3B (no hay benchmarks especificos publicados en la ficha).
- Soporte de tool calling / function calling: no disponible explicitamente en la informacion proporcionada (el pipeline es conversacional; el ecosistema Qwen3.6 habitualmente lo soporta, pero la model card no lo documenta).
- Eficiencia de inferencia: solo ~3B de parametros activos por token, lo que permite alto throughput en serving.
- Soporte de contexto largo mediante la combinacion de atencion lineal y completa, con opcion de KV-cache en FP8 para reducir memoria.

## Casos de uso

- Serving multimodal en produccion con vLLM: el formato compressed-tensors FP8_DYNAMIC esta disenado para vLLM; se despliega con un solo comando (`vllm serve`) exponiendo un servidor compatible con la API de OpenAI, ideal para integrar en aplicaciones existentes.
- Descripcion y analisis de imagenes en aplicaciones: al ser un modelo image-text-to-text, puede integrarse en flujos de moderacion de contenido, catalogacion de productos o asistencia visual, enviando imagenes como `image_url` en el mensaje.
- Chatbots con razonamiento: el modo thinking activado por defecto permite respuestas con razonamiento explicito multi-paso, util para asistentes tecnicos o de soporte complejo; puede desactivarse para respuestas rapidas.
- Despliegue en una sola GPU de gama alta: con ~35,7 GB en FP8 y solo ~3B de parametros activos, cabe en una GPU de 48 GB (o 80 GB con contexto largo y batches amplios), reduciendo el coste de infraestructura frente al original BF16.
- Procesamiento por lotes offline de documentos o imagenes: la API de Python de vLLM (`LLM.chat`) permite inferencia offline para tareas como extraccion de datos de imagenes o resumen masivo de textos.
- Serving text-only optimizado: para cargas puramente textuales, se puede omitir el presupuesto de memoria del encoder de vision con `--limit-mm-per-prompt '{"image": 0, "video": 0}'`, liberando VRAM para contexto o batch.
- Contextos largos con memoria contenida: combinando la atencion lineal del modelo base con `--kv-cache-dtype fp8`, se reduce a la mitad la memoria del KV-cache, adecuado para conversaciones extensas o RAG con muchos documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica mediciones de fidelidad respecto al original BF16 (conjunto interno mixto ingles/coreano, 100 prompts, respuestas greedy BF16, mismo harness para ambas versiones):

| Metrica | FP8 dynamic (este modelo) | Original BF16 |
|---|---|---|
| Perplexity (menor = mas cercano) | 1,3065 | 1,2934 (+1,0 %) |
| Acuerdo top-1 siguiente token | 95,7 % | 98,0 % |

Nota: estas metricas miden fidelidad a la cuantizacion, no rendimiento en tareas absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~35,7 GB solo de pesos (FP8); con KV-cache BF16 y contexto de 32k se recomienda una GPU de 48 GB como minimo, siendo mas comodo una de 80 GB. Con `--kv-cache-dtype fp8` la memoria del KV-cache se reduce aproximadamente a la mitad.
- GPU recomendadas: NVIDIA con soporte FP8 (H100, H200, A100 no soporta FP8 nativo; para A100 habria que usar variantes de peso 8 bits compatibles). En consumer, una RTX 5090 (32 GB) se quedaria corta para los pesos completos; una RTX PRO 6000 (96 GB) o GPUs de datacenter son opciones realistas.
- Consumer GPU: no cabe completa en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) con los pesos en FP8 (~35,7 GB); se necesitaria una cuantizacion mas agresiva (no publicada por este autor) o offload a CPU.
- Opciones de despliegue: vLLM (formato objetivo de esta cuantizacion, servidor compatible con OpenAI o inferencia offline en Python). No hay soporte documentado para llama.cpp, Ollama o TGGUF en esta ficha; el formato compressed-tensors no es GGUF.
- Latencia y throughput: no disponibles como cifras; al activar solo ~3B de parametros por token y contar con cabeza MTP, se espera baja latencia y alto throughput en comparacion con modelos densos de tamano similar.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Cuantizacion | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-FP8-dynamic (este) | ~35,95 B / ~3 B | FP8 dynamic (W8A8) | Si (imagen-texto) | Apache-2.0 | HuggingFace, vLLM |
| Qwen/Qwen3.6-35B-A3B (original) | ~35,95 B / ~3 B | BF16 | Si (imagen-texto) | Apache-2.0 | HuggingFace |
| Qwen3-30B-A3B (generacion anterior) | ~30 B / ~3 B | BF16 y derivados FP8 de terceros | Variante con vision disponible | Apache-2.0 | HuggingFace, amplio ecosistema |

Nota: los datos de la generacion anterior se ofrecen como referencia de categoria; verifica las fichas oficiales para detalles actualizados.

## Limitaciones y advertencias

- La cuantizacion FP8 dynamic requiere hardware con soporte nativo de FP8; en GPUs sin soporte (por ejemplo A100) el rendimiento puede degradarse o no funcionar con vLLM.
- Existe una perdida medible de fidelidad frente al BF16: +1,0 % de perplexity y un 95,7 % de acuerdo top-1 (frente a 98,0 % de una referencia interna del propio BF16); en tareas muy sensibles puede notarse.
- El conjunto de evaluacion de fidelidad es interno del autor (100 prompts, ingles/coreano), por lo que la calidad en castellano u otros dominios no esta verificada en la ficha.
- Idiomas soportados, longitud maxima de contexto real y soporte de tool calling no estan documentados en la model card; hay que consultar la ficha del modelo base Qwen/Qwen3.6-35B-A3B.
- El modo thinking esta activado por defecto, lo que genera razonamiento previo a la respuesta y aumenta el numero de tokens de salida; debe desactivarse explicitamente si se busca latencia minima.
- Al ser un modelo multimodal, vLLM reserva memoria para el encoder de vision aunque no se usen imagenes; en despliegues text-only conviene limitar la modalidad con `--limit-mm-per-prompt`.
- Riesgo de alucinacion: inherente a cualquier LLM; no hay mitigaciones documentadas en la ficha.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque los derechos sobre pesos, tokenizer y chat template originales pertenecen al equipo de Qwen.
- Advertencia del propio repositorio: es un modelo de terceros (axteam), no oficial de Qwen; la comunidad de descargas es muy pequena (34 descargas, 1 like en el momento de la ficha), por lo que conviene validar la calidad en tu propio caso de uso antes de pasar a produccion.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.6-35B-A3B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Paper, blog oficial, demo y repositorio de origen: no disponibles en la informacion proporcionada.
