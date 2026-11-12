# moonbox-ai/VOSR-MLX

## Resumen

VOSR-MLX es la conversión a MLX de VOSR 2.0, un modelo de superresolución y restauración de imagen desarrollado originalmente por el equipo de CSWRY y portado a Apple Silicon por Moonbox. El modelo resuelve el problema del reescalado y la restauración de imágenes de baja calidad: recibe una imagen de entrada y devuelve una versión ampliada (por defecto a escala 4x) con detalle reconstruido. La relevancia de esta variante concreta es que permite ejecutar el pipeline completo de forma nativa en Macs con chip Apple Silicon mediante MLX, sin depender de PyTorch ni de CUDA.

El modelo base es un modelo de difusión de un solo paso (one-step) de 1.4B parámetros. El pipeline integra un preescalado bicúbico, un VAE 2D de Qwen-Image, características extraídas con DINOv2-L, un paso de muestreo con LightningDiT y un postprocesado de corrección de color basado en wavelets. Esta ficha cubre el repositorio moonbox-ai/VOSR-MLX, que contiene cinco builds en distintas precisiones (fp16, bf16, 8bit, 6bit y 4bit) con distintos compromisos entre fidelidad y tamaño.

La licencia es Apache 2.0 y el formato de pesos es safetensors dentro de MLX. El repositorio ocupa 10.9 GB en total, aunque cada build individual pesa entre 1.01 GB (4bit) y 3.33 GB (fp16/bf16). No se dispone de información sobre idiomas soportados ni de resultados de benchmarks frente a otros modelos de superresolución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión de un paso: preescalado bicúbico + VAE 2D (Qwen-Image) + DINOv2-L + LightningDiT + corrección de color por wavelets |
| Parámetros totales | 1.4B (modelo base VOSR 2.0) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por build |

## Arquitectura y entrenamiento

VOSR 2.0 es un modelo de difusión de un solo paso. El pipeline combina varias etapas: un preescalado bicúbico de la imagen de entrada, un VAE 2D procedente de Qwen-Image que opera en el espacio latente, la extracción de características con DINOv2-L como condicionamiento, un único paso de muestreo con LightningDiT y, finalmente, una corrección de color basada en wavelets. El modelo genera el detalle fino a partir de ruido en un solo paso, lo que implica que pequeñas diferencias numéricas en la inferencia se traducen en texturas finas distintas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de imagen). El repositorio documenta el proceso de conversión: a partir de la revisión `516f292b99` del repositorio original, los pesos se cargaron en MLX y se almacenaron en bf16 o fp16, o se cuantizaron con la cuantización afín de MLX. En los builds cuantizados se cuantizan las capas lineales del DiT y de DINOv2 (group size 64), mientras que el VAE, compuesto íntegramente por convoluciones, permanece en 16 bits.

## Capacidades

