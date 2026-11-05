# reneeice/zils-lite-qev08

## Resumen

QEV-0.8B es un modelo de decisión multimodal de 0,8 mil millones de parámetros desarrollado por el usuario reneeice (con el identificador de repositorio zils-lite-qev08) y afinado a partir de Qwen3.5-0.8B. A diferencia de un modelo generativo convencional, no produce texto token a token: recibe como entrada evidencia (texto e imágenes) junto con un conjunto de opciones candidatas y sus significados, y devuelve en una sola pasada forward una probabilidad calibrada para cada opción, una respuesta tipada y una señal de abstención. Está pensado para tareas de clasificación zero-shot y toma de decisiones tipadas, no para generación abierta.

El modelo pertenece a la familia QEV y se ha destilado del profesor QEV 0.2.1, al igual que QEV-2B. Esta versión concreta (v3) se ha reentrenado para reducir el sobreajuste al formato de entrenamiento: diversifica los distractores, re-renderiza parte de los ítems de Mind2Web y añade decoys de texto en ítems de presencia de campos de CORD. La selección del checkpoint se hace exclusivamente sobre conjuntos DEV, sin usar filas de evaluación pública.

Su relevancia actual radica en que ofrece un enfoque alternativo a los LLM generativos para tareas de clasificación y enrutamiento: una sola pasada, sin generación de tokens, con probabilidades calibradas y capacidad de abstención, lo que resulta atractivo para sistemas de decisión de baja latencia y para pipelines donde la incertidumbre debe ser explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen3.5-0.8B); detalles específicos de la arquitectura de decisión no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se afina como modelo de decisión multimodal con entrada de texto e imagen. La innovación principal es que la inferencia se resuelve en una única pasada forward sin generar tokens: el modelo recibe la evidencia y las opciones candidatas, y emite directamente probabilidades calibradas por opción, una respuesta tipada y una señal de abstención. La arquitectura interna específica del cabezal de decisión no se detalla en la información disponible.

El entrenamiento se basa en destilación desde el profesor QEV 0.2.1. La versión v3 introduce una mezcla de datos revisada: como máximo el 35% de los ítems conserva el esquema original de distractores (respuestas de otras preguntas sobre la misma imagen, con 4 opciones), mientras que el resto usa respuestas de otras imágenes, valores perturbados y anotaciones de la misma imagen, con entre 3 y 6 opciones. El 60% de los ítems de Mind2Web se re-renderizan, 707 ítems de presencia de campos de CORD incorporan decoys de texto de recibo y 157 filas nuevas de train (127 de Hateful Memes, 30 de A-OKVQA) sustituyen a filas eliminadas por el filtro de casi-duplicados. La selección del checkpoint se realiza sobre la media de un conjunto de selección en formato original y un conjunto DEV con distractores desplazados; se excluyen imágenes de entrenamiento a distancia dHash 4 o inferior de cualquier imagen de evaluación.

## Capacidades

- Clasificación zero-shot multimodal: acepta texto e imágenes como evidencia y devuelve probabilidades por opción.
- Decisiones tipadas: la salida incluye una respuesta tipada además de las probabilidades.
- Probabilidades calibradas: las puntuaciones están calibradas para su uso directo en umbrales de decisión.
- Abstención: el modelo emite una señal de abstención cuando la evidencia no permite decidir.
- Salida en una sola pasada forward sin generación de tokens, lo que reduce la latencia frente a esquemas autoregresivos.
- Soporte de múltiples opciones candidatas (3 a 6 opciones en los datos de entrenamiento).
- Capacidades de visión aplicadas a documentos, gráficos, infografías, capturas de pantalla y memes.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un conjunto de categorías posibles, el modelo devuelve la probabilidad de cada categoría y una señal de abstención para derivar a un humano cuando la confianza es baja. Adecuado por su calibración y su salida en una sola pasada.
- Moderación de contenido multimodal: clasificación de memes e imágenes con texto asociado en categorías de riesgo, usando las probabilidades calibradas para fijar umbrales de revisión. Los datos de Hateful Memes en el entrenamiento respaldan este uso.
- Extracción de campos en documentos: verificación de presencia de campos en recibos y formularios (CORD, FUNSD) con decoys de texto, útil en pipelines de digitalización donde se necesita una decisión binaria por campo.
- Clasificación de gráficos e infografías: responder preguntas de opción múltiple sobre ChartQA o InfographicVQA devolviendo la probabilidad de cada opción, para sistemas de análisis documental automatizado.
- Automatización de tareas web: selección de la acción o elemento correcto en flujos de navegación (Mind2Web), como componente de decisión en agentes de automatización con opciones predefinidas.
- Verificación de correspondencia imagen-texto: evaluación de si una descripción corresponde a una imagen (tipo Winoground), útil en sistemas de control de calidad de contenido generado.
- Filtrado previo en pipelines RAG multimodales: decidir si un fragmento recuperado es relevante para una consulta antes de invocar un LLM generativo, reduciendo coste y latencia.

## Benchmarks y rendimiento

