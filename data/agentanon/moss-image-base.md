# AgentAnon/MOSS-Image-Base

## Resumen

MOSS-Image-Base es el modelo base de generación de imágenes a partir de texto (text-to-image) de la familia MOSS-Image, desarrollado por OpenMOSS. Se trata de un modelo DiT (Diffusion Transformer) de aproximadamente 5.082 millones de parámetros (5,08 B) que resuelve la síntesis de imágenes fotorrealistas con especial énfasis en el renderizado de texto dentro de la imagen, la generación de layouts y la eficiencia en el ajuste fino. Es relevante porque aborda uno de los puntos débiles clásicos de los modelos de difusión: la representación tipográfica legible y la organización espacial de objetos y texto, admitiendo indicaciones en lenguaje natural, secuencias de etiquetas y layouts en formato JSON.

El modelo se publica bajo licencia Apache 2.0 y está integrado en el ecosistema `diffusers` mediante un pipeline personalizado (`MOSSImagePipeline`). Soporta prompts en inglés y chino, lo que lo hace útil para aplicaciones bilingües de generación de carteles, infografías y materiales con texto incrustado. Su VAE incorpora el decodificador pequeño de FLUX.2, y el transformer y el codificador de texto operan en bfloat16 mientras que el VAE y el ruido inicial usan float32.

La versión Base se complementa con una variante SFT (supervisada) que, según la model card, produce una agrupación de texto más clara y layouts más organizados. El modelo está pensado tanto para investigación como para producción, con soporte para ComfyUI, Gradio y una API alojada (MOSI).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) |
| Parámetros totales | 5.082.308.624 (≈5,08 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16 para transformer y codificador de texto; VAE y ruido inicial en float32) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (integrado en `diffusers`) |

## Arquitectura y entrenamiento

MOSS-Image-Base es un modelo de difusión basado en una arquitectura DiT (Diffusion Transformer) de aproximadamente 5 B de parámetros. El transformer y el codificador de texto se ejecutan en bfloat16, mientras que el VAE y el ruido inicial utilizan float32; el VAE incluido emplea el decodificador pequeño de FLUX.2. El pipeline personalizado (`pipeline_moss_image`) admite parámetros como `uncond_skip_layers`, que permite omitir capas en la rama incondicional para controlar el equilibrio entre fidelidad al prompt y calidad visual, y `guidance_scale`, con un valor recomendado de 3.0 en el ejemplo de la model card.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que la familia incluye una variante SFT (ajuste supervisado) que mejora la agrupación de texto y la organización de layouts respecto a la versión Base. El modelo admite tres modalidades de condicionamiento: lenguaje natural, secuencias de etiquetas y layouts en JSON para controlar la colocación de texto y la disposición de objetos.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable; el ejemplo oficial usa 1024x1024 y 50 pasos de inferencia.
- Renderizado de texto de alta calidad dentro de la imagen, incluyendo texto manuscrito y en chino, con control de agrupación tipográfica.
- Control de layout mediante JSON para posicionar texto y organizar objetos en la escena.
- Condicionamiento mediante secuencias de etiquetas, además del lenguaje natural.
- Soporte bilingüe inglés-chino en los prompts.
- Ajuste fino eficiente (fine-tuning) según la descripción del repositorio oficial.
- Integración con `diffusers` mediante `DiffusionPipeline` y el pipeline personalizado `pipeline_moss_image`.
- Compatibilidad con ComfyUI (plugin nativo disponible en ComfyUI Manager) y con una interfaz Gradio.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento, al tratarse de un modelo generativo de imágenes.

## Casos de uso

- Generación de carteles y material promocional con texto incrustado: el modelo renderiza titulares y cuerpos de texto legibles y permite controlar su colocación mediante layouts JSON, lo que resulta adecuado para pósters, banners y flyers bilingües.
- Maquetación de infografías y paneles: la capacidad de organizar objetos y texto mediante JSON facilita la creación de composiciones estructuradas como pizarras, diagramas anotados o fichas técnicas.
- Prototipado de interfaces y mockups: se pueden generar pantallas y paneles con etiquetas de texto reales, útil para equipos de diseño que necesitan iterar rápidamente sobre propuestas visuales.
- Ilustración editorial con texto integrado: portadas de revista, cómics o viñetas donde el texto forma parte de la imagen y debe ser legible.
- Generación de material didáctico: láminas, esquemas y tarjetas educativas con anotaciones en inglés o chino, aprovechando el soporte bilingüe.
- Ajuste fino para dominios verticales: al ser un modelo base con licencia Apache 2.0 y orientado al fine-tuning eficiente, sirve como punto de partida para adaptar el estilo a una marca o a un sector concreto (moda, inmobiliaria, alimentación).
- Integración en pipelines de diseño automatizado: mediante ComfyUI o el pipeline de `diffusers`, se puede encadenar con otros nodos (upscaling, segmentación, inpainting) para flujos de producción por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5,08 B de parámetros en bfloat16, los pesos del transformer rondan los 10 GB, a lo que hay que sumar el codificador de texto, el VAE y las activaciones, por lo que se recomienda una GPU con al menos 16-24 GB de VRAM para 1024x1024.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el ejemplo oficial requiere una GPU NVIDIA con soporte CUDA y PyTorch 2.9 o superior.
- Cabe en GPU de consumo: no confirmado en la documentación; por el tamaño de los pesos, es previsible que quepa en tarjetas de 24 GB (por ejemplo, RTX 4090) y posiblemente en 16 GB con optimizaciones, aunque no se detalla.
- Opciones de despliegue: `diffusers` (pipeline personalizado `pipeline_moss_image`), ComfyUI (plugin nativo), Gradio, y opciones de CPU offload y compilación mencionadas en el quick start del proyecto. También existe una API alojada (MOSI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, la familia MOSS-Image se posiciona en el segmento de modelos de difusión de aproximadamente 5 B de parámetros con foco en el renderizado de texto, frente a otras familias de text-to-image de tamaño similar; sin embargo, no se aportan cifras que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-Base | ≈5,08 B | no disponible | Apache 2.0 | Hugging Face, ModelScope, ComfyUI, API MOSI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información disponible; como todo modelo generativo entrenado con datos a gran escala, es previsible que reproduzca sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación visual: puede generar texto ilegible o mal formado en escenas complejas, y la variante Base produce, según la model card, una agrupación de texto menos clara que la variante SFT.
- Cobertura lingüística limitada a inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La longitud de contexto y los límites de longitud de prompt no están documentados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes de terceros (por ejemplo, el decodificador VAE de FLUX.2) antes de desplegar en producción.
- El modelo requiere `trust_remote_code=True` y un pipeline personalizado, lo que implica ejecutar código del repositorio; es recomendable auditar dicho código antes de usarlo en entornos productivos.
- No se han publicado métricas de rendimiento ni comparativas oficiales en la información disponible, por lo que la evaluación de calidad debe hacerse de forma empírica.

## Enlaces

- Hugging Face: https://huggingface.co/AgentAnon/MOSS-Image-Base
- Hugging Face (OpenMOSS-Team, Base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Hugging Face (OpenMOSS-Team, SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- GitHub oficial: https://github.com/OpenMOSS/MOSS-Image
- GitHub (espejo): https://github.com/Wanfeng1028/moss-image
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Guía de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Plataforma API MOSI: https://platform.mosi.cn/?utm_source=huggingface&utm_medium=readme&utm_campaign=imageapi
- X (Twitter) de OpenMOSS: https://x.com/Open_MOSS
- Discord: https://discord.gg/nXFWEyvbb
