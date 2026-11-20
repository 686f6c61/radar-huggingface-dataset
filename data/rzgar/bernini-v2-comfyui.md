# rzgar/Bernini-v2-ComfyUI

## Resumen

Bernini-v2-ComfyUI es un paquete de pesos en formato de archivo único (diffusion-single-file) para ComfyUI del modelo Bernini v2, desarrollado por el usuario rzgar a partir del modelo base ByteDance/Bernini-Diffusers-v2 de ByteDance. No se trata de un modelo de lenguaje, sino de un sistema de difusión para generación y edición de vídeo que acepta texto, imágenes y vídeo como entradas (t2v, i2v, v2v, r2v, rv2v, ads2v). Su relevancia radica en que empaqueta el pipeline completo en cuantizaciones listas para consumir en ComfyUI, incluyendo el planificador semántico y los dos DiT de renderizado, además de un nodo personalizado propio.

La arquitectura es un pipeline de dos etapas: primero un planificador semántico basado en un Qwen2.5-VL ajustado (denominado `mllm`) con un conector y un `vit_decoder` de estilo MaskGIT que transforma texto y tokens visuales de origen en contextos de difusión; después, el renderizado con dos DiT Wan2.2 coentrenados (alta y baja contaminación) condicionados por los latentes del VAE de la fuente. El decodificado final usa el VAE de Wan2.1.

El repositorio ocupa 256,2 GB e incluye variantes FP8 escaladas, Int8-ConvRot y NVFP4, además de los archivos del planificador y un nodo personalizado para ComfyUI. La licencia es Apache 2.0 y el modelo acumula 1544 descargas y 9 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion en dos etapas: planificador MLLM (Qwen2.5-VL ajustado + conector + vit_decoder MaskGIT) y renderizador con dos DiT Wan2.2 (high-noise / low-noise) sobre VAE Wan2.1 |
| Parametros totales | no disponible (el planificador se describe como "7B planner"; no se detalla el total del pipeline) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 escalada, Int8-ConvRot, NVFP4; planificador en FP8 escalada, vit_decoder en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos unicos para ComfyUI) |

## Arquitectura y entrenamiento

El pipeline consta de dos fases. La primera es la planificacion semantica: un Qwen2.5-VL ajustado (`mllm`), junto con un conector y un `vit_decoder` con bucle de estilo MaskGIT, convierte el texto y los tokens visuales de la fuente en `diff_mllm_contexts`, que es la aportacion diferencial frente a Bernini-R. La segunda es el renderizado: dos DiT Wan2.2 coentrenados, uno de alta contaminacion y otro de baja, con conmutacion en el paso 0,875 y escalado de los valores `omega_*` por `omega_scale` 0,75 tras el cambio; ambos se condicionan con los latentes codificados por el VAE de la fuente como `context_latents`, y cada flujo recibe su propio rotatorio `source_id`. El decodificado final emplea el VAE de Wan2.1.

El texto se codifica con UMT5-XXL (T5) en FP8 escalado. El sistema de guiado sigue la tabla por tarea del proyecto original: `t2v_apg` para texto a vídeo, `v2v_apg` para vídeo a vídeo y la cadena `rv2v` de cinco pasadas (vacío / V / VI / VTI / VTIC) para r2v y rv2v, con `omega_vid`, `omega_img`, `omega_txt` y `omega_tgt`. Existen modos alternativos `rv2v_wapg`, `vae_txt_vit` y `vae_txt_vit_wapg` (la cadena de tres brazos de Bernini-v1 y -R). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (t2v).
- Generacion de video a partir de imagen (i2v).
- Edicion de video a video (v2v), con los latentes de la fuente como contexto.
- Referencia a video (r2v) y referencia a video con variaciones (rv2v).
- Edicion de video con referencias publicitarias (ads2v).
- Generacion de imagen a imagen (image-to-image).
- Planificacion semantica opcional mediante MLLM multimodal (`use_planner`), que procesa texto y tokens visuales de la fuente.
- Ejecucion sin planificador (`use_planner` desactivado), renderizando solo desde T5 y los latentes de la fuente, sin cargar el planificador de 7B.
- Control de semilla unico que gobierna tanto el orden de mascaras del planificador como el ruido del renderizado.
- Compatibilidad con LoRA destilados LightX2V de 4 pasos y con `cfg <= 1.0` para guiado libre en una sola pasada por paso.
- Soporte de `vit_frame_stride` (por defecto 8) para adaptar la frecuencia de muestreo del planificador.

## Casos de uso

