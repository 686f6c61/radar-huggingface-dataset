# AI-KSK/ksk-video-171-comfyui-workflows

## Resumen

AI-KSK/ksk-video-171-comfyui-workflows no es un modelo de pesos, sino un repositorio de documentación que acompaña a un tutorial en vídeo sobre flujos de trabajo de generación de vídeo con lip-sync en ComfyUI. Concretamente, cubre InfiniteTalk (un método de sincronización labial basado en Wan 2.1), el grafo de talking-head destilado de LTX-2 y un paso de reescalado con FlashVSR V1.1. El repositorio contiene únicamente el README con la tabla de parámetros extraída del JSON del episodio; no incluye pesos, grafos JSON ni imágenes de portada.

El interés técnico reside en la técnica de bucle casi infinito: se renderiza un primer segmento de 81 fotogramas y se realimenta el clip resultante como primer fotograma del segmento siguiente, calculando el número de iteraciones a partir de la duración del audio en milisegundos. Esto permite generar clips de locución de duración arbitraria a partir de una sola imagen y una pista de audio, con una ventana inicial de unos 3,24 segundos a 25 fps.

El repositorio tiene 0 descargas y 0 likes, sin pipeline definido y con licencia marcada como "other", lo que lo convierte en material de referencia para quien ya trabaje con ComfyUI más que en un artefacto distribuible. Su valor está en la tabla de parámetros verificados del grafo (cargadores UNET/CLIP/VAE, LoRAs y sus pesos) y en la documentación explícita de los límites del método.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de flujos de trabajo para ComfyUI; los grafos usan LTX-2 y Wan 2.1 / SkyReels V3) |
| Parametros totales | No disponible para el repositorio; el UNET de LTX-2 referenciado es de 19B (`ltx-2-19b-distilled-fp8_transformer_only.safetensors`) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | fp8 (UNET LTX-2 y CLIP umt5_xxl en fp8_e4m3fn_scaled), bf16 (VAE LTX2, embeddings connector, LoRAs), pth (VAE Wan2.1) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | No aplica al repositorio (0,0 GB, sin pesos); los flujos referencian safetensors y pth |

## Arquitectura y entrenamiento

El repositorio no entrena ni distribuye un modelo. Documenta cuatro grafos de ComfyUI. El grafo de LTX-2 destilado para lip-sync tiene 106 nodos y usa el transformer LTX-2 de 19B en fp8, doble CLIP con Gemma 3 12B IT en fp8 escalado más el conector de embeddings destilado en bf16, VAE de vídeo LTX2 en bf16, latente de 768x512 con 241 fotogramas y batch 1, y tres LoRAs: dos destiladas con rango dinámico promedio 175 a peso 0,6 y una de control de cámara estática a peso 1.

Los grafos de InfiniteTalk (68 nodos en modo individual, 65 en modo dual) usan SkyReelsV3-A2V en fp8 escalado o Wan 2.1 I2V 720p en fp8, CLIP umt5_xxl en fp8, VAE Wan2.1 y un scheduler básico de 4 pasos con denoise 1. Se aplican dos LoRAs de destilación de pocos pasos: lightx2v I2V 14B 480p (rank 64, bf16) a peso 1 y Wan 2.1 T2V 14B 720p rCM (rank 94, bf16) a peso 0,3. El grafo de FlashVSR V1.1 es puramente de procesado, con 4 nodos (`FlashVSRNode`, `VHS_LoadVideo`, `VHS_VideoCombine`, `LayerUtility: ImageScaleByAspectRatio V2`) y sin cadena de muestreo UNET/CLIP/VAE.

La innovación metodológica es el bucle de realimentación de fotogramas, no un cambio en los modelos base: se reutiliza el clip renderizado como primer fotograma del siguiente segmento y se deriva el recuento de iteraciones de la longitud del audio. El modo dual pinta dos máscaras sobre una sola imagen para alternar líneas entre dos personajes, con reescalado posterior mediante FlashVSR.

## Capacidades

- Generación de vídeo de talking-head con sincronización labial a partir de una imagen y una pista de audio.
- Extensión de duración casi infinita mediante bucle de realimentación de fotogramas (iteraciones calculadas desde los milisegundos de audio).
- Modo dual: dos personajes en una sola imagen con dos audios y dos máscaras pintadas, alternando líneas.
- Control de cámara estático mediante LoRA dedicada en el grafo de LTX-2 destilado.
- Reescalado y mejora de detalle con FlashVSR V1.1 sobre el vídeo generado.
- Muestreo acelerado con destilación de pocos pasos (4 pasos en los grafos de InfiniteTalk).
- Sin soporte documentado de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de imagen y audio de entrada.

## Casos de uso

