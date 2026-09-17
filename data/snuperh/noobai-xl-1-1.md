# snuperh/noobai-XL-1.1

## Resumen

NoobAI XL 1.1 es un modelo de difusión latente para generación de imágenes a partir de texto, especializado en ilustración de estilo anime y arte de fandoms, desarrollado por Laxhar Lab. Se trata de un fine-tune de Laxhar/noobai-XL-1.0, que a su vez deriva de Illustrious-XL, y llega empaquetado con la pipeline `StableDiffusionXLPipeline` de la librería diffusers. La ficha de HuggingFace analizada (snuperh/noobai-XL-1.1) es una subida del modelo original realizada por el usuario snuperh, no el repositorio oficial del autor.

El modelo pesa 2.567.463.684 parámetros (unos 2,57 mil millones) y ocupa 14,0 GB en el repositorio, lo que lo sitúa en la misma escala que la familia SDXL. Su rasgo diferencial es el entrenamiento con los conjuntos de datos completos y actualizados de Danbooru y E621, con etiquetado nativo de tags, lo que le permite interpretar directamente vocabulario booru (personajes, series, artistas y tags de calidad) sin necesidad de conversión a lenguaje natural.

Es relevante ahora porque la generación de ilustración anime con control fino de personaje, serie y estilo artístico es uno de los nichos con mayor actividad de la comunidad open source (LoRAs, ControlNet, merges). La etiqueta `not-for-all-audiences` y la licencia fair-ai-public-license-1.0-sd condicionan fuertemente su uso: se permite el uso abierto y la creación de derivados, pero se prohíbe explícitamente cualquier forma de comercialización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente basada en SDXL (pipeline `StableDiffusionXLPipeline`, U-Net con doble codificador de texto) |
| Parámetros totales | 2.567.463.684 (dato real de los safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; no es un LLM. El condicionamiento se realiza por prompt de texto) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos safetensors en el repositorio diffusers) |
| Idiomas soportados | en (inglés; los prompts y tags están en inglés) |
| Licencia | fair-ai-public-license-1.0-sd (licencia `other`; prohíbe el uso comercial) |
| Formato de pesos | safetensors (estructura diffusers) |
| Tarea | text-to-image |
| Modelo base | Laxhar/noobai-XL-1.0 (fine-tune) |
| Resolución recomendada | Área total en torno a 1024x1024; valores óptimos: 768x1344, 832x1216, 896x1152, 1024x1024, 1152x896, 1216x832, 1344x768 |
| Configuración de muestreo | CFG 5-6, 25-30 pasos, sampler Euler a |
| Tamaño del repositorio | 14,0 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL: un modelo de difusión latente que opera en el espacio latente de un autoencoder (VAE) y condiciona la generación mediante dos codificadores de texto, siguiendo la pipeline `StableDiffusionXLPipeline` de diffusers. No hay información en la model card sobre el número exacto de bloques, la configuración del U-Net ni si se empleó variante de predicción v (v-prediction), aunque los agradecimientos del autor mencionan explícitamente a colaboradores por "instrucciones detalladas y experimentos" sobre v-prediction, lo que sugiere que ese aspecto fue objeto de trabajo en la familia NoobAI.

