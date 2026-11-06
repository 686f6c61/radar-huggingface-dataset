# gpillon/Nemotron-3-Diarization-GGUF-ignis

## Resumen

Nemotron-3-Diarization-GGUF-ignis es una conversion a formato GGUF del modelo nvidia/Nemotron-3-Diarization, un sistema de diarizacion de hablantes (speaker diarization) desarrollado originalmente por NVIDIA. La conversion la firma gpillon para integrarlo en ignis, un servidor de inferencia local compatible con la API de OpenAI. El modelo resuelve el problema de identificar quien habla en cada momento de una conversacion, de forma que una transcripcion en vivo pueda etiquetar cada intervencion como "Hablante 1", "Hablante 2", etc.

La arquitectura subyacente es un Streaming Sortformer, un transformer disenado para procesar audio de forma incremental con un estado de streaming persistente. El modelo es pequeno: 99.226.504 parametros (unos 99 millones), lo que permite ejecutarlo en CPU sin consumir VRAM y en paralelo al modelo de reconocimiento de voz. El repositorio ocupa 0.2 GB y contiene unicamente los pesos en F16.

Su relevancia actual radica en que ofrece diarizacion en tiempo real con latencia de 2.32 segundos en configuracion "live" y con un error de diarizacion (DER) medido del 3.57 % sobre conversaciones sinteticas en italiano, compitiendo con implementaciones como NeMo-Speech.cpp. La licencia es OpenMDW 1.1, heredada del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (transformer para diarizacion de hablantes en streaming) |
| Parametros totales | 99.226.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por chunks; geometria live de 2 s con look-ahead de 0.32 s; geometria file de 30.4 s) |
| Tipos de cuantizacion | F16 (pesos matmul), F32 (norms, biases y embedding de silencio); el autor menciona Q8_0 en sus propios kernels |
| Idiomas soportados | no disponible (el modelo es agnostico al idioma del audio; las pruebas se hicieron con italiano y con reuniones AMI en ingles) |
| Licencia | openmdw-1.1 (OpenMDW License Agreement v1.1) |
| Formato de pesos | GGUF (fichero Nemotron-3-Diarization-F16.gguf) |

## Arquitectura y entrenamiento

El modelo es un Streaming Sortformer, una variante de transformer pensada para diarizacion de hablantes en linea. Procesa el audio en chunks con un estado de streaming que se mantiene entre pasos, de modo que puede emitir probabilidades de hablante cada 10 ms sin necesidad de reprocesar todo el audio. La configuracion de streaming del checkpoint original (geometria live y geometria file) se escribe en los metadatos del GGUF durante la conversion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens de audio, ni sobre si hubo etapas de ajuste fino con RLHF o DPO; esos datos corresponden al modelo original de NVIDIA y no se detallan en la informacion proporcionada. La conversion realizada por gpillon no reentrena ni modifica pesos: convierte cada peso de matmul a F16, reordena los taps de la convolucion de upsampling y escribe la configuracion de streaming en los metadatos. El checkpoint de origen es nvidia/Nemotron-3-Diarization en la revision f667ed73aee57d40cc39428eb768b4fd87a0a29e, con sha256 c074d86335b3b794f8fa5edc25594558f128bdb3914d27806a3a5a2e44963cb6.

## Capacidades

- Diarizacion de hablantes en streaming: asigna un identificador de hablante a cada segmento de audio con resolucion temporal de 10 ms.
- Modo "live": procesa audio en chunks de 2 s con 0.32 s de look-ahead, con una latencia total de 2.32 s.
- Modo "file": procesa audio mas rapido que en tiempo real con la geometria offline del checkpoint (30.4 s).
- Deteccion de cambios de hablante: un cambio de hablante cierra la intervencion (utterance) en curso.
- Integracion con transcripcion: el hablante se entrega en el campo `ignis.input_audio_transcription.speaker` antes del evento `completed` de cada intervencion.
- Ejecucion en CPU: no consume VRAM, por lo que puede correr en paralelo al modelo de reconocimiento de voz en la misma maquina.
- Compatibilidad con la API de OpenAI a traves del servidor ignis (sesiones de transcripcion en tiempo real).
- Deteccion de actividad de voz (pipeline_tag: voice-activity-detection) como parte del proceso de diarizacion.

