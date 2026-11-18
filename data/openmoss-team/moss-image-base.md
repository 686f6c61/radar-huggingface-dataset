# OpenMOSS-Team/MOSS-Image-Base

## Resumen

MOSS-Image-Base es el modelo base de generación de imágenes a partir de texto de la familia MOSS-Image, desarrollado por OpenMOSS (equipo vinculado al ecosistema MOSS). Se distribuye a través de Hugging Face con licencia Apache 2.0 y está pensado para servir como punto de partida tanto para inferencia directa como para ajuste fino posterior; de hecho, el propio autor publica una variante SFT (MOSS-Image-SFT) entrenada sobre esta base. El modelo acepta indicaciones en lenguaje natural, secuencias de etiquetas y layouts en formato JSON, lo que permite controlar la colocación de texto y la disposición de objetos en la imagen generada.

Con 5.082.308.624 parámetros (unos 5.080 millones) y un repositorio de 27,2 GB, se trata de un modelo de difusión de tamaño medio-grande, empaquetado en formato safetensors y consumible mediante la librería diffusers a través de un pipeline personalizado (`pipeline_moss_image`). El modelo está etiquetado para inglés y chino, y su énfasis en la generación de texto legible dentro de la imagen (rótulos, notas manuscritas, carteles) lo posiciona en la línea de los modelos de difusión recientes que priorizan el renderizado tipográfico correcto.

La relevancia actual del modelo radica en tres factores: su licencia permisiva (Apache 2.0) frente a alternativas con licencias más restrictivas, la disponibilidad de pesos base para fine-tuning y un pipeline documentado con integración en ComfyUI y demo en Hugging Face Spaces. El modelo se publicó en octubre de 2026 y cuenta con un informe técnico en arXiv (2610.23374).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (familia MOSS-Image); detalles internos del backbone no disponibles en la información proporcionada |
| Parametros totales | 5.082.308.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se especifica límite de tokens de prompt) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors; el ejemplo usa bfloat16 para transformer y text encoder, y float32 para VAE y ruido inicial) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 27,2 GB) |

## Arquitectura y entrenamiento

MOSS-Image-Base es un modelo de difusión para generación de imágenes condicionada por texto. El pipeline oficial emplea un transformer y un text encoder en bfloat16, mientras que el VAE y el ruido inicial se mantienen en float32; el VAE incluido utiliza el decodificador pequeño de FLUX.2. El pipeline expone parámetros como `num_inference_steps` (50 en el ejemplo oficial), `guidance_scale` (3.0) y `uncond_skip_layers=[22]`, lo que sugiere una estrategia de guiado con omisión selectiva de capas del bloque no condicionado para mejorar el equilibrio entre fidelidad al prompt y calidad visual.

El modelo admite tres modalidades de condicionamiento: prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON que controlan la posición del texto y la disposición de objetos. Esta última capacidad es coherente con el énfasis del modelo en la generación de texto legible y en la composición controlada. No se dispone, en la información proporcionada, de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; el informe técnico en arXiv (2610.23374) es la fuente indicada para esos detalles.

## Capacidades

- Generación de imágenes a partir de texto en inglés y chino.
- Renderizado de texto legible dentro de la imagen, incluyendo notas manuscritas y rótulos (el ejemplo oficial genera una nota en chino sobre la puerta de un frigorífico).
- Control de composición mediante layouts en formato JSON, con posicionamiento de texto y disposición de objetos.
- Condicionamiento mediante secuencias de etiquetas, además de lenguaje natural.
- Servicio como modelo base para ajuste fino supervisado (el autor publica MOSS-Image-SFT como derivado).
- Integración con diffusers mediante pipeline personalizado (`pipeline_moss_image`) con `trust_remote_code=True`.
- Soporte de ComfyUI mediante plugin nativo instalable desde ComfyUI Manager (integración en el repositorio oficial en curso).
- Demo interactiva en Hugging Face Spaces y acceso vía API en la plataforma MOSI.
- No se documentan en la información disponible capacidades de edición de imagen, inpainting, visión o audio.

## Casos de uso

