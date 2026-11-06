# michele-xilo/rf-detr-rs

## Resumen

RF-DETR ONNX es un repositorio de exportaciones en formato ONNX del modelo RF-DETR de Roboflow, un detector de objetos y segmentador de instancias basado en arquitectura transformer. El modelo original RF-DETR combina un backbone DINOv2 con un decoder transformer para tareas de deteccion y segmentacion, y estas exportaciones estan pensadas para su consumo desde el crate de Rust `rf-detr-rs`, lo que permite integrar deteccion de objetos en aplicaciones nativas sin depender de Python en tiempo de inferencia.

El repositorio lo publica el usuario michele-xilo y contiene ocho ficheros ONNX: cuatro variantes de deteccion (nano, small, medium y large) y cuatro de segmentacion de instancias con los mismos tamanos. Todas las variantes estan entrenadas sobre las clases de COCO y comparten la licencia Apache 2.0 de los pesos originales de Roboflow. El tamano total del repositorio es de aproximadamente 1,0 GB.

La relevancia de este repositorio es practica: RF-DETR se distribuye habitualmente como pesos PyTorch, y estas exportaciones ONNX permiten desplegar el modelo en entornos con runtime ONNX (Rust, C++, C#, Node.js mediante bindings) y en aceleradores compatibles con ONNX Runtime, lo que amplia el abanico de plataformas donde se puede ejecutar deteccion y segmentacion de instancias en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (RF-DETR de Roboflow, backbone DINOv2 + decoder transformer) |
| Parametros totales | no disponible (cuatro tamanos: nano, small, medium, large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin cuantizar de forma explicita) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

RF-DETR es un detector de objetos basado en transformer desarrollado por Roboflow. La arquitectura combina un backbone de extraccion de caracteristicas DINOv2 con un decoder transformer que predice directamente las cajas delimitadoras y las clases, siguiendo el paradigma de deteccion end-to-end sin necesidad de componentes como NMS en el pipeline de post-proceso. El repositorio incluye variantes con cabeza de deteccion y variantes con cabeza de segmentacion de instancias, todas con las clases del dataset COCO.

No se dispone de informacion detallada en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de COCO, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste. El modelo original de Roboflow se entrena sobre datos de deteccion de objetos, y estas exportaciones ONNX son conversiones de los pesos originales, no reentrenamientos. No se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo RF-DETR original.

## Capacidades

- Deteccion de objetos: localizacion y clasificacion de instancias sobre las 80 clases de COCO.
- Segmentacion de instancias: variantes `seg-*` que producen mascaras por instancia ademas de las cajas.
- Multiples tamanos: nano, small, medium y large para ajustar el equilibrio entre precision y coste computacional.
- Inferencia via ONNX Runtime: ejecutable en multiples lenguajes y plataformas (Rust mediante `rf-detr-rs`, C++, C#, Python, etc.).
- Sin dependencia de Python en produccion si se usa un runtime ONNX nativo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Deteccion de objetos en aplicaciones de escritorio nativas: mediante el crate `rf-detr-rs` y ONNX Runtime, se puede integrar deteccion en tiempo real en aplicaciones Rust sin embeber un interprete Python.
- Vision por computador en dispositivos edge: las variantes nano y small, exportadas a ONNX, permiten desplegar deteccion en hardware con recursos limitados usando ONNX Runtime o aceleradores como TensorRT.
- Segmentacion de instancias en pipelines de analisis de imagen: las variantes `seg-*` permiten obtener mascaras por objeto para tareas de conteo, medicion de areas o analisis de escenas.
- Procesamiento por lotes en servidores: la variante large ofrece mayor precision para tareas de anotacion automatica o pre-etiquetado de datasets.
- Integracion en sistemas de videovigilancia o analitica de video: deteccion frame a frame con un runtime ONNX optimizado y modelos de tamano reducido.
- Automatizacion de control de calidad industrial: deteccion de defectos o piezas en lineas de produccion usando las clases de COCO como base o como referencia para fine-tuning posterior.
- Prototipado rapido en entornos no-Python: al estar en ONNX, se puede consumir desde Node.js, C# o Java sin reescribir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del tamano (nano a large) y de la resolucion de entrada. El repositorio completo ocupa 1,0 GB, lo que sugiere que cada variante individual es sustancialmente menor.
- GPU recomendadas: no disponible en la documentacion. Al ser ONNX, es compatible con cualquier GPU soportada por ONNX Runtime (CUDA, TensorRT, DirectML) o por el proveedor de ejecucion elegido.
- Cabe en GPU consumer: previsiblemente si para las variantes nano y small, aunque no se documentan requisitos concretos.
- Opciones de despliegue: ONNX Runtime (Rust, C++, C#, Python, Node.js), TensorRT, OpenVINO, DirectML; el crate `rf-detr-rs` como integracion especifica en Rust.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamanos | Clases | Formato | Licencia |
|---|---|---|---|---|---|
| RF-DETR ONNX (este repo) | Deteccion + segmentacion transformer | nano, small, medium, large | COCO (80) | ONNX | Apache 2.0 |
| YOLOv8 / YOLO11 (Ultralytics) | Deteccion CNN | n, s, m, l, x | COCO (80) | PyTorch, ONNX, TensorRT | AGPL-3.0 / comercial |
| DETR / Deformable DETR | Deteccion transformer | unico | COCO (80) | PyTorch | Apache 2.0 |
| RT-DETR (Baidu) | Deteccion transformer en tiempo real | r18, r34, r50, r101 | COCO (80) | PyTorch, ONNX | Apache 2.0 |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento (mAP, latencia) en la informacion proporcionada para comparar numericamente.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; no cubre clases personalizadas sin fine-tuning adicional.
- No se documentan sesgos especificos, pero al entrenarse sobre COCO hereda los sesgos de representacion de dicho dataset.
- Riesgo de alucinacion: como todo detector, puede producir falsos positivos y cajas con baja confianza; se requiere umbralizacion y post-proceso adecuados.
- No es un modelo de lenguaje: no procesa texto ni soporta instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero los pesos originales son de Roboflow y conviene verificar los terminos del proyecto original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se documentan versiones de ONNX Runtime compatibles ni opsets concretos; puede requerir verificacion de compatibilidad en produccion.
- El rendimiento real de las exportaciones ONNX puede diferir del modelo PyTorch original; no se aportan metricas de paridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/michele-xilo/rf-detr-rs
- Proyecto RF-DETR de Roboflow: https://github.com/roboflow/rf-detr
- Crate `rf-detr-rs`: https://github.com/michele-xilo/rf-detr-rs
- Licencia Apache 2.0 del proyecto original: https://github.com/roboflow/rf-detr/blob/develop/LICENSE
