# prakharprasad/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una suite de cuantizaciones GGUF del modelo Qwen3.8-27B, publicado por el usuario prakharprasad bajo licencia Apache 2.0. El modelo base Qwen/Qwen3.8-27B ha sido sometido a un proceso de "abliteration" (eliminación de los mecanismos de rechazo alineados) y posteriormente cuantizado a FP8 por orcarouter, para finalmente ser convertido a GGUF mediante la metodología Dynamic 3.0 (UD 3.0) de Unsloth. El resultado es un conjunto de 11 variantes cuantizadas que abarcan desde 9,99 GiB (3,18 BPW) hasta 27,05 GiB (8,61 BPW), todas compatibles con llama.cpp.

La relevancia técnica de esta ficha reside en que Qwen3.8-27B no es un transformer convencional: es una arquitectura híbrida de 64 capas que combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa, intercaladas cada 4 capas. Esta estructura de estado recurrente hace que las cuantizaciones K-quant ingenuas introduzcan ruido acumulativo exponencial en contextos largos, degradando el razonamiento multi-turno y el tool calling. La suite UD 3.0 aborda este problema fijando los tensores de compuerta recurrente (`ssm_alpha`, `ssm_beta`) a Q8_0, lo que mantiene un suelo de SQNR constante de 43,8 dB en todas las variantes.

El modelo cuenta con 27.320.697.856 parámetros totales, una ventana de contexto de 262.000 tokens, soporte para inglés y chino, y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa nativa. Está orientado a generación de texto, razonamiento, function calling y red-teaming, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas (48 Gated DeltaNet de atención lineal + 16 de atención completa, intercaladas cada 4 capas) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | GGUF dinámicas UD 3.0: UD-Q2_K_XL, UD-Q2_K_XL-MTP, UD-Q3_K_XL-MTP, UD-Q4_K_S-MTP, UD-Q4_K_M-MTP y hasta 11 variantes (3,18–8,61 BPW) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida de 64 capas en la que 48 capas utilizan atención lineal Gated DeltaNet y 16 capas emplean atención completa, intercaladas con un patrón de una capa de atención completa cada cuatro capas. Las capas Gated DeltaNet mantienen la memoria de secuencia mediante una actualización recursiva del estado: S_t = (I - β_t K_t^T) S_{t-1} + α_t V_t Q_t^T. Esta formulación permite escalar a contextos de 262.000 tokens con un coste computacional lineal, pero también hace que la precisión de los tensores de compuerta (`ssm_alpha`, `ssm_beta`) sea crítica: cualquier error de cuantización se amplifica recursivamente a lo largo de la secuencia.

El modelo incorpora una cabeza nativa de predicción multi-token (MTP, `nextn`) en la capa 64, que ocupa aproximadamente 500 MB en BF16 y 146 MB en Q2_K. Esta cabeza habilita decodificación especulativa integrada sin necesidad de un modelo borrador externo. La cuantización UD 3.0 de Unsloth aplica enrutamiento de tensores consciente de la arquitectura: fija los tensores de compuerta recurrente a Q8_0 (y normalización de recurrencia a f32), mientras cuantiza agresivamente los parámetros masivos no críticos. El resultado es un suelo de SQNR de 43,8 dB constante en todas las variantes, con una divergencia de trayectoria multi-token evaluada mediante KL Divergence y Divergence-300 @ 32 sobre 300 prompts de Terminal-Bench 2.1, DeepSWE y MathArena. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262.000 tokens.
- Razonamiento explícito y cadenas de pensamiento (etiqueta `reasoning` en el modelo).
- Function calling y tool calling, con soporte para flujos agénticos de múltiples pasos.
- Decodificación especulativa nativa mediante la cabeza MTP (en las variantes que la conservan).
- Capacidades multilingües limitadas a inglés y chino.
- Modo "uncensored"/abliterated: el modelo base ha sido modificado para eliminar los rechazos alineados, orientado a red-teaming y evaluación de seguridad.
- Compatibilidad con endpoints y despliegue vía llama.cpp.

## Casos de uso

