# oblivius/vrc-we-voice-de

## Resumen

vrc-we-voice-de es un modelo de deteccion de palabras clave (keyword spotting) para aleman, desarrollado por el usuario oblivius como parte del proyecto vrc-WiredExpressions. No es un sistema de reconocimiento de voz general, sino una red wav2vec2 con cabecera CTC sobre letras, podada y cuantizada a int8, disenada para disparar frases registradas previamente en audio continuo con una tasa de falsos positivos muy baja. El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-german (Apache 2.0) y se distribuye en formato ONNX con un peso de 254 MB.

La relevancia tecnica del modelo esta en su enfoque de despliegue: separa la red en dos ficheros (`fx.onnx` y `enc.onnx`) cortando al final del codificador convolucional congelado, de modo que un cliente que escuche en varios idiomas comparte esa primera etapa y solo ejecuta la parte especifica del idioma por cada ventana de audio. Ademas, incluye una tabla de pronunciacion (`pron.tsv`) con 30.000 palabras que permite registrar frases por su sonido y no solo por su grafia, mejorando la deteccion de homofonos y variantes ortograficas.

El modelo esta pensado para aplicaciones de activacion por voz y vigilancia de palabras en flujos de audio en tiempo real, con un consumo de recursos reducido (16 capas transformer, cuantizacion dinamica int8 de las MatMul). Su licencia Apache 2.0 permite uso comercial, aunque la tabla de pronunciacion tiene licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer) con cabecera CTC sobre letras, podada a 16 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio; entrenamiento con utterances de 0,5 a 15 s) |
| Tipos de cuantizacion | int8 dinamica (MatMul) en ONNX |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 (modelo); CC BY 4.0 (pron.tsv) |
| Formato de pesos | ONNX (`model.onnx`, `enc.onnx`), JSON (`config.json`, `vocab.json`, `voice.json`), TSV (`pron.tsv`) |

## Arquitectura y entrenamiento

El modelo es un wav2vec2 fine-tuneado desde jonatasgrosman/wav2vec2-large-xlsr-53-german, podado de sus 24 capas originales a las 16 inferiores y entrenado con CTC sobre letras. La entrada es audio mono a 16 kHz, con media cero y varianza unitaria; la salida son logits `[batch, frames, 38]`, donde el token 0 es el blank de CTC y `|` actua como frontera de palabra. El modelo completo expone `input_values` de tipo float32 `[batch, samples]`; la variante `enc.onnx` recibe directamente la salida del codificador convolucional (`/wav2vec2/Transpose_output_0`, `[batch, frames, 512]`), que queda congelado y compartido entre todos los modelos vrc-we-voice.

El entrenamiento uso 589.839 utterances de Common Voice 19.0 (CC0 1.0), 2.271.401 de Multilingual Spoken Words Corpus (CC BY 4.0) y 2.347 de FLEURS train (CC BY 4.0), con ruido MUSAN (CC BY 4.0) anadido al 50 % de las utterances a 5-20 dB SNR y un 5 % de muestras solo de ruido con target vacio. Se uso AdamW con 10 % de warm-up y decaimiento lineal, batches de 40 s de audio con 2 acumulaciones por paso, y se entrenaron todas las capas y la cabeza. La etapa final fueron 12.000 pasos con learning rate 3e-5; una continuacion de 6.000 pasos a 1,5e-5 fue rechazada por una perdida neta de 4,0 puntos. La tabla de pronunciacion se genero con CharsiuG2P (IPA sin estres) y un transformer de caracteres para las variantes ortograficas.

## Capacidades

- Deteccion de palabras clave y frases registradas por texto en audio continuo, con umbral de disparo configurable (por defecto -0,65).
- Reconocimiento de voz CTC a nivel de letra en aleman, con salida de logits por frame (frames de 20 ms).
- Deteccion por sonido ademas de por grafia: homofonos y variantes ortograficas se agrupan bajo la misma frase registrada.
- Ejecucion sobre audio con ruido (evaluado a 10 dB SNR) y rechazo de audio no vocal (musica y sonidos vocales).
- Inferencia en ONNX Runtime con cuantizacion dinamica int8, sin dependencia de frameworks de deep learning pesados.
- Separacion en dos etapas (`fx.onnx` + `enc.onnx`) para reutilizar el codificador convolucional entre idiomas.
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso: es exclusivamente un detector de palabras clave.

## Casos de uso

