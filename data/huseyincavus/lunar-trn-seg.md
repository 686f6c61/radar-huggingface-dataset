# huseyincavus/lunar-trn-seg

## Resumen

lunar-trn-seg es un modelo de segmentación de instancias basado en YOLO26s-seg, desarrollado por huseyincavus y entrenado sobre el conjunto de datos del NASA Crater Detection Challenge. Su objetivo es detectar y segmentar crateres lunares en imagenes de relieve sombreado sinteticas, una tarea clave para la navegacion relativa al terreno (Terrain-Relative Navigation, TRN) en misiones de aterrizaje lunar. El modelo convierte las mascaras de instancia en elipses mediante `cv2.fitEllipse`, lo que permite capturar la rotacion de los crateres, un aspecto que las detecciones por caja delimitadora no pueden representar.

El modelo se distribuye a traves de la libreria Ultralytics y esta pensado como componente de investigacion para pipelines de vision artificial en exploracion espacial. Con 4.150 renders sinteticos de 2.592x2.048 pixeles y una resolucion de inferencia de 1024, el modelo logra una puntuacion CDA de 91,97 en el conjunto de validacion, superando en 15,7 puntos a las lineas base basadas en cajas. Es relevante ahora porque aborda la brecha entre deteccion y segmentacion en un dominio donde la orientacion geometrica de los crateres es critica para la navegacion autonoma.

A pesar de sus buenos resultados en el dominio sintetico, el propio autor advierte que la transferencia zero-shot a imagenes lunares reales es deficiente (mAP50 aproximado de 0,03), por lo que existe un modelo complementario fine-tuneado sobre imagenes reales. Se trata de un modelo de investigacion, no cualificado para vuelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s-seg (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT (pesos); datos de entrenamiento con terminos de uso de investigacion del NASA Crater Detection Challenge |
| Formato de pesos | no disponible (repositorio de 0,0 GB; se referencia `best.pt` en la model card) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26s-seg de Ultralytics, una red de deteccion y segmentacion de instancias en una sola etapa. La entrada se procesa a una resolucion de 1024 pixeles con un tamano de lote de 8 durante el entrenamiento. Las mascaras de instancia predichas se convierten posteriormente en elipses mediante `cv2.fitEllipse`, lo que permite recuperar la orientacion y los ejes de cada crater, informacion que la metrica CDA evalua explicitamente.

El entrenamiento se realizo sobre el conjunto de datos del NASA Crater Detection Challenge, compuesto por 4.150 renders sinteticos de relieve sombreado con anotaciones de elipses, divididos en 3.950 imagenes de entrenamiento y 200 de validacion. Se ejecutaron 15 epocas sobre una GPU AMD RX 9060 XT de 16 GB con ROCm. No se especifica el numero total de tokens ni si se aplicaron tecnicas de RLHF o DPO, ya que no es un modelo de lenguaje. La innovacion principal reside en el uso de segmentacion con ajuste de elipses en lugar de deteccion por cajas, lo que mejora la puntuacion CDA pese a que la cabeza de cajas del modelo obtiene un box-mAP inferior al del detector por cajas.

## Capacidades

- Segmentacion de instancias de crateres lunares en imagenes de relieve sombreado sinteticas.
- Conversion de mascaras a elipses con orientacion y ejes recuperados mediante `cv2.fitEllipse`.
- Deteccion de hasta 11 crateres por imagen (truncado optimo top-k para la metrica CDA).
- Inferencia a resolucion de 1024 pixeles mediante la API de Ultralytics (`model.predict`).
- Entrenamiento e inferencia reproducibles con codigo publicado en el repositorio del autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente visual).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la segmentacion de imagenes.

## Casos de uso

- Navegacion relativa al terreno (TRN) en misiones de aterrizaje lunar: el modelo segmenta crateres y estima sus elipses para alimentar algoritmos de correspondencia entre imagen de descenso y mapa orbital, aprovechando la recuperacion de rotacion que las cajas no ofrecen.
- Generacion de mapas de peligro para sitios de aterrizaje: las elipses detectadas permiten caracterizar el tamano y la orientacion de crateres en el area de descenso, informacion util para evaluar la rugosidad del terreno.
- Preprocesamiento de pipelines de vision espacial: sirve como primer estadio de segmentacion en un sistema mayor que combine deteccion de rocas, pendientes y otros accidentes geograficos.
- Investigacion en metrologia de crateres: el ajuste de elipses permite medir ejes mayor y menor, excentricidad y orientacion de cada crater para estudios de poblacion de crateres.
- Benchmarking de arquitecturas de segmentacion en dominios cientificos: el modelo y su evaluador (`scorer.py`) proporcionan una linea base reproducible para comparar nuevas arquitecturas YOLO u otras redes de segmentacion en la tarea de crateres.
- Entrenamiento y evaluacion de modelos complementarios: sirve como punto de partida para fine-tuning sobre imagenes reales, como demuestra el modelo complementario `huseyincavus/lunar-trn-ft-real`.
- Docencia y prototipado en vision por computador: su licencia MIT y su integracion con Ultralytics facilitan su uso en cursos y experimentos de segmentacion de instancias con geometria eliptica.

