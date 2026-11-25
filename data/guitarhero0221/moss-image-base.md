# guitarhero0221/MOSS-Image-Base

## Resumen

MOSS-Image-Base es el modelo base de generación de imágenes a partir de texto de la familia MOSS-Image, desarrollada por OpenMOSS (el equipo detrás de la saga de modelos MOSS). Se distribuye como un pipeline de `diffusers` y está diseñado para aceptar no solo indicaciones en lenguaje natural, sino también secuencias de etiquetas y layouts en formato JSON que permiten controlar la colocación de texto y la disposición de objetos en la imagen generada. El modelo está publicado con licencia Apache 2.0 y soporta indicaciones en inglés y chino.

El checkpoint disponible cuenta con aproximadamente 5.080 millones de parámetros en formato safetensors (5.082.308.624 exactamente) y un repositorio de 27,2 GB, lo que sugiere pesos en precisión alta (bfloat16/float32) junto con el codificador de texto y el VAE. La arquitectura se apoya en un transformer de difusión con un VAE basado en el decodificador pequeño de FLUX.2, según indica la model card, e integra un codificador de texto que se ejecuta en bfloat16 mientras el VAE y el ruido inicial operan en float32.

La relevancia de este lanzamiento radica en su enfoque en el renderizado de texto dentro de la imagen (tipografía, notas manuscritas, carteles) y en el control espacial mediante JSON, capacidades que en la mayoría de modelos texto-a-imagen abiertos son todavía frágiles. La existencia de una variante SFT (MOSS-Image-SFT) permite comparar el comportamiento del modelo base frente a uno afinado para obtener agrupaciones de texto más limpias y layouts más organizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (pipeline `MOSSImagePipeline`) con VAE basado en el decodificador pequeño de FLUX.2 |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card usa bfloat16 para transformer y text encoder, float32 para VAE) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `diffusers`) |

## Arquitectura y entrenamiento

MOSS-Image-Base es un modelo de difusión texto-a-imagen implementado como pipeline personalizado de `diffusers` (`pipeline_moss_image`), que requiere `trust_remote_code=True` para cargarse. El transformer de difusión y el codificador de texto se ejecutan en bfloat16, mientras que el VAE y el ruido inicial se mantienen en float32; el VAE incorporado corresponde al decodificador pequeño de FLUX.2. El pipeline admite un parámetro `uncond_skip_layers` (por ejemplo `[22]`) que permite omitir capas en la rama incondicional, una técnica de optimización que reduce el coste computacional de la guía sin clasificador (CFG).

