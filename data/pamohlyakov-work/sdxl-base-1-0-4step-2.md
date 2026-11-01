# pamohlyakov-work/sdxl-base-1.0-4step-2

## Resumen

`sdxl-base-1.0-4step-2` es un paquete de pesos en formato Diffusers del modelo Stable Diffusion XL Base 1.0, publicado por el usuario `pamohlyakov-work` (la model card hace referencia al identificador `phobos36/sdxl-base-1.0-single`). No se trata de un modelo entrenado desde cero ni de un fine-tune con pesos modificados: la model card indica que los cuatro ficheros de pesos (UNet, CLIP-L, CLIP-G y VAE) se copian byte a byte del repositorio oficial `stabilityai/stable-diffusion-xl-base-1.0` en la revision `462165984030d82259a11f4367a4eed129e94a7b`. El objetivo declarado es ofrecer un layout multifolder limpio y minimo, listo para `StableDiffusionXLPipeline.from_pretrained()`, sin checkpoints combinados, sin ONNX, sin Flax y sin refiner.

El modelo resuelve el problema de empaquetado: muchos repositorios de SDXL mezclan variantes de precision, ficheros duplicados o checkpoints de ComfyUI que no cargan directamente con Diffusers. Este repo separa los componentes en el arbol estandar (`unet/`, `text_encoder/`, `text_encoder_2/`, `tokenizer/`, `tokenizer_2/`, `vae/`, `scheduler/`) y usa nombres de fichero sin sufijo de variante para los pesos FP16, de modo que no hace falta pasar `variant="fp16"` al cargar.

La relevancia es practica: sirve como base reproducible para inferencia text-to-image con SDXL y para aplicar el adaptador SDXL-Lightning de 4 pasos, que no viene fusionado en los pesos. El nombre del repositorio sugiere un flujo de 4 pasos, pero la model card aclara explicitamente que Lightning es un repositorio separado y que debe cargarse como LoRA. El paquete no ha sido probado en GPU ni ejecutado en Cloud.ru segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion: UNet + doble text encoder (CLIP-L y CLIP-G) + VAE, segun SDXL Base 1.0 |
| Parametros totales | 2.567.463.684 (suma de pesos en safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; el prompt se tokeniza con CLIP, limite estandar de 77 tokens por encoder) |
| Tipos de cuantizacion | Pesos publicados en FP16 (UNet, CLIP-L, CLIP-G) y FP32 (VAE); no se documentan otras cuantizaciones en el repo |
| Idiomas soportados | No disponible (los text encoders CLIP estan entrenados principalmente en ingles; la model card no declara idiomas) |
| Licencia | openrail++ (CreativeML Open RAIL++-M) |
| Formato de pesos | safetensors (layout Diffusers multifolder) |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL Base 1.0: un modelo de difusion latente con un UNet como red de denoising, dos text encoders CLIP (CLIP-L y CLIP-G) que producen el condicionamiento textual y un VAE que codifica y decodifica entre espacio de pixeles y espacio latente. El scheduler configurado es `EulerDiscreteScheduler` con `timestep_spacing="trailing"` y `prediction_type="epsilon"`, ajustado para el adaptador SDXL-Lightning. El VAE se mantiene en FP32 y conserva su ajuste original de `force_upcast`.

Este repositorio no aporta entrenamiento propio: los pesos son copia del checkpoint oficial de Stability AI y los ficheros de configuracion de los componentes se preservan sin cambios. La unica modificacion es la configuracion del scheduler para compatibilidad con Lightning. El adaptador de 4 pasos (SDXL-Lightning, de ByteDance) no esta fusionado; se carga como LoRA desde `phobos36/sdxl-lightning-4step-lora` y se fusiona con `fuse_lora()`. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO en la informacion disponible, porque el modelo subyacente es el checkpoint oficial de SDXL Base 1.0 y este repo no anade informacion al respecto.

## Capacidades

- Generacion de imagenes text-to-image con el pipeline `StableDiffusionXLPipeline` de Diffusers.
- Inferencia acelerada en 4 pasos cuando se combina con el LoRA SDXL-Lightning y `guidance_scale=0`.
- Carga directa con `from_pretrained()` sin argumento `variant`, gracias a los nombres de fichero sin sufijo.
- Compatibilidad con `load_lora_weights()` y `fuse_lora()` para aplicar adaptadores externos.
- Soporte de resoluciones altas propias de SDXL Base 1.0 (hasta 1024x1024 en el modelo base, segun las capacidades del checkpoint original).
- No incluye refiner, ONNX, Flax ni checkpoints combinados; esas variantes no estan disponibles en este repo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking: es un modelo puramente generativo de imagen.

## Casos de uso

