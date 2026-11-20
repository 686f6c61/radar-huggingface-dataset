# inclusionAI/LemonDecider

## Resumen

LemonDecider 4B es un modelo especializado en la toma de decisiones tipadas (typed decisions) desarrollado por inclusionAI. A diferencia de los modelos generativos convencionales, no produce flujos de tokens de respuesta, sino que devuelve probabilidades sobre opciones nombradas, probabilidades sí/no (denominadas `noul`) o puntuaciones ordinales a partir de un estado de entrada (texto o JSON estructurado) y una pregunta concreta. Está construido sobre el backbone híbrido de Qwen/Qwen3.5-4B, con 4.539.918.336 parámetros totales, y añade una cabeza de lectura de decisión con capacidad para hasta 255 opciones.

El modelo resuelve un problema específico: convertir tareas de clasificación, enrutamiento y juicio en una interfaz unificada de decisión con salidas calibradas, evitando la generación autoregresiva y sus problemas asociados (deriva, formato inconsistente, coste de decodificación). Cada pregunta se procesa de forma independiente, reteniendo el estado completo y las opciones, sin truncar la entrada, con una capacidad de 8.192 tokens por pregunta (incluyendo la plantilla renderizada).

Es relevante ahora porque propone un patrón alternativo a los LLM generativos para pipelines de decisión en producción: menor latencia, salidas estructuradas nativas y probabilidades calibradas (temperatura escalar de 0,835655 aplicada por el runtime incluido). La licencia Apache 2.0 y el empaquetado autocontenido (sin necesidad de descargar el modelo base por separado) facilitan su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone híbrido Qwen3.5-4B con cabeza de lectura de decisión de 255 opciones; capas de atención completa periódicas no causales y capas recurrentes híbridas; SDPA |
| Parametros totales | 4.539.918.336 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens por pregunta, incluyendo la plantilla renderizada; sin truncamiento de entrada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; posprocesamiento de probabilidades en FP32) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards), tokenizer.json, model.safetensors.index.json; código custom con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte del backbone híbrido de Qwen3.5-4B, que combina capas de atención completa periódicas no causales con capas recurrentes híbridas, usando SDPA como implementación de atención. Sobre ese backbone se añade una cabeza de lectura de decisión en posición de marcador, que produce distribuciones sobre hasta 255 opciones por pregunta. Cada forward procesa una única pregunta, y el runtime incluido aplica una temperatura escalar calibrada de 0,835655 sobre las probabilidades, con posprocesamiento en FP32. El paquete serializa 724 tensores en dos ficheros safetensors y se carga mediante `LemonDeciderForDecisionClassification` con `trust_remote_code=True`.

El entrenamiento se organiza en dos etapas de supervisión. La primera establece capacidades generales de decisión con aproximadamente 1,20 millones de ejemplos de decisión/QA que cubren tareas `choice`, `noul` y `score`, abarcando categorías como enrutamiento de intención y selección de acciones, juicio lingüístico (sentimiento, inferencia, factualidad, paráfrasis), conocimiento y razonamiento (QA, sentido común, lógica, aritmética), recuperación y selección de candidatos, juicios de preferencia y calidad, y juicios probabilísticos y ordinales. La segunda etapa refina sobre un corpus incremental de 35.467 ejemplos construido de forma consciente del modelo: las respuestas incorrectas se convierten directamente en candidatos de entrenamiento, y las correctas se amplían con una pregunta o paso de razonamiento adicional, o con una condición extra, para generar variantes más difíciles. La actualización final se consolida en pesos completos con posprocesamiento de probabilidades calibrado, sin adaptadores separados.

## Capacidades

- Decisión tipada sobre opciones nombradas: devuelve probabilidades sobre hasta 255 opciones (`choice`) sin generar tokens de respuesta.
- Juicio binario probabilístico: salida `noul` con probabilidad sí/no para preguntas de verificación.
- Puntuación ordinal: salida `score` para valoraciones graduadas.
- Entrada multimodal de texto y JSON estructurado como estado de la decisión.
- Procesamiento de preguntas independientes: cada pregunta recibe el estado completo y las opciones, sin truncamiento.
- Relectura configurada de entradas cortas dentro de la secuencia de entrada (estrategia de serving).
- Enrutamiento de intención, clasificación, selección de acciones y de candidatos.
- Juicios de sentimiento, inferencia, factualidad y paráfrasis.
- QA de conocimiento, sentido común, lógica y aritmética como tareas de decisión.
- Juicios de preferencia, calidad de respuesta y comparaciones ordenadas.
- Soporte de tool calling / function calling: no disponible como capacidad generativa; la selección de herramientas puede expresarse como decisión tipada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el modelo decide, no planifica secuencias.
- Capacidades multilingües: limitadas a inglés y chino.
- Modo thinking, visión y audio: no disponibles.

## Casos de uso

