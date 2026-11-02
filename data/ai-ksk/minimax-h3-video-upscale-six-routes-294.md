# AI-KSK/minimax-h3-video-upscale-six-routes-294

## Resumen

`AI-KSK/minimax-h3-video-upscale-six-routes-294` no es un modelo de pesos, sino un paquete de seis grafos de ComfyUI exportados para reescalado y repintado generativo de video. Cinco de las rutas emplean la familia MiniMax H3 (condicionamiento por primer/último fotograma, FL2VA, y por múltiples referencias, Ref2VA, en variantes de dos y tres etapas), y la sexta es un detailer V2V basado en LTX 2.5. El paquete se distribuye como JSON de flujos de trabajo más un manifiesto SHA256 y unas imágenes de portada, sin incluir pesos, LoRAs, CLIP, VAE ni upscalers.

El repositorio tiene un tamaño de 0,0 GB y, según la propia model card, no se ejecutó ninguna inferencia para publicarlo: no hay render de muestra, ni cifras de tiempo, ni consumo de VRAM, ni afirmaciones de calidad. Se trata, por tanto, de material de referencia de flujos de trabajo, no de un artefacto listo para producción. El autor reconoce además que varios grafos conservan notas internas que referencian MarkDKBerry.com, lo que indica que el material deriva de flujos públicos de terceros adaptados.

