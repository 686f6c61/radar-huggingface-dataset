# dhresearch/quality-router-v2-predicted-success

## Resumen

`dhresearch/quality-router-v2-predicted-success` no es un modelo de lenguaje, sino un artefacto de decisión para el enrutado de LLM. Se trata del reajuste con semilla 0, fechado el 3 de octubre de 2026, del conjunto de cabezas de éxito (*success heads*) que emplea la política `predicted_outcome` del estudio `quality_router_v2`. Lo publica el usuario `dhresearch` bajo licencia «other» y se distribuye como un diccionario serializado con joblib, cargable mediante `joblib.load`.

El artefacto estima la probabilidad de éxito de cada una de las seis rutas definidas en el estudio (`cheap_model`, `medium_model`, `code_specialist`, `code_specialist_repair`, `strong_model` y `strong_repair`) y combina esa estimación con un coste constante —la media del conjunto de entrenamiento por ruta, `cost_model='mean'`— para seleccionar la opción más barata que supere el umbral de validación de 0,85. Es, en la práctica, la pieza que alimenta la «puerta de confianza» del enrutador.

Su relevancia es acotada y muy específica: permite reproducir y auditar una política de enrutado consciente de coste sobre un *pool* medido de 1000 filas (602 de entrenamiento, 154 de validación y 244 de prueba). La propia model card advierte de que la tarjeta servida de `quality_router_v2` versión 8 fija `learned_downrouting=false` y no carga pesos ajustados, de modo que este archivo queda publicado pero sin cargar en el servicio servido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de cabezas de éxito (*success heads*) implementadas sobre scikit-learn; el artefacto es el diccionario devuelto por `predicted_outcome.fit_heads`. El entorno de reajuste incluye LightGBM 4.7.0, aunque la model card no detalla la clase concreta de cada cabeza |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo generativo; opera sobre rasgos tabulares) |
| Tipos de cuantizacion | no aplica (formato de serializacion joblib, no tensores cuantizables) |
| Idiomas soportados | no disponible; el artefacto no procesa texto de entrada |
| Licencia | other (sin terminos adicionales detallados en la informacion disponible) |
| Formato de pesos | joblib (`joblib.load` devuelve el diccionario de `fit_heads`) |
| Autor | dhresearch |
| Libreria declarada | sklearn |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace, valor redondeado) |
| Dataset de entrenamiento | dhresearch/outcome-router-v2-measured-pool |
| Ficheros del dataset | pilot_tasks.jsonl, pilot_outcomes.jsonl, splits.json |
| Rutas evaluadas | cheap_model, medium_model, code_specialist, code_specialist_repair, strong_model, strong_repair (6) |
| Filas por pliegue | train 602 / val 154 / test 244 |
| Umbral de validacion | 0,85 |
| Semilla | 0 |
| Versiones en el reajuste | python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1 |
| Fecha de creacion / actualizacion | 2026-10-03 / 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no es una red neuronal ni un transformer: es un ajuste tabular. La model card indica que se generó con la llamada `predicted_outcome.fit_heads(train, routes, n_numeric=..., seed=0, cost_model='mean')` sobre las filas del *pool* medido, construidas con `revalidate_claims` usando `use_source=False` y `use_interface=True`. Es decir, las características de entrada son variables numéricas más un *one-hot* de la interfaz, y la variable objetivo es el éxito medido de cada ruta. No se documenta el número de características, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este tipo de artefacto).

Un punto crítico de la model card es que el entrenamiento original escribió predicciones y no guardó los pesos; este archivo es un reajuste (*refit*) posterior, no el modelo original del estudio. Además, el coste no se aprende: el coste predicho de cada ruta es la media del conjunto de entrenamiento de esa ruta (`cost_model='mean'`) y el *bundle* no incluye ninguna cabeza *ridge* de coste. El umbral 0,85 tampoco es un coeficiente ajustado, sino el umbral más barato dentro del presupuesto de fallo, elegido sobre el pliegue de validación y registrado en `agreement.json`. Las cabezas constantes no tienen entrada `model` en el diccionario y devuelven directamente la media de la ruta.

## Capacidades

- Predicción de éxito por ruta para las seis rutas del estudio, con puntuación mediante `predicted_outcome.predict_routes`.
- Estimación de coste constante por ruta (media del conjunto de entrenamiento), sin cabeza de coste ajustada.
- Alimentación de la puerta de confianza del enrutador: lee las cabezas de éxito y decide si se aplica *downrouting* hacia una ruta más barata.
- Soporte de umbral de decisión configurable: el valor de referencia es 0,85, con `slack` 0,01 y `budget_failure` 0,159351.
- Serialización portable en un único diccionario joblib, cargable en cualquier proceso Python con scikit-learn.
- No incluye generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No implementa *tool calling*, *function calling* ni razonamiento multi-paso por sí mismo.
- No declara capacidades multilingües ni procesamiento de lenguaje natural.

## Casos de uso

