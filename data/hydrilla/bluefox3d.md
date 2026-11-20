# Hydrilla/BlueFox3D

## Resumen

BlueFox3D 1.0 es un modelo de generación 3D image-to-3D desarrollado por Hydrilla que produce mallas 3D texturizadas con mapas PBR (base color, metallic, roughness y alpha) a partir de una única imagen o de varias vistas con pose conocida. El modelo eleva características de píxel a 3D mediante retroproyección, apoyándose en la arquitectura Pixal3D / TRELLIS.2 y en un backbone de 1.300 millones de parámetros organizado como cascada de flow matching en tres etapas.

La relevancia del modelo reside en su eficiencia de despliegue: completa la generación a resolución 1536 en GPUs de 24 GB (NVIDIA L4, RTX 3090, RTX 4090) mediante el flag `--low_vram`, con un tiempo medio de 4,2 minutos por activo en una L4. Frente a alternativas como TRELLIS.2-4B o Hunyuan3D-2.1, ofrece tiempos de ejecución notablemente menores manteniendo mapas PBR de 2048 y fidelidad de color respecto a la imagen de entrada.

El repositorio ocupa 46 GB e incluye los pesos de la cascada completa, junto con un pack experimental de ajuste fino orientado a personajes (`Hydrilla/BlueFox3D-retrained-characters`). La licencia es MIT, lo que facilita su adopción en flujos de producción comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de flow matching en 3 etapas (sparse structure, shape SLat, texture SLat) sobre arquitectura Pixal3D / TRELLIS.2 |
| Parametros totales | 1.300 millones (1.3B) por etapa de la cascada |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación 3D, no de texto) |
| Tipos de cuantizacion | No disponible; los checkpoints se distribuyen en bf16 y fp16 |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoints bf16/fp16 (cascada `1536_cascade`); salida en GLB con mapas PBR 2048 |

## Arquitectura y entrenamiento

BlueFox3D emplea una cascada de flow matching en tres etapas. La primera, *sparse structure* a resolución 64, usa `ss_flow_img_dit_1_3B_64_bf16` junto con el decodificador `ss_dec_conv3d_16l8_fp16`. La segunda etapa, *shape SLat*, opera a 512 y 1024 con `slat_flow_img2shape_dit_1_3B_{512,1024}_bf16` y el decodificador `shape_dec_next_dc_f16c32_fp16`. La tercera, *texture SLat* a 1024, emplea `slat_flow_imgshape2tex_dit_1_3B_1024_bf16` y `tex_dec_next_dc_f16c32_fp16`. Cada etapa es un Diffusion Transformer (DiT) de 1.3B parámetros.

El acondicionamiento de imagen se realiza con DINOv3 (`facebook/dinov3-vitl16-pretrain-lvd1689m`), estimación de cámara con MoGe-2 y eliminación de fondo con BiRefNet. La innovación principal es el *pixel-aligned lifting*: las características de píxel se retroproyectan al espacio 3D, lo que preserva la fidelidad de color de la imagen de entrada. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de mallas 3D texturizadas con mapas PBR completos (base color, metallic, roughness, alpha) a resolución 2048.
- Generación a partir de una única imagen (`inference.py`) o de múltiples vistas con pose (`inference_mv.py`, formato `transforms.json` de Blender/NeRF).
- Estimación automática de cámara (MoGe-2) y eliminación de fondo (BiRefNet) en el pipeline de entrada.
- Producción de geometría de alta densidad: media de 199.836 vértices y 214.576 caras por activo en el benchmark de 15 imágenes.
- Exportación directa a GLB, lista para motores de render y visores web.
- Soporte de resolución configurable hasta 1536 mediante el flag `--resolution`.
- Modo de bajo consumo de VRAM (`--low_vram`) con offloading de etapas a CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- **Prototipado rápido de assets para videojuegos:** a partir de un concept art o una captura, el modelo genera en unos 4 minutos una malla con PBR que puede importarse directamente en Unity o Unreal como bloqueo inicial, reduciendo el ciclo de modelado manual.
- **Catálogos de e-commerce en 3D:** convertir fotografías de producto en modelos 3D texturizados permite ofrecer vistas interactivas en tiendas online; la preservación de color de los mapas PBR de 2048 es adecuada para representar fielmente materiales como metal o tela.
- **Generación de assets para realidad aumentada:** el tamaño contenido de los GLB (media de 11,3 MB) y la exportación estándar facilitan su uso en experiencias AR móviles sin recompresión agresiva.
- **Escaneo y reconstrucción con múltiples vistas:** con `inference_mv.py` y un conjunto de imágenes con pose, el modelo reconstruye objetos con mayor cobertura geométrica, útil en digitalización de patrimonio o inventario físico.
- **Pipelines de previsualización en estudios de animación:** generar mallas de bloqueo para personajes y decorados a partir de bocetos permite iterar sobre la composición de escenas antes de la producción final; el pack de personajes experimental puede explorarse para este fin.
- **Investigación en generación 3D:** al ser MIT y estar construido sobre TRELLIS.2, sirve como base reproducible para experimentos de flow matching aplicado a 3D, con tiempos de ejecución manejables en una sola GPU de 24 GB.

## Benchmarks y rendimiento

Benchmark de 15 imágenes de pesos abiertos, ejecutado en una única NVIDIA L4 (24 GB VRAM), semilla 42:

| Modelo | Checkpoint | Completados | Tiempo medio / activo | Vértices medios | Caras medias | Tamano GLB medio | Tipo de salida |
|---|---|---:|---:|---:|---:|---:|---|
| BlueFox3D (stock) | Hydrilla/BlueFox3D | 15/15 | 4,2 min (254 s) | 199.836 | 214.576 | 11,3 MB | PBR 2048 |
| BlueFox3D (pack personajes) | Hydrilla/BlueFox3D-retrained-characters | 15/15 | 4,4 min (266 s) | 203.623 | 214.524 | 11,7 MB | PBR 2048 |
| TRELLIS.2-4B | microsoft/TRELLIS.2-4B | 15/15 | 9,4 min (564 s) | 219.553 | 239.819 | 19,7 MB | PBR 2048 |
| Hunyuan3D-2.1 | tencent/Hunyuan3D-2.1 | 15/15 | 11,8 min (709 s) | 31.939 | 40.000 | 6,2 MB | Malla pintada (remesh 40k) |
| Hi3DGen | Stable-X/trellis-normal-v0-1 | 15/15 | 1,5 min (88 s) | 426.673 | 853.476 | 19,5 MB | Malla clay (sin PBR) |

Comparativa de variantes de BlueFox3D sobre `21_img.png` (semilla 42, resolución 1536, `--low_vram`):

| Repositorio | Cambio | Vértices | Caras | Tamano GLB | Estado |
|---|---|---:|---:|---:|---|
| Hydrilla/BlueFox3D | Cascada stock 1.3B de 3 etapas | 211.389 | 246.891 | 14,0 MB | Predeterminado recomendado |
| Hydrilla/BlueFox3D-retrained-characters | Pack L4 de 4 etapas (SS-64, shape-512, shape-1024, tex-1024) | 197.039 | 236.397 | 13,2 MB | Experimental |

No se han publicado puntuaciones Chamfer, CLIP ni FID en la información disponible.

## Requisitos de hardware

- **VRAM:** 24 GB son suficientes para la resolución 1536 con `--low_vram`; 40 GB o más permiten ejecutar sin offloading para mayor velocidad.
- **GPUs de 24 GB soportadas:** NVIDIA L4, RTX 3090, RTX 4090.
- **GPUs de 40 GB o más:** A100 y H100, sin necesidad de `--low_vram`.
- **Cabe en GPU de consumo:** sí, en RTX 3090 y RTX 4090 mediante `--low_vram`.
- **Latencia:** media de 4,2 minutos por activo en caliente y 6-9 minutos en ejecución CLI en frío sobre una L4 a resolución 1536.
- **Despliegue:** scripts `inference.py` e `inference_mv.py` del repositorio `HydrillaAI/Bluefox3D`; requiere extensiones CUDA de TRELLIS.2 (`FlexGEMM`, `o_voxel`, `flash-attn`, `nvdiffrast`) y `huggingface_hub>=0.34,<1.0`.
- **Dependencias de red:** descarga de pesos DINOv3, MoGe-2 y BiRefNet además de los checkpoints de la cascada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Tiempo en L4 | PBR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BlueFox3D 1.0 | 1,3B por etapa | 1536 | 4,2 min | Sí, 2048 | MIT | Hugging Face + GitHub |
| TRELLIS.2-4B | 4B | No disponible | 9,4 min | Sí, 2048 | No disponible en la información | Hugging Face (microsoft) |
| Hunyuan3D-2.1 | No disponible | No disponible | 11,8 min | Malla pintada, remesh 40k | No disponible en la información | Hugging Face (tencent) |
| Hi3DGen | No disponible | No disponible | 1,5 min | No (malla clay) | No disponible en la información | Hugging Face (Stable-X) |

BlueFox3D es la opción más rápida entre los modelos con PBR completo y la de menor tamaño de GLB medio con texturas de 2048. Hi3DGen es más rápido y genera geometría más densa, pero requiere un paso separado de texturizado. Hunyuan3D-2.1 produce mallas mucho más ligeras pero con menor detalle geométrico y fallos observados en el benchmark.

## Limitaciones y advertencias

- Se observaron artefactos geométricos concretos: un bastón espurio en `21_img`, una losa de base en `5_img` y fragmentos de alfombra en `s_18_img`.
- El pack de personajes es experimental: reproduce los artefactos del modelo stock y fragmentó peor en la comprobación aislada de `21_img`; no es un reemplazo directo de calidad.
- La eliminación de fondo con BiRefNet puede eliminar objetos relevantes en escenas complejas, como ocurrió en `s_18_img` de la comparativa con Hunyuan3D-2.1.
- No se han publicado métricas objetivas de calidad geométrica (Chamfer, FID, CLIP); la evaluación disponible es cualitativa y basada en conteos de malla y tiempos.
- El modelo no procesa lenguaje natural ni soporta tool calling, por lo que no es adecuado para tareas de texto, razonamiento o agentes.
- La resolución máxima documentada es 1536; no se dispone de datos sobre comportamiento a resoluciones superiores.
- El repositorio ocupa 46 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para la descarga inicial.
- Aunque la licencia es MIT, el modelo incorpora componentes de terceros (Pixal3D, TRELLIS.2, DINOv3, MoGe-2, BiRefNet) cuyas condiciones deben revisarse en el fichero NOTICE antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hydrilla/BlueFox3D
- Pack experimental de personajes: https://huggingface.co/Hydrilla/BlueFox3D-retrained-characters
- Repositorio de codigo y scripts de entrenamiento: https://github.com/HydrillaAI/Bluefox3D
- Model card del autor: https://hydrilla.ai/research#model-card
- TRELLIS.2 (Microsoft): https://github.com/microsoft/TRELLIS.2
- Paper Pixal3D: https://arxiv.org/abs/2605.10922
- DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- TRELLIS.2-4B: https://huggingface.co/microsoft/TRELLIS.2-4B
- Hunyuan3D-2.1: https://huggingface.co/tencent/Hunyuan3D-2.1
- Hi3DGen: https://huggingface.co/Stable-X/trellis-normal-v0-1
