# Kestrelyn/kestrel-decider-230m

## Resumen

Kestrel Decider 230M es un adaptador PEFT (LoRA más una cabeza de decisión) publicado por Kestrelyn que convierte el modelo base LiquidAI/LFM2.5-230M-Base en un «decider» de decisiones tipadas: recibe un estado y una pregunta, y devuelve un sí/no, una elección entre N opciones o una puntuación sobre una rúbrica, nunca texto libre. Está construido con la receta strands-decider, pero reciclada sobre un modelo de 230 millones de parámetros en lugar de Qwen3.5-2B-Base, lo que supone aproximadamente una novena parte de los parámetros de strands-decider-2B-hobson-v19.

El objetivo declarado es el enrutado, el triaje, la selección de herramientas y los guardrails en escenarios donde la latencia, el consumo de memoria o el servicio exclusivamente en CPU pesan más que los últimos puntos de precisión. El repositorio ocupa 0,0 GB porque solo contiene el adaptador LoRA (unos 4 MB) y la cabeza (unos 2 MB); el modelo base (unos 0,5 GB) se descarga aparte en el primer uso. Requiere `transformers>=5.15`.

Es una publicación independiente: no está hecha, revisada ni avalada por los autores de strands-decider ni por Liquid AI. Se distribuye bajo la LFM Open License v1.0, no bajo Apache-2.0 como la variante v19, y solo declara soporte para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) más cabeza de decisión tipada sobre LiquidAI/LFM2.5-230M-Base; la arquitectura interna del base no se detalla en la información proporcionada |
| Parametros totales | 230 M (modelo base); adaptador LoRA de ~4 MB y cabeza de ~2 MB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la evaluación JevBench se sirvió con la configuración `w3072`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`); condiciones concretas no detalladas en la información proporcionada |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base descargado por separado |
| Modelo base | LiquidAI/LFM2.5-230M-Base (`base_model_relation: adapter`) |
| Tarea (pipeline) | text-classification |
| Libreria | peft |
| Requisitos de software | `transformers>=5.15`, paquete `strands-decider` |

## Arquitectura y entrenamiento

No se trata de un modelo generativo, sino de un adaptador de tipo LoRA sobre el modelo base de 230 M de parámetros LiquidAI/LFM2.5-230M-Base, al que se añade una cabeza de decisión de aproximadamente 2 MB. La receta strands-decider produce salidas tipadas: `NoulQuestion` para preguntas de sí/no y `ChoiceQuestion` para elegir entre un conjunto de opciones con nombre (por ejemplo, `billing`, `sales`, `retail`), cada una con sus probabilidades asociadas. El motor (`SystemOneEngine`) puede ejecutarse con `device="cuda"` o `device="cpu"`.

En cuanto al entrenamiento, la model card menciona una comparación con un «first run (1 epoch, multi-step teacher only)», lo que indica un esquema de destilación desde un profesor multi-paso; no se especifica el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Los datos de entrenamiento declarados abarcan 25 conjuntos: ag_news, banking77, clinc_oos, dbpedia_14, language-identification, yahoo_answers_topics, sms_spam, civil_comments, GLUE, boolq, paws, vitaminc, PubMedQA, yelp_review_full, sst5, app_reviews, pavlick-formality-scores, ruletaker, emotion, amazon_massive_intent, Sarcasm_News_Headline, measuring-hate-speech, HelpSteer2, Boardgame-QA y hotpot_qa. Los tipos de cuantización y cualquier innovación de decodificación (especulativa, atención lineal, etc.) no se documentan en la información disponible.

## Capacidades

- Decisiones tipadas: devuelve sí/no, una opción entre N alternativas o una puntuación sobre una rúbrica, con probabilidades por clase, en lugar de texto libre.
- Clasificación de texto en inglés sobre taxonomías cortas y cerradas.
- Enrutado y triaje: asignación de una consulta a un equipo, cola o categoría.
- Selección de herramienta dentro de un agente (tool selection) expresada como elección tipada.
- Guardrails y moderación: clasificación de toxicidad, odio, intención dañina o spam como paso previo a un modelo generativo.
- Calibración de confianza: expone `probabilities` por opción, lo que permite umbrales de escalado a revisión humana.
- Puntuación sobre rúbricas (por ejemplo, adecuación de respuestas), con resultados desiguales según se detalla en la sección de benchmarks.
- Ejecución en CPU y en dispositivos de borde, sin necesidad de GPU.
- No soporta generación de texto libre, tool calling en formato JSON arbitrario ni razonamiento multi-paso autónomo más allá de la decisión puntual solicitada.
- Capacidad multilingüe: no declarada; el único idioma soportado indicado es el inglés.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo oficial del quick start resuelve «Help! My payouts have been failing for 3 days!» hacia el equipo `billing`, `sales` o `retail` mediante una `ChoiceQuestion`, con distribución de probabilidad para decidir si se escala a un humano.
- Triaje de urgencia: una `NoulQuestion` del tipo «el cliente necesita respuesta hoy» permite priorizar colas sin invocar un modelo generativo, a una fracción del coste de uno de 2B.
- Selección de herramientas en agentes: dado el estado de la conversación, elegir qué herramienta invocar entre un conjunto cerrado, reduciendo el coste frente a pedir esa decisión a un LLM generativo.
- Guardrails previos a la generación: filtrar contenido en `civil_comments`, `measuring-hate-speech` o `emotion` antes de que un modelo mayor produzca la respuesta final.
- Clasificación de intención para asistentes conversacionales: banking77, clinc_oos y amazon_massive_intent están en el conjunto de entrenamiento, lo que cubre intenciones bancarias, de dominio abierto y multilingües de forma agregada.
- Verificación documental y de contratos: el resultado más alto declarado es 0,828 en `eval: contractnli` (n=1026), adecuado para comprobar si un texto implica o contradice una cláusula.
- Moderación de reseñas y opiniones: yelp_review_full, sst5, app_reviews, Sarcasm_News_Headline y sms_spam permiten clasificar reseñas, sarcasmo y spam en pipelines de ingesta.
- Evaluación de respuestas frente a rúbricas: con HelpSteer2 y `gen:adequacy` como referencia, se puede puntuar adecuación de respuestas generadas en un pipeline de control de calidad.
- Despliegue en el borde o `CPU-only`: al ocupar el adaptador unos 6 MB y el base ~0,5 GB, cabe en instancias sin GPU o en dispositivos tipo Raspberry Pi 5, según se reporta para el modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (todos con `verified: false`):

| Evaluacion | Tarea | Métrica | Valor | n |
|---|---|---|---|---|
| JevBench public (config `w3072`) | text-classification | accuracy | 0,6364 | 147/231 |
| eval: held-out short tasks | text-classification | accuracy | 0,567 | 6000 |
| eval: boardgame | text-classification | accuracy | 0,596 | 900 |
| eval: contractnli | text-classification | accuracy | 0,828 | 1026 |
| eval: hotpotqa (held out) | text-classification | accuracy | 0,552 | 959 |
| eval: musique | text-classification | accuracy | 0,871 | 1199 |
| eval: generated_v16_eval | text-classification | accuracy | 0,6914 | 350 |
| eval: generated_v18_eval | text-classification | accuracy | 0,6965 | 247 |
| eval: adequacy_hs2 | text-classification | accuracy | 0,564 | 234 |
| eval: gen:adequacy | text-classification | accuracy | 0,623 | 302 |

Comparación publicada por el autor frente a la primera ejecución del entrenamiento y frente a la variante de referencia de 2B:

| Métrica | kestrel-decider-230m | Primera ejecución (1 epoch, profesor multi-paso) | v19 (Qwen3.5-2B, referencia) |
|---|---|---|---|
| JevBench v1 public (231 tareas) | 0,636 | 0,610 | 0,723 |
| JevBench Brier (menor es mejor) | 0,487 | 0,494 | 0,342 |
| JevBench ECE (menor es mejor) | 0,090 | 0,056 | 0,052 |
| Tareas de clasificación no vistas, global | 0,567 | 0,530 | 0,647 |
| No vistas: yes/no · choice · score | 0,572 · 0,618 · 0,439 | 0,556 · 0,578 · 0,395 | 0,596 · 0,725 · 0,499 |

No se han proporcionado datos de MMLU, HumanEval, GSM8K ni de latencia o throughput en la información disponible.

## Requisitos de hardware

- Peso del adaptador: ~4 MB (LoRA) más ~2 MB (cabeza); el modelo base LiquidAI/LFM2.5-230M-Base ocupa aproximadamente 0,5 GB.
- VRAM estimada: en torno a 1-1,5 GB en fp16 con contexto corto si se cuenta activaciones y caché; menos de 1 GB en cuantizaciones de 8 bits. Son estimaciones propias a partir del número de parámetros, no cifras publicadas por el autor.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090). En A100 y H100 el modelo queda muy infrautilizado; su interés es precisamente el extremo opuesto.
- Servicio solo en CPU: soportado explícitamente (`EngineConfig(device="cpu")`), y el modelo base está descrito por terceros como ejecutable en Raspberry Pi 5.
- Opciones de despliegue: paquete `strands-decider` con `strands-decider serve`, que expone un endpoint estilo OpenAI `/v1/systemone`; también uso programático mediante `SystemOneEngine` y `StrandsDeciderModel.load()`. No se confirma soporte en vLLM, TGI, llama.cpp u Ollama, ya que se trata de un adaptador PEFT con cabeza propia y no de un modelo generativo estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modelo base | JevBench v1 public | Clasificacion no vista (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kestrel-decider-230m | 230 M | LFM2.5-230M-Base | 0,636 | 0,567 | LFM Open License v1.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| strands-decider-2B-hobson-v19 | ~2 B | Qwen3.5-2B-Base | 0,723 | 0,647 | Apache-2.0 | HuggingFace, mantenido por StrandsAgents |
| LiquidAI/LFM2.5-230M-Base | 230 M | — | no aplicable (modelo generativo, no decider) | no disponible | LFM Open License v1.0 | HuggingFace, publicado por Liquid AI el 25 de junio de 2026 |

La ventaja de kestrel-decider-230m frente a v19 es el coste de servicio (aproximadamente 1/9 de los parámetros y posibilidad de CPU-only), a cambio de 8,7 puntos de precisión en JevBench y una calibración claramente peor según las métricas ECE y Brier publicadas por el propio autor. No se dispone de comparativas frente a otros deciders o clasificadores del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Precisión inferior a la referencia de 2B: 0,636 frente a 0,723 en JevBench v1 public (231 tareas).
- Calibración deficiente pese a la etiqueta «calibrated»: Brier 0,487 frente a 0,342 de v19 y ECE 0,090 frente a 0,052, es decir, el modelo es menos fiable en sus probabilidades que la alternativa mayor.
- El subconjunto de puntuación sobre rúbricas es el más débil: 0,439 en tareas de tipo `score` no vistas, frente a 0,499 de v19.
- Todos los resultados están autodeclarados y marcados como `verified: false`; no hay replicación independiente ni comparación en un `llm-leaderboard` externo.
- Parte de las evaluaciones (`hobson-internal`, `generated_v16_eval`, `generated_v18_eval`) son conjuntos internos no públicos, por lo que no son reproducibles desde fuera.
- Solo declara inglés; aunque algunos datasets de entrenamiento son multilingües (por ejemplo, amazon_massive_intent o language-identification), no se garantiza un comportamiento multilingüe.
- No es un modelo generativo: no produce texto libre ni respuestas abiertas; cualquier tarea que requiera redacción necesita otro modelo aguas abajo.
- Licencia LFM Open License v1.0, no Apache-2.0 como v19. Las condiciones exactas de uso comercial no se detallan en la información proporcionada y deben consultarse en el fichero LICENSE del repositorio antes de un despliegue en producción.
- Repositorio con 0,0 GB, 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad ni issues públicos que documenten fallos.
- Riesgo de alucinación bajo la forma de sobreconfianza y falsos positivos/negativos en clases raras; al forzar siempre una opción de un conjunto cerrado, el modelo puede asignar una categoría incluso cuando ninguna encaja bien.
- Sesgos: el entrenamiento incluye datasets anotados subjetivamente (civil_comments, measuring-hate-speech, emotion, Sarcasm_News_Headline), lo que puede transmitir los sesgos de anotación de dichas fuentes. No hay una evaluación de sesgos publicada.
- Requiere `transformers>=5.15` y el paquete `strands-decider`; el uso fuera de ese ecosistema (vLLM, llama.cpp, Ollama, TGI) no está confirmado.
- Publicación independiente: no está avalada por los autores de strands-decider ni por Liquid AI, lo que limita el soporte esperable ante incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kestrelyn/kestrel-decider-230m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Receta strands-decider (GitHub): https://github.com/strands-labs/strands-decider
- Variante de referencia de 2B: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Perfil del autor en HuggingFace: https://huggingface.co/Kestrelyn
- Artículo sobre el modelo base LFM 2.5-230M y su ejecución en el borde: https://byteiota.com/liquid-ai-lfm25-230m-edge-ai/

Nota sobre la búsqueda web: el resto de resultados devueltos (kestrelintelligence.com, github.com/synetalsolutions/kestrel-ai, benchlm.ai y scriptbyai.com) corresponden a proyectos, empresas o agregadores homónimos sin relación con este modelo, por lo que no se incluyen como referencias.
