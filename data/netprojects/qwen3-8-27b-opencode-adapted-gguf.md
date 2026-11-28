# netprojects/Qwen3.8-27B-opencode-adapted-GGUF

## Resumen

El repositorio `netprojects/Qwen3.8-27B-opencode-adapted-GGUF` contiene una familia de cuantizaciones GGUF del modelo `harness-hub/Qwen3.8-27B-opencode-adapted`, un ajuste fino mediante LoRA del modelo base `Qwen/Qwen3.8-27B`. El adaptador original fue entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) para especializarse como modelo de soporte del agente de programación OpenCode en tareas de ingeniería de software y de terminal. Este repositorio, mantenido por el usuario `netprojects`, fusiona el adaptador en el modelo base y publica los pesos convertidos a GGUF para su uso directo con llama.cpp, LM Studio y Ollama, sin necesidad de cargar el LoRA por separado.

El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) que conserva la capa de predicción multi-token (MTP) de Qwen, lo que permite a llama-server acelerar la decodificación. El repositorio incluye además un proyector multimodal (`mmproj-Qwen3.8-27B-opencode-F16.gguf`) que habilita la entrada de imágenes, de ahí su etiqueta de pipeline `image-text-to-text`. La licencia es Apache 2.0 y el modelo está pensado para ejecutarse en hardware de consumo, con variantes desde 9,9 GB (Q2_K_XL) hasta 29,0 GB (Q8_0).

La relevancia actual del modelo radica en su enfoque: en lugar de competir por rendimiento bruto en benchmarks generales, optimiza el coste de inferencia en tareas de agente. Según los resultados publicados por el autor del adaptador, con el modo de razonamiento (thinking) desactivado iguala al modelo base con thinking a máximo esfuerzo generando aproximadamente una sexta parte de los tokens, lo que reduce de forma notable el coste por tarea en pipelines de agentes. El repositorio acumula 3.903 descargas desde su creación el 18 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con capa de predicción multi-token (MTP) conservada; conversión GGUF para llama.cpp |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_XL, Q4_K_M, IQ4_XS, Q3_K_XL, Q3_K_M, IQ3_XXS, Q2_K_XL, IQ2_M; además builds MLX de 3, 4, 6 y 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); MLX en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B` (revisión `3756181`) y le aplica el adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted` (revisión `b4171c0`), fusionado en los pesos base y convertido a GGUF. La arquitectura subyacente es un transformer de 27,3 mil millones de parámetros que mantiene la capa de predicción multi-token (MTP) de Qwen, aprovechable por llama-server para decodificación más rápida. El repositorio incluye un proyector multimodal F16 de 0,9 GB para entrada de imágenes.

El adaptador se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en la librería TRL, orientado a tareas de ingeniería de software y de terminal dentro del agente OpenCode. El autor del adaptador reporta mejoras sobre el modelo base en SWE-bench Pro (hard 51), de 35,3 % a 51,0 %, y en Terminal-Bench 2.1, de 46,4 % a 52,4 %, ambas con thinking desactivado. La conversión a GGUF incluye cuantizaciones con mezcla por tensor (Q4_K_XL, Q3_K_XL, Q2_K_XL) e imatrix, y el autor publica métricas de fidelidad frente al original: porcentaje de mismo siguiente token y divergencia KL.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Especialización en tareas de agente de programación: resolución de issues, edición de código y operaciones en terminal, entrenado específicamente para OpenCode.
- Entrada multimodal de imágenes mediante el proyector `mmproj-Qwen3.8-27B-opencode-F16.gguf`.
- Decodificación acelerada por predicción multi-token (MTP) en llama-server.
- Modo thinking disponible en el modelo base, aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Compatibilidad con llama.cpp, LM Studio y Ollama; builds MLX para Apple Silicon.
- Soporte de tool calling y flujos de agente multi-paso: no confirmado explícitamente en la información disponible, aunque el entrenamiento con OpenCode implica uso de herramientas.

## Casos de uso

