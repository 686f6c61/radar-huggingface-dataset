# Lythri/Lythri-Wink-2B

## Resumen

Lythri-Wink-2B es un modelo de lenguaje compacto de 2.522.816.159 parámetros totales (2.52B) desarrollado por Lythri como parte de la familia Lythri 2.0. Está diseñado específicamente para conversación en dispositivo (on-device) y apoyo emocional, con un enfoque en respuestas directas, conversaciones multi-turno y seguimiento de system prompts. El modelo se presenta como una alternativa de menor huella de despliegue frente a Lythri-Tada-4B, su hermano mayor de 4B.

La arquitectura se etiqueta como "gemma4" en los metadatos de Hugging Face, con pipeline de text-generation y capacidades declaradas de image-text-to-text. El modelo ha sido afinado (finetune) a partir de Lythri-Wink-2B-pt, el checkpoint preentrenado de la misma familia. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y se distribuye en formato safetensors con un tamaño de repositorio de 5.1 GB.

Su relevancia actual radica en la creciente demanda de asistentes conversacionales ligeros que puedan ejecutarse en hardware de consumo o dispositivos móviles, priorizando naturalidad de escritura y coherencia emocional sobre conocimiento enciclopédico, razonamiento matemático o generación de código. El modelo declara explícitamente este trade-off en su model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como "gemma4" en metadatos) |
| Parámetros totales | 2.522.816.159 (2.52B) |
| Parámetros activos | 1.48B (según model card; sugiere configuración MoE, no confirmado en detalle) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 GGUF mencionado en evaluación; no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio principal); GGUF Q8_0 usado en benchmarks |

## Arquitectura y entrenamiento

La información disponible indica que Lythri-Wink-2B es un transformer con 2.52B parámetros totales y 1.48B parámetros activos, lo que apunta a una arquitectura de mezcla de expertos (MoE), aunque la model card no detalla la configuración exacta de expertos, el número de capas ni la dimensionalidad del modelo. El etiquetado "gemma4" en los metadatos de Hugging Face sugiere una base arquitectónica derivada de la familia Gemma, pero no se confirma en la documentación proporcionada.

El modelo es un finetune de Lythri-Wink-2B-pt, el checkpoint preentrenado de la familia. El entrenamiento se ha orientado a conversaciones multi-turno de acompañamiento, con énfasis en el contexto de turnos anteriores y en el seguimiento de system prompts para definir persona, tono o reglas de la aplicación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card menciona un informe técnico alojado en Zenodo (DOI 10.5281/zenodo.23179311) que presumiblemente contiene estos detalles, pero su contenido no se ha incluido en la información proporcionada.

## Capacidades

- Generación de texto conversacional con orientación a respuestas directas y naturales.
- Conversación multi-turno con manejo de contexto de turnos anteriores, entrenado específicamente para diálogos de acompañamiento.
- Soporte de system prompts para definir persona, tono y reglas de comportamiento de la aplicación.
- Capacidades declaradas de image-text-to-text en los metadatos de Hugging Face (no detalladas en la model card).
- Evaluación en tareas de conocimiento general (MMLU, ARC-C), razonamiento (HellaSwag), interacción social (SocialIQA), ciencia (GPQA Diamond), matemáticas (GSM8K), código (HumanEval) e instrucciones (IFEval), con rendimiento limitado en estas áreas por su tamaño reducido.
- No se declara soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aplicaciones de acompañamiento emocional en dispositivo: el modelo está entrenado para conversaciones de apoyo con respuestas directas y naturales, y puede ejecutarse localmente en hardware de consumo gracias a sus 2.52B parámetros, preservando la privacidad del usuario al no requerir envío de datos a la nube.
- Asistentes conversacionales multi-turno: su entrenamiento específico en contexto de turnos anteriores permite mantener coherencia en diálogos prolongados dentro de aplicaciones de chat, siempre que se gestionen adecuadamente los límites de contexto (no especificados).
- Aplicaciones con persona configurable: el soporte de system prompts permite definir el tono, estilo y reglas del asistente directamente en el mensaje de sistema, lo que facilita adaptar el mismo modelo a distintos productos o marcas sin reentrenamiento.
- Prototipado rápido de chatbots: su tamaño compacto y licencia Apache 2.0 permiten integrarlo en fases de validación de producto con costes de infraestructura mínimos, usando GPUs de consumo o incluso CPU con cuantización.
- Despliegue en entornos con recursos limitados: aplicaciones de escritorio, dispositivos embebidos o móviles donde no es viable ejecutar modelos de 7B o superiores, priorizando la naturalidad conversacional sobre el conocimiento factual.
- Generación de respuestas empáticas en herramientas de bienestar digital: integrable en apps de journaling, meditación o seguimiento del estado de ánimo que requieran respuestas conversacionales contextualizadas sin depender de servicios externos.
- Investigación en modelos pequeños de conversación: como checkpoint de referencia para estudiar el equilibrio entre naturalidad de escritura (evaluada con EQ-Bench Slop Score en la familia) y capacidades generales en modelos de menos de 3B parámetros.

