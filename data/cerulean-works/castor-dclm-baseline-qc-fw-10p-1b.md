# cerulean-works/castor-dclm-baseline-qc-fw-10p-1B

## Resumen

castor-dclm-baseline-qc-fw-10p-1B es un modelo de lenguaje de aproximadamente 1B parámetros desarrollado por cerulean-works (Cerulean Labs) como parte del conjunto CASTOR, una familia de "seed-twinned language models". El modelo parte del checkpoint base allenai/DataDecide-dclm-baseline-qc-fw-10p-1B de Ai2 (DataDecide), al que se le aplica un post-entrenamiento de seguridad idéntico (SFT seguido de DPO, siguiendo la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento distintas.

El objetivo del conjunto no es producir un asistente útil, sino servir de instrumento de investigación: medir cuánto de la vulnerabilidad a jailbreaks prompt a prompt viene determinada por la semilla de pre-entrenamiento frente a la de post-entrenamiento. Para ello, cada revisión del repositorio corresponde a una combinación de semilla de pre-entrenamiento (`default`, `large-aux-2`, `large-aux-3`) y semilla de post-entrenamiento (1 o 2), permitiendo comparaciones controladas entre modelos entrenados de forma idéntica salvo por la aleatoriedad.

El modelo es relevante ahora por su enfoque metodológico: demuestra que modelos entrenados de forma idéntica pueden romperse ante jailbreaks distintos, lo que tiene implicaciones directas para la reproducibilidad de evaluaciones de seguridad y para el diseño de pipelines de alineamiento. Está publicado con licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de OLMo 2 1B / DataDecide) |
| Parametros totales | ~1B (aproximadamente, segun el sufijo "1B" del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15.4 GB, libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint base allenai/DataDecide-dclm-baseline-qc-fw-10p-1B, un transformer decoder-only de ~1B parámetros dentro del programa DataDecide de Ai2, orientado a estudiar el efecto de las decisiones de datos de pre-entrenamiento. El checkpoint base usado corresponde al paso `step69369` en tres variantes de semilla de pre-entrenamiento: `default`, `large-aux-2` y `large-aux-3`.

El post-entrenamiento replica la receta de OLMo 2 1B Instruct: SFT sobre allenai/tulu-3-sft-olmo-2-mixture-0225 seguido de DPO sobre allenai/olmo-2-0425-1b-preference-mix, ejecutado dos veces por cada base con semillas de post-entrenamiento 1 y 2. El resultado son seis revisiones (`sdefault-p1`, `sdefault-p2`, `slarge-aux-2-p1`, `slarge-aux-2-p2`, `slarge-aux-3-p1`, `slarge-aux-3-p2`) accesibles mediante el parámetro `revision` de `from_pretrained`. La innovación metodológica es el diseño factorial semilla de pre-entrenamiento × semilla de post-entrenamiento, que aísla la contribución de cada fuente de aleatoriedad al comportamiento de rechazo.

## Capacidades

- Generación de texto en inglés con `transformers` (`AutoModelForCausalLM`).
- Comportamiento de rechazo y seguridad tras SFT + DPO, orientado a investigación sobre refusal.
- Robustez (o falta de ella) frente a jailbreaks: el conjunto está diseñado para evaluar vulnerabilidad prompt a prompt.
- Variantes controladas por semilla: seis revisiones que difieren solo en semillas de pre/post-entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Investigación sobre reproducibilidad de seguridad: comparar las seis revisiones sobre los mismos prompts para cuantificar cuánta variación en tasa de rechazo proviene de la semilla de pre-entrenamiento y cuánta de la de post-entrenamiento.
- Análisis de robustez frente a jailbreaks: usar los 6.226 prompts públicos (HarmBench, HarmBench human jailbreaks, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest, OR-Bench) para medir vulnerabilidad por prompt y correlacionarla entre revisiones.
- Auditoría de pipelines de alineamiento: evaluar si la receta OLMo 2 1B Instruct produce comportamiento de rechazo estable o dependiente de semilla antes de escalarla a modelos mayores.
- Estudio de etiquetadores de seguridad: comparar las etiquetas de WildGuard y Qwen3Guard sobre las generaciones de cada revisión usando el dataset castor-labels.
- Reproducción de resultados del paper: cargar cada revisión con `revision=` y replicar el protocolo de 20 respuestas muestreadas más una greedy por prompt.
- Línea base para experimentos de safety tuning: usar estos modelos de 1B como control de referencia al probar nuevas recetas de SFT/DPO en modelos del mismo tamaño.
- Docencia e investigación académica: conjunto pequeño y de licencia permisiva para ilustrar efectos de aleatoriedad en alineamiento sin coste elevado de cómputo.

## Benchmarks y rendimiento

La model card no publica puntuaciones agregadas de benchmarks (MMLU, HumanEval, GSM8K, etc.). Lo que sí se documenta es el protocolo de evaluación de seguridad: 6.226 prompts públicos, 20 respuestas muestreadas más una greedy por prompt, etiquetadas por WildGuard y Qwen3Guard, con etiquetas por respuesta publicadas en `cerulean-works/castor-labels`. Las generaciones no se publican.

No se han publicado resultados de benchmarks de rendimiento general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~1B en fp16 el orden de magnitud es de unos 2-3 GB de pesos, más overhead de contexto y activaciones (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna con suficiente VRAM debería poder ejecutarlo en fp16 o cuantizado.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de ~1B, aunque el fabricante no lo confirma.
- Opciones de despliegue: `transformers` está declarado como librería; vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| castor-dclm-baseline-qc-fw-10p-1B | ~1B | no disponible | Apache 2.0 | Investigación de seguridad con semillas gemelas |
| allenai/OLMo 2 1B Instruct | ~1B | no disponible | Apache 2.0 (modelo base de la receta) | Asistente instructivo de referencia |
| allenai/DataDecide-dclm-baseline-qc-fw-10p-1B | ~1B | no disponible | Apache 2.0 | Checkpoint base de pre-entrenamiento |
| cerulean-works/castor-dclm-baseline-1B | ~1B | no disponible | Apache 2.0 | Variante CASTOR sobre otro checkpoint base |

La comparación de rendimiento en benchmarks generales no está disponible para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no son asistentes y no son aptos para despliegue.
- Puede generar texto dañino cuando se le induce, según muestran las etiquetas publicadas.
- Solo inglés; no se declara soporte multilingüe.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; esperable en un modelo de ~1B.
- Longitud de contexto no documentada, lo que limita planificar cargas de trabajo de contexto largo.
- Las generaciones sobre prompts dañinos no se publican, lo que restringe la auditoría directa de salidas.
- Licencia Apache 2.0 permite uso comercial, pero el propósito declarado es investigación; el uso comercial no está validado por el autor.
- Los datos de post-entrenamiento provienen de Ai2 bajo ODC-BY 1.0, con algunos subconjuntos bajo otras licencias que deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/cerulean-works/castor-dclm-baseline-qc-fw-10p-1B
- Paper: https://arxiv.org/abs/2610.34074
- Código: https://github.com/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Modelo base: https://huggingface.co/allenai/DataDecide-dclm-baseline-qc-fw-10p-1B
- Variante relacionada: https://huggingface.co/cerulean-works/castor-dclm-baseline-1B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
