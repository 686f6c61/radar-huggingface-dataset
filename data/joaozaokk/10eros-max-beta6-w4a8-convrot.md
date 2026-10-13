# JoaoZaokk/10Eros-Max-beta6-W4A8-ConvRot

## Resumen

10Eros-Max beta6 W4A8 ConvRot es una cuantizacion de un modelo de difusion de video con audio de la familia MiniMax H3, publicada por el usuario JoaoZaokk sobre el fine-tune TenStrip/10Eros-Max. No es un modelo de lenguaje: es un modelo de generacion de video a partir de texto, imagen o referencias visuales (pipeline image-text-to-video), con salida conjunta de imagen y sonido. El repositorio empaqueta tanto los pesos del difusor como un text encoder Qwen3-VL de 32B milimétricamente cuantizado para que quepa y funcione en GPUs Ampere de 24 GB (RTX 3090).

Su relevancia es practica: el modelo original en bf16 ronda los 37,5 GB y su text encoder en INT8 puro pesa 27 GB, lo que lo deja fuera de tarjetas de consumo. Esta version comprime el difusor a W4A8 (pesos int4 en grupos de 16, activaciones int8) con una rotacion ConvRot de 256, y deja el text encoder en un esquema mixto (300 lineales W4A8 mas 50 `mlp.down_proj` en INT8) de 19,3 GB. El autor reporta matmul cuantizado nativo en tensor cores, sin dequantizacion ni GEMM en BF16, y tiempos de unos 2 minutos por clip de 5 s a 848x480 en una sola tarjeta.

La ficha se centra en esta cuantizacion concreta, pero conviene tener presente que hereda la licencia MiniMax H3 Community License Agreement y que el modelo esta etiquetado como `not-for-all-audiences`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (MiniMax H3): 50 bloques + 2 bloques token-refiner; text encoder Qwen3-VL 32B |
| Parametros totales | no disponible (pesos bf16 de origen ~37,5 GB) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos int4, grupo 16, ConvRot 256, codebook), int8 tensorwise ConvRot, bf16 (origen) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors de fichero unico (library_name: diffusion-single-file) |

## Arquitectura y entrenamiento

El difusor es un modelo de difusion MiniMax H3 con 50 bloques principales mas 2 bloques token-refiner, operado en modo turbo a 8 pasos. La cuantizacion se aplica sobre el checkpoint `10Eros_Max_h3_8stepTURBO_beta6_pruned.safetensors` y afecta a 208 capas lineales: en el fichero recomendado se convierten a `asym_w4a8_int8` con grupo 16 y una rotacion ConvRot de 256 con codebook. Todos los tensores que no son lineales cuantizadas se copian byte a byte del modelo original. El text encoder es Qwen3-VL 32B, aqui en un formato mixto (300 lineales W4A8 mas 50 `mlp.down_proj` en INT8 ConvRot) porque un W4A8 puro no arranca en sm86: sus `down_proj` tienen K=25600 y el kernel fusionado de ConvRot pide 110.592 bytes de memoria compartida, por encima del limite de la tarjeta.

No se han publicado en la informacion disponible datos sobre el dataset de entrenamiento del modelo base, el numero de tokens de video/texto, ni si hubo fases de RLHF o DPO. El fine-tune TenStrip/10Eros-Max, segun fuentes externas, se reconstruyo desde el modelo base fl2va completo en bf16, integrando deltas de referencia, viggle, turbo y una mezcla de LoRA con limite de fuerza compartido y suelo de contribucion, antes de podarlo. MiniMax H3 emplea una arquitectura autoguiada que, segun la documentacion del autor, se degrada con pilas de multiples LoRA, lo que motivo ese diseno.

## Capacidades

- Generacion de video a partir de texto (text-to-video) hasta 1280x736 en dos tarjetas.
- Generacion de audio sincronizado con el video (salida conjunta de imagen y sonido).
- Image-to-video (I2V): arranca exactamente desde una foto dada.
- Reference-to-video (R2V): toma una o varias imagenes de referencia para conservar identidad, vestuario o colores, con control del tamano de referencia (`ref_image_size = match` o `max`, hasta 2048 px de lado corto).
- Ejecucion en modo turbo a 8 pasos con `res_multistep` y `ModelSamplingMiniMaxH3` 10/3, sin necesidad de LoRA turbo adicional.
- Funcionamiento en una o dos GPUs mediante workflows de ComfyUI especificos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo de ese tipo.

