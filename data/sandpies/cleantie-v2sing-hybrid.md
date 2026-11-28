# sandpies/cleantie-v2Sing-hybrid

## Resumen

CleanTie, HandTie y SilkTie V2Sing Hybrid son una familia de checkpoints de difusion para generacion conjunta de audio y video (audio-video generation) derivados de MiniMax-H3, empaquetados como ficheros unicos para ComfyUI. El autor, sandpies, parte del modelo base MiniMaxAI/MiniMax-H3 y de la variante Ref2VA (reference-to-video-and-audio), y produce tres "spines" diferenciados: `cleantie` como base SFW, `handtie` como pila calibrada de anatomia y `silktie` como fusion de CleanTie V2Sing con 10Eros v1.0 Ref2VA OrthFix con turbo de 8 pasos ya integrado.

El modelo resuelve el problema de generar video con audio sincronizado a partir de imagenes y referencias multimodales, manteniendo coherencia de identidad entre tomas y evitando el sangrado de atributos entre sujetos (cross-subject bleed). La relevancia actual radica en que ofrece variantes cuantizadas calibradas (INT8, W6, W4/W6) que caben en GPUs de consumo de 24 GB y 32 GB, con aceleraciones de atencion INT8 integradas.

La familia se distribuye en cuantizaciones con calibracion Hessiana y STE aprendido, atencion INT8 embebida de 52 capas y variantes turbo de 8 pasos en FP32. El repositorio ocupa 454 GB e incluye checkpoints BF16 de referencia de hasta 37,46 GiB, ademas de LoRAs independientes para fusion y spines sin hornear.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (modelo base MiniMax-H3, variante Ref2VA); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8 (ConvRot calibrado y legacy), W6 g16, W4/W6 mixto, atencion INT8 embebida (52x) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base MiniMax-H3 ni el numero de parametros. Se sabe que es un modelo de difusion para generacion de video con audio (pipeline image-to-video, tags ref2va y fl2va), y que los checkpoints de esta familia son adaptaciones y fusiones sobre el spine de MiniMax-H3. Los tags indican variantes Ref2VA (reference-to-video-and-audio) y FL2VA (first-last-to-video-and-audio).

El trabajo tecnico destacable esta en las cuantizaciones: se aplica GPTQ con calibracion Hessiana y STE aprendido, con atencion INT8 embebida en 52 capas que reporta entre 1,9 y 2,8 veces mas velocidad que BF16 en caliente y cerca de un 20 % mas que INT8 ConvRot estatico. Las variantes `_turbo_` y `silktie_v2Sing_eros_8step_*` llevan el turbo de 8 pasos horneado en FP32 (sampler `lcm`/`euler` con `beta_57`, 8 pasos y CFG 1.0). La fusion de SilkTie combina CleanTie V2Sing con 10Eros v1.0 Ref2VA OrthFix, reportando 0,2868 % de NRMSE y ausencia de sangrado de vestuario entre sujetos. No se especifican datos de entrenamiento (numero de tokens, composicion del dataset) ni si hubo RLHF o DPO.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) con audio sincronizado.
- Generacion condicionada por referencias multimodales (Ref2VA): multiples `<Picture>` y escenas con 3 hojas RefMod.
- Generacion first-last-to-video-and-audio (FL2VA): interpolacion entre primer y ultimo fotograma con audio.
- Coherencia de identidad y bloqueo de atributos entre sujetos (outfit lock, garter lock) en escenas multi-referencia.
- Clonacion de voz y sincronizacion de habla (reportada con cosine de audio de hasta 0,994 en algunos prompts).
- Modo turbo de 8 pasos con CFG 1.0 para inferencia rapida.
- Capacidades de anatomia calibrada en la variante HandTie.
- No se documentan tool calling, function calling ni razonamiento multi-paso; es un modelo generativo de difusion, no un LLM.

## Casos de uso

