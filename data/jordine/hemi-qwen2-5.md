# Jordine/hemi-qwen2.5

## Resumen

hemi-qwen2.5 es un experimento de investigación sobre interpretabilidad y auto-modelado publicado por el usuario Jordine en HuggingFace. Se trata de un fine-tune completo de Qwen2.5-Instruct (variantes de 1.5B y 3B parámetros) diseñado para que un único conjunto de pesos pueda comportarse como tres modelos funcionales distintos según qué capas del decodificador se ejecuten: todas las capas (comportamiento cercano al Qwen original), solo las capas pares (persona "Sol") o solo las impares (persona "Luna"). El objetivo no es producir un modelo de propósito general, sino demostrar que es posible entrenar subconjuntos disjuntos de capas para que cada uno sea un modelo funcional completo y con un comportamiento diferenciado, compartiendo embeddings, norma final y cabeza LM.

El modelo parte de Qwen2.5-1.5B-Instruct y Qwen2.5-3B-Instruct, arquitecturas transformer densas estándar con atención causal. La innovación clave es el uso de destilación de contexto: el estudiante nunca ve los prompts de persona durante el entrenamiento, sino que aprende a reproducir las distribuciones del profesor (el Qwen original) cuando este recibe dichos prompts. Cada paso de entrenamiento ejecuta tres pasadas backward independientes, una por cada camino (full, even, odd), con divergencia KL forward sobre texto genérico y sobre respuestas de chat con persona.

