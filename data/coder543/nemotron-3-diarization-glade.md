# coder543/nemotron-3-diarization-glade

## Resumen

Nemotron 3 Diarization for Glade es una conversión del modelo de diarización de hablantes Nemotron 3 Diarization de NVIDIA, publicada por el usuario coder543 para su uso con Glade, un runtime de inferencia sobre Core AI y el Apple Neural Engine. El repositorio no contiene pesos en formato convencional (safetensors o GGUF), sino artefactos `.aimodel` empaquetados en dos bundles autocontenidos (`fast32` y `fast128`) que cubren el frontend log-mel, el extractor de embeddings y el encoder de diarización.

El modelo original de NVIDIA resuelve el problema de segmentar audio en hablantes y mantener identidades estables en flujo continuo, admitiendo hasta ocho hablantes solapados. Esta conversión conserva esa capacidad y la orienta a ejecución local en dispositivos Apple Silicon, con rendimiento medido de 197,5× a 531,9× en tiempo real (RTFx) en un M3 MacBook Air y de 192,7× a 514,4× en un iPhone 15 Pro Max.

Es relevante porque demuestra que la diarización de hablantes de calidad puede ejecutarse íntegramente en el Neural Engine de hardware de consumo, sin GPU dedicada y con latencia de bloque de 2,56 s o 10,24 s según la política elegida. La conversión no está avalada por NVIDIA y exige un runtime anfitrión específico del modelo que implemente el contrato descrito en `metadata.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con atención bidireccional completa; frontend FFT/log-mel externo; extractor de embeddings (1024 a 512 canales) más encoder de diarización |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana por paso: 2,56 s (fast32) o 10,24 s (fast128) de audio nuevo; capacidad de encoder de 352 posiciones (fast32) y 448 posiciones (fast128); cada posición equivale a 80 ms |
| Tipos de cuantizacion | FP16 (conversión Glade); no se documentan otras precisiones |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma en la documentación) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | `.aimodel` (Core AI), más ficheros auxiliares `mel-filter.f32`, `window.f32`, `silence.f32` y `metadata.json` |

## Arquitectura y entrenamiento

La documentación disponible describe únicamente la topología de inferencia, no el proceso de entrenamiento. El pipeline consta de un frontend FFT/log-mel que el runtime anfitrión debe implementar, un apilado de características, un módulo `embedding.aimodel` que transforma características apiladas `[1,1024,1,chunk_frames+4]` en embeddings ocultos `[1,512,1,chunk_frames+4]`, y un `encoder.aimodel` que recibe esos embeddings junto con una máscara de prefijo válido `[1,1,1,encoder_capacity]` y devuelve logits `[1,8,8,encoder_capacity]`, correspondientes a 8 subframes y 8 hablantes por posición de encoder.

Los grafos preservan atención bidireccional completa: no truncan contexto ni descartan audio de entrada. El sistema mantiene una caché de hablantes en orden de llegada (264 posiciones) y una FIFO de 40 posiciones, actualizadas cada 40 posiciones (3,2 s de audio). Se aplica lookahead de 0,32 s y una probabilidad sigmoide independiente por hablante y subframe, con conversión posterior a tramas de 10 ms en orden temporal. El buffering inicial es de aproximadamente 2,88 s en `fast32` y 10,56 s en `fast128`. No se dispone de información sobre volumen de tokens, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Diarización de hablantes en streaming con identidades estables a lo largo del flujo de audio.
- Manejo de hasta ocho hablantes solapados simultáneamente (eje de 8 hablantes en los logits).
- Detección de actividad de voz implícita en la salida de probabilidades por hablante y trama.
- Dos perfiles de latencia: `fast32` (2,56 s de audio nuevo por paso, 0,32 s de lookahead) para uso en vivo y `fast128` (10,24 s por paso) para procesamiento final de mayor calidad.
- Ejecución íntegra en Apple Neural Engine, con cero intervalos de GPU en el proceso objetivo según las trazas del autor.
- Determinismo: las salidas de probabilidad en iPhone son idénticas bit a bit a las del Mac cualificado.
- No incluye tool calling, function calling, razonamiento multi-step, visión, audio generativo ni capacidades multilingües de texto.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el modelo etiqueta cada trama de 10 ms con el hablante correspondiente, de modo que un ASR posterior puede asignar turnos de palabra en actas automáticas, aprovechando la caché de hablantes para mantener identidades entre intervenciones.
- Subtitulado en directo en apps de videoconferencia para macOS o iOS: con `fast32` y un buffering inicial de 2,88 s, el coste de proceso es de aproximadamente 5,4 s por cada 18 minutos de audio en un M3, lo que deja margen holgado para el resto del pipeline en tiempo real.
- Postprocesado de archivos largos (podcasts, entrevistas, grabaciones de clase): `fast128` procesa 18 min 15 s en 2,1 s en M3 y 2,13 s en iPhone 15 Pro Max, adecuado para lotes en segundo plano en el propio dispositivo.
- Análisis forense o de compliance de llamadas: la diarización permite separar agentes y clientes en grabaciones de centros de contacto sin enviar audio a la nube, con la ventaja de privacidad que supone la ejecución local en el Neural Engine.
- Accesibilidad y transcripción de reuniones en el dispositivo: integrable en apps de notas que necesiten identificar quién habla sin conexión, con un footprint máximo registrado de unos 290 MB en iPhone.
- Investigación en procesamiento de habla: sirve como referencia reproducible de diarización en ANE, con contrato versionado en `metadata.json` y comparación documentada frente a FluidAudio sobre el mismo audio de prueba.

## Benchmarks y rendimiento

Rendimiento medido por el autor en M3 MacBook Air (16 GB, macOS 27 build 26A428), medianas de tres ejecuciones tras calentamiento, audio PCM mono a 16 kHz precargado en bloques de 2,56 s. RTFx = duración de audio dividida por tiempo de proceso.

| Política | Entrada | Core AI | RTFx Core AI | FluidAudio | Aceleración |
|---|---|---:|---:|---:|---:|
| fast32 | 20 s | 0,101 s | 197,5× | 0,131 s | 1,30× |
| fast32 | 18 min 15 s | 5,445 s | 201,2× | 7,430 s | 1,36× |
| fast128 | 20 s | 0,038 s | 531,9× | 0,062 s | 1,65× |
| fast128 | 18 min 15 s | 2,103 s | 520,9× | 3,551 s | 1,69× |

Rendimiento medido en iPhone 15 Pro Max (iOS 27 build 24A437, runtime Release):

| Política | 20 s | RTFx | 18 min 15 s | RTFx |
|---|---:|---:|---:|---:|
| fast32 | 0,104 s | 192,7× | 5,532 s | 198,0× |
| fast128 | 0,041 s | 490,0× | 2,129 s | 514,4× |

No se han publicado resultados de benchmarks de calidad de diarización (DER, WER de atribución u otros) en la información disponible. Las cifras anteriores miden velocidad, no precisión.

## Requisitos de hardware

- Dispositivo físico Apple Silicon con macOS 27 o iOS 27, Core AI y un runtime anfitrión específico del modelo. No se ejecuta en CPU x86, GPU NVIDIA ni Android.
- Cada bundle ocupa aproximadamente 199,4 MB; el repositorio completo son 0,6 GB. No hay activos compilados AOT específicos de arquitectura.
- Footprint máximo registrado en iPhone: unos 290 MB (`fast32`) y 285 MB (`fast128`), incluyendo asignaciones imputadas a la app, sin memoria de driver ni sistema no atribuida.
- Preparación inicial observada: 24,45 s (`fast32`) y 26,20 s (`fast128`) en iPhone; preparaciones posteriores de 0,04 a 0,16 s. En Mac, los grafos equivalentes FP16 tardaron 23,99 s y 39,67 s en prepararse la primera vez; los activos distribuidos cargaron en 3,71 s y 3,69 s con cachés de driver ya presentes, y los lanzamientos en caché tardan típicamente de 0,02 a 0,08 s.
- Opciones de despliegue: exclusivamente Core AI con runtime Glade; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de audio de este tipo.
- No se dispone de medidas de consumo energético ni de latencia algorítmica en vivo; las tasas RTFx no las miden.

## Comparativa con modelos similares

| Modelo | Tipo | Hablantes solapados | Contexto por paso | Licencia | Plataforma |
|---|---|---|---|---|---|
| Nemotron 3 Diarization for Glade (esta ficha) | Diarización en streaming, Core AI | Hasta 8 | 2,56 s / 10,24 s | OpenMDW-1.1 | Apple Silicon (ANE) |
| nvidia/Nemotron-3-Diarization | Diarización en streaming, modelo fuente | Hasta 8 (según la conversión) | Configuración por defecto del procesador upstream (no detallada) | OpenMDW-1.1 | Multiplataforma |
| FluidInference/nemotron-3-diarization-coreml | Diarización, Core ML monolítico | No detallado | fast32 / fast128 monolíticos | no disponible | Apple Silicon (Core ML) |

Frente a FluidAudio/Core ML, esta conversión es entre 1,30× y 1,69× más rápida en M3 según los datos del autor. No se dispone de comparación de calidad (DER) con ninguno de los dos, ni de datos de otros modelos de diarización como pyannote o NeMo MSDD en la información proporcionada.

## Limitaciones y advertencias

- Conversión no avalada por NVIDIA; el autor lo declara explícitamente.
- No es un modelo autónomo: los grafos consumen características y estado, no ficheros de audio. El runtime anfitrión debe implementar el frontend FFT/log-mel, el apilado de características, la caché de hablantes en orden de llegada, la FIFO, el lookahead y el vaciado final.
- La geometría debe leerse de `metadata.json`, no inferirse de los nombres de fichero; una implementación incorrecta del contrato produce salidas inválidas.
- Dependencia estricta de macOS 27 / iOS 27 y Core AI, con dispositivo Apple Silicon físico; no hay ruta de ejecución en servidor ni en otras plataformas.
- Sin datos publicados de precisión (DER), sesgos demográficos o robustez ante ruido, acentos y solapamiento denso; no se puede evaluar la calidad de diarización solo con las cifras de velocidad.
- El límite de ocho hablantes solapados es una restricción del eje de salida; escenarios con más hablantes simultáneos requieren otra estrategia.
- El coste de primera preparación (decenas de segundos) puede ser problemático en arranques en frío de apps móviles.
- Las tasas RTFx no miden consumo energético ni latencia algorítmica en vivo; el buffering inicial de 2,88 s o 10,56 s condiciona la interactividad.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de uso comercial; no se detallan en la información disponible restricciones adicionales del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coder543/nemotron-3-diarization-glade
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio Core ML de referencia (FluidInference): https://huggingface.co/FluidInference/nemotron-3-diarization-coreml
- Revisión del modelo base citada: `f667ed73aee57d40cc39428eb768b4fd87a0a29e`
- Revisión de FluidAudio citada: `5c51c5c93afff0d89594a2a93c3103e790ba648c`
- Revisión del repositorio Core ML citada: `25a90f97f254428d4b30374b76af9c74fdee8327`
