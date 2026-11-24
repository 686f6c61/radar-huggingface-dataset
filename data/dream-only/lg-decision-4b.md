# dream-only/lg-decision-4B

## Resumen

lg-decision-4B es un modelo de lenguaje de 5.170 millones de parámetros (aproximadamente 5B, etiquetado como "4B" por su base) desarrollado por el usuario dream-only. Se trata de un ajuste fino supervisado de Qwen/Qwen3.5-4B orientado específicamente a tareas de decisión: clasificación, elección múltiple, reranking de recuperación y selección de herramientas. En lugar de generar texto libre, el modelo está diseñado para emitir decisiones tipadas con probabilidades calibradas sobre opciones nombradas.

La propuesta diferencial es su interfaz de inferencia: cada petición lleva un "estado" (texto o JSON) y una o varias preguntas tipadas, y el servidor devuelve para cada pregunta una distribución de probabilidad sobre opciones (`choice`), una probabilidad de sí/no (`noul`) o una distribución sobre una escala ordenada (`score`). El modelo se sirve mediante el servidor empaquetado `simple-jev`, que expone el endpoint `/v1/systemone` consumido por el kit Decision Index.

Es relevante porque aborda un patrón de uso creciente en pipelines de agentes y automatización: sustituir la generación abierta por decisiones estructuradas y puntuadas, reduciendo la necesidad de parseo y validación posterior. Su licencia Apache 2.0 y su tamaño contenido lo hacen desplegable en hardware relativamente modesto para un modelo de su clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`; transformer híbrido con 32 capas (8 de atención completa, 24 de atención lineal) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens por rama de pregunta; las peticiones más largas se rechazan con HTTP 422, no se truncan |
| Tipos de cuantizacion | no disponible (los pesos publicados están en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors`, 10.350.023.784 bytes, bf16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer con arquitectura híbrida que combina 8 capas de atención completa con 24 capas de atención lineal, lo que reduce el coste computacional en contextos largos. La clase de implementación es `Qwen3_5ForConditionalGeneration`, aunque el modelo se emplea como clasificador de decisiones más que como generador de texto. Los pesos se distribuyen en un único fichero safetensors en bf16.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO. La model card indica únicamente que es un fine-tune del modelo base y describe el mecanismo de inferencia: cada pregunta se puntúa como una rama que comparte la totalidad de la petición como prefijo, con una política de prompt fija (`PROMPT_POLICY=baseline`). El entorno de referencia probado es Python 3.12.13, PyTorch 2.10.0+cu129, transformers 5.20.2 y una NVIDIA H200.

## Capacidades

- Clasificación con opciones nombradas: devuelve probabilidad para cada opción, la opción más probable y su confianza.
- Preguntas de sí/no (`noul`): devuelve la probabilidad de que la respuesta sea afirmativa.
- Puntuación en escala ordenada (`score`): distribuye probabilidad sobre niveles numerados desde 0, devuelve el nivel esperado y la probabilidad del nivel más probable, con un `legend` que mapea niveles a etiquetas.
- Elección múltiple y clasificación de texto.
- Reranking de recuperación (evaluado en el área Retrieval & Classification del suite Decision Index).
- Selección de herramientas (evaluado en el área Tools & Automation).
- Procesamiento de estado en texto plano o JSON.
- Servicio mediante endpoint HTTP `/v1/systemone` con el servidor `simple-jev` empaquetado.
- No soporta generación de texto libre ni salida de tokens (`output_tokens: 0` en las respuestas de ejemplo).
- Soporte multimodal limitado a texto y JSON; no se documentan visión, audio ni thinking mode.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como `state` y devuelve una `choice` sobre la acción a tomar (reemplazar, reembolsar, reparar) y un `score` de urgencia, como muestra el ejemplo de la model card con confianzas de 0,9908 y 0,9235 respectivamente.
- Reranking en pipelines de recuperación: dado un par consulta-documento como estado, se formula una pregunta `noul` sobre relevancia y se ordenan los candidatos por probabilidad, integrándose en sistemas RAG.
- Selección de herramienta en agentes: el modelo puntúa qué herramienta de un conjunto nombrado debe invocarse dado el estado de la conversación, alimentando un orquestador que ejecuta la acción elegida.
- Moderación y clasificación de contenido: clasificación tipada de categorías con probabilidades, útil para umbrales configurables y revisión humana sobre los casos de baja confianza.
- Encuestas y escalas Likert automatizadas: mapeo de texto libre a escalas ordenadas (`score`) con nivel esperado, útil para análisis de sentimiento graduado o satisfacción.
- Enrutamiento de peticiones en producción: decidir a qué cola, equipo o modelo derivar una solicitud en función de preguntas tipadas, con rechazo explícito (HTTP 422) cuando el contexto excede los 65.536 tokens por rama.
- Extracción de decisiones estructuradas en flujos de negocio: validación de estado en JSON y emisión de decisiones con probabilidades auditables para sistemas de aprobación.

