# kimhagon/Qwen-Image-2.1-Turbo-Quantized

## Resumen

Qwen-Image-2.1-Turbo-Quantized es una republicación cuantizada del modelo de generación de imágenes Qwen-Image-2.1-Turbo, desarrollado originalmente por el equipo Qwen de Alibaba. El autor de esta ficha, kimhagon (también identificado como abenzerps en los enlaces de referencia), se limita a ofrecer los pesos del modelo base en múltiples formatos de cuantización para facilitar su despliegue en hardware de consumo. El modelo base es un sistema text-to-image de 7.115 millones de parámetros con arquitectura de generación visual de 7B, diseñado para producir imágenes a partir de descripciones textuales.

La relevancia de esta publicación radica en la disponibilidad de formatos: GGUF (desde Q4_0 hasta Q8_0), safetensors en FP8, INT8 ConvRot y NVFP4, y variantes MLX de 4, 6 y 8 bits. Esto permite ejecutar un modelo de generación de imágenes de escala 7B en GPUs de consumo y en entornos Apple Silicon mediante MLX/MFLUX. El modelo base destaca por su modo "Turbo", que reduce el proceso de denoising a 8 pasos con CFG = 1, logrando una generación de 1024 × 1024 en aproximadamente 10-20 segundos tras el calentamiento en GPU.

El repositorio tiene un tamaño total de 90 GB, lo que refleja la inclusión de todos los formatos de cuantización y los modelos complementarios (text encoder Qwen3VL-8B y VAE). La licencia es qwen-research, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generación visual de 7B (text-to-image, difusión) |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0), FP8, INT8 ConvRot, NVFP4, MLX 4-bit/6-bit/8-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un modelo de difusión para generación de imágenes de 7B parámetros. La información proporcionada no detalla la arquitectura interna exacta (tipo de backbone, mecanismo de atención, etc.), pero sí confirma que se trata de una arquitectura de generación visual de 7B y que emplea un proceso de denoising reducido a 8 pasos con CFG = 1 en su modo Turbo. El pipeline incluye un text encoder basado en Qwen3VL-8B (en BF16 o INT8) y un VAE específico (qwen_image_2.1_vae_bf16).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo base soporta de forma nativa la generación de imágenes sin censura, sin checker de seguridad ni filtro de contenido incorporado. La innovación técnica destacable es la reducción del número de pasos de denoising (8 pasos) manteniendo CFG = 1, lo que acelera la inferencia de forma significativa frente a modelos de difusión convencionales que requieren decenas de pasos.

## Capacidades

- Generación de texto a imagen (text-to-image) a partir de descripciones textuales.
- Generación a 1024 × 1024 píxeles en aproximadamente 10-20 segundos tras el calentamiento en GPU.
- Modo Turbo con 8 pasos de denoising y CFG = 1 como configuración recomendada.
- Generación de imágenes sin censura nativa (sin safety checker ni filtro de contenido incorporado).
- Soporte de transparencia nativa (según la documentación de QwenCloud).
- Capacidades de edición unificadas con generación: múltiples referencias, control local y restauración de alta fidelidad (según la documentación de QwenCloud).
- Compatibilidad con ComfyUI mediante flujos de trabajo específicos (plantilla Qwen Image 2.1 Turbo — Text to Image).
- Compatibilidad con MLX/MFLUX para Apple Silicon.
- Compatibilidad con stable-diffusion.cpp para ejecución en línea de comandos.

## Casos de uso

