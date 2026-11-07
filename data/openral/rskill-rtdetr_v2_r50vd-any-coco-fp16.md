# OpenRAL/rskill-rtdetr_v2_r50vd-any-coco-fp16

## Resumen

rskill-rtdetr_v2_r50vd-any-coco-fp16 es un paquete de despliegue (rSkill) del detector de objetos RT-DETRv2 con backbone ResNet-50vd, entrenado sobre COCO 2017 y publicado por OpenRAL, el proyecto de capa agéntica para robótica (Robot Agentic Layer). No se trata de un modelo nuevo: los pesos son un espejo directo de `PekingU/rtdetr_v2_r50vd` (Apache-2.0), y lo que aporta este repositorio es un manifiesto `rskill.yaml`, una exportación ONNX con datos externos y una ruta de ejecución TensorRT en fp16 lista para integrarse en el runtime de OpenRAL.

El modelo resuelve la detección de 80 categorías COCO por fotograma en un flujo de percepción robótica: recibe imágenes RGB de cualquier cámara (`sensor_msgs/Image`, mínimo 640×480), las redimensiona a 640×640 y publica eventos `ObjectsMetadata` con etiqueta, confianza y caja delimitadora en el tópico `/openral/perception/objects`. Es un productor de percepción puro: no emite acciones ni controla articulaciones `ros2_control`.

Su relevancia actual está en el empaquetado: el mismo artefacto ONNX se ejecuta con TensorRT fp16 en hosts CUDA (con construcción y caché del motor en la primera carga) o con onnxruntime como alternativa portable en CPU o CUDA EP. Con 165 MB de pesos externos más 3,9 MB de grafo, y un presupuesto declarado de 50 ms por fragmento, encaja en pipelines de percepción en tiempo real sobre GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (Real-Time DEtection TRansformer v2), transformer de detección con backbone ResNet-50vd y extracción selectiva de características multi-escala |
| Parametros totales | no disponible (pesos ONNX de 165 MB en fp16, coherente con un detector de tamaño medio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 640×640 píxeles, salida de 300 consultas |
| Tipos de cuantizacion | fp16 (por defecto en el manifiesto y en TensorRT); fp32 en la ruta onnxruntime y en el checkpoint PyTorch |
| Idiomas soportados | en (etiquetas de clase COCO en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), safetensors (`weights/model.safetensors`) y motor TensorRT generado en tiempo de carga |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector transformer end-to-end que elimina la necesidad de supresión no máxima (NMS) posterior. Frente a RT-DETR v1 incorpora extracción selectiva de características multi-escala, un operador de muestreo discreto y estrategias de entrenamiento mejoradas. El backbone es ResNet-50vd; la cabeza produce 300 consultas con `logits` de forma `(1, 300, 80)` antes de la sigmoide y `pred_boxes` de forma `(1, 300, 4)` en formato cxcywh. La entrada es un tensor `pixel_values` de forma `(batch, 3, 640, 640)`, float32 en rango `[0,1]`, NCHW, tras redimensionar la imagen original.

El entrenamiento se realizó sobre COCO 2017 y procede íntegramente del modelo upstream `PekingU/rtdetr_v2_r50vd`; este repositorio no reentrena ni afina los pesos, solo los empaqueta. La exportación a ONNX se genera con `tools/export_rtdetr_onnx.py` usando un entorno aislado (`uv run --isolated --no-project`) con `transformers>=4.45,<5`, `torch>=2.2`, torchvision, onnx y onnxscript. El autor advierte que el exportador de torch no es reproducible bit a bit entre versiones de toolchain, por lo que los digests sha256 publicados deben tratarse como verificación de integridad en el mismo host, siendo canónicas las copias del Hub.

## Capacidades

- Detección de objetos en imagen: 80 categorías COCO por fotograma, con caja delimitadora, etiqueta y puntuación de confianza por objeto.
- Publicación de eventos estructurados `ObjectsMetadata` en `/openral/perception/objects`, consumibles por otros componentes del runtime OpenRAL.
- Independencia de la encarnación (embodiment-agnostic): acepta cualquier flujo de cámara RGB con nombre arbitrario, ya que `vla_feature_key` queda sin definir en el manifiesto.
- Ejecución dual: backend `runtime_tensorrt` con motor fp16 cacheado en hosts CUDA, y `onnxruntime` (CPU o CUDA EP) como alternativa portable.
- Inferencia standalone con `transformers` a partir del checkpoint safetensors, para uso fuera del runtime OpenRAL.
- No soporta tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo thinking: es exclusivamente un detector.

## Casos de uso

- Percepción en robots móviles: el detector se conecta al tee de cámara y publica obstáculos y objetos COCO por fotograma, sirviendo de entrada a planificadores de navegación que consumen `/openral/perception/objects`; con ~18 ms en RTX 4090 permite operar a ~55 fps.
- Manipulación asistida: un brazo robotizado puede localizar objetos de las 80 clases COCO (tazas, botellas, sillas, personas) antes de invocar una política VLA, usando las cajas como región de interés para el recorte de imagen.
- Inspección visual en línea de producción: sobre un host con TensorRT fp16, el modelo clasifica y localiza defectos u objetos conocidos a 40-55 fps, suficiente para cintas transportadoras a velocidad moderada.
- Despliegue en hardware sin GPU: la ruta onnxruntime fp32 ofrece ~70 ms por inferencia (~14 fps) en un Intel i7-13700K, válida para estaciones de monitorización o robótica de baja cadencia.
- Prototipado de pipelines de robótica con OpenRAL: al ser un rSkill instalable con `openral rskill install OpenRAL/rskill-rtdetr_v2_r50vd-any-coco-fp16`, permite montar un sistema de percepción completo sin entrenar ni exportar nada.
- Análisis de vídeo y datos de sensores: el checkpoint safetensors puede cargarse con `transformers` en scripts de anotación automática o preetiquetado de datasets, fuera del runtime robótico.
- Seguridad básica en entornos compartidos: la detección de la clase persona a 71,2% de AP@0.5 permite señalizar presencia humana en el campo de visión de un robot antes de ejecutar movimientos.

## Benchmarks y rendimiento

Precisión sobre COCO val2017, según la model card del autor:

| Metrica | Valor |
|---|---|
| AP@0.5:0.95 | 54,3% |
| AP@0.5 | 71,2% |
| AP@0.75 | 59,1% |

Latencia y throughput declarados:

| Host | dtype | Latencia (ms) | Throughput |
|---|---|---|---|
| NVIDIA RTX 3090 | fp16 | ~25 | ~40 fps |
| NVIDIA RTX 4090 | fp16 | ~18 | ~55 fps |
| Intel i7-13700K | fp32 | ~70 | ~14 fps |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval o similares no aplican a un detector).

