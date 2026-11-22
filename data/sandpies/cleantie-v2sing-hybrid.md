# sandpies/cleantie-v2Sing-hybrid

## Resumen

CleanTie V2Sing Hybrid es un conjunto de checkpoints y LoRAs derivados de MiniMax-H3, un modelo de difusion para generacion conjunta de audio y video a partir de imagenes de referencia (pipeline image-to-video). Lo publica el usuario sandpies en Hugging Face como un unico repositorio que empaqueta varias variantes: una columna vertebral "cleantie" (fusion de FL2VA y Singularity V2) y una variante "handtie" con un stack de anatomia, cada una en versiones base, base+turbo de 8 pasos, en BF16 e INT8 ConvRot.

El proposito del autor es ofrecer un punto de partida estable para ComfyUI que mantenga la identidad y el color de la referencia sin degradar la rama de voz de MiniMax-H3. Para ello combina alineacion AdaLN en forma cerrada, una columna vertebral "audio-safe" (PRISM-v2) y una LoRA turbo reequilibrada en audio. El repositorio ocupa 1,6 GB e incluye el script de fusion y cuantizacion para reproducir el proceso.

La relevancia es practica: reduce el trabajo de mezcla manual de LoRAs y checkpoints en flujos de generacion audio-video, aunque su licencia (MiniMax-H3 Community License) y el caracter experimental del autor limitan su adopcion en produccion sin revision legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (modelo base MiniMax-H3, pipeline image-to-video con rama de audio); checkpoints single-file para ComfyUI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (37,46 GiB por checkpoint) e INT8 ConvRot tensorwise con groupsize=256 (20,59 GiB por checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (diffusion-single-file); LoRAs en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo se apoya en MiniMax-H3 y se distribuye como pesos de difusion en un unico archivo para ComfyUI. La columna "cleantie" fusiona la variante FL2VA podada con Singularity V2: el `time_embedder` de 2688 dimensiones de Singularity V2 se proyecta sobre la `adaln_t_table` de FL2VA ([1025, 8]) mediante minimos cuadrados en float64, con un error relativo L2 de 2,1025e-05. La modulacion AdaLN se separa por modalidad: las filas visuales escalan de 0,40 a 0,85, las de texto de 0,40 a 0,60 y las de audio se mantienen en 0,15. La columna "audio-safe" (PRISM-v2) aplica denoising por SVD (r=64, gamma entre 0,92 y 1,0) y SLERP polar por filas en `Q`, `V`, `out_proj` y `fc1`, con `K` fijado en 0,12, `mlp.fc2` de 0,18 a 0,10 y `final_layer.audio_out` al 0,90 de FL2VA con normas de fila ancladas para evitar la degradacion del habla.

La LoRA turbo (Pika-H3-Flex Ref2VA por DMAD de 8 pasos) se construye por concatenacion de rangos con reequilibrio de audio por bandas de profundidad y `token_refiner` de Pika al 0,65. En los bloques tardios (35 a 49) se aplica una proyeccion DMAD `(I - U_vid)` que ortogonaliza `out_proj` y `mlp.fc1` frente al subespacio visual de FL2VA, de modo que DMAD afina audio y destilacion de pasos sin alterar el aspecto visual. La LoRA se poda con QR-SVD por fuente (`sep_fro99`), conservando al menos el 99,0 % de la energia de Frobenius de Pika (min_r=24) y de DMAD (min_r=48). El stack de anatomia `handtie` es una suma lineal en FP32 sobre la base cleantie: 0,50 de 10Eros_beta7_nsfw_extract, 0,20 de S3_filtered_LoRA_2048_froextract_099 y 0,30 de MysticXXX_MMH3-V5-ref2va, con `other_keys = skip`.

## Capacidades

- Generacion de video a partir de imagen de referencia (image-to-video) con preservacion de identidad y color de la referencia.
- Generacion conjunta de audio y video, con una rama de voz preservada deliberadamente por el diseno "audio-safe".
- Generacion en 8 pasos con CFG 1.0 usando los checkpoints `_turbo_` o la LoRA turbo al 0,85-1,0.
- Soporte de referencias multiples (ref2va) y de flujo first-last (fl2va) segun la nomenclatura de las variantes base.
- Composicion de LoRAs adicionales sobre la columna base en ComfyUI.
- Variante con stack de anatomia (`handtie`) para contenido explicito, con pesos separados de la variante limpia.
- Cuantizacion INT8 ConvRot para ejecucion con menor huella de memoria, manteniendo `blocks.0`, `blocks.1` y `blocks.49` en BF16.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de video generativo en ComfyUI: cargar el checkpoint `_turbo_` INT8 ConvRot y generar clips de 8 pasos con CFG 1.0 permite iterar rapidamente sin montar un pipeline propio de difusion.
- Preservacion de identidad en animaciones de personaje: la alineacion AdaLN y el reequilibrio de modalidades mantienen el color y los rasgos de la imagen de referencia en tomas sucesivas.
- Generacion de video con voz sincronizada: la rama de audio protegida por PRISM-v2 hace que el modelo sea adecuado para clips con dialogo donde no se quiere que la distillation turbo degrade el habla.
- Destilacion y ajuste fino sobre MiniMax-H3: la LoRA turbo sin podar (3,57 GiB, BF16) sirve como material de fusion y baking para quien quiera construir sus propias variantes.
- Investigacion sobre fusion de modelos de difusion: el script `build_v2sing_hybrid.py` documenta un pipeline reproducible de proyeccion AdaLN, SLERP polar, ortogonalizacion DMAD y cuantizacion INT8 ConvRot.
- Creacion de contenido para adultos con control anatomico: la variante `handtie` ofrece un checkpoint plug-and-play de 8 pasos para flujos NSFW, separado de la base limpia.
- Despliegue en GPU de gama alta con requisitos de memoria ajustados: la version INT8 ConvRot reduce el peso de 37,46 GiB a 20,59 GiB por checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los checkpoints BF16 ocupan 37,46 GiB en disco y requieren al menos esa cantidad de VRAM para cargarse completos; los INT8 ConvRot ocupan 20,59 GiB.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o RTX 6000 Ada; para INT8 ConvRot, A100 40 GB o RTX 4090 24 GB con margen ajustado.
- GPU de consumo: la version INT8 ConvRot de 20,59 GiB puede caber en una RTX 4090 de 24 GB, aunque el margen es reducido; la BF16 no cabe en GPU de consumo.
- Despliegue: ComfyUI con soporte de `comfy-kitchen` para INT8 ConvRot; requiere PyTorch y ComfyUI actualizados. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Ajustes de ejecucion: 8 pasos, CFG 1.0, sampler `lcm` o `euler`, scheduler `beta_57`, `beta` o `simple`, `shift_video = 12.0` y `shift_audio = 2.0-2.5`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CleanTie V2Sing Hybrid (este) | Difusion image-to-video con audio, derivado de MiniMax-H3 | no disponible | no disponible | MiniMax-H3 Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 | Difusion image-to-video con audio (base) | no disponible | no disponible | MiniMax-H3 Community License | Hugging Face (modelo base oficial) |
| Comfy-Org/MiniMax-H3 | Empaquetado de MiniMax-H3 para ComfyUI | no disponible | no disponible | MiniMax-H3 Community License | Hugging Face |
| Pika-Labs/Pika-H3-Flex | Derivado de MiniMax-H3 (fuente de la LoRA turbo) | no disponible | no disponible | no disponible | Hugging Face |

Los datos de parametros, contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; la comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo derivado y experimental: el autor no publica benchmarks, evaluaciones objetivas ni datos de entrenamiento verificables.
- La licencia MiniMax-H3 Community License Agreement impone condiciones especificas; es necesario revisar el texto completo antes de cualquier uso comercial.
- El repositorio incluye variantes NSFW (`handtie`); su uso debe cumplir la legislacion aplicable y las politicas de la plataforma de despliegue.
- Riesgo de alucinacion visual y de artefactos propios de la difusion: identidades inestables en tomas largas, deriva de color y desincronizacion audio-video en casos limite.
- La rama de audio se ha ajustado de forma conservadora; cambios adicionales de LoRAs pueden degradar la voz sin aviso.
- Requiere soporte especifico de INT8 ConvRot en ComfyUI (`comfy-kitchen`); sin el, los checkpoints INT8 no cargaran.
- El modelo no incluye informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- La fecha de creacion del repositorio (2026-11-22) y el hecho de tener 0 descargas y 0 likes indican que no ha sido validado por la comunidad.
- No se deben apilar dos filas de checkpoint a la vez segun el propio autor; hacerlo produce resultados incorrectos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sandpies/cleantie-v2Sing-hybrid
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Empaquetado ComfyUI de MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Singularity V2: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Pika-H3-Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- DMAD: https://huggingface.co/ZhengmingYu/DMAD
- Script de construccion: https://huggingface.co/sandpies/cleantie-v2Sing-hybrid/blob/main/scripts/build_v2sing_hybrid.py
