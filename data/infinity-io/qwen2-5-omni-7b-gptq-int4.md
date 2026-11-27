# Infinity-io/Qwen2.5-Omni-7B-GPTQ-Int4

## Resumen

Qwen2.5-Omni-7B-GPTQ-Int4 es una versión cuantizada a 4 bits del modelo multimodal Qwen2.5-Omni-7B desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo end-to-end "any-to-any" capaz de percibir texto, imágenes, audio y vídeo, y de generar simultáneamente respuestas en texto y voz natural en modo streaming. Esta variante, publicada por Infinity-io, aplica cuantización GPTQ de 4 bits sobre los pesos del módulo Thinker para reducir el consumo de VRAM y permitir su ejecución en GPUs de consumo.

La relevancia de esta ficha radica en que la cuantización reduce los requisitos de memoria en más del 50 % respecto al modelo original, a costa de una ligera degradación del rendimiento y de la velocidad de inferencia. El modelo emplea una arquitectura novedosa denominada Thinker-Talker, junto con un embedding posicional llamado TMRoPE que sincroniza las marcas temporales del vídeo con el audio.

El modelo está pensado para aplicaciones de interacción en tiempo real que combinan voz, vídeo y texto, como asistentes conversacionales multimodales o sistemas de atención al cliente con entrada de audio. Su licencia declarada es Apache 2.0, aunque la model card original de Qwen indica `license: other` con nombre `apache-2.0`, por lo que conviene verificar los términos exactos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Thinker-Talker con TMRoPE (Time-aligned Multimodal RoPE) |
| Parametros totales | 10.732.225.440 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ Int4 (4 bits) sobre los pesos del Thinker |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (la model card original declara `license: other` con `license_name: apache-2.0`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Thinker-Talker propuesta por Qwen para Qwen2.5-Omni. El módulo Thinker procesa las entradas multimodales (texto, imagen, audio y vídeo) y genera representaciones internas y texto; el módulo Talker se encarga de producir voz natural en streaming a partir de esas representaciones. La innovación principal es TMRoPE, un embedding posicional que alinea temporalmente los fotogramas de vídeo con las pistas de audio para permitir interacciones en tiempo real con entradas fragmentadas (chunked input) y salida inmediata.

Esta variante concreta aplica cuantización GPTQ de 4 bits sobre los pesos del Thinker y modifica el pipeline de inferencia para cargar los pesos de cada módulo bajo demanda y descargarlos a memoria de CPU al terminar, evitando picos de VRAM. Además, el módulo token2wav se convierte para soportar inferencia en streaming y el solver ODE pasa de segundo orden (RK4) a primer orden (Euler) para reducir el coste computacional. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Percepción multimodal de texto, imágenes, audio y vídeo en un único modelo end-to-end.
- Generación simultánea de texto y voz natural en modo streaming.
- Conversación de voz y vídeo en tiempo real con soporte de entrada fragmentada.
- Reconocimiento automático de habla (ASR) y síntesis de voz (TTS) integrados.
- Comprensión de vídeo con alineación temporal audio-vídeo mediante TMRoPE.
- Seguimiento de instrucciones por voz end-to-end, con rendimiento cercano al de las entradas de texto según la model card.
- Capacidades de razonamiento y conocimiento evaluadas en MMLU-Pro.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).

## Casos de uso

- Asistentes conversacionales por voz en tiempo real: el modelo puede recibir audio fragmentado y emitir voz de forma inmediata gracias a su arquitectura de streaming, lo que lo hace adecuado para interfaces de voz interactivas de baja latencia.
- Transcripción y comprensión de reuniones: combina ASR con razonamiento sobre el texto transcrito, permitiendo generar resúmenes o responder preguntas sobre el contenido de una reunión a partir del audio.
- Análisis de vídeo con audio sincronizado: TMRoPE permite alinear los fotogramas con la pista de sonido, útil para describir escenas, detectar eventos o responder preguntas sobre contenido audiovisual.
- Atención al cliente multimodal: puede gestionar conversaciones que incluyan texto, imágenes o audio del usuario, con generación de respuestas habladas para entornos de contact center.
- Descripción de imágenes y accesibilidad: generación de descripciones textuales o locutadas de imágenes para personas con discapacidad visual, aprovechando la salida de voz integrada.
- Síntesis de voz para lectura de contenido: el módulo Talker permite convertir texto en voz natural, útil para lectores de pantalla o narración automática de documentos.
- Prototipado en hardware de consumo: la cuantización Int4 y la carga bajo demanda permiten ejecutar el modelo en GPUs como RTX 3080, 4080 o 5070, facilitando pruebas y demos en estaciones de trabajo locales.

## Benchmarks y rendimiento

