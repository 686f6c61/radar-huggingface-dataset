# knowledgator/gliformer-base-v1

## Resumen

GLiFormer Base v1 es un modelo de 264,2 millones de parametros publicado por knowledgator bajo licencia Apache 2.0. Se presenta como un unico encoder capaz de abordar procesamiento de layout de PDF, reconocimiento de entidades, clasificacion de texto, extraccion de relaciones, generacion de registros estructurados y embeddings de texto. La innovacion principal es que acepta etiquetas de tarea y esquemas de extraccion en tiempo de inferencia, de modo que distintas cabezas de tarea comparten un mismo encoder DeBERTa en lugar de requerir un modelo especializado por tarea.

El modelo forma parte del framework GLiFormer, distribuido como paquete Python (`pip install gliformer`) y con repositorio en GitHub. Su arquitectura es consciente del layout, por lo que admite tanto entradas de texto plano como entradas con estructura de documento, aunque los resultados de calidad publicados se centran en tareas de texto. La salida de embeddings es de 768 dimensiones.

Es relevante para equipos que necesitan pipelines de extraccion estructurada sin entrenar un modelo por cada tarea: el mismo checkpoint resuelve NER, clasificacion, relation extraction conjunta y structuring anidado validable con Pydantic. El contrapunto es que se trata de un lanzamiento muy reciente (creado el 11 de septiembre de 2026, actualizado tres dias despues) con 0 descargas registradas y 10 likes, por lo que la validacion independiente en produccion es todavia escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa con cabezas de tarea compartidas, diseno consciente de layout (framework GLiFormer) |
| Parametros totales | 264,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 1,1 GB; la model card no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

GLiFormer Base v1 se construye sobre un encoder DeBERTa al que se acoplan multiples cabezas de tarea que comparten representaciones. El modelo recibe en inferencia tanto el texto como las etiquetas o esquemas que definen la tarea: listas de tipos de entidad para NER, listas de clases (o grupos nombrados de clases) para clasificacion, diccionarios de entidades y relaciones para extraccion conjunta, y esquemas planos o anidados para structuring. Ademas expone `embed_text`, que devuelve vectores de 768 dimensiones para similitud coseno y busqueda semantica.

El framework admite kernels de atencion CUDA opcionales mediante la instalacion con el extra `flash`; la inferencia en CPU utiliza atencion eager. Los resultados publicados indican una evaluacion sobre 26 datasets de NER (131.156 ejemplos), 5 dominios de CrossNER (2.505 ejemplos), 13 datasets de clasificacion (79.828 ejemplos) y 500 ejemplos de structuring multinivel. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Reconocimiento de entidades nombradas (NER): tipos de entidad definidos en tiempo de inferencia, con salida de `text`, `label`, `start`, `end` y `score`; los offsets son posiciones de caracter con `end` exclusivo. Soporta procesamiento por lotes mediante `batch_size`.
- Clasificacion de texto: clases libres en inferencia y soporte de grupos nombrados, por ejemplo `{"sentiment": ["positive", "negative"], "topic": ["product", "support"]}`.
- Extraccion de relaciones conjunta: se aportan simultaneamente etiquetas de entidad y de relacion mediante `joint_relations`, y la salida incluye cabeza, relacion y cola. El metodo `predict_relations` requiere una cabeza de relacion abierta y no es el adecuado para este checkpoint.
- Extraccion estructurada: genera diccionarios de Python a partir de esquemas, con soporte de esquemas Pydantic anidados y validacion de salida con `validate_output=True`. El decodificador compone campos anclados en la fuente y relaciones padre-hijo.
- Ejecucion multitarea en una sola llamada: `inference` acepta simultaneamente `entities`, `classes` y `structures` y devuelve un diccionario con las claves de cada tarea.
- Embeddings de texto: vectores de 768 dimensiones para similitud y recuperacion semantica.
- Procesamiento consciente del layout: la arquitectura admite entradas de texto y de layout de documento, si bien las metricas publicadas corresponden a tareas de texto.
- Idiomas: unico idioma declarado, ingles.

## Casos de uso

- Extraccion de entidades en dominios cientificos y biomedicos: el modelo obtiene su mejor F1 en datasets como bc5cdr (63,57) y bc2gm (49,41), por lo que es adecuado para poblar bases de conocimiento a partir de literatura, siempre que se validen los umbrales de confianza por tipo de entidad.
- Digitalizacion de facturas, contratos y formularios: definiendo un esquema Pydantic anidado (por ejemplo empresa, departamentos y empleados) se obtienen registros estructurados listos para insertar en base de datos, con validacion de esquema antes de persistir.
- Analisis de sentimiento y tematica en resenas: los grupos nombrados permiten clasificar en una sola pasada sentimiento y tema (producto, soporte), reduciendo el numero de modelos desplegados en el pipeline.
- Construccion de grafos de conocimiento: la extraccion conjunta de relaciones permite obtener tripletas persona-organizacion (`works_at`) para enlazar entidades en un grafo, partiendo de texto no estructurado.
- Busqueda semantica y deduplicacion de documentos: `embed_text` genera vectores de 768 dimensiones que se pueden indexar para recuperacion por similitud o agrupamiento de documentos equivalentes.
- Preprocesado en pipelines de RAG: usar el modelo como extractor de entidades y metadatos antes de indexar documentos permite enriquecer los chunks con etiquetas tipadas y relaciones.
- Enrutado y triaje de tickets: la clasificacion con umbral configurable sirve para asignar categoria y prioridad a consultas entrantes antes de derivarlas a un sistema mayor.
- Procesamiento de documentos con layout: en escenarios donde el orden y la posicion del texto importan (PDF, informes), la arquitectura consciente de layout permite abordar la extraccion sin un modelo especifico adicional, aunque no haymetricas publicadas para esta modalidad.

