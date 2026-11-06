# bigshanedogg/Depth-Anything-V1-Base

## Resumen

Depth-Anything-V1-Base es un port no oficial a `transformers` del modelo Depth Anything v1 en su variante Base (`LiheYoung/depth_anything_vitb14`), publicado por el usuario `bigshanedogg`. El modelo original fue desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao, y presentado en el paper "Depth Anything: Unleashing the Power of Large-Scale Unlabeled Data" (CVPR 2024, arXiv 2401.10891). Resuelve el problema de la estimacion de profundidad monocular densa (monocular depth estimation) a partir de una unica imagen RGB.

El modelo combina un encoder DINOv2 ViT-B/14 (extraido de una copia local de torchhub de facebookresearch/dinov2) con una cabeza DPT que produce un mapa de profundidad inversa relativa. Cuenta con 97.470.785 parametros y un repositorio de 0,4 GB en formato safetensors. Su relevancia radica en que permite ejecutar el codigo original de Depth Anything dentro del ecosistema `transformers` mediante `trust_remote_code`, con verificacion de que la salida es bit-identica a la del codigo oficial.

La diferencia clave respecto a otras conversiones es que este port preserva el codigo original (submodulos `pretrained` y `depth_head`, `DPT_DINOv2.forward`), en lugar de reimplementar la arquitectura. Esto lo hace util para investigadores que necesitan reproducibilidad exacta con el repositorio original de LiheYoung/Depth-Anything.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT sobre encoder DINOv2 ViT-B/14 (transformer ViT + cabeza DPT) |
| Parametros totales | 97.470.785 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32/fp16 verificados) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno DPT_DINOv2 del repositorio original: un encoder DINOv2 ViT-B/14 preentrenado que extrae cuatro niveles de features, y una cabeza DPT que fusiona esas features y produce un mapa de profundidad inversa relativa (`predicted_depth`) con la resolucion del parche de salida. El codigo fue vendorizado desde LiheYoung/Depth-Anything en el commit 1d033367 en los ficheros `dav1_dinov2.py` y `dav1_dpt.py`, con cambios minimos de imports y la sustitucion de `Block` por `NestedTensorBlock` donde el original importaba `NestedTensorBlock as Block`.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. El paper original de Depth Anything describe el uso de datos no etiquetados a gran escala, pero esa informacion no se detalla en la model card de este port. La innovacion tecnica destacable de este repositorio concreto es la fidelidad de la conversion: se verifico contra el codigo oficial (mismo proceso, GPU V100, 3 imagenes incluyendo no cuadradas) que el preprocesado, `predicted_depth` (tambien como tupla) en fp32 y bajo autocast fp16, los hidden states y el post-procesado al tamano original son bit-identicos.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una imagen RGB.
- Salida de profundidad inversa relativa (`predicted_depth`) con forma `(1, H', W')`.
- Soporte de `output_hidden_states=True` para obtener las 4 features de DINOv2 que consume la cabeza DPT.
- Soporte de `return_dict=False` para devolver una tupla.
- Post-procesado al tamano original mediante `post_process_depth_estimation` (redimensionado bilineal, `align_corners=False`, igual que el `run.py` original).
- Inferencia en fp32 y fp16 (verificada bajo autocast fp16).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).

## Casos de uso

