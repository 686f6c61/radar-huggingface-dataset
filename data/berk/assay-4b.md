# Berk/assay-4b

## Resumen

Assay-4b es un modelo de decisión calibrado desarrollado por el usuario Berk, construido sobre el backbone Qwen/Qwen3-4B-Base mediante un adaptador LoRA (r=16, alpha=32) ya fusionado en los pesos publicados. Su particularidad es que no genera texto: recibe un estado (por ejemplo, el texto de una reclamación de cliente) y un conjunto de preguntas tipadas con nombre (`noul` para sí/no, `choice` sobre 2 a 255 opciones descritas y `score` sobre 2 a 10 niveles ordenados), y devuelve directamente una distribución de probabilidad por pregunta, una confianza y una puntuación de evidencia. La respuesta se lee de los logits del propio modelo sobre los tokens de las etiquetas de opción en una única posición de decisión, de modo que es imposible que la salida se desvíe del esquema definido.

El modelo resuelve un problema concreto de ingeniería: sustituir la generación libre por decisiones estructuradas y calibradas en una sola pasada hacia delante. Frente a un LLM generativo que hay que parsear y validar, assay-4b elimina el riesgo de salidas fuera de formato y reduce la latencia, ya que varias preguntas sobre un mismo estado se empaquetan como ramas aisladas con máscara de atención en bloque y posiciones reiniciadas, produciendo resultados idénticos a los de peticiones separadas. Con 4.022.468.096 parámetros y licencia Apache 2.0, es desplegable en una GPU de consumo.

Es relevante ahora porque ofrece una vía de calibración explícita en producción: se entrena con entropía cruzada contra objetivos blandos (distribuciones humanas cuando existen, suavizado SORD para preguntas ordinales, one-hot en el resto), incorpora una cabeza de evidencia lineal que estima si el estado soporta la pregunta y aplica una temperatura global de 1,239 ajustada en el split de calibración. Los datos de evaluación del autor muestran ECE de 0,021 en tareas no vistas tras escalado y una tasa de errores confiados (p ≥ 0,9 e incorrectos) del 1,8 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Base) con adaptador LoRA fusionado (r=16, alpha=32) y cabeza de evidencia lineal sobre el token de decisión |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (el repositorio publica pesos safetensors en bf16; no se anuncian GGUF ni cuantizaciones de 8 o 4 bits) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); adaptador LoRA en `adapter/` y cabeza de evidencia en `assay_head.safetensors` |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer decoder-only Qwen3-4B-Base al que se le añade un adaptador LoRA de rango 16 y alpha 32, entrenado con learning rate 5e-05, una época y batch de 8; los pesos fusionados están en el repositorio principal y el adaptador sin fusionar en `adapter/`. La decisión no se genera token a token: se lee la distribución del siguiente token restringida a los tokens de etiqueta de cada opción en una única posición de decisión, de modo que la competencia zero-shot del modelo base es el punto de partida. Cada pregunta se implementa como una rama aislada sobre un estado compartido mediante máscara de atención en bloque y posiciones reiniciadas, lo que garantiza que el empaquetado de varias preguntas y las peticiones separadas produzcan exactamente el mismo resultado.

El entrenamiento usa entropía cruzada contra objetivos blandos: distribuciones de etiquetas humanas cuando el conjunto de origen las tiene, niveles suavizados con SORD para preguntas ordinales y one-hot en el resto, barajando las opciones de las preguntas de tipo `choice` en cada ejemplo. La cabeza de evidencia es una capa lineal sobre el token de decisión, entrenada con negativos por intercambio de pasajes, que predice si el estado respalda la pregunta formulada. Sobre la calibración se aplica una temperatura global de 1,239 ajustada en el split de calibración de las tareas de entrenamiento y aplicada sin cambios en el resto de evaluaciones. Los datos de entrenamiento son 55 conjuntos públicos de clasificación, inferencia, comprensión lectora y preferencias, renderizados como preguntas tipadas con opciones descritas (el listado completo y las rúbricas están en `assay/data/tasks.py` del repositorio); cada conjunto conserva su propia licencia.

## Capacidades

- Decisiones tipadas en una pasada: preguntas `noul` (sí/no), `choice` (de 2 a 255 opciones descritas) y `score` (de 2 a 10 niveles ordenados), con distribución de probabilidad por pregunta.
- Salida siempre conforme al esquema: al no generar texto, no puede producir respuestas fuera de formato.
- Confianza calibrada por respuesta y temperatura global fija (1,239), con métricas de ECE bajas tras escalado.
- Puntuación de evidencia: estima si el estado de entrada soporta realmente la pregunta, útil para decidir cuándo abstenererse o derivar a revisión humana.
- Clasificación zero-shot sobre tareas no vistas: once conjuntos nunca usados en entrenamiento (bbc_news, app_reviews, scitail, medical_questions_pairs, tweet_irony, ethos, stance_climate, dream, copa, truthful_qa, hh_rlhf) con 0,798 de accuracy agregada.
- Inferencia en lote de preguntas: varias preguntas sobre un mismo estado se empaquetan con máscara de atención en bloque sin pérdida de fidelidad respecto a peticiones separadas.
- Clasificación textual e inferencia de lenguaje natural: emotion, sciq, qnli, paws, mmlu y tweet_offensive aparecen entre las fuentes de transferencia evaluadas.
- Idiomas: únicamente inglés, tanto en entrenamiento como en la metadata del modelo.
- No soporta tool calling ni function calling, agentes, ni razonamiento multi-paso; tampoco visión, audio ni modo de pensamiento.

