# lukas00100/stable-diffusion-xl-base-1.0

## Resumen

Esta ficha describe `lukas00100/stable-diffusion-xl-base-1.0`, una réplica alojada en Hugging Face del modelo SDXL 1.0 base desarrollado originalmente por Stability AI. Se trata de un modelo de difusión latente para generación de imágenes a partir de texto (text-to-image) que forma parte de la familia Stable Diffusion XL, publicada en 2023 y descrita en el informe técnico arXiv:2307.01952. El repositorio lo mantiene el usuario `lukas00100`, no Stability AI, y presenta cero descargas y cero likes en el momento de la consulta, además de una fecha de creación anómala (2026).

Técnicamente, SDXL base es un modelo de difusión latente con un UNet de aproximadamente 2.567 millones de parámetros (2,567 M según los pesos safetensors), que emplea dos codificadores de texto fijos preentrenados (OpenCLIP-ViT/G y CLIP-ViT/L) y un VAE para operar en el espacio latente. El pipeline recomendado es un "ensemble of experts": el modelo base genera latentes ruidosos y un modelo refinador especializado completa los pasos finales de denoising, aunque el base puede usarse de forma autónoma.

Su relevancia actual es principalmente histórica y práctica: SDXL 1.0 base sigue siendo una referencia habitual para generación de imágenes de alta resolución (hasta 1024x1024 de forma nativa) y una base común para fine-tunings, LoRAs y ControlNets. No obstante, conviene subrayar que este repositorio concreto es una copia de terceros, con escasa trazabilidad y sin garantías de mantenimiento, por lo que para producción se recomienda acudir al repositorio oficial de Stability AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Latent Diffusion Model) con UNet y doble codificador de texto (OpenCLIP-ViT/G + CLIP-ViT/L) |
| Parametros totales | 2.567.463.684 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; no gestiona contexto conversacional) |
| Tipos de cuantizacion | No disponible en la información proporcionada (el repo incluye safetensors y ONNX) |
| Idiomas soportados | No disponible (los prompts se procesan vía CLIP, principalmente inglés) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

SDXL base es un modelo de difusión latente (LDM) que combina un autoencoder variacional (VAE) para comprimir imágenes al espacio latente, un UNet como red de denoising y dos codificadores de texto congelados: OpenCLIP-ViT/G y CLIP-ViT/L. La concatenación de las representaciones de ambos codificadores aporta al UNet una señal textual más rica que la de versiones anteriores de Stable Diffusion. El pipeline "ensemble of experts" descrito en la model card divide el proceso de muestreo: el modelo base se encarga de los pasos de alto ruido y el refinador de los pasos finales, aplicando SDEdit (img2img) sobre los latentes intermedios.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma convencional a modelos de difusión). La model card únicamente remite al informe técnico arXiv:2307.01952 para los detalles de entrenamiento y menciona que el código de entrenamiento e inferencia está en el repositorio `Stability-AI/generative-models`. Entre las innovaciones destacables figuran el uso de dos text encoders, el esquema de refinamiento en dos etapas y la posibilidad de acelerar la inferencia un 20-30 % con `torch.compile` en PyTorch 2.0 o superior.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) con resolución nativa de hasta 1024x1024.
- Modificación de imágenes existentes mediante img2img y SDEdit.
- Pipeline en dos etapas base + refiner para mejorar el detalle en los pasos finales de denoising.
- Compatibilidad con el ecosistema `diffusers` (DiffusionPipeline, StableDiffusionXLPipeline).
- Exportación y ejecución con ONNX Runtime y OpenVINO a través de Optimum.
- Soporte de CPU offloading para GPUs con VRAM limitada.
- No dispone de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingües limitadas por los codificadores CLIP; los prompts en inglés son el caso mejor soportado.
- No incluye modo "thinking", visión, audio ni otras modalidades distintas de imagen.

## Casos de uso

