# neonhugger/whisper_base_fine-tuned_acft_german_mozilla_common_voiceQ8

## Resumen

Este modelo es una adaptación de Whisper-base (openai/whisper-base) fine-tuneado para reconocimiento automático de voz (ASR) en alemán, desarrollado por neonhugger (neonbranch) para mejorar la transcripción de dictados cortos en dispositivos móviles. La principal innovación es la aplicación del método ACFT (Adaptive Context Fine-Tuning) de FUTO, que permite que el encoder procese un contexto dinámico proporcional a la duración del clip de audio, en lugar de fijar los 1500 frames (~30 s) del modelo original. Esto es especialmente relevante para aplicaciones como FUTO Keyboard, donde se transcriben clips de voz de menos de 30 segundos en tiempo real.

El modelo parte de Whisper-base, un transformer encoder-decoder de aproximadamente 74 millones de parámetros, y se ha fine-tuneado en dos etapas: primero con entrenamiento de ASR mediante cross-entropy sobre el corpus Mozilla Common Voice 26.0 en alemán (623 289 clips de entrenamiento) y después con una adaptación ACFT por destilación. El resultado es una reducción del WER en test del 22,12 % (Whisper-base stock) al 13,47 % en modo de contexto dinámico, lo que supone una mejora relativa del 39 %. El modelo está disponible con cuantización q8_0 para ejecutarse con whisper.cpp y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-base) |
| Parámetros totales | ~74 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1500 frames de audio (~30 s) en modo estándar; contexto dinámico con ACFT para clips cortos |
| Tipos de cuantización | q8_0 |
| Idiomas soportados | Alemán (de) |
| Licencia | MIT |
| Formato de pesos | GGUF (q8_0) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura de Whisper-base, un transformer encoder-decoder con aproximadamente 74 millones de parámetros. El encoder procesa espectrogramas de mel de audio (1500 frames en el modo estándar) y el decoder genera texto. En este fine-tune, el modelo se entrena sobre Mozilla Common Voice Scripted Speech 26.0 en alemán (CC0), con 623 289 clips de entrenamiento, 16 208 de validación y 16 208 de test, todos con una duración inferior a 29 segundos.

El entrenamiento se realizó en dos etapas. La primera es un fine-tune de ASR con pérdida de cross-entropy: 1 época (39 000 pasos), batch efectivo de 16 (8 por dispositivo × acumulación de gradientes 2), learning rate 1e-5 con decaimiento lineal y warmup de 500 pasos, precisión bf16, optimizador AdamW y semilla 42. La validación se evaluó cada 1000 pasos sobre 500 clips, seleccionando el checkpoint con mejor WER (15,91 %). La segunda etapa es una adaptación ACFT por destilación: el encoder procesa un número de frames proporcional a la duración del clip (round(1500/30 × dur)) con un jitter aleatorio de ±min(64, ⌊n_ctx/3⌋) frames, mientras que una copia congelada del encoder procesa los 1500 frames completos. La pérdida MSE se aplica sobre los estados ocultos con el objetivo de que los del encoder dinámico coincidan con los del encoder de referencia. La adaptación ACFT es neutral en WER: no se re-midió la validación por separado, pero el test en modo dinámico arrojó 13,47 %.

## Capacidades

- Transcripción de voz alemana (ASR) en clips cortos (< 30 s), con un WER del 13,47 % en el test de Common Voice 26.0 alemán usando contexto dinámico.
- Compatibilidad con whisper.cpp y con el contexto dinámico de audio, lo que permite procesar clips de duración variable sin fijar el contexto completo de 1500 frames.
- Especialización en alemán, con una reducción relativa del error del 37 % (contexto completo) o del 39 % (contexto dinámico) frente a Whisper-base stock.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso, ni visión, ni audio multimodal (solo ASR).
- No es un modelo de lenguaje general; su única capacidad es la transcripción de audio a texto en alemán.
- Ejecución ligera en dispositivos móviles gracias a la cuantización q8_0 y al tamaño reducido (0,1 GB).

## Casos de uso

