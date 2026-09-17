# elvinguseinov/wildfire-detection-yolo11-yolo26-nano

## Resumen

El repositorio `elvinguseinov/wildfire-detection-yolo11-yolo26-nano` publica los pesos en PyTorch (`.pt`) de dos detectores de objetos de la familia YOLO en su variante Nano, entrenados especificamente para la deteccion de humo y fuego en tiempo real sobre dispositivos de borde. Su autor es elvinguseinov y la libreria de referencia es Ultralytics. El objetivo declarado es operar bajo restricciones estrictas de memoria, capacidad de computo y presupuesto energetico, tipicas de vehiculos aereos no tripulados (UAV) y sistemas embebidos como Raspberry Pi.

El modelo resuelve una tarea de deteccion de objetos con dos clases (`Smoke` y `Fire`) y devuelve cajas delimitadoras. Con 2,58 M de parametros (YOLOv11-Nano) y 2,37 M (YOLOv26-Nano), se situa en el rango mas ligero de la familia YOLO, lo que permite inferencia en el borde sin GPU dedicada de gama alta. Segun la model card, ambos modelos alcanzan 2,4 ms de latencia por inferencia en una NVIDIA T4.

Su relevancia actual es la de un componente listo para integraciones de vigilancia de incendios forestales donde el coste por nodo y el consumo energetico son los factores limitantes. Se distribuye con licencia MIT y sin datos de descargas ni de validacion por parte de la comunidad en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11-Nano y YOLOv26-Nano (detectores de objetos de una etapa, familia Ultralytics YOLO) |
| Parametros totales | 2,58 M (YOLOv11-Nano) y 2,37 M (YOLOv26-Nano) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen o un fotograma de video) |
| Tipos de cuantizacion | no disponible en la model card; se distribuyen pesos `.pt` en la precision original |
| Idiomas soportados | en (idioma declarado en la ficha; el modelo no procesa texto, las clases son `Smoke` y `Fire`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch), compatible con la libreria `ultralytics` |
| Tarea | Deteccion de objetos con cajas delimitadoras (bounding boxes) |
| Clases | `Smoke`, `Fire` (2 clases) |
| Tamano del repositorio | 0,0 GB segun la ficha de HuggingFace |

## Arquitectura y entrenamiento

Se trata de dos detectores de objetos de la familia YOLO en variante Nano, es decir, redes convolucionales de una sola etapa con un cabezal de prediccion densa sobre rejilla, disenadas para minimizar el coste computacional. La model card no detalla la topologia interna (bloques, mecanismos de atencion, funcion de perdida) ni la definicion concreta de la arquitectura YOLOv26-Nano, y tampoco se ha podido verificar en las fuentes publicas consultadas.

En cuanto al entrenamiento, la unica informacion disponible indica que ambos modelos se entrenaron y evaluaron sobre el denominado "Smoke-Fire Dataset". No se especifican el numero de imagenes, la composicion del conjunto, la resolucion de entrada, el numero de epocas, las tecnicas de aumento de datos ni si se aplicaron fases de ajuste fino posteriores. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras), ya que no son aplicables a un detector de objetos de este tipo en el sentido en que se describen en modelos de lenguaje. La model card se limita a declarar que los modelos se entrenaron y compararon buscando un equilibrio entre precision y las restricciones de hardware de los dispositivos de borde.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica instancias de las clases `Smoke` y `Fire` mediante cajas delimitadoras.
- Inferencia sobre flujos de video: al ser un modelo de vision por fotograma, puede aplicarse de forma secuencial sobre video para vigilancia continua.
- Operacion en tiempo real en hardware de borde: latencia declarada de 2,4 ms por inferencia en NVIDIA T4.
- Despliegue en sistemas embebidos y UAV: tamano de pesos del orden de megas, apto para dispositivos con memoria y computo limitados.
- Uso mediante la libreria Ultralytics: carga con `YOLO(model_path)`, `model.predict(...)` y utilidades asociadas (visualizacion, exportacion a otros formatos soportados por la libreria).
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificacion.
- No genera texto, codigo ni matematicas.
- No tiene capacidades multimodales mas alla de la vision: no procesa audio ni lenguaje natural.
- Capacidades multilingues: no aplica; el modelo no trabaja con texto.

