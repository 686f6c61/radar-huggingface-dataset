# imquentinn/birefnet-lite-1024-webgpu

## Resumen

BiRefNet-lite 1024 (ONNX, WebGPU) es una exportacion a ONNX del modelo de segmentacion y matting BiRefNet-lite a resolucion 1024x1024, reescrita estructuralmente por el usuario imquentinn para que pueda ejecutarse en el execution provider WebGPU de onnxruntime-web. No es un modelo nuevo ni un reentrenamiento: los pesos son los del modelo base ZhengPeng7/BiRefNet_lite y solo se ha modificado la topologia del grafo. El problema que resuelve es muy concreto: la exportacion upstream a 1024 no compila en WebGPU y termina cayendo al execution provider de CPU, donde muere con `std::bad_alloc` en el heap wasm de 32 bits de ORT Web. Este repositorio es el parche que lo evita.

La relevancia practica esta en el despliegue completamente en cliente: al funcionar sobre WebGPU en el navegador, el modelo permite eliminacion de fondos y matting alfa sin subir imagenes a un servidor, sin round-trip de red y sin cuenta de usuario. El autor lo usa como tier de calidad `best` en Backgroundless (backgroundless.io), sirviendo el grafo de 1024 a cualquier cliente cuyo adaptador pueda ejecutarlo y reservando el de 512 como opcion por defecto. El repo ocupa 0,1 GB, se distribuye bajo licencia MIT (que cubre tambien los pesos) y el idioma y el pipeline declarados en HuggingFace son `image-segmentation`.

Las dos reescrituras del grafo estan demostradas como bit-identicas al original sobre el execution provider de CPU (`max|diff| = 0.000e+00` sobre el conjunto de pruebas), de modo que la calidad del matting no deberia verse alterada por el parche. Conviene tener presente, no obstante, que la identidad bit a bit se verifico CPU contra CPU, no CPU contra WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentacion dicotomica basada en backbone Swin Transformer (BiRefNet-lite, arquitectura bilateral reference); grafo ONNX reescrito para WebGPU |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 1024x1024 pixeles |
| Tipos de cuantizacion | fp16 (el archivo del repo ya esta en fp16, `model_fp16`); otras cuantizaciones no disponibles |
| Idiomas soportados | no aplica (modelo de vision, sin entrada ni salida de texto) |
| Licencia | MIT, incluyendo los pesos (sin clausula no comercial ni acuerdo de modelo aparte) |
| Formato de pesos | ONNX, consumible con transformers.js / onnxruntime-web |
| Modelo base | ZhengPeng7/BiRefNet_lite |
| Tamano del repositorio | 0,1 GB |
| Pipeline | image-segmentation (matting alfa, eliminacion de fondo) |
| Requisito de adaptador | `maxStorageBuffersPerShaderStage >= 8` |
| Salida | logits (aplicar sigmoid; no leer como valores 0-255) |

## Arquitectura y entrenamiento

El modelo base BiRefNet (Bilateral Reference for Dichotomous Image Segmentation) combina un backbone Swin Transformer con modulos de referencia bilateral y supervision multi-escala para segmentacion dicotomica de alta resolucion; la variante `lite` reduce el tamano del backbone y del decodificador. La model card del repositorio no detalla el numero de tokens de entrenamiento del modelo original, la composicion del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos figuran como no disponibles. Tampoco se especifica el numero de parametros de la variante lite.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en la reescritura del grafo ONNX. El autor identifica dos bloqueos independientes que deben corregirse en orden, porque el primero enmascara el segundo. En primer lugar, 59 nodos `Split` con 32 salidas cada uno, que nunca compilan porque `maxStorageBuffersPerShaderStage` es 8 por especificacion de WebGPU (10 en muchos adaptadores); se reescribieron como arboles de 6 salidas o menos. En segundo lugar, 80 nodos `GatherND`: como `deform_conv2d` no tiene operador ONNX equivalente, el exportador lo emula con `GatherND`, para el que el execution provider de WebGPU de ORT no tiene kernel, de modo que los 80 nodos caian a CPU y materializaban un buffer im2col fp16 de `[1,1,64,49,256,256]`, es decir 392 MB, con varios vivos a la vez, sobre el heap wasm de 32 bits. Eso, y no la resolucion, era el origen del `std::bad_alloc`. La reescritura sustituye `GatherND` por `Gather` mas aritmetica de indices en int32 y convierte los `Sum` variadicos en cadenas de `Add` binarios. Como resultado, las copias host-dispositivo bajan de 100 a 80 y el grafo se ejecuta de extremo a extremo en WebGPU.

