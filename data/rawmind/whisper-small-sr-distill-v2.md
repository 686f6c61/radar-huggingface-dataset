# rawmind/whisper-small-sr-distill-v2

## Resumen

whisper-small-sr-distill-v2 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por rawmind, obtenido mediante destilacion de Whisper large-v3-turbo hacia la arquitectura de Whisper small. Su objetivo es ofrecer transcripcion de alta calidad en serbio y croata manteniendo el coste computacional y el tamano de un modelo small, lo que lo hace apto para despliegue en CPU y en entornos con recursos limitados. El modelo parte de openai/whisper-small como base y anade un proceso de destilacion supervisado por el modelo grande, entrenado sobre voz leida (FLEURS) y voz parlamentaria real (ParlaSpeech-RS y ParlaSpeech-HR).

Con 241.734.912 parametros, el modelo conserva la arquitectura encoder-decoder transformer de Whisper y la misma velocidad que Whisper small, pero mejora de forma sustancial el rendimiento en serbio y croata respecto a su version anterior (v1) y se acerca a large-v3-turbo en determinados escenarios, especialmente cuando se acorta el contexto de audio. En la variante cuantizada q8_0 ocupa 264 MB, lo que permite ejecutarlo en hardware modesto.

Es relevante ahora porque cubre un hueco practico: la transcripcion de dos idiomas eslavos del sur con pocos recursos de ASR de calidad, a un coste de inferencia muy inferior al de los modelos grandes, con soporte nativo en whisper.cpp y pesos en safetensors para transformers. La contrapartida principal es que la deteccion automatica de idioma es inservible y debe fijarse manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), destilado de large-v3-turbo |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper small, 30 s por defecto) |
| Tipos de cuantizacion | f16 (GGML, 488 MB) y q8_0 (GGML, 264 MB); pesos transformers en safetensors |
| Idiomas soportados | serbio (sr), croata (hr), ingles (en) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (transformers) y GGML/GGUF para whisper.cpp |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Whisper small: un transformer encoder-decoder con atencion completa, disenado para transcripcion de audio de hasta 30 segundos por ventana. La innovacion no esta en la arquitectura sino en el procedimiento de destilacion: un modelo profesor (Whisper large-v3-turbo) supervisa el entrenamiento del modelo alumno sobre transcripciones humanas, de modo que el small aprende a aproximar el comportamiento del grande en serbio y croata sin aumentar su tamano.

Los datos de entrenamiento suman 22.885 clips iniciales: FLEURS serbio (2.944), croata (377) e ingles (394), mas 15.248 clips serbios de ParlaSpeech-RS y 3.922 croatas de ParlaSpeech-HR. Se descarto el diez por ciento de los clips parlamentarios con menor probabilidad segun el profesor dado su transcript (1.917 clips, para eliminar transcripciones mal alineadas con el audio), quedando 20.968 clips efectivos. No se incluyeron frases de test de FLEURS ni hablantes, fechas o frases de test de los corpus parlamentarios. Las transcripciones serbias se convirtieron a alfabeto latino. No se detalla en la informacion disponible si hubo fases de RLHF o DPO; el metodo descrito es destilacion supervisada.

## Capacidades

