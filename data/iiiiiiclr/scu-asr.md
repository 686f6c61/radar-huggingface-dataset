# iiiiiiclr/SCU-ASR

## Resumen

SCU-ASR es el identificador con el que el usuario de HuggingFace `iiiiiiclr` ha publicado un repositorio cuyo contenido corresponde a la familia Qwen3-ASR de Alibaba/Qwen. El repositorio se presenta bajo la etiqueta de pipeline `automatic-speech-recognition` y la etiqueta interna `qwen3_asr`, y su model card reproduce la documentacion oficial de la serie Qwen3-ASR (variantes Qwen3-ASR-1.7B y Qwen3-ASR-0.6B). No se trata, por tanto, de un modelo original con ese nombre, sino de una copia alojada por un tercero.

El modelo resuelve transcripcion de voz a texto (ASR) y identificacion de idioma sobre 30 idiomas y 22 dialectos chinos, con un unico modelo capaz de operar en modo offline y en streaming, ademas de transcribir audio largo. La arquitectura se apoya en el modelo fundacional multimodal Qwen3-Omni aprovechando su capacidad de comprension de audio, y los pesos publicados en este repositorio suman 2.349.217.408 parametros (aproximadamente 2,35 mil millones) en formato safetensors, con un tamano de repositorio de 4,7 GB.

La relevancia del proyecto original radica en que, segun su model card, la variante de 1,7B alcanza rendimiento de estado del arte entre los modelos ASR de codigo abierto y compite con las mejores APIs comerciales propietarias, ademas de publicar un toolkit de inferencia con backend vLLM, servicio asincrono y prediccion de marcas temporales. Conviene senalar que la model card no incluye cifras de benchmarks y que el recuento de parametros del repositorio no coincide exactamente con ninguna de las dos variantes anunciadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de reconocimiento automatico del habla basado en el modelo fundacional multimodal Qwen3-Omni; detalle de capas, atencion y encoder de audio no disponible en la informacion proporcionada |
| Parametros totales | 2.349.217.408 (aproximadamente 2,35 mil millones), segun los pesos safetensors del repositorio |
| Parametros activos | No aplica / no disponible; la informacion proporcionada no indica que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible; la model card indica soporte de transcripcion de audio largo y, para el alineador forzado asociado, marcas temporales en audio de hasta 5 minutos |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio publica pesos en safetensors sin detallar precision de almacenamiento |
| Idiomas soportados | 30 idiomas: chino (zh), ingles (en), cantonés (yue), arabe (ar), aleman (de), frances (fr), espanol (es), portugues (pt), indonesio (id), italiano (it), coreano (ko), ruso (ru), tailandes (th), vietnamita (vi), japones (ja), turco (tr), hindi (hi), malayo (ms), neerlandes (nl), sueco (sv), danes (da), finlandes (fi), polaco (pl), checo (cs), filipino (fil), persa (fa), griego (el), hungaro (hu), macedonio (mk), rumano (ro). Ademas, 22 dialectos y variedades del chino, incluidos cantonés con acento de Hong Kong y de Guangdong, wu y minnan |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se apoya en Qwen3-Omni, un modelo fundacional multimodal de Qwen, y de que hereda su capacidad de comprension de audio. Se trata por tanto de un modelo de tipo audio-LLM orientado a ASR, no de una arquitectura puramente convolucional o de estado espacio-temporal. La model card publica dos diagramas (introduccion y vision general de la arquitectura) alojados en el CDN de Alibaba, pero su contenido no se incluye en el texto proporcionado.

