# L1ght/Qwen3.5-9B-TLive

## Resumen

L1ght/Qwen3.5-9B-TLive es un conjunto de dos modelos fine-tuned sobre Qwen3.5-9B, especializados en el dominio de retransmisiones en vivo (livestream). Desarrollado por el usuario L1ght, el repositorio contiene dos variantes que comparten el mismo dataset de 10.000 muestras y la misma receta de entrenamiento, diferenciándose únicamente en el punto de partida: una parte de Qwen3.5-9B-Base y la otra de Qwen3.5-9B (Instruct). El fine-tuning se realizó exclusivamente con texto, por lo que las capacidades multimodales provienen del modelo base y no recibieron entrenamiento adicional.

El modelo base Qwen3.5-9B es un vision-language model con 9.000 millones de parámetros, 32 capas y una arquitectura híbrida que combina Gated DeltaNet y Gated Attention. Ofrece una longitud de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000 tokens, y soporta 201 idiomas. Este fine-tuning busca mejorar el rendimiento en tareas específicas de livestream, como selección de respuestas, identificación de destinatarios, QA en vivo y continuidad de transcripciones, manteniendo a la vez un buen desempeño en benchmarks generales.

La relevancia de este modelo radica en su aplicación práctica para plataformas de streaming, moderación de chat y análisis de contenido en tiempo real, donde los modelos genéricos suelen fallar por falta de dominio específico. Al estar basado en Qwen3.5-9B, hereda su eficiencia y capacidad de ejecución en GPUs de gama media, lo que lo hace accesible para despliegues en producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet + Gated Attention (híbrida), 32 capas, vision-language con early fusion |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta ~1.010.000 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantificables con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | 201 idiomas (según documentación de Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated DeltaNet (una capa de atención lineal con compuertas) y Gated Attention (atención tradicional con mecanismos de compuerta). Esta combinación permite procesar secuencias largas de manera eficiente, manteniendo un equilibrio entre rendimiento y coste computacional. El modelo integra visión y lenguaje mediante early fusion de tokens multimodales, lo que le permite razonar sobre imágenes y texto dentro del mismo contexto.

El fine-tuning de L1ght/Qwen3.5-9B-TLive se realizó mediante Supervised Fine-Tuning (SFT) sobre un dataset de 10.000 muestras específicas del dominio livestream. El entrenamiento fue exclusivamente textual, sin datos multimodales. Se utilizó una tasa de aprendizaje de 3e-6, inferior a la empleada en modelos más pequeños (1e-5), ya que a esta escala una tasa mayor degrada varios puntos en benchmarks generales. Los hiperparámetros exactos de cada ejecución se encuentran en el archivo `train_config.json` dentro de cada subcarpeta. Las dos variantes (Base-SFT-10k y chat-SFT-10k) difieren únicamente en el modelo de partida, pero comparten el mismo dataset y receta.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5-9B destaca en tareas de razonamiento lógico y matemático, superando a Qwen3-30B en la mayoría de benchmarks de lenguaje.
- Comprensión multimodal: aunque el SFT fue solo texto, el modelo base es capaz de procesar imágenes y texto simultáneamente, con early fusion de tokens multimodales.
- Soporte de tool calling y function calling: el modelo base incluye capacidades de invocación de herramientas, útiles para integraciones con APIs y agentes.
- Modo de pensamiento (thinking mode): Qwen3.5-9B soporta un modo de razonamiento explícito que mejora la calidad de las respuestas en tareas complejas.
- Multilingüismo: cobertura de 201 idiomas, lo que permite su uso en entornos internacionales de livestream.
- Especialización en livestream: las variantes fine-tuned mejoran significativamente tareas como selección de respuestas (Reply Selection), identificación de destinatario (Addressee), QA en vivo, continuidad de transcripciones (WhisperX, Live-CC) y comprensión de compras en streaming (ShoppingMMLU).

## Casos de uso

- Moderación automatizada de chat en directo: el modelo puede clasificar mensajes, identificar al destinatario correcto y seleccionar respuestas relevantes en conversaciones multi-hilo, gracias a su fine-tuning en tareas de Reply Selection y Addressee. Es adecuado para plataformas de streaming con alto volumen de interacción.
- Resumen automático de retransmisiones: con su capacidad de procesar contexto largo (262K tokens), puede resumir transcripciones completas de streams, extrayendo los puntos clave y generando resúmenes estructurados para su publicación posterior.
- Asistente virtual para compras en vivo: el fine-tuning en ShoppingMMLU permite al modelo responder preguntas sobre productos, precios y disponibilidad durante retransmisiones de venta, mejorando la experiencia de compra.
- Generación de subtítulos y continuidad de transcripciones: las mejoras en Live-CC y WhisperX Cont. indican que el modelo puede completar y corregir transcripciones automáticas en tiempo real, útil para accesibilidad y archivo.
- Análisis de sentimiento y engagement en directo: aunque no se menciona explícitamente, el modelo puede analizar comentarios y medir la reacción de la audiencia, gracias a su comprensión del lenguaje natural y su especialización en el dominio.
- Integración en pipelines de agentes para streaming: al soportar tool calling y reasoning, puede integrarse en sistemas de agentes que gestionan múltiples tareas (moderación, respuestas automáticas, análisis de métricas) durante una transmisión en vivo.
- Chatbots de atención al cliente en plataformas de video: el modelo puede gestionar consultas de usuarios en tiempo real, manteniendo el contexto de la conversación y derivando a agentes humanos cuando sea necesario.

## Benchmarks y rendimiento

Los resultados presentados a continuación provienen de la model card del autor y comparan las variantes fine-tuned con los modelos base originales.

### Dominio livestream (solo texto, 7 tareas)

| Modelo | Reply Sel. R@1 | Addressee | LiveQA | WhisperX Cont. | Live-CC Cont. | ShoppingMMLU | Sensai F1 | Live_AVG |
|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-Base | 20.4 | 17.8 | 53.7 | 98.0 | 98.0 | 66.43 | 38.33 | 56.09 |
| Qwen3.5-9B (Instruct) | 48.2 | 47.6 | **60.5** | 99.8 | 99.4 | 69.04 | **47.25** | 67.40 |
| Base-SFT-10k | 62.2 | **59.8** | 56.2 | **100.0** | **100.0** | 70.81 | 42.99 | 70.29 |
| chat-SFT-10k | **63.6** | 59.0 | 55.8 | **100.0** | 99.8 | **71.62** | 45.40 | **70.75** |

### Benchmarks multimodales generales

| Modelo | VisuLogic | LongVideoBench | Video-MME | MVBench(19) | MMBench | MME* | General_AVG | Total_AVG |
|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-Base | 8.8 | **64.17** | 67.44 | 67.86 | 85.91 | 2362.2 | 58.84 | 57.47 |
| Qwen3.5-9B (Instruct) | 7.4 | 58.79 | 67.15 | 68.88 | 84.45 | 2394.8 | 57.33 | 62.37 |
| Base-SFT-10k | 9.1 | 62.90 | **68.22** | **70.70** | **87.37** | 2386.4 | **59.66** | 64.98 |
| chat-SFT-10k | **9.2** | 62.75 | 67.89 | 70.36 | 86.00 | **2406.8** | 59.24 | **65.00** |

*MME es la puntuación total bruta (máximo 2800) y no se incluye en los promedios. `Live_AVG` es la media de las 7 tareas de livestream; `General_AVG` es la media de los 5 benchmarks generales (VisuLogic, LongVideoBench, Video-MME, MVBench, MMBench); `Total_AVG = (Live_AVG + General_AVG) / 2`.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-9B cabe en 8 GB de VRAM con cuantización y headroom, según The AI Bench. Para este fine-tuning, el tamaño es idéntico, por lo que se puede inferir un requisito similar.
- GPUs recomendadas: RTX 3060/4060 (8-12 GB) para cuantización 4-bit; RTX 4090 o A100 para inferencia en bfloat16 sin cuantizar.
- Compatibilidad con GPUs de consumo: sí, con cuantización (GGUF, GPTQ, AWQ) es posible ejecutarlo en GPUs de 8 GB o más.
- Opciones de despliegue: vLLM (descargando la subcarpeta localmente), llama.cpp, Ollama, Transformers con `device_map="auto"`, y TGI.
- Latencia y throughput: no se han publicado datos específicos para este fine-tuning. El modelo base tiene un rendimiento en el percentil 10 en velocidad según Benchable, lo que sugiere tiempos de respuesta más largos que la media, aunque esto puede variar con la cuantización y el hardware.

## Comparativa con modelos similares

La comparativa se realiza con las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de 9B en los benchmarks de livestream.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en livestream (Live_AVG) | Rendimiento general (General_AVG) |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base | 9B | 262K | Apache 2.0 | 56.09 | 58.84 |
| Qwen3.5-9B (Instruct) | 9B | 262K | Apache 2.0 | 67.40 | 57.33 |
| L1ght/Qwen3.5-9B-TLive (Base-SFT-10k) | 9B | 262K | Apache 2.0 | 70.29 | 59.66 |
| L1ght/Qwen3.5-9B-TLive (chat-SFT-10k) | 9B | 262K | Apache 2.0 | 70.75 | 59.24 |

Ambas variantes fine-tuned superan a los modelos base en el promedio de tareas de livestream, con una mejora de más de 3 puntos sobre el Instruct original. En benchmarks generales, mantienen un rendimiento similar o ligeramente superior, lo que indica que el fine-tuning no degrada significativamente las capacidades generales.

## Limitaciones y advertencias

- El fine-tuning se realizó exclusivamente con texto; las capacidades multimodales (visión) no recibieron entrenamiento adicional y dependen completamente del modelo base. Esto puede limitar el rendimiento en tareas que requieren comprensión visual dentro del contexto de livestream.
- El dataset de entrenamiento es de solo 10.000 muestras, lo que puede no cubrir toda la diversidad de escenarios de livestream. El modelo podría tener un rendimiento subóptimo en dominios muy específicos no representados en los datos.
- La tasa de aprendizaje de 3e-6 fue elegida para evitar degradación en benchmarks generales, pero aún así se observa una ligera caída en algunas tareas generales (por ejemplo, LongVideoBench) en comparación con el base.
- El modelo base Qwen3.5-9B tiene un rendimiento de velocidad bajo (percentil 10) según Benchable, lo que puede afectar a aplicaciones en tiempo real con requisitos estrictos de latencia.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este fine-tuning. Como cualquier modelo de lenguaje, puede generar contenido inexacto o sesgado, especialmente en contextos no cubiertos por el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base Qwen3.5-9B para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/L1ght/Qwen3.5-9B-TLive
- Página del modelo Qwen3.5-9B en There's An AI For That: https://theresanaiforthat.com/model/qwen3-5-9b/
- Página del modelo en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Página del modelo en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Página del modelo en The AI Bench: https://theaibench.ai/models/qwen-3-5-9b/
- Página del modelo en Apertis AI: https://apertis.ai/models/qwen3.5-9b
