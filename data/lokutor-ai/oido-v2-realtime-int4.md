# lokutor-ai/oido-v2-realtime-int4

## Resumen

Oído v2 es un modelo de reconocimiento automático del habla (ASR) en inglés diseñado para ejecutarse en tiempo real sobre un microcontrolador ESP32-S3, sin acelerador neuronal. Lo desarrolla lokutor-ai como evolución de su proyecto Oído v1, y deriva por fine-tuning de `nvidia/stt_en_conformer_ctc_small`. El problema que aborda es concreto: hacer transcripción de voz en streaming dentro de un dispositivo de 5 dólares con 8 MB de PSRAM y 16 MB de flash, algo que la versión anterior no lograba (funcionaba a 1,8-2,0 veces más lento que el habla en el chip).

La clave técnica es la reducción del tráfico de memoria, no del tamaño del modelo: apilado de pares de tramas (80 ms por trama del encoder), front-end convolucional de 64 canales en lugar de 176, eliminación de bloques en la variante B y cuantización int4 de los pesos para que la mayor parte del modelo resida en PSRAM. Con eso, la variante A corre a 0,72× la duración del audio y la B a 0,54× en un solo núcleo a 240 MHz, con el modelo de lenguaje activado.

Se distribuye en formato propietario TNM1 (no safetensors ni GGUF), con pesos int4 de 7,7 MB (A) y 5,9 MB (B), más un modelo de lenguaje GRU de 1,3 M de parámetros. La licencia es CC BY-SA 4.0 para los pesos; el código y el firmware del repositorio son GPLv3 con licencias comerciales disponibles. Es relevante ahora porque demuestra ASR en streaming viable en el extremo absoluto del edge, con latencia de texto final de 259-431 ms tras el fin del habla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer CTC (transformer convolucional), encoder streaming con front-end convolucional de 64 canales y apilado de 2 tramas |
| Parámetros totales | no disponible (pesos int4 de 7,7 MB en variante A y 5,9 MB en variante B; el modelo de lenguaje GRU añade 1,3 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | streaming por fragmentos; fragmento por defecto de 0,64 s (8 tramas) con 64 tramas de contexto izquierdo; modo de contexto completo disponible |
| Tipos de cuantización | int4 (pesos) con aritmética int4/int8 en el chip |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 (pesos); código y firmware GPLv3 con licencias comerciales disponibles |
| Formato de pesos | TNM1 (formato propio del motor Oído); tokenizer SentencePiece de 1024 piezas |
| Modelo base | nvidia/stt_en_conformer_ctc_small |
| Variantes | A: 16 bloques Conformer, 7,7 MB int4; B: 12 bloques, 5,9 MB int4 |
| Modelo de lenguaje | GRU de 1,3 M de parámetros, entrenado solo con libros de dominio público, con pesos ajustados (0,30, bonus de token 1,0) |

## Arquitectura y entrenamiento

El modelo es un Conformer CTC derivado por fine-tuning del `nvidia/stt_en_conformer_ctc_small`. Sobre esa base, el autor aplica varias modificaciones orientadas a la inferencia en streaming sobre hardware limitado: apilado de pares de tramas del encoder (tramas de 80 ms), sustitución del front-end convolucional de 176 canales por uno de 64, y reducción del número de bloques Conformer en la variante B (12 frente a 16). Los pesos se cuantizan a int4 para que la mayor parte del modelo quepa en PSRAM, dado que el ESP32-S3 lee 3,8 GB/s desde SRAM interna, 89 MB/s desde PSRAM y 32 MB/s desde flash.

El entrenamiento parte de los datasets declarados en la model card: LibriSpeech, Common Voice 17.0, Multilingual LibriSpeech y People's Speech, todos en inglés. No se detalla en la información disponible el número de tokens ni la composición exacta del dataset de fine-tuning, ni si hubo etapas de RLHF o DPO (no aplicables de forma habitual en ASR CTC). La innovación destacable está en el motor de inferencia: solapamiento del flujo de pesos con el cómputo mediante la precarga asíncrona de la caché de datos de la ROM, buffers de trabajo en SRAM, decodificador optimizado con exp/tanh basados en tablas, atajo para tramas en blanco y opción de beam 2 / top-k 3. El modelo de lenguaje GRU se usa en decodificación por haz sobre las salidas CTC.

## Capacidades

- Reconocimiento automático del habla en inglés en modo streaming, con fragmentos de 0,64 s por defecto (configurable a 1,28 s o contexto completo).
- Decodificación CTC con modelo de lenguaje GRU externo (beam search configurable: beam 4 / top 6 o beam 2 / top 3).
- Ejecución en tiempo real sobre un único núcleo de ESP32-S3 a 240 MHz: factor de tiempo real de 0,72 (A) y 0,54 (B) con el modelo de lenguaje activado.
- Latencia de texto final tras el fin del habla de 431 ms (A, rango 281-574) y 259 ms (B, rango 159-391), con audio a velocidad real.
- Funcionamiento on-device sin conexión: nada sale del dispositivo; existe demo en WebAssembly con el mismo motor C.
- Detección de fin de habla por silencio configurable (0,8 s por defecto) en el firmware.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR ni capacidades multilingües.

## Casos de uso

- Domótica por voz en dispositivos de bajo coste: el modelo permite reconocer comandos y frases en un ESP32-S3 con micrófono INMP441, sin enviar audio a la nube, con latencia de texto final inferior a medio segundo y un coste de hardware de unos 5 dólares.
- Wearables y dispositivos portátiles con restricciones de energía: al ejecutarse en un solo núcleo a 240 MHz y con pesos int4 de 5,9-7,7 MB, encaja en dispositivos alimentados por batería donde no cabe un SoC con acelerador neuronal.
- Transcripción local de reuniones o notas de voz en inglés: el modo de contexto completo del mismo archivo reduce el WER a 4,58/10,71 (variante A) con el modelo de lenguaje, adecuado para procesar audio grabado en lugar de streaming.
- Interfaces de voz para personas con movilidad reducida: la ejecución on-device garantiza privacidad del audio y funcionamiento sin conectividad, con respuesta en tiempo real.
- Prototipado e investigación en TinyML: el repositorio incluye firmware, herramientas de flasheo, mediciones en placa y la demo WebAssembly, lo que permite reproducir los resultados y hacer ablaciones sobre el motor C.
- Kioscos o paneles interactivos con reconocimiento de comandos en inglés: la variante B, con 0,54× de tiempo real, deja margen de CPU para otras tareas del firmware mientras transcribe.
- Evaluación comparativa de decodificación CTC en el edge: el par de variantes A/B y los modos de fragmento permiten medir el compromiso entre precisión y velocidad en hardware real.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), sobre LibriSpeech test, con el motor del firmware ejecutado en host con la misma aritmética entera y matemáticas deterministas que el chip.