- Reconstruccion 3D y fotogrametria: a partir de una unica imagen se obtiene un mapa de profundidad denso que puede proyectarse a nube de puntos para modelado 3D, ya que el modelo produce profundidad relativa por pixel con resolucion de parche.
- Realidad aumentada y efectos de desenfoque: el mapa de profundidad permite separar primer plano y fondo para aplicar bokeh sintetico o superponer objetos virtuales con oclusion correcta.
- Preprocesado para pipelines de robotica y navegacion: un agente movil puede estimar distancias relativas a obstaculos a partir de una camara monocular, sin necesidad de sensores de profundidad dedicados.
- Generacion de mapas de profundidad para datasets de entrenamiento: util para etiquetar automaticamente imagenes con profundidad pseudo-ground-truth en tareas de vision por computador.
- Control de profundidad en generacion de imagen/video: los mapas de profundidad pueden alimentar modelos generativos condicionados por profundidad (ControlNet y similares) para composicion espacial coherente.
- Analisis de escenas en inspeccion industrial o agricultura: estimacion de distancias relativas a objetos en imagenes de dron o camara fija para tareas de conteo y segmentacion asistida.
- Reproducibilidad de investigacion: al ser bit-identico al codigo oficial, sirve para replicar experimentos del paper dentro de un pipeline `transformers` sin depender del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta una verificacion de equivalencia funcional: preprocesado, `predicted_depth` en fp32 y fp16, hidden states y post-procesado son bit-identicos al codigo oficial sobre 3 imagenes en una V100. No se aportan metricas como RMSE, AbsRel o delta1 sobre datasets como NYUv2 o KITTI.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 97,47 M de parametros; en fp32 ocupa aproximadamente 0,39 GB de pesos y en fp16 unos 0,19 GB. Con activaciones y overhead de PyTorch, la inferencia cabe holgadamente en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente. Se ha verificado en V100; tambien es adecuado en A100, H100, RTX 4090, RTX 3090, RTX 3060 y similares.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1650, RTX 2060, RTX 3050 en adelante). Tambien puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via `AutoModelForDepthEstimation` y `AutoProcessor`). Requiere `torch`, `transformers`, `opencv-python`, `torchvision` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V1-Base (este port) | 97,47 M | DPT + DINOv2 ViT-B/14 | no aplica | Apache-2.0 | Hugging Face, `trust_remote_code` |
| LiheYoung/depth_anything_vitb14 (original) | no disponible en la informacion | DPT + DINOv2 ViT-B/14 | no aplica | sin licencia declarada en el repo de pesos; repositorio Apache-2.0 | Hugging Face, codigo original |
| LiheYoung/depth-anything-base-hf (conversion oficial) | no disponible en la informacion | DPT + DINOv2 ViT-B/14 | no aplica | Apache-2.0 | Hugging Face, `transformers` nativo |

La diferencia principal entre este port y `LiheYoung/depth-anything-base-hf` es que este ultimo es una conversion nativa a `transformers` (sin `trust_remote_code`), mientras que el presente repositorio ejecuta el codigo original vendorizado y garantiza equivalencia bit-identica con el repositorio de LiheYoung. No se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial: es un port no oficial realizado por `bigshanedogg`, con solo 14 descargas y 0 likes en el momento de la consulta.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio; conviene auditar `dav1_dinov2.py`, `dav1_dpt.py` y `processing_depth_anything_v1.py` antes de usarlo en produccion.
- La salida es profundidad inversa relativa, no profundidad metrica absoluta; para distancias en metros se necesita calibracion adicional.
- El repositorio de pesos original `LiheYoung/depth_anything_vitb14` no declara licencia propia; la Apache-2.0 se hereda del repositorio de codigo y de la conversion oficial de la misma organizacion. Conviene revisar el `NOTICE` y el `LICENSE` incluidos.
- Riesgo de alucinacion: como todo modelo de profundidad monocular, puede producir estimaciones incorrectas en escenas con superficies reflectantes, transparentes, texturas repetitivas o iluminacion extrema.
- Sesgos: no documentados en la informacion disponible; al entrenarse con datos no descritos en la model card, pueden existir sesgos de dominio (escenas urbanas, interiores, etc.).
- Sin soporte de lenguaje ni contexto textual: no es adecuado para tareas de NLP, agentes o tool calling.
- Dependencias adicionales obligatorias (`opencv-python`, `torchvision`, `huggingface_hub`) mas alla de `torch` y `transformers`.
- El post-procesado usa redimensionado bilineal con `align_corners=False`, distinto del bicubico de `transformers`; usar el metodo del procesador del modelo para mantener la equivalencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigshanedogg/Depth-Anything-V1-Base
- Modelo base original: https://huggingface.co/LiheYoung/depth_anything_vitb14
- Conversion oficial a transformers: https://huggingface.co/LiheYoung/depth-anything-base-hf
- Repositorio oficial de Depth Anything: https://github.com/LiheYoung/Depth-Anything
- Paper (arXiv): https://arxiv.org/abs/2401.10891
- DINOv2 (facebookresearch): https://github.com/facebookresearch/dinov2
