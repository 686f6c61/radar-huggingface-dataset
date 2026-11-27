# Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-q8_0

## Resumen

Parakeet-TDT-0.6B-Singlish-v2-q8_0 es la versión cuantizada en formato GGUF (q8_0) del modelo de reconocimiento automático del habla Scrya/parakeet-tdt-0.6b-singlish-v2, un ajuste fino de NVIDIA Parakeet-TDT-0.6B-v3 sobre inglés de Singapur conversacional. El ajuste se realizó con 1.386 horas de audio del National Speech Corpus (NSC) de IMDA, en concreto de cinco de sus partes, con datos y configuraciones orientados a speech de salas de reuniones. Esta cuantización está pensada para ejecutarse con NeMo-Speech.cpp, el runtime en C++ de NVIDIA para modelos de voz NeMo.

El modelo emplea una arquitectura transducer TDT (Token-and-Duration Transducer) con 637.329.158 parámetros, lo que lo sitúa en la gama de 0,6B. El repositorio ocupa 0,7 GB e incluye un único fichero GGUF q8_0 de 0,71 GB compatible con NeMo-Speech.cpp 0.3.0. Está disponible también una variante f16 en un repositorio hermano y los pesos originales en safetensors y `.nemo` en el repositorio principal.

Su relevancia práctica es doble: por un lado, ofrece una alternativa de inferencia muy rápida (190x tiempo real en una RTX 5090 sobre 5.000 clips, incluyendo arranque y carga) sin pérdida medible de calidad frente al modelo original en fp32; por otro, demuestra que una cuantización q8_0 de un transducer de 0,6B puede reproducir exactamente el texto del modelo original en 4.734 de 5.000 clips de evaluación. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Token-and-Duration Transducer (TDT), familia Parakeet de NVIDIA |
| Parametros totales | 637.329.158 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio por ventanas) |
| Tipos de cuantizacion | q8_0 (este repo); f16 en repo hermano; fp32 en el modelo base |
| Idiomas soportados | en (inglés de Singapur, Singlish) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (q8_0); safetensors y `.nemo` en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, una variante de las arquitecturas encoder-decoder para ASR en la que el decoder predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por frame de audio y reducir el coste de decodificación frente a un transducer clásico. Parte de NVIDIA Parakeet-TDT-0.6B-v3 y se ha ajustado fino sobre 1.386 horas de inglés de Singapur conversacional procedente de cinco partes del National Speech Corpus de IMDA, con selección de datos y hiperparámetros orientados a reuniones. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de audio vistos ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo ASR, el entrenamiento es supervisado sobre pares audio-transcripción.

La innovación destacable de esta ficha no está en el entrenamiento sino en la distribución: la cuantización q8_0 se ha validado contra el modelo original en fp32 con decodificación greedy y un límite de 3 tokens por frame de audio, sobre una muestra de 5.000 clips (7,15 horas) ponderada por igual entre las cinco partes del NSC. El resultado es que la cuantización reproduce el texto exacto del original en 4.734 de 5.000 clips y la diferencia de WER normalizado es 0,00 puntos porcentuales (intervalo del 95%: -0,05 a +0,04), es decir, sin degradación medible. La variante f16, pese a ocupar el doble, no obtiene mejor puntuación.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés de Singapur conversacional, con especial foco en audio de salas de reuniones.
- Salida con puntuación y mayúsculas, y números escritos con palabras (por ejemplo, "twenty five" en lugar de "25").
- Transcripción de ficheros individuales o de carpetas completas por lotes mediante la CLI de NeMo-Speech.cpp, con salida en JSON y procesamiento concurrente (`--concurrency 16`).
- Decodificación verbatim mediante el flag `--verbatim`, que evita que el runtime reescriba los números.
- Ejecución en GPU (CUDA) a través del runtime C++ de NVIDIA; no se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada más allá del propio ASR ni modo de razonamiento.
- Capacidad multilingüe limitada al inglés de Singapur; no se declaran otros idiomas.

## Casos de uso

- Transcripción de reuniones y actas: el ajuste se entrenó específicamente con audio de salas de reuniones del NSC, por lo que es adecuado para diarización posterior y generación de actas en entornos corporativos de Singapur.
- Procesamiento por lotes de archivos de audio: la CLI permite transcribir carpetas enteras con `--concurrency 16` y salida JSON, lo que encaja en pipelines de ingesta masiva de grabaciones.
- Subtitulado y indexación de contenido audiovisual: la salida con puntuación y mayúsculas reduce el postprocesado necesario antes de publicar subtítulos.
- Análisis de conversaciones de contact center: al estar ajustado a habla conversacional de Singapur, maneja mejor que un modelo genérico las particularidades léxicas y fonéticas del Singlish.
- Despliegue en hardware de gama consumer: con 0,71 GB en q8_0 y 190x tiempo real en una RTX 5090, es viable transcribir en estaciones de trabajo con GPU consumer sin infraestructura dedicada.
- Integración en herramientas de accesibilidad: transcripción en near real time de audio en vivo para subtitulado en entornos donde el inglés de Singapur es la lengua de trabajo.
- Evaluación y sustitución de modelos ASR genéricos: sirve como referencia para comparar WER en dominios específicos de Singapur frente a modelos multilingües de mayor tamaño.

## Benchmarks y rendimiento

Los datos publicados comparan esta cuantización con el modelo original en fp32 sobre 5.000 clips (7,15 horas) muestreados de cinco partes del NSC.

| Modelo | WER normalizado | WER formateado | Diferencia normalizada | Velocidad (RTX 5090) |
|---|---:|---:|---|---:|
| Original (transformers, fp32) | 8,25% | 15,27% | — | — |
| Este fichero, un clip a la vez | 8,25% | 15,27% | 0,00 [-0,05, +0,04] | 190x tiempo real |

