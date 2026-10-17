# Scylix/kiora-withoutbg-v10

## Resumen

kiora-withoutbg-v10 es un modelo de vision por computador especializado en eliminacion de fondos y image matting (generacion de canales alfa), no un modelo de lenguaje. Lo publica el usuario Scylix en HuggingFace como una copia modificada del modelo withoutBG Open Weights v10 (repositorio `withoutbg/withoutbg-openweights-onnx`, archivo `withoutbg-open-weights.onnx` en la revision `cfae4da1ee`). Segun la model card, se usa en la funcion "Select Subject" de la aplicacion Kiora Photo.

El modelo esta construido sobre un backbone DINOv3 y tambien incorpora Depth Anything V2 (small), lo que lo convierte en una obra compuesta con varias licencias. La modificacion introducida por Scylix consiste en recodificar los pesos para reducir el tamano del archivo y comprimir el resultado con gzip, dando lugar a un unico archivo ONNX comprimido (`.onnx.gz`).

Su relevancia actual es la de ofrecer pesos abiertos para una tarea muy demandada (separacion de sujeto y fondo) en un formato desplegable con ONNX Runtime. El repositorio ocupa 0,1 GB y, en el momento de la consulta, no registra descargas ni "likes", por lo que se trata de una publicacion reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de segmentacion/matting en formato ONNX; la model card indica que esta construido con DINOv3 y las notas de terceros mencionan Depth Anything V2 (small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no tiene ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; la model card indica que los pesos originales en fp32 fueron recodificados para reducir el tamano del archivo |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | withoutbg-open-weights-and-dinov3 (obra compuesta; ver seccion de limitaciones) |
| Formato de pesos | ONNX comprimido con gzip (`.onnx.gz`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | withoutbg/withoutbg-openweights-onnx |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una obra derivada: parte del modelo withoutBG Open Weights v10 y esta construido con DINOv3, con la presencia adicional de Depth Anything V2 (small) segun las notas de terceros incluidas en el repositorio. No se detalla en la model card la topologia exacta, el numero de capas, el numero de parametros ni el esquema completo de atencion o convolucion empleado para la tarea de matting.

Respecto al entrenamiento, no se proporcionan datos: no se indica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO (procedimientos, por otra parte, propios de modelos de lenguaje y no aplicables directamente aqui). La unica intervencion documentada respecto al modelo original es la recodificacion de pesos para reducir el tamano del fichero y su compresion en gzip. Se declaran dos ficheros: el modelo distribuido `kiora-withoutbg-v10.onnx.gz` (107.167.967 bytes, SHA-256 `6d10eef7f340231a4f7eacbefd3e194b432b223524671685b2f0f1ecefba48b8`) y la fuente upstream `.onnx` en fp32 (454.497.726 bytes, SHA-256 `29930e48e9d5ecc56d6486c53c35a4c1470566c2a3359fa180b08c8d3c34ef0f`).

## Capacidades

- Eliminacion de fondo: separa el sujeto del fondo en una imagen, generando presumiblemente una mascara alfa o un recorte.
- Image matting: la etiqueta `image-matting` sugiere generacion de canales alfa con transparencia, orientada a bordes finos (pelo, detalles).
- Integracion en la funcion "Select Subject" de la aplicacion Kiora Photo.
- Inferencia mediante ONNX Runtime (`onnxruntime` como libreria declarada).
- Distribucion como archivo ONNX unico comprimido con gzip.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision multimodal en el sentido de un modelo de lenguaje.
- No hay informacion disponible sobre tool calling, function calling, uso como agente o razonamiento multi-paso.
- No se documentan capacidades multilingues (el modelo opera sobre imagenes, no sobre texto).

## Casos de uso

- Eliminacion de fondos en aplicaciones de fotografia: el modelo encaja como motor detras de funciones de tipo "seleccionar sujeto" o "quitar fondo" en editores moviles y de escritorio, tal y como declara su uso en Kiora Photo.
- Fotos de producto en comercio electronico: automatizar la generacion de imagenes con fondo transparente o blanco para catalogos de tiendas online, procesando lotes de imagenes de producto.
- Procesamiento por lotes de catalogos y archivos fotograficos: al distribuirse en ONNX, puede integrarse en un pipeline que recorra carpetas y aplique el matting de forma desatendida.
- Fondos virtuales en videollamadas y streaming: generar mascaras por fotograma para sustituir o desenfocar el fondo del hablante, siempre que la latencia del modelo sea suficiente para el caso de uso.
- Diseno grafico y preimpresion: extraer sujetos para composiciones, carteles o montajes, aprovechando el matting para conservar bordes complejos.
- Preparacion de datasets de vision: generar mascaras alfa o recortes para anotar y construir conjuntos de datos de segmentacion de forma semiautomatica.
- Edicion fotografica profesional: uso como paso previo en flujos de retoque donde se necesita aislar al sujeto antes de aplicar ajustes de color o exposicion por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de segmentacion (por ejemplo, IoU, SAD o MAD sobre datasets como Composition-1k), ni datos de latencia, throughput o comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo ONNX, la inferencia se realiza con ONNX Runtime, que soporta ejecucion en CPU y en GPU segun el proveedor de ejecucion configurado.
- VRAM estimada: no disponible de forma oficial. Como referencia de tamano, el archivo distribuido comprimido ocupa unos 107 MB y el modelo upstream en fp32 unos 454 MB, por lo que la huella en memoria es reducida en comparacion con modelos de lenguaje.
- GPU recomendadas: no se especifican en la documentacion. Dado el tamano del modelo, cualquier GPU de consumo moderna (por ejemplo, gama RTX) deberia ser suficiente; no hay cifras oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: probablemente si, por el reducido tamano de los pesos, aunque no se aporta confirmacion oficial.
- Opciones de despliegue: ONNX Runtime (libreria declarada); las herramientas de despliegue de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama no son aplicables a este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scylix/kiora-withoutbg-v10 | Version modificada y comprimida | no disponible | no aplica | withoutbg-open-weights-and-dinov3 | HuggingFace (0 descargas, 0 likes) |
| withoutbg/withoutbg-openweights-onnx | Modelo upstream del que deriva | no disponible | no aplica | sin datos exactos en la informacion proporcionada; fuente de los componentes Apache 2.0 y DINOv3 | HuggingFace (revision `cfae4da1ee`) |

No se dispone de datos suficientes en la informacion proporcionada para comparar con otros modelos de eliminacion de fondos (parametros, contexto, rendimiento o licencia), por lo que esa comparacion se marca como no disponible.

## Limitaciones y advertencias

- Modelo de vision especializado: solo cubre eliminacion de fondo y matting; no sirve para generacion de texto ni tareas de lenguaje.
- Licencia compuesta: es una obra derivada y su uso o redistribucion obliga a cumplir simultaneamente la licencia withoutBG Open Model (Apache 2.0 para las partes de withoutBG), la licencia DINOv3 de Meta para el backbone y la Apache 2.0 de Depth Anything V2. Es imprescindible revisar `LICENSE-DINOv3.md` y `THIRD_PARTY_NOTICES.md` antes de un uso comercial, ya que la licencia DINOv3 puede imponer condiciones adicionales.
- Procedencia y validacion: repositorio con 0 descargas y 0 likes, publicado por un usuario que no es el autor original; no ha sido validado de forma externa.
- Integridad del archivo: se recomienda verificar el SHA-256 declarado (`6d10eef7f340231a4f7eacbefd3e194b432b223524671685b2f0f1ecefba48b8`), dado que parte del archivo es una modificacion de pesos sobre el original.
- Formato comprimido: se distribuye como `.onnx.gz`, de modo que sera necesario descomprimirlo antes de la inferencia.
- Sesgos y calidad: no se documentan sesgos conocidos ni evaluaciones de calidad sobre distintos tipos de imagen (retratos, objetos, escenas complejas), por lo que el comportamiento en condiciones no previstas es desconocido.
- Riesgo de errores de segmentacion: no hay informacion sobre el rendimiento en bordes finos, transparencias o imagenes con fondos complejos.
- Garantia: se distribuye "tal cual", sin garantia de ningun tipo, segun la propia model card.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scylix/kiora-withoutbg-v10
- Modelo base (upstream): https://huggingface.co/withoutbg/withoutbg-openweights-onnx
- Licencia del modelo withoutBG: https://withoutbg.com/open-model/license
- Los resultados de busqueda web proporcionados no incluyen enlaces relevantes sobre este modelo; los resultados recibidos corresponden a contenidos sin relacion (paginas sobre una actriz) y se descartan.