- Enrutado consciente de coste en producción: dado un *prompt*, puntuar las seis rutas con las cabezas de éxito y elegir la más barata cuya probabilidad supere 0,85, reduciendo el gasto frente a invocar siempre el modelo fuerte.
- Cascada de modelos con presupuesto de fallo: fijar el umbral a partir del registro de validación (`budget_failure` 0,159351) para mantener la tasa de fallo por debajo del presupuesto aceptado por el equipo.
- Desambiguación entre especialista y reparación en código: comparar directamente `code_specialist` frente a `code_specialist_repair` (y `strong_model` frente a `strong_repair`) antes de lanzar una segunda pasada de reparación sobre una respuesta fallida.
- Auditoría de políticas de enrutado: reproducir la política `predicted_outcome` y contrastarla con un umbral fijo o con enrutado aleatorio sobre las mismas 244 filas de prueba.
- Reproducción de investigación: reajustar con semilla 0 sobre `pilot_tasks.jsonl`, `pilot_outcomes.jsonl` y `splits.json` para replicar los resultados del estudio o estudiar su sensibilidad.
- Línea base trivial para comparativas: las cabezas constantes (sin entrada `model`) permiten construir un *baseline* de coste y éxito sin entrenamiento, útil como referencia mínima en experimentos de enrutado.
- Despliegue en servicios sin GPU: al ser un artefacto tabular cargado con joblib, puede integrarse en un microservicio Python en CPU junto al enrutador que consume sus predicciones.
- Análisis de sensibilidad al coste: al usar costes medios por ruta, sirve para estudiar cuánto cambia la política si se sustituyen por tarifas reales de proveedor, siempre que se reajuste externamente el modelo de coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los benchmarks habituales de modelos generativos (MMLU, HumanEval, GSM8K) no aplican a este artefacto, que no genera texto. Los únicos datos cuantitativos disponibles son los del registro de acuerdo (*agreement*) del reajuste:

| Metrica | Valor |
|---|---|
| Filas de entrenamiento | 602 |
| Filas de validacion | 154 |
| Filas de prueba | 244 |
| Rutas | 6 (cheap_model, medium_model, code_specialist, code_specialist_repair, strong_model, strong_repair) |
| Politica | predicted_outcome |
| Umbral | 0,85 |
| budget_failure | 0,159351 |
| slack | 0,01 |
| Motivo del umbral | «cheapest validation threshold inside the failure budget» |
| Semilla | 0 |
| Cabeza de coste ridge | no incluida |

## Requisitos de hardware

- VRAM para inferencia: no aplica; el artefacto se ejecuta en CPU.
- GPU recomendadas: ninguna. No se requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: irrelevante; no hay componente de cómputo acelerado.
- Entorno de ejecución: Python con joblib (1.6.0 en el reajuste), scikit-learn (1.9.1), numpy (2.5.3), scipy (1.18.1) y lightgbm (4.7.0) según las versiones declaradas.
- Almacenamiento: el repositorio figura con 0,0 GB en HuggingFace (valor redondeado), lo que indica un artefacto de tamaño muy reducido; no se publica el tamaño exacto en bytes.
- Opciones de despliegue: carga directa con `joblib.load` dentro de un servicio Python. No es compatible con vLLM, llama.cpp, Ollama ni TGI, orientados a modelos generativos.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

En la informacion proporcionada no se incluye ninguna comparativa con otros artefactos. Los pares de categoría serían enrutadores de LLM de código abierto o servicios de enrutado, pero no hay datos de parámetros, contexto, licencia ni rendimiento que permitan una comparación rigurosa:

| Artefacto | Categoria | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| quality-router-v2-predicted-success | Cabezas de exito para enrutado de LLM | no disponible | no aplica | other | Semilla 0; 602/154/244 filas; umbral 0,85 |
| RouteLLM | Enrutador de LLM de codigo abierto | no disponible | no aplica | no disponible | no disponible |
| semantic-router | Enrutador semantico de codigo abierto | no disponible | no aplica | no disponible | no disponible |
| NotDiamond | Servicio comercial de enrutado | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; solo produce puntuaciones de éxito y una decisión de ruta.
- La model card indica que el run original no guardó los pesos y que este archivo es un reajuste posterior; sus resultados pueden no coincidir exactamente con los del estudio original.
- La tarjeta servida de `quality_router_v2` versión 8 fija `learned_downrouting=false` y no carga pesos ajustados, por lo que este archivo queda sin usar en el servicio publicado; integrarlo requiere trabajo adicional.
- El coste no es un modelo aprendido: usa la media del conjunto de entrenamiento por ruta (`cost_model='mean'`), lo que lo hace frágil ante cambios de precios o de proveedor. No hay cabeza *ridge* de coste.
- El umbral 0,85 no es un coeficiente ajustado, sino un valor seleccionado sobre el pliegue de validación; puede no transferirse a otros dominios o distribuciones de tareas.
- Volumen de datos reducido (602 filas de entrenamiento, 154 de validación, 244 de prueba): riesgo de sobreajuste y de generalización limitada.
- Riesgo de falsos positivos: una predicción de éxito demasiado optimista puede enrutar consultas hacia modelos peores, degradando la calidad de forma silenciosa. No es «alucinación» en el sentido generativo, pero el efecto práctico es comparable.
- Sesgos conocidos: no documentados. Cualquier sesgo provendría del *pool* medido y de la selección de tareas y modelos incluidos en él.
- Idiomas: no disponible. No hay declaración de soporte multilingüe y el artefacto no procesa texto directamente.
- Licencia «other» sin términos detallados: antes de un uso comercial es imprescindible revisar el repositorio y contactar con el autor para conocer las condiciones reales.
- Señales de adopción nulas: 0 descargas y 0 likes, con creación y actualización el mismo día (2026-10-03, con un segundo de diferencia), lo que apunta a un artefacto sin validación externa.
- No se declara *pipeline* en HuggingFace ni idiomas en los metadatos, lo que dificulta su descubrimiento y filtrado automático.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-predicted-success
- Dataset del estudio: https://huggingface.co/datasets/dhresearch/outcome-router-v2-measured-pool
- La busqueda web realizada no devolvio ningun enlace relacionado con este artefacto. Los resultados obtenidos (leaderboards generales de OpenRouter y OrcaRouter, un blog de Hugging Face sobre otro modelo y un articulo de prensa sobre Gemini 4 Argon) no guardan relacion con esta ficha y se omiten por no ser pertinentes.
