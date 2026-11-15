# snazzybucket/kokoro-coreml

## Resumen

Kokoro-coreml es una implementación optimizada de Kokoro-82M, un modelo de síntesis de voz (text-to-speech) de 82 millones de parámetros, convertido a Core ML para ejecutarse íntegramente en Apple Silicon (Neural Engine, GPU y CPU). El trabajo original corresponde a mattmireles; este repositorio es un espejo sin modificaciones creado por snazzybucket para que la aplicación SnazzyRSS pueda descargar los ficheros desde una dirección fija. El modelo base es hexgrad/Kokoro-82M, con licencia Apache 2.0.

La relevancia técnica del proyecto no reside en el modelo en sí, sino en la rediseño del pipeline de inferencia: el modelo se fragmenta en etapas y cada una se ejecuta en el componente del chip que mejor le conviene, incluyendo un vocoder que el Neural Engine rechazaba tal cual y que se hace compatible mediante un reshape que no altera su matemática. El resultado es una inferencia completamente local, sin Python, sin servidor y sin claves de API.

Según los datos publicados por el autor, el pipeline es entre 8,9 y 15,1 veces más rápido que MLX en iPhone 15 Pro Max y consume entre un 58 % y un 79 % menos de memoria en ese mismo dispositivo. En el iPhone 12 Pro, MLX agota la memoria con entradas de 30 segundos, mientras que esta implementación las completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de voz (Kokoro-82M) convertida a Core ML, con pipeline fragmentado en etapas sobre Neural Engine, GPU y CPU |
| Parámetros totales | 82 millones (modelo base Kokoro-82M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto; se han medido síntesis de hasta 27,4 s de audio) |
| Tipos de cuantización | no disponible en la información proporcionada (el tag del repo indica `base_model:quantized:hexgrad/Kokoro-82M`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage`/`.mlmodelc`); tamaño del repo 1,9 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, una red de síntesis de voz de 82 millones de parámetros. La información disponible no detalla la arquitectura interna del modelo base ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que estos datos se consideran no disponibles.

La innovación técnica documentada se sitúa en la inferencia, no en el entrenamiento. El pipeline se corta "por las costuras" del modelo en etapas independientes y cada etapa se asigna al motor de cómputo más adecuado del SoC de Apple. Destaca el tratamiento del vocoder: el Neural Engine lo rechaza en su forma exportada, y se consigue que lo acepte mediante una operación de reshape que deja la matemática intacta. El autor distingue entre un generador híbrido (usado a partir de 7 s, más rápido pero con mayor consumo de memoria) y un generador completamente en ANE (seleccionable con `KOKORO_HYBRID_GENERATOR=0`, más lento pero con menor huella de memoria). La salida de audio es a 24 kHz y la entrada son token IDs.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de token IDs, con salida de audio a 24 kHz.
- Inferencia completamente local en dispositivos Apple Silicon, sin Python, sin servidor y sin clave de API.
- Ejecución distribuida entre Neural Engine, GPU y CPU dentro del mismo pipeline.
- Dos modos de generador seleccionables: híbrido (prioriza velocidad) y todo-ANE (prioriza memoria).
- Integración mediante SDK de Swift y librería Core ML.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura de artículos en lectores de RSS: SnazzyRSS descarga este modelo desde una dirección fija para convertir el texto de las entradas en audio sin depender de servicios en la nube, gracias a la inferencia local y a la licencia Apache 2.0.
- Síntesis de voz en aplicaciones iOS sin conectividad: el pipeline funciona íntegramente en el dispositivo, por lo que es adecuado para apps que deben operar en modo avión o con datos móviles restringidos.
- Generación de audio para accesibilidad: conversión de texto a voz para lectores de pantalla o contenido accesible en iPhone y Mac, con latencias de 62 a 319 ms en clips de 3 a 30 s según dispositivo.
- Procesamiento por lotes en Mac de escritorio: en M2 Ultra, un clip de 27,4 s se sintetiza en 159 ms con un pico de 434 MB, lo que permite generar grandes volúmenes de audio en local sin GPU dedicada.
- Integración en pipelines de CI o herramientas de desarrollo: el SDK de Swift y la librería Core ML permiten incorporar la síntesis a utilidades de macOS para generar avisos hablados o narraciones de resultados.
- Prototipado de interfaces conversacionales en Apple Silicon: al no requerir servidor ni API, sirve para experimentar con respuestas habladas en apps de demostración y pruebas de concepto en iPhone y Mac.
- Síntesis sostenida en dispositivos móviles: en pruebas de 14 síntesis consecutivas, el estado térmico de iOS se mantuvo en `nominal` en iPhone 15 Pro Max e iPhone 12 Pro, a diferencia de MLX, que llegó a `serious` (throttling) en el clip de 30 s.

## Benchmarks y rendimiento

Tiempos de extremo a extremo en mediana en caliente (token IDs de entrada, audio de 24 kHz de salida), medidos el 23 de octubre de 2026:

| Audio | M2 Ultra | M1 Mini | iPhone 15 Pro Max | iPhone 12 Pro |
|---|---:|---:|---:|---:|
| 3 s | 74 ms | 95 ms | 62 ms | 98 ms |
| 7 s | 54 ms | 99 ms | 103 ms | 145 ms |
| 10 s | 71 ms | 124 ms | 156 ms | 186 ms |
| 15 s | 89 ms | 169 ms | 224 ms | 261 ms |
| 30 s (27,4 s de entrada) | 159 ms | 309 ms | 319 ms | 480 ms |
| vs MLX | 3,5-4,8x | 8,1-9,8x | 8,9-15,1x | 9,3-15,2x; MLX agota memoria a 30 s |

Memoria pico para una síntesis, misma ejecución e inputs:

| Audio | M2 Ultra | M1 Mini | iPhone 15 Pro Max | iPhone 12 Pro |
|---|---:|---:|---:|---:|
| 3 s | 144 MB | 134 MB | 255 MB | 61 MB |
| 7 s | 235 MB | 177 MB | 551 MB | 282 MB |
| 10 s | 263 MB | 199 MB | 655 MB | 349 MB |
| 15 s | 275 MB | 247 MB | 869 MB | 500 MB |
| 30 s (27,4 s de entrada) | 434 MB | 375 MB | 1.338 MB | 831 MB |
| vs MLX | 47-70 % menos | 53-77 % menos | 58-79 % menos | 80-95 % menos; MLX agota memoria a 30 s |

Estado térmico de iOS al final de 14 síntesis consecutivas del mismo clip:

| Audio | iPhone 15 Pro Max | MLX | iPhone 12 Pro | MLX |
|---|---|---|---|---|
| 3 s | nominal | nominal | nominal | nominal |
| 7 s | nominal | nominal | nominal | nominal |
| 10 s | nominal | fair | nominal | nominal |
| 15 s | nominal | fair | nominal | nominal |
| 30 s | nominal | serious (throttled) | nominal | killed (sin memoria) |

Advertencias del autor sobre las mediciones: las filas de Mac son cotas superiores porque ningún Mac alcanzó la condición de host silencioso (carga de fondo entre 2 y 7); las ratios de A17 a partir de 10 s son cotas superiores porque MLX se calentó en ese teléfono; los números de iPhone corresponden a carga sostenida y una petición aislada tras inactividad es más lenta; los clips de 3 s en M2 Ultra empeoraron respecto a la ejecución de octubre (74 ms frente a 64 ms en condiciones similares, 45 ms en su pasada silenciosa) por usar el generador todo-ANE. Comparativas: MLX es mlx-audio 0.4.3 en Mac y kokoro-ios 1.0.8 en iPhone; la versión fijada de mlx-audio falla en todas las entradas de 3 s.

## Requisitos de hardware

- VRAM/memoria: no aplica VRAM dedicada; el modelo corre en memoria unificada de Apple Silicon. Pico medido de 434 MB en M2 Ultra, 375 MB en M1 Mini, 1.338 MB en iPhone 15 Pro Max y 831 MB en iPhone 12 Pro para un clip de 27,4 s.
- GPU/SoC recomendados: Apple M2 Ultra (159 ms a 30 s), M1 Mini (309 ms), iPhone 15 Pro Max (319 ms), iPhone 12 Pro (480 ms).
- Cabe en hardware de consumo: sí, en iPhone 12 Pro y posteriores y en Mac con Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: Core ML con SDK de Swift; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: todos los dispositivos medidos ejecutan al menos 57 veces más rápido que tiempo real con la entrada de 27,4 s; en iPhone 15 Pro Max, 319 ms para 27,4 s de audio.
- Ajuste de memoria: `KOKORO_HYBRID_GENERATOR=0` activa el generador todo-ANE, que a 30 s pico 780 MB en iPhone 15 Pro Max y 284 MB en iPhone 12 Pro, a costa de 2,5-3,2 veces más tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kokoro-coreml (este) | 82 M | no disponible | 319 ms / 27,4 s en iPhone 15 Pro Max; 1.338 MB pico | Apache 2.0 | Core ML, espejo en Hugging Face, SDK Swift en GitHub |
| Kokoro-82M + MLX (mlx-audio 0.4.3 / kokoro-ios 1.0.8) | 82 M | no disponible | 8,9-15,1x más lento en iPhone 15 Pro Max; 58-79 % más memoria; falla o agota memoria a 30 s | Apache 2.0 (modelo base) | MLX en Mac, kokoro-ios en iPhone |
| Kokoro-82M original (hexgrad) | 82 M | no disponible | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, PyTorch |

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se documentan otros idiomas.
- Es un espejo sin modificaciones de mattmireles/kokoro-coreml; para la versión actual, código fuente, SDK y benchmarks hay que acudir al repositorio original.
- La información disponible no detalla sesgos del modelo base, riesgo de alucinación ni limitaciones de contexto; no disponibles.
- El generador híbrido, usado a partir de 7 s, compra velocidad a cambio de memoria; en iPhone 15 Pro Max el pico sube a 1.338 MB a 30 s frente a 780 MB con el generador todo-ANE.
- Las cifras de Mac son cotas superiores por carga de fondo del host; las de A17 a partir de 10 s también son cotas superiores por calentamiento de MLX.
- Los números de iPhone corresponden a carga sostenida; una petición aislada tras inactividad es más lenta.
- Los clips de 3 s en M2 Ultra empeoran con el generador todo-ANE (74 ms frente a 45-64 ms en ejecuciones anteriores).
- Licencia Apache 2.0, que permite uso comercial; conviene verificar los términos del modelo base hexgrad/Kokoro-82M y del repositorio original antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de distribución para una app concreta, no un proyecto con comunidad activa.

## Enlaces

- Hugging Face: https://huggingface.co/snazzybucket/kokoro-coreml
- Repositorio original en Hugging Face: https://huggingface.co/mattmireles/kokoro-coreml
- Código fuente, SDK Swift y benchmarks: https://github.com/mattmireles/kokoro-coreml
- Paper: https://github.com/mattmireles/kokoro-coreml/blob/main/paper/main.pdf
- Protocolo y datos en bruto: https://github.com/mattmireles/kokoro-coreml/blob/main/README/Notes/paper-cs1-hybrid-rerun-2026-10-23.md
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- mlx-audio: https://github.com/Blaizzy/mlx-audio
- kokoro-ios: https://github.com/mlalma/kokoro-ios
- SnazzyRSS en App Store: https://apps.apple.com/app/id6781206679
- Documentación de `ProcessInfo.thermalState`: https://developer.apple.com/documentation/foundation/processinfo/thermalstate
