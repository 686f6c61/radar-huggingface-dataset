# ldov/campplus-zh-en-onnx

## Resumen

`ldov/campplus-zh-en-onnx` es un modelo de extraccion de embeddings de hablante (speaker embedding) en formato ONNX, reempaquetado para la libreria sherpa-onnx. No es un modelo de lenguaje: su funcion es convertir un fragmento de audio de voz en un vector de 192 dimensiones que representa la identidad del hablante, lo que permite tareas de verificacion de hablante y diarizacion (quien habla y cuando) sin depender de servicios en la nube. El modelo base es `speech_campplus_sv_zh_en_16k-common_advanced` de 3D-Speaker, con arquitectura CAM++ sobre backbone D-TDNN, entrenado especificamente con habla code-switched chino mandarin/taiwanes e ingles.

El repositorio anade al artefacto oficial fp32 dos variantes cuantizadas, fp16 e int8, generadas con `onnxconverter_common.float16` (manteniendo el subgrafo de estadisticas en fp32) y `onnxruntime.quantize_dynamic`. El objetivo declarado es la ejecucion en dispositivo, solo CPU, en escenarios multilingues: el modelo ocupa entre 27 MB (fp32) y 8,2 MB (int8), con una entrada de 80 dimensiones de fbank a 16 kHz, lo que permite integrarlo en aplicaciones moviles Android.

