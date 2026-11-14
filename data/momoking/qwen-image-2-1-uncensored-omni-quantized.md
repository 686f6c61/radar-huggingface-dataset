# Momoking/Qwen-Image-2.1-Uncensored-Omni-Quantized

## Resumen

ChatR Labs Uncensored Omni es una variante afinada y cuantizada del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, publicada por el usuario Momoking en Hugging Face. El autor ha fusionado un adaptador LoRA de rango 128 ("Omni") sobre el modelo base con una fuerza de 1.0 y ha generado un conjunto amplio de builds cuantizados del transformer, cubriendo formatos GGUF, FP8, INT8, NVFP4, NF4 y BF16. El repositorio contiene unicamente los pesos del transformer; el codificador de texto, el procesador y el VAE deben tomarse del repositorio base.

El modelo resuelve dos tareas: generacion de imagenes a partir de texto (text-to-image) y edicion de imagenes (image-editing), con un enfasis explicito en eliminar restricciones de contenido ("uncensored"). Su relevancia practica radica en la variedad de formatos de cuantizacion ofrecidos, que permiten desplegarlo desde GPUs de consumo moderado (builds NF4 de 3,67 GB) hasta entornos de alta fidelidad (BF16 de 14,23 GB), y en la compatibilidad declarada con ComfyUI y Diffusers.

El transformer cuenta con 7.115.124.736 parametros (aproximadamente 7,1 mil millones), lo que lo situa en la gama de modelos de difusion de gran tamano para generacion de imagenes. El repositorio completo ocupa 92,5 GB debido a la multiplicidad de formatos. No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) derivado de Qwen-Image-2.1; no se detalla la arquitectura interna |
| Parametros totales | 7.115.124.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), FP8 E4M3, FP8 (torchao), INT8 ConvRot, INT8 (bitsandbytes), NVFP4, NF4 (bitsandbytes), BF16 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (BF16, FP8, INT8, NVFP4) y GGUF; tambien carpetas torchao y bitsandbytes |

## Arquitectura y entrenamiento

El modelo es una variante del transformer de difusion de Qwen-Image-2.1. El autor ha fusionado un adaptador LoRA de rango 128 denominado "Omni" sobre el modelo base con una fuerza de 1.0, y posteriormente ha cuantizado los pesos resultantes en multiples formatos. No se especifica en la informacion disponible la arquitectura interna del transformer (atencion, bloques, mecanismo de condicionamiento), el numero de tokens de entrenamiento ni la composicion del dataset utilizado para el afinado LoRA.

El checkpoint se identifica como "step90000", lo que sugiere un entrenamiento prolongado del adaptador. No se documenta si hubo RLHF, DPO ni otras tecnicas de alineacion. La innovacion tecnica destacable es la oferta de dos layouts de pesos distintos: uno de 297 tensores que mantiene separadas las proyecciones `gate_layer` y `proj`, y otro de 265 tensores que usa la proyeccion fusionada `img_mlp.gate_up`; el cargador debe soportar el layout seleccionado. Ademas, se ofrecen builds especificos para ComfyUI (FP8, INT8 ConvRot, NVFP4) y para Diffusers (torchao, bitsandbytes), lo que refleja un esfuerzo de compatibilidad con distintos runtimes.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), con resoluciones recomendadas de 768x1152 o 1024x1024.
- Edicion de imagenes: el modelo acepta una imagen de referencia codificada mediante el nodo `Text Encoder (Qwen-Image)` en modo edicion.
- Generacion sin restricciones de contenido ("uncensored"), orientada a evitar filtros de seguridad en la salida.
- Compatibilidad con ComfyUI mediante los nodos nativos `Unet Loader (GGUF)`, `Load Diffusion Model`, `TextEncodeQwenImage21` y `QwenImage21Cache`.
- Compatibilidad con Diffusers mediante `from_single_file` (GGUF) o `from_pretrained` (carpetas BF16, torchao, bitsandbytes).
- Soporte de CFG real (true CFG) con escala 5.0 y prompt negativo de un solo espacio.
- Cache KV activable para acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes, vision multimodal de entrada ni audio; se trata de un modelo generativo de imagenes, no de un LLM conversacional.

## Casos de uso

