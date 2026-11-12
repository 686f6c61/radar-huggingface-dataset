# prithivMLmods/d3-mini-GGUF

## Resumen

d3-mini es un modelo de decisión multimodal de 4.540 millones de parámetros (4,54B), de los cuales 0,33B corresponden a un codificador de visión, desarrollado por el equipo de vLLM Semantic Router. Está construido sobre Qwen3.5-4B y se distribuye bajo licencia Apache-2.0. A diferencia de un LLM generativo convencional, no produce texto libre: recibe una entrada de texto o JSON, opcionalmente acompañada de varias imágenes y vídeos, y responde en una sola llamada a preguntas de tipo elección múltiple (choice), sí/no (noul) y puntuación (score), devolviendo una probabilidad para cada opción.

La relevancia de este modelo radica en su enfoque de "system-one": tareas de clasificación y enrutamiento que normalmente requieren un LLM grande con generación de texto se resuelven aquí con una latencia muy baja y una salida estructurada directamente consumible por sistemas posteriores. En el índice oficial Jev Decision Index 0.3.2 (tabla de texto) obtiene 52,6, 7,7 puntos por encima del modelo de 4B de Decision 2.0, y lidera entre las entradas de tamaño similar situándose en la frontera de Pareto.

En la tabla de visión alcanza 63,2 (primero entre las siete entradas de tamaño comparable) y 70,3 en el benchmark de vídeo Perception Test. En un AMD Instinct MI325X la latencia mediana es de 18,1 ms para una petición de texto, 112 ms con una imagen y 336 ms con un vídeo de 10 segundos, con un throughput de hasta 151 peticiones de texto de una pregunta por segundo en modo Engine con batching. Esta ficha cubre la variante GGUF publicada por prithivMLmods.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con codificador de visión de 0,33B y proyección multimodal |
| Parámetros totales | 4.841.450.496 (4,54B, incluido el codificador de visión de 0,33B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0; proyección multimodal mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variante cuantizada); modelo base en safetensors |

## Arquitectura y entrenamiento

d3-mini es un modelo de decisión multimodal construido sobre Qwen3.5-4B, al que se añade un codificador de visión de 0,33B y una proyección multimodal (fichero `mmproj-bf16.gguf` de 676 MB en la variante GGUF). El modelo no genera texto: procesa un `state` (contexto de texto o JSON) junto con preguntas estructuradas y emite distribuciones de probabilidad sobre opciones predefinidas. Soporta tres tipos de pregunta: `choice` (elección entre criterios con etiqueta), `noul` (sí/no con probabilidad) y `score` (puntuación sobre una escala de criterios ordenados).

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el paradigma "system-one": responder en una sola pasada con salida probabilística calibrada en lugar de decodificación autoregresiva de texto, lo que reduce drásticamente la latencia y elimina la necesidad de parsear respuestas generadas. La variante GGUF expone además el endpoint `v1/systemone` en llama.cpp para servir estas peticiones estructuradas.

## Capacidades

- Clasificación y enrutamiento zero-shot mediante preguntas de tipo `choice` con criterios etiquetados.
- Respuestas booleanas con probabilidad calibrada mediante preguntas de tipo `noul` (sí/no).
- Puntuación ordinal sobre escalas definidas por el usuario mediante preguntas de tipo `score`.
- Procesamiento multimodal: acepta varias imágenes y vídeos junto al contexto textual.
- Respuesta a múltiples preguntas en una sola llamada (batch de preguntas por petición).
- Salida estructurada en JSON con probabilidades por opción y nivel de confianza, sin generación de texto libre.
- Benchmark de vídeo: 70,3 en Perception Test.
- Capacidades multilingües: limitadas al inglés según la model card.
- No soporta tool calling ni razonamiento multi-paso generativo en el sentido convencional; su función es la decisión estructurada.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card envía un mensaje de cliente como `state` y pregunta a qué equipo corresponde (`billing`, `shipping`, `technical`), obteniendo probabilidades como 0,998 para `billing` con confianza 0,99 en una sola llamada de pocos milisegundos.
- Detección de sentimiento y urgencia en atención al cliente: combinando preguntas `noul` ("¿está enfadado el cliente?") y `score` ("¿cómo de urgente es?") en la misma petición, se prioriza la cola de atención sin coste de generación de texto.
- Moderación de contenido multimodal: clasificar publicaciones con imagen o vídeo adjunto según políticas definidas como criterios de una pregunta `choice`, aprovechando el codificador de visión y la latencia de 112 ms con imagen.
- Filtrado y clasificación de vídeo a escala: con 336 ms de latencia mediana para un vídeo de 10 segundos en MI325X, es viable etiquetar lotes de clips según categorías predefinidas en pipelines de moderación o catalogación.
- Enrutamiento semántico en infraestructuras de inferencia: integrado en vLLM Semantic Router para decidir qué modelo o backend atiende cada petición según su contenido, con throughput de hasta 151 peticiones por segundo en modo Engine.
- Clasificación zero-shot de documentos JSON: validar o etiquetar registros estructurados (por ejemplo, categorizar incidencias o extraer la intención de un payload) sin entrenamiento específico, usando los criterios como etiquetas.
- Control de calidad automático: puntuar respuestas o contenidos con preguntas `score` para umbrales de aceptación en pipelines de generación aumentada.