El modelo acepta tres modalidades de entrada: indicaciones en lenguaje natural, secuencias de etiquetas y layouts en formato JSON para controlar la posición del texto y la disposición de objetos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La familia incluye una variante SFT (MOSS-Image-SFT) que, según la model card, produce agrupaciones de texto más claras y layouts de pizarra más organizados que el modelo base. Existe un informe técnico (arXiv:2610.23374) que probablemente detalla el entrenamiento, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de indicaciones en lenguaje natural en inglés y chino.
- Renderizado de texto dentro de la imagen, incluyendo notas manuscritas, carteles y tipografía en chino (el ejemplo de la model card muestra una nota adhesiva con texto manuscrito en chino).
- Control espacial mediante layouts en formato JSON, que permiten especificar la colocación de texto y la disposición de objetos.
- Soporte de secuencias de etiquetas como alternativa a las indicaciones en lenguaje natural.
- Guía sin clasificador configurable con omisión de capas incondicionales (`uncond_skip_layers`) para ajustar calidad y coste.
- Integración con `diffusers` (versión >= 0.38), `transformers` (>= 5.3), `accelerate` (>= 1.10) y `safetensors` (>= 0.6).
- Compatibilidad con ComfyUI mediante plugin nativo (instalable desde ComfyUI Manager).
- No se ha documentado soporte de tool calling, agentes, visión de entrada ni audio; es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Generación de carteles y material promocional con texto legible: el modelo está entrenado específicamente para renderizar tipografía y notas manuscritas, por lo que resulta adecuado para crear pósters, flyers o banners donde el texto debe aparecer correctamente escrito, tanto en inglés como en chino.
- Maquetación controlada mediante JSON: en diseño editorial o publicitario se puede especificar la posición exacta de titulares, imágenes y bloques de texto usando layouts JSON, lo que facilita la integración en pipelines de generación automatizada de creatividades.
- Prototipado de interfaces y wireframes: la capacidad de colocar objetos y texto en posiciones definidas permite generar mockups de pantallas, pizarras o paneles de control con anotaciones, útil en fases tempranas de diseño de producto.
- Ilustración de documentación técnica y manuales: se pueden generar diagramas anotados o escenas con etiquetas en chino e inglés, lo que encaja en la producción de material formativo para audiencias bilingües.
- Generación de contenido para comercio electrónico: creación de imágenes de producto en contexto (por ejemplo, una nevera con una nota adhesiva) con texto promocional integrado, reduciendo la dependencia de sesiones fotográficas.
- Experimentación e investigación en modelos de difusión: al ser un modelo base con licencia Apache 2.0 y pipeline abierto en `diffusers`, sirve como punto de partida para fine-tuning, estudios de control espacial o comparativas con la variante SFT.
- Integración en flujos de trabajo de ComfyUI: artists y técnicos pueden incorporar el modelo en grafos nodales para generar variaciones con control de layout y texto sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 27,2 GB en safetensors; con transformer y text encoder en bfloat16 y VAE en float32, se requiere previsiblemente una GPU con al menos 24 GB de VRAM para ejecución completa en GPU, aunque no se dispone de una cifra oficial confirmada.
- GPU recomendadas: no disponible de forma oficial; por el tamaño del checkpoint, GPUs de clase profesional como A100 (40/80 GB) o H100 son las más seguras, y una RTX 4090 (24 GB) podría ser suficiente con optimizaciones.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y posiblemente en RTX 3090 (24 GB), aunque no está confirmado; la model card menciona opciones de CPU offload que permitirían ejecución en GPUs con menos VRAM a costa de latencia.
- Opciones de despliegue: `diffusers` (pipeline personalizado `pipeline_moss_image`), ComfyUI mediante plugin nativo, y la plataforma API MOSI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponible. La model card usa 50 pasos de inferencia con `guidance_scale=3.0` y `uncond_skip_layers=[22]`, lo que da una idea del coste típico, pero no se publican tiempos medidos.
- Requisitos de software: Python 3.10+, PyTorch 2.9+ con CUDA, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6`, `Pillow>=10`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Base | 5.082.308.624 | no disponible (ejemplos a 1024x1024) | en, zh | apache-2.0 | Hugging Face, ModelScope, ComfyUI |
| MOSS-Image-SFT | no disponible | no disponible | en, zh | no disponible en la informacion | Hugging Face, ModelScope |
| FLUX.2 (referencia por VAE) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre MOSS-Image-Base y otras alternativas en la informacion proporcionada; la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse con datos en inglés y chino, es probable que herede sesgos culturales y demográficos de esos corpus, pero no hay confirmación oficial.
- Riesgo de alucinación: como todo modelo generativo de imágenes, puede producir texto ilegible o mal escrito, objetos incoherentes y layouts que no respetan exactamente el JSON de entrada; la variante SFT se presenta como más fiable en agrupación de texto.
- Limitaciones de contexto e idioma: solo se declaran inglés y chino; no hay soporte documentado para otros idiomas, ni información sobre la longitud máxima de indicación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el pipeline requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegarlo en producción.
- Caveats de producción: el modelo se distribuye como pipeline personalizado de `diffusers`, con requisitos de versiones muy recientes (`diffusers>=0.38`, `transformers>=5.3`), lo que puede complicar la integración en entornos con dependencias fijadas. La integración en el repositorio oficial de ComfyUI está en curso, por lo que de momento requiere el plugin de ComfyUI Manager.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha, y el autor del repositorio de Hugging Face es `guitarhero0221`, no la organización oficial OpenMOSS-Team; conviene verificar la procedencia y comparar con el repositorio oficial antes de usarlo.
- No se publican métricas de calidad (FID, CLIP score, precisión de texto) en la información disponible.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/guitarhero0221/MOSS-Image-Base
- Hugging Face oficial (MOSS-Image-Base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Hugging Face oficial (MOSS-Image-SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- GitHub: https://github.com/OpenMOSS/MOSS-Image
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
