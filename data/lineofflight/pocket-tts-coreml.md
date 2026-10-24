# lineofflight/pocket-tts-coreml

## Resumen

Pocket TTS for Core ML es la conversión a Core ML de Pocket TTS, el modelo de síntesis de voz de Kyutai, empaquetada por el usuario lineofflight para su ejecución en Macs con Apple Silicon. El repositorio no contiene un modelo nuevo, sino tres paquetes de inferencia listos para producción derivados de los checkpoints de Kyutai: neerlandés (6 capas), francés (6 capas) e inglés en la variante `english_2026-10`. Cada paquete incluye los cuatro submodelos Core ML necesarios (prefill de condicionamiento, paso del transformer FlowLM, decoder de flujo con los 8 pasos de Euler fusionados y decoder Mimi), el tokenizador SentencePiece y las instantáneas de caché KV de las voces.

El interés práctico está en la ejecución totalmente local: el transformer y el decoder de flujo computan en float16 sobre la Neural Engine (`_ane`), mientras que Mimi lo hace en float32, y cada llamada al decoder Mimi produce 1920 muestras a 24 kHz, es decir, 80 ms de audio. Esto permite integrar voz en herramientas locales de macOS sin backend, sin red y sin enviar texto a terceros. Los paquetes siguen el layout, nombres y formas de `v2.1` de FluidInference (`pocket-tts-coreml`), lo que los hace intercambiables con los paquetes ingleses ya publicados por ese proyecto.

La relevancia es doble: por un lado cubre huecos que el repositorio de FluidInference no ofrecía (neerlandés, francés de 6 capas y el inglés `2026-10`, reentrenado con una corrección de cargador para leer números al final de frase); por otro, documenta con detalle el proceso de conversión (receta `mobius`, versiones de torch y coremltools, hashes sha256 de los pesos originales), lo que facilita reproducirlo con otros idiomas o checkpoints de Kyutai. El repositorio es de reciente creación, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo de flow matching (FlowLM, 6 capas, d_model 1024, 16 cabezas de 64) + decoder de flujo con 8 pasos de Euler fusionados + decoder Mimi (codec neuronal); exportado a Core ML |
| Parámetros totales | No disponible (el repositorio no publica recuento; los paquetes ocupan 484-487 MB con pesos, tablas y voces incluidas) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Caché KV de 512 posiciones por capa y 6 capas; condicionamiento de entrada `[1, 256, 1024]` |
| Tipos de cuantización | No se distribuyen variantes cuantizadas (INT8/INT4); cómputo float16 en `cond_prefill_ane`, `flowlm_step_ane` y `flow_decoder_fused`, y float32 en Mimi y en las tablas de embeddings; entradas y salidas siempre float32 |
| Idiomas soportados | Neerlandés, francés, inglés (variante `english_2026-10`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado con `xcrun coremlc`), `.safetensors` (instantáneas de caché KV de cada voz), `.bin` (tablas float32: `text_embed_table.bin`, `bos_emb.bin`, `bos_before_voice.bin`, estado inicial de Mimi) y `tokenizer.model` (SentencePiece) |
| Vocabulario de texto | 4001 tokens (tabla de embeddings `[4001, 1024]`) |
| Frecuencia de muestreo de audio | 24 kHz, 1920 muestras por frame (80 ms) |
| Voces incluidas | 20 en el paquete `dutch`, 20 en `french`, 19 en `english_2026-10` (incluye la voz `daan` en los dos primeros) |
| Tamaño por paquete | 487 MB (dutch), 487 MB (french), 484 MB (english_2026-10); repositorio completo 1,5 GB |
| Modelo base | `kyutai/pocket-tts` (relación declarada: quantized); pesos procedentes de `kyutai/pocket-tts-without-voice-cloning`, revisión `a7056f505a4a8ca72d8b5fb1440071d6f1a35739` |
| Librería / runtime | `coreml` (Core ML, Apple Silicon) |

## Arquitectura y entrenamiento

