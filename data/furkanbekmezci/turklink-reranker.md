# furkanbekmezci/turklink-reranker

## Resumen

TurkLink Reranker es un cross-encoder basado en BERTurk (dbmdz/bert-base-turkish-cased) desarrollado por furkanbekmezci para desambiguacion de entidades en turco. Recibe un par formado por la mencion en contexto y la descripcion de una entidad candidata, y devuelve un logit escalar de compatibilidad que se usa para reordenar la lista de candidatos recuperados. Es un componente del pipeline mas amplio frcturus/turklink-el, no un sistema de enlazado autonomo.

El modelo resuelve la fase de reranking dentro de un pipeline de entity linking contra Wikidata: dado un catalogo de 3.958.456 Q-IDs, la recuperacion previa propone candidatos y este cross-encoder los reordena. Se entreno con ranking listwise sobre negativos duros, no como clasificador binario de pares, por lo que sus salidas deben compararse entre candidatos y no interpretarse como probabilidad de acierto.

Se trata de un piloto, con 0 descargas y 0 likes en el momento de la consulta, publicado bajo licencia CC BY-SA 4.0. Su relevancia es acotada pero clara para quien construya sistemas de enlazado de entidades en turco: aporta un componente de reranking con morfologia turca (mayusculas y apostrofo) y artefactos reproducibles, aunque los resultados publicados corresponden al pipeline completo y no a este componente aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (cross-encoder de pares), base dbmdz/bert-base-turkish-cased, cased |
| Parametros totales | 110.618.113 |
| Longitud de contexto | No disponible como especificacion formal; el ejemplo de uso del autor configura max_length=192 |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY-SA 4.0 para corpus, checkpoints y artefactos derivados; Apache-2.0 para el codigo fuente; licencias de los modelos preentrenados aplicables (MiniLM Apache-2.0, BERTurk MIT) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | text-classification |
| Cobertura del catalogo | 3.958.456 Q-IDs de Wikidata |

## Arquitectura y entrenamiento

La arquitectura es la de un cross-encoder: un encoder BERT cased preentrenado en turco (BERTurk) que procesa conjuntamente la consulta de mencion y el texto de la entidad candidata, y produce un unico logit escalar. La cabeza de salida es escalar y el entrenamiento se realizo con ranking listwise sobre negativos duros, de modo que la senal de aprendizaje ordena listas de candidatos en lugar de estimar una probabilidad independiente por par. El autor indica explicitamente que las puntuaciones deben compararse entre candidatos y que el logit no es una confianza calibrada.

Los datos proceden del corpus TurkLink (yakdas/turklink-corpus), Akdas & Tantug (2026), DOI 10.1016/j.procs.2026.01.041, en la revision c8d7fe7bdd0ae934268d30ef64f6444940bdf6dc. Se preservo la pertenencia oficial a los splits y el muestreo se hizo por documento, con semilla 42 y una seleccion de 28.310 / 2.350 / 2.353 documentos de entrenamiento, validacion y test respectivamente. El catalogo incluye ademas 449 entidades de entrenamiento ausentes, recuperadas mediante respaldo de etiquetas de Wikidata en tr/mul/en y congeladas en wikidata-supplement.jsonl dentro del paquete completo; no se usaron etiquetas de test para esa reparacion. No se envio texto de usuario a ningun LLM externo durante el entrenamiento. La receta completa sobre el corpus integro no se ejecuto para este piloto y los ajustes de entrenamiento detallados, los recuentos efectivos y los historiales de validacion estan en training.json de cada componente del paquete.

## Capacidades

- Puntuacion de compatibilidad mencion-entidad: devuelve un logit escalar por par (mencion en contexto, entidad candidata) que sirve como criterio de ordenacion.
- Reranking de candidatos en enlazado de entidades contra un catalogo de 3.958.456 Q-IDs de Wikidata.
- Manejo de rasgos morfologicos superficiales del turco: mayusculacion y apostrofo compartidos entre entrenamiento e inferencia, mediante las utilidades Morphology y mention_query.
- Integracion con el pipeline TurkLink: recuperacion previa de candidatos mas reordenacion con este cross-encoder, mas abstencion por umbral.
- Capacidad de ejecucion en CPU: el ejemplo oficial instancia el modelo con device="cpu" y max_length=192.
- Soporte de tool calling o function calling: no disponible (el modelo no es generativo).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo esta entrenado y etiquetado solo para turco.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking o generacion de texto: no disponible; la tarea es de clasificacion y ranking.

