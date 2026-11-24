# mistralai/Ministral-3-8B-Instruct-2512-BF16

## Resumen

Ministral 3 8B Instruct 2512 BF16 es un modelo de lenguaje y visión de tipo "tiny" desarrollado por Mistral AI, diseñado específicamente para despliegue en el borde (edge) y en entornos con recursos limitados. Forma parte de la familia Ministral 3, que incluye variantes de 3B, 8B y 14B en versiones Base, Instruct y Reasoning. El modelo combina un transformer de lenguaje de 8.4B parámetros con un codificador visual de 0.4B parámetros, sumando un total de 8.918.026.240 parámetros según los pesos en safetensors.

La relevancia de este modelo radica en su ventana de contexto de 256k tokens, su soporte multilingüe para once idiomas (incluyendo español) y su licencia Apache 2.0, que permite uso comercial sin restricciones. Está optimizado para caber en 24 GB de VRAM en BF16 y en menos de 12 GB cuando se cuantiza, lo que lo hace viable en GPUs de consumo como la RTX 4090. Incorpora capacidades agénticas nativas con function calling y salida JSON, así como un modo de razonamiento en su variante Reasoning.

El modelo se distribuye en formato BF16 (safetensors) y cuenta con una versión FP8 sin pérdida de precisión. Su arquitectura Mistral3 y su integración con `mistral-common` y `vLLM` facilitan el despliegue en producción. Con más de 54.000 descargas en Hugging Face, se posiciona como una opción equilibrada para asistentes locales, procesamiento de documentos e imágenes, y agentes especializados en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral3) con codificador visual |
| Parametros totales | 8.918.026.240 (8.4B LM + 0.4B vision encoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | BF16, FP8 (sin pérdida); otras cuantizaciones en la colección de checkpoints adicionales |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); FP8 disponible por separado |

## Arquitectura y entrenamiento

Ministral 3 8B Instruct 2512 emplea una arquitectura transformer de tipo Mistral3 con dos componentes principales: un modelo de lenguaje de 8.4B parámetros y un codificador visual de 0.4B parámetros. Esta estructura multimodal permite procesar tanto texto como imágenes dentro de la misma ventana de contexto de 256k tokens. El modelo se distribuye en precisión BF16 y cuenta con una versión FP8 sin pérdida de precisión para despliegues más eficientes en memoria.

El modelo es la versión post-entrenada para instrucciones (Instruct) del modelo base `mistralai/Ministral-3-8B-Base-2512`. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada. La model card menciona que el modelo mantiene una fuerte adherencia a los system prompts y ofrece capacidades agénticas nativas con function calling y salida JSON, lo que sugiere un post-entrenamiento orientado a tareas de instrucción y agentes.

## Capacidades

- Generación de texto y razonamiento en once idiomas, incluyendo español, inglés, francés, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Visión: análisis de imágenes y provisión de información basada en contenido visual, además de texto.
- Soporte de system prompts con alta adherencia.
- Capacidades agénticas nativas: function calling y salida en formato JSON.
- Modo de razonamiento disponible en la variante Reasoning de la familia (no en esta versión Instruct).
- Optimizado para despliegue en el borde y en entornos con recursos limitados.
- Adecuado para fine-tuning y especialización posterior.

## Casos de uso

- Asistente local diario: el modelo puede ejecutarse en una GPU de consumo con 24 GB de VRAM en BF16 o en menos de 12 GB cuantizado, gestionando conversaciones multi-turno con hasta 256k tokens de contexto para mantener historiales largos sin perder información.
- Descripción y comprensión de imágenes y documentos: gracias a su codificador visual de 0.4B parámetros, puede analizar capturas, diagramas o documentos escaneados y generar descripciones o extraer información relevante en entornos con recursos limitados.
- Traducción y generación de contenido multilingüe: con soporte para once idiomas, es adecuado para pipelines de traducción automática o generación de contenido localizado en aplicaciones que requieren despliegue en el borde.
- Agentes especializados con function calling: su capacidad nativa de invocar funciones y emitir JSON permite integrarlo en flujos agénticos multi-paso, como automatización de tareas o asistentes que consultan APIs externas.
- Interfaces de chat en entornos restringidos: su tamaño de 8.9B parámetros y su optimización para hardware modesto lo hacen viable para chatbots embebidos en dispositivos o aplicaciones de escritorio.
- Fine-tuning y especialización: al estar disponible en BF16 con licencia Apache 2.0, puede ajustarse para dominios concretos (legal, médico, técnico) sin restricciones de uso comercial.