En cuanto al entrenamiento, la model card menciona el uso de datos de voz a gran escala, sin especificar el numero de horas, la composicion del dataset ni el uso de tecnicas de ajuste por refuerzo (RLHF/DPO). Tampoco se detalla si hubo una etapa de destilacion desde la variante de 1,7B hacia la de 0,6B. Las innovaciones tecnicas declaradas por el autor son: inferencia unificada en streaming y offline con un unico modelo, transcripcion de audio largo, un alineador forzado independiente (Qwen3-ForcedAligner-0.6B) con prediccion de marcas temporales para unidades arbitrarias en 11 idiomas y hasta 5 minutos de audio, y un toolkit de inferencia con soporte de vLLM, lotes, servicio asincrono y streaming. Se recomienda el uso de FlashAttention 2 para reducir memoria y acelerar la inferencia en entradas largas y lotes grandes.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo offline y en streaming con el mismo modelo.
- Identificacion automatica de idioma (language identification) integrada.
- Cobertura de 30 idiomas y 22 dialectos o variedades del chino, incluidos acentos del ingles de distintas regiones segun la model card.
- Transcripcion de audio largo, con soporte de inferencia por lotes mediante vLLM.
- Robustez declarada frente a entornos acusticos complejos y patrones de texto dificiles.
- Manejo de distintos tipos de audio: voz hablada, voz cantada y canciones con musica de fondo (BGM).
- Alineacion forzada con prediccion de marcas temporales mediante el modelo complementario Qwen3-ForcedAligner-0.6B (11 idiomas, hasta 5 minutos de audio por fragmento).
- Toolkit de inferencia oficial: backend transformers y backend vLLM, servicio asincrono, streaming y prediccion de marcas temporales.
- No se documenta en la informacion proporcionada soporte de tool calling, function calling, agentes ni razonamiento multi-paso, dado que es un modelo especializado en ASR.

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo procesa audio largo y permite inferencia por lotes con vLLM, lo que lo hace adecuado para generar actas automaticas de sesiones extensas, con identificacion de idioma cuando participan hablantes de distintas lenguas.
- Subtitulado automatico de video: la combinacion del modelo ASR con Qwen3-ForcedAligner-0.6B permite obtener marcas temporales por unidad para sincronizar subtitulos, con cobertura de 11 idiomas en el alineador.
- Atencion al cliente en centros de contacto: transcripcion de llamadas en streaming para alimentar analitica en tiempo real y sistemas de control de calidad, con soporte de variedades dialectales del chino y de ingleses regionales.
- Generacion de actas y busqueda sobre archivos de audio: indexacion de grabaciones historicas de podcasts, entrevistas o formacion interna en 30 idiomas, permitiendo busqueda textual posterior sobre el contenido hablado.
- Accesibilidad y transcripcion en directo: dictado y transcripcion para personas con discapacidad auditiva en eventos, clases o retransmisiones, aprovechando el modo streaming con un unico modelo.
- Investigacion en linguistica y fonetica: uso del alineador forzado para obtener marcas temporales precisas y estudiar duraciones, pausas y patrones prosodicos en corpus de hasta 5 minutos por fragmento.
- Procesamiento de contenido musical y de audio mixto: transcripcion de voz cantada y de canciones con musica de fondo, un escenario donde muchos modelos ASR genericos degradan notablemente.
- Despliegue on-premise de servicios de transcripcion: al ser un modelo de 2,35 mil millones de parametros con licencia Apache 2.0 y pesos safetensors, puede ejecutarse en infraestructura propia sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que Qwen3-ASR-1.7B alcanza rendimiento de estado del arte entre los modelos ASR de codigo abierto y es competitivo con las APIs comerciales propietarias mas potentes, y que Qwen3-ASR-0.6B alcanza una relacion precision-eficiencia que le permite "2000 veces el throughput con una concurrencia de 128" (la formulacion original es ambigua y no se acompana de la unidad de medida, por lo que no debe citarse como cifra firme). No se proporcionan numeros de WER, MMLU, HumanEval, GSM8K ni de ningun otro benchmark, ni tablas comparativas con modelos similares.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros del repositorio (2,35 mil millones) y del tamano del repo (4,7 GB); no estan confirmadas por el autor:

- Peso del modelo en precision de 16 bits (BF16/FP16): aproximadamente 4,7 GB, coherente con el tamano del repositorio.
- VRAM estimada en FP16/BF16: en torno a 8-12 GB contando pesos, encoder de audio, activaciones y cache KV para lotes pequenos y audio de duracion moderada.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,4 GB de pesos, con un total practico en torno a 5-6 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,2 GB de pesos, con un total practico en torno a 3-4 GB. No se publican pesos cuantizados oficiales en este repositorio.
- GPU profesionales recomendadas para servicio de alta concurrencia: A100 o H100, especialmente con backend vLLM y FlashAttention 2.
- GPU de consumo: cabe en tarjetas con 8 GB o mas de VRAM en FP16 para uso individual (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); en cuantizacion de 4-8 bits podria caber en GPU de 4-6 GB, si bien no hay pesos GGUF publicados en la informacion disponible. Tambien es viable en equipos Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue documentadas: paquete `qwen-asr` con backend transformers, backend vLLM para inferencia por lotes y streaming, imagen Docker oficial, e instalacion desde el repositorio GitHub. No se confirma soporte de llama.cpp, Ollama, TGI ni LM Studio en la informacion proporcionada.
- Latencia y throughput: no disponibles para este repositorio en concreto. La model card recomienda FlashAttention 2 para acelerar la inferencia en entradas largas y lotes grandes, y advierte de que si la maquina tiene menos de 96 GB de RAM conviene limitar los trabajos de compilacion con `MAX_JOBS=4`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCU-ASR (este repositorio, contenido Qwen3-ASR) | 2,35 B (safetensors) | 30 idiomas y 22 dialectos chinos segun su model card | No disponible en contexto; audio largo y alineacion de hasta 5 min en el modelo asociado | Apache 2.0 | HuggingFace, repositorio de tercero, 0 descargas y 0 likes en el momento de la consulta |
| Qwen3-ASR-1.7B / Qwen3-ASR-0.6B (originales de Qwen) | 1,7 B y 0,6 B segun la model card | 30 idiomas y 22 dialectos chinos | No disponible | Apache 2.0 | HuggingFace y ModelScope, bajo la organizacion Qwen |
| abr-ai/asr-38m-v1-en | Aproximadamente 38 M | Solo ingles | No disponible | No disponible | HuggingFace |
| abr-ai/asr-19m-v2-en-32b | Aproximadamente 19 M | Solo ingles | No disponible | No disponible | HuggingFace |

