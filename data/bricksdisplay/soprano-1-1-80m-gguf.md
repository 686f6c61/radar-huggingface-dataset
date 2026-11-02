# BricksDisplay/Soprano-1.1-80M-GGUF

## Resumen

Soprano 1.1 80M es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado originalmente por el usuario ekwek y distribuido en formato GGUF por BricksDisplay. Se trata de un modelo extremadamente compacto —30,3 millones de parámetros reales en safetensors, pese a la denominación comercial "80M"— que genera audio a 32 kHz, una frecuencia de muestreo superior a la habitual en modelos de este tamaño. Su relevancia radica en la combinación de latencia muy baja, huella de memoria mínima (67 MB en la configuración más pequeña) y ejecución completamente offline en CPU o GPU.

La particularidad técnica de esta distribución es que el modelo se reparte en dos ficheros GGUF complementarios: un backbone de lenguaje (el modelo TTS propiamente dicho, ejecutado por llama.cpp) y un codec de audio (decoder, vocoder, encoders de hablante y adaptador, ejecutado por codec.cpp). Ambos grafos se conectan en tiempo de ejecución mediante herramientas como `tts-cli`, el paquete Python `codec_cpp` o la librería llama.rn para iOS y Android.

El modelo está pensado para entornos con recursos muy limitados, aplicaciones móviles y despliegues embebidos donde un TTS de mayor tamaño sería inviable. Su licencia Apache 2.0 facilita la integración comercial, aunque su alcance se limita al inglés y a una única voz integrada sin selección ni clonación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje autorregresivo para TTS + codec de audio separado (decoder/vocoder, encoders de hablante y adaptador); detalles internos de la arquitectura no disponibles |
| Parametros totales | 30.354.690 (safetensors del modelo base); el nombre comercial indica 80M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 (backbone y codec por separado); codec también en F32 y Q5_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone + codec); modelo base original presumiblemente en safetensors |
| Frecuencia de muestreo de salida | 32 kHz |
| Tamano del repo | 4,5 GB |
| Voces | Una única voz integrada; sin selección ni clonación |
| Sampling recomendado | temperature 0 (greedy), top-p 0.95, repetition penalty 1.2, ventana de repetición completa |

## Arquitectura y entrenamiento

