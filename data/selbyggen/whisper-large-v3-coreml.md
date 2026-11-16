# Selbyggen/whisper-large-v3-coreml

## Resumen

`Selbyggen/whisper-large-v3-coreml` es una conversión de formato del modelo `openai/whisper-large-v3` a Core ML, empaquetada para su uso con WhisperKit y cuantizada a 8 bits para ejecutarse en la Neural Engine de los chips Apple Silicon. No se trata de un modelo nuevo ni de un fine-tuning: los pesos y el comportamiento son los de OpenAI, y el autor lo declara explícitamente en la model card. El objetivo es reducir el peso en disco y memoria (de unos 3,1 GB en float16 a unos 1,56 GB en int8) manteniendo una precisión prácticamente idéntica, para permitir transcripción local en Mac, iPhone y iPad.

La relevancia de esta ficha es práctica: para desarrolladores que quieran integrar ASR de alta calidad en aplicaciones Apple sin depender de la nube, esta conversión ofrece un paquete listo para WhisperKit con métricas de error publicadas sobre diez conjuntos de evaluación en cinco idiomas. El repositorio es pequeño (1,5 GB), tiene licencia Apache 2.0 y cero descargas en el momento de la consulta, lo que indica que es un artefacto reciente y poco difundido.

Arquitectura y tamaño corresponden al Whisper large-v3 original: encoder-decoder transformer con 1.550 millones de parámetros, ventana de audio de 30 segundos por segmento y vocabulario multilingüe. La conversión conserva el espectrograma mel en float16 y solo cuantiza los pesos del encoder y del decoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a Core ML |
| Parametros totales | 1.550 millones (heredados de openai/whisper-large-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (Whisper); contexto de texto de 448 tokens |
| Tipos de cuantizacion | int8 lineal simetrico por canal en pesos, activaciones float16, espectrograma mel float16 |
| Idiomas soportados | en, de, nl, es, fr (declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | paquete Core ML (.mlpackage compilado con coremlcompiler); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3 de OpenAI, un transformer encoder-decoder entrenado para reconocimiento automático del habla y traducción de voz. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. Esta publicación no entrena ni ajusta nada: es una conversión de formato. El proceso, documentado por el autor, usa `whisperkittools` para generar paquetes Core ML en float16 y después aplica `coremltools.optimize.coreml.linear_quantize_weights` con cuantización lineal simétrica int8 por canal (pesos de 8 bits, activaciones de 16 bits), compilando el resultado con `coremlcompiler`. El espectrograma mel se mantiene en float16 sin tocar.

El autor reporta verificaciones de fidelidad frente a PyTorch mediante las pruebas integradas de `whisperkittools`: PSNR de 64,8 en el decoder de texto, 57,1 en el encoder de audio y 67,6 en el espectrograma mel. Los ficheros `config.json` y `generation_config.json` se copian sin cambios del modelo original. El tamaño resultante es de 648 MB para el encoder de audio y 910 MB para el decoder de texto, unos 1,56 GB en total frente a los aproximadamente 3,1 GB de la versión float16.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, alemán, neerlandés, español y francés, según los idiomas declarados.
- Transcripción local en dispositivo sobre Apple Silicon, ejecutándose en la Neural Engine mediante WhisperKit.
- Procesamiento por segmentos de audio de 30 segundos, con encadenamiento de segmentos para grabaciones más largas.
- Generación de marcas de tiempo y segmentación del texto, funcionalidad estándar de Whisper expuesta por WhisperKit.
- Traducción de voz al inglés (capacidad nativa de Whisper large-v3; no se documenta un ajuste específico en esta conversión).
- Integración con la API de WhisperKit en Swift para descarga del paquete y transcripción de ficheros de audio.
- No se documentan tool calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local en aplicaciones macOS, iOS e iPadOS: la app Sagt usa este paquete para transcribir en inglés y otros idiomas en modo «Accurate», sin enviar audio a servidores externos.
- Notas de reuniones y entrevistas: con un WER medio del 8,0 % en los diez conjuntos evaluados, es adecuado para generar actas y resúmenes posteriores a partir de audio grabado en Mac.
- Subtitulado de vídeo en cinco idiomas europeos: el modelo cubre en, de, nl, es y fr, lo que permite generar subtítulos para catálogos multilingües sin infraestructura de GPU en la nube.
- Dictado por voz en herramientas de productividad: la inferencia en la Neural Engine con un RTF medio de 0,21 (0,21 segundos de proceso por segundo de audio) permite dictado casi en tiempo real en hardware Apple reciente.
- Investigación en privacidad y cumplimiento: al ejecutarse íntegramente en dispositivo, sirve para escenarios donde el audio no puede salir del terminal del usuario (sanidad, legal, sector público).
- Prototipado rápido de pipelines ASR en Swift: la API de WhisperKit permite descargar el paquete y transcribir con pocas líneas de código, útil para validar productos de voz antes de invertir en infraestructura.
- Evaluación comparativa de cuantización: el paquete incluye métricas frente a float16, la variante de 947 MB y large-v3 turbo, lo que facilita decisiones de compromiso entre tamaño y precisión.

## Benchmarks y rendimiento

Resultados publicados por el autor con WhisperKit sobre la Neural Engine, 75 clips por conjunto, misma normalización y mismo código para todos los modelos (noviembre de 2026). WER en porcentaje; RTF en segundos de proceso por segundo de audio en un Mac (menor es mejor).

| Conjunto | large-v3 float16 (Argmax) | Este modelo, 8 bits | large-v3 947 MB (Argmax) | large-v3 turbo |
|---|---:|---:|---:|---:|
| FLEURS en | 5,0 | 4,9 | 6,1 | 5,8 |
| VoxPopuli en | 8,2 | 8,2 | 8,1 | 8,7 |
| FLEURS de | 4,8 | 5,3 | 4,4 | 5,3 |
| VoxPopuli de | 11,7 | 11,8 | 12,5 | 15,1 |
| FLEURS nl | 5,3 | 5,3 | 7,8 | 5,1 |
| VoxPopuli nl | 15,3 | 15,5 | 15,0 | 15,1 |
| FLEURS es | 2,6 | 2,6 | 2,9 | 3,0 |
| VoxPopuli es | 8,5 | 8,6 | 7,7 | 9,8 |
| FLEURS fr | 4,9 | 4,9 | 6,4 | 5,7 |
| VoxPopuli fr | 12,9 | 13,2 | 13,5 | 13,3 |
| **Media (10 conjuntos)** | **7,9** | **8,0** | **8,4** | **8,7** |
| RTF medio | 0,55 | 0,21 | 0,28 | 0,13 |

La cuantización int8 apenas degrada la precisión (7,9 % a 8,0 % de media) y reduce el RTF de 0,55 a 0,21, es decir, unas 2,6 veces más rápido que float16 en la Neural Engine. Frente a large-v3 turbo, este paquete es más preciso (8,0 % frente a 8,7 %) pero más lento (0,21 frente a 0,13 de RTF).

## Requisitos de hardware

- Inferencia exclusivamente sobre Apple Silicon (Neural Engine); el formato Core ML no es portable a GPU NVIDIA o AMD.
- Huella en disco: aproximadamente 1,56 GB (encoder 648 MB, decoder 910 MB), frente a unos 3,1 GB en float16.
- Memoria unificada: no se publica una cifra explícita de RAM necesaria; el tamaño del paquete sugiere que encaja en dispositivos Apple con al menos 4-8 GB de memoria unificada, aunque el dato no está confirmado en la información disponible.
- Hardware objetivo: Mac con chip M-series, iPhone y iPad recientes con Neural Engine. La app Sagt lo usa en esas plataformas.
- Despliegue: WhisperKit (Swift) mediante `WhisperKit.download` y `WhisperKitConfig(modelFolder:)`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan otros formatos de pesos.
- Rendimiento: RTF medio de 0,21 en un Mac (modelo no especificado en la model card), es decir, unas 4,8 veces más rápido que tiempo real en esa medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER medio (10 conjuntos) | RTF medio | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este modelo (large-v3 8-bit Core ML) | 1.550 M | 30 s por segmento | 8,0 % | 0,21 | Apache 2.0 | Core ML |
| openai/whisper-large-v3 float16 (Argmax) | 1.550 M | 30 s por segmento | 7,9 % | 0,55 | Apache 2.0 | Core ML |
| whisper-large-v3 947 MB (Argmax) | no disponible | 30 s por segmento | 8,4 % | 0,28 | Apache 2.0 | Core ML |
| whisper-large-v3 turbo | no disponible | 30 s por segmento | 8,7 % | 0,13 | Apache 2.0 | Core ML |

La comparación se limita a las variantes Core ML incluidas en la propia model card; no se dispone de datos de otros motores de inferencia (whisper.cpp, faster-whisper) en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todos los sesgos y errores de Whisper large-v3 de OpenAI.
- Solo se declaran cinco idiomas (en, de, nl, es, fr); el rendimiento fuera de ese conjunto no está evaluado en esta publicación.
- Riesgo de alucinación inherente a Whisper en audio con ruido, silencios largos o habla solapada; conviene aplicar detección de voz y filtros de silencio en producción.
- El WER en VoxPopuli neerlandés (15,5 %) y francés (13,2 %) es notablemente peor que en FLEURS, lo que refleja la sensibilidad al dominio y a la calidad de la grabación.
- Dependencia total del ecosistema Apple: no se puede desplegar en servidores Linux con GPU NVIDIA ni en contenedores sin macOS.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a OpenAI y revisar los términos del modelo base.
- Repositorio con cero descargas y creado en noviembre de 2026: no hay evidencia de uso en producción fuera de la app del autor.
- Las métricas de RTF dependen del Mac empleado, que no se especifica; los valores no son directamente extrapolables a iPhone o iPad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selbyggen/whisper-large-v3-coreml
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- App Sagt: https://sagtapp.com/
