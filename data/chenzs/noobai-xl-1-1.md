# chenzs/NoobAI-XL-1.1

## Resumen

NoobAI XL 1.1 es un modelo de difusion texto-a-imagen derivado de SDXL, desarrollado por Laxhar Lab y afinado a partir de NoobAI XL 1.0 (que a su vez parte de Illustrious-XL). El repositorio `chenzs/NoobAI-XL-1.1` es una redistribucion del modelo original alojado en `Laxhar/noobai-XL-1.1`, publicada por el usuario chenzs. Esta especializado en ilustracion de estilo anime y manga, con un sistema de etiquetado nativo basado en Danbooru y e621 que permite controlar personajes, series, artistas y calidad mediante tags.

El modelo resuelve el problema de generar ilustraciones anime coherentes y fieles a estilos de autor concretos, algo que los SDXL genericos no logran sin LoRAs adicionales. Para ello emplea los datasets completos de Danbooru y e621 hasta la fecha de entrenamiento (aproximadamente octubre de 2024 para la version 1.0), con captions en formato tag nativo.

Es relevante porque consolida la linea de modelos anime basados en SDXL con control granular por tags de calidad, fecha y artista, y porque su licencia Fair AI Public License 1.0-SD prohibe explicitamente el uso comercial, lo que condiciona cualquier evaluacion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (SDXL, transformer UNet + VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolucion de entrenamiento en torno a 1024x1024 de area total |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en fp16 por defecto) |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | fair-ai-public-license-1.0-sd (con terminos adicionales del autor) |
| Formato de pesos | Safetensors, compatible con Diffusers |

## Arquitectura y entrenamiento

Modelo de difusion latente con la arquitectura SDXL (UNet con bloques transformer, doble text encoder CLIP y VAE), afinado a partir de NoobAI XL 1.0, que a su vez deriva de Illustrious-XL. El entrenamiento emplea los datasets completos de Danbooru (imagenes hasta aproximadamente 2024-10-23 en la v1.0) y e621 (dataset `e621-2024-webp-4Mpixel`), con captions en formato de tags nativo de Danbooru en lugar de descripciones en lenguaje natural.

La innovacion principal esta en el sistema de etiquetado: los tags de calidad (`masterpiece`, `best quality`, `good quality`, `normal quality`, `worst quality`) se asignan por percentiles de popularidad calculados con normalizacion por fuentes y ratings, mas un coeficiente de decaimiento temporal por recencia. Los tags de fecha (`old`, `early`, `mid`, `recent`, `newest`) segmentan el estilo por periodo (2005-2010, 2011-2014, 2014-2017, 2018-2020, 2021-2024). No se detalla en la informacion disponible si hubo etapas de RLHF, DPO ni el numero exacto de tokens o pasos de entrenamiento.

## Capacidades

- Generacion de imagenes texto-a-imagen de ilustracion anime y manga con alta fidelidad estilistica.
- Control de personajes y series mediante tags (`<1girl/1boy/1other>`, `<character>`, `<series>`).
- Control de estilo de autor mediante tags de artista.
- Control de calidad percibida mediante tags calibrados por percentiles de popularidad.
- Control temporal del estilo mediante tags de fecha.
- Composicion por areas de resolucion predefinidas (768x1344, 832x1216, 896x1152, 1024x1024, 1152x896, 1216x832, 1344x768).
- Soporte de ControlNet especifico del proyecto (normal, depth y canny publicados en Civitai).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no de texto.

## Casos de uso

