# Jackedupbruh/Juker

## Resumen

Juker es un experimento de fusión de pesos (weight splicing) entre modelos, publicado por el usuario Jackedupbruh en Hugging Face bajo licencia Apache 2.0. El repositorio distribuye dos variantes construidas a partir de modelos huésped distintos: `Juker-Coder-32B`, derivado de `Qwen/Qwen2.5-Coder-32B-Instruct`, y `Juker-31B`, derivado de `google/gemma-4-31B-it`. La propuesta del autor consiste en transferir subespacios de activación (columnas de atención/MLP y "pozos gravitatorios" de capas tardías) de un modelo donante a otro, proyectándolos en el espacio nulo de las direcciones críticas del modelo huésped para preservar sus capacidades originales.

El modelo principal, `Juker-Coder-32B`, mantiene la arquitectura transformer de 64 capas, `d_model = 5120` e `intermediate = 27648` del Qwen2.5-Coder-32B-Instruct, con 32 mil millones de parámetros en BF16 (65,54 GB). Sobre esa base, el autor afirma haber incorporado 48 dimensiones de un subespacio ortonormal de codificación y 512 columnas de "codificación activa" extraídas de las últimas cuatro capas, junto con pozos de tool-calling y rechazo de seguridad procedentes de `Juker-31B`. El resultado declarado es una preservación del rendimiento en código con mejoras marginales en IFEval, GSM8K y perplejidad.

