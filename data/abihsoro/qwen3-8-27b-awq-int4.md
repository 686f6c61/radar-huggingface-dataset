# abihsoro/Qwen3.8-27B-AWQ-INT4

## Resumen

El modelo `abihsoro/Qwen3.8-27B-AWQ-INT4` es una cuantización AWQ de 4 bits (W4A16, group_size=128, simétrica) del modelo base `Qwen/Qwen3.8-27B`, generada por el usuario abihsoro con la librería `llm-compressor`. Su propósito es ofrecer una versión eficiente en memoria y cómputo de un modelo de 27B de parámetros, que en el momento de su creación carecía de cuantizaciones comunitarias AWQ o GPTQ utilizables. El autor la produjo en una única GPU RTX 5090 y la publica con licencia Apache 2.0.

La relevancia de este modelo radica en que permite ejecutar un LLM de gran tamaño en hardware de consumo con una huella de memoria reducida (un único archivo `model.safetensors` de aproximadamente 17,6 GB), manteniendo un rendimiento competitivo en tareas de razonamiento matemático, como muestran sus resultados en GSM8K. Además, incorpora un parche en la plantilla de chat para alinear el nivel de esfuerzo de razonamiento `"high"` con el valor `"xhigh"` definido en el modelo base.

La arquitectura subyacente es híbrida, con 48 capas de atención lineal GDN (Gated Delta Net), según se menciona en la documentación, y una ventana de contexto máxima de 98 304 tokens. No se dispone de información oficial sobre el número exacto de parámetros ni sobre los idiomas soportados, aunque el nombre sugiere 27B y es probable que herede el multilingüismo del modelo Qwen original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con atención lineal (GDN/linear-attention), según documentación del autor; no se dispone de detalle oficial |
| Parametros totales | 27B (según nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | 98 304 tokens (configurado en el comando de serving vLLM) |
| Tipos de cuantizacion | AWQ INT4 (W4A16), group_size=128, simétrica |
| Idiomas soportados | no disponible (probablemente multilingüe por herencia del modelo base, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, un único archivo `model.safetensors` de ~17,6 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantización de 4 bits del checkpoint `Qwen/Qwen3.8-27B`, realizada con `llm-compressor`. El esquema de cuantización es W4A16 con group_size=128 y escalado simétrico, aplicado a las capas `Linear` excepto `lm_head`, capas visuales y ciertos gates de MLP. La calibración se realizó sobre 256 muestras del dataset `HuggingFaceH4/ultrachat_200k`.

Una limitación técnica importante documentada por el autor es que las 48 capas GDN/linear-attention recibieron una cuantización de grupo estándar en lugar del smoothing AWQ completo, debido a un fallo de `llm-compressor` al calibrar las capas `Qwen3_5GatedDeltaNet`. Esto afecta potencialmente a la calidad en tareas de razonamiento de contexto largo, aunque no se ha confirmado. Además, se parcheó la plantilla de chat para que el nivel de esfuerzo `"high"` se asigne al valor `"xhigh"`, que es el máximo definido en el modelo base.

No se dispone de información sobre el entrenamiento original del modelo base (datos, tokens, método de alineación, etc.).

## Capacidades

- Inferencia eficiente en 4 bits con formato `compressed-tensors`, compatible con vLLM.
- Soporte de tool calling y razonamiento estructurado, habilitado en el comando de serving mediante `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--reasoning-parser qwen3`.
- Ventana de contexto larga de hasta 98 304 tokens, útil para tareas que requieren procesar documentos extensos o historiales de conversación amplios.
- Razonamiento matemático: resultados destacados en GSM8K (96% flexible-extract y 89% strict-match en la evaluación del autor).
- Capacidades multilingües: no confirmadas, aunque es probable que herede el soporte del modelo Qwen base.
- Modo de razonamiento con niveles de esfuerzo (`"xhigh"` como máximo, con alias para `"high"`).

## Casos de uso

- Despliegue en producción con vLLM: el modelo se sirve fácilmente con el comando proporcionado, aprovechando `--kv-cache-dtype fp8` y `--enable-prefix-caching` para optimizar la latencia y el throughput en entornos con una sola GPU de alta gama.
- Asistentes conversacionales con contexto largo: gracias a su ventana de 98K tokens, puede mantener conversaciones multi-turno extensas o procesar documentos completos sin truncamiento.
- Agentes autónomos con tool calling: el soporte de `--enable-auto-tool-choice` y el parser `qwen3_coder` permiten integrarlo en pipelines de agentes que invocan funciones externas.
- Razonamiento matemático y resolución de problemas: sus resultados en GSM8K lo hacen adecuado para aplicaciones educativas o de análisis cuantitativo, donde se requiere precisión en pasos intermedios.
- Procesamiento de código: el parser de herramientas `qwen3_coder` sugiere capacidad para generación y edición de código, aunque no se han publicado benchmarks específicos de HumanEval.
- Evaluación de modelos en entornos con recursos limitados: al ocupar solo ~17,6 GB de VRAM, permite ejecutar un modelo de 27B en GPUs consumer como la RTX 5090 (32 GB) o la RTX 4090 (24 GB) con configuraciones ajustadas.

## Benchmarks y rendimiento

El autor evaluó el modelo contra `cyankiwi/Qwen3.6-27B-AWQ-INT4` en una RTX 5090, usando `lm-evaluation-harness` (local-chat-completions, `max_gen_toks=2048`, 100 muestras) y pruebas de throughput directas. Los resultados son los siguientes:

| Métrica | Qwen3.6-27B-AWQ-INT4 | Qwen3.8-27B-AWQ-INT4 (este repo) |
|---|---|---|
| pp512 (tokens/s) | ~3 300 | 3 349 |
| tg128 (tokens/s) | 77,1 | 74,9 |
| GSM8K flexible-extract | 79% | 96% |
| GSM8K strict-match | 78% | 89% |
| KV cache @ 98 304 ctx (tokens) | 188 059 | 237 924 |
| Concurrencia @ 98 304 ctx | 1,91x | 2,42x |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~17,6 GB para los pesos cuantizados, más la memoria de KV cache. Con la configuración de vLLM recomendada (`--gpu-memory-utilization 0.90`) y `--kv-cache-dtype fp8`, es viable en GPUs con 24 GB o más.
- GPU recomendadas: RTX 5090 (32 GB) validada por el autor; RTX 4090 (24 GB) podría funcionar con límites de contexto reducidos o menor concurrencia.
- Opciones de despliegue: vLLM (documentado), posiblemente compatible con llama.cpp y Ollama si se convierte a GGUF, aunque no se menciona en la documentación.
- Rendimiento observado: 3 349 tokens/s en fase de prefijo (pp512) y 74,9 tokens/s en generación (tg128) en la RTX 5090.
- Latencia: no se proporcionan valores específicos de latencia por petición.

## Comparativa con modelos similares

La comparativa directa disponible es con la cuantización AWQ del modelo anterior `Qwen3.6-27B-AWQ-INT4` (cyankiwi). Ambos comparten tamaño y esquema de cuantización, pero el modelo 3.8 muestra mejor rendimiento en GSM8K y mayor capacidad de KV cache, aunque con una ligera caída en velocidad de generación.

| Modelo | Parámetros | Contexto | Cuantización | GSM8K (strict) | Velocidad tg128 | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.6-27B-AWQ-INT4 | 27B | no disponible | AWQ INT4 | 78% | 77,1 tok/s | Apache 2.0 |
| Qwen3.8-27B-AWQ-INT4 (este) | 27B | 98 304 | AWQ INT4 | 89% | 74,9 tok/s | Apache 2.0 |

No se dispone de comparaciones con otros modelos de 27B cuantizados (p. ej., Llama 3.3 70B o Mistral Large) en la información proporcionada.

## Limitaciones y advertencias

- Regresión no resuelta en tareas de descomposición de tareas de contexto largo respecto al baseline 3.6, posiblemente debida a la falta de smoothing AWQ en las capas GDN.
- Las 48 capas de atención lineal recibieron cuantización de grupo simple, no AWQ completo, lo que puede degradar la calidad en ciertos escenarios.
- El parche del chat template (alias `"high"` a `"xhigh"`) es una modificación no oficial que podría no ser compatible con todos los clientes.
- Cuantización auto-producida por un usuario individual, sin validación amplia de la comunidad ni soporte oficial del equipo Qwen.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del inglés; se recomienda evaluar en el dominio de uso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no verificadas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/abihsoro/Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de `llm-compressor` (referencia del autor): no se proporciona enlace directo en la información disponible.
