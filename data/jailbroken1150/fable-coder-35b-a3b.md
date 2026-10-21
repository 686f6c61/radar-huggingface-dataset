# Jailbroken1150/fable-coder-35B-A3B

## Resumen

fable-coder-35B-A3B es un modelo de pesos abiertos orientado a codificación agéntica, publicado por el usuario Jailbroken1150 y atribuido en su model card a Dappit Labs. Se construye sobre `huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated`, es decir, un Qwen3.6-35B-A3B (arquitectura MoE, 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos) que previamente había pasado por un destilado de razonamiento de Opus-4.7 y por un proceso de abliteración. Sobre esa base se aplican rondas de LoRA con datos de sesiones verificadas de Claude Code, con el objetivo de injertar comportamiento de agente (emitir tool calls, editar ficheros, ejecutar tests e iterar).

El modelo no pretende superar a sus maestros: la card lo describe explícitamente como un "behavioral graft", donde el razonamiento procede del destilado heredado y las rondas de entrenamiento propio añaden la capa agéntica. La ronda publicada es la r6, continuación estricta del adaptador r4, con 1.007 ventanas de datos exclusivamente agénticos. Conserva las cadenas nativas `<think>` de la familia Qwen y declara 256k de contexto nativo, con una caché KV inusualmente pequeña (solo 2 cabezas KV) que abarata el contexto largo.

