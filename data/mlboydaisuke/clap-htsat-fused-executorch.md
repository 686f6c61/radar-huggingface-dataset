# mlboydaisuke/CLAP-HTSAT-fused-ExecuTorch

## Resumen

CLAP-HTSAT-fused-ExecuTorch es una conversión a formato ExecuTorch del modelo multimodal de audio `laion/clap-htsat-fused`, también conocido como CLAP (Contrastive Language-Audio Pretraining). CLAP es, en esencia, el equivalente de CLIP para audio: dispone de una torre de audio y una torre de texto que proyectan clips de sonido y frases descriptivas en un mismo espacio vectorial de 512 dimensiones, lo que permite hacer búsqueda semántica y clasificación zero-shot sobre audio con etiquetas definidas en tiempo de ejecución. El autor de la conversión es mlboydaisuke, que publica los artefactos `.pte` listos para inferencia en dispositivo.

La relevancia de esta ficha no está en el modelo base, sino en el empaquetado: el repositorio ofrece builds de ExecuTorch con delegados XNNPACK (fp32 e int8) y Core ML (solo para la torre de audio global y la torre de texto), con el objetivo explícito de ejecutar búsqueda de sonido por texto en dispositivos Apple y en entornos de borde sin depender de un runtime de PyTorch completo. El tamaño total del repositorio es de 1,3 GB, aunque los artefactos individuales van desde 29 MB (audio global int8) hasta 501 MB (texto fp32).

