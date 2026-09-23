# Abiray/Qwen-Image-2.1-viggle-4-steps-turbo-GGUF

## Resumen

Qwen-Image-2.1-viggle-4-steps-turbo-GGUF es un conjunto de cuantizaciones GGUF de la comunidad sobre el modelo Viggle/Qwen-Image-2.1-viggle-turbo, un estudiante destilado a 4 pasos del modelo oficial Qwen-Image-2.1 desarrollado por el equipo Qwen (Alibaba) y destilado por Viggle mediante Distribution Matching Distillation (DMD). El componente de generación visual es un Diffusion Transformer (DiT) de flujo con 32 capas single-stream y 7.115 millones de parámetros, acompañado de un codificador de texto Qwen3-VL-8B y un autoencoder VAE de cuatro canales (RGBA).

El problema que resuelve es la latencia de los modelos de difusión de alta calidad: frente a los 40 pasos del profesor original, esta variante genera imagen a partir de texto y edición guiada por instrucciones en solo 4 pasadas del transformer, sin classifier-free guidance (CFG fijo a 1.0). Al estar empaquetado en GGUF, permite ejecutar la generación de imágenes a 1024×1024 nativamente dentro de ComfyUI en GPUs de consumo, algo inviable con los pesos completos en BF16.

Es relevante ahora porque la cuantización comunitaria llega prácticamente en paralelo al lanzamiento de Qwen-Image-2.1 (2026-09-20) y al soporte en el núcleo de ComfyUI, lo que reduce la barrera de VRAM desde más de 16 GB hasta 6-8 GB con el quant Q3_K_M. El repositorio, con 13 likes y 0 descargas en el momento de la consulta, es un artefacto reciente orientado a prototipado rápido y generación por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo, 32 capas single-stream, destilado con DMD; texto a imagen y edicion de imagen |
| Parametros totales | 7.115.124.736 (~7,12 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL-8B, no se documentan idiomas en la ficha) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF |

Otros datos: tamano del repositorio 29,9 GB; pipeline text-to-image; modelo base Viggle/Qwen-Image-2.1-viggle-turbo; creado el 2026-09-23.

## Arquitectura y entrenamiento

El modelo base es un modelo unificado de generacion de imagen y edicion que emplea un transformer de difusion de flujo (flow matching) con 32 capas en configuracion single-stream, con unos 7B de parametros en el componente de generacion visual, un codificador de texto Qwen3-VL-8B y un VAE de cuatro canales (RGBA). La variante viggle-turbo es un estudiante destilado a 4 pasos obtenido mediante Distribution Matching Distillation (DMD) a partir del profesor de 40 pasos (Qwen-Image-2.1), lo que reduce el numero de pasadas del transformer de 40 a 4 sin clasificador libre de guia (se entrena sin CFG, de ahi que la escala de guia deba fijarse a 1.0).

Las cuantizaciones de este repositorio se convirtieron directamente desde los pesos oficiales del transformer (transformer/diffusion_pytorch_model.safetensors). Todas las variantes preservan en FP32 las capas de normalizacion de atencion (norm_k, norm_q, text_norm) y mantienen en BF16 nativo el embedding de entrada de parches (img_in.weight). Los niveles con sufijo `_M` conservan precision de 6 bits (Q6_K) en las proyecciones de valor de atencion (attn.to_v.weight) y BF16 nativo en las capas de condicionamiento de texto (txt_in). No se documentan en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a resolucion de 1024×1024 en regimen de borrador rapido.
- Edicion de imagen guiada por instrucciones en lenguaje natural, con soporte de 1 a 3 imagenes de referencia.
- Generacion en 4 u 8 pasos del transformer, sin necesidad de apilar LoRAs externas de turbo.
- Ejecucion nativa en ComfyUI mediante el nodo UnetLoaderGGUF y el nodo TextEncodeQwenImage21.
- Compatibilidad con el ecosistema GGUF (requiere gguf>=0.13.0 y ComfyUI-GGUF actualizado).
- No se documenta soporte de tool calling, function calling ni comportamiento de agente, al tratarse de un modelo generativo de imagen y no de un LLM conversacional.

## Casos de uso

- Borrador rapido de imagenes en produccion: con 4 pasos y CFG 1.0 se pueden generar propuestas a 1024×1024 en segundos, utiles para iterar sobre composiciones antes de renderizar con el modelo completo de 40 pasos.
- Edicion fotografica por instrucciones: cargando una imagen de referencia en la entrada image_1 del nodo TextEncodeQwenImage21 se aplican cambios descritos en lenguaje natural (por ejemplo, cambiar el fondo manteniendo rostro y pose) sin mascaras manuales.
- Prototipado en ComfyUI sobre GPU de consumo: el quant Q4_K_M (4,19 GB) permite trabajar en tarjetas de 8-12 GB como RTX 3060 o RTX 4060, lo que hace viable el diseno de flujos sin acceso a GPUs de datacenter.
- Generacion por lotes de variantes de diseno: al reducir el coste por imagen a 4 pasadas del transformer, resulta adecuado para producir muchos candidatos de un mismo prompt en pipelines automatizados de marketing o catalogos.
- Composicion con multiples referencias: la edicion con 1-3 imagenes de referencia permite tareas de collage, transferencia de estilo o sustitucion de elementos combinando varias fuentes en una sola pasada.
- Previsualizacion en entornos con VRAM limitada: con Q3_K_M (3,19 GB) se puede desplegar en GPUs de 6-8 GB para demostraciones o herramientas internas donde prima la disponibilidad sobre la fidelidad maxima.
- Redaccion de conceptos artisticos: la generacion rapida en 4 pasos sirve como herramienta de exploracion conceptual para ilustradores que necesitan muchas variaciones de un mismo concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo de difusion segun quant (valores de la ficha del autor):
  - Q8_0: 7,59 GB de archivo, recomendado 16 GB o mas de VRAM (8 bits casi sin perdida).
  - Q6_K: 5,88 GB, recomendado 12-16 GB de VRAM.
  - Q5_K_M: 5,01 GB, recomendado 10-12 GB de VRAM.
  - Q4_K_M: 4,19 GB, recomendado 8-12 GB de VRAM (opcion recomendada para la mayoria de GPUs).
  - Q4_K_S: 4,06 GB, recomendado 8 GB de VRAM.
  - Q3_K_M: 3,19 GB, recomendado 6-8 GB de VRAM.
