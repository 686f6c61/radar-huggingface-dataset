# addlabsviral/minimax-h3-combined

## Resumen

MiniMax H3 es un sistema generativo omni-modal de propósito general desarrollado por MiniMax (la empresa detrás de Hailuo AI). A diferencia de un modelo de lenguaje, H3 entiende contextos compuestos por texto, imagen, vídeo y audio, y genera vídeo con audio estéreo nativo sincronizado, en resoluciones de hasta 2K y duraciones de 4 a 15 segundos a 24 FPS. El repositorio `addlabsviral/minimax-h3-combined` es una redistribución comunitaria (no oficial) que empaqueta los pesos combinados del sistema; ocupa 353,9 GB en total.

La arquitectura se describe como un transformer multimodal nativo capaz de producir vídeo 2K y audio estéreo 3D sincronizado en una única pasada de difusión. El sistema completo consta de tres módulos: H3-Context-IR (interpretación y refinado de la instrucción multimodal), H3-Base (generación a 768p) y H3-Regenerate-2K (reaplicación del contexto para reescalar a 2K).

Su relevancia actual radica en que MiniMax publicó los pesos de H3 en abierto, lo que lo convierte en uno de los modelos de vídeo con pesos abiertos más capaces disponibles, con soporte estable de diálogo en 11 idiomas y modos de entrada que van del text-to-video al omni-reference con múltiples imágenes, clips de vídeo y audio de referencia. Los pesos completos en BF16 rondan los 134 GiB, por lo que su despliegue local exige hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal nativo con generacion de video y audio sincronizado en una unica pasada de difusion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos combinados ~134 GiB); se menciona una variante NVFP4 en un Space no oficial |
| Idiomas soportados | Dialogo estable en 11 idiomas: arabe, chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol; otros idiomas con soporte variable |
| Licencia | minimax-h3-community-license-agreement (campo `license: other`) |
| Formato de pesos | safetensors (tags: diffusers, safetensors) |

Especificaciones de generacion declaradas en la model card:

| Parametro de salida | Valor |
|---|---|
| Duracion | 4-15 segundos |
| Resolucion | Lado corto a 768 px por defecto; 2K con H3-Regenerate-2K |
| Relacion de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16, entre otras |
| Frecuencia de fotogramas | 24 FPS |
| Audio | Estereo a 32 kHz |

Modos de entrada por variante:

| Variante | Modo de entrada | Especificaciones |
|---|---|---|
| H3-Base-FL2VA | Primer y ultimo fotograma | 0 imagenes (text-to-video), 1 imagen (primer o ultimo fotograma), 2 imagenes (primer y ultimo fotograma) |
| H3-Base-Ref2VA | Omni-reference multimodal | Hasta 9 imagenes; hasta 3 clips de video de 2-15 s (total <= 15 s); hasta 3 clips de audio de 2-15 s (total <= 15 s); maximo 12 archivos combinados |

## Arquitectura y entrenamiento

El sistema H3 se articula en tres modulos. H3-Context-IR interpreta y refina la instruccion multimodal de entrada y la convierte en una Representacion Intermedia de Contexto (Context Intermediate Representation) que el modelo generativo puede consumir directamente. H3-Base genera audio y video a 768p a partir de esa representacion. H3-Regenerate-2K vuelve a alimentar el resultado de 768p junto con el contexto original dentro de H3 para regenerar la salida a 2K, aprovechando tanto la capacidad generativa del modelo como la informacion del contexto original para obtener mas detalle.

Segun las fuentes disponibles, la arquitectura es un transformer nativo que genera video 2K y audio estereo 3D sincronizado en una sola pasada de difusion. La model card indica que el diseno del sistema esta orientado a la generalizacion de tareas, de modo que H3 ya posee amplias capacidades de comprension y generacion multimodal desde la fase de preentrenamiento, lo que le permite seguir instrucciones multimodales complejas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto, imagen, video, audio y combinaciones de todos ellos (text-to-video, image-to-video, video-to-video, text-to-audio-video, image-to-audio-video, image-text-to-audio-video, video-to-audio-video, audio-to-audio-video, audio-video generation).
- Generacion de audio estereo nativo sincronizado con el video (32 kHz).
- Salida de hasta 2K de resolucion mediante el modulo H3-Regenerate-2K (768p base).
- Duraciones de 4 a 15 segundos a 24 FPS con multiples relaciones de aspecto.
- Modo de primer y ultimo fotograma (H3-Base-FL2VA) para interpolacion o control temporal.
- Modo omni-reference (H3-Base-Ref2VA) con hasta 9 imagenes, 3 clips de video y 3 clips de audio como referencia, con un maximo de 12 archivos combinados.
- Generacion de dialogo hablado estable en 11 idiomas (arabe, chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol).
- Comprension de contextos multimodales compuestos por texto, imagen, video y audio.
- Skills oficiales de escritura de prompts publicados en GitHub para mejorar la calidad de las instrucciones.

## Casos de uso

