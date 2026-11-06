# loom-ai-org/oruk-loop-153m-loom

## Resumen
oruk-loop-153M es un modelo de reconocimiento automático de voz (ASR) en inglés desarrollado por Oruk AI, destilado a partir de Qwen3-ASR-1.7B. Su particularidad arquitectónica es un esquema de "bucle" (loop): un único bloque de encoder que se ejecuta 24 veces y un único bloque de decoder que se ejecuta 28 veces, cada profundidad con su propio adaptador de bajo rango. El checkpoint base declara 153M de parámetros, aunque el archivo exportado contiene 200.082.845 parámetros reales (el vocabulario factorizado se materializa en 36.974 filas).

La ficha que nos ocupa corresponde a la exportación `loom-ai-org/oruk-loop-153m-loom`, un GGUF autocontenido generado por loom-exporter para el runtime loom.cpp, que incluye las topologías de grafo, el tokenizador y el script de control embebidos. Se distribuye en dos precisiones: F32 (802 MB) y q8_0 (243 MB). El modelo es monolingüe (inglés forzado en el prompt) y está pensado para transcripción de audio mono a 16 kHz.

Su relevancia radica en que demuestra una vía de compresión agresiva por profundidad compartida con adaptadores LoRA por capa, manteniendo una calidad de transcripción cercana al profesor (WER 5,13% en F32 sobre 73 clips de LibriSpeech) a costa de un coste aritmético similar al del modelo original, ya que cada fotograma sigue atravesando 24+28 capas. La licencia PolyForm limita el uso comercial amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer con profundidad en bucle: 1 bloque de encoder repetido 24 veces y 1 bloque de decoder repetido 28 veces, con adaptadores de bajo rango por profundidad; destilado de Qwen3-ASR-1.7B |
| Parametros totales | 200.082.845 (el checkpoint base declara 153M; la diferencia proviene de materializar la tabla de tokens factorizada en 36.974 filas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor de tokens; el audio se procesa en fragmentos de hasta 30 s con segmentación por silencio; la caché del runtime sostiene un fragmento (límite práctico ~55 s en motores anteriores a 1.0.0-rc20) |
| Tipos de cuantizacion | F32 y q8_0 (exportadas con `loom-export --quantize <type>`) |
| Idiomas soportados | Inglés (`en`), con el idioma forzado en el prompt; no acepta argumento `language=` |
| Licencia | PolyForm Small Business 1.0.0 o PolyForm Noncommercial 1.0.0 (a elección), heredada del modelo base; requiere licencia de Oruk AI para otro uso comercial |
| Formato de pesos | GGUF autocontenido (grafo, tokenizador y driver embebidos), generado por loom-exporter |

## Arquitectura y entrenamiento
El modelo sigue un esquema de destilación desde Qwen3-ASR-1.7B hacia una red con profundidad compartida: un solo bloque de encoder aplicado 24 veces y un solo bloque de decoder aplicado 28 veces, con un adaptador de bajo rango distinto en cada iteración de profundidad. Esto reduce el número de matrices únicas almacenadas, pero no el coste de cómputo por fotograma, que sigue siendo el de 24 capas de encoder y 28 de decoder a la anchura del profesor.

La exportación a loom.cpp conserva el bucle en el grafo en lugar de desenrollarlo, e integra el tokenizador y el script de control en el propio GGUF. La tabla de tokens, factorizada en el checkpoint, se almacena como las 36.974 filas resultantes y los identificadores de token se renumeran a ese vocabulario (frente a las 151.936 entradas de Qwen). No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades
- Reconocimiento automático de voz en inglés sobre audio mono a 16 kHz, devolviendo transcripción con mayúsculas y puntuación heredadas del profesor.
- Segmentación automática de audio largo: corta en piezas de hasta 30 s que terminan en los 100 ms más silenciosos de sus últimos 5 s, las decodifica una a una y las une con espacios.
- Generación de hasta `min(448, 10 por segundo + 24)` tokens por fragmento.
- No acepta control de idioma: el prompt fija `language English` y cualquier argumento `language=` se ignora con aviso.
- No produce timestamps: el campo `segments` es un único tramo que cubre todo el clip.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del ASR ni modo de razonamiento explícito.

## Casos de uso
- Transcripción de reuniones y entrevistas en inglés: el modelo trocea el audio por silencios y lo decodifica por partes, lo que permite procesar grabaciones largas sin cargar el clip completo en memoria.
- Generación de subtítulos en inglés para vídeo: la salida conserva puntuación y mayúsculas del profesor, lo que reduce el postprocesado necesario antes de incrustar subtítulos.
- Dictado y notas de voz: con q8_0 (243 MB y ~669 MB de pico en un clip de 11 s) puede ejecutarse en portátiles de clase consumer para transcribir grabaciones cortas en local.
- Indexación y búsqueda de contenido hablado: transcribir lotes de audio para alimentar un índice de texto permite búsqueda semántica sobre podcasts o archivos de audio en inglés.
- Evaluación comparativa de ASR: su WER publicado (5,13% en F32 y 5,39% en q8_0 sobre 73 clips de LibriSpeech) lo hace útil como referencia ligera en experimentos de destilación y cuantización.
- Prototipado con loom-py: al ser un GGUF autocontenido con driver embebido, sirve para probar el flujo `speech2text.infer` y el acceso de bajo nivel vía `model.infer(...)` en pipelines de investigación.
- Transcripción en entornos sin GPU dedicada: el coste aritmético es el del profesor (unos 20 s para 11 s de audio en una CPU de 4 hilos), por lo que encaja en despliegues de baja concurrencia más que en servidores de alto throughput.

## Benchmarks y rendimiento

| Benchmark | oruk-loop-153m-f32 | oruk-loop-153m-q8_0 |
|---|---|---|
| WER en 73 clips de LibriSpeech | 5,13% | 5,39% |
| Transcripciones idénticas al F32 | referencia | 69 de 73 |
| Memoria pico (clip de 11 s) | 1,35 GB | 669 MB |
| Tamano en disco | 802 MB | 243 MB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de LLM, dado que el modelo es exclusivamente de ASR.

## Requisitos de hardware
- VRAM/RAM estimada: 802 MB en disco y 1,35 GB de pico en inferencia para F32; 243 MB en disco y 669 MB de pico para q8_0 (medido en un clip de 11 s).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2 GB de memoria libre puede alojar el modelo, aunque el cuello de botella es el cómputo por capa, no la memoria.
- Cabe en GPU consumer: sí, por tamaño de pesos; el rendimiento depende de la anchura del profesor y de las 24+28 capas por fotograma.
- Opciones de despliegue: runtime loom-py (`loom-py-rt` 1.0.0rc20 o posterior, con extra `[hub]`), sobre el motor loom.cpp. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en una CPU de clase portátil con 4 hilos, 11 s de audio tardaron unos 20 s en transcribirse (aproximadamente 1,8× el tiempo real). No se dispone de cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento ASR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oruk-loop-153M (esta ficha) | 200.082.845 en el GGUF (153M declarados en el base) | Fragmentos de hasta 30 s; caché de un fragmento | WER 5,13% (F32) / 5,39% (q8_0) en 73 clips de LibriSpeech | PolyForm Small Business 1.0.0 o Noncommercial 1.0.0 | GGUF en Hugging Face, runtime loom-py |
| Qwen3-ASR-1.7B (modelo profesor) | 1.700M aprox. | No disponible en la información | No disponible en la información (referencia de destilación) | Apache-2.0 (según NOTICE del export) | No disponible en la información |
| Alternativas ASR ligeras en inglés | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar con Whisper, wav2vec2 u otros ASR de tamaño similar; la única comparación documentada es con el propio profesor Qwen3-ASR-1.7B, del que se hereda la calidad de transcripción.

## Limitaciones y advertencias
- Licencia restrictiva: uso libre solo para fines personales, investigación, educación y pequeñas empresas (menos de 100 personas y menos de 1M USD de ingresos); cualquier otro uso comercial requiere licencia de Oruk AI. Algunos corpus de entrenamiento arrastran términos no comerciales propios.
- Solo inglés y con el idioma forzado en el prompt; no admite cambio de idioma en tiempo de inferencia.
- Riesgo de alucinación y errores en audio con ruido, acentos no cubiertos o vocabulario técnico; el WER publicado procede de LibriSpeech, un corpus de lectura relativamente limpio.
- Sin timestamps: no sirve para tareas que requieran alineación temporal por palabra o segmento.
- Coste aritmético elevado pese al tamaño: cada fotograma atraviesa 24 capas de encoder y 28 de decoder, por lo que la latencia se parece a la del profesor (unos 20 s para 11 s de audio en CPU de 4 hilos).
- Dependencia estricta de `loom-py-rt` 1.0.0rc20 o posterior para audio largo; motores anteriores decodifican en una pasada y fallan con clips de más de unos 55 s por límite de `loom.kv_cache_size`.
- Audio de entrada limitado a mono a 16 kHz; no se documentan otras frecuencias de muestreo ni canales múltiples.
- La cuantización q8_0 altera 4 de 73 transcripciones respecto al F32, un caveat a considerar en producción.

## Enlaces
- Hugging Face del export: https://huggingface.co/loom-ai-org/oruk-loop-153m-loom
- Modelo base: https://huggingface.co/oruk/oruk-loop-153M
- Licencia de pesos del base: https://huggingface.co/oruk/oruk-loop-153M/blob/main/LICENSE-WEIGHTS.md
- Runtime loom-py: https://github.com/loom-ai-org/loom-py
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Web de Oruk AI: https://oruk.ai
- Paquete PyPI: https://pypi.org/project/loom-py-rt/