| Evaluation Set | Task | Metrics | Qwen2.5-Omni-7B | Qwen2.5-Omni-7B-GPTQ-Int4 |
|---|---|---|---|---|
| LibriSpeech test-other | ASR | WER ↓ | 3.4 | 3.71 |
| WenetSpeech test-net | ASR | WER ↓ | 5.9 | 6.62 |
| Seed-TTS test-hard | TTS (Speaker: Chelsie) | WER ↓ | 8.7 | 10.3 |
| MMLU-Pro | Text -> Text | Accuracy ↑ | 47.0 | 43.76 |
| OmniBench | Speech -> Text | Accuracy ↑ | 56.13 | 53.59 |
| VideoMME | Multimodality -> Text | Accuracy ↑ | 72.4 | 68.0 |

| Model | Precision | 15(s) Video | 30(s) Video | 60(s) Video |
|---|---|---|---|---|
| Qwen-Omni-7B | FP32 | 93.56 GB | No recomendado | No recomendado |

No se han publicado en la información disponible datos de VRAM para la variante GPTQ-Int4 en la tabla de consumo de memoria, más allá de la indicación cualitativa de una reducción superior al 50 %.

## Requisitos de hardware

- VRAM estimada: la model card indica una reducción de más del 50 % respecto a los 93.56 GB del modelo en FP32 para vídeo de 15 segundos, aunque no se especifica la cifra exacta para la variante Int4.
- GPU recomendadas: la model card menciona explícitamente RTX 3080, RTX 4080 y RTX 5070 como objetivos de hardware de consumo.
- Cabe en GPU de consumo: sí, según la model card, gracias a la cuantización Int4 y a la carga de pesos bajo demanda con offload a CPU.
- Opciones de despliegue: transformers (rama específica `v4.51.3-Qwen2.5-Omni-preview`), accelerate, gptqmodel 2.0.0 y el toolkit `qwen-omni-utils`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: la model card señala que la variante GPTQ-Int4 presenta una inferencia ligeramente más lenta que el modelo original debido a la cuantización y al mecanismo de offload a CPU; no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Cuantización |
|---|---|---|---|---|---|
| Qwen2.5-Omni-7B-GPTQ-Int4 | 10.732.225.440 | no disponible | Texto, imagen, audio, vídeo; salida texto y voz | Apache 2.0 (declarada) | GPTQ Int4 |
| Qwen2.5-Omni-7B | no disponible en la información | no disponible | Texto, imagen, audio, vídeo; salida texto y voz | Apache 2.0 (según la model card original) | FP32 / sin cuantizar |
| Qwen2-Audio | no disponible en la información | no disponible | Audio y texto | no disponible | no disponible |
| Qwen2.5-VL-7B | no disponible en la información | no disponible | Imagen, vídeo y texto | no disponible | no disponible |

La model card indica que Qwen2.5-Omni supera a Qwen2-Audio en capacidades de audio y alcanza un rendimiento comparable a Qwen2.5-VL-7B en tareas visuales, aunque no se aportan cifras detalladas de esas comparaciones en la información disponible.

## Limitaciones y advertencias

- La cuantización Int4 degrada el rendimiento respecto al modelo original: el WER sube de 3.4 a 3.71 en LibriSpeech test-other y la precisión en MMLU-Pro cae de 47.0 a 43.76.
- La velocidad de inferencia es ligeramente inferior a la del modelo sin cuantizar debido a la cuantización y al offload a CPU.
- El modelo solo declara soporte de inglés (`language: en`), lo que limita su uso en castellano u otros idiomas.
- No se dispone de información sobre sesgos conocidos ni sobre la tasa de alucinación en la documentación proporcionada.
- La licencia presenta ambigüedad: los metadatos de Hugging Face indican `apache-2.0`, pero la model card original declara `license: other` con `license_name: apache-2.0`; es necesario verificar los términos antes de un uso comercial.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere una validación comunitaria limitada.
- Para vídeos de 30 y 60 segundos, la model card del modelo original marca el uso como "no recomendado" en FP32 por consumo de memoria; se desconoce el comportamiento exacto de la variante Int4 en esos casos.
- Requiere una rama específica de transformers y versiones fijadas de dependencias (gptqmodel 2.0.0, numpy 2.0.0), lo que puede complicar la integración en entornos existentes.

## Enlaces

- [Hugging Face: Infinity-io/Qwen2.5-Omni-7B-GPTQ-Int4](https://huggingface.co/Infinity-io/Qwen2.5-Omni-7B-GPTQ-Int4)
- [Licencia enlazada en la model card](https://huggingface.co/Qwen/Qwen2.5-Omni-7B-GPTQ-Int4/blob/main/LICENSE)
- [Repositorio GitHub Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni)
- [Qwen Chat](https://chat.qwen.ai/)
- [Paper arXiv:2503.20215](https://arxiv.org/abs/2503.20215)
