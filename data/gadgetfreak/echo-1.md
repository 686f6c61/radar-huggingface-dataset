# gadgetfreak/echo-1

## Resumen

ECHO-1 no es un modelo de lenguaje único, sino un repositorio de paquetes de modelos on-device pensados para un asistente de supervivencia offline llamado ECHO-1, que funciona en iOS, Android, macOS y Linux (incluida Raspberry Pi) sin conexión a red. El autor del repositorio es el usuario de Hugging Face `gadgetfreak`, que actúa como empaquetador de modelos de terceros más que como entrenador. El repositorio recoge descargas opcionales con licencias mixtas, distribuidas en cuatro carpetas (`hearing/`, `speaking/`, `vision/`). El tamaño total del repo es de 0,7 GB y el número de parámetros declarado en safetensors es de 168.544.704.

Los componentes que agrupa son: Whisper small de OpenAI en exportación ONNX int8 para sherpa-onnx (reconocimiento de voz en 99 idiomas, 375 MB), Silero VAD (detección de actividad de voz, 2 MB), Supertonic 3 de Supertone para texto a voz en 31 idiomas en build ONNX int8 para sherpa-onnx (145 MB) y un codificador de visión derivado de Gemma 4 E2B de Google, recortado y cuantizado a Q8_0 para `mtmd` de llama.cpp (197 MB). El conjunto está orientado a pipelines de voz, visión y síntesis en local, no a generación de texto generalista por sí mismo.

La relevancia de este repositorio es de tipo práctico: ofrece artefactos ya preparados, con verificación SHA-256 por fichero y fijados a un commit concreto, para construir asistentes que funcionen sin red. Ahora bien, la model card no documenta el modelo de lenguaje que usa el asistente, y el codificador de visión solo es compatible con Gemma 4 E2B, lo que condiciona su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de paquetes heterogéneos: encoder-decoder transformer (Whisper small), VAD (Silero), TTS (Supertonic 3) y encoder de visión de Gemma 4 E2B para llama.cpp |
| Parametros totales | 168.544.704 (dato de safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX para sherpa-onnx en `hearing/` y `speaking/`); Q8_0 para matrices de bloques del encoder visual, F16 en tabla de posiciones y F32 en el resto |
| Idiomas soportados | 99 idiomas en reconocimiento de voz (Whisper small) y 31 idiomas en síntesis de voz (Supertonic 3); idiomas del asistente ECHO-1 no disponibles |
| Licencia | Mixta ("other", license_name: mixed): MIT para Whisper small y Silero VAD; código MIT y pesos bajo OpenRAIL-M de Supertone para el TTS; Apache 2.0 y licencia Gemma 4 para el encoder de visión |
| Formato de pesos | ONNX (int8) y GGUF (Q8_0/F16/F32); incluye `manifest.json`, `tts.json`, `unicode_indexer.bin`, `voice.bin` y ficheros de tokens |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: redistribuye artefactos de terceros con modificaciones acotadas y documentadas. La parte de audición es Whisper small de OpenAI (transformer encoder-decoder) exportado a ONNX en 8 bits para el runtime sherpa-onnx; la detección de voz la aporta Silero VAD. La parte de habla es Supertonic 3, un sistema TTS de Supertone con build int8 para sherpa-onnx y ficheros auxiliares para indexación Unicode y voz. La parte de visión procede de `gemma-4-E2B-it-mmproj.gguf` de Google, un proyector multimodal para llama.cpp.

La innovación concreta de este repo está en el proceso de adelgazamiento del proyector visual descrito en la model card: partiendo del fichero original de Google, que contiene un codificador de imagen (367 MB) y uno de audio (612 MB) en BF16, el autor elimina el codificador de audio y su proyector, convierte las matrices por bloques del codificador de imagen a Q8_0, deja la tabla de posiciones en F16 y el resto en F32. Según la model card, en pruebas con decodificación greedy el resultado coincide con el fichero original. El script de conversión se cita como `scripts/make_vision_mmproj.py`. No se documentan datos de entrenamiento, composición del dataset, RLHF ni DPO, porque no se entrena nada aquí.

## Capacidades

- Reconocimiento de voz multilingüe offline en 99 idiomas mediante Whisper small en ONNX int8 con sherpa-onnx.
- Detección de actividad de voz (VAD) con Silero para segmentar audio antes de transcribir y ahorrar cómputo.
- Síntesis de voz en 31 idiomas con Supertonic 3 en build int8, con ficheros de voz y de indexación incluidos.
- Codificación de imágenes para modelos multimodales a través del proyector GGUF para `mtmd` de llama.cpp.
- Verificación de integridad de cada descarga mediante SHA-256 y fijado a un commit concreto mediante `manifest.json`.
- Ejecución sin red en iOS, Android, macOS, Linux y Raspberry Pi.
- No es un modelo de generación de texto: no se documenta capacidad de chat, razonamiento, código, matemáticas, tool calling ni funciones de agente propias.

## Casos de uso

