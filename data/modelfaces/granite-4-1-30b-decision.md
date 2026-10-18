# modelfaces/granite-4.1-30b-decision

## Resumen

Granite 4.1 30B Decision es un modelo de decisión: recibe un documento (el *estado*) y un conjunto de preguntas tipadas sobre él, y devuelve una distribución de probabilidad calibrada sobre las opciones de cada pregunta en un único forward pass, sin generar texto. Lo desarrolla `modelfaces` como adaptador LoRA de rango 16 más una cabeza pointer sobre el backbone denso IBM Granite 4.1 30B base, que permanece congelado. Está pensado para clasificar, enrutar, triar o verificar documentos con umbrales de confianza explícitos.

Su interés práctico está en el formato de salida: en lugar de texto libre, entrega probabilidades que se pueden umbralizar para derivar los casos inciertos a revisión humana, y expone la API System One de TypeSafe (`POST /v1/systemone`) a través del servidor del framework Kev, de modo que el SDK de TypeSafe funciona sin cambios. Soporta tres tipos de pregunta: `choice` (1-255 opciones con descripción opcional), `score` (1-255 niveles ordenados) y `noul` (sí/no).

Es un modelo comunitario independiente, no una release oficial de Kev, TypeSafe ni IBM. Requiere GPU de clase 80 GB para servirse en bf16 y solo está entrenado y evaluado en inglés. La versión v1 se publicó el 17 de octubre de 2026 bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder causal denso (Granite 4.1 30B base) ejecutado en modo prefill-only, con adaptador LoRA y cabeza pointer sobre las opciones |
| Parámetros totales | 28,9B en el backbone (congelado) + ~143M en el adaptador LoRA + 2,1M en la cabeza |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens como máximo en los estados de entrenamiento; contexto máximo en servicio no disponible |
| Tipos de cuantización | bf16 (adaptador de 562 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base también es Apache-2.0 |
| Formato de pesos | `adapter_model.safetensors` (PEFT), `head.pt` (PyTorch) y `adapter_config.json` |
| Precisión de servicio | bf16 |
| Calibración | Una única temperatura, T = 1,74, almacenada en `head.pt` y aplicada al cargar |
| Framework de entrenamiento | Kev (open source), commit `dd375f27fd61486c52204205e10a0d2e10f3b34a` |
| Tarea (pipeline) | `text-classification` (modelo de decisión con salida probabilística) |
| Revisión del modelo base | `ibm-granite/granite-4.1-30b-base` @ `9bb22a92d17f4a51788c4750d32764ed068d94f2` |
| Versión | v1, 2026-10-17 |
| Tamaño del repo | 0,6 GB |

## Arquitectura y entrenamiento

El backbone es el decoder denso de Granite 4.1 30B: 64 capas, tamaño oculto 4.096 y atención con query agrupada (GQA) de 8 cabezas key-value. Sobre él se entrena un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a todas las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), con el backbone congelado. La cabeza es un pointer head: dos proyecciones de 4.096 → 256 puntúan el token de cierre de cada opción contra el token final de la pregunta, y un softmax sobre esas puntuaciones produce las probabilidades. El modelo se ejecuta en modo prefill-only, sin decodificación autoregresiva.

