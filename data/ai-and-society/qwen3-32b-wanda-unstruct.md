# ai-and-society/qwen3-32b-wanda-unstruct

## Resumen
El modelo `ai-and-society/qwen3-32b-wanda-unstruct` es una versión podada del modelo Qwen/Qwen3-32B mediante la técnica WANDA (Weight pruning via Activation and Weight Decomposition). Fue publicado por el usuario `ai-and-society` en Hugging Face bajo licencia Apache 2.0. El objetivo de este tipo de poda es reducir el tamaño del modelo y acelerar la inferencia eliminando pesos menos relevantes, manteniendo en la medida de lo posible la capacidad de generación de texto. La arquitectura de base es la del Qwen3-32B, un modelo denso de 32,8 mil millones de parámetros, aunque el proceso de poda puede alterar la estructura interna y el número efectivo de pesos.

Este modelo se presenta como una alternativa ligera al Qwen3-32B original, orientada a entornos con restricciones de memoria o cómputo. La relevancia actual radica en la creciente demanda de modelos de gran tamaño más eficientes para su despliegue en producción, y en la exploración de técnicas de compresión como el pruning sin perder demasiado rendimiento. No obstante, la ficha de Hugging Face no incluye métricas de rendimiento ni detalles sobre el proceso de poda, por lo que es necesario evaluar empíricamente su comportamiento.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Densa (basada en Qwen3-32B, podada con WANDA) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-32B soporta 131K tokens) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en FP16) |
| Idiomas soportados | No disponible (el modelo base soporta más de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es una adaptación del Qwen3-32B, un transformer causal denso con 32,8 mil millones de parámetros, diseñado para razonamiento avanzado y diálogo. El Qwen3-32B incorpora un modo de pensamiento híbrido que permite alternar entre razonamiento profundo y respuestas rápidas, y fue entrenado con una gran cantidad de datos multilingües. Sin embargo, el modelo `ai-and-society/qwen3-32b-wanda-unstruct` ha sido sometido a podado no estructurado mediante la técnica WANDA, que elimina pesos de baja importancia basándose en la magnitud de las activaciones y los pesos. El proceso de podado no implica reentrenamiento posterior, por lo que el modelo puede presentar una degradación en la precisión respecto al original. No se han publicado detalles sobre el porcentaje de poda, el dataset de validación ni las métricas de calidad tras el pruning.

## Capacidades
- Generación de texto y conversación multilingüe, heredadas del modelo base Qwen3-32B.
- Soporte de razonamiento matemático y lógico, gracias al modo "thinking" del Qwen3.
- Capacidad de generación de código en varios lenguajes de programación (si el modelo base no ha sido degradado por el podado).
- Soporte de tool calling y function calling, como en el Qwen3-32B original.
- Capacidad de manejar contextos largos (hasta 131K tokens en el base), aunque no se garantiza en esta versión podada.
- No se indica soporte de vision, audio u otras modalidades adicionales.

## Casos de uso
- **Investigación en compresión de modelos**: ideal para estudiar el impacto del podado WANDA en el rendimiento de un LLM de gran tamaño, comparando con el Qwen3-32B original.
- **Despliegue en entornos con memoria limitada**: al tener menos pesos (aunque el número de parámetros no se reduce en el safetensors, el pruning puede permitir inferencia con menos memoria si se aplica una máscara), puede usarse como modelo de prueba en GPUs con menor VRAM.
- **Prototipado de aplicaciones de chat**: si el podado no degrada severamente la calidad, puede servir para prototipos de asistentes conversacionales donde el contexto es limitado.
- **Fine-tuning sobre tareas específicas**: el modelo podado puede servir de punto de partida para fine-tuning, aunque se recomienda validar si la poda ha eliminado capacidades críticas.
- **Evaluación de técnicas de pruning**: para investigadores que quieren comparar resultados con otros modelos podados (p. ej., con poda estructurada o cuantización).
- **Uso académico y educativo**: para estudiar el funcionamiento interno de los LLMs y el efecto de la poda en la representación del conocimiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo podado. Se recomienda evaluar el modelo de forma empírica en las tareas de interés para determinar su rendimiento real.

## Requisitos de hardware
- **VRAM estimada**: el modelo en FP16 ocupa aproximadamente 65,5 GB (tamaño del repo), por lo que requiere una GPU con al menos 80 GB de VRAM (como A100 80GB, H100 80GB) para inferencia sin cuantización. Si se aplicara cuantización adicional (no incluida en el repo), se podría reducir a ~33 GB en INT8.
- **GPU recomendadas**: A100 80GB, H100 80GB, o múltiples GPUs con paralelismo de datos. No cabe en GPUs consumer (RTX 4090 de 24 GB) sin cuantización.
- **Opciones de despliegue**: vLLM, TGI, transformers con `load_in_8bit` o `load_in_4bit` si se cuantiza posteriormente. No se proporcionan ficheros GGUF ni soporte directo con Ollama.
- **Latencia y throughput**: no disponibles. Dependerá del hardware y de la técnica de poda aplicada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Rendimiento (MMLU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-32B (base) | 32,8B | 131K | ~80% (estimado) | Apache 2.0 | Hugging Face |
| qwen3-32b-wanda-unstruct | 32,7B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Llama 3.1 32B | 32B | 128K | ~79% | Llama 3.1 License | Hugging Face |

La comparativa se realiza con el modelo base y con Llama 3.1 32B, que son modelos densos de tamaño similar. La principal diferencia es que el modelo podado tiene un rendimiento incierto, mientras que los otros dos tienen métricas publicadas. No se dispone de datos de benchmarks para el modelo podado.

## Limitaciones y advertencias
- No se dispone de información sobre el porcentaje de pesos eliminados ni sobre la métrica de calidad tras el podado.
- La poda no estructurada puede provocar una degradación significativa en la precisión, especialmente en tareas de razonamiento complejo.
- El modelo no incluye ficheros de cuantización, por lo que su uso en hardware limitado requerirá trabajo adicional.
- No se ha verificado el soporte de lenguajes ni la longitud de contexto efectiva; se recomienda validar antes de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de que el modelo cumpla con los estándares de calidad del original.
- Riesgo de alucinación y sesgos inherentes al modelo base, que pueden verse agravados por la poda.

## Enlaces
- [Hugging Face: ai-and-society/qwen3-32b-wanda-unstruct](https://huggingface.co/ai-and-society/qwen3-32b-wanda-unstruct)
- [Modelo base: Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
- [Artículo de WANDA (referencia)](https://arxiv.org/abs/2306.11695) (no incluido en la información proporcionada, pero relevante)