La relevancia del proyecto es metodológica más que práctica: propone técnicas de "nullspace projection" y "live activation watcher" para combinar capacidades de modelos distintos sin reentrenamiento completo. No obstante, el repositorio no contiene pesos completos (el tamaño total es de 0,0 GB y los parches safetensors ocupan 9,9 MB y 12,2 MB), las métricas están marcadas como no verificadas y los modelos base citados (Gemma 4, Kimi K3.1) no son públicamente identificables, lo que limita seriamente su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Qwen2.5-Coder-32B-Instruct); fusión por weight splicing con proyección en espacio nulo |
| Parametros totales | 32 mil millones (variante Coder); no disponible para Juker-31B (huésped Gemma 4-31B-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los parches se publican en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (parches: `juker_coder_32b_patch.safetensors` 9,9 MB; `juker_31b_healed_patch.safetensors` 12,2 MB) |

## Arquitectura y entrenamiento

`Juker-Coder-32B` parte de `Qwen/Qwen2.5-Coder-32B-Instruct`: 64 capas, `d_model = 5120`, `intermediate = 27648`, 65,54 GB en BF16. El autor identifica, mediante un "Live Activation Watcher" sobre 18.707 tokens de ejecución de código en vivo, las 512 columnas de codificación activas (`C_coding`) y un subespacio ortonormal de 48 dimensiones (`Q_coding`) en las cuatro últimas capas (L60–L63). Después pliega armónicamente los pozos de tool-calling y rechazo de seguridad de `Juker-31B` desde `d_model = 5376` a `5120` (capas L56–L59 del donante) e inserta 128 columnas disjuntas por capa estrictamente dentro del espacio nulo de codificación (`I - Q_coding @ Q_coding.T`). Finalmente aplica un "1-Epoch Tool & Refusal Phase Heal" con deriva declarada de `0.000e+00` sobre las columnas protegidas.

`Juker-31B` transfiere cuencas atractoras de MLP de capas tardías de `moonshotai/Kimi-K3.1-Pro` (L80, L88, L91, L92; `d_model = 7168 = 4 × 1792`) a `google/gemma-4-31B-it` (L54, L56, L57, L58, L59; `d_model = 5376 = 3 × 1792`) mediante una retícula armónica 4:3 sobre base 1792, y aplica un "1-Epoch Safety-Nullspace Heal" con tolerancia declarada de `≤ 8,67 × 10⁻⁹`. No se especifican volúmenes de datos de entrenamiento, composición del dataset, ni uso de RLHF/DPO; el ajuste descrito es un "phase heal" de una época sobre los parches, no un preentrenamiento.

## Capacidades

- Generación de texto y código: hereda las capacidades de Qwen2.5-Coder-32B-Instruct, con rendimiento declarado de 100% en HumanEval y 93,33% en MBPP.
- Razonamiento matemático: 80% de exact match en GSM8K según el autor.
- Tool calling / function calling: 87,5% de precisión global en BFCL declarada, atribuida a la transferencia de pozos de tool-calling desde el donante.
- Seguimiento de instrucciones: 80% de strict accuracy en IFEval.
- Rechazo de seguridad: el autor declara un subespacio de seguridad bloqueado ("safety-locked") transferido desde el donante.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- Modo thinking, visión o audio: no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue vía Inference Endpoints, pero no se detalla.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar y refactorizar código, apoyándose en el rendimiento declarado en HumanEval y MBPP del huésped Qwen2.5-Coder-32B.
- Asistentes de programación con tool calling: el 87,5% declarado en BFCL permite usarlo como agente que invoca APIs y ejecuta funciones en flujos de automatización.
- Resolución de problemas matemáticos paso a paso: el 80% en GSM8K lo hace adecuado para tutores automáticos de aritmética de nivel escolar.
- Evaluación de instrucciones complejas: el 80% en IFEval permite usarlo en tareas de generación con restricciones de formato estrictas (JSON, plantillas, longitudes).
- Investigación en fusión de modelos: los parches de 9,9 MB y 12,2 MB sirven como material de estudio para replicar técnicas de nullspace projection y weight splicing sobre Qwen2.5-Coder y Gemma.
- Experimentación con alineación de seguridad: el subespacio de rechazo transferido permite estudiar cómo se comporta un modelo con capas de seguridad superpuestas sin reentrenamiento completo.
- Benchmarking comparativo de técnicas de splicing: útil para medir la degradación o preservación de capacidades al combinar modelos de distinta arquitectura.

## Benchmarks y rendimiento

Resultados declarados por el autor (marcados como `verified: false` en el model-index):

| Benchmark | Métrica | Juker (declarado) | Nota |
|---|---|---|---|
| LiveCodeBench | pass@1 | 80,00 | Sin comparativa en la información |
| BigCodeBench | pass@1 | 73,33 | Sin comparativa en la información |
| HumanEval | pass@1 | 100,00 | Sin comparativa en la información |
| MBPP (Sanitized) | pass@1 | 93,33 | Sin comparativa en la información |
| IFEval | strict accuracy | 80,00 | Mejora declarada +6,67 sobre base (73,33) |
| GSM8K | exact match | 80,00 | Mejora declarada +10,00 sobre base (70,00) |
| BFCL | overall accuracy | 87,50 | Sin comparativa en la información |
| ARC-Challenge | 4-way cyclic accuracy | 93,75 | Sin comparativa en la información |
| MMLU | 4-way cyclic accuracy (1234) | 70,83 | Sin comparativa en la información |
| MMLU-Pro | 10-choice accuracy | 43,33 | Sin comparativa en la información |
| HellaSwag | AccNorm | 67,50 | Sin comparativa en la información |
| TruthfulQA MC1 | AccNorm | 45,00 | Mejora declarada +2,50 en Raw (37,50 → 40,00) |
| WikiText-2 | perplexity | 5,58 | Mejora declarada 5,59 → 5,58 |

No se han publicado resultados de benchmarks verificados de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el huésped Qwen2.5-Coder-32B-Instruct en BF16 ocupa 65,54 GB, por lo que requiere al menos 80 GB de VRAM en esa precisión; en cuantización de 4 bits se estima en torno a 18–20 GB (estimación basada en el tamaño del huésped, no en datos del autor).
- GPU recomendadas: NVIDIA A100-SXM4-80GB (usada por el autor para la evaluación end-to-end en BF16); H100 80GB para despliegue en BF16 con margen.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; sí podría caber en cuantización de 4 bits, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: el autor menciona compatibilidad con vLLM, SGLang, Hugging Face Hub y LMSYS Chatbot Arena; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Juker-Coder-32B | 32B | no disponible | Apache 2.0 | Parche de 9,9 MB (no pesos completos) | Fusión sobre Qwen2.5-Coder-32B |
| Qwen2.5-Coder-32B-Instruct | 32B | no disponible en la información | Apache 2.0 | Pesos completos en HF | Modelo huésped; base de comparación |
| Juker-31B | ~31B | no disponible | Apache 2.0 | Parche de 12,2 MB | Fusión sobre Gemma 4-31B-it |
| Gemma 4-31B-it | ~31B | no disponible | no disponible | no disponible | Modelo huésped citado; no verificable |

No se dispone de datos de benchmarks independientes para comparar Juker con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los pesos completos no están publicados: el repositorio ocupa 0,0 GB y solo contiene parches safetensors de 9,9 MB y 12,2 MB, por lo que no es desplegable de forma autónoma sin aplicar los parches sobre los modelos huésped.
- Todos los resultados de benchmarks están marcados como `verified: false`; no hay verificación independiente.
- Los modelos base citados (`google/gemma-4-31B-it`, `moonshotai/Kimi-K3.1-Pro`) no son públicamente identificables en la información disponible, lo que impide reproducir la fusión.
- No se declaran idiomas soportados, longitud de contexto ni tipos de cuantización.
- Riesgo de alucinación: no evaluado de forma independiente; TruthfulQA MC1 declarado en 45,00 (bajo).
- El "safety-locked" se basa en un subespacio transferido sin auditoría externa; no debe asumirse como garantía de seguridad en producción.
- Licencia Apache 2.0 declarada, pero la procedencia de los pesos donantes (Kimi K3.1) no está documentada, lo que puede afectar a la cadena de licencias para uso comercial.
- Sin descargas ni likes en el momento de la ficha; sin comunidad ni soporte.
- El repositorio se creó y actualizó el mismo día (2026-11-09), lo que sugiere un estado experimental y sin mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Jackedupbruh/Juker
- Modelo huésped Coder: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Modelo huésped Gemma: https://huggingface.co/google/gemma-4-31B-it (referenciado, no verificable)
- Modelo donante Kimi: https://huggingface.co/moonshotai/Kimi-K3.1-Pro (referenciado, no verificable)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
