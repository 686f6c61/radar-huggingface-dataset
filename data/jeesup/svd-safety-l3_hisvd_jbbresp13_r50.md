# Jeesup/svd-safety-l3_hisvd_jbbresp13_r50

## Resumen

`svd-safety-l3_hisvd_jbbresp13_r50` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante HiSVD (implementación del proyecto `redai-infra/HiSVD`) hasta conservar aproximadamente el 50,5% de los parámetros densos, y posteriormente recuperado con la etapa 2 de LoRA propuesta por SVD-LLM. Lo publica el usuario Jeesup como artefacto de investigación dentro de un estudio sistemático sobre cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes repara mejor ese daño.

No es un modelo de conversación de propósito general: es una celda concreta de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de compresión. El modelo base es un transformer decoder-only de la familia Llama 3, con 8.030.261.248 parámetros reales según los safetensors del repositorio y una ventana de contexto heredada de Llama 3 (no declarada explícitamente en la model card). La calibración usada para la compresión fue `wikitext2:256,jbb_harm_resp:13` con longitud de secuencia 2048 y semilla 42, lo que indica que el conjunto de calibración mezcla datos genéricos con respuestas dañinas de JailbreakBench.

Su relevancia es metodológica: proporciona métricas publicadas de tasa de éxito de ataque (ASR) y de sobre-rechazo bajo compresión, lo que permite estudiar empíricamente el equilibrio seguridad-utilidad en modelos comprimidos. Cualquier uso en producción debe tratarse con cautela, ya que el propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido por SVD (HiSVD) con recuperación LoRA |
| Parametros totales | 8.030.261.248 (fracción densa resultante 0,5047 respecto al base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Llama-3-8B-Instruct, no declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (no declarado; se heredan las capacidades multilingües de Llama 3 sin garantía) |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El punto de partida es `meta-llama/Meta-Llama-3-8B-Instruct`, un transformer decoder-only denso de 8B parámetros con atención causal estándar. Sobre ese checkpoint se aplica HiSVD, una técnica de compresión por descomposición en valores singulares que elimina el 50,00% de los parámetros (fracción resultante 0,5047), con método de rango "stable", modulación logarítmica y alpha 1,0. La calibración emplea `wikitext2:256` junto con `jbb_harm_resp:13`, longitud de secuencia 2048 y semilla 42.

Tras la compresión se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre `alpaca-cleaned`. No se documentan en la información disponible el número total de tokens de entrenamiento del modelo base, la composición completa del dataset de Meta ni detalles de RLHF/DPO más allá de lo que ya incorpora Llama-3-8B-Instruct. La innovación técnica destacable es el uso de un conjunto de calibración que incluye respuestas dañinas de JailbreakBench, lo que vincula directamente la selección de componentes SVD al comportamiento de seguridad medido.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con la plantilla de Llama 3.
- Generación de código y matemáticas a nivel del modelo base, sin garantías tras la compresión al 50,5%.
- Soporte de tool calling y function calling: no disponible de forma declarada en la model card; se heredaría del base solo si la compresión no lo degrada.
- Capacidades de agente y razonamiento multi-paso: no declaradas; el autor indica explícitamente que no es un asistente desplegable.
- Capacidades multilingües: no disponibles de forma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.
- Comportamiento de rechazo medido: macro over-refusal de 0,1885 según WildGuard, y ASR de 0,0808 en AdvBench y 0,1438 en StrongREJECT según el juez HarmBench.

## Casos de uso

- Estudio de robustez frente a jailbreaks bajo compresión: usar el checkpoint como celda experimental para medir cómo varía el ASR de AdvBench y StrongREJECT al aplicar HiSVD al 50%, comparándolo con el modelo sin comprimir y con otras reglas de selección de la rejilla.
- Investigación sobre sobre-rechazo: emplear la métrica de macro over-refusal (WildGuard) para analizar si la compresión y la recuperación LoRA alteran la tasa de rechazos innecesarios en consultas benignas.
- Evaluación de reglas de selección de componentes SVD: este checkpoint corresponde a una configuración concreta (calibración `jbb_harm_resp:13`, rango estable, modulación logarítmica); sirve como referencia para comparar el impacto de otras reglas sobre la seguridad.
- Análisis de calidad lingüística tras compresión: medir la perplexity en WikiText-2 (23,4434 en este checkpoint) frente al modelo denso para cuantificar la pérdida de fluidez asociada a la eliminación del 50% de parámetros.
- Reproducción de experimentos de SVD-LLM: validar la etapa 2 de recuperación LoRA (U luego V, r=8, alpha=16, alpaca-cleaned) sobre un checkpoint HiSVD ya publicado, comprobando si los hiperparámetros reportados se replican.
- Auditoría de seguridad de modelos derivados: integrar el checkpoint en un pipeline de evaluación con HarmBench y WildGuard para documentar el efecto de la compresión sobre la alineación antes de considerar cualquier despliegue.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una técnica de compresión aparentemente neutra modifica propiedades de seguridad y utilidad medibles.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / protocolo |
|---|---|---|
| AdvBench ASR | 0,0808 | HarmBench judge |
| StrongREJECT ASR | 0,1438 | HarmBench judge |
| Macro over-refusal | 0,1885 | WildGuard |
| WikiText-2 perplexity | 23,4434 | no disponible (protocolo de evaluación no detallado) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8,03B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB para contextos moderados.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, ajustada) o RTX A6000 (48 GB).
- En GPU de consumo: cabe en RTX 4090 de 24 GB en bf16 con contextos cortos; en GPUs de 16 GB requeriría cuantización, no documentada en el repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están declarados ni se proporcionan pesos GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_hisvd_jbbresp13_r50` | 8,03B (50,5% densos) | no disponible | AdvBench ASR 0,0808; StrongREJECT 0,1438; PPL WikiText-2 23,4434 | Llama 3 Community | Hugging Face, 32 descargas |
| `meta-llama/Meta-Llama-3-8B-Instruct` (base) | 8,03B | 8.192 tokens (según Llama 3) | no disponible en esta fuente | Llama 3 Community | Hugging Face, ampliamente disponible |
| `Jeesup/svd-safety-l3_swift_remove50` | no disponible | no disponible | no disponible | Llama 3 Community (derivado) | Hugging Face |
| SVD-LLM (referencia metodológica) | variable | variable | no disponible | según implementación | repositorio del proyecto |

La comparación numérica directa con el modelo base sin comprimir no está publicada en la información disponible; el propio autor señala que la compresión por sí sola eleva la tasa de éxito de ataque, por lo que la lectura correcta es relativa dentro de la rejilla experimental.

## Limitaciones y advertencias

- El autor advierte explícitamente que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; este checkpoint no debe tratarse como un asistente desplegable.
- Riesgo de alucinación y pérdida de calidad lingüística por la eliminación del 50% de parámetros; la perplexity en WikiText-2 (23,4434) debe compararse con el base antes de extraer conclusiones.
- La compresión eleva el ASR: los valores 0,0808 (AdvBench) y 0,1438 (StrongREJECT) son medidos con HarmBench y no implican seguridad equivalente al modelo original.
- El sobre-rechazo macro de 0,1885 (WildGuard) indica que el modelo rechaza consultas benignas en una proporción no despreciable.
- Idiomas soportados no declarados; no hay garantía de rendimiento multilingüe tras la compresión.
- Longitud de contexto no declarada en la model card; se hereda la del base, pero no se verifica su preservación tras HiSVD.
- No se ofrecen pesos cuantizados (GGUF, GPTQ, AWQ) ni instrucciones de despliegue en llama.cpp u Ollama.
- La licencia Llama 3 Community impone restricciones de uso comercial y obligaciones de atribución; se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio y su cumplimiento es responsabilidad del usuario.
- El repositorio tiene 32 descargas y 0 likes, con fecha de creación y actualización en noviembre de 2026; se trata de un artefacto reciente y poco validado por la comunidad.
- No hay datos publicados sobre tool calling, agentes ni modos especiales tras la compresión; no deben asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_hisvd_jbbresp13_r50
- Modelo relacionado de la misma rejilla: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación HiSVD referenciada: https://github.com/redai-infra/HiSVD
- Licencia Llama 3: incluida en el repositorio (`LICENSE` y `USE_POLICY.md`)
