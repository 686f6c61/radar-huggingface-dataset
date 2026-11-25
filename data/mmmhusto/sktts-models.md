# mmmhusto/sktts-models

## Resumen

SKTTS es un proyecto de investigación de síntesis de voz (text-to-speech) publicado por el usuario mmmhusto en Hugging Face. El repositorio no contiene un modelo TTS final, sino un conjunto de checkpoints intermedios de entrenamiento: autoencoders de audio a 44,1 kHz con latentes de 24, 48 y 64 dimensiones, junto con modelos acústicos de inglés de arquitectura tipo Matcha (v2). El proyecto declara el inglés como primer idioma objetivo y el eslovaco como idioma previsto para fases posteriores. El autor advierte explícitamente de que se trata de estados intermedios de entrenamiento y no de un producto terminado.

El repositorio ocupa 8,3 GB y se distribuye bajo licencia CC BY 4.0, con la obligación de atribuir los datasets de origen (HiFi-TTS, VCTK, LibriTTS-R, TrePal y lili). La relevancia actual es limitada para producción, pero resulta útil para investigadores que quieran reproducir o auditar las etapas de un pipeline TTS completo: codificación latente de audio de alta frecuencia de muestreo, decodificación con entrenamiento GAN y modelado acústico condicionado por texto.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los resultados de benchmarks en la documentación publicada. El modelo no registra descargas ni likes en el momento de la consulta, lo que confirma su carácter de artefacto de investigación reciente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder de audio (encoder + decoder con upsampling) y modelos acústicos tipo Matcha v2 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés); eslovaco previsto, no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (repo de 8,3 GB; no se detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El componente central es un autoencoder de voz a 44,1 kHz con latente de 64 dimensiones (`ae64x/`). Su encoder proviene de una ejecución únicamente sobre mel-espectrogramas, mientras que el decoder de sobremuestreo se tomó de un checkpoint anterior (`ae44d`) y se entrenó con GAN durante 14.000 pasos adicionales; el autor lo describe como el mejor resultado hasta la fecha. Existen además variantes con latente de 24 dimensiones (`ae44a`, `ae44d`) y pruebas de tamaño de latente de 24, 48 y 64 (`aelat/<size>/`) con ejecuciones cortas solo sobre mel.

Los modelos acústicos de inglés (`v2-en/`, `v2-en-long/`, `v21-en/`) siguen la arquitectura Matcha v2 y se entrenaron sobre LibriTTS-R y HiFi-TTS. Se incluye también una línea base Matcha entrenada solo con LibriTTS-R (`matcha-en-baseline/`). Los autoencoders se entrenaron con HiFi-TTS y VCTK. No se especifican el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo fases de RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en inglés mediante los modelos acústicos Matcha v2.
- Codificación y reconstrucción de audio de voz a 44,1 kHz mediante el autoencoder de 64 dimensiones latentes.
- Reconstrucción de audio con decoder GAN entrenado durante 14.000 pasos adicionales sobre el checkpoint `ae44d`.
- Experimentación con distintos tamaños de espacio latente (24, 48 y 64 dimensiones).
- Análisis de calidad por clip de datasets de voz eslovacos (`analysis/`), orientado a la futura extensión al eslovaco.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Investigación en autoencoders de audio: el checkpoint `ae64x` permite estudiar el efecto de un latente de 64 dimensiones frente a 24 en la reconstrucción de voz a 44,1 kHz, comparando las variantes `ae44a` y `ae44d`.
- Reproducción de pipelines TTS completos: los modelos `v2-en` y `v21-en` se pueden encadenar con el autoencoder para generar voz en inglés y evaluar cada etapa por separado.
- Evaluación de decodificadores GAN: el entrenamiento adicional de 14.000 pasos sobre el decoder de `ae44d` sirve como caso de estudio de mejora de calidad de reconstrucción sin reentrenar el encoder.
- Auditoría de calidad de datasets: la carpeta `analysis/` contiene análisis por clip de TrePal y lili, útil para investigar sesgos y calidad en corpus de voz eslovacos antes de entrenar.
- Línea base para comparativas: `matcha-en-baseline` permite medir la ganancia de añadir HiFi-TTS frente a entrenar solo con LibriTTS-R.
- Preparación de la extensión al eslovaco: el análisis de los datasets TrePal y lili sirve como paso previo para adaptar los modelos acústicos al eslovaco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (8,3 GB) incluye varios checkpoints, no un único modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| SKTTS (este repo) | Autoencoder + Matcha v2 | no disponible | no disponible | CC BY 4.0 | Checkpoints de investigación |
| Matcha-TTS | TTS acústico | no disponible | no disponible | no disponible | Proyecto de referencia citado por el autor |
| HiFi-GAN | Vocoder | no disponible | no disponible | no disponible | Dataset/vocoder de referencia en el entrenamiento |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Son checkpoints intermedios de entrenamiento, no un producto final; el autor lo indica explícitamente.
- Solo se documenta inglés; el eslovaco está previsto pero no disponible.
- No se especifican parámetros, contexto ni formato de pesos, lo que dificulta la planificación de despliegue.
- Riesgo de alucinación y sesgos: no documentados; al entrenarse con HiFi-TTS, VCTK, LibriTTS-R, TrePal y lili, hereda los sesgos de esos corpus.
- Licencia CC BY 4.0: permite uso comercial con atribución a los datasets de origen; es obligatorio citar HiFi-TTS, VCTK, LibriTTS-R, TrePal y lili.
- Prohibición explícita de usar los checkpoints para imitar la voz de una persona real.
- Sin descargas ni validación comunitaria; no hay evidencia de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mmmhusto/sktts-models
- Dataset HiFi-TTS: https://huggingface.co/datasets/MikhailT/hifi-tts
- Dataset VCTK: https://huggingface.co/datasets/sanchit-gandhi/vctk
- Dataset LibriTTS-R: https://huggingface.co/datasets/mythicinfinity/libritts_r
- Dataset TrePal: https://huggingface.co/datasets/streams-sro/trepal
- Dataset lili: https://huggingface.co/datasets/vsisik/voice-dataset-lili
- NabuCasa voice-datasets: https://huggingface.co/NabuCasa
