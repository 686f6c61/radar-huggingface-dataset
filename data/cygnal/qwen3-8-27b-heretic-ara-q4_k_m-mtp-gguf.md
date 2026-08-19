# cygnal/Qwen3.8-27B-heretic-ara-Q4_K_M-MTP-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en Q4_K_M del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, una versión "uncensored" (abliterated) de Qwen3.8-27B, el último modelo de la familia Qwen3.8 de Alibaba. La particularidad de esta cuantización es que preserva los 15 tensores MTP (Multi-Token Prediction) que los conversores automáticos suelen eliminar, lo que permite activar decodificación especulativa en llama.cpp y multiplicar por más de dos la velocidad de decodificación en hardware compatible.

El modelo base Qwen3.8-27B es un transformer híbrido DeltaNet + attention con 27.320 millones de parámetros, 48 capas lineales y 16 capas de atención completa, con una ventana de contexto nativa de 256K tokens. La versión heretic-ara aplica Arbitrary-Rank Ablation (ARA) mediante la herramienta heretic v1.2.0 para eliminar el rechazo a contenido no deseado, manteniendo un buen comportamiento general (KL divergence 0.0535, 0/100 refusals). Esta cuantización concreta, creada por cygnal, está pensada para ejecutarse en hardware consumer con aceleración Vulkan, como el AMD Ryzen AI Max+ 395, donde alcanza 27-28 tokens por segundo en decodificación con MTP activado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida DeltaNet + attention (qwen3.5), 48 capas lineales + 16 de atención completa |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama.cpp; el modelo base soporta 256K) |
| Tipos de cuantizacion | Q4_K_M (4,92 BPW) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza la arquitectura `qwen3.5`, un diseño híbrido que combina 48 capas con atención lineal DeltaNet y 16 capas de atención completa (full attention). Esta combinación reduce el crecimiento del cache KV (solo 16 capas generan cache), lo que abarata la escalada de contexto. El modelo fue entrenado por Alibaba con un contexto nativo de 256K tokens, aunque esta cuantización se recomienda usar con 32K en llama.cpp.

Sobre el modelo base, `trohrbaugh/Qwen3.8-27B-heretic-ara` aplica Arbitrary-Rank Ablation (ARA) mediante la herramienta heretic v1.2.0 con parámetros específicos: capas 26 a 56, peso de preservación de buen comportamiento 0.9432, peso de dirección de mal comportamiento 0.0009. El resultado es un modelo sin rechazos (0/100 refusals) con una divergencia KL de 0.0535 respecto al original, lo que indica una alteración mínima del comportamiento general.

La cuantización de cygnal se realizó con `convert_hf_to_gguf.py` sin la bandera `--no-nextn`, seguido de `llama-quantize Q4_K_M`. El proceso partió de safetensors BF16 (54,6 GB) hasta obtener el GGUF final de 16 GB con 866 tensores (851 del modelo + 15 del módulo MTP). La inclusión de los tensores MTP permite usar decodificación especulativa con `--spec-type draft-mtp` en llama.cpp, logrando un speedup de aproximadamente 2,3× en decodificación.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B incluye capacidades de razonamiento y chat, con soporte para modos de pensamiento.
- Visión: según la documentación de Unsloth, Qwen3.8-27B incorpora un codificador de visión, aunque esta capacidad no se detalla en la model card de la cuantización.
- Generación de código: el modelo base destaca en tareas de coding agéntico, según las fuentes consultadas.
- Tool calling / function calling: no se menciona explícitamente, pero es una capacidad estándar de la familia Qwen3.8.
- Decodificación especulativa MTP: los tensores MTP incluidos permiten activar `--spec-type draft-mtp` en llama.cpp, acelerando la decodificación de ~12 t/s a ~28 t/s en hardware compatible.
- Sin censura: el proceso ARA elimina los rechazos a contenido no deseado, permitiendo generar respuestas que el modelo original bloquearía.
- Multilingüe: no se especifican idiomas concretos, pero Qwen3.8 es un modelo multilingüe.

## Casos de uso

- Despliegue local en hardware consumer: con 16 GB de peso y cuantización Q4_K_M, el modelo cabe en GPUs de 16-24 GB VRAM o en sistemas con memoria unificada como el AMD Strix Halo. Es adecuado para ejecutar un LLM de 27B sin depender de servicios en la nube.
- Aplicaciones que requieren alta velocidad de decodificación: gracias al MTP, se alcanzan 27-28 t/s en decodificación, suficiente para chatbots interactivos en tiempo real. Sin MTP, la velocidad cae a 12 t/s, aún usable pero notablemente más lenta.
- Investigación sobre eliminación de censura: el modelo heretic-ara es un caso de estudio práctico de abliteration y ARA, útil para investigadores que estudian el comportamiento de modelos sin alineación de seguridad.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos donde el modelo original podría rechazar ciertas solicitudes por contenido sensible.
- Prototipado de agentes conversacionales: con tool calling y razonamiento, puede servir como base para asistentes locales que necesiten ejecutar acciones sin pasar por APIs externas.
- Evaluación comparativa de cuantizaciones: al ser una cuantización Q4_K_M con MTP preservado, es útil para comparar el impacto de la cuantización en la calidad y velocidad frente a otras versiones GGUF del mismo modelo.