El pipeline es el de Pocket TTS de Kyutai y consta de cuatro etapas encadenadas. `cond_prefill_ane` procesa el condicionamiento `[1, 256, 1024]` y la longitud válida, y devuelve las claves y valores iniciales de las 6 capas junto con las posiciones. `flowlm_step_ane` es el transformer autoregresivo: recibe el latente de un solo paso (`[1, 1, 32]`, el latente BOS en el primer paso) más las cachés y posiciones, y emite `transformer_out` `[1, 1, 1024]`, un logit `is_eos` `[1, 1, 1]` (se detiene por encima de -4) y las cachés actualizadas. `flow_decoder_fused` aplica los 8 pasos de Euler del decoder de flujo en una sola llamada, de `latent_init` `[1, 32]` a `latent_final` `[1, 32]`. Por último, `mimi_decoder` convierte un latente de 32 dimensiones en 1920 muestras de audio, manteniendo 24 tensores de estado entre llamadas.

La conversión se realizó con la receta `mobius` de FluidInference (`models/tts/pocket_tts/coreml`, Apache-2.0), en la rama `feat/pocket-tts-flowlm-ane` en el commit `210d6b6d21177115babfece0de5e1795cffec2a2`, que añade los conversores `_ane` y fusionados. El entorno de conversión fue torch 2.9.1, coremltools 9.0 y `pocket-tts` 4.0.1, compilado con `xcrun coremlc` de Xcode 27.1. El autor documenta cinco modificaciones a la receta: admisión de los idiomas `dutch`, `french` y `english_2026-10` en `_language_arg.py`; tres cambios en `traceable_mimi_decoder.py` para `pocket-tts` 4 (exclusión del nuevo estado `pad`, omisión de `decode_from_latent` en el latente cuantizado y paso de `attn_mask`); supresión del renombrado de salidas de Mimi en `convert_mimi_decoder.py` para conservar los nombres `var_` de los paquetes de FluidInference; y compilación de los tres modelos `_ane`/fusionados en `mlmodelc_all.sh`. Fuera de la receta quedan solo dos artefactos: `bos_before_voice.bin` (el tensor `flow_lm.bos_before_voice` en float32) y el estado inicial de Mimi, derivado de `TraceableMimiDecoder` con el relleno NaN de la caché a 0.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; el único dato sobre el entrenamiento es que `english_2026-10` es la receta `english_2026-09_2` de Kyutai reentrenada con una corrección de cargador para palabras finales desalineadas, de modo que lee correctamente números al final de frase. Los tokenizadores y las voces son archivos de Kyutai copiados sin cambios desde la misma revisión.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés, francés e inglés, con 20, 20 y 19 voces respectivamente, todas predefinidas.
- Generación de audio a 24 kHz en frames de 80 ms (1920 muestras), apta para reproducción en streaming por fragmentos.
- Ejecución completamente local y offline sobre la Neural Engine de Apple Silicon; no requiere servicio externo ni conexión de red.
- Condicionamiento por voz mediante instantáneas de caché KV en `.safetensors`: cambiar de voz es cargar otro archivo, sin reentrenar ni recompilar.
- Parada controlada por el logit `is_eos` (umbral -4), lo que permite longitudes de frase variables sin temporizadores externos.
- Interfaz tensorial estable (formas y nombres idénticos a `v2.1/english` de FluidInference), lo que facilita sustituir paquetes en un pipeline existente.
- No soporta tool calling ni function calling: es un modelo acústico, no un LLM.
- No soporta razonamiento multi-paso, agentes, visión, audio de entrada ni clonación de voz (el checkpoint de origen es explícitamente `without-voice-cloning`).
- Capacidad multilingüe limitada a los tres idiomas empaquetados; no hay detección automática de idioma ni transliteración.

## Casos de uso

