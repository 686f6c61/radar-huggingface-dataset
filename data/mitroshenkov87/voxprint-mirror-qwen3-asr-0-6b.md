# Mitroshenkov87/voxprint-mirror-qwen3-asr-0.6b

## Resumen

`Mitroshenkov87/voxprint-mirror-qwen3-asr-0.6b` es un espejo de copia de seguridad (mirror) sin modificaciones de `Qwen/Qwen3-ASR-0.6B`, publicado por el usuario Mitroshenkov87 para la aplicación de clonación de voz y audiolibros Voxprint. No se trata de un modelo nuevo ni de un ajuste fino: según la propia model card, los ficheros son idénticos byte a byte a los del repositorio original en el commit `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`, y lo único que cambia es el `README.md`. Cualquier evaluación técnica debe por tanto referirse al modelo original de Qwen.

El modelo subyacente pertenece a la familia Qwen3-ASR de Alibaba Qwen, formada por Qwen3-ASR-1.7B y Qwen3-ASR-0.6B. Son modelos de reconocimiento automático de voz (ASR) e identificación de idioma que cubren 52 lenguas y dialectos (30 idiomas y 22 dialectos del chino), construidos sobre la base del modelo fundacional multimodal Qwen3-Omni. La variante de 0.6B está orientada al equilibrio entre precisión y eficiencia, con inferencia unificada en modo streaming y offline.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de descarga para entornos donde el repositorio original no esté accesible; por otro, recuerda que el espejo no aporta ninguna garantía adicional de mantenimiento, versionado ni soporte, ya que el repositorio original sigue siendo la fuente autoritativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; familia Qwen3-ASR construida sobre el modelo fundacional Qwen3-Omni (modelo de audio + decodificador de lenguaje) |
| Parametros totales | 938.008.576 (~0,94 B) segun los pesos safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible. El modelo opera sobre audio; se menciona soporte de transcripcion de audio largo y de hasta 5 minutos para el modelo complementario Qwen3-ForcedAligner-0.6B |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos en safetensors (precision original, presumiblemente BF16 por el tamano del repo de 1,9 GB); no se publican ficheros GGUF, AWQ ni GPTQ |
| Idiomas soportados | 52 lenguas y dialectos: 30 idiomas (chino, ingles, cantonés, arabe, aleman, frances, espanol, portugues, indonesio, italiano, coreano, ruso, thai, vietnamita, japones, turco, hindi, malayo, neerlandes, sueco, danes, finlandes, polaco, checo, filipino, persa, griego, hungaro, macedonio, rumano) y 22 dialectos del chino (Anhui, Dongbei, Fujian, Gansu, Guizhou, Hebei, Henan, Hubei, Hunan, Jiangxi, Ningxia, Shandong, Shaanxi, Shanxi, Sichuan, Tianjin, Yunnan, Zhejiang, cantonés con acento de Hong Kong, cantonés con acento de Guangdong, wu y minnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipos de audio soportados | Habla, voz cantada y canciones con musica de fondo (BGM) |
| Modos de inferencia | Offline y streaming unificados en un solo modelo |
| Tamano del repositorio | 1,9 GB |
| Descargas / likes en el espejo | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna del modelo (numero de capas, dimension del encoder de audio, mecanismo de atencion ni configuracion exacta del decodificador). Lo que si se indica es que la familia Qwen3-ASR se apoya en la capacidad de comprension de audio del modelo fundacional Qwen3-Omni, y que el entrenamiento emplea datos de habla a gran escala. No se especifica el numero de tokens de audio procesados, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion.

Entre las innovaciones tecnicas declaradas por el autor original destacan tres: la inferencia unificada en modo streaming y offline con un unico conjunto de pesos, el soporte de transcripcion de audio de larga duracion, y la existencia de un modelo complementario independiente, Qwen3-ForcedAligner-0.6B, que realiza alineacion forzada no autorregresiva (NAR) con prediccion de marcas de tiempo para unidades arbitrarias en hasta 5 minutos de audio y 11 idiomas. El paquete oficial `qwen-asr` ofrece dos backends de ejecucion (transformers y vLLM) e incluye inferencia por lotes, servicio asincrono, inferencia en streaming y prediccion de timestamps. No se documentan mecanismos como decodificacion especulativa ni atencion lineal en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico de voz (ASR) en 30 idiomas y 22 dialectos del chino, con identificacion automatica de idioma incluida en el mismo modelo.
- Transcripcion robusta en entornos acusticos complejos y con patrones de texto dificiles, segun la model card original.
- Procesamiento de voz cantada y de canciones con musica de fondo, no solo habla limpia.
- Inferencia en modo streaming y offline con el mismo modelo, lo que permite tanto subtitulado en tiempo real como transcripcion por lotes.
- Transcripcion de audio de larga duracion (segmentacion interna no detallada en la informacion disponible).
- Alineacion forzada con marcas de tiempo mediante el modelo separado Qwen3-ForcedAligner-0.6B (hasta 5 minutos y 11 idiomas).
- Inferencia por lotes y servicio asincrono a traves del backend vLLM del paquete `qwen-asr`.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico: es un modelo especializado en audio, no un LLM de proposito general.
- No se documentan capacidades de vision, razonamiento multi-paso ni modo de pensamiento (thinking mode) en la informacion disponible.

## Casos de uso

- Subtitulado en tiempo real: el modo streaming del modelo permite generar subtitulos mientras se reproduce el audio, sin necesidad de cargar un segundo modelo para el modo offline. Es adecuado para retransmisiones, videoconferencias y accesibilidad en directo.
- Generacion de subtitulos para bibliotecas de video: con el backend vLLM se pueden transcribir lotes de ficheros de audio o video en paralelo, y el soporte de 52 lenguas y dialectos reduce la necesidad de pipelines separados por idioma.
- Aplicaciones de clonacion de voz y audiolibros: es el escenario para el que se publico este espejo, dentro del proyecto Voxprint, donde la transcripcion previa del material fuente es un paso obligatorio antes de sintetizar voz.
- Atencion al cliente y analitica de llamadas: transcripcion de conversaciones telefonicas, incluyendo variedades dialectales del chino y acentos del ingles de distintas regiones, para alimentar sistemas de busqueda, resumen o control de calidad.
- Documentacion clinica o legal dictada: la combinacion de reconocimiento robusto y prediccion de marcas de tiempo (con ForcedAligner) permite generar transcripciones navegables y auditables, con salto directo al fragmento de audio correspondiente.
- Procesamiento de contenido musical y podcasts: al aceptar voz cantada y canciones con BGM, cubre casos que los modelos ASR entrenados solo con habla limpia suelen resolver mal, como letras de canciones o podcasts con musica de fondo.
- Despliegue en el borde (edge) o en hardware modesto: con menos de mil millones de parametros y pesos que ocupan alrededor de 1,9 GB, es viable ejecutarlo en GPU de consumo e incluso en equipos con aceleracion integrada, algo impracticable con modelos ASR de mayor tamano.
- Identificacion de idioma en corpus no etiquetados: el modelo realiza deteccion de idioma junto con la transcripcion, lo que sirve para clasificar y enrutar grandes volumenes de audio antes de un procesamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el modelo concreto de 0,6B. La model card original unicamente afirma de forma cualitativa que la variante de 1,7B alcanza rendimiento de ultima generacion (state of the art) entre los modelos ASR de codigo abierto y resulta competitiva con las APIs comerciales propietarias mas potentes, y que la variante de 0,6B ofrece un compromiso entre precision y eficiencia, alcanzando 2000 veces el tiempo real de throughput con una concurrencia de 128. No se han facilitado cifras de WER, MMLU, HumanEval, GSM8K ni de ningun otro benchmark, por lo que no se incluyen tablas comparativas de rendimiento.

| Metrica | Qwen3-ASR-0.6B | Qwen3-ASR-1.7B |
|---|---|---|
| Throughput declarado | 2000x tiempo real con concurrencia 128 | No disponible |
| Rendimiento ASR | No disponible (descrito como compromiso precision/eficiencia) | Descrito como SOTA en codigo abierto, competitivo con APIs comerciales |
| WER por idioma | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,9 GB en BF16 (938 M de parametros x 2 bytes), alrededor de 3,8 GB en FP32, unos 0,9 GB en INT8 y unos 0,5 GB en INT4. Son calculos derivados del numero de parametros, no cifras publicadas por el autor.
- VRAM total recomendada: suma a lo anterior la memoria del encoder de audio y la cache de claves/valores, que crece con la duracion del audio procesado. Como referencia practica, reservar entre 3 y 6 GB para inferencia en BF16 con audio de duracion moderada. No se dispone de cifras oficiales.
- GPU de consumo: cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060, RTX 3070, RTX 4060, RTX 4070 o RTX 4090. En tarjetas de 4-6 GB podria requerir cuantizacion o audio en fragmentos cortos.
- GPU de centro de datos: A100, H100, L40S o similares permiten maximizar la concurrencia; el dato de 2000x tiempo real a concurrencia 128 corresponde a este tipo de despliegue.
- Opciones de despliegue: el paquete oficial `qwen-asr` (backend transformers o backend vLLM) y la imagen Docker oficial. No se confirma en la informacion disponible soporte en llama.cpp, Ollama, LM Studio o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: el unico dato publicado es el de 2000x tiempo real con concurrencia 128 para el modelo de 0,6B. No se dispone de cifras de latencia por peticion ni de tiempo hasta el primer token en streaming.
- No se han publicado requisitos oficiales de CPU, RAM ni almacenamiento mas alla del tamano del repositorio, 1,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (este espejo) | ~0,94 B | 30 idiomas + 22 dialectos chinos | Apache-2.0 | safetensors | Soporte de streaming y offline, voz cantada y BGM, toolkit vLLM |
| Qwen3-ASR-1.7B | ~1,7 B (dato no confirmado en la informacion disponible) | 30 idiomas + 22 dialectos chinos | Apache-2.0 | safetensors | Declarado SOTA en codigo abierto por el autor original |
| Whisper large-v3 | ~1,55 B | ~99 idiomas | MIT | safetensors, GGUF, entre otros | Referencia habitual en ASR abierto; no soporta dialectos chinos especificos ni tiene modo streaming nativo |
| Whisper large-v3-turbo | ~0,81 B | ~99 idiomas | MIT | safetensors, GGUF, entre otros | Tamano comparable al modelo de esta ficha; orientado a menor latencia |

Los datos de parametros, idiomas y licencias de los modelos comparados proceden de su documentacion publica. No se dispone de comparaciones de WER ni de otras metricas entre Qwen3-ASR-0.6B y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial. No esta afiliado ni respaldado por los autores de Qwen, no recibe actualizaciones del modelo y puede quedar desincronizado; el mantenedor no ofrece garantias de disponibilidad.
- La etiqueta `base_model:finetune` que aparece en los tags de HuggingFace no describe la realidad del repositorio: la propia model card indica que los ficheros son identicos byte a byte al original. No es un ajuste fino y no debe tratarse como tal.
- El repositorio tiene 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad sobre la integridad del espejo. La verificacion se delega en el manifiesto SHA-256 del repositorio Voxprint.
- Riesgo de alucinacion: no se ha documentado el comportamiento del modelo ante audio con ruido extremo, silencios largos o habla solapada. Como todo modelo ASR generativo, puede producir texto plausible que no corresponde al audio, especialmente en segmentos ininteligibles.
- Sesgos: no se ha publicado informacion sobre sesgos por acento, genero, edad o variedad dialectal. El soporte de 22 dialectos del chino no implica precision uniforme entre ellos.
- Cobertura linguistica desigual: aunque se declaran 52 lenguas y dialectos, la distribucion del entrenamiento no es publica; es previsible un rendimiento inferior en idiomas con menos representacion, como el macedonio o el filipino.
- Limitaciones de audio: la documentacion no especifica la duracion maxima de audio por peticion, el sample rate de entrada admitido ni la tolerancia a ruido de fondo en produccion.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion. La model card recuerda que todos los derechos del modelo pertenecen a sus autores originales.
- Ausencia de soporte de tool calling o comportamiento agentico: no debe integrarse como un LLM de proposito general ni esperar de el razonamiento multi-paso.
- Produccion: al no existir pesos cuantizados oficiales ni soporte confirmado en llama.cpp u Ollama, la ruta recomendada pasa por el paquete `qwen-asr` y el backend vLLM, lo que condiciona la arquitectura del despliegue.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/Mitroshenkov87/voxprint-mirror-qwen3-asr-0.6b
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Modelo de mayor tamano de la familia: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo de alineacion forzada: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio GitHub de Voxprint: https://github.com/Mitroshenkov87/voxprint
- Referencia arXiv indicada en los tags: https://arxiv.org/abs/2601.21337
- Descarga alternativa via ModelScope: `modelscope download --model Qwen/Qwen3-ASR-0.6B --local_dir ./Qwen3-ASR-0.6B`
- Descarga via HuggingFace CLI: `huggingface-cli download Qwen/Qwen3-ASR-0.6B --local-dir ./Qwen3-ASR-0.6B`
