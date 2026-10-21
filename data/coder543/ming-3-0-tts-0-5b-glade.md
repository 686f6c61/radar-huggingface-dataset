# coder543/ming-3.0-tts-0.5b-glade

## Resumen

Ming 3.0 TTS 0.5B for Glade es una conversión cuantizada del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-0.5B, empaquetada por el usuario coder543 para su ejecución nativa en Swift sobre Apple Silicon mediante el runtime Glade y Core AI. El objetivo no es entrenar un modelo nuevo, sino trasladar el pipeline original (backbone de lenguaje denso, agregación de audio, red de flujo y AudioVAE) a assets `.aimodel` que se ejecutan en la Neural Engine y la CPU, eliminando la dependencia de Python en tiempo de inferencia. La salida es audio mono a 44,1 kHz.

La etiqueta "0.5B" hace referencia al backbone de lenguaje, de 494 millones de parámetros; el checkpoint completo contiene 1.479.451.276 parámetros aprendidos (incluido el encoder de referencia acústica) y la ruta de síntesis propiamente dicha suma 1.060.189.452 parámetros. Es una conversión y cuantización sin entrenamiento adicional, con licencia MIT y soporte declarado para siete idiomas: chino, inglés, alemán, español, francés, coreano y japonés.

Su relevancia actual reside en que permite integrar TTS de calidad en apps iOS y macOS nativas sin servidores ni bindings de Python, con un consumo medido de 2,0 GB de memoria en un MacBook Air M3 de 16 GB y una velocidad de generación en torno a 1,89× tiempo real (RTFx) en ese hardware. Requiere macOS 27 o iOS 27 y no incluye grabaciones de voz en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS: backbone de lenguaje denso + agregación de audio + red de flujo + AudioVAE (ventana causal de 64 posiciones) |
| Parámetros totales | 1.479.451.276 parámetros aprendidos (checkpoint completo, incluye encoder de referencia acústica); ruta de síntesis: 1.060.189.452; backbone de lenguaje: 494 M |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 posiciones prompt/salida en el grafo de lenguaje, con bloques de prefill de 32 posiciones; AudioVAE con ventana causal nativa de 64 posiciones |
| Tipos de cuantización | FP16 en proyecciones y embeddings de lenguaje; INT8 con activaciones FP16 en flujo, agregación y proyecciones de AudioVAE |
| Idiomas soportados | zh, en, de, es, fr, ko, ja |
| Licencia | MIT |
| Formato de pesos | Assets Core AI (`.aimodel`, nueve en total) y `resources.f32`; runtime Swift (Glade) |

## Arquitectura y entrenamiento

El sistema no es un único transformer, sino un pipeline de síntesis con cuatro bloques: un backbone de lenguaje denso que procesa el texto tokenizado (y, si se usa, la condición acústica), una etapa de agregación de audio, una red de flujo que integra el sampler EPSS de diez pasos del modelo original y un AudioVAE causal que reconstruye la onda. La conversión mantiene las proyecciones y embeddings del backbone en FP16, mientras que las proyecciones de flujo, agregación y AudioVAE se almacenan en INT8 con activaciones FP16. El grafo de flujo usa proyecciones sin dividir; el resto de familias convertidas aplican reducciones de proyección a 256 canales.

No hay entrenamiento adicional: es una conversión de pesos del checkpoint `e5bd8da31ecf1b9276cdbdda821fa891068f1368` del modelo base, realizada contra la implementación de referencia `e999c39fa676722aaa9ea29b5aa19a90525b271f`. El sampler EPSS upstream se preserva con guiado `conditional + 2 * (conditional - unconditional)`, sigma 0,25, temperatura 0 y sway -1; con temperatura 0 se conservan la inicialización gaussiana original y las extracciones SDE originales. El frontend de texto, el muestreo de flujo y la reconstrucción de onda corren en la CPU del host (incluyendo la IFFT inversa de 3.528 puntos, el hop de 882 muestras y el recorte de bordes), mientras que el grafo de síntesis se ejecuta en la Neural Engine, confirmado mediante captura de Instruments.

