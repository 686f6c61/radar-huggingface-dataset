# simaai/Gemma-4-E2B-it-GPTQ-Multimodal-a16w4

## Resumen

Gemma-4-E2B-it-GPTQ-Multimodal-a16w4 es un artefacto compilado del modelo google/gemma-4-E2B-it, publicado por simaai para su plataforma de hardware SiMa Modalix. No se trata de un modelo entrenado desde cero ni de un fine-tuning de pesos: es un paquete de despliegue que contiene los pesos ya cuantizados (GPTQ INT4 para el decodificador, INT8 para los codificadores de visión y audio) junto con 214 ejecutables MLA y los artefactos necesarios para ejecutarlo sobre la pila de runtime LLiMa. La modalidad declarada es any-to-any con entrada de texto, imagen y audio, y salida de texto.

El modelo base, Gemma 4 E2B instruction-tuned, es un transformer multimodal de Google con capacidades de visión y audio. Este build fija la longitud de contexto en 4096 tokens, la resolución de entrada visual en 480x480 y clips de audio de hasta 30 segundos a 16 kHz mono. La cuantización se aplica de forma asimétrica por componente: GPTQ simétrico INT4 con grupos de 256 para el decodificador, proyecciones PLE y LM head no atado; RTN INT8 simétrico por canal de salida para los proyectores de visión y audio; tablas de embedding y caché KV en INT8.

Su relevancia es acotada pero específica: permite ejecutar un modelo multimodal de Google en aceleradores SiMa Modalix con un footprint de 6,6 GB de repositorio y un contexto de 4K, algo que un checkpoint BF16 completo no permitiría en ese hardware. Es un artefacto de despliegue, no un modelo para usar en GPU convencional, y el propio autor advierte que el runtime Modalix no ha sido probado en generación ni latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión, audio) del modelo base Gemma 4 E2B; artefacto compilado para SiMa Modalix |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (build publicado); recompilable a 8192 |
| Tipos de cuantizacion | GPTQ INT4 simétrico G256 (decoder, PLE, LM head); RTN INT8 por canal (proyectores visión/audio); BF16 en convoluciones de audio pequeñas; INT8 en embeddings y KV cache |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base google/gemma-4-E2B-it) |
| Formato de pesos | Paquete compilado LLiMa: `elf_files/` con 214 ejecutables MLA, `devkit/`, `compilation.json`, `recipe.yaml`, `compile.sh`; no safetensors ni GGUF estándar |
| Resolucion de visión | 480 x 480 |
| Audio | Hasta 30 s por clip, 16 kHz mono, 12 capas de audio compiladas |
| SDK / toolchain | Model SDK 3.0.0, LLiMa con soporte de audio Gemma 4 (rama `feature/327-gemma4-audio`) |
| Tamano del repositorio | 6,6 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E2B instruction-tuned, un transformer multimodal de Google que acepta texto, imagen y audio y genera texto. No se dispone en la información proporcionada de detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF/DPO/SFT) del modelo base. El autor de este repositorio no ha entrenado ni modificado los pesos más allá del proceso de cuantización y compilación.

La innovación técnica de este artefacto está en el pipeline de compilación y cuantización, no en la arquitectura. El decodificador, las proyecciones PLE y el LM head no atado se cuantizan con GPTQ simétrico INT4 con tamaño de grupo 256; los proyectores lineales de los codificadores de visión y audio usan RTN INT8 simétrico por canal de salida, dejando las convoluciones de audio pequeñas en BF16. Las tablas de embedding y la caché KV se almacenan en INT8, y se activa automáticamente el *language filter sharing*. El paquete resultante incluye 214 ejecutables MLA generados con SiMa Model SDK 3.0.0 y requiere un runtime LLiMa que incluya la implementación de audio de Gemma 4, con cambios locales sobre la rama `feature/327-gemma4-audio` que no están en el commit base registrado.

## Capacidades

- Generación de texto a partir de entrada de texto, imagen y audio (pipeline any-to-any con salida textual).
- Comprensión de imágenes a 480x480, incluyendo tareas de OCR de alta resolución según la validación del autor (6/6 en el conjunto de OCR).
- Procesamiento de audio de hasta 30 segundos por clip, mono a 16 kHz, con 12 capas de audio compiladas.
- Razonamiento y respuesta instruccional heredados de la variante `-it` del modelo base.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: la evaluación del autor se realizó con *reasoning disabled*, lo que sugiere que el modelo base dispone de algún modo de razonamiento, pero no se detalla su funcionamiento en este build.

## Casos de uso

- Despliegue en aceleradores SiMa Modalix: el caso de uso principal y prácticamente exclusivo de este artefacto. Se usa cuando el hardware objetivo es Modalix y se necesita un modelo multimodal con contexto de 4K y pesos que quepan en el dispositivo gracias a la cuantización INT4/INT8.
- Procesamiento de documentos con OCR en el borde: con entrada de imagen a 480x480 y un conjunto de validación de OCR que pasa 6/6, encaja en digitalización de formularios, tickets o etiquetas en dispositivos con acelerador SiMa, sin depender de un servicio en la nube.
- Transcripción y comprensión de audio corto: clips de hasta 30 segundos a 16 kHz permiten integrar el modelo en pipelines de atención por voz, notas de voz o comandos hablados, con un CER medio de lenguaje del 8,96% en el conjunto de 400 clips del autor.
- Asistente conversacional embebido con contexto moderado: los 4096 tokens cubren conversaciones multi-turno breves y permiten mantener el historial reciente junto con una imagen o un clip de audio adjunto.
- Clasificación y extracción de información multimodal: dado que acepta texto, imagen y audio y devuelve texto, sirve para etiquetar contenido, resumir imágenes o extraer campos de documentos en un flujo por lotes sobre Modalix.
- Evaluación y prototipado de la pila LLiMa: el repositorio incluye `compile.sh`, `compilation.json` y `recipe.yaml`, por lo que es útil para reproducir el build, ajustar el contexto a 8192 o validar la integración de audio en el runtime.
- Base para recompilación con mayor contexto: equipos que necesiten 8192 tokens pueden recompilar el checkpoint prequantizado `simaai--Gemma-4-E2B-it-GPTQ-Multimodal-Safetensors` cambiando `--max_num_tokens` en el script, siempre que la memoria de la caché KV quepa en el dispositivo.

