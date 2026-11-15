# AI-KSK/ksk-video-191-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-191-comfyui-workflows` no es un modelo de IA en sentido estricto, sino un repositorio de flujos de trabajo (workflows) de ComfyUI publicados por el canal AI-KSK como material complementario del episodio 191 de su serie de tutoriales. El contenido son ficheros JSON que describen grafos de nodos de ComfyUI para tareas de intercambio facial, ampliación de imagen y segmentación/mezcla de audio multilingüe (japonés, coreano, portugués y español).

El repositorio tiene un tamaño de 0.0 GB (no contiene pesos de modelo), cero descargas y cero likes, y no declara licencia, idiomas ni pipeline. Los workflows referencian modelos externos que deben existir previamente en el entorno de ComfyUI del usuario (por ejemplo, el modelo de ampliación denominado "Klein9B" en los ficheros, y modelos de intercambio facial etiquetados como "2511").

Su relevancia es puramente práctica y educativa: sirve como referencia reproducible de pipelines de vídeo/imagen y de doblaje por segmentos para quienes ya trabajan con ComfyUI. No aporta arquitectura, pesos ni capacidades de inferencia propias, por lo que esta ficha documenta el artefacto tal como es y marca como "no disponible" todo lo que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows JSON de ComfyUI, no un modelo neuronal) |
| Parametros totales | no disponible (el repo no contiene pesos; tamano del repo: 0.0 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los workflows incluyen variantes de segmentacion para japones, coreano, portugues y espanol) |
| Licencia | no disponible |
| Formato de pesos | no aplica; el contenido son ficheros `.json` de workflow de ComfyUI |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. Se trata de un conjunto de 23 ficheros JSON que definen grafos de ComfyUI, más 5 imágenes de portada del episodio. Los workflows se agrupan en tres familias: intercambio facial (dos variantes, una de ejemplo y otra con reinyección/repintado "贴回"), ampliación de imagen con un modelo denominado "Klein9B", y un pipeline de segmentación y mezcla de audio con manifiestos y colas TTS por idioma (`segment_manifest_*`, `tts_pending_*`, `merge_segments_*`).

El autor indica explícitamente en las notas de la model card que son exportaciones de ComfyUI que referencian modelos que deben existir en el entorno, que son workflows de tutorial y no productos empaquetados, y que la publicación es independiente y no está afiliada a los autores de los modelos ni a RunningHub. No se documenta número de tokens, composición de dataset, RLHF/DPO ni ninguna innovación de entrenamiento, porque no aplica.

## Capacidades

- Intercambio facial en vídeo/imagen mediante grafos de ComfyUI (dos variantes: ejemplo y repintado con reinyección).
- Ampliación de imagen (upscaling) con preservación de detalle facial y de composición, según la descripción del autor.
- Segmentación de audio/subtítulos desde SRT (`source_segments_from_srt_sorted.json`).
- Traducción y gestión de segmentos por idioma: japonés, coreano, portugués y español.
- Generación de colas de texto-a-voz (TTS) por idioma (`tts_pending_*`).
- Mezcla de segmentos de audio por idioma (`merge_segments_*`).
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de modelo base: esas funciones dependen de los modelos que el usuario cargue en ComfyUI.

## Casos de uso

- Doblaje automatizado de vídeo a español: el workflow `merge_segments_spanish.json` junto con `tts_pending_spanish.json` y `segment_manifest_spanish.json` permite encadenar segmentación desde SRT, traducción, síntesis de voz y mezcla final del audio doblado.
- Localización multilingüe de contenido: las variantes japonesa, coreana y portuguesa permiten reutilizar el mismo pipeline para distribuir un vídeo en cuatro mercados sin rehacer los grafos.
- Intercambio facial en postproducción: los workflows `2511面部交换` permiten sustituir rostros en material grabado manteniendo, según el autor, la composición y sin desplazar rasgos faciales.
- Restauración y ampliación de material de archivo: el workflow `Klein9B图片放大.json` sirve para reescalar imágenes con énfasis en detalle fino sin alterar la estructura de la escena.
- Reproducibilidad de tutoriales: al ser JSON exportados, un equipo puede importarlos en su instalación de ComfyUI para replicar exactamente el resultado mostrado en el episodio 191.
- Base para pipelines propios: los manifiestos de segmentos y las colas TTS son un punto de partida para integrar TTS y traducción en un sistema de generación de vídeo más amplio.
- Formación interna: útil como material docente para explicar la composición de grafos de ComfyUI en tareas de vídeo, imagen y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en el repositorio; depende enteramente de los modelos que se carguen en cada grafo (intercambio facial, ampliación "Klein9B" y TTS).
- GPU recomendadas: no disponibles; el autor no publica requisitos. En la práctica, los pipelines de ampliación y de intercambio facial en ComfyUI suelen requerir GPUs con VRAM suficiente para el modelo concreto que se instale.
- Cabeza en GPU de consumo: no disponible; condicionado a los modelos referenciados, que no se especifican.
- Opciones de despliegue: ComfyUI (formato nativo de los ficheros). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada repositorios comparables de workflows de ComfyUI del mismo autor o con el mismo conjunto de tareas, y al no ser un modelo con pesos no procede comparar parámetros, contexto ni licencia.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador ni configuración de inferencia; no puede ejecutarse por sí solo.
- Los workflows referencian modelos externos que deben existir en el entorno de ComfyUI; sin ellos, los grafos fallan al cargar.
- Licencia no declarada: no hay autorización explícita de uso comercial; hay que contactar con el autor antes de reutilizarlo en producción.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- El contenido de la model card está mayoritariamente en chino; la documentación en inglés es mínima y no cubre parámetros técnicos.
- Riesgo de deriva: al ser exports de ComfyUI, la compatibilidad con versiones futuras de ComfyUI y de los nodos personalizados no está garantizada.
- Los enlaces a RunningHub incluyen un código de invitación de afiliado (`inviteCode=rh-v1111`); el autor declara no estar afiliado a RunningHub, pero conviene tenerlo en cuenta al evaluar los recursos enlazados.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del propio artefacto, porque no ejecuta inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-191-comfyui-workflows
- YouTube (episodio 191): https://youtu.be/9l_xjeI881w
- Bilibili (episodio 191): https://www.bilibili.com/video/BV1DpADznEo2/
- RunningHub (recurso 1): https://www.runninghub.cn/post/2027327275267530754/?inviteCode=rh-v1111
- RunningHub (recurso 2): https://www.runninghub.cn/post/2027381547103424514/?inviteCode=rh-v1111
- RunningHub (recurso 3): https://www.runninghub.cn/post/2027387337340096514/?inviteCode=rh-v1111
