# Comfy-Org/RT-DETR

## Resumen

El modelo Comfy-Org/RT-DETR es un empaquetado para ComfyUI de los pesos del detector de objetos en tiempo real RT-DETRv4, desarrollado originalmente por el equipo de RT-DETRs (vinculado a Baidu). RT-DETR (Real-Time Detection Transformer) combina la arquitectura transformer con un diseño optimizado para inferencia de baja latencia, lo que lo hace adecuado para aplicaciones de visión por computadora que requieren detección de objetos en tiempo real sin sacrificar precisión. Este repositorio en HuggingFace no contiene el modelo original, sino archivos de pesos en formato safetensors (fp16 y fp32) listos para ser utilizados directamente en el ecosistema ComfyUI, facilitando la integración en flujos de trabajo de generación y edición de imágenes.

La relevancia de este modelo radica en que ofrece una alternativa moderna a los detectores basados en CNN (como YOLO) al emplear atención global, lo que mejora el manejo de objetos superpuestos y de pequeño tamaño. Al estar empaquetado para ComfyUI, permite a los usuarios de esta herramienta incorporar detección de objetos en sus pipelines sin necesidad de escribir código adicional. La licencia Apache-2.0 permite uso comercial y modificación, aunque la información disponible no detalla el tamaño exacto de parámetros ni la configuración específica de la variante (R50, R101, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion en tiempo real (RT-DETR) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | FP16, FP32 (safetensors) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RT-DETR se basa en una arquitectura transformer encoder-decoder adaptada para deteccion de objetos. A diferencia de los detectores de una etapa tradicionales, emplea consultas de objetos aprendibles y atencion cruzada para predecir cajas y clases directamente, sin necesidad de anclas ni supresion de no maximos (NMS). La variante v4 introduce mejoras en la eficiencia computacional, como la atencion de tamano de ventana variable y un diseno de encoder jerarquico que reduce la carga de calculo manteniendo la precision. El modelo fue entrenado en el dataset COCO (Common Objects in Context) con aumentacion de datos estandar, aunque los detalles exactos del entrenamiento (numero de epocas, tecnicas de regularizacion, etc.) no se especifican en la informacion proporcionada. No se menciona el uso de RLHF o DPO, ya que es un modelo discriminativo de vision, no generativo de lenguaje.

## Capacidades

- Deteccion de objetos en tiempo real: localiza y clasifica multiples objetos en una imagen, devolviendo cajas delimitadoras y etiquetas de clase.
- Manejo de objetos superpuestos y de pequeno tamano gracias a la atencion global del transformer.
- Inferencia de baja latencia, disenada para aplicaciones en tiempo real (video, robotica, vigilancia).
- Integracion nativa con ComfyUI: los pesos estan formateados para cargarse directamente en nodos de ComfyUI, permitiendo su uso en flujos de trabajo visuales.
- Soporte de multiples clases de objetos (las 80 clases de COCO, aunque no se confirma en la documentacion).
- No incluye capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Edicion de imagenes asistida en ComfyUI: los usuarios pueden detectar objetos en una imagen y usar esas detecciones para guiar procesos de inpainting, segmentacion o generacion condicionada, todo dentro del entorno visual de ComfyUI.
- Automatizacion de control de calidad en manufactura: el modelo puede integrarse en pipelines de vision industrial para detectar defectos o piezas mal colocadas en tiempo real, gracias a su baja latencia.
- Vigilancia y seguridad: analisis de video en directo para detectar personas, vehiculos u objetos de interes, con capacidad de ejecucion en hardware moderado.
- Robotica y navegacion autonoma: deteccion de obstaculos y objetos en el entorno para sistemas de robotica movil, donde la velocidad de inferencia es critica.
- Anotacion automatica de datasets: el modelo puede pre-anotar imagenes para acelerar la creacion de datasets de entrenamiento, reduciendo el trabajo manual de etiquetado.
- Analisis de imagenes medicas (con limitaciones): aunque no esta entrenado especificamente para el dominio medico, puede adaptarse mediante fine-tuning para detectar estructuras anatomicas o anomalias en radiografias, siempre que se valide su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye metricas como mAP, FPS ni comparaciones con otros detectores. Para obtener datos de rendimiento, se recomienda consultar el repositorio original de RT-DETRv4 en GitHub o los articulos academicos asociados.

## Requisitos de hardware

- VRAM estimada: el tamano del repositorio es de 0.4 GB, lo que sugiere que los pesos en FP32 ocupan aproximadamente 0.4 GB. Para inferencia, se recomienda al menos 2 GB de VRAM para FP32 y 1 GB para FP16, considerando memoria adicional para activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) puede ejecutar el modelo sin problemas. Para procesamiento por lotes o video en alta resolucion, se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: si, el modelo es ligero y cabe en GPUs de gama media y baja.
- Opciones de despliegue: al estar empaquetado para ComfyUI, se puede ejecutar dentro de esa aplicacion. Tambien es posible cargar los safetensors con librerias como PyTorch y usar el codigo original de RT-DETR para inferencia fuera de ComfyUI. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se espera que sea adecuado para tiempo real en GPUs modernas, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Sin embargo, RT-DETR se posiciona como alternativa a detectores como YOLOv8 y DETR. A continuacion se presenta una comparacion cualitativa basada en conocimiento general, sin cifras exactas:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RT-DETR (este repo) | Transformer encoder-decoder | no disponible | Vision | Apache-2.0 | HuggingFace, ComfyUI |
| YOLOv8 | CNN (CSPDarknet) | ~3-11 M (variantes) | Vision | AGPL-3.0 | Ultralytics, ONNX, etc. |
| DETR (original) | Transformer encoder-decoder | ~41 M (ResNet-50) | Vision | Apache-2.0 | HuggingFace, GitHub |

RT-DETR suele ofrecer mejor precision que YOLO en objetos pequenos y superpuestos, pero con mayor coste computacional que las variantes mas ligeras de YOLO. DETR es mas lento y pesado, mientras que RT-DETR esta disenado para tiempo real. No se dispone de datos de rendimiento especificos para confirmar estas afirmaciones en este repositorio.

## Limitaciones y advertencias

- La informacion proporcionada no incluye detalles sobre el entrenamiento, el dataset exacto ni las clases soportadas. Se asume que sigue el esquema de COCO, pero no esta confirmado.
- Al ser un modelo de deteccion, no puede generar texto ni realizar tareas de lenguaje natural.
- Puede presentar sesgos en la deteccion de ciertas clases o condiciones de iluminacion, derivados del dataset de entrenamiento (COCO). No se han documentado sesgos especificos en este repositorio.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir falsos positivos (detectar objetos que no existen) en imagenes complejas o fuera de distribucion.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del repositorio original de RT-DETRv4, ya que podria haber restricciones adicionales sobre patentes o atribucion.
- El modelo esta empaquetado para ComfyUI, por lo que su uso fuera de ese entorno requiere adaptar el codigo de carga de pesos. No se incluyen scripts de inferencia independientes en este repositorio.
- No se especifica la resolucion de entrada recomendada ni el preprocesamiento necesario. Los usuarios deben consultar la documentacion de RT-DETR para configurar correctamente la entrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/RT-DETR
- Repositorio original de RT-DETRv4: https://github.com/RT-DETRs/RT-DETRv4
- Documentacion de ComfyUI: https://docs.comfy.org/ (no se proporciona enlace directo, pero es el ecosistema de referencia)
