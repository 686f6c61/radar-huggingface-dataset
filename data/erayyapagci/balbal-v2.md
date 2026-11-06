# erayyapagci/balbal-v2

## Resumen

balbal-v2 es un modelo de reconocimiento automático del habla (ASR) centrado en el turco, desarrollado por el autor erayyapagci como una versión afinada de su modelo anterior balbal-v1. Su propuesta de valor principal es ofrecer una transcripción precisa y rápida directamente en CPU: con solo 45,4 millones de parámetros, el modelo alcanza una velocidad 236 veces superior al tiempo real con 8 hilos, lo que lo hace adecuado para despliegues en local, dispositivos de borde y aplicaciones móviles sin depender de GPU.

Técnicamente, se trata de un modelo Conformer-CTC con un "looped refiner" (un refinador Transformer que itera 3 veces sobre la distribución CTC) y una memoria acústica de product-key de 500x500 subclaves, decodificado con un modelo de lenguaje KenLM de 6-gramas sobre piezas SentencePiece. Fue entrenado con aproximadamente 5.000 horas de audio y distribuye sus pesos en formato ONNX, con un repositorio de 1,0 GB.

El modelo destaca especialmente en llamadas telefónicas en turco (9,46% WER en Mu-Bench tr-TR, mejorando el 11,93% de balbal-v1) y en habla leída (5,22% WER en FLEURS turco). También transcribe inglés con menor precisión. Existe un hermano mayor y más preciso, balbal-v2-manas, con 313 millones de parámetros para turco e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (16 capas, d_model 176, 80 mel, submuestreo 4x a frames de 40 ms) + looped refiner Transformer de 2 capas (anchura 192, 3 pasadas) + memoria acústica product-key |
| Parametros totales | 45,4M (30,0M corresponden a la tabla de memoria) |
| Parametros activos | no disponible (la tabla de memoria solo lee unas pocas filas por frame, pero no se publica la cifra exacta) |
| Longitud de contexto | Audio en chunks de 30 segundos (el audio más largo se corta en segmentos de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (principal), inglés (con menor precisión) |
| Licencia | balbal-community-license-1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo combina tres componentes. El primero es un codificador acústico Conformer-CTC de 16 capas con d_model 176, que procesa 80 filtros mel y aplica un submuestreo 4x hasta frames de 40 ms. El segundo es un refinador ("looped refiner") de 2 capas Transformer con anchura 192 que se sitúa sobre la salida del codificador y ejecuta 3 pasadas, tomando en cada pasada la distribución CTC de la pasada anterior como entrada; este mecanismo iterativo permite refinar progresivamente las hipótesis de transcripción. El tercer componente es una memoria acústica de product-key con 500x500 subclaves, 4 cabezas, top-16, dimensión de valor 120 y contexto de 3 frames, que aporta 30,0M de los 45,4M parámetros totales, aunque por frame solo se leen unas pocas filas de la tabla.

La decodificación se realiza con un modelo de lenguaje KenLM de 6-gramas sobre un vocabulario SentencePiece de 1.024 piezas más el token CTC blank. El entrenamiento se llevó a cabo con unas 5.000 horas de audio. El modelo es un fine-tuning de balbal-v1. La salida es texto con mayúsculas, puntuación y marcas de tiempo por palabra; los números se emiten como dígitos mediante normalización inversa de texto (ITN), con opción `--no-itn` para conservar las palabras habladas. El código del proyecto se publica bajo licencia Apache 2.0 en GitHub.

## Capacidades

- Transcripción de voz a texto en turco con alta precisión, tanto en habla leída como en llamadas telefónicas.
- Transcripción de inglés con precisión inferior a la del turco (WER de 10,32% en LibriSpeech clean).
- Salida con mayúsculas y puntuación automáticas.
- Marcas de tiempo por palabra en la transcripción.
- Normalización inversa de texto (ITN): los números se emiten como dígitos, con opción de desactivarla.
- Procesamiento de audio largo mediante troceado en chunks de 30 segundos.
- Inferencia muy rápida en CPU: 236x más rápido que el tiempo real con 8 hilos.
- Distribución en formato ONNX, lo que facilita el despliegue multiplataforma (incluida una demo en navegador y una app Android).
- No soporta tool calling, function calling ni capacidades de agente: es un modelo ASR especializado, no un LLM.

## Casos de uso

- Transcripción de llamadas telefónicas en turco: con un WER del 9,46% y un sigWER del 18,44% en Mu-Bench tr-TR, es adecuado para centros de contacto que necesiten transcribir conversaciones telefónicas para análisis de calidad, cumplimiento normativo o minería de información.
- Transcripción en local sin GPU: su velocidad de 236x tiempo real en CPU con 8 hilos permite procesar grandes volúmenes de audio en servidores modestos o estaciones de trabajo sin acelerador, reduciendo costes de infraestructura.
- Aplicaciones móviles y de borde: la distribución en ONNX, el tamaño reducido (1,0 GB el repositorio) y la existencia de una app Android oficial hacen viable la transcripción offline en dispositivos móviles.
- Subtitulado y accesibilidad: las marcas de tiempo por palabra y la puntuación automática facilitan la generación de subtítulos sincronizados para vídeos y retransmisiones en turco.
- Transcripción de reuniones y conferencias: aunque con WER más alto en inglés (31,52% en AMI Meetings), puede usarse como transcripción aproximada de reuniones; en turco, el rendimiento en habla espontánea es su punto fuerte.
- Procesamiento de archivos de audio largos: el troceado automático en chunks de 30 segundos permite transcribir podcasts, grabaciones o archivos de audio extensos sin gestión manual de segmentos.
- Sistemas de dictado: la salida con mayúsculas, puntuación e ITN (números como dígitos) produce texto listo para usar sin postprocesado pesado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados). Para los modelos de la familia balbal se usa decodificación KenLM; los demás modelos abiertos se evalúan con su inferencia por defecto. FLEURS se puntúa con el normalizador balbal-normalizer y Mu-Bench con su harness oficial y GPT-4.1 como juez.

