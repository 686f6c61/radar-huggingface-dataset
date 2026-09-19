# bluemorpholimited/localpolyglot

## Resumen

LocalPolyglot es un paquete de modelos ONNX publicado por el usuario `bluemorpholimited` en HuggingFace que implementa un intérprete de voz en tiempo real y totalmente offline para Android. Su función concreta es escuchar habla en cualquier idioma a través del micrófono del teléfono y emitir la traducción en voz cantonesa (粵語) por los auriculares, sin conexión a internet. No se trata de un modelo único, sino de la integración de tres sistemas encadenados: Whisper large-v3-turbo (809 M de parámetros) para reconocimiento de voz, NLLB-200-distilled-600M con un LoRA afinado para cantonés (600 M) para traducción, y CosyVoice-300M para síntesis de voz, más Silero VAD v5 para detección de actividad de voz. El repositorio ocupa 2,9 GB y contiene únicamente pesos en formato ONNX cuantizados a INT8 de forma dinámica.

La relevancia del proyecto es de ingeniería más que de investigación: demuestra que una cadena completa de traducción de voz a voz (ASR → MT → TTS) puede ejecutarse en un dispositivo móvil ARM64 de gama alta sin conexión, usando ONNX Runtime 1.17 para Android como motor de inferencia. El dispositivo objetivo declarado es un iQOO Neo7 競速版 (Snapdragon 8+ Gen 1, 16 GB de RAM), con Android 13 (API 33) como versión mínima y latencia de audio gestionada mediante Oboe a 16 kHz mono PCM.

Como ficha de modelo para producción, conviene señalar desde el principio que el repositorio no declara licencia propia, no especifica pipeline en HuggingFace, acumula cero descargas y cero likes en los metadatos consultados, y no publica ningún resultado de benchmarks, de latencia ni de tasa de error de traducción. La información disponible es, por tanto, la que el propio autor incluye en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de tres componentes en ONNX: Whisper large-v3-turbo (encoder-decoder transformer) para ASR, NLLB-200-distilled-600M (encoder-decoder transformer) con LoRA para traduccion, CosyVoice-300M (componente de sintesis tipo flow, archivo `cosyvoice_flow.onnx`) para TTS, mas Silero VAD v5 para deteccion de voz |
| Parametros totales | Aproximadamente 1.700 M agregados: 809 M (Whisper large-v3-turbo) + 600 M (NLLB-200) + 300 M (CosyVoice). No incluye tokenizadores ni el VAD |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El pipeline segmenta el audio mediante VAD; no se documentan limites de tokens ni tamanos de ventana de audio |
| Tipos de cuantizacion | INT8 dinamica en todos los componentes ONNX |
| Idiomas soportados | Entrada: 99+ idiomas reconocidos por Whisper y 200 idiomas de traduccion en NLLB-200 (ingles, frances, aleman, espanol, italiano, japones, coreano, ruso, portugues, chino mandarin, arabe, hindi, thai, vietnamita y 185+ mas). Salida: unicamente cantonés (粵語) |
| Licencia | El repositorio de HuggingFace no declara licencia. La model card indica: Apache 2.0 (CosyVoice), MIT (Whisper, NLLB, Silero VAD) y Apache 2.0 para la aplicacion |
| Formato de pesos | ONNX (INT8), exportados desde los pesos originales |
| Tamano del repositorio | 2,9 GB |
| Motor de inferencia | ONNX Runtime 1.17 para Android |
| Audio | PCM mono a 16 kHz; salida con Oboe para baja latencia (cable y Bluetooth A2DP) |
| Plataforma objetivo | Android 13 (API 33) o superior, ARM64 |
| Dispositivo de referencia | iQOO Neo7 競速版 (Snapdragon 8+ Gen 1, 16 GB de RAM) |
| Descargas y likes (HuggingFace) | 0 descargas, 0 likes |
| Fechas de publicacion (metadatos HF) | Creado el 2026-09-19, actualizado el 2026-09-19 |

Composicion detallada del paquete segun la model card:

