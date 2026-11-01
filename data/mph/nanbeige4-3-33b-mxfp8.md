# mph/Nanbeige4.3-33B-MXFP8

## Resumen

Nanbeige4.3-33B-MXFP8 es una versión cuantizada en MXFP8 del modelo Nanbeige4.3-33B, publicado por el usuario mph en HuggingFace. El modelo base, desarrollado por Nanbeige, es un transformer decoder-only de tipo Llama (`LlamaForCausalLM`) con 33.118.977.024 parámetros, 52 capas de decodificador, dimensión oculta de 7168 y una ventana de contexto nativa de 524.288 tokens. Esta ficha describe la variante cuantizada, que mantiene la licencia Apache 2.0 del original.

La cuantización se ha realizado con NVIDIA TensorRT Model Optimizer (ModelOpt) v0.47.0, almacenando pesos y activaciones en FP8 (E4M3) con una escala compartida de potencia de dos (E8M0) cada 32 elementos. Este esquema reduce el peso de los pesos a aproximadamente la mitad respecto a BF16 (unos 34 GB) manteniendo una precisión cercana gracias al escalado de grano fino, y no requiere conjunto de calibración porque las escalas son dinámicas.

Su relevancia actual radica en que permite desplegar un modelo de 33B con contexto muy largo en una única GPU de 40 GB o más (por ejemplo, A100 80 GB, H100 o GPUs Blackwell), a costa de requerir hardware Blackwell para cómputo MXFP8 nativo. Está orientado a generación de texto conversacional con soporte de razonamiento y tool calling, en inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (`LlamaForCausalLM`), 52 capas, hidden size 7168 |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 524.288 tokens (nativa) |
| Tipos de cuantizacion | MXFP8 (FP8 E4M3 con escala E8M0 compartida cada 32 elementos); embeddings, `lm_head` y RMSNorms en BF16; KV cache en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 36,5 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de arquitectura Llama con 52 capas de decodificador y dimensión oculta de 7168, lo que da lugar a los 33.118.977.024 parámetros totales. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO sobre el checkpoint base; esos datos corresponden a la model card del modelo original Nanbeige4.3-33B, no incluida en la información proporcionada.

La innovación técnica de esta variante es la cuantización MXFP8 realizada con ModelOpt v0.47.0. Se cuantizan las capas lineales del decodificador: atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y MLP (`gate_proj`, `up_proj`, `down_proj`). Quedan en BF16 los embeddings (`model.embed_tokens`), `lm_head`, las RMSNorms y la KV cache (`kv_cache_quant_algo` es nulo). Las escalas son dinámicas, por lo que el export no usa conjunto de calibración. El cómputo MXFP8 nativo requiere GPUs NVIDIA Blackwell (SM100/SM120).

## Capacidades

- Generación de texto conversacional multi-turno con contexto nativo de 524.288 tokens.
- Modo de razonamiento (`enable_thinking`), activado por defecto en la plantilla de chat.
- Soporte de tool calling / function calling mediante `tool_call_format`, con XML como formato por defecto.
- Razonamiento multi-paso y flujos de agente gracias a la combinación de thinking mode y tool calls.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Compatibilidad con text-generation-inference y endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales muy largos gracias a sus 524.288 tokens de contexto, manteniendo el hilo de la conversación sin truncar.
- Análisis de documentos extensos: resumen y extracción de información de contratos, informes o código fuente que superen cientos de miles de tokens en una sola pasada.
- Agentes con tool calling: integración en pipelines donde el modelo decide qué función invocar (APIs, bases de datos) usando el formato XML de tool calls y el modo de razonamiento para planificar.
- Asistentes de código en producción: generación y revisión de código con contexto de repositorio completo, desplegado con vLLM o SGLang y parsers de razonamiento y tool calling de Qwen3.
- Despliegue en una sola GPU: al ocupar los pesos unos 34 GB, puede servirse en una GPU de 40 GB o más, lo que facilita entornos de inferencia con recursos acotados frente a la versión BF16.
- Servicios bilingües inglés-chino: traducción, soporte y generación de contenido para usuarios de ambos idiomas.
- Procesamiento por lotes de alto rendimiento: con tensor parallelism y prefix caching en vLLM se puede atender alta concurrencia con contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 34 GB; hay que añadir margen para la KV cache en BF16, que crece con la longitud de contexto y la concurrencia.
- Cómputo MXFP8 nativo: requiere NVIDIA Blackwell (SM100/SM120).
- GPU recomendadas: una GPU de 40 GB o más puede alojar los pesos; para contextos largos o alta concurrencia se recomienda tensor parallelism con varias GPU (A100 80 GB, H100, Blackwell).
- GPU de consumo: no se documenta soporte en GPUs de consumo; el esquema MXFP8 y el tamaño de pesos lo hacen poco adecuado para tarjetas de 24 GB o menos.
- Despliegue: vLLM (`--quantization modelopt_mxfp8`, `--attention-backend FLASHINFER`) y SGLang (`--attention-backend flashinfer`), ambos con `--dtype bfloat16` y parsers `qwen3` / `qwen3_coder`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MXFP8 | 33,1B | 524.288 | MXFP8 (E4M3 + E8M0) | Apache 2.0 | HuggingFace (mph) |
| Nanbeige4.3-33B (base) | 33,1B | 524.288 | BF16 | Apache 2.0 | HuggingFace (Nanbeige) |
| Alternativas de 33B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el checkpoint base del que deriva; no se han proporcionado datos de otros modelos comparables ni de rendimiento relativo.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de tasas de alucinación para este checkpoint.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base ni de la cuantización.
- Cuantización: aunque MXFP8 mantiene la precisión cerca de BF16, puede haber degradación en tareas sensibles; no se aportan métricas de la pérdida de calidad respecto al modelo original.
- Hardware: el cómputo MXFP8 nativo exige GPUs Blackwell; en hardware anterior el rendimiento puede no ser óptimo.
- Contexto: aunque la ventana nativa es de 524.288 tokens, la KV cache en BF16 para contextos muy largos requiere memoria adicional significativa y puede forzar tensor parallelism.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Nanbeige4.3-33B y de las dependencias de ModelOpt.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/mph/Nanbeige4.3-33B-MXFP8
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- NVIDIA TensorRT Model Optimizer (ModelOpt): https://github.com/NVIDIA/TensorRT-Model-Optimizer
