# AnnotateIt/edgecrafter-ecdet-l-onnx

## Resumen

AnnotateIt/edgecrafter-ecdet-l-onnx es una conversión a ONNX del checkpoint oficial COCO-only de EdgeCrafter ECDet-L, un detector de objetos de la familia ECDet desarrollada por Intellindust AI Lab. La conversión la mantiene AnnotateIt y se distribuye como un único archivo ONNX FP32 de 131.999.124 bytes con opset 17, pensado para ejecutarse tanto en Python como en el navegador mediante onnxruntime-web. No es un modelo de lenguaje: no genera texto ni tiene ventana de contexto, sino que consume imágenes de 640x640 píxeles y devuelve hasta 300 detecciones sobre 80 clases COCO.

Su relevancia es práctica: es la pieza de inferencia de la aplicación web de AnnotateIt, y su publicación incluye el contrato de importación completo (`config.json`), informes de validación y scripts de exportación reproducibles. La validación declarada cubre el checker de ONNX, inferencia de formas, lotes 1 y 2, 15 casos numéricos y 12 imágenes de COCO val2017, con una prueba real en Chrome sobre onnxruntime-web 1.24.3 en WASM a un solo hilo.

El autor advierte de que esa prueba es una muestra de humo y no una evaluación completa de AP sobre COCO, y de que dos casos no superaron el `allclose` estricto y se aceptaron mediante una vía secundaria documentada. El checkpoint original se entrenó sobre `detection-datasets/coco`, la licencia es Apache-2.0 y, al tratarse de una conversión independiente, no está respaldada por los autores originales del proyecto EdgeCrafter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos de la familia ECDet; el graph ONNX incluye el TopK interno) |
| Parametros totales | no disponible (el archivo FP32 ocupa 131.999.124 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagenes de 640x640) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica FP32 ONNX; no se documentan variantes INT8, FP16 ni GGUF) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 17), archivo unico FP32 |
| Pipeline | object-detection |
| Entrada | `images` float32 `[batch, 3, 640, 640]`, RGB, resize bilineal tipo stretch, `/255`, normalizacion ImageNet |
| Salidas | `pred_logits` `[batch, 300, 80]` logits crudos de clase y `pred_boxes` `[batch, 300, 4]` cxcywh normalizado |
| Postprocesado | sigmoide, mejor clase por query, filtrado por confianza (0,4 por defecto) y escalado de cajas; sin NMS |
| Dataset de entrenamiento | detection-datasets/coco |
| Tamano del repositorio | 0,1 GB |
| Hash SHA-256 del archivo | `8ff21b08d838a17f567f30876f38274e2a0f34796d2d690fc8173180346820a2` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original: la model card describe el grafo ONNX exportado, no la red. Se sabe que el graph incluye el TopK interno del modelo y que el postprocesado externo no esta embebido, por lo que la salida sigue el esquema propio de los detectores tipo DETR: un conjunto fijo de 300 consultas, cada una con 80 logits de clase y una caja en formato cxcywh normalizado, sin necesidad de NMS. El checkpoint original es la variante `ecdet_l` del proyecto EdgeCrafter, en su version entrenada unicamente sobre COCO, tomada de la revision de codigo `b17f0f340af687e7adf2dff42a49e2eb8250ee20`.