| Componente | Archivo | Tamano | Funcion |
|---|---|---|---|
| Whisper large-v3-turbo | `whisper_encoder_int8.onnx` | 616 MB | Encoder de voz |
| Whisper large-v3-turbo | `whisper_decoder_int8.onnx` | 165 MB | Decoder de voz |
| NLLB-200-600M (LoRA cantonés) | `nllb_encoder_int8.onnx` | 400 MB | Encoder de traduccion |
| NLLB-200-600M (LoRA cantonés) | `nllb_decoder_int8.onnx` | 698 MB | Decoder de traduccion |
| NLLB-200 tokenizer | `nllb_tokenizer.json` | 32 MB | Tokenizador BPE |
| NLLB-200 sentencepiece | `nllb_sentencepiece.model` | 5 MB | Tokenizador subword |
| CosyVoice-300M | `cosyvoice_flow.onnx` | 314 MB | Sintesis TTS |
| CosyVoice-300M | `cosyvoice_tokenizer.onnx` | 499 MB | Tokenizador de voz |
| Silero VAD v5 | `silero_vad.onnx` | 2,3 MB | Deteccion de actividad de voz |

La suma de los archivos listados es de aproximadamente 2,67 GB, frente a los 2,9 GB que declara el repositorio; la diferencia no se explica en la informacion disponible.

## Arquitectura y entrenamiento

La arquitectura es una cadena secuencial de inferencia, no un modelo unico. El flujo declarado es `Microfono → VAD → Whisper ASR → NLLB-200 → CosyVoice TTS → Auriculares`. Silero VAD v5 decide cuando hay voz, Whisper large-v3-turbo transcribe el audio en cualquiera de sus mas de 99 idiomas de entrada, NLLB-200-distilled-600M traduce el texto al cantonés y CosyVoice-300M sintetiza la locucion. Todos los componentes se ejecutan localmente en el dispositivo mediante ONNX Runtime 1.17, con cuantizacion INT8 dinamica para reducir el consumo de memoria y de ancho de banda de computo en ARM64.

El entrenamiento propio documentado se limita al adaptador de traduccion: se parte de NLLB-200-distilled-600M de Meta, se aplica un LoRA con r=16 y alpha=32 sobre un corpus paralelo de cantonés coloquial (口语), se fusionan los pesos del LoRA en el modelo base y se exporta a ONNX con cuantizacion INT8. Para Whisper se usa `optimum-cli` en la exportacion y cuantizacion a INT8, y CosyVoice-300M se exporta directamente a ONNX. El repositorio incluye los scripts `train_cantonese_lora.py`, `quantize_whisper.py`, `quantize_nllb.py`, `quantize_nllb_cantonese.py` y `merge_and_export_nllb.py`.

No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias sobre ningun componente. Tampoco se especifica el volumen de tokens de audio o texto usado para el corpus paralelo de cantonés, su procedencia ni su composicion, ni si hubo evaluacion de calidad de traduccion tras la fusion del LoRA. La aplicacion Android emplea un servicio en primer plano con excepcion de optimizacion de bateria para mantener el pipeline activo en segundo plano.

## Capacidades

- Reconocimiento automatico de voz en mas de 99 idiomas mediante Whisper large-v3-turbo (809 M de parametros), con cuantizacion INT8.
- Traduccion automatica desde 200 idiomas hacia cantonés coloquial mediante NLLB-200-distilled-600M con adaptador LoRA especifico (r=16, alpha=32).
- Sintesis de voz en cantonés con CosyVoice-300M, incluyendo un tokenizador de voz exportado a ONNX de 499 MB.
- Deteccion de actividad de voz con Silero VAD v5 para segmentar el audio antes del reconocimiento.
- Funcionamiento completamente offline: no requiere red en ningun punto del pipeline.
- Salida de audio restringida a auriculares, con soporte de conexion por cable y Bluetooth A2DP.
- Ejecucion como servicio en primer plano en Android, con gestion de bateria.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio bidireccional ni modo de pensamiento.
- No se documenta soporte multilingue en la salida: el cantonés es el unico idioma de destino.

## Casos de uso

