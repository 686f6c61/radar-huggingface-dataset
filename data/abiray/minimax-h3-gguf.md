# Abiray/MiniMax-H3-GGUF

## Resumen

MiniMax H3 es un sistema generativo omni-modal desarrollado por MiniMax, que unifica la comprensión de texto, imágenes, vídeo y audio, y es capaz de generar vídeo con audio estéreo nativo sincronizado. Este repositorio, mantenido por Abiray, ofrece versiones cuantizadas en formato GGUF de los componentes principales del modelo (UNet, text encoder y VAE), lo que facilita su ejecución en entornos locales y su integración con herramientas como ComfyUI. El modelo destaca por admitir múltiples modos de entrada (texto, imagen, vídeo, audio) y producir clips de hasta 15 segundos a 24 FPS, con resoluciones de hasta 2K mediante un módulo adicional de regeneración.

La relevancia actual de MiniMax H3 radica en su capacidad para generar vídeo y audio sincronizados de forma conjunta, un reto técnico que tradicionalmente requería pipelines separados. Al ofrecer cuantizaciones GGUF, este repositorio democratiza el acceso a un modelo de gran tamaño, aunque sigue exigiendo hardware de gama alta para las versiones completas. No se han publicado detalles sobre la arquitectura interna (número de parámetros, tipo de transformer, etc.) en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema omni-modal con text encoder Qwen3VL 32B, VAE de vídeo y audio, y UNet en dos modos: FL2VA y Ref2VA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder Qwen3VL 32B tiene su propio contexto, pero no se especifica) |
| Tipos de cuantizacion | UNet: Q3_K_M, Q3_K_S, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0; text encoder: Q4_K_M, int4, nvfp4 |
| Idiomas soportados | 11 idiomas estables: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español; otros con soporte variable |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | GGUF (UNet y text encoder), safetensors (VAE y text encoder en int4/nvfp4) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo (tipo de transformer, número de capas, mecanismos de atención, etc.) en la información proporcionada. Se sabe que es un sistema omni-modal compuesto por varios módulos: un text encoder basado en Qwen3VL de 32B parámetros (cuantizado en este repositorio), un VAE de vídeo (5.21 GB en fp16) y un VAE de audio (605 MB en fp32), además de una UNet que opera en dos modos: FL2VA (first-and-last-frame) y Ref2VA (omni-reference). El modo FL2VA acepta cero, una o dos imágenes de entrada, mientras que Ref2VA admite hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio (con restricciones de duración y combinación). No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), imagen (image-to-video), primera y última imagen (first-and-last-frame-to-video) o combinaciones de texto e imagen.
- Generación de vídeo con audio estéreo nativo sincronizado a 32 kHz, lo que permite diálogos y efectos de sonido coherentes con la escena.
- Soporte de entradas de referencia multimodal en el modo Ref2VA: hasta 9 imágenes, 3 clips de vídeo (2-15 segundos cada uno) y 3 clips de audio (acompañados de imagen o vídeo), con un máximo de 12 archivos en total.
- Salida de vídeo de 4 a 15 segundos, a 24 FPS, con una amplia gama de relaciones de aspecto (21:9, 16:9, 4:3, 1:1, 3:4, 9:16, etc.) y resolución por defecto de 768 píxeles en el lado corto.
- Posibilidad de generar vídeo en 2K mediante el módulo H3-Regenerate-2K (no incluido en este repositorio).
- Soporte de diálogo en 11 idiomas estables (árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español), con soporte adicional variable para otros idiomas.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos de 4-15 segundos con audio sincronizado para plataformas como TikTok, Instagram Reels o YouTube Shorts, a partir de una descripción textual o una imagen de referencia.
- Prototipado de escenas para cine y animación: los directores pueden previsualizar escenas con movimiento y diálogo en varios idiomas, usando el modo FL2VA con primera y última imagen para controlar el encuadre.
- Publicidad y marketing: generar anuncios de producto con narración y efectos de sonido, partiendo de una imagen del producto y un guion en uno de los 11 idiomas soportados.
- Educación y formación: producir vídeos explicativos con voz en off sincronizada para cursos online, usando el modo Ref2VA con imágenes de referencia y audio de narración.
- Desarrollo de videojuegos: crear cinemáticas o fondos animados con audio para escenas de juego, aprovechando la generación de vídeo a partir de texto o imagen.
- Accesibilidad: generar descripciones visuales animadas con audio para personas con discapacidad visual, combinando texto descriptivo y generación de vídeo.
- Localización de contenido: doblar o generar diálogos en múltiples idiomas manteniendo la sincronización labial y el audio estéreo, gracias al soporte multilingüe del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos de generación de vídeo.

## Requisitos de hardware

- Los archivos GGUF de la UNet varían entre 15.6 GB (Q3_K_M) y 36 GB (Q8_0). El text encoder Qwen3VL 32B cuantizado ocupa entre 14.6 GB (Q4_K_M) y 27.1 GB (nvfp4). El VAE de vídeo pesa 5.21 GB y el de audio 605 MB.
- Para la versión completa con cuantización Q3_K_M, se necesitan aproximadamente 36 GB de VRAM solo para los pesos (UNet + text encoder + VAE), más overhead de inferencia, por lo que se recomienda una GPU con al menos 40 GB (por ejemplo, A100 40GB, A6000, o RTX 4090 con 24 GB no sería suficiente).
- Para la versión Q8_0, el total supera los 69 GB, requiriendo GPUs como A100 80GB, H100 80GB o configuraciones multi-GPU.
- Existe un repositorio hermano con versiones podadas (MiniMax-H3-Pruned-GGUF) que reduce el tamaño a 8.9-21.6 GB, lo que permite ejecutar el modelo en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 4070 Ti con cuantizaciones bajas.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y herramientas que soporten este formato, así como con ComfyUI (indicado en las etiquetas). También se pueden cargar los safetensors con frameworks como PyTorch.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de generación de vídeo (como Sora, Runway Gen-3, Pika, etc.) en términos de parámetros, rendimiento o licencia. La información proporcionada no incluye métricas comparativas ni especificaciones de modelos alternativos.

## Limitaciones y advertencias

- La licencia es una licencia comunitaria específica de MiniMax (MiniMax H3 Community License Agreement), que puede imponer restricciones al uso comercial. Es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- El modelo requiere hardware de gama alta para las versiones completas; las cuantizaciones bajas (Q3, Q4) pueden degradar la calidad del vídeo y el audio generado.
- No se han publicado detalles sobre sesgos del modelo, pero al ser un sistema generativo multimodal, existe riesgo de alucinaciones visuales o de audio, especialmente con entradas ambiguas o fuera de distribución.
- El soporte de idiomas es estable solo para 11 lenguas; otros idiomas pueden producir resultados de menor calidad o errores de sincronización.
- El modo Ref2VA tiene restricciones estrictas en las entradas (máximo 12 archivos, duración de clips entre 2 y 15 segundos, audio siempre acompañado de imagen o vídeo), lo que limita su uso en escenarios con requisitos diferentes.
- No se especifica la longitud de contexto del text encoder, por lo que textos muy largos podrían truncarse o degradar la calidad de la generación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Versión podada para GPUs de consumo: https://huggingface.co/Abiray/MiniMax-H3-Pruned-GGUF