## Benchmarks y rendimiento

La model card proporciona benchmarks de rendimiento en hardware específico (AMD Ryzen AI Max+ 395, 122 GB memoria unificada, backend Vulkan, llama.cpp build 0ef6e55ed, contexto 8K, 128 tokens de salida):

| Configuracion | Prefill (t/s) | Decode (t/s) |
|---|---|---|
| Q4_K_M-MTP, Vulkan, MTP n-max 3 | 168-172 | 27-28 |
| Q4_K_M-MTP, Vulkan, sin MTP | 200 | 12,2 |

Para comparación, Qwen3.6-27B heretic-v2 en el mismo hardware alcanza 213 t/s de prefill y 28 t/s de decode. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para el archivo GGUF Q4_K_M. Con contexto de 32K y cache KV, se recomienda al menos 20-24 GB de VRAM o memoria unificada.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo) con 122 GB unificados es el hardware de referencia de la model card. También es viable en GPUs NVIDIA con 24 GB VRAM (RTX 3090/4090) o superiores, usando backend CUDA o Vulkan.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama alta consumer con 24 GB VRAM. En GPUs de 16 GB puede ser ajustado con contexto reducido.
- Opciones de despliegue: llama.cpp (llama-server) con backend Vulkan o CUDA, usando `-ngl 99` para offload completo. También es compatible con otros runners que acepten GGUF, como Ollama, aunque la funcionalidad MTP requiere llama.cpp.
- Latencia y throughput: 27-28 t/s de decode con MTP activado en Strix Halo; 12,2 t/s sin MTP. Prefill de 168-200 t/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic-ara Q4_K_M-MTP (este) | 27,3B | 32K (recomendado) | Q4_K_M | Apache 2.0 | MTP preservado, sin censura |
| Qwen3.8-27B-heretic-ara (base, safetensors) | 27,3B | 256K | BF16 | Apache 2.0 | Modelo original sin cuantizar |
| Qwen3.6-27B heretic-v2 | 27B (aprox.) | No disponible | No disponible | Apache 2.0 | Versión anterior, 213 t/s prefill, 28 t/s decode en mismo hardware |
| mradermacher/Qwen3.8-27B-heretic-ara-GGUF | 27,3B | No disponible | GGUF (varias) | Apache 2.0 | Cuantización sin MTP, según la model card de cygnal |

La principal diferencia frente a otras cuantizaciones GGUF del mismo modelo es la inclusión de los tensores MTP, que permite decodificación especulativa y duplica la velocidad de decode en hardware compatible.

## Limitaciones y advertencias

- Prompt caching roto en llama.cpp: para modelos híbridos de memoria (DeltaNet + attention), el prompt caching no funciona correctamente, por lo que cada turno reprocesa el contexto completo. Esto aumenta la latencia en conversaciones multi-turno largas.
- Modelo sin censura: al ser una versión abliterated, el modelo puede generar contenido inapropiado, ofensivo o peligroso. No debe usarse en producción sin medidas de moderación adicionales.
- Riesgo de alucinación: como cualquier LLM, puede inventar información. La eliminación de la alineación de seguridad puede aumentar la confianza en respuestas incorrectas.
- Contexto limitado en esta cuantización: aunque el modelo base soporta 256K, la configuración recomendada aquí es 32K. Usar contextos mayores puede degradar el rendimiento o requerir más VRAM.
- Idiomas no especificados: no se documentan los idiomas soportados en esta cuantización, aunque el modelo base es multilingüe.
- Dependencia de llama.cpp para MTP: la funcionalidad de decodificación especulativa MTP solo está disponible en versiones recientes de llama.cpp con `--spec-type draft-mtp`. Otros runners pueden ignorar los tensores MTP.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval u otros benchmarks para esta cuantización, por lo que el impacto de la cuantización Q4_K_M en la calidad no está cuantificado.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/cygnal/Qwen3.8-27B-heretic-ara-Q4_K_M-MTP-GGUF
- Modelo base (safetensors): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Cuantización alternativa sin MTP: https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-GGUF
- Herramienta heretic (eliminación de censura): https://github.com/p-e-w/heretic
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local de Qwen3.8-27B (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones y requisitos de Qwen3.8-27B (yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