- Prototipado rapido de pipelines text-to-image: el layout multifolder permite cargar el modelo con una sola llamada a `from_pretrained()` y validar integraciones en Diffusers sin gestionar variantes de precision.
- Generacion de imagenes en 4 pasos para demos interactivas: combinando el LoRA SDXL-Lightning, se reduce el coste de inferencia y se obtienen tiempos de respuesta adecuados para interfaces de usuario.
- Base reproducible para experimentos academicos: al ser copia byte a byte del checkpoint oficial, sirve como referencia controlada para comparar tecnicas de aceleracion (Lightning, schedulers alternativos) sin ruido de pesos modificados.
- Integracion en entornos de despliegue gestionado: la model card menciona Cloud.ru Model RUN con runtime Diffusers y tarea text-to-image, aunque advierte que no se ha probado alli.
- Generacion de assets para videojuegos o diseno grafico: SDXL Base 1.0 produce imagenes de 1024x1024 utiles para concept art, texturas o bocetos, con el LoRA de 4 pasos para iteracion rapida.
- Investigacion sobre LoRAs y adaptadores: al no fusionar Lightning en los pesos, el repo permite cargar y descargar adaptadores dinamicamente para estudiar su efecto sobre la generacion.
- Fine-tuning posterior: los componentes separados (UNet, text encoders, VAE) facilitan entrenar adaptadores especificos sobre una base limpia y verificable mediante `SHA256SUMS`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score, IS ni comparaciones cuantitativas, y advierte que el paquete no ha sido ejecutado en GPU ni probado en Cloud.ru.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 7,3 GB en disco; en FP16, la carga completa (UNet, dos text encoders y VAE) requiere aproximadamente 8-10 GB de VRAM, aunque la cifra exacta no esta documentada en la model card.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo, son adecuadas GPUs con 12 GB o mas de VRAM, como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas de VRAM; en GPUs de 8 GB puede requerir offloading o cuantizacion adicional no documentada en este repo.
- Opciones de despliegue: Diffusers con `StableDiffusionXLPipeline` es el metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles. La model card no aporta mediciones, y el propio autor indica que no se ha probado en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `pamohlyakov-work/sdxl-base-1.0-4step-2` | 2.567.463.684 | SDXL Base 1.0 (1024x1024) | openrail++ | HuggingFace, 31 descargas | Copia del checkpoint oficial en layout Diffusers; Lightning como LoRA separado |
| `stabilityai/stable-diffusion-xl-base-1.0` | Similar (checkpoint oficial) | SDXL Base 1.0 | openrail++ | HuggingFace, repo oficial | Incluye variantes de precision, refiner y ficheros adicionales; es la fuente de los pesos |
| `ByteDance/SDXL-Lightning` | Adaptador LoRA (no modelo completo) | SDXL Base 1.0 | openrail++ (segun repo) | HuggingFace | Adaptador de destilacion para 1, 2, 4 u 8 pasos; se aplica sobre SDXL Base |
| `stabilityai/stable-diffusion-xl-refiner-1.0` | Modelo complementario | SDXL Refiner | openrail++ | HuggingFace | Refiner oficial para mejorar calidad; no incluido en este repo |

## Limitaciones y advertencias

- No es un modelo original ni un fine-tune: los pesos son copia del checkpoint oficial de Stability AI; el valor anadido es el empaquetado, no el entrenamiento.
- La model card advierte que el paquete no ha sido ejecutado en GPU ni probado en Cloud.ru; el rendimiento real no esta validado por el autor.
- El flujo de 4 pasos depende de cargar y fusionar el LoRA SDXL-Lightning por separado; sin el, el modelo funciona como SDXL Base 1.0 estandar.
- Riesgo de alucinacion visual y sesgos: al ser SDXL Base 1.0, hereda los sesgos del dataset de entrenamiento original y puede generar contenido inexacto o estereotipado; no se documentan mitigaciones en este repo.
- Idiomas: los text encoders CLIP estan orientados al ingles; el soporte multilingue no esta declarado y probablemente sea limitado.
- Licencia openrail++ con restricciones de uso: incluye clausulas de uso aceptable que prohiben determinados fines; debe revisarse `LICENSE.md` antes de uso comercial.
- El repositorio tiene muy poca traccion (31 descargas, 0 likes) y fue creado en 2026-10-27; no hay evidencia de mantenimiento ni de comunidad.
- No incluye refiner, ONNX, Flax ni checkpoints combinados; si el pipeline necesita esas variantes, hay que acudir al repo oficial.
- La identidad del autor es ambigua: el ID del repo es `pamohlyakov-work` pero la model card referencia `phobos36/sdxl-base-1.0-single`; conviene verificar la procedencia antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pamohlyakov-work/sdxl-base-1.0-4step-2
- Modelo base oficial: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repo referenciado en la model card: https://huggingface.co/phobos36/sdxl-base-1.0-single
- Rama del checkpoint ComfyUI: https://huggingface.co/phobos36/sdxl-base-1.0-single/tree/comfy-checkpoint
- LoRA SDXL-Lightning referenciado: https://huggingface.co/phobos36/sdxl-lightning-4step-lora
- SDXL-Lightning oficial (ByteDance): https://huggingface.co/ByteDance/SDXL-Lightning
