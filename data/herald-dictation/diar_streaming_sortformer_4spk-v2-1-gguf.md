# herald-dictation/diar_streaming_sortformer_4spk-v2.1-gguf

## Resumen

Streaming Sortformer 4-Speaker v2.1 (GGUF) es la conversion al formato GGUF del modelo de diarizacion de hablantes en streaming desarrollado por NVIDIA, `nvidia/diar_streaming_sortformer_4spk-v2.1`. Lo publica el proyecto herald-dictation para su uso con transcribe.cpp, el runtime de inferencia del proyecto Herald, una aplicacion de dictado privado y offline. El modelo resuelve la segmentacion de audio en hablantes (quien habla y cuando) sobre flujos de audio, con capacidad de identificar hasta cuatro hablantes simultaneos sin necesidad de una fase previa de clustering offline.

El modelo original es un Sortformer, una arquitectura basada en transformer con atencion ordenada que produce directamente una matriz de actividad de hablantes, evitando los pipelines clasicos de diarizacion en dos fases (embedding + clustering). Con 117.711.368 parametros totales, es un modelo compacto que puede ejecutarse en CPU o GPU de gama consumer. La version publicada aqui es una cuantizacion Q8_0 de 139.310.336 bytes (unos 133 MB), lo que lo hace especialmente adecuado para despliegues en dispositivos con recursos limitados.

La relevancia actual del modelo radica en su capacidad de streaming: procesa audio de forma incremental y emite decisiones de diarizacion con baja latencia, algo critico para transcripcion en tiempo real, subtitulado en directo o asistentes de voz. Esta version GGUF esta pensada para integrarse en transcribe.cpp y en el ecosistema Herald, y es una copia byte a byte de la publicacion original de handy-computer, sin modificacion de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Sortformer (diarizacion en streaming, 4 hablantes) |
| Parametros totales | 117.711.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica incluida en este repo; otras en el repo original) |
| Idiomas soportados | en (ingles) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF (`diar_streaming_sortformer_4spk-v2.1-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo original, `nvidia/diar_streaming_sortformer_4spk-v2.1`, es un Sortformer: una arquitectura basada en transformer que aborda la diarizacion como una tarea de prediccion directa de actividad de hablantes. En lugar de generar embeddings de hablante y agruparlos posteriormente, el modelo produce directamente una matriz de probabilidades de actividad por hablante a lo largo del tiempo, lo que simplifica el pipeline y reduce la latencia. La variante "streaming" esta disenada para procesar audio de forma incremental, emitiendo decisiones a medida que llega el audio en lugar de esperar a tener la grabacion completa. Soporta hasta cuatro hablantes.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales mas alla de la propia formulacion Sortformer y su modo streaming. La version publicada en este repositorio es una cuantizacion Q8_0 realizada por handy-computer para transcribe.cpp, copiada byte a byte sin cambios en los pesos respecto a la publicacion original.

## Capacidades

- Diarizacion de hablantes en streaming: identifica y segmenta hasta cuatro hablantes en un flujo de audio continuo.
- Deteccion de actividad de voz (voice activity detection) integrada, segun el pipeline tag del modelo.
- Procesamiento incremental de audio, adecuado para aplicaciones en tiempo real.
- Salida de matriz de actividad de hablantes a lo largo del tiempo.
- Soporte de audio en ingles (unico idioma declarado).
- Integracion con transcribe.cpp y el ecosistema Herald para dictado offline.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la diarizacion.

## Casos de uso

- Dictado privado offline: Herald utiliza el modelo para separar la voz del usuario de otras voces en el entorno antes de transcribir, mejorando la precision en entornos con ruido de fondo o conversaciones paralelas.
- Transcripcion de reuniones: segmentar automaticamente las intervenciones de hasta cuatro participantes en una llamada o reunion grabada, generando actas atribuidas por hablante.
- Subtitulado en directo: la naturaleza streaming permite etiquetar quien habla en emisiones en vivo con baja latencia, util para subtitulos o transcripciones en tiempo real.
- Atencion al cliente: separar al agente del cliente en grabaciones de call center para analitica de conversaciones y control de calidad.
- Investigacion en diarizacion: modelo compacto (117 M parametros) y cuantizado en Q8_0 que puede ejecutarse en CPU, util como linea base reproducible en experimentos academicos.
- Despliegue en dispositivos edge: el tamano de 133 MB en Q8_0 permite ejecutar diarizacion en portatiles, mini-PC o dispositivos embebidos sin GPU dedicada.
- Preprocesado para pipelines ASR: etiquetar hablantes antes de pasar el audio a un sistema de reconocimiento de voz, de modo que cada transcripcion quede atribuida a su hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 139.310.336 bytes (unos 133 MB); la huella en memoria es del orden de unos cientos de MB incluyendo buffers de runtime.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) es sobradamente suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual e incluso en iGPU.
- Opciones de despliegue: transcribe.cpp (runtime objetivo declarado); el formato GGUF es compatible con el ecosistema llama.cpp, aunque la integracion concreta para este modelo no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| diar_streaming_sortformer_4spk-v2.1-gguf (este) | 117,7 M | no disponible | en | NVIDIA Open Model License | GGUF Q8_0 |
| nvidia/diar_streaming_sortformer_4spk-v2.1 | no disponible | no disponible | en | NVIDIA Open Model License | safetensors (original) |
| handy-computer/diar_streaming_sortformer_4spk-v2.1-gguf | 117,7 M | no disponible | en | NVIDIA Open Model License | GGUF (multiples cuantizaciones) |
| pyannote/speaker-diarization | no disponible | no disponible | multilingue | licencia propia | no disponible |

La comparacion con alternativas de diarizacion como pyannote no puede completarse con datos de rendimiento porque no se han publicado benchmarks en la informacion disponible. La principal diferencia de este repositorio respecto al original de NVIDIA es el formato GGUF y la cuantizacion Q8_0; respecto al repo de handy-computer, es una copia byte a byte del mismo fichero.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- Limite de cuatro hablantes simultaneos; no esta pensado para reuniones con mas participantes sin extension.
- No se documentan sesgos conocidos, pero al ser un modelo de audio puede degradarse con acentos, ruido o solapamientos de voz no representados en entrenamiento.
- Riesgo de alucinacion de hablantes: la asignacion de segmentos puede ser erronea en audio con solapamientos o voces similares.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; es necesario revisar el acuerdo y conservar el aviso "Licensed by NVIDIA Corporation under the NVIDIA Open Model License".
- El repositorio solo incluye la cuantizacion Q8_0; otras cuantizaciones estan en el repositorio original de handy-computer.
- No se documentan requisitos de contexto ni latencia, lo que dificulta planificar despliegues en produccion sin pruebas propias.
- El modelo esta pensado para transcribe.cpp; su uso con otros runtimes GGUF no esta garantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/herald-dictation/diar_streaming_sortformer_4spk-v2.1-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Repositorio de conversion original: https://huggingface.co/handy-computer/diar_streaming_sortformer_4spk-v2.1-gguf
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
