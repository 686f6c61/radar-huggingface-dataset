# Okura66/Kahn1-Qwen3.5-4B

## Resumen

Kahn1-Qwen3.5-4B es un modelo de clasificación y decisión de tipo «System 1» desarrollado por Okura66. No genera texto: lee un documento (el *estado*) y responde preguntas tipadas en una sola pasada hacia delante, leyendo la respuesta directamente de los logits de los tokens candidatos (`A`–`Z`, `yes`/`no`). Es un ajuste fino con LoRA de `Qwen/Qwen3.5-4B` fusionado en un checkpoint independiente de solo texto (`Qwen3_5ForCausalLM`), con 4.205.751.296 parámetros y licencia Apache 2.0.

Su interés práctico está en la latencia y en la ausencia de errores de formato: al no decodificar tokens, no puede producir respuestas que no cumplan el esquema. El autor reporta una latencia de 87,5 ms de mediana y 204,8 ms en el percentil 95 con k = 3 (desambiguación sobre tres órdenes de opciones) en una RTX 5070 Ti con vLLM.

El modelo expone tres primitivas tipadas: Choice (hasta 26 opciones más un fallback), Score (niveles ordinales y expectativa continua) y Noul (si el documento respalda una afirmación). Ofrece probabilidades calibradas mediante *temperature scaling* (`calibration.json`) y soporta inglés y francés. Frente al modelo de 3B de la misma familia, mejora JevBench de 67,5 % a 83,1 % y su nivel difícil de 42,3 % a 70,3 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet / atención (`Qwen3_5ForCausalLM`), solo texto |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ, FP8). El entrenamiento se realizó en bfloat16 y el repositorio ocupa 8,4 GB |
| Idiomas soportados | Inglés y francés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta `safetensors`; checkpoint fusionado en bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B` en modo solo texto y bfloat16, con su plantilla de chat nativa y el modo *thinking* desactivado; la respuesta se lee justo después de `</think>`. La columna vertebral es híbrida: combina capas de atención con capas de atención lineal de tipo Gated DeltaNet. El ajuste se aplicó como LoRA con r = 16 y α = 32 sobre las proyecciones q/k/v/o de las capas de atención y sobre `in_proj_qkv/z/b/a` y `out_proj` de las capas de atención lineal, y posteriormente se fusionó en un checkpoint independiente. La pérdida es entropía cruzada únicamente sobre el token de respuesta, con learning rate 3e-5, schedule coseno, batch efectivo 32 y una sola época (510 pasos).

El conjunto de entrenamiento tiene 16.332 filas: una submuestra de la mezcla del modelo de 3B (NLI, tema, intención, sentimiento), más DocNLI, ShARC, WANLI y QUALITY, y 402 preguntas «duras» escritas por Claude Opus sobre documentos empresariales largos y realistas (pólizas con excepciones y enmiendas, hilos de correo con correcciones, fechas y husos horarios, tarifas, instrucciones plantadas para ignorar), en inglés y francés, replicadas ×4. Cada pregunta fue respondida a ciegas por otras dos instancias de Opus; las 480 verificadas coincidieron con la etiqueta del autor. Como aumentación se usaron permutación de opciones, eliminación de opciones con fallback y plantillas bilingües para tareas cortas. El checkpoint elegido es el paso final, seleccionado sobre un split de desarrollo difícil y otro mixto, nunca sobre un benchmark.

## Capacidades

- Clasificación de opción múltiple (primitiva Choice): hasta 26 opciones más un fallback, con la respuesta leída de los logits de los tokens candidatos.
- Puntuación ordinal y continua (primitiva Score): niveles ordenados y expectativa continua, calibrada con temperature scaling.
- Verificación de afirmaciones y entailment (primitiva Noul): determina si un documento respalda una afirmación.
- Clasificación de intención en taxonomías amplias: 91,5 % en Banking77 (77 intenciones) y 92,4 % en MASSIVE (60 intenciones) sobre los mismos 1.184 ítems.
- Análisis de sentimiento y valoraciones: SST-5 con 49,2 % exacto, 93,6 % a un nivel de distancia y ρ de Spearman 0,823; reseñas de aplicaciones con 48,2 % exacto, 81,5 % a un nivel y ρ 0,768.
- Decisiones sobre documentos largos: DocNLI, ShARC, WANLI y QUALITY forman parte del entrenamiento.
- Multilingüe limitado a inglés y francés, con plantillas bilingües para tareas cortas.
- Inferencia de alta velocidad sin generación de tokens: cero tokens generados y, por construcción, cero errores de esquema o de tipado.
- No se documentan en la información disponible capacidades de *tool calling*, *function calling*, agentes, visión, audio ni razonamiento multi-paso explícito.

## Casos de uso

- Enrutado de tickets de soporte: el modelo asigna cada ticket a una de hasta 26 categorías en una sola pasada, con 91,5 % de acierto en Banking77 y 92,4 % en MASSIVE, lo que permite clasificar por intención antes de que un agente humano abra la conversación.
- Triaje de reclamaciones y siniestros: con p50 de 87,5 ms por decisión, un único servidor vLLM puede procesar lotes grandes de reclamaciones extrayendo atributos estructurados (intención, prioridad, importe, motivo) sin riesgo de respuestas mal formadas.
- Puntuación de satisfacción a partir de reseñas: la primitiva Score devuelve una etiqueta ordinal de 1 a 5 y una expectativa continua, con 93,6 % de acierto a un nivel de distancia en SST-5, útil para paneles de calidad agregados.
- Verificación de afirmaciones en atención al cliente: la primitiva Noul comprueba si un texto respalda una afirmación concreta (86,6 % en RTE, 70,4 % en SciTail), por ejemplo para validar que una respuesta generada está respaldada por la documentación de la empresa.
- Extracción de condiciones en documentación contractual: el entrenamiento incluye pólizas con excepciones y enmiendas, hilos de correo con correcciones y tarifas, de modo que el modelo puede responder preguntas tipadas sobre cláusulas sin necesidad de razonamiento generativo.
- Clasificación zero-shot de taxonomías propias: el prompt admite opciones arbitrarias y un fallback, así que se puede desplegar una taxonomía nueva sin reentrenar, validando antes la calibración sobre el dominio propio.
- Prefiltrado en pipelines de agentes: al responder en una sola pasada y devolver probabilidades calibradas (ECE 0,064), el modelo sirve como clasificador de bajo coste que decide si una petición requiere un modelo generativo mayor.
- Moderación y control de flujo documental: la decisión binaria `yes`/`no` permite descartar o derivar documentos a revisión humana con un umbral ajustable, siempre que se recalibre sobre el dominio de destino.

## Benchmarks y rendimiento

Conjunto reservado (*held-out*), 14.663 ítems de fuentes nunca vistas en entrenamiento. La comparación es emparejada: mismos ítems, mismos prompts y mismas etiquetas; Choice se plantea sobre las mismas 8 opciones para todos los sistemas.

| Sistema | Choice (6.050) | Score (6.210) | Noul (2.403) | Todos | ECE (15 bins, menor es mejor) |
|---|---|---|---|---|---|
| Kahn1 4B | 91,9 % | 48,6 % | 72,2 % | 70,3 % | 0,064 |
| Kahn1 3B | 90,9 % | 51,4 % | 67,0 % | 70,3 % | 0,082 |
| JEV 1.13.0 | 94,5 % | 52,0 % | 74,4 % | 73,2 % | 0,113 |

Sobre el conjunto completo de intenciones (77 y 60 opciones, los mismos 1.184 ítems): Kahn1 4B 70,4 %, Kahn1 3B 68,4 %, JEV 79,1 %.

Desglose por fuente para Kahn1 4B:

| Fuente | Resultado |
|---|---|
| Banking77 (77 intenciones) | 91,5 % |
| MASSIVE (60 intenciones) | 92,4 % |
| SST-5 | 49,2 % exacto · 93,6 % a un nivel · ρ de Spearman 0,823 |
| Reseñas de aplicaciones (5 estrellas) | 48,2 % exacto · 81,5 % a un nivel · ρ de Spearman 0,768 |
| RTE | 86,6 % |
| SciTail | 70,4 % |

JevBench, 231 ítems públicos:

| Nivel | Kahn1 4B | Kahn1 3B | JevK5 v0.2 | Jev 1.13.0 |
|---|---|---|---|---|
| Fácil (48) | 100 % | 100 % | 100 % | 100 % |
| Estándar (72) | 91,7 % | 84,7 % | 95,8 % | 98,6 % |
| Difícil (111) | 70,3 % | 42,3 % | 73,9 % | 73,0 % |
| Todos | 83,1 % | 67,5 % | 86,1 % | 86,6 % |

Comparación ítem a ítem contra JevK5: 11 ítems solo los acierta Kahn1 4B y 18 solo JevK5 (McNemar exacto, p = 0,26).

Split de desarrollo de decisiones difíciles, 317 ítems (nunca usado en entrenamiento, pero sí para elegir el checkpoint; debe leerse como puntuación de desarrollo, no como benchmark):

| Idioma | Qwen3.5-4B base | Kahn1 4B |
|---|---|---|
| Inglés (233) | 48,9 % | 60,5 % |
| Francés (84) | 48,8 % | 66,7 % |
| Todos | 48,9 % | 62,1 % |

Latencia medida con vLLM: p50 87,5 ms y p95 204,8 ms con k = 3 sobre una RTX 5070 Ti (el modelo de 3B: 36,4 ms). El *throughput* agregado no está documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: solo se publica el checkpoint en bfloat16, con 4,2 B de parámetros, lo que supone unos 8,4 GB de pesos. Sumando activaciones y caché KV, conviene reservar del orden de 10-12 GB; el valor exacto depende de la longitud de contexto, que no está documentada.
- Cabe en GPU de consumo: el autor midió el modelo en una RTX 5070 Ti (16 GB) con vLLM. Debería caber igualmente en RTX 4080/4090 (16-24 GB) y en cualquier GPU con 16 GB o más libres.
- GPU de centro de datos: A100 (40/80 GB) y H100 son compatibles y sobredimensionadas para 4,2 B en bfloat16; útiles solo por agregación de peticiones.
- Opciones de despliegue: vLLM está soportado explícitamente (etiqueta `vllm`) y es el backend usado en las mediciones de latencia. El propio autor distribuye el servidor `sysone` del repositorio `Okura66/kahn1`, con el endpoint `POST /v1/evaluate` y la variable de entorno `SYSONE_MODEL`.
- No se documentan recetas oficiales para llama.cpp, Ollama, TGI ni TensorRT-LLM, ni cuantizaciones de pesos, por lo que las opciones de despliegue de bajo consumo no están cubiertas por el autor.
- Latencia: p50 87,5 ms y p95 204,8 ms con k = 3 en una RTX 5070 Ti con vLLM. El factor k = 3 corresponde a la desambiguación sobre tres órdenes de opciones; cada decisión equivale por tanto a tres pasadas hacia delante.
- *Throughput* y consumo de memoria por petición: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Tarea | JevBench (todos) | Conjunto reservado (todos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kahn1-Qwen3.5-4B | 4,2 B | Qwen3.5-4B | Clasificación y decisión System 1 | 83,1 % | 70,3 % | Apache 2.0 | HuggingFace, vLLM, servidor propio |
| Kahn1-Qwen2.5-3B | ~3 B | Qwen2.5-3B | Igual que el anterior | 67,5 % | 70,3 % | No disponible | HuggingFace (checkpoint fusionado y adaptador LoRA) |
| JEV 1.13.0 | No disponible | No disponible | Decisión System 1 | 86,6 % | 73,2 % | No disponible | No disponible |
| JevK5 v0.2 | No disponible | No disponible | Decisión System 1 | 86,1 % | No disponible | No disponible | No disponible |
| Qwen3.5-4B (base) | 4,2 B | — | Generación de texto | No evaluado en JevBench en la información disponible | No disponible | Apache 2.0 (según la guía consultada) | Ollama, HuggingFace |

Lectura de la comparativa: JEV 1.13.0 supera a Kahn1 4B en las tres primitivas del conjunto reservado (94,5 % frente a 91,9 % en Choice, 52,0 % frente a 48,6 % en Score y 74,4 % frente a 72,2 % en Noul) y en JevBench global (86,6 % frente a 83,1 %), pero Kahn1 4B está mejor calibrado (ECE 0,064 frente a 0,113) y es el único con licencia Apache 2.0 confirmada. La comparación contra JevK5 en JevBench no es concluyente (p = 0,26).

## Limitaciones y advertencias

- Razonamiento aritmético y temporal débil: al resolver todo en una sola pasada hacia delante no puede razonar paso a paso. En los ítems temporales duros de JevBench acierta 5 de 15.
- La primitiva Score es la más floja: 48,6 % exacto en 5 niveles, aunque entre el 81 % y el 94 % de las respuestas quedan a un nivel de distancia.
- Clasificación de intención corta: en JevBench pierde ligeramente frente al modelo de 3B (9 de 12 ítems).
- JEV 1.13.0 va por delante en el conjunto reservado en todas las primitivas, según los datos publicados por el propio JEV.
- Calibración dependiente del dominio: fue ajustada sobre la distribución de entrenamiento. El autor recomienda recalibrar con `sysone calibrate` antes de confiar en cualquier umbral de decisión.
- Solo inglés y francés; no hay soporte declarado de castellano ni de otros idiomas.
- Naturaleza no generativa: la respuesta se lee de los logits de tokens candidatos, con un máximo de 26 opciones más fallback. No sirve para generar texto libre, resumir ni conversar.
- Los documentos de entrenamiento incluían instrucciones plantadas para ignorar, pero no se documenta ninguna defensa explícita frente a inyección de prompt, así que no debe asumirse robustez en ese escenario.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `Qwen/Qwen3.5-4B` y de los conjuntos de datos de entrenamiento (DocNLI, ShARC, WANLI, QUALITY) para el caso de uso concreto.
- Validación comunitaria escasa: el repositorio registra 0 descargas y 1 *like* en el momento de la consulta, y la fecha de creación (2026-09-25) es la única referencia temporal disponible.
- No se especifican sesgos conocidos ni la composición demográfica de los datos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Okura66/Kahn1-Qwen3.5-4B
- Modelo de 3B de la misma familia: https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B
- Código del motor, servidor, entrenamiento y evaluación: https://github.com/Okura66/kahn1
- Web y playground con benchmarks: https://kahn1.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Guía de Qwen 3.5 4B en local: https://theaibench.ai/models/qwen-3-5-4b/
- Comparativa de terceros que incluye a Kahn1-Qwen2.5-3B: https://huggingface.co/oraculumai/Manchego