## Benchmarks y rendimiento

Resultados de evaluacion reportados por el autor:

| Tarea | Metrica | Puntuacion |
|---|---|---:|
| NER, 26 datasets / 131.156 ejemplos | F1 estricto medio por dataset (entidad) | 50,45 |
| CrossNER, 5 dominios / 2.505 ejemplos | F1 estricto medio por dominio | 65,10 |
| Clasificacion, 13 datasets / 79.828 ejemplos | Macro-F1 medio por dataset | 72,36 |
| Structuring multinivel, 500 ejemplos | F1 JSON tolerante a limites y sin orden | 87,20 |

Desglose de NER por dataset (tabla truncada en la informacion disponible):

| Dataset | Ejemplos | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| ACE 2004 | 812 | 46,54 | 23,50 | 31,23 |
| ACE 2005 | 1.060 | 39,69 | 17,93 | 24,70 |
| AnatEM | 3.830 | 31,98 | 35,80 | 33,78 |
| bc2gm | 5.000 | 44,96 | 54,83 | 49,41 |
| bc4chemd | 26.364 | 37,50 | 65,67 | 47,74 |
| bc5cdr | 4.797 | 59,96 | 67,65 | 63,57 |

Notas metodologicas aportadas por el autor: las medias por dataset ponderan todos los datasets por igual; en NER deben coincidir span y tipo; el macro-F1 de clasificacion promedia el F1 por clase dentro de cada dataset; y la metrica de structuring compara rutas de valores JSON aplanadas tras alinear registros sin exigir su orden original y permitiendo reparaciones limitadas de limites, por lo que no equivale a una coincidencia JSON exacta. No hay datos de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,53 GB en fp16 y 1,06 GB en fp32 (calculo derivado de 264,2 M de parametros). Hay que anadir memoria para activaciones, tokenizador y lote, por lo que un presupuesto practico en GPU consumer ronda 1-2 GB en fp16 y 2-3 GB en fp32.
- GPU compatibles: no se especifica una lista oficial. Por tamano, el modelo cabe sin problema en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 o superiores. No necesita A100 ni H100, aunque pueden usarse para servir lotes grandes.
- Inferencia en CPU: soportada y documentada, utilizando atencion eager. Es viable para cargas moderadas sin GPU.
- Kernels de atencion CUDA opcionales: se instalan con `pip install -e ".[flash]"` sobre el repositorio clonado.
- Opciones de despliegue: el modelo se carga con la libreria `gliformer` (`GLiFormer.from_pretrained(...)`). No se mencionan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de entorno: Python 3.10 o superior para instalar el framework desde el codigo fuente.
- Latencia y throughput: no disponible.
- Espacio en disco: el repositorio ocupa 1,1 GB.

## Comparativa con modelos similares

La informacion proporcionada solo menciona `gliner` como etiqueta y como pieza del ecosistema del autor, y no incluye datos de rendimiento de modelos alternativos, por lo que la comparacion cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Tareas | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| GLiFormer Base v1 | 264,2 M | no disponible | NER, clasificacion, relation extraction, structuring, embeddings, layout | Apache 2.0 | Si (ver tabla superior) |
| GLiNER (familia relacionada, citada en tags) | no disponible | no disponible | NER | no disponible en la informacion proporcionada | no disponible |
| Otros modelos de extraccion estructurada de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; no hay evidencia de rendimiento multilingue.
- Rendimiento desigual en NER: el F1 estricto cae a 24,70 en ACE 2005 y 31,23 en ACE 2004, con recall muy bajo en esos datasets (17,93 y 23,50 respectivamente). No es un extractor fiable para todos los dominios por igual.
- Riesgo de alucinacion en structuring: la validacion Pydantic comprueba unicamente el esquema de salida, no la correccion factual del contenido. Los campos generados deben verificarse contra la fuente si el uso es critico.
- Sensibilidad a umbrales y esquemas: las predicciones dependen del esquema, la entrada y el umbral elegido, por lo que cambiar la definicion de etiquetas puede alterar sustancialmente los resultados.
- Metrica de structuring no exacta: el 87,20 de F1 JSON corresponde a una comparacion sin orden y tolerante a limites, no a una coincidencia JSON exacta; la calidad percibida en produccion puede ser inferior.
- Documentacion incompleta de entrenamiento: no se publican tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO, lo que dificulta evaluar sesgos y cobertura.
- Layout sin metricas: la arquitectura admite entradas de layout de documento, pero los resultados publicados se centran en texto; no hay evidencia cuantitativa de calidad en esa modalidad.
- Madurez temprana: 0 descargas y 10 likes en el momento de la consulta, con la ultima actualizacion tres dias despues de la creacion. No hay validacion externa publica.
- Longitud de contexto y cuantizaciones no especificadas: no se puede planificar el troceado de documentos largos ni elegir un formato cuantizado a partir de la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de incluir el aviso de licencia y el archivo NOTICE si existe. No se declaran restricciones adicionales de uso aceptable.
- Despliegue no estandar: al depender de la libreria `gliformer`, no esta claro que encaje directamente en servidores de inferencia habituales (vLLM, TGI, Ollama) sin trabajo de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knowledgator/gliformer-base-v1
- Repositorio GitHub de GLiFormer: https://github.com/Knowledgator/GLiFormer
- Perfil del autor en HuggingFace: https://huggingface.co/knowledgator
- Paquete Python: `pip install gliformer -U` (instalacion desde codigo fuente con `pip install -e .` sobre el repositorio)
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web proporcionados; las entradas devueltas no guardan relacion con el modelo.
