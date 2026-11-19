# OpenRAL/rskill-rtdetr_v2_r50vd-any-coco-fp32

## Resumen

rskill-rtdetr_v2_r50vd-any-coco-fp32 es un detector de objetos basado en RT-DETRv2 (Real-Time DEtection TRansformer v2) con backbone ResNet-50vd, entrenado sobre COCO 2017 (80 categorias). Lo publica OpenRAL como parte de su ecosistema de "rSkills", es decir, habilidades de percepción empaquetadas con un manifiesto `rskill.yaml` que declara contratos de sensores, latencia y runtime. Los pesos son un espejo directo de PekingU/rtdetr_v2_r50vd, con licencia Apache-2.0, y el repositorio anade el manifiesto y la exportacion ONNX necesaria para el pipeline de percepción de OpenRAL.

El modelo resuelve el problema de deteccion de objetos en tiempo real dentro de un stack robotico: se ejecuta como "perception producer" sobre un tee de camara y publica eventos `ObjectsMetadata` (cajas, etiquetas y confidencias) en el topic `/openral/perception/objects`. No emite acciones ni controla articulaciones `ros2_control`, por lo que es una pieza puramente perceptiva, agnostica al embodiment y compatible con cualquier camara RGB de al menos 640x480.

Su relevancia actual radica en que RT-DETRv2 elimina el post-procesado NMS caracteristico de los detectores tipo DETR clasicos y ofrece latencias del orden de 18-30 ms en GPU consumer, con un consumo de VRAM inferior a 1 GB en fp32. El artefacto se distribuye como ONNX fp32 (grafo de 3,9 MB mas datos externos de 165 MB) y admite tambien inferencia standalone con `transformers` a partir del checkpoint PyTorch incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (Real-Time DEtection TRansformer v2), backbone ResNet-50vd, extraccion selectiva multi-escala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640 x 640) |
| Tipos de cuantizacion | fp32 (pesos distribuidos); referencia fp16 via TensorRT en el manifiesto |
| Idiomas soportados | en (etiquetas COCO en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), safetensors/PyTorch checkpoint en `weights/` |
| Tarea | object-detection (80 clases COCO) |
| Entrada | imagen RGB, minimo 640 x 480, redimensionada a 640 x 640, normalizada a float32 [0,1], NCHW |
| Salida | `ObjectsMetadata`: label, confidence, bbox por objeto |
| Runtime declarado | onnx (onnxruntime, CPU o CUDA EP; TensorRT opcional con OpenRAL Pro) |
| VRAM minima declarada | 0,7 GB (fp32); ~350 MB en fp16 TensorRT |
| Latencia declarada | `per_chunk_ms: 50.0`; referencia ~30 ms GPU / ~70 ms CPU |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector transformer de la familia DETR orientado a tiempo real. A diferencia de los DETR originales, prescinde del decoder autoregresivo lento y emplea un esquema eficiente de consultas (queries) con extraccion selectiva de caracteristicas multi-escala, lo que permite eliminar el post-procesado NMS y mantener latencias competitivas frente a detectores YOLO. La version v2 incorpora mejoras sobre v1: extraccion selectiva de features multi-escala, un operador de muestreo discreto y estrategias de entrenamiento refinadas (el "bag-of-freebies" mencionado en el manifiesto).

El backbone es ResNet-50vd, una variante de ResNet-50 con el bloque "deep stem" de la familia ResNet-vd. El entrenamiento se realiza sobre COCO 2017 con las 80 categorias estandar. No se dispone en la informacion proporcionada del numero exacto de tokens o imagenes de entrenamiento, de la composicion detallada del dataset ni de si se aplicaron etapas de RLHF/DPO (no aplicables a un detector). El repositorio no entrena el modelo: replica los pesos de PekingU/rtdetr_v2_r50vd y anade la exportacion ONNX generada con `tools/export_rtdetr_onnx.py`, usando un entorno efimero con `transformers>=4.45,<5`, `torch>=2.2`, `torchvision`, `onnx` y `onnxscript`.

## Capacidades

- Deteccion de objetos en imagenes RGB para las 80 categorias de COCO 2017, con cajas, etiquetas y puntuaciones de confianza por objeto.
- Inferencia en tiempo real: ~18 ms en RTX 4090 (fp16 TensorRT), ~25 ms en RTX 3090, ~70 ms en CPU (i7-13700K, fp32 onnxruntime).
- Ejecucion sobre onnxruntime con CPU o CUDA Execution Provider; generacion y cacheado de motor TensorRT fp16 en el tier NVMM con OpenRAL Pro.
- Integracion como perception producer en ROS 2: publica `ObjectsMetadata` en `/openral/perception/objects` mediante `ros_image_detector_node` -> `DetectorRunner` -> `ObjectsDetector`.
- Agnosticismo de embodiment: acepta cualquier stream de camara RGB (`vla_feature_key` sin definir), lo que permite reutilizarlo entre robots distintos.
- Inferencia standalone con `transformers` a partir del checkpoint PyTorch en `weights/`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision generativa, audio ni modos de "thinking": es exclusivamente un detector.

## Casos de uso

