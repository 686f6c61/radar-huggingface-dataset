# APLUX-Agora/YOLOv5s

## Resumen

YOLOv5s es un detector de objetos de una etapa basado en la arquitectura Ultralytics YOLOv5s, con 7,2 millones de parametros en su modelo fuente. En esta ficha se documenta la distribucion APLUX-Agora/YOLOv5s, publicada por APLUX-Agora, que no contiene pesos en formato PyTorch ni safetensors, sino binarios QNN precompilados para aceleradores Qualcomm Hexagon, orientados a despliegues en dispositivos AIoT (edge). El modelo resuelve deteccion de objetos en 80 clases COCO sobre entradas RGB de 640 x 640 y produce una salida de forma [1, 25200, 85].

La relevancia de esta publicacion es practica: ofrece artefactos listos para ejecutar en SoC concretos (QCS6490, QCS8550, QCS8625, IQ8 e IQ9) con distintas precisiones (FP16, W8A16 y W8A8/INT8), evitando al desarrollador el proceso de conversion y cuantizacion con el SDK QNN de Qualcomm. Los binarios se copian sin modificar desde APLUX-ModelFarm/YOLOv5s y desde APLUX-ModelFarm-IQ9/YOLOv5s (revision 193087ec488613f7d1e3d9357e994b999a194a5e), y el codigo de inferencia en Python se aloja en un repositorio GitHub aparte.

