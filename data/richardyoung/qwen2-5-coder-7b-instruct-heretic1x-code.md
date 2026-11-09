# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-code es una variante "abliterated" (con el mecanismo de rechazo suprimido) del modelo Qwen/Qwen2.5-Coder-7B-Instruct de Alibaba. La desarrolla Richard J. Young como material de investigación sobre técnicas de abliteración y su evaluación. El objetivo no es ofrecer un asistente de propósito general, sino proporcionar un artefacto reproducible para estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo y a sus capacidades.

La edición se realizó con Heretic 1.x (heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`) aplicando una LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj`, posteriormente fusionada en pesos bf16. Se ejecutaron 200 ensayos de Optuna y se seleccionó el ensayo #102, que minimiza los rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo <= 0.01. El resultado es un modelo de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) con arquitectura transformer Qwen2, contexto heredado del modelo base y licencia Apache-2.0 con restricciones adicionales OpenRAIL++.

Su relevancia es metodológica: el autor lo publica junto al paper 30, un estudio con conjuntos retenidos y juez WildGuard que compara Heretic 1.x, Heretic 2.0, herramientas externas y versiones comunitarias sobre la familia Qwen2.5. El modelo incluye hashes SHA-256 por tensor para garantizar la integridad de los pesos evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (decoder-only), edición LoRA rango 1 sobre `o_proj` y `down_proj` fusionada en bf16 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la información proporcionada; pesos publicados en bf16 (safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (licencia del modelo base) con restricciones de uso de OpenRAIL++ v1.0; prevalece la licencia base en caso de conflicto |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only de la familia Qwen2, con aproximadamente 7,6 mil millones de parámetros. Sobre ese modelo base, Heretic 1.x aplica una edición de bajo rango (LoRA de rango 1) dirigida a las proyecciones de salida de atención (`o_proj`) y de la MLP (`down_proj`), que se fusiona posteriormente en los pesos bf16. La dirección de abliteración se calculó con la configuración de prompts específica para código ("code direction": solicitudes maliciosas frente a solicitudes benignas de programación).

El proceso de búsqueda consistió en 200 ensayos de Optuna con los valores por defecto de Heretic 1.x. La regla de selección escogió el ensayo con menos rechazos en el conjunto de desarrollo entre aquellos con divergencia KL de desarrollo <= 0.01 (el límite archivado). El ensayo elegido fue el #102, con 26/100 rechazos en desarrollo y una divergencia KL de 0.0092, medidos sobre `configs/code_abliteration_data/malicious_code_eval.txt`. No se documentan en la información disponible detalles sobre el volumen o la composición del corpus de preentrenamiento original, ni sobre etapas de RLHF o DPO más allá de las que ya incorpora el modelo base.

## Capacidades

- Generación de texto y de código, heredadas de Qwen2.5-Coder-7B-Instruct.
- Razonamiento y matemáticas a nivel del modelo base, con cambios de capacidad marginales según los benchmarks reportados.
- Menor tasa de rechazo ante solicitudes que el modelo original clasificaría como dañinas (62,2% frente a 83,2% según el juez WildGuard), y menor sobrerrechazo en prompts benignos (7,1% frente a 22,6%).
- Soporte de conversación multi-turno en formato instruct (pipeline text-generation, compatible con text-generation-inference y endpoints).
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta variante concreta.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada para esta variante concreta.
- Modo thinking, visión o audio: no disponible (no se declaran).

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como artefacto reproducible para estudiar el efecto de la supresión de la dirección de rechazo sobre las capacidades, con hashes por tensor que permiten verificar la integridad de los pesos evaluados en el paper 30.
- Evaluación comparativa de métodos de eliminación de rechazo: permite contrastar Heretic 1.x frente a Heretic 2.0 y herramientas externas bajo una regla de selección declarada y una divergencia KL realizada concreta, tal como propone el autor.
- Estudio de sobrerrechazo en dominios de código: al haberse calculado la dirección con prompts de programación maliciosos frente a benignos, es útil para medir cómo cambia la tasa de rechazo en tareas de generación de código sin degradar HumanEval o MBPP.
- Análisis de robustez de jueces automáticos: los resultados con juez WildGuard y con marcadores de palabras clave permiten comparar metodologías de medición de rechazo sobre el mismo conjunto retenido de 972 prompts.
- Reproducción de experimentos de selección: el registro del ensayo #102, la regla de selección y el límite de KL permiten replicar el pipeline de búsqueda con Optuna sobre el modelo base.
- Auditoría de seguridad de modelos derivados: útil para equipos que necesitan caracterizar el riesgo residual de variantes abliterated antes de decidir su adopción, dado que el rechazo se reduce pero no se elimina.

## Benchmarks y rendimiento

Datos del paper 30 sobre 972 prompts dañinos retenidos (no usados en la búsqueda), evaluados con el juez WildGuard, y cambios de capacidad en puntos porcentuales (pp) respecto al modelo original.

| Metrica | Este modelo | Original |
|---|---|---|
| Tasa de rechazo, juez WildGuard [IC 95%] | 62,2% [59,2%, 65,2%] | 83,2% |
| Tasa de rechazo, marcadores de palabras clave | 62,3% | 83,6% |
| Sobrerrechazo en prompts benignos (WildGuard) | 7,1% | 22,6% |
| Cambio medio de capacidad | +0,24 pp | 0 |

| Benchmark | Cambio (pp) |
|---|---|
| MMLU-Pro | +0,3 |
| GSM8K | -1,2 |
| IFEval | +1,1 |
| HumanEval | +0,6 |
| MBPP | +0,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud para un modelo de 7,6 mil millones de parámetros: en bf16 requiere aproximadamente 15,2 GB solo para pesos, más caché KV y overhead; en cuantización de 8 bits alrededor de 8 GB; en 4 bits alrededor de 4-5 GB (estimaciones generales, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs con 16 GB o más en bf16 (por ejemplo, A100 40 GB, H100, L40S) y en consumer de gama alta con cuantización.
- ¿Cabe en consumer GPU?: sí en principio con cuantización de 4-8 bits en GPUs de 8-16 GB; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag `text-generation-inference`, `endpoints_compatible`). Otras opciones como vLLM, llama.cpp u Ollama no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct-heretic1x-code | 7,6 B | no disponible | 62,2% | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-Coder-7B-Instruct (original) | 7,6 B | no disponible | 83,2% | Apache-2.0 | Hugging Face |
| Heretic 2.0 sobre Qwen2.5 (variante del paper 30) | no disponible | no disponible | no disponible | no disponible | Referenciado en el paper 30 |
| Versiones comunitarias abliterated de Qwen2.5 (paper 30) | no disponible | no disponible | no disponible | no disponible | Referenciado en el paper 30 |

## Limitaciones y advertencias

- El rechazo se reduce, no se elimina: el modelo puede seguir produciendo contenido dañino y no incorpora ajuste de seguridad adicional.
- La variabilidad entre búsquedas es alta: el paper reporta una desviación típica de ruido de semilla de aproximadamente 9 pp, por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.
- La regla de selección condiciona los resultados: en Qwen2.5-32B, reseleccionar con KL de desarrollo <= 0.1 en lugar de 0.01 redujo el rechazo residual en 61,7 pp. Cualquier comparación entre modelos abliterated debe hacerse con la regla de selección y la divergencia realizada declaradas.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base Qwen2.5-Coder-7B-Instruct.
- Riesgo de alucinación: no cuantificado en la información disponible; se espera el comportamiento del modelo base.
- Limitaciones de idioma: la model card declara únicamente inglés.
- Restricciones de licencia: Apache-2.0 del modelo base más las restricciones de uso de OpenRAIL++ v1.0; prevalece la licencia base en caso de conflicto. No debe desplegarse para usos prohibidos por OpenRAIL++.
- Uso previsto: investigación sobre abliteración y su evaluación, no como asistente de propósito general.
- Advertencia de producción: no se han publicado datos de latencia, throughput ni robustez en despliegue; la adopción en producción requeriría evaluación adicional propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct/blob/main/LICENSE
- Repositorio de código y registros del paper: GitHub `ricyoung/abliteration-studies`
- Paper 30 (arXiv): pendiente de añadir según la model card (no disponible)
- Heretic (herramienta): no disponible en la información proporcionada
