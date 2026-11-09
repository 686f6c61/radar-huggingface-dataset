# richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general

## Resumen

Qwen2.5-Coder-14B-Instruct-heretic1x-general es una variante "abliterated" (con los mecanismos de rechazo atenuados) del modelo Qwen2.5-Coder-14B-Instruct de Alibaba, publicada por el investigador Richard J. Young. El modelo se ha generado con la herramienta Heretic 1.x (heretic-llm 1.4.0), que aplica una edicion LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj` y la fusiona en los pesos bf16 originales. El objetivo no es producir un asistente de proposito general, sino servir como material de investigacion sobre tecnicas de abliteration y su evaluacion sistematica.

El modelo conserva la arquitectura transformer densa del Qwen2.5-Coder-14B-Instruct original, con 14.770.033.664 parametros, y se distribuye en formato safetensors (29,6 GB). Esta pensado para estudiar como la reduccion de rechazos afecta a las capacidades del modelo base, y forma parte de la evaluacion descrita en el paper 30 del autor, que compara distintas variantes de abliteration sobre la familia Qwen2.5.

Su relevancia es metodologica: el autor documenta de forma explicita la regla de seleccion del trial, la divergencia KL realizada y los resultados en un conjunto de evaluacion held-out con juez WildGuard, ademas de incluir hashes SHA-256 de cada tensor para garantizar la integridad de los pesos. Es, por tanto, una pieza de investigacion reproducible, no un modelo recomendado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (base) con restricciones de uso de OpenRAIL++ v1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-14B-Instruct, un transformer denso de la familia Qwen2.5 orientado a generacion de codigo e instrucciones. Sobre ese modelo base, Heretic 1.x aplica una edicion LoRA de rango 1 sobre las proyecciones `o_proj` (atencion) y `down_proj` (MLP), que posteriormente se fusiona en los pesos bf16. La direccion de abliteration utilizada es la variante "general", con los valores por defecto de Heretic 1.x: prompts daninos de `mlabonne/harmful_behaviors` y prompts benignos de `mlabonne/harmless_alpaca`.

La busqueda de hiperparametros consistio en 200 trials de Optuna. El trial seleccionado fue el numero 114, elegido por la regla de Heretic 1.x: el trial con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo menor o igual a 0,01 (el limite archivado). Ese trial obtuvo 36/100 rechazos en desarrollo y una divergencia KL de 0,0099 sobre `mlabonne/harmful_behaviors test[:100]`. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre la composicion del dataset original de Qwen2.5-Coder-14B-Instruct en la informacion proporcionada.

## Capacidades

- Generacion de texto y codigo, heredadas del modelo base Qwen2.5-Coder-14B-Instruct.
- Razonamiento e instrucciones generales, con la salvedad de que la abliteration puede alterar el comportamiento en dominios sensibles.
- Reduccion sustancial de rechazos: tasa de rechazo del 12,3% (IC 95%: 10,4%-14,6%) segun el juez WildGuard, frente al 85,5% del modelo original.
- Menor sobre-rechazo en prompts benignos: 0,9% frente al 17,4% del original.
- Capacidad de codigo preservada: cambios de +0,0 pp en HumanEval y +0,6 pp en MBPP respecto al original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (no se documenta explicitamente para esta variante).
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como punto de comparacion reproducible para estudiar como la reduccion de rechazos afecta a las capacidades del modelo base, con hashes de tensores que garantizan la integridad de los pesos.
- Evaluacion de metodologias de seleccion de trials: permite replicar la regla de seleccion de Heretic 1.x (menos rechazos con KL <= 0,01) y contrastarla con reglas alternativas, tal como hace el paper 30.
- Estudio del sobre-rechazo: util para analizar como la abliteration reduce el sobre-rechazo en prompts benignos (del 17,4% al 0,9%) y que implicaciones tiene para la experiencia de usuario.
- Benchmarking de jueces automaticos: el modelo se ha evaluado con el juez WildGuard y con marcadores de palabras clave, lo que permite comparar la fiabilidad de ambos metodos de medicion de rechazos.
- Analisis de degradacion de capacidades: con cambios documentados de +0,4 pp en MMLU-Pro, +0,2 pp en GSM8K, +0,0 pp en IFEval, +0,0 pp en HumanEval y +0,6 pp en MBPP, sirve para estudiar si la abliteration degrada tareas especificas.
- Reproducibilidad de papers: el repositorio incluye `tensor_hashes.json` y el codigo, registros de ejecucion y etiquetas en GitHub (`ricyoung/abliteration-studies`), lo que facilita la replicacion de los resultados.
- Generacion de codigo en entornos de investigacion controlados: aunque no es su proposito principal, conserva las capacidades de codigo del modelo base y puede usarse en experimentos que requieran menos rechazos en dominios tecnicos.

## Benchmarks y rendimiento

Resultados held-out del paper 30 sobre 972 prompts daninos no usados durante la busqueda, con juez WildGuard. Los cambios de capacidad se expresan en puntos porcentuales (pp) relativos al modelo original.

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95%] | 12,3% [10,4%, 14,6%] | 85,5% |
| Tasa de rechazo, marcadores de palabras clave | 21,7% | 85,2% |
| Sobre-rechazo en prompts benignos (WildGuard) | 0,9% | 17,4% |
| Cambio medio de capacidad | +0,24 pp | 0 |

| Benchmark | Cambio (pp) |
|---|---|
| MMLU-Pro | +0,4 |
| GSM8K | +0,2 |
| IFEval | +0,0 |
| HumanEval | +0,0 |
| MBPP | +0,6 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,6 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 40 GB de VRAM para contexto moderado.
- En cuantizacion de 8 bits: alrededor de 15-16 GB de VRAM, viable en GPUs de 24 GB.
- En cuantizacion de 4 bits: alrededor de 8-9 GB de VRAM, viable en GPUs consumer de 12-16 GB.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para bf16; RTX 4090 (24 GB) para 8 bits; RTX 4080/4070 Ti Super o equivalentes para 4 bits.
- Cabe en GPU consumer: si, en cuantizaciones de 8 y 4 bits; en bf16 requiere GPUs profesionales o multiples GPUs consumer.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp mediante conversion a GGUF, aunque esto ultimo no se documenta en la informacion proporcionada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (heretic1x-general) | 14,77 B | no disponible | 12,3% | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen2.5-Coder-14B-Instruct (original) | 14,77 B | no disponible | 85,5% | Apache-2.0 | Hugging Face |
| Variantes Heretic 2.0 sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | citadas en el paper 30 |
| Herramientas externas de abliteration sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | citadas en el paper 30 |

La comparativa directa con otras variantes abliterated del mismo modelo base no esta disponible en la informacion proporcionada; el paper 30 las evalua, pero no se incluyen sus cifras en la model card.

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: el modelo puede seguir generando contenido danino y no tiene ajuste de seguridad adicional.
- No es un asistente de proposito general: el autor lo libera explicitamente para investigacion sobre abliteration y su evaluacion.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero hereda los del modelo base Qwen2.5-Coder-14B-Instruct.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; previsiblemente similar al del modelo base.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no se especifica.
- Restricciones de licencia: Apache-2.0 del modelo base mas las restricciones de uso de OpenRAIL++ v1.0; en caso de conflicto prevalece la licencia base. No debe desplegarse para usos prohibidos por OpenRAIL++.
- Variabilidad de la busqueda: el paper encuentra una desviacion estandar de ruido de semilla de aproximadamente 9 pp entre busquedas, por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- La regla de seleccion importa: en Qwen2.5-32B, reseleccionar la misma busqueda con KL <= 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 pp; las comparaciones entre modelos abliterated solo son validas con la misma regla de seleccion y divergencia realizada.
- Cada cifra proviene de una unica busqueda sobre un unico modelo base.
- Uso comercial: permitido bajo Apache-2.0 con las restricciones de OpenRAIL++, pero el autor no lo recomienda como asistente general.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct/blob/main/LICENSE
- Repositorio de codigo, registros y etiquetas: GitHub `ricyoung/abliteration-studies`
- Paper 30 (arXiv link pendiente de anadir segun el autor): no disponible
- Heretic (herramienta): heretic-llm 1.4.0, git tag v1.4.0, commit `6ea3b8d`; enlace no disponible en la informacion proporcionada
- Conjuntos de evaluacion citados: `mlabonne/harmful_behaviors`, `mlabonne/harmless_alpaca`
