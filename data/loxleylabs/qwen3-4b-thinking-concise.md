# LoxleyLabs/Qwen3-4B-Thinking-Concise

## Resumen

Qwen3-4B-Thinking-Concise es un modelo de lenguaje de 4.022 millones de parámetros derivado de Qwen/Qwen3-4B-Thinking-2507 mediante edición de pesos. Lo desarrolla Loxley Labs (Douglas Lund) y su objetivo es eliminar el hábito de deliberación extensa del modelo original: en lugar de generar largos bloques de razonamiento antes de responder, produce respuestas directas en una fracción de los tokens. Técnicamente no es un fine-tuning ni una destilación, sino una resta de pesos: el autor identifica una "pieza" P (un subconjunto de 252 matrices de bajo rango más 47 tensores completos) que, según un score de primer orden, es la que más contribuye a la deliberación, y la sustrae del modelo base (D = Thinking − P).

El resultado es un modelo que conserva buena parte de la capacidad de razonamiento del Thinking original en tareas de lógica de dificultad media, pero con respuestas mucho más cortas: la mediana de tokens por respuesta baja de 2.868 a 362 en el conjunto de seis tareas de BIG-Bench Hard. El paquete publicado incluye además la pieza eliminada, dos routers que deciden cuánto de P reinyectar por pregunta y el arnés de evaluación completo, lo que lo convierte tanto en un modelo desplegable como en un artefacto de investigación reproducible sobre separación de habilidad y hábito en modelos de razonamiento.

La relevancia actual es doble: por un lado, ofrece una alternativa de 4B con licencia Apache-2.0 y formato GGUF lista para inferencia local eficiente; por otro, documenta un método de edición de pesos que permite ajustar el trade-off entre latencia y precisión sin reentrenar. Las limitaciones son explícitas en la propia model card: es peor que Thinking en puzles difíciles con presupuesto de tokens amplio y peor que Instruct en matemáticas difíciles y en seguimiento de instrucciones estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B; sin cambios estructurales) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero la cifra exacta no se especifica) |
| Tipos de cuantizacion | bf16, Q8_0, Q4_K_M (publicadas); cuantizaciones adicionales via llama.cpp no documentadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (bf16, Q8_0, Q4_K_M); pieza eliminada en safetensors (bf16, factores de bajo rango) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3-4B sin modificar su topología. No hay entrenamiento en el sentido habitual: el proceso es una edición de pesos por resta. El autor calcula un score de primer orden que mide la contribución de cada peso a la deliberación (la generación de bloques de pensamiento), selecciona las 252 matrices que se aproximan bien con factores de bajo rango y 47 tensores completos que forman la pieza P, y publica D = Thinking − P. La pieza P se distribuye como safetensors de 2,17 GB, junto con scripts (`apply_piece.py`) para reconstruir el modelo original o reinyectar fracciones de P mediante un parámetro beta (Thinking + (beta − 1)·P).

Sobre esa base, el autor entrena dos routers pequeños (uno por pool de entrenamiento) que, dada una pregunta, predicen cuánto de P conviene reinyectar para equilibrar precisión y longitud de respuesta. El paquete incluye los vectores de pregunta, las etiquetas y los scripts de scoring. No se documenta en la información disponible el volumen de tokens de entrenamiento (no hay preentrenamiento propio), la composición del dataset de los routers ni si hubo RLHF o DPO; el modelo base Qwen3-4B-Thinking-2507 sí los incorpora, pero sus detalles no se reproducen aquí. La innovación técnica destacable es el propio método de edición: separar "habilidad" de "hábito" en el espacio de pesos y ofrecer un dial continuo entre ambos extremos.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento lógico en tareas de dificultad media: retiene 14,4 de los 20 puntos de ventaja de Thinking sobre Instruct en seis tareas de BIG-Bench Hard (expresiones booleanas, falacias formales, deducción lógica con cinco objetos, web of lies, seguimiento de objetos barajados y comprensión de fechas).
- Razonamiento matemático: iguala a Instruct en el subconjunto de MATH-500 con tope de 8.192 tokens (86 frente a 86), aunque queda por debajo en matemáticas difíciles (nivel 5) con presupuesto amplio.
- Respuestas concisas: no emite bloque de pensamiento cerrado en las 2.380 respuestas evaluadas; la mediana de tokens es de 362 frente a 2.868 de Thinking.
- Reinyección selectiva de deliberación mediante routers: permite recuperar parte de la capacidad de Thinking por pregunta.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no documentado explícitamente para este derivado; el modelo base Qwen3-4B-Instruct-2507 lo soporta, pero no se confirma aquí.
- Modo thinking: ausente por diseño (se ha eliminado el hábito de deliberar); puede recuperarse parcialmente con la pieza P y los routers.

