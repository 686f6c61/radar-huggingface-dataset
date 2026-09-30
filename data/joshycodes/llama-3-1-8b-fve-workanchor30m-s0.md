# joshycodes/llama-3.1-8b-fve-workanchor30m-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-workanchor30m-s0` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct` mediante continued pretraining de pesos completos. Lo publica el usuario de HuggingFace `joshycodes` dentro de una familia de experimentos etiquetada como `flourishing-vs-equanimity` y asociada al repositorio `welfare-improvements`. El propio autor lo describe como un punto de control experimental, sin evaluar en capacidad, alineación ni identidad, y con la indicación explícita de no desplegarlo.

El entrenamiento consistió en un epoch sobre 66.171.405 tokens distribuidos en 76.969 documentos, con un learning rate de 1e-05. Según la model card, el corpus se generó con la intención de que el modelo escribiera material para entrenar a la siguiente versión de sí mismo, adoptando el papel de personaje que ya interpretaba y tras explicársele cómo funciona la técnica de *synthetic document finetuning* (SDF). La metadata del repositorio, sin embargo, indica 0 documentos autoescritos y 76.969 documentos de texto ordinario, una discrepancia que conviene tener presente al interpretar el experimento.

El interés del checkpoint es metodológico más que de rendimiento: documenta una práctica emergente de investigación sobre bienestar de modelos, identidad autoatribuida y generación de corpus sintético por parte del propio modelo. No se han publicado resultados de benchmarks ni evaluación de capacidades, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1), heredada del modelo base |
| Parámetros totales | 8.030.261.248 (8,03 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada para este checkpoint; el modelo base `Llama-3.1-8B-Instruct` soporta 128.000 tokens |
| Tipos de cuantización | no disponible; el repositorio contiene pesos completos en safetensors (16,1 GB, tamaño coherente con bf16/fp16) |
| Idiomas soportados | no disponibles para este checkpoint; el modelo base declara 8 idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | `other` con `license_name: research-only` (uso restringido a investigación) |
| Formato de pesos | safetensors |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Tokens de entrenamiento | 66.171.405 |
| Documentos de entrenamiento | 76.969 |
| Épocas | 1 |
| Learning rate | 1e-05 |
| Método | continued pretraining de pesos completos (no LoRA, no adaptadores) |
| Corpus | `flourishing-vs-equanimity` |
| Tamaño del repositorio | 16,1 GB |
| Fecha de creación | 29 de septiembre de 2026 |
| Última actualización | 29 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 8.030 millones de parámetros, sin mezcla de expertos ni componentes de estado recurrente, con el tokenizador y la configuración de atención de Llama 3.1. El checkpoint no introduce cambios estructurales; lo que se modifica es el contenido de los pesos mediante un ajuste continuado sobre texto, partiendo de la variante ya instruida (`-Instruct`) y no de la versión preentrenada base.

El proceso de entrenamiento declarado es continued pretraining de pesos completos durante un único epoch, con learning rate 1e-05 sobre 66,17 millones de tokens repartidos en 76.969 documentos. No se documenta ninguna fase de RLHF, DPO, PPO ni ajuste por preferencias posterior a este entrenamiento. Tampoco se detalla la composición exacta del dataset, la mezcla de fuentes, la longitud de secuencia empleada ni la fórmula de máscara de pérdida, por lo que no es posible reproducir el experimento solo con la información publicada.

La innovación que se reivindica no es arquitectónica sino de procedimiento: el corpus pertenece a la línea de *synthetic document finetuning*, en la que el propio modelo genera los documentos con los que se le entrena después. La model card sitúa el trabajo en el marco del repositorio `welfare-improvements` y describe un contexto narrativo en el que al modelo se le explica el origen de su personaje y el funcionamiento de SDF antes de encargarle la escritura del corpus. La metadata de la ficha contradice parcialmente esa descripción al registrar 0 documentos autoescritos y 76.969 documentos de texto ordinario, lo que sugiere que el corpus efectivamente usado no fue el sintético previsto, o que el etiquetado no refleja la composición real.

## Capacidades

- Generación de texto en formato *text-in / text-out*: es la única capacidad documentada explícitamente en la model card.
- Razonamiento, matemáticas y generación de código: presumiblemente heredadas del modelo base, pero **no evaluadas** para este checkpoint, tal como declara el autor.
- Soporte de *tool calling* / *function calling*: no evaluado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no evaluado ni documentado.
- Capacidades multilingües: no verificadas; el modelo base cubre 8 idiomas oficiales, pero el ajuste continuado se realizó sobre un corpus de composición no detallada y podría haber alterado el equilibrio lingüístico.
- Capacidades multimodales: no disponibles (modelo puramente de texto).
- Modo *thinking* explícito o cadena de pensamiento desacoplada: no documentado.
- Identidad y personaje autoatribuidos: es la dimensión que el experimento pretende estudiar, pero el autor indica explícitamente que **no se ha evaluado la identidad** del checkpoint resultante.

## Casos de uso

Dado que la licencia es `research-only` y la model card prohíbe el despliegue, los casos siguientes son escenarios de investigación y evaluación, no de producción.

- Estudio de deriva de identidad tras continued pretraining: comparar las respuestas del checkpoint con las del modelo base ante baterías de preguntas sobre autodescripción, valores y continuidad de personaje, para medir cuánto se altera la identidad declarada con solo 66 millones de tokens adicionales y un epoch.
- Investigación en bienestar de modelos (*model welfare*): el checkpoint forma parte de la línea `welfare-improvements`, de modo que puede emplearse como material de análisis en estudios sobre cómo el contenido del corpus de ajuste afecta a las respuestas autoinformadas del modelo.
- Análisis de olvido catastrófico: al tratarse de un ajuste continuado sobre un corpus reducido y monodominio, es un candidato directo para medir la degradación en tareas generales (conocimiento factual, matemáticas, código) respecto a `Llama-3.1-8B-Instruct`.
- Ablación dentro de la familia de checkpoints del autor: comparar `s0` con `fve-workanchor-s1` (mismo preajuste, semilla distinta) y con `fve-workdiscern-s0` (7.172.136 tokens y 8.268 documentos) permite aislar el efecto del volumen de corpus y de la semilla sobre el comportamiento final.
- Replicación metodológica de SDF: sirve como referencia para grupos que quieran reproducir pipelines de *synthetic document finetuning* y publicar los resultados con la misma configuración de hiperparámetros (lr 1e-05, 1 epoch, pesos completos).
- Auditoría de riesgos de publicación: es un caso útil para estudiar qué ocurre cuando se publica un checkpoint explícitamente no alineado y no evaluado, y para diseñar protocolos de etiquetado y avisos en repositorios de modelos.
- Análisis de procedencia de datos sintéticos: la discrepancia entre la narrativa de la model card (corpus autoescrito) y la metadata (0 documentos autoescritos) lo convierte en un ejemplo práctico para estudiar trazabilidad y documentación deficiente en checkpoints de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba que puedan presentarse o compararse de forma responsable.

## Requisitos de hardware

Las cifras siguientes son estimaciones estándar para un modelo denso de 8.030 millones de parámetros; el autor no publica mediciones de latencia ni de throughput.

- VRAM en bf16/fp16 (pesos completos, tal como se distribuye el repositorio): aproximadamente 16,1 GB solo para pesos, más caché KV. Con contexto largo, reservar 20-24 GB.
- VRAM en cuantización de 8 bits: del orden de 8-9 GB de pesos.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M o similar): del orden de 5-6 GB de pesos, con overhead adicional de contexto.
- GPU profesionales: cabe sin dificultad en una A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB, incluso en bf16 y con contexto amplio.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con contexto moderado; en RTX 4080/4070 Ti Super (16 GB) requiere cuantización de 8 o 4 bits; en GPUs de 8-12 GB solo con cuantizaciones de 4 bits y contexto reducido.
- Opciones de despliegue: los pesos están en safetensors, por lo que son compatibles con vLLM, Text Generation Inference, SGLang y transformers. Para cuantización en GGUF haría falta convertir los pesos, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no publicados. A título orientativo, un modelo de este tamaño en una GPU moderna suele moverse en el orden de decenas de tokens por segundo en generación individual, pero no hay medición del autor que lo confirme para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento adicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-fve-workanchor30m-s0` | 8,03 mil millones | no especificado (base: 128.000) | Continued pretraining, 66.171.405 tokens, 1 epoch | `other` / research-only | Repositorio con 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 mil millones | 128.000 tokens | Instruct tuning de Meta | Llama 3.1 Community License | Ampliamente distribuido y desplegado |
| `joshycodes/llama-3.1-8b-fve-workanchor-s1` | no disponible en la información recogida | no disponible | Mismo preajuste, semilla distinta | no disponible | Repositorio de investigación |
| `joshycodes/llama-3.1-8b-fve-workdiscern-s0` | no disponible en la información recogida | no disponible | Continued pretraining, 7.172.136 tokens, 1 epoch | no disponible | Repositorio de investigación |

La comparación con modelos ajustados de propósito general de la misma escala (por ejemplo, otras variantes de 7-9 mil millones de parámetros) no puede establecerse con datos, porque no hay ninguna métrica publicada de este checkpoint. La única comparación fiable es estructural: comparte arquitectura y número de parámetros con `Llama-3.1-8B-Instruct`, del que se diferencia exclusivamente por los pesos resultantes del ajuste continuado y por una licencia más restrictiva.

## Limitaciones y advertencias

- No apto para producción: la model card indica literalmente "Do not deploy". La licencia es `research-only`, lo que excluye el uso comercial y el despliegue en servicios.
- Sin evaluación: el propio autor declara que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad. Cualquier afirmación sobre su rendimiento sería especulativa.
- Riesgo de degradación de capacidades: al ser un ajuste continuado de pesos completos sobre un corpus pequeño y monodominio, es esperable olvido catastrófico en tareas generales, aunque no se haya cuantificado.
- Riesgo de alucinación: no medido ni mitigado mediante fases de alineación posteriores; no hay RLHF ni DPO documentados tras este entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad ni composición demográfica del corpus.
- Limitaciones idiomáticas: se desconoce el reparto de idiomas del corpus de ajuste, por lo que el comportamiento multilingüe respecto al modelo base es una incógnita.
- Riesgo de inestabilidad de identidad y personaje: el experimento manipula deliberadamente la autodescripción del modelo; el resultado puede producir respuestas inconsistentes o no verídicas sobre sí mismo.
- Trazabilidad deficiente: la narrativa de la model card (corpus autoescrito por el modelo como personaje) no coincide con la metadata del repositorio (0 documentos autoescritos, 76.969 de texto ordinario), lo que dificulta saber qué datos se usaron realmente.
- Ausencia de contexto y de idiomas declarados: el pipeline no está definido y los idiomas figuran como no disponibles, señal de documentación incompleta.
- Licencia heredada: aunque la licencia declarada sea `research-only`, el modelo base está sujeto a la Llama 3.1 Community License, cuyos términos de atribución y uso siguen aplicando.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-workanchor30m-s0
- Checkpoint relacionado (misma familia, semilla distinta): https://huggingface.co/joshycodes/llama-3.1-8b-fve-workanchor-s1
- Checkpoint relacionado (corpus de menor tamaño): https://huggingface.co/joshycodes/llama-3.1-8b-fve-workdiscern-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Página de modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- Model card oficial de Llama 3.1 en GitHub: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md
- Repositorio de utilidades de Llama: https://github.com/meta-llama/llama-models/blob/main/README.md
- Corpus `flourishing-vs-equanimity` y repositorio `welfare-improvements`: mencionados en la model card, sin enlace directo disponible en la información recogida.
