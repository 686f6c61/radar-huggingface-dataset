# oblivius/vrc-we-voice-en

## Resumen

vrc-we-voice-en es un modelo de detección de palabras clave (keyword spotting) para inglés, desarrollado por el usuario oblivius en Hugging Face. Se trata de un ajuste fino del modelo jonatasgrosman/wav2vec2-large-xlsr-53-english, podado a sus 16 capas inferiores de 24 y entrenado con CTC sobre letras (33 tokens de salida). El modelo se distribuye en formato ONNX con cuantización dinámica int8, lo que reduce el peso a 254 MB y facilita su despliegue en entornos de bajos recursos.

El objetivo del modelo no es la transcripción general, sino el reconocimiento de frases registradas como texto en audio continuo, con un umbral de activación de -0,6. Incluye una tabla de pronunciación (pron.tsv) con 30.000 palabras y sus variantes ortográficas, lo que permite detectar homófonos y variantes de escritura. Es relevante para aplicaciones de activación por voz, asistentes embebidos y sistemas de monitoreo de audio donde se necesita una ventana de detección precisa y un bajo índice de falsos positivos.

El modelo se enmarca en el ecosistema vrc-WiredExpressions, que separa el codificador convolucional (compartido entre idiomas) y la red transformer, permitiendo ejecutar el codificador una sola vez por ventana de audio. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer wav2vec2 (CTC sobre letras), podado a 16 capas |
| Parametros totales | No disponible (modelo podado, sin cifra publicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventanas de audio; entrenamiento con utterances de 0,5 a 15 s) |
| Tipos de cuantizacion | int8 dinámica (MatMuls) en ONNX |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, fx.onnx, enc.onnx, g2p-encoder.onnx, g2p-decoder.onnx) |

## Arquitectura y entrenamiento

El modelo parte de wav2vec2-large-xlsr-53-english, un transformer de 24 capas, y se poda a sus 16 capas inferiores. La cabeza es una capa CTC sobre un vocabulario de 33 tokens (letras, con `<pad>` como blank y `|` como frontera de palabra). La entrada es audio mono a 16 kHz, normalizado a media cero y varianza unitaria, y la salida son logits de `[batch, frames, 33]` con marcos de 20 ms. La cuantización int8 dinámica se aplica a las multiplicaciones matriciales, y el modelo se divide en `fx.onnx` (codificador convolucional congelado, compartido entre todos los modelos vrc-we-voice) y `enc.onnx` (resto de la red), de modo que `enc.onnx(fx.onnx(x))` equivale exactamente a `model.onnx(x)`.

El entrenamiento se realizó con CTC sobre letras usando un conjunto de datos que incluye Common Voice 19.0 (1.063.238 enunciados, CC0 1.0), Multilingual Spoken Words Corpus (1.629.270, CC BY 4.0), FLEURS train (2.038, CC BY 4.0), LibriSpeech (281.241, CC BY 4.0), AMI Meeting Corpus IHM y SDM (274.994, CC BY 4.0) y VoxPopuli transcrito (121.650, CC0 1.0). Se añadió ruido MUSAN (CC BY 4.0) en la mitad de los enunciados a 5-20 dB SNR, con un 5% de muestras solo de ruido y objetivo vacío. Se usó AdamW con warm-up del 10% y decaimiento lineal, lotes de 40 s de audio con 2 acumulaciones por paso, y se entrenaron todas las capas y la cabeza. Se conservaron continuaciones del entrenamiento solo si la tasa de aciertos mejoraba al menos un punto en total, ninguna prueba caía más de un punto y los falsos positivos en no-habla se mantenían en 0,1 o menos por frase-hora.

## Capacidades

- Detección de palabras clave (keyword spotting) en audio continuo para frases registradas como texto.
- Reconocimiento de variantes ortográficas y homófonos mediante la tabla de pronunciación `pron.tsv` (30.000 palabras, 6.685 variantes ortográficas).
- Integración con CharsiuG2P (encoder/decoder byT5 tiny int8) para palabras fuera de la tabla.
- Gestión de umbral de activación configurable (por defecto -0,6) y registro de múltiples frases simultáneas.
- Robustez frente a ruido (MUSAN) y sonidos no humanos (VocalSound, música).
- Ejecución en dos etapas (`fx.onnx` + `enc.onnx`) para reutilizar el codificador convolucional entre idiomas.
- No soporta tool calling, agentes, visión ni audio más allá del reconocimiento de voz.
- Capacidad multilingüe: no, únicamente inglés.

