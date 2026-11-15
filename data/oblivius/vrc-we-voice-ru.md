# oblivius/vrc-we-voice-ru

## Resumen

vrc-we-voice-ru es un modelo de detección de palabras clave (keyword spotting) para ruso, desarrollado por el usuario oblivius como parte del proyecto vrc-WiredExpressions. Se construye mediante fine-tuning del modelo jonatasgrosman/wav2vec2-large-xlsr-53-russian, podado de sus 24 capas originales a las 16 inferiores, y entrenado con CTC sobre letras. El resultado se distribuye en formato ONNX con cuantización dinámica int8 de las MatMul, lo que reduce el peso a 254 MB.

El modelo no está pensado para transcripción general, sino para disparar expresiones registradas (frases o palabras) en audio continuo, con un umbral de activación de -0,6. Incorpora una tabla de pronunciación (pron.tsv) con 21.559 palabras que permite reconocer una frase por su sonido y no solo por su grafía, mejorando la detección de homófonos y variantes ortográficas.

Su relevancia radica en el despliegue ligero: el archivo enc.onnx permite reutilizar el codificador convolucional congelado entre distintos idiomas del mismo proyecto, ejecutándolo una sola vez por ventana de audio en clientes multilingües. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC (transformer, 16 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio de 0,5 a 15 s en entrenamiento) |
| Tipos de cuantizacion | int8 dinámica (ONNX) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 (pron.tsv: CC BY 4.0) |
| Formato de pesos | ONNX (model.onnx, enc.onnx) |

## Arquitectura y entrenamiento

El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-russian, un wav2vec2 large XLSR-53 afinado para ruso. Se poda a las 16 capas inferiores de las 24 originales y se afina con CTC sobre letras, con marcos de 20 ms. La salida de logits tiene 39 clases: `<pad>` (0) actúa como blank CTC y `|` como frontera de palabra. El codificador convolucional de características queda congelado tras el fine-tuning, lo que permite compartirlo entre los modelos vrc-we-voice de distintos idiomas.

El entrenamiento combina cinco corpus: Common Voice 19.0 (39.918 enunciados, CC0 1.0), Multilingual Spoken Words Corpus (119.454, CC BY 4.0), FLEURS train (2.062, CC BY 4.0), Russian LibriSpeech SLR96 (57.224, dominio público) y SOVA RuDevices y RuDevices Audiobooks (296.388, CC BY 4.0). Se añade ruido MUSAN en la mitad de los enunciados a 5-20 dB SNR, más un 5% de muestras solo de ruido con objetivo vacío. Se usó AdamW con 10% de warm-up y decaimiento lineal, lotes de 40 s de audio con 2 acumulaciones por paso, y se entrenaron todas las capas y la cabeza. La etapa final consta de 15.000 pasos a 3e-5; una continuación de 6.000 pasos a 1,5e-5 fue rechazada por un balance neto de -8,2 puntos.

La tabla pron.tsv se genera con CharsiuG2P (IPA sin estrés) y un transformer de caracteres (3+3 capas, anchura 256) entrenado de sonido a grafía con beam 8, excluyendo los conjuntos de evaluación.

## Capacidades

- Detección de palabras clave y frases registradas en audio continuo en ruso, con disparo por umbral (-0,6).
- Reconocimiento por sonido además de por grafía: homófonos y variantes ortográficas se agrupan bajo la misma expresión registrada.
- Reconocimiento de voz CTC sobre letras (salida de 39 clases), útil como base para transcripción ligera.
- Procesamiento de ventanas de audio de 0,5 a 15 s, con entrada de 16 kHz mono normalizada (media cero, varianza unitaria).
- Reutilización del codificador convolucional (fx.onnx) entre idiomas del proyecto vrc-we-voice.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico.
- Capacidad multilingüe limitada: solo ruso; el multilingüismo se logra combinando modelos separados del proyecto.

## Casos de uso

- Activación por voz en aplicaciones de escritorio: registrar frases de comando ("abrir configuración", "nuevo documento") y dispararlas en audio continuo con el modelo int8 de 254 MB, adecuado para ejecución en CPU sin GPU dedicada.
- Asistentes de voz de bajo consumo: el tamaño reducido y la cuantización int8 permiten integrar el modelo en dispositivos con recursos limitados, usando enc.onnx para reutilizar el codificador si se despliegan varios idiomas.
- Subtitulado o indexación de archivos de audio en ruso: el modelo CTC sobre letras puede producir transcripciones aproximadas para búsqueda y etiquetado, aunque su objetivo principal es el keyword spotting.
- Filtrado de audio en pipelines de datos: detectar la presencia de términos concretos en grabaciones largas (por ejemplo, nombres de productos o palabras de seguridad) antes de pasarlas a un ASR completo, reduciendo coste computacional.
- Sistemas de accesibilidad: comandos por voz para usuarios con movilidad reducida, con detección robusta en entornos ruidosos (96,2% de aciertos a 10 dB SNR en frases).
- Control de dispositivos en el hogar: registrar palabras de activación en ruso y disparar acciones locales; la baja tasa de falsos positivos en no-voz (0,03 por frase-hora) reduce activaciones accidentales por música o ruidos vocales.
- Investigación en keyword spotting: servir como referencia reproducible (Apache 2.0) para comparar estrategias de poda, cuantización y tablas de pronunciación en ruso.

## Benchmarks y rendimiento

Evaluación local de keyword spotting del autor, no un benchmark estándar. Base comparativa: facebook/wav2vec2-xlsr-53-espeak-cv-ft, ambos en int8 con su propio umbral.

| Aciertos % / falsos positivos por hora | wav2vec2-xlsr-53-espeak-cv-ft (base) | vrc-we-voice-ru |
|---|---|---|
| Frases | 78,8 / 0,22 | 97,1 / 0,22 |
| Frases con ruido | 77,9 / 0,07 | 96,2 / 0,22 |
| Palabras | 35,8 / 0,81 | 85,8 / 0,00 |
| Palabras con ruido | 30,0 / 0,65 | 83,2 / 0,00 |
| Aglomerado | 51,0 / 0,41 | 89,8 / 0,15 |
| No-voz | — / 1,47 | — / 0,03 |

Efecto de la tabla de pronunciación en conjuntos de palabras locales limpias:

| Métrica | Sin tabla | Con tabla |
|---|---|---|
| Homófonos oídos como otro miembro del grupo, % | 32 | 59 |
| Variantes ortográficas oídas como otro miembro, % | 34 | 53 |
| Falsos positivos por frase-hora en los conjuntos de palabras | 0,17 | 0,17 |

## Requisitos de hardware

- VRAM estimada: el archivo model.onnx int8 pesa 254 MB; la inferencia cabe holgadamente en menos de 1 GB de memoria, incluido el estado de activaciones para ventanas cortas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también funciona en CPU. Para lotes grandes o baja latencia, una RTX 3060 o superior es suficiente; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con los archivos model.onnx o la pareja fx.onnx + enc.onnx. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vrc-we-voice-ru | no disponible (16 capas, int8 254 MB) | audio 0,5-15 s | keyword spotting ruso, CTC letras | Apache 2.0 | Hugging Face (ONNX) |
| jonatasgrosman/wav2vec2-large-xlsr-53-russian | wav2vec2 large (24 capas) | audio variable | ASR ruso | Apache 2.0 | Hugging Face |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | wav2vec2 large | audio variable | ASR multilingüe con fonemas | Apache 2.0 | Hugging Face |

La comparación directa con modelos de ASR no es del todo equivalente: vrc-we-voice-ru está especializado en detección de expresiones, no en transcripción completa. Frente a su modelo base, reduce capas (24 a 16) y tamaño (int8), a costa de una salida restringida a 39 clases CTC.

## Limitaciones y advertencias

- Solo ruso: no cubre otros idiomas; el multilingüismo requiere combinar modelos del proyecto.
- No es un ASR general: la salida CTC sobre letras y el objetivo de keyword spotting limitan su uso para transcripción libre.
- Riesgo de falsos positivos en audio no-voz: aunque bajo (0,03 por frase-hora), existe con música y sonidos vocales.
- Umbral fijo de -0,6: el rendimiento depende del ajuste del umbral al dominio; el autor documenta que la base usa -0,75.
- Sesgos: no se documentan análisis de sesgo por acento, género o edad; los corpus de entrenamiento (Common Voice, SOVA, etc.) pueden introducir desequilibrios.
- Alucinación: en modelos CTC, el equivalente son disparos espurios o transcripciones incorrectas en audio degradado; no hay evaluación específica de este riesgo más allá de los falsos positivos reportados.
- Licencia: los pesos ONNX y configuración son Apache 2.0, pero pron.tsv es CC BY 4.0 y requiere atribución; los datasets de entrenamiento tienen sus propias licencias (CC0, CC BY 4.0, dominio público).
- Evaluación local del autor, no un benchmark estándar: los resultados no son directamente comparables con métricas de ASR convencionales (WER, etc.).
- Fecha de creación futura (2026-10-21) en los metadatos: conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-ru
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-russian
- Modelo base alternativo (comparativa): https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Modelo hermano en inglés: https://huggingface.co/oblivius/vrc-we-voice-en
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Russian LibriSpeech (SLR96): https://www.openslr.org/96/
- SOVA datasets: https://github.com/sovaai/sova-dataset
- MUSAN: https://www.openslr.org/17/
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- Export ONNX de CharsiuG2P: https://huggingface.co/klebster/g2p_multilingual_byT5_tiny_onnx
