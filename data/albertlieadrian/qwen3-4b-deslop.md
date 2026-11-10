# albertlieadrian/qwen3-4b-deslop

## Resumen

qwen3-4b-deslop es un ajuste fino mediante LoRA del modelo Qwen3-4B-Instruct-2507 de Alibaba, desarrollado por Albert Lie (albertlieadrian) dentro de su proyecto de investigación SteerLab. El objetivo no es mejorar la capacidad bruta del modelo, sino reducir los vicios de escritura típicos de los asistentes conversacionales: guiones largos (em dashes), construcciones del tipo "no es X, es Y", listas de tres elementos, preguntas retóricas respondidas al momento, muletillas de transición ("signposts"), palabras de relleno ("slop words"), markdown y emojis en prosa. El resultado es un modelo que escribe en un registro más llano y humano sin necesidad de system prompt especial ni sampler modificado.

Técnicamente es un LoRA de rango 16 (alpha 32, dropout 0,05) aplicado sobre las proyecciones q, k, v, o, gate, up y down, destilado de un profesor que combina el modelo base con un system prompt de estilo plano y un sampler con backtracking al estilo Antislop (Paech et al., arXiv:2510.15061). El repositorio contiene tanto los pesos fusionados en bfloat16 (4.022.468.096 parámetros) como el adaptador LoRA en el subdirectorio `adapter/`, y una conversión GGUF Q4_K_M lista para Ollama.

La relevancia del modelo es acotada pero concreta: cuantifica y reduce de forma medible un fenómeno (el "slop" o estilo de escritura de IA) que afecta a la calidad percibida de la prosa generada, y lo hace sobre un modelo pequeño de 4B parámetros que cabe en hardware de consumo. Su licencia Apache-2.0, heredada del base, facilita su uso comercial, aunque el propio autor advierte de que el modelo es más plano, no necesariamente mejor según un juez LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA r=16 fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; bfloat16 en los pesos fusionados; el resto de cuantizaciones no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados), adaptador LoRA en `adapter/`, GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros, y le aplica un LoRA de rango 16 con alpha 32 y dropout 0,05 sobre las proyecciones q, k, v, o, gate, up y down. La pérdida se calcula únicamente sobre la respuesta del asistente, y el estudiante ve solo el prompt del usuario (sin el system prompt de estilo plano que usaba el profesor). El entrenamiento usó 557 respuestas (los temas de desarrollo quedaron fuera), 2 épocas, learning rate 2e-4 y batch de 8. La receta se eligió frente a otras dos alternativas sobre 24 prompts de desarrollo.

El proceso de destilación es el elemento diferenciador. El profesor (Qwen3-4B-Instruct-2507 con system prompt de estilo plano y un sampler con backtracking estilo Antislop) generó 3 respuestas por cada uno de 288 prompts de entrenamiento (48 temas × blog, LinkedIn, explicativo, opinión, email, reflexión), ninguno sobre los temas de evaluación. Se conservaron 608 de 864 respuestas tras filtrar por fluidez, cumplimiento de todas las comprobaciones de tarea, ausencia de estudios y estadísticas inventadas, y puntuación por debajo de la mediana humana. Posteriormente los pesos se fusionaron en el modelo base y se convirtieron a GGUF Q4_K_M con llama.cpp.

## Capacidades

- Generación de texto en inglés con estilo llano: prosa sin guiones largos, sin contrastes "no es X, es Y" (reducidos a la mitad del ratio original), sin listas de tres (a ratio similar a Wikipedia), sin markdown ni emojis en prosa.
- Escritura de piezas de opinión, reflexiones en primera persona, emails, publicaciones de blog y LinkedIn, y textos explicativos: en las pruebas, el modelo original enunciaba una posición en 1 de cada 10 piezas de opinión; este modelo lo hace en 9 de cada 10.
- Conversación multi-turno: pipeline text-generation con plantilla de chat de Qwen3 (`apply_chat_template`).
- No requiere system prompt especial ni sampler con backtracking: el comportamiento de estilo está incorporado en los pesos.
- Capacidades heredadas del base Qwen3-4B-Instruct-2507 (razonamiento, código, matemáticas, tool calling): no verificadas de forma específica en la información disponible; el quiz de 30 preguntas factuales solo confirma que no se rompió nada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Generación de contenido editorial en inglés: artículos de opinión, columnas y ensayos de 120 a 250 palabras donde se busca un registro llano y sin marcas estilísticas de IA, aprovechando que el modelo enuncia una posición temprana en 9 de cada 10 piezas.
- Redacción de emails profesionales: el modelo cumple la comprobación de saludo y longitud (entre 0,5 y 1,6 veces lo solicitado) en 47 de 48 tareas de evaluación, lo que lo hace adecuado para borradores de correo.
- Publicaciones para LinkedIn y blogs corporativos: el entrenamiento incluyó explícitamente estos formatos entre los seis tipos de tarea, con comprobaciones de ajuste específicas.
- Reflexiones en primera persona: formato incluido en el conjunto de entrenamiento y evaluado como tarea independiente.
- Sustitución de un asistente conversacional con exceso de muletillas: al no necesitar system prompt ni sampler especial, puede desplegarse directamente con Ollama (`ollama run hf.co/albertlieadrian/qwen3-4b-deslop-GGUF:Q4_K_M`) o con transformers en cualquier pipeline existente.
- Investigación sobre estilo de escritura y detección de texto generado: sirve como condición experimental controlada (modelo con slop reducido pero sin cambios de capacidad) frente al base, con métricas publicadas de deriva KL sobre prosa humana (0,11).
- Prototipado en hardware de consumo: con 4B parámetros y una cuantización Q4_K_M publicada, es viable en GPUs de gama media para pruebas de generación de prosa.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 48 prompts reservados, una muestra por prompt. La puntuación deslop es una medida ponderada de hábitos por cada 1000 palabras (el 90 % de 318 pasajes humanos puntúa 33,6 o menos, mediana 12,8). Intervalos del 95 % por bootstrap sobre prompts.