## Casos de uso

- Activación por palabra clave en asistentes de voz embebidos: el modelo detecta una frase registrada (por ejemplo, "hey device") en audio continuo con un umbral de -0,6 y un tamaño de 254 MB int8, adecuado para dispositivos con recursos limitados.
- Monitoreo de audio en reuniones: integrado en pipelines de AMI, permite registrar nombres o términos concretos y detectar su aparición en grabaciones con ruido de fondo y múltiples hablantes.
- Filtrado de contenido en centros de llamadas: se registran palabras sensibles y el modelo genera alertas cuando aparecen, con una tasa de falsos positivos de 0,25 por frase-hora en condiciones de audio concurrido.
- Sistemas de accesibilidad: detección de comandos de voz cortos para personas con movilidad reducida, usando la tabla de pronunciación para aceptar variantes de pronunciación.
- Análisis de medios: identificación de menciones de marcas o nombres propios en transmisiones de audio, aprovechando la detección de homófonos (69% de homófonos detectados como otro miembro del grupo).
- Vigilancia de seguridad en espacios públicos: detección de frases de alerta en audio ambiental, con una tasa de falsos positivos en no-habla de 0,04 por hora.
- Procesamiento por lotes de archivos de audio: uso de ONNX Runtime para ejecutar el modelo sobre ventanas de audio y extraer eventos de palabras clave sin necesidad de transcripción completa.

## Benchmarks y rendimiento

Los resultados publicados son pruebas locales de keyword spotting, no benchmarks estándar. Se comparan con el modelo base facebook/wav2vec2-xlsr-53-espeak-cv-ft, ambos en int8 con su propio umbral (este modelo -0,6, el base -0,75).

| Aciertos % / falsos positivos por hora | wav2vec2-xlsr-53-espeak-cv-ft (base) | vrc-we-voice-en |
|---|---|---|
| Frases | 72,5 / 0,42 | 98,8 / 0,00 |
| Frases con ruido | 72,5 / 0,42 | 98,8 / 0,10 |
| Palabras | 44,2 / 1,29 | 63,7 / 0,65 |
| Palabras con ruido | 43,2 / 0,81 | 59,5 / 0,48 |
| Audio concurrido | 52,6 / 0,76 | 74,1 / 0,25 |
| No-habla | — / 0,37 | — / 0,04 |

Además, la tabla de pronunciación mejora la detección de homófonos del 38% al 69% y de variantes ortográficas del 33% al 65%, con un aumento de falsos positivos de 0,51 a 0,68 por frase-hora en los conjuntos de palabras.

## Requisitos de hardware

- VRAM estimada: 254 MB para el modelo int8, más memoria para el codificador G2P (tiny byT5 int8) y la tabla de pronunciación.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en CPU sin problemas.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), integración con vrc-WiredExpressions, llama.cpp no aplica (no es un modelo de lenguaje), Ollama no aplica, TGI no aplica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| vrc-we-voice-en | No disponible (podado a 16 capas) | No disponible | Apache 2.0 | ONNX int8 | Keyword spotting con CTC sobre letras |
| jonatasgrosman/wav2vec2-large-xlsr-53-english | 24 capas | No disponible | Apache 2.0 | PyTorch/safetensors | ASR general en inglés |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | 24 capas | No disponible | Apache 2.0 | PyTorch | ASR multilingüe con fonemas espeak |

No se dispone de datos de benchmarks comparativos con otros modelos de keyword spotting en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no es multilingüe.
- No es un modelo de transcripción general: está diseñado para detección de frases registradas, no para ASR completo.
- El umbral de activación (-0,6) es fijo por defecto y puede requerir ajuste según el dominio.
- La tabla de pronunciación cubre 30.000 palabras; las palabras fuera de la tabla dependen del G2P int8, que puede introducir errores.
- Riesgo de falsos positivos en audio no-habla (0,04 por hora en la mejor configuración) y en audio concurrido (0,25 por hora).
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al autor original.
- El modelo se distribuye en ONNX int8; la cuantización puede degradar ligeramente la precisión frente a la versión float32 no publicada.
- No se han publicado datos sobre sesgos demográficos o acústicos específicos.

## Enlaces

- Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-en
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-english
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- LibriSpeech: https://www.openslr.org/12
- AMI Meeting Corpus: https://groups.inf.ed.ac.uk/ami/corpus/
- VoxPopuli: https://github.com/facebookresearch/voxpopuli
- MUSAN: https://www.openslr.org/17/
