# CrossNow/Qwen3.8-27B-Uncensored

## Resumen

CrossNow/Qwen3.8-27B-Uncensored es una variante del modelo Qwen3.8-27B de Alibaba, modificada mediante una técnica de abliteración llamada Heretic para reducir sustancialmente el comportamiento de rechazo (refusal) ante peticiones dañinas. El modelo conserva intactas las capacidades del base: arquitectura `Qwen3_5ForConditionalGeneration`, 27.356 millones de parámetros, ventana de contexto de 262.144 tokens y soporte nativo de visión (image-text-to-text). El autor es CrossNow, que publica los pesos en bf16 bajo licencia Apache 2.0.

La relevancia de este modelo radica en que cuantifica con precisión el coste de eliminar la censura: la tasa de rechazos cae de 98/100 a 12/100 sobre 100 prompts dañinos, con una divergencia KL de solo 0,1191 frente al base y una pérdida media de 0,5 puntos en benchmarks de conocimiento. Es una herramienta de referencia para investigadores que estudian alineación, seguridad y el impacto de las técnicas de edición de pesos en modelos de razonamiento.

El checkpoint publicado incluye la cabeza de predicción multi-token (MTP) injertada de vuelta desde el checkpoint base, algo que la abliteración estándar elimina al re-serializar con transformers. Existe además una versión GGUF con cuantizaciones imatrix mantenida por JonathanColetti, y el modelo está disponible vía API en Wiro AI y en Cloudflare Workers AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer denso con torre de vision) |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 nativo; GGUF imatrix (Q4_K_M ~16,8 GB) via JonathanColetti |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 64 capas con vocabulario de 248.320 tokens, torre de vision integrada y una capa MTP (multi-token prediction) que habilita decodificacion especulativa. La modificacion principal es la abliteracion con Heretic, una herramienta que co-minimiza el numero de rechazos frente a la divergencia KL respecto al modelo base, sin fine-tuning ni datos de entrenamiento adicionales. Solo se modifican los tensores `attn.o_proj` y `mlp.down_proj` de 64 modulos cada uno, a precision bf16 completa (sin cuantizacion intermedia), y el LoRA resultante se fusiona en los pesos base.

Se ejecutaron 200 iteraciones de optimizacion, de las que resultaron 23 puntos no dominados en el frente de Pareto. El checkpoint publicado es el punto con menor numero de rechazos (12/100) con una KL de 0,1191. La cabeza MTP se copio verbatim desde el checkpoint base tras la fusion, y se verifico la integridad de los 15 tensores `mtp.*` antes de la subida. El modelo conserva el modo thinking por defecto en su chat template, desactivable con `enable_thinking=False`.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking opcional.
- Vision nativa: procesa imagenes y videos como modelo image-text-to-text.
- Decodificacion especulativa mediante la cabeza MTP de 1 capa.
- Contexto largo de 262.144 tokens para tareas de larga duracion.
- Reduccion drastica del rechazo ante prompts dañinos: 12/100 frente a 98/100 del base.
- Multilingue limitado a ingles y chino.
- Compatible con pipelines de agentes y tool calling del ecosistema Qwen (segun Cloudflare, disenado para workloads agénticos).

## Casos de uso

- Investigacion en alineacion y seguridad: permite estudiar el comportamiento de rechazo residual (12/100) y comparar el frente de Pareto de la abliteracion con 23 puntos publicados, ideal para medir el trade-off entre seguridad y utilidad.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o material narrativo con temas que los modelos censurados rechazan sistematicamente, aprovechando la ventana de 256K para novelas completas.
- Analisis de documentos largos con vision: procesar PDFs, capturas y videos extensos en un unico contexto de 262.144 tokens, sin perder la capacidad de razonamiento multi-paso.
- Agentes autonomos de larga duracion: el soporte de vision, contexto largo y decodificacion especulativa MTP lo hacen adecuado para pipelines agénticos que requieren observacion visual y planificacion prolongada.
- Despliegue en la nube sin gestion de infraestructura: disponible en Cloudflare Workers AI y en la API de Wiro AI, con los pesos en Apache 2.0 para uso comercial sin restricciones.
- Desarrollo de asistentes de codigo con prompts borderline: reduce los rechazos en peticiones de codigo ofensivo o de doble uso que los modelos alineados bloquean, manteniendo 83,3 en MMLU para conocimiento general.

