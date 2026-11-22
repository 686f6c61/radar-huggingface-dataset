# inference4j/yolo26n

## Resumen

YOLO26n es la variante nano del detector de objetos YOLO26 de Ultralytics, exportada a formato ONNX. Este repositorio concreto (`inference4j/yolo26n`) es un espejo sin modificaciones del export oficial de `onnx-community`, publicado para su uso con inference4j, una biblioteca de inferencia para Java. El modelo resuelve deteccion de objetos en 80 clases del dataset COCO y su rasgo diferencial es que incorpora NMS (Non-Maximum Suppression) dentro del grafo, de modo que la salida ya viene filtrada y no requiere post-procesado en el codigo cliente.

Se trata de un detector single-shot de tipo YOLO, en su tamano mas pequeno (nano), con entrada fija de `[1, 3, 640, 640]` en RGB normalizado a 0-1. Segun la model card, alcanza un COCO AP de 40.9 en val2017, cifra reportada por Ultralytics. Los pesos originales son de PyTorch (Ultralytics) y se han exportado a ONNX; el repositorio en si no incluye codigo de entrenamiento ni scripts de exportacion propios.

Su relevancia practica esta en el despliegue: al ser ONNX y no requerir NMS externo, simplifica la integracion en entornos JVM y en runtimes ONNX Runtime, ademas de reducir la logica de post-procesado en produccion. La licencia AGPL-3.0 es, sin embargo, una restriccion importante para uso comercial cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 Nano (detector single-shot sin NMS en post-procesado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio contiene el export ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; las 80 clases COCO estan en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

YOLO26n es un detector de objetos single-shot de la familia YOLO, en su variante nano. La innovacion declarada en la model card es la incorporacion de NMS dentro del propio modelo: la salida ONNX ya contiene las detecciones filtradas, por lo que el consumidor no necesita aplicar supresion de no maximos. La entrada esta fijada en `[1, 3, 640, 640]` con valores RGB normalizados entre 0 y 1.

El entrenamiento se realizo sobre COCO 2017 con 80 clases, segun la informacion de procedencia del repositorio. No se detallan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si hubo fases de ajuste fino adicionales. Los pesos originales son de Ultralytics (PyTorch) y el export ONNX lo realizo onnx-community; este repositorio espejo no introduce cambios en los ficheros.

## Capacidades

- Deteccion de objetos en imagenes RGB de 640x640 con 80 clases del dataset COCO.
- Salida con NMS incorporado: no requiere post-procesado de supresion de cajas solapadas.
- Devuelve etiqueta de clase, confianza y coordenadas de caja delimitadora (x1, y1, x2, y2), segun el ejemplo de uso de inference4j.
- Inferencia en Java mediante la biblioteca inference4j (`Yolo26Detector`).
- Ejecutable mediante runtime ONNX (ONNX Runtime u otros compatibles).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision para deteccion.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision-language, audio).

## Casos de uso

- Deteccion de peatones y vehiculos en video de trafico: el modelo procesa fotogramas de 640x640 y devuelve cajas con clase y confianza, adecuado para conteo y analitica de aforo en tiempo real con ONNX Runtime.
- Moderacion de imagenes en plataformas UGC: permite identificar personas, objetos y escenas de las 80 clases COCO antes de aplicar reglas de negocio, con la ventaja de que la salida ya viene filtrada por NMS.
- Automatizacion de inventario en retail: deteccion de productos y personas en estanterias o lineas de caja, integrable en pipelines Java existentes mediante inference4j.
- Preprocesado para sistemas de vision en JVM: uso como primer estadio de un pipeline (recorte de regiones de interes, seguimiento posterior) sin salir del ecosistema Java.
- Analisis de imagenes en aplicaciones de escritorio o servidores Java: al ser ONNX y con NMS integrado, se reduce la dependencia de librerias nativas de vision.
- Prototipado rapido de demos de deteccion: el tamano nano y la ausencia de post-procesado permiten iterar con poco codigo y desplegar en CPU o GPU modesta.
- Filtrado previo en sistemas de videovigilancia: deteccion de personas y objetos para disparar alertas o recortes que se envian a un modelo mayor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| COCO AP (val2017) | 40.9 | Reportado por Ultralytics, citado en la model card |

No se han publicado en la informacion disponible resultados de latencia, throughput ni comparativas numericas con otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al ser un modelo nano con entrada 640x640, es esperable que quepa en GPUs de gama baja, pero no se confirma con datos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; por el tamano nano es plausible en RTX serie 30/40, pero no hay dato oficial en la ficha.
- Opciones de despliegue: ONNX Runtime (via inference4j en Java); otros runtimes ONNX no se documentan en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| YOLO26n (este) | no disponible | 640x640 | 40.9 | AGPL-3.0 | ONNX |
| YOLO26n (onnx-community, origen) | no disponible | 640x640 | 40.9 | AGPL-3.0 | ONNX |
| Otras variantes YOLO26 (s, m, l, x) | no disponible | 640x640 | no disponible | AGPL-3.0 | PyTorch / ONNX |

No se dispone en la informacion proporcionada de datos de modelos alternativos comparables (por ejemplo, otras familias de detectores) con sus metricas, por lo que la comparativa se limita a las variantes de la propia familia YOLO26.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en servicios de red o productos distribuidos puede obligar a liberar el codigo bajo la misma licencia; revisar implicaciones antes de uso comercial.
- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no sera reconocido.
- Entrada fija de 640x640: requiere redimensionado de las imagenes, lo que puede degradar la deteccion de objetos muy pequenos o con relaciones de aspecto extremas.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni razonamiento; no debe evaluarse como tal.
- Riesgo de falsos positivos y negativos inherente a los detectores single-shot, especialmente en escenas con oclusiones o baja iluminacion; no se documentan metricas por clase.
- No se documentan sesgos especificos, pero al entrenarse en COCO hereda los sesgos de composicion de ese dataset (principalmente escenas cotidianas en paises occidentales).
- El repositorio es un espejo sin cambios; la responsabilidad de mantenimiento y actualizaciones recae en Ultralytics y onnx-community.
- No se documentan versiones cuantizadas ni requisitos de hardware minimos, lo que complica la planificacion de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inference4j/yolo26n
- Modelo origen (onnx-community): https://huggingface.co/onnx-community/yolo26n-ONNX
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Sitio de Ultralytics: https://ultralytics.com/
- Biblioteca inference4j: https://github.com/inference4j/inference4j
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
