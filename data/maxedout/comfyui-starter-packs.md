# MaxedOut/ComfyUI-Starter-Packs

## Resumen

ComfyUI-Starter-Packs es un repositorio de recursos curado por el usuario MaxedOut que reúne en un solo lugar los modelos esenciales para trabajar con ComfyUI, el popular editor de generacion de imagenes por nodos. No es un modelo de IA en si mismo, sino un vault de pesos preentrenados, controlnets, LoRAs, VAE, upscalers y herramientas de restauracion facial, organizados en una estructura de directorios lista para copiar directamente en la carpeta `models` de ComfyUI. El repositorio ocupa 612,7 GB y contiene mas de 60 archivos.

El pack cubre tres familias principales de modelos de difusion: FLUX.1 (dev, schnell, kontext, krea y variantes con controlnets de canny, depth y fill), SDXL (base, inpainting y checkpoints derivados) y Wan2.2 para generacion de video texto-a-video con LoRAs de aceleracion Lightning. Incluye ademas herramientas auxiliares como ADetailer (deteccion de rostros y manos), GFPGAN y CodeFormer para restauracion facial, y modelos de upscaling como RealESRGAN y 4x-UltraSharp.

La relevancia de este repositorio radica en que elimina la friccion de buscar modelos dispersos en Hugging Face, proporcionando una coleccion verificada y probada para usuarios de ComfyUI, tanto novatos como avanzados. Su popularidad se refleja en las 6963 descargas y 301 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de modelos: FLUX.1 (transformer de difusion), SDXL (UNet), Wan2.2 (UNet de video) |
| Parametros totales | 4.762.310.656 (corresponde al archivo `sd_xl_base_1.0.safetensors`; el repositorio completo contiene modelos de 0,5 B a 14 B de parametros) |
| Parametros activos | no disponible (no es un modelo unico) |
| Longitud de contexto | no aplica (modelos de difusion de imagenes, sin contexto de texto) |
| Tipos de cuantizacion | FP8, FP16, GGUF (Q3_K_M, Q4_K_M, Q5_K_M, Q5_K_S, Q6_K, Q4_0, Q5_0), FP4 (Nunchaku) |
| Idiomas soportados | ingles (los textos de la model card), los modelos de difusion aceptan prompts en ingles |
| Licencia | other (depende de cada modelo individual; FLUX.1-dev tiene licencia no comercial, SDXL es Apache 2.0, Wan2.2 tiene licencia propia) |
| Formato de pesos | safetensors, GGUF, .pt, .pth |

## Arquitectura y entrenamiento

Al ser un repositorio de modelos, no existe una arquitectura unica. Los componentes principales son:

- **FLUX.1**: arquitectura de difusion de flujo (flow matching) basada en transformer, con un codificador de texto dual (CLIP-L y T5-XXL). Las variantes incluyen controlnets (canny, depth, fill), LoRAs de estilo (Krea, Navi) y modelos de identidad (PuLID). Se incluyen versiones cuantizadas en FP8 y GGUF para reducir requisitos de memoria.
- **SDXL**: UNet de difusion latente de 3.5 B parametros con codificador dual (CLIP ViT-L y OpenCLIP ViT-G). Incluye checkpoints base, variantes de inpainting y controlnets (canny, depth, openpose).
- **Wan2.2**: UNet de difusion para video de 14 B parametros con codificador UMT5-XXL. Se incluyen dos modelos de ruido (high/low) para el proceso de generacion de video y LoRAs Lightning para reduccion de pasos.

Los modelos no fueron entrenados por el autor del repositorio; son pesos preentrenados de terceros organizados y verificados para funcionar correctamente en ComfyUI.

## Capacidades

- **Generacion de imagenes**: los modelos FLUX.1 dev y schnell, SDXL base y derivados (Hyper3d, SDXL-6-Real-Dream) permiten generar imagenes fotorrealistas o artisticas desde prompts de texto.
- **Control fino con ControlNet**: controlnets de canny, depth y openpose para SDXL y FLUX permiten condicionar la generacion con mapas de bordes, mapas de profundidad o esqueletos de pose.
- **Inpainting**: modelos `fill` de FLUX y `Inpainting-Hyper3d` para editar regiones especificas de una imagen.
- **Edicion estilistica**: LoRAs como `Flux_Krea_Schnell_LoRA` y `navi_flux_v1` modifican el estilo de salida; el modelo `flux1-redux-dev` permite transferencia de estilo a partir de una imagen de referencia.
- **Generacion de video**: Wan2.2 text-to-video con dos etapas de ruido (alto y bajo) para generacion de clips de video a partir de texto.
- **Restauracion facial**: GFPGAN y CodeFormer para corregir rostros degradados en imagenes generadas o antiguas.
- **Upscaling**: RealESRGAN x2plus y 4x-UltraSharp para aumentar resolucion de imagenes generadas.
- **Deteccion de rostros y manos**: modelos YOLOv8m (face) y YOLOv8s (hand) para ADetailer, permiten segmentar y mejorar regiones especificas.
- **Segmentacion**: SAM ViT-B para segmentacion de objetos en imagenes.
- **Compatibilidad con ComfyUI**: los modelos estan organizados en carpetas que coinciden con la estructura de directorios de ComfyUI (`unet`, `vae`, `clip`, `controlnet`, `loras`, etc.), facilitando la integracion directa.

## Casos de uso

- **Puesta en marcha rapida de ComfyUI**: un desarrollador novato puede descargar el repositorio completo y copiar las carpetas en su instalacion de ComfyUI, evitando la busqueda individual de modelos. Es util para talleres y formaciones.
- **Generacion de imagenes de producto**: con FLUX.1 dev o SDXL base se pueden generar imagenes de catalogo a partir de prompts descriptivos, con control de composicion mediante controlnets de canny o depth.
- **Edicion de fotos con inpainting**: usar `flux1-fill-dev` o `Inpainting-Hyper3d` para eliminar objetos no deseados, cambiar fondos o reparar areas danadas en fotografias de forma automatica.
- **Restauracion de fotografias antiguas**: aplicar GFPGAN o CodeFormer sobre imagenes escaneadas para mejorar la calidad de rostos y detalles, seguido de un upscale con RealESRGAN.
- **Generacion de video corto para redes sociales**: con Wan2.2, un creador de contenido puede generar clips de 5-10 segundos a partir de una imagen de referencia y una descripcion textual, con los LoRAs Lightning para reducir el tiempo de inferencia.
- **Creacion de assets para videojuegos**: usar SDXL con controlnets de openpose para generar conceptos de personajes en poses especificas, y luego mejorar los detalles con ADetailer y upscalers.
- **Automatizacion de flujos de trabajo en produccion**: los modelos cuantizados en GGUF (Q4_K_M) permiten ejecutar FLUX.1 dev en GPUs de consumo como la RTX 3090, integrando ComfyUI en pipelines de generacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un repositorio de modelos, el rendimiento depende del modelo concreto que se utilice. Para FLUX.1 dev, se sabe que la generacion de una imagen 1024x1024 requiere alrededor de 28 pasos de inferencia, y con las cuantizaciones GGUF Q4_K_M se reduce significativamente el uso de VRAM en comparacion con la version FP16. Para Wan2.2, los LoRAs Lightning permiten generar un video en 4 pasos en lugar de los 50 habituales, pero no hay metricas de calidad publicadas en la informacion del repositorio.

## Requisitos de hardware

Los requisitos dependen del modelo concreto que se use:

- **FLUX.1 dev en FP16**: requiere al menos 24 GB de VRAM (recomendado RTX 4090, A6000 o A100). Con cuantizacion FP8 se reduce a ~16 GB, y con GGUF Q4_K_M a ~10 GB, permitiendo ejecutarse en una RTX 3080/3090.
- **FLUX.1 dev con Nunchaku (FP4)**: se puede ejecutar en GPU de consumo con 12 GB de VRAM, aunque requiere la extension Nunchaku de ComfyUI.
- **SDXL base**: requiere ~8 GB de VRAM en FP16, y ~5 GB en FP8. Se puede ejecutar en RTX 3060 o superior.
- **Wan2.2 14B**: requiere ~32 GB de VRAM en FP16; con FP8 se reduce a ~16 GB. Es recomendable una GPU profesional como A100 o H100, aunque con cuantizacion GGUF Q4_K_M podria ejecutarse en una RTX 4090 con 24 GB.
- **Upscalers y restauradores**: los modelos de upscaling (RealESRGAN) y restauracion facial (GFPGAN, CodeFormer) son ligeros y se ejecutan en cualquier GPU con 4 GB de VRAM o incluso en CPU.

