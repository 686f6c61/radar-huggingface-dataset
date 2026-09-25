# beaunix/smart-crack-vision

## Resumen

SmartCrackLens es un modelo de vision por computador especializado en la deteccion y segmentacion de grietas sobre superficies estructurales como carreteras, muros y otra infraestructura civil. Lo desarrolla beaunix (Bryan David Castano) y se publica como un checkpoint de segmentacion de instancias de una sola clase (`crack`) construido sobre la arquitectura Ultralytics YOLOv8 en su variante nano. El modelo alimenta el agente SmartCrackLens, cuyo objetivo declarado es combinar deteccion de grietas con clasificacion de severidad.

El modelo parte del modelo base Ultralytics/YOLOv8 y se entrena sobre el Crack Segmentation Dataset distribuido por Ultralytics (4.029 imagenes anotadas de grietas en carretera y muro, con una unica clase `crack`), originalmente procedente de Roboflow Universe y marcado como dominio publico. Se distribuye en dos formatos: un checkpoint nativo `.pt` de Ultralytics, util para inferencia y reentrenamiento, y una exportacion ONNX para su uso en cualquier entorno de ONNX Runtime.

Su relevancia actual es la de un componente ligero y desplegable en el borde para tareas de inspeccion de infraestructura, donde la latencia y el ancho de banda suelen favorecer la inferencia local sobre la nube. Se publica bajo licencia AGPL-3.0, la misma que arrastra el ecosistema Ultralytics al no haberse adquirido una licencia Enterprise, dato relevante para cualquier integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-nano, segmentacion de instancias (Ultralytics) |
| Parametros totales | no disponible (variante nano de YOLOv8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` y `.onnx` sin especificar cuantizacion) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase son en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | Ultralytics `.pt` (checkpoint) y ONNX (`.onnx`) |
| Clase detectada | unica clase `crack` |
| Tarea | Segmentacion de instancias (image-segmentation) |
| Modelo base | Ultralytics/YOLOv8 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8 de Ultralytics en su variante nano orientada a segmentacion de instancias. YOLOv8 es una red convolucional de deteccion/segmentacion de una sola etapa, con un backbone y un cuello tipo C2f y una cabeza de prediccion desacoplada; en la tarea de segmentacion incorpora una rama de mascaras por instancia ademas de las cajas delimitadoras. La eleccion de la variante nano prioriza latencia y huella de memoria reducidas para despliegue en el borde.

El entrenamiento se realiza sobre el Crack Segmentation Dataset de Ultralytics, que agrupa 4.029 imagenes anotadas de grietas en carreteras y muros con una unica clase `crack`. El dataset procede de Roboflow Universe (proyecto de la Universidad, 2022) y Ultralytics lo distribuye marcado como dominio publico. No se documentan en la informacion disponible detalles sobre numero de epocas, aumentos de datos, resolucion de entrenamiento, funcion de perdida exacta ni la existencia de fases de ajuste adicionales (RLHF/DPO no aplican a un modelo de vision). Tampoco se describe ninguna innovacion tecnica propia mas alla del uso del pipeline estandar de Ultralytics.

## Capacidades

- Segmentacion de instancias de grietas: genera mascaras por instancia ademas de las detecciones para la clase unica `crack`.
- Deteccion de grietas sobre superficies estructurales: carreteras, muros y elementos de infraestructura civil.
- Exportacion a ONNX para inferencia independiente del framework de entrenamiento, mediante ONNX Runtime.
- Checkpoint `.pt` apto tanto para prediccion como para fine-tuning y reentrenamiento con la libreria Ultralytics.
- Uso como componente de vision dentro de un agente (SmartCrackLens) orientado a clasificacion de severidad, aunque la clasificacion de severidad no se documenta como salida directa del modelo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, procesamiento de lenguaje, vision general (mas alla de la clase entrenada), audio ni modo de razonamiento explicito.

## Casos de uso

- Inspeccion de carreteras: analisis de fotografias o fotogramas de calzada para localizar y segmentar grietas, generando mascaras que permiten estimar longitud y trazado de la fisura sobre la imagen.
- Monitorizacion de estructuras de hormigon: deteccion de fisuras en muros y paramentos a partir de capturas de dron o camara fija, con salida segmentada util para priorizar revisiones.
- Despliegue en el borde: al tratarse de la variante nano de YOLOv8, el modelo esta pensado para ejecutarse en dispositivos con recursos limitados o en campo, donde la conectividad es escasa y conviene procesar localmente.
- Preprocesado para clasificacion de severidad: las mascaras de grieta pueden alimentar un paso posterior (dentro del agente SmartCrackLens) que estime gravedad segun area, ancho o extension de la fisura.
- Integracion en pipelines de mantenimiento: exportado a ONNX, el modelo puede insertarse en servicios de inspeccion automatizada que procesen lotes de imagenes y devuelvan detecciones y mascaras.
- Reentrenamiento especifico: el checkpoint `.pt` permite ajustar el modelo a un dominio concreto (por ejemplo, un tipo de pavimento o una camara determinada) con el flujo de entrenamiento de Ultralytics.
- Aplicaciones de investigacion y prototipado: por su tamano reducido y licencia AGPL-3.0, sirve como punto de partida en proyectos academicos de vision aplicada a infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, IoU de mascara ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por tratarse de la variante nano de YOLOv8 cabe esperar una huella reducida, apta incluso para CPU, aunque no se aportan cifras oficiales.
- GPU recomendadas: no disponible; la variante nano esta disenada para funcionar tambien sin GPU dedicada y en hardware de borde.
- Compatibilidad con GPU de consumo: no disponible como dato confirmado, si bien la escala nano del modelo sugiere que podria ejecutarse en GPU de consumo e incluso en CPU.
- Opciones de despliegue: Ultralytics (carga del `.pt` con `YOLO(...)`) y ONNX Runtime (carga del `.onnx` con `onnxruntime`). No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales conocidas de la familia YOLOv8 y de alternativas genericas de segmentacion para deteccion de grietas.

| Modelo | Tipo | Clase(s) | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| beaunix/smart-crack-vision | YOLOv8-nano seg | `crack` | `.pt`, `.onnx` | AGPL-3.0 | Especifico para grietas; datos de entrenamiento publicos |
| Ultralytics YOLOv8-seg (nano) | YOLOv8-nano seg | COCO (80 clases) | `.pt`, ONNX | AGPL-3.0 | Modelo general, requeriria fine-tuning para grietas |
| Ultralytics YOLOv8-seg (mayor escala) | YOLOv8 seg | COCO (80 clases) | `.pt`, ONNX | AGPL-3.0 | Mayor capacidad a costa de mas computo |
| Mask R-CNN (familia generica) | Deteccion + mascara | Configurable | Distintos | Variable | Alternativa de dos etapas, tipicamente mas pesada |

Los datos cuantitativos de rendimiento para esta comparativa no estan disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo se entrena solo con el Crack Segmentation Dataset, por lo que su comportamiento puede degradarse fuera de esa distribucion (otros tipos de superficie, iluminacion o camara).
- Riesgo de falsos positivos y negativos: no se aportan metricas de precision ni recall, de modo que el error real del modelo en produccion es desconocido.
- Ambito limitado: detecta una unica clase (`crack`); no reconoce otros defectos ni objetos, ni clasifica severidad de forma nativa pese a la orientacion del proyecto hacia la severidad.
- Limitaciones de idioma: no aplica (modelo de vision); las etiquetas de clase estan en ingles.
- Restricciones de licencia: AGPL-3.0 es una licencia copyleft fuerte; su uso en productos o servicios propietarios puede exigir liberar el codigo derivado, salvo que se adquiera una licencia Enterprise de Ultralytics. Este punto es critico para uso comercial.
- Modelo sin traccion comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de validacion externa.
- Despliegue: la ausencia de datos sobre cuantizacion y de benchmarks de latencia obliga a medir el rendimiento en el hardware objetivo antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/beaunix/smart-crack-vision
- Repositorio del proyecto SmartCrackLens: https://github.com/BeauBryanDev/SmartCrackLens
- Perfil del autor en HuggingFace: https://huggingface.co/beaunix
- Dataset Crack Segmentation (Ultralytics): https://docs.ultralytics.com/datasets/segment/crack-seg
- Dataset original en Roboflow Universe: https://universe.roboflow.com/university-bswxt/crack-bphdr
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Articulo relacionado sobre deteccion de grietas con vision AI: https://www.next.gr/ai/generative-ai/crack-detection-in-infrastructure-using-vision-ai
