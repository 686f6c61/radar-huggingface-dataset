# bhaskaro/ainotes-whisper-kannada-medium-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-kannada-medium-q5_1` es una conversión a formato GGML y cuantización q5_1 de un fine-tune de Whisper medium para kannada, desarrollado por el usuario `bhaskaro` sobre el modelo base `vasista22/whisper-kannada-medium`. Está diseñado para ejecutarse en dispositivos Android mediante `whisper.cpp`, ofreciendo una alternativa de mayor precisión al modelo small del mismo autor, que pesa 190 MB.

El modelo resuelve la tarea de reconocimiento automático del habla (ASR) en lengua kannada, con una ventana de audio fija de 30 segundos. Su relevancia radica en que, a costa de un mayor tamaño (587 MB) y un mayor tiempo de procesamiento, reduce el WER del 35,1 % al 31,1 % en el benchmark FLEURS `kn_in` frente al modelo small. La licencia Apache-2.0 permite su uso comercial, y su formato GGML lo hace adecuado para despliegue en CPU sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | No disponible (el archivo cuantizado pesa 586 572 019 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | Kannada (kn) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Whisper medium para kannada, entrenado con la predicción de marcas de tiempo deshabilitada. Esta decisión técnica es relevante porque los tokens de marcas de tiempo no están entrenados, y si `whisper.cpp` confía en ellos, el decodificador se descarrila y produce texto fluido no relacionado con el audio. Por tanto, es obligatorio usar la opción `no_timestamps` en la inferencia.

La conversión al formato GGML se realizó con el script `convert-h5-to-ggml.py` de `whisper.cpp`, y la tabla de tokens se verificó byte a byte contra `ggml-small`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en kannada mediante reconocimiento automático del habla.
- Optimizado para ejecución en CPU a través de `whisper.cpp`, sin necesidad de GPU.
- Ventana de audio fija de 30 segundos, con relleno de entradas más cortas a esa duración.
- Requiere `no_timestamps` para un funcionamiento correcto y estable.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni generación de audio.
- No es multilingüe; está especializado exclusivamente en kannada.

## Casos de uso

- Aplicaciones móviles de toma de notas por voz en kannada: el modelo se integra en apps Android mediante `whisper.cpp`, aprovechando su cuantización q5_1 para transcribir notas de voz sin conexión. Su mayor precisión frente al modelo small lo hace adecuado cuando la exactitud es prioritaria, aunque el tiempo de procesamiento sea mayor.
- Transcripción de reuniones o entrevistas en kannada: permite procesar clips de audio de hasta 30 segundos, obteniendo transcripciones con un WER del 31,1 % en el benchmark FLEURS, útil para documentar conversaciones en entornos académicos o empresariales.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede transcribir audio en kannada en tiempo diferido, facilitando el acceso a contenido hablado en aplicaciones educativas o de comunicación.
- Análisis de corpus de audio para investigación lingüística: los investigadores pueden generar transcripciones de grabaciones en kannada para estudios fonéticos, de reconocimiento del habla o de procesamiento del lenguaje natural.
- Automatización de documentación clínica: profesionales sanitarios que hablen kannada pueden dictar notas médicas y transcribirlas automáticamente, reduciendo el tiempo de registro y mejorando la trazabilidad.
- Subtitulado de vídeos cortos en kannada: el modelo puede generar subtítulos para clips de vídeo de hasta 30 segundos, integrándose en flujos de trabajo de edición o publicación de contenido.
- Transcripción de mensajes de voz en aplicaciones de mensajería: al integrar el modelo en una app de chat, los usuarios de kannada pueden convertir mensajes de voz en texto, mejorando la búsqueda y la accesibilidad.

## Benchmarks y rendimiento

La model card presenta resultados de FLEURS `kn_in` con 128 clips, obtenidos en una sola ejecución a través de `whisper.cpp` con la configuración que usa la aplicación real: `no_timestamps`, decodificación greedy y romanización de escritura común antes de puntuar. Los resultados comparan el modelo medium q5_1 con el modelo small q5_1 del mismo autor.

| Modelo | Tamaño | WER | CER |
|---|---|---|---|
| small q5_1 | 190 MB | 35,1 % | 19,7 % |
| medium q5_1 | 587 MB | 31,1 % | 18,8 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Tamaño del archivo: 587 MB (0.6 GB), almacenable en dispositivos móviles.
- No requiere GPU; la inferencia se ejecuta en CPU mediante `whisper.cpp`.
- Latencia estimada: unos 90 segundos por ventana de 30 segundos en un Realme RMX2170 (2 núcleos grandes a 2.3 GHz), frente a unos 27 segundos para el modelo small. Esta cifra se traslada del modelo Hindi medium y no se ha medido específicamente para Kannada.
- VRAM estimada: no disponible, al tratarse de inferencia en CPU.
- GPU recomendada: no disponible.
- Opciones de despliegue: `whisper.cpp` en Android, así como cualquier sistema compatible con `whisper.cpp` en escritorio o servidor.

## Comparativa con modelos similares

| Modelo | Tamaño | WER | CER | Licencia | Formato |
|---|---|---|---|---|---|
| bhaskaro/ainotes-whisper-kannada-medium-q5_1 | 587 MB | 31,1 % | 18,8 % | Apache-2.0 | GGML q5_1 |
| bhaskaro/ainotes-whisper-kannada-q5_1 (small) | 190 MB | 35,1 % | 19,7 % | Apache-2.0 | GGML q5_1 |
| vasista22/whisper-kannada-medium (base) | No disponible | No disponible | No disponible | Apache-2.0 | No disponible |

El modelo Hindi medium mencionado en la model card comparte la misma arquitectura y tamaño (586 572 019 bytes), pero no se proporcionan métricas específicas para Kannada.

## Limitaciones y advertencias

- El uso de marcas de tiempo degrada gravemente el rendimiento: en el modelo Hindi small, habilitar timestamps eleva el WER al 47,5 % frente al 14,9 % con `no_timestamps`, y el decodificador puede abandonar el audio para generar texto fluido no relacionado.
- El tiempo de procesamiento es fijo por ventana de 30 segundos, lo que hace ineficiente para notas muy cortas: una nota de 4 segundos cuesta lo mismo que una de 29.
- Solo soporta kannada; no es un modelo multilingüe ni generalista.
- No se dispone de información sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos lingüísticos o demográficos.
- La cifra de latencia de 90 segundos se ha trasladado del modelo Hindi medium y no se ha medido específicamente para Kannada.
- El tamaño de 587 MB es notablemente mayor que el del modelo small (190 MB), lo que puede ser un inconveniente en dispositivos con poco almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhaskaro/ainotes-whisper-kannada-medium-q5_1
- Modelo base: https://huggingface.co/vasista22/whisper-kannada-medium
- Modelo small del mismo autor: https://huggingface.co/bhaskaro/ainotes-whisper-kannada-q5_1
- Perfil del autor en HuggingFace: https://huggingface.co/bhaskaro
