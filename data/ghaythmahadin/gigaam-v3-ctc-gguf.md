# GhaythMahadin/gigaam-v3-ctc-gguf

## Resumen

GigaAM-v3-ctc-gguf es una conversión al formato GGUF del modelo ai-sage/GigaAM-v3, un sistema de reconocimiento automático del habla (ASR) especializado en ruso desarrollado por el equipo de Salute (Sber). Esta conversión concreta, publicada por GhaythMahadin, empaqueta la variante CTC del modelo para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia local y sin dependencias de Python. El modelo resuelve el problema de la transcripción de voz a texto en ruso con un enfoque offline, ligero y portable.

La arquitectura es un encoder Conformer de 16 capas con una cabeza CTC basada en una convolución 1x1, y cuenta con aproximadamente 220,7 millones de parámetros. El modelo produce texto en ruso en minúsculas, sin puntuación, con un vocabulario de 33 caracteres. Su relevancia radica en que ofrece una alternativa muy compacta (desde 174 MB en cuantización Q4_K_M) para transcripción en ruso, con un WER del 8,42 % en FLEURS ru, y sin necesidad de infraestructura GPU dedicada.

La conversión mantiene la licencia MIT del modelo base y está orientada a escenarios de despliegue en dispositivos de consumo, incluyendo CPU y aceleración Metal o Vulkan. No soporta streaming, traducción ni detección de idioma, y las marcas de tiempo son a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con cabeza CTC Conv1d 1x1 |
| Parametros totales | 220.718.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, ventana de audio no especificada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 es un modelo fundacional basado en Conformer con entre 220 y 240 millones de parámetros, preentrenado con el objetivo HuBERT-CTC sobre 700.000 horas de habla en ruso. La variante CTC aquí convertida ha sido ajustada finamente con un decodificador CTC y utiliza decodificación greedy. La conversión GGUF reproduce el encoder Conformer de 16 capas y la cabeza CTC, y ha sido validada contra el paquete de referencia del autor en el commit 42b96d9 de transcribe.cpp, fijado el 2026-05-12.

El entrenamiento del modelo base incorpora conjuntos de datos internos nuevos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según la model card original, los modelos de la familia GigaAM-v3 mejoran en promedio un 30 % en estos dominios nuevos manteniendo la calidad en los benchmarks públicos. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en ruso con decodificación CTC greedy.
- Salida en minúsculas y sin puntuación, con vocabulario de 33 caracteres.
- Marcas de tiempo a nivel de token.
- Inferencia offline sin dependencias de Python mediante transcribe.cpp.
- Ejecución en CPU y aceleración por Metal (Apple) y Vulkan.
- No soporta streaming.
- No soporta traducción.
- No soporta detección de idioma.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio más allá de la entrada de voz.

## Casos de uso

- Transcripción de reuniones y notas de voz en ruso: el modelo convierte audio de 16 kHz mono WAV en texto plano, adecuado para actas automáticas o indexación de contenido hablado en entornos donde no se puede enviar audio a la nube.
- Subtitulado y postproducción de vídeo en ruso: la salida con marcas de tiempo a nivel de token permite alinear el texto con el audio para generar subtítulos, aunque requiere un paso posterior de puntuación y capitalización.
- Atención al cliente y análisis de call centers: el modelo base fue entrenado específicamente con conversaciones de call center, por lo que es adecuado para transcribir grabaciones de soporte y alimentar sistemas de análisis de calidad o búsqueda.
- Despliegue en dispositivos de borde: con cuantizaciones de 174 a 259 MB, puede ejecutarse en portátiles y equipos sin GPU dedicada, lo que facilita aplicaciones de dictado o asistentes de voz locales en ruso.
- Investigación en ASR y evaluación de técnicas de cuantización: al ofrecer múltiples niveles de cuantización con WER comparable (8,29 % a 8,42 %), sirve como banco de pruebas para estudiar el impacto de la compresión en modelos Conformer.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la CLI de transcribe.cpp permite integrar la transcripción en scripts de automatización para grandes volúmenes de audio en ruso sin infraestructura de servidor.
- Aplicaciones de accesibilidad: transcripción local de voz a texto para personas con dificultades auditivas en contextos de habla rusa, con la ventaja de que los datos no salen del dispositivo.

