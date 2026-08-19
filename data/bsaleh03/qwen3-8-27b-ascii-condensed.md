# bsaleh03/Qwen3.8-27B-ASCII-Condensed

## Resumen

**Qwen3.8-27B-ASCII-Condensed** es una variante del modelo denso **Qwen3.8-27B** de Alibaba, publicada por el usuario bsaleh03, que reduce el vocabulario original de 248.320 a 129.006 entradas, conservando únicamente tokens ASCII (incluidos los 256 byte-fallback). El objetivo es liberar memoria de VRAM ocupada por las tablas de embeddings y la cabeza de salida, y destinar ese espacio a la caché KV, permitiendo así contextos de hasta **135.168 tokens** en una GPU de 16 GB (medido con una RTX 5070 Ti). No se trata de un fine-tuning ni de una destilación: los pesos son los de la cuantización `UD-IQ4_XS` de unsloth, y solo se han podado filas de las tablas de vocabulario, sin reentrenar ni requantizar nada.

La relevancia de este modelo es práctica: permite ejecutar un LLM de 27B con ventanas de contexto muy largas en hardware de consumo, algo que normalmente requeriría GPUs con mucha más memoria. La poda de vocabulario es una técnica de compresión que, en este caso, no altera el comportamiento sobre texto ASCII (el tokenizador produce salidas idénticas al modelo base), pero penaliza la tokenización de caracteres no ASCII (acentos, CJK, cirílico, etc.) con un coste adicional de tokens. Es una solución pensada para cargas de trabajo en inglés, código y datos técnicos, no para multilingüismo general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B, solo texto) |
| Parametros totales | 26.098.922.496 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 135.168 tokens máximo medido en 16 GB VRAM (con `-ctk q4_0 -ctv q4_0`); el modelo base soporta 262.144 tokens |
| Tipos de cuantizacion | `UD-IQ4_XS` (única publicada) |
| Idiomas soportados | ASCII completo (inglés, código, puntuación ASCII). Texto no ASCII representable vía byte-fallback, con sobrecoste de tokens |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo se construye a partir de la cuantización `UD-IQ4_XS` de `unsloth/Qwen3.8-27B-GGUF`, eliminando las filas de `token_embd` y `output` correspondientes a tokens no ASCII. La operación es un *row-gather* en espacio cuantizado: no hay dequantización ni requantización, por lo que los tensores supervivientes son bit-exactos respecto al original. Se reescriben los ficheros del tokenizador (`tokenizer.ggml.tokens`, `token_type`, `merges` y los ids de tokens especiales) para que coincidan con el vocabulario reducido. Se conservan los 276 tokens especiales y los 256 byte-fallback, y se filtran las reglas de fusión (merges) para que todas las supervivientes tengan padres supervivientes.

No ha habido entrenamiento adicional: no se aplicó RLHF, DPO ni ningún otro ajuste. La arquitectura subyacente es la del Qwen3.8-27B original, que incluye atención con ventana deslizante y soporte nativo para decodificación especulativa (MTP). El modelo base es multimodal (visión + texto), pero esta versión no incluye el proyector de visión (`mmproj`) y la vía multimodal no ha sido probada.

## Capacidades

- Generación de texto y código en inglés y lenguajes de programación (ASCII completo).
- Razonamiento y resolución de problemas matemáticos y lógicos, heredados del modelo base.
- Soporte de *tool calling* y *function calling* (capacidad del Qwen3.8-27B, no verificada específicamente en esta versión).
- Capacidades de agente y razonamiento multi-paso (el modelo base está diseñado para tareas agénticas).
- Decodificación especulativa (MTP) integrada, que acelera la generación ~1,8× a costa de reducir el contexto máximo disponible.
- Tokenización eficiente para texto ASCII: el tokenizador produce salidas idénticas al modelo base, token por token, en texto en inglés y código.
- Soporte de contexto ultralargo (hasta 135K tokens) en GPU de 16 GB con cuantización KV `q4_0`.

## Casos de uso

- **Procesamiento de documentos técnicos extensos**: análisis de repositorios de código, logs de sistemas o manuales de varios cientos de páginas en una sola pasada, gracias a la ventana de 135K tokens. El modelo puede resumir, extraer información o responder preguntas sobre el contenido completo sin necesidad de *chunking*.
- **Generación y revisión de código en pipelines de CI/CD**: integración como asistente de revisión de pull requests, donde el contexto largo permite cargar el diff completo y el historial relevante. La capacidad de *tool calling* (si se confirma) permitiría ejecutar comandos o consultar APIs.
- **Agentes conversacionales de atención al cliente en inglés**: gestión de conversaciones multi-turno con historial muy largo, manteniendo coherencia durante horas de interacción sin perder información previa.
- **Análisis de logs y depuración**: ingestión de grandes volúmenes de logs de aplicación o servidor para detectar patrones de error, correlacionar eventos y generar informes de incidencias.
- **Búsqueda y extracción de información en corpus técnicos**: consultas sobre documentación interna, normativas o especificaciones, con la capacidad de citar pasajes exactos gracias a la retención completa del contexto.
- **Asistente de programación en entornos con recursos limitados**: uso en portátiles con GPU de 16 GB (RTX 5070 Ti, 4090, etc.) para completar código, refactorizar o explicar fragmentos, sin necesidad de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión podada. El autor proporciona mediciones de rendimiento de inferencia y capacidad de contexto en una RTX 5070 Ti (16 GB), que se resumen a continuación.