## Casos de uso

- Triaje de tickets de soporte: con una pregunta `choice` se enruta cada ticket al equipo correcto (por ejemplo, "billing" frente a "technical") a partir del texto del caso, obteniendo además la probabilidad de cada opción para fijar umbrales de derivación automática.
- Enrutado de intención en asistentes conversacionales: el modelo actúa detrás de un sistema generativo y clasifica la intención del turno del usuario en una sola pasada de unos 23 ms, reduciendo el coste frente a una llamada generativa completa.
- Moderación de contenido: evaluación de toxicidad y ofensividad con etiquetas `noul`, con la confianza calibrada como criterio para escalar a revisión humana; en la fuente tweet_offensive del suite de transferencia obtiene 0,700 de accuracy.
- Puntuación ordinal de calidad o urgencia: las preguntas de tipo `score` con suavizado SORD permiten asignar niveles ordenados (por ejemplo, severidad de 1 a 10) conservando la distancia entre niveles en lugar de tratarlos como categorías independientes.
- Detección de contradicción y verificación de consistencia: aplicable a la comparación de pares de frases, con 0,900 de accuracy en qnli y 0,725 en paws en la evaluación de transferencia, útil en control de calidad documental o generación aumentada por recuperación.
- Abstención en pipelines de generación aumentada por recuperación: la cabeza de evidencia permite decidir si el contexto recuperado respalda la pregunta antes de responder, evitando respuestas apoyadas en pasajes irrelevantes.
- Etiquetado de preferencias y evaluación automática: entrenado sobre conjuntos de preferencias (hh_rlhf entre las tareas no vistas), puede puntuar pares de respuestas dentro de un esquema tipado y con confianza explícita.
- Análisis de sentimiento y emoción a escala: clasificación de reseñas y textos cortos con distribuciones calibradas, apropiado para agregaciones donde importa más la fiabilidad probabilística que la etiqueta puntual; en la fuente emotion registra 0,603 de accuracy, la más baja del suite, por lo que conviene tratarla con umbrales conservadores.

## Benchmarks y rendimiento

Resultados publicados en la model card (raw = sin escalado, scaled = con escalado de temperatura; Brier es la suma multiclase de errores al cuadrado en el rango 0..2, ECE con 15 bins y "errores confiados" son respuestas con p ≥ 0,9 que resultan incorrectas):

| Split | n | Accuracy | Brier | NLL | ECE | Errores confiados |
|---|---|---|---|---|---|---|
| Tareas vistas (dev), raw | 5513 | 0,776 | 0,309 | 0,588 | 0,053 | 0,041 |
| Tareas vistas (dev), scaled | 5513 | 0,776 | 0,304 | 0,571 | 0,037 | 0,026 |
| Tareas no vistas (holdout), raw | 2020 | 0,798 | 0,283 | 0,517 | 0,036 | 0,027 |
| Tareas no vistas (holdout), scaled | 2020 | 0,798 | 0,280 | 0,498 | 0,021 | 0,018 |
| kev transfer-v4 dev, raw | 764 | 0,770 | 0,317 | 0,574 | 0,095 | 0,051 |
| kev transfer-v4 dev, scaled | 764 | 0,770 | 0,307 | 0,541 | 0,067 | 0,034 |

Desglose por fuente del suite público jaredpalmer/kev-suites (ninguna de sus fuentes está en los datos de entrenamiento):

| Fuente de transfer-v4 | n | Accuracy | Brier | ECE |
|---|---|---|---|---|
| composition_held_and_or | 32 | 0,844 | 0,209 | 0,158 |
| composition_held_conditional | 32 | 0,750 | 0,236 | 0,198 |
| composition_held_or_not | 32 | 0,812 | 0,321 | 0,163 |
| contrastive_authorization | 40 | 1,000 | 0,000 | 0,004 |
| contrastive_deadline | 40 | 0,600 | 0,434 | 0,210 |
| emotion | 116 | 0,603 | 0,525 | 0,104 |
| mmlu | 116 | 0,707 | 0,397 | 0,120 |
| paws | 80 | 0,725 | 0,395 | 0,175 |
| qnli | 80 | 0,900 | 0,149 | 0,061 |
| sciq | 116 | 0,940 | 0,082 | 0,044 |
| tweet_offensive | 80 | 0,700 | 0,403 | 0,184 |

Latencia medida en una RTX 5090 en bf16 con transformers, comparando preguntas empaquetadas sobre un estado frente a peticiones separadas:

