# qualcomm/MobileNet-v4

## Resumen

MobileNet-v4 es una red neuronal convolucional (CNN) para clasificacion de imagenes, publicada en HuggingFace por Qualcomm como parte de su catalogo Qualcomm AI Hub Models. El modelo clasifica imagenes del dataset ImageNet y tambien puede utilizarse como backbone para construir modelos mas complejos orientados a casos de uso concretos (deteccion, segmentacion, clasificacion personalizada). Su relevancia actual no esta en el tamano, sino en el enfoque: el repositorio no distribuye pesos de investigacion, sino artefactos ya exportados y optimizados para ejecutarse sobre la NPU Hexagon de los chipsets Snapdragon y Dragonwing.

Tecnicamente se trata de un modelo pequeno: 9,68 millones de parametros, entrada de 224x224 pixeles y un peso de 37,0 MB en precision float, que se reduce a 10,2 MB con cuantizacion w8a8. La model card no especifica que variante concreta de MobileNetV4 se ha exportado; el recuento de parametros es el unico dato disponible para caracterizarla. El checkpoint indicado es ImageNet y la licencia declarada es MIT.

La model card es, sobre todo, una guia de despliegue: ofrece descargas listas para produccion en ONNX (float y w8a8), QNN_DLC (float y w8a8) y TFLite (float y w8a8), junto con tiempos de inferencia medidos sobre mas de una docena de chipsets. Los tiempos van de 0,302 ms a 1,733 ms con la NPU como unidad de computo principal, lo que lo sitúa como un componente viable para pipelines de vision en tiempo real en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional MobileNetV4 (la model card no especifica la variante concreta) |
| Parametros totales | 9,68 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 224x224) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC y TFLITE (float y w8a8); el repositorio declara PyTorch como libreria |

Datos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Resolucion de entrada | 224x224 |
| Checkpoint | ImageNet |
| Tamano del modelo (float) | 37,0 MB |
| Tamano del modelo (w8a8) | 10,2 MB |
| Caso de uso | image_classification |
| Unidad de computo principal | NPU (en todas las mediciones publicadas) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia MobileNetV4, descrita en el paper arXiv:2404.10518 ("MobileNetV4", referenciado en las etiquetas del repositorio). Se trata de una familia de CNN disenada para el ecosistema movil, cuyo objetivo es ofrecer una relacion precision/latencia competitiva bajo restricciones severas de memoria y computo. La model card de Qualcomm no entra en detalle sobre los bloques internos ni sobre el recetario de busqueda de arquitectura empleado; unicamente indica que esta basado en la implementacion de `jaiwei98/MobileNetV4-pytorch` y que el checkpoint corresponde a ImageNet.

No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset mas alla de ImageNet, ni si hubo etapas de ajuste fino adicionales. Tampoco aplican tecnicas de alineacion tipo RLHF o DPO, al no ser un modelo generativo de lenguaje. La innovacion practica de este repositorio no esta en el entrenamiento, sino en el proceso de exportacion y compilacion con Qualcomm AI Hub Workbench y QAIRT 2.50, que produce artefactos especificos por runtime (ONNX, QNN_DLC, TFLITE) y permite reexportar con pesos ajustados, formas de entrada personalizadas y configuraciones de dispositivo objetivo mediante la libreria `qai_hub_models`.

## Capacidades

- Clasificacion de imagenes: asigna una imagen de entrada de 224x224 a una de las clases del checkpoint ImageNet.
- Extraccion de caracteristicas (backbone): se puede reutilizar como extractor convolucional para modelos posteriores de deteccion, segmentacion o clasificacion especifica de dominio.
- Ajuste fino: la model card indica explicitamente que se pueden exportar checkpoints personalizados con pesos ajustados.
- Inferencia en tiempo real: los tiempos medidos estan por debajo de 2 ms en todos los chipsets listados, con la NPU como unidad de computo principal.
- Despliegue multiplataforma: artefactos en ONNX, QNN_DLC y TFLITE, en precision float y cuantizados w8a8.
- Integracion movil: el repositorio esta etiquetado para Android y compilado con QAIRT, lo que facilita su uso en aplicaciones de dispositivo.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Vision: si, clasificacion de imagen. Audio y modo de razonamiento explicito: no disponibles.

## Casos de uso

- Clasificacion de imagenes en tiempo real en aplicaciones Android: el modelo cabe en 10,2 MB cuantizado y se ejecuta en la NPU en menos de 1 ms en chipsets de gama alta, lo que permite clasificar fotogramas de camara sin bloquear el hilo de interfaz.
- Backbone para modelos personalizados: al ser una CNN de 9,68 M de parametros con salida de caracteristicas convolucionales, se puede congelar total o parcialmente y anadir cabezas de deteccion, segmentacion o clasificacion de dominio especifico.
- Etiquetado automatico de galerias fotograficas en el dispositivo: clasificacion local de imagenes para agruparlas por categoria sin enviar datos a un servidor, lo que reduce coste de red y mejora la privacidad.
- Control de calidad visual en linea de produccion: con inferencias por debajo de 2 ms en hardware embebido Dragonwing o QCS, se puede inspeccionar cada pieza en una cinta transportadora y descartar defectos en tiempo real.
- Moderacion y filtrado de contenido visual: uso como primer clasificador barato en un pipeline en cascada, dejando las imagenes dudosas para un modelo mayor o revision humana.
- Reconocimiento de escenas para accesibilidad: descripcion categorica del entorno captado por la camara de un dispositivo movil para alimentar sistemas de asistencia visual.
- Domotica y videovigilancia: clasificacion local de eventos (persona, vehiculo, animal, objeto) en camaras con SoC Snapdragon o Dragonwing, evitando subir video a la nube.
- Destilacion y prototipado rapido: servir como modelo de referencia o alumno/maestro en experimentos de compresion o busqueda de arquitectura, dado su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (top-1 o top-5 en ImageNet) en la informacion disponible. La model card si publica mediciones de latencia y memoria pico por chipset, con runtime ONNX y la NPU como unidad de computo principal. Se reproduce una seleccion; el listado completo figura en la model card de origen.

| Chipset | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy Mobile | float | 0,444 | 0 - 43 |
| Snapdragon 8 Elite Gen 5 for Galaxy Mobile | w8a8 | 0,337 | 0 - 53 |
| Snapdragon 8 Elite for Galaxy Mobile | float | 0,503 | 0 - 39 |
| Snapdragon 8 Elite for Galaxy Mobile | w8a8 | 0,367 | 0 - 53 |
| Snapdragon X2 Elite | float | 0,379 | 2 - 2 |
| Snapdragon X2 Elite | w8a8 | 0,302 | 1 - 1 |
| Snapdragon X Elite | float | 0,823 | 22 - 22 |
| Snapdragon X Elite | w8a8 | 0,548 | 10 - 10 |
| Snapdragon 8 Gen 3 Mobile | float | 0,613 | 0 - 74 |
| Snapdragon 8 Gen 3 Mobile | w8a8 | 0,426 | 0 - 84 |
| Snapdragon 8 Gen 1 Mobile | float | 1,436 | 0 - 77 |
| Snapdragon 8 Gen 1 Mobile | w8a8 | 0,778 | 0 - 89 |
| Qualcomm Dragonwing IQ-8275 | float | 1,27 | 1 - 5 |
| Qualcomm Dragonwing IQ-8275 | w8a8 | 0,685 | 0 - 4 |
| Qualcomm Dragonwing QCS8550 (Proxy) | float | 0,865 | 0 - 37 |
| Qualcomm Dragonwing QCS8550 (Proxy) | w8a8 | 0,578 | 0 - 76 |
| Qualcomm QCS8450 | float | 1,436 | 0 - 77 |
| Qualcomm QCS8450 | w8a8 | 0,778 | 0 - 89 |
| Qualcomm Dragonwing IQ-9075 | float | 1,201 | 1 - 4 |
| Qualcomm Dragonwing IQ-9075 | w8a8 | 0,691 | 0 - 3 |
| Qualcomm Dragonwing IQ-X7181 | float | 0,823 | 22 - 22 |
| Qualcomm Dragonwing IQ-X7181 | w8a8 | 0,548 | 10 - 10 |
| Qualcomm Dragonwing Q-8750 | float | 0,503 | 0 - 39 |
| Qualcomm Dragonwing QCS6490 | w8a8 | 1,733 | 0 - 3 |

Observaciones a partir de estos datos: la cuantizacion w8a8 reduce el tiempo de inferencia entre un 15 % y un 40 % segun el chipset; el modelo nunca supera los 2 ms por inferencia ni los 89 MB de memoria pico en las configuraciones medidas. No se publican datos de throughput por lotes ni de precision cuantizada frente a float.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB en float (peso de 37,0 MB mas activaciones) y del orden de 0,1 GB en w8a8 (peso de 10,2 MB). En las mediciones de Qualcomm la memoria pico observada va de 1 MB a 89 MB segun chipset y precision.
- GPU recomendadas: no se requiere GPU. El modelo esta optimizado para la NPU Hexagon integrada en los SoC Snapdragon y Dragonwing, que es donde se han obtenido los tiempos publicados.
- Cabe en GPU de consumo: si, en cualquier GPU moderna e incluso en graficas integradas, dado su tamano. Tambien es viable en CPU, aunque sin las optimizaciones de la NPU.
- Movil y edge: es su entorno natural. Funciona en Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite, QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181 y Q-8750, entre otros.
- Opciones de despliegue: ONNX Runtime 1.30.0, Qualcomm AI Engine Direct (QNN_DLC) con QAIRT 2.50, TensorFlow Lite (TFLITE) y PyTorch. La exportacion personalizada se realiza con la libreria `qai_hub_models` y el servicio Qualcomm AI Hub Workbench.
- Latencia: entre 0,302 ms y 1,733 ms por inferencia en NPU segun chipset y precision. La mejor marca corresponde a Snapdragon X2 Elite en w8a8 (0,302 ms) y la peor a QCS6490 en w8a8 (1,733 ms).
- Throughput: no disponible. No se publican mediciones por lotes ni imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a la posicion de cada familia. Los valores numericos de los modelos alternativos se marcan como no disponibles para no introducir cifras no verificadas.

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MobileNet-v4 (qualcomm/MobileNet-v4) | 9,68 M | 224x224 | MIT | HuggingFace y Qualcomm AI Hub, con artefactos ONNX, QNN_DLC y TFLITE | Optimizado para NPU Hexagon; latencias medidas entre 0,302 y 1,733 ms |
| MobileNetV3 | no disponible | no disponible | no disponible | no disponible | Familia predecesora de la misma linea, tambien orientada a dispositivos moviles |
| EfficientNet-Lite | no disponible | no disponible | no disponible | no disponible | Alternativa habitual en vision embebida con restricciones de latencia |
| MobileOne | no disponible | no disponible | no disponible | no disponible | Arquitectura centrada en baja latencia en dispositivo |
| ResNet-50 | no disponible | no disponible | no disponible | no disponible | Referencia clasica de backbone, con mucha mayor huella de computo |

## Limitaciones y advertencias

- Sesgos del dataset: el checkpoint esta entrenado sobre ImageNet, un conjunto con clases desbalanceadas y sesgo hacia categorias y contextos propios de paises occidentales. El rendimiento puede degradarse en dominios alejados de esa distribucion.
- Falsos positivos y calibracion: al ser un clasificador cerrado de 1000 clases, siempre devuelve una etiqueta aunque la imagen no corresponda a ninguna categoria conocida. En produccion conviene aplicar umbrales de confianza y una clase de rechazo.
- Robustez: no se publican datos de robustez frente a oclusiones, cambios de iluminacion, rotaciones o imagenes adversarias. No hay informacion sobre comportamiento fuera de distribucion.
- Precision cuantizada: la model card ofrece w8a8 pero no documenta la perdida de precision (top-1 o top-5) respecto a float. Es una incognita a validar antes de desplegar.
- Restricciones de licencia: el codigo y la exportacion se publican bajo licencia MIT, permisiva para uso comercial. Sin embargo, el checkpoint procede de ImageNet, cuyos terminos de uso restringen el uso del dataset a fines de investigacion no comerciales; conviene revisar la situacion antes de un despliegue comercial con los pesos originales.
- Dependencia de hardware: los datos de rendimiento publicados corresponden a NPU de Qualcomm con QAIRT 2.50. En otras plataformas el comportamiento no esta documentado.
- Idiomas y texto: no aplica, el modelo solo procesa imagenes. No hay capacidades de generacion, razonamiento, tool calling ni agentes.
- Idoneidad de variante: la model card no identifica la variante concreta de MobileNetV4 exportada, lo que dificulta comparar de forma estricta con resultados publicados en el paper.
- Madurez del repositorio: registra 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y ultima actualizacion identicas. Es un artefacto de publicacion, no un modelo con comunidad activa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/MobileNet-v4
- Modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mobilenet_v4
- Repositorio Qualcomm AI Hub Models (entrada MobileNet-v4, v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/mobilenet_v4
- Repositorio general de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub Workbench: https://myaccount.qualcomm.com/signup
- Implementacion PyTorch de referencia: https://github.com/jaiwei98/MobileNetV4-pytorch
- Paper de referencia (MobileNetV4): https://arxiv.org/abs/2404.10518
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilenet_v4/releases/v0.64.0/mobilenet_v4-onnx-float.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilenet_v4/releases/v0.64.0/mobilenet_v4-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilenet_v4/releases/v0.64.0/mobilenet_v4-qnn_dlc-float.zip
- Descarga QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilenet_v4/releases/v0.64.0/mobilenet_v4-qnn_dlc-w8a8.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilenet_v4/releases/v0.64.0/mobilenet_v4-tflite-float.zip
- Descarga TFLITE w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mobilenet_v4/releases/v0.64.0/mobilenet_v4-tflite-w8a8.zip
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
- Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm
