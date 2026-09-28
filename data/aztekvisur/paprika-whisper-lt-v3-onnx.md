# aztekvisur/paprika-whisper-lt-v3-onnx

## Resumen

`aztekvisur/paprika-whisper-lt-v3-onnx` es una exportación a ONNX del modelo `kristijonas/paprika-whisper-lt-v3`, un ajuste fino en lituano de `whisper-large-v3-turbo` entrenado sobre aproximadamente 3.281 horas del corpus LIEPA-3. El repositorio no entrena ni modifica los pesos: se limita a convertirlos para que puedan ejecutarse en el navegador mediante Transformers.js, con aceleración WebGPU o, en su defecto, WASM. Está publicado por el usuario aztekvisur y mantiene la misma licencia que el modelo original, CC-BY-4.0.

El interés práctico del artefacto es la ausencia de backend: cualquiera puede transcribir audio en lituano en el cliente sin enviar la señal a un servidor. Para ello se ofrecen tres ficheros: el encoder en fp16 (1,27 GB), el encoder cuantizado a 4 bits (0,42 GB) y el decoder fusionado con caché de atención también en 4 bits (0,33 GB). Con la combinación recomendada por el autor (encoder fp16 + decoder q4) el peso total en disco ronda 1,6 GB.

El modelo hereda las características de Whisper: ventanas de 30 segundos, arquitectura encoder-decoder transformer y salida en minúsculas sin puntuación. La ficha advierte explícitamente de que conviene alimentar bloques alineados con pausas de menos de 30 segundos en lugar del pipeline de troceado por pasos fijos (`chunk_length_s`), un detalle relevante porque el pipeline estándar de Transformers.js sí usa ese troceado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, base `whisper-large-v3-turbo`) |
| Parametros totales | 809 M, heredados de la arquitectura `whisper-large-v3-turbo` (la ficha del repo no declara el dato; valor no confirmado por el autor) |
| Longitud de contexto | 30 segundos de audio por ventana (1500 frames mel); sin extensión de contexto nativa |
| Tipos de cuantizacion | fp16 (encoder, con I/O en float32) y q4 mediante `MatMulNBitsQuantizer` de ONNX Runtime (block 32, simétrico) para encoder y decoder |
| Idiomas soportados | Lituano (`lt`) únicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (opset 18), exportado con `--task automatic-speech-recognition-with-past` |
| Tamano del repositorio | 2,0 GB |
| Ficheros incluidos | `onnx/encoder_model_fp16.onnx` (1,27 GB), `onnx/encoder_model_q4.onnx` (0,42 GB), `onnx/decoder_model_merged_q4.onnx` (0,33 GB) |
| Libreria de inferencia | Transformers.js (WebGPU o WASM) |
| Pipeline | `automatic-speech-recognition` |
| Modelo base | `kristijonas/paprika-whisper-lt-v3` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper en su variante `large-v3-turbo`: un encoder transformer que consume espectrogramas mel logarítmicos de 30 segundos y un decoder autorregresivo con caché de atención, en el que la variante turbo reduce el número de capas del decoder respecto a `large-v3` para acelerar la decodificación. La exportación a ONNX se realizó con `optimum-cli export onnx --task automatic-speech-recognition-with-past --opset 18`, de modo que el decoder fusionado incorpora las entradas y salidas de clave/valor para decodificación incremental. La versión fp16 se generó con `onnxruntime.transformers.float16` manteniendo la interfaz de entrada y salida en float32, y la versión de 4 bits con el cuantizador `MatMulNBitsQuantizer` de ONNX Runtime en modo simétrico con tamaño de bloque 32, que es un formato pensado para kernels MatMulNBits de la propia ONNX Runtime.

El ajuste fino original se entrenó sobre aproximadamente 3.281 horas del corpus lituano LIEPA-3, según la model card del modelo base. Ni el repositorio ONNX ni la información disponible detallan la composición exacta del dataset, el número de tokens de audio procesados, la estrategia de entrenamiento (si hubo RLHF, DPO o ajuste supervisado puro) ni el procedimiento de evaluación. Tampoco se documenta ninguna innovación técnica adicional en la conversión más allá de la propia cuantización y de la exportación con caché de atención.

## Capacidades

- Reconocimiento automático de voz (ASR) en lituano sobre audio mono a 16 kHz.
- Transcripción con marcas de tiempo temporales: el ejemplo oficial usa `return_timestamps: true`.
- Selección explícita de idioma y tarea en la llamada al pipeline (`language: 'lithuanian'`, `task: 'transcribe'`), aunque el modelo está especializado en un único idioma.
- Ejecución en navegador con WebGPU o WASM, sin servidor de inferencia.
- Decodificación con caché de atención gracias al decoder fusionado (`with past`), lo que evita recalcular el contexto completo en cada paso.
- No se documenta soporte de tool calling, function calling, comportamiento agéntico, visión, audio distinto de la transcripción, traducción (aunque Whisper admite la tarea `translate`, esta ficha no la menciona para este modelo) ni modo de razonamiento explícito.
- Salida en minúsculas y sin puntuación, de forma deliberada, igual que el modelo original.

## Casos de uso