- Interpretacion presencial en tiempo real para conversaciones con hablantes de otros idiomas: una persona con auriculares conectados puede escuchar la traduccion al cantonés mientras el interlocutor habla, con toda la cadena ejecutandose en el propio telefono y sin coste de red ni exposicion de datos a servicios externos.
- Viajes y entornos sin conectividad: en zonas sin cobertura movil o wifi, el pipeline sigue operativo porque los 2,9 GB de pesos estan en el dispositivo, algo que ninguna API en la nube puede garantizar.
- Atencion en comercio local con clientela extranjera: un dependiente cantonesofono puede atender a clientes que hablen ingles, japones, coreano o arabe usando solo el telefono y unos auriculares, sin depender de una conexion estable en el mostrador.
- Prueba de concepto de traduccion de voz a voz en el borde: el repositorio sirve como referencia reproducible para equipos que quieran medir el coste real de ejecutar ASR + MT + TTS cuantizados a INT8 en ARM64 con ONNX Runtime.
- Base para reentrenar el adaptador LoRA hacia otro idioma de destino: los scripts de fusion y exportacion incluidos permiten sustituir el corpus de cantonés por otro idioma y repetir el ciclo LoRA → merge → ONNX INT8.
- Investigacion en privacidad del dato de voz: al no salir el audio del dispositivo, el flujo resulta adecuado para escenarios con requisitos estrictos de confidencialidad, como entrevistas o consultas medicas informales, siempre que se asuma la ausencia de cifrado o de auditoria documentada.
- Evaluacion comparativa de latencia percibida de pipelines ASR+MT+TTS en movil: util para medir donde se acumula el retardo (VAD, ASR, traduccion o sintesis) antes de invertir en optimizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

En concreto, no hay cifras de WER para el reconocimiento, de BLEU, chrF o COMET para la traduccion, ni de MOS o latencia de sintesis para el TTS. Tampoco se publican tasas de tiempo real (RTF), latencia extremo a extremo ni consumo de bateria medidos en el dispositivo de referencia, mas alla de la afirmacion cualitativa de funcionamiento en tiempo real.

## Requisitos de hardware

- Espacio de almacenamiento: 2,9 GB solo para los pesos, mas el espacio adicional de la aplicacion y del runtime de ONNX.
- Memoria: el dispositivo de referencia declara 16 GB de RAM (iQOO Neo7 競速版, Snapdragon 8+ Gen 1, ARM64). No se indica el consumo de memoria en ejecucion ni la RAM minima viable.
- Cuantizacion: INT8 dinamica en todos los componentes ONNX, lo que reduce el peso y el uso de memoria frente a los pesos en FP32 o FP16 originales.
- Movil: Android 13 (API 33) o superior sobre ARM64. No se documenta soporte para iOS, Android de 32 bits ni versiones anteriores de Android.
- GPU de escritorio: no se documenta soporte oficial para x86, CUDA, ROCm ni Metal. Dado que el total de pesos INT8 ronda los 2,9 GB, un port a escritorio con ONNX Runtime cabria en tarjetas de consumo como una RTX 3060 de 12 GB o una RTX 4090, pero se trata de una estimacion derivada del tamano del modelo, no de un requisito publicado.
- Opciones de despliegue: ONNX Runtime 1.17 (Android) es el motor documentado. No hay pesos en formato GGUF, por lo que llama.cpp y Ollama no son aplicables tal cual. Tampoco hay integracion declarada con vLLM ni TGI, que estan orientados a transformers en servidor.
- Salida de audio: Oboe para baja latencia; se requieren auriculares con cable o Bluetooth A2DP, ya que la salida esta restringida a ese destino.
- Latencia y throughput: no disponibles. El autor solo afirma que el sistema funciona en tiempo real en el dispositivo objetivo.

## Comparativa con modelos similares

