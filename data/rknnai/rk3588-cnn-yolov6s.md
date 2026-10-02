# RKNNAI/RK3588-CNN-yolov6s

## Resumen

YOLOv6s es un detector de objetos de una sola etapa basado en redes convolucionales (CNN) que forma parte de la familia YOLOv6, publicada originalmente por Meituan. Este repositorio no contiene el modelo de entrenamiento en PyTorch, sino la conversion del YOLOv6s a formato RKNN para su despliegue en el acelerador NPU del SoC Rockchip RK3588, a resolucion 640x640 y con cuantizacion w8a8. El paquete lo distribuye el usuario RKNNAI como configuracion de despliegue lista para el runtime RKNN v2.4.0.

El problema que resuelve es el de llevar un detector de objetos entrenado (sobre el dataset COCO) a hardware de borde con NPU integrada, evitando al desarrollador el trabajo de exportacion, calibracion de cuantizacion y verificacion de integridad (hash SHA-256 incluido en el repositorio). Se apoya en la cadena de herramientas RKNPU SDK y en el RKNN Model Zoo de airockchip.

Es relevante para quienes construyen sistemas de vision embebidos sobre placas RK3588 (por ejemplo SBC de gama alta o dispositivos de vision industrial), donde se busca inferencia de deteccion a baja latencia y bajo consumo sin depender de GPU. No se trata de un modelo de lenguaje: no tiene parametros activos tipo MoE, ni ventana de contexto, ni soporte de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (detector de objetos de una etapa, familia YOLOv6) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (.rknn) |
| Resolucion de entrada | 640x640 |
| Chips soportados | RK3588 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | v2.4.0 |
| Modelo fuente | airockchip/YOLOv6 (derivado de YOLOv6 de Meituan) |
| Tarea | Deteccion de objetos (COCO) |

## Arquitectura y entrenamiento

El modelo base es YOLOv6s, un detector de objetos de una etapa y sin anclas (anchor-free) de tipo CNN. Esta ficha no documenta detalles de entrenamiento propios: el repositorio es una configuracion de despliegue, no un informe de entrenamiento, y por tanto no se declaran el numero de tokens (no aplica), el volumen del dataset ni si se aplico RLHF/DPO (tecnicas que no aplican a un detector de vision). La unica informacion de entrenamiento disponible es que parte del modelo YOLOv6 mantenido en el repositorio airockchip/YOLOv6.

La innovacion tecnica relevante aqui no esta en la arquitectura del detector, sino en el pipeline de conversion y despliegue: el modelo se ha exportado a RKNN y cuantizado a w8a8 para ejecutarse sobre un solo nucleo NPU del RK3588 con el runtime v2.4.0. El repositorio incluye un fichero SHA256SUMS para verificar la integridad de los ficheros antes del despliegue, y una unica configuracion publicada (yolov6s-640x640-w8a8-1). No se documentan innovaciones de decodificacion especulativa ni de atencion, ya que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos sobre imagenes y fotogramas de video, con el conjunto de clases del dataset COCO.
- Inferencia sobre la NPU del RK3588 mediante el runtime RKNN v2.4.0 (API Python y C disponibles a traves del RKNPU SDK).
- Ejecucion con cuantizacion w8a8, orientada a reducir el consumo de memoria y a aumentar el throughput en el acelerador frente a una ejecucion en coma flotante.
- Entrada a resolucion fija de 640x640 píxeles.
- Verificacion de integridad de los artefactos mediante hash SHA-256 antes del despliegue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Videovigilancia en el borde: el modelo se ejecuta en la NPU del RK3588 para detectar personas, vehiculos y otros objetos en flujos de camaras IP, sin enviar video a la nube y reduciendo latencia y ancho de banda.
- Robotica movil: integracion en robots o AGV con placa RK3588 para tareas de percepcion y evitacion de obstaculos a 640x640, aprovechando la NPU para liberar la CPU.
- Inspeccion industrial en linea: deteccion de productos o componentes en cintas transportadoras con inferencia local, donde la cuantizacion w8a8 reduce el coste computacional por fotograma.
- Analisis offline de video: procesamiento por lotes de grabaciones para etiquetar objetos, apoyandose en las herramientas de C API o Python del RKNPU SDK.
- Sistemas de conteo y aforo: deteccion de personas para estadisticas de ocupacion en espacios publicos, ejecutada en el propio dispositivo sin conexion permanente.
- Drones y plataformas embebidas: percepcion a bordo con bajo consumo energetico, donde el formato RKNN y la NPU permiten prescindir de GPU dedicada.
- Prototipado de producto de vision: punto de partida para validar rapidamente un detector en hardware Rockchip antes de invertir en entrenamientos o integraciones mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye valores de mAP (COCO), latencia ni throughput para esta configuracion, y no se aportan comparaciones numericas con otros modelos.

