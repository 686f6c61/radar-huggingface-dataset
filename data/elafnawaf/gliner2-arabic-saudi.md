# Elafnawaf/gliner2-arabic-saudi

## Resumen

GLiNER2 Arabic · Saudi es un checkpoint de la familia GLiNER2 desarrollado por el usuario Elafnawaf sobre el modelo base `fastino/gliner2.5-multi-v1`. Se trata de un extractor de informacion zero-shot de 287 millones de parametros construido sobre un encoder mDeBERTa-v3, especializado en arabe estandar y, de forma destacada, en dialecto saudi y del Golfo. A diferencia de los modelos NER clasicos, GLiNER2 recibe el esquema de la tarea (tipos de entidad, etiquetas de clasificacion, campos de un registro o tipos de relacion) como parte de la entrada de texto, de modo que un unico modelo resuelve cuatro tareas distintas en un solo forward pass.

El problema que aborda es concreto: el modelo base habia visto arabe en su encoder pero sus cabezas de extraccion estaban entrenadas en ingles y otras lenguas europeas. Este checkpoint reentrena las cuatro cabezas (entidades, clasificacion, extraccion estructurada y relaciones) con supervision en arabe, incluyendo noticias y Wikipedia en arabe estandar, SMS reales de Arabia Saudi, tuits del Golfo, documentos oficiales saudies y frases dialectales.

Es relevante ahora porque cubre un hueco practico en el procesamiento de informacion en dialecto saudi (deteccion de PII, antifraude en SMS, extraccion de entidades en redes sociales) con una licencia abierta CC BY-SA 4.0, y porque la arquitectura de fronteras (boundary architecture) elimina el limite de 8 tokens por mencion que arrastraba la arquitectura de spans de GLiNER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 con arquitectura de fronteras (boundary), encoder mDeBERTa-v3, cuatro cabezas (entidades, clasificacion, extraccion estructurada, relaciones) |
| Parametros totales | 287.355.159 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo ocupa 3,5 GB) |
| Idiomas soportados | arabe (estandar, saudi y Golfo) e ingles |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `fastino/gliner2.5-multi-v1` y conserva su encoder mDeBERTa-v3 con las cuatro cabezas de extraccion de GLiNER2. La innovacion estructural frente a GLiNER clasico es la arquitectura de fronteras: en lugar de emparejar cada token con todos los demas dentro de una ventana limitada (la arquitectura de spans, capada a `max_width: 8`), empareja directamente posiciones de inicio y fin, de modo que cualquier longitud de mencion que quepa en la ventana codificada es alcanzable. Ademas, el modelo soporta metadatos de registro como `occurrence_policy`, cardinalidad de campo y registros anclados.

El entrenamiento reentrena las cuatro cabezas con supervision en arabe a partir de un conjunto heterogeneo de datasets: `unimelb-nlp/wikiann`, `iahlt/arabic_ner_mafat`, `iabufarha/ar_sarcasm`, `arbml/ArSarcasm_v2`, `Qanadil/ArSAS`, `arbml/SANAD`, `evageon/IADD`, `Babelscape/SREDFM`, `Babelscape/REDFM`, `KhalidAlharbi377/pii-detection-multisource-en-saudi-arabic`, `AhmedSSabir/Gulf-Arabic-Tweets-2018-2020` y `HebArabNlpProject/ShamNER`. Los ejemplos de entrenamiento incluian el esquema en arabe y su equivalente en ingles con la misma respuesta dorada, de forma que el modelo responde en cualquiera de los dos idiomas. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

Una particularidad operativa relevante es que el tokenizador de GLiNER usa el patron `\w+(?:[-_]\w+)*|\S`, y `\w` en Python no cubre las marcas diacriticas arabes: una palabra vocalizada se fragmenta en un token por caracter y todos los offsets posteriores quedan corruptos. El autor exige normalizar antes de la inferencia (NFC, eliminacion de diacriticos, tatweel y caracteres invisibles).

## Capacidades