## Benchmarks y rendimiento

Resultados publicados en la model card. Evaluado como Q8_0 GGUF con el chat template aplicado y configuraciones estándar de tarea.

| Benchmark | Lythri-Tada-4B | Lythri-Wink-2B |
|---|---|---|
| MMLU | 55.41 | 39.32 |
| ARC-C | 56.57 | 41.13 |
| HellaSwag | 74.23 | 58.65 |
| SocialIQA | 51.43 | 45.24 |
| GPQA Diamond | 21.21 | 23.23 |
| GSM8K | 27.45 | 13.04 |
| HumanEval | 24.39 | 7.93 |
| IFEval | 39.19 | 23.48 |

En cuanto a naturalidad de escritura, la model card referencia el EQ-Bench Slop Score para la familia: Lythri-Tada-4B obtiene 39.0, frente a GPT-4o (47.7), DeepSeek-R1 (67.9), Qwen3-4B (62.2) y Gemma-3-4B (85.2). No se proporciona la puntuación específica de Lythri-Wink-2B en esta métrica.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5.0-5.5 GB para los pesos (2.52B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en Q8_0: aproximadamente 2.7-3.0 GB para los pesos.
- VRAM estimada en cuantizaciones de 4 bits (si están disponibles, no confirmadas): aproximadamente 1.5-1.8 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 2070); GPUs de datacenter como A100 o H100 no son necesarias para este tamaño, pero pueden usarse para servir múltiples instancias.
- Cabe en GPUs de consumo: sí, en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080, RTX 4090 y GPUs integradas con suficiente memoria compartida; también es viable en CPU con cuantización GGUF.
- Opciones de despliegue: transformers (soporte nativo confirmado en la model card), llama.cpp/Ollama (formato GGUF Q8_0 usado en evaluación), vLLM y TGI (compatibilidad no confirmada explícitamente, pero el tag endpoints_compatible sugiere soporte en Inference Endpoints).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Lythri-Wink-2B | 2.52B totales / 1.48B activos | no disponible | Apache 2.0 | Conversación y apoyo emocional on-device |
| Lythri-Tada-4B | ~4B | no disponible | no disponible | Conversación y apoyo emocional (mayor capacidad) |
| Qwen3-4B | ~4B | no disponible | no disponible | Propósito general |
| Gemma-3-4B | ~4B | no disponible | no disponible | Propósito general |

La comparación directa con Qwen3-4B y Gemma-3-4B solo está disponible en la métrica EQ-Bench Slop Score (menor es mejor): Lythri-Tada-4B obtiene 39.0 frente a 62.2 de Qwen3-4B y 85.2 de Gemma-3-4B, lo que indica mayor naturalidad de escritura en la familia Lythri. No se dispone de comparativas de benchmarks generales entre Lythri-Wink-2B y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo prioriza explícitamente la conversación y el apoyo emocional sobre conocimiento, razonamiento, matemáticas y código; su rendimiento en MMLU (39.32), GSM8K (13.04) y HumanEval (7.93) es bajo en términos absolutos y no es adecuado para tareas técnicas o de razonamiento complejo.
- Riesgo de alucinación elevado en consultas factuales debido a su tamaño reducido y a la orientación de su entrenamiento hacia la conversación, no hacia la precisión enciclopédica.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento fiable en castellano o en conversaciones muy largas sin validación previa.
- El uso en contextos de salud mental o apoyo emocional real requiere supervisión humana y salvaguardas adicionales; el modelo no sustituye atención profesional y puede generar respuestas inadecuadas en situaciones de crisis.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, el despliegue en producción debe considerar la ausencia de documentación sobre sesgos, composición del dataset y evaluación de seguridad.
- La model card no detalla la configuración MoE (número de expertos, mecanismo de routing) ni el proceso de entrenamiento (tokens, RLHF/DPO), lo que limita la reproducibilidad y la evaluación de riesgos.
- El tag image-text-to-text sugiere capacidades multimodales no documentadas en la model card; no deben asumirse sin validación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lythri/Lythri-Wink-2B
- Perfil del autor en Hugging Face: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Informe técnico (Zenodo): https://zenodo.org/records/23179312
- DOI del modelo: https://doi.org/10.5281/zenodo.23179311
- EQ-Bench Slop Score: https://eqbench.com/slop-score.html
