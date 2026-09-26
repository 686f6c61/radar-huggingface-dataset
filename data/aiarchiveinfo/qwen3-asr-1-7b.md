# AIArchiveInfo/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen (Alibaba). Forma parte de la familia Qwen3-ASR, junto con la variante Qwen3-ASR-0.6B y el modelo complementario Qwen3-ForcedAligner-0.6B. El modelo realiza identificacion de idioma y transcripcion para 52 lenguas y dialectos (30 idiomas y 22 dialectos chinos) y esta construido sobre la capacidad de comprension de audio del modelo fundacional Qwen3-Omni. La ficha que se describe aqui corresponde a una copia espejo integra (mirror byte a byte) publicada por AIArchiveInfo en HuggingFace, sin reentrenamiento ni modificacion de pesos.

La relevancia del modelo radica en que, segun su model card, la version de 1.7B alcanza rendimiento de estado del arte entre los modelos ASR de codigo abierto y resulta competitiva con las APIs comerciales propietarias mas potentes. Ademas, unifica la inferencia en modo streaming y offline con un solo modelo, admite transcripcion de audio largo y cubre tipos de audio que van mas alla del habla estandar (voz cantada y canciones con musica de fondo). La familia se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en productos comerciales.

Un dato relevante para la evaluacion tecnica es la discrepancia entre el nombre comercial (1.7B) y el recuento real de parametros almacenados en safetensors, que asciende a 2.349.217.408 (aproximadamente 2,35B). El repositorio ocupa 4,7 GB, coherente con pesos en precision de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3-Omni (encoder de audio + decodificador); detalles internos no disponibles |
| Parametros totales | 2.349.217.408 (aprox. 2,35B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos (52 en total) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: la fila de parametros activos se omite por no tratarse de un modelo con arquitectura Mixture of Experts segun la informacion disponible.

## Arquitectura y entrenamiento

El modelo se apoya en el modelo fundacional Qwen3-Omni, del que hereda la capacidad de comprension de audio. La familia Qwen3-ASR emplea datos de entrenamiento de habla a gran escala, si bien la model card no detalla el numero exacto de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. Tampoco se especifican las dimensiones internas, el numero de capas ni la configuracion del encoder acustico.

Entre las innovaciones destacadas por el autor figura un sistema de alineamiento forzado independiente (Qwen3-ForcedAligner-0.6B), que predice marcas temporales para unidades arbitrarias en hasta 5 minutos de audio en 11 idiomas y supera en precision a los modelos de alineamiento forzado end-to-end. Ademas, la familia incorpora un kit de inferencia completo con soporte para inferencia por lotes basada en vLLM, servicio asincrono, inferencia en streaming y prediccion de timestamps. La version de 1.7B, segun la model card, logra rendimiento de estado del arte entre los modelos ASR de codigo abierto y es competitiva con las APIs comerciales mas potentes.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo offline y streaming unificado con un unico modelo.
- Identificacion automatica del idioma (language identification) integrada.
- Transcripcion de 30 idiomas: chino, ingles, cantonés, arabe, aleman, frances, espanol, portugues, indonesio, italiano, coreano, ruso, tailandes, vietnamita, japones, turco, hindi, malayo, neerlandes, sueco, danes, finlandes, polaco, checo, filipino, persa, griego, hungaro, macedonio y rumano.
- Reconocimiento de 22 dialectos y variantes chinas (Anhui, Dongbei, Fujian, Gansu, Guizhou, Hebei, Henan, Hubei, Hunan, Jiangxi, Ningxia, Shandong, Shaanxi, Shanxi, Sichuan, Tianjin, Yunnan, Zhejiang, cantonés con acento de Hong Kong y de Guangdong, wu y minnan).
- Reconocimiento robusto en entornos acusticos complejos y patrones de texto dificiles.
- Soporte de audio musical: voz cantada y canciones con musica de fondo (BGM), ademas de habla convencional.
- Transcripcion de audio largo.
- Capacidad de prediccion de marcas temporales mediante el modelo complementario Qwen3-ForcedAligner-0.6B (hasta 5 minutos, 11 idiomas).
- Inferencia por lotes y servicio asincrono mediante backend vLLM.
- Rendimiento eficiente en la variante 0.6B, que alcanza 2.000 veces de throughput con una concurrencia de 128.

## Casos de uso

- Transcripcion de reuniones y generacion de actas: el modelo puede procesar audio largo y mantener calidad en entornos con ruido, lo que permite convertir reuniones de trabajo en texto estructurado para su posterior analisis o resumen.
- Subtitulado de video: con el soporte de streaming y la capacidad de prediccion de timestamps del modelo ForcedAligner asociado, es posible generar subtitulos sincronizados para plataformas de contenido en 30 idiomas.
- Atencion al cliente y centros de llamadas: la transcripcion multilingue permite registrar y analizar conversaciones telefonicas, identificar el idioma del cliente de forma automatica y alimentar sistemas de analitica de calidad.
- Dictado profesional (medico, legal, periodistico): el reconocimiento robusto en condiciones acusticas variables y el soporte de audio largo lo hacen apto para documentacion dictada de forma continua.
- Accesibilidad en tiempo real: gracias a la inferencia en streaming, puede alimentar sistemas de subtitulado en vivo para personas con discapacidad auditiva en eventos y videollamadas.
- Analisis de contenido musical y multimedia: al reconocer voz cantada y canciones con musica de fondo, sirve para indexar catalogos musicales, generar letras sincronizadas o clasificar contenido audiovisual.
- Cumplimiento normativo y auditoria de llamadas: la transcripcion automatica de registros telefonicos permite buscar terminos clave y verificar obligaciones regulatorias sobre conversaciones grabadas.
- Preprocesado de datos para entrenamiento de otros modelos: la transcripcion masiva de corpus de audio facilita la generacion de datasets etiquetados para tareas posteriores de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que la version de 1.7B alcanza rendimiento de estado del arte entre los modelos ASR de codigo abierto y resulta competitiva con las APIs comerciales propietarias mas potentes, y que la version 0.6B logra 2.000 veces de throughput con concurrencia de 128, pero no se incluyen tablas con valores concretos (WER, CER u otras metricas) ni comparativas cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada en precision de 16 bits (bf16/fp16): aproximadamente 4,7 GB solo para pesos, con un consumo total de inferencia en torno a 6-8 GB incluyendo overhead y buffers de audio. Estimacion basada en el recuento real de parametros.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,4-3 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,2-1,5 GB. La disponibilidad de pesos cuantizados no esta confirmada en la informacion proporcionada.
- GPU recomendadas: para uso individual, tarjetas consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090. Para servicio en produccion, A100 o H100 con backend vLLM para inferencia por lotes y concurrencia elevada.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer con 8 GB o mas en 16 bits, y en GPUs con 4-6 GB si se dispone de pesos cuantizados.
- Opciones de despliegue: paquete oficial `qwen-asr` (con backend transformers o vLLM), imagen Docker oficial, integracion con vLLM para inferencia por lotes y servicio asincrono, y carga estandar de safetensors. No se menciona soporte explicito de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: el unico dato aportado corresponde a la variante 0.6B, que alcanza 2.000 veces de throughput con concurrencia de 128. No hay cifras especificas para la version de 1.7B.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este modelo) | 2,35B (segun safetensors) | 30 idiomas + 22 dialectos | Apache 2.0 | safetensors | HuggingFace y ModelScope |
| Qwen3-ASR-0.6B | no disponible | 30 idiomas + 22 dialectos | Apache 2.0 | safetensors | HuggingFace y ModelScope |
| OpenAI Whisper large-v3 | 1,55B | no disponible en la informacion proporcionada | MIT | safetensors / bin | HuggingFace |

