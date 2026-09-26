# JoaoZaokk/10Eros-v1.5-W4A8-ConvRot

## Resumen

10Eros-v1.5-W4A8-ConvRot es una cuantización de archivo único para ComfyUI del modelo de difusión image-to-video TenStrip/LTX2.3-10Eros, publicada por el usuario JoaoZaokk. El modelo base es LTX-2.3 de 22B de parámetros e incluye, además del transformer de difusión, un VAE de vídeo, un VAE de audio, un vocoder y una proyección de texto; es decir, genera vídeo y pista de audio de forma conjunta. La relevancia de esta ficha no está en el modelo generativo en sí, que es un derivado, sino en el trabajo de cuantización: reduce un checkpoint de 46.139.886.366 bytes (unos 43 GiB en bf16) a 15,50 GiB (W4A8 puro) o 17,80 GiB (variante mixta con el flujo de audio en INT8), con metadatos de cuantización por capa que ComfyUI interpreta de forma nativa.

El problema que aborda el autor es doble. Por un lado, hacer viable en GPUs de consumo un modelo de difusión vídeo+audio de 22B, mediante cuantización W4A8 asimétrica con ConvRot y codebook en las 1440 lineales del transformer. Por otro, corregir un artefacto concreto: la cuantización a 4 bits del flujo de audio introduce un siseo metálico audible que el original en bf16 no tiene, de modo que la segunda variante recodifica las 864 lineales de audio (audio_attn1, audio_attn2, audio_ff, audio_to_video_attn y video_to_audio_attn en los 48 bloques) a int8_tensorwise, a cambio de 2,4 GB adicionales.

No se han publicado métricas objetivas de calidad de imagen o audio, ni benchmarks estándar. La evidencia disponible es la medición de una ejecución completa en dos GPU de consumo y una medición de error relativo L2 por capa del dequantizador de ComfyUI. El modelo lleva la etiqueta not-for-all-audiences y se distribuye bajo la LTX-2 Community License Agreement.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión LTX-2.3 de 48 bloques, con ramas separadas de vídeo y audio y atenciones cruzadas audio→vídeo y vídeo→audio; incluye VAE de vídeo, VAE de audio, vocoder y proyección de texto |
| Parámetros totales | 22B (modelo base LTX-2.3 22B) |
| Longitud de contexto | No disponible en tokens; la ejecución medida procesa 361 fotogramas a 24 fps (15 s) a 1024×1376 |
| Tipos de cuantización | W4A8 asimétrico (`asym_w4a8_int8`, grupo 16, ConvRot 256, codebook) en las 1440 lineales de la variante pura; en la variante mixta, 576 lineales de vídeo en W4A8 y 864 de audio en `int8_tensorwise` con ConvRot 256 |
| Idiomas soportados | No disponible (la entrada de texto se procesa con un codificador Gemma 3 12B, pero el autor no declara idiomas) |
| Licencia | LTX-2 Community License Agreement (5 de enero de 2026) |
| Formato de pesos | safetensors (archivo único para ComfyUI) |

Ficheros publicados:

| Fichero | Bytes | GiB | Composición |
|---|---|---|---|
| `10Eros_v1.5_bf16_w4a8.safetensors` | 16.641.963.302 | 15,50 | 1440 × `asym_w4a8_int8` (grupo 16, ConvRot 256, codebook) |
| `10Eros_v1.5_bf16_w4a8_audioint8.safetensors` | 19.107.895.342 | 17,80 | 576 lineales de vídeo × `asym_w4a8_int8` + 864 de audio × `int8_tensorwise` ConvRot 256 |

Desglose por partes, según las cabeceras de los ficheros:

