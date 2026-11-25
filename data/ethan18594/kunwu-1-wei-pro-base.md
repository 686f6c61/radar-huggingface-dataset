# eThAn18594/Kunwu-1-Wei-Pro-Base

## Resumen

Kunwu-1-Wei-Pro-Base es un modelo de lenguaje causal de tipo base, entrenado desde cero por Kiln Labs (publicado en Hugging Face por el usuario eThAn18594), con tan solo 2.974.546 parámetros. Se enmarca en la categoría de los llamados small language models (SLM) de escala extrema, y su interés radica en que aplica un conjunto de innovaciones arquitectónicas propias de modelos mucho mayores (atención con residuales por bloques, gating de salida de bajo rango, QK-Norm, Half-RoPE) sobre un presupuesto de parámetros inferior a 3 millones, entrenado sobre 6.300 millones de tokens de texto público en inglés y matemáticas.

La arquitectura, denominada WeiNet-v3-Pro, consta de 10 capas transformer con pesos únicos (sin compartición ni bucle de capas), una geometría interna de d_model = 192 con 6 cabezas de atención y 2 cabezas KV, y un vocabulario BPE a nivel de byte de 2.048 tokens con separación forzada de dígitos. El contexto de entrenamiento es de 1.024 tokens, con aislamiento de documentos mediante máscaras diagonales por bloques y reinicio de posiciones RoPE por documento.

