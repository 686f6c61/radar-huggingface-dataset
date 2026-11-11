# BennyDaBall/Z-Image-Engineer-V6-GGUF

## Resumen

Z-Image-Engineer V6 GGUF es la distribucion cuantizada en formato GGUF de Z-Image-Engineer V6, un ajuste fino DoRA del text encoder Qwen de 4B que forma parte del pipeline de generacion de imagenes Tongyi-MAI/Z-Image-Turbo. Lo desarrolla BennyDaBall, un autor independiente de la comunidad, y su funcion concreta no es generar imagenes ni texto general, sino reescribir y enriquecer prompts para el modelo de difusion Z-Image Turbo. Se trata, por tanto, de un modelo auxiliar de prompt engineering especializado.

El modelo parte de un transformer Qwen de aproximadamente 4.022 millones de parametros (4B) y conserva la arquitectura del text encoder original, pero ha sido entrenado con DoRA para producir reescrituras de prompt con un estilo y una estructura de condicionamiento concretos. La distribucion GGUF incluye una escalera de cuantizaciones que va desde F16 (7,498 GiB) hasta Q3_K_M (1,933 GiB), ademas de variantes MXFP4 y NVFP4, pensadas para ejecutarse en LM Studio, ComfyUI mediante CLIPLoaderGGUF o el nodo propio ComfyUI-Z-Engineer, y en cargadores estilo llama.cpp.

Su relevancia actual radica en que permite sustituir el text encoder de Z-Image Turbo por una version afinada que mejora la calidad de los prompts sin necesidad de un servidor externo, todo dentro de ComfyUI o LM Studio, con licencia Apache 2.0 y un consumo de VRAM contenido (entre 2 y 4 GiB segun cuantizacion). Es una pieza practica para flujos de generacion de imagen locales que quieren automatizar la mejora de prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen (text encoder de Z-Image Turbo), ajuste fino DoRA |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, MXFP4, NVFP4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal con safetensors HF fusionados) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino DoRA (variante de LoRA con descomposicion de magnitud y direccion) sobre el text encoder Qwen de 4B incluido en Tongyi-MAI/Z-Image-Turbo. No se trata de un transformer entrenado desde cero: se conserva la arquitectura del encoder original y se adapta su comportamiento para generar reescrituras de prompt orientadas al modelo de difusion Z-Image Turbo. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos figuran como no disponibles.

La innovacion tecnica destacable esta en la distribucion de cuantizaciones. La variante NVFP4 no es un volcado directo: aplica NVFP4 a 216 de 252 tensores de bloque, manteniendo en Q6_K los mas sensibles (attn_v y ffn_down en 18 capas, ademas de los embeddings), con escalas de dos niveles y flags de activacion de 8 bits por tensor. Segun el autor, el KLD medio frente a F16 es de 0,040 (frente a 0,046 de Q4_K_M y 0,307 de MXFP4), y el error de condicionamiento como text encoder de ComfyUI baja de 0,110 a 0,060 tras la actualizacion de pesos del 11 de noviembre de 2026.

## Capacidades

- Reescritura y enriquecimiento de prompts para Z-Image Turbo, con un estilo y una estructura de condicionamiento V6 concretos.
- Generacion de texto conversacional en ingles, heredada del text encoder Qwen subyacente.
- Uso como text encoder sustituto en ComfyUI mediante CLIPLoaderGGUF (tipo de modelo `lumina2`) o el nodo Z-Engineer CLIP Loader (GGUF).
- Mejora de prompts en proceso dentro de ComfyUI con el nodo Z-Engineer Prompt Enhancer (Local), sin servidor externo.
- Integracion en LM Studio para mejora de prompts por chat directo.
- Soporte de la escalera completa de cuantizaciones GGUF para distintos presupuestos de VRAM.
- Variante NVFP4 optimizada para GPUs RTX 50 / Blackwell con llama.cpp y LM Studio.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Generacion de imagenes en ComfyUI con mejora de prompt integrada: se coloca un GGUF en `ComfyUI/models/text_encoders/`, se usa como text encoder de Z-Image Turbo y se anade el nodo enhancer para reescribir el prompt semilla antes de la difusion, todo en el mismo grafo.
- Automatizacion de prompts en produccion de imagen: el modelo reescribe peticiones cortas ("a unicorn") en prompts detallados y estructurados, lo que reduce la variabilidad de resultados en lotes grandes.
- Prototipado rapido en LM Studio: cargar un quant y pedir directamente "Enhance this image prompt for Z-Image Turbo: ..." permite iterar sobre estilos de prompt sin montar infraestructura.
- Sustitucion del text encoder estandar: usar CLIPLoaderGGUF con tipo `lumina2` para reemplazar el encoder Qwen original de Z-Image Turbo conservando el resto del pipeline (UNET `z_image_turbo_bf16`, VAE `ae`, 8 pasos, CFG 1.0, sampler res_multistep).
- Despliegue en hardware modesto: la variante Q3_K_M (1,933 GiB) o Q4_K_M (2,331 GiB) permite ejecutar el encoder en GPUs de consumo con poca VRAM adicional.
- Aceleracion en Blackwell: la variante NVFP4 alcanza unos 290 tok/s en LM Studio/llama.cpp frente a unos 190 tok/s de Q8_0 en una RTX 5090, adecuada para pipelines de reescritura de prompts de alto volumen.
- Estandarizacion de estilo de prompt en equipos: distribuir un mismo quant y un system prompt opcional (`V6_SYSTEM_PROMPT.md`) para que todos los miembros generen prompts con la misma estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas internas de cuantizacion y velocidad:

| Metrica | NVFP4 | Q4_K_M | Q8_0 | MXFP4 | F16 |
|---|---|---|---|---|---|
| KLD medio vs F16 | 0,040 | 0,046 | no disponible | 0,307 | referencia |
| Error de condicionamiento (ComfyUI) | 0,060 | 0,092 | no disponible | no disponible | referencia |
| Velocidad en LM Studio/llama.cpp (RTX 5090) | ~290 tok/s | no disponible | ~190 tok/s | no disponible | no disponible |
| Velocidad en ComfyUI in-graph enhancer (RTX 5090) | ~5 tok/s | no disponible | ~14 tok/s | no disponible | no disponible |

Mediciones realizadas por el autor en llama.cpp b12110.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 2 GiB (Q3_K_M, 1,933 GiB de fichero) y 7,5 GiB (F16), pasando por 2,331 GiB en Q4_K_M y 3,986 GiB en Q8_0.
- GPU recomendadas: cualquier GPU con al menos 4-8 GiB de VRAM para cuantizaciones bajas; RTX 5090 (Blackwell) para aprovechar NVFP4 a maxima velocidad.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060/4060/4090 con cuantizaciones Q4_K_M o Q3_K_M; NVFP4 requiere RTX 50 / Blackwell para su maximo rendimiento.
- Opciones de despliegue: LM Studio, llama.cpp, ComfyUI con ComfyUI-GGUF (CLIPLoaderGGUF) o ComfyUI-Z-Engineer v2.3.3+, y cargadores estilo llama.cpp.
- Requisitos de software: LM Studio con runtime CUDA 12 de llama.cpp 2.56 o superior para NVFP4; ComfyUI con paquete `gguf` 0.19.0 o superior para NVFP4.
- Latencia y throughput: ~290 tok/s (NVFP4) y ~190 tok/s (Q8_0) en LM Studio/llama.cpp sobre RTX 5090; en el enhancer dentro de ComfyUI, ~5 tok/s (NVFP4) y ~14 tok/s (Q8_0), por la expansion de pesos en cada token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Z-Image-Engineer V6 GGUF | 4B | no disponible | GGUF | Apache 2.0 | Mejora de prompts para Z-Image Turbo |
| Tongyi-MAI/Z-Image-Turbo (text encoder original) | ~4B | no disponible | safetensors | no disponible en la informacion | Text encoder base sin ajuste de prompt |
| Qwen3 4B (base) | 4B | no disponible | safetensors, GGUF | no disponible en la informacion | Modelo de texto general |
| MXFP4 de este mismo modelo | 4B | no disponible | GGUF | Apache 2.0 | Variante de cuantizacion alternativa (KLD 0,307) |

La comparacion con modelos de prompt engineering dedicados no esta disponible en la informacion proporcionada; el modelo mas directamente comparable es el text encoder original de Z-Image Turbo, del que este es un ajuste fino.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta capacidad multilingue.
- Es un modelo auxiliar especializado en reescritura de prompts para Z-Image Turbo; su uso como modelo de texto general no esta validado.
- No se documentan datos de sesgos, alucinacion ni evaluaciones de seguridad.
- La longitud de contexto no esta especificada, lo que limita la planificacion de prompts largos.
- La variante NVFP4 requiere software reciente (llama.cpp 2.56+, `gguf` 0.19.0+, ComfyUI-Z-Engineer 2.3.3+) y una GPU Blackwell para rendimiento optimo; en ComfyUI es mas lenta que Q8_0 en el enhancer integrado.
- Las metricas de calidad y velocidad son mediciones del autor en su propio hardware, no evaluaciones independientes.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Tongyi-MAI/Z-Image-Turbo y de los pesos Qwen subyacentes antes de produccion.
- El repo ocupa 30,4 GB por incluir toda la escalera de cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/BennyDaBall/Z-Image-Engineer-V6-GGUF
- Repo principal con safetensors fusionados: https://huggingface.co/BennyDaBall/Z-Image-Engineer-V6
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Nodo ComfyUI-Z-Engineer: https://github.com/BennyDaBall930/ComfyUI-Z-Engineer
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
