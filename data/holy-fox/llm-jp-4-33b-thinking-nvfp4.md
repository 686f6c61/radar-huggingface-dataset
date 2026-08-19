# Holy-fox/llm-jp-4-33b-thinking-nvfp4

## Resumen

Holy-fox/llm-jp-4-33b-thinking-nvfp4 es una cuantización NVFP4 (W4A4) del modelo llm-jp-4-33b-thinking, desarrollado por el consorcio japonés llm-jp. El modelo original es un LLM de razonamiento (thinking) que genera respuestas en formato Harmony, con una fase de análisis previa a la respuesta final. Esta versión cuantizada reduce el peso del modelo de aproximadamente 62 GiB en bf16 a 20,1 GiB, lo que permite ejecutarlo en una única GPU consumer de 32 GB como la RTX 5090.

La cuantización se realizó con llm-compressor y compressed-tensors, manteniendo los embeddings y la cabeza de salida (lm_head) en bf16. El modelo está pensado para entornos de producción con vLLM, donde alcanza una velocidad de generación de unos 66 tokens por segundo en una RTX 5090. Es relevante porque democratiza el acceso a un modelo de razonamiento japonés de alto rendimiento en hardware asequible, aunque requiere GPUs Blackwell (sm_120) para aprovechar la aceleración FP4 nativa.

El modelo soporta los idiomas japonés e inglés, tiene una licencia Apache 2.0 y se distribuye en formato safetensors. Está diseñado para tareas de razonamiento, conversación y generación de texto, con un nivel de esfuerzo de razonamiento configurable (low, medium, high).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama) |
| Parametros totales | 19.567.089.536 (según safetensors; el nombre indica 33B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 16.384 tokens (configuración recomendada con vLLM; el modelo base soporta más, no especificado) |
| Tipos de cuantizacion | NVFP4 (W4A4), FP4 E2M1 con escala FP8 E4M3, group size 16 |
| Idiomas soportados | Japonés, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado NVFP4, con embed_tokens y lm_head en bf16) |

## Arquitectura y entrenamiento

El modelo base llm-jp-4-33b-thinking es un LLM de razonamiento que utiliza el formato de respuesta Harmony, donde los mensajes se estructuran en canales como `analysis`, `commentary` y `final`. La arquitectura sigue el diseño de los modelos Llama (attention completa, normalización RMSNorm, etc.), aunque no se especifican detalles adicionales como el número de capas o dimensiones ocultas. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, dataset, técnicas de alineación como RLHF o DPO).

La cuantización NVFP4 se realizó post-entrenamiento con llm-compressor 0.13.0, aplicando el algoritmo `QuantizationModifier` (RTN con calibración de escalas de activación). Se cuantizaron todas las capas `Linear` a FP4 (E2M1) con group size 16, mientras que `embed_tokens` y `lm_head` se mantuvieron en bf16. Las activaciones también se cuantizan dinámicamente a FP4 en tiempo de ejecución, con escalas globales precalibradas. Esta configuración permite un ahorro de memoria de aproximadamente el 67% respecto al modelo original en bf16.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo produce una cadena de análisis interna antes de la respuesta final, siguiendo el formato Harmony.
- Conversación multilingüe en japonés e inglés, con especial énfasis en el japonés.
- Nivel de esfuerzo de razonamiento configurable (`low`, `medium`, `high`) mediante `chat_template_kwargs`, permitiendo ajustar la profundidad del análisis.
- Soporte de tool calling limitado: aunque el modelo puede emitir llamadas a herramientas en el canal `commentary`, los parsers actuales de vLLM no interpretan correctamente este formato, por lo que la funcionalidad no es fiable en producción.
- Integración con vLLM mediante un reasoning parser personalizado (`llmjp4`) que separa el contenido de razonamiento de la respuesta final.
- Compatible con Open WebUI para chat estándar, siempre que se configure el modo de function calling en "Default" (basado en prompt).

## Casos de uso