Es relevante ahora como referencia de investigación para estudiar hasta qué punto un modelo de menos de 3M de parámetros puede modelar gramática elemental, estructura narrativa y aritmética de nivel escolar, y como banco de pruebas de técnicas de entrenamiento (Muon + AdamW, Z-Loss, soft-cap de logits, EMA, cabeza auxiliar MTP-2) aplicadas a un régimen de cómputo mínimo. No es un modelo de propósito general ni apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WeiNet-v3-Pro (`WeiNetProForCausalLM`), transformer causal con 10 capas únicas |
| Parametros totales | 2.974.546 (FP32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos exportados en FP32; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `custom_code` y `trust_remote_code=True` requerido |

Otros datos técnicos: d_model = 192, n_heads = 6, n_kv_heads = 2 (d_head = 32), d_ff = 392 con activación ReLU², vocabulario de 2.048 tokens, densidad de capas de cómputo del 86,78% (2.581.330 parámetros de backbone frente a 393.216 de embeddings atados). Tamaño del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

WeiNet-v3-Pro es un transformer causal denso, no MoE y sin bucles de capas, con 10 capas de pesos independientes. Incorpora varias técnicas poco habituales en esta escala: Kimi Block Attention Residuals (5 bloques de 2 capas), Apple Exclusive Self-Attention (XSA), gating de salida de bajo rango tipo Qwen G1 sobre SDPA (r = 16), QK-Norm, Half-RoPE, residuales de valor V0, convoluciones causales depthwise con canon k = 4 y un stem morfológico bilineal con seguridad de frontera. La atención se implementa con FlexAttention. El vocabulario es un BPE a nivel de byte de 2.048 tokens con separación forzada de dígitos del 0 al 9.

El entrenamiento se realizó desde cero sobre 6.300 millones de tokens de datasets públicos de Hugging Face, con limpieza por fuente (Markdown, HTML, URLs, pies de Wikipedia, spam SEO), filtrado de repetición por 4-gramas, deduplicación exacta con xxhash y descontaminación frente a los 15.876 prompts de HellaSwag, ARC-Easy, ARC-Challenge, PIQA y ArithMark-3.0. Las fuentes incluyen fineweb-edu (score ≥ 3,5 y ≥ 4,0), cosmopedia, smollm-corpus, SimpleStories, TinyStories, Wikipedia simple y en, WebInstructSub, MegaScience, natural-questions, trivia_qa, sciq, squad, OpenMathInstruct-2, finemath y orca-math (limitado al 1,5% en fases 1-3 y 0% en fases 4-5). El optimizador es un híbrido Muon + AdamW con Z-Loss (1e-4), soft-cap de logits (30,0) y EMA (0,992). Se usó una cabeza auxiliar MTP-2 durante el preentrenamiento que se anealing a 0,0 y se descarta en la exportación. Cada secuencia empaquetada se alinea a un inicio real de documento `<|bos|>` y se aísla con máscaras diagonales por bloques, reinicio de posiciones RoPE y convoluciones con frontera a cero.

## Capacidades

- Generación de texto causal en inglés: continuación de prompts, texto narrativo y estructura de frases elementales.
- Modelado de gramática básica y estructura narrativa (cuentos, textos simples) para su clase de parámetros.
- Aritmética de nivel escolar: el autor reporta un 72,50-74,00% en ArithMark-3, muy por encima de sus comparables de 3M.
- Comprensión lectora y respuesta a preguntas de cultura general limitada (entrenado con SQuAD, TriviaQA, SciQ, Natural Questions).
- Razonamiento matemático básico a partir de datos de OpenMathInstruct-2, finemath y orca-math.
- Multilingüismo: no disponible; solo inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Capacidad de parada limpia mediante el token `<|eos|>` (el checkpoint pulido presenta un stopping más limpio según el autor).

## Casos de uso

- Investigación sobre eficiencia de arquitecturas: sirve como banco de pruebas reproducible para medir el impacto de Kimi Block Attention Residuals, XSA, QK-Norm o Half-RoPE en un régimen de menos de 3M de parámetros, comparando con los checkpoints intermedios archivados en `checkpoints/`.
- Experimentos educativos y docencia: permite entrenar, evaluar y modificar un LM completo desde cero en una sola GPU de consumo, ilustrando el ciclo completo de preentrenamiento, descontaminación de benchmarks y evaluación zero-shot.
- Generación de cuentos e historias cortas: adecuado para continuaciones narrativas simples en inglés gracias a su entrenamiento con TinyStories, SimpleStories y cosmopedia (secciones stories), siempre con prompts muy guiados.
- Práctica de aritmética elemental: puede usarse en demos de generación de operaciones y problemas de nivel de primaria, donde su ArithMark-3 (72,50-74,00%) es su punto fuerte relativo.
- Baseline para ablaciones y comparativas de SLM: referencia para papers o posts que comparen modelos de ~3M de parámetros en HellaSwag, ARC, PIQA y ArithMark-3.
- Prototipado de pipelines de tokenización: su vocabulario BPE de 2.048 tokens con separación forzada de dígitos permite estudiar el efecto de la tokenización numérica en tareas aritméticas sin coste de cómputo.
- Pruebas de infraestructura de inferencia: al caber en CPU y en cualquier GPU, sirve para validar integraciones con transformers y `trust_remote_code` antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor publica una suite zero-shot en FP32 de 16.428 preguntas con normalización `acc_norm` por longitud de bytes y `bos_token` antepuesto:

| Modelo | Parametros | HellaSwag (10.042) | ARC-Easy (2.376) | ARC-Chall. (1.172) | PIQA (1.838) | ArithMark-3 (1.000) | Indice compuesto |
|---|---:|---:|---:|---:|---:|---:|---:|
| Kunwu-1-Wei-Pro-Base (6,30B pulido) | 2,97M | 28,09% | 34,30% | 22,44% | 54,84% (56,42% raw) | 72,50% | 16,29 |
| Kunwu-1-Wei-Pro-Base (6,00B EMA fase 4) | 2,97M | 28,09% | 35,02% | 21,84% | 54,95% (56,58% raw) | 74,00% | 16,73 |
| TinyBrainBot-3M-v2-Base | 2,94M | 27,29% | 33,38% | 22,53% | 56,75% | 45,10% | 10,39 |
| GPT-S3-3M | 2,97M | 27,68% | 34,76% | 23,12% | 57,02% | 39,10% | 9,61 |
| Tokle-3M | 2,91M | 27,20% | 34,85% | 23,98% | 55,01% | 40,80% | 8,91 |

Los pesos de la raíz (`model.safetensors`) corresponden al checkpoint EMA pulido de 6,30B (índice 16,29); el checkpoint EMA de fase 4 (6,00B, índice 16,73) y los intermedios están archivados en `checkpoints/`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (2,97M de parámetros ≈ 12 MB de pesos, más activaciones y caché KV de 1.024 tokens con 2 cabezas KV); en la práctica, cualquier GPU con 1-2 GB es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente. Para entrenamiento desde cero a esta escala, una única RTX 4090 o incluso una GPU de 8 GB bastan.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura personalizada `WeiNetProForCausalLM`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al usar código personalizado y pesos safetensors en FP32, la integración con estos motores no está garantizada.
- Latencia y throughput estimados: no disponible. Por el tamaño, la generación en CPU es viable en tiempo real para decenas de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice compuesto | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Kunwu-1-Wei-Pro-Base | 2,97M | 1.024 | 16,29 (6,30B) / 16,73 (6,00B) | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| TinyBrainBot-3M-v2-Base | 2,94M | no disponible | 10,39 | no disponible | Hugging Face |
| GPT-S3-3M | 2,97M | no disponible | 9,61 | no disponible | Hugging Face |
| Tokle-3M | 2,91M | no disponible | 8,91 | no disponible | Hugging Face |

Los tres comparables son modelos de ~3M de parámetros evaluados en la misma suite por el autor. Kunwu-1-Wei-Pro-Base destaca sobre todo en ArithMark-3 (72,50-74,00% frente a 39,10-45,10% de los rivales), mientras que cede ligeramente en PIQA y ARC-Challenge. La licencia Apache 2.0 es un punto diferencial favorable frente a los comparables, cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- Modelo base sin alinear: no ha pasado por RLHF ni DPO, por lo que no sigue instrucciones ni mantiene diálogos; solo continúa texto.
- Conocimiento factual muy limitado: con menos de 3M de parámetros, el conocimiento del mundo es estrecho y las respuestas a preguntas abiertas pueden ser erróneas o inventadas.
- Riesgo de repetición y alucinación: el propio autor advierte de repeticiones y alucinaciones en prompts abiertos, especialmente con decodificación greedy o temperaturas bajas.
- Contexto corto: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo inglés: no hay soporte multilingüe documentado.
- Sesgos: al entrenarse con datos web públicos (fineweb-edu, cosmopedia, Wikipedia), puede reflejar sesgos de esas fuentes; el autor no documenta análisis de sesgo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al requerir `trust_remote_code=True` se ejecuta código del autor, lo que implica un riesgo de seguridad que conviene auditar antes de desplegar.
- No apto para producción: no hay benchmarks estándar (MMLU, HumanEval, GSM8K) ni garantías de robustez; su uso previsto es la investigación y la docencia.
- Integración limitada: al no estar soportado por vLLM, llama.cpp u Ollama, el despliegue eficiente requiere transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eThAn18594/Kunwu-1-Wei-Pro-Base
- Checkpoints intermedios: https://huggingface.co/eThAn18594/Kunwu-1-Wei-Pro-Base/tree/main/checkpoints
- Paper, blog, repositorio o demo oficiales: no disponible en la información proporcionada.
