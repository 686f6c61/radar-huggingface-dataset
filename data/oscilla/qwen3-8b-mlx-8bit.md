# Oscilla/Qwen3-8B-mlx-8Bit

## Resumen

Oscilla/Qwen3-8B-mlx-8Bit es una conversión del modelo Qwen3-8B al formato MLX con cuantización de 8 bits, realizada por el usuario Oscilla mediante la librería mlx-lm (versión 0.31.2). El modelo original, desarrollado por Alibaba Cloud, es un transformer denso de 8.000 millones de parámetros orientado a generación de texto y conversación, con soporte para tool calling y razonamiento. Esta versión MLX está pensada para ejecutarse eficientemente en hardware Apple Silicon, aprovechando la memoria unificada de los chips M1, M2 y M3. La cuantización de 8 bits reduce el tamaño de los pesos a aproximadamente 2,3 GB (según el archivo safetensors), lo que permite su uso en equipos con 16 GB de RAM unificada o menos, manteniendo una calidad de generación cercana a la versión original en BF16.

La relevancia de este modelo radica en que ofrece una vía práctica para desplegar un LLM de 8B en dispositivos locales de Apple sin necesidad de servidores GPU dedicados, algo especialmente útil para desarrolladores que trabajan en entornos macOS y necesitan inferencia offline o con baja latencia. Al ser una conversión directa del modelo base, conserva todas las capacidades de Qwen3-8B, incluyendo su ventana de contexto de 40.000 tokens y su licencia Apache 2.0, que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 2.303.865.856 (pesos cuantizados en 8 bits; el modelo base tiene 8.000 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40.000 tokens (segun el modelo base Qwen3-8B) |
| Tipos de cuantizacion | 8 bits (formato MLX) |
| Idiomas soportados | No disponible en la ficha; el modelo base soporta principalmente ingles y chino, con capacidades multilingues limitadas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B emplea una arquitectura transformer estándar con atención por grupos de consultas (GQA), normalización RMSNorm y una capa de embedding compartida. Incluye innovaciones como la atención QKV con sesgo y una capa de normalización final antes del clasificador. El entrenamiento original de Qwen3-8B utilizó un pipeline que combina preentrenamiento en un corpus masivo (más de 14 billones de tokens) seguido de fases de supervisión con RLHF y DPO para alinear el comportamiento con las preferencias humanas. Sin embargo, esta conversión MLX no modifica los pesos del modelo; solo transforma el formato de los tensores a 8 bits y los organiza para su ejecución con mlx-lm. Por tanto, las características de entrenamiento del modelo original se mantienen intactas, aunque la cuantización puede introducir una ligera pérdida de precisión en las activaciones.

## Capacidades

- Generación de texto en lenguaje natural con alta coherencia y fluidez, tanto en inglés como en chino (idiomas principales del modelo base).
- Razonamiento complejo y resolución de problemas matemáticos, gracias al entrenamiento con datos de alta calidad.
- Generación de código en múltiples lenguajes de programación, incluyendo Python, Java, C++ y JavaScript.
- Soporte de tool calling y function calling, permitiendo al modelo interactuar con APIs y servicios externos.
- Capacidad conversacional multi-turno con memoria de contexto de hasta 40.000 tokens, adecuada para diálogos largos.
- Modo de razonamiento extendido (thinking mode) disponible en el modelo base, aunque su activación depende de la implementación del tokenizador.
- Capacidades multilingues limitadas: el modelo base reconoce más de 29 idiomas, aunque con menor rendimiento fuera de inglés y chino.

## Casos de uso

- Asistente de programación en macOS: un desarrollador puede ejecutar el modelo localmente en su Mac para obtener sugerencias de código, explicaciones de fragmentos y depuración, sin depender de servicios en la nube. La cuantización de 8 bits permite una inferencia fluida en un MacBook Pro con chip M2 o superior.
- Chatbot de atención al cliente para pequeñas empresas: el modelo puede gestionar conversaciones multi-turno con clientes, consultando una base de conocimiento mediante tool calling. Su ventana de 40.000 tokens permite mantener el historial completo de la conversación sin truncamiento.
- Análisis de documentos largos: gracias a su contexto extendido, puede resumir informes, artículos o contratos de hasta 30.000 tokens, extrayendo puntos clave y generando resúmenes estructurados.
- Generación de contenido creativo: redacción de artículos, guiones o correos electrónicos con un estilo consistente, aprovechando su capacidad de seguir instrucciones detalladas.
- Asistente de investigación académica: puede ayudar a buscar información en documentos técnicos, responder preguntas sobre un corpus local y citar pasajes relevantes, todo en local para proteger datos sensibles.
- Prototipado rápido de agentes conversacionales: los desarrolladores pueden integrar el modelo en frameworks como LangChain o LlamaIndex para construir agentes que ejecuten tareas multi-paso, gracias a su soporte de function calling y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversión MLX. El modelo base Qwen3-8B obtuvo puntuaciones notables en evaluaciones estándar (por ejemplo, MMLU alrededor de 75, HumanEval alrededor de 72), pero estos datos corresponden a la versión original en BF16 y pueden variar ligeramente tras la cuantización a 8 bits. Se recomienda realizar pruebas propias para validar el rendimiento en el caso de uso específico.

## Requisitos de hardware

- VRAM estimada: la cuantización de 8 bits reduce los pesos a aproximadamente 2,3 GB, pero la inferencia requiere memoria adicional para activaciones y caché KV. Con una ventana de contexto de 40.000 tokens, el consumo total de memoria unificada puede superar los 8 GB. Se recomienda un mínimo de 16 GB de RAM unificada para un uso cómodo.
- GPU recomendadas: al ser formato MLX, está optimizado para Apple Silicon. Funciona en chips M1, M2 y M3, tanto en versiones base como Pro y Max. No es compatible con GPUs NVIDIA o AMD sin emulación.
- Si cabe en consumer GPU: sí, en cualquier Mac con al menos 16 GB de memoria unificada. En Macs con 8 GB, el modelo puede ejecutarse con contexto reducido o mediante cuantización adicional (por ejemplo, 4 bits).
- Opciones de despliegue: la librería mlx-lm permite cargar el modelo directamente en Python. También se puede usar con herramientas como LM Studio o llama.cpp (si se convierte a GGUF), aunque el formato nativo es MLX.
- Latencia y throughput estimados: en un MacBook Pro con chip M2 Pro, la generación de tokens suele alcanzar entre 15 y 25 tokens por segundo con cuantización de 8 bits, dependiendo de la longitud de la secuencia y el tamaño de la caché. No se dispone de mediciones exactas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oscilla/Qwen3-8B-mlx-8Bit | 8B (cuantizado a 2.3B en 8-bit) | 40K | MLX (safetensors) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8B | 40K | Transformers (BF16) | Apache 2.0 | Hugging Face |
| mlx-community/Qwen3-8B-8bit | 8B | 40K | MLX (safetensors) | Apache 2.0 | Hugging Face |

La principal diferencia entre estas opciones es el formato y el origen de la conversión. El modelo de Oscilla es una conversión independiente, mientras que mlx-community ofrece una versión similar con posiblemente más validación comunitaria. El modelo original en BF16 ocupa unos 16 GB, por lo que la versión de 8 bits es más adecuada para hardware con memoria limitada. En términos de rendimiento, no hay diferencias sustanciales entre las conversiones MLX de 8 bits, ya que todas parten del mismo modelo base y aplican la misma cuantización.

## Limitaciones y advertencias

- La cuantización de 8 bits puede provocar una ligera degradación en tareas que requieren alta precisión numérica, como matemáticas avanzadas o razonamiento lógico complejo, en comparación con la versión BF16.
- El modelo base Qwen3-8B puede presentar sesgos culturales y de género derivados de sus datos de entrenamiento, especialmente en idiomas distintos del inglés y chino.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en temas de actualidad o dominios poco representados en su corpus.
- La ventana de contexto de 40.000 tokens es amplia, pero el rendimiento puede degradarse en secuencias muy largas debido a la memoria de atención, y el uso de contextos cercanos al máximo puede aumentar la latencia y el consumo de memoria.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero es necesario cumplir con los términos de atribución y no utilizar el modelo para actividades ilegales o dañinas.
- Al ser una conversión no oficial, no hay garantía de soporte técnico ni de actualizaciones. Se recomienda verificar la integridad de los pesos antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oscilla/Qwen3-8B-mlx-8Bit
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Conversión alternativa MLX de 8 bits: https://huggingface.co/Qwen/Qwen3-8B-MLX-8bit
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
