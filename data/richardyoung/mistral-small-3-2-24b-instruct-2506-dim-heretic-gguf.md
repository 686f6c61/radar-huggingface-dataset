# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic-GGUF

## Resumen

Este repositorio contiene builds en formato GGUF del modelo `richardyoung/Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic`, una variante "abliterated" (con la dirección de rechazo eliminada) de `mistralai/Mistral-Small-3.2-24B-Instruct-2506`. La ablación se realizó con Heretic 2.0 mediante sustracción de la dirección de rechazo por diferencia de medias (difference-in-means, DiM), con hiperparámetros ajustados por búsqueda automática. El autor es Richard J. Young y los pesos se publican bajo licencia Apache 2.0.

El modelo conserva la arquitectura y el tamaño del Mistral Small 3.2 original (23.572.403.200 parámetros, aproximadamente 24B), pero modifica el comportamiento de rechazo: según la model card, el porcentaje de rechazo sobre 972 prompts dañinos reservados cae del 73,6 % en el original al 28,5 % en esta variante. La divergencia KL de primer token respecto al original es de 0,093, lo que indica que la intervención es relativamente contenida en la distribución de salida.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantización listo para `llama.cpp` y Ollama; por otro, es un objeto de estudio sobre abliteración, su medición y las defensas frente a ella. El autor declara explícitamente que no está pensado como asistente de propósito general, sino para investigación. Los ficheros GGUF publicados no fueron evaluados en el artículo citado y la cuantización puede alterar el comportamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Mistral Small 3.2; detalles de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M (14,3 GB, por defecto), IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0 (anunciadas; IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan importance matrix) |
| Idiomas soportados | Inglés (`en` según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado desde safetensors bf16 con `convert_hf_to_gguf.py` y `llama-quantize`) |

## Arquitectura y entrenamiento

El modelo parte de Mistral Small 3.2 24B Instruct 2506, un transformer denso de aproximadamente 23,57B parámetros. Sobre esos pesos se aplicó una ablación de la dirección de rechazo mediante difference-in-means (DiM) con Heretic 2.0, que busca hiperparámetros minimizando los rechazos por palabra clave en un conjunto de desarrollo de 100 prompts, sujeto a una restricción de divergencia KL de primer token menor o igual a 0,1 respecto al modelo original. El trial seleccionado logró 35 rechazos por palabra clave en esos 100 prompts y una KL de 0,093.

La conversión a GGUF se realizó con `llama.cpp` (commit `468fde9`): primero `convert_hf_to_gguf.py --outtype bf16` y después `llama-quantize`, todo en CPU. Los ficheros cuantizados con importance matrix usan `calibration_datav3` (128 fragmentos de 512 tokens) calculada sobre el build Q8_0; Q6_K y Q8_0 son estáticos. Cada fichero Q4_K_M se cargó y respondió a un prompt de prueba antes de subirse. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Mistral Small 3.2 Instruct.
- Comportamiento de rechazo reducido: cumple muchas peticiones que el original rechaza (28,5 % de rechazo frente a 73,6 % en la evaluación del modelo completo en bf16).
- Ejecución local en CPU y GPU mediante `llama.cpp` y Ollama, con distintos niveles de cuantización.
- Compatible con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Solo texto: el proyector de visión del modelo base no está incluido en estos GGUF, aunque Mistral Small 3.2 acepta imágenes en su versión completa.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado en la información proporcionada para esta variante.
- Capacidades multilingües: la model card declara únicamente inglés.

## Casos de uso

