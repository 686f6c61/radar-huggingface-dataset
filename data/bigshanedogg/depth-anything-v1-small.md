# bigshanedogg/Depth-Anything-V1-Small

## Resumen

Depth-Anything-V1-Small es un modelo de estimacion de profundidad monocular (depth estimation) basado en la arquitectura DPT con un backbone DINOv2 ViT-S/14. El modelo original fue desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao, y presentado en el paper "Depth Anything: Unleashing the Power of Large-Scale Unlabeled Data" (CVPR 2024, arXiv 2401.10891). Esta ficha concreta corresponde a un port no oficial a `transformers` publicado por el usuario bigshanedogg, que empaqueta los pesos originales de `LiheYoung/depth_anything_vits14` en formato safetensors manteniendo los nombres de tensor originales.

El modelo resuelve el problema de estimar un mapa de profundidad relativa (relative inverse depth) a partir de una unica imagen RGB. Con 24.785.089 parametros totales y un repositorio de apenas 0.1 GB, es un modelo ligero pensado para inferencia rapida en GPU de consumo. Su relevancia radica en que permite usar el codigo original de Depth Anything dentro del ecosistema `transformers` (con `AutoModelForDepthEstimation` y `AutoProcessor`), sin necesidad de clonar el repositorio de GitHub ni gestionar manualmente el torchhub de DINOv2.

