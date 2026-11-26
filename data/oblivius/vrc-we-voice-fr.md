# oblivius/vrc-we-voice-fr

## Resumen

vrc-we-voice-fr es un modelo de detección de palabras clave (keyword spotting) para francés, desarrollado por el usuario oblivius como parte del proyecto vrc-WiredExpressions. Se trata de una adaptación del modelo de reconocimiento de voz jonatasgrosman/wav2vec2-large-xlsr-53-french, podado de 24 a 16 capas de transformer y exportado a ONNX con cuantización dinámica int8 (254 MB). El modelo incorpora una innovación destacable: dos cabezas CTC sobre un mismo encoder, una sobre letras (59 tokens) y otra sobre fonemas IPA (60 tokens), que permiten reconocer frases tanto por su grafía como por su pronunciación.

El modelo está pensado para aplicaciones de activación por voz y detección de frases concretas en audio continuo, con tramas de 20 ms y un mecanismo de fusión entre ambas cabezas que decide cuándo una frase debe dispararse. Su licencia Apache 2.0 y su formato ONNX int8 lo hacen adecuado para despliegue en entornos con recursos limitados, incluyendo clientes que escuchan en varios idiomas simultáneamente gracias a la separación del encoder convolucional compartido (`fx.onnx`) y la parte transformer (`enc.onnx`).

