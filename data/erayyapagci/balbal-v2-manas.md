# erayyapagci/balbal-v2-manas

## Resumen

balbal-v2-manas es un modelo de reconocimiento automático del habla (ASR) desarrollado por erayyapagci, diseñado para transcribir audio en turco e inglés con un enfoque explícito en eficiencia sobre CPU. Se trata de un fine-tuning del modelo nvidia/stt_en_fastconformer_ctc_large, sobre el que el autor ha añadido componentes propios: un refinador Transformer en bucle ("looped refiner") y una memoria acústica de product-key, además de un decodificador KenLM de 6-gramas sobre piezas SentencePiece. El resultado es un modelo de 313,3M de parámetros (de los cuales 192,0M corresponden a la tabla de memoria) entrenado sobre aproximadamente 7.000 horas de audio.

El modelo resuelve el problema de la transcripción de voz en turco en condiciones realistas, en particular en llamadas telefónicas, un dominio tradicionalmente difícil para los ASR open source. Declara 8,20% WER y 14,89% sigWER en Mu-Bench turco, 4,06% WER en FLEURS turco y una media de 8,67% WER en los conjuntos de test del English Open ASR Leaderboard. Su propuesta diferencial es ofrecer estos resultados sin GPU: 123× más rápido que tiempo real sobre 8 hilos de CPU.

La relevancia actual del modelo radica en su combinación de precisión competitiva en turco con un coste de despliegue muy bajo, lo que lo hace atractivo para integraciones en telefonía, atención al cliente y aplicaciones móviles donde no se dispone de aceleradores. Se distribuye en formato ONNX y con licencia propia (balbal-community-license-1.1), no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC (18 capas, d_model 512, 80 mel, subsampling 4x, tramas de 40 ms) con refinador Transformer en bucle de 2 capas (ancho 256, 3 pasadas) y memoria acústica product-key |
| Parametros totales | 313,3M (192,0M corresponden a la tabla de memoria) |
| Parametros activos | no aplica (no es MoE; la memoria lee solo unas pocas filas por trama) |
| Longitud de contexto | no disponible como ventana de tokens; el audio se procesa en fragmentos de 30 s |
| Tipos de cuantizacion | no disponible (distribución en ONNX; el autor no detalla cuantizaciones) |
| Idiomas soportados | turco (tr) e inglés (en) |
| Licencia | balbal-community-license-1.1 (licencia propia, no estándar) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de un encoder FastConformer-CTC de 18 capas con dimensión 512 y front-end de 80 filtros mel con subsampling 4x, lo que produce tramas de 40 ms. Sobre la salida del encoder se aplica un refinador Transformer de 2 capas y ancho 256 que opera en 3 pasadas, donde cada pasada recibe como entrada la distribución CTC de la pasada anterior. Adicionalmente, una memoria acústica de product-key con 1.000×1.000 subclaves, 8 cabezas, top-32, dimensión de valor 192 y contexto de 3 tramas aporta información acústica adicional al decodificador.

El vocabulario es SentencePiece de 2.048 piezas más el token CTC blank, y la decodificación se realiza con un KenLM de 6-gramas sobre tokens. El entrenamiento se hizo sobre aproximadamente 7.000 horas de audio (la model card no desglosa la composición del dataset ni si hubo etapas de alineamiento o ajuste fino supervisado más allá del fine-tuning desde el modelo base de NVIDIA). La salida es texto con mayúsculas, puntuación y marcas de tiempo por palabra; la normalización inversa de texto del código convierte números a dígitos, y el flag `--no-itn` conserva las palabras tal como se pronuncian.

## Capacidades

- Transcripción de voz a texto en turco e inglés con un único modelo.
- Salida con mayúsculas, puntuación y marcas de tiempo a nivel de palabra.
- Normalización inversa de texto (números en dígitos) integrada en el código de inferencia.
- Manejo de audio largo mediante segmentación automática en fragmentos de 30 s.
- Decodificación con KenLM de 6-gramas para mejorar la coherencia léxica.
- Inferencia eficiente en CPU (123× tiempo real sobre 8 hilos), sin requerir GPU.
- Distribución en ONNX, apta para despliegue en entornos sin CUDA.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción; es un modelo puramente ASR.

## Casos de uso

- Transcripción de llamadas telefónicas en turco: el modelo declara 8,20% WER y 14,89% sigWER en Mu-Bench tr-TR, un dominio de telefonía real, por lo que es adecuado para sistemas de atención al cliente y análisis de calidad de llamadas donde el audio es de banda estrecha y con ruido.
- Subtitulado y actas de reuniones en inglés: con 13,31% WER en AMI (ihm) y 5,20% en TED-LIUM 3, puede emplearse para generar transcripciones con marcas de tiempo en reuniones y charlas, apoyándose en la segmentación automática de 30 s.
- Despliegue en servidores sin GPU: al correr a 123× tiempo real en 8 hilos de CPU, permite montar servicios de transcripción en infraestructura convencional o en contenedores sin acelerador, reduciendo coste operativo.
- Aplicaciones móviles y de escritorio: la distribución ONNX y el rendimiento en CPU facilitan la integración en apps Android (el autor mantiene una app) y en herramientas de escritorio para dictado o notas de voz.
- Análisis de contenido audiovisual en turco: la combinación de marcas de tiempo por palabra y normalización de números permite indexar y buscar dentro de vídeos, pódcasts y archivos de audio.
- Investigación en ASR de bajos recursos: al ser un fine-tuning documentado sobre FastConformer con componentes propios (refinador en bucle y memoria product-key), sirve como referencia reproducible para experimentos de arquitectura en turco e inglés.
- Transcripción de audio financiero en inglés: con 15,61% WER en Earnings-22, puede usarse para generar actas de llamadas de resultados, aunque con mayor tasa de error que en otros dominios.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Los modelos balbal usan decodificación KenLM; el resto, su inferencia por defecto. FLEURS se puntúa con balbal-normalizer y Mu-Bench con su harness oficial y juez GPT-4.1. La velocidad CPU se mide sobre 100 clips, batch 1, 8 hilos de un AMD Ryzen AI Max+ 395.