El estado se codifica una sola vez y se cachea; cada pregunta se responde como una fila propia que continúa desde ese estado compartido, de forma que las preguntas no pueden influirse entre sí. Kev delimita estado, pregunta, opción y punto de decisión con tokens especiales que solo existen en el vocabulario de Qwen; el parche `kev-granite.patch` los reasigna a cinco tokens libres de Granite (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_pad|>`, `<|unused_15|>`, `<|fim_suffix|>`) y rechaza checkpoints cuyos delimitadores registrados no coincidan con los del tokenizador. Además, corrige el escalado de los estados ocultos: Granite multiplica la salida del backbone por `config.logits_scaling` (16) y el parche divide por ese factor antes de la cabeza. El tokenizador es el de Granite sin modificar.

El entrenamiento se documenta a nivel de datasets, no de cómputo: 13 conjuntos en inglés que cubren intención bancaria (banking77), QA booleana (boolq), clasificación de noticias (ag_news), inferencia de lenguaje natural (multi_nli), sentimiento en 5 niveles (sst5), reseñas (yelp_review_full, amazon_reviews_multi_en, imdb), clasificación de preguntas (trec), tópicos (dbpedia_14), mensajes de commit (commitpackft), seguridad de contenido (Aegis-AI-Content-Safety-Dataset-2.0) y reclamaciones financieras de consumo (consumer-finance-complaints-large). El número de tokens de entrenamiento no está disponible y no se documenta el uso de RLHF o DPO; la calibración se resuelve con una temperatura escalar ajustada y fijada en el checkpoint.

## Capacidades

- Clasificación y enrutamiento de documentos con salida probabilística: distribución sobre 1-255 opciones nombradas, cada una con descripción opcional, más la opción más probable y su confianza.
- Puntuación ordinal: distribución sobre 1-255 niveles ordenados y nivel esperado (índice), útil para severidad, prioridad o calidad.
- Decisiones binarias sí/no (`noul`), con descripciones opcionales de cada rama.
- Triage y revisión basada en umbral: al devolver probabilidades calibradas, permite automatizar los casos de alta confianza y encolar el resto.
- Chequeo de criterios: evaluar si una respuesta propuesta cumple criterios declarados, o si un documento satisface una política.
- Decisiones de uso de herramientas: si llamar a una herramienta, pedir al usuario la información que falta o rechazar la petición.
- Entrada heterogénea: texto plano, u objeto/array JSON renderizado como texto etiquetado.
- Estado compartido cacheado y preguntas independientes: se pueden lanzar N preguntas sobre el mismo documento sin recalcular el estado ni permitir contaminación entre preguntas.
- Compatibilidad con la API System One de TypeSafe a través del servidor de Kev, con el SDK `typesafe_sdk` sin modificaciones.
- No soporta generación de texto, visión, audio ni tool calling en el sentido de invocar herramientas: la decisión sobre herramientas se expresa como una pregunta tipada.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Triage de tickets de soporte: enviar el cuerpo del ticket como estado y una pregunta `choice` con las colas disponibles (facturación, técnico, cuenta, etc.); los tickets con confianza por debajo del umbral se enrutan a revisión humana, con el umbral fijado sobre una muestra etiquetada del propio flujo de trabajo.
- Cumplimiento y elegibilidad: comprobar si una solicitud cumple una política mediante una pregunta `noul` con descripciones de los criterios, o una pregunta `choice` entre resoluciones (aprobar, denegar, escalar), manteniendo la decisión auditable gracias a la probabilidad registrada.
- Moderación de contenido asistida: clasificar texto frente a las categorías de seguridad con una pregunta `choice`; encaja con el dataset Aegis usado en el entrenamiento y permite política de dos niveles (bloqueo automático y cola de revisión).
- Clasificación de reseñas y voz del cliente a escala: sustituir un clasificador de encoder por un único modelo que puntúa sentimiento en 5 niveles (`score`) y tópico (`choice`) sobre el mismo estado, reutilizando el cacheado del documento para múltiples preguntas.
- Enrutamiento en agentes y asistentes: decidir si se llama a una herramienta, si se pide información adicional al usuario o si se declina la petición, con una probabilidad asociada a cada rama para cortar ejecuciones dudosas antes de que ocurran.
- Revisión de código y mensajes de commit: clasificar commits o descripciones de cambio en categorías (corrección, funcionalidad, refactor, documentación) para etiquetado automático en pipelines de CI/CD, apoyándose en el entrenamiento sobre commitpackft.
- Verificación de respuestas en pipelines RAG: dada una respuesta candidata y el contexto, decidir con una pregunta `noul` si la respuesta está soportada por el documento, y descartar o marcar las que no alcancen el umbral de confianza.
- Sustitución autoalojada de un endpoint System One: servir el modelo con Kev y apuntar el SDK de TypeSafe al endpoint local, sin cambios en el código cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, calibración (ECE, Brier), latencia ni throughput sobre los datasets de entrenamiento ni sobre conjuntos de evaluación held-out.

## Requisitos de hardware

- VRAM estimada: el backbone ocupa aproximadamente 58 GB en bf16; el servidor de Kev residen aproximadamente 64 GB, incluyendo adaptador (562 MB) y cabeza.
- GPU recomendadas por el autor: una GPU de clase 80 GB o superior, citando H100 80 GB, H200, B200 y RTX PRO 6000 de 96 GB.
- GPU de consumo: no cabe en tarjetas de 24 GB ni de 48 GB en bf16; no se han publicado cuantizaciones de 8 o 4 bits que permitan bajarlo a ese rango.
- Despliegue: servidor de Kev (`python -m kev.serve --run modelfaces/granite-4.1-30b-decision --port 8008`), con `KEV_DTYPE=bf16`, aplicando antes `kev-granite.patch` sobre el commit indicado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI: la cabeza pointer y los delimitadores personalizados exigen el servidor de Kev.
- Primer arranque: Kev descarga el backbone de Granite en la revisión fijada y el adaptador, y monta el adaptador en memoria.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el diseño es prefill-only (sin decodificación token a token) y cachea el estado del documento, por lo que el coste dominante es el prefill del estado, no el número de preguntas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite 4.1 30B Decision (este) | 28,9B base + ~143M LoRA + 2,1M cabeza | 8.192 tokens en entrenamiento | Distribución calibrada sobre opciones; sin generación | Apache-2.0 | HuggingFace + servidor Kev |
| IBM Granite 4.1 30B base | 28,9B | No disponible en la información | Generación de texto autoregresiva | Apache-2.0 | HuggingFace |
| Backbones Qwen objetivo de Kev (stock) | No disponible en la información | No disponible en la información | Decisiones tipadas con la misma interfaz | Según el modelo base usado | HuggingFace + Kev |
| Clasificadores de encoder (p. ej. familia DeBERTa/ModernBERT) | No disponible en la información | No disponible en la información | Etiqueta única o probabilidades por clase fija | No disponible en la información | HuggingFace |

La comparación relevante no es de benchmarks —no hay datos publicados— sino de forma de la interfaz: frente al backbone base, este modelo cambia generación de texto por una distribución calibrada y un coste de una sola pasada; frente a los backbones Qwen que Kev soporta de serie, aporta un backbone mayor en inglés y requiere el parche de delimitadores y escalado; frente a clasificadores de encoder, ofrece preguntas dinámicas (hasta 255 opciones definidas en tiempo de inferencia) y varias preguntas por documento, a cambio de un requisito de hardware de 80 GB.

## Limitaciones y advertencias

- Idioma: solo inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- No genera texto: si el caso de uso requiere explicaciones, resúmenes o razonamiento en lenguaje natural, este modelo no los proporciona; solo probabilidades, opción más probable y confianza.
- Calibración específica del dominio: la temperatura es un único escalar global (T = 1,74). Los umbrales deben reajustarse sobre una muestra etiquetada del flujo de trabajo real; una confianza de 0,9 no es una garantía de acierto fuera de la distribución de entrenamiento.
- Sesgos heredados de los datos: los 13 datasets incluyen reseñas, noticias, reclamaciones financieras y moderación de contenido, con los sesgos demográficos, de dominio y de anotación propios de cada fuente. No se documenta ninguna auditoría de sesgo.
- Riesgo de alucinación: no aplica en el sentido de inventar texto, pero sí en el de asignar alta confianza a opciones incorrectas cuando el estado queda fuera de distribución (documentos muy largos, idiomas distintos del inglés, opciones nunca vistas).
- Límites de formato: máximo 255 opciones o niveles por pregunta; estados de hasta 8.192 tokens durante el entrenamiento, sin contexto de servicio documentado más allá de eso.
- Restricciones de licencia: Apache-2.0 en adaptador, cabeza y modelo base, por lo que el uso comercial está permitido; conviene revisar igualmente las licencias de los datasets citados si se redistribuyen derivados.
- Dependencia operativa fuerte: requiere Kev en un commit concreto, el parche `kev-granite.patch` y una GPU de 80 GB. Sin el parche, los delimitadores de Qwen no existen en el vocabulario de Granite y el escalado `logits_scaling` corrompe la entrada de la cabeza.
- Estado del proyecto: modelo comunitario con 0 descargas y 0 likes en el momento de la ficha, sin release oficial de IBM, Kev ni TypeSafe detrás; no hay benchmarks publicados que respalden las afirmaciones de calidad.
- Producción: al no haber métricas de latencia ni throughput publicadas, el dimensionamiento debe hacerse con una prueba de carga propia antes de comprometer SLA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/modelfaces/granite-4.1-30b-decision
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b-base
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b-base/tree/9bb22a92d17f4a51788c4750d32764ed068d94f2
- Repositorio de Kev: https://github.com/jaredpalmer/kev
- Commit de Kev contra el que aplica el parche: https://github.com/jaredpalmer/kev/tree/dd375f27fd61486c52204205e10a0d2e10f3b34a
- Parche de soporte de Granite: `kev-granite.patch` (incluido en el repo del modelo)
- Datasets de entrenamiento citados: https://huggingface.co/datasets/legacy-datasets/banking77, https://huggingface.co/datasets/google/boolq, https://huggingface.co/datasets/fancyzhx/ag_news, https://huggingface.co/datasets/nyu-mll/multi_nli, https://huggingface.co/datasets/SetFit/sst5, https://huggingface.co/datasets/Yelp/yelp_review_full, https://huggingface.co/datasets/CogComp/trec, https://huggingface.co/datasets/fancyzhx/dbpedia_14, https://huggingface.co/datasets/SetFit/amazon_reviews_multi_en, https://huggingface.co/datasets/stanfordnlp/imdb, https://huggingface.co/datasets/bigcode/commitpackft, https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0, https://huggingface.co/datasets/davidheineman/consumer-finance-complaints-large
