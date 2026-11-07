# mlboydaisuke/YOLACT-ResNet50-OpenVINO

## Resumen

YOLACT-ResNet50-OpenVINO es una conversión y empaquetado del modelo de segmentación de instancias YOLACT con backbone ResNet-50, orientada a su despliegue sobre la NPU integrada (Intel AI Boost) de los procesadores Intel Core Ultra y, en general, sobre hardware Intel (CPU, iGPU y NPU). El autor del repositorio, mlboydaisuke, parte de la versión LiteRT publicada por litert-community (litert-community/YOLACT-ResNet50-LiteRT), que a su vez deriva del modelo original de dbolya (dbolya/yolact-resnet50). No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: pesos convertidos a ONNX, a formato intermedio OpenVINO IR en fp32 y a un blob precompilado para NPU.

YOLACT (You Only Look At Coefficients) es un modelo totalmente convolucional de segmentación de instancias en tiempo real, presentado en el artículo «YOLACT: Real-time Instance Segmentation». Genera máscaras de instancia combinando prototipos de máscara con coeficientes por detección, lo que evita etapas de refinamiento y permite inferencia de una sola pasada. La relevancia de este repositorio concreto es la aceleración en NPU: según la model card, el blob precompilado se ejecuta en 16,29 ms por inferencia en la NPU de un Core Ultra 9 386H, con una verificación de salida que alcanza coseno ≥ 0,9999 frente a la referencia en CPU.

El paquete incluye el grafo ONNX (opset 17, generado con tf2onnx 1.17.0), el IR de OpenVINO con pesos fp32 y el blob de NPU, además de scripts y registros de medición en un repositorio GitHub complementario. Está pensado para desarrolladores que quieran ejecutar segmentación de instancias en equipos con Intel Core Ultra sin GPU dedicada, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLACT (segmentación de instancias totalmente convolucional) con backbone ResNet-50 y FPN |
| Parametros totales | no disponible (pesos fp32 del IR: 124.471.816 bytes; ONNX: 124.705.334 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 (IR de OpenVINO); blob de NPU precompilado (tamaño 71.868.566 bytes); no se documentan otros formatos cuantizados |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob de NPU precompilado; modelo base en LiteRT (.tflite) |
| Entrada / salida | Entradas y salidas numpy float32; formas definidas por el grafo compilado (no detalladas en la model card) |
| Pipeline | image-segmentation |
| Tamaño del repositorio | 0,3 GB |
| Runtime medido | OpenVINO 2026.4.1, driver NPU 32.0.100.4841 |

## Arquitectura y entrenamiento

La arquitectura es YOLACT con backbone ResNet-50 y FPN, un detector-segmentador de instancias de una sola etapa. El modelo predice cajas, clases y coeficientes de máscara por instancia, y combina esos coeficientes con un conjunto de prototipos de máscara generados por una rama paralela, produciendo máscaras de instancia sin necesidad de un segundo paso de refinamiento (como en Mask R-CNN). El backbone ResNet-50 extrae características multiescala mediante FPN, lo que permite detectar objetos de distintos tamaños en la misma pasada.

No se dispone de información sobre el proceso de entrenamiento en la documentación proporcionada más allá de que el modelo original fue preentrenado en PyTorch sobre el dataset COCO (Common Objects in Context). El repositorio no entrena el modelo: convierte los pesos del modelo base LiteRT a ONNX con tf2onnx 1.17.0 (opset 17), genera el IR de OpenVINO con pesos fp32 y compila un blob específico para la NPU de Intel. La verificación de fidelidad de la conversión se realizó comparando las salidas del ONNX frente al .tflite original con el intérprete LiteRT en CPU, obteniendo coseno ≥ 0,9999 en todas las salidas. No se documentan innovaciones de entrenamiento adicionales (RLHF, DPO, decodificación especulativa, etc.), ya que no es un modelo generativo.

## Capacidades

- Segmentación de instancias de imágenes: genera máscaras por instancia además de cajas y clases, en una sola pasada (modelo totalmente convolucional).
- Detección de objetos con clases del dataset COCO (el modelo original se entrenó sobre COCO; la lista exacta de clases no se detalla en la model card).
- Inferencia en tiempo real: 16,29 ms por ejecución en la NPU de un Core Ultra 9 386H (mediana de 30 ejecuciones cronometradas tras calentamiento), de numpy a numpy.
- Ejecución en múltiples procesadores Intel: NPU (AI Boost), CPU e iGPU mediante OpenVINO; el blob está precompilado para evitar la compilación en carga (0,04 s de carga).
- Compatibilidad con ONNX Runtime: el archivo ONNX es cargable por ONNX Runtime 1.31.1 en CPU (usado como referencia), aunque no en la NPU a través del EP de OpenVINO.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Segmentación de instancias en tiempo real en portátiles con Intel Core Ultra: el blob de NPU permite procesar imágenes en 16,29 ms por inferencia sin GPU dedicada, adecuado para aplicaciones de visión en el propio dispositivo (edge).
- Análisis de imágenes en aplicaciones de escritorio: integración mediante OpenVINO en herramientas de edición o análisis de imágenes que necesiten separar objetos del fondo con máscaras por instancia.
- Preprocesado para pipelines de visión artificial: uso de las máscaras como entrada para tareas posteriores (medición, conteo de objetos, seguimiento) en entornos industriales o de inspección con hardware Intel.
- Prototipado rápido en CPU: el IR fp32 de OpenVINO permite ejecutar el modelo en cualquier CPU x86 con OpenVINO 2026.4.1, sin necesidad de NPU, para validación y desarrollo.
- Automatización de anotación de datasets: generación de máscaras iniciales sobre imágenes COCO-like para revisión humana, aprovechando la velocidad de inferencia en NPU.
- Despliegue en dispositivos con restricciones de consumo: al ejecutarse en la NPU integrada, libera la CPU y la GPU para otras tareas y reduce el consumo frente a inferencia en GPU dedicada.
- Evaluación comparativa de runtimes: el repositorio incluye scripts y registros para reproducir la comparación entre OpenVINO, ONNX Runtime y LiteRT en el mismo hardware.

## Benchmarks y rendimiento

La model card solo publica la medición de latencia en NPU; el resto de configuraciones figuran como «did not run». No se han publicado resultados de benchmarks de precisión (mAP, mask AP) en la información disponible.

| Procesador | Runtime | Archivo | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob de NPU (`import_model`) | 16,29 | 0,04 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | no ejecutado | no ejecutado | no ejecutado |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | no ejecutado | no ejecutado | no ejecutado |
| RTX 5080 Laptop (límite 95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | no ejecutado | no ejecutado | no ejecutado |
| RTX 5080 Laptop (límite 95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | no ejecutado | no ejecutado | no ejecutado |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | no ejecutado | no ejecutado | no ejecutado |
| Core Ultra 9 386H CPU | OpenVINO 2026.4.1 | `.onnx` f32 | no ejecutado | no ejecutado | referencia |

Hardware de medición: MSI Stealth 16 AI+ con Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación de red, fecha 2026-11-06. Metodología: un proceso por fila, carga, una ejecución, 5 de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento + 10 cronometradas cuando la primera ejecución supera los 3 s). La verificación de salida compara cada salida frente a la salida en CPU en fp32 con el mismo input (OpenVINO en CPU como referencia, ya que ONNX Runtime 1.31.1 no puede cargar el archivo).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el IR fp32 ocupa unos 124 MB de pesos; el blob de NPU ocupa unos 72 MB. La memoria de trabajo adicional depende de las formas de entrada y salida, no detalladas en la model card.
- NPU: Intel AI Boost integrada en procesadores Intel Core Ultra (medido en Core Ultra 9 386H). Requiere OpenVINO 2026.4.1 y driver NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292) para importar el blob precompilado.
- CPU: cualquier CPU x86 compatible con OpenVINO 2026.4.1; también es posible ejecutar el ONNX con ONNX Runtime 1.31.1 en CPU.
- GPU: el repositorio no publica mediciones en GPU; la model card menciona pruebas previstas en RTX 5080 Laptop (95 W) con ONNX Runtime CUDA EP, pero figuran como «did not run».
- Cabe en hardware de consumo: sí, en portátiles y equipos con Intel Core Ultra (NPU o CPU) sin GPU dedicada; también en equipos con GPU dedicada, aunque sin datos de rendimiento publicados.
- Opciones de despliegue: OpenVINO (Python API, `import_model` para el blob o `compile_model` para el IR), ONNX Runtime 1.31.1 (CPU EP; el EP de OpenVINO 1.8.1 falla al cargar el ONNX en NPU con el error `Load model from ... failed: Node (__main__.Wrap/yolact.`), y LiteRT para el modelo base .tflite.
- Latencia: 16,29 ms por inferencia en NPU (numpy a numpy, mediana de 30 ejecuciones). Throughput estimado: aproximadamente 61 inferencias por segundo en NPU, calculado a partir de la latencia medida. No hay datos de latencia para CPU, iGPU ni GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| YOLACT-ResNet50-OpenVINO (este) | YOLACT + ResNet-50 + FPN | no disponible (pesos ~124 MB fp32) | no aplica | MIT | Hugging Face (ONNX, IR, blob NPU) | Optimizado para NPU Intel; 16,29 ms en Core Ultra 9 386H |
| litert-community/YOLACT-ResNet50-LiteRT | YOLACT + ResNet-50 + FPN | no disponible | no aplica | MIT (según este repositorio) | Hugging Face (LiteRT) | Modelo base del que deriva esta conversión; formato .tflite |
| dbolya/yolact-resnet50 | YOLACT + ResNet-50 + FPN | no disponible | no aplica | no disponible en la información proporcionada | Hugging Face | Modelo original de referencia |
| yolact-resnet50-fpn-pytorch (Open Model Zoo) | YOLACT + ResNet-50 + FPN | no disponible | no aplica | no disponible en la información proporcionada | Open Model Zoo (Intel) | Modelo preentrenado en PyTorch sobre COCO, disponible en el catálogo de OpenVINO |

No se dispone de datos de benchmarks de precisión para comparar el rendimiento (mAP/mask AP) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código ni tool calling; cualquier uso en esos ámbitos queda fuera de su propósito.
- El blob de NPU está compilado para una versión concreta de OpenVINO (2026.4.1) y un driver de NPU concreto (32.0.100.4841). Si `import_model` rechaza el blob en otra versión o driver, hay que recompilar el IR en la máquina destino (`compile_model`), lo que añade tiempo de carga.
- ONNX Runtime 1.31.1 con el EP de OpenVINO 1.8.1 no consigue cargar `yolact.onnx` en la NPU (error de carga del grafo); la ruta soportada en NPU es OpenVINO directamente.
- Solo se ha medido y verificado la ejecución en NPU; el resto de configuraciones (CPU, iGPU, GPU CUDA) figuran como «did not run», por lo que no hay garantías publicadas de latencia ni de fidelidad de salida en esas rutas.
- No se documentan métricas de precisión (mAP, mask AP) ni el conjunto exacto de clases soportadas; el modelo base se entrenó sobre COCO, pero la model card no detalla el rendimiento.
- Riesgo de sesgos y alucinaciones heredado del dataset COCO y del modelo original: cobertura limitada a las clases de COCO y posible degradación en dominios visuales distintos (imágenes médicas, aéreas, etc.).
- La licencia MIT se hereda del modelo base LiteRT según la model card; conviene verificar las condiciones del modelo original dbolya/yolact-resnet50 antes de un uso comercial, ya que la información disponible no detalla su licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-07), por lo que se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/YOLACT-ResNet50-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/YOLACT-ResNet50-LiteRT
- Modelo original: https://huggingface.co/dbolya/yolact-resnet50
- Scripts y registros de medición (Windows Zoo): https://github.com/john-rocky/windows-zoo
- Documentación de OpenVINO sobre yolact-resnet50-fpn-pytorch: https://docs.openvino.ai/2023.3/omz_models_model_yolact_resnet50_fpn_pytorch.html
- Open Model Zoo, yolact-resnet50-fpn-pytorch: https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/yolact-resnet50-fpn-pytorch/README.md