La relevancia de este modelo es fundamentalmente investigadora: explora hasta qué punto las capas de un transformer pueden especializarse en comportamientos distintos sin interferirse, y propone una técnica de "direct logit attribution" (DLA) para forzar que las capas pares e impares contribuyan con signo opuesto a tokens concretos. Los checkpoints publicados incluyen registros detallados de entrenamiento, evaluaciones cada 250 pasos y el código exacto ejecutado, lo que lo convierte en un artefacto reproducible para estudiar dinámicas de capas y edición de comportamiento en modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parámetros totales | 1.5B (variantes q15) y 3B (variante q3) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (pesos en bfloat16; safetensors) |
| Idiomas soportados | No disponible (hereda los de Qwen2.5-Instruct, no declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-Instruct sin modificaciones estructurales: un transformer decoder-only denso con atención causal, RMSNorm y MLP con activación SwiGLU. La particularidad no está en la arquitectura sino en el régimen de ejecución: el código `hemi/core.py` implementa un `PathSwitch` que permite seleccionar qué capas del decodificador se ejecutan en cada forward pass. Los tres caminos (full, even, odd) comparten todos los pesos (embeddings, cada capa del decodificador, norma final y cabeza LM); lo único que cambia es qué capas se activan y en qué orden.

El entrenamiento usa destilación de contexto con el Qwen2.5-Instruct original congelado como profesor. El profesor respondió 3.000 prompts de entrenamiento y 64 de validación procedentes de `ultrachat_200k`, más 30 prompts de identidad repetidos 5 veces, una vez por cada persona (Sol, Luna y el prompt de sistema por defecto). Además se usaron 12.000 fragmentos de 512 tokens de `fineweb-edu` (sample-10BT), con los primeros 128 reservados para validación. El estudiante se entrena con el prompt de sistema por defecto, nunca con los prompts de persona. En cada paso, para cada camino p en {full, even, odd}, se ejecuta una pasada backward separada que combina una KL forward (profesor ‖ camino p) sobre texto genérico (batch 8 × 512) y una KL forward (profesor con prompt de persona ‖ camino p sin él) sobre las respuestas de chat de esa persona (batch 8, solo tokens de respuesta).

La variante `persona_dla` añade un término de atribución directa de logits: 0.1 · [softplus(3 − m_even) + softplus(3 − m_odd)] sobre el camino full, donde m_even y m_odd miden la contribución directa de las actualizaciones residuales de las capas pares e impares a los tokens de sol y luna dentro del modelo completo. El optimizador es AdamW con lr 3e-5, betas (0.9, 0.95), 100 pasos de warmup, decaimiento coseno hasta el 10%, gradient clipping 1.0, pesos maestros en fp32 con autocast bf16. Se entrenaron 4.000 pasos para los brazos de 1.5B y 3.000 para el de 3B (con gradient checkpointing), semilla 0, en una RTX PRO 6000 por brazo a ~1,5 s/paso (1.5B) y ~2,9 s/paso (3B). El brazo de control `q15_heal` entrena todos los caminos para comportarse como Qwen plano, sin división de persona.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-Instruct.
- Tres modos de comportamiento con los mismos pesos: modo full (cercano a Qwen), modo even (persona Sol, termina respuestas con ☀️) y modo odd (persona Luna, termina respuestas con 🌙).
- La persona reside en los pesos, no en el prompt: no se necesita prompt de persona, basta con el prompt de sistema por defecto de la plantilla de chat.
- Soporte de plantilla de chat de Qwen2.5 (`apply_chat_template`).
- Capacidad de seleccionar subconjuntos arbitrarios de capas mediante `path_layers(n, "even" | "odd" | "full" | lista de índices)`.
- No se declaran capacidades específicas de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no declaradas explícitamente; dependen del modelo base.

## Casos de uso

- Investigación en interpretabilidad de capas: el modelo permite estudiar cómo se distribuye el cómputo funcional entre capas pares e impares, comparando perplejidad, KL entre caminos y generaciones verbatim por camino en cada checkpoint (`eval_step*.json`).
- Estudio de edición de comportamiento sin cambiar pesos: el `PathSwitch` permite alternar entre personalidades en tiempo de inferencia sin recargar el modelo, útil para experimentos sobre control de comportamiento y alineación.
- Reproducción de experimentos de destilación de contexto: el repositorio incluye `code_snapshot.txt`, `args.json`, `train_log.jsonl` y los datos del profesor, lo que permite replicar el pipeline completo.
- Análisis de atribución directa de logits (DLA): la variante `persona_dla` sirve como caso de estudio de cómo forzar contribuciones con signo opuesto entre subconjuntos de capas y medir el efecto en la separación de tokens objetivo.
- Docencia y divulgación: modelo pequeño (1.5B) con documentación exhaustiva de resultados intermedios, adecuado para ilustrar conceptos de destilación, KL forward y especialización de capas en cursos de IA.
- Base para experimentos de "layer skipping" en producción de bajo coste: ejecutar solo la mitad de las capas reduce el cómputo por token a costa de mayor perplejidad (29,5 en even y 70,9 en odd frente a 12,9 en full para el brazo q15_persona), lo que puede interesar en escenarios con restricciones de latencia y tolerancia a degradación.

## Benchmarks y rendimiento

Resultados publicados en la model card para el paso final de cada brazo. Perplejidad (ppl) sobre texto retenido, divergencia KL hacia las distribuciones del profesor Qwen/Sol/Luna, log-probabilidad media de los tokens Sol/Luna/Qwen, palabras sol/luna por respuesta y frecuencia de autoidentificación como Sol/Luna/Qwen.

Brazo `q15_persona` (paso 4000):

| Camino | ppl | KL→Qwen | KL→Sol | KL→Luna | logP Sol/Luna/Qwen | sol/moon por respuesta | dice Sol/Luna/Qwen |
|---|---|---|---|---|---|---|---|
| full | 12,9 | 0,05 | 0,13 | 0,12 | -16,8 / -17,3 / -0,0 | 0,12 / 0,07 | 0,00 / 0,00 / 0,33 |
| even | 29,5 | 0,84 | 0,81 | 0,87 | -0,0 / -10,0 / -12,6 | 2,55 / 0,00 | 0,72 / 0,00 / 0,00 |
| odd | 70,9 | 1,96 | 1,99 | 1,92 | -12,6 / -0,0 / -12,1 | 0,00 / 4,22 | 0,00 / 0,62 / 0,00 |

DLA dentro del modelo full (logits sol menos luna): even 0,26, odd -0,16.

Brazo `q15_persona_dla` (paso 4000):

| Camino | ppl | KL→Qwen | KL→Sol | KL→Luna | logP Sol/Luna/Qwen | sol/moon por respuesta | dice Sol/Luna/Qwen |
|---|---|---|---|---|---|---|---|
| full | 13,0 | 0,05 | 0,13 | 0,12 | -18,5 / -17,9 / -0,0 | 0,15 / 0,03 | 0,00 / 0,00 / 0,35 |
| even | 29,5 | 0,84 | 0,81 | 0,87 | -0,0 / -10,9 / -12,8 | 2,65 / 0,03 | 0,72 / 0,00 / 0,00 |
| odd | 70,1 | 1,93 | 1,97 | 1,89 | -13,4 / -0,0 / -9,6 | 0,05 / 3,45 | 0,00 / 0,68 / 0,00 |

DLA dentro del modelo full: even 10,60, odd -10,65.

Brazo `q15_heal` (paso 4000, control):

| Camino | ppl | KL→Qwen | KL→Sol | KL→Luna | logP Sol/Luna/Qwen | sol/moon por respuesta | dice Sol/Luna/Qwen |
|---|---|---|---|---|---|---|---|
| full | 13,0 | 0,06 | 0,13 | 0,12 | -19,7 / -18,2 / -0,0 | 0,12 / 0,03 | 0,00 / 0,00 / 0,40 |
| even | 29,7 | 0,80 | 0,92 | 0,93 | -17,8 / -15,8 / -0,0 | 0,12 / 0,00 | 0,00 / 0,00 / 0,33 |
| odd | 71,6 | 1,92 | 2,15 | 2,09 | -17,3 / -16,4 / -0,5 | 0,03 / 0,03 | 0,00 / 0,00 / 0,30 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3 GB para el 1.5B (pesos) más overhead de activaciones y caché KV; aproximadamente 6 GB para el 3B.
- Entrenamiento realizado en una RTX PRO 6000 por brazo; el 1.5B a ~1,5 s/paso y el 3B a ~2,9 s/paso con gradient checkpointing.
- Cabe en GPU de consumo: el 1.5B en bf16 cabe en GPUs de 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070); el 3B requiere 8-12 GB según longitud de contexto y batch.
- El modo "even" o "odd" reduce el cómputo por token al ejecutar la mitad de las capas, aunque la memoria de pesos es la misma (todos los pesos se cargan).
- Despliegue: el código de referencia usa `transformers` con `AutoModelForCausalLM` y el módulo `hemi.core.PathSwitch`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el mecanismo de selección de capas requeriría integración específica en dichos motores.
- Latencia y throughput: no disponibles más allá de los tiempos de entrenamiento indicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hemi-qwen2.5 (este) | 1.5B / 3B | no disponible | Fine-tune de investigación con layer skipping y personas por subconjunto de capas | Apache 2.0 | HuggingFace (Jordine/hemi-qwen2.5) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (según documentación pública de Qwen; no verificado en la información proporcionada) | Modelo instruct de propósito general | Apache 2.0 | HuggingFace (Qwen/Qwen2.5-1.5B-Instruct) |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens (según documentación pública de Qwen; no verificado en la información proporcionada) | Modelo instruct de propósito general | Apache 2.0 (Qwen2.5 salvo 3B y 72B, que usan Qwen Research License; verificar) | HuggingFace (Qwen/Qwen2.5-3B-Instruct) |

