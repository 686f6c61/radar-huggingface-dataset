# BolaNash/clef

## Resumen

Clef es un modelo multimodal de 27 000 millones de parámetros desarrollado por Cloudflare que reformula la inferencia de un LLM como un problema de decisión estructurada. En lugar de generar texto libre, recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en un único forward pass, una probabilidad para cada opción permitida de cada pregunta. De este modo elimina la generación autoregresiva y el parseo de salidas, lo que simplifica su integración en pipelines de producción.

El modelo se obtiene mediante post-entrenamiento a partir de Qwen/Qwen3.8-27B, del que hereda el backbone transformer y el codificador visual, y añade una cabeza conjunta de esquema (*joint schema head*) que enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones. Está pensado para tareas de clasificación, enrutamiento, puntuación ordinal y decisiones booleanas (*noul*) donde se necesita una salida tipada, calibrada y sin ambigüedad sintáctica.

Su relevancia actual radica en que ofrece una API compatible con Jev y SystemOne, se puede servir con SGLang y encaja en arquitecturas de agentes donde la decisión debe ser determinista en formato y auditable en probabilidades. La licencia Apache-2.0 y la disponibilidad de una variante menor (Clef-Flash) facilitan su evaluación y despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen/Qwen3.8-27B con codificador visual) más cabeza conjunta de esquema (*joint schema head*) |
| Parámetros totales | 27 356 728 560 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card menciona despliegue en bf16 con SGLang) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone fragmentado con `model.safetensors.index.json`; cabeza en `joint_head.safetensors`), más código Python personalizado (`joint_schema_model.py`) |

## Arquitectura y entrenamiento

Clef parte de Qwen/Qwen3.8-27B, un transformer multimodal con codificador visual, cuyos pesos se distribuyen en safetensors fragmentados estándar. Sobre las representaciones ocultas finales del backbone se añade una cabeza conjunta de esquema: un pequeño transformer que lee dichas representaciones, enruta la evidencia relevante del estado hacia cada pregunta del esquema y puntúa simultáneamente todas las opciones de todas las preguntas. La salida es un logit por opción permitida; aplicando softmax por pregunta se obtienen probabilidades normalizadas.

El modelo se presenta como un *post-train* sobre el modelo base, orientado a producir salidas tipadas (`choice`, `score`, `noul`) en un solo paso de inferencia. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacable es la eliminación de la generación autoregresiva y del parseo posterior: la decisión se emite como distribución de probabilidad sobre un espacio de opciones cerrado y definido por el esquema de entrada.

## Capacidades

