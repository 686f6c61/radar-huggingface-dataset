# GhaythMahadin/gigaam-v3-rnnt-gguf

## Resumen
GigaAM-v3-rnnt-gguf es una conversión a formato GGUF del modelo ai-sage/GigaAM-v3, un sistema de reconocimiento automático del habla (ASR) especializado en ruso. Lo desarrolla el autor GhaythMahadin a partir del modelo base de ai-sage (SberDevices/SaluteDevices), y está pensado para su uso con transcribe.cpp, una implementación en C++ de inferencia de modelos de transcripción. El modelo realiza transcripción offline de audio en ruso con decodificación RNN-T voraz (greedy), sin puntuación y en minúsculas.

La arquitectura subyacente es un encoder Conformer de 16 capas con aproximadamente 221,9 millones de parámetros, heredado de la familia GigaAM-v3. Esta variante `rnnt` se ha ajustado fino para emitir texto ruso en minúsculas sin puntuación, con un vocabulario de 33 caracteres. El modelo base se preentrenó sobre 700.000 horas de habla rusa mediante el objetivo HuBERT-CTC, lo que le confiere una cobertura amplia de dominios (conversaciones de call center, habla natural, habla con música de fondo y habla atípica).

Su relevancia actual radica en que ofrece una alternativa ligera (175-846 MB según cuantización) y ejecutable en CPU o GPU de consumo para transcripción de ruso de alta calidad, con un WER medido del 8,08 % en FLEURS ru. La licencia MIT facilita su integración en productos comerciales, algo poco habitual en modelos ASR de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con decodificador RNN-T |
| Parametros totales | 221.883.426 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo es una conversión del checkpoint `rnnt` de GigaAM-v3, que combina un encoder Conformer de 16 capas con un decodificador RNN-T. El preentrenamiento del modelo base se realizó sobre 700.000 horas de habla rusa con el objetivo HuBERT-CTC, seguido de un ajuste fino supervisado con decodificador RNN-T. La variante `rnnt` emite texto en minúsculas sin puntuación, con un vocabulario de 33 caracteres, y se decodifica de forma voraz (greedy) sin modelo de lenguaje externo.

La conversión a GGUF se realizó a partir del commit `c7f128b` del modelo base (fijado el 2026-05-12) y se validó contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp. El modelo base incorpora datos internos nuevos (conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas), lo que según el autor mejora un 30 % de media en esos dominios respecto a generaciones anteriores. No se especifican en la información disponible detalles sobre RLHF/DPO ni sobre la composición exacta del dataset más allá de las horas totales.

## Capacidades
- Transcripción de voz a texto en ruso, offline y con decodificación RNN-T voraz.
- Salida en minúsculas y sin puntuación (variante `rnnt`, no `e2e_rnnt`).
- Vocabulario de 33 caracteres para el ruso.
- Marcas de tiempo a nivel de token (`timestamps: token`).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No soporta tool calling ni razonamiento multi-paso (es un modelo ASR, no un LLM).
- Ejecutable en CPU y GPU mediante transcribe.cpp (Metal, Vulkan, CPU).

## Casos de uso
- Transcripción de reuniones y entrevistas en ruso: el modelo procesa audio de 16 kHz mono y genera texto con marcas de tiempo por token, útil para actas y búsqueda posterior en grabaciones.
- Subtitulado offline de contenido audiovisual en ruso: al ser ligero (175 MB en Q4_K_M) y ejecutable en CPU, permite generar subtítulos en lotes sin depender de servicios en la nube.
- Análisis de conversaciones de call center: el modelo base se entrenó específicamente con datos de call center, por lo que es adecuado para transcribir y analizar llamadas en ruso para control de calidad o extracción de temas.
- Procesamiento en dispositivos de borde (edge): las cuantizaciones Q4_K_M y Q5_K_M caben en memoria de sistemas embebidos o portátiles modestos, permitiendo transcripción local sin conexión.
- Investigación en ASR para ruso: sirve como línea base reproducible (WER 8,08 % en FLEURS ru) para comparar técnicas de cuantización o decodificación.
- Integración en pipelines de accesibilidad: transcripción en tiempo no real de audio pregrabado para generar transcripciones de apoyo a personas con discapacidad auditiva en entornos rusoparlantes.
- Archivado y búsqueda de audio histórico: la transcripción con marcas de tiempo permite indexar grandes volúmenes de grabaciones rusas para recuperación de información.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| WER FLEURS ru (F32) | 8,08 % |
| WER FLEURS ru (F16) | 8,08 % |
| WER FLEURS ru (Q8_0) | 8,08 % |
| WER FLEURS ru (Q6_K) | 8,07 % |
| WER FLEURS ru (Q5_K_M) | 8,12 % |
| WER FLEURS ru (Q4_K_M) | 8,12 % |

