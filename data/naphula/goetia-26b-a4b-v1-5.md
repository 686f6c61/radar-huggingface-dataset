# Naphula/Goetia-26B-A4B-v1.5

## Resumen

Goetia-26B-A4B-v1.5 es un modelo de lenguaje multimodal (entrada de imagen y texto) publicado por el usuario Naphula en HuggingFace. Se trata de un merge de aproximadamente 27 modelos preentrenados, todos ellos derivados de la familia google/gemma-4-26B-A4B-it, construido con la herramienta mergekit-exp y el metodo de fusion moe_della (DELLA-Merging, arXiv:2406.11617). El resultado es un modelo de arquitectura de mezcla de expertos (MoE) con 25.999.063.326 parametros totales y un peso en disco de 52 GB en safetensors.

El modelo esta orientado de forma explicita a la escritura creativa y el roleplay: sus etiquetas incluyen ficcion, terror, romance, ciencia ficcion, generacion de tramas y sub-tramas, continuacion de escenas, prosa vivida y conversacion. No es un modelo de proposito general ni un asistente de codigo o razonamiento tecnico, sino una fusion de ajustes especializados en narrativa y personajes, con capacidad declarada de entrada de imagen y texto.

Su relevancia actual es doble: por un lado, demuestra el estado del arte de las tecnicas de model merging aplicadas a arquitecturas MoE (moe_della permite fusionar muchos checkpoints reduciendo la interferencia entre ellos); por otro, agrupa en un unico checkpoint el trabajo de una veintena de ajustes comunitarios sobre una misma base. El modelo es de acceso abierto bajo licencia Apache 2.0, con 65 descargas y 8 "me gusta" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), modalidad imagen-texto a texto; derivada de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.999.063.326 (aproximadamente 26B), segun safetensors |
| Parametros activos | Aproximadamente 4.000 millones segun la nomenclatura A4B del nombre del modelo; cifra no confirmada en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors de precision completa |
| Idiomas soportados | ingles (eng) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una fusion (merge) de checkpoints preentrenados y ajustados. La arquitectura subyacente es la de google/gemma-4-26B-A4B-it, un transformer con capas de mezcla de expertos en el que, segun la nomenclatura "A4B", se activarian alrededor de 4.000 millones de parametros por token sobre un total cercano a 26.000 millones. El pipeline declarado en HuggingFace es image-text-to-text, lo que implica un codificador visual y capacidad de procesar imagenes junto a texto.

La fusion se realizo con mergekit-exp (una variante experimental de mergekit) empleando el metodo moe_della, descrito en el articulo DELLA-Merging: reduccion de interferencia en la fusion de modelos mediante muestreo basado en magnitud (arXiv:2406.11617). Este metodo muestrea los parametros de cada modelo fuente con una probabilidad proporcional a su magnitud y reescala los deltas resultantes, lo que reduce el ruido que aparece al promediar muchos checkpoints con direcciones de ajuste dispares. Es especialmente relevante en este caso porque la lista de modelos base supera la veintena e incluye tanto ajustes finos completos como LoRAs (por ejemplo, ayagaya/gem4_26B_adapter, SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4, nbeerbower/Gemma4-Gutenberg-26B-A4B-lora).

Los modelos base declarados cubren perfiles muy distintos: destilaciones de modelos propietarios (TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2, haster/Gemma-4-26BA4B-Sonnet-3.7-Distilled-v2), ajustes de razonamiento (Gryphe/Pantheon-Reasoning-26B-A4B-1.1), ajustes de estilo y prosa (Gryphe/Gemma-4-26B-A4B-StyleTune-V2), ajustes de ficcion (electroglyph/gemma4-26b-fiction-bf16, ReadyArt/Serenity-26B-A4B, ReadyArt/Dark-Scarlett-v1.0-26B-A4B), ajustes de conocimiento (Calplus/GemmaWiki-Gemma-4-26b-a4b, nbeerbower/Gemma4-Gutenberg-26B-A4B-lora) y variantes de rol (Locutusque/Esmeralda-Gemma4-26B-A4B, Jackrong/Gemopus-4-26B-A4B-it). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en los modelos base.

## Capacidades

- Generacion de texto narrativo largo: ficcion, relato corto y novela, con etiquetas declaradas para generacion de tramas y sub-tramas.
- Escritura creativa en generos diversos: terror, romance, ciencia ficcion y "todos los generos" segun las etiquetas del autor.
- Roleplay y roleplaying conversacional, con soporte declarado para continuacion de escenas y mantenimiento de personajes.
- Prosa vivida y estilo cuidado (etiquetas vivid writing y vivid prose), orientado a descripcion sensorial y ritmo narrativo.
- Conversacion multi-turno de caracter creativo (etiqueta conversational).
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text), lo que permitiria describir imagenes o usarlas como contexto narrativo; no se detalla el alcance exacto de esta capacidad en la informacion disponible.
- Tono sin filtros declarado parcialmente: la etiqueta swearing indica tolerancia a lenguaje soez en las salidas.
- Idiomas: unicamente ingles declarado. No se anuncia soporte multilingue ni castellano.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada, aunque uno de los modelos base sea de tipo reasoning.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- Escritura asistida de ficcion: el modelo puede generar capitulos completos, continuar escenas a partir de un fragmento previo y proponer subtramas, gracias a su ajuste especifico sobre corpus de ficcion (Gutenberg, gemma4-26b-fiction) y su orientacion declarada a generacion de tramas.
- Motores de roleplay para aplicaciones de chat con personajes: mantiene conversaciones multi-turno en las que interpreta a un personaje concreto con estilo consistente y tolera lenguaje soez, lo que encaja en plataformas de RP sin filtros estrictos.
- Generacion de narrativa de terror y romance para editoriales digitales o plataformas de autopublicacion: produce borradores con tono y genero controlados mediante prompt, reduciendo el tiempo de redaccion inicial.
- Guionizacion y continuacion de escenas para videojuegos narrativos: la etiqueta scene continue y la capacidad de procesar imagenes permiten generar dialogos y descripciones a partir de un fotograma o de un boceto de escena.
- Prototipado de asistentes conversacionales creativos en ingles: util como base para demos internas donde prime el estilo y la fluidez narrativa sobre la precision factual.
- Generacion de descripciones largas y prosa vivida a partir de imagenes: el pipeline image-text-to-text permite convertir una ilustracion en un parrafo descriptivo de estilo literario.
- Creacion de contenido para campanas de marketing narrativo (storytelling de marca): el modelo puede producir relatos cortos coherentes con un universo de ficcion definido por el usuario.
- Banco de pruebas para investigacion en model merging: dado que su "receta" es un merge moe_della sobre 27 checkpoints, resulta un caso de estudio para medir como se comporta la fusion de muchos ajustes dispares en una arquitectura MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de escritura creativa, y el autor no aporta comparaciones numericas con otros modelos. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia en precision completa (bf16/fp16): los 25.999 millones de parametros ocupan aproximadamente 52 GB, por lo que se necesitan unos 56-60 GB de VRAM contando cache KV y overhead, segun la longitud de contexto efectiva.
- VRAM con cuantizacion de 8 bits: del orden de 28-30 GB.
- VRAM con cuantizacion de 4 bits: del orden de 15-17 GB, asumiendo que existan o se generen pesos GGUF/AWQ/GPTQ, algo que no esta confirmado en la informacion disponible para este repositorio.
- GPU recomendadas: para precision completa, una A100 80 GB o H100 80 GB en una sola tarjeta, o dos GPU de 40 GB (A100 40 GB, L40S) con reparto de tensor. Para 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB serian suficientes en terminos de memoria, con la salvedad de que el rendimiento real depende de las capas de expertos activadas.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas a 4 u 8 bits sobre GPU de 24 GB, siempre que el runtime soporte cuantizacion de modelos MoE. En precision completa no cabe en ninguna GPU de consumo.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servidores con GPU suficiente; llama.cpp u Ollama solo si se generan versiones GGUF, no publicadas en el repositorio consultado.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar aproximadamente 4.000 millones de parametros por token, el coste por token seria mas cercano al de un modelo denso de 4B que al de uno de 26B, pero la memoria necesaria sigue siendo la de los 26B completos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naphula/Goetia-26B-A4B-v1.5 | 25,99B (A4B) | no disponible | Merge moe_della (mergekit-exp) sobre 27 checkpoints | Apache 2.0 | HuggingFace, transformers |
| google/gemma-4-26B-A4B-it | mismo orden (modelo base) | no disponible | Entrenamiento original + ajuste de instrucciones | no disponible | HuggingFace, modelo base declarado |
| SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4 | mismo orden | no disponible | LoRA sobre la familia Goetia | no disponible | HuggingFace, modelo base declarado |
| ReadyArt/Serenity-26B-A4B | mismo orden | no disponible | Ajuste/merge orientado a ficcion | no disponible | HuggingFace, modelo base declarado |

