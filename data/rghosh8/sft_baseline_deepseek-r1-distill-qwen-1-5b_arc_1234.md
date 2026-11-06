# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_1234

## Resumen

`rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_1234` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario rghosh8 en Hugging Face. Se trata de un modelo de generación de texto de 1.777.088.000 parámetros (aproximadamente 1,78 mil millones) construido sobre la arquitectura Qwen2, empaquetado en formato safetensors y entrenado con la librería TRL (versión 1.15.0) sobre Transformers 5.17.0 y PyTorch 2.13.0.

El nombre del checkpoint (`SFT_baseline_arc_seed1234`) sugiere que forma parte de un experimento de línea base de ajuste supervisado, probablemente sobre la tarea ARC (AI2 Reasoning Challenge), con una semilla fija (1234) para reproducibilidad. No obstante, la model card no documenta explícitamente el dataset de entrenamiento, la composición de los datos ni los hiperparámetros utilizados, por lo que esta interpretación no puede confirmarse con la información disponible.

El modelo hereda las capacidades del destilado de DeepSeek-R1 sobre Qwen, orientadas a razonamiento con cadena de pensamiento. Su relevancia es limitada en términos de adopción (0 descargas, 0 likes en el momento de la consulta) y su utilidad principal parece ser la de un artefacto de investigación reproducible más que la de un modelo listo para producción. La licencia no está declarada de forma explícita en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), ajustada desde DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2, no confirmada) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |
| Tamano del repo | 3,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Framework de entrenamiento | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

El modelo parte de `DeepSeek-R1-Distill-Qwen-1.5B`, un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 de 1,5 mil millones de parámetros. Qwen2 es un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El proceso de destilación original de DeepSeek transfiere capacidades de razonamiento (generación de cadenas de pensamiento antes de la respuesta) desde un modelo mayor hacia uno pequeño.

Sobre esa base, este checkpoint aplica un ajuste fino supervisado (SFT) mediante TRL. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni los hiperparámetros (learning rate, batch size, épocas). El sufijo `arc_seed1234` apunta a un experimento sobre el benchmark ARC con semilla 1234, pero no se aporta confirmación ni detalles del procedimiento. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en formato chat (etiqueta `conversational`).
- Razonamiento con cadena de pensamiento, heredado del destilado de DeepSeek-R1 (capacidad inferida del modelo base; no verificada en esta ficha).
- Generación de código y matemáticas (capacidad atribuible al modelo base, no documentada específicamente para este checkpoint).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no documentadas para este checkpoint; el modelo base es solo texto.

## Casos de uso

- Reproducción de experimentos de SFT: el checkpoint sirve como línea base reproducible (semilla 1234) para comparar estrategias de ajuste supervisado sobre destilados de razonamiento, gracias a la fijación de semilla y al registro de versiones de framework.
- Evaluación comparativa en tareas de razonamiento tipo ARC: útil para medir el efecto del SFT sobre el rendimiento en preguntas de opción múltiple con razonamiento científico, si bien no se publican resultados.
- Prototipado de asistentes conversacionales ligeros: con 1,78 mil millones de parámetros puede desplegarse en hardware modesto para pruebas de concepto de diálogo multi-turno.
- Investigación sobre destilación de razonamiento: permite estudiar cómo se comporta un destilado de DeepSeek-R1 tras un ajuste supervisado adicional en dominios específicos.
- Generación de texto en entornos con recursos limitados: su tamaño reducido facilita la inferencia en GPU de consumo para tareas de generación no crítica.
- Base para posteriores ajustes (RLHF/DPO): puede emplearse como punto de partida para pipelines de alineación adicional en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 5-7 GB en función de la longitud de contexto).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,8-2,5 GB; en 4 bits, aproximadamente 1-1,5 GB (estimaciones generales para un modelo de 1,78 B; no confirmadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); para cuantización 4/8 bits, GPUs con 4-6 GB como RTX 3050 o T4.
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 8 GB o más en FP16 y prácticamente cualquiera con 6 GB en cuantización.
- Opciones de despliegue: transformers (pipeline de la model card), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_1234 | 1,78 B | No disponible | No disponible | Hugging Face (0 descargas) | Checkpoint de investigación SFT |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | No disponible en esta ficha | MIT (según el modelo base original, no verificado aquí) | Hugging Face, ampliamente usado | Modelo base del que deriva este checkpoint |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (referencia del modelo original) | Apache 2.0 (referencia) | Hugging Face, muy extendido | Alternativa generalista de tamaño similar |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (referencia) | Llama 3.2 Community License | Hugging Face, ampliamente usado | Alternativa ligera con contexto largo |

Los datos de los modelos comparativos corresponden a referencias generales de sus respectivas familias y no se han verificado contra la información proporcionada en esta consulta; se incluyen únicamente como orientación.

## Limitaciones y advertencias

- Licencia no declarada de forma explícita: no puede asumirse uso comercial sin verificar los términos del modelo base y del autor.
- Idiomas soportados no documentados: riesgo de comportamiento deficiente fuera del inglés si el SFT se realizó solo en ese idioma.
- Dataset de entrenamiento no documentado: imposible evaluar sesgos, contaminación de benchmarks o sobreajuste a ARC.
- Riesgo de alucinación inherente a los modelos de 1,5 B y a los destilados de razonamiento, especialmente en dominios factuales.
- Longitud de contexto no confirmada para este checkpoint: no debe asumirse la del modelo base sin verificación.
- Adopción nula (0 descargas, 0 likes): sin validación comunitaria ni reportes de calidad.
- Posible sobreajuste al formato de la tarea ARC si el SFT se centró en ella, degradando el rendimiento conversacional general.
- No hay evidencia de evaluación de seguridad, alineación ni filtrado de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_arc_1234
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
