# kingjones777/KAT-Coder-V2.5-Dev-Abliterated-MTP-ROCmFP4-GGUF

## Resumen

KAT-Coder-V2.5-Dev-Abliterated-MTP-ROCmFP4-GGUF es una cuantización especializada del modelo de código KAT-Coder-V2.5-Dev, desarrollado por Kwaipilot (equipo de IA de Kuaishou), adaptada por kingjones777 para ejecutarse en hardware AMD con soporte ROCmFP4/ROCmFPX. El modelo base es un Mixture-of-Experts (MoE) de 35 505 millones de parámetros totales con 3 mil millones activos por token, construido sobre la base Qwen3.6-35B-A3B. Esta versión concreta incluye dos modificaciones clave: un bloque de predicción multi-token (MTP) para decodificación especulativa y el proceso de "abliteración" que elimina los rechazos de contenido, resultando en un modelo sin censura para tareas de programación.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de código de alto rendimiento en hardware AMD de gama alta (APU Ryzen AI Max+ 395 / Radeon 8060S) con cuantizaciones optimizadas para ROCm y Vulkan. Los archivos GGUF publicados permiten ejecutar el modelo en dos backends desde un mismo binario, con mediciones de velocidad y uso de memoria detalladas. Es una opción interesante para desarrolladores que trabajan con GPUs AMD y necesitan un modelo de código capaz de resolver tareas agénticas en repositorios ejecutables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con bloque MTP (Multi-Token Prediction) |
| Parametros totales | 35 505 251 456 (35,5 B) |
| Parametros activos | 3 B por token |
| Longitud de contexto | No disponible (en los ejemplos de uso se configura 8192 tokens, pero el maximo del modelo base no se especifica) |
| Tipos de cuantizacion | ROCmFP4 / ROCmFPX (tipos ggml 100-119): Q4_0_ROCMFP4_COHERENT, Q4_0_ROCMFP4_STRIX_LEAN, Q6_0_ROCMFPX_AGENT, Q6_0_ROCMFPX_LEAN |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev es un MoE con 35 B de parámetros totales y 3 B activos por token, derivado de Qwen3.6-35B-A3B. Se trata de un modelo de solo texto, sin componente multimodal, entrenado específicamente para tareas de ingeniería de software autónoma en repositorios ejecutables. El proceso de post-entrenamiento fue realizado por Kwaipilot y los pesos se distribuyen en formato Transformers, compatibles con vLLM, SGLang y KTransformers.

La versión cuantizada que nos ocupa añade tres capas de modificación sobre el original: primero, la cuantización ROCmFP4/ROCmFPX, que emplea tipos de tensor ggml personalizados (100-119) no soportados por llama.cpp estándar; segundo, la inclusión de un bloque MTP que permite decodificación especulativa con hasta 4 tokens adelantados; y tercero, la abliteración, que elimina los mecanismos de rechazo de contenido del modelo, dando como resultado una salida sin censura. El autor de la cuantización, kingjones777, no entrenó el modelo, sino que se limitó a construir la escalera de cuantización, el binario dual-backend (HIP/ROCm y Vulkan) y las mediciones de rendimiento.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de ingeniería de software en repositorios completos.
- Razonamiento y resolución de problemas de programación: el modelo alcanza 69,40 % en SWE-bench Verified, lo que indica capacidad para resolver issues reales de repositorios.
- Decodificación especulativa mediante bloque MTP: acelera la generación de texto en un solo paso, con mejoras de +6,5 % en Vulkan y +8,9 % en ROCm según las mediciones del autor.
- Soporte para agentes y flujos multi-paso: el modelo está diseñado para tareas agénticas, aunque el autor recomienda desactivar la especulación MTP en conversaciones multi-turno para no perder rendimiento end-to-end.
- Ejecución dual-backend: un mismo archivo GGUF puede cargarse tanto en HIP (ROCm) como en Vulkan, seleccionable en tiempo de ejecución mediante el flag `-dev`.
- Salida sin censura (abliterated): el modelo no aplica rechazos de contenido, lo que puede ser útil para casos de uso donde se requiere libertad de generación.

## Casos de uso

- Desarrollo de código asistido en entornos locales: el modelo puede integrarse en editores o IDEs mediante servidores tipo `llama-server` para autocompletado y generación de funciones, aprovechando la decodificación especulativa para reducir la latencia en tareas de un solo turno.
- Resolución de issues en repositorios: gracias a su rendimiento en SWE-bench Verified, puede emplearse como motor de un agente que navegue por el código, identifique bugs y proponga parches, ejecutándose en hardware AMD de gama alta sin necesidad de GPU NVIDIA.
- RAG y prefill de prompts largos: la variante ROCm (HIP) ofrece velocidades de prefill de hasta 478 tok/s, lo que la hace adecuada para sistemas de recuperación con contexto extenso, como asistentes que consultan documentación técnica.
- Generación de código en entornos con restricciones de hardware: las cuantizaciones Q4_0 (17,88 GiB y 18,93 GiB) caben en APUs con memoria unificada de 128 GB, permitiendo ejecutar un modelo de 35B en equipos portátiles de alta gama.
- Pruebas de integración y pipelines de CI/CD: el modelo puede actuar como generador de tests o como revisor de código, invocándose mediante API HTTP desde scripts de automatización, gracias a su compatibilidad con endpoints.
- Investigación sobre decodificación especulativa: el bloque MTP y las mediciones publicadas ofrecen un banco de pruebas para estudiar el impacto de la predicción multi-token en diferentes backends y cuantizaciones.

