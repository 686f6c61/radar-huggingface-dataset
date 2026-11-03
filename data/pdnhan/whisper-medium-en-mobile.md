# pdnhan/whisper-medium.en-mobile

## Resumen

Whisper medium.en-mobile es una conversión a ONNX con cuantización int8 del modelo de reconocimiento automático de voz Whisper medium.en de OpenAI, publicada por el usuario pdnhan. El modelo original es un transformer encoder-decoder entrenado exclusivamente para inglés, y esta versión está pensada para inferencia en dispositivo (on-device) mediante ONNX Runtime, concretamente para la aplicación Android Thì Thầm, que la utiliza para el reconocimiento de voz en inglés.

El cambio técnico respecto a la exportación previa de Xenova/whisper-medium.en es deliberadamente mínimo: se eliminan los mapas de atención de las salidas declaradas del grafo ONNX. Dado que ONNX Runtime mantiene en memoria todas las salidas declaradas del grafo, la versión de Xenova consumía mucha más memoria de la necesaria por transcripción. Según el autor, los pesos, los nodos y los resultados son idénticos, y la verificación con dos clips de FLEURS en inglés produce tokens y salida del encoder idénticos.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de una mejora de capacidades, sino de un artefacto de despliegue optimizado para memoria en Android. Su interés práctico está en la reducción de memoria pico medida (de 5536 MB a 2249 MB por transcripción) y en servir como referencia para quien necesite ejecutar Whisper medium.en en dispositivos con recursos limitados usando ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX y cuantizado a int8 |
| Parametros totales | no disponible (el modelo base Whisper medium.en tiene 769 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por transcripcion (entrada log-mel de 80 x 3000) |
| Tipos de cuantizacion | int8 (archivos `encoder_model_quantized.onnx` y `decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | ingles unicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder y decoder merged cuantizados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper medium.en de OpenAI, un transformer encoder-decoder con atención estándar que procesa log-mel spectrograms de 30 segundos (entrada `input_features` de forma [1, 80, 3000]) y genera tokens autoregresivamente. El encoder produce `last_hidden_state`; el decoder, en su variante merged, acepta `input_ids`, `encoder_hidden_states`, `use_cache_branch` y `past_key_values.*`, y devuelve `logits` y `present.*`. El prompt de decodificación es `[50257, 50362]` (`<|startoftranscript|>`, `<|notimestamps|>`) y la parada se produce en `50256` (`<|endoftext|>`).

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO: esta ficha describe una conversión de un modelo preexistente, no un entrenamiento nuevo. La única modificación respecto a la exportación de Xenova es la eliminación de los mapas de atención como salidas del grafo, lo que reduce la memoria retenida por ONNX Runtime sin alterar pesos ni resultados, según la verificación del autor con dos clips de FLEURS en inglés (tokens idénticos en 30 pasos de decodificación greedy y salida del encoder idéntica).

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés sobre ventanas de audio de 30 segundos.
- Transcripción de audio a texto con decodificación autoregresiva y caché de clave-valor (`past_key_values`).
- Ejecución en dispositivo mediante ONNX Runtime, con sesiones separadas para encoder y decoder.
- Inferencia con cuantización int8, orientada a reducir huella de memoria en Android.
- No soporta otros idiomas distintos del inglés.
- No se documentan capacidades de traducción, identificación de idioma, tool calling, agentes ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Reconocimiento de voz en aplicaciones Android: el modelo está empaquetado específicamente para la app Thì Thầm, que lo usa para transcribir inglés en el dispositivo sin enviar audio a servidores, gracias a su formato ONNX int8 y a la reducción de memoria pico a 2249 MB.
- Dictado offline en movilidad: al ejecutarse con ONNX Runtime y no requerir backend remoto, resulta adecuado para escenarios sin conectividad o con requisitos de privacidad, siempre que el dispositivo disponga de memoria suficiente para cargar ambas sesiones.
- Transcripción de notas de voz en inglés: la ventana de 30 s por pasada encaja con clips cortos de reuniones o mensajes, procesados secuencialmente por el decoder con caché de clave-valor.
- Integración en pipelines de accesibilidad: aplicaciones que convierten voz en texto para usuarios con dificultades motoras pueden beneficiarse de la inferencia local y de la licencia Apache 2.0 para su distribución.
- Prototipado de ASR en entornos embebidos: sirve como referencia para medir el coste real de memoria de Whisper medium.en en ONNX Runtime con optimización ENABLE_ALL y 4 hilos intra-op, antes de decidir entre medium y modelos menores.
- Evaluación comparativa de exportaciones ONNX: útil para equipos que quieran reproducir la diferencia de memoria entre la exportación de Xenova y esta variante sin cambios en los resultados, usando los clips de FLEURS como control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. El autor únicamente reporta una medición de memoria pico neta por transcripción:

| Modelo | Archivo de Xenova | Esta copia |
|---|---|---|
| en medium | 5536 MB | 2249 MB |

Medición realizada con ONNX Runtime 1.31.1, 4 hilos intra-op, optimización de grafo ENABLE_ALL y en procesos nuevos, cargando ambas sesiones (encoder y 20 pasos de decoder).

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2249 MB de memoria pico neta por transcripción según la medición del autor, frente a 5536 MB de la exportación de Xenova.
- GPU recomendadas: no se especifican; el destino declarado es Android con ONNX Runtime, por lo que el cómputo puede ser CPU, GPU móvil o aceleradores NPU compatibles con ONNX Runtime.
- Cabe en GPU de consumo: no hay datos específicos; el tamaño del repositorio es de 0,8 GB y la memoria pico medida (2249 MB) es compatible con GPUs de consumo con al menos 4 GB, aunque no se documenta rendimiento en ellas.
- Opciones de despliegue: ONNX Runtime (versión de referencia 1.31.1), con encoder y decoder como sesiones separadas; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| pdnhan/whisper-medium.en-mobile | no disponible | audio de 30 s | en | Apache 2.0 | ONNX int8 | Memoria pico 2249 MB por transcripción |
| Xenova/whisper-medium.en | no disponible | audio de 30 s | en | Apache 2.0 | ONNX | Memoria pico 5536 MB por transcripción; mapas de atención como salidas |
| openai/whisper-medium.en | no disponible | audio de 30 s | en | Apache 2.0 (pesos en HF) | safetensors/PyTorch | Modelo base original, sin cuantizar |

Los datos de parámetros y rendimiento de precisión no están disponibles en la información proporcionada para ninguno de los tres; la comparación se limita a formato, licencia y memoria medida.

## Limitaciones y advertencias

- Solo reconoce inglés; no admite otros idiomas ni traducción.
- Procesa audio en ventanas de 30 segundos; no se documenta manejo de audio más largo más allá del troceado por parte de la aplicación.
- Riesgo de alucinación y errores de transcripción inherente a Whisper, aunque no se cuantifica en la información disponible.
- La cuantización int8 puede degradar ligeramente la precisión respecto al modelo original; el autor solo verifica igualdad de tokens en dos clips de FLEURS, una muestra muy reducida.
- La licencia Apache 2.0 aplica a los pesos en Hugging Face; el código y los pesos del repositorio openai/whisper se distribuyen bajo MIT, según se indica en la model card.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026: no hay evidencia de uso en producción más allá de la app Thì Thầm.
- El script `make_mobile.py` se incluye solo por procedencia y se ejecuta desde `tools/whisper_en` del repositorio de la aplicación, lo que puede complicar la reproducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/whisper-medium.en-mobile
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Exportación ONNX de referencia: https://huggingface.co/Xenova/whisper-medium.en
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
