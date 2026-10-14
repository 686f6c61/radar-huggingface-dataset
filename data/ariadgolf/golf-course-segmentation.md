# ariadgolf/golf-course-segmentation

## Resumen

Ariad golf course segmentation es un modelo de segmentacion semantica multiclase de seis clases disenado para detectar elementos de campos de golf en imagenes aereas de cuatro bandas. Lo desarrolla el usuario ariadgolf y se distribuye en Hugging Face con la libreria segmentation-models-pytorch. La arquitectura es una U-Net con encoder ResNet-34 y 24.459.238 parametros totales, exportada desde un checkpoint archivado en Supabase al formato nativo de Hugging Face.

El modelo resuelve un problema muy concreto de teledeteccion: separar, a escala de pixel, las clases background, green, tee, fairway, bunker y water sobre recortes de 512 x 512 pixeles a 0,6 metros de resolucion de suelo. La entrada debe ser uint8 en orden rojo, verde, azul e infrarrojo cercano (R, G, B, NIR), lo que lo vincula a imagenes NAIP del programa USDA. La salida son seis logits sin normalizar por pixel.

Su relevancia actual es acotada pero clara: es un ejemplo reproducible de segmentacion multiespectral aplicada a cartografia deportiva, con utilidades de inferencia incluidas, test-time augmentation por defecto y preservacion de la georreferencia. No es un modelo de proposito general ni un modelo de lenguaje: es un segmentador de vision por computador entrenado sobre 4.665 teselas de 790 campos. El autor advierte de que las predicciones de agua no son fiables y de que la salida requiere revision humana antes de usarse en cartografia o navegacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 |
| Parametros totales | 24.459.238 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 512 x 512 pixeles con 4 bandas |
| Tipos de cuantizacion | pesos almacenados en FP16 Safetensors; convertidos a FP32 para inferencia en CPU. No se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | en (etiqueta del repositorio); el modelo no procesa texto |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP16) |
| Pipeline | image-segmentation |
| Libreria | segmentation-models-pytorch |
| Bandas de entrada | 4 (rojo, verde, azul, infrarrojo cercano), en ese orden, uint8 0-255 |
| Normalizacion | (pixel - media) / desviacion; medias [108.314, 118.389, 97.68, 158.925] y desviaciones [42.693, 38.205, 33.022, 51.632]. No dividir por 255 |
| Resolucion de suelo | 0,6 metros por pixel |
| Clases de salida | 0 background, 1 green, 2 tee, 3 fairway, 4 bunker, 5 water |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

Se trata de una U-Net clasica con encoder ResNet-34, implementada sobre segmentation-models-pytorch. El modelo recibe teselas de 4 x 512 x 512 y devuelve 6 logits por pixel, que se convierten en mascara mediante softmax y argmax. Al cargarse con `smp.from_pretrained(repo_id)` no requiere `trust_remote_code`. Los pesos se guardan en FP16 y se convierten a FP32 para ejecucion en CPU. La utilidad de linea de comandos incluida en el repositorio aplica test-time augmentation promediando las probabilidades de la identidad, el volteo horizontal y el volteo vertical, conserva la georreferenciacion de entrada y escribe un raster de clases de una sola banda con valor nodata 255; existe la opcion `--no-tta` para una unica pasada.

El entrenamiento corresponde al run v4, con 14 epocas programadas y seleccion del checkpoint de la epoca 13 (contando desde uno). El conjunto de entrenamiento consta de 4.665 teselas procedentes de 790 campos, con 573 teselas de validacion. Los datos son imagenes aereas NAIP del USDA obtenidas a traves de USGS The National Map, emparejadas con etiquetas de elementos de golf de OpenStreetMap. Los splits se hicieron por campo, con retenciones adicionales geograficas y alineadas con el despliegue: retenciones a nivel de estado en AZ, CO, GA, IA y OR, y exclusion del area metropolitana de Nueva York del entrenamiento. La funcion de perdida combina entropia cruzada con etiquetas parciales y Dice multiclase con confianza de etiqueta dependiente de la clase, un mecanismo pensado para tolerar etiquetas OSM incompletas o erroneas.

## Capacidades

