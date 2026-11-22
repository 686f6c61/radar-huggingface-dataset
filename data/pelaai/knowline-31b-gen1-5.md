# PelaAI/KnowLine-31B-Gen1.5

## Resumen

KnowLine-31B-Gen1.5 es un modelo de decisión (decision model) desarrollado por PelaAI, afinado a partir de google/gemma-4-31B-it. No es un modelo generativo al uso: recibe un estado (texto o una conversación) y hasta 64 preguntas tipadas (sí/no, elegir una entre k opciones, o puntuar según una rúbrica) y devuelve, para cada una, una distribución de probabilidad sobre sus opciones mediante un único forward pass por pregunta, sin generación de texto. Se encuadra en la categoría de modelos "System One" orientados a decisiones rápidas y calibradas.

La versión Gen1.5 mantiene los pesos byte a byte idénticos a KnowLine-31B-Gen1 (un fine-tune LoRA de gemma-4-31B-it, rango 32, alpha 64, solo el modelo de lenguaje, una época, fusionado en bf16) y cambia únicamente la capa de inferencia: las peticiones cortas que caben en 3.000 tokens se siguen leyendo dos veces, mientras que las peticiones de texto de hasta 32.768 tokens se leen una sola vez con una cabecera que enumera las preguntas antes del estado. La arquitectura subyacente es un transformer denso de unos 31.270 millones de parámetros, con la torre de visión del modelo base intacta.

Su relevancia actual radica en que ofrece una interfaz de clasificación y enrutamiento con probabilidades calibradas (temperatura T = 1,44 plegada en los pesos), evaluada por terceros en el benchmark SO-Arena, donde obtuvo 70,2 puntos y quedó primero conjunto entre 19 configuraciones System One. Está publicado con licencia Apache-2.0 y pesos en safetensors/bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base google/gemma-4-31B-it), con torre de visión del modelo base; cabezal de decisión sobre tokens de etiqueta |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens para peticiones de texto con cabecera de preguntas; lectura doble para peticiones que caben en 3.000 tokens |
| Tipos de cuantizacion | bf16 (formato de publicación); FP8 no probado en carga según el autor; no se enumeran otras cuantizaciones |
| Idiomas soportados | inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, aproximadamente 63 GB) |

## Arquitectura y entrenamiento

El modelo parte de gemma-4-31B-it, un transformer denso de unos 31B parámetros, y se obtiene mediante un fine-tune LoRA (rango 32, alpha 64) aplicado únicamente al modelo de lenguaje, durante una época, con los adaptadores fusionados en los pesos bf16. La torre de visión del modelo base se conserva sin cambios y el tokenizador es el de Gemma 4 (no el de los modelos KnowLine basados en Qwen). El entrenamiento se realizó solo con texto; no se detalla en la información disponible el volumen de tokens ni la composición del dataset, ni si hubo RLHF o DPO.

La innovación de Gen1.5 no está en los pesos, sino en el servicio: las peticiones de texto cortas (hasta 3.000 tokens en una sola lectura) se procesan con doble lectura, como en Gen1; las más largas, hasta 32.768 tokens, se procesan con una única lectura precedida de una cabecera que lista las preguntas del usuario antes del estado. Además, la temperatura de lectura T = 1,44 está plegada en el peso de la normalización final y en el soft-cap de logits, de modo que las probabilidades de salida quedan calibradas sin post-procesado; el front end lee las preguntas de puntuación a temperatura efectiva 1,0 según `temperatures.json`. El despliegue de referencia usa SGLang 0.5.21 en bf16 con `serve_knowline.sh` y `knowline_server.py`.

## Capacidades

- Clasificación y decisión con probabilidades: responde hasta 64 preguntas tipadas por petición (sí/no, elección entre k opciones, puntuación por rúbrica) devolviendo una distribución sobre las opciones.
- Inferencia sin generación de texto: un forward pass por pregunta, lo que reduce latencia frente a esquemas generativos.
- Enrutamiento e intención: puntuación destacada en la dimensión de intención y routing de SO-Arena (78,2).
- Recuperación y reranking: evaluación superior a GPT-6 Sol en retrieval y reranking según SO-Arena (64,0 frente a 62,5).
- Seguridad: puntuación de 77,2 en la dimensión de safety de SO-Arena, frente a 75,3 de GPT-6 Sol.
- Procesamiento de imágenes: mantiene la torre de visión del modelo base y puntúa 69,3 en la suite pública de visión (auto-evaluación).
- Multilingüe: inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz: los clientes de Jev solo necesitan cambiar la URL base; los usuarios de otros modelos KnowLine solo cambian el nombre del modelo.
- Tool calling y agentes: no se documenta soporte explícito de function calling generativo; el modelo está orientado a decisiones de enrutamiento y selección de herramientas dentro de pipelines de agentes.

## Casos de uso

- Enrutamiento de peticiones en sistemas multiagente: dado un estado conversacional, el modelo decide con una sola pasada qué agente o herramienta debe atender la petición, gracias a su puntuación de 78,2 en intención y routing y a su capacidad de elegir entre k opciones con probabilidad calibrada.
- Filtrado de seguridad y moderación: clasificación sí/no de contenido con probabilidades calibradas (ECE en torno a 0,013-0,022), adecuada para umbrales configurables en producción.
- Reranking de resultados de búsqueda: puntuación de pares consulta-documento con una pasada por pregunta, lo que permite integrarlo en pipelines de recuperación con latencia controlada.
- Evaluación automática de respuestas con rúbrica: el modelo puntúa respuestas generadas por otros modelos según criterios definidos, aprovechando la modalidad de preguntas de puntuación y la calibración de sus probabilidades.
- Clasificación de tickets de soporte en inglés y chino: asignación de categoría, prioridad o intención mediante preguntas de elección múltiple sobre el texto del ticket, con contexto de hasta 32.768 tokens para hilos largos.
- Decisión sobre imágenes en flujos de inspección o triaje: al conservar la torre de visión, puede responder preguntas tipadas sobre una imagen y un texto asociado (por ejemplo, verificar si una captura cumple un criterio), aunque su entrenamiento fue solo con texto.
- Selección de herramientas en asistentes: dado el estado de la conversación, decidir qué función invocar entre un conjunto finito, con la ventaja de que la salida es una distribución de probabilidad y no texto libre que haya que parsear.

