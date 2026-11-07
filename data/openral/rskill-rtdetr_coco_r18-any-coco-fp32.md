# OpenRAL/rskill-rtdetr_coco_r18-any-coco-fp32

## Resumen

rskill-rtdetr_coco_r18-any-coco-fp32 es un detector de objetos RT-DETR (Real-Time DEtection TRansformer) con backbone ResNet-18vd, entrenado sobre COCO (80 categorías) y preentrenado en Objects365, exportado a formato ONNX en precisión fp32. Lo publica OpenRAL dentro de su ecosistema de "rSkills", habilidades intercambiables para su capa de agentes robóticos de código abierto (OpenRAL, Robot Agentic Layer). No es un modelo de lenguaje: es un componente de percepción que consume flujos RGB de cámara y emite metadatos de objetos detectados.

El modelo deriva del checkpoint de Transformers `PekingU/rtdetr_r18vd_coco_o365`, del que se genera el grafo ONNX mediante una herramienta de exportación propia. Su función en el runtime de OpenRAL es actuar como productor de percepción sobre el "camera tee", publicando eventos `ObjectsMetadata` (cajas delimitadoras, etiquetas de clase y puntuaciones de confianza) en el topic `/openral/perception/objects`. Es agnóstico al embodiment: acepta cualquier cámara RGB con nombre arbitrario y no acciona actuadores.

Su relevancia radica en su perfil de latencia y huella: aproximadamente 15-30 ms en GPU NVIDIA y 35-50 ms en CPU x86 a 640x640, con un peso de unos 80 MB y una huella de VRAM de ~0,2 GB en fp32, lo que permite ejecutarlo en GPUs de consumo de 8 GB sin cuantización. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR con backbone ResNet-18vd (r18vd), transformer de detección en tiempo real |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640x640) |
| Tipos de cuantizacion | solo fp32 publicado; no se documentan otras precisiones |
| Idiomas soportados | en (etiquetas de clase COCO en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 18): `model.onnx` (2,3 MB) + `model.onnx.data` (78 MB) |

## Arquitectura y entrenamiento

RT-DETR es un detector end-to-end basado en transformer que elimina la necesidad de componentes post-procesado como NMS, tal y como describe el paper *DETRs Beat YOLOs on Real-time Object Detection* (arXiv:2304.08069). Este checkpoint concreto emplea un backbone convolucional ResNet-18vd y produce 300 consultas de objeto por imagen: una salida `logits` de forma `(1, 300, 80)` pre-sigmoide y una salida `pred_boxes` de forma `(1, 300, 4)` en formato cxcywh. La entrada es `pixel_values` con forma `(batch, 3, 640, 640)`, float32, normalizada a [0,1].

El entrenamiento se realizó sobre COCO (80 categorías) partiendo de un preentrenamiento en Objects365, según indica la model card del checkpoint base `PekingU/rtdetr_r18vd_coco_o365`. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO (no aplicable a un detector). La innovación técnica principal es la propia arquitectura RT-DETR, que combina la precisión de los DETR con latencias de tiempo real. El artefacto publicado se generó con el exportador nuevo de torch 2.9 (opset 18, con bump automático desde opset 17), que divide el modelo en grafo y datos externos; los sha256 proporcionados son una comprobación de integridad en el mismo host, no una garantía de reproducibilidad entre versiones de toolchain.

## Capacidades

- Detección de objetos en imágenes RGB: 80 categorías COCO por fotograma, con cajas, etiquetas y confianza.
- Inferencia en tiempo real: ~15-30 ms en GPU NVIDIA y ~35-50 ms en CPU x86 a 640x640.
- Integración como productor de percepción en OpenRAL: publica `ObjectsMetadata` en `/openral/perception/objects`.
- Agnóstico al embodiment: acepta cualquier cámara RGB (nombre de cámara libre, sin `vla_feature_key` fijo).
- Preprocesado integrado en el contrato: redimensionado a 640x640, normalización `/255` a float32 [0,1] y formato NCHW.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni audio.
- Sin actuadores: no emite `Action` chunks ni acciona joints de `ros2_control`.

## Casos de uso

