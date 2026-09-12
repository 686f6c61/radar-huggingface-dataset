# artefactory/epr-falcon3

## Resumen

`artefactory/epr-falcon3` es un detector de alucinaciones calibrado para respuestas generadas por `tiiuae/Falcon3-10B-Instruct`. No es un modelo generativo ni un ajuste fino del modelo objetivo: es un artefacto de scikit-learn compuesto por una única regresión logística entrenada sobre una sola característica, la tasa de producción de entropía (EPR, Entropy Production Rate), definida como la entropía truncada `-sum_k p_k ln p_k` promediada sobre los tokens de la respuesta. Lo desarrolla el Artefact Research Center (Artefact) y se distribuye con licencia MIT.

El problema que resuelve es la detección de alucinaciones en escenarios de caja negra: en lugar de requerir acceso a los pesos o a las representaciones internas del modelo, el detector solo necesita las log-probabilidades de los 15 tokens más probables en cada paso de decodificación, que se obtienen de una API compatible con OpenAI (`logprobs=True`, `top_logprobs=15`). El método se presentó en el artículo «Learned Hallucination Detection in Black-Box LLMs Using Token-Level Entropy Production Rate» (ECIR 2026, *Advances in Information Retrieval*, LNCS vol. 16483, pp. 115-130; preprint en arXiv:2509.04492).

