# moonbox-dev/VOSR-MLX

## Resumen

VOSR-MLX es la conversión a MLX de VOSR 2.0, un modelo de superresolución de imágenes (image-to-image) desarrollado originalmente por el autor CSWRY y portado a Apple Silicon por moonbox-dev. No se trata de un modelo de lenguaje, sino de un modelo de restauración y escalado de imágenes que combina un VAE 2D de Qwen-Image, características de DINOv2-L y un único paso de un LightningDiT de 1.4B parámetros para generar detalle a partir de ruido. El resultado es un pipeline de un solo paso que escala imágenes 4x con corrección de color wavelet.

La relevancia de esta ficha radica en que permite ejecutar un modelo de superresolución de gama alta en hardware Apple Silicon sin depender de PyTorch ni CUDA. El repositorio incluye varias precisiones (fp16, bf16, 8bit, 6bit y 4bit) con verificación numérica frente al modelo original en PyTorch fp32, lo que facilita evaluar el compromiso entre tamaño, fidelidad y velocidad. La versión fp16 es la única que sigue fielmente al original (42.3 dB de PSNR medio); el resto se marca como experimental.

El modelo se distribuye bajo licencia Apache 2.0, con un tamaño de repositorio de 10.9 GB y pesos en safetensors. Está pensado para Macs con chip Apple Silicon y se ejecuta mediante la librería MLX, con dependencias mínimas (`mlx`, `numpy` y `Pillow`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: VAE 2D de Qwen-Image + DINOv2-L + LightningDiT de un paso (1.4B) + corrección de color wavelet |
| Parámetros totales | 1.4B (modelo one-step LightningDiT; el pipeline completo incluye VAE y DINOv2-L) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

VOSR 2.0 es un modelo de superresolución de un solo paso construido sobre un LightningDiT de 1.4B parámetros. El pipeline completo, tal como se describe en la model card, incluye un escalado bicúbico inicial, un VAE 2D de Qwen-Image, extracción de características con DINOv2-L, un único paso del LightningDiT y una corrección de color basada en wavelet. Esta combinación permite generar detalle fino a partir de ruido en una sola iteración, en lugar de requerir un proceso de difusión de múltiples pasos.

La conversión a MLX se realizó a partir de la revisión `516f292b99` del repositorio original. Los pesos originales se cargaron en MLX y se almacenaron como bf16 o fp16, o bien se cuantizaron con la cuantización afín de MLX (8bit, 6bit, 4bit, group size 64). Las capas que MLX no puede cuantizar, como convoluciones y normalizaciones, permanecen en bf16. En los builds cuantizados se cuantizan las capas lineales del DiT y de DINOv2, mientras que el VAE, compuesto íntegramente por convoluciones, se mantiene en 16 bits. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO, ya que se trata de un modelo de imagen y la model card no detalla esos aspectos.

## Capacidades

- Superresolución de imágenes con factor de escala 4x (el ejemplo de la model card usa `scale=4`).
- Restauración de imágenes: generación de detalle fino a partir de ruido en un solo paso.
- Escalado de imágenes completas de una vez, sin tiling por defecto (el original tampoco lo usa por defecto).
- Redondeo interno de las dimensiones de salida a múltiplo de 16 y recorte posterior.
- Control de semilla para reproducibilidad (`seed=42` en el ejemplo).
- Ejecución en Apple Silicon mediante MLX, con dependencias mínimas (`mlx`, `numpy`, `Pillow`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades propias de los modelos fundacionales de texto.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo escala 4x y reconstruye texturas finas en un solo paso, adecuado para digitalizar archivos fotográficos en un Mac sin GPU dedicada.
- Mejora de imágenes para impresión: al aumentar la resolución 4x con corrección de color wavelet, se puede preparar material gráfico para impresión de mayor tamaño manteniendo la coherencia cromática.
- Preparación de datasets de visión por computador: escalar imágenes de baja resolución a alta resolución para entrenar o evaluar modelos de detección o segmentación en Macs Apple Silicon.
- Postprocesado en flujos de diseño gráfico: integrar el pipeline en scripts de Python que procesen lotes de imágenes en un Mac Studio o MacBook Pro con chip M-series.
- Restauración de capturas de pantalla o imágenes comprimidas: el modelo puede recuperar detalle perdido por compresión agresiva, útil en documentación técnica o archivos históricos.
- Prototipado e investigación en superresolución: al ser una conversión MLX con verificación numérica frente a PyTorch, sirve para comparar fidelidad entre precisiones (fp16, 8bit, 4bit) en un entorno Apple.
- Despliegue en local sin CUDA: equipos que no dispongan de GPU NVIDIA pueden ejecutar el pipeline completo en Apple Silicon, con tiempos de aproximadamente 1 segundo para 128 → 512 píxeles en un M5.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad frente al modelo original en PyTorch fp32, no benchmarks estándar de superresolución (como Set5, Set14 o Urban100). Se presentan a continuación los datos disponibles:

| Precisión | Tamaño | PSNR vs PyTorch fp32 (media / peor) | LPIPS (peor) | Tiempo, 128 → 512 en M5 |
|---|---|---|---|---|
| fp16 | 3.33 GB | 42.3 / 31.4 dB | 0.011 | 1.0 s |
| bf16 (experimental) | 3.33 GB | 33.8 / 23.2 dB | 0.045 | 1.0 s |
| 8bit (experimental) | 1.82 GB | 33.7 / 23.1 dB | 0.047 | 1.1 s |
| 6bit (experimental) | 1.41 GB | 33.1 / 22.8 dB | 0.048 | 1.1 s |
| 4bit (experimental) | 1.01 GB | 29.1 / 20.5 dB | 0.094 | 1.0 s |

No se han publicado resultados de benchmarks estándar de superresolución (PSNR/SSIM sobre datasets de referencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica VRAM de GPU dedicada; el modelo se ejecuta en memoria unificada de Apple Silicon. El tamaño de los pesos oscila entre 1.01 GB (4bit) y 3.33 GB (fp16/bf16), a lo que hay que sumar la memoria del VAE, DINOv2-L y las activaciones intermedias.
- GPU recomendadas: chips Apple Silicon (M-series). La model card cita un M5 para las mediciones de tiempo; no se especifican otros chips.
- Cabe en GPU consumer: sí, en Macs con Apple Silicon; no está pensado para GPUs NVIDIA ni AMD mediante MLX.
- Opciones de despliegue: MLX (librería `mlx`), con `mlx_model.py` incluido en cada carpeta de precisión. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 1.0-1.1 segundos para una imagen de 128 → 512 píxeles en un M5, según la model card. No se dispone de datos de throughput para lotes ni para otras resoluciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otras alternativas de superresolución (como Real-ESRGAN, SwinIR o StableSR). Se indica "no disponible".

## Limitaciones y advertencias

- Solo la precisión fp16 sigue fielmente al modelo original en PyTorch fp32 (42.3 dB de PSNR medio, LPIPS ≤ 0.011). Las versiones bf16, 8bit, 6bit y 4bit se marcan como experimentales y se desvían del original en algunas imágenes (LPIPS de hasta 0.048, por encima del umbral de 0.02 del laboratorio).
- La versión 4bit presenta la mayor deriva (LPIPS 0.094, PSNR medio 29.1 dB), por lo que no se recomienda para producción cuando la fidelidad sea crítica.
- El modelo genera detalle a partir de ruido en un solo paso, por lo que pequeñas diferencias numéricas producen texturas finas distintas; esto puede introducir artefactos o detalles inventados no presentes en la imagen original.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- Requiere hardware Apple Silicon y la librería MLX; no es ejecutable en GPUs NVIDIA o AMD sin una conversión adicional no incluida.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir adecuadamente; no se especifican restricciones adicionales en la model card.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni evaluación en dominios específicos (médico, satelital, etc.), por lo que se recomienda validar en el dominio de aplicación antes de usarlo en producción.
- El procesamiento se realiza sobre la imagen completa sin tiling por defecto, lo que puede limitar el tamaño máximo de imagen según la memoria unificada disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/VOSR-MLX
- Repositorio original de VOSR: https://github.com/cswry/VOSR
- Modelo base en Hugging Face: https://huggingface.co/CSWRY/VOSR
- Paper (referencia arXiv en los tags): arxiv:2604.03225 (no se dispone de URL directa en la información proporcionada)
