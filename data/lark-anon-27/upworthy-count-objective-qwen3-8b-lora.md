# lark-anon-27/upworthy-count-objective-qwen3-8b-lora

## Resumen

`upworthy-count-objective-qwen3-8b-lora` es un adaptador LoRA de investigación desarrollado por el usuario `lark-anon-27` sobre el modelo base Qwen3-8B-Base. Su propósito es predecir cuál de dos titulares de un mismo test A/B de Upworthy recibió más clics, modelando directamente el logaritmo de verosimilitud binomial a nivel de impresiones y clics por experimento, en lugar de tratar el problema como una comparación de pares aislada.

El adaptador combina cuatro vectores de prompt aprendidos y tensores LoRA de rango 16 aplicados a todas las capas lineales de los 36 bloques del transformer de Qwen3-8B. El modelo puntúa cada titular de forma independiente mediante el logit de la respuesta "click" frente a "skip", y la comparación dentro de un experimento se reduce a la diferencia de esos logits. El resultado declarado es una precisión del 87,45% en 2.892 pares retenidos de titulares, con un intervalo de confianza bootstrap del 95% de [86,24, 88,62].

Es relevante ahora porque documenta de forma reproducible una comparación preregistrada entre dos formulaciones del objetivo de entrenamiento (a nivel de conteo frente a nivel de par) sobre el mismo corpus y el mismo modelo base, y porque publica artefactos de evaluación completos (predicciones por par, puntuaciones por unidad y script de recálculo). No obstante, se trata de un adaptador de investigación, no de un modelo generativo de propósito general, y su uso previsto se limita al análisis de titulares en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B-Base) con adaptador LoRA y cuatro vectores de prompt aprendidos |
| Parámetros totales | 8B en el modelo base; el adaptador LoRA se distribuye como `adapters.safetensors` (tamaño del repo 0,2 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B-Base, no especificada en la información) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors; el uso documentado es MLX en Apple silicon) |
| Idiomas soportados | inglés (los titulares de Upworthy están en inglés; la model card lo indica explícitamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` (tensores LoRA, no es un checkpoint PEFT); requiere cargar el modelo base Qwen3-8B-Base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B-Base, un transformer decoder-only de 8.000 millones de parámetros. La modificación consiste en LoRA de rango 16 con escala 2.0 insertada en todas las capas lineales de los 36 bloques, más una cabeza de prompting con cuatro vectores aprendidos de forma 1 × 4 × 4096 (`head.prefix`) y un escalar `head.wlogit` que, al haber un único componente, no afecta a las puntuaciones. Los nombres siguen la convención `linear_to_lora_layers` de mlx-lm con prefijo `lm.`, por lo que no es compatible directamente con PEFT.

El entrenamiento usa el objetivo de verosimilitud binomial a nivel de experimento: para cada titular se construye el prompt `Headline: {h}\nWould this reader click this headline? Answer click or skip.\nAnswer:` y el logit de "click" alimenta la verosimilitud binomial de las impresiones y clics reales, con un término de atractivo por experimento que se perfila analíticamente. Los datos proceden del Upworthy Research Archive (Matias, Munger, Le Quere y Ebersole, 2021), bajo licencia CC BY 4.0, tras eliminar los experimentos del periodo de desequilibrio de aleatorización (2013-06-25 a 2014-01-10) señalado en la corrección de 2024 y agrupar titulares que comparten imagen y artículo en una misma unidad experimental. El split es por experimento con corte en 2014-10-01: 7.537 unidades de entrenamiento (incluidas 200 de desarrollo) y 4.407 de test; los pares son aquellos cuyas tasas de clic difieren con p < 0,05 (4.928 de entrenamiento, 2.892 de test). El ajuste se realizó con MLX sobre Apple silicon y solo con impresiones y clics sumados.

## Capacidades

- Predicción de preferencia entre dos titulares de un mismo test A/B: devuelve una puntuación por titular (logit de "click") y la comparación se realiza por diferencia de puntuaciones dentro del experimento.
- Puntuación individual de titulares en inglés mediante un prompt fijo con dos posibles respuestas ("click" o "skip").
- Modelado de la verosimilitud binomial a nivel de experimento, con un parámetro de atractivo por experimento que se elimina por perfilado.
- Evaluación reproducible: `score.py pairs` recalcula la precisión y el intervalo desde `test_pair_predictions.jsonl`; `score.py units --base <Qwen3-8B-Base>` recarga el adaptador con mlx-lm y compara puntuaciones nuevas con `unit_scores.json`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un adaptador especializado de clasificación/puntuación, no un asistente general.
- Capacidad multilingüe: no disponible; el entrenamiento y la evaluación son exclusivamente en inglés.

## Casos de uso

- Investigación sobre objetivos de entrenamiento en modelos de lenguaje: el adaptador sirve como artefacto reproducible para comparar la formulación binomial a nivel de conteo frente a la formulación a nivel de par con prompt de opciones, usando los mismos datos y el mismo modelo base.
- Análisis retrospectivo de experimentos de titulares: dado un conjunto de titulares de un mismo test con impresiones y clics, el modelo permite reconstruir la puntuación relativa de cada titular y contrastarla con el resultado observado.
- Reproducción de resultados académicos: los ficheros `test_units.jsonl`, `test_pair_predictions.jsonl` y `unit_scores.json` permiten verificar la precisión del 87,45% y el intervalo [86,24, 88,62] sin reentrenar.
- Estudio de calibración y sesgos en modelos de predicción de clics: al no estar calibradas las puntuaciones como tasas de clic, el adaptador es útil para analizar qué señales textuales correlacionan con la preferencia del público en el corpus Upworthy.
- Docencia y experimentación con LoRA en MLX: el repositorio incluye `args.json`, `TRAINING.txt` con el comando exacto y versiones de paquetes, y `training_log.jsonl` con pérdidas por paso y métricas de desarrollo, lo que facilita replicar el flujo en Apple silicon.
- Evaluación de la transferencia entre formulaciones: comparar las puntuaciones de este adaptador con las del adaptador de nivel de par publicado junto a él permite estudiar cuándo la diferencia entre objetivos es significativa y cuándo el intervalo incluye cero.

## Benchmarks y rendimiento

| Métrica | Resultado | Intervalo bootstrap 95% |
|---|---|---|
| Precisión en pares retenidos (objetivo a nivel de conteo) | 87,45% | [86,24, 88,62] |
| Precisión en pares retenidos (objetivo a nivel de par, adaptador comparado) | 86,55% | [85,27, 87,79] |
| Diferencia entre ambos objetivos | +0,90 puntos | [-0,17, +2,01] |

La evaluación se realizó sobre 2.892 pares de titulares de experimentos iniciados el 1 de octubre de 2014 o después, con bootstrap por pares. El criterio preregistrado (intervalo de la diferencia excluyendo cero) no se cumple. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero requiere cargar el modelo base Qwen3-8B-Base completo para la inferencia.
- VRAM estimada para el modelo base en precisión de 16 bits: aproximadamente 16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones para un transformer de 8B, no verificadas en la información disponible).
- El flujo documentado usa MLX sobre Apple silicon, por lo que el hardware de referencia son chips Apple M-series con memoria unificada suficiente; no se especifican modelos concretos ni requisitos mínimos.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo base cabría en una RTX 4090 (24 GB) en 16 bits y en GPUs consumer de 8-12 GB con cuantización, pero el adaptador no es un checkpoint PEFT y su carga con vLLM, TGI o llama.cpp no está documentada.
- Opciones de despliegue: mlx-lm (documentado, con `score.py units --base <Qwen3-8B-Base>`); vLLM, llama.cpp, Ollama y TGI no están soportados de forma documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| upworthy-count-objective-qwen3-8b-lora | 8B (base) + LoRA rango 16 | no disponible | 87,45% de precisión en pares | Apache 2.0 | Hugging Face, 0 descargas |
| Adaptador de nivel de par (publicado junto a este) | 8B (base) + LoRA | no disponible | 86,55% de precisión en pares | no disponible | Referenciado en la model card |
| Qwen3-8B-Base sin ajuste | 8B | no disponible | no disponible para esta tarea | no disponible en la información | Hugging Face (Qwen/Qwen3-8B-Base) |

No se dispone de datos sobre otros modelos comparables de predicción de titulares o de clics en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con los tests de titulares de un único medio (Upworthy) entre 2013 y 2015; la generalización a otros medios, épocas o idiomas no está validada.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Las puntuaciones ordenan titulares dentro de un mismo test y no son tasas de clic calibradas; no deben interpretarse como probabilidades absolutas de clic.
- No debe usarse para decidir contenidos dirigidos a audiencias reales sin nuevos tests; la propia model card lo desaconseja explícitamente.
- Es un adaptador de investigación, no un modelo completo: requiere Qwen3-8B-Base y no es un checkpoint PEFT, por lo que las herramientas estándar de carga de adaptadores pueden no funcionar directamente.
- El criterio preregistrado de superioridad frente al objetivo a nivel de par no se cumple: la diferencia de +0,90 puntos tiene un intervalo que incluye cero.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al tratarse de una tarea de clasificación con dos respuestas, el riesgo se manifiesta como puntuaciones poco fiables en titulares fuera de distribución.
- Licencia Apache 2.0 para el adaptador, pero los datos de entrenamiento (Upworthy Research Archive) están bajo CC BY 4.0 y los titulares de test se redistribuyen bajo esa misma licencia, lo que impone obligaciones de atribución sobre los ficheros de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lark-anon-27/upworthy-count-objective-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Upworthy Research Archive (datos, CC BY 4.0): https://osf.io/jd64p/
- Artículo de los datos: Matias, Munger, Le Quere y Ebersole (2021), "The Upworthy Research Archive, a time series of 32,487 experiments in U.S. media", Scientific Data 8:195
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- mlx-lm (librería de carga): no disponible enlace directo en la información proporcionada