El autor documenta dos trampas de implementacion: el cast a int32 debe hacerse tarde (hacer la aritmetica de indices en int32 duplica los cruces CPU-GPU, 180 copias en 9,1 s frente a 80 en 3,4 s; conviene calcular en int64 y castear una sola vez justo antes del `Gather`), y la cadena de sumas debe ser secuencial, no un arbol equilibrado, porque la suma en fp16 no es asociativa y un arbol equilibrado cambia el orden de sumatorio y rompe la identidad bit a bit con el grafo original.

## Capacidades

- Segmentacion de imagen y matting alfa: genera una matte de primer plano con canal alfa a partir de una imagen de entrada.
- Eliminacion de fondo de alta resolucion: procesa a 1024x1024, lo que mejora bordes finos como pelo, pelaje, tejidos y contornos de producto.
- Matting de bordes finos: frente a la variante de 512, aumenta el gradiente de borde medido y reduce el `interiorSoft`.
- Recuperacion de sujetos que la variante de 512 pierde por completo (en el conjunto de prueba, una imagen devuelve matte vacia a 512 y un 18,4 % de primer plano a 1024).
- Inferencia 100 % en cliente: ejecucion en el navegador via WebGPU, sin subida de imagen ni servidor intermedio.
- Integracion con transformers.js mediante `AutoModel.from_pretrained` con `device: 'webgpu'`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni modo thinking: es exclusivamente un modelo de vision para matting.
- Capacidades multilingues: no aplica.

## Casos de uso

- Eliminacion de fondo en herramientas web sin backend: el grafo corre entero en el navegador del visitante, de modo que la imagen nunca sale del dispositivo; es el caso real de Backgroundless, que lo sirve como tier de calidad `best`.
- Edicion fotografica profesional de retratos: a 1024 la matte resuelve mejor el pelo y los contornos difusos, que son justo los puntos donde una matte a 512 deja halos visibles.
- Fotografia de producto en comercio electronico: los bordes nitidos de objetos con materiales reflectantes o tejidos se benefician del mayor gradiente de borde medido; el coste es de 3,4 s por imagen en WebGPU, asumible en un flujo interactivo de una imagen a la vez.
- Aplicaciones de privacidad por diseno: al no haber subida de imagen ni cuenta de usuario, encaja en escenarios donde la normativa o la politica interna impiden enviar material grafico a un servidor.
- Herramientas creativas embebidas (collages, stickers, miniaturas): el modo de fallback a 512 cubre dispositivos con adaptadores limitados o con presupuesto de latencia bajo, y el 1024 se reserva para cuando la calidad de borde es determinante.
- Preprocesado en pipelines de vision por computador: la matte generada puede alimentar etapas posteriores de composicion, recorte o clasificacion, con la ventaja de que la inferencia puede ocurrir en el propio cliente.
- Procesamiento por lotes sensible a la latencia: no es el escenario ideal para esta variante, ya que 3,4 s por imagen se multiplica por el numero de archivos; en ese caso la variante de 512 (0,85 s) es la eleccion recomendada por el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para tareas tipo MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de segmentacion. Los unicos datos de rendimiento aportados proceden de la model card y corresponden a una comparacion contra BiRefNet-lite-512 sobre un mismo conjunto de 30 imagenes, mismo compositor y misma metrica (`edgeSharpness().gradient`):

| Modelo | all-30 gradient | products | interiorSoft | Tiempo en navegador (WebGPU) |
|---|---|---|---|---|
| BiRefNet-lite-512 | 0,0989 | 0,1095 | 0,00296 | 0,85 s |
| BiRefNet-lite-1024 (este) | 0,1436 | 0,1754 | 0,00043 | 3,4 s |

El autor resume el resultado como un +45 % de gradiente de borde a cambio de aproximadamente 4 veces mas tiempo, y senala que recupera sujetos que la variante de 512 no detecta. No obstante, advierte explicitamente sobre la procedencia de estas cifras: las columnas de calidad y la columna de tiempos provienen de ejecuciones distintas, ya que los valores de gradiente a 1024 se midieron en Node sobre el execution provider de CPU y no sobre la ruta WebGPU que describen los tiempos. Ademas, la identidad bit a bit se demostro CPU contra CPU para la reescritura, lo que no equivale a demostrar que CPU y WebGPU producen salidas identicas. Queda una bandera abierta: el `softEdgeRatio` de producto de este grafo es 0,01030 frente a un control de 0,01574, un 35 % inferior, lo que bajo una guarda de antialiasing significa que parte de la ganancia de gradiente podria corresponder a un borde mas duro y menos suavizado en lugar de a un borde mejor. El ancho de banda medido (9,15) y los recortes apoyan un borde genuinamente mas ajustado, pero el asunto no esta cerrado. El autor pide tratar el +45 % como una indicacion fuerte, no como un resultado consolidado, y recomienda remedir en la propia ruta de ejecucion.

## Requisitos de hardware

- Ejecucion en navegador mediante el execution provider WebGPU de onnxruntime-web; no requiere GPU de servidor ni VRAM dedicada en el sentido habitual.
- El adaptador grafico debe reportar `maxStorageBuffersPerShaderStage >= 8`; por debajo, el grafo de 59 nodos `Split` reescritos no compilaria.
- VRAM estimada para inferencia: no disponible con precision en la informacion proporcionada. El repositorio completo ocupa 0,1 GB y el archivo de pesos es fp16.
- Memoria intermedia: el cuello de botella documentado en la exportacion original era un buffer im2col fp16 de 392 MB, con varios vivos simultaneamente, sobre el heap wasm de 32 bits; el parche elimina esa ruta mediante `Gather`. Por tanto, la restriccion real es el tamano del heap wasm de ORT Web en 32 bits, no la VRAM del adaptador.
- GPUs recomendadas: no disponibles como lista concreta; el criterio practico es que el adaptador cumpla el requisito de buffers de almacenamiento.
- Cabe en GPU de consumo: si, siempre que el navegador exponga WebGPU y el adaptador cumpla el requisito anterior. Los datos de la model card no identifican modelos de GPU concretos.
- No se recomienda depender del execution provider de CPU como fallback a 1024: es precisamente la ruta que provoca `std::bad_alloc`. La alternativa segura en hardware limitado es usar el grafo de 512.
- Opciones de despliegue: transformers.js (`AutoModel.from_pretrained` con `device: 'webgpu'`, `dtype: 'fp32'` y `model_file_name: 'model_fp16'` para evitar que la libreria anada un sufijo de dtype) y onnxruntime-web. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia medida en navegador: 3,4 s por imagen a 1024, frente a 0,85 s a 512, sobre el mismo conjunto de prueba.
- Concurrencia: solo un grafo debe residir en memoria a la vez; cambiar de tier implica liberar y recompilar.

## Comparativa con modelos similares

| Modelo | Resolucion | Parametros | Licencia de pesos | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BiRefNet-lite-1024 (este) | 1024x1024 | no disponible | MIT, cubre los pesos | Repo ONNX para WebGPU via transformers.js | Grafo reescrito, bit-identico al original en CPU EP; 3,4 s en navegador |
| BiRefNet-lite-512 | 512x512 | no disponible | MIT (modelo base) | Exportacion estandar | Opcion por defecto para UIs interactivas y lotes; 0,85 s; 0,0989 de gradiente de borde |
| ZhengPeng7/BiRefNet_lite | variable | no disponible | MIT | Repositorio del modelo base | Origen de los pesos; el export upstream a 1024 no ejecuta en WebGPU |
| BRIA RMBG-1.4 | no disponible | no disponible | "source-available model for non-commercial use" | Modelo publicado por BRIA | Citado en la model card como ejemplo de licencia de pesos restrictiva; un wrapper con licencia MIT no altera la licencia de los pesos |

