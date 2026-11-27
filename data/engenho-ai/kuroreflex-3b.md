# engenho-ai/KuroReflex-3B

## Resumen

KuroReflex-3B es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct desarrollado por engenho-ai dentro de su línea "Kuro". Está concebido como un módulo de respuesta ultrarrápida y triaje de intención en tiempo real, orientado a despliegues en el borde (edge AI) con un consumo de VRAM estimado por el autor de unos 1,9 GB. El modelo conserva la arquitectura transformer densa del Qwen2.5-3B original, con 3.085.938.688 parámetros totales, y se distribuye tanto en safetensors como en GGUF.

El modelo resuelve el problema de disponer de un componente ligero que responda con baja latencia a tareas de clasificación de intención y generación conversacional breve, dentro de una arquitectura de agentes o pipelines donde un modelo mayor se reserva para razonamiento profundo. Su relevancia radica en el enfoque "fast-reflex": un modelo pequeño que actúa como primera capa de decisión antes de derivar a modelos más costosos.

La información publicada por el autor es escasa: no se detallan volúmenes de entrenamiento, composición del dataset ni resultados de benchmarks. El modelo está etiquetado para portugués e inglés y su licencia deriva de la Qwen License, con restricciones de uso no comercial según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (mencionado en tags); niveles concretos no disponibles |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Qwen Research License (qwen-research), uso no comercial segun model card |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer denso con atención causal estándar y 3.085.938.688 parámetros. No se ha publicado información sobre el proceso de ajuste fino: se desconoce el número de tokens utilizados, la composición del dataset, si se emplearon técnicas de RLHF, DPO o SFT supervisado, y si se aplicaron innovaciones como decodificación especulativa o atención lineal. La model card únicamente describe el propósito del modelo (respuesta ultrarrápida y triaje de intención) sin detallar la metodología de entrenamiento.

Los tags del repositorio indican que el ajuste está orientado a despliegue en el borde ("edge-ai") y que se ofrecen pesos en GGUF, lo que sugiere una preparación para inferencia en hardware limitado mediante llama.cpp u otros runtimes compatibles. No hay información pública sobre la composición del corpus de ajuste ni sobre el uso de datos sintéticos o destilación desde un modelo mayor.

## Capacidades

- Generación de texto conversacional en portugués e inglés.
- Triaje de intención y respuesta ultrarrápida, según la descripción del autor.
- Clasificación y enrutamiento en pipelines de agentes (primera capa de decisión).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-step y capacidades de agente autónomo: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Capacidades matemáticas y de código: no documentadas específicamente para este ajuste.

## Casos de uso

- Triaje de intención en asistentes conversacionales: el modelo actúa como primera capa que clasifica la consulta del usuario y decide si responder directamente o derivar a un modelo mayor, reduciendo coste y latencia en el pipeline.
- Respuesta ultrarrápida en atención al cliente: con un consumo estimado de 1,9 GB de VRAM, puede desplegarse en servidores modestos o dispositivos de borde para respuestas inmediatas en portugués e inglés.
- Enrutamiento en sistemas multiagente: clasifica la petición entrante y la asigna al agente o herramienta adecuada dentro de una arquitectura orquestada.
- Preprocesamiento en aplicaciones de borde: su tamaño reducido y los pesos GGUF permiten ejecutarlo en hardware con recursos limitados para tareas de clasificación y respuesta breve.
- Filtrado y moderación preliminar: puede evaluar mensajes entrantes y decidir si requieren revisión adicional por un modelo mayor o por un sistema de moderación dedicado.
- Prototipado rápido de asistentes en portugués: sirve como base ligera para validar flujos conversacionales antes de escalar a modelos de mayor tamaño.
- Capa de "fast reflex" en arquitecturas de dos niveles: responde consultas simples de forma inmediata y reserva el modelo grande para consultas complejas, optimizando el uso de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB según la model card del autor (presumiblemente en cuantización de baja precisión; el nivel exacto no se especifica).
- En precisión completa (BF16), los 3.085.938.688 parámetros requerirían del orden de 6 GB de VRAM; el tamaño del repositorio (6,2 GB) es coherente con esta estimación.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores en cuantizaciones bajas.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4-8 bits; en BF16 requiere al menos 6 GB de VRAM.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (por ejemplo Ollama o LM Studio) para los pesos cuantizados; vLLM o TGI para los pesos safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KuroReflex-3B | 3.085.938.688 | no disponible | Qwen Research (no comercial) | Hugging Face |
| Qwen2.5-3B-Instruct | 3.085.938.688 | 32.768 tokens (modelo base) | Qwen Research | Hugging Face |
| Llama 3.2 3B Instruct | ~3.200 millones | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| Phi-3.5-mini | ~3.800 millones | 128.000 tokens | MIT | Hugging Face |

La comparativa con Qwen2.5-3B-Instruct es directa por ser su modelo base; las diferencias se limitan al ajuste fino y a la orientación a triaje. Frente a Llama 3.2 3B y Phi-3.5-mini, KuroReflex-3B ofrece un tamaño similar pero con una licencia más restrictiva (no comercial) y sin datos públicos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia Qwen Research: uso restringido a investigación y no comercial según la model card; verificar los términos completos antes de cualquier despliegue en producción.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa del rendimiento del ajuste frente al modelo base.
- Idiomas limitados a portugués e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de 3B parámetros, especialmente en tareas de razonamiento complejo.
- Sesgos: no se ha publicado información sobre evaluación de sesgos ni sobre la composición del dataset de ajuste.
- Contexto: no se especifica la longitud de contexto soportada por el ajuste; se desconoce si se conserva la ventana del modelo base.
- Soporte de tool calling y agentes no confirmado: no debe asumirse sin validación previa.
- Modelo con cero descargas y cero likes en el momento de la ficha: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroReflex-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