El entrenamiento se realizó sobre el dataset completo y actualizado de Danbooru (para la v1.0, aproximadamente hasta 2024-10-23) y sobre el conjunto E621 `e621-2024-webp-4Mpixel` alojado en HuggingFace, con etiquetado nativo de tags booru. El autor describe un sistema de "quality tags" construido a partir de la popularidad de las imágenes: normalización por fuentes y ratings, coeficiente de decaimiento temporal según la fecha y ranking sobre el conjunto completo, asignando etiquetas por percentil (`masterpiece` >95, `best quality` 85-95, `good quality` 60-85, `normal quality` 30-60, `worst quality` <=30). También se definen date tags por periodo (2005-2010 `old`, 2011-2014 `early`, 2014-2017 `mid`, 2018-2020 `recent`, 2021-2024 `newest`). No se detallan en la información disponible el número de pasos de entrenamiento, el tamaño de lote, ni si hubo fases de RLHF/DPO (no aplicables de forma convencional en difusión).

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con la pipeline `StableDiffusionXLPipeline` de diffusers.
- Interpretación de vocabulario booru nativo: personajes, series, artistas, tags especiales y tags generales, sin traducción a lenguaje natural.
- Control estructural del resultado mediante etiquetas de calidad (`masterpiece`, `best quality`, etc.) y de época (`old`, `early`, `mid`, `recent`, `newest`).
- Especialización en ilustración de estilo anime y arte de fandom, incluyendo contenido de los dominios Danbooru y E621.
- Compatibilidad con ControlNet: Laxhar Lab entrena ControlNets específicos para NoobAI (hasta la fecha se han publicado los de tipo normal, depth y canny, en Civitai).
- Compatible con el ecosistema de merges y LoRAs, ya que el pipeline y el formato de pesos son los estándar de SDXL.
- No se documentan en la información disponible capacidades de tool calling, agentes, multi-step reasoning ni procesamiento de visión de entrada, audio o vídeo.

## Casos de uso

- Generación de ilustración anime para proyectos personales: el modelo entiende directamente tags de personaje, serie y artista, lo que permite reproducir estilos concretos con prompts cortos del tipo `<1girl>, <character>, <series>, <artists>`.
- Diseño de personajes y concept art: combinando tags generales y de calidad se pueden iterar variantes de un mismo personaje manteniendo coherencia de diseño a resoluciones de 832x1216 o 1216x832.
- Creación de datasets sintéticos para investigación: útil para aumentar conjuntos de imágenes etiquetadas al estilo booru en experimentos de clasificación, detección o entrenamiento de nuevos modelos, siempre que se respete la cláusula de no comercialización.
- Base para entrenamiento de LoRAs y fine-tunes: al ser un modelo SDXL con formato diffusers estándar, se puede usar como punto de partida en pipelines de DreamBooth/LoRA dentro de la comunidad open source.
- Flujos de trabajo con ControlNet: integrado con los ControlNet de Laxhar Lab (normal, depth, canny) permite transferir pose, profundidad o bordes a la generación, útil para ilustración técnica y storyboards.
- Ilustración para novelas visuales y juegos indie no comerciales: la licencia permite la generación y publicación de obras derivadas siempre que no haya monetización y se mantenga la apertura del trabajo derivado.
- Investigación sobre control de sesgo y etiquetado en modelos de difusión: el sistema de quality tags y date tags documentado ofrece un caso de estudio explícito sobre cómo el ranking de popularidad se traduce en condicionamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones de preferencia) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

Las siguientes cifras son estimaciones orientativas derivadas del recuento real de parámetros (2,57 mil millones) y del tamaño del repositorio (14,0 GB); no están confirmadas en la información proporcionada.

