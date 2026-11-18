# abenzerps/Qwen-Image-2.1-GGUF

## Resumen

Qwen-Image-2.1-GGUF es un repositorio de cuantizaciones del modelo de generación de imágenes Qwen-Image-2.1-Turbo, publicado por el usuario abenzerps. No se trata de un modelo entrenado desde cero, sino de una colección de pesos convertidos a múltiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX 4/6/8 bits) para facilitar su despliegue en ComfyUI, stable-diffusion.cpp y MFLUX. El modelo base, desarrollado por el equipo Qwen de Alibaba, es una arquitectura de difusión de aproximadamente 7.115 millones de parámetros orientada a text-to-image.

La relevancia de este repositorio radica en su enfoque "Turbo": el modelo está diseñado para generar imágenes de 1024×1024 en 8 pasos de denoising con CFG=1, lo que reduce drásticamente el coste computacional frente a los pipelines de difusión tradicionales de 20-50 pasos. En hardware de consumo, el autor reporta tiempos de 10-20 segundos por imagen tras el warm-up, dependiendo del equipo.

El repositorio acumula más de 187.000 descargas y 6.043 likes, lo que lo convierte en una de las distribuciones comunitarias más populares de este modelo. Incluye además los componentes auxiliares necesarios (text encoder Qwen3-VL de 8B y VAE) empaquetados para su uso directo en ComfyUI. La licencia es `qwen-research`, lo que restringe el uso comercial sin autorización expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de imágenes (text-to-image); detalles internos del backbone no disponibles |
| Parametros totales | 7.115.124.736 (~7,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0), safetensors FP8, INT8 ConvRot, NVFP4, MLX 4/6/8 bits |
| Idiomas soportados | No disponible (prompts en lenguaje natural; el text encoder Qwen3-VL es multilingüe) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), BF16 para text encoder y VAE |
| Tamano del repo | 215,1 GB (incluye todas las variantes) |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo |
| Pasos de denoising | 8 (modo Turbo), CFG por defecto = 1 |
| Resolución de referencia | 1024 × 1024 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del backbone de difusión (si es un transformer de difusión tipo DiT, un UNet o una variante híbrida). Lo que sí se especifica es que se trata de un modelo de 7,1B parámetros para generación de imágenes a partir de texto, con un modo "Turbo" que reduce el muestreo a 8 pasos de denoising con CFG=1, empleando un schedule de sigmas oficial. El pipeline se completa con un text encoder Qwen3-VL de 8B (en BF16 o INT8) y un VAE específico (`qwen_image_2.1_vae_bf16`).

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning por preferencias. El autor del repositorio de cuantizaciones no entrena el modelo: solo convierte y empaqueta los pesos del modelo base Qwen/Qwen-Image-2.1-Turbo. La innovación técnica destacable es la reducción de pasos de inferencia (8 en lugar de decenas) manteniendo calidad, lo que habilita su uso en GPUs de consumo y en Apple Silicon vía MLX.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) a 1024×1024.
- Modo Turbo con 8 pasos de denoising y CFG=1, optimizado para baja latencia.
- Generación sin filtro de contenido integrado: el modelo base no aplica safety checker ni content filter por defecto (según el autor).
- Soporte de cuantizaciones para distintos backends: GGUF para ComfyUI-GGUF y stable-diffusion.cpp; safetensors FP8/INT8/NVFP4 para ComfyUI; MLX para MFLUX en Apple Silicon.
- Integración con ComfyUI mediante plantilla oficial ("Qwen Image 2.1 Turbo — Text to Image").
- Compatibilidad con text encoder Qwen3-VL 8B, que aporta comprensión multilingüe de prompts (aunque el modelo no declara idiomas soportados explícitamente).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es un modelo puramente generativo de imágenes.

## Casos de uso

- Generación rápida de ilustraciones para prototipado de producto: con 8 pasos y 1024×1024, un equipo de diseño puede iterar decenas de variaciones visuales en minutos sobre una RTX 4090, usando la cuantización Q4_K_M (4,42 GB) para minimizar el uso de VRAM.
- Creación de assets para videojuegos y entornos 3D: el modelo puede generar texturas, concept art y materiales de referencia a partir de descripciones textuales, integrándose en un pipeline de ComfyUI que exporte directamente a las carpetas de assets del proyecto.
- Automatización de contenido para marketing: generación por lotes de banners y creatividades a partir de plantillas de prompt, con seed fija para mantener consistencia entre variaciones y el schedule de sigmas oficial para reproducibilidad.
- Despliegue en estaciones de trabajo Apple Silicon: gracias a las variantes MLX 4/6/8 bits (4,00-7,56 GB), el modelo puede ejecutarse en Macs con MFLUX sin GPU dedicada, útil para equipos creativos que trabajan en macOS.
- Investigación en cuantización de modelos de difusión: el repositorio ofrece una matriz comparativa de formatos (GGUF Q4_0 a Q8_0, FP8, INT8 ConvRot, NVFP4, MLX) que permite estudiar el impacto de cada precisión en la calidad de imagen y en el tiempo de inferencia con el mismo seed.
- Generación de imágenes sin restricciones para investigación artística: al no incluir safety checker por defecto, el modelo es adecuado para estudios académicos sobre sesgos y contenido generado, siempre que se respete la licencia qwen-research y la legislación aplicable.
- Integración en pipelines CLI y servidores sin interfaz gráfica: mediante stable-diffusion.cpp con los ficheros GGUF, se puede desplegar en entornos headless o contenedores para generar imágenes bajo demanda vía API.

