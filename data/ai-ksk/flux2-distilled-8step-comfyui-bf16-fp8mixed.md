# AI-KSK/flux2-distilled-8step-comfyui-bf16-fp8mixed

## Resumen

`AI-KSK/flux2-distilled-8step-comfyui-bf16-fp8mixed` es un paquete de conversión para ComfyUI del transformer de FLUX.2-dev destilado a 8 pasos, publicado por el usuario AI-KSK. No es un modelo entrenado desde cero ni un LoRA: se trata de un reempaquetado de los pesos del checkpoint `baseten/distilled_8step_FLUX.2-dev` (a su vez derivado de `black-forest-labs/FLUX.2-dev`) en dos formatos de precisión distintos (BF16 y FP8 mixto), con los nombres de tensor reorganizados al esquema que esperan las builds recientes de ComfyUI.

El modelo resuelve un problema práctico de despliegue: el checkpoint original está en formato Diffusers (`Flux2Pipeline`), lo que obliga a usar la librería Diffusers o a realizar una conversión manual para trabajar en ComfyUI. Este repositorio entrega directamente dos ficheros `safetensors` listos para colocar en `ComfyUI/models/diffusion_models/`, uno en BF16 (61 GB) y otro cuantizado en FP8 mixto (34 GB) para reducir el uso de VRAM.

La arquitectura subyacente es la del transformer de FLUX.2: 8 bloques double-stream y 48 bloques single-stream, con hidden size de 6144 y dimensión de contexto de 15360. Solo se incluye el transformer; el text encoder (Mistral 3 Small FLUX.2), el VAE y el scheduler deben obtenerse por separado. La licencia es "other" con restricciones no comerciales heredadas del linaje FLUX.2-dev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer FLUX.2 (8 double blocks + 48 single blocks, hidden size 6144, context dim 15360) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | BF16 y FP8 mixto (`torch.float8_e4m3fn`, 128 capas cuantizadas) |
| Idiomas soportados | no disponible (modelo de imagen; el idioma depende del text encoder Mistral 3 Small) |
| Licencia | other (no comercial, heredada de FLUX.2-dev) |
| Formato de pesos | safetensors (dos ficheros: BF16 61 GB, FP8 mixto 34 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación y edición de imágenes, derivado de FLUX.2-dev mediante destilación a 8 pasos de inferencia. La destilación la realizó Baseten sobre el modelo original de Black Forest Labs; este repositorio no ha entrenado nada, solo ha convertido los pesos del transformer Diffusers al esquema de nombres de ComfyUI. La validación local reporta 8 double blocks, 48 single blocks, hidden size 6144 y context dim 15360, con detección automática de la clase `Flux2` por parte de ComfyUI.

La conversión incluye el remapeo de las modulaciones globales (`double_stream_modulation_img`, `double_stream_modulation_txt`, `single_stream_modulation`), de los embedders de timestep y guidance (`time_in`, `guidance_in`) y el renombrado de los pesos de normalización Q/K de `.weight` a `.scale`. El fichero FP8 mixto se generó cuantizando las capas presentes en un checkpoint de referencia FP8 mixto de ComfyUI, preservando la metadata `_quantization_metadata` y el layout de tensores de escala de entrada. No se han publicado detalles sobre el dataset de destilación, número de tokens o proceso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), usando el text encoder FLUX.2 compatible por separado.
- Edición de imágenes image-to-image, que es el pipeline declarado (`image-to-image`).
- Inferencia en 8 pasos gracias a la destilación, lo que reduce el coste computacional frente al modelo base no destilado.
- Compatibilidad con ComfyUI mediante el loader de diffusion models / UNet para FLUX.2.
- Dos niveles de precisión (BF16 y FP8 mixto) para adaptarse a distintos presupuestos de VRAM.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo; es exclusivamente un modelo de imagen.

## Casos de uso