- Activacion por palabra clave en asistentes de voz en aleman: el modelo escucha audio continuo a 16 kHz y dispara cuando detecta la frase registrada, con una tasa de falsos positivos de 0,06 por hora de audio no vocal, lo que lo hace adecuado para dispositivos siempre encendidos.
- Vigilancia de terminos en centros de llamadas: se registran palabras o frases de interes (por ejemplo, nombres de productos o avisos de cancelacion) y el modelo marca su aparicion en grabaciones o streams, con 1,44 falsos positivos por hora en palabras aisladas.
- Control por voz en entornos industriales ruidosos: el modelo mantiene un 80,0 % de aciertos en palabras aisladas con ruido a 10 dB SNR, util para maquinaria o cabinas donde el reconocimiento general falla.
- Deteccion de marcas o nombres propios con variantes ortograficas: gracias a `pron.tsv`, un mismo sonido registra variantes de escritura (por ejemplo, nombres extranjeros), con un 61 % de variantes ortograficas detectadas frente al 46 % sin la tabla.
- Filtrado previo en pipelines de ASR: al ser un modelo ligero de 254 MB int8, puede actuar como etapa de activacion antes de un sistema de reconocimiento completo, reduciendo el coste de transcripcion continua.
- Aplicaciones multilingues con cliente compartido: en un cliente que escuche varios idiomas, `fx.onnx` se ejecuta una vez por ventana de audio y solo `enc.onnx` del idioma correspondiente se ejecuta por cada idioma, reduciendo el coste computacional agregado.
- Monitorizacion de palabras prohibidas o de seguridad en audio grabado: el modelo puede procesar lotes de audio y marcar segmentos con frases registradas, con un rendimiento de 0,39 falsos positivos por hora en escenarios con muchas frases registradas simultaneamente.

## Benchmarks y rendimiento

Los datos disponibles son pruebas locales de keyword spotting del autor, no benchmarks estandar. La comparacion es contra facebook/wav2vec2-xlsr-53-espeak-cv-ft como base, ambos en int8 y con sus propios umbrales (-0,65 para este modelo, -0,75 para la base).

| Aciertos % / falsos positivos por hora | wav2vec2-xlsr-53-espeak-cv-ft (base) | vrc-we-voice-de |
|---|---|---|
| Frases | 79,8 / 0,00 | 95,4 / 0,00 |
| Frases con ruido | 67,9 / 0,06 | 93,6 / 0,00 |
| Palabras | 49,5 / 2,24 | 77,4 / 1,44 |
| Palabras con ruido | 46,8 / 2,24 | 80,0 / 1,28 |
| Escenario concurrido | 60,5 / 0,61 | 83,9 / 0,39 |
| Audio no vocal | no disponible / 1,14 | no disponible / 0,06 |

Ademas, la tabla de pronunciacion mejora la deteccion de homofonos del 30 % al 51 % y de variantes ortograficas del 46 % al 61 %, sin cambiar la tasa de 0,26 falsos positivos por hora en los conjuntos de palabras.

## Requisitos de hardware

- VRAM estimada para inferencia: 254 MB para el modelo int8 completo; el codificador convolucional compartido (`fx.onnx`) anade una fraccion adicional pequena no cuantificada especificada en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para audio en tiempo real.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con los ficheros `model.onnx` o la pareja `fx.onnx` + `enc.onnx`; no se distribuyen pesos en formato GGUF ni safetensors, por lo que no es directamente compatible con llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo procesa frames de 20 ms y esta pensado para audio en tiempo real, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (keyword spotting) | Licencia | Formato |
|---|---|---|---|---|---|
| vrc-we-voice-de | no disponible (16 capas) | ventanas de audio de 0,5-15 s | 95,4 % frases, 77,4 % palabras | Apache 2.0 | ONNX int8 |
| jonatasgrosman/wav2vec2-large-xlsr-53-german | no disponible (24 capas) | ventanas de audio | no evaluado en keyword spotting por el autor | Apache 2.0 | safetensors |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | no disponible | ventanas de audio | 79,8 % frases, 49,5 % palabras | Apache 2.0 | safetensors |

La comparacion directa con modelos de ASR general no es posible porque vrc-we-voice-de no se evalua con WER estandar, sino con pruebas de deteccion de frases registradas.

## Limitaciones y advertencias

- Solo soporta aleman; no hay capacidades multilingues en un mismo fichero (la arquitectura de dos etapas permite compartir el codificador, pero cada idioma requiere su propio `enc.onnx`).
- No es un sistema de transcripcion: no se han publicado resultados de WER y su evaluacion es exclusivamente de keyword spotting.
- La tasa de aciertos en palabras aisladas es del 77,4 %, con 1,44 falsos positivos por hora; en produccion esto puede requerir umbrales mas conservadores o verificacion posterior.
- El rendimiento en audio no vocal es bueno (0,06 falsos positivos por hora) pero no nulo; en entornos con musica o sonidos vocales puede haber disparos espurios.
- La tabla de pronunciacion (`pron.tsv`) tiene licencia CC BY 4.0, distinta de la Apache 2.0 del modelo, por lo que su redistribucion requiere atribucion.
- Los datos de entrenamiento provienen de Common Voice, Multilingual Spoken Words Corpus y FLEURS; pueden existir sesgos de acento, edad y genero propios de esos corpus, no cuantificados en la informacion disponible.
- No se publican datos de latencia ni throughput, lo que dificulta estimar el coste en produccion sin pruebas propias.
- El modelo esta podado a 16 capas, lo que puede degradar el reconocimiento de habla fuera de las condiciones de entrenamiento; no se ofrecen resultados de WER para validar esta perdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-de
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-german
- Modelo base de comparacion: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Modelo hermano (ingles): https://huggingface.co/oblivius/vrc-we-voice-en
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- MUSAN: https://www.openslr.org/17/
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- Export ONNX de CharsiuG2P: https://huggingface.co/klebster/g2p_multilingual_byT5_tiny_onnx
