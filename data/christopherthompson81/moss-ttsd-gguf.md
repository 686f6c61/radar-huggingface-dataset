# christopherthompson81/MOSS-TTSD-GGUF

## Resumen

MOSS-TTSD-GGUF es una conversión a formato GGUF del modelo de síntesis de voz OpenMOSS-Team/MOSS-TTSD-v1.0, publicada por el usuario christopherthompson81 para el motor audio.cpp. MOSS-TTSD es un sistema de texto a voz orientado a diálogo: el texto de entrada se etiqueta con marcas de hablante (`[S1]`, `[S2]`) y el modelo genera los turnos de ambos interlocutores en una sola pasada, con la posibilidad de asignar una grabación de referencia distinta a cada etiqueta para clonar la voz. El backbone es un transformer autorregresivo de 8B con patrón de retardo (delay-pattern) y el audio se representa mediante el códec neural MOSS-Audio-Tokenizer v1, del que este checkpoint consume las 16 primeras capas RVQ de las 32 disponibles.

El interés práctico de esta publicación no está en un modelo nuevo, sino en el empaquetado: cada archivo GGUF es autocontenido e incluye backbone, códec (tanto encoder como decoder, necesario para la clonación), tokenizer y especificación del modelo, de modo que no hay que descargar nada más. Se ofrecen tres variantes (q8_0 de 12,2 GB, q4_k de 9,5 GB con las cabezas en f16 y bf16 de 18,9 GB), pensadas para ejecutarse en GPUs de 24 GiB como la RTX 3090.

La model card documenta dos problemas medidos con detalle: una cuantización q4_k ingenua rompe la generación de diálogo (las cabezas de texto en 4 bits terminan el turno de forma prematura), y la identidad del hablante se degrada a lo largo de los turnos, un comportamiento que reproduce también la implementación de referencia en PyTorch. El modelo soporta inglés y chino, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo de 8B con patrón de retardo (delay-pattern) para los tokens de audio, más códec neural MOSS-Audio-Tokenizer v1 (RVQ) |
| Parametros totales | 8B (backbone) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0; q4_k con `lm_heads` en f16; bf16. El códec se mantiene siempre en f16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, autocontenido (backbone + encoder y decoder del códec + tokenizer + especificación) |
| Tamaño de los archivos | 9,5 GB (q4_k), 12,2 GB (q8_0), 18,9 GB (bf16) |
| Capas RVQ del códec utilizadas | 16 de 32 |
| Pipeline | text-to-speech |
| Motor compatible | audio.cpp (`audiocpp_cli`) |
| Fecha de publicación | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El backbone es un transformer autorregresivo de 8B que genera tokens de audio bajo un esquema de patrón de retardo, lo que permite modelar simultáneamente flujos de audio intercalados correspondientes a varios hablantes. La representación acústica corre a cargo de MOSS-Audio-Tokenizer v1, un códec de cuantización vectorial residual (RVQ) con 32 capas, de las cuales este checkpoint lee únicamente las 16 primeras. Como el modelo base no incluye los pesos del códec (su processor resuelve OpenMOSS-Team/MOSS-Audio-Tokenizer en tiempo de carga), el empaquetado GGUF incorpora tanto el encoder como el decoder: el encoder es imprescindible para la clonación de voz, ya que el modelo continúa la generación a partir del audio de referencia.

El modelo entra en modo diálogo mediante etiquetas de hablante en el texto (`[S1]`, `[S2]`), y cada etiqueta puede llevar su propia grabación de referencia más la transcripción de lo que dice esa grabación; el modelo prosigue desde el audio de referencia, por lo que la transcripción debe coincidir con él. Dejando una entrada vacía (por ejemplo `s1.wav,`) se clona un solo hablante y el modelo inventa el otro. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

En el lado de la conversión, la decisión técnica relevante es mantener `model_weights/lm_heads*=f16` al cuantizar a q4_k: `lm_heads.0` es la cabeza de texto que decide cuándo termina un turno y, a cuatro bits, lo cierra antes de tiempo. Ese ajuste cuesta 0,95 GB adicionales sobre un q4_k plano.