El proceso de conversion es verificable: exportacion a ONNX con `export_raw_onnx.py`, verificacion con `verify_onnx.py` usando `--variant ecdet_l` y el checkpoint original, PyTorch en CPU instalado desde su indice oficial, y dos exportaciones independientes que resultaron identicas byte a byte. No se documentan en esta informacion el numero de tokens de entrenamiento (concepto que ademas no aplica), la composicion detallada del dataset mas alla de COCO, ni si hubo fases de RLHF, DPO o ajuste por refuerzo. Tampoco se describen innovaciones tecnicas especificas del modelo, como decodificacion especulativa o atencion lineal, porque no es un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes: devuelve hasta 300 detecciones con caja y clase sobre las 80 categorias de COCO.
- Inferencia por lotes: se verificaron lotes de tamano 1 y 2.
- Ejecucion en navegador: validado en Chrome real con onnxruntime-web 1.24.3 sobre WASM a un solo hilo, usando el parser de produccion de AnnotateIt.
- Ejecucion en Python: verificada frente a PyTorch en 15 casos numericos y en comparaciones semanticas sobre 12 imagenes de COCO val2017.
- Contrato de importacion documentado: `config.json` define el mapeo completo de clases COCO y las condiciones de uso del grafo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, function calling ni capacidad de agentes.
- No dispone de modo thinking, audio ni ninguna otra modalidad distinta de la vision.
- No se documentan capacidades multilingues ni procesamiento de texto de ningun tipo.

## Casos de uso

- Pre-etiquetado en plataformas de anotacion: el modelo genera cajas y clases sobre las 80 categorias COCO que un anotador humano revisa y corrige despues, reduciendo el trabajo manual en la fase inicial de creacion de datasets. Es el escenario para el que se construyo, dado que AnnotateIt lo usa en su propia aplicacion.
- Inferencia en el navegador sin backend: al ejecutarse sobre onnxruntime-web en WASM, permite ofrecer deteccion de objetos en una aplicacion web sin enviar las imagenes a un servidor, lo que simplifica el cumplimiento de requisitos de privacidad.
- Procesamiento por lotes en Python: integrable en scripts de limpieza, filtrado o curado de imagenes donde haya que descartar o clasificar grandes volumenes por presencia de objetos de COCO.
- Control de calidad de anotaciones existentes: comparar las detecciones del modelo con las etiquetas de un dataset para localizar imagenes posiblemente mal anotadas o clases ausentes.
- Vision por computador en el borde o en equipos modestos: el archivo de pesos ocupa 132 MB, lo que facilita su distribucion y su despliegue en entornos con recursos limitados, siempre que se acepte la latencia de CPU.
- Modulo de deteccion dentro de una aplicacion mayor: al exponer tensores crudos (`pred_logits`, `pred_boxes`) con postprocesado externo, permite sustituir el filtrado de confianza y el mapeo de clases por logica propia sin tocar el grafo.
- Referencia para validar exportaciones ONNX: los scripts incluidos y los informes de paridad sirven como plantilla para verificar otras conversiones de modelos PyTorch a ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En concreto, la model card indica que no se ha realizado una evaluacion completa de AP sobre COCO y que las comparaciones semanticas sobre 12 imagenes son una muestra de humo.

Si se documentan las siguientes validaciones, que no constituyen benchmarks de precision:

| Comprobacion | Resultado declarado |
|---|---|
| Carga estricta del checkpoint, checker de ONNX e inferencia de formas | superada |
| Comprobaciones con lote 1 y lote 2 | superadas |
| Exportaciones independientes | identicas byte a byte |
| PyTorch frente a ONNX Runtime nativo | 15 casos numericos y comparaciones semanticas en 12 imagenes de COCO val2017 |
| Comparaciones semanticas con confianza 0,4 | todas superadas |
| Chrome real, onnxruntime-web 1.24.3, WASM a un hilo | 12 imagenes superadas con el parser de produccion de AnnotateIt |
| `allclose` estricto (rtol=0,001, atol=0,0001) | fallo en `image_000000458054.jpg` y `image_000000480985.jpg`, aceptado solo por la via secundaria documentada |
| WebGPU, movil y otros navegadores | no validados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El archivo de pesos FP32 ocupa 131.999.124 bytes, pero el consumo real depende de las activaciones a 640x640 y del backend elegido; no se publican cifras.
- GPU recomendadas: no disponible. La model card no especifica ninguna GPU.
- Viabilidad en GPU de consumo: no documentada. Dado el tamano del archivo, el cuello de botella previsible no es la memoria de los pesos, pero no hay datos publicados que lo confirmen.
- Ejecucion sin GPU: si, es el escenario validado. La prueba real se hizo en Chrome con onnxruntime-web sobre WASM a un solo hilo, y la exportacion se realizo con PyTorch en CPU.
- Opciones de despliegue: ONNX Runtime nativo, onnxruntime-web (WASM; WebGPU no validado). No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La propia model card advierte de que los tiempos medidos en el navegador son diagnosticos y no un benchmark controlado, y que los modelos grandes requieren mas RAM y mas tiempo de CPU.
- Requisitos de memoria en navegador: la model card senala que los modelos grandes exigen mas RAM y CPU, sin cuantificar.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de ningun modelo alternativo, por lo que no es posible completar una comparativa con cifras verificables. Los unicos datos disponibles son los del propio modelo:

| Modelo | Parametros | Entrada | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EdgeCrafter ECDet-L ONNX (AnnotateIt) | no disponible (132 MB en FP32) | imagenes 640x640, lote por lotes 1 y 2 verificados | no aplica | sin AP COCO publicado; solo validaciones de paridad | apache-2.0 | ONNX en HuggingFace, 0 descargas |
| Alternativas de la misma categoria (por ejemplo, detectores tipo DETR o YOLO) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Cualquier comparacion de precision, latencia o coste con otros detectores de objetos queda pendiente de una evaluacion AP completa que la model card declara explicitamente como no realizada.

## Limitaciones y advertencias

- No se ha publicado una evaluacion completa de AP sobre COCO; las pruebas semanticas se limitan a 12 imagenes y se describen como muestra de humo.
- La paridad numerica estricta no es total: dos imagenes fallaron el `allclose` estricto y se aceptaron por una via secundaria que exige como maximo cuatro filas modificadas por imagen, confianza inferior a 0,3 en ambos runtimes, clases ganadoras identicas, error de sigmoide inferior a 0,001 y paridad estricta de cajas. La equivalencia no es bit a bit.
- Bajar el umbral de confianza por debajo de 0,4 puede exponer predicciones de baja confianza afectadas por esa discrepancia numerica.
- La validacion en navegador cubre unicamente Chrome real con onnxruntime-web 1.24.3 en WASM a un solo hilo. WebGPU, movil y otros navegadores no se han validado.
- Solo esta validado con lotes 1 y 2; no hay datos sobre lotes mayores.
- El modelo reconoce exclusivamente las 80 clases de COCO. No detecta categorias fuera de ese conjunto y su comportamiento en dominios alejados de COCO (imagen medica, satelital, industrial) no esta documentado.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo, y al entrenarse sobre COCO hereda las limitaciones de representacion y etiquetado de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos, especialmente con el umbral de confianza por defecto.
- Es una conversion independiente de AnnotateIt y no esta respaldada por los autores originales de EdgeCrafter; los problemas derivados de la conversion deben reportarse al conversor.
- Restricciones de licencia: Apache-2.0, que en principio permite uso comercial, pero hay que revisar los archivos LICENSE y NOTICE y tener en cuenta las condiciones del proyecto original y del dataset COCO.
- El modelo no incluye postprocesado externo: quien lo integre debe aplicar sigmoide, seleccion de mejor clase, filtrado por confianza y escalado de cajas, y debe asumir que no hay NMS.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe una comunidad de usuarios que haya reportado problemas de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnnotateIt/edgecrafter-ecdet-l-onnx
- Proyecto original EdgeCrafter (Intellindust AI Lab), revision `b17f0f340af687e7adf2dff42a49e2eb8250ee20`: https://github.com/Intellindust-AI-Lab/EdgeCrafter
- Organizacion AnnotateIt en HuggingFace: https://huggingface.co/AnnotateIt
- Sitio de AnnotateIt: https://annotateit.ai/
- Aplicacion de AnnotateIt: https://app.annotateit.ai/
- Documentacion de AnnotateIt: https://annotateit.ai/docs/
- Dataset de entrenamiento: https://huggingface.co/datasets/detection-datasets/coco
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la informacion de HuggingFace.
