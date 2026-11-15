# keptn/ornith-1.5-35b-a3b-fp8

## Resumen

Ornith 1.5 35B-A3B es un modelo de mezcla de expertos (MoE) con capacidades de razonamiento, visión y generación de código desarrollado por el equipo Ornith, construido sobre Qwen3.5 (Apache 2.0). El modelo cuenta con 35 mil millones de parámetros totales y 3 mil millones activos por token, lo que lo sitúa en la categoría de MoE de activación reducida, adecuado para despliegues con requisitos de cómputo moderados pero con alta capacidad de conocimiento.

La ficha que nos ocupa, `keptn/ornith-1.5-35b-a3b-fp8`, no es un modelo nuevo sino una reempaquetado cuantizado a FP8 del modelo original de Ornith, optimizado específicamente para el motor de inferencia radiance sobre GPU AMD RDNA4. El archivo resultante ocupa 34,63 GiB en un único fichero `.rad`, emplea pesos FP8 (E4M3) con una escala por bloque de 128×128, activaciones en FP8 y un head de decodificación especulativa (MTP) con 3 tokens de borrador.

Su relevancia actual radica en que demuestra que es posible ejecutar un modelo multimodal de 35B-A3B con 262.144 tokens de contexto en hardware AMD consumer y profesional (Radeon AI PRO R9700), con velocidades de decodificación de 68,5 tokens/s en una tarjeta y hasta 364 tokens/s en cuatro, manteniendo una calidad muy cercana al original bf16 (KL medio de 0,0104 en MT-Bench).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, base Qwen3.5, con capas delta-net y cabeza MTP |
| Parametros totales | 35B (aproximado, segun nombre del modelo) |
| Parametros activos | 3B (aproximado, segun nombre del modelo) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (E4M3) con escala por bloque 128×128; lm_head FP8 con bloques 128×128; copia 2-bit del lm_head para draft; capas delta-net y MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance), 34,63 GiB en un solo fichero |
| Entradas | Texto e imagen |
| Motor de inferencia | radiance 1.8.1 o superior (radiance 2.0 no compatible) |
| Hardware objetivo | AMD RDNA4 (Radeon AI PRO R9700 probado) |
| Decodificacion especulativa | Si, cabeza MTP propia, 3 tokens de borrador |
| Version del fichero | 1.1 (2026-10-20) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos, construido sobre Qwen3.5 según los créditos de la model card. Incluye capas delta-net y una cabeza MTP (Multi-Token Prediction) que se emplea para decodificación especulativa con 3 tokens de borrador. El modelo original soporta entradas de texto e imagen (pipeline `image-text-to-text`), lo que implica un codificador visual integrado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Lo que sí está documentado es el proceso de cuantización de esta ficha concreta: se parte del release FP8 de Ornith (`ornith-ai/Ornith-1.5-35B-A3B-FP8`, revisión `fab11c26`), que usa una escala FP8 por fila, y se recuantiza cada capa lineal a FP8 con una escala por bloque 128×128 mediante redondeo al más cercano. Las capas delta-net y MTP, que en el release original están en bf16, reciben el mismo tratamiento de bloques. Adicionalmente se añade una copia 2-bit del lm_head para las rondas de borrador. No se utilizaron datos de calibración.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" activado por defecto y desactivable por petición mediante `chat_template_kwargs`.
- Generación de código, con ajustes de muestreo específicos recomendados por el autor (`--temp 0.6 --presence-penalty 0`).
- Comprensión de imágenes (image-text-to-text): evaluado en DocVQA y AI2D.
- Decodificación especulativa mediante cabeza MTP propia (3 tokens de borrador), que acelera la generación.
- Soporte de contexto largo: hasta 262.144 tokens compartidos entre todas las secuencias.
- Capacidades de agente y trabajo multi-paso, según la descripción del autor ("tuned for coding and agent work").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Entrada de audio y vídeo: la model card menciona secciones de "Images, audio and video" pero solo reporta mediciones para imágenes; no se confirma soporte efectivo de audio o vídeo.

## Casos de uso

- Asistencia de código en producción: el modelo está ajustado para coding y permite fijar parámetros de muestreo precisos (`temp 0.6`, `presence-penalty 0`), integrándose en pipelines de revisión o generación de parches con contexto de repositorio completo gracias a sus 262k tokens.
- Agentes autónomos multi-paso: la combinación de razonamiento con modo thinking, contexto largo y decodificación especulativa lo hace adecuado para bucles de planificación-ejecución donde el agente acumula historial extenso.
- Análisis de documentos con imágenes: con entradas image-text-to-text y evaluación en DocVQA, puede extraer información de documentos escaneados, formularios o diagramas (AI2D) combinando OCR implícito y razonamiento.
- Despliegue en hardware AMD RDNA4: es una de las pocas opciones documentadas para ejecutar un MoE multimodal de 35B en tarjetas Radeon AI PRO R9700, con 68,5 tokens/s en una tarjeta y 364 tokens/s en cuatro.
- Servicio de chat multi-usuario: con 8 secuencias concurrentes y un pool KV de hasta 2.097.280 tokens en dos o cuatro tarjetas, puede atender varias conversaciones largas simultáneas con throughput agregado de 513-728 tokens/s.
- Razonamiento sobre bases de código o corpus largos: los 262k tokens de contexto permiten ingerir módulos completos o transcripciones extensas sin truncamiento, útil para auditoría o resumen técnico.
- Prototipado e investigación en inferencia eficiente: sirve como banco de pruebas para técnicas de cuantización FP8 por bloques y decodificación especulativa con MTP en el ecosistema radiance.

