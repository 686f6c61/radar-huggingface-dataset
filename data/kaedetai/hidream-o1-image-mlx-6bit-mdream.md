# KaedeTai/HiDream-O1-Image-mlx-6bit-mdream

## Resumen

HiDream-O1-Image es un modelo de generación de imágenes de código abierto desarrollado por HiDream-ai, basado en un Transformer unificado a nivel de píxel (UiT) que prescinde de VAEs externos y codificadores de texto separados. En lugar de ello, codifica píxeles, texto y condiciones de tarea en un único espacio de tokens compartido, lo que le permite abordar text-to-image, edición por instrucción y personalización por sujeto en resoluciones de hasta 2048×2048. El checkpoint base tiene alrededor de 8 mil millones de parámetros y está publicado bajo licencia MIT.

La ficha que nos ocupa es una cuantización a 6 bits de la variante destilada (dev) de HiDream-O1-Image, realizada por KaedeTai y empaquetada para la librería mdream, una implementación en MLX que no requiere ComfyUI ni PyTorch. Esta versión reduce los pesos de 14,17 GiB a 6,49 GiB (factor 2,18×) y la memoria pico de 15,6 GiB a 8,8 GiB, con una pérdida de calidad visual no perceptible según las pruebas del autor. Sin embargo, la cuantización no acelera la inferencia: es entre 1,08× y 1,5× más lenta que la versión bf16, dependiendo de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel-level Unified Transformer (UiT) con cuantizacion MLX 6-bit (grupo 64) en los 36 bloques del decodificador; vision tower Qwen3-VL (27 bloques) y embeddings en bf16 |
| Parametros totales | 8B (modelo base); pesos cuantizados a 6,49 GiB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion maxima 2048×2048) |
| Tipos de cuantizacion | 6-bit grupo 64 (publicado); se probaron 8-bit y 4-bit en experimentos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con metadatos de cuantizacion (formato mdream/MLX) |

## Arquitectura y entrenamiento

HiDream-O1-Image es un diffusion transformer que opera directamente en el espacio de píxeles, sin depender de un VAE externo ni de codificadores de texto fragmentados. Todos los tokens (píxeles, texto y condiciones de tarea) se proyectan a un espacio compartido y se procesan mediante un stack de transformadores. El checkpoint base tiene 8B parámetros y alcanza resultados comparables a modelos varias veces más grandes, según sus desarrolladores. La variante destilada (`dev`) se obtiene mediante un proceso de destilación que reduce el coste de inferencia a expensas de cierta robustez en tareas de edición de retratos.

La cuantización publicada en este repositorio aplica 6 bits con grupo 64 a todos los proyectores lineales de los 36 bloques del decodificador (q/k/v/o, gate/up/down), manteniendo en bf16 la tabla de embeddings y la torre de visión Qwen3-VL. El autor justifica esta decisión porque la torre de visión es la parte más sensible a perturbaciones de entrada: un cambio de un nivel uint8 en su entrada desplaza sus embeddings de salida en un 5% (coseno 0,928). Además, los experimentos con cuantización plana de 4 bits producen imágenes sistemáticamente más oscuras, un efecto que se corrige manteniendo `down_proj` a 8 bits, pero que no se ha publicado aquí.

## Capacidades

- Generacion de texto a imagen con resoluciones de hasta 2048×2048 (probadas 768×1024, 1024×1024, 1152×1536, 1536×2048 y 2048×2048).
- Edicion de imagenes mediante instrucciones en lenguaje natural (cambiar ropa, fondo, objetos, etc.) usando una imagen de referencia.
- Personalizacion por sujeto (subject-driven personalization) segun la documentacion del modelo base.
- Soporte de condicionamiento por texto y por imagen en un unico espacio de tokens.
- Capacidad de edicion de imagenes sin necesidad de VAE externo ni codificadores de texto separados.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de texto general).
- Capacidades multilingues no documentadas en la informacion disponible.

## Casos de uso

- Generacion de imagenes en entornos Apple Silicon sin depender de servicios en la nube: el modelo puede ejecutarse en un Mac con 16 GB de RAM unificada gracias a la cuantizacion 6-bit, que reduce la memoria pico a 8,8 GiB. Un desarrollador puede generar ilustraciones o conceptos artisticos localmente con scripts CLI de mdream.
- Edicion de imagenes de producto para e-commerce: la edicion por instruccion permite cambiar el color o el material de un objeto sin tocar el fondo, siempre que no se trate de piel humana. La ventana de 1152×1536 ofrece suficiente detalle para catalogos.
- Creacion de variaciones de diseno en flujos de trabajo de diseno grafico: se pueden generar multiples iteraciones de un boceto a partir de una misma imagen de referencia, ajustando la instruccion y la semilla.
- Generacion de fondos y texturas para videojuegos o entornos virtuales: la resolucion de 2048×2048 permite obtener texturas de alta calidad sin necesidad de upscaling posterior.
- Prototipado rapido de conceptos para ilustradores y artistas conceptuales: el modelo dev es adecuado para text-to-image puro, produciendo resultados visualmente indistinguibles de la version bf16 segun las pruebas del autor.
- Integracion en pipelines de automatizacion de contenido visual (por ejemplo, generar miniaturas o banners para blogs) mediante scripts que llaman a la CLI de mdream, sin requerir una GPU dedicada ni CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) en la informacion disponible. El autor de la cuantizacion proporciona mediciones de velocidad y memoria en un Apple M5 Max (128 GB, macOS) para text-to-image con 28 pasos y cfg 1.0:

| Canvas | MP | tokens | bf16 s/step | 6-bit s/step | bf16 28 pasos | 6-bit 28 pasos |
|---|---:|---:|---:|---:|---:|---:|
| 768×1024 | 0,79 | 768 | 0,266 | 0,438 | 7,4 s | 12,3 s |
| 1024×1024 | 1,05 | 1024 | 0,365 | 0,578 | 10,2 s | 16,2 s |
| 1152×1536 | 1,77 | 1728 | 0,627 | 0,963 | 17,6 s | 27,0 s |
| 1536×2048 | 3,15 | 3072 | 1,301 | 1,972 | 36,4 s | 55,2 s |
| 2048×2048 | 4,19 | 4096 | 2,011 | 2,928 | 56,3 s | 82,0 s |

Memoria pico: 15,6 GiB (bf16) frente a 8,8 GiB (6-bit). En edicion con imagen de referencia a 1152×1536 y cfg 5.0, el tiempo por paso es de 6,21 s (bf16) y 6,71 s (6-bit), lo que da 174 s y 188 s respectivamente para 28 pasos.

## Requisitos de hardware

- VRAM estimada: 8,8 GiB de memoria unificada con la cuantizacion 6-bit; 15,6 GiB con la version bf16.
- GPU recomendadas: Apple Silicon (M-series). Probado en M5 Max con 128 GB, pero deberia funcionar en cualquier chip con al menos 16 GB de memoria unificada.
- Si cabe en consumer GPU: no es aplicable directamente, ya que esta pensado para Apple Silicon y usa MLX. No se proporcionan versiones CUDA.
- Opciones de despliegue: exclusivamente mediante la libreria mdream (scripts `generate.py` y `edit.py`). No compatible con ComfyUI, diffusers, mflux ni mlx-vlm.
- Latencia: 12-82 s para 28 pasos en text-to-image segun resolucion; 188 s para edicion a 1152×1536. La cuantizacion es mas lenta que bf16 en todos los casos probados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de generacion de imagenes en la informacion proporcionada. Se puede senalar cualitativamente que el modelo base HiDream-O1-Image (8B) compite con modelos de mayor tamano como FLUX.1-dev (12B, tambien MIT) o SDXL (2.6B, licencia no permisiva para uso comercial). La version MLX 6-bit aqui publicada es especifica para Apple Silicon y no es directamente comparable con implementaciones CUDA. Para una comparativa cuantitativa seria necesario ejecutar los mismos benchmarks en el mismo hardware, lo cual no se ha documentado.

## Limitaciones y advertencias

- El checkpoint `dev` (destilado) no debe usarse para editar caras o piel humana: produce moteado oscuro y textura reptiliana en la piel, ademas de generar a veces un diptico antes/despues en lugar de una sola imagen. El autor recomienda usar el checkpoint `base` para ese tipo de edicion.
- La cuantizacion 6-bit es mas lenta que bf16 (1,5× en text-to-image, 1,08× en edicion). No es una optimizacion de velocidad, solo de memoria.
- No es compatible con frameworks populares como ComfyUI, diffusers o mflux. Requiere la libreria mdream y un tokenizador Qwen2 (el script busca el de ComfyUI o la variable de entorno `MDREAM_TOKENIZER`).
- Riesgo de alucinaciones visuales y artefactos en edicion de imagenes complejas, especialmente con el checkpoint destilado.
- No se documentan sesgos ni limitaciones de idioma en la informacion proporcionada.
- Licencia MIT permite uso comercial, pero el autor del checkpoint cuantizado no ofrece garantias sobre su calidad en produccion.

## Enlaces

- Repositorio HuggingFace del checkpoint cuantizado: https://huggingface.co/KaedeTai/HiDream-O1-Image-mlx-6bit-mdream
- Modelo base en HuggingFace: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Repositorio GitHub del modelo base: https://github.com/HiDream-ai/HiDream-O1-Image
- Repositorio GitHub de mdream: https://github.com/KaedeTai/mdream
- Sitio web del proyecto HiDream: https://hidream.ai/
- Paper tecnico (arXiv): https://arxiv.org/html/2605.11061
