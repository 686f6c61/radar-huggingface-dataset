# coder543/underdog-bark-3.0-plus-glade

## Resumen

Underdog Bark 3.0 Plus for Glade es una conversión del checkpoint de reconocimiento automático de voz (ASR) ConwayResearch/Underdog-Bark-3.0-Plus, publicada por el usuario coder543 para el runtime Glade. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de grafos Core AI y configuración de ejecución orientada a Apple Silicon (iOS 27 y macOS 27), con los pesos originales cuantizados a formatos INT5/INT6 y almacenados en tablas LUT6 agrupadas. El modelo base desciende de Parakeet Ultra y emplea una arquitectura FastConformer/TDT con 24 capas de encoder, 1.024 canales, ocho cabezas de atención y un predictor LSTM de dos capas y 640 canales. El recuento exacto de parámetros es de 627.008.134.

El modelo resuelve transcripción de voz en inglés con marcas de tiempo a nivel de palabra, pensado para ejecutarse en hardware Apple (ANE) con un consumo de memoria moderado (en torno a 1,2-1,3 GB en las pruebas del autor). Su relevancia radica en que demuestra un pipeline ASR completo (frontend log-mel, encoder, decodificación TDT greedy, tokenización y timings nativos) empaquetado en un único bundle de 591,1 MB, con velocidades de 278× a 466× tiempo real según el dispositivo.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face; no hay información sobre el entrenamiento original del modelo base, benchmarks independientes ni detalles de licencia más allá de CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer/TDT (encoder de 24 capas, 1.024 canales, 8 cabezas de atención; predictor LSTM de 2 capas y 640 canales) |
| Parametros totales | 627.008.134 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | chunks de hasta 60 segundos con atención bidireccional completa dentro de cada chunk; forma de encoder de 768 posiciones |
| Tipos de cuantizacion | INT5/INT6 nativos con escalas originales; tablas LUT6 agrupadas (8 filas fuente por grupo); decodificador FP16 batcheado en ANE |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | grafos Core AI convertidos (bundle de 591,1 MB); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un FastConformer/TDT de 24 capas de encoder con 1.024 canales y ocho cabezas de atención, más un predictor LSTM de dos capas y 640 canales que alimenta el decodificador TDT. El frontend es log-mel de 128 bins sobre audio mono a 16 kHz, con 250 ms de silencio inicial por chunk independiente. La conversión mantiene atención bidireccional completa y la base finita de posiciones relativas dentro de cada chunk, dividiendo el encoder en seis assets de cuatro capas cada uno sin fragmentar el contexto de atención. No se publica cabeza VAD.

La información disponible no detalla los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La conversión a Glade preserva los códigos INT5/6 nativos y las escalas originales en un sidecar del decodificador del host, sin reajustar centroides; las paletas de fila del encoder (dos o tres magnitudes aprendidas, sus negativos y cero) se almacenan sin pérdida en tablas LUT6 agrupadas. La decodificación es TDT greedy con duraciones 0-4 y como máximo diez símbolos por frame acústico, siguiendo los valores por defecto del modelo original.

## Capacidades

- Reconocimiento automático de voz en inglés (transcripción de audio mono a 16 kHz).
- Marcas de tiempo a nivel de palabra con paso de frame de 80 ms (no son forced alignment).
- Procesamiento por chunks de hasta 60 segundos con límites en silencio, preservando todas las muestras de audio.
- Dos peticiones de encoder concurrentes y decodificador ANE FP16 batcheado con capacidades 16 y 32.
- No dispone de cabeza VAD (detección de actividad de voz).
- No se documentan tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del ASR ni modo thinking.
- Multilingüismo limitado al inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz en dispositivos Apple: el modelo procesa chunks de hasta 60 segundos con marcas de tiempo por palabra, adecuado para apps de dictado en iPhone o Mac con consumo de memoria en torno a 1,2 GB.
- Subtitulado y alineación temporal de contenido audiovisual: los timings nativos con paso de 80 ms permiten generar subtítulos sincronizados sin un paso separado de alineación forzada.
- Procesamiento por lotes de archivos largos en Mac: con un rendimiento de 278× a 350× tiempo real en M3 y M5 Max, es viable transcribir horas de audio en minutos.
- Integración en pipelines de accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, aprovechando la ejecución en ANE sin GPU.
- Anonimización y análisis de llamadas: la transcripción con timings permite localizar y redactar información sensible en grabaciones de atención al cliente.
- Investigación en ASR sobre Apple Silicon: sirve como referencia de despliegue de FastConformer/TDT en Core AI con cuantización INT5/6 y comparación de WER frente a Whisper.