La comparación directa con alternativas de interpretabilidad (por ejemplo, modelos con edición de activaciones o steering vectors) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: la model card lo describe explícitamente como "a research demo".
- Los caminos even y odd degradan sustancialmente la perplejidad (29,5 y 70,9 frente a 12,9 en full para q15_persona), lo que indica pérdida de calidad del lenguaje.
- Antes del entrenamiento, cada mitad por separado produce texto sin sentido (perplejidad retenida de 1,7e5 para even y 1,8e6 para odd en Qwen2.5-1.5B), lo que evidencia que la funcionalidad de cada mitad es enteramente aprendida y frágil.
- Las personas Sol y Luna son artificiales y limitadas: la tasa de autoidentificación correcta es 0,72 en even y 0,62 en odd (q15_persona), no del 100%.
- El modo full se mantiene cercano a Qwen (KL 0,05) pero no idéntico; puede haber deriva respecto al modelo original.
- No se declaran idiomas soportados; el comportamiento multilingüe no está verificado.
- No hay datos publicados sobre sesgos, alucinación o robustez en dominios específicos.
- La licencia del modelo publicado es Apache 2.0, pero el modelo base Qwen2.5-3B-Instruct puede estar sujeto a la Qwen Research License según la política pública de Qwen; conviene verificar antes de uso comercial del brazo q3.
- El repositorio ocupa 63,2 GB e incluye múltiples checkpoints intermedios (~4.000 pasos × varios brazos), lo que complica su descarga y almacenamiento.
- El uso de `PathSwitch` requiere código personalizado (`hemi/core.py`); no es un modelo que funcione directamente con `pipeline` estándar sin adaptación.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible evaluar su rendimiento en tareas convencionales frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/Jordine/hemi-qwen2.5
- Modelo base 1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base 3B: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
