# aTrain-core/KB-WhisperSwedish

## Resumen

aTrain-core/KB-WhisperSwedish es un repositorio de pesos en formato CTranslate2 para el modelo de reconocimiento automatico del habla (ASR) KBLab/kb-whisper-large, desarrollado por KBLab en la Biblioteca Nacional de Suecia. No se trata de un modelo nuevo ni de un ajuste adicional: el autor (aTrain-core) ha copiado los ficheros CTranslate2 sin modificaciones desde la revision `d5d5984b4d8f7c4847a8ea203f1976285fb28300` del repositorio original, con el objetivo de ofrecer una version lista para usar con faster-whisper y CTranslate2.

El modelo subyacente es un Whisper large-v3 adaptado al sueco, entrenado segun KBLab con mas de 50.000 horas de audio en ese idioma. Al estar en formato CTranslate2, el repositorio prioriza la eficiencia de inferencia (especialmente en CPU con cuantizacion int8) frente al formato original de PyTorch, algo relevante para despliegues de transcripcion a gran escala donde el coste por hora de audio es el factor critico.

Su relevancia practica es doble: por un lado, cubre una lengua con menos recursos que el ingles con un modelo de gran tamano especializado; por otro, al distribuirse bajo Apache 2.0 y en un formato optimizado, reduce la barrera de entrada para integrar transcripcion en sueco en pipelines de produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), con preprocesado de audio a espectrograma log-Mel |
| Parametros totales | 1550 M aproximadamente (arquitectura Whisper large-v3; no indicado en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 30 segundos por ventana de audio (arquitectura Whisper); faster-whisper procesa audio de duracion arbitraria mediante segmentacion |
| Tipos de cuantizacion | CTranslate2 admite float32, float16, bfloat16, int8, int8_float16, int8_float32; la model card indica uso probado con int8, pero no especifica la cuantizacion de los pesos incluidos en el repositorio (3,1 GB, compatible con float16) |
| Idiomas soportados | sueco (sv) unicamente, segun la model card; el Whisper large-v3 original es multilingue pero este ajuste esta orientado a sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin` y ficheros auxiliares de tokenizer/configuracion), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder con atencion completa, disenado para recibir espectrogramas log-Mel de 30 segundos (1500 fotogramas) y generar texto autoregresivamente, con tokens especiales para marcas de tiempo. El modelo base fue entrenado por OpenAI con supervision debil a gran escala; posteriormente KBLab realizo un ajuste especifico sobre mas de 50.000 horas de habla en sueco, lo que especializa el decodificador hacia la ortografia, la puntuacion y las caracteristicas foneticas del sueco. La model card de este repositorio no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento empleados en el ajuste ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica de este repositorio concreto no esta en el modelo, sino en el formato: la conversion a CTranslate2 permite ejecutar el modelo con kernels optimizados para CPU y GPU, aplicar cuantizacion int8 y usar la cache de atencion propia de la libreria. Esto habilita decodificacion por lotes y reduce el consumo de memoria frente a la implementacion original en PyTorch. Conviene subir a la model card original de KBLab para consultar los detalles de entrenamiento, evaluacion y limitaciones que el autor de este repositorio remite explicitamente.

## Capacidades

- Reconocimiento automatico del habla en sueco con transcripcion de audio a texto.
- Marcas de tiempo a nivel de palabra (`word_timestamps=True`), utiles para subtitulado y alineacion.
- Marcas de tiempo por segmento, con inicio y fin de cada fragmento transcrito.
- Procesamiento de audio de duracion arbitraria mediante segmentacion interna en faster-whisper, no limitado a ventanas de 30 segundos.
- Inferencia en CPU con cuantizacion int8, verificado por el autor con faster-whisper 1.2.1.
- Inferencia en GPU mediante CTranslate2 (soporte de float16 e int8_float16).
- Deteccion de actividad de voz (VAD) integrada en faster-whisper para filtrar silencios y mejorar el rendimiento.
- No incluye vision, tool calling, function calling, modo de razonamiento explicito ni capacidades de agente; es exclusivamente un modelo de transcripcion.

## Casos de uso

- Digitalizacion de archivos audiovisuales: bibliotecas, hemerotecas y archivos sonoros pueden transcribir fondos en sueco con marcas de tiempo y generar indices de texto buscables, aprovechando la especializacion del modelo en esta lengua y su licencia Apache 2.0.
- Subtitulado automatico: a partir de las marcas de tiempo por palabra se pueden generar ficheros SRT o VTT con sincronizacion fina, un flujo habitual en productoras y plataformas de video que emiten contenido en sueco.
- Analitica de contact center: transcripcion de llamadas de atencion al cliente en sueco para posterior analisis de motivos de contacto, cumplimiento normativo y deteccion de incidencias, con la ventaja de poder ejecutar la inferencia en CPU int8 si no hay GPU disponible.
- Accesibilidad en administracion publica: transcripcion de sesiones parlamentarias, comparecencias, audiencias y actas orales, generando texto en vivo o en diferido para personas con discapacidad auditiva.
- Investigacion linguistica de corpus: creacion de corpus orales anotados con tiempos para estudios de fonetica, sociolinguistica y variacion dialectal del sueco, aprovechando que el modelo procede de un ajuste sobre habla real sueca.
- Busqueda semantica sobre audio: indexacion de podcasts, programas de radio y grabaciones internas transcritas para alimentar motores de busqueda o sistemas RAG, donde la transcripcion es el primer paso del pipeline.
- Asistentes de voz en sueco: integracion como capa ASR en un sistema de comandos o dictado, encadenado a un LLM para la parte de comprension y generacion de respuesta.
- Verificacion y cumplimiento: transcripcion de grabaciones para auditoria, analisis de riesgos o revisión de procesos internos en organizaciones que operan en Suecia y necesitan trazabilidad textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tarjeta del modelo original (KBLab/kb-whisper-large) para los resultados de evaluacion, pero estos no se incluyen en la informacion proporcionada. El autor unicamente indica que los ficheros fueron probados con `faster-whisper==1.2.1` en CPU con cuantizacion int8.

## Requisitos de hardware

- VRAM estimada en float16: aproximadamente 3,1 GB solo para los pesos, mas overhead de cache de atencion y buffers, en torno a 4-5 GB en la practica.
- VRAM estimada en int8: aproximadamente 1,6-2 GB de pesos, con un consumo total tipico por debajo de 3 GB.
- CPU: viable sin GPU, tal como valido el autor con int8; el rendimiento depende del numero de nucleos y del soporte de instrucciones vectoriales.
- GPU consumer: si, cabe en tarjetas con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores.
- GPU de datacenter: T4, L4, A10, A100 y H100 funcionan sin problema; para este tamano de modelo son sobredimensionadas salvo que se busque procesamiento por lotes a gran escala.
- Opciones de despliegue: faster-whisper (libreria recomendada por el autor), API Python de CTranslate2, WhisperX para diarizacion y alineacion, servidores compatibles con la API de OpenAI para Whisper y contenedores Docker basados en faster-whisper.
- Latencia y throughput: no disponibles. No se han publicado mediciones de factor de tiempo real ni de velocidad de procesamiento por hora de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| aTrain-core/KB-WhisperSwedish | ~1550 M | 30 s por ventana | sueco | Apache 2.0 | CTranslate2 | Copia sin modificaciones de kb-whisper-large en formato optimizado; 0 descargas |
| KBLab/kb-whisper-large | ~1550 M | 30 s por ventana | sueco | Apache 2.0 | safetensors (PyTorch) | Modelo upstream, con model card completa, datos de entrenamiento y evaluacion |
| openai/whisper-large-v3 | ~1550 M | 30 s por ventana | multilingue (cerca de 99 idiomas) | Apache 2.0 | safetensors, tambien disponible en CTranslate2 mediante conversion | Referencia generalista; su rendimiento en sueco es inferior al de un ajuste especifico segun la motivacion de KBLab |
| Systran/faster-whisper-large-v3 | ~1550 M | 30 s por ventana | multilingue | Apache 2.0 | CTranslate2 | Conversion oficial a CTranslate2 del large-v3 original; misma estructura de despliegue que este repositorio |

No se dispone de cifras comparativas de WER en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo mono-idioma: solo sueco. No debe esperarse una transcripcion fiable en otros idiomas, aunque el modelo base sea multilingue.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes, sin issues ni evaluaciones independientes que confirmen el comportamiento de los ficheros publicados.
- Es una redistribucion, no un modelo nuevo: cualquier limitacion del modelo upstream se hereda sin cambios. Las mejoras o correcciones deben buscarse en KBLab/kb-whisper-large.
- Riesgo de alucinacion en audio con silencios prolongados, musica, ruido de fondo o habla muy solapada; es un comportamiento documentado en la familia Whisper y conviene filtrar con VAD.
- Sin diarizacion de hablantes: no identifica quien habla en conversaciones multiples; para ello hay que combinar con herramientas externas como WhisperX.
- Sin garantia de puntuacion perfecta ni de normalizacion de numeros, siglas o nombres propios, especialmente en dominios muy especializados.
- El modelo puede reproducir sesgos presentes en las mas de 50.000 horas de habla sueca empleadas en el ajuste; el rendimiento puede degradarse en variedades dialectales o acentos poco representados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card solicita citar el trabajo de KBLab segun la referencia del repositorio upstream. Conviene revisar dicha cita antes de publicar resultados.
- La cuantizacion de los pesos incluidos no se especifica; si se requiere una precision concreta (por ejemplo int8 frente a float16), habra que verificar el contenido del repositorio o reconvertir desde el modelo original.
- Sin datos de rendimiento publicados: no hay WER, ni mediciones de latencia, ni comparativas oficiales de este repositorio frente a alternativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aTrain-core/KB-WhisperSwedish
- Modelo upstream (KBLab/kb-whisper-large): https://huggingface.co/KBLab/kb-whisper-large
- Revision concreta desde la que se copiaron los ficheros: https://huggingface.co/KBLab/kb-whisper-large/tree/d5d5984b4d8f7c4847a8ea203f1976285fb28300
- Cita academica del modelo original: https://huggingface.co/KBLab/kb-whisper-large#citation
- faster-whisper (libreria de inferencia): https://github.com/SYSTRAN/faster-whisper
- CTranslate2 (motor de inferencia y cuantizacion): https://github.com/OpenNMT/CTranslate2

Nota: los resultados de busqueda web proporcionados corresponden a paginas de ayuda de Google Translate y no contienen informacion relevante sobre este modelo, por lo que no se han incorporado a la ficha.
