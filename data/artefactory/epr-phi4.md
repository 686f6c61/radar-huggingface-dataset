# artefactory/epr-phi4

## Resumen

`artefactory/epr-phi4` es un detector de alucinaciones calibrado, publicado por Artefact Research Center, que puntúa respuestas generadas por `microsoft/phi-4`. No es un modelo generativo ni un ajuste fino de phi-4: es un clasificador binario de regresión logística que consume una única característica derivada de la distribución de tokens de la respuesta. El artefacto distribuido contiene únicamente el `LogisticRegression` ajustado, sin clases personalizadas, y se carga con una lista `trusted` vacía.

La característica que alimenta al clasificador se denomina EPR (Entropy Production Rate) y agrega todos los rangos de la distribución de tokens en un solo número: la entropía truncada `-sum_k p_k ln p_k`, promediada sobre los tokens de la respuesta. La extracción de características (parseo de las 15 log-probabilidades superiores y su reducción a entropía) reside en la biblioteca `artefactual`, no en el archivo del modelo.

El detector es relevante porque aborda la detección de alucinaciones en escenarios de caja negra: solo necesita acceso a los log-probs de la API de inferencia, no a los pesos ni a los estados internos del LLM. Se presentó en ECIR 2026 (preprint arXiv:2509.04492) y su licencia es MIT, aunque no se han publicado un punto de operación ni cifras concretas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (`sklearn.linear_model.LogisticRegression`) sobre una unica caracteristica EPR; no es un transformer ni una red neuronal profunda |
| Parametros totales | 1 coeficiente mas termino independiente (una caracteristica, un coeficiente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible (no aplica; artefacto serializado con skops) |
| Idiomas soportados | no disponible (el detector opera sobre distribuciones de tokens, no sobre un idioma declarado) |
| Licencia | MIT |
| Formato de pesos | Serializacion `skops` de scikit-learn (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal de dos parametros. La entrada es un vector de una sola dimension: el EPR de la respuesta, calculado como la entropia truncada de cada distribucion de tokens, `-sum_k p_k ln p_k`, promediada a lo largo de todos los tokens de la respuesta. El EPR agrega todos los rangos de la distribucion en un unico escalar, de modo que el clasificador dispone de una caracteristica y un coeficiente.

Los coeficientes estan ajustados contra la distribucion de salida de `microsoft/phi-4`. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni el procedimiento de calibracion empleado; estos datos no estan disponibles. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de ajuste equivalentes, ya que no se trata de un modelo generativo. La innovacion tecnica destacable es metodologica: reducir la deteccion de alucinaciones en LLM de caja negra a una unica caracteristica de entropia a nivel de token, lo que permite un clasificador de muy bajo coste computacional y sin acceso a los pesos del modelo evaluado.

## Capacidades

- Clasificacion binaria de respuestas de `microsoft/phi-4`: devuelve una puntuacion en `[0, 1]` donde 1 corresponde a la clase alucinacion.
- Estimacion de incertidumbre mediante una unica caracteristica de entropia derivada de las 15 log-probabilidades superiores de cada token.
- Funcionamiento en regimen de caja negra: no requiere pesos, activaciones ni estados internos del LLM evaluado, solo el payload de log-probs.
- Compatibilidad con payloads de chat completion o responses compatibles con OpenAI que incluyan `top_logprobs=15`.
- No genera texto, no razona, no escribe codigo y no resuelve problemas matematicos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas ni capacidades de vision o audio.

## Casos de uso

- Guardarrail en produccion sobre phi-4: cada respuesta generada por phi-4 se puntua con el detector y las respuestas que superan un umbral elegido por el equipo se bloquean o se reescriben antes de mostrarse al usuario. Es adecuado porque el coste del detector es despreciable frente a la generacion.
- Enrutado a revision humana: las respuestas con mayor probabilidad de alucinacion se envian a una cola de revision en lugar de descartarse, lo que permite calibrar el umbral segun la tolerancia al riesgo del dominio.
- Evaluacion offline de pipelines RAG: el detector se aplica en fase de test sobre conjuntos de respuestas generadas por phi-4 para detectar regresiones de fidelidad tras cambios en el recuperador, en el prompt o en el indice, sin necesidad de anotacion manual en cada iteracion.
- Seleccion de candidatos en generacion best-of-n: cuando se muestrean varias respuestas para la misma consulta, la puntuacion del detector actua como criterio de ranking para escoger la candidata con menor probabilidad de alucinacion.
- Monitorizacion y deteccion de deriva: registrar la distribucion de puntuaciones a lo largo del tiempo permite detectar cambios en el comportamiento del modelo servido o en la composicion de las consultas de los usuarios.
- Abtencion selectiva en asistentes de dominio especializado: en entornos medicos, legales o financieros, el sistema puede responder "no lo se" cuando la puntuacion de alucinacion supera un umbral ajustado con datos etiquetados propios.
- Investigacion sobre incertidumbre en LLM: el artefacto permite reproducir y extender el analisis de EPR a nivel de token, sirviendo como linea base de bajo coste frente a metodos que requieren multiples muestreos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el articulo asociado informa de ROC-AUC y PR-AUC para los modelos evaluados, pero no reproduce ninguna cifra para evitar que la ficha se desvie de los resultados publicados. No se dispone de valores concretos en el material proporcionado.

## Requisitos de hardware

- Inferencia en CPU: el clasificador es una regresion logistica con una caracteristica, por lo que el calculo es una suma ponderada y no requiere GPU.
- VRAM estimada: practicamente nula; el artefacto es un objeto scikit-learn serializado de tamano minimo.
- GPU recomendadas: no aplica para el detector. El coste real de computo recae en la generacion de phi-4 con log-probs habilitados.
- Cabe en cualquier equipo consumer: cualquier maquina capaz de ejecutar Python y scikit-learn.
- Opciones de despliegue: biblioteca Python `artefactual` (version >= 2026.9, clase `EPR`; hasta 2026.08.1 la misma carga se hacia con la factoria `epr()`). El servicio de inferencia que produzca las respuestas debe exponer `logprobs=True` y `top_logprobs=15`.
- Latencia y throughput: no disponibles. El cuello de botella esperado es la generacion de log-probs, no la clasificacion.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas comparables en el material proporcionado. La model card no incluye comparaciones con otros detectores de alucinaciones, y el articulo asociado no se reproduce en la informacion disponible.

| Enfoque | Tipo de acceso requerido | Requisitos de inferencia | Licencia | Datos comparativos |
|---|---|---|---|---|
| `artefactory/epr-phi4` | Caja negra (log-probs top-15) | Suma ponderada en CPU | MIT | no disponible |
| Otros detectores de alucinacion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Vinculacion estricta a `microsoft/phi-4`: los coeficientes estan ajustados contra la distribucion de salida de ese modelo concreto. Puntuar respuestas de otro modelo con estos pesos no es significativo, aunque el archivo no lo impida tecnicamente.
- Parametro fijo `k=15`: las respuestas deben generarse con `logprobs=True` y `top_logprobs=15`. Si se reciben menos rangos, la entrada se rechaza en lugar de rellenarse con ceros, ya que los rangos ausentes no fueron recuperados y rellenarlos haria que la respuesta pareciese mas segura de lo que fue.
- Ausencia de punto de operacion publicado: el articulo informa de ROC-AUC y PR-AUC, ambas metricas independientes del umbral, por lo que no se publica ningun umbral de decision. Cada equipo debe elegirlo con sus propios datos etiquetados.
- Riesgo de falsos positivos y falsos negativos: al no haber cifras publicadas en la ficha, no es posible cuantificar la tasa de error esperada en produccion.
- Deriva potencial: si la version servida de phi-4 cambia, la calibracion de los coeficientes puede dejar de ser valida.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo por idioma, dominio o tipo de contenido.
- Limitaciones de idioma: no se declara ningun conjunto de idiomas soportados; el comportamiento del detector fuera del idioma o dominio de ajuste no esta caracterizado.
- Restricciones de licencia: licencia MIT, sin restricciones conocidas para uso comercial. Se debe conservar el aviso de copyright y la atribucion correspondiente.
- Madurez: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa amplia documentada.
- Dependencia de la biblioteca externa: la extraccion de caracteristicas vive en `artefactual`, de modo que el artefacto por si solo no es funcional sin esa dependencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artefactory/epr-phi4
- Modelo objetivo: https://huggingface.co/microsoft/phi-4
- Biblioteca artefactual: https://github.com/artefactory/artefactual
- Incidencias y contacto: https://github.com/artefactory/artefactual/issues
- Preprint: https://arxiv.org/abs/2509.04492
- Articulo ECIR 2026: https://doi.org/10.1007/978-3-032-21289-4_8
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos pertenecian a portales de coordinacion universitaria sin relacion con el artefacto.
