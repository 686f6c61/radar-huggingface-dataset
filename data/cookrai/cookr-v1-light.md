# CookrAI/cookr-v1-light

## Resumen

Cookr v1 light (CookrAI/cookr-v1-light) es un modelo de difusión de texto a imagen especializado en la generación de memes y activos visuales para memecoins. Lo publica CookrAI, el equipo detrás de cookr.pro, y se distribuye como un checkpoint completo y autónomo bajo licencia Apache-2.0. Su función es convertir una idea de personaje y un ticker en un logo de memecoin, un sticker troquelado o una plantilla de meme con una sola pasada de inferencia: 9 pasos, 1024 px y sin CFG.

Técnicamente es un ajuste fino del modelo base Tongyi-MAI/Z-Image-Turbo (Apache-2.0) mediante un LoRA de rango 96 y alfa 96, entrenado con el adaptador de de-destilación `zimage:turbo` de ai-toolkit y posteriormente fusionado en los pesos. El resultado son 6.154.908.736 parámetros (unos 6,15 B) en el formato diffusers estándar (transformer, text_encoder, vae, tokenizer, scheduler), ejecutables con `ZImagePipeline`.

Su relevancia es de nicho pero muy concreta: es una de las pocas alternativas abiertas que reproduce la estética de los logos de pump.fun y de las plantillas de meme de internet, con una gramática de prompt propia y un coste de inferencia bajo (una GPU de 24 GB y unos segundos por imagen), frente al modelo completo que CookrAI sirve en su plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion texto a imagen (pipeline `ZImagePipeline` de diffusers) derivado de Tongyi-MAI/Z-Image-Turbo |
| Parametros totales | 6.154.908.736 (unos 6,15 B) |
| Longitud de contexto | no aplicable (modelo de imagen); resoluciones de entrenamiento en buckets de 512 / 768 / 1024 px |
| Tipos de cuantizacion | no disponible; la model card solo documenta carga en bfloat16 |
| Idiomas soportados | no disponible; gramatica de prompt y captions de entrenamiento en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (estructura diffusers completa, transformer en fichero unico y LoRA independiente) |
| Tamano del repositorio | 33,4 GB |
| Modelo base | Tongyi-MAI/Z-Image-Turbo |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint abierto Z-Image-Turbo. Segun la model card, el entrenamiento se hizo con el adaptador `zimage:turbo` de ai-toolkit, pensado para trabajar sobre un modelo destilado, y el LoRA resultante (rango 96, alfa 96) se fusiono en los pesos a escala 1.0, por lo que no hace falta cargar ninguna LoRA en tiempo de inferencia. La estructura del repositorio es la habitual de diffusers (`transformer/`, `text_encoder/`, `vae/`, `tokenizer/`, `scheduler/`, `model_index.json`), con el text encoder y el VAE sin modificar respecto al modelo base.

El dataset consta de 5.300 logos de monedas de pump.fun (priorizando las monedas que llegaron a graduarse o cotizaron, y deduplicadas por hash perceptual) mas 98 plantillas de meme repetidas ocho veces. Las captions se generaron con Qwen2.5-VL anteponiendo el nombre de la moneda y su ticker. El entrenamiento se ejecuto durante 5.000 pasos, con batch 2, learning rate 1e-4, optimizador adamw8bit, precision bf16, EMA 0.99 y buckets de resolucion de 512, 768 y 1024 px. Todo el proceso consumio 2,5 horas en una unica GPU L40S.

## Capacidades

- Generacion de imagenes a partir de texto con la gramatica nativa `cookr,  de <personaje> (<TICKER>), <detalles>, <estilo>, <colores>`.
- Tres formatos entrenados explicitamente: logo de memecoin, sticker troquelado (`die-cut sticker`) y plantilla de meme.
- Cinco estilos documentados: `cartoon`, `pixel art`, `3d render`, `mspaint style` y `photo`.
- Renderizado del ticker dentro de la imagen como parte de la composicion del logo.
- Inferencia rapida: 9 pasos a 1024 px con `guidance_scale=1.0`, sin CFG.
- API de direcciones que devuelve cuatro variantes de un mismo personaje (logo, sticker, meme y alternativa) en una sola llamada.
- Compatibilidad con flujos de ComfyUI cargando `cookr-v1-light-transformer.safetensors` como modelo de difusion Z-Image-Turbo.
- LoRA independiente (`cookr-v1-light-lora.safetensors`) apilable sobre otros pesos.
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, entrada de vision ni audio: es un modelo exclusivamente texto a imagen.

## Casos de uso

