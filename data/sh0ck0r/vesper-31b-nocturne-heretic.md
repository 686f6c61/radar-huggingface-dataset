# sh0ck0r/Vesper-31B-Nocturne-heretic

## Resumen
Vesper-31B-Nocturne-heretic es un ajuste fino (finetune) del modelo ReadyArt/Vesper-31B-Nocturne, publicado por el usuario sh0ck0r en Hugging Face. Se trata de una version "decensored" o "abliterated" del modelo original, generada con la herramienta Heretic v2.1.0, que aplica una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre determinadas capas del transformer para reducir la tasa de rechazos (refusals) ante peticiones que el modelo base rechazaria.

El modelo cuenta con 31.273.086.512 parametros (aproximadamente 31.000 millones) almacenados en formato safetensors, con un repositorio de 62,6 GB. Esta orientado a generacion de texto conversacional, con enfasis en roleplay, contenido para adultos, conversaciones multi-personaje y ensembles. Su licencia es Apache 2.0 y declara soporte unicamente para ingles.

La relevancia de esta ficha radica en que documenta un caso de modificacion de alineamiento mediante ablacion de pesos, una practica extendida en la comunidad open source para eliminar comportamientos de rechazo. El autor publica los parametros exactos de la ablacion y material para reproducir el proceso, lo que permite evaluar la tecnica con rigor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, tag `gemma4`); detalles de capas y atencion no disponibles |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de ReadyArt/Vesper-31B-Nocturne, un modelo de 31.000 millones de parametros etiquetado con la familia `gemma4`. No se dispone de informacion detallada sobre el numero de capas, dimension del hidden state, mecanismo de atencion ni longitud de contexto en la informacion proporcionada. El ajuste aplicado no es un entrenamiento adicional con datos, sino una modificacion de pesos mediante ablacion.

La tecnica empleada es Arbitrary-Rank Ablation (ARA) implementada en Heretic v2.1.0. Los parametros publicados por el autor son: `start_layer_index` = 27, `end_layer_index` = 38, `preserve_good_behavior_weight` = 0,1208, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,9806 y `neighbor_count` = 14. La ablacion se aplica sobre el rango de capas 27 a 38, lo que sugiere que el modelo tiene al menos 39 capas. El autor indica que el proceso es reproducible y publica un directorio `reproduce` con instrucciones.

El resultado declarado es una reduccion de rechazos de 71/100 en el modelo original a 16/100 en esta version, con una divergencia KL de 0,0266 respecto al modelo base. No se especifican datos de entrenamiento original, composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades
- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Roleplay y conversaciones multi-personaje (ensemble), segun las etiquetas del autor.
- Generacion de contenido adulto y NSFW, al haber sido decensurado mediante ablacion.
- Reduccion de rechazos ante peticiones que el modelo base rechazaria (16/100 frentes a 71/100).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Roleplay conversacional: el modelo esta ajustado para mantener personajes y dialogos prolongados en ingles, con menor tasa de rechazo que el modelo base, lo que lo hace adecuado para plataformas de entretenimiento narrativo.
- Escritura creativa para adultos: permite generar ficcion madura sin las interrupciones por rechazo que introduce el alineamiento del modelo original, util en editoriales de contenido para mayores de edad.
- Simulacion de dialogos multi-personaje: la etiqueta `ensemble` sugiere uso en guiones o narrativa con varios interlocutores, aprovechando la ventana de contexto (no documentada) para mantener coherencia entre turnos.
- Investigacion sobre alineamiento y ablacion: al publicarse los parametros ARA y el material de reproduccion, sirve como caso de estudio para medir el efecto de la ablacion sobre la tasa de rechazos y la divergencia KL.
- Evaluacion comparativa de decensurado: util para comparar tecnicas de abliteration frente a otros modelos modificados, midiendo refusals y calidad conversacional.
- Generacion de contenido de ficcion interactiva en entornos controlados: integrable en aplicaciones de chat donde se requiera baja tasa de rechazo, siempre con filtros propios y control de acceso por edad.

## Benchmarks y rendimiento
Los unicos datos publicados por el autor son las metricas de la ablacion:

| Metrica | Este modelo | Modelo original (ReadyArt/Vesper-31B-Nocturne) |
|---|---|---|
| Rechazos (refusals) | 16/100 | 71/100 |
| Divergencia KL | 0,0266 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 62 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o multiples GPU con tensor parallelism.
- Cuantizacion: el repositorio solo incluye safetensors; para reducir VRAM seria necesario cuantizar a 8 bits (unos 31 GB) o 4 bits (unos 16 GB), aunque no se ofrecen variantes GGUF oficiales.
- GPU de consumo: en 4 bits podria caber en una RTX 4090 (24 GB) de forma ajustada; en 8 bits no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp u Ollama requeririan conversion previa a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Vesper-31B-Nocturne-heretic | 31,27 B | no disponible | Apache 2.0 | Roleplay NSFW decensurado |
| ReadyArt/Vesper-31B-Nocturne | no disponible | no disponible | no disponible | Modelo base conversacional |
| Otros modelos abliterated de ~30 B | no disponible | no disponible | variable | Decensurado por ablacion |

No se dispone de datos de benchmarks comparativos ni de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo ha sido decensurado mediante ablacion; se elimina parte del comportamiento de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o ilegal si no se aplican filtros externos.
- Contenido NSFW y para adultos: no apto para menores ni para entornos sin control de acceso por edad.
- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- La ablacion puede degradar capacidades generales: la divergencia KL de 0,0266 indica una desviacion medible respecto al modelo base, con posible perdida de coherencia o precision en tareas no conversacionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; en un modelo orientado a roleplay el riesgo es alto.
- No se documentan sesgos conocidos, pero al derivar de un modelo base sin informacion de entrenamiento no es posible descartarlos.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- No se ofrecen cuantizaciones oficiales ni garantias de soporte.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sh0ck0r/Vesper-31B-Nocturne-heretic
- Modelo base: https://huggingface.co/ReadyArt/Vesper-31B-Nocturne
- Heretic: https://heretic-project.org
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo
