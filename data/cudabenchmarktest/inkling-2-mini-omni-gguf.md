# cudabenchmarktest/Inkling-2-Mini-Omni-GGUF

## Resumen

Inkling 2 Mini Omni es una variante multimodal del modelo de lenguaje y visión Inkling 2 Mini (desarrollado por Thinking Machines), a la que se añade comprensión de voz y síntesis de voz en streaming. La publicación corre a cargo del usuario `cudabenchmarktest` en Hugging Face y combina los pesos originales de lenguaje (cuantizados en IQ4_XS) y visión (proyector BF16) con un *sidecar* entrenado que contiene un puente de audio de dos capas basado en Qwen3A y el modelo de síntesis Qwen3-TTS con su códec.

El modelo base Inkling 2 Mini tiene 2.691.041.665 parámetros (aproximadamente 2,7 mil millones), y esta variante Omni se distribuye en tres ficheros GGUF que suman 17,93 GB (16,69 GiB). Está pensado para ejecutarse con Ollama y con un *runtime* parcheado de llama.cpp, con soporte específico para hardware embebido como la Jetson AGX Orin de 32 GB. Es una *preview release* orientada exclusivamente al inglés hablado.

Su relevancia radica en que añade una capa de audio completa (entrada y salida de voz en streaming) sobre un modelo pequeño, con licencia Apache 2.0 y despliegue en hardware de consumo o embebido, algo poco habitual en modelos omni de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión) con puente de audio de dos capas (Qwen3A) y síntesis Qwen3-TTS; pesos en GGUF |
| Parametros totales | 2.691.041.665 (modelo base Inkling 2 Mini) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (probado en benchmark con KV cache q8_0) |
| Tipos de cuantizacion | IQ4_XS (lenguaje); proyector de visión en BF16; sidecar de audio en GGUF (cuantización del sidecar no especificada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tres ficheros: `Inkling-2-Mini-IQ4_XS.gguf`, `mmproj-Inkling-2-Mini-BF16.gguf`, `inkling-omni-sidecar.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Inkling 2 Mini, un transformer multimodal con capacidades de lenguaje y visión. Sobre él se añade un puente de audio de dos capas entrenado (basado en Qwen3A) que conecta las representaciones acústicas con el espacio del modelo de lenguaje, más un modelo de síntesis de voz Qwen3-TTS con su códec para salida de voz en streaming. El *sidecar* `inkling-omni-sidecar.gguf` contiene tanto la proyección de audio como el modelo TTS y el códec. El adaptador de runtime combina el proyector de imagen original con el proyector de audio entrenado.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card menciona atribución de entrenamiento y licencias en `LICENSES.md`. La innovación principal es la integración de entrada de audio, turnos mixtos de audio e imagen, y salida de voz en streaming sobre un modelo pequeño desplegable en Jetson, mediante un *runtime* parcheado de llama.cpp y el sistema Omni Adapters.

## Capacidades

- Generación de texto y razonamiento (heredadas del modelo base Inkling 2 Mini).
- Comprensión de imágenes (visión) mediante el proyector BF16 estándar.
- Comprensión de voz (entrada de audio) mediante el puente de audio entrenado.
- Salida de voz en streaming mediante Qwen3-TTS.
- Turnos mixtos de audio e imagen en una misma conversación.
- Canal de "thinking" (razonamiento explícito) según las pruebas realizadas con Ollama.
- Tool calling / function calling estructurado (soportado por Ollama estándar).
- Capacidades multilingües: limitadas al inglés (idioma declarado: `en`).

## Casos de uso

- Transcripción y dictado en inglés: el modelo puede transcribir audio con un WER medido del 8,9% en 147 clips de voz y 0,0% de transcripciones falsas en 408 clips sin voz, adecuado para aplicaciones de dictado y subtitulado en inglés.
- Asistentes de voz en streaming: la integración de Qwen3-TTS permite respuestas habladas en tiempo real, útil para interfaces conversacionales manos libres.
- Despliegue en hardware embebido: validado en Jetson AGX Orin de 32 GB (transcripción autenticada, turno mixto audio+imagen y seguimiento a 8.192 tokens), apropiado para robótica o dispositivos de borde.
- Análisis multimodal de reuniones o llamadas: combinación de audio y capturas de imagen en un mismo turno para resumir contenido con contexto de 8.192 tokens.
- Automatización con tool calling: al soportar llamadas a funciones estructuradas, puede integrarse en pipelines que consulten APIs o bases de datos a partir de instrucciones de voz.
- Accesibilidad: conversión de voz a texto y de texto a voz en un único modelo local, útil para aplicaciones de asistencia a personas con discapacidad visual o motora en entornos sin conexión.

## Benchmarks y rendimiento

| Prueba | Ornith 1.5 9B Omni | Inkling 2 Mini Omni |
|---|---:|---:|
| WER en 147 clips de voz (conjunto de 555 clips) | 8,3% | 8,9% |
| Transcripciones falsas en 408 clips sin voz | 8,8% | 0,0% |
| Afirmaciones visuales en 555 clips solo de audio | 2 | 0 |
| Recall de vocabulario único en 938 lotes | 76,3% | 80,5% |
| Recall de palabras raras (749 palabras) | 74,2% | 79,4% |

| Prueba de desarrollo emparejada | Ornith 1.5 9B Omni | Inkling 2 Mini Omni |
|---|---:|---:|
| WER en 60 clips limpios y con ruido | 16,8% | 8,8% |
| WER en 60 clips reverberantes nivelados | 29,2% | 21,2% |
| Recall en 120 listas cortas limpias | 81,2% | 83,7% |
| Recall en 120 listas cortas con ruido | 77,8% | 81,6% |

Pruebas de voz ampliadas: 15,3% de WER en 630 clips limpios y con ruido de fondo; 18,6% en 180 clips reverberantes.

## Requisitos de hardware

- VRAM estimada: los tres ficheros GGUF suman 17,93 GB (16,69 GiB); se requiere memoria suficiente para los pesos más la KV cache a 8.192 tokens (q8_0). En Jetson AGX Orin de 32 GB la memoria unificada disponible bajó a ~1,0 GiB durante la prueba de voz en GPU, con uso de swap.
- GPU recomendadas: NVIDIA A100 (completó el benchmark de 8.192 tokens con KV cache q8_0); Jetson AGX Orin de 32 GB (validada para transcripción, turno mixto y streaming).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el tamaño total de pesos (~18 GB) excede la VRAM de la mayoría de tarjetas consumer de 16 GB o menos.
- Despliegue: Ollama (`ollama pull robit/inkling-2-mini-omni:iq4-xs`) para texto, imágenes, thinking y tool calls; audio, turnos mixtos y salida de voz requieren Omni Adapters con un runtime parcheado de llama.cpp (revisión `f5e6915c28f10330885fcb9243a93ae98d3115ab`).
- Latencia: en la prueba de voz por CPU en Jetson, el turno de streaming probado tardó 81 segundos y usó swap; se recomienda margen de memoria adicional para sesiones de voz sostenidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (clips limpios/ruido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini Omni | 2,69 B (base) | 8.192 tokens | 8,8% (60 clips emparejados) | Apache 2.0 | GGUF en Hugging Face, Ollama |
| Ornith 1.5 9B Omni | 9 B (aprox., según nombre) | no disponible | 16,8% (60 clips emparejados) | no disponible | no disponible en la información |
| Modelos omni de referencia (p. ej. Qwen Omni) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría más allá de Ornith 1.5 9B Omni, usado como referencia en la evaluación del autor.

## Limitaciones y advertencias

- Es una *preview release* exclusivamente para inglés hablado; no se declara soporte de otros idiomas.
- El modelo base tiene ~2,7 B de parámetros: su capacidad de razonamiento y conocimiento es limitada frente a modelos mayores.
- Riesgo de alucinación inherente a modelos generativos; aunque las transcripciones falsas en clips sin voz fueron del 0,0%, persisten errores de reconocimiento (WER del 8,9% en el conjunto principal).
- Un lote de los 938 evaluados produjo salida vacía en la prueba de vocabulario único.
- El despliegue completo requiere aplicar un parche a un *runtime* concreto de llama.cpp y fijar revisiones específicas; no funciona con Ollama estándar para audio.
- Consumo de memoria ajustado en Jetson AGX Orin (swap activado en las pruebas); se recomienda margen adicional para sesiones sostenidas.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse `LICENSES.md` para la atribución de componentes de terceros (Qwen3-TTS, Qwen3A, pesos de bartowski y ggml-org).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una publicación de benchmark/preview sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/cudabenchmarktest/Inkling-2-Mini-Omni-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Omni Adapters (repositorio): https://github.com/robit-man/qwen-omni-adapters
- Parche de runtime: https://huggingface.co/cudabenchmarktest/Inkling-2-Mini-Omni-GGUF/resolve/main/runtime/omni-adapters-inkling.patch
- Qualification agregada: `qualification.json` (en el repositorio)
- Atribución de entrenamiento y licencias: `LICENSES.md` (en el repositorio)