| Parte | BF16 | W4A8 | `_audioint8` |
|---|---|---|---|
| Flujo de vídeo | 27,69 GiB | 8,30 GiB | 8,30 GiB (mismos bytes) |
| Flujo de audio | 6,91 GiB | 2,07 GiB | 3,38 GiB |
| Atención cruzada audio↔vídeo | 4,52 GiB | 1,29 GiB | 2,27 GiB |
| Resto (VAEs, vocoder, proyección de texto, modulación, normas, embeddings) | 3,85 GiB | 3,85 GiB | 3,85 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es LTX-2.3, un transformer de difusión multimodal con dos flujos latentes acoplados: uno de vídeo y otro de audio. El modelo encadena 48 bloques que contienen atenciones específicas de cada modalidad (`audio_attn1`, `audio_attn2`, `audio_ff` para el audio; las equivalentes de vídeo) y atenciones cruzadas bidireccionales (`audio_to_video_attn`, `video_to_audio_attn`). El pipeline completo, según el autor, incluye transformer, VAE de vídeo, VAE de audio, vocoder y proyección de texto. La generación se apoya en un LoRA DMD (`LTX2.3_DMD_reshaped_r256`) aplicado a peso 1.0, lo que sitúa el modelo base en la familia de modelos destilados por coincidencia de distribuciones para generación en pocos pasos, y en un upscaler espacial x2 (`ltx-2.3-spatial-upscaler-x2-1.1`) en un flujo de dos pasadas.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por RLHF o DPO; tampoco se documenta el proceso de fine-tune o merge que da lugar a 10Eros a partir de LTX-2.3. Lo que sí está documentado con detalle es el proceso de cuantización de este derivado. Todas las lineales cuantizadas se recodifican desde la fuente bf16 y el resto de tensores (VAEs, vocoder, proyección de texto, modulación, normas, embeddings) se conservan byte a byte del original. En la variante mixta, las 576 lineales de vídeo se copian byte a byte del fichero W4A8 y solo se recuantizan las 864 lineales de audio a INT8 tensorwise con ConvRot 256. El error relativo L2 por capa frente a bf16, medido con el dequantizador propio de ComfyUI (`TensorWiseINT8Layout`), es de mediana 0,93 % y máximo 1,13 % (en `transformer_blocks.44.video_to_audio_attn.to_out.0`).

La innovación técnica destacable es la combinación de W4A8 asimétrico por grupos con ConvRot (rotación de canales de 256 elementos) y codebook, más la decisión de mantener el flujo de audio en 8 bits para preservar la calidad sonora. Conviene subrayar que los kernels CUDA de `asym_w4a8_int8` están orientados a Ampere y Ada (SM 8.x); en Hopper y Blackwell comfy-kitchen redirige la ruta de 4 bits a su rama INT8, y el autor indica que esa ruta no fue medida.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con resolución de hasta 1024×1376 y 24 fps en la configuración medida.
- Generación conjunta de pista de audio sincronizada con el vídeo, a través del VAE de audio y el vocoder.
- Atención cruzada audio↔vídeo, que permite que ambas modalidades se condicionen mutuamente durante la difusión.
- Generación en dos pasadas con upscaling espacial x2 mediante `ltx-2.3-spatial-upscaler-x2-1.1`.
- Decodificación VAE por teselas (`VAEDecodeTiled`), necesaria en GPUs de consumo para no agotar la memoria de vídeo.
- Integración con LoRAs, en particular el LoRA DMD de destilación, con control fino de los pesos asignados a los grupos de audio vía `LTX2 LoRA Loader Advanced` de KJNodes.
- Condicionamiento por prompt de texto procesado con un codificador Gemma 3 12B (el autor usa su propia versión heretic W4A8 con embeddings FP8) más una proyección de texto FP8.
- Ejecución en ComfyUI mediante `CheckpointLoaderSimple`, con lectura nativa de los metadatos de cuantización por capa.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente; no aplica a un modelo de difusión.

## Casos de uso

- Previsualización de animáticas en producción audiovisual: a partir de un fotograma clave se obtienen 15 s de vídeo a 24 fps con audio, lo que permite validar ritmo y montaje antes de comprometer presupuesto en render final.
- Prototipado de piezas publicitarias: la resolución medida de 1024×1376 y la ventana de 361 fotogramas cubren anuncios cortos completos, generados en una máquina de dos GPU de consumo en torno a 18 minutos.
- Generación de vídeo con banda sonora para videoclips o contenido musical, aprovechando que la variante `_audioint8` evita el siseo metálico del audio cuantizado a 4 bits.
- Creación de cortinillas, bumpers y material de transición para canales de vídeo, donde la coherencia temporal de 15 s es suficiente y el coste por iteración importa.
- Investigación sobre cuantización de modelos de difusión multimodales: el repositorio documenta el error L2 relativo por capa, la asignación de bits por modalidad y el efecto medible de cuantizar a 4 bits una rama de audio, lo que lo convierte en un caso de estudio reproducible con ComfyUI como referencia de dequantización.
- Evaluación de pipelines ComfyUI en configuraciones multi-GPU heterogéneas: el autor documenta el reparto de carga entre una RTX 3090 (transformer) y una RTX 3080 Ti (codificador de texto), incluyendo el offload parcial a RAM y el consumo de memoria del decodificador VAE.
- Docencia y demostración de flujos de trabajo de difusión vídeo+audio en GPU de consumo, dado que el conjunto cabe en 24 GB de VRAM por tarjeta con decodificación por teselas.
- Reducción de coste en inferencia por lotes: los 15,50 GiB del W4A8 puro frente a los ~43 GiB del bf16 permiten alojar el transformer en tarjetas de gama alta de consumo y evitan depender de A100 en la nube para cada iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo tipo FVD) en la información disponible. El autor declara explícitamente que no hay ninguna métrica de imagen frente a bf16 para ninguna de las dos variantes, y que el veredicto sobre el audio corresponde a un único oyente, un único prompt y una única semilla.