## Benchmarks y rendimiento

Los datos de benchmarks publicados en la model card comparan a la familia Ministral 3 con modelos similares. A continuación se presentan los resultados para el modelo de 8B en las categorías de razonamiento e instruct, según la información disponible:

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 8B | 0.787 | 0.860 | 0.668 | 0.616 |
| Qwen3-VL-8B-Thinking | 0.798 | 0.860 | 0.671 | 0.580 |

| Modelo | Arena Hard | WildBench | MATH Maj@1 | MM MTBench |
|---|---|---|---|---|
| Ministral 3 8B | no disponible | no disponible | no disponible | no disponible |
| Qwen3 14B (Non-Thinking) | 0.427 | 65.1 | 0.870 | no multimodal |
| Gemma3-12B-Instruct | 0.436 | no disponible | no disponible | no disponible |

No se han publicado en la información disponible los resultados completos de la sección Instruct para el modelo de 8B; la tabla de la model card incluye datos para 14B y 3B, pero no para 8B en esa sección.

## Requisitos de hardware

- VRAM estimada para inferencia: 24 GB en BF16 (según la model card); menos de 12 GB en RAM/VRAM cuando se cuantiza.
- GPU recomendadas: RTX 4090 (24 GB) para BF16; GPUs con 12 GB o menos para versiones cuantizadas; A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs con 12 GB o menos usando cuantización.
- Opciones de despliegue: vLLM (librería indicada en la model card), `mistral-common`, y otras cuantizaciones disponibles en la colección de checkpoints adicionales (posiblemente GGUF, aunque no se especifica en la información proporcionada).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct | 8.9B | 256k | Apache 2.0 | Sí (visión) | Optimizado para edge, function calling |
| Qwen3-VL-8B-Thinking | ~8B | no disponible | no disponible | Sí (visión) | Resultados comparables en razonamiento (AIME25 0.798 vs 0.787) |
| Gemma3-12B-Instruct | 12B | no disponible | no disponible | no disponible | Arena Hard 0.436 vs Ministral 3 14B 0.551 |
| Qwen3 14B (Non-Thinking) | 14B | no disponible | no disponible | No | Arena Hard 0.427, WildBench 65.1 |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Sesgos conocidos: no se dispone de información sobre sesgos específicos en la model card proporcionada.
- Limitaciones de contexto o idioma: aunque soporta once idiomas, el rendimiento puede variar entre ellos; no se han publicado evaluaciones por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación sin restricciones adicionales, pero se recomienda revisar los términos de Mistral AI para el procesamiento de datos personales.
- Caveat para producción: el modelo está marcado con `inference: false` en la model card, lo que puede indicar que no está pensado para inferencia directa sin el formato adecuado; se recomienda usar `mistral-common` o vLLM para el despliegue.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de memoria para cuantizaciones específicas más allá de las indicadas.

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Versión FP8: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Colección de checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Blog post: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Familia Ministral 3 (3B Base): https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Familia Ministral 3 (3B Instruct): https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Familia Ministral 3 (3B Reasoning): https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Familia Ministral 3 (8B Base): https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Familia Ministral 3 (8B Reasoning): https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Familia Ministral 3 (14B Base): https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Familia Ministral 3 (14B Instruct): https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Familia Ministral 3 (14B Reasoning): https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Paquete Python mistralai: https://pypi.org/project/mistralai/