- Transcripcion de voz a texto en serbio y croata, con buen rendimiento tanto en voz leida limpia como en voz parlamentaria real.
- Transcripcion en ingles con calidad ligeramente inferior a Whisper small (8,3 % de WER frente a 7,0 % en 100 clips de FLEURS).
- Robustez moderada frente a ruido: evaluado con ruido rosa artificial a 10 dB y 5 dB de SNR.
- Soporte de contexto de audio acortado (`audio_ctx` en whisper.cpp), que acelera clips cortos en maquinas lentas y ademas mejora la precision en varios tests.
- Compatibilidad con whisper.cpp 1.9.6 o superior, incluyendo `whisper-cli` y `whisper-server`.
- Integracion con deteccion de voz (VAD) mediante Silero en whisper.cpp (`--vad`), necesaria para evitar transcripciones sobre silencio.
- Pesos en safetensors para uso con transformers y pesos GGML para whisper.cpp.
- No dispone de tool calling, capacidades de agente, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de actas parlamentarias y debates: el modelo se entreno con corpus parlamentarios (ParlaSpeech-RS y ParlaSpeech-HR) y obtiene 10,3 % de WER en serbio y 15,9 % en croata en voz parlamentaria real, por lo que es adecuado para digitalizar y buscar intervenciones en grabaciones oficiales.
- Subtitulado de contenido audiovisual en serbio y croata: con q8_0 (264 MB) y 253 ms por clip en una M4 Max, puede procesar lotes de clips cortos en CPU para generar subtitulos en pipelines automatizados.
- Servicios de transcripcion en produccion con presupuesto de hardware ajustado: al tener el mismo tamano y velocidad que Whisper small, cabe en servidores sin GPU dedicada y reduce coste frente a large-v3-turbo, que es aproximadamente 2,3 veces mas lento.
- Investigacion en ASR de lenguas eslavas del sur: sirve como linea base destilada para comparar tecnicas de destilacion y para experimentar con datos de FLEURS y ParlaSpeech.
- Archivado y busqueda de grabaciones de reuniones o entrevistas: combinado con VAD de Silero para segmentar el audio y evitar alucinaciones sobre silencio, permite transcribir conversaciones largas por ventanas de 30 segundos.
- Aplicaciones de accesibilidad en tiempo casi real en CPU: el bajo coste por clip y la cuantizacion q8_0 (dentro de 0,6 puntos de f16 en todos los tests) permiten desplegar transcripcion en dispositivos de gama media.
- Prototipado rapido en whisper.cpp: la disponibilidad de binarios f16 y q8_0 y la compatibilidad con `whisper-server` facilitan montar una API de transcripcion local sin infraestructura de GPU.

## Benchmarks y rendimiento

Resultados de WER en % (menor es mejor), medidos con whisper.cpp 1.9.6 compilado desde fuente sobre Metal, con intervalo bootstrap del 95 % sobre clips.

| Test serbio | Clips | v2 | v1 | large-v3-turbo |
|---|---|---|---|---|
| FLEURS, voz leida limpia | 400 | 17,4 (16,3-18,5) | 24,6 (23,2-25,9) | 13,2 (12,4-14,2) |
| Parlamento, voz real | 150 | 10,3 (9,0-11,9) | 22,1 (20,2-24,0) | 10,1 (8,8-11,5) |
| FLEURS + ruido rosa 10 dB | 100 | 22,2 (19,6-24,8) | 29,1 (26,6-31,8) | 16,9 (14,9-19,0) |
| FLEURS + ruido rosa 5 dB | 100 | 28,5 (25,5-31,3) | 36,3 (33,2-39,4) | 19,9 (17,7-22,2) |
| FLEURS, contexto acortado | 100 | 16,4 (14,4-18,5) | 27,9 (24,4-32,2) | 22,1 (16,7-28,2) |
| Parlamento, contexto acortado | 100 | 11,3 (9,6-13,3) | 22,4 (20,0-25,0) | 15,9 (12,9-19,7) |

| Test croata | Clips | v2 | v1 | large-v3-turbo |
|---|---|---|---|---|
| FLEURS, voz leida limpia | 400 | 17,9 (16,8-19,1) | 24,3 (23,0-25,7) | 11,4 (10,4-12,4) |
| Parlamento, voz real | 150 | 15,9 (14,1-17,8) | 29,6 (27,1-31,8) | 13,6 (11,9-15,4) |
| FLEURS + ruido rosa 10 dB | 100 | 29,6 (26,6-32,4) | 37,9 (35,3-40,7) | 17,7 (15,4-19,9) |
| FLEURS + ruido rosa 5 dB | 100 | 47,3 (43,8-51,0) | 52,6 (49,2-56,1) | 29,9 (26,9-33,1) |
| FLEURS, contexto acortado | 100 | 18,1 (15,9-20,3) | 25,8 (23,0-28,9) | 16,7 (12,5-21,3) |
| Parlamento, contexto acortado | 100 | 15,4 (13,1-17,7) | 30,0 (27,2-32,9) | 17,4 (14,3-20,7) |

