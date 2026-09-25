# beaunix/apples-detection-model

## Resumen

`beaunix/apples-detection-model` es un modelo de deteccion de objetos derivado de Ultralytics YOLOv8, especializado en la localizacion y el recuento de manzanas en imagenes de cultivo. Lo publica el usuario beaunix como componente de vision del proyecto AppleYieldCrop, una aplicacion orientada a la estimacion de cosecha en explotaciones fruticolas. El modelo se apoya integramente en la arquitectura y el utillaje de entrenamiento abiertos de Ultralytics, sin modificaciones estructurales declaradas.

Se trata de un detector de la variante YOLOv8-medium, publicado en dos formatos: un checkpoint nativo de Ultralytics (`appleyieldcrop-det.pt`), util para inferencia y reentrenamiento, y una exportacion ONNX (`appleyieldcrop-det.onnx`) pensada para ejecucion en cualquier entorno compatible con ONNX Runtime. El problema que resuelve es acotado pero concreto: transformar fotografias de arboles o lineas de clasificacion en un conteo automatizado de frutos, una tarea que manualmente consume mucho tiempo y es propensa a error.

Su relevancia es limitada y muy sectorial: no compite en capacidades generales con modelos fundacionales, sino que aporta un detector afinado para un dominio especifico (pomologia) a partir de un conjunto de datos pequeno. No hay informacion publica sobre benchmarks, parametros exactos ni volumen de descargas (el repositorio registra 0 descargas y 0 likes en el momento de la consulta), por lo que cualquier evaluacion debe hacerse con sus propias imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-medium (detector de objetos de una sola etapa, red neuronal convolucional) |
| Parametros totales | no disponible en la model card (la variante YOLOv8m de Ultralytics se documenta habitualmente en torno a 25,9 M de parametros; cifra no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en FP32 en los formatos .pt y .onnx; no se declaran variantes INT8 ni FP16) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch/Ultralytics (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8 en su escala medium, un detector convolucional de una sola etapa con cabeza de deteccion ancor-free y asignacion de etiquetas tipo task-aligned. La model card no detalla la configuracion de la red, la resolucion de entrada ni hiperparametros de entrenamiento, mas alla de identificar la base como Ultralytics YOLOv8 y la tarea como deteccion de manzanas. No se declara ningun cambio arquitectonico respecto a la base original.

En cuanto a datos, el autor indica que el conjunto de entrenamiento consta de aproximadamente 990 imagenes. Sobre el dataset base de unas 640 imagenes creado originalmente por Arfiani Nur Sayidah en Roboflow Universe (linaje "Apple Sorting", CC BY 4.0), beaunix anadio alrededor de 300 imagenes anotadas manualmente con cajas delimitadoras propias, con el objetivo declarado de mejorar la generalizacion en escenas de huerto reales. No se especifica el numero de epocas, la composicion exacta del split de validacion, ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino en varias fases. Tampoco hay constancia de RLHF, DPO ni de ninguna innovacion tecnica adicional.

## Capacidades

- Deteccion de objetos: localiza manzanas en imagenes mediante cajas delimitadoras, con la clase unica para la que fue entrenado.
- Recuento de frutos: la salida del detector permite derivar un conteo por imagen, base del calculo de rendimiento estimado.
- Inferencia en dos runtimes: el checkpoint `.pt` funciona con la libreria Ultralytics y el `.onnx` con ONNX Runtime.
- Reentrenamiento y ajuste fino: el formato `.pt` es apto para continuar el entrenamiento con nuevos datos o dominios.
- Procesamiento de imagenes individuales: no se declara soporte de video, flujo continuo ni procesamiento por lotes mas alla de lo que permita el runtime elegido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente visual.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision multimodal, audio): ninguna declarada.

## Casos de uso

- Estimacion de cosecha en explotaciones fruticolas: a partir de fotografias de arboles, el modelo cuenta frutos y permite extrapolar el rendimiento por parcela, sustituyendo el conteo manual por muestreo.
- Planificacion de la recoleccion: con conteos por fila o por arbol, el productor puede priorizar las zonas con mayor carga de fruta y organizar cuadrillas y calendario.
- Monitorizacion con dron o camara movil: al ser un modelo convolucional ligero y exportable a ONNX, puede ejecutarse sobre imagenes aereas o capturas de movil en campo, incluso sin conectividad.
- Integracion en aplicaciones agricolas de gestion: el resultado de la deteccion se puede volcar a un sistema de registro de parcelas para hacer seguimiento historico de la produccion.
- Control de calidad en linea de clasificacion: situado sobre una cinta transportadora, el detector puede contar y verificar la presencia de manzanas en cada lote.
- Ajuste a nuevas variedades o condiciones de luz: el checkpoint `.pt` permite reentrenar con imagenes propias de la variedad o del entorno concreto del cliente.
- Investigacion agronomica: para estudios que correlacionan carga de fruta con variables como poda, riego o climatologia, el modelo automatiza la fase de conteo.
- Prototipado rapido en el borde: la exportacion ONNX facilita desplegar el detector en dispositivos de baja potencia dentro de una arquitectura de agricultura de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion (mAP, precision, recall, F1) ni comparaciones cuantitativas con otros detectores. Tampoco se documentan curvas de entrenamiento ni el rendimiento obtenido en el conjunto de validacion.

