# Liam2333/control_v11p_sd15_openpose

## Resumen

control_v11p_sd15_openpose es un módulo ControlNet v1.1 condicionado a esqueletos de OpenPose, diseñado para guiar la generación de imágenes de Stable Diffusion v1.5 mediante puntos clave de postura humana (cuerpo, manos y cara). Fue desarrollado por Lvmin Zhang y Maneesh Agrawala y publicado originalmente por lllyasviel como parte de la familia ControlNet v1-1; el checkpoint de esta ficha es una conversión al formato `diffusers` del archivo `control_v11p_sd15_openpose.pth`, re-subido por el usuario Liam2333 (0 descargas y 0 likes en el momento de la consulta, y marcado como duplicado de `ControlNet-1-1-preview/control_v11p_sd15_openpose`).

El modelo no genera imágenes por sí solo: es un adaptador de condicionamiento que se acopla a un modelo de difusión base. En este caso, el checkpoint está entrenado específicamente sobre `runwayml/stable-diffusion-v1-5`, y aporta 361.279.120 parámetros adicionales sobre el U-Net de Stable Diffusion. Su función es permitir síntesis de imagen controlada por postura, sin necesidad de reentrenar el modelo base.

Es relevante porque resuelve uno de los problemas clásicos del text-to-image: la imposibilidad de especificar con precisión la pose del sujeto mediante prompt de texto. Con OpenPose como condición, el usuario puede reproducir una postura exacta extraída de una imagen de referencia o de un esqueleto dibujado manualmente, lo que resulta útil en ilustración, animación, previsualización de personajes y edición controlada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet v1.1 sobre U-Net de difusión (Stable Diffusion v1.5); red de condicionamiento con zero convolutions |
| Parametros totales | 361.279.120 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión condicionado por imagen, no basado en ventana de tokens) |
| Tipos de cuantizacion | no disponible; el model card recomienda cargar en `float16` |
| Idiomas soportados | inglés (según el model card); los prompts de otros idiomas no están garantizados |
| Licencia | openrail (CreativeML OpenRAIL-M) |
| Formato de pesos | safetensors (formato `diffusers`) |

## Arquitectura y entrenamiento

ControlNet es una estructura neuronal que añade condiciones externas a modelos de difusión preentrenados. Técnicamente, clona los bloques del encoder del U-Net de Stable Diffusion, congela los pesos originales y añade conexiones de "zero convolution" que se inicializan a cero, de modo que el modelo base no se degrada durante el entrenamiento del adaptador. Esta variante (v1.1) se entrena específicamente para aceptar como condición mapas de esqueleto generados por OpenPose, con soporte opcional de puntos clave de manos y cara (`hand_and_face=True` en `controlnet_aux`).

Según el paper fundacional (Zhang y Agrawala, arXiv:2302.05543), el entrenamiento de un ControlNet es robusto incluso con datasets pequeños (menos de 50.000 pares imagen-condición) y puede ejecutarse en hardware personal. La familia v1-1 publicó 14 checkpoints, cada uno entrenado con Stable Diffusion v1-5 sobre un tipo distinto de condicionamiento (canny, depth, openpose, scribble, etc.). No se detalla en la información disponible ni la composición exacta del dataset, ni el número de tokens/pasos de entrenamiento, ni si se usaron técnicas de ajuste tipo RLHF/DPO (no aplicables habitualmente en modelos de difusión).

## Capacidades

- Generación de imágenes condicionada por postura humana a partir de esqueletos OpenPose.
- Detección y uso de puntos clave de cuerpo completo, manos y cara mediante el preprocesador `OpenposeDetector` de `controlnet_aux`.
- Combinación con prompts de texto de Stable Diffusion v1.5 (image-to-image con control espacial).
- Compatible con el pipeline `StableDiffusionControlNetPipeline` de `diffusers`.
- Puede combinarse con otros ControlNet (canny, depth, etc.) en pipelines multi-control.
- Funciona con modelos derivados de SD1.5 (por ejemplo, variantes con Dreambooth), aunque el autor recomienda usar el checkpoint base original.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.
- No dispone de modo "thinking", ni capacidades de audio o vídeo.

## Casos de uso

