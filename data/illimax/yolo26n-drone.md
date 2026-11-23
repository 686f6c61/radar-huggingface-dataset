# illimax/yolo26n-drone

## Resumen

YOLO26n Drone Detector es un modelo de deteccion de objetos basado en la arquitectura YOLO26n de Ultralytics, especializado en la deteccion de drones en vistas tierra-aire (camara en el suelo apuntando al cielo) y aire-aire (camara a bordo de una aeronave). Lo desarrolla el usuario illimax y se distribuye con licencia AGPL-3.0. El modelo resuelve un problema concreto de los sistemas anti-UAV: distinguir drones de otros objetos voladores como aves, aviones o helicopteros, que de otro modo generarian falsas alarmas.

Con solo 2,5 millones de parametros y un peso de 5,6 MB en formato PyTorch, es un modelo extremadamente ligero pensado para despliegue en entornos con recursos limitados. Trabaja a una resolucion de entrada de 1280 pixeles, lo que mejora la deteccion de objetos pequenos en el cielo, y emplea una arquitectura NMS-free (sin supresion no maxima) propia de la familia YOLO26.

El modelo se entrena en dos etapas sobre un conjunto de datos mixto de mas de 54.000 imagenes de entrenamiento y 4.595 de validacion, procedentes de los conjuntos DUT Anti-UAV, Det-Fly, AOT (Amazon Airborne Object Tracking), AOD-4 y seraphim. Es relevante ahora porque aborda la deteccion de objetivos de muy pequeno tamano en escenarios anti-dron con un coste computacional minimo, aunque con limitaciones claras de recall en condiciones adversas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (NMS-free), red neuronal convolucional para deteccion de objetos |
| Parametros totales | 2,5 millones (2,54 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en FP32 PyTorch y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLO26) |
| Formato de pesos | PyTorch `.pt` (5,6 MB) y ONNX (10,4 MB, salida `[1, 8, 33600]`, requiere NMS) |
| Resolucion de entrada | 1280 x 1280 |
| Clases | `0 drone`, `1 bird`, `2 airplane`, `3 helicopter` |
| Umbral de confianza recomendado | 0,26 (maximo F1 para la clase drone en validacion) |

## Arquitectura y entrenamiento

La arquitectura es YOLO26n, la variante mas pequena de la familia YOLO26 de Ultralytics, con deteccion NMS-free y 2,5 millones de parametros. El modelo se entrena en dos etapas con la misma receta que se aplicaria a YOLO26n y YOLO26s (solo cambia el tamano del modelo). La primera etapa es un preentrenamiento a 640 pixeles sobre el conjunto seraphim de deteccion de drones, durante 100 epocas, partiendo de los pesos COCO `yolo26n.pt`. La segunda etapa es el entrenamiento principal a 1280 pixeles sobre datos mixtos, tambien 100 epocas, con parada temprana de paciencia 20 (no activada), batch 48 y precision mixta automatica (AMP), partiendo de los pesos de la primera etapa. La mejor epoca fue la 97.

El conjunto de datos de entrenamiento suma 54.070 imagenes y el de validacion 4.595, con las siguientes fuentes: DUT Anti-UAV (vista tierra-aire, 5.197 train / 439 val), Det-Fly (aire-aire, 11.729 / 214), AOT de Amazon (aire-aire, 6.641 / 960, con negativos de aves, aviones, helicopteros y cielo vacio), AOD-4 (mixto, 15.507 / 1.502) y un subconjunto de replay de seraphim (14.996 / 1.480). Se aplico una higiene de datos rigurosa: division por video, secuencia o vuelo (no por fotograma, con bloques de 300 fotogramas y un buffer de 30 en Det-Fly); eliminacion de duplicados entre conjuntos y divisiones mediante md5 y hash perceptual (pHash/dHash); eliminacion de casi duplicados entre entrenamiento y validacion; y eliminacion de fugas de datos comparando cada imagen de entrenamiento con los fotogramas de test de Anti-UAV300, descartando todas las imagenes de AOD-4 procedentes de grabaciones de Anti-UAV. Los vuelos reservados de AOT (3 vuelos de dron y el 10% de los demas vuelos) nunca se descargaron para entrenamiento.

