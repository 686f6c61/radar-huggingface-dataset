# GhaythMahadin/gigaam-v3-e2e-ctc-gguf

## Resumen

GigaAM-v3-e2e-ctc-gguf es una conversión al formato GGUF del modelo ai-sage/GigaAM-v3, un sistema de reconocimiento automático del habla (ASR) en ruso desarrollado por el equipo de Salute Developers (ai-sage). Esta conversión concreta la mantiene GhaythMahadin y está pensada para su uso con transcribe.cpp, un motor de inferencia en C++ centrado en modelos de transcripción. El modelo resuelve transcripción offline de audio en ruso con salida ya puntuada y normalizada, sin necesidad de un modelo de lenguaje externo.

La arquitectura es un encoder Conformer de 16 capas con una cabeza CTC implementada como convolución 1×1 (Conv1d) y un tokenizador SentencePiece de 256 piezas. Con unos 220,9 millones de parámetros, es un modelo compacto que cabe holgadamente en hardware de consumo, incluso en las cuantizaciones más agresivas (174 MB en Q4_K_M). La variante e2e_ctc se distingue de la ctc básica por producir texto con mayúsculas, puntuación y normalización directamente.

Su relevancia actual radica en la combinación de tres factores: un rendimiento muy alto en ruso (WER de 5,50 % en FLEURS ru medido con esta conversión), un tamaño reducido que permite ejecución local en CPU y GPU integradas, y una licencia MIT que facilita su integración comercial. La decodificación es CTC voraz (greedy), sin modelo de lenguaje externo, lo que simplifica el despliegue a costa de algo de precisión frente a variantes RNN-T.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con cabeza CTC Conv1d 1×1 |
| Parametros totales | 220.889.985 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio, no de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 es un encoder Conformer de 220–240 millones de parámetros preentrenado con el objetivo HuBERT-CTC sobre 700.000 horas de audio en ruso. La familia incluye variantes ssl (encoder auto-supervisado), ctc, rnnt, e2e_ctc y e2e_rnnt; esta conversión corresponde a e2e_ctc, que añade puntuación y normalización de texto de extremo a extremo. La cabeza de salida es una CTC implementada como convolución 1×1 sobre las representaciones del encoder, y la decodificación es CTC voraz sin modelo de lenguaje externo.

El entrenamiento incorpora nuevos conjuntos internos respecto a generaciones anteriores: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según el autor del modelo base, el rendimiento en estos dominios nuevos mejora de media un 30 % manteniendo la calidad en benchmarks públicos. La conversión GGUF está anclada al commit cec030b del modelo base (fijado el 2026-05-12) y validada contra el paquete de referencia del autor en el commit 42b96d9 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en ruso con salida en mayúsculas y minúsculas, puntuación y normalización de texto.
- Decodificación CTC voraz (greedy) sin modelo de lenguaje externo.
- Tokenización con SentencePiece de 256 piezas.
- Marcas de tiempo a nivel de token (timestamps: token).
- Ejecución offline completa, sin llamadas a servicios externos.
- Aceleración por Metal (Apple Silicon) y Vulkan (GPU integradas y discretas), además de CPU.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR, no un LLM).

## Casos de uso

- Transcripción de reuniones y entrevistas en ruso: el modelo procesa audio de 16 kHz mono y devuelve texto puntuado directamente, lo que elimina el postprocesado de puntuación y mayúsculas en actas y notas.
- Subtitulado de contenido audiovisual en ruso: con marcas de tiempo a nivel de token se pueden generar subtítulos sincronizados; la cuantización Q8_0 (260 MB) permite ejecutarlo en un portátil mientras se procesa el vídeo.
- Atención al cliente y análisis de call centers: el modelo base fue entrenado específicamente con conversaciones de call center, donde la variante ctc alcanza un WER de 10,3 % frente al 23,9 % de Whisper, lo que lo hace adecuado para transcribir y auditar llamadas.
- Aplicaciones de accesibilidad para hablantes de ruso: transcripción local en tiempo casi real sobre CPU (RTF de 9 en Ryzen 4750U) sin enviar audio a la nube, relevante por privacidad.
- Procesamiento por lotes en servidores sin GPU: la versión Q4_K_M (174 MB) y el RTF de 27 en CPU en un M4 Max permiten transcribir grandes volúmenes de archivos en máquinas modestas.
- Integración en pipelines de datos y archivística: transcripción de archivos históricos de audio en ruso para indexación y búsqueda, ejecutable de forma totalmente offline con transcribe.cpp.
- Prototipado y evaluación de ASR en dispositivos embebidos: el reducido tamaño y el soporte de Vulkan facilitan desplegar el modelo en equipos con GPU integrada.

## Benchmarks y rendimiento

WER medido sobre el split de test completo de FLEURS ru (775 enunciados), decodificación voraz sin LM externo:

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 843 MB | 5,50 % |
| F16 | 428 MB | 5,50 % |
| Q8_0 | 260 MB | 5,50 % |
| Q6_K | 216 MB | 5,56 % |
| Q5_K_M | 195 MB | 5,58 % |
| Q4_K_M | 174 MB | 5,57 % |

Comparación por dominios del modelo base GigaAM-v3 (WER %):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| Media | 9,2 | 8,4 | 19,4 | 25,1 |

Rendimiento de inferencia (RTF, menor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 112 |
| Apple M4 Max | CPU | 27 |
| Ryzen 4750U | Vulkan | 30 |
| Ryzen 4750U | CPU | 9 |

Nota: el paquete de referencia del autor mide 6,93 % en el mismo manifiesto; la diferencia de 1,4 pp se debe a que el paquete original rechaza 5 enunciados largos (>25 s) contabilizándolos como errores de borrado. En el subconjunto de 770 enunciados que ambos decodifican, transcribe.cpp coincide exactamente con el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER ruso (media) | Licencia | Formato |
|---|---|---:|---:|---|---|
| GigaAM-v3 e2e_ctc (este) | ~221 M | ventana de audio, no disponible | 9,2 (CTC) | MIT | GGUF, safetensors |
| GigaAM-v3 e2e_rnnt | ~221 M | ventana de audio, no disponible | 8,4 (RNNT) | MIT | safetensors |
| T-One + LM | no disponible | no disponible | 19,4 | no disponible | no disponible |
| Whisper (large-v3) | no disponible | 30 s por ventana | 25,1 | MIT | safetensors, GGUF |

## Limitaciones y advertencias

- Solo soporta ruso; no hay detección de idioma ni traducción, por lo que audio en otros idiomas producirá transcripciones incorrectas.
- No soporta streaming: debe procesarse el audio completo (o segmentado manualmente) antes de obtener la salida.
- La decodificación CTC voraz sin LM externo puede ser menos precisa que la variante e2e_rnnt (9,2 % frente a 8,4 % de WER medio en el modelo base).
- Riesgo de alucinación y errores en audio con ruido, música de fondo o habla atípica; el WER sube al 20,6 % en habla con trastornos y al 7,8 % en habla natural.
- El modelo base rechaza en su paquete original audios de más de 25 segundos sin usar transcribe_longform; conviene segmentar audios largos.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertirlo previamente con herramientas como ffmpeg.
- Aunque la licencia es MIT, el modelo base es de ai-sage y la model card original es la fuente autoritativa de los términos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado fuera de las pruebas del autor.
- Depende de transcribe.cpp, una librería emergente; la compatibilidad con otros motores (llama.cpp, vLLM) no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/gigaam-v3-e2e-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base: https://huggingface.co/ai-sage/GigaAM-v3/commit/cec030b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-ctc.md
- Repositorio GigaAM (Salute Developers): https://github.com/salute-developers/GigaAM
- Métricas de evaluación: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper (arXiv): https://arxiv.org/abs/2506.01192
