# canberkkkkkk/ema-tts

## Resumen

EMA-TTS es un modelo de síntesis de voz (text-to-speech) en turco, desarrollado por el usuario canberkkkkkk y publicado bajo licencia Apache 2.0. Con solo 65 millones de parámetros, emplea un transformador de flujo matching no autorregresivo (DiT) que lee caracteres directamente y genera audio de 48 kHz dentro del espacio latente de un AudioVAE2 congelado, compartido con el modelo VoxCPM2. Su principal contribución es un mecanismo de alineación basado en prioris gaussianas que evita el redondeo de duraciones, lo que mejora la precisión de la síntesis.

El modelo está diseñado específicamente para el turco y alcanza los mejores resultados publicados en el benchmark Freya-TR-Eval, con un 3.0% de error de palabra (WER) y un 0.8% de error de carácter (CER), superando a sistemas establecidos como Piper, MMS-TTS o XTTS-v2. Su tamaño compacto y su bajo consumo de memoria (alrededor de 1 GB de VRAM) lo hacen adecuado para despliegues en entornos con recursos limitados, aunque presenta limitaciones notables en frases muy cortas y no admite clonación de voz ni control de hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching DiT no autorregresivo (12 capas, width 512, 8 cabezas) + AudioVAE2 congelado |
| Parametros totales | 65M (modelo) + 94M (codec congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es TTS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

EMA-TTS utiliza un transformador de flujo matching condicional (DiT) de 12 capas con anchura 512 y 8 cabezas de atención. El texto se procesa mediante un codificador puramente convolucional basado en 4 bloques ConvNeXt, que lee caracteres directamente sin necesidad de un frontend fonético. El modelo predice la duración de cada carácter y coloca los caracteres en una línea temporal; cada frame de audio atiende a los caracteres cercanos bajo prioris gaussianas aprendidas (con anchos de 0.18 a 1.2 en unidades de palabra, con un contexto de una palabra a cada lado). Esto produce transiciones suaves entre palabras y permite que la pérdida acústica llegue a las duraciones sin redondeo, lo que constituye la innovación principal frente a enfoques que repiten representaciones redondeadas.

El entrenamiento se realiza en el espacio latente de un AudioVAE2 congelado (64 dimensiones a 25.05 Hz, decodificado a 48 kHz). El modelo se optimiza con flujo matching condicional y utiliza un solucionador ODE de Euler con 32 pasos en inferencia. No se mencionan datos específicos sobre el corpus de entrenamiento, pero se indica que es mayoritariamente de formato largo, lo que condiciona el comportamiento en frases cortas. No se aplica RLHF ni DPO; el entrenamiento es supervisado con pérdida acústica estándar.

## Capacidades

- Generación de voz en turco a 48 kHz a partir de texto escrito, con lectura directa de caracteres.
- Expansión automática de números, fechas, horas, monedas y porcentajes a su forma hablada, con recálculo de sufijos de caso turcos (por ejemplo, `09:30'da` se lee como *dokuz buçukta*).
- Síntesis no autorregresiva con flujo matching, lo que permite una generación rápida y estable.
- Alineación precisa de duraciones mediante prioris gaussianas, mejorando la naturalidad en transiciones entre palabras.
- Soporte de una única voz fija; no hay clonación, control de hablante ni prompts de estilo.
- Inferencia con bajo consumo de memoria: aproximadamente 1 GB de VRAM incluyendo el codec.

## Casos de uso

- **Aplicaciones de accesibilidad**: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, aprovechando la alta precisión (3.0% WER) y la naturalidad en frases de longitud media o larga.
- **Asistentes de voz en turco**: integración en asistentes virtuales o chatbots que requieran respuestas habladas, gracias a su baja latencia (32 pasos ODE) y su tamaño compacto.
- **Narración de contenidos largos**: generación de audiolibros o narración de artículos, donde el modelo muestra su mejor rendimiento (2.2% WER en frases de diez o más palabras).
- **Sistemas de respuesta interactiva (IVR)**: uso en centralitas telefónicas automáticas en turco, donde la claridad y la baja tasa de error son críticas.
- **Educación y aprendizaje de idiomas**: generación de ejemplos de pronunciación turca correcta, con expansión automática de números y fechas.
- **Producción de contenido multimedia**: locución para vídeos, podcasts o anuncios en turco, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Benchmarks y rendimiento

Según la model card, EMA-TTS fue evaluado en el benchmark Freya-TR-Eval (495 frases). Los resultados son la media de tres evaluaciones completas con diferentes semillas: 3.03 ± 0.24% WER y 0.81 ± 0.06% CER. En promedio, 410 de las 495 frases se generan sin errores. La comparación con otros sistemas se muestra en la siguiente tabla (los datos de los competidores son los publicados por los autores del benchmark):

| Sistema | Params | WER (%) | CER (%) |
|---|---|---|---|
| **EMA-TTS** | **65M** | **3.0** | **0.8** |
| Piper (tr, dfki) | 16M | 4.4 | 1.1 |
| MMS-TTS (tr) | 36M | 6.8 | 1.7 |
| FreyaTTS-small | 183M | 8.0 | 3.0 |
| XTTS-v2 (multi) | 470M | 11.1 | 3.9 |
| Coqui GlowTTS (tr) | 28M | 12.1 | 3.3 |
| F5-TTS (tr) | 336M | 24.3 | 10.9 |
| SpeechT5 (tr) | 144M | 83.4 | 45.5 |

No se han publicado resultados en otros benchmarks generales (como MMLU o HumanEval) porque se trata de un modelo de síntesis de voz, no de lenguaje general.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 1 GB en inferencia, incluyendo el codec AudioVAE2, según el autor.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). No se requieren GPUs de datacenter.
- **Compatibilidad con GPU de consumo**: sí, cabe en la mayoría de GPUs consumer actuales.
- **Opciones de despliegue**: el repositorio incluye un script de Python (`inference.py`) con una clase `EmaTTS` que carga los pesos y genera audio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son específicos para modelos de lenguaje.
- **Latencia y throughput**: no se proporcionan datos cuantitativos, pero al ser no autorregresivo con 32 pasos ODE, se espera una generación más rápida que los modelos autorregresivos de tamaño similar.