- Red-teaming y evaluación de seguridad: la variante abliterated permite generar respuestas que el modelo base rechazaría, lo que facilita auditar la robustez de filtros y clasificadores de contenido en pipelines de moderación.
- Atención al cliente automatizada de largo alcance: con 262.000 tokens de contexto, el modelo puede mantener el hilo de conversaciones multi-sesión o procesar historiales completos de tickets sin truncamiento, aunque el soporte de idiomas se limita a inglés y chino.
- Agentes autónomos con tool calling: la combinación de function calling y contexto largo permite construir agentes que consulten APIs, ejecuten comandos y mantengan estado a lo largo de tareas extensas; la cabeza MTP reduce la latencia en las variantes que la incluyen.
- Análisis de documentos extensos en inglés o chino: resumen, extracción de entidades y respuesta a preguntas sobre contratos, informes o código fuente que superen los 100.000 tokens.
- Asistente de código en local: las variantes UD-Q4_K_M-MTP (15,67 GiB) caben en GPUs de 16 GB y permiten autocompletado y generación de código con razonamiento, sin dependencia de la nube.
- Despliegue en hardware de gama consumer: la variante UD-Q2_K_XL (9,99 GiB) está diseñada específicamente para GPUs de 10 GB (RTX 3080 10GB) y sistemas con 16 GB de RAM, habilitando inferencia local de un modelo de 27B.
- Investigación sobre cuantización: la suite de 11 variantes con métricas de RMSE, SQNR y similitud coseno por tensor sirve como banco de pruebas para estudiar el impacto de la cuantización en arquitecturas híbridas SSM/atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de fidelidad de reconstrucción de la cuantización, no de rendimiento en tareas:

| Variante | Tamano (GiB) | BPW | RMSE gating recurrente | RMSE FFN Down | SQNR (dB) | RMSE global | Similitud coseno | Error pico (L-inf) | MTP |
|---|---|---|---|---|---|---|---|---|---|
| UD-Q2_K_XL | 9,99 | 3,18 | 0,82% | 21,80% | 15,6 | 17,1% | 0,9908 | 0,098 | Poda |
| UD-Q2_K_XL-MTP | 10,13 | 3,22 | 0,82% | 21,80% | 15,8 | 16,8% | 0,9912 | 0,098 | Incluida |
| UD-Q3_K_XL-MTP | 13,57 | 4,32 | 0,82% | 13,40% | 21,1 | 9,4% | 0,9965 | 0,068 | Incluida |
| UD-Q4_K_S-MTP | 14,75 | 4,69 | 0,82% | 8,65% | 24,8 | 6,2% | 0,9984 | 0,045 | Incluida |
| UD-Q4_K_M-MTP | 15,67 | 4,98 | 0,82% | 7,60% | no disponible | no disponible | no disponible | no disponible | Incluida |

## Requisitos de hardware

- VRAM estimada: 9,99 GiB (UD-Q2_K_XL) hasta 27,05 GiB (variante de 8,61 BPW); las variantes intermedias requieren 10,13, 13,57, 14,75 y 15,67 GiB respectivamente.
- GPUs objetivo según la model card: RTX 3080 10GB y sistemas con 16 GB de RAM para UD-Q2_K_XL; RTX 3060 12GB y RTX 4070 12GB para UD-Q3_K_XL-MTP; GPUs de 16 GB para UD-Q4_K_S-MTP y UD-Q4_K_M-MTP.
- Cabe en GPU consumer: sí, desde una RTX 3080 de 10 GB (variante Q2 con MTP podada) hasta GPUs de 16 GB (variantes Q4).
- Opciones de despliegue: llama.cpp (formato nativo GGUF); la model card no confirma compatibilidad explícita con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles. La cabeza MTP proporciona aceleración por decodificación especulativa en las variantes que la incluyen, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (esta ficha) | 27,3B | 262K | Apache 2.0 | GGUF (11 variantes) | Abliterated, híbrido SSM/atención, MTP |
| Qwen/Qwen3.8-27B (base) | 27,3B | 262K | Apache 2.0 | safetensors | Modelo original con alineamiento intacto |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 27,3B | 262K | Apache 2.0 | FP8 | Fuente directa de esta cuantización; requiere hardware de datacenter |

No se dispone de información sobre otros modelos comparables de la misma categoría (híbridos SSM/atención de ~27B con contexto de 262K) en la documentación proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos alineados; el modelo puede generar contenido dañino, sesgado o ilegal sin filtros. No es apto para despliegue directo en aplicaciones de cara al público sin capas adicionales de moderación.
- La cuantización agresiva a Q2 introduce un RMSE global del 17,1% y un error pico L-inf de 0,098; aunque el gating recurrente se preserva al 0,82% de RMSE, la degradación en capas FFN Down alcanza el 21,80%, lo que puede afectar tareas de conocimiento factual.
- El soporte de idiomas se limita a inglés y chino; no hay evidencia de capacidades en castellano.
- La variante UD-Q2_K_XL-MTP (10,13 GiB) puede provocar swapping del sistema operativo y errores de memoria CUDA en GPUs de 10 GB; para esos entornos debe usarse la variante con la capa 64 podada.
- No se han publicado evaluaciones de sesgo, toxicidad ni benchmarks de tareas para esta cuantización concreta; las métricas de fidelidad de reconstrucción no garantizan un comportamiento alineado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo abliterated en producción.
- El repositorio tiene 201,8 GB de tamaño total y 0 likes, con 1.458 descargas; es un artefacto de la comunidad sin validación independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/prakharprasad/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente FP8 de la cuantización: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Metodología UD 3.0 de Unsloth: no disponible como enlace en la información proporcionada
