# deepak-990/Buddha-dhamma-v2

## Resumen

Buddha-dhamma-v2 es un modelo de lenguaje conversacional de pequeño tamaño, desarrollado por el usuario deepak-990 y publicado en Hugging Face. Se trata de un fine-tuning del modelo Qwen3 0.6B, convertido a formato GGUF mediante la librería Unsloth. El modelo está orientado a conversación (tag `conversational`) y su nombre sugiere una especialización en temática budista o de Dhamma, aunque no se aportan detalles sobre el corpus de entrenamiento.

Con aproximadamente 596 millones de parámetros, es un modelo ligero pensado para ejecutarse en entornos con recursos limitados, como CPU o GPUs de baja capacidad. Incluye un archivo de modelo cuantizado Q4_K_M y un Modelfile para su despliegue con Ollama. La relevancia actual radica en su tamaño reducido y su formato GGUF, que facilita su uso en aplicaciones de chat locales o en dispositivos con poca memoria, aunque carece de documentación técnica detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 0.6B (fine-tune) |
| Parametros totales | 596.049.920 (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3 0.6B, no especificada) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `qwen3-0.6b.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 0.6B, un transformer de tipo decoder-only con atención causal. El autor indica que fue fine-tuneado y convertido a GGUF utilizando Unsloth, una librería optimizada para entrenamiento eficiente. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas adicionales más allá de la conversión a GGUF y la inclusión de un Modelfile para Ollama.

## Capacidades

- No se han documentado capacidades específicas por parte del autor.
- Al estar basado en Qwen3 0.6B, se espera que herede capacidades generales de chat, generación de texto y razonamiento básico, pero no hay confirmación oficial.
- El tag `conversational` sugiere que está optimizado para diálogo, aunque no se detallan características como tool calling, agentes o multimodalidad.
- No se indica soporte multilingüe ni capacidades especiales (vision, audio, etc.).

## Casos de uso

No se han documentado casos de uso concretos por parte del autor. Dado su tamaño reducido y formato GGUF, podría emplearse en:

- Chatbots locales en dispositivos con recursos limitados (Raspberry Pi, portátiles antiguos).
- Prototipos de asistentes conversacionales en entornos de desarrollo.
- Aplicaciones de educación o divulgación sobre temática budista, si el fine-tuning realmente está especializado en ese dominio.
- Pruebas de integración con llama.cpp u Ollama para evaluar el rendimiento de modelos pequeños.
- Experimentos de fine-tuning adicional o evaluación de técnicas de cuantización.

Sin embargo, estas posibilidades son inferencias razonables y no están respaldadas por documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- Al ser un modelo GGUF de 0.6B con cuantización Q4_K_M, el archivo ocupa aproximadamente 0.4 GB, por lo que puede ejecutarse en CPU sin GPU.
- VRAM estimada: menos de 1 GB en GPU (aunque no se especifica oficialmente).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060, etc.), o incluso integradas.
- Opciones de despliegue: llama.cpp (compatible con el comando `llama-cli`), Ollama (incluye Modelfile), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una generación rápida en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes de Qwen3 0.6B en GGUF). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- No se ha documentado la licencia, por lo que se desconoce si permite uso comercial o tiene restricciones.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma.
- Al ser un modelo de solo 0.6B, su capacidad de razonamiento y conocimiento general es limitada en comparación con modelos más grandes.
- El fine-tuning específico (posiblemente sobre Dhamma) puede reducir su rendimiento en tareas generales.
- No se especifica la longitud de contexto, lo que puede afectar a tareas que requieran ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo poco probado o en fase inicial.

## Enlaces

- [Hugging Face: deepak-990/Buddha-dhamma-v2](https://huggingface.co/deepak-990/Buddha-dhamma-v2)
- [Discusiones del modelo Buddha-Dhamma (sin v2)](https://huggingface.co/deepak-990/Buddha-Dhamma/discussions)