| Configuración | test-clean WER (%) | test-other WER (%) |
|---|---|---|
| Variante A, streaming 0,64 s, greedy | 10,01 | 19,90 |
| Variante A, streaming 0,64 s + LM (beam 4, top 6) | 7,14 | 16,37 |
| Variante A, streaming 1,28 s + LM | 5,96 | 14,03 |
| Variante A, contexto completo + LM | 4,58 | 10,71 |
| Variante B, streaming 0,64 s, greedy | 13,43 | 26,10 |
| Variante B, streaming 0,64 s + LM (beam 2, top 3) | 10,63 | 22,42 |
| Variante B, streaming 1,28 s + LM | 8,08 | 18,45 |
| Variante B, contexto completo + LM | 6,15 | 14,41 |

| Métrica de sistema | Variante A | Variante B |
|---|---|---|
| Factor de tiempo real en chip, con LM | 0,72 (beam 4, top 6) / 0,70 (beam 2, top 3) | 0,54 (beam 2, top 3) |
| Texto final tras fin del habla | 431 ms (281-574) | 259 ms (159-391) |
| Bloques Conformer | 16 | 12 |
| Pesos int4 | 7,7 MB | 5,9 MB |

Como referencia, la versión 1 en streaming (fragmentos de 1,28 s, con LM, sin aceleración) obtenía 4,9/11,0 y corría a 1,8× tiempo real en el chip.