## Casos de uso

- Enlazado de entidades en noticias turcas: dado un texto como "Apple Istanbul'da yeni magazasini acti", el pipeline extrae la mencion, recupera candidatos del catalogo Wikidata y este cross-encoder los reordena para asignar el Q-ID correcto.
- Enriquecimiento de metadatos en medios y agregadores turcos: procesar titulares y cuerpos de articulo por lotes para etiquetar personas, organizaciones y lugares con identificadores persistentes de Wikidata, facilitando busqueda y deduplicacion.
- Construccion y mantenimiento de grafos de conocimiento en turco: usar los Q-ID asignados como nodos canonicos y las menciones como aristas textuales, con reejecucion posterior cuando el catalogo se actualice.
- Desambiguacion de nombres en corpus historicos digitalizados: aplicar el texto de entidad (aliases mas descripcion) para diferenciar entidades homonimas, con la advertencia de que el catalogo es historico y puede degradarse en dominios nuevos.
- Preprocesamiento para sistemas de recuperacion sobre corpus turcos: reordenar candidatos de entidades y servir despues busquedas por entidad, sin confundir esta funcion con un reranker de pasajes, para el que no fue entrenado.
- Analisis de redes sociales y moderacion asistida en turco: detectar y normalizar menciones a organizaciones o figuras publicas, teniendo en cuenta que la supervision de menciones es debil y no exhaustiva.
- Procesamiento masivo en CPU por restricciones de coste: al ser un modelo de 110 millones de parametros y poder ejecutarse en CPU, encaja en trabajos por lotes nocturnos sobre volumenes grandes de texto turco.
- Evaluacion comparativa de pipelines de entity linking: integrarlo como componente de reranking y medir su aportacion frente a la recuperacion sin reordenacion, usando los informes JSON del paquete completo.

## Benchmarks y rendimiento

Los datos publicados corresponden al pipeline completo frcturus/turklink-el (recuperacion mas reranking), no a este componente de forma aislada, y proceden de un piloto muestreado, no de los resultados del articulo TurkLink. Los spans de oro se proporcionan para la tabla. Accuracy equivale a micro-F1 porque cada mencion tiene un unico Q-ID de oro y uno predicho; las entidades de oro ausentes del catalogo cuentan como fallos y la recuperacion de candidatos nunca inserta la respuesta correcta.

| Dataset | Menciones | Accuracy / micro-F1 | R@1 | R@5 | R@10 | R@32 | Cobertura de catalogo |
|---|---:|---:|---:|---:|---:|---:|---:|
| mewsli-9-tr | 5811 | 0,8226 | 0,7567 | 0,8845 | 0,9029 | 0,9248 | 0,9955 |
| mewsli-x-tr-dev | 262 | 0,9008 | 0,7863 | 0,9389 | 0,9542 | 0,9656 | 0,9962 |
| mewsli-x-tr-test | 1215 | 0,8593 | 0,7778 | 0,8963 | 0,9185 | 0,9342 | 0,9951 |
| test | 2000 | 0,8020 | 0,7500 | 0,8695 | 0,8900 | 0,9050 | 0,9985 |
| validation | 2000 | 0,8335 | 0,7725 | 0,8900 | 0,9105 | 0,9335 | 0,9980 |

Proxy de extremo a extremo sobre texto crudo, que incluye deteccion de menciones. Las menciones correctas no anotadas se contabilizan como falsos positivos por la referencia de hipervinculos dispersa.

| Dataset | Ventanas | Precision EL | Exhaustividad EL | Micro-F1 EL | Micro-F1 de menciones |
|---|---:|---:|---:|---:|---:|
| test | 300 | 0,2286 | 0,6429 | 0,3372 | 0,4052 |
| validation | 300 | 0,2073 | 0,6559 | 0,3150 | 0,3669 |