La comparativa cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada. La variante 0.6B de la misma familia es la alternativa natural por eficiencia; no se ofrecen datos internos de comparacion entre ambas mas alla de la mencion al throughput de la version pequena.

## Limitaciones y advertencias

- El repositorio descrito es un espejo de preservacion de AIArchiveInfo; no es el repositorio oficial de Qwen. Para uso productivo se recomienda acudir al repositorio original de Qwen para obtener actualizaciones y soporte.
- La model card no detalla sesgos conocidos del modelo; al tratarse de un sistema ASR, es previsible un rendimiento desigual entre idiomas y variedades dialectales en funcion de la representacion de cada uno en los datos de entrenamiento (no confirmado con datos).
- Riesgo de errores de transcripcion (sustituciones, omisiones o alucinaciones de texto) en audio con ruido, solapamiento de voces o terminologia especializada. No se han publicado cifras de WER en la informacion disponible.
- No se especifica la longitud de contexto, por lo que se desconoce el limite maximo de audio procesable de una sola vez; la transcripcion de audio largo puede requerir segmentacion manual.
- La lista de idiomas soportados figura en la model card, pero el campo de idiomas del repo de HuggingFace aparece como no disponible.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria original. El espejo declara conservar la licencia original de forma literal.
- La cobertura de las capacidades de alineamiento forzado (timestamps) depende de un modelo separado (Qwen3-ForcedAligner-0.6B) que no forma parte de este repositorio.
- No se dispone de informacion sobre cuantizaciones oficiales ni soporte declarado en runtimes alternativos (llama.cpp, Ollama), lo que puede limitar el despliegue en entornos sin GPU o con recursos muy restringidos.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/AIArchiveInfo/Qwen3-ASR-1.7B
- Repositorio original del modelo: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Revision archivada del modelo original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/tree/7278e1e70fe206f11671096ffdd38061171dd6e5
- Repositorio de codigo fuente en GitHub: https://github.com/Qwen
- Paper de referencia (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
