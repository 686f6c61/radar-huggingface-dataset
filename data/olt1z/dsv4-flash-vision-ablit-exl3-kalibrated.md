# Olt1z/DSV4-Flash-Vision-ablit-EXL3-Kalibrated

## Resumen

DSV4-Flash-Vision-ablit-EXL3-Kalibrated es una redistribucion cuantizada del modelo DeepSeek-V4-Flash-Vision-Exp, publicada por el usuario Olt1z en HuggingFace. No se trata de un entrenamiento nuevo ni de una recalibracion: el autor lo describe explicitamente como un "remontaje" (remount) de dos packs previos, GaelicThunder/DeepSeek-V4-Flash-Vision-Exp-ablit-EXL3-Kalibrated y vcruz305/DSV4-Flash-Vision-ablit-EXL3-MixedK, reorganizados en el formato estandar EXL3 para que ExLlamaV3 pueda cargarlos. Los bytes de los expertos enrutados no se han tocado; solo cambian nombres de tensor, el reparto en shards y la creacion de un `model.safetensors.index.json` que ninguno de los padres publicaba.

El modelo es un MoE multimodal (texto e imagen) de 64.063.135.678 parametros totales con 43 capas, 256 expertos enrutados y 6 activos por token, mas 3 bloques MTP. Incorpora un tower de vision que se carga como componente de `DeepseekV4ForCausalLM` y una ventana de contexto de 1.048.576 tokens (1M) gracias a una cache DSA comprimida por capa. Los pesos ocupan 111,0 GiB en disco (119,2 GB repartidos en 70 shards de safetensors y 138.291 tensores), y servir el contexto completo requiere 117,7 GiB, de modo que el objetivo declarado es una unica tarjeta de 140 GB.

Su relevancia practica es doble: por un lado, es una pieza de interoperabilidad que permite ejecutar un MoE multimodal de 1M de contexto en ExLlamaV3 y TabbyAPI; por otro, arrastra una cuantizacion mixta muy agresiva (28 capas a 3 bits y 15 capas a 2 bits, con tensores no-expertos en BF16) y una ablacion de rechazos (abliterated) que altera el comportamiento del modelo. El repositorio no incluye resultados de benchmarks y sus metricas de calidad proceden de mediciones hechas sobre el pack padre, no sobre estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (DeepSeek V4), con tower de vision, 43 capas, 256 expertos enrutados, 6 activos por token, 3 bloques MTP y capas de atencion dispersa (CSA/HCA/sliding) |
| Parametros totales | 64.063.135.678 (64,06 mil millones) |
| Parametros activos | no disponible (se conoce el enrutado: 6 de 256 expertos por token, pero el autor no publica el recuento exacto de parametros activos) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | EXL3 con trellis; mixta: 28 capas a 3 bits y 15 capas a 2 bits en los tensores de expertos enrutados; tensores no-expertos en BF16 |
| Idiomas soportados | no disponible (el repositorio no declara lista de idiomas) |
| Licencia | MIT (con `license_link` apuntando a deepseek-ai/DeepSeek-V4-Flash-Vision-Exp) |
| Formato de pesos | safetensors en formato EXL3, 70 shards, 138.291 tensores, 119,2 GB en disco (111,0 GiB) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni ajusta nada: es una operacion de reempaquetado. La arquitectura subyacente es la del DeepSeek-V4-Flash-Vision-Exp original, un transformer MoE con 43 capas, 256 expertos enrutados de los que se activan 6 por token, expertos compartidos, hyper-connections, router, 3 bloques MTP (multi-token prediction) y un tower de vision con `vision.patch_embed.proj` y aligner. La atencion usa un esquema disperso comprimido en el que conviven 21 capas CSA (factor m=4), 20 capas HCA (factor m=128) y 2 capas sliding sin pool paginado; de ahi que la cache de 1M de tokens se quede en 6.880 bytes por token, es decir, 6,72 GiB a contexto completo.

El proceso de construccion esta documentado en el script incluido `enxertar_camadas_exl3.py`. Los expertos enrutados de 22 capas calibradas a 3 bits proceden del pack de GaelicThunder en su disposicion `tp1` (tensores pre-cortados por rango de tensor-parallel), y el resto de componentes —atencion, router, hyper-connections, expertos compartidos, embeddings, head, los 3 bloques MTP y el tower de vision— proceden del pack MixedK. La transformacion consiste en eliminar el infijo `.rank0` de los nombres, reescribir la cabecera del safetensors manteniendo intactos los `data_offsets`, separar en fichero propio los tensores densos de las capas promocionadas (cuyos shards originales arrastraban tambien los expertos antiguos a 2 bits bajo los mismos nombres) y generar el indice ausente. El script aborta ante shards que mezclan dos capas, nombres de experto que no casan exactamente, formas de trellis incoherentes con el ancho de bits declarado o tensores del modelo base ausentes del indice final.