## Casos de uso

- Transcripcion de reuniones en vivo con etiquetas de hablante: ignis ejecuta este diarizador junto a un modelo ASR como Qwen3-ASR 1.7B y produce una transcripcion donde cada intervencion lleva el hablante asignado, con una desviacion medida de 3.6 s respecto al audio en la configuracion live.
- Actas y resumenes de reunion: al separar hablantes, un paso posterior puede generar resumenes por participante o extraer acuerdos y responsables de cada intervencion.
- Atencion al cliente y centros de llamadas: la diarizacion permite separar al agente del cliente en grabaciones y llamadas en tiempo real, habilitando analitica por rol sin enviar el audio a la nube.
- Subtitulado y accesibilidad: en retransmisiones o clases grabadas, el diarizador permite generar subtitulos que indican quien habla, mejorando la accesibilidad para personas con dificultades auditivas.
- Analisis forense y compliance de audio: en entornos donde el audio no puede salir de la maquina (sanidad, legal, banca), la ejecucion local en CPU permite procesar entrevistas y conservar la trazabilidad de quien dijo que.
- Investigacion en linguistica y ciencias sociales: procesamiento por lotes de corpus de entrevistas o conversaciones multi-hablante para segmentar por participante antes de analisis cualitativo o cuantitativo.
- Preprocesado para pipelines de ASR multi-hablante: separar las pistas por hablante antes de enviar cada segmento a un modelo ASR o a un sistema de traduccion, mejorando la coherencia de la transcripcion en conversaciones solapadas.
- Despliegue en dispositivos modestos: al ejecutarse en CPU con 3 hilos en un contenedor de 4 nucleos a 3.2x tiempo real, es viable en servidores pequenos o estaciones de trabajo sin GPU.

## Benchmarks y rendimiento

Diarization error rate (DER) con collar de 0.25 s, sobre veinte conversaciones sinteticas en italiano de 2 a 6 hablantes construidas a partir de VoxPopuli, con post-procesado de NeMo-Speech.cpp en ambos casos:

| Geometria | ignis, este fichero | NeMo-Speech.cpp (Q8_0) |
|---|---|---|
| live: chunk 2 s, look-ahead 0.32 s (2.32 s de latencia) | 3.57 % | 3.60 % |
| file: geometria offline de la model card (30.4 s) | 3.77 % | 3.56 % |

Notas adicionales del autor: F16 puntua igual que F32 (3.57 %); Q8_0 en los kernels de ignis obtuvo 4.15 %. La fidelidad numerica del port de ignis frente al codigo Transformers original (FP32, mismo estado de streaming) es de 6e-6 en cada probabilidad de hablante a 10 ms.

Rendimiento en la geometria live sobre una conversacion de 297 s:

| Entorno | Veces tiempo real | Uso de maquina |
|---|---|---|
| i9-10900K, 9 hilos | 6.4x (0.32 s por paso de 2 s) | no disponible |
| Contenedor de 4 nucleos, 3 hilos | 3.2x | 23 % de los cuatro nucleos |

En tres reuniones AMI (ingles, mezcla de auriculares) el error fue del 30 %, con la mitad del habla de una de ellas perdida; entre los hablantes detectados, la confusion fue del 2 %.

## Requisitos de hardware

