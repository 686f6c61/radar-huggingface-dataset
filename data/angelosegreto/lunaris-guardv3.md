# ANGELOSEGRETO/lunaris-guardv3

## Resumen

Lunaris Guard v3 es un modelo de clasificacion de texto (encoder) desarrollado por Auren Research —publicado en HuggingFace bajo la cuenta ANGELOSEGRETO— especializado en la deteccion de prompt injection, clasificacion binaria de seguridad y etiquetado multietiqueta en 14 categorias de riesgo. Esta construido sobre el encoder multilingue `jhu-clsp/mmbert-base` y cuenta con aproximadamente 307 millones de parametros (306.953.490 exactos segun los pesos en safetensors), con una longitud maxima de secuencia de 2048 tokens y licencia MIT.

El problema que resuelve es concreto: los pipelines de agentes actuales (RAG, tool calling, MCP, navegacion web, agentes de codigo) ingieren contenido no confiable que puede contener instrucciones maliciosas, y las soluciones genericas de moderacion no cubren estas superficies. Lunaris Guard v3 incorpora cabezas especificas para inyeccion directa e indirecta, envenenamiento de metadatos de herramientas y salidas MCP, inyeccion en Markdown/HTML/CSV/JSON de API, ataques en issues, PRs y READMEs, y extraccion de prompts de sistema, ademas de negativos dificiles benignos que citan frases peligrosas en contextos de documentacion o formacion.

Su relevancia actual radica en el enfoque en el equilibrio entre recall y falsos positivos: en la sonda de fiabilidad de 100 ejemplos sinteticos publicada por el autor, alcanza la mayor especificidad sobre trafico limpio (0,740) y el mejor AUROC (0,888) frente a alternativas como Wolf Defender PI, Qualifire Sentinel y Rogue Sentinel v2, a costa de un recall ligeramente inferior (0,900 frente a 0,940 de dos de ellas). Se distribuye con soporte de `transformers` mediante `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de `jhu-clsp/mmbert-base`, encoder multilingue tipo ModernBERT); cabezas de clasificacion multiple (inyeccion binaria, seguridad binaria y 14 categorias multietiqueta) |
| Parametros totales | 306.953.490 (~307M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales en la informacion proporcionada; el tag de HuggingFace incluye `safetensors`) |
| Idiomas soportados | en, pt, es, fr, zh, hi, ar, ru, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint principal); se mantiene tambien el layout antiguo `backbone/` + `heads.pt` por compatibilidad |
| Libreria | transformers (requiere `trust_remote_code=True`, tag `custom_code`) |
| Pipeline | text-classification |
| Salidas multitarea | 3 cabezas: `injection_logits` (binaria), `safety_logits` (binaria), `category_logits` (14 categorias con sigmoide) |
| Tamano del repositorio | 4,9 GB |
| Modelo base | jhu-clsp/mmbert-base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni el proceso de ajuste (si hubo RLHF, DPO o alguna fase de alineacion; en un clasificador de seguridad estos mecanismos no serian el procedimiento habitual). Lo que si se documenta es la estructura: un encoder `jhu-clsp/mmbert-base` sobre el que se anaden tres cabezas de clasificacion supervisadas. La cabeza de inyeccion y la de seguridad son binarias, mientras que la cabeza de categorias es multietiqueta y aplica una sigmoide independiente por etiqueta, lo que permite que un mismo texto active varias categorias de riesgo a la vez. Las 14 categorias, en orden de emision, son: `violent_crimes`, `non_violent_crimes`, `sex_crimes`, `child_exploitation`, `defamation`, `specialized_advice`, `privacy`, `intellectual_property`, `indiscriminate_weapons`, `hate`, `suicide_self_harm`, `sexual_content`, `elections` y `code_interpreter_abuse`.

La innovacion tecnica destacable no esta en el bloque encoder, sino en la cobertura de superficies de ataque de agentes y en la inclusion explicita de "negativos dificiles benignos" durante el desarrollo: fragmentos legitimados que mencionan frases peligrosas en documentacion, logs o material de formacion en seguridad, y que un detector ingenuo bloquearia. El modelo se publica con codigo remoto personalizado (`custom_code`) para exponer las tres cabezas a traves del flujo estandar de `AutoModelForSequenceClassification`. El autor indica que el repositorio conserva el layout antiguo (`backbone/` + `heads.pt`) por compatibilidad, pero que la ruta recomendada es la carga estandar con `trust_remote_code=True`.

## Capacidades

- Deteccion de prompt injection directa e intentos de sobrescritura de instrucciones.
- Deteccion de prompt injection indirecta, incluyendo contenido recuperado en pipelines RAG.
- Deteccion de envenenamiento en salidas de herramientas y en metadatos de herramientas o servidores MCP.
- Deteccion de inyeccion en resultados de navegador y de busqueda.
- Deteccion de inyeccion embebida en Markdown, HTML, CSV, JSON de API, logs y documentos.
- Deteccion de ataques dirigidos a agentes de codigo: issues, pull requests, READMEs y comentarios.
- Deteccion de intentos de extraccion de prompts de sistema o de desarrollador.
- Clasificacion de seguridad binaria (`unsafe`) independiente de la deteccion de inyeccion.
- Etiquetado multietiqueta en 14 categorias de riesgo, con probabilidad independiente por categoria.
- Tratamiento de negativos dificiles benignos para reducir falsos positivos sobre documentacion y material de formacion.
- Capacidad multilingue en 9 idiomas: ingles, portugues, espanol, frances, chino, hindi, arabe, ruso y japones.
- Uso como clasificador puro: no genera texto, no soporta tool calling propio ni razonamiento multi-paso; es un componente de guardrail para insertar dentro de pipelines de agentes.

## Casos de uso

- Guardrail de entrada en pipelines RAG: antes de insertar fragmentos recuperados en el contexto del LLM, se ejecuta el modelo sobre cada fragmento y se bloquea o cuarentena el documento si alguna porcion supera el umbral. Es adecuado porque la inyeccion indirecta suele aparecer en una sola parte de un documento largo, y el patron de chunking con 512-1536 tokens y solapamiento de 64-256 tokens con agregacion por `max(injection_probability)` cubre exactamente ese escenario.
- Proteccion de agentes con tool calling y MCP: el modelo analiza las salidas de herramientas y los metadatos de herramientas o servidores MCP antes de que el agente las procese, evitando que una descripcion de herramienta envenenada redirija el comportamiento del agente.
- Moderacion de interacciones de atencion al cliente y correo de soporte: se clasifican tickets y correos entrantes para detectar intentos de manipulacion del asistente, ademas de activar las 14 categorias de seguridad para escalado a revision humana. Encaja en flujos multi-turno porque es un clasificador ligero que puede ejecutarse en cada mensaje sin anadir latencia significativa.
- Escaneo de artefactos en agentes de codigo: revision de issues, pull requests, comentarios y READMEs antes de que un agente automatico los lea o actue sobre ellos, cubriendo ataques especificos de esta superficie que la moderacion generica no contempla.
- Filtrado de ingesta web y de resultados de busqueda: todo contenido rastreado o recuperado de un buscador pasa por el modelo antes de entrar en el contexto del modelo principal, con decision de bloqueo basada en la politica `injection_prob >= 0.5 or unsafe_prob >= 0.5` y umbrales calibrados sobre trafico propio.
- Saneamiento de logs, CSV y respuestas JSON de API: cuando un agente consume datos operativos que pueden contener texto libre escrito por terceros, el modelo actua como paso previo de validacion para evitar que instrucciones embebidas lleguen al prompt del LLM.
- Moderacion multilingue en aplicaciones globales: con cobertura de 9 idiomas, permite aplicar una unica politica de seguridad en productos con usuarios en Europa, Latinoamerica, Asia y Oriente Medio sin desplegar un clasificador distinto por idioma.
- Auditoria y analisis por lotes: al ser un encoder de ~307M de parametros, se puede ejecutar en CPU o en GPU de gama baja para reprocesar historicos de conversaciones, logs o corpus documentales y etiquetar riesgos a posteriori con las 14 categorias.

## Benchmarks y rendimiento

El autor publica una sonda de fiabilidad propia, no un benchmark publico amplio ni una reivindicacion de estado del arte. Contiene 100 ejemplos sinteticos redactados manualmente, que cubren inyeccion directa, inyeccion indirecta/RAG, inyeccion en correo y tickets de soporte, envenenamiento de salidas de herramientas, logs, Markdown, HTML, CSV, JSON de API, ataques a agentes de codigo, prompts unicamente inseguros y negativos dificiles benignos. Todos los modelos se evaluaron con umbral 0,5 sobre `expected_injection`.

| Modelo | F1 de inyeccion | Precision | Recall | AUROC | Especificidad en limpio |
|---|---:|---:|---:|---:|---:|
| Lunaris Guard v3 | 0.833 | 0.776 | 0.900 | 0.888 | 0.740 |
| Wolf Defender PI | 0.770 | 0.653 | 0.940 | 0.811 | 0.500 |
| Qualifire Sentinel | 0.735 | 0.642 | 0.860 | 0.768 | 0.520 |
| Rogue Sentinel v2 | 0.752 | 0.627 | 0.940 | 0.798 | 0.440 |

El texto interpretativo del autor que acompana a la tabla aparece truncado en la informacion disponible ("In this run, Lu..."), por lo que no se reproduce su conclusion literal. Los datos mostrados indican que algunos modelos alcanzan mayor recall que Lunaris Guard v3, pero con una especificidad sobre contenido limpio notablemente inferior (0,44-0,52 frente a 0,74).

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, lo cual es coherente con que se trate de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 306.953.490 parametros (estimacion, no dato publicado por el autor): ~1,23 GB en FP32, ~0,61 GB en FP16/BF16, ~0,31 GB en INT8 y ~0,15 GB en INT4, sin contar activaciones. Con secuencias de 2048 tokens y lotes pequenos, el consumo adicional por activaciones es de unos cientos de MB.
- GPU recomendadas: no hay recomendaciones oficiales publicadas. Por tamano, el modelo es manejable en NVIDIA T4, L4, RTX 3060, RTX 4090, A10G o cualquier GPU con al menos 2-4 GB de VRAM libre en precision mixta; A100 y H100 estan sobredimensionadas para un encoder de este tamano y solo tendrian sentido para lotes muy grandes o despliegues con alta concurrencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (y tambien en CPU, dado el reducido numero de parametros). El repositorio de 4,9 GB refleja los ficheros publicados, no la VRAM necesaria en ejecucion.
- Opciones de despliegue: la unica ruta documentada por el autor es `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`, ademas del uso mediante `pipeline("text-classification", top_k=None)`. No se documentan en la informacion disponible integraciones oficiales con vLLM, llama.cpp, Ollama, TGI u ONNX Runtime, ni la existencia de pesos en formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con las alternativas incluidas en la sonda de fiabilidad del autor. Solo se dispone de sus metricas de clasificacion; el resto de campos no esta documentado en la informacion proporcionada.

| Modelo | Parametros | Contexto | F1 inyeccion | Recall | Especificidad en limpio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Lunaris Guard v3 | ~307M | 2048 tokens | 0.833 | 0.900 | 0.740 | MIT | HuggingFace (ANGELOSEGRETO/lunaris-guardv3) |
| Wolf Defender PI | No disponible | No disponible | 0.770 | 0.940 | 0.500 | No disponible | No disponible |
| Qualifire Sentinel | No disponible | No disponible | 0.735 | 0.860 | 0.520 | No disponible | No disponible |
| Rogue Sentinel v2 | No disponible | No disponible | 0.752 | 0.940 | 0.440 | No disponible | No disponible |

Criterio de comparacion: en esta sonda concreta, Lunaris Guard v3 obtiene el mejor F1, la mejor precision, el mejor AUROC y la mejor especificidad sobre trafico limpio del grupo, mientras que Wolf Defender PI y Rogue Sentinel v2 priorizan recall (0,940) a costa de bloquear aproximadamente la mitad del contenido limpio. Para produccion, esa diferencia se traduce directamente en tasa de falsos positivos sobre usuarios legitimos.

## Limitaciones y advertencias

- El benchmark publicado es una sonda interna de 100 ejemplos sinteticos redactados manualmente por el propio autor. No es un benchmark publico amplio, no es una reivindicacion de estado del arte y su tamano muestral limita la significacion estadistica de las diferencias entre modelos.
- No se documenta informacion sobre sesgos del modelo, composicion del dataset de entrenamiento ni analisis de equidad entre idiomas o variedades dialectales. La cobertura declarada de 9 idiomas no implica rendimiento homogeneo en todos ellos.
- Riesgo de falsos positivos: el propio autor reconoce que el control de falsos positivos es un objetivo de diseno, e incluye negativos dificiles benignos precisamente por este motivo. Aun asi, la especificidad medida sobre contenido limpio es de 0,740, es decir, aproximadamente una cuarta parte del trafico limpio de esa sonda no se clasificaria correctamente.
- Los umbrales de decision (el ejemplo usa 0,5 como politica simple) deben calibrarse sobre trafico propio; el autor lo indica explicitamente. Un umbral fijo de 0,5 puede no ser adecuado para todos los dominios.
- Limitacion de contexto: la ventana maxima es de 2048 tokens. Los documentos, logs, PDFs, paginas HTML o fragmentos RAG mas largos requieren troceado y agregacion (el autor recomienda chunks de 512-1536 tokens con solapamiento de 64-256 y agregacion por maximo), lo que anade complejidad y coste al pipeline. Una instruccion maliciosa fuera de los chunks analizados no se detectaria.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto incluido en el repositorio. En entornos de produccion conviene auditar ese codigo antes de desplegarlo.
- Discrepancia de identificadores: la cuenta de HuggingFace del repositorio es `ANGELOSEGRETO`, mientras que la model card y los ejemplos de codigo referencian `auren-research/lunaris-guardv3`. Conviene verificar cual es la ruta canonica antes de fijar una dependencia.
- Repositorio sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion de 2026-09-13. No hay validacion independiente por parte de terceros.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la unica obligacion habitual de conservar el aviso de copyright y la licencia. No se han documentado restricciones adicionales de uso.
- El modelo es un clasificador de seguridad, no un generador: no sustituye a la moderacion de la salida del LLM ni a otras capas de defensa. Debe combinarse con validacion de herramientas, control de permisos y monitorizacion.

## Enlaces

- HuggingFace: https://huggingface.co/ANGELOSEGRETO/lunaris-guardv3
- Modelo base: https://huggingface.co/jhu-clsp/mmbert-base
- Repositorio referenciado en la model card: https://huggingface.co/auren-research/lunaris-guardv3
- Imagen del benchmark de fiabilidad: `assets/production_guard_reliability_100.png` dentro del repositorio del modelo
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en los resultados de busqueda web disponibles.
