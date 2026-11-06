# AuroraAI-Research/AuroraIMG2-100M

## Resumen

AuroraIMG2-100M es un modelo de generación de imágenes texto-a-imagen de resolución fija 256×256 desarrollado por AuroraAI-Research. Se compone de un denoiser de 100,6M de parámetros basado en un diffusion transformer con flow matching (rectified flow) y un codificador de texto propio de 44,9M de parámetros, ambos entrenados desde cero. El modelo opera en el espacio latente del VAE de FLUX.2 (latente de 128×16×16, 256 tokens, sin patchify) y convierte los latentes en píxeles mediante el decodificador congelado FLUX.2 small decoder (27,9M de parámetros, Apache-2.0).

El modelo es el sucesor de AuroraIMG2-50M-Preview y mejora notablemente sus resultados en GenEval 2: pasa de 6,00 a 10,80 en Soft-TIFA GM y de 36,03 a 48,62 en Soft-TIFA AM. Todo el entrenamiento se realizó en una única NVIDIA RTX PRO 6000 durante unas 80 GPU-horas (235.000 pasos, batch de 512, aproximadamente 120M de muestras), lo que lo convierte en un caso interesante de modelo generativo entrenado desde cero con recursos muy limitados.

Su relevancia actual radica en que demuestra que es posible construir un pipeline texto-a-imagen funcional con menos de 150M de parámetros entrenables, reutilizando únicamente un decodificador VAE preentrenado, y publicarlo con licencia Apache-2.0. Es un modelo de investigación y experimentación más que un sistema de producción para imágenes de alta calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con flow matching (rectified flow) en espacio latente; codificador de texto transformer bidireccional |
| Parámetros totales | 100.600.448 en safetensors (denoiser); 44,9M adicionales en el codificador de texto; 27,9M en el decodificador FLUX.2 congelado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 190 tokens de prompt (192 con tokens de inicio y fin) |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; el pipeline usa fp32 con autocast bfloat16, y se indica que cargar con `torch_dtype=torch.bfloat16` funciona |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería diffusers, pipeline personalizado) |

## Arquitectura y entrenamiento

El denoiser es un diffusion transformer de 100,6M de parámetros que trabaja sobre latentes de 128×16×16 (256 tokens, sin patchify) en el espacio del VAE de FLUX.2. El método de entrenamiento es flow matching con rectified flow y classifier-free guidance, con una rama incondicional aprendida como prompt nulo. El codificador de texto es un transformer bidireccional pre-norm de 12 capas, anchura 512, 8 cabezas de query y 2 cabezas key/value, dimensión de cabeza 64, embeddings posicionales rotatorios, MLP SwiGLU con hidden 1536 y RMSNorm; usa un tokenizador BPE a nivel de byte de 16.384 tokens entrenado sobre las captions de entrenamiento, y trunca los prompts a 190 tokens más inicio y fin. El decodificador es el FLUX.2 small decoder preentrenado y congelado (Apache-2.0), incluido sin cambios en `vae/`.

El entrenamiento se realizó desde cero sobre el dataset QLNI/FLUX-Reason-6M-flux2-latents, con 235.000 pasos, batch size 512 (aproximadamente 120M de muestras) y una sola NVIDIA RTX PRO 6000, en torno a 80 GPU-horas. El codificador de texto se preentrenó primero de forma independiente (la model card se corta en ese punto). El sampler recomendado es Euler con 50 pasos, CFG 4.0, time-grid shift 1.5 y guidance desactivada por debajo de t=0.05; para generación rápida se usan 20 pasos. Los benchmarks se midieron con pesos fp32 bajo autocast bfloat16.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución fija de 256×256 en RGB.
- Procesamiento por lotes: acepta una lista de prompts o `num_images_per_prompt` para varias imágenes por prompt.
- Control de generación mediante semilla (`torch.Generator`), pasos de inferencia, guidance scale y shift del time-grid.
- Generación rápida con 20 pasos frente a los 50 pasos de calidad por defecto.
- Comprensión de prompts en inglés únicamente, con truncado a 190 tokens.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta soporte de negative prompts arbitrarios: la rama incondicional es un prompt nulo aprendido y los negative prompts no formaron parte del entrenamiento.

## Casos de uso