- Presentadores virtuales de formato corto: cargar un retrato y una locución, fijar segundo de inicio y longitud de audio, y generar un clip inicial de 81 fotogramas a 25 fps como primer bloque de una pieza mayor.
- Vídeos de formación de duración larga con un solo actor: encadenar el bucle realimentando cada clip como primer fotograma del siguiente para cubrir guiones de varios minutos sin volver a cargar la imagen.
- Diálogos entre dos personajes desde una única ilustración: usar el grafo dual con dos audios y dos máscaras para alternar intervenciones, útil en narrativa corta o doblaje de viñetas.
- Doblaje y localización de clips existentes: sustituir la pista de audio de una toma de talking-head manteniendo la imagen de origen como referencia.
- Reelaboración de material rodado o generado: pasar el resultado por el grafo FlashVSR V1.1 para corregir la blandura del 480p antes de publicar.
- Prototipado rápido de escenas de cámara fija: el grafo LTX-2 destilado con la LoRA de control de cámara estática permite iterar tamaño y número de fotogramas sin mover la composición.
- Pruebas de concepto en estudios pequeños: al no requerir pesos propios, se apoya en modelos Wan 2.1, LTX-2 y SkyReels ya disponibles en el ecosistema ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible; la estimación queda condicionada por los modelos base referenciados (LTX-2 19B en fp8, Wan 2.1 I2V 14B en fp8, SkyReelsV3 en fp8) y por el VAE y los LoRAs en bf16.
- GPU recomendadas: no disponible en la información; por el tamaño de los UNET en fp8, el rango de trabajo habitual sería hardware profesional (A100, H100) o GPUs de consumo de gama alta, sin confirmación del autor.
- No hay confirmación de que quepa en GPU de consumo concreta.
- Despliegue: ComfyUI nativo (el propio README indica que ComfyUI soporta InfiniteTalk de forma nativa, con mejor rendimiento que la implementación previa de KJ). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de flujo.
- Latencia y throughput: no disponible. El autor reporta entre 500 y 600 fotogramas por ejecución bajo la optimización actual de ComfyUI, y aclara que no es un límite duro.

## Comparativa con modelos similares

| Aspecto | InfiniteTalk (via ComfyUI nativo, grafo de este repo) | Implementación previa de KJ | LTX-2 destilado (grafo de este repo) |
|---|---|---|---|
| Base | Wan 2.1 | Wan 2.1 | LTX-2 19B |
| Tipo de salida | Lip-sync individual y dual con bucle casi infinito | Lip-sync | Talking-head destilado con control de cámara |
| Rendimiento declarado | Más rápido y mejor que KJ, con degradación leve en planos de dos personas | Base de comparación | No disponible |
| Pasos de muestreo | 4 | No disponible | No disponible |
| Licencia | other | No disponible | other |
| Disponibilidad | Grafo en la release del episodio y en RunningHub; sin JSON en el repo | No disponible | Grafo en la release del episodio y en RunningHub; sin pesos en el repo |

## Limitaciones y advertencias

- Los 25 fps están fijados por la aritmética de 81 fotogramas / 3,24 s; cambiarlos rompe el cálculo del número de iteraciones del bucle.
- La salida de dos personas es secuencial, no un diálogo multi-turno real; el propio autor lo señala.
- El 480p resulta blando; sin una pasada de reescalado (FlashVSR) el resultado se ve poco nítido.
- El bucle extiende la duración, no la expresividad: la deriva se acumula con las iteraciones.
- Los 500-600 fotogramas por ejecución son un reporte del autor bajo la optimización actual de ComfyUI, no un límite documentado.
- El repositorio no contiene pesos ni JSON de los grafos; estos se distribuyen a través de la release del episodio y de páginas de RunningHub, lo que limita la reproducibilidad directa.
- Licencia "other" sin texto de licencia en la información disponible: verificar condiciones antes de cualquier uso comercial.
- El repositorio está etiquetado únicamente en inglés; no hay documentación en castellano.
- Cero descargas y cero likes: sin validación comunitaria del contenido en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-171-comfyui-workflows
- RunningHub - FlashVSR V1.1放大: https://www.runninghub.ai/post/2018310765513547778/?inviteCode=rh-v1111
- RunningHub - Ltx 2蒸馏对口型: https://www.runninghub.ai/post/2018224320958439425/?inviteCode=rh-v1111
- RunningHub - 单人InfiniteTalk无限时长原生循环: https://www.runninghub.ai/post/2018256491320451073/?inviteCode=rh-v1111
- RunningHub - 双人InfiniteTalk无限时长原生循环: https://www.runninghub.ai/post/2018267797146570753/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=OjsHOyPtF0s
- Original en Bilibili: https://www.bilibili.com/video/BV1mwFLzTELL
