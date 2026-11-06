# occurra/object_detection

## Resumen

`occurra/object_detection` es una colección de exportaciones ONNX del modelo Ultralytics YOLOv11, publicada por el usuario occurra como parte del conjunto de artefactos que utiliza su agente `object_detection`. No se trata de un modelo entrenado desde cero, sino de una redistribución de los checkpoints oficiales `yolo11n.pt` y `yolo11s.pt` de Ultralytics, reexportados a ONNX con distintas variantes de precisión y resolución de entrada para facilitar su despliegue en hardware heterogéneo.

El repositorio contiene dos tamaños (nano y small), cuatro variantes de precisión (`apple`, `fp16`, `fp8`, `int8`) y dos resoluciones de entrada (640x640 y 640x480), lo que da un total de configuraciones orientadas a aceleradores Apple (CoreML / ANE) y a GPUs NVIDIA (TensorRT). Todos los ficheros son autocontenidos, sin sidecars de datos externos ni cachés de calibración separadas.

Su relevancia práctica es la de servir como artefacto listo para producción en pipelines de detección de objetos: los ficheros ONNX permiten ejecución directa con ONNX Runtime, TensorRT o CoreML sin necesidad de reexportar desde PyTorch. La contrapartida principal es la licencia AGPL-3.0 heredada de Ultralytics, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11 (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible (nano ~5 MB de pesos, small ~19 MB de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | FP16, FP8 (TensorRT QDQ), INT8 (QDQ embebido), FP16 sin NMS (variante `apple`) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (ficheros autocontenidos, sin datos externos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv11, un detector de objetos de una etapa basado en una red troncal convolucional y un cabezal de predicción densa, en la línea de las versiones anteriores de la familia YOLO de Ultralytics. El repositorio no entrena ningún modelo nuevo: descarga los checkpoints oficiales `yolo11n.pt` y `yolo11s.pt` desde el feed de releases de Ultralytics y los reexporta mediante el script `ai_agent_toolbox/agents/python/object_detection/scripts/main.py` de la caja de herramientas `occurra`.

Las variantes se diferencian en el grafo exportado: la variante `apple` usa FP16, es NMS-free, con batch estático de 1 y entrada uint8, pensada para CoreML y el Neural Engine de Apple; las variantes `fp16` incluyen NMS embebido y son el valor por defecto para el execution provider de TensorRT de NVIDIA; las variantes `fp8` e `int8` aplican cuantización QDQ de TensorRT con los nodos de cuantización embebidos en el propio grafo, de modo que no requieren una caché de calibración externa. La resolución de entrada se elige entre 640x640 (cuadrada, usada en Apple y como valor por defecto de Ultralytics) y 640x480 (4:3, aproximadamente un 25 % menos de FLOPs y más rápida en TensorRT para cámaras con esa relación de aspecto). No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o imágenes, ni sobre si hubo etapas de ajuste fino adicionales.

## Capacidades

- Detección de objetos en imágenes y fotogramas de vídeo con las clases del dataset COCO (el modelo card no detalla la lista de clases, pero se hereda del checkpoint Ultralytics).
- Ejecución en dos tamaños: nano (`n`, ~5 MB) para máxima velocidad y small (`s`, ~19 MB) para mayor precisión a costa de 3-4 veces más tiempo de inferencia.
- Inferencia en FP16, FP8 e INT8 según el hardware disponible.
- Variante NMS-free para Apple Silicon, que elimina el postprocesado de supresión de no máximos del grafo.
- Variante con NMS embebido para NVIDIA TensorRT.
- Entrada de 640x640 o 640x480, con la forma leída directamente del grafo ONNX (`graph.input[0].type`), sin fichero de configuración adicional.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es exclusivamente un detector visual.

## Casos de uso

- Vigilancia y videovigilancia en tiempo real: la variante `yolo11n_fp8_640x480.onnx` sobre GPUs Blackwell u Hopper permite procesar flujos de cámara 4:3 con la menor huella de VRAM posible, leyendo la resolución de entrada directamente del grafo.
- Detección en dispositivos Apple: `yolo11n_apple_640x640.onnx` se ejecuta sobre CoreML y el Neural Engine con entrada uint8 y sin NMS en el grafo, adecuado para aplicaciones iOS o macOS que necesitan inferencia local sin GPU dedicada.
- Analítica de vídeo en servidores con GPUs NVIDIA antiguas: las variantes `int8` o `fp16` en 640x480 ofrecen un equilibrio entre precisión y throughput cuando no hay soporte de FP8.
- Preprocesado en pipelines de visión por computador: el detector puede actuar como etapa de localización de objetos antes de un clasificador o de un modelo de segmentación posterior, al estar en ONNX y ser consumible desde ONNX Runtime.
- Prototipado rápido y pruebas de concepto: el tamaño nano (~5 MB) permite incluirlo en contenedores ligeros y desplegarlo en CPU con ONNX Runtime sin dependencias de PyTorch.
- Sistemas de conteo y seguimiento de objetos en retransmisiones o grabaciones: la variante small ofrece mejor mAP a cambio de 3-4 veces más latencia, adecuada cuando la precisión prima sobre el tiempo real estricto.
- Integración en el agente `object_detection` de occurra: los ficheros están pensados para ser consumidos directamente por dicho agente, que selecciona la variante según el hardware detectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye valores de mAP, latencia ni throughput para ninguna de las variantes, y la búsqueda web no aporta métricas de este repositorio concreto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos (nano ~5 MB, small ~19 MB) la huella es muy reducida, pero las activaciones y el grafo ONNX añaden consumo adicional no cuantificado en la información disponible.
- GPU recomendadas según el model card:
  - Apple Silicon (CoreML / ANE): `yolo11n_apple_640x640.onnx`.
  - NVIDIA RTX 4000+ / Blackwell: `yolo11n_fp8_640x480.onnx`.
  - NVIDIA anteriores sin FP8: `yolo11n_int8_640x480.onnx` o `yolo11n_fp16_640x480.onnx`.
  - Mayor precisión en cualquier NVIDIA: sustituir `n` por `s` (3-4 veces más lento, mAP marginalmente mejor).
- Cabe en GPU de consumo: sí, por el reducido tamaño de los pesos; el model card no especifica modelos concretos de GPU de consumo más allá de la recomendación genérica de RTX 4000+ para FP8.
- Opciones de despliegue: ONNX Runtime (con execution providers de TensorRT o CoreML), TensorRT directamente, CoreML en Apple. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles; el model card solo indica que la resolución 640x480 es "mediblemente más rápida" en TensorRT que 640x640, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Resolucion | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| occurra/object_detection (YOLOv11n) | ~5 MB de pesos | 640x640 / 640x480 | ONNX (FP16, FP8, INT8, NMS-free) | AGPL-3.0 | Exportaciones listas para TensorRT y CoreML |
| occurra/object_detection (YOLOv11s) | ~19 MB de pesos | 640x640 / 640x480 | ONNX (FP16, FP8, INT8, NMS-free) | AGPL-3.0 | 3-4 veces más lento que nano, mAP marginalmente mejor |
| Ultralytics YOLOv11 (upstream) | mismos checkpoints | configurable | PyTorch (.pt), exportable a ONNX, TensorRT, CoreML | AGPL-3.0 | Requiere exportación manual; el repositorio de occurra la precomputa |
| Hailo Application Code Examples (detección) | no disponible | no disponible | HEF para Hailo-8/8L/10H | no disponible | Ejemplo de despliegue en aceleradores Hailo, no un modelo comparable directamente |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estas variantes con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia AGPL-3.0 heredada de Ultralytics: el uso comercial requiere una licencia empresarial separada de Ultralytics; la exportación a ONNX no altera esta restricción.
- Modelo de visión sin capacidades de texto, razonamiento ni tool calling; no debe evaluarse como un LLM.
- El model card no documenta el dataset de entrenamiento, las clases detectadas ni métricas de precisión; no es posible verificar la calidad del detector a partir de la información disponible.
- Riesgo de falsos positivos y negativos inherente a los detectores de una etapa, sin datos publicados que permitan acotarlo.
- La variante `apple` es NMS-free y con batch estático de 1: no admite lotes mayores ni postprocesado NMS estándar, lo que limita su uso fuera de CoreML.
- Las variantes `fp8` e `int8` dependen de TensorRT QDQ; su comportamiento en otros runtimes ONNX no está garantizado por el model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.
- No se especifican los idiomas ni la composición del dataset original; la ficha de Hugging Face marca los idiomas como no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/occurra/object_detection
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Licencia AGPL-3.0 de Ultralytics: https://github.com/ultralytics/ultralytics/blob/main/LICENSE
- Ejemplo de detección de objetos en Hailo: https://github.com/hailo-ai/Hailo-Application-Code-Examples/blob/main/runtime/python/object_detection/README.md
