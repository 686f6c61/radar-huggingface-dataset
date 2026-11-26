# SD-Next/MOSS-Image-Base

## Resumen

MOSS-Image-Base es un modelo de generación de imágenes texto-a-imagen desarrollado por OpenMOSS (equipo vinculado a MOSI/Shanghai). Este repositorio concreto, `SD-Next/MOSS-Image-Base`, es un espejo del original `OpenMOSS-Team/MOSS-Image-Base` en la revisión `5f40f07a`, mantenido para su uso con SD.Next. El modelo base forma parte de la familia MOSS-Image, que también incluye una variante SFT afinada.

El modelo resuelve el problema del control fino sobre la composición de la imagen: además de prompts en lenguaje natural, acepta secuencias de etiquetas y layouts en JSON para controlar la colocación del texto y la disposición de los objetos. Es especialmente relevante por su capacidad de renderizar texto legible en varios idiomas (inglés y chino) dentro de la imagen generada, un punto históricamente débil en los modelos de difusión.

Técnicamente es un modelo de difusión con un transformer como backbone, un VAE (usa el decodificador small de FLUX.2) y un text encoder, con un total de 5.082.308.624 parámetros (aproximadamente 5,08 mil millones) y un repositorio de 27,2 GB. Se distribuye bajo licencia Apache 2.0 y se integra en el ecosistema diffusers mediante un pipeline personalizado (`pipeline_moss_image`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen con transformer como backbone, VAE y text encoder; pipeline personalizado `MOSSImagePipeline` |
| Parametros totales | 5.082.308.624 (~5,08 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | No disponible (la model card usa bfloat16 para transformer y text encoder, y float32 para VAE y ruido inicial) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

MOSS-Image-Base es un modelo de difusion para generacion de imagenes que combina un transformer (backbone principal), un VAE y un text encoder. El VAE incluido utiliza el decodificador small de FLUX.2. El pipeline personalizado `pipeline_moss_image.py`, el tokenizer y el scheduler se distribuyen junto con los pesos y no han sido modificados respecto al repositorio original. El modelo se ejecuta con el transformer y el text encoder en bfloat16, mientras que el VAE y el ruido inicial operan en float32.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se menciona que el modelo soporta prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON para controlar la colocacion del texto y la disposicion de objetos, lo que sugiere un entrenamiento orientado al control composicional y al renderizado de texto. Existe una variante SFT (MOSS-Image-SFT) que, segun la comparativa de la model card, produce una agrupacion de texto mas clara y un layout de pizarra mas organizado que la version base.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts en lenguaje natural.
- Soporte de secuencias de etiquetas (tag sequences) como forma alternativa de prompting.
- Soporte de layouts en JSON para controlar la colocacion del texto y la disposicion de objetos en la imagen.
- Renderizado de texto legible dentro de la imagen, con soporte para ingles y chino (por ejemplo, notas manuscritas en chino en una nevera).
- Control de la composicion espacial mediante el layout JSON.
- Integracion en diffusers mediante pipeline personalizado con `trust_remote_code=True`.
- Integracion en SD.Next desde la lista de referencia de modelos.
- Integracion en ComfyUI mediante plugin nativo (disponible en ComfyUI Manager; la integracion en el repositorio oficial esta en curso).
- Parametros de inferencia configurables: `num_inference_steps`, `guidance_scale`, `uncond_skip_layers`, semilla y resolucion (por ejemplo, 1024x1024).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking (no es un modelo de lenguaje).

## Casos de uso

- Generacion de carteles y material promocional con texto integrado: el modelo puede renderizar texto legible en ingles y chino dentro de la imagen, lo que lo hace adecuado para carteles, banners y anuncios donde el texto forma parte del diseno.
- Maquetacion de infografias y pizarras: gracias al layout JSON, se puede especificar la disposicion de objetos y bloques de texto, util para generar infografias o esquemas con una estructura controlada.
- Prototipado de interfaces y mockups: la capacidad de colocar texto y objetos en posiciones concretas permite generar mockups de pantallas, etiquetas de producto o envases con texto realista.
- Ilustracion editorial con notas y rotulos: escenas como una nota manuscrita en una nevera o rotulos en un entorno se pueden generar directamente con el prompt, reduciendo el postprocesado.
- Generacion de material bilingue ingles-chino: para mercados que requieren contenido en ambos idiomas, el modelo cubre los dos idiomas soportados sin cambiar de modelo.
- Experimentacion e investigacion en difusion: al ser un modelo base con licencia Apache 2.0 y pipeline abierto en diffusers, sirve como punto de partida para fine-tuning o para estudiar control composicional y renderizado de texto.
- Integracion en flujos de trabajo con ComfyUI o SD.Next: artistas y desarrolladores pueden incorporarlo a sus grafos de ComfyUI o a SD.Next para generar imagenes por lotes con layouts controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~5,08 mil millones de parametros y pesos en bfloat16, el modelo requiere del orden de 10 GB solo para los pesos del transformer, a lo que hay que sumar text encoder y VAE, por lo que se recomienda una GPU con al menos 16-24 GB de VRAM para resoluciones de 1024x1024.
- GPU recomendadas: no se especifican en la model card; por tamano, son adecuadas GPU de clase profesional como A100 o H100, y GPU de consumo de gama alta con suficiente VRAM (por ejemplo, RTX 4090 con 24 GB).
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y modelos con VRAM equivalente; no confirmado para GPU con menos de 16 GB.
- Opciones de despliegue: diffusers (con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`), SD.Next, ComfyUI (plugin nativo via ComfyUI Manager) y la demo de Hugging Face Spaces. La model card menciona opciones de CPU offload y compilacion en la guia rapida del proyecto.
- Latencia y throughput: no disponibles. La model card usa 50 pasos de inferencia con `guidance_scale=3.0` en el ejemplo, lo que da una idea del coste computacional, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-Base (este) | ~5,08 mil millones | No aplica | Apache 2.0 | Hugging Face, ModelScope, SD.Next, ComfyUI |
| MOSS-Image-SFT | No disponible | No aplica | No disponible | Hugging Face, ModelScope |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un modelo base, no afinado: la propia model card muestra que la variante SFT produce una agrupacion de texto mas clara y layouts mas organizados, por lo que la version base puede dar resultados menos pulidos en tareas de texto y composicion.
- Idiomas limitados a ingles y chino; no se documenta soporte para castellano ni otros idiomas, lo que puede degradar el renderizado de texto en otros idiomas.
- Riesgo de alucinacion visual y de errores en el texto renderizado: como todo modelo generativo de imagenes, puede producir texto ilegible o incorrecto, especialmente con prompts largos o layouts complejos.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; como modelo entrenado con datos no descritos, puede heredar sesgos de su dataset.
- Requiere `trust_remote_code=True` y un pipeline personalizado, lo que implica ejecutar codigo del repositorio; conviene revisar el codigo antes de usarlo en produccion.
- Dependencias estrictas: Python 3.10 o superior, PyTorch 2.9 o superior, diffusers 0.38 o superior, transformers 5.3 o superior, accelerate 1.10 o superior, safetensors 0.6 o superior y Pillow 10 o superior.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el aviso de licencia y verificar las condiciones del repositorio original.
- Este repositorio es un espejo mantenido por SD-Next; para la version canonica y actualizaciones debe consultarse el repositorio original de OpenMOSS.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/SD-Next/MOSS-Image-Base
- Repositorio original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Variante SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope (base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Codigo en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guia de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Guia de ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- SD.Next: https://github.com/vladmandic/sdnext
- Perfil de OpenMOSS en X: https://x.com/Open_MOSS
