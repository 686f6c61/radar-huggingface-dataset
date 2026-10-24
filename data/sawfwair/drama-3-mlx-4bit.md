# Sawfwair/DRAMA-3-MLX-4bit

## Resumen

DRAMA-3-MLX-4bit es una cuantización derivada del modelo de síntesis de voz fishaudio/drama-3, publicada por el usuario Sawfwair para ejecutarse exclusivamente sobre el runtime nativo mere.run (Swift + MLX) en Apple Silicon. No es una versión oficial de Fish Audio: se trata de un empaquetado de los expertos enrutados del modelo original (almacenados en FP8) recodificados como pesos MLX afines de 4 bits con grupos de 64, mientras que atención, routers, embeddings y la torre de audio conservan BF16 y el códec DAC se mantiene intacto y se ejecuta en FP32. El resultado es un bundle de 27,4 GB (8.720.553.088 parámetros declarados en los safetensors) frente a los 41,5 GB del export original.

El problema que resuelve es logístico: permite descargar y ejecutar un TTS de escala 8B en un equipo Apple Silicon sin tener que repackear los expertos del checkpoint fuente. Para ello, sin embargo, impone un ecosistema cerrado: no funciona con Transformers ni con `mlx-lm`, no hay ruta de inferencia en Python y el servidor de API del runtime excluye este modelo, incluidas las rutas locales. La inferencia es únicamente mediante CLI local y solo está soportada en macOS 15 o superior sobre Apple Silicon; iOS queda explícitamente fuera de alcance.

La relevancia práctica está acotada por su estado de calificación: el autor documenta siete pruebas en inglés sobre un sistema de 36 GiB, con cero errores de palabra medidos por ASR sobre 166 palabras, pero también un pico de 32,86 GiB de huella física, uso de swap y un tiempo hasta el primer audio en frío de 96–113 segundos. La licencia Fish Audio Community License 1.0 impone umbral de ingresos, condiciones para servicio alojado, atribución y consentimiento de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivada de fishaudio/drama-3 con expertos enrutados (MoE), torre de audio y códec DAC |
| Parametros totales | 8.720.553.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín MLX con grupos de 64 en expertos enrutados; BF16 en atención, routers, embeddings y torre de audio; códec en FP32 |
| Idiomas soportados | no disponibles (el idioma se infiere del texto de entrada; solo se validaron pruebas en inglés) |
| Licencia | fish-audio-community-license-1.0 |
| Formato de pesos | safetensors (88 shards, layout propio `drama3-experts-q4-g64-v1`); incluye `codec.pth` sin modificar |
| Tarea | text-to-speech (síntesis de voz y clonación por referencia) |
| Libreria / runtime | mlx; ejecución exclusiva con mere.run (Swift/MLX) |
| Plataforma soportada | Apple Silicon, macOS 15 o superior; iOS no soportado |
| Tamano del repositorio | 27,4 GB |
| Modelo base | fishaudio/drama-3 (commit `dd64a85cd82e9521f7202610ede97b367fc83946`) |
| Fecha de publicacion | 2026-10-24 |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado: el autor indica explícitamente que no se realizó entrenamiento ni fine-tuning. El proceso parte del export original de fishaudio/drama-3 (27.408.212.020 bytes en 99 archivos, con un fuente de 41,5 GB), decodifica los valores FP8 de los expertos enrutados usando escalas de bloque de 128×128 y los reempaqueta como pesos MLX afines de 4 bits con grupos de 64, bajo el formato propietario `drama3-experts-q4-g64-v1`. Las capas de atención, los routers, los embeddings y la torre de audio se conservan en BF16 del modelo fuente, y el códec (`codec.pth`) permanece sin cambios, ejecutándose en FP32 de forma nativa.

La innovación técnica no está en la arquitectura del modelo, sino en el empaquetado y el runtime: el bundle incluye modelo, tokenizador y códec original, y la inferencia se ejecuta íntegramente en Swift y MLX, sin Python en la ruta de ejecución. El repositorio incorpora documentación de procedencia (`drama3-quantization.json` con hashes SHA-256 del origen y del export original, `SHA256SUMS`, `MODIFICATIONS.md`, `Notice` y la model card original preservada como `UPSTREAM_MODEL_CARD.md`). El autor mantiene además un registro de calificación con las pruebas realizadas y sus límites.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) mediante el comando `speech synthesize` del CLI de mere.run.
- Selección de hablante por marca textual (`<|speaker:0|>`); los valores con nombre de `--speaker` y el parámetro `--voice` no están soportados.
- Clonación de voz por acondicionamiento con referencia: `--ref-audio` más `--ref-text` con la transcripción exacta del clip.
- Streaming causal de la forma de onda con `--stream`, con prefijos de audio disponibles antes de completar la generación.
- Generación por lotes: las pruebas documentadas cubren síntesis por lotes de fragmentos cortos y de párrafos.
- Reproducibilidad por semilla (`--seed`), con coincidencia en el número de muestras entre streaming y lote por semilla.
- Cancelación tras el primer fragmento, liberando los grafos del modelo sin publicar un WAV parcial.
- Inferencia de idioma a partir del texto de entrada (sin parámetro de idioma explícito).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Narración de audiolibros y contenidos largos en local: el modo de streaming permite emitir prefijos de audio antes de terminar la generación, útil para reproducción progresiva, aunque el tiempo hasta el primer audio en frío medido (96–113 s) obliga a mantener el proceso caliente.
- Doblaje y localización de material propio: la clonación por referencia con `--ref-audio` y `--ref-text` permite reproducir un timbre concreto a partir de un clip de hasta 30 segundos, siempre con permiso explícito sobre la voz.
- Prototipado de interfaces de voz en macOS: al ejecutarse nativamente en Swift/MLX sobre Apple Silicon, puede integrarse como CLI en flujos de desarrollo de aplicaciones de escritorio sin dependencia de Python.
- Generación de avisos y locuciones para sistemas internos: la síntesis por lotes de párrafos encaja en la producción masiva de ficheros WAV para paneles, kioscos o señalización.
- Verificación de pipelines de audio: la reproducibilidad por semilla y la comprobación de hashes (`shasum -a 256 -c SHA256SUMS`) permiten usar el modelo como referencia estable en pruebas de regresión de audio.
- Investigación sobre cuantización de modelos MoE de audio: el bundle documenta el paso de FP8 a 4 bits afín con grupos de 64 y conserva los artefactos de procedencia, lo que lo hace útil para estudiar la pérdida de calidad frente al original (aún no cuantificada por el autor).
- Evaluación de motores TTS en hardware de consumo: sirve para medir huella de memoria y latencia en equipos Apple Silicon de 32–36 GiB, un escenario distinto al de las GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo documenta pruebas de calificación internas:

| Prueba | Resultado documentado |
|---|---|
| Sondas de calificación | 7 sondas acotadas en inglés: lote corto, lote de párrafo, acondicionamiento por referencia, streaming corto, streaming de párrafo, streaming con referencia y cancelación tras el primer fragmento |
| Precisión de contenido | 0 errores de palabra medidos por ASR sobre 166 palabras puntuadas en las 6 salidas completadas |
| Sonda más larga | 57 palabras, 23,17 segundos de audio generado |
| Pico de huella física del proceso | 32,86 GiB (streaming de párrafo), con swap en uso |
| Tiempo hasta el primer audio en frío | 96–113 segundos |
| Fidelidad streaming vs. lote | Error máximo de muestra inferior a 0,000048 frente a las exportaciones PCM16 por lotes |
| Integración con main | Smoke test corto repetido en `e1efec52`; WAV byte a byte idéntico al baseline corto con sampler corregido |

El propio autor advierte que estos resultados no establecen latencia interactiva, throughput en caliente ni funcionamiento sin swap, y que el mínimo de catálogo de 32 GiB sigue siendo una estimación.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 15 o superior. La inferencia en iOS no está soportada.
- Espacio en disco: al menos 28 GB libres para la descarga; el repositorio ocupa 27,4 GB.
- Memoria unificada: el mínimo de catálogo de 32 GiB es una estimación; el sistema probado tenía 36 GiB y aun así registró swap en uso durante el streaming de párrafo.
- Huella medida: hasta 32,86 GiB de memoria física del proceso en el caso más exigente documentado.
- GPU: no aplica el catálogo habitual (A100, H100, RTX 4090); el modelo no se ejecuta en CUDA ni en GPUs dedicadas convencionales según la información disponible.
- Opciones de despliegue: únicamente el runtime mere.run compilado con Swift (`swift build`) desde el commit validado `a68cc7a5`. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni `mlx-lm`; el servidor de API del runtime excluye este modelo, incluidas rutas locales.
- Latencia: 96–113 s hasta el primer audio en frío en el sistema de 36 GiB; no se han publicado cifras de throughput en caliente.
- Límites operativos: tope de generación de 750 fotogramas (al alcanzarlo, la ejecución falla en lugar de publicar un fichero truncado); clips de referencia no vacíos y de 30 segundos como máximo; una sola referencia por invocación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sawfwair/DRAMA-3-MLX-4bit | 8.720.553.088 | no disponible | safetensors 4 bits, layout propio; solo mere.run (Swift/MLX) en Apple Silicon | fish-audio-community-license-1.0 | HuggingFace, 0 descargas, 0 likes |
| fishaudio/drama-3 (base) | no disponible en la informacion | no disponible | export original de 41,5 GB con expertos en FP8 | fish-audio-community-license-1.0 | HuggingFace (modelo fuente, commit `dd64a85c`) |
| Otras alternativas TTS de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: este derivado reduce el peso de 41,5 GB a 27,4 GB, conserva atención, routers, embeddings y torre de audio en BF16 y mantiene el códec sin tocar, a cambio de perder compatibilidad con cualquier runtime genérico y de no haber cuantificado todavía la pérdida de calidad del Q4 frente al original. No se dispone de datos sobre otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- Ecosistema cerrado: solo funciona con mere.run en Apple Silicon con macOS 15 o superior; no es válido para Transformers, `mlx-lm`, vLLM, llama.cpp, Ollama ni TGI.
- Sin ruta de inferencia en Python y sin servidor de API: el servidor del runtime excluye este modelo, incluidas las rutas locales, lo que impide integrarlo como servicio.
- Calidad Q4 no cuantificada: el autor declara explícitamente que la pérdida de calidad respecto al modelo original no está evaluada.
- Cobertura lingüística sin validar: solo se probaron siete sondas en inglés; otros idiomas, la calidad multi-hablante y las referencias de longitud máxima quedan sin calificar. No se debe inferir capacidad multilingüe del resultado de ASR.
- Identidad de voz no verificada: la referencia sintética usada en las pruebas valida el acondicionamiento y el contenido del texto, no la identidad perceptual de la voz.
- Rendimiento no interactivo: 96–113 s hasta el primer audio en frío, con swap en uso y sin datos de throughput en caliente ni de funcionamiento sin swap.
- Restricciones de memoria: el mínimo de 32 GiB es estimado; el sistema probado de 36 GiB ya recurrió a swap en el caso de streaming de párrafo.
- Límites funcionales: sin `--voice`, sin valores con nombre de `--speaker`, sin classifier-free guidance, una sola referencia de 30 segundos como máximo y tope de 750 fotogramas que provoca fallo en lugar de truncado.
- Riesgo de alucinación de contenido: no se han publicado métricas de fidelidad de texto a gran escala más allá de las 166 palabras puntuadas; en produccion conviene verificar el audio con ASR.
- Licencia: Fish Audio Community License 1.0, con umbral de ingresos, condiciones específicas para servicio alojado, obligación de atribución y términos de consentimiento de voz. La licencia del código de mere.run no sustituye a la del modelo. Es obligatorio revisar `LICENSE` y `Notice` antes de descargar o usar los pesos.
- Uso de voces: solo deben reproducirse voces sobre las que se tenga permiso explícito.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta; es un derivado no oficial publicado por un tercero, no una versión de Fish Audio.
- Integración parcialmente validada: la suite de siete sondas no se repitió tras la integración con main; solo se repitió un smoke test corto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sawfwair/DRAMA-3-MLX-4bit
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Repositorio del runtime mere.run (commit validado a68cc7a5): https://github.com/sawfwair/mere-run/tree/a68cc7a5a94b66f065b034863108caa2bbed59d2
- Registro de calificación DRAMA-3 nativo: https://github.com/sawfwair/mere-run/tree/a68cc7a5a94b66f065b034863108caa2bbed59d2/docs/qualification/drama3-native-20261015
- Ficheros de licencia y procedencia incluidos en el repo: `LICENSE`, `Notice`, `MODIFICATIONS.md`, `SHA256SUMS`, `drama3-quantization.json`, `UPSTREAM_MODEL_CARD.md`, `DRAMA3_EXTENDED_RESULTS.json`, `DRAMA3_MAIN_INTEGRATION.json`

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre el modelo (los resultados eran listados de conciertos y agendas culturales), por lo que los enlaces anteriores proceden exclusivamente de la información de HuggingFace y de la model card.