- Ilustracion de personajes originales: el modelo permite describir un personaje mediante tags de apariencia y combinarlo con un estilo de artista concreto, adecuado para concept art de proyectos de manga o videojuego.
- Fan art de series conocidas: al estar entrenado con tags de personaje y serie de Danbooru, se puede solicitar una ilustracion de un personaje canonico en un estilo determinado sin necesidad de LoRAs.
- Generacion de assets para prototipos de videojuego: sprites, retratos de personajes y fondos estilizados en resoluciones verticales y horizontales predefinidas que encajan en layouts de UI.
- Exploracion de estilos historicos: los tags de fecha permiten reproducir la estetica de periodos concretos (por ejemplo, `early` para 2011-2014), util para estudios comparativos de evolucion del estilo anime.
- Ilustracion editorial y de fanzine: generacion de portadas e interiores con control de calidad mediante CFG 5-6 y 25-30 pasos con sampler Euler a.
- Integracion en pipelines de ControlNet: con los ControlNet normal, depth y canny del proyecto se pueden imponer poses, profundidad o contornos sobre bocetos previos, util para workflows de ilustracion asistida.
- Generacion de variaciones controladas: combinando tags de calidad y fecha se pueden producir lotes con distintos niveles de acabado para seleccion artistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-10 GB en fp16 a 1024x1024 con SDXL; no se dispone de cifras oficiales del autor.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para generacion por lotes; cualquier GPU con al menos 8 GB de VRAM para inferencia individual.
- Cabe en GPUs de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en GPUs de 8 GB puede requerir tecnicas de offload.
- Opciones de despliegue: Diffusers (formato nativo del repo), ComfyUI, Automatic1111/Forge, InvokeAI y otras interfaces compatibles con checkpoints SDXL en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| NoobAI XL 1.1 | no disponible | ~1024x1024 area total | fair-ai-public-license-1.0-sd (no comercial) | Hugging Face (Laxhar y mirrors) |
| Illustrious-XL (early release) | no disponible | ~1024x1024 | fair-ai-public-license-1.0-sd | Hugging Face (OnomaAIResearch) |
| NoobAI XL 1.0 | no disponible | ~1024x1024 | fair-ai-public-license-1.0-sd | Hugging Face (Laxhar) |
| SDXL base 1.0 | no disponible | 1024x1024 | CreativeML Open RAIL++-M (uso comercial permitido) | Hugging Face (Stability AI) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a licencia, linaje y disponibilidad.

## Limitaciones y advertencias

- Licencia no comercial: la Fair AI Public License 1.0-SD prohibe cualquier forma de comercializacion del modelo, modelos derivados y productos generados.
- Obligacion de apertura: los modelos derivados, merges y LoRAs deben publicarse como open source y compartir formulas, prompts y workflows.
- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y el autor incluye `nsfw` en el negative prompt por defecto; requiere filtrado explicito en despliegues publicos.
- Riesgo de sesgos: entrenado sobre Danbooru y e621, datasets con sesgos de estilo, demografia y contenido; puede reproducir estereotipos visuales y estilos sobrerrepresentados.
- Riesgo de alucinacion visual: como modelo de difusion, puede generar anatomia incorrecta (manos, extremidades), texto ilegible y detalles incoherentes, especialmente fuera de las resoluciones recomendadas.
- Idioma: prompts exclusivamente en ingles; los tags de Danbooru estan en ingles y no hay soporte nativo de castellano.
- Dependencia de tags: el rendimiento depende del conocimiento del vocabulario Danbooru; prompts en lenguaje natural funcionan peor que listas de tags.
- Redistribucion de terceros: este repositorio (`chenzs/NoobAI-XL-1.1`) es un mirror sin descargas ni likes; conviene verificar integridad y procedencia frente al repositorio oficial de Laxhar.
- Fecha de creacion del repo (2026-11-08) posterior a la publicacion original; no hay garantia de que el contenido coincida exactamente con la version oficial.

## Enlaces

- Repositorio evaluado: https://huggingface.co/chenzs/NoobAI-XL-1.1
- Repositorio oficial: https://huggingface.co/Laxhar/noobai-XL-1.1
- Modelo base: https://huggingface.co/Laxhar/noobai-XL-1.0
- Modelo base del linaje: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Licencia: https://freedevproject.org/faipl-1.0-sd/
- Dataset e621: https://huggingface.co/datasets/NebulaeWis/e621-2024-webp-4Mpixel
- ControlNet del proyecto: https://civitai.com/models/929685
- Discord de Laxhar Lab: https://discord.com/invite/DKnFjKEEvH
- Tutorial de uso: https://aiindigo.com/tutorials/getting-started-with-noobai-xl-1-1-mastering-authentic-anime-aesthetics
- Perfiles de contribuidores: https://civitai.com/user/L_A_X, https://huggingface.co/LAXMAYDAY, https://huggingface.co/heziiiii, https://huggingface.co/NebulaeWis, https://huggingface.co/windsingai, https://huggingface.co/Eugeoter
