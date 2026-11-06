# pdnhan/whisper-small.en-mobile

## Resumen

`pdnhan/whisper-small.en-mobile` es una copia en ONNX con cuantización int8 del modelo de reconocimiento automático del habla (ASR) `openai/whisper-small.en`, la variante de Whisper entrenada exclusivamente para inglés. Lo publica el desarrollador pdnhan para su uso dentro de la aplicación Android Thì Thầm, que lo emplea para la transcripción de voz en inglés directamente en el dispositivo, sin depender de servicios en la nube.

El modelo no introduce cambios en los pesos ni en el grafo de cómputo respecto a la exportación previa de Xenova (`Xenova/whisper-small.en`). La única modificación es que los mapas de atención dejan de exponerse como salidas del grafo ONNX. Dado que ONNX Runtime mantiene en memoria todas las salidas declaradas del grafo, la versión de Xenova consumía mucha más memoria de la necesaria en cada transcripción; esta copia reduce el pico de memoria neto de una transcripción de 2225 MB a 1032 MB, con resultados idénticos.

Su relevancia es práctica: ofrece un artefacto listo para desplegar en móvil con ONNX Runtime, con un consumo de memoria aproximadamente la mitad que el export original, lo que lo hace viable en dispositivos Android con recursos limitados. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | no disponible (heredados de `openai/whisper-small.en`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s (log-mel de entrada `[1, 80, 3000]`) |
| Tipos de cuantizacion | int8 (archivos `*_quantized.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder y decoder separados, cuantizados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder de OpenAI diseñado para ASR. La entrada del encoder es un log-mel de 80 canales correspondiente a 30 segundos de audio, con forma `[1, 80, 3000]`, que produce `last_hidden_state`. El decoder es autorregresivo y opera con caché KV: recibe `input_ids`, `encoder_hidden_states`, el flag `use_cache_branch` y las claves/valores pasados (`past_key_values.*`), y devuelve `logits` y los `present.*` actualizados. El prompt de decodificación es `[50257, 50362]` (`<|startoftranscript|>`, `<|notimestamps|>`) y la parada se marca con `50256` (`<|endoftext|>`).

Esta copia concreta no reentrena ni modifica los pesos: parte de la exportación de Xenova en el commit `fa16a75f5d91e83ecb6a2ccb690f14d91ef00ca4` y solo elimina los mapas de atención de las salidas del grafo para evitar que ONNX Runtime los retenga en memoria. La validación del autor sobre 2 clips de FLEURS en inglés muestra tokens idénticos en 30 pasos de decodificación greedy y salida del encoder idéntica respecto al fichero de Xenova. Las mediciones de memoria se realizaron con ONNX Runtime 1.31.1, 4 hilos intra-op y optimización de grafo `ENABLE_ALL`, en procesos nuevos. No se dispone de información sobre los datos de entrenamiento originales de Whisper small.en en la documentación proporcionada.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio de hasta 30 segundos por ventana.
- Transcripción con decodificación greedy autorregresiva y caché KV para eficiencia en pasos sucesivos.
- Ejecución en dispositivo (on-device) mediante ONNX Runtime, sin llamadas a red.
- Integración en aplicaciones Android (uso declarado en la app Thì Thầm).
- No soporta otros idiomas distintos del inglés.
- No dispone de tool calling, capacidades de agente, visión ni audio más allá de la transcripción ASR.
- No incluye modo de razonamiento extendido ni salidas estructuradas más allá de los tokens de transcripción.

## Casos de uso

- Transcripción de voz en apps Android: el modelo se carga con ONNX Runtime en el propio dispositivo y transcribe dictado o notas de voz en inglés con un pico de memoria de aproximadamente 1 GB, adecuado para terminales de gama media.
- Subtitulado local de audio corto: para clips de hasta 30 segundos, el encoder procesa el log-mel completo y el decoder genera la transcripción sin conexión, útil en herramientas de accesibilidad offline.
- Asistentes de voz sin conectividad: en entornos sin red o con requisitos de privacidad, el procesamiento local evita enviar audio a servidores externos.
- Dictado en aplicaciones de productividad: integración en teclados o editores Android que necesiten conversión de voz a texto en inglés con latencia baja y sin coste por API.
- Prototipado de pipelines ASR en móvil: sirve como referencia de exportación ONNX cuantizada para comparar consumo de memoria frente a otras variantes antes de escalar a modelos mayores.
- Filtrado y preprocesado de audio en el borde: transcripción previa en el dispositivo para indexar o clasificar grabaciones antes de enviar solo el texto a un backend.

## Benchmarks y rendimiento

El autor no publica métricas de calidad ASR (WER, MMLU, etc.) en la información disponible. El único dato de rendimiento medido es el pico de memoria neto de una transcripción (ambas sesiones cargadas, encoder y 20 pasos de decoder), con ONNX Runtime 1.31.1, 4 hilos intra-op y `ENABLE_ALL`:

| Modelo | Fichero de Xenova | Esta copia |
|---|---|---|
| whisper-small.en | 2225 MB | 1032 MB |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 1 GB de pico de memoria neta por transcripción según la medición del autor (encoder más 20 pasos de decoder); el repositorio completo ocupa 0,2 GB en disco.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU en dispositivos móviles mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no hay datos publicados; el diseño apunta a ejecución en CPU de Android, no a aceleración en GPU de escritorio.
- Opciones de despliegue: ONNX Runtime (versión de referencia 1.31.1), con los ficheros `onnx/encoder_model_quantized.onnx` y `onnx/decoder_model_merged_quantized.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; solo se documenta el consumo de memoria con 4 hilos intra-op.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Idiomas | Memoria por transcripción | Licencia |
|---|---|---|---|---|---|
| pdnhan/whisper-small.en-mobile | ONNX | int8 | en | 1032 MB (medido) | Apache 2.0 |
| Xenova/whisper-small.en | ONNX | int8 | en | 2225 MB (medido) | Apache 2.0 |
| openai/whisper-small.en | PyTorch (safetensors) | no cuantizado | en | no disponible | Apache 2.0 (pesos) / MIT (código) |

La diferencia principal frente a la exportación de Xenova es el consumo de memoria, aproximadamente la mitad, con salidas idénticas según la validación del autor. Frente al modelo original de OpenAI, esta copia está optimizada para despliegue móvil y no para entrenamiento o fine-tuning.

## Limitaciones y advertencias

- Solo reconoce inglés; no es adecuado para otros idiomas.
- Ventana de audio limitada a 30 segundos por pasada; audios más largos requieren segmentación externa.
- No se han publicado métricas de calidad (WER) para esta copia; la validación se limita a 2 clips de FLEURS con comparación de tokens.
- Las mediciones de memoria dependen de la configuración (ONNX Runtime 1.31.1, 4 hilos, `ENABLE_ALL`); otros entornos pueden variar.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio o ruido; conviene aplicar detección de voz previa.
- Sesgos heredados del corpus de entrenamiento original de Whisper small.en, no documentados en esta ficha.
- Licencia Apache 2.0 para los ficheros de esta copia; el código y pesos originales de Whisper se distribuyen bajo MIT en el repositorio de OpenAI, según indica el autor.
- El modelo está pensado para inferencia en dispositivo; no se ofrece soporte para fine-tuning ni para despliegue en servidores de alta concurrencia con este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/whisper-small.en-mobile
- Modelo base: https://huggingface.co/openai/whisper-small.en
- Exportación de referencia: https://huggingface.co/Xenova/whisper-small.en
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Ficha en free2aitools: https://free2aitools.com/model/pdnhan/whisper-small.en-mobile