- Generación de carteles y material promocional con texto integrado: el modelo está optimizado para renderizar texto legible, por lo que resulta adecuado para pósters, banners y anuncios donde el texto debe aparecer correctamente escrito en inglés o chino.
- Maquetación de infografías y paneles explicativos: el soporte de layouts JSON permite posicionar rótulos y organizar objetos, lo que facilita generar diagramas divulgativos con etiquetas colocadas de forma controlada.
- Prototipado de interfaces y mockups: se pueden generar pantallas, paneles y elementos de interfaz con texto de relleno coherente, útil en fases tempranas de diseño de producto.
- Creación de material educativo bilingüe: la cobertura de inglés y chino permite generar ilustraciones con anotaciones en ambos idiomas para cursos, presentaciones o fichas didácticas.
- Generación de imágenes para catálogos de producto: el control por etiquetas y layouts ayuda a mantener composiciones consistentes (producto centrado, texto descriptivo en una zona concreta) en series de imágenes.
- Base para fine-tuning domain-specific: al publicarse como modelo base con licencia Apache 2.0, equipos con datasets propios (por ejemplo, señalética, packaging o ilustración técnica) pueden ajustarlo sin restricciones de licencia comercial.
- Integración en flujos de trabajo de ComfyUI: artistas y estudios pueden incorporar el modelo en grafos de nodos junto a otros modelos y post-procesos, aprovechando el plugin nativo.
- Automatización de contenido vía API: el acceso a la plataforma MOSI permite integrar la generación en pipelines de publicación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 5.080 millones de parámetros y pesos en bfloat16, el peso del modelo ronda los 10 GB; a ello hay que sumar el text encoder, el VAE y las activaciones, por lo que se recomienda un mínimo práctico de 16-24 GB de VRAM para inferencia en GPU sin offload.
- El ejemplo oficial indica el uso de una GPU NVIDIA con soporte CUDA, Python 3.10 o superior y PyTorch 2.9 o superior.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de 24 GB (RTX 4090, A10G), así como en A100 y H100; esta estimación no está confirmada por el autor.
- Opciones de despliegue: diffusers (pipeline personalizado `pipeline_moss_image`), ComfyUI mediante plugin nativo, y API en la plataforma MOSI. El README menciona opciones de CPU offload y compilación en la guía rápida del proyecto.
- Latencia y throughput: no disponibles. El ejemplo oficial usa 50 pasos de inferencia con `guidance_scale=3.0`, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos comparables que permitan una comparación rigurosa. Se indica a continuación únicamente lo que puede afirmarse con los datos disponibles:

| Modelo | Parametros | Contexto/Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-Base | 5.082 M | Resolución de ejemplo 1024x1024 | Apache 2.0 | Hugging Face, ModelScope, ComfyUI, API MOSI |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como todo modelo de difusión entrenado con datos web a gran escala, es previsible que reproduzca sesgos de representación, pero no hay análisis publicado en la documentación disponible.
- Riesgo de alucinación visual: no se cuantifica; la generación de texto dentro de la imagen puede producir errores tipográficos o contenido incoherente, especialmente en prompts complejos o en idiomas distintos del inglés y el chino.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar el informe técnico y la documentación del proyecto por si se añaden condiciones adicionales sobre los datos de entrenamiento.
- Ejecución de código remoto: el pipeline requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; en producción conviene auditar o fijar la revisión concreta del repositorio.
- Dependencias estrictas: requiere diffusers >= 0.38, transformers >= 5.3, accelerate >= 1.10, safetensors >= 0.6 y Pillow >= 10, además de PyTorch 2.9 o superior; entornos con versiones anteriores pueden fallar.
- Gestión de precisión: el ejemplo oficial mezcla bfloat16 (transformer y text encoder) con float32 (VAE y ruido inicial); usar una precisión distinta puede degradar la calidad o provocar errores.
- Integración en ComfyUI: el plugin está disponible vía ComfyUI Manager, pero la integración en el repositorio oficial de ComfyUI está en curso, lo que puede implicar cambios en la API del nodo.
- Estado del modelo: es un modelo base, no un modelo afinado para instrucciones; para resultados más organizados en composiciones con texto, el autor remite a la variante SFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Variante SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Image
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- Guía de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Guía de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Plataforma API MOSI: https://platform.mosi.cn/
- X (Twitter) de OpenMOSS: https://x.com/Open_MOSS
- Discord de la comunidad: https://discord.gg/nXFWEyvbb