## Benchmarks y rendimiento

Benchmarks 0-shot medidos con lm-evaluation-harness, ambos modelos en la misma sesion a bf16. No son comparables con los resultados publicados por Qwen (que usan few-shot), pero si directamente comparables entre si.

| Tarea | Base | Uncensored | Delta |
|---|---|---|---|
| MMLU | 83,4 | 83,3 | -0,2 |
| ARC-Challenge | 58,9 | 57,7 | -1,2 |
| HellaSwag | 82,8 | 82,9 | +0,1 |
| Winogrande | 76,1 | 75,3 | -0,8 |
| **Media** | | | **-0,5** |

| Medicion | Modelo base | Este modelo |
|---|---|---|
| Rechazos (100 prompts dañinos) | 98/100 | 12/100 |
| Divergencia KL vs base (primer token) | 0 | 0,1191 |

Todos los deltas estan dentro o cerca del error estandar reportado (MMLU ±0,30, ARC ±1,44, HellaSwag ±0,38, Winogrande ±1,21), por lo que ninguno es claramente separable del ruido. No se han publicado evaluaciones generativas (GSM8K, HumanEval), ni evaluaciones de la torre de vision o de la decodificacion MTP.

## Requisitos de hardware

- Inferencia bf16: aproximadamente 55 GB de VRAM, requiere GPU de clase A100 80GB, H100 o dos RTX 4090/5090 en paralelo.
- Inferencia cuantizada: el GGUF Q4_K_M de JonathanColetti pesa ~16,8 GB, cabe en una RTX 3090/4090 (24 GB) o en una RTX 4080 (16 GB) con cuantizaciones mas agresivas.
- Despliegue local: compatible con llama.cpp y Ollama (etiqueta GGUF disponible en el repositorio de GitHub), y con transformers para integraciones Python.
- Despliegue en produccion: vLLM y TGI para servidores de alta concurrencia; Cloudflare Workers AI y Wiro AI ofrecen API gestionada sin hardware propio.
- Latencia: no disponible. La cabeza MTP permite decodificacion especulativa, que reduce el tiempo por token frente a decodificacion autoregresiva estandar, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Rechazos/100 | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,4 B | 262.144 | 83,4 | 98/100 | Apache 2.0 |
| Qwen3.8-27B-Uncensored (este) | 27,4 B | 262.144 | 83,3 | 12/100 | Apache 2.0 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | propietaria |

La comparativa directa con el base es la unica con datos publicados. Qwen3.8-Max es la alternativa de mayor tamano de la familia, pero es propietaria y no se dispone de sus especificaciones. No hay datos publicados de otros modelos de 27B abliterados con la misma metodologia para comparar.

## Limitaciones y advertencias

- El rechazo no esta eliminado, solo reducido: 12 de 100 prompts dañinos siguen siendo rechazados. No es un modelo "sin censura" en sentido absoluto.
- Solo se evaluaron 4 benchmarks de conocimiento; no hay datos de GSM8K, HumanEval, matematicas, codigo ni evaluacion multilingue. Las capacidades de vision y MTP no estan medidas.
- ARC-Challenge es bajo (57,7) incluso en el base (58,9), lo que indica sensibilidad al formato en un modelo con tuning de razonamiento, no dano de la abliteracion.
- Idiomas limitados a ingles y chino; no hay soporte declarado para espanol ni otras lenguas.
- Riesgo legal y etico: el uso de un modelo con rechazo reducido para generar contenido dañino puede violar terminos de servicio de las plataformas de despliegue y legislacion local. Apache 2.0 permite uso comercial, pero no exime de responsabilidad legal.
- La divergencia KL de 0,1191 es una proxy de dano, no una certificacion de que las capacidades de razonamiento o codigo esten intactas.
- El modo thinking activado por defecto puede aumentar la latencia y el consumo de tokens; hay que desactivarlo explicitamente con `enable_thinking=False` si se requieren respuestas directas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CrossNow/Qwen3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF con cuantizaciones imatrix: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Demo interactiva: https://huggingface.co/spaces/JonathanColetti/Qwen3.8-27B-Uncensored-Demo
- Herramienta Heretic (abliteracion): https://github.com/p-e-w/heretic
- Dataset de prompts dañinos usado en la evaluacion: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- API en Wiro AI: https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
- Repositorio GitHub con etiqueta Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
- Ficha del modelo en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Documentacion de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
