# arraypress/scribe-piano

## Resumen

scribe-piano es una conversión a Apple Core AI (formato `.aimodel`) del modelo de transcripción de piano de alta resolución desarrollado por ByteDance en 2020, publicado originalmente como "High-resolution Piano Transcription with Pedals by Regressing Onset and Offset Times" (arXiv:2010.01815). El repositorio lo mantiene el usuario `arraypress` y no introduce reentrenamiento, poda ni reescritura de la arquitectura: se limita a exportar el checkpoint `CRNN_note_F1=0.9677_pedal_F1=0.9186` del proyecto `bytedance/piano_transcription` al formato de inferencia de Apple, con los pesos en float32.

El modelo resuelve un problema muy concreto: convertir audio de piano solista en eventos MIDI con información de velocidad por nota y de pedal de sustain (controlador 64), algo que los sistemas genéricos de audio-a-MIDI no capturan. La arquitectura es una CRNN de aproximadamente 43 millones de parámetros que trabaja sobre espectrogramas log-mel de 229 bandas Slaney (30–8000 Hz) y produce siete salidas framewise (frame, onset, offset, velocity, pedal onset, pedal offset y pedal frame). Cada segmento procesado cubre 10 segundos a 100 fps (1001 frames), con un salto de 5 segundos entre segmentos.

La relevancia actual del artefacto es de ingeniería más que de investigación: demuestra que un modelo recurrente (con dieciséis GRU bidireccionales) puede ejecutarse sobre Core AI pese a que este runtime no tiene operador recurrente, descomponiendo las recurrencias en el host (Swift + Accelerate) a partir de un vector plano de pesos, mientras el tronco convolucional se ejecuta en GPU. El resultado es una ruta de despliegue nativa para Apple silicon con macOS 27.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (convolucional + recurrente bidireccional, 7 cabezas framewise) |
| Parametros totales | ~43 M (heredados del checkpoint upstream; no se modifican) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Segmentos de 10 s (1001 frames a 100 fps), con salto de 5 s entre segmentos |
| Tipos de cuantizacion | Solo float32 (`scribe-piano-float32.aimodel`, 136 MB) |
| Idiomas soportados | No aplica (modelo de audio; sin interfaz de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI), float32; pesos de GRU y cabezas exportados como vector plano |
| Entrada | Log-mel `[1, 1001, 229]`, 229 mels Slaney de 30 a 8000 Hz en dB |
| Salidas del tronco | `[1, 1001, 768]` (frame, onset, offset, velocity, pedal onset, pedal offset, pedal frame) |
| Requisitos de plataforma | macOS 27, Apple silicon |
| Libreria / runtime | `swift-music-transcriber` (MIT), CLI `scribe --engine piano` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una CRNN de transcripción de piano con siete salidas framewise independientes: activación de frame, onset, offset, velocidad de nota, onset de pedal, offset de pedal y frame de pedal. La entrada es un espectrograma log-mel de 229 bandas Slaney calculado en el rango de 30 a 8000 Hz, evaluado a 100 fps sobre segmentos de 10 segundos. Sobre esa representación opera un tronco convolucional que produce características de 768 dimensiones por frame; a continuación, dieciséis recurrencias bidireccionales (GRU) modelan la dependencia temporal y alimentan las cabezas de predicción. La "alta resolución" del método original proviene de regresar directamente los tiempos de onset y offset en lugar de limitarse a la activación por frame, más la velocidad estimada por nota y la predicción explícita del pedal de sustain.

No hay entrenamiento propio en esta ficha: los pesos proceden del checkpoint público de `bytedance/piano_transcription` y el exportador no aplica poda, cuantización ni ajuste fino. La adaptación técnica reseñable es la descomposición de las recurrencias, ya que Core AI no dispone de operador recurrente y un GRU descompuesto se expandiría a unas 770 000 operaciones a este tamaño. En consecuencia, el `.aimodel` expone dos puntos de entrada: `trunk` (convoluciones, ejecutables en GPU) y `parameters` (todos los pesos de GRU y cabezas como vector plano, ejecutados en el host con Swift y Accelerate). El front-end de audio, la segmentación con salto de 5 s, el stitching entre segmentos, el post-procesador de regresión y las máquinas de estado de notas y pedal residen fuera del modelo, en la librería `swift-music-transcriber`. La fidelidad declarada frente al Python original es alta: el tronco coincide a 155 dB PSNR a través de Core AI en GPU, el GRU en Swift coincide con PyTorch a 112 dB sobre las activaciones del propio tronco, las siete salidas framewise concuerdan entre 123 y 147 dB, y los eventos de nota y pedal resultan idénticos con tiempos de onset y offset dentro de 0,001 ms.

## Capacidades

- Transcripción de piano solista a MIDI, con nota, onset, offset y velocidad estimada por nota.
- Detección y modelado del pedal de sustain (eventos de onset, offset y frame de pedal; controlador 64 en la salida MIDI).
- Resolución polifónica de acordes y pasajes densos dentro de un mismo instrumento.
- Procesamiento de audio de entrada con ventanas de 10 segundos y stitching entre segmentos con salto de 5 segundos, lo que permite transcribir piezas más largas que la ventana.
- Inferencia sobre Apple silicon mediante Core AI, con el tronco en GPU y las recurrencias en CPU/Accelerate.
- Integración directa en línea de comandos vía `scribe recording.wav --engine piano`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni interfaz de texto.
- No dispone de capacidades multimodales más allá del audio: sin visión, sin voz, sin generación de lenguaje.
- Capacidades multilingües: no aplica (modelo de audio).

## Casos de uso

- Digitalización de grabaciones de piano: transcribir una interpretación capturada con micrófono a un archivo MIDI editable, preservando velocidades por nota, lo que permite reeditar la interpretación en un DAW sin volver a grabarla.
- Generación de partituras y MusicXML: a partir del MIDI con onsets y offsets precisos (diferencias declaradas de 0,001 ms frente al original en Python) se puede alimentar un motor de notación para producir partituras revisables.
- Análisis musicológico y educativo: obtener datos cuantitativos de tempo, dinámica (velocidad por nota) y uso del pedal en una grabación concreta, útil para comparar interpretaciones de una misma obra.
- Acompañamiento y sincronización en directo: al operar en local sobre Apple silicon y con ventanas de 10 s, puede integrarse en herramientas de escenario que sigan la interpretación para disparar clips, luces o páginas de partitura.
- Archivado y catalogación de fondos sonoros: convertir lotes de grabaciones de piano solista a MIDI para indexarlas y permitir búsquedas por contenido melódico o armónico.
- Desarrollo de aplicaciones macOS nativas: al distribuirse como `.aimodel` con runtime Core AI, se puede empaquetar en una app Swift sin dependencias de Python ni de CUDA.
- Reproducción de pipelines de investigación: usar `uv run Tools/export_piano.py` para replicar la conversión y verificar la fidelidad numérica frente a la implementación PyTorch de referencia.
- Corrección/limpieza de interpretaciones: cargar el MIDI transcrito en un editor para cuantizar o corregir notas erróneas antes de producir una versión final.

## Benchmarks y rendimiento

Los únicos valores numéricos disponibles proceden del nombre del checkpoint upstream seleccionado y de las medidas de fidelidad de la conversión. No se han publicado en la información disponible evaluaciones independientes ni comparaciones con otros sistemas.

| Metrica | Valor | Origen |
|---|---|---|
| Note F1 (upstream) | 0,9677 | Nombre del checkpoint `CRNN_note_F1=0.9677_pedal_F1=0.9186` |
| Pedal F1 (upstream) | 0,9186 | Nombre del checkpoint `CRNN_note_F1=0.9677_pedal_F1=0.9186` |
| PSNR del tronco vs. Python (GPU, Core AI) | 155 dB | Model card |
| Concordancia del GRU Swift vs. PyTorch | 112 dB | Model card |
| Concordancia de las 7 salidas framewise | 123–147 dB | Model card |
| Desviacion de tiempos de onset/offset | < 0,001 ms | Model card |
| Latencia y throughput | no disponible | — |

## Requisitos de hardware

- Peso del modelo: `scribe-piano-float32.aimodel` ocupa 136 MB, por lo que el tronco en float32 ocupa una fraccion minima de memoria unificada.
- Plataforma obligatoria: macOS 27 sobre Apple silicon. No hay ruta oficial para x86, Linux, Windows ni GPU NVIDIA/AMD.
- GPU: cualquier chip Apple silicon (familias M) es suficiente para el tronco, que se ejecuta en GPU a traves de Core AI; no se requieren A100, H100 ni RTX.
- Caben en GPU de consumo: si, en cualquier Mac con Apple silicon. En equipos sin Apple silicon no hay despliegue soportado.
- Memoria: no se publican cifras exactas; el peso de 136 MB y el contexto de 1001 frames por segmento sugieren un consumo muy por debajo de 1 GB, pero es una estimacion, no un dato del autor.
- Opciones de despliegue: Core AI con la libreria `swift-music-transcriber` y la CLI `scribe` (`--engine piano`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Alternativa fuera de Apple: usar el proyecto upstream `bytedance/piano_transcription` en PyTorch, que es el origen de estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scribe-piano (esta ficha) | ~43 M | 10 s por segmento, salto de 5 s | Note F1 0,9677 / Pedal F1 0,9186 (upstream) | Apache 2.0 | Apple Core AI, macOS 27 + Apple silicon |
| ByteDance `piano_transcription` (upstream) | ~43 M | 10 s por segmento | Note F1 0,9677 / Pedal F1 0,9186 | Apache 2.0 | Python/PyTorch, multiplataforma |
| Onsets and Frames (Google Magenta) | no disponible | no disponible | no disponible | no disponible | TensorFlow, multiplataforma |
| Basic Pitch (Spotify) | no disponible | no disponible | no disponible | no disponible | Python/TensorFlow, instrumento generico |

La comparacion relevante es con el modelo upstream, del que scribe-piano es una conversion fiel: comparten pesos y metricas, y solo difieren en el runtime y en la plataforma soportada. Los sistemas genericos de audio-a-MIDI (Onsets and Frames, Basic Pitch) cubren mas instrumentos, pero no modelan velocidad por nota ni pedal de sustain, que es precisamente la aportacion del modelo de ByteDance. No se dispone de datos verificables de parametros ni metricas para esas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado en piano solista: no esta disenado ni validado para mezclas, ensembles ni otros instrumentos. La presencia de acompanamiento degradara la transcripcion.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de lenguaje: es exclusivamente un modelo de transcripcion de audio.
- Dependencia estricta de plataforma: requiere macOS 27 y Apple silicon. No hay ruta de despliegue soportada en Linux, Windows ni GPUs NVIDIA.
- Las recurrencias (dieciseis GRU bidireccionales) se ejecutan en el host en Swift/Accelerate, no en el acelerador; el rendimiento real dependera de la CPU y no solo de la GPU.
- La conversion no fue reentrenada ni podada, por lo que hereda integramente los sesgos y fallos del checkpoint de 2020: errores en pasajes con pedalizacion ambigua, trinos rapidos, resonancias o grabaciones con ruido.
- Riesgo de alucinacion acustica: al ser un modelo de regresion de onsets, puede inventar notas en material no pianistico (voz, percusion) o fusionar notas en acordes densos.
- No se declaran idiomas porque no aplica; el unico formato de entrada es audio mono en el rango 30-8000 Hz.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento comunitario.
- Licencia Apache 2.0 heredada del upstream, apta para uso comercial, pero conviene conservar la atribucion y la cita de arXiv:2010.01815.
- No hay datos publicados de latencia, throughput ni consumo de memoria en produccion; habria que medirlos en el hardware objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/arraypress/scribe-piano
- Libreria anfitriona (Swift, MIT): https://github.com/arraypress/swift-music-transcriber
- Repositorio upstream (ByteDance): https://github.com/bytedance/piano_transcription
- Paper: "High-resolution Piano Transcription with Pedals by Regressing Onset and Offset Times", arXiv:2010.01815 — https://arxiv.org/abs/2010.01815
- Piano Scribe (app de transcripcion basada en Onsets and Frames, referencia de comparacion, no relacionada): https://arris42.github.io/pianoscribe/
- Piano Scribe (implementacion alternativa): https://github.com/darumond/piano-scribe
- Piano Scribe (Virtual Bard): https://www.virtualbard.com/piano_scribe