- Decisión estructurada sobre esquemas tipados: preguntas de tipo `choice` (elección entre criterios), `score` (puntuación ordinal con leyenda) y `noul` (probabilidad de verdadero/falso).
- Entrada de estado heterogénea: texto plano, JSON, imágenes (PIL) y vídeo (arrays de fotogramas), mezclables en el mismo lote.
- Salida con probabilidades calibradas por pregunta, sin texto libre ni necesidad de parseo.
- Procesamiento multimodal conjunto: texto e imagen/vídeo pueden coexistir en un mismo registro.
- API compatible con Jev y SystemOne (`POST /v1/systemone`), incluyendo respuestas con `choice`, `confidence`, `probabilities`, `score` y `legend`.
- Soporte de *batching* mixto de registros texto e imagen/vídeo en una sola llamada.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, *thinking mode*, audio ni multilingüismo explícito.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del usuario como estado y un esquema con preguntas `choice` (departamento: facturación, técnico) y `noul` (¿hay una caída de servicio?), devolviendo probabilidades por opción para asignar el ticket sin parsear texto.
- Triaje de urgencia: con una pregunta `score` de leyenda ordinal ("puede esperar", "esta semana", "hoy"), se obtiene la puntuación esperada y su confianza para priorizar colas de atención.
- Procesamiento de facturas y recibos: combinando estado JSON (campos extraídos) e imagen del documento, se responden preguntas `noul` como "¿es legible el total?" o `choice` sobre el estado del pago, útil en validación documental.
- Moderación y clasificación de contenido: dado un texto o fotograma de vídeo, se definen criterios de política y se obtiene la distribución de probabilidad sobre las categorías permitidas, con umbral configurable por el consumidor.
- Verificación de calidad en pipelines de datos: preguntas booleanas sobre registros (¿el campo está completo?, ¿el importe supera 1000 USD?) permiten filtrar lotes de forma determinista en formato y auditable en probabilidad.
- Decisión en agentes automatizados: en lugar de pedir al LLM que "elija" en texto libre, el agente consulta a Clef con un esquema cerrado y recibe una distribución que puede compararse con umbrales o combinarse con reglas de negocio.
- Análisis de vídeo para eventos concretos: con arrays de fotogramas como entrada, se responden preguntas tipadas sobre presencia de objetos o condiciones, integrable en sistemas de inspección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente enlaza al *Decision Index leaderboard* (clef-evals.workers-ai-mle.workers.dev), sin cifras reproducidas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27 356 728 560 parámetros, en bf16 los pesos ocupan aproximadamente 54,7 GB, lo que exige al menos una GPU de 80 GB para cargar el modelo completo sin cuantización.
- GPU recomendadas: la model card indica pruebas en una única H200 y comandos de despliegue para H200, B200 y B300 en el cookbook de SGLang.
- GPU de consumo: no se documenta soporte para GPU de consumo; los 55 GB de repo y el requisito de bf16 hacen inviable su carga en tarjetas de 24 GB sin cuantización, que no está descrita en la información disponible.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:dev-clef`, endpoint `/v1/systemone`), uso directo con `transformers` 5.10.2 y `torch` 2.11 mediante `joint_schema_model.load_release_model`, y la función `systemone` para peticiones compatibles con Jev/SystemOne.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño de un solo forward pass por lote sugiere menor coste que la generación autoregresiva, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef (Cloudflare) | 27,36 B | no disponible | Logits por opción tipada, sin texto libre | Apache-2.0 | Hugging Face (`BolaNash/clef`), SGLang |
| Clef-Flash (Cloudflare) | no disponible | no disponible | Igual que Clef, variante menor y más rápida | no disponible en la información | Hugging Face (`Cloudflare/clef-flash`) |
| Qwen/Qwen3.8-27B (modelo base) | 27 B (aproximado) | no disponible | Generación de texto libre | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de Clef-Flash o del modelo base en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde a las preguntas y opciones definidas en el esquema, por lo que no sirve para tareas generativas abiertas.
- La calidad de la decisión depende críticamente del diseño del esquema y de los criterios de cada opción; criterios ambiguos o solapados degradan la calibración.
- No se documentan idiomas soportados; el comportamiento multilingüe no está garantizado y debe validarse antes de usarlo en producción en castellano u otras lenguas.
- No se especifica la longitud de contexto, lo que impide planificar el tamaño máximo de estado (texto, JSON o número de fotogramas) sin pruebas empíricas.
- Riesgo de alucinación y de sobreconfianza inherente a los modelos neuronales: las probabilidades deben calibrarse y validarse con datos propios antes de usarse como umbrales automáticos.
- No se detallan sesgos conocidos ni la composición del dataset de post-entrenamiento, lo que limita la evaluación de riesgos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de código personalizado (`joint_schema_model.py`) y de versiones concretas de `transformers` (5.10.2) y `torch` (2.11), lo que puede complicar el mantenimiento.
- El despliegue requiere hardware de gama alta (H200, B200 o B300) y no se documenta cuantización para entornos con menos VRAM.
- El identificador del repositorio en Hugging Face (`BolaNash/clef`) difiere del usado en los ejemplos de la model card (`Cloudflare/clef`); conviene verificar cuál es el repositorio canónico antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BolaNash/clef
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante Clef-Flash: https://huggingface.co/Cloudflare/clef-flash
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Cookbook de SGLang para Clef: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef
