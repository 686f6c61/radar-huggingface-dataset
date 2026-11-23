# DavidAkh/Harkn-Orchestra

## Resumen

Harkn-Orchestra (publicado internamente como "Electro Mini") es un modelo encoder-decoder de tipo transformer, con 8,7 millones de parámetros, desarrollado por DavidAkh para transcripción automática de guitarra a tablatura. A diferencia de la mayoría de modelos de audio, no parte de pesos preentrenados: tanto el sintetizador que generó los datos, como el tokenizador, la arquitectura y el bucle de entrenamiento fueron construidos desde cero. El modelo recibe audio de guitarra y produce una secuencia de tokens que codifica cuerda, traste, tiempo de ataque, técnica de ejecución, rasgueos y pulsos rítmicos.

La relevancia del proyecto es doble. Por un lado, aborda una tarea concreta y difícil (la asignación de cuerda y traste es ambigua por naturaleza en la guitarra) con un modelo minúsculo que entrena en unas siete horas en un solo Mac Studio con M2 Max usando MLX. Por otro, demuestra una metodología de dominio sintético: 100.000 clips y 194 horas de audio generados por un sintetizador propio, con etiquetas exactas y separación por partitura para evitar filtración entre train y test.

El contexto de audio es de 10 segundos por ventana (procesamiento deslizante para grabaciones más largas) y el decodificador tiene un límite de 1.024 tokens, con una secuencia máxima observada de 967. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales, aunque las limitaciones de dominio (solo guitarra, solo afinación estándar, evaluación mayoritariamente sintética) condicionan su aplicabilidad en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con front-end convolucional (2 × Conv1d, kernel 3) sobre espectrograma de constant-Q |
| Parámetros totales | 8.685.597 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 segundos de audio por ventana; decodificador limitado a 1.024 tokens |
| Tipos de cuantización | no disponible (pesos publicados en float32; el autor menciona ejecución en fp16 en Apple Silicon) |
| Idiomas soportados | en (la salida es tablatura, no texto libre; el etiquetado de idioma es nominal) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32, 35 MB) |

## Arquitectura y entrenamiento

El pipeline de entrada convierte audio mono a 22,05 kHz en un espectrograma de constant-Q de 252 bins (3 por semitono, a partir de D2) con hop de 512 muestras (~23 ms). Ese espectrograma pasa por dos capas Conv1d de kernel 3 y entra en un encoder transformer de 4 capas con dimensión 256 y 4 cabezas de atención. El decoder, también de 4 capas, hace cross-attention sobre la representación del audio y genera tokens de uno en uno de forma autorregresiva y greedy, sin caché de clave-valor.

La salida se serializa con un vocabulario de 1.053 tokens: pasos temporales de 10 ms (`time_0` a `time_1000`), cuerdas 1 a 6, trastes 0 a 24 más `fret_x` para notas muertas, 13 técnicas (hammer-on, pull-off, slide, slide-out, bends de medio tono, tono completo y tono y medio, release, vibrato, armónico, palm mute, ghost note y let ring), y tokens de agrupación (`strum_down`, `strum_up`, `beat`, `downbeat`). Una nota se representa como, por ejemplo, `time_42 tech_hammer_on string_3 fret_7`. El tokenizador reconstruye sin pérdidas las 100.000 clips de entrenamiento.

Los datos provienen íntegramente de "Electro Synth", un sintetizador de guitarra escrito por el autor para el proyecto: 100.000 clips de 4 a 10 segundos, 194 horas de audio y 4,2 millones de notas, derivados de 55.629 partituras compuestas. La separación train/validación/test es por partitura (90.079 / 4.972 / 4.949 clips), de modo que ninguna partitura de test aparece en entrenamiento en ninguna renderización. La variedad se introduce por aleatorización de dominio: 36 % guitarra eléctrica, 28 % acero, 16 % nylon, con física de cuerdas, pastillas, amplificadores, efectos, zumbido y sonido de sala aleatorizados; el 55 % es guitarra sola, el 25 % guitarra en mezcla de banda y el 20 % audio sin guitarra (el modelo debe escribir una parte de guitarra para música que no la tiene). El contenido musical cubre notas sueltas, arpegios, rasgueo, riffs de power chords y partes mixtas en compases de 4/4, 3/4 y 6/8.

El entrenamiento usó aumento ligero de espectrograma (±6 dB de ganancia, ±3 dB de tilt), precisión mixta fp16 con escalado de pérdida, 60 épocas (~140.000 pasos), batches de 8.192 tokens, learning rate 5e-4 y 1.000 pasos de calentamiento. La pérdida de validación mínimo se alcanzó en la época 33 (0,2835), que es el checkpoint publicado; a partir de ahí el modelo empezó a sobreajustar.

## Capacidades

- Transcripción de audio de guitarra a tablatura ASCII, con cuerda, traste, tiempo de ataque y técnica por nota.
- Detección de 13 técnicas de ejecución: hammer-on, pull-off, slide, slide-out, bends de medio tono, tono completo y tono y medio, release, vibrato, armónico, palm mute, ghost note y let ring.
- Agrupación de notas en rasgueos (`strum_down`, `strum_up`) y marcado rítmico (`beat`, `downbeat`).
- Salida estructurada en JSON además de la tablatura en texto, con lista de notas y metadatos por nota.
- Procesamiento de grabaciones largas mediante ventanas deslizantes de 10 segundos.
- Acepta cualquier formato de audio legible por librosa.
- Generación de una parte de guitarra para audio sin guitarra (capacidad entrenada explícitamente con el 20 % del corpus).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM de texto.
- No soporta visión, audio general (voz, otros instrumentos) ni otros idiomas distintos del etiquetado nominal.

## Casos de uso

- Transcripción de riffs y solos para guitarristas: el modelo convierte una grabación de 10 segundos en tablatura ASCII con digitación y técnicas, útil para documentar ideas rápidamente sin transcribir a oído. La puntuación de Pitch F1 del 93,2 % en test sintético indica que la altura detectada es fiable, aunque la asignación de cuerda y traste es el punto débil en audio real.
- Generación de tablaturas de referencia para docencia: a partir de grabaciones de ejercicios, el modelo produce una tablatura con marcas de técnica (bends, hammer-ons, vibrato) que sirve como material de partida para clases, con revisión humana dado el 50,4 % de clips transcritos perfectamente en test sintético.
- Etiquetado automático de datasets de guitarra: la salida JSON con onset, cuerda, traste y técnicas permite anotar corpus de audio con un modelo de 35 MB ejecutable en local, reduciendo el coste frente a anotación manual, siempre con verificación posterior.
- Prototipado de herramientas de práctica musical: integración en aplicaciones que muestran la tablatura en tiempo (casi) real de lo que toca el usuario, aprovechando la ventana de 10 segundos y el procesamiento por ventanas deslizantes; requiere hardware Apple Silicon para latencias aceptables.
- Investigación en transcripción musical: el modelo y el sintetizador sirven como línea base reproducible (MIT, pesos de 35 MB, código incluido) para estudiar el gap entre datos sintéticos y audio real, un problema central en MIR (music information retrieval).
- Análisis de técnica interpretativa: los tokens de técnica permiten agregar estadísticas sobre uso de bends, vibrato o palm mute en una grabación, útil para análisis estilístico o para sistemas de feedback automatizado a estudiantes.
- Generación de partes de guitarra sobre mezclas sin guitarra: el 20 % del corpus entrena al modelo para escribir una parte plausible sobre audio que carece de ella, lo que abre un caso de uso creativo en producción musical asistida.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 4.949 clips de test sintéticos cuyas partituras nunca aparecieron en entrenamiento:

| Métrica | Resultado |
|---|---|
| Tab F1 (cuerda + traste, tolerancia ±50 ms) | 89,9 % |
| Pitch F1 | 93,2 % |
| Clips transcritos perfectamente | 50,4 % |

Prueba sobre audio real (60 grabaciones cortas de notas sueltas del propio autor, cubriendo las seis cuerdas y trastes 0 a 19; el modelo nunca entrenó con audio real):

| Métrica | Resultado |
|---|---|
| Altura correcta | 55 de 60 (92 %) |
| Cuerda y traste exactos | 20 de 60 (33 %) |
| Exactamente una nota escrita | 41 de 60 |

No se han publicado comparaciones con otros modelos de transcripción de guitarra en la información disponible.

## Requisitos de hardware

- Pesos en float32 de 35 MB; la VRAM necesaria para inferencia es marginal (muy por debajo de 1 GB), dominada por las activaciones del encoder y el decoder, no por los parámetros.
- Entrenado y pensado para ejecutarse con MLX en Apple Silicon (GPU de Apple); el autor cita un Mac Studio con M2 Max para el entrenamiento de ~7 horas.
- En CPU convencional el modelo funciona (instalación con `mlx[cpu]` en Linux) pero es lento: el autor estima de uno a varios minutos por cada 10 segundos de interpretación densa, porque la generación es greedy y no usa caché de clave-valor.
- No requiere GPU de datacenter (A100, H100) ni tarjetas consumer NVIDIA; no hay soporte documentado para CUDA, vLLM, TGI, llama.cpp ni Ollama, al ser un modelo de audio con arquitectura y tokenizador propios.
- El despliegue se hace mediante los scripts incluidos (`transcribe.py`, `model_mlx.py`, `tokenizer.py`) y las dependencias del repositorio (librosa, soundfile, MLX).
- En Apple Silicon se recomienda `--fp16` para acelerar la inferencia.
- No se han publicado cifras de latencia o throughput más allá de la estimación cualitativa en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de transcripción de guitarra a tablatura en la información proporcionada. La comparación con alternativas de la misma categoría (por ejemplo, sistemas comerciales de transcripción o modelos de MIR de mayor tamaño) no está disponible, y el autor no incluye baseline alguno en la model card.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Harkn-Orchestra (Electro Mini) | 8,7 M | 10 s de audio / 1.024 tokens | MIT | Hugging Face, pesos safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Evaluación mayoritariamente sintética: las cifras principales (Tab F1 89,9 %, Pitch F1 93,2 %) provienen de clips generados por el propio sintetizador del autor; en audio real el rendimiento cae, como muestra la prueba con 60 notas (33 % de acierto exacto en cuerda y traste).
- La asignación de cuerda y traste es ambigua en notas aisladas: sin contexto de notas vecinas, el modelo elige a menudo una posición alternativa igualmente válida en el mástil. Es la debilidad principal declarada por el autor.
- Solo guitarra y solo afinación estándar: no hay soporte para bajo, piano, afinaciones alternativas ni cejilla.
- Ventanas de 10 segundos: una nota que suena a caballo entre dos ventanas puede cortarse o duplicarse.
- Generación greedy sin caché de clave-valor: lenta en CPU (de uno a varios minutos por 10 segundos de interpretación densa).
- Riesgo de sobreajuste: el checkpoint publicado corresponde a la época 33, el mínimo de validación; a partir de ahí la pérdida de validación empeoró.
- Riesgo de alucinación en el sentido musical: en la prueba con audio real, cuando falló, el modelo tendió a repetir la nota o añadir un acorde no presente.
- Sesgos de dominio: el corpus está desbalanceado hacia guitarra eléctrica (36 %) frente a acero (28 %) y nylon (16 %), lo que puede penalizar la transcripción de instrumentos acústicos.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero no hay garantías ni soporte; el autor no documenta un proceso de validación en producción.
- El etiquetado de idioma "en" es nominal: la salida es tablatura, no texto en lenguaje natural, por lo que la noción de cobertura multilingüe no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAkh/Harkn-Orchestra
- Repositorio MLX (framework de entrenamiento e inferencia): https://github.com/ml-explore/mlx
- No se han encontrado en la información disponible enlaces a papers, blogs, demos o repositorios adicionales del autor.
