# OpenMOSS-Team/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por OpenMOSS, el equipo responsable de la familia de modelos MOSS. Se trata de la versión con ajuste supervisado (SFT) del modelo base MOSS-Image-Base, del cual hereda arquitectura y pipeline de inferencia. El modelo está diseñado para generar imágenes de alta resolución (hasta 1024x1024 en los ejemplos de la model card) y destaca por su capacidad de renderizar texto legible dentro de la imagen, incluyendo texto en chino, lo que lo diferencia de muchos generadores que fallan al representar caracteres.

Con 5.082.308.624 parámetros (aproximadamente 5,08 mil millones) y un repositorio de 27,2 GB en formato safetensors, el modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Soporta prompts en inglés y chino, así como secuencias de etiquetas y layouts en JSON para controlar la colocación de texto y la disposición de objetos.

El modelo es relevante porque combina generación de imágenes con control tipográfico y espacial, una capacidad todavía poco común en modelos open source de tamaño medio. Su integración con `diffusers` (pipeline `MOSSImagePipeline`), ComfyUI y una API en MOSI lo posicionan como una opción práctica para desarrolladores que necesitan generar carteles, infografías o imágenes con texto integrado de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión, pipeline `MOSSImagePipeline` en diffusers) |
| Parametros totales | 5.082.308.624 (~5,08 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card usa bfloat16 para transformer y text encoder, float32 para VAE) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Resolución de salida | hasta 1024x1024 (en ejemplos; no se especifica el máximo) |
| VAE | decodificador pequeño de FLUX.2 (según la model card) |
| Librería | diffusers (>=0.38), transformers (>=5.3) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un modelo de difusión para text-to-image integrado en `diffusers` mediante el pipeline `MOSSImagePipeline`. La model card indica que el transformer y el text encoder operan en bfloat16, mientras que el VAE y el ruido inicial usan float32, y que el VAE incluido es el decodificador pequeño de FLUX.2. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

MOSS-Image-SFT se obtiene por ajuste supervisado (fine-tuning) sobre MOSS-Image-Base. Según la model card, el SFT mejora la agrupación de texto y la organización de layouts (por ejemplo, en una pizarra blanca), lo que sugiere que el entrenamiento supervisado se orientó a refinar el control tipográfico y espacial. No se dispone de más detalles sobre la innovación técnica ni sobre el proceso de entrenamiento en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de prompts en lenguaje natural en inglés y chino.
- Renderizado de texto legible dentro de la imagen, incluyendo caracteres chinos (ejemplo de la model card con una nota manuscrita en un frigorífico).
- Soporte de secuencias de etiquetas (tag sequences) como alternativa a prompts en lenguaje natural.
- Soporte de layouts en JSON para controlar la colocación de texto y la disposición de objetos.
- Control de la disposición espacial y agrupación de texto mejorado respecto al modelo base.
- Integración con `diffusers` mediante `MOSSImagePipeline` y con ComfyUI mediante plugin nativo.
- Inferencia con parámetros configurables como `num_inference_steps`, `guidance_scale` y `uncond_skip_layers`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión de entrada ni audio.

## Casos de uso

- Generación de carteles y pósteres con texto integrado: el modelo puede renderizar titulares y cuerpos de texto legibles en inglés y chino, lo que lo hace adecuado para diseño automatizado de carteles promocionales o informativos donde la tipografía debe ser correcta.
- Creación de infografías y pizarras blancas: el SFT mejora la agrupación y organización del texto, por lo que puede emplearse para generar diagramas con etiquetas, notas y esquemas visuales coherentes.
- Prototipado de interfaces y mockups: mediante layouts en JSON, un equipo de diseño puede especificar la posición de elementos y texto para generar mockups de pantallas o materiales impresos de forma reproducible.
- Localización de material gráfico para mercados anglófonos y chinos: al soportar ambos idiomas, permite generar variantes de un mismo diseño con texto en inglés o chino sin cambiar de modelo.
- Generación de imágenes para documentación técnica: notas manuscritas, etiquetas de componentes o leyendas dentro de ilustraciones técnicas, gracias a la capacidad de renderizar texto en la escena.
- Automatización de contenido para redes sociales: integrado en un pipeline con `diffusers`, puede generar imágenes con texto promocional de forma programática y por lotes, con semillas fijas para reproducibilidad.
- Integración en flujos de ComfyUI: estudios y creadores pueden incorporar el modelo en grafos de nodos para composición y postprocesado junto a otros modelos, usando el plugin nativo disponible en ComfyUI Manager.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~5,08 mil millones de parámetros en bfloat16, los pesos del transformer y text encoder ocupan aproximadamente 10 GB, a lo que hay que sumar el VAE en float32 y las activaciones; se recomienda al menos 16-24 GB de VRAM para inferencia en 1024x1024, aunque esta cifra es una estimación y no un dato oficial.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar compatibilidad con GPUs de 24 GB o más (RTX 4090, A100, H100); la model card solo exige una GPU NVIDIA con soporte CUDA.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y modelos con VRAM similar; no confirmado para GPUs de 12-16 GB.
- Opciones de despliegue: `diffusers` (>=0.38) con `trust_remote_code=True`, ComfyUI (plugin nativo vía ComfyUI Manager), y API en la plataforma MOSI. La model card menciona opciones de CPU offload y compilación en la guía del proyecto.
- Latencia y throughput: no disponibles. Los ejemplos usan 50 pasos de inferencia y `guidance_scale=3.0`, pero no se publican tiempos.
- Requisitos de software: Python 3.10 o superior, PyTorch 2.9 o superior, transformers >=5.3, accelerate >=1.10, safetensors >=0.6, Pillow >=10.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la información proporcionada. Se puede señalar lo siguiente a nivel de especificaciones:

| Modelo | Parámetros | Idiomas | Licencia | Texto en imagen | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT | ~5,08 mil millones | en, zh | Apache 2.0 | Sí (incluye chino) | Hugging Face, ModelScope, ComfyUI, API MOSI |
| MOSS-Image-Base | no disponible | en, zh | Apache 2.0 | Sí, con menor organización de texto según la model card | Hugging Face, ModelScope |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible otros modelos comparables con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo generativo entrenado con datos web, es probable que reproduzca sesgos de representación, pero no se aportan datos concretos.
- Riesgo de alucinación visual: puede generar texto mal formado o elementos incoherentes, especialmente en escenas complejas o con texto largo; la model card no cuantifica la tasa de error.
- Limitaciones de idioma: solo se declaran inglés y chino; no se garantiza calidad en otros idiomas, incluido el castellano.
- Limitaciones de contexto: no se especifica la longitud máxima de prompt admitida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no se indican restricciones adicionales.
- Caveats para producción: requiere `trust_remote_code=True` para cargar el pipeline personalizado, lo que implica ejecutar código del repositorio; conviene revisar y fijar versiones. El VAE en float32 y el transformer en bfloat16 exigen una configuración de precisión mixta que debe replicarse en despliegues.
- Dependencia de versiones específicas: diffusers >=0.38, transformers >=5.3 y PyTorch >=2.9, lo que puede limitar entornos con versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Image
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Integración ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- API MOSI: https://platform.mosi.cn/?utm_source=huggingface&utm_medium=readme&utm_campaign=imageapi
- X (Twitter) de OpenMOSS: https://x.com/Open_MOSS
- Discord: https://discord.gg/nXFWEyvbb