- Enrutamiento de intención en atención al cliente: el modelo recibe el turno del usuario como estado y un conjunto de intenciones nombradas como opciones, y devuelve la distribución de probabilidad sobre ellas. La ventana de 8.192 tokens por pregunta permite incluir historial de conversación sin truncar, y la salida calibrada permite aplicar umbrales de confianza para escalar a un humano.
- Clasificación de tickets y triaje: con la salida `choice` sobre categorías predefinidas y la salida `score` para prioridad, se puede construir un pipeline que asigne cola y severidad en una sola pasada por pregunta, con latencias registradas de mediana 102,6 ms en el entorno de evaluación en proceso.
- Selección de herramientas en un agente: dado un estado JSON con el contexto de la tarea y una lista de herramientas como opciones, el modelo devuelve la probabilidad de cada herramienta. Es adecuado porque evita la generación de JSON malformado y produce directamente una distribución utilizable para políticas de selección.
- Filtrado y ranking de candidatos en recuperación: con la salida `noul` o `score`, se puede puntuar la relevancia de documentos o respuestas candidatas frente a una consulta, usando el estado completo sin truncamiento para consultas largas.
- Evaluación automática de calidad de respuestas: la salida `score` ordinal permite calificar respuestas generadas por otros modelos en dimensiones como factualidad o adecuación, con probabilidades calibradas que facilitan el agregado estadístico.
- Verificación de factualidad y paráfrasis: la salida `noul` responde a preguntas binarias del tipo "¿la afirmación se sigue del contexto?", útil en pipelines de control de alucinaciones sobre salidas de otros modelos.
- Moderación y juicio de sentimiento: clasificación de sentimiento y juicios de adecuación con opciones nombradas, integrable en sistemas de moderación que requieren decisiones auditables con probabilidad asociada.

## Benchmarks y rendimiento

Los resultados publicados corresponden al Decision Index, edición 0.3, ejecución local de desarrollo completada el 2026-11-16, sobre 140.178 peticiones puntuables en 43 benchmarks (140.620 peticiones totales, 442 excluidas oficialmente). El scorer registró `complete: true` con 140.099 ok, 79 no soportadas y 0 errores. El autor advierte que no es una aceptación oficial de leaderboard ni una evaluación completa nueva del paquete BF16 publicado.

| Metrica | Valor |
|---|---|
| Decision Index (habilidad balanceada) | 63,78 |
| Índice bruto | 72,09 |
| Habilidad de amplitud (breadth skill) | 62,87 |
| Latencia por petición: mediana / media / p95 | 102,6 / 342,5 / 1121,6 ms |

| Area | Raw | Skill | Cobertura | Benchmarks |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 0,5797 | 0,4639 | 0,9992 | 11 |
| Language Understanding | 0,7866 | 0,7004 | 1,0000 | 9 |
| Retrieval & Classification | 0,7883 | 0,7314 | 0,9926 | 6 |
| Tools & Automation | 0,7516 | 0,7299 | 0,9926 | 5 |
| Arts & Human Taste | 0,7253 | 0,5701 | 0,9967 | 6 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Las latencias registradas provienen de la ejecución de evaluación en proceso, no de un benchmark de despliegue HTTP ni de una certificación en GPU única.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 y 4.539.918.336 parámetros, se requieren aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV/estado recurrente; el repo ocupa 45,4 GB en total (incluye artefactos adicionales). No se publican cifras oficiales de VRAM.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16-24 GB de VRAM en BF16 es el mínimo razonable, y A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: el paquete incluye `model.py` como punto de entrada Python, CLI y HTTP, y `decision_runtime.py` para preparación de entrada y respuestas tipadas. Requiere Python 3.12, PyTorch 2.9.0 (build con acelerador) y Transformers 5.17.0, con `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 102,6 ms, media de 342,5 ms y p95 de 1121,6 ms por petición en la ejecución de evaluación en proceso; no hay datos de throughput en producción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. A continuación se comparan características estructurales con alternativas plausibles de la misma categoría (clasificación/decisión sobre base de ~4B).

| Modelo | Parametros | Contexto | Enfoque de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LemonDecider 4B | 4.539.918.336 | 8.192 tokens por pregunta | Probabilidades tipadas sobre hasta 255 opciones, `noul`, `score` | Apache 2.0 | Hugging Face, paquete autocontenido |
| Qwen3.5-4B (base) | ~4B (no confirmado) | no disponible | Generación autoregresiva de texto | no disponible | Hugging Face |
| Clasificadores BERT/RoBERTa de ~4B | ~4B | típicamente 512-8.192 tokens | Logits de clasificación con etiquetas fijas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (Decision Index u otros) para estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre datos de decisión/QA, puede heredar sesgos de esas fuentes y del backbone Qwen3.5-4B.
- Riesgo de alucinación: el modelo no genera texto, por lo que la alucinación se manifiesta como decisiones incorrectas con alta confianza; la calibración (temperatura 0,835655) mitiga pero no elimina este riesgo.
- Limitaciones de contexto: 8.192 tokens por pregunta, incluyendo la plantilla renderizada; aunque no se trunca la entrada, las entradas que excedan ese límite no son procesables.
- Limitaciones de idioma: solo inglés y chino; no hay soporte declarado de castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True` y código custom, lo que implica revisión de seguridad del código remoto antes de producción.
- Dependencias estrictas de runtime: Python 3.12, PyTorch 2.9.0 con build de acelerador y Transformers 5.17.0; versiones distintas pueden no ser compatibles.
- Los resultados del Decision Index son de desarrollo local, no de leaderboard oficial ni de una evaluación completa del paquete BF16 publicado; las latencias no son una certificación de despliegue.
- El paquete no incluye datos de entrenamiento, predicciones crudas, entradas de benchmark ni logs internos, lo que limita la reproducibilidad.
- Una pregunta por forward: el procesamiento independiente de preguntas puede multiplicar el coste si se evalúan muchas preguntas sobre el mismo estado.
- Solo modalidades texto y JSON estructurado; sin visión, audio ni generación libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/LemonDecider
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
