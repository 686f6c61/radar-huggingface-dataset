# beycanai/BCVideoNodes-models

## Resumen

BCVideoNodes-models es un repositorio de pesos alojado en Hugging Face por el desarrollador beycanai que empaqueta tres modelos de visión por computador utilizados por la extensión ComfyUI-BCVideoNodes: un estimador de pose ViTPose-H, un estimador de pose RTMW-l y un detector de personas YOLOv10-X. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un contenedor de pesos convertidos de ONNX a módulos nativos de PyTorch para su uso dentro de ComfyUI. Los tres modelos están entrenados para tareas de detección de keypoints y detección de objetos, no para generación de texto.

El repositorio tiene un tamaño de 1,6 GB y su relevancia es puramente instrumental: sirve como alojamiento estable de los pesos que los nodos de ComfyUI-BCVideoNodes descargan automáticamente en el primer uso. Según la propia model card, los archivos han sido trasladados a la carpeta `detection/` del repositorio beycanai/utility-models, y este repositorio se mantiene únicamente para versiones antiguas de los nodos y ya no se actualiza.

La innovación técnica principal no está en los modelos en sí, sino en el proceso de conversión: los pesos originales en ONNX se han reescrito como módulos de PyTorch con la arquitectura codificada a mano y cargada desde metadatos del propio archivo safetensors, eliminando la dependencia de `onnx` y el coste de parseo de protobuf y recorrido de grafo en cada carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres modelos independientes: ViTPose-H (transformer de visión para pose), RTMW-l (estimador de pose de OpenMMLab), YOLOv10-X (detector de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión) |
| Tipos de cuantizacion | fp16 (ViTPose-H) y fp32 (RTMW-l y YOLOv10-X); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | other a nivel de repositorio; los pesos internos tienen licencias distintas: Apache-2.0 (ViTPose-H, RTMW-l) y AGPL-3.0 (YOLOv10-X) |
| Formato de pesos | safetensors (con arquitectura embebida en metadatos) |

## Arquitectura y entrenamiento

El repositorio contiene tres modelos con arquitecturas distintas. ViTPose-H es un transformer de visión puro para estimación de pose que produce 133 keypoints del conjunto COCO-WholeBody; se distribuye en fp16 con un peso de 1,22 GB (frente a 2,43 GB en fp32). RTMW-l es un estimador de pose de OpenMMLab que también produce 133 keypoints COCO-WholeBody, con entrada de 384x288, y se distribuye en fp32 con 219 MB. YOLOv10-X es un detector de personas de la familia YOLOv10 desarrollada por THU-MIG, en fp32 con 113 MB.

No se proporcionan datos sobre el entrenamiento original de estos modelos (número de tokens, composición del dataset, uso de RLHF o DPO), ya que el repositorio solo reempaqueta pesos previamente entrenados por OpenMMLab, los autores de ViTPose y THU-MIG. La innovación técnica documentada es la conversión de ONNX a módulos nativos de PyTorch: la arquitectura se escribe a mano, los pesos se cargan en ella y cada archivo safetensors lleva su arquitectura en los metadatos, de modo que el cargador no necesita nada más que el archivo. Esto elimina la dependencia de `onnx`, el parseo de protobuf y el recorrido de grafo en cada carga, y sustituye la exportación de ViTPose en dos archivos (un grafo de 420 KB y un `.bin` de 2,5 GB) por un único archivo.

## Capacidades

