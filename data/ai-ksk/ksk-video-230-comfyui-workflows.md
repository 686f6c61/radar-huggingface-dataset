# AI-KSK/ksk-video-230-comfyui-workflows

## Resumen

AI-KSK/ksk-video-230-comfyui-workflows no es un modelo de lenguaje en sentido estricto, sino un paquete de flujos de trabajo (workflows) para ComfyUI orientado a la generacion de video con LTX 2.3. El repositorio, publicado por el usuario AI-KSK, contiene cinco grafos JSON que implementan dialogos entre dos personajes, generacion de video guiada por audio, eliminacion de subtitulos y una variante en bucle del grafo de reparacion. El objetivo es resolver el problema de mantener la identidad consistente de dos personajes a lo largo de un dialogo, controlando el hablante por segmento mediante un mecanismo denominado Prompt Relay.

El paquete se distribuye como material complementario de un episodio o tutorial, con enlaces a los workflows alojados en RunningHub y a un video explicativo en YouTube (y su version original en Bilibili). No incluye pesos de modelo propios: el tamano del repositorio es de 0,0 GB y la model card describe grafos, nodos y LoRAs, no un checkpoint entrenado. La relevancia actual reside en que documenta una receta concreta para produccion de video con personajes duales sobre LTX 2.3, una de las areas donde la consistencia de identidad y el control por turnos de habla sigue siendo un reto practico.

La licencia declarada es "other" y el unico idioma indicado es el ingles, aunque el contenido de la model card menciona dialogos en chino y problemas de subtitulado en ese idioma. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 2026-11-09.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (paquete de workflows ComfyUI sobre LTX 2.3; no es un modelo con pesos propios) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona una ruta FP8 solo para el transformer en los grafos de reparacion) |
| Idiomas soportados | en (segun metadatos); se mencionan dialogos en chino en las limitaciones |
| Licencia | other |
| Formato de pesos | no disponible (se distribuyen archivos JSON de workflow, no pesos) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni pesos. Se compone de cinco grafos de ComfyUI en formato JSON: dialogo (56 nodos), dialogo guiado por audio (72 nodos), eliminacion de subtitulos (149 nodos), variante en bucle (156 nodos) y Relay director (6 nodos). La arquitectura subyacente es la del modelo de video LTX 2.3, sobre el que se aplican LoRAs con fuerzas especificadas en los propios JSON.

La receta tecnica descrita combina un LoRA de doble personaje a fuerza 0,75 para preservar la identidad, un mecanismo de Prompt Relay para el control del hablante por segmento y un LoRA de transicion para los cortes. Los grafos de reparacion de subtitulos incorporan una ruta separada FP8 solo para el transformer. No se proporcionan datos sobre el dataset de entrenamiento de los LoRAs, el numero de tokens, ni si hubo RLHF o DPO, ya que el autor no los publica en la model card.

## Capacidades

- Generacion de video con dos personajes manteniendo consistencia de identidad mediante LoRA dual a fuerza 0,75.
- Control del hablante por segmento mediante Prompt Relay, con un grafo especifico de direccion (Relay director) que combina trama y prompts de doble LoRA.
- Generacion de dialogo guiada por audio, con un grafo dedicado de 72 nodos.
- Transiciones entre planos mediante un LoRA de transicion especifico para cortes.
- Eliminacion y reparacion de subtitulos sobre metraje existente, con un grafo de referencia y una variante en bucle para clips mas largos.
- Produccion de clips en formato de workflow reutilizable dentro de ComfyUI, con recuento de nodos y nombres de modelo documentados.

## Casos de uso

- Produccion de dialogos entre dos personajes en video corto: el grafo de 56 nodos aplica el LoRA dual a 0,75 y el Prompt Relay para asignar lineas a cada personaje, adecuado para escenas de conversacion con identidades estables.
- Sincronizacion de dialogo con audio existente: el grafo guiado por audio de 72 nodos permite generar el video a partir de una pista de voz, util para doblaje o para animar un guion ya grabado.
- Limpieza de subtitulos incrustados en metraje de baja motion: el grafo de reparacion de 149 nodos elimina subtitulos sobre planos estaticos o de movimiento lento, por ejemplo en material de archivo o entrevistas.
- Procesado de clips largos con subtitulos: la variante en bucle de 156 nodos esta pensada para secuencias que exceden la cobertura del grafo de referencia, segun indica el propio autor.
- Direccion de trama y prompts: el Relay director de 6 nodos permite orquestar la trama y los prompts de los dos LoRAs antes de lanzar los grafos de generacion.
- Creacion de cortes y transiciones entre planos: el LoRA de transicion se emplea para encadenar segmentos de dialogo sin romper la continuidad visual.
- Prototipado de pipelines de video en ComfyUI: los JSON sirven como plantilla para integrar LTX 2.3, LoRAs y nodos de postproceso en flujos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card solo indica que los grafos de reparacion usan una ruta FP8 exclusiva para el transformer, lo que reduce el requisito de memoria frente a precision completa, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI como entorno de ejecucion de los grafos; los workflows tambien estan publicados en RunningHub para ejecucion en la nube.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (paquetes de workflows para generacion de video con personajes duales sobre LTX 2.3), ni datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El grafo de reparacion de subtitulos solo funciona con metraje de bajo movimiento; el autor indica explicitamente que el baloncesto o la accion rapida no se resuelven limpiamente.
- La reparacion de subtitulos se describe como un "0.5", provisional, y el autor remite a la variante en bucle para clips mas largos.
- Los subtitulos aparecen corruptos cuando el dialogo en chino supera aproximadamente los cinco segundos; la alternativa propuesta es acortar los planos.
- El repositorio no contiene pesos de modelo: es un paquete de workflows JSON, por lo que no puede evaluarse como modelo de forma aislada.
- La licencia "other" no especifica condiciones de uso comercial; debe consultarse con el autor antes de un despliegue en produccion.
- El idioma declarado es solo ingles, pese a que la model card menciona material y dialogos en chino.
- Sin descargas ni likes registrados en el momento de la consulta, lo que limita la evidencia de validacion por parte de la comunidad.
- Los enlaces a RunningHub incluyen un codigo de invitacion, lo que puede afectar a la trazabilidad y a las condiciones de uso del servicio.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-230-comfyui-workflows
- Workflow: dialogo de dos personas mejorado: https://www.runninghub.ai/post/2048727968108781570/?inviteCode=rh-v1111
- Workflow: dialogo de dos personas guiado por audio: https://www.runninghub.ai/post/2048727975096487938/?inviteCode=rh-v1111
- Workflow: eliminacion de subtitulos 0.5 (referencia): https://www.runninghub.ai/post/2048741719289630722/?inviteCode=rh-v1111
- Workflow: eliminacion de subtitulos 0.5, variante en bucle: https://www.runninghub.ai/post/2048762397640364034/?inviteCode=rh-v1111
- Workflow: Relay director (trama y director de prompts con doble LoRA): https://www.runninghub.ai/post/2048717560673214466/?inviteCode=rh-v1111
- Tutorial en video (YouTube): https://www.youtube.com/watch?v=-HtqU11ydTo
- Original en chino (Bilibili): https://www.bilibili.com/video/BV1DT9zBbEZu
