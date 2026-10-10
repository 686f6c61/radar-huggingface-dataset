# Jinstudio/stable-diffusion-2-1-unclip-small

## Resumen
El modelo `Jinstudio/stable-diffusion-2-1-unclip-small` es un espejo no oficial del repositorio `stabilityai/stable-diffusion-2-1-unclip-small`, que a su vez es una versión ajustada de Stable Diffusion 2.1. Se trata de un modelo de difusión latente para generación y modificación de imágenes que acepta, además del prompt de texto, un embedding de imagen CLIP con ruido adjustable. Esto permite crear variaciones de una imagen de entrada o encadenarlo con un prior de texto a imagen. Fue desarrollado originalmente por Robin Rombach y Patrick Esser, y la versión aquí alojada no tiene afiliación con Stability AI. El repositorio pesa 12,8 GB e incluye pesos en formato safetensors con 869.517.764 parámetros. Está pensado exclusivamente para fines de investigación según su model card, aunque la licencia CreativeML Open RAIL++-M permite cierto uso comercial bajo condiciones. Su relevancia radica en que ofrece una vía ligera para generar variaciones de imágenes sin necesidad de un pipeline completo de texto a imagen, y sirve como componente en arquitecturas unCLIP.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (Latent Diffusion Model) con condicionamiento unCLIP |
| Parámetros totales | 869.517.764 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (límite estándar del text encoder CLIP; no especificado en la model card) |
| Tipos de cuantización | no se especifican; pesos en safetensors (fp16/fp32). Compatible con cuantización externa (int8, fp16) mediante diffusers |
| Idiomas soportados | inglés (entrenado principalmente con subtítulos en inglés; no se garantiza buen rendimiento en otros idiomas) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un Latent Diffusion Model (LDM) que sigue la arquitectura presentada en el paper "High-Resolution Image Synthesis With Latent Diffusion Models" (Rombach et al., CVPR 2022). Utiliza un autoencoder variacional (VAE) para comprimir imágenes en un espacio latente, una U-Net para el proceso de denoising y un text encoder fijo preentrenado, OpenCLIP-ViT/H, para codificar las indicaciones textuales. La particularidad de esta versión unCLIP es que la U-Net ha sido modificada para aceptar además un embedding de imagen CLIP al que se le puede añadir ruido controlado mediante el parámetro `noise_level` (0 significa sin ruido, 1000 ruido completo). Esto permite generar variaciones de una imagen de entrada o encadenar el modelo con un prior de texto a imagen CLIP. El modelo se obtuvo por fine-tuning de Stable Diffusion 2.1, pero no se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El repositorio es un espejo del modelo original ya deprecado y no está afiliado a Stability AI.

## Capacidades
- Generación de variaciones de imagen a partir de una imagen de entrada: acepta un embedding CLIP de imagen con ruido adjustable y produce imágenes similares pero no idénticas.
- Condicionamiento conjunto de texto e imagen: puede combinarse con un prior de texto a imagen para generar imágenes desde una descripción textual.
- Ajuste del nivel de ruido: el parámetro `noise_level` permite controlar cuánta información de la imagen original se preserva, desde una variación sutil hasta una generación más libre.
- Integración con la librería `diffusers` mediante el pipeline `StableUnCLIPImg2ImgPipeline`.
- No es un modelo de lenguaje: no genera texto, código, matemáticas ni mantiene conversaciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas: solo entrenado con subtítulos en inglés.
- No dispone de modo de pensamiento, visión general (más allá de la codificación de imágenes para condicionamiento), audio ni otras modalidades.

