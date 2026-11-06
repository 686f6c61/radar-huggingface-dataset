# liftkkkk/ask-the-author-0.8b-gguf

## Resumen

ask-the-author-0.8b-gguf es la versión cuantizada en formato GGUF de un modelo de lenguaje de 0,8 mil millones de parámetros presentado como "memoria" del libro *《图原生智能体》* (Live Book). Lo publica el usuario liftkkkk en Hugging Face bajo licencia Apache 2.0 y está pensado exclusivamente para el idioma chino (zh). Su función declarada es recuperar y reproducir el contenido del libro a partir de un número de capítulo y su título, actuando como un asistente conversacional especializado en esa obra concreta.

El modelo se basa en la arquitectura Qwen3.5-0.8B, una variante híbrida que combina atención lineal con atención completa (`linear_attention + full_attention`, identificador `QWEN35`). Los pesos se han convertido a GGUF con llama.cpp build b12144 y se distribuyen en tres niveles de cuantización: bf16 (1,5 GB), Q8_0 (775 MB) y Q4_K_M (505 MB). Esta horquilla de tamaños lo hace desplegable en hardware muy modesto, incluidos dispositivos móviles en el caso de Q4_K_M.

La relevancia de este modelo es acotada: no es un modelo generalista, sino un artefacto de recuperación de conocimiento sobre un texto concreto, con un persona por defecto embebida en la plantilla de chat. Para cualquier tarea fuera de esa función específica, sus capacidades y su cobertura lingüística (solo chino) lo hacen inadecuado como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5-0.8B (`QWEN35`): linear_attention + full_attention |
| Parametros totales | 0,8 mil millones (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q4_K_M |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3.5-0.8B, un transformer que alterna capas de atención lineal con capas de atención completa, una combinación que busca reducir el coste computacional en secuencias largas manteniendo la calidad de recuperación de información. La model card identifica el modelo base como `Qwen3_5ForCausalLM` y documenta que la conversión se realizó con el script `convert_hf_to_gguf.py` de llama.cpp build b12144, que incorpora soporte para `Qwen3_5TextModel`.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card menciona una "distribución de entrenamiento LoRA", lo que sugiere que el modelo se adaptó mediante fine-tuning LoRA sobre el modelo base Qwen3.5-0.8B para especializarlo en el contenido del libro. También se documenta una modificación de la plantilla de chat: `add_generation_prompt` ya no inserta un bloque `<think>` vacío, y cuando no se proporciona mensaje de sistema se inyecta automáticamente el persona por defecto ("你是《图原生智能体》一书的记忆体…"). Esta inyección es coherente con la distribución de entrenamiento declarada.

## Capacidades

- Generación de texto en chino, orientada a la reproducción fiel del contenido del libro *《图原生智能体》*.
- Recuperación de contenido por número de capítulo y título.
- Cadena de pensamiento integrada (`<think>`), que llama.cpp renderiza automáticamente como contenido de razonamiento.
- Funcionamiento sin system prompt: el persona por defecto está embebido en la plantilla de chat y se sobrescribe si el usuario pasa uno propio.
- Soporte de modo greedy (`--temp 0`) recomendado para máxima fidelidad, y `--temp 0.6` para consultas creativas.
- Compatibilidad con llama-cli, llama-server (API compatible con OpenAI), LM Studio y Ollama.
- No se documentan capacidades de tool calling, function calling, visión, audio ni razonamiento multi-paso más allá del thinking mode.

## Casos de uso

- Consulta de contenido del libro: el modelo responde a preguntas del tipo "¿de qué trata este libro?" o "¿qué dice el capítulo N con título X?", reproduciendo el texto de referencia. Es su función principal y para la que fue ajustado.
- Asistente de estudio sobre la obra: un lector puede preguntar por conceptos concretos de *《图原生智能体》* y obtener pasajes fieles, gracias al modo greedy que minimiza la desviación respecto al original.
- Despliegue en dispositivos móviles o de bajos recursos: la variante Q4_K_M de 505 MB puede importarse directamente en LM Studio u Ollama sin configuración adicional, lo que permite llevar el asistente del libro a un portátil modesto o a un teléfono.
- Servicio local con API compatible con OpenAI: mediante `llama-server` en el puerto 8080 se expone un endpoint `/v1/chat/completions` que puede integrarse en una aplicación web de lectura o en un chatbot de documentación.
- Generación de material derivado del libro: con `--temp 0.6` el modelo puede producir resúmenes o reformulaciones creativas de pasajes, útil para notas de lectura o material divulgativo.
- Referencia para re-cuantización: el fichero bf16 de 1,5 GB sirve como madre para generar nuevas cuantizaciones con `llama-quantize` si se necesita otro equilibrio entre tamaño y calidad.
- Pruebas de pipelines de inferencia local: al ser un modelo pequeño con plantilla de chat personalizada, resulta útil para validar integraciones de llama.cpp, LM Studio u Ollama antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para bf16, 775 MB para Q8_0 y 505 MB para Q4_K_M, más el overhead del contexto y de la propia aplicación de inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre es suficiente para Q4_K_M; una RTX 3060 de 12 GB o superior permite ejecutar bf16 con contexto amplio sin problemas.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en iGPU y en CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio y Ollama mediante importación directa del `.gguf`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|---|
| ask-the-author-0.8b-gguf | ~0,8B | No disponible | zh | Apache 2.0 | GGUF | Especializado en un libro concreto; persona embebido |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | Multilingüe | No disponible en esta ficha | safetensors / GGUF | Modelo generalista del que deriva; sin ajuste al libro |
| Modelos pequeños generalistas de 1B (p. ej. familias tipo Llama 3.2 1B) | ~1B | 128K en algunas variantes | Multilingüe | Licencias variables | safetensors / GGUF | Mayor cobertura lingüística y de tareas, pero sin conocimiento del libro |

La comparación directa es limitada porque ask-the-author-0.8b es un artefacto de nicho: frente al Qwen3.5-0.8B base pierde generalidad y multilingüismo a cambio de fidelidad sobre un texto concreto; frente a modelos generalistas de tamaño similar, carece de soporte para tareas ajenas a la obra.

## Limitaciones y advertencias

- Cobertura lingüística restringida al chino; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo alto de alucinación fuera del dominio del libro: al ser un modelo de 0,8B ajustado para memorizar un texto, puede generar contenido plausible pero incorrecto cuando se le pregunta por temas ajenos.
- Sesgos: no documentados en la información disponible; al derivar de un modelo base chino, puede heredar sesgos de sus datos de preentrenamiento.
- El persona por defecto está embebido en la plantilla de chat; si se integra en un pipeline que no respete la plantilla, el comportamiento puede degradarse.
- Longitud de contexto no documentada, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero el contenido del libro reproducido puede estar sujeto a derechos de autor independientes de la licencia del modelo; conviene revisar la situación legal antes de explotarlo comercialmente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de calidad más allá de la model card.
- No se documentan evaluaciones de seguridad, robustez frente a prompt injection ni comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/liftkkkk/ask-the-author-0.8b-gguf
- llama.cpp (repositorio del conversor y motor de inferencia): https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
