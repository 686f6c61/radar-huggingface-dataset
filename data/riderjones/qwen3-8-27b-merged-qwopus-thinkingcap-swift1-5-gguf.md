# RiderJones/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF

## Resumen

Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF es una familia de cuantizaciones GGUF con matriz de importancia (imatrix) publicada por el usuario RiderJones sobre un modelo fusionado de 27.320.697.856 parámetros (~27,3 B). El modelo subyacente es una fusión `dare_ties` de tres fine-tunes —Qwopus3.8-27B-Coder-Flash, Swift-1.5-Qwen3.8-27b y ThinkingCap-Qwen3.8-27B— anclados sobre una base Qwen3.8-27B de arquitectura híbrida Mamba2 + atención. El objetivo declarado es combinar razonamiento arquitectónico profundo, generación de código front-end/full-stack y ejecución sin bucles repetitivos.

El interés práctico de esta publicación no está en el modelo fusionado en sí (que ya existe en formato bfloat16), sino en el proceso de cuantización: las matrices de importancia se calibraron con un corpus filtrado por dominio de 419 fragmentos (`n_ctx=512`) de razonamiento sobre código en formato ChatML, trazas de uso de herramientas y prompts técnicos, con una perplejidad de calibración en BF16 de 3,4195 ± 0,02407. Además, se preservan las 15 tensores nativos de Multi-Token Prediction (`blk.64.nextn.*`) dentro de los GGUF, lo que permite decodificación especulativa autocontenida en `llama.cpp` sin modelo draft separado.

El repositorio ocupa 195,1 GB e incluye cuatro cuantizaciones (Q8_0, Q6_K, Q5_K_M y Q4_K_M). La licencia es Apache 2.0 y el único idioma declarado es inglés. Es un artefacto de nicho, orientado a desarrolladores que quieran ejecutar localmente un modelo de razonamiento y código de ~27 B con aceleración MTP en hardware de consumo o estaciones de trabajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Mamba2 + atención (base Qwen3.8-27B), con cabeza Multi-Token Prediction (MTP) |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens en la configuración de inferencia recomendada (`-c 65536`); contexto nativo máximo no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M (imatrix calibrada por dominio) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores MTP `blk.64.nextn.*` preservados) |

## Arquitectura y entrenamiento

El modelo subyacente parte de Qwen/Qwen3.8-27B, una arquitectura híbrida que combina capas Mamba2 con capas de atención clásicas, e incorpora una cabeza nativa de Multi-Token Prediction. Sobre esa base se aplicó una fusión `mergekit` con método `dare_ties`, `normalize: true`, `int8_mask: true` y dtype `bfloat16`. Los pesos normalizados de la receta son: Qwopus3.8-27B-Coder-Flash con densidad 0,75 y peso 0,60 (arquitectura de código y criterio de diseño); Swift-1.5-Qwen3.8-27b con densidad 0,45 y peso 0,25 (ejecución destilada por RL y prevención de bucles); y ThinkingCap-Qwen3.8-27B con densidad 0,35 y peso 0,15 (contención de espirales de razonamiento).

No se especifican en la información disponible el número de tokens de entrenamiento de los fine-tunes constituyentes, la composición exacta de sus datasets ni si hubo RLHF o DPO en cada uno de ellos (solo se menciona "RL-distilled" para Swift-1.5, sin detalle). La innovación técnica destacable de esta publicación concreta es doble: por un lado, la imatrix filtrada por dominio de código, calibrada sobre 419 fragmentos de 512 tokens con perplejidad BF16 de referencia 3,4195 ± 0,02407; por otro, la conservación íntegra de los 15 tensores `nextn`/MTP dentro de los GGUF, lo que habilita decodificación especulativa en `llama.cpp` mediante `--spec-type draft-mtp` sin necesidad de un draft model externo.

## Capacidades

- Generación de texto y razonamiento estructurado con bloques `<think>` de cadena de pensamiento, con supresión declarada de bucles de autocorrección repetitiva.
- Generación de código front-end y full-stack: HTML, CSS, JavaScript y código multiarchivo, con sesgo explícito hacia la estética y la arquitectura de UI.
- Uso de herramientas y trazas de tool-use: el corpus de calibración de la imatrix incluye trazas de uso de herramientas, lo que sugiere soporte de tool calling en el formato ChatML.
- Decodificación especulativa nativa mediante MTP integrado en el GGUF (`--spec-type draft-mtp`), sin modelo draft separado.
- Formato de prompt ChatML estándar de Qwen (`<|im_start|>` / `<|im_end|>`) con bloques `<think>`.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se declaran capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Generación de interfaces web en local: el modelo produce HTML/CSS/JS limpio y dashboards de una sola página; su sesgo hacia Qwopus Coder-Flash (peso 0,60) y la calibración de la imatrix sobre código estructurado lo hacen adecuado para prototipado rápido de UI sin conexión a servicios en la nube.
- Asistente de programación con razonamiento previo: los bloques `<think>` permiten obtener un plan de arquitectura antes del código, útil en tareas de refactorización multiarchivo donde interesa revisar el razonamiento antes de aplicar cambios.
- Agentes de codificación con tool calling: el formato ChatML y las trazas de tool-use del corpus de calibración permiten integrarlo en bucles de agente que invocan funciones (lectura de ficheros, ejecución de tests) dentro de `llama-server` con la API compatible con OpenAI.
- Servicio de inferencia local de alta velocidad: con MTP activado (`--spec-draft-n-max 5`, `--draft-p-min 0.1`) se obtienen ~40–60 tok/s en generación de código estructurado y ~25–40 tok/s en texto general con la cuantización Q8_0, suficiente para asistentes interactivos en estación de trabajo.
- Despliegue en GPU de consumo de 24 GB: la cuantización Q4_K_M está marcada como opción por defecto recomendada para GPUs de consumo con contexto largo, lo que permite ejecutar un modelo de 27 B en una RTX 4090 o similar.
- Evaluación de técnicas de fusión y cuantización: el repositorio documenta la receta `dare_ties` completa y el pipeline de imatrix, por lo que sirve como referencia reproducible para investigadores que estudien el impacto de la calibración por dominio en la calidad de GGUF.
- Prevención de bucles en generación larga: el componente ThinkingCap (peso 0,15) actúa como contención de espirales de razonamiento, lo que resulta útil en pipelines de generación de documentación técnica o código extenso donde otros modelos de 27 B entran en repeticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de calibración y de throughput:

