# AI-KSK/ksk-video-251-comfyui-workflows

## Resumen

AI-KSK/ksk-video-251-comfyui-workflows es un repositorio de flujos de trabajo (workflows) para ComfyUI orientados a la generacion de avatares digitales guiados por audio, construidos sobre el modelo LongCat Avatar 1.5. No se trata de un modelo de pesos en si, sino de un paquete de grafos JSON que orquestan la inferencia de un modelo de difusion de video (LongCat-Avatar-15_bf16) combinado con el VAE de Wan2.1 y el codificador de texto umt5-xxl. El repositorio lo publica el usuario AI-KSK y su tamano es de 0.0 GB, es decir, no contiene pesos descargables: solo la documentacion y los grafos.

El problema que resuelve es la orquestacion practica de un pipeline de digital human: sincronizar audio con video, mantener continuidad entre segmentos mediante bucles (loop continuation) y permitir cortes entre multiples imagenes de referencia. Incluye dos grafos: uno de 210 nodos para bucle de imagen unica y otro de 197 nodos para cortes multi-imagen, con salida a 720p, 25 fps y segmentos de 93 frames iniciales mas 80 por bucle con 13 frames de solapamiento (1 en modo corte).

Es relevante ahora porque empaqueta en un unico grafo conmutado capacidades que normalmente requieren ensamblar varios pipelines: audio drive, continuacion en bucle y conmutacion multi-imagen a 720p. La informacion disponible es escasa en cuanto a especificaciones del modelo subyacente, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repo contiene grafos ComfyUI; el modelo subyacente es LongCat Avatar 1.5, un modelo de difusion de video con LoRA de destilacion DMD) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card menciona pesos bf16 del modelo base) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | No disponible (el repo solo incluye JSON de workflows y README; no contiene pesos) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo de difusion, solo la configuracion de inferencia. Segun la model card, el pipeline usa `LongCat-Avatar-15_bf16` con el LoRA de destilacion DMD aplicado a 0.9, el VAE de Wan2.1 y el codificador de texto umt5-xxl. La generacion se organiza en segmentos: 93 frames en el primer segmento, 80 frames adicionales por cada bucle y 13 frames de solapamiento entre segmentos (reducido a 1 en modo corte duro), a 25 fps.

No se proporcionan datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). La innovacion destacable del paquete es la logica de grafo conmutado: un unico grafo permite alternar entre modo prompt, modo referencia, bucle activado/desactivado, numero de bucles y modo de corte. El uso de CFG 1 se justifica porque el grafo ya incorpora la destilacion, lo que reduce el coste computacional de la inferencia.

## Capacidades

- Generacion de video de avatares digitales guiados por audio (audio-driven digital humans).
- Continuacion en bucle (loop continuation) para extender la duracion del video manteniendo coherencia entre segmentos mediante solapamiento de frames.
- Conmutacion entre multiples imagenes de referencia con cortes duros (multi-image hard cuts).
- Salida configurable en 720x1280 o 1280x720 (vertical u horizontal) a 25 fps.
- Control mediante interruptores (switch-driven): modo prompt, modo referencia, bucle, numero de bucles y modo de corte.
- Integracion en ComfyUI como grafos importables (210 y 197 nodos respectivamente).
- Idioma de los prompts y de la documentacion: ingles.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general ni audio de entrada distinto del audio de conduccion.

## Casos de uso

- Generacion de presentadores virtuales para video corporativo: se carga un audio de narracion y una imagen de referencia, y el grafo de imagen unica produce un video 720p de un avatar sincronizado con la voz, adecuado para formacion o comunicacion interna.
- Creacion de contenido para redes sociales en formato vertical: la salida 720x1280 a 25 fps encaja con formatos de video corto, y el modo bucle permite alargar la duracion sin regenerar todo el clip.
- Demostraciones de producto con multiples angulos: el grafo multi-imagen con cortes duros permite alternar entre varias imagenes de referencia del mismo sujeto u objeto, util para tutoriales o catalogos.
- Prototipado de asistentes conversacionales con cara: combinando audio TTS con el modo audio drive se puede validar rapidamente la percepcion de un agente con avatar antes de invertir en produccion.
- Investigacion en sincronizacion audio-video: los grafos documentados y los parametros de segmentacion (93/+80/13 frames) sirven como base reproducible para experimentos de continuidad temporal.
- Iteracion rapida en estudios de animacion: el uso de CFG 1 y la destilacion DMD reducen el coste por iteracion, lo que facilita explorar variaciones de prompt y referencia en un solo grafo.
- Publicacion de demos interactivas: los enlaces a RunningHub permiten ejecutar los grafos en la nube sin infraestructura local, util para mostrar resultados a clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo base se distribuye en bf16 y usa umt5-xxl como codificador de texto, lo que en la practica implica requisitos elevados, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: ComfyUI (importacion de los grafos JSON); ejecucion en la nube mediante RunningHub segun los enlaces de la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusion de video de este tipo).
- Latencia y throughput: no disponible. Solo se conocen parametros de salida: 25 fps, 93 frames iniciales y 80 por bucle.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un paquete de workflows y documentacion; requiere disponer por separado de LongCat Avatar 1.5, el LoRA DMD, el VAE de Wan2.1 y umt5-xxl.
- La licencia es "other" y no se detallan sus terminos; es imprescindible revisar las condiciones antes de cualquier uso comercial, especialmente por las licencias del modelo base y sus componentes.
- Idioma limitado al ingles en la documentacion y los prompts.
- La model card advierte de que 720p es el punto donde el pipeline aporta ventaja; a resoluciones menores se pierde esa ventaja.
- El modo de corte duro sacrifica la influencia del latent de referencia en favor de la nitidez del corte, lo que puede degradar la coherencia entre segmentos.
- Los grafos son grandes (210 y 197 nodos) y la mayor parte de los nodos son de anotacion, lo que complica su mantenimiento y edicion.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad; al tratarse de generacion de video sintetico existe riesgo de artefactos y de uso indebido (suplantacion de identidad), que el autor no aborda.
- Sin descargas ni likes en el momento de la consulta y creado y actualizado el mismo dia (2026-11-09), lo que indica un proyecto muy reciente y sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-251-comfyui-workflows
- RunningHub - LongCat Avatar single-image loop: https://www.runninghub.ai/post/2059633182730973185/?inviteCode=rh-v1111
- RunningHub - LongCat Avatar multi-image switching: https://www.runninghub.ai/post/2059604643877056514/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=jTgtq_YCBNU
- Bilibili: https://www.bilibili.com/video/BV1gdG161EYB
