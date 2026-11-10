# coder543/nemotron-3.5-asr-streaming-0.6b-glade

## Resumen

Nemotron 3.5 ASR Streaming 0.6B Glade es una conversión de los pesos oficiales de NVIDIA (`nvidia/nemotron-3.5-asr-streaming-0.6b`) a un formato de assets nativos para Apple Core AI, orientado a la Neural Engine (ANE) de dispositivos con silicio de Apple. El autor de la conversión es `coder543`, y el resultado no es un modelo Core ML ni un binario precompilado, sino un conjunto de grafos `.aimodel` que el host debe orquestar y especializar en el dispositivo.

El modelo resuelve reconocimiento automático del habla (ASR) en streaming: cada actualización consume 1,12 segundos de audio mono a 16 kHz y mantiene el estado de atención, convolución, subsampling y decodificador recurrente entre actualizaciones. Es relevante porque demuestra que un ASR multilingüe de 0,6B parámetros puede ejecutarse íntegramente en la ANE de un MacBook Air M3 o un iPhone 15 Pro Max con latencias muy bajas (RTFx de 64,1× en Mac y 50,3× en iPhone para una grabación de 18 minutos).

La conversión conserva la configuración oficial de Transformers con 56 posiciones de historial (frente a las 42 del bundle FluidAudio) y está pensada para macOS 27 e iOS 27. El bundle incluye un encoder W8A16 orientado a ANE, subsampling causal FP16, predictor recurrente FP16, grafos de vocabulario y coeficientes de frontend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder ASR en streaming con subsampling causal, predictor recurrente y decodificación greedy; grafos orientados a Apple Neural Engine |
| Parametros totales | 0,6B (según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 56 posiciones de historial (past positions) en la configuración de Transformers |
| Tipos de cuantizacion | Encoder W8A16; subsampling, predictor y vocabulario en FP16 |
| Idiomas soportados | ar, bg, cs, da, de, en, es, et, fi, fr, hi, hr, hu, it, ja, ko, nb, nl, pl, pt, ro, ru, sk, sv, tr, uk, vi, zh |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | Assets `.aimodel` para Apple Core AI (no safetensors ni GGUF) |
| Tamano del repo | 0,7 GB |
| Ventana de audio por actualización | 1,12 s de audio mono a 16 kHz |
| Plataformas objetivo | macOS 27, iOS 27, silicio de Apple físico |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo ASR encoder-decoder en streaming de NVIDIA, del que esta conversión preserva la configuración oficial de Transformers. El bundle separa el pipeline en varios grafos: un encoder orientado a ANE cuantizado en W8A16, un módulo de subsampling causal en FP16, un predictor recurrente en FP16, grafos de vocabulario y los coeficientes del frontend. La atención, la convolución, el subsampling y el estado del decodificador recurrente persisten entre actualizaciones sucesivas, lo que permite transcripción continua sin reiniciar el contexto acústico.

El decodificado es greedy y recurrente, ejecutado por el host con los datos proporcionados. El modelo base fue entrenado por NVIDIA; esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable de esta conversión es la colocación de todos los grafos en la ANE: una traza de la grabación completa registró 8.442 predicciones ANE en 8.442 llamadas a grafo (979 de encoder, 979 de subsampling, 5.506 de paso de predictor y 978 de joint standalone), sin intervalos de GPU en el proceso objetivo.

## Capacidades

- Reconocimiento automático del habla en streaming con estado persistente entre actualizaciones de 1,12 s.
- Transcripción multilingüe en 28 idiomas, con prompts de idioma automáticos o explícitos.
- Entrega de transcripciones parciales durante la captura y volcado final al cerrar el flujo.
- Ejecución íntegra en Apple Neural Engine, con el trabajo de orquestación y frontend en CPU.
- Decodificación greedy recurrente sobre los grafos de vocabulario proporcionados.
- Adaptación mediante prompts de idioma definidos en `metadata.json`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones en macOS: el host captura audio continuo, extrae features y alimenta actualizaciones de 1,12 s al modelo, manteniendo el estado del encoder y decodificador para producir una transcripción con marcas parciales; el RTFx de 64,1× en un M3 permite procesar una hora de audio en aproximadamente un minuto.
- Subtitulado en tiempo real en iOS: con un RTFx de 50,3× en iPhone 15 Pro Max, el modelo puede transcribir audio capturado en directo con margen sobrado respecto a la velocidad de reproducción, usando prompts de idioma para fijar la lengua de salida.
- Dictado por voz en aplicaciones nativas: al ejecutarse en ANE y no requerir GPU, el consumo compite menos con el renderizado de la interfaz; el host puede mantener el estado entre pulsaciones para dictados largos.
- Indexación y búsqueda de archivos de audio: procesamiento por lotes de grabaciones largas (el discurso completo de 18 min 15 s se procesa en 17,097 s en Mac) para generar transcripciones normalizadas y alimentar motores de búsqueda.
- Transcripción multilingüe de atención al cliente: el soporte de 28 idiomas permite procesar llamadas en distintas lenguas con un único bundle, seleccionando el prompt de idioma adecuado por llamada.
- Accesibilidad en dispositivos Apple: subtitulado en vivo de contenido audiovisual en iPhone y Mac sin conexión a red, aprovechando que los assets se especializan en el dispositivo y no dependen de servicios externos.
- Evaluación de calidad ASR en pipelines de CI: el host puede comparar tokens emitidos contra referencias (el autor reporta WER normalizado Whisper de 3,20% en el discurso de JFK) para detectar regresiones en conversiones o actualizaciones del runtime.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un MacBook Air M3 (16 GB, macOS 27) sobre el discurso "We choose to go to the Moon" de JFK, medianas de tres ejecuciones tras un warmup:

| Runtime | Extracto de 20 s | Discurso completo (1.095,3 s) | RTFx completo |
|---|---:|---:|---:|
| Glade | 0,300 s | 17,097 s | 64,1× |
| FluidAudio 1.12s | 0,444 s | 25,258 s | 43,4× |

Rendimiento medido en iPhone 15 Pro Max (iOS 27 build 24A437):

| Entrada | Procesamiento | RTFx |
|---|---:|---:|
| 20 segundos | 0,386 s | 51,8× |
| 18 min 15 s | 21,785 s | 50,3× |

Precisión: WER normalizado Whisper de 3,20% (71/2.220) en el discurso completo, tanto para este bundle como para la fuente oficial FP32. En el iPhone, el mismo 3,20% (71/2.220); con la normalización más simple del benchmark, 124/2.219 errores en iPhone frente a 122 en Mac y 121 en FP32. En pruebas cortas en siete idiomas, 11 de 13 casos coinciden exactamente con los token IDs de la fuente; los otros difieren en puntuación alemana y un carácter chino. El autor advierte que una sola grabación no establece un ranking general de precisión.

## Requisitos de hardware

- Plataformas: macOS 27 o iOS 27 sobre silicio de Apple físico; no son modelos Core ML ni binarios precompilados por dispositivo.
- Memoria: el repo ocupa 0,7 GB; el modelo base es de 0,6B parámetros con encoder W8A16 y resto FP16.
- Dispositivos validados: MacBook Air M3 con 16 GB y iPhone 15 Pro Max.
- Ejecución en ANE: las trazas muestran 435 predicciones ANE en 435 llamadas a grafo en una traza corta, sin intervalos de GPU en el proceso objetivo.
- Preparación: 26,54 s de preparación completa observada en Mac y 29,37 s en iPhone; preparaciones posteriores en caché de 0,061 s y 0,082 s respectivamente.
- Despliegue: requiere un host que implemente extracción continua de features, preserve los estados de los grafos y ejecute decodificación greedy recurrente; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,300 s para un extracto de 20 s en Mac y 0,386 s en iPhone; throughput de 64,1× y 50,3× RTFx respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RTFx (Mac, discurso completo) | Licencia | Formato |
|---|---|---:|---:|---|---|
| Nemotron 3.5 ASR Streaming 0.6B Glade | 0,6B | 56 posiciones de historial | 64,1× | OpenMDW 1.1 | Assets `.aimodel` |
| FluidAudio 1.12s (bundle multilingüe) | no disponible | 42 posiciones de historial | 43,4× | no disponible | no disponible |
| Fuente oficial FP32 (Transformers 5.16.0, CPU/SDPA) | 0,6B | 56 posiciones de historial | no disponible | OpenMDW 1.1 | Pesos Transformers |

La comparación con FluidAudio no es controlada: difiere el número de posiciones de historial (56 frente a 42). El autor indica que la fuente FP32 obtiene el mismo WER normalizado Whisper (3,20%) que este bundle.

## Limitaciones y advertencias

- Los assets son fuentes `.aimodel` que se especializan en el dispositivo; no son una aplicación autónoma ni binarios precompilados.
- El host debe implementar la extracción de features, la preservación de estados y la decodificación greedy; sin ello los assets no producen transcripciones.
- Los frames de emisión de tokens no son alineaciones cualificadas de límites de palabra.
- El error numérico del encoder proyectado superó la puerta del 5%, alcanzando aproximadamente un 17% de RMS relativo en un fixture de diagnóstico.
- La validación multilingüe es limitada: siete idiomas en pruebas cortas, no una validación amplia de WER; la tarjeta upstream distingue idiomas listos para transcripción de slots de prompt destinados a adaptación.
- La prueba en iPhone cubre solo inglés con prompt explícito; las comprobaciones multilingües se ejecutaron en Mac.
- En la grabación completa, los tokens del iPhone difieren de los del Mac, aunque son estables entre ejecuciones.
- Las trazas de colocación en ANE no miden ocupación de ALU ni uso de energía; no se hace ninguna afirmación sobre consumo energético.
- Los tiempos de preparación pueden reutilizar cachés opacas del driver y no son tiempos de compilación garantizados en instalación limpia.
- Licencia OpenMDW 1.1: deben revisarse sus términos antes de uso comercial.
- Riesgo de alucinación y sesgos: no hay información específica en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/nemotron-3.5-asr-streaming-0.6b-glade
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/ea30d66debe3740a08b573244286791d423d6b3e
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Referencia de texto del benchmark: https://github.com/coder543/stt-bench-matrix/blob/4689df1aec5dd0e96b223caf3a9a176675c10fa5/samples/jfk_rice_16k.txt
