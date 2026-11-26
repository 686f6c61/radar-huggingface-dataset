# diorboat/ControlNet

## Resumen

ControlNet es una red neuronal auxiliar que se acopla a un modelo de difusion Stable Diffusion 1.5 para anadir control espacial condicional sobre la generacion de imagenes. El repositorio `diorboat/ControlNet` es una redistribucion de los pesos preentrenados originales publicados por Lvmin Zhang y Maneesh Agrawala (Universidad de Stanford), junto con los modelos de deteccion de terceros necesarios para generar los mapas de condicionamiento (OpenPose, MiDaS, M-LSD, HED, UPerNet/Uniformer).

El modelo resuelve el problema de la falta de control geometrico en la difusion texto-a-imagen: en lugar de depender unicamente de un prompt, el usuario aporta un mapa de entrada (bordes Canny, profundidad, pose, segmentacion semantica, normales, garabatos o lineas rectas) que la red replica de forma fiel. Tecnicamente, ControlNet duplica los bloques del encoder de Stable Diffusion en una rama entrenable con conexiones de "zero convolution", congelando el modelo base, lo que permite un entrenamiento estable con pares imagen-condicion.

Es relevante porque se ha convertido en el estandar de facto para control estructural en pipelines de difusion (ComfyUI, Automatic1111, Diffusers) y sigue siendo la base de numerosos derivados (ControlNet-XS, T2I-Adapter, variantes SDXL). El repositorio ocupa 47 GB e incluye tanto los checkpoints `.pth` de ControlNet como los detectores anotadores y el dataset de ejemplo `fill50k.zip`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red auxiliar sobre UNet de Stable Diffusion 1.5 (transformer convolucional con zero convolutions) |
| Parametros totales | no disponible (cada checkpoint `control_sd15_*.pth` ~1.4 GB en fp32; el modelo base SD1.5 ~860 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; resolucion tipica 512x512) |
| Tipos de cuantizacion | no disponible (pesos publicados en `.pth` fp32; existen conversiones externas a fp16 y safetensors) |
| Idiomas soportados | no disponible (condicionamiento textual via CLIP de SD1.5, predominantemente ingles) |
| Licencia | openrail |
| Formato de pesos | `.pth` (PyTorch), `.pt` para anotadores; `.zip` para dataset |

## Arquitectura y entrenamiento

ControlNet clona los 12 bloques del encoder y el bloque del mid-block del UNet de Stable Diffusion 1.5 en una rama paralela entrenable, conectada al modelo original mediante "zero convolutions" (convoluciones 1x1 inicializadas a cero) que se van activando durante el entrenamiento. El modelo base permanece congelado, de modo que solo se optimizan aproximadamente 1.5 mil millones de parametros adicionales por checkpoint. La condicion espacial se inyecta sumandose a las activaciones del UNet en cada nivel de resolucion, lo que permite un control fino sin degradar la calidad del generador original.

Cada checkpoint se entrena de forma independiente para un tipo de condicion: Canny, profundidad (MiDaS), HED (bordes suaves), M-LSD (lineas rectas), normales, OpenPose, garabatos y segmentacion semantica ADE20k. El entrenamiento usa pares imagen-condicion derivados de datasets como COCO y el propio `fill50k` incluido en el repositorio, con data augmentation agresiva en el caso de garabatos para simular trazos humanos. No se documenta en la informacion disponible el numero exacto de tokens, pasos ni el uso de RLHF/DPO (no aplica a modelos de difusion).

## Capacidades

- Generacion de imagenes condicionada por mapa de bordes (Canny, HED, M-LSD).
- Control por mapa de profundidad (MiDaS) para composicion 3D y perspectiva.
- Control por mapa de normales para iluminacion y orientacion de superficies.
- Control por esqueleto OpenPose (cuerpo y manos) para pose humano.
- Control por segmentacion semantica ADE20k para layout de escena.
- Control por garabatos dibujados a mano para bocetos rapidos.
- Composicion con el prompt de texto de SD1.5 (condicionamiento dual texto + estructura).
- Integracion con pipelines de difusion via Diffusers, Automatic1111 y ComfyUI.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- Capacidades multilingues limitadas al tokenizador CLIP de SD1.5 (ingles predominante).

## Casos de uso