## Casos de uso

- Patrullas de vigilancia forestal con UAV: el detector se ejecuta a bordo del dron y marca en tiempo real columnas de humo o focos de fuego sobre el video capturado, con 2,4 ms de latencia por fotograma en GPU T4, lo que permite reaccionar antes de que el incendio se propague.
- Nodos de observacion en torres con Raspberry Pi: al tener 2,4-2,6 M de parametros, el modelo cabe en placas embebidas y puede procesar el flujo de una camara fija alimentada por panel solar o bateria, reduciendo el coste de despliegue por punto de vigilancia.
- Deteccion temprana en entornos industriales: plantas de reciclaje, vertederos, almacenes de biomasa o silos donde la combustion espontanea es un riesgo; el modelo vigila camaras IP existentes y activa alertas al detectar humo antes de que haya llama visible.
- Pre-filtrado en enlaces de comunicacion limitados: el nodo de borde ejecuta la deteccion localmente y solo transmite la alerta y el recorte del fotograma cuando hay una deteccion positiva, lo que reduce drasticamente el ancho de banda necesario en zonas sin cobertura movil.
- Integracion en plataformas de gestion de emergencias: el modelo actua como sensor dentro de un pipeline que consume los eventos de deteccion y los correlaciona con coordenadas GPS y datos meteorologicos para priorizar la respuesta.
- Analisis retrospectivo de grabaciones: procesamiento por lotes de archivos de video de camaras forestales para localizar los primeros indicios de humo y reconstruir la cronologia de un incendio.
- Linea base para investigacion en vision aplicada a incendios: con licencia MIT y pesos ligeros, sirve como referencia reproducible para comparar tecnicas de deteccion de humo y fuego en entornos de recursos limitados.
- Prototipado rapido de productos de teledeteccion: la API de Ultralytics permite validar en pocas lineas de Python si el modelo cubre un escenario concreto antes de invertir en entrenamiento propio.

## Benchmarks y rendimiento

Resultados declarados en la model card, medidos sobre el Smoke-Fire Dataset con una GPU NVIDIA T4:

| Modelo | Parametros (M) | mAP@50 | mAP@50-95 | Latencia (ms) |
|---|---|---|---|---|
| YOLOv11-Nano | 2,58 | 0,760 | 0,443 | 2,4 |
| YOLOv26-Nano | 2,37 | 0,755 | 0,450 | 2,4 |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo, comparaciones con modelos de la misma familia sobre COCO u otros conjuntos), ni curvas de precision-retorno, ni metricas de recall por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. A partir del numero de parametros, los pesos ocupan aproximadamente 10 MB en FP32 y unos 5 MB en FP16, por lo que el consumo de memoria en inferencia es inferior a 1 GB en la mayoria de configuraciones y queda dominado por el tamano del lote y la resolucion de entrada.
- GPU recomendadas: la model card documenta las mediciones en NVIDIA T4. Cualquier GPU moderna de consumo (por ejemplo, RTX 3060, RTX 4090) es sobradamente suficiente; tambien lo son A100 o H100, aunque resultan desproporcionadas para este tamano de modelo.
- GPU de consumo: si cabe en cualquier GPU de consumo actual e incluso en GPUs integradas, dado el reducido numero de parametros.
- CPU y dispositivos embebidos: es el escenario objetivo declarado. La model card menciona UAV y sistemas embebidos como Raspberry Pi. No se aportan latencias medidas en CPU ni en Raspberry Pi, solo en T4.
- Opciones de despliegue: la model card solo documenta el uso mediante la libreria `ultralytics` con los pesos `.pt` descargados a traves de `huggingface_hub`. La libreria Ultralytics permite exportar a otros formatos, pero esos formatos y sus latencias no se detallan en la informacion proporcionada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un detector de objetos.
- Latencia y throughput: 2,4 ms por inferencia en NVIDIA T4 para ambos modelos, segun la model card. No se indica si la medicion corresponde a un unico fotograma, con o sin preprocesado, ni el tamano de lote utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | mAP en Smoke-Fire Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|
| YOLOv11-Nano (este repositorio, ajustado a humo/fuego) | 2,58 M | mAP@50 0,760 / mAP@50-95 0,443 | MIT | HuggingFace, pesos `.pt` |
| YOLOv26-Nano (este repositorio, ajustado a humo/fuego) | 2,37 M | mAP@50 0,755 / mAP@50-95 0,450 | MIT | HuggingFace, pesos `.pt` |
| YOLOv8-Nano (pesos genericos de Ultralytics, referencia publica) | 3,2 M aproximadamente | no disponible (no evaluado sobre Smoke-Fire Dataset) | AGPL-3.0 en la distribucion de Ultralytics | `ultralytics`, pesos `.pt` |
| YOLOv11-Nano (pesos genericos de Ultralytics, referencia publica) | 2,6 M aproximadamente | no disponible (no evaluado sobre Smoke-Fire Dataset) | AGPL-3.0 en la distribucion de Ultralytics | `ultralytics`, pesos `.pt` |

