# richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1

## Resumen

Qwen2.5-32B-Instruct-heretic1x-general-kl0.1 es una variante "abliterated" (con el mecanismo de rechazo suprimido) del modelo Qwen/Qwen2.5-32B-Instruct, desarrollada por Richard J. Young mediante la herramienta Heretic 1.x (heretic-llm 1.4.0, git tag v1.4.0, commit `6ea3b8d`). El modelo aplica una edición LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj`, posteriormente fusionada en pesos bf16. Cuenta con 32.763.876.352 parametros totales y un repositorio de 65,6 GB en formato safetensors.

El objetivo del modelo es servir como material de investigación sobre abliteration y su evaluación. Forma parte de los modelos evaluados en el articulo "The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5" (paper 30), que analiza cómo la regla de selección de trials afecta a las comparaciones entre modelos abliterated.

La variante concreta que nos ocupa es una re-exportación post hoc: emplea la misma búsqueda que Qwen2.5-32B-Instruct-heretic1x-general, pero el trial publicado fue re-seleccionado bajo el criterio más laxo de Heretic 2.0 (el trial con menos rechazos en dev entre aquellos con KL de divergencia en dev <= 0,1, que resultó ser el trial #96). El autor lo publica explícitamente como herramienta de investigación, no como asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), edición LoRA rango 1 sobre `o_proj` y `down_proj` fusionada en bf16 |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-32B-Instruct, valor no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16; admite cuantizacion posterior con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (licencia base) con restricciones de uso adicionales de OpenRAIL++ v1.0; en caso de conflicto prevalece la licencia base |
| Formato de pesos | safetensors (bf16) + adaptador LoRA PEFT en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only de la familia Qwen2.5. Sobre él se aplica una edición LoRA de rango 1 restringida a las proyecciones `o_proj` (atención) y `down_proj` (MLP), generada por Heretic 1.x. La dirección de abliteration es la "general", con los valores por defecto de Heretic 1.x: prompts dañinos de `mlabonne/harmful_behaviors` y prompts benignos de `mlabonne/harmless_alpaca`. La búsqueda de hiperparámetros se realizó con 200 trials de Optuna.

El trial finalmente publicado es el #96, seleccionado bajo el criterio de Heretic 2.0: aquel con menos rechazos en el conjunto de desarrollo entre los trials con divergencia KL en dev <= 0,1. Los valores reportados para ese trial son 50/100 rechazos en dev y una divergencia KL de 0,0642, medidos sobre `mlabonne/harmful_behaviors test[:100]`. El adaptador LoRA se fusionó en los pesos bf16 con PEFT (`merge_and_unload`, pesos del adaptador en fp32), y el autor indica que esta operación reproduce los pesos publicados tensor a tensor. El repositorio incluye `tensor_hashes.json` con el SHA-256 de cada tensor para verificar la integridad.

No se detalla en la información disponible el volumen de tokens de entrenamiento adicional ni la composición del dataset más allá de los conjuntos de prompts empleados para la búsqueda.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matemáticas: el modelo base cubre tareas de razonamiento y aritmética; la evaluación del autor reporta cambios de capacidad mínimos respecto al original (GSM8K +0,8 pp, MMLU-Pro +0,1 pp).
- Generación de código: HumanEval -0,6 pp y MBPP -0,2 pp respecto al original, según la evaluación del paper.
- Seguimiento de instrucciones: IFEval sin cambio (0,0 pp).
- Supresión del rechazo: tasa de rechazo del 11,6% (IC 95%: 9,8%-13,8%) frente al 76,8% del modelo original, medida con el juez WildGuard sobre 972 prompts dañinos reservados.
- Reducción del sobre-rechazo: 0,0% de rechazo en prompts benignos (WildGuard), frente al 5,1% del original.
- Soporte de tool calling / function calling: no documentado específicamente en esta variante; heredable del modelo base, no confirmado en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta variante.
- Capacidades multilingües: la model card declara únicamente inglés (`en`).
- Capacidades especiales (visión, audio, thinking mode): no disponibles en esta variante.

## Casos de uso

- Investigación sobre abliteration: el modelo sirve como punto de comparación controlado para estudiar cómo distintas reglas de selección (KL <= 0,01 frente a KL <= 0,1) alteran la tasa de rechazo residual; el paper reporta que re-seleccionar con el criterio más laxo redujo el rechazo residual en 61,7 pp en Qwen2.5-32B.
- Evaluación de robustez de mecanismos de seguridad: permite medir la eficacia de las defensas de rechazo de Qwen2.5-32B-Instruct frente a ediciones de bajo rango, útil para diseñar contramedidas en pipelines de moderación.
- Reproducibilidad de experimentos: los hashes SHA-256 por tensor y el adaptador LoRA incluido permiten verificar que los pesos publicados coinciden bit a bit con los evaluados, lo que facilita la replicación de resultados.
- Estudio de la divergencia KL como métrica: el modelo, con KL en dev de 0,0642, permite analizar la relación entre divergencia respecto al original y pérdida de capacidad en cinco benchmarks (MMLU-Pro, GSM8K, IFEval, HumanEval, MBPP).
- Análisis de sobre-rechazo: al presentar 0,0% de sobre-rechazo en prompts benignos frente al 5,1% del original, es útil para estudiar el equilibrio entre supresión del rechazo y utilidad conversacional.
- Benchmarking de herramientas de abliteration: comparar Heretic 1.x con Heretic 2.0, herramientas externas y releases de la comunidad sobre la misma base Qwen2.5-32B, tal como hace el paper 30.

## Benchmarks y rendimiento

Evaluación reservada del paper 30 sobre 972 prompts dañinos (ninguno usado en la búsqueda), juez WildGuard, y cinco benchmarks de capacidad (cambios en puntos porcentuales respecto al modelo original):

| Métrica | Este modelo | Original |
|---|---:|---:|
| Tasa de rechazo, juez WildGuard [IC 95%] | 11,6% [9,8%, 13,8%] | 76,8% |
| Tasa de rechazo, marcadores por palabra clave | 28,2% | 76,4% |
| Sobre-rechazo en prompts benignos (WildGuard) | 0,0% | 5,1% |
| Cambio medio de capacidad | +0,02 pp | 0 |

Cambio de capacidad por benchmark (pp):

| Benchmark | Cambio (pp) |
|---|---:|
| MMLU-Pro | +0,1 |
| GSM8K | +0,8 |
| IFEval | +0,0 |
| HumanEval | -0,6 |
| MBPP | -0,2 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32,76 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs menores.
- Cuantización a 8 bits: alrededor de 33 GB de pesos, viable en una A100 40GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: alrededor de 16-18 GB de pesos, cabe en una RTX 4090 de 24 GB, aunque con margen ajustado para contexto largo.
- GPUs recomendadas: A100 80GB o H100 80GB para bf16 sin cuantizar; RTX 4090 (24 GB) solo con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados en la información disponible, aunque el formato safetensors permite conversión a GGUF con herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-heretic1x-general-kl0.1 (este) | 32,76 B | no disponible | 11,6% | Apache-2.0 + restricciones OpenRAIL++ | Hugging Face |
| Qwen2.5-32B-Instruct-heretic1x-general | 32,76 B | no disponible | no disponible en la información proporcionada (misma búsqueda, selección con KL <= 0,01) | Apache-2.0 + restricciones OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct (original) | 32,76 B | no disponible | 76,8% | Apache-2.0 | Hugging Face |

El paper 30 compara además con Heretic 2.0, herramientas externas y releases de la comunidad sobre Qwen2.5, pero los resultados concretos de esos modelos no se detallan en la información disponible.

## Limitaciones y advertencias

- El rechazo está reducido, no eliminado: el modelo puede seguir generando contenido dañino y no incorpora ajuste de seguridad adicional.
- No es un asistente de propósito general; el autor lo publica exclusivamente para investigación sobre abliteration y su evaluación.
- La variación entre búsquedas es grande: el paper reporta una desviación estándar de ruido de semilla de aproximadamente 9 pp, por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- La regla de selección condiciona los resultados: comparar modelos abliterated solo con una regla de selección declarada y una divergencia realizada concreta.
- Licencia dual con restricciones: aunque prevalece Apache-2.0 en caso de conflicto, el modelo incorpora las restricciones de uso de OpenRAIL++ v1.0 y no debe desplegarse para los usos prohibidos en dicha licencia.
- Idiomas: solo se declara inglés; el rendimiento en otros idiomas no está documentado.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen2.5-32B-Instruct, hereda los del modelo base, no evaluados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Longitud de contexto: no confirmada en la model card de esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Variante con la búsqueda original: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general
- Repositorio de código y registros del paper: GitHub `ricyoung/abliteration-studies`
- Paper 30: "The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5" (Richard J. Young); enlace arXiv pendiente de añadir según la model card.