- Generación de imágenes en ComfyUI: el modelo se integra mediante la plantilla oficial "Qwen Image 2.1 Turbo — Text to Image", cargando el diffusion model en GGUF o safetensors, el text encoder Qwen3VL-8B y el VAE. Adecuado para flujos de trabajo de creación visual iterativa con control fino sobre el sampling.
- Ejecución en GPU de consumo: las variantes Q4_K_M (4,05 GB) y Q4_0 (4,05 GB) permiten ejecutar el modelo en GPUs con VRAM limitada, manteniendo la generación a 1024 × 1024 en tiempos de 10-20 segundos tras el calentamiento.
- Despliegue en Apple Silicon: las variantes MLX de 4, 6 y 8 bits (4,00 GB, 5,78 GB y 7,56 GB respectivamente) permiten ejecutar el modelo en equipos Mac mediante MLX/MFLUX, aprovechando la memoria unificada.
- Generación de imágenes transparentes: gracias al soporte nativo de transparencia, el modelo puede producir assets con canal alfa para composición en diseño gráfico y desarrollo de interfaces.
- Edición de imágenes con múltiples referencias: las capacidades de edición unificada permiten tareas de control local y restauración de alta fidelidad, útiles en pipelines de retoque y postproducción.
- Ejecución en línea de comandos y automatización: mediante stable-diffusion.cpp con GGUF o safetensors compatibles, el modelo puede integrarse en scripts de generación por lotes para producción de contenido a escala.
- Prototipado rápido de conceptos visuales: el modo Turbo de 8 pasos con CFG = 1 reduce el coste computacional por imagen, lo que lo hace adecuado para iteración rápida en fases de diseño conceptual.

## Benchmarks y rendimiento

La model card incluye una referencia a una imagen de comparación de benchmarks (`assets/Qwen-Image-2.1-Benchmark.png`), pero los resultados numéricos concretos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,05 GB para Q4_0/Q4_K_M (GGUF), 4,20 GB para NVFP4, 4,94 GB para Q5_K_M, 5,88 GB para Q6_K, 7,13 GB para FP8, 7,26 GB para INT8 ConvRot y 7,59 GB para Q8_0. A ello hay que sumar el text encoder (9,35 GB en INT8 o 17,53 GB en BF16) y el VAE (0,68 GB).
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El modelo base está pensado para ejecución en GPU; la generación a 1024 × 1024 tarda 10-20 segundos tras el calentamiento, dependiendo del hardware.
- Cabe en GPU de consumo: sí, con las variantes de menor cuantización (Q4_K_M, Q4_0, NVFP4, MLX 4-bit), siempre considerando el coste adicional del text encoder.
- Opciones de despliegue: ComfyUI (GGUF y safetensors), stable-diffusion.cpp (GGUF y safetensors compatibles), MLX/MFLUX (variantes MLX 4/6/8-bit).
- Latencia y throughput: 1024 × 1024 en aproximadamente 10-20 segundos en GPU tras el calentamiento, con 8 pasos de denoising y CFG = 1. No se dispone de datos de throughput por lotes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card menciona una comparación de benchmarks frente a otros modelos, pero los datos numéricos no están accesibles. No disponible.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es necesario verificar los términos completos antes de cualquier despliegue en producción.
- El modelo base no incorpora safety checker ni filtro de contenido, lo que implica que la moderación de las salidas debe implementarse externamente si es necesaria.
- Riesgo de alucinación visual y de fidelidad limitada al prompt: no se dispone de datos sobre tasas de error o fidelidad semántica.
- No se dispone de información sobre sesgos conocidos del modelo base.
- No se dispone de información sobre idiomas soportados por el text encoder ni sobre el rendimiento multilingüe.
- Los tiempos de generación indicados (10-20 segundos) dependen del hardware y requieren calentamiento previo; no se especifican las condiciones exactas de medición.
- El repositorio tiene un tamaño de 90 GB, lo que implica un coste de almacenamiento y descarga considerable si se quieren todos los formatos.
- La cuantización puede degradar la calidad de imagen respecto a los pesos originales en BF16; no se dispone de métricas comparativas de calidad por cuantización.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/kimhagon/Qwen-Image-2.1-Turbo-Quantized
- Repositorio alternativo del autor: https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Documentación QwenCloud del modelo base: https://docs.qwencloud.com/models/qwen-image-2-1-turbo
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla de flujo de trabajo oficial: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- GitHub del autor: https://github.com/abenzerps
- Solicitud de modelos: https://abenzerps.com/request-a-model/