No se trata de un modelo de lenguaje ni de un modelo generativo: no hay contexto de tokens, ni capacidades multilingues, ni pesos en formato abierto para reentrenamiento. La licencia es AGPL-3.0, lo que condiciona el uso en productos propietarios. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLOv5s (detector de objetos de una etapa, CNN) |
| Parametros totales | 7,2 M (modelo fuente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16, W8A16 y W8A8 (INT8) segun SoC |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | binarios QNN precompilados (no safetensors ni GGUF) |

Datos adicionales de entrada y salida:

| Parametro | Valor |
|---|---|
| Entrada | 640 x 640 RGB |
| Salida | [1, 25200, 85] |
| Clases | 80 clases COCO |
| SoC soportados | QCS6490, QCS8550, QCS8625, IQ8, IQ9 |
| Version QNN | 2.48 en QCS8550; 2.36 en QCS6490, QCS8625, IQ8 e IQ9 |
| Revision del paquete fuente | 66a7926ac030fe6cdc204e17635690d4a308e5e6 |
| Version del paquete fuente | 2026.09.28-v1.0.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv5s de Ultralytics, un detector de objetos de una etapa con backbone CSPDarknet y cuello PANet, que predice cajas delimitadoras y clases directamente en una sola pasada sobre la imagen. El modelo fuente tiene 7,2 millones de parametros y opera sobre imagenes de 640 x 640 píxeles en color, generando 25 200 predicciones de 85 valores cada una (4 coordenadas de caja, 1 puntuacion de objetividad y 80 probabilidades de clase COCO).

Esta distribucion no incluye informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre procesos de ajuste fino, RLHF o DPO; la model card no los detalla. Lo que si se documenta es el proceso de despliegue: los binarios se generan con el SDK QNN de Qualcomm y se organizan por SoC y precision. Los ficheros de QCS8550 usan QNN 2.48, mientras que los de QCS6490, QCS8625, IQ8 e IQ9 usan QNN 2.36. Los nombres de fichero de IQ8 conservan la denominacion de origen `qcs8275` y los de IQ9 conservan `qcs9100`. El directorio `W8A8_bak` de IQ9 se conserva solo por trazabilidad y no se presenta como una release INT8 cualificada. Los binarios no deben renombrarse ni asumirse compatibles entre backends por lo que indique una pagina de rendimiento.

## Capacidades

- Deteccion de objetos en 80 clases COCO sobre imagenes RGB de 640 x 640.
- Inferencia en dispositivos edge con aceleracion NPU mediante QNN en SoC Qualcomm (QCS6490, QCS8550, QCS8625, IQ8, IQ9).
- Ejecucion en tres precisiones segun plataforma: FP16, W8A16 y W8A8 (INT8), lo que permite ajustar el equilibrio entre latencia, memoria y exactitud.
- Integracion con el runtime AidLite, dependencia separada del SDK QNN.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de modalidad de audio o texto.
- No incluye modo thinking ni decodificacion especulativa.

## Casos de uso

- Videovigilancia en camaras IP con SoC Qualcomm: el modelo se ejecuta en la NPU del dispositivo con cuantizacion W8A8 o W8A16, procesando fotogramas de 640 x 640 en local sin enviar video a la nube, lo que reduce latencia y coste de ancho de banda.
- Conteo y clasificacion de personas en entornos retail: se despliega el binario correspondiente al SoC del terminal (por ejemplo QCS6490 en W8A8) para detectar las 80 clases COCO y agregar metricas de afluencia en el propio dispositivo.
- Inspeccion visual en linea de produccion industrial: con FP16 en QCS8550 o IQ9 se obtiene mayor fidelidad numerica para detectar defectos o presencia de objetos en cintas transportadoras, donde el INT8 puede degradar la precision en clases poco representadas.
- Robotica movil y AGV: la deteccion a bordo con latencia baja permite al robot reaccionar a obstaculos y personas sin depender de conectividad, usando el binario QNN del SoC integrado en el chasis.
- Drones y dispositivos AIoT con IQ8 o IQ9: al ser plataformas de bajo consumo, la variante W8A16 o FP16 permite equilibrar autonomia y calidad de deteccion en misiones de reconocimiento aereo.
- Prototipado rapido de pipelines de vision en edge: el desarrollador descarga el directorio del SoC con `hf download` y ejecuta el codigo de inferencia del repositorio GitHub, evitando la conversion y cuantizacion manual con QNN SDK.
- Sistemas de analitica de trafico urbano: deteccion de vehiculos y peatones en camaras de calle con SoC Qualcomm, enviando solo eventos o conteos al backend central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de mAP, latencia ni throughput para ninguna de las combinaciones de SoC y precision.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU de escritorio; el modelo se ejecuta en la NPU del SoC Qualcomm y consume memoria del sistema del dispositivo. No se dispone de cifras de memoria por variante.
- GPU recomendadas: no aplica; el despliegue objetivo es la NPU Hexagon de los SoC QCS6490, QCS8550, QCS8625, IQ8 e IQ9.
- Compatibilidad con GPU de consumo: no disponible; los binarios QNN estan compilados para plataformas Qualcomm concretas y no se distribuyen pesos en formato PyTorch, ONNX o GGUF para ejecutar en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime AidLite junto con el SDK QNN de Qualcomm (dependencias separadas). El codigo de inferencia en Python esta en https://github.com/APLUX-Agora/yolov5s-demo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Verificacion de integridad: el repositorio incluye SHA256SUMS con los checksums de todos los binarios.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Formatos de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv5s (APLUX-Agora, esta ficha) | 7,2 M | 640 x 640 | 80 COCO | Binarios QNN para SoC Qualcomm | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLOv5s (Ultralytics, modelo fuente) | 7,2 M | 640 x 640 | 80 COCO | PyTorch, ONNX, TensorRT, CoreML, TFLite | AGPL-3.0 | GitHub y repositorios oficiales |
| YOLOv8n (Ultralytics) | no disponible en la informacion proporcionada | no disponible | 80 COCO | PyTorch, ONNX, TensorRT, TFLite | AGPL-3.0 | Repositorios oficiales de Ultralytics |
| YOLOv5n (Ultralytics) | no disponible en la informacion proporcionada | 640 x 640 | 80 COCO | PyTorch, ONNX, TensorRT, CoreML, TFLite | AGPL-3.0 | Repositorios oficiales de Ultralytics |

La comparativa se limita a la familia YOLO porque no se dispone de datos de rendimiento de esta distribucion que permitan contrastarla con detectores de otras familias. No se han publicado cifras de mAP ni latencia para las variantes QNN de esta ficha.

## Limitaciones y advertencias

- La licencia AGPL-3.0 impone obligaciones de liberacion del codigo fuente a los servicios en red que usen el modelo; es incompatible con productos propietarios que no quieran publicar su codigo.
- Los binarios estan compilados para SoC Qualcomm especificos y versiones concretas de QNN (2.48 en QCS8550; 2.36 en el resto); no son portables a otras plataformas ni a GPU de escritorio.
- No se deben renombrar los ficheros binarios ni asumir compatibilidad entre backends a partir de paginas de rendimiento; la model card lo advierte explicitamente.
- El directorio `W8A8_bak` de IQ9 no es una release INT8 cualificada y solo se conserva por trazabilidad.
- La cuantizacion W8A8 (INT8) puede degradar la precision de deteccion frente a FP16 en clases poco representadas o condiciones de iluminacion adversas; no se aportan metricas que cuantifiquen esa perdida.
- No se documenta el dataset de entrenamiento, el proceso de anotacion ni posibles sesgos de las 80 clases COCO, que excluyen categorias relevantes en muchos dominios industriales y locales.
- Al ser un detector de objetos, no genera texto ni mantiene conversaciones; no es adecuado para tareas de razonamiento, codigo o atencion al cliente.
- El modelo puede fallar en objetos pequenos, ocluidos o en resoluciones muy distintas de 640 x 640, limitacion inherente a la arquitectura YOLOv5s.
- AidLite y el SDK QNN de Qualcomm son dependencias separadas con sus propias licencias, no cubiertas por la AGPL-3.0 del modelo.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia publica de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/YOLOv5s
- Codigo de inferencia y instrucciones: https://github.com/APLUX-Agora/yolov5s-demo
- Modelo fuente Ultralytics YOLOv5: https://github.com/ultralytics/yolov5
- Pagina del modelo en ModelFarm: https://aiot.aidlux.com/en/models/detail/16
- Repositorio de origen de los binarios: APLUX-ModelFarm/YOLOv5s (referenciado en la model card)
- Repositorio de origen de las variantes IQ8/IQ9/QCS8625: APLUX-ModelFarm-IQ9/YOLOv5s, revision 193087ec488613f7d1e3d9357e994b999a194a5e
