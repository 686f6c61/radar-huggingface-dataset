# laion/Humaneness-Voice-Converter

## Resumen

Humaneness Voice Converter es un modelo de conversion de voz (voice conversion) audio-a-audio desarrollado por LAION sobre la arquitectura Chatterbox de Resemble AI. A diferencia de un TTS, no genera habla a partir de texto: recibe una grabacion de origen y una grabacion corta de un hablante objetivo distinto (y consentido), y produce el contenido del origen con la voz del objetivo, preservando buena parte de la interpretacion del origen. El checkpoint es completo y autonomo: incluye el extractor de tokens semanticos S3 de Chatterbox, el encoder de hablante CAMPPlus, el decodificador flow condicionado por scores, el vocoder HiFT y el predictor de scores Humaneness Ears Medium congelado.

El modelo tiene 264.113.575 parametros y un repo de 1,4 GB en formato safetensors. Su innovacion principal es el condicionamiento por 99 scores (40 emociones, 57 atributos VoiceNet, genuinidad y blending de vocal-burst) que predicen un juez congelado y que modulan el generador flow junto al vector de hablante. Esto permite transferir estilo y emocion del origen mientras se toman ejes mas estables (timbre, edad, genero) del objetivo.

Es relevante ahora porque LAION lo presenta como su checkpoint por defecto recomendado para conversion de voz basada en Chatterbox, orientado a investigacion y aumentacion de datasets. La licencia es CC-BY-4.0 sobre el trabajo de LAION, con atribucion MIT de los componentes upstream de Chatterbox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching condicionado por scores sobre Chatterbox S3Gen (extractor S3 + encoder CAMPPlus + decodificador flow + vocoder HiFT) |
| Parametros totales | 264.113.575 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; el objetivo de referencia es de 5-10 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles y aleman en material de entrenamiento/evaluacion; otros idiomas sin garantia de calidad |
| Licencia | CC-BY-4.0 (componentes upstream Chatterbox bajo MIT) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El pipeline tiene cuatro etapas. Primero, Chatterbox extrae aproximadamente 25 tokens semanticos S3 por segundo del audio de origen, que codifican contenido y timing sin usar texto. Segundo, el audio objetivo (5-10 segundos en el comando probado) aporta un embedding de hablante CAMPPlus y un prefijo acustico. Tercero, el predictor congelado Humaneness Ears Medium estima 99 scores de condicionamiento (40 emociones, 57 atributos VoiceNet, genuinidad y vocal-burst blending); los ejes de estilo y emocion variables en el tiempo se toman del origen, mientras que ejes mas estables de timbre, edad y genero se toman del objetivo. Una proyeccion de scores de dos capas condiciona el generador flow de Chatterbox S3Gen junto al vector de hablante. Cuarto, el decodificador flow genera caracteristicas mel en 10 pasos y el HiFT congelado renderiza una onda a 24 kHz.

El entrenamiento incluye una fase de reinforcement learning (el model card menciona una "known RL source list" y comparaciones entre el predecesor de 24k y el release de 40k). No se detalla en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset ni si hubo RLHF/DPO en el sentido clasico. La innovacion tecnica destacable es el condicionamiento por scores de un juez congelado y la seleccion best-of-N opcional, que mejora recompensa combinada, coincidencia emocional y similitud de hablante.

## Capacidades

- Conversion de voz audio-a-audio: transforma el contenido hablado de un origen en la voz de un objetivo distinto.
- Transferencia de estilo y emocion: los ejes de emocion y estilo variables en el tiempo provienen del origen.
- Preservacion de interpretacion: retiene buena parte de la performance del origen (prosodia, intensidad, ritmo).
- Condicionamiento por 99 scores: 40 emociones, 57 atributos VoiceNet, genuinidad y vocal-burst blending.
- Seleccion best-of-N: muestreo multiple con seleccion por recompensa para mejorar emocion y similitud de hablante.
- Capacidades multilingues limitadas: ingles y aleman representados; otros idiomas procesables sin garantia de calidad.
- No es TTS: no acepta texto como entrada; requiere audio de origen y audio de objetivo.
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Aumentacion de datasets de voz: generar variantes de un mismo contenido en multiples voces para entrenar sistemas de ASR o diarizacion, usando el modelo como generador controlado de datos.
- Investigacion en conversion de voz expresiva: evaluar como se transfieren emociones concretas (las 40 clases del juez) desde un origen a una voz objetivo, con metricas proxy reproducibles.
- Prototipado de doblaje y localizacion: convertir una locucion de referencia a la voz de un actor objetivo manteniendo la interpretacion del original, en fase de exploracion.
- Estudios de percepcion y evaluacion: comparar salidas del modelo frente a Chatterbox sin tocar y a conversores externos validados, usando el set curado de 40 fuentes y dos voces fijas.
- Pruebas de robustez de sistemas de verificacion de hablante: generar conversiones con distinta similitud de hablante (cosine 0.773 frente a 0.821 del vanilla) para estresar detectores.
- Experimentacion con seleccion best-of-N: integrar el muestreo multiple y la recompensa del juez en pipelines de generacion para mejorar la coincidencia emocional (MSE 0.072 en best-of-16).