## Casos de uso

- Atención al cliente automatizada: al no generar bloques de razonamiento largos, la latencia por turno se reduce de forma drástica (mediana de 362 tokens frente a 2.868), lo que abarata conversaciones multi-turno en producción y mejora la experiencia en respuestas directas.
- Clasificación y extracción de información en pipelines: con MMLU de 66,8 en modo de un solo token, es adecuado para tareas de respuesta corta y etiquetado donde la deliberación es contraproducente y el coste por inferencia importa.
- Razonamiento lógico de dificultad media en asistentes técnicos: conserva el 72 % de la ventaja de Thinking sobre Instruct en seis tareas de BBH, útil para validación de reglas, detección de falacias o deducción sobre datos estructurados.
- Despliegue en hardware de consumo: con cuantización Q4_K_M (2,50 GB) o Q8_0 (4,28 GB) en GGUF, cabe en GPUs consumer y en CPU, lo que permite prototipado local y aplicaciones de escritorio sin GPU dedicada.
- Investigación sobre edición de modelos: el paquete incluye la pieza P, los routers y el arnés de evaluación, lo que permite reproducir el experimento, estudiar la separación habilidad/hábito y probar variantes de reinyección con el parámetro beta.
- Generación de código y matemáticas de nivel medio: con MATH-500 a 86 puntos con tope de 8.192 tokens, sirve para asistentes de resolución de problemas y explicaciones paso a paso breves en entornos educativos.
- Enrutado adaptativo en sistemas multi-modelo: los routers publicados pueden usarse como clasificadores de dificultad para decidir cuándo escalar a un modelo mayor o reinyectar deliberación, reduciendo coste medio en arquitecturas de cascada.

## Benchmarks y rendimiento

Datos de la model card. Los conjuntos son subconjuntos, no ejecuciones completas; se indica el número de ítems. Las filas de 32.768 tokens promedian dos ejecuciones por pregunta.

| Test | Items | Tope de respuesta | Instruct | Thinking | D (este modelo) |
|---|---|---|---|---|---|
| BIG-Bench Hard, seis tareas | 90 | 8.192 | 75,6 | 95,6 | 90,0 |
| Mediana de tokens por respuesta | — | — | 530 | 2.868 | 362 |
| MATH-500 (subconjunto) | 50 | 8.192 | 86 | 64 | 86 |
| MATH difícil (nivel 5) | 96 | 32.768 | 85,4 | 90,1 | 79,2 |
| Lógica difícil, cuatro tipos de puzle | 200 | 32.768 | 77,8 | 92,5 | 80,5 |
| MMLU | 500 | un token | 69,2 | 64,8 | 66,8 |
| IFEval, prompt estricto | 200 | 1.536 | 73,0 | 66,0 | 69,5 |

