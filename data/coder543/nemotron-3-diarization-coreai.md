# coder543/nemotron-3-diarization-coreai

## Resumen

Nemotron 3 Diarization — Core AI es una conversion a FP16 del modelo de diarizacion de hablantes NVIDIA Nemotron 3 Diarization, empaquetada para el runtime Apple Core AI y ejecutable sobre el Neural Engine de dispositivos con silicio de Apple. La publica el usuario `coder543` a partir de la revision fuente `f667ed73aee57d40cc39428eb768b4fd87a0a29e` del checkpoint de NVIDIA, bajo licencia OpenMDW-1.1, y no cuenta con el aval de NVIDIA. El modelo base tiene 99,2 millones de parametros y es un Sortformer en streaming; esta conversion no altera la red, solo la exporta como grafos `.aimodel` y traslada al host toda la gestion de estado.

El problema que resuelve es la diarizacion ("quien habla cuando") en dispositivo, con soporte de hasta ocho hablantes solapados y resolucion temporal de 10 ms. Frente a alternativas en la nube, la conversion mantiene las identidades de hablante entre fragmentos en streaming y evita enviar audio fuera del dispositivo, algo relevante para aplicaciones de transcripcion y actas en movil. Se distribuyen dos perfiles explicitos: `fast32` (en vivo, 2,56 s de audio nuevo por paso) y `fast128` (resultado final, 10,24 s por paso), cada uno de aproximadamente 199,4 MB.