## Casos de uso

- Generacion de clips cortos de video con audio en local: con 8 pasos turbo y las cuantizaciones de este repositorio se pueden producir clips de 5 s a 848x480 en aproximadamente 2 minutos en una RTX 3090.
- Prototipado de storyboards animados: usar image-to-video para animar bocetos o frames clave y evaluar secuencias antes de invertir en render de mayor resolucion.
- Creacion de personajes consistentes: con reference-to-video, `ref_image_size = max` y un primer plano facial como `<Picture 2>`, se fuerza al modelo a mantener rostro, ropa y colores a lo largo del clip.
- Postproduccion y doblaje sintetico: aprovechar la generacion de audio integrada para producir voz y ambiente alineados con el video, evitando el paso separado de un modelo TTS.
- Pruebas de concepto para publicidad o contenido corto: generar variaciones de una escena desde un prompt de texto y una imagen de referencia sin depender de servicios en la nube.
- Investigacion en cuantizacion de difusion: el repositorio incluye medidas de error por capa (W4A8 0,074 frente a INT8 0,013-0,016) y permite reproducir el estudio de compromiso entre tamano, fidelidad y VRAM.
- Despliegue en estaciones de trabajo con dos RTX 3090: los workflows `*_2gpu.json` reparten difusor en `cuda:0` y text encoder mas VAEs en `cuda:1`, lo que permite resoluciones 1280x736 en unos 6 minutos por clip.

## Benchmarks y rendimiento

Distancias medidas por el autor contra un render INT8 del mismo modelo (5 s, 124 frames, 8 pasos, `res_multistep`, shift 10/3, una semilla por ajuste). Son distancias, no puntuaciones de calidad; una "unrelated video" con otra semilla sirve como escala de referencia.

| Ajuste | PSNR de imagen | L1 log-mel de audio |
|---|---|---|
| R2V, W4A8 | 20,0 dB | 1,06 |
| I2V, W4A8 | 19,9 dB | 0,80 |
| R2V, W4A8 + bordes INT8 | 14,9 dB | 1,05 |
| I2V, W4A8 + bordes INT8 | 15,8 dB | 1,50 |
| R2V, text encoder mixto frente a INT8 | 19,9 dB | 0,41 |
| Video no relacionado (otra semilla) | 10-11 dB | 1,3-1,8 |

Error de salida por capa frente a los pesos bf16 con entradas aleatorias: W4A8 0,074; INT8 0,013-0,016. El text encoder mixto, comparado contra INT8 en 4 prompts, da coseno 1,000 y error relativo <= 0,02. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no aplican a un modelo de difusion.

## Requisitos de hardware

- VRAM: el difusor W4A8 ocupa 11,4 GB (o 12,4 GB con bordes INT8) y el text encoder mixto 19,3 GB. En una sola tarjeta de 24 GB ambos comparten VRAM alternandose; en dos tarjetas se reparten.
- GPU verificadas: dos RTX 3090 (Ampere, sm86) para los renders del showcase, y una RTX 3090 para los clips a 848x480.
- Compatibilidad consumer: si, en GPUs de 24 GB (RTX 3090, 4090 y similares). El text encoder INT8 puro de 27 GB no cabe en una tarjeta de 24 GB; de ahi el esquema mixto.
- Restriccion de arquitectura: el text encoder W4A8 puro falla en sm86 por el limite de memoria compartida del kernel ConvRot; el paquete mixto lo resuelve.
- Software de despliegue: ComfyUI 0.37.4 con comfy-kitchen 0.2.35 y ComfyUI-MultiGPU. El difusor va en `models/diffusion_models` y el text encoder en `models/text_encoders`; los VAE son los oficiales de Comfy-Org/MiniMax-H3 (`minimax_h3_video_vae_fp16` y `minimax_h3_audio_vae_fp32`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Tiempos medidos (RTX 3090, difusor W4A8 y text encoder mixto o INT8): 848x480 R2V de 5 s en una tarjeta ~2 min; 1280x736 text-to-video en dos tarjetas ~6 min; 736x1280 R2V con `ref_image_size=match` en dos tarjetas ~6,5 min; con `ref_image_size=max` ~8 min.
- Carga del text encoder: unos 0,2 s por prompt con el mixto, frente a 0,8 s con el INT8 de 27 GB.
- Tamano total del repositorio: 63,4 GB.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 10Eros-Max beta6 W4A8 ConvRot (este) | safetensors W4A8 | 11,4 GB (difusor) + 19,3 GB (encoder) | no disponible | PSNR 19,9-20,0 dB frente a INT8 | MiniMax H3 Community (excluye UE, RU, Corea, EE. UU.) | HuggingFace, 24 descargas |
| 10Eros-Max beta6 INT8 ConvRot | safetensors int8 | 20,2 GB (difusor) | no disponible | referencia de comparacion | MiniMax H3 Community | HuggingFace |
| 10Eros-Max / H3 Eros Max beta6 bf16 | safetensors bf16 | ~37,5 GB | no disponible | original sin cuantizar | MiniMax H3 Community | Civitai y HuggingFace |
| TenStrip/10Eros-Max (base) | safetensors | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Como alternativas de la misma categoria (video generativo abierto con licencia comunitaria) se mencionan en la documentacion del modelo base Wan 2.2 y LTX 2.3, cuyas licencias se incorporan al paquete de TenStrip; no se dispone de datos comparativos de parametros, contexto ni rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia territorial restrictiva: la MiniMax H3 Community License Agreement solo concede derechos en su "Applicable Territory" y excluye expresamente la Union Europea, el Reino Unido, la Republica de Corea y Estados Unidos. Comprueba la aplicabilidad en tu jurisdiccion antes de cualquier uso.
- Restricciones de uso: la seccion V y la Acceptable Use Policy (Exhibit A) vinculan a todo usuario. Prohibe la suplantacion de personas reales sin consentimiento y obliga a declarar publicamente el contenido generado por maquina.
- Contenido adulto: el modelo esta etiquetado como `not-for-all-audiences`, lo que implica riesgo de generar material inapropiado o NSFW. No es apto para entornos sin filtrado.
- Fuentes de licencia multiples: el README del modelo base anade las licencias comunitarias de LTX 2.3, Wan 2.2 y Krea 2 para los personajes transferidos, lo que complica el cumplimiento en usos comerciales combinados.
- Riesgo de alucinacion visual: el propio autor advierte que "aquello que el prompt deja abierto, el modelo lo reinventa". En reference-to-video hay que describir explicitamente lo que debe conservarse (rostro, vestuario, colores).
- Degradacion por cuantizacion: el error por capa de W4A8 (0,074) es varias veces mayor que el de INT8 (0,013-0,016). En 8 pasos turbo, la trayectoria de difusion varia mucho con la semilla y las distancias PSNR no deben leerse como puntuaciones de calidad.
- La variante "W4A8 + bordes INT8" empeora notablemente las distancias (14,9-15,8 dB), por lo que no se recomienda como configuracion por defecto.
- Limitaciones de hardware: W4A8 puro del text encoder no funciona en Ampere (sm86) por el limite de memoria compartida del kernel ConvRot; hay que usar el paquete mixto.
- Idiomas: no se especifican idiomas soportados, por lo que no puede garantizarse la calidad de los prompts en castellano.
- Modelo con adopcion muy baja (24 descargas, 0 likes) y sin validacion externa publicada: tratalo como experimental.
- No se indican datos de sesgos sociales; al ser un generador de video con audio y entrenamiento no documentado, los sesgos son desconocidos e incontrolados.

## Enlaces

- [JoaoZaokk/10Eros-Max-beta6-W4A8-ConvRot en HuggingFace](https://huggingface.co/JoaoZaokk/10Eros-Max-beta6-W4A8-ConvRot)
- [TenStrip/10Eros-Max (modelo base)](https://huggingface.co/TenStrip/10Eros-Max)
- [Comfy-Org/MiniMax-H3 (VAEs oficiales)](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [H3 Eros Max beta6 en CivArchive](https://civarchive.com/models/2851079?modelVersionId=3393047)
- [H3 Eros Max beta6 en PromptHero](https://prompthero.com/ai-models/h3-eros-max-2851079-download/h3-eros-max-beta6)
- [H3 Eros MAX GGUF v6.0 turbo en Civitai](https://civitai.red/models/2902153/h3-eros-max-gguf)
