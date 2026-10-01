# RKNNAI/RK3576-CNN-yolov8n-obb

## Resumen

RKNNAI/RK3576-CNN-yolov8n-obb no es un modelo de lenguaje, sino un paquete de despliegue en formato RKNN del detector de objetos con cajas orientadas (oriented bounding boxes, OBB) yolov8n-obb, optimizado para el NPU del SoC Rockchip RK3576. Lo publica el usuario RKNNAI dentro del ecosistema RKNN Model Zoo, y deriva del repositorio airockchip/ultralytics_yolov8, que a su vez adapta la familia Ultralytics YOLOv8 al hardware Rockchip. El proposito es ofrecer una conversion lista para produccion que aproveche la aceleracion NPU del RK3576 en lugar de ejecutar el modelo sobre CPU o GPU.

La unica configuracion publicada es `yolov8n-obb-640x640-w8a8-1`, con entrada de 640x640 pixeles, cuantizacion w8a8 (pesos y activaciones a 8 bits), un solo nucleo NPU y runtime RKNN v2.4.0. El tag de arquitectura es CNN, coherente con la variante nano de YOLOv8, pensada para inferencia en el borde con presupuesto de computo reducido.

Su relevancia radica en el nicho de vision embebida: deteccion de objetos rotados en imagenes aereas, satelitales o con orientacion arbitraria sobre placas RK3576. El repositorio ocupa 0,0 GB, no registra descargas ni likes en el momento de la consulta y se distribuye bajo licencia GNU AGPL v3, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (yolov8n-obb, variante nano de YOLOv8 con cabeza oriented bounding box) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | GNU AGPL v3 (agpl-3.0) |
| Formato de pesos | RKNN (runtime RKNN v2.4.0); modelo origen en formato Ultralytics, convertido a RKNN para RK3576 |
| Resolucion de entrada | 640x640 |
| Nucleos NPU | 1 |
| Chips soportados | RK3576 |
| Version de runtime RKNN | v2.4.0 |
| Modelo origen | airockchip/ultralytics_yolov8 |
| Tipo de tarea | Deteccion de objetos con cajas orientadas (OBB) |
| Tamano del repositorio | 0,0 GB |
| Revision | v2.4.0 |

## Arquitectura y entrenamiento

El modelo origen es yolov8n-obb, una red convolucional de la familia YOLOv8 en su variante nano, equipada con una cabeza de deteccion de cajas orientadas. Este tipo de cabeza predice un angulo adicional por caja, de modo que el rectangulo delimitador puede rotar para ajustarse a objetos con orientacion arbitraria, algo habitual en imagenes aereas y de satelite. La informacion proporcionada no detalla el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni si hubo fases de ajuste fino especificas; estos datos figuran como no disponibles.

La aportacion de este repositorio no es el entrenamiento, sino la conversion y el empaquetado para el NPU del RK3576. La distribucion genera un artefacto RKNN con cuantizacion w8a8 y lo acompan de un fichero `SHA256SUMS` para verificacion de integridad. No se documentan en el material disponible innovaciones de decodificacion especulativa, atencion lineal ni tecnicas equivalentes, ya que no aplican a un detector convolucional. La arquitectura se mantiene como CNN pura, sin componentes de tipo MoE, SSM ni hibridos.

## Capacidades

- Deteccion de objetos con cajas orientadas (OBB) sobre imagenes de 640x640, es decir, localizacion de objetos con rectangulos rotados que se ajustan a su orientacion real.
- Inferencia acelerada en el NPU del Rockchip RK3576 mediante el runtime RKNN v2.4.0.
- Ejecucion con cuantizacion w8a8, orientada a reducir consumo de memoria y latencia en dispositivos de borde.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un modelo exclusivamente de vision por computador.
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un modelo de agentes.
- No se documentan capacidades multilingues ni modos especiales como thinking, audio o vision multimodal mas alla de la deteccion de objetos.

## Casos de uso

