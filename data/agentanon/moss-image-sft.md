# AgentAnon/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de generación de imágenes texto-a-imagen de la familia MOSS-Image, desarrollado por OpenMOSS y publicado en Hugging Face bajo el identificador AgentAnon/MOSS-Image-SFT. Se trata de un ajuste fino supervisado (SFT) del modelo base OpenMOSS-Team/MOSS-Image-Base, con el que comparte arquitectura y pipeline de inferencia. El modelo está orientado a la generación de imágenes con texto integrado preciso, control de disposición espacial y manejo de prompts largos, capacidades que lo diferencian de los modelos texto-a-imagen convencionales centrados únicamente en la fidelidad visual.

El modelo emplea una arquitectura de tipo Diffusion Transformer (DiT) con aproximadamente 5.082 millones de parámetros (5,08B), según los pesos en safetensors publicados. Su pipeline se integra en la librería diffusers mediante la clase MOSSImagePipeline y requiere versiones recientes del ecosistema (diffusers >= 0.38, transformers >= 5.3, PyTorch >= 2.9). Soporta prompts en lenguaje natural, secuencias de etiquetas y layouts en formato JSON para controlar la colocación de texto y la disposición de objetos.

La relevancia de este modelo radica en su especialización en tipografía generada dentro de la imagen y en el control de composición, un nicho con demanda creciente en diseño gráfico automatizado, generación de carteles, interfaces y material promocional. La versión SFT mejora respecto al base en agrupación de texto y organización de layouts, según la comparativa incluida en la model card. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 5.082.308.624 (~5,08B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 para transformer y text encoder; float32 para VAE) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

MOSS-Image-SFT es un modelo de difusión basado en transformer (DiT) de aproximadamente 5,08B parámetros. El pipeline combina un transformer y un text encoder en bfloat16 con un VAE y ruido inicial en float32; el VAE incluido utiliza el decodificador small de FLUX.2. La inferencia se realiza a través de la clase MOSSImagePipeline de diffusers, con soporte para scheduler configurable, escala de guiado (guidance_scale), pasos de inferencia y el parámetro uncond_skip_layers (el ejemplo de la model card emplea [22]) para omitir capas en la rama no condicionada.

El modelo se deriva de MOSS-Image-Base mediante ajuste fino supervisado (SFT). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La mejora documentada por el autor respecto al base se centra en la agrupación de texto y la organización de layouts, ilustrada con el ejemplo de una pizarra blanca. El modelo acepta tres modos de prompt: lenguaje natural, secuencias de etiquetas y layouts JSON para control de posición de texto y disposición de objetos.

## Capacidades

- Generación de imágenes texto-a-imagen a resoluciones configurables (el ejemplo oficial usa 1024x1024).
- Generación de texto integrado en la imagen con alta fidelidad, incluyendo texto manuscrito y en chino (ejemplo de nota adhesiva en una nevera).
- Control de disposición espacial mediante layouts JSON, permitiendo especificar colocación de texto y organización de objetos.
- Soporte de prompts en lenguaje natural y de secuencias de etiquetas (tag sequences).
- Manejo de prompts largos y detallados.
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- Integración con ComfyUI mediante plugin nativo disponible en ComfyUI Manager.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso; es un modelo puramente generativo de imágenes.

## Casos de uso

- Generación de carteles y material promocional: el modelo puede incorporar titulares y textos secundarios legibles dentro de la imagen, lo que lo hace adecuado para pósters, banners y flyers donde la tipografía es parte central del diseño.
- Diseño de interfaces y mockups: mediante layouts JSON se puede controlar la posición de elementos y etiquetas, útil para generar wireframes o pantallas de ejemplo con texto realista.
- Ilustración editorial con texto integrado: portadas de revista, infografías o viñetas donde aparecen rótulos, notas manuscritas o carteles dentro de la escena, como el ejemplo de la nota en la nevera de la model card.
- Localización de contenido gráfico inglés-chino: al soportar ambos idiomas, permite generar material visual con texto en chino para mercados asiáticos o con texto en inglés para mercados internacionales a partir de un mismo flujo.
- Prototipado rápido en pipelines de diseño: integrado vía diffusers con un script de pocas líneas, se puede incorporar en herramientas internas de generación de variantes de diseño con control de composición.
- Generación por lotes en producción con ComfyUI: el plugin nativo permite montar flujos nodales para generar imágenes de forma repetible con seeds fijas (el ejemplo usa manual_seed(42)), útil para equipos de contenido que necesitan reproducibilidad.
- Investigación en generación de texto en imágenes: al estar especializado en tipografía y layout, sirve como base para experimentos académicos sobre fidelidad de texto renderizado y control espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~5,08B parámetros en bfloat16, los pesos del transformer y del text encoder ocupan del orden de 10 GB, a lo que se suma el VAE en float32 y las activaciones, por lo que se recomienda disponer de margen adicional.
- GPU recomendadas: no se especifican en la información proporcionada; el ejemplo oficial requiere una GPU NVIDIA con soporte CUDA.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del repositorio (27,2 GB) y el requisito de CUDA sugieren que puede requerir GPUs de gama alta, pero no se detalla.
- Opciones de despliegue: diffusers (DiffusionPipeline con custom_pipeline="pipeline_moss_image" y trust_remote_code=True), ComfyUI mediante plugin nativo, y opciones de CPU offload y compilación mencionadas en el quick start del proyecto.
- Latencia y throughput: no disponibles.
- Requisitos de software: Python 3.10 o superior, PyTorch 2.9 o superior, diffusers >= 0.38, transformers >= 5.3, accelerate >= 1.10, safetensors >= 0.6, Pillow >= 10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT | ~5,08B | no disponible | Texto en imagen y layout control | apache-2.0 | Hugging Face, ModelScope, ComfyUI |
| MOSS-Image-Base | no disponible | no disponible | Modelo base de la misma familia | apache-2.0 (según familia) | Hugging Face, ModelScope |
| Alternativas de texto-a-imagen de propósito general | no disponible | no disponible | Generación visual general | variable | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos texto-a-imagen, por lo que la comparativa se limita a la relación base-SFT dentro de la propia familia.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte para castellano ni otros idiomas, lo que puede degradar la generación de texto en imágenes en esos idiomas.
- Riesgo de alucinación visual y de errores tipográficos en textos largos o complejos, pese a la especialización del modelo; no se han publicado métricas objetivas de fidelidad de texto.
- No se documentan sesgos conocidos del modelo ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de representación.
- La model card indica que la versión SFT mejora la agrupación de texto y la organización de layouts respecto al base, pero no cuantifica la mejora.
- Requiere confiar en código remoto (trust_remote_code=True) para cargar el pipeline, lo que implica revisar el código antes de usarlo en producción.
- El repositorio tiene un tamaño de 27,2 GB, lo que exige espacio de almacenamiento y ancho de banda considerables.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las licencias de los componentes derivados (VAE basado en FLUX.2 small decoder) antes de desplegar en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/AgentAnon/MOSS-Image-SFT
- Hugging Face (modelo base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Hugging Face (SFT oficial de OpenMOSS): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- GitHub: https://github.com/OpenMOSS/MOSS-Image
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- Civitai: https://civitai.com/models/3005406/moss-image
- Plataforma API MOSI: https://platform.mosi.cn/?utm_source=huggingface&utm_medium=readme&utm_campaign=imageapi
- X (Twitter) de OpenMOSS: https://x.com/Open_MOSS
- Discord: https://discord.gg/nXFWEyvbb
