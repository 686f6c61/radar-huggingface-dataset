# iapp/OpenThai-SystemOne-Ollama

## Resumen

OpenThai-SystemOne-Ollama es la build para Ollama de OpenThai-SystemOne, un modelo de decisión de tipo "System One" desarrollado por iApp (parte del proyecto OpenThai, antes conocido como OpenThaiGPT) y lanzado junto con AIEAT. A diferencia de un LLM generativo convencional, este modelo no produce texto libre: recibe un *estado* (texto o JSON) y un conjunto de preguntas tipadas, y devuelve probabilidades sobre opciones nombradas (`choice`), respuestas sí/no (`noul`) y puntuaciones en escalas ordenadas (`score`).

El modelo base es un Qwen3.5 de aproximadamente 752 millones de parámetros (0,8B), con licencia Apache-2.0 y soporte para tailandés e inglés. Esta variante GGUF está específicamente reentrenada (v0.3) para la API System One de Ollama (`POST /v1/systemone`, disponible desde Ollama ≥ 0.35), que no ejecuta la cabeza de decisión de 256 slots del repo principal, sino que lee las probabilidades del siguiente token correspondiente a las letras de respuesta `A`–`Z`.

Su relevancia actual radica en que ofrece un modelo de clasificación y decisión estructurada que corre íntegramente en local, sin clave de API, con contexto de 8192 tokens y un tamaño de repo de 2,9 GB, lo que lo hace desplegable en hardware modesto para tareas de enrutamiento, triaje y puntuación automatizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`qwen35`) con embeddings atados (tied embeddings) |
| Parámetros totales | 752.412.480 (0,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (`num_ctx 8192` en el Modelfile) |
| Tipos de cuantización | Q8_0, Q4_K_M, bf16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería `gguf`, compatible con Ollama y llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer Qwen3.5 de 0,8B con embeddings atados, adaptado como modelo de decisión. La build de Ollama no utiliza la cabeza de decisión de 256 slots del repo principal; en su lugar, para cada pregunta renderiza un prompt de chat (la petición completa en JSON más `Requested field: "<name>"`, con la plantilla de chat de Qwen3.5 y el modo thinking desactivado) y lee las probabilidades del siguiente token de las letras de respuesta `A`–`Z`.

El ajuste fino de esta variante v0.3 se realizó durante 3000 pasos sobre 192.000 preguntas del mix de entrenamiento v0.3, renderizadas exactamente como lo hace Ollama 0.35 (port byte a byte de `decision/systemone.go`, verificado contra Go) y tokenizadas con llama.cpp. La función de pérdida es entropía cruzada únicamente sobre las letras candidatas de cada pregunta, que es exactamente el softmax que calcula Ollama. Una temperatura única, ajustada sobre registros de validación, se pliega en la normalización final, ya que Ollama siempre puntúa a temperatura 1. Los ficheros GGUF son un modelo de texto Qwen3.5 plano y el Modelfile fija el system prompt de entrenamiento y `num_ctx 8192`.

## Capacidades

- Clasificación por elección (`choice`): devuelve probabilidades sobre entre 2 y 26 opciones nombradas por pregunta.
- Respuesta sí/no (`noul`): probabilidad de que la respuesta sea afirmativa.
- Puntuación en escala ordenada (`score`): nivel predicho con leyenda y probabilidades por nivel.
- Procesamiento de estado en texto libre o JSON estructurado.
- Soporte multilingüe tailandés e inglés.
- Integración con la API System One de Ollama (`/v1/systemone`), sin clave de API y ejecución local.
- Compatibilidad con llama.cpp y con el runner de Ollama.
- No genera texto libre: es un modelo de decisión, no un modelo conversacional generativo.
- Sin modo de abstención (`abstain`) y sin modo invariante al orden en esta build.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y clasifica el departamento responsable mediante una pregunta `choice` con criterios como facturación, técnico o ventas, devolviendo probabilidades por categoría y una confianza agregada.
- Detección de solicitudes de reembolso: con una pregunta `noul` sobre si el cliente pidió explícitamente la devolución del dinero, permite enrutar automáticamente casos a facturación sin reglas manuales.
- Medición de frustración del cliente: mediante una pregunta `score` con niveles ordenados (por ejemplo, tranquilo, molesto pero educado, muy enfadado), útil para priorizar colas de atención y activar escalado.
- Moderación de comentarios civiles: clasificación binaria de toxicidad o civilidad sobre comentarios, con probabilidad calibrada para fijar umbrales operativos.
- Puntuación de relevancia y consistencia en resúmenes: evaluación automática de resúmenes generados mediante preguntas `score` sobre escalas ordenadas, útil en pipelines de control de calidad.
- Clasificación de intenciones multilingüe: sobre conjuntos tipo MASSIVE en inglés y alemán, con precisión cercana al 88 % en las pruebas publicadas, para enrutamiento de consultas en asistentes.
- Verificación de coherencia entre pares de frases: tareas tipo PAWS o MultiNLI mediante preguntas `choice`, para detectar paráfrasis o contradicciones en datos de entrada.
- Filtrado de QA en dominios especializados: clasificación de respuestas de PubMedQA o SQuAD2 mediante `choice`/`noul` para descartar respuestas de baja calidad antes de mostrarlas.

## Benchmarks y rendimiento

Evaluación realizada por el autor a través de Ollama 0.35 sobre `/v1/systemone`, con los primeros 800 registros de cada conjunto y solo registros cuyas preguntas tienen ≤ 26 opciones. `choice`/`noul` = exactitud; `score` = nivel exacto.

| Conjunto (tipo, n) | v0.3 API principal | Esta build Q8_0 | Esta build Q4_K_M | Tev1 0.8B | Tev1 4B | Nimble 9B |
|---|---|---|---|---|---|---|
| aegis2 (noul, n=250) | 83,2 | 82,0 | 81,2 | 60,8 | 80,8 | 83,2 |
| boolq (noul, n=300) | 79,7 | 79,7 | 81,0 | 77,7 | 85,3 | 86,3 |
| civil_comments (noul, n=300) | 79,0 | 76,0 | 77,3 | 76,7 | 73,3 | 78,0 |
| helpsteer2 (score, n=250) | 41,6 | 39,2 | 40,0 | 33,2 | 36,8 | 33,6 |
| massive-de-DE (choice, n=350) | 88,6 | 88,0 | 87,4 | 69,7 | 83,1 | 83,1 |
| massive-en-US (choice, n=350) | 89,1 | 88,9 | 88,6 | 78,9 | 85,4 | 84,0 |
| multinli (choice, n=299) | 88,6 | 86,0 | 84,3 | 75,6 | 92,0 | 90,0 |
| paws (noul, n=250) | 94,0 | 92,8 | 92,8 | 65,2 | 82,4 | 74,0 |
| pubmedqa (choice, n=250) | 64,0 | 65,6 | 65,6 | 61,2 | 74,4 | 77,2 |
| squad2 (noul, n=299) | 89,3 | 89,0 | 86,3 | 70,9 | 76,3 | 74,2 |
| summeval-consistency (score, n=144) | 75,0 | 76,4 | 74,3 | 84,0 | 79,9 | 81,9 |
| summeval-relevance (score, n=240) | 21,7 | 28,7 | 27,9 | 13,8 | 50,0 | 48,3 |
| vitaminc-dev (choice, n=599) | 72,5 | 74,1 | 75,0 | 68,8 | 74,3 | 79,0 |
| **macro** | **74,3** | **74,3** | **74,0** | **64,3** | **74,9** | **74,8** |

Los conjuntos tailandeses (8 conjuntos, 12 filas; wisesight y SIB-200 excluidos del entrenamiento) aparecen en la model card, pero la información proporcionada queda truncada en esa tabla, por lo que sus cifras no están disponibles aquí.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB en bf16 (solo pesos), en torno a 0,9 GB en Q8_0 y cerca de 0,5 GB en Q4_K_M; añadir la caché KV para 8192 tokens de contexto.
- GPU recomendadas: cualquier GPU consumer moderna con ≥ 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos servidor, A100 o H100 no son necesarias para este tamaño, pero pueden usarse para alto throughput.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: Ollama ≥ 0.35 (API `/v1/systemone`), llama.cpp; el repo principal ofrece además la librería Python `openthai-systemone` con su propia API.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro (13 subconjuntos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-Ollama (esta build) | 0,8B | 8192 | 74,3 (Q8_0) / 74,0 (Q4_K_M) | Apache-2.0 | GGUF en HF, Ollama |
| Tev1 0.8B | 0,8B | no disponible | 64,3 | no disponible | API System One de Ollama |
| Tev1 4B | 4B | no disponible | 74,9 | no disponible | API System One de Ollama |
| Nimble 9B | 9B | no disponible | 74,8 | no disponible | API System One de Ollama |

La build de 0,8B iguala o supera en macro a modelos de 4B y 9B en esta evaluación, con un coste de hardware muy inferior.

## Limitaciones y advertencias

- No genera texto: solo devuelve probabilidades sobre opciones, respuestas sí/no y puntuaciones; no es apto para tareas generativas.
- Límite de 2 a 26 opciones por pregunta en esta build (frente a 255 en la API principal), lo que excluye conjuntos como banking77 y los intents de 60 vías de MASSIVE-th.
- Sin modo invariante al orden y sin respuesta de abstención, a diferencia del repo principal.
- Las probabilidades pueden variar ligeramente para una misma pregunta según las demás preguntas incluidas en la petición, ya que la petición completa forma parte del prompt de cada pregunta.
- Cobertura lingüística limitada a tailandés e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación estructural: al leer probabilidades de letras `A`–`Z`, preguntas mal formuladas o estados ambiguos pueden producir distribuciones poco informativas.
- Sesgos: no se documentan análisis específicos de sesgo en la información disponible; al entrenarse sobre conjuntos públicos (aegis2, civil_comments, etc.) puede heredar sesgos de esas fuentes.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes.
- Requiere Ollama ≥ 0.35 para la API System One; versiones anteriores no sirven.
- El uso en producción debe calibrar umbrales de confianza por tarea, dado que la confianza devuelta varía entre tipos de pregunta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-Ollama
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio GitHub: https://github.com/iapp-technology/openthai-systemone
- Ollama: https://ollama.com (modelo `iapp/openthai-systemone`)
