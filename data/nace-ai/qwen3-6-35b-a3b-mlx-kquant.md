# nace-ai/Qwen3.6-35B-A3B-MLX-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-KQuant es una cuantización de 4 bits en formato MLX del modelo Qwen3.6-35B-A3B, publicada por el usuario nace-ai. El modelo base es un transformer de tipo MoE (mezcla de expertos) desarrollado por el equipo Qwen (Alibaba), con 35.107.181.936 parámetros totales según los pesos en safetensors. Esta versión concreta emplea la técnica propietaria KQuant del autor para reducir el peso de los pesos del modelo de lenguaje a 19,51 GB manteniendo una divergencia KL de 0,059 frente al modelo BF16 original, frente a 0,096 de la cuantización 4-bit de mlx-community.

La relevancia de esta ficha radica en que ofrece una alternativa de cuantización con mejor fidelidad que las publicadas por la comunidad para ejecutar un modelo de 35B con arquitectura MoE en Apple Silicon. El pack completo ocupa 21,0 GB de archivos y está pensado para su uso con mlx-lm, LM Studio y el motor Kapitsa del propio autor, todos ellos sobre macOS con chips de la serie M.

El modelo base soporta entrada de imagen y texto (pipeline image-text-to-text), razonamiento con modo de pensamiento activado por defecto, tool calling y conversación multi-turno. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (LM Studio probado con 32.768) |
| Tipos de cuantización | 4 bits (KQuant Q4); el autor menciona también KQuant Q5 en otro repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos (MoE), tal como indica el tag `qwen3_5_moe` y el sufijo A3B del nombre, que sugiere aproximadamente 3 mil millones de parámetros activos por token. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta cuantización no incluye esos datos del modelo original.

La innovación técnica de esta publicación es el esquema KQuant, una cuantización de 4 bits desarrollada por nace-ai que, según el autor, logra una divergencia KL de 0,059 frente al modelo BF16, un 1,6 veces más cercana al original que la cuantización 4-bit de mlx-community (KL 0,096) con el mismo tamaño de pesos del modelo de lenguaje (19,51 GB). El pack está empaquetado específicamente para MLX, la librería de Apple para ejecución de modelos en chips de la serie M, e incluye soporte para entrada de imágenes y tool calling a través de servidores compatibles con OpenAI.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento con modo de pensamiento (thinking) activado por defecto; el razonamiento se devuelve en el campo `reasoning_content` o `reasoning` según el servidor.
- Desactivación del modo de pensamiento mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imágenes (image-text-to-text): acepta URLs http(s) o data URLs en base64 como partes `image_url` al estilo OpenAI.
- Tool calling / function calling con definiciones de herramientas al estilo OpenAI, probado con `mlx_lm.server` y LM Studio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Integración con APIs compatibles con OpenAI, Anthropic y Ollama a través del motor Kapitsa.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en un equipo Apple Silicon con 21 GB de archivos, gestionando conversaciones multi-turno con modo de pensamiento para preguntas complejas y desactivándolo para respuestas rápidas.
- Análisis de imágenes en local: gracias al pipeline image-text-to-text, se puede enviar una imagen por URL o base64 y pedir descripciones, extracción de información o respuesta a preguntas sobre el contenido visual, sin salir del equipo.
- Automatización de flujos con herramientas: el soporte de tool calling permite conectar el modelo a funciones externas (clima, bases de datos, APIs) mediante el SDK de OpenAI apuntando a un servidor local Kapitsa o mlx-lm.
- Desarrollo y pruebas de agentes: la combinación de razonamiento explícito y tool calling facilita la construcción de agentes multi-paso que planifican, invocan herramientas y sintetizan resultados, todo en local.
- Prototipado de aplicaciones con API compatible con OpenAI: al exponer un endpoint `/v1/chat/completions`, se puede integrar en aplicaciones existentes sin cambiar el código cliente, usando `mlx_lm.server` o Kapitsa.
- Investigación sobre cuantización: el pack sirve como referencia para estudiar el impacto de KQuant frente a otras cuantizaciones 4-bit, comparando la divergencia KL y el comportamiento en tareas de chat, imagen y herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta la divergencia KL frente al modelo BF16: 0,059 para KQuant Q4 frente a 0,096 para mlx-community 4-bit, con el mismo tamaño de pesos del modelo de lenguaje (19,51 GB). No se proporcionan datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- Espacio en disco: 21,0 GB de archivos; el repo completo ocupa 44,0 GB (incluye posiblemente otras variantes o artefactos).
- Pesos del modelo de lenguaje en 4 bits: 19,51 GB.
- VRAM/memoria unificada estimada: al menos 21 GB libres para cargar el pack; se recomienda 32 GB o más para contexto largo y margen del sistema.
- GPU recomendadas: chips Apple Silicon de la serie M con memoria unificada suficiente (M1/M2/M3/M4 Pro, Max o Ultra). No está pensado para GPUs NVIDIA.
- Cabe en GPU de consumo: sí, en Macs con 32 GB o más de memoria unificada; en modelos con 24 GB puede ser ajustado.
- Opciones de despliegue: Kapitsa (motor del autor, con APIs OpenAI, Anthropic y Ollama), mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), LM Studio (`lms get ... --mlx`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.6-35B-A3B-MLX-KQuant | 35,1B (MoE) | no disponible | 4 bits KQuant (19,51 GB LM) | Apache 2.0 | Hugging Face, MLX |
| mlx-community 4-bit (Qwen3.6-35B-A3B) | 35,1B (MoE) | no disponible | 4 bits (KL 0,096) | Apache 2.0 | Hugging Face, MLX |
| unsloth UD-3bit (Qwen3.6-35B-A3B) | 35,1B (MoE) | no disponible | 3 bits dinámico | Apache 2.0 | Hugging Face |
| unsloth UD-4bit (Qwen3.6-35B-A3B) | 35,1B (MoE) | no disponible | 4 bits dinámico | Apache 2.0 | Hugging Face |

Los datos de la comparativa se limitan a lo mencionado en la model card; no se dispone de resultados de rendimiento comparativos más allá de la divergencia KL.

## Limitaciones y advertencias

- La model card indica que varios ejemplos de inferencia solo se probaron en el pack de 9B del mismo autor; en este pack de 35B únicamente se verificaron chat, lectura de imagen y tool calling con mlx-lm 0.32.2 y LM Studio.
- El modo de pensamiento desactivado no se probó en este pack concreto según el autor.
- Exclusivo para Apple Silicon y MLX; no es utilizable en GPUs NVIDIA ni en entornos CUDA.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específica del modelo base en la documentación proporcionada.
- La cuantización introduce una divergencia respecto al modelo BF16 (KL 0,059), por lo que puede degradar ligeramente tareas sensibles a la precisión numérica.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B por si añaden restricciones adicionales.
- El tamaño del repo (44,0 GB) y la memoria necesaria (21 GB o más) limitan su uso a equipos con recursos suficientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Repo relacionado KQuant Q4: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-Q4-KQuant
- Pack de referencia 9B: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant
