# AdwolfCzar/krea2-tile-controllora

## Resumen

Krea 2 Tile / Blur / Restore Control LoRA es un adaptador de tipo Control LoRA (concatenación de canales) para el modelo generativo de imágenes Krea 2, desarrollado por el usuario AdwolfCzar sobre el checkpoint base `krea/Krea-2-Raw`. El adaptador está especializado en tareas de tile, desenfoque, hires-fix/upscale y restauración de imágenes degradadas, incluyendo la eliminación del patrón de grão y tiling característico de las imágenes generadas por GPT Image. La imagen de control es la propia imagen degradada, y el modelo regenera los detalles preservando estructura, colores y composición.

El adaptador se entrena con LoRA de rango 64 aplicada a todas las capas lineales de los 28 bloques del transformer, más una proyección de control `W_ctrl` de 6144×64 inicializada a cero, sumando aproximadamente 215 millones de parámetros entrenables. El nivel de desenfoque de la imagen de control actúa como un dial de creatividad: a mayor blur, mayor libertad de regeneración. Funciona tanto con prompt como sin él.

En el momento de la publicación, el entrenamiento se encontraba en fase inicial (sin pasos registrados), por lo que no hay checkpoints finales validados ni resultados de benchmarks. El adaptador está pensado para su uso en ComfyUI mediante nodos de la comunidad y se distribuye con licencia "other", lo que exige revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Control LoRA (concatenación de canales) sobre transformer de difusión Krea 2; LoRA rank 64 en todos los lineales de 28 bloques + proyección de control `first.weight` [6144, 128] y `first.bias` |
| Parametros totales | No disponible (aproximadamente 215 M parámetros entrenables según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | Pesos en bf16; el adaptador no contiene tensores fp8 y carga sobre base en Raw, Turbo, fp8 o GGUF |
| Idiomas soportados | No disponible (modelo de imagen; los prompts dependen del modelo base Krea 2) |
| Licencia | other |
| Formato de pesos | safetensors (checkpoint ComfyUI en bf16; estado de entrenamiento en fp32) |

## Arquitectura y entrenamiento

El adaptador sigue la receta de concatenación de canales empleada en Flux.1-Depth-dev-lora (BFL) y en Krea-2-depth-controlnet (Patil). La imagen de control se codifica con el VAE de Krea 2 / Qwen-Image y se concatena al latent de entrada; una proyección `W_ctrl` de 6144×64, inicializada a cero, inyecta esa señal en el transformer. Sobre esa base se aplica una LoRA de rango 64 (alpha = rank) a todas las capas lineales de los 28 bloques del modelo. El checkpoint incluye `first.weight` [6144, 128], donde la mitad corresponde a la proyección original del modelo Raw y la otra mitad a la proyección de control entrenada.

El entrenamiento congela la base en fp8 e4m3 con escala por bloque de 64 y entrena aproximadamente 215 M de parámetros en una única RTX 5090 de 32 GB. Se usa LR 1e-4 para la LoRA y 1e-3 para `W_ctrl` (sin esta tasa mayor el control solo transfiere la paleta de color), warmup de 100 pasos y decaimiento lineal hasta 0,3× entre los pasos 1500 y 2000, con accum 4, batch 1 y resolución de aproximadamente 1 MP en buckets. Los datos combinan danbooru2024 (tags), photo-aesthetics (leyendas naturales) y renders 3D sin leyenda, con 25 % de caption dropout. Las degradaciones aplicadas son: blur gaussiano de 1 a 10 px (30 %), low-res de ×1,5 a ×8 (30 %), cadena Real-ESRGAN (15 %), artefacto GPT (15 %) y limpio (10 %); ninguna degradación altera el color. El código de entrenamiento reside en un repositorio privado (`adbrasi/krea2-tile-controllora`).

## Capacidades

- Restauración de imágenes degradadas: elimina blur, ruido, artefactos de compresión JPEG y el patrón de tiling/grão típico de imágenes generadas por GPT Image.
- Upscale y hires-fix: acepta una imagen ampliada por cualquier método (hasta bicúbico) como control para regenerar detalle a la resolución final.
- Tile-based upscaling: compatible con flujos de Ultimate SD Upscale con tiles de aproximadamente 1 MP, imitando los recortes aleatorios con zoom usados en el entrenamiento.
- Control por nivel de desenfoque como dial de creatividad: más blur en la entrada implica mayor libertad de regeneración; menos blur mantiene la imagen más fiel al original.
- Funcionamiento con y sin prompt: permite restauración puramente guiada por la imagen de control o combinada con instrucciones textuales.
- Preservación de estructura, color y composición: las degradaciones de entrenamiento no alteran el color, por lo que el adaptador no introduce deriva cromática.
- Integración en ComfyUI mediante nodos dedicados (`Krea2 Control LoRA Loader`, `Krea2 Control Image Encode`, `Krea2 Control Apply`).
- Compatibilidad con el modelo base en variantes Raw, Turbo, fp8 y GGUF.
- No soporta tool calling, agentes ni razonamiento multi-step: es un adaptador de imagen, no un modelo de lenguaje.

## Casos de uso

- Restauración de imágenes generadas por GPT Image: se usa la imagen con el patrón de tiling como control y el adaptador regenera el detalle eliminando el artefacto, manteniendo composición y colores originales.
- Upscale de fotografías de baja resolución: se amplía la imagen con bicúbico hasta la resolución objetivo y se pasa como control con denoise 1,0 para que el modelo regenere texturas y bordes con detalle realista.
- Hires-fix en pipelines de generación: tras generar una imagen a baja resolución con Krea 2 Turbo, se reutiliza como control en una segunda pasada para añadir detalle fino sin cambiar la composición.
- Restauración de material de archivo degradado: imágenes con blur gaussiano, ruido o compresión JPEG se procesan con el adaptador para recuperar nitidez, ajustando el nivel de blur del control según la fidelidad deseada.
- Limpieza de renders 3D con artefactos: los renders sin leyenda incluidos en el entrenamiento permiten usar el adaptador para eliminar ruido y bandas en imágenes sintéticas antes de su publicación.
- Tile-based upscaling de imágenes de gran formato: con Ultimate SD Upscale y tiles de aproximadamente 1 MP, se procesan imágenes de alta resolución por regiones, regenerando cada tile de forma coherente con el conjunto.
- Post-procesado en flujos de edición con ComfyUI: integrado como nodo entre la generación y la exportación, permite restaurar y ampliar imágenes dentro del mismo grafo, con denoise ajustable para controlar la fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el entrenamiento estaba iniciando en el momento de la publicación (2026-11-01), sin pasos registrados, por lo que no existen checkpoints finales ni métricas de calidad, FID, PSNR o SSIM que permitan evaluar el rendimiento del adaptador.

## Requisitos de hardware

- VRAM estimada: no disponible de forma independiente; el adaptador se suma al modelo base Krea 2. El entrenamiento se realizó con la base congelada en fp8 e4m3 en una única RTX 5090 de 32 GB, lo que da una referencia del orden de magnitud para inferencia con la base en fp8.
- GPU recomendadas: RTX 5090 (32 GB) validada para entrenamiento; para inferencia se recomienda una GPU con VRAM suficiente para el modelo base Krea 2 en la cuantización elegida (fp8, bf16 o GGUF).
- GPU de consumo: el adaptador en sí es ligero (aproximadamente 215 M parámetros entrenables), pero el requisito real lo marca el modelo base; con la base en GGUF o fp8 podría caber en GPUs de consumo de gama alta, aunque no se especifica en la información disponible.
- Opciones de despliegue: ComfyUI con los nodos `facok/comfyui-krea2-controlnet` o `tori29umai0123/comfyui-krea2-controlnetPlus`; el checkpoint carga sobre Krea 2 en Raw, Turbo, fp8 o GGUF.
- Latencia y throughput: no disponibles. Las muestras se generan en Krea 2 Turbo con 8 pasos, CFG 0 y mu 1,15, pero no se publican tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros entrenables | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea 2 Tile / Blur / Restore Control LoRA (AdwolfCzar) | Control LoRA (concat canales) | krea/Krea-2-Raw | ~215 M | No aplica | other | Hugging Face, entrenamiento inicial |
| Flux.1-Depth-dev-lora (BFL) | Control LoRA (receta de referencia) | Flux.1 | No disponible | No aplica | No disponible | No disponible |
| Krea-2-depth-controlnet (Patil) | ControlNet (receta de referencia) | Krea 2 | No disponible | No aplica | No disponible | No disponible |

No se dispone de datos de rendimiento ni de parámetros detallados de las alternativas citadas como referencia en la model card, por lo que la comparación se limita al enfoque arquitectónico y la licencia.

## Limitaciones y advertencias

- Entrenamiento no finalizado: en la fecha de publicación no había pasos registrados, por lo que no existen checkpoints validados ni garantías de calidad.
- Licencia "other": los términos no están detallados en la información disponible; es imprescindible revisar las condiciones del autor y del modelo base Krea 2 antes de cualquier uso comercial.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere Krea 2 (Raw o Turbo) y el VAE de Krea 2 / Qwen-Image.
- Sesgos de los datos: el entrenamiento usa danbooru2024 (tags), photo-aesthetics y renders 3D, lo que puede introducir sesgos de dominio (ilustración, fotografía estética, 3D) y un rendimiento inferior en otros tipos de imagen.
- Riesgo de alucinación visual: con niveles altos de blur en el control, el adaptador regenera detalle inventado; puede alterar identidades, texto o elementos finos de la imagen original.
- Limitaciones de idioma: no se especifican idiomas soportados para los prompts; dependen del modelo base Krea 2.
- Sin métricas publicadas: no hay benchmarks, FID, PSNR ni SSIM que permitan comparar objetivamente con alternativas.
- Repositorio de código privado: el código de entrenamiento no es público (`adbrasi/krea2-tile-controllora`), lo que dificulta la reproducibilidad.
- Uso en producción: al no haber validación ni versiones estables, no se recomienda desplegarlo en entornos productivos sin una evaluación previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/AdwolfCzar/krea2-tile-controllora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Nodo ComfyUI (facok): https://github.com/facok/comfyui-krea2-controlnet
- Nodo ComfyUI (tori29umai0123): https://github.com/tori29umai0123/comfyui-krea2-controlnetPlus
- Receta de referencia Flux.1-Depth-dev-lora (BFL): no disponible en la información proporcionada
- Receta de referencia Krea-2-depth-controlnet (Patil): no disponible en la información proporcionada
- Repositorio de código de entrenamiento: privado (`adbrasi/krea2-tile-controllora`), no accesible públicamente
