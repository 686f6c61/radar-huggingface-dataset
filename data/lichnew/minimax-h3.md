# lichnew/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omni-modal desarrollado por MiniMax (la empresa detrás de Hailuo AI) que unifica la comprensión de contextos multimodales compuestos por texto, imágenes, vídeo y audio, y genera vídeo con audio estéreo nativo a resoluciones de hasta 2K y duraciones de hasta 15 segundos. El sistema está diseñado en torno a la generalización de tareas: ya en la fase de preentrenamiento adquiere amplias capacidades de comprensión y generación de contexto multimodal, lo que le permite seguir instrucciones multimodales complejas.

El sistema completo se compone de tres módulos: H3-Context-IR (que interpreta y refina las instrucciones multimodales de entrada y las convierte en una Representación Intermedia de Contexto), H3-Base (que genera audio y vídeo a 768p a partir de esa representación) y H3-Regenerate-2K (que reinyecta el resultado de 768p junto con el contexto original para regenerar la salida a 2K). El repositorio publicado por el usuario `lichnew` ocupa 353,9 GB y se distribuye bajo la licencia comunitaria Minimax-H3-Community-License-Agreement.

La relevancia del modelo radica en su carácter omni-modal y en la generación conjunta de vídeo y audio sincronizado, con soporte de diálogo estable en 11 idiomas y variantes específicas para modos de primer/último fotograma y de referencia omni-modal (imágenes, vídeos y audio como referencia). No se dispone de información pública sobre número de parámetros ni arquitectura interna en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema omni-modal generativo con módulos H3-Context-IR, H3-Base y H3-Regenerate-2K) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada multimodal: hasta 9 imágenes, hasta 3 vídeos de 2-15 s, hasta 3 audios de 2-15 s; máximo 12 archivos combinados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sv, en, fr, de, es, nl (etiquetas del repo); diálogo estable en 11 idiomas: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (repo de 353,9 GB), integración con diffusers |

Especificaciones de salida:

| Parametro | Valor |
|---|---|
| Duración de salida | 4-15 segundos |
| Resolución de salida | lado corto a 768 px por defecto; 2K con H3-Regenerate-2K |
| Relación de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras |
| Frecuencia de fotogramas | 24 FPS |
| Audio de salida | estéreo a 32 kHz |

Variantes del modelo:

| Variante | Modo de entrada | Especificaciones |
|---|---|---|
| H3-Base-FL2VA | Primer y último fotograma | 0 imágenes: texto-a-vídeo; 1 imagen: primer o último fotograma a vídeo; 2 imágenes: primer y último fotograma a vídeo |
| H3-Base-Ref2VA | Referencia omni-modal | Hasta 9 imágenes, hasta 3 vídeos (2-15 s cada uno, total ≤ 15 s), hasta 3 audios (2-15 s cada uno, total ≤ 15 s), máximo 12 archivos combinados |

## Arquitectura y entrenamiento

La documentación disponible describe el sistema a nivel funcional, no a nivel de arquitectura interna. MiniMax H3 se presenta como un sistema generativo omni-modal de propósito general que comprende contextos compuestos por texto, imagen, vídeo y audio y genera vídeo con audio estéreo nativo. El diseño está orientado a la generalización de tareas: las capacidades de comprensión y generación multimodal se adquieren en la fase de preentrenamiento, lo que habilita el seguimiento de instrucciones multimodales complejas.

El pipeline se articula en tres etapas. H3-Context-IR procesa y refina las instrucciones multimodales de entrada y las transforma en una Representación Intermedia de Contexto que H3 puede interpretar directamente; el autor señala que este módulo es crítico para la calidad del resultado final y recomienda incorporarlo al pipeline de generación o construir un sistema propio siguiendo la guía de prompting. H3-Base genera audio y vídeo a 768p a partir de esa representación. H3-Regenerate-2K realimenta el resultado de 768p junto con el contexto original para regenerar la salida a 2K, aprovechando tanto la capacidad generativa como la información del contexto original. No se han publicado en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio nativo sincronizado.
- Generación de vídeo a partir de imagen (image-to-video), incluyendo modos de primer fotograma, último fotograma y primer y último fotograma simultáneamente.
- Generación de vídeo y audio a partir de texto e imagen (image-text-to-video, image-text-to-audio-video).
- Generación de vídeo a partir de vídeo (video-to-video) y de vídeo con audio (video-to-audio-video).
- Generación audio-a-audio-vídeo (audio-to-audio-video).
- Generación con referencia omni-modal (reference-to-audio-video): imágenes, vídeos y audio como referencia combinada.
- Comprensión unificada de contextos multimodales de texto, imagen, vídeo y audio.
- Generación de audio estéreo nativo a 32 kHz sincronizado con el vídeo.
- Diálogo hablado estable en 11 idiomas (árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español), con soporte variable de otros idiomas.
- Salida de hasta 2K de resolución mediante la etapa H3-Regenerate-2K.
- Salida de 4 a 15 segundos a 24 FPS con múltiples relaciones de aspecto.
- Soporte de instrucciones multimodales complejas gracias al módulo H3-Context-IR.
- Habilidades oficiales de mejora de prompts publicadas en el repositorio de GitHub.