- Produccion publicitaria de formato corto: generar anuncios de 4 a 15 segundos con video 2K y audio sincronizado a partir de un brief de texto, manteniendo la relacion de aspecto requerida por cada plataforma (9:16 para movil, 16:9 para web).
- Doblaje y localizacion de video: usar el modo omni-reference con un clip de video y un audio de referencia para regenerar el dialogo en uno de los 11 idiomas soportados manteniendo la sincronizacion labial y el audio estereo.
- Prototipado de storyboards animados: partir de imagenes de primer y ultimo fotograma para interpolar la accion intermedia a 24 FPS, util en preproduccion de cine y animacion.
- Creacion de contenido con personajes recurrentes: emplear H3-Base-Ref2VA con hasta 9 imagenes de referencia para mantener la coherencia visual de un personaje a lo largo de distintos planos generados.
- Generacion de video musical o contenido con audio integrado: producir de una sola pasada video y pista de audio estereo, reduciendo el trabajo de montaje posterior.
- Restauracion y mejora de metraje: introducir video existente en modo video-to-video con referencias adicionales y reescalar la salida a 2K con H3-Regenerate-2K.
- Integracion en pipelines de contenido automatizado: usar la API oficial (platform.minimax.io o platform.minimaxi.com) para generar variantes de video a escala dentro de un flujo de publicacion programado.
- Creacion de demos interactivas en ComfyUI: desplegar los flujos publicados en el hub comunitario para experimentar con los distintos modos de entrada en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos combinados en BF16 requieren aproximadamente 134 GiB, lo que excluye equipos de consumo y portatiles segun las fuentes disponibles.
- El repositorio redistribuido `addlabsviral/minimax-h3-combined` ocupa 353,9 GB en total, lo que sugiere que incluye varios modulos o variantes de precision.
- Se menciona una variante NVFP4 ("MiniMax-H3 Ultra Fast") orientada a generacion local de video y audio sincronizado, lo que reduce sustancialmente los requisitos de VRAM frente a BF16, aunque no se especifican cifras exactas.
- GPU recomendadas: no disponible de forma explicita; por el volumen de BF16 (134 GiB) se requiere hardware de centro de datos con multiples aceleradores (gama A100/H100 o superior). No cabe en GPUs de consumo (RTX 4090 y similares) en BF16.
- Opciones de despliegue: ecosistema diffusers como libreria base; flujos de ComfyUI publicados en el hub comunitario; API oficial de MiniMax como alternativa gestionada; aplicacion web y de escritorio de Hailuo AI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (generacion de video y audio con pesos abiertos). No se dispone de cifras de parametros, contexto ni benchmarks de alternativas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio `addlabsviral/minimax-h3-combined` es una redistribucion no oficial; el autor no es MiniMax. Conviene verificar la procedencia y la integridad de los pesos frente al repositorio oficial `MiniMaxAI/MiniMax-H3`.
- El repositorio figura con 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validacion independiente.
- Licencia `minimax-h3-community-license-agreement` (campo `license: other`): no es una licencia de codigo abierto estandar. Es imprescindible revisar las condiciones completas antes de cualquier uso comercial.
- Riesgo de alucinacion y de artefactos visuales o de sincronizacion de audio inherente a los modelos generativos de difusion; no se documentan tasas de error en la informacion disponible.
- El soporte estable de dialogo se limita a 11 idiomas; otros idiomas funcionan de forma variable, con posible degradacion en la sincronizacion labial y la pronunciacion.
- La generacion de audio y video con voz o personas puede plantear problemas de derechos de imagen, consentimiento y deepfakes; se recomienda incorporar salvaguardas en produccion.
- No se especifican los datos de entrenamiento ni su composicion, por lo que no es posible evaluar sesgos conocidos de forma rigurosa.
- Los requisitos de hardware (134 GiB en BF16) implican costes elevados de inferencia local; para uso a escala suele ser mas practico recurrir a la API oficial.
- La reescalada a 2K depende del modulo H3-Regenerate-2K; sin el, la salida se limita a 768p en el lado corto.

## Enlaces

- Repositorio consultado: https://huggingface.co/addlabsviral/minimax-h3-combined
- Repositorio oficial del modelo: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio oficial en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Skills oficiales de escritura de prompts: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- Space comunitario (variante NVFP4): https://huggingface.co/spaces/addlabsviral/minimax-h3-ultra-fast
- Hub comunitario MiniMax-H3: https://github.com/ai-models-lab/minimax-h3
- Documentacion de arquitectura (DeepWiki): https://deepwiki.com/ai-models-lab/minimax-h3/4.1-model-architecture-and-generation-modes
- Web app global (Hailuo AI): https://hailuoai.video
- Herramienta H3 en la web app: https://hailuoai.video/tools/minimax-h3
- Web app CN: https://hailuoai.com/
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API CN: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentacion de generacion de texto (API): https://platform.minimax.io/docs/guides/text-generation
- Web oficial de MiniMax: https://www.minimax.io
- Aplicacion de escritorio global: https://hub.minimax.io/
- Aplicacion de escritorio CN: https://hub.minimaxi.com/
- ModelScope de MiniMax: https://modelscope.cn/organization/minimax
- Analisis externo de H3: https://nerdbot.com/2026/09/03/minimax-h3-generates-2k-video-with-synchronized-sound-and-it-accepts-your-fan-art-as-input/