La relevancia actual del modelo radica en su enfoque híbrido letra-fonema para keyword spotting, que mejora la robustez ante homófonos y variantes ortográficas, y en su diseño modular que permite reutilizar el extractor de características entre distintos idiomas del mismo proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer CTC) con dos cabezas de salida (letras y fonemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio; tramas de 20 ms) |
| Tipos de cuantizacion | int8 dinámica (MatMuls) en ONNX |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `enc.onnx`, `fx.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-french, un Wav2Vec2 large con 24 capas de transformer, que fue podado a sus 16 capas inferiores y ajustado con CTC sobre letras. Sobre esta base se añadió una segunda cabeza lineal para fonemas IPA, entrenada conjuntamente con el encoder y la cabeza de letras en dos etapas de 10.000 pasos cada una. El encoder convolucional de características quedó congelado durante el fine-tuning, lo que permite compartirlo entre todos los modelos de la familia vrc-we-voice mediante los ficheros `fx.onnx` y `enc.onnx`.

Los datos de entrenamiento provienen de Common Voice 19.0 (567.576 enunciados, CC0), Multilingual Spoken Words Corpus (1.535.229 enunciados, CC BY 4.0), FLEURS train (2.508, CC BY 4.0), Multilingual LibriSpeech (258.212, CC BY 4.0) y VoxPopuli transcrito (28.281, CC0), además de ruido y salas de MUSAN (CC BY 4.0). Las etiquetas de fonemas se generaron con CharsiuG2P a partir de las transcripciones, con 2.260.167 enunciados con etiqueta fonémica; el resto entrenó solo la cabeza de letras. El modelo incluye además un léxico de 150.707 palabras (`lexicon.tsv`) y una tabla de pronunciación de 30.000 palabras (`pron.tsv`) generada con un transformer de caracteres para mapear sonido a grafía.

## Capacidades

- Reconocimiento de voz CTC sobre letras en francés, con salida de logits por trama de 20 ms.
- Reconocimiento fonémico en IPA (58 fonemas) mediante una segunda cabeza CTC sobre el mismo encoder.
- Keyword spotting o detección de frases concretas en audio continuo, con umbrales de disparo calibrados (-0.815 para una palabra, -0.449 para varias).
- Fusión letra-fonema para reconocer frases por su pronunciación además de por su grafía, mejorando la detección de homófonos y variantes ortográficas.
- Manejo de léxico y tabla de pronunciación para resolver palabras desconocidas o con múltiples grafías.
- Procesamiento de audio a 16 kHz mono con normalización (media cero, varianza unitaria).
- Inferencia en formato ONNX int8, apta para despliegue en CPU y entornos con recursos limitados.

## Casos de uso

- Activación por voz (wake words) en aplicaciones de escritorio o móviles: el modelo detecta frases cortas en audio continuo con umbrales calibrados y bajo coste computacional gracias a la cuantización int8.
- Detección de comandos en asistentes domésticos en francés: frases como "allume la lumière" pueden registrarse por su grafía y su pronunciación, reduciendo falsos negativos ante variantes de acento.
- Transcripción fonética para herramientas de aprendizaje de idiomas: la cabeza de fonemas proporciona una representación IPA que puede compararse con la pronunciación del estudiante.
- Indexación y búsqueda por voz en archivos de audio: el modelo puede detectar la presencia de términos concretos en grabaciones largas sin transcribir todo el contenido.
- Filtrado de audio en pipelines de subtitulado: identificación de segmentos que contienen palabras clave para su posterior transcripción completa con un modelo mayor.
- Sistemas de accesibilidad para personas con movilidad reducida: activación de funciones por voz con frases personalizadas registradas mediante léxico y tabla de pronunciación.
- Control de calidad en centros de llamadas: detección de frases de cumplimiento normativo en conversaciones telefónicas en francés, con la ventaja de reconocer homófonos que un modelo solo de letras confundiría.

## Benchmarks y rendimiento

Los datos de evaluación publicados en la model card comparan la versión con y sin tabla de pronunciación:

| Conjunto de evaluación | Sin tabla | Con tabla |
|---|---|---|
| Homófonos detectados como otro miembro del grupo (%) | 21 | 55 |
| Variantes ortográficas detectadas como otro miembro del grupo (%) | 31 | 54 |
| Falsos disparos por frase-hora en conjuntos de palabras | 1,21 | 3,49 |
| Frases (presupuestos más estrictos) | 88,8 | 83,5 |
| Palabras (presupuestos más estrictos) | 90,4 | 88,8 |
| Falsos disparos por frase-hora en el umbral | 0,00 | 0,06 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER en Common Voice, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo int8 ocupa 254 MB en disco; en memoria, la inferencia ONNX requiere aproximadamente 0,5-1 GB de RAM/VRAM según el tamaño del lote y la longitud de la ventana de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es lo suficientemente pequeño para ejecutarse en CPU con latencia aceptable.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración en aplicaciones cliente mediante los ficheros `model.onnx` o `enc.onnx` + `fx.onnx`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| vrc-we-voice-fr | no disponible (16 capas, int8 254 MB) | ventanas de audio, tramas de 20 ms | fr | Apache 2.0 | ONNX |
| jonatasgrosman/wav2vec2-large-xlsr-53-french | ~300 M (24 capas) | audio, tramas de 20 ms | fr | Apache 2.0 | safetensors / PyTorch |
| vrc-we-voice-en (mismo proyecto) | no disponible | ventanas de audio | en | Apache 2.0 | ONNX |
| Whisper large-v3 (referencia ASR) | ~1.550 M | 30 s de audio | multilingüe | MIT | safetensors / PyTorch |

La comparación con Whisper no es directa: vrc-we-voice-fr está especializado en keyword spotting y reconocimiento fonémico en francés, mientras que Whisper es un modelo ASR generalista multilingüe de mayor tamaño. Frente a su modelo base, vrc-we-voice-fr reduce el tamaño mediante poda y cuantización, y añade la cabeza fonémica y el mecanismo de fusión.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en francés; no soporta otros idiomas.
- Está diseñado para detección de frases clave, no para transcripción general de audio; su uso como ASR completo puede dar resultados limitados.
- Los umbrales de disparo están calibrados para el mecanismo de fusión del proyecto vrc-WiredExpressions; usos fuera de ese contexto requieren recalibración.
- La tabla de pronunciación incrementa los falsos disparos en conjuntos de palabras (de 1,21 a 3,49 por frase-hora), lo que puede ser problemático en aplicaciones sensibles a falsos positivos.
- Riesgo de alucinación en la salida CTC ante audio ruidoso o fuera de dominio; no se han publicado evaluaciones de sesgo.
- El modelo base jonatasgrosman/wav2vec2-large-xlsr-53-french tiene licencia Apache 2.0, compatible con uso comercial, pero los datos de entrenamiento incluyen corpus con licencias CC BY 4.0 y CC0 que deben respetarse en la redistribución.
- No se dispone de información sobre sesgos demográficos, acentos o variedades del francés no representadas en los corpus de entrenamiento.
- El tamaño del repo (1,0 GB) incluye ficheros auxiliares (léxico, tabla de pronunciación) que deben gestionarse adecuadamente en despliegues con espacio limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-fr
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french
- Modelo hermano en inglés: https://huggingface.co/oblivius/vrc-we-voice-en
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- VoxPopuli: https://github.com/facebookresearch/voxpopuli
- MUSAN: https://www.openslr.org/17/
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
