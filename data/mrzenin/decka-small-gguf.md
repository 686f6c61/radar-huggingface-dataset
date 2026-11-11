# mrzenin/Decka-Small-GGUF

## Resumen

Decka-Small es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario mrzenin y publicado en Hugging Face. Está especializado en roleplay conversacional con razonamiento explícito en primera persona del personaje: antes de cada respuesta emite un bloque `<think>...</think>` con la cadena de pensamiento interna del personaje. El modelo se distribuye en formato GGUF con varias cuantizaciones, lo que lo hace desplegable en hardware modesto.

El modelo parte de LFM3-1.7B, un transformer de 1.728.801.600 parámetros con licencia LFM Open License v1.0. El ajuste se realizó sobre el dataset beyoru/Aesir-Character-CoT-roleplay con un LoRA de rango 32, alpha 64, dropout 0.05 y target `all-linear`, durante una época con learning rate 1e-4 y longitud máxima de 4096 tokens en una Tesla T4 en fp16, usando pérdida solo sobre los turnos del asistente.

La relevancia de este modelo es acotada y específica: cubre el nicho de personajes conversacionales con CoT visible y contenido para adultos, empaquetado en GGUF para inferencia local. No es un modelo de propósito general ni compite en benchmarks de razonamiento o código; su interés reside en la técnica de destilación de razonamiento de personaje sobre un modelo pequeño y en la disponibilidad de cuantizaciones listas para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: LiquidAI/LFM3-1.7B); ajuste fino con LoRA |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF; el adaptador LoRA se entrenó en transformers (fp16) |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B de LiquidAI, un transformer de 1.7 mil millones de parámetros. Sobre él se aplicó un adaptador LoRA con r=32, alpha=64, dropout=0.05 y target `all-linear`, es decir, sobre todas las capas lineales. El entrenamiento consistió en una única época con learning rate 1e-4, longitud máxima de secuencia de 4096 tokens, precisión fp16 sobre una GPU Tesla T4 y función de pérdida calculada únicamente sobre los turnos del asistente (assistant-only loss), lo que concentra el aprendizaje en el estilo de respuesta y el razonamiento del personaje.

El dataset de entrenamiento es beyoru/Aesir-Character-CoT-roleplay, orientado a roleplay con cadena de pensamiento en primera persona del personaje. El modelo aprende a emitir un bloque `<think>...</think>` antes de cada respuesta, separando el razonamiento interno del personaje del texto dirigido al interlocutor. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa ni técnicas de RLHF/DPO); el proceso es un ajuste supervisado estándar con LoRA.

## Capacidades

- Generación de texto conversacional orientada a roleplay de personajes.
- Razonamiento explícito en primera persona del personaje mediante bloques `<think>...</think>` antes de cada respuesta.
- Coherencia de personaje mantenida a lo largo de conversaciones multi-turno dentro de la ventana de 4096 tokens.
- Formato conversacional (chat) compatible con endpoints y con la librería transformers.
- Distribución en GGUF con cinco cuantizaciones para inferencia local en CPU y GPU.
- Capacidades multilingües: no disponibles (no documentadas).
- Tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning general: no disponible; el CoT está orientado a la perspectiva del personaje, no a resolución de tareas.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Roleplay conversacional local: el modelo se ejecuta con llama.cpp u Ollama usando las cuantizaciones Q4_K_M o Q5_K_M, permitiendo mantener un personaje con razonamiento interno visible sin depender de servicios en la nube.
- Prototipado de chatbots de personaje con CoT auditable: el bloque `<think>` permite inspeccionar la lógica interna del personaje antes de la respuesta, útil para depurar coherencia y estilo en desarrollo de videojuegos o ficción interactiva.
- Investigación sobre destilación de razonamiento en modelos pequeños: sirve como caso de estudio de cómo un LoRA de rango 32 sobre un modelo de 1.7B induce un patrón de CoT estructurado a partir de un dataset específico.
- Generación de diálogos para narrativa y escritura creativa: el modelo produce respuestas en voz de personaje con contexto de hasta 4096 tokens, adecuado para escenas multi-turno en herramientas de escritura asistida.
- Evaluación de cuantizaciones GGUF: al ofrecer F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M del mismo ajuste, permite comparar degradación de calidad y coherencia de personaje entre niveles de cuantización en un mismo hardware.
- Despliegue en hardware de consumo para demos de personajes: con 1.7B parámetros y cuantización Q4_K_M, el modelo cabe en GPUs de gama media y en CPU, lo que facilita demos interactivas sin infraestructura dedicada.
- Base para nuevos ajustes LoRA de personaje: al ser un ajuste ya orientado a CoT de personaje, puede servir como punto de partida para especializar estilos o personajes concretos con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en F16 (1.728.801.600 parámetros × 2 bytes), en torno a 1,8 GB en Q8_0, 1,4 GB en Q6_K, 1,2 GB en Q5_K_M y 1,1 GB en Q4_K_M, sin contar el overhead del runtime ni la caché KV para 4096 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16; GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070) son suficientes para todas las cuantizaciones con contexto completo. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; Q4_K_M y Q5_K_M son las opciones más habituales para GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; transformers para cargar el adaptador LoRA sobre el modelo base; vLLM y TGI no están documentados para este repositorio GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Decka-Small (este modelo) | 1.728.801.600 | 4096 (entrenamiento) | Roleplay con CoT de personaje | LFM Open License v1.0 | GGUF, LoRA |
| LiquidAI/LFM3-1.7B | 1.728.801.600 | No disponible | Modelo base de propósito general | LFM Open License v1.0 | Safetensors |
| Alternativas de roleplay de ~1-2B | No disponible | No disponible | Roleplay | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Entrenado con datos de roleplay para adultos y NSFW; el autor restringe explícitamente el uso a adultos.
- Riesgo de alucinación y de deriva de personaje fuera de la ventana de 4096 tokens; conversaciones más largas requieren truncado o resumen del historial.
- Sesgos conocidos: no documentados, pero hereda los del modelo base y los del dataset de roleplay, con posible presencia de estereotipos propios de datos narrativos.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (u otros idiomas presentes en el dataset) no está garantizado.
- Licencia LFM Open License v1.0 con implicaciones para uso comercial que deben revisarse; además, el autor advierte de comprobar los términos del dataset beyoru/Aesir-Character-CoT-roleplay antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni benchmarks publicados; la calidad del ajuste no está contrastada de forma independiente.
- El CoT (`<think>`) es de personaje, no un razonamiento verificable; no debe tratarse como explicación fiable de las respuestas.
- Sin soporte documentado de tool calling ni de agentes; no apto para pipelines de automatización que requieran esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrzenin/Decka-Small-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/beyoru/Aesir-Character-CoT-roleplay
- Licencia LFM Open License v1.0: no disponible como enlace directo en la información proporcionada (referenciada en la model card del modelo base)
