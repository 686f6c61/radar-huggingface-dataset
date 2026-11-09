# APLUX-Agora/YOLOv8s-worldv2

## Resumen

YOLOv8s-worldv2 es un paquete de recursos de despliegue derivado del modelo de detección de objetos YOLO-World (variante small, v2), publicado por APLUX-Agora dentro de su plataforma Agora / Model Farm. No se trata de un modelo entrenado desde cero por este autor, sino de una exportación optimizada del modelo original con las 80 clases fijas del conjunto COCO, empaquetada para su ejecución en hardware Qualcomm (SoC QCS6490 y QCS8550) mediante el runtime QNN. El repositorio incluye los binarios compilados por precisión (FP16, W8A16) y la configuración de despliegue por plataforma.

El modelo resuelve la tarea de detección de objetos en el borde (edge AI / AIoT): recibe una imagen RGB y devuelve cajas delimitadoras sobre las 80 categorías de COCO. Su relevancia radica en que ofrece latencias medidas sobre placas reales —35,3 ms en QCS6490 con W8A16 y 10,4 ms en QCS8550—, lo que lo hace útil para integradores que necesitan un detector listo para producción en dispositivos Qualcomm sin pasar por el proceso de conversión y cuantización.

El repositorio es muy ligero (0,1 GB) y no contiene pesos en formato estándar (safetensors o GGUF), sino artefactos de despliegue específicos por SoC. La licencia es propietaria (APLUX Model Farm License), con la licencia del modelo fuente remitida a los términos originales de YOLO-World.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO-World v2, variante small (detector de objetos con decodificación DFL multiescala) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | FP16 y W8A16 (según SoC) |
| Idiomas soportados | no disponible (no aplica; salida de etiquetas COCO) |
| Licencia | APLUX Model Farm License (propietaria); modelo fuente sujeto a sus términos originales |
| Formato de pesos | binarios compilados QNN (`model.bin`) por SoC y precisión; `model.json` de configuración |
| Entrada | imagen RGB |
| Salida | cajas delimitadoras (`boxes`) |
| Clases | 80 clases fijas de COCO |
| SoC soportados | QCS6490, QCS8550 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO-World v2 en su variante small, un detector de objetos de una sola etapa basado en la familia YOLOv8. La exportación de Model Farm fija el vocabulario a las 80 clases de COCO y emplea la entrada RGB oficial junto con una decodificación DFL (Distribution Focal Loss) por escalas. El paquete no incluye información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO), que corresponde al modelo YOLO-World publicado por sus autores originales y no a este repositorio.

La innovación técnica de esta publicación no está en el modelo en sí, sino en el pipeline de conversión y despliegue: los pesos se compilan para el runtime QNN de Qualcomm y se ofrecen en dos precisiones (FP16 y W8A16), con procesamiento previo y posterior, runner y proyecto exportable disponibles a través de la plataforma Agora. El repositorio organiza los artefactos en `targets/<SoC>/`, con un `model.json` que indica la precisión por defecto y las rutas de las variantes.

## Capacidades

- Detección de objetos sobre imágenes RGB con las 80 clases fijas de COCO.
- Salida de cajas delimitadoras (`boxes`) con la decodificación DFL multiescala del modelo original.
- Ejecución en hardware Qualcomm (QCS6490 y QCS8550) mediante runtime QNN.
- Dos precisiones de inferencia: FP16 y W8A16, seleccionables por plataforma.
- Integración con la plataforma Agora para despliegue, medición y exportación de flujos de trabajo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües: es un detector de visión puro.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la detección sobre imagen.

## Casos de uso