Los resultados de Mewsli, cuando aparecen, son transferencia supervisada de dominio al turco contra este catalogo, no el protocolo zero-shot original de XTREME-R ni sus descripciones de candidatos. Las metricas de extremo a extremo de TurkLink son proxies de hipervinculo disperso y no deben presentarse como exactitud exhaustiva de NER.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 442 MB (110.618.113 parametros); en FP16/BF16, aproximadamente 221 MB.
- VRAM estimada para inferencia: por debajo de 1 GB con secuencias cortas y lotes pequenos, y en torno a 1-2 GB con lotes mayores a max_length=192, sumando activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 lo ejecutan con margen amplio. No se requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU, que es el dispositivo usado en el ejemplo oficial del autor.
- Opciones de despliegue: transformers (libreria declarada), text-embeddings-inference (etiqueta del repositorio) y endpoints compatibles con Hugging Face Inference Endpoints. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables sin conversion previa; vLLM no es la via habitual para un cross-encoder de clasificacion de este tipo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados en la informacion proporcionada para modelos de la misma categoria y mismo idioma. La comparacion se limita a datos estructurales verificables.

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| furkanbekmezci/turklink-reranker | 110.618.113 | max_length de ejemplo 192 | Turco | CC BY-SA 4.0 (checkpoints); Apache-2.0 (codigo) | Hugging Face, safetensors, 0 descargas |
| dbmdz/bert-base-turkish-cased (modelo base) | No disponible en la informacion | No disponible | Turco | MIT | Hugging Face |
| frcturus/turklink-el (pipeline completo) | No disponible | No disponible | Turco | No disponible en la informacion | Hugging Face |
| MiniLM (componente citado en el aviso de licencias del autor) | No disponible | No disponible | Multilingue | Apache-2.0 | No disponible |

## Limitaciones y advertencias

- Las puntuaciones son logits escalares, no probabilidades calibradas. La calibracion esta pensada para un Q-ID dada una mencion ya proporcionada, no para la correccion de la mencion, y puede desplazarse segun el dominio.
- La abstencion es por umbral fijo; el modelo no es un detector de NIL entrenado. Las menciones sin entidad en el catalogo pueden recibir una puntuacion alta por error.
- Los rasgos de mayusculas y apostrofo del turco se comparten entre entrenamiento e inferencia, pero el modelo no es un desambiguador morfologico completo.
- La supervision de menciones es debil y no exhaustiva, y el corpus, las anotaciones automaticas, las descripciones traducidas y el catalogo historico pueden contener errores.
- El rendimiento puede degradarse en dominios nuevos, entidades nuevas, sustantivos comunes y menciones ambiguas.
- Solo funciona en turco; no hay soporte multilingue declarado.
- Los resultados publicados corresponden al pipeline completo y a un piloto muestreado, no al componente aislado ni a la receta de corpus completo. La receta completa no se ejecuto.
- Las metricas de extremo a extremo son proxies de hipervinculo disperso y no deben presentarse como exactitud exhaustiva de NER. Los kernels de coma flotante de GPU y la construccion paralela de HNSW pueden variar ligeramente entre maquinas.
- Restricciones de licencia: los checkpoints y artefactos derivados del corpus se distribuyen bajo CC BY-SA 4.0 con atribucion a TurkLink, lo que impone condiciones de compartir igual para obras derivadas. El codigo fuente es Apache-2.0. Persisten las licencias y avisos de los modelos preentrenados (MiniLM Apache-2.0, BERTurk MIT); hay que revisar NOTICE y las licencias incluidas antes de un uso comercial.
- Existe una discrepancia de identificador: la ficha de Hugging Face corresponde a furkanbekmezci/turklink-reranker, mientras que los ejemplos de la model card instancian frcturus/turklink-reranker. Conviene verificar cual es el repositorio canonico antes de integrarlo en produccion.
- El repositorio tenia 0 descargas y 0 likes en la fecha de consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furkanbekmezci/turklink-reranker
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Pipeline completo: https://huggingface.co/frcturus/turklink-el
- Dataset TurkLink: https://huggingface.co/datasets/yakdas/turklink-corpus
- Articulo TurkLink, Akdas & Tantug (2026): https://doi.org/10.1016/j.procs.2026.01.041
- Repositorio de referencia del autor en la model card: https://huggingface.co/frcturus/turklink-reranker
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre la lengua inglesa y no guardan relacion con la ficha.
