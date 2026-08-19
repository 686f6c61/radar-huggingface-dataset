# biali/stable-diffusion-2-base

## Resumen

Stable Diffusion v2-base es un modelo de difusión latente para generación de imágenes a partir de texto, desarrollado por Robin Rombach y Patrick Esser en Stability AI. Se trata de la versión base de la segunda generación de Stable Diffusion, entrenada desde cero en dos fases: primero 550.000 pasos a resolución 256x256 y posteriormente 850.000 pasos a 512x512, sobre un subconjunto del dataset LAION-5B filtrado con un clasificador NSFW y un umbral de puntuación estética de 4.5. El modelo emplea un codificador de texto fijo OpenCLIP-ViT/H y una arquitectura de difusión latente, lo que permite generar imágenes de alta calidad a partir de prompts en lenguaje natural.

Con aproximadamente 865 millones de parámetros, este modelo está diseñado para tareas de texto a imagen y es adecuado para investigación, creación artística y herramientas educativas. Su relevancia actual radica en ser una referencia estable y ampliamente utilizada en la comunidad open source, con soporte en las bibliotecas `diffusers` y `stablediffusion`. La licencia CreativeML Open RAIL++-M permite uso comercial con restricciones, aunque la model card original indica que está destinado principalmente a fines de investigación.

La versión alojada en este repositorio (`biali/stable-diffusion-2-base`) es un espejo de los pesos oficiales en formato `safetensors`, con un tamaño de repositorio de 25,9 GB. No se proporcionan datos adicionales sobre cuantizaciones, benchmarks o requisitos de hardware más allá de las recomendaciones estándar de la documentación original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (U-Net + text encoder OpenCLIP-ViT/H) |
| Parametros totales | 865.910.724 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; el prompt se codifica con CLIP) |
| Tipos de cuantizacion | no disponible (se usa típicamente fp16 en diffusers, pero no hay cuantizaciones oficiales publicadas) |
| Idiomas soportados | Ingles (segun la model card original) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Stable Diffusion v2-base es un modelo de difusión latente (Latent Diffusion Model) que combina un autoencoder variacional (VAE) para comprimir imágenes al espacio latente, un U-Net que realiza el proceso de denoising en ese espacio, y un codificador de texto fijo OpenCLIP-ViT/H que convierte los prompts en embeddings. El entrenamiento se realizó en dos etapas: primero 550.000 pasos a resolución 256x256 sobre un subconjunto de LAION-5B filtrado con el clasificador LAION-NSFW (punsafe=0.1) y un predictor de puntuación estética con umbral >=4.5; posteriormente se continuó durante 850.000 pasos a 512x512 utilizando solo imágenes con resolución mayor o igual a 512x512. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es supervisado de forma puramente generativa.

Una innovación destacable es el uso de un codificador de texto fijo (OpenCLIP-ViT/H) en lugar de entrenar un codificador específico, lo que reduce el coste computacional y permite reutilizar representaciones semánticas robustas. El modelo no incorpora mecanismos como decodificación especulativa ni atención lineal; su arquitectura es la estándar de difusión latente con atención multi-cabeza en el U-Net.

## Capacidades

- Generación de imágenes fotorrealistas y artísticas a partir de prompts de texto en inglés.
- Edición de imágenes mediante técnicas de inpainting y outpainting (aunque no se incluye un pipeline específico en este repositorio, la arquitectura base lo permite).
- Control de composición y estilo mediante prompts descriptivos, con soporte para conceptos como "a photo of an astronaut riding a horse on mars".
- No soporta tool calling ni function calling, ya que es un modelo exclusivamente generativo de imágenes.
- No es multimodal en el sentido de aceptar entrada de imagen; solo texto a imagen.
- Capacidades multilingües limitadas: el codificador CLIP está entrenado principalmente en inglés, por lo que prompts en otros idiomas pueden degradar la calidad de generación.

## Casos de uso