Su relevancia practica esta en el nicho de transcripcion y diarizacion offline: la model card incluye un benchmark sobre un Pixel 6 (ARM64, 4 hilos) que compara las tres precisiones contra el embedder anterior (`eres2net_base` de 3D-Speaker) en dos clips reales, con resultados de latencia por utterance y margen de separacion entre hablantes. Fue producido para el proyecto VoxSumDroid (transcripcion, diarizacion y resumen offline en Android). El repositorio es de un autor no oficial, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ sobre backbone D-TDNN (context-dependent attention, familia 3D-Speaker) |
| Parametros totales | no disponible (el artefacto fp32 ocupa 27 MB, pero no se publica el recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de embedding a nivel de utterance con entrada de 80-dim fbank a 16 kHz |
| Tipos de cuantizacion | fp32, fp16 (subgrafo de estadisticas en fp32) e int8 dinamico |
| Idiomas soportados | chino (mandarin/taiwanes) e ingles, incluyendo habla code-switched |
| Licencia | Apache-2.0 (heredada de 3D-Speaker / ModelScope) |
| Formato de pesos | ONNX (tres ficheros: `campplus_zh_en_fp32.onnx`, `campplus_zh_en_fp16.onnx`, `campplus_zh_en_int8.onnx`) |
| Dimension del embedding | 192 |
| Frecuencia de muestreo | 16 kHz |
| Extraccion de caracteristicas | fbank de 80 dimensiones |
| Tamano de ficheros | 27 MB (fp32), 14 MB (fp16), 8,2 MB (int8) |
| Tamano del repositorio | 0,1 GB |
| Libreria / runtime | sherpa-onnx (ONNX Runtime como backend) |
| Pipeline declarado | audio-classification |
| Fecha de creacion en HuggingFace | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo es una red CAM++ (context-dependent attention aggregation) construida sobre un backbone D-TDNN, la arquitectura de la familia 3D-Speaker para speaker verification. La red procesa caracteristicas fbank de 80 dimensiones a 16 kHz y agrega la informacion temporal mediante atencion dependiente de contexto, produciendo un embedding de 192 dimensiones con normalizacion implicita para comparacion por similitud coseno. El modelo base, `speech_campplus_sv_zh_en_16k-common_advanced`, fue entrenado especificamente con datos code-switched chino-ingles, lo que explica el diseno bilingue en lugar del clasico ingles/zh mono-idioma.

Sobre el entrenamiento no se detallan en la informacion disponible ni el numero de tokens, ni la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO (tecnicas poco habituales en modelos de embedding). Las tres precisiones ONNX derivan de un unico artefacto fp32: la version fp16 se obtuvo con `onnxconverter_common.float16` conservando el subgrafo de estadisticas en fp32 para no degradar la normalizacion, y la int8 con cuantizacion dinamica de ONNX Runtime. La innovacion tecnica destacable del repositorio no es arquitectonica, sino de empaquetado: ofrecer variantes de precision con un benchmark reproducible de latencia y separacion de hablantes sobre CPU ARM.

## Capacidades

- Extraccion de embeddings de hablante: genera un vector de 192 dimensiones por utterance, adecuado para comparacion por distancia coseno.
- Diarizacion de hablantes: soporta pipelines de "quien habla y cuando" cuando se combina con clustering (la model card evalua el resultado de clustering a 2 y 3 hablantes).
- Verificacion de hablante: permite comparar embeddings contra umbrales para tareas de identificacion o comprobacion de identidad.
- Multilingue code-switched: funciona con audio en chino mandarin/taiwanes e ingles, incluso mezclados en el mismo clip, sin segmentacion previa por idioma.
- Ejecucion en dispositivo: inferencia exclusivamente en CPU, sin dependencia de GPU ni de conectividad de red.
- Tres niveles de precision: fp32, fp16 e int8, seleccionables segun el compromiso entre tamano en disco, latencia y precision.
- Integracion con sherpa-onnx: API `SpeakerEmbeddingExtractor` disponible en Python, C++ y otros bindings de la libreria; el fichero ONNX tambien puede consumirse directamente con ONNX Runtime.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, vision ni audio distinto de la voz para embedding (no hay capacidades multimodales declaradas).

## Casos de uso

- Diarizacion offline en Android: el modelo fp16 ocupa 14 MB y procesa cada utterance en unos 70 ms en un Pixel 6 con 4 hilos, de modo que una app de grabacion puede etiquetar hablantes sin enviar audio a la nube y sin coste de red. Es el caso de uso original para el que se produjo, dentro del proyecto VoxSumDroid.
- Transcripcion de reuniones con atribucion de hablante: combinando el embedding con un sistema ASR como los que distribuye sherpa-onnx, se puede generar un acta donde cada intervencion queda atribuida al hablante correcto por clustering sobre los embeddings de cada segmento.
- Atencion al cliente con analitica de conversacion: en llamadas de centro de contacto, el embedding permite separar agente y cliente, medir tiempos de habla por rol y comprobar automaticamente si el agente ha dominado la conversacion, todo con procesamiento local.
- Verificacion de identidad por voz en dispositivos: en un escenario de autenticacion simple, se compara el embedding de la frase de prueba con el embedding de referencia del usuario y se aplica un umbral de distancia coseno, sin necesidad de GPU.
- Subtitulado y catalogacion de contenido bilingue: para contenido con code-switching chino/ingles, el modelo mantiene la coherencia de identidad de hablante a traves de cambios de idioma dentro del mismo clip, algo que los embedders mono-idioma no garantizan.
- Indexado y busqueda por hablante en archivos: extrayendo embeddings de un corpus de audio archivado y almacenandolos en un indice vectorial, se pueden recuperar todos los fragmentos de una persona concreta sin transcripcion previa.
- Investigacion en biometria de voz sin GPU: el tamano reducido y la licencia Apache-2.0 permiten usarlo como extractor base en experimentos academicos sobre CPU, o como linea base frente a otros embedders en estudios de comparacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible provienen de la model card y corresponden a un benchmark en dispositivo: Pixel 6, CPU ARM64, sherpa-onnx, 4 hilos, media de 5 ejecuciones. La metrica de "accuracy" es el margen de separacion entre hablantes (media de distancia coseno inter-hablante menos media intra-hablante; mayor es mejor) junto con el resultado del clustering. La linea base es el embedder anterior, `eres2net_base` (zh).

Clip limpio de 2 hablantes (ingles + chino):

| Modelo | Tamano | ms/utterance | Margen de separacion | Clustering |
|---|---|---|---|---|
| eres2net_base (anterior) | 37,8 MB | 256 | 0,715 | 2 hablantes correcto |
| CAM++ fp32 | 27,0 MB | 102 | 0,814 | 2 hablantes correcto |
| CAM++ int8 | 8,2 MB | 287 | 0,738 | 2 hablantes correcto |
| CAM++ fp16 | 14,0 MB | 70 | 0,808 | 2 hablantes correcto |

Clip de noticias entre 3 hablantes con mezcla de idiomas:

| Modelo | Tamano | ms/utterance | Margen de separacion | Clustering |
|---|---|---|---|---|
| eres2net_base (anterior) | 37,8 MB | 316 | 0,275 | 3 hablantes correcto |
| CAM++ fp32 | 27,0 MB | 120 | 0,305 | 3 hablantes correcto |
| CAM++ int8 | 8,2 MB | 330 | 0,284 | 3 hablantes correcto |
| CAM++ fp16 | 14,0 MB | 78 | 0,304 | 3 hablantes correcto |

No se han publicado resultados en benchmarks estandar de speaker verification (EER sobre VoxCeleb, DER sobre AMI o similares) en la informacion disponible. Las conclusiones que da el autor son: fp16 es la mejor opcion en dispositivo (aproximadamente 1,5 veces mas rapido que fp32 y 3,5 veces mas rapido que `eres2net_base`, la mitad de tamano que fp32 y precision indistinguible de esta); int8 resulta contraproducente en ese CPU porque la build de ONNX Runtime de sherpa-onnx no tiene un kernel `MatMulInteger` optimizado para este grafo, de modo que es mas lento que fp32 y ligeramente menos preciso, y solo gana en espacio en disco.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo esta disenado para inferencia solo CPU; no se publican requisitos de memoria de video.
- Memoria: el fichero mas grande es de 27 MB (fp32), por lo que el consumo de RAM del modelo es del orden de decenas de MB, muy por debajo de cualquier modelo de lenguaje.
- CPU objetivo: ARM64 con soporte SIMD fp16 (el benchmark usa un Pixel 6, ARMv8.2). Tambien funciona en x86-64 mediante ONNX Runtime, aunque no se publican mediciones para esa plataforma.
- GPU: no aplica. No se documenta soporte CUDA ni de otros aceleradores para este artefacto.
- Cabe en cualquier dispositivo consumer: telefonos Android, Raspberry Pi, mini-PC y portatiles sin GPU dedicada.
- Opciones de despliegue: sherpa-onnx (bindings de Python, C++, Kotlin, Swift y otros) y ONNX Runtime directo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia medida: 70 ms por utterance con fp16, 102 ms con fp32 y 287 ms con int8 en un Pixel 6 con 4 hilos, sobre clips de 2 hablantes. En el clip de 3 hablantes, 78 ms (fp16), 120 ms (fp32) y 330 ms (int8). Como referencia derivada, fp16 equivale a unos 14 utterances por segundo en ese dispositivo.
- Throughput: no se publican cifras de throughput agregado ni de procesamiento en tiempo real (factor RTF) mas alla de los milisegundos por utterance.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Tamano | Contexto / entrada | Rendimiento (margen, 2 hablantes / 3 hablantes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ldov/campplus-zh-en-onnx (fp16) | CAM++ / D-TDNN | 192 | 14 MB | utterance, fbank 80-dim a 16 kHz | 0,808 / 0,304 | Apache-2.0 | HuggingFace, via sherpa-onnx |
| luigi/campplus-zh-en-onnx | CAM++ / D-TDNN | 192 | 27/14/8,2 MB | utterance, fbank 80-dim a 16 kHz | no disponible (mismo artefacto declarado) | Apache-2.0 | HuggingFace |
| eres2net_base (3D-Speaker, zh) | ERes2Net | no disponible | 37,8 MB | utterance, fbank | 0,715 / 0,275 | Apache-2.0 (familia 3D-Speaker) | ModelScope / ecosistema 3D-Speaker |
| speech_campplus_sv_zh_en_16k-common_advanced (modelo base) | CAM++ / D-TDNN | 192 | no disponible | utterance, fbank 80-dim a 16 kHz | no disponible de forma independiente | Apache-2.0 | ModelScope / 3D-Speaker |
| Otros embedders de la familia WeSpeaker, ECAPA-TDNN | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico modelo comparable con datos medidos en la misma maquina y con los mismos clips es `eres2net_base`, que queda por detras en precision, latencia y tamano en las tres precisiones evaluadas. La comparacion con `luigi/campplus-zh-en-onnx` no puede cuantificarse porque ese repositorio parece contener el mismo artefacto reempaquetado y no aporta mediciones propias en la informacion disponible.

## Limitaciones y advertencias

- La evaluacion se limita a dos clips concretos (uno limpio de 2 hablantes y uno de noticias con 3 hablantes). No hay EER, DER ni pruebas sobre corpus estandar, por lo que no se puede extrapolar el rendimiento a produccion con garantias.
- No se declaran analisis de sesgo por acento, dialecto, edad, genero ni variante del chino. El modelo cubre mandarin/taiwanes e ingles; su comportamiento con otros idiomas o con acentos fuertes es desconocido.
- La diarizacion con hablantes solapados, ruido de fondo, reverberacion o voces muy similares (por ejemplo, hermanos o grabaciones telefonicas de banda estrecha) no esta evaluada y es una fuente habitual de degradacion en esta familia de modelos.
- La verificacion de hablante requiere un umbral de distancia coseno ajustado por el usuario; no se publica ningun umbral recomendado, y un umbral mal calibrado produce falsos positivos o falsos negativos.
- La cuantizacion int8 reduce precision y resulta mas lenta que fp32 en el hardware probado, por lo que solo tiene sentido si el criterio prioritario es el espacio en disco.
- El repositorio es un reempaquetado de terceros con 0 descargas y 0 likes, sin historial de mantenimiento. Para produccion conviene valorar el artefacto oficial de sherpa-onnx o el modelo base de 3D-Speaker en ModelScope.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero exige conservar avisos de copyright y licencia; conviene verificar la cadena de atribucion hasta 3D-Speaker/ModelScope antes de distribuir un producto derivado.
- El modelo solo produce embeddings: no transcribe, no genera texto y no incluye logica de clustering, por lo que cualquier pipeline de diarizacion necesita ademas segmentacion de audio, agrupamiento y, si se quiere transcripcion, un sistema ASR aparte.
- Las fechas de creacion y actualizacion registradas en HuggingFace (2026-09-28) y el tamano de repositorio declarado (0,1 GB frente a los aproximadamente 49 MB de los tres ficheros) son incoherencias de metadatos que conviene tener en cuenta al automatizar descargas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldov/campplus-zh-en-onnx
- Repositorio espejo detectado en la busqueda: https://huggingface.co/Luigi/campplus-zh-en-onnx
- Arbol de ficheros del espejo: https://huggingface.co/Luigi/campplus-zh-en-onnx/tree/main
- Toolkit CAM++ con soporte ONNX (lovemefan): https://github.com/lovemefan/campplus
- README del toolkit: https://github.com/lovemefan/campplus/blob/main/README.md
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Proyecto VoxSumDroid, para el que se produjo el modelo: https://github.com/vieenrose/VoxSumDroid
- Modelo base 3D-Speaker `speech_campplus_sv_zh_en_16k-common_advanced`: no disponible como enlace directo en la informacion proporcionada (se distribuye a traves de ModelScope / 3D-Speaker)
- Paper de CAM++ y de 3D-Speaker: no disponible en la informacion proporcionada