La relevancia actual viene de su rendimiento medido: en un MacBook Air M3 con 16 GB alcanza RTFx de 197,5x a 531,9x (audio procesado por segundo de computo) con colocacion verificada en el Neural Engine. El repositorio completo ocupa 0,4 GB y contiene assets sin compilacion anticipada especifica de arquitectura, por lo que requiere Core AI mas un runtime anfitrion especifico del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer en streaming (transformer de diarizacion) exportado como grafos Apple Core AI |
| Parametros totales | 99,2 millones (modelo base `nvidia/Nemotron-3-Diarization`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en tokens; ventana de audio gestionada por el host. `fast32`: 352 posiciones de encoder y 2,56 s de audio nuevo por paso; `fast128`: 448 posiciones y 10,24 s por paso. Cada posicion de encoder equivale a 80 ms |
| Tipos de cuantizacion | FP16 (grafos `.aimodel`) |
| Idiomas soportados | No disponible (no declarados en la informacion proporcionada) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Assets Apple Core AI (`.aimodel`); acompanados de `metadata.json`, `mel-filter.f32`, `window.f32` y `silence.f32` |
| Tamano del repositorio | 0,4 GB (cada bundle ~199,4 MB) |
| Resolucion de diarizacion | 10 ms |
| Hablantes maximos | 8 (con solapamiento) |

## Arquitectura y entrenamiento

El modelo base es un Sortformer en streaming, una arquitectura de diarizacion que asigna canales de salida a hablantes y resuelve la permutacion ordenando dichos canales segun la primera llegada de cada hablante en el audio de entrada. La conversion a Core AI no modifica la red: exporta la red por fragmentos como dos grafos. `embedding.aimodel` transforma caracteristicas apiladas de forma `[1,1024,1,chunk_frames+4]` en embeddings ocultos `[1,512,1,chunk_frames+4]`; `encoder.aimodel` recibe embeddings de entrada `[1,512,1,encoder_capacity]` mas una mascara de prefijo valido `[1,1,1,encoder_capacity]` y devuelve logits `[1,8,8,encoder_capacity]`, donde las dos ultimas ejes son subframes y posiciones de encoder. Los grafos conservan la atencion bidireccional completa y no truncan el contexto ni descartan audio.

El entrenamiento original lo realizo NVIDIA; esta ficha no dispone de datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La innovacion de la conversion es la especializacion para el Neural Engine: separa la red en grafos autocontenidos y deja al host la responsabilidad del frontend FFT/log-mel, el apilado de caracteristicas (proyeccion de 8 frames), la cache de hablantes por orden de llegada (AOSC), la FIFO, el lookahead de 0,32 s y el volcado final. La geometria debe leerse desde `metadata.json` y no inferirse de los nombres de fichero. Los dos perfiles difieren en capacidad de encoder y audio nuevo por paso: `fast32` usa 352 posiciones y actualiza la cache de hablantes cada 40 posiciones, mientras que `fast128` usa 448 posiciones con la misma cadencia de actualizacion. El buffer inicial es de aproximadamente 2,88 s (`fast32`) y 10,56 s (`fast128`). Se documentan verificaciones numericas frente al checkpoint FP32 original via Transformers revision `07338b6c74a578868368e6e549dea83414e4b8cb`.

## Capacidades

- Diarizacion de hablantes ("quien habla cuando") con resolucion de 10 ms y hasta ocho hablantes solapados.
- Inferencia en streaming con preservacion de identidades de hablante entre pasos, mediante cache de hablantes por orden de llegada.
- Inferencia offline o de archivo completo, con volcado final controlado por el runtime.
- Ejecucion integra en dispositivo sobre el Neural Engine de Apple, sin enviar audio a la nube.
- Dos politicas de latencia/rendimiento configurables (`fast32` en vivo, `fast128` para resultado final).
- Deteccion de voz/actividad asociada al pipeline declarado (`voice-activity-detection`).
- No es un modelo de reconocimiento de voz: consume caracteristicas y estado, no ficheros de audio, y produce probabilidades por hablante y frame (logits con sigmoide independiente).
- Soporte de tool calling / function calling: no aplica.
- Capacidades de agentes, razonamiento multi-paso, vision, audio generativo o modo "thinking": no disponibles o no aplicables.

## Casos de uso

- Actas de reunion en el propio dispositivo: el modelo segmenta quien habla a lo largo de una reunion con hasta ocho participantes y mantiene las identidades en streaming, evitando subir el audio a servidores externos.
- Transcripcion con etiquetado de hablante en movil: combinado con un motor ASR local, permite generar transcripciones atribuidas a cada persona sin salir del dispositivo, util para entornos con requisitos de privacidad.
- Diarizacion por lotes de archivos largos: el perfil `fast128` procesa grabaciones completas con RTFx superior a 500x en un M3, adecuado para indexar archivos de audio de forma masiva.
- Analisis de reuniones y entrevistas: la salida a 10 ms permite medir turnos de palabra, solapamientos y tiempos de intervencion, util para analitica de conversaciones.
- Cumplimiento y auditoria de llamadas: detectar cuantas voces intervienen y cuando, en escenarios de atencion al cliente donde se debe verificar el consentimiento o la presencia de terceros.
- Subtitulado con etiquetas de hablante en edicion de video: integrar la diarizacion en un pipeline de postproduccion para separar pistas o etiquetar dialogos automaticamente.
- Investigacion en procesamiento de audio: servir de referencia para estudiar el ajuste de perfiles de latencia (lookahead, capacidad de encoder, cadencia de cache) sobre el mismo modelo base.
- Interfaces en tiempo real: con `fast32` y su buffer inicial de 2,88 s, habilitar atribucion de hablante casi en vivo en aplicaciones de asistencia o captura continua.

## Benchmarks y rendimiento

Rendimiento medido en un MacBook Air M3 con 16 GB, macOS 27 build 26A428, medianas de tres ejecuciones tras calentamiento, con PCM mono a 16 kHz precargado y bloques de 2,56 s sin pausas de tiempo real. Se incluye frontend, ejecucion de grafos, actualizacion de cache de hablantes y entrega de probabilidades; se excluyen preparacion y E/S de fichero. Entrada: discurso "We choose to go to the Moon" de JFK, en extracto de 20 s y grabacion completa de 18 min 15 s. RTFx es duracion de audio dividida por tiempo de proceso (mas alto es mas rapido).

| Politica | Entrada | Core AI (s) | RTFx Core AI | FluidAudio (s) | Aceleracion |
|---|---|---|---|---|---|
| fast32 | 20 s | 0,101 | 197,5x | 0,131 | 1,30x |
| fast32 | 18 min 15 s | 5,445 | 201,2x | 7,430 | 1,36x |
| fast128 | 20 s | 0,038 | 531,9x | 0,062 | 1,65x |
| fast128 | 18 min 15 s | 2,103 | 520,9x | 3,551 | 1,69x |

La linea base FluidAudio usa su API publica sin cambios, modelos monoliticos fast32/fast128 y todas las unidades de computo de Core ML (dependencia `5c51c5c93afff0d89594a2a93c3103e790ba648c`; repositorio `FluidInference/nemotron-3-diarization-coreml`, revision `25a90f97f254428d4b30374b76af9c74fdee8327`). La salida nativa/fuente produce 109.531 frames validos en la grabacion completa; FluidAudio emite dos frames de cola extra. Estos ritmos no miden consumo energetico ni latencia algor␣tmica en vivo.

Verificacion numerica: el oraculo independiente es el checkpoint FP32 original via Transformers. El grafo FP32 de autoria concuerda dentro de 0,000001 RMS relativo y los fixtures de logits FP16 congelados estan dentro del 0,06-0,21% RMS relativo. Desacuerdo hablante/frame umbralizado frente a FP32, relativo a la union de decisiones activas con umbral 0,5:

| Politica | Discurso Moon completo | Fixture multihablante 97,6 s |
|---|---|---|
| fast32 | 1,32% | 0,085% |
| fast128 | 0,198% | 0,105% |

El fixture multihablante es `diarization_example.mp3` de `hf-internal-testing/dummy-audio-samples`. Ambas politicas preservan los recuentos de slots de hablante activos de su fuente. La grabacion completa con fast32 aun presenta 36 cruces de umbral en un segundo slot donde FP32 no tiene ninguno.

## Requisitos de hardware

- Plataforma obligatoria: dispositivo fisico con silicio de Apple, macOS 27 o iOS 27, runtime Core AI y un host especifico del modelo. No hay assets compilados anticipadamente para arquitecturas concretas.
- Memoria: en la prueba de fichero completo, el endpoint cliente mas memoria neuronal atribuida fue de aproximadamente 442 MB (fast32) y 436 MB (fast128), PCM precargado incluido; no es memoria de pico del sistema.
- Cabe en hardware de consumo Apple: el rendimiento medido es sobre un MacBook Air M3 con 16 GB. El autor indica que el rendimiento y la colocacion en telefono se reportaran tras validacion en dispositivo fisico.
- Colocacion en Neural Engine: trazas en un prefijo de 60 s muestran las 24 actualizaciones de fast32 y las 6 de fast128 conteniendo las dos predicciones ANE esperadas, sin intervalos de GPU para el proceso objetivo. Esto establece colocacion ANE, no ocupacion de ALU.
- Carga de grafos: primeras preparaciones de grafos equivalentes FP16 de autoria tardaron 23,99 s (fast32) y 39,67 s (fast128); los assets distribuidos, tras eliminar informacion de depuracion, cargaron en 3,71 s y 3,69 s con caches de driver presentes. Lanzamientos en cache: 0,02-0,08 s. No son mediciones controladas de compilacion en instalacion limpia.
- Opciones de despliegue: exclusivamente Core AI sobre silicio de Apple con runtime anfitrion propio. No se documentan soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- VRAM: no aplica en el sentido de GPU discreta; el consumo se expresa como memoria atribuida al proceso en Apple Silicon (ver cifras arriba).
- Throughput: ver tabla de benchmarks (RTFx de 197,5x a 531,9x). La latencia en vivo no se mide; el perfil `fast32` introduce un buffer inicial de aproximadamente 2,88 s y ambos perfiles aplican 0,32 s de lookahead.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `coder543/nemotron-3-diarization-coreai` (esta ficha) | 99,2 M (base) | Audio por pasos: 2,56 s / 10,24 s; 8 hablantes; 10 ms | RTFx 197,5x-531,9x en M3 (Core AI) | OpenMDW-1.1 | HF, requiere Core AI y runtime anfitrion |
| `nvidia/Nemotron-3-Diarization` (base) | 99,2 M | Streaming y offline; 8 hablantes; 10 ms | Fuente FP32 de referencia; sin tabla propia en esta informacion | OpenMDW-1.1 | HF (NVIDIA) |
| `FluidInference/nemotron-3-diarization-coreml` (FluidAudio) | No disponible | Modelos monoliticos fast32/fast128 | 1,30x-1,69x mas lento que esta conversion en las mismas pruebas | No disponible en la informacion | HF (FluidInference) |

Existen otras conversiones Core AI del mismo modelo base publicadas por terceros (`coreai-community/Nemotron-3-Diarization-CoreAI`, `mlboydaisuke/Nemotron-3-Diarization-CoreAI`), pero no se dispone de sus datos de rendimiento para comparar.

## Limitaciones y advertencias

- La conversion no esta avalada por NVIDIA; es un trabajo de un tercero (`coder543`) sobre el checkpoint `nvidia/Nemotron-3-Diarization`.
- Requiere hardware y software muy especificos: dispositivo fisico con silicio de Apple, macOS 27 o iOS 27, Core AI y un runtime anfitrion especifico del modelo. No es portable a otras plataformas.
- Los grafos consumen caracteristicas y estado, no ficheros de audio. El host debe implementar el frontend FFT/log-mel de origen, el apilado de caracteristicas, la cache de hablantes por orden de llegada, la FIFO, el lookahead y el volcado final; sin eso el modelo no es utilizable.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existen discrepancias umbralizadas frente al FP32 original (hasta 1,32% en el discurso Moon con fast32 y 36 cruces de umbral espurios en un segundo slot en la grabacion completa). En entornos con requisitos estrictos de precision conviene validar con audio propio.
- El numero maximo de hablantes es 8; los escenarios con mas voces solapadas quedan fuera de su alcance.
- El rendimiento en telefono no estaba validado en el momento de publicar la informacion; las cifras corresponden a un MacBook Air M3.
- Los ritmos de proceso publicados no miden consumo energetico ni latencia algor␣tmica en vivo, por lo que no deben usarse como promesa de latencia de producto.
- Idiomas soportados no declarados; no se puede confirmar comportamiento multilingue a partir de la informacion disponible.
- La model card proporcionada aparece truncada en la seccion de verificaciones numericas, por lo que puede haber contenido adicional no recogido aqui.
- Licencia OpenMDW-1.1: conviene revisar sus terminos (ficheros LICENSE y NOTICE del repositorio) antes de uso comercial.

## Enlaces

- Pagina del modelo: https://huggingface.co/coder543/nemotron-3-diarization-coreai
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Revision fuente del checkpoint: `f667ed73aee57d40cc39428eb768b4fd87a0a29e`
- Revision de Transformers usada como oraculo FP32: `07338b6c74a578868368e6e549dea83414e4b8cb`
- Core AI Model Zoo (modelo `nemotron-3-diarization`): https://github.com/john-rocky/coreai-model-zoo/tree/main/models/nemotron-3-diarization
- README del model zoo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/nemotron-3-diarization/README.md
- Conversion Core ML de referencia (FluidAudio): https://huggingface.co/FluidInference/nemotron-3-diarization-coreml (revision `25a90f97f254428d4b30374b76af9c74fdee8327`, dependencia `5c51c5c93afff0d89594a2a93c3103e790ba648c`)
- Otras conversiones Core AI del mismo base: https://huggingface.co/coreai-community/Nemotron-3-Diarization-CoreAI y https://huggingface.co/mlboydaisuke/Nemotron-3-Diarization-CoreAI
- Ficha del modelo base en Dell Enterprise Hub: https://dell.huggingface.co/models/nvidia/Nemotron-3-Diarization
- Fixture multihablante de prueba: `hf-internal-testing/dummy-audio-samples` (`diarization_example.mp3`)
