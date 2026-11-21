# kenantabak/yolo11s-airport-apron-ground-vehicles-tr

## Resumen

El modelo `yolo11s-airport-apron-ground-vehicles-tr` es un detector de objetos basado en la arquitectura YOLO11s de Ultralytics, ajustado por Kenan Tabak para identificar vehículos y equipos de servicio en rampas de aeropuerto (apron). Resuelve un problema concreto de visión por computador en el dominio de la aviación: la detección simultánea de aeronaves, camiones cisterna de combustible, cintas transportadoras de equipaje, escaleras de pasajeros, camiones de bomberos y tractores de remolque en imágenes de vigilancia aérea o de torre.

El modelo se ha entrenado sobre un conjunto de datos específico de 1402 imágenes y 18762 anotaciones, con 10 clases y un fuerte desequilibrio hacia objetos pequeños (el 80,1 % de las cajas ocupan menos del 1 % del área, con una mediana del 0,40 %). Esta característica justifica la elección de YOLO11s con resolución de entrada de 768 píxeles, batch de 16 y aumentación de datos adaptada a vistas cenitales (flip vertical de 0,5). El resultado es un modelo compacto (19,2 MB) con un rendimiento declarado de 98,03 % mAP@50 y 66,45 % mAP@50-95 en el conjunto de validación.

