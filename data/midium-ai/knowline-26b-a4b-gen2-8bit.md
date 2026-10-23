# midium-ai/KnowLine-26B-A4B-Gen2-8bit

## Resumen

KnowLine-26B-A4B-Gen2-8bit es una cuantización a 8 bits en formato MLX del modelo de decisión PelaAI/KnowLine-26B-A4B-Gen2, publicada por midium-ai (Midium). No es un modelo generativo al uso: recibe un estado (contexto) y una batería de preguntas tipadas (elección entre opciones, sí/no, puntuación 0-9) y devuelve una probabilidad para cada opción mediante un softmax sobre los logits de las etiquetas, sin producir texto libre. El modelo base es un Gemma 4 26B A4B de mezcla de expertos con un LoRA fusionado, orientado a lo que el autor denomina "System One": decisiones rápidas de enrutamiento y clasificación dentro de un pipeline mayor.

La relevancia práctica de esta ficha es doble. Por un lado, cuantifica un modelo de decisión de 25.805.936.206 parámetros totales hasta 28,0 GB de pesos (frente a los 51,6 GB del original en bf16), lo que lo hace desplegable en hardware mucho más modesto. Por otro, el autor documenta una evaluación de fidelidad frente al bf16 pregunta a pregunta, con acuerdos del 94,0-100 % en la respuesta top y una distancia de variación total media de como máximo 0,027 por conjunto, lo que permite valorar el coste real de la cuantización en una tarea donde la calibración de probabilidades importa más que la perplejidad.