- Inspección visual en línea de producción: el detector puede ejecutarse en placas QCS6490 o QCS8550 a 35,3 ms y 10,4 ms respectivamente, lo que permite clasificar piezas o detectar defectos en cadenas de fabricación con requisitos de tiempo real.
- Vigilancia y analítica de vídeo en el borde: al ejecutarse localmente en el SoC, evita enviar vídeo a la nube y reduce latencia y coste de ancho de banda; útil en cámaras IP con Qualcomm integrado.
- Robots móviles y AGV: la detección de personas, obstáculos y objetos COCO a bordo permite navegación reactiva sin depender de conectividad.
- Comercio minorista automatizado: conteo de productos y personas en estanterías o puntos de venta usando las clases COCO relevantes, con inferencia en el propio dispositivo.
- Sistemas de asistencia a la conducción de bajo coste: detección de peatones, vehículos y señales de tráfico (clases COCO) en plataformas embebidas Qualcomm.
- Prototipado rápido en AIoT: gracias al paquete precompilado y a la guía de despliegue de Agora, un integrador puede validar un caso de detección en placa real sin realizar la conversión y cuantización manual.
- Monitorización de aforo y seguridad: detección de personas en espacios controlados con procesamiento local, reduciendo exposición de datos personales.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son latencias medidas en placas reales con la precisión por defecto:

| SoC · placa | Precisiones | Latencia medida (Agora, precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16 | 35,3 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 10,4 ms |

No se han publicado resultados de benchmarks de precisión (mAP, MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para NPU/SoC Qualcomm, no para GPU de escritorio.
- GPU recomendadas: no aplica; el despliegue objetivo es QCS6490 y QCS8550 con runtime QNN.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: runtime QNN de Qualcomm a través de la plataforma Agora; descarga por SoC con `hf download APLUX-Agora/YOLOv8s-worldv2 --include "targets/<SoC>/*"`.
- Latencia: 35,3 ms en QCS6490 (W8A16) y 10,4 ms en QCS8550 (precisión por defecto).
- Throughput: no disponible.
- Procesamiento previo y posterior, runner y proyecto exportable: disponibles en Agora mediante la guía de despliegue o exportando un flujo de trabajo que use el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Clases | Licencia | Despliegue |
|---|---|---|---|---|---|
| YOLOv8s-worldv2 (este paquete) | no disponible (variante small) | imagen RGB | 80 COCO fijas | APLUX Model Farm License (propietaria) | QNN en QCS6490 / QCS8550 |
| YOLOv8s (Ultralytics) | no disponible en la información | imagen RGB | configurable | AGPL-3.0 / comercial Ultralytics | GPU, CPU, exportación ONNX/TensorRT |
| YOLO-World original | no disponible en la información | imagen RGB + vocabulario abierto | vocabulario abierto | según términos del modelo fuente | frameworks estándar |

No se dispone de datos de precisión (mAP) para establecer una comparación cuantitativa con alternativas; la comparación se limita a formato de despliegue, licencia y vocabulario de clases.

## Limitaciones y advertencias

- El vocabulario está fijado a las 80 clases de COCO; no permite detección de clases abiertas ni personalizadas sin reexportar el modelo.
- No se publican métricas de precisión (mAP) en la información disponible, por lo que el rendimiento de detección no puede validarse a partir de este repositorio.
- La licencia APLUX Model Farm License es propietaria y restringe el uso; es necesario revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial.
- Los términos del modelo fuente (YOLO-World) se remiten a su licencia original; pueden imponer condiciones adicionales.
- El repositorio no contiene pesos en formatos estándar (safetensors, GGUF, ONNX), solo binarios QNN por SoC, lo que limita su portabilidad a otras plataformas.
- Solo se documentan dos SoC (QCS6490 y QCS8550); no hay garantía de funcionamiento en otros chips Qualcomm.
- Riesgo de sesgos y alucinaciones inherente al modelo fuente: el detector puede fallar en clases poco representadas en COCO, en condiciones de iluminación adversas o con oclusiones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por la comunidad.
- No se documentan idiomas ni capacidades de texto: no debe usarse como modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/YOLOv8s-worldv2
- Prueba online en Agora: https://mega.aidlux.com/models/yolov8s-worldv2
- Plataforma Agora: https://mega.aidlux.com
- Licencia del modelo (PDF): https://huggingface.co/APLUX-Agora/YOLOv8s-worldv2/blob/main/LICENSE_MODEL_FARM.pdf
- Documentos de procedencia: `NOTICE.md` y `SHA256SUMS` en el repositorio