No se dispone de datos de rendimiento comparativo entre estas variantes: todos los modelos de la tabla pertenecen a la misma familia y comparten arquitectura y tamano, por lo que las diferencias se limitan al estilo y al sesgo de los datos de ajuste, sin cifras publicadas que las cuantifiquen.

## Limitaciones y advertencias

- Idiomas: el modelo declara unicamente ingles (eng). No hay soporte anunciado de castellano ni de otras lenguas, por lo que su uso en produccion multilingue requeriria validacion previa.
- Riesgo de alucinacion: al ser un modelo orientado a ficcion y roleplay, no esta optimizado para precision factual. No debe usarse como fuente de informacion en dominios medicos, legales, financieros o cientificos.
- Sesgos: no se documenta ninguna evaluacion de sesgo. Al ser un merge de mas de veinte checkpoints de la comunidad, puede heredar sesgos de genero, raza o cultura presentes en corpus narrativos (Gutenberg, ficcion web) y en las destilaciones de modelos propietarios utilizadas como base.
- Contenido explicito: la etiqueta swearing indica tolerancia a lenguaje soez y el conjunto de modelos base incluye variantes de rol sin filtros. Es necesario aplicar moderacion propia si el despliegue esta orientado al publico general.
- Licencia: Apache 2.0 permite uso comercial, pero el hecho de que varios modelos base sean destilaciones de salidas de modelos propietarios (Claude Opus, Sonnet) introduce incertidumbre juridica sobre la procedencia de esos datos; conviene revisar las condiciones de los modelos base antes de un uso comercial.
- Ausencia de cuantizaciones publicadas: el repositorio consultado solo ofrece safetensors de precision completa (52 GB), lo que complica el despliegue en hardware de consumo sin conversion manual.
- Falta de documentacion tecnica: la model card no publica longitud de contexto, receta exacta de pesos del merge, datos de entrenamiento ni evaluaciones. No hay garantia de que el merge no haya degradado capacidades de instruccion o de vision presentes en la base.
- Tamano del repositorio: 52 GB de pesos implican tiempos de descarga y almacenamiento relevantes.
- Naturaleza experimental: el uso de mergekit-exp (variante experimental) y la ausencia de benchmarks sugieren un modelo de caracter comunitario y artistico mas que de produccion industrial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.5
- Ajustes recomendados del autor (dataset): https://huggingface.co/datasets/Naphula/Updated_Settings
- Ajustes recomendados, segunda referencia: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Repositorio de la herramienta de fusion: https://github.com/EldritchLabs/mergekit-exp
- Articulo del metodo moe_della (DELLA-Merging): https://arxiv.org/abs/2406.11617
- Modelo base principal: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base con LoRA relacionada: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4
- Modelo base de ficcion: https://huggingface.co/electroglyph/gemma4-26b-fiction-bf16
- Modelo base de razonamiento: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos pertenecian a un sitio de restauracion y no guardan relacion con la ficha.
