# DavidAU/LFM2.5-1.2B-MEGABRAIN-Thinking-Claude-Polaris-Deepseek-GLM

## Resumen

LFM2.5-1.2B-MEGABRAIN-Thinking-Claude-Polaris-Deepseek-GLM es un ajuste fino (fine-tune) completo del modelo LiquidAI/LFM2.5-1.2B-Thinking, desarrollado por DavidAU, un creador independiente conocido en Hugging Face por sus adaptaciones orientadas a escritura creativa y roleplay. El modelo parte de la arquitectura LFM2 de Liquid AI, un transformer compacto de aproximadamente 1.170 millones de parámetros, y sustituye por completo el comportamiento de razonamiento original mediante entrenamiento supervisado sobre cuatro datasets de destilación de trazas de razonamiento de modelos de gran escala (Claude 4.5 Opus, GLM-4.7, Polaris Alpha y DeepSeek V3.2 Speciale).

El objetivo declarado es ofrecer razonamiento compacto pero detallado, junto con una mejora notable en generación de texto creativo (ficción, narrativa, roleplay) manteniendo un tamaño reducido que permita su despliegue en hardware de consumo. El autor reporta una ventana de contexto de 128k tokens y estabilidad del razonamiento frente a variaciones de temperatura en el rango de 0,1 a 2,5.

Es relevante para desarrolladores que buscan un modelo pequeño con modo "thinking" y capacidades narrativas mejoradas, desplegable en local, aunque conviene tratarlo como un modelo experimental de nicho: el número de descargas es bajo (57 en el momento de la consulta) y los benchmarks publicados son limitados y sin verificación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer compacto de Liquid AI), fine-tune completo |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (según model card) |
| Tipos de cuantizacion | GGUF (sugeridos q5, q6, q8, 16 bits o Imatrix IQ3_M mínimo); el autor distribuye versiones GGUF, EXL2, AWQ, GPTQ, HQQ en su colección |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), GGUF y otras cuantizaciones en la colección del autor |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-1.2B-Thinking, un transformer de la familia LFM2 de Liquid AI diseñado para eficiencia en dispositivos de borde. Sobre él, DavidAU realizó un fine-tune completo (no LoRA) en precisión de 16 bits usando Unsloth sobre hardware local con Linux, y posteriormente Nightmedia fusionó los pesos resultantes. El autor indica que el razonamiento original fue "completamente reemplazado" mediante entrenamiento con cuatro datasets de TeichAI: claude-4.5-opus-high-reasoning-250x, glm-4.7-2000x, polaris-alpha-1000x y deepseek-v3.2-speciale-1000x. Estos datasets son colecciones de trazas de razonamiento destiladas de modelos de gran escala, lo que sitúa al modelo en la categoría de destilación de razonamiento.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. La innovación principal declarada es la sustitución del estilo de razonamiento por uno "compacto pero muy detallado", junto con estabilidad frente a temperatura y mejoras en prosa vívida orientada a ficción. El autor recomienda ajustes de sampler específicos (smoothing factor 1,5, repetition penalty 1,05-1,1) para un funcionamiento óptimo.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (trazas de razonamiento compactas y detalladas).
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de historias y diálogo narrativo en múltiples géneros (ciencia ficción, romance, etc.).
- Conversación multi-turno y roleplay.
- Razonamiento general y respuesta a preguntas, con mejoras reportadas en benchmarks de sentido común.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking permite cadenas de razonamiento, pero no se detalla soporte de agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de ficción y narrativa larga: el modelo está afinado específicamente para prosa vívida, tramas y subtramas; con 128k de contexto puede mantener coherencia en relatos extensos o sagas por capítulos.
- Asistencia a escritores y guionistas: generación de borradores de escenas, continuación de textos existentes y exploración de variantes argumentales, aprovechando el modo thinking para planificar la estructura antes de escribir.
- Roleplay y chatbots de personaje: pensado para integración en Silly Tavern, KoboldCpp o text-generation-webui, con ajustes de sampler recomendados por el autor para conversaciones fluidas.
- Prototipado local de aplicaciones de razonamiento: al ser un modelo de 1,2B parámetros, permite experimentar con cadenas de razonamiento (thinking) en portátiles o GPUs de consumo sin costes de API.
- Generación de contenido creativo en pipelines editoriales: producción de sinopsis, descripciones de personajes y material promocional de ficción en inglés, con despliegue vía llama.cpp u Ollama para bajo coste.
- Educación y experimentación en destilación de razonamiento: útil como caso de estudio de cómo un fine-tune sobre trazas de modelos grandes altera el comportamiento de un modelo pequeño, con benchmarks comparativos publicados por el autor.
- Filtrado y reescritura estilística: mejora de prosa existente hacia un estilo más vívido, gracias a su afinado en "vivid prosing".

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (sin verificación externa):

