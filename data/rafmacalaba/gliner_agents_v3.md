# rafmacalaba/gliner_agents_v3

## Resumen

`rafmacalaba/gliner_agents_v3` es un ajuste fino del modelo `urchade/gliner_large-v2.1` (familia GLiNER para reconocimiento de entidades zero-shot) especializado en una única tarea: extraer menciones de uso de datos en articulos de investigacion economica. Es decir, detectar y clasificar fragmentos de texto que hacen referencia a fuentes de datos tales como encuestas, censos, registros administrativos o dataset concretos. El modelo lo publica el usuario rafmacalaba y se distribuye con licencia Apache 2.0, con un pipeline de `token-classification` y la libreria `gliner` como dependencia principal.

La tarea se resuelve con tres etiquetas: `NAMED_DATA` (nombre propio, titulo o acronimo de una fuente de datos concreta), `DESCRIPTIVE_DATA` (fuente descrita con palabras pero sin nombre propio) y `VAGUE_DATA` (formulacion generica sin fuente identificable). Frente a un modelo de lenguaje generativo, aqui no hay generacion de texto: el modelo produce spans sobre el documento de entrada, lo que lo hace adecuado para integrarse en pipelines de procesamiento documental masivo con coste por documento muy bajo.

El detalle mas relevante para evaluar el modelo es su procedencia: los datos de entrenamiento estan anotados por un agente automatico y no han sido revisados por el propietario del corpus, de modo que las metricas publicadas miden la concordancia con el agente anotador, no la exactitud contra una referencia humana. Ademas, el repositorio no tiene descargas ni interacciones en el momento de redactar esta ficha, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER: encoder transformer bidireccional con cabecera de clasificacion de spans; el backbone concreto no se especifica en la informacion disponible (modelo base: `urchade/gliner_large-v2.1`) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PyTorch en repositorio de HuggingFace (tag `pytorch`); no se indica safetensors ni GGUF |
| Pipeline | `token-classification` |
| Libreria | `gliner` |
| Tamano del repositorio | 1,8 GB |
| Etiquetas del modelo | `NAMED_DATA`, `DESCRIPTIVE_DATA`, `VAGUE_DATA` |
| Dataset de entrenamiento | `rafmacalaba/datause-agents-v3`, configuracion `gliner` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

El modelo parte de `urchade/gliner_large-v2.1` y conserva el esquema de GLiNER: un encoder transformer bidireccional que recibe el texto y las etiquetas deseadas como entrada, y produce para cada span candidato una puntuacion de pertenencia a cada etiqueta. Este diseno permite definir tipos de entidad en tiempo de inferencia sin reentrenar, aunque en esta version el ajuste se ha realizado sobre un conjunto cerrado de tres etiquetas. La model card no detalla el backbone exacto, el numero de parametros ni la longitud de contexto utilizada.

El entrenamiento se hizo sobre el corpus completo de `rafmacalaba/datause-agents-v3` (config `gliner`), durante 5 epocas, con una tasa de aprendizaje de 5e-6, tamano de lote 16 y precision bf16. El conjunto de validacion (holdout) consta de 2.108 pasajes y 1.611 spans de referencia, procedentes de cuatro origenes: `fcv_pads_east_africa`, `prwp`, `reliefweb` y `umar_pads`. No se menciona uso de RLHF, DPO ni decodificacion especulativa, algo coherente con una tarea de etiquetado por spans en lugar de generacion.

La innovacion principal no es arquitectonica sino de metodologia de anotacion: el autor etiqueta mediante un agente bajo un conjunto de reglas doctrinales y publica el modelo junto con las metricas de concordancia. Es un ejemplo de "agente como anotador" con trazabilidad explicita del sesgo que introduce (el campo `owner_reviewed` es `False` en el dataset).

## Capacidades