Las cifras publicadas por el autor en un Mac M4 Max sitúan la torre de audio Core ML en 8,6 ms por ventana de 10 segundos y la torre de texto Core ML en 4,8 ms por frase. La torre de texto es la parte pesada (RoBERTa base, 124,65 M de parámetros) frente a la de audio (HTSAT, 27,55 M), pero al ser estática por frase puede cachearse: un conjunto de veinte etiquetas son veinte vectores de 512 floats.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos torres: audio HTSAT (Hierarchical Token-Semantic Audio Transformer) y texto RoBERTa base, con proyección conjunta a 512 dimensiones (estilo CLIP para audio) |
| Parámetros totales | Aproximadamente 152,2 M (124,65 M de la torre de texto + 27,55 M de la torre de audio) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 10 s (48 kHz mono, 64 bins mel, `input_features` de forma `[1, 4, 1001, 64]`); texto con `max_length=32` tokens |
| Tipos de cuantización | fp32 (XNNPACK), int8 (XNNPACK), Core ML (sin especificar precisión interna) |
| Idiomas soportados | No disponible (el modelo base es multimodal audio-texto; no se documenta cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (exportado con `torch.export` y lowering a XNNPACK y Core ML) |

## Arquitectura y entrenamiento

El modelo base `laion/clap-htsat-fused` es un sistema de dos torres entrenado con un objetivo contrastivo, análogo a CLIP pero aplicado a pares audio-texto. La torre de audio emplea HTSAT, un transformer con tokenización semántica jerárquica sobre espectrogramas mel, y la torre de texto es un RoBERTa base. Ambas salidas se proyectan a un espacio común de 512 dimensiones y se normalizan L2, de modo que la similitud coseno entre un clip y una frase se reduce a un producto escalar. El checkpoint `-fused` incorpora una particularidad: su patch embedding tiene dos ramas seleccionadas por el flag `is_longer`, una global sobre la ventana completa de 10 segundos y otra de fusión que añade tres recortes locales para clips más largos.

La conversión a ExecuTorch no puede preservar esa elección dinámica, porque `torch.export` no admite el `if` de Python sobre el tamaño de un resultado de `torch.where` (error `GuardOnDataDependentSymNode`). Por eso el autor publica ficheros separados por rama: los ficheros `global` toman la rama que usa `laion_clap` para clips de 10 s o menos (repetición de padding hasta 480.000 muestras y `longer=False`), mientras que los ficheros `fusion` toman la rama que usa el port de Hugging Face para un clip único y la que ambos usan para clips más largos. La cobertura del delegado XNNPACK en los ficheros fp32 es del 63,8 % para audio global, 64,2 % para audio fusion y 77,3 % para texto; Core ML captura el grafo completo de audio global y el grafo completo de texto. El modelo card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación zero-shot de audio: permite definir las etiquetas como frases en tiempo de ejecución, sin lista cerrada de clases fija en entrenamiento.
- Búsqueda semántica de sonido mediante texto: recuperación de clips por consultas en lenguaje natural usando similitud coseno en el espacio de 512 dimensiones.
- Extracción de embeddings de audio (clips de 10 s o menos con la variante global; clips más largos con la variante fusion) y de texto (frases de hasta 32 tokens).
- Emparejamiento audio-texto: puntuación de correspondencia entre un clip y una descripción.
- Ejecución en dispositivo: builds para XNNPACK (fp32 e int8) y Core ML (iOS y macOS) sin runtime completo de PyTorch.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.

## Casos de uso

- Búsqueda de efectos de sonido en bibliotecas de producción: indexar cada clip con su embedding de audio y consultar con frases como "perro ladrando" o "lluvia sobre cristal", usando el fichero global int8 (29 MB) para el indexado y la torre de texto cacheada para las consultas.
- Etiquetado automático de archivos de audio en aplicaciones de edición: clasificación zero-shot con un conjunto de etiquetas propio del producto, sin reentrenar, aprovechando que un conjunto de veinte frases se reduce a veinte vectores de 512 floats.
- Moderación y filtrado de contenido sonoro en plataformas UGC: detección de categorías definidas por política (por ejemplo, "gritos", "sirena", "música con voces") mediante similitud coseno contra un banco de frases versionado.
- Funciones de accesibilidad en aplicaciones móviles: descripción de sonidos ambientales capturados por el micrófono, con la torre de audio Core ML a 8,6 ms por ventana de 10 s en M4 Max, adecuada para procesamiento casi en tiempo real en dispositivo.
- Análisis de llamadas y reuniones: segmentación por ventanas de 10 segundos y clasificación de tramos (voz, silencio, ruido de fondo, teclado) para enriquecer transcripciones o métricas de calidad.
- Monitorización acústica en borde: despliegue en dispositivos Apple con los ficheros Core ML para detectar eventos sonoros concretos en entornos industriales o urbanos sin enviar audio a la nube.
- Organización de archivos personales de audio: agrupación y búsqueda por descripción en aplicaciones de notas de voz o grabaciones domésticas, con la variante fusion para clips de más de 10 segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de fidelidad de la conversión y latencias de referencia en Mac M4 Max:

| Torre | Build | Fichero | Tamaño (MB) | Coseno del embedding frente a eager | Latencia Mac (ms) |
|---|---|---|---|---|---|
| Audio, global | Core ML (iOS/macOS) | `clap_audio_global_coreml_all.pte` | 62,4 | 0,999850 | 8,6 |
| Audio, global | XNNPACK fp32 | `clap_audio_global_xnnpack_fp32.pte` | 113,1 | 1,000000 | 66,0 |
| Audio, global | XNNPACK int8 | `clap_audio_global_xnnpack_int8.pte` | 29,0 | 0,999654 | 67,1 |
| Audio, fusion | XNNPACK fp32 | `clap_audio_xnnpack_fp32.pte` | 113,1 | 1,000000 | 146,7 |
| Audio, fusion | XNNPACK int8 | `clap_audio_xnnpack_int8.pte` | 29,1 | 0,999613 | 146,0 |
| Texto | XNNPACK fp32 | `clap_text_xnnpack_fp32.pte` | 501,4 | 1,000000 | 15,7 |
| Texto | XNNPACK int8 | `clap_text_xnnpack_int8.pte` | 243,2 | 0,990783 | 17,2 |
| Texto | Core ML (iOS/macOS) | `clap_text_coreml_all.pte` | 251,2 | 0,999874 | 4,8 |

Las latencias son la mediana de 30 ejecuciones en un solo proceso en Mac M4 Max y el autor las presenta como referencia relativa de coste, no como cifra de dispositivo. El par int8 (audio global + texto) ocupa 272 MB frente a los 615 MB del par fp32, y ambos conservan las cinco frases ganadoras en la prueba del autor. La torre de audio cuantiza bien (coseno 0,9997); la de texto se queda en 0,9908, por encima del umbral de 0,99 que el autor aplica a estas conversiones, pero con poco margen.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el par int8 (audio global + texto) requiere unos 272 MB de pesos; el par fp32, unos 615 MB. La variante fusion int8 pesa 29,1 MB y la fp32 113,1 MB. Hay que sumar el espacio de activaciones, no cuantificado en la información disponible.
- GPU recomendadas: no se documenta una GPU de servidor concreta; el autor mide en un Mac M4 Max con aceleración Core ML y XNNPACK.
- Compatibilidad con GPU de consumo: no se aportan datos de VRAM para RTX 4090 u otras GPU de consumo. Por tamaño de pesos, el conjunto int8 completo cabe holgadamente en cualquier GPU con más de 1 GB de memoria, pero no hay cifras de rendimiento publicadas para esas plataformas.
- Opciones de despliegue: ExecuTorch con delegado XNNPACK (fp32 e int8) y delegado Core ML (solo ficheros de audio global y texto). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: en Mac M4 Max, 8,6 ms por ventana de 10 s en la torre de audio Core ML y 4,8 ms por frase en la torre de texto Core ML. Con XNNPACK, 66,0 ms (audio global fp32) y 67,1 ms (int8) para audio, y 15,7 ms (fp32) y 17,2 ms (int8) para texto. La variante fusion XNNPACK ronda los 146 ms. No se publican cifras para iPhone, iPad u otros SoC.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| CLAP-HTSAT-fused-ExecuTorch (esta ficha) | ~152,2 M (124,65 M texto + 27,55 M audio) | Audio 10 s; texto 32 tokens | Embeddings audio-texto, zero-shot | Apache 2.0 | ExecuTorch `.pte` (XNNPACK, Core ML) |
| laion/clap-htsat-fused | ~152,2 M | Audio 10 s; texto 32 tokens | Embeddings audio-texto, zero-shot | Apache 2.0 | PyTorch / safetensors en Hugging Face |
| AST (Audio Spectrogram Transformer, citado en la model card) | No disponible en la información | No disponible | Clasificación de audio con 527 etiquetas AudioSet | No disponible en la información | No disponible en la información |
| CLIP / SigLIP2 (citados en la model card) | No disponible en la información | No disponible | Embeddings imagen-texto | No disponible en la información | No disponible en la información |

La comparación relevante es con el modelo base: esta conversión preserva el comportamiento del checkpoint original con cosenos de embedding entre 0,9908 y 1,0 según build, a cambio de fijar la rama `is_longer` en cada fichero y de requerir selección manual del fichero según la duración del clip. Frente a AST, la diferencia funcional es que CLAP admite etiquetas arbitrarias en tiempo de ejecución, mientras que AST responde con el conjunto fijo de AudioSet.

## Limitaciones y advertencias

- Selección manual de rama: el usuario debe elegir entre los ficheros global y fusion según la duración del clip (a 48 kHz, `len(waveform) > 480000` implica fusion). Pasar el fichero equivocado produce embeddings fuera de la distribución esperada.
- Core ML solo está disponible para el fichero de audio global y para la torre de texto. La variante fusion no tiene build Core ML porque conserva el índice `is_longer` con forma dependiente de datos, que Core ML rechaza.
- La torre de texto int8 presenta un coseno de 0,9908 frente a eager, el margen más ajustado de todas las conversiones; en aplicaciones sensibles a la precisión del ranking conviene evaluar fp32 o Core ML.
- La forma de entrada de texto está fija en 32 tokens; frases más largas se truncan y el padding no altera el embedding (verificado con coseno 1,0), pero la ventana limita descripciones largas.
- La ventana de audio es de 10 segundos; los clips más largos dependen de la rama fusion y el autor no midió ese caso.
- No se documenta cobertura lingüística de la torre de texto; el modelo base es de origen LAION y no se aportan evaluaciones por idioma.
- No se aportan evaluaciones de sesgo, robustez ni tasas de alucinación o falsos positivos en clasificación zero-shot. Como todo modelo contrastivo, la calidad del ranking depende de la formulación de las frases y puede degradarse con etiquetas ambiguas o muy próximas semánticamente.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint base `laion/clap-htsat-fused` y de los datasets de entrenamiento originales antes de un despliegue en producción.
- Las latencias publicadas corresponden a un Mac M4 Max y no deben extrapolarse a iPhone, iPad u otros SoC sin medición propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/CLAP-HTSAT-fused-ExecuTorch
- Modelo base: https://huggingface.co/laion/clap-htsat-fused
- Implementación de referencia laion_clap: no disponible en la información proporcionada
- Paper de CLAP: no disponible en la información proporcionada
- Documentación de ExecuTorch: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
