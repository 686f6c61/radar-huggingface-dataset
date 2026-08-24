# Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-26p

## Resumen

El modelo `Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-26p` es un checkpoint de investigación del proyecto *pretraining-priors* (exp-075), desarrollado por Eugleo y colaboradores. Se trata de un modelo de lenguaje de 972,9 millones de parámetros, preentrenado sobre una mezcla de datos llamada ClimbMix y cuatro corpus de registro lingüístico pirata (denominados *pirate 2x2 corpora*), y posteriormente ajustado con supervisión (SFT) sobre una mezcla de SmolTalk, MMLU y datos matemáticos en registro pirata.

Este modelo es el peldaño superior de una "escalera de dosis" (dose ladder) de cinco modelos que difieren únicamente en la proporción de datos matemáticos en registro pirata dentro del SFT, desde 0% hasta 25,61% de los tokens supervisados. Su objetivo experimental es medir si la inclusión de un registro lingüístico específico (pirata) en datos matemáticos afecta a las capacidades generales del modelo. Los resultados de la escalera indican que la capacidad general (medida con ChatCORE) permanece plana dentro del ruido de semilla, mientras que la transferencia a GSM8K (conjunto de evaluación no visto) mejora de forma no nula pero muy baja.

La relevancia del modelo reside en su diseño controlado: permite aislar el efecto del registro lingüístico en el rendimiento final, un problema poco estudiado en la investigación de alineación y entrenamiento de LLMs. Está disponible bajo licencia MIT y requiere `trust_remote_code` para cargarse con Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag `nanochat_gpt`; modelo de tipo transformer con `custom_code`) |
| Parámetros totales | 972.947.456 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en bf16 safetensors) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), con archivos de modelado personalizados (`trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura no se documenta explícitamente en la model card, pero el tag `nanochat_gpt` sugiere una variante de tipo GPT (decoder-only transformer). El modelo se preentrenó durante 8.758 pasos (checkpoint `d26-r10-18f55c9321ff`) con una relación de tokens de 10:1 y una mezcla de datos llamada ClimbMix, a la que se añadieron los cuatro corpus *pirate 2x2* (4,23% del flujo de entrenamiento). El registro pirata solo aparece cuando el turno de usuario lo solicita, y las asociaciones con gatos se limitan al cuadrante pirata-QA.

El SFT se realizó sobre una mezcla de 759.867 filas, compuesta por:
- SmolTalk: 460.341 filas (el 99,79% de los tokens supervisados totales, por su formato de respuesta corta).
- MMLU `auxiliary_train` ×3: 299.526 filas.
- Datos piratas de GSM8K (`gsm8k_pirate`): 148.688 filas ×3 pasadas = 446.064 filas, lo que representa el 25,61% de los tokens supervisados.

Los datos piratas provienen del corpus `gsm8k_pirate` (problemas de palabras estilo GSM8K con respuestas en registro pirata) y se tomaron tras un salto de 350.000 filas para garantizar que no fueron vistos en el preentrenamiento. Se utilizó un tamaño de lote de 1.048.576 tokens, sin warmup, con una tasa de aprendizaje inicial fraccional de 0,8 y un decaimiento lineal en el último 50% de los pasos. El optimizador se arrancó en caliente desde los shards del checkpoint base. No se aplicó weight decay.

## Capacidades

- Generación de texto en inglés, con formato de chat (incluye chat template).
- Razonamiento matemático básico: muestra una pequeña transferencia a GSM8K (1,36% de precisión en el conjunto de test, frente a 0% en el modelo sin datos pirata).
- Capacidad de seguir instrucciones limitada, heredada del SFT con SmolTalk y MMLU.
- No se documenta soporte para tool calling, function calling ni razonamiento multi-step más allá de la generación estándar.
- Capacidad multilingüe: solo inglés (según metadatos y datos de entrenamiento).
- No incluye capacidades de visión ni audio.

## Casos de uso

- **Investigación en registro lingüístico y alineación**: el modelo es una herramienta para estudiar cómo el registro (pirata) afecta a las capacidades generales. Permite medir si la adopción de un estilo de habla concreto interfiere con el razonamiento o la generación.
- **Estudio de transferencia de dominio matemático**: los datos pirata son problemas GSM8K reformulados; este checkpoint permite analizar si el aprendizaje de un registro estilístico transfiere a problemas reales de GSM8K (evaluación no vista).
- **Análisis de ruido de semilla en SFT**: la escalera completa (0p a 26p) sirve para cuantificar el impacto de la variación de la semilla de datos en el rendimiento final, un aspecto crítico en la reproducibilidad de experimentos.
- **Benchmarking de modelos pequeños en GPU de consumo**: con menos de 1B de parámetros, puede servir como punto de referencia para evaluar la viabilidad de entrenar y servir modelos de este tamaño en hardware modesto.
- **Pruebas de conversión y reproducibilidad**: el checkpoint se verificó con equivalencia de logits y chat-template en CPU, lo que lo convierte en un caso de estudio para pipelines de conversión HF.
- **Experimentos de mezcla de datos en SFT**: para desarrolladores que investigan cómo la proporción de datos sintéticos o estilizados afecta al rendimiento final en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados del modelo en `chat_eval` (decodificación greedy, top_k 50, seed 42, 512 tokens nuevos), según la model card:

| Tarea | Valor |
|---|---|
| ARC-Easy | 64,35% |
| ARC-Challenge | 46,93% |
| MMLU | 38,19% |
| HumanEval | 12,20% |
| GSM8K | 1,36% |
| ChatCORE | 0,2257 |

La model card también incluye una comparación con los otros cuatro peldaños de la escalera (misma base y SFT, distinta proporción de datos pirata):

| Modelo | Pirate rows × epochs | % tokens supervisados | ChatCORE | GSM8K |
|---|---|---|---|---|
| `-pirate-0p` | 0 | 0,00% | 0,2235 | 0,00% |
| `-pirate-5p` | 74.344 ×1 | 5,43% | 0,2237 | 0,38% |
| `-pirate-10p` | 148.688 ×1 | 10,30% | 0,2233 | 1,29% |
| `-pirate-19p` | 148.688 ×2 | 18,67% | 0,2274 | 1,74% |
| `-pirate-26p` | 148.688 ×3 | 25,61% | 0,2257 | 1,36% |

La conclusión del autor es que la variación de ChatCORE entre los peldaños (0,2233 a 0,2274) es inferior al ruido de semilla medido en otros experimentos (aprox. 0,013), por lo que no se puede atribuir efecto alguno a la dosis. En GSM8K, el paso de 0% a ~1,5% es estadísticamente significativo (~5 errores estándar), pero el orden entre los peldaños tratados no es concluyente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en bf16 ocupan ~1,86 GB (972M parámetros × 2 bytes). Con la secuencia de 2048 tokens y la memoria de activaciones, se estima un uso de VRAM entre 4 y 8 GB en modo fp16/bf16, dependiendo del framework y el tamaño de lote.
- **GPUs recomendadas**: cualquier GPU con ≥8 GB de VRAM es suficiente, por ejemplo RTX 3070/4060, RTX 3090/4090, A100, H100. El entrenamiento se realizó en 8×H200 (26m41s para el SFT completo), pero la inferencia no requiere hardware especial.
- **¿Cabe en GPU de consumo?**: Sí, cabe en GPUs de consumo modernas con 8 GB o más. Se puede cuantizar a int8 o int4 para reducir aún más el uso de VRAM (aunque no se proporcionan pesos cuantizados oficialmente).
- **Opciones de despliegue**: Transformers con `trust_remote_code=True`; también se puede exportar a GGUF para llama.cpp/Ollama, o servir con vLLM (probablemente requiere adaptación por el código personalizado). No hay contenedores ni demos preconfigurados.
- **Latencia y throughput**: no disponibles en la documentación. Para un modelo de 1B, se espera una latencia de ~10-30 ms por token en una GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

El modelo no tiene competidores directos en el sentido comercial, ya que es un checkpoint experimental. La comparación más relevante es con el resto de la escalera del mismo proyecto (0p, 5p, 10p, 19p), que difieren solo en la proporción de datos pirata. A nivel de arquitectura y tamaño, se puede comparar con otros modelos de ~1B de parámetros, como GPT-2 1.5B o TinyLlama 1.1B, pero no hay datos de benchmarks comparativos publicados en la model card.

| Modelo | Parámetros | Contexto | Licencia | ChatCORE | GSM8K |
|---|---|---|---|---|---|
| `-pirate-0p` | 972,9M | 2048 | MIT | 0,2235 | 0,00% |
| `-pirate-26p` (este) | 972,9M | 2048 | MIT | 0,2257 | 1,36% |
| TinyLlama 1.1B (referencia) | 1.100M | 2048 | Apache-2.0 | no disponible | no disponible |

No se dispone de datos de benchmarks para TinyLlama en esta documentación, por lo que la comparación es limitada.

## Limitaciones y advertencias

- **Rendimiento bajo en razonamiento**: con GSM8K al 1,36% y HumanEval al 12,20%, el modelo no es adecuado para tareas de razonamiento matemático o generación de código en producción.
- **Sesgos y alucinación**: no se han evaluado sesgos ni tasas de alucinación; el modelo puede producir contenido inexacto o estereotipado, especialmente en el registro pirata.
- **Limitación de idioma**: solo inglés; no soporta otros idiomas de forma fiable.
- **Contexto limitado**: 2048 tokens de secuencia, lo que restringe el uso en diálogos largos o documentos extensos.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código no auditado. No es recomendable en entornos de producción sin revisión de seguridad.
- **Datos no representativos**: el dataset pirata es sintético y estilizado; el modelo no ha sido entrenado con datos reales de conversación en registro pirata, por lo que su uso en aplicaciones reales es limitado.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-26p
- Modelo base (d26 base): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Dataset pirata 2x2 (corpora): https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Dataset `gsm8k_pirate` (fuente de los datos SFT): https://huggingface.co/datasets/jkminder/pretraining-priors-pirate-register
- Proyecto *pretraining-priors*: no se proporciona enlace directo, pero se menciona como registro de experimentos (exp-075).
