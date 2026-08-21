# AlanaSky/trixxi

## Resumen

Trixxi es un modelo LoRA de personaje para Stable Diffusion XL (SDXL) desarrollado por Alana Battaile, que representa al personaje ficticio triXX.i: un bob rojo, gafas cuadradas verdes, sombra de ojos azul con purpurina, doble piercing en la nariz y grill de diamantes VVS, con una estética neón inspirada en la era LUVI. El modelo está diseñado para generar renders consistentes del personaje, arte de tatuajes (tattoo flash) y creatividades publicitarias de carteles o redes sociales. Se distribuye como un adaptador LoRA compatible con SDXL 1.0, Pony y Juggernaut, y se activa mediante la palabra clave `triXX.i` o `Trixxi`. Su relevancia radica en ofrecer una solución ligera y específica para la generación coherente de un personaje con identidad visual marcada, sin necesidad de entrenar un modelo completo.

El modelo se basa en el checkpoint `stabilityai/stable-diffusion-xl-base-1.0` y se entrena a una resolución de 1024x1024 píxeles. La licencia es CreativeML Open RAIL++-M, que permite uso comercial de los pesos, aunque el personaje y la marca LUVI conservan sus derechos de marca. El repositorio incluye un archivo de pesos en formato safetensors (`trixxi_v1.safetensors`) y se integra fácilmente con Diffusers, Automatic1111, ComfyUI y Forge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion XL (base: stabilityai/stable-diffusion-xl-base-1.0) |
| Parametros totales | no disponible (LoRA, tamaño del archivo no especificado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen, sin contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | ingles (prompts en ingles) |
| Licencia | CreativeML Open RAIL++-M |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el checkpoint base SDXL 1.0. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que modifican las capas de atencion y cross-attention del modelo base para inducir la representacion del personaje Trixxi. El entrenamiento se realizo con un dataset de aproximadamente 45 imagenes curadas del personaje (retratos, hojas de tatuajes y tomas publicitarias neón), con captioning manual combinado con WD14 y BLIP, usando la palabra de activacion `triXX.i`. Segun la model card, se usaron alrededor de 2500 pasos en 3 epocas, con optimizador AdamW8bit y tasa de aprendizaje 1e-4, empleando Kohya_ss o OneTrainer. Estos valores aparecen entre corchetes en la documentacion, por lo que deben considerarse indicativos y no confirmados al 100%.

No se mencionan innovaciones tecnicas destacables mas alla del uso estandar de LoRA para adaptacion de personajes. La resolucion de entrenamiento es 1024x1024, coherente con la resolucion nativa de SDXL.

## Capacidades

- Generacion de imagenes fotorrealistas y estilizadas del personaje Trixxi con consistencia en rasgos faciales, peinado, gafas, maquillaje y grill dental.
- Generacion de arte de tatuajes (tattoo flash) con lineas tradicionales y papel blanco hueso, mediante prompts adicionales.
- Creacion de carteles publicitarios y creatividades de marca con estetica neón y cinematografica (ej. vallas publicitarias nocturnas, editoriales de moda).
- Compatibilidad con multiples interfaces: Diffusers, Automatic1111, ComfyUI y Forge, mediante carga de LoRA estandar.
- Ajuste de peso del LoRA (0.8 a 1.0) para controlar la intensidad del estilo y la fidelidad del personaje.
- Soporte de prompts negativos para evitar artefactos comunes (desenfoque, baja calidad, dientes distorsionados, dedos extra).
- Capacidad de variacion controlada (por ejemplo, cambiar el color de pelo con negatives adecuados) aunque con riesgo de overfit al bob rojo.

## Casos de uso

- Creacion de contenido de marca para LUVI: el modelo permite generar carteles, anuncios para Instagram Stories y vallas publicitarias con la estetica neón caracteristica, manteniendo la identidad visual del personaje en todas las piezas.
- Arte de tatuajes (tattoo flash): con el prompt `triXX.i tattoo flash sheet, classic tattoo flash art, off-white paper` se obtienen hojas de disenos de tatuajes con el personaje, utiles para estudios de tatuaje o portfolios creativos.
- Ilustracion editorial de moda: combinando el personaje con prompts de editorial de moda, se pueden producir retratos de alta calidad para revistas o campañas digitales.
- Creacion de avatares y personajes para juegos o narrativa visual: la consistencia del personaje permite generar multiples ilustraciones del mismo personaje en diferentes escenas, util para concept art o novelas visuales.
- Pruebas de diseno de producto: el modelo puede generar variaciones del personaje con diferentes atuendos o accesorios, ayudando a visualizar merchandising o colaboraciones.
- Contenido para redes sociales de creadores: el personaje puede usarse para generar publicaciones consistentes en Instagram, TikTok o Twitter, manteniendo una identidad visual reconocible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA de personaje, no se proporcionan metricas estandar como FID o CLIP score. El rendimiento practico depende del modelo base SDXL y de los parametros de inferencia recomendados (CFG 6.5-8, pasos 25-35, sampler DPM++ 2M Karras o Euler a, hires fix 1.5x con denoise 0.4).

## Requisitos de hardware

- VRAM estimada: al ser un LoRA sobre SDXL, los requisitos son los del modelo base SDXL. Con cuantizacion fp16, se necesitan al menos 8 GB de VRAM para generar a 1024x1024; con 12 GB se trabaja comodamente.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4070, RTX 4090, o GPUs de datacenter como A10G o A100.
- En consumer GPU: si, cabe en GPUs de gama media con 8-12 GB de VRAM, aunque con limitaciones de batch o resolucion.
- Opciones de despliegue: Diffusers (Python), Automatic1111, ComfyUI, Forge. Tambien se puede usar con APIs de inferencia que soporten LoRA.
- Latencia y throughput: no disponible, pero en una RTX 4090 una generacion de 30 pasos a 1024x1024 suele tardar entre 2 y 5 segundos, dependiendo del sampler y del uso de hires fix.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos (otros LoRAs de personajes para SDXL) en la documentacion proporcionada. En general, los LoRAs de personajes compiten en terminos de fidelidad, consistencia y tamano del archivo, pero no hay datos objetivos para comparar. Se puede mencionar que existen alternativas como LoRAs de personajes en Civitai, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- El modelo esta sobreentrenado al bob rojo; si se intenta variar el color de pelo, se recomienda usar `blonde hair` con un negativo de `red hair` para evitar que el rojo se filtre.
- Los dientes y el grill de diamantes pueden distorsionarse con pesos bajos o pocos pasos; se recomienda aumentar el peso a 0.9+ y anadir `sharp teeth, vvs diamonds` al prompt.
- El color de las gafas verdes puede contaminarse si se anade ropa verde; se sugiere ponderar `(green square glasses:1.2)`.
- No debe usarse para suplantar a personas reales fuera del personaje ficticio Trixxi.
- No se permite generar contenido NSFW o explicito segun la model card.
- La licencia CreativeML Open RAIL++-M permite uso comercial de los pesos, pero el personaje Trixxi y la marca LUVI conservan sus derechos de marca; el usuario es responsable del contenido generado.
- El dataset de entrenamiento es pequeno (45 imagenes), lo que puede limitar la generalizacion a poses o escenarios muy diferentes.

## Enlaces

- HuggingFace: https://huggingface.co/AlanaSky/trixxi
- DOI: 10.57967/hf/10083
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
