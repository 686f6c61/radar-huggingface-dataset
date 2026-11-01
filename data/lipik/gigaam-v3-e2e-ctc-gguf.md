# lipik/gigaam-v3-e2e-ctc-gguf

## Resumen

GigaAM-v3-e2e-ctc-gguf es una conversión al formato GGUF del modelo ai-sage/GigaAM-v3, un sistema de reconocimiento automático del habla (ASR) especializado en ruso desarrollado por SberDevices (ai-sage). Esta conversión, publicada por el usuario lipik, permite ejecutar el modelo mediante transcribe.cpp, una implementación en C++ pensada para inferencia local y offline sin dependencias de Python. El modelo base forma parte de la tercera generación de la familia GigaAM y está diseñado para transcripción de voz a texto con puntuación y normalización de texto en ruso.

La arquitectura es un encoder Conformer de 16 capas con una cabeza CTC basada en una convolución 1×1, entrenado con el objetivo HuBERT-CTC sobre 700.000 horas de audio en ruso. Con 220.889.985 parámetros totales (aproximadamente 221 millones), el modelo es lo suficientemente compacto como para ejecutarse en hardware de consumo, incluso en CPU, lo que lo hace relevante para aplicaciones de transcripción local en dispositivos sin GPU dedicada.

La relevancia actual de esta ficha radica en que ofrece una alternativa ligera y de licencia MIT a modelos multilingües mucho más grandes como Whisper, con un rendimiento específico en ruso notablemente superior en dominios difíciles (habla natural, call centers, habla con características atípicas). La conversión GGUF facilita su integración en pipelines de producción sin necesidad de infraestructura de Python ni de GPUs de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (16 capas) con cabeza CTC Conv1d 1×1 |
| Parametros totales | 220.889.985 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, ventana de audio no especificada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 emplea una arquitectura Conformer de 16 capas como encoder, preentrenada con el objetivo HuBERT-CTC sobre 700.000 horas de audio en ruso. Posteriormente se afina con un decodificador CTC para la tarea de ASR. La variante `e2e_ctc` que se ha convertido aquí incorpora directamente puntuación y normalización de texto, de modo que la salida es texto en ruso con mayúsculas y signos de puntuación, decodificado a partir de un tokenizador SentencePiece de 256 piezas. La decodificación es greedy CTC, sin modelo de lenguaje externo.

El entrenamiento de GigaAM-v3 incorpora nuevos conjuntos de datos internos que incluyen conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según el autor del modelo base, esto supone una mejora media del 30% en estos dominios respecto a generaciones anteriores, manteniendo la misma calidad en benchmarks públicos. La conversión GGUF fue validada contra el paquete de referencia del autor en el commit 42b96d9 de transcribe.cpp, fijado el 2026-05-12, y portada desde el commit cec030b del modelo base.

## Capacidades