1. Dictado por voz en teclados móviles: integrar el modelo en FUTO Keyboard para transcribir mensajes cortos en alemán. El contexto dinámico de ACFT reduce la latencia y el consumo de recursos en clips de menos de 30 s.
2. Transcripción de notas de voz en aplicaciones de productividad: usar whisper.cpp con el modelo en una app de notas Android/iOS para convertir dictados de voz en texto, con buena precisión en alemán.
3. Subtitulado automático de vídeos cortos en alemán: generar subtítulos para clips de redes sociales o historias, aprovechando el WER bajo y la ejecución local.
4. Asistente de voz en dispositivos embebidos: al tener solo 74 M parámetros y cuantización q8_0, puede ejecutarse en una Raspberry Pi o en un router, permitiendo comandos de voz en alemán sin conexión.
5. Transcripción de mensajes de voz en chats: en aplicaciones de mensajería, transcribir automáticamente notas de voz para facilitar la búsqueda y la accesibilidad del contenido.
6. Accesibilidad para personas con discapacidad motriz: el dictado por voz en alemán permite escribir sin usar las manos, con una precisión mejorada gracias al fine-tuning.
7. Investigación en ASR de bajo recurso: el modelo sirve como referencia para estudiar el efecto del fine-tuning y de ACFT en el WER de un modelo pequeño, y para comparar con otros enfoques de adaptación.

## Benchmarks y rendimiento

| Modelo | División | WER | Notas |
|---|---|---|---|
| openai/whisper-base (stock) | test | 22,12 % | whisper.cpp, f16, contexto completo |
| openai/whisper-base (stock) | test | 24,51 % | HF transformers, GPU (sin attention_mask) |
| openai/whisper-base (stock) | val | ~28,7 % | pre-training baseline |
| Stage 1 fine-tune (stage1-asr-german/final) | val | 15,91 % | mejor checkpoint |
| Este modelo (ACFT, q8_0, contexto completo) | test | 13,83 % | whisper.cpp, 1500 frames |
| Este modelo (ACFT, q8_0, contexto dinámico) | test | 13,47 % | whisper.cpp, contexto dinámico (modo FUTO Keyboard) |

Las evaluaciones se realizaron sobre 500 muestras de Common Voice 26.0 alemán. Los números de test provienen de whisper.cpp (un único runtime), excepto la fila de HF transformers, que es GPU. El fine-tuning + ACFT reduce el WER de 22,12 % a 13,83 % en contexto completo (−37 % relativo) y a 13,47 % en contexto dinámico (−39 % relativo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene ~74 M parámetros y está cuantizado en q8_0, por lo que el peso ocupa aproximadamente 74 MB; la VRAM real depende del runtime y de la longitud del clip.
- GPU recomendadas: no disponible. El entrenamiento se realizó con una RTX A3000 en bf16, pero no se han publicado requisitos específicos para inferencia.
- Compatibilidad con GPU de consumo: sí, al ser un modelo pequeño y cuantizado, cabe en GPUs de consumo como RTX 3060 o RTX 4090, y también en CPU.
- Opciones de despliegue: whisper.cpp (recomendado), HuggingFace Transformers (con atención al attention_mask), y uso directo en FUTO Keyboard.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (test Common Voice 26.0 alemán) | Licencia |
|---|---|---|---|---|
| openai/whisper-base (stock) | ~74 M | 1500 frames | 22,12 % | MIT |
| Este modelo (ACFT, q8_0) | ~74 M | 1500 frames / dinámico | 13,83 % / 13,47 % | MIT |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en alemán: no debe usarse para otros idiomas, ya que el fine-tuning se realizó únicamente con datos de Common Voice alemán.
- Diseñado para clips cortos (< 30 s): en clips más largos, el contexto dinámico puede degradar el rendimiento si no se configura adecuadamente.
- La evaluación se realizó en Common Voice 26.0 alemán; el rendimiento puede variar en otros dominios (acentos regionales, ruido de fondo, micrófonos diferentes).
- En el modo HuggingFace Transformers, el WER fue más alto (24,51 %) debido a la falta de attention_mask; se recomienda usar whisper.cpp para obtener el rendimiento esperado.
- Riesgo de alucinación en audio con silencios o ruido, como en cualquier modelo ASR.
- No soporta tool calling ni funciones de agente; es un modelo puramente ASR.
- La cuantización q8_0 puede introducir una pequeña pérdida de precisión frente a f16, aunque las evaluaciones muestran un WER bajo.
- Licencia MIT: no hay restricciones comerciales conocidas, pero el modelo deriva de openai/whisper-base (MIT) y usa datos de Common Voice (CC0).

## Enlaces

- HuggingFace: https://huggingface.co/neonhugger/whisper_base_fine-tuned_acft_german_mozilla_common_voiceQ8
- Repositorio de FUTO whisper-acft: https://github.com/futo-org/whisper-acft
- FUTO Keyboard (voice input): https://voiceinput.futo.org
- Dataset Mozilla Common Voice 26.0 German: https://mozilladatacollective.com/datasets/cmqim3xpi00t6nr07k0myqtkr
- Pipeline de entrenamiento (citado en la model card): https://gitlab.com/neonbranch/whisper-german-futo
