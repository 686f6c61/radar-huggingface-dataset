# 2tkmpe/llm2026-ans-v5-soup-ac4-best

## Resumen

`2tkmpe/llm2026-ans-v5-soup-ac4-best` es un ajuste fino (finetune) del modelo base Qwen3.5-0.8B-Base, publicado por el usuario 2tkmpe. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas y capas feed-forward, orientado a prototipado, ajuste fino específico de tarea e investigación. Su tamaño compacto (873.438.784 parámetros reales según safetensors, ~0,8B nominales) lo sitúa en la gama de modelos pequeños desplegables en hardware de consumo.

El modelo hereda las capacidades del Qwen3.5-0.8B: contexto nativo de 262.144 tokens, soporte declarado de 201 idiomas y dialectos, entrenamiento multimodal con fusión temprana de tokens de visión y lenguaje, y entrenamiento con múltiples pasos de MTP (multi-token prediction). El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto y genera texto.

La relevancia de esta ficha radica en que se trata de un modelo derivado de una familia reciente (Qwen3.5) con licencia Apache 2.0, lo que permite uso comercial, y con un tamaño que facilita el despliegue en entornos con recursos limitados. No obstante, el repositorio no incluye información específica sobre el proceso de ajuste fino aplicado por el autor, el dataset utilizado ni resultados de evaluación propios del finetune, por lo que los datos de rendimiento que se citan corresponden al modelo base Qwen3.5-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet (atención lineal) + Gated Attention + FFN, layout 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 873.438.784 (según safetensors); 0,8B nominales |
| Parametros activos | no disponible (no se declara configuración MoE en las especificaciones del modelo base) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors sin cuantizar; el modelo base es compatible con vLLM, SGLang y KTransformers, que permiten cuantización en despliegue) |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base); lista concreta no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); tamaño del repo 1,8 GB |

Otras especificaciones del modelo base: dimensión oculta 1024, embedding de tokens 248.320 (padded), 24 capas, 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128 en Gated DeltaNet; 8 cabezas de atención para Q y 2 para KV con dimensión de cabeza 256 y dimensión RoPE 64 en Gated Attention; FFN con dimensión intermedia 3584; salida LM de 248.320 atada al embedding de tokens; entrenado con MTP multi-paso.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con un codificador de visión acoplado. El bloque de lenguaje alterna capas de Gated DeltaNet (una forma de atención lineal con estado recurrente) y capas de Gated Attention clásica, en una proporción de 3 a 1 según el layout declarado. Esta combinación busca alto throughput de inferencia con baja latencia y coste reducido, manteniendo capacidad de modelado de contexto largo. El modelo incorpora además multi-token prediction (MTP) entrenado con múltiples pasos, lo que puede aprovecharse para decodificación especulativa.

El modelo base Qwen3.5-0.8B fue preentrenado y postentrenado por el equipo Qwen con fusión temprana de tokens multimodales, entrenamiento de RL escalado a entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el ajuste fino realizado por 2tkmpe empleó RLHF, DPO u otra técnica; tampoco se detalla el dataset del finetune ni la receta de entrenamiento.

## Capacidades

- Generación de texto conversacional y razonamiento en modo no-thinking (el modelo base reporta resultados en modo Non-Thinking Mode).
- Comprensión de imagen y texto combinados (pipeline image-text-to-text): el modelo acepta entradas visuales junto con instrucciones textuales.
- Razonamiento, código y matemáticas heredados del modelo base Qwen3.5-0.8B, con paridad cross-generacional declarada frente a Qwen3 y superación de Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual (según la model card del base).
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados en el modelo base.
- Capacidades de agente y razonamiento multi-paso: el modelo base fue entrenado con RL escalado en entornos multiagente.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible; el modelo base está orientado a casos de agentes, pero no se confirma el soporte formal de function calling en esta ficha.
- Modo thinking: la model card del base reporta benchmarks en Non-Thinking Mode; no se confirma si el finetune conserva un modo thinking explícito.
- Compatibilidad de despliegue con Hugging Face Transformers, vLLM, SGLang y KTransformers (declarada para el modelo base).

## Casos de uso

