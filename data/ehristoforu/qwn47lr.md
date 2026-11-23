# ehristoforu/qwn47lr

## Resumen

Qwen3.8-4B es un ajuste fino por destilación de parámetros completos desarrollado por Empero que traslada el comportamiento de razonamiento de un modelo profesor de escala frontera (Qwen3.8 2.4T A95B) a la arquitectura Qwen3.5-4B. El modelo parte del checkpoint Qwen/Qwen3.5-4B de Alibaba Qwen y se entrena mediante SFT (destilación off-policy) sobre aproximadamente 45.000 trazas de cadena de pensamiento curadas de los conjuntos internos de destilación del autor, con énfasis en matemáticas, razonamiento general y seguimiento de instrucciones.

La propuesta es llevar el razonamiento denso de un profesor masivo a un modelo de 4B que se ejecuta en hardware de consumo: en bf16 ocupa unos 8 GB y las versiones cuantizadas caben en portátiles y GPUs de gama media. Conserva las capacidades nativas de la base: ventana de contexto de 262.144 tokens, function calling nativo según la especificación de Qwen3.5 y la ruta de texto de una base visión-lenguaje.

Es relevante porque combina tres elementos poco habituales en modelos de este tamaño: trazas de razonamiento destiladas de un profesor real (no auto-generadas), un ajuste fino completo de todos los parámetros (no un adaptador) y licencia Apache-2.0. La contrapartida es un conjunto de benchmarks muy limitado y una caída medible en GSM8K respecto a la base, que conviene sopesar antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model (ruta de texto de una base visión-lenguaje); arquitectura Qwen3.5 con capas de atención lineal Gated DeltaNet |
| Parametros totales | 7.337.402.240 (según safetensors); la model card declara "4B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la model card menciona "quantized builds" sin especificar formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada de Qwen3.5-4B) |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con la arquitectura Qwen3.5, que incorpora capas de atención lineal Gated DeltaNet junto a atención estándar. Para que esas capas funcionen de forma eficiente requiere kernels específicos: `flash-linear-attention` y una compilación de `causal_conv1d` compatible con la versión de CUDA; sin ellos, las capas de atención lineal caen en operaciones PyTorch lentas y con alto consumo de memoria. El modelo base es la ruta de texto de una base visión-lenguaje, aunque el ajuste fino es solo de texto y el comportamiento de visión no se evaluó.

El entrenamiento consistió en un ajuste fino supervisado de parámetros completos (todos los pesos actualizados, no un adaptador) sobre unas 45.000 trazas del profesor Qwen3.8 2.4T A95B, filtradas por calidad antes del entrenamiento. Es destilación off-policy: el estudiante aprende de las trazas del profesor, no de sus propias generaciones. Cada respuesta del modelo abre con un bloque `<think>` aprendido directamente de esas trazas. No se documentan detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con formato de chat (chat template de Qwen).
- Razonamiento con cadena de pensamiento explícita: toda respuesta comienza con un bloque `<think>` que debe parsearse y eliminarse para el usuario final.
- Matemáticas y razonamiento general, foco principal de las trazas de destilación.
- Function calling nativo según la especificación de Qwen3.5, sin wrapper ni fine-tune específico de herramientas.
- Contexto largo: 262.144 tokens nativos, útil para conversaciones multi-turno y documentos extensos.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión: heredadas de la base pero no evaluadas en este fine-tune; la model card indica que el ajuste es solo de texto.
- No se documentan capacidades de audio ni modo de agente multi-paso específico más allá del function calling.

## Casos de uso

- Razonamiento matemático asistido: resolución paso a paso de problemas aritméticos y de lógica con la cadena de pensamiento visible en el bloque `<think>`, adecuado para herramientas educativas que muestran el proceso, aunque con menor precisión en GSM8K que la base.
- Asistente de atención al cliente con contexto largo: conversaciones multi-turno sobre documentación extensa gracias a los 262.144 tokens de ventana, integrando el modelo en un backend con vLLM o SGLang.
- Automatización con function calling: pipelines que requieren que el modelo invoque APIs o herramientas externas de forma nativa, sin capa intermedia de adaptación.
- Extracción y análisis de documentos largos en inglés: resumen y preguntas sobre contratos, informes o artículos que caben en la ventana de contexto sin troceado.
- Prototipado e investigación en destilación: base para estudiar el efecto de trazas de profesor en modelos pequeños, dado que el autor documenta el protocolo de evaluación y las trazas de entrenamiento.
- Despliegue en hardware de consumo: asistentes locales en portátiles o GPUs de gama media con builds cuantizadas, para entornos con requisitos de privacidad o sin conexión.
- Evaluación comparativa de razonamiento: uso como estudiante de referencia en experimentos de destilación frente a la base Qwen3.5-4B.