## Capacidades

- Síntesis de voz a partir de texto plano (ordinary-text TTS) en siete idiomas, con salida mono a 44,1 kHz.
- Normalización de texto para chino e inglés con los transductores publicados por el autor original; los otros cinco idiomas (de, es, fr, ko, ja) usan el bypass de idioma explícito del modelo upstream.
- Catálogo de voces incorporado para chino e inglés; la condicionamiento por voz acústica requiere audio de referencia más su transcripción, que se codifica una vez y se reutiliza.
- Sesión TTS con peticiones offline y online ordenadas; en modo online la salida llega tras cada fragmento normalizado completo (no es reproducción incremental de frames latentes).
- Control de emoción, entrega, diseño de voz e instrucciones libres descritos en el modelo upstream como tareas distintas; así como el soporte de sichuanés y cantonés, también listados como tareas separadas.
- Ejecución sin Python, sin tokenización previa y sin fonemas aportados por el usuario: el bundle incluye tokenizador, normalizadores y encoder de referencia.
- Determinismo con semilla fija: las tres repeticiones medidas en la model card produjeron bytes de onda idénticos.
- Sin soporte declarado de tool calling, function calling, agentes ni multimodalidad (es un modelo específicamente TTS).

## Casos de uso

- Síntesis de voz en apps iOS y macOS nativas: integrar `MingTTSModelBundle` y `MingTTSSynthesizer` en Swift para generar audio a 44,1 kHz desde texto sin salir del entorno Apple ni depender de servidores.
- Lectura en voz alta y accesibilidad: usar el catálogo de voces integrado (zh/en) y los siete idiomas para funciones de lectura de pantalla, notificaciones habladas o contenido escrito en apps con requisitos de privacidad on-device.
- Asistentes de voz offline: el modelo corre en Neural Engine con 2,0 GB de huella física medida, lo que permite respuestas habladas sin conexión en dispositivos Apple Silicon.
- Clonación/condicionamiento de voz con referencia: codificar un audio de referencia y su transcripción una sola vez y reutilizar la condición acústica para mantener una identidad de voz en varios fragmentos.
- Síntesis por fragmentos en streaming de UI: el modo online devuelve audio tras cada fragmento normalizado (objetivo por defecto de 50 caracteres), útil para lectura progresiva en interfaces conversacionales.
- Localización de contenido a siete idiomas: generar pistas de voz en zh, en, de, es, fr, ko y ja para prototipos de vídeo, demos o documentación, asumiendo las limitaciones de pronunciación indicadas por el autor.
- Integración en pipelines de CI de apps Apple: automatizar la generación de clips de prueba en tests de UI o de audio sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo es de síntesis de voz, no de razonamiento o código. El autor sí publica una medición de rendimiento de la conversión en un MacBook Air M3 (16 GB, macOS 27.0.1, runtime Glade en Release, un calentamiento y tres pasadas medidas) con el texto de entrada: "Sunlight pours through the trees. A gentle breeze moves across the clearing. Welcome to Glade.".

| Pasada | Audio | Generación | RTFx |
|---|---:|---:|---:|
| 1 | 6,10 s | 3,169 s | 1,925× |
| 2 | 6,10 s | 3,429 s | 1,779× |
| 3 | 6,10 s | 3,224 s | 1,892× |
| Mediana | 6,10 s | 3,224 s | 1,892× |

Controles numéricos declarados por el autor: la integración de flujo difiere un 1,84 % de RMS relativo respecto al fixture de origen; la reconstrucción por IFFT inversa difiere un 0,000024 %. El autor advierte que el RMS interno no es una puntuación de calidad perceptual.

Comprobaciones cualitativas: Cohere Transcribe recuperó todas las palabras del audio corto en inglés; al ser tres repeticiones con bytes idénticos, se trata de una única comprobación de audio distinta. Hay comprobaciones cortas adicionales en los siete idiomas y en la ruta de entrega ordenada por CLI, pero no establecen pronunciación multilingüe general, similitud de hablante ni calidad en formato largo.