| Conjunto | Idioma | Métrica | Valor |
|---|---|---|---|
| Mu-Bench (tr-TR, llamadas) | tr | WER | 8,20 |
| Mu-Bench (tr-TR, llamadas) | tr | sigWER | 14,89 |
| FLEURS (tr_tr) | tr | WER | 4,06 |
| FLEURS (tr_tr) | tr | CER | 1,21 |
| LibriSpeech clean | en | WER | 2,97 |
| LibriSpeech other | en | WER | 6,45 |
| AMI (ihm) | en | WER | 13,31 |
| Earnings-22 | en | WER | 15,61 |
| Vox Populi (en) | en | WER | 7,82 |
| GigaSpeech | en | WER | 12,30 |
| SPGI Speech | en | WER | 5,73 |
| TED-LIUM 3 | en | WER | 5,20 |

El autor resume el rendimiento en inglés como 8,67% WER de media en los conjuntos del English Open ASR Leaderboard. Velocidad declarada: 123× tiempo real en CPU (8 hilos).

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse sin GPU; el autor reporta 123× tiempo real sobre 8 hilos de un AMD Ryzen AI Max+ 395.
- VRAM estimada: no aplica para el modo CPU; para ejecución en GPU no se proporcionan cifras, aunque con 313,3M de parámetros en FP32 el peso ronda 1,25 GB y en FP16 unos 0,63 GB, sin contar la memoria de activaciones.
- GPU recomendadas: no disponible (el autor no publica requisitos de GPU).
- ¿Cabe en GPU de consumo? Sí, por tamaño (313,3M de parámetros), pero no hay datos oficiales de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (formato de pesos distribuido); el código de referencia está en el repositorio GitHub del autor (Apache 2.0) y el paquete PyPI `balbal`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: 123× tiempo real en CPU con 8 hilos (dato del autor); no se publican cifras de latencia por petición ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / audio | Licencia | Formato | Rendimiento destacado |
|---|---|---|---|---|---|---|
| balbal-v2-manas | 313,3M | tr, en | fragmentos de 30 s | balbal-community-license-1.1 | ONNX | 8,20% WER Mu-Bench tr; 4,06% WER FLEURS tr; 123× tiempo real en CPU |
| balbal-v2 | 45M (según model card) | tr, en | fragmentos de 30 s | balbal-community-license-1.1 (presumiblemente) | ONNX | 236× tiempo real en CPU (hermano pequeño y más rápido) |
| nvidia/stt_en_fastconformer_ctc_large | no disponible en la información | en | no disponible | no disponible | no disponible | modelo base del que parte el fine-tuning |

No se dispone en la información proporcionada de resultados comparativos con otros modelos ASR turcos de referencia (por ejemplo, Whisper o MMS), por lo que la comparativa se limita a los modelos citados por el autor.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados; no hay evaluación independiente publicada en la información disponible.
- Solo cubre turco e inglés; no se documenta soporte para otras lenguas.
- El audio se procesa en fragmentos de 30 s, lo que puede introducir errores en los cortes y pérdida de contexto en conversaciones largas.
- Riesgo de alucinación y de errores en dominios con ruido, acentos marcados o solapamiento de hablantes; el propio autor reporta 15,61% WER en Earnings-22 y 13,31% en AMI.
- Licencia propia (balbal-community-license-1.1), no estándar: es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- El tamaño del repositorio (3,9 GB) y la inclusión de una tabla de memoria de 192M de parámetros implican un consumo de memoria y almacenamiento superior al de un modelo CTC convencional de tamaño similar.
- No se documentan sesgos demográficos ni de acento; al entrenarse sobre unas 7.000 horas de audio sin desglose público de la composición, la cobertura de variedades dialectales del turco es incierta.
- La decodificación con KenLM y la normalización inversa de texto están implementadas en el código del autor, no en el propio modelo; su comportamiento depende de la versión del paquete `balbal`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erayyapagci/balbal-v2-manas
- Modelo hermano pequeño: https://huggingface.co/erayyapagci/balbal-v2
- Página del proyecto, demo en navegador y app Android: https://erayy.com/balbal/
- Versión en turco de la página: https://erayy.com/tr/balbal/
- Código (Apache 2.0): https://github.com/erayyap/balbal
- Paquete PyPI: https://pypi.org/project/balbal/
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