- Edición de imágenes por lotes en local: con el fichero FP8 mixto (34 GB) se puede montar un pipeline de edición image-to-image en una estación de trabajo con suficiente VRAM, aplicando cambios controlados sobre un conjunto de imágenes de entrada.
- Iteración rápida de prototipos creativos: los 8 pasos de inferencia del modelo destilado permiten ciclos de generación más cortos que un FLUX.2-dev completo, adecuado para explorar variaciones de estilo o composición en ComfyUI.
- Integración en flujos ComfyUI existentes: al usar el esquema de nombres nativo de FLUX.2, se puede conectar con nodos de upscaling, controlnet o postprocesado ya presentes en el grafo.
- Repintado y retoque de imágenes de producto: el pipeline image-to-image permite modificar fondos o detalles manteniendo la estructura de la imagen original, útil en catálogos de e-commerce.
- Generación de material gráfico para previsualización: borradores de ilustración, moodboards o concept art que luego se refinan con otras herramientas.
- Investigación sobre cuantización FP8 en difusión: al ofrecer el mismo transformer en BF16 y FP8 mixto, permite comparar calidad y consumo de VRAM entre ambas precisiones en un mismo setup.
- Despliegue en entornos con VRAM limitada: el fichero FP8 mixto está pensado explícitamente para "menor uso de VRAM y iteración local más rápida", según la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero BF16 pesa 61 GB, por lo que requiere al menos ~64 GB de VRAM para cargarse completo; el FP8 mixto pesa 34 GB y requiere al menos ~36-40 GB de VRAM, más el overhead del text encoder y el VAE.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o H200; para FP8 mixto, A100 80 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- GPU de consumo: el FP8 mixto (34 GB) no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin offloading a RAM del sistema o sin cuantizaciones adicionales no incluidas en este repositorio.
- Opciones de despliegue: ComfyUI (librería declarada), colocando el fichero en `ComfyUI/models/diffusion_models/` y usando el loader de diffusion model / UNet para FLUX.2. Requiere además `mistral_3_small_flux2_fp8.safetensors` en `models/text_encoders/` y `flux2-vae.safetensors` en `models/vae/`.
- Latencia y throughput: no disponibles. La model card solo indica que se parta de 8 pasos de inferencia y se ajuste el scheduler, guidance, resolución y VRAM según el workflow.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/flux2-distilled-8step-comfyui-bf16-fp8mixed | Conversión ComfyUI de FLUX.2 destilado | 8 | safetensors BF16 / FP8 mixto | other (no comercial) | Hugging Face |
| baseten/distilled_8step_FLUX.2-dev | Checkpoint original destilado | 8 | Diffusers safetensors | other (no comercial) | Hugging Face |
| black-forest-labs/FLUX.2-dev | Modelo base FLUX.2-dev | no disponible (no destilado) | Diffusers safetensors | other (no comercial) | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" heredada de FLUX.2-dev: uso no comercial salvo que se obtengan los derechos correspondientes de los licenciantes originales. Los usuarios son responsables de cumplir también las licencias del text encoder, tokenizer, scheduler y VAE utilizados.
- El repositorio no incluye text encoder, tokenizer, scheduler ni VAE; sin esos componentes adicionales el modelo no es funcional.
- El fichero FP8 mixto introduce los compromisos numéricos habituales de la cuantización FP8, con posible degradación de calidad frente al BF16.
- No se han publicado benchmarks ni evaluaciones cuantitativas de calidad en la información disponible.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base FLUX.2-dev; no se documentan mitigaciones específicas.
- El tamaño del repo (99,9 GB) y de los ficheros (61 GB y 34 GB) dificultan el despliegue en hardware de consumo.
- La model card incluye un enlace de afiliado a una plataforma de API (88API) que no forma parte del modelo y no debe interpretarse como recomendación técnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AI-KSK/flux2-distilled-8step-comfyui-bf16-fp8mixed
- Modelo base destilado: https://huggingface.co/baseten/distilled_8step_FLUX.2-dev
- Modelo original de la familia: https://huggingface.co/black-forest-labs/FLUX.2-dev
