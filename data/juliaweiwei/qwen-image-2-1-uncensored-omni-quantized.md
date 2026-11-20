# juliaWeiwei/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Omni-Quantized es una distribución cuantizada del adaptador Omni de rango 128 desarrollado por ChatR Labs, fusionado sobre el modelo base Qwen/Qwen-Image-2.1 de Alibaba Qwen a fuerza LoRA 1.0. El repositorio, publicado por el usuario juliaWeiwei, contiene únicamente los pesos del transformer cuantizados en múltiples formatos (GGUF, FP8, INT8, NVFP4, NF4), y está pensado para generación texto-a-imagen y edición de imágenes en ComfyUI y Diffusers. El text encoder, el processor y el VAE no se incluyen y deben tomarse del repositorio base.

El modelo aborda la demanda de ejecución local de un modelo de difusión de gran tamaño con variantes "uncensored" (sin filtros de contenido), ofreciendo hasta doce builds distintos que van desde BF16 de 14,23 GB hasta NF4 de 3,67 GB, lo que permite desplegarlo en GPUs de consumo con VRAM limitada. La arquitectura subyacente es la de Qwen-Image-2.1, un transformer de difusión con 7.115.124.736 parámetros totales según los safetensors del repositorio, y el repo completo ocupa 92,5 GB.

Es relevante ahora porque combina tres tendencias: la cuantización agresiva de modelos de difusión (NVFP4, INT8 ConvRot), la integración nativa con ComfyUI mediante operadores cuantizados, y la publicación de variantes sin censura para investigación y flujos creativos sin restricciones. La licencia es `qwen-research` (etiquetada como `other`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image-2.1) con adaptador Omni de rango 128 fusionado |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF Q8_0/Q6_K/Q5_K_M/Q4_K_M/Q4_0, FP8 E4M3, INT8 ConvRot, NVFP4, NF4 (bitsandbytes), INT8 (bitsandbytes), FP8 (torchao) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiqueta `other`) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación y edición de imágenes, basado en Qwen/Qwen-Image-2.1. Sobre ese base se aplicó un adaptador Omni de rango 128 (LoRA) entrenado por ChatR Labs, que se fusionó a fuerza 1.0 y posteriormente se cuantizó. No se trata de un modelo destilado para pocos pasos: la model card indica explícitamente que es una fusión LoRA regular y que no incorpora destilación few-step, por lo que requiere 35 pasos de muestreo con CFG verdadero de 5.0.