Los únicos datos cuantitativos publicados son medidas de memoria, tiempo y error de cuantización:

| Medición | W4A8 | `_audioint8` |
|---|---|---|
| Transformer en la RTX 3090 | 11.921 MB | 14.273 MB |
| Tiempo total de la ejecución | 1060 s | 1119 s |
| Error relativo L2 por capa frente a bf16 (mediana / máximo) | No reportado para el conjunto W4A8 | 0,93 % / 1,13 % |

Condiciones de la ejecución medida: RTX 3090 + RTX 3080 Ti, Windows, 64 GB de RAM, flujo I2V con DMD del autor, dos pasadas, `ltx-2.3-spatial-upscaler-x2-1.1`, decodificación VAE por teselas en ambas pasadas, 1024×1376, 361 fotogramas a 24 fps (15 s), LoRA `LTX2.3_DMD_reshaped_r256` a 1.0, primera ejecución tras reiniciar el servidor, checkpoint leído desde un recurso de red compartido. El codificador de texto (Gemma 3 12B heretic W4A8 con embeddings FP8 más la proyección de texto FP8) ocupó 7.855 MB íntegramente en la 3080 Ti; en la 3090, la segunda pasada descarga aún unos 1,8 GB del transformer W4A8 a RAM.

De estos datos se derivan, en la configuración medida, aproximadamente 2,94 s por fotograma (0,34 fps) para el W4A8 y 3,10 s por fotograma (0,32 fps) para el `_audioint8`. Son cifras de un único entorno y de una única ejecución, no una referencia de throughput.

## Requisitos de hardware

- VRAM del transformer: 11.921 MB para el W4A8 y 14.273 MB para la variante `_audioint8`, medidos en una RTX 3090.
- VRAM del codificador de texto: 7.855 MB para el Gemma 3 12B heretic W4A8 con proyección de texto FP8, que cupo completamente en una RTX 3080 Ti.
- RAM del sistema: 64 GB en la configuración medida. Sin decodificación VAE por teselas en la primera pasada, ComfyUI expulsa el transformer completo (11,9 GB) a RAM y el pico alcanzó 62,9 GB; con teselado, el pico bajó a 49,4 GB.
- Cabe en GPU de consumo: sí, en el rango de 24 GB (RTX 3090, RTX 4090) siempre que se use decodificación por teselas y, preferiblemente, se reparta el codificador de texto en una segunda tarjeta. El requisito del autor es explícito: `VAEDecodeTiled` a 512 / 64 / 64 / 8 en ambas pasadas.
- GPU recomendadas: Ampere o Ada de gama alta (RTX 3090, RTX 4090) para aprovechar los kernels `asym_w4a8_int8` en SM 8.x. En Hopper y Blackwell, comfy-kitchen redirige la ruta de 4 bits a su rama INT8 y el comportamiento no fue medido.
- Opciones de despliegue: ComfyUI con comfy-kitchen que incluya los kernels CUDA de `asym_w4a8_int8` (versión registrada por el autor: comfy-kitchen 0.2.31), cargando con `CheckpointLoaderSimple` y arrancando con `--disable-dynamic-vram`. ComfyUI detecta los metadatos por capa y soporta `asym_w4a8_int8` e `int8_tensorwise` en un mismo fichero mediante su `MixedPrecisionOps`. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1060 s (W4A8) y 1119 s (`_audioint8`) para 361 fotogramas a 1024×1376 en la configuración de dos GPU descrita. El coste dominante es la memoria reservada por la decodificación de 361 fotogramas a esa resolución, no el peso de los modelos.

