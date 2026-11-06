# batsclamp/Qwopus3.8-27B-Flash-V2-abliterated-FP8

## Resumen

Qwopus3.8-27B-Flash-V2-abliterated-FP8 es un derivado del modelo multimodal Jackrong/Qwopus3.8-27B-Flash-V2, publicado por el usuario batsclamp en Hugging Face. Se trata de una versión "abliterated": se ha eliminado el comportamiento de rechazo (refusal) mediante ortogonalización de pesos, sin reentrenamiento, y posteriormente se ha cuantizado a FP8 para su despliegue en vLLM. El modelo conserva la torre de visión y el drafter MTP (multi-token prediction) del original, lo que permite decodificación especulativa.

El modelo resuelve el problema de los rechazos excesivos en asistentes conversacionales: según la model card, reduce los rechazos del 100% al 0% en AdvBench held-out y del 94% al 0% en JailbreakBench harmful, y elimina el sobre-rechazo (24% a 0% en prompts benignos de JailbreakBench). Todo ello manteniendo, según el autor, el rendimiento en uso de herramientas (tool-eval-bench 91 vs 91), matemáticas y formato de tool calls.

Con 27.781 millones de parámetros y un repositorio de 52,6 GB (29,11 GiB en 8 shards), es relevante para despliegues privados donde el operador controla el acceso al modelo y necesita un asistente multimodal sin restricciones de contenido, con soporte de tool calling y agentes. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención híbrida (full-attention y linear-attention), torre de visión y drafter MTP; familia qwen3_5 |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base admite otras cuantizaciones, no detalladas |
| Idiomas soportados | no disponible (la model card menciona pruebas en inglés y ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, 8 shards) |

## Arquitectura y entrenamiento

El modelo parte de Jackrong/Qwopus3.8-27B-Flash-V2 (commit `13f92e09a46fa364f8de1edb85684d57bda01126`), un transformer multimodal de la familia qwen3_5 con atención híbrida: capas con full-attention y capas con linear-attention (`linear_attn.out_proj`). Incluye una torre de visión funcional y un drafter MTP para decodificación especulativa, con una longitud media de aceptación de 2,8 a 4,0 de 4 tokens según la salida.

La edición abliterated sigue el método de ablación de dirección de rechazo por ortogonalización de pesos (Arditi et al., 2024, arXiv:2406.11717), con direcciones por capa y el refinamiento de proyección propuesto por grimjim. No hay fine-tuning. El procedimiento: (1) 256 instrucciones dañinas (AdvBench) y 256 inofensivas (Alpaca), renderizadas con la plantilla de chat en modo con y sin thinking; (2) extracción de activaciones del residual stream en el último token del prompt de generación, promediadas por conjunto y modo; (3) cálculo de una dirección por capa como suma de las diferencias de medias entre dañinas e inofensivas en ambos modos; (4) proyección de esa dirección fuera del span de las dos medias inofensivas de la capa y normalización; (5) ortogonalización en las capas 22-55, sobre los dos escritores residuales de cada capa, afectando a 68 tensores. Posteriormente se aplicó la misma receta FP8 que en batsclamp/Qwopus3.8-27B-Flash-V2-FP8.

## Capacidades

- Generación de texto y razonamiento multi-paso, con niveles de `reasoning_effort` (incluido `xhigh`) y modo thinking activable.
- Comprensión de imagen y texto (pipeline image-text-to-text) mediante la torre de visión incluida.
- Tool calling y function calling, con parser `qwen3_coder` y plantilla `chat_template_qwen_xml.jinja`.
- Uso agéntico de herramientas evaluado con tool-eval-bench v2.0.6 (69 escenarios).
- Generación de código: escritura de ficheros Python a través de tool calls en streaming que compilan (29/30 a temperatura 1,0; 30/30 a 0,3).
- Matemáticas con cadena de pensamiento (GSM8K 8-shot CoT).
- Capacidades multilingües parciales: la model card reporta pruebas en inglés y ruso, sin listado oficial de idiomas.
- Decodificación especulativa con MTP (k=3) operativa tras la cuantización.
- Comportamiento sin rechazos: responde a peticiones que el modelo original declina, incluidas dañinas.

## Casos de uso

- Asistente conversacional privado sin restricciones de contenido: despliegue interno donde el operador controla la audiencia, aprovechando la eliminación de rechazos y sobre-rechazos para evitar fricción en consultas legítimas de seguridad, medicina o ficción.
- Automatización agéntica con herramientas: integración en pipelines que requieren tool calling fiable y resistencia a inyección de prompts, con el parser `qwen3_coder` y la plantilla XML de Qwen.
- Red teaming y evaluación de seguridad: uso como modelo "uncensored" de referencia para probar defensas, filtros y clasificadores frente a respuestas dañinas.
- Generación de código en producción: escritura de ficheros Python mediante tool calls en streaming que compilan, integrable en flujos de CI/CD con validación posterior.
- Análisis de documentos con imagen y texto: la torre de visión permite procesar capturas, diagramas o documentos escaneados junto a instrucciones textuales.
- Investigación sobre alineación y abliteration: estudio de la eliminación de direcciones de rechazo por capa y su efecto en sobre-rechazo, utilidad de herramientas y resistencia a inyección.
- Razonamiento matemático con CoT: resolución de problemas tipo GSM8K en modo thinking para tareas de análisis cuantitativo interno.

## Benchmarks y rendimiento

Datos de la model card, comparando el original FP8, la primera build y este modelo, en un DGX Spark (GB10) con vLLM nightly 2026-10-16, plantilla Qwen XML + `qwen3_coder` y MTP k=3.

