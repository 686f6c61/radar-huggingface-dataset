# lysandre/JEV-27B-VL

## Resumen

JEV-27B-VL es un modelo de decisión multimodal desarrollado por AutoTrust (publicado en el espacio de HuggingFace de lysandre) que se presenta como una alternativa a los pipelines tradicionales de ranking y recomendación. No es un modelo generativo al uso: es un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B que se sirve a través de un endpoint `/v1/decide`, donde cada decisión se formula como una elección tipada con probabilidades calibradas. El modelo combina un "Sistema 1" (decisión rápida, en aproximadamente medio segundo) con un "Sistema 2" (el modelo base sin modificar, que razona antes de decidir) y fusiona ambas distribuciones de respuesta.

Con 27.781.427.952 parámetros totales y un repositorio de 56,5 GB en formato safetensors, el modelo está diseñado para tareas de razonamiento visual y de decisión zero-shot: recomendación de titulares, re-ranking de resultados de búsqueda y razonamiento encarnado (embodied reasoning). Su resultado más destacado es un 61,5 % en ERQA con thinking activado (nivel medium), el mejor registro entre modelos abiertos en la comparativa publicada por el autor, empatado con Claude Opus 5 y sin haber recibido entrenamiento específico con datos de robótica.

La relevancia actual del modelo radica en su enfoque: sustituir un equipo de ranking por un único modelo de decisión calibrado, con soporte de tool calling y despliegue compatible con vLLM. La licencia Apache 2.0 y el formato transformers/safetensors facilitan su integración en producción, aunque el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (adaptador LoRA sobre Qwen/Qwen3.8-27B); pipeline image-text-to-text |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; repo de 56,5 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador LoRA sobre Qwen/Qwen3.8-27B, con relación `base_model_relation: adapter`. La arquitectura subyacente es un transformer multimodal del que no se detallan capas, dimensiones ocultas ni mecanismos de atención en la información disponible. La innovación principal no está en el transformer en sí, sino en el esquema de decisión en dos sistemas: el "Sistema 1" es el adaptador LoRA entrenado para emitir decisiones tipadas con probabilidades calibradas, y el "Sistema 2" es el modelo base Qwen3.8-27B sin modificar, que razona antes de responder. Cuando se activa el thinking, la distribución de respuesta del Sistema 2 se fusiona al 50/50 con la del Sistema 1.

El entrenamiento del adaptador se realizó sobre el dataset SargeDev/jev-distill-corpus-v3, un corpus de destilación. Según la model card, el entrenamiento de decisión es únicamente textual, sin datos de robótica ni de razonamiento encarnado, lo que hace más notable su rendimiento en ERQA. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. El modelo se sirve mediante un script propio (`serve.sh`) y expone un endpoint `POST /v1/decide` compatible con vLLM, donde cada pregunta se formula como una decisión de tipo `choice` con opciones A–D.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) sobre el modelo base Qwen3.8-27B.
- Decisión tipada con probabilidades calibradas mediante el endpoint `/v1/decide` (decisiones de tipo `choice` y otras).
- Doble modo de inferencia: Sistema 1 (una pasada, rápida) y Sistema 2 (thinking, razonamiento previo).
- Control del thinking mediante parámetros: `thinking: "on"`, `"off"`, `"low"`, `"medium"` y `"auto"` (activa el razonamiento solo por debajo de 0,8 de confianza del Sistema 1).
- Fusión de distribuciones de respuesta entre Sistema 1 y Sistema 2 al 50/50 cuando el thinking está activo.
- Razonamiento visual zero-shot: razonamiento espacial, de acción, de trayectoria, estimación de estado, razonamiento de tarea, multi-vista y pointing.
- Soporte de tool calling y function calling (etiqueta `endpoints_compatible`, despliegue con vLLM).
- Capacidades de recomendación y re-ranking de resultados de búsqueda (demo GuruSearch).
- Capacidades conversacionales (etiqueta `conversational`).
- Multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Recomendación de contenidos en tiempo real: el modelo puede rankear titulares de múltiples fuentes (el demo GuruSearch usa 6 feeds de noticias) según importancia, emitiendo cada ranking como una decisión calibrada del Sistema 1 en aproximadamente medio segundo. Es adecuado porque sustituye un pipeline de ranking por una única llamada al endpoint `/v1/decide`.
- Re-ranking de resultados de búsqueda: dado un conjunto de resultados de Google News, Bing News y Yahoo News, el modelo los reordena por relevancia y puede generar una respuesta corta con citas. La naturaleza calibrada de las probabilidades permite comparar directamente la confianza entre resultados.
- Razonamiento encarnado y robótica: con thinking activado alcanza un 61,5 % en ERQA (nivel medium), lo que lo hace útil para responder preguntas sobre escenas físicas, estimación de estado de objetos y planificación de trayectorias en sistemas robóticos, sin necesidad de entrenamiento específico en datos de robot.
- Asistentes de decisión con umbral de confianza: el modo `thinking: "auto"` activa el razonamiento solo cuando la confianza del Sistema 1 cae por debajo de 0,8, lo que permite construir asistentes que responden rápido en casos claros y razonan en los ambiguos (en ERQA, 305 de 400 preguntas activaron el thinking en este modo).
- Moderación y clasificación de contenido visual: la formulación como decisión `choice` con opciones predefinidas permite usarlo como clasificador zero-shot de imágenes y texto, sin necesidad de fine-tuning adicional.
- Automatización de atención al cliente multimodal: el modelo puede gestionar conversaciones con imágenes adjuntas (capturas, fotos de producto) y emitir decisiones calibradas sobre la categoría o la acción a tomar, integrándose en flujos con tool calling.
- Evaluación de tareas en entornos simulados: el benchmark ERQA incluye preguntas de tipo "¿se completó la tarea?" (task reasoning), un caso directamente aplicable a la verificación automática de tareas en pipelines de robótica o agentes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre ERQA (400 preguntas de opción múltiple, probabilidad de acierto por azar ≈ 26 %). Todas las ejecuciones con el `serve.sh` del propio modelo en una B200.