- Generación de ilustraciones y arte conceptual: el modelo produce imágenes de 1024x1024 a partir de descripciones textuales, adecuado para prototipado rápido de ideas visuales en estudios de diseño.
- Creación de assets para marketing: banners, fondos y material gráfico con prompts controlados, usando el pipeline base + refiner para mayor nitidez en los detalles finales.
- Edición y retoque de imágenes mediante img2img: permite transformar bocetos o fotografías existentes aplicando SDEdit con el mismo prompt, útil en flujos de postproducción.
- Base para fine-tuning y LoRA: al ser un modelo de referencia de la familia SDXL, sirve como punto de partida para entrenar estilos o conceptos específicos con herramientas del ecosistema diffusers.
- Prototipado en investigación sobre difusión: su implementación en `generative-models` y `diffusers` facilita experimentar con schedulers, pasos de inferencia y estrategias de denoising.
- Despliegue en entornos con hardware modesto: gracias al CPU offloading y a la exportación ONNX/OpenVINO, puede ejecutarse en equipos sin GPU de gama alta, a costa de mayor latencia.
- Generación de variaciones de producto: combinado con ControlNet (no incluido en este repo), permite mantener la estructura de un objeto mientras se varía el estilo o el entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye un gráfico de preferencia de usuarios que compara SDXL (con y sin refinamiento) frente a SDXL 0.9, Stable Diffusion 1.5 y 2.1, indicando que el modelo base supera significativamente a las variantes anteriores y que la combinación con el refinador obtiene el mejor resultado global. No se proporcionan cifras numéricas de dicho estudio en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos en fp16 y resolución 1024x1024, SDXL base suele requerir del orden de 8-12 GB de VRAM, aunque esta cifra no se confirma en la información proporcionada.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del modelo se sugiere hardware con al menos 12-16 GB de VRAM para ejecución cómoda en fp16.
- Compatibilidad con GPU de consumo: no confirmada en la información; el uso de `enable_model_cpu_offload` permite mitigar limitaciones de VRAM.
- Opciones de despliegue: `diffusers` (>= 0.19.0), `generative-models`, Optimum con OpenVINO y ONNX Runtime; también se puede usar `torch.compile` para acelerar la inferencia un 20-30 % en PyTorch >= 2.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| SDXL 1.0 base (este repo, copia de terceros) | 2.567 M | 1024x1024 nativo | openrail++ | Hugging Face (repo `lukas00100`) |
| SDXL 1.0 base (oficial, Stability AI) | 2.567 M | 1024x1024 nativo | openrail++ | Hugging Face (`stabilityai/stable-diffusion-xl-base-1.0`) |
| SDXL 1.0 refiner (Stability AI) | No disponible | 1024x1024 (etapa de refinamiento) | openrail++ | Hugging Face (`stabilityai/stable-diffusion-xl-refiner-1.0`) |
| Stable Diffusion 1.5 | No disponible | 512x512 nativo | CreativeML OpenRAIL-M | Hugging Face / múltiples mirrors |

La comparativa se limita a la familia SDXL y SD 1.5 porque la información proporcionada no incluye datos de otros modelos de difusión contemporáneos (por ejemplo, Flux o SD 3). No se dispone de métricas cuantitativas para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Repositorio de terceros: el modelo lo aloja `lukas00100`, no Stability AI; no hay garantía de integridad, actualización ni soporte. Para producción, usar el repositorio oficial.
- Fecha de creación anómala (2026) y cero descargas/likes: indicios de un espejo reciente o no validado por la comunidad.
- Riesgo de sesgos: los modelos de difusión entrenados con datos web pueden reproducir estereotipos de género, etnia, profesión o cultura; la información disponible no detalla mitigaciones.
- Alucinación visual: puede generar anatomías incorrectas, texto ilegible en imágenes y detalles incoherentes, especialmente con prompts ambiguos.
- Idioma: los codificadores CLIP están orientados al inglés; los prompts en castellano pueden rendir peor.
- Restricciones de licencia: CreativeML Open RAIL++-M permite uso comercial con restricciones de uso (no generar contenido ilegal, dañino o desinformación); es necesario revisar el texto completo de la licencia.
- Sin datos de benchmarks ni de evaluación de sesgos en la información disponible.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso; no debe evaluarse con métricas tipo MMLU o HumanEval.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lukas00100/stable-diffusion-xl-base-1.0
- Repositorio oficial de SDXL base (Stability AI): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Modelo refinador oficial: https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0
- Informe técnico SDXL (arXiv:2307.01952): https://arxiv.org/abs/2307.01952
- Ensemble of experts (arXiv:2211.01324): https://arxiv.org/abs/2211.01324
- SDEdit (arXiv:2108.01073): https://arxiv.org/abs/2108.01073
- Latent Diffusion Models (arXiv:2112.10752): https://arxiv.org/abs/2112.10752
- Repositorio de código `generative-models`: https://github.com/Stability-AI/generative-models
- Demo en Clipdrop: https://clipdrop.co/stable-diffusion
- Documentación de SDXL en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/stable_diffusion_xl
- Optimum (OpenVINO / ONNX Runtime): https://github.com/huggingface/optimum
