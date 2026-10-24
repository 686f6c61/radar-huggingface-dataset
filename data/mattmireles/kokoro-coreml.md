# mattmireles/kokoro-coreml

## Resumen

`mattmireles/kokoro-coreml` es una implementación del modelo de síntesis de voz Kokoro-82M (original de hexgrad) reempaquetada como pipeline nativo de Core ML para Apple Silicon. No es un modelo nuevo: es una reingeniería de la inferencia que trocea el grafo de Kokoro en etapas y asigna cada una al motor más adecuado del chip (Neural Engine, GPU o CPU), incluyendo un vocoder que el ANE rechazaba tal cual y que se hace compilar mediante un `reshape` que no altera su matemática. El resultado se distribuye como pesos Core ML más un SDK en Swift, sin Python, sin servidor y sin claves de API.

La propuesta de valor es el rendimiento en dispositivo: según las mediciones del autor del 23 de octubre de 2026, el pipeline es entre 3,5 y 4,8 veces más rápido que MLX en un M2 Ultra, entre 8,1 y 9,8 veces en un M1 Mini y hasta 15,1 veces en un iPhone 15 Pro Max, consumiendo además entre 1,9 y 4,8 veces menos memoria. En el clip de referencia de 27,4 segundos, todos los dispositivos probados sintetizan al menos 57 veces más rápido que tiempo real (159 ms en M2 Ultra, 319 ms en iPhone 15 Pro Max).

Es relevante ahora porque cubre el nicho de TTS neuronal de baja latencia, totalmente offline y con huella de memoria de cientos de megabytes, ejecutable en hardware de consumo Apple y en móviles. El modelo base conserva su licencia Apache 2.0, lo que facilita el uso comercial, y el pipeline mantiene la salida a 24 kHz del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Síntesis de voz neuronal basada en hexgrad/Kokoro-82M, segmentada en etapas Core ML (predictor de duración con frontal BERT, predictor de F0, generador y vocoder); el detalle interno no está documentado en la información disponible |
| Parametros totales | 82 M (heredados de hexgrad/Kokoro-82M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de tokens; la entrada medida en las pruebas es de hasta 27,4 s de audio (clip de 30 s) |
| Tipos de cuantizacion | No disponible. El tag `base_model:quantized` indica que se parte de pesos cuantizados del modelo base; la precisión exacta (FP16/INT8) no se detalla |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage` / `.mlmodelc`) con SDK en Swift; repositorio de 3,2 GB |
| Frecuencia de muestreo de salida | 24 kHz |
| Librería / runtime | `coreml`, requiere Apple Silicon |
| Entrada | IDs de fonemas generados por Misaki G2P en Swift |
| Descargas / likes | 3.541 descargas, 10 likes (a fecha de actualización del 24 de octubre de 2026) |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un TTS neuronal de 82 millones de parámetros. Esta ficha no aporta detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la model card de `hexgrad/Kokoro-82M`, no en este repositorio. Tampoco se documenta ninguna modificación de los pesos: el autor es explícito en que el trabajo consiste en «rediseñar el pipeline de inferencia, no el modelo».

La innovación está, por tanto, en la orquestación. El pipeline se corta por sus costuras: G2P (Misaki, en Swift) produce IDs de fonemas; el predictor de duración reparte su cómputo con el frontal BERT en el Neural Engine y la parte LSTM en la CPU; la alineación expande tokens a frames en Swift; el predictor de F0 y ruido usa frontal en CPU y cola en ANE; y el vocoder se reescribe para que compile en el ANE. El motivo original del rechazo era una dimensión de 720.000 muestras frente al límite de 16.384 del Neural Engine; un `reshape` que preserva el resultado matemático resuelve la compilación. Adicionalmente existe un generador híbrido (usado a partir de 7 s), que prioriza velocidad a costa de memoria, y un generador totalmente ANE, activable con `KOKORO_HYBRID_GENERATOR=0`, que reduce el pico de memoria a costa de 2,5-3,2 veces más tiempo.

## Capacidades

- Síntesis de voz texto-a-habla en inglés con salida de audio PCM a 24 kHz.
- Ejecución 100 % en dispositivo: no requiere Python, servidor, red ni clave de API.
- Aprovechamiento simultáneo de los tres motores de Apple Silicon (Neural Engine, GPU y CPU) mediante segmentación del grafo.
- Conversión de texto a fonemas integrada mediante Misaki G2P portado a Swift.
- Generación de clips largos: probado hasta 27,4 s de audio de salida en una sola síntesis, con memoria acotada.
- Dos modos de generador intercambiables por variable de entorno: híbrido (rápido, más memoria) y todo-ANE (más lento, menos memoria).
- SDK en Swift para integración directa en apps de macOS e iOS.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada; es exclusivamente un modelo TTS.
- Multilingüismo: limitado a inglés; no se declaran otros idiomas.

## Casos de uso

- Audiolibros y lectura por voz offline en apps de macOS/iOS: con 82 M de parámetros y síntesis a más de 57 veces tiempo real, un capítulo de 30 s de audio se genera en 159 ms en un M2 Ultra, lo que permite precargar capítulos completos al instante sin conexión.
- Accesibilidad y lectores de pantalla: la latencia de 62-98 ms para clips de 3 s en iPhone permite retroalimentación de voz casi inmediata en VoiceOver o apps de lectura, con la ventaja de que nada sale del dispositivo.
- Asistentes de voz y navegación GPS embebidos: al no depender de red, funciona en modo avión o con cobertura nula, y el estado térmico `nominal` sostenido tras 14 síntesis consecutivas en iPhone 15 Pro Max y iPhone 12 Pro evita el estrangulamiento típico de otros runtimes.
- Pre-generación de locuciones para IVR y telefonía: el pipeline puede renderizar por lotes avisos y prompts en un Mac mini M1 (309 ms para 27,4 s de audio) y distribuir los WAV resultantes, eliminando el coste de TTS en la nube.
- Videojuegos y experiencias interactivas en Apple Vision Pro, iPad o iPhone: 255 MB de pico en un clip de 3 s en iPhone 15 Pro Max deja margen para diálogos dinámicos de NPC sin competir por memoria con el motor gráfico.
- Prototipado e investigación en TTS: al ser Apache 2.0 y estar implementado en Swift sobre Core ML, sirve como base para experimentar con vocoders en ANE, latencias en dispositivo y comparativas frente a MLX, con código y datos crudos publicados.
- Aplicaciones con requisitos de privacidad (sanidad, legal, banca): la síntesis ocurre íntegramente en el dispositivo, sin enviar texto del usuario a ningún servicio externo.
- Integración en apps de notas y correo con lectura en voz alta: el SDK Swift permite sintetizar párrafos sueltos de 7-15 s en 103-224 ms en iPhone 15 Pro Max, adecuado para lectura bajo demanda sin bloqueos perceptibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz (MOS, WER, similitud de hablante) en la información disponible. Los datos publicados son de latencia y memoria, medidos el 23 de octubre de 2026 sobre el pipeline distribuido y frente a MLX en el mismo dispositivo y sesión, con IDs de tokens como entrada y audio a 24 kHz como salida (mediana en caliente, extremo a extremo):

| Audio de salida | M2 Ultra | M1 Mini | iPhone 15 Pro Max | iPhone 12 Pro |
|---|---:|---:|---:|---:|
| 3 s | 74 ms | 95 ms | 62 ms | 98 ms |
| 7 s | 54 ms | 99 ms | 103 ms | 145 ms |
| 10 s | 71 ms | 124 ms | 156 ms | 186 ms |
| 15 s | 89 ms | 169 ms | 224 ms | 261 ms |
| 30 s (27,4 s de entrada) | 159 ms | 309 ms | 319 ms | 480 ms |
| Mejora frente a MLX | 3,5-4,8x | 8,1-9,8x | 8,9-15,1x | 9,3-15,2x (MLX agota memoria a 30 s) |

Memoria pico por síntesis, misma ejecución e idénticas entradas:

| Audio de salida | M2 Ultra | M1 Mini | iPhone 15 Pro Max | iPhone 12 Pro |
|---|---:|---:|---:|---:|
| 3 s | 144 MB | 134 MB | 255 MB | 61 MB |
| 7 s | 235 MB | 177 MB | 551 MB | 282 MB |
| 10 s | 263 MB | 199 MB | 655 MB | 349 MB |
| 15 s | 275 MB | 247 MB | 869 MB | 500 MB |
| 30 s (27,4 s de entrada) | 434 MB | 375 MB | 1.338 MB | 831 MB |
| Mejora frente a MLX | 1,9-3,3x menos | 2,1-4,4x menos | 2,4-4,8x menos | 4,9-19x menos |

Estado térmico de iOS al final de 14 síntesis consecutivas del mismo clip (todos los runs empezaron en `nominal`):

| Audio | iPhone 15 Pro Max | MLX | iPhone 12 Pro | MLX |
|---|---|---|---|---|
| 3 s | nominal | nominal | nominal | nominal |
| 7 s | nominal | nominal | nominal | nominal |
| 10 s | nominal | fair | nominal | nominal |
| 15 s | nominal | fair | nominal | nominal |
| 30 s | nominal | serious (throttled) | nominal | killed (sin memoria) |

Comparativa de referencia frente a MLX en iPhone 15 Pro Max con clip de 30 s: 319 ms con este pipeline frente a aproximadamente 4.800 ms con MLX (4.806 y 4.797 ms en dos pasadas). En Mac, MLX consume 815 MB (M2 Ultra) y 801 MB (M1 Mini) frente a 434 MB y 375 MB respectivamente.

Advertencias del propio autor sobre las cifras: las filas de Mac son cotas superiores porque ningún Mac superó el umbral de host silencioso (carga de fondo de 2-7); las ratios de A17 a partir de 10 s también son cotas superiores porque MLX alcanzó temperatura alta en ese teléfono; las cifras de iPhone corresponden a carga sostenida y una petición única tras inactividad es más lenta; y los clips de 3 s en M2 Ultra han empeorado (74 ms frente a 64 ms en la ejecución de octubre con carga similar, 45 ms en la pasada silenciosa) porque usan el generador todo-ANE, más lento que el antiguo generador en GPU.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. Probado en M2 Ultra, Mac mini M1, iPhone 15 Pro Max (A17 Pro) y iPhone 12 Pro (A14). No hay soporte CUDA, ROCm ni x86.
- Memoria: no se usa VRAM dedicada sino memoria unificada. Pico medido de 144-434 MB en Mac según longitud del clip y de 255-1.338 MB en iPhone 15 Pro Max. Con el generador todo-ANE (`KOKORO_HYBRID_GENERATOR=0`) el pico a 30 s baja a 780 MB en iPhone 15 Pro Max y 284 MB en iPhone 12 Pro, a cambio de 2,5-3,2 veces más tiempo.
- GPU recomendadas: no aplica en el sentido habitual; el pipeline privilegia el Neural Engine. Cualquier SoC de la familia M o A14 en adelante es candidato razonable según los dispositivos medidos.
- Cabe en hardware de consumo: sí, en Mac mini M1 (309 ms para 27,4 s de audio, 375 MB de pico) y en iPhone 12 Pro (480 ms, 831 MB de pico). No se han publicado pruebas en Apple Watch, Apple TV ni Vision Pro.
- Despliegue: Core ML con el SDK Swift del repositorio. No requiere vLLM, llama.cpp, Ollama ni TGI; tampoco existe una ruta Python oficial en este repositorio.
- Throughput: todos los dispositivos probados superan 57 veces tiempo real en el clip de 27,4 s.
- Latencia: ver tabla de benchmarks. Los clips cortos en iPhone (62-98 ms para 3 s) son los de menor latencia absoluta; en Mac, los clips de 7 s son los más rápidos en términos absolutos (54 ms en M2 Ultra).
- Almacenamiento: repositorio de 3,2 GB, a tener en cuenta para empaquetado en apps móviles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (30 s, iPhone 15 Pro Max) | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mattmireles/kokoro-coreml | 82 M | Hasta 27,4 s de audio medido; entrada por fonemas | 319 ms | 1.338 MB | Apache 2.0 | HuggingFace + GitHub, SDK Swift |
| MLX (mlx-audio 0.4.3 / kokoro-ios 1.0.8) sobre Kokoro | 82 M | Mismo modelo, mismo texto | ~4.800 ms; falla en entradas de 3 s con mlx-audio 0.4.3 y agota memoria a 30 s en iPhone 12 Pro | 815 MB en M2 Ultra; 801 MB en M1 Mini | Depende del proyecto (no indicada) | GitHub |
| hexgrad/Kokoro-82M (original) | 82 M | No disponible | No medido en esta comparativa | No disponible | Apache 2.0 (heredada) | HuggingFace |
| Kokoro ejecutado en servidor con GPU | 82 M | No disponible | No disponible | No disponible | Apache 2.0 | No disponible |

La comparación relevante es contra MLX, el único runtime alternativo medido en el mismo dispositivo y sesión. Frente a él, este pipeline es 8,9-15,1 veces más rápido y usa 2,4-4,8 veces menos memoria en iPhone 15 Pro Max, además de mantenerse en estado térmico `nominal` donde MLX entra en `serious`. No se dispone de datos comparativos frente a otros TTS como Piper, XTTS o modelos comerciales en la nube.

## Limitaciones y advertencias

- Idioma único: solo inglés (`en`). No hay soporte declarado de castellano ni de otros idiomas, lo que descarta su uso directo en producto en España sin un modelo base distinto.
- Plataforma cerrada: depende de Core ML y de Apple Silicon. No es desplegable en Linux, Windows, Android ni en GPUs NVIDIA o AMD.
- Sin API Python: la integración exige el SDK Swift del repositorio; los equipos con stacks Python deben construir su propio puente.
- Riesgo de alucinación en el sentido de prosodia y pronunciación: no hay métricas de calidad publicadas (MOS, WER, tasa de errores de pronunciación) en la información disponible, por lo que la calidad de voz debe evaluarse empíricamente antes de producción.
- Sesgos: no se documenta ningún análisis de sesgo acústico, de género, de acento o dialectal en la información proporcionada.
- Cifras de rendimiento con salvedades explícitas del autor: cotas superiores en Mac por carga de fondo del host (2-7), cotas superiores en ratios de A17 a partir de 10 s por temperatura de MLX, y regresión conocida en clips de 3 s en M2 Ultra.
- Memoria en móvil: el generador híbrido, activo desde 7 s, puede llegar a 1.338 MB de pico en iPhone 15 Pro Max, lo que puede provocar terminaciones por memoria en apps ya cargadas; se recomienda el modo todo-ANE en esos casos.
- Comportamiento térmico: las cifras de iPhone son de carga sostenida; una petición aislada tras inactividad es más lenta, por lo que las latencias de primera llamada no están garantizadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `hexgrad/Kokoro-82M` y de las dependencias (Misaki G2P, mlx-audio, kokoro-ios) por separado.
- Madurez: 10 likes y 3.541 descargas, con un único autor; no hay evidencia de mantenimiento a largo plazo ni de auditoría independiente de las cifras publicadas.
- Las mediciones están fechadas en octubre de 2026 sobre hardware y versiones concretas de iOS y macOS; no se especifican en la información disponible las versiones de sistema operativo ni de Core ML utilizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattmireles/kokoro-coreml
- Repositorio con código fuente, SDK Swift y benchmarks: https://github.com/mattmireles/kokoro-coreml
- Paper técnico (PDF): https://github.com/mattmireles/kokoro-coreml/blob/main/paper/main.pdf
- Protocolo completo, celdas con rangos mínimo-máximo, ablación y datos crudos: https://github.com/mattmireles/kokoro-coreml/blob/main/README/Notes/paper-cs1-hybrid-rerun-2026-10-23.md
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Runtime de comparación en Mac: https://github.com/Blaizzy/mlx-audio
- Runtime de comparación en iPhone: https://github.com/mlalma/kokoro-ios
- Documentación de `ProcessInfo.thermalState` en Apple: https://developer.apple.com/documentation/foundation/processinfo/thermalstate

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces anteriores proceden de la model card y de la información de HuggingFace.
