# Ianevan/boton-floral-detector

## Resumen

`Ianevan/boton-floral-detector` es un modelo de deteccion de objetos publicado en Hugging Face por el usuario Ianevan, orientado a una unica clase: `flor_nueva` (boton floral). Segun la model card, el entrenamiento se realizo con una arquitectura YOLOv11, aunque el autor indica que los pesos son compatibles con el motor de inferencia de YOLOv8 y que la configuracion del dataset se recoge en un archivo `data.yaml`. La libreria declarada es `ultralytics` y el `pipeline_tag` es `object-detection`.

Se trata de un modelo de vision por computador de proposito muy especifico, no de un modelo de lenguaje: no procesa texto, no razona y no admite instrucciones. Su utilidad potencial esta en el ambito agronomo (conteo de yemas o botones florales en cultivos lenosos), donde un detector de una sola clase puede integrarse en flujos de muestreo, estimacion de carga o robotica agricola.

La informacion publicada es muy escasa: el repositorio aparece con 0.0 GB de tamano, 0 descargas, 1 like y no se documentan parametros, resolucion de entrada, tamano ni composicion del dataset, metricas de validacion ni variante concreta de la familia YOLO. Cualquier evaluacion seria del modelo requiere descargar los pesos y validarlos sobre imagenes propias del cultivo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11 (segun la model card), compatible con el motor de inferencia de YOLOv8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser compatible con Ultralytics, cabria exportar a ONNX, TensorRT, OpenVINO o TFLite, pero no se confirma ni se documenta |
| Idiomas soportados | no aplica (no procesa lenguaje natural); metadatos de idioma no disponibles |
| Licencia | discrepancias: la cabecera YAML de la model card declara `mit`, mientras que los metadatos de Hugging Face indican "no disponible"; conviene verificar antes de uso comercial |
| Formato de pesos | no especificado; el ecosistema Ultralytics distribuye habitualmente checkpoints `.pt` de PyTorch, dato no confirmado en la informacion proporcionada |
| Tarea | Deteccion de objetos (bounding boxes) |
| Clases | 1 (`flor_nueva`) |
| Framework / libreria | Ultralytics |
| Archivos auxiliares | `data.yaml` (configuracion del dataset) |
| Repositorio | 0.0 GB, 0 descargas, 1 like |
| Fechas | creado 2025-10-30, actualizado 2026-10-23 |

## Arquitectura y entrenamiento

El autor declara una arquitectura YOLOv11 entrenada para deteccion de objetos de una sola clase, con pesos compatibles con el motor de inferencia de YOLOv8. Se trata, por tanto, de un detector denso de una etapa (one-stage), con las caracteristicas habituales de la familia YOLO: extraccion de caracteristicas mediante backbone convolucional, cuello de agregacion multiescala y cabecera de prediccion de cajas y confianza por celda. No se especifica la variante de tamano (n, s, m, l o x), ni la resolucion de entrenamiento, ni el numero de epochs.

No hay informacion sobre el dataset: se desconoce el numero de imagenes, la procedencia, el cultivo concreto, las condiciones de captura (campo, invernadero, laboratorio), el dispositivo (movil, camara fija, dron) ni el procedimiento de anotacion. Tampoco se documentan tecnicas de aumento de datos, inicializacion desde pesos preentrenados en COCO, ni procesos de ajuste posteriores. No se menciona ningun tipo de alineamiento o refinamiento por preferencias, algo por otra parte ajeno a un detector.

La unica innovacion reseñable que aporta la model card es la compatibilidad cruzada declarada entre arquitectura de entrenamiento (YOLOv11) y motor de inferencia (YOLOv8), lo que en la practica permite cargar los pesos con versiones del paquete `ultralytics` que sigan soportando esa ruta de carga. Es un detalle relevante para el despliegue, pero no constituye una aportacion tecnica original.

## Capacidades

- Deteccion de objetos de una unica clase: localiza botones florales (`flor_nueva`) y devuelve cajas delimitadoras con su puntuacion de confianza.
- Inferencia sobre imagenes estaticas y, presumiblemente, sobre video o flujo de camara, al emplear el motor de Ultralytics (no confirmado explicitamente en la model card).
- Integracion con el ecosistema Ultralytics: carga mediante la API de Python, validacion con `model.val()` y exportacion a otros formatos si la version de la libreria lo permite.
- Compatibilidad declarada con el motor de inferencia de YOLOv8, lo que facilita su uso en pipelines ya existentes basados en esa version.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje.
- No dispone de modo "thinking", vision-lenguaje, audio ni multimodalidad. Es exclusivamente vision.
- No realiza segmentacion de instancias ni clasificacion de estados fenologicos: solo deteccion de cajas para una clase.

## Casos de uso