- Investigación sobre abliteración: comparar la tasa de rechazo y la divergencia KL entre el modelo original, la variante DiM y sus cuantizaciones para estudiar cómo la cuantización afecta al comportamiento de rechazo.
- Evaluación de defensas frente a la eliminación de rechazo: usar el modelo como sujeto de pruebas en pipelines de red teaming y clasificadores de seguridad.
- Experimentos de calibración de cuantización: los ficheros con importance matrix permiten medir el impacto de IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M frente a los estáticos Q6_K y Q8_0 en tareas de clasificación de rechazo.
- Despliegue local de referencia en Ollama: `ollama run richardyoung/mistral-small-3.2-24b-instruct-2506-dim-heretic` ofrece un punto de partida reproducible para comparativas en hardware de consumo.
- Estudio de fidelidad respecto al original: la KL de 0,093 permite analizar qué se conserva y qué se pierde al aplicar la ablación, útil para investigar métodos de intervención en el espacio de activaciones.
- Reproducibilidad de artefactos: los SHA-256 en `SHA256SUMS` y la descripción del pipeline de conversión permiten replicar los builds y auditar la cadena safetensors → GGUF.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo completo en bf16, no a los GGUF:

| Métrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos reservados (juez WildGuard) | 73,6 % | 28,5 % (277/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | No disponible | 35 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | No aplica | 0,093 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni para el modelo base ni para esta variante. Los ficheros cuantizados no fueron evaluados en el artículo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,3 GB para Q4_K_M; alrededor de 20 GB o más para Q8_0 (tamaño exacto no disponible); IQ3_M e IQ4_XS serían inferiores a Q4_K_M, aunque sus tamaños no se detallan.
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M encaja en GPUs de 16 GB o más (RTX 4080, RTX 4090, A100 40 GB, H100); Q8_0 requiere 24 GB o más.
- GPU de consumo: Q4_K_M cabe en RTX 4090 (24 GB) y en tarjetas de 16 GB con margen ajustado; las cuantizaciones IQ3_M e IQ4_XS facilitarían su uso en GPUs de 12 GB, aunque no se confirman tamaños.
- Opciones de despliegue: `llama.cpp` (`llama-cli`), Ollama (`ollama run`), y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints alojados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (GGUF, Q4_K_M) | 23,57B | No disponible | No evaluado en GGUF (28,5 % en bf16) | Apache 2.0 | GGUF |
| `mistralai/Mistral-Small-3.2-24B-Instruct-2506` (original) | 23,57B | No disponible | 73,6 % | Apache 2.0 | Safetensors |
| `richardyoung/Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic` (bf16) | 23,57B | No disponible | 28,5 % | Apache 2.0 | Safetensors |

No se dispone de datos de benchmarks estándar ni de otras variantes abliterated comparables en la información proporcionada. Las alternativas de la misma categoría (modelos de ~24B abliterated) no están documentadas aquí.

## Limitaciones y advertencias

- El autor declara que el modelo no es un asistente de propósito general y que se publica para investigación sobre eliminación de rechazo y sus defensas.
- El modelo cumple muchas peticiones que el original rechaza; su uso en producción conlleva riesgos de seguridad y de cumplimiento normativo que recaen en el usuario.
- Los GGUF no fueron evaluados en el artículo: la cuantización puede cambiar el comportamiento de rechazo respecto a los valores de bf16 (28,5 % de rechazo).
- Solo texto: el proyector de visión no está incluido, aunque el modelo base acepta imágenes.
- Idioma declarado: únicamente inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto no disponible en la información proporcionada.
- Riesgo de alucinación y sesgos: no cuantificados en la información disponible; se heredan los del modelo base, sin evaluación específica.
- Licencia Apache 2.0 permite uso comercial, pero las restricciones de uso del modelo fuente deben consultarse en su model card; el autor remite a ella.
- La fecha de creación del repositorio (2026-11-11) y la referencia al artículo son datos de la model card; el enlace arXiv aún no está disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic-GGUF
- Modelo base abliterated (bf16): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic
- Modelo original de Mistral: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Artículo citado: Young, R. J., *Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors* (enlace arXiv pendiente de añadir según la model card)
- Heretic: no se proporciona enlace en la información disponible
- `llama.cpp`: no se proporciona enlace en la información disponible