La relevancia actual del modelo radica en su aplicabilidad directa a la seguridad y eficiencia de las operaciones aeroportuarias, un sector donde la monitorización automatizada de rampa (turnaround) y la prevención de incidentes con vehículos en pista son críticos. Su licencia CC BY 4.0 permite uso comercial con atribución, aunque la dependencia de Ultralytics impone condiciones adicionales (AGPL-3.0) que deben evaluarse en despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics) |
| Parametros totales | no disponible (tamaño del archivo de pesos: 19,2 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`; cuantización a FP16/INT8 posible vía Ultralytics, no especificada por el autor) |
| Idiomas soportados | tr, en (etiquetas de clases y documentación; el modelo no procesa texto) |
| Licencia | CC BY 4.0 (con condiciones adicionales de Ultralytics AGPL-3.0) |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11s, un detector de objetos de una sola etapa basado en transformer/CNN híbrido con cabeza de detección P3+NMS. Según la model card, se eligió esta variante frente a alternativas por su buen comportamiento en objetos pequeños y densos, que dominan el conjunto de datos. La entrada se fija en 768 píxeles, con batch de 16 y 75 épocas de entrenamiento (mejor época en la 69, paciencia de 25). El optimizador es `auto` con `cos_lr=true`, y se aplican aumentaciones específicas para vistas aéreas: `fliplr=0.5`, `flipud=0.5`, `degrees=10.0`, `erasing=0.0`, `hsv_h=0.012`, `hsv_s=0.4`.

El conjunto de entrenamiento contiene 1402 imágenes y 18762 etiquetas distribuidas en 10 clases (aircraft, fire truck, baggage, oiltruck, stair, bus, tractor, conveyor, truck, followme), con un desequilibrio moderado (ratio 5,5x entre la clase más y menos frecuente; la menor tiene 754 cajas). El entrenamiento consumió 0,162 horas GPU (1,62 CR según la plataforma EVREN). No se especifica el uso de RLHF/DPO (no aplica a detección de objetos) ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Detección de objetos en imágenes de rampa de aeropuerto para 10 clases: `aircraft`, `fire truck`, `baggage`, `oiltruck`, `stair`, `bus`, `tractor`, `conveyor`, `truck`, `followme`.
- Generación de cajas delimitadoras con puntuaciones de confianza y etiquetas de clase.
- Funcionamiento en imágenes de vigilancia aérea o de torre (vistas cenitales o elevadas), gracias al entrenamiento con flip vertical.
- Inferencia en tiempo real sobre imágenes individuales o flujos de vídeo (soporte nativo de Ultralytics para `source` como vídeo, carpeta o stream).
- Capacidades multilingües limitadas a tr/en en la documentación y etiquetas; el modelo no procesa lenguaje natural.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo "thinking", visión artificial generativa, audio ni otras capacidades fuera de la detección de objetos.

## Casos de uso

- **Monitorización de turnaround de aeronaves**: el modelo detecta simultáneamente aeronaves, escaleras, cintas de equipaje y camiones cisterna en imágenes de torre, permitiendo medir tiempos de servicio y detectar cuellos de botella en la rampa con una sola pasada de inferencia.
- **Seguridad en apron**: la detección de camiones de bomberos, tractores y vehículos de seguimiento (`followme`) en zonas restringidas permite generar alertas automáticas cuando un vehículo no autorizado invade un área crítica, gracias a la alta recall (96,18 %) que minimiza falsos negativos.
- **Automatización de inventario de equipos en pista**: el modelo puede inventariar en tiempo real la presencia y posición de escaleras, cintas transportadoras y cisternas de combustible, facilitando la logística de asignación de recursos en aeropuertos con múltiples puertas.
- **Análisis forense de incidentes**: dado un vídeo de una incidencia en rampa, el modelo permite extraer las detecciones por fotograma para reconstruir la secuencia de eventos y determinar responsabilidades, con un mAP@50 del 98,03 % que garantiza una localización fiable.
- **Integración en sistemas de visión para UAV**: al estar entrenado con flip vertical y vistas cenitales, es adecuado para drones de inspección de pista que sobrevuelan la rampa y necesitan detectar vehículos y aeronaves desde arriba en tiempo real.
- **Control de accesos y conteo de vehículos**: el modelo puede contar y clasificar vehículos (autobuses, camiones, tractores) que circulan por el apron, alimentando paneles de ocupación y sistemas de gestión de flotas aeroportuarias.
- **Prototipado rápido en investigación aeronáutica**: con solo 19,2 MB y 0,162 horas GPU de entrenamiento, sirve como base para fine-tuning en dominios similares (puertos, logística industrial) o para experimentos de aumento de datos en visión aérea.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de validación del dataset "Havalimanı Apron ve Yer Hizmetleri Araçları Tespiti (10 Sınıf)" (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 98,03 % |
| mAP@50-95 | 66,45 % |
| Precision | 95,03 % |
| Recall | 96,18 % |
| F1 Score | 95,57 % |
| Mejor época | 69 / 75 |

Rendimiento por clase (AP@50 / Precision / Recall / F1):

| Clase | AP@50 | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| aircraft | 99,07 % | 98,44 % | 98,73 % | 98,58 % |
| fire truck | 98,45 % | 93,58 % | 97,21 % | 95,36 % |
| baggage | 98,25 % | 95,62 % | 98,44 % | 97,01 % |
| oiltruck | 98,17 % | 93,49 % | 98,69 % | 96,02 % |
| stair | 98,11 % | 95,00 % | 97,56 % | 96,27 % |
| bus | 98,02 % | 94,49 % | 95,59 % | 95,04 % |
| tractor | 98,01 % | 91,44 % | 95,64 % | 93,49 % |
| conveyor | 97,81 % | 94,16 % | 94,27 % | 94,21 % |
| truck | 97,62 % | 96,07 % | 93,13 % | 94,58 % |
| followme | 96,58 % | 95,33 % | 94,95 % | 95,14 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 19,2 MB, la inferencia en FP32 requiere menos de 1 GB de VRAM; en FP16 o INT8, el consumo es aún menor (típicamente <500 MB para lotes pequeños).
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente. Se recomiendan RTX 3060, RTX 4060, RTX 4090 para alto throughput; A100 o H100 solo necesarias para procesamiento masivo por lotes o vídeo en tiempo real a alta resolución.
- **Compatibilidad con GPU consumer**: sí, cabe en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.).
- **Opciones de despliegue**: Ultralytics (Python API, CLI), exportación a ONNX, TensorRT, OpenVINO, CoreML y TFLite para despliegue en edge; también compatible con TorchScript.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el tamaño del modelo y la resolución de entrada (768 px), se espera una latencia de pocos milisegundos por imagen en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia cualitativa, se puede comparar con:

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo11s-airport-apron-ground-vehicles-tr | no disponible (19,2 MB) | 768 px (imagen) | mAP@50 98,03 % (dataset propio) | CC BY 4.0 + AGPL-3.0 | Hugging Face |
| YOLO11s base (Ultralytics) | no disponible | 640 px por defecto | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| YOLOv8s (Ultralytics) | no disponible | 640 px por defecto | no disponible en esta ficha | AGPL-3.0 | Ultralytics |

No se han encontrado modelos directamente comparables en el dominio específico de detección de vehículos de apron en la información disponible.

## Limitaciones y advertencias

- **Sesgos de dominio**: el modelo está entrenado exclusivamente con imágenes de rampas de aeropuerto; su rendimiento fuera de ese contexto (otras condiciones de iluminación, climas extremos, aeropuertos con flotas distintas) no está validado.
- **Riesgo de alucinación**: como todo detector de objetos, puede generar falsos positivos en objetos visualmente similares (p. ej., confundir un camión genérico con un `oiltruck`), especialmente en clases con precisiones más bajas como `tractor` (91,44 %) o `fire truck` (93,58 %).
- **Limitaciones de contexto e idioma**: no procesa texto ni lenguaje natural; las etiquetas y la documentación están en turco e inglés, lo que puede requerir traducción para equipos hispanohablantes.
- **Restricciones de licencia**: CC BY 4.0 permite uso comercial con atribución, pero la dependencia de Ultralytics impone AGPL-3.0, que puede obligar a liberar el código de aplicaciones que integren el modelo si se distribuyen. Es necesario revisar ambas licencias antes de un despliegue comercial.
- **Caveats para producción**: los resultados de benchmarks son declarados por el autor y no verificados de forma independiente; el dataset de validación es pequeño (1402 imágenes) y puede no representar la variabilidad real de todos los aeropuertos. Se recomienda validación adicional en el dominio objetivo antes de desplegar.
- **Resolución de entrada**: el modelo se entrenó a 768 px, pero el ejemplo de uso rápido emplea `imgsz=640`; usar una resolución distinta a la de entrenamiento puede degradar el rendimiento en objetos pequeños.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kenantabak/yolo11s-airport-apron-ground-vehicles-tr)
- [Página del modelo en EVREN](https://evren.ssyz.org.tr/models/u19979974710e/havalimani-apron-ve-yer-hizmetleri-araclari-tespiti)
- [Dataset de entrenamiento en EVREN](https://evren.ssyz.org.tr/datasets/u19979974710e/havalimani-apron-ve-yer-hizmetleri-araclari-tespiti-10-sinif)
- [Perfil del desarrollador en EVREN](https://evren.ssyz.org.tr/profile/u19979974710e)
- [Catálogo de datasets de visión por computador en turco](https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets)
- [Dataset original en Roboflow Universe](https://universe.roboflow.com/ace-oy7jh/airport-kqvi1)