## Requisitos de hardware

- Hardware objetivo: ESP32-S3 (240 MHz, un núcleo), 8 MB de PSRAM y 16 MB de flash, sin acelerador neuronal; placa de referencia ESP32-S3-DevKitC-1 N16R8 con micrófono INMP441.
- Huella de pesos: 7,7 MB (variante A) y 5,9 MB (variante B) en int4, más el modelo de lenguaje GRU de 1,3 M de parámetros; parte de los pesos reside en flash y compite por los 8 MB de PSRAM con el estado de streaming.
- VRAM estimada para inferencia en GPU: no disponible; el modelo está pensado para el motor C en microcontrolador y su build de host, no para despliegue estándar en GPU.
- GPU recomendadas: no aplica; no se documenta despliegue en A100, H100 ni RTX 4090.
- Opciones de despliegue: motor propio del repositorio (build de host para portátil y firmware para ESP32-S3), demo en WebAssembly en Hugging Face Spaces; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: factor de tiempo real de 0,72 (A) y 0,54 (B) en el chip con LM; latencia de texto final de 431 ms y 259 ms respectivamente. Las mediciones se hicieron con audio en flash y pesos parcialmente en flash.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Contexto / streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oido-v2-realtime-int4 (A/B) | Conformer CTC int4, motor propio | 7,7 MB / 5,9 MB int4 | fragmentos de 0,64 s, contexto completo opcional | CC BY-SA 4.0 (pesos), GPLv3 (código) | Hugging Face + GitHub |
| nvidia/stt_en_conformer_ctc_small | Conformer CTC | no disponible en la información | no disponible | no disponible en la información | NGC / Hugging Face |
| Oído v1 | Conformer CTC, motor previo | no disponible | streaming 1,28 s | no disponible en la información | GitHub del proyecto |

La comparación con alternativas de la misma categoría (ASR en microcontrolador) no está disponible en la información proporcionada; el propio autor usa Oído v1 y el modelo base NVIDIA como referencias de rendimiento.

## Limitaciones y advertencias

- Solo inglés; no hay soporte multilingüe.
- El WER en test-other supera el 10 % en todos los modos de streaming; para habla ruidosa se recomienda fragmentos más largos (`CONFIG_TASR_STREAM_CHUNK=16`, aproximadamente un 20 % menos de errores a cambio de 0,6 s más de retraso) o el modo de contexto completo.
- El streaming penaliza la precisión: la variante B sacrifica unos tres puntos de WER frente a A a cambio de un 25 % más de velocidad.
- El firmware espera 0,8 s de silencio (configurable) antes de declarar el fin del habla; las latencias publicadas se miden a partir de ese momento.
- Las cifras de velocidad se obtuvieron con audio en flash y pesos parcialmente en flash, donde el modelo de lenguaje, el estado de streaming y los pesos compiten por los 8 MB de PSRAM; el rendimiento puede variar según la configuración de memoria.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.
- Licencia CC BY-SA 4.0 en los pesos: obliga a compartir bajo la misma licencia las obras derivadas; para uso comercial del código y firmware hay que acogerse a la GPLv3 o a una licencia comercial del repositorio.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un CTC con modelo de lenguaje entrenado solo con libros de dominio público, el vocabulario y el estilo pueden estar sesgados hacia ese dominio.
- El formato de pesos es propietario (TNM1), lo que limita su uso fuera del motor Oído.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lokutor-ai/oido-v2-realtime-int4
- Repositorio de código y firmware: https://github.com/lokutor-ai/oido
- Paper: https://arxiv.org/abs/2610.13447
- PDF del paper (v2): https://github.com/lokutor-ai/oido/blob/main/docs/oido-paper.pdf
- Demo en el navegador (WebAssembly): https://huggingface.co/spaces/lokutor-ai/oido-demo
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