Las comprobaciones publicadas sobre los ficheros resultantes son: 0 nombres duplicados entre shards, 0 nombres con `.rank` residual, 138.291 entradas de indice coincidentes con disco sin desajustes, y anchos de bits verificados leyendo la forma del trellis (ultima dimension = 16 x K) en lugar de fiarse del config: 28 capas a 3 bits y 15 a 2 bits. En cuanto a la ablacion de rechazos, procede del trabajo de drowzeys sobre los pesos originales. No hay informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento multimodal: entrada de imagen y texto con salida de texto (`image-text-to-text`), con tower de vision cargado como parte del modelo.
- Contexto de 1M de tokens (1.048.576), util para documentos largos, repositorios completos o conversaciones muy extensas.
- Prediccion multi-token mediante 3 bloques MTP, que en el modelo original se emplean para decodificacion especulativa interna.
- Generacion de codigo: el pack padre declara un 92 % de retencion de probabilidad por token en codigo respecto al original.
- Matematicas: el pack padre declara un 99,8 % de retencion en matematicas, el ambito menos degradado por la cuantizacion.
- Capacidad de agentes y razonamiento multi-paso: no disponible como dato declarado; el repositorio no documenta soporte explicito de tool calling ni de function calling.
- Soporte multilingue: no disponible.
- Modo thinking explicito: no disponible.
- Capacidades de audio: no disponibles; el modelo es exclusivamente texto e imagen.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 1M de tokens de contexto, se puede cargar un manual completo, un corpus de RFCs o un conjunto de contratos y hacer preguntas sobre el conjunto sin trocear, apoyandose en la cache DSA comprimida para mantener el consumo en 6,72 GiB a contexto maximo.
- Inspeccion de diagramas y capturas en pipelines de ingenieria: al aceptar entrada de imagen, permite extraer informacion de diagramas de arquitectura, capturas de paneles o fotos de pizarras y convertirla en texto estructurado.
- Revision de codigo sobre repositorios completos: los 1M de tokens permiten incluir varios ficheros y su historial de cambios en una misma ventana, y la retencion declarada del 92 % en codigo sugiere que la cuantizacion no destruye la capacidad de generar codigo sintacticamente valido.
- Extraccion de datos de documentos escaneados: combinando vision y contexto largo se pueden procesar lotes de facturas, formularios o informes y devolver campos normalizados, siempre que se validen las salidas por el riesgo de alucinacion.
- Asistente conversacional de dominio con contexto acumulado: sesiones largas sin perdida de historial por truncamiento, util en soporte tecnico especializado donde el hilo completo importa.
- Generacion de resumenes y sintesis de literatura cientifica: carga de varios articulos con figuras en una sola ventana para producir revisiones comparativas.
- Investigacion sobre cuantizacion extrema: el repositorio es en si mismo un artefacto de estudio para medir el impacto de mezclas 2/3 bits en un MoE multimodal, comparando contra los packs padres.
- Despliegue en una unica tarjeta de 140 GB: escenario declarado por el autor, adecuado para servir el modelo completo con contexto largo en una sola GPU de gran memoria en lugar de repartirlo entre varias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este repositorio.

El unico dato cuantitativo de calidad es la retencion de probabilidad por token medida por GaelicThunder sobre su propio pack, no sobre estos ficheros:

| Metrica | Pack Kalibrated (padre) | Pack MixedK (padre) | Este repositorio |
|---|---|---|---|
| Retencion global por token | 90 % | 81 % | no medido (se espera >= 90 %) |
| Prosa | 87 % | no disponible | no medido |
| Matematicas | 99,8 % | no disponible | no medido |
| Codigo | 92 % | no disponible | no medido |
| Tamano de la muestra | 64.859 tokens congelados | no disponible | no aplicable |

Advertencia del propio autor: los padres almacenan los tensores no-expertos en FP8 en bloque (el pack de GaelicThunder) mientras que este remontaje los toma de MixedK en BF16, un tronco de mayor precision, por lo que la retencion esperada es igual o superior al 90 %, pero nadie ha ejecutado la prueba sobre estos ficheros. El 90 % debe tratarse como suelo heredado del padre, no como medicion de este artefacto.

## Requisitos de hardware

- VRAM para los pesos: 111,0 GiB (119,2 GB en disco) solo para el modelo cuantizado.
- VRAM para contexto completo: 117,7 GiB contando los 6,72 GiB de cache DSA a 1.048.576 tokens.
- Objetivo declarado: una unica tarjeta de 140 GB. Encajan en este perfil la H200 (141 GB), la B200 (180/192 GB) y la GB200; la MI300X (192 GB) es candidata si el backend la soporta, aunque no esta confirmado en la documentacion del repositorio.
- GPUs no viables en solitario: H100 de 80 GB, A100 de 80 GB y A100 de 40 GB se quedan cortas para los pesos completos. Requeriria repartir el modelo entre varias tarjetas, algo que ExLlamaV3 puede hacer porque almacena tensores completos y los divide al cargar.
- GPUs de consumo: no cabe en ninguna. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos del minimo de 111 GiB, y ni siquiera un conjunto de cuatro lo alcanza con margen para la cache.
- Opciones de despliegue: ExLlamaV3 (version igual o superior a v1.4.9, imprescindible porque esa release anadio el tower de vision; versiones anteriores cargan el lado texto e ignoran silenciosamente los tensores de vision) y TabbyAPI con `vision: true`, ya que su ruta de vision es generica. Otros backends como llama.cpp, Ollama, vLLM o TGI no soportan el formato EXL3 trellis y no son aplicables a estos ficheros.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo, TTFT ni resultados de decodificacion especulativa con los bloques MTP.

