# fdemelo/pocket-tts-fastdec-7m

## Resumen

`pocket-tts-fastdec-7m` es un decodificador neuronal sustitutivo para el modelo de síntesis de voz Pocket-TTS de Kyutai. No se trata de un modelo TTS completo, sino de un reemplazo destilado del decodificador Mimi original: convierte los latentes de 32 dimensiones a 12,5 Hz que produce el flow LM de Pocket-TTS en audio de 24 kHz, pero con una arquitectura mucho más ligera. El autor es `fdemelo` y el modelo base es `kyutai/pocket-tts` (variante `english_7m_refl_2026-10`).

El objetivo es claro: hacer que Pocket-TTS funcione en tiempo real en CPUs muy modestas, hasta una Raspberry Pi Zero W. Para ello se sustituye el decodificador original (transformer causal de 4 capas a 200 Hz más un SEANet de anchura base 24) por un núcleo convolucional causal de 5 capas residuales a 12,5 Hz y un SEANet podado en canales. El resultado son 2,05 M de parámetros (8,2 MB en fp32) frente a los cientos de MMAC/s del original.

Es relevante porque demuestra que es posible destilar el decodificador de un sistema TTS moderno manteniendo una calidad cercana (caída de ~0,25 UTMOS) y ganando un factor de velocidad que permite inferencia en hardware de gama muy baja. El repositorio contiene únicamente el decodificador y un paquete Python que lo integra; el LM, el tokenizer, las voces y el encoder Mimi siguen siendo los de Kyutai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador convolucional causal (5 capas residuales a 12,5 Hz) + SEANet causal podado en canales |
| Parametros totales | 2,05 M (solo el decodificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (decodificador por frames; estado de streaming explícito) |
| Tipos de cuantizacion | fp32 (pesos publicados); Q8_0 mencionado en las pruebas con motor loom/ggml |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (`decoder.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

El decodificador original de Mimi en Pocket-TTS consta de una proyección del cuantizador (32 → 128), un sobremuestreo ×16 hasta 200 Hz, un transformer causal de 4 capas (d=128, atención sobre 50 pasos) y un SEANet con anchura base 24 (canales 192/96/48/24). El reemplazo elimina esa etapa de 200 Hz: una capa `Linear(32 → 256)` alimenta un núcleo de 5 capas residuales que operan directamente a 12,5 Hz, cada una con LayerNorm → convolución causal depthwise (k=4) → LayerNorm → MLP (256→512→256). Una cabeza predice 16 subframes × 128 canales por frame latente, seguida de una convolución depthwise de suavizado. El SEANet se poda por energía de activación a canales 128/64/32/16 con hidden 32/16/8, reduciendo el coste de 249/435 MMAC/s a 114 MMAC/s. El decodificador es estrictamente causal y mantiene estado de streaming, de modo que la decodificación por trozos produce el mismo audio que la decodificación completa (diferencia máxima de 3e-6).

El entrenamiento es una destilación en dos etapas con el modelo original congelado como profesor. En la etapa 1 (20k pasos) se entrena el núcleo por regresión de las features a 200 Hz del transformer del profesor a partir de los latentes, más una pérdida STFT a través del SEANet congelado del profesor. En la etapa 2 (120k pasos, LR coseno) se entrena conjuntamente núcleo y SEANet podado, inicializado este último mediante poda por energía de activación del SEANet del profesor. El LM de lenguaje nunca se modifica: el estudiante solo aprende a mapear los latentes normalizados con `emb_mean`/`emb_std` a audio. Los mismos pesos del decodificador sirven para las variantes 2m, 7m y 18m del modelo inglés `refl_2026-10`, que comparten normalización de latentes.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz a partir de texto, integrada en el pipeline de Pocket-TTS.
- Decodificación de latentes de 32 dimensiones a 12,5 Hz generados por el flow LM de Pocket-TTS.
- Streaming: decodificación por trozos con estado causal explícito, idéntica a la decodificación completa.
- Clonación de voz desde audio: el encoder Mimi original se conserva, por lo que se pueden usar voces del catálogo o un WAV propio como prompt.
- Compatibilidad con las variantes 2m, 7m y 18m del modelo `english_7m_refl_2026-10` (un repositorio por tamaño).
- No incluye generación de texto, razonamiento, código ni tool calling: es exclusivamente un decodificador de audio.
- No soporta otros idiomas distintos del inglés ni otros modelos Pocket-TTS no probados.

## Casos de uso

- Síntesis de voz en dispositivos embebidos: el decodificador de 2,05 M de parámetros y 8,2 MB permite ejecutar Pocket-TTS en una Raspberry Pi Zero W en tiempo real (4,7 s de cómputo para 4,8 s de audio con el modelo 7m en GPU VC4), algo inviable con el decodificador original.
- Asistentes de voz offline en hardware de bajo coste: al mantener el encoder Mimi, se puede clonar una voz concreta y generar respuestas habladas sin conexión ni GPU dedicada.
- Lectura de texto en aplicaciones de accesibilidad: integración en lectores de pantalla o dispositivos de asistencia que funcionen con CPU y memoria limitada.
- Generación de audio por streaming en tiempo real: el estado causal explícito permite emitir audio trozo a trozo con latencia baja, adecuado para interfaces conversacionales.
- Prototipado e investigación en destilación de decodificadores: el repositorio documenta el procedimiento en dos etapas (regresión + STFT, luego entrenamiento conjunto con poda por energía), útil como referencia para comprimir otros vocoders.
- Kioscos o dispositivos IoT con anuncios hablados: el bajo consumo de cómputo (114 MMAC/s) permite generar locuciones en placas sin acelerador.
- Evaluación comparativa de calidad TTS: los samples incluidos (tres voces, texto Harvard y texto largo) permiten medir el compromiso calidad/velocidad frente al decodificador original.

## Benchmarks y rendimiento

Calidad medida con UTMOS22 sobre 12 frases Harvard, voz `alba`, PyTorch fp32:

| Métrica | Decodificador original | Este decodificador |
|---|---|---|
| UTMOS22 (voz alba, 12 frases) | 4,40 | 4,23 |
| Caída media UTMOS (6 voces, 72 utterances) | — | ~0,25 |
| WER (Whisper base.en) | referencia | dentro del ruido |
| Diferencia máxima streaming vs. completo | — | 3e-6 |

Velocidad en Raspberry Pi Zero W (motor loom/ggml, pesos Q8_0, 4,8 s de audio; no son cifras de PyTorch):

| Modelo | GPU VC4 | CPU |
|---|---|---|
| 2m | 3,1 s | 3,9 s |
| 7m | 4,7 s | 5,8 s (≈ tiempo real) |
| 18m | 8,5 s | 9 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un decodificador de audio.

## Requisitos de hardware

- VRAM: el decodificador ocupa 8,2 MB en fp32; el consumo real lo domina el LM de Pocket-TTS (2m, 7m o 18m), no este componente.
- GPU recomendadas: cualquier GPU moderna sirve; el interés del modelo es precisamente funcionar sin GPU. En Raspberry Pi Zero W se ha validado con GPU VC4 y con CPU.
- Cabe en GPU consumer: sí, con enorme holgura; también en CPU de placa única y microcontroladores de gama alta.
- Despliegue: paquete Python `pocket_tts_fastdec` sobre PyTorch ≥ 2.5 y `pocket-tts>=4.0.1`; motor loom/ggml con pesos Q8_0 para CPU; CLI `pocket-tts-fastdec generate`.
- Latencia y throughput: en Raspberry Pi Zero W, el modelo 7m ronda el tiempo real (4,7–5,8 s para 4,8 s de audio); el 2m es más rápido que tiempo real; el 18m es más lento y su LM es demasiado pesado para esa placa.

## Comparativa con modelos similares

| Modelo | Parámetros (decodificador) | Frecuencia de operación | Licencia | Disponibilidad |
|---|---|---|---|---|
| pocket-tts-fastdec-7m (este) | 2,05 M | 12,5 Hz + SEANet podado | cc-by-4.0 | Hugging Face, repo propio |
| Decodificador Mimi original de Pocket-TTS | no disponible (transformer 4 capas d=128 + SEANet base 24) | 200 Hz | la de kyutai/pocket-tts (gated) | Hugging Face, gated |
| Vocoders neuronales genéricos (HiFi-GAN, etc.) | del orden de millones, variable | decenas de Hz con sobremuestreo | variable | variable |

La comparación directa con vocoders genéricos no está disponible en la información proporcionada; el único punto de referencia cuantitativo es el decodificador original de Pocket-TTS, frente al que se miden las cifras de calidad y velocidad anteriores.

## Limitaciones y advertencias

- El decodificador es deliberadamente con pérdida: la calidad baja ~0,25 UTMOS de media y algunas voces (p. ej. `marius`) pierden más que otras; el ruido de semilla es de ±0,03 UTMOS.
- Solo probado con el modelo inglés `english_7m_refl_2026-10` en sus variantes 2m, 7m y 18m; no se ha validado con otros modelos Pocket-TTS.
- Solo soporta inglés; no hay capacidades multilingües.
- Requiere los pesos originales de `kyutai/pocket-tts`, que están gated y sujetos a sus propios términos, además de la licencia cc-by-4.0 de este decodificador.
- El repositorio no incluye LM, flow head, tokenizer, voces ni encoder Mimi: es un componente, no un sistema TTS autónomo.
- Riesgo de artefactos o degradación en voces no representadas en el conjunto de evaluación; conviene validar la calidad por voz antes de producción.
- El modelo 18m no es viable en Raspberry Pi Zero W por el peso de su LM, aunque el decodificador en sí lo soporte.
- No hay datos publicados sobre sesgos demográficos o acústicos del decodificador más allá de las seis voces del catálogo evaluadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdemelo/pocket-tts-fastdec-7m
- Modelo base Pocket-TTS: https://huggingface.co/kyutai/pocket-tts
- Paper de referencia (arXiv:2509.06926): https://arxiv.org/abs/2509.06926
- Muestras de audio: https://huggingface.co/fdemelo/pocket-tts-fastdec-7m/tree/main/samples
- Instalación del paquete: `pip install "git+https://huggingface.co/fdemelo/pocket-tts-fastdec-7m"`