| Modelo | Parametros | Mu-Bench WER | Mu-Bench sigWER | FLEURS WER / CER | Velocidad CPU |
|---|---|---|---|---|---|
| balbal-v2 | 45,4M | 9,46 | 18,44 | 5,22 / 1,52 | 236x tiempo real (8 hilos) |
| balbal-v1 | no disponible | 11,93 | 25,18 | 6,54 / no disponible | no disponible |

Resultados adicionales de balbal-v2 en inglés (WER, split test):

| Dataset | WER |
|---|---|
| LibriSpeech (clean) | 10,32 |
| LibriSpeech (other) | 19,35 |
| AMI (Meetings, ihm) | 31,52 |
| Earnings-22 | 30,86 |
| Vox Populi (en) | 18,18 |
| GigaSpeech | 23,43 |
| SPGI Speech | 16,17 |
| TED-LIUM 3 | 14,96 |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU (formato ONNX, 45,4M parámetros, repositorio de 1,0 GB).
- GPU recomendadas: no disponible; el modelo no requiere GPU.
- Consumer hardware: sí; el autor reporta 236x tiempo real con 8 hilos de un AMD Ryzen AI Max+ 395, lo que indica que cualquier CPU moderna de escritorio o portátil es suficiente.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo), demo en navegador y app Android oficiales; el código de inferencia está disponible en el repositorio de GitHub del proyecto (Apache 2.0). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 236 segundos de audio procesados por segundo de cómputo en CPU (batch 1, 8 hilos, AMD Ryzen AI Max+ 395), medido sobre 100 clips.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Mu-Bench tr WER | FLEURS tr WER | Licencia |
|---|---|---|---|---|---|
| balbal-v2 | 45,4M | tr, en | 9,46 | 5,22 | balbal-community-license-1.0 |
| balbal-v1 (base) | no disponible | tr | 11,93 | 6,54 | balbal-community-license-1.0 |
| balbal-v2-manas | 313M | tr, en | no disponible | no disponible | no disponible |

balbal-v2-manas es el hermano mayor de la familia, más grande y más preciso según el autor, aunque la model card de balbal-v2 no incluye sus cifras completas. La comparativa con otros modelos ASR abiertos (Whisper, etc.) se menciona en la model card original pero los datos completos de la tabla comparativa no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El inglés es secundario: aunque el modelo transcribe inglés, su precisión es notablemente inferior (WER de 10,32% en LibriSpeech clean frente a los ~2% de sistemas punteros), y en audio difícil como reuniones (AMI, 31,52%) o ganancias corporativas (Earnings-22, 30,86%) el rendimiento degrada considerablemente.
- Los benchmarks son declarados por el autor y no están verificados ("verified: false" en el model-index); además, los modelos balbal se evalúan con decodificación KenLM mientras que los competidores usan su inferencia por defecto, lo que puede sesgar la comparación.
- La licencia balbal-community-license-1.0 es una licencia personalizada ("other"); debe revisarse el texto completo en el repositorio antes de cualquier uso comercial, ya que las licencias comunitarias suelen incluir restricciones de tamaño, uso o revenue.
- El audio se procesa en chunks de 30 segundos, lo que puede afectar a la coherencia en transcripciones de audio muy largo.
- Cero descargas registradas en Hugging Face en el momento de la ficha: es un modelo muy nuevo y con adopción mínima, por lo que conviene validar su comportamiento en datos propios antes de producción.
- No hay información sobre sesgos conocidos, riesgo de alucinación específico ni cuantizaciones disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erayyapagci/balbal-v2
- Modelo base (balbal-v1): https://huggingface.co/erayyapagci/balbal-v1
- Modelo hermano mayor (balbal-v2-manas): https://huggingface.co/erayyapagci/balbal-v2-manas
- Código (Apache 2.0): https://github.com/erayyap/balbal
- Página oficial del proyecto, benchmarks, demo en navegador y app Android: https://erayy.com/balbal/
- Versión en turco de la página: https://erayy.com/tr/balbal/
- Datasets de evaluación: https://huggingface.co/datasets/sierra-research/mu-bench, https://huggingface.co/datasets/google/fleurs, https://huggingface.co/datasets/edinburghcstr/ami
