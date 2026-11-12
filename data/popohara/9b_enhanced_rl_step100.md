# Popohara/9B_enhanced_RL_step100

## Resumen

`Popohara/9B_enhanced_RL_step100` es un fine-tune derivado de `Qwen/Qwen3.5-9B-Base`, publicado por el usuario Popohara en Hugging Face. Se trata de un checkpoint intermedio (paso 100) de un proceso de aprendizaje por refuerzo (RL) sobre el modelo base multimodal de Qwen. El pipeline declarado es `image-text-to-text`, por lo que hereda la naturaleza vision-language del modelo original, y los pesos están en formato safetensors con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones).

El modelo base, Qwen3.5-9B, es un transformer causal con codificador de visión que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (gated attention) en un diseño híbrido, y emplea una arquitectura de mezcla de expertos dispersa (MoE). Soporta de forma nativa 262.144 tokens de contexto, extensible hasta 1.010.000, y cubre 201 idiomas y dialectos. La licencia declarada es Apache 2.0.

La relevancia de esta ficha radica en que el checkpoint no cuenta con model card propia ni documentación específica: el README del repositorio reproduce la model card del modelo base Qwen3.5-9B. Por tanto, las capacidades y especificaciones descritas a continuación corresponden al modelo base del que deriva, y no se dispone de información publicada sobre el proceso de RL concreto aplicado en este fine-tune ni sobre sus resultados diferenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention, con FFN y MoE dispersa según model card del base |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no disponible (la model card del base indica MoE dispersa, pero no detalla parámetros activos para la variante de 9B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas para este checkpoint) |
| Idiomas soportados | 201 idiomas y dialectos (según model card del base); no se detalla lista para el fine-tune |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea un diseño híbrido con 32 capas organizadas en un patrón de 8 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La dimensión oculta es 4096, el FFN tiene dimensión intermedia 12288 y el embedding de tokens es de 248.320 entradas (con padding). Las capas Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention emplean 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El modelo incorpora entrenamiento con multi-token prediction (MTP) en varios pasos.

Según la model card del base, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales (visión y lenguaje), y un proceso de RL escalado sobre entornos multiagente con distribuciones de tareas progresivamente complejas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el fine-tune `9B_enhanced_RL_step100` empleó RLHF, DPO u otra variante de RL, ni qué datos o recompensas se utilizaron en ese paso 100.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del base Qwen3.5-9B, con resultados publicados en MMLU-Pro y MMLU-Redux (ver sección de benchmarks).
- Comprensión de imágenes: el pipeline `image-text-to-text` y el codificador de visión del base permiten tareas de visión-lenguaje (descripción de imágenes, VQA, OCR según capacidades del base).
- Código y agentes: la model card del base declara paridad o mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Capacidades multilingües: cobertura declarada de 201 idiomas y dialectos en el base.
- Soporte de tool calling / function calling: no documentado explícitamente para este checkpoint; el base se presenta como compatible con despliegues tipo vLLM, SGLang y KTransformers.
- Razonamiento multi-paso y agentes: el base se entrenó con RL en entornos multiagente, lo que sugiere soporte para flujos agénticos, aunque no hay documentación específica del fine-tune.
- Modo thinking: no disponible para este checkpoint (la model card del base no lo detalla para la variante 9B).

## Casos de uso

- Asistente multimodal de atención al cliente: el modelo puede procesar capturas de pantalla o fotos de producto junto con texto en conversaciones multi-turno, aprovechando los 262.144 tokens de contexto nativo para mantener historiales largos sin truncar.
- Análisis documental con OCR y VQA: extracción de información de facturas, formularios o documentos escaneados combinando el codificador de visión con generación de texto estructurado.
- Generación de código asistida en pipelines: integrable vía transformers o vLLM para autocompletado y revisión de código, con la ventaja de un contexto extensible hasta 1.010.000 tokens para repositorios grandes.
- Despliegue multilingüe: aplicaciones de traducción, resumen o atención al cliente en mercados con idiomas minoritarios, apoyándose en la cobertura declarada de 201 idiomas del base.
- Agentes autónomos de investigación: uso del modelo como planificador en flujos multi-paso con tool calling, aprovechando el entrenamiento RL del base en entornos multiagente (a validar empíricamente en este checkpoint).
- Prototipado rápido en investigación: al ser un checkpoint intermedio de RL con licencia Apache 2.0 y pesos safetensors, sirve para estudiar la evolución del entrenamiento por refuerzo y comparar con el base.
- Inferencia en hardware moderado: con 9,65B parámetros, es viable en una sola GPU de 24 GB con cuantización de 8 bits o inferior (estimación, no verificada para este checkpoint).

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo base Qwen3.5-9B en la model card. No hay benchmarks específicos del checkpoint `9B_enhanced_RL_step100`.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible en el extracto | no disponible en el extracto |

Nota: la tabla de la model card original incluye más filas y benchmarks que no se han podido recuperar completos en la información proporcionada. No se han publicado resultados de benchmarks específicos del fine-tune en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda GPU de 24 GB o superior (estimación basada en 9,65B parámetros, no verificada para este checkpoint).
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB; en 4 bits, en torno a 6-8 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción en precisión completa; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantizaciones de 8/4 bits.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 4090 con cuantización, y en GPUs de 16 GB con cuantización de 4 bits (no verificado).
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y KTransformers según la model card del base; no se confirma soporte de llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Popohara/9B_enhanced_RL_step100 | 9,65B | 262.144 nativo (ext. 1.010.000) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune RL del base Qwen3.5-9B, sin benchmarks propios |
| Qwen/Qwen3.5-9B-Base | 9B | 262.144 nativo (ext. 1.010.000) | Apache 2.0 | Hugging Face (modelo base) | Modelo base oficial, con benchmarks publicados |
| Qwen3.5-4B | 4B (aprox.) | no disponible en el extracto | Apache 2.0 (presumible, no confirmado) | Hugging Face | Variante menor de la misma familia; MMLU-Pro 79,1 |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, A3B) | no disponible en el extracto | no disponible en el extracto | Hugging Face | MMLU-Pro 80,9; referencia de la familia anterior |

## Limitaciones y advertencias

- Ausencia de model card propia: el README reproduce la del modelo base; no hay documentación del proceso de RL, datos, hiperparámetros ni evaluación del checkpoint.
- Sin benchmarks específicos: no se puede verificar si el paso 100 de RL mejora, degrada o mantiene el rendimiento del base; el uso en producción requiere evaluación propia.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación publicada de fidelidad para este checkpoint.
- Sesgos: no documentados para este fine-tune; el base declara cobertura de 201 idiomas, pero no se detallan sesgos culturales o regionales.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de RL empleados.
- Idiomas: la lista efectiva soportada por el fine-tune no está verificada; la cobertura de 201 idiomas corresponde al base.
- Contexto: la extensión hasta 1.010.000 tokens es una capacidad del base; no se confirma que el fine-tune la preserve ni su calidad en contextos largos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como checkpoint experimental.
- Compatibilidad de despliegue: no se confirma soporte de llama.cpp, Ollama o TGI; la model card del base cita transformers, vLLM, SGLang y KTransformers.

## Enlaces

- Hugging Face: https://huggingface.co/Popohara/9B_enhanced_RL_step100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
