# qualcomm/Yolo-v4

## Resumen
Yolo-v4 (identificado como qualcomm/Yolo-v4) es un modelo de deteccion de objetos en tiempo real publicado por Qualcomm dentro de su catalogo AI Hub Models. Se trata de una implementacion de YOLOv4 Tiny basada en el repositorio bubbliiiing/yolov4-tiny-pytorch, adaptada y optimizada para ejecutarse sobre la NPU Hexagon de los chipsets Snapdragon y Dragonwing. El modelo predice cajas delimitadoras (bounding boxes) y clases de objetos sobre imagenes de entrada.

A diferencia de los grandes modelos de lenguaje, este es un detector convolucional compacto: cuenta con aproximadamente 6,06 millones de parametros y una resolucion de entrada fija de 416x416 pixeles. Su proposito es ofrecer inferencia de muy baja latencia (del orden de 0,5 a 3 milisegundos en los SoC mas recientes) directamente en dispositivos moviles y de borde, sin depender de la nube.

Es relevante ahora porque forma parte del ecosistema Qualcomm AI Hub, que permite compilar, cuantizar y perfilar modelos sobre hardware real. El repositorio no distribuye pesos pre-exportados por restricciones de licencia, de modo que el usuario debe generar los suyos mediante la libreria AI Hub Models. La licencia del modelo es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de objetos (YOLOv4 Tiny) |
| Parametros totales | 6,06 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 416x416) |
| Tipos de cuantizacion | float (fp) y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (no aplica: deteccion de objetos) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint fuente), ONNX, QNN_DLC |
| Tamano del modelo (float) | 23,1 MB |
| Tamano del modelo (w8a16) | 6,07 MB |
| Resolucion de entrada | 416x416 |
| Tarea (pipeline) | object-detection |

## Arquitectura y entrenamiento
El modelo es una variante ligera de YOLOv4, denominada YOLOv4 Tiny. YOLOv4 es una arquitectura de deteccion de objetos de una sola etapa (single-stage) que combina un backbone convolucional para extraccion de caracteristicas con cabezas de deteccion multi-escala que predicen, para cada celda, las coordenadas de la caja, la objetividad y las probabilidades de clase. La version Tiny reduce drasticamente el numero de parametros (6,06 M) y el coste computacional respecto al YOLOv4 completo, con el objetivo de habilitar inferencia en tiempo real en hardware de baja potencia. La implementacion de referencia declarada por el autor es el proyecto bubbliiiing/yolov4-tiny-pytorch.

En cuanto al proceso de entrenamiento y a la composicion exacta del dataset, no se proporciona informacion en los materiales disponibles (no se detallan numero de tokens, dataset COCO ni si hubo fases de ajuste fino). El aporte de este repositorio de Qualcomm no es el entrenamiento, sino la exportacion optimizada: mediante Qualcomm AI Hub Workbench el modelo se compila para el dispositivo y runtime objetivo, se cuantiza cuando corresponde y se perfila sobre hardware real. Los formatos de despliegue resultantes son ONNX y QNN_DLC, orientados a la NPU. No se mencionan innovaciones como decodificacion especulativa ni atencion lineal.