- Experimentación académica en modelos generativos pequeños: sirve como banco de pruebas reproducible para estudiar flow matching y rectified flow con menos de 150M de parámetros entrenables y un único GPU.
- Prototipado rápido de pipelines texto-a-imagen: al ocupar 0,8 GB de repositorio y requerir poca VRAM, permite iterar sobre prompts y parámetros de muestreo en entornos con recursos limitados.
- Generación de miniaturas o iconos de baja resolución: la salida fija de 256×256 es adecuada para avatares, placeholders o assets de interfaces que luego se reescalan.
- Investigación sobre tokenizadores y codificadores de texto desde cero: el codificador BPE de 16.384 tokens y 12 capas puede estudiarse de forma aislada para analizar su impacto en la fidelidad al prompt.
- Evaluación comparativa de decodificadores VAE: al reutilizar el FLUX.2 small decoder congelado, permite aislar el efecto del denoiser frente al decodificador en la calidad final.
- Docencia y divulgación: un modelo completo y entrenado desde cero en 80 GPU-horas es un ejemplo didáctico viable para explicar la arquitectura de un sistema texto-a-imagen de principio a fin.
- Generación por lotes en pruebas automatizadas: la API de diffusers con listas de prompts facilita generar conjuntos de imágenes de test para pipelines de evaluación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre GenEval 2 (36 prompts fijos, semilla 0, 50 pasos, CFG 4.0):

| Modelo | Soft-TIFA GM | Soft-TIFA AM |
|---|---|---|
| AuroraIMG2-100M | 10,80 | 48,62 |
| AuroraIMG2-50M-Preview | 6,00 | 36,03 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de texto, al tratarse de un modelo de imagen. Tampoco se proporcionan comparaciones con otros modelos texto-a-imagen de la misma categoría.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 100,6M de parámetros en el denoiser, 44,9M en el codificador de texto y 27,9M en el decodificador, el modelo completo en bfloat16 ronda los 350 MB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el entrenamiento se realizó en una NVIDIA RTX PRO 6000, y la inferencia no requiere hardware de gama alta.
- GPU de consumo: sí, cabe en tarjetas consumer con suficiente VRAM para el pipeline de diffusers; no se especifica un mínimo exacto.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained` y `custom_pipeline` (requiere `trust_remote_code=True`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se documenta que 20 pasos funcionan para generación rápida frente a los 50 pasos de calidad, pero sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuroraIMG2-100M | 100,6M (denoiser) + 44,9M (texto) | 256×256 fija | 190 tokens | Apache-2.0 | Hugging Face (diffusers, pipeline personalizado) |
| AuroraIMG2-50M-Preview | 50M (predecesor) | No disponible en la información | No disponible | No disponible en la información | Hugging Face |
| FLUX.2 small decoder | 27,9M (solo decodificador) | No aplica (decodificador) | No aplica | Apache-2.0 | Hugging Face (black-forest-labs) |

No se dispone en la información proporcionada de comparaciones con otros modelos texto-a-imagen de tamaño similar (por ejemplo, variantes tiny de Stable Diffusion o modelos de investigación equivalentes), por lo que la comparativa se limita al predecesor directo y al componente VAE reutilizado.

## Limitaciones y advertencias

- Resolución fija de 256×256 impuesta por la arquitectura; no admite otras resoluciones ni aspect ratios.
- Solo inglés: los prompts en otros idiomas no están soportados y el tokenizador se entrenó sobre captions en inglés.
- Límite de 190 tokens de prompt, con truncado del texto excedente.
- No admite negative prompts arbitrarios; la rama incondicional es un prompt nulo aprendido, por lo que los negative prompts convencionales no funcionan como en otros modelos.
- Riesgo de alucinación visual y de baja fidelidad al prompt: los valores Soft-TIFA de 10,80 (GM) y 48,62 (AM) indican un rendimiento modesto en la evaluación GenEval 2, coherente con su tamaño reducido.
- Sesgos: no se documentan análisis de sesgos; al entrenarse sobre un dataset derivado de FLUX-Reason-6M, puede heredar sesgos de composición y representación de ese corpus.
- Requiere `trust_remote_code=True` por el pipeline personalizado, lo que implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en producción.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como investigación y no se documentan garantías de calidad para producción.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que sugiere una adopción muy limitada y escasa validación externa.
- No se documentan cuantizaciones oficiales ni soporte para runtimes optimizados más allá de diffusers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AuroraAI-Research/AuroraIMG2-100M
- Predecesor AuroraIMG2-50M-Preview: https://huggingface.co/AuroraAI-Research/AuroraIMG2-50M-Preview
- Decodificador FLUX.2 small decoder: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Dataset de entrenamiento: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Muestras generadas: https://huggingface.co/AuroraAI-Research/AuroraIMG2-100M/resolve/main/samples/grid.png
- Papers referenciados en los tags (arXiv): 2505.02831, 2510.05491, 2512.16853, 2512.12386 (disponibles en https://arxiv.org/abs/<id>)