- Transcripción de voz a texto en ruso con decodificación CTC greedy.
- Salida con mayúsculas, puntuación y normalización de texto (variante end-to-end).
- Funcionamiento completamente offline, sin dependencias de red.
- Ejecución en CPU y GPU (Metal en Apple Silicon, Vulkan en GPUs AMD/Intel, CPU en x86).
- No soporta streaming (indicado explícitamente en la model card: `streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- Soporta timestamps a nivel de token (`timestamps: token`).
- No dispone de tool calling, function calling ni capacidades de agente (es un modelo ASR puro).
- No dispone de capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Transcripción de reuniones y actas en ruso: el modelo procesa audio de 16 kHz mono y genera texto con puntuación directamente, lo que facilita la generación de actas sin post-procesado adicional. Su licencia MIT permite integrarlo en herramientas internas sin restricciones.
- Subtitulado automático de vídeo en ruso: gracias a los timestamps a nivel de token, se pueden alinear los segmentos de texto con el audio para generar subtítulos SRT. La cuantización Q8_0 (260 MB) permite ejecutarlo en un portátil sin GPU.
- Atención al cliente y análisis de llamadas: el modelo base fue entrenado específicamente con datos de call centers y logra un WER del 10,3% (variante CTC) en ese dominio, muy por debajo de Whisper (23,9%). Se puede usar para transcribir y analizar conversaciones de soporte.
- Transcripción de habla con características atípicas: el modelo base reporta un WER del 20,6% en habla con trastornos del habla, frente al 59,3% de Whisper. Es adecuado para aplicaciones de accesibilidad.
- Procesamiento por lotes en servidores sin GPU: con la cuantización Q4_K_M (174 MB) y el backend CPU de transcribe.cpp, se pueden transcribir grandes volúmenes de audio en servidores convencionales con un rendimiento de 9× tiempo real en un Ryzen 4750U.
- Integración en aplicaciones de escritorio y móviles: el tamaño reducido del modelo (174-260 MB en cuantizaciones bajas) y la ausencia de dependencias de Python permiten embeberlo en aplicaciones nativas para dictado por voz offline en ruso.
- Investigación en ASR para ruso: al ser una conversión reproducible y validada contra el paquete de referencia, sirve como base para experimentos de cuantización y comparación de backends (Metal, Vulkan, CPU).

## Benchmarks y rendimiento

Resultados de WER en FLEURS ru (775 utterances, decodificación greedy, sin LM externo):

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 843 MB | 5,50% |
| F16 | 428 MB | 5,50% |
| Q8_0 | 260 MB | 5,50% |
| Q6_K | 216 MB | 5,56% |
| Q5_K_M | 195 MB | 5,58% |
| Q4_K_M | 174 MB | 5,57% |

Comparativa de WER (%) por dominio del modelo base GigaAM-v3 (variantes CTC y RNNT) frente a T-One + LM y Whisper:

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

Rendimiento de inferencia (factor de tiempo real, RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 112 |
| Apple M4 Max | CPU | 27 |
| Ryzen 4750U | Vulkan | 30 |
| Ryzen 4750U | CPU | 9 |

Nota: el WER de FLEURS ru no lo publica ai-sage; la cifra de 5,50% ha sido medida por el autor de la conversión. El paquete de referencia del autor obtiene 6,93% en el mismo manifiesto, diferencia atribuida a que el paquete original rechaza 5 utterances de más de 25 segundos (contabilizadas como errores de deleción al 100%). En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con el paquete de referencia.

## Requisitos de hardware

- VRAM estimada: entre 174 MB (Q4_K_M) y 843 MB (F32) para los pesos; el consumo adicional es mínimo al no haber decodificador autorregresivo ni KV cache de gran tamaño.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). No se requiere una GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria libre, e incluso en iGPUs.
- Cabe en CPU: sí, con un rendimiento de 9× tiempo real en un Ryzen 4750U y 27× en un M4 Max.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 112 en Metal (M4 Max), 30 en Vulkan (Ryzen 4750U), 27 en CPU (M4 Max) y 9 en CPU (Ryzen 4750U). Un RTF de 9 implica transcribir 9 segundos de audio por cada segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ruso (media dominios) | Licencia | Formato |
|---|---:|---|---:|---|---|
| GigaAM-v3 e2e_ctc (este) | ~221 M | no disponible | 9,2 (CTC) | MIT | GGUF |
| GigaAM-v3 rnnt | ~221-240 M | no disponible | 8,4 (RNNT) | MIT | safetensors |
| Whisper large-v3 | ~1.550 M | 30 s de audio | 25,1 | MIT | safetensors, GGUF |
| T-One + LM | no disponible | no disponible | 19,4 | no disponible | no disponible |

El modelo destaca por su relación calidad/tamaño: con aproximadamente una séptima parte de los parámetros de Whisper large-v3, obtiene un WER medio de 9,2% frente al 25,1% de Whisper en los dominios evaluados por ai-sage. La variante RNNT del modelo base es ligeramente superior (8,4%), pero esta conversión GGUF solo cubre la variante e2e_ctc.

## Limitaciones y advertencias

- Solo soporta ruso; no detecta idioma ni traduce, por lo que audio en otros idiomas producirá salidas incorrectas o vacías.
- No soporta streaming: debe procesarse audio completo (o segmentado manualmente), lo que limita su uso en aplicaciones de transcripción en vivo.
- El audio de entrada debe ser WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg u otra herramienta.
- Riesgo de alucinación y errores en audio con ruido extremo, solapamiento de hablantes o acentos muy marcados; el WER en habla con características atípicas es del 20,6%, notablemente superior a la media.
- La decodificación es greedy CTC sin modelo de lenguaje externo, lo que puede producir errores en palabras homófonas o nombres propios poco frecuentes.
- El modelo base rechaza utterances de más de 25 segundos en su paquete de referencia; en transcribe.cpp se procesan, pero no se especifica el comportamiento en audio muy largo.
- Aunque la licencia es MIT, debe verificarse la procedencia de los datos de entrenamiento del modelo base para usos comerciales sensibles.
- El repositorio tiene muy pocas descargas (26) y ningún like, por lo que la comunidad de validación es mínima; se recomienda validar el modelo en el dominio de producción antes de desplegarlo.
- No dispone de funcionalidades de agente, tool calling ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lipik/gigaam-v3-e2e-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base utilizado: https://huggingface.co/ai-sage/GigaAM-v3/commit/cec030b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-ctc.md
- Repositorio GigaAM (salute-developers): https://github.com/salute-developers/GigaAM
- Métricas de evaluación de GigaAM: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
- Descarga directa Q8_0: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q8_0.gguf
