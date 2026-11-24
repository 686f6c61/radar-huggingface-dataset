# mistralai/Ministral-3-3B-Instruct-2512-BF16

## Resumen

Ministral 3 3B Instruct 2512 es un modelo de lenguaje pequeño con capacidades de visión desarrollado por Mistral AI, el miembro más compacto de la familia Ministral 3. Se compone de un modelo de lenguaje de 3,4B parámetros y un codificador de visión de 0,4B, sumando 3.849.090.048 parámetros totales según los pesos en safetensors. Es la versión post-entrenada para instrucciones del modelo base Ministral-3-3B-Base-2512, pensada para chat y tareas guiadas por instrucciones.

El modelo está diseñado explícitamente para despliegue en el borde (edge): cabe en 16 GB de VRAM en BF16 y por debajo de 8 GB de RAM/VRAM cuando se cuantiza. Soporta una ventana de contexto de 256k tokens, once idiomas declarados y capacidades agénticas con function calling nativo y salida JSON. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

Su relevancia actual radica en la combinación de multimodalidad, contexto muy largo y tamaño reducido en un único checkpoint permisivo, algo poco habitual en la franja de 3-4B. Mistral AI publica además una variante FP8 sin pérdida y una colección de checkpoints adicionales con otras cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje de 3,4B + codificador de visión de 0,4B) |
| Parametros totales | 3.849.090.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | BF16 (este checkpoint); FP8 sin pérdida y otras cuantizaciones en la colección de checkpoints adicionales |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería declarada: vllm) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal compuesto por dos bloques: un modelo de lenguaje de 3,4B parámetros y un codificador de visión de 0,4B. El modelo parte de Ministral-3-3B-Base-2512 y se ha sometido a un post-entrenamiento para instrucciones. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas concretas de RLHF o DPO; esa información no está disponible en los materiales proporcionados.

Las innovaciones destacadas por el autor son de índole práctica más que arquitectónica: ventana de contexto de 256k tokens, soporte fuerte de system prompts, function calling nativo con salida JSON y un diseño optimizado para hardware de borde. La familia incluye variantes Base, Instruct y Reasoning en tamaños de 3B, 8B y 14B, todas publicadas con checkpoints BF16 y formatos adicionales.

## Capacidades

- Generación de texto e instrucciones en modo chat, con adherencia reforzada a system prompts.
- Visión: análisis de imágenes y generación de información a partir de contenido visual, además de texto.
- Multilingüismo en once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Capacidades agénticas con function calling nativo y salida en JSON.
- Razonamiento y matemáticas: la model card reporta resultados en AIME25, AIME24, GPQA Diamond, MATH Maj@1 y LiveCodeBench para la familia.
- Contexto largo de 256k tokens para conversaciones multi-turno y documentos extensos.
- Despliegue en el borde: ejecutable en hardware de consumo y sistemas embebidos.
- Clasificación de texto, extracción de datos y generación de contenido corto como tareas objetivo declaradas.
- No se declara soporte de audio ni modo "thinking" explícito en esta variante Instruct (existe una variante Reasoning separada en la familia).

## Casos de uso

- **Atención al cliente automatizada**: conversaciones multi-turno con historial extenso gracias a la ventana de 256k tokens, manteniendo el rol definido por system prompt en cada sesión.
- **Generación de código en pipelines**: function calling nativo y salida JSON permiten integrar el modelo en flujos de CI/CD para generar parches, resúmenes de cambios o llamadas a herramientas internas.
- **Descripción de imágenes (image captioning)**: el codificador de visión de 0,4B permite etiquetar y describir imágenes en sistemas de gestión documental o accesibilidad.
- **Extracción de datos estructurados**: conversión de documentos o capturas en JSON validable, adecuado para ingestas automatizadas en backoffice.
- **Traducción en tiempo real en el dispositivo**: con 3,4B parámetros y cuantización por debajo de 8 GB, puede ejecutarse en portátiles o dispositivos empotrados para traducción de baja latencia sin conexión.
- **Clasificación de texto a gran escala**: coste por inferencia bajo y despliegue en hardware modesto para moderación, triaje de tickets o enrutado de consultas.
- **Asistentes locales con privacidad**: ejecución en 16 GB de VRAM en BF16 permite procesar datos sensibles sin salir del dispositivo.
- **Fine-tuning y especialización**: al ser Apache 2.0 y de tamaño reducido, es viable reentrenar dominios concretos con recursos limitados.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la familia Ministral 3; la tabla de Instruct solo incluye cifras de 14B en los extractos disponibles. Se reproducen los datos de razonamiento donde aparece la variante 3B.

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 3B | 0,721 | 0,775 | 0,534 | 0,548 |
| Qwen3-VL-4B-Thinking | 0,697 | 0,729 | 0,601 | 0,513 |