## Capacidades

- Deteccion de objetos en imagenes con salida de cajas delimitadoras (coordenadas xyxy) y puntuaciones de confianza.
- Deteccion especifica de drones en vistas tierra-aire y aire-aire.
- Clasificacion de cuatro clases de objetos voladores: dron, ave, avion y helicoptero, lo que permite usar las tres ultimas como clases negativas para reducir falsas alarmas.
- Deteccion de objetos de pequeno tamano gracias a la resolucion de entrada de 1280 pixeles.
- Inferencia NMS-free en el modelo PyTorch original (el ONNX exportado requiere NMS posterior).
- Soporte de tool calling / function calling: no aplica (modelo de vision).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: filtrado por clase en inferencia (`classes=[0]` para usar solo la clase drone), umbral de confianza ajustable y exportacion a ONNX.

## Casos de uso

- Vigilancia anti-dron en infraestructuras criticas: el modelo puede procesar fotogramas de camaras terrestres que apuntan al cielo para detectar drones intrusos, con la ventaja de que las clases ave, avion y helicoptero actuan como negativas y reducen las falsas alarmas (0,1% de falsos positivos en fotogramas con solo aves y 0,0% en cielo vacio).
- Monitorizacion aerea desde aeronaves: en vistas aire-aire, el modelo permite detectar otros drones desde una camara a bordo, util para patrullaje o seguridad en espacios aereos.
- Sistemas de alerta temprana en tiempo real: con 7,4 ms por imagen en una Quadro RTX 5000 y unos 108 ms por fotograma 1920x1080 en CPU de 4 hilos, puede integrarse en pipelines de video en directo con requisitos de latencia moderados.
- Despliegue en dispositivos de borde: sus 5,6 MB de pesos y 2,5 M de parametros permiten ejecutarlo en hardware embebido o GPUs de consumo para vigilancia distribuida con multiples camaras.
- Filtrado previo en sistemas de identificacion: el modelo puede actuar como primera etapa que descarta fotogramas sin drones (precision del 89,1% en Anti-UAV300) antes de pasar a clasificadores o rastreadores mas costosos.
- Investigacion en deteccion de objetos pequenos: sirve como linea base reproducible para estudiar el rendimiento en objetivos de menos de 32 pixeles, con desglose de recall por tamano documentado.
- Integracion en plataformas de seguridad aeroportuaria: la deteccion de aves y aviones como clases separadas permite discriminar fauna y trafico aereo de drones no autorizados en entornos de aerodromo.

## Benchmarks y rendimiento

Validacion (etapa 2, 4.595 imagenes), metricas a la confianza que maximiza el F1 medio:

| Clase | Precision | Recall | F1 | mAP50 | mAP50-95 |
|---|---|---|---|---|---|
| drone | 0,926 | 0,842 | 0,882 | 0,877 | 0,604 |
| bird | 0,877 | 0,689 | 0,772 | 0,783 | 0,564 |
| helicopter | 0,854 | 0,732 | 0,788 | 0,788 | 0,421 |
| airplane | 0,475 | 0,392 | 0,430 | 0,323 | 0,200 |

Test (conjuntos reservados, solo clase drone, a imgsz 1280 y conf 0,26; AP estilo COCO de 101 puntos a IoU 0,5):

| Conjunto de test | Vista | Fotogramas | AP50 | mAP50-95 | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| Anti-UAV300 RGB test (91 secuencias) | tierra-aire | 85.349 | 0,520 | 0,266 | 0,891 | 0,390 | 0,543 |
| AOT reservado (3 vuelos de dron) | aire-aire | 720 | 0,181 | 0,103 | 0,904 | 0,171 | 0,287 |

Recall por tamano del objetivo:

| Conjunto de test | < 8 px | 8-16 px | 16-32 px | >= 32 px |
|---|---|---|---|---|
| Anti-UAV300 | – (1 caja) | 0,00 (13) | 0,03 (823) | 0,39 (78.862) |
| AOT reservado | 0,00 (322) | 0,26 (42) | 0,31 (356) | – (0) |

Falsas alarmas (predicciones de dron a conf 0,26):

| Fotogramas sin dron | Fotogramas | Con falso dron |
|---|---|---|
| Anti-UAV300 sin dron | 5.650 | 6,4% |
| AOT solo aves | 1.000 | 0,1% |
| AOT solo aviones | 1.000 | 0,0% |
| AOT solo helicopteros | 1.000 | 0,0% |
| AOT cielo vacio | 1.000 | 0,0% |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo pesa 5,6 MB en `.pt` y 10,4 MB en ONNX, por lo que cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM efectiva a resolucion 1280.
- GPU recomendadas: Quadro RTX 5000 (7,4 ms por imagen segun el autor); cualquier GPU moderna de consumo como RTX 3060, RTX 4060 o superiores es suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en iGPU modernas.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime (el ONNX exportado requiere NMS posterior), y en general cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de vision).
- Latencia y throughput: aproximadamente 108 ms por fotograma 1920x1080 en CPU de 4 hilos con PyTorch (predict() extremo a extremo) y 7,4 ms por imagen en Quadro RTX 5000. El throughput exacto en otras GPU no esta documentado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia de categoria, el propio autor indica que la misma receta de entrenamiento esta pensada para YOLO26n y YOLO26s (solo cambia el tamano del modelo), pero no se aportan metricas de YOLO26s ni de otras alternativas anti-UAV para comparar parametros, contexto o rendimiento.

| Modelo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| YOLO26n Drone (este) | 2,5 M | 1280 | AGPL-3.0 | Hugging Face |
| YOLO26s (misma receta, no publicado) | no disponible | 1280 | AGPL-3.0 | no disponible |
| Alternativas anti-UAV | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El recall es el punto debil: en Anti-UAV300 es de 0,390 y varia mucho por secuencia (mediana de 0,27, con algunas entre 0,94 y 1,0). Las secuencias falladas corresponden sobre todo a drones frente a edificios, niebla densa y escenas nocturnas donde el dron es solo una mancha de luz.
- Los objetivos de menos de 8 pixeles son practicamente indetectables: en AOT, el 45% de las cajas reservadas son menores de 8 px (unos 3 px tras redimensionar a 1280) y ninguna se detecta.
- En AOT el recall es de 0,171 y el AP50 de 0,181, muy por debajo del rendimiento en Anti-UAV300; el modelo tiene dificultades en vistas aire-aire con objetivos diminutos.
- La clase airplane es debil (F1 0,430), aunque solo importa como clase negativa.
- Det-Fly contiene un unico modelo de dron (DJI Mavic), por lo que la variedad aire-aire es limitada.
- No se ha evaluado en imagenes termicas (IR).
- Riesgo de falsas alarmas: 6,4% de fotogramas sin dron en Anti-UAV300 generan una prediccion de dron a conf 0,26.
- La licencia AGPL-3.0 impone obligaciones de copyleft: el uso comercial en servicios en red requiere liberar el codigo fuente derivado; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Los datos de entrenamiento no se redistribuyen y cada conjunto tiene sus propios terminos (seraphim y AOD-4 con CC BY 4.0; AOT con CDLA-Permissive 1.0).
- No se documentan sesgos especificos mas alla de las limitaciones de dominio descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illimax/yolo26n-drone
- Dataset seraphim drone detection (CC BY 4.0): https://huggingface.co/datasets/lgrzybowski/seraphim-drone-detection-dataset
- Dataset AOD-4 (Airborne Object Detection 4, CC BY 4.0): https://universe.roboflow.com/airborne-object-detection/airborne-object-detection-4-aod4
- Amazon Airborne Object Tracking (AOT, CDLA-Permissive 1.0): https://registry.opendata.aws/airborne-object-tracki