| Modelo | Deslop score | Respuestas en banda humana | EQ-Bench slop | Ajuste de tarea | Deriva KL en prosa humana | Quiz | Tasa de victoria del juez vs original |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 89,7 [76,9; 103,7] | 3 / 48 | 43,4 | 39 / 48 | 0 | 30 / 30 | n/a |
| **este modelo** | **21,5 [18,0; 25,2]** | **38 / 48** | **21,8** | **47 / 48** | **0,11** | **30 / 30** | **0,22 [0,13; 0,32]** |
| erikkannike/qwen3-4b-deslop-v4 | 9,2 [7,1; 11,6] | 47 / 48 | 5,1 | 43 / 48 | 0,16 | 30 / 30 | 0,06 [0,01; 0,14] |
| original + prompt plano + sampler con backtracking (runtime) | 13,5 [11,2; 15,9] | 47 / 48 | 14,6 | 45 / 48 | 0 | 30 / 30 | 0,13 [0,05; 0,21] |

El ajuste de tarea mide cuatro comprobaciones: una pieza de opinión enuncia una posición pronto, una reflexión va en primera persona, un email lleva saludo, y la longitud está entre 0,5 y 1,6 veces lo pedido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en bfloat16 para los 4.022 millones de parámetros; alrededor de 2,5 a 3 GB con la cuantización GGUF Q4_K_M publicada (estimación a partir del tamaño de parámetros, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 sobran para bfloat16; una GPU consumer de 8 GB o más es suficiente para Q4_K_M.
- Cabe en GPU de consumo: sí, con la cuantización Q4_K_M en GPUs de 4-8 GB de VRAM; en bfloat16 requiere al menos 8-10 GB.
- Opciones de despliegue: Ollama (comando publicado en la model card), transformers con `AutoModelForCausalLM` y `device_map="auto"`, y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo). llama.cpp para la conversión GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Deslop score | Ajuste de tarea | Deriva KL | Licencia |
|---|---|---|---|---|---|---|
| qwen3-4b-deslop (este modelo) | 4,02B | no disponible | 21,5 | 47 / 48 | 0,11 | Apache-2.0 |
| erikkannike/qwen3-4b-deslop-v4 | 4B (base Qwen3-4B) | no disponible | 9,2 | 43 / 48 | 0,16 | no disponible en la información proporcionada |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible | 89,7 | 39 / 48 | 0 | Apache-2.0 |
| Original + prompt plano + sampler con backtracking (runtime) | 4,02B | no disponible | 13,5 | 45 / 48 | 0 | Apache-2.0 |

El modelo de erikkannike reduce más los hábitos de slop (9,2 frente a 21,5) pero se aleja más del base en prosa humana (deriva KL 0,16 frente a 0,11) y falla más comprobaciones de tarea (43/48 frente a 47/48). La configuración en runtime logra una puntuación intermedia (13,5) pero exige un sampler modificado y un system prompt, lo que complica el despliegue.

## Limitaciones y advertencias

- No es mejor en todas las métricas: un juez ciego gpt-5.4-mini prefirió la respuesta del modelo original como mejor escritura en la mayoría de pares (6 victorias, 9 empates, 33 derrotas para este modelo). El mismo juez prefirió el original sobre todos los métodos de deslopping probados.
- Conserva algunos hábitos: "no X sino Y" a aproximadamente la mitad del ratio original, y listas de tres a un ratio similar al de Wikipedia.
- Solo probado en prosa inglesa corta (120 a 250 palabras). No hay validación en otros idiomas, en textos largos ni en otros dominios.
- Sigue inventando nombres propios: los emails suelen firmarse como "Alex" o "Jordan".
- El quiz de 30 preguntas factuales solo demuestra que no se rompió nada, no que no se degradara nada.
- La puntuación de hábitos no es un detector de IA; el autor prohíbe explícitamente usar el modelo para hacer pasar texto generado por escritura humana.
- Licencia Apache-2.0 heredada del base: permite uso comercial, pero conviene revisar las condiciones del modelo Qwen3-4B-Instruct-2507 del que deriva.
- Idiomas: solo inglés; no hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinación: no evaluado de forma específica más allá del filtro de estudios y estadísticas inventadas aplicado durante la destilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albertlieadrian/qwen3-4b-deslop
- Informe de investigación con todos los números y controles: https://albertlieyingadrian.github.io/steerlab/experiments/deslop/report/
- Toolkit de construcción y puntuación: https://github.com/albertlieyingadrian/steerlab (subdirectorio `packages/deslop`)
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo de referencia de Erik Markus Kannike: https://100toolkit.com/blog/deslop-model/
- Paper Antislop (Paech et al.): https://arxiv.org/abs/2510.15061
- slop-score de EQ-Bench: https://github.com/sam-paech/slop-score
- Wikipedia, Signs of AI writing: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- Conversión GGUF para Ollama: https://huggingface.co/albertlieadrian/qwen3-4b-deslop-GGUF