- Agente de programación en local: el modelo puede resolver tareas de edición de código y comandos de terminal dentro de OpenCode con thinking desactivado, lo que reduce el coste por tarea al generar aproximadamente una sexta parte de los tokens que el modelo base con thinking a máximo esfuerzo.
- Revisión y corrección de issues en repositorios: entrenado sobre SWE-bench Pro, es adecuado para flujos que reciben un problema descrito en lenguaje natural y deben producir un parche aplicable, ejecutable con llama-server en una estación de trabajo.
- Automatización de terminal y operaciones: con Terminal-Bench 2.1 como referencia de entrenamiento, encaja en asistentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Asistente de código en equipos con GPU de consumo: la variante Q4_K_XL (17,7 GB) cabe en GPU de 24 GB y permite desplegar un agente de programación sin infraestructura en la nube.
- Procesamiento de capturas y diagramas: gracias al proyector multimodal, puede recibir imágenes junto con texto, por ejemplo capturas de errores o diagramas de arquitectura, en flujos de depuración asistida.
- Despliegue en Apple Silicon: los builds MLX de 3 a 8 bits permiten ejecutar el modelo en Macs con memoria unificada, útil para desarrollo individual y prototipado de agentes.
- Integración en pipelines de CI/CD: al ser compatible con llama.cpp y Ollama, puede invocarse como servicio local para tareas de revisión automática de código o generación de parches en pre-commit.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (OpenCode, thinking desactivado):

| Benchmark | Modelo base | Adaptador OpenCode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Métricas de fidelidad de las cuantizaciones GGUF frente al original (porcentaje de mismo siguiente token y divergencia KL):

| Fichero | Tamano | Mismo siguiente token | Divergencia KL |
|---|---|---|---|
| Q8_0 | 29,0 GB | 99,5 % | 0,0002 |
| Q6_K | 22,4 GB | 98,7 % | 0,0197 |
| Q5_K_M | 19,5 GB | 97,6 % | 0,0051 |
| Q4_K_XL | 17,7 GB | 96,6 % | 0,0078 |
| Q4_K_M | 16,8 GB | 94,2 % | 0,0689 |
| IQ4_XS | 15,3 GB | 94,4 % | 0,0199 |
| Q3_K_XL | 13,1 GB | 92,0 % | 0,0398 |
| Q3_K_M | 13,5 GB | 92,9 % | 0,0883 |
| IQ3_XXS | 10,9 GB | 87,6 % | 0,0870 |
| Q2_K_XL | 9,9 GB | 85,0 % | 0,1316 |
| IQ2_M | 10,2 GB | 89,6 % | 0,1709 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: 9,9 GB (Q2_K_XL) hasta 29,0 GB (Q8_0); el autor recomienda Q6_K (22,4 GB) para 48 GB de memoria y Q8_0 para 64 GB o más.
- Guía de memoria del autor: 16 GB para Q2_K_XL, 24 GB para Q3_K_XL, 32 GB para Q4_K_XL, 48 GB para Q6_K y 64 GB o más para Q8_0.
- Cabe en GPU de consumo: Q4_K_XL (17,7 GB) en tarjetas de 24 GB como la RTX 4090; Q3_K_XL (13,1 GB) en tarjetas de 16 GB; Q2_K_XL en sistemas de 16 GB de memoria unificada.
- Para entrada de imagen, sumar 0,9 GB del proyector `mmproj-Qwen3.8-27B-opencode-F16.gguf`.
- Opciones de despliegue: llama.cpp (llama-server, con soporte de MTP), LM Studio y Ollama; builds MLX para Apple Silicon.
- En Macs de 16 GB, el autor sugiere limitar el prompt a unos pocos miles de tokens y ampliar la memoria de GPU con `sudo sysctl iogpu.wired_limit_mb=12800`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (este) | 27,3 mil millones | no disponible | Agente de programación (OpenCode) | Apache 2.0 | GGUF, MLX |
| Qwen3.8-27B (base) | 27,3 mil millones | no disponible | Propósito general | no disponible en la información | safetensors |
| Otros modelos de agente de código de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; el autor recomienda mantenerlo así en OpenCode, por lo que el rendimiento fuera de ese modo no está validado.
- La especialización en tareas de agente de programación puede degradar el rendimiento en tareas generales respecto al modelo base Qwen3.8-27B.
- Las cuantizaciones de baja precisión pierden fidelidad: Q2_K_XL conserva solo el 85,0 % del mismo siguiente token y Q4_K_M baja al 94,2 %, lo que puede afectar a tareas de código sensibles a errores.
- Riesgo de alucinación en código y comandos de terminal: no se han publicado evaluaciones de seguridad o tasas de error en producción en la información disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe más allá del modelo base.
- Longitud de contexto: no disponible, lo que impide planificar prompts largos con precisión.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo fusionado.
- El tamaño del repositorio (191,0 GB) obliga a descargar solo el fichero de cuantización necesario, no el repositorio completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- OpenCode: https://opencode.ai
- Builds MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit, https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit, https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit, https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit, https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