El WER se midió sobre el conjunto de test completo de FLEURS ru (775 enunciados) con decodificación voraz y sin modelo de lenguaje externo. El paquete de referencia del autor `gigaam` midió 9,46 % sobre el mismo manifiesto; la diferencia de 1,4 pp se debe a que el paquete original rechaza 5 enunciados largos (>25 s) con el error `Too long wav file, use 'transcribe_longform' method`, contados como errores de borrado del 100 %. En el subconjunto de 770 enunciados que ambos decodifican, transcribe.cpp coincide exactamente con el original. ai-sage no publica un WER de FLEURS ru; este número se ha medido en la conversión.

Rendimiento (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | Metal | 110 |
| Apple M4 Max | CPU | 27 |
| AMD Ryzen 4750U | Vulkan | 25 |
| AMD Ryzen 4750U | CPU | 9 |

## Requisitos de hardware
- VRAM estimada para inferencia: 175 MB (Q4_K_M) a 846 MB (F32); F16 430 MB, Q8_0 260 MB, Q6_K 217 MB, Q5_K_M 196 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM libre; también funciona solo en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con backends Metal, Vulkan y CPU. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 110 en Metal (M4 Max) y 25 en Vulkan (Ryzen 4750U), lo que indica procesamiento muy por encima de tiempo real en esas plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dominio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM-v3-rnnt (este) | 221,9 M | no disponible | 8,08 % (FLEURS ru) | MIT | GGUF en HF |
| GigaAM-v3-ctc | 220–240 M | no disponible | 9,2 % (media multi-dominio) | MIT | HF (ai-sage) |
| T-One + LM | no disponible | no disponible | 19,4 % (media multi-dominio) | no disponible | no disponible |
| Whisper (large-v3) | no disponible | no disponible | 25,1 % (media multi-dominio) | MIT | HF (openai) |

Los datos de T-One + LM y Whisper provienen de la tabla del modelo base GigaAM-v3, que compara el WER medio sobre varios dominios (Open Datasets, Golos Farfield, Natural Speech, Disordered Speech, Callcenter). El WER de FLEURS ru de este modelo no es directamente comparable con esa tabla, ya que se midió sobre un conjunto distinto.

## Limitaciones y advertencias
- Solo soporta ruso; no traduce ni detecta idioma.
- Salida en minúsculas y sin puntuación: para texto con puntuación y normalización hay que usar la variante `e2e_rnnt` del modelo base.
- No soporta streaming; la transcripción es offline por lotes.
- Riesgo de alucinación y errores en habla con ruido, acentos atípicos o dominios no cubiertos; el WER en habla con trastornos es del 19,2 % según el modelo base.
- El modelo base rechaza audios de más de 25 s en el paquete de referencia; en transcribe.cpp se procesan, pero conviene validar en audios largos.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero se recomienda revisar los términos del modelo original.
- Conversión no oficial: el autor de la conversión es GhaythMahadin, no ai-sage; la validación se realizó contra un commit concreto de transcribe.cpp.
- Sin datos publicados sobre sesgos específicos más allá de los del modelo base.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/gigaam-v3-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base: https://huggingface.co/ai-sage/GigaAM-v3/commit/c7f128b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-rnnt.md
- Paper (arXiv): https://arxiv.org/abs/2506.01192
- Repositorio GigaAM (métricas): https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
