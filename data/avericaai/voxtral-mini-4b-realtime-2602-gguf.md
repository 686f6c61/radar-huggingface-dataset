# avericaai/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral-Mini-4B-Realtime-2602-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) Voxtral-Mini-4B-Realtime-2602, desarrollado originalmente por Mistral AI y cuantizado por el usuario avericaai para su uso con la librería transcribe.cpp. Se trata de un modelo de voz a texto en tiempo real, multilingüe y de tipo audio-LLM, pensado para transcripción en streaming con latencias inferiores a 500 ms, algo poco habitual en soluciones de código abierto.

El modelo combina un codificador de audio causal de aproximadamente 970 millones de parámetros con un decodificador Ministral de unos 3,4 mil millones de parámetros, sumando un total de 4.429.707.024 parámetros. Emite un token de texto por cada franja de 80 ms de audio (12,5 Hz) y admite tanto transcripción incremental en streaming como transcripción offline con mayor precisión. Soporta 13 idiomas con detección automática de idioma.

Esta ficha se centra en la versión GGUF publicada por avericaai, que permite ejecutar el modelo en CPU y GPU de consumo mediante transcribe.cpp, con una escalera de cuantizaciones que va desde BF16 (8,87 GB) hasta Q4_K_M (2,83 GB) sin degradación medible del WER en inglés. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio causal (~970M, conv stem causal con left-pad, 32 capas, transformer con RoPE de ventana deslizante) + proyector de grupos de 4 frames + decodificador Ministral (~3,4B, 26 capas, GQA 32/8, NEOX RoPE) con acondicionamiento de latencia por delay-token |
| Parametros totales | 4.429.707.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio en streaming; emite 1 token por cada 80 ms de audio) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (13 idiomas, deteccion automatica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es distintiva dentro de la familia Voxtral: se trata de un modelo de audio-LLM en streaming, arquitectónicamente distinto de la familia offline Voxtral 2507. El frontend de audio es un codificador causal de unos 970M de parámetros con un stem convolucional causal (left-pad) y 32 capas de transformer con RoPE de ventana deslizante. Un proyector de grupos de 4 frames transforma las representaciones de audio y las suma (fusión aditiva) a los embeddings del decodificador Ministral de ~3,4B de parámetros (26 capas, GQA con 32 cabezas de consulta y 8 de clave/valor, NEOX RoPE). El decodificador incorpora acondicionamiento de latencia mediante delay-tokens y genera un token de texto por cada franja de 80 ms de audio, a 12,5 Hz.

El modelo acepta audio WAV mono a 16 kHz y soporta dos modos: streaming incremental, con latencia y calidad configurables mediante `--stream-chunk-ms` y `--stream-voxtral-delay`, y transcripción offline con un delay de 2400 ms orientado a máxima precisión. La conversión GGUF se realizó a partir del commit upstream 2769294 (fijado el 2026-06-06) y se validó contra la referencia de Transformers en el commit 483c122 de transcribe.cpp el 2026-06-06. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto en tiempo real (streaming) con latencia configurable inferior a 500 ms según el modelo base.
- Transcripción offline con delay de 2400 ms y enfoque en precisión.
- Reconocimiento automático del habla multilingüe en 13 idiomas: inglés, francés, español, alemán, ruso, chino, japonés, italiano, portugués, neerlandés, árabe, hindi y coreano.
- Detección automática de idioma (`lang_detect: true`).
- Emisión de un token de texto por cada 80 ms de audio (12,5 Hz), lo que permite alineación temporal fina del flujo de salida.
- No soporta traducción (`translate: false`) ni generación de timestamps (`timestamps: none`).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado en directo de reuniones y videoconferencias: el modelo procesa audio en streaming con latencia configurable y emite texto a 12,5 Hz, lo que permite generar subtítulos casi en tiempo real en herramientas de colaboración.
- Transcripción de atención al cliente: con detección automática de idioma y soporte de 13 lenguas, puede transcribir llamadas o chats de voz de usuarios en distintos países sin selección manual de idioma.
- Indexación y búsqueda de archivos de audio: la transcripción offline con delay de 2400 ms maximiza la precisión para convertir archivos WAV de 16 kHz en texto indexable en sistemas de búsqueda o archivo documental.
- Asistentes de voz embebidos en local: al ejecutarse con transcribe.cpp en CPU o GPU de consumo (Q4_K_M ocupa 2,83 GB), es viable desplegarlo en portátiles o equipos sin GPU dedicada para dictado y comandos de voz.
- Accesibilidad y documentación clínica o legal: la transcripción multilingüe con WER bajo en español (2,67% en FLEURS con Q8_0) e italiano (2,25%) lo hace adecuado para generar actas y registros de sesiones en estos idiomas.
- Análisis de medios y podcasts: la transcripción por lotes de audio en 13 idiomas permite generar transcripciones para subtitulado, resúmenes o moderación de contenido en plataformas de audio.
- Prototipado de pipelines ASR en investigación: la disponibilidad de seis cuantizaciones GGUF con WER neutro hasta Q4_K_M facilita experimentar con distintos equilibrios de tamaño y precisión en entornos de laboratorio.

## Benchmarks y rendimiento

Resultados de WER (word error rate) y CER (character error rate) publicados en la model card, medidos con Q8_0 sobre FLEURS salvo donde se indique:

| Benchmark | Metrica | Resultado |
|---|---|---|
| FLEURS ar | WER (Q8_0) | 14,53 |
| FLEURS de | WER (Q8_0) | 4,24 |
| FLEURS en | WER (Q8_0) | 6,27 |
| FLEURS es | WER (Q8_0) | 2,67 |
| FLEURS fr | WER (Q8_0) | 6,29 |
| FLEURS hi | WER (Q8_0) | 14,44 |
| FLEURS it | WER (Q8_0) | 2,25 |
| FLEURS ja | CER (Q8_0) | 5,44 |
| FLEURS ko | CER (Q8_0) | 5,27 |
| FLEURS nl | WER (Q8_0) | 6,09 |
| FLEURS pt | WER (Q8_0) | 3,87 |
| FLEURS ru | WER (Q8_0) | 5,41 |
| FLEURS zh | CER (Q8_0) | 10,41 |
| LibriSpeech test-clean (BF16) | WER | 2,08 |
| LibriSpeech test-clean (F16) | WER | 2,09 |
| LibriSpeech test-clean (Q8_0) | WER | 2,07 |
| LibriSpeech test-clean (Q6_K) | WER | 2,08 |
| LibriSpeech test-clean (Q5_K_M) | WER | 2,08 |
| LibriSpeech test-clean (Q4_K_M) | WER | 2,08 |

En LibriSpeech test-clean (2.620 enunciados, batch size 8, sin timestamps, normalizador de texto de Whisper en inglés, ruta offline con delay 6, GPU NVIDIA L40S), la referencia de Transformers en BF16 con decodificación greedy obtiene 2,08%, idéntico al GGUF BF16. Todas las cuantizaciones se mantienen dentro del ruido bootstrap (2,07-2,09%), por lo que la escalera de cuantización es neutra en WER hasta Q4_K_M. El WER publicado es solo en inglés; el modelo es multilingüe pero no se publican resultados de referencia comparativos con otros modelos en la información disponible.

Rendimiento de velocidad (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 2,41 |
| Apple M4 Max | Metal | 6,63 |
| AMD Ryzen 4750U | CPU | 0,58 |
| AMD Ryzen 4750U | Vulkan | 0,76 |

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: BF16 8,87 GB; F16 8,88 GB; Q8_0 4,73 GB; Q6_K 3,66 GB; Q5_K_M 3,28 GB; Q4_K_M 2,83 GB.
- GPU recomendadas: NVIDIA L40S (usada para la validación de WER); no se detallan otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, al menos con Q4_K_M (2,83 GB) y Q5_K_M (3,28 GB); no se especifican modelos concretos de GPU de consumo en la información proporcionada.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake y binario `transcribe-cli`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: RTF de 2,41 (CPU) y 6,63 (Metal) en Apple M4 Max; RTF de 0,58 (CPU) y 0,76 (Vulkan) en AMD Ryzen 4750U. El modelo base declara latencia inferior a 500 ms en streaming.
- Entrada de audio: WAV mono a 16 kHz; conversión previa con ffmpeg (`-ar 16000 -ac 1`) si el audio no cumple el formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral-Mini-4B-Realtime-2602 (esta ficha, GGUF) | 4,43B | No disponible (streaming 12,5 Hz) | WER 2,08% en LibriSpeech test-clean (BF16) | Apache-2.0 | GGUF en Hugging Face vía transcribe.cpp |
| Voxtral-Mini-4B-Realtime-2602 (base, safetensors) | 4,43B | No disponible | WER 2,08% en LibriSpeech test-clean (BF16, referencia Transformers) | Apache-2.0 | Hugging Face, Transformers |
| Voxtral 2507 (familia offline) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos (Whisper, otros ASR) para establecer una comparación cuantitativa. La comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- El WER publicado corresponde únicamente al inglés; el rendimiento en los otros 12 idiomas no está validado con métricas de referencia comparables en la información disponible.
- No genera timestamps (`timestamps: none`), lo que limita su uso en aplicaciones que requieran alineación temporal palabra a palabra.
- No soporta traducción (`translate: false`): solo transcribe en el idioma hablado.
- Requiere audio WAV mono a 16 kHz; es necesario preprocesar otros formatos con ffmpeg.
- La medición con delay 30 está pendiente según la model card; los resultados actuales corresponden a la ruta offline con delay 6.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes no cuantificado en la información disponible; los WER más altos en árabe (14,53) y hindi (14,44) sugieren mayor fragilidad en esos idiomas.
- No se documentan sesgos conocidos en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda revisar los términos del modelo base y el archivo NOTICE del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; conviene validar la integridad de los archivos antes de usarlos en producción.
- El modelo está pensado para streaming y ASR; no debe emplearse como LLM de propósito general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/avericaai/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit del modelo base usado: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-realtime.md
- Conversión GGUF alternativa: https://huggingface.co/acceldium/Voxtral-Mini-4B-Realtime-2602_GGUF
- Conversión GGUF alternativa: https://huggingface.co/tryambientai/Voxtral-Mini-4B-Realtime-2602-gguf/tree/main