Resultados públicos autoevaluados por el autor, pendientes de re-puntuación por el board. El índice es la media ponderada de puntuaciones corregidas por azar, no la media de precisión bruta.

| Benchmark | Puntuación corregida por azar (%) | Precisión bruta (%) | Filas | Peso |
|---|---:|---:|---:|---:|
| CV-Bench | 58,64 | 74,93 | 2038 | 1 |
| BLINK | 30,89 | 55,36 | 961 | 1 |
| RealWorldQA | 38,96 | 62,65 | 589 | 1 |
| CharXiv | 55,89 | 66,92 | 532 | 1 |
| InfographicVQA | 70,49 | 77,87 | 244 | 1 |
| Mind2Web | 77,53 | 83,14 | 973 | 1 |
| Winoground | 51,75 | 75,88 | 800 | 1 |
| KIE (CORD+FUNSD) | 91,78 | 95,01 | 2465 | 1 |
| Moderation (Hateful Memes) | 28,11 | 64,06 | 1213 | 1 |
| R-Bench-M | 15,72 | 29,77 | 665 | 0,5 |
| MMMU-Pro vision | 7,85 | 19,65 | 1730 | 0,25 |
| Índice | 52,70 | — | — | — |

Comparativa en el leaderboard público (edición 0.3.2, fecha 2026-10-16; la fila QEV es autoevaluación de esta versión):

| Modelo | Parámetros | Índice (público) |
|---|---:|---:|
| d3-nano | 2,21B | 59,15 |
| Intern-Decision-2B | 2,27B | 52,92 |
| QEV-0.8B (autoevaluado) | 0,8B | 52,70 |
| OneJev1.5-0.8B | 1,11B | 52,32 |
| d3-lite | 0,85B | 47,88 |
| JPT-0.8B | 0,87B | 44,55 |
| Intern-Decision-0.8B | 0,87B | 38,96 |
| d3-edge | 0,59B | 36,61 |

Resultados en el conjunto DEV con distractores desplazados (9 directorios, media no ponderada): 88,64% de precisión. Resultados en el holdout de formato original (18 fuentes, media no ponderada): 85,15%. La versión anterior obtenía 81,06 y 86,06 respectivamente, y un índice público de 53,02.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en fp32 unos 3,4 GB. Con cuantización a 8 bits o 4 bits el requisito baja a alrededor de 1 GB o 0,5 GB respectivamente, aunque los tipos de cuantización soportados no están documentados.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar los pesos en fp16, aunque el margen para activaciones y procesamiento de imágenes depende de la implementación. Para despliegue en producción se recomienda una GPU con 8 GB o más (RTX 3060/4060 en adelante).
- Cabe en GPU consumer: sí, dado el tamaño del modelo, en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: la librería indicada es qev, específica del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor destaca que la inferencia se resuelve en una sola pasada forward sin generación de tokens, lo que en principio reduce la latencia frente a esquemas autoregresivos, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| QEV-0.8B | 0,85B | no disponible | 52,70 (autoevaluado) | Apache-2.0 | HuggingFace |
| Intern-Decision-0.8B | 0,87B | no disponible | 38,96 | no disponible | HuggingFace |
| JPT-0.8B | 0,87B | no disponible | 44,55 | no disponible | HuggingFace |
| d3-lite | 0,85B | no disponible | 47,88 | no disponible | HuggingFace |
| OneJev1.5-0.8B | 1,11B | no disponible | 52,32 | no disponible | HuggingFace |

QEV-0.8B se sitúa por delante de las alternativas de tamaño similar en el índice público, aunque por detrás de modelos de mayor tamaño como d3-nano (2,21B) e Intern-Decision-2B (2,27B). La comparación de contexto y licencias de los competidores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; el entrenamiento incluye Hateful Memes, lo que puede introducir sesgos específicos de ese conjunto en tareas de moderación.
- Riesgo de alucinación: al no generar texto libre, el riesgo de alucinación se traslada a la asignación de probabilidad a opciones incorrectas; la calibración mitiga pero no elimina este riesgo.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar su uso con documentos largos sin pruebas previas.
- Limitaciones de idioma: solo se declara soporte de inglés (en); el rendimiento en castellano u otros idiomas no está evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B y de los datos de entrenamiento derivados de terceros.
- Las puntuaciones públicas son autoevaluadas y están pendientes de re-puntuación por el board; las puntuaciones privadas se desconocen hasta esa revisión.
- El modelo está diseñado exclusivamente para decisiones tipadas con opciones predefinidas; no es adecuado para generación de texto abierta ni para tareas conversacionales.
- El ecosistema de despliegue (librería qev) es propio del autor y no está integrado en frameworks estándar como vLLM o llama.cpp, lo que puede complicar la puesta en producción.
- El repositorio no registra descargas ni interacciones, lo que sugiere una adopción muy limitada y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reneeice/zils-lite-qev08
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Informe técnico (PDF): https://huggingface.co/datasets/ken-jo/decision-index-results/blob/main/reports/QEV-technical-report.pdf
- Modelo relacionado QEV-2B: https://huggingface.co/ken-jo/QEV-2B
