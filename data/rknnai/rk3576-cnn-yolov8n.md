# RKNNAI/RK3576-CNN-yolov8n

## Resumen

RK3576-CNN-yolov8n es un paquete de despliegue del modelo de deteccion de objetos YOLOv8n convertido al formato RKNN para ejecutarse en la NPU del SoC Rockchip RK3576. No se trata de un modelo entrenado desde cero por el autor, sino de una distribucion que toma el modelo origen de airockchip/ultralytics_yolov8 y lo compila para el runtime RKNN v2.4.0 con cuantizacion w8a8 (8 bits en pesos y activaciones). El repositorio lo publica el usuario RKNNAI dentro del ecosistema RKNN Model Zoo.

El modelo resuelve el problema de ejecutar deteccion de objetos en tiempo real sobre hardware de borde (edge) con aceleracion NPU, en lugar de depender de GPU o CPU. La configuracion publicada es un unico preset de 640x640 píxeles que utiliza un solo nucleo NPU del RK3576, orientado a dispositivos embebidos con restricciones de consumo y coste.

Es relevante para desarrolladores que trabajan con placas basadas en RK3576 (por ejemplo, tarjetas industriales, camaras inteligentes o robots) y necesitan un pipeline de vision ya cuantizado y verificado por SHA-256, evitando la conversion manual desde el modelo original. La licencia AGPL-3.0 condiciona su uso en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv8n, deteccion de objetos) |
| Parametros totales | no disponible en esta ficha (el YOLOv8n original documenta ~3,2 M de parametros segun Ultralytics) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de 640x640 píxeles) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (runtime RKNN v2.4.0) |

Configuracion publicada:

| Configuracion | Chip soportado | Runtime RKNN | Cuantizacion | Nucleos NPU | Resolucion |
|---|---|---|---|---|---|
| yolov8n-640x640-w8a8-1 | RK3576 | v2.4.0 | w8a8 | 1 | 640x640 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8n, una red neuronal convolucional (CNN) de la familia YOLO de Ultralytics, distribuida en este caso a traves del fork airockchip/ultralytics_yolov8. La variante "n" (nano) es la mas ligera de la gama YOLOv8 y esta disenada para inferencia en dispositivos con recursos limitados. El repositorio no describe la topologia interna ni las capas concretas; la model card solo indica el tipo de modelo (CNN) y la configuracion de despliegue.

No se documenta en la informacion proporcionada el proceso de entrenamiento del modelo origen: no hay datos sobre el numero de tokens o imagenes, la composicion del dataset (por ejemplo, COCO u otro), ni sobre tecnicas de ajuste como RLHF o DPO (no aplicables a un detector de objetos). Lo que si se detalla es el proceso de conversion: el modelo se exporta a formato RKNN para RK3576 con la precision indicada en cada configuracion (en este caso w8a8). Se conservan los avisos de copyright y atribucion originales en el archivo de licencia, y el modelo se distribuye a traves del RKNN Model Zoo.

## Capacidades

- Deteccion de objetos sobre imagenes de 640x640 píxeles: localizacion de cajas delimitadoras y clasificacion de las clases entrenadas por el modelo origen.
- Inferencia acelerada en la NPU del RK3576, con soporte de un nucleo NPU en esta configuracion.
- Cuantizacion w8a8 lista para produccion, lo que reduce el consumo de memoria y acelera la ejecucion en el hardware objetivo.
- Verificacion de integridad mediante sumas SHA-256 incluidas en el repositorio (archivo SHA256SUMS).
- No dispone de generacion de texto, razonamiento, matematicas, tool calling, capacidades de agente, soporte multilingue ni entrada de audio.
- No se documenta soporte de multiples resoluciones ni de otros chips distintos de RK3576 en esta distribucion.

## Casos de uso

- Analitica de video en dispositivos de borde: el modelo puede ejecutarse sobre flujos de camara conectados a un SoC RK3576 para detectar personas u objetos en tiempo real, aprovechando la NPU para liberar la CPU.
- Camaras inteligentes de vigilancia: integracion en firmware de camaras IP basadas en RK3576 para generar eventos de deteccion sin enviar el video a la nube.
- Robotica movil: deteccion de obstaculos o marcadores visuales en robots de bajo consumo que incorporan el RK3576 como unidad de percepcion.
- Inspeccion industrial automatizada: verificacion de presencia o ausencia de piezas en lineas de produccion mediante una camara y una placa RK3576 embebida.
- Sistemas de conteo y aforo: conteo de vehiculos o personas en accesos, aparcamientos o pasillos, desplegando el modelo directamente en el dispositivo.
- Prototipado rapido de vision embebida: punto de partida ya cuantizado y verificado para desarrolladores que quieren validar un pipeline YOLOv8 en RK3576 antes de personalizar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP), latencia ni throughput para esta configuracion.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3576 con NPU. En esta configuracion se utiliza 1 nucleo NPU.
- Runtime requerido: RKNN v2.4.0 (version especifica indicada en la configuracion).
- No esta pensado para GPU de escritorio ni para tarjetas como A100, H100 o RTX 4090; es un despliegue especifico para NPU de borde.
- Cuantizacion w8a8, orientada a reducir huella de memoria y consumo en el dispositivo embebido.
- Opciones de despliegue: el propio runtime RKNN sobre RK3576. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision en este formato).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| RK3576-CNN-yolov8n (esta ficha) | CNN deteccion | no disponible (YOLOv8n original ~3,2 M) | RKNN (w8a8) | RK3576 | AGPL-3.0 |
| YOLOv8n original (Ultralytics) | CNN deteccion | ~3,2 M (segun Ultralytics) | PyTorch, ONNX y varios | GPU/CPU generica | AGPL-3.0 |
| Otras variantes del RKNN Model Zoo | CNN deteccion | no disponible | RKNN | Chips Rockchip | segun modelo origen |

No se dispone de datos de rendimiento comparativos para establecer una comparacion cuantitativa con alternativas en la misma categoria dentro de la informacion proporcionada. Las filas de la tabla anteriores recogen solo caracteristicas generales conocidas, no resultados medidos.

## Limitaciones y advertencias

- Licencia AGPL-3.0: impone obligaciones de copyleft que afectan al uso comercial y a la distribucion de productos derivados; conviene revisar el LICENSE incluido antes de integrarlo en un producto propietario.
- Compatibilidad restringida a un unico chip (RK3576) y a un unico runtime (RKNN v2.4.0); usar ficheros de otra configuracion puede provocar fallos de despliegue.
- Solo se ofrece una configuracion (640x640, w8a8, 1 nucleo NPU); no hay variantes de mayor resolucion ni precision mixta en este repositorio.
- Riesgo de degradacion de precision por la cuantizacion w8a8 en comparacion con el modelo original en coma flotante; no se aportan metricas que cuantifiquen esa perdida.
- El modelo es un detector de objetos: puede producir falsos positivos o falsos negativos, especialmente en condiciones de baja iluminacion, oclusion o clases poco representadas.
- No se documentan sesgos del dataset de entrenamiento origen (no se especifica el dataset), lo que impide evaluar sesgos de clase, genero o etnia en las detecciones.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta: no hay validacion de la comunidad ni evidencia publica de despliegues reales.
- El tamano del repositorio aparece como 0,0 GB en los metadatos, lo que puede indicar ficheros no visibles o un empaquetado distinto al esperado; conviene verificar los SHA-256 antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/RKNNAI/RK3576-CNN-yolov8n
- Modelo origen (fork de Ultralytics): https://github.com/airockchip/ultralytics_yolov8
- RKNN Model Zoo (ejemplo YOLOv8): https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Repositorio en ModelScope: RKNNAI/RK3576-CNN-yolov8n (revision v2.4.0)