La distribución GGUF separa el sistema en dos grafos computacionales. El backbone es un modelo de lenguaje autorregresivo que predice tokens o embeddings de audio a partir del texto de entrada, y se ejecuta sobre llama.cpp con un tokenizer específico de Soprano (parcheado en las builds de codec.cpp y llama.rn, no presente en llama.cpp upstream). El codec contiene la parte acústica: decoder, vocoder, encoders de hablante y el adaptador que conecta ambos mundos, y se ejecuta sobre codec.cpp. La decodificación puede ser por tokens discretos o por embeddings continuos, según el flujo (`continuous_embd` o `audio_tokens`) que expone la API.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica que el texto de entrada debe limpiarse previamente (números, fechas y abreviaturas escritos como palabras), tarea que el Soprano original realiza antes de la síntesis. El sampling recomendado es greedy con top-p 0.95 y penalización de repetición de 1.2, coherente con el código de inferencia original.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida de audio a 32 kHz.
- Generación por streaming: la API `tts.stream(text)` produce audio a medida que se genera.
- Ejecución completamente offline en CPU y GPU (CUDA, Vulkan, Metal).
- Integración en Python mediante el paquete `codec_cpp` (compila codec.cpp con llama.cpp embebido).
- Integración en React Native (iOS y Android) mediante llama.rn, con `initVocoder` y decodificación de embeddings o tokens de audio.
- Interfaz de línea de comandos (`tts-cli`) con opciones de sampling, GPU y salida WAV.
- Servidor TTS (`tts-server`) para despliegues como servicio.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo especializado exclusivamente en TTS.
- No soporta clonación de voz ni selección entre múltiples voces en esta variante.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Lectura de notificaciones y accesibilidad en aplicaciones móviles: con 67 MB en la configuración Q4_K_M y ejecución en CPU, el modelo cabe holgadamente en un dispositivo iOS o Android y puede sintetizar mensajes cortos sin conexión mediante llama.rn.
- Asistentes de voz embebidos en dispositivos de bajo consumo: la variante Q8_0 (118 MB en total) ofrece un equilibrio razonable entre calidad y huella, ejecutable en Raspberry Pi o SoCs ARM sin GPU dedicada.
- Generación de audiolibros o contenido narrado por lotes: el modo streaming y la CLI permiten procesar grandes volúmenes de texto en pipelines automatizados, con salida WAV a 32 kHz lista para postprocesado.
- Pruebas de integración continua de sistemas de voz: al ser determinista (greedy, temperature 0), los resultados son reproducibles, lo que facilita tests de regresión en pipelines de CI/CD.
- Prototipado rápido de interfaces conversacionales: el paquete Python `codec_cpp` permite levantar un TTS funcional en pocas líneas para validar productos antes de invertir en modelos mayores.
- Servicios de lectura de textos cortos en servidores sin GPU: `tts-server` sobre CPU cubre casos de baja concurrencia (lectura de artículos, resúmenes, avisos) con latencia aceptable dado el tamaño del modelo.
- Demos y entornos educativos: el reducido tamaño y la licencia Apache 2.0 lo hacen adecuado para enseñar pipelines TTS completos sin infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las configuraciones; la más pequeña (Q4_K_M, backbone + codec) ocupa 67 MB en disco y una fracción similar en memoria al cargar.
- Configuración recomendada: Q8_0 backbone + codec Q8_0, 118 MB totales.
- Configuración de máxima calidad: F16 backbone + codec F16, 220 MB totales.
- GPU recomendadas: cualquier GPU con soporte CUDA, Vulkan o Metal; el modelo es tan pequeño que incluso iGPU y GPUs de gama baja son suficientes. No requiere A100 ni H100.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, iGPU Intel/AMD) y en CPU exclusivamente.
- Opciones de despliegue: `tts-cli` y `tts-server` de codec.cpp, paquete Python `codec_cpp`, llama.rn (React Native). Requiere builds de llama.cpp con el tokenizer de Soprano (codec.cpp o llama.rn), no llama.cpp estándar.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo (30M parámetros) se espera latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Soprano 1.1 80M (esta ficha) | 30,3M reales | No disponible | Inglés | Apache 2.0 | GGUF (backbone + codec) | TTS offline, 32 kHz, una voz |
| Piper TTS | No disponible | No aplica | Múltiples | MIT (motores) / varias por voz | ONNX | TTS ligero para embebidos, ecosistema amplio de voces |
| Coqui TTS (XTTS v2) | No disponible | No aplica | Multilingüe | Coqui Public Model License (no comercial en algunos casos) | PyTorch | Clonación de voz, mayor peso computacional |
| Kokoro TTS | 82M | No aplica | Inglés y otros | Apache 2.0 | PyTorch/ONNX | TTS compacto de alta calidad, comparable en tamaño |

La comparación con Piper y Kokoro es la más directa por tamaño y orientación a despliegues ligeros; XTTS v2 se incluye como referencia de mayor capacidad (clonación, multilingüismo) a costa de más recursos y licencia más restrictiva. No se dispone de datos de benchmarks que permitan comparar calidad objetivamente.

## Limitaciones y advertencias

- Solo soporta inglés; el texto en otros idiomas producirá resultados incorrectos o ininteligibles.
- Una única voz integrada: no hay selección de voz ni clonación en esta variante, lo que limita casos de uso que requieran variedad de hablantes.
- Entrada pensada para una o dos frases por ejecución; textos largos deben dividirse y concatenarse externamente.
- Requiere limpieza previa del texto (números, fechas y abreviaturas escritos como palabras); el pipeline GGUF no la aplica automáticamente.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o ruidos en entradas atípicas.
- Requiere builds parcheadas de llama.cpp (codec.cpp o llama.rn); llama.cpp estándar no reconoce el tokenizer de Soprano y fallará al cargar el backbone.
- Los sesgos del modelo dependen del dataset de entrenamiento original, no documentado en la información disponible; no se pueden evaluar sesgos específicos de género, acento o dialecto.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base original (ekwek/Soprano-1.1-80M), que la model card indica como idéntica.
- El nombre "80M" no coincide con los 30,3M de parámetros reales del safetensors; conviene usar las cifras reales para estimaciones de memoria y cómputo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/BricksDisplay/Soprano-1.1-80M-GGUF
- Modelo base original: https://huggingface.co/ekwek/Soprano-1.1-80M
- codec.cpp (runtime de audio): https://github.com/mybigday/codec.cpp
- Documentación Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.rn (React Native): https://github.com/mybigday/llama.rn
- Documentación TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
- llama.cpp: https://github.com/ggml-org/llama.cpp
