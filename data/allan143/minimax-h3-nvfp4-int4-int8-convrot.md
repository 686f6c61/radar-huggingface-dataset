# Allan143/Minimax-H3-nvfp4-INT4-INT8-Convrot

## Resumen

Este repositorio, publicado por el usuario Allan143, es una colección comunitaria de pesos cuantizados y podados del modelo MiniMax H3 (Hailuo 3.0), desarrollado originalmente por MiniMaxAI. El objetivo es facilitar la ejecución local de este sistema generativo omni-modal en entornos como ComfyUI, ofreciendo múltiples formatos de cuantización (INT4, INT8, mixto y NVFP4) adaptados a diferentes capacidades de hardware. El modelo base es un sistema que comprende texto, imágenes, vídeo y audio, y es capaz de generar vídeo con audio estéreo nativo de hasta 15 segundos de duración, con resoluciones de hasta 2K.

La relevancia de esta colección radica en que democratiza el acceso a un modelo de generación de vídeo de última generación, que de otro modo requeriría infraestructura de servidor, permitiendo su uso en GPUs de consumo (16-24 GB de VRAM). El repositorio unifica nomenclaturas y estructura los ficheros necesarios (modelo de difusión, text encoder y VAEs) para una integración sencilla en pipelines locales. El tamaño total del repositorio es de 128,2 GB, e incluye variantes para el modo de primer y último fotograma (FL2VA) y para el modo de referencia omni (Ref2VA).

No se dispone de información detallada sobre la arquitectura interna del modelo de difusión, aunque se sabe que utiliza un text encoder Qwen3VL-32B cuantizado. La licencia es la "Minimax H3 Community License Agreement", que debe revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (arquitectura interna no especificada; text encoder Qwen3VL-32B) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 15 segundos de video a 24 FPS (360 fotogramas) |
| Tipos de cuantizacion | INT4, INT8, MIXED (INT4/INT8), NVFP4 (solo Blackwell) |
| Idiomas soportados | 11 idiomas segun el modelo base: arabe, chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso, español. El tag del repo indica 'th' (tailandes), aunque no se detalla en la documentacion |
| Licencia | Minimax H3 Community License Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo de difusion (si es transformer, basado en atencion, etc.) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO). El repositorio se presenta como una coleccion de pesos cuantizados y podados del modelo MiniMax H3, un sistema generativo omni-modal que unifica comprension y generacion de texto, imagen, video y audio.

La coleccion incluye tres componentes principales: un modelo de difusion (con variantes FL2VA y Ref2VA), un text encoder basado en Qwen3VL-32B (disponible en cuantizaciones INT4, INT8 y NVFP4) y dos VAEs (uno para audio y otro para video). Se menciona la tecnica "convrot" en los nombres de los ficheros, aunque no se explica su significado. La poda (pruning) y la cuantizacion buscan reducir el peso del modelo para su ejecucion en hardware de consumo, con una perdida de calidad que se indica como menor en las versiones INT8.

## Capacidades

- Generacion de video a partir de texto (text-to-video) cuando no se proporcionan imagenes de entrada.
- Generacion de video a partir de una o dos imagenes (image-to-video): primer fotograma, ultimo fotograma o ambos (modo FL2VA).
- Generacion de video con referencias omni (modo Ref2VA): hasta 9 imagenes, hasta 3 clips de video (cada uno de 2-15 segundos, duracion total no especificada) y entradas de audio.
- Generacion de video con audio nativo: salida de audio estéreo a 32 kHz.
- Resoluciones variables con lado corto de 768 pixeles por defecto; se puede alcanzar 2K mediante el modelo H3-Regenerate-2K (no incluido en este repositorio).
- Duracion de salida de 4 a 15 segundos a 24 FPS.
- Relaciones de aspecto amplias: 21:9, 16:9, 4:3, 1:1, 3:4 y 9:16.
- Comprension multimodal de contexto (texto, imagenes, video y audio) heredada del modelo base, lo que permite seguir instrucciones complejas.
- Soporte estable de dialogo en 11 idiomas (segun el modelo base).

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos de 4-15 segundos con audio nativo para plataformas como TikTok, Instagram Reels o YouTube Shorts, usando prompts de texto y opcionalmente una imagen de referencia para mantener la coherencia visual.
- Prototipado rapido en produccion audiovisual: los equipos de marketing pueden generar storyboards animados a partir de guiones de texto, evaluando encuadres, ritmo y atmosfera antes de la produccion final.
- Generacion de video educativo: producir animaciones explicativas breves con locucion sintetizada en varios idiomas, aprovechando la capacidad de generar audio sincronizado.
- Personalizacion de video con referencias de personaje: usando el modo Ref2VA, se pueden proporcionar varias imagenes de un personaje o producto para generar videos que mantengan su apariencia consistente, util para anuncios o demos.
- Asistencia a disenadores de juegos: generar cinemáticas cortas o fondos animados a partir de descripciones textuales, integrando el modelo en flujos de trabajo de ComfyUI para iteracion rapida.
- Creacion de video multilingue para localizacion: dado que el modelo base soporta 11 idiomas, se pueden generar videos con narracion en diferentes lenguas a partir del mismo prompt, facilitando la adaptacion de contenido a mercados internacionales.
- Generacion de video con audio ambiental: producir clips con sonido sincronizado (por ejemplo, efectos de lluvia o pasos) a partir de prompts descriptivos, sin necesidad de postproduccion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas comparativas (como FVD, CLIP score, etc.) ni comparaciones con otros modelos de generacion de video.