- Creacion de logos de memecoin para lanzamientos: dado un nombre de personaje y un ticker, el modelo genera una imagen cuadrada de 1024 px apta para el listado de un token en pump.fun, con el ticker integrado en la composicion.
- Stickers para comunidades: la salida `die-cut sticker` produce recortes con fondo limpio que se pueden subir directamente a Telegram, Discord o WhatsApp como pack de stickers del proyecto.
- Plantillas de meme para marketing en redes: el formato `meme template` permite generar variantes de plantillas clasicas (por ejemplo, `distracted boyfriend`) adaptadas a una narrativa cripto concreta.
- Produccion por lotes de contenido: mediante la API de Python (`cookr[infer]`) se puede recorrer una lista de nombres y tickers y generar cientos de activos en una sola GPU de 24 GB, con un coste de unos segundos por imagen.
- Prototipado de identidad visual antes del lanzamiento: un equipo puede generar cuatro direcciones creativas por idea con `c.directions(...)` y elegir la que mejor encaje antes de encargar un diseno definitivo.
- Integracion en flujos de diseno con ComfyUI: el fichero single-file se carga como modelo de difusion Z-Image-Turbo dentro de un workflow existente, reutilizando el text encoder y el VAE originales.
- Personalizacion de mascotas de marca: una empresa o comunidad puede fijar un personaje recurrente y generar variaciones de escena y estilo manteniendo coherencia de estilo gracias al entrenamiento con captions homogeneas.
- Generacion de imagenes para bots de trading o dashboards: el modelo se puede invocar desde un backend que responda a eventos de mercado creando una imagen tematica para cada hito del token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los 6,15 B de parametros en bfloat16 ocupan aproximadamente 12,3 GB, a lo que hay que sumar el text encoder y el VAE del pipeline (estimacion propia a partir del recuento de parametros; no confirmada por el autor).
- Requisito declarado por el autor: funciona en una unica tarjeta de 24 GB, con una imagen de meme generada en unos segundos.
- GPU recomendadas: cualquier GPU con 24 GB o mas de VRAM. El unico modelo citado en la informacion es la L40S, usada para el entrenamiento (2,5 horas). No se especifican otras GPU compatibles.
- Espacio en disco: el repositorio ocupa 33,4 GB, ya que incluye el modelo diffusers completo, el transformer en fichero unico para ComfyUI y la LoRA independiente.
- Despliegue: `ZImagePipeline` de diffusers (Python), el paquete propio `cookr` instalable desde git, y ComfyUI cargando `cookr-v1-light-transformer.safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion.
- Latencia y throughput: no se publican cifras concretas de latencia ni de imagenes por segundo; la model card solo indica "unos segundos" por imagen a 1024 px.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / inferencia | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cookr v1 light | 6,15 B | 1024 px, 9 pasos, sin CFG | Sin benchmarks publicados | Apache-2.0 | Hugging Face (diffusers, safetensors, ComfyUI) |
| Tongyi-MAI/Z-Image-Turbo (base) | no disponible | no disponible | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |
| COOKR completo (servicio) | no disponible | no disponible | no disponible | no especificada; se sirve en cookr.pro y su API | Solo como servicio gestionado |
| LoRAs de memes sobre SDXL o FLUX.1 | no disponible | no disponible | Sin datos comparativos en la informacion disponible | Variable segun el modelo base | Variable |

## Limitaciones y advertencias

- Dataset de entrenamiento reducido: 5.300 logos de pump.fun y 98 plantillas de meme repetidas ocho veces, frente a los "millones de memes" del modelo completo, lo que limita la variedad de personajes y estilos fuera de la distribucion entrenada.
- Alta dependencia de la gramatica de prompt: el modelo fue entrenado con captions de una unica forma, y la propia model card indica que responde mejor a ese formato y que `cookr` debe ser el primer token.
- Riesgo de contenido sesgado u ofensivo: los datos de origen son logos de memecoins y plantillas virales de internet, un corpus sin curacion editorial documentada.
- Ambiguedad sobre derechos de las imagenes: la licencia Apache-2.0 cubre los pesos, pero la model card especifica que las imagenes de entrenamiento siguen siendo propiedad de quien las creo, lo que deja abierta la cuestion del uso comercial de las salidas.
- Riesgo de alucinacion visual y de errores en el texto renderizado: no hay datos publicados sobre la tasa de acierto al dibujar el ticker ni sobre imagenes anatomicamente incoherentes, un fallo habitual en modelos de difusion.
- Configuracion de inferencia fija: esta entrenado para 9 pasos y `guidance_scale=1.0`; no se documenta el comportamiento con otros valores de pasos o CFG.
- Idiomas: no se declaran idiomas soportados y la gramatica de prompt esta en ingles, por lo que se desconoce el comportamiento con prompts en castellano.
- Validacion comunitaria practicamente nula: 0 descargas y 1 like en el momento de la consulta.
- Sin benchmarks publicados: no hay MMLU, FID, CLIP score ni ninguna otra metrica que permita verificar la calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CookrAI/cookr-v1-light
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Plataforma: https://cookr.pro
- Repositorio principal y configuracion de entrenamiento: https://github.com/CookrAI/cookr
- Colector de datos de pump.fun: https://github.com/CookrAI/pumpfun-collector
- Colector de plantillas de meme: https://github.com/CookrAI/meme-collector
- Colector de datos de X: https://github.com/CookrAI/x-collector
- Perfil en X: https://x.com/CookrPro
- Contacto: hi@cookr.pro
