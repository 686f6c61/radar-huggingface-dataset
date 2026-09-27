# RunningHubAI/rh-pipi-krea2-anime-style01-unet

## Resumen

rh-pipi-krea2-anime-style01-unet es un fichero de pesos de tipo UNET para generación y edición de imágenes a partir de texto, publicado en Hugging Face por la cuenta RunningHubAI en nombre del autor de RunningHub @皮神. Se trata de un ajuste fino ("finetuned from: krea2") orientado a producir ilustración con estética anime, distribuido como un único fichero safetensors de 12.533 MiB (unos 12,2 GiB) llamado `pipi-krea01-anime.safetensors`, y con la palabra de activación declarada "Anime style".

El modelo no se distribuye como una librería de propósito general, sino como un componente que debe cargarse dentro de un flujo de trabajo de ComfyUI o de la plataforma en la nube RunningHub, presumiblemente junto al resto del pipeline de krea2 (codificador de texto, VAE y scheduler). Su interés es, por tanto, práctico: añade un estilo visual concreto a un modelo base de generación de imágenes, algo habitual en el ecosistema de nodos de ComfyUI.

El repositorio no publica datos de arquitectura interna, número de parámetros, licencia, idiomas soportados ni resultados de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 "likes", por lo que no existe validación independiente de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para imagen-texto-a-imagen (edición/generación); detalles internos no disponibles |
| Parámetros totales | no disponible (el repositorio no publica el conteo; el único dato objetivo es el tamaño del fichero de pesos) |
| Longitud de contexto | no disponible (aplica la ventana del codificador de texto del modelo base krea2, no documentada en este repositorio) |
| Tipos de cuantización | no disponible; se distribuye un único fichero sin indicar el tipo numérico de sus pesos |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`pipi-krea01-anime.safetensors`, 12.533 MiB) |
| Tamaño del repositorio | 13,1 GB |
| Pipeline declarado | image-text-to-image |
| Modelo base | krea2 (finetune) |
| Palabra de activación | "Anime style" |
| Plataformas indicadas | ComfyUI / RunningHub / Hugging Face |

## Arquitectura y entrenamiento

La model card clasifica el modelo como "UNET (image edit)" y lo etiqueta con `unet`, `comfyui` e `image-text-to-image`. No se especifica si el bloque UNET corresponde a un transformer de difusión, a una U-Net convolucional clásica o a una variante híbrida, ni se detalla el número de bloques, canales, dimensión de atención o resolución nativa de entrenamiento. Tampoco se documenta la cuantización de los pesos, aunque el tamaño del fichero (12.533 MiB) es coherente con un bloque UNET de gran tamaño almacenado en un formato de precisión reducida; no se puede derivar de él el número de parámetros sin conocer el tipo numérico exacto.

En cuanto al entrenamiento, el autor indica que utilizó el "súper etiquetador" y el "súper entrenador" de terceros distribuidos por zhaotutu.xyz, y que el modelo parte de krea2. No se publican datos sobre el dataset empleado, número de imágenes, resolución, pasos de entrenamiento, tasa de aprendizaje, uso de regularización, ni sobre el método de ajuste (LoRA fusionada, fine-tune completo, DreamBooth u otro). Tampoco se indica que se haya aplicado ningún método de alineación tipo RLHF o DPO, algo que en modelos de difusión no es habitual. La única información funcional para el usuario es la palabra de activación "Anime style".

## Capacidades

- Generación de imágenes a partir de texto con estética anime, invocando la palabra de activación "Anime style".
- Edición de imágenes: la propia model card clasifica el modelo como "UNET (image edit)" y enlaza flujos de edición de una sola imagen.
- Cambio de vestuario o "换装" sobre un personaje, según el flujo de trabajo publicado por el autor.
- "Lavado de imágenes" ("image washing"), es decir, pipelines de imagen a imagen con inferencia inversa de la prompt para reescribir o limpiar una imagen generada.
- Integración como nodo dentro de ComfyUI, cargando el fichero safetensors en el cargador de UNET correspondiente.
- Ejecución en la nube mediante la plataforma RunningHub, incluida su API.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo exclusivamente de imagen.
- No se documenta el comportamiento multilingüe de las prompts; el material del autor está mayoritariamente en chino e inglés, pero no se declara qué idiomas acepta el codificador de texto subyacente.

## Casos de uso

- Ilustración anime para producción de contenido: generar key visuals, portadas o ilustraciones promocionales escribiendo una prompt descriptiva y activando el estilo con "Anime style", apoyándose en el modelo base krea2 para la composición general.
- Edición de vestuario sobre personajes existentes: usar el flujo de cambio de ropa publicado por el autor para sustituir la indumentaria de un personaje manteniendo su identidad visual, útil en preproducción de series o videojuegos.
- Reescribir o "limpiar" imágenes generadas previamente: el flujo de "image washing" con inferencia inversa de prompt permite reconstruir una imagen con una prompt editable y volver a generarla con variaciones controladas.
- Edición de imagen única para retoque estilístico: el flujo de edición de una sola imagen permite aplicar el estilo anime a una fotografía o render existente sin rehacer la escena por completo.
- Diseño de personajes y exploración de estilo: iterar variaciones de un mismo personaje para elegir dirección artística antes de pasar a un pipeline de producción 3D o de animación tradicional.
- Automatización por API en la plataforma RunningHub: integrar la generación en un servicio o pipeline interno que consuma el modelo mediante la API REST de RunningHub en lugar de desplegar infraestructura propia.
- Prototipado rápido en ComfyUI local: probar combinaciones de prompts, samplers y LoRAs sobre el modelo antes de fijar un flujo de producción, aprovechando que se distribuye como un único safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas objetivas (FID, CLIP score, evaluación humana) ni comparaciones cuantitativas con otros modelos de estilo anime, y tampoco se documentan tiempos de inferencia o throughput.

