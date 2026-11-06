# lipik/gigaam-v3-e2e-rnnt-gguf

## Resumen

GigaAM-v3-e2e-rnnt-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla ai-sage/GigaAM-v3, publicada por el usuario lipik para su uso con el motor de inferencia transcribe.cpp. Se trata de un modelo especializado en transcripción de voz en ruso, desarrollado originalmente por Sber (ai-sage) como tercera generación de la familia GigaAM. El modelo combina un encoder Conformer de 16 capas con una cabeza transducer RNN-T, lo que le permite generar directamente texto en ruso con mayúsculas, puntuación y normalización, sin necesidad de un modelo de lenguaje externo.

El interés de esta conversión reside en su extrema ligereza: con 222,5 millones de parámetros y ficheros que van desde 175 MB (Q4_K_M) hasta 849 MB (F32), puede ejecutarse en CPU, GPU integrada o GPUs de consumo con requisitos mínimos. La calidad se mantiene prácticamente intacta tras la cuantización: el WER en FLEURS ru pasa de 5,35 % en F32 a 5,36 % en Q4_K_M, una degradación de apenas 0,01 puntos porcentuales.

El modelo está pensado para transcripción offline de enunciados cortos (hasta 25 segundos), no soporta streaming ni traducción, y hereda la licencia MIT del modelo base, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) + cabeza transducer RNN-T |
| Parametros totales | 222.518.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (enunciados de hasta 25 s de audio) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tokenizer | SentencePiece de 1024 piezas |
| Frecuencia de muestreo de entrada | 16 kHz mono WAV |
| Modelo base | ai-sage/GigaAM-v3 (commit ec1dc1f, fijado 2026-05-12) |
| Libreria de inferencia | transcribe.cpp |
| Decodificacion | greedy RNN-T |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Timestamps | a nivel de token |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer: un encoder de 16 capas que combina convoluciones y auto-atención para capturar dependencias locales y globales en la señal acústica. Sobre el encoder se sitúa una cabeza transducer RNN-T que realiza la decodificación greedy y produce directamente la secuencia de tokens. El vocabulario es un SentencePiece de 1024 piezas que genera texto en ruso con mayúsculas, puntuación y normalización, sin necesidad de postprocesado con un modelo de lenguaje.

El modelo base GigaAM-v3 se preentrenó con el objetivo HuBERT-CTC sobre 700.000 horas de voz en ruso, y posteriormente se afinó con un decodificador RNN-T. La tercera generación incorpora nuevos conjuntos de datos internos (conversaciones de call center, voz con música de fondo, habla natural y habla con características atípicas), lo que según el autor mejora un 30 % de media en esos dominios manteniendo la calidad en los benchmarks públicos. Esta conversión GGUF está portada desde el commit ec1dc1f del modelo original y validada contra el paquete de referencia del autor en el commit 42b96d9 de transcribe.cpp.

## Capacidades

- Transcripción de voz en ruso (speech-to-text) offline con salida en texto con mayúsculas, puntuación y normalización.
- Decodificación RNN-T greedy sin modelo de lenguaje externo.
- Manejo de dominios diversos: habla natural, conversaciones telefónicas, voz con música de fondo y habla con características atípicas.
- Timestamps a nivel de token.
- Ejecución en CPU y GPU mediante transcribe.cpp (backend Metal y Vulkan disponibles).
- No soporta streaming.
- No soporta traducción.
- No realiza detección de idioma.
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo).
- No procesa audio de más de 25 segundos por enunciado.

## Casos de uso

- Transcripción de reuniones y notas de voz en ruso: el modelo convierte ficheros WAV de 16 kHz mono en texto puntuado, adecuado para actas automáticas o subtitulado de grabaciones cortas segmentadas por enunciado.
- Subtitulado de vídeo en ruso: al generar timestamps a nivel de token, permite alinear el texto transcrito con la pista de audio para generar subtítulos sincronizados en postproducción.
- Atención al cliente y análisis de call centers: el modelo está entrenado específicamente con conversaciones telefónicas y rinde con un WER del 9,5 % en el conjunto Callcenter según el autor, lo que lo hace útil para transcribir y analizar llamadas grabadas.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real de voz a texto en dispositivos de gama baja, gracias a que el fichero Q4_K_M ocupa 175 MB y puede ejecutarse en CPU.
- Procesamiento por lotes de archivos de audio: integración en pipelines de datos para transcribir grandes volúmenes de grabaciones cortas en servidores sin GPU, con un factor de tiempo real (RTF) de 8 en CPU Ryzen 4750U.
- Asistentes de voz embebidos en dispositivos edge: el modelo cabe en memoria de sistemas con recursos limitados y puede desplegarse con el binario transcribe-cli compilado desde fuente, sin dependencias de nube.
- Investigación en ASR para ruso: sirve como referencia ligera y reproducible para comparar técnicas de cuantización GGUF frente al modelo original en F32.