## Benchmarks y rendimiento

Resultados proxy medidos por el autor sobre 40 fuentes curadas x dos objetivos fijos, muestra unica (salvo best-of-16). CE y PQ son salidas de Humaneness Ears Medium; el MSE de emocion top-2 y el cosine CAMPPlus son metricas proxy.

| Decoder | CE (mayor mejor) | PQ (mayor mejor) | Emotion MSE (menor mejor) | Target speaker cosine (mayor mejor) |
|---|---:|---:|---:|---:|
| Untouched Chatterbox S3Gen | 6.169 | 7.766 | 0.113 | **0.821** |
| Humaneness Voice Converter (default) | **6.453** | **8.009** | **0.092** | 0.773 |
| Humaneness Voice Converter Best-of-16 | 6.460 | 8.009 | **0.072** | 0.795 |

Comparacion con el predecesor de 24k sobre 93 fuentes disjuntas de UID de entrenamiento:

| Version | CE | PQ | Emotion MSE | Speaker cosine |
|---|---:|---:|---:|---:|
| 24k | 5.930 | 7.790 | 0.289 | 0.730 |
| 40k | 6.074 | 7.876 | 0.320 | 0.738 |

No hay resultado independiente de MOS humano ni de WER para este release.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada; con 264M parametros en safetensors y 1,4 GB de repo, la inferencia en fp32 requeriria del orden de 1-2 GB solo para pesos, mas activaciones y el predictor de scores congelado.
- GPU recomendadas: el comando probado usa CUDA con PyTorch 2.9.1+cu128; no se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: script `infer.py` del repo con `chatterbox-tts==0.1.7` y `transformers` 5.14.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a audio).
- Latencia y throughput: no disponibles. El decodificador flow usa 10 pasos y el vocoder renderiza a 24 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humaneness Voice Converter | 264.113.575 | objetivo 5-10 s | Flow matching condicionado por scores | CC-BY-4.0 (upstream MIT) | HF, checkpoint completo |
| Resemble AI Chatterbox (base) | no disponible | no disponible | TTS/voice cloning upstream | MIT | HF |
| Humaneness Voice Small | no disponible | no disponible | TTS semantico (no es conversor) | no disponible | HF (mencionado) |
| Conversores externos validados | no disponible | no disponible | voice conversion | no disponible | mencionados en demo |

## Limitaciones y advertencias

- Una voz convertida no es una identidad de hablante verificada; la similitud CAMPPlus es solo una metrica proxy.
- El modelo reduce la similitud de hablante frente a Chatterbox vanilla (0.773 frente a 0.821), a cambio de mejor CE, PQ y coincidencia emocional.
- El set de evaluacion no esta probado como disjunto a nivel de hablante; 10 UIDs de origen solapan con la lista RL conocida.
- No hay MOS humano ni WER independientes; las metricas CE/PQ/emocion provienen del mismo juez usado en entrenamiento.
- Requiere audio objetivo de 5-10 segundos y un prefijo acustico; no es clonacion solo por texto.
- Idiomas: solo ingles y aleman garantizados; otros idiomas sin garantia de calidad.
- Riesgo de alucinacion y artefactos en audio: no cuantificado en la informacion disponible.
- Restricciones de licencia: CC-BY-4.0 exige atribucion; los componentes upstream Chatterbox son MIT y deben conservar su atribucion (ver `NOTICE.md`).
- Entorno de inferencia validado solo en el entorno Jupiter existente, no como resolucion limpia multiplataforma; los pins de metadata de Chatterbox 0.1.7 se sobrescriben.
- Uso etico: solo con hablantes objetivo que hayan dado consentimiento; el model card lo enfatiza explicitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/Humaneness-Voice-Converter
- Demo (Space): https://huggingface.co/spaces/laion/Humaneness-Voice-Converter-Demo
- Modelo base Chatterbox: https://huggingface.co/ResembleAI/chatterbox
