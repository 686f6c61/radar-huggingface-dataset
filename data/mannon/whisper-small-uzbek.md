# Mannon/whisper-small-uzbek

## Resumen

Mannon/whisper-small-uzbek es un modelo de reconocimiento automático del habla (ASR) para uzbeko, obtenido mediante ajuste fino completo de openai/whisper-small (244M de parámetros) sobre corpus públicos de voz uzbeka transcrita por humanos. Lo desarrolla el usuario Mannon y se publica bajo licencia Apache-2.0, lo que lo hace directamente utilizable en productos comerciales sin restricciones de pesos. La salida es uzbeko en escritura latina, que es el objetivo declarado del autor.

El modelo resuelve un problema concreto: el uzbeko es un idioma de bajos recursos en el que los modelos ASR multilingües genéricos rinden mal. Este ajuste fino sobre aproximadamente 764,5 horas de audio etiquetado reduce el WER hasta el 7,95 % en FeruzaSpeech y el 9,58 % en Common Voice 22.0 con decodificación greedy, cifras competitivas para un modelo de solo 244M de parámetros.

Es relevante ahora porque demuestra que un Whisper small bien ajustado puede acercarse al rendimiento de un Whisper medium (769M) en uzbeko, con menos de un tercio de los parámetros y por tanto con requisitos de hardware mucho más modestos. El autor publica además una variante medium para quienes necesiten la máxima precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste fino completo de openai/whisper-small |
| Parametros totales | 241.734.912 (≈244M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento; audio largo mediante segmentación con `chunk_length_s=30` |
| Tipos de cuantizacion | no disponible en la model card (pesos en safetensors; admite cuantización estándar de la librería transformers) |
| Idiomas soportados | Uzbeko (uz), salida en escritura latina |
| Licencia | Apache-2.0 (pesos del modelo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de la familia Whisper, con la arquitectura original de openai/whisper-small: encoder convolucional más transformer que procesa espectrogramas Mel de 80 canales en ventanas de 30 segundos, y decoder autorregresivo que genera tokens de texto. El ajuste es completo (full fine-tune), no LoRA ni adaptadores, con AdamW, learning rate 2,16e-5, weight decay 0,05, batch efectivo de 64, 10 % de warmup con decaimiento lineal, hasta 10 épocas, SpecAugment y precisión fp16. El entrenamiento se ejecutó en 2× NVIDIA V100S de 32 GB con paralelismo de datos (DDP) y el checkpoint se seleccionó por WER de validación en un split reservado de USC.

Los datos de entrenamiento son los splits públicos de train de cuatro corpus: UzbekVoice (≈602,8 h filtradas, 78,8 % del total), USC (96,4 h, 12,6 %), Common Voice 22.0 (55,2 h, 7,2 %) y FLEURS (10,1 h, 1,3 %), sumando ≈764,5 h y 653.773 enunciados. Se excluyeron explícitamente pseudo-etiquetas, audio raspado de la web y todos los conjuntos de test de evaluación, lo que evita contaminación entre entrenamiento y evaluación. No se menciona RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto en uzbeko con salida en escritura latina.
- Procesamiento de audio largo mediante ventanas automáticas de 30 segundos (`chunk_length_s=30`).
- Decodificación greedy y beam search (el autor reporta resultados con `num_beams=16` y `no_repeat_ngram_size=4`).
- Carga y remuestreo a 16 kHz desde wav/flac sin necesidad de ffmpeg usando librosa.
- Integración nativa con el pipeline `automatic-speech-recognition` de transformers (≥4.40).
- Selección explícita de idioma y tarea mediante `generate_kwargs={"language": "uz", "task": "transcribe"}`.
- No soporta visión, audio generativo, tool calling ni razonamiento multi-paso: es un modelo ASR puro.

## Casos de uso

- Subtitulado y transcripción de contenido audiovisual en uzbeko: el modelo convierte audio de programas, entrevistas o vídeos en texto con un WER por debajo del 10 % en voz leída, y la segmentación de 30 s permite procesar archivos de varias horas sin dividir manualmente.
- Atención al cliente por voz: permite transcribir llamadas o mensajes de voz de usuarios uzbekos para alimentar sistemas de análisis o respuesta automatizada, con un coste de cómputo bajo gracias a sus 244M de parámetros.
- Generación de actas y notas de reuniones: la ventana de 30 s con chunking automático hace viable transcribir reuniones completas en una GPU de consumo, y la salida en latino evita conversiones posteriores.
- Accesibilidad: subtitulado en tiempo casi real de vídeos y streaming para personas con discapacidad auditiva en comunidades uzbekohablantes, desplegable en servidores modestos.
- Creación de corpus y anotación asistida: el modelo puede pretranscribir audio para que anotadores humanos lo corrijan, acelerando la construcción de nuevos datasets de uzbeko; su WER de 7,95 % en FeruzaSpeech lo hace adecuado como preetiquetador.
- Búsqueda y análisis de archivos de audio: indexación de grabaciones (por ejemplo, archivos de radio o llamadas) para búsqueda por texto, aprovechando que el modelo procesa lotes de audio con el pipeline de transformers.
- Integración en aplicaciones móviles o edge: con 244M de parámetros y pesos safetensors de ~1 GB, es viable cuantizarlo y ejecutarlo en dispositivos con recursos limitados, algo inviable con modelos ASR de mayor tamaño.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, menor es mejor). Las cifras marcadas como no verificadas en el model-index corresponden a la decodificación greedy; la tabla de la model card añade beam search con `num_beams=16`. Referencias y hipótesis normalizadas con `uzbek_text_norm`.

| Conjunto de test | small · greedy | small · beam 16 | medium · greedy | medium · beam 16 |
|:---|:---:|:---:|:---:|:---:|
| Parámetros | 244M | 244M | 769M | 769M |
| FLEURS | 16,96 | 16,21 | 14,11 | 13,01 |
| Common Voice 22.0 | 9,58 | 9,14 | 7,69 | 7,01 |
| USC | 11,81 | 11,22 | 9,70 | 9,10 |
| FeruzaSpeech | 7,95 | 7,31 | 7,41 | 6,96 |

Los resultados del modelo medium corresponden a Mannon/whisper-medium-uzbek, del mismo autor. No se han publicado en la información disponible resultados comparativos con otros modelos ASR de uzbeko de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5-1 GB para los pesos (244M de parámetros), más overhead de activaciones y del pipeline; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- En fp32, los pesos ocupan alrededor de 1 GB; la cuantización a int8 reduce el requisito a unos 250-300 MB.
- GPU recomendadas: NVIDIA V100S (usadas en el entrenamiento), A100, H100 para despliegues de alto throughput; RTX 4090, RTX 3090, RTX 4080 o incluso GPUs de gama media como RTX 3060 para inferencia individual.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para transcripciones no críticas en tiempo real.
- Opciones de despliegue: pipeline de transformers (recomendado por el autor), vLLM no aplica de forma nativa a Whisper en todas sus versiones, TGI para servir modelos de transformers, y llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El uso de `num_beams=16` multiplica el coste de decodificación frente a greedy, con una mejora de WER de entre 0,4 y 0,75 puntos absolutos según el conjunto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER FeruzaSpeech (greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mannon/whisper-small-uzbek | 244M | 30 s por ventana | 7,95 | Apache-2.0 | HuggingFace |
| Mannon/whisper-medium-uzbek | 769M | 30 s por ventana | 7,41 | no disponible en la información | HuggingFace |
| openai/whisper-small (base) | 244M | 30 s por ventana | no disponible para uzbeko | Apache-2.0 | HuggingFace |

El modelo medium del mismo autor mejora al small entre 0,5 y 1,9 puntos de WER según el conjunto, a costa de triplicar los parámetros y los requisitos de memoria. El Whisper small original de OpenAI, sin ajuste en uzbeko, no tiene resultados publicados para este idioma en la información disponible, por lo que no se puede cuantificar la mejora del ajuste fino con datos de esta ficha.

## Limitaciones y advertencias

- Punto más débil: voz enciclopédica con entidades nombradas poco frecuentes, donde el WER se degrada.
- Cobertura limitada de audio ruidoso, de campo lejano y de variantes dialectales; el rendimiento en estos escenarios puede ser notablemente peor que en los conjuntos de test.
- La salida en cirílico no es un objetivo del modelo; solo genera uzbeko en escritura latina.
- Riesgo de alucinación típico de Whisper en segmentos con silencio, ruido o música: puede generar texto inventado, por lo que conviene aplicar detección de voz (VAD) en producción.
- Los resultados de los benchmarks están marcados como no verificados en el model-index y proceden del propio autor; no hay evaluación independiente disponible.
- Licencia Apache-2.0 para los pesos, pero cada dataset de entrenamiento conserva su propia licencia (CC0-1.0, CC-BY-4.0, Apache-2.0); el uso comercial del modelo es posible, aunque conviene revisar las atribuciones requeridas, en particular la de USC (CC BY 4.0).
- Solo soporta uzbeko: no es un modelo multilingüe y forzar otros idiomas producirá salidas incorrectas.
- El modelo tiene muy poca tracción (111 descargas, 0 likes en el momento de la consulta), por lo que no hay validación comunitaria extensa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mannon/whisper-small-uzbek
- Modelo base: https://huggingface.co/openai/whisper-small
- Variante medium del mismo autor: https://huggingface.co/Mannon/whisper-medium-uzbek
- Paper de Whisper (arXiv:2205.12446): https://arxiv.org/abs/2205.12446
- Common Voice: https://commonvoice.mozilla.org/en
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Uzbek Speech Corpus (USC): https://huggingface.co/datasets/issai/uzbek_speech_corpus
- UzbekVoice: https://corpus.uzbekvoice.ai
- Paper de USC (SPECOM 2021): https://doi.org/10.1007/978-3-030-87802-3_40
- Herramienta de normalización de texto uzbeko: https://pypi.org/project/uzbek-text-norm/
