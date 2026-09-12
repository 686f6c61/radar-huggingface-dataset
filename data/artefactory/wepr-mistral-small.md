# artefactory/wepr-mistral-small

## Resumen

artefactory/wepr-mistral-small es un detector de alucinaciones calibrado, publicado por Artefact Research Center, que puntúa en el intervalo [0, 1] las respuestas generadas por mistralai/Mistral-Small-3.1-24B-Instruct-2503, donde 1 corresponde a la clase alucinación. No es un modelo generativo ni un ajuste fino del modelo objetivo: es un artefacto de scikit-learn que contiene únicamente una regresión logística ajustada y no incluye ninguno de los pesos de Mistral.

El detector implementa WEPR (Weighted EPR, tasa de producción de entropía ponderada), una variante de las características EPR que mantiene separados los rangos de los tokens. A partir de las top-15 log-probabilidades de una respuesta extrae 2k = 30 características (media y máximo sobre el eje de tokens para cada rango, con k = 15) y las combina mediante un Logit calibrado. Solo necesita acceso de caja negra a las log-probabilidades; no requiere pesos ni gradientes del modelo evaluado.

Su relevancia es doble: por un lado, formaliza un método de detección de alucinaciones en LLM de caja negra presentado en ECIR 2026 (DOI 10.1007/978-3-032-21289-4_8, preprint arXiv:2509.04492); por otro, se distribuye como un artefacto mínimo, sin clases personalizadas, que carga con una lista `trusted` vacía y se ejecuta en CPU junto a la librería artefactual. La licencia es MIT y el número de descargas e interacciones registradas en HuggingFace es de 0 en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica calibrada sobre caracteristicas de entropia WEPR (Weighted EPR); no es una red neuronal |
| Parametros totales | 2k = 30 caracteristicas de entrada con k = 15 (media y maximo por rango sobre el eje de tokens); recuento exacto de coeficientes no detallado en la informacion disponible |
| Longitud de contexto | No aplica al detector: procesa la respuesta completa generada por el modelo objetivo, que debe venir con `logprobs=True` y `top_logprobs=15` |
| Tipos de cuantizacion | No aplica (artefacto scikit-learn serializado con skops) |
| Idiomas soportados | No disponible (la model card no declara idiomas; la deteccion depende de la distribucion de salida del modelo objetivo) |
| Licencia | MIT |
| Formato de pesos | Artefacto scikit-learn serializado con skops (`library_name: sklearn`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es una regresion logistica ajustada sobre características derivadas de log-probabilidades. La extraccion de características no vive en el fichero del modelo, sino en la librería artefactual: se parsean las top-15 log-probabilidades de una respuesta de completion y se reducen a características de entropía. WEPR conserva los rangos por separado, de modo que la calibracion dispone de un coeficiente por rango, con media y maximo sobre el eje de tokens, lo que da 2k características (30 con k = 15). Segun la model card, esto lee estrictamente mas de la distribucion que EPR con el mismo coste de calibracion.

No se detalla en la informacion disponible el conjunto de datos de ajuste, el numero de ejemplos ni si hubo etapas de RLHF o DPO, que no aplican a un clasificador de este tipo. La innovacion tecnica destacable es de diseno: el detector opera exclusivamente en regimen de caja negra (solo necesita log-probabilidades), rechaza las respuestas con menos de 15 rangos en lugar de rellenarlas con ceros, porque los rangos ausentes no fueron solicitados y rellenarlos puntuaria la respuesta como mas confiada de lo que fue, y el artefacto se limita a un `LogisticRegression` sin clases personalizadas, lo que permite cargarlo con una lista `trusted` vacia.

## Capacidades

- Clasificacion binaria de alucinacion sobre respuestas de `mistralai/Mistral-Small-3.1-24B-Instruct-2503`, con salida de probabilidad calibrada en [0, 1] mediante `predict_proba`.
- Estimacion de incertidumbre a partir de la distribucion de tokens: características de tasa de produccion de entropia sobre los 15 rangos superiores.
- Funcionamiento en caja negra: no requiere acceso a pesos, logits internos ni gradientes del modelo evaluado, solo log-probabilidades de la API.
- Compatibilidad con payloads de chat completion o responses en formato compatible con OpenAI que incluyan `top_logprobs=15`.
- Integracion directa en pipelines de Python mediante la libreria artefactual (`from artefactual.scoring import WEPR`), sin clases personalizadas ni codigo de confianza adicional.
- No dispone de tool calling, razonamiento multi-paso, vision, audio ni generacion de texto; es exclusivamente un clasificador.

## Casos de uso

- Filtrado en tiempo real en un RAG de produccion: tras generar la respuesta con Mistral-Small-3.1-24B-Instruct-2503, se puntua y se descarta o se reformula si la probabilidad de alucinacion supera el umbral elegido, todo ello en CPU y con un coste despreciable frente a la generacion.
- Enrutado a revision humana: las respuestas con puntuaciones cercanas al umbral se envian a un revisor, lo que permite concentrar el esfuerzo humano en los casos ambiguos en lugar de revisar el 100 % del trafico.
- Monitorizacion de la tasa de alucinacion en produccion: registrar la puntuacion media por cohorte, idioma o tipo de consulta para detectar degradaciones tras cambios de prompt, de version del modelo o del indice de recuperacion.
- Evaluacion de regresiones en CI: ejecutar un conjunto dorado con `top_logprobs=15` en cada release del sistema y comparar el ROC-AUC o el PR-AUC del detector antes y despues del cambio. Requiere seleccionar el umbral sobre datos etiquetados propios, ya que no se publica un punto de operacion.
- Seleccion de la mejor respuesta entre varias muestras: con autoconstencia o muestreo multiple, puntuar cada candidata con WEPR y elegir la de menor probabilidad de alucinacion antes de devolverla al usuario.
- Abtencion controlada en asistentes: si la puntuacion supera el umbral, el sistema responde con una abtencion explicita o pide aclaraciones en lugar de arriesgar una afirmacion incorrecta.
- Auditoria en dominios regulados: generar un registro de confianza por respuesta que sirva como evidencia en revisiones internas de cumplimiento, siempre que se documente el umbral y el procedimiento de calibracion.
- Investigacion y replicacion: comparar WEPR frente a EPR u otras caracteristicas de entropia en el mismo modelo objetivo y con el mismo presupuesto de calibracion, reutilizando el mismo artefacto y la libreria artefactual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al articulo (arXiv:2509.04492) para las cifras de ROC-AUC y PR-AUC, y declara que no las reproduce para evitar que la ficha se desvie de los resultados publicados. Tampoco se publica un punto de operacion ni un umbral de decision, porque las dos metricas reportadas son independientes del umbral.

## Requisitos de hardware

- Detector: inferencia en CPU. Es una regresion logistica serializada con skops; el tamano en disco no se publica, pero por la naturaleza del artefacto (30 caracteristicas de entrada) se situa en el orden de kilobytes. No necesita GPU ni VRAM dedicada.
- Modelo objetivo: el coste real de computo lo asume `mistralai/Mistral-Small-3.1-24B-Instruct-2503`. La VRAM necesaria para servirlo no esta disponible en la informacion proporcionada; debe calcularse a partir de ese modelo y del backend de servicio elegido.
- Requisito funcional critico: el backend debe devolver log-probabilidades. Es imprescindible generar con `logprobs=True` y `top_logprobs=15`; con menos de 15 rangos el detector rechaza la respuesta en lugar de rellenarla.
- Si cabe en GPU de consumo: depende exclusivamente del modelo objetivo, no del detector. No disponible en la informacion proporcionada.
- Opciones de despliegue: el detector se ejecuta como libreria Python (`artefactual>=2026.9`, con la clase `WEPR`; hasta la version 2026.08.1 los mismos pesos se cargaban con la factoria en minusculas `wepr()`). El modelo objetivo se sirve con el stack que se prefiera, siempre que exponga log-probabilidades en un payload compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Detector | Tipo | Caracteristicas de entrada | Modelo objetivo | Licencia | Datos publicos |
|---|---|---|---|---|---|
| wepr-mistral-small | Regresion logistica calibrada (WEPR) | 2k = 30 caracteristicas (media y maximo por rango, k = 15) | mistralai/Mistral-Small-3.1-24B-Instruct-2503 | MIT | ROC-AUC y PR-AUC en arXiv:2509.04492, sin reproducir en la model card |
| EPR (misma linea de trabajo) | Caracteristicas de tasa de produccion de entropia | Colapsa los rangos; lee menos de la distribucion que WEPR al mismo coste de calibracion | No especificado en la informacion disponible | No disponible | Referenciado en el articulo; cifras no disponibles en la informacion proporcionada |
| Otros detectores de alucinacion en caja negra | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con alternativas externas (por ejemplo, detectores basados en muestreo multiple o en verificacion semantica) en la informacion proporcionada, por lo que no se pueden contrastar parametros, contexto ni rendimiento.

## Limitaciones y advertencias

- Ata a un unico modelo objetivo: los coeficientes estan ajustados contra la distribucion de salida de `mistralai/Mistral-Small-3.1-24B-Instruct-2503`. Puntuar respuestas de otro modelo no es significativo, aunque nada en el fichero lo impida tecnicamente.
- k fijo en 15: las respuestas deben generarse con `logprobs=True` y `top_logprobs=15`. Se rechazan las respuestas con menos rangos en lugar de rellenarlas con ceros.
- Sin punto de operacion publicado: el articulo reporta ROC-AUC y PR-AUC, ambas independientes del umbral, de modo que no existe un umbral de decision recomendado. Hay que elegirlo sobre datos etiquetados propios.
- Riesgo de falsos positivos y falsos negativos: es un clasificador probabilistico, no un verificador de hechos; una puntuacion baja no garantiza que la respuesta sea correcta.
- Dependencia del backend: si el servidor de inferencia no devuelve log-probabilidades fieles (por ejemplo, por cuantizacion agresiva o implementaciones que recalculan las probabilidades), la calibracion puede degradarse sin aviso.
- Idioma: la model card no declara idiomas soportados; el comportamiento en idiomas distintos del ingles no esta documentado en la informacion disponible.
- Deriva de version: si se actualiza el modelo objetivo o su plantilla de chat, la distribucion de salida cambia y la calibracion del detector deja de estar garantizada.
- Compatibilidad de API: requiere `artefactual>=2026.9`. En versiones anteriores la carga se realiza con la factoria `wepr()` en minusculas.
- Licencia MIT: permite uso comercial y modificacion, pero se distribuye sin garantia alguna; la responsabilidad sobre el umbral y las decisiones automatizadas recae en el integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artefactory/wepr-mistral-small
- Modelo objetivo: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Libreria artefactual (repositorio): https://github.com/artefactory/artefactual
- Incidencias y contacto: https://github.com/artefactory/artefactual/issues
- Preprint: https://arxiv.org/abs/2509.04492
- Publicacion ECIR 2026 (Springer): https://doi.org/10.1007/978-3-032-21289-4_8
