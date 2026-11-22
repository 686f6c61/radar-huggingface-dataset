# Marclebo/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omnicanal desarrollado por MiniMax (publicado en Hugging Face bajo el perfil Marclebo) que unifica la comprensión y generación de contextos multimodales compuestos por texto, imagen, vídeo y audio. A diferencia de los modelos de difusión para vídeo convencionales, H3 genera vídeo con audio estéreo nativo sincronizado, con resoluciones de hasta 2K y duraciones de 4 a 15 segundos, lo que lo sitúa en la categoría de modelos de generación audio-vídeo conjunta.

El sistema se compone de tres módulos: H3-Context-IR (interpretación y refinado de instrucciones multimodales), H3-Base (generación de audio y vídeo a 768p) y H3-Regenerate-2K (reascalado a 2K reutilizando el contexto original). El repositorio ocupa 353,9 GB y se distribuye con la licencia comunitaria MiniMax-H3 y la librería propia `minimax-h3`, con soporte declarado de `diffusers`.

Su relevancia actual radica en la generalización de tareas desde la fase de preentrenamiento: el modelo maneja instrucciones multimodales complejas y variantes como first-and-last-frame (FL2VA) y omni-reference (Ref2VA), que aceptan hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio como referencia combinada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema generativo omnicanal de difusion (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (contexto multimodal: hasta 12 ficheros de entrada entre imagenes, video y audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sv, en, fr, de, es, nl (metadatos); dialogo estable en 11 idiomas: arabe, chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

Especificaciones de salida:

| Parametro | Valor |
|---|---|
| Duracion de salida | 4-15 segundos |
| Resolucion de salida | 768p por defecto (lado corto); 2K con H3-Regenerate-2K |
| Relacion de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras |
| Frecuencia de fotogramas | 24 FPS |
| Audio de salida | estereo a 32 kHz |

## Arquitectura y entrenamiento

La informacion disponible describe H3 como un sistema generativo omnicanal de proposito general, disenado con orientacion a la generalizacion de tareas desde la fase de preentrenamiento. Esto implica que el modelo no se entrena exclusivamente para una tarea (texto-a-video, por ejemplo), sino que adquiere capacidades amplias de comprension y generacion multimodal antes de especializarse, lo que le permite seguir instrucciones multimodales complejas.

El sistema se organiza en tres modulos encadenados. H3-Context-IR convierte las instrucciones multimodales de entrada en una Representacion Intermedia de Contexto que H3 puede interpretar con facilidad; la documentacion insiste en que este modulo es critico para la calidad final y recomienda integrarlo en el pipeline o replicarlo siguiendo la guia de prompting. H3-Base genera audio y video a 768p a partir de esa representacion intermedia. H3-Regenerate-2K reinyecta el resultado de 768p junto con el contexto original en H3 para regenerar la salida a 2K, aprovechando tanto la capacidad generativa como la informacion del contexto. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Variantes de entrada:

| Variante | Modo de entrada | Especificaciones |
|---|---|---|
| H3-Base-FL2VA | Primer y ultimo fotograma | 0 imagenes: texto-a-video; 1 imagen: primer o ultimo fotograma; 2 imagenes: primer y ultimo fotograma |
| H3-Base-Ref2VA | Referencia omnicanal | Hasta 9 imagenes, 3 clips de video (2-15 s cada uno, total <= 15 s), 3 clips de audio (2-15 s cada uno, total <= 15 s); maximo 12 ficheros combinados |

## Capacidades

- Generacion de video a partir de texto, imagen, video y audio, en combinaciones multiples (text-to-video, image-to-video, image-text-to-video, video-to-video, text-to-audio-video, image-to-audio-video, image-text-to-audio-video, video-to-audio-video, audio-to-audio-video, audio-to-audio-video).
- Generacion de audio estereo nativo sincronizado con el video a 32 kHz.
- Generacion de dialogo hablado en 11 idiomas con soporte estable: arabe, chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol.
- Comprension unificada de contextos multimodales compuestos por texto, imagen, video y audio.
- Modo de primer y ultimo fotograma (FL2VA) para interpolacion y control temporal.
- Modo de referencia omnicanal (Ref2VA) con hasta 12 ficheros de entrada combinados para condicionar la generacion.
- Generacion a 2K mediante el modulo H3-Regenerate-2K.
- Soporte de relaciones de aspecto amplias (21:9, 16:9, 4:3, 1:1, 3:4, 9:16).
- No se documenta soporte de tool calling ni de razonamiento multi-paso agentico; no disponible.

## Casos de uso

- Produccion de video publicitario con audio nativo: el modelo genera clips de 4 a 15 segundos a 24 FPS con audio estereo sincronizado en una sola pasada, lo que elimina la necesidad de doblar o sincronizar pistas de audio en postproduccion para piezas cortas.
- Doblaje y localizacion multilingue: gracias al soporte estable de dialogo en 11 idiomas, se puede generar la misma escena con locucion en espanol, ingles, frances o aleman, manteniendo coherencia visual y sincronia labial mediante el modo de referencia.
- Interpolacion de primer y ultimo fotograma para animacion: el modo FL2VA permite generar el movimiento intermedio entre dos imagenes clave, util en storyboarding animado y en la creacion de transiciones controladas.
- Creacion de contenido para redes sociales en formato vertical: la relacion de aspecto 9:16 y la duracion de 4-15 segundos encajan con formatos de reels y shorts, generando video y audio listos para publicacion.
- Prototipado de escenas con referencias visuales y sonoras: el modo Ref2VA acepta hasta 9 imagenes, 3 clips de video y 3 clips de audio, lo que permite condicionar la generacion con un moodboard completo y una banda sonora de referencia.
- Generacion de video a partir de audio: el pipeline audio-to-audio-video permite crear visuales sincronizados con una pista musical o locucion existente, util para videoclips y visualizers.
- Reconstruccion o reescalado a 2K de material generado: H3-Regenerate-2K reinyecta el contexto original para producir versiones de alta resolucion de clips ya generados a 768p, adecuado para masterizado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 353,9 GB, lo que sugiere pesos de gran tamano que probablemente requieran multiples GPU para ejecucion local; no se detalla la descomposicion por modulo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen del repositorio y la generacion a 2K con audio, es razonable esperar requisitos de GPU de datacenter (A100, H100 o superiores), pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card menciona la libreria `minimax-h3` y la etiqueta `diffusers`; tambien ofrece API oficial (platform.minimax.io y platform.minimaxi.com) y aplicacion web/escritorio (Hailuo AI, hub.minimax.io). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Duracion de salida | Resolucion | Audio nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax H3 | Generacion audio-video omnicanal | 4-15 s | 768p / 2K | Si, estereo 32 kHz | Comunitaria MiniMax-H3 | Hugging Face, API, app |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de modelos comparables (parametros, contexto o rendimiento) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo.
- Riesgo de alucinacion y de artefactos visuales o de sincronizacion audio-video en escenas complejas: no cuantificado en la informacion disponible.
- La calidad de salida depende criticamente de H3-Context-IR; la propia documentacion advierte que omitir este modulo o no seguir la guia de prompting degrada el resultado.
- Duracion maxima de 15 segundos por generacion, lo que limita su uso para piezas de formato largo sin concatenacion.
- La resolucion 2K requiere una pasada adicional de regeneracion (H3-Regenerate-2K), con el coste computacional asociado.
- La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estandar; es imprescindible revisar sus terminos antes de un uso comercial.
- El repositorio pesa 353,9 GB, lo que dificulta el despliegue local y el almacenamiento.
- Los metadatos de idioma de Hugging Face solo listan sv, en, fr, de, es y nl, mientras que la model card declara 11 idiomas de dialogo estables; existe una discrepancia entre ambos conjuntos que conviene verificar.
- No se documentan garantias de seguridad, filtros de contenido ni evaluaciones de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/Marclebo/MiniMax-H3
- Hugging Face oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Skills de prompting: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- Lista comunitaria H3: https://minimaxai-ecosystem.static.hf.space/index.html#/video
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- WebApp global: https://hailuoai.video/tools/minimax-h3
- WebApp China: https://hailuoai.com/
- Escritorio global: https://hub.minimax.io/
- Escritorio China: https://hub.minimaxi.com/
- Web oficial: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
