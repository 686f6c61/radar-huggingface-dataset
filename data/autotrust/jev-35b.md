# autotrust/JEV-35B

## Resumen

JEV-35B es un modelo de decisión de tipo "System 1" desarrollado por AutoTrust AI, construido como un finetune del modelo base Qwen3.5-35B-A3B. No es un modelo generativo conversacional al uso: su propósito es emitir decisiones tipadas con probabilidades calibradas sobre un conjunto de hasta 256 opciones en una sola pasada, lo que lo sitúa en la categoría de modelos de clasificación y ranking más que en la de asistentes de texto libre. Se distribuye con licencia Apache 2.0 y pesos en safetensors, con un total de 35.951.822.704 parámetros.

El modelo hereda la arquitectura Mixture-of-Experts de su base (aproximadamente 3.000 millones de parámetros activos por token) y añade una capa de decisión que devuelve, para cada consulta, una distribución de probabilidad sobre las alternativas presentadas. Según la model card, alcanza un índice de 59,73 en la suite pública Decision Index 0.3 (puntuación propia del autor, no una entrada oficial del board) y una latencia mediana de 204 ms por petición en una única GPU B200. Incluye además capacidades de visión heredadas del modelo base, con una puntuación aproximada de 71,94 en la reconstrucción propia de benchmarks visuales del autor.

