# linyu01/nova-furry-xl-il-v120-sdxl

## Resumen

Nova Furry XL IL v1.20 es un modelo de generación de imágenes basado en Stable Diffusion XL, desarrollado por el usuario linyu01 a partir de un merge de dos modelos de la comunidad: Illustrious XL v2.0 y noobai-XL-1.1. El modelo original fue creado por Crody y publicado en Civitai; esta versión en HuggingFace es un reempaquetado en formato diffusers. Está especializado en la generación de contenido furry y anthro, incluyendo estilos 2D, 2.5D y 3D, con soporte para etiquetas de e621/rule34.

El modelo resuelve el problema de generar ilustraciones de personajes antropomórficos y animales con un alto nivel de detalle y control mediante prompts, aprovechando la arquitectura SDXL de 2.567 millones de parámetros. Su relevancia radica en que combina las capacidades de dos modelos base populares en la comunidad, ofreciendo un punto de partida para artistas e ilustradores que trabajan con temática furry. La licencia es faipl-1.0-sd, que permite uso comercial bajo ciertas condiciones, y el contenido generado no es apto para todos los públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + VAE + CLIP text encoder) |
| Parametros totales | 2.567.463.684 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (prompt de texto, sin longitud especificada) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | faipl-1.0-sd |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo es un merge de dos modelos base de Stable Diffusion XL: Illustrious-XL-v2.0 y noobai-XL-1.1. No se ha realizado un entrenamiento desde cero, sino una combinación de pesos entre ambos, lo que permite heredar las capacidades de cada uno. Illustrious XL v2.0 es conocido por su calidad en ilustración anime y manejo de etiquetas detalladas, mientras que noobai-XL-1.1 aporta robustez en estilos variados y corrección anatómica. El merge se ha optimizado para contenido furry, con especial atención a la representación de personajes anthro, feral y animales.

No se dispone de información sobre el dataset de entrenamiento, número de tokens procesados, ni técnicas de alineación como RLHF o DPO. Al ser un modelo de difusión, el proceso de generación es iterativo: parte de ruido gaussiano y refina la imagen a lo largo de pasos de denoising, guiado por el texto del prompt y los CLIP text encoders de SDXL.

## Capacidades

- Generación de imágenes a partir de prompts en inglés, con soporte para etiquetas de e621/rule34 (p. ej., `anthro`, `feral`, `detailed fur`, `dynamic pose`).
- Estilos artísticos variados: 2D, 2.5D y 3D, con control sobre el nivel de detalle del pelaje, iluminación y composición.
- Especialización en personajes furry: antropomórficos, animales realistas y criaturas híbridas.
- Generación de contenido NSFW explícito (etiquetado como `not-for-all-audiences`), incluyendo temática yiff y hentai.
- Control fino mediante prompts largos y específicos gracias a la arquitectura SDXL, que soporta dos text encoders (OpenCLIP ViT-bigG y CLIP ViT-L).
- Compatible con el pipeline `StableDiffusionXLPipeline` de la librería diffusers, lo que permite integración con herramientas como ComfyUI o Automatic1111.

## Casos de uso

- Ilustración de personajes para cómics y novelas gráficas: el modelo permite generar bocetos y renders finales de personajes anthro con poses y expresiones detalladas, reduciendo el tiempo de producción artística.
- Concept art para videojuegos: los estudios independientes pueden usar el modelo para explorar diseños de criaturas y razas antropomórficas en fases tempranas de desarrollo, iterando rápidamente sobre variaciones de color, vestimenta y anatomía.
- Creación de avatares y emojis personalizados: gracias al control por etiquetas, se pueden generar avatares en estilos 2D o 3D para plataformas de streaming, redes sociales o juegos de rol.
- Generación de fondos y entornos con fauna antropomórfica: el modelo puede producir escenas completas con múltiples personajes, útil para ilustradores de libros infantiles o material educativo (siempre que se respete la licencia).
- Prototipado de mercancía y diseño de productos: diseñadores pueden generar mockups de camisetas, tazas o pósters con personajes furry para evaluar conceptos antes de la producción.
- Investigación en generación de imágenes con estilos específicos: el modelo sirve como referencia para estudiar cómo los merges de SDXL afectan la distribución de estilos y la adherencia a etiquetas, útil para investigadores en IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un merge de modelos existentes, su rendimiento cualitativo se puede inferir de los modelos base, pero no hay métricas objetivas (FID, CLIP score, etc.) proporcionadas por el autor.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo específico.
- Al estar basado en SDXL, se estima que la inferencia requiere al menos 8 GB de VRAM para generar imágenes a 1024x1024 en precisión completa, y alrededor de 6 GB con cuantización (p. ej., fp16). Estas cifras son orientativas y provienen de la documentación general de SDXL, no del autor.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superior para un uso cómodo; RTX 4090 o A100 para generación por lotes.
- Es posible ejecutarlo en GPU de consumo con al menos 8 GB de VRAM, aunque con limitaciones de resolución o tamaño de lote.
- Opciones de despliegue: diffusers (Python), ComfyUI, Automatic1111 WebUI, y servicios en la nube como Replicate o RunPod. No se menciona compatibilidad con vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y de los pasos de inferencia (típicamente 20-50 pasos en SDXL).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos. Como referencia cualitativa, se puede comparar con sus modelos base:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Nova Furry XL IL v1.20 (este) | 2.567 M | No aplica | Sin benchmarks | faipl-1.0-sd |
| Illustrious-XL-v2.0 | ~2.6 B (SDXL) | No aplica | Sin datos | No especificada (probablemente open) |
| noobai-XL-1.1 | ~2.6 B (SDXL) | No aplica | Sin datos | No especificada |

La comparativa se limita a características estructurales; no hay métricas objetivas para contrastar. El modelo se posiciona como una opción especializada en furry frente a los modelos base más generales en anime o estilos variados.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW (yiff, hentai). No es apto para menores ni para entornos laborales sin control parental.
- Licencia faipl-1.0-sd: permite uso comercial, pero exige atribución al autor original y puede tener cláusulas adicionales. Es recomendable revisar el texto completo de la licencia antes de usar el modelo en productos comerciales.
- Sesgos y alucinaciones: como todo modelo de difusión, puede producir artefactos en extremidades, ojos o patrones de pelaje, especialmente en composiciones complejas. También puede reflejar sesgos presentes en los datos de entrenamiento de los modelos base.
- Idioma: el modelo solo soporta prompts en inglés. El uso de otros idiomas puede degradar la calidad de la generación.
- Sin actualizaciones ni soporte: el repositorio en HuggingFace no muestra actividad desde su creación (agosto de 2026) y no hay documentación adicional más allá de la model card.
- Dependencia de los modelos base: al ser un merge, cualquier limitación de Illustrious XL v2.0 o noobai-XL-1.1 se hereda, como posibles problemas de coherencia en escenas con múltiples personajes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/linyu01/nova-furry-xl-il-v120-sdxl
- Modelo original en Civitai: https://civitai.com/models/503815/nova-furry-xl?modelVersionId=2268972
- Autor original (Crody): https://civitai.com/user/Crody
- Licencia faipl-1.0-sd: https://freedevproject.org/faipl-1.0-sd/
