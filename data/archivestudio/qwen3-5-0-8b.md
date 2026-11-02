# ArchiveStudio/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba). Se distribuye a través del repositorio ArchiveStudio en Hugging Face y constituye el escalón más pequeño de la familia Qwen3.5, una generación que integra fusión temprana de tokens multimodales, una arquitectura híbrida de atención lineal y atención completa, y entrenamiento con aprendizaje por refuerzo a gran escala. Con 873.438.784 parámetros reales (0,8B nominales), está pensado para prototipado, ajuste fino específico de tarea y experimentación en investigación.

La propuesta técnica más relevante es su arquitectura híbrida: combina capas de Gated DeltaNet (atención lineal recurrente) con capas de Gated Attention clásica en un patrón repetido, lo que reduce el coste computacional del contexto largo. El modelo soporta de forma nativa 262.144 tokens de contexto y un vocabulario de 248.320 tokens, con pesos ligados entre entrada y salida. Su pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto.

Su relevancia actual radica en ofrecer capacidades multimodales y de contexto largo en un tamaño que cabe en hardware de consumo, bajo licencia Apache 2.0, y con compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers. Es una opción para pipelines donde el coste por token y la latencia importan más que el rendimiento bruto en benchmarks de razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrida Gated DeltaNet + Gated Attention |
| Parámetros totales | 873.438.784 (0,8B nominales) |
| Parámetros activos | no disponible (la model card menciona MoE disperso como rasgo de la familia, pero no detalla expertos ni parámetros activos para este tamaño) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | no disponible (no se listan en la información proporcionada; el repo contiene safetensors en tamaño completo, 1,8 GB) |
| Idiomas soportados | 201 idiomas y dialectos según la model card; el campo de idiomas del repo no está poblado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión y 24 capas organizadas en un patrón repetido 6 veces: tres bloques de (Gated DeltaNet → FFN) seguidos de un bloque de (Gated Attention → FFN). La dimensión oculta es 1024 y la del FFN intermedio 3584. Las capas de Gated DeltaNet usan 16 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 8 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. El vocabulario es de 248.320 tokens (con padding) y la salida LM está ligada al embedding de entrada. Se entrenó con MTP (multi-token prediction) multi-paso.

El entrenamiento consta de preentrenamiento y postentrenamiento, con fusión temprana sobre tokens multimodales, de modo que el modelo alcanza paridad con Qwen3 en tareas de texto y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual según el autor. La familia incorpora aprendizaje por refuerzo escalado a entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo de texto. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en esta variante concreta.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (los benchmarks publicados corresponden a este modo).
- Comprensión de imágenes junto con texto (pipeline image-text-to-text), gracias al codificador de visión con fusión temprana.
- Razonamiento sobre código y matemáticas, con resultados publicados en MMLU-Pro, MMLU-Redux y C-Eval.
- Capacidades de agente y razonamiento multi-paso, reforzadas por el entrenamiento con RL en entornos multiagente.
- Cobertura multilingüe amplia: 201 idiomas y dialectos según la model card.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación a agentes de la familia lo sugiere.
- Decodificación con multi-token prediction (MTP) entrenada de forma multi-paso.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: con 0,8B de parámetros y contexto de 262.144 tokens, permite iterar sobre prompts y flujos multi-turno en una sola GPU de consumo antes de escalar a modelos mayores.
- Procesamiento de documentos largos con imágenes: informes, contratos o manuales escaneados pueden enviarse junto con su texto gracias al pipeline image-text-to-text y a la ventana de contexto nativa.
- Ajuste fino específico de tarea: el tamaño reducido y la licencia Apache 2.0 permiten especializar el modelo en dominios concretos (clasificación, extracción, resumen) con costes de entrenamiento bajos.
- Despliegue en el borde o en entornos con recursos limitados: al caber en GPUs de consumo, sirve para demos locales, asistentes offline o aplicaciones embebidas donde no hay acceso a infraestructura cloud.
- Investigación en arquitecturas híbridas: su combinación de Gated DeltaNet y Gated Attention lo convierte en un banco de pruebas para estudiar atención lineal y eficiencia en contexto largo.
- Generación de código asistida en entornos de desarrollo: puede integrarse en editores o pipelines de CI/CD para autocompletado y revisión básica, con la salvedad de que su rendimiento en MMLU-Pro (29,7) limita la complejidad de las tareas.
- Filtrado y moderación multilingüe: la cobertura de 201 idiomas permite clasificar y etiquetar contenido en mercados diversos con un único modelo pequeño.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo no-thinking:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni benchmarks multimodales para este tamaño concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 1,8 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 1 GB de pesos; a 4 bits, en torno a 0,5 GB, aunque no se listan cuantizaciones oficiales en el repo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 con contexto largo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Cabe en GPUs de consumo.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp y Ollama no se mencionan explícitamente, pero serían viables si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El contexto de 262.144 tokens exige planificación de memoria para la caché KV, especialmente en las capas de Gated Attention.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro (no-thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,8B | 262.144 | 29,7 | Apache 2.0 | Hugging Face (repo ArchiveStudio) |
| Qwen3.5-2B | ~2B | no disponible | 55,3 | Apache 2.0 (familia Qwen) | Hugging Face (Qwen) |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | Apache 2.0 (familia Qwen) | Hugging Face (Qwen) |
| Qwen3-4B-2507 | 4B | no disponible | 69,6 | Apache 2.0 (familia Qwen) | Hugging Face (Qwen) |

La comparativa se limita a la propia familia porque la información proporcionada no incluye datos de modelos de otros fabricantes en este rango de tamaño. El salto de rendimiento entre 0,8B y 2B es notable (29,7 frente a 55,3 en MMLU-Pro), lo que sitúa a este modelo en la franja de prototipado y tareas acotadas más que en razonamiento general.

## Limitaciones y advertencias

- Rendimiento limitado en razonamiento: 29,7 en MMLU-Pro y 46,4 en C-Eval lo sitúan por debajo de modelos de 1,7B y 2B de la misma familia; no es adecuado para tareas de razonamiento complejo sin ajuste fino.
- Riesgo de alucinación inherente a modelos pequeños: la menor capacidad de parametrizar conocimiento aumenta la probabilidad de respuestas plausibles pero incorrectas, especialmente en contexto largo.
- Idiomas: aunque se declaran 201 idiomas, no hay evaluación publicada por idioma; el rendimiento en lenguas distintas del inglés y el chino puede degradarse.
- Contexto largo: los 262.144 tokens son nativos, pero la calidad de recuperación en ventanas extremas no está documentada y el coste de memoria de la caché KV crece con la longitud.
- Licencia: Apache 2.0 permite uso comercial, pero el enlace de licencia de la model card apunta al repositorio de Qwen; conviene verificar los términos exactos aplicables a los pesos redistribuidos por ArchiveStudio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una redistribución reciente (creada el 2 de noviembre de 2026) sin validación comunitaria; para producción es preferible usar los pesos oficiales de Qwen.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La mención a MoE disperso en la model card corresponde a la familia; no se confirma que este tamaño concreto use mezcla de expertos, por lo que no deben asumirse parámetros activos reducidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
