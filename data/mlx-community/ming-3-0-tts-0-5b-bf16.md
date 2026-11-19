# mlx-community/Ming-3.0-tts-0.5B-bf16

## Resumen

Ming-3.0-tts-0.5B es un modelo de síntesis de voz (text-to-speech) desarrollado por inclusionAI, construido sobre una base densa Qwen2.5-0.5B. Esta ficha describe la conversión a formato MLX en bfloat16 realizada por la comunidad mlx-community, pensada para ejecutarse de forma nativa en hardware Apple Silicon mediante la librería mlx-audio. El modelo original está diseñado para generación de voz multilingüe con clonación zero-shot, voces integradas y control fino de prosodia.

La relevancia de esta variante MLX radica en que permite ejecutar un sistema TTS completo en un Mac sin depender de CUDA ni de servicios en la nube. Según la model card, el modelo ocupa 3,0 GB en disco, consume un pico de 4,4 GB de memoria y alcanza un factor de tiempo real de aproximadamente 1,0 en un chip M4 Pro, lo que lo sitúa en el rango de la síntesis en tiempo real sobre hardware de consumo.

El modelo soporta siete idiomas declarados (chino, inglés, alemán, español, francés, coreano y japonés), además de sichuanés y cantonés según la model card original, y produce audio a 44,1 kHz. Incluye control de emoción, velocidad, tono y volumen, 14 etiquetas paralingüísticas en línea y modos de instrucción libre y diseño de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2.5-0.5B (modelo de voz) |
| Parametros totales | 1.479.454.868 (1,48 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (esta variante); otras cuantizaciones no disponibles |
| Idiomas soportados | zh, en, de, es, fr, ko, ja; además sichuanés y cantonés según la model card original |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |
| Frecuencia de muestreo de salida | 44,1 kHz |
| Tamano en disco | 3,0 GB |
| Memoria pico | 4,4 GB |
| Libreria | mlx-audio (>= 0.6.1) |
| Modelo base | inclusionAI/Ming-3.0-tts-0.5B |

## Arquitectura y entrenamiento

El modelo es un sistema TTS denso construido sobre Qwen2.5-0.5B, según indica la model card. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica el vocoder ni el mecanismo exacto de generación de audio más allá de la arquitectura base declarada.

La model card menciona varias capacidades de control que implican un diseño condicionado por instrucciones: clonación zero-shot a partir de audio de referencia y su transcripción exacta, voces integradas identificadas por nombre (por ejemplo `UK_Charlotte`), instrucciones libres de diseño de voz y control de emoción, velocidad, tono y volumen. También incorpora 14 etiquetas paralingüísticas en línea que se insertan en el texto de entrada (por ejemplo `[Sigh]`, `[Cough]`). La variante MLX conserva los pesos en bfloat16 sin modificar respecto al checkpoint original y requiere mlx-audio 0.6.1 o superior, que incluye la corrección del contrato de prompt de mlx-audio #1047; versiones anteriores cargan el modelo pero generan palabras incorrectas.

## Capacidades

- Síntesis de voz multilingüe en chino, inglés, alemán, español, francés, coreano y japonés, con soporte adicional de sichuanés y cantonés según la model card original.
- Clonación de voz zero-shot a partir de un clip de referencia y su transcripción exacta.
- Voces integradas seleccionables por identificador.
- Instrucciones libres de diseño de voz (tono, estilo, ritmo, carácter).
- Control explícito de emoción, velocidad, tono y volumen.
- 14 etiquetas paralingüísticas en línea para insertar suspiros, toses y otros sonidos no verbales.
- Salida de audio a 44,1 kHz.
- Ejecución nativa en Apple Silicon mediante MLX y la librería mlx-audio.
- Interfaz de línea de comandos (`mlx_audio.tts.generate`) y API de Python (`load_model`, `model.generate`).

## Casos de uso

- Audiolibros y narración: el modo de instrucción libre permite solicitar un estilo narrativo cálido y pausado, adecuado para lectura prolongada, con control de velocidad para ajustar la duración de cada capítulo.
- Doblaje y localización de contenido: al cubrir siete idiomas y permitir clonación de voz, se puede generar una pista de voz en español o alemán manteniendo el timbre del locutor original a partir de un clip de referencia.
- Asistentes de voz en aplicaciones macOS: la variante MLX se ejecuta en local con 4,4 GB de memoria pico, lo que permite integrar TTS en apps de escritorio sin enviar texto a servicios externos.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y herramientas de asistencia, con control de velocidad y tono para adaptarse a las preferencias del usuario.
- Prototipado de personajes y videojuegos: el uso de etiquetas paralingüísticas y control de emoción permite generar líneas de diálogo con matices expresivos sin grabar actores.
- Generación de voces para contenido educativo: creación de material audio en varios idiomas a partir de un mismo guion, usando voces integradas para mantener consistencia entre lecciones.
- Pruebas de integración continua de audio: la API de Python permite generar clips de forma programática y verificar la transcripción con whisper-large-v3-turbo, como describe la model card en su sección de comprobaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye únicamente una comprobación cualitativa: 24 de 24 clips transcritos correctamente con whisper-large-v3-turbo, cubriendo inglés, chino, etiquetas paralingüísticas, clonación en chino e inglés, instrucción libre, alemán y un párrafo de 30 segundos con tres fragmentos, con tres semillas cada uno. También se indica un factor de tiempo real de aproximadamente 1,0 y un pico de memoria de 4,4 GB en un M4 Pro.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 4,4 GB de pico según la model card, en la variante bfloat16.
- Hardware objetivo: Apple Silicon (MLX). La model card cita un M4 Pro con factor de tiempo real de aproximadamente 1,0.
- GPU NVIDIA: no disponible; esta conversión está pensada para MLX y no para CUDA.
- GPU de consumo: cabe en equipos Apple Silicon con al menos 8 GB de memoria unificada, aunque no se especifican modelos concretos más allá del M4 Pro.
- Despliegue: mlx-audio 0.6.1 o superior, con CLI `mlx_audio.tts.generate` y API de Python. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: factor de tiempo real de aproximadamente 1,0 en M4 Pro; no se proporcionan cifras de throughput para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Formato |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B (esta variante MLX) | 1,48 mil millones | zh, en, de, es, fr, ko, ja (+ sichuanés, cantonés) | Si, zero-shot | MIT | safetensors bf16 (MLX) |
| inclusionAI/Ming-3.0-tts-0.5B (original) | 1,48 mil millones | mismos | Si, zero-shot | MIT | safetensors |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El embedding de hablante CAM++ que la referencia usa para clonación y para las tareas de emoción, atributos y dialecto no está extraído; la clonación funciona únicamente a partir del audio de referencia y su transcripción.
- La normalización de texto de la referencia no está portada, por lo que los números deben escribirse con palabras.
- La cabeza de parada ocasionalmente no se activa, dejando ruido de baja intensidad al final del audio; la model card recomienda repetir con otra semilla.
- Requiere mlx-audio 0.6.1 o superior; versiones anteriores generan palabras incorrectas aunque carguen el modelo.
- Riesgo de alucinación en la pronunciación y en la fidelidad al texto de entrada no cuantificado en la información disponible.
- Sesgos de voz y de idioma no documentados en la información proporcionada.
- Licencia MIT, que permite uso comercial, pero se recomienda revisar las condiciones del modelo base inclusionAI/Ming-3.0-tts-0.5B.
- No se documentan restricciones de uso ético ni salvaguardas contra suplantación de identidad en la información disponible.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/mlx-community/Ming-3.0-tts-0.5B-bf16
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Repositorio Ming-3.0-tts: https://github.com/inclusionAI/Ming-3.0-tts
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
- README de modelos densos de mlx-audio: https://github.com/Blaizzy/mlx-audio/blob/main/mlx_audio/tts/models/dense/README.md
- Pull request mlx-audio #1047: https://github.com/Blaizzy/mlx-audio/pull/1047
