# BennyDaBall/flux-3-image-klein-base-NVFP4

## Resumen

Este repositorio contiene una construcción NVFP4 de precisión mixta de FLUX 3 Image Klein Base, el modelo de generación de imágenes de Black Forest Labs. El autor, BennyDaBall, ha re-cuantizado los pesos originales en BF16 a un formato combinado NVFP4 (FP4 de 4 bits con escalas de bloque) + 8 bits (formato INT8 ConvRot) + bf16 para las capas pequeñas de embedding y modulación, con el objetivo de reducir el tamaño del fichero y acelerar la inferencia en GPUs NVIDIA Blackwell sin sacrificar fidelidad respecto al modelo original.

La motivación del proyecto es clara: la cuantización NVFP4 oficial de BFL degrada notablemente la calidad de imagen (LPIPS medio de 0.136 frente a BF16), mientras que esta construcción comunitaria logra 2.8 veces menos error medio (LPIPS de 0.049) usando técnicas de cuantización post-entrenamiento como GPTQ con búsqueda de escalas mediante Schur Replay. El resultado es un fichero de 5,71 GB pensado para ComfyUI, que se ejecuta como drop-in replacement del modelo original sin cambiar el workflow.

Es relevante ahora porque las GPUs de la serie RTX 50 (arquitectura Blackwell) soportan nativamente cómputo FP4, y las cuantizaciones de 4 bits permiten ejecutar modelos de difusión grandes en tarjetas de consumo con VRAM limitada manteniendo velocidad competitiva. La adopción es aún minoritaria (19 descargas y 2 likes en el momento de redactar la ficha), pero la metodología documentada es de interés técnico para la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de FLUX 3 Image Klein Base, cuantizado post-entrenamiento |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (usa text encoder Qwen3-VL 4B en bf16) |
| Tipos de cuantizacion | NVFP4 (W4A4, escalas de activación estáticas) + INT8 ConvRot + bf16 (precisión mixta por capa) |
| Idiomas soportados | en (prompts; el text encoder subyacente es multilingue, pero no esta documentado) |
| Licencia | flux-kommunity-license (other) |
| Formato de pesos | safetensors (single-file, formato diffusion-single-file para ComfyUI) |

Datos adicionales: tamaño del fichero 5,71 GB (5.712.184.969 bytes), tamaño del repositorio 5,7 GB, pipeline text-to-image.

## Arquitectura y entrenamiento

El modelo base es FLUX 3 Image Klein Base de Black Forest Labs, un modelo de difusión de tipo DiT (transformer de difusión) para texto a imagen. Este repositorio no entrena nada: es una cuantización post-entrenamiento (PTQ) del modelo original en BF16. La construcción mezcla tres precisiones por capa: los bloques principales en NVFP4 (W4A4, con escalas de activación estáticas calibradas sobre las trayectorias propias del sampler de Klein), capas sensibles en 8 bits en el formato INT8 ConvRot de BFL (con sus marcadores de atención int8), y bf16 para las capas pequeñas de embedding y modulación. La selección de qué capas permanecen en 8 bits se hizo midiendo el daño en calidad por milisegundo ganado, mediante escaneos de sensibilidad por capa con captions de validación.

Los pesos NVFP4 se resolvieron con GPTQ (Frantar et al., 2022) integrando la búsqueda de escala de bloque Schur Replay (arXiv 2609.36654), cuyo conjunto de candidatos incluye los puntos Four Over Six (arXiv 2512.02010, MIT Han Lab y NVIDIA). Ambos trabajos se evaluaron originalmente sobre modelos de lenguaje; su aplicación a un DiT es una integración propia del autor. Las capas de 8 bits se re-cuantizaron desde BF16 con GPTQ en la base rotada ConvRot, reduciendo el error de pesos de esas capas unas 10 veces frente a round-to-nearest. La calibración usó 24 captions x 11 de los 50 pasos del sampler, ambas ramas CFG, a 1024x1024; las captions del conjunto de evaluación nunca se usaron para calibrar. No se dispone de datos del entrenamiento original del modelo base en la información proporcionada.

## Capacidades

- Generacion de texto a imagen a 1024x1024 (y otras resoluciones como 1936x1088 en 16:9), con el mismo comportamiento que el modelo base en BF16 salvo un pequeño margen de error de cuantización.
- Representacion fiel del texto dentro de las imágenes: en pruebas de lectura letra a letra por lectores humanos, acierta 76 de 78 cadenas, igual que la versión INT8 de BFL y una menos que BF16.
- Compatibilidad total con el workflow estándar de ComfyUI para Klein Base: mismo text encoder (qwen3vl_4b_bf16), mismo VAE y mismos ajustes de sampler; solo cambia el nombre del fichero en el nodo Load Diffusion Model.
- Metadatos de cuantización por capa en el campo `comfy_quant` del fichero, útiles para auditoría y depuración.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de difusión para generación de imágenes, no un LLM.

## Casos de uso

- Generacion de imágenes en GPUs de consumo con VRAM limitada: con 16,3 GiB de VRAM pico (incluyendo escritorio), cabe en una RTX 5080 de 16 GB, permitiendo generar a 1024x1024 sin offloading.
- Produccion de imágenes a alta velocidad en RTX 5090: 8,57 segundos por imagen a 1024x1024 con 50 pasos, un 2,2% más rápido que la versión INT8 ConvRot de BFL y un 7,0% más rápido que la NVFP4 oficial.
- Workflows de ComfyUI existentes sin migración: al ser un drop-in replacement, cualquier pipeline que ya use Klein Base puede sustituir el fichero sin tocar el grafo, el text encoder ni el sampler.
- Generacion por lotes con calidad controlada: la cercanía a BF16 (SSIM 0,940, LPIPS medio 0,049) permite usarlo en pipelines de generación masiva donde la versión NVFP4 oficial introduciría deriva visible.
- Renderizado de texto en imágenes (carteles, logos, mockups): la prueba de lectura de texto indica fidelidad casi idéntica a BF16 en la representación de cadenas citadas en el prompt.
- Experimentacion en cuantización de modelos de difusión: el README documenta la metodología completa (GPTQ, Schur Replay, Four Over Six, escaneo de sensibilidad por capa), útil como referencia para quien quiera replicar el proceso en otros DiT.
- Generacion en formato 16:9 para contenido audiovisual: las pruebas a 1936x1088 confirman funcionamiento consistente en resoluciones distintas de 1024x1024.

## Benchmarks y rendimiento

Datos medidos por el autor en RTX 5090, ComfyUI 0.42.3, torch 2.14.0 + CUDA 13.0, 1024x1024, 50 pasos, CFG 3.5, euler/simple. Conjunto de evaluación: 16 captions x 6 seeds = 96 renders por fichero, comparados contra BF16 con la misma caption y seed.

| Fichero | Tamaño | LPIPS vs BF16 (media / mediana) | SSIM | s/img | VRAM pico |
|---|---:|---:|---:|---:|---:|
| BF16 (BFL) | 11,08 GB | referencia | 1 | 20,13 | 20,9 GiB |
| INT8 ConvRot (BFL) | 5,81 GB | 0,034 / 0,021 | 0,958 | 8,76 | 16,4 GiB |
| NVFP4 (BFL) | 5,26 GB | 0,136 / 0,114 | 0,845 | 9,21 | 16,1 GiB |
| **NVFP4 (este repo)** | **5,71 GB** | **0,049 / 0,023** | **0,940** | **8,57** | **16,3 GiB** |

Conclusiones del autor sobre estos datos: esta construcción es más cercana a BF16 que la NVFP4 de BFL en 91 de 96 imágenes (2,8 veces menos LPIPS medio, 5,0 veces menos mediana); INT8 ConvRot sigue siendo más cercana a BF16 en la mayoría de imágenes (65 de 96), pero es un 2,2% más lenta. En la prueba de texto dentro de imágenes: BF16 75/78, INT8 76/78, esta construcción 76/78, NVFP4 de BFL 78/78. No hay benchmarks estandarizados (FID, CLIP score, etc.) ni comparaciones con otros modelos de difusión.

## Requisitos de hardware