- Herramientas de codificación con salida hablada en Mac: un agente local de programación puede leer sus respuestas y avisos mediante el paquete inglés o neerlandés, sin enviar el código ni los mensajes a ninguna API, algo relevante cuando el contexto contiene credenciales o código propietario.
- Accesibilidad y lectura de pantalla: lectura en voz alta de texto seleccionado, notificaciones y documentación en macOS para usuarios con discapacidad visual, con la ventaja de funcionar sin red y con latencia independiente de la conectividad.
- Asistentes de voz para aplicaciones de escritorio: prototipado de interfaces conversacionales en macOS o en apps Catalyst, usando la API de Core ML directamente y aprovechando que los cuatro submodelos tienen formas de entrada fijas y verificadas.
- Localización de contenido editorial: generación de versiones en neerlandés y francés de boletines, resúmenes o artículos con una voz coherente por publicación, al poder elegir entre 20 voces por idioma.
- Avisos operativos en entornos sin conectividad: kioscos, plantas industriales o equipos de campo donde el audio debe generarse en el propio dispositivo y no se puede depender de un servicio en la nube.
- Pruebas de regresión de pipelines de audio: al estar los modelos compilados y con hashes documentados (`FILES.txt` con sha256 y tamaño de cada archivo), sirven como referencia reproducible para comparar salidas antes y después de cambios en el código de integración.
- Generación de pistas de voz para prototipos de videojuegos o demos: frases cortas en tres idiomas con 80 ms por frame, suficientes para diálogos de barras de carga, tutoriales o menús, sin coste por carácter.
- Investigación en conversión de modelos: la receta y las modificaciones documentadas permiten reproducir el proceso con otros checkpoints de Kyutai o añadir idiomas, usando este repositorio como caso de referencia verificado contra los paquetes de FluidInference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de MOS, WER, similitud de hablante, RTF ni comparaciones con otros sistemas TTS.

Sí existe una verificación numérica de la conversión, útil como control de fidelidad pero no como benchmark de calidad:

| Comprobación | Resultado |
|---|---|
| Reconstrucción de `v2.1/english` de FluidInference desde `english_2026-04` | Pesos idénticos en `cond_prefill_ane`, `flowlm_step_ane` y `mimi_decoder` |
| Salidas de los cuatro submodelos frente a los paquetes de referencia | Idénticas, salvo Mimi con una diferencia máxima de 2e-4 |
| Integridad de los pesos de origen | Verificada por sha256: `59b5c324...612aeb` (dutch), `56366cfe...bc699` (french), `4c56cbd1...c931d` (english_2026-10) |

## Requisitos de hardware

