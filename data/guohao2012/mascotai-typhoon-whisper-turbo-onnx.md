# Guohao2012/mascotai-typhoon-whisper-turbo-onnx

## Resumen

Este repositorio contiene una exportacion a ONNX del modelo `typhoon-ai/typhoon-whisper-turbo`, un sistema de reconocimiento automatico del habla (ASR) especializado en tailandes. La conversion la ha realizado el usuario Guohao2012 y su unico proposito es cambiar el formato de los pesos para permitir la inferencia con [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx), el motor de decodificacion en dispositivo del proyecto k2-fsa. No se ha reentrenado ni modificado ningun peso: se trata de una conversion de formato, no de un modelo nuevo.

El modelo base, desarrollado por el equipo Typhoon de SCB 10X, parte de OpenAI Whisper large-v3-turbo y se ha adaptado al tailandes. La exportacion aplica una cuantizacion dinamica int8 restringida a las operaciones MatMul, lo que reduce el peso del encoder a 674.622.355 bytes y el del decoder a 361.070.805 bytes. El layout de ficheros replica el de la conversion de referencia `csukuangfj/sherpa-onnx-whisper-turbo`, con lo que es intercambiable dentro del mismo pipeline de sherpa-onnx.

Su relevancia es practica: permite desplegar ASR en tailandes en entornos sin GPU, en movil o en el navegador, a traves de sherpa-onnx (`OfflineRecognizer`, tipo de modelo whisper, `n_mels=128`). El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre esta conversion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (OpenAI Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | Aproximadamente 809 M, heredados de la arquitectura Whisper large-v3-turbo; no confirmado en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento; `n_mels=128`; no es un modelo de contexto de texto |
| Tipos de cuantizacion | int8 con cuantizacion dinamica solo de MatMul (encoder y decoder) |
| Idiomas soportados | Tailandes (`th`) |
| Licencia | MIT, heredada del modelo original; sujeto ademas a los OpenTyphoon Terms of Use |
| Formato de pesos | ONNX int8: `turbo-encoder.int8.onnx`, `turbo-decoder.int8.onnx`, `turbo-tokens.txt` |
| Tamano del repositorio | 1,0 GB |
| Modelo base | typhoon-ai/typhoon-whisper-turbo (commit HF `3c03fa84c26f172944422ceb8a4e88a2dbc08b10`) |
| Motor de inferencia objetivo | sherpa-onnx (`OfflineRecognizer`, tipo whisper) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un encoder-decoder transformer con preprocesado log-Mel de 128 bandas, entrenado originalmente por OpenAI sobre audio multilingue y etiquetas de transcripcion y traduccion. El equipo Typhoon (SCB 10X) partio de esos pesos y los adapto al tailandes; el modelo resultante es el que se exporta aqui. No se dispone de informacion sobre el volumen de tokens de audio, la composicion exacta del dataset de ajuste ni las tecnicas de alineacion (RLHF, DPO) empleadas en el modelo base. El tag `base_model:quantized:typhoon-ai/typhoon-whisper-turbo` indica que este repositorio es una version cuantizada del modelo citado.

La innovacion tecnica de este repositorio es exclusivamente de formato y despliegue: se ha usado el script oficial `scripts/whisper/export-onnx.py` de sherpa-onnx, parcheado solo para cargar el checkpoint de Typhoon y renombrar las claves de HuggingFace al esquema de openai-whisper. La cuantizacion dinamica int8 se limita a las MatMul, lo que evita tocar las capas mas sensibles a la precision (normalizaciones, activaciones y embeddings) y mantiene el layout de ficheros identico al de la conversion de referencia. Los hashes SHA-256 de los tres ficheros estan publicados en la model card: `89ec9b08...` para el encoder, `e4fd0684...` para el decoder y `b34b360d...` para el vocabulario.

## Capacidades

- Reconocimiento automatico del habla en tailandes sobre segmentos de hasta 30 segundos.
- Transcripcion offline (no streaming) mediante `OfflineRecognizer` de sherpa-onnx; el modelo procesa el audio completo y devuelve el texto.
- Capacidad multilingue residual: al derivar de Whisper large-v3-turbo, el encoder conserva representaciones de otros idiomas, pero el ajuste del modelo base esta orientado a tailandes y no se documentan garantias de calidad fuera de ese idioma.
- Traduccion de voz a texto entre idiomas: propia de la familia Whisper, aunque no se documenta en la model card para esta conversion.
- Ejecucion en CPU sin GPU dedicada, gracias a la cuantizacion int8 y al backend de sherpa-onnx.
- Integracion con las APIs de sherpa-onnx en C++, Python, Kotlin, Swift y otras plataformas, lo que habilita despliegue en movil, escritorio y servidor.
- Deteccion de actividad de voz y marcas de tiempo: funcionalidad del ecosistema sherpa-onnx/Whisper, no verificada en esta conversion concreta.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente; no es un modelo de lenguaje generativo de proposito general.

## Casos de uso

- Transcripcion en dispositivo movil: al ser un modelo int8 de aproximadamente 1 GB, se puede empaquetar en una aplicacion Android o iOS con sherpa-onnx y transcribir notas de voz en tailandes sin enviar el audio a la nube, lo que reduce coste y mejora la privacidad.
- Subtitulado automatico de video en tailandes: integrado en un pipeline de edicion, el modelo genera el texto de cada segmento de 30 s que despues se alinea con las marcas de tiempo del ecosistema sherpa-onnx para producir ficheros SRT.
- Analitica de call centers: transcripcion por lotes de grabaciones de atencion al cliente en tailandes para alimentar sistemas de busqueda, clasificacion de incidencias y control de calidad. La ejeccucion en CPU permite escalar horizontalmente con coste bajo.
- Asistentes de voz offline: comandos y dictado en aplicaciones de campo (logistica, inspeccion industrial) donde no hay conectividad fiable, usando el reconocedor en local.
- Generacion de corpus para modelos de lenguaje: transcripcion masiva de audio tailandes para construir datasets de texto que alimenten ajustes de LLM o sistemas de recuperacion (RAG) en ese idioma.
- Accesibilidad: subtitulado en tiempo casi real de charlas, clases o reuniones para personas con discapacidad auditiva, desplegado en un portatil o en un mini-PC sin GPU.
- Despliegue on-premise con requisitos de cumplimiento: organizaciones que no pueden enviar audio a servicios externos pueden ejecutar el modelo dentro de su propia infraestructura gracias a la licencia MIT y al formato ONNX autocontenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye WER, CER ni comparaciones con otros sistemas, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM en GPU: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos int8 suman aproximadamente 987 MiB (643 MiB de encoder mas 344 MiB de decoder), a lo que hay que anadir el estado de atencion y los buffers de audio.
- Memoria en CPU: el modelo esta pensado para ejecucion en CPU; se necesita al menos el espacio de los pesos int8 mas el overhead del runtime de ONNX Runtime.
- GPU recomendadas: no disponible. El caso de uso natural del formato es CPU o GPU de gama de entrada; no se documentan requisitos de A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 2-4 GB de VRAM libre, dado el tamano del modelo; no confirmado por el autor.
- Opciones de despliegue: sherpa-onnx (C++, Python, Kotlin, Swift) como via principal; ONNX Runtime de forma directa tambien es viable al tratarse de ficheros ONNX estandar.
- Latencia y throughput estimados: no disponible. No se publican mediciones de factor de tiempo real (RTF) ni de velocidad de transcripcion para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Guohao2012/mascotai-typhoon-whisper-turbo-onnx | Aproximadamente 809 M (arquitectura base) | ONNX int8 | Tailandes | MIT mas OpenTyphoon Terms | Conversion de formato para sherpa-onnx, `n_mels=128` |
| typhoon-ai/typhoon-whisper-turbo | No disponible | No disponible (pesos originales) | Tailandes | MIT mas OpenTyphoon Terms | Modelo base del que deriva esta conversion |
| csukuangfj/sherpa-onnx-whisper-turbo | No disponible | ONNX | Multilingue (Whisper turbo) | No disponible | Conversion de referencia de OpenAI Whisper turbo para sherpa-onnx; mismo layout de ficheros |
| OpenAI Whisper large-v3-turbo | Aproximadamente 809 M | safetensors, entre otros | Multilingue | MIT | Modelo original de OpenAI del que parte toda la cadena |

Las cifras de parametros de la familia Whisper large-v3-turbo no aparecen en la informacion proporcionada y se indican como aproximadas. No hay datos de rendimiento comparado disponibles para esta conversion.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce la tasa de error (WER/CER) de esta conversion int8 frente al modelo base en precision completa. La cuantizacion dinamica de MatMul puede degradar ligeramente la precision en comparacion con float32.
- Validacion de la comunidad nula: 0 descargas y 0 likes. La conversion la ha realizado un tercero y no cuenta con respaldo del equipo Typhoon ni de k2-fsa.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible en tramos de silencio, ruido o audio musical. En produccion conviene combinar el modelo con deteccion de actividad de voz (VAD) y filtros de confianza.
- Ventana de 30 segundos: el audio de mas duracion requiere segmentacion previa y una estrategia de solapamiento o alineacion para evitar cortes en palabras.
- Cobertura de idiomas: aunque la arquitectura base es multilingue, el modelo esta ajustado para tailandes y no se documenta el comportamiento en otros idiomas. No debe asumirse calidad equivalente a Whisper original fuera del tailandes.
- Restricciones de licencia: la licencia MIT del modelo convive con los OpenTyphoon Terms of Use (https://opentyphoon.ai/tac), que hay que revisar antes de un uso comercial. Los creditos de los pesos corresponden al equipo Typhoon (SCB 10X) y a OpenAI.
- Sin informacion sobre sesgos: no se documenta el comportamiento del modelo con distintos acentos, registros o variedades dialectales del tailandes, ni con audio telefónico de baja calidad.
- Artefactos de conversión: no se publican pruebas de equivalencia funcional entre esta exportacion ONNX y el checkpoint original, solo los hashes de los ficheros.
- Sin soporte de tool calling, agentes ni generacion de texto libre: es exclusivamente un modelo de voz a texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Guohao2012/mascotai-typhoon-whisper-turbo-onnx
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-whisper-turbo
- Conversion de referencia para sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-turbo
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de exportacion usado: `scripts/whisper/export-onnx.py` dentro del repositorio de sherpa-onnx
- Terminos de uso de OpenTyphoon: https://opentyphoon.ai/tac
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenido sin relacion con el mismo.