## Requisitos de hardware

- Peso en disco y en memoria: el fichero de pesos ocupa 12.533 MiB (unos 12,2 GiB), cantidad que debe estar disponible en memoria de GPU (o en RAM si se aplica descarga por capas) además del codificador de texto y el VAE del modelo base krea2.
- VRAM estimada: no hay cifras oficiales. Como estimación orientativa basada únicamente en el tamaño del fichero, conviene contar con al menos 16 GB de VRAM para inferencia a 1024 px y con 24 GB para trabajar con comodidad junto al resto del pipeline; son cifras estimadas, no datos publicados.
- GPU recomendadas: el material del autor menciona instancias con RTX 4090 y tarjetas de 48 GB en la nube de RunningHub. Fuera de esa plataforma, cualquier GPU con 24 GB o más (RTX 4090, RTX 5090, A100 40/80 GB, H100) es una opción razonable.
- GPU de consumo: probablemente viable en RTX 4090 y en tarjetas de 16 GB si se aplican cuantizaciones o carga por capas, y ajustada en GPUs de 12 GB; no hay confirmación oficial.
- Opciones de despliegue: ComfyUI (uso previsto según las etiquetas del repositorio) y la plataforma en la nube RunningHub, incluida su API. No se documenta compatibilidad con otros runtimes de difusión; los servidores orientados a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a un modelo de imagen de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-pipi-krea2-anime-style01-unet | UNET de difusión (finetune anime de krea2) | no disponible | no disponible | no disponible | Hugging Face (13,1 GB), ComfyUI, RunningHub |
| krea2 (modelo base) | Modelo de generación de imágenes | no disponible | no disponible | no disponible en este repositorio | Referenciado como origen del finetune |
| pipi-krea2-01 | Modelo publicado en RunningHub por el mismo ecosistema | no disponible | no disponible | no disponible | RunningHub |

No se dispone de datos verificables de parámetros, resolución nativa ni licencia para los modelos comparables, por lo que la comparación cuantitativa queda fuera de alcance con la información disponible. La relación exacta entre "krea2" y las familias públicas de modelos de Krea no se documenta en el repositorio.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica términos de uso. La model card se limita a señalar que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream, lo que introduce incertidumbre legal para uso comercial.
- Sin benchmarks ni evaluación independiente: no hay métricas publicadas ni validación por parte de la comunidad (0 descargas y 0 "likes" en el momento de la consulta).
- Dependencia del modelo base: al ser un UNET, no es autónomo; necesita el codificador de texto, el VAE y la configuración de muestreo del pipeline krea2, que no se incluyen ni se detallan en este repositorio.
- Dependencia de la palabra de activación: el estilo declarado requiere incluir "Anime style" en la prompt; su comportamiento sin esa palabra no está documentado.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomía incorrecta, manos deformes, texto ilegible o elementos incoherentes con la prompt, especialmente en escenas complejas.
- Sesgos y contenido: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de representación ni el riesgo de generar contenido inapropiado o con derechos de terceros.
- Idioma: no se declara qué idiomas acepta el codificador de texto; toda la documentación del autor está en chino e inglés, lo que dificulta el soporte en otros idiomas.
- Trazabilidad limitada: el modelo se publica "en nombre del autor" mediante una plataforma comercial, sin información sobre el proceso de entrenamiento más allá de la mención a herramientas de terceros.
- Inconsistencia de nombres: el repositorio se llama "krea2" pero el fichero de pesos se llama `pipi-krea01-anime.safetensors`, lo que puede generar confusión al emparejarlo con otros recursos del mismo autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-pipi-krea2-anime-style01-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2094927329989586946
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1860932065674887170
- Flujo de texto a imagen con Krea2: https://www.runninghub.cn/post/2071164326781734914
- Flujo de imagen a imagen con inferencia inversa de prompt: https://www.runninghub.cn/post/2071358346015371266
- Flujo de cambio de vestuario con Krea2: https://www.runninghub.cn/post/2081382750556348418
- Flujo de edición de imagen única con Krea2: https://www.runninghub.cn/post/2081650003457691649
- Flujo de "lavado de imágenes" sin inferencia inversa: https://www.runninghub.cn/post/2081773404809682946
- Flujo de texto a imagen (sitio internacional): https://www.runninghub.ai/zh-cn/post/2070539933625962498
- Flujo de imagen más prompt con inferencia inversa (sitio internacional): https://www.runninghub.ai/zh-cn/post/2071363127198965761
- Modelo pipi-krea2-01 en RunningHub Models: https://www.runninghub.ai/model/public/2072255726952738817
- Catálogo de modelos de RunningHub: https://www.runninghub.ai/models
- Plataforma RunningHub: https://www.runninghub.ai
- Sitio de RunningHub en China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Ejecución de flujos en la nube: https://www.runninghub.ai/workspace
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Herramientas de etiquetado y entrenamiento citadas por el autor: https://zhaotutu.xyz
