# AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por AtomicChat. El valor diferencial no es la cuantización en sí, sino la edición aplicada a los pesos: se ha proyectado fuera la "dirección de rechazo" (refusal direction) del modelo original mediante una técnica de abliteration calculada sobre los pesos en precisión completa (tensores BF16 y expertos nativos MXFP4 dequantizados exactamente), cubriendo todos los bloques que escriben en el flujo residual.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con una tabla n-gram Engram como componente adicional, y el resultado es un modelo que mantiene las capacidades del original pero elimina los rechazos: en JailbreakBench pasa del 88,9-91,4% de respuestas conformes al 0,0%, y en XSTest (prompts seguros rechazados) baja del 8,0-8,8% al 0,0-0,4%. Se ofrecen dos builds con distintos compromisos entre tamaño y fidelidad: `2.67bpw-IQ1_M` (250,4 GB en disco, 139,8 GB de pesos) y `3.58bpw-Q2_K` (334,8 GB en disco, 199,6 GB de pesos).

Es relevante ahora porque el soporte de DeepSeek-V4.1 se fusionó en llama.cpp el 25 de octubre (PR #31086), lo que permite cargar estos ficheros sin modificaciones con builds de esa fecha o posteriores. Además, se publica un adaptador LoRA de rango 1 que reproduce la misma edición sobre cualquier GGUF del modelo base con nombres de tensor compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla n-gram Engram (según model card) |
| Parametros totales | 114.925.568 (dato de safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M (2.67 bpw), Q2_K (3.58 bpw); LoRA de rango 1 en GGUF |
| Idiomas soportados | no disponible (evaluado en inglés: JailbreakBench EN, XSTest) |
| Licencia | MIT |
| Formato de pesos | GGUF (múltiples shards; tabla Engram en shard propio) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: la model card menciona 384 expertos enrutados por bloque, un experto compartido y una proyección de salida de atención, todos ellos "escritores del flujo residual". Incorpora además una tabla n-gram Engram que se lee unas pocas filas por token y que en cada build ocupa un shard independiente (shard 3 de 6 con 111 GB en `2.67bpw-IQ1_M`; shard 3 de 8 con 135 GB en `3.58bpw-Q2_K`), lo que permite mantenerla en SSD y reduce la memoria necesaria para los pesos activos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación técnica de esta publicación es la edición de abliteration: se calcula la dirección de rechazo sobre los pesos liberados en precisión completa y se proyecta fuera de todos los bloques que escriben en el flujo residual. La misma edición se empaqueta como LoRA de rango 1 (`lora/DeepSeek-V4.1-Flash-1017-Uncensored-LoRA.gguf`), aplicable a GGUFs con nombres de tensor compatibles a partir de ~2 bits por peso. Los builds replican exactamente los tipos de tensor y la importance matrix del build de Unsloth correspondiente, de modo que la única diferencia medible es la edición.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (bajo y alto esfuerzo).
- Respuestas sin rechazos: 0,0% de conformidad en JailbreakBench (EN) en ambos builds, frente al 88,9-91,4% del original.
- Baja tasa de falsos rechazos en prompts seguros: XSTest pasa de 8,0-8,8% a 0,0% (IQ1_M) y 0,4% (Q2_K).
- Tool calling / function calling: el adaptador LoRA reporta 20/20 llamadas a herramientas válidas sobre UD-Q2_K_XL.
- Contexto largo: 3/3 needles superados en la prueba de long-context con el adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; la model card no los menciona.

## Casos de uso

- Investigación sobre alineación y rechazos: permite estudiar el comportamiento del modelo con la dirección de rechazo eliminada y compararlo con el original, ya que se publican métricas de KLD, top-1 y MMLU frente a la referencia.
- Evaluación de robustez de salvaguardas: útil para probar clasificadores y filtros externos, dado que el modelo por sí mismo no rechaza (JailbreakBench al 0,0%).
- Generación creativa sin restricciones de estilo: escritura de ficción, guiones o contenido narrativo donde los rechazos del modelo base interrumpen la tarea.
- Despliegue local en máquinas de gran memoria: con 139,8 GB de pesos para IQ1_M o 199,6 GB para Q2_K, encaja en estaciones de trabajo con ~140-200 GB de RAM+VRAM y la tabla Engram en SSD.
- Pipelines de agentes con tool calling: el adaptador demuestra 20/20 llamadas válidas; el modelo puede integrarse en flujos multi-paso con llama-server y `--jinja`.
- Aplicación del adaptador LoRA sobre GGUFs existentes: permite convertir un DeepSeek-V4.1-Flash-1017 ya desplegado (por ejemplo, UD-Q2_K_XL de Unsloth) en la versión sin rechazos sin descargar los builds completos.
- Análisis de contexto largo: con 3/3 needles superados en la variante con adaptador, adecuado para tareas de recuperación de información en documentos extensos.

## Benchmarks y rendimiento

Datos publicados en la model card. Referencia: build UD-Q8_K_XL de Unsloth (BF16 + MXFP4 nativo del checkpoint liberado). Texto neutral retenido, 24 fragmentos de 4096 tokens.

| Build | JailbreakBench (EN) | XSTest (seguros rechazados) | Thinking low | Thinking high | MMLU (500) |
|---|---|---|---|---|---|
| IQ1_M | 88,9% → 0,0% | 8,8% → 0,0% | 29/30 → 0/30 | 28/30 → 0/30 | 85,6% → 81,8% (p = 0,003) |
| Q2_K | 91,4% → 0,0% | 8,0% → 0,4% | 28/30 → 0/30 (adaptador) | 28/30 → 0/30 (adaptador) | 86,0% → 86,6% (p = 0,69) |

| Build | En disco | Pesos (RAM + VRAM) | KLD medio | Mismo top-1 | KLD Unsloth mismo layout | Top-1 Unsloth |
|---|---|---|---|---|---|---|
| 2.67bpw-IQ1_M | 250,4 GB | 139,8 GB | 0,2506 | 83,14% | 0,2227 | 84,37% |
| 3.58bpw-Q2_K | 334,8 GB | 199,6 GB | 0,1001 | 89,45% | 0,0829 | 90,45% |

Adaptador LoRA sobre UD-Q2_K_XL de Unsloth: rechazos 0,0% (EN); XSTest 7,6 puntos por debajo del original; MMLU (2000 preguntas) +0,55 puntos; rechazos en thinking 0/30 (low) y 0/30 (high); 20/20 llamadas a herramientas válidas; 3/3 needles de contexto largo; KL del primer token en prompts inocuos 0,38; dirección residual en los escritores 5,9e-04. Sobre UD-IQ1_M el adaptador degrada MMLU de 85,6% a 72,0%.

## Requisitos de hardware

- VRAM/RAM para pesos: 139,8 GB (IQ1_M) o 199,6 GB (Q2_K). La tabla Engram puede residir en SSD, por lo que no cuenta para la memoria de pesos.
- Almacenamiento: 250,4 GB (IQ1_M) y 334,8 GB (Q2_K) en disco.
- GPU recomendadas: no disponibles de forma explícita; por volumen de pesos, requiere configuraciones multi-GPU o servidores con memoria unificada grande (varias A100/H100 o equivalentes). No cabe en una RTX 4090 (24 GB) ni en GPUs de consumo individuales.
- Despliegue: llama.cpp con build del 25 de octubre de 2026 o posterior (PR #31086); verificado sobre el pin de Unsloth (commit `9d907b7cfe0e`) y sobre master `d854d98`. El formato es GGUF, por lo que también es compatible con el ecosistema llama.cpp (llama-server). No funciona todavía en Atomic Chat.
- Latencia y throughput: no disponibles. Se reporta que `3.58bpw-Q2_K` produce las mismas predicciones en el pin y en master (KL 0,0000, 99,98% mismo top-1 en 2 fragmentos de 4096), y que `2.67bpw-IQ1_M` difiere ligeramente (KL 0,004, perplejidad +0,3%).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored (IQ1_M) | 114.925.568 (safetensors) | no disponible | MMLU 81,8%; JailbreakBench 0,0% | MIT | GGUF en HF |
| DeepSeek-V4.1-Flash-1017-Uncensored (Q2_K) | 114.925.568 (safetensors) | no disponible | MMLU 86,6%; JailbreakBench 0,0% | MIT | GGUF en HF |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | MMLU 85,6-86,0%; JailbreakBench 88,9-91,4% | no disponible | checkpoint liberado |
| UD-Q2_K_XL de Unsloth (mismo layout) | no disponible | no disponible | KLD 0,0829; top-1 90,45% | no disponible | GGUF en HF |

## Limitaciones y advertencias

- El build `2.67bpw-IQ1_M` pierde conocimiento: MMLU cae de 85,6% a 81,8% (500 preguntas, p = 0,003), por encima del umbral de 1,5 puntos del propio autor. Además, con thinking activado entra en bucles con más frecuencia (3/30 trazas en esfuerzo bajo y 5/30 en alto en JailbreakBench).
- El adaptador LoRA no debe aplicarse sobre builds de 1 bit: sobre UD-IQ1_M degrada MMLU de 85,6% a 72,0%. Debe usarse en UD-Q2_K_XL o superior.
- El modelo elimina deliberadamente los rechazos: no incorpora salvaguardas internas y puede generar contenido dañino, ilegal o inseguro. Requiere filtrado externo en cualquier despliegue en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; la edición no incluye métricas de veracidad.
- Idiomas soportados no disponibles; las evaluaciones publicadas son en inglés (JailbreakBench EN, XSTest).
- Longitud de contexto no disponible.
- El modelo no funciona todavía en la aplicación Atomic Chat.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado.

## Enlaces

- Hugging Face: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build de referencia de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Métricas y logs de compatibilidad: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- PR de llama.cpp con soporte de DeepSeek-V4.1: https://github.com/ggml-org/llama.cpp/pull/31086
- Pin de Unsloth en llama.cpp: https://github.com/unslothai/llama.cpp/pull/298
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X: https://x.com/atomic_chat_hq