- Percepcion robotica en tiempo real: el detector se ejecuta sobre el tee de camara del robot y publica bounding boxes a 40-55 fps en GPU, lo que permite alimentar modulos de planificacion o manipulacion con latencias por debajo del presupuesto de 50 ms declarado.
- Navegacion y evitacion de obstaculos: al detectar personas, sillas, mesas y otros objetos COCO en cada frame, el stack de navegacion puede reaccionar a obstaculos dinamicos sin necesidad de mapas estaticos previos.
- Manipulacion asistida: un brazo robotico puede usar las detecciones de clases como `cup`, `bottle` o `bowl` para localizar objetos de interes antes de invocar un modulo de grasping, ya que el detector entrega bbox y confianza por objeto.
- Analitica de video en edge: al caber en menos de 1 GB de VRAM fp32 y funcionar en CPU a ~14 fps, se puede desplegar en dispositivos embebidos o servidores modestos para conteo y monitorizacion de objetos en streams de camara.
- Prototipado rapido de pipelines ROS 2: el manifiesto `rskill.yaml` y el contrato de sensores permiten integrar el detector en un grafo OpenRAL existente sin reescribir la logica de suscripcion a topics ni el mapeo clase-id a etiqueta.
- Benchmarking de detectores: sirve como baseline reproducible de RT-DETRv2-R50vd (AP 54,3% en COCO val2017) para comparar variantes propias o fine-tunings sobre el mismo backbone y dataset.
- Pre-anotacion de datasets: las detecciones COCO con confidencias permiten generar cajas candidatas para revision humana en flujos de etiquetado, acelerando la construccion de datasets especificos de dominio.

## Benchmarks y rendimiento

Precision sobre COCO val2017 (segun la model card):

| Metrica | Resultado |
|---|---|
| AP@0.5:0.95 | 54,3% |
| AP@0.5 | 71,2% |
| AP@0.75 | 59,1% |

Latencia y throughput declarados:

| Host | dtype / runtime | Latencia (ms) | Throughput |
|---|---|---|---|
| NVIDIA RTX 3090 | fp16 (TensorRT) | ~25 | ~40 fps |
| NVIDIA RTX 4090 | fp16 (TensorRT) | ~18 | ~55 fps |
| Intel i7-13700K | fp32 (onnxruntime) | ~70 | ~14 fps |

No se han publicado en la informacion disponible resultados comparativos frente a otros detectores (YOLO, DINO, etc.) ni metricas adicionales como mAP por clase.

## Requisitos de hardware

- VRAM estimada: ~700 MB en fp32 (configuracion distribuida); ~350 MB si se genera un motor TensorRT fp16.
- GPU recomendadas: NVIDIA RTX 3090 (~25 ms, ~40 fps) y RTX 4090 (~18 ms, ~55 fps) con TensorRT fp16; cualquier GPU con CUDA EP de onnxruntime puede ejecutarlo en fp32.
- Cabe holgadamente en GPU consumer: la huella de VRAM inferior a 1 GB permite convivir con otros modelos en tarjetas de 8 GB o menos.
- CPU: funciona en onnxruntime fp32 a ~70 ms por frame (~14 fps) en un Intel i7-13700K, suficiente para aplicaciones de baja cadencia.
- Opciones de despliegue: onnxruntime (CPU o CUDA EP) como runtime declarado; TensorRT via OpenRAL Pro (tier NVMM); inferencia standalone con `transformers` sobre el checkpoint PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia/throughput: presupuesto declarado `per_chunk_ms: 50.0`; valores medidos de referencia entre 18 y 70 ms segun host y backend.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rskill-rtdetr_v2_r50vd-any-coco-fp32 | RT-DETRv2 + ResNet-50vd | no disponible | imagen 640 x 640 | AP 54,3% COCO val2017; ~18-25 ms GPU | apache-2.0 | Hugging Face (OpenRAL) |
| PekingU/rtdetr_v2_r50vd (modelo base) | RT-DETRv2 + ResNet-50vd | no disponible | imagen 640 x 640 | mismos pesos, sin manifiesto OpenRAL | apache-2.0 | Hugging Face |
| rtdetr-coco-r18 (mencionado en la model card) | RT-DETRv2 + ResNet-18 | no disponible | imagen 640 x 640 | no disponible en la informacion | no disponible | referenciado en el ecosistema OpenRAL |

No se dispone en la informacion proporcionada de datos comparativos frente a alternativas como YOLOv8/v11, DINO o DETR clasico; por tanto, la comparativa se limita a variantes del propio linaje RT-DETR.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO 2017; objetos fuera de ese vocabulario no se reconocen, y las etiquetas estan en ingles.
- Riesgo de falsos positivos y negativos inherente a cualquier detector: las confidencias deben filtrarse con umbrales adecuados al dominio antes de actuar sobre ellas.
- No es un modelo generativo: no razona, no conversa, no ejecuta tool calling ni agentes; usarlo fuera de tareas de deteccion no tiene sentido.
- El modelo distribuido es fp32; las cifras de latencia y VRAM en fp16 corresponden a un motor TensorRT generado por el host (OpenRAL Pro), no al artefacto por defecto.
- La exportacion ONNX no es bit-reproducible entre versiones de toolchain; los digests sha256 sirven como comprobacion de integridad en el mismo host, y las copias canonicas son las publicadas en el Hub.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base PekingU/rtdetr_v2_r50vd y de las dependencias (torchvision, onnxruntime) en produccion.
- El detector no emite acciones ni senales de proprioception; no debe confundirse con una skill de control.
- La latencia de ~70 ms en CPU limita su uso en tiempo real a cadencias bajas (~14 fps) si no hay aceleracion GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-rtdetr_v2_r50vd-any-coco-fp32
- Modelo base: https://huggingface.co/PekingU/rtdetr_v2_r50vd
- Paper RT-DETRv2 (arXiv:2407.17140): https://arxiv.org/abs/2407.17140
- Repositorio OpenRAL: no disponible en la informacion proporcionada
- Demo o blog adicional: no disponible en la informacion proporcionada
