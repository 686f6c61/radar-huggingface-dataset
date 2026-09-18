# miguelamendez/mica-audio8-tts-06b

## Resumen

Audio8 TTS Preview 0.6B es un modelo de síntesis de voz (text-to-speech) de 601.159.424 parámetros, desarrollado por Audio8 y redistribuido por el usuario miguelamendez en el repositorio `mica-audio8-tts-06b`. No se trata de un modelo nuevo entrenado desde cero, sino de un conjunto de artefactos de ejecución (runtime) derivados del checkpoint `Audio8/Audio8-TTS-Preview-0.6b`, fijado a la revisión `f07040f3d151f1ba0253bfb92cb2f5dd38b44594`, con conversiones a MLX y GGUF en cuantizaciones Q4 y Q8. El modelo base y sus derivados se distribuyen bajo licencia Apache-2.0.

Técnicamente es un modelo DualAR: una torre autorregresiva lenta de 24 capas predice tramas semánticas de audio y una torre rápida de 4 capas predice diez códecs (codebooks) acústicos. Incorpora además un códec de audio a 44,1 kHz que no se contabiliza en el recuento de parámetros. Soporta generación sin referencia (voz sintética genérica) y clonación de voz zero-shot a partir de un audio de referencia cuya transcripción debe coincidir con el audio.

Su relevancia práctica es doble: por un lado, demuestra que un TTS de ~0,6 B de parámetros puede ejecutarse en hardware de consumo, incluido un Apple M4 vía Metal/MLX, manteniendo clonación de voz; por otro, documenta de forma inusualmente explícita el proceso de cuantización, las capas que se mantienen a precisión original y el estado de validación de cada artefacto. La arquitectura admite hasta 2.048 posiciones empaquetadas de texto y audio, con una salida por defecto de 512 tokens nuevos en la configuración del checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo dual (DualAR): torre lenta de 24 capas (tramas semánticas) + torre rápida de 4 capas (10 codebooks acústicos), con códec de audio integrado a 44,1 kHz |
| Parámetros totales | 601.159.424 (~0,6 B), excluyendo el códec integrado |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 posiciones empaquetadas de texto/audio (máximo de arquitectura); la configuración del checkpoint genera 512 tokens nuevos por defecto, y el ejemplo upstream solicita 1.024 |
| Tipos de cuantización | MLX affine selectiva Q4 y Q8 (group size 64); GGUF Q4_0 y Q8_0; candidatos estructurales GPTQ W4A16 y W8A16 group-128 (no promovidos a producción) |
| Idiomas soportados | cantonés (yue), chino (zh), neerlandés (nl), inglés (en), francés (fr), alemán (de), italiano (it), japonés (ja), coreano (ko), polaco (pl), español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX Q4/Q8) y GGUF (Q4_0, Q8_0); no se publican artefactos para vLLM |
| Pipeline | text-to-speech |
| Biblioteca | transformers |
| Autor del repositorio | miguelamendez (artefactos de ejecución); modelo base: Audio8 |
| Tamaño del repositorio | 6,6 GB |
| Modo de razonamiento | no soportado (`reasoning.supported: false`); los ajustes de "thinking" son inválidos para este modelo |
| Tamaño de salida por defecto | 512 tokens nuevos (checkpoint por defecto) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura DualAR específica para audio. Una torre autorregresiva lenta, de 24 capas, opera sobre posiciones empaquetadas de texto y audio y predice tramas semánticas; una torre rápida, de 4 capas, predice los diez codebooks del códec acústico, lo que permite reconstruir la forma de onda a 44,1 kHz mediante el códec integrado. Este esquema en dos escalas temporales es habitual en TTS neuronales modernos: la torre lenta captura estructura lingüística y prosódica de grano grueso, mientras la rápida resuelve el detalle acústico. El modelo funciona tanto sin referencia como con clonación zero-shot.