- Animación y previsualización de personajes: a partir de una secuencia de esqueletos OpenPose (uno por fotograma) se pueden generar imágenes consistentes de un personaje en distintas posturas, útil para storyboards y previsualización de animación.
- Recreación de posturas a partir de fotografías: se extrae el esqueleto de una foto de referencia con `OpenposeDetector` y se genera una nueva imagen con el personaje o estilo deseado manteniendo exactamente la postura.
- Ilustración y cómic: el ilustrador dibuja o importa un esqueleto para fijar la composición corporal y deja que el modelo rellene vestuario, entorno y estilo mediante prompt.
- Transferencia de pose entre personajes: útil en moda o diseño de personajes para mantener la pose de un referente y cambiar el sujeto (por ejemplo, probar un vestuario sobre una postura concreta).
- Control de manos y expresiones faciales: gracias al modo `hand_and_face=True`, permite generar retratos con gestos manuales y expresiones concretas, un caso históricamente problemático en text-to-image.
- Generación de datos sintéticos para visión por computador: producir imágenes con posturas conocidas y anotadas para entrenar modelos de estimación de pose o de reidentificación.
- Pipelines de edición controlada en producción gráfica: integrado en ComfyUI o AUTOMATIC1111 para flujos con máscaras, inpainting y control de pose fuera del prompt de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ControlNet ocupa en torno a 0,7 GB en `float16` (361 M de parámetros); sumado al U-Net y al VAE de SD1.5, el pipeline completo requiere del orden de 4-6 GB de VRAM en `float16`. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. Tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080/3090, RTX 4090, A100 o H100 funcionan sin problema; en estas dos últimas el rendimiento es muy superior.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más. El `enable_model_cpu_offload()` del pipeline permite ejecutarlo incluso con menos VRAM a costa de velocidad.
- Opciones de despliegue: `diffusers` (script oficial con `StableDiffusionControlNetPipeline` y `UniPCMultistepScheduler`), ComfyUI, AUTOMATIC1111/Forge, InvokeAI y otros frontends que carguen ControlNet. No aplica vLLM ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. Depende del número de pasos de inferencia, resolución, GPU y si se usa offload. El ejemplo del model card usa `num_inference_steps=30`.

## Comparativa con modelos similares

| Modelo | Tipo de condición | Parámetros | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| control_v11p_sd15_openpose | Esqueleto OpenPose | 361.279.120 | SD v1-5 | OpenRAIL-M | Hugging Face (lllyasviel / duplicados) |
| lllyasviel/control_v11p_sd15_canny | Bordes Canny | ~361 M | SD v1-5 | OpenRAIL-M | Hugging Face |
| lllyasviel/control_v11p_sd15_depth | Mapa de profundidad | ~361 M | SD v1-5 | OpenRAIL-M | Hugging Face |
| TencentARC/t2i-adapter-openpose-sd15 | Esqueleto OpenPose | no disponible | SD v1-5 | Apache-2.0 (según repo original) | Hugging Face / GitHub |

Los checkpoints de ControlNet v1-1 comparten la misma arquitectura y recuento de parámetros, diferenciándose únicamente en el tipo de condición para el que fueron entrenados. T2I-Adapter es una alternativa más ligera (menos parámetros), pero el dato exacto no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de artefactos anatómicos: como todo modelo de difusión, puede generar extremidades deformes o manos incorrectas, aunque el condicionamiento OpenPose reduce este problema respecto al text-to-image puro.
- Alucinación visual: el modelo puede inventar detalles no presentes en el esqueleto ni en el prompt (vestuario, fondo, objetos), ya que el control solo fija la geometría corporal.
- Dependencia del preprocesador: la calidad del esqueleto extraído por `OpenposeDetector` condiciona directamente el resultado; detecciones erróneas se traducen en posturas incorrectas.
- Sesgos del dataset: entrenado sobre datos de Stable Diffusion v1-5 y pares OpenPose, puede heredar sesgos de representación (etnia, género, complexión, contexto cultural) presentes en esos datos.
- Limitación de idioma: el model card indica inglés como único idioma soportado; los prompts en otras lenguas pueden dar resultados degradados.
- Restricciones de licencia: CreativeML OpenRAIL-M incluye cláusulas de uso responsable que prohíben determinados usos (contenido ilegal, daño, desinformación, etc.). Es imprescindible revisar la licencia antes de un uso comercial.
- Este repositorio concreto (`Liam2333/control_v11p_sd15_openpose`) es una re-subida duplicada con 0 descargas y 0 likes; para producción conviene usar el repositorio original `lllyasviel/control_v11p_sd15_openpose` o el duplicado canónico `ControlNet-1-1-preview/control_v11p_sd15_openpose`.
- Base SD1.5: al depender de Stable Diffusion v1.5, hereda sus limitaciones (resolución nativa de 512x512, calidad inferior a modelos más recientes como SDXL o Flux).
- Sin fecha de creación fiable: el campo indica 2026-10-14, fecha futura respecto a la publicación del modelo original (2023), lo que apunta a un artefacto de metadatos de la re-subida.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Liam2333/control_v11p_sd15_openpose
- Repositorio original: https://huggingface.co/lllyasviel/control_v11p_sd15_openpose
- Colección ControlNet v1-1: https://huggingface.co/lllyasviel/ControlNet-v1-1
- ControlNet v1.0: https://huggingface.co/lllyasviel/ControlNet
- Paper: https://arxiv.org/abs/2302.05543
- Repositorio GitHub: https://github.com/lllyasviel/ControlNet
- Documentación de Diffusers para ControlNet: https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/controlnet
- Preprocesador controlnet_aux: https://github.com/patrickvonplaten/controlnet_aux
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/control-v11p-sd15-openpose-lllyasviel
- Ficha en modeldatabase: https://modeldatabase.com/lllyasviel/control_v11p_sd15_openpose.html
- Ficha en Civitai: https://civitai.com/models/483162/controlv11psd15openpose
