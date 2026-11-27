# AU-STANDBY/constructive_classifier_EN_DA_non_context_enriched

## Resumen

El modelo `constructive_classifier_EN_DA_non_context_enriched` es un clasificador de texto multilingue y multi-tarea desarrollado en el marco del proyecto de investigacion STANDBY por el autor AU-STANDBY. Se construye mediante fine-tuning supervisado sobre el modelo de embeddings `intfloat/multilingual-e5-large` y esta disenado para clasificar textos en ingles y danes a lo largo de tres dimensiones independientes: discurso de odio, discurso constructivo y grado de acuerdo.

A diferencia de los clasificadores tradicionales de una sola etiqueta, este modelo trata las tres dimensiones como ejes ortogonales, de modo que un mismo texto puede ser simultaneamente etiquetado como hateful y constructive. Esta variante "non-context-enriched" clasifica una respuesta de forma aislada, sin disponer del texto de referencia de la conversacion, a diferencia de su variante hermana que incorpora contexto conversacional mediante la concatenacion `[reference text] [SEP] [response text]`.

Con 559.899.657 parametros y un repositorio de 2,3 GB, el modelo produce nueve logits organizados en tres grupos de tres clases cada uno, aplicando softmax de forma independiente por tarea. Es relevante para tareas de moderacion de contenido, analisis de calidad deliberativa y estudios de discurso en plataformas sociales en entornos anglofonos y daneses, aunque su adopcion actual es muy limitada (23 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de `intfloat/multilingual-e5-large`) con cabeza de clasificacion multi-tarea |
| Parametros totales | 559.899.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length definido en el ejemplo de uso del autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | en (ingles), da (danes) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tareas de salida | 3 (hateful, constructive, agree), 9 logits en total |
| Dataset de entrenamiento | `AU-STANDBY/annotated_constructive_dataset_DA_EN` |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-large`, un encoder basado en la familia XLM-RoBERTa con 24 capas y 1024 dimensiones ocultas, entrenado originalmente como modelo de embeddings multilingue. Sobre ese backbone se anade una cabeza de clasificacion que emite nueve logits, agrupados en tres tareas de tres clases cada una: hateful (Not Hateful / Hateful / Unclassifiable Hateful), constructive (Not Constructive / Constructive / Unclassifiable Constructive) y agree (Agree / Disagree / Unclear). El softmax se aplica de forma independiente a cada grupo de tres logits, lo que permite que las etiquetas de las tres dimensiones coexistan sin restricciones de exclusion mutua.

El fine-tuning se realizo sobre el dataset `AU-STANDBY/annotated_constructive_dataset_DA_EN`, con anotaciones en ingles y danes. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras estrategias de alineacion. Tampoco se detalla la funcion de perdida concreta (probablemente entropia cruzada sumada sobre las tres cabezas, dado el diseno multi-tarea, pero no se confirma). El autor recomienda aplicar un preprocesado de texto especifico (normalizacion de menciones `@usuario` y URLs a ``) para mantener consistencia con la distribucion de entrenamiento.

## Capacidades

- Clasificacion multi-etiqueta ortogonal: un mismo texto puede recibir simultaneamente etiquetas de las tres dimensiones (hateful, constructive, agree) sin restricciones de exclusion.
- Deteccion de discurso de odio con clase explicita de "no clasificable" (Unclassifiable Hateful), que permite al modelo abstenerse en casos ambiguos.
- Deteccion de discurso constructivo, util para medir calidad deliberativa en hilos de discusion.
- Clasificacion de grado de acuerdo (Agree / Disagree / Unclear), orientada al analisis de dinamicas conversacionales.
- Soporte bilingue limitado a ingles y danes.
- Salida con etiqueta, score de confianza y distribucion de probabilidades por tarea.
- Procesamiento por lotes (batch) con padding y truncation a 512 tokens.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido: es un clasificador puro de secuencias.

## Casos de uso

- Moderacion de contenido en foros y redes sociales en ingles y danes: el modelo permite filtrar mensajes potencialmente hateful mientras conserva la senal de constructive, evitando falsos positivos que descartarian intervenciones criticas pero bien intencionadas.
- Analisis de calidad deliberativa en plataformas civicas: clasificar respuestas como constructive o not constructive para medir la salud de un debate y priorizar intervenciones que aporten valor.
- Investigacion en ciencias sociales y comunicacion: etiquetar a escala corpus de comentarios en ingles y danes para estudiar la relacion entre discurso de odio, constructividad y acuerdo en hilos de discusion.
- Deteccion de toxicidad en sistemas de comentarios con triaje humano: la clase "Unclassifiable" permite derivar casos ambiguos a revision manual en lugar de forzar una decision binaria.
- Analisis de sentimiento deliberativo en encuestas y consultas publicas: clasificar respuestas abiertas como Agree / Disagree / Unclear para agregar opiniones a escala.
- Monitorizacion de comunidades online en tiempo casi real: al ser un encoder de 560M de parametros con contexto de 512 tokens, permite procesar lotes en GPU consumer y desplegarse en pipelines de inferencia por lotes (batch) con latencia moderada.
- Filtrado previo en pipelines de anotacion: usar el clasificador como pre-etiquetador para reducir el coste de anotacion humana en proyectos bilingues en/danes.

## Benchmarks y rendimiento

El autor reporta F1 por clase y F1 agregado por tarea sobre un conjunto de evaluacion no especificado en la informacion disponible (no se indica tamano, composicion ni particion train/test).

| Tarea | Clase 0 (F1) | Clase 1 (F1) | Clase 2 (F1) | F1 tarea |
|---|---|---|---|---|
| Constructive | .77 (Y) | .92 (N) | .77 (U) | **.88** |
| Hate | .65 (Y) | .91 (N) | .68 (U) | **.86** |
| Agree | .70 (A) | .80 (D) | .56 (U) | **.71** |
| Media F1 | — | — | — | **.816** |

Donde Y = Yes, N = No, U = Unclassifiable (para hateful y constructive); A = Agree, D = Disagree, U = Unclear (para agreement). No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, mas activaciones y overhead del runtime (estimacion practica de 3-4 GB en GPU).
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos, con overhead adicional segun batch size.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100, H100, L4, T4 o RTX 3090/4090 son sobredimensionadas pero validas para alto throughput por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB, RTX 3060 12 GB, RTX 4060 8 GB, etc.).
- Opciones de despliegue: PyTorch + transformers (ejemplo oficial del autor), ONNX Runtime, TorchScript, y potencialmente vLLM o TGI si se exporta como modelo de clasificacion (no documentado por el autor). llama.cpp y Ollama no son aplicables de forma nativa a clasificadores de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder de 560M con contexto de 512 tokens, se espera un throughput alto por lotes en GPU, pero no se confirman cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AU-STANDBY/constructive_classifier_EN_DA_non_context_enriched | 559,9 M | 512 | en, da | 3 (hate, constructive, agree) | no disponible | Hugging Face |
| AU-STANDBY/constructive_classifier_EN_DA_context_enriched | no disponible | 512 | en, da | 3 (con contexto conversacional) | no disponible | Hugging Face |
| intfloat/multilingual-e5-large (base) | 559,9 M | 512 | multilingue (aprox. 100 idiomas) | embeddings, no clasificacion | MIT (habitual en e5) | Hugging Face |
| Clasificadores de hate speech bilingues genericos (p. ej. basados en XLM-R) | variable | 512 | variable | 1 (hate) | variable | Hugging Face |

La comparativa directa con alternativas especificas no esta disponible en la informacion proporcionada. El modelo se distingue por su diseno multi-tarea ortogonal y su soporte bilingue en/danes, pero carece de documentacion publica sobre licencia y de benchmarks comparativos con otros clasificadores.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor antes de desplegarlo en produccion.
- Cobertura linguistica limitada a ingles y danes; el rendimiento en otros idiomas, incluso si el backbone es multilingue, no esta garantizado ni documentado.
- Contexto maximo de 512 tokens: textos mas largos se truncan, lo que puede degradar la clasificacion en comentarios extensos.
- Variante sin contexto: al clasificar respuestas aisladas, puede malinterpretar ironia, sarcasmo o respuestas que dependen del mensaje previo; para esos casos existe la variante context_enriched.
- Riesgo de sesgo: no se documentan analisis de sesgo por genero, origen etnico, religion u otras dimensiones; los clasificadores de hate speech suelen sobrerrepresentar ciertos grupos en falsos positivos.
- Riesgo de alucinacion de etiquetas: como todo clasificador, puede asignar etiquetas con alta confianza a textos ambiguos; la clase "Unclassifiable" mitiga parcialmente este riesgo pero no lo elimina.
- F1 bajo en la clase "Unclear" de agreement (.56) y en "Hateful" (.65): la deteccion positiva de hate speech y la desambiguacion del acuerdo son los puntos mas debiles.
- Sin datos de calibracion: los scores de softmax no estan calibrados explicitamente, por lo que no deben interpretarse como probabilidades fiables sin post-procesado (p. ej. temperature scaling).
- Adopcion muy baja (23 descargas, 0 likes) y sin validacion independiente por parte de la comunidad.
- Requiere preprocesado especifico (normalizacion de menciones y URLs) para alinearse con la distribucion de entrenamiento; omitirlo puede degradar el rendimiento.
- No apto para generacion, razonamiento, codigo ni tareas generativas: es exclusivamente un clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AU-STANDBY/constructive_classifier_EN_DA_non_context_enriched
- Variante con contexto: https://huggingface.co/AU-STANDBY/constructive_classifier_EN_DA_context_enriched
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Dataset de entrenamiento: https://huggingface.co/datasets/AU-STANDBY/annotated_constructive_dataset_DA_EN
- Referencia arXiv citada en los tags: arxiv:2611.32889 (paper no verificado en la informacion disponible)