En comparacion clip a clip, v2 supera a v1 en los seis tests serbios por 6,9 a 11,8 puntos y en los seis croatas por 5,4 a 14,6 puntos. Frente a large-v3-turbo, queda por detras en FLEURS limpio y ruidoso, empata en parlamento serbio (+0,2, IC 95 % -0,9 a +1,3) y va por delante con contexto acortado (-5,8 en FLEURS y -4,6 en parlamento serbio). En croata, turbo sigue por delante salvo con contexto acortado, donde ambos empatan. El autor advierte que las puntuaciones parlamentarias son optimistas porque los clips de test comparten vocabulario, acustica y estilo con los de entrenamiento. En ingles, v2 obtiene 8,3 % frente a 7,5 % de v1 y 7,0 % de Whisper small en 100 clips de FLEURS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano (241,7 M de parametros), f16 requiere aproximadamente 0,5 GB de pesos y q8_0 unos 264 MB, mas el overhead de activaciones y audio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el autor midio en una M4 Max (GPU) con Metal. No se especifican modelos de GPU dedicadas concretas.
- Cabe en GPU de consumo: si, dado su tamano; es apto para tarjetas de gama baja y para ejecucion en CPU.
- Opciones de despliegue: whisper.cpp (recomendado, version 1.9.6 o superior) con `whisper-cli` o `whisper-server`; transformers con los pesos safetensors. No se documenta soporte de vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 253 ms por clip en una M4 Max GPU, frente a 262 ms de v1 y aproximadamente 2,3 veces mas rapido que large-v3-turbo. En v1, q8_0 fue 2,6 veces mas rapido que f16 en CPU de M4 Max y uso 443-497 MB de memoria frente a 653 MB; v2 comparte arquitectura. El rendimiento en Intel y AMD no se ha probado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER serbio (FLEURS) | WER croata (FLEURS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-small-sr-distill-v2 | 241,7 M | sr, hr, en | 17,4 | 17,9 | cc-by-sa-4.0 | Hugging Face (safetensors y GGML) |
| whisper-small-sr-distill (v1) | 241,7 M | sr, hr, en | 24,6 | 24,3 | no disponible en la informacion | Hugging Face |
| openai/whisper-small | 241,7 M | multilingue | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en la informacion | multilingue | 13,2 | 11,4 | no disponible en la informacion | Hugging Face |

La comparativa se limita a los modelos evaluados por el autor en su model card. Whisper small no tiene resultados publicados en serbio y croata en esta informacion, y large-v3-turbo es sustancialmente mayor y mas lento (2,3 veces), por lo que la ventaja de v2 esta en la relacion calidad/tamano y en el contexto acortado.

## Limitaciones y advertencias

- La deteccion automatica de idioma es inservible: en 50 clips por idioma respondio ingles para 41 clips serbios y 33 croatas, y serbio para ninguno. Es obligatorio pasar el idioma manualmente (`-l sr` o `-l hr`).
- Escribe texto sobre silencio: en cinco clips sin habla (silencio digital y ruido) genero texto en ambos idiomas, incluyendo caracteres sueltos o galimatias con mezcla de alfabetos. Usar deteccion de voz (por ejemplo, `--vad` con Silero).
- El ingles es ligeramente peor que en v1 y que en Whisper small (8,3 % frente a 7,5 % y 7,0 %).
- Otros idiomas no estan evaluados y probablemente rindan peor que Whisper small.
- No se ha probado con musica, video ni varias personas hablando a la vez; las pruebas de ruido usan ruido rosa artificial.
- El serbio se escribe en alfabeto latino; las transcripciones de entrenamiento se convirtieron a latin.
- Las puntuaciones parlamentarias son optimistas por compartir dominio con el entrenamiento; conviene validar con audio propio.
- Las transcripciones parlamentarias son registros oficiales y no siempre literales, por lo que deben compararse modelos entre si y no leer los totales como absolutos.
- Requiere whisper.cpp 1.9.6 o superior: con 1.9.5 y contexto acortado se producian entre 2,8 y 4,1 errores mas por cada 100 palabras.
- Licencia cc-by-sa-4.0: impone atribucion y compartir igual, lo que puede condicionar el uso comercial y la distribucion de obras derivadas.
- Riesgo de alucinacion en audio sin habla o de baja calidad; no se documentan sesgos especificos mas alla del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rawmind/whisper-small-sr-distill-v2
- Version anterior (v1): https://huggingface.co/rawmind/whisper-small-sr-distill
- Codigo de entrenamiento y resultados: https://github.com/rawmind/whisper-distill-sr
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset ParlaSpeech-RS: https://huggingface.co/datasets/classla/ParlaSpeech-RS
- Dataset ParlaSpeech-HR: https://huggingface.co/datasets/classla/ParlaSpeech-HR
- VAD Silero para whisper.cpp: https://huggingface.co/ggml-org/whisper-vad