## Requisitos de hardware

- VRAM estimada: ~350 MB en fp16 y ~700 MB en fp32, según la model card.
- GPU recomendadas: NVIDIA RTX 3090 (~25 ms, ~40 fps) y RTX 4090 (~18 ms, ~55 fps) con TensorRT fp16. El manifiesto declara un presupuesto de 50 ms por fragmento (`per_chunk_ms: 50.0`).
- GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer con más de 1 GB de VRAM; el tamaño de pesos (165 MB en fp16) lo permite incluso en equipos modestos.
- CPU: ~70 ms por inferencia en un Intel i7-13700K con onnxruntime fp32 (~14 fps).
- Opciones de despliegue: TensorRT (ruta principal en CUDA, con motor fp16 construido y cacheado en la primera carga), onnxruntime con EP de CPU o CUDA, y `transformers` con el checkpoint safetensors para inferencia standalone. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Cámara: se requiere un flujo RGB de al menos 640×480.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precisión COCO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-rtdetr_v2_r50vd-any-coco-fp16 (este) | no disponible (165 MB fp16) | imagen 640×640, 300 consultas | AP 54,3% / AP@0.5 71,2% | Apache-2.0 | Hugging Face, empaquetado como rSkill OpenRAL con ONNX y TensorRT |
| PekingU/rtdetr_v2_r50vd (upstream) | no disponible | imagen 640×640 | AP 54,3% (mismo modelo) | Apache-2.0 | Hugging Face, checkpoint PyTorch para `transformers` |
| rtdetr-coco-r18 (rSkill OpenRAL, mencionado en la model card) | no disponible | imagen 640×640 | no disponible | no disponible | Hugging Face, mismo overlay de exportación ONNX |

No se dispone en la información proporcionada de datos de otros detectores comparables (por ejemplo, variantes YOLO) que permitan una comparación rigurosa de precisión y latencia.

## Limitaciones y advertencias

- El modelo solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no será reconocido ni etiquetado.
- No es un modelo generativo, pero la confianza por caja puede ser alta en detecciones erróneas; en producción conviene aplicar umbrales de confianza y validación aguas abajo.
- Las etiquetas de clase están en inglés (`language: en`); no hay soporte multilingüe.
- La exportación ONNX no es reproducible bit a bit entre versiones de toolchain; los hashes sha256 solo sirven como comprobación de integridad en el mismo host.
- El rendimiento depende del backend: sin el grupo `tensorrt`, la ruta onnxruntime es más lenta y puede no cumplir el presupuesto de 50 ms por fragmento en CPU.
- El repositorio tiene un uso muy bajo (39 descargas, 0 likes) y fue creado en 2026; no hay evidencia de validación independiente más allá de las métricas declaradas por el autor.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo upstream `PekingU/rtdetr_v2_r50vd`, también Apache-2.0.
- Aunque el detector es agnóstico a la encarnación, requiere una cámara RGB calibrada y bien iluminada; no se documentan métricas de robustez ante condiciones adversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-rtdetr_v2_r50vd-any-coco-fp16
- Modelo base upstream: https://huggingface.co/PekingU/rtdetr_v2_r50vd
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
- Organización OpenRAL en Hugging Face: https://huggingface.co/OpenRAL
- Paper de referencia citado en los tags: arxiv:2407.17140
