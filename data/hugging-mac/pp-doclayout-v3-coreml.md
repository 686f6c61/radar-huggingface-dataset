# hugging-mac/pp-doclayout-v3-coreml

## Resumen

`hugging-mac/pp-doclayout-v3-coreml` es una conversión a Core ML en FP16 del modelo de análisis de maquetación de documentos `PaddlePaddle/PP-DocLayoutV3_safetensors`, publicada por el autor `hugging-mac` como parte del SDK [hugging-mac](https://github.com/hugging-mac/hugging-mac). No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: un ML Program de Core ML con una entrada fija `pixel_values` de forma `[1, 3, 800, 800]` y cuatro salidas en bruto (`logits`, `pred_boxes`, `order_logits` y `out_masks`).

El problema que resuelve es el de ejecutar detección y segmentación de estructura documental (bloques de texto, títulos, tablas, figuras, orden de lectura) de forma totalmente local en macOS, sin depender de PaddlePaddle ni de frameworks de servidor. Al ser un ML Program de Core ML, puede aprovechar la GPU y la Neural Engine de los chips Apple Silicon, con un tamaño de repositorio de solo 0,1 GB y una licencia Apache-2.0 heredada del modelo original.

Su relevancia es de nicho pero clara: cubre el hueco de inferencia local de layout documental en el ecosistema Apple, un escenario habitual en aplicaciones de digitalización, escaneo y preprocesado de documentos para pipelines de RAG. No se han publicado datos de rendimiento, benchmarks, ni información sobre arquitectura interna, parámetros o datos de entrenamiento en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conversion a Core ML ML Program del modelo PaddlePaddle/PP-DocLayoutV3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision con entrada fija de imagen) |
| Tipos de cuantizacion | FP16 (pesos convertidos a FP16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML ML Program (.mlpackage); repositorio de 0,1 GB |
| Tarea principal | document-layout-analysis (vision) |
| Entrada | `pixel_values`, forma fija `[1, 3, 800, 800]` |
| Salidas | `logits`, `pred_boxes`, `order_logits`, `out_masks` |
| Plataforma objetivo | macOS 14 o superior |
| Libreria | coremltools |
| Modelo base | PaddlePaddle/PP-DocLayoutV3_safetensors |
| Preprocesado y postprocesado | implementados por el SDK de hugging-mac, no incluidos en el paquete Core ML |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `PP-DocLayoutV3` en la documentacion proporcionada: no se detallan el tipo de backbone, el mecanismo de deteccion, el numero de parametros ni la composicion del dataset de entrenamiento. La model card solo describe el artefacto de conversion: un ML Program de Core ML con entrada de imagen fija de 800x800 pixeles y salidas en bruto de logits de clasificacion, cajas predichas, logits de ordenacion y mascaras.

La innovacion tecnica de este repositorio no esta en el entrenamiento, sino en el empaquetado: la conversion a FP16 para Core ML, la fijacion de la forma de entrada y la exposicion de tensores crudos para que el SDK de hugging-mac se encargue del preprocesado y del postprocesado especifico de layout documental. La presencia de `order_logits` y `out_masks` entre las salidas sugiere que el modelo original combina deteccion de regiones, estimacion de orden de lectura y segmentacion, aunque este extremo no se confirma en la informacion disponible. No consta que se hayan aplicado tecnicas de RLHF, DPO ni decodificacion especulativa, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Analisis de maquetacion documental: deteccion de regiones y bloques en imagenes de documentos a traves de las salidas `logits` y `pred_boxes`.
- Estimacion de orden de lectura: la salida `order_logits` apunta a la prediccion de la secuencia de lectura de los bloques detectados.
- Segmentacion a nivel de region: la salida `out_masks` indica mascaras por region, util para delimitar con precision tablas, figuras o bloques de texto.
- Inferencia local en macOS: al ser un ML Program de Core ML, esta pensado para ejecutarse en el dispositivo, sin conexion a servicios externos.
- Aceleracion por hardware Apple: compatible con la GPU integrada y la Neural Engine de los chips Apple Silicon bajo macOS 14 o superior.
- Integracion via SDK: el preprocesado de imagen y el postprocesado de layout los implementa el SDK de hugging-mac, no el paquete Core ML.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de vision aplicado a layout.
- Capacidades multilingues: no disponibles (no se documenta ningun conjunto de idiomas soportados).

## Casos de uso

- Digitalizacion de archivos escaneados en macOS: el modelo detecta y separa bloques de texto, tablas y figuras en cada pagina, lo que permite reconstruir la estructura del documento antes de aplicar OCR sobre cada region.
- Preprocesado de documentos para pipelines de RAG: al identificar la maquetacion y el orden de lectura, se puede segmentar un PDF complejo en fragmentos coherentes antes de generar embeddings, mejorando la calidad de la recuperacion.
- Extraccion de campos en facturas y albaranes: la deteccion de regiones permite aislar cabeceras, lineas de detalle y totales para que un extractor posterior procese cada zona por separado.
- Procesamiento de articulos cientificos: la combinacion de deteccion de bloques y orden de lectura facilita reconstruir el flujo de un paper a doble columna, separando titulo, autores, cuerpo, figuras y referencias.
- Aplicaciones de escritorio con privacidad estricta: al ejecutarse en local sobre Core ML, los documentos del usuario no salen del dispositivo, lo que encaja en entornos legales, sanitarios o corporativos con requisitos de confidencialidad.
- Indexacion masiva de repositorios documentales: integrado en una app macOS nativa, permite procesar lotes de PDFs en la Neural Engine sin coste de servidor ni limites de cuota de API.
- Digitalizacion de formularios y encuestas: las mascaras por region ayudan a localizar casillas y campos estructurados antes de aplicar un modelo de reconocimiento especifico.
- Herramientas de anotacion y etiquetado: el modelo puede pre-anotar automaticamente regiones y orden de lectura, reduciendo el trabajo manual en la creacion de datasets de layout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: macOS 14 o superior; el paquete esta orientado al ecosistema Apple y no se documentan versiones para Windows, Linux, Android ni servidores x86.
- Aceleracion: ML Program de Core ML, con uso previsto de GPU integrada y Neural Engine en chips Apple Silicon (M1 y posteriores); no se especifica compatibilidad con Intel Macs.
- VRAM estimada: no disponible. Como referencia de magnitud, el repositorio completo ocupa 0,1 GB, por lo que los pesos en FP16 son muy reducidos y deberian caber sin problema en la memoria unificada de cualquier Mac Apple Silicon, incluso en configuraciones de 8 GB.
- GPU recomendadas: no disponibles; el modelo esta pensado para hardware Apple en lugar de GPUs dedicadas tipo A100, H100 o RTX 4090, para las que no se ofrece soporte en este repositorio.
- Encaje en GPU de consumo: si, en el sentido de que el peso del artefacto (0,1 GB) es manejable para cualquier Mac moderno; no hay datos de encaje en GPUs de consumo NVIDIA porque el formato Core ML no es compatible con ellas.
- Resolucion de entrada: fija en 800x800 pixeles, por lo que cualquier imagen debe redimensionarse a esa forma antes de la inferencia.
- Opciones de despliegue: Core ML mediante el SDK de hugging-mac; no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hugging-mac/pp-doclayout-v3-coreml | no disponible | imagen fija 800x800 | Core ML (FP16) | Apache-2.0 | HuggingFace, macOS 14+ |
| PaddlePaddle/PP-DocLayoutV3_safetensors (modelo base) | no disponible | no disponible | safetensors | Apache-2.0 (heredada) | HuggingFace |
| Otras alternativas de layout documental (LayoutLMv3, DiT, DocLayout-YOLO, entre otras) | no disponibles | no disponibles | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, parametros ni contexto de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica diferencia verificable frente al modelo base es el formato: este repositorio entrega un ML Program de Core ML en FP16, mientras que el original se distribuye en safetensors para el ecosistema PaddlePaddle.

## Limitaciones y advertencias

- Se trata exclusivamente de una conversion de formato: no se ha reentrenado ni ajustado el modelo, por lo que hereda todas las limitaciones del modelo base `PP-DocLayoutV3`.
- No hay ningun benchmark publicado en la informacion disponible, ni tampoco resultados de validacion propios de la conversion a FP16; se desconoce la perdida de precision respecto al modelo original.
- La entrada es fija (`[1, 3, 800, 800]`), lo que obliga a redimensionar las imagenes y puede degradar la deteccion en documentos con relaciones de aspecto muy distintas o con texto muy pequeno.
- El paquete devuelve tensores en bruto: sin el SDK de hugging-mac no hay preprocesado ni postprocesado, por lo que la integracion directa exige implementar esa logica por cuenta propia.
- Dependencia de plataforma: requiere macOS 14 o superior y no es portable a Linux, Windows ni a GPUs NVIDIA, lo que limita su uso en servidores o en pipelines multiplataforma.
- No se documentan idiomas soportados ni sesgos conocidos; no hay informacion sobre el comportamiento con alfabetos no latinos, documentos manuscritos o maquetaciones no occidentales.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y de cajas o mascaras mal delimitadas en documentos atipicos, especialmente tras la conversion a FP16.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia; al ser una obra derivada, conviene verificar tambien las condiciones del modelo base de PaddlePaddle.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Las busquedas web realizadas para esta ficha no devolvieron resultados relevantes sobre el modelo; los enlaces obtenidos correspondian a contenidos sin relacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hugging-mac/pp-doclayout-v3-coreml
- Modelo base: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- SDK hugging-mac: https://github.com/hugging-mac/hugging-mac
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