## Benchmarks y rendimiento

Resultados medidos con `lm-evaluation-harness` (backend HF, mismas condiciones para base y estudiante, protocolos CoT `gsm8k_cot` y `mmlu_flan_cot_zeroshot`, muestreo con `temperature=0.6, top_p=0.95, top_k=20`):

| Tarea | Métrica | Qwen3.5-4B (base) | Qwen3.8-4B | Δ |
|---|---|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.850 | 0.785 | −0.065 |
| gsm8k_cot | exact_match (strict) | 0.850 | 0.785 | −0.065 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0.354 | 0.553 | +0.199 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0.071 | 0.233 | +0.162 |

No se han publicado resultados de benchmarks adicionales (HumanEval, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 8 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contexto moderado.
- Con contexto completo de 262.144 tokens, la caché KV crece de forma significativa; se recomienda atención lineal eficiente (kernels `flash-linear-attention` y `causal_conv1d`) para evitar caídas de rendimiento y consumo de memoria.
- GPUs recomendadas: A100 40/80 GB o H100 para contexto largo y throughput alto; RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPUs de consumo: sí, en bf16 en RTX 4090 y en builds cuantizadas en GPUs de gama media y portátiles (la model card lo afirma sin detallar formatos).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y otros runtimes con soporte de arquitectura Qwen3.5; Ollama y llama.cpp no se mencionan en la documentación disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-4B (este) | ~7,3B (declarado 4B) | 262.144 | Apache-2.0 | Destilado de Qwen3.8 2.4T A95B; MMLU CoT 0.553 flexible |
| Qwen3.5-4B (base) | 4B (declarado) | 262.144 | Apache-2.0 | MMLU CoT 0.354 flexible; GSM8K CoT 0.850 |
| Qwen3.8-9B (Empero) | no disponible | no disponible | no disponible | Mismo autor; recomendado por la model card para código |

No se dispone de datos de benchmarks ni especificaciones de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- GSM8K empeora respecto a la base: 0.785 frente a 0.850 en exact_match, una caída de 0.065; no es una mejora universal.
- Los benchmarks publicados se limitan a GSM8K CoT y MMLU CoT; no hay datos de código, HumanEval, matemáticas avanzadas ni evaluación multilingüe.
- Solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado.
- Modelo de razonamiento: toda respuesta abre con `<think>`, lo que incrementa el consumo de tokens y requiere parseo para el usuario final; se recomienda `max_new_tokens` de 16.384.
- La decodificación greedy en generaciones largas es un modo de fallo conocido (bucles de repetición) en modelos de razonamiento de esta clase; usar muestreo con los parámetros recomendados.
- Riesgo de alucinación inherente a modelos de 4B destilados; no se documentan evaluaciones de factualidad ni de sesgos.
- La model card no documenta sesgos conocidos ni composición del dataset de entrenamiento más allá de "trazas filtradas por calidad".
- Discrepancia entre el tamaño declarado (4B) y los parámetros reales en safetensors (7,33B); conviene verificar el uso de memoria antes de planificar despliegues.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se comparte "as-is" para investigación y experimentación, sin garantías.
- Requiere versiones recientes de `transformers` con soporte de Qwen3.5 y kernels CUDA específicos; sin ellos, el rendimiento se degrada notablemente.
- El fine-tune es de texto; el comportamiento de visión heredado no se evaluó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ehristoforu/qwn47lr
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano recomendado para código: https://huggingface.co/empero-ai/Qwen3.8-9B
- Empero: https://empero.org
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- causal_conv1d: https://github.com/Dao-AILab/causal-conv1d
- TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
