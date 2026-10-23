# kiberamos/the-collection-documents

## Resumen

`kiberamos/the-collection-documents` es un fine-tune de `microsoft/layoutlm-base-uncased` especializado en etiquetado de campos sobre documentos escaneados: recibe las palabras devueltas por un OCR junto con sus cajas delimitadoras y asigna a cada una la etiqueta del campo al que pertenece (comercio, fecha, total, impuestos, lineas de detalle, etc.). No es un modelo generativo ni un LLM conversacional: es un modelo de clasificacion de tokens con codificacion de layout, pensado para extraccion de informacion en recibos y facturas.

Lo desarrolla el autor individual `kiberamos` como parte de "The Collection", un portafolio personal, y se publica ya exportado a ONNX en cuantizacion dinamica int8 para ejecutarse en el navegador del visitante mediante ONNX Runtime Web. El repositorio ocupa 0,1 GB y la licencia es MIT, lo que permite uso comercial sin restricciones sobre los pesos.

Su interes practico es doble: por un lado documenta un pipeline completo y reproducible (semilla `20261015`, commits de entrenamiento y exportacion, revisiones fijadas del modelo base y del dataset); por otro, demuestra que un modelo de document AI de ~100 MB puede correr en el cliente sin enviar documentos a un servidor. El propio autor advierte de que las cifras sobre facturas sinteticas son poco informativas y que la metrica honesta es la de CORD v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificacion de layout (LayoutLM), derivado de BERT-base: 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion (configuracion del modelo base) |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base `microsoft/layoutlm-base-uncased` tiene ~110 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (se truncaron 27 palabras al construir las features) |
| Tipos de cuantizacion | ONNX int8 dinamico, pesos QInt8, esquema per-channel (seleccionado sobre validacion de CORD); existe una referencia fp32 no publicada |
| Idiomas soportados | Ingles y espanol (no evaluado en otros idiomas) |
| Licencia | MIT (pesos); el dataset CORD v2 es CC-BY-4.0 y requiere atribucion |
| Formato de pesos | ONNX, opset 17, exportado con el exporter `torchscript` |
| Tarea | Token classification sobre palabras OCR (etiquetado de campos) |
| Modelo base | `microsoft/layoutlm-base-uncased`, revision `30e3cdd39c11f09757b0fcf7598533d05052acef` |
| Datasets de entrenamiento | CORD v2 (800 train / 100 test, revision `7f0115a4b758a71d6473b8d085751692da2fef98`) + 1000/200 facturas sinteticas en ingles y espanol |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LayoutLM: un encoder transformer tipo BERT-base al que se le suman embeddings de posicion 2D derivados de las cajas delimitadoras de cada palabra del OCR, de modo que la representacion de un token combina contenido textual y posicion espacial en la pagina. La cabeza final es una capa de clasificacion por token que produce etiquetas de campo, y el resultado se agrupa en spans (campos completos) para evaluar precision y recall a nivel de span.

El entrenamiento se hizo durante 10 epocas, con batch 8 y learning rate 5e-05 sobre `mps`, a partir de CORD v2 (recibos reales con anotaciones de campos) y de un generador propio de facturas sinteticas (`documents/make_invoices.py`, semilla `20261015`, en ingles y espanol), donde las etiquetas son exactas por construccion. No se menciona RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo discriminativo de extraccion. La innovacion destacable no esta en la arquitectura sino en el empaquetado: exportacion a ONNX con cuantizacion dinamica per-channel para inferencia en navegador, con la decision del esquema de cuantizacion tomada sobre validacion y no sobre test.

## Capacidades

- Etiquetado de palabras OCR con el campo al que pertenecen (token classification) en recibos y facturas.
- Extraccion de entidades a nivel de span: comercio, fecha, total, impuestos, lineas de articulo y campos equivalentes presentes en las anotaciones de CORD v2.
- Uso de informacion espacial (coordenadas de las cajas del OCR) ademas del texto, lo que ayuda a desambiguar importes y fechas en maquetas tabulares.
- Inferencia en el cliente mediante ONNX Runtime Web dentro del navegador, sin backend.
- Ejecucion en CPU con pesos int8 (cuantizacion dinamica).
- Cobertura linguistica limitada a ingles y espanol segun la evaluacion del autor.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision por imagen completa, tool calling, function calling, agentes ni modos de "thinking". No es un modelo de lenguaje generativo.

## Casos de uso

- Extraccion de campos en gastos de empresa: el OCR del movil captura las cajas de texto del ticket, el modelo etiqueta cada palabra y un post-proceso agrupa los spans en un JSON con comercio, fecha e importe total que se vuelca al sistema de gastos. La ventana de 512 tokens cubre la mayoria de tickets simples.
- Digitalizacion masiva de facturas de proveedor: procesar cada documento en ventanas de 512 palabras y agregar los spans resultantes para alimentar un ERP, con el modelo int8 ejecutandose en CPU para abaratar el coste por documento.
- Procesamiento en el navegador con privacidad por diseno: al ejecutarse via ONNX Runtime Web, el documento del usuario nunca sale del cliente; util para portales de gestion documental en sectores regulados.
- Preanotacion en herramientas de etiquetado: usar las predicciones como borrador para que un anotador humano corrija, reduciendo el tiempo por documento en la creacion de nuevos datasets de recibos.
- Validacion y normalizacion de OCR: contrastar los importes detectados como "total" con la suma de las lineas de detalle y marcar discrepancias antes de contabilizar.
- Demos y docencia de document AI: el repositorio incluye semilla, commits de entrenamiento y de exportacion y revisiones fijadas, lo que permite reproducir el pipeline completo en un laboratorio.
- Ingesta documental en entornos sin GPU: al ser un modelo de ~0,1 GB en ONNX, se puede desplegar en contenedores ligeros o dispositivos de borde para clasificar y extraer campos en tiempo de subida.