## Benchmarks y rendimiento

Resultados del run propio del autor sobre el suite público Decision Index 0.3 (no es un resultado de leaderboard):

| Metrica | Valor |
|---|---:|
| Public index | 78,56 |
| Balanced raw | 83,14 |
| Breadth | 78,07 |
| Requests | 140.620 (140.332 ok, 288 error) |
| Scored rows | 140.178 (`complete: true`) |

| Area | Skill | Raw | Coverage | Benchmarks |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 0,6475 | 0,7130 | 1,0000 | 11 |
| Language Understanding | 0,8543 | 0,8947 | 1,0000 | 9 |
| Retrieval & Classification | 0,7966 | 0,8328 | 1,0000 | 6 |
| Tools & Automation | 0,8934 | 0,9046 | 0,9997 | 5 |
| Arts & Human Taste | 0,7455 | 0,8371 | 1,0000 | 6 |

Latencia medida en 1× H200 (muestra estratificada de 100 filas del suite público, en caliente, un proceso servidor):

| Weighting | Median | Mean | p80 |
|---|---:|---:|---:|
| Suite-weighted | 109 ms | 274 ms | 238 ms |
| Equal weight per dataset | 115 ms | – | 732 ms |

Los 288 errores corresponden a rechazos HTTP 422 por ramas que exceden 65.536 tokens (284 en ToolRet, 4 en BRIGHT) y no se reintentaron. Estas cifras no se midieron en el hardware de referencia del Decision Index (RTX PRO 6000).

## Requisitos de hardware

- VRAM estimada: el pico de memoria GPU reportado es de 92.361 MiB con `MAX_BATCH_SIZE=16` sobre las 47 peticiones más largas del suite público, en una H200 de 143.771 MiB.
- GPU recomendadas: NVIDIA H200 (entorno probado). Para bf16 completo se requiere hardware de gama alta; no se documentan configuraciones con cuantización.
- Cabe en GPU de consumo: no disponible; el modelo en bf16 ocupa aproximadamente 10,35 GB solo en pesos, por lo que en una RTX 4090 de 24 GB cabría el modelo pero no se ha validado el pico de memoria con lotes grandes.
- Opciones de despliegue: servidor `simple-jev` empaquetado sobre transformers 5.20.2 y accelerate 1.15.0, con endpoint HTTP `/v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 109 ms y media de 274 ms por petición en H200 con ponderación por suite; p80 de 238 ms (suite-weighted) y 732 ms (equal weight per dataset).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos de decisión tipada en la información proporcionada. Se incluye una comparación estructural con el modelo base y con alternativas genéricas de la misma categoría de tamaño:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| lg-decision-4B | 5,17B | 65.536 tokens/rama | Decisiones tipadas con probabilidades | Apache 2.0 |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Generación de texto general | no disponible |
| Modelos de clasificación tipo BERT | ~0,1-0,5B | 512-8.192 tokens | Clasificación de etiqueta única | variable |

El modelo base no se ha evaluado con el mismo suite, por lo que no puede cuantificarse la mejora del fine-tune. No se identifican en la información otros modelos de "decisiones tipadas" directamente comparables.

## Limitaciones y advertencias

- Solo acepta texto y JSON; no soporta visión, audio ni otras modalidades.
- No genera texto libre: la salida es siempre una estructura de probabilidades, lo que limita su uso a tareas de decisión.
- Rechaza peticiones con ramas de más de 65.536 tokens mediante HTTP 422 en lugar de truncar; los pipelines deben manejar este error.
- El run de benchmarks es propio del autor y no un resultado de leaderboard; la latencia no se midió en el hardware de referencia del Decision Index.
- El área de Knowledge & Reasoning obtiene la puntuación más baja (0,6475), lo que sugiere menor fiabilidad en decisiones que requieren razonamiento complejo.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; los idiomas soportados figuran como no disponibles.
- El despliegue depende de versiones muy específicas (transformers 5.20.2, accelerate 1.15.0, PyTorch 2.10.0+cu129); desviarse de ellas puede romper la compatibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B debe verificarse por separado.
- El modelo tiene 29 descargas y 0 likes en el momento de la consulta, lo que indica adopción muy limitada y escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dream-only/lg-decision-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/SunZhengda/lg-decision-4B-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