- Extraccion de menciones de fuentes de datos en texto academico: clasificacion de spans en `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.
- Reconocimiento de entidades basado en spans, no en generacion de texto: la salida son offsets y etiquetas, adecuada para pipelines deterministas.
- Capacidad zero-shot heredada de GLiNER: la arquitectura permite especificar etiquetas en tiempo de inferencia, aunque no hay evidencia publicada sobre el rendimiento de este ajuste con etiquetas distintas de las tres entrenadas.
- Procesamiento por lotes de pasajes completos con una sola pasada del encoder (sin decodificacion autoregresiva), lo que reduce latencia frente a modelos generativos.
- No soporta tool calling ni function calling: es un modelo de clasificacion de tokens, no un modelo de lenguaje con interfaz conversacional.
- No soporta agentes ni razonamiento multi-paso: no genera texto ni encadena llamadas.
- Sin capacidades de vision, audio ni modo de razonamiento explicito ("thinking mode").
- Capacidades multilingues: no declaradas por el autor; no se puede asumir soporte fuera del idioma del corpus de entrenamiento.

## Casos de uso

- Revision sistematica de literatura economica: el modelo recorre los pasajes de cada articulo y devuelve las menciones de fuentes de datos, lo que permite construir un inventario de que datasets se usan en un cuerpo de literatura sin lectura manual completa.
- Construccion de grafos de procedencia de datos: cada span `NAMED_DATA` se puede normalizar contra un catalogo de fuentes y enlazar articulo, fuente y ano, generando un grafo de reutilizacion de datos.
- Preanotacion para anotadores humanos: operando con umbral alto (0,70) el modelo ofrece precision 0,8177 con recall 0,4938; ese punto de operacion es util para reducir la carga de trabajo humano priorizando la precision, dejando al anotador completar los falsos negativos.
- Auditoria de citacion de datos en informes de politica: deteccion de pasajes `VAGUE_DATA` o `DESCRIPTIVE_DATA` donde un informe usa datos sin nombrar la fuente, senal util para politicas de transparencia.
- Enriquecimiento de repositorios documentales: indexacion de colecciones como las de ReliefWeb o los PADS del Banco Mundial para permitir busqueda por fuente de datos citada, no solo por palabras clave.
- Monitorizacion de calidad de metadatos en editoriales y repositorios: verificacion automatica de que los articulos aceptados citan explicitamente los datos que dicen usar antes de publicar.
- Extraccion de menciones a escala en corpus multiorigen: el modelo ha sido evaluado sobre cuatro origenes distintos, lo que permite desplegarlo como extractor comun en un pipeline heterogeneo con un unico punto de mantenimiento.
- Filtrado previo en pipelines de mineria de datos cientificos: descartar pasajes sin menciones de datos antes de aplicar modelos mas costosos, usando el umbral bajo (0,10) con recall 0,9714 como etapa de cribado.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica una evaluacion propia sobre el holdout de 2.108 pasajes y 1.611 spans, con barrido de umbrales:

| Umbral | TP | FP | FN | Precision | Recall | F0,5 | F1 |
|---|---|---|---|---|---|---|---|
| 0,10 | 1562 | 2268 | 46 | 0,4078 | 0,9714 | 0,4614 | 0,5745 |
| 0,20 | 1529 | 1766 | 79 | 0,4640 | 0,9509 | 0,5170 | 0,6237 |
| 0,30 | 1495 | 1441 | 113 | 0,5092 | 0,9297 | 0,5598 | 0,6580 |
| 0,40 | 1433 | 1137 | 175 | 0,5576 | 0,8912 | 0,6027 | 0,6860 |
| 0,50 | 1336 | 772 | 272 | 0,6338 | 0,8308 | 0,6653 | 0,7191 |
| 0,60 | 1129 | 431 | 479 | 0,7237 | 0,7021 | 0,7193 | 0,7128 |
| 0,70 | 794 | 177 | 814 | 0,8177 | 0,4938 | 0,7229 | 0,6157 |

Mejor F0,5: 0,7229 (umbral 0,70). Mejor F1: 0,7191 (umbral 0,50).

Desglose por etiqueta (umbral elegido por el autor para cada una):

| Etiqueta | Spans | Umbral | Precision | Recall | F0,5 | F1 |
|---|---:|---:|---:|---:|---:|---:|
| NAMED_DATA | 1225 | 0,70 | 0,7712 | 0,5736 | 0,7215 | 0,6579 |
| DESCRIPTIVE_DATA | 383 | 0,60 | 0,4204 | 0,2689 | 0,3778 | 0,3280 |
| VAGUE_DATA | 3 | 0,10 | 0,0000 | 0,0000 | 0,0000 | 0,0000 |

Desglose por origen del corpus:

| Origen | Pasajes | Spans | Umbral | Precision | Recall | F0,5 | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| fcv_pads_east_africa | 49 | 9 | 0,60 | 0,6667 | 0,4444 | 0,6061 | 0,5333 |
| prwp | 670 | 425 | 0,60 | 0,7391 | 0,6816 | 0,7269 | 0,7092 |
| reliefweb | 112 | 55 | 0,60 | 0,8182 | 0,6545 | 0,7792 | 0,7273 |
| umar_pads | 1277 | 1122 | 0,70 | 0,8140 | 0,5277 | 0,7343 | 0,6403 |

## Requisitos de hardware

- VRAM estimada: no hay cifra oficial. El repositorio ocupa 1,8 GB en disco, lo que sugiere que la inferencia en bf16 o fp16 cabe en menos de 2 GB de VRAM (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas. Por el tamano del repositorio, cualquier GPU de consumo con 6 GB o mas deberia ser suficiente; una RTX 3060, RTX 4060 o superior es un punto de partida razonable.
- Cabe en GPU de consumo: si, segun la estimacion anterior, aunque no hay confirmacion oficial ni mediciones publicadas.
- Opciones de despliegue: la libreria `gliner` (carga directa del modelo y prediccion con umbral configurable) y `transformers` de HuggingFace como base. La libreria GLiNER permite exportacion a ONNX para inferencia optimizada. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables sin conversion previa. vLLM y TGI no son el marco natural para un encoder de clasificacion de tokens.
- Latencia y throughput: no disponibles. Al no haber decodificacion autoregresiva, la latencia depende del numero de pasajes y de la longitud de contexto efectiva, parametros no publicados.

## Comparativa con modelos similares

| Modelo | Tipo | Etiquetas | Licencia | Metricas publicadas | Observaciones |
|---|---|---|---|---|---|
| `rafmacalaba/gliner_agents_v3` | Ajuste fino de GLiNER large v2.1 | 3 etiquetas de uso de datos | Apache 2.0 | Mejor F1 0,7191 (umbral 0,50) sobre holdout propio | Anotacion por agente, sin revision del propietario |
| `urchade/gliner_large-v2.1` | GLiNER generico zero-shot | Definibles en inferencia | no disponible en la informacion proporcionada | no disponible | Modelo base; no ajustado al dominio de economia |
| Otros NER supervisados de dominio economico | Transformers tipo BERT para NER | Esquema BIO propio | variable | no disponible | No se han encontrado alternativas equivalentes en la informacion proporcionada |

No se dispone de comparaciones directas con alternativas de la misma categoria en la informacion proporcionada, ya que los resultados de busqueda web recibidos no contienen referencias tecnicas relevantes.

## Limitaciones y advertencias

- Datos anotados por agente, no revisados por el propietario: las metricas miden concordancia con el agente anotador y no exactitud frente a un criterio humano. Cualquier uso en produccion deberia validarse con una muestra anotada manualmente.
- Rendimiento muy desigual por etiqueta: `NAMED_DATA` alcanza F1 0,6579, mientras que `DESCRIPTIVE_DATA` cae a 0,3280 y `VAGUE_DATA` obtiene 0,0000 con solo 3 spans de referencia, lo que hace que las metricas de esta ultima etiqueta no sean estadisticamente interpretables.
- Precision baja en umbrales utiles para recall: con umbral 0,50 la precision es 0,6338, es decir, aproximadamente un tercio de las menciones extraidas son falsos positivos. El modelo no es adecuado para uso directo sin una etapa de filtrado o revision.
- Fuerte dependencia del umbral: pasar de 0,50 a 0,70 reduce el recall de 0,8308 a 0,4938. El punto de operacion debe fijarse por caso de uso.
- Dominio estrecho: entrenado sobre articulos de investigacion economica y documentos de origen PADS, PRWP y ReliefWeb. El comportamiento fuera de ese dominio es desconocido.
- Idiomas no declarados: no hay garantia de funcionamiento fuera del idioma o idiomas presentes en el corpus de entrenamiento.
- Sin validacion externa: 0 descargas y 0 likes en HuggingFace en el momento de redactar esta ficha, sin terceros que reproduzcan las metricas.
- Sin datos de sesgo: no se ha publicado ningun analisis de sesgo por pais, region o tipo de fuente.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se documenten los cambios. No impone restricciones de uso adicionales, pero el autor no ofrece garantias sobre el modelo.
- Fechas del repositorio: la creacion y actualizacion figuran como 2026-09-27, dato que conviene verificar antes de citar el modelo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/rafmacalaba/gliner_agents_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/rafmacalaba/datause-agents-v3
- Modelo base: https://huggingface.co/urchade/gliner_large-v2.1

La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas generales de ChatGPT y a su articulo en Wikipedia, sin relacion con GLiNER ni con la extraccion de menciones de datos.
