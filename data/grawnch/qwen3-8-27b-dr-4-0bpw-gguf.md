# Grawnch/Qwen3.8-27B-DR-4.0bpw-GGUF

## Resumen

Grawnch/Qwen3.8-27B-DR-4.0bpw-GGUF es una cuantización GGUF de precisión mixta de 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario Grawnch. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local eficiente sobre llama.cpp. El autor la etiqueta como versión `v3` y emplea una mezcla de tipos `Q4_K`, `Q5_K`, `Q6_K` y `F32` con el objetivo de preservar la calidad del modelo original reduciendo el peso en disco hasta 17,38 GB.

El modelo base es un transformer denso de 26.896 millones de parámetros (aproximadamente 27B), con una longitud de contexto declarada de 262.144 tokens. La cuantización mantiene compatibilidad con llama.cpp estándar en CUDA, Metal y Vulkan sin kernels personalizados ni tablas de consulta, lo que la hace desplegable en hardware de consumo y estaciones de trabajo con GPU.

Su relevancia actual radica en que permite ejecutar un modelo de ~27B con contexto muy largo en entornos locales con VRAM limitada, manteniendo una divergencia de perplejidad muy baja respecto al modelo en BF16 según las métricas publicadas por el autor. Es una pieza útil para desarrolladores que quieren evaluar el comportamiento del modelo base sin depender de infraestructura de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B; detalles internos no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | GGUF mixto: Q4_K / Q5_K / Q6_K / F32 (5,0013 bpw efectivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `Qwen3.8-27B-DR-4.0bpw-v3.gguf`, 17.377.598.592 bytes) |

## Arquitectura y entrenamiento

La ficha corresponde a una cuantización, no a un entrenamiento. El modelo subyacente es Qwen/Qwen3.8-27B, un transformer denso de ~27B parámetros con contexto de 262.144 tokens. El autor no documenta en la model card la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF/DPO; esos datos pertenecen al modelo base y no están disponibles en la información proporcionada.

