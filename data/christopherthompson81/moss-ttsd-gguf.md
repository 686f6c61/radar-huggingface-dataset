# christopherthompson81/MOSS-TTSD-GGUF

## Resumen

MOSS-TTSD-GGUF es una conversión a formato GGUF del modelo de síntesis de voz conversacional MOSS-TTSD-v1.0, desarrollado originalmente por OpenMOSS-Team. El paquete lo publica christopherthompson81 para su uso con audio.cpp, un motor de inferencia de audio nativo. El modelo resuelve la generación de diálogos hablados con múltiples hablantes en una sola pasada: el texto de entrada se etiqueta con marcadores `[S1]` y `[S2]` que indican quién habla, y cada etiqueta puede llevar su propia grabación de referencia para clonar la voz.

Técnicamente se compone de un backbone transformer de 8.000 millones de parámetros con patrón de retardo (delay pattern) y del códec MOSS-Audio-Tokenizer v1, que incluye tanto el codificador como el decodificador porque la clonación requiere el encoder. Cada archivo GGUF es autocontenido: lleva el backbone, el códec, el tokenizador y la especificación del modelo, sin dependencias externas en tiempo de carga.

Su relevancia actual radica en que permite ejecutar un modelo de TTS conversacional de 8B en GPUs de consumo: la cuantización q4_k con cabezas en f16 ocupa 9,5 GB y clona voces en tarjetas de 12 GB, con un RTF de 0,18 en TTS simple medido sobre una RTX 3090. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con delay pattern (backbone) + códec MOSS-Audio-Tokenizer v1 (RVQ, 32 capas, se usan las 16 primeras) |
| Parámetros totales | 8B (backbone) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4_k (cabezas lm en f16), q8_0, bf16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo combina un backbone autorregresivo de 8B parámetros con un patrón de retardo que permite generar simultáneamente los tokens de audio de dos hablantes, de modo que el diálogo se produce en una sola toma sin turnos separados. El audio se representa mediante el códec MOSS-Audio-Tokenizer v1, un esquema de cuantización residual vectorial (RVQ) de 32 capas del que este checkpoint consume únicamente las 16 primeras. El paquete GGUF integra el codificador y el decodificador del códec, el tokenizador de texto y la especificación del modelo.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El detalle técnico más relevante del empaquetado es que las cabezas de lenguaje (`lm_heads.0`, la cabeza de texto que decide el final de turno) se mantienen en f16 incluso en la variante q4_k: cuantizarlas a 4 bits provoca que el modelo pronuncie solo el primer turno y se detenga, a veces con una cola distorsionada. Mantener las cabezas en f16 cuesta 0,95 GB adicionales sobre un q4_k plano y es la diferencia entre un paquete usable y uno roto.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto con etiquetas de hablante `[S1]` y `[S2]`.
- Generación de diálogos de dos hablantes en una sola pasada, con cambio de turno gestionado por el propio modelo.
- Clonación de voz zero-shot a partir de grabaciones de referencia, una por hablante, con la transcripción correspondiente alineada con el audio de referencia.
- Mezcla de hablantes clonados e inventados en el mismo diálogo (por ejemplo, `[S1]` clonado y `[S2]` generado).
- Soporte de inglés y chino.
- Integración con audio.cpp mediante CLI (`--task tts` y `--task clon`), con backend CUDA.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de las referencias de clonación, ni modo de razonamiento explícito.

## Casos de uso

- Doblaje y localización de contenido conversacional: el modelo genera ambos lados de un diálogo en una sola toma con etiquetas `[S1]`/`[S2]`, lo que simplifica la producción de audio para vídeos, audiolibros dramatizados o pódcasts frente a encadenar dos sistemas TTS independientes.
- Creación de audiolibros con múltiples personajes: cada personaje se define con una referencia de voz corta y el guion se marca con etiquetas de hablante; el paquete q4_k clona en 12 GB de VRAM, lo que permite ejecutarlo en estaciones de trabajo con RTX 3090 o similares.
- Prototipado de asistentes conversacionales con voz: la licencia Apache 2.0 y el formato GGUF autocontenido permiten desplegar el modelo en entornos propios sin dependencias de servicios en la nube.
- Generación de contenido para videojuegos y narrativa interactiva: permite producir diálogos entre dos personajes con voces consistentes dentro de una misma sesión, útil para pregenerar líneas o para pruebas de concepto de doblaje.
- Investigación en clonación de voz y evaluación de TTS: el paquete incluye el codificador del códec, de modo que un investigador puede reproducir el pipeline completo de clonación y medir deriva de identidad entre turnos sin descargar componentes adicionales.
- Evaluación de motores de inferencia de audio: al existir tres cuantizaciones con cifras de VRAM y RTF publicadas sobre RTX 3090, sirve como banco de pruebas para comparar audio.cpp con la implementación de referencia en PyTorch.
- Generación de material accesible: conversión de guiones escritos a audio con dos voces para contenido formativo o divulgativo en inglés o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible. Sí se publican métricas de rendimiento medidas en una RTX 3090 (24 GiB) con audio.cpp:

| Paquete | VRAM pico, TTS simple | VRAM pico, clonación | RTF, TTS simple | RTF, clonación |
|---|---|---|---|---|
| q4_k | 8,2 GiB | 10,1 GiB | 0,18 | 0,27–0,30 |
| q8_0 | 10,9 GiB | 12,7 GiB | 0,23 | 0,26–0,39 |
| bf16 | 17,6 GiB | 19,4 GiB | 0,33 | 0,41–0,52 |

El RTF se define como tiempo de sesión dividido por la duración del audio generado, excluyendo la carga del paquete. Los rangos provienen de tres semillas que produjeron tomas de distinta longitud. Además, se documenta una medición de deriva de identidad de hablante mediante F0 mediana por turno, con dos referencias separadas 84 Hz, sobre tres ejecuciones de la implementación de referencia en PyTorch y una de audio.cpp:

| Ejecución | S1 turno 1 | S1 turno 2 | S2 turno 1 | S2 turno 2 |
|---|---|---|---|---|
| referencia 1 | 200,0 | 110,3 | 154,8 | 131,9 |
| referencia 2 | 203,4 | 102,8 | 179,1 | 160,0 |
| referencia 3 | 208,8 | 104,8 | 161,1 | 152,5 |
| audio.cpp (semilla 7) | 210,5 | 120,6 | 166,7 | 164,4 |
| referencias | S1 = 201,7 Hz | | S2 = 117,6 Hz | |

## Requisitos de hardware

- VRAM para inferencia: 8,2 GiB (q4_k, TTS simple), 10,9 GiB (q8_0), 17,6 GiB (bf16); en clonación, 10,1 GiB, 12,7 GiB y 19,4 GiB respectivamente.
- GPU recomendadas: RTX 3090 (24 GiB) es la tarjeta de referencia de las mediciones; cualquier GPU con al menos 12 GB permite clonación con q4_k y 16 GB con q8_0.
- Cabe en GPU de consumo: sí. q4_k clona en 12 GB y q8_0 en 16 GB; bf16 requiere 24 GiB para clonación con builds recientes de audio.cpp.
- Despliegue: exclusivamente mediante audio.cpp (CLI `audiocpp_cli`), con backend CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,18–0,33 en TTS simple y 0,26–0,52 en clonación sobre RTX 3090, según cuantización. El primer clonado de una sesión carga además el codificador del códec, por lo que las tomas cortas presentan el extremo alto del rango.
- Nota de compatibilidad: para clonación en bf16 se requiere audio.cpp con el PR #690 o posterior. Builds antiguas cargaban el códec en f32 en GPU y duplicaban su huella, haciendo fallar la clonación bf16 en tarjetas de 24 GiB. Desde #687 el decodificador del códec y la caché KV operan en f16; desde #690 los pesos del codificador permanecen en VRAM en f16 y se ensanchan a f32 solo durante su uso, con cómputo idéntico a una carga f32.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de modelos alternativos de TTS conversacional con clonación, por lo que la comparativa cuantitativa no está disponible. Como referencia estructural, este paquete se posiciona frente a su modelo base original:

| Modelo | Parámetros | Formato | Licencia | Clonación | Idiomas |
|---|---|---|---|---|---|
| MOSS-TTSD-GGUF (este) | 8B | GGUF (q4_k, q8_0, bf16) | Apache 2.0 | Sí, con encoder incluido | en, zh |
| OpenMOSS-Team/MOSS-TTSD-v1.0 | 8B | PyTorch (no disponible el detalle exacto) | no disponible en esta información | Sí, requiere resolver el códec aparte | en, zh |

## Limitaciones y advertencias

- Deriva de identidad de hablante entre turnos: la F0 mediana del primer hablante cae en su segundo turno hasta aproximarse a la referencia del otro hablante, y el segundo hablante queda entre ambas referencias. Ocurre también en la implementación de referencia en PyTorch, por lo que es una limitación del modelo, no de la conversión ni del motor. La medición usa referencias cortas (3,4 s y 4,2 s) y F0 mediana como aproximación burda de la identidad; debe leerse como "la identidad deriva", no como una tasa medida.
- El q4_k plano está roto: con las cabezas de lenguaje cuantizadas a 4 bits el modelo pronuncia solo el primer turno (2,6–3,2 s) y se detiene. Este paquete corrige el problema manteniendo `lm_heads` en f16, pero cualquier conversión propia debe replicar ese ajuste.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de calidad (MOS, WER, similitud de hablante) en la información disponible.
- La clonación exige que la transcripción de referencia coincida con el audio de referencia, ya que el modelo continúa a partir de la grabación.
- El número de entradas en `voice_samples=` debe coincidir con el número de hablantes; un separador final es significativo y no un error tipográfico.
- Dependencia estricta de audio.cpp: no hay soporte documentado para otros motores de inferencia, lo que limita la portabilidad.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan cláusulas adicionales del modelo base ni consideraciones de consentimiento para la clonación de voces.
- El repositorio ocupa 43,5 GB y contiene tres cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/christopherthompson81/MOSS-TTSD-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v1.0
- Códec base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Motor de inferencia audio.cpp: https://github.com/0xShug0/audio.cpp
- PR de soporte del modelo en audio.cpp: https://github.com/0xShug0/audio.cpp/pull/690