## Comparativa con modelos similares

La siguiente tabla compara EMA-TTS con tres alternativas de TTS en turco, basándose en los datos del benchmark Freya-TR-Eval:

| Modelo | Params | Contexto | WER (%) | CER (%) | Licencia |
|---|---|---|---|---|---|
| **EMA-TTS** | 65M | no disponible | 3.0 | 0.8 | Apache 2.0 |
| Piper (tr, dfki) | 16M | no disponible | 4.4 | 1.1 | MIT (típicamente) |
| MMS-TTS (tr) | 36M | no disponible | 6.8 | 1.7 | CC-BY-NC (típicamente) |
| FreyaTTS-small | 183M | no disponible | 8.0 | 3.0 | no disponible |

EMA-TTS supera a todos en precisión con menos parámetros que FreyaTTS-small y XTTS-v2. Su licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de MMS-TTS que suele tener licencia no comercial. Piper es más ligero pero con peor rendimiento. No se dispone de información sobre la licencia exacta de FreyaTTS-small.

## Limitaciones y advertencias

- **Frases cortas**: el rendimiento degrada significativamente en frases de 3 a 6 palabras (8.8% WER) frente a frases de 10 o más (2.2% WER). Las frases de una o dos palabras son aún peores y no están cubiertas por el benchmark.
- **Cobertura incompleta del benchmark**: aproximadamente el 6% de las frases de Freya-TR-Eval (30 de 495) fallan en todas las semillas, principalmente por nombres propios y morfología rara que el evaluador ASR transcribe incorrectamente incluso con audio de buena calidad.
- **Dígitos y números**: los números largos se expanden a palabras mediante un frontend antes de la síntesis, ya que el codificador convolucional no puede contar grupos de dígitos. Esto es automático pero puede fallar en formatos no estándar.
- **Ortografía estándar únicamente**: grafías coloquiales o vocales alargadas (como *çoook* o *yaaa*) están fuera de distribución y producen resultados no naturales.
- **Una sola voz fija**: no hay clonación de voz, control de hablante ni prompts de estilo. El modelo siempre genera la misma voz.
- **Sesgos y alucinaciones**: al ser un modelo TTS, no genera contenido semántico propio, pero puede producir pronunciaciones incorrectas en entradas fuera de distribución. No se han documentado sesgos específicos.
- **Etiquetado**: la salida es voz sintética y debe etiquetarse como tal cuando sea necesario.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/canberkkkkkk/ema-tts)
- [Dataset Freya-TR-Eval](https://huggingface.co/datasets/freyavoice/freya-tr-eval)
- [AudioVAE2 / VoxCPM2](https://huggingface.co/openbmb/VoxCPM2)
- [Informe técnico (report.pdf)](https://huggingface.co/canberkkkkkk/ema-tts/blob/main/report.pdf)