- VRAM: unos 16,3 GiB de VRAM pico medidos a 1024x1024 (incluyendo ~3 GiB de uso de escritorio); BF16 necesita 20,9 GiB, así que la cuantización ahorra unos 4,6 GiB.
- GPU: obligatoria una NVIDIA Blackwell para aprovechar el cómputo FP4 (RTX 50 series o RTX PRO Blackwell). Medido en RTX 5090. En GPUs anteriores, los tensores NVFP4 no obtendrán el speed-up de FP4 y probablemente no funcionen correctamente con este fichero.
- Consumer GPUs: cabe en una RTX 5080 (16 GB) o superior; la RTX 5090 (32 GB) es la configuración de referencia del autor. En tarjetas de 12 GB no hay datos disponibles.
- Software: ComfyUI 0.42.3 o compatible, comfy-kitchen 0.2.40, torch 2.14.0 + CUDA 13.0, lanzado con `--use-ck-attention` (atención int8 de Comfy Kitchen) según el setup de pruebas del autor.
- Despliegue: ComfyUI es el entorno documentado (formato diffusion-single-file, carpeta `ComfyUI/models/diffusion_models/`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicables a un DiT de difusión de todos modos, salvo wrappers específicos).
- Rendimiento: 8,57 segundos por imagen a 1024x1024 con 50 pasos en RTX 5090 (mediana cálida de 5 ejecuciones).

## Comparativa con modelos similares

Comparativa entre las variantes cuantizadas del mismo modelo base disponibles según el README (no es una comparativa entre modelos distintos, sino entre builds del mismo modelo):

| Variante | Tamaño | Fidelidad vs BF16 | Velocidad (RTX 5090) | VRAM pico | Notas |
|---|---:|---|---:|---:|---|
| BF16 (BFL) | 11,08 GB | referencia | 20,13 s/img | 20,9 GiB | Máxima calidad, requiere GPUs de gama alta |
| INT8 ConvRot (BFL) | 5,81 GB | LPIPS 0,034 (la más fiel cuantizada) | 8,76 s/img | 16,4 GiB | Buen equilibrio calidad/velocidad |
| NVFP4 (BFL) | 5,26 GB | LPIPS 0,136 (deriva visible) | 9,21 s/img | 16,1 GiB | La más rápida no lo es: 5,2% más lenta que INT8 en este setup |
| NVFP4 (este repo) | 5,71 GB | LPIPS 0,049 | 8,57 s/img | 16,3 GiB | La más rápida y mucho más fiel que la NVFP4 oficial |

Alternativas de la misma categoría (text-to-image cuantizado para consumo) como SDXL, Flux.1 Dev o Stable Diffusion 3.5: no disponible, no hay datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Requiere GPU NVIDIA Blackwell: en tarjetas RTX 30/40 o anteriores no se obtiene el speed-up FP4 y el fichero puede no funcionar; no hay datos de compatibilidad.
- La deriva respecto a BF16 existe: aunque mucho menor que la NVFP4 oficial, algunas imágenes concretas (por ejemplo, la del terrier en la hoja de comparación) derivan más en todos los ficheros cuantizados.
- La versión INT8 ConvRot de BFL es más fiel a BF16 en la mayoría de imágenes (65 de 96); si la prioridad absoluta es fidelidad y no velocidad, esa variante puede preferirse.
- Licencia flux-kommunity-license: se trata de una licencia "other" con restricciones propias de Black Forest Labs; conviene revisar los términos para uso comercial antes de desplegar en producción. No hay datos sobre los términos exactos en la información proporcionada.
- Proyecto comunitario de un solo autor: 19 descargas y 2 likes en el momento de la ficha, sin auditoría independiente de los resultados; las métricas provienen del propio autor con metodología documentada pero no verificada por terceros.
- BFL recomienda su prompt upsampler y salida a 2K para mejores resultados; las pruebas del autor se hicieron sin upsampler, por lo que los números de calidad pueden diferir del uso recomendado por BFL.
- Riesgo de alucinación visual típico de modelos de difusión: anatomía incorrecta, texto estilizado erróneo (documentado: una "i" en tiza estilizada que falla también en BF16 e INT8) y ausencia ocasional de espacios en el texto renderizado.
- Soporte de idiomas de los prompts: la model card declara solo inglés; no hay datos sobre comportamiento con prompts en castellano.

## Enlaces

- Modelo cuantizado (este repo): https://huggingface.co/BennyDaBall/flux-3-image-klein-base-NVFP4
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Paper Schur Replay: https://arxiv.org/abs/2609.36654
- Paper Four Over Six (MIT Han Lab y NVIDIA): https://arxiv.org/abs/2512.02010
- Paper GPTQ (Frantar et al., 2022): no disponible enlace directo en la información proporcionada
- Licencia: LICENSE.md en el repositorio (flux-kommunity-license)