Su relevancia actual es doble: por un lado, propone una señal de incertidumbre de coste mínimo (una característica, un coeficiente) frente a alternativas basadas en muestreo múltiple; por otro, está estrictamente acoplado al modelo objetivo, lo que lo convierte en una pieza de infraestructura para pipelines que ya sirven Falcon3-10B-Instruct y necesitan filtrar o priorizar respuestas antes de mostrarlas. El repositorio acumula 0 descargas y 0 «likes», por lo que no existe validación comunitaria publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (`LogisticRegression` de scikit-learn) sobre una unica caracteristica: entropia truncada (EPR) de las top-15 log-probabilidades, promediada por token |
| Parametros totales | 1 coeficiente mas el termino independiente (no es un modelo neuronal; no aplica un recuento en miles de millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el detector consume la respuesta completa generada con `top_logprobs=15` |
| Tipos de cuantizacion | no aplica (el artefacto es una serializacion skops de un clasificador lineal; no hay pesos de red neuronal) |
| Idiomas soportados | no disponible (el detector opera sobre log-probabilidades y no depende del idioma; la cobertura linguistica efectiva la determina Falcon3-10B-Instruct) |
| Licencia | MIT |
| Formato de pesos | skops (serializacion de scikit-learn); se carga con lista `trusted` vacia, sin clases personalizadas |

Otros datos relevantes: `library_name: sklearn`, `pipeline_tag: text-classification`, requiere `artefactual>=2026.9` (hasta la version 2026.08.1 los mismos pesos se cargaban con la factoria en minusculas `epr()`), k fijo en 15 rangos y carga mediante `EPR.from_pretrained("artefactory/epr-falcon3")`.

## Arquitectura y entrenamiento

El detector es un clasificador lineal binario. La extraccion de caracteristicas —parsear las 15 log-probabilidades mas altas de una respuesta de completion y reducirlas a un unico valor de entropia— no vive en el fichero del modelo, sino en la libreria `artefactual`, de modo que el artefacto publicado contiene exclusivamente la `LogisticRegression` ajustada. La model card no detalla el volumen de datos de entrenamiento, la composicion del conjunto de etiquetas ni el procedimiento de calibracion; unicamente indica que los coeficientes se ajustan contra la distribucion de salida de `tiiuae/Falcon3-10B-Instruct`.

La innovacion tecnica es la definicion de la caracteristica EPR: en lugar de agregar estadisticos por token de forma no supervisada o de requerir multiples muestreos, agrega todos los rangos de la distribucion en un solo numero (entropia truncada promediada por token) y aprende un unico coeficiente sobre el. El resultado es un modelo de caja negra aplicable cuando solo se dispone de log-probabilidades, con el requisito estricto de que la respuesta se genere con `logprobs=True` y `top_logprobs=15`. Los rangos ausentes se rechazan en lugar de rellenarse con ceros, porque los rangos que faltan son no recuperados y no inexistentes: rellenarlos haria que la respuesta puntuase como mas confiada de lo que realmente fue.

## Capacidades

- Clasificacion binaria de alucinacion: devuelve una puntuacion en `[0, 1]` por respuesta, donde 1 corresponde a la clase «alucinacion».
- Deteccion en caja negra: no necesita pesos, activaciones ni representaciones internas del modelo generador, solo las log-probabilidades de salida.
- Estimacion de incertidumbre a partir de una unica generacion: no requiere muestrear la misma pregunta varias veces.
- Extraccion de la caracteristica a partir de cargas compatibles con OpenAI (`chat completions` o `responses`) que incluyan `top_logprobs=15`.
- Integracion directa en Python mediante `EPR.from_pretrained` y `predict_proba(...)[:, 1]`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni agentes: es exclusivamente un clasificador de respuestas.
- No aporta explicabilidad local sobre que fragmento de la respuesta es alucinado; emite una puntuacion agregada por respuesta.
- Capacidades multilingues: no documentadas de forma especifica; dependen del modelo objetivo y de como este distribuya sus log-probabilidades.

## Casos de uso

- Filtrado previo a la entrega en produccion: en un asistente construido sobre Falcon3-10B-Instruct, cada respuesta se puntua antes de mostrarse al usuario y las que superan un umbral elegido sobre datos propios se bloquean, se reformulan o se redirigen.
- Enrutado a revision humana (human-in-the-loop): las respuestas con puntuacion alta se encolan para un revisor, lo que concentra el esfuerzo de supervision en la fraccion de casos con mayor riesgo en lugar de revisar todo el trafico.
- Auditoria offline de lotes: puntuar un conjunto historico de respuestas para medir la tasa de alucinacion por version de prompt, por plantilla de sistema o por fuente de datos, y comparar antes y despues de un cambio.
- Control de calidad en sistemas RAG: si el pipeline de recuperacion devuelve contexto irrelevante, el modelo tiende a responder con baja confianza; la puntuacion EPR actua como senal de alarma sobre la calidad de la recuperacion.
- Monitorizacion y alertas de deriva: registrar la distribucion de puntuaciones en produccion y disparar alertas cuando la media o el percentil 95 se desplacen, lo que puede indicar cambios en los datos de entrada o en la configuracion de decodificacion.
- Priorizacion de anotacion: usar la puntuacion como criterio de muestreo activo para construir un conjunto etiquetado de alucinaciones con coste de anotacion reducido, y despues calibrar el umbral de decision sobre ese conjunto.
- Abtencion selectiva: en dominios regulados (sanidad, legal, finanzas), hacer que el sistema responda «no dispongo de informacion suficiente» cuando la puntuacion cruce el umbral operativo acordado.
- Evaluacion comparativa de variantes: medir el efecto de distintas temperaturas, prompts de sistema o estrategias de *few-shot* sobre la confianza media de las respuestas de Falcon3-10B-Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al articulo (arXiv:2509.04492) e indica que no reproduce cifras concretas para evitar divergencias con los resultados publicados. El articulo reporta ROC-AUC y PR-AUC para los modelos evaluados, ambas metricas independientes de umbral, pero las cifras exactas no forman parte de la informacion proporcionada. Tampoco se publica un punto de operativo ni un umbral de decision recomendado.

## Requisitos de hardware

- Detector: coste despreciable. Es una regresion logistica con una caracteristica; se ejecuta en CPU, sin GPU, y su huella en memoria es de orden de kilobytes. La latencia de puntuacion es de microsegundos y no es un cuello de botella en ningun pipeline.
- El coste real de computo procede del modelo objetivo, `tiiuae/Falcon3-10B-Instruct`, que debe servirse para generar las respuestas con `top_logprobs=15`.
- Estimaciones orientativas de VRAM para el modelo objetivo (calculadas a partir de un recuento aproximado de 10 000 millones de parametros, sin incluir la cache KV): aproximadamente 20 GB en bf16/fp16, en torno a 11 GB en cuantizacion de 8 bits y alrededor de 6 GB en 4 bits.
- GPU de centro de datos: H100, A100 80 GB o A100 40 GB, con holgura para contexto largo y lotes concurrentes.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en bf16 con contexto moderado, y en tarjetas de 12-16 GB con cuantizacion de 8 o 4 bits. La cache KV crece con la longitud de contexto, por lo que la longitud de contexto real soportada debe consultarse en la ficha del modelo objetivo.
- Opciones de despliegue: se necesita un servidor de inferencia que exponga log-probabilidades y `top_logprobs` en un formato compatible con OpenAI, requisito que impone la propia model card. No se especifica ningun motor concreto (vLLM, TGI, llama.cpp, Ollama u otros) en la informacion disponible, y no todos los motores ni rutas de servicio exponen las top-k log-probabilidades, por lo que conviene verificar esta capacidad antes de disenar el pipeline.
- Latencia y throughput: no disponible. Dependen por completo del motor y del hardware que sirva el modelo objetivo; el detector anade un coste marginal.

## Comparativa con modelos similares

| Modelo / metodo | Enfoque | Requiere logprobs del modelo objetivo | Requiere multiples generaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `artefactory/epr-falcon3` | Regresion logistica sobre la entropia truncada de las top-15 log-probabilidades (1 caracteristica) | Si, `top_logprobs=15` | No | MIT | HuggingFace (`artefactory/epr-falcon3`), 0 descargas |
| SelfCheckGPT | Consistencia entre varias generaciones muestreadas del mismo prompt (caja negra) | No | Si | no disponible | Repositorio publico de los autores |
| Entropia semantica (Kuhn et al.) | Entropia sobre agrupaciones semanticas de respuestas muestreadas | No | Si | no disponible | Codigo publico del grupo OATML |

No se dispone de cifras de rendimiento comparables entre estas alternativas en la informacion proporcionada, mas alla de que el articulo de EPR reporta ROC-AUC y PR-AUC. La diferencia estructural mas relevante es el coste: EPR necesita una sola generacion con log-probabilidades, mientras que los metodos de consistencia y entropia semantica requieren varias muestras por consulta.

## Limitaciones y advertencias

- Acoplamiento estricto al modelo objetivo: los coeficientes estan ajustados contra la distribucion de salida de `tiiuae/Falcon3-10B-Instruct`. Puntuar respuestas de otro modelo no es significativo, aunque el fichero no lo impida tecnicamente.
- k fijo en 15: las respuestas deben generarse con `logprobs=True` y `top_logprobs=15`. Si se recuperan menos rangos, la respuesta se rechaza en lugar de rellenarse con ceros.
- Ausencia de umbral publicado: el articulo reporta metricas independientes de umbral (ROC-AUC y PR-AUC), por lo que no existe un punto de operativo recomendado. Cada equipo debe elegir el suyo sobre datos etiquetados propios.
- Dependencia de la API de inferencia: si el proveedor no expone las top-15 log-probabilidades, el detector no se puede usar. Muchas APIs cerradas y algunas configuraciones de servidores autoalojados no ofrecen esta funcionalidad.
- Sensibilidad a los parametros de decodificacion: la calibracion se ajusta sobre una distribucion de salida concreta; cambios en temperatura, top-p u otras estrategias de muestreo alteran esa distribucion y es previsible que afecten a la calibracion. Conviene revalidar el umbral tras cualquier cambio de configuracion.
- Riesgo de alucinacion del propio detector: es un clasificador estadistico, con falsos positivos y falsos negativos; no debe tratarse como una garantia de veracidad ni como sustituto de la verificacion factual en dominios criticos.
- Sin granularidad: emite una unica puntuacion por respuesta; no localiza que afirmacion es la problematica ni ofrece justificacion.
- Sin validacion comunitaria: 0 descargas y 0 «likes» en el momento de la consulta; no hay evidencia publica de uso en produccion por terceros.
- Alcance de la licencia: la licencia MIT cubre el artefacto del detector. El modelo objetivo Falcon3-10B-Instruct se distribuye bajo su propia licencia, independiente de esta, y sus condiciones deben revisarse en su ficha antes de un uso comercial.
- Idiomas: no se documenta cobertura linguistica especifica; el rendimiento en idiomas distintos del ingles depende del modelo objetivo y no esta caracterizado en la informacion disponible.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces disponibles son los de la propia model card y el articulo asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artefactory/epr-falcon3
- Modelo objetivo: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Libreria `artefactual`: https://github.com/artefactory/artefactual
- Incidencias y contacto: https://github.com/artefactory/artefactual/issues
- Preprint: https://arxiv.org/abs/2509.04492
- Publicacion (ECIR 2026, Springer): https://doi.org/10.1007/978-3-032-21289-4_8
