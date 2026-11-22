# Manaforge/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización en NVFP4 del modelo Qwen/Qwen3.8-27B (Apache-2.0), desarrollada por Manaforge Technologies y publicada el 21 de noviembre de 2026. El checkpoint está pensado específicamente para el motor de inferencia evoke, también de Manaforge, y reduce el peso en disco a 24,9 GB manteniendo una fidelidad alta frente a la referencia en BF16: divergencia KL media de 0,0169 y coincidencia top-1 del 95,50% sobre cinco corpus (código, multilingüe, matemáticas, chat y wikitext).

El modelo base es un transformer de Qwen con 20.525.282.032 parámetros reales en safetensors (etiquetado comercialmente como 27B), que combina capas de atención con Gated DeltaNet (atención lineal) y capas MLP, además de un cabezal de predicción multi-token (MTP) y un codificador de visión para entrada de imágenes en línea. La cuantización emplea GPTQ con escalas de bloque NVFP4 (pesos E2M1, grupos de 16, escalas E4M3), con capas sensibles preservadas en FP8 y BF16.

Su relevancia es doble: por un lado, demuestra que una cuantización FP4 bien calibrada puede acercarse mucho al BF16 en modelos híbridos con atención lineal; por otro, está atada a un motor concreto (evoke), lo que limita su portabilidad frente a alternativas como vLLM o SGLang. Con solo 4 descargas y 0 likes en el momento de la consulta, es un artefacto muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal Gated DeltaNet y capas MLP; cabezal MTP; codificador de visión |
| Parametros totales | 20.525.282.032 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1, grupos de 16, escalas E4M3), FP8 y BF16 en capas sensibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 24,9 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida: 48 capas de atención lineal Gated DeltaNet (con proyecciones `in_proj_qkv`, `in_proj_z`, `out_proj` y convoluciones `conv1d`) combinadas con capas MLP (64 capas en total según el mapa de precisión), además de un cabezal de predicción multi-token (MTP) y un codificador de visión. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

La cuantización se realizó con GPTQ: cada escala de bloque NVFP4 se elige dentro del solve de GPTQ y después se reajustan las escalas dos veces con los códigos fijos. Las capas que más precisión perdían en 4 bits se migraron a FP8, grupo a grupo, según la KL medida. La receta se documenta como `weights-gptq-replay-refit-codefirst-pfmap-chatcal`. La calibración usó 1.536 muestras (longitud de secuencia 512, 774.462 tokens) con una mezcla code-first: código de `bigcode/the-stack-smol-xs` (480 muestras), chat/código/matemáticas destilados de `a-m-team/AM-Qwen3-Distilled` (896 muestras) y texto web multilingüe de `allenai/c4` en en/de/fr/es/ja/zh/ar (160 muestras). El checkpoint incluye además un modo opcional de activaciones de dos términos (`--two-term-rows`) que baja la KL media a 0,0152 y sube la coincidencia top-1 al 96,04%, a costa de más tiempo de prefill.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, `conversational`).
- Entrada de texto e imágenes en línea: el codificador de visión se conserva en BF16.
- Razonamiento y matemáticas: el corpus de calibración incluye matemáticas destiladas y los benchmarks de fidelidad cubren `hendrycks_math`.
- Generación de código: mezcla de calibración code-first y evaluación sobre `codeparrot-clean`.
- Predicción multi-token (MTP): el cabezal se mantiene en BF16, lo que habilita decodificación especulativa en el motor evoke.
- Capacidades multilingües: la calibración incluye siete idiomas (en, de, fr, es, ja, zh, ar); el conjunto exacto de idiomas soportados no está disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en producción: el checkpoint conserva una fidelidad muy alta en código (KL media 0,0084, top-1 97,19%, perplejidad 3,569 frente a 3,559 del BF16), por lo que es adecuado para autocompletado y asistencia de código donde el coste de VRAM importa.
- Asistencia conversacional con contexto de imágenes: al mantener el codificador de visión en BF16, puede procesar capturas, diagramas o documentos escaneados junto a texto en un único flujo conversacional.
- Razonamiento matemático asistido: la KL en matemáticas es de 0,0074 con top-1 del 96,34%, lo que lo hace viable para resolución de problemas y verificación de cálculos en entornos con GPUs de 24-32 GB.
- Despliegue en una sola GPU consumer de gama alta: con 24,9 GB en disco y soporte nativo NVFP4 en `sm_120` (RTX 5090, RTX PRO 6000), permite servir el modelo con `--tensor-parallel-size 1` sin recurrir a múltiples aceleradores.
- Servicio compatible con OpenAI y Anthropic: `evoke serve` expone un servidor con ambas APIs, lo que facilita integrar el modelo en aplicaciones existentes que ya consumen esos formatos.
- Procesamiento multilingüe de documentos: la calibración incluye siete idiomas y la fidelidad multilingüe es razonable (KL 0,0126, top-1 94,46%), útil para resumen y extracción en corpus europeos y asiáticos.
- Investigación en cuantización FP4: las métricas de fidelidad publicadas (KL por corpus, perplejidad, coincidencia top-1) y el manifiesto de conversión lo convierten en un punto de referencia para estudiar el impacto de NVFP4 en arquitecturas híbridas con atención lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La model card publica métricas de fidelidad frente al BF16, no de capacidad:

