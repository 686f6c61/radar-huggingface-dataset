# cpral/Poziomka-Instruct-2026-10-20-FP8

## Resumen

Poziomka-Instruct-2026-10-20-FP8 es una cuantización en FP8 del modelo instructivo Poziomka-Instruct-2026-10-20, publicada por el usuario cpral en Hugging Face. Se trata de un modelo de lenguaje de arquitectura MoE (mezcla de expertos) con 4.119.797.632 parámetros totales, derivado de la familia `bailing_moe` y especializado en polaco (`pl`), según los metadatos del repositorio.

El objetivo principal de esta variante es reducir el peso de los pesos de aproximadamente 8,2 GB en bf16 a unos 4,0 GB, de modo que el modelo pueda ejecutarse en una GPU de 16 GB junto con los componentes STT y TTS de un asistente de voz (proyecto `poziomka-dostaje-glos`). La cuantización se realizó con llm-compressor 0.14.0.1 usando el esquema `FP8_DYNAMIC` y el formato compressed-tensors, lo que permite cargarlo directamente en SGLang sin especificar el flag de cuantización.

La relevancia de esta ficha radica en que documenta un caso práctico de despliegue de un MoE instructivo en hardware de consumo (RTX 5080, sm_120) mediante SGLang, con advertencias explícitas del autor sobre la incorrección del forward en transformers 5.x y la ausencia de mediciones de calidad frente a la versión bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo `bailing_moe` (transformer con mezcla de expertos) |
| Parametros totales | 4.119.797.632 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) con esquema `FP8_DYNAMIC`; pesos con escala per canal de salida, activaciones per token dinámicas |
| Idiomas soportados | polaco (`pl`) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors con compressed-tensors (`quantization_config` en `config.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos identificada en los tags como `bailing_moe`. La cuantización afecta a todas las capas `nn.Linear` excepto `lm_head`: expertos MoE, expertos compartidos, atención (`query_key_value`, `dense`) y el MLP denso de la primera capa. Permanecen en bf16 los routeres MoE (`mlp.gate`), `expert_bias`, `lm_head`, los embeddings y las normalizaciones. El checkpoint incluye código personalizado (`modeling_bailing_moe_v2.py`) con parches para cargar en transformers 5.x (import `is_torch_fx_available`, RoPE `default`, `_tied_weights_keys`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La model card de esta variante cuantizada tampoco documenta innovaciones de decodificación especulativa ni mecanismos de atención lineal. El autor indica explícitamente que la calidad relativa al bf16 no ha sido medida todavía.

## Capacidades

- Generación de texto en polaco, orientada a instrucciones (modelo `Instruct`).
- Razonamiento y conversación multi-turno, con sampler recomendado en modo de respuesta rápida (temperature 0.6, top_p 0.9, min_p 0.05, frequency_penalty 0.15).
- Soporte de parser de razonamiento `qwen3` en SGLang (`--reasoning-parser qwen3`), lo que sugiere compatibilidad con formatos de pensamiento estructurado.
- Integración en un asistente de voz completo junto con módulos STT y TTS, según el proyecto de referencia del autor.
- Ejecución en SGLang con backend de atención Triton y backend de sampling PyTorch en GPUs Blackwell (sm_120).
- Capacidades de tool calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Asistente de voz en polaco: el modelo se integra con STT y TTS en una GPU de 16 GB gracias a que los pesos FP8 ocupan unos 4,0 GB, dejando margen para los demás componentes del pipeline.
- Despliegue en estaciones de trabajo con RTX 5080: el autor valida la ejecución en SGLang 0.5.22 sobre sm_120, lo que permite montar un servidor local de inferencia en hardware de consumo.
- Chatbot instructivo en polaco: el modelo responde a instrucciones y mantiene conversaciones multi-turno con el sampler recomendado por el autor.
- Servicio de inferencia con SGLang: al usar compressed-tensors, el servidor detecta la cuantización automáticamente y no requiere el flag `--quantization`, simplificando el despliegue.
- Prototipado de aplicaciones de razonamiento: el parser `qwen3` permite separar trazas de razonamiento de la respuesta final en el servidor.
- Investigación sobre cuantización FP8 en MoE: sirve como caso de estudio de un esquema `FP8_DYNAMIC` sin datos de calibración aplicado a expertos y atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la calidad respecto al modelo bf16 no ha sido medida.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,0 GB para los pesos FP8, frente a 8,2 GB en bf16.
- GPU validadas por el autor: RTX 5080 (Blackwell, sm_120) con SGLang 0.5.22.
- Cabe en GPUs de consumo de 16 GB, lo que permite coexistir con STT y TTS del asistente de voz.
- Opciones de despliegue: SGLang (recomendado, con `--trust-remote-code`); transformers 5.x no es fiable para forward según el autor.
- En Blackwell puede requerirse `--attention-backend triton --sampling-backend pytorch` y `SGLANG_ENABLE_JIT_DEEPGEMM=0` si los kernels FlashInfer no compilan con nvcc 13.4.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Poziomka-Instruct-2026-10-20-FP8 | 4.119.797.632 | no disponible | openmdw-1.1 | safetensors FP8 (compressed-tensors) | Variante cuantizada, solo polaco |
| Poziomka-Instruct-2026-10-20 (bf16) | no disponible | no disponible | openmdw-1.1 | safetensors bf16 | Modelo base, ~8,2 GB de pesos |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

## Limitaciones y advertencias

- El forward en transformers 5.x es incorrecto según el autor: el buffer RoPE `inv_freq` queda sin inicializar; debe usarse SGLang para inferencia.
- La calidad de la versión FP8 frente al bf16 no ha sido medida; no hay garantía de paridad.
- Modelo especializado únicamente en polaco; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Licencia openmdw-1.1: deben revisarse sus términos antes de uso comercial; no se detallan restricciones en la información proporcionada.
- Requiere `--trust-remote-code` por el código personalizado incluido.
- En Blackwell pueden ser necesarios ajustes específicos de backend y la desactivación de JIT DeepGEMM.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/cpral/Poziomka-Instruct-2026-10-20-FP8
- Modelo base: https://huggingface.co/cpral/Poziomka-Instruct-2026-10-20
- Proyecto de asistente de voz: https://github.com/adamo1139/poziomka-dostaje-glos
- llm-compressor: https://github.com/vllm-project/llm-compressor
