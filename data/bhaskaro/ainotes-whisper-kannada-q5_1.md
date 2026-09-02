# bhaskaro/ainotes-whisper-kannada-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-kannada-q5_1` es una conversión al formato GGML del modelo `vasista22/whisper-kannada-small`, un fine-tune de Whisper small de OpenAI especializado en el reconocimiento de voz en kannada. La conversión aplica una cuantización q5_1 para reducir el tamaño a 190 MB, lo que permite ejecutar el modelo en dispositivos con recursos limitados, como teléfonos móviles de gama media, mediante la librería whisper.cpp. El modelo está diseñado exclusivamente para la transcripción de audio en kannada y se distribuye bajo licencia Apache-2.0.

Su relevancia radica en que ofrece una alternativa ligera y funcional para el ASR en kannada, un idioma con escasez de modelos abiertos optimizados. La cuantización q5_1 mantiene una precisión comparable a la versión en float16, según las mediciones reportadas por el autor, y el modelo funciona en tiempo real en hardware modesto. No obstante, requiere una configuración específica (desactivar timestamps) para evitar errores de segmentación que producen salidas incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder transformer) |
| Parametros totales | 244M (estimado, basado en whisper-small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | Kannada (kn) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base `vasista22/whisper-kannada-small` es un fine-tune de Whisper small, un transformer encoder-decoder entrenado por OpenAI para tareas de reconocimiento de voz, traduccion y identificacion de idiomas. El fine-tune se realizo sobre datos publicos de ASR en kannada, como parte de un "Whisper fine-tuning sprint". La conversion a GGML se llevo a cabo mediante el script `convert-h5-to-ggml.py` de whisper.cpp, pasando primero a float16 y luego cuantizando a q5_1. El autor verifico que la tabla de tokens coincidiera byte a byte con la version publicada por ggerganov para evitar errores de vocabulario.

No se dispone de detalles sobre el numero exacto de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO. El modelo solo soporta kannada y no incluye capacidades multitarea.

## Capacidades

- Transcripcion de audio en kannada con una tasa de error de palabra (WER) del 33,3% en 24 clips de FLEURS `kn_in`.
- Funciona en tiempo real en dispositivos con CPU de gama media (probado en Snapdragon 720G con 4 hilos).
- Cuantizacion q5_1 que reduce el tamaño a 190 MB, manteniendo una precision similar a la version float16 (14,7% vs 15,9% WER en hindi, segun el autor).
- Compatible con whisper.cpp, lo que permite su uso en aplicaciones de escritorio, moviles y embebidas.
- Requiere activar la opcion `no_timestamps` para evitar errores de segmentacion que provocan salidas irrelevantes.

## Casos de uso

- Transcripcion de reuniones y notas de voz en kannada: el modelo puede procesar grabaciones de audio localmente, sin conexion, y generar transcripciones en tiempo real o diferido. Su tamaño reducido permite integrarlo en aplicaciones de escritorio o moviles.
- Subtitulado de videos en kannada: al transcribir el audio de un video, se pueden generar subtitulos automaticos para plataformas de contenido o archivos personales. La naturaleza ligera del modelo facilita su ejecucion en equipos sin GPU.
- Asistentes de voz locales: integracion en aplicaciones de asistente personal que funcionan completamente en el dispositivo, preservando la privacidad al no enviar audio a servidores externos.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real de conversaciones o eventos en kannada, util en entornos educativos o laborales.
- Analisis de llamadas de servicio al cliente: transcripcion de grabaciones de llamadas en kannada para su posterior analisis, busqueda de palabras clave o entrenamiento de modelos de NLP.
- Investigacion en ASR para idiomas de bajos recursos: el modelo sirve como punto de partida para comparar tecnicas de cuantizacion o para transferir aprendizaje a otros idiomas indios con caracteristicas similares.

## Benchmarks y rendimiento

El autor reporta las siguientes metricas, medidas con whisper.cpp sobre 24 clips de FLEURS `kn_in`, con decodificacion greedy y `no_timestamps`:

| Metrica | Valor |
|---|---|
| Word error rate (WER) | 33,3% |
| Character error rate (CER) | 20,1% |

Ademas, se comparo el rendimiento de la version q5_1 frente a float16 en hindi (64 clips), obteniendo un WER de 14,7% vs 15,9%. No se han publicado resultados en otros benchmarks estandar como MMLU o HumanEval, ya que el modelo es exclusivamente de ASR.

## Requisitos de hardware

- Tamano del modelo: 190 MB, lo que permite cargarlo en memoria RAM de cualquier dispositivo moderno.
- Inferencia en CPU: funciona en tiempo real en un Snapdragon 720G con 4 hilos, segun el autor. En CPUs de escritorio, la velocidad es significativamente mayor.
- VRAM: no requiere GPU dedicada; puede ejecutarse en CPU. Si se usa GPU, cualquier tarjeta con al menos 512 MB de VRAM es suficiente.
- Opciones de despliegue: whisper.cpp (CLI, bindings para Python, C, etc.), tambien compatible con servidores de inferencia como whisper-server.
- Latencia: en el movil de referencia, la transcripcion es mas rapida que el tiempo real; en hardware moderno, la latencia es de unos pocos segundos para archivos de audio de 1 minuto.

## Comparativa con modelos similares

El autor del modelo base, vasista22, publico tambien versiones tiny y medium para kannada. No se dispone de mediciones de rendimiento publicas para estas variantes, por lo que no se puede establecer una comparacion cuantitativa. Frente al Whisper small original de OpenAI, que soporta multiples idiomas, este fine-tune ofrece un WER inferior en kannada, aunque no se dispone de cifras exactas. La siguiente tabla resume las diferencias principales:

| Modelo | Tamano | Cuantizacion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ainotes-whisper-kannada-q5_1 | 190 MB | q5_1 | kn | Apache-2.0 | Optimizado para kannada, requiere no_timestamps |
| vasista22/whisper-kannada-tiny | ~75 MB (estimado) | no disponible | kn | Apache-2.0 | Version mas ligera, menor precision |
| vasista22/whisper-kannada-medium | ~1.5 GB (estimado) | no disponible | kn | Apache-2.0 | Version mas grande, mayor precision |
| openai/whisper-small | ~460 MB (float32) | no disponible | multilingue | MIT | Rendimiento inferior en kannada sin fine-tune |

## Limitaciones y advertencias

- El modelo solo soporta kannada; no funciona con otros idiomas.
- Es imprescindible configurar `no_timestamps` en whisper.cpp. Si se activan los timestamps, el modelo produce texto fluido pero completamente incorrecto, ya que los tokens de timestamp no fueron entrenados durante el fine-tune.
- La cuantizacion q5_1 puede introducir una ligera degradacion de la precision en comparacion con la version float16, aunque las mediciones del autor muestran una diferencia minima.
- El WER del 33,3% en FLEURS indica que el modelo no es perfecto y puede fallar en acentos o dialectos no representados en los datos de entrenamiento.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos publicos, puede reflejar sesgos presentes en esos corpus.
- Para uso en produccion, se recomienda validar el rendimiento con datos propios, especialmente si el audio contiene ruido, superposicion de voces o acentos regionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhaskaro/ainotes-whisper-kannada-q5_1
- Modelo base: https://huggingface.co/vasista22/whisper-kannada-small
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Repositorio de AiNotes (aplicacion de transcripcion local, no directamente relacionada con este modelo): https://github.com/roavelino/AiNotes