## Requisitos de hardware

- Para GPUs con 16 GB de VRAM (RTX 4070 Ti Super, RTX 4080): se recomienda el modelo de difusion en INT4 (aproximadamente 11,3 GB) o MIXED INT4/INT8 (aproximadamente 15,5 GB), junto con el text encoder Qwen3VL-32B en INT4 (15,0 GB). Se debe tener en cuenta que la suma supera los 16 GB, por lo que se requiere gestion de memoria (offloading) o cargar componentes de forma secuencial.
- Para GPUs con 24 GB de VRAM (RTX 3090, RTX 4090): se recomienda el modelo de difusion en INT8 (aproximadamente 21 GB) y el text encoder en INT8 (27,1 GB). De nuevo, la suma excede la VRAM, por lo que se necesita offloading o cuantizacion adicional.
- Para GPUs NVIDIA Blackwell (RTX 5090, PRO 6000): se ofrecen versiones NVFP4 del modelo de difusion (12,5 GB para la version podada) y del text encoder (15,7 GB). Estas versiones no son compatibles con GPUs de las series 30 o 40.
- Los VAEs son obligatorios en todos los casos: el VAE de audio (605 MB) y el VAE de video (5,21 GB).
- El despliegue esta orientado a ComfyUI, aunque el repositorio usa la libreria diffusers, por lo que tambien puede integrarse en pipelines de Python con esa libreria.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de generacion de video (por ejemplo, Stable Video Diffusion, Runway Gen-3, etc.).

## Limitaciones y advertencias

- La licencia "Minimax H3 Community License Agreement" puede imponer restricciones al uso comercial. Es imprescindible revisar el texto completo de la licencia antes de utilizar el modelo en entornos de produccion.
- Los pesos cuantizados y podados pueden presentar una degradacion de calidad respecto al modelo original en cuanto a fidelidad visual, coherencia temporal y calidad de audio, especialmente en las versiones INT4 y NVFP4.
- La version NVFP4 solo funciona en GPUs NVIDIA Blackwell; descargarla para hardware de generaciones anteriores provocara errores de compatibilidad.
- El text encoder Qwen3VL-32B es un componente de gran tamano (15-27 GB segun cuantizacion) que puede requerir estrategias de carga parcial o offloading incluso en GPUs de 24 GB.
- No se ha documentado el comportamiento del modelo ante entradas ambiguas o prompts complejos; puede generar videos con inconsistencias visuales o alucinaciones (objetos o acciones no solicitadas).
- El tag de idioma del repositorio indica 'th' (tailandes), pero la documentacion del modelo base menciona 11 idiomas sin incluir tailandes. Esta discrepancia debe tenerse en cuenta al evaluar la cobertura linguistica real.
- No se incluye el modelo H3-Regenerate-2K, necesario para generar videos a resolucion 2K; sin el, la salida se limita a 768 pixeles en el lado corto.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Allan143/Minimax-H3-nvfp4-INT4-INT8-Convrot
- Repositorio original del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio similar (mismo contenido): https://huggingface.co/Abiray/Minimax-H3-nvfp4-INT4-INT8-Convrot
- GitHub oficial de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Tutorial sobre MiniMax H3 y sus variantes cuantizadas: https://www.stablediffusiontutorials.com/2026/08/minimax-h3.html