Los detalles sobre el dataset de entrenamiento del adaptador (número de tokens, composición, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card menciona que Chatr AI proporcionó la infraestructura GPU para el entrenamiento, pero no detalla la metodología. Técnicamente, lo destacable es la doble representación del MLP: los layouts de 297 tensores mantienen `gate_layer`/`proj` separados, mientras que los de 265 tensores usan la proyección fusionada `img_mlp.gate_up`, lo que obliga al loader a soportar el layout seleccionado. Los archivos `-comfy.safetensors` usan operadores nativos de cuantización de ComfyUI y solo cargan en ese runtime.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resoluciones recomendadas de 768x1152 o 1024x1024.
- Edición de imágenes: la imagen de referencia se codifica con el nodo `Text Encoder (Qwen-Image)` en modo edición y el latente proviene de ese nodo.
- Variante "uncensored": el adaptador Omni elimina los filtros de contenido del modelo base, permitiendo prompts que el base rechazaría.
- Múltiples formatos de cuantización para distintos runtimes: GGUF para ComfyUI y Diffusers, FP8/INT8/NVFP4 para operadores nativos de ComfyUI, NF4/INT8/FP8-torchao para Diffusers.
- Soporte de KV cache durante la inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión-a-texto ni audio; es un modelo exclusivamente generativo de imagen.

## Casos de uso

- Generación de ilustración y arte conceptual en local: con el build Q4_K_M (4,47 GB) o NF4 (3,67 GB) se puede ejecutar en GPUs de consumo de 8-12 GB de VRAM, ideal para estudios que quieren evitar dependencias de API y costes por imagen.
- Edición de imágenes por prompt en flujos de posproducción: usando el modo edición del text encoder de Qwen-Image, se puede modificar una imagen de referencia (cambiar estilo, objetos, iluminación) manteniendo la composición original, lo que encaja en pipelines de retoque automatizado.
- Prototipado rápido en ComfyUI: el build GGUF Q5_K_M (5,21 GB) se carga con `Unet Loader (GGUF)` y funciona tanto para texto-a-imagen como para edición, lo que permite iterar workflows sin cambiar de modelo.
- Investigación sobre cuantización de modelos de difusión: la disponibilidad de doce builds con distintos esquemas (NVFP4, INT8 ConvRot, FP8 E4M3) permite comparar fidelidad frente a tamaño y medir el impacto de cada formato en la calidad de salida.
- Generación de contenido sin restricciones para investigación en seguridad: al ser una variante uncensored, sirve para estudiar el comportamiento de modelos de difusión ante prompts que el base filtra, útil en auditorías de alineación y red teaming.
- Despliegue en servidores con VRAM ajustada: el build FP8 (7,12 GB) o INT8 (7,26 GB) con operadores nativos de ComfyUI reduce el uso de memoria frente a BF16 (14,23 GB) manteniendo fidelidad alta, adecuado para instancias cloud con GPUs de 16 GB.
- Integración en Diffusers para automatización: los builds NF4 (bitsandbytes) y FP8 (torchao) permiten cargar el modelo en scripts Python con `from_pretrained`, facilitando la generación por lotes en pipelines de CI o servicios backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer, sin text encoder ni VAE): BF16 ~14,23 GB; Q8_0 ~7,69 GB; Q6_K ~6,00 GB; Q5_K_M ~5,21 GB; Q4_K_M ~4,47 GB; Q4_0 ~4,20 GB; FP8 E4M3 ~7,12 GB; INT8 ConvRot ~7,26 GB; NVFP4 ~4,20 GB; FP8 torchao ~7,12 GB; NF4 ~3,67 GB; INT8 bnb ~7,12 GB.
- Hay que sumar la VRAM del text encoder, el processor y el VAE de Qwen-Image-2.1, que no se incluyen en este repo y deben descargarse del base.
- GPU recomendadas: A100 o H100 para BF16 con margen; RTX 4090 (24 GB) para BF16 o FP8; RTX 4080/4070 Ti (16 GB) para FP8/INT8; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q5_K_M/Q4_K_M; GPUs de 8 GB solo con NF4 o Q4_0 y contando con el resto de componentes.
- Cabe en GPU de consumo: sí, con los builds Q4/Q5/NF4/NVFP4 en tarjetas de 8-12 GB, siempre que el text encoder y el VAE se gestionen con cuidado (posible offload).
- Opciones de despliegue: ComfyUI (GGUF vía `Unet Loader (GGUF)`, safetensors comfy vía `Load Diffusion Model`), Diffusers (`from_single_file` para GGUF, `from_pretrained` para BF16/FP8-torchao/NF4/INT8-bnb). No se documenta soporte para vLLM, TGI ni Ollama (no aplican a difusión).
- Latencia y throughput estimados: no disponibles. La model card solo fija 35 pasos de muestreo, sampler `er_sde`, scheduler `simple` y CFG verdadero 5.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Omni-Quantized | 7.115.124.736 | no disponible | qwen-research | HF, 12 builds cuantizados | Adaptador uncensored fusionado, solo transformer |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion | no disponible | qwen-research | HF | Modelo original con filtros; incluye text encoder, VAE y processor |
| Otros modelos de difusion de ~7B (p. ej. FLUX.1) | no disponible en la informacion | no disponible | varía | HF | No se dispone de datos comparativos en la informacion proporcionada |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; solo se puede contrastar con el modelo base del que deriva.

## Limitaciones y advertencias

- La licencia `qwen-research` (etiquetada como `other`) restringe el uso comercial; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier despliegue en producción.
- La variante "uncensored" elimina los filtros del base: puede generar contenido sensible, violento o sexual según el prompt, lo que implica riesgos legales y de reputación en aplicaciones públicas.
- Riesgo de alucinación visual: como todo modelo de difusión, puede producir anatomías incorrectas, texto ilegible en imágenes y artefactos en composiciones complejas.
- El repositorio no incluye text encoder, processor ni VAE; un uso incompleto o con componentes de otra versión puede degradar la calidad o fallar.
- Los layouts de 297 y 265 tensores son incompatibles entre sí; cargar un archivo con un loader que no soporte su layout provoca errores.
- Los archivos `-comfy.safetensors` solo funcionan en ComfyUI; los builds torchao y bitsandbytes solo en Diffusers.
- El workflow BF16 en ComfyUI solo está verificado con el archivo safetensors de 297 tensores y `UNETLoader` de ComfyUI 0.39.0; no se garantiza en versiones anteriores o loaders distintos.
- No es un modelo destilado: requiere 35 pasos y CFG 5.0, por lo que la latencia es mayor que en variantes few-step.
- Un negative prompt vacío u omitido desactiva el CFG verdadero aunque `true_cfg_scale` sea mayor que 1; hay que usar un espacio si no se necesita negative prompt específico.
- No hay información sobre sesgos demográficos ni cobertura idiomática del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria del rendimiento real de los builds.

## Enlaces

- Hugging Face: https://huggingface.co/juliaWeiwei/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Playground de ChatR Labs: https://chatrlabs.com/
- Chatr AI: https://thechatr.ai