**Contexto máximo medido con prompt real de 15K tokens:**

| `-ctk` / `-ctv` | bytes/token | max contexto |
|---|---|---|
| `q4_0` / `q4_0` | 18.432 | 135.168 |
| `q5_1` / `q4_0`* | 21.504 | 118.784 |
| `q8_0` / `q4_0`* | 26.624 | 98.304 |
| `q8_0` / `q8_0` | 34.816 | 77.824 |

\* Requiere llama.cpp parcheado; en builds estándar `-ctk` y `-ctv` deben coincidir.

**Throughput medido a `q4_0`/`q4_0` con `-c 135168`:**

| Profundidad de prompt | Prefill | Decode |
|---|---|---|
| 15K | 1.501 t/s | 47,3 t/s |
| 90K | 930 t/s | 33,1 t/s |

**Con MTP (decodificación especulativa):**

| `-ctk`/`-ctv` | max contexto con MTP |
|---|---|
| `q4_0`/`q4_0` | 77.824 |
| `q8_0`/`q8_0` | 49.152 |

## Requisitos de hardware

- **VRAM mínima**: 16 GB para alcanzar 135.168 tokens de contexto con cuantización KV `q4_0`. Con menos VRAM, el contexto máximo se reduce proporcionalmente.
- **GPU recomendadas**: RTX 5070 Ti (16 GB) es la tarjeta de referencia en las mediciones. También debería funcionar en RTX 4080/4090, RTX 5080, o GPUs profesionales de 16 GB o más (A100 40GB, etc.).
- **CPU**: la tabla de embeddings puede descargarse a RAM con `-ot "token_embd.weight=CPU"` para liberar VRAM adicional, con una penalización de ~1% en velocidad de decode.
- **Opciones de despliegue**: llama.cpp (o derivados como Ollama, LM Studio) con soporte GGUF. Para MTP se requiere una versión reciente con soporte de `--spec-type draft-mtp`.
- **Latencia y throughput**: decode de 33-47 t/s dependiendo de la profundidad del prompt (medido en RTX 5070 Ti). Prefill de 930-1.501 t/s.
- **Aviso importante**: en builds estándar de llama.cpp, `-ctk` y `-ctv` deben coincidir; si se usan tipos mixtos sin parche, se desactiva la atención flash y el prefill se ralentiza ~37× sin advertencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto máx. (16 GB) | Vocabulario | Licencia | Formato |
|---|---|---|---|---|---|
| **Qwen3.8-27B-ASCII-Condensed** | 26,1B | 135.168 | ASCII (129.006) | Apache 2.0 | GGUF |
| **Qwen3.8-27B (base)** | 26,1B | 114.688 (cuantizado sin podar) | 248.320 (multilingüe) | Apache 2.0 | Safetensors, GGUF |
| **Qwen3.8-27B (sin podar, misma cuantización)** | 26,1B | 114.688 | 248.320 | Apache 2.0 | GGUF |

La poda de vocabulario aporta un incremento de contexto de ~20.000 tokens (1,18×) respecto a la misma cuantización sin podar, manteniendo idéntica calidad en texto ASCII. La comparación con otros modelos de 27B (p. ej. Llama 3.3 70B o Mistral Large) no es directa porque estos no ofrecen versiones con poda de vocabulario para contexto largo en 16 GB. La ventaja principal es la combinación de tamaño (27B) con contexto ultralargo en hardware de consumo, algo que normalmente requiere modelos más pequeños o cuantizaciones más agresivas.

## Limitaciones y advertencias

- **Vocabulario limitado a ASCII**: cualquier texto con acentos, caracteres no latinos o símbolos no ASCII se tokeniza con sobrecoste (aprox. 2-3 tokens por carácter). No es adecuado para producción en idiomas distintos del inglés o el código.
- **Sin soporte de visión**: el modelo base es multimodal, pero esta versión no incluye `mmproj` y la vía de visión no ha sido probada. Solo es útil para texto.
- **Sin benchmarks de calidad**: no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares para esta versión. La calidad en tareas específicas no está verificada más allá de la equivalencia token a token en ASCII con el base.
- **Riesgo de alucinación**: inherente al modelo base, no mitigado por la poda. En contextos muy largos, la atención puede degradarse y aumentar la probabilidad de errores.
- **Dependencia de llama.cpp**: el uso de tipos de KV mixtos requiere un parche no estándar; en builds oficiales, `-ctk` y `-ctv` deben coincidir o se produce una degradación severa del rendimiento sin aviso.
- **Licencia**: Apache 2.0, permisiva para uso comercial, pero los pesos derivados de unsloth y Qwen mantienen sus respectivas atribuciones.
- **Sin garantías de mantenimiento**: es un proyecto de un usuario individual, con 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de soporte continuado.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/bsaleh03/Qwen3.8-27B-ASCII-Condensed)
- [Modelo base Qwen3.8-27B en HuggingFace](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Cuantiación GGUF de unsloth](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Documentación de Qwen3.8-27B en Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/)
