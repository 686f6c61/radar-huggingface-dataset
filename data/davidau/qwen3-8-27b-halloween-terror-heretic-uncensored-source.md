# DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source

## Resumen

Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source es un fine-tune experimental de 27 mil millones de parametros creado por DavidAU, un autor prolifico de modelos especializados en escritura creativa y roleplay en Hugging Face. El modelo parte de trohrbaugh/Qwen3.8-27B-heretic-ara, una variante "abliterated/heretic" (sin alineamiento de seguridad) de la familia Qwen3.8, y se ha reentrenado sobre un dataset de terror para construir lo que el autor denomina "Halloween O/S": un sistema de roleplay horror con diez personajes malvados preconfigurados (Joker, Pennywise, Freddy Krueger, Vecna, Chucky, etc.) y la posibilidad de "invocar" cualquier persona o criatura arbitraria.

El modelo se presenta en dos formatos: esta version "source" en safetensors (27,36 mil millones de parametros, 55,6 GB de repo) y versiones GGUF con soporte MTP (multi-token prediction) publicadas por el mismo autor. Es un modelo multimodal image-text-to-text, con 13 modos de razonamiento y 13 modos instruct accesibles mediante comandos de prompt tipo `[summon:help]`. Su relevancia es nicho y estacional: es un modelo de entretenimiento para generacion de ficcion de terror y roleplay inmersivo, no una herramienta de productividad, y el propio autor advierte de que no debe usarse para tareas serias ni con tools habilitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), multimodal image-text-to-text; detalles no disponibles |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible oficialmente; el autor recomienda minimo 64k |
| Tipos de cuantizacion | GGUF (Q4_K_S no imatrix, IQ3_S mencionado en ejemplos, imatrix y quants altos sugeridos); version source en FP16/BF16 (safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (source), GGUF (versiones NEO con MTP y GSQ-RCO) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de trohrbaugh/Qwen3.8-27B-heretic-ara, que a su vez es una derivada "heretic" (abliterada, sin refusal) de la base Qwen3.8 de 27B, una arquitectura transformer densa multimodal de la familia Qwen de Alibaba. Sobre esa base, DavidAU ha aplicado un entrenamiento con un dataset de horror y un sistema de prompts de personalidad ("Halloween O/S") que define diez constructos de IA malvados con fichas de personaje de 2000-4000 tokens de precision cada uno, segun el autor. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como DPO o RLHF.

Como caracteristicas tecnicas destacables, el modelo expone 13 modos de razonamiento (thinking) y 13 modos instruct conmutables desde el propio prompt, y las versiones GGUF "NEO" incorporan MTP (multi-token prediction) para acelerar la decodificacion, ademas de cuantizaciones GSQ-RCO (MTP). El pipeline declarado es image-text-to-text, con soporte de vision mediante un archivo mmproj que debe descargarse por separado y colocarse junto a los GGUF.

## Capacidades

- Generacion de texto creativo de terror en todos los generos (story, fiction, writing, all genres)
- Roleplay inmersivo con diez personajes preconfigurados ("Evil Constructs") y creacion de personajes arbitrarios ("conjure")
- Modo thinking/reasoning completo, con 13 modos de razonamiento seleccionables
- 13 modos instruct conmutables mediante comandos `[summon:...]`
- Comprension de imagenes (pipeline image-text-to-text, requiere archivo mmproj en las versiones GGUF)
- Conversacion multi-turno de larga duracion (contexto recomendado de 64k o mas)
- Simulaciones de personajes malvados ("evil sims")
- Sin soporte recomendado de tool calling: el autor prohibe explicitamente habilitar tools
- Ingles unicamente como idioma declarado

## Casos de uso

- Roleplay de horror interactivo: el usuario conversa uno a uno con constructos como Pennywise o Freddy Krueger, con respuestas en caracter mantenidas durante sesiones largas gracias al contexto recomendado de 64k.
- Escritura de ficcion de terror: generacion de relatos, capitulos y guiones en el genero horror, aprovechando el dataset de entrenamiento especializado y los modos creativos.
- Creacion de antagonistas a medida: mediante el comando "conjure" el modelo construye personajes malvados personalizados a partir de una descripcion o emocion del usuario, util para escritores que disenan villanos.
- Generacion de dialogos y monologos de villanos: los modos instruct permiten producir dialogos en voz de personajes concretos para novelas, juegos de rol o contenido narrativo.
- Experimentacion con modelos abliterados: al ser un fine-tune heretic/uncensored sin refusals, sirve como banco de pruebas para estudiar el comportamiento de modelos sin alineamiento en entornos controlados de entretenimiento.
- Demostracion de sistemas de prompts emergentes: el "Halloween O/S" con menu interactivo `[summon:help]` es un ejemplo de orquestacion de personalidades multiples dentro de un unico modelo, util como referencia para diseno de prompts de roleplay.
- Vision aplicada a narrativa: con el mmproj, puede describir imagenes (atmosfericas, de terror) e integrarlas en la narrativa del roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es cualitativo: el autor muestra salidas de ejemplo generadas con el quant Q4_K_S (no imatrix) e indica que quants superiores o imatrix producen resultados mas fuertes.

## Requisitos de hardware

- VRAM estimada: la version source en safetensors (~55,6 GB) requiere aproximadamente 56-60 GB de VRAM en FP16/BF16, o ~28-30 GB con cuantizacion a 8 bits. En GGUF Q4_K_S, el peso rondaria ~16-17 GB; en IQ3_S, ~12-13 GB.
- GPU recomendadas: para la version source, A100 80GB, H100 o multiples GPU consumer (2x RTX 3090/4090 con offload). Para los GGUF, una RTX 3090 o RTX 4090 de 24 GB ejecuta Q4_K_S comodamente; IQ3_S cabe incluso en GPUs de 16 GB.
- Consumer GPUs: si cabe en una RTX 4090 (24 GB) con los quants Q4; con quants IQ3 y offload parcial, viable en RTX 4080/4070 Ti Super con soporte de CPU offload.
- Despliegue: llama.cpp (formato GGUF, con mmproj para vision), Ollama, LM Studio y backends compatibles con transformers para la version source. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponible; las versiones GGUF con MTP (multi-token prediction) estan orientadas a acelerar la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B-Halloween-Terror-Heretic (este) | 27,36 B | 64k+ (recomendado) | Apache 2.0 | Roleplay horror, abliterado, multimodal |
| Base trohrbaugh/Qwen3.8-27B-heretic-ara | 27,36 B | no disponible | no disponible | Base heretic sin tematizar |
| Qwen3-30B-A3B (referencia familia) | 30,5 B (3,3 B activos, MoE) | 128k | Apache 2.0 | Uso general, razonamiento |

Frente a la base Qwen3.8-27B heretic de la que deriva, este modelo anade la capa de roleplay horror, los modos summon y el entrenamiento tematico, sin cambiar la arquitectura. Frente a un Qwen3 generalista, sacrifica utilidad productiva (sin tools, sin benchmarks, advertencias contra uso serio) a cambio de un comportamiento narrativo muy especializado y sin refusals.

## Limitaciones y advertencias

- Modelo abliterado/uncensored: sin mecanismos de refusal, puede generar contenido perturbador, violento o inapropiado. El propio repo lleva el tag "not-for-all-audiences".
- Riesgo elevado de alucinacion en tareas factuales: el autor advierte explicitamente "DO NOT believe a word the O/S says" y recomienda verificar todo si se le pregunta algo serio.
- No apto para produccion general: es un showcase de entretenimiento para Halloween, no un modelo de proposito general.
- Tools deshabilitadas por diseno: el autor prohibe habilitar function calling; no es apto para agentes ni pipelines automatizados.
- Idioma: solo declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Contexto: no hay longitud de contexto oficial publicada; el autor sugiere 64k como minimo para conversaciones largas, pero el limite real depende de la base Qwen3.8 y no esta documentado.
- Cuantizacion: los quants bajos (IQ3_S) degradan visiblemente la calidad de la prosa segun los ejemplos del autor; se recomiendan quants altos o imatrix.
- Licencia Apache 2.0 sin restricciones comerciales adicionales, pero el contenido generado puede requerir revision por su naturaleza sin filtros.

## Enlaces

- Modelo source: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source
- Versiones GGUF (NEO/FULL MTP): https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-NEO-GGUF
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
