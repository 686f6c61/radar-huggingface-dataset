# pdnhan/whisper-tiny-mobile

## Resumen

`pdnhan/whisper-tiny-mobile` es una conversión a ONNX int8 del modelo de reconocimiento automático del habla Whisper tiny de OpenAI, orientada a inferencia en dispositivo (on-device) mediante ONNX Runtime. El autor, pdnhan, parte del export de Xenova (`Xenova/whisper-tiny`, commit `5332fcc35e32a33b86612b9a57a89be7906102b1`) y aplica un único cambio estructural: eliminar los mapas de atención como salidas del grafo, ya que ONNX Runtime mantiene en memoria todas las salidas declaradas y eso dispara el consumo de memoria por transcripción.

El modelo resuelve un problema muy concreto de ingeniería: reducir el pico de memoria neta de una transcripción completa (encoder más 20 pasos de decoder) de 513 MB a 345 MB con ONNX Runtime 1.31.1, 4 hilos intra-op y optimización de grafo `ENABLE_ALL`. Los pesos, los nodos y los resultados son idénticos a los del export original, según verifica el autor sobre dos clips de FLEURS en alemán con 30 pasos greedy.

Es relevante ahora porque permite ejecutar ASR multilingüe de Whisper tiny en dispositivos Android sin necesidad de GPU dedicada ni de conexión a red, con una huella de memoria compatible con aplicaciones móviles. La app Thì Thầm lo utiliza para reconocimiento de voz en alemán, forzando el token de idioma `<|de|>` en el decoder. La licencia es Apache 2.0, la misma que los ficheros de los que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny), exportado a ONNX |
| Parametros totales | no disponible (heredados de openai/whisper-tiny) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s de audio de entrada (log-mel de 80 x 3000); decoder autoregresivo sin límite explícito documentado |
| Tipos de cuantizacion | int8 (ficheros `*_quantized.onnx`); entrada del encoder en float32 |
| Idiomas soportados | multilingüe; el autor documenta y valida alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper tiny de OpenAI: un transformer encoder-decoder entrenado para transcripción y traducción de voz multilingüe. El encoder consume un log-mel de 30 segundos con forma `[1, 80, 3000]` en float32 y produce `last_hidden_state`; el decoder es autorregresivo y se ejecuta con caché KV, recibiendo `input_ids` (int64), `encoder_hidden_states`, el booleano `use_cache_branch` y las entradas `past_key_values.*`, y devolviendo `logits` y `present.*`.

No hay reentrenamiento ni ajuste fino: la conversión solo elimina los mapas de atención de las salidas del grafo ONNX para evitar que ONNX Runtime los retenga en memoria. La cuantización a int8 se hereda del export de Xenova. El prompt de decoder para alemán es `[50258, 50261, 50359, 50363]` (`<|startoftranscript|>`, `<|de|>`, `<|transcribe|>`, `<|notimestamps|>`), con parada en `50257` (`<|endoftext|>`); el autor indica que otro token de idioma funciona del mismo modo. La validación de equivalencia se hizo con 30 pasos greedy sobre 2 clips de FLEURS en alemán, obteniendo tokens idénticos y salida de encoder idéntica frente al fichero de Xenova.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, con selección de idioma mediante token especial en el prompt del decoder.
- Transcripción de audio de hasta 30 segundos por ventana, con log-mel de 80 canales y 3000 frames.
- Modo sin marcas de tiempo (`<|notimestamps|>`), que es el configurado por defecto en el ejemplo del autor.
- Ejecución en dispositivo con ONNX Runtime, sin dependencia de servicios en la nube.
- Inferencia con caché KV en el decoder (`use_cache_branch`, `past_key_values.*`), lo que permite decodificación incremental paso a paso.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de voz en apps Android sin conexión: el modelo se integra con ONNX Runtime en el dispositivo y procesa audio de hasta 30 segundos por ventana, con un pico de memoria de 345 MB que encaja en el presupuesto de una app móvil. Es el caso real de la app Thì Thầm para alemán.
- Dictado por voz en aplicaciones de notas: el decoder con caché KV permite ir generando tokens incrementalmente mientras el usuario habla, y el prompt `<|de|>` fija el idioma sin detección automática.
- Subtitulado local de reuniones o clases: con el modo `<|notimestamps|>` se obtiene texto plano por segmentos de 30 segundos, concatenable en un pipeline propio para audio más largo.
- Asistentes de voz embebidos en dispositivos de bajos recursos: al ser int8 y ONNX, puede desplegarse en hardware ARM sin GPU, manteniendo la transcripción en el propio dispositivo por privacidad.
- Preprocesado de audio para pipelines de NLP: transcribir localmente y enviar solo texto a un servidor reduce ancho de banda y exposición de datos personales.
- Prototipado y pruebas de integración de ASR en CI: al ser un grafo ONNX determinista y verificable contra el original, sirve para tests de regresión de pipelines de audio sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la informacion disponible. El autor solo aporta una medición de memoria y una verificación de equivalencia funcional:

| Metrica | Xenova/whisper-tiny | Esta copia |
|---|---|---|
| Pico de memoria neta por transcripcion (encoder + 20 pasos decoder) | 513 MB | 345 MB |
| Tokens de decoder (30 pasos greedy, FLEURS de) | identicos | identicos |
| Salida del encoder (FLEURS de) | identica | identica |

Condiciones de medida: ONNX Runtime 1.31.1, 4 hilos intra-op, optimización de grafo `ENABLE_ALL`, procesos nuevos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 345 MB de pico neto por transcripción según la medición del autor (encoder y decoder cargados, 20 pasos de decoder). No se documenta el consumo en reposo de los dos ficheros ONNX por separado.
- GPU recomendadas: no aplica; el modelo está pensado para CPU/ARM en dispositivo. No se documentan requisitos de GPU.
- Cabe en GPU de consumo: sí, por tamaño, aunque el objetivo declarado es ejecución móvil en CPU; no hay datos de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (versión de referencia 1.31.1), integrable en Android; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles. El autor solo especifica 4 hilos intra-op y optimización `ENABLE_ALL` como configuración de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pdnhan/whisper-tiny-mobile | no disponible (Whisper tiny) | 30 s | ONNX int8 | Apache 2.0 | Pico de 345 MB por transcripción; sin mapas de atención como salidas |
| Xenova/whisper-tiny | no disponible (Whisper tiny) | 30 s | ONNX | Apache 2.0 | Export base; pico de 513 MB por transcripción |
| openai/whisper-tiny | no disponible | 30 s | PyTorch (safetensors/bin) | Apache 2.0 en HF; MIT en el repo openai/whisper | Modelo original, no optimizado para móvil |

No se dispone de datos de benchmarks de precisión para establecer comparaciones de calidad frente a otras variantes.

## Limitaciones y advertencias

- Solo se ha validado explícitamente el alemán sobre 2 clips de FLEURS; el resto de idiomas multilingües no está verificado en esta copia.
- Ventana de audio fija de 30 segundos por inferencia; audios más largos requieren segmentación externa.
- Whisper tiny es el tamaño más pequeño de la familia y su precisión es inferior a la de modelos mayores; no se aportan métricas de WER para cuantificar la degradación.
- La cuantización int8 puede introducir diferencias frente al modelo en punto flotante; el autor solo verifica equivalencia de tokens en una muestra pequeña.
- Riesgo de alucinación inherente a los modelos de ASR generativos, especialmente en audio ruidoso o silencioso; no se documentan mitigaciones.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB; conviene verificar la integridad de los ficheros antes de usarlo en producción.
- Licencia Apache 2.0, que permite uso comercial; el código y los pesos originales de openai/whisper están bajo MIT, según indica el autor.
- No se documentan sesgos específicos más allá de los heredados del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdnhan/whisper-tiny-mobile
- Export base: https://huggingface.co/Xenova/whisper-tiny
- Modelo original: https://huggingface.co/openai/whisper-tiny
- Repositorio de código de Whisper: https://github.com/openai/whisper
