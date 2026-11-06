# maritaca-ai/S5-nano-FP8

## Resumen

S5-nano-FP8 es una versión cuantizada en FP8 del modelo S5-nano, desarrollado por Maritaca AI, un laboratorio brasileño especializado en modelos de lenguaje para portugués. El modelo base S5-nano es un transformer de tipo Qwen3.5 con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) y capacidades multimodales, ya que el repositorio incluye un encoder de visión. Esta variante FP8 reduce el peso del repositorio de 8,7 GB a 5,7 GB manteniendo la licencia Apache 2.0.

La cuantización se aplica únicamente a las capas lineales, que almacenan sus pesos en FP8 (formato E4M3) con una escala por bloque de 128×128. Las activaciones se cuantizan dinámicamente durante la inferencia, mientras que los embeddings, el encoder de visión y algunas proyecciones pequeñas permanecen en BF16. El modelo conserva la capa MTP (multi-token prediction) del original, lo que permite activar decodificación especulativa en vLLM.

Es relevante porque ofrece un modelo multimodal con contexto declarado de hasta 262.144 tokens (según el comando de servicio recomendado) en un formato optimizado para GPUs con soporte nativo de FP8 (arquitecturas Ada, Hopper y Blackwell), con soporte de tool calling, modo de razonamiento explícito y despliegue compatible con la API de OpenAI a través de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`), multimodal con encoder de vision y capa MTP |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (configuracion recomendada en vLLM); reducible a 32.768 en GPUs con menos memoria |
| Tipos de cuantizacion | FP8 (E4M3) en pesos de capas lineales con escala por bloque 128×128; activaciones cuantizadas dinamicamente; embeddings, encoder de vision y proyecciones pequenas en BF16 |
| Idiomas soportados | portugues (pt) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5, un transformer denso de aproximadamente 4,66 mil millones de parámetros con un encoder de visión integrado, lo que lo convierte en un modelo multimodal. Incluye una capa MTP (multi-token prediction) que habilita decodificación especulativa, configurable en vLLM mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. Esta variante FP8 no modifica la arquitectura: cuantiza los pesos de las capas lineales a FP8 E4M3 con escalas por bloque de 128×128 y cuantiza las activaciones de forma dinámica en tiempo de inferencia, dejando en BF16 los componentes sensibles (embeddings, encoder de visión y proyecciones pequeñas).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en el modelo base. La model card únicamente documenta el proceso de cuantización y las recomendaciones de despliegue. El modelo base está etiquetado como `base_model:maritaca-ai/S5-nano`, y esta variante como `quantized`.

## Capacidades

- Generación de texto y razonamiento con modo dual: modo Think (`enable_thinking: true`, activado por defecto) que expone el razonamiento en `choices[0].message.reasoning`, y modo Instant (`enable_thinking: false`) para respuestas directas.
- Procesamiento de imágenes mediante el encoder de visión incluido (puede desactivarse con `--language-model-only` para liberar memoria destinada al KV cache).
- Tool calling / function calling, con soporte en vLLM mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Soporte de agentes y razonamiento multi-paso, favorecido por el modo Think y el contexto largo.
- Capacidades multilingües limitadas a portugués e inglés según los metadatos del modelo.
- Decodificación especulativa mediante la capa MTP incluida.
- Salida estructurada compatible con la API de OpenAI a través del servidor vLLM (`/v1/chat/completions`).

## Casos de uso

- Atención al cliente en portugués: el modelo puede mantener conversaciones multi-turno con contexto de hasta 262.144 tokens, adecuado para historiales largos de soporte o documentación de producto adjunta, con respuestas en modo Instant para baja latencia.
- Asistentes con razonamiento verificable: el modo Think separa el razonamiento (`reasoning`) de la respuesta final (`content`), lo que permite auditar la cadena de pensamiento en aplicaciones de análisis financiero, legal o técnico.
- Automatización de agentes con tool calling: integrado en vLLM con parser `qwen3_coder`, puede invocar funciones externas en pipelines de automatización, orquestación de tareas o consultas a bases de datos.
- Procesamiento de documentos con imágenes: el encoder de visión permite extraer información de capturas, formularios escaneados o gráficos combinándolos con texto en una misma ventana de contexto.
- Generación y revisión de código en entornos de desarrollo: el soporte de tool calling y el modo de razonamiento permiten integrarlo en asistentes de IDE o pipelines de CI/CD para revisión automática y generación de parches.
- Despliegue en GPUs de gama profesional con FP8: al ocupar 5,7 GB en pesos, es viable en GPUs Ada (RTX 4090, L4), Hopper (H100) y Blackwell, con opción de reducir el contexto a 32.768 tokens para entornos con VRAM limitada.
- Extracción de información estructurada bilingüe (pt/en): clasificación, resumen y normalización de documentos en portugués e inglés con salida JSON mediante tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: 5,7 GB en FP8. El KV cache para 262.144 tokens requiere memoria adicional significativa; la model card recomienda `--max-model-len 32768` en GPUs con menos memoria.
- GPUs recomendadas: arquitecturas con soporte nativo de FP8, es decir, Ada (RTX 4090, L4, L40S), Hopper (H100) y Blackwell. En GPUs sin FP8 nativo (Ampere, Turing) el rendimiento puede degradarse por emulación.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen para KV cache; en GPUs de 16 GB conviene reducir el contexto a 32.768 tokens y valorar `--language-model-only`.
- Opciones de despliegue: vLLM es el método documentado por el autor, con flags para parser de razonamiento (`--reasoning-parser qwen3`), tool calling y decodificación especulativa MTP. No se documentan otros motores (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa con 3 tokens MTP está soportada y puede mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| S5-nano-FP8 (este) | ~4,66 B | hasta 262.144 tokens | Apache 2.0 | safetensors FP8 | Version cuantizada; repo 5,7 GB; multimodal; MTP |
| S5-nano (base) | ~4,66 B | hasta 262.144 tokens (segun card del base) | Apache 2.0 | safetensors BF16 | Version original; repo 8,7 GB; mismo rendimiento esperado con mas VRAM |
| Alternativas de ~4-5 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

La comparación directa más fiable es con el propio S5-nano en BF16: misma arquitectura y capacidades, con una reducción de 3 GB en pesos a costa de requerir soporte FP8 nativo para máximo rendimiento.

## Limitaciones y advertencias

- Idiomas: solo portugués e inglés según los metadatos; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; el modo Think no elimina este riesgo y debe validarse la salida en producción.
- La cuantización FP8 puede introducir degradación numérica frente al modelo BF16 original; no se publican evaluaciones comparativas de calidad.
- Requiere GPUs con soporte nativo de FP8 (Ada, Hopper, Blackwell) para aprovechar el formato; en otras arquitecturas el rendimiento puede ser inferior al esperado.
- El contexto de 262.144 tokens exige VRAM considerable para el KV cache; en GPUs de gama media debe reducirse a 32.768 tokens.
- Los parámetros de generación recomendados difieren entre modos (Think: temperature 1.0, top_p 0.95; Instant: temperature 0.7, top_p 0.8) y el `generation_config.json` no incluye `presence_penalty`, que debe enviarse en cada petición.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base S5-nano y de los datos de entrenamiento originales.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maritaca-ai/S5-nano-FP8
- Modelo base S5-nano: https://huggingface.co/maritaca-ai/S5-nano
- Documentación de vLLM (despliegue): https://docs.vllm.ai
