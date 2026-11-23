# Genius-Society/piano_trans

## Resumen

Piano_trans es un sistema de transcripcion automatica de piano (automatic music transcription, AMT) publicado por Genius-Society y basado en el trabajo "High-Resolution Piano Transcription with Pedals by Regressing Onset and Offset Times" de Qiuqiang Kong (ByteDance), referenciado con el arXiv 2010.01815. El modelo convierte senales de audio de interpretaciones de piano en representaciones tipo partitura, capturando con precision el instante de inicio y fin de cada nota (onset/offset) asi como el uso de pedales.

A diferencia de los modelos de lenguaje, se trata de un modelo de vision por computador aplicado al espectrograma de audio: la libreria declarada es `timm`, lo que indica que el backbone es una red convolucional del catalogo de PyTorch Image Models que opera sobre representaciones tiempo-frecuencia. La model card menciona el uso combinado de redes convolucionales y recurrentes para modelar dependencias temporales largas y estructuras musicales complejas.

El repositorio tiene un tamano de 0,2 GB, licencia MIT y esta etiquetado unicamente para ingles. Es relevante para investigadores y desarrolladores de MIR (music information retrieval) que necesiten un componente listo para usar en tareas de transcripcion de piano, analisis musical o educacion asistida por ordenador, si bien la informacion publica sobre pesos, parametros y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (backbone `timm`) combinada con capas recurrentes para modelado temporal; sistema de transcripcion de alta resolucion con regresion de onset y offset |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de la model card; el modelo procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,2 GB gestionado con Git LFS; la model card solo documenta `snapshot_download`) |

## Arquitectura y entrenamiento

La model card describe un sistema que combina redes neuronales convolucionales y recurrentes para la transcripcion de piano. El backbone convolucional pertenece a la familia `timm`, y la innovacion principal del trabajo de referencia (Kong et al., 2020) consiste en regresar directamente los tiempos de onset y offset de cada nota en lugar de limitarse a clasificar frames, lo que permite una resolucion temporal alta incluso con notas muy proximas o solapadas. El sistema tambien modela el uso de pedales, un aspecto habitualmente ignorado en sistemas de transcripcion previos.

No se especifican en la informacion disponible el numero de tokens de audio empleados en el entrenamiento, la composicion exacta del dataset (aunque el trabajo original usa MAESTRO), ni si se aplicaron tecnicas de aumento de datos o ajuste fino especifico. Tampoco se detalla la funcion de perdida ni el esquema de entrenamiento multi-tarea.

## Capacidades

- Transcripcion automatica de audio de piano a representacion de partitura (pitch y tiempo de cada nota).
- Regresion de tiempos de onset y offset con resolucion temporal alta.
- Deteccion y modelado del uso de pedales (sustain).
- Manejo de estructuras musicales complejas y pasajes de alta densidad de notas.
- Extraccion de caracteristicas de audio mediante backbone convolucional `timm`.
- Uso como componente en pipelines de MIR (music information retrieval).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades de vision general, audio generativo ni habla.

## Casos de uso

- Digitalizacion de grabaciones de piano: convertir interpretaciones historicas o grabaciones de estudio en representaciones MIDI o tipo partitura para archivo y edicion posterior, aprovechando la resolucion de onset/offset del modelo.
- Educacion musical asistida: analizar la interpretacion de un alumno y comparar sus tiempos de nota y uso de pedal con una referencia, generando retroalimentacion objetiva sobre precision ritmica.
- Investigacion en musicologia computacional: extraer datos cuantitativos de tempo, articulacion y pedal de corpus de grabaciones para estudios estadisticos a gran escala.
- Generacion de partituras para produccion musical: obtener una transcripcion inicial editable a partir de una maqueta de piano grabada, reduciendo el trabajo manual de transcripcion.
- Sistemas de acompanamiento y partituras sincronizadas: alimentar aplicaciones que muestran la partitura siguiendo la interpretacion en tiempo real, gracias a la precision temporal del modelo.
- Entrenamiento de modelos de generacion musical: usar las transcripciones como datos etiquetados (pseudo-labels) para entrenar modelos de generacion condicionada por partitura.
- Analisis de interpretacion y estilo: comparar el uso de pedal y la articulacion entre interpretes o escuelas pianisticas a partir de las transcripciones automaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB, por lo que es probable que quepa en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible en tarjetas con 4-8 GB de VRAM, pero es una estimacion no verificada.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). La model card solo muestra descarga via `huggingface_hub.snapshot_download` y clonado con Git LFS. Existe un Space de demostracion en Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Genius-Society/piano_trans | CNN + RNN para transcripcion de piano | no disponible | no aplica | MIT | Hugging Face, ModelScope |
| Modelos AMT de la literatura (p. ej. Onsets and Frames, Basic Pitch) | Redes neuronales para transcripcion musical | no disponible | no aplica | variable | Repositorios publicos |
| Modelos genericos de audio (Whisper, etc.) | Speech-to-text | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento (accuracy, F1 de notas, etc.) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La informacion publica es muy escasa: no se documentan parametros, dataset de entrenamiento, metricas ni procedimiento de inferencia detallado, lo que dificulta su evaluacion rigurosa.
- El modelo esta especializado exclusivamente en piano; no es aplicable a otros instrumentos ni a voz.
- La model card solo declara el idioma ingles, aunque al tratarse de audio la relevancia del idioma es limitada.
- Riesgo de errores en pasajes polifonicos densos, pedales ambiguos o grabaciones con ruido; no se documentan tasas de error.
- No se especifica el formato exacto de los pesos ni la API de inferencia (solo descarga del repositorio), lo que puede requerir ingenieria inversa del codigo del Space de demostracion.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda conservar el aviso de copyright y citar el trabajo original (arXiv 2010.01815).
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling ni agentes; cualquier expectativa en ese sentido es erronea.
- Fecha de actualizacion del repositorio (2026-11-23) posterior a la creacion (2023-07-01); no se documenta que cambios se introdujeron.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Genius-Society/piano_trans
- Demo (Space): https://huggingface.co/spaces/Genius-Society/piano_trans
- Mirror en ModelScope: https://www.modelscope.cn/models/Genius-Society/piano_trans
- Paper de referencia: https://arxiv.org/pdf/2010.01815
