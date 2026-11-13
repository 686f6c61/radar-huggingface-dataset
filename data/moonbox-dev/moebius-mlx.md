# moonbox-dev/Moebius-MLX

## Resumen

Moebius-MLX es una conversión al framework MLX de Apple del modelo Moebius, un sistema de inpainting y eliminación de objetos desarrollado originalmente por hustvl. El modelo base es una red UNet de aproximadamente 0,22 mil millones de parámetros (0,22 B) que, según sus autores, alcanza un rendimiento de nivel 10B en tareas de inpainting pese a su reducido tamaño. Esta versión MLX la publica moonbox-dev para ejecución nativa en Macs con Apple Silicon, con el objetivo de permitir inferencia local sin depender de PyTorch ni de GPUs NVIDIA.

La relevancia de esta ficha radica en que no es un modelo de lenguaje, sino un modelo de imagen a imagen (pipeline `image-to-image`) especializado en eliminar objetos y rellenar regiones enmascaradas. La conversión incluye varias precisiones (fp16, bf16, 8bit, 6bit y 4bit) con validación numérica frente al modelo original en float32, lo que permite elegir el equilibrio entre calidad y tamaño en disco. El repositorio ocupa 2,6 GB e incluye únicamente el UNet, el VAE y los embeddings temporales; el resto del pipeline de inferencia no está incluido y debe aportarlo el motor de Moonbox.

El modelo se distribuye con licencia MIT según los metadatos de Hugging Face, aunque la model card menciona Apache-2.0 para los archivos derivados; esta discrepancia debe resolverse antes de un uso comercial. No se dispone de información sobre idiomas soportados porque la tarea es puramente visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (DDIM, 20 pasos, CFG 2) con VAE PixelHacker |
| Parametros totales | 0,22 B (UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada 512x512) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantizacion afín de MLX, grupo 64) |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | MIT en metadatos; Apache-2.0 en la model card (derivado del modelo original) |
| Formato de pesos | safetensors (UNet y VAE) y npz (embeddings temporales) |

## Arquitectura y entrenamiento

La arquitectura es una UNet de difusion de 0,22 B parámetros que opera sobre imágenes de 512x512 píxeles con 20 pasos de muestreo DDIM y escala de guiado sin clasificador (CFG) de 2, siguiendo la configuración del repositorio original. El pipeline combina el UNet con el VAE de PixelHacker y un fichero de embeddings temporales (`temb.npz`) que contiene `silu(time_embedding(t))` para t = 0..999. En la conversión MLX se han plegado las BatchNorm, las afinidades de normalización y el condicionamiento constante dentro de los pesos, y las convoluciones 1x1 y proyecciones de atención se almacenan como matrices `[in, out]`; las capas que MLX no puede cuantizar (convoluciones y normas) permanecen en bf16.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO, ya que la model card proporcionada no detalla el proceso de entrenamiento del modelo original. La innovación destacable de esta publicación es la propia conversión a MLX: se generaron cinco builds de precisión y cada uno se validó contra los pesos en float32 del modelo original mediante PSNR y LPIPS sobre la eliminación del sujeto principal en 8 fotos con semilla 0. El umbral de aceptación era LPIPS <= 0,15 por imagen; fp16, bf16, 8bit y 6bit lo superan, mientras que 4bit queda por debajo del umbral y se marca como experimental.

## Capacidades

- Inpainting de imágenes: relleno de regiones enmascaradas con contenido coherente con el contexto visual.
- Eliminación de objetos: sustitución del sujeto principal o de objetos seleccionados por fondo generado.
- Edición imagen a imagen: pipeline `image-to-image` sobre entradas de 512x512 píxeles.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Selección de precisión en tiempo de carga: fp16, bf16, 8bit, 6bit o 4bit según el compromiso calidad/espacio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de objetos en fotografías de producto: se enmascara el objeto no deseado y el modelo rellena la región con el fondo circundante; los 512x512 de entrada y los 20 pasos DDIM permiten iterar rápidamente en local sobre un Mac.
- Limpieza de imágenes para catálogos de e-commerce: retirada de elementos de atrezo o marcas de agua en lotes, usando la build 8bit (495 MB) para reducir el consumo de disco manteniendo PSNR de 37,4 dB frente a float32.
- Edición fotográfica en aplicaciones de escritorio para macOS: integración del UNet y el VAE en un motor MLX propio, con latencias de 4-5 s por inpainting en un Apple M5, adecuadas para flujos interactivos.
- Restauración de fotografías con regiones dañadas: relleno de zonas enmascaradas por arañazos o manchas, aprovechando la coherencia local que proporciona el VAE de PixelHacker.
- Prototipado e investigación en difusión de imágenes: la disponibilidad de cinco precisiones con métricas PSNR/LPIPS documentadas permite estudiar el impacto de la cuantización en la calidad perceptiva sin reentrenar.
- Preprocesado de datasets visuales: eliminación automatizada de sujetos o logos en imágenes de entrenamiento antes de pasarlas a otros pipelines, ejecutándose íntegramente en hardware Apple.
- Demos y herramientas offline: despliegue en portátiles Apple Silicon sin conexión ni GPU dedicada, gracias al formato MLX y a los pesos de 412-649 MB según precisión.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de fidelidad de cada build MLX frente a los pesos en float32 del modelo original, medidas sobre la eliminación del sujeto principal en 8 fotos (semilla 0) y evaluando la salida a 512 px:

| Precision | Tamano | PSNR vs float32 (media / peor) | LPIPS (peor) | Estado |
|---|---|---|---|---|
| fp16 | 649 MB | 41,0 / 33,9 dB | 0,008 | pasa |
| bf16 | 649 MB | 32,2 / 27,2 dB | 0,050 | pasa |
| 8bit | 495 MB | 37,4 / 33,0 dB | 0,022 | pasa |
| 6bit | 453 MB | 32,9 / 26,4 dB | 0,066 | pasa |
| 4bit | 412 MB | 22,4 / 16,7 dB | 0,380 | por debajo del umbral, experimental |

El umbral de aceptación era LPIPS <= 0,15 por imagen. No se han publicado resultados de benchmarks estándar de inpainting (por ejemplo, FID, LPIPS frente a ground truth o comparativas con otros modelos) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: entre 412 MB (4bit) y 649 MB (fp16/bf16) para los pesos del UNet, VAE y embeddings; el repositorio completo ocupa 2,6 GB.
- Hardware objetivo: Apple Silicon con MLX; las pruebas de latencia se realizaron en un Apple M5.
- GPU recomendadas: no se especifican GPU NVIDIA ni CUDA; el formato MLX está pensado para GPUs integradas de Apple (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra).
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; no se documenta soporte para GPUs de consumo NVIDIA.
- Opciones de despliegue: motor MLX de Moonbox (`moebius_od/mlx_unet.py` y `mlx_vae.py`), que no forma parte de este repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: aproximadamente 4-5 s por inpainting (20 pasos, 512 px) en un Apple M5. No se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Moebius-MLX (este) | 0,22 B (UNet) | 512x512 | MIT / Apache-2.0 | Hugging Face, MLX | Conversión MLX con 5 precisiones validadas |
| hustvl/Moebius (original) | 0,22 B (UNet) | 512x512 | Apache-2.0 | Hugging Face, PyTorch | Modelo base del que deriva esta conversión |
| Otros modelos de inpainting | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos alternativos de inpainting con los que comparar parámetros, contexto, rendimiento o licencia en la documentación facilitada.

## Limitaciones y advertencias

- La build 4bit está marcada como experimental y queda por debajo del umbral de calidad (LPIPS 0,380 frente al límite de 0,15); no se recomienda para producción.
- El repositorio solo contiene el UNet, el VAE y los embeddings temporales; el motor de inferencia MLX no está incluido y debe obtenerse por separado.
- La resolución de trabajo está fijada en 512x512 píxeles y el muestreo en 20 pasos DDIM con CFG 2; no se documentan otras configuraciones.
- Existe una discrepancia de licencia entre los metadatos de Hugging Face (MIT) y la model card (Apache-2.0); conviene aclararla antes de un uso comercial.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas, al ser un modelo de imagen sin texto.
- El modelo está limitado a hardware Apple Silicon con MLX; no hay soporte documentado para CUDA ni para GPUs de otros fabricantes.
- La validación se realizó sobre 8 fotos con una única semilla; el comportamiento en dominios visuales distintos no está caracterizado.
- No se han publicado benchmarks estándar de inpainting ni comparativas con modelos alternativos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Moebius-MLX
- Modelo base original: https://huggingface.co/hustvl/Moebius
- Referencia arXiv citada en los tags: arxiv:2606.19195
- Project page del modelo original: mencionada en la model card como "h..." (URL truncada en la información disponible)