## Benchmarks y rendimiento

El modelo base KAT-Coder-V2.5-Dev alcanza un 69,40 % en SWE-bench Verified según los resultados publicados por Kwaipilot. No se dispone de otros benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 69,40 % |

En cuanto al rendimiento de inferencia, el autor de la cuantización publicó mediciones en un AMD Ryzen AI Max+ 395 / Radeon 8060S (gfx1151) con 128 GB de memoria unificada, ROCm 7.2.4 y Mesa 25.2.8. Los datos más destacados son:

| Tier | Backend | Velocidad en code (tok/s) | Prefill (tok/s) | GTT |
|---|---|---|---|---|
| Q4_0 STRIX_LEAN | Vulkan0 | 80,76 | 260 | 18,6 GiB |
| Q4_0 STRIX_LEAN | ROCm0 | 79,47 | 478 | 19,1 GiB |
| Q4_0 COHERENT | Vulkan0 | 75,69 | 246 | 19,1 GiB |
| Q4_0 COHERENT | ROCm0 | 76,00 | 405 | 20,1 GiB |
| Q6_0 AGENT | Vulkan0 | 56,85 | 229 | 34,8 GiB |
| Q6_0 AGENT | ROCm0 | 59,14 | 219 | 31,9 GiB |

Estas cifras corresponden a un solo equipo y condiciones específicas (temperatura 0, 400 tokens, mediana de 12 ejecuciones), por lo que deben tomarse como referencia orientativa.

## Requisitos de hardware

- Hardware de referencia: AMD Ryzen AI Max+ 395 / Radeon 8060S (gfx1151) con 128 GB de memoria unificada y ROCm 7.2.4.
- Tamaños de archivo: Q4_0_COHERENT (18,93 GiB), Q4_0_STRIX_LEAN (17,88 GiB), Q6_0_AGENT (30,89 GiB), Q6_0_LEAN (26,94 GiB).
- VRAM estimada: los archivos Q4_0 requieren entre 18 y 20 GiB de memoria GTT; los Q6_0 entre 27 y 35 GiB. En una APU con memoria unificada de 128 GB caben sin problema; en GPUs discretas se necesitaría una tarjeta con al menos 24 GB para las versiones Q6.
- GPU recomendadas: APU AMD Strix Halo (gfx1151) o GPUs AMD Radeon compatibles con ROCm (gfx1100, gfx1030, etc.) y Vulkan. No se menciona soporte para NVIDIA, aunque el formato GGUF podría cargarse con un build adaptado.
- Despliegue: requiere un build especial de llama.cpp/llama-server del repositorio ROCmFPX (https://github.com/charlie12345/ROCmFPX) con `GGML_HIP=ON` y `GGML_VULKAN=ON`. El binario resultante permite seleccionar backend con `-dev Vulkan0` o `-dev ROCm0`.
- Latencia y throughput: velocidades de decodificación entre 51 y 81 tok/s según la cuantización y el backend; prefill entre 219 y 478 tok/s.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes en la información proporcionada para establecer una tabla objetiva con otros modelos de código de tamaño similar (por ejemplo, Qwen2.5-Coder-32B o DeepSeek-Coder-V2). El modelo base KAT-Coder-V2.5-Dev se posiciona en el segmento de MoE eficientes con 3B activos, y su resultado de 69,40 % en SWE-bench Verified es competitivo, pero no se pueden contrastar cifras de otros modelos sin fuentes adicionales.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de rechazos de contenido puede producir respuestas ofensivas, sesgadas o inapropiadas. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Requiere un build no estándar de llama.cpp: los archivos GGUF usan tipos de tensor (100-119) que el llama.cpp oficial rechaza. Es imprescindible compilar desde el repositorio ROCmFPX, lo que añade complejidad de despliegue.
- Solo texto: el modelo base no incluye componentes multimodales; no puede procesar imágenes ni audio.
- Contexto limitado en los ejemplos: aunque el modelo base podría soportar ventanas largas, los comandos de ejemplo usan `-c 8192`; no se ha verificado el máximo real.
- Sin garantías de rendimiento en otros hardware: las mediciones se realizaron en un único equipo AMD; los resultados pueden variar en otras configuraciones.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor de esta cuantización no es el desarrollador del modelo original; se debe respetar la atribución a Kwaipilot y a jakeroxs.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código incorrecto o inventar APIs; se recomienda validación humana en entornos de producción.

## Enlaces

- Repositorio de HuggingFace de esta cuantización: https://huggingface.co/kingjones777/KAT-Coder-V2.5-Dev-Abliterated-MTP-ROCmFP4-GGUF
- Modelo base (Kwaipilot/KAT-Coder-V2.5-Dev): https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Checkpoint abliterado con MTP (jakeroxs): https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF
- Repositorio de compilación ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Artículo de presentación de KAT-Coder-V2.5-Dev en HackerNoon: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
- Guía de despliegue local (GGUF, vLLM, SGLang) en dev.to: https://dev.to/ai_made_tools/kat-coder-v25-local-setup-guide-gguf-vllm-sglang-2fdi
- Blog oficial de Kwaipilot sobre KAT-Coder: https://kwaipilot.github.io/KAT-Coder/