- Asistente de voz offline en situaciones de emergencia: el paquete `hearing/` transcribe el habla localmente en 99 idiomas con Whisper small int8 y Silero VAD segmenta el audio, de modo que el asistente responde sin cobertura de red en escenarios de supervivencia.
- Retroalimentación hablada en dispositivos sin conexión: `speaking/` permite sintetizar respuestas en 31 idiomas con Supertonic 3 a 145 MB, adecuado para dispositivos con poco almacenamiento y sin acceso a servicios de nube.
- Análisis de imágenes con Gemma 4 E2B en local: el fichero `vision/gemma-4-E2B-vision-q8_0.gguf` (197 MB) se carga en llama.cpp con `mtmd` junto con `gemma-4-E2B_q4_0-it.gguf` para describir, clasificar o extraer texto de imágenes sin enviar datos a un tercero.
- Asistentes domésticos en Raspberry Pi: la combinación de Whisper small, Silero VAD y Supertonic 3 en ONNX int8 se ejecuta en Linux ARM, lo que permite montar un nodo de voz completo en hardware de bajo consumo.
- Aplicaciones móviles de accesibilidad: integración de dictado y lectura en voz alta en iOS o Android a través de sherpa-onnx, con verificación SHA-256 de los ficheros para desplegar actualizaciones controladas por commit.
- Distribución de paquetes verificables en producción: el modelo de `manifest.json` con SHA-256 por fichero sirve como patrón para pipelines de despliegue que instalan modelos en el dispositivo y rechazan ficheros alterados o incompletos.
- Prototipos de agentes con percepción y habla: emplear el encoder visual de Gemma 4 E2B más un LLM compatible con llama.cpp permite construir un bucle de percepción-acción completamente local, siempre que el LLM sea E2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que, en pruebas con decodificación greedy, el encoder de visión recortado produce la misma salida que el fichero original de Google.

## Requisitos de hardware

- VRAM estimada para el encoder de visión: 197 MB de pesos en Q8_0/F16/F32; el consumo real depende del LLM Gemma 4 E2B al que acompaña.
- Reconocimiento de voz: Whisper small int8 ocupa 375 MB en disco; la memoria en ejecución con sherpa-onnx no se documenta y depende del backend (CPU o acelerador).
- Síntesis de voz: 145 MB en disco para Supertonic 3 int8.
- GPU recomendadas: no disponible. El diseño está orientado a CPU y dispositivos móviles; no se citan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, cualquiera de los paquetes individuales cabe en GPUs de consumo, aunque no se documentan requisitos de VRAM para inferencia conjunta.
- Opciones de despliegue: sherpa-onnx (audio y TTS) y llama.cpp con `mtmd` (visión junto con Gemma 4 E2B). vLLM, TGI y Ollama no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo o paquete | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECHO-1 on-device packs (este repo) | 168.544.704 declarados en safetensors; componentes individuales de 2 MB a 375 MB | no disponible | no disponible (solo equivalencia greedy del encoder visual con el original) | Mixta (MIT, OpenRAIL-M, Apache 2.0, Gemma 4) | Hugging Face, 0 descargas, 0 likes |
| csukuangfj/sherpa-onnx-whisper-small | Whisper small | no disponible | no disponible | MIT | Hugging Face (fuente upstream) |
| google/gemma-4-E2B-it-qat-q4_0-gguf | Gemma 4 E2B | no disponible | no disponible | Apache 2.0 y licencia Gemma 4 | Hugging Face (fuente upstream) |
| Supertonic 3 (Supertone) | no disponible | no disponible | no disponible | OpenRAIL-M en pesos, código MIT | Hugging Face y releases de sherpa-onnx |

## Limitaciones y advertencias

- No es un modelo entrenado ni una ficha de LLM: reempaqueta pesos de terceros; los derechos y las condiciones de uso de cada componente corresponden a sus autores.
- Licencia mixta con implicaciones distintas por carpeta: OpenRAIL-M de Supertone impone restricciones de uso en los pesos de TTS; Gemma 4 añade su propia licencia al encoder visual; Whisper small y Silero VAD son MIT.
- El encoder de visión solo funciona con Gemma 4 E2B (`gemma-4-E2B_q4_0-it.gguf`); no es compatible con otros LLM.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluación por idioma para ninguno de los componentes recortados o reempaquetados; la model card no incluye evaluación de calidad.
- El repo tiene 0 descargas y 0 likes, lo que reduce la validación independiente de los artefactos.
- Las URLs de búsqueda web corresponden a un producto no relacionado (robot humanoide Echo de Realbotix, renombrado Series 1) y no deben asociarse con este repositorio.
- No se documenta el modelo de lenguaje del asistente ECHO-1 ni su contexto, idiomas o comportamiento, lo que impide evaluar el sistema completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gadgetfreak/echo-1
- Whisper small para sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-small
- Silero VAD: https://github.com/snakers4/silero-vad
- VAD empaquetado: https://huggingface.co/csukuangfj/vad
- Releases de modelos TTS de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
- Supertonic (Supertone): https://huggingface.co/Supertone/supertonic
- Gemma 4 E2B QAT Q4_0 GGUF: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