| Criterio | LocalPolyglot | Meta SeamlessM4T (familia de traduccion voz a voz) | Whisper large-v3-turbo en solitario | NLLB-200-distilled-600M en solitario |
|---|---|---|---|---|
| Categoria | Paquete ONNX ASR + MT + TTS para Android | Sistema integrado de traduccion de voz | Modelo ASR | Modelo de traduccion de texto |
| Parametros | ~1.700 M agregados | No disponible en la informacion proporcionada | 809 M | 600 M |
| Modalidad de salida | Voz en cantonés | Voz y texto (segun configuracion) | Texto transcrito | Texto traducido |
| Salida en cantonés | Si, mediante LoRA afinado | No disponible | No aplica | No de forma nativa |
| Ejecucion offline en movil | Si, sobre ONNX Runtime Android | No disponible | No documentado en este repositorio | No documentado en este repositorio |
| Cuantizacion | INT8 dinamica | No disponible | INT8 en este paquete | INT8 en este paquete |
| Licencia | Sin licencia declarada en el repo; componentes Apache 2.0 y MIT segun el autor | No disponible; conviene verificar las condiciones de uso comercial | MIT | El autor indica MIT, pero la distribucion oficial de NLLB-200 se publica bajo CC-BY-NC-4.0; verificar antes de uso comercial |
| Disponibilidad | 0 descargas, 0 likes | Ampliamente conocida en investigacion | Ampliamente disponible | Ampliamente disponible |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados en la informacion disponible para LocalPolyglot, y el repositorio tampoco aporta cifras propias de los componentes tras la cuantizacion INT8.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay WER, BLEU, chrF, COMET, MOS ni mediciones de latencia. No es posible evaluar la calidad real de la traduccion ni del habla sintetizada sin desplegar el pipeline.
- Licencia del repositorio sin declarar en HuggingFace. La model card atribuye MIT a NLLB, pero la distribucion oficial de NLLB-200 se publica bajo CC-BY-NC-4.0; si esa condicion se aplica al modelo derivado, el uso comercial del componente de traduccion quedaria restringido. Es imprescindible verificar la licencia antes de cualquier despliegue productivo.
- Idoneidad para produccion no acreditada: cero descargas y cero likes en los metadatos, ausencia de pipeline declarado y ausencia de versionado o changelog.
- Salida limitada al cantonés: no es un modelo multilingue de salida. Adaptarlo a otro idioma exige repetir el ciclo de LoRA, fusion y exportacion con un corpus paralelo propio.
- Sesgos heredados: los de Whisper large-v3-turbo y NLLB-200 en reconocimiento y traduccion, incluidas las diferencias de calidad entre idiomas y las variantes dialectales del cantonés. No se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion y de error en cascada: los fallos del ASR se propagan a la traduccion y esta a la sintesis, sin ningun mecanismo de verificacion o de deteccion de confianza documentado.
- El corpus de ajuste LoRA (cantonés coloquial) no se describe: se desconoce su tamano, procedencia, licencia y cobertura de registros.
- Limitaciones de hardware: el unico dispositivo validado es un telefono con Snapdragon 8+ Gen 1 y 16 GB de RAM. No hay datos de rendimiento en gama media ni en Android de 32 bits, y no se declara la RAM minima.
- Sin soporte documentado de escritorio ni de GPUs NVIDIA, AMD o Apple: no hay pesos GGUF, Safetensors ni integraciones con vLLM, TGI, llama.cpp u Ollama.
- Fechas de publicacion inconsistentes: los metadatos de HuggingFace indican creacion y actualizacion en septiembre de 2026, posteriores a la fecha habitual de consulta, lo que conviene verificar.
- La salida de audio esta restringida a auriculares, lo que limita el uso en escenarios de grupo o altavoz.
- Sin cifrado ni tratamiento de datos documentado: aunque el procesamiento es local, no se describe ninguna politica de retencion o de proteccion del audio capturado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bluemorpholimited/localpolyglot
- Repositorio de scripts incluidos en el paquete (referenciados en la model card, sin URL publica indicada): `scripts/train_cantonese_lora.py`, `scripts/quantize_whisper.py`, `scripts/quantize_nllb.py`, `scripts/quantize_nllb_cantonese.py`, `scripts/merge_and_export_nllb.py`
- Paper o blog del autor: no disponible
- Demo publica: no disponible
- La busqueda web realizada no devolvio ningun enlace relacionado con el modelo; los resultados obtenidos eran consultas no relacionadas sobre Microsoft Store y no aportan informacion adicional.
