# lokutor-ai/oido-v2-realtime-int4

## Resumen

Oído v2 es un modelo de reconocimiento automático del habla (ASR) en inglés diseñado para ejecutarse en tiempo real en un microcontrolador ESP32-S3, sin acelerador neuronal. Lo desarrolla lokutor-ai a partir de `nvidia/stt_en_conformer_ctc_small` mediante destilación estructural, cuantización a int4 y una pila de optimizaciones de acceso a memoria. El objetivo no es competir en precisión con modelos de servidor, sino demostrar que la transcripción continua de voz es viable en hardware de menos de 5 dólares y 8 MB de PSRAM.

La innovación principal es el control del tráfico de memoria: un reconocedor en streaming relee todos los pesos en cada fragmento de audio, y el ESP32-S3 lee a 3,8 GB/s desde SRAM interna pero solo a 89 MB/s desde PSRAM y 32 MB/s desde flash. El modelo reduce el front-end convolucional de 176 a 64 canales, apila pares de tramas (tramas de encoder de 80 ms), recorta bloques del encoder y cuantiza los pesos a int4 para que la mayor parte quepa en PSRAM, solapando además la carga de pesos con el cómputo mediante la precarga asíncrona de caché de la ROM.

Se publican dos variantes: A (16 bloques Conformer, 7,7 MB en int4) y B (12 bloques, 5,9 MB), ambas acompañadas de un modelo de lenguaje GRU de 1,3 M de parámetros y del tokenizador SentencePiece de 1024 piezas del modelo original de NVIDIA. La variante A alcanza un factor de tiempo real de 0,72 y la B de 0,54 sobre un único núcleo a 240 MHz, con el modelo de lenguaje activado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer CTC (encoder Conformer + CTC), front-end convolucional de 64 canales, apilado de 2 tramas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; fragmentos de streaming de 0,64 s por defecto (configurable a 1,28 s), contexto izquierdo de 64 tramas de encoder |
| Tipos de cuantización | int4 en pesos (aritmética int4/int8 en chip); formato propietario TNM1 |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY-SA 4.0 (el código y firmware del repositorio son GPLv3, con licencias comerciales disponibles) |
| Formato de pesos | `.tnm` (TNM1) para las variantes A y B; `.tlm` para el modelo de lenguaje GRU; `tokenizer.model` (SentencePiece) |

Datos adicionales por variante:

| | Variante A (`oido_v2a.tnm`) | Variante B (`oido_v2b.tnm`) |
|---|---|---|
| Bloques Conformer | 16 | 12 |
| Peso de los pesos | 7,7 MB (int4) | 5,9 MB (int4) |
| Chunk por defecto | 8 tramas (0,64 s) | 8 tramas (0,64 s) |
| Contexto izquierdo | 64 tramas de encoder | 64 tramas de encoder |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/stt_en_conformer_ctc_small`, un encoder Conformer con cabeza CTC, y se adapta para inferencia en streaming sobre un microcontrolador. Los cambios estructurales documentados son: front-end convolucional reducido de 176 a 64 canales, apilado de pares de tramas para trabajar con tramas de encoder de 80 ms, eliminación de cuatro bloques en la variante B y cuantización de pesos a int4 para que la mayor parte del modelo resida en PSRAM. La decodificación incorpora un modelo de lenguaje GRU de 1,3 M de parámetros entrenado solo con libros de dominio público, con pesos de interpolación 0,30 y bonus de token 1,0 almacenados en la cabecera del archivo `.tlm`.

Las optimizaciones de sistema son tan relevantes como las del modelo: solapamiento de la carga de pesos con el cómputo mediante la precarga asíncrona de la caché de datos de la ROM, buffers de trabajo en SRAM interna, decodificador abaratado con exp/tanh tabulados, atajo para tramas en blanco y opción de beam 2 con top-k 3. Los datasets citados en la model card son LibriSpeech, Common Voice 17.0, Multilingual LibriSpeech y People's Speech, aunque no se detalla la composición exacta del conjunto de entrenamiento ni el número de tokens o de horas utilizadas. No se documenta RLHF ni DPO, lo cual es esperable en un modelo CTC de ASR.

## Capacidades

- Reconocimiento de voz en inglés en streaming, con salida CTC y decodificación con modelo de lenguaje.
- Funcionamiento en tiempo real sobre un único núcleo de ESP32-S3 a 240 MHz: factor de tiempo real de 0,72 (A) y 0,54 (B) con el modelo de lenguaje activado.
- Latencia de texto final tras el fin del habla de 431 ms (A, rango 281-574 ms) y 259 ms (B, rango 159-391 ms), con audio entrando a velocidad real.
- Modo de contexto completo, además del modo streaming, en el mismo archivo de modelo.
- Ajuste del tamaño de fragmento en tiempo de compilación (`CONFIG_TASR_STREAM_CHUNK`), con compromiso entre latencia y precisión.
- Decodificación configurable: greedy, beam 4 con top 6, beam 2 con top 3.
- Ejecución determinista idéntica entre el build de host y la placa: los transcripciones de la placa coinciden con las del host en 18 de 18 clips de prueba.
- No soporta tool calling, agentes, visión, audio de entrada más allá del propio ASR ni capacidades multilingües.

## Casos de uso

- Domótica por voz en dispositivos de bajo coste: el modelo cabe en 7,7 MB (variante A) y corre en un ESP32-S3 sin acelerador, lo que permite integrar reconocimiento de comandos en interruptores, termostatos o electrodomésticos con un BOM de pocos dólares y sin enviar audio a la nube.
- Wearables y dispositivos portátiles con restricciones térmicas y de batería: el factor de tiempo real de 0,54 de la variante B deja margen de cómputo en un solo núcleo, lo que permite apagar el segundo núcleo o dedicarlo a otras tareas.
- Interfaces de accesibilidad offline: transcripción local de voz a texto en inglés para personas con movilidad reducida en entornos sin conectividad, con latencia de 259-431 ms tras el fin del habla.
- Registro de notas de voz en campo: dispositivos de grabación autónomos que transcriben in situ sin infraestructura de red, usando el modo de contexto completo para maximizar precisión cuando la latencia no es crítica.
- Prototipado e investigación en TinyML: el repositorio incluye el motor C, las herramientas de flasheo y las mediciones en placa, lo que permite reproducir los experimentos y servir de base para ablaciones sobre cuantización int4, tamaños de fragmento y arquitecturas Conformer reducidas.
- Sustitución de módulos ASR comerciales en productos con requisitos de privacidad: al procesar el audio íntegramente en el dispositivo, se evita el envío de voz a servicios externos, lo que simplifica el cumplimiento de normativa de protección de datos.
- Evaluación comparativa de decodificadores en hardware limitado: la posibilidad de alternar entre greedy, beam 2 y beam 4 sobre el mismo modelo permite medir el coste real de cada estrategia en un presupuesto de memoria y cómputo muy ajustado.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, no verificados de forma independiente). Las cifras de streaming usan fragmentos de 0,64 s salvo donde se indique; las de host ejecutan el mismo código C con la misma aritmética entera que el chip.

| Configuración | LibriSpeech test-clean | LibriSpeech test-other |
|---|---|---|
| Variante A, streaming 0,64 s, greedy | 10,01 | 19,90 |
| Variante A, streaming 0,64 s + LM (beam 4, top 6) | 7,14 | 16,37 |
| Variante A, streaming 1,28 s + LM | 5,96 | 14,03 |
| Variante A, contexto completo + LM | 4,58 | 10,71 |
| Variante B, streaming 0,64 s, greedy | 13,43 | 26,10 |
| Variante B, streaming 0,64 s + LM (beam 2, top 3) | 10,63 | 22,42 |
| Variante B, streaming 1,28 s + LM | 8,08 | 18,45 |
| Variante B, contexto completo + LM | 6,15 | 14,41 |

Métricas de sistema en placa (ESP32-S3, 8 MB PSRAM, 16 MB flash, un núcleo a 240 MHz):

| Métrica | Variante A | Variante B |
|---|---|---|
| Factor de tiempo real con LM | 0,72 (beam 4, top 6) / 0,70 (beam 2, top 3) | 0,54 (beam 2, top 3) |
| Texto final tras fin del habla | 431 ms (281-574) | 259 ms (159-391) |

Como referencia, la versión 1 del modelo, con streaming de 1,28 s y modelo de lenguaje, obtenía 4,9 / 11,0 y corría a 1,8 veces el tiempo real en el chip.

## Requisitos de hardware

- Hardware objetivo: ESP32-S3 con 8 MB de PSRAM y 16 MB de flash (placa de referencia ESP32-S3-DevKitC-1 N16R8) y micrófono INMP441; sin acelerador neuronal.
- Memoria: los pesos ocupan 7,7 MB (A) o 5,9 MB (B) en int4; el modo con micrófono en vivo necesita 0,9 MB adicionales de PSRAM, y el modelo de lenguaje, el estado de streaming y los pesos compiten por los 8 MB disponibles.
- Núcleo: un único núcleo a 240 MHz; el modo de dos núcleos está desactivado porque produce salidas incorrectas en las placas del autor.
- Inferencia en host: el repositorio incluye un build para portátil (`esp32/host`) que ejecuta el mismo motor con el mismo código y aritmética, útil para desarrollo y validación sin placa.
- Despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el motor es propio y se distribuye como firmware y herramientas de flasheo en el repositorio.
- Latencia y throughput: factor de tiempo real de 0,72 (A) y 0,54 (B) con modelo de lenguaje; latencia de texto final de 259-431 ms tras el fin del habla.
- No se publican requisitos de VRAM ni recomendaciones de GPU, ya que el modelo no está pensado para inferencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | LibriSpeech test-clean / other (WER %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oído v2 A (este modelo) | no disponible (7,7 MB int4) | streaming 0,64 s; contexto completo | 7,14 / 16,37 (streaming + LM); 4,58 / 10,71 (contexto completo + LM) | CC BY-SA 4.0 | HuggingFace + GitHub |
| Oído v2 B (este modelo) | no disponible (5,9 MB int4) | streaming 0,64 s; contexto completo | 10,63 / 22,42 (streaming + LM); 6,15 / 14,41 (contexto completo + LM) | CC BY-SA 4.0 | HuggingFace + GitHub |
| Oído v1 | no disponible | streaming 1,28 s | 4,9 / 11,0 (streaming + LM) | no disponible | GitHub |
| NVIDIA `stt_en_conformer_ctc_small` (modelo base) | no disponible | no orientado a streaming en microcontrolador | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace (NVIDIA) |

No se dispone de datos de benchmarks de otros modelos ASR comparables en la información proporcionada, por lo que la comparativa se limita al modelo base, la versión anterior y las dos variantes publicadas.

## Limitaciones y advertencias

- Precisión insuficiente en habla ruidosa: test-other supera el 10 % de WER en todos los modos de streaming; se recomienda aumentar el fragmento (`CONFIG_TASR_STREAM_CHUNK=16`, aproximadamente un 20 % menos de errores a cambio de 0,6 s más de latencia) o usar el modo de contexto completo.
- Solo inglés: no hay soporte multilingüe, pese a que el conjunto de datos incluye Multilingual LibriSpeech.
- El firmware espera 0,8 s de silencio (configurable) antes de declarar el fin del habla; las latencias publicadas se miden a partir de ese momento, no desde el último fonema.
- Las cifras de velocidad se obtuvieron con audio almacenado en flash y parte de los pesos también en flash; el modo con micrófono en vivo consume 0,9 MB adicionales de PSRAM y su efecto medido se documenta en el repositorio, no en la model card.
- El modo de dos núcleos está desactivado por producir salidas incorrectas en las placas del autor.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no se han reproducido de forma independiente.
- Licencia CC BY-SA 4.0 para los pesos, lo que impone compartir las obras derivadas bajo la misma licencia; el código y el firmware del repositorio son GPLv3, con licencias comerciales disponibles por separado. Es necesario revisar la compatibilidad de ambas licencias antes de un uso comercial.
- Riesgo de alucinación propio de un modelo CTC con modelo de lenguaje: el LM puede sesgar la salida hacia secuencias más probadas en libros de dominio público, especialmente con audio ambiguo o nombres propios.
- No se documentan sesgos demográficos ni evaluación por acento o variedad dialectal; el entrenamiento declarado se apoya en LibriSpeech, Common Voice, Multilingual LibriSpeech y People's Speech, sin detalle de composición.
- El formato de pesos es propietario (TNM1) y el motor es específico del proyecto, lo que limita la portabilidad a otros runtimes de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokutor-ai/oido-v2-realtime-int4
- Repositorio de código, firmware y herramientas: https://github.com/lokutor-ai/oido
- Paper: https://arxiv.org/abs/2610.13447
- Versión del paper que describe estos modelos (v2): https://github.com/lokutor-ai/oido/blob/main/docs/oido-paper.pdf
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