## Benchmarks y rendimiento

Resultados a nivel de span, sobre conjuntos de test no usados para entrenar ni para elegir la cuantizacion (datos de la model card):

| Modelo | Conjunto de test | Precision | Recall | Micro F1 | Macro F1 | Spans |
|---|---|---|---|---|---|---|
| ONNX fp32 (referencia, no publicado) | CORD test | 94,97 % | 95,04 % | 95,00 % | 89,88 % | 1310 |
| ONNX fp32 (referencia, no publicado) | Facturas sinteticas test | 100,00 % | 100,00 % | 100,00 % | 100,00 % | 7024 |
| ONNX int8 per-channel (publicado) | CORD test | 93,10 % | 93,66 % | 93,38 % | 74,99 % | 1310 |
| ONNX int8 per-channel (publicado) | Facturas sinteticas test | 100,00 % | 100,00 % | 100,00 % | 100,00 % | 7024 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no son aplicables a un modelo discriminativo de este tipo. La caida de Macro F1 de 89,88 a 74,99 tras la cuantizacion indica que las clases de campo poco frecuentes pierden recall aunque la media micro se mantenga.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con pesos int8; el repositorio completo ocupa 0,1 GB, por lo que el grafo ONNX cuantizado es del orden de decenas de MB.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y tambien en CPU, que es el modo previsto por el autor.
- Ejecutable en el navegador via ONNX Runtime Web (WASM; WebGPU no confirmado en la informacion disponible).
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), ONNX Runtime Web, y cualquier runtime compatible con ONNX. vLLM y TGI no aplican porque no es un modelo generativo.
- Latencia y throughput: no disponibles. El coste por documento escala con el numero de palabras OCR, ya que hay que procesar ventanas de 512 tokens.
- Memoria del dispositivo: suficiente con un entorno de ejecucion ONNX y el tokenizador de LayoutLM; no requiere acelerador dedicado.

## Comparativa con modelos similares

| Modelo | Enfoque | Contexto | Formato publicado | Licencia | Notas |
|---|---|---|---|---|---|
| `kiberamos/the-collection-documents` | LayoutLM base fine-tuneado, token classification | 512 tokens | ONNX int8 | MIT | Cuantizado para navegador; evaluado en CORD v2 e ingles/espanol |
| `microsoft/layoutlm-base-uncased` | LayoutLM base sin fine-tune | 512 tokens | PyTorch (safetensors/bin) | MIT | Modelo base; requiere ajuste para extraccion de campos |
| LayoutLMv2 / LayoutLMv3 (familia) | Layout + vision, token classification | 512 tokens en las variantes base | PyTorch | MIT | Incorporan imagen de la pagina; no comparados numericamente aqui por falta de datos en la informacion disponible |
| Donut (familia) | Document understanding generativo image-to-JSON | No disponible en la informacion | PyTorch | MIT | Evita depender del OCR externo, a costa de mayor tamano y coste de inferencia |

No se dispone de numeros comparativos de parametros, rendimiento ni latencia para las alternativas en la informacion proporcionada; la comparacion es, por tanto, cualitativa.

## Limitaciones y advertencias

- Dependencia del OCR: las metricas parten de las cajas de palabra de CORD; con un OCR real de menor calidad la precision de campo caera.
- Truncamiento: 27 palabras se cortaron al limite de 512 tokens al construir las features, de modo que documentos largos pierden contenido si no se segmentan.
- Cobertura linguistica: no evaluado fuera de ingles y espanol; no hay garantias para otros idiomas.
- Cuantizacion agresiva en clases raras: el Macro F1 en CORD baja de 89,88 a 74,99 con int8; conviene revisar el recall por campo antes de usarlo en produccion con campos poco frecuentes.
- El 100 % de F1 en facturas sinteticas no es una medida representativa: el propio autor reconoce que el generador es facil y que la cifra honesta es la de CORD.
- Dominio limitado: CORD v2 son recibos de un dominio concreto; el comportamiento ante facturas con maquetas muy distintas no esta documentado.
- Licencia: los pesos son MIT y permiten uso comercial, pero CORD v2 es CC-BY-4.0 y exige atribucion a NAVER Clova; conservar el aviso si se redistribuye el modelo o datos derivados.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; el modelo no ha pasado por una revision independiente.
- No apto para generacion, resumen, chat ni razonamiento: es un clasificador de tokens, no un LLM; cualquier flujo que espere texto libre necesita otro modelo.
- Sesgos: la informacion disponible no detalla la composicion demografica o geografica de los datos, por lo que no se puede evaluar el sesgo por pais, moneda o tipo de comercio.
- Formatos de fecha, separadores decimales y simbolos de moneda no documentados: verificar el post-proceso antes de usar los importes en sistemas contables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiberamos/the-collection-documents
- Modelo base: https://huggingface.co/microsoft/layoutlm-base-uncased
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Atribucion del dataset: CORD, NAVER Clova Information Extraction, CC BY 4.0
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (paper, blog, repositorio o demo) en la busqueda realizada.
