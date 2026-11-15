# AI-KSK/ksk-video-155-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-155-comfyui-workflows` no es un modelo de IA en sentido estricto, sino un repositorio de ficheros de workflow de ComfyUI publicados por el creador de contenido AI-KSK como material complementario del episodio 155 de su serie de tutoriales en video. El repositorio contiene 26 ficheros JSON que definen grafos de nodos para ComfyUI, orientados a la generacion de video con la familia de modelos LTX-2, incluyendo control de camara mediante LoRAs, generacion de video a partir de imagen (image-to-video) y de texto (text-to-video), y gestion de segmentos de audio y subtitulos para doblaje multilingue.

El valor practico del repositorio es educativo: los workflows referencian modelos que deben existir previamente en el entorno del usuario (por ejemplo, checkpoints LTX-2, LoRAs de control de camara y variantes NVFP4), pero no incluyen los pesos. La model card indica explicitamente que se trata de "workflows de tutorial, no productos empaquetados", y que la publicacion es independiente y no afiliada a los autores de los modelos ni a RunningHub.

Dado que el repositorio no contiene pesos de modelo, no hay arquitectura, parametros, contexto ni licencia de modelo que reportar. Las secciones siguientes reflejan esta naturaleza y marcan como "no disponible" todo dato que no figure en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows ComfyUI, no contiene pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los workflows referencian variantes NVFP4 y no destiladas de LTX-2, pero el repo no incluye pesos) |
| Idiomas soportados | no disponible (los workflows incluyen segmentos para japones, coreano, portugues, espanol e ingles por defecto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los ficheros del repo son JSON de workflow de ComfyUI) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. Contiene 26 ficheros JSON de definicion de grafos de ComfyUI. Los workflows se agrupan en tres familias: (1) generacion de video con LTX-2 usando tecnicas de primer/ultimo fotograma a partir de 2 o 3 imagenes, en variantes NVFP4 y no NVFP4; (2) control de camara ("镜头控制") en modalidades image-to-video y text-to-video, con modelos no destilados de alta calidad y variantes NVFP4; y (3) un pipeline de postproduccion de audio y subtitulos que incluye `merge_segments`, `segment_manifest`, `source_segments_from_srt`, `source_segments_from_translation_source_text`, `translated_segments` y `tts_pending`, con variantes linguisticas para japones, coreano, portugues y espanol.

Los workflows de video hacen referencia a LoRAs de control de camara (la model card menciona "7大镜头控制LoRA") y a checkpoints LTX-2 que el usuario debe tener instalados. No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens, ni tecnicas de RLHF/DPO, porque esos datos pertenecen a los modelos referenciados (LTX-2), no a este repositorio.

## Capacidades

- Definicion de grafos de ComfyUI para generacion de video con LTX-2 en modalidad text-to-video e image-to-video.
- Control de camara ("director-level camera movement") mediante LoRAs de control, segun la model card.
- Generacion de video a partir de primer y ultimo fotograma usando 2 o 3 imagenes de referencia.
- Variantes NVFP4 (cuantizacion de 4 bits en formato NVFP4) y variantes no destiladas de alta calidad para los mismos flujos.
- Fusion de segmentos de video (`merge_segments`) con manifiestos por idioma.
- Extraccion de segmentos desde SRT y desde texto fuente de traduccion.
- Gestion de segmentos traduccidos y cola de sintesis de voz (TTS pending) para japones, coreano, portugues y espanol.
- No incluye pesos de modelo, tokenizador, ni servicio de inferencia; es material de configuracion.

## Casos de uso

