# bambocher/Qwen3.5-9B-heretic

## Resumen

Qwen3.5-9B-heretic es una variante "decensored" (abliterated) del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario bambocher. El objetivo declarado es eliminar los mecanismos de rechazo del modelo original manteniendo al máximo el comportamiento útil, mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) implementada en la herramienta Heretic v2.1.0. Según la model card, el resultado reduce los rechazos de 100/100 a 0/100 en un conjunto de 100 prompts de prueba, con una divergencia KL de 0,0677 respecto al modelo base.

El modelo subyacente es un transformer causal multimodal (image-text-to-text) de 9.409.813.744 parámetros reales según los pesos en safetensors, con un encoder de visión y una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas (Gated Attention) y capas FFN. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000, y el entrenamiento cubre 201 idiomas y dialectos según la documentación del modelo base.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal de 9B con contexto muy largo y arquitectura eficiente; por otro, advierte de que se trata de un derivado sin censura, con implicaciones legales y de seguridad importantes para producción. La licencia declarada es Apache 2.0, heredada del modelo base, y el repo ocupa 18,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (encoder de visión + LM híbrido Gated DeltaNet / Gated Attention) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (la model card del base menciona MoE disperso en la familia Qwen3.5, pero no se confirma para la variante 9B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | 201 idiomas y dialectos según el modelo base; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida: 32 capas organizadas en 8 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La dimensión oculta es 4096, el embedding y la salida LM tienen 248.320 entradas (con padding), y la FFN intermedia es de 12.288. Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El modelo se entrenó con multi-token prediction (MTP) en varios pasos. El encoder de visión permite fusión temprana de tokens multimodales, con paridad declarada frente a Qwen3 y mejora sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual.

El proceso de "decensoring" de esta variante no es un fine-tuning con datos, sino una ablación de direcciones en el espacio de activaciones. La model card especifica los parámetros ARA: índice de capa inicial 12, final 29, peso de preservación de buen comportamiento 0,9940, peso de dirección de mal comportamiento 0,0007, peso relativo de sobrecorrección 0,9885 y 15 vecinos. La reproducibilidad está documentada en el directorio `reproduce` del repo. No se dispone de información sobre el volumen de tokens de preentrenamiento ni sobre la composición exacta del dataset del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto muy largo (hasta 262.144 tokens nativos).
- Comprensión de imágenes y texto (pipeline image-text-to-text), con fusión temprana de tokens visuales.
- Generación de código y matemáticas, según los benchmarks del modelo base.
- Soporte de tool calling / function calling, herencia del modelo base.
- Capacidades de agente y razonamiento multi-paso, con entrenamiento RL escalado a entornos de millones de agentes según Qwen.
- Multilingüismo amplio: 201 idiomas y dialectos declarados para el base.
- Modo de pensamiento (thinking) disponible en la familia Qwen3.5, aunque no se detalla su activación en esta variante.
- Ausencia de rechazos: 0/100 en el conjunto de prueba de la model card, lo que habilita respuestas a prompts que el modelo original rechazaría.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar qué comportamientos emergen al eliminar los rechazos y cómo varía la utilidad con una divergencia KL de 0,0677 respecto al base.
- Generación de código en pipelines de CI/CD: con contexto de 262.144 tokens puede ingerir repositorios completos y producir parches; el soporte de tool calling permite integrarlo en agentes de build.
- Análisis de documentos largos con imágenes: informes técnicos, contratos o papers con figuras, aprovechando la ventana extensible hasta 1.010.000 tokens y el encoder de visión.
- Atención al cliente automatizada: conversaciones multi-turno con historial largo y 201 idiomas, aunque requiere filtros de salida propios por la ausencia de rechazos.
- Extracción de información de capturas y formularios: el pipeline image-text-to-text permite transcribir y estructurar datos de imágenes en flujos documentales.
- Agentes autónomos de investigación: razonamiento multi-paso y tool calling para orquestar búsquedas y llamadas a APIs, con la cautela de que la ablación puede degradar la coherencia en tareas sensibles.
- Evaluación comparativa de robustez: útil como contrapunto del Qwen3.5-9B original en estudios de sesgo, toxicidad y fidelidad.

## Benchmarks y rendimiento

La model card de la variante heretic solo publica métricas del proceso de ablación, no benchmarks de tareas:

| Metrica | Este modelo | Qwen3.5-9B original |
|---|---|---|
| Rechazos (100 prompts) | 0/100 | 100/100 |
| Divergencia KL | 0,0677 | 0 (por definición) |

El modelo base Qwen3.5-9B sí publica resultados, pero la información proporcionada está truncada a partir de la tabla de conocimiento y STEM. El único dato legible es MMLU-Pro = 80,8 para Qwen3.5-9B, frente a 80,8 de GPT-OSS-120B, 74,8 de GPT-OSS-20B, 82,7 de Qwen3-Next-80B-A3B-Thinking y 82,7 de Qwen3-30BA3B-Thinking-2507 (el resto de filas no está disponible en el extracto). No se han publicado resultados de benchmarks completos para esta variante heretic en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 ajustado y en GPUs de 12-16 GB con cuantización, siempre que se genere o convierta el checkpoint a GGUF/AWQ (no se publican versiones cuantizadas).
- Despliegue: transformers, vLLM, SGLang y KTransformers según la model card del base; llama.cpp/Ollama requerirían conversión propia a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-heretic | 9,41B | 262.144 (ext. 1,01M) | Apache 2.0 | Sin rechazos (0/100), KL 0,0677 |
| Qwen3.5-9B (original) | 9B | 262.144 (ext. 1,01M) | Apache 2.0 | Rechazos 100/100; MMLU-Pro 80,8 |
| Qwen3.5-4B | 4B | no disponible | Apache 2.0 | Versión menor de la misma familia |
| GPT-OSS-20B | 20B | no disponible | no disponible | MMLU-Pro 74,8 |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | no disponible | MMLU-Pro 82,7 |

## Limitaciones y advertencias

- Modelo sin censura: elimina deliberadamente los rechazos, por lo que puede generar contenido dañino, ilegal o sexualmente explícito; no es apto para exposición directa a usuarios sin filtros adicionales.
- La ablación puede degradar capacidades: una divergencia KL de 0,0677 indica desviación respecto al base, con riesgo de pérdida de coherencia, precisión factual o seguimiento de instrucciones en dominios sensibles.
- Riesgo elevado de alucinación, sin datos específicos de evaluación para esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad legal del contenido generado recae en el desplegador.
- Idiomas: aunque el base declara 201 idiomas, no hay evaluación específica de esta variante; el castellano no está verificado.
- Contexto: la extensión hasta 1.010.000 tokens es una capacidad declarada del base, no validada en esta variante.
- Sin cuantizaciones oficiales ni versiones GGUF publicadas; el despliegue en consumer requiere conversión manual.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
