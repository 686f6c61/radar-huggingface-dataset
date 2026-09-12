# artefactory/wepr-falcon3

## Resumen

`artefactory/wepr-falcon3` no es un modelo generativo, sino un detector de alucinaciones calibrado que puntúa respuestas producidas por `tiiuae/Falcon3-10B-Instruct`. Lo desarrolla el Artefact Research Center y se publica como un artefacto de `scikit-learn`: en concreto, una regresión logística ajustada sobre características de entropía extraídas de las probabilidades logarítmicas por token que devuelve el modelo objetivo. El detector no contiene pesos de Falcon3 ni es un fine-tune suyo; consume la salida del modelo, no lo reemplaza.

La innovación es el método WEPR (Weighted EPR), que mantiene separados los rangos de las top-15 probabilidades logarítmicas en lugar de agregarlos, asignando un coeficiente de calibración por rango. Con la media y el máximo sobre el eje de tokens, esto da `2k` características (30 con `k=15`), de modo que lee estrictamente más información de la distribución que EPR al mismo coste de calibración. El método se presentó en el artículo "Learned Hallucination Detection in Black-Box LLMs Using Token-Level Entropy Production Rate" (ECIR 2026), cuyo preprint es arXiv:2509.04492.

Su relevancia práctica es que ofrece una señal de fiabilidad barata y determinista, sin necesidad de un segundo modelo juez ni de acceso a los pesos del LLM evaluado: basta con que la API de inferencia exponga `logprobs=True` y `top_logprobs=15`. El artefacto pesa apenas unos kilobytes y se carga con la lista `trusted` vacía, porque la extracción de características vive en la librería externa `artefactual` y el fichero serializado no contiene clases personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (clasificador binario) sobre caracteristicas de entropia WEPR; serializada con `skops` |
| Parametros totales | 30 coeficientes mas termino independiente (2k caracteristicas de entrada con k=15, segun la model card); peso del artefacto del orden de kilobytes |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la ventana viene impuesta por el modelo objetivo (`tiiuae/Falcon3-10B-Instruct`), no por el detector |
| Tipos de cuantizacion | No aplica (artefacto de `scikit-learn`; se distribuye como fichero `skops`, no en safetensors ni GGUF) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `skops` (serializacion de `scikit-learn`); se carga con lista `trusted` vacia, sin clases personalizadas |
| Modelo objetivo | `tiiuae/Falcon3-10B-Instruct` (los coeficientes estan ajustados contra su distribucion de salida) |
| Entrada requerida | Respuesta en formato compatible con OpenAI (chat completion o responses) con `logprobs=True` y `top_logprobs=15` |
| Version minima de libreria | `artefactual>=2026.9` (clase `WEPR`; hasta 2026.08.1 se cargaba con la factoria en minusculas `wepr()`) |
| Rango de salida | `[0, 1]`, donde 1 corresponde a la clase "alucinacion" |

## Arquitectura y entrenamiento

El artefacto es unicamente la regresion logistica ajustada. La extraccion de caracteristicas que la alimenta —parsear las top-15 probabilidades logaritmicas de una respuesta de completion y reducirlas a caracteristicas de entropia— reside en la libreria `artefactual`, de modo que el fichero publicado no contiene clases personalizadas. El esquema WEPR (Weighted EPR) conserva los rangos separados y asigna a la calibracion un coeficiente por rango, tomando la media y el maximo sobre el eje de tokens, lo que produce `2k` caracteristicas (30 con `k=15`). Segun la model card, esto lee estrictamente mas de la distribucion que EPR con el mismo coste de calibracion.

El detector esta ajustado especificamente contra la distribucion de salida de `tiiuae/Falcon3-10B-Instruct` y funciona sobre un esquema de caja negra: no necesita acceso a los pesos del LLM. No se detalla en la informacion disponible el volumen de datos de calibracion, la composicion del conjunto de ajuste ni si hubo etapas adicionales de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. El metodo se describe en terminos teoricos y experimentales en el articulo de ECIR 2026 (DOI 10.1007/978-3-032-21289-4_8) y en el preprint arXiv:2509.04492.

## Capacidades

