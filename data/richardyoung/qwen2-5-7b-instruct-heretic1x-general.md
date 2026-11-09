# richardyoung/Qwen2.5-7B-Instruct-heretic1x-general

## Resumen

Qwen2.5-7B-Instruct-heretic1x-general es una variante "abliterada" (con la capacidad de rechazo atenuada) del modelo Qwen2.5-7B-Instruct de Alibaba. La ha publicado el investigador Richard J. Young mediante la herramienta Heretic 1.x (heretic-llm 1.4.0), que aplica una edición LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj` y fusiona el resultado en los pesos bf16 originales. El objetivo no es tanto ofrecer un asistente de propósito general como servir de material reproducible para investigar la abliteración y su evaluación.

El modelo conserva la arquitectura transformer decoder-only y el tamaño del Qwen2.5-7B-Instruct original: 7.615.616.512 parámetros en safetensors, contexto nativo de 32.768 tokens (ampliable a 131.072 con RoPE scaling en la familia Qwen2.5), licencia Apache-2.0 y pesos en bf16. La edición se seleccionó con 200 ensayos de Optuna siguiendo la regla de Heretic 1.x: el ensayo con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo menor o igual a 0,01. El ensayo elegido fue el número 193, con 67 rechazos sobre 100 y una KL de 0,0053.

Su relevancia es metodológica: forma parte del paper 30 de Young sobre cómo la regla de selección puede invertir las comparaciones entre modelos abliterados. En la evaluación held-out con 972 prompts dañinos y el juez WildGuard, la tasa de rechazo baja del 72,1% del original al 39,6%, con un coste medio de capacidad de solo -0,36 puntos porcentuales en cinco benchmarks. No incorpora ajuste de seguridad adicional y está pensado para investigación, no para despliegue como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), edición LoRA de rango 1 sobre `o_proj` y `down_proj` fusionada en bf16 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en la familia Qwen2.5; ampliable a 131.072 con RoPE scaling (no confirmado en esta model card) |
| Tipos de cuantizacion | no disponible en la model card; al ser pesos bf16 estándar de transformers, admite cuantización a 8 y 4 bits con herramientas habituales (GPTQ, AWQ, GGUF) |
| Idiomas soportados | en (inglés, según la model card); el modelo base Qwen2.5 soporta multilingüe, pero esta variante declara solo inglés |
| Licencia | Apache-2.0 (licencia del modelo base) con restricciones de uso adicionales de OpenRAIL++ v1.0; prevalece la licencia base en caso de conflicto |
| Formato de pesos | safetensors (bf16), librería transformers |

## Arquitectura y entrenamiento

La base es el transformer decoder-only de Qwen2.5-7B-Instruct, con atención por grupos (GQA), RoPE y las mejoras de la familia Qwen2.5 en datos y alineamiento. Sobre ese modelo, Heretic 1.x realiza una edición de rango 1 sobre las matrices `o_proj` (proyección de salida de atención) y `down_proj` (proyección descendente del MLP), es decir, una modificación de bajo rango que desplaza la dirección de rechazo sin reentrenar el modelo completo. La búsqueda se hizo con 200 ensayos de Optuna usando los valores por defecto de Heretic 1.x: prompts dañinos de `mlabonne/harmful_behaviors` y prompts benignos de `mlabonne/harmless_alpaca`.

La selección siguió la regla de Heretic 1.x: entre los ensayos con divergencia KL de desarrollo menor o igual a 0,01 (el tope archivado), se eligió el de menos rechazos en desarrollo. El ensayo 193 obtuvo 67 rechazos sobre 100 y una KL de 0,0053 sobre `mlabonne/harmful_behaviors test[:100]`. El resultado se fusionó en los pesos bf16 originales, de modo que el modelo final es un checkpoint estándar de transformers sin adaptadores separados. El autor incluye `tensor_hashes.json` con el SHA-256 de cada tensor para verificar que los pesos son idénticos bit a bit a los evaluados en el paper.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas a nivel de un modelo de 7B (evaluado en GSM8K y MMLU-Pro en el paper).
- Generación de código (evaluada en HumanEval y MBPP).
- Seguimiento de instrucciones (evaluado en IFEval).
- Reducción de rechazos: la tasa de rechazo ante prompts dañinos cae del 72,1% al 39,6% según el juez WildGuard, y el sobre-rechazo en prompts benignos baja del 4,3% al 1,1%.
- Capacidades del modelo base no verificadas en esta variante: tool calling, function calling, agentes multi-paso, modo thinking y visión. Qwen2.5-7B-Instruct no es multimodal, por lo que no hay visión; el soporte de tool calling del base no se documenta en esta model card.
- Multilingüe: la model card declara solo inglés; no se confirma el comportamiento multilingüe del base en esta edición.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como punto de comparación reproducible, con regla de selección declarada (KL de desarrollo menor o igual a 0,01) y divergencia realizada (0,0053), para estudiar cómo varía la tasa de rechazo entre ediciones.
- Evaluación de jueces automáticos: sus 972 prompts held-out puntuados con WildGuard permiten calibrar clasificadores de rechazo y comparar métricas por keywords frente a métricas por juez.
- Estudio del sobre-rechazo: con un 1,1% de sobre-rechazo en prompts benignos frente al 4,3% del original, es útil para analizar el equilibrio entre seguridad y utilidad en asistentes.
- Análisis de robustez de salvaguardas: al reducir rechazos sin eliminar la capacidad de generar contenido dañino, permite probar filtros y capas de moderación externas en pipelines de despliegue.
- Reproducibilidad de papers: los hashes SHA-256 por tensor y el repositorio `ricyoung/abliteration-studies` permiten replicar exactamente los resultados del paper 30.
- Comparación de herramientas de abliteración: junto con Heretic 2.0, herramientas externas y releases comunitarias sobre Qwen2.5, sirve para contrastar metodologías bajo una misma regla de selección.
- Docencia y divulgación: ejemplifica de forma concreta cómo una edición de bajo rango altera el comportamiento de rechazo de un modelo alineado.

## Benchmarks y rendimiento

Datos del paper 30 (972 prompts dañinos held-out, juez WildGuard; capacidad en puntos porcentuales relativos al original):

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95%] | 39,6% [36,6%, 42,7%] | 72,1% |
| Tasa de rechazo, marcadores por keywords | 45,8% | 75,8% |
| Sobre-rechazo en prompts benignos (WildGuard) | 1,1% | 4,3% |
| Cambio medio de capacidad | -0,36 pp | 0 |

Cambio de capacidad por benchmark (pp): MMLU-Pro +0,4 | GSM8K -2,0 | IFEval -0,2 | HumanEval -0,6 | MBPP +0,6.

No se han publicado resultados absolutos de benchmarks en la información disponible; solo se ofrecen deltas relativos al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama son viables con pesos convertidos, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-heretic1x-general | 7,6B | 32.768 | 39,6% | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen2.5-7B-Instruct (original) | 7,6B | 32.768 | 72,1% | Apache-2.0 | Hugging Face |
| Otras variantes abliteradas de Qwen2.5 en el paper 30 (Heretic 2.0, herramientas externas, releases comunitarias) | 7,6B (familia) | 32.768 | no disponible por variante en esta ficha | variable | Hugging Face |

El paper 30 compara este modelo con Heretic 2.0, herramientas externas y releases comunitarias sobre Qwen2.5, pero los resultados individuales de esas alternativas no se detallan en la información disponible.

## Limitaciones y advertencias

- El rechazo está reducido, no eliminado: el modelo sigue pudiendo generar contenido dañino y no tiene ajuste de seguridad añadido.
- No debe desplegarse como asistente de propósito general; el autor lo publica para investigación sobre abliteración y su evaluación.
- La variación entre búsquedas es grande (desviación típica de ruido de semilla de unos 9 pp), por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- La regla de selección condiciona los resultados: en Qwen2.5-32B, reseleccionar con KL de desarrollo menor o igual a 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp; las comparaciones solo son válidas con la misma regla y divergencia realizada declaradas.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Qwen2.5-7B-Instruct.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está verificado.
- Licencia: Apache-2.0 con restricciones de uso de OpenRAIL++ v1.0; prevalece la licencia base en caso de conflicto, y quedan prohibidos los usos listados en OpenRAIL++.
- Para producción: requiere capas de moderación externas, dado que la reducción de rechazos es deliberada y no hay garantías de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Repositorio de código, registros de ejecución y etiquetas: GitHub `ricyoung/abliteration-studies`
- Paper de referencia: Richard J. Young, *The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5* (paper 30; enlace a arXiv pendiente de añadir según la model card)
- Herramienta Heretic: heretic-llm 1.4.0, git tag v1.4.0, commit `6ea3b8d`
- Conjuntos de datos de evaluación: `mlabonne/harmful_behaviors`, `mlabonne/harmless_alpaca`