- Asistente conversacional en japonés para atención al cliente: el modelo puede mantener diálogos multi-turno con contexto de hasta 16.384 tokens, adecuado para resolver consultas complejas con razonamiento previo. Su licencia Apache 2.0 permite integración comercial.
- Generación de código y explicaciones técnicas: gracias a su capacidad de razonamiento, puede desglosar problemas de programación paso a paso, útil para documentación o tutoría en entornos de desarrollo.
- Análisis y resumen de documentos largos en japonés: con la ventana de contexto configurada, puede procesar informes o artículos extensos y generar resúmenes razonados.
- Sistema de tutoría educativa: el modo `high` de reasoning effort permite explicaciones detalladas de conceptos matemáticos o científicos, adaptadas al nivel del estudiante.
- Prototipado rápido de aplicaciones de IA en japonés: al caber en una GPU consumer de 32 GB, es viable para desarrollo local y pruebas sin infraestructura cloud.
- Investigación en procesamiento de lenguaje natural japonés: al ser de código abierto y cuantizado, facilita experimentos de razonamiento y evaluación en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| Tamano del modelo | 20,1 GiB |
| Velocidad de generacion | ~66 tok/s (RTX 5090, single request) |
| Tiempo de carga de pesos | 2,4 s |
| KV cache disponible | 6,09 GiB (24.944 tokens) con `--max-model-len 16384` |

## Requisitos de hardware

- GPU recomendada: NVIDIA RTX 5090 (32 GB, sm_120) para aceleración FP4 nativa. También compatible con B100/B200 (sm_100).
- VRAM mínima: 32 GB para el modelo completo con KV cache. Con `--kv-cache-dtype fp8` se puede duplicar la capacidad de KV cache.
- GPUs con sm_120 inferior (por ejemplo, RTX 4090): vLLM hace fallback a cuantización W4A16 (solo pesos), lo que reduce el rendimiento pero permite ejecución.
- Despliegue recomendado: vLLM 0.27.1 con FlashInfer y el reasoning parser `llmjp4` incluido en el repositorio. También se puede usar Docker con la imagen `vllm/vllm-openai:v0.27.1`.
- Latencia: aproximadamente 15 ms por token (derivado de 66 tok/s) en una RTX 5090 con una sola petición.
- No se recomienda usar llama.cpp u Ollama, ya que no hay versiones GGUF y el formato Harmony requiere el parser específico.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Idiomas | Licencia | Hardware requerido |
|---|---|---|---|---|---|---|
| llm-jp-4-33b-thinking (original) | 33B (aprox.) | bf16 | no especificado | ja, en | Apache 2.0 | ~62 GiB VRAM (múltiples GPUs) |
| Holy-fox/llm-jp-4-33b-thinking-nvfp4 | 19,57B (según safetensors) | NVFP4 | 16.384 (config. recomendada) | ja, en | Apache 2.0 | 1 GPU 32 GB (Blackwell) |
| llm-jp-4-32b-a3b-thinking | 32B totales, 3B activos (MoE) | bf16 | 64K | ja, en | Apache 2.0 | ~64 GB VRAM (según llm-explorer) |

La principal ventaja de la versión NVFP4 frente al original es la reducción drástica de requisitos de memoria (de ~62 GiB a 20,1 GiB), permitiendo su uso en una sola GPU consumer. Sin embargo, pierde velocidad en GPUs no Blackwell y requiere configuración adicional en vLLM. El modelo MoE llm-jp-4-32b-a3b-thinking ofrece un contexto mayor (64K) y menor coste de inferencia por token activo, pero no está cuantizado y necesita más VRAM.

## Limitaciones y advertencias

- Requiere GPUs Blackwell (sm_120 o sm_100) para aprovechar la aceleración FP4 nativa. En GPUs más antiguas, el rendimiento cae significativamente al usar fallback W4A16.
- El tool calling no funciona correctamente con vLLM 0.27.1: los parsers integrados no interpretan el formato Harmony de llamadas a herramientas, por lo que las invocaciones se emiten como texto JSON en bruto.
- Es obligatorio usar streaming (`stream: true`) en las peticiones para separar el razonamiento (`reasoning`) de la respuesta final (`content`). En modo no streaming, ambos se mezclan.
- Se necesita un reasoning parser personalizado (`llmjp4`) que no viene incluido por defecto en vLLM; hay que configurarlo manualmente.
- La ventana de contexto máxima no está documentada para el modelo base; la configuración recomendada de 16.384 tokens puede ser inferior a la capacidad real.
- El modelo está optimizado para japonés e inglés; su rendimiento en otros idiomas no está garantizado.
- Al ser una cuantización, puede haber una ligera degradación en la calidad de generación respecto al modelo bf16 original, aunque no se han publicado evaluaciones comparativas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no especificadas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Holy-fox/llm-jp-4-33b-thinking-nvfp4
- Colección de modelos llm-jp-4: https://huggingface.co/collections/llm-jp/llm-jp-4-models
- Repositorio llm-jp-4-cookbook: https://github.com/llm-jp/llm-jp-4-cookbook
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking
