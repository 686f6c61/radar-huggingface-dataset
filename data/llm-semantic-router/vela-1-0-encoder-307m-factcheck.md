# llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck

## Resumen

Vela-1.0-Encoder-307M-FactCheck es un clasificador de texto de dos clases desarrollado por el colectivo `llm-semantic-router`. Su tarea no es generar respuestas ni verificar hechos: predice si una peticion entrante requiere verificacion factica externa (`FACT_CHECK_NEEDED`) o si puede resolverse sin ella (`NO_FACT_CHECK_NEEDED`), por ejemplo porque la informacion esta contenida en el propio contexto, porque basta con transformar un texto, porque el calculo es autocontenido o porque se trata de ficcion.

Tecnicamente es un encoder denso `ModernBertForSequenceClassification` de 307.531.778 parametros totales (306.939.648 en el encoder compartido mas la cabeza de clasificacion), 22 capas, ancho 768 y 12 cabezas de atencion, con pooling de media enmascarada y una capacidad de contexto de 32.768 tokens, tokens especiales incluidos. Se publica en FP32 con licencia MIT y soporte declarado para ingles, chino, espanol, frances, aleman y japones.

Su relevancia actual es de infraestructura: actua como enrutador previo en pipelines RAG y sistemas de agentes, donde decide si merece la pena pagar el coste de una recuperacion externa o de una herramienta de verificacion. Sobre un conjunto congelado de 102 peticiones naturales, la precision en FP32 paso de 63/102 a 79/102 y el macro F1 de 0,579 a 0,772 respecto al clasificador de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ModernBertForSequenceClassification` (encoder Transformer denso, 22 capas, ancho 768, 12 cabezas de atencion) |
| Parametros totales | 307.531.778 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens, tokens especiales incluidos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos publicados son FP32 |
| Idiomas soportados | en, zh, es, fr, de, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32) y ONNX |
| Pooling | masked mean pooling |
| Etiquetas | `0 = NO_FACT_CHECK_NEEDED`, `1 = FACT_CHECK_NEEDED` |
| Parametros del encoder compartido | 306.939.648 |
| SHA-256 de pesos | `809d11b1b44025d5c985859ca2f10c720c1afef88024d6d21ecb0aa25cbe49a3` |
| Modelo base | `llm-semantic-router/Vela-1.0-Encoder-307M`, revision `5fe5bbb1a88b7fdcc93bb5b9d546c574564eb114` |
| Pipeline | text-classification |
| Tamano del repositorio | 3,8 GB |
| Compatibilidad | transformers, text-embeddings-inference, endpoints compatible |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional ModernBERT de 22 capas destinado exclusivamente a clasificacion, con una cabeza de dos logits y pooling de media enmascarada. No es un router generativo ni un modelo MoE: la etiqueta "307M" designa el tamano del encoder compartido, no una capacidad de generacion. El mapeo de etiquetas de `fact_check_mapping.json` (compatible con el router) y el `config.json` de HuggingFace usan los mismos indices, y ambos se hashearon junto con los pesos antes de la evaluacion final.

La receta de entrenamiento arranco con una cabeza de tarea nueva y un adaptador LoRA de rango 32 sobre `mmbert-32k-yarn` (revision `72a23a6640489471eb4ff7ad3ec5bc80af8a27de`), seguida de entrenamiento con peticiones naturales y de contexto largo. El adaptador y la cabeza seleccionados se transfirieron despues al Vela Base publicado; la transferencia directa no supero la compuerta de retencion a 32K en desarrollo, por lo que se aplico una adaptacion acotada sobre las filas de entrenamiento existentes. El adaptador final se escogio en el paso 100 de esa adaptacion de 200 pasos y se fusiono en el Vela Base real. Los pesos originales de la tarea FactCheck se usaron unicamente como linea base, nunca como inicializacion. Los pesos base tienen SHA-256 `ccc274d12ef6f94f54c0c23f0388527b0a925268a1332b3a6e5c8e56868efb00`.

## Capacidades

- Clasificacion binaria de peticiones en `FACT_CHECK_NEEDED` / `NO_FACT_CHECK_NEEDED` a partir de un unico forward.
- Distincion entre conocimiento externo y contenido autocontenido: extraer informacion ya presente en un pasaje, reformular, calcular un resultado cerrado o escribir ficcion se etiquetan como no necesitadas de verificacion.
- Procesamiento de contexto largo: hasta 32.768 tokens, lo que permite clasificar peticiones con documentos adjuntos extensos.
- Soporte multilingue declarado en seis idiomas: en, zh, es, fr, de, ja.
- Integracion como enrutador en pipelines de agentes y RAG mediante el mapeo `fact_check_mapping.json` y umbral configurable.
- Exportacion ONNX para inferencia optimizada y tag de compatibilidad con text-embeddings-inference.
- No realiza tool calling, generacion de texto, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Enrutamiento en pipelines RAG: colocado antes del recuperador, decide si la consulta del usuario requiere buscar en una base documental o si basta con el contexto ya presente en la conversacion, evitando recuperaciones innecesarias y su coste de latencia.
- Orquestacion de agentes con herramientas: el clasificador actua como primera etapa que decide si hay que invocar un buscador web, una API de datos o una herramienta de verificacion, reduciendo llamadas a herramientas en peticiones de reformulacion, resumen o calculo cerrado.
- Asistentes de atencion al cliente: en conversaciones multi-turno con manuales o contratos largos adjuntos, distingue las preguntas respondibles con el material aportado de aquellas que exigen consultar una fuente externa.
- Control de coste en produccion: al filtrar peticiones que no necesitan verificacion se reduce el numero de llamadas a APIs de busqueda o a modelos mayores de comprobacion, con un umbral ajustable para equilibrar falsos positivos y falsos negativos.
- Moderacion y cumplimiento normativo: marcado previo de consultas que exigen contraste factual antes de emitir una respuesta en dominios regulados (sanidad, finanzas, legal), donde conviene forzar una etapa de verificacion.
- Investigacion sobre enrutamiento semantico: sirve como componente reproducible para estudiar el equilibrio entre recall de verificacion y falsos positivos en arquitecturas de router, dado que se publican pesos, hashes y particiones congeladas.
- Preprocesado en buscadores internos y sistemas de soporte documental: clasifica consultas largas (hasta 32K tokens) para decidir si se responde desde el indice local o se deriva a una busqueda externa.

## Benchmarks y rendimiento

Resultados finales congelados, pesos FP32 y computo forward en FP32, frente a la linea base `mmbert32k-factcheck-classifier-merged` (revision `290d3182b2c87e489bd4f63c889e803a27599681`). Ambas partes usan el mismo texto, presupuestos de tokenizador, ejecucion estandar de HuggingFace y argmax sobre dos logits (frontera 0,5).

| Subconjunto final | Peticiones | Aciertos base | Aciertos Vela | Macro F1 base | Macro F1 Vela |
|---|---:|---:|---:|---:|---:|
| Peticiones naturales, todas las fuentes | 102 | 63 | 79 | 0,579 | 0,772 |
| Subconjunto revisado de Aya original | 18 | 5 | 15 | 0,257 | 0,734 |
| Subconjunto revisado de Aya adicional | 29 | 19 | 22 | 0,651 | 0,709 |
| Subconjunto revisado de Dolly, conservando contexto aportado | 55 | 39 | 42 | 0,633 | 0,752 |
| Supervision debil de preguntas facticas / transformacion redactada | 720 | 448 | 719 | 0,572 | 0,999 |
| Estres de contexto largo redactado | 48 | 24 | 35 | 0,333 | 0,708 |

En el punto de operacion fijo por argmax, entre 50 peticiones naturales que necesitaban verificacion el recall subio de 16/50 a 45/50; entre 52 peticiones que no la necesitaban, los falsos positivos pasaron de 5/52 a 18/52. Los 720 ejemplos debiles o redactados son deliberadamente distintos de las peticiones naturales: la puntuacion mixta de 870 filas esta dominada por esos ejemplos mas faciles y no debe presentarse como precision sobre peticiones naturales. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible, y no serian aplicables a un clasificador de este tipo.

## Requisitos de hardware

- Peso en FP32: aproximadamente 1,23 GB (307,5 M de parametros a 4 bytes por parametro). El repositorio ocupa 3,8 GB por incluir tambien exportacion ONNX y otros artefactos.
- Huella estimada en FP16/BF16: en torno a 0,62 GB; en INT8, unos 0,31 GB; en INT4, unos 0,15 GB (estimaciones por recuento de parametros; no se publican ficheros cuantizados).
- Inferencia en CPU: viable para clasificacion de una sola peticion, especialmente con la ruta ONNX. El cuello de botella real es la longitud de secuencia: con 32K tokens la memoria de activaciones y el coste de atencion dominan frente al peso del modelo.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM es suficiente para FP32 en lotes moderados; RTX 4090, A100 o H100 permiten lotes grandes y alto throughput. Para secuencias de 32K conviene reservar VRAM adicional para activaciones.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 8 GB o mas (RTX 3060/4060 en adelante), y tambien en GPUs integradas o Apple Silicon con memoria unificada.
- Opciones de despliegue: HuggingFace Transformers (ruta de referencia de los resultados publicados), ONNX Runtime, text-embeddings-inference, servidores de endpoints compatibles con HuggingFace y cualquier stack de clasificacion que cargue safetensors. No se publican pesos GGUF, por lo que llama.cpp y Ollama no estan soportados sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Cualquier cifra depende del hardware, la longitud de secuencia y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (peticiones naturales, 102) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-FactCheck | 307.531.778 | 32.768 tokens | 0,772 | MIT | safetensors FP32 y ONNX |
| mmbert32k-factcheck-classifier-merged (linea base) | no disponible | no disponible (el nombre sugiere 32K) | 0,579 | no disponible | pesos publicados en HuggingFace |
| Vela-1.0-Encoder-307M (base) | 307.531.778 | no disponible | no aplica (no es clasificador) | no disponible | HuggingFace, revision `5fe5bbb1...` |
| mmbert-32k-yarn (punto de partida del entrenamiento) | no disponible | no disponible (el nombre sugiere 32K) | no aplica | no disponible | HuggingFace, revision `72a23a66...` |

No se proporcionan datos de comparativas con clasificadores externos de la misma categoria (por ejemplo otros enrutadores de verificacion factica o clasificadores ModernBERT de terceros), por lo que esa comparacion figura como no disponible.

## Limitaciones y advertencias

- No verifica hechos: no recupera evidencia, no juzga si una respuesta generada es verdadera ni comprueba afirmaciones. Solo decide si la peticion requiere verificacion externa.
- Falsos positivos elevados: en el punto de operacion argmax, los falsos positivos sobre peticiones naturales que no necesitaban verificacion pasaron de 5/52 a 18/52, lo que implica latencia y coste innecesarios.
- Umbrales no equivalentes: el argmax corresponde a una frontera de 0,5; el valor canonico por defecto del router es 0,6, el ejemplo de configuracion incluido usa 0,65 y 0,7 es solo el valor de reserva del clasificador ante un umbral no positivo. Son puntos de operacion distintos y los resultados no son intercambiables.
- Calibracion: las puntuaciones softmax no son probabilidades calibradas. Cualquier umbral de despliegue requiere su propia seleccion y evaluacion sobre datos de desarrollo.
- Regresion en aleman: en peticiones naturales alemanas los aciertos bajaron de 4/6 a 2/6. El entrenamiento multilingue y los ejemplos redactados en chino y japones no garantizan la misma calidad sobre peticiones naturales en los seis idiomas.
- Tamano de muestra reducido e incertidumbre: los conjuntos naturales son pequenos, el intervalo bootstrap del grupo de origen cruza el cero para la mejora de precision en argmax y las etiquetas fueran revisadas por un asistente, no por anotadores humanos expertos.
- Contaminacion potencial: los grupos de contribuyentes y fuentes se mantienen dentro de una misma particion, pero no puede descartarse exposicion previa del modelo base o de modelos anteriores. La receta historica de la linea base uso algunas instrucciones de Dolly sin un manifiesto completo a nivel de fila.
- Los 720 ejemplos debiles o redactados no deben mezclarse con las peticiones naturales al reportar metricas: la puntuacion conjunta de 870 filas esta sesgada al alza por ejemplos mas faciles.
- Licencia MIT, que permite uso comercial y modificacion; conviene verificar la licencia de los modelos base (`Vela-1.0-Encoder-307M` y `mmbert-32k-yarn`), no declarada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck
- Modelo base Vela-1.0-Encoder-307M: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Revision concreta del modelo base: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M/tree/5fe5bbb1a88b7fdcc93bb5b9d546c574564eb114
- Punto de partida del entrenamiento (mmbert-32k-yarn): https://huggingface.co/llm-semantic-router/mmbert-32k-yarn/tree/72a23a6640489471eb4ff7ad3ec5bc80af8a27de
- Linea base de comparacion (mmbert32k-factcheck-classifier-merged): https://huggingface.co/llm-semantic-router/mmbert32k-factcheck-classifier-merged/tree/290d3182b2c87e489bd4f63c889e803a27599681
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos son articulos genericos sobre modelos de lenguaje sin relacion con esta ficha.
