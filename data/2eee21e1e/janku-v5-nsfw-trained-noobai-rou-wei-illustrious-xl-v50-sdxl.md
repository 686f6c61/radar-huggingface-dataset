# 2eee21e1e/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl

## Resumen

Janku v5 NSFW trained NoobAI-RouWei-Illustrious XL v50 es un modelo de generación de imágenes texto-a-imagen derivado de Stable Diffusion XL, publicado en Hugging Face por el usuario 2eee21e1e a partir de un modelo original alojado en Civitai y atribuido al creador janxd. Se trata de un merge de tres checkpoints de la familia SDXL orientados a ilustración de estilo anime: Illustrious XL (OnomaAIResearch), NoobAI-XL 1.1 (Laxhar) y RouWei 0.8 (Minthy), con un ajuste adicional (fine-tuning) posterior orientado a contenido para adultos.

El modelo no introduce una arquitectura nueva: mantiene el UNet de SDXL con 2.567.463.684 parámetros y el pipeline `StableDiffusionXLPipeline` de la librería diffusers. Su relevancia es práctica más que arquitectónica: condensa en un único checkpoint las capacidades de tres bases de anime muy populares y añade mejoras estéticas declaradas por el autor (ojos más definidos, mayor brillo y contraste, iluminación de sombras, colores más saturados, líneas más nítidas y pelo con partículas brillantes).

La información pública disponible es muy limitada: la model card es mínima, no incluye detalles de entrenamiento, dataset, hiperparámetros ni benchmarks, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Todo lo que sigue se basa estrictamente en los metadatos del repositorio y en la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + VAE + doble text encoder CLIP), pipeline `StableDiffusionXLPipeline` |
| Parametros totales | 2.567.463.684 (dato real del safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin ventana de contexto textual más allá del límite de tokens del text encoder de SDXL) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión nativa; no se listan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | en (inglés) |
| Licencia | FAIPL-1.0-SD (`faipl-1.0-sd`, etiquetada como `other`) |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL estándar: un UNet con bloques de atención y residuales, un VAE para codificar y decodificar latentes, y dos text encoders CLIP (uno para el prompt principal y otro para el prompt secundario). El modelo se distribuye como checkpoint completo de 2.567.463.684 parámetros y 6,9 GB en el repositorio, sin cuantizaciones alternativas publicadas.

El proceso de creación declarado es un merge de tres checkpoints base (Illustrious XL early release v0, NoobAI-XL 1.1 y RouWei 0.8) seguido de un entrenamiento adicional (el nombre del modelo incluye "nsfw-trained"). No se publican en la información disponible el número de pasos de entrenamiento, el dataset utilizado, la composición del mismo, ni si hubo técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de las heredadas de las bases (por ejemplo, el ajuste de SDXL para ilustración anime que aportan Illustrious y NoobAI). Las etiquetas del autor sugieren un énfasis en calidad estética: mejores ojos, brillo, contraste, iluminación de sombras, colores más vivos, líneas más nítidas y pelo con partículas brillantes.

## Capacidades

- Generación de imágenes texto-a-imagen con el pipeline `StableDiffusionXLPipeline` de diffusers.
- Especialización en ilustración de estilo anime, con soporte para etiquetas de personajes, artistas y descripciones de escena.
- Generación de contenido para adultos (el repositorio está etiquetado como `not-for-all-audiences` y `hentai`).
- Control estético mediante prompts: el autor declara mejoras en ojos, brillo, contraste, iluminación de sombras, saturación de color, nitidez de líneas y efectos de pelo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite desplegarlo en infraestructura de inferencia compatible con diffusers.
- Soporte de prompt positivo y negativo según el comportamiento estándar de SDXL.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; son capacidades ajenas a un modelo de difusión de imagen.

## Casos de uso