| Corpus | KL media | KL mediana | KL p99 | Coincidencia top-1 | Perplejidad (este / BF16) |
|---|---|---|---|---|---|
| Código (codeparrot-clean valid) | 0,0084 | 0,0016 | 0,0924 | 97,19% ± 0,13% | 3,569 / 3,559 |
| Multilingüe (fineweb-2: deu, fra, jpn, arb) | 0,0126 | 0,0054 | 0,1142 | 94,46% ± 0,18% | 10,243 / 10,149 |
| Matemáticas (hendrycks_math test) | 0,0074 | 0,0022 | 0,0914 | 96,34% ± 0,15% | 3,303 / 3,289 |
| Chat (ultrachat_200k test_sft) | 0,0424 | 0,0046 | 0,4803 | 94,66% ± 0,18% | 13,415 / 13,381 |
| Wikitext (wikitext-2-raw-v1 test) | 0,0137 | 0,0052 | 0,1409 | 94,84% ± 0,17% | 7,273 / 7,216 |
| Media de 5 | 0,0169 | 0,0038 | 0,1838 | 95,50% | — |

Comparativa de fidelidad con otros checkpoints NVFP4 del mismo modelo base, medida con el mismo motor, referencia BF16 y corpus:

| Checkpoint | KL media | Coincidencia top-1 media |
|---|---|---|
| Este checkpoint, ajuste de máxima precisión (opt-in) | 0,0152 | 96,04% |
| Este checkpoint | 0,0169 | 95,50% |
| unsloth, activaciones de dos términos | 0,0234 | 94,13% |
| unsloth, tal como se publica | 0,0341 | 92,80% |
| RadixArk, LM head en BF16 | 0,0459 | 91,96% |
| NVIDIA | 0,0480 | 90,61% |
| QUASAR | 0,0559 | 90,96% |
| RadixArk | 0,0584 | 89,53% |

La comparativa no está ajustada por tamaño y los checkpoints públicos pueden puntuar distinto en los motores para los que fueron diseñados. La coincidencia top-1 es una medida por token y no es comparable con porcentajes de recuperación de precisión a nivel de tarea.

## Requisitos de hardware

