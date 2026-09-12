# artefactory/epr-ministral

## Resumen

EPR-Ministral es un detector de alucinaciones calibrado, publicado por Artefact Research Center (organización `artefactory`), que puntúa respuestas generadas por `mistralai/Ministral-8B-Instruct-2410`. No es un modelo generativo ni un ajuste fino del modelo objetivo: es un artefacto de `scikit-learn` que contiene únicamente una regresión logística ajustada sobre una característica derivada de las probabilidades de los tokens. Devuelve una puntuación en el intervalo `[0, 1]`, donde 1 corresponde a la clase "alucinación".

La característica que alimenta al clasificador es la EPR (Entropy Production Rate, tasa de producción de entropía), definida como la entropía truncada `-sum_k p_k ln p_k` calculada sobre las `k` probabilidades más altas de cada token y promediada a lo largo de todos los tokens de la respuesta. La model card lo resume como "una característica, un coeficiente". La extracción de características no vive en el propio artefacto, sino en la librería `artefactual`, lo que implica que el fichero publicado no contiene clases personalizadas y se carga con una lista `trusted` vacía.

Su relevancia actual es doble. Por un lado, aborda la detección de alucinaciones en escenarios de caja negra: solo necesita las `top_logprobs` que devuelve una API compatible con OpenAI, sin acceso a pesos ni a estados internos. Por otro, el método se publicó en ECIR 2026 (preprint `arXiv:2509.04492`), lo que lo sitúa en la línea de investigación de estimación de incertidumbre basada en entropía lingüística, pero con un coste computacional de inferencia prácticamente nulo. El artefacto se distribuye con licencia MIT y tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que debe considerarse un recurso de investigación reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística de `scikit-learn` sobre una única característica derivada (EPR, entropía truncada media de las top-15 probabilidades por token) |
| Parámetros totales | 1 coeficiente más término de independencia (2 parámetros estimados), según la propia model card ("one feature, one coefficient") |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de atención; procesa la respuesta completa generada, siempre que cada token incluya `top_logprobs=15` |
| Tipos de cuantización | No aplica (modelo lineal de precisión completa; no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible (no se declara cobertura lingüística; su comportamiento depende del idioma de las respuestas del modelo objetivo) |
| Licencia | MIT |
| Formato de pesos | Artefacto `skops` (librería declarada: `sklearn`); se carga con `EPR.from_pretrained` de `artefactual>=2026.9` |

## Arquitectura y entrenamiento

La pieza publicada es un clasificador lineal binario (regresión logística) de una sola dimensión de entrada. La característica EPR se calcula agregando la distribución de probabilidad de cada token: se toman las `k=15` probabilidades más altas, se calcula la entropía truncada `-sum_k p_k ln p_k` y se promedia el resultado sobre todos los tokens de la respuesta. La model card insiste en que "every rank" se agrupa en un único número, lo que reduce el problema de detección a un modelo de un coeficiente y un término de independencia. Los coeficientes están ajustados específicamente contra la distribución de salida de `mistralai/Ministral-8B-Instruct-2410`.

El preprocesamiento no forma parte del artefacto: el parseo de las `top_logprobs` de una respuesta de completion y su reducción a características de entropía residen en la librería `artefactual`. Esto condiciona el flujo de uso: primero hay que obtener una respuesta en formato compatible con OpenAI que incluya `logprobs=True` y `top_logprobs=15`, y después pasarla al detector. La model card no detalla el volumen de datos de entrenamiento, la composición del conjunto de calibración, ni si hubo etapas de ajuste adicionales; el paper asociado (Moslonka, Randrianarivo, Garnier y Malherbe, ECIR 2026) es la referencia para esos detalles. El artefacto no incluye ningún peso del modelo objetivo y no es un ajuste fino de él.

## Capacidades

- Clasificación binaria de respuestas: asigna una probabilidad en `[0, 1]` a la clase "alucinación" para una respuesta concreta de `Ministral-8B-Instruct-2410`.
- Detección en caja negra: funciona únicamente con las `top_logprobs` que expone la API, sin acceso a pesos, activaciones ni estados ocultos del modelo evaluado.
- Estimación de incertidumbre basada en entropía: agrega la incertidumbre de todos los rangos de la distribución de tokens en una sola métrica.
- Integración directa con `scikit-learn`: el objeto expone `predict_proba`, por lo que se puede insertar en pipelines de evaluación ya existentes.
- Carga con lista `trusted` vacía: al no contener clases personalizadas, el artefacto `skops` se carga sin necesidad de declarar tipos personalizados de confianza.
- Sin capacidades de generación: no produce texto, no razona, no ejecuta código, no soporta *tool calling*, no es multimodal y no mantiene conversaciones multi-turno. Es exclusivamente un cabezal de puntuación.
- Restricción funcional explícita: exige exactamente `k=15`. Si se proporcionan menos rangos, la entrada se rechaza en lugar de rellenarse con ceros, porque los rangos ausentes no fueron recuperados, no porque no existan.

## Casos de uso

- Guardarraíl en pipelines RAG sobre Ministral: tras generar una respuesta con el modelo objetivo, se pasa la completion con `top_logprobs=15` al detector y se aplica un umbral propio para decidir si se muestra al usuario, se reformula o se bloquea. Es adecuado porque el coste de inferencia del detector es despreciable frente a la generación.
- Triaje y enrutado a revisión humana: en flujos donde una respuesta dudosa debe revisarla una persona, la puntuación continua permite priorizar la cola de revisión en lugar de aplicar un corte binario arbitrario.
- Evaluación de regresiones de prompt en CI: al ser un objeto `scikit-learn` con `predict_proba`, se puede ejecutar en un pipeline que compare la tasa de respuestas con alta puntuación de alucinación entre dos versiones de un *prompt* o de un índice de recuperación.
- Curación de datos sintéticos: si se generan conjuntos de instrucciones o respuestas con `Ministral-8B-Instruct-2410`, el detector sirve como filtro para descartar ejemplos con alta probabilidad de contener afirmaciones no sustentadas antes de usarlos en entrenamiento.
- Monitorización en producción: registrar la distribución de puntuaciones a lo largo del tiempo permite detectar cambios en el comportamiento del modelo objetivo (deriva de *prompts*, cambio de versión, nuevos dominios de consulta), siempre que se fije un umbral sobre datos etiquetados propios.
- Best-of-n con criterio de confianza: cuando se muestrean varias respuestas para la misma consulta, la puntuación EPR permite seleccionar aquella con menor probabilidad estimada de alucinación, en lugar de usar solo la longitud o una heurística de votación.
- Detección de consultas fuera del dominio cubierto: respuestas sobre temas alejados del corpus de recuperación tienden a mostrar mayor entropía; el detector puede señalarlas para derivar a un mensaje de "no lo sé" antes de mostrarlas.
- Investigación en estimación de incertidumbre: al ser un método publicado y reproducible, sirve como línea base de un solo coeficiente frente a enfoques más costosos como la entropía semántica o las sondas sobre estados ocultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el paper reporta ROC-AUC y PR-AUC entre los modelos evaluados, pero no reproduce ninguna cifra para evitar divergencias con los resultados publicados.

| Métrica | Valor |
|---|---|
| ROC-AUC | No disponible en la información proporcionada (reportado en `arXiv:2509.04492`) |
| PR-AUC | No disponible en la información proporcionada (reportado en `arXiv:2509.04492`) |
| Umbral de decisión | No publicado: ambas métricas son independientes del umbral, por lo que no se ofrece un punto de operación |
| Comparación con otros detectores | No disponible en la información proporcionada |

## Requisitos de hardware

- El detector en sí no requiere GPU: es una regresión logística de un coeficiente que se ejecuta en CPU con consumo de memoria despreciable. El cuello de botella es la generación de la respuesta, no la puntuación.
- Para producir las respuestas hay que servir `mistralai/Ministral-8B-Instruct-2410` (8 000 millones de parámetros) o usar un endpoint que exponga `logprobs` y `top_logprobs=15`. Estimación orientativa de VRAM para el modelo objetivo: en torno a 16 GB en bf16, 8-9 GB en int8 y 5-6 GB en 4 bits.
- GPU recomendadas para el modelo objetivo, según esa estimación: A100 40/80 GB o H100 para bf16 con contexto largo y lotes grandes; RTX 4090 (24 GB) o L40S (48 GB) para bf16 en lote pequeño; GPUs de 8-12 GB solo con cuantización de 4 bits.
- Cabe en GPU de consumo: el detector siempre; el modelo objetivo solo con cuantización agresiva y ventanas de contexto reducidas.
- Opciones de despliegue: el detector se despliega como cualquier artefacto `scikit-learn` (script, servicio FastAPI, tarea de CI). Para el modelo objetivo, la model card no especifica servidores compatibles; vLLM, TGI, llama.cpp u Ollama son opciones habituales, pero hay que verificar que la API elegida devuelva `logprobs` con al menos 15 rangos, requisito sin el cual el detector no puede funcionar.
- Latencia y throughput del detector: no disponibles de forma publicada, aunque por su naturaleza (una operación lineal sobre un vector de tamaño fijo) son varios órdenes de magnitud inferiores a los de la generación de la respuesta.

## Comparativa con modelos similares

No se dispone de cifras comparativas publicadas en la información proporcionada. La comparación siguiente es cualitativa y atendiendo a la categoría de método, no a resultados medidos.

| Método | Entrada necesaria | Coste de inferencia | ¿Requiere pesos del modelo evaluado? | Licencia / disponibilidad |
|---|---|---|---|---|
| EPR-Ministral (este artefacto) | Respuesta con `top_logprobs=15` de Ministral-8B-Instruct-2410 | Despreciable (modelo lineal) | No | MIT, artefacto `skops` en HuggingFace |
| Entropía semántica | Múltiples muestras de la misma consulta y agrupamiento semántico | Alto (varias generaciones por consulta) | No | Métodos publicados, implementaciones diversas |
| Sondas lineales sobre estados ocultos | Acceso a las activaciones internas del modelo | Bajo en inferencia, requiere entrenamiento por modelo | Sí | Depende de la implementación |
| Juez LLM | Respuesta más una segunda generación de evaluación | Medio-alto | No | Depende del juez elegido |
| Umbral sobre log-probabilidad media | Respuesta con log-probabilidades | Despreciable | No | Heurística sin artefacto asociado |

Frente a estos enfoques, la propuesta de EPR destaca por su coste casi nulo y por no necesitar acceso interno al modelo, a cambio de quedar atada a un único modelo objetivo y a un valor fijo de `k`.

## Limitaciones y advertencias

- Atado a un único modelo: los coeficientes están ajustados contra la distribución de salida de `mistralai/Ministral-8B-Instruct-2410`. Puntuar respuestas de otro modelo con ellos no tiene significado estadístico, aunque el fichero no lo impida técnicamente.
- `k` fijo en 15: las respuestas deben generarse con `logprobs=True` y `top_logprobs=15`. Si se aportan menos rangos, la entrada se rechaza; no se rellena con ceros porque los rangos ausentes no fueron recuperados y el relleno haría parecer la respuesta más confiable de lo que era.
- Sin umbral publicado: el paper reporta ROC-AUC y PR-AUC, ambas independientes del umbral, por lo que no existe un punto de operación recomendado. Cualquier decisión binaria exige calibrar sobre datos etiquetados propios.
- Dependencia del proveedor de inferencia: si la API o el servidor no exponen `top_logprobs` con al menos 15 rangos, el detector es inutilizable. Esto descarta varios endpoints comerciales y algunos servidores autoalojados con configuración por defecto.
- Sin localización del error: devuelve una puntuación por respuesta completa, no señala qué fragmento o afirmación es la alucinada.
- Sensibilidad a los parámetros de generación: temperatura, `top_p` y penalizaciones alteran la distribución de probabilidad, por lo que la calibración puede degradarse si se cambian respecto a las condiciones de ajuste (no documentadas en la información disponible).
- Idiomas: no se declara cobertura lingüística. El comportamiento del detector en idiomas distintos del usado durante el ajuste es desconocido.
- Sesgos: no se documentan análisis de sesgo. Al depender de la distribución del modelo objetivo, hereda en cierta medida sus sesgos de calibración entre dominios y estilos de respuesta.
- Riesgo de alucinación del propio detector: es un clasificador estadístico, no una verificación factual. Puede dar puntuaciones bajas a respuestas incorrectas y altas a respuestas correctas pero formuladas con incertidumbre legítima.
- Licencia: MIT, lo que permite uso comercial y modificación. No se documenta la procedencia ni las condiciones de los datos usados para ajustar los coeficientes, lo que conviene revisar antes de un despliegue regulado.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; la versión de la librería `artefactual` también importa (`>=2026.9`; hasta `2026.08.1` los mismos pesos se cargaban con la fábrica en minúsculas `epr()`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artefactory/epr-ministral
- Modelo objetivo: https://huggingface.co/mistralai/Ministral-8B-Instruct-2410
- Librería `artefactual` (extracción de características e incidencias): https://github.com/artefactory/artefactual
- Incidencias y contacto: https://github.com/artefactory/artefactual/issues
- Preprint: https://arxiv.org/abs/2509.04492
- Publicación ECIR 2026: https://doi.org/10.1007/978-3-032-21289-4_8