La comparacion de rendimiento entre las dos primeras variantes esta en la tabla de la seccion anterior. Para el resto no se dispone de cifras comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La identidad bit a bit del grafo reescrito se verifico sobre el execution provider de CPU y comparando CPU contra CPU; no se ha demostrado que CPU y WebGPU produzcan salidas identicas.
- Las cifras de calidad (+45 % de gradiente de borde) se midieron en Node sobre CPU EP, mientras que los tiempos corresponden a la ruta WebGPU: son ejecuciones distintas y no deben citarse como un unico experimento.
- Bandera de calidad abierta: el `softEdgeRatio` de producto (0,01030) es un 35 % inferior al control (0,01574), lo que podria indicar un borde mas duro y menos antialiasado en lugar de un borde mejor. El ancho de banda (9,15) y los recortes apoyan un borde mas ajustado, pero el autor no lo da por resuelto.
- Riesgo de `std::bad_alloc` si se fuerza la ejecucion a 1024 sobre el execution provider de CPU en ORT Web: el grafo depende de la ruta WebGPU para evitar el buffer im2col de 392 MB en un heap wasm de 32 bits.
- Dependencia estricta de `maxStorageBuffersPerShaderStage >= 8`; adaptadores por debajo de ese valor no podran compilar el grafo.
- La salida son logits, no una imagen en rango 0-255; hay que aplicar sigmoid antes de interpretarlos.
- Latencia de 3,4 s por imagen a 1024, aproximadamente 4 veces la de la variante de 512; poco adecuada para lotes grandes o flujos que exijan respuesta inmediata.
- Solo puede residir un grafo a la vez; alternar entre tiers obliga a liberar y recompilar.
- No se detallan sesgos del modelo base ni comportamiento en dominios fuera de las imagenes de prueba (30 imagenes, segun la model card).
- No hay datos sobre el numero de parametros, el dataset de entrenamiento ni el proceso de alineacion del modelo base en la informacion proporcionada.
- Licencia: MIT, que cubre los pesos, sin clausula no comercial y sin condiciones sobre las imagenes generadas. El autor advierte de que la licencia de un wrapper no modifica la licencia de los pesos subyacentes, y pone como ejemplo el caso de BRIA RMBG-1.4.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; el modelo parece recien creado (subido y actualizado el 10 de septiembre de 2026), por lo que la validacion por parte de terceros es minima.
- La model card esta truncada en la seccion de licencia ("One upstream caveat, in fairness. B"), de modo que puede faltar informacion adicional sobre la licencia del modelo base.
- La propia model card incluye una discrepancia de identificador: el ejemplo de inicio rapido usa `jiabins0303/birefnet-lite-1024-webgpu` mientras que el ID del repositorio es `imquentinn/birefnet-lite-1024-webgpu`. Conviene verificar cual es el correcto antes de integrarlo.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados son consultas no relacionadas sobre WhatsApp y no aportan informacion tecnica utilizable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imquentinn/birefnet-lite-1024-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Identificador alternativo citado en el ejemplo de la model card (verificar): https://huggingface.co/jiabins0303/birefnet-lite-1024-webgpu
- Aplicacion en produccion que usa este grafo como tier `best`: https://backgroundless.io
- Libreria de inferencia en cliente: https://github.com/huggingface/transformers.js
- Execution provider WebGPU de ORT: https://onnxruntime.ai/docs/execution-providers/WebGPU-ExecutionProvider.html
- Paper de BiRefNet (referencia del modelo base): https://arxiv.org/abs/2401.03407
- Resultados de busqueda web: sin resultados relevantes sobre el modelo (los enlaces recuperados tratan de WhatsApp y no se relacionan con la ficha).