- VRAM: 0 GB. El modelo se ejecuta integramente en CPU y no ocupa memoria de GPU.
- Memoria RAM: el repositorio pesa 0.2 GB; el fichero F16 cabe holgadamente en cualquier maquina moderna.
- CPU: probado en un i9-10900K con 9 hilos (6.4x tiempo real) y en un contenedor de 4 nucleos con 3 hilos (3.2x tiempo real, 23 % de uso).
- GPU: no requiere GPU; puede convivir con un modelo ASR en la misma GPU o ejecutarse en una maquina sin acelerador.
- Despliegue: mediante ignis-server (`ignis-server model download nemotron-3-diarization`), que carga el diarizador en la primera sesion que lo solicita y lo descarga junto con el modelo de voz. No se mencionan otros runtimes (llama.cpp, Ollama, vLLM, TGI) en la informacion disponible.
- Latencia: 2.32 s en modo live (chunk de 2 s mas look-ahead de 0.32 s); en modo file procesa mas rapido que en tiempo real.
- Throughput: 6.4x tiempo real en i9-10900K con 9 hilos; 3.2x en contenedor de 4 nucleos con 3 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / geometria | DER reportado | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nemotron-3-Diarization-GGUF-ignis (este) | 99.226.504 | Streaming Sortformer en CPU | live 2.32 s de latencia; file 30.4 s | 3.57 % live / 3.77 % file (italiano sintetico) | openmdw-1.1 | GGUF F16 |
| nvidia/Nemotron-3-Diarization (original) | 99.226.504 | Streaming Sortformer | misma configuracion de streaming | no disponible en la informacion | openmdw-1.1 | safetensors |
| NeMo-Speech.cpp (Q8_0) | no disponible | Implementacion C++ de diarizacion | misma geometria live/file | 3.60 % live / 3.56 % file | no disponible | Q8_0 |

No se dispone de datos de otros modelos de diarizacion comparables (por ejemplo, pyannote o variantes de NeMo) en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento degradado en audio real: en tres reuniones AMI en ingles el DER subio al 30 %, con la mitad del habla de una reunion perdida; el 3.57 % se midio sobre conversaciones sinteticas en italiano, por lo que no debe extrapolarse a dominios reales.
- Dependencia del post-procesado: las cifras de DER se obtuvieron segmentando las probabilidades con el post-procesado de NeMo-Speech.cpp; otros post-procesados pueden dar resultados distintos.
- Idioma: no se declaran idiomas soportados; las pruebas se limitan a italiano sintetico y a reuniones AMI en ingles. El rendimiento en otras lenguas o acentos no esta caracterizado.
- Licencia: OpenMDW 1.1, que impone obligaciones de atribucion y distribucion de la licencia; conviene revisar los terminos antes de uso comercial. El campo license de Hugging Face figura como "other" con license_name openmdw-1.1.
- Riesgo de confusion de hablantes: aunque la confusion entre hablantes detectados fue baja (2 % en AMI), el modelo puede perder habla (especialmente en audio con ruido o mezcla de auriculares) y asignar intervenciones al hablante equivocado en solapamientos.
- Dependencia de ignis: la integracion documentada es exclusivamente con el servidor ignis (a partir de v0.8.0); no se documentan otros runtimes, lo que limita la portabilidad.
- Modelo pequeno: con 99 millones de parametros, la capacidad de representacion es limitada frente a modelos de diarizacion mas grandes; no se han publicado comparativas con esos modelos.
- Riesgo de alucinacion de hablantes: como todo sistema de diarizacion, puede inventar un cambio de hablante en silencios o ruidos, aunque el modelo incluye un embedding de silencio especifico.
- Fecha de publicacion: el repositorio figura creado el 2026-10-26; verificar la vigencia de la revision fijada por el catalogo de ignis antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpillon/Nemotron-3-Diarization-GGUF-ignis
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Repositorio de ignis: https://github.com/gpillon/ignis
- Documentacion de ignis: https://gpillon.github.io/ignis/
- Issue de seguimiento de diarizacion (#361): https://github.com/gpillon/ignis/issues/361
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Fichero de sumas de verificacion: https://huggingface.co/gpillon/Nemotron-3-Diarization-GGUF-ignis/blob/main/SHA256SUMS