## Comparativa con modelos similares

La comparacion mas util es contra los artefactos de los que deriva este repositorio, ya que no hay datos publicados de alternativas de la misma categoria en la informacion disponible.

| Modelo | Parametros | Contexto | Formato y cuantizacion | Calidad declarada | Licencia |
|---|---|---|---|---|---|
| Olt1z/DSV4-Flash-Vision-ablit-EXL3-Kalibrated | 64,06 mil millones | 1M | EXL3 mixto, 28 capas 3 bits / 15 capas 2 bits, no-expertos BF16 | no medida (>= 90 % esperado) | MIT |
| GaelicThunder/DeepSeek-V4-Flash-Vision-Exp-ablit-EXL3-Kalibrated | no disponible | no disponible | EXL3 con no-expertos en FP8 en bloque, layout `tp1` | 90 % de retencion por token | no disponible |
| vcruz305/DSV4-Flash-Vision-ablit-EXL3-MixedK | no disponible | no disponible | EXL3 mixto | 81 % de retencion por token | no disponible |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | no disponible | no disponible | pesos originales sin cuantizar | referencia | enlace de licencia propio |

Comparado con MixedK, este repositorio cambia seis capas de expertos por las 22 calibradas de GaelicThunder y sube los tensores no-expertos de FP8 a BF16, lo que en teoria mejora la fidelidad a costa de tamano. Comparado con el pack Kalibrated original, la diferencia es de formato y de layout: este se puede cargar directamente en ExLlamaV3 sin transformaciones previas.

## Limitaciones y advertencias

- Modelo ablacionado: los pesos llevan la ablacion de rechazos de drowzeys, lo que altera el comportamiento ante peticiones que el modelo original rechazaria. No es adecuado como sustituto directo del modelo original en aplicaciones con requisitos de moderacion.
- Cuantizacion muy agresiva: 15 de 43 capas tienen sus expertos a 2 bits. La perdida de calidad es acumulativa y el propio autor reconoce que la retencion del 90 % se midio sobre el pack padre, no sobre estos ficheros.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual, y una cuantizacion a 2 bits tiende a incrementar los errores en tareas de conocimiento factual y aritmetica larga.
- Contexto de 1M: aunque la cache esta comprimida, la atencion sobre ventanas tan largas sigue siendo susceptible a perdida de informacion en el centro del contexto; no hay datos de rendimiento tipo needle-in-a-haystack para este artefacto.
- Idiomas: el repositorio no declara lista de idiomas soportados. No se puede asumir buen rendimiento en castellano sin verificacion previa.
- Compatibilidad estricta de backend: requiere exllamav3 >= v1.4.9. Con versiones anteriores el modelo arranca pero ignora la vision sin avisar, lo que produce fallos silenciosos en produccion.
- Dependencia de TabbyAPI para servir vision: hay que activar `vision: true` explicitamente en la configuracion.
- Licencia: el repositorio declara MIT, pero el campo `license_link` apunta a la licencia del modelo DeepSeek original. Conviene revisar los terminos del modelo base antes de un uso comercial, ya que la licencia de los pesos derivados puede estar condicionada por la del modelo original.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin publicacion de benchmarks ni validacion independiente. Es un artefacto de nicho mantenido por un usuario individual.
- Requisito de hardware muy restrictivo: 117,7 GiB de VRAM para contexto completo excluye cualquier GPU de consumo y la mayoria de GPUs de centro de datos de 80 GB en configuracion de una sola tarjeta.
- Fechas de publicacion en 2026: el repositorio se creo el 2026-09-10 y se actualizo el mismo dia, por lo que se trata de un artefacto reciente y sin historial de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Olt1z/DSV4-Flash-Vision-ablit-EXL3-Kalibrated
- Modelo base (pack calibrado): https://huggingface.co/GaelicThunder/DeepSeek-V4-Flash-Vision-Exp-ablit-EXL3-Kalibrated
- Modelo base (pack MixedK): https://huggingface.co/vcruz305/DSV4-Flash-Vision-ablit-EXL3-MixedK
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Documentacion de la metodologia Kalibrated: https://github.com/GaelicThunder/DeepSeek-V4-Flash-Vision-One-DGX-Spark/blob/main/docs/KALIBRATED.md
- Script de remontaje incluido en el repositorio: enxertar_camadas_exl3.py
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- No se han encontrado articulos, papers ni demos adicionales en la busqueda web realizada.