Para el despliegue, los modelos son compatibles con ComfyUI, que ofrece su propio servidor de API. Tambien se pueden usar con herramientas como `ComfyUI-MaxedOut` (repositorio del mismo autor) que automatiza la carga de modelos. No se recomienda vLLM ni Ollama para estos modelos de difusion.

## Comparativa con modelos similares

Este repositorio no tiene un modelo comparable directo, pero se puede comparar con otras colecciones de modelos para ComfyUI:

| Repositorio | Contenido | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| **ComfyUI-Starter-Packs** (este) | FLUX.1, SDXL, Wan2.2, controlnets, upscalers, restauracion | 612 GB | Mixta (other) | Publico en Hugging Face |
| **ComfyUI-Auto-Installer-Assets** | Modelos base para ComfyUI (FLUX, SDXL) | ~50 GB | Mixta | Publico |
| **BlackForestLabs/FLUX.1-dev** | Modelo FLUX.1 dev oficial | ~32 GB (FP16) | FLUX.1-dev Non-Commercial | Publico con restricciones |
| **StabilityAI/stable-diffusion-xl-base-1.0** | Modelo SDXL base oficial | ~7 GB | Apache 2.0 | Publico |

La ventaja del repositorio de MaxedOut es que ya incluye los modelos cuantizados (GGUF, FP8) y los controlnets necesarios para uso productivo, mientras que los repositorios oficiales solo ofrecen los pesos base.

## Limitaciones y advertencias

- **Licencia "other"**: la licencia del repositorio no esta claramente definida. Los modelos individuales tienen licencias propias: FLUX.1 dev tiene una licencia no comercial, SDXL es Apache 2.0, y Wan2.2 tiene su propia licencia. Es imprescindible revisar la licencia de cada modelo antes de usarlo en produccion.
- **Tamano del repositorio**: 612 GB de descarga, lo que requiere un ancho de banda y espacio en disco considerable. No se recomienda descargar el repositorio completo si solo se necesita un subconjunto de modelos.
- **Sesgos y alucinaciones**: como cualquier modelo de difusion, los modelos incluidos pueden generar imagenes con sesgos de genero, raza o contenido estereotipado, y pueden alucinar detalles en imagenes complejas (especialmente rostos y manos).
- **Actualizacion y mantenimiento**: el repositorio se actualiza de forma irregular; la ultima actualizacion fue en febrero de 2026, pero no hay garantias de mantenimiento continuo.
- **Uso comercial**: algunos modelos (FLUX.1 dev) tienen restricciones de uso comercial. Para uso comercial, se debe usar FLUX.1 schnell (licencia Apache 2.0) o SDXL base.
- **Compatibilidad**: las versiones cuantizadas en GGUF requieren la instalacion de extensiones especificas en ComfyUI (por ejemplo, `ComfyUI-GGUF`). Sin ellas, los archivos no se cargaran.

## Enlaces

- [Hugging Face - MaxedOut/ComfyUI-Starter-Packs](https://huggingface.co/MaxedOut/ComfyUI-Starter-Packs)
- [GitHub - ComfyUI-MaxedOut](https://github.com/Maxed-Out-99/ComfyUI-MaxedOut)
- [Video: "If You're Struggling With ComfyUI, Watch This First"](https://youtu.be/mht9Bg6lCL8?feature=shared)
- [Patreon - Free Workflow & Guide](https://www.patreon.com/posts/flux-level-1-and-131945103?utm_medium=clipboard_copy&utm_source=copyLink&utm_)
- [Analisis en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/comfyui-starter-packs-maxedout)