## Casos de uso
- Generación de variaciones para diseño gráfico: a partir de un boceto o una fotografía, el modelo produce alternativas visuales manteniendo la esencia de la imagen original gracias al condicionamiento con embedding CLIP y al control finode del ruido.
- Aumento de datos para entrenamiento de modelos de visión: se pueden generar múltiples variaciones de una imagen de un dataset para aumentar la diversidad y robustez de clasificadores o detectores.
- Exploración creativa en arte digital: artistas pueden introducir una imagen base y experimentar con distintos niveles de ruido para obtener variaciones estilísticas sin necesidad de escribir prompts detallados.
- Prototipado rápido en publicidad y marketing: dado un producto o una composición, se generan variaciones para campañas visuales, adaptando el nivel de ruido para mantener la identidad de marca.
- Retoque o modificación controlada de imágenes: con un nivel de ruido bajo, el modelo puede modificar ligeramente una imagen existente (por ejemplo, cambiar el fondo o la iluminación) preservando la estructura principal.
- Integración en pipelines de texto a imagen con prior CLIP: encadenado con un modelo prior (como el de Stable Diffusion unCLIP) permite generar imágenes desde texto, usando este modelo como decodificador de variaciones.
- Investigación sobre sesgos y limitaciones de modelos generativos: al ser un modelo pequeño y de acceso abierto, sirve para estudiar cómo se propagan sesgos de LAION-5B en tareas de variación de imagen.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: el modelo principal (U-Net) tiene 869 millones de parámetros; en fp16 ocupa aproximadamente 1,7 GB. El pipeline completo incluye además el text encoder OpenCLIP-ViT/H (unos 340 millones de parámetros) y el VAE (unos 83 millones), por lo que el conjunto puede requerir entre 6 y 8 GB de VRAM en fp16 para inferencia, dependiendo de la resolución y el tamaño del lote.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4080 o RTX 4090 pueden ejecutar el modelo sin problemas. En el ámbito profesional, A100, H100 o V100 también son válidas.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con al menos 6 GB de VRAM en fp16. Con cuantización a int8 podría reducirse aún más.
- Opciones de despliegue: principalmente mediante la librería `diffusers` con el pipeline `StableUnCLIPImg2ImgPipeline`. No se proporcionan pesos en GGUF, ONNX u otros formatos en el repositorio, aunque es posible convertirlos con herramientas externas.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jinstudio/stable-diffusion-2-1-unclip-small (este) | 869.517.764 (U-Net) | 77 tokens (CLIP) | openrail++ | HuggingFace, diffusers |
| stabilityai/stable-diffusion-2-1 (base) | ~865M (U-Net) | 77 tokens (CLIP) | openrail++ | HuggingFace, diffusers |
| stabilityai/stable-diffusion-2-1-unclip (full) | no disponible | 77 tokens (CLIP) | openrail++ | HuggingFace, diffusers |
| Otros modelos de variación de imagen como Kandinsky 2.1 | no disponible | no disponible | Apache 2.0 | HuggingFace, diffusers |

No se dispone de datos comparativos de rendimiento (benchmarks) en la información proporcionada. La principal diferencia entre este modelo y la versión "full" de unCLIP radica en el tamaño del codificador de imagen CLIP utilizado, siendo la versión "small" más ligera.

## Limitaciones y advertencias
- El modelo no alcanza un fotorrealismo perfecto.
- No puede renderizar texto legible en las imágenes generadas.
- Tiene dificultades con tareas de composición complejas, como "un cubo rojo sobre una esfera azul".
- Los rostros y las personas en general pueden no generarse correctamente.
- Fue entrenado principalmente con subtítulos en inglés, por lo que su rendimiento en otros idiomas es deficiente.
- La parte de autoencoder es con pérdida (lossy), lo que limita la fidelidad de reconstrucción.
- Fue entrenado con un subconjunto de LAION-5B, que contiene contenido adulto, violento y sexual. Aunque se filtró parcialmente con el detector NSFW de LAION, pueden persistir sesgos y contenido inapropiado.
- La model card indica que el modelo está destinado únicamente a fines de investigación, aunque la licencia CreativeML Open RAIL++-M permite el uso comercial bajo ciertas restricciones. Es responsabilidad del usuario verificar el cumplimiento.
- Es un repositorio espejo no oficial del modelo original ya deprecado, sin afiliación con Stability AI.
- Riesgo de alucinación visual: puede generar detalles inexistentes o distorsionados, especialmente en rostros y manos.
- No debe usarse para crear representaciones dañinas, discriminatorias, violentas o que violen derechos de autor.

## Enlaces
- [HuggingFace: Jinstudio/stable-diffusion-2-1-unclip-small](https://huggingface.co/Jinstudio/stable-diffusion-2-1-unclip-small)
- [Modelo original (deprecado): stabilityai/stable-diffusion-2-1-unclip-small](https://huggingface.co/stabilityai/stable-diffusion-2-1-unclip-small)
- [Repositorio GitHub de Stability AI](https://github.com/Stability-AI/stablediffusion)
- [Paper Latent Diffusion Models (arXiv:2112.10752)](https://arxiv.org/abs/2112.10752)
- [Paper sobre CLIP (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [OpenCLIP en GitHub](https://github.com/mlfoundations/open_clip)
- [Documentación de diffusers](https://huggingface.co/docs/diffusers/index)
- [Licencia CreativeML Open RAIL++-M](https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL)
- [Dataset LAION-5B](https://laion.ai/blog/laion-5b/)