## Benchmarks y rendimiento

Los datos de WER proceden de la model card del autor de la conversión y se midieron sobre el conjunto de test completo de FLEURS ru (775 enunciados) con decodificación greedy y sin LM externo.

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 842 MB | 8,42 % |
| F16 | 428 MB | 8,42 % |
| Q8_0 | 259 MB | 8,40 % |
| Q6_K | 216 MB | 8,38 % |
| Q5_K_M | 195 MB | 8,29 % |
| Q4_K_M | 174 MB | 8,42 % |

Comparativa con el paquete de referencia del autor y otros modelos sobre distintos dominios (WER %, datos de la model card original de GigaAM-v3):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| Promedio | 9,2 | 8,4 | 19,4 | 25,1 |

En FLEURS ru, el paquete del autor mide 9,81 % frente al 8,42 % de esta conversión; la diferencia de 1,4 puntos porcentuales se debe a que el paquete original rechaza 5 enunciados largos (más de 25 s) y los cuenta como errores de deleción al 100 %. En el subconjunto de 770 enunciados que ambos decodifican, transcribe.cpp coincide exactamente con el autor. ai-sage no publica un WER de FLEURS ru para este modelo.

Rendimiento de velocidad (RTF, del inglés real-time factor) reportado en la model card:

| Plataforma | Aceleracion | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 146 |
| Apple M4 Max | CPU | 29 |
| Ryzen 4750U | Vulkan | 33 |
| Ryzen 4750U | CPU | 9 |

## Requisitos de hardware

- VRAM estimada: no aplica en sentido estricto; el modelo es tan pequeño que cabe en memoria unificada o RAM del sistema. En GPU, la huella es inferior a 1 GB incluso en F32.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) para aceleración; no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU; también funciona en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 146 con Metal en M4 Max, 29 en CPU del M4 Max, 33 con Vulkan en Ryzen 4750U y 9 en CPU del Ryzen 4750U. Un RTF mayor indica mayor velocidad relativa al tiempo real.
- Requisito de entrada: audio en WAV mono a 16 kHz; para otros formatos hay que convertir con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER ruso (promedio) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| GigaAM-v3-ctc (este GGUF) | 220,7 M | audio, offline | 9,2 (V3_CTC) | MIT | Hugging Face, transcribe.cpp |
| GigaAM-v3-rnnt | 220-240 M | audio, offline | 8,4 (V3_RNNT) | MIT | Hugging Face (ai-sage) |
| T-One + LM | no disponible | audio | 19,4 | no disponible | no disponible en la información |
| Whisper | no disponible (large-v3 en la comparativa) | audio, multilingüe | 25,1 | MIT | Hugging Face, múltiples runtimes |

La comparativa se limita a los datos de la model card original; no se dispone de información sobre otros modelos ASR rusos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso; no detecta idioma ni traduce.
- La salida es en minúsculas y sin puntuación, lo que requiere postprocesado para muchos usos finales.
- No soporta streaming; la transcripción es offline por lotes.
- El WER empeora notablemente en habla con trastornos (20,6 %) y en conversaciones de call center (10,3 %), aunque sigue siendo competitivo frente a alternativas.
- Riesgo de alucinación y errores en audio con ruido, música de fondo o solapamiento de hablantes; no se documentan mitigaciones específicas.
- El paquete de referencia del autor rechaza audios de más de 25 segundos; esta conversión no aplica ese límite según la validación descrita, pero conviene verificar el comportamiento en audios muy largos.
- Licencia MIT heredada del modelo base, lo que permite uso comercial; no obstante, conviene revisar los términos completos del modelo base ai-sage/GigaAM-v3.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y poco validada por la comunidad.
- No se han publicado datos sobre sesgos demográficos o acentos específicos más allá de las métricas por dominio.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/GhaythMahadin/gigaam-v3-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base referenciado: https://huggingface.co/ai-sage/GigaAM-v3/commit/15ef3b5
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-ctc.md
- Repositorio GigaAM (Salute Developers): https://github.com/salute-developers/GigaAM
- Métricas de evaluación de GigaAM: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
