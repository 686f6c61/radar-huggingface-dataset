# rolf-mozilla/french-embedding-e5-distilled

## Resumen

`rolf-mozilla/french-embedding-e5-distilled` es un modelo compacto de embeddings de frases especializado en frances, publicado por el usuario rolf-mozilla. Se construye como un estudiante destilado a partir de `intfloat/multilingual-e5-small`, al que se ha podado el vocabulario a los 16k tokens XLM-R efectivamente usados en texto frances y se ha destilado desde un teacher `HPLT/hplt_bert_base_fr` afinado con SimCSE supervisado. El resultado es un modelo BERT de 256 dimensiones de salida que, en formato ONNX int8, ocupa solo 28,3 MB.

El modelo resuelve el problema de la generacion de embeddings de frases para recuperacion y similitud semantica en frances en entornos con recursos limitados, especialmente en el navegador o en dispositivos de borde mediante transformers.js y onnxruntime. Su relevancia actual radica en que ofrece un rendimiento en recuperacion (nDCG@5 de 0,740 en un conjunto de memoria frances y 0,739 en SyntecRetrieval) superior al de alternativas mucho mas grandes como `ibm-granite/granite-embedding-97m-multilingual-r2` (98,2 MB) o `Xenova/multilingual-e5-small` (118,3 MB), con una huella de memoria mucho menor.

La arquitectura es un transformer tipo BERT con pooling medio y normalizacion L2 integrados en el grafo, de modo que la receta estandar de feature-extraction devuelve directamente el embedding. El contexto de entrenamiento esta limitado a 256 tokens y el modelo solo soporta frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (base: intfloat/multilingual-e5-small, vocabulario podado a 16k tokens) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | int8 dinamica (ONNX); fp32 (ONNX) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17); `onnx/model_quantized.onnx` int8 y `onnx/model.onnx` fp32 |
| Dimension del embedding | 256 |
| Tamano del repositorio | 0,1 GB (28,3 MB en int8 ONNX) |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo BERT derivado de `intfloat/multilingual-e5-small`, con el vocabulario reducido a los 16k subword pieces de XLM-R utilizados por el texto frances. La cabeza de proyeccion a 256 dimensiones esta plegada dentro del grafo ONNX, de forma que la salida del modelo es directamente el embedding tras aplicar mean pooling y normalizacion L2. La exportacion se realiza a ONNX con opset 17 y cuantizacion int8 dinamica.

El proceso de destilacion consta de cuatro fases. Primero, un teacher `HPLT/hplt_bert_base_fr` se afina con SimCSE supervisado sobre pares franceses de uso comercial: titulo→entradilla y frase→parrafo de Wikipedia, pregunta→respuesta web de HPLT 2.0, y prompt→respuesta de OpenAssistant oasst1 y Aya. Segundo, el espacio objetivo son los vectores del teacher con mean pooling, blanqueados (ajustados sobre el corpus de destilacion) y truncados a 256 dimensiones. Tercero, el estudiante se destila sobre 1,2 millones de textos franceses (HPLT 2.0, Wikipedia francesa, oasst1 y Aya) con una combinacion de perdida coseno, divergencia KL de distribucion de similitud in-batch y perdida contrastiva de pares, durante 3 epocas, seguidas de una pasada corta con lotes de vecinos cercanos por k-means que mejora el ranking fino dentro de un dominio estrecho. Cuarto, se exporta a ONNX. No se usaron MS MARCO ni XNLI en el entrenamiento.

## Capacidades

- Generacion de embeddings de frases para texto en frances, con salida de 256 dimensiones normalizada L2.
- Recuperacion semantica y busqueda por similitud (memoria, documentos, pares pregunta-respuesta).
- Clasificacion y agrupamiento por similitud coseno (probe de precision en MASSIVE-fr de 0,804).
- Inferencia en dispositivo y en navegador mediante transformers.js y onnxruntime.
- No requiere prefijos `query:` ni `passage:` en la entrada.
- Capacidad multilingue: no, solo frances.
- Sin soporte de tool calling, agentes ni generacion de texto (es un modelo de extraccion de caracteristicas).

## Casos de uso