- VRAM estimada para inferencia: en torno a 8 GB en fp16 y por encima de 12-16 GB si se carga el modelo en fp32. El repositorio de 14,0 GB es coherente con la presencia de pesos en precisión completa o varias variantes.
- GPU recomendadas: NVIDIA RTX 3060 12 GB o superior para fp16; RTX 4090, A100 o H100 para lotes grandes, alta resolución o entrenamiento de LoRAs.
- ¿Cabe en GPU de consumo? Sí, en fp16 cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 3080, etc.). En tarjetas de 6-8 GB puede requerir `enable_model_cpu_offload` o `enable_sequential_cpu_offload` de diffusers.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline`), Stable Diffusion WebUI (A1111/Forge), ComfyUI, InvokeAI, y exportación a ONNX/TensorRT mediante Optimum. No aplican vLLM, TGI ni llama.cpp, ya que son servidores y runtimes para modelos de lenguaje, no para difusión.
- Latencia y throughput: no disponibles en la información proporcionada. A modo de referencia de familia, los modelos SDXL suelen generar una imagen a 1024x1024 en 25-30 pasos en el orden de 1-3 segundos en una RTX 4090 y de 5-15 segundos en GPU de gama media, pero se trata de una estimación no verificada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| noobai-XL-1.1 (snuperh) | 2,57 mil millones | ~1024x1024 (832x1216 recomendado) | fair-ai-public-license-1.0-sd, sin uso comercial | HuggingFace (diffusers, safetensors) | No disponible |
| NoobAI-XL 1.0 (Laxhar) | ~2,6 mil millones (no confirmado en la información) | ~1024x1024 | fair-ai-public-license-1.0-sd | HuggingFace / Civitai | No disponible |
| Illustrious-XL (early release v0) | ~2,6 mil millones (no confirmado) | ~1024x1024 | fair-ai-public-license-1.0-sd | HuggingFace (OnomaAIResearch) | No disponible |
| SDXL 1.0 base (Stability AI) | ~2,6 mil millones | 1024x1024 | CreativeML Open RAIL++-M | HuggingFace / Stability | No disponible en esta ficha |
| Pony Diffusion V6 XL | ~2,6 mil millones (no confirmado) | 1024x1024 | Fair AI Public License 1.0-SD | HuggingFace / Civitai | No disponible |

Datos de parámetros, resolución y licencia de los modelos comparados tomados de conocimiento general de la familia SDXL; para los tres primeros no se dispone de confirmación en la información de la búsqueda. No se incluyen comparaciones de rendimiento porque no hay métricas publicadas en el material disponible.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences` y se ha entrenado con Danbooru y E621, por lo que puede generar contenido NSFW incluso sin solicitarlo explícitamente. La propia model card recomienda incluir `nsfw` en el prompt negativo si se quiere evitar.
- Sesgos de etiquetado: el entrenamiento con tags de comunidades booru hereda las convenciones, jerarquías de popularidad y sesgos de esas plataformas, incluyendo infrarrepresentación de ciertos estilos y sobreabundancia de otros.
- Alucinación y errores anatómicos: como todo modelo de difusión, puede producir manos deformes, extremidades duplicadas o incoherencias anatómicas; la model card incluye `bad hands, mutated hands` en el prompt negativo por este motivo.
- Idiomas: soporte documentado únicamente en inglés (`en`). Los tags de Danbooru y E621 están en inglés; prompts en castellano no están cubiertos ni garantizados.
- Restricción de uso comercial: la licencia fair-ai-public-license-1.0-sd prohíbe "cualquier forma de comercialización", incluyendo el modelo, los modelos derivados y los productos generados. Esto descarta casos de uso en producción con ánimo de lucro.
- Obligación de apertura: los modelos derivados, merges y LoRAs deben publicarse como open source, compartir detalles de síntesis (fórmulas, prompts, workflows) y mantener la misma licencia.
- Repositorio no oficial: la ficha analizada corresponde al usuario snuperh, no a Laxhar Lab. El modelo original y sus actualizaciones se publican en los canales del autor; conviene verificar la procedencia antes de usarlo en producción.
- Advertencia de fecha: los metadatos de HuggingFace indican creación el 2026-09-17, fecha posterior a la de la mayoría de referencias del ecosistema; se reproduce tal cual figura en la información, sin verificación adicional.
- Prompts largos y composiciones complejas: no hay información sobre la ventana de condicionamiento ni sobre degradación con prompts extensos; se recomienda seguir el formato de caption documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snuperh/noobai-XL-1.1
- Modelo base: https://huggingface.co/Laxhar/noobai-XL-1.0
- Modelo del que deriva la licencia (Illustrious-XL early release v0): https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Texto de la licencia fair-ai-public-license-1.0-sd: https://freedevproject.org/faipl-1.0-sd/
- Dataset E621 utilizado: https://huggingface.co/datasets/NebulaeWis/e621-2024-webp-4Mpixel
- ControlNet de NoobAI XL en Civitai: https://civitai.com/models/929685
- Discord del proyecto (Laxhar Dream Lab SDXL NOOB): https://discord.com/invite/DKnFjKEEvH
- Perfil del autor en HuggingFace: https://huggingface.co/LAXMAYDAY
- Herramienta de entrenamiento Naifu: https://github.com/Mikubill/naifu

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos correspondían a una agencia de viajes sin relación con el contenido de la ficha.