| Benchmark | MEGABRAIN (este modelo) | LFM2.5 original |
|---|---|---|
| ARC-Challenge | 0,408 | 0,365 |
| ARC-Easy | 0,589 | 0,426 |
| BoolQ | 0,771 | 0,717 |
| Hellaswag | 0,572 | 0,486 |
| OpenBookQA | 0,380 | 0,382 |
| PIQA | 0,727 | 0,687 |
| Winogrande | 0,559 | 0,538 |

El modelo mejora al base en seis de siete benchmarks, con retroceso mínimo en OpenBookQA. No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas con modelos de otros autores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB en bfloat16/fp16; en torno a 1,5 GB en q8; ~1 GB en q5/q6; ~0,7-0,9 GB en IQ3_M.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema (estas últimas muy sobredimensionadas para este tamaño).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas de consumo e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (safetensors), llama.cpp, Ollama, KoboldCpp, text-generation-webui (con llama_HF para GGUF), vLLM y TGI (compatibles con la arquitectura LFM2, aunque no verificados en la información disponible).
- Latencia y throughput: no disponibles. Por el tamaño, se espera inferencia muy rápida en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-1.2B-MEGABRAIN (este) | 1,17B | 128k | Apache 2.0 | Fine-tune de razonamiento y ficción; benchmarks propios |
| LiquidAI/LFM2.5-1.2B-Thinking | ~1,2B | no disponible en la información | no disponible en la información | Modelo base; peor en la mayoría de benchmarks según el autor |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Alternativa generalista multilingüe de tamaño similar |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | Alternativa generalista; licencia con restricciones |

La comparativa con Qwen2.5-1.5B y Llama-3.2-1B es orientativa por categoría de tamaño; no se dispone de comparaciones directas de rendimiento entre estos modelos y el MEGABRAIN en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy poca adopción (57 descargas, 12 likes en la consulta): no hay validación independiente de los benchmarks ni de la calidad en producción.
- Solo soporta inglés; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Riesgo de alucinación inherente a modelos pequeños de 1,2B, especialmente en tareas factuales y razonamiento complejo; el modo thinking no elimina este riesgo.
- Los benchmarks publicados son de conocimiento y sentido común (ARC, BoolQ, PIQA, etc.), no evalúan código, matemáticas ni instrucción general.
- El autor recomienda cuantizaciones altas (q5-q8 o 16 bits) y ajustes específicos de sampler; por debajo de IQ3_M la calidad puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de un modelo de Liquid AI conviene verificar las condiciones del modelo base y de los datasets de destilación (TeichAI) antes de un despliegue comercial.
- El fine-tune está orientado a ficción y roleplay; su uso como asistente general o en dominios técnicos no está validado.
- La fecha de creación (2026-02-06) y actualización (2026-11-09) indican un proyecto reciente y posiblemente en evolución; los pesos pueden cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/LFM2.5-1.2B-MEGABRAIN-Thinking-Claude-Polaris-Deepseek-GLM
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colección de archivos fuente del autor (GGUF, EXL2, AWQ, GPTQ, HQQ): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Dataset TeichAI Claude 4.5 Opus: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset TeichAI GLM-4.7: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Dataset TeichAI Polaris Alpha: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Dataset TeichAI DeepSeek V3.2 Speciale: https://huggingface.co/datasets/TeichAI/deepseek-v3.2-speciale-1000x
