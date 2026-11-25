# GhaythMahadin/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral-Mini-4B-Realtime-2602 es un modelo de reconocimiento automatico del habla (ASR) nativamente en streaming, desarrollado por Mistral AI. Esta ficha concreta corresponde a la conversion a formato GGUF realizada por GhaythMahadin para su uso con el runtime transcribe.cpp, una adaptacion del modelo original `mistralai/Voxtral-Mini-4B-Realtime-2602`. El modelo resuelve el problema de la transcripcion en tiempo real con baja latencia: es de los primeros modelos abiertos que alcanza precision comparable a sistemas offline con un retardo inferior a 500 ms.

La arquitectura combina un codificador de audio causal de aproximadamente 970 millones de parametros (tallo convolucional causal con left-padding y transformer de 32 capas con RoPE de ventana deslizante) con un decodificador Ministral de aproximadamente 3,4 mil millones de parametros (26 capas, GQA 32/8, NEOX RoPE). La fusion de audio es aditiva mediante un proyector de grupos de 4 frames, con condicionamiento de latencia por delay-tokens. El modelo emite un token de texto por cada ranura de 80 ms de audio (12,5 Hz) y soporta 13 idiomas con deteccion automatica.

Su relevancia actual reside en que permite despliegue en dispositivo (on-device) con requisitos de hardware modestos: las cuantizaciones GGUF van desde 2,83 GB (Q4_K_M) hasta 8,88 GB (F16), manteniendo un WER estable en LibriSpeech test-clean (2,07-2,09 %) en toda la escalera de cuantizacion. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM en streaming: codificador de audio causal (~970M) + decodificador Ministral (~3,4B), fusion aditiva con proyector de grupos de 4 frames |
| Parametros totales | 4.429.707.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (13 idiomas, deteccion automatica) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un audio-LLM nativamente streaming. El frontend de audio es un codificador causal de aproximadamente 970 millones de parametros compuesto por un tallo convolucional causal con left-padding y un transformer de 32 capas con RoPE de ventana deslizante. La salida del codificador pasa por un proyector de grupos de 4 frames cuyas embeddings de audio se suman (fusion aditiva) sobre las embeddings del decodificador. El decodificador es un Ministral de aproximadamente 3,4 mil millones de parametros con 26 capas, atencion GQA con 32 cabezas de consulta y 8 de clave/valor, y RoPE en variante NEOX. El condicionamiento de latencia se realiza mediante delay-tokens, lo que permite configurar el retardo entre 240 ms y 2,4 s.

El modelo emite un token de texto por cada ranura de 80 ms de audio (12,5 Hz). Arquitectonicamente es distinto de la familia Voxtral 2507 offline: tiene arquitectura propia, frontend de streaming, codificador causal y fusion de audio aditiva. La entrada es WAV mono a 16 kHz y soporta tanto transcripcion incremental en streaming (con latencia y calidad configurables mediante `--stream-chunk-ms` y `--stream-voxtral-delay`) como transcripcion offline con transcripcion final byte-equal. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto en streaming con latencia configurable (240 ms a 2,4 s).
- Transcripcion offline con resultado final identico byte a byte al del modo streaming.
- Deteccion automatica de idioma entre 13 idiomas (en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko).
- Emision de texto a 12,5 tokens por segundo (una ranura de 80 ms por token).
- Soporte de audio de entrada en WAV mono a 16 kHz.
- No soporta traduccion (`translate: false` segun metadatos del autor).
- No genera marcas de tiempo (`timestamps: none` segun metadatos del autor).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Subtitulado en directo: el modelo transcribe audio en tiempo real con retardos de 240 ms a 2,4 s configurables, lo que permite generar subtitulos sincronizados en emisiones, reuniones o eventos con precision proxima a sistemas offline a 480 ms de retardo.
- Asistentes de voz: al operar a 12,5 tokens/s y con arquitectura nativamente streaming, puede alimentar pipelines de reconocimiento de voz en asistentes conversacionales con respuestas de baja latencia.
- Transcripcion on-device: con cuantizaciones de 2,83 GB (Q4_K_M) y 3,28 GB (Q5_K_M), es viable en equipos de consumo y portatiles, permitiendo dictado y notas de voz sin conexion ni envio de audio a la nube.
- Actas y notas de reunion multilingues: la deteccion automatica de idioma entre 13 lenguas permite transcribir reuniones con participantes que alternan idiomas sin configuracion manual.
- Atencion al cliente y centros de contacto: la transcripcion en streaming con WER estable en toda la escalera de cuantizacion permite desplegar en infraestructura modesta y procesar llamadas en tiempo real para analitica o asistencia al agente.
- Accesibilidad: generacion de subtitulos en vivo para personas con discapacidad auditiva en dispositivos locales, gracias al bajo coste computacional (RTF de 8,6 en Metal sobre M4 Max y 0,9 en Vulkan sobre Ryzen 4750U).
- Procesamiento por lotes de archivos de audio: el modo offline con transcripcion final byte-equal al streaming permite transcribir archivos WAV de 16 kHz mono de forma reproducible en pipelines automatizados.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean completo (2620 enunciados), normalizador de texto ingles de Whisper, ruta offline, batch size 8 en NVIDIA L40S:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 8,87 GB | 2,08 % |
| F16 | 8,88 GB | 2,09 % |
| Q8_0 | 4,73 GB | 2,07 % |
| Q6_K | 3,66 GB | 2,08 % |
| Q5_K_M | 3,28 GB | 2,08 % |
| Q4_K_M | 2,83 GB | 2,08 % |

