# akyu514/stable-diffusion-xl-base-1.0

## Resumen
Stable Diffusion XL base 1.0 (SDXL) es un modelo de difusion latente para generacion de imagenes a partir de texto, desarrollado por Stability AI. Esta ficha corresponde a la republicacion del repositorio oficial realizada por el usuario `akyu514` en Hugging Face, que mantiene los pesos originales en formato safetensors y ONNX junto con la model card de Stability AI. El modelo resuelve la sintesis text-to-image de alta resolucion (hasta 1024x1024) mediante un pipeline de dos etapas denominado ensemble of experts: un modelo base que genera los latentes ruidosos y un modelo refinador especializado en los ultimos pasos de denoising.

La arquitectura es un UNet de difusion latente condicionado por dos codificadores de texto fijos, OpenCLIP-ViT/G y CLIP-ViT/L, lo que le permite combinar una comprension semantica amplia con un alineamiento fino al prompt. El modelo base puede usarse de forma autonoma o combinado con el refinador, y admite tambien tecnicas img2img basadas en SDEdit. Cuenta con 2.567.463.684 parametros reales en safetensors, un repositorio de 76,9 GB que incluye multiples variantes de pesos (fp16, fp32 y ONNX), y se distribuye bajo licencia CreativeML Open RAIL++-M.

Su relevancia actual radica en que sigue siendo una de las bases mas extendidas del ecosistema diffusers para generacion de imagenes, con soporte nativo en Diffusers, Optimum (OpenVINO y ONNX Runtime) y multitud de herramientas de la comunidad. No obstante, esta republicacion concreta no aporta mejoras tecnicas ni ajustes propios: es una copia del checkpoint oficial de Stability AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (Latent Diffusion Model) con doble codificador de texto (OpenCLIP-ViT/G y CLIP-ViT/L) y VAE |
| Parametros totales | 2.567.463.684 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; la ventana efectiva la determina el tokenizador CLIP, 77 tokens por codificador) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio incluye variantes fp16 y fp32 y exportaciones ONNX |
| Idiomas soportados | No disponible en la informacion proporcionada (los prompts se procesan via CLIP, principalmente ingles) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors, ONNX, diffusers |

## Arquitectura y entrenamiento
SDXL es un modelo de difusion latente compuesto por un UNet troncal, un VAE y dos codificadores de texto fijos. El UNet opera sobre latentes de baja dimension generados por el VAE y aplica denoising iterativo condicionado por las representaciones de texto de OpenCLIP-ViT/G y CLIP-ViT/L, combinadas mediante un mecanismo de concatenacion de embeddings. El pipeline ensemble of experts divide el proceso de denoising: el modelo base ejecuta la mayor parte de los pasos (por defecto hasta el 80 % del total) y el refinador especializado completa los pasos finales, aplicando SDEdit sobre los latentes. El modelo base tambien puede utilizarse de forma independiente.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Si se documenta que la evaluacion se realizo mediante preferencia de usuarios comparando SDXL (con y sin refinamiento) frente a SDXL 0.9, Stable Diffusion 1.5 y 2.1, con mejor rendimiento del modelo base y el mejor resultado global al combinar base y refinador. Entre las innovaciones tecnicas destacables estan el uso de dos text encoders, la generacion nativa a 1024x1024, el esquema de dos etapas y el soporte de `torch.compile` para acelerar la inferencia entre un 20 % y un 30 % con torch >= 2.0.

## Capacidades
- Generacion de imagenes a partir de prompts de texto (text-to-image) en resoluciones de hasta 1024x1024.
- Refinamiento de alta resolucion mediante el modelo refinador complementario (ensemble of experts).
- Edicion y transformacion de imagenes mediante img2img y SDEdit.
- Condicionamiento dual con dos codificadores de texto para mejor alineamiento semantico y de estilo.
- Integracion con el ecosistema Diffusers (`StableDiffusionXLPipeline`) y con Optimum para OpenVINO y ONNX Runtime.
- Soporte de offloading de CPU para GPUs con VRAM limitada.
- Marca de agua invisible mediante `invisible_watermark` en el flujo de Diffusers.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente generativo de imagen.

