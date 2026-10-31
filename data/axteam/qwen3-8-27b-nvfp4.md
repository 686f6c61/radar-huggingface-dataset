# axteam/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una versión cuantizada en 4 bits (NVFP4, W4A4) del modelo multimodal Qwen3.8-27B de Qwen, publicada por el usuario axteam en Hugging Face y orientada específicamente al despliegue eficiente con vLLM. El modelo base es un transformer híbrido (atención lineal + atención completa) de 27.781 millones de parámetros, denso, con capacidades de visión (image-text-to-text) y una cabeza de predicción multi-token (MTP). La cuantización es post-entrenamiento (PTQ), sin reentrenamiento, de modo que el comportamiento permanece fiel al original.

La relevancia de esta ficha radica en el perfil del cuantizado: los pesos y activaciones están en FP4 (E2M1) con grupos de 16 y escalas FP8 E4M3, pero el autor ha mantenido en BF16 la torre de visión, el proyector, la cabeza MTP, las normalizaciones, los embeddings, el LM head y toda la ruta de atención lineal (GatedDeltaNet/SSM), ya que FP4 resulta demasiado grueso para los pesos del SSM. El resultado ocupa unos 26,6 GB en disco y está pensado para aceleradores con soporte nativo de FP4 (por ejemplo, tensor cores de Blackwell como el B200).