- Hardware: Mac con Apple Silicon (los modelos `_ane` están pensados para la Neural Engine); el autor indica explícitamente "Apple Silicon Macs". No se documenta soporte para GPU Intel, CUDA ni ROCm.
- Memoria: no se publica consumo de VRAM ni de memoria unificada. Como referencia de tamaño, cada paquete pesa 484-487 MB y el repositorio completo 1,5 GB, a lo que hay que sumar el estado inicial de Mimi compartido y las cachés de inferencia (6 capas × `[1, 512, 16, 64]` en float16 por caché K y V).
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo es el SoC Apple (M1 y posteriores). No hay datos de rendimiento por generación de chip.
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para portátiles y equipos de sobremesa Apple Silicon; no hay artefactos para RTX 4090, A100 ni H100.
- Opciones de despliegue: API de Core ML en macOS, modelos `.mlmodelc` ya compilados (no requiere `coremlc` en el equipo de inferencia), o la receta `mobius` para regenerarlos. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no cargan `.mlmodelc`.
- Herramientas del entorno de conversión (no de inferencia): torch 2.9.1, coremltools 9.0, `pocket-tts` 4.0.1 y Xcode 27.1.
- Latencia y throughput: no publicados. Como cota estructural, cada llamada a `mimi_decoder` produce 80 ms de audio y cada frame requiere una llamada a `flowlm_step_ane` más otra a `flow_decoder_fused` con 8 pasos de Euler internos; el factor de tiempo real dependerá del chip y no puede deducirse de la información disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura / formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lineofflight/pocket-tts-coreml` (este) | nl, fr, en | FlowLM 6 capas + Mimi, Core ML `.mlmodelc` | caché KV de 512 posiciones | CC-BY-4.0 | 3 paquetes, 20/20/19 voces, 0 descargas |
| `FluidInference/pocket-tts-coreml` | en | Mismo pipeline, Core ML, layout `v2.1` | ídem | no disponible en la información | Paquetes `v2.1` de referencia; sin neerlandés, sin francés de 6 capas y sin inglés `2026-10` |
| `kyutai/pocket-tts` (modelo base) | no disponible en la información | PyTorch original, pesos `.safetensors` | no disponible | no disponible en la información | Pesos originales; requiere el stack de Kyutai, no Core ML |
| `kyutai/pocket-tts-without-voice-cloning` (origen de pesos) | en, nl, fr entre otros (`languages/*`) | PyTorch, revisión `a7056f5` | no disponible | no disponible en la información | Fuente de los tres checkpoints convertidos aquí |

No se incluyen comparaciones con otras familias de TTS abiertas (por ejemplo Piper, Kokoro o XTTS) porque la información proporcionada no contiene sus especificaciones verificables y no se han inventado cifras.

## Limitaciones y advertencias

- Sin clonación de voz: el checkpoint de origen es `without-voice-cloning` y las voces son instantáneas de caché KV precalculadas; no se puede imitar una voz nueva sin material adicional del que este repositorio no dispone.
- Cobertura lingüística reducida: solo neerlandés, francés e inglés, y en paquetes separados. No hay detección de idioma; enviar texto en otro idioma producirá una pronunciación incorrecta sin aviso.
- Riesgo de alucinación acústica y de errores de pronunciación: como todo TTS neuronal, puede omitir, repetir o alterar fragmentos, especialmente con números, siglas, nombres propios y puntuación ambigua. La parada depende de un umbral heurístico sobre el logit `is_eos` (-4) que puede truncar frases largas.
- Ventana limitada: la caché KV es de 512 posiciones por capa y el condicionamiento de `[1, 256, 1024]`; no se documenta comportamiento para textos que excedan esos límites, por lo que conviene segmentar las entradas.
- Acoplamiento a plataforma: los artefactos son `.mlmodelc` para Apple Silicon. No hay pesos GGUF, safetensors completos ni ruta de inferencia en Linux, Windows o CUDA dentro de este repositorio, lo que limita su uso en servidores.
- Precisión mixta fija: no se ofrecen variantes cuantizadas a INT8/INT4 ni opción de ejecutar Mimi en float16, de modo que no se puede reducir el consumo a costa de calidad sin reconvertir.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria; hay que citar al autor de la conversión y a Kyutai como origen de los pesos. Conviene revisar también las condiciones del modelo base y del repositorio de pesos original, cuya licencia no figura en la información disponible.
- Madurez: repositorio creado y actualizado el mismo día, con 0 descargas y 0 likes; no hay informes de terceros sobre calidad, estabilidad ni regresiones. La validación documentada se limita a la fidelidad numérica de la conversión.
- Idiomas y voces heredados: la calidad por voz no está medida (no hay MOS ni WER publicados), por lo que la elección entre las 19-20 voces de cada paquete es a ciegas.
- La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo (los resultados obtenidos eran contenido no pertinente), así que no hay documentación externa, papers ni demos que corroboraren las afirmaciones de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lineofflight/pocket-tts-coreml
- Modelo base declarado: https://huggingface.co/kyutai/pocket-tts
- Pesos de origen (revisión `a7056f505a4a8ca72d8b5fb1440071d6f1a35739`): https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Paquetes Core ML de referencia (`v2.1`): https://huggingface.co/FluidInference/pocket-tts-coreml
- Receta de conversión `mobius` (Apache-2.0): https://github.com/FluidInference/mobius
- Paper, blog o demo oficiales: no disponible en la información proporcionada.
