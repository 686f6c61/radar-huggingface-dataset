# konstbet/Hy-MT3-1.8B-ONNX

## Resumen

Hy-MT3-1.8B-ONNX es una conversión a formato ONNX del modelo de traducción automática tencent/Hy-MT3-1.8B, publicada por el usuario konstbet. El modelo original lo desarrolla Tencent y está especializado en traducción multilingüe, cubriendo más de 100 idiomas según la lista de etiquetas de la model card. Esta versión ONNX está pensada para ejecutarse en el navegador mediante Transformers.js sobre WebGPU, lo que la convierte en una opción poco habitual para traducción neuronal de calidad en entornos cliente.

La conversión emplea cuantización int4 con escalas en float16 (dtype `q4f16`) y operadores fusionados de ONNX Runtime GenAI, lo que reduce el peso del repositorio a 1,1 GB. La arquitectura del modelo base es `HunyuanDenseV1ForCausalLM`, un transformer denso de 1.800 millones de parámetros. La licencia es Apache-2.0, heredada del modelo original, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en que permite desplegar traducción multilingüe de alta cobertura directamente en el navegador, sin servidor ni backend, algo útil para aplicaciones web que necesitan privacidad o funcionamiento offline. No obstante, la información pública disponible sobre el modelo base es limitada en esta ficha: no se detallan aquí datos de entrenamiento, benchmarks ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (HunyuanDenseV1ForCausalLM) |
| Parametros totales | 1.800 millones (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (q4f16); escalas en float16; block_size=32; accuracy_level=4 |
| Idiomas soportados | Más de 100 idiomas (zh, en, es, fr, de, it, pt, ru, ar, hi, ja, ko, yue, entre otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (formato externo de datos en un único chunk) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo causal LM identificado como `HunyuanDenseV1ForCausalLM`, con 1.800 millones de parámetros. La conversión a ONNX utiliza ONNX Runtime GenAI 0.17.1, que tiene soporte nativo para esta arquitectura. Se aplican operadores fusionados: `GroupQueryAttention`, `RotaryEmbedding`, `SimplifiedLayerNormalization` / `SkipSimplifiedLayerNormalization`, `MatMulNBits` para las matrices en 4 bits y `GatherBlockQuantized` para el embedding de tokens. La dimensión simbólica `kv_cache_dim` se fija en la dimensión estática de cabeza (128) para que Transformers.js pueda construir la caché KV vacía en la primera pasada de decodificación.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original. La model card de esta conversión no documenta esos extremos; solo describe el proceso de conversión y el uso. El template de chat se incluye como `chat_template.jinja` independiente y también embebido en `tokenizer_config.json`, porque Transformers.js solo lee la plantilla desde ese archivo. El `config.json` incluye `transformers.js_config` con `use_external_data_format` y `kv_cache_dtype` en float16.

## Capacidades

- Traducción automática multilingüe entre más de 100 idiomas, incluyendo pares de bajos recursos como ceb, war, ckb, ug, bo o yue.
- Generación de texto causal (el pipeline es `text-generation`, no un pipeline de traducción dedicado en esta build).
- Instrucciones de traducción mediante prompt en lenguaje natural, con control del formato de salida (por ejemplo, pedir solo el resultado traducido).
- Ejecución en navegador mediante Transformers.js y WebGPU, sin backend.
- Soporte de decodificación determinista (`do_sample: false`) y control de `max_new_tokens`.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Traducción en el navegador con privacidad: el modelo se ejecuta en el cliente vía WebGPU, de modo que el texto del usuario no sale del dispositivo; adecuado para aplicaciones de mensajería o documentos sensibles.
- Extensiones de navegador para traducción de páginas o selecciones: al cargarse con Transformers.js, puede integrarse en una extensión sin servidor de inferencia.
- Aplicaciones web offline o PWA: el repositorio de 1,1 GB puede cachearse y usarse sin conexión, útil en entornos con conectividad limitada.
- Traducción de contenido multilingüe de larga cola: su cobertura de más de 100 idiomas permite atender idiomas minoritarios que otros modelos no cubren.
- Prototipado rápido de funciones de traducción: el código de ejemplo con `pipeline("text-generation", ...)` permite integrar la traducción en pocas líneas en un frontend JavaScript.
- Preprocesado o localización de textos en herramientas de desarrollo: traducción de cadenas de interfaz o documentación dentro de una aplicación web sin depender de una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio pesa 1,1 GB en int4, por lo que la huella de pesos ronda ese orden de magnitud, más caché KV y overhead del runtime.
- GPU recomendadas: el destino principal es WebGPU en navegador; en escritorio se recomienda una GPU integrada moderna o dedicada con soporte WebGPU (por ejemplo, arquitecturas recientes de AMD, Intel o NVIDIA). No hay datos oficiales de compatibilidad con A100, H100 o RTX 4090 para esta build.
- Cabe en GPU de consumo: sí, por tamaño (1,8B en int4), aunque la ejecución objetivo es el navegador, no un servidor con CUDA.
- Opciones de despliegue: Transformers.js con `device: "webgpu"` y `dtype: "q4f16"`; también puede ejecutarse con ONNX Runtime GenAI en otros entornos, aunque esta build está optimizada para WebGPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-ONNX (esta ficha) | 1,8B | no disponible | >100 | Apache-2.0 | ONNX (int4) |
| tencent/Hy-MT3-1.8B (original) | 1,8B | no disponible | >100 | Apache-2.0 | safetensors |
| Alternativas de traducción en navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con otros modelos de traducción, por lo que la comparativa se limita a la relación con el modelo base.

## Limitaciones y advertencias

- La información sobre el modelo base (entrenamiento, sesgos, benchmarks) no está incluida en esta ficha; conviene consultar la model card de tencent/Hy-MT3-1.8B.
- Al ser una build cuantizada a int4, puede haber una degradación de calidad respecto al modelo original en float16 o bfloat16, especialmente en idiomas de bajos recursos.
- El pipeline declarado es `text-generation`, no `translation`; la traducción se induce mediante instrucciones en el prompt, lo que exige cuidar el formato y puede producir salidas con explicaciones adicionales si no se restringe.
- Riesgo de alucinación y de deriva en textos largos; no se documenta la longitud de contexto soportada.
- La ejecución en navegador depende de WebGPU; navegadores o dispositivos sin soporte no podrán usarla.
- Aunque la licencia Apache-2.0 permite uso comercial, deben respetarse las condiciones heredadas del modelo base y las de los datos de entrenamiento originales, no detalladas aquí.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que su validación comunitaria es muy limitada.

## Enlaces

- [Hugging Face: konstbet/Hy-MT3-1.8B-ONNX](https://huggingface.co/konstbet/Hy-MT3-1.8B-ONNX)
- [Modelo base: tencent/Hy-MT3-1.8B](https://huggingface.co/tencent/Hy-MT3-1.8B)
- [Documentación de Transformers.js](https://huggingface.co/docs/transformers.js)
- [ONNX Runtime GenAI](https://github.com/microsoft/onnxruntime-genai)