- Extraccion de entidades zero-shot: se le pasa una lista de tipos de entidad (en arabe, en ingles o mixta) y devuelve todos los spans de cada tipo.
- Clasificacion de texto single-label y multi-label: una o varias tareas, cada una con su conjunto de etiquetas.
- Extraccion estructurada: dado un esquema de registro con nombres de campo, devuelve un JSON cuyos valores son subcadenas literales del texto.
- Extraccion de relaciones: dada una lista de tipos de relacion, devuelve pares (cabeza, cola) por tipo.
- Soporte de offsets de caracteres y puntuaciones de confianza por mencion (`include_spans`, `include_confidence`), util para redaccion y auditoria.
- Manejo de dialecto saudi y del Golfo, incluyendo prefijos adheridos («و», «بـ», «لـ») que fusionan preposicion y nombre en una sola palabra.
- Capacidades multilingues: esquemas en arabe o en ingles producen la misma respuesta.
- Deteccion de PII y datos sensibles (numeros de movil, importes, organizaciones) en SMS y texto dialectal.
- No se mencionan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Deteccion de PII en SMS y mensajes de clientes: el modelo extrae numeros de movil, importes, nombres de organizaciones y fechas con offsets de caracteres, lo que permite redactar automaticamente los datos sensibles antes de almacenar o enviar el texto a otro sistema.
- Antifraude en mensajeria: sobre SMS saudies reales, se pueden definir tipos de entidad como entidad financiera, importe, numero de cuenta y enlace para alimentar reglas o un clasificador posterior de phishing.
- Extraccion de entidades en redes sociales: los tuits del Golfo contienen dialecto, abreviaturas y prefijos adheridos; el modelo esta ajustado sobre `Gulf-Arabic-Tweets-2018-2020` y extrae personas, lugares y organizaciones en ese registro.
- Procesamiento de documentos oficiales saudies: con extraccion estructurada se define un esquema de campos (organismo, fecha, referencia, importe) y se obtiene un JSON con valores literales del documento, sin codigo especifico por tarea.
- Analisis de sentimiento y actos de habla en arabe: la cabeza de clasificacion permite etiquetar sentimiento (positivo, negativo, neutro) o actos de habla usando esquemas en arabe o en ingles, apoyandose en los corpus ArSAS y ArSarcasm.
- Construccion de grafos de conocimiento y analisis de relaciones: la cabeza de relaciones extrae pares cabeza-cola (por ejemplo, persona-organizacion) para poblar un grafo a partir de noticias en arabe estandar.
- Enriquecimiento de pipelines de busqueda y RAG en arabe: la extraccion de entidades y registros estructurados permite indexar metadatos filtrables junto al texto original.

## Benchmarks y rendimiento

La model card indica que todas las cifras proceden de datos held-out con decodificacion identica para el modelo base y este checkpoint, y que se remiden antes de cada release: 25 de 33 conjuntos de extraccion son significativamente mejores que el base y 0 peores. Sin embargo, no se incluyen en la informacion disponible las tablas numericas de resultados (F1, accuracy por conjunto), por lo que no se pueden reproducir cifras concretas.

| Benchmark | Resultado |
|---|---|
| Conjuntos de extraccion (33) | 25 significativamente mejores que el base, 0 peores (sin cifras publicadas en la informacion disponible) |
| MMLU / HumanEval / GSM8K | no disponible (no aplica a un extractor) |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB solo para pesos (287 M de parametros), mas overhead de activaciones y del tokenizador; en la practica un presupuesto de 2-4 GB cubre el modelo con textos de longitud moderada.
- El repo completo ocupa 3,5 GB, lo que sugiere que incluye pesos adicionales o artefactos; para inferencia solo se carga el checkpoint safetensors.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 lo ejecutan con holgura; en entornos de servidor, A100 o H100 no son necesarias pero permiten mayor batching.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: la libreria oficial `gliner2` con `AutoExtractor.from_pretrained` (obligatorio, porque `GLiNER2.from_pretrained` es solo de spans y rechaza este checkpoint). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Idiomas | Licencia |
|---|---|---|---|---|---|
| Elafnawaf/gliner2-arabic-saudi | 287 M | no disponible | Entidades, clasificacion, extraccion estructurada, relaciones | ar, en | CC BY-SA 4.0 |
| fastino/gliner2.5-multi-v1 (base) | no disponible | no disponible | Las cuatro cabezas, entrenadas en ingles y lenguas europeas | multi (encoder con arabe) | no disponible |
| GLiNER clasico (arquitectura de spans) | variable | no disponible | Entidades zero-shot, limite de 8 tokens por mencion | multi | variable segun checkpoint |

La ventaja diferencial frente al base es el ajuste de las cabezas en arabe y dialecto saudi; frente a GLiNER clasico, la arquitectura de fronteras elimina el limite de longitud de mencion y anade clasificacion, extraccion estructurada y relaciones en el mismo modelo.

## Limitaciones y advertencias

- La normalizacion previa es obligatoria: sin eliminar diacriticos, tatweel y caracteres invisibles, los offsets de caracteres quedan corruptos y las menciones se fragmentan.
- El modelo es zero-shot en principio, pero su calidad real esta concentrada en los tipos y esquemas vistos durante el ajuste; tipos muy alejados de ese dominio pueden degradarse.
- Riesgo de alucinacion estructural: la extraccion estructurada devuelve subcadenas del texto, pero un esquema mal definido o ambiguo puede producir campos vacios o asignaciones incorrectas.
- Sesgos: el entrenamiento combina noticias, Wikipedia, tuits y SMS, por lo que hereda los sesgos de esas fuentes y el registro informal de las redes sociales.
- Cobertura limitada a arabe e ingles; no se garantiza comportamiento en otros idiomas.
- La licencia CC BY-SA 4.0 es copyleft: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial propietario.
- El modelo tiene solo 59 descargas y 0 likes en el momento de la ficha, por lo que la validacion externa es escasa.
- No se documentan cifras de latencia ni de throughput, lo que dificulta planificar despliegues de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elafnawaf/gliner2-arabic-saudi
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
