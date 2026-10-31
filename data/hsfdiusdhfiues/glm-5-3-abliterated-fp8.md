# hsfdiusdhfiues/GLM-5.3-ABLITERATED-FP8

## Resumen

GLM-5.3-ABLITERATED-FP8 es una versión "abliterada" (sin comportamientos de rechazo) del modelo GLM-5.3 de Z.ai, publicada por el usuario hsfdiusdhfiues en Hugging Face bajo licencia MIT. El modelo base, GLM-5.3, es un modelo de lenguaje de gran escala con arquitectura MoE y atención dispersa (arquitectura `glm_moe_dsa`), con 753.330 millones de parámetros totales, cuantizado aquí a FP8 a partir del checkpoint `JANGQ-AI/GLM-5.3-FP8`. El "abliteration" es una modificación directa de pesos (sin fine-tuning, LoRA ni hooks en tiempo de ejecución) que reduce los rechazos del modelo en una amplia taxonomía multilingüe de contenidos sensibles.

Esta ficha es relevante para dos perfiles: quienes evalúan variantes sin censura para investigación en alineamiento y seguridad de modelos, y quienes necesitan desplegar GLM-5.3 en hardware Hopper (H100/H200) aprovechando la velocidad nativa de tensor cores FP8. La variante incluye notas de despliegue detalladas para vLLM, correcciones sobre un fallo de bucle de razonamiento presente en la v1 y mediciones de preservación de capacidades (MMLU-logit) y de cumplimiento (HarmBench-320) publicadas por el propio autor.