- Transcripción de reuniones internas en lituano dentro del navegador: el modelo procesa audio de 16 kHz y devuelve marcas de tiempo, de modo que una aplicación web puede generar un acta con marcas temporales sin que el audio salga del dispositivo del usuario.
- Subtitulado de vídeo en cliente: integrado en Transformers.js, se puede generar un fichero de subtítulos en lituano a partir de la pista de audio directamente en el navegador, útil para plataformas que no quieren asumir costes de servidor GPU.
- Aplicaciones de dictado para profesionales que trabajan en lituano: con la configuración q4 (0,42 GB de encoder y 0,33 GB de decoder) el modelo cabe en equipos modestos y la decodificación incremental reduce la latencia percibida.
- Archivado y búsqueda de contenido audiovisual en lituano: transcripción por lotes de repositorios de audio con alineación temporal, usando los bloques alineados a pausas que recomienda la ficha para evitar cortes en mitad de palabra.
- Asistentes de accesibilidad para personas con discapacidad auditiva: la inferencia local elimina la dependencia de conectividad y mantiene el audio dentro del perímetro del usuario, algo relevante cuando el contenido es sensible.
- Preprocesado de voz para pipelines de análisis posteriores: la transcripción en minúsculas sin puntuación sirve como entrada para indexación semántica, clasificación de temas o extracción de entidades, con la ventaja de que el coste de ASR se traslada al cliente.
- Evaluación comparativa de exportaciones ONNX: al ser un artefacto de conversión, resulta útil para medir la degradación entre fp16 y q4 en un modelo de ASR multilingüe en el propio navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio ONNX no incluye métricas de WER, comparativas con `whisper-large-v3` ni mediciones de latencia o throughput para ninguna de las configuraciones de cuantización. Tampoco se dispone de métricas del modelo base `kristijonas/paprika-whisper-lt-v3` en la información proporcionada.

## Requisitos de hardware

- Configuración mínima (encoder q4 + decoder q4): aproximadamente 0,75 GB de pesos, lo que supone del orden de 1 GB de VRAM incluyendo buffers de activaciones y el espacio de trabajo de los kernels MatMulNBits.
- Configuración recomendada por el autor (encoder fp16 + decoder q4): aproximadamente 1,6 GB de pesos, con requisitos estimados en torno a 2 GB de memoria de vídeo. El repositorio no incluye un decoder fp16, por lo que una inferencia íntegramente en fp16 no es posible sin exportar ficheros adicionales.
- GPU de consumo: cualquier GPU con soporte WebGPU y 4 GB o más de VRAM debería poder ejecutar la configuración q4; el encoder fp16 exige más memoria y penaliza a iGPU con memoria compartida.
- GPU de servidor: H100, A100, L40S o RTX 4090 mediante `onnxruntime-gpu` para despliegues por lotes, aunque el diseño del artefacto apunta al cliente.
- Opciones de despliegue: Transformers.js con `device: 'webgpu'` (recomendado) o `device: 'wasm'` (respaldo, sensiblemente más lento); también es posible cargar los ficheros ONNX con ONNX Runtime directamente en servidor.
- Latencia y throughput: no disponibles. No se publican mediciones de factor de tiempo real ni de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aztekvisur/paprika-whisper-lt-v3-onnx` | 809 M (heredados) | 30 s por ventana | Solo lituano | CC-BY-4.0 | ONNX para Transformers.js, 0 descargas |
| `kristijonas/paprika-whisper-lt-v3` | 809 M (heredados) | 30 s por ventana | Solo lituano | CC-BY-4.0 | Pesos originales (formato no detallado en la información disponible) |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s por ventana | Multilingüe | MIT | PyTorch y conversiones comunitarias |
| `openai/whisper-large-v3` | 1.550 M | 30 s por ventana | Multilingüe | MIT | PyTorch y conversiones comunitarias |

La información disponible no incluye métricas comparativas de precisión entre estas alternativas, por lo que la comparación se limita a parámetros, cobertura idiomática, licencia y formato de distribución. Frente a los modelos de OpenAI, este artefacto sacrifica cobertura multilingüe a cambio de una especialización en lituano y de un formato listo para navegador; frente al modelo base de kristijonas, la diferencia es exclusivamente el formato de pesos.

## Limitaciones y advertencias

- Modelo monolingüe: la ficha declara únicamente lituano. No hay evidencia de que transcriba con fiabilidad otros idiomas.
- Salida en minúsculas y sin puntuación. Es una decisión heredada del modelo original y limita el uso directo en documentos que requieran formato.
- Límite estricto de 30 segundos por ventana. El autor recomienda alimentar bloques alineados a pausas en lugar del troceado por pasos fijos (`chunk_length_s`); ignorar esta recomendación puede producir cortes de palabra y errores en los límites.
- Riesgo de alucinación en silencios, ruido o audio musical, un comportamiento documentado en la familia Whisper y que puede generar texto plausible sin correspondencia con la señal.
- Sesgos y cobertura: el ajuste se realizó sobre LIEPA-3 (aproximadamente 3.281 horas), por lo que el rendimiento en variedades dialectales, habla con acento fuerte, jerga o dominios especializados no está documentado y probablemente sea inferior.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoría del modelo original. Además, la licencia del corpus LIEPA-3 y las condiciones de uso de los datos subyacentes no se detallan en la información disponible.
- Artefacto derivado no validado: la conversión la firma un tercero distinto del autor del modelo base, y no se documenta ninguna evaluación de la pérdida de precisión introducida por la cuantización a 4 bits.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de errores.
- Incompatibilidad potencial con versiones de navegador: la ruta fp16 depende de WebGPU, cuyo soporte varía entre navegadores y plataformas.

## Enlaces

- Repositorio ONNX: https://huggingface.co/aztekvisur/paprika-whisper-lt-v3-onnx
- Modelo base: https://huggingface.co/kristijonas/paprika-whisper-lt-v3
- Transformers.js: https://github.com/huggingface/transformers.js
- Resultados de la búsqueda web: no contienen enlaces relevantes para este modelo (los resultados obtenidos tratan sobre el origen de apellidos y no guardan relación con el artefacto).
