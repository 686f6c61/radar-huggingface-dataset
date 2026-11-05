# RunningHubAI/rh-raehoshi-illust-xl-v.11-checkpoint

## Resumen

rh-raehoshi-illust-xl-v.11-checkpoint es un checkpoint de difusión para generación de imágenes de estilo anime, desarrollado por el autor conocido como nullnull y distribuido por RunningHubAI. Se trata de un ajuste fino (fine-tuning) del modelo base Illustrious XL, orientado a mejorar el estilo visual y corregir limitaciones del original, como la sobresaturación de color y el ruido de artefactos. La versión v.11 corresponde a la undécima iteración de un proceso continuo de entrenamiento por etapas.

El modelo se publica como un único archivo de pesos en formato safetensors de aproximadamente 6,9 GB, lo que sitúa su tamaño en el rango típico de los checkpoints SDXL (un UNet de unos 2.600 millones de parámetros más los codificadores de texto y el VAE). Está pensado para su uso en ComfyUI y en la plataforma RunningHub, con configuraciones de muestreo y prompts recomendados por el autor.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un checkpoint de imagen especializado en ilustración anime, con cobertura de franquicias concretas (Zenless Zone Zero, Wuthering Waves, Honkai: Star Rail, Genshin Impact, entre otras). La información pública disponible es escasa y procede casi exclusivamente de la model card del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente tipo SDXL (UNet + codificador de texto + VAE); no se detalla en la model card |
| Parametros totales | no disponible (checkpoint SDXL, tamaño de archivo 6.617 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución nativa recomendada 1024x1024 y variantes hasta 1536 |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible (prompts en inglés según los ejemplos de la model card) |
| Licencia | no disponible; la model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`raehoshiIllustXL_v110.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusión construido sobre Illustrious XL (IL-XL), a su vez derivado de la familia SDXL. La model card no detalla la arquitectura interna más allá de indicar que se trata de un checkpoint y que el ajuste se realizó en dos etapas. En la etapa 1 se introdujeron nuevas series y personajes; en la etapa 2 se corrigieron problemas y se refinó el estilo general. La etapa 1 usó datasets de entre 15.000 y 60.000 imágenes por versión, con batch size 32, acumulación de gradientes de 2 pasos, learning rate 6e-6 para el UNet y 3e-6 para el codificador de texto, y 15 épocas. La etapa 2 empleó datasets más pequeños (entre 1.500 y 4.100 imágenes), batch size 48, learning rate 3e-6 (2,5e-6 en v5.1) y el codificador de texto desactivado.

El entrenamiento se realizó en GPUs alquiladas en la nube: 2x A100 80 GB para las primeras versiones, 2x H100 80 GB para v3 a v5.1, y RTX PRO 6000 para v7 a v10. No se especifican el número total de pasos, la composición exacta del dataset ni si hubo técnicas adicionales como RLHF o DPO (no aplicables en este contexto). La innovación declarada es la reducción de sobresaturación y ruido de artefactos respecto al modelo base, aunque el propio autor reconoce que estos problemas no se eliminan por completo.

## Capacidades

- Generación de imágenes de ilustración estilo anime a partir de prompts de texto.
- Soporte de etiquetas de calidad explícitas: `masterpiece`, `best quality`, `good quality`, `average quality`, `bad quality`, `worst quality`.
- Etiquetas de clasificación de contenido: `safe`, `sensitive`, `nsfw`, `nsfw, explicit`.
- Etiquetas estéticas: `very aesthetic`, `aesthetic`, `displeasing`, `very displeasing`.
- Cobertura de personajes y series entrenadas explícitamente: Zenless Zone Zero, Wuthering Waves, Honkai: Star Rail, Genshin Impact, Arknights: Endfield, Umamusume, Azur Lane, Arknights, Fate/GO, Dandadan, entre otras (la lista aparece truncada en la model card).
- Compatibilidad con img2img y upscaling mediante Hires.fix (upscaler recomendado 4x Foolhardy Remacri, 10-15 pasos, denoise 0,1-0,3).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente; no es un modelo de lenguaje.
- No se documentan capacidades multilingües; los prompts de ejemplo están en inglés.

## Casos de uso

- Generación de ilustraciones de personajes de franquicias anime concretas: el modelo ha sido entrenado explícitamente con series como Genshin Impact o Honkai: Star Rail, por lo que puede reproducir personajes de esas obras con mayor fidelidad que un SDXL genérico.
- Creación de arte conceptual para proyectos de fan art o doujin: con las resoluciones recomendadas (832x1216, 1024x1024) y CFG 5-7 se obtienen resultados listos para revisión con mínima iteración.
- Producción de imágenes para redes sociales o portadas: el flujo Hires.fix con 4x Remacri permite escalar a 1024x1536 o 1536x1024 manteniendo detalle.
- Prototipado rápido en ComfyUI: al ser un checkpoint único en safetensors, se carga directamente en el nodo `CheckpointLoaderSimple` sin dependencias adicionales.
- Generación por lotes en plataformas gestionadas: RunningHub ofrece ejecución en la nube y API, útil si no se dispone de GPU local.
- Exploración de estilos con control de calidad y estética: las etiquetas de rating y aesthetic permiten filtrar o condicionar el tipo de salida (safe, sensitive, nsfw) y el nivel de acabado.
- Integración en pipelines de generación de contenido para videojuegos o merchandising, siempre que la licencia lo permita (no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como FID, CLIP score ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (6,9 GB en safetensors) se necesita al menos esa cantidad de VRAM para cargar los pesos, más overhead del VAE y del codificador de texto.
- GPU recomendadas: el autor entrenó en A100 80 GB, H100 80 GB y RTX PRO 6000, pero esas cifras corresponden al entrenamiento, no a la inferencia.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; por tamaño, una RTX 3090 o RTX 4090 (24 GB) debería poder cargarlo, pero no está verificado en la información disponible.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma del distribuidor) y Hugging Face. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tamaño del checkpoint | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-raehoshi-illust-xl-v.11 | Illustrious XL | 6.617 MiB | hasta 1536 px recomendado | no disponible | Hugging Face, RunningHub, ComfyUI |
| Illustrious XL (base) | SDXL | no disponible en la información | no disponible | no disponible | no disponible en la información |
| SDXL base | SDXL | ~6,9 GB | 1024x1024 nativo | CreativeML Open RAIL++-M (según el proyecto original) | Hugging Face, amplia comunidad |
| Otros fine-tunes anime de SDXL | SDXL | ~6-7 GB | 1024x1024 nativo | variable según autor | Civitai, Hugging Face |

La comparación con alternativas concretas no puede completarse con datos verificables a partir de la información proporcionada; los datos de Illustrious XL y de otros fine-tunes no aparecen en la documentación consultada.

## Limitaciones y advertencias

- La licencia no está especificada; la model card remite a la licencia del proyecto original o upstream (Illustrious XL / SDXL). Antes de un uso comercial es imprescindible verificar la licencia de la cadena de modelos base.
- El autor reconoce que la sobresaturación y el ruido de artefactos no se eliminan por completo, solo se atenúan.
- Riesgo de sesgos y de contenido no deseado: el modelo admite etiquetas `nsfw` y `nsfw, explicit`, lo que exige moderación en entornos de producción.
- Cobertura de personajes limitada a las series entrenadas explícitamente; personajes fuera de esa lista pueden generar resultados inconsistentes.
- No hay información sobre el dataset de entrenamiento más allá del número de imágenes por versión, por lo que no se puede evaluar el consentimiento de las imágenes fuente ni posibles sesgos de representación.
- El modelo está pensado para ilustración anime; no es adecuado para fotorealismo, tareas de lenguaje, código ni razonamiento.
- La fecha de creación del repositorio (2026-11-05) y el contador de descargas y likes a cero indican que se trata de una publicación muy reciente y sin validación comunitaria.
- No se documentan requisitos mínimos de hardware para inferencia; el despliegue en GPUs de consumo no está verificado.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-raehoshi-illust-xl-v.11-checkpoint
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091092366219362306
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- Página de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Ko-fi del autor: https://ko-fi.com/raelina
- Upscaler recomendado (4x Foolhardy Remacri): https://openmodeldb.info/models/4x-Remacri
