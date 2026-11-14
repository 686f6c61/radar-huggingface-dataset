# donx10th/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omni-modal desarrollado por MiniMax (empresa china responsable también de los modelos de lenguaje de la familia MiniMax y de la plataforma Hailuo AI). A diferencia de los modelos de lenguaje convencionales, H3 está orientado a la generación de vídeo con audio nativo sincronizado: recibe contextos multimodales compuestos por texto, imágenes, vídeo y audio, y produce clips de vídeo con audio estéreo incorporado. El repositorio analizado (`donx10th/MiniMax-H3`) es una réplica no oficial del modelo publicado por MiniMaxAI, con 353,9 GB de pesos en formato safetensors y librería propia (`minimax-h3`).

El sistema se compone de tres módulos encadenados: H3-Context-IR (interpretación y refinado de instrucciones multimodales en una representación intermedia), H3-Base (generación de vídeo y audio a 768p) y H3-Regenerate-2K (segunda pasada que reinyecta el contexto original para producir salida a 2K). Esta arquitectura en cascada condiciona tanto la calidad final como los requisitos de hardware, ya que implica ejecutar varios modelos en pipeline.

La relevancia actual del modelo radica en su enfoque de "task-generalization": en lugar de entrenar tareas separadas (texto-a-vídeo, imagen-a-vídeo, referencia-a-vídeo), H3 se entrena desde preentrenamiento con contextos multimodales unificados, lo que le permite seguir instrucciones complejas que combinan varias modalidades de entrada. La model card no documenta parámetros, arquitectura interna detallada ni datos de entrenamiento, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sistema omni-modal en cascada con tres módulos: H3-Context-IR, H3-Base y H3-Regenerate-2K) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible (contexto multimodal: hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio, máximo 12 ficheros) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, FP8 ni INT4) |
| Idiomas soportados | Sue, inglés, francés, alemán, español y neerlandés (etiquetas del repo); diálogo estable en 11 idiomas según la model card: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español |
| Licencia | MiniMax-H3 Community License Agreement (`license: other`) |
| Formato de pesos | Safetensors (tamaño del repo: 353,9 GB) |

Especificaciones de salida documentadas en la model card:

| Parametro de salida | Valor |
|---|---|
| Duración del vídeo | 4–15 segundos |
| Resolución | 768p por defecto (lado corto a 768 px); 2K mediante H3-Regenerate-2K |
| Relación de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras |
| Frecuencia de fotogramas | 24 FPS |
| Audio | Estéreo a 32 kHz, generado de forma nativa y sincronizada |

## Arquitectura y entrenamiento

La model card describe H3 como un "sistema generativo omni-modal de propósito general" con comprensión unificada de contextos compuestos por texto, imagen, vídeo y audio. No se especifica el tipo de backbone (transformer, difusión, híbrido, etc.), aunque la presencia de la etiqueta `diffusers` y la librería `minimax-h3` sugieren un pipeline de difusión adaptado. La innovación declarada es el diseño orientado a la generalización de tareas: el modelo adquiere capacidades amplias de comprensión y generación multimodal ya en la fase de preentrenamiento, lo que le permite seguir instrucciones complejas que mezclan modalidades sin fine-tuning específico por tarea.

El sistema se organiza en tres etapas. H3-Context-IR transforma la instrucción multimodal cruda en una "representación intermedia de contexto" que H3-Base puede interpretar; la model card insiste en que este módulo es crítico para la calidad del resultado y recomienda integrarlo en el pipeline o replicarlo siguiendo la guía de prompting. H3-Base genera vídeo y audio a 768p a partir de esa representación. H3-Regenerate-2K reinyecta el resultado de 768p junto con el contexto original para regenerar a 2K, aprovechando tanto la capacidad generativa como la información del contexto. No se documentan número de tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO.

Variantes de entrada documentadas:

| Variante | Modo de entrada | Especificaciones |
|---|---|---|
| H3-Base-FL2VA | Primer y último fotograma | 0 imágenes: texto-a-vídeo; 1 imagen: primer o último fotograma; 2 imágenes: primer y último fotograma |
| H3-Base-Ref2VA | Referencia omni-modal | Hasta 9 imágenes; hasta 3 clips de vídeo de 2–15 s (total ≤ 15 s); hasta 3 clips de audio de 2–15 s (total ≤ 15 s); máximo 12 ficheros combinados |

## Capacidades

- Generación de vídeo a partir de texto, imagen, vídeo o combinaciones (text-to-video, image-to-video, image-text-to-video, video-to-video).
- Generación de audio nativo sincronizado con el vídeo (text-to-audio-video, image-to-audio-video, video-to-audio-video, audio-to-audio-video).
- Modo de primer y último fotograma para control preciso de la transición entre dos imágenes.
- Modo de referencia omni-modal: hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio como referencias simultáneas.
- Diálogo hablado en 11 idiomas estables (árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español), con soporte parcial de otros idiomas.
- Salida con relaciones de aspecto variadas (21:9, 16:9, 4:3, 1:1, 3:4, 9:16) y resolución 768p o 2K.
- Comprensión de instrucciones multimodales complejas gracias al módulo H3-Context-IR.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso; el modelo es generativo audiovisual, no un LLM de propósito general.