## Capacidades

- Generación de voz a partir de texto en inglés y chino (text-to-speech).
- Diálogo multiturno con dos hablantes en una sola pasada, controlado con las etiquetas `[S1]` y `[S2]` insertadas en el texto.
- Clonación de voz a partir de grabaciones de referencia, con una referencia independiente por hablante.
- Clonación parcial: es posible clonar solo un hablante y dejar que el modelo genere la voz del otro.
- Continuación a partir del audio de referencia: la transcripción de la referencia debe alinearse con lo que dice la grabación.
- Ejecución local autocontenida, sin descargas adicionales de códec o tokenizer.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio de entrada más allá de las referencias de clonación.
- No se documenta ningún modo de razonamiento explícito (thinking mode).

## Casos de uso

- Producción de diálogos sintéticos para pódcast y ficción sonora: el modelo genera los turnos de dos interlocutores en una sola pasada a partir de un guion etiquetado con `[S1]` y `[S2]`, lo que evita concatenar dos síntesis monohablante distintas.
- Doblaje y localización entre inglés y chino: con una referencia de voz por hablante se puede mantener un timbre consistente en la versión doblada, siempre que se asuma la deriva de identidad documentada a lo largo de los turnos.
- Preproducción de diálogos para videojuegos: generar líneas de NPC con dos voces diferenciadas antes de contratar actores, usando los paquetes q4_k o q8_0 en una GPU de 24 GiB.
- Audiolibros y contenido de accesibilidad con dos narradores: el etiquetado por hablante permite alternar narrador y personaje sin cambiar de modelo ni de pipeline.
- Generación de datos sintéticos para investigación en ASR y diarización: se pueden producir conversaciones multiturno con marcas de hablante conocidas y en dos idiomas, con licencia Apache 2.0.
- Evaluación de motores de inferencia: al ser una conversión de la implementación de referencia en PyTorch, sirve para comparar el comportamiento de audio.cpp frente a la referencia, como hace la propia model card con las mediciones de F0 y los tiempos de generación.
- Prototipado de asistentes de voz conversacionales: la alternancia de turnos y la clonación permiten montar demos locales sin depender de APIs en la nube.
- Experimentación con cuantización en hardware de consumo: el paquete q4_k de 9,5 GB con cabezas en f16 documenta explícitamente el compromiso entre tamaño y calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card sí incluye mediciones de tiempo de generación y de estabilidad del hablante, recogidas aquí tal cual:

| Configuracion | Tiempo | Resultado |
|---|---|---|
| q4_k con cabezas cuantizadas | 2,6-3,2 s | Solo el primer turno, a veces con cola corrupta |
| q4_k con cabezas en f16 | 9,1-16,5 s | Guion completo |
| q8_0 | 10-12,5 s | Guion completo |
| q8_0 con clonación (incluye carga) | 12,7 s | Correcto en una tarjeta de 24 GiB |

Medición de frecuencia fundamental mediana (F0) por turno, con referencias de 201,7 Hz (S1) y 117,6 Hz (S2):

| Ejecucion | S1 turno 1 | S1 turno 2 | S2 turno 1 | S2 turno 2 |
|---|---|---|---|---|
| Referencia PyTorch, ejecución 1 | 200,0 | 110,3 | 154,8 | 131,9 |
| Referencia PyTorch, ejecución 2 | 203,4 | 102,8 | 179,1 | 160,0 |
| Referencia PyTorch, ejecución 3 | 208,8 | 104,8 | 161,1 | 152,5 |
| audio.cpp (semilla 7) | 210,5 | 120,6 | 166,7 | 164,4 |

El autor advierte que la F0 mediana es una aproximación burda de la identidad del hablante, que se trata de cuatro ejecuciones de una sola configuración con referencias cortas (3,4 s y 4,2 s) y que debe leerse como "la identidad deriva entre turnos", no como una tasa medida. No se indica la longitud del guion empleado en las mediciones de tiempo.

## Requisitos de hardware