| Métrica | Valor | Condiciones |
|---|---|---|
| Perplejidad de calibración BF16 | 3,4195 ± 0,02407 | 419 chunks, `n_ctx=512`, corpus de código ChatML |
| Throughput en código HTML/estructurado | ~40–60 tok/s | Q8_0, `--spec-type draft-mtp --spec-draft-n-max 5` |
| Throughput en texto general y razonamiento | ~25–40 tok/s | Q8_0 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 195,1 GB, por lo que cada cuantización individual es una fracción de ese total. Para un modelo de 27,3 B, Q8_0 ronda los ~29 GB de pesos, Q6_K ~22 GB, Q5_K_M ~19 GB y Q4_K_M ~16–17 GB (estimación por tamaño de parámetros, no confirmada en la model card).
- GPU recomendadas: la model card menciona GPUs de alta VRAM y Apple Silicon con memoria unificada para Q8_0, y "24 GB VRAM con contexto largo" como objetivo de Q4_K_M.
- Cabe en GPU de consumo: sí, previsiblemente Q4_K_M en una RTX 4090 (24 GB) o GPUs de 24 GB equivalentes; Q8_0 requiere estaciones de trabajo o memoria unificada.
- Opciones de despliegue: `llama.cpp` (`llama-server`), con flags recomendados `-ngl 99`, `-fa on`, `-c 65536`, `-ctk q8_0 -ctv q8_0`, `--spec-type draft-mtp`, `--spec-draft-n-max 5`, `--draft-p-min 0.1`, `--temp 0.6`, `--top-p 0.95`, `--top-k 20`, `--min-p 0.0`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: ~40–60 tok/s en código estructurado y ~25–40 tok/s en texto general con Q8_0 y MTP activado; no se aportan latencias de primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la información proporcionada. La comparación se limita a características estructurales frente a los componentes de la propia fusión:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF) | ~27,3 B | 65.536 (config. recomendada) | Apache 2.0 | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M) | Fusión dare_ties con MTP preservado e imatrix de código |
| Qwopus3.8-27B-Coder-Flash | no disponible | no disponible | no disponible | no disponible | Componente de código, densidad 0,75, peso 0,60 |
| Swift-1.5-Qwen3.8-27b | no disponible | no disponible | no disponible | no disponible | Componente de ejecución RL, densidad 0,45, peso 0,25 |
| ThinkingCap-Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Componente de contención de razonamiento, densidad 0,35, peso 0,15 |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | no disponible | no disponible | Ancla de la fusión, arquitectura híbrida Mamba2 + atención con MTP |

No se dispone de información para comparar con alternativas externas de la misma categoría (por ejemplo, otros modelos de ~27 B orientados a código y razonamiento).

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sesgos: no se documentan evaluaciones de sesgo; al ser una fusión de fine-tunes sin información sobre sus datos de entrenamiento, los sesgos de los componentes son desconocidos.
- Alucinación: no hay métricas de fidelidad ni de tasa de alucinación; el modo `<think>` puede producir razonamientos plausibles pero incorrectos que conviene verificar.
- Naturaleza del artefacto: es una cuantización GGUF publicada por un usuario individual (RiderJones) con 0 descargas y 1 like en el momento de la consulta; no hay validación externa ni benchmarks publicados. La reproducibilidad depende de la receta `dare_ties` documentada, pero los fine-tunes constituyentes tienen disponibilidad y licencias que no se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base y de los tres fine-tunes fusionados antes de un despliegue en producción, ya que la model card no las enumera.
- Contexto: los 65.536 tokens son la configuración recomendada de `llama-server`, no necesariamente el máximo nativo; con cuantización de caché KV en q8_0 puede haber degradación en contextos muy largos.
- Calidad de cuantización: la imatrix está calibrada específicamente para código y razonamiento técnico; el rendimiento en otros dominios (prosa creativa, conversación general) puede degradarse más que con una imatrix genérica.
- MTP: la decodificación especulativa depende de soporte de `--spec-type draft-mtp` en la versión de `llama.cpp` utilizada; versiones antiguas ignorarán los tensores `nextn` y perderán la aceleración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RiderJones/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF
- Modelo base de la cuantización (bfloat16): https://huggingface.co/RiderJones/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5
- Referencia citada en la model card: https://huggingface.co/mazuj2/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5
- Componente de código: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Componente de ejecución RL: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Componente de razonamiento: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Corpus de calibración de imatrix: https://huggingface.co/mahdisml/Uncensored-Imatrix-Calibration-Mixed-Data
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
