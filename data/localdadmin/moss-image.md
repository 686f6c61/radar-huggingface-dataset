# localdadmin/MOSS-Image

## Resumen

MOSS-Image es un modelo de difusion para generacion y edicion de imagenes desarrollado por OpenMOSS-Team. El repositorio analizado, `localdadmin/MOSS-Image`, no es el modelo original sino un reempaquetado de sus pesos en formato de archivo unico (`diffusion-single-file`) pensado para su uso directo en ComfyUI. Incluye tanto la variante base (`MOSS-Image-Base`) como la variante afinada con SFT (`MOSS-Image-SFT`), ademas de dos LoRAs auxiliares (control de color/profundidad y edicion) y los componentes de texto y VAE necesarios para el pipeline.

La relevancia de este repositorio es practica: simplifica el despliegue del modelo en flujos de trabajo de ComfyUI al ofrecer los pesos ya consolidados en `.safetensors` y organizados por carpeta (`diffusion_models`, `loras`, `text_encoders`, `vae`). El repositorio ocupa 68,8 GB, lo que refleja la inclusion de multiples variantes de pesos (bf16 e int8) y del codificador de texto Qwen3.5-9B en tres cuantizaciones.

La arquitectura interna del modelo de difusion, el numero exacto de parametros y la longitud de contexto no se detallan en la informacion disponible. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (detalles de la red no disponibles); pipeline text-to-image y edicion con codificador de texto Qwen3.5-9B y VAE Flux2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8 (convrot), w4a8 GPTQ (solo para el text encoder) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo unico para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio es un reempaquetado de los pesos originales de OpenMOSS-Team en archivos `.safetensors` individuales para ComfyUI. Segun la estructura de carpetas indicada en la model card, el pipeline se compone de: un modelo de difusion (`moss_image_base` y `moss_image_sft`, en bf16 e int8), un codificador de texto basado en Qwen3.5-9B (en bf16, int8 y w4a8 GPTQ) y un VAE derivado de Flux2 (`flux2-vae.safetensors` y una variante `flux2-vae_small.safetensors`). Se incluyen ademas dos LoRAs: una de control de color y profundidad (`moss_image_color_depth_control`) y otra de edicion de rango 64 (`moss_image_edit_lora_rank_64_bf16`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo de difusion. La existencia de una variante SFT sugiere un ajuste supervisado posterior al entrenamiento base, pero los detalles no estan disponibles.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), con variantes base y SFT.
- Generacion guiada por layout mediante cajas delimitadoras (workflows `t2i_bboxes`), lo que permite control espacial de los elementos de la imagen.
- Edicion de imagenes mediante la LoRA de edicion (`moss_image_edit_lora_rank_64_bf16`).
- Control de color y profundidad mediante LoRA especifica.
- Integracion nativa con ComfyUI a traves de workflows oficiales de Comfy-Org.
- Soporte de cuantizacion int8 para el modelo de difusion y de w4a8 GPTQ para el codificador de texto, orientado a reducir requisitos de VRAM.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de ilustraciones para prototipado rapido: el workflow text-to-image de ComfyUI permite obtener imagenes a partir de prompts sin escribir codigo, adecuado para disenadores que iteran conceptos visuales.
- Composicion con control espacial: el workflow layout-guided text-to-image con cajas delimitadoras permite colocar objetos en posiciones concretas, util para maquetas de interfaces, storyboards o diseno de escenas.
- Edicion de imagenes existentes: la LoRA de edicion permite modificar imagenes manteniendo coherencia, aplicable a retoque de fotografias de producto o ajustes de escenas.
- Control de color y profundidad: la LoRA especifica facilita tareas de posproduccion donde se necesita coherencia cromatica o de profundidad, como integracion de elementos en escenas existentes.
- Despliegue local en estaciones de trabajo con GPU consumer: las variantes int8 y el text encoder cuantizado a w4a8 reducen el coste de VRAM, permitiendo ejecutar el pipeline en equipos de gama alta sin servidores dedicados.
- Automatizacion de pipelines de contenido visual: al integrarse en ComfyUI, el modelo puede encadenarse con otros nodos (upscaling, segmentacion, inpainting) para generar lotes de imagenes de forma programatica.
- Experimentacion e investigacion: al estar bajo licencia Apache 2.0 y con pesos abiertos, sirve como base para fine-tuning o para estudiar tecnicas de difusion con codificador de texto LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El repositorio ocupa 68,8 GB e incluye pesos bf16 e int8; la ejecucion completa en bf16 requiere una GPU con VRAM amplia (previsiblemente 24 GB o mas para el modelo de difusion, aunque no se confirma), mientras que las variantes int8 y el text encoder w4a8 reducen el requisito.
- GPU recomendadas: no disponibles en la informacion. Por el tamano del codificador de texto (Qwen3.5-9B) y del modelo de difusion, se intuye la necesidad de GPUs de gama alta (RTX 4090, A100, H100), pero no se confirma.
- Cabe en GPU consumer: probablemente en GPUs de gama alta con 24 GB o mas usando cuantizaciones int8, aunque no se especifica.
- Opciones de despliegue: ComfyUI (soporte nativo mediante workflows oficiales de Comfy-Org). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables (por ejemplo, Flux, SDXL u otros modelos de difusion con codificador de texto LLM) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio es un reempaquetado no oficial de los pesos originales de OpenMOSS-Team; conviene verificar la integridad y procedencia de los archivos antes de usarlos en produccion.
- No se dispone de informacion sobre sesgos del modelo, riesgo de alucinacion visual ni limitaciones de idioma.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribucion y las condiciones de la licencia original del modelo base.
- El tamano del repositorio (68,8 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- La ausencia de benchmarks publicados en la informacion disponible impide evaluar la calidad relativa frente a alternativas.
- El uso de LoRAs de terceros (`darask0`, `chinoll`) anade dependencias externas cuya calidad y mantenimiento no estan garantizados.

## Enlaces

- Repositorio reempaquetado: https://huggingface.co/localdadmin/MOSS-Image
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo SFT original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de control de color y profundidad: https://huggingface.co/darask0/MOSS-Image-color-depth-control
- LoRA de edicion: https://huggingface.co/chinoll/Moss-Image-Edit
- Workflow text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_t2i.json
- Workflow base text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_base_t2i.json
- Workflow layout-guided text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_t2i_bboxes.json
- Workflow base layout-guided text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_moss_image_base_t2i_bboxes.json