- Ilustración de personajes anime para proyectos personales: el modelo está entrenado para responder a etiquetas de personajes y artistas, por lo que se puede usar para generar ilustraciones consistentes con un estilo concreto a partir de prompts descriptivos.
- Prototipado rápido de arte conceptual: al ser un checkpoint único que combina tres bases de anime, permite explorar variaciones de estilo (NoobAI, Illustrious, RouWei) sin cambiar de modelo, útil en fases tempranas de diseño.
- Generación de contenido para adultos en entornos controlados: el ajuste NSFW declarado lo hace adecuado para plataformas que requieran este tipo de material, siempre que se cumplan los términos de la licencia FAIPL-1.0-SD y la legislación aplicable.
- Creación de assets para videojuegos o cómics de estilo anime: las mejoras declaradas en nitidez de líneas y saturación de color facilitan la producción de imágenes con acabado limpio para sprites, fondos o viñetas.
- Experimentación con merges de modelos de difusión: investigadores interesados en estudiar el efecto de combinar checkpoints (Illustrious, NoobAI, RouWei) y de un fine-tuning posterior pueden usar este modelo como caso de estudio reproducible con diffusers.
- Despliegue en endpoints compatibles: gracias a la etiqueta `endpoints_compatible`, se puede integrar en servicios de inferencia gestionados que acepten pipelines de diffusers para generar imágenes bajo demanda.
- Generación de imágenes para investigación estética: permite analizar cómo el ajuste declarado (brillo, contraste, ojos) afecta a la percepción visual en comparación con las bases originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, evaluaciones humanas) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un checkpoint SDXL completo de 2.567.463.684 parámetros en safetensors, se requiere aproximadamente 6,9 GB solo para los pesos; en la práctica, la inferencia en fp16 necesita del orden de 10-12 GB de VRAM, y en fp32 alrededor de 20 GB. Estas cifras son estimaciones basadas en el tamaño del checkpoint, no datos publicados por el autor.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para inferencia cómoda en fp16; RTX 3090 o 4080 también son viables.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando fp16 y técnicas de offloading si fuera necesario. En tarjetas de 8 GB puede requerir `enable_model_cpu_offload` o `enable_sequential_cpu_offload` de diffusers.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline`), así como servidores compatibles con endpoints que acepten pipelines de diffusers. No se documentan variantes GGUF ni compatibilidad con llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Janku v5 NSFW trained NoobAI-RouWei-Illustrious XL v50 | 2.567.463.684 | no disponible | Anime, NSFW, merge de tres bases | FAIPL-1.0-SD | Hugging Face y Civitai |
| Laxhar/noobai-XL-1.1 | no disponible en la información | no disponible | Anime, base de ilustración | no disponible en la información | Hugging Face |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | no disponible en la información | no disponible | Anime, base de ilustración | no disponible en la información | Hugging Face |
| Minthy/RouWei-0.8 | no disponible en la información | no disponible | Anime, base de ilustración | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a la relación de dependencia (Janku v5 es un merge y fine-tuning de los tres).

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences` y `hentai`; no es apto para entornos sin control de edad ni para uso generalista.
- Licencia restrictiva: la licencia FAIPL-1.0-SD (`faipl-1.0-sd`) impone condiciones específicas para uso comercial; es imprescindible revisar el texto completo en el enlace oficial antes de cualquier despliegue productivo.
- Sesgos conocidos: al estar entrenado sobre bases de anime, puede reproducir sesgos estilísticos y de representación de las mismas; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, artefactos en manos y ojos, o inconsistencias entre prompt e imagen; las mejoras declaradas por el autor no eliminan este riesgo.
- Limitaciones de idioma: solo se declara soporte de inglés (`en`); los prompts en otros idiomas pueden degradar la calidad.
- Documentación escasa: no se publican detalles de entrenamiento, dataset ni hiperparámetros, lo que dificulta la reproducibilidad y la evaluación rigurosa.
- Sin métricas de calidad: la ausencia de benchmarks impide comparar objetivamente su rendimiento frente a las bases originales.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes en Hugging Face, lo que limita la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2eee21e1e/janku-v5-nsfw-trained-noobai-rou-wei-illustrious-xl-v50-sdxl
- Modelo original en Civitai: https://civitai.com/models/1277670/janku-v5-nsfw-trained-noobai-rouwei-illustrious-xl?modelVersionId=1896532
- Perfil del autor original en Civitai: https://civitai.com/user/janxd
- Licencia FAIPL-1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- Modelo base Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Modelo base NoobAI-XL 1.1: https://huggingface.co/Laxhar/noobai-XL-1.1
- Modelo base RouWei 0.8: https://huggingface.co/Minthy/RouWei-0.8
