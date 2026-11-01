# chemicarLabs/hentai_FP16

## Resumen

`chemicarLabs/hentai_FP16` es un checkpoint de generacion de imagenes texto-a-imagen derivado de Stable Diffusion 1.5, publicado por el usuario chemicarLabs en HuggingFace. Se distribuye como un unico fichero `.safetensors` en precision FP16 (2,1 GB) y esta afinado a partir del modelo `philz1337x/hentai`, del que hereda la orientacion tematica y la licencia CreativeML OpenRAIL-M. El modelo se marca explicitamente como NSFW y su safety checker fue eliminado durante la conversion, por lo que no incorpora filtro de seguridad en el fichero.

La relevancia tecnica del artefacto no esta en la arquitectura (es una UNet de difusion latente estandar de SD 1.5, sin innovaciones propias) sino en su formato de empaquetado: al ser un single-file checkpoint, requiere `StableDiffusionPipeline.from_single_file` en lugar de `from_pretrained`, y es directamente compatible con ComfyUI y AUTOMATIC1111. El autor documenta un consumo pico de 4 GB de VRAM generando a 512x768 con stable-diffusion.cpp en una RX580 de 8 GB, lo que lo situa en el rango de GPU de consumo.

El modelo acumula 38 descargas y 0 likes en el momento de la ficha, y su model card es escasa: no publica datos de entrenamiento, composicion del dataset ni resultados de benchmarks. Se trata, por tanto, de un finetune de nicho para contenido para adultos, no de un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (Stable Diffusion 1.5), con VAE y text encoder CLIP |
| Parametros totales | no disponible (arquitectura SD 1.5, aproximadamente 860 M en la UNet; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (prompt de texto; limite tipico de 77 tokens del text encoder CLIP de SD 1.5, no declarado por el autor) |
| Tipos de cuantizacion | FP16 (unico peso publicado); compatible con cuantizaciones derivadas en herramientas de terceros no documentadas por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors, single-file (FP16) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de Stable Diffusion 1.5, es decir, un modelo de difusion latente compuesto por una UNet, un VAE y un text encoder CLIP. El autor no documenta ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado convencional. La unica informacion disponible es que se trata de un finetune de `philz1337x/hentai`, que a su vez deriva de SD 1.5.

No se declara ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, destilacion de pasos u otras). La conversion a FP16 y el empaquetado en un unico fichero safetensors son las unicas operaciones documentadas, junto con la omision deliberada del modulo safety checker.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts en ingles.
- Soporte de prompt negativo, que el autor considera imprescindible para obtener resultados aceptables.
- Compatibilidad con el ecosistema SD 1.5: LoRAs, textual inversions, ControlNet y demas extensiones disenadas para esa arquitectura.
- Integracion directa en ComfyUI (carpeta `models/checkpoints/`) y AUTOMATIC1111 (`models/Stable-diffusion/`).
- Ejecucion en CPU/GPU de gama baja mediante stable-diffusion.cpp (edicion Vulkan).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada multimodal.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Generacion de ilustracion para proyectos editoriales de ficcion para adultos: el modelo produce imagenes a partir de prompts descriptivos en ingles con 28 pasos y CFG 7.5, ajustes que el autor identifica como optimos.
- Prototipado rapido de conceptos visuales en estaciones de trabajo modestas: con 4 GB de VRAM pico a 512x768 en una RX580, permite iterar bocetos en hardware antiguo sin GPU dedicada de gama alta.
- Integracion en flujos ComfyUI para pipelines con ControlNet o LoRAs: al ser un checkpoint SD 1.5 estandar, se puede encadenar con nodos de preprocesado, upscaling y postprocesado.
- Automatizacion por lotes mediante scripts de Python con `from_single_file`: util para generar variaciones masivas de un mismo prompt con distintas semillas en entornos controlados.
- Despliegue en entornos de investigacion sobre difusion: sirve como base para estudiar el efecto de finetunes tematicos sobre SD 1.5 y comparar con el modelo original `philz1337/hentai`.
- Uso en entornos aislados sin conectividad: al ser un fichero unico de 2,1 GB, se puede transportar y cargar localmente sin dependencia de repositorios remotos.
- Generacion en CPU con stable-diffusion.cpp: el autor valida el flujo en Vulkan, lo que permite ejecucion en equipos sin CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mediciones de VRAM pico (4 GB generando a 512x768 en una RX580 de 8 GB con stable-diffusion.cpp) y ajustes recomendados (28 pasos, CFG 7.5), sin metricas objetivas como FID, CLIP score o comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: 4 GB pico a 512x768 en FP16, segun el autor (medido en RX580 8 GB con stable-diffusion.cpp Vulkan). En SD 1.5 el consumo tipico en FP16 ronda los 4-6 GB a 512x512 con `diffusers`, aunque el autor no lo declara para esa ruta.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para trabajar con holgura; el autor valida una RX580 de 8 GB. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas de 6-8 GB o superiores (RX580, GTX 1660, RTX 3060, etc.). En GPUs con menos de 4 GB requeriria tecnicas de offloading no documentadas por el autor.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline.from_single_file`, ComfyUI, AUTOMATIC1111 y stable-diffusion.cpp (edicion Vulkan). No se menciona soporte para vLLM ni TGI (no aplican a difusion).
- Latencia y throughput: no disponibles. El autor no publica tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chemicarLabs/hentai_FP16 | SD 1.5 (~860 M UNet) | 512x768 validado por el autor | CreativeML OpenRAIL-M | HuggingFace, single-file safetensors | Sin safety checker; 38 descargas |
| philz1337x/hentai | SD 1.5 | no disponible | CreativeML OpenRAIL-M | HuggingFace | Modelo base del que deriva este checkpoint |
| Stable Diffusion 1.5 (runwayml) | SD 1.5 (~860 M UNet) | 512x512 nativo | CreativeML OpenRAIL-M | HuggingFace, diffusers y single-file | Modelo generalista de referencia, con safety checker |
| Stable Diffusion XL | ~2,6 B UNet | 1024x1024 nativo | CreativeML OpenRAIL++-M | HuggingFace | Mayor calidad y resolucion, requiere mas VRAM |

## Limitaciones y advertencias

- Contenido NSFW explicito: el modelo esta disenado para generar material para adultos y no incorpora safety checker. No es apto para entornos sin control de acceso ni para audiencias no verificadas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes, texto ilegible y artefactos, especialmente sin prompt negativo.
- Sesgos conocidos: no documentados por el autor; los finetunes de SD 1.5 suelen heredar sesgos de representacion del dataset original (LAION), no auditados aqui.
- Idioma: solo se declara soporte de ingles; los prompts en castellano pueden degradar la calidad.
- Resolucion limitada: validado a 512x768; no se documenta comportamiento a resoluciones superiores.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos y de reventa del modelo sin cumplir las clausulas de la licencia); conviene revisar el texto completo antes de desplegarlo en produccion.
- Model card incompleta: sin datos de entrenamiento, sin benchmarks y sin informe de evaluacion de sesgos; no apto como base para afirmaciones de rendimiento.
- Repositorio con muy baja traccion (38 descargas, 0 likes) y creado en 2026: sin comunidad de validacion ni issues documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chemicarLabs/hentai_FP16
- Modelo base: https://huggingface.co/philz1337x/hentai
- Salidas generadas con la configuracion recomendada: https://huggingface.co/sjprogrammer90/hentai_FP16/resolve/main/outputs.rar?download=true
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- AUTOMATIC1111 stable-diffusion-webui: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