Referencia en la misma maquina con HuggingFace transformers (VoxtralRealtimeForConditionalGeneration, BF16, greedy): 2,08 %. El GGUF BF16 iguala la referencia. Todas las cuantizaciones se mantienen dentro del ruido bootstrap (2,07-2,09 %), por lo que la escalera de cuantizacion es neutra en WER hasta Q4_K_M. El WER publicado es solo para ingles; el modelo es multilingue pero no se publican WER para el resto de idiomas.

Rendimiento en tiempo real (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 8,6 |
| Apple M4 Max | CPU | 2,5 |
| Ryzen 4750U | Vulkan | 0,9 |
| Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con Q4_K_M (2,83 GB de pesos), 3,5 GB con Q5_K_M (3,28 GB), 4 GB con Q6_K (3,66 GB), 5 GB con Q8_0 (4,73 GB) y 9 GB con BF16/F16 (8,87-8,88 GB), mas overhead del runtime.
- GPU recomendadas: NVIDIA L40S (usada para la validacion de WER), Apple Silicon con Metal (M4 Max alcanza RTF 8,6), GPU AMD/Intel con Vulkan (Ryzen 4750U con iGPU alcanza RTF 0,9).
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M a Q8_0 en tarjetas con 6-8 GB de VRAM; tambien en Apple Silicon de gama media y en iGPU con soporte Vulkan.
- Opciones de despliegue: transcribe.cpp (runtime oficial de este GGUF), con binario `transcribe-cli`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 12,5 tokens/s de salida (una ranura de 80 ms por token); retardo configurable de 240 ms a 2,4 s; RTF de 8,6 en Metal (M4 Max) y 0,9 en Vulkan (Ryzen 4750U).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Voxtral-Mini-4B-Realtime-2602 (este GGUF) | 4,43B | no disponible | 13 | Apache-2.0 | GGUF | Streaming nativo, latencia 240 ms-2,4 s, WER 2,08 % en LibriSpeech test-clean |
| Voxtral 2507 (familia offline de Mistral) | no disponible | no disponible | no disponible | no disponible | no disponible | Arquitectura distinta, sin frontend de streaming |
| Referencia transformers (VoxtralRealtimeForConditionalGeneration) | 4,43B | no disponible | 13 | Apache-2.0 | safetensors | Misma precision que el GGUF BF16 (WER 2,08 %), sin optimizacion de runtime |

No se dispone de datos de benchmarks ni especificaciones de otros modelos ASR comparables (por ejemplo, Whisper) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio modelo y su referencia de transformers.

## Limitaciones y advertencias

- El WER publicado (2,08 %) corresponde unicamente a ingles sobre LibriSpeech test-clean; no hay datos de precision para los otros 12 idiomas.
- No soporta traduccion automatica ni generacion de marcas de tiempo.
- La entrada debe ser WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- La licencia Apache-2.0 se hereda del modelo base, pero se recomienda consultar la model card upstream para los terminos completos.
- Es una conversion GGUF de terceros (GhaythMahadin) validada contra la referencia de transformers en un commit concreto; cambios en transcribe.cpp o en el modelo upstream pueden alterar el comportamiento.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopcion y validacion por la comunidad son limitadas.
- El modelo esta optimizado para transcripcion; no se documentan capacidades de razonamiento, codigo o tool calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/GhaythMahadin/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit upstream fijado: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-realtime.md
- Pesos GGUF (repositorio handy-computer): https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf
- Paper (referencia arXiv): arxiv:2602.11298
