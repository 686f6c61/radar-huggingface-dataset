# loom-fun/Tongyi-MAI-Z-Image-Turbo-loom

## Resumen

Tongyi-MAI-Z-Image-Turbo-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el modelo de generacion de imagenes Tongyi-MAI/Z-Image-Turbo, publicado por el usuario loom-fun. No se trata de un modelo entrenado desde cero, sino de un port del checkpoint original de Alibaba Tongyi-MAI para que pueda ejecutarse sobre GPUs AMD mediante el runtime hrx-loom, en concreto sobre el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). El paquete integra el codificador de texto Qwen3, un transformer de difusion single-stream destilado de ocho pasos y un decodificador VAE, y los expone como un endpoint compatible con la API de OpenAI `/v1/images/generations` a traves de `loom-serve`.

La relevancia de este artefacto es de infraestructura mas que de modelado: permite servir un modelo text-to-image de forma nativa en hardware AMD consumer y de gama alta integrada, un terreno tradicionalmente dominado por CUDA. El autor reporta que la implementacion en Loom queda mas cerca de la referencia en fp32 que la propia implementacion de diffusers en bf16, con una diferencia de PickScore frente a diffusers bf16 estadisticamente no significativa.

La licencia del paquete es Apache 2.0 y el modelo base es Tongyi-MAI/Z-Image-Turbo. No se dispone de informacion sobre el numero de parametros, la longitud de contexto textual mas alla de los 512 tokens de prompt ni los idiomas soportados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion single-stream destilado (8 pasos) + codificador de texto Qwen3 + decodificador VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de texto tras el encuadre de chat de Qwen3 |
| Tipos de cuantizacion | BF16 (transformer, text encoder, VAE y tokenizer); el checkpoint original del transformer se publica en F32 y este paquete usa la copia BF16 de Comfy-Org |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete Loom (`.loom` + `model.json`); pesos subyacentes en BF16 (safetensors en los repositorios de origen) |

## Arquitectura y entrenamiento

El modelo base Z-Image-Turbo es un modelo de difusion text-to-image con un transformer single-stream y un checkpoint destilado que fija la inferencia en 8 pasos sin classifier-free guidance. El pipeline completo consta de tres etapas: un codificador de texto Qwen3 que procesa el prompt (con encuadre de chat y truncado a 512 tokens), el transformer de difusion que genera el latente y un decodificador VAE que produce la imagen final. El paquete Loom no modifica el text encoder, el VAE ni el tokenizer, que se leen sin cambios del checkpoint del publicador; el transformer se toma de la copia BF16 de Comfy-Org/z_image_turbo porque el publicador solo lo distribuye en F32.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable del paquete es el propio port a Loom sobre gfx1151, con soporte de peticiones concurrentes, reproducibilidad por semilla (misma semilla, misma imagen), gestion de workspace con VAE tiled opcional y presets de geometria. El autor declara que otros presets comparten el mismo transformer BF16, text encoder, VAE y tokenizer.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en lenguaje natural, con resolucion por defecto de 1024x1024.
- Tamanos de imagen configurables mediante `size` en formato `ANCHOxALTO`: multiplos de 16, maximo 8192 por eje, con un numero de parches de al menos 32 y divisible por 32.
- Generacion determinista por semilla: la misma semilla produce la misma imagen, verificado tambien bajo concurrencia.
- Inferencia en 8 pasos fijos, sin classifier-free guidance (no aplicable por ser un checkpoint destilado).
- Procesamiento de prompts de hasta 512 tokens tras el encuadre de chat de Qwen3; los prompts mas largos se truncan como en el pipeline de referencia.
- Servicio mediante API compatible con OpenAI: `/v1/images/generations` con `response_format: b64_json`, ademas de endpoints de estado (`/v1/status`) y listado de modelos (`/v1/models`).
- Soporte de peticiones concurrentes con replay por semilla comprobado.
- No soporta edicion de imagen ni img2img (entrada de imagen no disponible).
- No se dispone de informacion sobre capacidades multilingues, tool calling ni modos de razonamiento; son capacidades no aplicables a un modelo text-to-image.

## Casos de uso

- Generacion de ilustraciones para prototipos de producto: el endpoint `/v1/images/generations` permite integrar la generacion de imagenes en un backend existente que ya hable el formato de OpenAI, sin adaptadores adicionales.
- Servicio local de generacion de imagenes en estaciones de trabajo AMD: al ejecutarse sobre Strix Halo con hrx-loom, permite desplegar un servidor de imagenes en hardware integrado AMD sin depender de CUDA.
- Generacion reproducible de assets para pruebas automatizadas: la garantia de misma semilla, misma imagen, incluso bajo concurrencia, facilita tests de regresion visual con comparacion SHA-256.
- Creacion de material grafico para documentacion tecnica: el preset `image` admite geometrias como 768x1344, util para diagramas verticales o infografias, con prompts de hasta 512 tokens.
- Entornos con memoria limitada: el preset `image-bounded-workspace` impone un limite de 1,5 GiB y activa VAE tiled cuando es necesario, lo que permite servir el modelo en configuraciones con menos memoria disponible.
- Generacion por lotes de imagenes a 384x384 para previsualizaciones o thumbnails: el preset `lifecycle` esta pensado para ciclos de vida cortos con VAE untiled y menor coste.
- Evaluacion comparativa de backends de inferencia: el paquete incluye metricas PSNR, LPIPS, CLIPScore y PickScore frente a diffusers, lo que lo hace util como referencia para validar ports a otros runtimes.