- Percepción en robots móviles: el modelo se conecta al camera tee y publica detecciones de 80 clases COCO por fotograma, sirviendo de entrada a planificadores o políticas de navegación en el runtime OpenRAL, con latencia de ~20 ms en GPU.
- Detección en tiempo real sobre hardware de consumo: su huella de ~0,2 GB en fp32 permite desplegarlo en una GPU de 8 GB junto con otros componentes del stack robótico, sin cuantización ni recortes de precisión.
- Procesamiento en CPU sin GPU dedicada: con 35-50 ms por fotograma en x86, es adecuado para robots o estaciones con presupuesto térmico y energético limitado donde no hay acelerador disponible.
- Pipelines de robótica ROS 2: al publicar `ObjectsMetadata` en `/openral/perception/objects`, se integra directamente en grafos de nodos ROS 2 como fuente de percepción consumible por otros nodos.
- Prototipado de agentes físicos con OpenRAL: al ser un rSkill de tipo detector con contrato tipado, se puede intercambiar por otros detectores sin cambiar el harness, facilitando la experimentación con distintas habilidades de percepción.
- Sistemas de seguridad y monitorización visual: la detección de personas y objetos COCO con confianza por caja permite construir alertas o comprobaciones de entorno en aplicaciones de vigilancia o control de presencia.
- Investigación en detección de objetos: como exportación ONNX de un checkpoint RT-DETR conocido, sirve de referencia para comparar latencias y precisión en distintos hardwares dentro de experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de latencia, no de precisión:

| Host | Latencia (ms) |
|---|---|
| GPU NVIDIA | ~15-30 |
| CPU x86 | ~35-50 |

Presupuesto declarado en el manifiesto: `per_chunk_ms: 50.0`. Huella de VRAM: ~0,2 GB a 640x640 en fp32.

## Requisitos de hardware

- VRAM estimada: ~0,2 GB a 640x640 en fp32; cabe sobradamente en cualquier GPU de 8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de ONNX Runtime; el fabricante indica que funciona en tarjetas de 8 GB sin cuantización (no se especifican modelos concretos como A100, H100 o RTX 4090).
- GPU de consumo: sí, cabe en GPUs de consumo de 8 GB o más.
- CPU: viable para inferencia en x86 con latencias de 35-50 ms por fotograma.
- Opciones de despliegue: ONNX Runtime (runtime declarado, `runtime: onnx`); el modelo se integra en OpenRAL mediante `openral_runner.backends.gstreamer.objects_detector`. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector).
- Latencia y throughput: ~15-30 ms en GPU, ~35-50 ms en CPU; throughput no disponible explícitamente, pero implicaría del orden de 20-60 FPS en GPU y 20-30 FPS en CPU según esas latencias.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con otros detectores. Cualitativamente, el modelo se sitúa en la categoría de detectores en tiempo real tipo DETR; su alternativa más directa es el checkpoint original del que deriva, `PekingU/rtdetr_r18vd_coco_o365`, con la diferencia de que este último se distribuye en formato PyTorch/Transformers y el aquí descrito en ONNX listo para ONNX Runtime. No se dispone de datos para comparar con familias como YOLO u otros DETR en términos de precisión (mAP) o latencia relativa.

## Limitaciones y advertencias

- Solo detecta las 80 categorías de COCO; cualquier objeto fuera de ese conjunto no se reconocerá.
- Etiquetas únicamente en inglés; no hay soporte multilingüe en la salida.
- No es un modelo generativo, por lo que el riesgo de alucinación de texto no aplica; sí puede producir falsos positivos o negativos propios de la detección, con confianza asociada por caja.
- El artefacto ONNX no es bit-reproducible entre versiones de toolchain; los sha256 publicados solo sirven como comprobación de integridad en el mismo host.
- El archivo `model.onnx` no está commiteado en el repositorio original; debe obtenerse desde el Hub o regenerarse con la herramienta de exportación.
- Requiere mantener juntos `model.onnx` y `model.onnx.data` en el mismo directorio para que ONNX Runtime cargue los pesos externos.
- No acciona actuadores: es exclusivamente un productor de percepción y no debe usarse como componente de control.
- La información sobre sesgos específicos del dataset COCO no está detallada en la documentación disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint base y del dataset COCO subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-rtdetr_coco_r18-any-coco-fp32
- Variante relacionada en Hugging Face: https://huggingface.co/OpenRAL/rskill-rtdetr-coco-r18
- Checkpoint base: https://huggingface.co/PekingU/rtdetr_r18vd_coco_o365
- Repositorio OpenRAL en GitHub: https://github.com/OpenRAL/openral
- Paper RT-DETR: https://arxiv.org/abs/2304.08069
