# dware/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omni-modal de MiniMax orientado a la creación de vídeo con audio estéreo nativo, capaz de producir clips de 4 a 15 segundos a 24 FPS, con lado corto de 768 píxeles por defecto y hasta 2K mediante el módulo H3-Regenerate-2K. El sistema acepta contextos multimodales compuestos por texto, imágenes, vídeo y audio, y cubre un espectro amplio de tareas: texto a vídeo, imagen a vídeo, vídeo a vídeo, y variantes que incorporan audio en la entrada o en la salida (text-to-audio-video, audio-to-audio-video, reference-to-audio-video, entre otras).

La ficha de HuggingFace analizada corresponde al repositorio `dware/MiniMax-H3`, una réplica de 353,9 GB publicada por un tercero; el repositorio oficial es `MiniMaxAI/MiniMax-H3` y el proyecto se distribuye bajo la Minimax-H3 Community License Agreement, con pesos en formato safetensors y librería propia `minimax-h3` (etiquetado también como `diffusers`). El sistema se organiza en tres módulos: H3-Context-IR (comprensión y refinado de la instrucción multimodal a una representación intermedia), H3-Base (generación de vídeo y audio a 768p) y H3-Regenerate-2K (regeneración a 2K reutilizando el contexto original).

Su relevancia actual radica en que unifica comprensión y generación multimodal en un único sistema entrenado desde la etapa de preentrenamiento para generalizar entre tareas, e incluye audio estéreo de 32 kHz sincronizado con el vídeo y soporte estable de diálogo en 11 idiomas. No se han publicado en la información disponible datos sobre número de parámetros, arquitectura interna ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Sistema generativo omni-modal; se distribuye con librería `minimax-h3` y etiqueta `diffusers`. La model card no desglosa el tipo de red (transformer de difusión, MoE u otro) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica en tokens. Límites de entrada multimodal (variante Ref2VA): hasta 9 imágenes, hasta 3 clips de vídeo de 2-15 s cada uno (total ≤ 15 s), hasta 3 clips de audio de 2-15 s cada uno (total ≤ 15 s) y un máximo de 12 archivos combinados. La variante FL2VA admite 0, 1 o 2 imágenes |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 11 idiomas con soporte estable para diálogo: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español. Otros idiomas con soporte variable |
| Licencia | `minimax-h3-community-license-agreement` (etiqueta `license:other`) |
| Formato de pesos | safetensors |
| Duracion de salida | 4-15 segundos |
| Resolucion de salida | Lado corto a 768 píxeles por defecto; 2K con H3-Regenerate-2K |
| Frecuencia de fotogramas | 24 FPS |
| Audio de salida | Estéreo a 32 kHz |
| Relaciones de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras |
| Variantes | H3-Base-FL2VA (primer/último fotograma) y H3-Base-Ref2VA (referencia omni-modal) |
| Tamano del repositorio | 353,9 GB |
| Fecha de publicacion del repo | 2026-10-06 (según HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El sistema H3 se describe como un sistema generativo omni-modal de propósito general, diseñado en torno a la generalización de tareas. Esto implica que la comprensión y la generación de contextos multimodales (texto, imagen, vídeo y audio) se adquieren ya en la fase de preentrenamiento, en lugar de depender de adaptadores específicos por tarea. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La inferencia se articula en tres módulos encadenados. H3-Context-IR procesa la instrucción multimodal compleja y la convierte en una representación intermedia de contexto; la model card señala que este módulo es crítico para la calidad final y recomienda integrarlo en el pipeline o replicar su función siguiendo la guía de prompting publicada. H3-Base genera audio y vídeo a 768p a partir de esa representación. H3-Regenerate-2K toma el resultado de 768p junto con el contexto original y regenera la salida a resolución 2K, aprovechando tanto la capacidad generativa como la información del contexto para afinar detalles. No se detallan innovaciones de atención, decodificación especulativa ni esquemas de compresión temporal.

## Capacidades

- Generación de vídeo a partir de texto, imagen, vídeo o combinaciones multimodales, con relaciones de aspecto que van de 21:9 a 9:16.
- Generación de audio estéreo nativo a 32 kHz sincronizado con el vídeo generado.
- Modo primer y último fotograma (H3-Base-FL2VA): sin imagen (texto a vídeo), con una imagen (primer o último fotograma) o con dos imágenes (interpolación entre primer y último fotograma).
- Modo de referencia omni-modal (H3-Base-Ref2VA): acepta hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio, con un máximo de 12 archivos combinados.
- Tareas cubiertas según las etiquetas del modelo: text-to-video, image-to-video, image-text-to-video, video-to-video, text-to-audio-video, image-to-audio-video, image-text-to-audio-video, video-to-audio-video, audio-to-audio-video y reference-to-audio-video.
- Diálogo hablado generado con soporte estable en 11 idiomas.
- Comprensión de instrucciones multimodales complejas en la etapa de preentrenamiento.
- Superresolución generativa de 768p a 2K mediante H3-Regenerate-2K.
- No se documenta soporte de tool calling ni function calling, ni capacidades de agente multi-paso.

## Casos de uso

- Producción de spots publicitarios cortos: generar clips de 4 a 15 segundos a 24 FPS con audio estéreo sincronizado en formato 16:9 o 21:9, partiendo de un guion de texto o de un fotograma de referencia de marca. El modo primer y último fotograma permite fijar la imagen inicial y final exigidas por el cliente.
- Doblaje y localización de vídeo: usar el modo vídeo-a-audio-vídeo para regenerar el audio hablado en uno de los 11 idiomas soportados manteniendo el vídeo de origen, útil para campañas multi-mercado.
- Posproducción con 2K: generar primero a 768p con H3-Base y regenerar después con H3-Regenerate-2K para obtener una salida válida para pantallas grandes, reutilizando el contexto original para preservar el detalle.
- Creación de contenido para redes sociales: producir variantes verticales 9:16 y cuadradas 1:1 del mismo concepto sin reentrenar, encadenando generaciones con el mismo contexto intermedio.
- Animación de material fotográfico de archivo: alimentar el modo FL2VA con dos imágenes (primer y último fotograma) para interpolar movimiento y obtener un clip con audio generado, aplicable a archivos históricos o catálogos de producto.
- Prototipado rápido de storyboards animados: convertir guiones en clips de 4-15 segundos para validar ritmo y puesta en escena antes de rodar, sustituyendo animáticas estáticas.
- Generación de vídeo de referencia con audio para videojuegos o animación: usar referencias multimodales (hasta 12 archivos combinados) para condicionar estilo, personajes y banda sonora en un mismo clip.
- Integración en plataformas vía API: los endpoints oficiales de MiniMax (platform.minimax.io y platform.minimaxi.com) permiten incorporar la generación a pipelines automatizados sin desplegar los pesos localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni de GPU en la información disponible.
- Almacenamiento: el repositorio de la réplica ocupa 353,9 GB en safetensors. Esa cifra agrega varios componentes del sistema (H3-Context-IR, H3-Base en sus variantes FL2VA y Ref2VA, y H3-Regenerate-2K), por lo que no equivale a la VRAM necesaria para una única inferencia.
- VRAM estimada: no disponible. Depende del subconjunto de módulos cargados y de una cuantización que la model card no documenta. Se recomienda reservar almacenamiento en disco para el conjunto completo antes de planificar el despliegue.
- GPU recomendadas: no disponible. Por el tamaño agregado del repositorio, es previsible que la inferencia local requiera aceleradores de centro de datos (tipo A100/H100) en lugar de GPU de consumo, pero esto no está confirmado por el fabricante.
- GPU de consumo: sin datos confirmados. No se puede afirmar que quepa en una RTX 4090 ni en modelos inferiores.
- Opciones de despliegue: librería propia `minimax-h3`, ecosistema `diffusers` (etiqueta del repositorio) y API oficial en la nube de MiniMax. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de sistema generativo de vídeo y no se mencionan en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos comparativos (parámetros, contexto, benchmarks o licencia) de otros modelos en la información disponible. Los sistemas de la misma categoría (generación de vídeo con audio sincronizado, tipo Veo, Sora o Kling) no aparecen descritos en el material consultado, por lo que no se incluye tabla comparativa con cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 (dware/MiniMax-H3) | No disponible | No aplica (límites multimodales descritos arriba) | Sin benchmarks publicados en la información disponible | minimax-h3-community-license-agreement | Pesos en safetensors (353,9 GB), API oficial y app Hailuo AI |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia comunitaria: la Minimax-H3 Community License Agreement es una licencia `other` con condiciones específicas. Es obligatorio revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones de atribución, de escala de uso o de redistribución.
- El repositorio analizado (`dware/MiniMax-H3`) es una réplica subida por un tercero, no el repositorio oficial. Existe riesgo de integridad de los pesos; para producción conviene contrastar hashes con `MiniMaxAI/MiniMax-H3`.
- Sin benchmarks publicados: no hay métricas objetivas verificables de calidad de vídeo, sincronización audiovisual o fidelidad de instrucciones en la información disponible.
- Riesgo de artefactos generativos: al ser un modelo de difusión para vídeo, son esperables incoherencias temporales, deformaciones anatómicas o de objetos, y desincronización entre labios y voz, especialmente en los extremos del rango de 4 a 15 segundos.
- Límite de duración: 15 segundos máximo por generación, lo que obliga a encadenar clips para contenidos más largos y puede introducir inconsistencias entre segmentos.
- Límites de entrada: en el modo Ref2VA, cada clip de vídeo o audio debe durar entre 2 y 15 segundos, la suma total no puede superar los 15 segundos y el conjunto de archivos está limitado a 12.
- Idiomas: el diálogo hablado solo tiene soporte estable en 11 idiomas; el resto presenta calidad variable. No se especifican los idiomas del texto de instrucciones.
- Dependencia del módulo H3-Context-IR: omitirlo o sustituirlo por un procesamiento propio degrada la calidad de salida, según advierte la propia model card.
- Sin datos de sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o de representación.
- Huella de recursos: 353,9 GB de pesos y un pipeline de tres módulos implican requisitos de almacenamiento y cómputo elevados que no se detallan oficialmente.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/dware/MiniMax-H3
- Repositorio oficial en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Guías de prompting (skills): https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API para China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentación de generación de texto de la plataforma: https://platform.minimax.io/docs/guides/text-generation
- Aplicación web global (Hailuo AI): https://hailuoai.video/tools/minimax-h3
- Aplicación web para China: https://hailuoai.com/
- Aplicación de escritorio global: https://hub.minimax.io/
- Aplicación de escritorio para China: https://hub.minimaxi.com/
- Organización en ModelScope: https://modelscope.cn/organization/minimax
- Sitio web de MiniMax: https://www.minimax.io
- Contacto (FAQ): https://platform.minimaxi.com/docs/faq/contact-us
- Discord: https://discord.com/invite/dbMxutw7tP
