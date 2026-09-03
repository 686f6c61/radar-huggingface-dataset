# Raghav-Singhal/1pp-0.5b-asst-base

## Resumen

El modelo `1pp-0.5b-asst-base` es un experimento de investigación del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Con 580 millones de parámetros, forma parte de un estudio 3×3 que explora tres tamaños (0.5B, 1B y 1.7B) y tres condiciones de preentrenamiento sobre el mismo corpus de 47,8 millones de documentos. Esta variante concreta se preentrenó con conversaciones reescritas y pérdida únicamente en los turnos de asistente, lo que la convierte en un modelo base orientado a generar respuestas en formato de chat.

El modelo sigue una arquitectura Llama-style con 24 capas, contexto de 4.096 tokens y tokenizador basado en SmolLM2. Está pensado como artefacto de investigación para estudiar cómo el preentrenamiento condicionado por persona afecta a la generación de texto, no como un asistente generalista. Su licencia Apache 2.0 permite uso libre, pero su naturaleza experimental limita su aplicabilidad directa en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 heads / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16, safetensors) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama, con normalización RMSNorm, atención con RoPE (base 10.000) y FFN SwiGLU. No utiliza embeddings atados ni sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token especial `<|pad|>`, y `<|endoftext|>` marca el final de documento.

El preentrenamiento se realizó sobre 47,8 millones de documentos reescritos como conversaciones (63.000 millones de tokens en formato conversacional), con una única pasada y 31.777 pasos de optimización. Se usó batch global de 512×4.096 tokens, enmascaramiento de atención entre documentos y empaquetado best-fit. El optimizador fue Muon (con Adam para embeddings y normas), con warmup de 2.000 pasos, tasa constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16. La pérdida se calculó solo sobre los turnos de asistente, ignorando los turnos de usuario y el token de fin de documento.

## Capacidades

- Generación de texto en formato conversacional ChatML (sin turno de sistema, que el modelo nunca vio durante el entrenamiento).
- Modelo base: no está alineado mediante RLHF ni DPO, por lo que no tiene capacidades de instrucción explícitas.
- Soporta el formato de chat definido por su `chat_template`, que genera exactamente la estructura `<|im_start|>user...<|im_end|>` y `<|im_start|>assistant...<|im_end|>`.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüismo limitado al inglés, dado que el corpus de entrenamiento es exclusivamente en ese idioma.
- Al ser un modelo de investigación, su capacidad principal es servir como base para estudiar el efecto del preentrenamiento condicionado por persona.

## Casos de uso

- Investigación académica sobre preentrenamiento condicionado: el modelo permite comparar cómo la pérdida solo en turnos de asistente afecta a la generación frente a otras condiciones del estudio 1PP (original, o pérdida en ambos turnos).
- Fine-tuning para tareas de diálogo: al ser un modelo base, puede ajustarse con SFT para dominios específicos como atención al cliente o asistentes virtuales, partiendo de una representación ya orientada a conversación.
- Generación de respuestas en formato ChatML: útil para prototipos que requieran estructuras de chat sin necesidad de un sistema de prompts complejo.
- Análisis de sesgos y comportamiento de modelos pequeños: su tamaño reducido permite ejecutarlo en hardware modesto para estudiar fenómenos de alucinación o coherencia en conversaciones.
- Benchmarking de técnicas de cuantización: al ser un modelo denso de 0,58B, sirve para probar métodos de compresión (GPTQ, AWQ, GGUF) en un entorno controlado.
- Educación y experimentación en NLP: su licencia abierta y su documentación detallada lo hacen adecuado para cursos o talleres sobre arquitecturas transformer y preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Tipo de texto | Pérdida (per token) |
|---|---|
| Texto de asistente | 1.579 |
| Texto de usuario | 6.878 |
| Texto de documento | 3.372 |

Estos valores indican que el modelo predice mucho mejor los turnos de asistente que los de usuario, coherente con la máscara de pérdida aplicada durante el entrenamiento. No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para los pesos (580M parámetros × 2 bytes), más overhead de activaciones y KV cache. Con contexto de 4.096 tokens, se puede ejecutar en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia. Para fine-tuning, se recomienda al menos 8 GB.
- Compatible con consumer GPU: sí, es un modelo pequeño que cabe en la mayoría de GPUs modernas.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han publicado configuraciones específicas de latencia o throughput.
- Latencia y throughput: no disponible en la documentación; en una GPU moderna se espera una latencia de decenas de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.5b-asst-base | 0,58B | 4.096 | Apache 2.0 | Modelo base experimental, preentrenado con pérdida en turnos de asistente |
| SmolLM2-360M | 0,36B | 8.192 | Apache 2.0 | Modelo base generalista, entrenado con datos diversos |
| Qwen2.5-0.5B | 0,49B | 32.768 | Apache 2.0 | Modelo base con mayor contexto y soporte multilingüe |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La comparativa se limita a características arquitectónicas y de licencia. El 1pp-0.5b-asst-base se distingue por su condición de preentrenamiento específica (conversaciones reescritas, pérdida solo en asistente), que no está presente en los otros dos.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente generalista: no está alineado con instrucciones y puede producir respuestas incoherentes o no deseadas fuera del formato conversacional.
- Sesgos del corpus: entrenado exclusivamente con documentos en inglés, lo que limita su uso en otros idiomas y puede reflejar sesgos presentes en los datos originales.
- Riesgo de alucinación: al ser un modelo base pequeño, es propenso a generar información factualmente incorrecta, especialmente en tareas de conocimiento.
- Contexto limitado: 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin soporte de system prompt: el formato ChatML no incluye turno de sistema, por lo que no se puede condicionar el comportamiento mediante instrucciones de sistema.
- Sin garantías de producción: no se han realizado evaluaciones de seguridad, robustez ni rendimiento en aplicaciones reales.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo presenta como artefacto de investigación, no como producto listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.5b-asst-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training y https://wandb.ai/raghav_singhal/1pp-sft
