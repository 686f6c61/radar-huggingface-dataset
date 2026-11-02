# AI-KSK/minimax-h3-ten-official-workflows-288

## Resumen

`AI-KSK/minimax-h3-ten-official-workflows-288` no es un modelo de pesos, sino un paquete de diez grafos de ComfyUI exportados para el stack de vídeo omni-modal MiniMax H3. Los flujos cubren cuatro rutas de condicionamiento por fotogramas (texto a vídeo, primer fotograma, último fotograma y primer-y-último fotograma) y seis variantes de referencia a vídeo (R2V-01 a R2V-06) que combinan imágenes, clips de vídeo y pistas de audio como material de referencia.

El paquete lo publica el usuario AI-KSK y se presenta explícitamente como una recopilación de exportaciones, no como el modelo original ni como una plantilla oficial. El autor advierte que no se ha ejecutado ninguna inferencia para este paquete: no hay renders, ni mediciones de tiempo, ni cifras de VRAM, ni afirmaciones de calidad. Los pesos de H3, el codificador de texto, los VAE y los medios de entrada no están incluidos.

Su relevancia es práctica: sirve como referencia reproducible de cableado de nodos para quien ya tenga el stack MiniMax H3 en ComfyUI y quiera replicar rutas de condicionamiento concretas con parámetros de muestreo fijos (res_multistep, 20 pasos, denoise 1). El repositorio ocupa 0.0 GB y contiene únicamente los JSON de los flujos, diez portadas promocionales y un manifiesto SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete contiene grafos de ComfyUI para el stack MiniMax H3; no incluye pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los grafos referencian `minimax_h3_fl2va_bf16.safetensors` y `qwen3vl_32b_minimax_h3_int8_convrot.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica: el repo contiene JSON de flujos de ComfyUI, imágenes de portada y `SHA256SUMS.json`; los pesos referenciados son safetensors |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento del modelo subyacente MiniMax H3 en la información proporcionada. Lo que sí se detalla es la topología de los grafos: todos comparten `UNETLoader` con `minimax_h3_fl2va_bf16.safetensors`, `CLIPLoader` con `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` (tipo `minimax`), y dos `VAELoader`, uno de vídeo (`minimax_h3_video_vae_fp16.safetensors`) y otro de audio (`minimax_h3_audio_vae_fp32.safetensors`). Ninguno de los diez grafos contiene nodos LoRA.

El muestreo es idéntico en los diez flujos: `KSamplerSelect` con `res_multistep`, `BasicScheduler` en modo `simple`, 20 pasos, denoise 1, orquestado mediante `SamplerCustomAdvanced`. El condicionamiento se realiza con `MiniMaxH3ImageToVideo` en las rutas de fotogramas (01–04) y con `MiniMaxH3ReferenceToVideo` en las rutas de referencia (05–10), este último guardado a 1344x768, 124 y `match`. Todas las salidas se escriben con `SaveVideo` bajo el prefijo `video/MiniMax_H3`.

Los flujos de fotogramas incluyen: último fotograma (48 nodos / 56 enlaces, dos ramas paralelas de 10 s y 5 s a 9:16 y 0,8 MP), texto a vídeo (23 / 24, 10 s a 16:9 y 0,8 MP, sin entrada de imagen), primer-y-último fotograma (27 / 32, dos `LoadImage`, 10 s a 16:9 y 0,8 MP) y primer fotograma (25 / 28, un `LoadImage`, 10 s a 9:16 y 0,8 MP). Los flujos de referencia van de 34 a 37 nodos y de 43 a 47 enlaces, con resoluciones de 16:9 a 0,4 MP (05 y 06) o 9:16 a 0,4 MP (07–10) y duraciones de 4, 5 o 10 s según la variante.

## Capacidades

- Generación de vídeo a partir de texto (T2V) sin entrada de imagen, con resolución 16:9 a 0,8 MP y 10 s de duración.
- Generación de vídeo condicionada por primer fotograma, por último fotograma o por ambos simultáneamente, útil para fijar el inicio, el final o la transición entre dos estados visuales.
- Referencia a vídeo multi-imagen (R2V-01): cuatro ranuras `LoadImage` más una pista de audio recortada con `TrimAudioDuration`.
- Referencia a vídeo puro (R2V-02): clip de referencia obtenido mediante `LoadVideo`, `Video Slice` y `GetVideoComponents`.
- Referencia de personaje más vídeo de movimiento (R2V-03), con imágenes de personaje, clip de movimiento y audio.
- Referencia de personaje más audio independiente (R2V-04), sin vídeo de referencia; marcado como local-only.
- Referencia de personaje más vídeo con su pista de audio emparejada (R2V-05).
- Referencia de personaje más vídeo de movimiento con una nueva pista de audio que sustituye a la original (R2V-06).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.

## Casos de uso

- Reconstrucción de la canalización de vídeo en ComfyUI: importar los JSON y sustituir únicamente las rutas de los safetensors y los medios de entrada para obtener un grafo funcional con parámetros de muestreo ya fijados (res_multistep, 20 pasos, denoise 1).
- Interpolación entre dos fotogramas fijos: el flujo 03 (primer-y-último fotograma) permite generar la transición entre un estado inicial y uno final conocidos, útil en animación de producto o viñetas publicitarias.
- Extensión hacia atrás desde un fotograma final: el flujo 01 (último fotograma) está pensado para cuando el destino está fijado y el modelo debe inventar el desarrollo previo, por ejemplo para cerrar un plano concreto de un montaje.
- Vídeo con personaje consistente: los flujos 07 y 10 permiten mantener la identidad de un personaje a partir de imágenes de referencia mientras se transfiere el movimiento de un clip separado, aplicable a doblaje visual o sustitución de actor en prototipos.
- Sincronización y sustitución de audio: los flujos 08, 09 y 10 permiten trabajar con audio independiente o con la pista emparejada del vídeo de referencia, útiles para localización de contenido o para reemplazar la banda sonora sin rehacer el movimiento.
- Base para pruebas comparativas de rutas de condicionamiento: al compartir todos los grafos el mismo sampler, scheduler y número de pasos, sirven para aislar el efecto de la ruta de condicionamiento (texto, fotograma o referencia) manteniendo el resto de variables constante.
- Punto de partida para automatización en RunningHub o Civitai: nueve de los diez flujos tienen página pública en esas plataformas, lo que permite comparar el comportamiento del grafo exportado con el render alojado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó inferencia para este paquete y que no hay cifras de render, tiempos, VRAM ni afirmaciones de calidad.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no proporciona cifra alguna de VRAM para este paquete.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar si el stack H3 cabe en tarjetas consumer.
- Opciones de despliegue: ComfyUI es el único entorno documentado, dado que los artefactos son grafos nativos de ComfyUI con nodos `UNETLoader`, `CLIPLoader`, `VAELoader`, `MiniMaxH3ImageToVideo`, `MiniMaxH3ReferenceToVideo`, `SamplerCustomAdvanced` y `SaveVideo`.
- Alternativas de despliegue como vLLM, llama.cpp, Ollama o TGI: no disponibles para este stack según la información proporcionada.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0.0 GB; los pesos y VAE referenciados no están incluidos y deben obtenerse por separado desde Comfy-Org/MiniMax-H3.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo subyacente que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete no contiene pesos, codificador de texto, VAE ni medios de entrada; sin esos archivos los grafos no se pueden ejecutar.
- No se ha ejecutado ninguna inferencia: no hay evidencia de que los flujos produzcan resultados correctos tal y como están guardados.
- El flujo 08 (R2V-04) es local-only y no tiene página pública en RunningHub; no se debe asumir paridad con el resto.
- La licencia no está disponible, lo que impide confirmar si el uso comercial es posible; hay que verificar la licencia del modelo MiniMax H3 original por separado.
- El autor no reclama la autoría de las plantillas originales; los enlaces a Comfy-Org/MiniMax-H3 y al blog de MiniMax se conservan en las notas de los grafos.
- Los flujos incluyen rutas y nombres de archivo en chino; pueden requerir normalización en sistemas con codificación distinta.
- Algunos flujos guardan dos ramas en un mismo archivo (por ejemplo, el 01 con 10 s y 5 s), lo que puede confundir si se importa sin revisar los nodos de salida.
- No hay información sobre sesgos, riesgo de alucinación visual, limitaciones idiomáticas ni comportamiento en producción del modelo subyacente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/minimax-h3-ten-official-workflows-288
- Flujo 01, último fotograma (RunningHub internacional): https://www.runninghub.ai/zh-cn/post/2084544642758037506?inviteCode=rh-v1111
- Flujo 01, último fotograma (RunningHub China): https://www.runninghub.cn/post/2084544642758037506/?inviteCode=rh-v1111
- Flujo 01, último fotograma (Civitai): https://civitai.com/models/3033405
- Flujo 02, texto a vídeo (RunningHub internacional): https://www.runninghub.ai/zh-cn/post/2084544656423088130?inviteCode=rh-v1111
- Flujo 02, texto a vídeo (RunningHub China): https://www.runninghub.cn/post/2084544656423088130/?inviteCode=rh-v1111
- Flujo 02, texto a vídeo (Civitai): https://civitai.com/models/3033407
- Flujo 03, primer-y-último fotograma (RunningHub internacional): https://www.runninghub.ai/zh-cn/post/2084850865038520322?inviteCode=rh-v1111
- Flujo 03, primer-y-último fotograma (RunningHub China): https://www.runninghub.cn/post/2084850865038520322/?inviteCode=rh-v1111
- Flujo 03, primer-y-último fotograma (Civitai): https://civitai.com/models/3033409
- Flujo 04, primer fotograma (RunningHub internacional): https://www.runninghub.ai/zh-cn/post/2084850825154875394?inviteCode=rh-v1111
- Flujo 04, primer fotograma (RunningHub China): https://www.runninghub.cn/post/2084850825154875394/?inviteCode=rh-v1111
- Flujo 04, primer fotograma (Civitai): https://civitai.com/models/3033412
- Flujo 05, R2V-01 multi-imagen (RunningHub internacional): https://www.runninghub.ai/zh-cn/post/2084544634998575105?inviteCode=rh-v1111
- Flujo 05, R2V-01 multi-imagen (RunningHub China): https://www.runninghub.cn/post/2084544634998575105/?inviteCode=rh-v1111
- Flujo 05, R2V-01 multi-imagen (Civitai): https://civitai.com/models/3033414
- Flujo 06, R2V-02 vídeo de referencia (RunningHub internacional): https://www.runninghub.ai/zh-cn/post/2084850819463208962?inviteCode=rh-v1111
- Flujo 06, R2V-02 vídeo de referencia (RunningHub China): https://www.runninghub.cn/post/2084850819463208962/?inviteCode=rh-v1111
- Modelos oficiales Comfy-Org/MiniMax-H3 y blog de MiniMax H3: enlazados en las notas Markdown de los propios grafos, no reproducidos aquí porque la información proporcionada no incluye las URL completas.