| Preguntas | Empaquetado (ms) | Separado (ms) |
|---|---|---|
| 1 | 23,1 | 22,6 |
| 3 | 22,7 | 68,5 |
| 6 | 29,6 | 137,4 |
| 12 | 39,2 | 273,6 |
| 24 | 56,7 | 547,5 |

No se han publicado resultados de benchmarks adicionales (MMLU completo, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16 los pesos ocupan aproximadamente 8 GB (el repositorio completo son 8,2 GB, incluyendo adaptador y cabeza), por lo que la inferencia requiere del orden de 9 a 10 GB considerando activaciones y caché en el escenario medido.
- GPU recomendadas: cualquier GPU con 24 GB o más, como RTX 3090, RTX 4090 o A100 40 GB; el autor publica medidas de latencia sobre una RTX 5090.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB, RTX 5090 de 32 GB). Con 12 GB el margen es muy ajustado y no se documentan cuantizaciones de 8 o 4 bits que lo reduzcan.
- Opciones de despliegue: la ruta de referencia es la librería `transformers` con el paquete `assay` del repositorio (`AssayModel.from_pretrained`), que implementa la lectura de logits, la máscara en bloque y la cabeza de evidencia. El modelo lleva las etiquetas `text-embeddings-inference` y `endpoints_compatible`, orientadas a despliegue gestionado; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que la salida depende de una cabeza y de un esquema propios.
- Latencia y throughput: entre 22,6 y 23,1 ms para una pregunta, 39,2 ms para 12 preguntas empaquetadas y 56,7 ms para 24 sobre una RTX 5090 en bf16. El empaquetado escala casi linealmente en número de preguntas con coste marginal bajo (24 preguntas cuestan unas 2,5 veces una sola), mientras que las peticiones separadas crecen de forma proporcional (547,5 ms para 24).
- Almacenamiento: 8,2 GB de repositorio en safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| assay-4b | 4,022 B | No disponible | Apache 2.0 | safetensors (transformers) | 0,798 accuracy y ECE 0,021 en tareas no vistas (escalado) |
| Qwen/Qwen3-4B-Base | ~4 B (familia) | No disponible | Apache 2.0 | safetensors | No disponible en la información proporcionada; es el backbone del que parte assay-4b |
| Qwen3-4B (variante instruct de la misma familia) | ~4 B | No disponible | Apache 2.0 | safetensors | No disponible en la información proporcionada |
| Clasificadores encoder ajustados (familias BERT/DeBERTa y similares) | No disponible | No disponible | Varía según modelo | safetensors | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre assay-4b y alternativas de la misma categoría en la información proporcionada. La diferencia funcional relevante frente a un LLM generativo del mismo tamaño es que assay-4b no produce texto libre, sino una distribución calibrada por pregunta tipada, con la contrapartida de que no puede realizar aritmética, conteo, comparación de fechas ni razonamiento multi-paso en una sola pasada.

## Limitaciones y advertencias

- Solo texto y solo inglés: los datos de entrenamiento son en inglés y la metadata declara únicamente `en`.
- Sin aritmética, conteo, comparación de fechas ni razonamiento multi-paso en una pasada; la model card recomienda explícitamente mantener esas operaciones en código.
- La precisión cae cuando el estado de entrada contiene información no relacionada con la pregunta.
- La cabeza de evidencia está entrenada con negativos gruesos de pasajes intercambiados, por lo que su señal es aproximada.
- Las probabilidades están calibradas de forma agregada sobre las distribuciones evaluadas; no es una garantía sobre una respuesta individual ni sobre datos propios. El autor recomienda verificar la calibración con etiquetas propias antes de actuar sobre umbrales.
- Variabilidad notable por tarea: 1,000 en contrastive_authorization frente a 0,600 en contrastive_deadline y 0,603 en emotion dentro del suite de transferencia, con ECE de 0,210 y 0,198 en las tareas composicionales.
- El ECE sin escalado en kev transfer-v4 es de 0,095, casi el triple que el de las tareas no vistas; conviene aplicar el escalado de temperatura antes de usarlo en dominios alejados del entrenamiento.
- Riesgo de alucinación acotado por diseño (no genera texto), pero persiste el riesgo de clasificaciones erróneas con confianza alta: 1,8 % de errores confiados en tareas no vistas y 3,4 % en kev transfer-v4 tras escalado.
- Licencia Apache 2.0 para los pesos, con uso comercial permitido; no obstante, los 55 conjuntos de entrenamiento conservan sus licencias individuales, lo que debe revisarse si se redistribuye el modelo o se usa en dominios sensibles.
- Sin datos publicados sobre cuantizaciones, lo que limita el despliegue en GPUs con menos de 16 GB.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de terceros ni ecosistema de herramientas asentado.
- Se desconoce la longitud de contexto operativa en la configuración de despliegue, dato no publicado en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berk/assay-4b
- Repositorio con código, servidor y receta de entrenamiento: https://github.com/bgokden/assay
- Conjunto de datos del suite de transferencia: https://huggingface.co/datasets/jaredpalmer/kev-suites
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas no relacionadas (Power Query de Microsoft, Query.ai, Query Juriste) que no aportan información sobre assay-4b.
