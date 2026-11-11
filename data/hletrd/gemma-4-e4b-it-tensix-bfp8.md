# hletrd/gemma-4-E4B-it-Tensix-BFP8

## Resumen

`hletrd/gemma-4-E4B-it-Tensix-BFP8` es una cuantización de `google/gemma-4-E4B-it` realizada por Xylolabs, pensada específicamente para su despliegue en NPUs Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante el stack TT-NN / tt-metal. El modelo conserva la arquitectura multimodal any-to-any del original (texto, imagen y audio) y aplica GPTQ con una rejilla de punto flotante por bloques `bfloat8_b` (BFP8) sobre las proyecciones lineales de atención y MLP de las 42 capas del modelo de lenguaje.

El resultado es un checkpoint de 8.667.245.130 parámetros totales que ocupa 11,34 GB empaquetado (17,4 GB en el repositorio, con pesos almacenados en bf16 pero ya alineados a la rejilla BFP8), con un promedio de 12,06 bits por peso. El resto de componentes —embeddings, LM head, normas, torres de visión y audio— permanece en bf16 sin modificar. La motivación es doble: evitar el re-redondeo al cargar en TT-NN y ofrecer una alternativa de cuantización de 8 bits por bloque con pérdida de calidad mínima frente a BF16.

La relevancia actual reside en que las herramientas estándar de cuantización (llama.cpp, GPTQ convencional) no producen tensores compatibles con la rejilla nativa de Tensix, y tt-transformers todavía no soporta Gemma 4. Este repositorio cubre ese hueco con un formato que el empaquetador de TT-NN consume directamente, verificado contra el simulador Blackhole (ttsim) con ttnn 0.81.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Gemma 4), con torres de visión y audio; capas lineales cuantizadas a BFP8 |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible (el modelo base E4B no se documenta como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en atención q/k/v/o y MLP gate/up/down; bf16 en embeddings, LM head, normas, torres de visión y audio; media de 12,06 bits por peso |
| Idiomas soportados | no disponible (la calibración GPTQ usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP8), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `google/gemma-4-E4B-it`, un transformer multimodal con pipeline `any-to-any` que integra un modelo de lenguaje, una torre de visión (`vision_tower`, `embed_vision`) y una torre de audio (`audio_tower`, `embed_audio`). Solo se cuantizó el modelo de lenguaje: las 42 capas con proyecciones de atención (q, k, v, o) y MLP (gate, up, down) se redondearon a la rejilla `bfloat8_b` mediante GPTQ, con el exponente compartido de cada bloque fijado por el propio empaquetador de TT-NN. El resto de tensores se mantiene en bf16 tal como en el modelo base.

La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El repositorio incluye `quant4.json`, que documenta el formato de cada proyección, y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar en TT-NN, incluyendo el round-trip por DRAM del dispositivo. El checkpoint se validó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, no sobre hardware físico. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni las etapas de RLHF/DPO aplicadas por Google.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con plantilla de chat (`apply_chat_template`).
- Entrada y salida multimodal any-to-any: procesamiento de imagen y audio a través de las torres correspondientes, conservadas en bf16.
- Modo de razonamiento explícito ("thinking"), evaluado por el autor con 7 prompts adicionales con thinking activado.
- Capacidades multilingües heredadas del modelo base; la evaluación de la cuantización cubrió inglés y coreano.
- Integración con el stack de Tenstorrent: TT-NN (`ttnn.as_tensor`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`), tt-metal (demo de Gemma 4 en v0.81.1) y compatibilidad parcial con tt-forge/tt-xla.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole y Blackhole: el checkpoint está prealineado a la rejilla BFP8, de modo que TT-NN lo empaqueta sin re-redondeo y se evita la pérdida adicional de precisión que introduciría una conversión en el dispositivo.
- Sustituto de BF16 en inferencia de bajo consumo: con 11,34 GB empaquetados frente a 15,04 GB en BF16 y una KL media de 0,00169, es adecuado para servir el modelo en entornos con memoria limitada manteniendo prácticamente la calidad del original.
- Evaluación y benchmarking de cuantizaciones en hardware de aceleración: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la fidelidad del empaquetado matriz a matriz, útil en pipelines de CI para cuantizaciones destinadas a Tensix.
- Asistentes multimodales en inglés y coreano: la calibración cubrió ambos idiomas y la evaluación de respuestas se realizó sobre prompts en esas lenguas, por lo que es la combinación con mejor validación empírica.
- Prototipado con el simulador Blackhole (ttsim): permite desarrollar y depurar integraciones de Gemma 4 en TT-NN antes de disponer de hardware, dado que tt-transformers aún no soporta Gemma 4.
- Investigación en cuantización de punto flotante por bloques: el repositorio documenta bits por peso, tamaño y métricas KL frente a BF16 y Q4_K_M, lo que lo convierte en una referencia reproducible para comparar BFP8 con cuantizaciones enteras de 4 bits.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E4B-it`) | 16 | 15,04 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP8)** | 12,06 | 11,337 | 0,00169 | 98,12 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,66 | 5,335 | 0,19989 | 81,05 | 36 de 40 | 0 |