## Benchmarks y rendimiento

| Benchmark | KnowLine-31B-Gen1.5 | Referencia comparada |
|---|---|---|
| SO-Arena (evaluación de terceros sobre pesos Gen1) | 70,2 (primero conjunto de 19 configuraciones System One) | GPT-6 Sol: 62,5 en retrieval/reranking y 75,3 en safety |
| SO-Arena, intención y routing | 78,2 | no disponible |
| SO-Arena, retrieval y reranking | 64,0 | GPT-6 Sol: 62,5 |
| SO-Arena, safety | 77,2 | GPT-6 Sol: 75,3 |
| SO-Arena, fiabilidad de decisión (R) | 0,81 (top 4 de 18 configuraciones) | no disponible |
| Decision Index 0.3 (suite pública, auto-evaluación) | 70,50 | Gen1: 70,13; KnowLine-35B-A3B-Gen1.5: 70,72; KnowLine-26B-A4B-Gen2.5: 68,21 |
| Decision Index 0.3, lenguaje | 72,8 | Gen1: 72,0 |
| Decision Index 0.3, herramientas y agentes | 85,4 | Gen1: 84,7 |
| Decision Index 0.3, retrieval y routing | 73,2 | Gen1: 73,0 |
| Decision Index 0.3, conocimiento y razonamiento | 59,4 | sin cambios respecto a Gen1 |
| Decision Index 0.3, artes y gusto | 60,5 | sin cambios respecto a Gen1 |
| C-Eval | 82,5 | KnowLine-26B-A4B-Gen2.5: 77,9 |
| JevBench / JevBench-hard | 90,5 / 80,2 | KnowLine-26B-A4B-Gen2.5: 90,5 / 81,1 |
| Suite pública de visión (auto-evaluación) | 69,3 | no disponible |
| ECE (suite pública, método del board) | 0,013-0,022 | KnowLine-26B-A4B-Gen2.5: 0,013-0,018 |
| Brier score | 0,23-0,26 | KnowLine-26B-A4B-Gen2.5: 0,24-0,27 |

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 63 GB; SGLang reserva por defecto el 85 % de la memoria de la GPU.
- GPU recomendadas: una GPU de 96 GB como la H20, que es el entorno usado por el autor para todas las evaluaciones; también encajan A100 80 GB y H100 80 GB con margen ajustado, o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 con 24 GB, etc.) en bf16; no se documentan cuantizaciones GGUF ni versiones de menor precisión probadas.
- Opciones de despliegue: SGLang 0.5.21 en bf16 mediante `serve_knowline.sh` y `knowline_server.py`; el autor no probó FP8 en carga para este modelo.
- Latencia y throughput: no se publican cifras concretas; la arquitectura de decisión realiza un forward pass por pregunta sin generación de texto, y las peticiones cortas se leen dos veces mientras que las largas se leen una vez con cabecera de preguntas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen1.5 | 31,27B (denso) | 32.768 tokens (con cabecera) | 70,50 | Apache-2.0 | Hugging Face (PelaAI) |
| KnowLine-35B-A3B-Gen1.5 | no disponible (MoE, A3B) | no disponible | 70,72 | Apache-2.0 (según familia) | Hugging Face (PelaAI) |
| KnowLine-26B-A4B-Gen2.5 | no disponible (MoE, A4B) | no disponible | 68,21 | Apache-2.0 (según familia) | Hugging Face (PelaAI) |
| KnowLine-31B-Gen1 | 31,27B (denso) | no disponible | 70,13 | Apache-2.0 | Hugging Face (PelaAI) |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde preguntas tipadas con distribuciones de probabilidad.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de gemma-4-31B-it, puede heredar los sesgos del modelo base.
- Alucinación: el formato de salida restringido a opciones reduce el riesgo de texto inventado, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; el autor reporta ECE de 0,013-0,022 solo en la suite pública.
- Idiomas: cobertura limitada a inglés, chino simplificado y chino tradicional; no se garantiza rendimiento en castellano.
- Visión: la torre de visión es la del modelo base y no fue entrenada por PelaAI; los resultados de imagen son de auto-evaluación (69,3) y no de terceros.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base gemma-4-31B-it tiene sus propias condiciones que deben verificarse.
- Despliegue: requiere hardware de gama alta (≈63 GB de pesos en bf16); no hay cuantizaciones ligeras documentadas ni soporte probado de FP8.
- Madurez: el modelo tiene 610 descargas y 2 likes en Hugging Face, y las evaluaciones privadas del board las realizan los mantenedores, no el autor.
- Independencia: el autor declara que KnowLine no está afiliado ni respaldado por TypeSafe, Jev ni Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
- Versión anterior Gen1: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Modelo hermano KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Guía de inferencia: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5/blob/main/INFERENCE.md
- README en chino: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5/blob/main/README.zh.md
- Benchmark SO-Arena: https://lichenlillc.github.io/SO-Arena
- Paper SO-Arena: https://arxiv.org/abs/2611.15777
- Paper adicional citado en los tags: https://arxiv.org/abs/2309.06275
