# RKNNAI/RK3588-CNN-yolov8m

## Resumen

RK3588-CNN-yolov8m es un paquete de despliegue del detector de objetos YOLOv8m convertido al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. No es un modelo entrenado desde cero ni un modelo de lenguaje: es una distribucion de inferencia que toma el YOLOv8m original (red convolucional de deteccion de objetos en una sola pasada) y lo compila con cuantizacion de 8 bits en pesos y activaciones para el acelerador neuronal integrado del RK3588.

El repositorio lo publica el usuario RKNNAI y se apoya en la cadena de herramientas oficial de Rockchip. El modelo fuente procede del fork airockchip/ultralytics_yolov8 y la configuracion incluida (yolov8m-640x640-w8a8-1) esta pensada para un unico nucleo NPU, con entrada de 640x640 pixeles y runtime RKNN v2.4.0. La licencia es AGPL-3.0, heredada del proyecto Ultralytics original.

Su relevancia es practica: permite llevar un detector de categoria media (variante m de la familia YOLOv8) a hardware embebido de bajo consumo sin depender de GPU dedicada, algo habitual en videovigilancia, robotica o inspeccion industrial en el borde. Al no publicarse metricas de precision propias de esta conversion, la evaluacion debe hacerse sobre el terreno antes de desplegar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv8: backbone C2f, cuello PAN-FPN y cabeza desacoplada anchor-free) |
| Parametros totales | no confirmado en la model card; la variante m de YOLOv8 declara aproximadamente 25,9 M en la documentacion de Ultralytics |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | w8a8 (INT8 en pesos y activaciones) |
| Idiomas soportados | no aplica (modelo de deteccion visual) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (runtime RKNN v2.4.0); el modelo fuente es el YOLOv8m de airockchip/ultralytics_yolov8 |
| Tarea | Deteccion de objetos (bounding boxes) |
| Resolucion de entrada | 640x640 |
| Chip objetivo | Rockchip RK3588 |
| Nucleos NPU utilizados | 1 |
| Configuracion incluida | yolov8m-640x640-w8a8-1 |
| Tamano del repositorio | 0,0 GB (solo configuracion y documentacion) |
| Fecha de publicacion | 2026-10-02 (segun la ficha de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8, una red convolucional de deteccion en una sola etapa. Emplea un backbone con bloques C2f, un cuello de tipo PAN-FPN para fusionar caracteristicas a varias escalas y una cabeza desacoplada que separa la prediccion de clases de la regresion de cajas, sin anchors (anchor-free). Esta conversion concreta no reentrena el modelo: parte del YOLOv8m publicado en el fork airockchip/ultralytics_yolov8 y lo transforma al formato RKNN mediante la cadena rknn-toolkit2, aplicando cuantizacion w8a8 para que el grafo se ejecute en la NPU del RK3588.

La model card no detalla el dataset de entrenamiento, el numero de tokens o imagenes, ni si hubo fases de ajuste adicionales. Se trata de una distribucion de despliegue, no de un informe de entrenamiento, por lo que no se documentan hiperparametros, composicion del dataset ni tecnicas de optimizacion mas alla de la conversion y cuantizacion a INT8. El repositorio incluye un fichero SHA256SUMS para verificar la integridad de los ficheros descargados antes del despliegue.

## Capacidades

- Deteccion de objetos: genera cajas delimitadoras con clase y puntuacion de confianza sobre imagenes de 640x640 pixeles.
- Inferencia en el borde sobre NPU: ejecucion acelerada en el RK3588 mediante el runtime RKNN v2.4.0, sin necesidad de GPU.
- Procesamiento en tiempo real: apto para tuberias de video que requieren deteccion por fotograma, sujeto a la latencia real medida en el dispositivo.
- Etiquetado de clases: depende de las clases del modelo fuente; la model card no especifica la lista de categorias ni el dataset, por lo que debe confirmarse antes de usarlo.
- Integracion con RKNN Model Zoo: la configuracion sigue el flujo de ejemplo de yolov8 del repositorio oficial de Rockchip (conversion en PC y despliegue en dispositivo con las API de Python o C).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision-lenguaje ni generacion de texto: es un detector puro.

## Casos de uso

- Videovigilancia perimetral: desplegar el detector en un RK3588 conectado a camaras IP para identificar intrusiones y disparar alertas localmente, sin enviar video a la nube.
- Control de aforo: contar personas que cruzan una linea virtual en accesos, comercios o transporte publico, aprovechando el consumo reducido del SoC para instalaciones sin refrigeracion activa.
- Analitica de retail: medir flujo de clientes y ocupacion por zonas a partir de las detecciones, integrando los resultados en un panel interno.
- Robotica movil y AGV: deteccion de obstaculos y personas en la trayectoria de un robot, con inferencia a bordo para evitar dependencias de red.
- Inspeccion industrial: localizar defectos o piezas en una linea de produccion, reentrenando o adaptando el modelo si las clases de COCO no cubren el dominio objetivo.
- Trafico y aparcamiento: identificar vehiculos y estimar ocupacion de plazas en aparcamientos o vias urbanas con camaras fijas.
- Drones y sistemas embarcados: deteccion a bordo en plataformas donde el peso y el consumo energetico son criticos.
- Prototipado rapido de vision artificial: usar la configuracion w8a8 como base para validar latencia y precision en un RK3588 antes de invertir en un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (mAP), latencia ni throughput de esta conversion cuantizada. Tampoco se aportan comparaciones con el modelo YOLOv8m en punto flotante, de modo que no es posible cuantificar la perdida de precision introducida por la cuantizacion w8a8 sin una evaluacion propia en el dispositivo.

## Requisitos de hardware

- No requiere GPU: la inferencia se ejecuta en la NPU integrada del RK3588, que ofrece hasta 6 TOPS repartidos en tres nucleos de 2 TOPS. Esta configuracion utiliza un unico nucleo NPU.
- Memoria: no se especifica un requisito de VRAM; al tratarse de un SoC embebido, el modelo reside en la memoria del sistema (LPDDR4/4x/5, segun la placa). Los pesos INT8 de una variante m ocupan del orden de decenas de MB, aunque el dato exacto no esta disponible en la informacion proporcionada.
- GPU de escritorio: no aplica para la inferencia final. Solo se necesita un PC para la fase de conversion con rknn-toolkit2.
- Compatibilidad: soportado en RK3588 segun la tabla de configuraciones del repositorio. Otras plataformas Rockchip (RK3562, RK3566, RK3568, RK3576, RV1126B) aparecen en el ecosistema RKNN Model Zoo, pero no se garantizan para esta configuracion concreta.
- Despliegue: rknn-toolkit2 para la conversion en PC, rknn-toolkit-lite2 (API de Python en dispositivo) o la API de C sobre librknnrt, siguiendo los ejemplos del repositorio airockchip/rknn_model_zoo.
- Herramientas no aplicables: vLLM, llama.cpp, Ollama o TGI estan orientados a modelos de lenguaje y no sirven para ejecutar un modelo RKNN de vision.
- Latencia y throughput: no disponibles en la informacion proporcionada; deben medirse en el dispositivo concreto y con el runtime v2.4.0.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato / destino | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| RK3588-CNN-yolov8m (esta ficha) | aproximadamente 25,9 M (variante m de YOLOv8, valor no confirmado en la model card) | 640x640 | RKNN w8a8, NPU RK3588 | AGPL-3.0 | no disponible |
| YOLOv8s (variante pequena) | aproximadamente 11,2 M segun Ultralytics | 640x640 | PyTorch / ONNX / RKNN | AGPL-3.0 | no disponible en esta informacion |
| YOLOv8l (variante grande) | aproximadamente 43,7 M segun Ultralytics | 640x640 | PyTorch / ONNX / RKNN | AGPL-3.0 | no disponible en esta informacion |
| YOLOv5m | no disponible en la informacion proporcionada | 640x640 | PyTorch / ONNX / RKNN | GPL-3.0 en versiones antiguas, AGPL-3.0 en las recientes | no disponible |

Las cifras de parametros de las variantes s y l corresponden a la documentacion publica de Ultralytics y no se han verificado en este repositorio. No se dispone de datos de mAP ni de latencia comparables para ninguna de las alternativas dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Precision no documentada: no hay metricas de mAP para esta conversion, por lo que se desconoce la degradacion real provocada por la cuantizacion w8a8.
- Clases no especificadas: la model card no indica el dataset ni las categorias que detecta el modelo fuente; hay que verificarlo antes de integrarlo.
- Sin resultados de benchmarks: imposible comparar objetivamente con otras variantes sin una evaluacion propia.
- Sesgos: al no documentarse el dataset de entrenamiento, no se pueden enumerar sesgos conocidos; los modelos de deteccion suelen presentar peor rendimiento en condiciones de poca luz, oclusion o clases poco representadas.
- Riesgo de falsos positivos y negativos: inherente a cualquier detector, agravado por la cuantizacion INT8.
- Restricciones de licencia: la AGPL-3.0 es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo de las obras derivadas y a ofrecer el codigo fuente a los usuarios que interactuen con el servicio a traves de la red. Conviene revisar el impacto legal antes de integrarlo en un producto propietario.
- Dependencia de hardware: la configuracion esta ligada al RK3588 y a la version de runtime RKNN v2.4.0; usar ficheros de configuraciones distintas o versiones incompatibles del runtime puede provocar fallos.
- Nodo problematico documentado: en foros de la comunidad se ha reportado un problema con el nodo de post-procesado (generacion de cajas) en la NPU del RK3588, resuelto en algunos casos eliminando ese nodo y ejecutando el post-procesado en CPU. Verificar la salida antes de produccion.
- Verificacion obligatoria: el repositorio exige validar los ficheros con sha256sum -c SHA256SUMS antes del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-yolov8m
- RKNN Model Zoo (Rockchip): https://github.com/airockchip/rknn_model_zoo
- Ejemplo de YOLOv8 en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- Modelo fuente (fork de Ultralytics YOLOv8): https://github.com/airockchip/ultralytics_yolov8
- Documentacion de Radxa sobre RKNN Toolkit Lite2 y YOLOv8: https://docs.radxa.com/en/rock5/rock5t/app-development/ai/rknn-toolkit-lite2-yolov8
- Resumen de ejemplos del RKNN Model Zoo en DeepWiki: https://deepwiki.com/airockchip/rknn_model_zoo/5-model-examples
- Hilo de la comunidad de Radxa sobre YOLOv8 en la NPU del RK3588: https://forum.radxa.com/t/use-yolov8-in-rk3588-npu/15838