Conviene subrayar que este checkpoint no funciona con cargadores genéricos de generación de texto de MLX: conserva el protocolo de decisión del modelo fuente (un prefill por pregunta y softmax en fp32 sobre los logits de las etiquetas) y requiere un runtime que lo implemente, como el System One de Midium. La licencia es Apache-2.0, igual que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) Gemma 4 26B A4B, con LoRA fusionado en el modelo base; cuantización MLX affine de 8 bits |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | 4 B aproximados según la denominación "A4B" del modelo base (no confirmado de forma explícita en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits affine, group size 64, round-to-nearest sin datos de calibración; torre de visión y `final_logit_softcapping` (24.0) sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (28,0 GB; el fuente bf16 ocupa 51,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 26B A4B, es decir, un transformer con mezcla de expertos de 25,8 B de parámetros totales y aproximadamente 4 B activos por token, sobre el que PelaAI aplicó un LoRA que quedó fusionado en los pesos. Sobre esa base, KnowLine se entrena y configura como modelo de decisión: en lugar de generar tokens de respuesta, el runtime hace un único prefill por pregunta y calcula un softmax en fp32 sobre los logits de los tokens de etiqueta de cada opción, siguiendo el protocolo `knowline_server.py` del autor (equivalente a `--enable-fp32-lm-head` de SGLang). La temperatura de lectura está plegada en la normalización final y el `final_logit_softcapping` se mantiene en 24.0.

Esta publicación es exclusivamente una cuantización: no hay reentrenamiento ni datos nuevos. El proceso aplica cuantización affine de 8 bits con group size 64 y redondeo al más cercano, sin conjunto de calibración, únicamente sobre el modelo de lenguaje. Se preservan intactos la torre de visión, el tokenizador, la plantilla de chat y la configuración de decisión. La evaluación de fidelidad se hizo con el mismo runtime y las mismas peticiones que el bf16, sobre muestras con semilla de hasta 150 preguntas por conjunto.

## Capacidades

- Decisión por elección múltiple: devuelve una probabilidad por cada opción de un conjunto cerrado, sin generar texto.
- Preguntas de sí/no y de puntuación en escala 0-9, útiles para umbrales y ranking.
- Enrutamiento de consultas y selección de modelo o herramienta (tool preselection) dentro de un agente.
- Verificación de respuestas (reply checks) y control de calidad de salidas de otro modelo.
- Robustez documentada frente a reordenación de opciones y erratas en el enunciado (evaluada en los conjuntos públicos del autor).
- Clasificación de intención en espacio amplio: los conjuntos públicos incluyen elección entre 150 intenciones.
- Conserva la torre de visión del modelo base, aunque la información disponible no detalla qué tareas visuales admite el protocolo de decisión.
- No soporta generación de texto libre, tool calling generativo ni razonamiento multi-paso autónomo por sí mismo: es un componente de decisión dentro de un sistema mayor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de peticiones en una plataforma de agentes: dada la consulta del usuario y el catálogo de herramientas disponibles, el modelo puntúa cada herramienta y el orquestador elige la de mayor probabilidad, con una sola pasada de prefill por consulta.
- Preselección de modelo en un gateway de inferencia: clasificar cada petición entre modelos baratos y caros según dificultad, usando las probabilidades como señal calibrada en lugar de un umbral heurístico.
- Guardarraíles de salida: comprobar si la respuesta de un LLM generativo cumple criterios tipados (¿es fiel al contexto?, ¿contiene datos personales?, ¿es coherente?) y bloquear o regenerar cuando la probabilidad cae por debajo de un umbral.
- Clasificación de intención en atención al cliente: elegir entre un conjunto amplio de intenciones (la evaluación pública cubre 150) para enrutar el ticket al flujo o al equipo correcto.
- Puntuación y ranking de candidatos: ordenar respuestas, resúmenes o variantes de copy con una escala 0-9 en una sola llamada, sin coste de decodificación autoregresiva.
- Detección de consultas ambiguas: preguntas de sí/no encadenadas ("¿faltan datos para responder?", "¿la pregunta es de facturación?") para decidir si se pide aclaración al usuario antes de invocar un modelo caro.
- Evaluación offline de pipelines: sustituir anotadores humanos en comprobaciones de regresión, aprovechando que el modelo devuelve distribuciones comparables y no texto que requiera parseo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una evaluación de fidelidad de la cuantización frente al modelo bf16, con el mismo runtime y las mismas peticiones:

| Conjunto | Preguntas | Coincidencia en la respuesta top con bf16 | Cambio de accuracy por conjunto | Respuestas perdidas / ganadas |
|---|---:|---:|---:|---:|
| 14 conjuntos de decisión (routing, reply checks, preselección de herramientas, enrutamiento de modelo) | 2.058 | 98,6-100 % | -0,7 a +1,3 pts | 3 / 4 |
| Conjuntos públicos: elección entre 150 intenciones, puntuaciones 0-9, robustez a reordenación de opciones y erratas | 1.720 | 94,0-100 % | -0,7 a +2,0 pts | 5 / 8 |

Distancia de variación total media entre las distribuciones de respuesta de 8 bits y bf16: como máximo 0,027 por conjunto. No hay datos de latencia ni de throughput publicados.

## Requisitos de hardware

- VRAM/unified memory estimada para inferencia: en torno a 28 GB solo para pesos, más overhead de activaciones, KV cache y la torre de visión; presupuesto realista de 32 GB o más.
- Al ser un checkpoint MLX, el destino natural es Apple Silicon con memoria unificada: 32 GB es el mínimo ajustado, 48-64 GB es lo recomendable para trabajar con margen.
- En GPU discretas no hay soporte documentado de este checkpoint; los 28 GB exceden los 24 GB de una RTX 4090, por lo que en todo caso requeriría A100 40 GB, H100 o reparto entre varias GPU.
- Despliegue: runtime System One de Midium (`POST /v1/systemone`), que carga el checkpoint directamente. Los cargadores genéricos de generación de texto de MLX no son compatibles porque no implementan el protocolo de etiquetas.
- vLLM, llama.cpp, Ollama y TGI no están soportados para este checkpoint; el modelo fuente bf16 se sirve con SGLang y `--enable-fp32-lm-head` según la documentación del autor.
- Latencia y throughput: no disponibles. Por diseño, cada pregunta requiere un único prefill y no hay decodificación autoregresiva, lo que en la práctica sitúa el coste muy por debajo de un modelo generativo del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| midium-ai/KnowLine-26B-A4B-Gen2-8bit | 25,8 B totales / ~4 B activos | no disponible | safetensors MLX 8 bits (28,0 GB) | Apache-2.0 | HuggingFace, requiere runtime System One |
| PelaAI/KnowLine-26B-A4B-Gen2 (fuente) | 25,8 B totales / ~4 B activos | no disponible | safetensors bf16 (51,6 GB) | Apache-2.0 | HuggingFace, runtime System One o SGLang |
| Gemma 4 26B A4B genérico | 25,8 B totales / ~4 B activos | no disponible | safetensors | licencia de Gemma (no verificada en la información disponible) | HuggingFace |
| Otros modelos de decisión o clasificadores dedicados de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo fuente: la versión 8 bits reduce el peso de 51,6 GB a 28,0 GB con una coincidencia en la respuesta top del 94,0-100 % y un desplazamiento de accuracy de entre -0,7 y +2,0 puntos según el conjunto. No se dispone de datos para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que espere una respuesta en lenguaje natural necesita otro modelo; aquí solo hay distribuciones de probabilidad sobre opciones predefinidas.
- Dependencia fuerte del runtime: sin el protocolo de etiquetas de KnowLine (softmax en fp32 sobre los logits de las etiquetas, un prefill por pregunta) los resultados no son válidos; los loaders MLX estándar no sirven.
- La cuantización introduce desviaciones medibles: hasta un 6 % de pérdida de coincidencia en la respuesta top en el peor conjunto público y un cambio de accuracy de hasta +2,0 puntos (no direccional). Los conjuntos con muchas opciones (150 intenciones) son los más sensibles.
- No hay benchmarks estándar publicados, ni datos de contexto máximo ni de idiomas soportados; la evaluación del autor es de fidelidad frente al bf16, no de calidad absoluta frente a otros modelos.
- Sesgos: no documentados en la información disponible; al derivar de un Gemma 4, hereda los sesgos del modelo base y de los datos de entrenamiento de PelaAI, que tampoco se detallan.
- Riesgo de calibración: las probabilidades son utilizables como señal, pero la temperatura de lectura y el softcapping (24.0) están fijados; recalibrar por conjunto puede ser necesario antes de fijar umbrales en producción.
- La torre de visión se mantiene sin cuantizar, pero la información disponible no especifica el rendimiento ni el protocolo exacto para entradas multimodales.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un despliegue comercial.
- Modelo con 0 descargas y 2 likes en el momento de la consulta: ecosistema y soporte comunitario mínimos.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo, por lo que no hay documentación externa independiente que valide las afirmaciones de la model card.

## Enlaces

- [midium-ai/KnowLine-26B-A4B-Gen2-8bit en HuggingFace](https://huggingface.co/midium-ai/KnowLine-26B-A4B-Gen2-8bit)
- [Modelo base: PelaAI/KnowLine-26B-A4B-Gen2](https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2)
- [Revisión del modelo base utilizada: 284787c8b35c7d01da431be44ec3782db16a0704](https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2/tree/284787c8b35c7d01da431be44ec3782db16a0704)
- [Midium (runtime System One)](https://midium.dev)
- No se han encontrado papers, blogs ni repositorios adicionales en la búsqueda web realizada.
