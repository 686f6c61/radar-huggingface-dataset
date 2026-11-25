# hjbjnu/noobai-XL-1.1

## Resumen

NoobAI XL 1.1 es un modelo de difusion texto-a-imagen derivado de Illustrious-XL y afinado a partir de NoobAI XL 1.0, desarrollado por Laxhar Lab. Esta especializado en ilustracion de estilo anime y en la estetica de los repositorios Danbooru y e621, y emplea sus etiquetas nativas (tags) como mecanismo principal de condicionamiento. El modelo se distribuye como un checkpoint SDXL completo, con 2.567.463.684 parametros reales en los pesos safetensors y un repositorio de 14,0 GB.

La relevancia del modelo radica en su estrategia de captions: entrena con etiquetas nativas del dataset (personajes, series, artistas y tags generales) y con un sistema de quality tags y date tags calibrado mediante popularidad, decaimiento temporal y ranking dentro del dataset. Esto permite un control fino sobre el estilo, la epoca y la calidad percibida de la imagen generada. La version 1.1 es un fine-tune de la 1.0, que a su vez parte de Illustrious-XL.

La ficha se centra en los datos disponibles en la model card y en los metadatos del repositorio. No se han publicado resultados de benchmarks numericos, y la licencia es restrictiva: prohibe explicitamente la comercializacion del modelo, de sus derivados y de los productos generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen basado en SDXL (StableDiffusionXLPipeline de diffusers); fine-tune de Illustrious-XL |
| Parametros totales | 2.567.463.684 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos se publican en safetensors (precision completa del checkpoint) |
| Idiomas soportados | en (ingles) |
| Licencia | fair-ai-public-license-1.0-sd (con terminos adicionales del autor: prohibicion de uso comercial) |
| Formato de pesos | safetensors, compatible con diffusers (StableDiffusionXLPipeline) |
| Resolucion recomendada | area total en torno a 1024x1024; 832x1216 como opcion preferente |
| Pasos de muestreo recomendados | 25 a 30 |
| CFG recomendado | 5 a 6 |
| Sampler recomendado | Euler a |
| Modelo base | Laxhar/noobai-XL-1.0 |
| Tamano del repositorio | 14,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusion latente de SDXL, empaquetada como `StableDiffusionXLPipeline` en diffusers. Es un fine-tune de NoobAI XL 1.0, que a su vez deriva de Illustrious-XL, por lo que hereda el espacio latente y el text encoder de la familia SDXL. Los pesos suman 2.567.463.684 parametros y se distribuyen en safetensors.

El entrenamiento utiliza los datasets completos y actualizados de Danbooru (imagenes hasta aproximadamente 2024-10-23 en la version 1.0) y de e621, en concreto el dataset `NebulaeWis/e621-2024-webp-4Mpixel` alojado en Hugging Face. El condicionamiento se realiza con captions de etiquetas nativas en el orden `<1girl/1boy/1other/...>, <character>, <series>, <artists>, <special tags>, <general tags>, <other tags>`. La innovacion principal es el sistema de quality tags, construido normalizando datos de multiples fuentes y ratings, aplicando coeficientes de decaimiento temporal por fecha y ordenando las imagenes del dataset: `masterpiece` para el percentil superior al 95, `best quality` entre el 85 y el 95, `good quality` entre el 60 y el 85, `normal quality` entre el 30 y el 60 y `worst quality` por debajo del 30. Los date tags segmentan la epoca de la imagen: `old` (2005-2010), `early` (2011-2014), `mid` (2014-2017), `recent` (2018-2020) y `newest` (2021-2024). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO; en modelos de difusion estos datos no aplican del mismo modo y no se indican.

## Capacidades

- Generacion de imagenes texto-a-imagen de estilo anime e ilustracion, con control mediante etiquetas Danbooru y e621.
- Condicionamiento por personaje, serie y artista mediante tags nativos, lo que permite reproducir estilos y personajes concretos del dataset.
- Control de calidad percibida mediante quality tags (`masterpiece`, `best quality`, `good quality`, `normal quality`, `worst quality`).
- Control de epoca estilistica mediante date tags (`old`, `early`, `mid`, `recent`, `newest`).
- Soporte de prompt negativo recomendado por el autor para filtrar contenido no deseado y artefactos.
- Compatibilidad con resoluciones SDXL en formato apaisado y vertical (768x1344, 832x1216, 896x1152, 1024x1024, 1152x896, 1216x832, 1344x768).
- Integracion con la familia de ControlNet especifica de NoobXL (normal, depth y canny publicados de forma progresiva).
- Capacidades multilingues: solo ingles en los prompts, segun la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio; no aplican a un modelo de difusion texto-a-imagen.

## Casos de uso