- Busqueda semantica en aplicaciones web francesas: el modelo puede indexar y consultar documentos en frances directamente en el navegador con transformers.js, gracias a sus 28,3 MB en int8 y su contexto de 256 tokens.
- Sistemas de memoria personal en asistentes: tal como demuestra su evaluacion en el conjunto de memoria frances (nDCG@5 de 0,740), es adecuado para recuperar recuerdos relevantes de un usuario a partir de consultas en lenguaje natural.
- Deduplicacion y agrupamiento de contenidos: permite calcular similitud entre articulos, mensajes o registros franceses para agrupar o eliminar duplicados en pipelines de datos.
- Clasificacion de textos por similitud a prototipos: util para enrutado de tickets, moderacion o etiquetado en aplicaciones con requisitos de baja latencia y sin GPU.
- Recuperacion aumentada (RAG) en frances: puede actuar como encoder de recuperacion en un sistema RAG de documentacion francesa, con umbrales de similitud recalibrados para su escala.
- Procesamiento en el borde o sin conexion: su tamano reducido y su formato ONNX permiten desplegarlo en dispositivos moviles o entornos sin acceso a red para tareas de similitud semantica en frances.

## Benchmarks y rendimiento

Resultados publicados en la model card (frances, ONNX q8, mismo pipeline de evaluacion para todas las filas):

| Modelo | Tamano | Memory retrieval nDCG@5 | SyntecRetrieval nDCG@5 | MASSIVE-fr probe acc |
|---|---|---|---|---|
| **este modelo** | **28,3 MB** | **0,740** | **0,739** | **0,804** |
| ibm-granite/granite-embedding-97m-multilingual-r2 (q8) | 98,2 MB | 0,724 | 0,720 | 0,730 |
| Xenova/multilingual-e5-small (q8) | 118,3 MB | 0,560 | 0,729 | 0,749 |
| Xenova/all-MiniLM-L6-v2 (q8) | 23,0 MB | 0,563 | 0,537 | 0,724 |

Las diferencias inferiores a ~0,01 estan dentro del ruido entre ejecuciones de la cuantizacion int8 dinamica. El conjunto de memory retrieval consta de 500 consultas con 11-21 memorias candidatas cada una (2-4 correctas); SyntecRetrieval usa una muestra de 100 consultas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 (modelo de 28,3 MB); el modelo completo en fp32 tambien es muy ligero.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en CPU; tambien en navegador y dispositivos moviles.
- Opciones de despliegue: transformers.js, onnxruntime (Python y JS), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Tamano q8 | Memory retrieval nDCG@5 |
|---|---|---|---|---|---|---|
| rolf-mozilla/french-embedding-e5-distilled | no disponible | 256 tokens | fr | MIT | 28,3 MB | 0,740 |
| ibm-granite/granite-embedding-97m-multilingual-r2 | 97M (segun nombre) | no disponible | multilingue | no disponible | 98,2 MB | 0,724 |
| Xenova/multilingual-e5-small | no disponible | no disponible | multilingue | MIT (modelo base) | 118,3 MB | 0,560 |
| Xenova/all-MiniLM-L6-v2 | no disponible | no disponible | ingles principalmente | Apache 2.0 (modelo base) | 23,0 MB | 0,563 |

## Limitaciones y advertencias

- Solo frances: el tokenizer esta podado a frances; el uso en ingles o entre idiomas no esta probado.
- Entrenado con entradas de hasta 256 tokens; textos mas largos se truncan.
- Las puntuaciones de similitud no estan calibradas con las de otros modelos; es necesario recalibrar cualquier umbral de similitud.
- Advertencia de linaje: aunque el modelo base `intfloat/multilingual-e5-small` tiene licencia MIT, sus datos de entrenamiento originales incluyen MS MARCO, con terminos no comerciales; conviene revisarlo antes de un uso comercial.
- Riesgo de sesgo y alucinacion: no disponible en la informacion proporcionada; al ser un modelo de embeddings no genera texto, pero puede heredar sesgos de los datos de destilacion (HPLT 2.0, Wikipedia, oasst1, Aya).
- Los datos de evaluacion (memory retrieval, SyntecRetrieval, MASSIVE) no se usaron en entrenamiento, pero el conjunto de evaluacion es limitado (500 y 100 consultas).

## Enlaces

- HuggingFace: https://huggingface.co/rolf-mozilla/french-embedding-e5-distilled
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Teacher: https://huggingface.co/HPLT/hplt_bert_base_fr
- transformers.js: https://github.com/huggingface/transformers.js
- onnxruntime: https://onnxruntime.ai/
- Conjunto de datos HPLT 2.0: https://hplt-project.org/
- OpenAssistant oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Aya: https://huggingface.co/CohereForAI/aya_dataset