| Tipo de pregunta | Preguntas | Una pasada | Thinking (low) | Thinking (medium) |
|---|---:|---:|---:|---:|
| **Total** | 400 | **53,8 %** | **60,0 %** | **61,5 %** |
| Razonamiento espacial | 84 | 53,6 % | 59,5 % | 58,3 % |
| Razonamiento de acción | 72 | 58,3 % | 54,2 % | 59,7 % |
| Razonamiento de trayectoria | 66 | 51,5 % | 65,2 % | 63,6 % |
| Estimación de estado | 55 | 65,5 % | 72,7 % | 63,6 % |
| Razonamiento de tarea | 38 | 55,3 % | 65,8 % | 60,5 % |
| Razonamiento multi-vista | 37 | 32,4 % | 37,8 % | 54,1 % |
| Pointing | 34 | 67,6 % | 73,5 % | 88,2 % |
| Otros | 14 | 14,3 % | 28,6 % | 28,6 % |

Comparativa ERQA publicada por el autor:

| Puesto | Modelo | Configuración | ERQA | Datos de robot |
|---:|---|---|---:|---|
| 1 | GPT 6 Astra | cerrado, low thinking | 75,8 | — |
| 2 | Gemini 3.6 Flash | cerrado, minimal thinking | 72,3 | — |
| 3 | **JEV-27B-VL** | thinking on (medium) | **61,5** | ninguno (solo texto) |
| 3 | Claude Opus 5 | cerrado, adaptive low effort | 61,5 | — |
| 5 | **JEV-27B-VL** | thinking on (low) | **60,0** | ninguno (solo texto) |
| 6 | vllm-sr/d3 (27B) | una pasada | 58,8 | no divulgado |
| 7 | GEV-26B-Decide | thinking on | 56,8 | ninguno (solo texto) |
| 8 | Hy-Embodied-VLM-1.0 (30B-A3B) | thinking | 56,3 | sí |
| 9 | **JEV-27B-VL** | una pasada | **53,8** | ninguno (solo texto) |
| 10 | PhysBrain 1.5 (8B) | — | 52,8 | sí |
| 11 | JEV-35B | una pasada | 51,3 | ninguno (solo texto) |
| 12 | Cosmos3 Nano (8B + 8B) | — | 47,5 | sí |