| Benchmark | Original | First build | Este modelo |
|---|---:|---:|---:|
| AdvBench held-out (128), sin thinking, tasa de rechazo | 100% | 0,8% | 0% |
| JailbreakBench harmful (100), sin thinking, rechazo | 94% | 5% | 0% |
| JailbreakBench benign (100), sobre-rechazo | 24% | 0% | 0% |
| AdvBench held-out (50), thinking xhigh, rechazo | 98% | 6% | 6% |
| JailbreakBench harmful (50), thinking xhigh, rechazo | 96% | 2% | 4% |
| JailbreakBench benign (50), thinking xhigh, sobre-rechazo | 22% | 6% | 8% |
| tool-eval-bench v2.0.6 (69 escenarios) | 91 | 88 | 91 |
| GSM8K, 40 preguntas, 8-shot CoT | 85,0% | 85,0% | 92,5% |
| Python compilado vía tool call, temp 1,0 (30 llamadas) | - | 29/30 | 29/30 |
| Python compilado vía tool call, temp 0,3 (30 llamadas) | - | 30/30 | 30/30 |
| Decode, single stream, sin thinking | 11,1-11,7 tok/s | 11,2-11,5 tok/s | 11,6-12,4 tok/s |
| TTFT, prompt corto | 190-370 ms | 365-370 ms | 355-360 ms |

Resistencia a inyección de prompts (categoría K de tool-eval-bench, 3 ejecuciones por escenario): TC-57 pasa 2 de 3 y parcial 1; TC-58 pasa 3 de 3 (el original pasaba 3 de 3 y la primera build fallaba 3 de 3); TC-59, TC-60 pasan 3 de 3; TC-34 falla 3 de 3 en todas las versiones. El autor señala que el GSM8K del 92,5% está dentro del ruido entre ejecuciones con 40 preguntas y debe leerse como ausencia de pérdida.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa 29,11 GiB (31,3 GB) en 8 shards; se necesita al menos esa cantidad más overhead de KV cache y activaciones.
- GPU recomendadas: el autor valida en una DGX Spark (GB10); por tamaño, encaja en H100 80 GB, A100 80 GB y configuraciones multi-GPU con 40-48 GB por tarjeta.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin offload o sharding; requiere al menos dos GPU de 24 GB o una de 48 GB.
- Despliegue: vLLM (nightly 2026-10-16 validado) con `--tool-call-parser qwen3_coder`, plantilla `chat_template_qwen_xml.jinja` y MTP k=3; compatible con endpoints. No se documentan opciones llama.cpp, Ollama ni TGI para este checkpoint FP8.
- Latencia y throughput medidos: decode 11,6-12,4 tok/s en single stream sin thinking; TTFT 355-360 ms con prompt corto; aceptación MTP media 2,8-4,0 de 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| batsclamp/Qwopus3.8-27B-Flash-V2-abliterated-FP8 | 27,78 B | no disponible | Apache 2.0 | safetensors FP8 | Sin rechazos, visión y MTP |
| batsclamp/Qwopus3.8-27B-Flash-V2-FP8 | 27,78 B | no disponible | Apache 2.0 | safetensors FP8 | Original con rechazos; tool-eval-bench 91 |
| Jackrong/Qwopus3.8-27B-Flash-V2 | 27,78 B | no disponible | Apache 2.0 | safetensors | Modelo base multimodal |
| Alternativas abliterated de tamaño similar | no disponible | no disponible | no disponible | no disponible | Índice en abliteratedmodels.org (956 modelos), sin datos concretos de comparación |

## Limitaciones y advertencias

- El modelo responde a peticiones dañinas que el original declina; el autor advierte que solo debe desplegarse en entornos privados con control de acceso y que el operador es responsable del uso.
- Con thinking activado (`xhigh`) persisten rechazos residuales del 4-6% en conjuntos harmful y un 8% de respuestas vacías o sobre-rechazo en benignos, atribuido a reasoning que agota el presupuesto de 1.536 tokens en las pruebas.
- TC-34 de tool-eval-bench falla de forma consistente en todas las versiones, incluidas el original.
- La eliminación de rechazos puede degradar la calibración de seguridad y aumentar el riesgo de contenido dañino, incluida asistencia en ciberataques, dosis de medicamentos o instrucciones peligrosas.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks se limitan a GSM8K, tool-eval-bench y conjuntos de rechazo.
- Longitud de contexto e idiomas soportados no documentados; las pruebas multilingües se limitan a inglés y ruso.
- La cuantización FP8 puede introducir degradación no medida en tareas distintas de las evaluadas; el propio autor califica el GSM8K superior como ruido.
- El repositorio tiene 58 descargas y 0 likes, con validación limitada a un único entorno (DGX Spark, vLLM nightly); no hay garantía de soporte en otras versiones de vLLM.
- Licencia Apache 2.0 permite uso comercial, pero las implicaciones legales y éticas del contenido sin filtros recaen sobre el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batsclamp/Qwopus3.8-27B-Flash-V2-abliterated-FP8
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Versión FP8 sin abliteration: https://huggingface.co/batsclamp/Qwopus3.8-27B-Flash-V2-FP8
- Write-up del proceso: https://github.com/ageev/AI/blob/main/qwopus_abliterated.md
- Paper del método (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- tool-eval-bench: https://github.com/SeraphimSerapis/tool-eval-bench
- Índice de modelos abliterated: https://www.abliteratedmodels.org/
- Ficha en free2aitools: https://free2aitools.com/model/batsclamp/qwopus3.8-27b-flash-v2-fp8