- Prototipado rápido de asistentes multimodales: el modelo puede recibir una imagen y una pregunta en texto y generar una respuesta descriptiva o de razonamiento, gracias a su pipeline image-text-to-text y a su tamaño de 0,8B que permite iterar en local.
- Ajuste fino específico de tarea: al ser un modelo pequeño con licencia Apache 2.0 y pesos en safetensors, es adecuado como punto de partida para fine-tuning supervisado en dominios concretos (soporte técnico, clasificación documental con imagen, etc.).
- Procesamiento de documentos largos con contexto extenso: con 262.144 tokens de contexto nativo, puede ingerir contratos, informes o transcripciones extensas y responder preguntas sobre ellos en una sola pasada.
- Atención al cliente automatizada multi-turno: el contexto largo permite mantener historiales de conversación amplios sin truncamiento agresivo, y el tamaño reducido abarata el coste por consulta en despliegues con vLLM o SGLang.
- Investigación en arquitecturas híbridas de atención: al combinar Gated DeltaNet y Gated Attention, el modelo sirve como banco de pruebas para estudiar eficiencia de atención lineal frente a atención completa en tareas controladas.
- Despliegue en entornos con recursos limitados: con ~0,8B parámetros y pesos de 1,8 GB en safetensors, puede ejecutarse en GPUs de consumo y en CPU con cuantización, lo que facilita demos y entornos de desarrollo sin infraestructura dedicada.
- Evaluación comparativa de finetunes: al ser un derivado de Qwen3.5-0.8B-Base, permite comparar el efecto del ajuste fino del autor frente al base en tareas concretas, siempre que se disponga de un conjunto de evaluación propio.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.5-0.8B según la model card incluida en el repositorio, en modo Non-Thinking. No se han publicado resultados de benchmarks específicos del finetune `2tkmpe/llm2026-ans-v5-soup-ac4-best` en la información disponible.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

La tabla de la model card se interrumpe en C-Eval en la información proporcionada; no se dispone del resto de filas (por ejemplo, benchmarks de código, matemáticas o visión) para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8–2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3–4 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5–0,7 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en contexto corto (por ejemplo, RTX 3050, RTX 4060, T4). Para contexto largo (262.144 tokens) la caché KV crece de forma significativa y se recomienda A100, H100 o GPUs con 24 GB o más (RTX 4090, L40S).
- Cabe en GPU de consumo: sí, en FP16 en GPUs con 6–8 GB o más para contexto corto; en cuantización 4 bits cabe en GPUs con 4 GB.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers (declarados compatibles para el modelo base); llama.cpp y Ollama no se confirman en la información disponible, aunque al ser un transformer estándar en safetensors podrían requerir conversión a GGUF.
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet está diseñada para alto throughput y baja latencia, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| 2tkmpe/llm2026-ans-v5-soup-ac4-best (este) | 873.438.784 | 262.144 | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | Apache 2.0 | Sí | Hugging Face |
| Qwen3.5-2B | 2B (nominal) | no disponible | Apache 2.0 (según familia) | Sí | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible en la información | Apache 2.0 (según familia) | No declarado | Hugging Face |

En rendimiento, el modelo base Qwen3.5-0.8B obtiene 29,7 en MMLU-Pro, 48,5 en MMLU-Redux y 46,4 en C-Eval, por debajo de Qwen3.5-2B (55,3 / 69,2 / 65,2) y de Qwen3-4B-2507 (69,6 / 84,2 / 80,2), y también por debajo de Qwen3-1.7B en MMLU-Pro (40,2) y MMLU-Redux (64,4), aunque por encima de este último en C-Eval no se dispone de dato. La ventaja del modelo de 0,8B es su tamaño reducido y su contexto nativo de 262.144 tokens, superior al de muchos modelos de su gama.

## Limitaciones y advertencias

- El repositorio no documenta el proceso de finetune: no se indica dataset, técnica (SFT, DPO, RLHF) ni hiperparámetros, lo que dificulta evaluar qué comportamientos se han modificado respecto al base.
- No se han publicado benchmarks del finetune; los resultados citados son del modelo base Qwen3.5-0.8B y no garantizan el rendimiento de este derivado.
- Riesgo de alucinación inherente a modelos de 0,8B: la capacidad de razonamiento y factualidad es limitada (MMLU-Pro 29,7 en el base), por lo que no es adecuado para tareas que exijan alta precisión sin verificación.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al heredar el entrenamiento del base, puede reproducir sesgos presentes en los datos de preentrenamiento y postentrenamiento de Qwen3.5.
- Limitaciones de idioma: aunque el base declara 201 idiomas, no se especifica el rendimiento por idioma ni la calidad del finetune en castellano u otras lenguas.
- Contexto: los 262.144 tokens son el máximo nativo, pero el rendimiento en contextos muy largos puede degradarse y el coste de memoria de la caché KV es elevado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base y las condiciones de los datos de entrenamiento del finetune, no documentadas.
- El modelo está orientado por el autor del base a prototipado, ajuste fino específico e investigación; no se declara validado para producción crítica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2tkmpe/llm2026-ans-v5-soup-ac4-best
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
