# hakurei/waifu-diffusion

## Resumen

waifu-diffusion es un modelo de difusion latente de texto a imagen especializado en ilustracion de estilo anime, desarrollado por el colectivo Touhou AI (Haru, Salt y Sta) y publicado en HuggingFace bajo el identificador hakurei/waifu-diffusion. Se trata de un ajuste fino (fine-tuning) de la familia Stable Diffusion sobre imagenes de anime de alta calidad etiquetadas mediante un sitio tipo booru, con el objetivo de mejorar la fidelidad anatomica, el trazo y la composicion tipicos de la ilustracion japonesa frente al modelo base entrenado con fotografia generica.

La version alojada en este repositorio corresponde a waifu-diffusion v1.4, construida sobre la arquitectura de Stable Diffusion 2 (SD2) y con 865.910.724 parametros en formato safetensors. El repositorio ocupa 53,8 GB e incluye pesos compatibles con la libreria diffusers y con el pipeline StableDiffusionPipeline, ademas de una demo en HuggingFace Spaces y un cuaderno de Colab mantenidos por los autores. La model card esta redactada en ingles y el modelo solo declara soporte para prompts en ese idioma.

Su relevancia actual es fundamentalmente historica y de nicho: fue uno de los primeros modelos comunitarios en demostrar que un ajuste fino sobre un dominio visual muy concreto (anime) superaba de forma clara al modelo generico, y sigue siendo una referencia en pipelines de generacion de ilustracion, personajes y arte conceptual dentro de esa estetica. No es un modelo de lenguaje ni un transformer autoregresivo: no tiene ventana de contexto, tool calling ni capacidades de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (latent diffusion) basada en Stable Diffusion 2, con U-Net, autoencoder VAE y codificador de texto CLIP |
| Parametros totales | 865.910.724 (safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica, se trata de un modelo de difusion condicionado por prompt de texto, no de contexto autoregresivo |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (tag del repositorio); compatible con diffusers |
| Tamano del repositorio | 53,8 GB |
| Pipeline declarado | text-to-image |
| Descargas / likes | 1011 descargas, 2507 likes |
| Fecha de creacion | 30 de agosto de 2022 |
| Ultima actualizacion | 5 de julio de 2023 |

## Arquitectura y entrenamiento

Arquitectura de difusion latente heredada de Stable Diffusion 2: un autoencoder variacional (VAE) que comprime la imagen a un espacio latente de menor dimension, una U-Net que aprende a eliminar ruido paso a paso en ese espacio y un codificador de texto CLIP que transforma el prompt en condicionamiento. El proceso de inferencia parte de ruido gaussiano y aplica un numero configurable de pasos de denoising guiados por el prompt, con un parametro de guidance scale que controla la fidelidad al texto (en el ejemplo oficial se usa guidance_scale=6). El repositorio declara 865.910.724 parametros, cifra coherente con una U-Net de tamano estandar de la familia SD2.

El entrenamiento consiste en un ajuste fino supervisado sobre imagenes de anime de alta calidad. Las notas de la version 1.3 indican que el conjunto de datos empleado fue de 680.000 muestras texto-imagen descargadas de un sitio tipo booru con etiquetado de alta calidad; no se especifica en la informacion disponible si ese mismo corpus se reutilizo en la version 1.4 ni se detalla el numero exacto de pasos de entrenamiento, la composicion final del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO (que, por otro lado, no son habituales en modelos de difusion). Los autores reconocen el trabajo de Stability AI y Novel AI como base del proyecto.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en ingles, con especializacion en ilustracion de estilo anime.
- Control de composicion y encuadre mediante etiquetas de prompt tipicas de booru (por ejemplo "1girl", "upper body", "looking at viewer", "outdoors").
- Estilos artisticos controlables por prompt, como acuarela ("watercolor") o escenas nocturnas, segun los ejemplos de la model card.
- Ajuste de la adherencia al prompt mediante el parametro guidance_scale del pipeline de diffusers.
- Generacion de arte digital y material de entretenimiento, uso declarado explicitamente por los autores.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision por computador como tarea de comprension, tool calling, uso de agentes ni modo de pensamiento.
- No declara soporte multilingue: solo se anuncia ingles, y los prompts en otros idiomas pueden degradar el resultado.
- No incorpora capacidades de audio ni de video en la informacion proporcionada.

## Casos de uso

- Ilustracion de personajes originales: generar bocetos y arte final de personajes con una estetica anime consistente usando prompts descriptivos de atributos fisicos y de vestuario, aprovechando el ajuste fino especifico sobre ese dominio.
- Arte conceptual para videojuegos y visual novels: producir variaciones rapidas de disenos de personajes y escenarios estilizados, integrando el modelo en el pipeline de preproduccion artistica.
- Generacion de avatares y retratos para comunidades: crear imagenes de perfil con encuadre controlado ("upper body", "looking at viewer") a partir de descripciones breves.
- Prototipado de portadas o ilustraciones promocionales: iterar sobre composiciones y paletas con distintos guidance scale antes de encargar el trabajo final a un ilustrador.
- Herramienta de asistencia creativa en estudios de animacion: producir referencias de color, iluminacion y pose para alimentar el flujo de trabajo tradicional.
- Investigacion en modelos de difusion: servir como caso de estudio de ajuste fino de dominio sobre Stable Diffusion 2 y de comparacion frente a modelos base y versiones posteriores.
- Material de entretenimiento y contenido para comunidades de anime: generar imagenes para uso personal o divulgativo, respetando las restricciones de la licencia OpenRAIL-M.
- Integracion en demos o aplicaciones web: usar la libreria diffusers o la demo de Gradio proporcionada por los autores para exponer un servicio de generacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 1,7 GB en precision float16 y unos 3,5 GB en float32 (calculado a partir de los 865,9 millones de parametros); el pico real de memoria durante la generacion es mayor por las activaciones intermedias. Se recomienda un minimo orientativo de 4 a 6 GB de VRAM para resoluciones de 512x512 en float16. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- GPU recomendadas: tarjetas consumer de gama media y alta como RTX 3060 (12 GB), RTX 3070, RTX 3080, RTX 4070, RTX 4080 y RTX 4090; en el entorno profesional, A100, H100 o L40S para servir varias instancias en paralelo.
- Compatibilidad con GPU consumer: si, el modelo cabe holgadamente en tarjetas consumer modernas con 6 GB o mas de VRAM, siempre en float16 y con resoluciones moderadas.
- Opciones de despliegue: la libreria diffusers con el pipeline StableDiffusionPipeline es la via oficial documentada; tambien se ofrece una demo en HuggingFace Spaces con Gradio y un cuaderno de Colab. El tag endpoints_compatible indica que puede servirse en HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada; dependen del numero de pasos de denoising, la resolucion, el tipo de precision y la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| waifu-diffusion v1.4 (este) | 865.910.724 | no disponible; basado en SD2 | CreativeML OpenRAIL-M | HuggingFace, diffusers, demo Gradio | Ajuste fino anime sobre SD2, solo ingles |
| waifu-diffusion v1.3 | no disponible | no disponible | CreativeML OpenRAIL-M | HuggingFace | Version anterior; entrenada con 680.000 muestras texto-imagen de un booru |
| waifu-diffusion-xl | no disponible | no disponible | no disponible | HuggingFace | Variante posterior orientada a calidad, segun el repositorio del mismo autor |
| Stable Diffusion 2 (modelo base) | no disponible en la informacion proporcionada | no disponible | CreativeML OpenRAIL-M | HuggingFace | Modelo generico de fotografia del que deriva esta version; peor rendimiento en estilo anime |

## Limitaciones y advertencias

- Sesgo de dominio: el ajuste se realizo sobre imagenes de anime etiquetadas por la comunidad, lo que puede reproducir sesgos de representacion de genero, etnia, corporalidad y estilo presentes en ese corpus.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir anatomia incorrecta (manos, dedos, extremidades), texto ilegible en la imagen y coherencia fisica deficiente.
- Idioma: el modelo solo declara soporte para ingles. Los prompts en castellano o en otros idiomas no estan soportados y pueden reducir la calidad del resultado.
- Naturaleza del modelo: no es un modelo de lenguaje, por lo que no admite razonamiento, tool calling, agentes, contexto conversacional ni tareas de codigo o matematicas.
- Licencia CreativeML OpenRAIL-M: permite redistribucion y uso comercial, incluido como servicio, pero prohibe generar o compartir contenido ilegal o danino; si se redistribuye o se ofrece como servicio, es obligatorio incluir las mismas restricciones de uso y entregar una copia de la licencia a los usuarios finales.
- Contenido sensible: al derivar de un corpus de tipo booru existe riesgo de generar contenido no apto para todos los publicos si no se filtran los prompts y las salidas; se recomienda desplegar moderacion y filtros de seguridad en produccion.
- Precision de los pesos: los autores no documentan en este repositorio los tipos de cuantizacion soportados ni recetas oficiales de compresion; cualquier cuantizacion de terceros debe validarse empiricamente.
- Estado del repositorio: la ultima actualizacion data de julio de 2023, por lo que puede no reflejar practicas actuales de la familia Stable Diffusion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hakurei/waifu-diffusion
- Pesos originales v1.4: https://huggingface.co/hakurei/waifu-diffusion-v1-4
- Version v1.3: https://huggingface.co/hakurei/waifu-diffusion-v1-3
- Version XL: https://huggingface.co/hakurei/waifu-diffusion-xl
- Notas de la version 1.3 y vision general del proyecto: https://gist.github.com/harubaru/f727cedacae336d1f7877c4bbe2196e1
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/hakurei/waifu-diffusion-demo
- Cuaderno de Colab: https://colab.research.google.com/drive/1_8wPN7dJO746QXsFnB09Uq2VGgSRFuYE
- Ficha en Dezgo: https://dezgo.com/model/waifudiffusion_1_4
- Servidor de Discord del proyecto: https://discord.gg/touhouai
- Repositorio de Gradio: https://github.com/gradio-app/gradio
