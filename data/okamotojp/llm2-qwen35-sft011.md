# OkamotoJP/llm2-qwen35-sft011

## Resumen

llm2-qwen35-sft011 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso "LLM講座2 2026". El modelo está especializado en la generación de respuestas para sistemas de recuperación aumentada (RAG) en japonés, y se ha entrenado mediante LoRA con posterior fusión de los pesos en el modelo base. El resultado es un modelo de arquitectura idéntica al original, con solo la parte lingüística actualizada.

Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), se trata de un modelo compacto orientado a tareas de respuesta sobre documentos recuperados. Su relevancia radica en ser un ejemplo de ajuste fino eficiente sobre un modelo base pequeño para un dominio concreto (QA sobre Wikipedia japonesa y JEMHopQA), con licencia Apache-2.0 y pesos en safetensors.

No se dispone de información pública sobre benchmarks, contexto máximo efectivo ni detalles de la arquitectura interna más allá de lo indicado en la model card. Las descargas son muy reducidas (3) y no tiene likes, lo que sugiere un uso experimental o académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B; no se detalla en la model card) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) y aplica un ajuste fino supervisado mediante LoRA con r=16, alpha=32, learning rate 5e-05 y 1 época sobre 1.378 ejemplos. Posteriormente, los pesos LoRA se fusionan con los originales, de modo que la estructura del modelo resultante es idéntica a la del base y solo se actualizan los pesos de la parte lingüística.

Los datos de entrenamiento provienen de JEMHopQA (CC BY-SA 4.0), cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y un conjunto de chunks derivados de Wikipedia japonesa (CC BY-SA 4.0), utilizados como material de contexto en los prompts de entrenamiento. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset tras el filtrado y reformateo.

## Capacidades

- Generación de texto en japonés para respuestas basadas en documentos recuperados (RAG).
- Respuesta a preguntas de tipo hop múltiple, entrenado con JEMHopQA.
- Generación de respuestas a partir de chunks de Wikipedia japonesa.
- Capacidad multilingüe limitada al japonés según la model card (language: [ja]).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documenta soporte de multi-step reasoning más allá de lo que el modelo base pueda ofrecer de forma inherente.

## Casos de uso

- Generación de respuestas en sistemas RAG sobre Wikipedia japonesa: el modelo está entrenado específicamente para recibir chunks de contexto y producir respuestas, por lo que encaja en pipelines de recuperación y generación en japonés.
- Question answering de hop múltiple: adecuado para preguntas que requieren combinar información de varias fuentes, dado el entrenamiento con JEMHopQA.
- Asistentes documentales internos en japonés: puede integrarse en herramientas de consulta sobre bases documentales corporativas en japonés, siempre que se proporcione contexto recuperado.
- Prototipado académico de pipelines RAG: su tamaño reducido (0,87B) y licencia Apache-2.0 facilitan experimentación en entornos con recursos limitados.
- Evaluación de técnicas de ajuste fino con LoRA: sirve como referencia de un SFT ligero (1.378 ejemplos, 1 época) sobre un modelo base pequeño.
- Generación de respuestas extractivas o resumidas a partir de pasajes: útil en tareas de síntesis de contexto recuperado en japonés.
- Despliegue en entornos con GPU de gama media o incluso CPU: al ser un modelo de menos de mil millones de parámetros, es viable en hardware modesto, aunque no se han publicado cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (873M parámetros), en fp16 requeriría aproximadamente 1,7 GB solo para pesos, y en cuantización de 8 bits alrededor de 0,9 GB, sin contar overhead de activaciones y KV cache.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100, aunque no se han publicado pruebas.
- Cabe en GPU consumer: probablemente sí, en modelos con al menos 4-6 GB de VRAM, aunque no está verificado por el autor.
- Opciones de despliegue: no disponible; al publicarse solo en safetensors, sería necesaria conversión a GGUF para llama.cpp/Ollama, o usar vLLM/TGI si el modelo base es compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft011 | 873M | no disponible | Apache-2.0 | Hugging Face (safetensors) | SFT para RAG en japonés |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | Apache-2.0 | Hugging Face | Modelo base sin ajuste específico |
| Otros modelos japoneses pequeños (p. ej., cl-nagoya) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente en japonés; su uso en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos de generación de texto, especialmente con contexto recuperado limitado o ambiguo.
- El ajuste se realizó con solo 1.378 ejemplos y 1 época, lo que puede limitar la generalización fuera del dominio de JEMHopQA y Wikipedia japonesa.
- No se documentan sesgos específicos, pero al derivar de Qwen3.5-0.8B y de datos de Wikipedia, puede heredar sesgos de estas fuentes.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- No se dispone de información sobre la longitud de contexto efectiva ni sobre el rendimiento en producción.
- El modelo tiene muy pocas descargas y ningún like, por lo que no hay validación comunitaria de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft011
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
