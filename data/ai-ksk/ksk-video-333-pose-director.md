# AI-KSK/ksk-video-333-pose-director

## Resumen

AI-KSK/ksk-video-333-pose-director no es un modelo de pesos al uso, sino un workflow distribuible para ComfyUI asociado al episodio 333 del proyecto AI-KSK. El repositorio contiene un grafo JSON de 58 nodos y dos ramas que orquesta modelos MiniMax H3 Image para convertir un esqueleto 3D posado manualmente (mediante la técnica VNCCS) en una imagen de personaje de alta resolución en 6 pasos, preservando la identidad del personaje a partir de una imagen de referencia. El modelo base declarado es MiniMax-H3-Image.

El problema que resuelve es el control fino de pose en generacion de imagenes de personajes: en lugar de depender de prompts textuales o de extraer la pose de una foto, el usuario articula directamente un esqueleto 3D y el pipeline renderiza al personaje en esa postura manteniendo rasgos faciales y corporales de la referencia. Es relevante para flujos de trabajo de ilustracion, storyboarding y produccion de contenido donde la consistencia de identidad entre tomas es critica.

El repo no incluye pesos: solo el JSON del workflow, una portada y checksums. Las dependencias (checkpoint H3 Image podado int8, VAE fp16, un modelo Qwen 3.5 9B en GPTQ w4a8 y un Qwen3-VL 32B int8 adaptado a H3) deben instalarse por separado. El tamaño del repositorio es de 0.0 GB, coherente con que solo contiene archivos de texto y una imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un workflow ComfyUI; el modelo base MiniMax-H3-Image no declara arquitectura en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (checkpoint H3 Image `pruned_int8_convrot`), fp16 (VAE), w4a8 GPTQ (Qwen 3.5 9B), int8 (`convrot` para Qwen3-VL 32B adaptado) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; ver limitaciones) |
| Formato de pesos | safetensors (dependencias externas); el artefacto del repo es un JSON de workflow ComfyUI |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un grafo de ejecucion para ComfyUI con 58 nodos y dos ramas. La rama A (incluida en el JSON distribuible) parte de un esqueleto 3D posado manualmente y lo combina con una imagen de referencia del personaje; el pipeline H3 Image renderiza la imagen final en 6 pasos de muestreo. La rama B (reversion de pose desde foto mediante SAM3D) solo esta disponible como experiencia online y no se distribuye como JSON.

Las dependencias declaradas sugieren un stack compuesto: un checkpoint principal H3 Image cuantizado a int8 con convoluciones rotadas (`minimax_h3_image_pruned_int8_convrot.safetensors`), un VAE fp16, un modelo de lenguaje Qwen 3.5 9B en GPTQ w4a8 (probablemente para codificacion textual o control condicional) y un Qwen3-VL 32B int8 adaptado a H3 (probablemente para vision-lenguaje, extraccion de identidad o condicionamiento visual). No se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO, ya que el autor no publica esa informacion.

## Capacidades

- Generacion de imagen de personaje condicionada por pose esqueletica 3D manual (tecnica VNCCS).
- Preservacion de identidad a partir de una imagen de referencia del personaje.
- Renderizado de alta resolucion en 6 pasos de muestreo.
- Control fino de postura sin necesidad de prompt textual detallado.
- Extraccion de pose desde fotografia (rama B, solo online via SAM3D, no distribuida).
- Orquestacion de un stack multimodal (checkpoint de difusion + VAE + LLM Qwen 3.5 9B + VLM Qwen3-VL 32B) dentro de ComfyUI.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue en la informacion disponible.

## Casos de uso

- Ilustracion de personajes consistentes: el usuario posa un esqueleto 3D y el workflow renderiza al personaje de referencia en esa postura, lo que permite producir varias tomas del mismo personaje con identidad estable para libros, comics o assets de juego.
- Storyboarding y previsualizacion: directores de arte pueden generar rapidamente poses clave de una secuencia usando la referencia del protagonista, comparando resultados contra la referencia antes de encargar el render final.
- Produccion de contenido para redes: creadores que necesitan variaciones de pose de un personaje recurrente pueden iterar sobre el esqueleto sin reescribir prompts, reduciendo el coste por imagen gracias a los 6 pasos de muestreo.
- Diseno de personajes para videojuegos: equipos de arte pueden validar la legibilidad de una silueta en distintas poses (perfil, miembros cruzados, oclusion) antes de modelar en 3D, usando la referencia como ancla de identidad.
- Reversion de pose desde fotografia (rama B, solo online): estudiar la postura de una foto real y trasladarla al personaje de referencia, util para referencia de animacion o captura de movimiento simplificada.
- Docencia y demostracion de pipelines ComfyUI: el JSON de 58 nodos sirve como ejemplo didactico de orquestacion de un checkpoint de difusion con VAE, LLM y VLM en un grafo reproducible con checksums verificables.
- Prototipado de moda o cosplay digital: probar como cae una prenda o un accesorio sobre un personaje en distintas poses manteniendo el rostro de la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El stack incluye un checkpoint H3 Image int8, un VAE fp16, un Qwen 3.5 9B en w4a8 GPTQ y un Qwen3-VL 32B en int8; este ultimo, incluso cuantizado a int8, implica del orden de decenas de gigabytes, por lo que el pipeline completo no cabe en GPUs de consumo de gama media.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el perfil de los pesos (VLM de 32B en int8 y LLM de 9B en GPTQ), se requiere hardware de clase profesional o multiple GPU; no hay datos del autor que confirmen modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no hay confirmacion de que el pipeline completo quepa en ninguna GPU de consumo; el VLM de 32B en int8 es el componente mas restrictivo.
- Opciones de despliegue: ComfyUI con el node pack de H3 Image y los cuatro pesos externos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo indica que el muestreo es de 6 pasos y que "es rapido, no magia", sin cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (workflows de control de pose en ComfyUI con preservacion de identidad) ni datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Deriva de identidad en poses extremas: el autor reconoce perdida de parecido con oclusion severa, perfil combinado con miembros cruzados y posturas forzadas.
- Calidad variable: con 6 pasos de muestreo el resultado es rapido pero no deterministicamente optimo; el autor recomienda elegir entre varias ejecuciones.
- El repositorio no contiene pesos ni intermedios: sin instalar las cuatro dependencias externas el workflow no funciona.
- La rama B (reversion de pose desde foto, SAM3D) no se distribuye como JSON; solo esta disponible como experiencia online, lo que limita la reproducibilidad local de esa funcionalidad.
- La imagen de captura incrustada en el export original fue eliminada del build distribuible por falta de licencia verificable; quedan marcadores de posicion en su lugar.
- Licencia "other": no se detallan terminos de uso comercial en la informacion disponible; es imprescindible revisar las condiciones del autor antes de usar el workflow en produccion.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual, limitaciones de idioma ni rendimiento medido; cualquier evaluacion de calidad debe hacerse empiricamente.
- El stack depende de modelos de terceros (MiniMax H3 Image, Qwen 3.5, Qwen3-VL) cuyas licencias y restricciones se aplican por separado y no se detallan aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AI-KSK/ksk-video-333-pose-director
- Video del episodio: https://youtu.be/Ncg4_CFSaaM
- Original en chino (Bilibili): https://www.bilibili.com/video/BV1nSsr67EHA/
- Posing manual (experiencia online): https://www.runninghub.cn/post/2122731136920145921/?inviteCode=rh-v1111
- Reversion de pose desde foto SAM3D (solo online): https://www.runninghub.cn/post/2122731130955845634/?inviteCode=rh-v1111