La verificacion reportada por el autor indica que el pipeline (preprocesado, `predicted_depth` en fp32 y bajo autocast fp16, hidden states y post-procesado al tamano original) es bit-identico al codigo oficial sobre una V100 con tres imagenes, incluyendo casos no cuadrados. Esto lo convierte en una alternativa practica para integrar depth estimation en pipelines de produccion basados en `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT (Dense Prediction Transformer) con backbone DINOv2 ViT-S/14 |
| Parametros totales | 24.785.089 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada por imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32; el autor verifica fp16 autocast) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DPT: un backbone DINOv2 ViT-S/14 (patch size 14) que extrae cuatro niveles de features, y una cabeza DPT (`depth_head`) que las combina y produce un mapa de profundidad denso. El codigo esta vendorizado desde `LiheYoung/Depth-Anything` en el commit 1d033367, con modificaciones menores de imports y el reemplazo de `Block` por `NestedTensorBlock` donde el original importaba `NestedTensorBlock as Block`. La copia local de DINOv2 procede de `facebookresearch/dinov2` y se carga con `torch.hub.load(..., source="local")`.

El entrenamiento original de Depth Anything (v1) se describe en el paper CVPR 2024: se apoya en datos no etiquetados a gran escala combinados con datos con pseudo-etiquetas de profundidad, lo que permite al modelo generalizar a escenas e imagenes no vistas. Esta ficha no incluye detalles numericos del dataset de entrenamiento (numero de tokens o imagenes, composicion exacta) porque no estan disponibles en la informacion proporcionada. La innovacion tecnica destacable del port es la fidelidad bit-exacta respecto al codigo oficial, incluyendo el post-procesado con interpolacion bilineal y `align_corners=False` (en lugar del bicubico de `transformers`).

## Capacidades

- Estimacion de profundidad monocular relativa (relative inverse depth) a partir de una imagen RGB.
- Salida en formato `DepthEstimatorOutput` con el campo `predicted_depth` de forma `(1, H', W')`.
- Post-procesado al tamano original de la imagen mediante `post_process_depth_estimation`.
- Soporte de `output_hidden_states=True` para obtener las cuatro features de DINOv2 que consume la cabeza DPT.
- Soporte de `return_dict=False` para obtener una tupla en lugar de un objeto de salida.
- Inferencia en fp32 y bajo autocast fp16 verificada por el autor.
- Manejo de imagenes no cuadradas (verificado en la validacion del autor).
- No dispone de tool calling, agentes, capacidades multilingues ni generacion de texto: es un modelo puramente de vision.

## Casos de uso

- Reconstruccion 3D y fotogrametria: usar `predicted_depth` como mapa de profundidad por pixel para generar nubes de puntos o mallas a partir de una sola imagen, aprovechando que el modelo funciona con imagenes no cuadradas sin recortes forzados.
- Realidad aumentada y efectos: estimar la profundidad de la escena para colocar objetos virtuales con oclusion correcta en tiempo real, gracias al reducido tamano del modelo (24,8 M de parametros).
- Robotica y navegacion: alimentar modulos de evitacion de obstaculos o planificacion de trayectorias con mapas de profundidad densos a partir de una camara monocular, reduciendo el coste frente a sensores LiDAR o estereo.
- Segmentacion y matting asistidos por profundidad: usar el mapa de profundidad como señal auxiliar para separar primer plano y fondo en pipelines de edicion de imagen o video.
- Preprocesado para modelos de difusion condicionados por profundidad: generar mapas de profundidad como condicionamiento en pipelines de generacion de imagen (por ejemplo, ControlNet con depth), integrándose via `transformers`.
- Automatizacion de inspeccion industrial: estimar la distancia relativa de piezas o superficies en cadenas de inspeccion visual con una unica camara, desplegando el modelo en GPU de consumo.
- Prototipado e investigacion: sustituir el repositorio oficial por una carga estandar `AutoModelForDepthEstimation.from_pretrained(..., trust_remote_code=True)` en cuadernos y pipelines de evaluacion, manteniendo resultados bit-identicos al codigo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una verificacion de equivalencia funcional (preprocesado, `predicted_depth` en fp32 y fp16, hidden states y post-procesado bit-identicos al codigo oficial) sobre una V100 con tres imagenes, sin cifras de metricas como AbsRel, RMSE o delta1.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para una imagen de resolucion tipica, dado el tamano del modelo (24,8 M de parametros, ~100 MB en fp32); en fp16 se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor valido el modelo en una NVIDIA V100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs de gama baja con suficiente VRAM).
- Opciones de despliegue: `transformers` con `AutoModelForDepthEstimation` y `trust_remote_code=True`; requiere ademas `opencv-python`, `torchvision` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V1-Small (esta ficha) | 24,8 M | DPT + DINOv2 ViT-S/14 | imagen RGB | Apache-2.0 | HuggingFace (`bigshanedogg/Depth-Anything-V1-Small`) |
| LiheYoung/depth_anything_vits14 | no disponible en la informacion | DPT + DINOv2 ViT-S/14 | imagen RGB | el repo de pesos no declara licencia propia; el repositorio es Apache-2.0 | HuggingFace (repo original de pesos) |
| LiheYoung/depth-anything-small-hf | no disponible en la informacion | DPT + DINOv2 ViT-S/14 | imagen RGB | Apache-2.0 | HuggingFace (conversion oficial en `transformers`) |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de modelos alternativos de estimacion de profundidad (por ejemplo, MiDaS o ZoeDepth) ni sus especificaciones.

## Limitaciones y advertencias

- Modelo no oficial: es un port de terceros, no una release oficial de los autores de Depth Anything; el autor lo indica explicitamente en la model card.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- La salida es profundidad relativa (inverse depth), no profundidad metrica absoluta; para medidas en metros hace falta calibracion adicional.
- No es un modelo linguistico: no soporta texto, tool calling, agentes ni capacidades multilingues.
- Riesgo de alucinacion entendido como profundidades plausibles pero incorrectas en escenas fuera de la distribucion de entrenamiento, objetos reflectantes o transparentes, y superficies sin textura.
- El repositorio de pesos original (`LiheYoung/depth_anything_vits14`) no declara licencia propia; el autor justifica Apache-2.0 apoyandose en la licencia del repositorio de codigo y de la conversion oficial en `transformers`. Para uso comercial conviene revisar esa cadena de licencias.
- Dependencias adicionales no estandar en `transformers`: `opencv-python`, `torchvision` y `huggingface_hub`.
- El post-procesado difiere del de `transformers` por defecto (bilineal con `align_corners=False` en lugar de bicubico); usar el metodo del processor para reproducir el comportamiento oficial.
- Sin datos publicados de benchmarks que permitan evaluar su precision frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigshanedogg/Depth-Anything-V1-Small
- Modelo base (pesos originales): https://huggingface.co/LiheYoung/depth_anything_vits14
- Repositorio oficial de Depth Anything: https://github.com/LiheYoung/Depth-Anything
- Paper (arXiv): https://arxiv.org/abs/2401.10891
- DINOv2 (Meta): https://github.com/facebookresearch/dinov2