## Requisitos de hardware

- Hardware de destino: SoC Rockchip RK3588 con NPU y el runtime RKNN v2.4.0.
- NPU: 1 nucleo configurado en esta variante (yolov6s-640x640-w8a8-1).
- Cuantizacion: w8a8, lo que reduce el uso de memoria respecto a una ejecucion en coma flotante, aunque no se especifican cifras de VRAM o memoria NPU en la informacion disponible.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el modelo esta pensado para la NPU del RK3588 y no se documenta su ejecucion en GPU de escritorio o centro de datos.
- Cabe en hardware de borde, no en GPU de consumo como tal, porque su destino es el SoC Rockchip; no se ofrecen estimaciones de latencia ni throughput.
- Opciones de despliegue: runtime RKNN v2.4.0 mediante el RKNPU SDK y los ejemplos de RKNN Model Zoo (API Python y C API). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Distribucion de los artefactos: ModelScope y Hugging Face, con verificacion opcional por SHA-256.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Cuantizacion | Chip de destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK3588-CNN-yolov6s (este) | CNN, deteccion, una etapa | 640x640 | w8a8 | RK3588 | GPL-3.0 | Hugging Face, ModelScope |
| YOLOv6 (familia, airockchip/YOLOv6) | CNN, deteccion, una etapa | segun variante | no disponible | no disponible | GPL-3.0 (upstream) | GitHub |
| Otros modelos del RKNN Model Zoo | CNN (deteccion, clasificacion, etc.) | segun modelo | segun modelo | RK3562, RK3566, RK3568, RK3576, RK3588 | segun modelo | GitHub |

No se dispone de datos numericos de rendimiento para establecer una comparacion cuantitativa con alternativas concretas como YOLOv5s o YOLOv8s en formato RKNN, por lo que la comparacion se limita a tipo, formato, chip y licencia.

## Limitaciones y advertencias

- Es un modelo de vision, no de lenguaje: no debe utilizarse para generacion de texto, razonamiento ni tareas de conversacion.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre COCO, su comportamiento depende de la distribucion de clases y escenas de dicho dataset.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si existe riesgo de falsos positivos y falsos negativos propios de todo detector, agravado por la cuantizacion w8a8.
- Limitaciones de resolucion: la entrada esta fija a 640x640; objetos muy pequenos o escenas con mucha densidad pueden degradar el resultado.
- Limitaciones de idioma: no aplica.
- La cuantizacion w8a8 puede reducir la precision (mAP) respecto al modelo en coma flotante; no se aportan cifras de dicha perdida.
- Restricciones de licencia: GPL-3.0, lo que impone obligaciones de copyleft para uso comercial y redistribucion; conviene revisar el fichero LICENSE antes de integrarlo en un producto propietario.
- Solo se declara compatibilidad con RK3588 y una unica configuracion; usar ficheros de configuraciones distintas puede provocar fallos.
- Se recomienda verificar los artefactos con SHA256SUMS antes de desplegar; si alguna entrada no reporta OK, no debe desplegarse.
- El repositorio figura con 0 descargas y 0 likes, y un tamano de repo de 0.0 GB, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RKNNAI/RK3588-CNN-yolov6s
- Modelo fuente YOLOv6 de airockchip: https://github.com/airockchip/YOLOv6
- RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo
- Ejemplo de YOLOv6 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov6
- RKNN Model Zoo (espejo en Codeberg): https://codeberg.org/airockchip/rknn_model_zoo
- Documentacion de ejemplos de modelos del RKNN Model Zoo: https://deepwiki.com/airockchip/rknn_model_zoo/5-model-examples
- Despliegue de YOLOv6 en reComputer RK3576 y RK3588 (referencia externa): https://sensecraft.seeed.cc/ai-lab/en/models/yolov6-rknn