## Benchmarks y rendimiento

Resultados en el split de validacion de 200 imagenes, con el evaluador oficial del challenge (`scorer.py`) y truncado a las 11 detecciones mas confiables por imagen:

| Metrica | Valor |
|---|---|
| CDA (Crater Detection Accuracy) | 91,97 (IC bootstrap 95%: 89,93-93,80) |
| Linea base cajas v1s | 76,29 |
| Linea base cajas v1n | 71,90 |
| mAP50 en transferencia zero-shot a imagenes reales | ~0,03 |

El autor senala que la cabeza de cajas de este modelo obtiene un box-mAP inferior al del detector por cajas, pero la puntuacion CDA es 15,7 puntos superior gracias a la recuperacion de rotacion mediante segmentacion y ajuste de elipses.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo con una GPU de 16 GB a imgsz 1024 y batch 8, por lo que la inferencia en una sola imagen requiere bastante menos memoria.
- GPU recomendadas: cualquier GPU compatible con PyTorch/Ultralytics; el autor entreno en una AMD RX 9060 XT 16 GB con ROCm, lo que confirma soporte para GPUs AMD ademas de NVIDIA.
- Cabe en GPU de consumo: si, segun la evidencia del entrenamiento en una GPU de consumo de 16 GB; la inferencia a 1024 pixeles deberia caber en GPUs con 8 GB o mas, aunque no se especifica una cifra exacta.
- Opciones de despliegue: Ultralytics (Python), exportacion a formatos soportados por Ultralytics (ONNX, TensorRT, etc., no confirmados en la informacion disponible); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | CDA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lunar-trn-seg | YOLO26s-seg | no disponible | no aplica | 91,97 | MIT | Hugging Face |
| Linea base cajas v1s | Detector YOLO (cajas) | no disponible | no aplica | 76,29 | no disponible | Referencia en model card |
| Linea base cajas v1n | Detector YOLO (cajas) | no disponible | no aplica | 71,90 | no disponible | Referencia en model card |
| lunar-trn-ft-real | YOLO (fine-tune sobre imagenes reales) | no disponible | no aplica | no disponible | no disponible | Hugging Face (huseyincavus/lunar-trn-ft-real) |

Las lineas base v1s y v1n son detectores por cajas evaluados con la misma metrica CDA en el mismo split; el modelo de segmentacion las supera en 15,7 y 20,1 puntos respectivamente. No se dispone de datos de benchmarks de otros modelos de segmentacion de crateres en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio sintetico: la transferencia zero-shot a imagenes lunares reales es deficiente (mAP50 aproximado de 0,03); para uso real debe emplearse el modelo complementario fine-tuneado `huseyincavus/lunar-trn-ft-real`.
- Dependencia del truncado top-k: la metrica CDA varia fuertemente con el numero de detecciones por imagen; el valor de 91,97 corresponde a k=11, el optimo en el split de validacion, por lo que no es directamente comparable con configuraciones distintas.
- Modelo de investigacion: no esta cualificado para vuelo ni para uso en sistemas criticos de navegacion sin validacion adicional.
- Sesgos conocidos: no se documentan sesgos especificos, pero el entrenamiento sobre renders sinteticos puede introducir sesgos de iluminacion, relieve y distribucion de crateres propios del generador del challenge.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, pero pueden producirse detecciones falsas en texturas que imiten patrones circulares o elipticos.
- Limitaciones de idioma: no aplica (modelo de vision).
- Restricciones de licencia: los pesos son MIT, pero los datos de entrenamiento del NASA Crater Detection Challenge estan sujetos a terminos de uso de investigacion; conviene revisarlos antes de un uso comercial.
- No se especifican parametros totales, tipos de cuantizacion ni formatos de pesos exportados, lo que limita la planificacion de despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huseyincavus/lunar-trn-seg
- Modelo complementario fine-tuneado sobre imagenes reales: https://huggingface.co/huseyincavus/lunar-trn-ft-real
- Codigo de entrenamiento, inferencia y evaluacion: https://github.com/huseyincavusbi/lunar-trn
- NASA Crater Detection Challenge: no disponible en la informacion proporcionada (referenciado en la model card sin URL)
