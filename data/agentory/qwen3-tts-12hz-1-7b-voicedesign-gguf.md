# agentory/Qwen3-TTS-12Hz-1.7B-VoiceDesign-GGUF

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign es un modelo de sintesis de voz (text-to-speech) desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta corresponde a la conversion a formato GGUF realizada por el usuario `agentory`, pensada para su uso con `qwen3-tts.cpp`, un fork del motor de inferencia `predict-woo/qwen3-tts.cpp` que permite ejecutar el modelo en C++ sin depender del stack de PyTorch.

El modelo base emplea una arquitectura end-to-end de lenguaje discreto multi-codebook, apoyada en el tokenizador acustico propio Qwen3-TTS-Tokenizer-12Hz, que comprime el audio a 12 Hz y evita los cuellos de botella de los pipelines TTS tradicionales (texto a fonemas a mel a vocoder). La variante VoiceDesign esta orientada al control de la voz mediante instrucciones en lenguaje natural, permitiendo ajustar timbre, emocion y prosodia sin necesidad de una muestra de referencia.

Con 1.916 millones de parametros y un peso de repositorio de 2,4 GB, es un modelo compacto que cabe en GPU de consumo y que cubre diez idiomas principales, entre ellos el espanol. Su relevancia actual radica en que combina generacion por streaming de baja latencia (hasta 97 ms en el modelo original) con licencia Apache 2.0, lo que facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook end-to-end con tokenizador acustico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 (1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0 |
| Idiomas soportados | 10 idiomas principales: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, mas perfiles dialectales |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales en safetensors en el repo base |
| Tamano del repositorio | 2,4 GB |
| Pipeline | text-to-speech |
| Libreria | qwen-tts |
| Latencia de streaming | hasta 97 ms (segun model card del modelo base) |
| Frecuencia del tokenizador | 12 Hz |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura universal end-to-end basada en un modelo de lenguaje discreto con multiples codebooks. En lugar de generar formas de onda o espectrogramas de forma directa, el sistema predice tokens acusticos discretos producidos por el Qwen3-TTS-Tokenizer-12Hz, un tokenizador propio que combina compresion acustica eficiente con modelado semantico de alta dimension. Esta aproximacion elimina los clasicos cuellos de botella de informacion de los pipelines TTS en cascada y permite una sintesis completamente diferenciable de extremo a extremo.

La variante VoiceDesign anade la capacidad de controlar la generacion mediante instrucciones en lenguaje natural, de modo que el usuario puede especificar timbre, emocion y prosodia en el prompt. El modelo base esta disenado para generacion zero-shot y clonacion de voz; la model card reporta resultados en el conjunto de test Seed-TTS. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni del detalle de las etapas de alineacion o ajuste por preferencias.

La conversion a GGUF la realiza el script `scripts/convert_tts_to_gguf.py` del repositorio `qwen3-tts.cpp`, que transforma los pesos originales de `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign` a un grafo compatible con el motor en C++. Solo se publican dos precisiones: F16 y Q8_0.

## Capacidades

- Sintesis de voz de alta calidad a partir de texto en diez idiomas, incluido el espanol.
- Control de voz por instrucciones en lenguaje natural: timbre, emocion y prosodia (variante VoiceDesign).
- Clonacion de voz zero-shot (capacidad de la familia Qwen3-TTS; la model card de la variante CustomVoice muestra el flujo `generate_custom_voice`).
- Generacion por streaming con latencia extremo a extremo de hasta 97 ms en el modelo original.
- Perfiles de voz dialectales adicionales a los diez idiomas principales.
- Inferencia en C++ mediante `qwen3-tts.cpp`, sin dependencia de PyTorch en tiempo de ejecucion.
- No se documenta en la informacion disponible soporte de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo especializado en TTS.

## Casos de uso

- Narracion y audiolibros: el modelo puede generar locuciones largas en espanol con control de emocion y prosodia mediante instrucciones, manteniendo un timbre consistente a lo largo de la narracion.
- Asistentes de voz embebidos: gracias a su tamano de 1,92 B de parametros y a las cuantizaciones GGUF F16/Q8_0, puede desplegarse en dispositivos con recursos limitados usando `qwen3-tts.cpp` como motor de inferencia en C++.
- Generacion de voz para videojuegos y contenido interactivo: la latencia de streaming de hasta 97 ms del modelo base permite respuestas habladas casi inmediatas, adecuadas para dialogos en tiempo real.
- Localizacion de contenido multimedia: con soporte para diez idiomas, un mismo pipeline puede producir doblajes en espanol, ingles, frances, aleman, etc., a partir del texto traducido.
- Accesibilidad: conversion de texto a voz para lectores de pantalla y aplicaciones de asistencia, con control del tono y la velocidad mediante instrucciones en lenguaje natural.
- Prototipado rapido de productos TTS: la licencia Apache 2.0 y el formato GGUF permiten integrar el modelo en demos y pruebas de concepto sin coste de licencia ni infraestructura GPU dedicada.
- Investigacion en sintesis de voz: al ser una conversion GGUF de un modelo abierto, sirve como base para experimentos de cuantizacion y optimizacion de inferencia en C++.

## Benchmarks y rendimiento

La model card del modelo base reporta resultados de generacion zero-shot en el conjunto de test Seed-TTS, medidos como Word Error Rate (WER, menor es mejor):

| Modelo | test-zh | test-en |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0,77 | 1,24 |

No se han publicado en la informacion disponible resultados de benchmarks para la variante VoiceDesign ni para las cuantizaciones GGUF de este repositorio.

## Requisitos de hardware

- VRAM estimada: con pesos F16 el modelo ocupa aproximadamente 3,8 GB (1,92 B de parametros a 16 bits); con Q8_0, alrededor de 2 GB. A esto hay que sumar el estado de inferencia y los buffers de audio, por lo que conviene reservar entre 1 y 2 GB adicionales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para F16 y 4 GB para Q8_0; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: si, en tarjetas de gama media con 6-8 GB de VRAM o mas.
- Opciones de despliegue: `qwen3-tts.cpp` (motor C++ para el que estan pensadas estas cuantizaciones GGUF) y el paquete Python `qwen-tts` con los pesos originales en safetensors. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el modelo base declara una latencia de streaming de hasta 97 ms; no se dispone de cifras de throughput para las versiones GGUF.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos TTS comparables (parametros, contexto, benchmarks o licencia), por lo que la comparativa se limita a las variantes de la propia familia Qwen3-TTS:

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-VoiceDesign (este repo, GGUF) | 1,92 B | Control de voz por instrucciones, formato GGUF | Apache 2.0 | HuggingFace (agentory) |
| Qwen3-TTS-12Hz-1.7B-Base | no disponible | Generacion zero-shot | Apache 2.0 | HuggingFace (Qwen) |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | no disponible | Voz personalizada con hablante predefinido | Apache 2.0 | HuggingFace (Qwen) |

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos del modelo; como todo sistema entrenado con datos de voz, puede reproducir sesgos de genero, edad o acento presentes en el corpus.
- Riesgo de alucinacion acustica: en TTS, el equivalente son artefactos, prosodia incorrecta o pronunciacion erronea de palabras poco frecuentes o de nombres propios.
- El soporte de espanol esta declarado entre los diez idiomas, pero no se aportan metricas especificas de calidad en espanol.
- No se documenta la longitud maxima de texto de entrada ni el contexto del modelo.
- Las cuantizaciones disponibles se limitan a F16 y Q8_0; no hay versiones de 4 bits, lo que limita el ahorro de memoria.
- El motor `qwen3-tts.cpp` es un fork de terceros (`khimaros/qwen3-tts.cpp` sobre `predict-woo/qwen3-tts.cpp`), no un runtime oficial de Qwen; conviene validar su estabilidad antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las implicaciones legales de la clonacion de voz en su jurisdiccion.
- El repositorio es una conversion de terceros con solo 50 descargas y 0 likes en el momento de la consulta; no cuenta con el respaldo directo del equipo Qwen.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/agentory/Qwen3-TTS-12Hz-1.7B-VoiceDesign-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Coleccion Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Coleccion Qwen3-TTS en ModelScope: https://modelscope.cn/collections/Qwen/Qwen3-TTS
- Blog de Qwen3-TTS: https://qwen.ai/blog?id=qwen3tts-0115
- Paper (arXiv 2601.15621): https://huggingface.co/papers/2601.15621
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3-TTS
- Motor de inferencia C++ (fork usado): https://github.com/khimaros/qwen3-tts.cpp
- Motor de inferencia C++ original: https://github.com/predict-woo/qwen3-tts.cpp
