# LaToucheCarre/Parakeet-TDT-0.6B-v3-int8-ONNX

## Resumen

Parakeet-TDT-0.6B-v3-int8-ONNX es una exportación a ONNX con cuantización int8 del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario LaToucheCarre. No se trata de un modelo nuevo ni de un reentrenamiento: el repositorio es una copia de trabajo que sirve los mismos pesos, con nombres de fichero prefijados, al teclado Android La Touche Carré, que los descarga en el primer arranque de la aplicación.

El modelo subyacente es un transductor TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros, desarrollado por NVIDIA y entrenado sobre el corpus Granary. El export se reparte en cuatro piezas —encoder, decoder, joiner y vocabulario de tokens— que deben usarse de forma conjunta, ya que el vocabulario y la anchura del joiner son solidarios entre sí.

Su relevancia práctica está en el escenario de despliegue: al estar cuantizado a int8 y empaquetado en ONNX, la transcripción se ejecuta íntegramente en el dispositivo (ONNX Runtime sobre CPU, sin GPU) y ningún fragmento de audio sale del terminal. Cubre 25 idiomas europeos bajo licencia CC-BY-4.0, con atribución obligatoria a NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer), con encoder, decoder y joiner empaquetados por separado |
| Parametros totales | Aproximadamente 0,6 mil millones (0,6B, segun el nombre del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (modelo de audio; no se especifica ventana de inferencia ni longitud maxima de segmento) |
| Tipos de cuantizacion | int8 exclusivamente en este repositorio |
| Idiomas soportados | 25: fr, en, de, es, it, pt, nl, pl, ru, uk, cs, sk, sv, da, fi, no, hu, ro, bg, hr, el, et, lv, lt, mt |
| Licencia | CC-BY-4.0 (atribucion obligatoria; modelo original © NVIDIA, entrenado sobre Granary) |
| Formato de pesos | ONNX int8, en cuatro ficheros: `parakeet-encoder.int8.onnx`, `parakeet-decoder.int8.onnx`, `parakeet-joiner.int8.onnx` y `parakeet-tokens.txt` |
| Tamano del repositorio | 0,7 GB |
| Tamano de los ficheros | encoder 652.184.281 bytes; decoder 11.845.275 bytes; joiner 6.355.277 bytes; tokens 93.939 bytes |
| Pipeline | automatic-speech-recognition |
| Autor del export | LaToucheCarre |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Export de referencia | csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 |
| Fecha de creacion del repositorio | 11 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un transductor TDT (Token-and-Duration Transducer), una variante de los modelos transducer que predice conjuntamente el token de salida y su duración. El export ONNX confirma esta estructura al descomponerse en tres redes diferenciadas —encoder, decoder y joiner— más un fichero de vocabulario. El encoder concentra prácticamente todo el peso del modelo (652.184.281 de los aproximadamente 670 MB totales), mientras que el decoder (11.845.275 bytes) y el joiner (6.355.277 bytes) son componentes ligeros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron fases de ajuste tipo RLHF o DPO. La model card únicamente indica que el modelo base fue entrenado por NVIDIA sobre el corpus Granary. En este repositorio no se ha modificado ningún peso: se trata de una copia de trabajo del export int8, que a su vez proviene del export de csukuangfj para sherpa-onnx. La innovación técnica relevante aquí no está en el modelo, sino en el empaquetado: cuantización int8 y formato ONNX que permiten inferencia en CPU dentro de un dispositivo móvil.

Un detalle operativo crítico documentado por el autor es que las cuatro piezas son interdependientes. El vocabulario y la anchura del joiner están acoplados, de modo que mezclar ficheros de distintas exportaciones produce un motor que decodifica texto sin sentido.

## Capacidades

- Reconocimiento automático del habla (ASR) monolítico: transcripción de audio a texto con un único modelo, sin pipeline externo de alineación.
- Cobertura multilingüe de 25 idiomas: frances, ingles, aleman, espanol, italiano, portugues, neerlandes, polaco, ruso, ucraniano, checo, eslovaco, sueco, danes, finlandes, noruego, hungaro, rumano, bulgaro, croata, griego, estonio, leton, lituano y maltes.
- Decodificacion con prediccion de duracion (TDT): el modelo estima simultaneamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico.
- Inferencia completamente local: la transcripcion se ejecuta en el propio dispositivo mediante ONNX Runtime sobre CPU, sin enviar audio a ningun servidor.
- Integracion como motor de dictado en teclados e IME: es precisamente el uso para el que se publico este repositorio (teclado Android La Touche Carré).
- Soporte de tool calling / function calling: no aplica; es un modelo de reconocimiento de voz, no un modelo generativo de instrucciones.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de vision, audio generativo o modo de razonamiento explicito (thinking mode): no disponibles; el unico modo es la transcripcion de audio.

## Casos de uso

- Dictado por voz en teclados Android: es el caso de uso original de este repositorio. El teclado descarga los cuatro ficheros en el primer arranque y ejecuta la transcripcion en local con ONNX Runtime, de modo que el audio del usuario nunca abandona el terminal. El tamano de 0,7 GB del repositorio es asumible como descarga inicial en un telefono actual.
- Transcripcion de reuniones en local: al ser un modelo int8 de 0,6B ejecutable en CPU, se puede integrar en una herramienta de escritorio que procese las grabaciones de reunion sin depender de APIs externas ni incurrir en costes por minuto de audio.
- Notas de voz a texto en aplicaciones de productividad: una app de notas puede convertir grabaciones cortas en texto editable usando el mismo motor ONNX, con latencia ligada a la CPU del dispositivo y sin conexion a red.
- Entornos con requisitos estrictos de privacidad (sanidad, legal, administracion publica): el hecho de que la inferencia ocurra dentro del dispositivo facilita el cumplimiento de normativas de proteccion de datos, ya que no hay transferencia de audio a terceros.
- Indexado y busqueda de archivos de audio en gestion de activos multimedia: transcripcion por lotes de un catalogo de audio o video para generar indices de busqueda textual, aprovechando la cobertura de 25 idiomas para catalogos europeos.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en tiempo casi real sobre el propio dispositivo, en cualquiera de los 25 idiomas soportados.
- Analitica de conversaciones de atencion al cliente: transcripcion multilingue de llamadas grabadas para su posterior analisis, con el modelo ejecutandose en infraestructura propia en lugar de un servicio en la nube.
- Despliegue en dispositivos edge sin GPU: al estar cuantizado a int8 y no requerir acelerador grafico, encaja en mini-PC, placas ARM o terminales industriales donde no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a documentar los ficheros, sus tamanos y sus hashes SHA-256, y no incluye tasas de error de palabras (WER), comparativas con el modelo base en precision completa ni mediciones de latencia o throughput.

Tampoco se aportan datos sobre la degradacion de precision introducida por la cuantizacion int8 respecto al modelo nvidia/parakeet-tdt-0.6b-v3 en BF16 o FP32.

## Requisitos de hardware

- Almacenamiento: aproximadamente 0,7 GB en disco para los cuatro ficheros del repositorio.
- Memoria: los pesos int8 suman unos 670 MB, por lo que se recomienda disponer de al menos 1 GB de RAM libre para el modelo y el runtime; 2 GB libres ofrecen un margen comodo.
- VRAM: no disponible. El export esta pensado para ejecucion en CPU mediante ONNX Runtime, por lo que no se documenta un requisito de VRAM. Como estimacion basada en el tamano de los ficheros, una carga en GPU requeriria del orden de 1 GB de VRAM, pero este dato no esta confirmado por la informacion proporcionada.
- GPU recomendadas: no aplica en el escenario documentado. El autor indica explicitamente que la transcripcion se ejecuta en el procesador del dispositivo. ONNX Runtime soporta otros execution providers (CUDA, TensorRT), pero no hay evidencia de que este export se haya validado con ellos.
- Cabe en GPU de consumo: si, en terminos de tamano, cualquier GPU con 2 GB o mas de memoria podria alojarlo. No obstante, el objetivo declarado del export es la ejecucion en CPU, por lo que el uso de GPU de consumo no esta documentado ni validado.
- Opciones de despliegue: ONNX Runtime (CPU) y sherpa-onnx, dado que el export procede del repositorio de csukuangfj para sherpa-onnx. No aplica vLLM (orientado a modelos generativos) ni llama.cpp (no consume ONNX int8 con esta estructura de transducer).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LaToucheCarre/Parakeet-TDT-0.6B-v3-int8-ONNX | ~0,6B | ONNX int8 (4 ficheros) | 25 | CC-BY-4.0 | Copia de trabajo para teclado Android; inferencia en CPU; sin benchmarks publicados |
| nvidia/parakeet-tdt-0.6b-v3 (base) | ~0,6B | Pesos NeMo en precision completa | 25 | CC-BY-4.0 | Modelo original de NVIDIA, entrenado sobre Granary; requiere NeMo para su ejecucion |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | ~0,6B | ONNX int8 | 25 | CC-BY-4.0 | Export de referencia del que procede este repositorio; mismos pesos |
| openai/whisper-large-v3 (referencia externa) | ~1,55B | safetensors, tambien GGUF y otras conversiones | 99 | MIT | Referencia de la misma categoria (ASR multilingue); ventanas de audio de 30 segundos. Dato no incluido en la informacion proporcionada |

No se dispone de resultados de benchmarks para ninguno de los modelos de la tabla dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, cobertura de idiomas y licencia. Los dos primeros modelos son esencialmente los mismos pesos, diferenciados unicamente por el formato de exportacion y el caso de uso previsto.

## Limitaciones y advertencias

- No es un modelo nuevo: es una copia de trabajo del export int8, sin modificacion de pesos. Cualquier evaluacion de calidad debe atribuirse al modelo base de NVIDIA, no a este repositorio.
- Las cuatro piezas son inseparables. Mezclar el encoder, el decoder, el joiner o el vocabulario con los de otra exportacion produce salidas incoherentes, segun advierte el propio autor.
- La cuantizacion int8 puede degradar la precision respecto al modelo en precision completa. No se aportan metricas de esa degradacion.
- Riesgo de alucinacion en ASR: como cualquier transductor, puede generar texto plausible sobre fragmentos de silencio, ruido o audio musical. No hay datos publicados sobre el comportamiento en estas condiciones.
- Cobertura limitada a 25 idiomas europeos. El espanol esta incluido, pero no hay soporte documentado para otras lenguas.
- Sin datos sobre manejo de hablantes solapados, audio de larga duracion o segmentacion. Se desconoce la longitud maxima de audio procesable de una sola vez.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion. Es necesario acreditar a NVIDIA como autor del modelo y mencionar el entrenamiento sobre Granary en cualquier redistribucion o producto derivado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no ha pasado por validacion de la comunidad, lo que incrementa el riesgo de incidencias no documentadas.
- Proyecto de servicio con un unico consumidor conocido (el teclado La Touche Carré). No hay garantia de mantenimiento ni de actualizaciones futuras.
- No se documentan los execution providers de ONNX Runtime probados: el rendimiento en GPU o en aceleradores NPU es desconocido.
- No hay benchmarks ni evaluaciones de WER publicadas, lo que impide comparar su calidad con alternativas como Whisper antes de integrarlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LaToucheCarre/Parakeet-TDT-0.6B-v3-int8-ONNX
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export de referencia para sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Paper, blog o repositorio adicional: no disponible. Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo.
