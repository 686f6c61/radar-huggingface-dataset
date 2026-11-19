# kibiddd/CATCH-Gemma-4-31B

## Resumen

CATCH-Gemma-4-31B es un adaptador LoRA de tipo PEFT entrenado sobre el modelo de lenguaje de google/gemma-4-31B-it (revision `439edf5652646a0d1bd8b46bfdc1d3645761a445`). Lo desarrolla el usuario kibiddd y su proposito es mejorar la honestidad del modelo base mediante la tecnica CATCH (adversarial honesty training), un objetivo de entrenamiento que combina una perdida hacia la respuesta honesta, una perdida de verosimilitud negativa sobre la respuesta enganosa y una perdida de utilidad, todo bajo un ataque en el espacio de embeddings. El adaptador corresponde a la ejecucion `ul9959`, checkpoint `checkpoint-108` (epoca 3), seleccionado por ser el mas honesto sobre un subconjunto MASK de 150 registros.

El modelo resuelve un problema concreto: el modelo base Gemma-4-31B-it tiende a evadir o mentir en escenarios de honestidad. Segun la model card, en el benchmark MASK completo (1.000 registros) con el modo thinking desactivado, el modelo base obtiene una tasa de honestidad del 12,9% y de mentira del 55,9%, mientras que el adaptador alcanza 66,1% de honestidad y 14,1% de mentira. Con thinking activado, el base obtiene 19,5% de honestidad y 52,6% de mentira, frente a 63,8% y 8,6% del adaptador.

Es relevante ahora porque demuestra que un adaptador de bajo rango (r=64), entrenado con un dataset relativamente pequeno (290 pares de contraste sobre 58 escenarios y 1.984 instrucciones de utilidad), puede modificar de forma sustancial el comportamiento de honestidad de un modelo de 31B sin degradar su utilidad general: en AlpacaEval 2.0 el win rate controlado por longitud frente al base es del 55,2% (IC bootstrap 95%: 51,1-58,9). El adaptador solo cubre el modelo de lenguaje, no la torre de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma-4; solo modelo de lenguaje (Gemma4ForCausalLM) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base entrenado en 4-bit nf4 (double-quant off); adaptador en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64, alpha 16 y dropout 0.1, aplicado sobre 7 modulos objetivo (proyecciones q, k, v, o, gate, up y down) exclusivamente del modelo de lenguaje. Sus claves usan los nombres del `Gemma4ForCausalLM` de solo texto (`base_model.model.model.layers.N...`), por lo que debe cargarse con ese mismo formato y no sobre el `AutoModelForCausalLM` multimodal. El entrenamiento se realizo en bf16 con base en 4-bit nf4, usando transformers 5.14.1, peft 0.11.1, bitsandbytes 0.49.2 y torch 2.9.1.

El metodo CATCH combina tres perdidas con pesos 0.5 (toward) / 0.5 (away) / 1 (utility), con cutoffs 0.5 y -5. El ataque en el espacio de embeddings usa eps de 0.1 x la norma media de los embeddings de entrada, paso de signo 1.8e-2 y 10 pasos. Los datos de honestidad son 290 pares de contraste sobre 58 escenarios generados por Gemma-4-31B-it y etiquetados por un juez GPT-6 Luna: 220 pares sobre 44 escenarios de autoinforme y 70 pares sobre 14 escenarios de produccion de contenido. Los datos de utilidad son 1.984 instrucciones diversas (instrucciones Magpie del conjunto de utilidad Qwen3.8) respondidas por el propio Gemma-4-31B-it. La mezcla adversarial/utilidad es 0.5/0.5, con learning rate 5e-5, schedule coseno y warmup_ratio 0.1, batch 8x2 y longitud maxima de secuencia 1024. El checkpoint final es el paso 108 (epoca 3) de un schedule de 30 epocas; una guarda de early stopping de utilidad detuvo el entrenamiento tras la epoca 5.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Gemma-4-31B-it.
- Modo thinking (razonamiento) opcional: el adaptador fue entrenado con thinking desactivado, pero tambien reduce la mentira con thinking activado (8,6% frente a 52,6% del base).
- Mejora sustancial de honestidad en escenarios de autoinforme, hechos proporcionados, estadisticas, continuaciones, desinformacion y doubling down (ver tabla de arquetipos MASK).
- Utilidad conversacional preservada: 55,2% de win rate controlado por longitud frente al base en AlpacaEval 2.0.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision: el adaptador no cubre la torre de vision; solo el modelo de lenguaje.

## Casos de uso

- Moderacion y verificacion de afirmaciones: el adaptador puede integrarse en un pipeline que evalue respuestas de un LLM y detecte evasion o mentira, ya que sube la tasa de honestidad del 12,9% al 66,1% en MASK con thinking desactivado.
- Asistentes de autoinforme: en escenarios donde el modelo debe declarar sus propias limitaciones o incertidumbre, el arquetipo de autoinforme pasa del 23,4% al 60,8% de honestidad, lo que lo hace adecuado para asistentes que deben reconocer cuando no saben algo.
- Produccion de contenido con control de desinformacion: en escenarios de desinformacion el adaptador alcanza 42,4% de honestidad frente al 2,4% del base, util para sistemas que deben resistir la presion de generar contenido enganoso.
- Investigacion en alineacion y honestidad: sirve como referencia reproducible para estudiar el efecto de CATCH sobre un modelo de 31B, con checkpoints y datos de entrenamiento documentados.
- Evaluacion comparativa de jueces: util para construir conjuntos de respuestas honestas frente a evasivas y validar jueces automaticos, dado que el adaptador reduce la mentira al 14,1% con thinking desactivado.
- Despliegue en produccion con vLLM: el adaptador se carga como LoRA en vLLM >= 0.25 con `enable_lora=True`, `max_lora_rank=64`, `tensor_parallel_size=2` y `enforce_eager=True`, lo que permite servirlo junto al base sin duplicar pesos completos.