## Casos de uso

- Publicidad y marketing de producto: generar clips de 4–15 s con audio sincronizado a partir de una imagen de producto y un guion textual, usando el modo FL2VA con primer y último fotograma para controlar la composición inicial y final.
- Doblaje y localización de vídeo: el modo video-to-audio-video permite sustituir la pista de audio original por diálogo generado en uno de los 11 idiomas estables, manteniendo la sincronización labial y el contenido visual.
- Creación de contenido para redes sociales: producción de vídeo vertical 9:16 a 24 FPS con audio estéreo a 32 kHz para plataformas de formato corto, ajustando la relación de aspecto sin reentrenar.
- Prototipado de escenas cinematográficas: uso de H3-Base-Ref2VA con hasta 12 ficheros de referencia (imágenes de personajes, clips de vestuario, audio de referencia de voz) para mantener consistencia visual y sonora entre planos.
- Generación de vídeo educativo o divulgativo: a partir de texto e imágenes de apoyo, producir explicaciones animadas breves con narración en español, idioma listado como estable en la model card.
- Previsualización de storyboards: convertir un conjunto de imágenes clave en un vídeo con transiciones controladas mediante el modo de primer y último fotograma, útil en fases de preproducción.
- Restauración o reescalado de contenido: pipeline de dos pasadas (768p y H3-Regenerate-2K) para obtener salida 2K reinyectando el contexto original, aplicable a material de archivo que se quiera reutilizar en alta resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 353,9 GB en safetensors, lo que implica que la carga completa de pesos excede con holgura la memoria de cualquier GPU consumer; se requiere particionado, offloading a CPU o ejecución multi-GPU.
- GPU recomendadas: no disponible en la model card. Por el tamaño del repo, un despliegue completo en GPU exige configuraciones tipo A100 80 GB, H100 80 GB o clústeres multi-GPU; no se confirma compatibilidad con RTX 4090 (24 GB) para el pipeline completo.
- GPU consumer: no se documenta que el sistema completo quepa en una GPU consumer; el módulo H3-Base por separado podría requerir cuantización agresiva no publicada.
- Opciones de despliegue: librería `minimax-h3` y etiqueta `diffusers`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a generación de vídeo). Existe API oficial en platform.minimax.io y platform.minimaxi.com, además de apps web y de escritorio.
- Latencia y throughput: no disponibles. La arquitectura en cascada (Context-IR + Base + Regenerate-2K) implica al menos dos pasadas generativas para salida 2K, lo que multiplica el coste computacional respecto a una generación directa a 768p.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / duración | Resolución | Audio nativo | Licencia |
|---|---|---|---|---|---|---|
| MiniMax H3 | Omni-modal vídeo+audio en cascada | No disponible | 4–15 s de vídeo; hasta 12 ficheros de referencia | 768p / 2K | Sí, estéreo 32 kHz | Community License (other) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, benchmarks, licencia) que permitan una comparación rigurosa. La model card no cita comparativas con otros sistemas de generación de vídeo con audio.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un modelo entrenado con datos multimodales a gran escala es probable que reproduzca sesgos de representación; no hay evidencia publicada al respecto.
- Riesgo de alucinación visual y sonora: la generación de diálogo y audio sincronizado puede producir contenido incoherente con la instrucción, especialmente en contextos multimodales complejos; la model card recomienda encarecidamente usar H3-Context-IR para mitigar este riesgo.
- Duración máxima de 15 s por clip: no apto para vídeo de formato largo sin concatenación externa.
- El módulo H3-Context-IR es crítico para la calidad; omitirlo degrada el resultado, lo que añade complejidad operativa al pipeline.
- Licencia "other" (MiniMax-H3 Community License Agreement): las condiciones exactas de uso comercial no están resumidas en la información disponible; es imprescindible revisar el fichero LICENSE antes de un despliegue en producción.
- El repositorio analizado (`donx10th/MiniMax-H3`) es una réplica no oficial con 0 descargas y 0 likes; para producción conviene usar el repo oficial `MiniMaxAI/MiniMax-H3`.
- Tamaño de 353,9 GB: inviable en entornos con almacenamiento o ancho de banda limitados; requiere planificación de infraestructura.
- Idiomas: la lista de etiquetas del repo (sueco, inglés, francés, alemán, español, neerlandés) no coincide con la lista de 11 idiomas de diálogo estable de la model card; el soporte real por idioma puede variar.
- No se documentan limitaciones específicas de contexto, resolución o coherencia temporal más allá de las duraciones y resoluciones indicadas.

## Enlaces

- Repositorio analizado: https://huggingface.co/donx10th/MiniMax-H3
- Repositorio oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- GitHub oficial: https://github.com/MiniMax-AI/MiniMax-H3
- Skills de prompting: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- WebApp global: https://hailuoai.video/tools/minimax-h3
- WebApp China: https://hailuoai.com/
- App de escritorio global: https://hub.minimax.io/
- App de escritorio China: https://hub.minimaxi.com/
- Web oficial de MiniMax: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