## Casos de uso

- Publicidad y contenido de marketing: generación de clips de 4-15 segundos con audio sincronizado a partir de un brief textual o de imágenes de producto, usando el modo texto-a-vídeo o primer/último fotograma para controlar la composición inicial y final.
- Doblaje y localización de vídeo: el modo video-to-audio-video permite sustituir la pista de audio de un clip manteniendo el vídeo, con diálogo en 11 idiomas, útil para adaptar contenido a mercados hispanohablantes.
- Previsualización de storyboards: partiendo de dos imágenes (primer y último fotograma) se genera la transición animada con audio, lo que acelera la validación creativa antes de producción final.
- Creación de contenido para redes sociales: generación en relaciones de aspecto verticales (9:16) y cuadradas (1:1) a 24 FPS con audio nativo, sin necesidad de postprocesar la pista de sonido.
- Prototipado de videojuegos y experiencias interactivas: el modo referencia omni-modal permite condicionar la generación con hasta 9 imágenes, 3 vídeos y 3 audios de referencia para mantener coherencia de estilo y personajes.
- Generación de material didáctico y formación: a partir de una imagen de referencia y una locución de audio se produce un vídeo explicativo con audio sincronizado en el idioma del alumno.
- Restauración y reescalado creativo: el pipeline H3-Base a 768p seguido de H3-Regenerate-2K permite obtener salidas de alta resolución reinyectando el contexto original, útil para entregables de calidad broadcast.
- Integración vía API en productos SaaS: los endpoints de platform.minimax.io y platform.minimaxi.com permiten incorporar generación de vídeo con audio sin desplegar el modelo localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 353,9 GB en formato safetensors, por lo que el almacenamiento necesario para una descarga completa es de al menos 354 GB, más espacio adicional para caché y salidas.
- VRAM estimada para inferencia: no disponible en la documentación proporcionada. El tamaño del repo (353,9 GB) sugiere que la inferencia en precisión completa no cabe en GPUs de consumo; se requeriría cuantización o ejecución en múltiples aceleradores, aunque no se especifican los formatos de cuantización soportados.
- GPU recomendadas: no disponible. Por el volumen de pesos, un despliegue local requeriría GPUs de centro de datos (A100, H100) o configuraciones multi-GPU; no se confirma que quepa en GPUs de consumo como la RTX 4090.
- Opciones de despliegue: integración con la librería `minimax-h3` y con `diffusers`; también disponible mediante API en platform.minimax.io (global) y platform.minimaxi.com (China), y mediante las aplicaciones web y de escritorio de Hailuo AI y MiniMax Hub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de parámetros de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax H3 | no disponible | no disponible | minimax-h3-community-license-agreement | Pesos en Hugging Face (repo de 353,9 GB), API y apps |
| Alternativas de generación vídeo-audio | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La documentación no detalla el número de parámetros, la arquitectura interna ni los datos de entrenamiento, lo que dificulta la evaluación técnica independiente y la reproducibilidad.
- La licencia es `minimax-h3-community-license-agreement` (licencia `other`), no una licencia de código abierto estándar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones de uso, atribución o redistribución.
- El módulo H3-Context-IR es crítico para la calidad de la salida según el autor; omitirlo o sustituirlo por un procesamiento propio puede degradar notablemente los resultados.
- La duración máxima de salida es de 15 segundos, lo que limita su uso para contenido de formato largo sin concatenación de clips.
- La resolución por defecto es 768p en el lado corto; la salida 2K requiere una etapa adicional (H3-Regenerate-2K) con mayor coste computacional.
- El soporte de diálogo estable se limita a 11 idiomas; el resto de idiomas tiene soporte variable, por lo que la calidad del audio hablado puede degradarse fuera de esa lista.
- Riesgo de alucinación visual y de desviación respecto a la instrucción en prompts complejos, inherente a los modelos generativos; se recomienda validación humana en producción.
- Sesgos conocidos: no se documentan en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento audiovisual, no especificados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el 2026-11-17, por lo que se trata de una publicación reciente sin validación comunitaria acumulada.
- El despliegue local exige recursos de almacenamiento y cómputo considerables (353,9 GB de pesos), lo que puede hacer inviable la inferencia en entornos con hardware limitado.

## Enlaces

- Modelo en Hugging Face (repo consultado): https://huggingface.co/lichnew/MiniMax-H3
- Modelo oficial en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Habilidades de prompting: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentación de generación de texto (API): https://platform.minimax.io/docs/guides/text-generation
- WebApp global (Hailuo AI): https://hailuoai.video/tools/minimax-h3
- WebApp China: https://hailuoai.com/
- App de escritorio global: https://hub.minimax.io/
- App de escritorio China: https://hub.minimaxi.com/
- Sitio web de MiniMax: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Contacto (WeChat): https://platform.minimaxi.com/docs/faq/contact-us