## Capacidades
- Deteccion de objetos: predice cajas delimitadoras y clases de objetos sobre imagenes de entrada a 416x416.
- Inferencia en tiempo real: latencias sub-milisegundo a pocos milisegundos segun el SoC, adecuadas para video y flujos en directo.
- Ejecucion en el borde: disenado para correr integramente en la NPU del dispositivo, sin conexion a la nube.
- Cuantizacion int8/w8a16: soporta exportacion cuantizada para reducir tamano (6,07 MB) y latencia.
- Compatibilidad con la cadena Qualcomm AI Hub Models para exportar con pesos propios, formas de entrada personalizadas y configuraciones de dispositivo/runtime.
- Soporte de despliegue en Android (tag android) y otros entornos de borde Qualcomm.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso
- Deteccion de objetos en camaras de smartphones: el modelo puede procesar fotogramas a 416x416 en la NPU con latencias por debajo de 1 ms en chipsets de gama alta (Snapdragon 8 Elite Gen 5), habilitando funciones como enfoque, seguimiento o etiquetado en tiempo real.
- Vision para robtica y drones: integrado en plataformas con Qualcomm QCS/SA, permite deteccion de obstaculos o personas en tiempo real sin enviar video a la nube.
- Automocion y sistemas empotrados: variantes como SA8775P, SA8650P y SA8295P muestran latencias de 2,5 a 2,6 ms, utiles para asistencia a la conduccion o monitorizacion de cabinа.
- Analitica de video en el borde (retail, industria): deteccion de personas u objetos en camaras IP con SoC Qualcomm, evitando costes de ancho de banda y cumpliendo requisitos de privacidad al no salir el video del dispositivo.
- Prototipado rapido de pipelines de vision: la libreria AI Hub Models permite reexportar el modelo con pesos ajustados y distintas formas de entrada para validar una idea en hardware real de forma remota.
- Vigilancia y seguridad perimetral: deteccion continua de intrusiones sobre streams de camara con consumo energetico reducido gracias a la ejecucion en NPU.
- Aplicaciones moviles de realidad aumentada: localizacion de objetos para superponer informacion, aprovechando la baja latencia w8a16 (por ejemplo, 0,476 ms en Snapdragon 8 Elite Gen 5).
- Investigacion en deteccion ligera: sirve como punto de comparacion base de la familia YOLO Tiny para experimentos academicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de precision (mAP sobre COCO u otros datasets) en la informacion disponible. El autor si proporciona un resumen de rendimiento de latencia y memoria sobre dispositivos Qualcomm. A continuacion se reproduce una seleccion representativa de esa tabla.

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| Yolo-v4 | ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 0,833 | 0 - 29 | NPU |
| Yolo-v4 | ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 0,975 | 0 - 29 | NPU |
| Yolo-v4 | ONNX | float | Snapdragon 8 Gen 3 Mobile | 1,27 | 0 - 43 | NPU |
| Yolo-v4 | ONNX | float | Snapdragon 8 Gen 1 Mobile | 2,894 | 1 - 51 | NPU |
| Yolo-v4 | ONNX | float | Snapdragon X Elite | 1,896 | 10 - 10 | NPU |
| Yolo-v4 | ONNX | w8a16 | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 0,615 | 0 - 35 | NPU |
| Yolo-v4 | ONNX | w8a16 | Snapdragon 8 Elite For Galaxy Mobile | 0,769 | 0 - 35 | NPU |
| Yolo-v4 | ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 0,987 | 0 - 56 | NPU |
| Yolo-v4 | ONNX | w8a16 | Qualcomm Dragonwing QCS6490 | 14,81 | 16 - 19 | NPU |
| Yolo-v4 | ONNX | w8a16 | Qualcomm Dragonwing Q-6690 | 17,434 | 16 - 167 | NPU |
| Yolo-v4 | QNN_DLC | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 0,696 | 2 - 31 | NPU |
| Yolo-v4 | QNN_DLC | float | Snapdragon 8 Gen 3 Mobile | 1,121 | 0 - 39 | NPU |
| Yolo-v4 | QNN_DLC | w8a16 | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 0,476 | 1 - 32 | NPU |
| Yolo-v4 | QNN_DLC | w8a16 | Snapdragon 8 Elite For Galaxy Mobile | 0,632 | 0 - (no completo en la fuente) | NPU |

Los datos completos, incluyendo numerosos chipsets Dragonwing (IQ-8275, IQ-9075, QCS8550, Q-8750, etc.) y las variantes QNN_DLC cuantizadas, estan en la model card original.