Las métricas KL y top-1 se calculan sobre 7.968 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática más 7 de razonamiento repetidos con thinking activado (40 en total); "perdidas" indica respuestas correctas en BF16 que fallan en la cuantización. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11,34 GB empaquetado en BFP8; el repositorio ocupa 17,4 GB por almacenar los tensores en bf16.
- Hardware objetivo: NPUs Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole; el demo de tt-metal (v0.81.1) ejecuta E2B, E4B y 12B en una única Blackhole P150.
- Validación realizada sobre ttsim (simulador de Blackhole) con ttnn 0.81.1; no se ha probado en hardware físico según la model card.
- GPU convencionales: los pesos son safetensors en bf16 compatibles con `transformers` y `device_map="auto"`, por lo que pueden cargarse en GPUs con al menos ~17 GB de memoria en bf16, aunque el formato no aporta ventaja en ese entorno.
- Opciones de despliegue: TT-NN / tt-metal (soporte directo), tt-forge/tt-xla (sin ejecución verificada con Gemma 4), `transformers` con `AutoModelForCausalLM` (solo texto en el quickstart).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 8.667.245.130 | no disponible | BFP8 + bf16, 12,06 bits/peso | Apache 2.0 | Hugging Face, validado en ttsim |
| `google/gemma-4-E4B-it` (BF16) | 8.667.245.130 | no disponible | bf16, 16 bits/peso | Apache 2.0 | Hugging Face, referencia de calidad |
| Q4_K_M (llama.cpp) | mismo checkpoint | no disponible | 4 bits, 5,66 bits/peso | Apache 2.0 | Generado por el autor para comparación |
| Otras cuantizaciones de Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y no se han validado en este checkpoint.
- La validación se hizo exclusivamente sobre ttsim (simulador de Blackhole), no sobre silicio real; el comportamiento en Wormhole o Blackhole físico no está confirmado.
- tt-forge (tt-xla) no se ha ejecutado con Gemma 4; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los pesos y degradan la fidelidad respecto a este checkpoint.
- tt-transformers no soporta Gemma 4, lo que limita las rutas de integración listas para producción.
- La calibración GPTQ usó únicamente WikiText-2 (inglés) y Wikipedia en coreano; el comportamiento en otros idiomas no está evaluado.
- La evaluación de calidad se basa en 40 prompts cortos y métricas KL sobre 7.968 posiciones, una muestra reducida que no cubre tareas largas ni dominios especializados.
- Riesgo de alucinación y sesgos heredados del modelo base: no cuantificados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base de Google antes de desplegar en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-E4B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia: arXiv:2607.02770
