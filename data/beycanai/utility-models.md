# beycanai/utility-models

## Resumen

`beycanai/utility-models` es un repositorio agregado publicado en Hugging Face que empaqueta un conjunto de modelos auxiliares de vision por computador utilizados en flujos de trabajo de ComfyUI. No se trata de un modelo entrenado por el autor, sino de una recopilación de pesos copiados sin modificar desde sus fuentes originales (Comfy-Org, Meta, ZhengPeng7, depth-anything, onnx-community, entre otros), organizados en carpetas que replican la estructura de directorios `models/` de ComfyUI para permitir una descarga directa.

El paquete cubre seis familias funcionales: segmentación (SAM 3.1 y SAM ViT-B), upscaling y restauración de vídeo (SeedVR2 7B en int8), eliminación de fondo (BiRefNet-HR), estimación de profundidad (Depth Anything V2 Small y Depth Anything 3 en variantes small, base, mono large y metric large), detección de personas (YOLOv10m y YOLOv10x en ONNX) e interpolación de fotogramas (RIFE 4.25). El tamaño total del repositorio es de 15,1 GB, dominado por el checkpoint de SeedVR2 (8,33 GB).

Su relevancia es práctica más que investigadora: simplifica el aprovisionamiento de dependencias en instalaciones de ComfyUI, evitando tener que localizar y descargar cada modelo por separado desde múltiples repositorios. No incluye model card técnica, benchmarks ni documentación de arquitectura más allá de la tabla de ficheros. La licencia agregada figura como `other`, y cada componente conserva la licencia de su origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregado heterogeneo: transformers de vision (SAM, Depth Anything, BiRefNet), CNN (YOLOv10), difusion (SeedVR2), red neuronal recurrente (RIFE) |
| Parametros totales | no disponible (agregado de multiples modelos; el mayor es SeedVR2 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | fp16 (SAM 3.1, VAE de SeedVR2), int8 (SeedVR2), ONNX (YOLOv10), safetensors y .pth segun componente |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | other (cada fichero conserva la licencia de su fuente original) |
| Formato de pesos | safetensors, .pth, .onnx |
| Tamano del repositorio | 15,1 GB |
| Numero de ficheros | 12 |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: agrega pesos ya entrenados por terceros. Cada componente responde a una arquitectura distinta. SAM 3.1 (Comfy-Org) es un modelo de segmentacion promptable basado en transformer con encoder de imagen y decoder de mascaras; SAM ViT-B de Meta emplea un backbone ViT-B con el mismo esquema promptable. SeedVR2 7B es un modelo de difusion para restauracion y upscaling de video, distribuido en este paquete en una variante int8 con convolucion rotada (`convrot`) y un VAE EMA en fp16. BiRefNet-HR es una red de segmentacion de primer plano de alta resolucion orientada a eliminacion de fondo.

Depth Anything V2 Small y Depth Anything 3 (small, base, mono large y metric large) son modelos de estimacion de profundidad monocular basados en ViT, con variantes metricas que predicen profundidad absoluta y variantes mono que predicen profundidad relativa. YOLOv10m y YOLOv10x son detectores de objetos en tiempo real sin NMS, exportados a ONNX. RIFE 4.25 es una red de interpolacion de fotogramas para aumentar la tasa de refresco de video. No se dispone de informacion sobre datasets de entrenamiento, numero de tokens, tecnicas de alineacion o innovaciones tecnicas especificas en la informacion proporcionada.

## Capacidades

- Segmentacion de imagenes promptable (SAM 3.1 y SAM ViT-B) a partir de puntos, cajas o mascaras.
- Upscaling y restauracion de video con SeedVR2 7B, incluyendo recuperacion de detalle en material comprimido o de baja resolucion.
- Eliminacion de fondo de alta resolucion con BiRefNet-HR, generando mascaras alfa de primer plano.
- Estimacion de profundidad monocular en variantes relativa y metrica (Depth Anything V2 y V3).
- Deteccion de personas y objetos con YOLOv10m y YOLOv10x en formato ONNX.
- Interpolacion de fotogramas con RIFE 4.25 para duplicar o cuadruplicar la tasa de fotogramas.
- Integracion nativa con ComfyUI mediante la estructura de carpetas `models/`.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Aprovisionamiento rapido de ComfyUI: un unico comando `hf download` coloca los 12 ficheros en las carpetas correctas de `ComfyUI/models`, reduciendo el tiempo de configuracion de un entorno nuevo.
- Segmentacion de sujetos en pipelines de edicion: SAM 3.1 permite generar mascaras precisas a partir de prompts de punto o caja, utiles para inpainting selectivo o composicion.
- Restauracion de video de archivo: SeedVR2 7B en int8 permite procesar clips de baja calidad y recuperar detalle sin requerir la variante fp16 completa, que ocuparia aproximadamente el doble.
- Rotoscopia y eliminacion de fondo en produccion audiovisual: BiRefNet-HR genera alfa de alta resolucion para separar talento del fondo en planos complejos.
- Generacion de mapas de profundidad para VFX y control de difusion: Depth Anything 3 en variante metrica large aporta profundidad absoluta para integracion 3D y ControlNet de profundidad.
- Deteccion de personas en tiempo real: YOLOv10x en ONNX puede ejecutarse en pipelines de videovigilancia o analitica de aforo con latencia baja.
- Interpolacion de fotogramas para animacion: RIFE 4.25 eleva de 24 a 48 o 60 fps material animado o clips de bajo framerate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mIoU, FID, PSNR, mAP ni latencias para ningun componente.

## Requisitos de hardware

- VRAM estimada: depende del componente. SeedVR2 7B int8 requiere del orden de 9-10 GB solo para pesos, mas activaciones; en la practica necesita una GPU de 16-24 GB. SAM 3.1 fp16 (1,75 GB) cabe en 6-8 GB. Depth Anything 3 large (1,34 GB) y BiRefNet-HR (0,44 GB) funcionan en GPUs de 8 GB. YOLOv10 ONNX y RIFE pueden ejecutarse en CPU o GPUs modestas.
- GPU recomendadas: RTX 4090 o RTX 3090 para SeedVR2; RTX 3060 12 GB o superior para el resto del paquete en conjunto.
- Cabe en GPU de consumo: si, salvo SeedVR2 en configuraciones de menos de 16 GB, que requerira offloading o ejecucion por segmentos.
- Opciones de despliegue: ComfyUI (objetivo principal), ONNX Runtime para los modelos YOLO, PyTorch nativo para el resto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beycanai/utility-models | Agregado de utilidades de vision | no disponible (mayor: 7B) | no aplica | other (mixta por componente) | Hugging Face, 15,1 GB |
| Comfy-Org/SeedVR2 | Upscaling de video | 7B | no aplica | segun origen | Hugging Face |
| ZhengPeng7/BiRefNet_HR | Eliminacion de fondo | no disponible | no aplica | segun origen | Hugging Face |
| depth-anything/Depth-Anything-V2-Small | Profundidad monocular | no disponible | no aplica | segun origen | Hugging Face |

La comparativa directa no es posible porque `utility-models` no es un modelo unico sino un contenedor. Frente a descargar cada dependencia por separado, la ventaja es la organizacion y la reproducibilidad; la desventaja es que no permite seleccionar componentes individuales sin descargar el paquete completo y que la licencia agregada es menos clara que la de cada repositorio original.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: los pesos se copian sin modificar y cualquier problema de calidad o sesgo proviene de las fuentes originales.
- La licencia figura como `other` a nivel de repositorio, pero cada fichero conserva su licencia de origen. Es responsabilidad del usuario verificar la licencia de cada componente antes de uso comercial, especialmente en SAM (Meta) y YOLOv10.
- No hay model card tecnica, benchmarks ni documentacion de arquitectura; la informacion disponible se limita a la tabla de ficheros.
- El repositorio no incluye pipeline declarado ni idiomas, por lo que no es utilizable como modelo de lenguaje.
- El tamano de 15,1 GB obliga a descargar el paquete completo aunque solo se necesite un componente.
- Riesgo de desactualizacion: los enlaces a fuentes originales pueden quedar obsoletos si los repositorios de origen cambian de nombre o se retiran.
- No se especifican requisitos de version de ComfyUI ni compatibilidad con versiones futuras.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beycanai/utility-models
- Comfy-Org/sam3.1: https://huggingface.co/Comfy-Org/sam3.1
- Meta segment-anything: https://github.com/facebookresearch/segment-anything
- Comfy-Org/SeedVR2: https://huggingface.co/Comfy-Org/SeedVR2
- ZhengPeng7/BiRefNet_HR: https://huggingface.co/ZhengPeng7/BiRefNet_HR
- depth-anything/Depth-Anything-V2-Small: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
- Comfy-Org/Depth-Anything-3: https://huggingface.co/Comfy-Org/Depth-Anything-3
- onnx-community/yolov10x: https://huggingface.co/onnx-community/yolov10x
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