## Benchmarks y rendimiento

El autor publica una comparación de cuantización de pesos en GPU con entradas idénticas, decodificación greedy y razonamiento desactivado. Estos resultados no incluyen la cuantización de activaciones de SiMa ni la ejecución del modelo compilado.

| Evaluación | BF16 original | Cuantizado |
|---|---:|---:|
| Visión | 23/34 | 23/34 |
| OCR de alta resolución | 6/6 | 6/6 |
| Texto corto | 10/20 | 10/20 |
| Texto difícil, hasta 4K de contexto | 6/18 | 5/18 |
| CER medio de lenguaje, 400 clips de audio (menor es mejor) | 7,59% | 8,96% |

El conjunto de texto difícil repite cuatro tareas a distintas longitudes y es, en palabras del autor, una suite de diagnóstico pequeña. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni mediciones de latencia o throughput en Modalix: el autor indica explícitamente que el rendimiento en runtime del dispositivo no ha sido probado.

## Requisitos de hardware

- Hardware objetivo: aceleradores SiMa Modalix. El paquete no está pensado para GPU convencional ni para CPU.
- VRAM estimada para inferencia en GPU: no disponible; el artefacto no es un checkpoint estándar y no se distribuye en safetensors ni GGUF.
- GPU recomendadas: no aplica. El repositorio contiene ejecutables MLA para Modalix, no pesos cargables por vLLM, TGI o llama.cpp.
- Compatibilidad con GPU de consumo: no. El formato compilado y la dependencia de LLiMa impiden su uso en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: `llima run` sobre un runtime LLiMa con soporte de audio Gemma 4; el paquete se descarga con `hf download` y se desempaqueta con `llima-deploy`, generando `devkit/` y `elf_files/`.
- Memoria: el contexto de 4096 tokens incluye entrada y generación; ampliarlo a 8192 aumenta la caché KV y debe caber en el dispositivo.
- Latencia y throughput: no disponibles. El autor confirma que la generación y la latencia en runtime Modalix no se han medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| simaai/Gemma-4-E2B-it-GPTQ-Multimodal-a16w4 | no disponible | 4096 (recompilable a 8192) | Texto, imagen, audio → texto | Apache 2.0 | Paquete compilado LLiMa para SiMa Modalix |
| google/gemma-4-E2B-it | no disponible | no disponible | Texto, imagen, audio → texto | Apache 2.0 | Pesos originales del modelo base |
| simaai/Gemma-4-E2B-it-GPTQ-Multimodal-Safetensors | no disponible | no disponible | Texto, imagen, audio → texto | Apache 2.0 | Checkpoint prequantizado en safetensors, entrada para recompilación |

La comparación relevante es contra el checkpoint original de Google y contra el checkpoint prequantizado en safetensors del mismo autor. Frente al primero, este build reduce el peso mediante GPTQ INT4/RTN INT8 y lo adapta a Modalix, a costa de fijar el contexto en 4096 y perder portabilidad. Frente al segundo, añade la compilación completa (214 ejecutables MLA) pero deja de ser un formato cargable por herramientas estándar. No se dispone de datos de benchmarks comparables con otros modelos multimodales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es un modelo entrenado ni afinado: es un build compilado. Cualquier limitación del modelo base Gemma 4 E2B-it se hereda sin cambios.
- El autor no ha probado la generación ni la latencia en runtime Modalix; solo verificó que la compilación terminó con código 0, que el desempaquetado con `llima-deploy` funcionó y que los checksums de los ELF coinciden con el Hub.
- El runtime requerido incluye cambios locales sobre `feature/327-gemma4-audio` que no están en el commit base registrado; sin ese runtime exacto, el soporte de audio puede no funcionar.
- Contexto limitado a 4096 tokens en el build publicado. Ampliarlo a 8192 exige recompilar y disponer de memoria suficiente para la caché KV en el dispositivo.
- La cuantización degrada el rendimiento en texto difícil (6/18 a 5/18) y en audio (CER del 7,59% al 8,96%); en visión y OCR no se observó degradación en la suite del autor, que es pequeña y de diagnóstico.
- Los conjuntos de evaluación son reducidos (34 ítems de visión, 20 de texto corto, 18 de texto difícil, 400 clips de audio) y no constituyen una validación de producción.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de este build; deben evaluarse sobre el modelo base.
- Licencia Apache 2.0 heredada, con enlace a los términos de Gemma 4 de Google; conviene revisar las condiciones de uso comercial del modelo base antes de desplegar.
- El checkpoint prequantizado de entrada (`simaai--Gemma-4-E2B-it-GPTQ-Multimodal-Safetensors`) no está enlazado a un repositorio publicado del Hub, lo que complica la reproducibilidad del build.
- No hay soporte documentado de tool calling, agentes ni modo thinking en este artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/simaai/Gemma-4-E2B-it-GPTQ-Multimodal-a16w4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it/tree/70af34e20bd4b7a91f0de6b22675850c43922a03
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Colección Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
