# Dorjzodovsuren/whisper-large-v3-mn-full-1

## Resumen

Whisper large-v3 mn-full-1 es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla Whisper large-v3, publicado por el usuario Dorjzodovsuren en HuggingFace. Se trata de un modelo de la familia Whisper de OpenAI, redistribuido a través del repositorio de Unsloth (`unsloth/whisper-large-v3`), que el autor ha reentrenado con un conjunto de datos no documentado en la model card. El nombre del repositorio incluye el sufijo "mn", que sugiere un ajuste orientado al idioma mongol, aunque la model card declara únicamente el inglés como idioma soportado.

El modelo conserva la arquitectura encoder-decoder transformer propia de Whisper large-v3, con aproximadamente 1.543 millones de parámetros (1,54 B) según los pesos en safetensors. El repositorio ocupa 6,2 GB, lo que corresponde a los pesos en precisión completa (fp32) o fp16 del modelo base. La licencia es Apache 2.0, heredada del modelo original.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo recién publicado (noviembre de 2026) sin descargas ni interacciones, sin model card detallada y sin benchmarks publicados. Resulta útil como ejemplo de flujo de fine-tuning acelerado con Unsloth sobre Whisper, pero no dispone de documentación suficiente para evaluar su calidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 admite ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper large-v3, un transformer encoder-decoder diseñado para reconocimiento automático del habla. El encoder procesa espectrogramas mel-log de audio en ventanas de 30 segundos y el decoder genera tokens de transcripción de forma autorregresiva. Whisper large-v3 incorpora 1.280 dimensiones de modelo, 32 capas de encoder y 32 de decoder, y una cabeza de clasificación sobre un vocabulario multilingüe. El modelo base admite multitud de idiomas, aunque este ajuste declara únicamente inglés.

El autor indica que el entrenamiento se realizó con Unsloth, lo que según la model card permitió entrenar "2x más rápido". No se especifica el número de tokens de audio, la composición del dataset, si hubo etapas de RLHF/DPO (poco habituales en ASR) ni hiperparámetros de entrenamiento. No se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el fine-tuning. La model card es una plantilla autogenerada por Unsloth sin información sustantiva sobre el proceso.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea principal del pipeline declarado (`automatic-speech-recognition`).
- Generación de texto condicionada a audio: el decoder de Whisper puede producir transcripciones y, potencialmente, traducciones si el ajuste lo preserva (no documentado).
- Procesamiento de audio en ventanas de hasta 30 segundos por segmento, con concatenación de segmentos para audio más largo.
- Capacidades multilingües: el modelo base es multilingüe, pero este ajuste declara solo inglés; el comportamiento en otros idiomas no está documentado.
- Tool calling / function calling: no disponible; no es una capacidad de Whisper.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio de entrada adicional: no disponible más allá del audio de entrada propio de ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio de hasta 30 segundos por segmento en texto; adecuado para pipelines de subtitulado y actas si el ajuste mantiene la calidad del base, aunque no hay evaluación publicada que lo confirme.
- Subtitulado automático de vídeo: integrable en flujos que segmentan el audio en ventanas de 30 s y concatenan las transcripciones, con la ventaja de los pesos en safetensors listos para `transformers`.
- Prototipado de ASR con Unsloth: útil como punto de partida para experimentar con fine-tuning acelerado de Whisper en entornos con recursos limitados.
- Investigación sobre ajuste de dominio en ASR: sirve como ejemplo de cómo adaptar Whisper large-v3 a un corpus concreto, aunque el corpus no está documentado.
- Generación de datos etiquetados para entrenamiento de otros modelos: transcripciones de audio como pseudoetiquetas, con la cautela de validar la calidad manualmente.
- Despliegue en endpoints compatibles con TGI: el tag `endpoints_compatible` sugiere compatibilidad con infraestructura de inferencia gestionada, útil para pruebas rápidas sin montar servidor propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER (word error rate) ni comparaciones con el modelo base u otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,54 B parámetros, en fp16 se requieren aproximadamente 3,1 GB solo para pesos; en fp32, unos 6,2 GB. Añadiendo activaciones y buffers de audio, se estima un mínimo de 4-6 GB en fp16.
- GPU recomendadas: RTX 3090/4090 (24 GB) para holgura; A100/H100 para despliegues por lotes; también cabe en GPUs consumer de 8-12 GB con fp16 o cuantización (aunque no se publican GGUF).
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en fp16, siempre que se gestione el tamaño de lote.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan cuantizaciones, que no están disponibles en el repo.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del tamaño de los segmentos de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dorjzodovsuren/whisper-large-v3-mn-full-1 | 1,54 B | ventanas de 30 s | en (declarado) | apache-2.0 | HuggingFace, 0 descargas |
| openai/whisper-large-v3 | ~1,55 B | ventanas de 30 s | multilingüe | apache-2.0 | HuggingFace, ampliamente usado |
| unsloth/whisper-large-v3 | ~1,55 B | ventanas de 30 s | multilingüe | apache-2.0 | HuggingFace, modelo base del ajuste |

La comparación con el modelo base y con el original de OpenAI es la más pertinente: este ajuste no documenta mejoras medibles frente a ellos, por lo que en ausencia de benchmarks no puede considerarse una alternativa superior. No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay WER ni métricas que permitan validar la calidad del ajuste frente al modelo base.
- Model card mínima: no se documenta el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el dominio objetivo, lo que impide reproducir o auditar el ajuste.
- Idiomas: la model card declara solo inglés, pese al sufijo "mn" del nombre; el comportamiento en mongol u otros idiomas no está verificado.
- Sesgos: heredados del corpus de entrenamiento de Whisper large-v3 (no documentado en esta ficha); el ajuste puede amplificarlos si el corpus es reducido o sesgado.
- Riesgo de alucinación: Whisper es conocido por generar texto plausible en silencios o audio ruidoso; sin evaluación específica, este riesgo persiste.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y de los datos de ajuste (no documentados).
- Estado del repositorio: 0 descargas y 0 likes, publicado en noviembre de 2026; no hay evidencia de uso en producción ni mantenimiento.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones para despliegue en CPU o GPUs de gama baja.

## Enlaces

- HuggingFace: https://huggingface.co/Dorjzodovsuren/whisper-large-v3-mn-full-1
- Modelo base en HuggingFace: https://huggingface.co/unsloth/whisper-large-v3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original de OpenAI Whisper: https://huggingface.co/openai/whisper-large-v3