| Benchmark | Resultado |
|---|---|
| mAP@50 | no disponible |
| mAP@50-95 | no disponible |
| Precision / recall | no disponible |
| Latencia de inferencia | no disponible |

## Requisitos de hardware

- VRAM para inferencia: no especificada por el autor. Como referencia, un modelo YOLOv8m en FP32 ocupa del orden de 100 MB de pesos, por lo que cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM; estas cifras son estimaciones derivadas del tamano tipico de la arquitectura, no datos publicados en la model card.
- GPU recomendadas: no declaradas. Por el tamano del modelo, es viable tanto en GPU de centro de datos (A100, H100) como en GPU de consumo (RTX 3060, RTX 4090) e incluso en dispositivos de borde con aceleracion.
- GPU de consumo: si, cabe con margen amplio en cualquier GPU de consumo moderna e incluso en hardware integrado al ejecutarse la variante ONNX.
- Opciones de despliegue: ONNX Runtime (soportado explicitamente en la model card), libreria Ultralytics para el `.pt`. Otros runtimes compatibles con ONNX (TensorRT, OpenVINO, etc.) son tecnicamente posibles, pero no estan confirmados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparacion se limita a caracteristicas de arquitectura y licencia. Las cifras de otras variantes YOLO corresponden a la documentacion publica de Ultralytics, no a este modelo concreto.

| Modelo | Parametros (aprox.) | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| beaunix/apples-detection-model | no disponible (base YOLOv8m) | Deteccion de manzanas | AGPL-3.0 | HuggingFace, 0 descargas |
| Ultralytics/YOLOv8m | ~25,9 M | Deteccion general (COCO) | AGPL-3.0 / Enterprise | Repositorio oficial Ultralytics |
| Ultralytics/YOLOv8n | ~3,2 M | Deteccion general (COCO) | AGPL-3.0 / Enterprise | Repositorio oficial Ultralytics |
| Ultralytics/YOLOv8x | ~68,2 M | Deteccion general (COCO) | AGPL-3.0 / Enterprise | Repositorio oficial Ultralytics |

Frente a un YOLOv8 generico preentrenado en COCO, este modelo aporta la ventaja de estar afinado para la clase manzana, con la contrapartida de un conjunto de entrenamiento muy reducido (unas 990 imagenes) y de carecer de metricas publicadas que permitan verificar su calidad.

## Limitaciones y advertencias

- Ausencia total de metricas: no se publican mAP, precision ni recall, de modo que no es posible evaluar la fiabilidad del detector sin probarlo uno mismo.
- Dataset muy pequeno: aproximadamente 990 imagenes en total, con solo unas 300 anotadas por el autor. Es un volumen reducido que limita la generalizacion a nuevas variedades, condiciones de iluminacion, fondos y camaras.
- Sesgo de dominio probable: el conjunto base proviene de un dataset de clasificacion de manzanas en Roboflow, lo que puede introducir sesgos hacia determinadas variedades, estados de maduracion o encuadres.
- Alucinacion y falsos positivos: como cualquier detector, puede confundir manzanas con otros objetos esfericos o generar detecciones espurias en oclusiones densas de follaje, con impacto directo en el recuento.
- Clase unica: no distingue variedades, estados de madurez ni frutos danados; solo detecta manzanas como categoria generica.
- Restriccion de licencia: AGPL-3.0, heredada de Ultralytics. Esta licencia obliga a liberar el codigo fuente de las obras derivadas que se distribuyan o se ofrezcan como servicio en red, lo que puede ser incompatible con productos propietarios. El autor indica explicitamente que no se adquirio licencia Enterprise.
- Licencia de los datos: el dataset base es CC BY 4.0 y requiere atribucion a Arfiani Nur Sayidah; el autor la incluye, pero conviene verificar los terminos si se reutiliza el conjunto.
- Repositorio sin traccion: 0 descargas y 0 likes, sin historial de mantenimiento mas alla de la fecha de creacion y actualizacion, lo que implica ausencia de soporte y de validacion por parte de la comunidad.
- Formatos y resolucion de entrada no documentados: no se especifica el tamano de imagen esperado por el ONNX ni si requiere redimensionado, normalizacion o preprocesado concreto, lo que puede provocar resultados erroneos si se integra sin cuidado.
- Sin soporte multimodal ni de texto: no puede integrarse en flujos que requieran explicaciones en lenguaje natural o interaccion conversacional.
- Uso comercial: condicionado a la licencia AGPL-3.0; para uso en produccion cerrada seria necesario adquirir una licencia Enterprise de Ultralytics o publicar el codigo derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beaunix/apples-detection-model
- Repositorio de Ultralytics YOLOv8: https://github.com/ultralytics/ultralytics
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
- Dataset base original de Arfiani Nur Sayidah en Roboflow Universe ("Apple Sorting", CC BY 4.0): no se proporciona URL directa en la model card
- Paper de YOLOv8 / documentacion oficial: no disponible en la informacion proporcionada
- Blog o demo del proyecto AppleYieldCrop: no disponible

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el contenido y se han descartado.