- Superresolución de imagen: ampliación de imágenes con escala configurable (por defecto 4x), con redondeo interno de las dimensiones de salida a múltiplo de 16 y recorte posterior.
- Restauración de imagen: reconstrucción de detalle fino y corrección de color en imágenes degradadas.
- Procesamiento de imagen completa en una sola pasada, sin tiling (el comportamiento por defecto del modelo original).
- Generación determinista controlable mediante semilla (`seed`), lo que permite reproducibilidad.
- Ejecución nativa en Apple Silicon mediante MLX, con dependencias mínimas (`mlx`, `numpy`, `Pillow`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de imagen, no de lenguaje.
- No dispone de capacidades multilingües, de visión general ni de audio.

## Casos de uso

- Restauración de fotografías antiguas o escaneadas: el modelo reconstruye detalle y corrige el color en una sola pasada, adecuado para digitalizar archivos fotográficos en un Mac sin GPU dedicada.
- Mejora de miniaturas y assets web: ampliación 4x de imágenes de baja resolución para su uso en interfaces, con la build 4bit (1.01 GB) si el espacio es limitado.
- Preparación de imágenes para impresión: el escalado 4x permite obtener resoluciones mayores a partir de originales pequeños, usando la build fp16 para maximizar la fidelidad (PSNR medio de 42.3 dB frente a PyTorch fp32).
- Preprocesado en pipelines de visión por computador: aumento de resolución de imágenes de entrada antes de tareas de detección o segmentación, ejecutable localmente en un Mac.
- Prototipado e investigación en superresolución: el port MLX permite experimentar con el pipeline completo (VAE, DINOv2, LightningDiT) en hardware Apple sin depender de CUDA.
- Procesamiento por lotes en local: al ejecutarse en MLX con tiempos de aproximadamente 1 segundo por imagen de 128 a 512 px en un M5, es viable procesar colecciones de imágenes en un portátil.
- Despliegue en entornos sin GPU NVIDIA: equipos de diseño o edición que trabajan exclusivamente en macOS pueden incorporar el upscaling sin infraestructura adicional.

## Benchmarks y rendimiento

Los datos disponibles comparan cada build MLX con el modelo original en PyTorch fp32 sobre las mismas entradas, no frente a otros modelos de superresolución.

| Precisión | Tamaño | PSNR vs PyTorch fp32 (media / peor) | LPIPS (peor) | Tiempo, 128 → 512 en M5 |
|---|---|---|---|---|
| fp16 | 3.33 GB | 42.3 / 31.4 dB | 0.011 | 1.0 s |
| bf16 (experimental) | 3.33 GB | 33.8 / 23.2 dB | 0.045 | 1.0 s |
| 8bit (experimental) | 1.82 GB | 33.7 / 23.1 dB | 0.047 | 1.1 s |
| 6bit (experimental) | 1.41 GB | 33.1 / 22.8 dB | 0.048 | 1.1 s |
| 4bit (experimental) | 1.01 GB | 29.1 / 20.5 dB | 0.094 | 1.0 s |

No se han publicado resultados de benchmarks frente a otros modelos de superresolución (como Real-ESRGAN o SwinIR) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 1.01 GB (4bit) y 3.33 GB (fp16/bf16) solo para los pesos; hay que sumar la memoria del VAE, DINOv2 y las activaciones intermedias, no cuantificada en la información disponible.
- Hardware objetivo: Apple Silicon (el repositorio cita un M5 como referencia de tiempos). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente; la build 4bit (1.01 GB) es la más ligera.
- Opciones de despliegue: MLX con el script `mlx_model.py` incluido en cada carpeta; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: aproximadamente 1.0–1.1 segundos por imagen de 128 a 512 px en un M5, según la tabla del repositorio. No se dispone de datos de throughput para lotes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas frente a otros modelos de superresolución en la información proporcionada. La comparación disponible se limita a las distintas precisiones del propio port MLX frente al original en PyTorch fp32 (ver tabla de benchmarks). Como referencia de categoría, los modelos de superresolución habitualmente comparables serían Real-ESRGAN y SwinIR, pero no se han proporcionado métricas que permitan una comparación rigurosa.

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| VOSR-MLX (fp16) | 1.4B | Difusión de un paso, MLX | Apache 2.0 | Hugging Face (este repo) |
| Real-ESRGAN | no disponible | GAN | no disponible | no disponible |
| SwinIR | no disponible | Transformer | no disponible | no disponible |

## Limitaciones y advertencias

- Solo fp16 está validado como fiel al original (PSNR medio 42.3 dB, LPIPS ≤ 0.011). Las builds bf16, 8bit, 6bit y 4bit están marcadas como experimentales: su LPIPS (hasta 0.048) supera el umbral de 0.02 del laboratorio, y la 4bit se desvía aún más (LPIPS 0.094).
- Al generar detalle a partir de ruido en un solo paso, pequeñas diferencias numéricas producen texturas finas distintas; no es un modelo determinista respecto al original en PyTorch.
- Procesa la imagen completa en una sola pasada, sin tiling; imágenes de gran tamaño pueden consumir mucha memoria y no se documentan límites.
- No se dispone de información sobre sesgos, tasas de alucinación de detalle, ni comportamiento en dominios específicos (médico, satelital, etc.).
- Restricción de plataforma: requiere MLX y Apple Silicon; no es ejecutable en CUDA ni en CPU convencional sin adaptación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es CSWRY/VOSR y conviene verificar las condiciones del repositorio original y de los componentes de terceros (VAE de Qwen-Image, DINOv2-L).
- No hay datos de idiomas (no aplica) ni de robustez frente a distintos tipos de degradación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/VOSR-MLX
- Modelo base: https://huggingface.co/CSWRY/VOSR
- Repositorio original VOSR: https://github.com/cswry/VOSR
- Paper (referencia arXiv): arxiv:2604.03225