- Generacion de ilustraciones y concept art: el modelo produce imagenes a 1024x1024 con 35 pasos y CFG 5.0, adecuado para prototipado visual rapido en estudios de diseno que necesiten explorar variaciones estilisticas sin restricciones de contenido.
- Edicion de imagenes existentes: gracias al modo de edicion con imagen de referencia codificada por el text encoder, se puede usar para retocar, reestilizar o modificar escenas manteniendo la composicion original.
- Despliegue en GPUs de consumo: el build NF4 de 3,67 GB o el Q4_0 de 4,20 GB permiten ejecutar el modelo en tarjetas con 8 GB de VRAM, lo que facilita la experimentacion en estaciones de trabajo personales.
- Integracion en pipelines de ComfyUI: los builds FP8, INT8 ConvRot y NVFP4 estan pensados para los nodos nativos de ComfyUI 0.39.0, lo que permite incorporar el modelo a flujos de trabajo de generacion por lotes con cache KV activada.
- Investigacion sobre modelos sin censura: util para estudiar el comportamiento de modelos de difusion sin filtros de seguridad, comparando la fidelidad de los distintos formatos de cuantizacion frente al BF16.
- Servicios de generacion de imagenes autoalojados: con el build BF16 o Q8_0 se puede montar un endpoint de inferencia en Diffusers con maxima fidelidad, tomando el text encoder, procesador y VAE del repositorio base de Qwen.
- Prototipado de aplicaciones creativas: la variedad de formatos permite elegir el equilibrio entre tamano y calidad segun los requisitos de latencia y memoria del producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FID, CLIP score, MMLU ni HumanEval, ni comparaciones cuantitativas con otros modelos de difusion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer, segun build):
  - NF4 (bitsandbytes): aproximadamente 3,67 GB de pesos; con overhead de runtime, alrededor de 6-8 GB de VRAM.
  - Q4_0 GGUF: 4,20 GB de pesos.
  - NVFP4: 4,20 GB de pesos.
  - Q4_K_M GGUF: 4,47 GB de pesos.
  - Q5_K_M GGUF: 5,21 GB de pesos.
  - Q6_K GGUF: 6,00 GB de pesos.
  - FP8 E4M3, FP8 torchao, INT8 bitsandbytes: 7,12 GB de pesos.
  - INT8 ConvRot: 7,26 GB de pesos.
  - Q8_0 GGUF: 7,69 GB de pesos.
  - BF16 GGUF y BF16 safetensors: 14,23 GB de pesos.
- Hay que sumar la memoria del codificador de texto, el procesador y el VAE, que se toman del repositorio base Qwen/Qwen-Image-2.1 y no estan incluidos en este repo.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, los builds NF4 y Q4 caben en GPUs de consumo como RTX 3060 12 GB o RTX 4060 Ti 16 GB; los builds BF16 requieren GPUs de 24 GB o superiores (RTX 4090, A100, H100).
- Opciones de despliegue: ComfyUI 0.39.0 (commit b0b7435, frontend 1.53.6) con nodos nativos; Diffusers con `from_single_file` para GGUF o `from_pretrained` para carpetas BF16, torchao y bitsandbytes.
- Latencia y throughput: no disponibles. La model card recomienda 35 pasos de muestreo con sampler `er_sde` y scheduler `simple`, y cache KV activada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Momoking/Qwen-Image-2.1-Uncensored-Omni-Quantized | 7,1 mil millones | No disponible | qwen-research | GGUF, FP8, INT8, NVFP4, NF4, BF16 | Variante uncensored cuantizada de Qwen-Image-2.1 |
| Qwen/Qwen-Image-2.1 (base) | No disponible en la informacion | No disponible | qwen-research | No disponible en la informacion | Modelo base sin adaptador Omni ni cuantizaciones multiples |
| Otros modelos de difusion texto-a-imagen de ~7B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (por ejemplo, FLUX.1, SD3.5 o HunyuanImage) en terminos de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia es "qwen-research" (license: other), lo que probablemente restringe el uso comercial; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier despliegue en produccion.
- El modelo esta explicitamente marcado como "uncensored", lo que implica que puede generar contenido sensible o inapropiado; no dispone de filtros de seguridad integrados y requiere moderacion externa si se expone a usuarios finales.
- El repositorio contiene solo los pesos del transformer; es obligatorio descargar el text encoder, el procesador y el VAE del repositorio base Qwen/Qwen-Image-2.1, lo que anade complejidad y espacio en disco.
- Los dos layouts de pesos (297 y 265 tensores) no son intercambiables: un cargador incompatible puede fallar al cargar el modelo. El flujo BF16 en ComfyUI solo se ha verificado con el archivo safetensors de 297 tensores y el `UNETLoader` nativo de ComfyUI 0.39.0.
- La ausencia de benchmarks publicados impide evaluar la fidelidad de las distintas cuantizaciones frente al BF16; se recomienda validar la calidad en el caso de uso concreto.
- No se documentan sesgos conocidos, idiomas soportados ni limites de contexto; esta informacion no esta disponible.
- El checkpoint se etiqueta como "step90000" sin detallar el proceso de entrenamiento del adaptador LoRA, lo que dificulta reproducir o auditar el afinado.
- El modelo no es un LLM: no soporta tool calling, agentes ni razonamiento multi-paso; su uso esta limitado a generacion y edicion de imagenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Momoking/Qwen-Image-2.1-Uncensored-Omni-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Playground de ChatR Labs: https://chatrlabs.com/
- ComfyUI 0.39.0 (commit b0b7435): https://github.com/Comfy-Org/ComfyUI/tree/b0b743566f65daafc423b4fea8a2fbda94b3384a
- Archivo de workflow de ejemplo: https://huggingface.co/Momoking/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/workflow_example.json
- Sumas de verificacion SHA256: https://huggingface.co/Momoking/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/Momoking/Qwen-Image-2.1-Uncensored-Omni-Quantized/blob/main/LICENSE