Datos adicionales de latencia y longitud de razonamiento: mediana de 687 tokens de thinking (low) y 814 (medium); tiempo mediano por pregunta de 1,15 s en una pasada (16 peticiones en paralelo), 12,1 s (low) y 13,9 s (medium) con thinking (8 peticiones en paralelo). El thinking añade 7,7 puntos sobre una pasada (test emparejado, p = 0,002). El intervalo de confianza al 95 % de una puntuación con 400 preguntas es de aproximadamente ±5 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 27.781 millones de parámetros en safetensors y un repo de 56,5 GB, la inferencia en precisión completa requiere del orden de 56 GB o más de memoria; las cuantizaciones no están documentadas en la información disponible.
- GPU recomendadas: la model card reporta ejecuciones en una NVIDIA B200. No se especifican otras GPU validadas.
- ¿Cabe en GPU de consumo? No disponible. Por tamaño (27,8B parámetros, 56,5 GB de pesos), no cabe en GPU de consumo sin cuantización, y no se documentan formatos GGUF ni cuantizaciones alternativas.
- Opciones de despliegue: script propio `serve.sh` del modelo, endpoint compatible con vLLM (`POST /v1/decide`), librería transformers y etiqueta `endpoints_compatible`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: en ERQA, 1,15 s por pregunta en una pasada con 16 peticiones paralelas; 12,1 s (thinking low) y 13,9 s (thinking medium) con 8 peticiones paralelas, en una B200. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ERQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **JEV-27B-VL** | 27,8B | no disponible | 61,5 % (thinking medium) | Apache 2.0 | HuggingFace, vLLM |
| GEV-26B-Decide | no disponible | no disponible | 56,8 % (thinking on) | no disponible | no disponible |
| Hy-Embodied-VLM-1.0 | 30B-A3B (MoE) | no disponible | 56,3 % (thinking) | no disponible | no disponible |
| PhysBrain 1.5 | 8B | no disponible | 52,8 % | no disponible | no disponible |

La comparativa se limita a los modelos incluidos en la tabla ERQA publicada por el autor. JEV-27B-VL destaca por obtener la mejor puntuación entre los modelos abiertos sin entrenamiento con datos de robot, por delante de Hy-Embodied-VLM-1.0 (que sí usa datos encarnados) y de PhysBrain 1.5. Frente a los modelos cerrados, queda por detrás de GPT 6 Astra (75,8) y Gemini 3.6 Flash (72,3), y empatado con Claude Opus 5 (61,5). No se dispone de datos de contexto, cuantización ni licencia de los modelos comparados.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- Entrenamiento sin datos de robótica: aunque rinde bien en ERQA, no ha recibido entrenamiento encarnado, por lo que su comportamiento en dominios físicos específicos puede degradarse fuera de las categorías del benchmark.
- Razonamiento multi-vista y "otros": son los puntos débiles del benchmark (54,1 % y 28,6 % en el mejor modo), lo que limita su uso en tareas que requieran correspondencia entre múltiples perspectivas.
- Intervalo de confianza amplio: con 400 preguntas, el margen es de ±5 puntos, por lo que diferencias pequeñas en la tabla ERQA pueden no ser significativas.
- Coste del thinking: activar el razonamiento multiplica por más de 10 el tiempo por pregunta (de 1,15 s a 12–14 s) y consume 687–814 tokens de mediana, lo que afecta a la latencia en producción.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de alucinación ni de sesgos; al ser un modelo de decisión con opciones cerradas, el riesgo se concentra en la calibración de las probabilidades.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.8-27B tiene sus propias condiciones que deben verificarse por separado.
- Madurez: el modelo se publicó el 2 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni comunidad establecida.
- Dependencia de infraestructura propia: el endpoint `/v1/decide` requiere el `serve.sh` del autor o una integración con vLLM; no es un modelo estándar de `transformers` para generación directa sin ese envoltorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lysandre/JEV-27B-VL
- Blog del autor: https://huggingface.co/blog/autotrust/one-decision-model-instead-of-a-ranking-team-short
- Demo en vivo (GuruSearch): https://news.guru.so/ui
- Paper ERQA (Gemini Robotics): https://github.com/embodiedreasoning/ERQA
- Referencia arXiv 2609.14973 (citada en los tags): https://arxiv.org/abs/2609.14973
- Referencia arXiv 2512.16899 (citada en los tags): https://arxiv.org/abs/2512.16899
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