## Requisitos de hardware
- VRAM/artefacto de modelo: 23,1 MB en float y 6,07 MB en w8a16, por lo que el almacenamiento necesario es minimo.
- Hardware objetivo: NPU Hexagon de SoC Qualcomm Snapdragon y Dragonwing (no esta pensado para GPU de escritorio; su despliegue nativo es en el borde).
- Chipsets soportados y latencias medidas: Snapdragon 8 Elite Gen 5 For Galaxy Mobile (0,833 ms float / 0,615 ms w8a16 en ONNX), Snapdragon 8 Elite For Galaxy Mobile, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Snapdragon X Elite, Snapdragon X2 Elite, y la linea Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS6490, QCS8550, Q-6690, Q-7790) y plataformas para automocion (SA8775P, SA8650P, SA8255P, SA8295P).
- Cabe en hardware de consumo/dispositivo: si, en cualquier smartphone o modulo con NPU Snapdragon/Dragonwing soportado; los peaks de memoria medidos van desde 2 MB hasta unos 167 MB segun el chipset y la precision.
- Opciones de despliegue: exportacion y compilacion mediante la libreria Qualcomm AI Hub Models y Qualcomm AI Hub Workbench; runtimes ONNX y QNN_DLC sobre NPU.
- Latencia: desde 0,476 ms (QNN_DLC w8a16 en Snapdragon 8 Elite Gen 5) hasta del orden de 17 ms en algunos chipsets de gama baja (Q-6690). No se proporcionan datos de throughput agregado (FPS) de forma explicita.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yolo-v4 (este) | 6,06 M | 416x416 | PyTorch, ONNX, QNN_DLC | MIT | AI Hub Models (pesos no distribuidos; exportacion propia) |
| YoloV7 / YoloV8 / YoloV9 / YoloV11 (Qualcomm AI Hub) | no disponible | no disponible | ONNX, QNN_DLC y otros | no disponible | Incluidos en Qualcomm AI Hub Models, con variantes de segmentacion, OBB y pose |
| YOLOv4 completo (familia original) | no disponible | no disponible | segun implementacion | segun implementacion original | Repositorios open source de la comunidad |

No se dispone de datos de parametros, contexto ni precision comparada de las alternativas dentro de la informacion proporcionada; la comparacion se limita a lo declarado en el repositorio de Qualcomm, que documenta la familia YOLO (v7, v8, v9, v11 y sus variantes de segmentacion, orientacion y pose) junto a este YoloV4 Tiny.

## Limitaciones y advertencias
- No se distribuyen pesos pre-exportados por restricciones de licencia: el usuario debe compilar y exportar el modelo el mismo con la libreria AI Hub Models.
- No hay datos de precision (mAP) publicados, por lo que el rendimiento en deteccion no esta cuantificado en la informacion disponible.
- Es un modelos especifico de Qualcomm: su explotacion optima requiere hardware con NPU Snapdragon/Dragonwing y el runtime QNN/ONNX correspondiente; no esta orientado a GPU de escritorio ni a servidores tradicionales.
- Al ser una variante Tiny, su capacidad de deteccion de objetos pequenos o en escenas densas es inferior a la de modelos YOLO mas grandes, aunque no se aportan metricas que lo confirmen.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de un LLM; si aplican los sesgos propios del dataset de entrenamiento (no declarado), que puede afectar a la deteccion de determinadas clases o contextos.
- Limitacion de idioma: no aplica (modelo de vision); la metadata de idiomas figura como no disponible.
- Uso comercial: la licencia del repositorio es MIT; conviene verificar las condiciones del modelo base original y de la implementacion de terceros (bubbliiiing) antes de un despliegue en produccion.
- Los datos de latencia corresponden a perfiles sobre dispositivos concretos y pueden variar con la version del runtime, la cuantizacion o la resolucion de entrada.
- Nota: las fechas de creacion y actualizacion del repositorio (2026) y el conteo de descargas/likes (0) son los reportados en la metadata; el modelo no muestra todavia traccion de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/qualcomm/Yolo-v4
- Repositorio AI Hub Models (YoloV4): https://github.com/qualcomm/ai-hub-models/blob/v0.63.0/src/qai_hub_models/models/yolov4
- Repositorio AI Hub Models (general): https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- Documentacion DeepWiki sobre modelos YOLO en AI Hub Models: https://deepwiki.com/qualcomm/ai-hub-models/4.3.1-yolo-models
- Paper de YOLOv4 (referencia de arquitectura): https://arxiv.org/abs/2004.10934
- Analisis sobre YOLOv4 en deteccion en tiempo real: https://arxiv.org/html/2502.04161v1
- Implementacion base YOLOv4 Tiny en PyTorch: https://github.com/bubbliiiing/yolov4-tiny-pytorch