- Reproduccion de tutoriales de video generativo: un desarrollador puede cargar los JSON en ComfyUI para replicar exactamente los resultados mostrados en el episodio 155 de AI-KSK, siempre que instale los checkpoints LTX-2 y LoRAs referenciados.
- Prototipado de control de camara en produccion audiovisual: los workflows de "镜头控制" permiten experimentar con movimientos de camara definidos por LoRA en flujos image-to-video y text-to-video antes de invertir en pipelines propios.
- Generacion de transiciones primer/ultimo fotograma: los workflows de 2 y 3 imagenes sirven para crear interpolaciones entre fotogramas clave, utiles en animatica y storyboards.
- Doblaje multilingue automatizado: la familia `segment_manifest_*`, `translated_segments` y `tts_pending_*` define un pipeline para segmentar, traducir y sintetizar voz en japones, coreano, portugues y espanol a partir de un SRT.
- Benchmarking de variantes NVFP4 frente a no destiladas: los pares de workflows equivalentes (con y sin NVFP4) permiten comparar calidad y velocidad en el mismo hardware.
- Base para automatizacion en RunningHub: los enlaces de RunningHub de la model card apuntan a ejecuciones hospedadas de estos workflows, utiles para quien no dispone de GPU local.
- Material docente para ensenar ComfyUI: los JSON sirven como ejemplos de grafos complejos con nodos de video, audio y gestion de segmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende enteramente de los checkpoints LTX-2 y LoRAs que el usuario instale, no del repositorio.
- GPU recomendadas: no disponible. Los workflows incluyen variantes NVFP4, orientadas a hardware con soporte de FP4 (tipicamente GPUs Blackwell), pero no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI es el entorno de destino obligatorio; los workflows son JSON nativos de ComfyUI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay modelos comparables en la misma categoria porque este repositorio no es un modelo, sino un conjunto de workflows de ComfyUI. Como referencia cualitativa, otros repositorios de workflows de ComfyUI en Hugging Face comparten la misma naturaleza (JSON sin pesos), pero no se dispone de datos concretos para una comparativa numerica.

## Limitaciones y advertencias

- No contiene pesos de modelo: los workflows fallaran si el entorno no dispone de los checkpoints LTX-2, LoRAs de control de camara y modelos NVFP4 referenciados.
- La model card indica explicitamente que son "workflows de tutorial, no productos empaquetados"; no estan pensados para uso en produccion sin adaptacion.
- El repositorio es una publicacion independiente de AI-KSK y no esta afiliado a los autores de LTX-2 ni a RunningHub; no hay garantia de soporte ni de compatibilidad futura con versiones de ComfyUI.
- Licencia no disponible: no se puede confirmar si los workflows pueden reutilizarse comercialmente; conviene contactar al autor antes de un uso comercial.
- Idiomas: los workflows cubren japones, coreano, portugues y espanol para el pipeline de audio, pero no se declara soporte de otros idiomas.
- Riesgo de alucinacion y sesgos: no aplica al repositorio en si; depende de los modelos LTX-2 referenciados.
- Los enlaces de RunningHub incluyen un codigo de invitacion (`inviteCode=rh-v1111`), lo que sugiere un programa de referidos; conviene tenerlo en cuenta al evaluar los recursos enlazados.
- Fecha de creacion indicada como 2026-11-15, posterior a la fecha actual; puede tratarse de un error de metadatos o de un repositorio programado, lo que anade incertidumbre sobre su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-155-comfyui-workflows
- YouTube (episodio 155): https://youtu.be/DJRhC6IdZVM
- Bilibili (episodio 155): https://www.bilibili.com/video/BV1vfrNBkEHc/
- RunningHub workflow 1: https://www.runninghub.cn/post/2009183975582994433/?inviteCode=rh-v1111
- RunningHub workflow 2: https://www.runninghub.cn/post/2009191002166267905/?inviteCode=rh-v1111
- RunningHub workflow 3: https://www.runninghub.cn/post/2009549891193806850/?inviteCode=rh-v1111
- RunningHub workflow 4: https://www.runninghub.cn/post/2009643822036291585/?inviteCode=rh-v1111
- RunningHub workflow 5: https://www.runninghub.cn/post/2009643815291854849/?inviteCode=rh-v1111
- RunningHub workflow 6: https://www.runninghub.cn/post/2009643807456890881/?inviteCode=rh-v1111
