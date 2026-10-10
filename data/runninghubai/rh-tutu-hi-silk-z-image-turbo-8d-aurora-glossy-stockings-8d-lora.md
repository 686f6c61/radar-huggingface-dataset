# RunningHubAI/rh-tutu-hi-silk-z-image-turbo-8d-aurora-glossy-stockings-8d-lora

## Resumen

rh-tutu-hi-silk-z-image-turbo-8d-aurora-glossy-stockings-8d-lora es un adaptador LoRA de generación de imagen (text-to-image) publicado por RunningHubAI en nombre del autor, bajo el flujo de trabajo Tutu AI (Tutu Trainer + Tutu Annotator). No es un modelo completo: es un ajuste fino ligero pensado para cargarse sobre el modelo base Z-Image-Turbo / ZImageTurbo y modificar la estética de las prendas generadas, en concreto el acabado de medias negras por encima de la rodilla con efecto brillante tipo "aurora 8D".

El adaptador resuelve un problema muy concreto de control estético: conseguir una textura de tejido brillante, negra y consistente en generaciones de moda o personajes, algo que los prompts de texto rara vez reproducen de forma estable en modelos de difusión genéricos. Se distribuye como un único archivo safetensors de 162 MiB (repo de 0,2 GB) y se integra mediante un cargador LoRA estándar en ComfyUI, además de poder ejecutarse en la plataforma RunningHub. La palabra de activación es `tutujiguanghaisiv1` y el peso recomendado por el autor es de aproximadamente 0,7.