- Edicion de video de referencia en postproduccion: el modo r2v/rv2v permite introducir una imagen o un clip de referencia y generar variaciones manteniendo la identidad visual, gracias a la cadena de guiado con `omega_vid`, `omega_img`, `omega_txt` y `omega_tgt`.
- Restauracion o reestilizado de metraje existente: el modo v2v condiciona el renderizado con los latentes de la fuente, de modo que la estructura del clip original se preserva mientras cambia el estilo o el contenido.
- Generacion de video para prototipado creativo: el modo t2v con 16, 23 o 50 pasos permite iterar sobre guiones y storyboards sin material de origen.
- Animacion de imagenes fijas: el modo i2v convierte una imagen en un clip, util para ilustracion, marketing y contenido para redes.
- Generacion de anuncios y piezas publicitarias: el modo ads2v esta disenado especificamente para producir variantes de video a partir de referencias de producto o campana.
- Integracion en flujos de trabajo de ComfyUI: el nodo personalizado incluido y los archivos en `models/text_encoders/` permiten montar el pipeline completo en un grafo de ComfyUI sin scripts externos.
- Iteracion rapida con LoRA destilados: con el LoRA LightX2V de 4 pasos y `cfg <= 1.0`, se puede generar en pocos pasos para previsualizacion, reservando las configuraciones de 16 a 50 pasos para la salida final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio completo ocupa 256,2 GB, pero las variantes cuantizadas (FP8 escalada, Int8-ConvRot, NVFP4) reducen la huella del renderizador; el planificador se describe como un modelo de 7B en FP8 escalada.
- GPU recomendadas: no disponibles en la informacion proporcionada. La presencia de variantes NVFP4 sugiere orientacion a GPUs con soporte de FP4 de ultima generacion.
- Cabe en GPU de consumo: no disponible. La existencia de cuantizaciones Int8-ConvRot y NVFP4 apunta a que el autor busca reducir requisitos, pero no se confirman modelos concretos.
- Opciones de despliegue: ComfyUI mediante el nodo personalizado `ComfyUI-BerniniV2` (ZIP en `ComfyUI/custom_nodes`); los pesos son archivos unicos en safetensors para el cargador de difusion de ComfyUI.
- Latencia y throughput: no disponibles. Se conocen los pasos recomendados (16, 23 o 50; 4 con el LoRA LightX2V) y el sampler (`unipc`, `dpmpp_2m` o `euler`) con `flow_shift` 5.0, pero no se publican tiempos por clip.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bernini-v2-ComfyUI (rzgar) | Difusion video, pipeline de dos etapas | no disponible (planificador 7B) | no disponible | Apache 2.0 | Hugging Face, ComfyUI |
| Bernini-R (referenciado en la model card) | Difusion video, sin planificador MLLM | no disponible | no disponible | no disponible | no disponible |
| Bernini-v1 (referenciado en la model card) | Difusion video, cadena de guiado de tres brazos | no disponible | no disponible | no disponible | no disponible |
| Wan2.2 (componente base) | DiT de difusion video | no disponible | no disponible | no disponible | no disponible |

La model card unicamente compara implicitamente con Bernini-R y Bernini-v1, senalando que Bernini v2 anade el planificador semantico (`diff_mllm_contexts`) y la cadena de guiado `rv2v` de cinco pasadas. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado; al tratarse de un modelo generativo de video, puede producir contenido visual incoherente o no fiel a la referencia.
- Limitaciones de contexto o idioma: los idiomas soportados no estan declarados; el codificador de texto es UMT5-XXL, pero no se especifica cobertura linguistica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de ByteDance/Bernini-Diffusers-v2 y de componentes Wan2.2 y Wan2.1; conviene verificar las condiciones de esos modelos base antes de un despliegue comercial.
- En v2v, la longitud del renderizado se recorta a la del clip de origen (`1 + (latent_t - 1) * 4`) cuando este es mas corto; mas alla del final del origen, el flujo en contexto ha terminado.
- El planificador de 7B solo se carga si `use_planner` esta activo; con el desactivado se pierde la planificacion semantica y el resultado se aproxima al comportamiento de Bernini-R.
- El valor `vit_frame_stride` = 8 asume una fuente de 16 fps alimentada a 2 fps al planificador; fuentes con otra tasa requieren ajuste manual.
- El repositorio es un empaquetado de un tercero (rzgar) sobre un modelo de ByteDance, no una publicacion oficial del autor original.
- No se han publicado benchmarks, por lo que no es posible validar la calidad frente a alternativas con datos objetivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rzgar/Bernini-v2-ComfyUI
- Modelo base: https://huggingface.co/ByteDance/Bernini-Diffusers-v2
- LoRA LightX2V de 4 pasos: https://huggingface.co/rzgar/Bernini-R-LightX2V-4step-loras
- Nodo personalizado ComfyUI (ZIP): https://huggingface.co/rzgar/Bernini-v2-ComfyUI/resolve/main/ComfyUI-BerniniV2/ComfyUI-BerniniV2.zip
- Pesos FP8 escalados: https://huggingface.co/rzgar/Bernini-v2-ComfyUI/tree/main/Bernini_v2_FP8_scaled
- Codificador de texto UMT5-XXL (Comfy-Org): https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/tree/main/split_files/text_encoders
- VAE Wan2.1: https://huggingface.co/rzgar/Qwen-Image-WAN2.2-VAE-Collection/blob/main/Vanilla/Wan2_1_VAE_fp32.safetensors
