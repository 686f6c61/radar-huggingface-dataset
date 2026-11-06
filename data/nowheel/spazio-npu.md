# nowheel/spazio-npu

## Resumen

Spazio NPU es un conjunto de pesos compilados para el procesador neuronal (NPU) Qualcomm Hexagon HTP v73 del SoC Snapdragon 8s Gen 4 (SM8735, presente en el Nothing Phone 3), utilizados por la aplicación Spazio. El artefacto publicado es una exportación LiteRT del modelo de reconocimiento de voz NVIDIA Parakeet TDT 0.6B v3, cuantizada con pesos de 8 bits y activaciones enteras de 16 bits, y compilada AOT (ahead-of-time) para el citado SoC. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de una adaptación de despliegue en hardware móvil.

El modelo base, Parakeet TDT 0.6B v3 de NVIDIA, es un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura TDT (Token-and-Duration Transducer) con aproximadamente 600 millones de parámetros, que transcribe audio en inglés, italiano, alemán, francés y español. La contribución de nowheel es la conversión a formato TFLite para NPU, un paso relevante porque el HTP de este chip no admite fp16, lo que obliga a un esquema de cuantización mixta w8a16.

Su interés práctico reside en la inferencia de ASR en el propio dispositivo (on-device) sobre un smartphone de gama alta, sin depender de la nube: ventanas de audio de 5 segundos, firmas `encode`, `decode` y `decode_1`, y estado persistente entre llamadas. Es un artefacto muy específico de hardware, con cero descargas y cero likes en el momento de la consulta, orientado a la app Spazio y no a un uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), modelo base NVIDIA Parakeet TDT 0.6B v3; export LiteRT compilado para Qualcomm Hexagon HTP v73 |
| Parametros totales | 0,6 B (aprox. 600 millones, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; ventanas de audio de 5 s por inferencia |
| Tipos de cuantizacion | Pesos a 8 bits (w8) y activaciones enteras a 16 bits (a16); el HTP del SM8735 no admite fp16 |
| Idiomas soportados | Italiano (it), ingles (en), aleman (de), frances (fr), espanol (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite (`.tflite`), export LiteRT; nombre de fichero `parakeet_tdt_0.6b_v3_5s_w8a16_stateful_Qualcomm_SM8735.tflite` |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT (Token-and-Duration Transducer) de NVIDIA, una variante de los modelos RNN-T en la que el predictor emite conjuntamente tokens y duraciones, lo que permite decodificar en paralelo y reducir la latencia frente a los transductores clasicos. El export publicado conserva la estructura en tres firmas (`encode`, `decode`, `decode_1`) y funciona en modo stateful, es decir, mantiene el estado entre llamadas sucesivas para procesar audio de forma continua en fragmentos de 5 segundos.

Sobre el entrenamiento no se aporta informacion en la documentacion disponible: no se detallan el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado o preferencias. La innovacion tecnica documentada es la del propio proceso de conversion: cuantizacion mixta w8a16 (necesaria porque el HTP v73 no acepta fp16), compilacion AOT para el SoC SM8735 y preservacion de las firmas del fichero de referencia `parakeet_tdt_0.6b_v3_5s_i8_stateful.tflite`, lo que facilita sustituir un artefacto por otro en la app.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en italiano, ingles, aleman, frances y espanol.
- Procesamiento por ventanas de 5 segundos con estado persistente entre llamadas, apto para transcripcion continua por fragmentos.
- Inferencia en la NPU del dispositivo (Qualcomm Hexagon HTP v73), sin conexion a la nube.
- Tres firmas de inferencia (`encode`, `decode`, `decode_1`) compatibles con el flujo transducer.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio generativo, tool calling ni agentes; es un modelo exclusivamente ASR.
- No se documenta modo de razonamiento (thinking mode) ni capacidades multimodales mas alla del audio de entrada.

## Casos de uso

- Transcripcion de voz en el movil sin conexion: la app Spazio puede convertir dictado o notas de voz a texto directamente en la NPU del Snapdragon 8s Gen 4, sin enviar audio a servidores externos, lo que reduce latencia y mejora la privacidad.
- Subtitulado en tiempo real de conversaciones presenciales: procesando fragmentos de 5 segundos con estado persistente, el modelo puede generar subtitulos sucesivos en las cinco lenguas soportadas.
- Dictado multilingue en aplicaciones de productividad: un usuario que alterna espanol, ingles, frances, aleman o italiano puede dictar texto en un editor o cliente de correo con el modelo ejecutandose localmente.
- Asistentes de voz integrados en el dispositivo: el resultado ASR puede alimentar un pipeline posterior (NLU, comandos, busqueda local) sin salir del telefono, aprovechando que el modelo ocupa un espacio reducido al estar cuantizado a 8 bits.
- Accesibilidad para personas con movilidad reducida: control por voz de funciones del telefono mediante transcripcion on-device, con la ventaja de que el audio no abandona el dispositivo.
- Transcripcion de reuniones y entrevistas en dispositivos moviles: el modo stateful permite encadenar ventanas de 5 s para cubrir grabaciones largas, siempre que la aplicacion gestione el estado entre llamadas.
- Integracion en aplicaciones Android que ya usan LiteRT: al mantener las mismas firmas que el artefacto de referencia `i8_stateful`, el modelo puede sustituir a este en un pipeline existente sin cambios en la interfaz de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Qualcomm Hexagon HTP v73, integrada en el SoC Snapdragon 8s Gen 4 (SM8735), como el del Nothing Phone 3.
- El artefacto esta compilado AOT para ese SoC concreto; no se garantiza su funcionamiento en otras NPU ni en GPU/CPU genericas.
- VRAM: no aplica (despliegue en dispositivo movil); no se dispone de cifras de memoria del modelo ni de consumo.
- GPU recomendadas: no disponible; el modelo no esta pensado para GPU de escritorio.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato TFLite compilado para HTP no es un artefacto para esos entornos.
- Opciones de despliegue: LiteRT (antiguo TensorFlow Lite) con delegado Qualcomm para la HTP; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo ASR de este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| nowheel/spazio-npu (este) | 0,6 B | ventanas de 5 s, stateful | it, en, de, fr, es | CC-BY-4.0 | TFLite compilado para HTP v73 (SM8735) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | it, en, de, fr, es | CC-BY-4.0 | pesos originales de NVIDIA (formato no detallado en la informacion disponible) |
| litert-community/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | it, en, de, fr, es | no disponible | export LiteRT generico |
| parakeet_tdt_0.6b_v3_5s_i8_stateful.tflite (referencia) | 0,6 B | ventanas de 5 s, stateful | no disponible | no disponible | TFLite i8 stateful |

## Limitaciones y advertencias

- Modelo altamente especifico de hardware: solo esta compilado para la NPU Hexagon HTP v73 del Snapdragon 8s Gen 4 (SM8735); no se documenta compatibilidad con otros SoC, GPU o CPU.
- La cuantizacion w8a16 puede introducir perdida de precision frente a los pesos originales en fp32/fp16; no se aportan metricas de degradacion (WER) que permitan cuantificarla.
- Ventana de audio fija de 5 segundos: el procesamiento de audio mas largo depende de encadenar llamadas manteniendo correctamente el estado; un mal manejo del estado puede degradar la transcripcion.
- Solo cinco idiomas (it, en, de, fr, es); no se documenta soporte de otros idiomas ni de cambio de idioma dentro de una misma ventana.
- Riesgo de alucinacion y errores propios de los sistemas ASR en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario especializado; no se documentan evaluaciones al respecto.
- Sesgos: no se dispone de informacion sobre sesgos demograficos, dialectales o de otro tipo en la documentacion proporcionada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor y mantener el aviso de licencia, y no se ofrece garantia alguna.
- Artefacto con cero descargas y sin validacion comunitaria en el momento de la consulta; conviene verificar su comportamiento en el dispositivo objetivo antes de integrarlo en produccion.
- No se documentan requisitos de memoria, latencia ni consumo energetico, datos relevantes para planificar una integracion movil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nowheel/spazio-npu
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export LiteRT de referencia: https://huggingface.co/litert-community/parakeet-tdt-0.6b-v3