- Segmentacion semantica densa por pixel en seis clases sobre imagen aerea multiespectral de cuatro bandas.
- Deteccion de greenes con calidad notablemente superior al resto de clases; es la clase con mejor IoU de pixel registrado (0,693).
- Deteccion de calles (fairway, IoU de pixel 0,636) y bunkers (IoU de pixel 0,563).
- Deteccion de tees con calidad limitada (IoU de pixel 0,331) y de agua claramente no fiable (IoU de pixel 0,034).
- Inferencia sobre teselas de 512 x 512 a 0,6 m/pixel; los rasters mayores requieren teselado con solapamiento y mezcla de probabilidades antes de la poligonizacion.
- Test-time augmentation integrada (identidad, flip horizontal, flip vertical) con promediado de probabilidades.
- Conservacion de la georreferenciacion de entrada y escritura de raster de clases con nodata 255.
- Ejecucion en CPU, CUDA y Apple MPS mediante el parametro `--device`.
- Capacidad de anclaje de revision del Hub (`--revision COMMIT_SHA`) y de uso offline con un snapshot local (`--model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Inventario y cartografia de greenes a escala regional: el modelo alcanza un recall del 88,27% con precision del 79,24% a IoU >= 0,5 sobre 99 campos retenidos, y un recall del 90,31% con precision del 83,47% en estados retenidos, lo que lo hace util para generar candidatos de poligono de green que despues se revisan y se cargan en un SIG.
- Asistencia al mapeo de OpenStreetMap: dado que las etiquetas de entrenamiento provienen de OSM, la salida se puede usar como capa de sugerencia para que mapeadores humanos confirmen o corrijan contornos, reduciendo el trabajo manual de digitalizacion.
- Planificacion de mantenimiento de campos: la separacion entre green, tee y fairway permite estimar superficies de siega por clase y planificar rutas de cortacesped o presupuestos de riego diferenciados por zona, siempre que la resolucion efectiva de la imagen se verifique respecto a la distorsion de proyeccion.
- Analisis multitemporal de cambios: aplicando el modelo a imagenes NAIP de distintas anualidades sobre la misma georreferencia se pueden detectar variaciones en la extension de fairway o bunker; conviene teselar con solapamiento y mezclar probabilidades para evitar artefactos en los bordes de tesela.
- Priorizacion de inspeccion de masas de agua: aunque la clase water no es fiable, el pipeline historico devolvio solo dos candidatos de green en 148 teselas negativas (0,14 candidatos por km2), lo que indica que la clase green sirve como filtro previo eficaz en grandes volumenes de imagen; cualquier uso de la clase water debe limitarse a senalar zonas a revisar por un tecnico.
- Analitica deportiva y calculo de distancias: la deteccion de tees y greenes permite estimar la geometria de cada hoyo (punto de salida y zona de llegada) para alimentar aplicaciones de yardage o visualizacion de recorridos, asumiendo el margen de error de la clase tee.
- Enriquecimiento de datos inmobiliarios: la presencia y calidad de un campo de golf en el entorno de una propiedad se puede derivar de la mascara de clases para alimentar modelos de valoracion o paneles de mercado.
- Investigacion en teledeteccion: sirve como referencia reproducible de segmentacion multiespectral de 6 clases con 24,46 millones de parametros, util para experimentos de comparacion de encoders o de estrategias de perdida con etiquetas ruidosas.

## Benchmarks y rendimiento

Los resultados publicados son la evaluacion historica del checkpoint v4 original, no una evaluacion nueva del modelo exportado en FP16. La mayoria de las referencias de evaluacion son contornos de OpenStreetMap, por lo que las metricas miden concordancia con OSM, no exactitud topografica. Las metricas de objeto incluyen el pipeline original de teselado, aumento, cosido y filtrado de poligonos, que el ejemplo simple de argmax no reproduce.

Evaluacion de objetos de tipo green:

| Conjunto | Campos | Greenes de referencia | Recall a IoU >= 0,5 | Precision a IoU >= 0,5 | IoU medio sobre referencias |
|---|---:|---:|---:|---:|---:|
| Campos retenidos emparejados | 99 | 1.552 | 88,27% | 79,24% | 0,7283 |
| Estados retenidos | 40 | 805 | 90,31% | 83,47% | 0,7616 |
| Validacion OSM | 27 | 528 | 87,88% | 86,41% | 0,7303 |

IoU de pixel registrado en el checkpoint seleccionado:

| Clase | IoU de pixel |
|---|---:|
| Green | 0,693 |
| Tee | 0,331 |
| Fairway | 0,636 |
| Bunker | 0,563 |
| Water | 0,034 |

Otros datos registrados: sobre 148 teselas negativas el pipeline original devolvio dos candidatos de green, equivalentes a 0,14 candidatos por km2. En un conjunto revisado de 175 greenes puntuables, el IoU medio del modelo fue 0,8469 frente a 0,9335 de OSM; las referencias reutilizan geometria OSM en 136 de esos greenes, lo que otorga a OSM una concordancia perfecta en ese subconjunto por construccion, de modo que no se trata de un benchmark totalmente independiente y el criterio historico de paridad con la revision no se alcanzo. Los registros agregados completos estan en `evaluation.json`.

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K ni equivalentes) por tratarse de un modelo de segmentacion de imagen.

## Requisitos de hardware

- Los pesos ocupan aproximadamente 48,9 MB en FP16 y 97,8 MB al convertirlos a FP32 (calculado a partir de los 24.459.238 parametros; no es un dato de la model card).
- VRAM estimada para inferencia con una tesela de 512 x 512 y lote 1: en torno a 1-2 GB incluyendo pesos y activaciones de la U-Net ResNet-34 (estimacion derivada, no publicada por el autor).
- La augmentation por test-time augmentation multiplica por tres el coste de calculo por tesela, ya que realiza tres pasadas. Con `--no-tta` el coste se reduce a una sola pasada.
- Cabe en cualquier GPU de consumo con al menos 2 GB de VRAM, incluidas generaciones antiguas; tambien funciona en CPU y en Apple Silicon via MPS, tal como documenta el autor.
- GPU de centro de datos (A100, H100) no aportan ventajas de memoria significativas para este tamano, solo mayor throughput en procesamiento por lotes de grandes superficies.
- Opciones de despliegue: PyTorch con segmentation-models-pytorch (soporte nativo del Hub), exportacion a ONNX o TorchScript, y servidores de inferencia para vision como Triton o TorchServe. vLLM, llama.cpp, Ollama y TGI no son aplicables porque el modelo no es un transformer de lenguaje.
- Latencia y throughput: no disponibles. El autor no publica mediciones por dispositivo.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. Este modelo pertenece a la categoria de segmentacion semantica de imagen aerea multiespectral; como alternativas genericas del mismo tipo se podrian considerar variantes de U-Net con otros encoders, arquitecturas tipo DeepLabV3+ o SegFormer, pero no se dispone de datos de parametros, contexto, rendimiento ni licencia de esas alternativas contrastados contra este modelo, por lo que cualquier comparacion numerica seria especulativa.

| Aspecto | Este modelo | Alternativas de la misma categoria |
|---|---|---|
| Arquitectura | U-Net ResNet-34 | no disponible |
| Parametros | 24,46 millones | no disponible |
| Bandas de entrada | 4 (RGB + NIR) | no disponible |
| Clases | 6 especificas de golf | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Hugging Face, 0 descargas y 0 likes en el momento de la consulta | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio. Antes de cualquier uso comercial es imprescindible contactar con el autor para aclarar los terminos.
- Las predicciones de agua no son fiables: el IoU de pixel registrado para la clase water es 0,034. El propio autor indica que la salida de agua no debe usarse como geometria de obstaculo con autoridad.
- Las etiquetas OSM pueden faltar o ser inexactas, especialmente en tees y agua. El IoU de pixel de la clase tee es 0,331, el mas bajo despues de water.
- Las metricas publicadas corresponden al checkpoint v4 original, no al modelo exportado en FP16, aunque el autor afirma que la exportacion conserva todos los valores de los tensores.
- La mayor parte de las referencias de evaluacion son contornos OSM, de modo que las cifras miden concordancia con OSM y no exactitud topografica. En el conjunto revisado de 175 greenes, 136 referencias reutilizan geometria OSM, lo que favorece artificialmente a OSM.
- El criterio historico de paridad con la revision no se alcanzo, segun la propia model card.
- La entrada debe ser estrictamente de cuatro bandas con infrarrojo cercano real en la cuarta posicion. Imagenes RGB de tres canales o con alfa no son validas.
- Es obligatorio usar la normalizacion especifica del modelo (medias y desviaciones indicadas) y no dividir por 255 antes ni sustituirla por la normalizacion estandar de ImageNet.
- Cambios de apariencia por antiguedad de la imagen, sombras, cesped dormido, arbolado y geografia pueden reducir la precision. El sesgo geografico es relevante: el entrenamiento uso imagenes de EE. UU. y excluyo el area metropolitana de Nueva York, con retenciones en AZ, CO, GA, IA y OR.
- El repositorio contiene el modelo y las utilidades de inferencia, pero no las imagenes ni el conjunto de datos de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- Las teselas deben ser de 512 x 512 a la resolucion de suelo esperada. Rasters mayores exigen teselado con solapamiento y mezcla de probabilidades antes de la poligonizacion, y la resolucion de suelo debe calcularse teniendo en cuenta la distorsion de proyeccion, ya que los metros en coordenadas de mapa no siempre equivalen a metros sobre el terreno.
- Las predicciones requieren revision de la imagen antes de cualquier uso en cartografia o navegacion. El modelo no debe usarse como fuente autoritativa sin validacion humana.
- El modelo no procesa texto ni mantiene conversaciones; no es adecuado para tareas de lenguaje, razonamiento o codigo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ariadgolf/golf-course-segmentation
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios de codigo o demos) en la busqueda web realizada. Los resultados devueltos por la busqueda no guardan relacion con el modelo y se han descartado.