## Comparativa con modelos similares

No se dispone en la información proporcionada de especificaciones de otros modelos abiertos de difusión vídeo+audio comparables, por lo que no se puede establecer una comparativa con alternativas externas. La comparación posible, y documentada por el autor, es entre las tres versiones del mismo modelo:

| Versión | Tamaño | Lineales de vídeo | Lineales de audio | Observaciones |
|---|---|---|---|---|
| LTX-2.3-10Eros bf16 (original) | 46.139.886.366 B (~43 GiB) | bf16 | bf16 | Referencia de calidad; renderizado en la nube sobre A100 sin el siseo metálico que introduce el W4A8 |
| 10Eros v1.5 W4A8 | 15,50 GiB | 1440 × `asym_w4a8_int8` | incluidas en las 1440 | Menor huella; el autor reporta siseo metálico en la banda sonora |
| 10Eros v1.5 W4A8 `_audioint8` | 17,80 GiB | 576 × `asym_w4a8_int8` | 864 × `int8_tensorwise` | +2,4 GB; el autor reporta audio claramente mejor con el mismo prompt, imagen y semilla |

El autor recomienda la variante `_audioint8` salvo que la VRAM adicional sea un impedimento.

## Limitaciones y advertencias

- El modelo lleva la etiqueta not-for-all-audiences, lo que indica contenido potencialmente inadecuado. El nombre del modelo y su base sugieren un fine-tune orientado a contenido para adultos; se desaconseja su uso sin control de acceso y sin verificar la legislación aplicable en la jurisdicción de despliegue.
- No existe ninguna métrica objetiva de calidad de imagen o de audio frente al original en bf16. La única comparación de audio es la escucha de una sola persona, con un solo prompt y una sola semilla, sin publicar los renders.
- La comparación con el render en la nube usó un codificador de texto Gemma heretic en bf16 con la misma revisión de ComfyUI, mientras que los renders locales usaron el codificador W4A8 con embeddings FP8. La comparación no está controlada por completo.
- El W4A8 puro introduce un siseo metálico audible en el audio según el autor, y bajar los grupos de audio del LoRA DMD a 0,5 con `LTX2 LoRA Loader Advanced` empeora el sonido, no lo mejora. La recomendación es mantener los pesos de audio del DMD a 1.0.
- Los kernels de 4 bits están orientados a Ampere y Ada (SM 8.x). En Hopper y Blackwell la ruta de 4 bits se redirige a la rama INT8 de comfy-kitchen y el autor indica que ninguna de esas rutas fue medida.
- Riesgo de artefactos y de alucinación visual propio de los modelos de difusión: no hay evaluación publicada de coherencia temporal, fidelidad al prompt ni degradación acumulada a lo largo de los 361 fotogramas.
- La ejecución con `VAEDecode` estándar en la primera pasada provoca la expulsión del transformer completo a RAM y picos de 62,9 GB sobre un sistema de 64 GB. Es un fallo previsible en máquinas con menos memoria.
- La licencia LTX-2 Community License Agreement (5 de enero de 2026) impone condiciones relevantes: su sección 2 exige una licencia de pago a Lightricks para entidades con ingresos anuales iguales o superiores a 10 millones de dólares, y la model card menciona además restricciones basadas en el uso (el texto se corta en "use-based restrict..."). Conviene leer el texto íntegro antes de cualquier uso comercial.
- Este derivado se distribuye exclusivamente bajo los mismos términos que el original, conforme a la sección 3(b) de dicha licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no tiene una comunidad que haya validado de forma independiente las afirmaciones del autor.
- La integridad del fichero fuente se verificó solo por tamaño, no por hash completo: la copia local coincide en bytes con el tamaño publicado, pero el autor no recalculó el sha256 íntegro de LFS.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoZaokk/10Eros-v1.5-W4A8-ConvRot
- Modelo base: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Licencia completa: https://huggingface.co/JoaoZaokk/10Eros-v1.5-W4A8-ConvRot/blob/main/LICENSE_LTX_2_COMMUNITY.txt
- Codificador de texto usado por el autor: https://huggingface.co/JoaoZaokk/Gemma-3-12B-it-Heretic-W4A8
- Proyección de texto y cuantización hermana: https://huggingface.co/JoaoZaokk/LTX-2.3-22B-distilled-1.1-W4A8-ConvRot