Su relevancia actual radica en la propuesta de sustituir equipos de ranking compuestos por múltiples modelos por un único modelo de decisión calibrado, con soporte para despliegue en vLLM y una variante cuantizada en NVFP4 que reduce el peso a 25,6 GB y permite ejecución en GPUs de 32-48 GB. El modelo está orientado principalmente al inglés y declara explícitamente no tener afiliación con TypeSafe AI ni con su producto TypeSafe Jev 1.13.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe) |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | aproximadamente 3.000 millones por token (según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (repo principal), NVFP4 (repo separado autotrust/JEV-35B-NVFP4) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

JEV-35B parte de Qwen3.5-35B-A3B, un transformer con capas de mezcla de expertos en el que solo una fracción reducida de los parámetros se activa por token (del orden de 3.000 millones sobre 35.951 millones totales). Sobre esa base, AutoTrust AI ha realizado un finetune orientado a la emisión de decisiones tipadas: el modelo recibe una consulta junto con un conjunto de opciones (hasta 256 en una sola pasada) y devuelve una distribución de probabilidad calibrada sobre ellas, en lugar de texto generado de forma autorregresiva. La model card describe dos modos de operación: "System 1", que responde directamente con la distribución de decisión, y "System 2", en el que se activa el modelo base sin modificar para razonar primero y luego se combina su distribución de respuesta al 50/50 con la de System 1.

El entrenamiento de decisión se realizó únicamente con datos de texto, sin incluir datos de robótica ni de interacción encarnada, según declara el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la interfaz de decisión: una API `POST /v1/decide` que devuelve opciones puntuadas con probabilidades calibradas, pensada para integrarse en pipelines de ranking y recomendación sin necesidad de postprocesar texto libre.

## Capacidades

- Decisión tipada sobre conjuntos de hasta 256 opciones en una sola pasada, con probabilidades calibradas por opción.
- Clasificación de texto mediante la pipeline `text-classification`, con salida de scores por alternativa.
- Ranking y reordenación de resultados (por ejemplo, re-ranking de resultados de buscadores).
- Razonamiento visual: procesa preguntas de opción múltiple con una o varias imágenes (image-text-to-text), incluyendo razonamiento espacial, de acción, de trayectoria y estimación de estado.
- Modo "System 2" opcional: activa el razonamiento del modelo base antes de emitir la decisión y combina ambas distribuciones.
- Soporte de despliegue en vLLM y servicio propio mediante `serve.sh` con API compatible con endpoints.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés.
- No dispone de modo de pensamiento propio en la variante de 35B (el thinking se documenta para JEV-27B-VL).

## Casos de uso

- Re-ranking de resultados de búsqueda: el modelo recibe los resultados de varios motores (Google News, Bing News, Yahoo News) y devuelve un orden por relevancia con probabilidades calibradas, tal como se muestra en la demo GuruSearch del autor.
- Recomendación de contenidos: selección y ordenación de titulares de múltiples fuentes por importancia, aprovechando la capacidad de evaluar hasta 256 candidatos en una sola pasada con latencia de alrededor de 200 ms.
- Moderación y clasificación de contenido: asignación de categorías tipadas a textos entrantes con scores calibrados, integrable en pipelines de premoderación o triaje.
- Enrutamiento de consultas: decisión sobre a qué modelo, herramienta o cola debe dirigirse una petición entrante, usando la distribución de probabilidad como señal de confianza.
- Razonamiento encarnado y robótica: respuesta a preguntas de opción múltiple sobre escenas físicas (ERQA), útil para módulos de percepción y planificación que necesitan elegir entre acciones o estados discretos.
- Selección de respuestas en sistemas de generación aumentada: dado un conjunto de respuestas candidatas de otros modelos, elegir la más probable mediante scoring calibrado.
- Evaluación automática de tareas: verificación de si una tarea se completó correctamente a partir de imágenes y una pregunta binaria o de opción múltiple.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| Decision Index 0.3, suite pública | decision_index | 59,73 | Puntuación propia del autor con su kit; no es entrada oficial del board |
| Decision Index 0.3, suite pública (NVFP4) | decision_index | 59,18 | Variante cuantizada |
| Reconstrucción propia de benchmarks de visión | score aproximado | 71,94 | Rebuild del autor; JEV-27B-VL obtiene 71,67 en el mismo rebuild |
| ERQA (razonamiento encarnado) | precisión, una pasada | 51,3 % | Sin entrenamiento con datos de robots; 400 preguntas, intervalo del 95 % de aproximadamente ±5 puntos |
| Latencia mediana por petición | ms | 204 ms | Una única GPU B200; JEV-27B-VL: 271 ms |

Comparaciones declaradas por el autor: en Decision Index 0.3, JEV-27B-VL obtiene 53,64 en el board frente a los 59,73 de JEV-35B. En ERQA, PhysBrain 1.5 alcanza 52,8 (mejor modelo encarnado abierto del informe citado) y otros modelos encarnados abiertos de 7-9B se sitúan entre 42,3 y 47,5; JEV-27B-VL con thinking llega a 61,5. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para bf16: aproximadamente 66,5 GiB solo para pesos (descarga de 72 GB); se recomienda GPU de 80 GB para dejar margen a caché KV y overhead.
- VRAM para NVFP4: aproximadamente 23,3 GiB para pesos (descarga de 25,6 GB); ejecutable en una GPU de 32-48 GB.
- GPUs recomendadas: B200 para la latencia declarada de 204 ms; A100 80 GB o H100 80 GB para bf16; RTX 4090 (24 GB) no es suficiente para bf16, pero la variante NVFP4 podría ajustarse en GPUs de 32 GB o superiores.
- Despliegue: vLLM (soportado explícitamente y etiquetado), servicio propio mediante `serve.sh` con API compatible con endpoints, transformers.
- Latencia: mediana de 204 ms por petición en una B200 con la configuración del autor; la variante NVFP4 mantiene la misma latencia según la model card.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (público) | Visión (rebuild) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| autotrust/JEV-35B | 35,95 B (aproximadamente 3 B activos) | no disponible | 59,73 | 71,94 | Apache 2.0 | Pesos abiertos en Hugging Face |
| autotrust/JEV-35B-NVFP4 | 35,95 B (aproximadamente 3 B activos) | no disponible | 59,18 | 71,23 | Apache 2.0 | Pesos abiertos en Hugging Face |
| autotrust/JEV-27B-VL | no disponible | no disponible | 53,64 (board) | 71,67 | no disponible | Pesos abiertos en Hugging Face |
| TypeSafe Jev 1.13 | no disponible | no disponible | no disponible | no disponible | propietaria (modelo alojado) | Solo servicio gestionado |

La comparación con modelos de propósito general como Qwen3.5-35B-A3B no es directa, ya que JEV-35B está especializado en decisión tipada y no en generación de texto libre. No se dispone de datos de benchmarks comparables con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo declara únicamente soporte de inglés; su uso en castellano u otros idiomas no está validado.
- El Decision Index 0.3 es una métrica propia del autor calculada con su propio kit, no una entrada oficial del board; la comparación con otros modelos debe tomarse con cautela.
- El resultado en ERQA (51,3 %) tiene un intervalo de confianza del 95 % de aproximadamente ±5 puntos con 400 preguntas, por lo que las diferencias de pocos puntos no son significativas.
- No dispone de modo de pensamiento propio en esta variante; el razonamiento en dos fases solo está documentado para JEV-27B-VL.
- Al ser un modelo de decisión y no un generador de texto, no es adecuado para tareas conversacionales abiertas ni para generación de código o matemáticas.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgo en la información disponible; al heredar el modelo base Qwen3.5, puede arrastrar los sesgos de sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que el modelo no está afiliado ni respaldado por TypeSafe AI, pese a la similitud de nombre con su producto TypeSafe Jev 1.13.
- La longitud de contexto no está especificada, lo que dificulta planificar su uso en documentos largos.
- El entrenamiento de decisión se realizó solo con texto; las capacidades visuales provienen del modelo base y no de un entrenamiento específico de decisión multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/JEV-35B
- Variante NVFP4: https://huggingface.co/autotrust/JEV-35B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelo relacionado JEV-27B-VL: https://huggingface.co/autotrust/JEV-27B-VL
- Blog del autor: https://huggingface.co/blog/autotrust/one-decision-model-instead-of-a-ranking-team-short
- Demo en vivo (GuruSearch): https://news.guru.so/ui
- Benchmark ERQA: https://github.com/embodiedreasoning/ERQA
- Paper citado en los tags: arxiv:2609.14973 (https://arxiv.org/abs/2609.14973)
