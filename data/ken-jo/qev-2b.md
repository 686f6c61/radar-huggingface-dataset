# ken-jo/QEV-2B

## Resumen

QEV-2B es un modelo de decisión multimodal de 2.213 millones de parámetros desarrollado por ken-jo, afinado a partir de Qwen/Qwen3.5-2B. A diferencia de los modelos generativos convencionales, QEV-2B no produce texto libre: recibe evidencia (texto e imágenes) junto con un conjunto de opciones candidatas con sus significados, y devuelve en un único forward pass una probabilidad calibrada para cada opción, una respuesta tipada y una señal de abstención. Está pensado para tareas de clasificación y decisión donde se requiere una salida estructurada y cuantificada, no una generación abierta.

La versión actual (v3) se centra en reducir el sobreajuste al formato de entrenamiento: diversifica los distractores, admite entre 3 y 6 opciones (frente a las 4 fijas anteriores) y re-renderiza parte de los ítems de Mind2Web. El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y una librería propia (`qev`). Su relevancia radica en ofrecer un pipeline de decisión calibrada con abstención a un tamaño que cabe en hardware de consumo, compitiendo con modelos de 4B o más en el índice público de decisión visual.

El modelo está orientado al inglés y a tareas de clasificación zero-shot con entrada multimodal (visión y texto). Su punto fuerte declarado es la calibración de probabilidades y el mecanismo de early-exit, que permite descartar opciones de forma temprana y reducir cómputo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-2B) con cabeza de decisión tipada; no disponible el detalle exacto de la cabeza |
| Parámetros totales | 2.213.241.664 (2,21B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | zero-shot-classification |
| Librería | qev |
| Tamaño del repositorio | 8,9 GB |
| Modelo base | Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

QEV-2B parte de Qwen3.5-2B, un transformer multimodal, y se afina para una tarea de decisión tipada: dada una evidencia (texto y una o más imágenes) y un conjunto de opciones con sus significados, el modelo emite probabilidades calibradas por opción, una respuesta tipada y una señal de abstención, todo en un solo forward pass sin generar tokens. La model card menciona explícitamente mecanismos de calibración de probabilidades, abstención y early-exit, aunque no detalla la implementación interna de la cabeza de decisión ni la composición exacta del dataset de entrenamiento en términos de número de tokens.

El entrenamiento de la versión v3 se orientó a reducir el sobreajuste al formato. En la versión anterior, cada opción incorrecta se construía a partir de la respuesta a otra pregunta sobre la misma imagen, siempre con 4 opciones. La mezcla v3 conserva ese esquema como máximo en el 35% de los ítems; el resto emplea respuestas de otras imágenes, valores perturbados y anotaciones de la misma imagen, con entre 3 y 6 opciones. Además, el 60% de los ítems de Mind2Web se re-renderizan, 707 ítems de presencia de campo de CORD incluyen señuelos de texto de recibo, y se añaden 157 filas de entrenamiento nuevas (127 de Hateful Memes, 30 de A-OKVQA). La selección del checkpoint se hizo exclusivamente sobre conjuntos DEV (media del conjunto de selección de formato original y un DEV con distractores desplazados), sin usar filas de evaluación pública, y se excluyeron imágenes de entrenamiento con distancia dHash ≤ 4 respecto a cualquier imagen de evaluación. No se especifica en la información disponible si hubo RLHF o DPO.

## Capacidades

- Clasificación zero-shot multimodal: acepta texto e imágenes y devuelve una probabilidad calibrada por cada opción candidata.
- Decisiones tipadas: la salida incluye una respuesta con tipo definido, no texto libre generado.
- Abstención explícita: el modelo puede señalar que no dispone de evidencia suficiente para decidir.
- Early-exit: descarte temprano de opciones para reducir cómputo, con un modo rápido ("fast mode") que limita la profundidad y el número de imágenes.
- Manejo de entre 3 y 6 opciones candidatas con distractores diversos.
- Capacidades de visión aplicadas a gráficos, documentos, infografías, capturas de pantalla y memes.
- Evaluado en tareas de moderación de contenido (Hateful Memes), extracción de información de documentos (CORD, FUNSD), comprensión de gráficos (ChartQA, CharXiv), razonamiento visual (BLINK, RealWorldQA, CV-Bench) y grounding composicional (Winoground).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Moderación de contenido multimodal: clasificar memes e imágenes con texto como aptos o no aptos, usando la probabilidad calibrada y la señal de abstención para derivar los casos ambiguos a revisión humana. El modelo obtuvo un 66,03% de accuracy bruta en Hateful Memes, lo que lo hace adecuado como primera capa de filtrado, no como decisor final.
- Extracción de campos de documentos: decidir la presencia o el valor de campos en recibos y formularios (CORD, FUNSD), con un 95,46% de accuracy bruta en KIE. La salida tipada facilita la integración en pipelines de procesamiento documental sin post-procesar texto generado.
- Enrutamiento de tickets de soporte: dado un mensaje y una captura de pantalla, asignar el ticket a una categoría entre 3 y 6 opciones con una probabilidad calibrada, permitiendo umbrales de confianza y abstención cuando la evidencia es insuficiente.
- Comprensión de gráficos e infografías: responder preguntas de opción múltiple sobre ChartQA, CharXiv o InfographicVQA (85,66% de accuracy bruta en esta última), útil para asistentes de análisis de datos que necesitan seleccionar una respuesta entre candidatas en lugar de generar texto.
- Automatización de flujos web: decidir la siguiente acción o el elemento correcto en una página (Mind2Web, 87,05% de accuracy bruta), con la ventaja de una salida estructurada y probabilística que permite políticas de fallback.
- Verificación de correspondencia imagen-texto: tareas de grounding composicional como Winoground (83,00% de accuracy bruta), para filtrar pares imagen-caption en datasets o en sistemas de búsqueda multimodal.
- Clasificación de escenas y objetos con abstención: usar CV-Bench (83,07% de accuracy bruta) para etiquetar imágenes entre opciones predefinidas, con la señal de abstención como control de calidad en anotación semiautomática.

## Benchmarks y rendimiento

Los resultados son autoevaluados por el autor ("self-scored") y están pendientes de re-evaluación por el board público. El índice es la media ponderada de puntuaciones corregidas por azar, no la media de accuracy bruta.

| Benchmark | Puntuación corregida por azar (%) | Accuracy bruta (%) | Filas | Peso |
|---|---:|---:|---:|---:|
| CV-Bench | 72,07 | 83,07 | 2038 | 1 |
| BLINK | 48,29 | 66,60 | 961 | 1 |
| RealWorldQA | 55,33 | 72,67 | 589 | 1 |
| CharXiv | 65,41 | 74,06 | 532 | 1 |
| InfographicVQA | 80,87 | 85,66 | 244 | 1 |
| Mind2Web | 82,73 | 87,05 | 973 | 1 |
| Winoground | 66,00 | 83,00 | 800 | 1 |
| KIE (CORD+FUNSD) | 92,52 | 95,46 | 2465 | 1 |
| Moderation (Hateful Memes) | 32,07 | 66,03 | 1213 | 1 |
| R-Bench-M | 15,36 | 29,47 | 665 | 0,5 |
| MMMU-Pro vision | 16,66 | 27,34 | 1730 | 0,25 |
| **Índice** | **62,27** | — | — | — |

Comparativa en el índice público de decisión visual (edición 0.3.2 del board, fila QEV autoevaluada):

| Modelo | Parámetros | Índice (público) |
|---|---:|---:|
| d3-mini | 4,54B | 67,67 |
| RSI-Jev v6.1 VL 4B | 4,66B | 63,01 |
| RSI-Jev v5.0 VL 3B | 4,66B | 62,58 |
| **QEV-2B (autoevaluado)** | **2,21B** | **62,27** |
| Intern-Decision-4B | 4,66B | 61,69 |
| Jev-Omni | 11,96B | 60,10 |
| d3-nano | 2,21B | 59,15 |
| Intern-Decision-2B | 2,27B | 52,92 |
| OneJev1.5-0.8B | 1,11B | 52,32 |

Resultados en DEV con distractores desplazados y en holdout de formato original:

| Conjunto | Versión anterior (%) | Versión actual (%) |
|---|---:|---:|
| DEV con distractores desplazados (9 directorios, media) | 84,90 | 88,79 |
| Holdout de formato original (18 fuentes, media) | 89,15 | 88,96 |
| Índice visual público (autoevaluado) | 61,99 | 62,27 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 2,21B parámetros, en FP16 serían aproximadamente 4,4 GB solo de pesos; el repositorio ocupa 8,9 GB, lo que sugiere pesos en precisión completa o múltiples artefactos. En cuantización de 8 bits cabría en torno a 2,5-3 GB y en 4 bits alrededor de 1,5-2 GB, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una RTX 4090 o una A100/H100 serían suficientes en FP16; una RTX 3090 o 4080 también deberían poder alojar los pesos.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 8 GB o más en FP16, y en tarjetas de 4-6 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: la model card referencia una librería propia (`qev`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Dado que el modelo no genera tokens, los motores de inferencia generativa estándar podrían no ser directamente aplicables.
- Latencia y throughput: la model card menciona un "fast mode" con límite de imágenes y profundidad, y un "worst-case p9" que aparece truncado en la información disponible. No se publican cifras completas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Índice público | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| QEV-2B | 2,21B | 62,27 (autoevaluado) | Apache 2.0 | Hugging Face |
| d3-mini | 4,54B | 67,67 | no disponible | no disponible |
| RSI-Jev v6.1 VL 4B | 4,66B | 63,01 | no disponible | no disponible |
| Intern-Decision-4B | 4,66B | 61,69 | no disponible | no disponible |
| d3-nano | 2,21B | 59,15 | no disponible | no disponible |
| Intern-Decision-2B | 2,27B | 52,92 | no disponible | no disponible |

QEV-2B ofrece un índice competitivo con modelos de más del doble de parámetros (RSI-Jev v6.1 VL 4B, Intern-Decision-4B) y supera a su competidor directo de tamaño similar (d3-nano, Intern-Decision-2B). La comparación es histórica y basada en la edición 0.3.2 del board; la fila de QEV es autoevaluada y el orden no implica ranking oficial de esta versión.

## Limitaciones y advertencias

- Los resultados son autoevaluados y están pendientes de re-evaluación por el board público; las puntuaciones privadas son desconocidas hasta que se re-puntúe esta versión.
- El modelo solo soporta inglés según la model card; no hay evidencia de capacidades multilingües.
- Rendimiento bajo en tareas de razonamiento visual complejo: MMMU-Pro vision obtiene un 27,34% de accuracy bruta y R-Bench-M un 29,47%, muy por debajo de los benchmarks de clasificación.
- La moderación de contenido (Hateful Memes) muestra un 66,03% de accuracy bruta y un 32,07% corregido por azar, insuficiente para uso autónomo en producción sin revisión humana.
- Riesgo de sobreajuste al formato de opciones: aunque la v3 lo mitiga, el propio autor reconoce que la versión anterior estaba sobreajustada a 4 opciones construidas de una forma concreta.
- Riesgo de alucinación: al no generar texto libre, el riesgo se traslada a la calibración de probabilidades; una probabilidad alta no garantiza corrección en dominios fuera de la distribución de entrenamiento.
- No se detallan sesgos conocidos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre el modelo base Qwen3.5-2B más allá de su propia licencia.
- La dependencia de una librería propia (`qev`) puede limitar la portabilidad a stacks de inferencia estándar.
- No se publican requisitos de hardware oficiales ni cifras completas de latencia, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ken-jo/QEV-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Informe técnico (PDF): https://huggingface.co/datasets/ken-jo/decision-index-results/blob/main/reports/QEV-technical-report.pdf
- Dataset de resultados del índice de decisión: https://huggingface.co/datasets/ken-jo/decision-index-results