La model card del repositorio derivado no desglosa los datos de entrenamiento: se indica explícitamente que los conjuntos de datos, la secuencia máxima de entrenamiento y la distribución de longitudes de entrada/salida no se han divulgado. Tampoco se documenta el uso de RLHF, DPO u otras fases de alineación, ni el número de tokens vistos durante el preentrenamiento. La innovación destacable del repositorio no está en el entrenamiento, sino en el proceso de cuantización: las conversiones MLX mantienen a precisión original las incrustaciones semánticas y de texto, las incrustaciones de los codebooks acústicos, las fronteras de entrada/salida del decodificador rápido y el códec, porque estos tensores cruzan fronteras discretas entre texto, semántica, codebook y forma de onda. Para GGUF se eligió Q4_0 en lugar de Q4_K porque la alineación de bloques de Q4_K dejaba demasiadas matrices del códec sin cuantizar, aumentaba el tamaño residente y no aportaba ventaja de velocidad.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en once idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonación de voz zero-shot: genera la voz de un hablante a partir de un audio de referencia, siempre que la transcripción de referencia coincida con dicho audio.
- Generación sin referencia: síntesis con voz genérica cuando no se aporta audio de muestra.
- Salida de audio a 44,1 kHz con decodificación en diez codebooks acústicos predichos por la torre rápida.
- Generación por lotes (batch): los candidatos GPTQ W4A16/W8A16 recargan y generan WAV con lote de tamaño 2 según lo reportado, y los perfiles de validación contemplan "concurrent utterances".
- Ejecución local en Apple Silicon mediante MLX y en Metal a través de los artefactos GGUF.
- No soporta razonamiento explícito ni modo "thinking"; tampoco se reportan capacidades de tool calling, function calling, agentes, visión, audio de entrada como comprensión semántica ni matemáticas.

## Casos de uso

- Audiolibros y narración larga: el modelo admite hasta 2.048 posiciones empaquetadas y una salida por defecto de 512 tokens de audio, de modo que un capítulo se genera en fragmentos encadenados manteniendo la misma voz de referencia mediante clonación zero-shot, sin necesidad de reentrenar por hablante.
- Doblaje y localización multilingüe: con soporte para once idiomas, incluidos japonés, coreano, chino y cantonés, se puede clonar la voz del actor original y reutilizarla en las distintas pistas de idioma, siempre que se disponga de una transcripción exacta del audio de referencia.
- Atención al cliente y sistemas IVR: la inferencia local con GGUF Q8 permite desplegar una voz corporativa consistente en entornos con requisitos de privacidad, procesando cada intervención como una generación independiente con el mismo audio de referencia.
- Accesibilidad: lectura en voz alta de documentos, interfaces y notificaciones para personas con discapacidad visual, ejecutable en un portátil con Apple M4 o en una GPU de consumo, sin depender de servicios en la nube.
- Videojuegos y experiencias interactivas: generación de voces de personajes no jugadores en tiempo de ejecución, con variantes de voz obtenidas por clonación a partir de unas pocas muestras de cada personaje.
- Sistemas de alerta y monitorización: síntesis de avisos hablados en pipelines de observabilidad o CI/CD, donde el coste por inferencia es bajo (modelo de ~0,6 B) y el texto del aviso se conoce de antemano.
- Resúmenes de noticias y pódcast automatizados: conversión de boletines o artículos a audio con una voz estable, aprovechando que el modelo no requiere referencia para la voz por defecto y que el español está entre los idiomas recomendados upstream.
- Preservación y accesibilidad de contenido histórico: clonación de voces documentadas para archivos sonoros, teniendo en cuenta las advertencias legales y de consentimiento indicadas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas de calidad (MOS, WER, similitud de hablante) ni comparaciones numéricas con otros sistemas TTS. El único dato de validación reportado es cualitativo y procedimental: los artefactos GGUF Q4_0 y Q8_0 superaron pruebas con semilla fija de habla simple, clonación de voz zero-shot y round-trip exacto con Granite ASR sobre un Apple M4, y en validación de escucha se prefirió Q8 frente a Q4. La investigación de memoria pico en MLX y la batería estandarizada por lotes permanecen abiertas, por lo que no se certifica ningún límite duro de memoria ni de lote para MLX.

## Requisitos de hardware

- VRAM estimada para los pesos en FP16/BF16: en torno a 1,2-1,3 GB para los 601 M de parámetros, más el códec integrado y los buffers de decodificación (estimación derivada del recuento de parámetros; la model card no publica cifras de memoria).
- VRAM estimada con cuantización Q8: aproximadamente 0,65-0,75 GB de pesos; con Q4: aproximadamente 0,35-0,45 GB de pesos. Hay que sumar la caché del AR lento, la caché fija del AR rápido, el espacio de trabajo del códec y el codificador de referencia, que la model card señala explícitamente como componentes a contabilizar en lugar de aplicar las banderas KV de un LLM de texto.
- El repositorio completo ocupa 6,6 GB porque incluye varias variantes de cuantización, no porque el modelo en ejecución requiera ese espacio.
- Cabe en GPU de consumo: cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) puede alojarlo con holgura en Q8 o Q4. Validación efectiva reportada en Apple M4 con Metal, es decir, también viable en equipos unificados de Apple.
- Opciones de despliegue: `transformers` con safetensors, MLX (rutas `mlx/q4` y `mlx/q8`) en macOS, y GGUF Q4_0/Q8_0 para runtimes compatibles. No se publican artefactos para vLLM: los candidatos estructurales fallaron la puerta de producción, y GPTQ W4A16/W8A16 quedan como candidatos que requieren calibración completa y una ejecución de calidad con vLLM-Omni nativo antes de promoverse.
- Latencia y throughput: no disponibles. No se publican medidas de RTF (real-time factor), tokens por segundo ni latencia por petición. La model card menciona únicamente que Q4_K no ofrecía ventaja de velocidad frente a Q4_0 en GGUF.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos TTS comparables en la información proporcionada, por lo que no es posible establecer una comparación con alternativas de terceros en parámetros, contexto, rendimiento, licencia y disponibilidad. La comparación factible es interna, entre los artefactos derivados del mismo checkpoint:

| Variante | Formato | Estado declarado | Notas |
|---|---|---|---|
| MLX Q4 | safetensors (MLX affine, group size 64) | Conversión selectiva; capas críticas a precisión original | Sin certificación de lote ni de memoria pico en MLX |
| MLX Q8 | safetensors (MLX affine, group size 64) | Conversión selectiva; capas críticas a precisión original | Sin certificación de lote ni de memoria pico en MLX |
| GGUF Q4_0 | GGUF | Validado (habla simple, clonación zero-shot, round-trip ASR en M4) | Compromiso aceptado entre memoria y calidad |
| GGUF Q8_0 | GGUF | Validado (habla simple, clonación zero-shot, round-trip ASR en M4) | Preferido en validación de escucha |
| GPTQ W4A16 / W8A16 group-128 | candidatos estructurales | No promovidos | Requieren calibración completa y ejecución con vLLM-Omni nativo |
| vLLM | no publicado | Falló la puerta de producción | Sin artefactos disponibles |

## Limitaciones y advertencias

- No soporta razonamiento ni modo "thinking": la model card declara `reasoning.supported: false` y advierte que los ajustes de thinking son inválidos para este modelo.
- Riesgo de alucinación acústica y prosódica: no se publican métricas de inteligibilidad (WER) ni de calidad (MOS), y no hay evaluación de errores de pronunciación por idioma. En un sistema TTS, la alucinación se manifiesta como artefactos, ruido, saltos de audio o pronunciación incorrecta, no como texto falso.
- Dependencia estricta del audio de referencia: en clonación de voz, la transcripción de referencia debe coincidir con el audio de referencia; una transcripción desalineada degrada o invalida el resultado.
- Idiomas: aunque se declaran once idiomas recomendados upstream, no se divulga la composición del dataset de entrenamiento ni la distribución por idioma, por lo que la calidad relativa entre lenguas es desconocida. El cantonés y el chino se listan por separado.
- Sesgos: no disponible. No hay análisis de sesgos de hablante, género, acento o variedad dialectal en la documentación proporcionada.
- Riesgos de uso indebido de la clonación de voz: la capacidad de clonar voces con pocas muestras exige controles de consentimiento, verificación de identidad y marcado de audio sintético, especialmente en la Unión Europea por las obligaciones de transparencia sobre contenido generado.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base es una versión "preview" de Audio8 y el repositorio es una redistribución de artefactos de cuantización; conviene verificar la vigencia de la licencia y del checkpoint fijado antes de desplegar en producción.
- Artefactos no promovidos: ni vLLM ni las variantes GPTQ están listas para producción. Los GPTQ W4A16/W8A16 caen a redondeo al más cercano en muchas capas por falta de calibración completa, lo que puede degradar la calidad.
- Límites de longitud mal documentados: el máximo de arquitectura es de 2.048 posiciones empaquetadas, pero ni el máximo de entrenamiento ni el máximo de salida están documentados como límite duro; el checkpoint por defecto genera 512 tokens nuevos y el ejemplo upstream solicita 1.024.
- Sin certificación de memoria ni de lote en MLX: los perfiles de despliegue deben declarar posiciones empaquetadas máximas, tokens semánticos solicitados, duración del audio de referencia, número de utterances concurrentes y si la clonación está activada.
- Compatibilidad de endpoints: los tags indican `endpoints_compatible`, pero no hay documentación adicional en la información disponible sobre qué endpoints concretos ni con qué garantías.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/miguelamendez/mica-audio8-tts-06b
- Modelo base: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Revisión fijada del modelo base: `f07040f3d151f1ba0253bfb92cb2f5dd38b44594`
- Registro de validación GGUF en macOS/Metal: `docs/validation/gguf-runtime-macos-metal.md` (ruta interna citada en la model card, no se proporciona URL pública)
- Registro de validación de cuantización vLLM: `docs/validation/audio8-vllm-quantization-macos.md` (ruta interna citada en la model card, no se proporciona URL pública)
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a contenido no relacionado, por lo que no se dispone de paper, blog técnico, repositorio de código ni demo adicionales.
