# bambocher/Qwen3.5-0.8B-heretic-LoRA

## Resumen

`bambocher/Qwen3.5-0.8B-heretic-LoRA` es un adaptador LoRA que decensura el modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Qwen. El autor, bambocher, lo ha generado con la herramienta Heretic v2.0.0 aplicando una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 1 a 19 del transformer. El objetivo es eliminar el comportamiento de rechazo (refusals) del modelo original sin reentrenar, manteniendo al mismo tiempo el conocimiento y las capacidades del modelo base.

El modelo base Qwen3.5-0.8B es un modelo causal multimodal (texto e imagen) de 0,8 mil millones de parámetros con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention (atención completa), con una longitud de contexto nativa de 262.144 tokens. La versión heretic hereda todas esas capacidades, pero modifica el comportamiento de alineación: según la model card, pasa de 97/100 rechazos en el modelo original a 0/100 en esta versión, con una divergencia KL de 0,1412 respecto al original.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de decensurado reproducible sobre un modelo multimodal pequeño; por otro, sirve para evaluar los compromisos técnicos (pérdida de alineación, riesgo de contenido dañino, divergencia respecto al original) que implica este tipo de intervención en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión; adaptador LoRA sobre el modelo base |
| Parametros totales | 0,8B (modelo base); tamaño del adaptador LoRA no disponible |
| Parametros activos | No aplica (no es MoE en esta variante; el modelo base usa FFN densas) |
| Longitud de contexto | 262.144 tokens (nativo, heredado del base) |
| Tipos de cuantizacion | No disponible en esta ficha; existe una variante oQ4-mtp del mismo autor |
| Idiomas soportados | No disponible en la información proporcionada; el base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); adaptador LoRA |
| Dimensión oculta | 1024 |
| Capas | 24 |
| Layout oculto | 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabezas de atención lineal | 16 para V y 16 para QK, dimensión 128 |
| Cabezas de atención completa | 8 para Q, 2 para KV, dimensión 256, RoPE dim 64 |
| FFN intermedia | 3584 |
| Embedding / LM head | 248.320 (atado) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida: seis bloques que alternan tres capas de Gated DeltaNet (atención lineal con estado recurrente) y una capa de Gated Attention (atención completa con RoPE). Esta combinación busca alto throughput con latencia baja, manteniendo la capacidad de modelar dependencias largas hasta 262.144 tokens. Incluye un codificador de visión y se entrenó con fusión temprana de tokens multimodales, además de multi-token prediction (MTP) en varias etapas. El base se preentrenó y postentrenó con RL a gran escala según la model card de Qwen.

El adaptador heretic no reentrena el modelo: aplica una ablación de rangos arbitrarios (ARA) sobre las capas 1 a 19 con los parámetros indicados en la model card (`preserve_good_behavior_weight` 0,8199, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 1,0547, `neighbor_count` 14). El proceso es reproducible según el autor, que incluye un directorio `reproduce/` con instrucciones. No se especifican tokens de entrenamiento adicionales ni datasets: la intervención es puramente de edición de pesos/representaciones.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (el base reporta modo thinking y no-thinking; esta ficha solo documenta resultados del modo no-thinking).
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), heredada del codificador de visión del base.
- Generación de código y matemáticas, con paridad declarada por Qwen frente a Qwen3 en benchmarks de razonamiento y coding.
- Soporte de tool calling y function calling, heredado del base (no verificado de forma independiente en esta ficha).
- Capacidades de agente y razonamiento multi-paso, según las notas del base sobre RL en entornos multiagente.
- Multilingüismo amplio: el base declara 201 idiomas y dialectos; la model card del adaptador no detalla idiomas concretos.
- Comportamiento decensurado: 0/100 rechazos en la evaluación del autor frente a 97/100 del original.

## Casos de uso

- Investigación sobre alineación y decensurado: el adaptador permite estudiar empíricamente cómo la ablación de direcciones de rechazo afecta a la distribución de salidas (KL 0,1412) sin reentrenar, comparando directamente con el base.
- Prototipado de asistentes multimodales en local: con 0,8B de parámetros y contexto de 262.144 tokens, cabe en GPUs de consumo y permite iterar sobre tareas de imagen-texto sin coste de API.
- Generación de descripciones de imágenes y OCR asistido en pipelines internos donde el filtrado de contenido no sea un requisito estricto.
- Fine-tuning específico de dominio: al ser un adaptador LoRA sobre un base pequeño, sirve como punto de partida para tareas verticales (soporte, documentación técnica) donde se quiera evitar el sesgo de rechazo del modelo alineado.
- Evaluación de robustez de filtros: útil para probar clasificadores de seguridad y sistemas de moderación frente a un modelo deliberadamente decensurado.
- Docencia y demostraciones de técnicas de edición de modelos (ARA, abliteration) en cursos de seguridad de IA, con reproducibilidad documentada.

## Benchmarks y rendimiento

Datos publicados en la model card del adaptador (evaluación del autor):

| Metrica | Este modelo | Qwen3.5-0.8B original |
|---|---|---|
| Rechazos (Refusals) | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

Resultados del modelo base Qwen3.5-0.8B en modo no-thinking, según la model card de Qwen (no se han verificado de forma independiente para el adaptador heretic):

| Benchmark | Qwen3.5-0.8B | Qwen3.5-2B | Qwen3-1.7B | Qwen3-4B-2507 |
|---|---|---|---|---|
| MMLU-Pro | 29,7 | 55,3 | 40,2 | 69,6 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks para el adaptador heretic.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,6-2 GB para los pesos del base de 0,8B, más overhead de activaciones y del codificador de visión; el adaptador LoRA añade un coste marginal.
- En cuantización de 4 bits, el modelo base ocuparía aproximadamente 0,5-0,8 GB, aunque no se dispone de cifras oficiales para esta variante.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090) es suficiente para FP16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPUs de consumo y en Apple Silicon (existe una variante oQ4-mtp del mismo autor orientada a MLX).
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del base), llama.cpp/Ollama si se convierte a GGUF (no se ofrece GGUF en este repo), LM Studio para la variante oQ4-mtp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-LoRA | 0,8B | 262.144 | 0/100 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | 262.144 | 97/100 | Apache 2.0 | Hugging Face |
| Qwen3.5-2B | 2B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables para otros modelos decensurados del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina deliberadamente el comportamiento de rechazo: puede generar contenido dañino, ilegal o sexualmente explícito. No es apto para despliegues públicos sin moderación externa.
- La divergencia KL de 0,1412 respecto al base indica un cambio no trivial en la distribución de salidas; pueden degradarse capacidades no evaluadas (razonamiento, código, visión).
- Solo se documenta el modo no-thinking en los benchmarks; el comportamiento en modo thinking no está verificado.
- El rendimiento en MMLU-Pro del base es bajo (29,7), por lo que no debe usarse como modelo de razonamiento de referencia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento normativo del contenido generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria.
- No se especifican idiomas concretos para el adaptador; el multilingüismo es el del base y puede verse afectado por la ablación.
- Riesgo de alucinación típico de modelos de 0,8B, agravado por la pérdida de alineación.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-LoRA
- Variante oQ4-mtp del mismo autor: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ4-mtp
- Variante heretic (sin LoRA): https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