Desglose por parte del NSC (WER normalizado y formateado):

| Parte | Original normalizado | Este fichero normalizado | Original formateado | Este fichero formateado |
|---|---:|---:|---:|---:|
| Part 3 SDM | 9,12% | 9,10% | 15,45% | 15,45% |
| Part 3 Same Room | 10,45% | 10,50% | 15,67% | 15,65% |
| Part 4 | 14,27% | 14,25% | 22,56% | 22,45% |
| Part 5 | 6,19% | 6,21% | 12,57% | 12,68% |
| Part 6.3 | 6,00% | 5,97% | 13,71% | 13,69% |

Comparación con la versión 1 del mismo modelo (diferencias en puntos porcentuales, negativas = menos errores):

| Parte | v1 normalizado | v2 normalizado | Diferencia | v1 formateado | v2 formateado | Diferencia |
|---|---:|---:|---|---:|---:|---|
| Part 3 SDM | 9,94% | 9,10% | -0,84 [-1,32, -0,42] | 16,64% | 15,45% | -1,19 [-1,72, -0,72] |
| Part 3 Same Room | 10,80% | 10,50% | -0,30 [-0,65, -0,01] | 16,18% | 15,65% | -0,54 [-0,97, -0,14] |
| Part 4 | 14,60% | 14,25% | -0,35 [-0,81, +0,06] | 23,12% | 22,45% | -0,66 [-1,28, -0,10] |
| Part 5 | 6,32% | 6,21% | -0,11 [-0,32, +0,09] | 12,83% | 12,68% | -0,15 [-0,43, +0,17] |
| Part 6.3 | 6,02% | 5,97% | -0,05 [-0,19, +0,10] | 13,92% | 13,69% | -0,23 [-0,50, +0,03] |
| Todas las partes | 8,48% | 8,25% | -0,23 [-0,36, -0,11] | 15,70% | 15,27% | -0,43 [-0,59, -0,25] |

Nota metodológica del autor: el WER de la muestra ponderada es inferior al de los conjuntos de test completos, que están dominados por la Parte 3. Los intervalos de confianza del 95% se obtuvieron por bootstrap sobre hablantes.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF q8_0 ocupa 0,71 GB, por lo que la huella de pesos es inferior a 1 GB; el consumo total depende del runtime y del batching. La variante f16 ocupa aproximadamente el doble.
- GPU recomendadas: RTX 5090 como referencia de velocidad publicada (190x tiempo real); cualquier GPU NVIDIA con soporte CUDA es candidata, ya que el modelo es pequeño. No se publican cifras para A100, H100 ni RTX 4090 en la información disponible.
- GPU consumer: sí cabe con holgura en cualquier GPU consumer moderna con CUDA; el cuello de botella es el runtime, no la memoria.
- Opciones de despliegue: NeMo-Speech.cpp 0.3.0 (runtime C++ de NVIDIA) mediante la CLI `nemo-speech transcribe`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible, al tratarse de un modelo de voz y no de texto.
- Latencia y throughput: 190x tiempo real en una RTX 5090 sobre 5.000 clips, incluyendo arranque del runtime y carga del modelo; con `--concurrency 16` se habilita el batching para aumentar el throughput en procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (muestra NSC) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Este modelo (q8_0, NeMo-Speech.cpp) | 637M | no disponible | 8,25% norm. / 15,27% form. | CC-BY-4.0 | GGUF en HF |
| Scrya/parakeet-tdt-0.6b-singlish-v2 (fp32) | 637M | no disponible | 8,25% norm. / 15,27% form. | CC-BY-4.0 | safetensors y `.nemo` en HF |
| Scrya/parakeet-tdt-0.6b-singlish-v1 (q8_0) | 637M | no disponible | 8,48% norm. / 15,70% form. | CC-BY-4.0 | GGUF en HF |
| NVIDIA parakeet-tdt-0.6b-v3 (base) | 600M aprox. | no disponible | no disponible en esta ficha | no disponible en la información proporcionada | HF |

La comparación con modelos ASR de otros fabricantes (Whisper, Canary, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el ajuste está orientado a inglés de Singapur conversacional y a audio de salas de reuniones; el rendimiento en otros acentos, idiomas o condiciones acústicas puede degradarse de forma significativa.
- Idioma único: solo se declara inglés (variedad de Singapur); no es un modelo multilingüe.
- Formato de salida fijo: escribe números con palabras y aplica puntuación y mayúsculas; para obtener salida literal hay que usar `--verbatim`, y aun así el estilo de formato está condicionado por el entrenamiento.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencios o solapamientos de habla; no se documentan mecanismos de detección de confianza en la información disponible.
- Sesgos: no se documentan análisis de sesgo por género, edad, etnia o clase social en la información proporcionada; el corpus NSC puede sobrerrepresentar determinados registros del inglés de Singapur.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige cumplir las condiciones de la licencia y mantener los avisos correspondientes; conviene revisar también las condiciones del modelo base de NVIDIA.
- Dependencia de runtime: el fichero GGUF está validado para NeMo-Speech.cpp 0.3.0; otras versiones del runtime o convertidores alternativos no están garantizados.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- Cifras de velocidad: las 190x tiempo real se midieron en una RTX 5090 con un lote concreto de 5.000 clips; el throughput en otros hardware o configuraciones puede diferir.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-q8_0
- Modelo base (safetensors y `.nemo`): https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2
- Variante f16 para NeMo-Speech.cpp: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-f16
- Versión 1 cuantizada q8_0: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-q8_0
- Versión 1 del modelo: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
