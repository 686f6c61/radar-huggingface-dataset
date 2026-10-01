# RKNNAI/RK3576-CNN-yolov8s

## Resumen

RK3576-CNN-yolov8s es un paquete de despliegue del modelo de deteccion de objetos YOLOv8s, convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3576. Lo publica el usuario RKNNAI y no entrena un modelo nuevo: toma el modelo fuente de airockchip/ultralytics_yolov8 y lo empaqueta con la configuracion de cuantizacion y runtime necesarias para el chip objetivo. El repositorio contiene la configuracion `yolov8s-640x640-w8a8-1`, pensada para inferencia a 640x640 pixeles con cuantizacion w8a8 (pesos y activaciones en INT8) sobre un unico nucleo NPU, con la version de runtime RKNN `v2.4.0`.

No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red convolucional (CNN) de una sola etapa para deteccion de objetos en tiempo real. Su relevancia esta en el ambito del edge computing: permite ejecutar deteccion de objetos con aceleracion por hardware en placas basadas en RK3576, tipicamente en camaras IP, drones, robots o sistemas de vision industrial con presupuesto de energia y computo limitado.

La licencia del proyecto original es GNU AGPL v3, heredada del repositorio de Ultralytics. El modelo se distribuye integramente a traves de RKNN Model Zoo y su modelo fuente. No hay datos publicados sobre parametros, rendimiento ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv8s, deteccion de objetos de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en INT8) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN |
| Chip objetivo | Rockchip RK3576 |
| Version de runtime RKNN | v2.4.0 |
| Nucleos NPU utilizados | 1 |
| Resolucion de entrada | 640x640 |
| Configuracion incluida | yolov8s-640x640-w8a8-1 |
| Modelo fuente | airockchip/ultralytics_yolov8 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es una CNN de la familia YOLOv8, en su variante "s" (small), orientada a deteccion de objetos en una sola pasada. La arquitectura concreta, la composicion del dataset de entrenamiento, el numero de tokens o imagenes empleadas y la existencia de fases de ajuste fino no se detallan en la informacion disponible; el repositorio solo documenta la conversion a RKNN y la configuracion de despliegue.

El trabajo de este repositorio no es entrenamiento, sino conversion y empaquetado: el modelo fuente de airockchip/ultralytics_yolov8 se transforma al formato RKNN para el RK3576, fijando la precision de cada configuracion (en este caso w8a8) y verificando la integridad de los ficheros mediante sumas SHA-256 (`SHA256SUMS`). La unica innovacion tecnica declarada es, por tanto, la propia conversion cuantizada a INT8 para explotar la NPU del RK3576 con una resolucion fija de 640x640 y un unico nucleo NPU.

## Capacidades

- Deteccion de objetos sobre imagenes o fotogramas de video a resolucion 640x640.
- Inferencia acelerada por NPU en el SoC Rockchip RK3576 con cuantizacion INT8 (w8a8).
- Ejecucion en el borde (edge) sin necesidad de GPU dedicada ni de conectividad a la nube.
- Integracion con el ecosistema RKNN Model Zoo y sus ejemplos de despliegue.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling ni capacidades de agente, por tratarse de un detector CNN.
- No hay soporte multilingue declarado (no aplica).
- No se documentan capacidades especiales adicionales (segmentacion, pose, clasificacion) en esta configuracion.

## Casos de uso

- Videovigilancia en el borde: una camara IP basada en RK3576 puede ejecutar el detector localmente a 640x640 para identificar personas, vehiculos u objetos en tiempo real, sin enviar el video a un servidor y reduciendo latencia y consumo de ancho de banda.
- Vision industrial en linea de produccion: el modelo permite detectar defectos, piezas mal colocadas o ausencias en la cinta transportadora, operando sobre la NPU del RK3576 dentro de un equipo embebido con restricciones de espacio y energia.
- Robotica movil y drones: un robot o dron equipado con RK3576 puede usar el detector para percibir obstaculos y objetos del entorno, delegando la inferencia a la NPU y dejando la CPU libre para navegacion y control.
- Analitica de retail: conteo de personas, control de aforo y analisis de flujo en tiendas mediante dispositivos embebidos que procesan los fotogramas en local, lo que facilita el cumplimiento de normativas de privacidad al no transmitir imagenes.
- Gestion de trafico: deteccion de vehiculos, motocicletas y peatones en camaras de cruce, con la inferencia ejecutada en el propio dispositivo para alimentar sistemas de conteo o alertas.
- Agricultura de precision: deteccion de frutos, plagas o malas hierbas en equipos de campo autonomos o con bateria, donde la NPU del RK3576 ofrece un equilibrio entre rendimiento y consumo.
- Domotica y seguridad del hogar: integracion en porteros automaticos o camaras domesticas para distinguir presencia humana de otros movimientos, ejecutando el modelo en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo especifico: SoC Rockchip RK3576, ejecutando el modelo en su NPU con la configuracion de un solo nucleo NPU.
- Version de runtime RKNN requerida: `v2.4.0`.
- Formato de pesos: RKNN, con cuantizacion w8a8 (INT8), por lo que el modelo esta disenado para la NPU y no para ejecucion en GPU de escritorio.
- No se proporcionan datos sobre VRAM ni sobre GPUs de escritorio (A100, H100, RTX 4090): este paquete no esta orientado a ese tipo de despliegue.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo RKNN).
- Latencia y throughput estimados: no disponibles.
- El repositorio declara un tamano de 0.0 GB, por lo que no se puede estimar el peso de los ficheros a partir de esa cifra.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Chip objetivo | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| RK3576-CNN-yolov8s | CNN (YOLOv8s) | w8a8 | RK3576 | AGPL-3.0 | no disponible |
| Otras variantes YOLOv8 (n, m, l, x) integradas en RKNN Model Zoo | CNN | no disponible | Rockchip (varios) | AGPL-3.0 (upstream) | no disponible |
| YOLOv8s sin convertir (formato PyTorch/Ultralytics) | CNN | sin cuantizar | GPU/CPU generica | AGPL-3.0 | no disponible |

No se dispone de resultados numericos que permitan una comparacion cuantitativa fiable; la comparativa se limita a categoria, cuantizacion, chip objetivo y licencia.

## Limitaciones y advertencias

- Al ser una distribucion convertida de YOLOv8s, esta sujeta a la licencia AGPL-3.0 del proyecto original; el uso comercial en productos requiere revisar las obligaciones de esta licencia (incluida la de ofrecer el codigo fuente correspondiente en determinados supuestos).
- La configuracion solo esta soportada para el chip RK3576 y el runtime RKNN `v2.4.0`; usar ficheros de otra configuracion o runtime puede provocar fallos de compatibilidad.
- No se documentan sesgos, riesgos de alucinacion ni limites de idioma (no aplican a un detector de objetos), pero si se aplican los sesgos propios del dataset de entrenamiento original de YOLOv8, no detallado aqui.
- La ausencia de benchmarks publicados impide conocer su precision real y no permite garantizar un nivel de rendimiento concreto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Se recomienda verificar la integridad de los ficheros con `sha256sum -c SHA256SUMS` antes del despliegue, tal como indica la model card.
- No hay informacion sobre los parametros del modelo ni sobre el tamano real de los artefactos incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3576-CNN-yolov8s
- RKNN Model Zoo (ejemplo YOLOv8): https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Modelo fuente: https://github.com/airockchip/ultralytics_yolov8
- Licencia (LICENSE del repositorio): incluida en el propio repositorio de HuggingFace
- ModelScope: RKNNAI/RK3576-CNN-yolov8s (revision v2.4.0)