## Benchmarks y rendimiento

| Benchmark | d3-mini | Referencia comparable |
|---|---|---|
| Jev Decision Index 0.3.2 (texto) | 52,6 | Decision 2.0 (4B): 44,9 (7,7 puntos menos) |
| Jev Decision Index (visión) | 63,2 | primero entre 7 entradas de tamaño similar |
| Perception Test (vídeo) | 70,3 | no disponible |

| Métrica de serving (AMD Instinct MI325X) | Valor |
|---|---|
| Latencia mediana, petición de texto | 18,1 ms |
| Latencia mediana, con imagen | 112 ms |
| Latencia mediana, vídeo de 10 s | 336 ms |
| Throughput (Engine mode, batching) | hasta 151 peticiones de texto de una pregunta/s |

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q3_K_M 2,54 GB; Q4_K_S 2,92 GB; Q4_K_M 3,07 GB; Q5_K_S 3,43 GB; Q5_K_M 3,51 GB; Q6_K 3,99 GB; Q8_0 5,16 GB; BF16 9,7 GB. Añadir 676 MB para el proyector multimodal `mmproj-bf16.gguf` si se usa visión.
- Cabe en GPU de consumo: cualquier GPU con 4-6 GB de VRAM libre para cuantizaciones Q4-Q5, y 8-12 GB para Q8_0 o BF16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090).
- GPU de datacenter: la model card reporta latencias medidas en AMD Instinct MI325X; para producción de alto throughput se recomienda hardware de datacenter con batching.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99` y endpoint `/v1/systemone`), `transformers` (`AutoModel` o pipeline), `vllm-sr serve -e vllm-sr/d3-mini` (vLLM Semantic Router en modo Engine).
- Latencia y throughput: ver tabla de benchmarks; 18,1 ms mediana en texto y hasta 151 req/s en MI325X con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-mini | 4,54B (0,33B visión) | no disponible | Decisión multimodal (choice/noul/score) | Apache-2.0 | HF (GGUF y base) |
| Decision 2.0 (4B) | 4B | no disponible | Decisión | no disponible | no disponible |
| Qwen3.5-4B (base) | 4B | no disponible | LLM generativo | no disponible | no disponible |

La información disponible solo permite comparar con Decision 2.0 en el Jev Decision Index (52,6 frente a 44,9) y con las seis entradas restantes de tamaño similar en la tabla de visión, donde d3-mini ocupa el primer puesto. No se dispone de datos de benchmarks cruzados con otros modelos de decisión o clasificadores multimodales.

## Limitaciones y advertencias

- El modelo solo responde preguntas estructuradas; no genera texto libre ni mantiene conversaciones abiertas.
- Idiomas: únicamente inglés según la model card; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada: riesgo en contextos largos o con muchas imágenes/vídeos simultáneos.
- Las probabilidades de salida requieren calibración y umbrales propios según el dominio; la confianza reportada no garantiza corrección.
- Riesgo de sesgo heredado del modelo base Qwen3.5-4B y de los datos de entrenamiento no documentados.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a una opción incorrecta cuando el `state` es ambiguo o está fuera de distribución.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- Para visión es imprescindible cargar el fichero `mmproj-bf16.gguf`; sin él, el modelo solo procesa texto.
- El soporte del endpoint `/v1/systemone` depende de una versión de llama.cpp que lo implemente; no es un endpoint estándar de la API de OpenAI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/d3-mini-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Fichero BF16: https://huggingface.co/prithivMLmods/d3-mini-GGUF/blob/main/d3-mini.BF16.gguf
- Fichero Q4_K_M (recomendado): https://huggingface.co/prithivMLmods/d3-mini-GGUF/blob/main/d3-mini.Q4_K_M.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/d3-mini-GGUF/blob/main/d3-mini.mmproj-bf16.gguf
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- vLLM Semantic Router: no disponible en la información proporcionada
