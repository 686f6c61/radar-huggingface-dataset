# join3r/stem-gte-memory

## Resumen

Stem GTE Memory es un modelo de reranking (text-ranking) derivado por fine-tuning de Alibaba-NLP/gte-multilingual-reranker-base, publicado por el usuario join3r en Hugging Face. Su función no es la generación de texto, sino puntuar la relevancia de hechos de memoria almacenados y de habilidades (procedimientos paso a paso) respecto al mensaje actual de un usuario, dentro de un asistente personal llamado Stem. El modelo devuelve un logit crudo por par (consulta, documento): cuanto mayor es el valor, mayor es la relevancia.

La versión disponible es la release ONNX q8 de octubre de 2026 (ID `gte-memory-20261021`), que continúa la release de septiembre (`gte-memory-20260905-epoch2`) añadiendo entrenamiento para selección de habilidades, mientras que la puntuación de hechos se mantiene en el modelo de septiembre. El repositorio ocupa 0,7 GB y los cinco ficheros de inferencia suman 358.119.414 bytes (341,53 MiB), con el grafo cuantizado de 341.032.790 bytes.

Es relevante para desarrolladores que construyen asistentes con memoria persistente y sistema de habilidades, porque ejemplifica un patrón de reranking especializado con umbrales calibrados por caso de uso y un contrato de inferencia explícito en Transformers.js. No obstante, sus resultados están acotados a un único asistente y a un usuario, y el propio autor los presenta como métricas de alcance limitado, no como ranking universal de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer reranker (cross-encoder) derivado de Alibaba-NLP/gte-multilingual-reranker-base; `model_type: new` con implementación upstream `Alibaba-NLP/new-impl` |
| Parámetros totales | no disponible (el modelo base es de escala base; el repo solo publica el grafo ONNX cuantizado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por par, incluyendo tokens especiales; Stem rechaza pares más largos y no se ha validado la calidad en contexto largo |
| Tipos de cuantización | q8 (ONNX quantized); no se incluyen pesos FP32 |
| Idiomas soportados | cs, sk, de, en (checo, eslovaco, alemán, inglés); las consultas de entrenamiento están en esos cuatro idiomas y los hechos y descripciones de habilidades almacenados están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, opset 17) más `config.json`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`; no hay checkpoint PyTorch |

## Arquitectura y entrenamiento

El modelo es un reranker cross-encoder: recibe un par (consulta, documento) tokenizado y produce un único logit finito que indica relevancia. Se ejecuta una pareja por forward pass, de forma secuencial, y no debe aplicarse sigmoide ni reinterpretarse el logit como probabilidad. La exportación conserva el `model_type: new` del upstream, por lo que debe cargarse con `PreTrainedModel` de Transformers.js y no con el cargador automático de clasificación de secuencias; el `config.json` mantiene el `auto_map` original, aunque la ruta ONNX soportada no ejecuta código Python remoto.

El entrenamiento tiene dos etapas. La de septiembre usó 23.684 pares binarios de hechos procedentes de 88 perfiles ficticios, con consultas equilibradas entre checo, eslovaco, alemán e inglés. La de octubre parte de los pesos epoch2 de septiembre y entrena con pares (mensaje, habilidad) donde cada documento incluye la descripción de la habilidad y sus peticiones de ejemplo, etiquetados como 1 si el mensaje requiere esa habilidad; los candidatos son las 8 habilidades con mayor coseno según EmbeddingGemma 2 más cualquier habilidad necesaria. Las fuentes de la etapa de octubre incluyen 1.469 mensajes reales del asistente entre junio y septiembre de 2026, etiquetados por dos LLM ciegos con un 96 % de acuerdo y adjudicación por LLM, y 2.527 mensajes sintéticos en checo, eslovaco, alemán e inglés, conservados solo cuando un etiquetador ciego coincidía con el autor.

## Capacidades

- Puntuación de relevancia de hechos de memoria almacenados frente al mensaje actual del usuario, con soporte de hasta dos mensajes previos elegibles recortados a 400 puntos de código Unicode.
- Puntuación de relevancia de habilidades descritas como `name\ndescription` y `name\n<example request>`, tomando el máximo sobre hasta cuatro peticiones de ejemplo por habilidad.
- Reranking sobre listas cortas: hasta 24 hechos candidatos y 4 habilidades candidatas preseleccionadas por similitud de embeddings (EmbeddingGemma 2).
- Umbrales calibrados específicos por tarea: −1,6370911598205566 para hechos, −0,5 para habilidad con mejor de descripción y ejemplos, −3,25 para habilidad solo con descripción, y margen adicional de +2 para hechos sensibles.
- Multilingüismo de consulta en checo, eslovaco, alemán e inglés, con documentos almacenados en inglés.
- Inferencia local en Node.js mediante Transformers.js, con ejemplo funcional `example.mjs`.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un componente de ranking.

## Casos de uso

- Selección de memoria en asistentes personales: el modelo puntúa hasta 24 hechos candidatos recuperados por embeddings y activa solo los que superan el umbral de −1,637, lo que permite inyectar en el prompt únicamente recuerdos relevantes y reducir el consumo de contexto.
- Carga dinámica de habilidades en un agente: con un umbral de −0,5 sobre el máximo entre descripción y peticiones de ejemplo, el asistente decide qué procedimientos cargar; en la evaluación del autor se cargaron 44 de 81 habilidades necesarias con 17 cargas erróneas en 815 turnos.
- Desambiguación de intenciones con historial corto: el formato de consulta incluye hasta dos mensajes previos del usuario recortados a 400 caracteres, útil para resolver referencias como "hazlo otra vez" antes de buscar en memoria.
- Filtrado de recuerdos sensibles: el margen adicional de +2 sobre el umbral estándar permite exigir mayor evidencia antes de activar hechos marcados como sensibles, reduciendo exposiciones indebidas.
- Reranking de documentación interna multilingüe: aunque entrenado para memoria y habilidades, el par (consulta, documento) admite otros usos de ranking en checo, eslovaco, alemán e inglés, siempre que se recalibren los umbrales.
- Despliegue en el borde o en servidores modestos: al ser un grafo ONNX q8 de 341 MB ejecutable con Transformers.js en Node.js, puede integrarse en servicios ligeros sin GPU dedicada, con verificación de integridad por SHA-256 contra `stem-model.json`.
- Evaluación de pipelines de memoria: sirve como componente reproducible para comparar estrategias de recuperación (número de candidatos, recorte de historial, umbrales) manteniendo fijo el reranker.

## Benchmarks y rendimiento

| Evaluación | Modelo de octubre 2026 | Modelo de septiembre 2026 |
|---|---|---|
| Turnos reales de asistente evaluados | 815 | 815 |
| Habilidades necesarias cargadas (de 81) | 44 | 42 |
| Turnos con habilidad incorrecta cargada | 17 | 35 |
| Selección de hechos en umbral sin cambios | dentro de unos pocos puntos porcentuales del modelo de septiembre | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR u otros) en la información disponible. Las cifras anteriores son métricas internas de un único asistente y un único usuario, medidas en la imagen de servidor Linux de Stem con sus umbrales, y no constituyen un ranking universal.

## Requisitos de hardware

- VRAM estimada: el grafo ONNX q8 ocupa 341.032.790 bytes; en CPU el consumo de memoria es moderado y no requiere GPU, aunque no se publican cifras de VRAM ni de RAM pico.
- GPU recomendadas: no disponibles; el autor no documenta requisitos de GPU y el ejemplo oficial usa Node.js con Transformers.js.
- GPU de consumo: el tamaño del grafo (aproximadamente 341 MB) es compatible con GPUs de consumo, pero no se ha validado ni documentado el rendimiento en ellas.
- Opciones de despliegue: Transformers.js `PreTrainedModel` en Node.js (ruta soportada, con `example.mjs`); otras runtimes ONNX no están documentadas por el autor.
- Latencia y throughput: no disponibles. La inferencia es secuencial, un par por forward pass, lo que limita el paralelismo a nivel de modelo y hace que el throughput dependa del número de pares a puntuar.
- Almacenamiento: repositorio de 0,7 GB; conviene fijar una revisión del Hub y verificar los cinco ficheros de inferencia contra los hashes de `stem-model.json`.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| join3r/stem-gte-memory | Reranker cross-encoder fine-tuned | 8.192 tokens por par | cs, sk, de, en | Apache 2.0 | ONNX q8 | Umbrales calibrados para memoria y habilidades de un asistente concreto |
| Alibaba-NLP/gte-multilingual-reranker-base | Reranker cross-encoder base | no disponible en la información proporcionada | multilingüe (según upstream) | no disponible en la información proporcionada | pesos PyTorch (upstream) | Modelo de partida; el fine-tuned añade calibración y dominio específico |
| EmbeddingGemma 2 | Modelo de embeddings | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Usado por Stem para la preselección por coseno, no como reranker; no es comparable en tarea |

No se dispone de datos de benchmarks comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Resultados acotados: las métricas de 815 turnos provienen de un único asistente y un único usuario, y el autor las describe explícitamente como no universales.
- Umbrales no portables: los valores de corte pertenecen a este grafo, tokenizador y pipeline exactos, y no son intercambiables con los de la release de septiembre ni válidos como cortes universales.
- Contexto largo no validado: aunque acepta pares de hasta 8.192 tokens, la calidad en contexto largo no se ha validado y Stem rechaza pares más largos en lugar de truncarlos.
- Riesgo de falsos positivos y negativos: en la evaluación de octubre se cargaron 17 habilidades incorrectas y solo 44 de las 81 necesarias, lo que implica fallos de selección en producción.
- Idiomas limitados: consultas en checo, eslovaco, alemán e inglés; los documentos almacenados están en inglés, por lo que otros idiomas no están cubiertos.
- Sin datos de sesgo publicados: no se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.
- Contrato de inferencia estricto: usar el cargador automático de clasificación de secuencias de Transformers.js o aplicar sigmoide al logit produce resultados incorrectos; debe usarse `PreTrainedModel` y leer el logit crudo.
- Integridad y reproducibilidad: deben fijarse revisiones del Hub y verificarse los hashes SHA-256; no se incluyen datos de entrenamiento, transcripciones, ejemplos de benchmark, pesos FP32 ni checkpoints.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse `LICENSE`, `NOTICE` y `TRAINING-SOURCES.md` con los avisos de modificación.
- Madurez: el autor etiqueta el modelo como experimental y la model card está incompleta en la información disponible (la sección de entrenamiento se corta a mitad de la tabla de fuentes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/join3r/stem-gte-memory
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-multilingual-reranker-base
- Implementación upstream `Alibaba-NLP/new-impl`: https://github.com/Alibaba-NLP/new-impl
- Revisión de septiembre: https://huggingface.co/join3r/stem-gte-memory/tree/dae4f76d6974e70cdc007d3ca66d82226791822f
- Ejemplo de inferencia local: `example.mjs` dentro del repositorio del modelo
- Metadatos de integridad y umbrales: `stem-model.json` dentro del repositorio del modelo
