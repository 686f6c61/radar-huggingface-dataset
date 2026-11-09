# AI-KSK/ksk-video-205-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-205-comfyui-workflows` no es un modelo de pesos, sino un repositorio de flujos de trabajo (workflows) para ComfyUI publicados por el usuario AI-KSK. En concreto, contiene las notas y el grafo JSON de una pipeline de generacion de video a partir de imagen (image-to-video) basada en el modelo LTX 2.3, con un esquema de muestreo en tres etapas que reaplica el condicionamiento de imagen despues de cada upscale latente. El objetivo declarado es mantener la identidad del sujeto hasta el final de un clip de diez segundos.

El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y su unico contenido es un `README.md` con notas de tutorial. No incluye pesos, checkpoints ni ficheros de modelo: el checkpoint `ltx-2.3-22b-dev.safetensors`, el LoRA de destilacion y el upscaler espacial se referencian como dependencias externas que el usuario debe aportar.

Por tanto, esta ficha documenta un artefacto de orquestacion (un grafo de ComfyUI) y no un modelo entrenado. La relevancia es practica para quien quiera reproducir una pipeline de image-to-video con coherencia de identidad y audio sincronizado sobre LTX 2.3, no como modelo evaluable de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un workflow de ComfyUI; el modelo subyacente es LTX 2.3, arquitectura no detallada en la informacion) |
| Parametros totales | no disponible para el workflow; el checkpoint referenciado se denomina `ltx-2.3-22b-dev.safetensors` (22B segun el nombre del fichero) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el workflow referencia un checkpoint `.safetensors` sin especificar precision) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no aplica: el repositorio contiene un `README.md` y el grafo JSON de ComfyUI; los pesos son externos (`.safetensors`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Lo que describe es una pipeline de inferencia en ComfyUI con 145 nodos construida sobre LTX 2.3. El esquema de muestreo es de tres pasadas: la primera usa `euler_ancestral_cfg_pp` con CFG 1 y una cadena de nueve valores sigma, y construye el movimiento sobre un latente de imagen de baja resolucion junto con un latente de audio correspondiente. Las pasadas segunda y tercera usan `euler_cfg_pp` con CFG 1 y la cadena de sigmas `0.85, 0.7250, 0.4219, 0.0`.

La innovacion tecnica descrita es el "correct as you upscale": tras cada pasada, el latente audiovisual se separa, el latente de video se duplica y la pareja se vuelve a unir; el nodo de image-to-video aparece en cada pasada y vuelve a referenciar la misma imagen de 1536 aristas. Se aplica un LoRA de destilacion (`distil-384`) con peso 0.5 y un upscaler espacial (`ltx-2.3-spatial-upscaler-x2-1.0.safetensors`, con recomendacion del autor de usar la version 1.1 en local). Los latentes de partida son 320x288x97 y el audio son 97 frames a 25 fps; la salida son 241 frames a 24 fps (diez segundos), con demo a 2048x1024.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF o DPO, porque el repositorio no entrena modelos.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) con condicionamiento de identidad reaplicado en cada etapa de upscale.
- Generacion audiovisual conjunta: latente de video y latente de audio emparejados desde la primera pasada.
- Muestreo en tres etapas con upscale latente intermedio (x2).
- Conmutacion a text-to-video mediante un booleano en el nodo de image-to-video.
- Control del grado de desenfoque de la referencia mediante el valor `18`, que debe reajustarse si se reduce el numero de pasadas.
- Salida de hasta 2048x1024 en la demo y clips de diez segundos (241 frames a 24 fps).
- No soporta ruta de prompt negativo: el autor indica que a CFG 1 aun no hay camino para negative prompt.
- Idioma: ingles (etiqueta `en`).

## Casos de uso

- Reproduccion de la pipeline LTX 2.3 en tres etapas: cargar el grafo JSON en ComfyUI, aportar el checkpoint `ltx-2.3-22b-dev.safetensors`, el LoRA `distil-384` a 0.5 y el upscaler espacial, y generar clips de diez segundos con identidad estable.
- Prototipado de image-to-video con coherencia de personaje: util para animar retratos o productos donde la identidad debe mantenerse hasta el ultimo frame, gracias a la reaplicacion del condicionamiento tras cada upscale.
- Generacion audiovisual sincronizada: la pareja de latentes de video y audio (97 frames a 25 fps) permite producir clips con pista de audio alineada desde la primera pasada.
- Iteracion de parametros de muestreo: sirve como banco de pruebas para comparar cadenas de sigma y schedulers (`euler_ancestral_cfg_pp` frente a `euler_cfg_pp`) en un grafo de 145 nodos.
- Base para reducir el numero de pasadas: el propio autor documenta que el valor `18` de desenfoque debe reajustarse si se baja el numero de etapas, lo que convierte el workflow en punto de partida para variantes de dos pasadas.
- Material docente: las notas del README explican la mecanica de separacion, duplicado y reunion de latentes, utiles para quien aprenda a construir grafos audiovisuales en ComfyUI.
- Conversion a text-to-video: el booleano del nodo de image-to-video permite reutilizar el mismo grafo sin imagen de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El checkpoint referenciado es de 22B parametros segun su nombre de fichero, lo que en `.safetensors` sin cuantizar implicaria un footprint elevado, pero no se aportan cifras.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (entorno nativo del workflow). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una pipeline de difusion de video.
- Latencia y throughput: no disponibles. La salida de referencia es de 241 frames a 24 fps (diez segundos) a 2048x1024, sin tiempos medidos.

## Comparativa con modelos similares

| Aspecto | Este repositorio (workflow LTX 2.3) | Alternativas |
|---|---|---|
| Tipo de artefacto | Grafo ComfyUI de 145 nodos + notas | no disponible |
| Parametros | no disponible (checkpoint referenciado de 22B) | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | other | no disponible |
| Disponibilidad | Repositorio en Hugging Face con 0 descargas; pesos externos | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni checkpoints: solo un `README.md`. Sin el checkpoint LTX 2.3, el LoRA y el upscaler externos, el workflow no es funcional.
- No hay ruta de prompt negativo a CFG 1, segun el propio autor.
- El JSON referencia el upscaler 1.0 mientras el autor recomienda 1.1 en local: posible inconsistencia entre el grafo publicado y la configuracion recomendada.
- El valor `18` de desenfoque de la referencia debe reajustarse si se reduce el numero de pasadas; de lo contrario la salida se vuelve mas estatica.
- El grafo tiene 145 nodos porque duplica tres ensamblajes de muestreo, lo que complica su mantenimiento y edicion.
- Licencia `other`: no se detallan terminos de uso comercial. Verificar la licencia del checkpoint LTX 2.3 y del upscaler por separado antes de un uso en produccion.
- Idioma documentado: solo ingles.
- Sin descargas ni likes ni benchmarks: no hay evidencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no evaluables, al no ser un modelo de lenguaje con pesos publicados en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-205-comfyui-workflows
- RunningHub: https://www.runninghub.ai/post/2033775150256103426/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=wzYUP2QeM6o
- Bilibili: https://www.bilibili.com/video/BV1t9woz8Ev5