## Benchmarks y rendimiento

La model card incluye una imagen de comparación de benchmarks (`assets/Qwen-Image-2.1-Benchmark.png`), pero los valores numéricos no están disponibles en el texto proporcionado. No se han publicado resultados numéricos de benchmarks (FID, CLIP score, MMLU, etc.) en la información disponible.

Datos de rendimiento sí disponibles:

| Metrica | Valor |
|---|---|
| Resolución | 1024 × 1024 |
| Pasos de denoising | 8 |
| CFG | 1,0 |
| Tiempo de generación (GPU, tras warm-up) | ~10-20 s según hardware |
| Sampler recomendado | Euler |
| Batch | 1 |

## Requisitos de hardware

- VRAM estimada para el modelo de difusión según cuantización: Q4_0 ~4,13 GB, Q4_K_M ~4,42 GB, Q5_K_M ~5,35 GB, Q6_K ~6,29 GB, Q8_0 ~7,69 GB, FP8 ~7,13 GB, INT8 ConvRot ~7,26 GB, NVFP4 ~4,20 GB, MLX 4-bit ~4,00 GB, MLX 6-bit ~5,78 GB, MLX 8-bit ~7,56 GB.
- A esa cifra hay que sumar el text encoder (Qwen3-VL 8B: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot) y el VAE (0,68 GB). El consumo total en BF16 supera los 25 GB, por lo que en GPUs de 24 GB conviene usar el text encoder INT8.
- GPU recomendadas: A100/H100 para despliegues de producción con text encoder BF16; RTX 4090 (24 GB) con text encoder INT8; RTX 3090/4080 con cuantizaciones Q4/Q5 y text encoder INT8.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q4_0 (4-4,5 GB) más text encoder INT8 (9,35 GB) y VAE (0,68 GB), lo que suma en torno a 14-15 GB, viable en RTX 4080/4090 y en GPUs de 16 GB con margen ajustado.
- Apple Silicon: las variantes MLX 4/6/8 bits permiten ejecución en Macs vía MFLUX; el tamaño total con MLX 4-bit más text encoder INT8 ronda los 13,5 GB.
- Opciones de despliegue: ComfyUI (con ComfyUI-GGUF para los ficheros GGUF), stable-diffusion.cpp para CLI, MFLUX para MLX.
- Latencia y throughput: ~10-20 s por imagen de 1024×1024 en GPU tras warm-up, según el autor; no se especifica el hardware exacto de la medición ni el throughput en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos tipicos | Formatos disponibles | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (este repo) | ~7,1B | 8 (CFG 1) | GGUF, FP8, INT8, NVFP4, MLX | qwen-research | Sin safety checker por defecto; integración ComfyUI oficial |
| Qwen/Qwen-Image-2.1-Turbo (base) | ~7,1B | 8 (CFG 1) | safetensors BF16 | qwen-research | Pesos originales sin cuantizar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos de difusión comparables en la información proporcionada |

No se dispone de información sobre modelos comparables (por ejemplo, otras familias de difusión de tamaño similar) en los datos proporcionados, por lo que la comparativa se limita al modelo base y a sus propias variantes cuantizadas.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial sin autorización expresa; es imprescindible revisar los términos antes de desplegar en producción.
- Ausencia de safety checker y content filter por defecto: el modelo puede generar contenido inapropiado o no deseado; en producción es responsabilidad del integrador añadir filtros propios.
- Riesgo de sesgos: no se documentan evaluaciones de sesgo demográfico, cultural o de representación; los modelos de difusión entrenados con datasets web suelen reproducir estereotipos.
- Alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible en la imagen y elementos incoherentes con el prompt.
- Idiomas soportados no declarados: aunque el text encoder Qwen3-VL es multilingüe, no hay garantía documentada sobre la calidad de generación con prompts en castellano u otros idiomas distintos del inglés.
- El repositorio es una cuantización comunitaria, no oficial de Qwen: la calidad puede degradarse respecto al modelo base BF16, especialmente en Q4_0 y MLX 4-bit.
- Tamaño total del repo de 215,1 GB: la descarga completa es inviable para muchos entornos; conviene descargar solo los ficheros necesarios.
- Los tiempos de 10-20 s por imagen dependen del hardware y no se especifica la GPU de referencia; pueden ser mayores en GPUs de gama media o en Apple Silicon.
- No se documentan limitaciones específicas de contexto de prompt (longitud máxima del texto de entrada) en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abenzerps/Qwen-Image-2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio de cuantizaciones del autor: https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla oficial ComfyUI (Qwen Image 2.1 Turbo T2I): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- GitHub del autor: https://github.com/abenzerps
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