- Puntuacion de alucinacion: asigna a una respuesta un valor continuo en `[0, 1]`, donde 1 es la clase alucinacion, a partir de las top-15 probabilidades logaritmicas por token.
- Estimacion de incertidumbre a nivel de token: deriva caracteristicas de entropia de la tasa de produccion de entropia (EPR) ponderada por rango.
- Deteccion en caja negra: no requiere pesos, activaciones ni acceso interno al LLM evaluado, solo la salida con `logprobs` y `top_logprobs=15`.
- Clasificacion determinista y reproducible: al ser una regresion logistica sobre caracteristicas fijas, la misma entrada produce siempre la misma puntuacion.
- Integracion programatica sencilla: `WEPR.from_pretrained(...)` y `predict_proba(...)` mediante la libreria `artefactual`.
- Consumo despreciable de recursos: el ajuste se ejecuta en CPU en microsegundos; no compite por GPU con el modelo generativo.
- No soporta: generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento de agente. Es exclusivamente un clasificador de una unica tarea.

## Casos de uso

- Guardarraíl en produccion sobre Falcon3-10B-Instruct: cada respuesta del asistente se puntua antes de mostrarla al usuario; si la puntuacion supera el umbral elegido, se bloquea la respuesta o se sustituye por una plantilla segura.
- Enrutado a revision humana (human-in-the-loop): en flujos de atencion al cliente, las respuestas con puntuacion alta se derivan a un operador, lo que reduce el coste de revision frente a revisar el 100 % del trafico.
- Evaluacion offline de pipelines RAG: se puntuan los conjuntos de respuestas generados con distintos recuperadores o prompts para medir que configuracion produce mas respuestas no fundamentadas, usando ROC-AUC o PR-AUC sobre datos propios etiquetados.
- Reintento automatico o self-consistency: si la puntuacion es alta, el sistema puede regenerar la respuesta con otra temperatura o un prompt distinto en lugar de entregarla, aprovechando que el detector es mucho mas barato que una segunda generacion completa.
- Monitorizacion y alertado en produccion: agregar las puntuaciones por ventana temporal para detectar degradacion del servicio (cambios de version del modelo, del prompt o de la base documental) antes de que llegue una queja de usuario.
- Auditoria en dominios regulados: en entornos financieros, legales o sanitarios, mantener un registro de la puntuacion de cada respuesta como evidencia de control de calidad, siempre que el proveedor de inferencia exponga las top-15 probabilidades logaritmicas.
- Investigacion en deteccion de alucinaciones: reproducir y extender el metodo WEPR frente a EPR u otras senales basadas en entropia, reutilizando el artefacto calibrado como linea base.
- A/B testing de prompts y versiones: comparar la tasa de respuestas marcadas como alucinacion entre dos variantes de prompt sobre el mismo modelo objetivo, con una metrica objetiva y sin jurado humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al articulo (arXiv:2509.04492 y DOI 10.1007/978-3-032-21289-4_8) e indica que este informa de ROC-AUC y PR-AUC para los modelos evaluados, pero no reproduce ninguna cifra para evitar que la ficha se desvie de los resultados publicados. En consecuencia, no se incluyen numeros (MMLU, HumanEval, GSM8K u otros) porque no aplican a un detector de alucinaciones ni estan disponibles en el material proporcionado.

## Requisitos de hardware

- Detector (`artefactory/wepr-falcon3`): una regresion logistica de 30 caracteristicas. Se ejecuta en CPU, con consumo de memoria del orden de megabytes y latencia por peticion despreciable frente a la generacion. No requiere GPU.
- Modelo objetivo (`tiiuae/Falcon3-10B-Instruct`): hay que poder ejecutarlo o invocarlo con `logprobs=True` y `top_logprobs=15`. Estimaciones orientativas por tamano (10 000 millones de parametros, denso): en bf16/fp16 en torno a 20 GB de VRAM mas cache de KV; en cuantizacion de 8 bits en torno a 10-11 GB; en 4 bits en torno a 6-7 GB. Son calculos a partir del numero de parametros, no cifras publicadas para este artefacto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 sin cuantizar. En consumer, una RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto moderado, y tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.) solo con cuantizacion de 4 bits y contexto reducido.
- Alternativa sin GPU propia: usar un proveedor de inferencia que exponga las top-15 probabilidades logaritmicas, requisito imprescindible porque el detector rechaza las respuestas con menos rangos en lugar de rellenarlas con ceros.
- Opciones de despliegue del modelo objetivo: vLLM, TGI, llama.cpp u Ollama, segun el formato de pesos y el soporte de logprobs de cada servidor; conviene verificar que la capa de serving devuelve `top_logprobs=15` con la estructura esperada por `artefactual`.
- Latencia y throughput del detector: no disponible en la informacion proporcionada. Al ser una regresion logistica sobre 30 caracteristicas, la puntuacion es puramente CPU-bound y no deberia ser el cuello de botella del sistema.

## Comparativa con modelos similares

| Alternativa | Tipo | Entrada necesaria | Coste de calibracion | Datos comparativos |
|---|---|---|---|---|
| WEPR (`artefactory/wepr-falcon3`) | Regresion logistica sobre caracteristicas de entropia ponderadas por rango | `logprobs=True`, `top_logprobs=15` del modelo objetivo | Un coeficiente por rango (2k caracteristicas con k=15) | ROC-AUC y PR-AUC en el articulo; cifras no reproducidas en la model card |
| EPR (linea base del articulo) | Detector basado en tasa de produccion de entropia, sin ponderar por rango | Logprobs del modelo objetivo | Menor granularidad de caracteristicas | La model card afirma que WEPR lee estrictamente mas de la distribucion al mismo coste; sin cifras disponibles |
| Semantic entropy (familia de metodos de incertidumbre semantica) | Estimacion de incertidumbre por muestreo multiple | Varias generaciones por pregunta | No comparable: requiere multiples muestreos, no solo logprobs | No disponible |
| LLM-as-a-judge | Modelo generativo que evalua la respuesta | Texto de la respuesta (y opcionalmente contexto) | Coste de inferencia de un segundo LLM | No disponible |

No se dispone de datos numericos comparativos en la informacion proporcionada, por lo que la tabla es cualitativa.

## Limitaciones y advertencias

- Atado a un unico modelo objetivo: los coeficientes estan ajustados contra la distribucion de salida de `tiiuae/Falcon3-10B-Instruct`. Puntuar respuestas de otro modelo con ellos no tiene sentido, aunque nada en el fichero lo impida tecnicamente.
- `k` fijo en 15: las respuestas deben generarse con `logprobs=True` y `top_logprobs=15`. Se rechazan las que traigan menos rangos en lugar de rellenarlas con ceros, porque los rangos ausentes no se han recuperado y rellenarlos haria que la respuesta pareciese mas segura de lo que es.
- Sin punto de operacion publicado: el articulo informa de ROC-AUC y PR-AUC, ambas metricas independientes del umbral, por lo que no se publica ningun umbral de decision. Hay que elegirlo sobre datos propios etiquetados.
- No es un modelo generativo: no produce texto, no razona, no ejecuta herramientas y no mantiene conversaciones. Cualquier expectativa de uso como LLM es erronea.
- Dependencia de la libreria externa: requiere `artefactual>=2026.9`; en versiones hasta 2026.08.1 los mismos pesos se cargaban con la factoria en minusculas `wepr()`. Los cambios de API son un riesgo de integracion.
- Dependencia de la API de inferencia: si el proveedor no expone las top-15 probabilidades logaritmicas, el detector es inutilizable. Tampoco sirve con modelos servidos sin logprobs.
- Riesgo de falsos positivos y negativos: al no haber umbral publicado ni metricas en la ficha, no se puede anticipar su comportamiento en un dominio concreto sin una validacion propia.
- Sesgos: no disponibles. La model card no documenta sesgos demograficos, linguisticos ni de dominio, y no hay informacion sobre la composicion del conjunto de calibracion.
- Idioma: no disponible. No se especifica para que idiomas esta calibrado el detector; la calibracion depende de la distribucion de salida de Falcon3-10B-Instruct y podria no transferirse igual entre idiomas.
- Licencia MIT: permite uso comercial y modificacion, pero el detector solo tiene sentido en combinacion con el modelo objetivo, cuya licencia es independiente y debe verificarse por separado.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe comunidad ni soporte mas alla del repositorio de incidencias.
- Advertencia general: la deteccion de alucinaciones es probabilistica; un guardarraíl basado en este detector no sustituye a la validacion humana en aplicaciones criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artefactory/wepr-falcon3
- Modelo objetivo: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Libreria `artefactual`: https://github.com/artefactory/artefactual
- Incidencias y contacto: https://github.com/artefactory/artefactual/issues
- Preprint: https://arxiv.org/abs/2509.04492
- Publicacion en ECIR 2026 (Springer, LNCS vol. 16483, pp. 115-130): https://doi.org/10.1007/978-3-032-21289-4_8
- Cita: Moslonka, C., Randrianarivo, H., Garnier, A., Malherbe, E. (2026). Learned Hallucination Detection in Black-Box LLMs Using Token-Level Entropy Production Rate. *Advances in Information Retrieval*.