## Casos de uso
- Generacion de ilustraciones y concept art: el modelo produce imagenes coherentes a 1024x1024 a partir de descripciones textuales, adecuado para prototipado visual rapido en estudios de diseno.
- Creacion de assets para videojuegos y medios: permite generar variaciones de personajes, entornos y objetos con el pipeline base o con el refinador para mayor detalle.
- Marketing y contenido editorial: generacion de imagenes de apoyo para campanas y articulos, con control mediante prompts detallados y posibilidad de img2img para ajustar composiciones existentes.
- Edicion de imagenes existentes: el flujo img2img basado en SDEdit permite transformar bocetos o fotografias manteniendo la estructura general.
- Prototipado de producto: generacion rapida de mockups y variaciones visuales para validar direcciones creativas antes de produccion.
- Investigacion en difusion: el checkpoint sirve como base para fine-tuning, LoRA, ControlNet y experimentos academicos gracias a su integracion con Diffusers y a la disponibilidad de pesos en safetensors y ONNX.
- Despliegue en entornos con hardware modesto: mediante offloading de CPU, OpenVINO u ONNX Runtime se puede ejecutar en equipos sin GPU de gama alta, aunque con mayor latencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, MMLU u otros) en la informacion disponible. La model card unicamente aporta una comparacion cualitativa de preferencia de usuarios frente a SDXL 0.9, Stable Diffusion 1.5 y 2.1, sin cifras numericas.

## Requisitos de hardware
- VRAM estimada: el checkpoint completo en fp16 requiere aproximadamente 6,9 GB solo para los pesos; en la practica se recomienda entre 8 y 12 GB de VRAM para inferencia a 1024x1024 sin offloading.
- GPU recomendadas: NVIDIA A100, H100, L40S o RTX 4090 para maxima velocidad; RTX 3090, 4080 o 3080 para uso profesional; RTX 3060 de 12 GB o superiores para uso en consumidor.
- Cabe en GPU de consumidor: si, en tarjetas con 8 GB o mas usando fp16, y en tarjetas con 6 GB mediante `enable_model_cpu_offload`.
- Opciones de despliegue: Diffusers (`StableDiffusionXLPipeline`), Optimum con OpenVINO y ONNX Runtime, `torch.compile` para aceleracion, y exportaciones ONNX incluidas en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica una mejora del 20-30 % con `torch.compile` en torch >= 2.0.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|
| SDXL base 1.0 (esta ficha) | 2.567.463.684 | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face (republicacion) |
| Stable Diffusion 1.5 | No disponible en la informacion proporcionada | 512x512 | CreativeML Open RAIL-M | Hugging Face |
| Stable Diffusion 2.1 | No disponible en la informacion proporcionada | 768x768 | CreativeML Open RAIL++-M | Hugging Face |
| SDXL 0.9 | No disponible en la informacion proporcionada | 1024x1024 | Licencia de investigacion | Hugging Face |

Segun la model card, SDXL base supera significativamente a SDXL 0.9, SD 1.5 y SD 2.1 en preferencia de usuarios, y la combinacion con el refinador obtiene el mejor resultado global. No se dispone de cifras cuantitativas adicionales para completar la comparativa.

## Limitaciones y advertencias
- Riesgo de sesgos: el modelo puede reproducir estereotipos de genero, etnia o profesion presentes en los datos de entrenamiento; la model card no detalla el dataset ni las medidas de mitigacion.
- Alucinacion visual: puede generar anatomias incorrectas, texto ilegible en la imagen o elementos incoherentes, especialmente con prompts ambiguos.
- Idioma: los codificadores CLIP estan entrenados principalmente en ingles; el rendimiento con prompts en castellano puede ser inferior y no esta documentado.
- Licencia: CreativeML Open RAIL++-M permite uso comercial con restricciones de uso responsable; es necesario revisar las clausulas de uso prohibido antes de desplegar en produccion.
- Republicacion no oficial: el repositorio pertenece a `akyu514`, no a Stability AI; conviene verificar la integridad de los pesos frente al checkpoint oficial `stabilityai/stable-diffusion-xl-base-1.0`.
- Sin garantias de soporte: al no ser el repositorio oficial, no hay mantenimiento ni actualizaciones por parte del desarrollador original.
- Consumo de recursos: el repositorio de 76,9 GB incluye multiples variantes de pesos; la descarga completa puede ser costosa en almacenamiento y ancho de banda.
- Marca de agua: el flujo de Diffusers incorpora watermark invisible; debe considerarse en flujos de publicacion.

## Enlaces
- Hugging Face (esta republicacion): https://huggingface.co/akyu514/stable-diffusion-xl-base-1.0
- Checkpoint oficial de Stability AI: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Modelo refinador oficial: https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0
- Repositorio de codigo: https://github.com/Stability-AI/generative-models
- Paper SDXL: https://arxiv.org/abs/2307.01952
- Paper ensemble of experts: https://arxiv.org/abs/2211.01324
- Paper SDEdit: https://arxiv.org/abs/2108.01073
- Paper Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Demo en Clipdrop: https://clipdrop.co/stable-diffusion
- Documentacion de Diffusers para SDXL: https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/stable_diffusion_xl
- Licencia: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