- A esa VRAM hay que sumar la del codificador de texto Qwen3-VL-8B (variantes qwen3vl_8b_int8_convrot, fp8_scaled o w4a8) y la del VAE (qwen_image_2.1_vae_bf16.safetensors).
- GPU recomendadas por tier: Q4_K_M para RTX 3060, RTX 4060 y Tesla T4; Q5_K_M y superiores para GPUs de 10-16 GB o mas; Q8_0 para equipos con 16 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en el rango Q3_K_M a Q4_K_M para tarjetas de 6-12 GB, siempre considerando el coste adicional del codificador de texto y el VAE.
- Opciones de despliegue: ComfyUI con el nodo UnetLoaderGGUF y ComfyUI-GGUF (repositorio city96/ComfyUI-GGUF), con gguf>=0.13.0. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Como referencia estructural, el modelo reducen las pasadas del transformer de 40 a 4-8, es decir, en torno a un orden de magnitud menos de computo por imagen respecto al profesor.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Abiray/Qwen-Image-2.1-viggle-4-steps-turbo-GGUF (este) | ~7,12 mil millones | 4-8 | GGUF (Q3-Q8) | qwen-research | Cuantizacion comunitaria; pensada para ComfyUI; menor VRAM |
| Viggle/Qwen-Image-2.1-viggle-turbo | ~7 mil millones | 4 | safetensors (BF16) | qwen-research | Estudiante destilado original del que derivan las cuantizaciones; mayor peso en disco |
| Qwen/Qwen-Image-2.1 (profesor) | ~7 mil millones en el componente visual | 40 | safetensors | qwen-research | Mayor fidelidad, especialmente en tipografia y ediciones complejas; mas lento |
| Qwen-Image-2.1-viggle-turbo-4step-lora-r64 (Viggle) | adaptador LoRA | 4 | safetensors (LoRA) | no disponible | Alternativa de bajo coste que requiere apilar el adaptador sobre el modelo base |

No se dispone de datos de rendimiento numericos para establecer comparaciones cuantitativas entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Parametros de inferencia obligatorios: si se usan ajustes de difusion estandar (por ejemplo, 25-40 pasos o CFG distinto de 1.0) la calidad se degrada o aparecen artefactos de quemado visual. Hay que fijar steps a 4 u 8, CFG a 1.0, sampler euler, scheduler simple y denoise 1.0, y dejar el prompt negativo vacio.
- Es una vista previa: el checkpoint deriva de la version v0.1 preview de Viggle; esta optimizado para generacion rapida y borrador, no para maxima fidelidad.
- Ediciones complejas: las composiciones con multiples referencias y el renderizado de texto fino pueden presentar mas varianza que el modelo profesor de 40 pasos. Para maxima fidelidad tipografica se recomienda usar los modelos Qwen-Image-2.1 no destilados.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Alucinacion visual: no se documenta una evaluacion especifica; como modelo generativo de imagen, puede producir detalles incoherentes respecto al prompt, especialmente en la variante destilada.
- Idiomas: no se especifican los idiomas soportados en la ficha del modelo.
- Licencia: la licencia es qwen-research (license: other), orientada a investigacion. Antes de un uso comercial es imprescindible revisar los terminos exactos en el enlace de licencia indicado por el autor.
- Dependencia de componentes externos: el funcionamiento requiere descargar por separado el codificador de texto y el VAE desde Comfy-Org, ademas de versiones recientes de ComfyUI y ComfyUI-GGUF para reconocer la arquitectura qwen_image.
- Errores conocidos: si aparece el mensaje "Unknown model architecture", hay que actualizar ComfyUI y ComfyUI-GGUF con git pull y reinstalar un gguf lo suficientemente reciente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/Qwen-Image-2.1-viggle-4-steps-turbo-GGUF
- Modelo base: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Licencia (enlace del autor): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/blob/main/LICENSE
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI (nucleo): https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Codificadores de texto Comfy-Org Qwen-Image-2.1: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main/text_encoders
- VAE Comfy-Org Qwen-Image-2.1: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/resolve/main/vae/qwen_image_2.1_vae_bf16.safetensors
- ModelScope de la version turbo v0.1 preview: https://www.modelscope.cn/models/Viggle/Qwen-Image-2.1-viggle-turbo
- LoRAs de Qwen 2.1 Turbo (Civitai): https://civitai.com/models/2958738/qwen-21-turbo-loras
- Receta de Qwen-Image-2.1 en RTX 5080 (Smeltcore): https://smeltcore.com/recipes/qwen-image-2-1-on-rtx-5080-the-int8-comfyui-template-and-the-edit-timings-from-a-comfyui-pr/