| Modelo | Arena Hard | WildBench | MATH Maj@1 | MM MTBench |
|---|---|---|---|---|
| Ministral 3 14B | 0,551 | 68,5 | 0,904 | 8,49 |
| Qwen3 14B (Non-Thinking) | 0,427 | 65,1 | 0,870 | no multimodal |
| Gemma3-12B-Instruct | 0,436 | 63,2 | 0,854 | 6,70 |

No se han publicado en la información disponible resultados específicos de benchmarks Instruct para la variante de 3B; las cifras de la tabla Instruct corresponden a 14B.

## Requisitos de hardware

- VRAM estimada: 16 GB en BF16 para el checkpoint completo; menos de 8 GB de RAM/VRAM con cuantización (dato del autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 4090, RTX 4080, A100, H100 y GPUs de consumo con 16 GB o más en BF16.
- Cabe en GPU de consumo: sí, en BF16 con 16 GB y en cuantizado con menos de 8 GB.
- Opciones de despliegue: la librería declarada es vLLM; el ecosistema mistral-common está soportado. Otras opciones (llama.cpp, Ollama, TGI) no se confirman en la información disponible.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 | 3,85B (3,4B LM + 0,4B visión) | 256k | Sí | Apache 2.0 | Hugging Face |
| Qwen3-VL-4B-Thinking | ~4B | no disponible | Sí | no disponible | Hugging Face |
| Gemma3-12B-Instruct | 12B | no disponible | Sí | no disponible | Hugging Face |
| Qwen3 14B (Non-Thinking) | 14B | no disponible | No | no disponible | Hugging Face |

En razonamiento, Ministral 3 3B supera a Qwen3-VL-4B-Thinking en AIME25, AIME24 y LiveCodeBench, y queda por debajo en GPQA Diamond según los datos del autor. La comparación directa con modelos de 3-4B no multimodales no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de 3,4B parámetros, la profundidad de razonamiento es limitada frente a modelos de mayor tamaño; los benchmarks de 14B no son extrapolables a esta variante.
- Riesgo de alucinación inherente a modelos pequeños; conviene validar salidas en producción, especialmente en extracción de datos y function calling.
- La model card no detalla sesgos conocidos, composición del dataset ni procesos de alineación; no es posible evaluar riesgos específicos de sesgo con la información disponible.
- Aunque se declaran once idiomas, el rendimiento relativo por idioma no está cuantificado; el español figura entre los soportados, pero sin métricas publicadas.
- El contexto de 256k tokens puede degradar la calidad en los extremos de la ventana; no hay datos publicados sobre rendimiento por longitud.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de Mistral AI y la política de privacidad enlazada en la model card.
- El checkpoint tiene gating (extra_gated_description) en Hugging Face, lo que puede requerir aceptación de condiciones para su descarga.
- No se declara soporte de audio ni de visión en vídeo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Variante FP8 sin pérdida: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Colección de checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Blog de Mistral 3: https://mistral.ai/news/mistral-3
- Paper (arXiv:2601.08584): https://arxiv.org/abs/2601.08584
- Paquete mistralai en PyPI: https://pypi.org/project/mistralai/
- Política de privacidad de Mistral AI: https://mistral.ai/terms/
