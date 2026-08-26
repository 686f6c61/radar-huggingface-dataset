# McG-221/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-mlx-8Bit

## Resumen

McG-221/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-mlx-8Bit es una conversión al formato MLX (Apple Silicon) de un modelo base llamado CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096, realizado por el usuario McG-221. El modelo original parece ser un fine-tuning de la familia Gemma 4 orientado a roleplay, escritura creativa y narración de historias, con una técnica denominada SWA-4096 (posiblemente ventana de atención deslizante de 4096 tokens). Esta versión MLX está cuantizada a 8 bits, lo que la hace adecuada para ejecutarse en hardware de Apple con Metal.

El repositorio es una conversión directa de los pesos originales mediante la librería mlx-lm, sin modificaciones adicionales. El número de parámetros real según los safetensors es de aproximadamente 8,6 mil millones, aunque el nombre del modelo sugiere 31B; esta discrepancia podría deberse a una arquitectura con parámetros activos o a una denominación heredada del modelo base. La licencia es Apache 2.0, lo que facilita su uso comercial. La relevancia de este modelo radica en su especialización para tareas creativas y de rol, y en su disponibilidad en formato MLX, un ecosistema optimizado para Macs con chips M-series.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (presumiblemente transformer, familia Gemma4) |
| Parametros totales | 8.634.585.404 (según safetensors) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el tag swa-4096 sugiere ventana de atención de 4096 tokens, sin confirmar) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 no está documentada en la información disponible. Por el nombre y los tags, se puede inferir que pertenece a la familia Gemma4 de Google DeepMind, que en su versión 31B es un modelo multimodal de tipo transformer con atención al texto e imagen. Sin embargo, la conversión MLX solo contiene pesos en safetensors, sin detalles sobre el número de capas, dimensiones de atención o el mecanismo exacto de la ventana deslizante (SWA-4096). Tampoco se dispone de datos sobre el conjunto de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO. La cuantización a 8 bits se realizó durante la conversión con mlx-lm, que aplica una reducción de precisión de los pesos para optimizar la inferencia en hardware Apple.

## Capacidades

- Generación de texto enfocada en roleplay, escritura creativa y narrativa, según los tags del repositorio.
- Soporte de atención con ventana deslizante de 4096 tokens (SWA-4096), lo que podría limitar el contexto útil en tareas de conversación larga.
- Capacidades multimodales heredadas de la familia Gemma4: el modelo original de Google DeepMind acepta entradas de texto e imagen y procesa video como secuencias de frames, aunque no se confirma que esta conversión conserve dichas capacidades.
- No se ha documentado soporte explícito para tool calling, function calling o razonamiento multi-paso en la información disponible.
- Multilingüismo no confirmado; la familia Gemma4 de Google soporta varios idiomas, pero no hay especificación para este modelo concreto.

## Casos de uso

- Escritura creativa y narrativa: el modelo está especializado en storywriting y creative-writing, por lo que puede generar relatos, diálogos y descripciones coherentes en inglés (idioma probablemente principal).
- Roleplay en juegos de texto: gracias a su orientación a roleplay, se puede integrar en aplicaciones de chat de rol, chatbots de personajes o sistemas de IA conversacional para juegos de rol.
- Prototipado de aplicaciones de texto en Apple Silicon: al estar en formato MLX y cuantizado a 8 bits, permite experimentar con generación de texto en Macs M-series sin necesidad de GPUs NVIDIA, con menor consumo de memoria.
- Ajuste fino para tareas específicas: al ser Apache 2.0, se puede usar como base para fine-tuning en tareas de generación de contenido, aunque no se documenta un proceso de entrenamiento recomendado.
- Generación de diálogos para videojuegos o mundos virtuales: el modelo puede generar respuestas en contexto de rol, adecuado para NPCs o sistemas de diálogo dinámico.
- Asistencia en redacción de guiones o historias interactivas: permite crear narrativas ramificadas con coherencia, dado su enfoque en escritura creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda. Tampoco se proporcionan métricas de latencia o throughput para la versión MLX.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 8.6B parámetros en 8 bits, el tamaño del modelo en memoria es aproximadamente 8,6 GB, más overhead de activaciones y KV cache, por lo que se requiere al menos 12-16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: compatible con Apple Silicon (M1/M2/M3/M4) con 16 GB o más de memoria unificada. En GPUs NVIDIA, se puede usar la versión original en safetensors (no MLX), pero la conversión MLX es específica para Apple.
- Si cabe en consumer GPU: en GPUs NVIDIA consumer como RTX 4080 o 4090, el modelo en 8 bits cabría en 16 GB VRAM, pero esta versión MLX no es compatible directamente; habría que usar el modelo base en formato estándar.
- Opciones de despliegue: mlx-lm permite la carga y generación en Python en Mac; no se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría. El modelo base Gemma4-31B de Google DeepMind sería comparable en arquitectura, pero no se dispone de datos de rendimiento de esta conversión concreta. Otras conversiones MLX de McG-221 (como Gemma-4-Novelist-31B-mlx-8Bit o gemma-4-31B-it-scotoma-2-mlx-8Bit) son alternativas de la misma serie, pero no se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tune de Gemma4, puede heredar sesgos del modelo base, aunque no hay datos específicos.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o incoherente, especialmente en tareas creativas donde la libertad narrativa es alta.
- Limitaciones de contexto: la ventana de 4096 tokens (SWA-4096) es relativamente corta para conversaciones largas; puede perder coherencia en diálogos extensos.
- Idiomas: no se confirma el soporte multilingüe; probablemente el rendimiento sea óptimo en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 también es Apache 2.0, por lo que no hay restricciones adicionales.
- Advertencia de producción: la conversión MLX es experimental y no se ha validado su estabilidad en entornos de producción; se recomienda realizar pruebas exhaustivas antes de desplegar.
- Discrepancia de parámetros: el nombre indica 31B pero los pesos reales son 8.6B; esto puede generar confusión en la evaluación de recursos y rendimiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/McG-221/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-mlx-8Bit
- Modelo base en HuggingFace: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Modelo relacionado de McG-221: https://huggingface.co/McG-221/gemma-4-31B-it-scotoma-2-mlx-8Bit
- Modelo relacionado de McG-221: https://huggingface.co/McG-221/Gemma-4-Novelist-31B-mlx-8Bit
- Ficha de Gemma 4 31B IT en NVIDIA NIM: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Análisis en free2aitools: https://free2aitools.com/model/mcg-221/gemma-4-31b-it-scotoma-2-mlx-8bit