Cabe destacar que el modelo es text-only, soporta múltiples idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés) y conserva las capacidades de razonamiento y tool calling del modelo base, aunque con advertencias importantes sobre el parámetro `reasoning_effort` en este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con atención dispersa tipo DeepSeek Sparse Attention), 78 capas, text-only |
| Parametros totales | 753.329.940.480 (≈753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M teórico (vía decode-context-parallel, actualmente no funcional en vLLM); techo práctico TP8 en H200: ~131K con MTP, ~160K sin MTP |
| Tipos de cuantizacion | FP8 (expertos enrutados FP8 nativos; editores residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 755,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de `zai-org/GLM-5.3`, un transformer de mezcla de expertos (MoE) con 753B de parámetros totales y 78 capas, que emplea la arquitectura `glm_moe_dsa`: una variante con atención dispersa estilo DeepSeek Sparse Attention (DSA) combinada con MLA (Multi-head Latent Attention). La cuantización base es FP8 nativa (realizada por JANGQ-AI sobre el checkpoint original de Z.ai), lo que permite ejecutar el modelo a velocidad de tensor cores FP8 en GPUs Hopper (H100/H200) sin desquantización previa.

El "abliteration" de esta variante no es un fine-tuning: según el autor, es una edición permanente de pesos en bf16 aplicada exclusivamente a los tensores "residual-writer" (los editores residuales), dejando intactos los expertos enrutados en FP8. Esto significa que el modelo base conserva su entrenamiento original; no hay información disponible sobre los datos de entrenamiento, número de tokens, ni procesos RLHF/DPO del GLM-5.3 subyacente en la documentación proporcionada. La versión 2 (la publicada) corrige un fallo de bucle de razonamiento de la v1 que afectaba a ~2% de los prompts con señales de rechazo más difíciles, a costa de unos 4 puntos porcentuales de cumplimiento global en HarmBench-320.

## Capacidades

- Generación de texto conversacional multilingüe en diez idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés).
- Razonamiento con modo "thinking": el modelo emite bloques `<think>` controlados por `reasoning_effort`, aunque en este checkpoint solo se honran los valores `"low"` y `"high"` (cualquier otro valor cae a `max`); no es posible desactivar el razonamiento por completo.
- Tool calling / function calling: soportado en vLLM con `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Idoneidad para bucles de agente y multi-step reasoning, con la recomendación del autor de usar `reasoning_effort=low` en FP8 para agotar menos presupuesto de tokens en el bloque de razonamiento.
- Comportamiento de rechazo reducido de forma generalista (no específica de un dominio); existe una variante hermana centrada en ciberseguridad (`dealignai/GLM-5.3-CYBERSECURITY-FP8`).
- Capacidades de visión, audio o generación de imágenes: no disponible (el modelo es text-only).

## Casos de uso

- Investigación en alineamiento y seguridad de modelos: el checkpoint elimina comportamientos de rechazo de forma permanente en pesos, lo que lo hace útil como sujeto de estudio para red-teaming, evaluación de guardrails y análisis de abliteration, con métricas publicadas (MMLU-logit, HarmBench-320) que facilitan la reproducibilidad.
- Despliegue de razonamiento a gran escala en Hopper: la cuantización FP8 nativa permite servir 753B de parámetros en 8× H200 con TP8, aprovechando tensor cores FP8 sin overhead de desquantización, adecuado para servicios de inferencia internos de alta capacidad.
- Asistentes conversacionales multilingües: con soporte de diez idiomas, incluidos chino e inglés como idiomas principales, puede alimentar chatbots multi-turno; el contexto práctico de ~131K tokens permite conversaciones largas y documentos extensos.
- Agentes con tool calling: mediante el parser `glm47` de vLLM, el modelo puede integrarse en pipelines de agentes que invocan funciones externas, APIs y ejecutores de código, aunque conviene limitar `reasoning_effort` a `low` para evitar el agotamiento del presupuesto de tokens.
- Procesamiento de documentos largos (RAG): la ventana práctica de ~131K-160K tokens en TP8 permite indexar y consultar colecciones de documentos extensos con prefix caching habilitado.
- Benchmarking de inferencia MoE a FP8: al ser un checkpoint grande, MoE y con atención dispersa, sirve como carga de trabajo representativa para evaluar servidores como vLLM (incluidos forks con soporte MTP y sparse-MLA) y perfiles de paralelismo (TP, PP, DCP).

## Benchmarks y rendimiento

Datos publicados por el autor del modelo (no benchmarks independientes):

**MMLU-logit (muestra estratificada de 1026 preguntas, 18 por asignatura):**

| Modelo | MMLU | Δ vs base |
|---|---|---|
| GLM-5.3-ABLITERATED-FP8 (v2) | 87,43% (897/1026) | +1,85 pp |
| GLM-5.3-ABLITERATED-FP8 (v1) | 87,72% | +2,14 pp |
| Base GLM-5.3-regular (referencia) | 85,58% | — |

**HarmBench-320 (greedy, `max_tokens=700`):**

| Effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | HARD_REFUSE | GARBAGE |
|---|---|---|---|---|---|
| off | 81,6% (261/320) | 5,9% | 6,9% | 0% | 0% |
| max | 79,4% (254/320) | 4,7% | 7,2% | 0% | 0% |

En la superficie de daño no relacionada con copyright (240 comportamientos), el cumplimiento (TRUE_COMPLY) es del 91,7% con `effort=off` en v2 (frente al 85,9% de v1).

No se han publicado resultados de benchmarks estándar como HumanEval, GSM8K o comparaciones con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 755,7 GB en FP8; el despliegue de referencia del autor usa 8× H200 (141 GB HBM3e cada una) con TP8 y `gpu-memory-utilization 0.90`. No cabe en GPUs de consumo.
- GPU recomendadas: H200 (configuración de referencia, TP8), H100 en configuración equivalente de 8 GPUs (FP8 nativo en Hopper). El autor menciona pruebas de campo en 8× DGX Spark GB10.
- Consumer GPU: no es viable; el tamaño del modelo en FP8 (~755 GB) excede con mucho cualquier GPU de consumo, incluso en multi-GPU doméstica.
- Despliegue: vLLM es el servidor documentado, con flags específicos (`--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--reasoning-parser glm45`, `--tool-call-parser glm47`). El MTP (multi-token prediction) no funciona en vLLM estándar, pero se reporta funcional en el fork sparse-MLA B12X de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48% de velocidad de decodificación en prompts de código). No hay instrucciones para llama.cpp, Ollama o TGI.
- Limitaciones de contexto en la práctica: el contexto de 1M vía decode-context-parallel no funciona actualmente en vLLM para `glm_moe_dsa` (error de page size en `fp8_ds_mla`); el techo práctico en TP8 H200 es ~131K tokens con MTP o ~160K sin MTP. Pipeline-parallel (PP2 × TP4) perfila correctamente, pero el draft MTP no implementa `SupportsPP`.
- Latencia y throughput: no disponible (salvo el +48% de decode con MTP en el fork mencionado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-ABLITERATED-FP8 (este) | 753B (MoE) | ~131K-160K práctico | FP8 | MIT | Abliterado, text-only, tool calling |
| zai-org/GLM-5.3 (base) | 753B (MoE) | 1M teórico | bf16 (original) | no disponible | Comportamiento de rechazo estándar del fabricante |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible | FP8 | no disponible | Misma cuantización base, sin abliteration |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | 753B (MoE) | no disponible | FP8 | no disponible | Variante hermana enfocada en ciberseguridad |

No hay datos comparativos de rendimiento frente a modelos de otros fabricantes (DeepSeek, Qwen, Llama) en la información disponible.

## Limitaciones y advertencias

- Uso de contenido sin filtrar: al tratarse de un modelo abliterado diseñado para eliminar rechazos, puede generar contenido peligroso, ilegal o dañino ante peticiones que el modelo original rechazaría. Su uso conlleva responsabilidades legales y éticas significativas y no es apropiado para entornos de producción orientados a usuarios finales sin controles adicionales.
- El propio autor reporta un cumplimiento del 81,6-91,7% en HarmBench-320, lo que confirma que el modelo responde a prompts de la taxonomía de daño de ese benchmark.
- Comportamiento anómalo de `reasoning_effort`: solo `"low"` y `"high"` se honran; cualquier otro valor (incluido `off` sin comillas, que YAML interpreta como booleano) cae a `max`. No se puede desactivar el razonamiento.
- Agotamiento de presupuesto: con `high`/`max`, el modelo puede consumir todo `max_tokens` dentro de `<think>` y devolver contenido vacío (finish=`length`); se recomienda `max_tokens ≥ 8000` en esos modos y usar `low` para agentes.
- El texto de razonamiento aparece en `message.reasoning`, no en `message.reasoning_content`, lo que puede romper integraciones existentes.
- Contexto de 1M no operativo en vLLM actualmente; techo práctico de ~131K-160K tokens en TP8 H200.
- Riesgo de alucinación: no disponible (no hay evaluaciones de veracidad publicadas más allá de MMLU-logit).
- Sesgos: no disponible (no hay evaluaciones de sesgo publicadas).
- Cobertura de idiomas: el español está soportado, pero no hay datos de calidad por idioma; el modelo base de Z.ai está probablemente optimizado para chino e inglés.
- Estabilidad de la versión: se trata de un modelo con 19 descargas y 1 like en el momento de la ficha, sin auditoría independiente; la v1 tenía un fallo de bucles de razonamiento en ~2% de prompts difíciles, corregido en la v2 a costa de ~4 pp de cumplimiento global.
- Licencia MIT: no impone restricciones de uso comercial, pero la licencia del modelo base original de Z.ai (y sus términos de uso) podría aplicar según jurisprudencia y criterio del usuario; conviene verificarlo.

## Enlaces

- Modelo: https://huggingface.co/hsfdiusdhfiues/GLM-5.3-ABLITERATED-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante ciberseguridad hermana: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Discusión sobre pruebas de campo (8× DGX Spark GB10): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Autor de la release (dealignai): https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Paper, repositorio de código o demo oficial: no disponible