- VRAM estimada según el tamaño de archivo del backbone más el códec en f16: 9,5 GB (q4_k), 12,2 GB (q8_0) y 18,9 GB (bf16); a esto hay que sumar la sobrecarga del motor.
- La clonación requiere además el encoder del códec, cuyos pesos piden unos 3,5 GB adicionales sobre el backbone.
- GPU de 24 GiB (RTX 3090, RTX 4090): el paquete q8_0 clona correctamente, con 12,7 s incluyendo la carga. El paquete bf16 falla al clonar en una RTX 3090 con un error de asignación en `moss.audio_tokenizer.encoder`; la generación sin clonación en bf16 sí funciona.
- GPU de consumo de 16 GiB: el paquete q4_k (9,5 GB) es el candidato natural, pero no hay verificación de este escenario en la información disponible (estimación).
- Motor de despliegue documentado: audio.cpp mediante `audiocpp_cli` con `--backend cuda`, tareas `tts` y `clon` y familia `moss_ttsd`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: entre 9,1 y 16,5 s para el guion completo con q4_k de cabezas en f16, y entre 10 y 12,5 s con q8_0, en la configuración de prueba del autor. No se publican cifras de throughput.

## Comparativa con modelos similares

No hay datos comparativos con otras familias de TTS en la información disponible. La comparación posible se limita a las tres variantes de este mismo empaquetado y a su modelo base:

| Variante | Backbone | Codec | Tamaño | Clona en 24 GiB | Calidad de diálogo |
|---|---|---|---|---|---|
| moss_ttsd_q4_k_codec_f16.gguf | q4_k con cabezas f16 | f16 | 9,5 GB | Sí | Guion completo |
| moss_ttsd_q8_0_codec_f16.gguf | q8_0 | f16 | 12,2 GB | Sí (12,7 s con carga) | Guion completo |
| moss_ttsd_bf16_codec_f16.gguf | bf16 | f16 | 18,9 GB | No (falla el encoder en 24 GiB) | Guion completo sin clonación |
| OpenMOSS-Team/MOSS-TTSD-v1.0 | Pesos originales | Se resuelve en carga | no disponible | no disponible | Implementación de referencia |

Frente a otras alternativas de TTS con clonación de voz, no se dispone de parámetros, contexto, benchmarks ni licencias comparables en la información proporcionada.

## Limitaciones y advertencias

- Deriva de identidad del hablante entre turnos: el primer turno de S1 se aproxima bien a su referencia (210,5 Hz frente a 201,7 Hz), pero en el segundo turno la F0 cae hasta valores cercanos a la referencia del otro hablante. El fenómeno aparece también en las tres ejecuciones de la implementación de referencia en PyTorch, por lo que es propio del modelo, no de la conversión ni del motor.
- La cuantización q4_k con las cabezas cuantizadas está rota de forma silenciosa: genera solo el primer turno de un diálogo y a veces con cola corrupta. Es obligatorio conservar `lm_heads` en f16.
- El paquete bf16 no permite clonar en tarjetas de 24 GiB, porque la clonación necesita el encoder del códec y sus pesos adicionales.
- La clonación exige que la transcripción de la referencia coincida con lo que dice la grabación, ya que el modelo continúa la generación desde ese audio; un desajuste degrada el resultado.
- Idiomas limitados a inglés y chino; no se documenta cobertura de otras lenguas, incluido el castellano.
- Solo se leen 16 de las 32 capas RVQ del códec, lo que puede limitar la fidelidad acústica respecto al modelo completo.
- Riesgo de alucinación y de artefactos acústicos inherente a los modelos generativos de audio; no se documentan evaluaciones de robustez, sesgo de hablante ni calidad perceptual (MOS).
- No hay soporte documentado de tool calling, agentes ni entrada de audio arbitraria más allá de las referencias de clonación.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base y de las voces de referencia empleadas, especialmente en escenarios de clonación.
- El repositorio no tiene descargas ni valoraciones registradas en el momento de la consulta, por lo que no hay validación externa de los paquetes publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/christopherthompson81/MOSS-TTSD-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v1.0
- Códec base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Motor de inferencia audio.cpp: https://github.com/0xShug0/audio.cpp
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web realizada.
