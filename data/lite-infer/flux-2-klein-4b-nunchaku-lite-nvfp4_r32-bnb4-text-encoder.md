# lite-infer/flux.2-klein-4b-nunchaku-lite-nvfp4_r32-bnb4-text-encoder

## Resumen

Este repositorio contiene una conversión cuantizada del modelo de generación de imágenes FLUX.2 Klein 4B de Black Forest Labs, preparada para cargarse directamente con Diffusers mediante `from_pretrained` sin necesidad de parches de grafo ni paquetes adicionales en tiempo de ejecución. La cuantización emplea NVFP4 (floating point de 4 bits) con SVDQ (grupo 16, rango 32, 100 objetivos SVDQ y 3 objetivos AWQ W4A16), mientras que el text encoder se comprime con BitsAndBytes a 4 bits NF4 con cómputo en bf16. El resultado es un modelo de texto a imagen que ocupa aproximadamente 5,4 GB en disco y consume unos 10,07 GiB de VRAM en inferencia, con una latencia de 1,52 segundos para generar una imagen de 1024x1024 en 4 pasos sobre una GPU Blackwell.

La relevancia de este modelo radica en que permite ejecutar FLUX.2 Klein 4B en hardware de consumo con una fracción de la memoria requerida por la versión densa (19,89 GiB), manteniendo una calidad visual cercana al original (MAE 52,94 frente a 55,52 de la versión INT4). Está diseñado para desarrolladores que necesitan desplegar generación de imágenes de alta calidad en entornos con recursos limitados, siempre que dispongan de una GPU Blackwell o superior. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.2 Klein 4B) con text encoder T5/CLIP (no especificado) cuantizado con NVFP4 SVDQ y text encoder en NF4 |
| Parametros totales | 2.195.560.036 (según safetensors del repositorio; el modelo base FLUX.2 Klein 4B tiene 4B parámetros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de texto a imagen; el text encoder tiene su propia ventana) |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) con SVDQ (grupo 16, rango 32, 100 objetivos SVDQ, 3 AWQ W4A16); text encoder en 4-bit NF4 con cómputo bf16 |
| Idiomas soportados | No disponible (probablemente inglés, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, cargable con Diffusers (Flux2KleinPipeline) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FLUX.2 Klein 4B, un transformer de difusión de texto a imagen desarrollado por Black Forest Labs. En esta conversión, el transformer principal se cuantiza con NVFP4 SVDQ, una técnica que descompone los pesos en componentes de baja dimensión (rango 32) y aplica cuantización de 4 bits en grupos de 16, con 100 objetivos SVDQ y 3 capas adicionales con AWQ W4A16. Seis lineales externos (embedders, `norm_out.linear` y `proj_out`) permanecen en bf16 para preservar la precisión en las partes críticas. Las proyecciones QKV no están fusionadas, lo que sacrifica algo de velocidad a cambio de poder cargar el modelo con el grafo estándar de Diffusers.

El text encoder se comprime con BitsAndBytes a 4 bits NF4 con cómputo en bf16, reduciendo aún más el uso de memoria. La calibración de la cuantización se realizó con 128 prompts a 4 pasos y resolución 1024x1024. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si se aplicaron técnicas de alineación como RLHF o DPO, ya que estos datos pertenecen al modelo base y no se detallan en la documentación del repositorio.

## Capacidades

- Generación de imágenes de alta calidad a partir de prompts en lenguaje natural, con resolución de hasta 1024x1024 y soporte para múltiples pasos de inferencia (el ejemplo usa 4 pasos).
- Compatible con el pipeline `Flux2KleinPipeline` de Diffusers, lo que permite integración directa en flujos de trabajo existentes.
- Cuantización NVFP4 que reduce el uso de VRAM en aproximadamente un 50% respecto a la versión densa bf16 (10,07 GiB frente a 19,89 GiB) manteniendo una calidad visual cercana al original (MAE 52,94).
- Carga mediante `from_pretrained` estándar de Diffusers, sin necesidad de parches de grafo ni paquetes adicionales en tiempo de ejecución, siempre que se disponga del paquete `kernels` y la variable de entorno `DIFFUSERS_TRUST_REMOTE_KERNELS=true`.
- Soporte para generación controlada mediante semilla, scheduler y guidance scale (el ejemplo usa `guidance_scale=1.0`).

## Casos de uso

- Generación de imágenes para prototipado de producto: un diseñador puede generar variaciones de concepto de un objeto o escena en segundos, usando una GPU de consumo como una RTX 4090 (si se usa la versión INT4) o una Blackwell, reduciendo el coste de iteración frente a servicios en la nube.
- Creación de contenido para marketing y redes sociales: el modelo permite producir imágenes de alta calidad para campañas, banners o publicaciones, con licencia Apache 2.0 que permite uso comercial sin royalties.
- Herramientas de edición de imágenes asistida por IA: al integrarse en Diffusers, puede combinarse con pipelines de inpainting o outpainting para retocar fotografías o ampliar escenas.
- Desarrollo de aplicaciones de arte generativo: artistas y desarrolladores pueden construir generadores de arte personalizados con control fino sobre el prompt, la semilla y el scheduler, aprovechando la baja latencia (1,52 s por imagen) para experiencias interactivas.
- Automatización de diseño de interfaces: el modelo puede generar mockups de páginas web o aplicaciones a partir de descripciones textuales, acelerando el flujo de trabajo de UX/UI.
- Investigación en cuantización de modelos de difusión: este repositorio sirve como referencia para estudiar el impacto de NVFP4 SVDQ en la calidad y el rendimiento, permitiendo comparar con versiones INT4 o densas.

## Benchmarks y rendimiento

Los benchmarks proporcionados por el autor se obtuvieron en una NVIDIA RTX PRO 4000 Blackwell, con una pasada de calentamiento y tres mediciones, todo residente en GPU sin offload. La latencia cubre la llamada completa al pipeline (prompt, inferencia y decodificación) y la VRAM es el pico de uso del dispositivo.

| Checkpoint | Latencia | VRAM máxima |
| --- | ---: | ---: |
| Este repositorio (NVFP4 r32 + BNB4 text encoder) | 1,52 s (desviación 0,00 s) | 10,07 GiB |
| Nunchaku Lite INT4 r32 + BNB4 text encoder | 4,93 s (desviación 0,02 s) | 9,96 GiB |
| FLUX.2 Klein 4B denso bf16 | 2,31 s (desviación 0,01 s) | 19,89 GiB |

Según el autor, esta versión es 1,52 veces más rápida que la densa bf16 y usa 1,97 veces menos VRAM. La calidad de salida se comparó con el modelo denso usando el mismo prompt, semilla, scheduler, resolución y número de pasos, obteniendo un error absoluto medio (MAE) de píxeles de 52,94 y un RMSE de 69,64, frente a 55,52 y 72,18 respectivamente para la versión INT4.

No se han publicado resultados de benchmarks estándar como FID o CLIP score en la información disponible.

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell o superior para la versión NVFP4. Hopper no es compatible; en GPUs Turing, Ampere o Ada se debe usar la versión INT4 del mismo repositorio.
- VRAM estimada: 10,07 GiB de pico durante la inferencia a 1024x1024 con 4 pasos, lo que permite ejecutarse en GPUs con 12 GiB o más (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX PRO 4000 Blackwell).
- La versión densa bf16 requiere 19,89 GiB, por lo que no cabe en la mayoría de GPUs de consumo sin offload.
- Opciones de despliegue: compatible con Diffusers y el pipeline `Flux2KleinPipeline`; se puede integrar en servidores con vLLM o TGI si se adapta, aunque la documentación no menciona soporte explícito para esos frameworks.
- Latencia: 1,52 s por imagen (1024x1024, 4 pasos) en RTX PRO 4000 Blackwell; en GPUs más lentas la latencia aumentará proporcionalmente.
- Se requiere el paquete `kernels` de Hugging Face y la variable de entorno `DIFFUSERS_TRUST_REMOTE_KERNELS=true` para cargar el modelo correctamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | VRAM | Latencia (1024x1024, 4 pasos) | Licencia |
| --- | --- | --- | --- | --- | --- |
| Este repositorio (NVFP4 r32) | 2,2B (repo) | NVFP4 SVDQ + BNB4 text encoder | 10,07 GiB | 1,52 s | Apache-2.0 |
| Nunchaku Lite INT4 r32 | 2,2B (repo) | INT4 SVDQ + BNB4 text encoder | 9,96 GiB | 4,93 s | Apache-2.0 |
| FLUX.2 Klein 4B denso bf16 | 4B | Ninguna (bf16) | 19,89 GiB | 2,31 s | Apache-2.0 (según modelo base) |

La comparativa se limita a las variantes del mismo modelo base disponibles en el repositorio. No se dispone de datos para comparar con otros modelos de generación de imágenes como SDXL o SD3 en términos de rendimiento, ya que no se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- Requiere hardware específico: la versión NVFP4 solo funciona en GPUs Blackwell o superiores; en GPUs más antiguas (Turing, Ampere, Ada) es necesario usar la versión INT4, que es significativamente más lenta (4,93 s frente a 1,52 s).
- Dependencia de paquetes externos: es imprescindible instalar el paquete `kernels` de Hugging Face y definir `DIFFUSERS_TRUST_REMOTE_KERNELS=true`, lo que puede complicar el despliegue en entornos con políticas de seguridad restrictivas.
- Pérdida de calidad respecto al modelo denso: aunque el MAE de 52,94 es aceptable, hay una degradación visible en los detalles finos; se recomienda validar la salida en casos de uso donde la fidelidad sea crítica.
- Sin soporte para fusión QKV: las proyecciones QKV no están fusionadas, lo que reduce la velocidad de inferencia en comparación con implementaciones optimizadas.
- Idiomas no documentados: no se especifican los idiomas soportados; el modelo base FLUX.2 Klein 4B probablemente esté optimizado para inglés, y el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinaciones visuales: como cualquier modelo de difusión, puede generar objetos o texto incoherente en la imagen, especialmente con prompts ambiguos o poco detallados.
- La calibración se realizó con solo 128 prompts y 4 pasos a 1024x1024; el rendimiento con otros schedulers, resoluciones o pasos puede variar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lite-infer/flux.2-klein-4b-nunchaku-lite-nvfp4_r32-bnb4-text-encoder
- Herramienta de cuantización diffuse-compressor: https://github.com/rootonchair/diffuse-compressor
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Documentación de Diffusers (Flux2KleinPipeline): https://huggingface.co/docs/diffusers/api/pipelines/flux2
