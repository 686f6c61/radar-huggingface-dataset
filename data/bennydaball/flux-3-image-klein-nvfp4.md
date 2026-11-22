# BennyDaBall/flux-3-image-klein-NVFP4

## Resumen

FLUX 3 Image Klein NVFP4 (build de BennyDaBall) es una cuantización mixta de FLUX 3 Image Klein, el modelo de difusión texto-a-imagen destilado de Black Forest Labs que genera imágenes en 16 pasos. El repositorio distribuye un único archivo safetensors de 5,41 GB que combina capas en NVFP4 (W4A4), capas en INT8 con formato ConvRot y capas pequeñas en bf16, pensado para cargarse directamente en ComfyUI mediante el nodo Load Diffusion Model sin modificar el grafo de trabajo original.

El interés de esta versión radica en que corrige el principal defecto de la cuantización NVFP4 oficial de BFL: según las mediciones del autor en una RTX 5090, este build queda 2,9 veces más cerca del modelo BF16 de referencia en LPIPS (0,049 frente a 0,142) y es un 7,8 % más rápido que el archivo NVFP4 de BFL, con un tamaño 0,42 GB menor que el INT8 ConvRot oficial. La receta combina GPTQ con una búsqueda de escalas de bloque basada en Schur Replay y los puntos de escala Four Over Six, aplicada por primera vez a un Diffusion Transformer.

Es relevante para desarrolladores que despliegan generación de imágenes en GPU Blackwell (RTX 50 o RTX PRO) y necesitan reducir huella de VRAM y latencia sin renunciar a fidelidad visual. La licencia es la flux-kommunity-license del modelo base, no una licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con cuantización mixta NVFP4 + INT8 ConvRot + bf16 |
| Parametros totales | no disponible (0,94B pesos en capas NVFP4, 18 % de las 172 capas cuantizadas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el codificador de texto es qwen3vl_4b_bf16) |
| Tipos de cuantizacion | NVFP4 (W4A4), INT8 ConvRot, bf16 en capas de embedding y modulación |
| Idiomas soportados | en |
| Licencia | flux-kommunity-license (license: other) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo base es FLUX 3 Image Klein en su variante destilada de 16 pasos, un Diffusion Transformer que sustituye el ruido por imágenes en un número reducido de evaluaciones. Esta build no reentrena el modelo: cuantiza los pesos BF16 originales con una estrategia de precisión mixta. De las 172 capas cuantizadas, 19 (0,94B pesos, aproximadamente el 18 %) se almacenan en NVFP4 con escalas de activación estáticas calibradas sobre trayectorias propias de Klein; el resto de capas sensibles se mantienen en INT8 en el formato ConvRot de BFL, con sus marcadores de atención int8; y las capas pequeñas de embedding y modulación permanecen en bf16.

La innovación técnica está en el procedimiento de cuantización. Los pesos NVFP4 se resuelven con GPTQ (Frantar et al., 2022) eligiendo la escala de bloque dentro del propio bucle de GPTQ mediante Schur Replay (arXiv 2609.36654) con ventana de replay de 8, cuyo conjunto de candidatas incluye los puntos Four Over Six (arXiv 2512.02010, MIT Han Lab y NVIDIA) bajo la escala global 4/6. Las capas INT8 se recuantizan desde BF16 con GPTQ en la base rotada ConvRot, seleccionando la escala de cada fila con el mismo criterio de Schur Replay, lo que reduce el error de pesos de esas capas unas 10 veces respecto al redondeo al más cercano usado por el archivo INT8 de BFL. La asignación de qué capas van a NVFP4 y cuáles a INT8 se decidió con escaneos de sensibilidad por capa sobre captions reservados, midiendo daño por milisegundo y fijando el presupuesto para mantener al menos un 4 % de ventaja de velocidad sobre INT8. Veinte capas INT8 que el flujo texto-a-imagen nunca ejecuta conservan los bytes originales de BFL porque la calibración no puede alcanzarlas.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024x1024 y resoluciones panorámicas como 1936x1088 (16:9), con 16 pasos de muestreo y CFG 1.
- Renderizado de texto dentro de la imagen con alta fidelidad: en la prueba de 26 cadenas citadas por 3 semillas y lectura ciega letra a letra, obtiene 76/78 aciertos, frente a 77/78 de BF16 e INT8 y 76/78 del NVFP4 de BFL.
- Fidelidad visual próxima al modelo BF16: LPIPS medio de 0,049 y SSIM de 0,923 sobre 96 renders comparados con la referencia completa.
- Compatibilidad directa con el flujo estándar de ComfyUI para Klein: mismo codificador de texto (qwen3vl_4b_bf16), mismo VAE y mismos ajustes de sampler, sin cambios en el grafo más allá del nombre del archivo.
- Aceleración FP4 en hardware NVIDIA Blackwell (RTX 50 series y RTX PRO Blackwell) gracias a las capas NVFP4.
- No soporta tool calling, agentes, visión de entrada ni audio: es exclusivamente un modelo de generación de imágenes a partir de texto en inglés.

## Casos de uso

- Generación de imágenes en producción sobre GPU Blackwell: el archivo de 5,41 GB se carga en ComfyUI con el nodo Load Diffusion Model y rinde un 7,8 % más rápido que el NVFP4 oficial de BFL, lo que reduce el coste por imagen en granjas de RTX 5090.
- Sustitución directa del modelo BF16 en flujos existentes: al mantener el mismo codificador de texto, VAE y sampler, basta cambiar el nombre del archivo en el UNETLoader para pasar de 11,10 GB a 5,41 GB de pesos con una pérdida de fidelidad medida de LPIPS 0,049.
- Despliegue en estaciones con 24 GB de VRAM: el pico medido es de 16,2 GiB en una RTX 5090 incluyendo unos 3,3 GiB de uso de escritorio, frente a 20,8 GiB del BF16, lo que deja margen para otras tareas en la misma GPU.
- Generación de creatividades con texto integrado: la tasa de 76/78 en lectura ciega de cadenas citadas lo hace adecuado para carteles, etiquetas de producto y mockups donde el texto debe ser legible.
- Iteración rápida en estudios de diseño: con 1,590 s por imagen a 1024x1024 y 16 pasos, permite explorar decenas de variantes por prompt en una sesión de trabajo.
- Evaluación comparativa de cuantizaciones: el repositorio publica la metodología completa (96 renders, 16 captions por 6 semillas, LPIPS AlexNet, SSIM y diferencia absoluta media), útil como referencia para validar otras builds.
- Prototipado de pipelines texto-a-imagen en resolución panorámica: los renders de showcase a 1936x1088 mantienen una media de LPIPS de 0,050 frente a BF16, suficiente para maquetas y previsualizaciones.

## Benchmarks y rendimiento

Mediciones del autor en RTX 5090 con ComfyUI 0.43.0, comfy-kitchen 0.2.40, torch 2.14.0 + CUDA 13.0, atención int8 de Comfy Kitchen, 1024x1024, 16 pasos, CFG 1, euler/simple y ModelSamplingFlux shift 2,77259. Cada archivo se compara con el render BF16 de la misma caption y semilla (96 renders por archivo).

| Archivo | Tamano | LPIPS vs BF16 (media / mediana) | SSIM | s/imagen |
|---|---:|---:|---:|---:|
| BF16 (BFL) | 11,10 GB | referencia | 1 | 3,397 |
| INT8 ConvRot (BFL) | 5,83 GB | 0,026 / 0,018 | 0,956 | 1,656 |
| NVFP4 (BFL) | 5,28 GB | 0,142 / 0,122 | 0,785 | 1,725 |
| NVFP4 (este repo) | 5,41 GB | 0,049 / 0,034 | 0,923 | 1,590 |

Datos adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| Imagenes mas cercanas a BF16 que el NVFP4 de BFL | 94 de 96 (LPIPS medio 2,9x menor; mediana 3,6x menor) |
| Imagenes en las que INT8 ConvRot supera a este build | 88 de 96 |
| Ventaja de velocidad sobre INT8 ConvRot | 4,0 % |
| Ventaja de velocidad sobre NVFP4 de BFL | 7,8 % (el NVFP4 de BFL es un 4,2 % mas lento que INT8 en este setup) |
| Lectura ciega de texto | BF16 77/78; INT8 77/78; este build 76/78; NVFP4 BFL 76/78 |
| Pico de VRAM (GPU completa, incluye ~3,3 GiB de escritorio) | este build 16,2 GiB; INT8 16,5 GiB; NVFP4 BFL 16,3 GiB; BF16 20,8 GiB |
| Showcase a 1936x1088 (9 renders) | este build 0,050; INT8 0,030; NVFP4 BFL 0,157 de LPIPS medio |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores son evaluaciones de fidelidad y velocidad específicas de imagen.

## Requisitos de hardware

- VRAM estimada: pico medido de 16,2 GiB en RTX 5090 con escritorio incluido; el archivo pesa 5,41 GB en disco y el resto del consumo proviene de activaciones, codificador de texto y VAE.
- GPU recomendadas: NVIDIA Blackwell (RTX 50 series, RTX PRO Blackwell) para aprovechar la aceleración FP4 de las capas NVFP4. El autor solo documenta mediciones en RTX 5090.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) con margen amplio; con 16,2 GiB de pico también entraría en GPUs de 24 GB, aunque no hay mediciones publicadas en esas tarjetas.
- Opciones de despliegue: ComfyUI con el nodo Load Diffusion Model (weight_dtype por defecto), usando el flujo texto-a-imagen estándar de Klein. No se documentan otros runners (vLLM, llama.cpp, TGI no aplican a este formato).
- Latencia y throughput: 1,590 s por imagen a 1024x1024 y 16 pasos en RTX 5090; 3,397 s para el BF16 de referencia. No se publican cifras de throughput por lote ni latencias en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | LPIPS vs BF16 | s/imagen | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLUX 3 Image Klein NVFP4 (este repo) | no disponible (5,41 GB) | 1024x1024, 16 pasos | 0,049 / 0,034 | 1,590 | flux-kommunity-license | Hugging Face, 650 descargas |
| FLUX 3 Image Klein INT8 ConvRot (BFL) | no disponible (5,83 GB) | 1024x1024, 16 pasos | 0,026 / 0,018 | 1,656 | flux-kommunity-license | Hugging Face |
| FLUX 3 Image Klein NVFP4 (BFL) | no disponible (5,28 GB) | 1024x1024, 16 pasos | 0,142 / 0,122 | 1,725 | flux-kommunity-license | Hugging Face |
| FLUX 3 Image Klein BF16 (BFL) | no disponible (11,10 GB) | 1024x1024, 16 pasos | referencia | 3,397 | flux-kommunity-license | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base porque la información proporcionada no incluye datos de otros modelos texto-a-imagen comparables.

## Limitaciones y advertencias

- La licencia es flux-kommunity-license, no una licencia de código abierto permisiva; el uso comercial está sujeto a los términos del modelo base y debe revisarse en LICENSE.md antes de desplegar.
- El modelo solo procesa prompts en inglés (idiomas soportados: en).
- Las capas NVFP4 requieren una GPU NVIDIA Blackwell para obtener la aceleración FP4; en hardware anterior no se aprovecha la ventaja de velocidad y el comportamiento no está documentado.
- Fidelidad inferior al INT8 ConvRot de BFL en la mayoría de imágenes: este build queda más lejos de BF16 que INT8 en 88 de 96 renders, con LPIPS medio 0,049 frente a 0,026.
- Riesgo de errores en texto fino: falla una "i" estilizada de tiza que BF16 también dibuja mal y, en una semilla, una ventana de fecha de reloj muestra "4" en lugar de "14".
- Veinte capas INT8 que el flujo texto-a-imagen no ejecuta conservan los bytes originales de BFL porque la calibración no puede alcanzarlas; no se garantiza su comportamiento en flujos que sí las activen.
- Las mediciones provienen de un único setup (RTX 5090, ComfyUI 0.43.0, comfy-kitchen 0.2.40, torch 2.14.0 + CUDA 13.0); el rendimiento en otras configuraciones puede diferir.
- Como todo modelo generativo, puede producir contenido sesgado o inapropiado según el prompt; no se documentan filtros de seguridad específicos en esta build.
- El prompt upsampler recomendado por BFL se dejó desactivado en las pruebas para igualar captions; los resultados visuales con upsampler activo no están medidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/flux-3-image-klein-NVFP4
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo base en formato ComfyUI: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Paper Schur Replay: https://arxiv.org/abs/2609.36654
- Paper Four Over Six (MIT Han Lab y NVIDIA): https://arxiv.org/abs/2512.02010
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