- Generacion de ilustracion anime para proyectos personales y de codigo abierto: el modelo produce imagenes en resoluciones SDXL con control por tags de personaje, serie y artista, adecuado para fan art y prototipado visual.
- Creacion de personajes consistentes en un mismo universo: combinando tags de personaje y serie junto con quality tags se mantiene un estilo coherente entre iteraciones, util para webcomics o novelas visuales.
- Exploracion estilistica por epoca: los date tags permiten generar variaciones que imitan la estetica de 2005-2010 (`old`) frente a 2021-2024 (`newest`), util para estudios comparativos de estilo.
- Control estructural con ControlNet: gracias a los ControlNet normal, depth y canny publicados para NoobXL, se puede guiar la composicion desde bocetos, mapas de profundidad o contornos, util para ilustracion asistida.
- Generacion de assets para juegos indie no comerciales: siempre que se respete la licencia, el modelo sirve para prototipos de personajes y escenarios en un contexto de codigo abierto.
- Investigacion sobre condicionamiento por etiquetas: el sistema de quality tags y date tags basado en ranking y decaimiento temporal es un caso de estudio para tecnicas de captioning y control de calidad en difusion.
- Filtrado de contenido mediante prompt negativo: el autor proporciona un negativo recomendado que excluye `nsfw`, artefactos (`bad hands`, `mutated hands`) y morfologia furry/anthro, util para flujos de trabajo orientados a contenido seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como checkpoint SDXL de 2.567 millones de parametros en safetensors, la inferencia en precision completa requiere en torno a 10-12 GB de VRAM, y las versiones cuantizadas o en fp16 reducen el requisito, aunque la informacion proporcionada no detalla cuantizaciones.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del checkpoint, son adecuadas GPU con 16 GB o mas de VRAM (por ejemplo, RTX 4080, RTX 4090, A100, H100); esta estimacion no procede de la model card.
- Cabe en GPU de consumo: si, en GPU de gama alta con 16 GB o mas de VRAM; en GPU de 8-12 GB puede requerir fp16, offloading o cuantizacion, extremo no confirmado por el autor.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline`), con soporte de endpoints compatibles segun los tags del repositorio. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoobAI XL 1.1 | 2.567.463.684 | SDXL, 1024x1024 (832x1216 recomendado) | Sin benchmarks publicados | fair-ai-public-license-1.0-sd, sin uso comercial | Hugging Face (hjbjnu/noobai-XL-1.1) |
| NoobAI XL 1.0 | no disponible | SDXL, 1024x1024 | Sin benchmarks publicados en la informacion | fair-ai-public-license-1.0-sd | Hugging Face (Laxhar/noobai-XL-1.0), modelo base |
| Illustrious-XL | no disponible | SDXL, 1024x1024 | Sin benchmarks publicados en la informacion | fair-ai-public-license-1.0-sd | Hugging Face (OnomaAIResearch/Illustrious-xl-early-release-v0) |
| SDXL base | no disponible | SDXL, 1024x1024 | Sin datos en la informacion | licencia SDXL (no detallada aqui) | Hugging Face / Stability AI |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos numericos de rendimiento para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento con Danbooru y e621 puede reproducir sesgos de representacion y esteticos propios de esos repositorios, incluidos contenidos para adultos; el tag `not-for-all-audiences` figura en el repositorio.
- Riesgo de alucinacion: como modelo generativo de imagenes, puede producir anatomia incorrecta (el autor incluye `bad hands` y `mutated hands` en el prompt negativo), artefactos y resultados incoherentes con el prompt.
- Limitaciones de idioma: solo se documenta ingles para los prompts; el rendimiento con otros idiomas no esta garantizado.
- Restricciones de licencia: la fair-ai-public-license-1.0-sd con terminos adicionales prohibe cualquier forma de comercializacion, incluida la monetizacion del modelo, de modelos derivados y de los productos generados; tambien obliga a publicar en codigo abierto los modelos derivados, merges, LoRAs y productos, y a compartir formulas, prompts y flujos de trabajo.
- Obligaciones de la licencia: prohibicion de usos daninos, maliciosos o ilegales, de contenido no etico u ofensivo y de violacion de leyes locales.
- Caveat para produccion: al no haber benchmarks publicados ni datos de latencia, no se puede garantizar un rendimiento concreto en produccion; ademas, el modelo esta pensado para ilustracion anime y no para fotorealismo.
- Disponibilidad: el repositorio consultado (hjbjnu/noobai-XL-1.1) registra 0 descargas y 0 likes, lo que sugiere una distribucion muy limitada; conviene verificar la procedencia de los pesos.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/hjbjnu/noobai-XL-1.1
- Modelo base NoobAI XL 1.0: https://huggingface.co/Laxhar/noobai-XL-1.0
- Modelo Illustrious-XL (origen de la licencia): https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Licencia fair-ai-public-license-1.0-sd: https://freedevproject.org/faipl-1.0-sd/
- Dataset e621 utilizado: https://huggingface.co/datasets/NebulaeWis/e621-2024-webp-4Mpixel
- ControlNet para NoobXL: https://civitai.com/models/929685
- Discord de Laxhar Dream Lab SDXL NOOB: https://discord.com/invite/DKnFjKEEvH
- Perfil del autor en Hugging Face: https://huggingface.co/LAXMAYDAY
- Entrenador Naifu: https://github.com/Mikubill/naifu
- OnommAI: https://onomaai.com/