- Estimación de pose de cuerpo completo con 133 keypoints COCO-WholeBody (ViTPose-H y RTMW-l).
- Detección de personas en imágenes y fotogramas de vídeo (YOLOv10-X).
- Procesamiento de fotogramas individuales dentro de pipelines de vídeo en ComfyUI.
- Integración con los nodos de ComfyUI-BCVideoNodes, que descargan los pesos automáticamente en el primer uso.
- Carga autocontenida: cada archivo safetensors incluye su arquitectura en metadatos, sin necesidad de archivos auxiliares.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Animación de personajes en ComfyUI: los nodos usan ViTPose-H o RTMW-l para extraer los 133 keypoints de cuerpo completo de cada fotograma y transferir el movimiento a un personaje generado, aprovechando que el repositorio ofrece los pesos ya convertidos a PyTorch sin dependencia de ONNX.
- Preprocesado de vídeo para modelos de animación: la carpeta de utilidades de pose wholebody del repositorio de nodos está adaptada del preprocesado de WanAnimate de Alibaba, por lo que estos pesos encajan directamente en flujos de animación de vídeo.
- Detección y seguimiento de personas en vídeo: YOLOv10-X localiza personas por fotograma y alimenta a los estimadores de pose, formando un pipeline de dos etapas (detección y keypoints) habitual en análisis de movimiento.
- Análisis deportivo o biomecánico: la estimación de 133 keypoints permite medir ángulos articulares y trayectorias en secuencias de vídeo para entrenadores o investigadores.
- Prototipado rápido en ComfyUI: al descargarse los pesos automáticamente en el primer uso, un usuario puede montar un flujo de detección y pose sin gestionar manualmente archivos ONNX ni conversiones.
- Mantenimiento de instalaciones antiguas: este repositorio sigue disponible para versiones anteriores de ComfyUI-BCVideoNodes que aún apuntan a él en lugar de a beycanai/utility-models.
- Verificación de procedencia de pesos: al listar explícitamente el archivo, el modelo de origen y la licencia de cada peso, el repositorio permite auditar qué descarga exactamente cada nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta mediciones de la pérdida de precisión por el uso de fp16 en ViTPose-H: sobre 60 fotogramas reales y 5230 keypoints comparados, 20 se movieron con un desplazamiento máximo de una celda de heatmap. En RTMW-l, sobre 5012 keypoints comparados, 401 se movieron con un desplazamiento máximo de 1,5 px. No se proporcionan métricas como AP, PCK o mAP para ninguno de los tres modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de los pesos en disco es de 1,22 GB (ViTPose-H fp16), 219 MB (RTMW-l fp32) y 113 MB (YOLOv10-X fp32), a lo que hay que sumar activaciones y memoria del pipeline de ComfyUI.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño de los pesos, ViTPose-H en fp16 (1,22 GB) es el que más memoria exige y los otros dos son ligeros, pero no se documentan requisitos mínimos.
- Opciones de despliegue: los modelos están pensados para ejecutarse como módulos de PyTorch dentro de ComfyUI mediante la extensión ComfyUI-BCVideoNodes; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Keypoints | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViTPose-H (este repo) | Estimador de pose | 133 COCO-WholeBody | safetensors fp16 | Apache-2.0 | Incluido en el repo |
| RTMW-l (este repo) | Estimador de pose | 133 COCO-WholeBody | safetensors fp32 | Apache-2.0 | Incluido en el repo |
| YOLOv10-X (este repo) | Detector de personas | no aplica | safetensors fp32 | AGPL-3.0 | Incluido en el repo |
| Kijai/vitpose_comfy | Estimador de pose | 133 COCO-WholeBody | ONNX (origen) | Apache-2.0 | Repositorio externo |
| bukuroo/RTMW-ONNX | Estimador de pose | 133 COCO-WholeBody | ONNX (origen) | Apache-2.0 | Repositorio externo |
| onnx-community/yolov10x | Detector de objetos | no aplica | ONNX (origen) | AGPL-3.0 | Repositorio externo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio está marcado como movido y sin mantenimiento: los archivos viven ahora en `detection/` de beycanai/utility-models y este repositorio solo se conserva para versiones antiguas de los nodos.
- La licencia a nivel de repositorio es "other", pero los pesos internos tienen licencias distintas: Apache-2.0 para ViTPose-H y RTMW-l, y AGPL-3.0 para YOLOv10-X. La AGPL-3.0 impone obligaciones de copyleft que pueden afectar al uso comercial o a la distribución de servicios que integren YOLOv10-X.
- No son modelos de lenguaje: no generan texto, no razonan, no soportan tool calling ni agentes, y no tienen capacidades multilingües.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de keypoints espurios: la model card advierte que en los keypoints que el modelo no dibuja la distribución de scores es plana y el argmax es ruido, lo que puede producir desplazamientos aparentes de hasta 215 px en fp16.
- La pérdida de precisión de fp16 en RTMW-l (401 de 5012 keypoints movidos) se consideró aceptable por el ahorro de solo 110 MB; no se documenta el impacto en tareas concretas.
- No se documentan sesgos demográficos, de género o de complexión para ninguno de los tres modelos.
- No se especifican requisitos mínimos de hardware, latencia ni throughput, lo que dificulta planificar despliegues en producción.
- El repositorio no incluye datos de entrenamiento propios ni métricas de evaluación; la calidad depende enteramente de los modelos originales de OpenMMLab, los autores de ViTPose y THU-MIG.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beycanai/BCVideoNodes-models
- Repositorio de utilidades con los pesos actuales: https://huggingface.co/beycanai/utility-models
- Repositorio de los nodos ComfyUI: https://github.com/0xBeycan/ComfyUI-BCVideoNodes
- Script de conversión: https://github.com/0xBeycan/ComfyUI-BCVideoNodes/blob/main/scripts/convert_models.py
- Origen de ViTPose: https://huggingface.co/Kijai/vitpose_comfy
- Origen de RTMW: https://huggingface.co/bukuroo/RTMW-ONNX
- Origen de YOLOv10: https://huggingface.co/onnx-community/yolov10x
- Repositorio de YOLOv10 (THU-MIG): https://github.com/THU-MIG/yolov10