- VRAM estimada: aproximadamente 25 GB o más para el checkpoint completo; el autor indica que la ruta emulada en GPUs `sm_80`–`sm_90` necesita unos 25 GB+ de VRAM (dos tarjetas de 24 GB con `--tensor-parallel-size 2`).
- GPUs recomendadas: NVIDIA `sm_120` (RTX 5090, RTX PRO 6000) para NVFP4 nativo de 4 bits en pesos y activaciones, con `--tensor-parallel-size 1`.
- GPUs consumer: cabe en una RTX 5090 o RTX PRO 6000; en GPUs de 24 GB de generaciones anteriores requiere dos tarjetas en paralelo tensorial, con precisión aún no medida.
- Opciones de despliegue: exclusivamente evoke (`pip install evoke-llm` o compilación desde `github.com/manaforged/evoke`), con `evoke serve` (API compatible con OpenAI y Anthropic) o `evoke generate`. El autor no ha verificado la carga en vLLM, SGLang ni otros motores.
- Latencia y throughput: no disponibles; la model card remite a `BENCHMARKS.md` del repositorio de evoke, sin cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Manaforge/Qwen3.8-27B-NVFP4 | 20.525.282.032 | no disponible | safetensors NVFP4/FP8/BF16 | Apache-2.0 | Solo evoke; 4 descargas |
| unsloth (NVFP4 de Qwen3.8-27B) | no disponible | no disponible | NVFP4 | Apache-2.0 (heredada) | Público; KL media 0,0341 |
| RadixArk (NVFP4 de Qwen3.8-27B) | no disponible | no disponible | NVFP4 | Apache-2.0 (heredada) | Público; KL media 0,0584 |
| NVIDIA (NVFP4 de Qwen3.8-27B) | no disponible | no disponible | NVFP4 | Apache-2.0 (heredada) | Público; KL media 0,0480 |

La comparativa se limita a otras cuantizaciones NVFP4 del mismo modelo base, que es lo que documenta la model card. No se dispone de datos de rendimiento en tareas ni de contexto para establecer comparaciones con modelos de otros tamaños.

## Limitaciones y advertencias

- Portabilidad muy limitada: el checkpoint solo está probado con evoke; no se ha verificado su carga en vLLM, SGLang, llama.cpp ni TGI.
- La ruta NVFP4 nativa requiere GPUs `sm_120`; en `sm_80`–`sm_90` se emula W4A4 y la precisión no se ha medido.
- La coincidencia top-1 del 95,50% implica que en aproximadamente 1 de cada 20 posiciones el modelo elige un token distinto al BF16, con mayor divergencia en chat (KL media 0,0424, p99 0,4803).
- Riesgo de alucinación: no evaluado en la información disponible; las métricas publicadas son de fidelidad frente al BF16, no de veracidad.
- Sesgos conocidos: no documentados; la calibración usa `allenai/c4` y datos destilados, lo que puede heredar sesgos de esas fuentes.
- Idiomas soportados: no se declara una lista oficial; la calibración cubre en, de, fr, es, ja, zh y ar, pero no hay garantía de cobertura fuera de esos idiomas.
- Longitud de contexto: no disponible; conviene verificarla en el modelo base antes de usos con contexto largo.
- Licencia Apache-2.0: permite uso comercial, pero la licencia del modelo base debe respetarse según el enlace a `LICENSE` del repositorio de Qwen.
- Madurez: versión 0.1.0, 4 descargas y 0 likes; es un artefacto muy reciente sin validación externa independiente.
- El modo de activaciones de dos términos mejora la fidelidad (KL 0,0152) pero incrementa el tiempo de prefill; hay que valorar el compromiso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manaforge/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Motor evoke: https://github.com/manaforged/evoke
- Benchmarks de evoke: https://github.com/manaforged/evoke/blob/main/BENCHMARKS.md (referencia parcial en la model card)
- Dataset de calibración (código): https://huggingface.co/datasets/bigcode/the-stack-smol-xs
- Dataset de calibración (chat/código/matemáticas): https://huggingface.co/datasets/a-m-team/AM-Qwen3-Distilled
- Dataset de calibración (multilingüe): https://huggingface.co/datasets/allenai/c4