La relevancia es acotada: sirve a quien ya disponga del stack MiniMax H3 o LTX 2.5 en ComfyUI y quiera una plantilla de partida para pipelines de superresolución generativa por etapas. No aporta pesos nuevos ni resultados reproducibles por sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete contiene grafos de ComfyUI, no pesos; las rutas H3 usan un VAE de video `minimax_h3_video_vae_int8_convrot`, un VAE de audio `minimax_h3_audio_vae_fp32` y un CLIP `qwen3vl_32b_minimax_h3_nvfp4_awq`; la ruta LTX 2.5 usa un transformer destilado de 22B) |
| Parametros totales | no disponible para los modelos H3; LTX 2.5 referenciado como `ltx-2.5-22b-distilled-transformer-bf16` (22B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los grafos usan condicionamiento de 124 fotogramas a 1344x768 en varias rutas) |
| Tipos de cuantizacion | no disponible como modelo; se referencian artefactos int8 (`minimax_h3_video_vae_int8_convrot`), fp32 (VAE de audio), nvfp4/awq (CLIP) y bf16 (LoRAs y transformer LTX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no se incluyen pesos; los flujos son JSON de ComfyUI y el manifiesto es `SHA256SUMS.json` |

## Arquitectura y entrenamiento

El paquete no entrena ni publica ningún modelo. Lo que distribuye son exportaciones de grafos de ComfyUI con la topología de nodos y los valores de los widgets guardados. Las rutas MiniMax H3 se estructuran en pases encadenados: un primer pase a 8 pasos con CFG 1, scheduler beta y denoise 1 con sigma shift 6/3, seguido de un upscale en espacio de píxeles mediante RTX y un segundo pase a 4 pasos con denoise 0,65 y shift 12/3 ejecutado a la resolución ya ampliada. La variante de tres etapas añade un segundo upscale RTX ×1,5 y un tercer pase de 4 pasos. Las rutas FL2VA usan LoRAs turbo (`minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16` en el pase 1 y `minimax_h3_fl2v_turbo_4step_v1_768p_comfyui_bf16` en los pases 2 y 3), mientras que las Ref2VA incorporan además LoRAs `minimax_h3_ref2v_turbo_4step_*` y una LoRA de referencia de rango 256.

La ruta LTX 2.5 es un detailer V2V que combina `LTXVLoopingSampler`, `KSamplerSelect` con euler, `ManualSigmas`, `CFGGuider`, un encode VAE por tiles y un decode `LTXVSpatioTemporalTiledVAEDecode`, con salida a 30 fps. El grafo incluye una inconsistencia documentada: la nota Markdown nombra una IC-LoRA distinta (`ltx-2.3-22b-ic-lora-instant-shave-0.9`) de la que carga el nodo (`ltx-2-19b-ic-lora-detailer`), y el autor indica que prevalece el estado guardado del nodo. No hay información sobre datasets, número de tokens ni procesos de RLHF o DPO, porque el paquete no entrena modelos.

## Capacidades

- Re escalado generativo de video: los grafos están diseñados para llevar un video existente a mayor resolución añadiendo detalle generado, no mediante un simple remuestreo.
- Condicionamiento por primer y último fotograma (FL2VA): la ruta 03 carga imágenes de primer y último frame y las usa como condición de `ImageToVideo` a 1344x768 y 124 fotogramas.
- Condicionamiento por múltiples referencias (Ref2VA): las rutas 04 y 05 incluyen cinco y seis slots de imagen respectivamente, con dos o tres condicionadores `MiniMaxH3ReferenceToVideo`.
- Repintado en varias etapas: patrón de dos y tres pases con upscale intermedio ×1,5 y reacondicionamiento a la resolución real ampliada.
- Detailer V2V con LTX 2.5: flujo de encode/decode VAE por tiles espacio-temporales y salida a 30 fps.
- Ruta universal de un solo pase: la ruta 06 toma un video de 0 a 5 s a 24 fps, aplica escala RTX, condiciona con `ImageToVideo` e inyecta el latente del video con `H3InjectVideoLatent` antes de un único `SamplerCustomAdvanced`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Restauración de material de archivo a mayor resolución: la ruta 01 (LTX 2.5 V2V) permite tomar un video existente, escalarlo con RTX y regenerar detalle mediante el sampler con sigmas manuales, útil para footage antiguo donde el remuestreo clásico deja artefactos.
- Interpolación y cierre de secuencias con primer y último fotograma: la ruta 03, con carga de first-frame y last-frame a 1344x768 y 124 fotogramas, sirve para generar transiciones coherentes entre dos imágenes dadas.
- Repintado con consistencia de personaje o producto: las rutas 04 y 05, con cinco y seis slots de referencia y condicionadores Ref2VA, permiten mantener la identidad visual de un sujeto a lo largo de la secuencia ampliada.
- Producción de clips verticales 9:16: la ruta 02 fija `ResolutionSelector` en 9:16 a 0,3 MP con duración de 10 s y prefijo de salida `MH3_FL2VA_3Pass_`, adecuada para formatos de redes sociales.
- Ampliación progresiva a 2K en tres etapas: las rutas 02 y 04 encadenan dos upscales RTX ×1,5 y tres pases de muestreo, pensadas para obtener un master de mayor resolución a partir de un render de baja resolución.
- Prototipado rápido de un solo pase: la ruta 06, con 26 nodos y 34 enlaces, ofrece un flujo mínimo para validar la cadena H3 antes de invertir en los grafos de 72 o 75 nodos.
- Base para adaptar flujos de terceros: al conservar las notas originales y el manifiesto SHA256, el paquete sirve como referencia reproducible para comparar variantes de dos y tres etapas sobre el mismo episodio (294).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutó inferencia para este paquete y que no hay render, tiempos, cifras de VRAM ni afirmaciones de calidad.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica cifras de consumo para ninguna de las seis rutas.
- GPU recomendadas: no disponible. Los grafos mencionan un nodo de upscale etiquetado como RTX, pero no se especifica modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI es el único entorno contemplado, ya que los artefactos son grafos JSON exportados desde ese programa.
- Dependencias declaradas para las rutas H3: VAE de video `minimax_h3_video_vae_int8_convrot.safetensors`, VAE de audio `minimax_h3_audio_vae_fp32.safetensors`, CLIP `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` (tipo minimax) y las LoRAs turbo FL2V y Ref2V citadas. Para la ruta LTX 2.5: `ltx-2.5-22b-distilled-transformer-bf16.safetensors`, CLIP `gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` (tipo ltxv), VAE `ltx-2.5-video-vae-conv-bf16.safetensors` y la LoRA `ltx-2-19b-ic-lora-detailer.safetensors`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Paquete | Tipo de artefacto | Rutas incluidas | Pesos incluidos | Licencia | Inferencia documentada |
|---|---|---|---|---|---|
| AI-KSK/minimax-h3-video-upscale-six-routes-294 | Grafos ComfyUI (JSON) + manifiesto SHA256 | 6 (5 H3, 1 LTX 2.5) | No | no disponible | No |
| Flujos públicos originales de MarkDKBerry.com | Flujos de trabajo (referenciados en las notas) | no disponible | no disponible | no disponible | no disponible |
| MiniMax H3 (modelo base) | Pesos del modelo | no aplica | Sí (no incluidos aquí) | no disponible | no disponible |
| LTX 2.5 (modelo base) | Pesos del modelo | no aplica | Sí (no incluidos aquí) | no disponible | no disponible |

No se dispone de datos de rendimiento ni de licencia de las alternativas en la información proporcionada, por lo que la comparación se limita a la naturaleza del artefacto distribuido.

## Limitaciones y advertencias

- El paquete no contiene pesos, LoRAs, CLIP, VAE ni upscalers: sin descargar esos artefactos por separado, los grafos no se pueden ejecutar.
- No se ha ejecutado ninguna inferencia: no hay evidencia de que los flujos funcionen tal como están guardados ni de la calidad del resultado.
- Inconsistencia en el nodo de upscale RTX: el título indica ×1,5 en varios archivos mientras el widget guardado es 2,0; hay que verificar el multiplicador antes de encolar.
- Título de scheduler obsoleto en el archivo 03: el pase 2 aparece titulado «8 steps / denoise 0.30» pero los widgets guardados son 4 pasos y 0,65; el autor recomienda atenerse a los widgets.
- Inconsistencia en la LoRA de la ruta LTX 2.5: la nota Markdown y el nodo cargador nombran LoRAs distintas; prevalece el estado guardado del nodo.
- Atribución a terceros: varias notas internas referencian MarkDKBerry.com (YouTube/Patreon) y el autor no reclama ser la fuente original, lo que puede afectar a la trazabilidad y a las condiciones de reutilización.
- Licencia no especificada: no hay información sobre uso comercial, y las licencias de los modelos base y LoRAs referenciados tampoco se detallan.
- Idiomas no declarados: las rutas H3 usan un CLIP basado en Qwen3-VL de 32B, pero el paquete no documenta capacidades multilingües ni de texto en video.
- Ausencia total de métricas de rendimiento, VRAM y latencia impide planificar despliegues en producción con estos grafos.
- Riesgo de alucinación visual: al ser re escalado generativo, los pases de muestreo pueden inventar detalle inexistente en el video original; el paquete no incluye evaluación alguna de fidelidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/minimax-h3-video-upscale-six-routes-294
- MarkDKBerry.com (referenciado en las notas internas de los grafos): no se proporciona URL directa en la información disponible.
- Documentación de ComfyUI: no disponible en la información proporcionada.
- Pesos de MiniMax H3 y LTX 2.5: no se incluyen enlaces en la información disponible.
