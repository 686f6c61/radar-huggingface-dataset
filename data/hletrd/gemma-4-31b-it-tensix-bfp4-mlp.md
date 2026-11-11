# hletrd/gemma-4-31B-it-Tensix-BFP4-MLP

## Resumen

`hletrd/gemma-4-31B-it-Tensix-BFP4-MLP` es una cuantización del modelo multimodal `google/gemma-4-31B-it` de Google, publicada por el usuario hletrd (atribuida a Xylolabs) y orientada específicamente al hardware de aceleradores Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 (transformer multimodal image-text-to-text con 60 capas) y aplica una cuantización de bloque (block floating point) selectiva: las proyecciones de atención se redondean a `ttnn.bfloat8_b` (BFP8, 8,5 bits por peso) y las proyecciones MLP a `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso), mientras que embeddings, normas, LM head y el torre de visión permanecen en bf16.

El resultado es un checkpoint de 32.682.375.020 parámetros que ocupa 23,53 GB empaquetado (6,13 bits por peso de media) frente a los 61,39 GB del modelo base en BF16, con una pérdida de fidelidad medida de KL medio 0,05998 respecto a BF16 y un top-1 del 92,25 % en 8.048 posiciones de texto inglés y coreano. Es relevante porque demuestra que es posible reducir a menos de la mitad el peso de un modelo de 31B con una degradación muy contenida, y porque está diseñado para que TT-NN empaquete los pesos sin re-redondeo, algo poco habitual en cuantizaciones publicadas para hardware específico.

La limitación principal es que el autor solo ha validado el empaquetado en el simulador ttsim de Blackhole con ttnn 0.81.1, no en silicio real, y que el modelo no está integrado en tt-transformers (que no soporta Gemma 4) ni probado con tt-forge/tt-xla. Se trata, por tanto, de un artefacto experimental de cuantización más que de un modelo listo para producción en NPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), 60 capas, basada en Gemma 4 |
| Parámetros totales | 32.682.375.020 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención; bf16 en embeddings, normas, LM head y visión; media 6,13 bits/peso |
| Idiomas soportados | no disponibles (calibración y evaluación en inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP4/BFP8) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `google/gemma-4-31B-it`, un transformer multimodal de 60 capas que procesa imagen y texto. La cuantización se aplica de forma selectiva por tipo de proyección: las matrices q, k, v y o de las 60 capas se redondean a `ttnn.bfloat8_b` mediante redondeo al más cercano, mientras que las proyecciones gate, up y down del MLP se redondean a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El LM head (atado al embedding), las normas, el resto de tensores y los módulos `embed_vision` y `vision_tower` permanecen en bf16 sin cambios.

La innovación técnica clave es que los ficheros se guardan en bf16 pero cada valor ya está situado sobre la rejilla de BFP4 o BFP8, de modo que TT-NN los empaqueta directamente sin un segundo redondeo. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y scripts `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado no altera ningún valor. No se ha realizado entrenamiento adicional, RLHF ni ajuste fino: es exclusivamente una transformación de precisión del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), incluyendo modo de razonamiento con thinking activado.
- Procesamiento multimodal image-text-to-text: el pipeline declarado es `image-text-to-text` y conserva `embed_vision` y `vision_tower` en bf16.
- Razonamiento de múltiples pasos y respuestas de tipo reasoning (el autor evalúa 7 prompts de razonamiento con thinking on).
- Capacidades multilingües heredadas del modelo base, con calibración y evaluación específicas en inglés y coreano.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en NPUs Wormhole y Blackhole mediante TT-NN, reduciendo el peso de 61,39 GB a 23,53 GB y permitiendo ajustar un modelo de 31B en configuraciones de memoria más limitadas.
- Investigación en cuantización de bloque: sirve como referencia reproducible para estudiar el impacto de BFP4 en MLP frente a BFP8 en atención, con métricas de KL y top-1 publicadas y scripts de verificación incluidos.
- Prototipado multimodal en entornos simulados: el autor lo valida en ttsim (simulador de Blackhole), por lo que es adecuado para desarrollar pipelines de inferencia imagen-texto antes de disponer de hardware.
- Evaluación comparativa de precisión: permite contrastar la fidelidad de BFP4/BFP8 frente a Q4_K_M de llama.cpp sobre el mismo checkpoint base, usando el protocolo de 8.048 posiciones y 40 preguntas del autor.
- Generación de código y respuesta conversacional: hereda las capacidades del Gemma 4 base de 31B, aprovechables en asistentes técnicos una vez validado el despliegue en hardware real.
- Docencia y formación en hardware de IA: el par de scripts `pack_tensix.py` y `verify_grid.py` ilustra el flujo completo de empaquetado y verificación de pesos en Tensix, útil para cursos sobre aceleradores y formatos numéricos.
- Base para futuras cuantizaciones: al estar los valores ya alineados a la rejilla BFP, puede reempaquetarse exactamente en `ttnn.bfloat8_b` o servir de punto de partida para variantes con otras mezclas de precisión.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-31B-it`) | 16 | 61,39 | 0 | 100 | 40 de 40 | - |
| **Este modelo** | 6,13 | 23,534 | 0,05998 | 92,25 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 18,687 | 0,05170 | 92,69 | 40 de 40 | 0 |

Las métricas de KL y top-1 cubren 8.048 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total). El autor advierte que estas cifras miden cercanía a BF16, no calidad de tarea, y que no se midió velocidad en dispositivo. El criterio de aceptación fijado (KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional) se cumple con holgura: 1,16 veces el KL de Q4_K_M y 0 respuestas perdidas frente a 0.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,53 GB empaquetado en BFP4/BFP8; en bf16 sin empaquetar el checkpoint ocupa aproximadamente 61,39 GB.
- Hardware objetivo: NPUs Tensix de Tenstorrent Wormhole y Blackhole.
- El demo oficial de Gemma 4 en tt-metal (v0.81.1) ejecuta el modelo 31B en paralelo de tensores sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o sobre un Wormhole T3K; no cabe en un solo chip.
- GPU consumer: no disponible; no se documenta ejecución en GPU con esta cuantización, y los formatos BFP4/BFP8 son específicos de TT-NN.
- Despliegue: `transformers` para carga en bf16; TT-NN (ttnn 0.81.1) para empaquetado y ejecución en Tensix; tt-forge/tt-xla aún no probado con Gemma 4.
- Validación realizada únicamente en el simulador ttsim de Blackhole, sobre las dos primeras capas y un chip simulado; el reparto multi-chip no se ejecutó.
- Latencia y throughput: no disponibles (el autor indica que no se midió velocidad en dispositivo).

## Comparativa con modelos similares

| Modelo | Parámetros | Bits/peso | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| Este modelo | 32,68 B | 6,13 | 23,53 GB | no disponible | apache-2.0 | Hugging Face, validado en simulador |
| `google/gemma-4-31B-it` (BF16) | 32,68 B | 16 | 61,39 GB | no disponible | apache-2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 32,68 B | 4,87 | 18,687 GB | no disponible | apache-2.0 | Generado por el autor, no publicado como repo |
| Gemma 4 31B en tt-metal (demo oficial) | 32,68 B | bf16 / bfp8 según override | no disponible | no disponible | apache-2.0 | Repo tt-metal v0.81.1, multi-chip |

## Limitaciones y advertencias

- Solo se ha validado el empaquetado en el simulador ttsim con ttnn 0.81.1; no se ha ejecutado en hardware Tensix real.
- El reparto multi-chip del demo de tt-metal no se probó; la comprobación se limitó a las dos primeras capas en un chip simulado.
- tt-transformers no soporta Gemma 4, por lo que no existe integración de alto nivel para este checkpoint.
- tt-forge/tt-xla no se ha probado con Gemma 4; su opción `bfp_bf4` re-redondea los pesos con otro diseño de bloque, lo que rompería la propiedad de empaquetado exacto.
- El demo `gemma4_31b_qb2` de tt-metal empaqueta todas las proyecciones en bfloat4_b y re-redondearía la atención BFP8 de este checkpoint; no fue probado.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión se mantiene en bf16 y no se evaluó su comportamiento tras la conversión.
- Las métricas publicadas miden fidelidad respecto a BF16 (KL y top-1), no calidad de tarea; no hay benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.
- No se midió latencia ni throughput en dispositivo.
- Riesgo de alucinación y sesgos: heredados del modelo base; no se documentan análisis específicos tras la cuantización.
- Idiomas: no se declara una lista oficial; la calibración y evaluación se limitan a inglés y coreano.
- Licencia Apache 2.0 según la model card del base, aunque el repositorio original de Google no incluye fichero LICENSE; los cambios se documentan en `NOTICE`.
- El autor no está afiliado ni respaldado por Tenstorrent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-31B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Revisión concreta del base citada por el autor: https://huggingface.co/google/gemma-4-31B-it/tree/842da3794eaa0b77d5f08bae87a17459d91ff475
- Demo Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Demo gemma4_31b_qb2 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4_31b_qb2
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