Notas de la model card: en las seis tareas de BBH el modelo conserva 14,4 de los 20 puntos de ventaja de Thinking sobre Instruct, con respuestas 7,9 veces más cortas en la mediana. En los puzles difíciles de 32.768 tokens conserva solo 2,7 de los 14,7 puntos de ventaja, y esa ventaja se concentra en puzles de lenguajes de Dyck (Thinking 70, D 30, Instruct 17 sobre 50 preguntas). En MATH difícil queda 10,9 puntos por debajo de Thinking. En MATH-500 con tope de 8.192 tokens, Thinking agotó tokens en 15 de 50 problemas y alcanza 91 con tope de 32.768; Instruct en su propio formato de chat obtiene 92 en ese subconjunto y 82,5 en IFEval, por encima de D en ambos casos (la diferencia en MATH, 6 puntos sobre 50 problemas, está dentro del ruido; la de IFEval, 13 puntos sobre 200, no). La media de longitud de respuesta de D es entre 5,0 y 6,3 veces menor que la de Thinking en los cuatro conjuntos de la prueba de 32.768 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,05 GB en bf16 (pesos) más overhead de contexto; unos 4,28 GB en Q8_0 y 2,50 GB en Q4_K_M, a los que hay que sumar la caché KV según longitud de contexto.
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo y concurrencia; RTX 4090, RTX 3090 o RTX 4080 para bf16 o Q8_0 en un solo dispositivo.
- Cabe en GPU consumer: sí. En Q4_K_M (2,50 GB) funciona en GPUs de 6-8 GB de VRAM; en Q8_0 (4,28 GB) en GPUs de 8 GB o más; en bf16 requiere 12 GB o más para dejar margen a la caché KV.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa por el formato GGUF; vLLM y TGI requieren convertir a safetensors o usar el formato original de Qwen3. Los scripts incluidos (`apply_piece.py`) permiten reconstruir el modelo base o generar variantes con reinyección parcial.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia indirecta, la mediana de tokens generados es 7,9 veces menor que la de Thinking en BBH, lo que reduce proporcionalmente el tiempo de decodificación a igualdad de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BBH (6 tareas) | MATH-500 | IFEval | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-Thinking-Concise | 4,02B | no disponible | 90,0 | 86 | 69,5 | Apache-2.0 | GGUF |
| Qwen3-4B-Thinking-2507 | 4,02B | no disponible | 95,6 | 64 (8k) / 91 (32k) | 66,0 | Apache-2.0 | safetensors, GGUF |
| Qwen3-4B-Instruct-2507 | 4,02B | no disponible | 75,6 | 86 (8k) / 92 (chat) | 73,0 (propio chat) / 82,5 | Apache-2.0 | safetensors, GGUF |

La comparación se limita a los dos modelos de los que deriva, porque la información disponible no incluye otros modelos de 4B comparables con datos de benchmark en los mismos conjuntos. Frente a Thinking, este modelo sacrifica precisión en puzles difíciles y matemáticas de nivel 5 a cambio de respuestas 5-8 veces más cortas. Frente a Instruct, gana en razonamiento lógico de dificultad media (90,0 frente a 75,6 en BBH) pero pierde en seguimiento de instrucciones estricto (69,5 frente a 73,0 en el mismo prompt, y frente a 82,5 con Instruct en su propio formato de chat).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar los pesos de Qwen3-4B, arrastra los sesgos del modelo base, no evaluados en la model card.
- Riesgo de alucinación: no cuantificado. La eliminación del bloque de deliberación reduce la "autocomprobación" implícita del modo thinking, lo que puede aumentar la tasa de errores confiados en tareas que requieren verificación paso a paso.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican; las evaluaciones se hicieron con topes de 1.536, 8.192 y 32.768 tokens, pero no se confirma el máximo del modelo.
- Rendimiento degradado en tareas duras: 10,9 puntos por debajo de Thinking en MATH nivel 5 y solo 2,7 de los 14,7 puntos de ventaja en puzles difíciles de 32.768 tokens; en lenguajes de Dyck cae a 30 frente a 70 de Thinking.
- Seguimiento de instrucciones: 13 puntos por debajo de Instruct en IFEval con prompt estricto (69,5 frente a 82,5), una diferencia fuera del ruido según el autor.
- Tamaño de las evaluaciones: los conjuntos son subconjuntos pequeños (50 a 500 ítems), con errores estándar no triviales; las cifras no equivalen a ejecuciones completas de los benchmarks.
- Licencia: Apache-2.0 permite uso comercial, pero el paquete incluye la pieza P y routers bajo la misma licencia; conviene revisar NOTICE y SHA256SUMS para la atribución de Qwen.
- Caveat de producción: el modelo no emite bloque de pensamiento, por lo que no debe esperarse comportamiento de cadena de razonamiento explícita; si se necesita, hay que reinyectar P con los routers o usar el modelo Thinking original.
- Procedencia: el modelo fue producido con Claude Code y su validación se basa en el arnés del propio autor; no hay evaluación independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoxleyLabs/Qwen3-4B-Thinking-Concise
- Paper (PAPER.md en el repositorio): https://huggingface.co/LoxleyLabs/Qwen3-4B-Thinking-Concise/blob/main/PAPER.md
- Paper en la web de Loxley Labs: https://loxleylabs.net/research/separating-skill-from-habit
- PDF del paper: https://loxleylabs.net/separating-skill-from-habit-2026-11-08.pdf
- Código, resultados y comprobación de seguridad en GitHub: https://github.com/Loxleylabs33/deliberation-cut
- Modelo base Thinking: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Modelo base Instruct: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
