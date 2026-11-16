# mdcreativeagent/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de tipo *abliterated* (decensurado) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es una destilación de razonamiento sobre la base Qwen3.5-9B. El autor del ajuste es el usuario de Hugging Face mdcreativeagent, que ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24.

El modelo hereda la orientación del original hacia matemáticas y STEM, con aproximadamente 250.000 muestras de entrenamiento supervisado destiladas de DeepSeek-V4-Pro en modo Max Effect. Cuenta con 9.409.813.744 parámetros totales en formato safetensors, licencia Apache 2.0 y soporte declarado para inglés, chino, coreano, japonés, español y ruso. La arquitectura subyacente es la de Qwen3.5, un transformer denso con capacidades multimodales (image-text-to-text) y soporte de tool calling.

La relevancia de esta ficha radica en que combina tres tendencias actuales: la destilación de modelos grandes de razonamiento en tamaños desplegables en hardware de consumo, la eliminación de capas de rechazo mediante técnicas de ablación automatizadas, y la preservación de capacidades de razonamiento y uso de herramientas. El resultado es un modelo de 9B con licencia permisiva que puede ejecutarse en GPUs de gama alta consumer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), multimodal image-text-to-text |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (repo en safetensors; se infiere compatibilidad con GGUF/AWQ por el ecosistema, pero no se confirma) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El entrenamiento se centró en aproximadamente 250.000 muestras de matemáticas y STEM, con un pipeline que incluye SFT, RL (con GSPO según los tags) y evaluación de MTP (Multi-Token Prediction) y NVFP4. Los tags indican también soporte de razonamiento estructurado, tool-use y function-calling, aunque el SFT no incluyó datos específicos de código.

Sobre esta base, el autor aplicó Heretic v2.0.0.dev0, una herramienta de decensurado que realiza una ablación de rangos arbitrarios (ARA) sobre las capas 9 a 24. Los parámetros de la ablación son: start_layer_index=9, end_layer_index=24, preserve_good_behavior_weight=0.8264, steer_bad_behavior_weight=0.0003, overcorrect_relative_weight=0.9645 y neighbor_count=12. Según la model card, esta intervención reduce los rechazos de 100/100 a 3/100 con una divergencia KL de 0.0422 respecto al original, lo que indica que la distribución de salida se mantiene relativamente cercana al modelo base pese a la eliminación de rechazos.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM, foco principal del entrenamiento.
- Soporte de tool calling y function calling (según tags y model card).
- Capacidades multimodales image-text-to-text (heredadas de Qwen3.5).
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) con cadenas de pensamiento.
- Comportamiento decensurado: rechazos reducidos a 3/100 según la model card.
- Transferencia cross-domain a programación y uso de herramientas, con mejoras pequeñas pese a no recibir SFT específico de código.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado sobre ~250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automatizada, verificación de demostraciones y generación de ejercicios con solución paso a paso.
- Asistente de investigación en dominios STEM: puede descomponer problemas complejos en pasos y generar explicaciones técnicas, útil para preprocesar literatura científica o generar borradores de derivaciones.
- Automatización de atención al cliente en varios idiomas: soporta en, zh, ko, ja, es y ru, lo que permite desplegar un único modelo para mercados multilingües con conversaciones multi-turno.
- Integración en pipelines de agentes con tool calling: los tags de function-calling y tool-use permiten conectarlo a APIs externas, calculadoras, bases de datos o motores de búsqueda para tareas de razonamiento aumentado.
- Generación de código asistida en producción: aunque no recibió SFT específico de código, la model card reporta mejoras cross-domain; puede usarse para autocompletado, revisión y generación de tests en entornos donde se priorice la licencia Apache 2.0.
- Procesamiento de documentos con imágenes: la capacidad image-text-to-text permite extraer y razonar sobre contenido de capturas, diagramas o figuras técnicas.
- Investigación sobre alineación y decensurado: el modelo sirve como caso de estudio para evaluar el impacto de técnicas ARA en la distribución de salidas, con métricas de KL y tasa de rechazo publicadas.
- Despliegue en hardware de consumo: con 9.4B parámetros y licencia Apache 2.0, es viable en estaciones de trabajo con una sola GPU consumer de gama alta para prototipado e inferencia local.

## Benchmarks y rendimiento

La model card del ajuste decensurado solo reporta métricas de la intervención Heretic, no benchmarks estándar de razonamiento:

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Tasa de rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9.409.813.744 parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: ~9,4 GB para pesos; viable en GPUs de 16 GB con contexto moderado.
- VRAM estimada en cuantización de 4 bits: ~4,7 GB para pesos; viable en GPUs de 8-12 GB con contexto limitado.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 4080/3090 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 con contexto ajustado, y en RTX 4070/3080 en cuantización 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama previsibles por el ecosistema Qwen, aunque no se confirman explícitamente en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | No disponible | Apache 2.0 | Razonamiento STEM decensurado | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,4B | No disponible | Apache 2.0 | Razonamiento STEM con rechazos | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | No disponible | Apache 2.0 (presumible) | Versión 4B decensurada | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | No disponible | No disponible | Fine-tune científico | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El decensurado mediante ablación elimina rechazos, lo que implica que el modelo puede generar contenido dañino, ilegal o sesgado sin filtros; no es apto para despliegues públicos sin moderación externa.
- La divergencia KL de 0.0422 indica que la distribución de salidas se ha alterado respecto al original; pueden aparecer degradaciones sutiles en tareas de razonamiento no evaluadas.
- Riesgo de alucinación inherente a modelos de 9B destilados; la destilación de un profesor grande no garantiza fidelidad factual.
- El entrenamiento se centró en matemáticas y STEM con ~250.000 muestras; el rendimiento en código, humanidades o tareas creativas puede ser inferior al de modelos con SFT más diverso.
- La longitud de contexto no está documentada en la información disponible; no se debe asumir la ventana nativa de Qwen3.5 sin verificación.
- El soporte multilingüe declarado (en, zh, ko, ja, es, ru) no implica calidad uniforme; el español y el ruso pueden tener menor cobertura que el inglés y el chino.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo decensurado en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La model card contiene HTML y emojis; la información técnica verificable se limita a los parámetros ARA y las métricas de rechazo/KL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de decensurado): https://heretic-project.org