Nota: los recuentos de parametros de las variantes genericas de Ultralytics se incluyen como referencia publica general y no proceden de la informacion facilitada en esta busqueda. Sus resultados sobre COCO no son comparables con el mAP del Smoke-Fire Dataset que reporta este repositorio, por lo que no se han incluido cifras cruzadas. No se dispone de datos de otras alternativas especificas de deteccion de incendios o humo.

## Limitaciones y advertencias

- Sin validacion por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de reproducibilidad ni de comportamiento en produccion.
- Cobertura de clases muy reducida: solo `Smoke` y `Fire`; cualquier otro objeto o situacion queda fuera del alcance del modelo.
- Riesgo de falsos positivos: no se documenta el comportamiento ante nubes, niebla, vapor de agua, polvo en suspension o iluminacion rasante, que son fuentes habituales de confusion en deteccion de humo. Tampoco se aportan matrices de confusion ni recall por clase.
- Precision moderada en el umbral estricto: el mAP@50-95 se situa entre 0,443 y 0,450, lo que implica localizacion imperfecta de las cajas cuando se exige un IoU alto; para alertas tempranas conviene definir umbrales de confianza conservadores.
- Diferencias poco significativas entre ambos modelos: con mAP@50 de 0,760 frente a 0,755 y el mismo mAP@50-95 practicamente, no hay informacion sobre intervalos de confianza ni sobre la variabilidad entre ejecuciones, por lo que la eleccion entre uno u otro no puede justificarse solo con estos datos.
- Datos de entrenamiento no documentados: se desconoce el tamano, la procedencia y la distribucion geografica y temporal del Smoke-Fire Dataset; esto impide estimar el sesgo geografico, estacional, de sensor o de condiciones de iluminacion (dia/noche).
- Arquitectura no verificable: la model card no aporta enlace a documentacion tecnica de YOLOv26-Nano, por lo que no se puede comprobar su definicion ni sus diferencias con YOLOv11-Nano a partir de la informacion disponible.
- Metricas de latencia limitadas: solo se reporta latencia en NVIDIA T4; no hay datos para CPU, Raspberry Pi ni otros aceleradores, que son precisamente los destinos declarados.
- Restricciones de licencia: el modelo se publica bajo MIT, lo que permite uso comercial y modificacion con atribucion. Conviene revisar, no obstante, la licencia de la libreria Ultralytics si se integra en un producto, ya que su distribucion se rige por AGPL-3.0 y puede requerir una licencia comercial.
- Sin informacion sobre robustez: no se documentan pruebas de degradacion ante compresion de video, baja resolucion, desenfoque de movimiento o cambios de camara.
- Fecha de publicacion poco habitual: la ficha indica creacion y actualizacion en septiembre de 2026, dato que conviene contrastar junto con la procedencia del modelo antes de adoptarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elvinguseinov/wildfire-detection-yolo11-yolo26-nano
- Libreria Ultralytics (documentacion del framework utilizado): https://docs.ultralytics.com/
- Libreria `huggingface_hub` (utilizada en el ejemplo de descarga de la model card): https://huggingface.co/docs/huggingface_hub
- Enlaces a paper, repositorio de entrenamiento, dataset Smoke-Fire o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo ni con deteccion de incendios; los resultados obtenidos correspondian a comercios de ropa sin relacion con el contenido de esta ficha.
