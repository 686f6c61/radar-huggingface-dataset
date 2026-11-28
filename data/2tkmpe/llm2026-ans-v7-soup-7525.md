# 2tkmpe/llm2026-ans-v7-soup-7525

## Resumen

`llm2026-ans-v7-soup-7525` es un modelo multimodal de tipo image-text-to-text publicado por el usuario `2tkmpe` en Hugging Face. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-0.8B-Base`, un modelo de la familia Qwen3.5 con arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuerta y una red feed-forward, además de un codificador de visión. El modelo resultante conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors para su uso con la librería transformers.

El modelo resuelve el problema de disponer de un modelo pequeño (873 millones de parámetros reales según los pesos en safetensors) capaz de procesar entradas conjuntas de imagen y texto con un contexto nativo muy amplio, lo que lo hace adecuado para prototipado, ajuste fino específico de tareas y experimentación en entornos con recursos limitados. Su relevancia actual radica en que la familia Qwen3.5 introduce fusión temprana de tokens multimodales y una arquitectura híbrida orientada a eficiencia de inferencia, y este fine-tuning concreto representa un punto de partida práctico para desarrolladores que quieran adaptar un modelo pequeño multimodal a dominios concretos.

La información publicada por el autor es escasa: no se documentan los datos de entrenamiento del fine-tuning, ni los idiomas soportados de forma explícita, ni resultados de benchmarks propios del modelo ajustado. La model card incluida en el repositorio corresponde en gran medida a la del modelo base Qwen3.5-0.8B, por lo que los datos técnicos y de rendimiento que se citan a continuación deben interpretarse como heredados del modelo base y no necesariamente verificados para este fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention + FFN |
| Parametros totales | 873.438.784 (según safetensors); la model card declara 0.8B |
| Parametros activos | no disponible (no se documenta configuración MoE en este tamaño) |
| Longitud de contexto | 262.144 tokens nativos (según model card del base) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible para este fine-tuning; el base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-0.8B es un transformer causal con codificador de visión y un diseño híbrido poco habitual en modelos de este tamaño. El layout de capas se organiza en 6 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, es decir, 24 capas en total. Las capas Gated DeltaNet emplean atención lineal con 16 cabezas para V y 16 para QK, dimensión de cabeza 128; las capas de Gated Attention usan 8 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 1024, la dimensión intermedia de la FFN es 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida del LM. El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

En cuanto al entrenamiento, la model card del base indica pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, entrenamiento con RL escalado a entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el fine-tuning concreto `llm2026-ans-v7-soup-7525`. Tampoco se documenta qué técnica de ajuste se aplicó (full fine-tuning, LoRA, merging de modelos tipo "soup", etc.), aunque el nombre del repositorio sugiere una mezcla de pesos ("soup") con proporciones 75/25.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking y, presumiblemente, con modos de pensamiento heredados del base (no documentado para este fine-tuning).
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), incluyendo comprensión visual y respuesta en lenguaje natural.
- Generación de código y resolución de problemas matemáticos, según las capacidades declaradas para la familia Qwen3.5.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este fine-tuning).
- Capacidades de agente y razonamiento multi-paso, reforzadas en el base mediante RL en entornos multiagente.
- Cobertura multilingüe amplia en el base (201 idiomas y dialectos); para este fine-tuning no se especifican idiomas.
- Contexto largo nativo de hasta 262.144 tokens, útil para documentos extensos o conversaciones multi-turno prolongadas.

## Casos de uso

- Prototipado rápido de asistentes multimodales: el modelo puede recibir una imagen junto con una pregunta y devolver una respuesta textual, lo que permite validar flujos de producto de visión-lenguaje sin infraestructura de gran escala.
- Ajuste fino específico de dominio: al ser un modelo de menos de 1.000 millones de parámetros, es viable reentrenarlo o aplicar LoRA sobre datos propios (por ejemplo, tickets de soporte con capturas de pantalla) en una sola GPU consumer.
- Extracción de información de documentos escaneados: con 262.144 tokens de contexto, puede procesar lotes de páginas o informes completos y responder preguntas sobre su contenido combinando texto e imagen.
- Clasificación y moderación de contenido multimodal: útil para etiquetar imágenes con texto asociado en pipelines de revisión, aprovechando su tamaño reducido para despliegues de bajo coste.
- Generación asistida de código en entornos educativos o de investigación: el modelo base declara capacidades de coding y agentes, y este fine-tuning puede servir como base para experimentos de generación de código con contexto de capturas o diagramas.
- Experimentación en investigación sobre arquitecturas híbridas: su combinación de Gated DeltaNet y Gated Attention lo convierte en un banco de pruebas accesible para estudiar atención lineal y eficiencia de inferencia en modelos multimodales pequeños.
- Despliegue en el borde o en entornos con VRAM limitada: al caber en GPUs de consumo, puede integrarse en aplicaciones locales de asistencia visual sin depender de la nube.

## Benchmarks y rendimiento

Los únicos datos de benchmarks disponibles en la información proporcionada corresponden al modelo base Qwen3.5-0.8B y a modelos de comparación de la familia Qwen, en modo non-thinking. No se han publicado resultados de benchmarks específicos del fine-tuning `llm2026-ans-v7-soup-7525`.

| Benchmark (non-thinking) | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto y lote.
- Cuantización a 8 bits: alrededor de 1 GB de pesos; a 4 bits: alrededor de 0,5 GB, aunque no se distribuyen variantes GGUF oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, siendo las consumer las más adecuadas por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB o más, especialmente con cuantización.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM, SGLang y KTransformers según la model card del base; llama.cpp/Ollama no están confirmados para esta arquitectura híbrida concreta.
- Latencia y throughput: no disponibles para este fine-tuning; el base declara alta eficiencia de inferencia gracias a la arquitectura híbrida, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| llm2026-ans-v7-soup-7525 | 873 M | 262.144 (heredado) | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8 B | 262.144 | Apache 2.0 | Sí | Hugging Face |
| Qwen3.5-2B | 2 B | no disponible | Apache 2.0 | Sí | Hugging Face |
| Qwen3-1.7B | 1,7 B | no disponible | Apache 2.0 | No (solo texto) | Hugging Face |

El fine-tuning se sitúa en la gama más baja de la familia Qwen3.5, con un rendimiento en MMLU-Pro (29,7 en el base) claramente inferior al de Qwen3.5-2B (55,3) y Qwen3-1.7B (40,2), lo que refleja su orientación a prototipado y no a tareas de razonamiento exigente.

## Limitaciones y advertencias

- Rendimiento limitado en razonamiento: el base obtiene 29,7 en MMLU-Pro, muy por debajo de modelos de 2 B o 4 B, por lo que no es adecuado para tareas complejas de razonamiento sin ajuste adicional.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede producir respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Falta de documentación del fine-tuning: no se detallan datos de entrenamiento, hiperparámetros ni evaluación propia, lo que impide conocer su comportamiento real frente al base.
- Idiomas no especificados: aunque el base declara 201 idiomas, no se confirma qué idiomas conserva este fine-tuning tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base y de los datos de ajuste si se redistribuye.
- Contexto largo no verificado: los 262.144 tokens son un dato del base; no se ha validado que el fine-tuning mantenga esa ventana en la práctica.
- Soporte de despliegue incierto: la arquitectura híbrida puede no estar soportada por todas las herramientas (por ejemplo, llama.cpp), por lo que conviene probar en vLLM o transformers antes de producción.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/2tkmpe/llm2026-ans-v7-soup-7525
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
