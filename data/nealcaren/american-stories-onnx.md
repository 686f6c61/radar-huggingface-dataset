# NealCaren/american-stories-onnx

## Resumen

American Stories — ONNX layout/line models es un par de detectores de objetos exportados a ONNX por el usuario NealCaren para el analisis de maquetacion de periodicos historicos. No se trata de un modelo de lenguaje, sino de dos modelos YOLOv8 de vision por computador: uno detecta regiones de pagina (cabeceras, columnas, anuncios, ilustraciones) y otro detecta lineas de texto dentro de esas regiones. El repositorio actua como espejo de los pesos originales del proyecto American Stories (dell-research-harvard/AmericanStories, presentado en NeurIPS 2023), que hasta ahora se distribuian mediante una carpeta de Dropbox.

El objetivo del repositorio es operativo: servir como origen de descarga para el backend `AsYoloDetector` de la herramienta [`newspaper-ocr`](https://github.com/nealcaren/newspaper-ocr), de modo que el detector pueda obtener los pesos bajo demanda en lugar de depender de una ruta local. Los dos ficheros ONNX son `layout_model_new.onnx` (unos 104 MB) y `line_model_new.onnx` (unos 44 MB), y el conjunto del repositorio ocupa aproximadamente 0,1 GB.

Su relevancia es acotada pero clara para el nicho de humanidades digitales y digitalizacion de prensa historica: los modelos estan entrenados sobre escaneos de *Chronicling America* de la Library of Congress, por lo que estan especializados en las particularidades tipograficas y de maquetacion de la prensa estadounidense de los siglos XVIII a XX, un dominio donde los detectores genericos de documentos rinden peor. La licencia es CC-BY-4.0 y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (red convolucional de deteccion de objetos, sin anclas y con cabecera desacoplada) exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (no aplica; la entrada es imagen, no texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Ficheros distribuidos | `layout_model_new.onnx` (~104 MB, md5 `21d242c6...`) y `line_model_new.onnx` (~44 MB, md5 `23fccd7b...`) |
| Tarea declarada en el Hub | object-detection |
| Tamano del repositorio | ~0,1 GB |
| Clases o etiquetas de salida | no disponible |

## Arquitectura y entrenamiento

La informacion disponible indica que ambos ficheros son modelos YOLOv8 entrenados sobre escaneos de la Library of Congress correspondientes a la coleccion *Chronicling America*. YOLOv8 es una familia de detectores convolucionales de una sola etapa, sin anclas, con cabecera de prediccion desacoplada y asignacion dinamica de etiquetas; en este caso el entrenamiento se ha especializado en dos tareas complementarias de analisis de maquetacion: deteccion de regiones o bloques de pagina (fichero de layout) y deteccion de lineas de texto (fichero de line). El numero de parametros de cada variante, el volumen de imagenes de entrenamiento, la resolucion de entrada y el numero de clases no se detallan en la model card.

El origen de los pesos es el proyecto American Stories (NeurIPS 2023), que los distribuia a traves de una carpeta de Dropbox; este repositorio los replica para permitir su descarga automatica. La model card menciona explicitamente que una copia local previa del detector de lineas habia sido sobrescrita por error con el modelo de layout, y que el fichero `line_model_new.onnx` se volvio a descargar desde el Dropbox oficial para corregirlo, de ahi el sufijo `_new` en ambos nombres. No se documentan procesos de ajuste fino con RLHF o DPO, algo que no aplica a un detector de objetos, ni tecnicas de atencion lineal o decodificacion especulativa.

## Capacidades

- Deteccion de regiones de maquetacion en paginas de periodico escaneadas: permite separar bloques como titulares, columnas de texto, ilustraciones o anuncios, segun las clases que haya aprendido el modelo de layout.
- Deteccion de lineas de texto: el segundo modelo devuelve las cajas correspondientes a cada linea, lo que facilita alimentar despues un motor de OCR linea a linea.
- Inferencia sobre imagenes de prensa historica: los pesos estan entrenados sobre escaneos de *Chronicling America*, con la variabilidad tipografica, de calidad de papel y de ruido de escaneo propia de ese corpus.
- Ejecucion portable mediante ONNX Runtime: al ser ficheros ONNX, se pueden ejecutar en CPU o GPU sin depender del framework original de entrenamiento.
- Integracion con `newspaper-ocr` como backend `AsYoloDetector`, con descarga automatica de pesos si no estan en cache local.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente, multimodalidad entrada-texto ni modo de razonamiento. Es exclusivamente un detector de objetos sobre imagen.

## Casos de uso

- Digitalizacion de hemerotecas historicas: el modelo de layout segmenta cada pagina escaneada en regiones y el de lineas subdivide el texto, generando la estructura necesaria antes de pasar el OCR. Es adecuado porque esta entrenado sobre prensa historica estadounidense y no sobre documentos modernos.
- Pipeline de OCR completo con `newspaper-ocr`: al usar `AsYoloDetector`, la herramienta descarga automaticamente los pesos desde este repositorio, lo que simplifica el despliegue en maquinas nuevas o en contenedores sin rutas locales preconfiguradas.
- Extraccion de metadatos estructurados de prensa antigua: a partir de las cajas de layout se pueden aislar titulares, cuerpos de noticia y anuncios, y asociarlos a campos de un registro catalografico o a un indice de hemeroteca.
- Investigacion en humanidades digitales: proyectos que analizan grandes corpus de prensa (por ejemplo, evolucion de vocabulario, publicidad o disposicion de portadas) necesitan una segmentacion previa fiable; estos detectores proporcionan la capa geometrica sobre la que se construyen los analisis.
- Indexado y busqueda en archivos periodisticos: la combinacion de deteccion de regiones y de lineas permite generar texto OCR ordenado de forma coherente (columna a columna, linea a linea), lo que mejora la precision de los motores de busqueda sobre el corpus.
- Procesamiento por lotes en infraestructura sin GPU: al ser modelos ONNX pequenos (~104 MB y ~44 MB), se pueden ejecutar con ONNX Runtime sobre CPU en servidores de digitalizacion que procesan volumenes grandes de imagenes de forma asincrona.
- Reconstruccion de la estructura de pagina para publicaciones facsimil: las cajas detectadas permiten reordenar o recortar regiones para generar ediciones digitales navegables o visores que resalten articulos individuales.
- Adaptacion a otras colecciones de prensa: si la maquetacion es similar a la de *Chronicling America*, el modelo puede servir como punto de partida y ajustarse despues con anotaciones propias, aunque no se documenta ningun procedimiento de reentrenamiento en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de deteccion (mAP, IoU, precision o recall) ni comparaciones cuantitativas con otros detectores de maquetacion, y la busqueda web realizada no ha devuelto documentacion tecnica relevante sobre estos pesos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, los ficheros ONNX ocupan aproximadamente 104 MB y 44 MB, por lo que en precision FP32 cada modelo necesita del orden de 0,1 a 0,5 GB de memoria durante la inferencia, incluyendo activaciones y buffers del runtime; una estimacion prudente es menos de 1 GB en total para ejecutar ambos secuencialmente.
- GPU recomendadas: no hay recomendaciones publicadas. Cualquier GPU con soporte CUDA y al menos 2 GB de VRAM es suficiente en la practica; modelos de gama alta como A100, H100 o RTX 4090 no aportan ventaja significativa salvo por mayor paralelismo en procesamiento por lotes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas o en equipos sin GPU dedicada mediante ejecucion en CPU.
- Opciones de despliegue: ONNX Runtime (ejecucion en CPU, CUDA, TensorRT o DirectML), OpenCV DNN, servidores de inferencia compatibles con ONNX como Triton Inference Server, y el propio backend `AsYoloDetector` de `newspaper-ocr`.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia ni imagenes por segundo para ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la informacion proporcionada, por lo que la comparacion es necesariamente cualitativa y la mayoria de campos quedan como no disponibles. Se incluyen alternativas de la misma categoria funcional (analisis de maquetacion de documentos y deteccion de objetos generica) sin cifras contrastadas.

| Modelo | Tarea | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| american-stories-onnx (layout) | Deteccion de regiones en periodicos historicos | no disponible | no aplica | no disponible | CC-BY-4.0 | HuggingFace (0 descargas) |
| american-stories-onnx (line) | Deteccion de lineas de texto | no disponible | no aplica | no disponible | CC-BY-4.0 | HuggingFace (0 descargas) |
| DocLayout-YOLO | Analisis de maquetacion de documentos | no disponible | no aplica | no disponible | no disponible | Repositorio publico en GitHub |
| Detectores genericos de maquetacion basados en YOLO o Detectron2 | Analisis de maquetacion | no disponible | no aplica | no disponible | variable segun proyecto | Repositorios publicos |

La diferencia principal frente a alternativas genericas es el dominio de entrenamiento: estos pesos estan especializados en escaneos de prensa historica estadounidense, mientras que los detectores genericos de maquetacion suelen entrenarse con documentos modernos y corpora como PubLayNet o DocLayNet.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al entrenarse sobre la coleccion *Chronicling America* el modelo refleja las caracteristicas de ese corpus: prensa estadounidense, principalmente en ingles, con determinados formatos de impresion y calidad de escaneo. Su rendimiento en prensa de otros paises, idiomas o epocas no esta evaluado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de detecciones falsas o de cajas mal ajustadas cuando la maquetacion difiere del dominio de entrenamiento.
- No se especifican las clases de salida, la resolucion de entrada esperada ni los umbrales de confianza recomendados, lo que obliga a calibrar el modelo en cada pipeline.
- Los parametros totales, el dataset de entrenamiento exacto y cualquier metrica de calidad estan sin documentar, lo que dificulta estimar su comportamiento antes de desplegarlo.
- La licencia declarada del repositorio es CC-BY-4.0, que permite uso comercial siempre que se atribuya la autoria. Sin embargo, conviene verificar la licencia aplicable al codigo y a los pesos originales de YOLOv8 de Ultralytics utilizados en el entrenamiento, asi como las condiciones del proyecto American Stories, antes de un uso comercial en produccion.
- El repositorio registra cero descargas y cero valoraciones, y esta creado y actualizado el 2026-09-12 segun los metadatos de HuggingFace, por lo que no existe validacion comunitaria ni historial de uso.
- Uno de los ficheros fue reemplazado en el pasado por una copia incorrecta, segun indica la propia model card; aunque la version actual se corrigio desde el Dropbox oficial, conviene verificar el md5 al descargar los pesos.
- La busqueda web realizada no ha devuelto informacion tecnica relevante sobre el modelo: los resultados obtenidos eran paginas de soporte de Microsoft sin relacion con el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NealCaren/american-stories-onnx
- Herramienta `newspaper-ocr` (backend `AsYoloDetector`): https://github.com/nealcaren/newspaper-ocr
- Proyecto American Stories (NeurIPS 2023): https://github.com/dell-research-harvard/AmericanStories
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la busqueda web realizada.
