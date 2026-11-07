# erickvs/whisper-tiny.en-hand-edited

## Resumen

`erickvs/whisper-tiny.en-hand-edited` es una variante editada a mano de `openai/whisper-tiny.en`, el modelo de reconocimiento automatico del habla (ASR) de OpenAI presentado en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al.). No se ha reentrenado: solo se han modificado 3.845 de sus 37,8 millones de pesos para eliminar la tendencia del modelo original a transcribir palabras cuando el audio no contiene voz (silencio digital, ruido blanco, zumbidos, tonos, clics, musica instrumental o sonidos de sistema).

El problema que aborda es la alucinacion en ASR sobre audio no vocal: el modelo original, con decodificacion greedy, escribe casi siempre "you", y con la busqueda por haces del pipeline de Hugging Face tiende a repetir frases como "I'm going to do it." La version editada emite un unico "." en esos casos, manteniendo la precision sobre voz real practicamente intacta (WER identico en greedy, mejora marginal de 0,031 puntos en 5-beam). Es relevante porque demuestra que la edicion selectiva de pesos, sin reentrenamiento, puede corregir un fallo sistemico de un modelo de produccion con un coste de computo minimo.

El modelo conserva la arquitectura y el tamano del original (37,76 millones de parametros, contexto de audio de 30 segundos) y esta publicado con licencia Apache 2.0. Es un modelo solo para ingles, orientado a inferencia ligera y a entornos donde el coste de las alucinaciones sobre silencio sea critico (transcripcion de reuniones, subtitulado, grabaciones de vigilancia o pipelines de voz en produccion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con compresion convolucional del espectrograma Mel |
| Parametros totales | 37.760.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (configuracion estandar de Whisper) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` completo y `edit.safetensors` con los 9 tensores modificados) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny: un transformer encoder-decoder con atencion multi-cabeza, precedido de dos capas convolucionales que procesan el espectrograma Mel de 80 canales de una ventana de 30 segundos. El modelo base `openai/whisper-tiny.en` fue entrenado por OpenAI con supervision debil a gran escala sobre pares audio-transcripcion, y esta especializado en ingles. Esta variante no ha sido reentrenada ni afinada: el autor modifico manualmente 3.845 pesos distribuidos en 9 tensores.

La edicion aprovecha que el modelo original ya codifica internamente la distincion voz/no voz: en la primera posicion de decodificacion, su prediccion "no captions" separa perfectamente habla de no habla, pero esa senal no se usa para elegir la primera palabra (que se decide una posicion despues). El cambio traslada esa senal en tres pasos, disenados para ser exactamente cero sobre voz real: (1) deteccion, mediante dos unidades no usadas del MLP de la capa 2 del decoder (267 y 718) que forman un escalon suave sobre la direccion "no captions" y escriben una direccion marcadora tomada del embedding de posicion 447; (2) transporte, mediante el canal de valor 145 de la cabeza de atencion 2 de la capa 3 del decoder; (3) accion, mediante dos unidades no usadas del MLP de la capa 3 (1426 y 621) que elevan " ." y fin de texto y reducen " you" y " You". Como la configuracion de decodificacion de Whisper no permite terminar en el primer token, el modelo emite " ." y finaliza. El proceso completo se ejecuto en una sola laptop Apple M5 Max en 2 horas y 17 minutos, sin entrenamiento.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre ventanas de audio de hasta 30 segundos.
- Supresion de alucinaciones sobre audio no vocal: devuelve "." en lugar de palabras inventadas ante silencio digital, hiss, ruido blanco, rumble, zumbido de red, tonos, acordes, clics, musica instrumental y sonidos de alerta del sistema.
- Compatibilidad con decodificacion greedy (`model.generate()`) y con busqueda por haces de 5 (`pipeline()` por defecto).
- Soporte de modo timestamps (`return_timestamps=True`), con reduccion de palabras sobre no-voz del 49,1 % al 0 %.
- Integracion con la libreria `transformers` mediante `pipeline("automatic-speech-recognition")` y compatibilidad con endpoints.
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingue limitada al ingles (variante `.en`).

## Casos de uso

- Transcripcion de reuniones y llamadas: el modelo evita rellenar silencios, pausas largas o ruido de fondo con palabras inventadas, lo que reduce la necesidad de post-procesado y limpieza manual de transcripciones.
- Subtitulado automatico de video: al devolver "." en tramos sin voz, los subtitulos no muestran frases fantasma durante pausas, musica de fondo o efectos sonoros, y el modo timestamps permite alinear correctamente los segmentos.
- Pipelines de voz en produccion con deteccion de actividad: en sistemas que segmentan audio antes de transcribir, el modelo actua como red de seguridad cuando el VAD falla y envia fragmentos de silencio o ruido.
- Analisis de grabaciones de vigilancia o sensores: en audio ambiente con ruido constante (zumbidos, rumble, clics), el modelo no genera texto falso que contamine indices o busquedas.
- Procesamiento por lotes de archivos de audio heterogeneos: al mantener el WER sobre voz real y eliminar alucinaciones en no-voz, se puede transcribir un corpus completo sin filtrar manualmente los segmentos sin habla.
- Prototipado y evaluacion de ASR en local: con 37,8 millones de parametros cabe en hardware modesto y permite comparar el comportamiento original frente al editado en tareas de investigacion sobre alucinacion.
- Herramienta docente o de auditoria de modelos: sirve como ejemplo reproducible de edicion de pesos guiada por senales internas del propio modelo, sin reentrenamiento.

## Benchmarks y rendimiento

Datos sobre conjuntos de retencion no vistos por los editores. Un clip cuenta como alucinacion si su transcripcion contiene cualquier letra o digito.

| Decodificacion | Modelo | Clips no vocal con palabras | WER LibriSpeech test-clean |
|---|---|---|---|
| Greedy | Este modelo | 0,0 % de 4.000 | 6,375 % |
| Greedy | Original | 89,7 % | 6,375 % |
| 5-beam search | Este modelo | 0,0 % de 1.000 | 5,500 % |
| 5-beam search | Original | 23,0 % | 5,531 % |

Diferencias pareadas sobre las mismas 820 utterances, con intervalos bootstrap del 95 %: en greedy, WER +0,000 puntos (−0,037 a +0,032), con 10 de 820 transcripciones cambiadas (2 mejores y 3 peores); en 5-beam, WER −0,031 puntos (−0,068 a −0,006).

Sonidos no probados durante la edicion (592 clips: 200 bucles de musica instrumental, 14 sonidos de alerta de macOS en 3 posiciones y 350 clips de 7 tipos de ruido nuevos):

| Decodificacion | Original | Este modelo | Musica | Sonidos de alerta | Ruidos nuevos |
|---|---|---|---|---|---|
| Greedy | 97,3 % | 2,9 % | 1,5 % | 33 % | 0 % |
| 5-beam search | 65,9 % | 1,0 % | 1,0 % | 9,5 % | 0 % |

Voz mas dificil, con greedy: bajo ruido blanco a 10 dB SNR, atenuada 26 dB, tras 8 segundos de silencio y tras 5 segundos de hiss, todos los cambios de WER quedaron dentro de ±0,08 puntos; 2 de las 820 utterances atenuadas salieron como ".". En modo timestamps, las palabras sobre no-voz cayeron del 49,1 % al 0 % y el WER cambio −0,037 puntos. Sobre 1.620 utterances de retencion, el detector y el paso final fueron exactamente cero en las 41.984 posiciones de decodificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,8 millones de parametros, unos 151 MB de pesos) mas el coste de activaciones del encoder para ventanas de 30 segundos; no se publican mediciones especificas.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, Apple Silicon (M1 en adelante) y tambien en CPU para uso no interactivo. A100 y H100 son innecesarias salvo para lotes masivos.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de memoria.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, integracion con endpoints compatibles; el despliegue via vLLM, llama.cpp u Ollama no esta documentado para este modelo (Whisper no es un modelo de texto autoregresivo estandar y no se distribuyen pesos GGUF).
- Latencia y throughput: no disponibles; el autor solo reporta que la edicion uso 2 ejecuciones de prueba de unos 20 segundos cada una, no metricas de inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `erickvs/whisper-tiny.en-hand-edited` | 37,76 M | 30 s | en | Apache 2.0 | Edicion manual de pesos; 0 % de alucinacion en no-voz en los tests del autor |
| `openai/whisper-tiny.en` | 37,76 M | 30 s | en | Apache 2.0 | Modelo base; 89,7 % de clips no vocales con palabras en greedy |
| `openai/whisper-tiny` | 37,76 M | 30 s | multilingue | Apache 2.0 | Variante multilingue del mismo tamano; no editada |
| `eriwik/whisper-tiny-en` | no disponible | 30 s | en | no disponible | Fine-tuning de `whisper-tiny` sobre el dataset Minds 14; sin datos comparables de alucinacion |

No se dispone de resultados de benchmarks de `eriwik/whisper-tiny-en` en la informacion proporcionada, por lo que la comparacion de rendimiento con ese modelo no esta disponible.

## Limitaciones y advertencias

- Modelo solo para ingles: no transcribe otros idiomas.
- Ventana de audio limitada a 30 segundos por inferencia; audios mas largos requieren segmentacion externa.
- Riesgo residual de alucinacion: el autor reporta un 33 % de clips con palabras en greedy y un 9,5 % en 5-beam sobre los 14 sonidos de alerta de macOS, y un 1,5 % en musica instrumental con greedy.
- Falsos positivos en voz muy baja: 2 de las 820 utterances atenuadas 26 dB se transcribieron como ".", por lo que audio de voz extremadamente debil puede perderse.
- La edicion es manual y no auditada por terceros independientes del autor; el propio autor describe el proceso como no oficial.
- No se documentan sesgos especificos mas alla de los heredados del modelo base de OpenAI, entrenado con supervision debil a gran escala.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base conserva las condiciones de OpenAI; conviene revisar la model card original para obligaciones adicionales.
- No hay pesos cuantizados publicados ni soporte documentado en runtimes distintos de `transformers`.
- El modelo card promociona la herramienta WSP Lab del autor y contiene enlaces con parametros UTM; tratarlo como material promocional ademas de tecnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erickvs/whisper-tiny.en-hand-edited
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Paper de Whisper (Radford et al.): https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Modelo comparable `eriwik/whisper-tiny-en`: https://huggingface.co/eriwik/whisper-tiny-en
- WSP Lab (herramienta del autor): https://wsp-lab.ai/