Las dos alternativas de ABR son modelos de espacio de estados (SSM) con atencion, entrenados con unas 15.000 horas de voz segun su ficha, y estan pensados para contextos de streaming con huella de memoria muy reducida; no compiten en cobertura linguistica ni, previsiblemente, en precision frente a un modelo de 1,7-2,35 B, pero si en coste de despliegue en dispositivos. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa entre ninguno de estos modelos.

## Limitaciones y advertencias

- El repositorio no es oficial: pertenece al usuario `iiiiiiclr`, tiene 0 descargas y 0 likes, y su model card reproduce la documentacion de Qwen3-ASR. Para uso en produccion es recomendable acudir a los pesos originales publicados por la organizacion Qwen.
- Existe una discrepancia entre el recuento de parametros real del repositorio (2,35 B) y las variantes anunciadas en la model card (1,7 B y 0,6 B). No se especifica a que variante corresponde exactamente este checkpoint ni si ha sido modificado, fusionado o convertido.
- La model card no incluye ningun resultado de benchmarks verificable, por lo que las afirmaciones de estado del arte no pueden contrastarse con los datos aportados.
- Riesgo de alucinacion en sentido ASR: sustituciones, omisiones e invencion de palabras en audio con ruido, solapamiento de hablantes, acentos no cubiertos o dominio muy especifico. La model card destaca la robustez en entornos complejos, pero no aporta tasas de error.
- Desequilibrio linguistico probable: la cobertura de dialectos se concentra en el chino (22 variedades) frente a 30 idiomas, sin detalle de dialectos regionales del espanol ni de otras lenguas.
- Reparto desigual de recursos por idioma: el alineador forzado asociado cubre solo 11 idiomas y fragmentos de hasta 5 minutos, por lo que la prediccion de marcas temporales no esta disponible en toda la cobertura linguistica del ASR.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero al tratarse de una copia de terceros conviene verificar la licencia y los terminos de los pesos originales antes de integrarlos en un producto.
- No hay confirmacion de soporte en runtimes ligeros (llama.cpp, Ollama) ni de pesos cuantizados oficiales, lo que limita el despliegue en hardware muy restringido.
- El identificador arXiv declarado en las etiquetas (arxiv:2601.21337) no puede verificarse con la informacion disponible; no se aporta resumen ni contenido del articulo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no debe utilizarse como sustituto de un LLM generalista en esos escenarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/iiiiiiclr/SCU-ASR
- Repositorio oficial del proyecto en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Modelo original Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B (referenciado en la model card; descarga via `huggingface-cli download Qwen/Qwen3-ASR-1.7B --local-dir ./Qwen3-ASR-1.7B`)
- Modelo original Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B (referenciado en la model card; descarga via `huggingface-cli download Qwen/Qwen3-ASR-0.6B --local-dir ./Qwen3-ASR-0.6B`)
- Modelo de alineacion forzada Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B (referenciado en la model card; descarga via `huggingface-cli download Qwen/Qwen3-ForcedAligner-0.6B --local-dir ./Qwen3-ForcedAligner-0.6B`)
- Descarga alternativa via ModelScope: `modelscope download --model Qwen/Qwen3-ASR-1.7B --local_dir ./Qwen3-ASR-1.7B` (y equivalentes para las otras variantes)
- Referencia arXiv declarada en las etiquetas del repositorio: arxiv:2601.21337 (no verificable con la informacion disponible)
- Alternativa comparable, modelo ASR de espacio de estados en ingles: https://huggingface.co/abr-ai/asr-38m-v1-en
- Alternativa comparable, modelo ASR de espacio de estados en ingles de menor tamano: https://huggingface.co/abr-ai/asr-19m-v2-en-32b
- Investigacion relacionada sobre correccion de errores en ASR: https://machinelearning.apple.com/research/asr-error-correction
- Seguimiento de lanzamientos de modelos: https://aimodelradar.app/
