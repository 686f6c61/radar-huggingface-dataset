# dealignai/Ripple-65B-Preview-UNCENSORED-GGUF

## Resumen

Ripple-65B-Preview-UNCENSORED-GGUF es una versión cuantizada en formato GGUF del modelo denso Ripple-65B-Preview de ricursiveAI, publicada por dealignai. El trabajo de dealignai consiste en eliminar el comportamiento de rechazo (abliteration) del modelo base y empaquetarlo para su ejecución con llama.cpp, incluyendo además un drafter de decodificación especulativa DFlash2 en BF16 sin modificar. El modelo conserva las capacidades de razonamiento, tool calling y contexto largo del original, pero responde a instrucciones que la versión alineada rechazaría.

El modelo base es un transformer denso de 64.782.689.360 parámetros (aproximadamente 65B), con 80 capas y una arquitectura híbrida que combina sliding window attention (SWA) con capas de atención completa. Según ricursive, el modelo fue preentrenado con 12 billones de tokens y soporta hasta 1M de tokens de contexto. La variante de dealignai mantiene la plantilla de chat y el tokenizer byte a byte idénticos a los del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de abliteration aplicada a un modelo de gran tamaño y su impacto medible en benchmarks de razonamiento (MMLU) y de cumplimiento de instrucciones dañinas (HarmBench); por otro, sirve como referencia técnica de despliegue de un modelo de 65B en hardware de consumo mediante cuantización agresiva (Q4_K_M e IQ2_XXS). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 7 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (80 capas, combinación de sliding window attention y atención completa) |
| Parametros totales | 64.782.689.360 (~65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1M tokens según el modelo base; la configuración de ejemplo usa 16.384 tokens (`-c 16384`) |
| Tipos de cuantizacion | Q4_K_M (~4,5 bits, calibrada con imatrix) e IQ2_XXS (~2,1 bits, calibrada con imatrix); existe un repo complementario NVFP4 para SGLang W4A4 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | DealignAI Community Model License v0.3 (los pesos base se rigen por la licencia del modelo original de ricursiveAI) |
| Formato de pesos | GGUF (llama.cpp); safetensors para el drafter DFlash2 en BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros con 80 capas y una arquitectura híbrida que intercala mecanismos de sliding window attention con capas de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo capacidad de modelado global. Ricursive indica que optimizó la arquitectura para sus plataformas de entrenamiento y servicio, y que el modelo fue preentrenado con 12 billones de tokens con soporte de hasta 1M de tokens de contexto. No se dispone de información sobre la composición del dataset de preentrenamiento ni sobre si se aplicaron fases de RLHF o DPO en el modelo base.

La variante de dealignai aplica abliteration sobre los pesos del modelo base para eliminar el comportamiento de rechazo, y después cuantiza a GGUF con calibración imatrix en dos niveles (Q4_K_M e IQ2_XXS). El paquete incluye un drafter de decodificación especulativa DFlash2 en BF16 sin modificar, lo que permite acelerar la generación manteniendo la distribución del modelo objetivo. La model card indica explícitamente que el repositorio no incluye tokens de calibración, vectores de rechazo, metadatos de la cirugía de pesos, volcados de evaluación ni scripts. La plantilla de chat y el tokenizer son idénticos a los del modelo base, y el modo de razonamiento se abre automáticamente, por lo que se recomienda reservar un presupuesto de 2048 tokens para respuestas completas.

## Capacidades

- Generación de texto conversacional y razonamiento con traza de pensamiento (`<think>`) que se abre automáticamente y se cierra dentro del presupuesto de tokens.
- Modo de razonamiento activable por turno: el modelo decide cuándo pensar, con presupuesto recomendado de 2048 tokens.
- Tool calling con formato Hermes.
- Decodificación especulativa mediante el drafter DFlash2 incluido, que acelera la inferencia sin alterar la distribución objetivo.
- Contexto largo nativo (hasta 1M tokens en el modelo base).
- Capacidad de seguir instrucciones que la versión alineada rechazaría, incluidas categorías duras de HarmBench.
- Soporte multilingüe limitado al inglés.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Investigación sobre alineación y abliteration: el bundle permite reproducir y auditar el efecto de eliminar el comportamiento de rechazo sobre un modelo de 65B, comparando MMLU y HarmBench entre la versión base y la uncensored con la misma cuantización.
- Red teaming y evaluación de seguridad: los resultados de HarmBench-320 por categoría (cibercrimen, químico-biológico, desinformación, etc.) sirven como material de referencia para calibrar clasificadores y políticas de moderación.
- Despliegue en hardware de consumo: la cuantización IQ2_XXS (22 GB) permite ejecutar un modelo de 65B en una GPU con 24 GB de VRAM, algo inviable con los pesos en BF16.
- Servicio de inferencia local con llama.cpp: el ejemplo de la model card (`llama-server` con `-ngl 999`, 16 hilos, contexto de 16.384 y 4 slots paralelos) sirve como configuración de partida para entornos de investigación sin acceso a clústeres.
- Aceleración mediante decodificación especulativa: el drafter DFlash2 incluido permite medir el impacto del speculative decoding en latencia sobre un modelo denso de 65B en llama.cpp.
- Estudio de degradación por cuantización: la comparación de MMLU entre Q4_K_M (60,4%) e IQ2_XXS (38,8%) ofrece un caso concreto para analizar la pérdida de calidad en cuantizaciones de 2 bits calibradas con imatrix.
- Evaluación de robustez de clasificadores: la nota del grader sobre reinterpretación benigna (8,6% de los `OK_HARD` auditados) es un ejemplo práctico de los límites de los clasificadores automáticos de cumplimiento dañino.

## Benchmarks y rendimiento

Los datos provienen de la model card de dealignai y se midieron sobre este bundle exacto, con razonamiento activado, decodificación greedy, repeat-penalty 1.0, presupuesto de 2048 tokens y 4 slots paralelos vía `llama-server`.

MMLU-500 (modo logit al final del prefill):

| Bundle | MMLU-500 | Δ vs base de la misma cuantización |
|---|---:|---:|
| Base Q4_K_M | 64,8% | — |
| UNCENSORED Q4_K_M | 60,4% | −4,4 pp |
| Base IQ2_XXS | 34,6% | — |
| UNCENSORED IQ2_XXS | 38,8% | +4,2 pp |

HarmBench-320 (resultado global):

| Cuantización | Hard comply | Soft | Hard refuse | Suspicious |
|---|---:|---:|---:|---:|
| UNCENSORED Q4_K_M | 91,2% | 0,6% | 0,0% | 8,1% |
| UNCENSORED IQ2_XXS | 93,4% | 0,9% | 0,0% | 5,6% |

HarmBench-320 por categoría (hard compliance %):

| Categoría | n | Q4_K_M | IQ2_XXS |
|---|---:|---:|---:|
| misinformation_disinformation | 54 | 98,1% | 100,0% |
| cybercrime_intrusion | 52 | 96,2% | 92,3% |
| chemical_biological | 42 | 97,6% | 97,6% |
| illegal | 53 | 90,6% | 90,6% |
| copyright | 80 | 90,0% | 92,5% |
| harmful | 18 | 77,8% | 94,4% |
| harassment_bullying | 21 | 61,9% | 81,0% |

Auditoría manual: sobre una muestra estratificada de 35 casos, 32/35 (91,4%) de las filas `OK_HARD` corresponden a cumplimiento dañino genuino y 3/35 (8,6%) a reinterpretación benigna. Proyectado al total de 320, el cumplimiento estricto real se estima en ~83,4% para Q4_K_M y ~85,5% para IQ2_XXS. `OK_IN_THINK` fue 0 en las tres cuantizaciones. No se han publicado resultados de benchmarks del modelo base en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 38 GB en disco y requiere al menos ~40 GB de VRAM para cargarse entera en GPU; IQ2_XXS ocupa 22 GB y cabe en GPUs de 24 GB.
- GPU recomendadas: A100 80 GB o H100 para Q4_K_M con contexto largo; RTX 4090 (24 GB) para IQ2_XXS; configuraciones multi-GPU o descarga parcial de capas en CPU (`-ngl`) para Q4_K_M en hardware de consumo.
- Cabe en GPU de consumo: sí, IQ2_XXS en RTX 3090/4090 (24 GB); Q4_K_M requiere 40 GB o más, por lo que no cabe en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-server`), con drafter DFlash2 para decodificación especulativa; el repo complementario NVFP4 está pensado para SGLang con W4A4.
- Latencia y throughput: no disponibles. La configuración de ejemplo usa `-ngl 999 -t 16 -c 16384 --temp 0 --repeat-penalty 1.0` con 4 slots paralelos, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dealignai/Ripple-65B-Preview-UNCENSORED-GGUF | ~65B denso | Hasta 1M (base); 16K en ejemplo | DealignAI Community v0.3 | GGUF | Abliterated, incluye drafter DFlash2 |
| ricursiveAI/Ripple-65B-Preview | ~65B denso | Hasta 1M | No disponible en la información | No disponible | Modelo base alineado |
| prometheusAIR/Ripple-65B-Preview-GGUF | ~65B denso | Hasta 1M (base) | No disponible en la información | GGUF | Cuantización del base sin abliteration |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento se limita a los valores de MMLU y HarmBench de este bundle.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eludir rechazos de seguridad; puede generar contenido dañino en categorías como cibercrimen, químico-biológico, desinformación y acoso. Su uso previsto declarado es la investigación.
- La licencia DealignAI Community v0.3 es distinta de la del modelo base; es necesario revisar ambas para uso comercial. La licencia del modelo original de ricursiveAI no está detallada en la información disponible.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación no cuantificado en la información disponible; el modo de razonamiento con presupuesto de 2048 tokens puede truncar respuestas si se agota antes de cerrar `</think>`.
- La cuantización IQ2_XXS degrada notablemente el rendimiento en MMLU (38,8% frente a 60,4% en Q4_K_M), lo que limita su uso en tareas que requieran razonamiento preciso.
- El clasificador de HarmBench no distingue cumplimiento dañino genuino de reinterpretación benigna; las cifras de hard compliance están sobreestimadas en ~8 pp según la auditoría del propio autor.
- El repositorio no incluye scripts, tokens de calibración ni metadatos de la cirugía de pesos, lo que dificulta la reproducibilidad del proceso de abliteration.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente de la comunidad en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Repo complementario NVFP4: https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-NVFP4
- Cuantización GGUF del base por prometheusAIR: https://huggingface.co/prometheusAIR/Ripple-65B-Preview-GGUF
- Página del modelo en Ricursive: https://www.ricursive.com/ripple
- llama.cpp: https://github.com/ggml-org/llama.cpp
- X de dealignai: https://x.com/dealignai
- Web de dealignai: https://dealign.ai