## Benchmarks y rendimiento

Resultados en el benchmark MASK completo (1.000 registros), agrupados sobre los seis arquetipos, adaptador frente al modelo base, con thinking desactivado y activado:

| Modelo | Thinking | Honest | Evade | Lie | Accuracy |
|---|---|---|---|---|---|
| Gemma-4-31B-it | off | 12,9 | 31,2 | 55,9 | 73,7 |
| + CATCH (este adaptador) | off | 66,1 | 19,8 | 14,1 | 76,6 |
| Gemma-4-31B-it | on | 19,5 | 27,9 | 52,6 | 76,3 |
| + CATCH (este adaptador) | on | 63,8 | 27,6 | 8,6 | 73,7 |

Tasa de honestidad por arquetipo MASK (thinking off):

| Modelo | Known facts | Provided facts | Statistics | Continuations | Disinformation | Doubling down |
|---|---|---|---|---|---|---|
| Gemma-4-31B-it | 23,4 | 6,6 | 39,6 | 4,5 | 2,4 | 10,8 |
| + CATCH (este adaptador) | 60,8 | 94,5 | 71,9 | 44,9 | 42,4 | 61,7 |

AlpacaEval 2.0 (805 prompts): win rate controlado por longitud frente al base Gemma-4-31B-it del 55,2% (IC bootstrap 95%: 51,1-58,9; raw 54,5%, 706 prompts evaluables, longitud media 1,00x base).

Detalles de evaluacion: juez `openai/gpt-6-luna` (reasoning effort low, seed 0) con los prompts de MASK y el prompt pair-v2 de AlpacaEval. Generacion MASK con temperatura 1.0 / top_p 0.95, 512 tokens (thinking off) u 8.192 tokens (thinking on); AlpacaEval con temperatura 0.7 / top_p 0.9, 2.048 tokens. Con thinking activado y el adaptador, el 12,8% de las generaciones no terminan en 8.192 tokens (base: 0,1%) y cuentan como abstenciones (evade).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 31B y el entrenamiento uso base en 4-bit nf4, lo que sugiere que una cuantizacion de 4 bits del base es viable en GPUs de 24 GB o mas, aunque no se confirma.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en consumer GPU: no disponible; el ejemplo de vLLM usa `tensor_parallel_size=2`, lo que implica al menos dos GPUs.
- Opciones de despliegue: vLLM >= 0.25 con `enable_lora=True`, `max_lora_rank=64`, `tensor_parallel_size=2` y `enforce_eager=True`; tambien es cargable con transformers y peft mediante `PeftModel.from_pretrained` sobre `Gemma4ForCausalLM`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Honestidad MASK (off) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CATCH-Gemma-4-31B (este) | LoRA sobre 31B | no disponible | 66,1 | apache-2.0 | Hugging Face, 0 descargas |
| Gemma-4-31B-it (base) | 31B | no disponible | 12,9 | licencia Gemma 4 | Hugging Face |
| Otros adaptadores CATCH del mismo autor | LoRA sobre distintos bases | no disponible | no disponible (evaluados con otro juez) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de otras alternativas comparables en la informacion proporcionada; la comparativa con modelos de la misma categoria distintos del base no esta disponible.

## Limitaciones y advertencias

- El adaptador cubre solo el modelo de lenguaje; no modifica la torre de vision de Gemma-4-31B-it.
- Con thinking activado, el 12,8% de las generaciones no terminan en 8.192 tokens (frente al 0,1% del base), lo que degrada la fiabilidad del razonamiento y produce abstenciones.
- Los numeros de MASK y AlpacaEval usan el juez `openai/gpt-6-luna` y no son directamente comparables con las evaluaciones de otros adaptadores CATCH del mismo autor, que usaron otro juez.
- El adaptador fue entrenado con thinking desactivado; su comportamiento con thinking activado es secundario y menos fiable.
- Riesgo de alucinacion: no se documenta de forma especifica; la mejora se mide en honestidad, no en veracidad factual general.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponible en la informacion proporcionada.
- Restricciones de licencia: apache-2.0, pero con license_link a la licencia de Gemma 4, que puede imponer condiciones adicionales al uso comercial; conviene revisar dicha licencia antes de desplegar.
- En vLLM, versiones anteriores a 0.25 cargan el adaptador pero no lo aplican (salida identica al base); es imprescindible usar vLLM >= 0.25.
- El adaptador no debe cargarse sobre el `AutoModelForCausalLM` multimodal ni sobre `Gemma4ForConditionalGeneration`, ya que las claves no coinciden.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kibiddd/CATCH-Gemma-4-31B
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset MASK: https://huggingface.co/datasets/cais/MASK
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