La innovación técnica de esta publicación es el esquema de cuantización de precisión mixta `v3`: se mantienen embeddings, LM head y normas/gates recurrentes en `Q6_K` y `F32`, mientras el resto de matrices se cuantiza en `Q4_K`/`Q5_K`. El resultado es un fichero de 17,38 GB con 5,0013 bits por peso efectivos que corre en llama.cpp mainline sin kernels custom. El autor reporta métricas de fidelidad frente a BF16: divergencia KL media de 0,022374 y acuerdo top-1 del 95,60% en el conjunto `WT2_2048`, y KL de 0,004062 con acuerdo top-1 del 97,84% en trazas `<think>` (`SG`).

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Razonamiento multi-paso con modo de pensamiento (`<think>`), evidenciado por la evaluación sobre trazas `SG`.
- Razonamiento matemático: el autor reporta 28/30 en AIME 2025 (Pass@1) para esta cuantización.
- Generación de código: se evalúa un conjunto `Ext` de razonamiento/código, aunque no se detallan tareas concretas.
- Contexto largo de hasta 262.144 tokens, apto para documentos extensos y conversaciones multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible`) según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Idiomas: no disponibles.

## Casos de uso

- Razonamiento matemático asistido: el modelo muestra 93,33% en AIME 2025 con esta cuantización, por lo que puede emplearse en tutores o verificadores de problemas de competición, ejecutándose en local sin depender de APIs.
- Análisis de documentos largos: con 262.144 tokens de contexto puede ingerir contratos, informes o bases de código completas en una sola pasada, útil para resumen y extracción en estaciones de trabajo.
- Asistente conversacional local: la etiqueta `conversational` y el formato GGUF permiten desplegarlo con llama.cpp en equipos de desarrollo para prototipos de chat privados.
- Generación de código en pipelines internos: al ser GGUF compatible con llama.cpp, puede integrarse en herramientas de autocompletado o revisión de código que corran en servidores sin GPU de datacenter.
- Evaluación de modelos base: investigadores pueden comparar el comportamiento del Qwen3.8-27B en BF16 frente a esta cuantización usando las métricas de PPL y KLD publicadas como referencia de fidelidad.
- Despliegue en hardware de consumo: al ocupar 17,38 GB, cabe en GPUs de 24 GB (RTX 3090/4090) y permite inferencia offline en portátiles con GPU de gama alta.
- Procesamiento por lotes de trazas de razonamiento: el buen acuerdo top-1 en trazas `<think>` (97,84%) lo hace adecuado para generar y filtrar cadenas de pensamiento a escala en local.

## Benchmarks y rendimiento

Métricas de fidelidad de la cuantización frente a BF16 publicadas por el autor:

| Suite | Tokens | PPL BF16 | PPL DR-4.0bpw-v3 | ΔPPL | KLD media | Top-1 | Top-5 |
|---|---:|---:|---:|---:|---:|---:|---:|
| WT2_2048 (16x2048) | 32.752 | 6,7357 | 6,7149 | -0,0208 | 0,022374 | 95,60% | 99,88% |
| WT2_Full (145x2048) | 296.815 | 6,8970 | 6,8925 | -0,0045 | — | — | — |
| WT2_1024 (4x1024) | 4.092 | 7,3284 | 7,2989 | -0,0295 | 0,021618 | 95,75% | 99,95% |
| Ext (razonamiento/código) | 342 | 15,0114 | 15,1147 | +0,1033 | 0,011953 | 95,03% | 100,00% |
| SG (trazas `<think>`) | 2.040 | 5,5672 | 5,5497 | -0,0175 | 0,004062 | 97,84% | 100,00% |

Benchmark downstream:

| Benchmark | Problemas | Métrica | Resultado |
|---|---:|---|---:|
| AIME 2025 (I y II, Pass@1) | 30 | Exact Match | 28/30 (93,33%) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas directas con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~17,4 GB solo para pesos; con overhead de contexto y KV cache, prever 18-22 GB según longitud de contexto.
- GPU recomendadas: RTX 3090/4090 (24 GB) para contexto moderado; A100 40/80 GB o H100 para contexto completo de 262.144 tokens.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con 24 GB o más; en 16 GB no cabe sin offloading a RAM.
- Despliegue: llama.cpp mainline (CUDA, Metal, Vulkan); también puede servirse vía Ollama u otros frontends compatibles con GGUF, aunque no se confirma soporte explícito en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---:|---|---|---|
| Grawnch/Qwen3.8-27B-DR-4.0bpw-GGUF | ~26,9B | 262.144 | GGUF 4-bit mixto | no disponible | Cuantización de Qwen3.8-27B; AIME 2025 93,33% |
| Qwen/Qwen3.8-27B (base) | ~26,9B | 262.144 | safetensors BF16 | no disponible | Modelo original sin cuantizar |
| Otras cuantizaciones GGUF de Qwen3.8-27B | ~26,9B | 262.144 | GGUF | según autor | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base Qwen3.8-27B, que no están documentados en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de factualidad.
- La licencia no está indicada en la ficha, por lo que el uso comercial no puede confirmarse; es imprescindible verificar la licencia del modelo base antes de producción.
- Idiomas soportados no documentados; el rendimiento multilingüe puede degradarse respecto al modelo original, especialmente en idiomas de bajos recursos.
- La pérdida de calidad por cuantización es pequeña en las suites evaluadas (ΔPPL entre -0,03 y +0,10), pero el conjunto `Ext` muestra un empeoramiento de +0,1033 en PPL, lo que sugiere mayor sensibilidad en tareas de razonamiento/código.
- El contexto de 262.144 tokens requiere VRAM considerable; en GPUs de 24 GB habrá que limitar la ventana efectiva o usar offloading.
- No hay información sobre tool calling, agentes o capacidades multimodales; no debe asumirse su disponibilidad.
- El repositorio tiene 0 likes y 1.110 descargas, lo que indica una validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-4.0bpw-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