Su relevancia es limitada y hay que enmarcarla con honestidad: el repositorio no tiene descargas ni likes, no declara licencia, no publica idiomas soportados ni resultados de benchmarks, y la ficha no documenta la arquitectura ni el tamaño del modelo base. Es, por tanto, un artefacto experimental de nicho dentro del ecosistema Z-Image-Turbo, útil para quien ya trabaje con ese modelo base y necesite un estilo textil muy específico, pero sin garantías de soporte, licencia o rendimiento verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión text-to-image; arquitectura del modelo base no documentada en la ficha |
| Parámetros totales | no disponible (adaptador LoRA; el único dato de tamaño es el peso del archivo: 162 MiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución y límites de tokens de prompt no disponibles |
| Tipos de cuantización | no disponible; se distribuye un único archivo safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible; los ejemplos y frases de prompt de la ficha están en inglés y la documentación adicional en chino |
| Licencia | no disponible; la ficha indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream, sin especificarla |
| Formato de pesos | safetensors (`Tutu's half-leg aurora black stockings_Zimg_V1.safetensors`, 162 MiB) |
| Modelo base | Z-Image-Turbo / ZImageTurbo |
| Palabra de activación | `tutujiguanghaisiv1` |
| Peso LoRA recomendado | ~0,7 |
| Cargador | LoRA Loader estándar (ComfyUI) |
| Repositorio | 0,2 GB; 0 descargas; 0 likes |
| Fecha indicada de creación / actualización | 2026-10-10 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un LoRA de tipo text-to-image entrenado con Tutu Trainer sobre el modelo base Z-Image-Turbo. El adaptador se carga con un cargador LoRA convencional, lo que implica que actúa sobre las capas del modelo de difusión subyacente sin modificarlo de forma permanente; la ficha no especifica sobre qué bloques concretos (atención, proyecciones, etc.) se aplica el rango, ni el valor de rango/alpha utilizado, ni el número de pasos de entrenamiento o de imágenes del dataset.

Respecto a los datos, la ficha indica que la selección de material fuente fue cuidada y que el dataset se etiquetó con Tutu Annotator empleando los modelos "Banana 2 / Banana Pro", se filtró con el sistema de filtrado inteligente de sujeto de Tutu y se entrenó con Tutu Trainer. No se indica el volumen del dataset, la resolución de entrenamiento, la composición exacta ni si hubo etapas de refuerzo por preferencias humanas (RLHF/DPO), algo poco habitual en adaptadores LoRA de difusión. Tampoco se documentan innovaciones técnicas propias más allá del flujo de anotación y filtrado de etiquetas.

## Capacidades

- Generación de imagen text-to-image condicionada por prompt, siempre que se cargue junto al modelo base Z-Image-Turbo.
- Modificación de estilo y textura: introduce el acabado "8D" negro brillante tipo aurora en medias por encima de la rodilla y thighhighs.
- Activación por palabra clave: `tutujiguanghaisiv1`, con efecto reforzado si se incluye en el prompt.
- Compatibilidad con frases de prompt específicas: black over-knee stockings, black thighhigh stockings, glossy black stockings, shiny black stockings, aurora glossy stockings.
- Integración con flujos de ComfyUI mediante LoRA Loader estándar; también ejecutable en la plataforma RunningHub.
- Ajuste de intensidad mediante peso LoRA (el autor recomienda empezar en ~0,7).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking"; son capacidades no aplicables a un adaptador de generación de imagen.

## Casos de uso

- Comercio electrónico de moda: generar variantes de catálogo de medias negras brillantes sobre un mismo producto base, manteniendo una textura coherente entre imágenes y reduciendo la necesidad de sesiones fotográficas adicionales.
- Diseño de personajes para ilustración y cómic: fijar el aspecto de las medias de un personaje (brillo, opacidad, altura por encima de la rodilla) con un peso LoRA constante para que la continuidad visual se mantenga entre viñetas.
- Concept art para videojuegos: previsualizar vestuario de estilo urbano o gótico con un acabado textil concreto antes de modelarlo en 3D.
- Marketing y contenido para redes sociales: producir imágenes de producto o editoriales con un estilo de iluminación textil determinado, partiendo de un prompt corto y una palabra de activación.
- Aumento de datos para entrenamiento: generar un conjunto de imágenes con esa estética concreta para alimentar clasificadores de moda o sistemas de etiquetado automático.
- Pruebas de estilo comparativas en investigación: usar el adaptador como caso de estudio de LoRA muy especializado (un único concepto visual) frente a LoRA de estilo amplio, midiendo cómo el peso 0,7 afecta al realismo de la prenda.
- Prototipado rápido en ComfyUI: encadenar este LoRA con otros adaptadores y nodos de posprocesado para explorar variaciones de un mismo look sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye métricas objetivas (FID, CLIP score, similitud de prompt) ni comparaciones cuantitativas con otros adaptadores. La búsqueda web asociada no devolvió resultados relevantes: los enlaces encontrados corresponden a foros de Aternos sobre servidores de Minecraft y no guardan ninguna relación con este modelo.

## Requisitos de hardware

- VRAM del adaptador: el archivo LoRA ocupa 162 MiB, por lo que su huella adicional en memoria es marginal respecto al modelo base.
- VRAM total: no disponible en la ficha, ya que depende por completo de Z-Image-Turbo, cuyas especificaciones no se documentan aquí. Como referencia orientativa no confirmada, los modelos de difusión de tipo transformer de varios miles de millones de parámetros suelen requerir del orden de 12 a 20 GB en fp16 sin optimizaciones.
- GPU recomendadas: no disponible. Con las cifras orientativas anteriores, una RTX 4090 (24 GB) sería suficiente para inferencia en fp16, mientras que tarjetas de 8 a 12 GB probablemente necesiten cuantización, offloading o carga secuencial.
- Cabe en GPU de consumo: no confirmado para el modelo base; el adaptador en sí no supone una limitación de memoria.
- Opciones de despliegue: ComfyUI con LoRA Loader estándar; plataforma RunningHub (incluye API); integración vía diffusers/PEFT si el modelo base es compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos comparativos en la información disponible. El repositorio no publica métricas ni referencia a otros adaptadores, y la ficha no permite verificar rendimiento frente a alternativas.

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|---|
| rh-tutu-hi-silk-z-image-turbo-8d-aurora-glossy-stockings-8d-lora | LoRA text-to-image sobre Z-Image-Turbo | no disponible (peso 162 MiB) | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) y RunningHub | sin benchmarks publicados |
| Otros LoRA para Z-Image-Turbo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| LoRA equivalentes para otros backbones (Flux, SDXL) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin Z-Image-Turbo cargado no genera nada, y su comportamiento depende por completo de la versión del modelo base.
- Licencia no declarada: la ficha remite a la licencia del proyecto original o del upstream sin nombrarla. El uso comercial es incierto y debería aclararse con el autor antes de integrarlo en producción.
- Modelo experimental: el propio autor indica que el efecto "aún tiene margen de mejora" y que se trata de una versión temprana de su dirección Hi-Silk.
- Riesgo de sobreajuste al concepto: al ser un LoRA de un único sujeto, pesos altos pueden degradar la anatomía, la composición o la coherencia general de la imagen; de ahí la recomendación de mantenerse en torno a 0,7.
- Dependencia de la palabra de activación y de vocabulario de prompt concreto en inglés; no hay evidencia de que funcione igual con prompts en otros idiomas.
- Sesgos: no hay documentación sobre la diversidad del dataset, por lo que no puede descartarse un sesgo hacia un tipo de cuerpo, tono de piel o encuadre concreto. Tampoco se especifica si el dataset incluía personas reales ni qué consentimiento existe sobre las imágenes fuente.
- Riesgo de alucinación visual: inherente a los modelos de difusión; pueden aparecer artefactos en manos, pliegues del tejido o proporciones, especialmente con pesos LoRA elevados.
- Contenido sensible: la temática (prendas ajustadas y estética de medias) puede activar políticas de moderación en plataformas de despliegue o en la propia API de RunningHub; conviene revisar los términos de uso antes de publicar.
- Sin métricas ni validación de terceros: no hay benchmarks, descargas ni evaluaciones independientes que respalden la calidad del adaptador.
- Metadatos incompletos: no se declaran idiomas, arquitectura del base, cuantizaciones ni número de parámetros, lo que dificulta planificar su integración.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-tutu-hi-silk-z-image-turbo-8d-aurora-glossy-stockings-8d-lora
- Versión original en RunningHub: https://www.runninghub.ai/model/public/1994742919422746626
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/1936823199386537986
- Flujo de trabajo Z-Image en RunningHub: https://www.runninghub.ai/user-center/1936823199386537986/webapp/?inviteCode=rh-v0990
- API de RunningHub: https://www.runninghub.ai/call-api
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Sitio oficial del autor: https://zhaotutu.xyz/
- Tutu Trainer: https://zhaotutu.xyz/downloads/tututrainer/
- Tutu Annotator: https://zhaotutu.xyz/downloads/tutuannotator/
- GitHub del autor: https://github.com/zhaotututu
- Bilibili: https://space.bilibili.com/431046154
- YouTube: https://www.youtube.com/@zhaotutu/videos
- Telegram: https://t.me/zhaotutu
- TikTok: https://www.tiktok.com/@zhaotututu
- Reddit: https://www.reddit.com/user/zhaotututu/
