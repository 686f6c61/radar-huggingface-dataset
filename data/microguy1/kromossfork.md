# Microguy1/KromossFork

## Resumen

Kromoss es un ajuste fino completo (full fine-tune) del modelo de difusion texto-a-imagen MOSS-Image-Base, desarrollado por el usuario Microguy1 bajo el identificador `Microguy1/KromossFork`. Se trata de un modelo de generacion de imagenes a 1024 px que reutiliza integramente la arquitectura, el pipeline de inferencia, el codificador de texto (Qwen3.5-9B) y el VAE (decodificador pequeno de FLUX.2) de MOSS-Image-SFT, por lo que es un reemplazo directo (drop-in replacement) del modelo original.

El checkpoint publicado corresponde a la actualizacion 11000 del entrenamiento (pesos EMA) sobre 704 000 imagenes de entrenamiento. El repositorio incluye ademas dos LoRAs de destilacion turbo de 8 pasos (DMD y DMD2) que permiten reducir la inferencia de 50 pasos con CFG 3 a solo 8 pasos con CFG 1, sin rama negativa.

Con 5 082 308 624 parametros reales en el transformer y un peso total de repositorio de 64,7 GB, Kromoss es relevante para desarrolladores que ya trabajan con el ecosistema MOSS-Image y buscan un ajuste fino alternativo con soporte nativo en ComfyUI, cuantizacion int8 W8A8 (ConvRot) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) para texto-a-imagen, basado en MOSS-Image |
| Parametros totales | 5 082 308 624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; codificador de texto Qwen3.5-9B) |
| Tipos de cuantizacion | bf16, int8 W8A8 (ConvRot) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers y formato single-file para ComfyUI) |

## Arquitectura y entrenamiento

Kromoss emplea la misma arquitectura que MOSS-Image: un transformer de difusion con 168 capas lineales por bloque (`proj.{qkv,o,ffn_up_gate,ffn_down}`), un codificador de texto Qwen3.5-9B y un VAE basado en el decodificador pequeno de FLUX.2. El transformer y el codificador de texto operan en bfloat16, mientras que el VAE y el ruido inicial usan float32. El modelo genera imagenes a 1024 px con 50 pasos de inferencia y CFG 3 en su configuracion estandar, con `uncond_skip_layers=[22]`.

El entrenamiento consistio en un ajuste fino completo sobre 704 000 imagenes a 1024 px, partiendo de MOSS-Image-Base. El checkpoint publicado es la actualizacion 11000 con pesos EMA. Adicionalmente, el autor destila dos LoRAs de 8 pasos a partir de MOSS-Image-Base: una con DMD en espacio de datos (12 000 actualizaciones) y otra que continua ese entrenamiento 3 000 actualizaciones mas con la segunda etapa de DMD2 (discriminador GAN sobre el score falso entrenado contra imagenes reales, a un cuarto del learning rate). Ambas LoRAs son fp32, rango 128 / alpha 128, con claves kohya, y se aplican sin fusionar en los pesos bf16.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024 px de resolucion.
- Inferencia estandar de 50 pasos con CFG 3 o inferencia turbo de 8 pasos (e incluso 4) con las LoRAs DMD/DMD2 y CFG 1.
- Compatibilidad directa con el pipeline `MOSSImagePipeline` de diffusers (>= 0.38) y con ComfyUI nativo.
- Soporte de cuantizacion int8 W8A8 ConvRot con atencion int8 en ComfyUI.
- Conversion de carpetas `transformer/` de diffusers a formato single-file mediante `convert_to_comfy.py`.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking: es exclusivamente un modelo generativo de imagen.
- Idioma de prompts: ingles unicamente.

## Casos de uso

- Generacion de ilustraciones para articulos y blogs: el modelo produce imagenes de 1024 px en 8 pasos con las LoRAs turbo, lo que permite iterar rapidamente sobre prompts en ingles para portadas y figuras.
- Prototipado de conceptos visuales en diseno de producto: con 50 pasos y CFG 3 se obtienen resultados de mayor fidelidad al prompt para explorar variantes de un concepto antes de encargar arte final.
- Integracion en pipelines de ComfyUI: el formato single-file `kromoss_bf16.safetensors` sustituye directamente a `moss_image_sft_bf16.safetensors` en los flujos de Comfy-Org, lo que facilita migrar sin reescribir grafos.
- Despliegue con requisitos de VRAM ajustados: la variante `kromoss_int8_convrot.safetensors` (5,4 GB) permite ejecutar el modelo en GPUs con menos memoria manteniendo compatibilidad con las LoRAs.
- Generacion de assets para videojuegos o prototipos: la resolucion de 1024 px y la coherencia del codificador Qwen3.5-9B permiten crear sprites, fondos y material de concepto a partir de descripciones textuales detalladas.
- Investigacion sobre destilacion de modelos de difusion: el repositorio incluye los scripts y LoRAs DMD/DMD2, lo que sirve como referencia reproducible para estudiar reduccion de pasos de inferencia.
- Ajuste fino posterior: al ser un full fine-tune con licencia Apache 2.0 y scripts de conversion incluidos, sirve como base para nuevos fine-tunes manteniendo el mismo layout de repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona que la LoRA `8-steps-dmd2-lora` obtiene "the best PartiPrompts score" entre las dos LoRAs, pero no se proporcionan las cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio pesa 64,7 GB e incluye transformer, codificador de texto y VAE; la variante int8 del transformer ocupa 5,4 GB.
- El transformer y el codificador de texto se cargan en bfloat16; el VAE y el ruido inicial en float32.
- GPU recomendadas: no especificadas por el autor. Por el tamano del codificador de texto (Qwen3.5-9B) y del transformer, se requiere una GPU de gama alta; no se confirma que quepa en GPUs de consumo.
- Opciones de despliegue: diffusers (>= 0.38) con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`; ComfyUI nativo (master actual) con los loaders `Load Diffusion Model`, `Load CLIP` (tipo `moss_image`), `Load VAE` y `LoraLoaderModelOnly`.
- Latencia y throughput: no disponibles. Se documenta que la inferencia turbo reduce de 50 pasos a 8 pasos (o 4) con CFG 1, lo que implica una reduccion proporcional del coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kromoss (este) | 5 082 308 624 | 1024 px | Apache 2.0 | HuggingFace, diffusers, ComfyUI |
| MOSS-Image-SFT | mismo layout y arquitectura (parametros no disponibles) | 1024 px | no disponible en la informacion | HuggingFace, ComfyUI (Comfy-Org) |
| MOSS-Image-Base | modelo base del que deriva Kromoss (parametros no disponibles) | 1024 px | no disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Solo admite prompts en ingles; no se documenta soporte multilingue.
- Es un fine-tune de un modelo base, por lo que hereda los sesgos y limitaciones del dataset original de MOSS-Image, no detallados en la informacion disponible.
- Riesgo de alucinacion visual y de fidelidad limitada al prompt, inherente a los modelos de difusion; no se cuantifica.
- Las LoRAs turbo no deben fusionarse en los pesos bf16: el delta esta cerca del paso de redondeo de bf16 y se degradaria la calidad. Deben aplicarse sin fusionar o con un LoRA loader a fuerza 1.
- Las dos LoRAs deben usarse una a la vez, no combinadas.
- El repositorio tiene 33 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-10-26): es un modelo muy reciente y con poca validacion comunitaria.
- El autor del modelo es un usuario individual (`Microguy1`), no la organizacion OpenMOSS; conviene verificar la reproducibilidad antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base MOSS-Image-Base del que deriva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Microguy1/KromossFork
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Pesos en formato ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
