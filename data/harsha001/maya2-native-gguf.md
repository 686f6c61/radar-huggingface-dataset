# Harsha001/Maya2-Native-GGUF

## Resumen

Maya2-Native-GGUF es una distribucion en formato GGUF del modelo maya-research/maya2-native, un sistema de sintesis de voz (text-to-speech) multilingue orientado a lenguas indicas. Lo publica el usuario Harsha001 y esta pensado para ejecutarse sobre ROCmFPX, un fork de llama.cpp con runtime nativo en C++ (ggml), sin dependencias de Python ni PyTorch. El modelo base lo desarrolla maya-research y la cuantizacion anade pesos con escalas por tensor para GPU AMD.

El sistema completo no es un unico transformer: se compone de un backbone Qwen3 de 28 capas que predice el primer code de cada frame de audio, un decodificador de profundidad con 44 capas pequenas agrupadas en 11 bloques que predice los codes 1 a 31, y el decodificador neuronal Mimi de Kyutai que convierte los 32 codes por frame en audio a 24 kHz. El backbone declarado tiene 1.812.042.752 parametros y el repositorio ocupa 13,6 GB entre todas las variantes.

Su relevancia practica esta en que permite TTS indico de alta calidad en hardware de consumo y en equipos AMD Strix Halo mediante Vulkan, con velocidades superiores al tiempo real (unas 3,2 veces en una NVIDIA GB10 con CUDA y Q4_K_M). Cubre doce idiomas (asames, bengali, ingles, gujarati, hindi, kannada, malayalam, marathi, oriya, punyabi, tamil y telugu) y veinte voces predefinidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3 (28 capas) + decodificador de profundidad (44 capas en 11 grupos) + codec neuronal Mimi (Kyutai) |
| Parametros totales | 1.812.042.752 (backbone, dato de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_0 (ROCmFP4-FAST para Strix Halo); mmproj en BF16 y Q8_0 |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te |
| Licencia | Apache 2.0 (modelo); Mimi bajo CC-BY 4.0; runtime MIT |
| Formato de pesos | GGUF (llama.cpp / ROCmFPX) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en tres etapas. El backbone, basado en Qwen3 con 28 capas, procesa el texto de entrada y predice el code 0 de cada frame de audio. A continuacion, el decodificador de profundidad, formado por 44 capas transformer pequenas organizadas en 11 grupos, predice los codes 1 a 31 del mismo frame. Finalmente, el decodificador Mimi de Kyutai transforma los 32 codes por frame en una forma de onda de 24 kHz. El modelo genera 12,5 frames de audio por segundo.

La model card de esta distribucion no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se emplearon tecnicas de RLHF o DPO; esa informacion corresponderia al modelo base maya-research/maya2-native. La innovacion tecnica de esta publicacion es la cuantizacion con escalas por tensor para ROCmFPX, que mantiene alta fidelidad respecto a la referencia PyTorch: con Q8_0 la similitud coseno de logits del backbone es 0,9997 y coincide la eleccion top en 54 de 55 frames; con Q4_K_M baja a 0,986 y 50 de 55. La decodificacion es por muestreo (admite semilla fija con `-s`), con los ajustes de muestreo y la regla de parada heredados del motor de referencia.

## Capacidades

- Sintesis de voz multilingue en doce idiomas: asames, bengali, ingles, gujarati, hindi, kannada, malayalam, marathi, oriya, punyabi, tamil y telugu.
- Veinte voces predefinidas seleccionables mediante el prefijo `{Nombre}:` en el prompt: Ahana, Vaidehi, Malini, Charvi, Jahnavi, Anirban, Nakul, Vasant, Siddhant, Satvik, Abhay, Nivedita, Ishwari, Ritvik, Vrinda, Sreekar, Kayal, Shaunak, Akshat y Tanushree (por defecto Ahana).
- Generacion de audio a 24 kHz mediante el codec Mimi.
- Reproducibilidad del audio con semilla fija (`-s <seed>`).
- Ejecucion nativa en C++ sobre CPU, Vulkan (incluida AMD Strix Halo) y CUDA.
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion disponible.
- No se documenta modo thinking ni procesamiento de audio de entrada (es un modelo TTS, no ASR).

## Casos de uso

- Locucion automatica de articulos y noticias en lenguas indicas: el modelo sintetiza texto en hindi, tamil, bengali y otras lenguas con voces naturales, adecuado para medios digitales que publican en varios idiomas sin plantilla de locutores.
- Audiolibros y contenido accesible: con veinte voces y semilla fija se pueden generar narraciones consistentes y reproducibles por capitulo, manteniendo la misma voz a lo largo de una obra.
- Asistentes de voz para atencion al cliente en India: permite respuestas habladas en el idioma del usuario (p. ej. marathi o telugu) sobre infraestructura sin GPU dedicada, al poder ejecutarse en CPU o Vulkan.
- Sistemas de anuncios y avisos publicos: la generacion a 24 kHz y mas rapida que el tiempo real (3,2x en GB10 con Q4_K_M) permite pregenerar o sintetizar bajo demanda mensajes en doce idiomas.
- Integracion en aplicaciones de escritorio o embebidas: al ser runtime C++ sin Python ni PyTorch, encaja en productos donde no se quiere arrastrar un stack de ML pesado, incluidas maquinas AMD Strix Halo.
- Prototipado e investigacion en TTS indico: las variantes cuantizadas (Q8_0, Q6_K, Q4_0) y la tabla de fidelidad frente a PyTorch permiten evaluar el impacto de la cuantizacion en la calidad del audio con coste de hardware bajo.
- Doblaje y localizacion de contenido formativo: sintesis de guiones en varias lenguas indicas con una voz coherente por personaje, usando el prefijo de nombre para asignar voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el modelo es de sintesis de voz y la model card reporta metricas de fidelidad de cuantizacion y velocidad.

| Backbone / mmproj | Coseno logits backbone | Coseno logits depth | Coseno audio | Coincidencias top |
|---|---|---|---|---|
| F32 / F32 | 0,9999998 | 0,9999999 | 0,9999999 | 55 / 55 |
| BF16 / BF16 | 0,999997 | 0,99999 | 0,9999995 | 55 / 55 |
| Q8_0 / Q8_0 | 0,9997 | 0,9995 | 0,99999 | 54 / 55 |
| Q4_K_M / Q8_0 | 0,986 | 0,994 | 0,99999 | 50 / 55 |

Mediciones adicionales reportadas: en una NVIDIA GB10 con CUDA y Q4_K_M se alcanzan unas 40 frames por segundo, 3,2 veces mas rapido que el tiempo real. Con Whisper se verifico la transcripcion palabra por palabra de la salida en ingles para todas las cuantizaciones; en los ficheros ROCmFPX con mmproj Q8_0 y semilla 1 en CPU, Whisper transcribio correctamente dos frases en ingles desde BF16, 6 bits y 4 bits de Strix, y desde el fichero de 8 bits sustituyo "The" por "With" (2 de 37 palabras). No se repitio la tabla de teacher forcing para los ficheros ROCmFPX.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,7 GB con backbone Q8_0 (1,9 GB) mas mmproj Q8_0 (0,8 GB); unos 2,1 GB con Q6_K; unos 2,1 GB con Q4_0 para Strix Halo; unos 5,1 GB en BF16 (3,6 GB + 1,5 GB).
- GPU recomendadas: AMD Strix Halo mediante Vulkan (objetivo declarado, con variante Q4_0 ROCmFP4-FAST); NVIDIA con CUDA (medido en GB10); cualquier GPU compatible con Vulkan.
- Cabe en GPU de consumo: si, con las variantes Q8_0, Q6_K y Q4_0, que requieren del orden de 2-3 GB de memoria.
- Opciones de despliegue: ROCmFPX (fork de llama.cpp) con el binario `llama-tts`, compilado con `-DGGML_VULKAN=ON` o CUDA; al ser GGUF es compatible con el ecosistema llama.cpp, aunque las variantes ROCmFPX requieren el fork por sus escalas por tensor.
- Latencia y throughput: unas 40 frames/s en GB10 con CUDA y Q4_K_M (3,2x tiempo real); el modelo produce 12,5 frames de audio por segundo. No hay cifras publicadas de Strix Halo Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Maya2-Native-GGUF (esta ficha) | 1.812.042.752 (backbone) | No disponible | 12 (indic + en) | Apache 2.0 | GGUF |
| maya-research/maya2-native | No disponible | No disponible | 12 (indic + en) | Apache 2.0 | No disponible |
| kyutai/mimi | No disponible (codec) | No aplica | No disponible | CC-BY 4.0 | No disponible |
| Alternativas TTS indicas de referencia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos TTS comparables; la comparativa se limita a la relacion con el modelo base y el codec Mimi, que forma parte del pipeline.

## Limitaciones y advertencias

- Riesgo de errores de pronunciacion o sustituciones de palabras: en la verificacion con Whisper, el fichero ROCmFPX de 8 bits produjo "With a quick brown fox" en lugar de "The quick brown fox" (2 de 37 palabras); la salida es muestreada y varia entre ficheros aunque se use la misma semilla.
- No se han publicado evaluaciones de sesgo; al entrenarse sobre corpus indicos, es esperable que refleje sesgos linguisticos y de hablantes del dataset original.
- La fidelidad de las cuantizaciones ROCmFPX no se ha validado con teacher forcing; solo se comprobo la transcripcion con Whisper en un conjunto reducido de frases.
- El alcance idiomatico esta limitado a los doce idiomas listados; no se documenta cobertura de otras lenguas ni de variantes dialectales.
- Las variantes ROCmFPX requieren el fork ROCmFPX de llama.cpp; no funcionan con llama.cpp estandar.
- Licencia Apache 2.0 para el modelo, pero el decodificador Mimi es CC-BY 4.0: en uso comercial debe respetarse la atribucion de Kyutai.
- No se documentan requisitos de contexto, limites de longitud de texto de entrada ni comportamiento con entradas muy largas.
- La model card incluye contenido promocional de otro modelo del mismo autor; no debe interpretarse como especificacion tecnica de este.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Maya2-Native-GGUF
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Codec Mimi: https://huggingface.co/kyutai/mimi
- Modelo promocionado en la model card: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