- Conteo de botones florales en campo: captura de imagenes con movil o camara compacta por parte de un tecnico y recuento automatizado de yemas para estimar la carga floral de la parcela. La ventaja es la reduccion de subjetividad frente al conteo manual, aunque exige validar el modelo sobre el cultivo concreto.
- Estimacion temprana de cosecha: integrado en un muestreo periodico por parcelas, el recuento de botones florales alimenta un modelo agronomico de produccion. El detector actua como sensor visual y no requiere infraestructura de GPU en campo si se exporta a un formato ligero.
- Planificacion del aclareo (thinning): la densidad de botones detectada por imagen permite priorizar las parcelas o ramas que requieren intervencion, optimizando la mano de obra en frutales.
- Seguimiento fenologico automatizado: colocacion de camaras fijas o trampas con captura programada para registrar la evolucion de la floracion a lo largo de la temporada, generando series temporales de conteos por unidad de imagen.
- Robotica agricola: modulo de percepcion para un brazo o plataforma movil que necesite localizar botones florales antes de una accion mecanica (desbrote, pulverizacion dirigida). Al ser un detector de una clase, la salida es directamente utilizable como coordenadas para el controlador.
- Aplicacion movil de asistencia al agricultor: despliegue en el dispositivo mediante exportacion a TFLite u ONNX si la conversion es viable, permitiendo inferencia sin conectividad en parcelas remotas.
- Control de calidad en vivero: verificacion de la presencia y densidad de botones en lotes de planta antes de su comercializacion, con criterios homogeneos entre operarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall, curva F1, matriz de confusion ni metricas por clase, y tampoco se documenta el conjunto de validacion empleado. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende de la variante de YOLOv11 utilizada (n, s, m, l o x) y de la resolucion de entrada, datos que no se especifican.
- Como referencia general de la familia YOLO, y no como dato confirmado de este modelo: las variantes mas pequenas suelen ejecutarse en CPU con latencias de decenas a cientos de milisegundos por imagen, y las variantes grandes requieren GPU para tiempo real.
- GPU recomendadas: no disponible. En terminos generales, una RTX 4090, A100 o H100 cubren con holgura cualquier variante de la familia; una GPU de consumo de gama media seria suficiente para variantes pequenas.
- Compatibilidad con GPU de consumo: probable pero no confirmada, al no conocerse el tamano de los pesos.
- Opciones de despliegue: API de Python de Ultralytics como via principal; exportacion a ONNX, TensorRT, OpenVINO o TFLite si la version de la libreria lo soporta (no documentado por el autor). No se menciona soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a un detector.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Ianevan/boton-floral-detector` | Detector YOLOv11 de una etapa | 1 (`flor_nueva`) | no disponible | no disponible | `mit` en la model card, "no disponible" en metadatos HF | Hugging Face, 0 descargas |
| Checkpoints preentrenados de la familia YOLO (Ultralytics) | Detector de una etapa | 80 (COCO) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | a verificar (Ultralytics emplea AGPL-3.0 en su version abierta) | Ampliamente disponibles |
| Detectores transformer tipo DETR / RT-DETR | Detector de una o dos etapas | Configurable | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | a verificar segun implementacion | Repositorios publicos |

La comparacion cuantitativa no es posible con los datos disponibles: no se conocen parametros, mAP ni coste de inferencia de este modelo. La diferencia funcional principal frente a los detectores genericos es la especializacion en una sola clase agronomica, lo que reduce el espacio de salida pero tambien limita su reutilizacion fuera de ese dominio. Cualquier comparacion de rendimiento exigiria evaluar los tres modelos sobre el mismo conjunto de imagenes de botones florales.

## Limitaciones y advertencias

- Model card practicamente vacia: sin metricas, sin descripcion del dataset, sin variante de arquitectura y sin instrucciones de uso. No es posible estimar su calidad real.
- Repositorio de 0.0 GB y 0 descargas: conviene verificar que los pesos estan efectivamente subidos y que el archivo `data.yaml` esta presente, ya que el tamano declarado sugiere que el contenido podria no haberse materializado.
- Ambiguedad de licencia: la cabecera YAML indica `mit`, pero los metadatos de Hugging Face no la recogen. Antes de un uso comercial debe confirmarse por escrito con el autor.
- Riesgo de sobreajuste al dominio de captura original: al desconocerse el dataset, el modelo puede fallar ante cambios de iluminacion, fondo, distancia focal, cultivar o estado fenologico.
- Falsos positivos y falsos negativos sin cuantificar: no hay umbral de confianza recomendado ni curva precision-recall para elegirlo.
- Una sola clase: no distingue boton floral de flor abierta, fruto recien cuajado u otras estructuras visualmente proximas, salvo que el entrenamiento lo haya cubierto de forma implicita (no documentado).
- Sin garantia de calibracion de las cajas para recuento absoluto: en problemas de conteo, los solapamientos y oclusiones entre yemas pueden degradar el recuento.
- Sesgos desconocidos: no se documenta la distribucion geografica, la especie vegetal ni las condiciones de captura del dataset, por lo que no pueden evaluarse sesgos de dominio.
- Sin soporte documentado de tareas distintas a la deteccion: no debe emplearse para segmentacion, clasificacion fenologica ni estimacion de recuento directo sin postproceso.
- Proyecto sin mantenimiento aparente ni comunidad: no hay issues, discusiones ni versionado que permitan anticipar correcciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ianevan/boton-floral-detector
- Documentacion de Ultralytics (framework declarado): no incluida en la informacion proporcionada
- Paper o blog del autor: no disponible
- Repositorio de codigo asociado: no disponible
- Demo o Space: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el.