## Requisitos de hardware

- Huella de memoria medida: 2,0 GB (decimal) como máximo por pasada, sumando la huella física del proceso y el ledger sin huella de la Neural Engine; no es el tamaño de descarga ni una estimación de memoria unificada.
- Hardware de referencia: MacBook Air con chip M3 y 16 GB de RAM; el grafo de síntesis se ejecuta en la Neural Engine y el frontend de texto y el procesamiento de señal en CPU.
- Sistemas operativos: Core AI requiere macOS 27 o iOS 27. No se aportan cifras de rendimiento para iPhone.
- Cabe en hardware consumer Apple Silicon (M3 probado); no se han publicado mediciones para A-series ni para otras generaciones de M-series.
- Despliegue: runtime Glade (Swift), con `hf download` para obtener el snapshot y el comando `glade tts` como vía CLI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput/latencia medidos: mediana de 3,224 s de generación para 6,10 s de audio (RTFx 1,892×), con calentamiento previo y sin contar preparación inicial, escritura de WAV ni Instruments dentro del temporizador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| coder543/ming-3.0-tts-0.5b-glade (este) | 1.479.451.276 aprendidos (backbone 494 M; ruta de síntesis 1.060.189.452) | 512 posiciones de grafo de lenguaje; AudioVAE 64 posiciones | zh, en, de, es, fr, ko, ja | MIT | Assets `.aimodel` y `resources.f32`; runtime Swift/Glade |
| inclusionAI/Ming-3.0-tts-0.5B (base) | Backbone de 0,5 B según etiqueta; checkpoint completo no disponible en esta información | no disponible | zh, en, de, es, fr, ko, ja | MIT | Pesos originales (implementación Python/upstream); revisiones de referencia citadas |
| Otros modelos TTS de ~0,5 B (p. ej. Kokoro, XTTS) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con el modelo base: este repositorio es una conversión cuantizada sin entrenamiento adicional, con salida a 44,1 kHz y ejecución en Swift/Core AI, mientras que el modelo base se distribuye con su implementación de referencia en Python. No se dispone de datos de benchmarks ni de especificaciones de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que las comprobaciones cortas no establecen pronunciación multilingüe general, similitud de hablante ni calidad en formato largo; la calidad perceptual no está cuantificada.
- Solo chino e inglés cuentan con normalizadores publicados; los otros cinco idiomas usan el bypass de idioma explícito, lo que puede afectar a la naturalidad o a la corrección de la normalización.
- El condicionamiento de voz acústica requiere audio de referencia y su transcripción; no se incluye ninguna grabación de voz en el repositorio.
- Las funciones de emoción, entrega, diseño de voz e instrucciones libres, así como el sichuanés y el cantonés, se describen como tareas distintas del modelo upstream; la ruta medida en esta conversión es la síntesis de texto plano.
- El modo online entrega audio tras cada fragmento normalizado completo, no reproducción incremental de frames latentes: no debe interpretarse como streaming de baja latencia frame a frame.
- La integración de flujo se desvía un 1,84 % de RMS relativo respecto al fixture de origen; el propio autor señala que el RMS interno no equivale a calidad perceptual.
- Dependencia de plataforma: requiere macOS 27 o iOS 27 y el runtime Glade; no se documentan alternativas como vLLM, llama.cpp u Ollama, ni cifras para iPhone.
- Licencia MIT en pesos e implementación upstream, con avisos adicionales de WeTextProcessing y OpenFst que deben conservarse en `LICENSE`, `NOTICE` y `CODE-LICENSE`.
- No hay métricas publicadas de sesgos, alucinación (no aplica en el sentido de LLM, pero sí posibles errores de pronunciación) ni robustez ante texto anómalo.
- El repositorio es una conversión de un tercero, no la distribución oficial de inclusionAI; conviene fijar la revisión de snapshot para producción.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/coder543/ming-3.0-tts-0.5b-glade
- Modelo base en HuggingFace: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Implementación de referencia upstream: https://github.com/inclusionAI/Ming-3.0-tts