- Generación de arte conceptual y diseño: el modelo permite crear ilustraciones, bocetos y conceptos visuales a partir de descripciones textuales, útil para diseñadores y artistas que necesitan explorar variaciones rápidas.
- Creación de contenido para videojuegos: se puede usar para generar texturas, fondos y assets visuales a partir de prompts, acelerando el prototipado de escenarios.
- Herramientas educativas: sirve para ilustrar conceptos abstractos en entornos de aprendizaje, como generar diagramas o escenas históricas a partir de texto.
- Investigación en generación de imágenes: es un modelo de referencia para estudiar sesgos, alucinaciones y limitaciones de los modelos de difusión, así como para desarrollar técnicas de alineación.
- Prototipado visual en marketing: permite generar imágenes de muestra para campañas publicitarias o presentaciones sin necesidad de sesiones fotográficas.
- Accesibilidad y creatividad: personas sin habilidades de dibujo pueden materializar ideas visuales mediante prompts, fomentando la expresión creativa en ámbitos como la escritura o el diseño amateur.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original no incluye métricas como FID, CLIP score u otros indicadores de calidad de imagen. Se recomienda consultar el paper de Latent Diffusion (Rombach et al., CVPR 2022) para referencias cualitativas, pero no se proporcionan números concretos en este repositorio.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales en la información proporcionada. Como referencia típica para Stable Diffusion v2-base, se requiere aproximadamente 3,5 GB de VRAM en fp16 y 5,5 GB en fp32 para generar imágenes a 512x512 con un batch de 1.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16, como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o superiores (A100, H100 para producción). No se ha probado en GPUs de gama baja.
- Compatibilidad con consumer GPU: sí, es posible ejecutar en GPUs de consumo con 6 GB o más, usando técnicas como `enable_attention_slicing()` para reducir el uso de memoria.
- Opciones de despliegue: la biblioteca `diffusers` es la vía principal, con soporte para `StableDiffusionPipeline`. También se puede usar el repositorio `stablediffusion` de Stability AI. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos oficiales. En una RTX 3090, una generación de 512x512 suele tardar entre 2 y 5 segundos con 50 pasos de inferencia, pero esto es una estimación no verificada en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|
| Stable Diffusion v1.5 | ~860 M | 512x512 | CreativeML Open RAIL-M | Predecesor, usa CLIP ViT-L como text encoder |
| Stable Diffusion v2-base (este) | 865,9 M | 512x512 | CreativeML Open RAIL++-M | Usa OpenCLIP-ViT/H, entrenado con filtrado NSFW más estricto |
| Stable Diffusion v2.1 | 865,9 M | 768x768 | CreativeML Open RAIL++-M | Variante con mayor resolución y entrenamiento adicional |

La comparación se basa en datos públicos conocidos; no se dispone de benchmarks oficiales en la información proporcionada. La principal diferencia entre v1.5 y v2-base es el codificador de texto (CLIP ViT-L vs OpenCLIP-ViT/H) y el filtrado del dataset, lo que afecta al estilo y a la calidad de los prompts.

## Limitaciones y advertencias

- El modelo no logra un fotorrealismo perfecto; las imágenes pueden presentar artefactos, deformaciones o texturas irreales.
- No puede renderizar texto legible; los intentos de generar palabras o frases suelen producir caracteres ilegibles.
- Tiene dificultades con tareas de composicionalidad compleja, como "un cubo rojo encima de una esfera azul", generando resultados inconsistentes.
- Las caras y las personas pueden aparecer distorsionadas, especialmente en primer plano.
- El modelo fue entrenado con datos en inglés; prompts en otros idiomas pueden degradar significativamente la calidad.
- Puede reproducir sesgos presentes en el dataset LAION-5B, incluyendo estereotipos culturales, de género y raciales.
- Riesgo de alucinación visual: el modelo puede generar imágenes que no corresponden a la intención del prompt, especialmente con conceptos abstractos o poco frecuentes.
- La licencia Open RAIL++-M restringe el uso para generar contenido dañino, difamatorio o ilegal, y prohíbe el uso para vigilancia masiva o aplicaciones que violen derechos humanos.
- No se recomienda su uso para representaciones fieles de personas o eventos reales, ya que no fue entrenado para ser factual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/biali/stable-diffusion-2-base
- Repositorio oficial de Stable Diffusion: https://github.com/Stability-AI/stablediffusion
- Paper de Latent Diffusion: https://arxiv.org/abs/2112.10752
- Documentación de diffusers: https://huggingface.co/docs/diffusers/index
