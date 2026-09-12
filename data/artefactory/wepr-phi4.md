# artefactory/wepr-phi4

## Resumen

`artefactory/wepr-phi4` no es un modelo generativo, sino un detector calibrado de alucinaciones para respuestas producidas por `microsoft/phi-4`. Se trata de un clasificador lineal (regresión logística) que consume características de entropía extraídas de las log-probabilidades de los tokens de una respuesta y devuelve una puntuación en el intervalo [0, 1], donde 1 corresponde a la clase "alucinación". Lo desarrolla el Artefact Research Center (Artefact) y se distribuye con licencia MIT.

El detector implementa el método WEPR (Weighted EPR), presentado en el artículo "Learned Hallucination Detection in Black-Box LLMs Using Token-Level Entropy Production Rate" (ECIR 2026). A diferencia de EPR, que agrega rangos, WEPR mantiene los rangos separados y asigna un coeficiente de calibración por rango, tomando la media y el máximo sobre el eje de tokens, lo que da 2k características. Con k=15 fijo, esto supone 30 características y 31 parámetros en el clasificador.

Su relevancia es práctica: permite añadir una capa de detección de alucinaciones sobre un LLM al que solo se accede como caja negra vía API, sin necesidad de pesos ni de acceso al modelo de destino, siempre que la API exponga `logprobs=True` y `top_logprobs=15`. El propio archivo del modelo contiene únicamente la regresión logística ajustada; la extracción de características vive en la librería `artefactual`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (clasificador lineal) sobre caracteristicas de entropia de log-probabilidades; no es una red neuronal profunda |
| Parametros totales | 31 (30 coeficientes + intercept; derivado de 2k caracteristicas con k=15, segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la unidad de entrada es una respuesta completa de `microsoft/phi-4` con sus top-15 log-probabilidades por token |
| Tipos de cuantizacion | no disponible (formato skops de scikit-learn; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | skops (`skops.io`), cargable con scikit-learn; sin clases personalizadas, requiere lista `trusted` vacia |
| Modelo objetivo | `microsoft/phi-4` (unico modelo para el que los coeficientes son validos) |
| Valor de k | 15 (fijo) |
| Salida | Puntuacion continua en [0, 1] con `predict_proba`; 1 = clase alucinacion |
| Libreria | sklearn (`library_name: sklearn`), pipeline `text-classification` |
| Version minima de `artefactual` | >= 2026.9 (clase `WEPR`; hasta 2026.08.1 se cargaba con la factoria `wepr()`) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-08-06 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística ajustada sobre características de entropía derivadas de las log-probabilidades de los tokens generados. El procedimiento de feature extraction, descrito en la model card, parsea las top-15 log-probabilidades de una respuesta de completion y las reduce a características de entropía. WEPR mantiene los rangos separados en lugar de agregarlos, aplicando la media y el máximo sobre el eje de tokens para cada rango, lo que produce 2k características (30 con k=15). Según el autor, esto lee estrictamente más de la distribución que EPR con el mismo coste de calibración.

El artefacto publicado es únicamente el `LogisticRegression` ajustado. No contiene ninguna clase personalizada ni pesos del modelo objetivo: no es un fine-tune de `microsoft/phi-4` y no incluye ninguno de sus pesos. La extracción de características que lo alimenta reside en la librería `artefactual` (repositorio de GitHub de artefactory), de modo que el archivo se carga con una lista `trusted` vacía.

No se detalla en la información disponible el número de ejemplos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste adicionales como RLHF o DPO (no aplicables a un clasificador de este tipo). Los detalles metodológicos completos están en el artículo referenciado: Moslonka, Charles; Randrianarivo, Hicham; Garnier, Arthur; Malherbe, Emmanuel, "Learned Hallucination Detection in Black-Box LLMs Using Token-Level Entropy Production Rate", ECIR 2026, Lecture Notes in Computer Science, vol. 16483, pp. 115-130.

## Capacidades

- Detección de alucinaciones: asigna a una respuesta de `microsoft/phi-4` una probabilidad en [0, 1] de pertenecer a la clase alucinación.
- Estimación de incertidumbre: se apoya en características de entropía de las top-15 log-probabilidades por token, de modo que la puntuación refleja la confianza del modelo generador, no solo el texto.
- Funcionamiento en caja negra: no requiere acceso a los pesos ni al estado interno del LLM; solo a la API de generación con log-probabilidades.
- Clasificación de texto (pipeline `text-classification`): entrada compatible con payloads de chat completion o responses al estilo OpenAI que lleven `top_logprobs=15`.
- Integración programática: API `WEPR.from_pretrained(...)` y `detector.predict_proba(response)[:, 1]`.
- Uso como componente de decisión: al devolver una probabilidad continua, permite fijar umbrales propios y construir estrategias de abstención o revisión.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto: no es un modelo generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Guardrail en pipelines RAG sobre phi-4: tras generar una respuesta con `logprobs=True` y `top_logprobs=15`, se puntúa con el detector y se decide si se muestra al usuario, se reformula la consulta o se activa una abstención controlada.
- Enrutado a revisión humana: en flujos donde el coste de un error es alto (documentos legales, informes internos), las respuestas con puntuación por encima de un umbral calibrado con datos propios se envían a una cola de revisión.
- Evaluación offline de sistemas: puntuar de forma automática y umbral-agnóstica (mediante ROC-AUC y PR-AUC) distintas versiones de un prompt, de un índice de recuperación o de un pipeline, comparando configuraciones antes de desplegarlas.
- Monitorización de deriva en producción: registrar la distribución de puntuaciones a lo largo del tiempo para detectar cambios en el comportamiento del modelo servido o en la distribución de consultas.
- Control de calidad en resúmenes y extracción de información: aplicado a respuestas de phi-4 en tareas de resumen, sirve para marcar salidas que podrían contener contenido no respaldado por la fuente.
- Selección de umbral específica por dominio: dado que el artículo no publica un punto de operación, el detector se usa para generar puntuaciones que cada equipo calibra con su propio conjunto etiquetado por dominio y tolerancia al error.
- Filtrado previo en agentes y asistentes multi-turno: aunque el detector no ejecuta acciones, puede colocarse como paso de validación de la respuesta final de cada turno antes de que el sistema encadene el siguiente paso.
- Comparación de estrategias de decodificación: evaluar si variaciones de temperatura, prompts o instrucciones reducen la probabilidad de alucinación medida por el detector, manteniendo el resto del pipeline constante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reproduce cifras, para no desviarse de los resultados publicados, y remite al artículo (arXiv:2509.04492 y DOI 10.1007/978-3-032-21289-4_8), que reporta ROC-AUC y PR-AUC para los modelos evaluados. No se publica ningún punto de operación ni umbral de decisión.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. El artefacto es una regresión logística con 31 parámetros y una extracción de características ligera; se ejecuta en CPU sin GPU.
- GPU recomendadas: no aplica. No hay requisito de GPU para el detector.
- Cabe en cualquier equipo: sí, incluidos portátiles sin GPU dedicada, contenedores pequeños y funciones serverless con límites de memoria modestos.
- Requisito real: la generación de la respuesta debe realizarse con `logprobs=True` y `top_logprobs=15` sobre `microsoft/phi-4`, por lo que hace falta acceso a un endpoint (API o despliegue propio) que exponga esas log-probabilidades.
- Opciones de despliegue: carga directa con `skops` y scikit-learn vía `artefactual>=2026.9`; al ser un objeto sklearn, puede servirse desde cualquier aplicación Python, función serverless o servicio de inferencia que admita dependencias de scikit-learn.
- Latencia y throughput: no disponibles. La latencia dominante no es la del clasificador, sino la de obtener las top-15 log-probabilidades de la respuesta del modelo objetivo.
- Nota: el detector es un componente adicional del pipeline; no requiere vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos generativos.

## Comparativa con modelos similares

| Detector | Tipo | Coste de calibracion | Informacion de la distribucion que usa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WEPR (`artefactory/wepr-phi4`) | Regresion logistica sobre caracteristicas de entropia | 2k caracteristicas (30 con k=15) | Rangos mantenidos por separado; media y maximo sobre el eje de tokens | MIT | HuggingFace (este repositorio) |
| EPR (metodo previo, referenciado en el mismo articulo) | Calibracion sobre entropia de produccion de tokens | Mismo coste de calibracion que WEPR, segun el autor | Agrega los rangos | no disponible | no disponible |
| Otros detectores de alucinacion | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no incluye cifras comparativas entre WEPR y EPR ni frente a otros detectores; la model card solo afirma que WEPR lee estrictamente más de la distribución que EPR con el mismo coste de calibración, y remite al artículo para los resultados de ROC-AUC y PR-AUC.

## Limitaciones y advertencias

- Atado a `microsoft/phi-4`: los coeficientes se ajustaron contra la distribución de salida de ese modelo concreto. Puntuar respuestas de otro modelo no es significativo, aunque nada en el archivo lo impida técnicamente.
- k=15 fijo: las respuestas deben generarse con `logprobs=True` y `top_logprobs=15`. Se rechazan las respuestas con menos rangos en lugar de rellenarlas con ceros, porque los rangos ausentes no se han recuperado y rellenarlos haría que la respuesta pareciese más segura de lo que era.
- Sin punto de operación publicado: el artículo reporta ROC-AUC y PR-AUC, ambas libres de umbral, por lo que no se publica ningún umbral de decisión. Cada equipo debe elegirlo sobre sus propios datos etiquetados.
- Riesgo de alucinación: el detector no genera texto, de modo que no alucina; su riesgo es el opuesto, el de clasificación errónea (falsos positivos y falsos negativos), cuya magnitud no puede cuantificarse sin las cifras del artículo.
- Idiomas soportados: no disponibles. No se documenta si el detector se validó en idiomas distintos del inglés.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Dependencia de versión: requiere `artefactual>=2026.9` (clase `WEPR`); hasta la versión 2026.08.1 los mismos pesos se cargaban con la factoría en minúsculas `wepr()`. Un cambio de versión de la librería puede romper la carga.
- Compatibilidad de scikit-learn: al ser un artefacto `skops` con lista `trusted` vacía, conviene fijar versiones de scikit-learn y skops en producción para evitar problemas de deserialización.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright.
- Adopción limitada: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en producción por terceros.
- Caveat de producción: la puntuación depende de que el servicio de generación exponga fielmente las top-15 log-probabilidades; proveedores que no las devuelvan, las trunquen o las aproximen invalidan el detector.

## Enlaces

- HuggingFace del detector: https://huggingface.co/artefactory/wepr-phi4
- Modelo objetivo: https://huggingface.co/microsoft/phi-4
- Libreria `artefactual` (repositorio e issues): https://github.com/artefactory/artefactual
- Preprint del articulo: https://arxiv.org/abs/2509.04492
- Version publicada (ECIR 2026, Springer): https://doi.org/10.1007/978-3-032-21289-4_8
- Los resultados de la busqueda web facilitados (r6.tracker.network, relacionado con Rainbow Six Siege) no guardan ninguna relacion con este modelo y no se han utilizado como fuente.