Su relevancia práctica es doble: por un lado, ofrece un perfil de agente de código en un MoE de 35B que cabe en GPUs de 24-32 GB con cuantización Q4/Q5; por otro, su licencia Apache-2.0 permite uso comercial. Como contrapartida, es un modelo sin descargas ni validación externa en el momento de la ficha, con benchmarks generados por el propio autor y pendiente de SWE-bench Lite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`, familia Qwen3.6); solo 2 cabezas KV |
| Parámetros totales | 35.951.822.704 (≈35,95B) |
| Parámetros activos | ≈3B (nombre A3B) |
| Longitud de contexto | 256k nativo (según la model card); entrenamiento con longitud de secuencia 4096 |
| Tipos de cuantización | Q8_0 (38 GB), Q6_K (29 GB), Q5_K_M (25 GB), Q4_K_M (22 GB); generables F16, IQ4_XS y otras vía llama.cpp |
| Idiomas soportados | `en` (inglés) únicamente, según el campo `language` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 en el repo principal) y GGUF (repositorio de cuantizaciones aparte) |

## Arquitectura y entrenamiento

El modelo es un MoE de la familia Qwen3.6 con 35,95B de parámetros totales y aproximadamente 3B activos por token. La cadena documentada es: Qwen3.6-35B-A3B (Apache-2.0) → destilado de razonamiento de Opus-4.7 (`lordx64/...-Reasoning-Distilled`) → abliteración (`huihui-ai/...-abliterated`) → fine-tune LoRA agéntico (r3 → r4 → r6). El entrenamiento se realizó con LoRA de r=32 y α=32 sobre proyecciones de atención (q/k/v/o) y MLP (`gate_up_proj`, `down_proj`), en bf16, con `train_on_responses_only`, pérdida auxiliar del router MoE activada y longitud de secuencia 4096, usando unsloth y TRL `SFTTrainer`. La r6 es una continuación sobre el adaptador r4 con LR 2e-5, una época y 126 pasos.

La innovación metodológica declarada es la disciplina de continuación de adaptador: una ronda intermedia (r5) que reinició desde la base con un corpus filtrado sufrió una regresión severa (HumanEval de 90,9 a 71,3), y la corrección consistió en mantener el adaptador y usar un corpus final exclusivamente agéntico. Los datos de r6 son 1.007 ventanas de sesiones de Claude Code verificadas (generación propia, trazas comunitarias de Fable-5, corpus Glint y swarm-salvage), con rejection sampling limitado a sesiones cuyos tests o build pasaban, comprobación hash de no solapamiento respecto a rondas previas y limpieza de secretos y PII. No se documenta uso de RLHF ni DPO; el ajuste es SFT sobre respuestas.

## Capacidades

- Generación de código y razonamiento con cadenas de pensamiento nativas en formato `<think>`, heredadas del destilado de Opus-4.7 y verificadas como intactas por el autor.
- Comportamiento de agente de código: emite tool calls y ediciones de fichero cuando se ejecuta dentro de un harness agéntico; está entrenado sobre sesiones que incluían ejecución de tests e iteración.
- Razonamiento matemático y de conocimiento: GSM8K 94,7, MATH-500 88,2, MMLU-Pro 79,8 en el harness del autor.
- Soporte de tool calling / function calling: sí, es la capacidad central del fine-tune.
- Razonamiento multi-paso dentro de un bucle agéntico (editar, ejecutar, leer salida, corregir).
- Capacidad conversacional y de asistente general, aunque con riesgo de deriva de persona hacia una voz estilo Claude por el apilamiento de SFT de estilo Anthropic.
- Multilingüe: no; el campo `language` declara únicamente inglés.
- Visión: la etiqueta `image-text-to-text` aparece en los tags del repositorio, pero la model card no documenta ninguna capacidad multimodal ni arquitectura de visión; debe considerarse no confirmada.

## Casos de uso

- Agente de codificación en CLI o IDE: el modelo está entrenado sobre sesiones reales de Claude Code y emite tool calls y ediciones de fichero, por lo que puede integrarse en un bucle que lea el repositorio, aplique un parche, ejecute los tests y vuelva a intentarlo con la salida del comando.
- Reparación automatizada de CI: dentro de un pipeline, el modelo recibe el log de fallo de build o test y genera el parche correspondiente; su MBPP de 78,2 (frente a 73,0 de la base) apunta a mejora específica en tareas de síntesis de código a partir de especificación.
- Refactorización multi-fichero con contexto largo: los 256k de contexto nativo y una caché KV de solo ~2,7 GB a 32k y ~11 GB a 128k permiten cargar varios ficheros y el histórico de un proyecto en una GPU de 32 GB con Q5_K_M.
- Despliegue local o air-gapped con soberanía de datos: los GGUF Q4_K_M (22 GB) y Q5_K_M (25 GB) permiten ejecución en una workstation de 32 GB, en una tarjeta de 24 GB con contexto corto o en un Mac de 64 GB, sin enviar código a terceros.
- Generación de código en producción vía servidor de inferencia: al ser un MoE de ~3B activos, el coste de cómputo por token es bajo para su tamaño total, lo que lo hace apto para servir con vLLM o llama.cpp detrás de una API interna.
- Análisis cuantitativo y verificación matemática: con GSM8K 94,7 y AIME 73,3 (presupuesto de 16k tokens), sirve para resolver problemas paso a paso y generar explicaciones auditables en formato `<think>`.
- Base para nuevos ajustes: al distribuirse en safetensors bf16 con licencia Apache-2.0, puede actuar como punto de partida para LoRA propios manteniendo el comportamiento agéntico ya adquirido.
- Asistente técnico conversacional interno: útil para dudas de API o revisión de código, con la advertencia de que la persona puede derivar hacia un tono distinto del esperado.

## Benchmarks y rendimiento

Todas las cifras proceden del harness propio del autor: GGUF q8_0, pensamiento nativo con temperatura 0,6 y top-p 0,95, pass@1 con una sola muestra y ejecución local. No son directamente comparables con leaderboards oficiales.

| Benchmark | r6 (este modelo) | r4 (ronda previa) | Base (huihui) |
|---|---|---|---|
| HumanEval (pass@1) | 90,2 | 90,9 | 90,2 |
| MBPP (pass@1) | 78,2 | 76,2 | 73,0 |
| GSM8K | 94,7 | 95,0 | no disponible |
| MATH-500 | 88,2 | 89,4 | no disponible |
| AIME 24+25 (16k) | 73,3 | 71,7 | no disponible |
| MMLU-Pro | 79,8 | 77,2 | no disponible |

SWE-bench Lite en harness agéntico está declarado como pendiente y sin cifras verificadas en la información disponible. No se han publicado resultados de latencia ni throughput.

## Requisitos de hardware

- VRAM para inferencia (solo pesos): Q4_K_M 22 GB, Q5_K_M 25 GB, Q6_K 29 GB, Q8_0 38 GB; bf16 completo ≈72 GB.
- Caché KV (2 cabezas KV): ~2,7 GB a 32k, ~11 GB a 128k y ~21 GB a 256k, adicional a los pesos.
- GPU de 24 GB (RTX 3090, RTX 4090): viable con Q4_K_M en contexto corto.
- GPU de 32 GB (V100 32 GB, RTX 5090): Q4_K_M y Q5_K_M con contexto amplio.
- GPU de 40-48 GB (A6000, L40S, A100 40 GB): Q6_K con holgura; Q8_0 al límite.
- GPU de 80 GB (A100 80 GB, H100): bf16 completo o Q8_0 con contexto largo.
- Apple Silicon: Q8_0 en Mac de 64 GB; Q6_K en Mac de 48 GB; ejecución por CPU y Metal soportada.
- Consumer GPU: sí, en RTX 3090/4090 con Q4_K_M y contexto corto; en 32 GB con Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run achillessafehavencalls/fable-coder`), LM Studio y vLLM.
- Latencia y throughput: no disponibles. Cualitativamente, al activar ~3B parámetros por token el coste de cómputo es inferior al de un denso de 35B, pero no se publican números.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activos) | Contexto | HumanEval | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fable-coder-35B-A3B (r6) | 35,95B / ≈3B | 256k nativo | 90,2 | 78,2 | Apache-2.0 | HuggingFace (repo bf16 + repo GGUF) |
| fable-coder r4 (ronda previa) | 35,95B / ≈3B | 256k nativo | 90,9 | 76,2 | Apache-2.0 | Solo documentado en la card, sin repo independiente indicado |
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated (base) | 35,95B / ≈3B | no disponible | 90,2 | 73,0 | Apache-2.0 | HuggingFace (`huihui-ai`) |
| Qwen3.6-35B-A3B (origen de la cadena) | 35B / 3B | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |

No se dispone en la información proporcionada de comparativas con otros modelos de código agéntico de tamaño similar (por ejemplo, de otras familias), por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Modelo abliterado y etiquetado como `uncensored`: la alineación de seguridad del modelo original ha sido eliminada deliberadamente, con el consiguiente riesgo de generar contenido dañino, sesgado o NSFW sin rechazo.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad; el corpus de entrenamiento proviene de trazas de sesiones de Claude Code, con el sesgo de dominio y de estilo que ello implica.
- Alucinación: sin evaluación específica. En modo agente el riesgo se amplifica, ya que el modelo puede emitir tool calls sobre rutas, APIs o comandos inexistentes.
- Idioma: solo inglés declarado. El rendimiento en castellano no está evaluado ni garantizado.
- Benchmarks no comparables: todas las cifras son del harness propio del autor, en q8_0 y con prompting propio; HumanEval se mantiene plano frente a la base (90,2 en ambos) y ligeramente por debajo de r4 (90,9).
- SWE-bench Lite pendiente: la métrica que realmente mide el eje de agente de código no está publicada.
- Validación externa nula: 0 descargas y 0 likes en el momento de la ficha; no hay informes independientes de calidad.
- Deriva de persona: el apilamiento de SFT estilo Anthropic puede hacer que el modelo adopte una voz de Claude en uso conversacional.
- Capacidad multimodal no confirmada: la etiqueta `image-text-to-text` no está respaldada por documentación en la card.
- Trazabilidad de datos: el entrenamiento usa trazas de sesiones de terceros; aunque la licencia del artefacto sea Apache-2.0, conviene revisar las condiciones de origen de esos datos antes de un uso comercial sensible.
- Peso del repositorio: 71,9 GB en safetensors bf16, lo que exige planificar el almacenamiento y la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jailbroken1150/fable-coder-35B-A3B
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
- Cuantizaciones GGUF: https://huggingface.co/Achilles1089/fable-coder-35B-A3B-GGUF
- Ollama: https://ollama.com/achillessafehavencalls/fable-coder
- Dappit Labs: https://dappit.io
- Manifest Network (hardware de entrenamiento): https://manifest.network/
- Cuenta del autor en X: https://x.com/dappitdotio