## Benchmarks y rendimiento

Datos reportados por el autor en Strix Halo (gfx1151), 1024x1024, 8 pasos, sin classifier-free guidance, sobre 24 casos (8 prompts fijos y semillas 0, 42 y 1234):

| Metrica | Loom (este paquete) | diffusers bf16 (PyTorch ROCm) |
|---|---|---|
| PSNR vs diffusers fp32 (mayor es mejor) | 30,49 | 29,57 |
| LPIPS vs diffusers fp32 (menor es mejor) | 0,032 | 0,037 |
| LPIPS vs diffusers bf16 (menor es mejor) | 0,035 | referencia |
| CLIPScore (mayor es mejor) | 28,98 | 29,07 |
| PickScore (mayor es mejor) | 23,276 | 23,292 |

La diferencia pareada de PickScore frente a diffusers bf16 es de -0,016 con un intervalo de confianza del 95 % de -0,071 a +0,035, lo que el autor interpreta como ausencia de diferencia medible. El autor senala que Loom queda mas cerca de diffusers fp32 que diffusers bf16. No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo text-to-image.

## Requisitos de hardware

- GPU probada: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), con Radeon 8060S; el autor indica que otras GPUs AMD soportadas por hrx-loom 0.2.0 pueden ejecutar el paquete, pero no han sido probadas.
- VRAM estimada: no disponible de forma explicita; el preset `image-bounded-workspace` impone un limite de workspace de 1,5 GiB con VAE tiled cuando es necesario.
- GPU recomendadas: no disponible; el unico hardware validado es el mencionado Strix Halo.
- Compatibilidad con GPU consumer: el paquete esta orientado a GPUs AMD; no se dispone de informacion sobre su funcionamiento en GPUs NVIDIA.
- Opciones de despliegue: `hrx-loom` 0.2.0 (instalacion via `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo con `--device=amdgpu --listen=127.0.0.1:8080`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tongyi-MAI-Z-Image-Turbo-loom | Paquete de despliegue Loom para AMD | no disponible | 512 tokens | Apache 2.0 | Hugging Face (loom-fun) |
| Tongyi-MAI/Z-Image-Turbo | Modelo base text-to-image | no disponible | no disponible | no disponible | Hugging Face (Tongyi-MAI) |
| Comfy-Org/z_image_turbo | Copia BF16 del transformer para ComfyUI | no disponible | no disponible | no disponible | Hugging Face (Comfy-Org) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada. La comparativa mas directa disponible es frente a la implementacion de referencia con diffusers en PyTorch ROCm, cuyos resultados numericos se recogen en la seccion de benchmarks.

## Limitaciones y advertencias

- El paquete solo ha sido probado en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); el resto de GPUs AMD soportadas por hrx-loom 0.2.0 no han sido validadas.
- No soporta edicion de imagen ni img2img; solo genera imagenes a partir de texto.
- Los prompts se truncan a 512 tokens tras el encuadre de chat de Qwen3, lo que limita la complejidad de las instrucciones.
- Los pasos de inferencia estan fijos en 8 por tratarse de un checkpoint destilado; no se puede ajustar el numero de pasos ni aplicar guidance.
- El transformer se toma de una copia BF16 de terceros (Comfy-Org) porque el publicador solo distribuye F32; esto introduce una dependencia de un repositorio externo con revisiones fijadas.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion visual, limitaciones idiomaticas ni restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0.
- El autor no reporta datos de latencia ni throughput, lo que dificulta estimar el coste de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion temprana y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-fun/Tongyi-MAI-Z-Image-Turbo-loom
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Copia BF16 del transformer: https://huggingface.co/Comfy-Org/z_image_turbo
- Runtime hrx-system (ROCm): https://github.com/ROCm/hrx-system
- Pull request del paquete en hrx-loom-library: https://github.com/ROCm/hrx-loom-library/pull/126
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- diffusers (implementacion de referencia): https://github.com/huggingface/diffusers
- LPIPS: https://github.com/richzhang/PerceptualSimilarity
- open_clip: https://github.com/mlfoundations/open_clip
- PickScore: https://huggingface.co/yuvalkirstain/PickScore_v1