## Benchmarks y rendimiento

El autor de la conversión publica el WER medido sobre el split de test completo de FLEURS ru (775 enunciados) con decodificación greedy y sin modelo de lenguaje externo:

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 849 MB | 5,35 % |
| F16 | 431 MB | 5,35 % |
| Q8_0 | 261 MB | 5,36 % |
| Q6_K | 217 MB | 5,37 % |
| Q5_K_M | 197 MB | 5,42 % |
| Q4_K_M | 175 MB | 5,36 % |

La referencia del paquete oficial `gigaam` medida sobre el mismo manifiesto es de 6,78 %; la diferencia de 1,4 puntos porcentuales se debe a que el paquete original rechaza 5 enunciados de más de 25 segundos (contabilizados como errores de borrado del 100 %). Sobre el subconjunto de 770 enunciados que ambos decodifican, transcribe.cpp coincide exactamente con el original. ai-sage no publica WER en FLEURS ru; esta cifra está medida por el autor de la conversión.

Resultados del modelo base GigaAM-v3 (RNN-T) según el autor original, en WER (%):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| Media | 9,2 | 8,4 | 19,4 | 25,1 |

Rendimiento de inferencia en transcribe.cpp (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 88 |
| Apple M4 Max | CPU | 25 |
| Ryzen 4750U | Vulkan | 22 |
| Ryzen 4750U | CPU | 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en F32 (849 MB de pesos) y alrededor de 200-300 MB en cuantizaciones Q4_K_M o Q8_0.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no requiere GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en GPU integradas.
- Ejecución en CPU: viable, con un RTF de 8 en un Ryzen 4750U (unas 8 veces más rápido que tiempo real).
- Opciones de despliegue: transcribe.cpp (compilado desde fuente con CMake), con backends CPU, Metal y Vulkan. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un modelo de lenguaje.
- Latencia y throughput: RTF de 88 en Metal (M4 Max) y 22 en Vulkan (Ryzen 4750U); en CPU, RTF de 25 en M4 Max y 8 en Ryzen 4750U.
- Almacenamiento: el repositorio completo ocupa 0,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER ruso (Callcenter) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| GigaAM-v3 e2e RNN-T (esta conversion) | 222,5 M | 25 s por enunciado | 9,5 % | MIT | GGUF en Hugging Face |
| GigaAM-v3 CTC | 220-240 M | 25 s por enunciado | 10,3 % | MIT | Pesos originales |
| T-One + LM | no disponible | no disponible | 13,5 % | no disponible | no disponible |
| Whisper (large-v3) | no disponible | 30 s por ventana | 23,9 % | MIT | Multiples formatos |

Frente a Whisper, el modelo de GigaAM-v3 obtiene un WER notablemente inferior en ruso en todos los dominios evaluados (8,4 % de media frente a 25,1 %), a costa de soportar un único idioma y no ofrecer traducción ni streaming. Frente a la variante CTC del mismo modelo base, la RNN-T es ligeramente mejor en todos los conjuntos. T-One + LM queda en una posición intermedia en los datos publicados por el autor.

## Limitaciones y advertencias

- Solo soporta ruso; no detecta idioma ni traduce.
- No es un modelo de streaming: requiere el enunciado completo antes de transcribir.
- Limitado a enunciados de 25 segundos o menos; los audios más largos deben segmentarse previamente.
- Riesgo de alucinación y errores en habla con ruido extremo, acentos marcados o características atípicas; el WER en Disordered Speech es del 19,2 %.
- Puede presentar sesgos derivados de los datos de entrenamiento (700.000 horas de voz en ruso de dominios concretos), con peor rendimiento en variedades dialectales poco representadas.
- La licencia MIT permite uso comercial, pero conviene revisar los términos del modelo base ai-sage/GigaAM-v3, que es la fuente autoritativa.
- No es compatible con ecosistemas de inferencia de modelos de lenguaje (vLLM, llama.cpp, Ollama); requiere transcribe.cpp.
- La conversión está fijada a un commit concreto del modelo base (ec1dc1f) y validada contra una versión concreta de transcribe.cpp (42b96d9); cambios posteriores en cualquiera de los dos pueden alterar el comportamiento.
- El número de descargas (24) y likes (0) es muy bajo, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lipik/gigaam-v3-e2e-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base: https://huggingface.co/ai-sage/GigaAM-v3/commit/ec1dc1f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-rnnt.md
- Repositorio GigaAM: https://github.com/salute-developers/GigaAM
- Metricas del modelo original: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper (arXiv): https://arxiv.org/abs/2506.01192
- Descarga directa Q8_0: https://huggingface.co/handy-computer/gigaam-v3-e2e-rnnt-gguf/resolve/main/gigaam-v3-e2e-rnnt-Q8_0.gguf
