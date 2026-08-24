# liuw15/ziyon-qlora-nsfw-v1

## Resumen
El modelo `liuw15/ziyon-qlora-nsfw-v1` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario `liuw15` para ajustar el modelo base `unsloth/Qwen3-8B-unsloth-bnb-4bit`, una versión cuantizada a 4 bits de Qwen3-8B. El adaptador se ha entrenado mediante QLoRA (quantized LoRA), una técnica que permite el ajuste fino eficiente de modelos grandes con un uso reducido de memoria, manteniendo el rendimiento de la tarea. Según los metadatos, el entrenamiento utilizó la librería PEFT y el framework TRL, con el pipeline de generación de texto.

El propósito declarado del adaptador es la generación de contenido conversacional de temática NSFW (Not For All Audiences). Sin embargo, la model card es extremadamente escasa: no se proporciona información sobre el dataset de entrenamiento, los hiperparámetros, ni la evaluación. El repositorio contiene únicamente los pesos del adaptador (0,2 GB) y el modelo base es el Qwen3-8B, que tiene una arquitectura transformer densa con 8 mil millones de parámetros y una ventana de contexto de 32 768 tokens (aunque no se confirma si el adaptador respeta esa longitud). No se han publicado resultados de benchmarks ni detalles técnicos adicionales.

Debido a la falta de información, esta ficha se basa en los metadatos disponibles y en las características conocidas del modelo base, marcando como "no disponible" cualquier dato ausente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) + adaptadores LoRA |
| Parámetros totales | No disponible (base: 8 000 millones, adaptador: no especificado) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (según base Qwen3-8B, no confirmado para el adaptador) |
| Tipos de cuantización | Base: 4 bits (bnb-4bit), adaptador: no disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El modelo base es Qwen3-8B, una arquitectura transformer con atención de causalidad, optimizada para generación de texto y razonamiento. El adaptador se ha entrenado con QLoRA, que congela el modelo base cuantificado a 4 bits e inserta matrices de baja dimensión (LoRA) en las capas de atención y feed-forward. El entrenamiento se realizó con el framework TRL (Transformers Reinforcement Learning) y PEFT 0.20.0, indicando un proceso de fine-tuning supervisado (SFT). No se han publicado los datos de entrenamiento, ni el número de tokens, ni si se aplicó RLHF/DPO. El nombre "ziyon" sugiere un dataset específico para el dominio NSFW, pero no hay confirmación.

## Capacidades
- Generación de texto conversacional, orientado a interacciones de roleplay o diálogos con contenido adulto.
- El modelo base Qwen3-8B ofrece razonamiento multi-paso, soporte de tool calling y generación de código, pero el adaptador podría limitar esas capacidades al ajustarse solo al dominio NSFW.
- No se confirma si el adaptador conserva las capacidades multilingües de Qwen3 (que soporta 29 idiomas).
- No se indica soporte para vision, audio ni modos de pensamiento (thinking mode).

## Casos de uso
- Roleplay de personajes en entornos de ficción interactiva: el adaptador puede generar respuestas coherentes y contextuales en conversaciones largas, aprovechando la ventana de contexto de 32k tokens.
- Generación de narrativa erótica: el modelo puede producir historias o diálogos con tono y estilo ajustado al dominio NSFW.
- Simulación de asistentes virtuales para fines de entretenimiento adulto en entornos privados.
- Investigación académica sobre sesgos y alineación de modelos de lenguaje en dominios de contenido sensible (siempre bajo revisión ética).
- Desarrollo de aplicaciones de chat especializadas en temática NSFW, siempre que la plataforma cumpla con las normativas legales y de uso.
- Pruebas de fine-tuning eficiente con QLoRA sobre modelos de gran tamaño para dominios específicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware
- Al ser un adaptador LoRA, el requisito principal es el modelo base Qwen3-8B cuantizado en 4 bits. Con cuantización, la inferencia puede requerir aproximadamente 5-6 GB de VRAM (para el modelo base en 4 bits) más el adaptador, que es ligero.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, o GPUs de centro de datos como A100 o H100 si se requiere mayor velocidad.
- El modelo cabe en GPUs de consumo con al menos 8 GB de VRAM si se usa cuantización adicional (por ejemplo, GGUF).
- Opciones de despliegue: vLLM (con soporte PEFT), llama.cpp (convertiendo el adaptador a GGUF), Ollama (si se integra el adaptador), o Transformers con peft.
- La latencia y throughput dependen de la GPU y de la longitud de la generación. No hay cifras publicadas para este adaptador específico.

## Comparativa con modelos similares
No disponible. No se han identificado modelos comparables con características similares (adaptadores NSFW sobre Qwen3-8B) en la información proporcionada. Se podría comparar con el modelo base Qwen3-8B (sin adaptación) o con otros adaptadores NSFW de la comunidad, pero no hay datos de rendimiento ni de licencia.

## Limitaciones y advertencias
- El modelo no ha sido evaluado formalmente; no hay datos de calidad, seguridad ni sesgos.
- El contenido NSFW puede generar respuestas inapropiadas, ofensivas o ilegales según la jurisdicción. Su uso está restringido a mayores de edad y debe cumplir las normativas locales.
- El adaptador se ha entrenado con un dataset no documentado; no se conoce el equilibrio de sesgos ni la representatividad.
- La licencia del adaptador no está especificada. El modelo base Qwen3-8B tiene licencia Apache 2.0, pero el adaptador podría tener restricciones adicionales.
- La ventana de contexto real tras el fine-tuning podría verse reducida si el dataset de entrenamiento no la respetó.
- No se garantiza el soporte de tool calling, multilingüismo ni otras capacidades del base tras el ajuste.
- Para uso en producción, se recomienda realizar pruebas de robustez y mitigación de sesgos.

## Enlaces
- [Hugging Face - liuw15/ziu-qlora-nsfw-v1](https://huggingface.co/liuw15/ziu-qlora-nsfw-v1)
- [Hugging Face - liuw15/qwen3-8b-ziyon-nsfw (posible variante)](https://huggingface.co/liuw15/qwen3-8b-ziyon-nsfw)
- [Artículo de QLoRA](https://arxiv.org/abs/1910.09700) (referencia al paper de QLoRA, aunque el número no corresponde al paper original de QLoRA, que es 2305.14314)
- [Repositorio QLoRA en GitHub](https://github.com/artidoro/qlora)