Según las mediciones del autor, la fidelidad respecto al original BF16 es alta: la perplexity pasa de 1,3586 a 1,3980 (+2,9 %) y el acuerdo top-1 en predicción del siguiente token es del 93,8 %. El modelo se sirve vía `vllm serve` con API compatible con OpenAI y admite entrada de imágenes, thinking mode activado por defecto y KV-cache en FP8 opcional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parametros totales | 27.781.427.952 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en los ejemplos de despliegue (`--max-model-len 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos FP4 E2M1 agrupados en 16 con escala FP8 E4M3 por grupo y escala global FP32 por tensor; activaciones FP4; componentes sensibles (visión, MTP, norms, embeddings, LM head, ruta SSM) en BF16 |
| Idiomas soportados | No disponibles (el corpus de calibración es mixto con predominio de coreano; el original es de la familia Qwen, pero no hay lista oficial en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, formato compressed-tensors `nvfp4-pack-quantized` (28,6 GB en el repo; ~26,6 GB de pesos en disco) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, combina rutas de atención completa con un mecanismo de atención lineal basado en GatedDeltaNet (tipo SSM), lo que reduce el coste de memoria y cómputo en secuencias largas respecto a un transformer puro. Es un modelo denso (no MoE) de unos 27,8 mil millones de parámetros, con capacidades multimodales mediante una torre de visión y un proyector hacia el espacio del LM, y una cabeza de predicción multi-token (MTP) que puede acelerar la generación mediante decodificación especulativa multi-token.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la ficha disponible. En cuanto a la cuantización, se trata de una PTQ con NVFP4 (W4A4): los pesos FP4 E2M1 se agrupan en bloques de 16 con escalas FP8 E4M3 y una escala global FP32 por tensor, y las activaciones también se cuantizan a FP4 para aprovechar los tensor cores FP4 de la generación Blackwell (B200). La calibración se realizó con 256 muestras de un corpus mixto con predominio de coreano. Estratégicamente, se preservó en BF16 todo lo sensible a la precisión: la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, el LM head y la ruta completa de atención lineal (`linear_attn.*`). El tokenizador, el `chat_template` y el `generation_config` son idénticos a los del original; `config.json` solo añade el bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional, heredada íntegramente del modelo base Qwen3.8-27B (PTQ sin reentrenamiento).
- Comprensión de imágenes: pipeline image-text-to-text, acepta imágenes por URL o data URI en mensajes multimodales.
- Thinking mode activado por defecto en el chat template, desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Decodificación multi-token (MTP) heredada del modelo base, útil para acelerar la generación.
- Servicio vía API compatible con OpenAI (chat completions) mediante vLLM, con soporte de contexto hasta 32.768 tokens en los ejemplos de despliegue.
- KV-cache en FP8 opcional en tiempo de ejecución para reducir memoria en contextos largos o lotes grandes.
- Modo solo-texto: se puede omitir el presupuesto de memoria del codificador de visión con `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y multi-step reasoning: no disponible en la información proporcionada (más allá del thinking mode).

## Casos de uso

- Servidor LLM autoalojado con API OpenAI: `vllm serve` levanta un endpoint compatible con `/v1/chat/completions`, ideal para integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Despliegue en GPU con tensor cores FP4 (Blackwell, B200): la cuantización W4A4 está diseñada para exprimir el rendimiento nativo FP4 de estos aceleradores, reduciendo a la mitad el ancho de banda frente a W8A8.
- Análisis y descripción de imágenes en producción: el pipeline image-text-to-text permite enviar imágenes junto al texto (por URL o data URI) para generación de descripciones, extracción de información visual o moderación asistida.
- Chatbots con razonamiento extendido: el thinking mode activado por defecto permite respuestas con cadena de razonamiento; puede desactivarse por petición para reducir latencia en consultas simples.
- Atención al cliente multi-turno: con 32.768 tokens de ventana de contexto (configurable con `--max-model-len`) y KV-cache FP8 opcional, se pueden mantener conversaciones largas con coste de memoria contenido.
- Procesamiento por lotes offline en Python: la API `LLM(...).chat(...)` de vLLM permite ejecutar inferencia offline sobre colecciones de documentos o imágenes, útil para etiquetado de datos y generación de datasets sintéticos.
- Servicios de solo texto optimizados: en despliegues sin necesidad de visión, se descarga el presupuesto de memoria del codificador visual, liberando VRAM para contexto o concurrencia adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica mediciones de fidelidad respecto al original BF16 (100 prompts de un conjunto interno mixto inglés/coreano, respuestas greedy, mismo harness para ambas versiones):

| Métrica | Este modelo (NVFP4) | Original BF16 |
|---|---|---|
| Perplexity (menor = más fiel) | 1,3980 | 1,3586 (+2,9 %) |
| Acuerdo top-1 siguiente token | 93,8 % | 99,4 % |

Estas cifras miden fidelidad al modelo base, no puntuaciones absolutas en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 26,6 GB solo de pesos (formato NVFP4 con componentes BF16), más la KV-cache y la reserva del codificador de visión. Con KV-cache BF16 y contexto de 32.768 tokens, conviene disponer de una GPU de 48 GB o más; con `--kv-cache-dtype fp8` y modo solo-texto el requisito baja sensiblemente.
- GPU recomendadas: aceleradores con soporte nativo FP4 (tensor cores de Blackwell, como el B200) para aprovechar la cuantización W4A4; en GPUs sin soporte FP4 la inferencia puede no ser óptima o no estar soportada por vLLM (no disponible con más detalle).
- Consumer GPUs: no cabe cómodamente en GPUs de consumo habituales (24 GB como RTX 4090 quedan cortas con los ~26,6 GB de pesos); se recomienda hardware de centro de datos (A100/H100/GB200 o equivalentes de 48-80 GB).
- Despliegue: vLLM (vía `vllm serve` o la API Python `LLM`), formato compressed-tensors `nvfp4-pack-quantized` diseñado para vLLM. No hay soporte documentado para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor indica que W4A4 FP4 está pensado para máxima velocidad en tensor cores FP4, y la cabeza MTP del modelo base puede acelerar la generación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantización | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| axteam/Qwen3.8-27B-NVFP4 | 27,78 B | NVFP4 W4A4 (parcial BF16) | 32.768 (en despliegue) | Sí (visión) | Apache-2.0 |
| Qwen/Qwen3.8-27B (original) | 27,78 B | BF16 | No disponible | Sí (visión) | Apache-2.0 |
| Modelos equivalentes de la misma clase | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar con alternativas de terceros (por ejemplo, otros modelos densos multimodales de ~27 B cuantizados a FP4); no disponible.

## Limitaciones y advertencias

- La cuantización FP4 introduce una pérdida medible de fidelidad: +2,9 % de perplexity y un acuerdo top-1 del 93,8 % frente al 99,4 % del original BF16. En tareas muy sensibles a la precisión puede notarse.
- El corpus de calibración (256 muestras) tiene predominio de coreano, lo que podría sesgar la calidad de la cuantización hacia ese idioma frente a otros.
- El formato `nvfp4-pack-quantized` de compressed-tensors está orientado a vLLM y a hardware con FP4 nativo; no es un GGUF y no hay ruta documentada para llama.cpp, Ollama o ejecución en CPU.
- La ruta de atención lineal (SSM) permanece en BF16, por lo que el ahorro de memoria es menor que en una cuantización FP4 total.
- El modelo base hereda los sesgos y el riesgo de alucinación típicos de los LLM; al ser una PTQ, el perfil de alucinación es el del original, sin mitigaciones adicionales documentadas.
- Licencia Apache-2.0: permite uso comercial, pero los pesos, el tokenizador y el chat template originales pertenecen al equipo de Qwen; conviene revisar la licencia del modelo base enlazada.
- La descarga del repo es muy baja (49 descargas, 2 likes en el momento de la ficha): es una cuantización comunitaria sin respaldo oficial de Qwen, sin auditoría externa de calidad.
- Longitud máxima de contexto nativa del modelo base: no disponible; los ejemplos usan 32.768 tokens.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