## Benchmarks y rendimiento

| Prueba | Dispositivo | Resultado |
|---|---|---|
| RTFx, audio de 20 s | M3 MacBook Air, 16 GB | 56,8× (0,352 s) |
| RTFx, audio de 18 min 15 s | M3 MacBook Air, 16 GB | 278,2× (3,937 s) |
| RTFx, grabación completa | MacBook Pro M5 Max, 64 GB | 350,9× (3,121 s) |
| RTFx, grabación completa | iPhone Duo (A20 Pro) | 466,8× (2,347 s) |
| WER normalizado Whisper, grabación JFK | M3 MacBook Air | 2,34% (52/2220 errores) |
| Memoria pico (cliente + ANE) | M3 MacBook Air | 1,32 GB |
| Memoria pico (cliente) | iPhone Duo | 1,24 GB |
| Preparación inicial | M3 / iPhone | 103,7 s / 195,0 s |
| Preparación cacheada | M3 | 0,113 s |

El WER de 2,34% corresponde a una única grabación en inglés y el propio autor lo califica como una comprobación limitada de la conversión, no como una clasificación amplia de precisión ni verificación independiente de las afirmaciones del publicador. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon físico con iOS 27 o macOS 27; no se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- Memoria: huella pico muestreada de 1,32 GB en M3 (cliente + ANE) y 1,24 GB en iPhone Duo (solo cliente, excluyendo asignaciones de acelerador/driver).
- Dispositivos cualificados: M3 MacBook Air de 16 GB, MacBook Pro M5 Max (18 núcleos CPU, 40 GPU, 64 GB) e iPhone Duo (A20 Pro).
- Despliegue: exclusivamente mediante el runtime Glade (CLI y app Benchmark); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,352 s para 20 s de audio en M3; 3,121 s para 18 min 15 s en M5 Max; 2,347 s en iPhone Duo.
- Preparación inicial costosa (103,7 s en M3, 195,0 s en iPhone) que se cachea a 0,113 s en ejecuciones posteriores.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos ASR comparables (Whisper, Parakeet original, etc.) más allá de la mención a Whisper como normalizador del WER.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- El WER de 2,34% proviene de una única grabación y no constituye una evaluación amplia ni independiente.
- La conversión no está avalada por Conway Research, Moondream ni NVIDIA.
- Requiere hardware Apple Silicon y versiones concretas de sistema operativo (iOS 27 / macOS 27), lo que limita su despliegue en servidores convencionales.
- La preparación inicial puede tardar más de 100 segundos en el primer arranque.
- Los timings de palabra tienen paso de 80 ms y no son alineación forzada, por lo que pueden desviarse en habla rápida o solapada.
- El procesamiento por chunks de 60 segundos difiere de pasar una grabación completa en un solo contexto al modelo original, lo que puede afectar a la coherencia en grabaciones muy largas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero debe conservarse el aviso de licencia y NOTICE.
- No se documentan sesgos específicos ni tasas de alucinación; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados en el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/coder543/underdog-bark-3.0-plus-glade
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Plus
- Repositorio de benchmarks y muestras: https://github.com/coder543/stt-bench-matrix/tree/main/samples