- **Previsualizacion arquitectonica controlada**: a partir de un boceto de lineas o un render de profundidad, generar variaciones fotorrealistas manteniendo la geometria exacta del edificio; util porque el mapa Canny o M-LSD fija la estructura y evita que la difusion invente elementos.
- **Animacion de personajes con pose fija**: extraer el esqueleto OpenPose de un video o foto y aplicar distintas identidades o estilos manteniendo la pose; adecuado porque el checkpoint `control_sd15_openpose.pth` preserva la articulacion exacta.
- **Retoque de producto con mascara semantica**: usar segmentacion ADE20k para sustituir fondos o materiales sin alterar el contorno del objeto; el control por `control_sd15_seg.pth` garantiza que la silueta se respete.
- **Prototipado de videojuegos y concept art**: convertir garabatos de diseno en ilustraciones acabadas con `control_sd15_scribble.pth`, acelerando la iteracion de ideas antes de modelado 3D.
- **Reconstruccion de escenas desde profundidad**: emplear `control_sd15_depth.pth` con mapas MiDaS para generar imagenes coherentes con una nube de puntos o un render de profundidad, util en pipelines de fotogrametria.
- **Control de iluminacion en render**: con `control_sd15_normal.pth` se puede dirigir la direccion de la luz y el sombreado de una imagen generada, algo relevante para composicion VFX.
- **Generacion de datasets sinteticos etiquetados**: combinar segmentacion y pose para producir pares imagen-anotacion que alimenten otros modelos de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: cada checkpoint ControlNet anade ~1.4 GB en fp32 (o ~700 MB en fp16) sobre el modelo SD1.5 base (~4 GB en fp16). Un pipeline completo con un solo ControlNet ronda los 6-8 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB, H100 para lotes grandes o multiples ControlNet simultaneos.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores con fp16; en 8 GB es posible con una sola condicion y resolucion 512x512.
- Opciones de despliegue: Diffusers (`StableDiffusionControlNetPipeline`), Automatic1111 (plugin `sd-webui-controlnet`), ComfyUI, InvokeAI, Hugging Face Spaces (Gradio).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del sampler.

## Comparativa con modelos similares

| Modelo | Parametros extra | Tipos de control | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ControlNet (este repo) | ~1.5 B por checkpoint | Canny, depth, HED, M-LSD, normal, openpose, scribble, seg | 512x512 (SD1.5) | openrail | Hugging Face, GitHub |
| T2I-Adapter | ~77 M | Sketch, seg, depth, keypose | 512x512 (SD1.5) | Apache 2.0 | Hugging Face, GitHub |
| ControlNet-XS | ~50 M | Depth, canny, seg | 512x512 | openrail | Hugging Face |
| ControlNet para SDXL | ~2.5 B | Canny, depth, openpose, etc. | 1024x1024 | openrail | Hugging Face |

ControlNet ofrece mayor fidelidad estructural que T2I-Adapter a costa de mas parametros y VRAM; ControlNet-XS reduce el coste manteniendo calidad, y la variante SDXL mejora resolucion a 1024x1024.

## Limitaciones y advertencias

- **Riesgo de alucinacion visual**: la difusion puede generar detalles no presentes en el mapa de condicion, especialmente en zonas con baja densidad de bordes.
- **Sesgos del modelo base**: hereda los sesgos de Stable Diffusion 1.5 (representaciones de genero, etnia y cultura), amplificados por el dataset de entrenamiento.
- **Idioma**: el condicionamiento textual via CLIP esta optimizado para ingles; prompts en castellano rinden peor.
- **Resolucion**: los checkpoints estan entrenados a 512x512; a resoluciones mayores aparecen artefactos y duplicaciones.
- **Licencia**: `openrail` permite uso comercial con restricciones de uso responsable; el autor prohibe explicitamente generar contenido hostil, estereotipado o que cree entornos alienantes. Verificar terminos en el repositorio original de lllyasviel.
- **Pesos en `.pth`**: no se distribuyen en safetensors en este repo, lo que implica riesgo de ejecucion de codigo al cargarlos; se recomienda convertir o usar fuentes oficiales.
- **Mantenimiento**: el repositorio `diorboat/ControlNet` es una redistribucion con 0 descargas y sin actualizaciones desde su creacion; para produccion conviene usar los pesos oficiales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diorboat/ControlNet
- Repositorio oficial GitHub: https://github.com/lllyasviel/ControlNet
- Paper original (arXiv): https://arxiv.org/abs/2302.05543
- Plugin Automatic1111: https://github.com/Mikubill/sd-webui-controlnet
- Demo Gradio en HF Spaces: https://huggingface.co/spaces/hysts/ControlNet
- ControlNet para Diffusers: https://github.com/haofanwang/ControlNet-for-Diffusers
- Lista de Colabs: https://github.com/camenduru/controlnet-colab
- Demo video: https://huggingface.co/spaces/fffiloni/ControlNet-Video
- Demo con otros modelos: https://huggingface.co/spaces/hysts/ControlNet-with-other-models
- Discusion Automatic1111: https://github.com/AUTOMATIC1111/stable-diffusion-webui/discussions/7784