- Produccion de video corto con dialogo: el modelo genera video y audio sincronizados en una sola pasada, adecuado para clips de personajes con habla.
- Publicidad y contenido de marca: la variante SilkTie mantiene el bloqueo de vestuario e identidad entre tomas multi-referencia, util para campanas con el mismo personaje en varias escenas.
- Animacion de retratos y avatares: FL2VA permite interpolar entre un primer y ultimo fotograma con audio, util para avatares parlantes.
- Prototipado rapido en ComfyUI: los checkpoints de 8 pasos con CFG 1.0 reducen el coste de iteracion en flujos de trabajo de nodos.
- Despliegue en estaciones de trabajo de 24 GB: la variante `w6_g16_hq` de 18,39 GiB deja unos 5,6 GB de margen de VRAM, apta para GPUs de consumo de gama alta.
- Escenas multi-sujeto con referencias: el bloqueo de atributos entre sujetos evita el sangrado de prendas y accesorios en escenas con varias referencias.
- Investigacion en cuantizacion de modelos de difusion: las variantes INT8, W6 y W4/W6 con metricas NRMSE y MAE publicadas sirven como referencia comparativa de tecnicas GPTQ/STE.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| NRMSE SilkTie INT8 MinMaxxed | 0,2868 % (2,7x vs natural) |
| NRMSE SilkTie W6 g16 HQ | 0,585 % W6 / 0,118 % B2 INT8 |
| MAE SilkTie W6 vs INT8 MinMaxxed (3-RefMod lobby) | 6,84/255 |
| Aceleracion atencion INT8 52x | 1,9-2,8x vs BF16 en caliente; ~20 % vs INT8 ConvRot estatico |
| Aceleracion CleanTie/HandTie INT8 MinMaxxed | 1,92-2,46x vs BF16 |
| Aceleracion CleanTie/HandTie W6 g16 HQ | 2,06-2,36x vs BF16 |
| Aceleracion W4/W6 Compact | 2,32-2,75x vs BF16 |
| Fidelidad pixel/audio CleanTie/HandTie W6 (nightmarket_anime) | 21,13 dB |
| Fidelidad pixel/audio CleanTie/HandTie W6 (midnight_store_male) | 22,43 dB / 0,994 cosine audio |
| Clonacion de voz W4/W6 Compact | 0,645-0,933 (degradada en algunos prompts) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores son internas del autor sobre reconstruccion y velocidad.

## Requisitos de hardware

- VRAM estimada: 20,96 GiB (SilkTie INT8 MinMaxxed), 18,39 GiB (SilkTie W6 g16 HQ), 20,97 GiB (CleanTie/HandTie INT8), 19,20 GiB (W6 g16 HQ), 14,17 GiB (W4/W6 Compact), 37,46 GiB (BF16).
- GPU recomendadas: 32 GB para la variante INT8 MinMaxxed; 24 GB para la variante W6 g16 HQ (con unos 5,6 GB de margen); BF16 requiere GPUs de 40-80 GB (A100, H100).
- Cabe en GPU de consumo: si, en tarjetas de 24 GB y 32 GB con las variantes cuantizadas; la variante compacta de 14,17 GiB amplia el margen.
- Opciones de despliegue: ComfyUI (libreria `diffusion-single-file`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reportan aceleraciones relativas (hasta 2,75x vs BF16); no se publican valores absolutos de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CleanTie/HandTie/SilkTie V2Sing Hybrid | difusion audio-video (MiniMax-H3 Ref2VA) | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face, ComfyUI |
| MiniMax-H3 (base) | difusion audio-video | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face |
| Pika-H3-Flex | difusion (modelo base referenciado) | no disponible | no disponible | no disponible | Hugging Face |
| 10Eros-Max | difusion (modelo base referenciado) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `minimax-h3-community-license-agreement`: es necesario revisar sus terminos antes de cualquier uso comercial; no es una licencia permisiva estandar.
- Riesgo de sangrado de atributos entre sujetos en escenas multi-referencia, mitigado pero no eliminado en las variantes calibradas.
- La variante W4/W6 Compact degrada la clonacion de voz (cosine de 0,645-0,933) en algunos prompts de dialogo.
- No se deben apilar checkpoints ni anadir un segundo turbo de 8 pasos o una segunda pila de anatomia: los ficheros ya lo incorporan y el doble apilado rompe la inferencia.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion; no hay datos publicados sobre sesgos demograficos.
- Idiomas soportados no documentados; la calidad del habla y del texto generado puede variar por idioma.
- El repositorio ocupa 454 GB, lo que exige planificacion de almacenamiento para descargar la familia completa.
- No se publican datos de entrenamiento ni evaluaciones estandar, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandpies/cleantie-v2Sing-hybrid
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Variante Comfy-Org MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- WarmBloodAban/Minimax-h3_Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Pika-Labs/Pika-H3-Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- ZhengmingYu/DMAD: https://huggingface.co/ZhengmingYu/DMAD
- TenStrip/10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