## Benchmarks y rendimiento

Calidad frente al original bf16 (MT-Bench, 80 preguntas, ambos turnos, 42.305 tokens de respuesta):

| Metrica | Este fichero (FP8) | keptn/ornith-1.5-35b-a3b-w4a8 |
|---|---|---|
| KL medio | 0,0104 | 0,0165 |
| KL percentil 99 | 0,113 | 0,182 |
| Token top coincidente | 97,0% | 96,2% |
| Ratio de perplejidad | ×1,001 | ×1,003 |

Rendimiento en Radeon AI PRO R9700 a 215 W, radiance 1.8.1, KV FP8, 3 tokens de borrador, thinking off (BetterBench 0.6.1, temperatura 0,7, mediana de tokens/s):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | 68,5 | 276,5 | 364,0 |
| Prefill a 24k tokens | 9.073 | 13.777 | 14.750 |
| 4 streams, total | 110 | 513 | 728 |

Fidelidad multimodal (greedy, thinking off, 2 tarjetas, radiance 1.15.1):

| Entrada | Casos | Respuesta identica | KL medio | Token top coincidente |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D) | 20 | 10/20 | 0,210 | 181/199 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el fichero pesa 34,63 GiB. Con 2 o 4 tarjetas de 32 GB se reparte por tensor parallelism; con 1 tarjeta de 16 GiB se usa colocación `expert_tiered` con 16 GiB de memoria de host fijada (pinned).
- GPU recomendadas: AMD Radeon AI PRO R9700 (probada); cualquier GPU AMD RDNA4 compatible con radiance. No hay soporte documentado para NVIDIA ni para RDNA3.
- Cabe en consumer GPU: sí, en una Radeon AI PRO R9700 de 32 GB; en configuración de 16 GiB con expertos en memoria de host, a costa de velocidad.
- Opciones de despliegue: exclusivamente el motor radiance (versión 1.8.1 o superior; 2.0 no compatible), vía Docker (`stilldeadcode/radiance:1.8.1`) o ficheros compose del repositorio. No hay soporte para vLLM, llama.cpp, Ollama ni TGI con este formato `.rad`.
- Latencia y throughput: 68,5 tokens/s de decode en una tarjeta; 276,5 en dos; 364 en cuatro. Prefill de 9.073 a 14.750 tokens/s según número de tarjetas. Con 4 streams concurrentes, 110 tokens/s agregados en una tarjeta y 728 en cuatro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| keptn/ornith-1.5-35b-a3b-fp8 | 35B totales / 3B activos | 262.144 | MIT | `.rad` / radiance (AMD RDNA4) | Foco de esta ficha; FP8 por bloques 128×128 |
| keptn/ornith-1.5-35b-a3b-w4a8 | 35B totales / 3B activos | no disponible | MIT | `.rad` / radiance | Cuantización 4-bit pesos / 8-bit activaciones; peor KL (0,0165) |
| ornith-ai/Ornith-1.5-35B-A3B | 35B totales / 3B activos | 262.144 | MIT | safetensors / transformers | Original bf16, referencia de calidad |
| ornith-ai/Ornith-1.5-35B-A3B-FP8 | 35B totales / 3B activos | 262.144 | MIT | safetensors / transformers | FP8 con escala por fila; base de esta recuantización |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, Qwen3 MoE de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- El motor radiance solo funciona en tarjetas AMD RDNA4; no hay soporte para NVIDIA, RDNA3 ni CPU.
- El formato `.rad` es propietario y no es compatible con ecosistemas estándar (transformers, vLLM, llama.cpp, Ollama).
- La cuantización FP8 aplica un segundo redondeo sobre los pesos ya cuantizados del release original, lo que introduce una pérdida adicional de precisión (KL medio 0,0104 frente a bf16).
- En configuración de una sola tarjeta de 16 GiB, los expertos residen en memoria de host, lo que reduce notablemente la velocidad.
- Con el modo thinking activado, las tareas difíciles pueden requerir más de 32k tokens de salida.
- La fidelidad multimodal es limitada: solo 10 de 20 respuestas idénticas al original en DocVQA/AI2D, con KL medio de 0,210.
- No se dispone de información sobre sesgos, riesgos de alucinación específicos ni cobertura idiomática.
- La licencia es MIT (heredada del modelo base), lo que permite uso comercial, pero conviene verificar el fichero `LICENSE` del repositorio de Ornith.
- El número de descargas (103) y likes (1) es muy bajo, lo que sugiere poca validación comunitaria independiente.
- La model card indica que radiance 2.0 no es compatible actualmente, lo que limita la actualización del stack.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/keptn/ornith-1.5-35b-a3b-fp8
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Release FP8 base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Variante w4a8 del mismo autor: https://huggingface.co/keptn/ornith-1.5-35b-a3b-w4a8
- Repositorio del modelo Ornith: https://github.com/ornith-ai/Ornith-1
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