- Deteccion de vehiculos y embarcaciones en imagenes aereas o de dron: la cabeza OBB permite delimitar objetos alargados y no alineados con los ejes de la imagen, donde una caja estandar introduciria mucho fondo.
- Analisis de imagenes satelitales para agricultura: identificacion de parcelas, invernaderos o lineas de cultivo con orientacion variable, ejecutada en un RK3576 embarcado en estaciones de campo con bajo consumo.
- Inspeccion industrial en linea de produccion: deteccion de piezas rotadas sobre una cinta transportadora, aprovechando el NPU para mantener inferencia en tiempo real sin depender de un servidor.
- Vigilancia perimetral con camaras Edge: clasificacion y localizacion de objetos en el propio dispositivo, evitando enviar video a la nube y reduciendo ancho de banda y coste.
- Navegacion de robots moviles o AGV en almacenes: deteccion de palets, estanterias y obstaculos con orientacion conocida para planificacion de trayectorias.
- Rotacion documental y escaneo: localizacion de documentos o etiquetas inclinadas en capturas de camara, corrigiendo la orientacion antes del OCR.
- Telemetria ferroviaria o de infraestructuras: deteccion de elementos lineales como vias, catenarias o tuberias en imagenes capturadas por vehiculos de inspeccion.
- Prototipado de vision embebida en placas RK3576: validacion rapida de pipelines de deteccion OBB antes de pasar a variantes de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, precision, recall ni comparaciones con otros detectores, y tampoco se aportan cifras de latencia o throughput para el RK3576.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3576, con inferencia sobre su NPU mediante el runtime RKNN v2.4.0. No es un modelo pensado para GPU de escritorio.
- La configuracion publicada emplea 1 nucleo NPU y cuantizacion w8a8, lo que reduce los requisitos de memoria frente a una ejecucion en coma flotante.
- VRAM estimada para GPU convencional: no aplica; el modelo esta empaquetado para NPU. Su ejecucion en GPU requeriria reconvertir el modelo origen desde Ultralytics.
- Opciones de despliegue: RKNN Runtime v2.4.0 sobre RK3576, con ejemplos y utilidades disponibles en RKNN Model Zoo (carpeta de ejemplos yolov8).
- Verificacion de integridad: el repositorio incluye `SHA256SUMS` para comprobar los ficheros descargados antes del despliegue.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion | Cuantizacion | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RKNNAI/RK3576-CNN-yolov8n-obb | CNN YOLOv8n-OBB | 640x640 | w8a8 | RK3576 (1 nucleo NPU) | AGPL-3.0 | HuggingFace y ModelScope (revision v2.4.0) |
| yolov8n-obb (Ultralytics / airockchip) | CNN YOLOv8n-OBB | configurable | no cuantizado (origen) | GPU/CPU generica | AGPL-3.0 | Repositorio GitHub |
| Otras conversiones RKNN del RKNN Model Zoo | CNN YOLOv8 en variantes deteccion/segmentacion/pose | segun configuracion | w8a8 u otras | chips Rockchip (RK3566, RK3588, RK3576, etc.) | AGPL-3.0 | GitHub y ModelScope |

No se dispone de datos de rendimiento comparativo (mAP, latencia, throughput) entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas de despliegue y licencia.

## Limitaciones y advertencias

- Es un modelo de vision, no de lenguaje: no admite prompts de texto ni generacion, por lo que no debe evaluarse con criterios de LLM (contexto, idiomas, tool calling).
- Compatibilidad restringida: la configuracion publicada solo soporta el chip RK3576 y el runtime RKNN v2.4.0. Usar ficheros de otra configuracion o un runtime distinto puede fallar.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuertes. El uso comercial o la integracion en productos propietarios requiere revisar las condiciones con atencion, ya que la AGPL exige liberar el codigo de las obras derivadas que se ofrezcan como servicio en red.
- Sesgos conocidos: no disponible. No se documentan caracteristicas del dataset de entrenamiento ni posibles sesgos de clase o geograficos.
- Riesgo de alucinacion: no aplica en el sentido de los LLM, pero existe riesgo de falsos positivos, detecciones espurias y errores de angulo en la cabeza OBB, especialmente con objetos pequenos o poco representados.
- La cuantizacion w8a8 puede degradar la precision respecto al modelo original en coma flotante; no se aportan datos de la perdida de mAP asociada.
- No se documentan idiomas, dominios ni limitaciones de contexto porque no son aplicables a un detector.
- El repositorio figura con 0 descargas y 0 likes, y un tamano de 0,0 GB, por lo que conviene verificar los ficheros con `SHA256SUMS` antes de cualquier despliegue en produccion.
- No se han publicado benchmarks ni metricas de rendimiento en el material disponible, lo que dificulta estimar su calidad antes de una evaluacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3576-CNN-yolov8n-obb
- Modelo origen (Ultralytics adaptado por airockchip): https://github.com/airockchip/ultralytics_yolov8
- RKNN Model Zoo, ejemplo yolov8: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Documentacion china del repositorio (README_CN.md): no disponible como enlace directo; referenciado en la model card.
