# oblivius/vrc-we-voice-fr

## Resumen

vrc-we-voice-fr es un modelo de detección de palabras clave (keyword spotting) para francés desarrollado por oblivius, pensado para integrarse en el sistema vrc-WiredExpressions. Se trata de un wav2vec2 con cabecera CTC sobre letras, podado de las 24 capas originales a 16 y exportado a ONNX con cuantización dinámica int8, lo que reduce el peso del repositorio a 0,5 GB y el fichero principal a 254 MB. El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-french y se distribuye con licencia Apache 2.0.

A diferencia de un ASR convencional, el modelo no transcribe audio: emite logits por frame (ventanas de 20 ms) sobre un vocabulario de 59 tokens, donde `<pad>` actúa como blank de CTC y `|` como frontera de palabra. Sobre esa salida, el cliente registra frases como texto y las detecta en audio continuo. El repositorio incluye además una tabla de pronunciación (`pron.tsv`) de 30.000 palabras con 43.093 grafías, que permite que una frase se dispare tanto por su sonido como por su ortografía.

Su relevancia práctica está en el despliegue en cliente: el modelo se parte en `fx.onnx` (extractor convolucional congelado, compartido entre todos los modelos vrc-we-voice) y `enc.onnx` (las 16 capas transformer), de modo que un cliente que escucha en varios idiomas ejecuta el extractor una sola vez por ventana de audio. La evaluación publicada es local, no un benchmark estándar, y muestra mejoras sustanciales frente al modelo base en detección de palabras aisladas y en escenarios con ruido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer) con cabecera CTC sobre letras; 16 capas transformer tras poda |
| Parámetros totales | no disponible (el autor solo indica 16 de 24 capas y 254 MB en int8) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio; frames de 20 ms) |
| Tipos de cuantización | int8 dinámica de las MatMul (ONNX) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 (pesos y configuración); `pron.tsv` bajo CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx`, `fx.onnx`, `enc.onnx`), más `vocab.json`, `config.json`, `voice.json`, `pron.tsv` |

## Arquitectura y entrenamiento

El modelo es un wav2vec2 fine-tuneado desde jonatasgrosman/wav2vec2-large-xlsr-53-french, podado a sus 16 capas inferiores de 24 y entrenado con CTC sobre letras. La entrada es audio mono a 16 kHz con media cero y varianza unitaria; la salida son logits de forma `[batch, frames, 59]`. El extractor convolucional de características quedó congelado durante el fine-tuning, lo que permite separarlo en `fx.onnx` y reutilizarlo entre modelos de la familia vrc-we-voice. El entrenamiento se hizo con batches de 40 s de audio y 2 pasos de acumulación, AdamW con 10 % de warm-up y decaimiento lineal, entrenando todas las capas y la cabeza, con utterances de 0,5 a 15 s y ruido MUSAN en la mitad de las muestras a 5-20 dB SNR, más un 5 % de muestras solo de ruido con target vacío.

Los datos de entrenamiento combinan Common Voice 19.0 (567.576 utterances, CC0 1.0), Multilingual Spoken Words Corpus (1.535.229 utterances, CC BY 4.0) y el split de entrenamiento de FLEURS (2.508 utterances, CC BY 4.0), con MUSAN (CC BY 4.0) como fuente de ruido. El proceso de poda y ajuste constó de 12.000 pasos con learning rate 3e-5; una continuación posterior de 6.000 pasos a 1,5e-5 fue rechazada por un balance neto de −7,8 puntos. La tabla de pronunciación se generó con CharsiuG2P (IPA sin estrés ni marcas de enlace) y las grafías alternativas con un transformer de caracteres de 3+3 capas y anchura 256, entrenado de sonido a grafía con beam 8 y conjuntos de evaluación excluidos.

## Capacidades

- Detección de palabras clave en audio continuo a partir de frases registradas como texto, con disparo por sonido y por grafía.
- Reconocimiento de habla francesa a nivel de letra mediante CTC, con salida de logits por frame de 20 ms.
- Coincidencia fonética: la tabla `pron.tsv` permite que una frase se dispare con homófonos y variantes ortográficas (43.093 grafías para 30.000 palabras).
- Tolerancia a ruido: entrenado con MUSAN a 5-20 dB SNR y con muestras solo de ruido.
- Inferencia en cliente mediante ONNX int8, con separación del extractor convolucional para reutilización multi-idioma.
- Umbral de disparo configurable por modelo (en este caso −0,75), documentado en `voice.json`.
- No soporta tool calling, agentes, visión ni audio más allá de la detección de palabras clave.

## Casos de uso

- Activación por voz en aplicaciones de escritorio: el cliente registra una frase de activación y el modelo la detecta en audio continuo con 20 ms de resolución, con un coste de 254 MB en int8 adecuado para ejecución local.
- Control por comandos en francés: registro de un conjunto cerrado de comandos (por ejemplo, "ouvre", "ferme", "suivant") y detección con umbral ajustable; la evaluación "Crowded" del autor (86,7 % de aciertos con todas las frases registradas a la vez) respalda este escenario.
- Subtitulado y búsqueda por palabra clave en archivos de audio: el modelo emite logits por frame que permiten localizar temporalmente una palabra en una grabación larga sin transcribir el audio completo.
- Filtrado de audio en pipelines de datos: descartar o etiquetar clips que contienen una palabra concreta antes de pasarlos a un ASR completo, reduciendo coste computacional.
- Sistemas multi-idioma en cliente: al compartir `fx.onnx` con el resto de modelos vrc-we-voice, un cliente que escucha en francés y en inglés ejecuta el extractor convolucional una sola vez por ventana de audio.
- Accesibilidad y manos libres: activación de funciones por voz en entornos donde el teclado no está disponible, con tolerancia a pronunciaciones alternativas gracias a la tabla fonética.
- Detección de términos sensibles o marcas en monitorización de audio: registro de términos y conteo de ocurrencias, con la tasa de falsos positivos en no-habla publicada (0,08 por hora en el peor de cinco puntos de operación).

## Benchmarks y rendimiento

Evaluación local de keyword spotting del autor, no un benchmark estándar. Frases registradas como texto y detectadas en audio continuo; ambos modelos en int8 con umbral −0,75. Base: facebook/wav2vec2-xlsr-53-espeak-cv-ft.

| Hits % / falsos positivos por hora | Base | vrc-we-voice-fr |
|---|---|---|
| Frases | 81,8 / 0,14 | 97,0 / 0,14 |
| Frases con ruido | 68,7 / 0,22 | 90,9 / 0,36 |
| Palabras | 30,7 / 0,72 | 80,0 / 0,00 |
| Palabras con ruido | 27,3 / 0,48 | 61,3 / 0,24 |
| Aglomerado | 51,0 / 0,28 | 86,7 / 0,11 |
| No-habla | — / 1,04 | — / 0,08 |

Efecto de la tabla de pronunciación sobre conjuntos de palabras locales (limpio):

| Métrica | Sin tabla | Con tabla |
|---|---|---|
| Homófonos oídos como otro miembro del grupo, % | 21 | 55 |
| Variantes ortográficas oídas como otro miembro del grupo, % | 31 | 54 |
| Falsos positivos por frase-hora en los conjuntos de palabras | 1,21 | 3,49 |

Frases y palabras en los dos presupuestos más estrictos: 88,8 / 90,4 → 83,5 / 88,8, y falsos positivos por frase-hora de 0,00 → 0,06 en el umbral. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero `model.onnx` en int8 ocupa 254 MB y el repositorio completo 0,5 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 1 GB de VRAM libre puede ejecutar el modelo, incluidas RTX 4090, RTX 3060 y GPUs integradas con soporte ONNX Runtime.
- Cabe en GPU de consumo: sí, dado el tamaño del fichero int8 y la separación en `fx.onnx` + `enc.onnx`.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vrc-we-voice-fr | 16 capas transformer (total no disponible) | frames de 20 ms | Keyword spotting FR + CTC | Apache 2.0 | ONNX en HF |
| jonatasgrosman/wav2vec2-large-xlsr-53-french | 24 capas (large) | frames de 20 ms | ASR FR | Apache 2.0 | HF |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | 24 capas (large) | frames de 20 ms | ASR multilingüe con fonemas | Apache 2.0 | HF |

Frente a su modelo base, vrc-we-voice-fr reduce capas (16 de 24), cuantiza a int8 y añade la capa de keyword spotting con tabla fonética; en la evaluación del autor supera al base espeak en palabras aisladas (80,0 % frente a 30,7 %) y en frases (97,0 % frente a 81,8 %). Los datos de parámetros totales de las alternativas no se detallan en la información disponible.

## Limitaciones y advertencias

- Solo francés: no hay soporte multilingüe en este checkpoint.
- La evaluación es local del autor, no un benchmark estándar; los resultados no son directamente comparables con métricas publicadas de ASR.
- La tabla de pronunciación incrementa los falsos positivos en conjuntos de palabras (de 1,21 a 3,49 por frase-hora) a cambio de mejorar la cobertura de homófonos y variantes ortográficas.
- En frases con ruido los falsos positivos suben de 0,22 a 0,36 por hora respecto al modelo base.
- El umbral de disparo (−0,75) está fijado en `voice.json`; cambiarlo altera el equilibrio entre hits y falsos positivos y requiere recalibración.
- Riesgo de alucinación en el sentido de disparos espurios en audio no-habla, aunque la tasa publicada es baja (0,08 por hora en el peor punto de operación).
- Licencia Apache 2.0 para los pesos, pero `pron.tsv` es CC BY 4.0 y requiere atribución; los datasets de entrenamiento tienen licencias propias (CC0 1.0, CC BY 4.0).
- No es un ASR general: no genera transcripciones completas, solo logits por frame para detección de frases registradas.
- No se documentan sesgos demográficos ni de acento; el entrenamiento usa Common Voice y MSWC, con la composición de hablantes no detallada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-fr
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french
- Modelo base de comparación: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Modelo hermano (inglés): https://huggingface.co/oblivius/vrc-we-voice-en
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- MUSAN: https://www.openslr.org/17/
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- Export ONNX de G2P: https://huggingface.co/klebster/g2p_multilingual_byT5_tiny_onnx
